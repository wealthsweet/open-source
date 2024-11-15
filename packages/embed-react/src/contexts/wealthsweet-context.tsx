import type { PropsWithChildren } from "react";
import { OriginContext, OriginProviderProps } from "./origin-context";
import { TokenProvider, TokenProviderProps } from "./token-context";

/**
 * Props for the WealthSweetProvider component that combines OriginProvider and TokenProvider props
 */
export type WealthSweetProviderProps = OriginProviderProps & TokenProviderProps;

/**
 * Provider component that combines OriginProvider and TokenProvider functionality.
 * This is the main provider that should wrap your application to enable WealthSweet features.
 *
 * @param props - The component props
 * @param props.children - Child components that will have access to both origin and token contexts
 * @param props.origin - The origin value to provide through context
 * @param props.fetchToken - Function that returns a Promise resolving to a new WealthSweetToken
 * @param props.onFetchTokenError - Optional callback that will be called if token fetching fails
 */
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
