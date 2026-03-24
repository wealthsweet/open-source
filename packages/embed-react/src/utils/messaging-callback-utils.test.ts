import { describe, expect, it, vi } from "vitest";
import {
  buildHandleMessage,
  combineCallbacks,
  maybeCall,
  type MessagingCallbacks,
} from "./messaging-callback-utils";

describe("maybeCall", () => {
  it("calls the callback when provided", () => {
    const cb = vi.fn();
    maybeCall(cb, "hello");
    expect(cb).toHaveBeenCalledWith("hello");
  });

  it("does not throw when callback is undefined", () => {
    expect(() => maybeCall(undefined, "hello")).not.toThrow();
  });

  it("does not throw when callback is null", () => {
    expect(() => maybeCall(null, "hello")).not.toThrow();
  });
});

describe("combineCallbacks", () => {
  it("calls both onMessage callbacks", () => {
    const first = vi.fn();
    const second = vi.fn();
    const combined = combineCallbacks(
      { onMessage: first },
      { onMessage: second },
    );
    const msg = {
      type: "INITIALISING" as const,
      messageTime: Date.now(),
    };
    combined.onMessage(msg);
    expect(first).toHaveBeenCalledWith(msg);
    expect(second).toHaveBeenCalledWith(msg);
  });

  it("calls first-specific callback and second onMessage for typed events", () => {
    const onUserEvent = vi.fn();
    const secondOnMessage = vi.fn();
    const combined = combineCallbacks(
      { onUserEvent },
      { onMessage: secondOnMessage },
    );
    const msg = {
      type: "USER_EVENT" as const,
      messageTime: Date.now(),
      userEventTime: Date.now(),
    };
    combined.onUserEvent(msg);
    expect(onUserEvent).toHaveBeenCalledWith(msg);
    expect(secondOnMessage).toHaveBeenCalledWith(msg);
  });

  it("handles empty callbacks without throwing", () => {
    const combined = combineCallbacks({}, {});
    const msg = {
      type: "INITIALISING" as const,
      messageTime: Date.now(),
    };
    expect(() => combined.onMessage(msg)).not.toThrow();
    expect(() => combined.onInitialising(msg)).not.toThrow();
  });
});

describe("buildHandleMessage", () => {
  const origin = { protocol: "https" as const, host: "app.example.com" };

  function createCallbacks(): MessagingCallbacks {
    return {
      onMessage: vi.fn(),
      onUserEvent: vi.fn(),
      onUserIdle: vi.fn(),
      onInitialising: vi.fn(),
      onInitialisingDone: vi.fn(),
      onRendering: vi.fn(),
      onRenderingDone: vi.fn(),
      onError: vi.fn(),
    };
  }

  function createMessageEvent(
    eventOrigin: string,
    data: unknown,
  ): MessageEvent {
    return new MessageEvent("message", {
      origin: eventOrigin,
      data,
    });
  }

  it("ignores messages from wrong origin", () => {
    const callbacks = createCallbacks();
    const handler = buildHandleMessage(origin, callbacks);
    const event = createMessageEvent("https://evil.com", {
      type: "INITIALISING",
      messageTime: Date.now(),
    });
    handler(event);
    expect(callbacks.onMessage).not.toHaveBeenCalled();
  });

  it("ignores messages that fail schema validation", () => {
    const callbacks = createCallbacks();
    const handler = buildHandleMessage(origin, callbacks);
    const event = createMessageEvent("https://app.example.com", {
      type: "UNKNOWN",
      messageTime: Date.now(),
    });
    handler(event);
    expect(callbacks.onMessage).not.toHaveBeenCalled();
  });

  it("dispatches INITIALISING messages", () => {
    const callbacks = createCallbacks();
    const handler = buildHandleMessage(origin, callbacks);
    const data = { type: "INITIALISING", messageTime: Date.now() };
    handler(createMessageEvent("https://app.example.com", data));
    expect(callbacks.onMessage).toHaveBeenCalled();
    expect(callbacks.onInitialising).toHaveBeenCalled();
  });

  it("dispatches INITIALISING_DONE messages", () => {
    const callbacks = createCallbacks();
    const handler = buildHandleMessage(origin, callbacks);
    const data = { type: "INITIALISING_DONE", messageTime: Date.now() };
    handler(createMessageEvent("https://app.example.com", data));
    expect(callbacks.onMessage).toHaveBeenCalled();
    expect(callbacks.onInitialisingDone).toHaveBeenCalled();
  });

  it("dispatches RENDERING messages", () => {
    const callbacks = createCallbacks();
    const handler = buildHandleMessage(origin, callbacks);
    const data = { type: "RENDERING", messageTime: Date.now() };
    handler(createMessageEvent("https://app.example.com", data));
    expect(callbacks.onMessage).toHaveBeenCalled();
    expect(callbacks.onRendering).toHaveBeenCalled();
  });

  it("dispatches RENDERING_DONE messages", () => {
    const callbacks = createCallbacks();
    const handler = buildHandleMessage(origin, callbacks);
    const data = { type: "RENDERING_DONE", messageTime: Date.now() };
    handler(createMessageEvent("https://app.example.com", data));
    expect(callbacks.onMessage).toHaveBeenCalled();
    expect(callbacks.onRenderingDone).toHaveBeenCalled();
  });

  it("dispatches USER_EVENT messages", () => {
    const callbacks = createCallbacks();
    const handler = buildHandleMessage(origin, callbacks);
    const data = {
      type: "USER_EVENT",
      messageTime: Date.now(),
      userEventTime: Date.now(),
    };
    handler(createMessageEvent("https://app.example.com", data));
    expect(callbacks.onMessage).toHaveBeenCalled();
    expect(callbacks.onUserEvent).toHaveBeenCalled();
  });

  it("dispatches USER_IDLE messages", () => {
    const callbacks = createCallbacks();
    const handler = buildHandleMessage(origin, callbacks);
    const data = {
      type: "USER_IDLE",
      messageTime: Date.now(),
      lastActiveTime: Date.now() - 60000,
    };
    handler(createMessageEvent("https://app.example.com", data));
    expect(callbacks.onMessage).toHaveBeenCalled();
    expect(callbacks.onUserIdle).toHaveBeenCalled();
  });

  it("dispatches ERROR messages", () => {
    const callbacks = createCallbacks();
    const handler = buildHandleMessage(origin, callbacks);
    const data = { type: "ERROR", messageTime: Date.now() };
    handler(createMessageEvent("https://app.example.com", data));
    expect(callbacks.onMessage).toHaveBeenCalled();
    expect(callbacks.onError).toHaveBeenCalled();
  });

  it("uses http protocol for origin matching when specified", () => {
    const httpOrigin = { protocol: "http" as const, host: "localhost:3000" };
    const callbacks = createCallbacks();
    const handler = buildHandleMessage(httpOrigin, callbacks);
    const data = { type: "INITIALISING", messageTime: Date.now() };
    handler(createMessageEvent("http://localhost:3000", data));
    expect(callbacks.onMessage).toHaveBeenCalled();
  });

  it("does not dispatch non-matching typed callbacks", () => {
    const callbacks = createCallbacks();
    const handler = buildHandleMessage(origin, callbacks);
    const data = { type: "INITIALISING", messageTime: Date.now() };
    handler(createMessageEvent("https://app.example.com", data));
    expect(callbacks.onUserEvent).not.toHaveBeenCalled();
    expect(callbacks.onError).not.toHaveBeenCalled();
    expect(callbacks.onRendering).not.toHaveBeenCalled();
  });
});
