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

/**
 * Props for the useWealthsweetIdleStatus hook.
 */
export type UseWealthsweetIdleStatusProps = {
  /** The origin for the WealthSweet element. */
  origin?: WealthSweetElementOrigin;
  /** The timeout in milliseconds before considering the user idle. */
  timeout?: number;
  /** Callback function to be called when the user becomes idle. */
  onIdle?: () => void;
  /** Callback function to be called when the user performs an action. */
  onAction?: () => void;
  /** Additional messaging callbacks. */
  messagingCallbacks?: MessagingCallbacks;
};

/** Default timeout of 10 minutes in milliseconds. */
const TEN_MINUTES_MILLIS = 1000 * 60 * 10;

/**
 * A hook that manages the idle status of a WealthSweet element by tracking user activity.
 * It monitors user events and updates idle state based on a configurable timeout period.
 *
 * @param {UseWealthsweetIdleStatusProps} props - Configuration options for idle status tracking
 * @param {WealthSweetElementOrigin} [props.origin] - The origin URL for the WealthSweet element. If not provided, will use origin from context
 * @param {number} [props.timeout=600000] - Time in milliseconds before considering user idle. Defaults to 10 minutes
 * @param {() => void} [props.onIdle] - Callback function triggered when user becomes idle
 * @param {() => void} [props.onAction] - Callback function triggered when user performs an action
 * @param {MessagingCallbacks} [props.messagingCallbacks] - Additional messaging callbacks for custom event handling
 *
 * @returns {Object} Status information
 * @returns {boolean} .isIdle - Whether the user is currently considered idle
 * @returns {number} [.lastActiveTime] - Timestamp of the user's last activity in milliseconds
 * @returns {boolean} .isListeningToMessages - Whether the hook is successfully listening for user events
 *
 * @throws {Error} If neither origin prop nor origin context is available
 */
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
