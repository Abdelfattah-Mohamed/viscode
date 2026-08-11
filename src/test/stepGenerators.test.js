import { describe, it, expect } from "vitest";
import { PROBLEMS } from "../data/problems";
import {
  STEP_GENERATORS,
  generateProductExceptSelfSteps,
  generateHouseRobberSteps,
  generateJumpGameSteps,
  generateTrappingRainWaterSteps,
  generateMinStackSteps,
  MAX_PRODUCT_EXCEPT_SELF_LEN,
  MAX_HOUSE_ROBBER_LEN,
  MAX_JUMP_GAME_LEN,
  MAX_TRAPPING_RAIN_LEN,
  MAX_MIN_STACK_OPS,
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

describe("array / stack visualizer OOM caps", () => {
  it("rejects product-except-self arrays that would OOM from per-step result clones", () => {
    const nums = Array.from({ length: MAX_PRODUCT_EXCEPT_SELF_LEN + 1 }, (_, i) => i + 1);
    const steps = generateProductExceptSelfSteps({ nums });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].state.done).toBe(true);
    expect(MAX_PRODUCT_EXCEPT_SELF_LEN).toBe(256);
  });

  it("still visualizes product-except-self at the length cap", () => {
    const nums = Array.from({ length: MAX_PRODUCT_EXCEPT_SELF_LEN }, (_, i) => i + 1);
    const steps = generateProductExceptSelfSteps({ nums });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.capped).not.toBe(true);
    expect(steps[steps.length - 1].state.done).toBe(true);
  });

  it("rejects house-robber arrays that would OOM from per-step dp clones", () => {
    const nums = Array.from({ length: MAX_HOUSE_ROBBER_LEN + 1 }, (_, i) => (i % 7) + 1);
    const steps = generateHouseRobberSteps({ nums });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].state.done).toBe(true);
    expect(MAX_HOUSE_ROBBER_LEN).toBe(256);
  });

  it("still visualizes house-robber at the length cap", () => {
    const nums = Array.from({ length: MAX_HOUSE_ROBBER_LEN }, (_, i) => (i % 7) + 1);
    const steps = generateHouseRobberSteps({ nums });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.capped).not.toBe(true);
    expect(steps[steps.length - 1].state.done).toBe(true);
  });

  it("rejects jump-game arrays that would OOM from per-step nums clones", () => {
    const nums = Array.from({ length: MAX_JUMP_GAME_LEN + 1 }, () => 1);
    const steps = generateJumpGameSteps({ nums });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].state.done).toBe(true);
    expect(MAX_JUMP_GAME_LEN).toBe(256);
  });

  it("still visualizes jump-game at the length cap", () => {
    const nums = Array.from({ length: MAX_JUMP_GAME_LEN }, () => 1);
    const steps = generateJumpGameSteps({ nums });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.capped).not.toBe(true);
    expect(steps[steps.length - 1].state.done).toBe(true);
  });

  it("rejects trapping-rain-water arrays that would OOM from per-step waterAt clones", () => {
    const heights = Array.from({ length: MAX_TRAPPING_RAIN_LEN + 1 }, (_, i) => i % 5);
    const steps = generateTrappingRainWaterSteps({ heights });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].state.done).toBe(true);
    expect(MAX_TRAPPING_RAIN_LEN).toBe(256);
  });

  it("still visualizes trapping-rain-water at the length cap", () => {
    const heights = Array.from({ length: MAX_TRAPPING_RAIN_LEN }, (_, i) => i % 5);
    const steps = generateTrappingRainWaterSteps({ heights });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.capped).not.toBe(true);
    expect(steps[steps.length - 1].state.done).toBe(true);
  });

  it("rejects min-stack op lists that would OOM from per-step stack clones", () => {
    const s = Array.from({ length: MAX_MIN_STACK_OPS + 1 }, (_, i) => `push ${i}`).join(",");
    const steps = generateMinStackSteps({ s });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].state.done).toBe(true);
    expect(MAX_MIN_STACK_OPS).toBe(256);
  });

  it("still visualizes min-stack at the ops cap", () => {
    const s = Array.from({ length: MAX_MIN_STACK_OPS }, (_, i) => `push ${i}`).join(",");
    const steps = generateMinStackSteps({ s });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.capped).not.toBe(true);
    expect(steps[steps.length - 1].state.done).toBe(true);
  });
});
