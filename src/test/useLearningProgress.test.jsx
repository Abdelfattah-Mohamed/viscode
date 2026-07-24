import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLearningProgress } from "../hooks/useLearningProgress";

describe("useLearningProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps persisted progress isolated between signed-in users", async () => {
    const userA = { id: "user-a", email: "a@example.com", username: "Alice" };
    const userB = { id: "user-b", email: "b@example.com", username: "Bob" };
    const keyA = `viscode-learning-progress-v1:${encodeURIComponent("a@example.com")}`;
    const keyB = `viscode-learning-progress-v1:${encodeURIComponent("b@example.com")}`;

    const { result, rerender } = renderHook(({ user }) => useLearningProgress(user), {
      initialProps: { user: userA },
    });

    act(() => {
      result.current.trackProblemCompletion("two-sum", {
        confidence: "high",
        mastered: true,
        practiceMs: 120,
      });
    });

    expect(result.current.stats.completed).toBe(1);
    expect(JSON.parse(localStorage.getItem(keyA)).stats.completed).toBe(1);
    expect(localStorage.getItem("viscode-learning-progress-v1")).toBeNull();

    rerender({ user: userB });

    await waitFor(() => {
      expect(result.current.stats.completed).toBe(0);
    });

    act(() => {
      result.current.trackProblemCompletion("contains-duplicate");
    });

    const userAProgress = JSON.parse(localStorage.getItem(keyA));
    const userBProgress = JSON.parse(localStorage.getItem(keyB));

    expect(userAProgress.stats.completed).toBe(1);
    expect(userAProgress.problems["two-sum"].status).toBe("mastered");
    expect(userBProgress.stats.completed).toBe(1);
    expect(userBProgress.problems["contains-duplicate"].status).toBe("completed");
    expect(userBProgress.problems["two-sum"]).toBeUndefined();
  });

  it("does not persist guest progress to localStorage", () => {
    const { result } = renderHook(() => useLearningProgress({ username: "Guest", isGuest: true }));

    act(() => {
      result.current.trackProblemCompletion("two-sum");
    });

    expect(result.current.stats.completed).toBe(1);
    expect(localStorage.length).toBe(0);
  });
});
