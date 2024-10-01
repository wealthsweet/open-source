import {
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { type WealthSweetToken } from "../utils/token-utils";
import { createContextAndHook } from "./create-context-and-hook";

export const [TokenContext, useTokenContext, useTokenContextWithoutGuarantee] =
  createContextAndHook<Partial<WealthSweetToken>>("TokenContext");

const ONE_MINUTE = 1000 * 60;

export function TokenProvider({
  children,
  fetchToken,
}: PropsWithChildren<{ fetchToken: () => Promise<WealthSweetToken> }>) {
  const [token, setToken] = useState<WealthSweetToken>();

  const generateToken = useCallback(async () => {
    const token = await fetchToken();
    setToken(token);
    setTimeout(
      () => {
        generateToken().catch((err) => console.error(err));
      },
      token.expires - new Date().getTime() - ONE_MINUTE,
    ); // One minute before this token expires, fetch a new token
  }, [setToken, fetchToken]);

  useEffect(() => {
    generateToken().catch((err) => console.error(err));
  }, [generateToken]);

  return (
    <TokenContext.Provider
      value={{
        value: token ?? {},
      }}
    >
      {children}
    </TokenContext.Provider>
  );
}
