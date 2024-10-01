import {
  buildSrcProperty,
  serialiseURLSearchParams,
  type Protocol,
} from "src/utils/url-utils";
import type { PerformancePageElement } from "./performance";

export { PerformancePageElement };
export type WealthSweetElement = PerformancePageElement;
export type WealthSweetElementOrigin = { protocol?: Protocol; host: string };
export type WealthSweetElementURLParams = {
  origin: WealthSweetElementOrigin;
} & WealthSweetElement;

export function generateWealthSweetElementUrl({
  origin: { protocol, host },
  path,
  params,
}: WealthSweetElementURLParams) {
  return buildSrcProperty({
    host,
    protocol,
    path,
    params: serialiseURLSearchParams(params),
  });
}
