import { describe, expect, it } from "vitest";
import {
  embedRequestParams,
  generateAuthTokenRequestBody,
  generateAuthTokenResponse,
  optionalBrandingOverridesSchema,
  SELECTABLE_FONTS_ENUM,
  serviceHealth,
  serviceHealthResponse,
} from "./index";

describe("generateAuthTokenRequestBody", () => {
  it("parses a valid request with all fields", () => {
    const body = {
      clientId: "client-123",
      clientSecret: "17bd3fbcda124f7292445d3ab1c1c417",
      brandingId: "branding-1",
      expires: 1700000000,
      session: "session-1",
      nodes: ["node-1", "node-2"],
    };
    const result = generateAuthTokenRequestBody.safeParse(body);
    expect(result.success).toBe(true);
  });

  it("parses a minimal request (optional fields omitted)", () => {
    const body = {
      clientId: "client-123",
      clientSecret: "secret",
      expires: null,
      session: "session-1",
    };
    const result = generateAuthTokenRequestBody.safeParse(body);
    expect(result.success).toBe(true);
  });

  it("rejects negative expires", () => {
    const body = {
      clientId: "client-123",
      clientSecret: "secret",
      expires: -1,
      session: "session-1",
    };
    const result = generateAuthTokenRequestBody.safeParse(body);
    expect(result.success).toBe(false);
  });

  it("coerces string expires to number", () => {
    const body = {
      clientId: "client-123",
      clientSecret: "secret",
      expires: "1700000000",
      session: "session-1",
    };
    const result = generateAuthTokenRequestBody.safeParse(body);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = generateAuthTokenRequestBody.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("generateAuthTokenResponse", () => {
  it("parses a valid response", () => {
    const result = generateAuthTokenResponse.safeParse({
      token: "pk_test_TOKEN",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing token", () => {
    const result = generateAuthTokenResponse.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("optionalBrandingOverridesSchema", () => {
  it("parses an empty object (all fields optional)", () => {
    const result = optionalBrandingOverridesSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("parses a full branding configuration", () => {
    const config = {
      balanceColor: "#00FF00",
      timeWeightedPerformanceColor: "rgb(0, 255, 0)",
      moneyWeightedPerformanceColor: "hsl(120, 100%, 50%)",
      positiveCapitalMovementColor: "#00FF00",
      negativeCapitalMovementColor: "#FF0000",
      primaryColor: "#123456",
      primaryForegroundColor: "#000000",
      secondaryColor: "#FFFFFF",
      secondaryForegroundColor: "#000000",
      callToActionColor: "#FF0000",
      callToActionForegroundColor: "#FFFFFF",
      pdfBalanceColor: "#012345",
      pdfTimeWeightedPerformanceColor: "#012345",
      pdfMoneyWeightedPerformanceColor: "#012345",
      pdfPositiveCapitalMovementColor: "#012345",
      pdfNegativeCapitalMovementColor: "#012345",
      pdfTextColor: "#012345",
      pdfBannerColor: "#012345",
      pdfPageColor: "#012345",
      pdfBannerContrastColor: "#012345",
      fontFamily: "Inter",
      logoUrl: "https://example.com/logo.png",
    };
    const result = optionalBrandingOverridesSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it("parses a partial branding configuration", () => {
    const config = {
      primaryColor: "#FF0000",
      fontFamily: "Roboto",
    };
    const result = optionalBrandingOverridesSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it("rejects invalid fontFamily", () => {
    const config = { fontFamily: "Comic Sans" };
    const result = optionalBrandingOverridesSchema.safeParse(config);
    expect(result.success).toBe(false);
  });
});

describe("SELECTABLE_FONTS_ENUM", () => {
  it.each([
    "Inter",
    "Open Sans",
    "Roboto",
    "Poppins",
    "Brown Regular",
    "Whitney Medium",
  ])("accepts %s", (font) => {
    const result = SELECTABLE_FONTS_ENUM.safeParse(font);
    expect(result.success).toBe(true);
  });

  it("rejects unknown fonts", () => {
    const result = SELECTABLE_FONTS_ENUM.safeParse("Arial");
    expect(result.success).toBe(false);
  });
});

describe("embedRequestParams", () => {
  it("parses minimal params (just token)", () => {
    const result = embedRequestParams.safeParse({ token: "pk_test_TOKEN" });
    expect(result.success).toBe(true);
  });

  it("parses full params", () => {
    const params = {
      token: "pk_test_TOKEN",
      from: "2020-01-01",
      to: "2021-01-01",
      currencyIsoCode: "GBP",
      investorExtRefs: ["inv-1", "inv-2"],
      investorAccountExtRefs: ["inv-acc-1"],
      brandingOverrides: btoa(JSON.stringify({ primaryColor: "#FF0000" })),
    };
    const result = embedRequestParams.safeParse(params);
    expect(result.success).toBe(true);
  });

  it("rejects missing token", () => {
    const result = embedRequestParams.safeParse({ from: "2020-01-01" });
    expect(result.success).toBe(false);
  });

  it("rejects currency code that is too short", () => {
    const result = embedRequestParams.safeParse({
      token: "pk_test_TOKEN",
      currencyIsoCode: "GB",
    });
    expect(result.success).toBe(false);
  });

  it("rejects currency code that is too long", () => {
    const result = embedRequestParams.safeParse({
      token: "pk_test_TOKEN",
      currencyIsoCode: "GBPP",
    });
    expect(result.success).toBe(false);
  });
});

describe("serviceHealth", () => {
  it("parses a healthy service", () => {
    const result = serviceHealth.safeParse({ health: "Healthy" });
    expect(result.success).toBe(true);
  });

  it("parses an unhealthy service with error", () => {
    const result = serviceHealth.safeParse({
      health: "Unhealthy",
      message: "Service is down",
      error: "Connection refused",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown health values", () => {
    const result = serviceHealth.safeParse({ health: "Degraded" });
    expect(result.success).toBe(false);
  });
});

describe("serviceHealthResponse", () => {
  const healthyService = { health: "Healthy" as const };

  it("parses a full health response", () => {
    const response = {
      api: healthyService,
      database: healthyService,
      pubStorage: healthyService,
      azure: healthyService,
    };
    const result = serviceHealthResponse.safeParse(response);
    expect(result.success).toBe(true);
  });

  it("rejects missing services", () => {
    const result = serviceHealthResponse.safeParse({
      api: healthyService,
    });
    expect(result.success).toBe(false);
  });
});
