/**
 * Grabbed from the clerk repo here (MIT LICENSE)
 * https://github.com/clerk/javascript/blob/main/packages/shared/src/react/hooks/createContextAndHook.ts
 */

import { createContext, useContext, type Context } from "react";

export function assertContextExists<T>(
  contextVal: unknown,
  msgOrCtx: string | Context<T>,
): asserts contextVal {
  if (!contextVal) {
    throw typeof msgOrCtx === "string"
      ? new Error(msgOrCtx)
      : new Error(`${msgOrCtx.displayName} not found`);
  }
}

type Options = { assertCtxFn?: (v: unknown, msg: string) => void };
type ContextOf<T> = Context<{ value: T } | undefined>;
type UseCtxFn<T> = () => T;

/**
 * Creates and returns a Context and two hooks that return the context value.
 * The Context type is derived from the type passed in by the user.
 * The first hook returned guarantees that the context exists so the returned value is always CtxValue
 * The second hook makes no guarantees, so the returned value can be CtxValue | undefined
 */
export const createContextAndHook = <CtxVal>(
  displayName: string,
  options?: Options,
): [
  ContextOf<CtxVal>,
  UseCtxFn<CtxVal & { contextLoaded: true }>,
  UseCtxFn<[true, CtxVal] | [false, null]>,
] => {
  const { assertCtxFn = assertContextExists } = options ?? {};
  const Ctx = createContext<{ value: CtxVal } | undefined>(undefined);
  Ctx.displayName = displayName;

  const useCtx = () => {
    const ctx = useContext(Ctx);
    assertCtxFn(ctx, `${displayName} not found`);
    return { ...(ctx?.value as CtxVal), contextLoaded: true as const };
  };

  const useCtxWithoutGuarantee = () => {
    const ctx = useContext(Ctx);
    if (ctx) {
      return [true, ctx.value] as [true, CtxVal];
    } else {
      return [false, null] as [false, null];
    }
  };

  return [Ctx, useCtx, useCtxWithoutGuarantee];
};
