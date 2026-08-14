import { describe, it, expect } from "vitest";
import { PROBLEMS } from "../data/problems";
import {
  STEP_GENERATORS,
  MAX_MATRIX_VIS_CELLS,
  MAX_GRAPH_VIS_N,
  MAX_MERGE_K_NODES,
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

describe("matrix / graph / merge-k visualizer OOM caps", () => {
  function matrixInput(rows, cols, fill = 1) {
    return { grid: Array.from({ length: rows * cols }, (_, i) => (fill === "i" ? i + 1 : fill)), rows };
  }

  function chainNums(n) {
    const nums = [];
    for (let i = 0; i < n - 1; i++) nums.push(i, i + 1);
    return nums;
  }

  function reverseWeightedChain(n) {
    const nums = [];
    for (let i = n - 2; i >= 0; i--) nums.push(i, i + 1, 1);
    return nums;
  }

  it("rejects set-matrix-zeroes grids that would OOM from per-cell clones", () => {
    const side = Math.ceil(Math.sqrt(MAX_MATRIX_VIS_CELLS)) + 1;
    const steps = STEP_GENERATORS["set-matrix-zeroes"](matrixInput(side, side, 1));
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(MAX_MATRIX_VIS_CELLS).toBe(400);
  });

  it("still visualizes set-matrix-zeroes at the cell cap", () => {
    const steps = STEP_GENERATORS["set-matrix-zeroes"](matrixInput(20, 20, 1));
    expect(steps[0].state.capped).toBeUndefined();
    expect(steps.some((s) => s.stepType === "done")).toBe(true);
    expect(steps.length).toBeGreaterThan(1);
  });

  it("rejects spiral-matrix grids that would OOM from per-cell clones", () => {
    const steps = STEP_GENERATORS["spiral-matrix"](matrixInput(60, 60, "i"));
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
  });

  it("still visualizes spiral-matrix at the cell cap", () => {
    const steps = STEP_GENERATORS["spiral-matrix"](matrixInput(20, 20, "i"));
    expect(steps[0].state.capped).toBeUndefined();
    expect(steps[steps.length - 1].state.res.length).toBe(400);
  });

  it("rejects rotate-image matrices that would OOM from per-swap clones", () => {
    const steps = STEP_GENERATORS["rotate-image"](matrixInput(70, 70, "i"));
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
  });

  it("still visualizes rotate-image at the cell cap", () => {
    const steps = STEP_GENERATORS["rotate-image"](matrixInput(20, 20, "i"));
    expect(steps[0].state.capped).toBeUndefined();
    expect(steps.some((s) => s.stepType === "transpose")).toBe(true);
  });

  it("rejects connected-components graphs that would OOM from per-DFS edge clones", () => {
    const n = MAX_GRAPH_VIS_N + 1;
    const steps = STEP_GENERATORS["num-connected-components"]({ n, nums: chainNums(n) });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(MAX_GRAPH_VIS_N).toBe(100);
  });

  it("still visualizes connected-components at the node cap", () => {
    const steps = STEP_GENERATORS["num-connected-components"]({ n: MAX_GRAPH_VIS_N, nums: chainNums(MAX_GRAPH_VIS_N) });
    expect(steps[0].state.capped).toBeUndefined();
    expect(steps[steps.length - 1].state.count).toBe(1);
  });

  it("rejects clone-graph, valid-tree, dijkstra, and a-star at the same n cap", () => {
    const n = MAX_GRAPH_VIS_N + 1;
    const nums = chainNums(n);
    const weighted = [];
    for (let i = 0; i < n - 1; i++) weighted.push(i, i + 1, 1);
    for (const [id, input] of [
      ["clone-graph", { n, nums }],
      ["graph-valid-tree", { n, nums }],
      ["dijkstra", { n, nums: weighted }],
      ["a-star", { n, nums: weighted }],
    ]) {
      const steps = STEP_GENERATORS[id](input);
      expect(steps, id).toHaveLength(1);
      expect(steps[0].state.capped, id).toBe(true);
    }
  });

  it("rejects bellman-ford reverse chains that would OOM from V×E relax clones", () => {
    const n = 250;
    const steps = STEP_GENERATORS["bellman-ford"]({ n, nums: reverseWeightedChain(n) });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
  });

  it("still visualizes bellman-ford at the node cap", () => {
    const steps = STEP_GENERATORS["bellman-ford"]({ n: MAX_GRAPH_VIS_N, nums: reverseWeightedChain(MAX_GRAPH_VIS_N) });
    expect(steps[0].state.capped).toBeUndefined();
    expect(steps.length).toBeGreaterThan(1);
  });

  it("rejects merge-k lists that would OOM from per-pop remaining-list clones", () => {
    const lists = Array.from({ length: 10 }, (_, li) =>
      Array.from({ length: 40 }, (_, i) => li * 40 + i).join(",")
    );
    const steps = STEP_GENERATORS["merge-k-sorted-lists"]({ s: lists.join("|") });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(MAX_MERGE_K_NODES).toBe(256);
  });

  it("still visualizes merge-k at the node cap", () => {
    const lists = Array.from({ length: 8 }, (_, li) =>
      Array.from({ length: 32 }, (_, i) => li * 32 + i).join(",")
    );
    const steps = STEP_GENERATORS["merge-k-sorted-lists"]({ s: lists.join("|") });
    expect(steps[0].state.capped).toBeUndefined();
    expect(steps[steps.length - 1].state.merged.length).toBe(MAX_MERGE_K_NODES);
  });
});
