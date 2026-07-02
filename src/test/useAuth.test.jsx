import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signOut: vi.fn(),
  from: vi.fn(),
}));

vi.mock("../utils/supabase", () => ({
  getSupabase: () => ({
    functions: { invoke: mocks.invoke },
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signOut: mocks.signOut,
    },
    from: mocks.from,
  }),
  PROFILES_TABLE: "profiles",
}));

vi.mock("../utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

const { useAuth } = await import("../hooks/useAuth");

beforeEach(() => {
  mocks.invoke.mockReset();
  mocks.getSession.mockReset();
  mocks.onAuthStateChange.mockReset();
  mocks.signOut.mockReset();
  mocks.from.mockReset();

  mocks.getSession.mockResolvedValue({ data: { session: null } });
  mocks.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
  mocks.signOut.mockResolvedValue(undefined);
});

describe("useAuth deleteAccount", () => {
  it("fails closed when the delete-account function returns an error", async () => {
    mocks.invoke.mockResolvedValue({
      data: null,
      error: {
        message: "Edge Function returned a non-2xx status code",
        context: {
          json: async () => ({ error: "Service role key is not configured" }),
        },
      },
    });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.deleteAccount({ id: "profile-1", email: "user@example.com" });
    });

    expect(response).toEqual({ error: "Service role key is not configured" });
    expect(mocks.invoke).toHaveBeenCalledWith("delete-account", { body: {} });
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it("fails closed when the delete-account function returns a data-level error", async () => {
    mocks.invoke.mockResolvedValue({
      data: { error: "Failed to delete account" },
      error: null,
    });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.deleteAccount({ id: "profile-1", email: "user@example.com" });
    });

    expect(response).toEqual({ error: "Failed to delete account" });
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it("signs out locally after the delete-account function succeeds", async () => {
    mocks.invoke.mockResolvedValue({ data: { ok: true }, error: null });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.deleteAccount({ id: "profile-1", email: "user@example.com" });
    });

    expect(response).toEqual({ ok: true });
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
