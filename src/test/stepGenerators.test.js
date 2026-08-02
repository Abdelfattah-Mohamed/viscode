import { describe, it, expect } from "vitest";
import { PROBLEMS } from "../data/problems";
import {
  STEP_GENERATORS,
  generateWordSearchSteps,
  MAX_WORD_SEARCH_CELLS,
  MAX_WORD_SEARCH_WORD_LEN,
} from "../data/stepGenerators";
import { SORTING_STEP_GENERATORS } from "../data/sortingStepGenerators";
import {
  generateConstructTreeSteps,
  generateWordSearchIISteps,
  MAX_WORD_SEARCH_II_WORDS,
} from "../data/blind75MissingStepGenerators";

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

describe("word search visualization caps", () => {
  it("caps oversized Word Search boards that would OOM", () => {
    const board = Array(49).fill("A").join(",");
    const steps = generateWordSearchSteps({ board, rows: 7, word: "AAAAAAX" });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].description).toContain(String(MAX_WORD_SEARCH_CELLS));
  });

  it("caps long Word Search words that would OOM", () => {
    const board = Array(25).fill("A").join(",");
    const word = "A".repeat(MAX_WORD_SEARCH_WORD_LEN + 1) + "X";
    const steps = generateWordSearchSteps({ board, rows: 5, word });
    expect(steps).toHaveLength(1);
    expect(steps[0].state.capped).toBe(true);
    expect(steps[0].description).toContain(String(MAX_WORD_SEARCH_WORD_LEN));
  });

  it("still finds words within the budget", () => {
    const steps = generateWordSearchSteps(PROBLEMS["word-search"].defaultInput);
    expect(steps.some((s) => s.stepType === "found")).toBe(true);
  });

  it("caps oversized Word Search II boards and word lists", () => {
    const bigBoard = generateWordSearchIISteps({
      board: Array(100).fill("A").join(","),
      rows: 10,
      words: "AAAAAAAAAB",
    });
    expect(bigBoard[0].state.capped).toBe(true);

    const manyWords = Array.from({ length: MAX_WORD_SEARCH_II_WORDS + 1 }, (_, i) => `W${i}`).join(",");
    const steps = generateWordSearchIISteps({
      board: "A,B,C,D",
      rows: 2,
      words: manyWords,
    });
    expect(steps[0].state.capped).toBe(true);
  });
});
