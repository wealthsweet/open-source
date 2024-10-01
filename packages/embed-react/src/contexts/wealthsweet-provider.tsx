import type { PropsWithChildren } from "react";
import type { WealthSweetToken } from "../utils/token-utils";
import { TokenProvider } from "./token-context";

export type WealthSweetProviderProps = {
  fetchToken: () => Promise<WealthSweetToken>;
};

export function WealthSweetProvider({
  children,
  fetchToken,
}: PropsWithChildren<WealthSweetProviderProps>) {
  return <TokenProvider fetchToken={fetchToken}>{children}</TokenProvider>;
}
