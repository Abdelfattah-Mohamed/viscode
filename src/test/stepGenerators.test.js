import { describe, it, expect } from "vitest";
import { PROBLEMS } from "../data/problems";
import {
  STEP_GENERATORS,
  MAX_TWO_SUM_LEN,
  MAX_MAX_SUBARRAY_LEN,
  MAX_TOP_K_LEN,
  MAX_INTERVAL_VIS_COUNT,
  generateTwoSumSteps,
  generateMaxSubarraySteps,
  generateTopKFrequentSteps,
  generateNonOverlappingIntervalsSteps,
  generateMeetingRoomsSteps,
  generateMeetingRoomsIISteps,
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

describe("array / interval visualizer OOM caps", () => {
  it("rejects two-sum arrays that would OOM from per-step map clones", () => {
    const nums = Array.from({ length: MAX_TWO_SUM_LEN + 1 }, (_, i) => i + 1);
    const steps = generateTwoSumSteps({ nums, target: -1 });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].state.done).toBe(true);
    expect(MAX_TWO_SUM_LEN).toBe(256);
  });

  it("still visualizes two-sum at the length cap", () => {
    const nums = Array.from({ length: MAX_TWO_SUM_LEN }, (_, i) => i + 1);
    const steps = generateTwoSumSteps({ nums, target: -1 });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[0].state.capped).toBeUndefined();
  });

  it("rejects max-subarray arrays that would OOM from per-step highlight clones", () => {
    const nums = Array.from({ length: MAX_MAX_SUBARRAY_LEN + 1 }, () => 1);
    const steps = generateMaxSubarraySteps({ nums });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].state.done).toBe(true);
    expect(MAX_MAX_SUBARRAY_LEN).toBe(256);
  });

  it("still visualizes max-subarray at the length cap", () => {
    const nums = Array.from({ length: MAX_MAX_SUBARRAY_LEN }, () => 1);
    const steps = generateMaxSubarraySteps({ nums });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.done).toBe(true);
    expect(steps[0].state.capped).toBeUndefined();
  });

  it("rejects top-k arrays that would OOM from per-unique heap clones", () => {
    const nums = Array.from({ length: MAX_TOP_K_LEN + 1 }, (_, i) => i);
    const steps = generateTopKFrequentSteps({ nums, k: 3 });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].state.done).toBe(true);
    expect(MAX_TOP_K_LEN).toBe(256);
  });

  it("still visualizes top-k at the length cap", () => {
    const nums = Array.from({ length: MAX_TOP_K_LEN }, (_, i) => i % 10);
    const steps = generateTopKFrequentSteps({ nums, k: 3 });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[0].state.capped).toBeUndefined();
  });

  it("rejects interval lists that would OOM from per-step interval clones", () => {
    const nums = Array.from({ length: (MAX_INTERVAL_VIS_COUNT + 1) * 2 }, (_, i) => i);
    for (const gen of [
      generateNonOverlappingIntervalsSteps,
      generateMeetingRoomsSteps,
      generateMeetingRoomsIISteps,
    ]) {
      const steps = gen({ nums });
      expect(steps).toHaveLength(1);
      expect(steps[0].state.capped).toBe(true);
      expect(steps[0].state.done).toBe(true);
    }
    expect(MAX_INTERVAL_VIS_COUNT).toBe(256);
  });

  it("still visualizes interval problems at the count cap", () => {
    const nums = Array.from({ length: MAX_INTERVAL_VIS_COUNT * 2 }, (_, i) => i);
    for (const gen of [
      generateNonOverlappingIntervalsSteps,
      generateMeetingRoomsSteps,
      generateMeetingRoomsIISteps,
    ]) {
      const steps = gen({ nums });
      expect(steps.length).toBeGreaterThan(1);
      expect(steps[0].state.capped).toBeUndefined();
    }
  });
});
