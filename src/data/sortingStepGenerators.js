/** Step generators for sorting visualizer — stepTypes: init, loop, compare, visit, update, done */

function numsOf(input) {
  const raw = input?.nums;
  return Array.isArray(raw) ? raw.map((x) => Number(x) || 0) : [];
}

function snap(nums, extra = {}) {
  const n = nums.length;
  return {
    nums: [...nums],
    highlight: extra.highlight ?? [],
    sortedLeft: extra.sortedLeft ?? 0,
    sortedRight: extra.sortedRight ?? n,
    pivot: extra.pivot ?? null,
    done: !!extra.done,
    aux: extra.aux,
    auxLabel: extra.auxLabel,
  };
}

function push(steps, stepType, description, nums, extra) {
  steps.push({ stepType, description, state: snap(nums, extra) });
}

export function bubbleSortSteps(input) {
  const nums = numsOf(input);
  const steps = [];
  const n = nums.length;
  push(steps, "init", "Bubble sort: repeatedly swap adjacent out-of-order pairs.", nums, { sortedRight: n });
  if (n <= 1) {
    push(steps, "done", "Already sorted.", nums, { done: true, sortedLeft: n });
    return steps;
  }
  for (let i = 0; i < n; i++) {
    push(steps, "loop", `Outer pass i=${i} — largest unsorted element will settle at index ${n - 1 - i}.`, nums, {
      highlight: [],
      sortedRight: n - i,
    });
    for (let j = 0; j < n - 1 - i; j++) {
      push(steps, "compare", `Compare nums[${j}] (${nums[j]}) and nums[${j + 1}] (${nums[j + 1]}).`, nums, {
        highlight: [j, j + 1],
        sortedRight: n - i,
      });
      if (nums[j] > nums[j + 1]) {
        [nums[j], nums[j + 1]] = [nums[j + 1], nums[j]];
        push(steps, "update", `Swap ${nums[j + 1]} ↔ ${nums[j]}`, nums, { highlight: [j, j + 1], sortedRight: n - i });
      }
    }
    push(steps, "visit", `End pass ${i + 1}: suffix from ${n - i - 1} is locked in place.`, nums, {
      highlight: [n - i - 1],
      sortedRight: n - i - 1,
    });
  }
  push(steps, "done", "Sorted.", nums, { done: true, sortedLeft: n });
  return steps;
}

export function selectionSortSteps(input) {
  const nums = numsOf(input);
  const steps = [];
  const n = nums.length;
  push(steps, "init", "Selection sort: choose the minimum of the unsorted suffix each round.", nums, {});
  if (n <= 1) {
    push(steps, "done", "Already sorted.", nums, { done: true, sortedLeft: n });
    return steps;
  }
  for (let i = 0; i < n; i++) {
    push(steps, "loop", `Place smallest among indices [${i}..${n - 1}].`, nums, { sortedLeft: i });
    let minIdx = i;
    push(steps, "visit", `Candidate minimum starts at index ${i}.`, nums, { highlight: [i], sortedLeft: i });
    for (let j = i + 1; j < n; j++) {
      push(steps, "compare", `Compare nums[${minIdx}] (${nums[minIdx]}) with nums[${j}] (${nums[j]}).`, nums, {
        highlight: [minIdx, j],
        sortedLeft: i,
      });
      if (nums[j] < nums[minIdx]) {
        minIdx = j;
        push(steps, "update", `New minimum index ${minIdx}.`, nums, { highlight: [minIdx], sortedLeft: i });
      }
    }
    if (minIdx !== i) {
      [nums[i], nums[minIdx]] = [nums[minIdx], nums[i]];
      push(steps, "update", `Swap nums[${i}] with nums[${minIdx}].`, nums, { highlight: [i, minIdx], sortedLeft: i });
    }
    push(steps, "visit", `Prefix [0..${i}] is sorted.`, nums, { sortedLeft: i + 1, highlight: [i] });
  }
  push(steps, "done", "Sorted.", nums, { done: true, sortedLeft: n });
  return steps;
}

export function insertionSortSteps(input) {
  const nums = numsOf(input);
  const steps = [];
  const n = nums.length;
  push(steps, "init", "Insertion sort: expand a sorted prefix by inserting each next element.", nums, {});
  if (n <= 1) {
    push(steps, "done", "Already sorted.", nums, { done: true, sortedLeft: n });
    return steps;
  }
  for (let i = 1; i < n; i++) {
    push(steps, "loop", `Insert nums[${i}] (${nums[i]}) into sorted prefix [0..${i - 1}].`, nums, {
      sortedLeft: i,
      highlight: [i],
    });
    const key = nums[i];
    let j = i - 1;
    while (j >= 0 && nums[j] > key) {
      push(steps, "compare", `Shift nums[${j}] right because ${nums[j]} > ${key}.`, nums, {
        highlight: [j, j + 1],
        sortedLeft: i,
      });
      nums[j + 1] = nums[j];
      push(steps, "update", `Move ${nums[j + 1]} to index ${j + 1}.`, nums, { highlight: [j + 1], sortedLeft: i });
      j--;
    }
    nums[j + 1] = key;
    push(steps, "visit", `Placed ${key} at index ${j + 1}.`, nums, { sortedLeft: i + 1, highlight: [j + 1] });
  }
  push(steps, "done", "Sorted.", nums, { done: true, sortedLeft: n });
  return steps;
}

function mergeRange(steps, nums, l, m, r, sortedBand) {
  const left = nums.slice(l, m);
  const right = nums.slice(m, r);
  let i = 0;
  let j = 0;
  let k = l;
  while (i < left.length && j < right.length) {
    push(steps, "compare", `Merge compare left=${left[i]} vs right=${right[j]} at write position ${k}.`, nums, {
      highlight: [k],
      sortedLeft: sortedBand?.[0] ?? 0,
      sortedRight: sortedBand?.[1] ?? nums.length,
    });
    if (left[i] <= right[j]) {
      nums[k++] = left[i++];
    } else {
      nums[k++] = right[j++];
    }
    push(steps, "update", `Write ${nums[k - 1]} at index ${k - 1}.`, nums, {
      highlight: [k - 1],
      sortedLeft: sortedBand?.[0] ?? 0,
      sortedRight: sortedBand?.[1] ?? nums.length,
    });
  }
  while (i < left.length) {
    nums[k++] = left[i++];
    push(steps, "visit", `Append leftover from left half at ${k - 1}.`, nums, {
      highlight: [k - 1],
      sortedLeft: sortedBand?.[0] ?? 0,
      sortedRight: sortedBand?.[1] ?? nums.length,
    });
  }
  while (j < right.length) {
    nums[k++] = right[j++];
    push(steps, "visit", `Append leftover from right half at ${k - 1}.`, nums, {
      highlight: [k - 1],
      sortedLeft: sortedBand?.[0] ?? 0,
      sortedRight: sortedBand?.[1] ?? nums.length,
    });
  }
}

export function iterativeMergeSortSteps(input) {
  const nums = numsOf(input);
  const steps = [];
  const n = nums.length;
  push(steps, "init", "Bottom-up merge sort: merge pairs of length 1, then 2, then 4…", nums, {});
  if (n <= 1) {
    push(steps, "done", "Already sorted.", nums, { done: true, sortedLeft: n });
    return steps;
  }
  for (let width = 1; width < n; width *= 2) {
    push(steps, "loop", `Subarray width = ${width}.`, nums, {});
    for (let l = 0; l < n; l += 2 * width) {
      const m = Math.min(l + width, n);
      const r = Math.min(l + 2 * width, n);
      if (m >= r) continue;
      push(steps, "visit", `Merge nums[${l}..${m}) with nums[${m}..${r}).`, nums, { highlight: [l, m, r - 1] });
      mergeRange(steps, nums, l, m, r, [l, r]);
    }
  }
  push(steps, "done", "Sorted.", nums, { done: true, sortedLeft: n });
  return steps;
}

export function countingSortSteps(input) {
  const nums = numsOf(input);
  const steps = [];
  const n = nums.length;
  push(steps, "init", "Counting sort: frequencies → prefix ranks → stable scatter back into nums.", nums, {});
  if (n <= 1) {
    push(steps, "done", "Already sorted.", nums, { done: true, sortedLeft: n });
    return steps;
  }
  const minV = Math.min(...nums);
  const offset = minV < 0 ? minV : 0;
  const keys = nums.map((x) => x - offset);
  const maxK = Math.max(...keys);
  const count = Array(maxK + 1).fill(0);
  push(steps, "loop", "Count occurrences of shifted keys.", nums, { aux: count.slice(), auxLabel: "count[]" });
  for (let i = 0; i < n; i++) {
    push(steps, "visit", `nums[${i}] = ${nums[i]} → key ${keys[i]}.`, nums, {
      highlight: [i],
      aux: count.slice(),
      auxLabel: "count[]",
    });
    count[keys[i]]++;
    push(steps, "update", `count[${keys[i]}]++`, nums, {
      highlight: [i],
      aux: count.slice(),
      auxLabel: "count[]",
    });
  }
  for (let i = 1; i <= maxK; i++) {
    push(steps, "compare", `Prefix-sum at ${i}.`, nums, { aux: count.slice(), auxLabel: "prefix" });
    count[i] += count[i - 1];
    push(steps, "update", `count[${i}] = ${count[i]}`, nums, { aux: count.slice(), auxLabel: "prefix" });
  }
  const output = Array(n).fill(0);
  push(steps, "loop", "Scatter originals using prefix slots (stable, right-to-left).", nums, {
    aux: count.slice(),
    auxLabel: "write positions",
  });
  for (let i = n - 1; i >= 0; i--) {
    const k = keys[i];
    push(steps, "visit", `Place nums[${i}] (${nums[i]}) using key ${k}.`, nums, {
      highlight: [i],
      aux: output.slice(),
      auxLabel: "output[]",
    });
    count[k]--;
    output[count[k]] = nums[i];
    push(steps, "update", `output[${count[k]}] = ${nums[i]}`, nums, {
      highlight: [i],
      aux: output.slice(),
      auxLabel: "output[]",
    });
  }
  for (let i = 0; i < n; i++) nums[i] = output[i];
  push(steps, "done", "Sorted.", nums, { done: true, sortedLeft: n });
  return steps;
}

function siftDown(steps, nums, n, i, sortedRight) {
  while (true) {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    push(steps, "compare", `Heapify at ${i}: compare with children.`, nums, {
      highlight: [i, l, r].filter((x) => x < n),
      sortedRight,
      pivot: i,
    });
    if (l < n && nums[l] > nums[largest]) largest = l;
    if (r < n && nums[r] > nums[largest]) largest = r;
    if (largest === i) break;
    push(steps, "update", `Swap nums[${i}] with nums[${largest}] to restore heap.`, nums, {
      highlight: [i, largest],
      sortedRight,
      pivot: largest,
    });
    [nums[i], nums[largest]] = [nums[largest], nums[i]];
    i = largest;
  }
}

export function heapSortSteps(input) {
  const nums = numsOf(input);
  const steps = [];
  const n = nums.length;
  push(steps, "init", "Heap sort: build max-heap, repeatedly extract max to the end.", nums, {});
  if (n <= 1) {
    push(steps, "done", "Already sorted.", nums, { done: true, sortedLeft: n });
    return steps;
  }
  push(steps, "loop", "Build heap from first index ⌊n/2⌋−1 down to 0.", nums, {});
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    push(steps, "visit", `Build-phase sift root ${i}.`, nums, { highlight: [i], pivot: i });
    siftDown(steps, nums, n, i, n);
  }
  push(steps, "loop", "Extract max: swap root with unsorted suffix head, sift down.", nums, {});
  for (let end = n - 1; end > 0; end--) {
    push(steps, "compare", `Move largest (root) to position ${end}.`, nums, {
      highlight: [0, end],
      sortedRight: end + 1,
    });
    [nums[0], nums[end]] = [nums[end], nums[0]];
    push(steps, "update", `Locked nums[${end}] = ${nums[end]}.`, nums, {
      highlight: [end],
      sortedRight: end,
    });
    siftDown(steps, nums, end, 0, end);
    push(steps, "visit", `Suffix [${end}..${n - 1}] is sorted.`, nums, { sortedRight: end });
  }
  push(steps, "done", "Sorted.", nums, { done: true, sortedLeft: n });
  return steps;
}

export function radixSortSteps(input) {
  const nums = numsOf(input);
  const steps = [];
  const n = nums.length;
  push(steps, "init", "Radix sort (LSD, base 10) — demo expects non-negative integers.", nums, {});
  if (n <= 1) {
    push(steps, "done", "Already sorted.", nums, { done: true, sortedLeft: n });
    return steps;
  }
  const arr = [...nums];
  const maxV = Math.max(...arr);
  for (let exp = 1; Math.floor(maxV / exp) > 0; exp *= 10) {
    push(steps, "loop", `Digit place exp=${exp}.`, arr, {});
    const buckets = Array.from({ length: 10 }, () => []);
    for (let i = 0; i < n; i++) {
      const d = Math.floor(arr[i] / exp) % 10;
      push(steps, "compare", `Digit of arr[${i}] (${arr[i]}) at exp=${exp} → ${d}.`, arr, {
        highlight: [i],
        aux: buckets.map((b) => b.length),
        auxLabel: "bucket sizes",
      });
      buckets[d].push(arr[i]);
      push(steps, "update", `Enqueue ${arr[i]} into bucket ${d}.`, arr, {
        highlight: [i],
        aux: buckets.map((b) => b.length),
        auxLabel: "bucket sizes",
      });
    }
    let k = 0;
    for (let d = 0; d < 10; d++) {
      for (const v of buckets[d]) {
        arr[k] = v;
        push(steps, "visit", `Pull from bucket ${d}, write ${v} at ${k}.`, arr, {
          highlight: [k],
          aux: buckets.map((b) => b.length),
          auxLabel: "bucket sizes",
        });
        k++;
      }
    }
    push(steps, "visit", `Finished pass exp=${exp}.`, arr, {});
  }
  for (let i = 0; i < n; i++) nums[i] = arr[i];
  push(steps, "done", "Sorted.", nums, { done: true, sortedLeft: n });
  return steps;
}

function knuthGaps(n) {
  const gaps = [];
  let g = 1;
  while (g < n) {
    gaps.push(g);
    g = 3 * g + 1;
  }
  return gaps.reverse();
}

export function shellSortSteps(input) {
  const nums = numsOf(input);
  const steps = [];
  const n = nums.length;
  push(steps, "init", "Shell sort: insertion sort with diminishing gaps (Knuth 3k+1).", nums, {});
  if (n <= 1) {
    push(steps, "done", "Already sorted.", nums, { done: true, sortedLeft: n });
    return steps;
  }
  const gaps = knuthGaps(n);
  for (const gap of gaps) {
    push(steps, "loop", `Gap = ${gap}.`, nums, {});
    for (let i = gap; i < n; i++) {
      const temp = nums[i];
      let j = i;
      push(steps, "visit", `Insert nums[${i}] with gap ${gap}.`, nums, { highlight: [i, j - gap], sortedLeft: i });
      while (j >= gap && nums[j - gap] > temp) {
        push(steps, "compare", `Compare nums[${j - gap}] (${nums[j - gap]}) > ${temp}? Shift.`, nums, {
          highlight: [j, j - gap],
        });
        nums[j] = nums[j - gap];
        push(steps, "update", `Shift value from ${j - gap} → ${j}.`, nums, { highlight: [j] });
        j -= gap;
      }
      nums[j] = temp;
      push(steps, "update", `Place ${temp} at index ${j}.`, nums, { highlight: [j] });
    }
  }
  push(steps, "done", "Sorted.", nums, { done: true, sortedLeft: n });
  return steps;
}

export function quickSortSteps(input) {
  const nums = numsOf(input);
  const steps = [];
  const n = nums.length;
  push(steps, "init", "Quicksort (Lomuto): partition around pivot at end of segment.", nums, {});
  if (n <= 1) {
    push(steps, "done", "Already sorted.", nums, { done: true, sortedLeft: n });
    return steps;
  }

  function part(lo, hi) {
    const pivotVal = nums[hi];
    push(steps, "visit", `Partition nums[${lo}..${hi}], pivot = nums[${hi}] = ${pivotVal}.`, nums, {
      highlight: [hi],
      pivot: hi,
      sortedLeft: lo,
      sortedRight: hi + 1,
    });
    let i = lo;
    for (let j = lo; j < hi; j++) {
      push(steps, "compare", `Compare nums[${j}] (${nums[j]}) with pivot ${pivotVal}.`, nums, {
        highlight: [j, hi],
        pivot: hi,
      });
      if (nums[j] <= pivotVal) {
        if (i !== j) {
          [nums[i], nums[j]] = [nums[j], nums[i]];
          push(steps, "update", `Swap nums[${i}] and nums[${j}] (≤ pivot region grows).`, nums, {
            highlight: [i, j],
            pivot: hi,
          });
        }
        i++;
      }
    }
    [nums[i], nums[hi]] = [nums[hi], nums[i]];
    push(steps, "update", `Place pivot at index ${i}.`, nums, {
      highlight: [i],
      pivot: i,
    });
    return i;
  }

  function qs(lo, hi) {
    if (lo >= hi) return;
    push(steps, "loop", `Quicksort recursive span [${lo}, ${hi}].`, nums, {
      highlight: [lo, hi],
      sortedLeft: lo,
      sortedRight: hi + 1,
    });
    const p = part(lo, hi);
    qs(lo, p - 1);
    qs(p + 1, hi);
  }

  qs(0, n - 1);
  push(steps, "done", "Sorted.", nums, { done: true, sortedLeft: n });
  return steps;
}

export function bucketSortSteps(input) {
  const nums = numsOf(input);
  const steps = [];
  const n = nums.length;
  push(steps, "init", "Bucket sort (uniform [0,1)): distribute into buckets, sort each, concatenate.", nums, {});
  if (n <= 1) {
    push(steps, "done", "Already sorted.", nums, { done: true, sortedLeft: n });
    return steps;
  }
  const buckets = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    const x = nums[i];
    const xf = Math.min(1 - Number.EPSILON, Math.max(0, Number(x) || 0));
    const bi = Math.min(n - 1, Math.floor(xf * n));
    push(steps, "compare", `Map nums[${i}] = ${x} → bucket index ${bi}.`, nums, {
      highlight: [i],
      aux: buckets.map((b) => b.length),
      auxLabel: "bucket sizes",
    });
    buckets[bi].push(x);
    push(steps, "update", `Append to bucket ${bi}.`, nums, {
      highlight: [i],
      aux: buckets.map((b) => b.length),
      auxLabel: "bucket sizes",
    });
  }
  for (let b = 0; b < n; b++) {
    buckets[b].sort((a, c) => a - c);
    push(steps, "visit", `Sort bucket ${b} (small array).`, nums, {
      aux: buckets.map((x) => x.length),
      auxLabel: "bucket sizes",
    });
  }
  let k = 0;
  for (let b = 0; b < n; b++) {
    for (const v of buckets[b]) {
      nums[k] = v;
      push(steps, "update", `Concatenate: nums[${k}] = ${v}.`, nums, {
        highlight: [k],
        aux: buckets.map((x) => x.length),
        auxLabel: "bucket sizes",
      });
      k++;
    }
  }
  push(steps, "done", "Sorted.", nums, { done: true, sortedLeft: n });
  return steps;
}

export function maximumGapSteps(input) {
  const nums = numsOf(input);
  const steps = [];
  const n = nums.length;
  push(steps, "init", "Maximum gap: sort to inspect successive differences.", nums, {});
  if (n <= 1) {
    push(steps, "done", "No pairs — gap is 0.", nums, { done: true, sortedLeft: n });
    return steps;
  }
  const arr = [...nums];
  for (let i = 0; i < n; i++) {
    push(steps, "loop", `Selection round ${i}: find minimum of suffix starting at ${i}.`, arr, { sortedLeft: i });
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      push(steps, "compare", `Compare arr[${minIdx}] (${arr[minIdx]}) vs arr[${j}] (${arr[j]}).`, arr, {
        highlight: [minIdx, j],
        sortedLeft: i,
      });
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        push(steps, "update", `New minimum index ${minIdx}.`, arr, { highlight: [minIdx], sortedLeft: i });
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      push(steps, "update", `Swap into sorted position ${i}.`, arr, { highlight: [i], sortedLeft: i });
    }
    push(steps, "visit", `Sorted prefix through ${i}.`, arr, { sortedLeft: i + 1 });
  }
  let best = 0;
  for (let i = 0; i < n - 1; i++) {
    const g = arr[i + 1] - arr[i];
    push(steps, "compare", `Adjacent sorted pair (${arr[i]}, ${arr[i + 1]}), gap = ${g}.`, arr, {
      highlight: [i, i + 1],
      sortedLeft: n,
    });
    best = Math.max(best, g);
    push(steps, "visit", `Running max gap = ${best}.`, arr, {
      highlight: [i + 1],
      sortedLeft: n,
      aux: [best],
      auxLabel: "max gap",
    });
  }
  for (let i = 0; i < n; i++) nums[i] = arr[i];
  push(steps, "done", `Sorted copy — maximum gap = ${best}.`, nums, {
    done: true,
    sortedLeft: n,
    aux: [best],
    auxLabel: "answer",
  });
  return steps;
}

export const SORTING_STEP_GENERATORS = {
  "bubble-sort": bubbleSortSteps,
  "selection-sort": selectionSortSteps,
  "insertion-sort": insertionSortSteps,
  "iterative-merge-sort": iterativeMergeSortSteps,
  "counting-sort": countingSortSteps,
  "heap-sort": heapSortSteps,
  "radix-sort": radixSortSteps,
  "shell-sort": shellSortSteps,
  "sort-an-array": quickSortSteps,
  "bucket-sort": bucketSortSteps,
  "maximum-gap": maximumGapSteps,
};
