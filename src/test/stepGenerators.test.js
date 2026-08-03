import { describe, it, expect } from "vitest";
import { PROBLEMS } from "../data/problems";
import {
  STEP_GENERATORS,
  generateCountingBitsSteps,
  generateDecodeWaysSteps,
  generateWordBreakSteps,
  MAX_COUNTING_BITS_N,
  MAX_DECODE_WAYS_LEN,
  MAX_WORD_BREAK_LEN,
} from "../data/stepGenerators";
import { SORTING_STEP_GENERATORS } from "../data/sortingStepGenerators";
import { generateConstructTreeSteps } from "../data/blind75MissingStepGenerators";

describe("step generators", () => {
  it("every problem has a registered step generator", () => {
    const missing = Object.keys(PROBLEMS).filter((id) => !STEP_GENERATORS[id]);
    expect(missing).toEqual([]);
  });

  it("every generator has a problem definition", () => {
    const orphans = Object.keys(STEP_GENERATORS).filter((id) => !PROBLEMS[id]);
    expect(orphans).toEqual([]);
  });

  it.each(Object.keys(PROBLEMS))("%s produces valid steps for its default input", (id) => {
    const generator = STEP_GENERATORS[id];
    const steps = generator(PROBLEMS[id].defaultInput || {});
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(typeof step.stepType).toBe("string");
      expect(step.stepType.length).toBeGreaterThan(0);
      expect(typeof step.description).toBe("string");
    }
  });
});

describe("sorting generators produce sorted output", () => {
  const cases = Object.entries(SORTING_STEP_GENERATORS).filter(([id]) => id !== "maximum-gap");

  it.each(cases)("%s ends with a sorted array", (id, generator) => {
    const input = PROBLEMS[id]?.defaultInput || { nums: [5, 2, 9, 1, 7] };
    const steps = generator(input);
    const last = steps[steps.length - 1];
    expect(last.stepType).toBe("done");
    const finalNums = last.state.nums;
    const sorted = [...finalNums].sort((a, b) => a - b);
    expect(finalNums).toEqual(sorted);
  });

  it("maximum-gap reports the correct answer", () => {
    const steps = SORTING_STEP_GENERATORS["maximum-gap"]({ nums: [3, 6, 9, 1] });
    const last = steps[steps.length - 1];
    expect(last.state.aux).toEqual([3]);
  });
});

describe("construct tree steps", () => {
  it("builds the tree incrementally in step state", () => {
    const steps = generateConstructTreeSteps({
      preorder: [3, 9, 20, 15, 7],
      inorder: [9, 3, 15, 20, 7],
    });
    expect(steps[0].state.root).toEqual([]);
    expect(steps[1].state.root).toEqual([3]);
    expect(steps[steps.length - 1].state.root).toEqual([3, 9, 20, null, null, 15, 7]);
  });
});

describe("visualizer input caps", () => {
  it("rejects counting-bits n that would OOM from Θ(n²) ans snapshots", () => {
    const steps = generateCountingBitsSteps({ n: 5000 });
    expect(steps).toHaveLength(1);
    expect(steps[0].description).toMatch(/exceeds visualization cap/i);
    expect(steps[0].state.capped).toBe(true);
  });

  it("still computes counting-bits within the allowed range", () => {
    const steps = generateCountingBitsSteps({ n: 5 });
    const last = steps[steps.length - 1];
    expect(last.stepType).toBe("done");
    expect(last.state.nums).toEqual([0, 1, 1, 2, 1, 2]);
    expect(MAX_COUNTING_BITS_N).toBeGreaterThanOrEqual(5);
  });

  it("rejects word-break strings that would OOM from Θ(n³) step clones", () => {
    const steps = generateWordBreakSteps({ s: "a".repeat(250), dict: "b" });
    expect(steps).toHaveLength(1);
    expect(steps[0].description).toMatch(/exceeds visualization cap/i);
    expect(steps[0].state.capped).toBe(true);
  });

  it("still solves word-break within the allowed length", () => {
    const steps = generateWordBreakSteps({ s: "leetcode", dict: "leet,code" });
    const last = steps[steps.length - 1];
    expect(last.state.dp[last.state.dp.length - 1]).toBe(true);
    expect(MAX_WORD_BREAK_LEN).toBeGreaterThanOrEqual("leetcode".length);
  });

  it("rejects decode-ways strings that would OOM from Θ(n²) dp snapshots", () => {
    const steps = generateDecodeWaysSteps({ s: "1".repeat(2000) });
    expect(steps).toHaveLength(1);
    expect(steps[0].description).toMatch(/exceeds visualization cap/i);
    expect(steps[0].state.capped).toBe(true);
  });

  it("still decodes within the allowed length", () => {
    const steps = generateDecodeWaysSteps({ s: "12" });
    const last = steps[steps.length - 1];
    expect(last.state.dp[2]).toBe(2);
    expect(MAX_DECODE_WAYS_LEN).toBeGreaterThanOrEqual(2);
  });
});
