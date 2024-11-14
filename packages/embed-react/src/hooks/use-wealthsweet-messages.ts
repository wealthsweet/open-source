import { useEffect, useMemo, useState } from "react";
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

type ListeningState = "INITIALISED" | "LISTENING" | "UNMOUNTED";

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
  const [wealthsweetContextLoaded, wealthsweetContext] =
    useWealthSweetContextWithoutGuarantee();
  const [isListeningToMessages, setIsListeningToMessages] =
    useState<ListeningState>("INITIALISED");

  // Even though the message hook handles this it is nicer to fail fast now if this is the only hook the user sees
  // This will throw an error when the param is not found
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
    setIsListeningToMessages("LISTENING");
    return () => {
      setIsListeningToMessages("UNMOUNTED");
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage]);

  return {
    isListeningToMessages: isListeningToMessages == "LISTENING",
  };
}
