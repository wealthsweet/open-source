import { BrandingOverrides } from "@wealthsweet/http-apis/performance/zod";
import {
  buildSrcProperty,
  serialiseURLSearchParams,
  type Protocol,
} from "src/utils/url-utils";
import type {
  PerformancePageElement,
  WealthSweetPerforamnceElementQueryParams,
} from "./performance";

export { PerformancePageElement };
export type WealthSweetElement = PerformancePageElement;
export type WealthSweetElementOrigin = { protocol?: Protocol; host: string };
export type WealthSweetElementURLParams = {
  origin: WealthSweetElementOrigin;
} & WealthSweetElement;

function convertToUrlParams({
  currencyIsoCode,
  ...queryParams
}: Omit<WealthSweetPerforamnceElementQueryParams, "brandingOverrides"> & {
  brandingOverrides?: BrandingOverrides;
}): Record<string, string | string[] | null | undefined> {
  // currencyIsoCode is deprecated and ignored by the embedded page, so send it under its current name
  const reportingCurrencyIsoCode =
    queryParams.reportingCurrencyIsoCode ?? currencyIsoCode;
  return Object.fromEntries(
    Object.entries({ ...queryParams, reportingCurrencyIsoCode }).map(
      ([key, value]) => {
        if (
          typeof value === "object" &&
          value !== null &&
          Array.isArray(value) === false
        ) {
          return [key, btoa(JSON.stringify(value))] satisfies [
            string,
            string | string[] | null | undefined,
          ];
        }
        return [key, value] satisfies [
          string,
          string | string[] | null | undefined,
        ];
      },
    ),
  );
}

export function generateWealthSweetElementUrl({
  origin: { protocol, host },
  path,
  params,
  brandingOverrides,
}: WealthSweetElementURLParams & {
  brandingOverrides?: BrandingOverrides;
}) {
  return buildSrcProperty({
    host,
    protocol,
    path,
    params: serialiseURLSearchParams(
      convertToUrlParams({ ...params, brandingOverrides }),
    ),
  });
}
