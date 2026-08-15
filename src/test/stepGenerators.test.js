import { describe, it, expect } from "vitest";
import { PROBLEMS } from "../data/problems";
import {
  STEP_GENERATORS,
  MAX_GRAPH_VIS_N,
  MAX_GROUP_ANAGRAMS_LEN,
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

describe("remaining graph / group-anagrams visualizer OOM caps", () => {
  function chainNums(n) {
    const nums = [];
    for (let i = 0; i < n - 1; i++) nums.push(i, i + 1);
    return nums;
  }

  function weightedChain(n) {
    const nums = [];
    for (let i = 0; i < n - 1; i++) nums.push(i, i + 1, 1);
    return nums;
  }

  it("rejects bfs/dfs/kruskal/tarjan/kosaraju/prim graphs that would OOM from per-step edge clones", () => {
    const n = MAX_GRAPH_VIS_N + 1;
    const nums = chainNums(n);
    const weighted = weightedChain(n);
    for (const [id, input] of [
      ["bfs-graph", { n, nums }],
      ["dfs-graph", { n, nums }],
      ["mst-kruskal", { n, nums: weighted }],
      ["tarjan-scc", { n, nums }],
      ["kosaraju", { n, nums }],
      ["prim-mst", { n, nums: weighted }],
    ]) {
      const steps = STEP_GENERATORS[id](input);
      expect(steps, id).toHaveLength(1);
      expect(steps[0].state.capped, id).toBe(true);
    }
    expect(MAX_GRAPH_VIS_N).toBe(100);
  });

  it("still visualizes bfs and kruskal at the node cap", () => {
    const bfs = STEP_GENERATORS["bfs-graph"]({ n: MAX_GRAPH_VIS_N, nums: chainNums(MAX_GRAPH_VIS_N) });
    expect(bfs[0].state.capped).toBeUndefined();
    expect(bfs[bfs.length - 1].state.done).toBe(true);
    expect(bfs.length).toBeGreaterThan(1);

    const kruskal = STEP_GENERATORS["mst-kruskal"]({ n: MAX_GRAPH_VIS_N, nums: weightedChain(MAX_GRAPH_VIS_N) });
    expect(kruskal[0].state.capped).toBeUndefined();
    expect(kruskal[kruskal.length - 1].state.done).toBe(true);
    expect(kruskal.length).toBeGreaterThan(1);
  });

  it("rejects group-anagrams lists that would OOM from per-string map snapshots", () => {
    const s = Array.from({ length: MAX_GROUP_ANAGRAMS_LEN + 1 }, (_, i) => `w${i}`).join(",");
    const steps = STEP_GENERATORS["group-anagrams"]({ s });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(MAX_GROUP_ANAGRAMS_LEN).toBe(256);
  });

  it("still visualizes group-anagrams at the string-count cap", () => {
    const s = Array.from({ length: MAX_GROUP_ANAGRAMS_LEN }, (_, i) => `w${i}`).join(",");
    const steps = STEP_GENERATORS["group-anagrams"]({ s });
    expect(steps[0].state.capped).toBeUndefined();
    expect(steps[steps.length - 1].state.done).toBe(true);
    expect(steps.length).toBeGreaterThan(1);
  });
});
