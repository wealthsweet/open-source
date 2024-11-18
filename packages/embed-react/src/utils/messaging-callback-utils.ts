import type {
  EmbedMessage,
  ErrorEmbedMessage,
  InitialisingDoneEmbedMessage,
  InitialisingEmbedMessage,
  RenderingDoneEmbedMessage,
  RenderingEmbedMessage,
  UserEventEmbedMessage,
  UserIdleEmbedMessage,
} from "@wealthsweet/embed-message-api";
import { embedMessageSchema } from "@wealthsweet/embed-message-api";
import type { WealthSweetElementOrigin } from "src/lib";

export type MessagingCallbacks = {
  onMessage: (message: EmbedMessage) => void;
  onUserEvent: (message: UserEventEmbedMessage) => void;
  onUserIdle: (message: UserIdleEmbedMessage) => void;
  onInitialising: (message: InitialisingEmbedMessage) => void;
  onInitialisingDone: (message: InitialisingDoneEmbedMessage) => void;
  onRendering: (message: RenderingEmbedMessage) => void;
  onRenderingDone: (message: RenderingDoneEmbedMessage) => void;
  onError: (message: ErrorEmbedMessage) => void;
};

export function maybeCall<TParams>(
  callback: ((params: TParams) => void) | undefined | null,
  params: TParams,
) {
  if (callback) {
    callback(params);
  }
}

export function combineCallbacks(
  firstCallbacks: Partial<MessagingCallbacks>,
  secondCallbacks: Partial<MessagingCallbacks>,
): MessagingCallbacks {
  return {
    onMessage(message) {
      maybeCall(firstCallbacks.onMessage, message);
      maybeCall(secondCallbacks.onMessage, message);
    },
    onUserEvent(message) {
      maybeCall(firstCallbacks.onUserEvent, message);
      maybeCall(secondCallbacks.onMessage, message);
    },
    onUserIdle(message) {
      maybeCall(firstCallbacks.onUserIdle, message);
      maybeCall(secondCallbacks.onMessage, message);
    },
    onInitialising(message) {
      maybeCall(firstCallbacks.onInitialising, message);
      maybeCall(secondCallbacks.onMessage, message);
    },
    onInitialisingDone(message) {
      maybeCall(firstCallbacks.onInitialisingDone, message);
      maybeCall(secondCallbacks.onMessage, message);
    },
    onRendering(message) {
      maybeCall(firstCallbacks.onRendering, message);
      maybeCall(secondCallbacks.onMessage, message);
    },
    onRenderingDone(message) {
      maybeCall(firstCallbacks.onRenderingDone, message);
      maybeCall(secondCallbacks.onMessage, message);
    },
    onError(message) {
      maybeCall(firstCallbacks.onError, message);
      maybeCall(secondCallbacks.onMessage, message);
    },
  };
}

export function buildHandleMessage(
  { protocol, host }: WealthSweetElementOrigin,
  {
    onMessage,
    onUserEvent,
    onUserIdle,
    onInitialising,
    onInitialisingDone,
    onRendering,
    onRenderingDone,
    onError,
  }: MessagingCallbacks,
) {
  return (event: MessageEvent) => {
    const allowedOrigin = `${protocol}://${host}`;

    if (event.origin !== allowedOrigin) {
      // console.warn(
      //   `Message received from unknown origin: ${event.origin}. Expected origin: ${allowedOrigin}`,
      // );
      // This gets noisy if user has other apps sending messages over the post message api
      return;
    }
    const parsedMessage = embedMessageSchema.safeParse(event.data);
    if (parsedMessage.success) {
      onMessage(parsedMessage.data);
      switch (parsedMessage.data.type) {
        case "INITIALISING":
          onInitialising(parsedMessage.data);
          break;
        case "INITIALISING_DONE":
          onInitialisingDone(parsedMessage.data);
          break;
        case "RENDERING":
          onRendering(parsedMessage.data);
          break;
        case "RENDERING_DONE":
          onRenderingDone(parsedMessage.data);
          break;
        case "USER_EVENT":
          onUserEvent(parsedMessage.data);
          break;
        case "USER_IDLE":
          onUserIdle(parsedMessage.data);
          break;
        case "ERROR":
          onError(parsedMessage.data);
          break;
      }
    } else {
      console.log("Invalid message received", parsedMessage.error);
    }
  };
}
