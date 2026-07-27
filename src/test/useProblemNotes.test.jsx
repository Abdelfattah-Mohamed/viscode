import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const upsertMock = vi.fn();
const maybeSingleMock = vi.fn();
const eqProblemMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
const eqEmailMock = vi.fn(() => ({ eq: eqProblemMock }));
const selectMock = vi.fn(() => ({ eq: eqEmailMock }));
const fromMock = vi.fn(() => ({
  select: selectMock,
  upsert: upsertMock,
}));

vi.mock("../utils/supabase", () => ({
  getSupabase: () => ({ from: fromMock }),
  NOTES_TABLE: "user_problem_notes",
}));

const { useProblemNotes } = await import("../hooks/useProblemNotes");

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useProblemNotes", () => {
  beforeEach(() => {
    upsertMock.mockReset();
    maybeSingleMock.mockReset();
    eqProblemMock.mockClear();
    eqEmailMock.mockClear();
    selectMock.mockClear();
    fromMock.mockClear();
    upsertMock.mockResolvedValue({ error: null });
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not upsert empty notes when blur fires during problem-switch hydrate", async () => {
    const firstLoad = deferred();
    const secondLoad = deferred();
    maybeSingleMock
      .mockReturnValueOnce(firstLoad.promise)
      .mockReturnValueOnce(secondLoad.promise);

    const user = { email: "pro@example.com" };
    const { result, rerender } = renderHook(
      ({ problemId }) => useProblemNotes(user, problemId),
      { initialProps: { problemId: "two-sum" } }
    );

    await act(async () => {
      firstLoad.resolve({ data: { notes: "keep me" } });
      await firstLoad.promise;
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notes).toBe("keep me");

    rerender({ problemId: "three-sum" });
    expect(result.current.loading).toBe(true);

    // Blur/disable during hydrate must not write "" onto three-sum.
    await act(async () => {
      result.current.handleBlur();
    });
    expect(upsertMock).not.toHaveBeenCalled();

    await act(async () => {
      secondLoad.resolve({ data: { notes: "other problem notes" } });
      await secondLoad.promise;
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notes).toBe("other problem notes");
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("flushes debounced edits for the previous problem when switching", async () => {
    const firstLoad = deferred();
    const secondLoad = deferred();
    maybeSingleMock
      .mockReturnValueOnce(firstLoad.promise)
      .mockReturnValueOnce(secondLoad.promise);

    const user = { email: "pro@example.com" };
    const { result, rerender } = renderHook(
      ({ problemId }) => useProblemNotes(user, problemId),
      { initialProps: { problemId: "two-sum" } }
    );

    await act(async () => {
      firstLoad.resolve({ data: { notes: "" } });
      await firstLoad.promise;
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.handleChange({ target: { value: "draft notes" } });
    });

    rerender({ problemId: "three-sum" });

    await waitFor(() =>
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "pro@example.com",
          problem_id: "two-sum",
          notes: "draft notes",
        }),
        { onConflict: "email,problem_id" }
      )
    );

    await act(async () => {
      secondLoad.resolve({ data: { notes: "" } });
      await secondLoad.promise;
    });
  });

  it("saves on blur only after hydrate completes", async () => {
    const load = deferred();
    maybeSingleMock.mockReturnValueOnce(load.promise);

    const user = { email: "pro@example.com" };
    const { result } = renderHook(() => useProblemNotes(user, "two-sum"));

    await act(async () => {
      result.current?.handleBlur?.();
    });
    expect(upsertMock).not.toHaveBeenCalled();

    await act(async () => {
      load.resolve({ data: { notes: "hydrated" } });
      await load.promise;
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.handleChange({ target: { value: "edited" } });
      result.current.handleBlur();
    });

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "pro@example.com",
        problem_id: "two-sum",
        notes: "edited",
      }),
      { onConflict: "email,problem_id" }
    );
  });
});
