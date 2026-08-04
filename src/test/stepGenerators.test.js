import { describe, it, expect } from "vitest";
import { PROBLEMS } from "../data/problems";
import {
  STEP_GENERATORS,
  generatePacificAtlanticSteps,
  MAX_PACIFIC_ATLANTIC_CELLS,
} from "../data/stepGenerators";
import {
  SORTING_STEP_GENERATORS,
  bubbleSortSteps,
  selectionSortSteps,
  insertionSortSteps,
  maximumGapSteps,
  MAX_SORT_VIS_LEN,
} from "../data/sortingStepGenerators";
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
  const oversizedNums = Array.from({ length: 512 }, (_, i) => 512 - i);

  it.each([
    ["bubble-sort", bubbleSortSteps],
    ["selection-sort", selectionSortSteps],
    ["insertion-sort", insertionSortSteps],
    ["maximum-gap", maximumGapSteps],
  ])("%s rejects arrays that would OOM from Θ(n³) step clones", (_id, generator) => {
    const steps = generator({ nums: oversizedNums });
    expect(steps).toHaveLength(1);
    expect(steps[0].description).toMatch(/exceeds visualization cap/i);
    expect(steps[0].state.capped).toBe(true);
  });

  it("still sorts within the allowed length", () => {
    const nums = [5, 3, 8, 4, 2];
    const steps = bubbleSortSteps({ nums });
    const last = steps[steps.length - 1];
    expect(last.stepType).toBe("done");
    expect(last.state.nums).toEqual([2, 3, 4, 5, 8]);
    expect(MAX_SORT_VIS_LEN).toBeGreaterThanOrEqual(nums.length);
  });

  it("rejects pacific-atlantic grids that would OOM from per-visit matrix clones", () => {
    const side = 60;
    const grid = Array.from({ length: side * side }, () => 1);
    const steps = generatePacificAtlanticSteps({ grid, rows: side });
    expect(steps).toHaveLength(1);
    expect(steps[0].description).toMatch(/exceeds visualization cap/i);
    expect(steps[0].state.capped).toBe(true);
    expect(side * side).toBeGreaterThan(MAX_PACIFIC_ATLANTIC_CELLS);
  });

  it("still solves pacific-atlantic within the allowed cell count", () => {
    const steps = generatePacificAtlanticSteps(PROBLEMS["pacific-atlantic"].defaultInput);
    const last = steps[steps.length - 1];
    expect(last.stepType).toBe("done");
    expect(last.state.capped).not.toBe(true);
    expect(last.state.result?.length).toBeGreaterThan(0);
  });
});
