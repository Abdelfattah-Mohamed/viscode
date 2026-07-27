import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const thenable = (value) => ({
  then: (onFulfilled) => Promise.resolve(value).then(onFulfilled),
});

const deleteEqFlagType = vi.fn(() => thenable({ error: null }));
const deleteEqProblem = vi.fn(() => ({ eq: deleteEqFlagType }));
const deleteEqEmail = vi.fn(() => ({ eq: deleteEqProblem }));
const deleteMock = vi.fn(() => ({ eq: deleteEqEmail }));
const insertMock = vi.fn(() => thenable({ error: null }));

let selectResult;

const selectEqEmail = vi.fn(() => selectResult);
const selectMock = vi.fn(() => ({ eq: selectEqEmail }));
const fromMock = vi.fn(() => ({
  select: selectMock,
  delete: deleteMock,
  insert: insertMock,
}));

vi.mock("../utils/supabase", () => ({
  getSupabase: () => ({ from: fromMock }),
  FLAGS_TABLE: "user_problem_flags",
}));

const { useFavorites } = await import("../hooks/useFavorites");

function deferred() {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("useFavorites", () => {
  beforeEach(() => {
    localStorage.clear();
    insertMock.mockClear();
    deleteMock.mockClear();
    selectMock.mockClear();
    fromMock.mockClear();
    selectResult = Promise.resolve({ data: [] });
  });

  it("does not let a slow server hydrate overwrite a toggle made while fetching", async () => {
    const load = deferred();
    selectResult = load.promise;

    localStorage.setItem(
      "vc:flags:user@example.com",
      JSON.stringify({ favorite: ["two-sum"], flagged: [] })
    );

    const { result } = renderHook(() =>
      useFavorites({ email: "user@example.com" })
    );

    expect(result.current.favorites).toEqual(["two-sum"]);

    await act(async () => {
      result.current.toggleFavorite("three-sum");
    });
    expect(result.current.favorites).toEqual(["two-sum", "three-sum"]);

    await act(async () => {
      load.resolve({
        data: [
          { problem_id: "two-sum", flag_type: "favorite" },
          // three-sum not yet visible in this stale snapshot
        ],
      });
      await load.promise;
    });

    // Stale hydrate must not clobber the in-flight toggle.
    await waitFor(() => {
      expect(result.current.favorites).toEqual(["two-sum", "three-sum"]);
    });
    expect(JSON.parse(localStorage.getItem("vc:flags:user@example.com"))).toEqual({
      favorite: ["two-sum", "three-sum"],
      flagged: [],
    });
  });
});
