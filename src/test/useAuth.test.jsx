import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMock = vi.hoisted(() => ({
  deleteEq: vi.fn(),
  getSession: vi.fn(),
  invoke: vi.fn(),
  onAuthStateChange: vi.fn(),
  signOut: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock("../utils/supabase", () => ({
  PROFILES_TABLE: "profiles",
  getSupabase: () => ({
    auth: {
      getSession: supabaseMock.getSession,
      onAuthStateChange: supabaseMock.onAuthStateChange,
      signOut: supabaseMock.signOut,
    },
    functions: {
      invoke: supabaseMock.invoke,
    },
    from: () => ({
      delete: () => ({
        eq: supabaseMock.deleteEq,
      }),
    }),
  }),
}));

vi.mock("../utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

const { useAuth } = await import("../hooks/useAuth");

beforeEach(() => {
  supabaseMock.deleteEq.mockReset();
  supabaseMock.getSession.mockReset();
  supabaseMock.invoke.mockReset();
  supabaseMock.onAuthStateChange.mockReset();
  supabaseMock.signOut.mockReset();
  supabaseMock.unsubscribe.mockReset();

  supabaseMock.getSession.mockResolvedValue({ data: { session: null } });
  supabaseMock.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: supabaseMock.unsubscribe } },
  });
});

describe("useAuth account deletion", () => {
  it("fails closed when the delete-account function reports an error", async () => {
    supabaseMock.invoke.mockResolvedValue({ data: { error: "Failed to cancel Stripe subscription" }, error: null });
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.deleteAccount({ id: "user-1", email: "user@example.com" });
    });

    expect(response).toEqual({ error: "Failed to cancel Stripe subscription" });
    expect(supabaseMock.deleteEq).not.toHaveBeenCalled();
    expect(supabaseMock.signOut).not.toHaveBeenCalled();
  });

  it("signs out only after the delete-account function succeeds", async () => {
    supabaseMock.invoke.mockResolvedValue({ data: { ok: true }, error: null });
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.deleteAccount({ id: "user-1", email: "user@example.com" });
    });

    expect(response).toEqual({ ok: true });
    expect(supabaseMock.deleteEq).not.toHaveBeenCalled();
    expect(supabaseMock.signOut).toHaveBeenCalledTimes(1);
  });
});
