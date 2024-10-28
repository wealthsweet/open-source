import { useEffect, useMemo } from "react";
import type { WealthSweetElementOrigin } from "src/lib";
import {
  buildHandleMessage,
  combineCallbacks,
  type MessagingCallbacks,
} from "src/utils/messaging-callback-utils";

export type UseWealthsweetMessagesProps = {
  origin: WealthSweetElementOrigin;
} & Partial<MessagingCallbacks>;

export function useWealthsweetMessages({
  origin,
  onMessage,
  onError,
  onInitialising,
  onInitialisingDone,
  onRendering,
  onRenderingDone,
  onUserEvent,
  onUserIdle,
}: UseWealthsweetMessagesProps) {
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
    console.log("adding event listener");
    window.addEventListener("message", handleMessage);
    return () => {
      console.log("removing event listener");
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage]);
}
