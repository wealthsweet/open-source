import type { PropsWithChildren } from "react";
import { WealthSweetElementOrigin } from "src/lib";
import { createContextAndHook } from "./create-context-and-hook";

/**
 * Context and hooks for managing the origin of WealthSweet elements
 */
export const [
  OriginContext,
  useOriginContext,
  useOriginContextWithoutGuarantee,
] = createContextAndHook<{ origin?: WealthSweetElementOrigin }>(
  "OriginContext",
);

/**
 * Props for the OriginProvider component
 */
export type OriginProviderProps = {
  /** The origin of WealthSweet elements */
  origin?: WealthSweetElementOrigin;
};

/**
 * Provider component for the OriginContext
 * @param props - The component props
 * @param props.children - Child components that will have access to the origin context
 * @param props.origin - The origin value to provide through context
 */
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
