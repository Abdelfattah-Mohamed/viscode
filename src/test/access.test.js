import { describe, it, expect } from "vitest";
import { canAccessProblem, isFreeProblem, FREE_CATEGORY } from "../utils/access";
import { PROBLEMS } from "../data/problems";

describe("paywall gating", () => {
  const freeId = Object.keys(PROBLEMS).find((id) => PROBLEMS[id].category === FREE_CATEGORY);
  const paidId = Object.keys(PROBLEMS).find((id) => PROBLEMS[id].category !== FREE_CATEGORY);

  it("library contains both free and paid problems", () => {
    expect(freeId).toBeTruthy();
    expect(paidId).toBeTruthy();
  });

  it("free problems are accessible without Pro", () => {
    expect(isFreeProblem(freeId)).toBe(true);
    expect(canAccessProblem(freeId, false)).toBe(true);
  });

  it("paid problems are blocked without Pro", () => {
    expect(isFreeProblem(paidId)).toBe(false);
    expect(canAccessProblem(paidId, false)).toBe(false);
  });

  it("Pro users access everything", () => {
    expect(canAccessProblem(freeId, true)).toBe(true);
    expect(canAccessProblem(paidId, true)).toBe(true);
  });

  it("unknown problem ids are never accessible without Pro", () => {
    expect(canAccessProblem("does-not-exist", false)).toBe(false);
  });
});
