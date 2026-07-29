import { describe, it, expect } from "vitest";
import { PROBLEMS } from "../data/problems";
import {
  STEP_GENERATORS,
  generateParenthesesSteps,
  generatePermutationsSteps,
  generateSubsetsSteps,
  generateCombinationSumSteps,
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

describe("backtracking generators reject unbounded Pro custom inputs", () => {
  it("caps generate-parentheses n so Catalan growth cannot OOM the tab", () => {
    const steps = generateParenthesesSteps({ n: 12 });
    expect(steps.some((s) => /capped/i.test(s.description))).toBe(true);
    expect(steps[steps.length - 1].state.n).toBe(6);
    expect(steps.length).toBeLessThan(2000);
  });

  it("caps permutations input length", () => {
    const steps = generatePermutationsSteps({ nums: [1, 2, 3, 4, 5, 6, 7, 8] });
    expect(steps.some((s) => /capped/i.test(s.description))).toBe(true);
    expect(steps[steps.length - 1].state.nums).toEqual([1, 2, 3, 4, 5]);
    expect(steps.length).toBeLessThan(5000);
  });

  it("caps subsets input length", () => {
    const steps = generateSubsetsSteps({ nums: Array.from({ length: 20 }, (_, i) => i + 1) });
    expect(steps.some((s) => /capped/i.test(s.description))).toBe(true);
    expect(steps[steps.length - 1].state.nums).toHaveLength(8);
    expect(steps.length).toBeLessThan(4000);
  });

  it("caps combination-sum target and candidate count", () => {
    const steps = generateCombinationSumSteps({
      nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      target: 50,
    });
    expect(steps.some((s) => /capped/i.test(s.description))).toBe(true);
    expect(steps[steps.length - 1].state.target).toBe(15);
    expect(steps[steps.length - 1].state.c).toHaveLength(6);
    expect(steps.length).toBeLessThan(8000);
  });
});
