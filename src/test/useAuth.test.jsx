import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { useAuth } from "../hooks/useAuth";

const supabaseRef = vi.hoisted(() => ({ current: null }));

vi.mock("../utils/supabase", () => ({
  getSupabase: () => supabaseRef.current,
  PROFILES_TABLE: "profiles",
}));

vi.mock("../utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

function HookHarness({ onReady }) {
  const auth = useAuth();
  onReady(auth);
  return null;
}

function renderHookHarness() {
  let authApi;
  render(<HookHarness onReady={(auth) => { authApi = auth; }} />);
  return {
    get auth() {
      return authApi;
    },
  };
}

beforeEach(() => {
  supabaseRef.current = {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: vi.fn(async () => ({ error: null })),
    },
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(),
  };
});

describe("useAuth.deleteAccount", () => {
  it("does not delete profile rows or sign out when the delete-account function fails", async () => {
    supabaseRef.current.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: "Edge Function returned a non-2xx status code" },
    });
    const harness = renderHookHarness();

    await waitFor(() => expect(harness.auth).toBeTruthy());
    const res = await harness.auth.deleteAccount({ id: "user-1", email: "user@example.com" });

    expect(res.error).toMatch(/edge function/i);
    expect(supabaseRef.current.from).not.toHaveBeenCalled();
    expect(supabaseRef.current.auth.signOut).not.toHaveBeenCalled();
  });

  it("signs out only after the delete-account function succeeds", async () => {
    supabaseRef.current.functions.invoke.mockResolvedValue({
      data: { ok: true },
      error: null,
    });
    const harness = renderHookHarness();

    await waitFor(() => expect(harness.auth).toBeTruthy());
    const res = await harness.auth.deleteAccount({ id: "user-1", email: "user@example.com" });

    expect(res).toEqual({ ok: true });
    expect(supabaseRef.current.functions.invoke).toHaveBeenCalledWith("delete-account", { body: {} });
    expect(supabaseRef.current.auth.signOut).toHaveBeenCalledTimes(1);
  });
});
