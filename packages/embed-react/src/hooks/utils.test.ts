import { describe, expect, it, vi } from "vitest";
import {
  buildContextParamsNotFoundError,
  chooseHookParamElseContextParam,
} from "./utils";

describe("buildContextParamsNotFoundError", () => {
  it("builds an error for a single param", () => {
    const error = buildContextParamsNotFoundError("usePerformanceUrl", [
      "token",
    ]);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain("usePerformanceUrl");
    expect(error.message).toContain("token parameter");
  });

  it("builds an error for multiple params", () => {
    const error = buildContextParamsNotFoundError("usePerformanceUrl", [
      "token",
      "origin",
    ]);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain("one of (token,origin) parameters");
  });
});

describe("chooseHookParamElseContextParam", () => {
  const error = new Error("test error");

  it("returns hookParam when provided", () => {
    const result = chooseHookParamElseContextParam(
      "hook-value",
      "ctx-value",
      true,
      error,
    );
    expect(result).toBe("hook-value");
  });

  it("returns contextParam when hookParam is undefined and context is loaded", () => {
    const result = chooseHookParamElseContextParam(
      undefined,
      "ctx-value",
      true,
      error,
    );
    expect(result).toBe("ctx-value");
  });

  it("throws when both hookParam and contextParam are undefined", () => {
    vi.spyOn(console, "error").mockImplementation(vi.fn());
    expect(() =>
      chooseHookParamElseContextParam(undefined, undefined, true, error),
    ).toThrow("test error");
  });

  it("throws when context is not loaded and hookParam is undefined", () => {
    vi.spyOn(console, "error").mockImplementation(vi.fn());
    expect(() =>
      chooseHookParamElseContextParam(undefined, "ctx-value", false, error),
    ).toThrow("test error");
  });

  it("prefers hookParam over contextParam even when both are available", () => {
    const result = chooseHookParamElseContextParam("hook", "ctx", true, error);
    expect(result).toBe("hook");
  });
});
