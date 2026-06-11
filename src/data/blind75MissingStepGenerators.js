import { ensureCompleteTree } from "../utils/treeFormat.js";

function parseBoard(input) {
  const flat = String(input?.board ?? "").split(/[,\s]+/).filter(Boolean);
  const rows = Number(input?.rows) || 1;
  if (!flat.length) return [];
  const grid = [];
  const cols = Math.ceil(flat.length / rows);
  for (let r = 0; r < rows; r++) {
    grid.push(flat.slice(r * cols, (r + 1) * cols).map((c) => c.toUpperCase().charCodeAt(0)));
  }
  return grid;
}

function completeRoot(input) {
  const raw = Array.isArray(input?.root) ? input.root : [];
  return ensureCompleteTree(raw);
}

function treeIdxValid(arr, idx) {
  return idx < arr.length && arr[idx] !== null && arr[idx] !== undefined;
}

function parseOps(raw) {
  if (typeof raw !== "string" || !raw.trim()) return [];
  return raw.split(/[,\n;]/).map((p) => p.trim()).filter(Boolean);
}

function treeNodeToComplete(node) {
  if (!node) return [];
  const result = [];
  const set = (idx, val) => {
    while (result.length <= idx) result.push(null);
    result[idx] = val;
  };
  const walk = (n, idx) => {
    if (!n) return;
    set(idx, n.val);
    walk(n.left, 2 * idx + 1);
    walk(n.right, 2 * idx + 2);
  };
  walk(node, 0);
  while (result.length > 0 && result[result.length - 1] === null) result.pop();
  return result;
}

// ── 1. Minimum Window Substring ─────────────────────────────────────────────
export function generateMinWindowSteps(input) {
  const s = String(input?.s ?? "");
  const t = String(input?.t ?? "");
  const need = {};
  for (const ch of t) need[ch] = (need[ch] || 0) + 1;
  const have = {};
  let formed = 0;
  const required = Object.keys(need).length;
  let l = 0;
  let bestLen = Infinity;
  let bestL = 0;
  let bestR = 0;
  const steps = [];
  const push = (stepType, description, extra = {}) => {
    steps.push({
      stepType,
      description,
      state: {
        s, t, l, r: extra.r ?? -1, need: { ...need }, have: { ...have },
        formed, required, bestLen: bestLen === Infinity ? null : bestLen,
        bestWindow: bestLen === Infinity ? "" : s.slice(bestL, bestR + 1),
        ...extra, done: !!extra.done,
      },
    });
  };
  push("init", `Need counts from t="${t}"; expand right, shrink left when window is valid`);
  for (let r = 0; r < s.length; r++) {
    const ch = s[r];
    have[ch] = (have[ch] || 0) + 1;
    if (need[ch] && have[ch] === need[ch]) formed++;
    push("add_right", `Add s[${r}]='${ch}' → formed=${formed}/${required}`, { r });
    while (l <= r && formed === required) {
      if (r - l + 1 < bestLen) {
        bestLen = r - l + 1;
        bestL = l;
        bestR = r;
      }
      push("update_best", `Valid window [${l}..${r}] len=${bestLen}`, { r, highlightBest: true });
      const leftCh = s[l];
      have[leftCh]--;
      if (need[leftCh] && have[leftCh] < need[leftCh]) formed--;
      push("shrink", `Shrink left: remove '${leftCh}', l→${l + 1}`, { r });
      l++;
    }
  }
  const ans = bestLen === Infinity ? "" : s.slice(bestL, bestR + 1);
  push("done", `✓ Minimum window = "${ans}"`, { r: s.length - 1, done: true });
  return steps;
}

// ── 2. Binary Tree Level Order Traversal ────────────────────────────────────
export function generateLevelOrderSteps(input) {
  const arr = completeRoot(input);
  const steps = [];
  const result = [];
  if (!arr.length || arr[0] == null) {
    steps.push({ stepType: "done", description: "Empty tree → []", state: { root: arr, queue: [], currentLevel: [], result: [], visiting: -1, done: true } });
    return steps;
  }
  const queue = [0];
  steps.push({ stepType: "init", description: "BFS with queue starting at root", state: { root: arr, queue: [...queue], currentLevel: [], result: [], visiting: -1 } });
  while (queue.length) {
    const levelSize = queue.length;
    const level = [];
    steps.push({ stepType: "level_start", description: `Process level of size ${levelSize}`, state: { root: arr, queue: [...queue], currentLevel: [], result: result.map((x) => [...x]), visiting: -1 } });
    for (let i = 0; i < levelSize; i++) {
      const idx = queue.shift();
      level.push(arr[idx]);
      steps.push({ stepType: "dequeue", description: `Dequeue node ${arr[idx]} (idx ${idx})`, state: { root: arr, queue: [...queue], currentLevel: [...level], result: result.map((x) => [...x]), visiting: idx } });
      const li = 2 * idx + 1;
      const ri = 2 * idx + 2;
      if (treeIdxValid(arr, li)) queue.push(li);
      if (treeIdxValid(arr, ri)) queue.push(ri);
      if (treeIdxValid(arr, li) || treeIdxValid(arr, ri)) {
        steps.push({ stepType: "enqueue", description: `Enqueue children of ${arr[idx]}`, state: { root: arr, queue: [...queue], currentLevel: [...level], result: result.map((x) => [...x]), visiting: idx } });
      }
    }
    result.push([...level]);
    steps.push({ stepType: "level_done", description: `Level complete: [${level.join(", ")}]`, state: { root: arr, queue: [...queue], currentLevel: [], result: result.map((x) => [...x]), visiting: -1 } });
  }
  steps.push({ stepType: "done", description: `✓ ${JSON.stringify(result)}`, state: { root: arr, queue: [], currentLevel: [], result, visiting: -1, done: true } });
  return steps;
}

// ── 3. Validate Binary Search Tree ─────────────────────────────────────────
export function generateValidateBSTSteps(input) {
  const arr = completeRoot(input);
  const steps = [];
  let valid = true;
  const push = (stepType, description, state) => steps.push({ stepType, description, state: { root: arr, valid, ...state } });
  if (!arr.length || arr[0] == null) {
    push("done", "Empty tree is valid", { visiting: -1, lo: null, hi: null, done: true });
    return steps;
  }
  function dfs(idx, lo, hi) {
    if (!treeIdxValid(arr, idx)) return true;
    const val = arr[idx];
    push("visit", `Visit ${val} with bounds (${lo ?? "-∞"}, ${hi ?? "∞"})`, { visiting: idx, lo, hi });
    if ((lo !== null && val <= lo) || (hi !== null && val >= hi)) {
      valid = false;
      push("invalid", `${val} breaks BST bounds`, { visiting: idx, lo, hi });
      return false;
    }
    push("recurse", `Recurse left and right of ${val}`, { visiting: idx, lo, hi });
    return dfs(2 * idx + 1, lo, val) && dfs(2 * idx + 2, val, hi);
  }
  dfs(0, null, null);
  push("done", valid ? "✓ Valid BST" : "✗ Invalid BST", { visiting: -1, lo: null, hi: null, done: true });
  return steps;
}

// ── 4. Kth Smallest Element in a BST ───────────────────────────────────────
export function generateKthSmallestBSTSteps(input) {
  const arr = completeRoot(input);
  const k = Math.max(1, Number(input?.k) || 1);
  const steps = [];
  let count = 0;
  let answer = null;
  const push = (stepType, description, visiting) => {
    steps.push({ stepType, description, state: { root: arr, k, count, answer, visiting, done: false } });
  };
  function inorder(idx) {
    if (!treeIdxValid(arr, idx) || answer !== null) return;
    inorder(2 * idx + 1);
    count++;
    push("visit", `Inorder visit ${arr[idx]} → count=${count}`, idx);
    if (count === k) {
      answer = arr[idx];
      push("found", `✓ ${k}th smallest = ${answer}`, idx);
      return;
    }
    inorder(2 * idx + 2);
  }
  push("init", `Inorder traversal until count reaches k=${k}`, -1);
  inorder(0);
  steps.push({ stepType: "done", description: `Return ${answer}`, state: { root: arr, k, count, answer, visiting: -1, done: true } });
  return steps;
}

// ── 5. Construct Binary Tree from Preorder and Inorder ─────────────────────
export function generateConstructTreeSteps(input) {
  const preorder = Array.isArray(input?.preorder) ? [...input.preorder] : [3, 9, 20, 15, 7];
  const inorder = Array.isArray(input?.inorder) ? [...input.inorder] : [9, 3, 15, 20, 7];
  const steps = [];
  const built = [];
  let treeRoot = null;

  const push = (stepType, description, extra = {}) => {
    const root = treeRoot ? treeNodeToComplete(treeRoot) : [];
    const visiting = extra.rootVal != null ? root.indexOf(extra.rootVal) : -1;
    steps.push({
      stepType,
      description,
      state: {
        preorder: [...preorder],
        inorder: [...inorder],
        built: [...built],
        root,
        visiting,
        ...extra,
        done: !!extra.done,
      },
    });
  };

  push("init", "Pick root from preorder[0], split inorder, recurse", { preL: 0, preR: preorder.length - 1, inL: 0, inR: inorder.length - 1 });

  function build(preL, preR, inL, inR, parent, side) {
    if (preL > preR || inL > inR) return;
    const rootVal = preorder[preL];
    const rootIdx = inorder.indexOf(rootVal, inL);
    if (rootIdx < inL || rootIdx > inR) return;

    const node = { val: rootVal, left: null, right: null };
    if (!treeRoot) treeRoot = node;
    else if (parent && side === "left") parent.left = node;
    else if (parent && side === "right") parent.right = node;

    built.push(rootVal);
    push("pick_root", `Root = ${rootVal} (preorder[${preL}])`, { preL, preR, inL, inR, rootVal, rootIdx, highlightPre: preL, highlightIn: rootIdx });

    const leftSize = rootIdx - inL;
    push("split", `Left size=${leftSize}, right size=${inR - rootIdx}`, { preL, preR, inL, inR, rootVal, rootIdx });
    build(preL + 1, preL + leftSize, inL, rootIdx - 1, node, "left");
    build(preL + leftSize + 1, preR, rootIdx + 1, inR, node, "right");
  }

  build(0, preorder.length - 1, 0, inorder.length - 1);
  push("done", `✓ Built tree: [${treeNodeToComplete(treeRoot).join(", ")}]`, { done: true });
  return steps;
}

// ── 6. Binary Tree Maximum Path Sum ───────────────────────────────────────
export function generateMaxPathSumSteps(input) {
  const arr = completeRoot(input);
  const steps = [];
  let maxSum = -Infinity;
  const push = (stepType, description, state) => {
    steps.push({ stepType, description, state: { root: arr, maxSum: maxSum === -Infinity ? null : maxSum, ...state } });
  };
  function gain(idx) {
    if (!treeIdxValid(arr, idx)) return 0;
    push("visit", `Visit node ${arr[idx]}`, { visiting: idx });
    const left = gain(2 * idx + 1);
    const right = gain(2 * idx + 2);
    const g = Math.max(0, arr[idx] + Math.max(left, right));
    const pathThrough = arr[idx] + Math.max(0, left) + Math.max(0, right);
    maxSum = Math.max(maxSum, pathThrough);
    push("update_max", `gain=${g}, pathThrough=${pathThrough}, maxSum=${maxSum}`, { visiting: idx, gain: g, pathThrough });
    return g;
  }
  if (!arr.length || arr[0] == null) {
    push("done", "Empty tree", { visiting: -1, done: true });
    return steps;
  }
  gain(0);
  push("done", `✓ Max path sum = ${maxSum}`, { visiting: -1, done: true });
  return steps;
}

// ── 7–8. Trie / Word Dictionary ───────────────────────────────────────────
function trieFromOps(ops, wildcard = false) {
  const root = { ch: "", children: {}, end: false };
  const steps = [];
  const snapshot = () => JSON.parse(JSON.stringify(root));
  const push = (stepType, description, extra) => {
    steps.push({ stepType, description, state: { trie: snapshot(), op: extra?.op || null, word: extra?.word || "", result: extra?.result ?? null, path: extra?.path || [], ...extra, done: !!extra?.done } });
  };
  push("init", wildcard ? "Trie with addWord + search (supports '.')" : "Trie: insert, search, startsWith", {});
  for (const raw of ops) {
    const line = raw.replace(/\s+/g, " ").trim();
    const insert = line.match(/^insert\s+(.+)$/i);
    const add = line.match(/^addword\s+(.+)$/i);
    const search = line.match(/^search\s+(.+)$/i);
    const starts = line.match(/^startswith\s+(.+)$/i);
    if (insert || add) {
      const word = (insert || add)[1].trim();
      let node = root;
      const path = [];
      for (const ch of word) {
        if (!node.children[ch]) node.children[ch] = { ch, children: {}, end: false };
        node = node.children[ch];
        path.push(ch);
        push("add_char", `Insert '${ch}'`, { op: "insert", word, path: [...path] });
      }
      node.end = true;
      push("add_end", `Mark end of "${word}"`, { op: "insert", word, path: [...path], result: true });
    } else if (search) {
      const word = search[1].trim();
      const path = [];
      const dfs = (node, i) => {
        if (i === word.length) return node.end;
        const ch = word[i];
        if (ch === "." && wildcard) {
          for (const key of Object.keys(node.children)) {
            if (dfs(node.children[key], i + 1)) return true;
          }
          return false;
        }
        if (!node.children[ch]) return false;
        path.push(ch);
        return dfs(node.children[ch], i + 1);
      };
      const ok = dfs(root, 0);
      push("search", `search("${word}") → ${ok}`, { op: "search", word, path: [...path], result: ok });
    } else if (starts) {
      const word = starts[1].trim();
      let node = root;
      const path = [];
      let ok = true;
      for (const ch of word) {
        if (!node.children[ch]) { ok = false; break; }
        node = node.children[ch];
        path.push(ch);
      }
      push("search", `startsWith("${word}") → ${ok}`, { op: "startsWith", word, path: [...path], result: ok });
    }
  }
  push("done", "Done", { done: true });
  return steps;
}

export function generateTrieSteps(input) {
  return trieFromOps(parseOps(input?.s), false);
}

export function generateWordDictionarySteps(input) {
  return trieFromOps(parseOps(input?.s), true);
}

// ── 9. Word Search II ─────────────────────────────────────────────────────
export function generateWordSearchIISteps(input) {
  const grid = parseBoard(input);
  const wordsRaw = input?.words;
  const words = Array.isArray(wordsRaw)
    ? wordsRaw.map((w) => String(w).toUpperCase())
    : String(wordsRaw ?? "oath,pea,eat,rain").split(/[,\s]+/).filter(Boolean).map((w) => w.toUpperCase());
  const R = grid.length;
  const C = grid[0]?.length || 0;
  const steps = [];
  const found = [];
  const VISITED = 35;
  const push = (stepType, description, state) => steps.push({ stepType, description, state: { grid: grid.map((r) => [...r]), words, foundWords: [...found], ...state } });

  if (!R) {
    push("done", "Empty board", { visited: [], current: null, word: "", matched: "", done: true });
    return steps;
  }

  push("init", `Trie + DFS for [${words.join(", ")}]`, { visited: Array(R).fill(0).map(() => Array(C).fill(false)), current: null, word: "", matched: "" });

  function dfs(r, c, i, word, visited) {
    if (i === word.length) return true;
    if (r < 0 || r >= R || c < 0 || c >= C || visited[r][c]) return false;
    const ch = String.fromCharCode(grid[r][c]);
    if (ch === "#" || ch !== word[i]) return false;
    grid[r][c] = VISITED;
    visited[r][c] = true;
    push("dfs_mark", `Match '${ch}' for "${word}"`, { visited: visited.map((row) => [...row]), current: [r, c], word, matched: word.slice(0, i + 1), searchWord: word });
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dr, dc] of dirs) {
      if (dfs(r + dr, c + dc, i + 1, word, visited)) return true;
    }
    grid[r][c] = word.charCodeAt(i);
    visited[r][c] = false;
    return false;
  }

  for (const word of words) {
    let ok = false;
    outer: for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        const vis = Array(R).fill(0).map(() => Array(C).fill(false));
        push("try_start", `Search "${word}" from (${r},${c})`, { visited: vis, current: [r, c], word, matched: "", searchWord: word });
        if (dfs(r, c, 0, word, vis)) {
          found.push(word);
          push("found", `✓ Found "${word}"`, { visited: vis, current: [r, c], word, matched: word, searchWord: word, found: true });
          ok = true;
          break outer;
        }
      }
    }
    if (!ok) push("dfs_fail", `"${word}" not on board`, { visited: Array(R).fill(0).map(() => Array(C).fill(false)), current: null, word, matched: "", searchWord: word });
  }

  push("done", `✓ Found [${found.join(", ")}]`, { visited: Array(R).fill(0).map(() => Array(C).fill(false)), current: null, word: "", matched: "", done: true });
  return steps;
}

export const BLIND75_MISSING_STEP_GENERATORS = {
  "minimum-window-substring": generateMinWindowSteps,
  "binary-tree-level-order-traversal": generateLevelOrderSteps,
  "validate-binary-search-tree": generateValidateBSTSteps,
  "kth-smallest-element-in-a-bst": generateKthSmallestBSTSteps,
  "construct-binary-tree-from-preorder-and-inorder-traversal": generateConstructTreeSteps,
  "binary-tree-maximum-path-sum": generateMaxPathSumSteps,
  "implement-trie-prefix-tree": generateTrieSteps,
  "design-add-and-search-words-data-structure": generateWordDictionarySteps,
  "word-search-ii": generateWordSearchIISteps,
};
