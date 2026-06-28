import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  from: vi.fn(),
}));

vi.mock("../utils/supabase", () => ({
  getSupabase: () => ({
    functions: { invoke: supabaseMocks.invoke },
    auth: {
      signOut: supabaseMocks.signOut,
      getSession: supabaseMocks.getSession,
      onAuthStateChange: supabaseMocks.onAuthStateChange,
    },
    from: supabaseMocks.from,
  }),
  PROFILES_TABLE: "profiles",
}));

vi.mock("../utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

const { useAuth } = await import("../hooks/useAuth");

describe("useAuth deleteAccount", () => {
  beforeEach(() => {
    supabaseMocks.invoke.mockReset();
    supabaseMocks.signOut.mockReset();
    supabaseMocks.getSession.mockReset();
    supabaseMocks.onAuthStateChange.mockReset();
    supabaseMocks.from.mockReset();
    supabaseMocks.getSession.mockResolvedValue({ data: { session: null } });
    supabaseMocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("fails closed when the delete-account function fails", async () => {
    supabaseMocks.invoke.mockResolvedValue({
      data: null,
      error: { message: "delete-account function is unavailable" },
    });
    const { result } = renderHook(() => useAuth());

    let response;
    await act(async () => {
      response = await result.current.deleteAccount({ id: "auth-user-1", email: "user@example.com" });
    });

    expect(response).toEqual({ error: "delete-account function is unavailable" });
    expect(supabaseMocks.from).not.toHaveBeenCalled();
    expect(supabaseMocks.signOut).not.toHaveBeenCalled();
  });

  it("signs out only after the delete-account function succeeds", async () => {
    supabaseMocks.invoke.mockResolvedValue({ data: { ok: true }, error: null });
    supabaseMocks.signOut.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth());

    let response;
    await act(async () => {
      response = await result.current.deleteAccount({ id: "auth-user-1", email: "user@example.com" });
    });

    expect(response).toEqual({ ok: true });
    expect(supabaseMocks.invoke).toHaveBeenCalledWith("delete-account", { body: {} });
    expect(supabaseMocks.signOut).toHaveBeenCalledTimes(1);
  });
});
