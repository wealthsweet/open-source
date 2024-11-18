import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { type WealthSweetToken } from "../utils/token-utils";
import { createContextAndHook } from "./create-context-and-hook";

/**
 * Represents an error that occurred during token generation.
 */
export type TokenError = {
  message: "Failed to generate token";
  error: unknown;
};

/**
 * Represents the current state of token fetching.
 */
export type TokenFetchState = "INITIALISED" | "FETCHING" | "FETCHED" | "ERROR";

/**
 * Creates a context and hooks for managing token state.
 */
export const [TokenContext, useTokenContext, useTokenContextWithoutGuarantee] =
  createContextAndHook<
    | {
        _tag: "success";
        tokenFetchState: TokenFetchState;
        token?: WealthSweetToken;
      }
    | { _tag: "error"; tokenFetchState: TokenFetchState; error: TokenError }
  >("TokenContext");

/**
 * Constant representing one minute in milliseconds.
 */
const ONE_MINUTE = 1000 * 60;

/**
 * Props for the TokenProvider component.
 */
export type TokenProviderProps = PropsWithChildren<{
  /** Function to fetch a new token */
  fetchToken: () => Promise<WealthSweetToken>;
  /** Optional callback for handling token fetch errors */
  onFetchTokenError?: (error: TokenError) => void;
}>;

let isFirstRender = true;

/**
 * Provider component for managing token state and fetching. Handles automatic token refresh
 * and error handling for token generation.
 * @param props - The component props
 * @param props.children - Child components that will have access to the token context
 * @param props.fetchToken - Function that returns a Promise resolving to a new WealthSweetToken
 * @param props.onFetchTokenError - Optional callback that will be called if token fetching fails
 */
export function TokenProvider({
  children,
  fetchToken,
  onFetchTokenError,
}: TokenProviderProps) {
  const [token, setToken] = useState<WealthSweetToken>();
  const [tokenFetchState, setTokenFetchState] =
    useState<TokenFetchState>("INITIALISED");
  const [error, setError] = useState<TokenError>();
  const tokenTimeout = useRef<number>();

  /**
   * Handles token fetch errors.
   * @param error - The error that occurred during token fetching
   */
  const handleTokenError = useCallback(
    (error: unknown) => {
      const tokenErrror = {
        message: "Failed to generate token",
        error,
      } as const;
      setError(tokenErrror);
      setTokenFetchState("ERROR");
      if (onFetchTokenError) {
        onFetchTokenError(tokenErrror);
      }
    },
    [setError, onFetchTokenError, setTokenFetchState],
  );

  /**
   * Generates a new token and schedules the next token generation.
   */
  const generateToken = useCallback(async () => {
    try {
      setTokenFetchState("FETCHING");
      const token = await fetchToken();
      setToken(token);
      setError(undefined);
      setTokenFetchState("FETCHED");
    } catch (e) {
      handleTokenError(e);
    }
  }, [setToken, fetchToken, setTokenFetchState, handleTokenError]);

  useEffect(() => {
    if (isFirstRender) {
      generateToken();
      isFirstRender = false;
    }

    if (tokenTimeout.current !== undefined) {
      clearTimeout(tokenTimeout.current);
    }

    if (token) {
      // One minute before this token expires, fetch a new token
      tokenTimeout.current = setTimeout(
        generateToken,
        token.expires - new Date().getTime() - ONE_MINUTE,
      );
    }

    return () => {
      if (tokenTimeout.current !== undefined) {
        clearTimeout(tokenTimeout.current);
      }
    };
  }, [generateToken, token]);

  return (
    <TokenContext.Provider
      value={{
        value: error
          ? { _tag: "error", tokenFetchState, error }
          : { _tag: "success", tokenFetchState, token },
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}
