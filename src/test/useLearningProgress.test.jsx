import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLearningProgress } from "../hooks/useLearningProgress";

function progressKey(identity) {
  return `viscode-learning-progress-v1:${encodeURIComponent(identity)}`;
}

describe("useLearningProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores signed-in progress under the current user's scoped key", async () => {
    const userA = { id: "user-a", email: "a@example.com", username: "Alice" };
    const userB = { id: "user-b", email: "b@example.com", username: "Bob" };
    const { result, rerender } = renderHook(({ user }) => useLearningProgress(user), {
      initialProps: { user: userA },
    });

    act(() => {
      result.current.trackProblemCompletion("two-sum");
    });

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem(progressKey("user-a")));
      expect(saved.stats.completed).toBe(1);
    });

    rerender({ user: userB });

    await waitFor(() => {
      expect(result.current.stats.completed).toBe(0);
    });

    act(() => {
      result.current.trackProblemStart("valid-parentheses");
    });

    await waitFor(() => {
      const savedA = JSON.parse(localStorage.getItem(progressKey("user-a")));
      const savedB = JSON.parse(localStorage.getItem(progressKey("user-b")));
      expect(savedA.stats.completed).toBe(1);
      expect(savedB.stats.attempts).toBe(1);
      expect(savedB.stats.completed).toBe(0);
    });
  });

  it("does not persist progress without a signed-in account identity", async () => {
    const { result } = renderHook(() => useLearningProgress({ username: "Guest", isGuest: true }));

    act(() => {
      result.current.trackProblemCompletion("two-sum");
    });

    await waitFor(() => {
      expect(localStorage.length).toBe(0);
      expect(result.current.stats.completed).toBe(1);
    });
  });
});
