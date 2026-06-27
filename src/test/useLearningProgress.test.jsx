import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLearningProgress } from "../hooks/useLearningProgress";

const STORAGE_KEY = "viscode-learning-progress-v1";

function storedProgress(identity) {
  return JSON.parse(localStorage.getItem(`${STORAGE_KEY}:${encodeURIComponent(identity)}`));
}

describe("useLearningProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("isolates progress by signed-in user when accounts change in the same session", async () => {
    const userA = { id: "user-a", email: "a@example.com" };
    const userB = { id: "user-b", email: "b@example.com" };

    const { result, rerender } = renderHook(({ user }) => useLearningProgress(user), {
      initialProps: { user: userA },
    });

    act(() => {
      result.current.trackProblemCompletion("two-sum");
    });
    expect(result.current.stats.completed).toBe(1);
    expect(storedProgress("user-a").stats.completed).toBe(1);

    rerender({ user: userB });
    await waitFor(() => expect(result.current.stats.completed).toBe(0));

    act(() => {
      result.current.trackProblemCompletion("valid-parentheses");
    });
    expect(result.current.stats.completed).toBe(1);

    expect(storedProgress("user-a").problems["two-sum"]).toBeTruthy();
    expect(storedProgress("user-a").problems["valid-parentheses"]).toBeUndefined();
    expect(storedProgress("user-b").problems["two-sum"]).toBeUndefined();
    expect(storedProgress("user-b").problems["valid-parentheses"]).toBeTruthy();
  });
});
