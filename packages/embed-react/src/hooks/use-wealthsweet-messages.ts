import { useEffect, useMemo } from "react";
import { useWealthSweetContextWithoutGuarantee } from "src/contexts/wealthsweet-provider";
import type { WealthSweetElementOrigin } from "src/lib";
import {
  buildHandleMessage,
  combineCallbacks,
  type MessagingCallbacks,
} from "src/utils/messaging-callback-utils";
import { buildContextParamsNotFoundError } from "./utils";

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
  const { origin: contextOrigin, contextLoaded } =
    useWealthSweetContextWithoutGuarantee();
  if (!contextLoaded && !contextOrigin) {
    throw buildContextParamsNotFoundError("useWealthsweetMessages", ["origin"]);
  }
  const returnOrigin = contextLoaded ? contextOrigin : paramOrigin;
  if (returnOrigin === undefined) {
    return {
      isListeningToMessages: false as const,
    };
  }

  const handleMessage = useMemo(
    () =>
      buildHandleMessage(
        returnOrigin,
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
