import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  from: vi.fn(),
  unsubscribe: vi.fn(),
  supabase: null,
}));

vi.mock("../utils/supabase", () => ({
  getSupabase: () => mocks.supabase,
  PROFILES_TABLE: "profiles",
}));

vi.mock("../utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

const { useAuth } = await import("../hooks/useAuth");

beforeEach(() => {
  mocks.invoke.mockReset();
  mocks.signOut.mockReset();
  mocks.getSession.mockReset();
  mocks.onAuthStateChange.mockReset();
  mocks.from.mockReset();
  mocks.unsubscribe.mockReset();

  mocks.getSession.mockResolvedValue({ data: { session: null } });
  mocks.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mocks.unsubscribe } },
  });
  mocks.supabase = {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signOut: mocks.signOut,
    },
    functions: { invoke: mocks.invoke },
    from: mocks.from,
  };
});

afterEach(() => {
  cleanup();
});

describe("useAuth.deleteAccount", () => {
  it("does not delete profile data or sign out when the delete-account function fails", async () => {
    mocks.invoke.mockResolvedValue({
      data: { error: "Failed to cancel subscription" },
      error: null,
    });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.deleteAccount({ id: "user-1", email: "user@example.com" });
    });

    expect(response).toEqual({ error: "Failed to cancel subscription" });
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it("signs out only after the delete-account function succeeds", async () => {
    mocks.invoke.mockResolvedValue({ data: { ok: true }, error: null });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.deleteAccount({ id: "user-1", email: "user@example.com" });
    });

    expect(response).toEqual({ ok: true });
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
  });
});
