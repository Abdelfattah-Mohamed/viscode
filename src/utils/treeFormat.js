/**
 * Conversions between LeetCode-style level-order arrays and
 * complete-binary-tree arrays (index i → children at 2i+1, 2i+2).
 *
 * LeetCode format lists children only for non-null nodes (BFS order),
 * so [1, null, 2, 3] means 3 is the left child of 2.
 *
 * Complete format pads every level so index math works directly,
 * so the same tree is [1, null, 2, null, null, 3].
 */

export function leetcodeToComplete(lc) {
  if (!lc || !lc.length || lc[0] === null) return [];

  const result = [];

  function set(idx, val) {
    while (result.length <= idx) result.push(null);
    result[idx] = val;
  }

  set(0, lc[0]);
  const queue = [0];
  let i = 1;

  while (queue.length > 0 && i < lc.length) {
    const parentIdx = queue.shift();
    const leftIdx  = 2 * parentIdx + 1;
    const rightIdx = 2 * parentIdx + 2;

    if (i < lc.length) {
      const v = lc[i++];
      if (v !== null) { set(leftIdx, v); queue.push(leftIdx); }
    }
    if (i < lc.length) {
      const v = lc[i++];
      if (v !== null) { set(rightIdx, v); queue.push(rightIdx); }
    }
  }

  while (result.length > 0 && result[result.length - 1] === null) result.pop();
  return result;
}

export function completeToLeetcode(complete) {
  if (!complete || !complete.length || complete[0] == null) return [];

  const result = [complete[0]];
  const queue = [0];

  while (queue.length > 0) {
    const idx = queue.shift();
    const li = 2 * idx + 1;
    const ri = 2 * idx + 2;

    const lv = li < complete.length ? (complete[li] ?? null) : null;
    const rv = ri < complete.length ? (complete[ri] ?? null) : null;

    result.push(lv);
    if (lv !== null) queue.push(li);

    result.push(rv);
    if (rv !== null) queue.push(ri);
  }

  while (result.length > 0 && result[result.length - 1] === null) result.pop();
  return result;
}
