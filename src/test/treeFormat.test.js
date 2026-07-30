import { describe, it, expect } from "vitest";
import {
  leetcodeToComplete,
  ensureCompleteTree,
  MAX_COMPLETE_TREE_LEN,
  TreeLayoutTooLargeError,
} from "../utils/treeFormat.js";
import { generateLevelOrderSteps } from "../data/blind75MissingStepGenerators.js";

const EXTENDED_LC = [3, 9, 20, null, null, 15, 7, 8, 8, 8, null, null, null, null, 9];

describe("ensureCompleteTree", () => {
  it("converts LeetCode serialization", () => {
    const complete = ensureCompleteTree(EXTENDED_LC);
    expect(complete.filter((v) => v != null)).toHaveLength(9);
  });

  it("does not double-convert complete arrays from InputEditor", () => {
    const fromEditor = leetcodeToComplete(EXTENDED_LC);
    const once = ensureCompleteTree(fromEditor);
    expect(once.filter((v) => v != null)).toHaveLength(9);
    expect(once).toEqual(fromEditor);
  });

  it("rejects left-skewed trees that would allocate millions of slots", () => {
    // LeetCode left-spine of 20 nodes → complete index 2^19-1 ≈ 524287 without a guard.
    const skewed = [];
    for (let i = 1; i <= 20; i++) {
      skewed.push(i);
      if (i < 20) skewed.push(null);
    }
    expect(() => leetcodeToComplete(skewed)).toThrow(TreeLayoutTooLargeError);
    expect(() => ensureCompleteTree(skewed)).toThrow(TreeLayoutTooLargeError);
  });

  it("accepts complete arrays up to the hard layout cap", () => {
    const ok = Array(MAX_COMPLETE_TREE_LEN + 1).fill(null);
    ok[0] = 1;
    expect(ensureCompleteTree(ok)).toEqual(ok);
    const tooBig = Array(MAX_COMPLETE_TREE_LEN + 2).fill(null);
    tooBig[0] = 1;
    expect(() => ensureCompleteTree(tooBig)).toThrow(TreeLayoutTooLargeError);
  });
});

describe("level order on extended tree", () => {
  it("includes all levels after editor-style input", () => {
    const input = { root: leetcodeToComplete(EXTENDED_LC) };
    const steps = generateLevelOrderSteps(input);
    const done = steps.find((s) => s.stepType === "done");
    expect(done.state.result).toEqual([[3], [9, 20], [15, 7], [8, 8, 8], [9]]);
  });
});
