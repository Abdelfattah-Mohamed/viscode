import { describe, it, expect } from "vitest";
import { PROBLEMS } from "../data/problems";
import {
  STEP_GENERATORS,
  MAX_MERGE_TWO_LEN,
  MAX_REMOVE_NTH_LEN,
  MAX_TREE_VIS_LEN,
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

describe("list / tree visualizer OOM caps", () => {
  it("rejects merge-two-sorted-lists lengths that would OOM from per-step merged clones", () => {
    const n = MAX_MERGE_TWO_LEN + 1;
    const steps = STEP_GENERATORS["merge-two-sorted-lists"]({
      list1: Array.from({ length: n }, (_, i) => i),
      list2: [0],
    });
    expect(steps).toHaveLength(1);
    expect(steps[0].stepType).toBe("done");
    expect(steps[0].state.capped).toBe(true);
    expect(MAX_MERGE_TWO_LEN).toBe(256);
  });

  it("still visualizes merge-two-sorted-lists at the length cap", () => {
    const list1 = Array.from({ length: MAX_MERGE_TWO_LEN }, (_, i) => i * 2);
    const list2 = Array.from({ length: MAX_MERGE_TWO_LEN }, (_, i) => i * 2 + 1);
    const steps = STEP_GENERATORS["merge-two-sorted-lists"]({ list1, list2 });
    expect(steps[0].state.capped).toBeUndefined();
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.done).toBe(true);
    expect(steps[steps.length - 1].state.merged).toHaveLength(MAX_MERGE_TWO_LEN * 2);
  });

  it("rejects remove-nth-node lengths that would OOM from per-step head clones", () => {
    const n = MAX_REMOVE_NTH_LEN + 1;
    const steps = STEP_GENERATORS["remove-nth-node"]({
      head: Array.from({ length: n }, (_, i) => i),
      n: 1,
    });
    expect(steps).toHaveLength(1);
    expect(steps[0].stepType).toBe("done");
    expect(steps[0].state.capped).toBe(true);
    expect(MAX_REMOVE_NTH_LEN).toBe(256);
  });

  it("still visualizes remove-nth-node at the length cap", () => {
    const steps = STEP_GENERATORS["remove-nth-node"]({
      head: Array.from({ length: MAX_REMOVE_NTH_LEN }, (_, i) => i + 1),
      n: 1,
    });
    expect(steps[0].state.capped).toBeUndefined();
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.done).toBe(true);
    expect(steps[steps.length - 1].state.head).toHaveLength(MAX_REMOVE_NTH_LEN - 1);
  });

  it.each(["invert-tree", "serialize-deserialize-btree", "max-depth-tree"])(
    "rejects %s complete arrays that would OOM from per-node clones",
    (id) => {
      const n = MAX_TREE_VIS_LEN + 1;
      const steps = STEP_GENERATORS[id]({ root: Array.from({ length: n }, (_, i) => i + 1) });
      expect(steps).toHaveLength(1);
      expect(steps[0].stepType).toBe("done");
      expect(steps[0].state.capped).toBe(true);
      expect(MAX_TREE_VIS_LEN).toBe(256);
    },
  );

  it.each(["invert-tree", "serialize-deserialize-btree", "max-depth-tree"])(
    "still visualizes %s at the complete-array cap",
    (id) => {
      const steps = STEP_GENERATORS[id]({
        root: Array.from({ length: MAX_TREE_VIS_LEN }, (_, i) => i + 1),
      });
      expect(steps[0].state.capped).toBeUndefined();
      expect(steps.length).toBeGreaterThan(1);
      expect(steps[steps.length - 1].state.done).toBe(true);
    },
  );
});
