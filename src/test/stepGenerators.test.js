import { describe, it, expect } from "vitest";
import { PROBLEMS } from "../data/problems";
import {
  STEP_GENERATORS,
  generateAnagramSteps,
  generateLongestSubstringNoRepeatSteps,
  generateEncodeDecodeSteps,
  generateUnionFindSteps,
  MAX_ANAGRAM_LEN,
  MAX_LONGEST_SUBSTRING_LEN,
  MAX_ENCODE_DECODE_TOKENS,
  MAX_UNION_FIND_N,
} from "../data/stepGenerators";
import { SORTING_STEP_GENERATORS } from "../data/sortingStepGenerators";
import {
  generateConstructTreeSteps,
  generateMinWindowSteps,
  generateTrieSteps,
  MAX_MIN_WINDOW_LEN,
  MAX_TRIE_OPS,
  MAX_TRIE_WORD_LEN,
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

function uniqueChars(n) {
  return Array.from({ length: n }, (_, i) => String.fromCharCode(0x4e00 + i)).join("");
}

describe("oversized visualizer inputs that would OOM", () => {
  it("rejects valid-anagram lengths that would OOM from unique-char freq clones", () => {
    const n = MAX_ANAGRAM_LEN + 1;
    const s = uniqueChars(n);
    const steps = generateAnagramSteps({ s, t: s });
    expect(steps).toHaveLength(1);
    expect(steps[0].stepType).toBe("error");
    expect(steps[0].state.done).toBe(true);
    expect(MAX_ANAGRAM_LEN).toBe(256);
  });

  it("still generates valid-anagram steps at the length cap", () => {
    const s = uniqueChars(MAX_ANAGRAM_LEN);
    const steps = generateAnagramSteps({ s, t: s });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.result).toBe(true);
  });

  it("rejects longest-substring lengths that would OOM from unique-char last-map clones", () => {
    const n = MAX_LONGEST_SUBSTRING_LEN + 1;
    const steps = generateLongestSubstringNoRepeatSteps({ s: uniqueChars(n) });
    expect(steps).toHaveLength(1);
    expect(steps[0].stepType).toBe("error");
    expect(steps[0].state.done).toBe(true);
    expect(MAX_LONGEST_SUBSTRING_LEN).toBe(256);
  });

  it("still generates longest-substring steps at the length cap", () => {
    const steps = generateLongestSubstringNoRepeatSteps({ s: uniqueChars(MAX_LONGEST_SUBSTRING_LEN) });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.best).toBe(MAX_LONGEST_SUBSTRING_LEN);
  });

  it("rejects encode-decode token counts that would OOM from per-token res clones", () => {
    const n = MAX_ENCODE_DECODE_TOKENS + 1;
    const steps = generateEncodeDecodeSteps({ s: "1#a".repeat(n) });
    expect(steps).toHaveLength(1);
    expect(steps[0].stepType).toBe("error");
    expect(steps[0].state.done).toBe(true);
    expect(MAX_ENCODE_DECODE_TOKENS).toBe(256);
  });

  it("still generates encode-decode steps at the token cap", () => {
    const steps = generateEncodeDecodeSteps({ s: "1#a".repeat(MAX_ENCODE_DECODE_TOKENS) });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.res).toHaveLength(MAX_ENCODE_DECODE_TOKENS);
  });

  it("rejects union-find sizes that would OOM from per-union parent clones", () => {
    const n = MAX_UNION_FIND_N + 1;
    const steps = generateUnionFindSteps({ nums: Array.from({ length: n }, (_, i) => i) });
    expect(steps).toHaveLength(1);
    expect(steps[0].stepType).toBe("error");
    expect(steps[0].state.done).toBe(true);
    expect(MAX_UNION_FIND_N).toBe(256);
  });

  it("still generates union-find steps at the node cap", () => {
    const steps = generateUnionFindSteps({ nums: Array.from({ length: MAX_UNION_FIND_N }, (_, i) => i) });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.nums).toHaveLength(MAX_UNION_FIND_N);
  });

  it("rejects min-window lengths that would OOM from unique-char have-map clones", () => {
    const n = MAX_MIN_WINDOW_LEN + 1;
    const steps = generateMinWindowSteps({ s: uniqueChars(n), t: uniqueChars(1) });
    expect(steps).toHaveLength(1);
    expect(steps[0].stepType).toBe("error");
    expect(steps[0].state.done).toBe(true);
    expect(MAX_MIN_WINDOW_LEN).toBe(256);
  });

  it("still generates min-window steps at the length cap", () => {
    const s = uniqueChars(MAX_MIN_WINDOW_LEN);
    const steps = generateMinWindowSteps({ s, t: s.slice(0, 1) });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.done).toBe(true);
  });

  it("rejects trie operation counts that would OOM from per-char JSON snapshots", () => {
    const n = MAX_TRIE_OPS + 1;
    const ops = Array.from({ length: n }, (_, i) => `insert w${i}`).join(",");
    const steps = generateTrieSteps({ s: ops });
    expect(steps).toHaveLength(1);
    expect(steps[0].stepType).toBe("error");
    expect(steps[0].state.done).toBe(true);
    expect(MAX_TRIE_OPS).toBe(32);
  });

  it("rejects trie word lengths that would OOM from per-char JSON snapshots", () => {
    const word = "a".repeat(MAX_TRIE_WORD_LEN + 1);
    const steps = generateTrieSteps({ s: `insert ${word}` });
    expect(steps).toHaveLength(1);
    expect(steps[0].stepType).toBe("error");
    expect(steps[0].state.done).toBe(true);
    expect(MAX_TRIE_WORD_LEN).toBe(32);
  });

  it("still generates trie steps at the op and word caps", () => {
    const word = "a".repeat(MAX_TRIE_WORD_LEN);
    const ops = Array.from({ length: MAX_TRIE_OPS }, (_, i) => (i === 0 ? `insert ${word}` : `search ${word.slice(0, 3)}`)).join(",");
    const steps = generateTrieSteps({ s: ops });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[steps.length - 1].state.done).toBe(true);
  });
});
