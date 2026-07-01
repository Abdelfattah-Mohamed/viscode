import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../hooks/useAuth";

const supabase = vi.hoisted(() => ({
  invoke: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  from: vi.fn(),
}));

vi.mock("../utils/supabase", () => ({
  getSupabase: () => ({
    functions: { invoke: supabase.invoke },
    auth: {
      getSession: supabase.getSession,
      onAuthStateChange: supabase.onAuthStateChange,
      signOut: supabase.signOut,
    },
    from: supabase.from,
  }),
  PROFILES_TABLE: "profiles",
}));

vi.mock("../utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

describe("useAuth", () => {
  beforeEach(() => {
    supabase.invoke.mockReset();
    supabase.signOut.mockReset();
    supabase.getSession.mockReset();
    supabase.onAuthStateChange.mockReset();
    supabase.from.mockReset();

    supabase.getSession.mockResolvedValue({ data: { session: null } });
    supabase.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    supabase.signOut.mockResolvedValue({});
  });

  it("does not report account deletion success when the server delete fails", async () => {
    supabase.invoke.mockResolvedValue({
      data: null,
      error: { message: "delete-account function failed" },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let response;
    await act(async () => {
      response = await result.current.deleteAccount({
        id: "profile-1",
        email: "user@example.com",
      });
    });

    expect(response).toEqual({ error: "delete-account function failed" });
    expect(supabase.signOut).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
