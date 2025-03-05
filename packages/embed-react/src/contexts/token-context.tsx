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
 * Represents the context value for the token context if the token was successfully fetched.
 */
type TokenContextSuccess = {
  _tag: "success";
  tokenFetchState: TokenFetchState;
  token?: WealthSweetToken;
  forceRefetch: () => void;
};

/**
 * Represents the context value for the token context if an error occurred.
 */
type TokenContextError = {
  _tag: "error";
  tokenFetchState: TokenFetchState;
  error: TokenError;
  forceRefetch: () => void;
};

/**
 * Creates a context and hooks for managing token state.
 */
export const [TokenContext, useTokenContext, useTokenContextWithoutGuarantee] =
  createContextAndHook<TokenContextSuccess | TokenContextError>("TokenContext");

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
  const [shouldForceRefetch, setShouldForceRefetch] = useState(false);
  const [error, setError] = useState<TokenError>();
  const tokenTimeout = useRef<number>();

  /**
   * Internally handles token fetch errors.
   * @param tokenError - The error that occurred during token fetching
   */
  const internallyHandleTokenFetchErrors = useCallback(
    (error: TokenError) => {
      setError(error);
      setTokenFetchState("ERROR");
      setToken(undefined);
    },
    [setError, setTokenFetchState, setToken],
  );

  /**
   * Builds a function that generates a new token and schedules the next token generation.
   * @param fetchToken - The async function that fetches a new token
   */
  const generateTokenBuilder = useCallback(
    async (fetchToken: () => Promise<WealthSweetToken>) => {
      setTokenFetchState("FETCHING");
      const token = await fetchToken();
      setToken(token);
      setError(undefined);
      setTokenFetchState("FETCHED");
      return token;
    },
    [setTokenFetchState, setToken, setError],
  );

  /**
   * Generates a new token and handles any errors that occur during token generation.
   * This function will be re-created if the fetchToken or onFetchTokenError function changes, and so possibly updates every render cycle.
   * As a result of this, be careful using this as a dependency in useEffect or useCallback hooks, as it may cause unnecessary re-renders.
   */
  const generateToken = useCallback(
    () =>
      generateTokenBuilder(fetchToken).catch((error) => {
        const tokenErrror = {
          message: "Failed to generate token",
          error,
        } as const;
        internallyHandleTokenFetchErrors(tokenErrror);
        if (onFetchTokenError) {
          onFetchTokenError(tokenErrror);
        }
      }),
    [
      generateTokenBuilder,
      internallyHandleTokenFetchErrors,
      fetchToken,
      onFetchTokenError,
    ],
  );

  /**
   * Sets the forceRefetchState to true, eventually triggering a token refetch.
   */
  const forceRefetch = useCallback(() => {
    setShouldForceRefetch(true);
  }, [setShouldForceRefetch]);

  /**
   * Listens for forceRefetchState state changes and triggers a token refetch if necessary.
   */
  useEffect(() => {
    if (shouldForceRefetch) {
      void generateToken();
      setShouldForceRefetch(false);
    }
  }, [shouldForceRefetch, setShouldForceRefetch]);

  /**
   * Manages token generation and refresh.
   * This will run once when the component mounts, and will run again if the generateToken function changes, potentially every render cycle.
   * Since this only does something when the token is not set, it should not cause unnecessary re-renders.
   * The token should always be set after the first render that the generateToken function succeeds.
   * If a subsequent render causes the generateToken function to fail, then the token is set to undefined and the state is reset to the inital state.
   * All other token updates are done through the forceRefetch function, or the tokenTimeout.
   */
  useEffect(() => {
    if (!token) {
      generateToken().then((token) => {
        if (token) {
          if (tokenTimeout.current !== undefined) {
            clearTimeout(tokenTimeout.current);
          }
          // One minute before this token expires, fetch a new token
          tokenTimeout.current = setTimeout(
            forceRefetch,
            token.expires - new Date().getTime() - ONE_MINUTE,
          );
        }
      });
    }

    return () => {
      if (tokenTimeout.current !== undefined) {
        clearTimeout(tokenTimeout.current);
      }
    };
  }, [generateToken]);

  return (
    <TokenContext.Provider
      value={{
        value: error
          ? { _tag: "error", tokenFetchState, error, forceRefetch }
          : { _tag: "success", tokenFetchState, token, forceRefetch },
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}
