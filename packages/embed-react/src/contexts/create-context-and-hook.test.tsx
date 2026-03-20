import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import {
  assertContextExists,
  createContextAndHook,
} from "./create-context-and-hook";

describe("assertContextExists", () => {
  it("does not throw when value is truthy", () => {
    expect(() => assertContextExists({}, "test")).not.toThrow();
  });

  it("throws with string message when value is falsy", () => {
    expect(() => assertContextExists(null, "MyContext not found")).toThrow(
      "MyContext not found",
    );
  });

  it("throws with displayName when passed a context object", () => {
    const ctx = React.createContext(undefined);
    ctx.displayName = "TestContext";
    expect(() => assertContextExists(null, ctx)).toThrow(
      "TestContext not found",
    );
  });
});

describe("createContextAndHook", () => {
  it("creates a context with the correct displayName", () => {
    const [Ctx] = createContextAndHook<{ value: string }>("TestContext");
    expect(Ctx.displayName).toBe("TestContext");
  });

  describe("guaranteed hook (useCtx)", () => {
    it("returns the context value with contextLoaded: true when inside provider", () => {
      const [Ctx, useCtx] = createContextAndHook<{ name: string }>(
        "TestContext",
      );

      function Wrapper({ children }: { children: React.ReactNode }) {
        return (
          <Ctx.Provider value={{ value: { name: "test" } }}>
            {children}
          </Ctx.Provider>
        );
      }

      const { result } = renderHook(() => useCtx(), { wrapper: Wrapper });
      expect(result.current.name).toBe("test");
      expect(result.current.contextLoaded).toBe(true);
    });

    it("throws when used outside provider", () => {
      const [, useCtx] = createContextAndHook<{ name: string }>("TestContext");

      expect(() => renderHook(() => useCtx())).toThrow("TestContext not found");
    });
  });

  describe("non-guaranteed hook (useCtxWithoutGuarantee)", () => {
    it("returns [true, value] when inside provider", () => {
      const [Ctx, , useCtxWithout] = createContextAndHook<{ name: string }>(
        "TestContext",
      );

      function Wrapper({ children }: { children: React.ReactNode }) {
        return (
          <Ctx.Provider value={{ value: { name: "test" } }}>
            {children}
          </Ctx.Provider>
        );
      }

      const { result } = renderHook(() => useCtxWithout(), { wrapper: Wrapper });
      expect(result.current[0]).toBe(true);
      expect(result.current[1]).toEqual({ name: "test" });
    });

    it("returns [false, null] when outside provider", () => {
      const [, , useCtxWithout] = createContextAndHook<{ name: string }>(
        "TestContext",
      );

      const { result } = renderHook(() => useCtxWithout());
      expect(result.current[0]).toBe(false);
      expect(result.current[1]).toBeNull();
    });
  });
});
