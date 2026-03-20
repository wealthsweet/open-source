import { describe, expect, it } from "vitest";
import { generateWealthSweetElementUrl } from "./index";

describe("generateWealthSweetElementUrl", () => {
  const defaultOrigin = { host: "app.wealthsweet.com" };
  const defaultPath = "embed/pages/performance" as const;

  it("generates a basic URL with token", () => {
    const url = generateWealthSweetElementUrl({
      origin: defaultOrigin,
      path: defaultPath,
      params: { token: "test-token" },
    });
    expect(url).toBe(
      "https://app.wealthsweet.com/embed/pages/performance?token=test-token",
    );
  });

  it("uses http protocol when specified", () => {
    const url = generateWealthSweetElementUrl({
      origin: { protocol: "http", host: "localhost:3000" },
      path: defaultPath,
      params: { token: "test-token" },
    });
    expect(url).toContain("http://localhost:3000/");
  });

  it("includes optional query params", () => {
    const url = generateWealthSweetElementUrl({
      origin: defaultOrigin,
      path: defaultPath,
      params: {
        token: "test-token",
        from: "2020-01-01",
        to: "2021-01-01",
        currencyIsoCode: "GBP",
      },
    });
    expect(url).toContain("token=test-token");
    expect(url).toContain("from=2020-01-01");
    expect(url).toContain("to=2021-01-01");
    expect(url).toContain("currencyIsoCode=GBP");
  });

  it("base64-encodes branding configuration", () => {
    const brandingConfig = { primaryColor: "#FF0000" };
    const url = generateWealthSweetElementUrl({
      origin: defaultOrigin,
      path: defaultPath,
      params: { token: "test-token" },
      brandingConfiguration: brandingConfig,
    });
    const expectedBase64 = btoa(JSON.stringify(brandingConfig));
    expect(url).toContain(
      `brandingConfiguration=${encodeURIComponent(expectedBase64)}`,
    );
  });

  it("omits brandingConfiguration when not provided", () => {
    const url = generateWealthSweetElementUrl({
      origin: defaultOrigin,
      path: defaultPath,
      params: { token: "test-token" },
    });
    expect(url).not.toContain("brandingConfiguration");
  });

  it("comma-joins array params (investorExtRefs) instead of base64-encoding", () => {
    const url = generateWealthSweetElementUrl({
      origin: defaultOrigin,
      path: defaultPath,
      params: {
        token: "test-token",
        investorExtRefs: ["inv-1", "inv-2"],
      },
    });
    expect(url).toContain("investorExtRefs=inv-1%2Cinv-2");
    expect(url).not.toContain(btoa(JSON.stringify(["inv-1", "inv-2"])));
  });
});
