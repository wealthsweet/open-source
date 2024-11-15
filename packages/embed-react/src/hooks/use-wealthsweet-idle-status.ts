import { useMemo, useState } from "react";
import { useOriginContextWithoutGuarantee } from "src/contexts/origin-context";
import type { WealthSweetElementOrigin } from "src/lib";
import {
  maybeCall,
  type MessagingCallbacks,
} from "src/utils/messaging-callback-utils";
import { useWealthsweetMessages } from "./use-wealthsweet-messages";
import {
  buildContextParamsNotFoundError,
  chooseHookParamElseContextParam,
} from "./utils";

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

  const [originContextLoaded, originContext] =
    useOriginContextWithoutGuarantee();

  // Even though the message hook handles this it is nicer to fail fast now if this is the only hook the user sees
  // This will throw an error when the param is not found
  const origin = chooseHookParamElseContextParam(
    paramOrigin,
    originContext?.origin,
    originContextLoaded,
    buildContextParamsNotFoundError("useWealthsweetIdleStatus", ["origin"]),
  );

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
