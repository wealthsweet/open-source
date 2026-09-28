import { describe, expect, it } from "vitest";
import { errorResponse } from "./utils";

describe("errorResponse", () => {
  it("parses a valid error response", () => {
    const result = errorResponse.safeParse({
      message: "Something went wrong",
      error: "INTERNAL_ERROR",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing message", () => {
    const result = errorResponse.safeParse({ error: "INTERNAL_ERROR" });
    expect(result.success).toBe(false);
  });

  it("accepts a missing error", () => {
    const result = errorResponse.safeParse({ message: "Something went wrong" });
    expect(result.success).toBe(true);
  });

  it("accepts field validation errors", () => {
    const result = errorResponse.safeParse({
      message: "The request body was invalid",
      error: { session: ["Invalid input: expected string, received undefined"] },
    });
    expect(result.success).toBe(true);
  });
});
