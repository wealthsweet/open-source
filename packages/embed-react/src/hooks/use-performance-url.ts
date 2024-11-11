import { useWealthSweetContextWithoutGuarantee } from "src/contexts/wealthsweet-context";
import {
  generateWealthSweetElementUrl,
  type WealthSweetElementOrigin,
} from "src/lib";
import type { WealthSweetPerforamnceElementQueryParams } from "src/lib/performance";
import { useTokenContextWithoutGuarantee } from "../contexts/token-context";
import {
  buildContextParamsNotFoundError,
  chooseHookParamElseContextParam,
} from "./utils";

export function usePerformanceUrl({
  token: paramToken,
  origin: paramOrigin,
  ...params
}: Partial<
  WealthSweetPerforamnceElementQueryParams & {
    origin: WealthSweetElementOrigin;
  }
>) {
  const [tokenContextLoaded, tokenContext] = useTokenContextWithoutGuarantee();
  const [wealthsweetContextLoaded, wealthsweetContext] =
    useWealthSweetContextWithoutGuarantee();

  const origin = chooseHookParamElseContextParam(
    paramOrigin,
    wealthsweetContext?.origin,
    wealthsweetContextLoaded,
    buildContextParamsNotFoundError("useWealthsweetIdleStatus", ["origin"]),
  );

  if (paramToken) {
    // The token param was passed in so use that.
    return {
      isTokenLoaded: true as const,
      performanceUrl: generateWealthSweetElementUrl({
        origin,
        path: "embed/pages/performance",
        params: { ...params, token: paramToken },
      }),
    };
  }
  // The token param was not passed in so we need the token context
  if (!tokenContextLoaded) {
    throw buildContextParamsNotFoundError("usePerformanceUrl", ["token"]);
  }

  // Report something bad happened if fetching the token had an error
  if (tokenContext._tag === "error") {
    return {
      isTokenError: true as const,
      tokenError: tokenContext.error,
      tokenFetchState: tokenContext.tokenFetchState,
    };
  }

  // If there still is no token then we probably have just initialised the hook and the request hasnt fired yet
  if (!tokenContext.token) {
    return {
      isTokenLoaded: false as const,
      tokenFetchState: tokenContext.tokenFetchState,
    };
  }

  return {
    isTokenLoaded: true as const,
    tokenFetchState: tokenContext.tokenFetchState,
    performanceUrl: generateWealthSweetElementUrl({
      origin,
      path: "embed/pages/performance",
      params: { ...params, token: tokenContext.token.token },
    }),
  };
}
