import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useWealthsweetMessages } from "./use-wealthsweet-messages";

const origin = { host: "app.example.com" };

function postFromOrigin() {
  window.dispatchEvent(
    new MessageEvent("message", {
      origin: "https://app.example.com",
      data: { type: "INITIALISING_DONE", messageTime: Date.now() },
    }),
  );
}

describe("useWealthsweetMessages", () => {
  it("reports that it is listening once mounted", () => {
    const { result } = renderHook(() => useWealthsweetMessages({ origin }));
    expect(result.current.isListeningToMessages).toBe(true);
  });

  it("delivers messages while mounted", () => {
    const onInitialisingDone = vi.fn();
    renderHook(() => useWealthsweetMessages({ origin, onInitialisingDone }));
    postFromOrigin();
    expect(onInitialisingDone).toHaveBeenCalledOnce();
  });

  it("stops delivering messages once unmounted", () => {
    const onInitialisingDone = vi.fn();
    const { unmount } = renderHook(() =>
      useWealthsweetMessages({ origin, onInitialisingDone }),
    );
    unmount();
    postFromOrigin();
    expect(onInitialisingDone).not.toHaveBeenCalled();
  });
});
