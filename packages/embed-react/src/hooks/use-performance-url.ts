import { useWealthSweetContextWithoutGuarantee } from "src/contexts/wealthsweet-provider";
import {
  generateWealthSweetElementUrl,
  type WealthSweetElementOrigin,
} from "src/lib";
import type { WealthSweetPerforamnceElementQueryParams } from "src/lib/performance";
import { useTokenContextWithoutGuarantee } from "../contexts/token-context";
import { buildContextParamsNotFoundError } from "./utils";

export function usePerformanceUrl({
  token: paramToken,
  origin: paramOrigin,
  ...params
}: Partial<
  WealthSweetPerforamnceElementQueryParams & {
    origin: WealthSweetElementOrigin;
  }
>) {
  const tokenContext = useTokenContextWithoutGuarantee();
  const { origin: contextOrigin, contextLoaded: wealthsweetContextLoaded } =
    useWealthSweetContextWithoutGuarantee();
  if (!contextOrigin && !paramOrigin) {
    throw buildContextParamsNotFoundError("usePerformanceUrl", ["origin"]);
  }
  const origin = (contextOrigin ? contextOrigin : paramOrigin)!;

  const { contextLoaded } = tokenContext;
  if (!contextLoaded && !paramToken) {
    throw buildContextParamsNotFoundError("usePerformanceUrl", ["token"]);
  }

  if (tokenContext._tag === "error") {
    return {
      isTokenError: true as const,
      tokenError: tokenContext.error,
    };
  }

  const returnToken = contextLoaded ? tokenContext.token.token : paramToken;
  if (returnToken === undefined) {
    return {
      isTokenLoaded: false as const,
    };
  }
  return {
    isTokenLoaded: true as const,
    performanceUrl: generateWealthSweetElementUrl({
      origin,
      path: "embed/pages/performance",
      params: { ...params, token: returnToken },
    }),
  };
}
