import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  signOut: vi.fn(),
  from: vi.fn(),
}));

vi.mock("../utils/supabase", () => ({
  getSupabase: () => ({
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: mocks.signOut,
    },
    functions: { invoke: mocks.invoke },
    from: mocks.from,
  }),
  PROFILES_TABLE: "profiles",
}));

vi.mock("../utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

const { useAuth } = await import("../hooks/useAuth");

describe("useAuth", () => {
  beforeEach(() => {
    mocks.invoke.mockReset();
    mocks.signOut.mockReset();
    mocks.from.mockReset();
  });

  it("does not delete the profile row when service-role account deletion fails", async () => {
    mocks.invoke.mockResolvedValue({ data: null, error: { message: "Function unavailable" } });
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.deleteAccount({ id: "user-1", email: "user@example.com" });
    });

    expect(response).toEqual({ error: "Function unavailable" });
    expect(mocks.invoke).toHaveBeenCalledWith("delete-account", { body: {} });
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
