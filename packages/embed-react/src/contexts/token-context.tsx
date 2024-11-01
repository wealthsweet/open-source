import {
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { type WealthSweetToken } from "../utils/token-utils";
import { createContextAndHook } from "./create-context-and-hook";

export type TokenError = {
  message: "Failed to fetch token";
  error: unknown;
};

export const [TokenContext, useTokenContext, useTokenContextWithoutGuarantee] =
  createContextAndHook<
    | {
        _tag: "success";
        token: Partial<WealthSweetToken>;
      }
    | { _tag: "error"; error: TokenError }
  >("TokenContext");

const ONE_MINUTE = 1000 * 60;

export type TokenProviderProps = PropsWithChildren<{
  fetchToken: () => Promise<WealthSweetToken>;
  onFetchTokenError: (error: TokenError) => void;
}>;

export function TokenProvider({
  children,
  fetchToken,
  onFetchTokenError,
}: TokenProviderProps) {
  const [token, setToken] = useState<WealthSweetToken>();
  const [error, setError] = useState<TokenError>();

  const handleTokenError = useCallback(
    (error: unknown) => {
      const tokenErrror = { message: "Failed to fetch token", error } as const;
      setError(tokenErrror);
      onFetchTokenError(tokenErrror);
    },
    [setError, onFetchTokenError],
  );

  const generateToken = useCallback(async () => {
    const token = await fetchToken();
    setToken(token);
    setTimeout(
      () => {
        generateToken().catch(handleTokenError);
      },
      token.expires - new Date().getTime() - ONE_MINUTE,
    ); // One minute before this token expires, fetch a new token
  }, [setToken, fetchToken]);

  useEffect(() => {
    generateToken().catch(handleTokenError);
  }, [generateToken]);

  return (
    <TokenContext.Provider
      value={{
        value: error
          ? { _tag: "error", error }
          : { _tag: "success", token: token! },
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}
