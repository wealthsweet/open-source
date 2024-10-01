import {
  generateWealthSweetElementUrl,
  type WealthSweetElementOrigin,
} from "src/lib";
import type { WealthSweetPerforamnceElementQueryParams } from "src/lib/performance";
import { useTokenContextWithoutGuarantee } from "../contexts/token-context";

export function usePerformanceUrl(
  origin: WealthSweetElementOrigin,
  {
    token: paramToken,
    ...params
  }: Partial<WealthSweetPerforamnceElementQueryParams>,
) {
  const { token: contextToken, contextLoaded } =
    useTokenContextWithoutGuarantee();
  if (!contextLoaded && !paramToken) {
    throw new Error(`WealthSweet context not found and no token was provided to the usePerformanceUrl hook.\n
      Provide a WealthSweet context with a fetchToken callback for this hook or provide a token in the hook url params`);
  }
  const returnToken = contextLoaded ? contextToken : paramToken;
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
