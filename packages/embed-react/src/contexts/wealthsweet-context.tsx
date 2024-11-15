import type { PropsWithChildren } from "react";
import { OriginContext, OriginProviderProps } from "./origin-context";
import { TokenProvider, TokenProviderProps } from "./token-context";

export type WealthSweetProviderProps = OriginProviderProps & TokenProviderProps;

export function WealthSweetProvider({
  children,
  origin,
  fetchToken,
  onFetchTokenError,
}: PropsWithChildren<WealthSweetProviderProps>) {
  return (
    <OriginContext.Provider value={{ value: { origin } }}>
      <TokenProvider
        fetchToken={fetchToken}
        onFetchTokenError={onFetchTokenError}
      >
        {children}
      </TokenProvider>
    </OriginContext.Provider>
  );
}
