import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const invokeMock = vi.fn();
const signOutMock = vi.fn();
const fromMock = vi.fn();
const getSessionMock = vi.fn();
const onAuthStateChangeMock = vi.fn();

vi.mock("../utils/supabase", () => ({
  getSupabase: () => ({
    auth: {
      getSession: getSessionMock,
      onAuthStateChange: onAuthStateChangeMock,
      signOut: signOutMock,
    },
    functions: { invoke: invokeMock },
    from: fromMock,
  }),
  PROFILES_TABLE: "profiles",
}));

vi.mock("../utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

const { useAuth } = await import("../hooks/useAuth");

beforeEach(() => {
  invokeMock.mockReset();
  signOutMock.mockReset();
  fromMock.mockReset();
  getSessionMock.mockResolvedValue({ data: { session: null } });
  onAuthStateChangeMock.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
});

describe("useAuth.deleteAccount", () => {
  it("fails closed when the delete-account function returns an error", async () => {
    invokeMock.mockResolvedValue({
      data: { error: "Failed to verify billing state" },
      error: null,
    });
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.deleteAccount({ id: "user-1", email: "user@example.com" });
    });

    expect(response).toEqual({ error: "Failed to verify billing state" });
    expect(invokeMock).toHaveBeenCalledWith("delete-account", { body: {} });
    expect(fromMock).not.toHaveBeenCalled();
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("does not delete the profile or sign out on edge function transport failures", async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: { message: "Edge Function returned a non-2xx status code" },
    });
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.deleteAccount({ id: "user-1", email: "user@example.com" });
    });

    expect(response).toEqual({ error: "Edge Function returned a non-2xx status code" });
    expect(fromMock).not.toHaveBeenCalled();
    expect(signOutMock).not.toHaveBeenCalled();
  });
});
