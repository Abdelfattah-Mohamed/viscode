import { describe, it, expect } from "vitest";
import { PROBLEMS } from "../data/problems";
import {
  STEP_GENERATORS,
  MAX_CONTAINS_DUPLICATE_LEN,
  MAX_LONGEST_CONSECUTIVE_LEN,
  MAX_VALID_PARENTHESES_LEN,
  MAX_FIND_MEDIAN_LEN,
  MAX_ISLAND_GRID_CELLS,
  generateContainsDuplicateSteps,
  generateLongestConsecutiveSteps,
  generateValidParenthesesSteps,
  generateFindMedianSteps,
  generateNumberOfIslandsSteps,
  generateMaxAreaOfIslandSteps,
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

describe("set / string / island visualizer OOM caps", () => {
  it("rejects contains-duplicate arrays that would OOM from per-step seen clones", () => {
    const nums = Array.from({ length: MAX_CONTAINS_DUPLICATE_LEN + 1 }, (_, i) => i);
    const steps = generateContainsDuplicateSteps({ nums });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].state.done).toBe(true);
    expect(MAX_CONTAINS_DUPLICATE_LEN).toBe(256);
  });

  it("still visualizes contains-duplicate at the length cap", () => {
    const nums = Array.from({ length: MAX_CONTAINS_DUPLICATE_LEN }, (_, i) => i);
    const steps = generateContainsDuplicateSteps({ nums });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.capped).not.toBe(true);
    expect(steps[steps.length - 1].state.done).toBe(true);
  });

  it("rejects longest-consecutive arrays that would OOM from per-step setArr clones", () => {
    const nums = Array.from({ length: MAX_LONGEST_CONSECUTIVE_LEN + 1 }, (_, i) => i);
    const steps = generateLongestConsecutiveSteps({ nums });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].state.done).toBe(true);
    expect(MAX_LONGEST_CONSECUTIVE_LEN).toBe(512);
  });

  it("still visualizes longest-consecutive at the length cap", () => {
    const nums = Array.from({ length: MAX_LONGEST_CONSECUTIVE_LEN }, (_, i) => i);
    const steps = generateLongestConsecutiveSteps({ nums });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.capped).not.toBe(true);
    expect(steps[steps.length - 1].state.done).toBe(true);
  });

  it("rejects valid-parentheses strings that would OOM from per-step stack clones", () => {
    const s = "(".repeat(MAX_VALID_PARENTHESES_LEN + 1);
    const steps = generateValidParenthesesSteps({ s });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].state.done).toBe(true);
    expect(MAX_VALID_PARENTHESES_LEN).toBe(512);
  });

  it("still visualizes valid-parentheses at the length cap", () => {
    const s = "(".repeat(MAX_VALID_PARENTHESES_LEN / 2) + ")".repeat(MAX_VALID_PARENTHESES_LEN / 2);
    const steps = generateValidParenthesesSteps({ s });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.capped).not.toBe(true);
    expect(steps[steps.length - 1].state.done).toBe(true);
  });

  it("rejects find-median streams that would OOM from per-add heap clones", () => {
    const nums = Array.from({ length: MAX_FIND_MEDIAN_LEN + 1 }, (_, i) => i);
    const steps = generateFindMedianSteps({ nums });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].state.done).toBe(true);
    expect(MAX_FIND_MEDIAN_LEN).toBe(256);
  });

  it("still visualizes find-median at the length cap", () => {
    const nums = Array.from({ length: MAX_FIND_MEDIAN_LEN }, (_, i) => i);
    const steps = generateFindMedianSteps({ nums });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.capped).not.toBe(true);
    expect(steps[steps.length - 1].state.done).toBe(true);
  });

  it("rejects island grids that would OOM from per-visit visited clones", () => {
    const side = Math.ceil(Math.sqrt(MAX_ISLAND_GRID_CELLS)) + 1;
    const grid = Array.from({ length: side * side }, () => 1);
    for (const generate of [generateNumberOfIslandsSteps, generateMaxAreaOfIslandSteps]) {
      const steps = generate({ grid, rows: side });
      expect(steps).toHaveLength(1);
      expect(steps[0].state.capped).toBe(true);
      expect(steps[0].state.done).toBe(true);
    }
    expect(MAX_ISLAND_GRID_CELLS).toBe(400);
  });

  it("still visualizes island grids at the cell cap", () => {
    const side = Math.floor(Math.sqrt(MAX_ISLAND_GRID_CELLS));
    const grid = Array.from({ length: side * side }, () => 1);
    for (const generate of [generateNumberOfIslandsSteps, generateMaxAreaOfIslandSteps]) {
      const steps = generate({ grid, rows: side });
      expect(steps.length).toBeGreaterThan(1);
      expect(steps[steps.length - 1].state.capped).not.toBe(true);
      expect(steps[steps.length - 1].state.done).toBe(true);
    }
  });
});
