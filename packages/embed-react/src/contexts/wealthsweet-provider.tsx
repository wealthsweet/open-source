import type { PropsWithChildren } from "react";
import { WealthSweetElementOrigin } from "src/lib";
import { createContextAndHook } from "./create-context-and-hook";
import { TokenProvider, TokenProviderProps } from "./token-context";

export const [
  WealthSweetContext,
  useWealthSweetContext,
  useWealthSweetContextWithoutGuarantee,
] = createContextAndHook<{ origin?: WealthSweetElementOrigin }>(
  "WealthSweetContext",
);

export type WealthSweetProviderProps = {
  origin?: WealthSweetElementOrigin;
} & TokenProviderProps;

export function WealthSweetProvider({
  children,
  origin,
  fetchToken,
  onFetchTokenError,
}: PropsWithChildren<WealthSweetProviderProps>) {
  return (
    <WealthSweetContext.Provider value={{ value: { origin } }}>
      <TokenProvider
        fetchToken={fetchToken}
        onFetchTokenError={onFetchTokenError}
      >
        {children}
      </TokenProvider>
    </WealthSweetContext.Provider>
  );
}
