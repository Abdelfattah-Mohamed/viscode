import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_PREFIX = "viscode-learning-progress-v1:";
const DAY_MS = 24 * 60 * 60 * 1000;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function storageKeyForUser(user) {
  if (!user || user.isGuest) return null;
  const identity = user.email || user.sub || user.username;
  if (!identity) return null;
  return `${STORAGE_PREFIX}${encodeURIComponent(String(identity).trim().toLowerCase())}`;
}

function readState(storageKey) {
  if (!storageKey) return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeState(storageKey, state) {
  if (!storageKey) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Ignore storage failures.
  }
}

function initialState() {
  return {
    onboarding: {
      completed: false,
      skillLevel: "beginner",
      weeklyGoal: 5,
      createdAt: new Date().toISOString(),
    },
    stats: {
      attempts: 0,
      completed: 0,
      mastered: 0,
      totalPracticeMs: 0,
      streak: 0,
      lastPracticeDay: null,
      dailyCompletions: {},
    },
    problems: {},
    reviewQueue: [],
    lifecycle: {
      lastVisitAt: new Date().toISOString(),
      lastWinbackPromptAt: null,
    },
    growth: {
      referralCode: "",
      invitedCount: 0,
      referralBonusMonths: 0,
    },
  };
}

function mergeDefaults(saved) {
  const base = initialState();
  return {
    ...base,
    ...saved,
    onboarding: { ...base.onboarding, ...(saved?.onboarding || {}) },
    stats: { ...base.stats, ...(saved?.stats || {}) },
    lifecycle: { ...base.lifecycle, ...(saved?.lifecycle || {}) },
    growth: { ...base.growth, ...(saved?.growth || {}) },
    problems: saved?.problems || {},
    reviewQueue: Array.isArray(saved?.reviewQueue) ? saved.reviewQueue : [],
  };
}

function upsertReviewItem(queue, problemId, dueAt, reason) {
  const next = queue.filter((item) => item.problemId !== problemId);
  next.push({ problemId, dueAt, reason, createdAt: new Date().toISOString() });
  return next.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

export function useLearningProgress(user) {
  const storageKey = useMemo(() => storageKeyForUser(user), [
    user?.email,
    user?.isGuest,
    user?.sub,
    user?.username,
  ]);
  const [stateRecord, setStateRecord] = useState(() => ({
    storageKey,
    state: mergeDefaults(readState(storageKey)),
  }));
  const state = stateRecord.state;
  const isGuest = !user || user.isGuest;

  useEffect(() => {
    setStateRecord({
      storageKey,
      state: mergeDefaults(readState(storageKey)),
    });
  }, [storageKey]);

  useEffect(() => {
    if (stateRecord.storageKey !== storageKey) return;
    writeState(storageKey, stateRecord.state);
  }, [stateRecord, storageKey]);

  useEffect(() => {
    if (!storageKey) return undefined;
    const handleStorage = (event) => {
      if (event.key !== storageKey) return;
      setStateRecord({
        storageKey,
        state: mergeDefaults(readState(storageKey)),
      });
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey]);

  const setProgressState = useCallback((updater) => {
    setStateRecord((prev) => ({
      ...prev,
      state: typeof updater === "function" ? updater(prev.state) : updater,
    }));
  }, []);

  const updateOnboarding = useCallback((payload) => {
    if (!storageKey) return;
    setProgressState((prev) => ({
      ...prev,
      onboarding: {
        ...prev.onboarding,
        ...payload,
        completed: true,
      },
    }));
  }, [setProgressState, storageKey]);

  const ensureReferralCode = useCallback((username) => {
    if (!storageKey) return;
    setProgressState((prev) => {
      if (prev.growth.referralCode) return prev;
      const clean = String(username || "user").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) || "user";
      const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
      return {
        ...prev,
        growth: {
          ...prev.growth,
          referralCode: `VC-${clean.toUpperCase()}-${suffix}`,
        },
      };
    });
  }, [setProgressState, storageKey]);

  const trackProblemStart = useCallback((problemId) => {
    if (!storageKey || !problemId) return;
    setProgressState((prev) => {
      const problem = prev.problems[problemId] || {};
      const problems = {
        ...prev.problems,
        [problemId]: {
          ...problem,
          status: problem.status || "attempted",
          attempts: (problem.attempts || 0) + 1,
          lastAttemptAt: new Date().toISOString(),
        },
      };
      return {
        ...prev,
        stats: { ...prev.stats, attempts: prev.stats.attempts + 1 },
        problems,
        lifecycle: { ...prev.lifecycle, lastVisitAt: new Date().toISOString() },
      };
    });
  }, [setProgressState, storageKey]);

  const trackProblemCompletion = useCallback((problemId, payload = {}) => {
    if (!storageKey || !problemId) return;
    const { confidence = "medium", practiceMs = 0, mastered = false } = payload;
    const now = new Date();
    const today = todayKey();
    setProgressState((prev) => {
      const existing = prev.problems[problemId] || {};
      const completedOnce = !!existing.completedAt;
      const dayCount = (prev.stats.dailyCompletions[today] || 0) + 1;
      const dailyCompletions = { ...prev.stats.dailyCompletions, [today]: dayCount };
      const lastDay = prev.stats.lastPracticeDay;
      let streak = prev.stats.streak || 0;
      if (!completedOnce) {
        if (!lastDay) {
          streak = 1;
        } else {
          const diff = Math.floor((new Date(today).getTime() - new Date(lastDay).getTime()) / DAY_MS);
          if (diff === 0) streak = Math.max(1, streak);
          else if (diff === 1) streak += 1;
          else streak = 1;
        }
      }
      const reviewDelayDays = confidence === "low" ? 1 : confidence === "medium" ? 3 : 7;
      const dueAt = new Date(now.getTime() + reviewDelayDays * DAY_MS).toISOString();
      const queueReason = confidence === "low" ? "low_confidence" : "scheduled_review";
      const reviewQueue = upsertReviewItem(prev.reviewQueue, problemId, dueAt, queueReason);

      return {
        ...prev,
        stats: {
          ...prev.stats,
          completed: completedOnce ? prev.stats.completed : prev.stats.completed + 1,
          mastered: mastered ? prev.stats.mastered + 1 : prev.stats.mastered,
          totalPracticeMs: prev.stats.totalPracticeMs + Math.max(0, Number(practiceMs) || 0),
          streak,
          lastPracticeDay: today,
          dailyCompletions,
        },
        problems: {
          ...prev.problems,
          [problemId]: {
            ...existing,
            status: mastered ? "mastered" : "completed",
            confidence,
            completedAt: existing.completedAt || now.toISOString(),
            lastCompletedAt: now.toISOString(),
            mastered: !!mastered || !!existing.mastered,
          },
        },
        reviewQueue,
      };
    });
  }, [setProgressState, storageKey]);

  const markMastered = useCallback((problemId) => {
    if (!storageKey || !problemId) return;
    setProgressState((prev) => {
      const existing = prev.problems[problemId] || {};
      if (existing.mastered) return prev;
      return {
        ...prev,
        stats: { ...prev.stats, mastered: prev.stats.mastered + 1 },
        problems: {
          ...prev.problems,
          [problemId]: {
            ...existing,
            status: "mastered",
            mastered: true,
            masteredAt: new Date().toISOString(),
          },
        },
      };
    });
  }, [setProgressState, storageKey]);

  const completeReview = useCallback((problemId) => {
    if (!storageKey || !problemId) return;
    setProgressState((prev) => ({
      ...prev,
      reviewQueue: prev.reviewQueue.filter((item) => item.problemId !== problemId),
    }));
  }, [setProgressState, storageKey]);

  const applyReferral = useCallback(() => {
    if (!storageKey) return;
    setProgressState((prev) => ({
      ...prev,
      growth: {
        ...prev.growth,
        invitedCount: prev.growth.invitedCount + 1,
        referralBonusMonths: prev.growth.referralBonusMonths + 1,
      },
    }));
  }, [setProgressState, storageKey]);

  const dueReviewItems = useMemo(() => {
    const nowTs = Date.now();
    return state.reviewQueue.filter((item) => new Date(item.dueAt).getTime() <= nowTs);
  }, [state.reviewQueue]);

  return {
    isGuest,
    onboarding: state.onboarding,
    stats: state.stats,
    problems: state.problems,
    reviewQueue: state.reviewQueue,
    dueReviewItems,
    lifecycle: state.lifecycle,
    growth: state.growth,
    updateOnboarding,
    ensureReferralCode,
    trackProblemStart,
    trackProblemCompletion,
    markMastered,
    completeReview,
    applyReferral,
  };
}
