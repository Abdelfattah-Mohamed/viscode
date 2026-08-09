import { describe, it, expect } from "vitest";
import { PROBLEMS } from "../data/problems";
import {
  STEP_GENERATORS,
  generateClimbingStairsSteps,
  generateCourseScheduleSteps,
  MAX_CLIMBING_STAIRS_N,
  MAX_COURSE_SCHEDULE_N,
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

describe("OOM input caps", () => {
  it("rejects climbing-stairs n that would OOM from per-step object growth", () => {
    const steps = generateClimbingStairsSteps({ n: MAX_CLIMBING_STAIRS_N + 1 });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].state.done).toBe(true);
    expect(MAX_CLIMBING_STAIRS_N).toBe(128);
  });

  it("still visualizes climbing-stairs at the n cap", () => {
    const steps = generateClimbingStairsSteps({ n: MAX_CLIMBING_STAIRS_N });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.capped).not.toBe(true);
    expect(steps[steps.length - 1].state.done).toBe(true);
  });

  it("rejects course-schedule graphs that would OOM from per-step edge/state clones", () => {
    const n = MAX_COURSE_SCHEDULE_N + 1;
    const nums = [];
    for (let i = 0; i < n - 1; i++) nums.push(i + 1, i);
    const steps = generateCourseScheduleSteps({ n, nums });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].state.done).toBe(true);
    expect(MAX_COURSE_SCHEDULE_N).toBe(100);
  });

  it("still visualizes course-schedule at the n cap", () => {
    const n = MAX_COURSE_SCHEDULE_N;
    const nums = [];
    for (let i = 0; i < n - 1; i++) nums.push(i + 1, i);
    const steps = generateCourseScheduleSteps({ n, nums });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.capped).not.toBe(true);
    expect(steps[steps.length - 1].state.done).toBe(true);
    expect(steps[steps.length - 1].state.canFinish).toBe(true);
  });
});
