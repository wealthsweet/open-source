import { describe, expect, it } from "vitest";
import { buildSrcProperty, serialiseURLSearchParams } from "./url-utils";

describe("buildSrcProperty", () => {
  it("builds a URL with default https protocol", () => {
    const params = new URLSearchParams({ token: "abc" });
    const url = buildSrcProperty({
      host: "app.example.com",
      path: "embed/pages/performance",
      params,
    });
    expect(url).toBe(
      "https://app.example.com/embed/pages/performance?token=abc",
    );
  });

  it("uses http protocol when specified", () => {
    const params = new URLSearchParams({ token: "abc" });
    const url = buildSrcProperty({
      host: "localhost:3000",
      path: "embed/pages/performance",
      params,
      protocol: "http",
    });
    expect(url).toBe("http://localhost:3000/embed/pages/performance?token=abc");
  });

  it("handles multiple query params", () => {
    const params = new URLSearchParams({ token: "abc", from: "2020-01-01" });
    const url = buildSrcProperty({
      host: "app.example.com",
      path: "embed/pages/performance",
      params,
    });
    expect(url).toContain("token=abc");
    expect(url).toContain("from=2020-01-01");
  });
});

describe("serialiseURLSearchParams", () => {
  it("serialises simple string params", () => {
    const result = serialiseURLSearchParams({
      token: "abc",
      from: "2020-01-01",
    });
    expect(result.get("token")).toBe("abc");
    expect(result.get("from")).toBe("2020-01-01");
  });

  it("removes undefined values", () => {
    const result = serialiseURLSearchParams({
      token: "abc",
      from: undefined,
    });
    expect(result.get("token")).toBe("abc");
    expect(result.has("from")).toBe(false);
  });

  it("converts null to empty string", () => {
    const result = serialiseURLSearchParams({
      token: "abc",
      from: null,
    });
    expect(result.get("from")).toBe("");
  });

  it("joins array values with commas", () => {
    const result = serialiseURLSearchParams({
      investorExtRefs: ["inv-1", "inv-2", "inv-3"],
    });
    expect(result.get("investorExtRefs")).toBe("inv-1,inv-2,inv-3");
  });

  it("handles empty arrays", () => {
    const result = serialiseURLSearchParams({
      investorExtRefs: [],
    });
    expect(result.get("investorExtRefs")).toBe("");
  });

  it("handles a mix of types", () => {
    const result = serialiseURLSearchParams({
      token: "abc",
      from: undefined,
      to: null,
      refs: ["a", "b"],
    });
    expect(result.get("token")).toBe("abc");
    expect(result.has("from")).toBe(false);
    expect(result.get("to")).toBe("");
    expect(result.get("refs")).toBe("a,b");
  });
});
