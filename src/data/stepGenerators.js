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

export const STEP_GENERATORS = {
  "two-sum":              generateTwoSumSteps,
  "longest-consecutive":  generateLongestConsecutiveSteps,
  "contains-duplicate":   generateContainsDuplicateSteps,
  "valid-anagram":        generateAnagramSteps,
  "best-time-stock":      generateStockSteps,
  "binary-search":        generateBinarySearchSteps,
  "climbing-stairs":      generateClimbingStairsSteps,
};
