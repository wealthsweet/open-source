import { useOriginContextWithoutGuarantee } from "src/contexts/origin-context";
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

/**
 * A hook that generates a URL for the WealthSweet performance element.
 * It uses either provided parameters or context values for token and origin.
 *
 * @param {Object} params - The parameters for generating the performance URL.
 * @param {string} [params.token] - The token to use for authentication.
 * @param {WealthSweetElementOrigin} [params.origin] - The origin for the WealthSweet element.
 * @param {...WealthSweetPerforamnceElementQueryParams} params - Additional query parameters for the performance element.
 *
 * @returns {Object} An object containing the performance URL and loading state information.
 * @property {boolean} isTokenLoaded - Indicates whether the token is loaded.
 * @property {string} [performanceUrl] - The generated performance URL.
 * @property {boolean} [isTokenError] - Indicates if there was an error fetching the token.
 * @property {Object} [tokenError] - The error object if there was an error fetching the token.
 * @property {string} [tokenFetchState] - The current state of token fetching.
 */
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
  const [originContextLoaded, originContext] =
    useOriginContextWithoutGuarantee();

  const origin = chooseHookParamElseContextParam(
    paramOrigin,
    originContext?.origin,
    originContextLoaded,
    buildContextParamsNotFoundError("usePerformanceUrl", ["origin"]),
  );

  if (paramToken) {
    // The token param was passed in so use that.
    return {
      isTokenLoaded: true as const,
      isTokenError: false as const,
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
      isTokenLoaded: false as const,
      isTokenError: true as const,
      tokenError: tokenContext.error,
      tokenFetchState: tokenContext.tokenFetchState,
    };
  }

  // If there still is no token then we probably have just initialised the hook and the request hasnt fired yet
  if (!tokenContext.token) {
    return {
      isTokenLoaded: false as const,
      isTokenError: false as const,
      tokenFetchState: tokenContext.tokenFetchState,
    };
  }

  return {
    isTokenLoaded: true as const,
    isTokenError: false as const,
    tokenFetchState: tokenContext.tokenFetchState,
    performanceUrl: generateWealthSweetElementUrl({
      origin,
      path: "embed/pages/performance",
      params: { ...params, token: tokenContext.token.token },
    }),
  };
}
