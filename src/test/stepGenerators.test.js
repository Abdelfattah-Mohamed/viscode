import { describe, it, expect } from "vitest";
import { PROBLEMS } from "../data/problems";
import {
  STEP_GENERATORS,
  MAX_REVERSE_LL_LEN,
  MAX_REORDER_LIST_LEN,
  MAX_LIS_LEN,
  MAX_EVAL_RPN_TOKENS,
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

describe("list / LIS / RPN visualizer OOM caps", () => {
  it("rejects reverse-linked-list lengths that would OOM from per-step reversed clones", () => {
    const n = MAX_REVERSE_LL_LEN + 1;
    const steps = STEP_GENERATORS["reverse-linked-list"]({ head: Array.from({ length: n }, (_, i) => i) });
    expect(steps).toHaveLength(1);
    expect(steps[0].stepType).toBe("done");
    expect(steps[0].state.capped).toBe(true);
    expect(MAX_REVERSE_LL_LEN).toBe(256);
  });

  it("still visualizes reverse-linked-list at the length cap", () => {
    const steps = STEP_GENERATORS["reverse-linked-list"]({
      head: Array.from({ length: MAX_REVERSE_LL_LEN }, (_, i) => i + 1),
    });
    expect(steps[0].state.capped).toBeUndefined();
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.done).toBe(true);
    expect(steps[steps.length - 1].state.reversed).toHaveLength(MAX_REVERSE_LL_LEN);
  });

  it("rejects reorder-list lengths that would OOM from per-step list clones", () => {
    const n = MAX_REORDER_LIST_LEN + 1;
    const steps = STEP_GENERATORS["reorder-list"]({ head: Array.from({ length: n }, (_, i) => i) });
    expect(steps).toHaveLength(1);
    expect(steps[0].stepType).toBe("done");
    expect(steps[0].state.capped).toBe(true);
    expect(MAX_REORDER_LIST_LEN).toBe(256);
  });

  it("still visualizes reorder-list at the length cap", () => {
    const steps = STEP_GENERATORS["reorder-list"]({
      head: Array.from({ length: MAX_REORDER_LIST_LEN }, (_, i) => i + 1),
    });
    expect(steps[0].state.capped).toBeUndefined();
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.done).toBe(true);
    expect(steps[steps.length - 1].state.merged).toHaveLength(MAX_REORDER_LIST_LEN);
  });

  it("rejects LIS arrays that would OOM from per-index nums clones", () => {
    const n = MAX_LIS_LEN + 1;
    const steps = STEP_GENERATORS["longest-increasing-subsequence"]({
      nums: Array.from({ length: n }, (_, i) => i),
    });
    expect(steps).toHaveLength(1);
    expect(steps[0].stepType).toBe("done");
    expect(steps[0].state.capped).toBe(true);
    expect(MAX_LIS_LEN).toBe(256);
  });

  it("still visualizes LIS at the length cap", () => {
    const steps = STEP_GENERATORS["longest-increasing-subsequence"]({
      nums: Array.from({ length: MAX_LIS_LEN }, (_, i) => i + 1),
    });
    expect(steps[0].state.capped).toBeUndefined();
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.done).toBe(true);
    expect(steps[steps.length - 1].state.tails).toHaveLength(MAX_LIS_LEN);
  });

  it("rejects eval-rpn token counts that would OOM from per-token clones", () => {
    const n = MAX_EVAL_RPN_TOKENS + 1;
    const s = Array.from({ length: n }, (_, i) => String(i)).join(",");
    const steps = STEP_GENERATORS["eval-rpn"]({ s });
    expect(steps).toHaveLength(1);
    expect(steps[0].stepType).toBe("done");
    expect(steps[0].state.capped).toBe(true);
    expect(MAX_EVAL_RPN_TOKENS).toBe(256);
  });

  it("still visualizes eval-rpn at the token cap", () => {
    const s = Array.from({ length: MAX_EVAL_RPN_TOKENS }, (_, i) => String(i)).join(",");
    const steps = STEP_GENERATORS["eval-rpn"]({ s });
    expect(steps[0].state.capped).toBeUndefined();
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.done).toBe(true);
    expect(steps[steps.length - 1].state.stack).toHaveLength(MAX_EVAL_RPN_TOKENS);
  });
});
