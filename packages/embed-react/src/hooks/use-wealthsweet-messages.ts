import { useEffect, useMemo, useState } from "react";
import { useOriginContextWithoutGuarantee } from "src/contexts/origin-context";
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

/**
 * Props for the useWealthsweetMessages hook.
 */
export type UseWealthsweetMessagesProps = {
  /** The origin for the WealthSweet element. */
  origin?: WealthSweetElementOrigin;
} & Partial<MessagingCallbacks>;

/** Represents the current state of message listening. */
type ListeningState = "INITIALISED" | "LISTENING" | "UNMOUNTED";

/**
 * A hook that sets up message listening for WealthSweet elements.
 * It handles various types of messages and provides callbacks for different events.
 *
 * @param {UseWealthsweetMessagesProps} props - The configuration options for the hook.
 * @param {WealthSweetElementOrigin} [props.origin] - The origin for the WealthSweet element.
 * @param {Function} [props.onMessage] - Callback for general messages.
 * @param {Function} [props.onError] - Callback for error messages.
 * @param {Function} [props.onInitialising] - Callback when initialisation starts.
 * @param {Function} [props.onInitialisingDone] - Callback when initialisation is complete.
 * @param {Function} [props.onRendering] - Callback when rendering starts.
 * @param {Function} [props.onRenderingDone] - Callback when rendering is complete.
 * @param {Function} [props.onUserEvent] - Callback for user events.
 * @param {Function} [props.onUserIdle] - Callback when the user becomes idle.
 *
 * @returns {Object} An object containing the current listening state.
 * @returns {boolean} .isListeningToMessages - Whether the hook is currently listening to messages.
 */
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
  const [originContextLoaded, originContext] =
    useOriginContextWithoutGuarantee();
  const [isListeningToMessages, setIsListeningToMessages] =
    useState<ListeningState>("INITIALISED");

  // Even though the message hook handles this it is nicer to fail fast now if this is the only hook the user sees
  // This will throw an error when the param is not found
  const origin = chooseHookParamElseContextParam(
    paramOrigin,
    originContext?.origin,
    originContextLoaded,
    buildContextParamsNotFoundError("useWealthsweetMessages", ["origin"]),
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
