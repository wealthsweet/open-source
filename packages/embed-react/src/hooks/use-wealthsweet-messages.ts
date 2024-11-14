import { useEffect, useMemo } from "react";
import { useWealthSweetContextWithoutGuarantee } from "src/contexts/wealthsweet-context";
import type { WealthSweetElementOrigin } from "src/lib";
import {
  buildHandleMessage,
  combineCallbacks,
  type MessagingCallbacks,
} from "src/utils/messaging-callback-utils";
import {
  buildContextParamsNotFoundError,
  chooseHookParamElseContextParam,
} from "./utils";

export type UseWealthsweetMessagesProps = {
  origin?: WealthSweetElementOrigin;
} & Partial<MessagingCallbacks>;

export function useWealthsweetMessages({
  origin: paramOrigin,
  onMessage,
  onError,
  onInitialising,
  onInitialisingDone,
  onRendering,
  onRenderingDone,
  onUserEvent,
  onUserIdle,
}: UseWealthsweetMessagesProps) {
  // Even though the message hook handles this it is nicer to fail fast now if this is the only hook the user sees
  const [wealthsweetContextLoaded, wealthsweetContext] =
    useWealthSweetContextWithoutGuarantee();
  const origin = chooseHookParamElseContextParam(
    paramOrigin,
    wealthsweetContext?.origin,
    wealthsweetContextLoaded,
    buildContextParamsNotFoundError("useWealthsweetIdleStatus", ["origin"]),
  );

  const handleMessage = useMemo(
    () =>
      buildHandleMessage(
        origin,
        combineCallbacks(
          {
            onMessage,
            onError,
            onInitialising,
            onInitialisingDone,
            onRendering,
            onRenderingDone,
            onUserEvent,
            onUserIdle,
          },
          {},
        ),
      ),
    [
      origin,
      onMessage,
      onError,
      onInitialising,
      onInitialisingDone,
      onRendering,
      onRenderingDone,
      onUserEvent,
      onUserIdle,
    ],
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage]);

  return {
    isListeningToMessages: true as const,
  };
}
