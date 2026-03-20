import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import type { WealthSweetToken } from "../utils/token-utils";
import { TokenProvider, useTokenContext } from "./token-context";

describe("TokenProvider", () => {
  const createToken = (expiresInMs = 60000 * 5): WealthSweetToken => ({
    token: "test-token-" + Math.random().toString(36).slice(2),
    expires: Date.now() + expiresInMs,
  });

  function createWrapper(
    fetchToken: () => Promise<WealthSweetToken>,
    onFetchTokenError?: (error: { message: string; error: unknown }) => void,
  ) {
    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <TokenProvider
          fetchToken={fetchToken}
          onFetchTokenError={onFetchTokenError}
        >
          {children}
        </TokenProvider>
      );
    }
    return Wrapper;
  }

  it("starts in INITIALISED state and transitions to FETCHED", async () => {
    const token = createToken();
    const fetchToken = vi.fn().mockResolvedValue(token);

    const { result } = renderHook(() => useTokenContext(), {
      wrapper: createWrapper(fetchToken),
    });

    await waitFor(() => {
      expect(result.current._tag).toBe("success");
      if (result.current._tag === "success") {
        expect(result.current.tokenFetchState).toBe("FETCHED");
        expect(result.current.token).toEqual(token);
      }
    });
  });

  it("calls fetchToken on mount", async () => {
    const fetchToken = vi.fn().mockResolvedValue(createToken());

    renderHook(() => useTokenContext(), {
      wrapper: createWrapper(fetchToken),
    });

    await waitFor(() => {
      expect(fetchToken).toHaveBeenCalledTimes(1);
    });
  });

  it("transitions to error state when fetchToken rejects", async () => {
    const fetchToken = vi.fn().mockRejectedValue(new Error("network failure"));
    const onError = vi.fn();

    const { result } = renderHook(() => useTokenContext(), {
      wrapper: createWrapper(fetchToken, onError),
    });

    await waitFor(() => {
      expect(result.current._tag).toBe("error");
      if (result.current._tag === "error") {
        expect(result.current.tokenFetchState).toBe("ERROR");
        expect(result.current.error.message).toBe("Failed to generate token");
      }
    });

    expect(onError).toHaveBeenCalled();
  });

  it("schedules token refresh before expiry", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const expiresInMs = 5 * 60 * 1000; // 5 minutes
    const firstToken = createToken(expiresInMs);
    const secondToken = createToken(expiresInMs);
    const fetchToken = vi
      .fn()
      .mockResolvedValueOnce(firstToken)
      .mockResolvedValueOnce(secondToken);

    const { result } = renderHook(() => useTokenContext(), {
      wrapper: createWrapper(fetchToken),
    });

    await waitFor(() => {
      expect(result.current._tag).toBe("success");
      if (result.current._tag === "success") {
        expect(result.current.token).toEqual(firstToken);
      }
    });

    // Advance time to 1 minute before expiry (the refresh trigger point)
    act(() => {
      vi.advanceTimersByTime(expiresInMs - 60000 + 100);
    });

    await waitFor(() => {
      expect(fetchToken).toHaveBeenCalledTimes(2);
    });

    vi.useRealTimers();
  });

  it("supports forceRefetch", async () => {
    const firstToken = createToken();
    const secondToken = createToken();
    const fetchToken = vi
      .fn()
      .mockResolvedValueOnce(firstToken)
      .mockResolvedValueOnce(secondToken);

    const { result } = renderHook(() => useTokenContext(), {
      wrapper: createWrapper(fetchToken),
    });

    await waitFor(() => {
      if (result.current._tag === "success") {
        expect(result.current.token).toEqual(firstToken);
      }
    });

    act(() => {
      result.current.forceRefetch();
    });

    await waitFor(() => {
      if (result.current._tag === "success") {
        expect(result.current.token).toEqual(secondToken);
      }
    });

    expect(fetchToken).toHaveBeenCalledTimes(2);
  });
});
