import {
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { type WealthSweetToken } from "../utils/token-utils";
import { createContextAndHook } from "./create-context-and-hook";

export type TokenError = {
  message: "Failed to generate token";
  error: unknown;
};

export type TokenFetchState = "INITIALISED" | "FETCHING" | "FETCHED" | "ERROR";

export const [TokenContext, useTokenContext, useTokenContextWithoutGuarantee] =
  createContextAndHook<
    | {
        _tag: "success";
        tokenFetchState: TokenFetchState;
        token?: WealthSweetToken;
      }
    | { _tag: "error"; tokenFetchState: TokenFetchState; error: TokenError }
  >("TokenContext");

const ONE_MINUTE = 1000 * 60;

export type TokenProviderProps = PropsWithChildren<{
  fetchToken: () => Promise<WealthSweetToken>;
  onFetchTokenError?: (error: TokenError) => void;
}>;

export function TokenProvider({
  children,
  fetchToken,
  onFetchTokenError,
}: TokenProviderProps) {
  const [token, setToken] = useState<WealthSweetToken>();
  const [tokenFetchState, setTokenFetchState] =
    useState<TokenFetchState>("INITIALISED");
  const [error, setError] = useState<TokenError>();

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

  const generateToken = useCallback(async () => {
    try {
      setTokenFetchState("FETCHING");
      const token = await fetchToken();
      setToken(token);
      setError(undefined);
      setTokenFetchState("FETCHED");
      // One minute before this token expires, fetch a new token
      setTimeout(
        generateToken,
        token.expires - new Date().getTime() - ONE_MINUTE,
      );
    } catch (e) {
      handleTokenError(e);
    }
  }, [setToken, fetchToken, setTokenFetchState]);

  useEffect(() => {
    generateToken().catch(handleTokenError);
  }, [generateToken]);

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
