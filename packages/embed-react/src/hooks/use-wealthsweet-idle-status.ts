import { useMemo, useState } from "react";
import { useWealthSweetContextWithoutGuarantee } from "src/contexts/wealthsweet-provider";
import type { WealthSweetElementOrigin } from "src/lib";
import {
  maybeCall,
  type MessagingCallbacks,
} from "src/utils/messaging-callback-utils";
import { useWealthsweetMessages } from "./use-wealthsweet-messages";
import { buildContextParamsNotFoundError } from "./utils";

export type UseWealthsweetIdleStatusProps = {
  origin?: WealthSweetElementOrigin;
  timeout?: number;
  onIdle?: () => void;
  onAction?: () => void;
  messagingCallbacks?: MessagingCallbacks;
};

const TEN_MINUTES_MILLIS = 1000 * 60 * 10;

export function useWealthsweetIdleStatus({
  origin: paramOrigin,
  timeout = TEN_MINUTES_MILLIS,
  onIdle,
  onAction,
}: UseWealthsweetIdleStatusProps) {
  const [lastActiveTime, setLastActiveTime] = useState<number>();
  const [isIdle, setIsIdle] = useState<boolean>(false);

  const onUserIdle = useMemo(() => onIdle, [onIdle]);
  const onUserEvent = useMemo(() => onAction, [onAction]);

  const internalCallbacks = useMemo(
    (): Partial<MessagingCallbacks> => ({
      onUserIdle({ lastActiveTime }) {
        if (lastActiveTime) {
          setLastActiveTime(lastActiveTime);
          if (Date.now() - lastActiveTime > timeout) {
            setIsIdle(true);
            maybeCall(onUserIdle, undefined);
          }
        }
      },
      onUserEvent({ userEventTime }) {
        if (userEventTime) {
          setLastActiveTime(userEventTime);
        }
        setIsIdle(false);
        maybeCall(onUserEvent, undefined);
      },
    }),
    [setLastActiveTime, setIsIdle, onUserIdle, onUserEvent, timeout],
  );

  // Even though the message hook handles this it is nicer to refer to the IdleStatus hook if that is the only hook the user sees
  const { origin: contextOrigin, contextLoaded } =
    useWealthSweetContextWithoutGuarantee();
  if (!contextLoaded && !contextOrigin) {
    throw buildContextParamsNotFoundError("useWealthsweetIdleStatus", [
      "origin",
    ]);
  }
  const origin = contextLoaded ? contextOrigin : paramOrigin;

  const { isListeningToMessages } = useWealthsweetMessages({
    origin,
    ...internalCallbacks,
  });

  return {
    isIdle,
    lastActiveTime,
    isListeningToMessages,
  };
}
