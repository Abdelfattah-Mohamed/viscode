import { describe, it, expect } from "vitest";
import { leetcodeToComplete, ensureCompleteTree } from "../utils/treeFormat.js";
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
});

describe("level order on extended tree", () => {
  it("includes all levels after editor-style input", () => {
    const input = { root: leetcodeToComplete(EXTENDED_LC) };
    const steps = generateLevelOrderSteps(input);
    const done = steps.find((s) => s.stepType === "done");
    expect(done.state.result).toEqual([[3], [9, 20], [15, 7], [8, 8, 8], [9]]);
  });
});
