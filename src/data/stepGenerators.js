// Step generators produce an array of animation steps for each problem.
// Each step: { stepType, description, state }

export function generateTwoSumSteps({ nums, target }) {
  const steps = [], map = {};
  steps.push({ stepType: "init", description: "Initialize an empty hash map", state: { i: -1, map: {}, highlight: [], found: false } });
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    steps.push({ stepType: "loop",       description: `Loop: i=${i}  →  nums[${i}]=${nums[i]}`,                         state: { i, map: { ...map }, highlight: [i], found: false } });
    steps.push({ stepType: "complement", description: `complement = ${target} − ${nums[i]} = ${complement}`,             state: { i, map: { ...map }, highlight: [i], found: false, complement } });
    if (map[complement] !== undefined) {
      steps.push({ stepType: "found",    description: `✅ Found! map[${complement}]=${map[complement]} → [${map[complement]},${i}]`, state: { i, map: { ...map }, highlight: [map[complement], i], found: true } });
      return steps;
    }
    steps.push({ stepType: "store",      description: `${complement} not in map — store map[${nums[i]}]=${i}`,           state: { i, map: { ...map, [nums[i]]: i }, highlight: [i], found: false } });
    map[nums[i]] = i;
  }
  return steps;
}

export function generateLongestConsecutiveSteps({ nums }) {
  const steps = [];
  const numSet = new Set(nums);
  const setArr = [...numSet].sort((a, b) => a - b);
  let longest = 0;
  steps.push({ stepType: "init_set",     description: "Build hash set — O(1) lookup, duplicates removed", state: { current: null, setArr, streakNums: [], longest: 0 } });
  steps.push({ stepType: "init_longest", description: "Initialize longest = 0",                           state: { current: null, setArr, streakNums: [], longest: 0 } });
  for (const n of numSet) {
    steps.push({ stepType: "loop", description: `Examining n = ${n}`, state: { current: n, setArr, streakNums: [], longest } });
    if (numSet.has(n - 1)) {
      steps.push({ stepType: "skip", description: `${n-1} in set → ${n} is not a start, skip`, state: { current: n, setArr, streakNums: [], longest, skipped: n } });
      continue;
    }
    steps.push({ stepType: "check_start",  description: `${n-1} NOT in set → ${n} is a sequence start! 🚀`, state: { current: n, setArr, streakNums: [n], longest } });
    steps.push({ stepType: "begin_streak", description: `Start counting — curr=${n}, streak=1`,             state: { current: n, setArr, streakNums: [n], longest } });
    let curr = n, streak = 1;
    while (numSet.has(curr + 1)) {
      curr++; streak++;
      steps.push({ stepType: "extend_streak", description: `${curr} in set → streak=${streak}`, state: { current: curr, setArr, streakNums: Array.from({ length: streak }, (_, k) => n + k), longest } });
    }
    const newLongest = Math.max(longest, streak);
    steps.push({ stepType: "update_longest", description: `Streak ended. longest=max(${longest},${streak})=${newLongest}`, state: { current: n, setArr, streakNums: Array.from({ length: streak }, (_, k) => n + k), longest: newLongest } });
    longest = newLongest;
  }
  steps.push({ stepType: "done", description: `✅ Longest consecutive = ${longest}`, state: { current: null, setArr, streakNums: [], longest, done: true } });
  return steps;
}

export function generateContainsDuplicateSteps({ nums }) {
  if (!nums || !nums.length) return [];
  const steps = [], seen = new Set();
  steps.push({ stepType: "init", description: "Initialize empty hash set", state: { i: -1, seen: [], highlight: [], found: false } });
  for (let i = 0; i < nums.length; i++) {
    steps.push({ stepType: "loop", description: `i=${i} → nums[${i}]=${nums[i]}`, state: { i, seen: [...seen], highlight: [i], found: false } });
    if (seen.has(nums[i])) {
      steps.push({ stepType: "found", description: `✅ ${nums[i]} already in set → duplicate! return true`, state: { i, seen: [...seen], highlight: [i], found: true, duplicate: nums[i] } });
      return steps;
    }
    seen.add(nums[i]);
    steps.push({ stepType: "store", description: `Added ${nums[i]} to set`, state: { i, seen: [...seen], highlight: [i], found: false } });
  }
  steps.push({ stepType: "done", description: "✅ No duplicates found → return false", state: { i: -1, seen: [...seen], highlight: [], found: false, done: true } });
  return steps;
}

export function generateAnagramSteps({ s, t }) {
  if (!s || !t) return [];
  const steps = [], freq = {};
  if (s.length !== t.length) {
    steps.push({ stepType: "check_len", description: `len(s)=${s.length} ≠ len(t)=${t.length} → return false`, state: { freq: {}, hl_s: -1, hl_t: -1, result: false } });
    return steps;
  }
  steps.push({ stepType: "check_len", description: `Lengths match (${s.length}) ✓`, state: { freq: {}, hl_s: -1, hl_t: -1, result: null } });
  for (let i = 0; i < s.length; i++) {
    freq[s[i]] = (freq[s[i]] || 0) + 1;
    steps.push({ stepType: "count_s", description: `s[${i}]='${s[i]}' → freq=${freq[s[i]]}`, state: { freq: { ...freq }, hl_s: i, hl_t: -1, result: null } });
  }
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    freq[c] = (freq[c] || 0) - 1;
    if (freq[c] < 0) {
      steps.push({ stepType: "mismatch", description: `❌ t[${i}]='${c}' → freq<0 → not an anagram`, state: { freq: { ...freq }, hl_s: -1, hl_t: i, result: false, badChar: c } });
      return steps;
    }
    steps.push({ stepType: "decrement", description: `t[${i}]='${c}' → freq=${freq[c]}`, state: { freq: { ...freq }, hl_s: -1, hl_t: i, result: null } });
  }
  steps.push({ stepType: "done", description: "✅ All counts are 0 → valid anagram!", state: { freq: { ...freq }, hl_s: -1, hl_t: -1, result: true } });
  return steps;
}

export function generateStockSteps({ prices }) {
  if (!prices || !prices.length) return [];
  const steps = []; let minPrice = Infinity, maxProfit = 0, bestBuy = -1, bestSell = -1;
  steps.push({ stepType: "init", description: "minPrice=∞, maxProfit=0", state: { i: -1, minPrice: null, maxProfit: 0, buyDay: -1, sellDay: -1 } });
  for (let i = 0; i < prices.length; i++) {
    steps.push({ stepType: "loop", description: `Day ${i}: price=${prices[i]}`, state: { i, minPrice, maxProfit, buyDay: bestBuy, sellDay: -1 } });
    if (prices[i] < minPrice) {
      minPrice = prices[i]; bestBuy = i;
      steps.push({ stepType: "update_min", description: `New low! minPrice=${minPrice} (buy day ${i})`, state: { i, minPrice, maxProfit, buyDay: bestBuy, sellDay: -1 } });
    }
    const profit = prices[i] - minPrice;
    if (profit > maxProfit) {
      maxProfit = profit; bestSell = i;
      steps.push({ stepType: "update_profit", description: `New max profit! ${prices[i]}−${minPrice}=${profit} 💰`, state: { i, minPrice, maxProfit, buyDay: bestBuy, sellDay: bestSell } });
    } else {
      steps.push({ stepType: "update_profit", description: `Profit today: ${profit} (not better than ${maxProfit})`, state: { i, minPrice, maxProfit, buyDay: bestBuy, sellDay: -1 } });
    }
  }
  steps.push({ stepType: "done", description: `✅ Max profit = ${maxProfit}`, state: { i: -1, minPrice, maxProfit, buyDay: bestBuy, sellDay: bestSell, done: true } });
  return steps;
}

export function generateBinarySearchSteps({ nums, target }) {
  if (!nums || !nums.length) return [];
  const steps = []; let left = 0, right = nums.length - 1;
  steps.push({ stepType: "init", description: `left=0, right=${right}`, state: { left, right, mid: -1, found: -1, eliminated: [] } });
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    steps.push({ stepType: "loop",     description: `left=${left}, right=${right}`, state: { left, right, mid, found: -1, eliminated: [] } });
    steps.push({ stepType: "calc_mid", description: `mid=${mid} → nums[${mid}]=${nums[mid]}`,  state: { left, right, mid, found: -1, eliminated: [] } });
    if (nums[mid] === target) {
      steps.push({ stepType: "found", description: `✅ Found! return ${mid}`, state: { left, right, mid, found: mid, eliminated: [] } });
      return steps;
    }
    if (target > nums[mid]) {
      const el = Array.from({ length: mid + 1 }, (_, k) => k);
      steps.push({ stepType: "go_right", description: `${target}>${nums[mid]} → left=${mid + 1}`, state: { left: mid + 1, right, mid, found: -1, eliminated: el } });
      left = mid + 1;
    } else {
      const el = Array.from({ length: nums.length - mid }, (_, k) => mid + k);
      steps.push({ stepType: "go_left", description: `${target}<${nums[mid]} → right=${mid - 1}`, state: { left, right: mid - 1, mid, found: -1, eliminated: el } });
      right = mid - 1;
    }
  }
  steps.push({ stepType: "done", description: `❌ ${target} not found → return -1`, state: { left, right, mid: -1, found: -1, eliminated: [] } });
  return steps;
}

export function generateClimbingStairsSteps({ n }) {
  n = Math.max(1, Number(n) || 1);
  const steps = [];
  if (n <= 2) {
    steps.push({ stepType: "base", description: `n=${n} → base case, return ${n}`, state: { step: n, prev2: n <= 1 ? 0 : 1, prev1: n, curr: n, done: true } });
    return steps;
  }
  steps.push({ stepType: "base", description: "Base: ways(1)=1, ways(2)=2", state: { step: 2, prev2: 1, prev1: 2, curr: 2, done: false } });
  steps.push({ stepType: "init", description: "prev2=1, prev1=2", state: { step: 2, prev2: 1, prev1: 2, curr: 2, done: false } });
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    steps.push({ stepType: "loop",    description: `Step ${i}`, state: { step: i, prev2, prev1, curr: null, done: false } });
    steps.push({ stepType: "compute", description: `ways(${i})=${prev1}+${prev2}=${curr}`, state: { step: i, prev2, prev1, curr, done: false } });
    steps.push({ stepType: "slide",   description: `Slide: prev2=${prev1}, prev1=${curr}`, state: { step: i, prev2: prev1, prev1: curr, curr, done: false } });
    prev2 = prev1; prev1 = curr;
  }
  steps.push({ stepType: "done", description: `✅ Answer = ${prev1}`, state: { step: n, prev2, prev1, curr: prev1, done: true } });
  return steps;
}

export function generateMaxSubarraySteps({ nums }) {
  if (!nums || !nums.length) return [];
  const steps = [];
  let currentSum = nums[0], maxSum = nums[0], start = 0;
  steps.push({ stepType: "init", description: `currentSum = maxSum = nums[0] = ${nums[0]}`, state: { i: 0, currentSum, maxSum, start, highlight: [0], done: false } });
  for (let i = 1; i < nums.length; i++) {
    const extend = currentSum + nums[i];
    const newCurrent = Math.max(nums[i], extend);
    const resetStart = newCurrent === nums[i];
    if (resetStart) start = i;
    const newMax = Math.max(maxSum, newCurrent);
    steps.push({ stepType: "loop", description: `i=${i} → nums[${i}]=${nums[i]}`, state: { i, currentSum, maxSum, start, highlight: Array.from({ length: i - start + 1 }, (_, k) => start + k), done: false } });
    steps.push({ stepType: "update_current", description: `currentSum = max(${nums[i]}, ${currentSum}+${nums[i]}) = max(${nums[i]}, ${extend}) = ${newCurrent}`, state: { i, currentSum: newCurrent, maxSum, start, highlight: Array.from({ length: i - start + 1 }, (_, k) => start + k), done: false } });
    currentSum = newCurrent;
    steps.push({ stepType: "update_max", description: `maxSum = max(${maxSum}, ${currentSum}) = ${newMax}`, state: { i, currentSum, maxSum: newMax, start, highlight: Array.from({ length: i - start + 1 }, (_, k) => start + k), done: false } });
    maxSum = newMax;
  }
  steps.push({ stepType: "done", description: `✅ Max subarray sum = ${maxSum}`, state: { i: nums.length - 1, currentSum, maxSum, start, highlight: Array.from({ length: nums.length - start }, (_, k) => start + k), done: true } });
  return steps;
}

function isSameTreeSteps(rootArr, subRootArr, rootStart, steps, stepState) {
  const rLen = rootArr.length;
  const sLen = subRootArr.length;
  function sameTree(rIdx, sIdx, rPath, sPath) {
    const rNull = rIdx < 0 || rIdx >= rLen || rootArr[rIdx] === null;
    const sNull = sIdx < 0 || sIdx >= sLen || subRootArr[sIdx] === null;
    if (rNull && sNull) {
      steps.push({ stepType: "same_base", description: "Both null → match", state: { ...stepState, sameRootPath: rPath, sameSubPath: sPath, sameResult: true } });
      return true;
    }
    if (rNull || sNull) {
      steps.push({ stepType: "same_mismatch", description: `One null (root=${rNull}, sub=${sNull}) → not same`, state: { ...stepState, sameRootPath: rPath, sameSubPath: sPath, sameResult: false } });
      return false;
    }
    const rVal = rootArr[rIdx];
    const sVal = subRootArr[sIdx];
    steps.push({ stepType: "same_compare", description: `Compare root[${rIdx}]=${rVal} vs subRoot[${sIdx}]=${sVal}`, state: { ...stepState, sameRootPath: [...rPath, rIdx], sameSubPath: [...sPath, sIdx], sameResult: null } });
    if (rVal !== sVal) {
      steps.push({ stepType: "same_mismatch", description: `Values ${rVal} ≠ ${sVal} → not same`, state: { ...stepState, sameRootPath: [...rPath, rIdx], sameSubPath: [...sPath, sIdx], sameResult: false } });
      return false;
    }
    const rLeft = 2 * rIdx + 1, rRight = 2 * rIdx + 2;
    const sLeft = 2 * sIdx + 1, sRight = 2 * sIdx + 2;
    const leftOk = sameTree(rLeft, sLeft, [...rPath, rIdx], [...sPath, sIdx]);
    const rightOk = sameTree(rRight, sRight, [...rPath, rIdx], [...sPath, sIdx]);
    const result = leftOk && rightOk;
    steps.push({ stepType: "same_recurse", description: `Left ${leftOk}, right ${rightOk} → ${result ? "same tree ✓" : "not same"}`, state: { ...stepState, sameRootPath: [...rPath, rIdx], sameSubPath: [...sPath, sIdx], sameResult: result } });
    return result;
  }
  sameTree(rootStart, 0, [], []);
}

export function generateSubtreeSteps({ root, subRoot }) {
  const rootArr = Array.isArray(root) ? root : [];
  const subRootArr = Array.isArray(subRoot) ? subRoot : [];
  const steps = [];
  const rLen = rootArr.length;
  if (!rLen || rootArr[0] === null) {
    steps.push({ stepType: "subtree_base", description: "root is null → return false", state: { rootArr, subRootArr, rootVisit: -1, found: false } });
    return steps;
  }
  if (!subRootArr.length) {
    steps.push({ stepType: "done", description: "subRoot is empty → return true", state: { rootArr, subRootArr, rootVisit: -1, found: true } });
    return steps;
  }
  function dfs(rootIdx) {
    if (rootIdx < 0 || rootIdx >= rLen || rootArr[rootIdx] === null) return false;
    const val = rootArr[rootIdx];
    steps.push({ stepType: "visit", description: `Visit root node at index ${rootIdx}, value=${val}. Check: is this subtree same as subRoot?`, state: { rootArr, subRootArr, rootVisit: rootIdx, found: false } });
    const stepState = { rootArr, subRootArr, rootVisit: rootIdx, found: false };
    isSameTreeSteps(rootArr, subRootArr, rootIdx, steps, stepState);
    const lastSame = steps[steps.length - 1];
    const found = lastSame?.state?.sameResult === true;
    if (found) {
      steps.push({ stepType: "subtree_found", description: `✅ Same tree found at root index ${rootIdx}! return true`, state: { rootArr, subRootArr, rootVisit: rootIdx, found: true, matchAt: rootIdx } });
      return true;
    }
    const leftIdx = 2 * rootIdx + 1;
    const rightIdx = 2 * rootIdx + 2;
    steps.push({ stepType: "subtree_recurse", description: `No match here. Recurse on left (${leftIdx}) and right (${rightIdx})`, state: { rootArr, subRootArr, rootVisit: rootIdx, found: false } });
    if (dfs(leftIdx)) return true;
    if (dfs(rightIdx)) return true;
    return false;
  }
  dfs(0);
  const last = steps[steps.length - 1];
  if (last?.state?.found) return steps;
  steps.push({ stepType: "done", description: "❌ No subtree of root matches subRoot → return false", state: { rootArr, subRootArr, rootVisit: -1, found: false, done: true } });
  return steps;
}

export function generateValidPalindromeSteps({ s }) {
  if (!s) s = "";
  const steps = [];
  let left = 0, right = s.length - 1;
  const isAlphaNum = (c) => /[a-zA-Z0-9]/.test(c);

  steps.push({ stepType: "init", description: `Initialize left=0, right=${right}`, state: { left, right, result: null, done: false } });

  while (left < right) {
    steps.push({ stepType: "loop", description: `left=${left}, right=${right}`, state: { left, right, result: null, done: false } });

    while (left < right && !isAlphaNum(s[left])) {
      left++;
      steps.push({ stepType: "skip_left", description: `'${s[left - 1]}' not alphanumeric → skip left to ${left}`, state: { left, right, result: null, done: false } });
    }
    while (left < right && !isAlphaNum(s[right])) {
      right--;
      steps.push({ stepType: "skip_right", description: `'${s[right + 1]}' not alphanumeric → skip right to ${right}`, state: { left, right, result: null, done: false } });
    }

    if (left >= right) break;

    const lc = s[left].toLowerCase();
    const rc = s[right].toLowerCase();

    if (lc === rc) {
      steps.push({ stepType: "compare", description: `'${lc}' == '${rc}' → match, move inward`, state: { left, right, result: null, done: false } });
      left++;
      right--;
    } else {
      steps.push({ stepType: "found", description: `'${lc}' ≠ '${rc}' → not a palindrome`, state: { left, right, result: false, done: true } });
      return steps;
    }
  }

  steps.push({ stepType: "done", description: "✅ Valid palindrome!", state: { left, right, result: true, done: true } });
  return steps;
}

export function generateValidParenthesesSteps({ s }) {
  if (!s) s = "";
  const steps = [];
  const stack = [];
  const closeToOpen = { ")": "(", "]": "[", "}": "{" };

  steps.push({ stepType: "init", description: "Initialize empty stack", state: { i: -1, char: null, stack: [], action: null, valid: null, done: false } });

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    steps.push({ stepType: "loop", description: `i=${i} → char='${char}'`, state: { i, char, stack: [...stack], action: null, valid: null, done: false } });

    if (char === "(" || char === "[" || char === "{") {
      stack.push(char);
      steps.push({ stepType: "push", description: `'${char}' is opening → push to stack`, state: { i, char, stack: [...stack], action: "push", valid: null, done: false } });
    } else if (closeToOpen[char]) {
      if (stack.length === 0 || stack[stack.length - 1] !== closeToOpen[char]) {
        steps.push({ stepType: "mismatch", description: `'${char}' doesn't match top '${stack.length ? stack[stack.length - 1] : "empty"}' → invalid`, state: { i, char, stack: [...stack], action: "mismatch", valid: false, done: true } });
        return steps;
      }
      stack.pop();
      steps.push({ stepType: "pop_match", description: `'${char}' matches '${closeToOpen[char]}' → pop`, state: { i, char, stack: [...stack], action: "pop", valid: null, done: false } });
    }
  }

  const valid = stack.length === 0;
  steps.push({ stepType: "done", description: valid ? "✅ Stack empty → valid parentheses!" : "❌ Stack not empty → invalid", state: { i: s.length, char: null, stack: [...stack], action: null, valid, done: true } });
  return steps;
}

export function generateProductExceptSelfSteps({ nums }) {
  if (!nums || !nums.length) return [];
  const steps = [];
  const n = nums.length;
  const result = new Array(n).fill(1);
  let prefix = 1;

  steps.push({ stepType: "init", description: `Initialize result=[${result.join(",")}], prefix=1`, state: { i: -1, phase: "prefix", prefix: 1, result: [...result], done: false } });

  for (let i = 0; i < n; i++) {
    steps.push({ stepType: "prefix_loop", description: `Prefix pass: i=${i}`, state: { i, phase: "prefix", prefix, result: [...result], done: false } });
    result[i] = prefix;
    steps.push({ stepType: "prefix_compute", description: `result[${i}] = prefix = ${result[i]}`, state: { i, phase: "prefix", prefix, result: [...result], done: false } });
    prefix *= nums[i];
    steps.push({ stepType: "prefix_update", description: `prefix *= nums[${i}] → prefix = ${prefix}`, state: { i, phase: "prefix", prefix, result: [...result], done: false } });
  }

  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    steps.push({ stepType: "suffix_loop", description: `Suffix pass: i=${i}`, state: { i, phase: "suffix", prefix: suffix, result: [...result], done: false } });
    result[i] *= suffix;
    steps.push({ stepType: "suffix_compute", description: `result[${i}] *= suffix → ${result[i]}`, state: { i, phase: "suffix", prefix: suffix, result: [...result], done: false } });
    suffix *= nums[i];
    steps.push({ stepType: "suffix_update", description: `suffix *= nums[${i}] → suffix = ${suffix}`, state: { i, phase: "suffix", prefix: suffix, result: [...result], done: false } });
  }

  steps.push({ stepType: "done", description: `✅ Product except self = [${result.join(",")}]`, state: { i: -1, phase: "done", prefix: 0, result: [...result], done: true } });
  return steps;
}

export function generateMaxProductSubarraySteps({ nums }) {
  if (!nums || !nums.length) return [];
  const steps = [];
  let curMax = nums[0], curMin = nums[0], maxProd = nums[0];

  steps.push({ stepType: "init", description: `maxProd = ${maxProd}`, state: { i: 0, highlight: [0], curMax, curMin, maxProd, done: false } });
  steps.push({ stepType: "init_vars", description: `curMax = curMin = ${curMax}`, state: { i: 0, highlight: [0], curMax, curMin, maxProd, done: false } });

  for (let i = 1; i < nums.length; i++) {
    steps.push({ stepType: "loop", description: `i=${i} → nums[${i}]=${nums[i]}`, state: { i, highlight: [i], curMax, curMin, maxProd, done: false } });

    if (nums[i] < 0) {
      [curMax, curMin] = [curMin, curMax];
      steps.push({ stepType: "swap", description: `nums[${i}]=${nums[i]} < 0 → swap curMax↔curMin`, state: { i, highlight: [i], curMax, curMin, maxProd, done: false } });
    }

    const prevMax = curMax, prevMin = curMin;
    curMax = Math.max(nums[i], prevMax * nums[i]);
    steps.push({ stepType: "compute_max", description: `curMax = max(${nums[i]}, ${prevMax}×${nums[i]}) = ${curMax}`, state: { i, highlight: [i], curMax, curMin: prevMin, maxProd, done: false } });

    curMin = Math.min(nums[i], prevMin * nums[i]);
    steps.push({ stepType: "compute_min", description: `curMin = min(${nums[i]}, ${prevMin}×${nums[i]}) = ${curMin}`, state: { i, highlight: [i], curMax, curMin, maxProd, done: false } });

    const prevMaxProd = maxProd;
    maxProd = Math.max(maxProd, curMax);
    steps.push({ stepType: "update", description: `maxProd = max(${prevMaxProd}, ${curMax}) = ${maxProd}`, state: { i, highlight: [i], curMax, curMin, maxProd, done: false } });
  }

  steps.push({ stepType: "done", description: `✅ Maximum product = ${maxProd}`, state: { i: nums.length - 1, highlight: [], curMax, curMin, maxProd, done: true } });
  return steps;
}

export function generateHouseRobberSteps({ nums }) {
  if (!nums || !nums.length) return [];
  const steps = [];
  const n = nums.length;

  if (n === 1) {
    steps.push({ stepType: "base", description: `Only one house → rob it for ${nums[0]}`, state: { i: 0, dp: [nums[0]], choice: "rob", maxRob: nums[0], done: true } });
    return steps;
  }

  const dp = new Array(n).fill(0);
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0], nums[1]);

  steps.push({ stepType: "base", description: `dp[0]=${dp[0]}, dp[1]=max(${nums[0]},${nums[1]})=${dp[1]}`, state: { i: 1, dp: [...dp], choice: null, maxRob: dp[1], done: false } });
  steps.push({ stepType: "init", description: "Base cases set, iterate from i=2", state: { i: 1, dp: [...dp], choice: null, maxRob: dp[1], done: false } });

  for (let i = 2; i < n; i++) {
    steps.push({ stepType: "loop", description: `House ${i}: value=${nums[i]}`, state: { i, dp: [...dp], choice: null, maxRob: dp[i - 1], done: false } });

    const rob = dp[i - 2] + nums[i];
    const skip = dp[i - 1];
    dp[i] = Math.max(rob, skip);
    const choice = rob > skip ? "rob" : "skip";

    steps.push({ stepType: "compute", description: `rob: dp[${i - 2}]+${nums[i]}=${rob}, skip: dp[${i - 1}]=${skip} → ${choice} → dp[${i}]=${dp[i]}`, state: { i, dp: [...dp], choice, maxRob: dp[i], done: false } });
    steps.push({ stepType: "slide", description: `prev2 = prev1`, state: { i, dp: [...dp], choice, maxRob: dp[i], done: false } });
    steps.push({ stepType: "slide_curr", description: `prev1 = curr = ${dp[i]}`, state: { i, dp: [...dp], choice, maxRob: dp[i], done: false } });
  }

  steps.push({ stepType: "done", description: `✅ Max robbery = ${dp[n - 1]}`, state: { i: n - 1, dp: [...dp], choice: null, maxRob: dp[n - 1], done: true } });
  return steps;
}

export function generateMissingNumberSteps({ nums }) {
  if (!nums) return [];
  const steps = [];
  const n = nums.length;
  let expected = (n * (n + 1)) / 2;

  steps.push({ stepType: "init", description: `n=${n}, expected = ${n}×${n + 1}/2 = ${expected}`, state: { i: -1, highlight: [], expectedSum: expected, currentSum: 0, missing: null, done: false } });

  for (let i = 0; i < n; i++) {
    steps.push({ stepType: "loop", description: `i=${i} → nums[${i}]=${nums[i]}`, state: { i, highlight: [i], expectedSum: expected, currentSum: 0, missing: null, done: false } });
    expected -= nums[i];
    steps.push({ stepType: "subtract", description: `expected -= ${nums[i]} → ${expected}`, state: { i, highlight: [i], expectedSum: (n * (n + 1)) / 2, currentSum: (n * (n + 1)) / 2 - expected, missing: null, done: false } });
  }

  steps.push({ stepType: "done", description: `✅ Missing number = ${expected}`, state: { i: n, highlight: [], expectedSum: (n * (n + 1)) / 2, currentSum: (n * (n + 1)) / 2 - expected, missing: expected, done: true } });
  return steps;
}

export function generateMaxDepthTreeSteps({ root }) {
  const arr = Array.isArray(root) ? root : [];
  const steps = [];
  const depthMap = {};
  let maxDepth = 0;

  if (!arr.length || arr[0] === null) {
    steps.push({ stepType: "base_null", description: "Tree is empty → depth 0", state: { visiting: -1, depthMap: {}, maxDepth: 0, done: true } });
    return steps;
  }

  function dfs(idx) {
    if (idx >= arr.length || arr[idx] === null || arr[idx] === undefined) {
      steps.push({ stepType: "base_null", description: `Node ${idx} is null/out of bounds → depth 0`, state: { visiting: idx, depthMap: { ...depthMap }, maxDepth, done: false } });
      return 0;
    }

    steps.push({ stepType: "visit", description: `Visit node ${idx} (value=${arr[idx]})`, state: { visiting: idx, depthMap: { ...depthMap }, maxDepth, done: false } });
    steps.push({ stepType: "recurse", description: `Recurse left (${2 * idx + 1}) and right (${2 * idx + 2})`, state: { visiting: idx, depthMap: { ...depthMap }, maxDepth, done: false } });

    const leftDepth = dfs(2 * idx + 1);
    const rightDepth = dfs(2 * idx + 2);
    const depth = 1 + Math.max(leftDepth, rightDepth);

    depthMap[idx] = depth;
    maxDepth = Math.max(maxDepth, depth);

    steps.push({ stepType: "compute", description: `depth(${idx}) = 1 + max(${leftDepth}, ${rightDepth}) = ${depth}`, state: { visiting: idx, depthMap: { ...depthMap }, maxDepth, done: false } });
    return depth;
  }

  dfs(0);
  steps.push({ stepType: "done", description: `✅ Max depth = ${maxDepth}`, state: { visiting: -1, depthMap: { ...depthMap }, maxDepth, done: true } });
  return steps;
}

export function generateInvertTreeSteps({ root }) {
  const arr = Array.isArray(root) ? root : [];
  if (!arr.length || arr[0] === null) {
    return [{ stepType: "base", description: "Tree is empty → nothing to invert", state: { visiting: -1, swapped: [], inverted: [...arr], done: true } }];
  }

  const steps = [];
  const inverted = [...arr];
  while (inverted.length < 2 * arr.length + 2) inverted.push(null);
  const swapped = [];

  function swapSub(a, i, j) {
    if (i >= a.length && j >= a.length) return;
    const vi = i < a.length ? a[i] : null;
    const vj = j < a.length ? a[j] : null;
    if (i < a.length) a[i] = vj;
    if (j < a.length) a[j] = vi;
    swapSub(a, 2 * i + 1, 2 * j + 1);
    swapSub(a, 2 * i + 2, 2 * j + 2);
  }

  function dfs(idx) {
    if (idx >= inverted.length || inverted[idx] === null || inverted[idx] === undefined) {
      steps.push({ stepType: "base", description: `Node ${idx} is null/out of bounds`, state: { visiting: idx, swapped: [...swapped], inverted: [...inverted], done: false } });
      return;
    }

    steps.push({ stepType: "visit", description: `Visit node ${idx} (value=${inverted[idx]})`, state: { visiting: idx, swapped: [...swapped], inverted: [...inverted], done: false } });

    const leftIdx = 2 * idx + 1;
    const rightIdx = 2 * idx + 2;

    swapSub(inverted, leftIdx, rightIdx);
    swapped.push(idx);

    steps.push({ stepType: "swap", description: `Save temp = left child of ${idx}`, state: { visiting: idx, swapped: [...swapped], inverted: [...inverted], done: false } });
    steps.push({ stepType: "swap_assign", description: `Assign left = right, right = temp for node ${idx}`, state: { visiting: idx, swapped: [...swapped], inverted: [...inverted], done: false } });
    steps.push({ stepType: "recurse", description: `Recurse into children of node ${idx}`, state: { visiting: idx, swapped: [...swapped], inverted: [...inverted], done: false } });

    dfs(leftIdx);
    dfs(rightIdx);
  }

  dfs(0);
  const trimmed = [...inverted];
  while (trimmed.length > 0 && (trimmed[trimmed.length - 1] === null || trimmed[trimmed.length - 1] === undefined)) trimmed.pop();
  steps.push({ stepType: "done", description: "✅ Tree inverted!", state: { visiting: -1, swapped: [...swapped], inverted: trimmed, done: true } });
  return steps;
}

export function generateSameTreeSteps({ p, q }) {
  const pArr = Array.isArray(p) ? p : [];
  const qArr = Array.isArray(q) ? q : [];
  const steps = [];
  const matchSet = [];
  let mismatch = null;

  function dfs(pi, qi) {
    const pNull = pi >= pArr.length || pArr[pi] === null || pArr[pi] === undefined;
    const qNull = qi >= qArr.length || qArr[qi] === null || qArr[qi] === undefined;

    if (pNull && qNull) {
      steps.push({ stepType: "both_null", description: `Both p[${pi}] and q[${qi}] are null → match`, state: { visitingP: pi, visitingQ: qi, matchSet: [...matchSet], mismatch, result: null, done: false } });
      return true;
    }

    if (pNull || qNull) {
      mismatch = pNull ? qi : pi;
      steps.push({ stepType: "one_null", description: `One null at p[${pi}]/q[${qi}] → mismatch`, state: { visitingP: pi, visitingQ: qi, matchSet: [...matchSet], mismatch, result: false, done: false } });
      return false;
    }

    steps.push({ stepType: "compare", description: `Compare p[${pi}]=${pArr[pi]} vs q[${qi}]=${qArr[qi]}`, state: { visitingP: pi, visitingQ: qi, matchSet: [...matchSet], mismatch, result: null, done: false } });

    if (pArr[pi] !== qArr[qi]) {
      mismatch = pi;
      steps.push({ stepType: "compare", description: `${pArr[pi]} ≠ ${qArr[qi]} → mismatch!`, state: { visitingP: pi, visitingQ: qi, matchSet: [...matchSet], mismatch, result: false, done: false } });
      return false;
    }

    matchSet.push(pi);
    steps.push({ stepType: "recurse", description: `p[${pi}]=q[${qi}]=${pArr[pi]} ✓ Recurse children`, state: { visitingP: pi, visitingQ: qi, matchSet: [...matchSet], mismatch, result: null, done: false } });

    const leftOk = dfs(2 * pi + 1, 2 * qi + 1);
    if (!leftOk) return false;
    return dfs(2 * pi + 2, 2 * qi + 2);
  }

  const result = dfs(0, 0);
  steps.push({ stepType: "done", description: result ? "✅ Trees are identical!" : "❌ Trees are not the same", state: { visitingP: -1, visitingQ: -1, matchSet: [...matchSet], mismatch, result, done: true } });
  return steps;
}

export function generateReverseLinkedListSteps({ head }) {
  if (!head || !head.length) return [];
  const steps = [];
  let prevIdx = -1, currIdx = 0;
  const reversed = [];

  steps.push({ stepType: "init", description: "prev = null", state: { prevIdx: -1, currIdx: -1, nextIdx: -1, reversed: [], done: false } });
  steps.push({ stepType: "init_curr", description: `curr = head (index 0, val=${head[0]})`, state: { prevIdx: -1, currIdx: 0, nextIdx: -1, reversed: [], done: false } });

  while (currIdx >= 0 && currIdx < head.length) {
    const nextIdx = currIdx + 1 < head.length ? currIdx + 1 : -1;

    steps.push({ stepType: "loop", description: `curr=${currIdx} (val=${head[currIdx]}), prev=${prevIdx === -1 ? "null" : prevIdx}`, state: { prevIdx, currIdx, nextIdx, reversed: [...reversed], done: false } });
    steps.push({ stepType: "save_next", description: `Save next = ${nextIdx === -1 ? "null" : nextIdx}`, state: { prevIdx, currIdx, nextIdx, reversed: [...reversed], done: false } });
    steps.push({ stepType: "reverse_ptr", description: `Reverse: node ${currIdx}.next → ${prevIdx === -1 ? "null" : prevIdx}`, state: { prevIdx, currIdx, nextIdx, reversed: [...reversed], done: false } });

    reversed.unshift(head[currIdx]);
    prevIdx = currIdx;
    currIdx = nextIdx;

    steps.push({ stepType: "advance", description: `prev = ${prevIdx}`, state: { prevIdx, currIdx, nextIdx, reversed: [...reversed], done: false } });
    steps.push({ stepType: "advance_curr", description: `curr = ${currIdx === -1 ? "null" : currIdx}`, state: { prevIdx, currIdx, nextIdx, reversed: [...reversed], done: false } });
  }

  steps.push({ stepType: "done", description: `✅ List reversed: [${reversed.join("→")}]`, state: { prevIdx, currIdx: -1, nextIdx: -1, reversed: [...reversed], done: true } });
  return steps;
}

// ── 3Sum: sort + two pointers for each i ─────────────────────────────────
export function generateThreeSumSteps({ nums }) {
  if (!nums || nums.length < 3) return [];
  const sorted = [...nums].sort((a, b) => a - b);
  const steps = [];
  const triples = [];

  steps.push({ stepType: "sort", description: "Sort array so we can use two pointers", state: { nums: sorted, i: -1, left: -1, right: -1, triples: [] } });

  for (let i = 0; i < sorted.length - 2; i++) {
    if (i > 0 && sorted[i] === sorted[i - 1]) continue;
    let left = i + 1, right = sorted.length - 1;
    steps.push({ stepType: "fix_i", description: `Fix i=${i} → nums[${i}]=${sorted[i]}`, state: { nums: sorted, i, left, right, triples: [...triples] } });

    while (left < right) {
      const sum = sorted[i] + sorted[left] + sorted[right];
      steps.push({ stepType: "loop", description: `left=${left}, right=${right} → sum=${sorted[i]}+${sorted[left]}+${sorted[right]}=${sum}`, state: { nums: sorted, i, left, right, triples: [...triples] } });

      if (sum === 0) {
        triples.push([sorted[i], sorted[left], sorted[right]]);
        steps.push({ stepType: "found", description: `✅ Triple [${sorted[i]}, ${sorted[left]}, ${sorted[right]}]`, state: { nums: sorted, i, left, right, triples: [...triples], highlight: [i, left, right] } });
        while (left < right && sorted[left] === sorted[left + 1]) left++;
        while (left < right && sorted[right] === sorted[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        steps.push({ stepType: "move_left", description: `sum<0 → move left to ${left + 1}`, state: { nums: sorted, i, left: left + 1, right, triples: [...triples] } });
        left++;
      } else {
        steps.push({ stepType: "move_right", description: `sum>0 → move right to ${right - 1}`, state: { nums: sorted, i, left, right: right - 1, triples: [...triples] } });
        right--;
      }
    }
  }

  steps.push({ stepType: "done", description: `✅ Found ${triples.length} triple(s)`, state: { nums: sorted, i: -1, left: -1, right: -1, triples: [...triples], done: true } });
  return steps;
}

// ── Container With Most Water: two pointers ───────────────────────────────
export function generateContainerSteps({ heights }) {
  if (!heights || heights.length < 2) return [];
  const steps = [];
  let left = 0, right = heights.length - 1, maxArea = 0, bestLeft = -1, bestRight = -1;

  steps.push({ stepType: "init", description: `left=0, right=${right}`, state: { left, right, maxArea: 0, bestLeft: -1, bestRight: -1 } });

  while (left < right) {
    const w = right - left;
    const h = Math.min(heights[left], heights[right]);
    const area = w * h;
    steps.push({ stepType: "loop", description: `left=${left}, right=${right} → area=(${right}-${left})*min(${heights[left]},${heights[right]})=${area}`, state: { left, right, maxArea, bestLeft, bestRight, currentArea: area } });

    if (area > maxArea) {
      maxArea = area;
      bestLeft = left;
      bestRight = right;
      steps.push({ stepType: "update", description: `New max area = ${maxArea}`, state: { left, right, maxArea, bestLeft, bestRight, currentArea: area } });
    }

    if (heights[left] < heights[right]) {
      steps.push({ stepType: "move_left", description: `h[${left}]<h[${right}] → move left`, state: { left: left + 1, right, maxArea, bestLeft, bestRight } });
      left++;
    } else {
      steps.push({ stepType: "move_right", description: `move right`, state: { left, right: right - 1, maxArea, bestLeft, bestRight } });
      right--;
    }
  }

  steps.push({ stepType: "done", description: `✅ Max area = ${maxArea}`, state: { left, right, maxArea, bestLeft, bestRight, done: true } });
  return steps;
}

// ── Merge K Sorted Lists ───────────────────────────────────────────────────
function parseMergeKListsInput(input) {
  const raw = input?.s != null ? String(input.s).trim() : "";
  if (!raw) return [];
  return raw.split("|").map(part =>
    part.split(",").map(v => Number(v.trim())).filter(n => !isNaN(n))
  ).filter(list => list.length > 0);
}

export function generateMergeKSortedListsSteps(input) {
  const lists = parseMergeKListsInput(input);
  if (lists.length === 0) {
    return [
      { stepType: "init", description: "No lists", state: { lists: [], heap: [], merged: [], done: true } },
    ];
  }

  const steps = [];
  const merged = [];
  const heap = [];
  const listPtrs = lists.map(() => 0);

  for (let i = 0; i < lists.length; i++) {
    if (lists[i].length > 0) {
      heap.push({ val: lists[i][0], listIdx: i });
    }
  }
  heap.sort((a, b) => a.val - b.val);

  const getRemainingLists = () => lists.map((l, i) => l.slice(listPtrs[i]));

  steps.push({
    stepType: "init_heap",
    description: "Create min-heap, push head of each non-empty list",
    state: { lists: getRemainingLists(), heap: heap.map(h => ({ ...h })), merged: [], listPtrs: [...listPtrs] },
  });

  steps.push({
    stepType: "push_heads",
    description: `Heap = [${heap.map(h => h.val).join(", ")}] (min-heap of k heads)`,
    state: { lists: getRemainingLists(), heap: heap.map(h => ({ ...h })), merged: [], listPtrs: [...listPtrs] },
  });

  while (heap.length > 0) {
    const top = heap[0];
    const { val, listIdx } = top;

    steps.push({
      stepType: "pop",
      description: `Pop min ${val} from list ${listIdx} → append to result`,
      state: { lists: getRemainingLists(), heap: heap.map(h => ({ ...h })), merged: [...merged], listPtrs: [...listPtrs], poppedVal: val, listIdx, heapIdx: 0 },
    });

    heap.shift();
    merged.push(val);
    listPtrs[listIdx]++;

    if (listPtrs[listIdx] < lists[listIdx].length) {
      const nextVal = lists[listIdx][listPtrs[listIdx]];
      heap.push({ val: nextVal, listIdx });
      heap.sort((a, b) => a.val - b.val);
      steps.push({
        stepType: "push_next",
        description: `Push next from list ${listIdx}: ${nextVal} → heap = [${heap.map(h => h.val).join(", ")}]`,
        state: { lists: getRemainingLists(), heap: heap.map(h => ({ ...h })), merged: [...merged], listPtrs: [...listPtrs] },
      });
    }
  }

  steps.push({
    stepType: "done",
    description: `✅ Merged: [${merged.join(", ")}]`,
    state: { lists: lists.map(l => [...l]), heap: [], merged: [...merged], done: true },
  });

  return steps;
}

// ── Merge Two Sorted Lists ────────────────────────────────────────────────
export function generateMergeTwoListsSteps({ list1, list2 }) {
  const a = Array.isArray(list1) ? list1 : [];
  const b = Array.isArray(list2) ? list2 : [];
  const steps = [];
  const merged = [];
  let i = 0, j = 0;

  steps.push({ stepType: "init", description: "i=0 (list1), j=0 (list2), merged=[]", state: { i, j, merged: [], list1: a, list2: b } });

  while (i < a.length && j < b.length) {
    steps.push({ stepType: "compare", description: `Compare list1[${i}]=${a[i]} vs list2[${j}]=${b[j]}`, state: { i, j, merged: [...merged], list1: a, list2: b } });
    if (a[i] <= b[j]) {
      merged.push(a[i]);
      steps.push({ stepType: "take1", description: `Take ${a[i]} from list1 → merged`, state: { i: i + 1, j, merged: [...merged], list1: a, list2: b } });
      i++;
    } else {
      merged.push(b[j]);
      steps.push({ stepType: "take2", description: `Take ${b[j]} from list2 → merged`, state: { i, j: j + 1, merged: [...merged], list1: a, list2: b } });
      j++;
    }
  }

  while (i < a.length) {
    merged.push(a[i]);
    steps.push({ stepType: "append1", description: `Append rest of list1: ${a[i]}`, state: { i: i + 1, j, merged: [...merged], list1: a, list2: b } });
    i++;
  }
  while (j < b.length) {
    merged.push(b[j]);
    steps.push({ stepType: "append2", description: `Append rest of list2: ${b[j]}`, state: { i, j: j + 1, merged: [...merged], list1: a, list2: b } });
    j++;
  }

  steps.push({ stepType: "done", description: `✅ Merged: [${merged.join(",")}]`, state: { i, j, merged: [...merged], list1: a, list2: b, done: true } });
  return steps;
}

// ── Merge Intervals: sort by start, merge overlapping ─────────────────────
export function generateMergeIntervalsSteps({ intervals }) {
  if (!intervals || intervals.length < 2) return [];
  const pairs = [];
  for (let i = 0; i < intervals.length; i += 2) {
    if (intervals[i] != null && intervals[i + 1] != null) pairs.push([intervals[i], intervals[i + 1]]);
  }
  if (pairs.length < 2) return [];

  const sorted = [...pairs].sort((a, b) => a[0] - b[0]);
  const steps = [];
  const merged = [sorted[0]];

  steps.push({ stepType: "sort", description: "Sort intervals by start", state: { intervals: sorted, merged: [...merged], current: 0 } });

  for (let k = 1; k < sorted.length; k++) {
    const [start, end] = sorted[k];
    const last = merged[merged.length - 1];
    steps.push({ stepType: "compare", description: `Compare [${start},${end}] with last [${last[0]},${last[1]}]`, state: { intervals: sorted, merged: [...merged], current: k } });

    if (start <= last[1]) {
      const newEnd = Math.max(last[1], end);
      merged[merged.length - 1] = [last[0], newEnd];
      steps.push({ stepType: "merge", description: `Overlap → merge to [${last[0]},${newEnd}]`, state: { intervals: sorted, merged: [...merged], current: k } });
    } else {
      merged.push([start, end]);
      steps.push({ stepType: "add", description: `No overlap → add [${start},${end}]`, state: { intervals: sorted, merged: [...merged], current: k } });
    }
  }

  steps.push({ stepType: "done", description: `✅ Merged ${merged.length} interval(s)`, state: { intervals: sorted, merged: [...merged], current: -1, done: true } });
  return steps;
}

// ── Linked List Cycle: tortoise & hare ────────────────────────────────────
function nextIndex(i, n, pos) {
  if (i < 0 || i >= n) return -1;
  if (i === n - 1) return pos >= 0 && pos < n ? pos : -1;
  return i + 1;
}

export function generateLinkedListCycleSteps({ head, pos }) {
  const arr = Array.isArray(head) ? head : [];
  const steps = [];
  const n = arr.length;
  const cyclePos = typeof pos === "number" && pos >= 0 && pos < n ? pos : -1;

  if (n === 0) {
    steps.push({ stepType: "done", description: "Empty list → no cycle", state: { slow: -1, fast: -1, hasCycle: false, pos: -1, done: true } });
    return steps;
  }

  let slow = 0, fast = 0;
  steps.push({ stepType: "init", description: "slow = fast = head", state: { slow: 0, fast: 0, hasCycle: null, pos: cyclePos } });

  for (let step = 0; step < n * 2 + 2; step++) {
    steps.push({ stepType: "loop", description: `slow=${slow}, fast=${fast}`, state: { slow, fast, hasCycle: null, pos: cyclePos } });

    const nextSlow = nextIndex(slow, n, cyclePos);
    const midFast = nextIndex(fast, n, cyclePos);
    const nextFast = midFast >= 0 ? nextIndex(midFast, n, cyclePos) : -1;

    if (nextSlow < 0 && nextFast < 0) {
      steps.push({ stepType: "done", description: "Reached end → no cycle", state: { slow, fast, hasCycle: false, pos: cyclePos, done: true } });
      return steps;
    }

    slow = nextSlow >= 0 ? nextSlow : slow;
    fast = nextFast >= 0 ? nextFast : fast;

    if (slow === fast && step > 0) {
      steps.push({ stepType: "found", description: "slow == fast → cycle detected!", state: { slow, fast, hasCycle: true, pos: cyclePos, done: true } });
      return steps;
    }
  }

  steps.push({ stepType: "done", description: "No cycle", state: { slow: -1, fast: -1, hasCycle: false, pos: cyclePos, done: true } });
  return steps;
}

// Build 2D grid from flat array and row count
function buildGrid2D(flat, rows) {
  if (!flat?.length || !rows) return [];
  const cols = Math.floor(flat.length / rows);
  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid.push(flat.slice(r * cols, (r + 1) * cols).map(v => Number(v)));
  }
  return grid;
}

function cloneVisited(visited) {
  return visited.map(row => [...row]);
}

export function generateNumberOfIslandsSteps({ grid: flat, rows }) {
  const grid = buildGrid2D(flat, rows);
  if (!grid.length) return [{ stepType: "done", description: "Empty grid", state: { grid: [], visited: [], current: null, islandCount: 0, done: true } }];
  const R = grid.length, C = grid[0].length;
  const visited = grid.map(row => row.map(() => false));
  const steps = [];
  let islandCount = 0;

  steps.push({ stepType: "init", description: "Initialize grid and island count", state: { grid, visited: cloneVisited(visited), current: null, islandCount: 0 } });

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      steps.push({ stepType: "scan", description: `Scan cell (${r},${c})`, state: { grid, visited: cloneVisited(visited), current: [r, c], islandCount } });
      if (grid[r][c] === 0) continue;
      if (visited[r][c]) continue;
      islandCount++;
      steps.push({ stepType: "new_island", description: `New island #${islandCount} at (${r},${c})`, state: { grid, visited: cloneVisited(visited), current: [r, c], islandCount } });
      const stack = [[r, c]];
      while (stack.length) {
        const [r0, c0] = stack.pop();
        if (r0 < 0 || r0 >= R || c0 < 0 || c0 >= C || grid[r0][c0] === 0 || visited[r0][c0]) continue;
        visited[r0][c0] = true;
        steps.push({ stepType: "dfs_visit", description: `DFS visit (${r0},${c0})`, state: { grid, visited: cloneVisited(visited), current: [r0, c0], islandCount } });
        stack.push([r0 + 1, c0], [r0 - 1, c0], [r0, c0 + 1], [r0, c0 - 1]);
      }
    }
  }

  steps.push({ stepType: "done", description: `Done. Number of islands = ${islandCount}`, state: { grid, visited: cloneVisited(visited), current: null, islandCount, done: true } });
  return steps;
}

export function generateMaxAreaOfIslandSteps({ grid: flat, rows }) {
  const grid = buildGrid2D(flat, rows);
  if (!grid.length) return [{ stepType: "done", description: "Empty grid", state: { grid: [], visited: [], current: null, maxArea: 0, currentArea: 0, done: true } }];
  const R = grid.length, C = grid[0].length;
  const visited = grid.map(row => row.map(() => false));
  const steps = [];
  let maxArea = 0;

  steps.push({ stepType: "init", description: "Initialize; maxArea = 0", state: { grid, visited: cloneVisited(visited), current: null, maxArea: 0, currentArea: 0 } });

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      steps.push({ stepType: "scan", description: `Scan cell (${r},${c})`, state: { grid, visited: cloneVisited(visited), current: [r, c], maxArea, currentArea: 0 } });
      if (grid[r][c] === 0) continue;
      if (visited[r][c]) continue;
      let area = 0;
      const stack = [[r, c]];
      while (stack.length) {
        const [r0, c0] = stack.pop();
        if (r0 < 0 || r0 >= R || c0 < 0 || c0 >= C || grid[r0][c0] === 0 || visited[r0][c0]) continue;
        visited[r0][c0] = true;
        area++;
        steps.push({ stepType: "dfs_visit", description: `DFS visit (${r0},${c0}), area = ${area}`, state: { grid, visited: cloneVisited(visited), current: [r0, c0], maxArea, currentArea: area } });
        stack.push([r0 + 1, c0], [r0 - 1, c0], [r0, c0 + 1], [r0, c0 - 1]);
      }
      maxArea = Math.max(maxArea, area);
      steps.push({ stepType: "update_max", description: `Island area = ${area}, maxArea = ${maxArea}`, state: { grid, visited: cloneVisited(visited), current: null, maxArea, currentArea: area } });
    }
  }

  steps.push({ stepType: "done", description: `Done. Max area = ${maxArea}`, state: { grid, visited: cloneVisited(visited), current: null, maxArea, currentArea: 0, done: true } });
  return steps;
}

export function generatePacificAtlanticSteps(input) {
  if (!input || input.grid == null || input.rows == null) {
    return [
      { stepType: "init", description: "Enter grid and rows", state: { grid: [], pacific: [], atlantic: [], result: [], current: null, phase: null } },
      { stepType: "done", description: "Done", state: { grid: [], pacific: [], atlantic: [], result: [], current: null, done: true } },
    ];
  }
  const grid = buildGrid2D(input.grid, input.rows);
  if (!grid.length) {
    return [{ stepType: "done", description: "Empty grid", state: { grid: [], pacific: [], atlantic: [], result: [], current: null, done: true } }];
  }
  const R = grid.length, C = grid[0].length;
  const pacific = grid.map(row => row.map(() => false));
  const atlantic = grid.map(row => row.map(() => false));
  const steps = [];

  function bfsReachableWithSteps(reach, startRows, startCols, pushStep) {
    const queue = [];
    for (const r of startRows) for (let c = 0; c < C; c++) queue.push([r, c]);
    for (const c of startCols) for (let r = 0; r < R; r++) queue.push([r, c]);
    while (queue.length) {
      const [r, c] = queue.shift();
      if (r < 0 || r >= R || c < 0 || c >= C || reach[r][c]) continue;
      reach[r][c] = true;
      pushStep(r, c);
      const h = grid[r][c];
      if (r - 1 >= 0 && grid[r - 1][c] >= h) queue.push([r - 1, c]);
      if (r + 1 < R && grid[r + 1][c] >= h) queue.push([r + 1, c]);
      if (c - 1 >= 0 && grid[r][c - 1] >= h) queue.push([r, c - 1]);
      if (c + 1 < C && grid[r][c + 1] >= h) queue.push([r, c + 1]);
    }
  }

  steps.push({ stepType: "init", description: "Heights grid; BFS from Pacific and Atlantic edges", state: { grid, pacific: pacific.map(r => [...r]), atlantic: atlantic.map(r => [...r]), result: [], current: null, phase: "pacific" } });

  bfsReachableWithSteps(pacific, [0], [0], (r, c) => {
    steps.push({ stepType: "pacific_visit", description: `Pacific BFS: (${r},${c}) reachable`, state: { grid, pacific: pacific.map(row => [...row]), atlantic: atlantic.map(row => [...row]), result: [], current: [r, c], phase: "pacific" } });
  });

  steps.push({ stepType: "pacific_done", description: "Pacific BFS complete", state: { grid, pacific: pacific.map(r => [...r]), atlantic: atlantic.map(r => [...r]), result: [], current: null, phase: "atlantic" } });

  bfsReachableWithSteps(atlantic, [R - 1], [C - 1], (r, c) => {
    steps.push({ stepType: "atlantic_visit", description: `Atlantic BFS: (${r},${c}) reachable`, state: { grid, pacific: pacific.map(r => [...r]), atlantic: atlantic.map(row => [...row]), result: [], current: [r, c], phase: "atlantic" } });
  });

  const result = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (pacific[r][c] && atlantic[r][c]) result.push([r, c]);
  steps.push({ stepType: "result", description: `Cells that reach both oceans: ${result.length}`, state: { grid, pacific: pacific.map(r => [...r]), atlantic: atlantic.map(r => [...r]), result: [...result], current: null, phase: "done" } });
  steps.push({ stepType: "done", description: `Done. ${result.length} cells flow to both Pacific and Atlantic`, state: { grid, pacific: pacific.map(r => [...r]), atlantic: atlantic.map(r => [...r]), result: [...result], current: null, done: true } });
  return steps;
}

function minHeapPush(heap, freq, num) {
  heap.push({ freq, num });
  let i = heap.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (heap[p].freq <= heap[i].freq) break;
    [heap[p], heap[i]] = [heap[i], heap[p]];
    i = p;
  }
}
function minHeapPop(heap) {
  const top = heap[0];
  heap[0] = heap[heap.length - 1];
  heap.pop();
  let i = 0;
  while (true) {
    const l = 2 * i + 1, r = 2 * i + 2;
    let s = i;
    if (l < heap.length && heap[l].freq < heap[s].freq) s = l;
    if (r < heap.length && heap[r].freq < heap[s].freq) s = r;
    if (s === i) break;
    [heap[i], heap[s]] = [heap[s], heap[i]];
    i = s;
  }
  return top;
}

export function generateTopKFrequentSteps(input) {
  const nums = input?.nums ?? [];
  const k = Math.max(0, Number(input?.k) ?? 0);
  const steps = [];
  if (!nums.length || k <= 0) {
    steps.push({ stepType: "init", description: "Enter nums and k", state: { nums: [], k: 0, count: {}, heap: [], res: [], phase: "init" } });
    steps.push({ stepType: "done", description: "Done", state: { nums: [], k: 0, count: {}, heap: [], res: [], done: true } });
    return steps;
  }
  const count = {};
  for (const x of nums) count[x] = (count[x] || 0) + 1;
  steps.push({ stepType: "init", description: "Count frequencies, then min-heap of size k", state: { nums: [...nums], k, count: {}, heap: [], res: [], phase: "count" } });
  for (let idx = 0; idx < Math.min(nums.length, 8); idx++) {
    const x = nums[idx];
    const soFar = {};
    for (let j = 0; j <= idx; j++) { const v = nums[j]; soFar[v] = (soFar[v] || 0) + 1; }
    steps.push({ stepType: "count_loop", description: `Count: ${x} → freq ${soFar[x]}`, state: { nums: [...nums], k, count: { ...soFar }, heap: [], res: [], phase: "count", countIdx: idx } });
  }
  const countFinal = { ...count };
  steps.push({ stepType: "count_done", description: "Frequencies: " + Object.entries(countFinal).map(([a, b]) => `${a}→${b}`).join(", "), state: { nums: [...nums], k, count: { ...countFinal }, heap: [], res: [], phase: "heap" } });
  const heap = [];
  for (const [num, c] of Object.entries(count)) {
    const numN = Number(num), freqN = Number(c);
    minHeapPush(heap, freqN, numN);
    steps.push({ stepType: "heap_push", description: `Push (${numN}, freq ${freqN}) to heap`, state: { nums: [...nums], k, count: { ...countFinal }, heap: heap.map(x => ({ ...x })), res: [], phase: "heap", heapNum: numN, heapFreq: freqN } });
    if (heap.length > k) {
      const popped = minHeapPop(heap);
      steps.push({ stepType: "heap_pop", description: `Pop min (${popped.num}, freq ${popped.freq})`, state: { nums: [...nums], k, count: { ...countFinal }, heap: heap.map(x => ({ ...x })), res: [], phase: "heap", poppedNum: popped.num, poppedFreq: popped.freq } });
    }
  }
  const res = heap.map(x => x.num);
  steps.push({ stepType: "extract", description: `Extract top ${k} from heap`, state: { nums: [...nums], k, count: { ...countFinal }, heap: heap.map(x => ({ ...x })), res: [...res], phase: "heap" } });
  steps.push({ stepType: "done", description: `Top ${k} frequent: [${res.join(", ")}]`, state: { nums: [...nums], k, count: { ...countFinal }, heap: heap.map(x => ({ ...x })), res: [...res], done: true } });
  return steps;
}

export function generateSumTwoIntegersSteps(input) {
  const nums = Array.isArray(input?.nums) ? input.nums : [];
  const a0 = Number(nums[0]);
  const b0 = Number(nums[1]);
  if (Number.isNaN(a0) || Number.isNaN(b0)) {
    return [
      { stepType: "init", description: "Enter two integers (e.g. nums: 1, 2)", state: { a: 0, b: 0, carry: null, result: null, highlight: null, phase: "init" } },
      { stepType: "done", description: "Done", state: { a: 0, b: 0, carry: null, result: 0, done: true, highlight: "a", phase: "done" } },
    ];
  }
  let a = a0;
  let b = b0;
  const steps = [];
  steps.push({ stepType: "init", description: `getSum(${a0}, ${b0}) — add without + or -`, state: { a: a0, b: b0, carry: null, result: null, highlight: null, phase: "init" } });
  const maxIter = 25;
  let iter = 0;
  while (b !== 0 && iter < maxIter) {
    iter++;
    steps.push({ stepType: "loop_check", description: `while (b != 0): b = ${b} ≠ 0 → enter loop`, state: { a, b, carry: null, result: null, highlight: "b", phase: "loop_check" } });
    const carry = (a & b) << 1;
    steps.push({ stepType: "carry", description: `carry = (a & b) << 1 = ${carry}`, state: { a, b, carry, result: null, highlight: "carry", phase: "carry" } });
    a = a ^ b;
    steps.push({ stepType: "xor", description: `a = a ^ b = ${a}`, state: { a, b, carry, result: null, highlight: "a", phase: "xor" } });
    b = carry;
    steps.push({ stepType: "assign_b", description: `b = carry = ${b}`, state: { a, b, carry, result: null, highlight: "b", phase: "assign_b" } });
  }
  steps.push({ stepType: "done", description: `b == 0 → return a = ${a}`, state: { a, b: 0, carry: null, result: a, done: true, highlight: "a", phase: "done" } });
  return steps;
}

export function generateHammingWeightSteps(input) {
  const nums = Array.isArray(input?.nums) ? input.nums : [];
  let n = Number(nums[0]);
  if (Number.isNaN(n) || n < 0) n = 0;
  n = n >>> 0; // 32-bit unsigned
  let count = 0;
  const steps = [];
  steps.push({ stepType: "init", description: `hammingWeight(${n}) — count set bits`, state: { n, count: 0, highlight: "count", phase: "init" } });
  const maxIter = 35;
  let iter = 0;
  while (n !== 0 && iter < maxIter) {
    iter++;
    steps.push({ stepType: "loop_check", description: `while (n != 0): n = ${n} ≠ 0 → enter loop`, state: { n, count, highlight: "n", phase: "loop_check" } });
    n = (n & (n - 1)) >>> 0;
    count++;
    steps.push({ stepType: "body", description: `n &= n - 1 → n = ${n}; count++ → count = ${count}`, state: { n, count, highlight: "both", phase: "body" } });
  }
  steps.push({ stepType: "done", description: `n == 0 → return count = ${count}`, state: { n: 0, count, done: true, highlight: "count", phase: "done" } });
  return steps;
}

export function generateCountingBitsSteps(input) {
  const n = Math.max(0, Math.min(Number(input?.n) || 0, 32));
  const ans = Array(n + 1).fill(0);
  const steps = [];
  steps.push({ stepType: "init", description: `countBits(${n}) — ans[0..${n}] = 0`, state: { nums: [...ans], i: 0, highlight: [], phase: "init" } });
  for (let i = 1; i <= n; i++) {
    steps.push({ stepType: "loop", description: `for i = ${i}: ans[${i}] = ans[${i >> 1}] + (${i} & 1)`, state: { nums: [...ans], i, highlight: [i], phase: "loop" } });
    ans[i] = ans[i >> 1] + (i & 1);
    steps.push({ stepType: "body", description: `ans[${i}] = ${ans[i]}`, state: { nums: [...ans], i, highlight: [i], phase: "body" } });
  }
  steps.push({ stepType: "done", description: `return [${ans.join(", ")}]`, state: { nums: [...ans], i: n, highlight: [], done: true, phase: "done" } });
  return steps;
}

export function generateReverseBitsSteps(input) {
  const nums = Array.isArray(input?.nums) ? input.nums : [];
  let n = Number(nums[0]);
  if (Number.isNaN(n) || n < 0) n = 0;
  n = n >>> 0;
  let res = 0;
  const steps = [];
  steps.push({ stepType: "init", description: `reverseBits(${n}) — res = 0`, state: { n, res: 0, i: -1, highlight: "res", phase: "init" } });
  for (let i = 0; i < 32; i++) {
    steps.push({ stepType: "loop", description: `for i = ${i}: extract LSB, shift`, state: { n, res, i, highlight: "n", phase: "loop" } });
    res = ((res << 1) | (n & 1)) >>> 0;
    n = n >>> 1;
    steps.push({ stepType: "body", description: `res = (res<<1)|(n&1) = ${res}; n >>= 1`, state: { n, res, i, highlight: "both", phase: "body" } });
  }
  steps.push({ stepType: "done", description: `return res = ${res}`, state: { n: 0, res, i: 32, done: true, highlight: "res", phase: "done" } });
  return steps;
}

// Stub step generators for problems that don't have full visualization yet
function stubArraySteps(input) {
  const nums = input && input.nums != null ? input.nums : (Array.isArray(input) ? input : []);
  const steps = [
    { stepType: "init", description: "Initialize", state: { i: -1, highlight: [], nums: [...nums] } },
  ];
  for (let i = 0; i < Math.min(nums.length, 5); i++) {
    steps.push({ stepType: "loop", description: `Step ${i + 1}/${Math.min(nums.length, 5)}`, state: { i, highlight: [i], nums: [...nums] } });
  }
  steps.push({ stepType: "done", description: "Done", state: { done: true, nums: [...nums], i: nums.length - 1, highlight: [] } });
  return steps;
}
export function generateInsertIntervalSteps(input) {
  const nums = input?.nums || [];
  const pairs = [];
  for (let i = 0; i < nums.length; i += 2)
    if (nums[i] != null && nums[i + 1] != null) pairs.push([nums[i], nums[i + 1]]);
  if (pairs.length < 2) {
    const intervals = pairs.length ? [pairs[0]] : [];
    return [
      { stepType: "init", description: "No intervals or only newInterval", state: { intervals, merged: [], current: -1, newInterval: pairs[0] || null } },
      { stepType: "done", description: "Done", state: { intervals, merged: intervals, current: -1, done: true } },
    ];
  }
  const intervals = pairs.slice(0, -1);
  let newInterval = [...pairs[pairs.length - 1]];
  const steps = [];
  const merged = [];

  steps.push({ stepType: "init", description: "Initialize result list", state: { intervals: [...intervals], merged: [], current: -1, newInterval: [...newInterval] } });

  for (let k = 0; k < intervals.length; k++) {
    const in_ = intervals[k];
    if (in_[1] < newInterval[0]) {
      merged.push(in_);
      steps.push({ stepType: "add_before", description: `[${in_}]: end < newInterval start → add to result`, state: { intervals: [...intervals], merged: [...merged], current: k, newInterval: [...newInterval] } });
    } else if (in_[0] > newInterval[1]) {
      merged.push(newInterval);
      newInterval = in_;
      steps.push({ stepType: "add_after", description: `[${in_}]: start > newInterval end → add newInterval, then set newInterval = current`, state: { intervals: [...intervals], merged: [...merged], current: k, newInterval: [...newInterval] } });
    } else {
      newInterval = [Math.min(in_[0], newInterval[0]), Math.max(in_[1], newInterval[1])];
      steps.push({ stepType: "merge", description: `[${in_}] overlaps → merge into newInterval = [${newInterval[0]},${newInterval[1]}]`, state: { intervals: [...intervals], merged: [...merged], current: k, newInterval: [...newInterval] } });
    }
  }

  merged.push(newInterval);
  steps.push({ stepType: "push_new", description: `Push final newInterval [${newInterval[0]},${newInterval[1]}]`, state: { intervals: [...intervals], merged: [...merged], current: -1, newInterval: [...newInterval] } });
  steps.push({ stepType: "done", description: "Return result", state: { intervals: [...intervals], merged: [...merged], current: -1, done: true } });
  return steps;
}

function stubIntervalSteps(input) {
  const nums = input?.nums || [];
  const pairs = [];
  for (let i = 0; i < nums.length; i += 2)
    if (nums[i] != null && nums[i + 1] != null) pairs.push([nums[i], nums[i + 1]]);
  const steps = [
    { stepType: "init", description: "Start", state: { intervals: [...pairs], merged: [], current: -1 } },
  ];
  for (let k = 0; k < pairs.length; k++) {
    steps.push({ stepType: "compare", description: `Process interval ${k + 1}`, state: { intervals: pairs, merged: pairs.slice(0, k + 1), current: k } });
  }
  steps.push({ stepType: "done", description: "Done", state: { intervals: pairs, merged: pairs, current: -1, done: true } });
  return steps;
}
function stubGridSteps(input) {
  if (!input || input.grid == null || input.rows == null) {
    return [
      { stepType: "init", description: "Enter grid and rows", state: { grid: [], visited: [], current: null } },
      { stepType: "done", description: "Done", state: { grid: [], visited: [], current: null, done: true } },
    ];
  }
  const grid = buildGrid2D(input.grid, input.rows);
  if (!grid.length) return [{ stepType: "done", description: "Empty grid", state: { grid: [], visited: [], current: null, done: true } }];
  const visited = grid.map(row => row.map(() => false));
  const R = grid.length, C = grid[0].length;
  const steps = [{ stepType: "init", description: "Initialize grid", state: { grid, visited: visited.map(r => [...r]), current: null } }];
  const maxLoop = Math.min(R * C, 6);
  for (let k = 0; k < maxLoop; k++) {
    const r = Math.floor(k / C), c = k % C;
    steps.push({ stepType: "loop", description: `Process cell (${r},${c})`, state: { grid, visited: visited.map(row => [...row]), current: [r, c] } });
  }
  steps.push({ stepType: "done", description: "Done", state: { grid, visited: visited.map(r => [...r]), current: null, done: true } });
  return steps;
}
function stubStringSteps(input) {
  const s = input?.s != null ? String(input.s) : "";
  const steps = [
    { stepType: "init", description: "Initialize", state: { s, start: -1, i: -1, best: 0, done: false } },
  ];
  for (let i = 0; i < Math.min(s.length, 8); i++) {
    steps.push({ stepType: "loop", description: `Step ${i + 1}`, state: { s, start: -1, i: i, best: i + 1, done: false } });
  }
  steps.push({ stepType: "done", description: "Done", state: { s, start: -1, i: Math.max(0, s.length - 1), best: s.length, done: true } });
  return steps;
}

function stubWithNumsTarget(input) {
  const nums = input?.nums || [];
  const target = input?.target != null ? input.target : 0;
  const steps = [
    { stepType: "init", description: "Initialize", state: { nums: [...nums], target, i: -1, highlight: [] } },
  ];
  for (let i = 0; i < Math.min(nums.length, 4); i++) {
    steps.push({ stepType: "loop", description: `Check index ${i}`, state: { nums: [...nums], target, i, highlight: [i] } });
  }
  steps.push({ stepType: "done", description: "Done", state: { nums: [...nums], target, done: true } });
  return steps;
}
function stubWithN(input) {
  const n = input?.n != null ? input.n : 0;
  const nums = input?.nums || [];
  const steps = [
    { stepType: "init", description: "Initialize", state: { n, nums: [...nums], i: -1, highlight: [] } },
  ];
  for (let i = 0; i < Math.min(n, 4); i++) {
    steps.push({ stepType: "loop", description: `Step ${i + 1}`, state: { n, nums: [...nums], i, highlight: [i] } });
  }
  steps.push({ stepType: "done", description: "Done", state: { n, nums: [...nums], done: true } });
  return steps;
}
function stubWithS(input) {
  const s = input?.s != null ? String(input.s) : "";
  const steps = [
    { stepType: "init", description: "Start", state: { s, i: -1, highlight: [] } },
  ];
  for (let i = 0; i < Math.min(s.length, 4); i++) {
    steps.push({ stepType: "loop", description: `Position ${i}`, state: { s, i, highlight: [i] } });
  }
  steps.push({ stepType: "done", description: "Done", state: { s, done: true } });
  return steps;
}

export function generateLongestSubstringNoRepeatSteps(input) {
  const s = input?.s != null ? String(input.s).trim() : "";
  const steps = [];
  const last = {};
  let start = -1;
  let best = 0;

  steps.push({
    stepType: "init",
    description: "Initialize last (char → index), start = -1, best = 0",
    state: { s, start: -1, i: -1, last: {}, best: 0 },
  });

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    steps.push({
      stepType: "loop",
      description: `Loop: i = ${i}, s[${i}] = "${c}"`,
      state: { s, start, i, last: { ...last }, best },
    });

    if (last[c] !== undefined) {
      const newStart = Math.max(start, last[c]);
      steps.push({
        stepType: "update_start",
        description: `"${c}" seen at index ${last[c]} → start = max(${start}, ${last[c]}) = ${newStart}`,
        state: { s, start: newStart, i, last: { ...last }, best },
      });
      start = newStart;
    }

    last[c] = i;
    steps.push({
      stepType: "update_last",
      description: `last["${c}"] = ${i}`,
      state: { s, start, i, last: { ...last }, best },
    });

    const len = i - start;
    const newBest = Math.max(best, len);
    steps.push({
      stepType: "update_best",
      description: `best = max(${best}, ${i} − ${start}) = ${newBest}`,
      state: { s, start, i, last: { ...last }, best: newBest },
    });
    best = newBest;
  }

  steps.push({
    stepType: "done",
    description: `✅ Longest substring without repeating = ${best}`,
    state: { s, start, i: s.length - 1, last: { ...last }, best, done: true },
  });
  return steps;
}

export function generateGroupAnagramsSteps(input) {
  const raw = input?.s != null ? String(input.s).trim() : "";
  const strs = raw ? raw.split(",").map((x) => x.trim()).filter(Boolean) : [];
  const steps = [];
  const map = {};

  steps.push({
    stepType: "init",
    description: "Create map (key → list of strings)",
    state: { strs: [...strs], i: -1, s: "", key: "", map: {}, action: "Initialize map" },
  });

  for (let i = 0; i < strs.length; i++) {
    const s = strs[i];
    const key = [...s].sort().join("");
    steps.push({
      stepType: "loop",
      description: `For s = "${s}"`,
      state: { strs: [...strs], i, s, key: "", map: JSON.parse(JSON.stringify(map)), action: `Process strs[${i}]` },
    });
    steps.push({
      stepType: "key",
      description: `key = sorted("${s}") = "${key}"`,
      state: { strs: [...strs], i, s, key, map: JSON.parse(JSON.stringify(map)), action: "Compute key" },
    });
    if (!map[key]) map[key] = [];
    map[key].push(s);
    steps.push({
      stepType: "push",
      description: `map["${key}"].push("${s}")`,
      state: { strs: [...strs], i, s, key, map: JSON.parse(JSON.stringify(map)), action: "Add to group" },
    });
  }

  steps.push({
    stepType: "done",
    description: `Return map.values() → ${Object.keys(map).length} group(s)`,
    state: { strs: [...strs], i: strs.length - 1, s: "", key: "", map: JSON.parse(JSON.stringify(map)), action: null, done: true },
  });
  return steps;
}

export function generateLongestPalindromicSubstringSteps(input) {
  const s = input?.s != null ? String(input.s).trim() : "";
  const n = s.length;
  const steps = [];
  let best = "";
  let bestStart = 0;
  let bestLen = 0;

  function expand(l, r) {
    while (l >= 0 && r < n && s[l] === s[r]) {
      l--;
      r++;
    }
    return { l: l + 1, r, substr: s.slice(l + 1, r) };
  }

  steps.push({
    stepType: "init",
    description: "longestPalindrome(s): best = \"\", for each center i try odd and even expansion",
    state: { s, i: -1, l: -1, r: -1, best: "", bestStart: 0, bestLen: 0, palindrome: "", type: null, action: "Initialize" },
  });

  for (let i = 0; i < n; i++) {
    steps.push({
      stepType: "loop",
      description: `Center i = ${i}`,
      state: { s, i, l: -1, r: -1, best, bestStart, bestLen, palindrome: "", type: null, action: `Try center ${i}` },
    });

    const odd = expand(i, i);
    steps.push({
      stepType: "try_odd",
      description: `expand(i, i) → l=${odd.l}, r=${odd.r}, "${odd.substr}"`,
      state: { s, i, l: odd.l - 1, r: odd.r, best, bestStart, bestLen, palindrome: odd.substr, type: "odd", action: "Odd-length expand" },
    });
    if (odd.substr.length > bestLen) {
      bestLen = odd.substr.length;
      bestStart = odd.l;
      best = odd.substr;
      steps.push({
        stepType: "update_best",
        description: `New best: "${best}" (length ${bestLen})`,
        state: { s, i, l: odd.l - 1, r: odd.r, best, bestStart, bestLen, palindrome: odd.substr, type: "odd", action: "Update best" },
      });
    }

    if (i + 1 < n) {
      const even = expand(i, i + 1);
      steps.push({
        stepType: "try_even",
        description: `expand(i, i+1) → l=${even.l}, r=${even.r}, "${even.substr}"`,
        state: { s, i, l: even.l - 1, r: even.r, best, bestStart, bestLen, palindrome: even.substr, type: "even", action: "Even-length expand" },
      });
      if (even.substr.length > bestLen) {
        bestLen = even.substr.length;
        bestStart = even.l;
        best = even.substr;
        steps.push({
          stepType: "update_best",
          description: `New best: "${best}" (length ${bestLen})`,
          state: { s, i, l: even.l - 1, r: even.r, best, bestStart, bestLen, palindrome: even.substr, type: "even", action: "Update best" },
        });
      }
    }
  }

  steps.push({
    stepType: "done",
    description: `✅ Longest palindromic substring: "${best}"`,
    state: { s, i: n - 1, l: -1, r: -1, best, bestStart, bestLen, palindrome: "", type: null, action: null, done: true },
  });
  return steps;
}

export function generateSubsetsSteps(input) {
  const nums = Array.isArray(input?.nums) ? input.nums.map(Number) : [];
  const steps = [];
  const res = [];
  const path = [];

  steps.push({
    stepType: "init",
    description: "subsets(nums): res = [], path = [], call backtrack(nums, 0, path, res)",
    state: { nums: [...nums], i: 0, j: -1, path: [], res: [], action: "Call backtrack(0)" },
  });

  function backtrack(i) {
    steps.push({
      stepType: "enter",
      description: `backtrack(i=${i})`,
      state: { nums: [...nums], i, j: -1, path: [...path], res: res.map(r => [...r]), action: `Enter backtrack(${i})` },
    });
    steps.push({
      stepType: "push_result",
      description: `res.push([${path.join(", ")}]) — record current subset`,
      state: { nums: [...nums], i, j: -1, path: [...path], res: res.map(r => [...r]), action: "Push copy of path to res" },
    });
    res.push([...path]);

    for (let j = i; j < nums.length; j++) {
      steps.push({
        stepType: "loop",
        description: `for j = ${j}, nums[${j}] = ${nums[j]}`,
        state: { nums: [...nums], i, j, path: [...path], res: res.map(r => [...r]), action: `Loop: j=${j}` },
      });
      steps.push({
        stepType: "push_path",
        description: `path.push(${nums[j]}) → path = [${path.join(", ")}, ${nums[j]}]`,
        state: { nums: [...nums], i, j, path: [...path, nums[j]], res: res.map(r => [...r]), action: `Include ${nums[j]}` },
      });
      path.push(nums[j]);
      steps.push({
        stepType: "recurse",
        description: `backtrack(${j + 1})`,
        state: { nums: [...nums], i, j, path: [...path], res: res.map(r => [...r]), action: `Recurse backtrack(${j + 1})` },
      });
      backtrack(j + 1);
      steps.push({
        stepType: "pop_path",
        description: `path.pop() — backtrack, try next choice`,
        state: { nums: [...nums], i, j, path: [...path], res: res.map(r => [...r]), action: "Backtrack: remove from path" },
      });
      path.pop();
    }
  }

  if (nums.length > 0) backtrack(0);

  steps.push({
    stepType: "done",
    description: `✅ Done: ${res.length} subsets`,
    state: { nums: [...nums], i: 0, j: -1, path: [], res: res.map(r => [...r]), action: null, done: true },
  });
  return steps;
}

export function generatePermutationsSteps(input) {
  const nums = Array.isArray(input?.nums) ? input.nums.map(Number) : [];
  const steps = [];
  const res = [];
  const arr = [...nums];
  const n = arr.length;

  steps.push({
    stepType: "init",
    description: "permute(nums): res = [], call backtrack(nums, 0, res)",
    state: { nums: [...arr], start: 0, i: -1, res: [], action: "Call backtrack(0)" },
  });

  function backtrack(start) {
    steps.push({
      stepType: "enter",
      description: `backtrack(start=${start})`,
      state: { nums: [...arr], start, i: -1, res: res.map(r => [...r]), action: `Enter backtrack(${start})` },
    });

    if (start === n) {
      steps.push({
        stepType: "base_case",
        description: `start == n → res.push([${arr.join(", ")}])`,
        state: { nums: [...arr], start, i: -1, res: res.map(r => [...r]), action: "Base case: record permutation" },
      });
      res.push([...arr]);
      steps.push({
        stepType: "base_case_done",
        description: "return",
        state: { nums: [...arr], start, i: -1, res: res.map(r => [...r]), action: "Return" },
      });
      return;
    }

    for (let i = start; i < n; i++) {
      steps.push({
        stepType: "loop",
        description: `for i = ${i}, nums[${i}] = ${arr[i]}`,
        state: { nums: [...arr], start, i, res: res.map(r => [...r]), action: `Loop: try i=${i}` },
      });
      const a = arr[start], b = arr[i];
      [arr[start], arr[i]] = [arr[i], arr[start]];
      steps.push({
        stepType: "swap",
        description: `swap(nums[${start}], nums[${i}]) → [${arr.join(", ")}]`,
        state: { nums: [...arr], start, i, res: res.map(r => [...r]), action: `Swap ${a} and ${b}` },
      });
      steps.push({
        stepType: "recurse",
        description: `backtrack(${start + 1})`,
        state: { nums: [...arr], start, i, res: res.map(r => [...r]), action: `Recurse backtrack(${start + 1})` },
      });
      backtrack(start + 1);
      steps.push({
        stepType: "swap_back",
        description: `swap back nums[${start}] and nums[${i}]`,
        state: { nums: [...arr], start, i, res: res.map(r => [...r]), action: "Swap back (backtrack)" },
      });
      [arr[start], arr[i]] = [arr[i], arr[start]];
    }
  }

  if (n > 0) backtrack(0);

  steps.push({
    stepType: "done",
    description: `✅ Done: ${res.length} permutations`,
    state: { nums: [...nums], start: 0, i: -1, res: res.map(r => [...r]), action: null, done: true },
  });
  return steps;
}

function stubLinkedListSteps(input) {
  const head = input?.head || [];
  const steps = [
    { stepType: "init", description: "Start", state: { head: [...head], slowIdx: -1, fastIdx: -1 } },
  ];
  for (let i = 0; i < Math.min(head.length, 3); i++) {
    steps.push({ stepType: "loop", description: `Step ${i + 1}`, state: { head: [...head], slowIdx: i, fastIdx: Math.min(i * 2, head.length - 1) } });
  }
  steps.push({ stepType: "done", description: "Done", state: { head: [...head], done: true } });
  return steps;
}

export function generateRemoveNthNodeSteps(input) {
  const head = Array.isArray(input?.head) ? [...input.head] : [];
  const n = Math.max(0, Number(input?.n) || 0);
  const len = head.length;

  if (len === 0) {
    return [
      { stepType: "init", description: "Empty list", state: { head: [], slowIdx: -1, fastIdx: -1 } },
      { stepType: "done", description: "Return empty", state: { head: [], done: true } },
    ];
  }

  const steps = [];
  let slowIdx = -1;
  let fastIdx = -1;

  steps.push({
    stepType: "init",
    description: "Create dummy node before head",
    state: { head: [...head], slowIdx: -1, fastIdx: -1 },
  });
  steps.push({
    stepType: "init_dummy",
    description: "dummy.next = head",
    state: { head: [...head], slowIdx: -1, fastIdx: -1 },
  });
  steps.push({
    stepType: "init_ptrs",
    description: "slow = fast = dummy",
    state: { head: [...head], slowIdx: -1, fastIdx: -1 },
  });

  for (let i = 1; i <= n + 1 && i <= len + 1; i++) {
    fastIdx = Math.min(i - 1, len);
    const isPastEnd = i > len;
    steps.push({
      stepType: "move_fast",
      description: `Move fast ${i}/${n + 1} steps → fast at ${isPastEnd ? "null" : `index ${fastIdx}`}`,
      state: { head: [...head], slowIdx: -1, fastIdx: isPastEnd ? len : fastIdx },
    });
  }

  while (fastIdx < len) {
    slowIdx = slowIdx < 0 ? 0 : slowIdx + 1;
    fastIdx++;
    steps.push({
      stepType: "loop",
      description: `Move both: slow=${slowIdx >= 0 ? head[slowIdx] : "dummy"}, fast=${fastIdx < len ? head[fastIdx] : "null"}`,
      state: { head: [...head], slowIdx, fastIdx: fastIdx < len ? fastIdx : len },
    });
  }

  const toRemoveIdx = slowIdx >= 0 ? slowIdx + 1 : 0;
  const removedVal = toRemoveIdx < len ? head[toRemoveIdx] : null;
  const resultHead = toRemoveIdx < len ? head.filter((_, i) => i !== toRemoveIdx) : head;

  steps.push({
    stepType: "remove",
    description: `Remove node at index ${toRemoveIdx} (val=${removedVal}) → slow.next = slow.next.next`,
    state: { head: [...head], slowIdx, toRemoveIdx, done: false },
  });

  steps.push({
    stepType: "done",
    description: `✅ Removed → [${resultHead.join("→")}]`,
    state: { head: resultHead, done: true },
  });

  return steps;
}
// Build edges from flat nums: [a1,b1, a2,b2, ...] -> [[a1,b1],[a2,b2],...]
function buildEdgesFromNums(n, nums) {
  const edges = [];
  for (let i = 0; i + 1 < (nums || []).length; i += 2) {
    const a = Number(nums[i]), b = Number(nums[i + 1]);
    if (!isNaN(a) && !isNaN(b)) edges.push([a, b]);
  }
  return edges;
}
export function generateEvalRpnSteps(input) {
  const s = input?.s != null ? String(input.s).trim() : "";
  const tokens = s ? s.split(",").map(t => t.trim()).filter(Boolean) : [];
  const steps = [];
  const stack = [];

  steps.push({
    stepType: "init",
    description: "Initialize empty stack",
    state: { tokens: [...tokens], currentIndex: -1, stack: [], action: null },
  });

  const OPS = new Set(["+", "-", "*", "/"]);
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (OPS.has(tok)) {
      const b = stack.pop();
      const a = stack.pop();
      let res;
      if (tok === "+") res = a + b;
      else if (tok === "-") res = a - b;
      else if (tok === "*") res = a * b;
      else res = Math.trunc(a / b);
      stack.push(res);
      steps.push({
        stepType: "op",
        description: `Apply ${tok}: pop ${a}, ${b} → ${res}`,
        state: { tokens: [...tokens], currentIndex: i, stack: [...stack], action: `${a} ${tok} ${b} = ${res}` },
      });
    } else {
      const num = Number(tok);
      if (!isNaN(num)) {
        stack.push(num);
        steps.push({
          stepType: "push",
          description: `Push ${num}`,
          state: { tokens: [...tokens], currentIndex: i, stack: [...stack], action: "push" },
        });
      }
    }
  }

  steps.push({
    stepType: "done",
    description: `Result = ${stack[stack.length - 1] ?? "?"}`,
    state: { tokens: [...tokens], currentIndex: tokens.length, stack: [...stack], action: null, done: true },
  });
  return steps;
}

export function generateSearchRotatedSteps({ nums = [], target }) {
  if (!nums.length) return [{ stepType: "init", description: "Empty array", state: { left: 0, right: -1, mid: -1, found: -1, eliminated: [] } }];
  const steps = [];
  let left = 0, right = nums.length - 1;
  const t = target != null ? Number(target) : 0;
  steps.push({ stepType: "init", description: `left=0, right=${right}, target=${t}`, state: { left, right, mid: -1, found: -1, eliminated: [] } });
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    steps.push({ stepType: "loop", description: `left=${left}, right=${right}`, state: { left, right, mid, found: -1, eliminated: [] } });
    steps.push({ stepType: "calc_mid", description: `mid=${mid} → nums[${mid}]=${nums[mid]}`, state: { left, right, mid, found: -1, eliminated: [] } });
    if (nums[mid] === t) {
      steps.push({ stepType: "found", description: `✅ Found at index ${mid}`, state: { left, right, mid, found: mid, eliminated: [] } });
      return steps;
    }
    if (nums[left] <= nums[mid]) {
      if (t >= nums[left] && t < nums[mid]) {
        const el = Array.from({ length: mid - left + 1 }, (_, k) => left + k);
        steps.push({ stepType: "go_left", description: `Left half sorted; ${t} in [${nums[left]},${nums[mid]}) → right=${mid - 1}`, state: { left, right: mid - 1, mid, found: -1, eliminated: el } });
        right = mid - 1;
      } else {
        const el = Array.from({ length: mid - left + 1 }, (_, k) => left + k);
        steps.push({ stepType: "go_right", description: `Left half sorted; ${t} not in range → left=${mid + 1}`, state: { left: mid + 1, right, mid, found: -1, eliminated: el } });
        left = mid + 1;
      }
    } else {
      if (t > nums[mid] && t <= nums[right]) {
        const el = Array.from({ length: right - mid + 1 }, (_, k) => mid + k);
        steps.push({ stepType: "go_right", description: `Right half sorted; ${t} in (${nums[mid]},${nums[right]}] → left=${mid + 1}`, state: { left: mid + 1, right, mid, found: -1, eliminated: el } });
        left = mid + 1;
      } else {
        const el = Array.from({ length: right - mid + 1 }, (_, k) => mid + k);
        steps.push({ stepType: "go_left", description: `Right half sorted; ${t} not in range → right=${mid - 1}`, state: { left, right: mid - 1, mid, found: -1, eliminated: el } });
        right = mid - 1;
      }
    }
  }
  steps.push({ stepType: "done", description: `❌ ${t} not found → return -1`, state: { left, right, mid: -1, found: -1, eliminated: [] } });
  return steps;
}

export function generateDecodeWaysSteps(input) {
  const s = input?.s != null ? String(input.s).trim() : "";
  if (!s.length) return [{ stepType: "init", description: "Empty string", state: { s: "", dp: [1], i: 0, highlight: [], done: true } }];
  const n = s.length;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  const steps = [];
  steps.push({ stepType: "init", description: "dp[0] = 1 (empty string = 1 way)", state: { s: s.split(""), dp: [...dp], i: 0, highlight: [], contrib: null, done: false } });
  for (let i = 1; i <= n; i++) {
    steps.push({ stepType: "loop", description: `i=${i}: consider s[${i - 1}]='${s[i - 1]}'`, state: { s: s.split(""), dp: [...dp], i, highlight: [i - 1], contrib: null, done: false } });
    if (s[i - 1] !== "0") {
      dp[i] += dp[i - 1];
      steps.push({ stepType: "one_digit", description: `One digit: s[${i - 1}]≠'0' → dp[${i}] += dp[${i - 1}] = ${dp[i]}`, state: { s: s.split(""), dp: [...dp], i, highlight: [i - 1], contrib: i - 1, done: false } });
    }
    if (i >= 2) {
      const two = parseInt(s.slice(i - 2, i), 10);
      if (two >= 10 && two <= 26) {
        dp[i] += dp[i - 2];
        steps.push({ stepType: "two_digit", description: `Two digits: "${s.slice(i - 2, i)}" in [10,26] → dp[${i}] += dp[${i - 2}] = ${dp[i]}`, state: { s: s.split(""), dp: [...dp], i, highlight: [i - 2, i - 1], contrib: i - 2, done: false } });
      }
    }
  }
  steps.push({ stepType: "done", description: `return dp[${n}] = ${dp[n]}`, state: { s: s.split(""), dp: [...dp], i: n, highlight: [], contrib: null, done: true } });
  return steps;
}

export function generateWordBreakSteps(input) {
  const s = input?.s != null ? String(input.s).trim() : "";
  const dictStr = input?.dict != null ? String(input.dict).trim() : "";
  const wordDict = dictStr ? dictStr.split(",").map(w => w.trim()).filter(Boolean) : [];
  const set = new Set(wordDict);
  if (!s.length) {
    return [
      { stepType: "init", description: "Empty string", state: { s: [], dp: [true], i: 0, j: 0, word: "", dict: wordDict, highlight: [], done: true } },
      { stepType: "done", description: "return true (empty)", state: { s: [], dp: [true], i: 0, j: 0, word: "", dict: wordDict, highlight: [], done: true } },
    ];
  }
  const n = s.length;
  const dp = Array(n + 1).fill(false);
  dp[0] = true;
  const steps = [];
  steps.push({
    stepType: "init",
    description: `dp[0]=true; dict = {${wordDict.join(", ")}}`,
    state: { s: s.split(""), dp: [...dp], i: 0, j: 0, word: "", dict: wordDict, highlight: [], phase: "init" },
  });
  for (let i = 1; i <= n; i++) {
    steps.push({
      stepType: "loop_i",
      description: `for i = ${i} (check s[0..${i}])`,
      state: { s: s.split(""), dp: [...dp], i, j: 0, word: "", dict: wordDict, highlight: Array.from({ length: i }, (_, k) => k), phase: "loop_i" },
    });
    let matched = false;
    for (let j = 0; j < i; j++) {
      const word = s.slice(j, i);
      steps.push({
        stepType: "loop_j",
        description: `j = ${j}: s[${j}..${i}] = "${word}"`,
        state: { s: s.split(""), dp: [...dp], i, j, word, dict: wordDict, highlight: Array.from({ length: i - j }, (_, k) => j + k), phase: "loop_j" },
      });
      if (dp[j] && set.has(word)) {
        dp[i] = true;
        steps.push({
          stepType: "match",
          description: `dp[${j}]=true and "${word}" in dict → dp[${i}] = true`,
          state: { s: s.split(""), dp: [...dp], i, j, word, dict: wordDict, highlight: Array.from({ length: i - j }, (_, k) => j + k), phase: "match" },
        });
        matched = true;
        break;
      }
    }
    if (!matched && steps[steps.length - 1].stepType !== "match") {
      steps.push({
        stepType: "no_match",
        description: `No j < ${i} with dp[j] and s[j..${i}] in dict → dp[${i}] stays false`,
        state: { s: s.split(""), dp: [...dp], i, j: i - 1, word: "", dict: wordDict, highlight: [], phase: "no_match" },
      });
    }
  }
  steps.push({
    stepType: "done",
    description: `return dp[${n}] = ${dp[n]}`,
    state: { s: s.split(""), dp: [...dp], i: n, j: 0, word: "", dict: wordDict, highlight: [], done: true, phase: "done" },
  });
  return steps;
}

export function generateLongestCommonSubsequenceSteps(input) {
  const t1 = input?.s != null ? String(input.s).trim() : "";
  const t2 = input?.t != null ? String(input.t).trim() : "";
  const m = t1.length;
  const n = t2.length;
  if (!m || !n) {
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    return [
      { stepType: "init", description: "One or both strings empty", state: { t1: t1.split(""), t2: t2.split(""), dp: dp.map(r => [...r]), i: 0, j: 0, done: true } },
      { stepType: "done", description: `return ${0}`, state: { t1: t1.split(""), t2: t2.split(""), dp: dp.map(r => [...r]), i: m, j: n, done: true } },
    ];
  }
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  const steps = [];
  steps.push({
    stepType: "init",
    description: `dp[0..${m}][0..${n}] = 0`,
    state: { t1: t1.split(""), t2: t2.split(""), dp: dp.map(r => [...r]), i: 0, j: 0, phase: "init" },
  });
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = t1[i - 1] === t2[j - 1];
      steps.push({
        stepType: "loop",
        description: `i=${i}, j=${j}: t1[${i - 1}]='${t1[i - 1]}', t2[${j - 1}]='${t2[j - 1]}'`,
        state: { t1: t1.split(""), t2: t2.split(""), dp: dp.map(r => [...r]), i, j, phase: "loop" },
      });
      if (match) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        steps.push({
          stepType: "match",
          description: `match → dp[${i}][${j}] = 1 + dp[${i - 1}][${j - 1}] = ${dp[i][j]}`,
          state: { t1: t1.split(""), t2: t2.split(""), dp: dp.map(r => [...r]), i, j, phase: "match" },
        });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        steps.push({
          stepType: "no_match",
          description: `no match → dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}`,
          state: { t1: t1.split(""), t2: t2.split(""), dp: dp.map(r => [...r]), i, j, phase: "no_match" },
        });
      }
    }
  }
  steps.push({
    stepType: "done",
    description: `return dp[${m}][${n}] = ${dp[m][n]}`,
    state: { t1: t1.split(""), t2: t2.split(""), dp: dp.map(r => [...r]), i: m, j: n, done: true, phase: "done" },
  });
  return steps;
}

export function generateLongestIncreasingSubsequenceSteps(input) {
  const nums = Array.isArray(input?.nums) ? input.nums.map(Number) : (input?.nums != null ? [Number(input.nums)] : []);
  const steps = [];
  const tails = [];
  steps.push({
    stepType: "init",
    description: "tails = [] (smallest tail for each IS length)",
    state: { nums: [...nums], tails: [], i: -1, pos: -1, extend: false, replace: false },
  });
  for (let idx = 0; idx < nums.length; idx++) {
    const x = nums[idx];
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    const pos = lo;
    steps.push({
      stepType: "loop",
      description: `x = nums[${idx}] = ${x}`,
      state: { nums: [...nums], tails: [...tails], i: idx, pos: -1, extend: false, replace: false },
    });
    steps.push({
      stepType: "search",
      description: `lower_bound(tails, ${x}) → pos = ${pos}`,
      state: { nums: [...nums], tails: [...tails], i: idx, pos, extend: false, replace: false },
    });
    if (pos === tails.length) {
      tails.push(x);
      steps.push({
        stepType: "extend",
        description: `pos == tails.size() → tails.push_back(${x}), tails = [${tails.join(", ")}]`,
        state: { nums: [...nums], tails: [...tails], i: idx, pos, extend: true, replace: false },
      });
    } else {
      tails[pos] = x;
      steps.push({
        stepType: "replace",
        description: `tails[${pos}] = ${x} → tails = [${tails.join(", ")}]`,
        state: { nums: [...nums], tails: [...tails], i: idx, pos, extend: false, replace: true },
      });
    }
  }
  steps.push({
    stepType: "done",
    description: `return tails.size() = ${tails.length}`,
    state: { nums: [...nums], tails: [...tails], i: nums.length - 1, pos: -1, extend: false, replace: false, done: true },
  });
  return steps;
}

export function generateCombinationSumSteps(input) {
  const c = Array.isArray(input?.nums) ? input.nums.map(Number) : (input?.nums != null ? [Number(input.nums)] : []);
  const target = Number(input?.target) ?? 0;
  const steps = [];
  const res = [];
  steps.push({
    stepType: "init",
    description: `combinationSum(candidates, ${target}) — res=[], path=[], call backtrack(c, ${target}, 0, path, res)`,
    state: { c: [...c], target, t: target, start: 0, path: [], res: [], done: false },
  });
  function backtrack(t, start, path) {
    steps.push({
      stepType: "enter",
      description: `backtrack(t=${t}, start=${start})  path = [${path.join(", ")}]`,
      state: { c: [...c], target, t, start, path: [...path], res: res.map(r => [...r]), done: false },
    });
    if (t === 0) {
      res.push([...path]);
      steps.push({
        stepType: "hit_target",
        description: `t == 0 → res.push([${path.join(", ")}])  ✓`,
        state: { c: [...c], target, t, start, path: [...path], res: res.map(r => [...r]), done: false },
      });
      return;
    }
    if (t < 0) {
      steps.push({
        stepType: "overflow",
        description: `t < 0 → return`,
        state: { c: [...c], target, t, start, path: [...path], res: res.map(r => [...r]), done: false },
      });
      return;
    }
    for (let i = start; i < c.length; i++) {
      const val = c[i];
      steps.push({
        stepType: "loop",
        description: `for i=${i}: try candidate c[${i}]=${val}`,
        state: { c: [...c], target, t, start, path: [...path], res: res.map(r => [...r]), i, candidate: val, done: false },
      });
      path.push(val);
      steps.push({
        stepType: "push",
        description: `path.push(${val}) → path = [${path.join(", ")}], recurse backtrack(${t - val}, ${i}, path)`,
        state: { c: [...c], target, t: t - val, start: i, path: [...path], res: res.map(r => [...r]), i, candidate: val, done: false },
      });
      backtrack(t - val, i, path);
      path.pop();
      steps.push({
        stepType: "pop",
        description: `path.pop() → path = [${path.join(", ")}], continue loop`,
        state: { c: [...c], target, t, start, path: [...path], res: res.map(r => [...r]), i, done: false },
      });
    }
  }
  if (c.length && target > 0) backtrack(target, 0, []);
  steps.push({
    stepType: "done",
    description: `return res = [${res.map(r => "[" + r.join(",") + "]").join(", ")}]`,
    state: { c: [...c], target, t: 0, start: 0, path: [], res: res.map(r => [...r]), done: true },
  });
  return steps;
}

function runRobRange(nums, l, r, steps, state) {
  let prev = 0, curr = 0;
  for (let i = l; i <= r; i++) {
    const nextCurr = Math.max(prev + nums[i], curr);
    const nextPrev = curr;
    steps.push({
      stepType: "loop",
      description: `i=${i}: curr = max(prev+nums[${i}], curr) = max(${prev}+${nums[i]}, ${curr}) = ${nextCurr}`,
      state: { ...state, pass: state.pass, l, r, i, prev: nextPrev, curr: nextCurr, choice: prev + nums[i] > curr ? "rob" : "skip" },
    });
    prev = nextPrev;
    curr = nextCurr;
  }
  return curr;
}

export function generateHouseRobberIISteps(input) {
  const nums = Array.isArray(input?.nums) ? input.nums.map(Number) : (input?.nums != null ? [Number(input.nums)] : []);
  const n = nums.length;
  const steps = [];
  const state = { nums: [...nums], n, pass: 1, l: 0, r: 0, i: -1, prev: 0, curr: 0, result1: null, result2: null, done: false };
  steps.push({
    stepType: "init",
    description: n <= 1 ? `rob(nums) — n=${n}` : `rob(nums) — two passes: exclude last, then exclude first`,
    state: { ...state },
  });
  if (n === 0) {
    steps.push({ stepType: "done", description: "return 0", state: { ...state, done: true } });
    return steps;
  }
  if (n === 1) {
    steps.push({
      stepType: "single_house",
      description: `nums.size() == 1 → return nums[0] = ${nums[0]}`,
      state: { ...state, i: 0, done: false },
    });
    steps.push({ stepType: "done", description: `return ${nums[0]}`, state: { ...state, result1: nums[0], done: true } });
    return steps;
  }
  steps.push({
    stepType: "pass1_start",
    description: `robRange(nums, 0, ${n - 2}) — exclude last house`,
    state: { ...state, pass: 1, l: 0, r: n - 2, prev: 0, curr: 0 },
  });
  const result1 = runRobRange(nums, 0, n - 2, steps, { ...state, pass: 1, l: 0, r: n - 2 });
  steps.push({
    stepType: "pass1_end",
    description: `robRange returns ${result1}`,
    state: { ...state, pass: 1, result1, l: 0, r: n - 2, i: -1 },
  });
  steps.push({
    stepType: "pass2_start",
    description: `robRange(nums, 1, ${n - 1}) — exclude first house`,
    state: { ...state, pass: 2, l: 1, r: n - 1, result1, prev: 0, curr: 0 },
  });
  const result2 = runRobRange(nums, 1, n - 1, steps, { ...state, pass: 2, l: 1, r: n - 1, result1 });
  steps.push({
    stepType: "pass2_end",
    description: `robRange returns ${result2}`,
    state: { ...state, pass: 2, result1, result2, l: 1, r: n - 1, i: -1 },
  });
  const ans = Math.max(result1, result2);
  steps.push({
    stepType: "done",
    description: `return max(${result1}, ${result2}) = ${ans}`,
    state: { ...state, result1, result2, done: true },
  });
  return steps;
}

export function generateUniquePathsSteps(input) {
  const nums = Array.isArray(input?.nums) ? input.nums.map(Number) : [];
  const m = Math.max(0, nums[0] ?? 0);
  const n = Math.max(0, nums[1] ?? 0);
  const steps = [];
  if (m === 0 || n === 0) {
    steps.push({ stepType: "init", description: "m or n is 0", state: { m, n, dp: [], i: 0, j: 0, done: true } });
    steps.push({ stepType: "done", description: "return 0", state: { m, n, dp: [], i: 0, j: 0, done: true } });
    return steps;
  }
  const dp = Array(n).fill(1);
  steps.push({
    stepType: "init",
    description: `dp = [1,1,...,1] (${n} columns); first row is all 1s`,
    state: { m, n, dp: [...dp], i: 0, j: 0, done: false },
  });
  for (let i = 1; i < m; i++) {
    steps.push({
      stepType: "loop_i",
      description: `Row i = ${i} (process row ${i + 1})`,
      state: { m, n, dp: [...dp], i, j: 0, done: false },
    });
    for (let j = 1; j < n; j++) {
      steps.push({
        stepType: "loop_j",
        description: `Column j = ${j}`,
        state: { m, n, dp: [...dp], i, j, done: false },
      });
      dp[j] += dp[j - 1];
      steps.push({
        stepType: "update",
        description: `dp[${j}] += dp[${j - 1}] → dp[${j}] = ${dp[j]}`,
        state: { m, n, dp: [...dp], i, j, done: false },
      });
    }
  }
  steps.push({
    stepType: "done",
    description: `return dp[${n - 1}] = ${dp[n - 1]}`,
    state: { m, n, dp: [...dp], i: m - 1, j: n - 1, done: true },
  });
  return steps;
}

export function generateJumpGameSteps(input) {
  const nums = Array.isArray(input?.nums) ? input.nums.map(Number) : (input?.nums != null ? [Number(input.nums)] : []);
  const steps = [];
  let reach = 0;
  steps.push({
    stepType: "init",
    description: "reach = 0 (furthest index we can reach)",
    state: { nums: [...nums], i: -1, reach: 0, unreachable: false, done: false },
  });
  for (let i = 0; i < nums.length; i++) {
    steps.push({
      stepType: "loop",
      description: `i = ${i}`,
      state: { nums: [...nums], i, reach, unreachable: false, done: false },
    });
    if (i > reach) {
      steps.push({
        stepType: "unreachable",
        description: `i (${i}) > reach (${reach}) → return false`,
        state: { nums: [...nums], i, reach, unreachable: true, done: false },
      });
      return steps;
    }
    const newReach = Math.max(reach, i + nums[i]);
    steps.push({
      stepType: "update",
      description: `reach = max(reach, i + nums[i]) = max(${reach}, ${i} + ${nums[i]}) = ${newReach}`,
      state: { nums: [...nums], i, reach: newReach, unreachable: false, done: false },
    });
    reach = newReach;
  }
  steps.push({
    stepType: "done",
    description: "Loop finished → return true",
    state: { nums: [...nums], i: nums.length - 1, reach, unreachable: false, done: true },
  });
  return steps;
}

export function generateParenthesesSteps(input) {
  const n = Math.max(0, Number(input?.n) ?? 0);
  const steps = [];
  const results = [];
  steps.push({ stepType: "init", description: `Generate all valid parentheses for n=${n}`, state: { n, open: 0, close: 0, path: "", results: [] } });
  function backtrack(open, close, path) {
    if (path.length === 2 * n) {
      results.push(path);
      steps.push({ stepType: "complete", description: `Complete: "${path}" → add to results`, state: { n, open, close, path, results: [...results] } });
      return;
    }
    if (open < n) {
      steps.push({ stepType: "add_open", description: `Add '(' (open=${open + 1}, close=${close})`, state: { n, open: open + 1, close, path: path + "(", results: [...results] } });
      backtrack(open + 1, close, path + "(");
    }
    if (close < open) {
      steps.push({ stepType: "add_close", description: `Add ')' (open=${open}, close=${close + 1})`, state: { n, open, close: close + 1, path: path + ")", results: [...results] } });
      backtrack(open, close + 1, path + ")");
    }
  }
  if (n > 0) backtrack(0, 0, "");
  steps.push({ stepType: "done", description: `✅ Generated ${results.length} combinations`, state: { n, open: n, close: n, path: "", results: [...results], done: true } });
  return steps;
}

export function generateMinStackSteps(input) {
  const nums = input?.nums ?? [];
  const steps = [];
  let st = [];
  let minSt = [];
  steps.push({ stepType: "init", description: "MinStack: two stacks (st, minSt)", state: { st: [], minSt: [], op: null, opVal: null, result: null } });
  for (let i = 0; i < nums.length; i++) {
    const val = Number(nums[i]);
    st = [...st, val];
    minSt = [...minSt, minSt.length === 0 ? val : Math.min(minSt[minSt.length - 1], val)];
    steps.push({ stepType: "push", description: `push(${val}) → st=[${st.join(", ")}], minSt=[${minSt.join(", ")}]`, state: { st: [...st], minSt: [...minSt], op: "push", opVal: val, result: null } });
  }
  if (st.length > 0) {
    const minVal = minSt[minSt.length - 1];
    steps.push({ stepType: "getMin", description: `getMin() → ${minVal}`, state: { st: [...st], minSt: [...minSt], op: "getMin", opVal: null, result: minVal } });
    st = st.slice(0, -1);
    minSt = minSt.slice(0, -1);
    steps.push({ stepType: "pop", description: `pop() → st=[${st.join(", ") || "empty"}], minSt=[${minSt.join(", ") || "empty"}]`, state: { st: [...st], minSt: [...minSt], op: "pop", opVal: null, result: null } });
    if (st.length > 0) {
      const topVal = st[st.length - 1];
      steps.push({ stepType: "top", description: `top() → ${topVal}`, state: { st: [...st], minSt: [...minSt], op: "top", opVal: null, result: topVal } });
      const minVal2 = minSt[minSt.length - 1];
      steps.push({ stepType: "getMin", description: `getMin() → ${minVal2}`, state: { st: [...st], minSt: [...minSt], op: "getMin", opVal: null, result: minVal2 } });
    }
  }
  steps.push({ stepType: "done", description: "Done", state: { st: [...st], minSt: [...minSt], op: null, opVal: null, result: null, done: true } });
  return steps;
}

export function generateReorderListSteps(input) {
  const head = Array.isArray(input?.head) ? [...input.head] : [];
  if (head.length < 2) {
    return [
      { stepType: "init", description: "List too short", state: { head: [...head], prevIdx: -1, currIdx: -1, nextIdx: -1, reversed: 0, phase: "done", done: true } },
    ];
  }
  const steps = [];
  let slow = 0, fast = 0;
  steps.push({ stepType: "init", description: "Find middle with slow/fast pointers", state: { head: [...head], prevIdx: -1, currIdx: 0, nextIdx: 0, reversed: 0, phase: "find_mid", done: false } });
  while (fast + 2 < head.length) {
    slow++;
    fast += 2;
    steps.push({ stepType: "find_mid", description: `slow=${slow}, fast=${fast}`, state: { head: [...head], prevIdx: -1, currIdx: slow, nextIdx: Math.min(fast, head.length - 1), reversed: 0, phase: "find_mid", done: false } });
  }
  const midIdx = slow;
  const firstHalf = head.slice(0, midIdx + 1);
  const secondHalf = head.slice(midIdx + 1);
  steps.push({ stepType: "split", description: `Split: first=[${firstHalf.join(",")}], second=[${secondHalf.join(",")}]`, state: { head: [...head], firstHalf: [...firstHalf], secondHalf: [...secondHalf], phase: "split", done: false } });
  const reversedSecond = [...secondHalf].reverse();
  steps.push({ stepType: "reverse_start", description: "Reverse second half", state: { head: reversedSecond, prevIdx: -1, currIdx: 0, nextIdx: 1, reversed: 0, phase: "reverse", done: false } });
  for (let r = 0; r < reversedSecond.length; r++) {
    steps.push({ stepType: "reverse_step", description: `Reverse step ${r + 1}/${reversedSecond.length}`, state: { head: reversedSecond, prevIdx: r - 1, currIdx: r, nextIdx: r + 1 < reversedSecond.length ? r + 1 : -1, reversed: r, phase: "reverse", done: false } });
  }
  steps.push({ stepType: "reverse_done", description: "Second half reversed", state: { head: reversedSecond, prevIdx: reversedSecond.length - 1, currIdx: -1, nextIdx: -1, reversed: reversedSecond.length, phase: "reverse", done: false } });
  const merged = [];
  let i = 0, j = 0;
  while (i < firstHalf.length || j < reversedSecond.length) {
    if (i < firstHalf.length) { merged.push(firstHalf[i]); i++; }
    if (j < reversedSecond.length) { merged.push(reversedSecond[j]); j++; }
  }
  steps.push({ stepType: "merge", description: `Merge: [${merged.join(",")}]`, state: { head: [...merged], prevIdx: -1, currIdx: -1, nextIdx: -1, reversed: 0, phase: "merge", done: true } });
  return steps;
}

export function generateNumConnectedComponentsSteps(input) {
  const n = Math.max(0, Number(input?.n) ?? 0);
  const edges = buildEdgesFromNums(n, input?.nums || []);
  const steps = [];
  if (n <= 0) {
    steps.push({ stepType: "init", description: "Enter n and edges", state: { n: 0, edges: [], vis: [], count: 0, componentId: [], current: null, highlighted: [] } });
    steps.push({ stepType: "done", description: "Done", state: { n: 0, edges: [], vis: [], count: 0, componentId: [], done: true } });
    return steps;
  }
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    if (a >= 0 && a < n && b >= 0 && b < n) { graph[a].push(b); graph[b].push(a); }
  }
  const vis = Array(n).fill(false);
  const componentId = Array(n).fill(0);
  let count = 0;
  steps.push({ stepType: "init", description: `Build graph: ${n} nodes, ${edges.length} edges`, state: { n, edges: [...edges], vis: [...vis], count: 0, componentId: [...componentId], current: null, highlighted: [] } });
  function dfs(u, comp, stepsRef) {
    vis[u] = true;
    componentId[u] = comp;
    stepsRef.push({ stepType: "dfs_visit", description: `Visit node ${u} (component ${comp})`, state: { n, edges: [...edges], vis: [...vis], count, componentId: [...componentId], current: u, highlighted: [u] } });
    for (const v of graph[u]) {
      if (!vis[v]) {
        stepsRef.push({ stepType: "dfs_recurse", description: `DFS ${u} → ${v}`, state: { n, edges: [...edges], vis: [...vis], count, componentId: [...componentId], current: v, highlighted: [u, v] } });
        dfs(v, comp, stepsRef);
      }
    }
  }
  for (let i = 0; i < n; i++) {
    if (!vis[i]) {
      count++;
      steps.push({ stepType: "count_inc", description: `New component ${count}: start DFS from node ${i}`, state: { n, edges: [...edges], vis: [...vis], count, componentId: [...componentId], current: i, highlighted: [i] } });
      dfs(i, count, steps);
    }
  }
  steps.push({ stepType: "done", description: `Answer: ${count} connected component(s)`, state: { n, edges: [...edges], vis: [...vis], count, componentId: [...componentId], current: null, highlighted: [], done: true } });
  return steps;
}

export function generateGraphValidTreeSteps(input) {
  const n = Math.max(0, Number(input?.n) ?? 0);
  const edges = buildEdgesFromNums(n, input?.nums || []);
  const steps = [];

  steps.push({
    stepType: "check_edges",
    description: `Check: edges.length (${edges.length}) == n-1 (${n - 1})?`,
    state: { n, edges: [...edges], vis: [], highlighted: [], validTree: null },
  });

  if (edges.length !== n - 1) {
    steps.push({
      stepType: "check_edges_fail",
      description: "No → return false (need exactly n-1 edges for a tree)",
      state: { n, edges: [...edges], vis: [], highlighted: [], validTree: false, done: true },
    });
    return steps;
  }

  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    if (a >= 0 && a < n && b >= 0 && b < n) { graph[a].push(b); graph[b].push(a); }
  }
  const vis = Array(n).fill(false);

  steps.push({
    stepType: "build_graph",
    description: `Build graph: ${n} nodes, ${edges.length} edges`,
    state: { n, edges: [...edges], vis: [...vis], highlighted: [] },
  });

  steps.push({
    stepType: "dfs_start",
    description: "DFS(0)",
    state: { n, edges: [...edges], vis: [...vis], highlighted: [0] },
  });

  function dfs(u, stepsRef) {
    vis[u] = true;
    stepsRef.push({
      stepType: "dfs_visit",
      description: `Visit node ${u} (mark vis[${u}]=true)`,
      state: { n, edges: [...edges], vis: [...vis], highlighted: [u] },
    });
    for (const v of graph[u]) {
      if (!vis[v]) {
        stepsRef.push({
          stepType: "dfs_recurse",
          description: `DFS ${u} → ${v}`,
          state: { n, edges: [...edges], vis: [...vis], highlighted: [u, v] },
        });
        dfs(v, stepsRef);
      }
    }
  }

  if (n > 0) dfs(0, steps);

  const allVisited = n === 0 || vis.every(Boolean);
  steps.push({
    stepType: "check_all_vis",
    description: `All ${n} nodes visited? ${allVisited}`,
    state: { n, edges: [...edges], vis: [...vis], highlighted: [], validTree: allVisited },
  });
  steps.push({
    stepType: "done",
    description: allVisited ? "Valid tree: true" : "Valid tree: false",
    state: { n, edges: [...edges], vis: [...vis], highlighted: [], validTree: allVisited, done: true },
  });
  return steps;
}

function stubGraphSteps(input) {
  const n = input?.n != null ? input.n : 0;
  const edges = buildEdgesFromNums(n, input?.nums || []);
  const steps = [
    { stepType: "init", description: "Graph: nodes 0.." + (n - 1) + ", " + edges.length + " edges", state: { n, edges: [...edges], highlighted: [] } },
  ];
  for (let i = 0; i < Math.min(edges.length, 4); i++) {
    steps.push({ stepType: "visit", description: "Edge " + edges[i][0] + "–" + edges[i][1], state: { n, edges: [...edges], highlighted: [edges[i][0], edges[i][1]] } });
  }
  steps.push({ stepType: "done", description: "Done", state: { n, edges: [...edges], highlighted: [], done: true } });
  return steps;
}

export function generateAlienDictionarySteps(input) {
  const raw = (input?.words ?? input?.s ?? "wrt,wrf,er,ett,rftt").toString().trim();
  const words = raw ? raw.split(",").map(w => w.trim()).filter(Boolean) : [];
  if (words.length < 2) {
    return [
      { stepType: "init", description: "Enter words (comma-separated)", state: { n: 0, edges: [], labels: [], highlighted: [], result: "", done: true } },
    ];
  }
  const chars = [...new Set(words.join(""))];
  const charToIdx = {};
  chars.forEach((c, i) => { charToIdx[c] = i; });
  const n = chars.length;
  const labels = [...chars];
  const graph = {};
  const inDeg = {};
  chars.forEach(c => { graph[c] = new Set(); inDeg[c] = 0; });

  for (let i = 0; i < words.length - 1; i++) {
    const a = words[i], b = words[i + 1];
    for (let j = 0; j < Math.min(a.length, b.length); j++) {
      if (a[j] !== b[j]) {
        if (!graph[a[j]].has(b[j])) {
          graph[a[j]].add(b[j]);
          inDeg[b[j]]++;
        }
        break;
      }
    }
  }
  const edges = [];
  chars.forEach(u => {
    graph[u].forEach(v => edges.push([charToIdx[u], charToIdx[v]]));
  });

  const steps = [];
  steps.push({
    stepType: "init",
    description: `Build graph from ${words.length} words: ${labels.join(", ")}`,
    state: { n, edges: [...edges], labels: [...labels], highlighted: [], result: "", directed: true },
  });
  steps.push({
    stepType: "build_edges",
    description: `Edges from comparing adjacent words: ${edges.length} edges`,
    state: { n, edges: [...edges], labels: [...labels], highlighted: [], result: "", directed: true },
  });

  const inCopy = { ...inDeg };
  const q = chars.filter(c => inCopy[c] === 0);
  let result = "";
  while (q.length) {
    const c = q.shift();
    const idx = charToIdx[c];
    result += c;
    steps.push({
      stepType: "visit",
      description: `Pop '${c}' (in-degree 0) → result: "${result}"`,
      state: { n, edges: [...edges], labels: [...labels], highlighted: [idx], result, directed: true },
    });
    graph[c].forEach(nxt => {
      inCopy[nxt]--;
      if (inCopy[nxt] === 0) q.push(nxt);
    });
  }

  const valid = result.length === n;
  steps.push({
    stepType: "done",
    description: valid ? `✓ Order: "${result}"` : `Invalid (cycle?)`,
    state: { n, edges: [...edges], labels: [...labels], highlighted: [], result, done: true, directed: true },
  });
  return steps;
}

export function generateTrappingRainWaterSteps(input) {
  const height = input?.nums || [];
  const n = height.length;
  const waterAt = Array(n).fill(0);
  const steps = [
    { stepType: "init", description: "Initialize l=0, r=n-1, leftMax=0, rightMax=0, water=0", state: { l: 0, r: Math.max(0, n - 1), leftMax: 0, rightMax: 0, water: 0, waterAt: [...waterAt] } },
  ];
  if (n < 2) {
    steps.push({ stepType: "done", description: "n < 2 → return 0", state: { l: 0, r: Math.max(0, n - 1), water: 0, waterAt: [...waterAt], done: true } });
    return steps;
  }
  let l = 0, r = n - 1, leftMax = 0, rightMax = 0, water = 0;
  while (l < r) {
    if (height[l] <= height[r]) {
      if (height[l] >= leftMax) {
        steps.push({ stepType: "update_leftMax", description: `height[${l}]=${height[l]} ≥ leftMax → leftMax=${height[l]}`, state: { l, r, leftMax: height[l], rightMax, water, waterAt: [...waterAt] } });
        leftMax = height[l];
      } else {
        const add = leftMax - height[l];
        water += add;
        waterAt[l] = add;
        steps.push({ stepType: "add_water_left", description: `height[${l}]=${height[l]} < leftMax → water += ${add} = ${water}`, state: { l, r, leftMax, rightMax, water, waterAt: [...waterAt] } });
      }
      l++;
      if (l < r) steps.push({ stepType: "loop", description: `l++ → l=${l}`, state: { l, r, leftMax, rightMax, water, waterAt: [...waterAt] } });
    } else {
      if (height[r] >= rightMax) {
        steps.push({ stepType: "update_rightMax", description: `height[${r}]=${height[r]} ≥ rightMax → rightMax=${height[r]}`, state: { l, r, leftMax, rightMax: height[r], water, waterAt: [...waterAt] } });
        rightMax = height[r];
      } else {
        const add = rightMax - height[r];
        water += add;
        waterAt[r] = add;
        steps.push({ stepType: "add_water_right", description: `height[${r}]=${height[r]} < rightMax → water += ${add} = ${water}`, state: { l, r, leftMax, rightMax, water, waterAt: [...waterAt] } });
      }
      r--;
      if (l < r) steps.push({ stepType: "loop", description: `r-- → r=${r}`, state: { l, r, leftMax, rightMax, water, waterAt: [...waterAt] } });
    }
  }
  steps.push({ stepType: "done", description: `✓ Return water = ${water}`, state: { l, r, leftMax, rightMax, water, waterAt: [...waterAt], done: true } });
  return steps;
}

export function generateCourseScheduleSteps(input) {
  const n = Math.max(0, Number(input?.n) ?? 0);
  const rawEdges = buildEdgesFromNums(n, input?.nums || []);
  // Course Schedule: [a,b] means course a depends on b → edge b→a (b is prerequisite)
  const edges = rawEdges.map(([a, b]) => [b, a]);
  const steps = [];
  if (n <= 0) {
    steps.push({ stepType: "init", description: "Enter numCourses and prerequisites", state: { n: 0, edges: [], nodeState: [], highlighted: [] } });
    steps.push({ stepType: "done", description: "Done", state: { n: 0, edges: [], nodeState: [], highlighted: [], canFinish: true, done: true } });
    return steps;
  }
  const graph = Array.from({ length: n }, () => []);
  for (const [from, to] of edges) {
    if (from >= 0 && from < n && to >= 0 && to < n) graph[from].push(to);
  }
  const nodeState = Array(n).fill(0);

  steps.push({
    stepType: "build_graph",
    description: `Build graph: ${n} courses, ${edges.length} prerequisites (edge b→a means "a depends on b")`,
    state: { n, edges: [...edges], nodeState: [...nodeState], highlighted: [], directed: true },
  });

  function dfs(u, stepsRef) {
    stepsRef.push({
      stepType: "check_visiting",
      description: `DFS(${u}): state[${u}] == 1 (visiting)?`,
      state: { n, edges: [...edges], nodeState: [...nodeState], highlighted: [u], directed: true },
    });
    if (nodeState[u] === 1) {
      stepsRef.push({
        stepType: "cycle",
        description: `Cycle detected at node ${u}! Return false`,
        state: { n, edges: [...edges], nodeState: [...nodeState], highlighted: [u], canFinish: false, done: true, directed: true },
      });
      return false;
    }
    stepsRef.push({
      stepType: "check_done",
      description: `state[${u}] == 2 (done)?`,
      state: { n, edges: [...edges], nodeState: [...nodeState], highlighted: [u], directed: true },
    });
    if (nodeState[u] === 2) {
      stepsRef.push({
        stepType: "skip_done",
        description: `Already done → return true`,
        state: { n, edges: [...edges], nodeState: [...nodeState], highlighted: [u], directed: true },
      });
      return true;
    }
    nodeState[u] = 1;
    stepsRef.push({
      stepType: "set_visiting",
      description: `state[${u}] = 1 (visiting)`,
      state: { n, edges: [...edges], nodeState: [...nodeState], highlighted: [u], directed: true },
    });
    for (const v of graph[u]) {
      stepsRef.push({
        stepType: "dfs_recurse",
        description: `DFS ${u} → ${v} (recurse)`,
        state: { n, edges: [...edges], nodeState: [...nodeState], highlighted: [u, v], directed: true },
      });
      if (!dfs(v, stepsRef)) return false;
    }
    nodeState[u] = 2;
    stepsRef.push({
      stepType: "set_done",
      description: `state[${u}] = 2 (done)`,
      state: { n, edges: [...edges], nodeState: [...nodeState], highlighted: [u], directed: true },
    });
    return true;
  }

  for (let i = 0; i < n; i++) {
    steps.push({
      stepType: "main_loop",
      description: `Try DFS from course ${i}`,
      state: { n, edges: [...edges], nodeState: [...nodeState], highlighted: [i], directed: true },
    });
    if (!dfs(i, steps)) {
      return steps;
    }
  }

  steps.push({
    stepType: "done",
    description: "All courses finished without cycle → return true",
    state: { n, edges: [...edges], nodeState: [...nodeState], highlighted: [], canFinish: true, done: true, directed: true },
  });
  return steps;
}

export const STEP_GENERATORS = {
  "two-sum":              generateTwoSumSteps,
  "longest-consecutive":  generateLongestConsecutiveSteps,
  "contains-duplicate":   generateContainsDuplicateSteps,
  "valid-anagram":        generateAnagramSteps,
  "best-time-stock":      generateStockSteps,
  "binary-search":        generateBinarySearchSteps,
  "climbing-stairs":      generateClimbingStairsSteps,
  "max-subarray":         generateMaxSubarraySteps,
  "subtree-of-another-tree": generateSubtreeSteps,
  "valid-palindrome":        generateValidPalindromeSteps,
  "valid-parentheses":       generateValidParenthesesSteps,
  "product-except-self":     generateProductExceptSelfSteps,
  "max-product-subarray":    generateMaxProductSubarraySteps,
  "house-robber":            generateHouseRobberSteps,
  "missing-number":          generateMissingNumberSteps,
  "max-depth-tree":          generateMaxDepthTreeSteps,
  "invert-tree":             generateInvertTreeSteps,
  "same-tree":               generateSameTreeSteps,
  "reverse-linked-list":     generateReverseLinkedListSteps,
  "three-sum":                generateThreeSumSteps,
  "container-most-water":     generateContainerSteps,
  "merge-two-sorted-lists":   generateMergeTwoListsSteps,
  "merge-intervals":         generateMergeIntervalsSteps,
  "linked-list-cycle":       generateLinkedListCycleSteps,
  "number-of-islands":       generateNumberOfIslandsSteps,
  "max-area-of-island":      generateMaxAreaOfIslandSteps,
  "min-rotated-sorted":      (i) => stubArraySteps(i),
  "search-rotated-sorted":   generateSearchRotatedSteps,
  "sum-two-integers":        generateSumTwoIntegersSteps,
  "number-of-1-bits":        generateHammingWeightSteps,
  "counting-bits":           generateCountingBitsSteps,
  "reverse-bits":            generateReverseBitsSteps,
  "coin-change":             (i) => stubWithNumsTarget(i),
  "longest-increasing-subsequence": generateLongestIncreasingSubsequenceSteps,
  "longest-common-subsequence": generateLongestCommonSubsequenceSteps,
  "word-break":              generateWordBreakSteps,
  "combination-sum":         generateCombinationSumSteps,
  "house-robber-ii":         generateHouseRobberIISteps,
  "decode-ways":             generateDecodeWaysSteps,
  "unique-paths":            generateUniquePathsSteps,
  "jump-game":               generateJumpGameSteps,
  "insert-interval":         generateInsertIntervalSteps,
  "non-overlapping-intervals": (i) => stubIntervalSteps(i),
  "meeting-rooms":          (i) => stubIntervalSteps(i),
  "meeting-rooms-ii":        (i) => stubIntervalSteps(i),
  "merge-k-sorted-lists":    generateMergeKSortedListsSteps,
  "remove-nth-node":        generateRemoveNthNodeSteps,
  "reorder-list":            generateReorderListSteps,
  "copy-list-random-pointer": (i) => stubLinkedListSteps(i),
  "clone-graph":            (i) => stubGraphSteps(i),
  "course-schedule":        generateCourseScheduleSteps,
  "pacific-atlantic":        generatePacificAtlanticSteps,
  "num-connected-components": generateNumConnectedComponentsSteps,
  "graph-valid-tree":        generateGraphValidTreeSteps,
  "group-anagrams":          generateGroupAnagramsSteps,
  "longest-substring-no-repeat": generateLongestSubstringNoRepeatSteps,
  "longest-palindromic-substring": generateLongestPalindromicSubstringSteps,
  "top-k-frequent":          generateTopKFrequentSteps,
  "subsets":                 generateSubsetsSteps,
  "permutations":            generatePermutationsSteps,
  "min-stack":               generateMinStackSteps,
  "eval-rpn":               generateEvalRpnSteps,
  "generate-parentheses":    generateParenthesesSteps,
  "trapping-rain-water":     generateTrappingRainWaterSteps,
  "palindromic-substrings":  (i) => stubStringSteps(i),
  "longest-repeating-char-replacement": (i) => stubStringSteps(i),
  "encode-decode-strings":   (i) => stubStringSteps(i),
  "rotate-image":            (i) => stubGridSteps(i),
  "set-matrix-zeroes":       (i) => stubGridSteps(i),
  "word-search":             (i) => stubGridSteps(i),
  "spiral-matrix":           (i) => stubGridSteps(i),
  "alien-dictionary":        generateAlienDictionarySteps,
};
