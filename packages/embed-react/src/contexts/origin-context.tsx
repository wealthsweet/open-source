import type { PropsWithChildren } from "react";
import { WealthSweetElementOrigin } from "src/lib";
import { createContextAndHook } from "./create-context-and-hook";

export const [
  OriginContext,
  useOriginContext,
  useOriginContextWithoutGuarantee,
] = createContextAndHook<{ origin?: WealthSweetElementOrigin }>(
  "OriginContext",
);

export type OriginProviderProps = {
  origin?: WealthSweetElementOrigin;
};

export function OriginProvider({
  children,
  origin,
}: PropsWithChildren<OriginProviderProps>) {
  return (
    <OriginContext.Provider value={{ value: { origin } }}>
      {children}
    </OriginContext.Provider>
  );
}
