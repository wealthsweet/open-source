import type { operations } from "@wealthsweet/http-apis/performance/api";

export type PerformancePageElement = {
  path: "embed/pages/performance";
  params: Omit<WealthSweetPerforamnceElementQueryParams, "brandingOverrides">;
};

export type WealthSweetPerforamnceElementQueryParams = NonNullable<
  operations["embedPagePerformance"]["parameters"]["query"]
>;
