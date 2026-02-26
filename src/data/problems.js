export const LANG_META = {
  cpp:        { label: "C++",        iconBg: "#00599c", iconColor: "#fff"     },
  java:       { label: "Java",       iconBg: "#f89820", iconColor: "#fff"     },
  javascript: { label: "JavaScript", iconBg: "#f7df1e", iconColor: "#1c1c2e" },
  python:     { label: "Python",     iconBg: "#3776ab", iconColor: "#fff"     },
};

export const DIFF_COLOR = {
  Easy:   { bg: "#d4f5e2", color: "#0f5132" },
  Medium: { bg: "#fff3cd", color: "#664d03" },
  Hard:   { bg: "#ffd6d6", color: "#6e0b0b" },
};

export const CAT_ICON = {
  "Arrays":              "🗂️",
  "Sliding Window":      "🪟",
  "Binary Search":       "🔍",
  "Dynamic Programming": "🧩",
  "Trees":               "🌳",
  "Two Pointers":        "👆",
  "Stack":               "📚",
  "Linked Lists":        "🔗",
  "Intervals":           "📐",
  "Graphs":               "🕸️",
  "Strings":              "📝",
  "Bit Manipulation":     "⚙️",
  "Backtracking":         "🔙",
  "Design":               "🎨",
};

export const PROBLEMS = {
  "two-sum": {
    title:           "Two Sum",
    difficulty:      "Easy",
    category:        "Arrays",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(n)",
    visualizer:      "array",
    description:     "Given an array of integers <code>nums</code> and an integer <code>target</code>, return <strong>indices</strong> of the two numbers that add up to target.",
    example:         { input: "nums = [2,7,11,15], target = 9", output: "[0, 1]", note: "nums[0] + nums[1] = 2 + 7 = 9" },
    defaultInput:    { nums: [2, 7, 11, 15], target: 9 },
    inputFields:     ["nums", "target"],
    explanation: [
      { emoji: "🤔", title: "The Brute Force Problem", body: "The naive approach checks every pair — O(n²). Too slow for large inputs." },
      { emoji: "💡", title: "The Key Insight", body: "For each number x, we already know exactly what we need: target − x. Have I seen that complement before?" },
      { emoji: "🗺️", title: "Using a Hash Map", body: "A hash map gives O(1) lookup. Walk the array, check the complement, store each number and its index." },
      { emoji: "👣", title: "Step by Step", body: "1. Create an empty map.\n2. For each nums[i], compute complement = target − nums[i].\n3. If complement is in the map → return [map[complement], i].\n4. Otherwise store map[nums[i]] = i." },
      { emoji: "⚡", title: "Why It's O(n)", body: "One pass through the array. Each hash map lookup and insert is O(1) on average." },
    ],
    languages: {
      cpp: {
        code: ["vector<int> twoSum(vector<int>& nums, int target) {","    unordered_map<int,int> map;","    for (int i = 0; i < nums.size(); i++) {","        int complement = target - nums[i];","        if (map.count(complement)) {","            return {map[complement], i};","        }","        map[nums[i]] = i;","    }","    return {};","}"],
        lineMap: { init: 2, loop: 3, complement: 4, check: 5, found: 6, store: 8 },
      },
      java: {
        code: ["public int[] twoSum(int[] nums, int target) {","    Map<Integer,Integer> map = new HashMap<>();","    for (int i = 0; i < nums.length; i++) {","        int complement = target - nums[i];","        if (map.containsKey(complement)) {","            return new int[]{map.get(complement), i};","        }","        map.put(nums[i], i);","    }","    return new int[]{};","}"],
        lineMap: { init: 2, loop: 3, complement: 4, check: 5, found: 6, store: 8 },
      },
      javascript: {
        code: ["function twoSum(nums, target) {","  const map = {};","  for (let i = 0; i < nums.length; i++) {","    const complement = target - nums[i];","    if (map[complement] !== undefined) {","      return [map[complement], i];","    }","    map[nums[i]] = i;","  }","}"],
        lineMap: { init: 2, loop: 3, complement: 4, check: 5, found: 6, store: 8 },
      },
      python: {
        code: ["def two_sum(nums, target):","    seen = {}","    for i, num in enumerate(nums):","        complement = target - num","        if complement in seen:","            return [seen[complement], i]","        seen[num] = i"],
        lineMap: { init: 2, loop: 3, complement: 4, check: 5, found: 6, store: 7 },
      },
    },
  },

  "longest-consecutive": {
    title:           "Longest Consecutive Sequence",
    difficulty:      "Medium",
    category:        "Arrays",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(n)",
    visualizer:      "consecutive",
    description:     "Given an unsorted array <code>nums</code>, return the length of the <strong>longest consecutive elements sequence</strong> in O(n) time.",
    example:         { input: "nums = [100,4,200,1,3,2]", output: "4", note: "Longest sequence: [1, 2, 3, 4]" },
    defaultInput:    { nums: [100, 4, 200, 1, 3, 2] },
    inputFields:     ["nums"],
    explanation: [
      { emoji: "🤔", title: "Why Not Just Sort?", body: "Sorting costs O(n log n). The problem requires O(n). We need a smarter approach." },
      { emoji: "💡", title: "The Key Insight", body: "A consecutive sequence always has a starting number — one where n−1 does NOT exist. Start counting only from those." },
      { emoji: "🗺️", title: "Using a Hash Set", body: "Dump all numbers into a hash set. For each n, check if n−1 is absent. If so, count forward until the chain breaks." },
      { emoji: "👣", title: "Step by Step", body: "1. Build a hash set.\n2. For each n, skip it if n−1 exists.\n3. Count up: curr++, streak++ while curr+1 is in set.\n4. Update longest." },
      { emoji: "⚡", title: "Why It's O(n)", body: "Each number is visited at most twice — once as a potential start, once as part of a streak." },
    ],
    languages: {
      cpp: {
        code: ["int longestConsecutive(vector<int>& nums) {","    unordered_set<int> numSet(nums.begin(), nums.end());","    int longest = 0;","    for (int n : numSet) {","        if (!numSet.count(n - 1)) {","            int curr = n, streak = 1;","            while (numSet.count(curr + 1)) {","                curr++;","                streak++;","            }","            longest = max(longest, streak);","        }","    }","    return longest;","}"],
        lineMap: { init_set: 2, init_longest: 3, loop: 4, check_start: 5, skip: 5, begin_streak: 6, extend_streak: 8, update_longest: 11, done: 14 },
      },
      java: {
        code: ["public int longestConsecutive(int[] nums) {","    Set<Integer> numSet = new HashSet<>();","    for (int n : nums) numSet.add(n);","    int longest = 0;","    for (int n : numSet) {","        if (!numSet.contains(n - 1)) {","            int curr = n, streak = 1;","            while (numSet.contains(curr + 1)) {","                curr++;","                streak++;","            }","            longest = Math.max(longest, streak);","        }","    }","    return longest;","}"],
        lineMap: { init_set: 2, init_longest: 4, loop: 5, check_start: 6, skip: 6, begin_streak: 7, extend_streak: 9, update_longest: 12, done: 15 },
      },
      javascript: {
        code: ["function longestConsecutive(nums) {","  const numSet = new Set(nums);","  let longest = 0;","  for (const n of numSet) {","    if (!numSet.has(n - 1)) {","      let curr = n, streak = 1;","      while (numSet.has(curr + 1)) {","        curr++;","        streak++;","      }","      longest = Math.max(longest, streak);","    }","  }","  return longest;","}"],
        lineMap: { init_set: 2, init_longest: 3, loop: 4, check_start: 5, skip: 5, begin_streak: 6, extend_streak: 8, update_longest: 11, done: 14 },
      },
      python: {
        code: ["def longestConsecutive(nums):","    num_set = set(nums)","    longest = 0","    for n in num_set:","        if n - 1 not in num_set:","            curr, streak = n, 1","            while curr + 1 in num_set:","                curr += 1","                streak += 1","            longest = max(longest, streak)","    return longest"],
        lineMap: { init_set: 2, init_longest: 3, loop: 4, check_start: 5, skip: 5, begin_streak: 6, extend_streak: 8, update_longest: 10, done: 11 },
      },
    },
  },

  "contains-duplicate": {
    title:           "Contains Duplicate",
    difficulty:      "Easy",
    category:        "Arrays",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(n)",
    visualizer:      "duplicate",
    description:     "Given an integer array <code>nums</code>, return <code>true</code> if any value appears at least twice.",
    example:         { input: "nums = [1,2,3,1]", output: "true", note: "1 appears at index 0 and 3" },
    defaultInput:    { nums: [1, 2, 3, 1] },
    inputFields:     ["nums"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "Compare every pair — O(n²). Too slow." },
      { emoji: "💡", title: "Key Insight", body: "A hash set lets us check membership in O(1). If a number is already in the set, we found a duplicate." },
      { emoji: "🗺️", title: "Hash Set", body: "Scan the array. Before inserting, check if it's already there. Yes → return true. No → add it." },
      { emoji: "👣", title: "Step by Step", body: "1. Create empty set.\n2. For each num: if in set → true, else add.\n3. Return false." },
      { emoji: "⚡", title: "Why O(n)", body: "One pass, O(1) set operations each time." },
    ],
    languages: {
      cpp: {
        code: ["bool containsDuplicate(vector<int>& nums) {","    unordered_set<int> seen;","    for (int n : nums) {","        if (seen.count(n)) return true;","        seen.insert(n);","    }","    return false;","}"],
        lineMap: { init: 2, loop: 3, check: 4, found: 4, store: 5, done: 7 },
      },
      java: {
        code: ["public boolean containsDuplicate(int[] nums) {","    Set<Integer> seen = new HashSet<>();","    for (int n : nums) {","        if (seen.contains(n)) return true;","        seen.add(n);","    }","    return false;","}"],
        lineMap: { init: 2, loop: 3, check: 4, found: 4, store: 5, done: 7 },
      },
      javascript: {
        code: ["function containsDuplicate(nums) {","  const seen = new Set();","  for (const n of nums) {","    if (seen.has(n)) return true;","    seen.add(n);","  }","  return false;","}"],
        lineMap: { init: 2, loop: 3, check: 4, found: 4, store: 5, done: 7 },
      },
      python: {
        code: ["def containsDuplicate(nums):","    seen = set()","    for n in nums:","        if n in seen:","            return True","        seen.add(n)","    return False"],
        lineMap: { init: 2, loop: 3, check: 4, found: 5, store: 6, done: 7 },
      },
    },
  },

  "valid-anagram": {
    title:           "Valid Anagram",
    difficulty:      "Easy",
    category:        "Arrays",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(1)",
    visualizer:      "anagram",
    description:     "Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>t</code> is an anagram of <code>s</code>.",
    example:         { input: 's = "anagram", t = "nagaram"', output: "true", note: "Same character frequencies" },
    defaultInput:    { s: "anagram", t: "nagaram" },
    inputFields:     ["s", "t"],
    explanation: [
      { emoji: "🤔", title: "What Is an Anagram?", body: '"listen" and "silent" are anagrams — same letters, different order.' },
      { emoji: "💡", title: "Key Insight", body: "Anagrams have identical character frequencies. Count each letter in both strings." },
      { emoji: "🗺️", title: "Frequency Map", body: "Increment for each char in s, decrement for each in t. Any count < 0 means t has extra chars." },
      { emoji: "👣", title: "Step by Step", body: "1. If lengths differ → false.\n2. Build freq map from s.\n3. Decrement for each char in t.\n4. Any < 0 → false. Done → true." },
      { emoji: "⚡", title: "Why O(1) Space", body: "Map has at most 26 keys (a–z). Constant space." },
    ],
    languages: {
      cpp: {
        code: ["bool isAnagram(string s, string t) {","    if (s.size() != t.size()) return false;","    unordered_map<char,int> freq;","    for (char c : s) freq[c]++;","    for (char c : t) {","        if (--freq[c] < 0) return false;","    }","    return true;","}"],
        lineMap: { check_len: 2, init: 3, count_s: 4, count_t: 5, decrement: 6, mismatch: 6, done: 8 },
      },
      java: {
        code: ["public boolean isAnagram(String s, String t) {","    if (s.length() != t.length()) return false;","    int[] freq = new int[26];","    for (char c : s.toCharArray()) freq[c - 'a']++;","    for (char c : t.toCharArray()) {","        if (--freq[c - 'a'] < 0) return false;","    }","    return true;","}"],
        lineMap: { check_len: 2, init: 3, count_s: 4, count_t: 5, decrement: 6, mismatch: 6, done: 8 },
      },
      javascript: {
        code: ["function isAnagram(s, t) {","  if (s.length !== t.length) return false;","  const freq = {};","  for (const c of s) freq[c] = (freq[c] || 0) + 1;","  for (const c of t) {","    freq[c] = (freq[c] || 0) - 1;","    if (freq[c] < 0) return false;","  }","  return true;","}"],
        lineMap: { check_len: 2, init: 3, count_s: 4, count_t: 5, decrement: 6, mismatch: 7, done: 9 },
      },
      python: {
        code: ["def isAnagram(s, t):","    if len(s) != len(t): return False","    freq = {}","    for c in s:","        freq[c] = freq.get(c, 0) + 1","    for c in t:","        freq[c] = freq.get(c, 0) - 1","        if freq[c] < 0: return False","    return True"],
        lineMap: { check_len: 2, init: 3, count_s: 4, count_s2: 5, count_t: 6, decrement: 7, mismatch: 8, done: 9 },
      },
    },
  },

  "best-time-stock": {
    title:           "Best Time to Buy & Sell Stock",
    difficulty:      "Easy",
    category:        "Sliding Window",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(1)",
    visualizer:      "stock",
    description:     "Given <code>prices[i]</code> = price on day i, return the <strong>maximum profit</strong> from one buy and one sell.",
    example:         { input: "prices = [7,1,5,3,6,4]", output: "5", note: "Buy day 2 (price=1), sell day 5 (price=6)" },
    defaultInput:    { prices: [7, 1, 5, 3, 6, 4] },
    inputFields:     ["prices"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "Try every (buy, sell) pair — O(n²)." },
      { emoji: "💡", title: "Key Insight", body: "Track min price seen so far. Best profit = today's price − minSoFar. Keep the running max." },
      { emoji: "🗺️", title: "Sliding Window", body: "left = cheapest buy day. right = today. If prices[right] < prices[left], move left forward." },
      { emoji: "👣", title: "Step by Step", body: "1. minPrice=∞, maxProfit=0.\n2. For each price p: minPrice=min(minPrice,p); maxProfit=max(maxProfit,p−minPrice).\n3. Return maxProfit." },
      { emoji: "⚡", title: "Why O(1) Space", body: "Only two variables needed. No extra structures." },
    ],
    languages: {
      cpp: {
        code: ["int maxProfit(vector<int>& prices) {","    int minPrice = INT_MAX, maxProfit = 0;","    for (int p : prices) {","        minPrice = min(minPrice, p);","        maxProfit = max(maxProfit, p - minPrice);","    }","    return maxProfit;","}"],
        lineMap: { init: 2, loop: 3, update_min: 4, update_profit: 5, done: 7 },
      },
      java: {
        code: ["public int maxProfit(int[] prices) {","    int minPrice = Integer.MAX_VALUE, maxProfit = 0;","    for (int p : prices) {","        minPrice = Math.min(minPrice, p);","        maxProfit = Math.max(maxProfit, p - minPrice);","    }","    return maxProfit;","}"],
        lineMap: { init: 2, loop: 3, update_min: 4, update_profit: 5, done: 7 },
      },
      javascript: {
        code: ["function maxProfit(prices) {","  let minPrice = Infinity, maxProfit = 0;","  for (const p of prices) {","    minPrice = Math.min(minPrice, p);","    maxProfit = Math.max(maxProfit, p - minPrice);","  }","  return maxProfit;","}"],
        lineMap: { init: 2, loop: 3, update_min: 4, update_profit: 5, done: 7 },
      },
      python: {
        code: ["def maxProfit(prices):","    min_price, max_profit = float('inf'), 0","    for p in prices:","        min_price = min(min_price, p)","        max_profit = max(max_profit, p - min_price)","    return max_profit"],
        lineMap: { init: 2, loop: 3, update_min: 4, update_profit: 5, done: 6 },
      },
    },
  },

  "binary-search": {
    title:           "Binary Search",
    difficulty:      "Easy",
    category:        "Binary Search",
    timeComplexity:  "O(log n)",
    spaceComplexity: "O(1)",
    visualizer:      "binsearch",
    description:     "Given a sorted array <code>nums</code> and a <code>target</code>, return the index of target or <strong>-1</strong> if not found.",
    example:         { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", note: "9 exists at index 4" },
    defaultInput:    { nums: [-1, 0, 3, 5, 9, 12], target: 9 },
    inputFields:     ["nums", "target"],
    explanation: [
      { emoji: "🤔", title: "Linear Search", body: "Checking every element is O(n). Sorted arrays allow much better." },
      { emoji: "💡", title: "Key Insight", body: "The middle element tells us which half contains the target. Eliminate half each step." },
      { emoji: "🗺️", title: "Two Pointers", body: "left and right boundaries. mid = (left+right)//2. Move boundaries based on comparison." },
      { emoji: "👣", title: "Step by Step", body: "1. left=0, right=n−1.\n2. While left≤right: mid=(l+r)//2; if match→return; if target>mid→left=mid+1; else→right=mid−1.\n3. Return −1." },
      { emoji: "⚡", title: "Why O(log n)", body: "We halve the search space every step. Takes at most log₂(n) steps." },
    ],
    languages: {
      cpp: {
        code: ["int search(vector<int>& nums, int target) {","    int left = 0, right = nums.size() - 1;","    while (left <= right) {","        int mid = left + (right - left) / 2;","        if (nums[mid] == target) return mid;","        if (target > nums[mid]) left = mid + 1;","        else right = mid - 1;","    }","    return -1;","}"],
        lineMap: { init: 2, loop: 3, calc_mid: 4, found: 5, go_right: 6, go_left: 7, done: 9 },
      },
      java: {
        code: ["public int search(int[] nums, int target) {","    int left = 0, right = nums.length - 1;","    while (left <= right) {","        int mid = left + (right - left) / 2;","        if (nums[mid] == target) return mid;","        if (target > nums[mid]) left = mid + 1;","        else right = mid - 1;","    }","    return -1;","}"],
        lineMap: { init: 2, loop: 3, calc_mid: 4, found: 5, go_right: 6, go_left: 7, done: 9 },
      },
      javascript: {
        code: ["function search(nums, target) {","  let left = 0, right = nums.length - 1;","  while (left <= right) {","    const mid = Math.floor((left + right) / 2);","    if (nums[mid] === target) return mid;","    if (target > nums[mid]) left = mid + 1;","    else right = mid - 1;","  }","  return -1;","}"],
        lineMap: { init: 2, loop: 3, calc_mid: 4, found: 5, go_right: 6, go_left: 7, done: 9 },
      },
      python: {
        code: ["def search(nums, target):","    left, right = 0, len(nums) - 1","    while left <= right:","        mid = (left + right) // 2","        if nums[mid] == target:","            return mid","        elif target > nums[mid]:","            left = mid + 1","        else:","            right = mid - 1","    return -1"],
        lineMap: { init: 2, loop: 3, calc_mid: 4, found: 5, go_right: 7, go_left: 9, done: 11 },
      },
    },
  },

  "climbing-stairs": {
    title:           "Climbing Stairs",
    difficulty:      "Easy",
    category:        "Dynamic Programming",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(1)",
    visualizer:      "climbing",
    description:     "You climb a staircase with <code>n</code> steps. Each time you can climb <strong>1 or 2</strong> steps. How many distinct ways to the top?",
    example:         { input: "n = 5", output: "8", note: "[1,1,1,1,1] [1,1,1,2] [1,1,2,1] [1,2,1,1] [2,1,1,1] [1,2,2] [2,1,2] [2,2,1]" },
    defaultInput:    { n: 5 },
    inputFields:     ["n"],
    explanation: [
      { emoji: "🤔", title: "Recursive Thinking", body: "To reach step n, you came from n−1 or n−2. So ways(n) = ways(n−1) + ways(n−2). That's Fibonacci!" },
      { emoji: "💡", title: "Key Insight", body: "ways(1)=1, ways(2)=2, ways(n)=ways(n−1)+ways(n−2)." },
      { emoji: "🗺️", title: "Dynamic Programming", body: "Store only the last two values and slide forward. No recomputation." },
      { emoji: "👣", title: "Step by Step", body: "1. If n≤2, return n.\n2. prev2=1, prev1=2.\n3. For i=3 to n: curr=prev1+prev2, slide.\n4. Return prev1." },
      { emoji: "⚡", title: "Why O(1) Space", body: "Two variables (prev1, prev2) instead of an array." },
    ],
    languages: {
      cpp: {
        code: ["int climbStairs(int n) {","    if (n <= 2) return n;","    int prev2 = 1, prev1 = 2;","    for (int i = 3; i <= n; i++) {","        int curr = prev1 + prev2;","        prev2 = prev1;","        prev1 = curr;","    }","    return prev1;","}"],
        lineMap: { base: 2, init: 3, loop: 4, compute: 5, slide: 6, done: 9 },
      },
      java: {
        code: ["public int climbStairs(int n) {","    if (n <= 2) return n;","    int prev2 = 1, prev1 = 2;","    for (int i = 3; i <= n; i++) {","        int curr = prev1 + prev2;","        prev2 = prev1;","        prev1 = curr;","    }","    return prev1;","}"],
        lineMap: { base: 2, init: 3, loop: 4, compute: 5, slide: 6, done: 9 },
      },
      javascript: {
        code: ["function climbStairs(n) {","  if (n <= 2) return n;","  let prev2 = 1, prev1 = 2;","  for (let i = 3; i <= n; i++) {","    const curr = prev1 + prev2;","    prev2 = prev1;","    prev1 = curr;","  }","  return prev1;","}"],
        lineMap: { base: 2, init: 3, loop: 4, compute: 5, slide: 6, done: 9 },
      },
      python: {
        code: ["def climbStairs(n):","    if n <= 2: return n","    prev2, prev1 = 1, 2","    for i in range(3, n + 1):","        curr = prev1 + prev2","        prev2 = prev1","        prev1 = curr","    return prev1"],
        lineMap: { base: 2, init: 3, loop: 4, compute: 5, slide: 6, done: 8 },
      },
    },
  },

  "subtree-of-another-tree": {
    title:           "Subtree of Another Tree",
    difficulty:      "Easy",
    category:        "Trees",
    timeComplexity:  "O(m × n)",
    spaceComplexity: "O(h)",
    visualizer:      "subtree",
    description:     "Given the roots of two binary trees <code>root</code> and <code>subRoot</code>, return <code>true</code> if there is a subtree of <code>root</code> with the same structure and node values as <code>subRoot</code>.",
    example:         { input: "root = [3,4,5,1,2], subRoot = [4,1,2]", output: "true", note: "The subtree rooted at 4 (left of 3) matches subRoot." },
    defaultInput:    { root: [3, 4, 5, 1, 2], subRoot: [4, 1, 2] },
    inputFields:     ["root", "subRoot"],
    explanation: [
      { emoji: "🤔", title: "What Is a Subtree?", body: "A subtree of a node includes that node and all of its descendants. We need to find if any subtree of root is identical to subRoot." },
      { emoji: "💡", title: "Key Insight", body: "For every node in root, check: \"Is the tree starting here identical to subRoot?\" Use a helper isSameTree(r, s)." },
      { emoji: "🌳", title: "Same Tree Check", body: "Both null → true. One null → false. Values differ → false. Else: isSameTree(r.left, s.left) && isSameTree(r.right, s.right)." },
      { emoji: "👣", title: "Step by Step", body: "1. DFS on root. 2. At each node, call isSameTree(node, subRoot). 3. If true, return true. 4. Else recurse on left and right. 5. Return false if no match." },
      { emoji: "⚡", title: "Complexity", body: "For each of m nodes in root we may do a full comparison with subRoot (n nodes). So O(m × n) time. O(h) recursion stack." },
    ],
    languages: {
      cpp: {
        code: ["bool isSameTree(TreeNode* r, TreeNode* s) {","    if (!r && !s) return true;","    if (!r || !s || r->val != s->val) return false;","    return isSameTree(r->left, s->left) && isSameTree(r->right, s->right);","}","bool isSubtree(TreeNode* root, TreeNode* subRoot) {","    if (!root) return false;","    if (isSameTree(root, subRoot)) return true;","    return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);","}"],
        lineMap: { same_base: 2, same_mismatch: 3, same_compare: 3, same_recurse: 4, subtree_base: 7, visit: 8, subtree_found: 8, subtree_recurse: 9, done: 9 },
      },
      java: {
        code: ["boolean isSameTree(TreeNode r, TreeNode s) {","    if (r == null && s == null) return true;","    if (r == null || s == null || r.val != s.val) return false;","    return isSameTree(r.left, s.left) && isSameTree(r.right, s.right);","}","boolean isSubtree(TreeNode root, TreeNode subRoot) {","    if (root == null) return false;","    if (isSameTree(root, subRoot)) return true;","    return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);","}"],
        lineMap: { same_base: 2, same_mismatch: 3, same_compare: 3, same_recurse: 4, subtree_base: 7, visit: 8, subtree_found: 8, subtree_recurse: 9, done: 9 },
      },
      javascript: {
        code: ["function isSameTree(r, s) {","  if (!r && !s) return true;","  if (!r || !s || r.val !== s.val) return false;","  return isSameTree(r.left, s.left) && isSameTree(r.right, s.right);","}","function isSubtree(root, subRoot) {","  if (!root) return false;","  if (isSameTree(root, subRoot)) return true;","  return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);","}"],
        lineMap: { same_base: 2, same_mismatch: 3, same_compare: 3, same_recurse: 4, subtree_base: 7, visit: 8, subtree_found: 8, subtree_recurse: 9, done: 9 },
      },
      python: {
        code: ["def is_same_tree(r, s):","    if not r and not s: return True","    if not r or not s or r.val != s.val: return False","    return is_same_tree(r.left, s.left) and is_same_tree(r.right, s.right)","def is_subtree(root, sub_root):","    if not root: return False","    if is_same_tree(root, sub_root): return True","    return is_subtree(root.left, sub_root) or is_subtree(root.right, sub_root)"],
        lineMap: { same_base: 2, same_mismatch: 3, same_compare: 3, same_recurse: 4, subtree_base: 6, visit: 7, subtree_found: 7, subtree_recurse: 8, done: 8 },
      },
    },
  },

  "max-subarray": {
    title:           "Maximum Subarray (Kadane)",
    difficulty:      "Medium",
    category:        "Arrays",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(1)",
    visualizer:      "array",
    description:     "Given an integer array <code>nums</code>, find the contiguous subarray with the <strong>largest sum</strong> and return its sum.",
    example:         { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", note: "Subarray [4,-1,2,1] has the largest sum 6" },
    defaultInput:    { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
    inputFields:     ["nums"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "Try every (i,j) pair and sum — O(n³) or O(n²) with prefix sums. Too slow." },
      { emoji: "💡", title: "Key Insight", body: "At each index, the best sum ending here is either extend the previous run or start fresh: currentSum = max(nums[i], currentSum + nums[i])." },
      { emoji: "🗺️", title: "Kadane's Algorithm", body: "One pass: keep currentSum (best sum ending at i) and maxSum (global best). Update both at each step." },
      { emoji: "👣", title: "Step by Step", body: "1. currentSum = nums[0], maxSum = nums[0].\n2. For i=1..n-1: currentSum = max(nums[i], currentSum + nums[i]); maxSum = max(maxSum, currentSum).\n3. Return maxSum." },
      { emoji: "⚡", title: "Why O(1) Space", body: "Only two variables. No extra arrays." },
    ],
    languages: {
      cpp: {
        code: ["int maxSubArray(vector<int>& nums) {","    int currentSum = nums[0], maxSum = nums[0];","    for (int i = 1; i < nums.size(); i++) {","        currentSum = max(nums[i], currentSum + nums[i]);","        maxSum = max(maxSum, currentSum);","    }","    return maxSum;","}"],
        lineMap: { init: 2, loop: 3, update_current: 4, update_max: 5, done: 7 },
      },
      java: {
        code: ["public int maxSubArray(int[] nums) {","    int currentSum = nums[0], maxSum = nums[0];","    for (int i = 1; i < nums.length; i++) {","        currentSum = Math.max(nums[i], currentSum + nums[i]);","        maxSum = Math.max(maxSum, currentSum);","    }","    return maxSum;","}"],
        lineMap: { init: 2, loop: 3, update_current: 4, update_max: 5, done: 7 },
      },
      javascript: {
        code: ["function maxSubArray(nums) {","  let currentSum = nums[0], maxSum = nums[0];","  for (let i = 1; i < nums.length; i++) {","    currentSum = Math.max(nums[i], currentSum + nums[i]);","    maxSum = Math.max(maxSum, currentSum);","  }","  return maxSum;","}"],
        lineMap: { init: 2, loop: 3, update_current: 4, update_max: 5, done: 7 },
      },
      python: {
        code: ["def maxSubArray(nums):","    current_sum = max_sum = nums[0]","    for i in range(1, len(nums)):","        current_sum = max(nums[i], current_sum + nums[i])","        max_sum = max(max_sum, current_sum)","    return max_sum"],
        lineMap: { init: 2, loop: 3, update_current: 4, update_max: 5, done: 6 },
      },
    },
  },

  "valid-palindrome": {
    title:           "Valid Palindrome",
    difficulty:      "Easy",
    category:        "Two Pointers",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(1)",
    visualizer:      "palindrome",
    description:     "Given a string <code>s</code>, return <code>true</code> if it is a <strong>palindrome</strong> after converting to lowercase and removing non-alphanumeric characters.",
    example:         { input: 's = "A man, a plan, a canal: Panama"', output: "true", note: "After cleanup: 'amanaplanacanalpanama' reads the same." },
    defaultInput:    { s: "A man, a plan, a canal: Panama" },
    inputFields:     ["s"],
    explanation: [
      { emoji: "🤔", title: "The Brute Force Way", body: "Clean the string first, then compare with its reverse — O(n) time but O(n) extra space for the cleaned copy." },
      { emoji: "💡", title: "Two Pointers Insight", body: "Use two pointers from both ends. Skip non-alphanumeric characters and compare in-place — no extra string needed." },
      { emoji: "🔤", title: "Handling Characters", body: "Convert to lowercase before comparing. Skip anything that isn't a letter or digit by advancing the pointer." },
      { emoji: "👣", title: "Step by Step", body: "1. left = 0, right = end.\n2. Skip non-alnum from left, skip non-alnum from right.\n3. Compare lowercase chars.\n4. If mismatch → false. Else move both inward.\n5. If pointers cross → true." },
      { emoji: "⚡", title: "Why O(1) Space", body: "No extra string created. We compare characters directly in the original string using only two index variables." },
    ],
    languages: {
      cpp: {
        code: ["bool isPalindrome(string s) {","    int l = 0, r = s.size() - 1;","    while (l < r) {","        while (l < r && !isalnum(s[l])) l++;","        while (l < r && !isalnum(s[r])) r--;","        if (tolower(s[l]) != tolower(s[r])) return false;","        l++;","        r--;","    }","    return true;","}"],
        lineMap: { init: 2, loop: 3, skip_left: 4, skip_right: 5, compare: 6, found: 6, done: 10 },
      },
      java: {
        code: ["public boolean isPalindrome(String s) {","    int l = 0, r = s.length() - 1;","    while (l < r) {","        while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;","        while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;","        if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;","        l++;","        r--;","    }","    return true;","}"],
        lineMap: { init: 2, loop: 3, skip_left: 4, skip_right: 5, compare: 6, found: 6, done: 10 },
      },
      javascript: {
        code: ["function isPalindrome(s) {","  let l = 0, r = s.length - 1;","  while (l < r) {","    while (l < r && !/[a-z0-9]/i.test(s[l])) l++;","    while (l < r && !/[a-z0-9]/i.test(s[r])) r--;","    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;","    l++;","    r--;","  }","  return true;","}"],
        lineMap: { init: 2, loop: 3, skip_left: 4, skip_right: 5, compare: 6, found: 6, done: 10 },
      },
      python: {
        code: ["def isPalindrome(s):","    l, r = 0, len(s) - 1","    while l < r:","        while l < r and not s[l].isalnum(): l += 1","        while l < r and not s[r].isalnum(): r -= 1","        if s[l].lower() != s[r].lower(): return False","        l += 1","        r -= 1","    return True"],
        lineMap: { init: 2, loop: 3, skip_left: 4, skip_right: 5, compare: 6, found: 6, done: 9 },
      },
    },
  },

  "valid-parentheses": {
    title:           "Valid Parentheses",
    difficulty:      "Easy",
    category:        "Stack",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(n)",
    visualizer:      "parentheses",
    description:     "Given a string <code>s</code> containing just <code>()</code>, <code>{}</code>, <code>[]</code>, determine if the input string is <strong>valid</strong>.",
    example:         { input: 's = "()[]{}"', output: "true", note: "Each bracket is properly closed." },
    defaultInput:    { s: "()[]{}" },
    inputFields:     ["s"],
    explanation: [
      { emoji: "🤔", title: "Why a Stack?", body: "Brackets must close in reverse order of opening. A stack naturally handles this last-in, first-out pattern." },
      { emoji: "💡", title: "The Key Insight", body: "Push every opening bracket. When you see a closing bracket, the stack top must be its matching opener." },
      { emoji: "🗺️", title: "Matching Pairs", body: "Use a map: ')' → '(', '}' → '{', ']' → '['. On closing bracket, pop and compare." },
      { emoji: "👣", title: "Step by Step", body: "1. Create an empty stack.\n2. For each char: if opening → push.\n3. If closing → pop top; if it doesn't match → false.\n4. If stack empty when popping → false.\n5. End: stack must be empty." },
      { emoji: "⚡", title: "Complexity", body: "One pass through the string. Each push/pop is O(1). Stack can grow to O(n) in the worst case." },
    ],
    languages: {
      cpp: {
        code: ["bool isValid(string s) {","    stack<char> stk;","    for (char c : s) {","        if (c == '(' || c == '{' || c == '[') {","            stk.push(c);","        } else {","            if (stk.empty()) return false;","            char top = stk.top(); stk.pop();","            if ((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '[')) return false;","        }","    }","    return stk.empty();","}"],
        lineMap: { init: 2, loop: 3, push: 5, pop_match: 8, mismatch: 9, done: 12 },
      },
      java: {
        code: ["public boolean isValid(String s) {","    Stack<Character> stk = new Stack<>();","    for (char c : s.toCharArray()) {","        if (c == '(' || c == '{' || c == '[') {","            stk.push(c);","        } else {","            if (stk.isEmpty()) return false;","            char top = stk.pop();","            if ((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '[')) return false;","        }","    }","    return stk.isEmpty();","}"],
        lineMap: { init: 2, loop: 3, push: 5, pop_match: 8, mismatch: 9, done: 12 },
      },
      javascript: {
        code: ["function isValid(s) {","  const stk = [];","  const map = { ')': '(', '}': '{', ']': '[' };","  for (const c of s) {","    if ('({['.includes(c)) {","      stk.push(c);","    } else {","      if (!stk.length || stk.pop() !== map[c]) return false;","    }","  }","  return stk.length === 0;","}"],
        lineMap: { init: 2, loop: 4, push: 6, pop_match: 8, mismatch: 8, done: 11 },
      },
      python: {
        code: ["def isValid(s):","    stk = []","    pairs = {')': '(', '}': '{', ']': '['}","    for c in s:","        if c in '({[':","            stk.append(c)","        else:","            if not stk or stk.pop() != pairs[c]: return False","    return len(stk) == 0"],
        lineMap: { init: 2, loop: 4, push: 6, pop_match: 8, mismatch: 8, done: 9 },
      },
    },
  },

  "product-except-self": {
    title:           "Product of Array Except Self",
    difficulty:      "Medium",
    category:        "Arrays",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(1)",
    visualizer:      "product",
    description:     "Given an integer array <code>nums</code>, return an array <code>answer</code> such that <code>answer[i]</code> is the product of all elements except <code>nums[i]</code>, without using division.",
    example:         { input: "nums = [1,2,3,4]", output: "[24,12,8,6]", note: "answer[0] = 2×3×4 = 24" },
    defaultInput:    { nums: [1, 2, 3, 4] },
    inputFields:     ["nums"],
    explanation: [
      { emoji: "🤔", title: "No Division Allowed", body: "The obvious approach (total product ÷ nums[i]) fails when zeros exist and is explicitly forbidden." },
      { emoji: "💡", title: "Prefix × Suffix", body: "answer[i] = (product of everything left of i) × (product of everything right of i). Build both in two passes." },
      { emoji: "➡️", title: "Left Pass (Prefix)", body: "Walk left to right, accumulating a running prefix product. Store it in the answer array." },
      { emoji: "⬅️", title: "Right Pass (Suffix)", body: "Walk right to left with a running suffix product. Multiply each answer[i] by the suffix." },
      { emoji: "⚡", title: "Why O(1) Extra Space", body: "The output array doesn't count as extra space. The two running products are just single variables." },
    ],
    languages: {
      cpp: {
        code: ["vector<int> productExceptSelf(vector<int>& nums) {","    int n = nums.size();","    vector<int> answer(n, 1);","    int prefix = 1;","    for (int i = 0; i < n; i++) {","        answer[i] = prefix;","        prefix *= nums[i];","    }","    int suffix = 1;","    for (int i = n - 1; i >= 0; i--) {","        answer[i] *= suffix;","        suffix *= nums[i];","    }","    return answer;","}"],
        lineMap: { init: 3, prefix_loop: 5, prefix_compute: 6, prefix_update: 7, suffix_loop: 10, suffix_compute: 11, suffix_update: 12, done: 14 },
      },
      java: {
        code: ["public int[] productExceptSelf(int[] nums) {","    int n = nums.length;","    int[] answer = new int[n];","    java.util.Arrays.fill(answer, 1);","    int prefix = 1;","    for (int i = 0; i < n; i++) {","        answer[i] = prefix;","        prefix *= nums[i];","    }","    int suffix = 1;","    for (int i = n - 1; i >= 0; i--) {","        answer[i] *= suffix;","        suffix *= nums[i];","    }","    return answer;","}"],
        lineMap: { init: 4, prefix_loop: 6, prefix_compute: 7, prefix_update: 8, suffix_loop: 11, suffix_compute: 12, suffix_update: 13, done: 15 },
      },
      javascript: {
        code: ["function productExceptSelf(nums) {","  const n = nums.length;","  const answer = new Array(n).fill(1);","  let prefix = 1;","  for (let i = 0; i < n; i++) {","    answer[i] = prefix;","    prefix *= nums[i];","  }","  let suffix = 1;","  for (let i = n - 1; i >= 0; i--) {","    answer[i] *= suffix;","    suffix *= nums[i];","  }","  return answer;","}"],
        lineMap: { init: 3, prefix_loop: 5, prefix_compute: 6, prefix_update: 7, suffix_loop: 10, suffix_compute: 11, suffix_update: 12, done: 14 },
      },
      python: {
        code: ["def productExceptSelf(nums):","    n = len(nums)","    answer = [1] * n","    prefix = 1","    for i in range(n):","        answer[i] = prefix","        prefix *= nums[i]","    suffix = 1","    for i in range(n - 1, -1, -1):","        answer[i] *= suffix","        suffix *= nums[i]","    return answer"],
        lineMap: { init: 3, prefix_loop: 5, prefix_compute: 6, prefix_update: 7, suffix_loop: 9, suffix_compute: 10, suffix_update: 11, done: 12 },
      },
    },
  },

  "max-product-subarray": {
    title:           "Maximum Product Subarray",
    difficulty:      "Medium",
    category:        "Dynamic Programming",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(1)",
    visualizer:      "maxproduct",
    description:     "Given an integer array <code>nums</code>, find a contiguous subarray that has the <strong>largest product</strong>, and return the product.",
    example:         { input: "nums = [2,3,-2,4]", output: "6", note: "[2,3] has the largest product 6" },
    defaultInput:    { nums: [2, 3, -2, 4] },
    inputFields:     ["nums"],
    explanation: [
      { emoji: "🤔", title: "Why Not Just Max?", body: "Unlike max subarray sum, negatives complicate things — a negative × negative = positive. We can't just track the running max." },
      { emoji: "💡", title: "Track Max AND Min", body: "At each position, track both the maximum and minimum product ending here. A large negative min can become the new max after a negative number." },
      { emoji: "🔄", title: "Swap on Negative", body: "When nums[i] is negative, swap curMax and curMin before multiplying. This correctly flips the roles." },
      { emoji: "👣", title: "Step by Step", body: "1. curMax = curMin = maxProd = nums[0].\n2. For i=1..n-1: if nums[i]<0 swap curMax,curMin.\n3. curMax = max(nums[i], curMax * nums[i]).\n4. curMin = min(nums[i], curMin * nums[i]).\n5. maxProd = max(maxProd, curMax)." },
      { emoji: "⚡", title: "Why O(1) Space", body: "Only three variables: curMax, curMin, and maxProd. Single pass through the array." },
    ],
    languages: {
      cpp: {
        code: ["int maxProduct(vector<int>& nums) {","    int maxProd = nums[0];","    int curMax = nums[0], curMin = nums[0];","    for (int i = 1; i < nums.size(); i++) {","        if (nums[i] < 0) swap(curMax, curMin);","        curMax = max(nums[i], curMax * nums[i]);","        curMin = min(nums[i], curMin * nums[i]);","        maxProd = max(maxProd, curMax);","    }","    return maxProd;","}"],
        lineMap: { init: 2, init_vars: 3, loop: 4, swap: 5, compute_max: 6, compute_min: 7, update: 8, done: 10 },
      },
      java: {
        code: ["public int maxProduct(int[] nums) {","    int maxProd = nums[0];","    int curMax = nums[0], curMin = nums[0];","    for (int i = 1; i < nums.length; i++) {","        if (nums[i] < 0) { int tmp = curMax; curMax = curMin; curMin = tmp; }","        curMax = Math.max(nums[i], curMax * nums[i]);","        curMin = Math.min(nums[i], curMin * nums[i]);","        maxProd = Math.max(maxProd, curMax);","    }","    return maxProd;","}"],
        lineMap: { init: 2, init_vars: 3, loop: 4, swap: 5, compute_max: 6, compute_min: 7, update: 8, done: 10 },
      },
      javascript: {
        code: ["function maxProduct(nums) {","  let maxProd = nums[0];","  let curMax = nums[0], curMin = nums[0];","  for (let i = 1; i < nums.length; i++) {","    if (nums[i] < 0) [curMax, curMin] = [curMin, curMax];","    curMax = Math.max(nums[i], curMax * nums[i]);","    curMin = Math.min(nums[i], curMin * nums[i]);","    maxProd = Math.max(maxProd, curMax);","  }","  return maxProd;","}"],
        lineMap: { init: 2, init_vars: 3, loop: 4, swap: 5, compute_max: 6, compute_min: 7, update: 8, done: 10 },
      },
      python: {
        code: ["def maxProduct(nums):","    max_prod = nums[0]","    cur_max = cur_min = nums[0]","    for i in range(1, len(nums)):","        if nums[i] < 0:","            cur_max, cur_min = cur_min, cur_max","        cur_max = max(nums[i], cur_max * nums[i])","        cur_min = min(nums[i], cur_min * nums[i])","        max_prod = max(max_prod, cur_max)","    return max_prod"],
        lineMap: { init: 2, init_vars: 3, loop: 4, swap: 6, compute_max: 7, compute_min: 8, update: 9, done: 10 },
      },
    },
  },

  "house-robber": {
    title:           "House Robber",
    difficulty:      "Medium",
    category:        "Dynamic Programming",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(1)",
    visualizer:      "robber",
    description:     "Given an array <code>nums</code> representing money at each house, return the max you can rob without robbing two <strong>adjacent</strong> houses.",
    example:         { input: "nums = [1,2,3,1]", output: "4", note: "Rob house 1 ($1) + house 3 ($3) = $4" },
    defaultInput:    { nums: [1, 2, 3, 1] },
    inputFields:     ["nums"],
    explanation: [
      { emoji: "🤔", title: "The Constraint", body: "You cannot rob two adjacent houses. This means for each house you choose to rob or skip, affecting future options." },
      { emoji: "💡", title: "DP Recurrence", body: "dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Either skip house i (take dp[i-1]) or rob it (dp[i-2] + nums[i])." },
      { emoji: "🗺️", title: "Space Optimization", body: "You only need the last two dp values. Use prev1 and prev2 instead of a full array." },
      { emoji: "👣", title: "Step by Step", body: "1. prev2 = 0, prev1 = 0.\n2. For each house: curr = max(prev1, prev2 + nums[i]).\n3. Slide: prev2 = prev1, prev1 = curr.\n4. Return prev1." },
      { emoji: "⚡", title: "Why O(1) Space", body: "Two sliding variables replace the entire dp array. One pass through all houses." },
    ],
    languages: {
      cpp: {
        code: ["int rob(vector<int>& nums) {","    if (nums.size() == 1) return nums[0];","    int prev2 = 0, prev1 = 0;","    for (int n : nums) {","        int curr = max(prev1, prev2 + n);","        prev2 = prev1;","        prev1 = curr;","    }","    return prev1;","}"],
        lineMap: { base: 2, init: 3, loop: 4, compute: 5, slide: 6, slide_curr: 7, done: 9 },
      },
      java: {
        code: ["public int rob(int[] nums) {","    if (nums.length == 1) return nums[0];","    int prev2 = 0, prev1 = 0;","    for (int n : nums) {","        int curr = Math.max(prev1, prev2 + n);","        prev2 = prev1;","        prev1 = curr;","    }","    return prev1;","}"],
        lineMap: { base: 2, init: 3, loop: 4, compute: 5, slide: 6, slide_curr: 7, done: 9 },
      },
      javascript: {
        code: ["function rob(nums) {","  if (nums.length === 1) return nums[0];","  let prev2 = 0, prev1 = 0;","  for (const n of nums) {","    const curr = Math.max(prev1, prev2 + n);","    prev2 = prev1;","    prev1 = curr;","  }","  return prev1;","}"],
        lineMap: { base: 2, init: 3, loop: 4, compute: 5, slide: 6, slide_curr: 7, done: 9 },
      },
      python: {
        code: ["def rob(nums):","    if len(nums) == 1: return nums[0]","    prev2, prev1 = 0, 0","    for n in nums:","        curr = max(prev1, prev2 + n)","        prev2 = prev1","        prev1 = curr","    return prev1"],
        lineMap: { base: 2, init: 3, loop: 4, compute: 5, slide: 6, slide_curr: 7, done: 8 },
      },
    },
  },

  "missing-number": {
    title:           "Missing Number",
    difficulty:      "Easy",
    category:        "Arrays",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(1)",
    visualizer:      "missing",
    description:     "Given an array <code>nums</code> containing <code>n</code> distinct numbers in the range <code>[0, n]</code>, return the only number in the range that is missing.",
    example:         { input: "nums = [3,0,1]", output: "2", note: "n=3, range is [0,1,2,3], 2 is missing" },
    defaultInput:    { nums: [3, 0, 1] },
    inputFields:     ["nums"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "Sort and scan for the gap — O(n log n). Or use a hash set — O(n) time but O(n) space." },
      { emoji: "💡", title: "Gauss' Formula", body: "The sum of 0..n is n×(n+1)/2. Subtract the actual array sum. The difference is the missing number." },
      { emoji: "🧮", title: "Math in Action", body: "For [3,0,1]: expected = 3×4/2 = 6. Actual = 3+0+1 = 4. Missing = 6−4 = 2." },
      { emoji: "👣", title: "Step by Step", body: "1. Compute expected = n×(n+1)/2.\n2. For each num in array: expected -= num.\n3. Return expected (the remainder)." },
      { emoji: "⚡", title: "Why O(1) Space", body: "Just one variable for the running sum. No extra data structures." },
    ],
    languages: {
      cpp: {
        code: ["int missingNumber(vector<int>& nums) {","    int n = nums.size();","    int expected = n * (n + 1) / 2;","    for (int num : nums) {","        expected -= num;","    }","    return expected;","}"],
        lineMap: { init: 3, loop: 4, subtract: 5, done: 7 },
      },
      java: {
        code: ["public int missingNumber(int[] nums) {","    int n = nums.length;","    int expected = n * (n + 1) / 2;","    for (int num : nums) {","        expected -= num;","    }","    return expected;","}"],
        lineMap: { init: 3, loop: 4, subtract: 5, done: 7 },
      },
      javascript: {
        code: ["function missingNumber(nums) {","  const n = nums.length;","  let expected = n * (n + 1) / 2;","  for (const num of nums) {","    expected -= num;","  }","  return expected;","}"],
        lineMap: { init: 3, loop: 4, subtract: 5, done: 7 },
      },
      python: {
        code: ["def missingNumber(nums):","    n = len(nums)","    expected = n * (n + 1) // 2","    for num in nums:","        expected -= num","    return expected"],
        lineMap: { init: 3, loop: 4, subtract: 5, done: 6 },
      },
    },
  },

  "max-depth-tree": {
    title:           "Maximum Depth of Binary Tree",
    difficulty:      "Easy",
    category:        "Trees",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(h)",
    visualizer:      "treedepth",
    description:     "Given the <code>root</code> of a binary tree, return its <strong>maximum depth</strong> (longest path from root to leaf).",
    example:         { input: "root = [3,9,20,null,null,15,7]", output: "3", note: "Path: 3 → 20 → 15 (or 7)" },
    defaultInput:    { root: [3, 9, 20, null, null, 15, 7] },
    inputFields:     ["root"],
    explanation: [
      { emoji: "🤔", title: "What Is Depth?", body: "The maximum depth is the number of nodes along the longest path from root to the farthest leaf node." },
      { emoji: "💡", title: "Recursive Insight", body: "The depth of a tree = 1 + max(depth of left subtree, depth of right subtree). Base case: null node has depth 0." },
      { emoji: "🌳", title: "DFS Traversal", body: "Recursively compute depth for left and right children. Combine results at each node." },
      { emoji: "👣", title: "Step by Step", body: "1. If root is null → return 0.\n2. left = maxDepth(root.left).\n3. right = maxDepth(root.right).\n4. Return 1 + max(left, right)." },
      { emoji: "⚡", title: "Complexity", body: "O(n) time — visit every node once. O(h) space for the recursion stack where h is the tree height." },
    ],
    languages: {
      cpp: {
        code: ["int maxDepth(TreeNode* root) {","    if (!root) return 0;","    int left = maxDepth(root->left);","    int right = maxDepth(root->right);","    return 1 + max(left, right);","}"],
        lineMap: { visit: 1, base_null: 2, recurse: 3, compute: 5, done: 5 },
      },
      java: {
        code: ["public int maxDepth(TreeNode root) {","    if (root == null) return 0;","    int left = maxDepth(root.left);","    int right = maxDepth(root.right);","    return 1 + Math.max(left, right);","}"],
        lineMap: { visit: 1, base_null: 2, recurse: 3, compute: 5, done: 5 },
      },
      javascript: {
        code: ["function maxDepth(root) {","  if (!root) return 0;","  const left = maxDepth(root.left);","  const right = maxDepth(root.right);","  return 1 + Math.max(left, right);","}"],
        lineMap: { visit: 1, base_null: 2, recurse: 3, compute: 5, done: 5 },
      },
      python: {
        code: ["def maxDepth(root):","    if not root: return 0","    left = maxDepth(root.left)","    right = maxDepth(root.right)","    return 1 + max(left, right)"],
        lineMap: { visit: 1, base_null: 2, recurse: 3, compute: 5, done: 5 },
      },
    },
  },

  "invert-tree": {
    title:           "Invert Binary Tree",
    difficulty:      "Easy",
    category:        "Trees",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(h)",
    visualizer:      "invertree",
    description:     "Given the <code>root</code> of a binary tree, <strong>invert</strong> the tree (mirror it) and return its root.",
    example:         { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]", note: "Left and right subtrees are swapped at every node." },
    defaultInput:    { root: [4, 2, 7, 1, 3, 6, 9] },
    inputFields:     ["root"],
    explanation: [
      { emoji: "🤔", title: "What Is Inverting?", body: "Inverting means mirroring the tree — every node's left child becomes its right child and vice versa, recursively." },
      { emoji: "💡", title: "Recursive Insight", body: "At each node, swap its two children. Then recursively invert both subtrees." },
      { emoji: "🔄", title: "The Swap", body: "Simple pointer swap: tmp = left, left = right, right = tmp. Then recurse on both new children." },
      { emoji: "👣", title: "Step by Step", body: "1. If root is null → return null.\n2. Swap root.left and root.right.\n3. invertTree(root.left).\n4. invertTree(root.right).\n5. Return root." },
      { emoji: "⚡", title: "Complexity", body: "O(n) time — visit every node. O(h) space for recursion stack." },
    ],
    languages: {
      cpp: {
        code: ["TreeNode* invertTree(TreeNode* root) {","    if (!root) return nullptr;","    TreeNode* tmp = root->left;","    root->left = root->right;","    root->right = tmp;","    invertTree(root->left);","    invertTree(root->right);","    return root;","}"],
        lineMap: { visit: 1, base: 2, swap: 3, swap_assign: 4, recurse: 6, done: 8 },
      },
      java: {
        code: ["public TreeNode invertTree(TreeNode root) {","    if (root == null) return null;","    TreeNode tmp = root.left;","    root.left = root.right;","    root.right = tmp;","    invertTree(root.left);","    invertTree(root.right);","    return root;","}"],
        lineMap: { visit: 1, base: 2, swap: 3, swap_assign: 4, recurse: 6, done: 8 },
      },
      javascript: {
        code: ["function invertTree(root) {","  if (!root) return null;","  const tmp = root.left;","  root.left = root.right;","  root.right = tmp;","  invertTree(root.left);","  invertTree(root.right);","  return root;","}"],
        lineMap: { visit: 1, base: 2, swap: 3, swap_assign: 4, recurse: 6, done: 8 },
      },
      python: {
        code: ["def invertTree(root):","    if not root: return None","    root.left, root.right = root.right, root.left","    invertTree(root.left)","    invertTree(root.right)","    return root"],
        lineMap: { visit: 1, base: 2, swap: 3, swap_assign: 3, recurse: 4, done: 6 },
      },
    },
  },

  "same-tree": {
    title:           "Same Tree",
    difficulty:      "Easy",
    category:        "Trees",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(h)",
    visualizer:      "sametree",
    description:     "Given the roots of two binary trees <code>p</code> and <code>q</code>, check if they are <strong>structurally identical</strong> and have the same node values.",
    example:         { input: "p = [1,2,3], q = [1,2,3]", output: "true", note: "Both trees have the same structure and values." },
    defaultInput:    { p: [1, 2, 3], q: [1, 2, 3] },
    inputFields:     ["p", "q"],
    explanation: [
      { emoji: "🤔", title: "What Does Same Mean?", body: "Two trees are the same if they have identical structure and every corresponding node has the same value." },
      { emoji: "💡", title: "Simultaneous DFS", body: "Traverse both trees at the same time. At each step, compare the current nodes." },
      { emoji: "🔍", title: "Base Cases", body: "Both null → same (true). One null, other not → different (false). Values differ → false." },
      { emoji: "👣", title: "Step by Step", body: "1. If both null → true.\n2. If one null → false.\n3. If p.val ≠ q.val → false.\n4. Recurse: isSameTree(p.left, q.left) AND isSameTree(p.right, q.right)." },
      { emoji: "⚡", title: "Complexity", body: "O(n) time where n is the smaller tree's size. O(h) space for recursion." },
    ],
    languages: {
      cpp: {
        code: ["bool isSameTree(TreeNode* p, TreeNode* q) {","    if (!p && !q) return true;","    if (!p || !q) return false;","    if (p->val != q->val) return false;","    return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);","}"],
        lineMap: { both_null: 2, one_null: 3, compare: 4, recurse: 5, done: 5 },
      },
      java: {
        code: ["public boolean isSameTree(TreeNode p, TreeNode q) {","    if (p == null && q == null) return true;","    if (p == null || q == null) return false;","    if (p.val != q.val) return false;","    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);","}"],
        lineMap: { both_null: 2, one_null: 3, compare: 4, recurse: 5, done: 5 },
      },
      javascript: {
        code: ["function isSameTree(p, q) {","  if (!p && !q) return true;","  if (!p || !q) return false;","  if (p.val !== q.val) return false;","  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);","}"],
        lineMap: { both_null: 2, one_null: 3, compare: 4, recurse: 5, done: 5 },
      },
      python: {
        code: ["def isSameTree(p, q):","    if not p and not q: return True","    if not p or not q: return False","    if p.val != q.val: return False","    return isSameTree(p.left, q.left) and isSameTree(p.right, q.right)"],
        lineMap: { both_null: 2, one_null: 3, compare: 4, recurse: 5, done: 5 },
      },
    },
  },

  "reverse-linked-list": {
    title:           "Reverse Linked List",
    difficulty:      "Easy",
    category:        "Linked Lists",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(1)",
    visualizer:      "linkedlist",
    description:     "Given the <code>head</code> of a singly linked list, <strong>reverse</strong> the list, and return the reversed list.",
    example:         { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", note: "Each pointer is reversed." },
    defaultInput:    { head: [1, 2, 3, 4, 5] },
    inputFields:     ["head"],
    explanation: [
      { emoji: "🤔", title: "The Challenge", body: "Each node points forward. We need every node to point backward instead, without losing any references." },
      { emoji: "💡", title: "Three Pointers", body: "Use prev, curr, and next. At each step, save the next node, reverse the pointer, then advance." },
      { emoji: "🔄", title: "The Reversal Step", body: "next = curr.next (save), curr.next = prev (reverse), prev = curr (advance prev), curr = next (advance curr)." },
      { emoji: "👣", title: "Step by Step", body: "1. prev = null, curr = head.\n2. While curr: save next, point curr back to prev, slide both forward.\n3. Return prev (new head)." },
      { emoji: "⚡", title: "Why O(1) Space", body: "Only three pointer variables. No extra data structures. One pass through the list." },
    ],
    languages: {
      cpp: {
        code: ["ListNode* reverseList(ListNode* head) {","    ListNode* prev = nullptr;","    ListNode* curr = head;","    while (curr) {","        ListNode* next = curr->next;","        curr->next = prev;","        prev = curr;","        curr = next;","    }","    return prev;","}"],
        lineMap: { init: 2, init_curr: 3, loop: 4, save_next: 5, reverse_ptr: 6, advance: 7, advance_curr: 8, done: 10 },
      },
      java: {
        code: ["public ListNode reverseList(ListNode head) {","    ListNode prev = null;","    ListNode curr = head;","    while (curr != null) {","        ListNode next = curr.next;","        curr.next = prev;","        prev = curr;","        curr = next;","    }","    return prev;","}"],
        lineMap: { init: 2, init_curr: 3, loop: 4, save_next: 5, reverse_ptr: 6, advance: 7, advance_curr: 8, done: 10 },
      },
      javascript: {
        code: ["function reverseList(head) {","  let prev = null;","  let curr = head;","  while (curr) {","    const next = curr.next;","    curr.next = prev;","    prev = curr;","    curr = next;","  }","  return prev;","}"],
        lineMap: { init: 2, init_curr: 3, loop: 4, save_next: 5, reverse_ptr: 6, advance: 7, advance_curr: 8, done: 10 },
      },
      python: {
        code: ["def reverseList(head):","    prev = None","    curr = head","    while curr:","        nxt = curr.next","        curr.next = prev","        prev = curr","        curr = nxt","    return prev"],
        lineMap: { init: 2, init_curr: 3, loop: 4, save_next: 5, reverse_ptr: 6, advance: 7, advance_curr: 8, done: 9 },
      },
    },
  },

  "three-sum": {
    title:           "3Sum",
    difficulty:      "Medium",
    category:        "Two Pointers",
    timeComplexity:  "O(n²)",
    spaceComplexity: "O(1) or O(log n) for sort",
    visualizer:      "threesum",
    description:     "Given an integer array <code>nums</code>, return all <strong>triplets</strong> [nums[i], nums[j], nums[k]] such that i≠j≠k and nums[i]+nums[j]+nums[k]=0.",
    example:         { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", note: "Sort then two pointers for each fixed i." },
    defaultInput:    { nums: [-1, 0, 1, 2, -1, -4] },
    inputFields:     ["nums"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "Three nested loops → O(n³). Too slow." },
      { emoji: "💡", title: "Sort + Two Pointers", body: "Sort the array. For each index i, use two pointers left (i+1) and right (end) to find pairs that sum to -nums[i]." },
      { emoji: "👣", title: "Step by Step", body: "1. Sort. 2. For i from 0 to n-3: if nums[i] duplicate skip. 3. left=i+1, right=n-1. 4. Sum = nums[i]+nums[left]+nums[right]. If 0 → add triple, move both. If <0 → left++. If >0 → right--." },
      { emoji: "⚡", title: "Why O(n²)", body: "Outer loop O(n), inner two pointers O(n). Skip duplicates to avoid duplicate triples." },
    ],
    languages: {
      cpp:    { code: ["vector<vector<int>> threeSum(vector<int>& nums) {","    sort(nums.begin(), nums.end());","    vector<vector<int>> res;","    for (int i = 0; i < (int)nums.size() - 2; i++) {","        if (i && nums[i] == nums[i-1]) continue;","        int left = i + 1, right = nums.size() - 1;","        while (left < right) {","            int sum = nums[i] + nums[left] + nums[right];","            if (sum == 0) {","                res.push_back({nums[i], nums[left], nums[right]});","                while (left < right && nums[left] == nums[left+1]) left++;","                while (left < right && nums[right] == nums[right-1]) right--;","                left++; right--;","            } else if (sum < 0) left++;","            else right--;","        }","    }","    return res;","}"], lineMap: { sort: 2, fix_i: 4, loop: 7, found: 10, move_left: 12, move_right: 13, done: 15 } },
      java:   { code: ["public List<List<Integer>> threeSum(int[] nums) {","    Arrays.sort(nums);","    List<List<Integer>> res = new ArrayList<>();","    for (int i = 0; i < nums.length - 2; i++) {","        if (i > 0 && nums[i] == nums[i-1]) continue;","        int left = i + 1, right = nums.length - 1;","        while (left < right) {","            int sum = nums[i] + nums[left] + nums[right];","            if (sum == 0) {","                res.add(Arrays.asList(nums[i], nums[left], nums[right]));","                while (left < right && nums[left] == nums[left+1]) left++;","                while (left < right && nums[right] == nums[right-1]) right--;","                left++; right--;","            } else if (sum < 0) left++;","            else right--;","        }","    }","    return res;","}"], lineMap: { sort: 2, fix_i: 4, loop: 7, found: 10, move_left: 12, move_right: 13, done: 15 } },
      javascript: { code: ["function threeSum(nums) {","  nums.sort((a,b) => a - b);","  const res = [];","  for (let i = 0; i < nums.length - 2; i++) {","    if (i > 0 && nums[i] === nums[i-1]) continue;","    let left = i + 1, right = nums.length - 1;","    while (left < right) {","      const sum = nums[i] + nums[left] + nums[right];","      if (sum === 0) {","        res.push([nums[i], nums[left], nums[right]]);","        while (left < right && nums[left] === nums[left+1]) left++;","        while (left < right && nums[right] === nums[right-1]) right--;","        left++; right--;","      } else if (sum < 0) left++;","      else right--;","    }","  }","  return res;","}"], lineMap: { sort: 2, fix_i: 4, loop: 7, found: 10, move_left: 12, move_right: 13, done: 15 } },
      python: { code: ["def threeSum(nums):","    nums.sort()","    res = []","    for i in range(len(nums) - 2):","        if i and nums[i] == nums[i-1]: continue","        left, right = i + 1, len(nums) - 1","        while left < right:","            s = nums[i] + nums[left] + nums[right]","            if s == 0:","                res.append([nums[i], nums[left], nums[right]])","                while left < right and nums[left] == nums[left+1]: left += 1","                while left < right and nums[right] == nums[right-1]: right -= 1","                left += 1","                right -= 1","            elif s < 0: left += 1","            else: right -= 1","    return res"], lineMap: { sort: 2, fix_i: 4, loop: 6, found: 10, move_left: 12, move_right: 13, done: 15 } },
    },
  },

  "container-most-water": {
    title:           "Container With Most Water",
    difficulty:      "Medium",
    category:        "Two Pointers",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(1)",
    visualizer:      "container",
    description:     "You are given an integer array <code>heights</code> of length n. Find two lines that form a container with the x-axis such that the container holds the most water.",
    example:         { input: "heights = [1,8,6,2,5,4,8,3,7]", output: "49", note: "Max area between index 1 and 8." },
    defaultInput:    { heights: [1, 8, 6, 2, 5, 4, 8, 3, 7] },
    inputFields:     ["heights"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "Check every pair (i,j) → O(n²)." },
      { emoji: "💡", title: "Two Pointers", body: "Start left=0, right=n-1. Area = (right-left)*min(h[left], h[right]). Move the shorter pointer inward (only way to possibly get a taller line)." },
      { emoji: "👣", title: "Step by Step", body: "1. left=0, right=n-1, maxArea=0. 2. Compute area, update max. 3. If h[left]<h[right] → left++, else right--. 4. Repeat until left>=right." },
      { emoji: "⚡", title: "Why O(n)", body: "Single pass; one pointer always moves." },
    ],
    languages: {
      cpp:    { code: ["int maxArea(vector<int>& heights) {","    int left = 0, right = heights.size() - 1;","    int maxArea = 0;","    while (left < right) {","        int area = (right - left) * min(heights[left], heights[right]);","        maxArea = max(maxArea, area);","        if (heights[left] < heights[right]) left++;","        else right--;","    }","    return maxArea;","}"], lineMap: { init: 2, loop: 4, update: 6, move_left: 7, move_right: 8, done: 10 } },
      java:   { code: ["public int maxArea(int[] heights) {","    int left = 0, right = heights.length - 1;","    int maxArea = 0;","    while (left < right) {","        int area = (right - left) * Math.min(heights[left], heights[right]);","        maxArea = Math.max(maxArea, area);","        if (heights[left] < heights[right]) left++;","        else right--;","    }","    return maxArea;","}"], lineMap: { init: 2, loop: 4, update: 6, move_left: 7, move_right: 8, done: 10 } },
      javascript: { code: ["function maxArea(heights) {","  let left = 0, right = heights.length - 1;","  let maxArea = 0;","  while (left < right) {","    const area = (right - left) * Math.min(heights[left], heights[right]);","    maxArea = Math.max(maxArea, area);","    if (heights[left] < heights[right]) left++;","    else right--;","  }","  return maxArea;","}"], lineMap: { init: 2, loop: 4, update: 6, move_left: 7, move_right: 8, done: 10 } },
      python: { code: ["def maxArea(heights):","    left, right = 0, len(heights) - 1","    max_area = 0","    while left < right:","        area = (right - left) * min(heights[left], heights[right])","        max_area = max(max_area, area)","        if heights[left] < heights[right]:","            left += 1","        else:","            right -= 1","    return max_area"], lineMap: { init: 2, loop: 4, update: 6, move_left: 7, move_right: 9, done: 10 } },
    },
  },

  "merge-two-sorted-lists": {
    title:           "Merge Two Sorted Lists",
    difficulty:      "Easy",
    category:        "Linked Lists",
    timeComplexity:  "O(n+m)",
    spaceComplexity: "O(1) (if reusing nodes)",
    visualizer:      "mergelists",
    description:     "Merge two sorted linked lists into one sorted list. Return the head of the merged list.",
    example:         { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]", note: "Compare heads, take smaller, advance." },
    defaultInput:    { list1: [1, 2, 4], list2: [1, 3, 4] },
    inputFields:     ["list1", "list2"],
    explanation: [
      { emoji: "💡", title: "Two Pointers", body: "Use two pointers (one per list). Compare current nodes, append the smaller to the result, advance that pointer." },
      { emoji: "👣", title: "Step by Step", body: "1. Dummy head. 2. While both have nodes: if list1.val <= list2.val, attach list1 and advance list1; else attach list2 and advance list2. 3. Attach remaining." },
      { emoji: "⚡", title: "Why O(n+m)", body: "Each node visited once." },
    ],
    languages: {
      cpp:    { code: ["ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {","    ListNode dummy(0);","    ListNode* tail = &dummy;","    while (list1 && list2) {","        if (list1->val <= list2->val) {","            tail->next = list1; list1 = list1->next;","        } else {","            tail->next = list2; list2 = list2->next;","        }","        tail = tail->next;","    }","    tail->next = list1 ? list1 : list2;","    return dummy.next;","}"], lineMap: { init: 2, compare: 4, take1: 5, take2: 7, append1: 11, append2: 11, done: 12 } },
      java:   { code: ["public ListNode mergeTwoLists(ListNode list1, ListNode list2) {","    ListNode dummy = new ListNode(0);","    ListNode tail = dummy;","    while (list1 != null && list2 != null) {","        if (list1.val <= list2.val) {","            tail.next = list1; list1 = list1.next;","        } else {","            tail.next = list2; list2 = list2.next;","        }","        tail = tail.next;","    }","    tail.next = list1 != null ? list1 : list2;","    return dummy.next;","}"], lineMap: { init: 2, compare: 4, take1: 5, take2: 7, append1: 11, append2: 11, done: 12 } },
      javascript: { code: ["function mergeTwoLists(list1, list2) {","  const dummy = new ListNode(0);","  let tail = dummy;","  while (list1 && list2) {","    if (list1.val <= list2.val) {","      tail.next = list1; list1 = list1.next;","    } else {","      tail.next = list2; list2 = list2.next;","    }","    tail = tail.next;","  }","  tail.next = list1 || list2;","  return dummy.next;","}"], lineMap: { init: 2, compare: 4, take1: 5, take2: 7, append1: 11, append2: 11, done: 12 } },
      python: { code: ["def mergeTwoLists(list1, list2):","    dummy = ListNode(0)","    tail = dummy","    while list1 and list2:","        if list1.val <= list2.val:","            tail.next = list1","            list1 = list1.next","        else:","            tail.next = list2","            list2 = list2.next","        tail = tail.next","    tail.next = list1 or list2","    return dummy.next"], lineMap: { init: 2, compare: 4, take1: 6, take2: 9, append1: 12, append2: 12, done: 13 } },
    },
  },

  "merge-intervals": {
    title:           "Merge Intervals",
    difficulty:      "Medium",
    category:        "Intervals",
    timeComplexity:  "O(n log n)",
    spaceComplexity: "O(n)",
    visualizer:      "intervals",
    description:     "Given an array of <code>intervals</code> where intervals[i] = [start_i, end_i], merge all overlapping intervals and return the merged list.",
    example:         { input: "[[1,3],[2,6],[8,10]]", output: "[[1,6],[8,10]]", note: "Sort by start, then merge if overlap." },
    defaultInput:    { intervals: [1, 3, 2, 6, 8, 10] },
    inputFields:     ["intervals"],
    explanation: [
      { emoji: "💡", title: "Sort + Linear Merge", body: "Sort intervals by start. Then traverse: if current overlaps with last merged (start <= last.end), extend last merged; else add new interval." },
      { emoji: "👣", title: "Step by Step", body: "1. Sort by start. 2. merged = [first]. 3. For each next: if next.start <= merged[-1].end → merged[-1].end = max(merged[-1].end, next.end). Else push next." },
      { emoji: "⚡", title: "Why O(n log n)", body: "Sorting O(n log n), one pass O(n)." },
    ],
    languages: {
      cpp:    { code: ["vector<vector<int>> merge(vector<vector<int>>& intervals) {","    sort(intervals.begin(), intervals.end());","    vector<vector<int>> merged;","    for (auto& in : intervals) {","        if (merged.empty() || in[0] > merged.back()[1])","            merged.push_back(in);","        else","            merged.back()[1] = max(merged.back()[1], in[1]);","    }","    return merged;","}"], lineMap: { sort: 2, compare: 4, merge: 6, add: 5, done: 9 } },
      java:   { code: ["public int[][] merge(int[][] intervals) {","    Arrays.sort(intervals, (a,b) -> a[0]-b[0]);","    List<int[]> merged = new ArrayList<>();","    for (int[] in : intervals) {","        if (merged.isEmpty() || in[0] > merged.get(merged.size()-1)[1])","            merged.add(in);","        else","            merged.get(merged.size()-1)[1] = Math.max(merged.get(merged.size()-1)[1], in[1]);","    }","    return merged.toArray(new int[0][]);","}"], lineMap: { sort: 2, compare: 4, merge: 7, add: 5, done: 10 } },
      javascript: { code: ["function merge(intervals) {","  intervals.sort((a,b) => a[0] - b[0]);","  const merged = [];","  for (const in of intervals) {","    if (!merged.length || in[0] > merged[merged.length-1][1])","      merged.push(in);","    else","      merged[merged.length-1][1] = Math.max(merged[merged.length-1][1], in[1]);","  }","  return merged;","}"], lineMap: { sort: 2, compare: 4, merge: 7, add: 5, done: 9 } },
      python: { code: ["def merge(intervals):","    intervals.sort(key=lambda x: x[0])","    merged = []","    for s, e in intervals:","        if not merged or s > merged[-1][1]:","            merged.append([s, e])","        else:","            merged[-1][1] = max(merged[-1][1], e)","    return merged"], lineMap: { sort: 2, compare: 4, merge: 7, add: 5, done: 8 } },
    },
  },

  "linked-list-cycle": {
    title:           "Linked List Cycle",
    difficulty:      "Easy",
    category:        "Linked Lists",
    timeComplexity:  "O(n)",
    spaceComplexity: "O(1)",
    visualizer:      "cycle",
    description:     "Given <code>head</code> of a linked list, determine if it has a cycle. <code>pos</code> is the index where the tail's next points (or -1 for no cycle).",
    example:         { input: "head = [3,2,0,-4], pos = 1", output: "true", note: "Tail connects to index 1." },
    defaultInput:    { head: [3, 2, 0, -4], pos: 1 },
    inputFields:     ["head", "pos"],
    explanation: [
      { emoji: "💡", title: "Tortoise & Hare", body: "Use slow (1 step) and fast (2 steps). If there is a cycle, they will eventually meet. If fast reaches null, no cycle." },
      { emoji: "👣", title: "Step by Step", body: "1. slow = fast = head. 2. While fast and fast.next: slow=slow.next, fast=fast.next.next. 3. If slow==fast → cycle. 4. If fast reaches end → no cycle." },
      { emoji: "⚡", title: "Why O(n)", body: "Within a few cycles slow and fast meet if cycle exists." },
    ],
    languages: {
      cpp:    { code: ["bool hasCycle(ListNode* head) {","    ListNode* slow = head;","    ListNode* fast = head;","    while (fast && fast->next) {","        slow = slow->next;","        fast = fast->next->next;","        if (slow == fast) return true;","    }","    return false;","}"], lineMap: { init: 2, loop: 4, found: 7, done: 9 } },
      java:   { code: ["public boolean hasCycle(ListNode head) {","    ListNode slow = head, fast = head;","    while (fast != null && fast.next != null) {","        slow = slow.next;","        fast = fast.next.next;","        if (slow == fast) return true;","    }","    return false;","}"], lineMap: { init: 2, loop: 4, found: 7, done: 9 } },
      javascript: { code: ["function hasCycle(head) {","  let slow = head, fast = head;","  while (fast && fast.next) {","    slow = slow.next;","    fast = fast.next.next;","    if (slow === fast) return true;","  }","  return false;","}"], lineMap: { init: 2, loop: 4, found: 7, done: 9 } },
      python: { code: ["def hasCycle(head):","    slow = fast = head","    while fast and fast.next:","        slow = slow.next","        fast = fast.next.next","        if slow == fast:","            return True","    return False"], lineMap: { init: 2, loop: 4, found: 7, done: 9 } },
    },
  },

  "number-of-islands": {
    title:           "Number of Islands",
    difficulty:      "Medium",
    category:        "Graphs",
    timeComplexity:  "O(m×n)",
    spaceComplexity: "O(m×n)",
    visualizer:      "grid",
    description:     "Given a 2D grid <code>grid</code> of <code>1</code> (land) and <code>0</code> (water), return the number of islands. An island is formed by connecting adjacent lands horizontally or vertically.",
    example:         { input: "grid = [[1,1,0],[1,1,0],[0,0,1]], rows = 3", output: "2", note: "Two separate islands of connected 1s." },
    defaultInput:    { grid: [1, 1, 0, 1, 1, 0, 0, 0, 1], rows: 3 },
    inputFields:     ["grid", "rows"],
    explanation: [
      { emoji: "🕸️", title: "Graph on a Grid", body: "Treat each cell as a node; adjacent land cells share an edge. Counting islands = counting connected components (DFS/BFS)." },
      { emoji: "💡", title: "The Idea", body: "Scan the grid. When you find unvisited land, run DFS (or BFS) to mark the whole island visited, then increment the island count." },
      { emoji: "👣", title: "Step by Step", body: "1. For each cell (r,c), if grid[r][c]==1 and not visited, islandCount++, DFS(r,c). 2. In DFS: mark (r,c) visited, recurse on 4 neighbors (in bounds, land, unvisited)." },
      { emoji: "⚡", title: "Complexity", body: "Each cell is visited at most once. Time and space O(m×n)." },
    ],
    languages: {
      cpp:    { code: ["int numIslands(vector<vector<char>>& grid) {","    int count = 0;","    for (int r = 0; r < grid.size(); r++)","        for (int c = 0; c < grid[0].size(); c++)","            if (grid[r][c] == '1') {","                count++;","                dfs(grid, r, c);","            }","    return count;","}","void dfs(vector<vector<char>>& g, int r, int c) {","    if (r<0||r>=g.size()||c<0||c>=g[0].size()||g[r][c]!='1') return;","    g[r][c] = '0';","    dfs(g,r+1,c); dfs(g,r-1,c); dfs(g,r,c+1); dfs(g,r,c-1);","}"], lineMap: { init: 2, scan: 4, new_island: 6, dfs: 7, dfs_visit: 12, visit: 12, recurse: 13, done: 9 } },
      java:   { code: ["public int numIslands(char[][] grid) {","    int count = 0;","    for (int r = 0; r < grid.length; r++)","        for (int c = 0; c < grid[0].length; c++)","            if (grid[r][c] == '1') {","                count++;","                dfs(grid, r, c);","            }","    return count;","}","void dfs(char[][] g, int r, int c) {","    if (r<0||r>=g.length||c<0||c>=g[0].length||g[r][c]!='1') return;","    g[r][c] = '0';","    dfs(g,r+1,c); dfs(g,r-1,c); dfs(g,r,c+1); dfs(g,r,c-1);","}"], lineMap: { init: 2, scan: 4, new_island: 6, dfs: 7, dfs_visit: 12, visit: 12, recurse: 13, done: 9 } },
      javascript: { code: ["function numIslands(grid) {","  let count = 0;","  for (let r = 0; r < grid.length; r++)","    for (let c = 0; c < grid[0].length; c++)","      if (grid[r][c] === '1') {","        count++;","        dfs(grid, r, c);","      }","  return count;","}","function dfs(g, r, c) {","  if (r<0||r>=g.length||c<0||c>=g[0].length||g[r][c]!=='1') return;","  g[r][c] = '0';","  dfs(g,r+1,c); dfs(g,r-1,c); dfs(g,r,c+1); dfs(g,r,c-1);","}"], lineMap: { init: 2, scan: 4, new_island: 6, dfs: 7, dfs_visit: 12, visit: 12, recurse: 13, done: 9 } },
      python: { code: ["def num_islands(grid):","    count = 0","    for r in range(len(grid)):","        for c in range(len(grid[0])):","            if grid[r][c] == '1':","                count += 1","                dfs(grid, r, c)","    return count","def dfs(g, r, c):","    if r<0 or r>=len(g) or c<0 or c>=len(g[0]) or g[r][c]!='1': return","    g[r][c] = '0'","    dfs(g,r+1,c); dfs(g,r-1,c); dfs(g,r,c+1); dfs(g,r,c-1)"], lineMap: { init: 2, scan: 4, new_island: 6, dfs: 7, dfs_visit: 12, visit: 12, recurse: 13, done: 8 } },
    },
  },

  "max-area-of-island": {
    title:           "Max Area of Island",
    difficulty:      "Medium",
    category:        "Graphs",
    timeComplexity:  "O(m×n)",
    spaceComplexity: "O(m×n)",
    visualizer:      "grid",
    description:     "Given a 2D grid of <code>1</code> (land) and <code>0</code> (water), return the <strong>maximum area</strong> of an island. Area is the number of cells with value 1 connected 4-directionally.",
    example:         { input: "grid = [[1,1,0],[1,1,0],[0,0,1]], rows = 3", output: "4", note: "Largest island has 4 cells." },
    defaultInput:    { grid: [1, 1, 0, 1, 1, 0, 0, 0, 1], rows: 3 },
    inputFields:     ["grid", "rows"],
    explanation: [
      { emoji: "🕸️", title: "Same Grid, Different Question", body: "Again treat the grid as a graph. For each island (DFS/BFS), count its size and track the maximum." },
      { emoji: "💡", title: "The Idea", body: "For each unvisited land cell, run DFS that returns the area of that island. Update maxArea = max(maxArea, area)." },
      { emoji: "👣", title: "Step by Step", body: "1. For each (r,c) with land and not visited, area = dfs(r,c). 2. dfs returns 1 + sum of dfs on valid neighbors. 3. maxArea = max(maxArea, area)." },
      { emoji: "⚡", title: "Complexity", body: "Each cell visited at most once. O(m×n) time and space." },
    ],
    languages: {
      cpp:    { code: ["int maxAreaOfIsland(vector<vector<int>>& grid) {","    int maxArea = 0;","    for (int r = 0; r < grid.size(); r++)","        for (int c = 0; c < grid[0].size(); c++)","            if (grid[r][c] == 1)","                maxArea = max(maxArea, dfs(grid, r, c));","    return maxArea;","}","int dfs(vector<vector<int>>& g, int r, int c) {","    if (r<0||r>=g.size()||c<0||c>=g[0].size()||g[r][c]!=1) return 0;","    g[r][c] = 0;","    return 1 + dfs(g,r+1,c)+dfs(g,r-1,c)+dfs(g,r,c+1)+dfs(g,r,c-1);","}"], lineMap: { init: 2, scan: 4, dfs: 6, dfs_visit: 11, update_max: 6, visit: 11, recurse: 12, done: 7 } },
      java:   { code: ["public int maxAreaOfIsland(int[][] grid) {","    int maxArea = 0;","    for (int r = 0; r < grid.length; r++)","        for (int c = 0; c < grid[0].length; c++)","            if (grid[r][c] == 1)","                maxArea = Math.max(maxArea, dfs(grid, r, c));","    return maxArea;","}","int dfs(int[][] g, int r, int c) {","    if (r<0||r>=g.length||c<0||c>=g[0].length||g[r][c]!=1) return 0;","    g[r][c] = 0;","    return 1 + dfs(g,r+1,c)+dfs(g,r-1,c)+dfs(g,r,c+1)+dfs(g,r,c-1);","}"], lineMap: { init: 2, scan: 4, dfs: 6, dfs_visit: 11, update_max: 6, visit: 11, recurse: 12, done: 7 } },
      javascript: { code: ["function maxAreaOfIsland(grid) {","  let maxArea = 0;","  for (let r = 0; r < grid.length; r++)","    for (let c = 0; c < grid[0].length; c++)","      if (grid[r][c] === 1)","        maxArea = Math.max(maxArea, dfs(grid, r, c));","  return maxArea;","}","function dfs(g, r, c) {","  if (r<0||r>=g.length||c<0||c>=g[0].length||g[r][c]!==1) return 0;","  g[r][c] = 0;","  return 1 + dfs(g,r+1,c)+dfs(g,r-1,c)+dfs(g,r,c+1)+dfs(g,r,c-1);","}"], lineMap: { init: 2, scan: 4, dfs: 6, dfs_visit: 11, update_max: 6, visit: 11, recurse: 12, done: 7 } },
      python: { code: ["def max_area_of_island(grid):","    max_area = 0","    for r in range(len(grid)):","        for c in range(len(grid[0])):","            if grid[r][c] == 1:","                max_area = max(max_area, dfs(grid, r, c))","    return max_area","def dfs(g, r, c):","    if r<0 or r>=len(g) or c<0 or c>=len(g[0]) or g[r][c]!=1: return 0","    g[r][c] = 0","    return 1 + dfs(g,r+1,c)+dfs(g,r-1,c)+dfs(g,r,c+1)+dfs(g,r,c-1)"], lineMap: { init: 2, scan: 4, dfs: 6, dfs_visit: 11, update_max: 6, visit: 11, recurse: 12, done: 7 } },
    },
  },

  "min-rotated-sorted": { title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search", timeComplexity: "O(log n)", spaceComplexity: "O(1)", visualizer: "array", description: "Given a sorted rotated array <code>nums</code> of unique elements, return the minimum element.", example: { input: "nums = [3,4,5,1,2]", output: "1", note: "Minimum is 1." }, defaultInput: { nums: [3, 4, 5, 1, 2] }, inputFields: ["nums"], explanation: [{ emoji: "🔍", title: "Binary Search", body: "The minimum is where the pivot is. Compare mid with the right: if nums[mid] > nums[r], search right; else search left." }], languages: { cpp: { code: ["int findMin(vector<int>& nums) {","    int l = 0, r = nums.size() - 1;","    while (l < r) {","        int m = l + (r - l) / 2;","        if (nums[m] > nums[r]) l = m + 1;","        else r = m;","    }","    return nums[l];","}"], lineMap: { init: 1, done: 8 } }, java: { code: ["public int findMin(int[] nums) {","    int l = 0, r = nums.length - 1;","    while (l < r) { int m = l + (r-l)/2;","        if (nums[m] > nums[r]) l = m + 1;","        else r = m;","    }","    return nums[l];","}"], lineMap: { init: 1, done: 7 } }, javascript: { code: ["function findMin(nums) {","  let l = 0, r = nums.length - 1;","  while (l < r) { const m = (l+r)>>1;","    if (nums[m] > nums[r]) l = m + 1;","    else r = m;","  }","  return nums[l];","}"], lineMap: { init: 1, done: 7 } }, python: { code: ["def find_min(nums):","    l, r = 0, len(nums)-1","    while l < r:","        m = (l+r)//2","        if nums[m] > nums[r]: l = m+1","        else: r = m","    return nums[l]"], lineMap: { init: 1, done: 7 } } } },
  "search-rotated-sorted": { title: "Search in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search", timeComplexity: "O(log n)", spaceComplexity: "O(1)", visualizer: "binsearch", description: "Given a rotated sorted array and <code>target</code>, return its index or -1.", example: { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4", note: "Target 0 is at index 4." }, defaultInput: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 }, inputFields: ["nums", "target"], explanation: [{ emoji: "🔍", title: "Binary Search", body: "Find which half is sorted; if target is in that range, search there; else the other half." }], languages: { cpp: { code: ["int search(vector<int>& nums, int target) {","    int l = 0, r = nums.size() - 1;","    while (l <= r) {","        int m = l + (r-l)/2;","        if (nums[m] == target) return m;","        if (nums[l] <= nums[m]) {","            if (target >= nums[l] && target < nums[m]) r = m - 1;","            else l = m + 1;","        } else {","            if (target > nums[m] && target <= nums[r]) l = m + 1;","            else r = m - 1;","        }","    }","    return -1;","}"], lineMap: { init: 2, loop: 3, calc_mid: 4, found: 5, go_left: 7, go_right: 8, done: 14 } }, java: { code: ["public int search(int[] nums, int target) {","    int l = 0, r = nums.length - 1;","    while (l <= r) { int m = (l+r)/2;","        if (nums[m] == target) return m;","        if (nums[l] <= nums[m]) {","            if (target >= nums[l] && target < nums[m]) r = m - 1;","            else l = m + 1;","        } else {","            if (target > nums[m] && target <= nums[r]) l = m + 1;","            else r = m - 1;","        }","    }","    return -1;","}"], lineMap: { init: 2, loop: 3, calc_mid: 3, found: 4, go_left: 6, go_right: 7, done: 13 } }, javascript: { code: ["function search(nums, target) {","  let l = 0, r = nums.length - 1;","  while (l <= r) { const m = (l+r)>>1;","    if (nums[m] === target) return m;","    if (nums[l] <= nums[m]) {","      if (target >= nums[l] && target < nums[m]) r = m - 1;","      else l = m + 1;","    } else {","      if (target > nums[m] && target <= nums[r]) l = m + 1;","      else r = m - 1;","    }","  }","  return -1;","}"], lineMap: { init: 2, loop: 3, calc_mid: 3, found: 4, go_left: 6, go_right: 7, done: 13 } }, python: { code: ["def search(nums, target):","    l, r = 0, len(nums)-1","    while l <= r:","        m = (l+r)//2","        if nums[m] == target: return m","        if nums[l] <= nums[m]:","            if nums[l] <= target < nums[m]: r = m-1","            else: l = m+1","        else:","            if nums[m] < target <= nums[r]: l = m+1","            else: r = m-1","    return -1"], lineMap: { init: 2, loop: 3, calc_mid: 4, found: 5, go_left: 7, go_right: 8, done: 12 } } } },
  "sum-two-integers": { title: "Sum of Two Integers", difficulty: "Medium", category: "Bit Manipulation", timeComplexity: "O(1)", spaceComplexity: "O(1)", visualizer: "sumtwo", description: "Calculate <code>a + b</code> without using + or - operator (use bit manipulation).", example: { input: "a = 1, b = 2", output: "3", note: "Use XOR for sum, AND for carry." }, defaultInput: { nums: [1, 2] }, inputFields: ["nums"], explanation: [{ emoji: "⚙️", title: "XOR & AND", body: "a ^ b gives sum without carry; (a & b) << 1 gives carry. Repeat until carry is 0." }], languages: { cpp: { code: ["int getSum(int a, int b) {","    while (b != 0) {","        int carry = (a & b) << 1;","        a = a ^ b;","        b = carry;","    }","    return a;","}"], lineMap: { init: 1, loop_check: 2, carry: 3, xor: 4, assign_b: 5, done: 7 } }, java: { code: ["public int getSum(int a, int b) {","    while (b != 0) {","        int carry = (a & b) << 1;","        a = a ^ b;","        b = carry;","    }","    return a;","}"], lineMap: { init: 1, loop_check: 2, carry: 3, xor: 4, assign_b: 5, done: 7 } }, javascript: { code: ["function getSum(a, b) {","  while (b !== 0) {","    const carry = (a & b) << 1;","    a = a ^ b;","    b = carry;","  }","  return a;","}"], lineMap: { init: 1, loop_check: 2, carry: 3, xor: 4, assign_b: 5, done: 7 } }, python: { code: ["def get_sum(a, b):","    mask = 0xFFFFFFFF","    while b & mask:","        carry = (a & b) << 1","        a, b = a ^ b, carry","    return a & mask if b > 0 else a"], lineMap: { init: 1, loop_check: 3, carry: 4, xor: 5, assign_b: 5, done: 6 } } } },
  "number-of-1-bits": { title: "Number of 1 Bits", difficulty: "Easy", category: "Bit Manipulation", timeComplexity: "O(1)", spaceComplexity: "O(1)", visualizer: "onebits", description: "Return the number of set bits (Hamming weight) in a 32-bit integer.", example: { input: "n = 11 (binary 1011)", output: "3", note: "Three 1s." }, defaultInput: { nums: [11] }, inputFields: ["nums"], explanation: [{ emoji: "⚙️", title: "n & (n-1)", body: "n & (n-1) clears the lowest set bit. Count until n is 0." }], languages: { cpp: { code: ["int hammingWeight(uint32_t n) {","    int count = 0;","    while (n) { n &= n - 1; count++; }","    return count;","}"], lineMap: { init: 2, loop_check: 3, body: 3, done: 4 } }, java: { code: ["public int hammingWeight(int n) {","    int count = 0;","    while (n != 0) { n &= n - 1; count++; }","    return count;","}"], lineMap: { init: 2, loop_check: 3, body: 3, done: 4 } }, javascript: { code: ["function hammingWeight(n) {","  let count = 0;","  while (n) { n &= n - 1; count++; }","  return count;","}"], lineMap: { init: 2, loop_check: 3, body: 3, done: 4 } }, python: { code: ["def hamming_weight(n):","    count = 0","    while n: n &= n - 1; count += 1","    return count"], lineMap: { init: 2, loop_check: 3, body: 3, done: 4 } } } },
  "counting-bits": { title: "Counting Bits", difficulty: "Easy", category: "Bit Manipulation", timeComplexity: "O(n)", spaceComplexity: "O(n)", visualizer: "array", description: "Return an array of length <code>n+1</code> where ans[i] is the number of 1s in binary representation of i.", example: { input: "n = 2", output: "[0,1,1]", note: "0→0, 1→1, 2→10." }, defaultInput: { n: 2 }, inputFields: ["n"], explanation: [{ emoji: "⚙️", title: "DP", body: "ans[i] = ans[i >> 1] + (i & 1)." }], languages: { cpp: { code: ["vector<int> countBits(int n) {","    vector<int> ans(n+1);","    for (int i = 1; i <= n; i++)","        ans[i] = ans[i >> 1] + (i & 1);","    return ans;","}"], lineMap: { init: 2, loop: 3, body: 4, done: 5 } }, java: { code: ["public int[] countBits(int n) {","    int[] ans = new int[n+1];","    for (int i = 1; i <= n; i++)","        ans[i] = ans[i >> 1] + (i & 1);","    return ans;","}"], lineMap: { init: 2, loop: 3, body: 4, done: 5 } }, javascript: { code: ["function countBits(n) {","  const ans = Array(n+1).fill(0);","  for (let i = 1; i <= n; i++) ans[i] = ans[i>>1] + (i & 1);","  return ans;","}"], lineMap: { init: 2, loop: 3, body: 3, done: 4 } }, python: { code: ["def count_bits(n):","    ans = [0] * (n+1)","    for i in range(1, n+1): ans[i] = ans[i>>1] + (i & 1)","    return ans"], lineMap: { init: 2, loop: 3, body: 3, done: 4 } } } },
  "reverse-bits": { title: "Reverse Bits", difficulty: "Easy", category: "Bit Manipulation", timeComplexity: "O(1)", spaceComplexity: "O(1)", visualizer: "reversebits", description: "Reverse the bits of a 32-bit unsigned integer.", example: { input: "n = 00000010100101000001111010011100", output: "964176192", note: "Reversed bits." }, defaultInput: { nums: [43261596] }, inputFields: ["nums"], explanation: [{ emoji: "⚙️", title: "Bit by bit", body: "Extract LSB with n & 1, add to result, shift n right and result left." }], languages: { cpp: { code: ["uint32_t reverseBits(uint32_t n) {","    uint32_t res = 0;","    for (int i = 0; i < 32; i++) {","        res = (res << 1) | (n & 1);","        n >>= 1;","    }","    return res;","}"], lineMap: { init: 2, loop: 3, body: 4, done: 7 } }, java: { code: ["public int reverseBits(int n) {","    int res = 0;","    for (int i = 0; i < 32; i++) {","        res = (res << 1) | (n & 1);","        n >>>= 1;","    }","    return res;","}"], lineMap: { init: 2, loop: 3, body: 4, done: 7 } }, javascript: { code: ["function reverseBits(n) {","  let res = 0;","  for (let i = 0; i < 32; i++) {","    res = (res << 1) | (n & 1);","    n >>>= 1;","  }","  return res >>> 0;","}"], lineMap: { init: 2, loop: 3, body: 4, done: 6 } }, python: { code: ["def reverse_bits(n):","    res = 0","    for _ in range(32):","        res = (res << 1) | (n & 1)","        n >>= 1","    return res"], lineMap: { init: 2, loop: 3, body: 4, done: 6 } } } },
  "coin-change": { title: "Coin Change", difficulty: "Medium", category: "Dynamic Programming", timeComplexity: "O(amount × coins)", spaceComplexity: "O(amount)", visualizer: "array", description: "Given <code>coins</code> and <code>amount</code>, return the fewest number of coins needed to make amount, or -1.", example: { input: "coins = [1,2,5], amount = 11", output: "3", note: "5+5+1 = 11." }, defaultInput: { nums: [1, 2, 5], amount: 11 }, inputFields: ["nums", "amount"], explanation: [{ emoji: "🧩", title: "DP", body: "dp[i] = min coins for amount i. dp[i] = 1 + min(dp[i-c]) over coins c." }], languages: { cpp: { code: ["int coinChange(vector<int>& coins, int amount) {","    vector<int> dp(amount+1, amount+1);","    dp[0] = 0;","    for (int i = 1; i <= amount; i++)","        for (int c : coins)","            if (c <= i) dp[i] = min(dp[i], 1 + dp[i-c]);","    return dp[amount] > amount ? -1 : dp[amount];","}"], lineMap: { init: 1, done: 7 } }, java: { code: ["public int coinChange(int[] coins, int amount) {","    int[] dp = new int[amount+1];","    Arrays.fill(dp, amount+1); dp[0] = 0;","    for (int i = 1; i <= amount; i++)","        for (int c : coins)","            if (c <= i) dp[i] = Math.min(dp[i], 1 + dp[i-c]);","    return dp[amount] > amount ? -1 : dp[amount];","}"], lineMap: { init: 1, done: 8 } }, javascript: { code: ["function coinChange(coins, amount) {","  const dp = Array(amount+1).fill(amount+1);","  dp[0] = 0;","  for (let i = 1; i <= amount; i++)","    for (const c of coins)","      if (c <= i) dp[i] = Math.min(dp[i], 1 + dp[i-c]);","  return dp[amount] > amount ? -1 : dp[amount];","}"], lineMap: { init: 1, done: 7 } }, python: { code: ["def coin_change(coins, amount):","    dp = [amount+1] * (amount+1); dp[0] = 0","    for i in range(1, amount+1):","        for c in coins:","            if c <= i: dp[i] = min(dp[i], 1 + dp[i-c])","    return -1 if dp[amount] > amount else dp[amount]"], lineMap: { init: 1, done: 6 } } } },
  "longest-increasing-subsequence": { title: "Longest Increasing Subsequence", difficulty: "Medium", category: "Dynamic Programming", timeComplexity: "O(n log n)", spaceComplexity: "O(n)", visualizer: "array", description: "Return the length of the longest strictly increasing subsequence of <code>nums</code>.", example: { input: "nums = [10,9,2,5,3,7,101,18]", output: "4", note: "e.g. [2,3,7,101]." }, defaultInput: { nums: [10, 9, 2, 5, 3, 7, 101, 18] }, inputFields: ["nums"], explanation: [{ emoji: "🧩", title: "Patience / Binary Search", body: "Maintain smallest tail for each length; binary search to extend or start new." }], languages: { cpp: { code: ["int lengthOfLIS(vector<int>& nums) {","    vector<int> tails;","    for (int x : nums) {","        auto it = lower_bound(tails.begin(), tails.end(), x);","        if (it == tails.end()) tails.push_back(x);","        else *it = x;","    }","    return tails.size();","}"], lineMap: { init: 1, done: 8 } }, java: { code: ["public int lengthOfLIS(int[] nums) {","    List<Integer> tails = new ArrayList<>();","    for (int x : nums) {","        int i = Collections.binarySearch(tails, x);","        if (i < 0) i = -i - 1;","        if (i == tails.size()) tails.add(x);","        else tails.set(i, x);","    }","    return tails.size();","}"], lineMap: { init: 1, done: 10 } }, javascript: { code: ["function lengthOfLIS(nums) {","  const tails = [];","  for (const x of nums) {","    let l = 0, r = tails.length;","    while (l < r) { const m = (l+r)>>1; if (tails[m] < x) l = m+1; else r = m; }","    if (l === tails.length) tails.push(x); else tails[l] = x;","  }","  return tails.length;","}"], lineMap: { init: 1, done: 7 } }, python: { code: ["def length_of_lis(nums):","    tails = []","    for x in nums:","        i = bisect.bisect_left(tails, x)","        if i == len(tails): tails.append(x)","        else: tails[i] = x","    return len(tails)"], lineMap: { init: 1, done: 7 } } } },
  "longest-common-subsequence": { title: "Longest Common Subsequence", difficulty: "Medium", category: "Dynamic Programming", timeComplexity: "O(m×n)", spaceComplexity: "O(m×n)", visualizer: "array", description: "Given two strings <code>text1</code> and <code>text2</code>, return the length of their longest common subsequence.", example: { input: "text1 = \"abcde\", text2 = \"ace\"", output: "3", note: "LCS \"ace\"." }, defaultInput: { s: "abcde", t: "ace" }, inputFields: ["s", "t"], explanation: [{ emoji: "🧩", title: "Classic DP", body: "dp[i][j] = LCS of text1[0..i] and text2[0..j]. If match, 1+dp[i-1][j-1]; else max(dp[i-1][j], dp[i][j-1])." }], languages: { cpp: { code: ["int longestCommonSubsequence(string t1, string t2) {","    int m = t1.size(), n = t2.size();","    vector<vector<int>> dp(m+1, vector<int>(n+1));","    for (int i = 1; i <= m; i++)","        for (int j = 1; j <= n; j++)","            dp[i][j] = t1[i-1]==t2[j-1] ? 1+dp[i-1][j-1] : max(dp[i-1][j], dp[i][j-1]);","    return dp[m][n];","}"], lineMap: { init: 1, done: 7 } }, java: { code: ["public int longestCommonSubsequence(String t1, String t2) {","    int m = t1.length(), n = t2.length();","    int[][] dp = new int[m+1][n+1];","    for (int i = 1; i <= m; i++)","        for (int j = 1; j <= n; j++)","            dp[i][j] = t1.charAt(i-1)==t2.charAt(j-1) ? 1+dp[i-1][j-1] : Math.max(dp[i-1][j], dp[i][j-1]);","    return dp[m][n];","}"], lineMap: { init: 1, done: 7 } }, javascript: { code: ["function longestCommonSubsequence(t1, t2) {","  const m = t1.length, n = t2.length;","  const dp = Array(m+1).fill(0).map(() => Array(n+1).fill(0));","  for (let i = 1; i <= m; i++)","    for (let j = 1; j <= n; j++)","      dp[i][j] = t1[i-1]===t2[j-1] ? 1+dp[i-1][j-1] : Math.max(dp[i-1][j], dp[i][j-1]);","  return dp[m][n];","}"], lineMap: { init: 1, done: 7 } }, python: { code: ["def longest_common_subsequence(t1, t2):","    m, n = len(t1), len(t2)","    dp = [[0]*(n+1) for _ in range(m+1)]","    for i in range(1, m+1):","        for j in range(1, n+1):","            dp[i][j] = 1+dp[i-1][j-1] if t1[i-1]==t2[j-1] else max(dp[i-1][j], dp[i][j-1])","    return dp[m][n]"], lineMap: { init: 1, done: 7 } } } },
  "word-break": { title: "Word Break", difficulty: "Medium", category: "Dynamic Programming", timeComplexity: "O(n² × m)", spaceComplexity: "O(n)", visualizer: "array", description: "Given string <code>s</code> and dictionary <code>wordDict</code>, return true if s can be segmented into words.", example: { input: "s = \"leetcode\", wordDict = [\"leet\",\"code\"]", output: "true", note: "leet + code." }, defaultInput: { s: "leetcode", dict: "leet,code" }, inputFields: ["s", "dict"], explanation: [{ emoji: "🧩", title: "DP", body: "dp[i] = can we form s[0..i]? For each i, check if s[j..i] is in dict and dp[j]." }], languages: { cpp: { code: ["bool wordBreak(string s, vector<string>& wordDict) {","    unordered_set<string> set(wordDict.begin(), wordDict.end());","    vector<bool> dp(s.size()+1); dp[0] = true;","    for (int i = 1; i <= s.size(); i++)","        for (int j = 0; j < i; j++)","            if (dp[j] && set.count(s.substr(j, i-j))) { dp[i] = true; break; }","    return dp[s.size()];","}"], lineMap: { init: 1, done: 7 } }, java: { code: ["public boolean wordBreak(String s, List<String> wordDict) {","    Set<String> set = new HashSet<>(wordDict);","    boolean[] dp = new boolean[s.length()+1]; dp[0] = true;","    for (int i = 1; i <= s.length(); i++)","        for (int j = 0; j < i; j++)","            if (dp[j] && set.contains(s.substring(j,i))) { dp[i] = true; break; }","    return dp[s.length()];","}"], lineMap: { init: 1, done: 8 } }, javascript: { code: ["function wordBreak(s, wordDict) {","  const set = new Set(wordDict);","  const dp = Array(s.length+1).fill(false); dp[0] = true;","  for (let i = 1; i <= s.length; i++)","    for (let j = 0; j < i; j++)","      if (dp[j] && set.has(s.slice(j,i))) { dp[i] = true; break; }","  return dp[s.length];","}"], lineMap: { init: 1, done: 7 } }, python: { code: ["def word_break(s, word_dict):","    d = set(word_dict)","    dp = [False] * (len(s)+1); dp[0] = True","    for i in range(1, len(s)+1):","        for j in range(i):","            if dp[j] and s[j:i] in d: dp[i] = True; break","    return dp[len(s)]"], lineMap: { init: 1, done: 7 } } } },
  "combination-sum": { title: "Combination Sum", difficulty: "Medium", category: "Dynamic Programming", timeComplexity: "O(2^target)", spaceComplexity: "O(target)", visualizer: "array", description: "Given <code>candidates</code> and <code>target</code>, return all unique combinations where numbers sum to target (same number reusable).", example: { input: "candidates = [2,3,6,7], target = 7", output: "[[2,2,3],[7]]", note: "Backtrack." }, defaultInput: { nums: [2, 3, 6, 7], target: 7 }, inputFields: ["nums", "target"], explanation: [{ emoji: "🔙", title: "Backtracking", body: "Try each candidate; recurse with target - c; backtrack." }], languages: { cpp: { code: ["void backtrack(vector<int>& c, int t, int start, vector<int>& path, vector<vector<int>>& res) {","    if (t == 0) { res.push_back(path); return; }","    if (t < 0) return;","    for (int i = start; i < c.size(); i++) {","        path.push_back(c[i]);","        backtrack(c, t - c[i], i, path, res);","        path.pop_back();","    }","}","vector<vector<int>> combinationSum(vector<int>& c, int t) {","    vector<vector<int>> res; vector<int> path;","    backtrack(c, t, 0, path, res);","    return res;","}"], lineMap: { init: 1, done: 11 } }, java: { code: ["void backtrack(int[] c, int t, int start, List<Integer> path, List<List<Integer>> res) {","    if (t == 0) { res.add(new ArrayList<>(path)); return; }","    if (t < 0) return;","    for (int i = start; i < c.length; i++) {","        path.add(c[i]); backtrack(c, t-c[i], i, path, res); path.remove(path.size()-1);","    }","}","public List<List<Integer>> combinationSum(int[] c, int t) {","    List<List<Integer>> res = new ArrayList<>();","    backtrack(c, t, 0, new ArrayList<>(), res);","    return res;","}"], lineMap: { init: 1, done: 9 } }, javascript: { code: ["function backtrack(c, t, start, path, res) {","  if (t === 0) { res.push([...path]); return; }","  if (t < 0) return;","  for (let i = start; i < c.length; i++) {","    path.push(c[i]); backtrack(c, t-c[i], i, path, res); path.pop();","  }","}","function combinationSum(c, t) {","  const res = [];","  backtrack(c, t, 0, [], res);","  return res;","}"], lineMap: { init: 1, done: 9 } }, python: { code: ["def backtrack(c, t, start, path, res):","    if t == 0: res.append(path[:]); return","    if t < 0: return","    for i in range(start, len(c)):","        path.append(c[i]); backtrack(c, t-c[i], i, path, res); path.pop()","def combination_sum(c, t):","    res = []; backtrack(c, t, 0, [], res)","    return res"], lineMap: { init: 1, done: 7 } } } },
  "house-robber-ii": { title: "House Robber II", difficulty: "Medium", category: "Dynamic Programming", timeComplexity: "O(n)", spaceComplexity: "O(1)", visualizer: "array", description: "Same as House Robber but houses are in a circle (first and last adjacent).", example: { input: "nums = [2,3,2]", output: "3", note: "Rob index 1." }, defaultInput: { nums: [2, 3, 2] }, inputFields: ["nums"], explanation: [{ emoji: "🧩", title: "Two passes", body: "Run robber once excluding first, once excluding last; return max." }], languages: { cpp: { code: ["int robRange(vector<int>& nums, int l, int r) {","    int prev = 0, curr = 0;","    for (int i = l; i <= r; i++)","        curr = max(prev + nums[i], prev = exchange(curr, prev));","    return curr;","}","int rob(vector<int>& nums) {","    if (nums.size() == 1) return nums[0];","    return max(robRange(nums, 0, nums.size()-2), robRange(nums, 1, nums.size()-1));","}"], lineMap: { init: 1, done: 7 } }, java: { code: ["int robRange(int[] nums, int l, int r) {","    int prev = 0, curr = 0;","    for (int i = l; i <= r; i++) { int t = curr; curr = Math.max(prev+nums[i], curr); prev = t; }","    return curr;","}","public int rob(int[] nums) {","    if (nums.length == 1) return nums[0];","    return Math.max(robRange(nums,0,nums.length-2), robRange(nums,1,nums.length-1));","}"], lineMap: { init: 1, done: 7 } }, javascript: { code: ["function robRange(nums, l, r) {","  let prev = 0, curr = 0;","  for (let i = l; i <= r; i++)","    [prev, curr] = [curr, Math.max(prev+nums[i], curr)];","  return curr;","}","function rob(nums) {","  if (nums.length === 1) return nums[0];","  return Math.max(robRange(nums,0,nums.length-2), robRange(nums,1,nums.length-1));","}"], lineMap: { init: 1, done: 7 } }, python: { code: ["def rob_range(nums, l, r):","    prev, curr = 0, 0","    for i in range(l, r+1):","        prev, curr = curr, max(prev+nums[i], curr)","    return curr","def rob(nums):","    if len(nums)==1: return nums[0]","    return max(rob_range(nums,0,len(nums)-2), rob_range(nums,1,len(nums)-1))"], lineMap: { init: 1, done: 6 } } } },
  "decode-ways": { title: "Decode Ways", difficulty: "Medium", category: "Dynamic Programming", timeComplexity: "O(n)", spaceComplexity: "O(n)", visualizer: "decodeways", description: "A message with letters A-Z is encoded as 1-26. Return number of ways to decode <code>s</code>.", example: { input: "s = \"12\"", output: "2", note: "\"1\"+\"2\" or \"12\"." }, defaultInput: { s: "12" }, inputFields: ["s"], explanation: [{ emoji: "🧩", title: "DP", body: "dp[i] = ways to decode s[0..i]. One digit or two digits (10-26)." }], languages: { cpp: { code: ["int numDecodings(string s) {","    int n = s.size();","    vector<int> dp(n+1); dp[0] = 1;","    for (int i = 1; i <= n; i++) {","        if (s[i-1] != '0') dp[i] += dp[i-1];","        if (i>=2 && stoi(s.substr(i-2,2)) >= 10 && stoi(s.substr(i-2,2)) <= 26) dp[i] += dp[i-2];","    }","    return dp[n];","}"], lineMap: { init: 1, done: 7 } }, java: { code: ["public int numDecodings(String s) {","    int n = s.length(); int[] dp = new int[n+1]; dp[0] = 1;","    for (int i = 1; i <= n; i++) {","        if (s.charAt(i-1) != '0') dp[i] += dp[i-1];","        if (i>=2) { int two = Integer.parseInt(s.substring(i-2,i)); if (two>=10 && two<=26) dp[i] += dp[i-2]; }","    }","    return dp[n];","}"], lineMap: { init: 1, done: 7 } }, javascript: { code: ["function numDecodings(s) {","  const n = s.length; const dp = Array(n+1).fill(0); dp[0] = 1;","  for (let i = 1; i <= n; i++) {","    if (s[i-1] !== '0') dp[i] += dp[i-1];","    if (i>=2) { const two = +s.slice(i-2,i); if (two>=10 && two<=26) dp[i] += dp[i-2]; }","  }","  return dp[n];","}"], lineMap: { init: 1, done: 7 } }, python: { code: ["def num_decodings(s):","    n = len(s); dp = [0]*(n+1); dp[0] = 1","    for i in range(1, n+1):","        if s[i-1] != '0': dp[i] += dp[i-1]","        if i>=2 and 10<=int(s[i-2:i])<=26: dp[i] += dp[i-2]","    return dp[n]"], lineMap: { init: 1, done: 6 } } } },
  "unique-paths": { title: "Unique Paths", difficulty: "Medium", category: "Dynamic Programming", timeComplexity: "O(m×n)", spaceComplexity: "O(n)", visualizer: "array", description: "Robot at top-left of m×n grid can move only right or down. Return number of unique paths to bottom-right.", example: { input: "m = 3, n = 7", output: "28", note: "Combinatorics or DP." }, defaultInput: { nums: [3, 7] }, inputFields: ["nums"], explanation: [{ emoji: "🧩", title: "DP", body: "dp[i][j] = dp[i-1][j] + dp[i][j-1]. Can optimize to one row." }], languages: { cpp: { code: ["int uniquePaths(int m, int n) {","    vector<int> dp(n, 1);","    for (int i = 1; i < m; i++)","        for (int j = 1; j < n; j++)","            dp[j] += dp[j-1];","    return dp[n-1];","}"], lineMap: { init: 1, done: 6 } }, java: { code: ["public int uniquePaths(int m, int n) {","    int[] dp = new int[n]; Arrays.fill(dp, 1);","    for (int i = 1; i < m; i++)","        for (int j = 1; j < n; j++) dp[j] += dp[j-1];","    return dp[n-1];","}"], lineMap: { init: 1, done: 6 } }, javascript: { code: ["function uniquePaths(m, n) {","  const dp = Array(n).fill(1);","  for (let i = 1; i < m; i++)","    for (let j = 1; j < n; j++) dp[j] += dp[j-1];","  return dp[n-1];","}"], lineMap: { init: 1, done: 5 } }, python: { code: ["def unique_paths(m, n):","    dp = [1] * n","    for i in range(1, m):","        for j in range(1, n): dp[j] += dp[j-1]","    return dp[-1]"], lineMap: { init: 1, done: 5 } } } },
  "jump-game": { title: "Jump Game", difficulty: "Medium", category: "Dynamic Programming", timeComplexity: "O(n)", spaceComplexity: "O(1)", visualizer: "array", description: "You are at index 0. <code>nums[i]</code> is max jump from i. Return true if you can reach the last index.", example: { input: "nums = [2,3,1,1,4]", output: "true", note: "Greedy: track furthest reachable." } , defaultInput: { nums: [2, 3, 1, 1, 4] }, inputFields: ["nums"], explanation: [{ emoji: "🧩", title: "Greedy", body: "Track maxReach. If i > maxReach return false. Update maxReach = max(maxReach, i + nums[i])." }], languages: { cpp: { code: ["bool canJump(vector<int>& nums) {","    int reach = 0;","    for (int i = 0; i < nums.size(); i++) {","        if (i > reach) return false;","        reach = max(reach, i + nums[i]);","    }","    return true;","}"], lineMap: { init: 1, done: 7 } }, java: { code: ["public boolean canJump(int[] nums) {","    int reach = 0;","    for (int i = 0; i < nums.length; i++) {","        if (i > reach) return false;","        reach = Math.max(reach, i + nums[i]);","    }","    return true;","}"], lineMap: { init: 1, done: 7 } }, javascript: { code: ["function canJump(nums) {","  let reach = 0;","  for (let i = 0; i < nums.length; i++) {","    if (i > reach) return false;","    reach = Math.max(reach, i + nums[i]);","  }","  return true;","}"], lineMap: { init: 1, done: 7 } }, python: { code: ["def can_jump(nums):","    reach = 0","    for i in range(len(nums)):","        if i > reach: return False","        reach = max(reach, i + nums[i])","    return True"], lineMap: { init: 1, done: 6 } } } },

  "insert-interval": { title: "Insert Interval", difficulty: "Medium", category: "Intervals", timeComplexity: "O(n)", spaceComplexity: "O(n)", visualizer: "intervals", description: "Given non-overlapping intervals and a new interval, insert and merge if needed.", example: { input: "intervals = [[1,3],[6,9]], newInterval = [2,5]", output: "[[1,5],[6,9]]", note: "Merge [1,3] and [2,5]." }, defaultInput: { nums: [1, 3, 6, 9, 2, 5] }, inputFields: ["nums"], explanation: [{ emoji: "📐", title: "Linear scan", body: "Add all intervals that end before newInterval; merge overlapping; add rest." }], languages: { cpp: { code: ["vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {","    vector<vector<int>> res;","    for (auto& in : intervals) {","        if (in[1] < newInterval[0]) res.push_back(in);","        else if (in[0] > newInterval[1]) { res.push_back(newInterval); newInterval = in; }","        else newInterval = {min(in[0], newInterval[0]), max(in[1], newInterval[1])};","    }","    res.push_back(newInterval);","    return res;","}"], lineMap: { init: 2, add_before: 4, add_after: 5, merge: 6, push_new: 8, done: 9 } }, java: { code: ["public int[][] insert(int[][] intervals, int[] newInterval) {","    List<int[]> res = new ArrayList<>();","    for (int[] in : intervals) {","        if (in[1] < newInterval[0]) res.add(in);","        else if (in[0] > newInterval[1]) { res.add(newInterval); newInterval = in; }","        else newInterval = new int[]{Math.min(in[0],newInterval[0]), Math.max(in[1],newInterval[1])};","    }","    res.add(newInterval);","    return res.toArray(new int[0][]);","}"], lineMap: { init: 2, add_before: 4, add_after: 5, merge: 6, push_new: 8, done: 9 } }, javascript: { code: ["function insert(intervals, newInterval) {","  const res = [];","  for (const in of intervals) {","    if (in[1] < newInterval[0]) res.push(in);","    else if (in[0] > newInterval[1]) { res.push(newInterval); newInterval = in; }","    else newInterval = [Math.min(in[0],newInterval[0]), Math.max(in[1],newInterval[1])];","  }","  res.push(newInterval);","  return res;","}"], lineMap: { init: 2, add_before: 4, add_after: 5, merge: 6, push_new: 8, done: 9 } }, python: { code: ["def insert(intervals, new_interval):","    res = []","    for i in intervals:","        if i[1] < new_interval[0]: res.append(i)","        elif i[0] > new_interval[1]: res.append(new_interval); new_interval = i","        else: new_interval = [min(i[0],new_interval[0]), max(i[1],new_interval[1])]","    res.append(new_interval)","    return res"], lineMap: { init: 2, add_before: 4, add_after: 5, merge: 6, push_new: 7, done: 8 } } } },
  "non-overlapping-intervals": { title: "Non-overlapping Intervals", difficulty: "Medium", category: "Intervals", timeComplexity: "O(n log n)", spaceComplexity: "O(1)", visualizer: "intervals", description: "Return the minimum number of intervals to remove so the rest are non-overlapping.", example: { input: "[[1,2],[2,3],[3,4],[1,3]]", output: "1", note: "Remove [1,3]." }, defaultInput: { nums: [1, 2, 2, 3, 3, 4, 1, 3] }, inputFields: ["nums"], explanation: [{ emoji: "📐", title: "Greedy", body: "Sort by end; keep interval if start >= lastEnd; else remove (count++)." }], languages: { cpp: { code: ["int eraseOverlapIntervals(vector<vector<int>>& intervals) {","    sort(intervals.begin(), intervals.end(), [](auto& a, auto& b){ return a[1] < b[1]; });","    int end = INT_MIN, count = 0;","    for (auto& in : intervals)","        if (in[0] >= end) end = in[1];","        else count++;","    return count;","}"], lineMap: { init: 1, done: 7 } }, java: { code: ["public int eraseOverlapIntervals(int[][] intervals) {","    Arrays.sort(intervals, (a,b) -> a[1]-b[1]);","    int end = Integer.MIN_VALUE, count = 0;","    for (int[] in : intervals)","        if (in[0] >= end) end = in[1];","        else count++;","    return count;","}"], lineMap: { init: 1, done: 7 } }, javascript: { code: ["function eraseOverlapIntervals(intervals) {","  intervals.sort((a,b) => a[1]-b[1]);","  let end = -Infinity, count = 0;","  for (const in of intervals)","    if (in[0] >= end) end = in[1];","    else count++;","  return count;","}"], lineMap: { init: 1, done: 7 } }, python: { code: ["def erase_overlap_intervals(intervals):","    intervals.sort(key=lambda x: x[1])","    end, count = float('-inf'), 0","    for i in intervals:","        if i[0] >= end: end = i[1]","        else: count += 1","    return count"], lineMap: { init: 1, done: 6 } } } },
  "meeting-rooms": { title: "Meeting Rooms", difficulty: "Easy", category: "Intervals", timeComplexity: "O(n log n)", spaceComplexity: "O(1)", visualizer: "intervals", description: "Given intervals, determine if a person could attend all meetings.", example: { input: "[[0,30],[5,10],[15,20]]", output: "false", note: "Overlap." }, defaultInput: { nums: [0, 30, 5, 10, 15, 20] }, inputFields: ["nums"], explanation: [{ emoji: "📐", title: "Sort by start", body: "Sort; check if intervals[i].end <= intervals[i+1].start." }], languages: { cpp: { code: ["bool canAttendMeetings(vector<vector<int>>& intervals) {","    sort(intervals.begin(), intervals.end());","    for (int i = 1; i < intervals.size(); i++)","        if (intervals[i][0] < intervals[i-1][1]) return false;","    return true;","}"], lineMap: { init: 1, done: 5 } }, java: { code: ["public boolean canAttendMeetings(int[][] intervals) {","    Arrays.sort(intervals, (a,b) -> a[0]-b[0]);","    for (int i = 1; i < intervals.length; i++)","        if (intervals[i][0] < intervals[i-1][1]) return false;","    return true;","}"], lineMap: { init: 1, done: 5 } }, javascript: { code: ["function canAttendMeetings(intervals) {","  intervals.sort((a,b) => a[0]-b[0]);","  for (let i = 1; i < intervals.length; i++)","    if (intervals[i][0] < intervals[i-1][1]) return false;","  return true;","}"], lineMap: { init: 1, done: 5 } }, python: { code: ["def can_attend_meetings(intervals):","    intervals.sort(key=lambda x: x[0])","    for i in range(1, len(intervals)):","        if intervals[i][0] < intervals[i-1][1]: return False","    return True"], lineMap: { init: 1, done: 5 } } } },
  "meeting-rooms-ii": { title: "Meeting Rooms II", difficulty: "Medium", category: "Intervals", timeComplexity: "O(n log n)", spaceComplexity: "O(n)", visualizer: "intervals", description: "Return the minimum number of conference rooms required.", example: { input: "[[0,30],[5,10],[15,20]]", output: "2", note: "Min 2 rooms." }, defaultInput: { nums: [0, 30, 5, 10, 15, 20] }, inputFields: ["nums"], explanation: [{ emoji: "📐", title: "Chronological", body: "Split starts and ends; sort; sweep and count active meetings." }], languages: { cpp: { code: ["int minMeetingRooms(vector<vector<int>>& intervals) {","    vector<int> start, end;","    for (auto& in : intervals) { start.push_back(in[0]); end.push_back(in[1]); }","    sort(start.begin(), start.end()); sort(end.begin(), end.end());","    int i = 0, j = 0, rooms = 0, maxRooms = 0;","    while (i < start.size()) {","        if (start[i] < end[j]) { rooms++; i++; maxRooms = max(maxRooms, rooms); }","        else { rooms--; j++; }","    }","    return maxRooms;","}"], lineMap: { init: 1, done: 10 } }, java: { code: ["public int minMeetingRooms(int[][] intervals) {","    int[] start = new int[intervals.length], end = new int[intervals.length];","    for (int i = 0; i < intervals.length; i++) { start[i]=intervals[i][0]; end[i]=intervals[i][1]; }","    Arrays.sort(start); Arrays.sort(end);","    int i = 0, j = 0, rooms = 0, maxRooms = 0;","    while (i < start.length) {","        if (start[i] < end[j]) { rooms++; i++; maxRooms = Math.max(maxRooms, rooms); }","        else { rooms--; j++; }","    }","    return maxRooms;","}"], lineMap: { init: 1, done: 11 } }, javascript: { code: ["function minMeetingRooms(intervals) {","  const start = intervals.map(i => i[0]).sort((a,b)=>a-b);","  const end = intervals.map(i => i[1]).sort((a,b)=>a-b);","  let i = 0, j = 0, rooms = 0, maxRooms = 0;","  while (i < start.length) {","    if (start[i] < end[j]) { rooms++; i++; maxRooms = Math.max(maxRooms, rooms); }","    else { rooms--; j++; }","  }","  return maxRooms;","}"], lineMap: { init: 1, done: 9 } }, python: { code: ["def min_meeting_rooms(intervals):","    start = sorted(i[0] for i in intervals)","    end = sorted(i[1] for i in intervals)","    i = j = rooms = max_rooms = 0","    while i < len(start):","        if start[i] < end[j]: rooms += 1; i += 1; max_rooms = max(max_rooms, rooms)","        else: rooms -= 1; j += 1","    return max_rooms"], lineMap: { init: 1, done: 8 } } } },

  "merge-k-sorted-lists": { title: "Merge K Sorted Lists", difficulty: "Hard", category: "Linked Lists", timeComplexity: "O(N log k)", spaceComplexity: "O(k)", visualizer: "linkedlist", description: "Merge k sorted linked lists into one sorted list.", example: { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]", note: "Use min-heap of k heads." }, defaultInput: { nums: [1, 4, 5, 1, 3, 4, 2, 6] }, inputFields: ["nums"], explanation: [{ emoji: "🔗", title: "Min-heap", body: "Push all heads; pop min, append to result, push next from that list." }], languages: { cpp: { code: ["ListNode* mergeKLists(vector<ListNode*>& lists) {","    auto cmp = [](ListNode* a, ListNode* b){ return a->val > b->val; };","    priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);","    for (auto* h : lists) if (h) pq.push(h);","    ListNode dummy; ListNode* tail = &dummy;","    while (!pq.empty()) { auto* n = pq.top(); pq.pop(); tail->next = n; tail = n; if (n->next) pq.push(n->next); }","    return dummy.next;","}"], lineMap: { init: 1, done: 7 } }, java: { code: ["public ListNode mergeKLists(ListNode[] lists) {","    PriorityQueue<ListNode> pq = new PriorityQueue<>((a,b)->a.val-b.val);","    for (ListNode n : lists) if (n != null) pq.offer(n);","    ListNode dummy = new ListNode(0); ListNode tail = dummy;","    while (!pq.isEmpty()) { ListNode n = pq.poll(); tail.next = n; tail = n; if (n.next != null) pq.offer(n.next); }","    return dummy.next;","}"], lineMap: { init: 1, done: 6 } }, javascript: { code: ["function mergeKLists(lists) {","  const pq = new MinPriorityQueue({ priority: n => n.val });","  for (const h of lists) if (h) pq.enqueue(h);","  const dummy = new ListNode(); let tail = dummy;","  while (!pq.isEmpty()) { const n = pq.dequeue().element; tail.next = n; tail = n; if (n.next) pq.enqueue(n.next); }","  return dummy.next;","}"], lineMap: { init: 1, done: 6 } }, python: { code: ["def merge_k_lists(lists):","    import heapq","    pq = [(h.val, h) for h in lists if h]","    heapq.heapify(pq)","    dummy = tail = ListNode(0)","    while pq:","        _, n = heapq.heappop(pq)","        tail.next = n; tail = n","        if n.next: heapq.heappush(pq, (n.next.val, n.next))","    return dummy.next"], lineMap: { init: 1, done: 9 } } } },
  "remove-nth-node": { title: "Remove Nth Node From End of List", difficulty: "Medium", category: "Linked Lists", timeComplexity: "O(n)", spaceComplexity: "O(1)", visualizer: "linkedlist", description: "Remove the nth node from the end of the list (1-indexed).", example: { input: "head = [1,2,3,4,5], n = 2", output: "[1,2,3,5]", note: "Two pointers: fast ahead by n." }, defaultInput: { head: [1, 2, 3, 4, 5], n: 2 }, inputFields: ["head", "n"], explanation: [{ emoji: "🔗", title: "Two pointers", body: "Fast pointer n+1 steps ahead; when fast reaches null, slow.next is the node to remove." }], languages: { cpp: { code: ["ListNode* removeNthFromEnd(ListNode* head, int n) {","    ListNode dummy(0); dummy.next = head;","    ListNode* fast = &dummy, *slow = &dummy;","    for (int i = 0; i <= n; i++) fast = fast->next;","    while (fast) { slow = slow->next; fast = fast->next; }","    slow->next = slow->next->next;","    return dummy.next;","}"], lineMap: { init: 1, done: 7 } }, java: { code: ["public ListNode removeNthFromEnd(ListNode head, int n) {","    ListNode dummy = new ListNode(0); dummy.next = head;","    ListNode fast = dummy, slow = dummy;","    for (int i = 0; i <= n; i++) fast = fast.next;","    while (fast != null) { slow = slow.next; fast = fast.next; }","    slow.next = slow.next.next;","    return dummy.next;","}"], lineMap: { init: 1, done: 7 } }, javascript: { code: ["function removeNthFromEnd(head, n) {","  const dummy = new ListNode(0); dummy.next = head;","  let fast = dummy, slow = dummy;","  for (let i = 0; i <= n; i++) fast = fast.next;","  while (fast) { slow = slow.next; fast = fast.next; }","  slow.next = slow.next.next;","  return dummy.next;","}"], lineMap: { init: 1, done: 7 } }, python: { code: ["def remove_nth_from_end(head, n):","    dummy = ListNode(0); dummy.next = head","    fast = slow = dummy","    for _ in range(n+1): fast = fast.next","    while fast: slow, fast = slow.next, fast.next","    slow.next = slow.next.next","    return dummy.next"], lineMap: { init: 1, done: 6 } } } },
  "reorder-list": { title: "Reorder List", difficulty: "Medium", category: "Linked Lists", timeComplexity: "O(n)", spaceComplexity: "O(1)", visualizer: "linkedlist", description: "Reorder list: L0→L1→…→Ln-1→Ln becomes L0→Ln→L1→Ln-1→…", example: { input: "head = [1,2,3,4]", output: "[1,4,2,3]", note: "Find mid, reverse second half, merge." }, defaultInput: { head: [1, 2, 3, 4] }, inputFields: ["head"], explanation: [{ emoji: "🔗", title: "Three steps", body: "1. Find middle. 2. Reverse second half. 3. Merge two halves alternately." }], languages: { cpp: { code: ["void reorderList(ListNode* head) {","    if (!head || !head->next) return;","    ListNode* slow = head, *fast = head;","    while (fast->next && fast->next->next) { slow = slow->next; fast = fast->next->next; }","    ListNode* second = slow->next; slow->next = nullptr;","    ListNode* prev = nullptr;","    while (second) { ListNode* next = second->next; second->next = prev; prev = second; second = next; }","    ListNode* first = head; second = prev;","    while (second) { ListNode* t1 = first->next, t2 = second->next; first->next = second; second->next = t1; first = t1; second = t2; }","}"], lineMap: { init: 1, done: 9 } }, java: { code: ["public void reorderList(ListNode head) {","    if (head == null || head.next == null) return;","    ListNode slow = head, fast = head;","    while (fast.next != null && fast.next.next != null) { slow = slow.next; fast = fast.next.next; }","    ListNode second = slow.next; slow.next = null;","    ListNode prev = null;","    while (second != null) { ListNode next = second.next; second.next = prev; prev = second; second = next; }","    ListNode first = head; second = prev;","    while (second != null) { ListNode t1 = first.next, t2 = second.next; first.next = second; second.next = t1; first = t1; second = t2; }","}"], lineMap: { init: 1, done: 10 } }, javascript: { code: ["function reorderList(head) {","  if (!head || !head.next) return;","  let slow = head, fast = head;","  while (fast.next && fast.next.next) { slow = slow.next; fast = fast.next.next; }","  let second = slow.next; slow.next = null;","  let prev = null;","  while (second) { const next = second.next; second.next = prev; prev = second; second = next; }","  let first = head; second = prev;","  while (second) { const t1 = first.next, t2 = second.next; first.next = second; second.next = t1; first = t1; second = t2; }","}"], lineMap: { init: 1, done: 10 } }, python: { code: ["def reorder_list(head):","    if not head or not head.next: return","    slow = fast = head","    while fast.next and fast.next.next: slow, fast = slow.next, fast.next.next","    second = slow.next; slow.next = None","    prev = None","    while second: next_ = second.next; second.next = prev; prev = second; second = next_","    first, second = head, prev","    while second: t1, t2 = first.next, second.next; first.next = second; second.next = t1; first, second = t1, t2"], lineMap: { init: 1, done: 9 } } } },
  "copy-list-random-pointer": { title: "Copy List with Random Pointer", difficulty: "Medium", category: "Linked Lists", timeComplexity: "O(n)", spaceComplexity: "O(1)", visualizer: "linkedlist", description: "Deep copy a linked list where each node has a next and a random pointer.", example: { input: "head with next and random", output: "deep copy", note: "Interweave copy nodes; assign random; unweave." }, defaultInput: { head: [1, 2, 3] }, inputFields: ["head"], explanation: [{ emoji: "🔗", title: "O(1) space", body: "Create copy between each node; assign random; split lists." }], languages: { cpp: { code: ["Node* copyRandomList(Node* head) {","    if (!head) return nullptr;","    for (Node* p = head; p; p = p->next->next) { Node* copy = new Node(p->val); copy->next = p->next; p->next = copy; }","    for (Node* p = head; p; p = p->next->next) if (p->random) p->next->random = p->random->next;","    Node* dummy = new Node(0); Node* tail = dummy;","    for (Node* p = head; p; p = p->next) { tail->next = p->next; tail = tail->next; p->next = p->next->next; }","    return dummy->next;","}"], lineMap: { init: 1, done: 7 } }, java: { code: ["public Node copyRandomList(Node head) {","    if (head == null) return null;","    for (Node p = head; p != null; p = p.next.next) { Node copy = new Node(p.val); copy.next = p.next; p.next = copy; }","    for (Node p = head; p != null; p = p.next.next) if (p.random != null) p.next.random = p.random.next;","    Node dummy = new Node(0); Node tail = dummy;","    for (Node p = head; p != null; p = p.next) { tail.next = p.next; tail = tail.next; p.next = p.next.next; }","    return dummy.next;","}"], lineMap: { init: 1, done: 7 } }, javascript: { code: ["function copyRandomList(head) {","  if (!head) return null;","  for (let p = head; p; p = p.next.next) { const copy = new Node(p.val); copy.next = p.next; p.next = copy; }","  for (let p = head; p; p = p.next.next) if (p.random) p.next.random = p.random.next;","  const dummy = new Node(0); let tail = dummy;","  for (let p = head; p; p = p.next) { tail.next = p.next; tail = tail.next; p.next = p.next.next; }","  return dummy.next;","}"], lineMap: { init: 1, done: 7 } }, python: { code: ["def copy_random_list(head):","    if not head: return None","    p = head","    while p: copy = Node(p.val); copy.next = p.next; p.next = copy; p = copy.next","    p = head","    while p: p.next.random = p.random.next if p.random else None; p = p.next.next","    dummy = Node(0); tail = dummy; p = head","    while p: tail.next = p.next; tail = tail.next; p.next = p.next.next; p = p.next","    return dummy.next"], lineMap: { init: 1, done: 6 } } } },

  "clone-graph": { title: "Clone Graph", difficulty: "Medium", category: "Graphs", timeComplexity: "O(V+E)", spaceComplexity: "O(V)", visualizer: "graph", description: "Return a deep copy of a connected undirected graph (each node has neighbors list).", example: { input: "n = 4, edges = [[0,1],[0,2],[1,3],[2,3]]", output: "deep copy", note: "BFS/DFS with map from old to new node." }, defaultInput: { n: 4, nums: [0, 1, 0, 2, 1, 3, 2, 3] }, inputFields: ["n", "nums"], explanation: [{ emoji: "🕸️", title: "BFS + Map", body: "Map old node → new node; for each node, clone and add neighbors from map." }], languages: { cpp: { code: ["Node* cloneGraph(Node* node) {","    if (!node) return nullptr;","    unordered_map<Node*, Node*> map;","    queue<Node*> q; q.push(node); map[node] = new Node(node->val);","    while (!q.empty()) {","        Node* cur = q.front(); q.pop();","        for (Node* nb : cur->neighbors) {","            if (!map.count(nb)) { map[nb] = new Node(nb->val); q.push(nb); }","            map[cur]->neighbors.push_back(map[nb]);","        }","    }","    return map[node];","}"], lineMap: { init: 1, done: 12 } }, java: { code: ["public Node cloneGraph(Node node) {","    if (node == null) return null;","    Map<Node, Node> map = new HashMap<>();","    Queue<Node> q = new LinkedList<>(); q.offer(node); map.put(node, new Node(node.val));","    while (!q.isEmpty()) {","        Node cur = q.poll();","        for (Node nb : cur.neighbors) {","            if (!map.containsKey(nb)) { map.put(nb, new Node(nb.val)); q.offer(nb); }","            map.get(cur).neighbors.add(map.get(nb));","        }","    }","    return map.get(node);","}"], lineMap: { init: 1, done: 13 } }, javascript: { code: ["function cloneGraph(node) {","  if (!node) return null;","  const map = new Map();","  const q = [node]; map.set(node, new Node(node.val));","  while (q.length) {","    const cur = q.shift();","    for (const nb of cur.neighbors) {","      if (!map.has(nb)) { map.set(nb, new Node(nb.val)); q.push(nb); }","      map.get(cur).neighbors.push(map.get(nb));","    }","  }","  return map.get(node);","}"], lineMap: { init: 1, done: 13 } }, python: { code: ["def clone_graph(node):","    if not node: return None","    m = {}; q = deque([node]); m[node] = Node(node.val)","    while q:","        cur = q.popleft()","        for nb in cur.neighbors:","            if nb not in m: m[nb] = Node(nb.val); q.append(nb)","            m[cur].neighbors.append(m[nb])","    return m[node]"], lineMap: { init: 1, done: 9 } } } },
  "course-schedule": { title: "Course Schedule", difficulty: "Medium", category: "Graphs", timeComplexity: "O(V+E)", spaceComplexity: "O(V+E)", visualizer: "graph", description: "There are numCourses and prerequisites. Return true if you can finish all courses (no cycle in DAG).", example: { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", note: "Topological sort / DFS cycle detect." }, defaultInput: { n: 2, nums: [1, 0] }, inputFields: ["n", "nums"], explanation: [{ emoji: "🕸️", title: "Topological sort", body: "Build graph; DFS with three states (unvisited, visiting, done). Cycle if we hit visiting." }], languages: { cpp: { code: ["bool canFinish(int numCourses, vector<vector<int>>& prereq) {","    vector<vector<int>> graph(numCourses);","    for (auto& p : prereq) graph[p[1]].push_back(p[0]);","    vector<int> state(numCourses, 0);","    function<bool(int)> dfs = [&](int u) {","        if (state[u] == 1) return false;","        if (state[u] == 2) return true;","        state[u] = 1;","        for (int v : graph[u]) if (!dfs(v)) return false;","        state[u] = 2; return true;","    };","    for (int i = 0; i < numCourses; i++) if (!dfs(i)) return false;","    return true;","}"], lineMap: { init: 1, done: 13 } }, java: { code: ["public boolean canFinish(int numCourses, int[][] prereq) {","    List<List<Integer>> graph = new ArrayList<>();","    for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());","    for (int[] p : prereq) graph.get(p[1]).add(p[0]);","    int[] state = new int[numCourses];","    for (int i = 0; i < numCourses; i++) if (!dfs(graph, state, i)) return false;","    return true;","}","boolean dfs(List<List<Integer>> g, int[] state, int u) {","    if (state[u] == 1) return false;","    if (state[u] == 2) return true;","    state[u] = 1;","    for (int v : g.get(u)) if (!dfs(g, state, v)) return false;","    state[u] = 2; return true;","}"], lineMap: { init: 1, done: 14 } }, javascript: { code: ["function canFinish(numCourses, prereq) {","  const graph = Array.from({ length: numCourses }, () => []);","  for (const [a, b] of prereq) graph[b].push(a);","  const state = Array(numCourses).fill(0);","  function dfs(u) {","    if (state[u] === 1) return false;","    if (state[u] === 2) return true;","    state[u] = 1;","    for (const v of graph[u]) if (!dfs(v)) return false;","    state[u] = 2; return true;","  }","  for (let i = 0; i < numCourses; i++) if (!dfs(i)) return false;","  return true;","}"], lineMap: { init: 1, done: 14 } }, python: { code: ["def can_finish(num_courses, prereq):","    graph = [[] for _ in range(num_courses)]","    for a, b in prereq: graph[b].append(a)","    state = [0] * num_courses","    def dfs(u):","        if state[u] == 1: return False","        if state[u] == 2: return True","        state[u] = 1","        for v in graph[u]:","            if not dfs(v): return False","        state[u] = 2; return True","    return all(dfs(i) for i in range(num_courses))"], lineMap: { init: 1, done: 13 } } } },
  "pacific-atlantic": { title: "Pacific Atlantic Water Flow", difficulty: "Medium", category: "Graphs", timeComplexity: "O(m×n)", spaceComplexity: "O(m×n)", visualizer: "grid", description: "Matrix where water flows to adjacent cells with same or lower height. Return cells that can flow to both Pacific and Atlantic.", example: { input: "heights = n×n grid", output: "list of cells", note: "BFS from Pacific (top/left) and Atlantic (bottom/right) edges; return intersection." }, defaultInput: { grid: [1,2,2,3,5,4, 3,2,3,4,4,3, 2,4,5,3,1,2, 6,7,1,4,5,3, 5,1,1,2,4,2, 4,3,2,3,2,1], rows: 6 }, inputFields: ["grid", "rows"], explanation: [{ emoji: "🕸️", title: "Two BFS", body: "From Pacific edge (row 0, col 0) and Atlantic edge (last row, last col), BFS and mark reachable; return intersection." }], languages: { cpp: { code: ["vector<vector<int>> pacificAtlantic(vector<vector<int>>& h) {","    int R = h.size(), C = h[0].size();","    vector<vector<bool>> pac(R, vector<bool>(C)), atl(R, vector<bool>(C));","    auto bfs = [&](vector<vector<bool>>& vis, vector<pair<int,int>> starts) {","        queue<pair<int,int>> q;","        for (auto [r,c] : starts) { vis[r][c] = true; q.push({r,c}); }","        while (!q.empty()) {","            auto [r, c] = q.front(); q.pop();","            for (auto [dr,dc] : vector<pair<int,int>>{{0,1},{0,-1},{1,0},{-1,0}}) {","                int nr = r+dr, nc = c+dc;","                if (nr>=0 && nr<R && nc>=0 && nc<C && !vis[nr][nc] && h[nr][nc] >= h[r][c]) { vis[nr][nc] = true; q.push({nr,nc}); }","            }","        }","    };","    vector<pair<int,int>> pacStart, atlStart;","    for (int r = 0; r < R; r++) { pacStart.push_back({r,0}); atlStart.push_back({r,C-1}); }","    for (int c = 0; c < C; c++) { pacStart.push_back({0,c}); atlStart.push_back({R-1,c}); }","    bfs(pac, pacStart); bfs(atl, atlStart);","    vector<vector<int>> res;","    for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) if (pac[r][c] && atl[r][c]) res.push_back({r,c});","    return res;","}"], lineMap: { init: 2, pacific_visit: 8, pacific_done: 18, atlantic_visit: 8, result: 17, done: 18 } }, java: { code: ["public List<List<Integer>> pacificAtlantic(int[][] h) {","    int R = h.length, C = h[0].length;","    boolean[][] pac = new boolean[R][C], atl = new boolean[R][C];","    bfs(h, pac, true); bfs(h, atl, false);","    List<List<Integer>> res = new ArrayList<>();","    for (int r = 0; r < R; r++) for (int c = 0; c < C; c++) if (pac[r][c] && atl[r][c]) res.add(List.of(r,c));","    return res;","}","void bfs(int[][] h, boolean[][] vis, boolean isPacific) {","    Queue<int[]> q = new LinkedList<>();","    int R = h.length, C = h[0].length;","    if (isPacific) { for (int r = 0; r < R; r++) { vis[r][0]=true; q.offer(new int[]{r,0}); } for (int c = 0; c < C; c++) { vis[0][c]=true; q.offer(new int[]{0,c}); } }","    else { for (int r = 0; r < R; r++) { vis[r][C-1]=true; q.offer(new int[]{r,C-1}); } for (int c = 0; c < C; c++) { vis[R-1][c]=true; q.offer(new int[]{R-1,c}); } }","    int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};","    while (!q.isEmpty()) {","        int[] cur = q.poll(); int r = cur[0], c = cur[1];","        for (int[] d : dirs) {","            int nr = r+d[0], nc = c+d[1];","            if (nr>=0 && nr<R && nc>=0 && nc<C && !vis[nr][nc] && h[nr][nc] >= h[r][c]) { vis[nr][nc] = true; q.offer(new int[]{nr,nc}); }","        }","    }","}"], lineMap: { init: 2, pacific_visit: 16, pacific_done: 4, atlantic_visit: 16, result: 6, done: 7 } }, javascript: { code: ["function pacificAtlantic(h) {","  const R = h.length, C = h[0].length;","  const pac = Array(R).fill(0).map(() => Array(C).fill(false));","  const atl = Array(R).fill(0).map(() => Array(C).fill(false));","  const bfs = (vis, starts) => {","    const q = [...starts];","    starts.forEach(([r,c]) => { vis[r][c] = true; });","    while (q.length) {","      const [r, c] = q.shift();","      for (const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {","        const nr = r+dr, nc = c+dc;","        if (nr>=0&&nr<R&&nc>=0&&nc<C&&!vis[nr][nc]&&h[nr][nc]>=h[r][c]) { vis[nr][nc]=true; q.push([nr,nc]); }","      }","    }","  };","  const pacStart = [...Array(R).keys()].map(r=>[r,0]).concat([...Array(C).keys()].map(c=>[0,c]));","  const atlStart = [...Array(R).keys()].map(r=>[r,C-1]).concat([...Array(C).keys()].map(c=>[R-1,c]));","  bfs(pac, pacStart); bfs(atl, atlStart);","  const res = [];","  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (pac[r][c]&&atl[r][c]) res.push([r,c]);","  return res;","}"], lineMap: { init: 2, pacific_visit: 9, pacific_done: 20, atlantic_visit: 9, result: 21, done: 22 } }, python: { code: ["def pacific_atlantic(h):","    R, C = len(h), len(h[0])","    pac = [[False]*C for _ in range(R)]","    atl = [[False]*C for _ in range(R)]","    def bfs(vis, starts):","        from collections import deque","        q = deque(starts)","        for r, c in starts: vis[r][c] = True","        while q:","            r, c = q.popleft()","            for dr, dc in ((0,1),(0,-1),(1,0),(-1,0)):","                nr, nc = r+dr, c+dc","                if 0<=nr<R and 0<=nc<C and not vis[nr][nc] and h[nr][nc]>=h[r][c]:","                    vis[nr][nc] = True; q.append((nr,nc))","    pacStart = [(r,0) for r in range(R)] + [(0,c) for c in range(C)]","    atlStart = [(r,C-1) for r in range(R)] + [(R-1,c) for c in range(C)]","    bfs(pac, pacStart); bfs(atl, atlStart)","    return [[r,c] for r in range(R) for c in range(C) if pac[r][c] and atl[r][c]]"], lineMap: { init: 2, pacific_visit: 10, pacific_done: 17, atlantic_visit: 10, result: 18, done: 18 } } } },
  "num-connected-components": { title: "Number of Connected Components in an Undirected Graph", difficulty: "Medium", category: "Graphs", timeComplexity: "O(V+E)", spaceComplexity: "O(V)", visualizer: "graph", description: "Given n nodes and edges, return the number of connected components.", example: { input: "n = 5, edges = [[0,1],[1,2],[3,4]]", output: "2", note: "DFS or Union-Find." }, defaultInput: { n: 5, nums: [0, 1, 1, 2, 3, 4] }, inputFields: ["n", "nums"], explanation: [{ emoji: "🕸️", title: "Union-Find or DFS", body: "For each unvisited node, run DFS and increment count." }], languages: { cpp: { code: ["int countComponents(int n, vector<vector<int>>& edges) {","    vector<vector<int>> graph(n);","    for (auto& e : edges) { graph[e[0]].push_back(e[1]); graph[e[1]].push_back(e[0]); }","    vector<bool> vis(n);","    function<void(int)> dfs = [&](int u) {","        vis[u] = true;","        for (int v : graph[u]) if (!vis[v]) dfs(v);","    };","    int count = 0;","    for (int i = 0; i < n; i++) if (!vis[i]) { dfs(i); count++; }","    return count;","}"], lineMap: { init: 2, dfs_visit: 6, dfs_recurse: 7, count_inc: 10, done: 11 } }, java: { code: ["public int countComponents(int n, int[][] edges) {","    List<List<Integer>> graph = new ArrayList<>();","    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());","    for (int[] e : edges) { graph.get(e[0]).add(e[1]); graph.get(e[1]).add(e[0]); }","    boolean[] vis = new boolean[n];","    int count = 0;","    for (int i = 0; i < n; i++) if (!vis[i]) { dfs(graph, vis, i); count++; }","    return count;","}","void dfs(List<List<Integer>> g, boolean[] vis, int u) {","    vis[u] = true;","    for (int v : g.get(u)) if (!vis[v]) dfs(g, vis, v);","}"], lineMap: { init: 2, dfs_visit: 10, dfs_recurse: 11, count_inc: 7, done: 8 } }, javascript: { code: ["function countComponents(n, edges) {","  const graph = Array.from({ length: n }, () => []);","  for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a); }","  const vis = Array(n).fill(false);","  function dfs(u) { vis[u] = true; for (const v of graph[u]) if (!vis[v]) dfs(v); }","  let count = 0;","  for (let i = 0; i < n; i++) if (!vis[i]) { dfs(i); count++; }","  return count;","}"], lineMap: { init: 2, dfs_visit: 4, dfs_recurse: 4, count_inc: 7, done: 8 } }, python: { code: ["def count_components(n, edges):","    graph = [[] for _ in range(n)]","    for a, b in edges: graph[a].append(b); graph[b].append(a)","    vis = [False] * n","    def dfs(u):","        vis[u] = True","        for v in graph[u]:","            if not vis[v]: dfs(v)","    count = 0","    for i in range(n):","        if not vis[i]: dfs(i); count += 1","    return count"], lineMap: { init: 2, dfs_visit: 5, dfs_recurse: 7, count_inc: 10, done: 11 } } } },
  "graph-valid-tree": { title: "Graph Valid Tree", difficulty: "Medium", category: "Graphs", timeComplexity: "O(V+E)", spaceComplexity: "O(V)", visualizer: "graph", description: "Given n nodes and edges, return true if the graph is a valid tree (connected, no cycle).", example: { input: "n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]", output: "true", note: "One component and exactly n-1 edges." }, defaultInput: { n: 5, nums: [0, 1, 0, 2, 0, 3, 1, 4] }, inputFields: ["n", "nums"], explanation: [{ emoji: "🕸️", title: "Tree = connected + acyclic", body: "Must have exactly n-1 edges; then one DFS to check connected." }], languages: { cpp: { code: ["bool validTree(int n, vector<vector<int>>& edges) {","    if (edges.size() != n - 1) return false;","    vector<vector<int>> graph(n);","    for (auto& e : edges) { graph[e[0]].push_back(e[1]); graph[e[1]].push_back(e[0]); }","    vector<bool> vis(n);","    function<void(int)> dfs = [&](int u) { vis[u] = true; for (int v : graph[u]) if (!vis[v]) dfs(v); };","    dfs(0);","    return accumulate(vis.begin(), vis.end(), 0) == n;","}"], lineMap: { init: 1, done: 9 } }, java: { code: ["public boolean validTree(int n, int[][] edges) {","    if (edges.length != n - 1) return false;","    List<List<Integer>> graph = new ArrayList<>();","    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());","    for (int[] e : edges) { graph.get(e[0]).add(e[1]); graph.get(e[1]).add(e[0]); }","    boolean[] vis = new boolean[n];","    dfs(graph, vis, 0);","    return IntStream.range(0, n).allMatch(i -> vis[i]);","}","void dfs(List<List<Integer>> g, boolean[] vis, int u) {","    vis[u] = true;","    for (int v : g.get(u)) if (!vis[v]) dfs(g, vis, v);","}"], lineMap: { init: 1, done: 12 } }, javascript: { code: ["function validTree(n, edges) {","  if (edges.length !== n - 1) return false;","  const graph = Array.from({ length: n }, () => []);","  for (const [a,b] of edges) { graph[a].push(b); graph[b].push(a); }","  const vis = Array(n).fill(false);","  function dfs(u) { vis[u] = true; for (const v of graph[u]) if (!vis[v]) dfs(v); }","  dfs(0);","  return vis.every(Boolean);","}"], lineMap: { init: 1, done: 9 } }, python: { code: ["def valid_tree(n, edges):","    if len(edges) != n - 1: return False","    graph = [[] for _ in range(n)]","    for a, b in edges: graph[a].append(b); graph[b].append(a)","    vis = [False] * n","    def dfs(u): vis[u] = True; [dfs(v) for v in graph[u] if not vis[v]]","    dfs(0)","    return all(vis)"], lineMap: { init: 1, done: 8 } } } },

  "group-anagrams": { title: "Group Anagrams", difficulty: "Medium", category: "Strings", timeComplexity: "O(n × k)", spaceComplexity: "O(n × k)", visualizer: "array", description: "Group strings that are anagrams of each other.", example: { input: "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", output: "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]", note: "Use sorted string or count as key." }, defaultInput: { s: "eat,tea,tan,ate,nat,bat" }, inputFields: ["s"], explanation: [{ emoji: "📝", title: "Hash by key", body: "Key = sorted(str) or tuple of char counts; group by key." }], languages: { cpp: { code: ["vector<vector<string>> groupAnagrams(vector<string>& strs) {","    unordered_map<string, vector<string>> map;","    for (auto& s : strs) {","        string key = s; sort(key.begin(), key.end());","        map[key].push_back(s);","    }","    vector<vector<string>> res;","    for (auto& p : map) res.push_back(p.second);","    return res;","}"], lineMap: { init: 1, done: 8 } }, java: { code: ["public List<List<String>> groupAnagrams(String[] strs) {","    Map<String, List<String>> map = new HashMap<>();","    for (String s : strs) {","        char[] c = s.toCharArray(); Arrays.sort(c);","        String key = String.valueOf(c);","        map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);","    }","    return new ArrayList<>(map.values());","}"], lineMap: { init: 1, done: 8 } }, javascript: { code: ["function groupAnagrams(strs) {","  const map = {};","  for (const s of strs) {","    const key = [...s].sort().join('');","    if (!map[key]) map[key] = [];","    map[key].push(s);","  }","  return Object.values(map);","}"], lineMap: { init: 1, done: 7 } }, python: { code: ["def group_anagrams(strs):","    from collections import defaultdict","    m = defaultdict(list)","    for s in strs:","        m[tuple(sorted(s))].append(s)","    return list(m.values())"], lineMap: { init: 1, done: 6 } } } },
  "longest-substring-no-repeat": { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", category: "Sliding Window", timeComplexity: "O(n)", spaceComplexity: "O(min(n, charset))", visualizer: "array", description: "Return the length of the longest substring without repeating characters.", example: { input: "s = \"abcabcbb\"", output: "3", note: "\"abc\"." }, defaultInput: { s: "abcabcbb" }, inputFields: ["s"], explanation: [{ emoji: "🪟", title: "Sliding window", body: "Track last index of each char; shrink left when duplicate." }], languages: { cpp: { code: ["int lengthOfLongestSubstring(string s) {","    unordered_map<char, int> last;","    int start = -1, best = 0;","    for (int i = 0; i < s.size(); i++) {","        if (last.count(s[i])) start = max(start, last[s[i]]);","        last[s[i]] = i;","        best = max(best, i - start);","    }","    return best;","}"], lineMap: { init: 1, done: 8 } }, java: { code: ["public int lengthOfLongestSubstring(String s) {","    Map<Character, Integer> last = new HashMap<>();","    int start = -1, best = 0;","    for (int i = 0; i < s.length(); i++) {","        if (last.containsKey(s.charAt(i))) start = Math.max(start, last.get(s.charAt(i)));","        last.put(s.charAt(i), i);","        best = Math.max(best, i - start);","    }","    return best;","}"], lineMap: { init: 1, done: 8 } }, javascript: { code: ["function lengthOfLongestSubstring(s) {","  const last = {};","  let start = -1, best = 0;","  for (let i = 0; i < s.length; i++) {","    if (s[i] in last) start = Math.max(start, last[s[i]]);","    last[s[i]] = i;","    best = Math.max(best, i - start);","  }","  return best;","}"], lineMap: { init: 1, done: 8 } }, python: { code: ["def length_of_longest_substring(s):","    last = {}","    start = -1","    best = 0","    for i, c in enumerate(s):","        if c in last: start = max(start, last[c])","        last[c] = i","        best = max(best, i - start)","    return best"], lineMap: { init: 1, done: 8 } } } },
  "longest-palindromic-substring": { title: "Longest Palindromic Substring", difficulty: "Medium", category: "Strings", timeComplexity: "O(n²)", spaceComplexity: "O(1)", visualizer: "array", description: "Return the longest palindromic substring in <code>s</code>.", example: { input: "s = \"babad\"", output: "\"bab\" or \"aba\"", note: "Expand around center." } , defaultInput: { s: "babad" }, inputFields: ["s"], explanation: [{ emoji: "📝", title: "Expand around center", body: "For each index (and between), expand while s[l]==s[r]; track longest." }], languages: { cpp: { code: ["string longestPalindrome(string s) {","    int n = s.size();","    auto expand = [&](int l, int r) {","        while (l >= 0 && r < n && s[l] == s[r]) l--, r++;","        return s.substr(l+1, r-l-1);","    };","    string best = \"\";","    for (int i = 0; i < n; i++) {","        string s1 = expand(i, i), s2 = expand(i, i+1);","        if (s1.size() > best.size()) best = s1;","        if (s2.size() > best.size()) best = s2;","    }","    return best;","}"], lineMap: { init: 1, done: 11 } }, java: { code: ["public String longestPalindrome(String s) {","    int n = s.length();","    int start = 0, maxLen = 0;","    for (int i = 0; i < n; i++) {","        int l = i, r = i;","        while (l >= 0 && r < n && s.charAt(l) == s.charAt(r)) { l--; r++; }","        if (r - l - 1 > maxLen) { start = l + 1; maxLen = r - l - 1; }","        l = i; r = i + 1;","        while (l >= 0 && r < n && s.charAt(l) == s.charAt(r)) { l--; r++; }","        if (r - l - 1 > maxLen) { start = l + 1; maxLen = r - l - 1; }","    }","    return s.substring(start, start + maxLen);","}"], lineMap: { init: 1, done: 14 } }, javascript: { code: ["function longestPalindrome(s) {","  let best = '';","  function expand(l, r) {","    while (l >= 0 && r < s.length && s[l] === s[r]) l--, r++;","    return s.slice(l+1, r);","  }","  for (let i = 0; i < s.length; i++) {","    const s1 = expand(i, i), s2 = expand(i, i+1);","    if (s1.length > best.length) best = s1;","    if (s2.length > best.length) best = s2;","  }","  return best;","}"], lineMap: { init: 1, done: 12 } }, python: { code: ["def longest_palindrome(s):","    def expand(l, r):","        while l >= 0 and r < len(s) and s[l]==s[r]: l -= 1; r += 1","        return s[l+1:r]","    best = ''","    for i in range(len(s)):","        for p in [expand(i,i), expand(i,i+1)]:","            if len(p) > len(best): best = p","    return best"], lineMap: { init: 1, done: 9 } } } },
  "top-k-frequent": { title: "Top K Frequent Elements", difficulty: "Medium", category: "Arrays", timeComplexity: "O(n log k)", spaceComplexity: "O(n)", visualizer: "topk", description: "Given an integer array and k, return the k most frequent elements.", example: { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]", note: "Min-heap (priority queue) of size k by frequency." }, defaultInput: { nums: [1, 1, 1, 2, 2, 3], k: 2 }, inputFields: ["nums", "k"], explanation: [{ emoji: "📌", title: "Priority queue", body: "Count frequencies O(n). Keep a min-heap of size k (by freq); push (freq, num), pop when size > k. Time O(n log k), space O(n)." }], languages: { cpp: { code: ["vector<int> topKFrequent(vector<int>& nums, int k) {","    unordered_map<int,int> count;","    for (int x : nums) count[x]++;","    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> heap;","    for (auto& [num, c] : count) {","        heap.push({c, num});","        if (heap.size() > k) heap.pop();","    }","    vector<int> res;","    while (!heap.empty()) { res.push_back(heap.top().second); heap.pop(); }","    return res;","}"], lineMap: { init: 2, count_loop: 3, count_done: 3, heap_push: 6, heap_pop: 7, extract: 10, done: 11 } }, java: { code: ["public int[] topKFrequent(int[] nums, int k) {","    Map<Integer, Integer> count = new HashMap<>();","    for (int x : nums) count.merge(x, 1, Integer::sum);","    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[1] - b[1]);","    for (Map.Entry<Integer,Integer> e : count.entrySet()) {","        heap.offer(new int[]{e.getKey(), e.getValue()});","        if (heap.size() > k) heap.poll();","    }","    int[] res = new int[k];","    for (int i = 0; i < k; i++) res[i] = heap.poll()[0];","    return res;","}"], lineMap: { init: 2, count_loop: 3, count_done: 3, heap_push: 6, heap_pop: 7, extract: 10, done: 11 } }, javascript: { code: ["function topKFrequent(nums, k) {","  const count = {};","  for (const x of nums) count[x] = (count[x]||0) + 1;","  const heap = [];","  const push = (freq, num) => {","    heap.push({ freq, num });","    let i = heap.length - 1;","    while (i > 0) {","      const p = (i - 1) >> 1;","      if (heap[p].freq <= heap[i].freq) break;","      [heap[p], heap[i]] = [heap[i], heap[p]]; i = p;","    }","  };","  const pop = () => {","    const top = heap[0];","    heap[0] = heap[heap.length - 1]; heap.pop();","    let i = 0;","    while (true) {","      const l = 2*i+1, r = 2*i+2;","      let s = i;","      if (l < heap.length && heap[l].freq < heap[s].freq) s = l;","      if (r < heap.length && heap[r].freq < heap[s].freq) s = r;","      if (s === i) break;","      [heap[i], heap[s]] = [heap[s], heap[i]]; i = s;","    }","    return top;","  };","  for (const [num, freq] of Object.entries(count)) {","    push(+freq, +num);","    if (heap.length > k) pop();","  }","  return heap.map(x => x.num);","}"], lineMap: { init: 2, count_loop: 3, count_done: 3, heap_push: 21, heap_pop: 22, extract: 24, done: 24 } }, python: { code: ["def top_k_frequent(nums, k):","    from collections import Counter","    import heapq","    count = Counter(nums)","    heap = []","    for num, c in count.items():","        heapq.heappush(heap, (c, num))","        if len(heap) > k:","            heapq.heappop(heap)","    return [num for _, num in heap]"], lineMap: { init: 2, count_loop: 3, count_done: 3, heap_push: 6, heap_pop: 8, extract: 9, done: 9 } } } },
  "subsets": { title: "Subsets", difficulty: "Medium", category: "Backtracking", timeComplexity: "O(2^n)", spaceComplexity: "O(n)", visualizer: "array", description: "Return all possible subsets (power set) of <code>nums</code>.", example: { input: "nums = [1,2,3]", output: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]", note: "Backtrack: include or exclude each element." }, defaultInput: { nums: [1, 2, 3] }, inputFields: ["nums"], explanation: [{ emoji: "🔙", title: "Backtrack", body: "For each index, either include nums[i] or not; recurse; backtrack." }], languages: { cpp: { code: ["void backtrack(vector<int>& nums, int i, vector<int>& path, vector<vector<int>>& res) {","    res.push_back(path);","    for (int j = i; j < nums.size(); j++) {","        path.push_back(nums[j]);","        backtrack(nums, j+1, path, res);","        path.pop_back();","    }","}","vector<vector<int>> subsets(vector<int>& nums) {","    vector<vector<int>> res; vector<int> path;","    backtrack(nums, 0, path, res);","    return res;","}"], lineMap: { init: 1, done: 9 } }, java: { code: ["void backtrack(int[] nums, int i, List<Integer> path, List<List<Integer>> res) {","    res.add(new ArrayList<>(path));","    for (int j = i; j < nums.length; j++) {","        path.add(nums[j]); backtrack(nums, j+1, path, res); path.remove(path.size()-1);","    }","}","public List<List<Integer>> subsets(int[] nums) {","    List<List<Integer>> res = new ArrayList<>();","    backtrack(nums, 0, new ArrayList<>(), res);","    return res;","}"], lineMap: { init: 1, done: 8 } }, javascript: { code: ["function backtrack(nums, i, path, res) {","  res.push([...path]);","  for (let j = i; j < nums.length; j++) {","    path.push(nums[j]); backtrack(nums, j+1, path, res); path.pop();","  }","}","function subsets(nums) {","  const res = [];","  backtrack(nums, 0, [], res);","  return res;","}"], lineMap: { init: 1, done: 8 } }, python: { code: ["def backtrack(nums, i, path, res):","    res.append(path[:])","    for j in range(i, len(nums)):","        path.append(nums[j]); backtrack(nums, j+1, path, res); path.pop()","def subsets(nums):","    res = []; backtrack(nums, 0, [], res)","    return res"], lineMap: { init: 1, done: 7 } } } },
  "permutations": { title: "Permutations", difficulty: "Medium", category: "Backtracking", timeComplexity: "O(n!)", spaceComplexity: "O(n)", visualizer: "array", description: "Return all permutations of <code>nums</code>.", example: { input: "nums = [1,2,3]", output: "[[1,2,3],[1,3,2],...]", note: "Swap and recurse; backtrack." }, defaultInput: { nums: [1, 2, 3] }, inputFields: ["nums"], explanation: [{ emoji: "🔙", title: "Backtrack", body: "Fix one element at a time; swap; recurse; swap back." }], languages: { cpp: { code: ["void backtrack(vector<int>& nums, int start, vector<vector<int>>& res) {","    if (start == nums.size()) { res.push_back(nums); return; }","    for (int i = start; i < nums.size(); i++) {","        swap(nums[start], nums[i]);","        backtrack(nums, start+1, res);","        swap(nums[start], nums[i]);","    }","}","vector<vector<int>> permute(vector<int>& nums) {","    vector<vector<int>> res;","    backtrack(nums, 0, res);","    return res;","}"], lineMap: { init: 1, done: 9 } }, java: { code: ["void backtrack(List<Integer> nums, int start, List<List<Integer>> res) {","    if (start == nums.size()) { res.add(new ArrayList<>(nums)); return; }","    for (int i = start; i < nums.size(); i++) {","        Collections.swap(nums, start, i);","        backtrack(nums, start+1, res);","        Collections.swap(nums, start, i);","    }","}","public List<List<Integer>> permute(int[] nums) {","    List<List<Integer>> res = new ArrayList<>();","    List<Integer> list = new ArrayList<>(); for (int x : nums) list.add(x);","    backtrack(list, 0, res);","    return res;","}"], lineMap: { init: 1, done: 11 } }, javascript: { code: ["function backtrack(nums, start, res) {","  if (start === nums.length) { res.push([...nums]); return; }","  for (let i = start; i < nums.length; i++) {","    [nums[start], nums[i]] = [nums[i], nums[start]];","    backtrack(nums, start+1, res);","    [nums[start], nums[i]] = [nums[i], nums[start]];","  }","}","function permute(nums) {","  const res = [];","  backtrack(nums, 0, res);","  return res;","}"], lineMap: { init: 1, done: 9 } }, python: { code: ["def backtrack(nums, start, res):","    if start == len(nums): res.append(nums[:]); return","    for i in range(start, len(nums)):","        nums[start], nums[i] = nums[i], nums[start]","        backtrack(nums, start+1, res)","        nums[start], nums[i] = nums[i], nums[start]","def permute(nums):","    res = []; backtrack(nums, 0, res)","    return res"], lineMap: { init: 1, done: 8 } } } },
  "min-stack": { title: "Min Stack", difficulty: "Medium", category: "Stack", timeComplexity: "O(1) per op", spaceComplexity: "O(n)", visualizer: "minstack", description: "Design a stack that supports push, pop, top, and getMin in O(1).", example: { input: "push -2, push 0, push -3, getMin, pop, top, getMin", output: "-3, 0, -2", note: "Aux stack or store min with each value." }, defaultInput: { nums: [1, 2, 3] }, inputFields: ["nums"], explanation: [{ emoji: "📚", title: "Two stacks or paired", body: "Keep a parallel stack of minimums, or store (val, minSoFar) in each node." }], languages: { cpp: { code: ["class MinStack {","    stack<int> st, minSt;","public:","    void push(int val) { st.push(val); minSt.push(minSt.empty() ? val : min(minSt.top(), val)); }","    void pop() { st.pop(); minSt.pop(); }","    int top() { return st.top(); }","    int getMin() { return minSt.top(); }","};"], lineMap: { init: 1, push: 4, pop: 5, top: 6, getMin: 7, done: 8 } }, java: { code: ["class MinStack {","    Deque<Integer> st = new ArrayDeque<>();","    Deque<Integer> minSt = new ArrayDeque<>();","    public void push(int val) { st.push(val); minSt.push(minSt.isEmpty() ? val : Math.min(minSt.peek(), val)); }","    public void pop() { st.pop(); minSt.pop(); }","    public int top() { return st.peek(); }","    public int getMin() { return minSt.peek(); }","}"], lineMap: { init: 1, push: 4, pop: 5, top: 6, getMin: 7, done: 8 } }, javascript: { code: ["class MinStack {","  constructor() { this.st = []; this.minSt = []; }","  push(val) { this.st.push(val); this.minSt.push(this.minSt.length ? Math.min(this.minSt[this.minSt.length-1], val) : val); }","  pop() { this.st.pop(); this.minSt.pop(); }","  top() { return this.st[this.st.length-1]; }","  getMin() { return this.minSt[this.minSt.length-1]; }","}"], lineMap: { init: 1, push: 3, pop: 4, top: 5, getMin: 6, done: 7 } }, python: { code: ["class MinStack:","    def __init__(self): self.st = []; self.min_st = []","    def push(self, val): self.st.append(val); self.min_st.append(min(self.min_st[-1], val) if self.min_st else val)","    def pop(self): self.st.pop(); self.min_st.pop()","    def top(self): return self.st[-1]","    def getMin(self): return self.min_st[-1]"], lineMap: { init: 1, push: 3, pop: 4, top: 5, getMin: 6, done: 6 } } } },
  "eval-rpn": { title: "Evaluate Reverse Polish Notation", difficulty: "Medium", category: "Stack", timeComplexity: "O(n)", spaceComplexity: "O(n)", visualizer: "rpn", description: "Evaluate expression given as RPN (postfix) tokens: numbers and +, -, *, /.", example: { input: "tokens = [\"2\",\"1\",\"+\",\"3\",\"*\"]", output: "9", note: "Stack: push numbers; on op pop two, compute, push result." }, defaultInput: { s: "2,1,+,3,*" }, inputFields: ["s"], explanation: [{ emoji: "📚", title: "Stack", body: "Push numbers; on operator pop two, apply, push result." }], languages: { cpp: { code: ["int evalRPN(vector<string>& tokens) {","    stack<int> st;","    for (auto& t : tokens) {","        if (t == \"+\" || t == \"-\" || t == \"*\" || t == \"/\") {","            int b = st.top(); st.pop(); int a = st.top(); st.pop();","            if (t == \"+\") st.push(a+b); else if (t == \"-\") st.push(a-b); else if (t == \"*\") st.push(a*b); else st.push(a/b);","        } else st.push(stoi(t));","    }","    return st.top();","}"], lineMap: { init: 2, push: 3, op: 5, done: 9 } }, java: { code: ["public int evalRPN(String[] tokens) {","    Deque<Integer> st = new ArrayDeque<>();","    for (String t : tokens) {","        if (\"+*-/\".contains(t)) {","            int b = st.pop(), a = st.pop();","            if (t.equals(\"+\")) st.push(a+b); else if (t.equals(\"-\")) st.push(a-b); else if (t.equals(\"*\")) st.push(a*b); else st.push(a/b);","        } else st.push(Integer.parseInt(t));","    }","    return st.pop();","}"], lineMap: { init: 2, push: 3, op: 5, done: 9 } }, javascript: { code: ["function evalRPN(tokens) {","  const st = [];","  for (const t of tokens) {","    if (['+','-','*','/'].includes(t)) {","      const b = st.pop(), a = st.pop();","      if (t === '+') st.push(a+b); else if (t === '-') st.push(a-b); else if (t === '*') st.push(a*b); else st.push((a/b)|0);","    } else st.push(Number(t));","  }","  return st.pop();","}"], lineMap: { init: 2, push: 3, op: 5, done: 9 } }, python: { code: ["def eval_rpn(tokens):","    st = []","    for t in tokens:","        if t in '+-*/':","            b, a = st.pop(), st.pop()","            st.append(int(eval(f'a{t}b')))","        else: st.append(int(t))","    return st[-1]"], lineMap: { init: 2, push: 3, op: 5, done: 7 } } } },
  "generate-parentheses": { title: "Generate Parentheses", difficulty: "Medium", category: "Backtracking", timeComplexity: "O(4^n / sqrt(n))", spaceComplexity: "O(n)", visualizer: "genparentheses", description: "Given n pairs of parentheses, generate all valid combinations.", example: { input: "n = 3", output: "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]", note: "Backtrack: add ( when open < n; add ) when close < open." }, defaultInput: { n: 3 }, inputFields: ["n"], explanation: [{ emoji: "🔙", title: "Backtrack", body: "Only add ) if close < open; only add ( if open < n." }], languages: { cpp: { code: ["void backtrack(int n, int open, int close, string path, vector<string>& res) {","    if (path.size() == 2*n) { res.push_back(path); return; }","    if (open < n) backtrack(n, open+1, close, path + '(', res);","    if (close < open) backtrack(n, open, close+1, path + ')', res);","}","vector<string> generateParenthesis(int n) {","    vector<string> res;","    backtrack(n, 0, 0, \"\", res);","    return res;","}"], lineMap: { init: 8, complete: 2, add_open: 3, add_close: 4, done: 9 } }, java: { code: ["void backtrack(int n, int open, int close, StringBuilder path, List<String> res) {","    if (path.length() == 2*n) { res.add(path.toString()); return; }","    if (open < n) { path.append('('); backtrack(n, open+1, close, path, res); path.setLength(path.length()-1); }","    if (close < open) { path.append(')'); backtrack(n, open, close+1, path, res); path.setLength(path.length()-1); }","}","public List<String> generateParenthesis(int n) {","    List<String> res = new ArrayList<>();","    backtrack(n, 0, 0, new StringBuilder(), res);","    return res;","}"], lineMap: { init: 8, complete: 2, add_open: 3, add_close: 4, done: 9 } }, javascript: { code: ["function backtrack(n, open, close, path, res) {","  if (path.length === 2*n) { res.push(path); return; }","  if (open < n) backtrack(n, open+1, close, path+'(', res);","  if (close < open) backtrack(n, open, close+1, path+')', res);","}","function generateParenthesis(n) {","  const res = [];","  backtrack(n, 0, 0, '', res);","  return res;","}"], lineMap: { init: 8, complete: 2, add_open: 3, add_close: 4, done: 9 } }, python: { code: ["def backtrack(n, open, close, path, res):","    if len(path) == 2*n: res.append(path); return","    if open < n: backtrack(n, open+1, close, path+'(', res)","    if close < open: backtrack(n, open, close+1, path+')', res)","def generate_parenthesis(n):","    res = []; backtrack(n, 0, 0, '', res)","    return res"], lineMap: { init: 6, complete: 2, add_open: 3, add_close: 4, done: 7 } } } },
  "trapping-rain-water": { title: "Trapping Rain Water", difficulty: "Hard", category: "Two Pointers", timeComplexity: "O(n)", spaceComplexity: "O(1)", visualizer: "array", description: "Given elevation map <code>height</code>, compute how much rain water can be trapped.", example: { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", note: "Two pointers or prefix max arrays." }, defaultInput: { nums: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, inputFields: ["nums"], explanation: [{ emoji: "👆", title: "Two pointers", body: "leftMax and rightMax; at each index add max(0, min(leftMax, rightMax) - height[i])." }], languages: { cpp: { code: ["int trap(vector<int>& height) {","    int l = 0, r = height.size() - 1;","    int leftMax = 0, rightMax = 0, water = 0;","    while (l < r) {","        if (height[l] <= height[r]) {","            if (height[l] >= leftMax) leftMax = height[l];","            else water += leftMax - height[l];","            l++;","        } else {","            if (height[r] >= rightMax) rightMax = height[r];","            else water += rightMax - height[r];","            r--;","        }","    }","    return water;","}"], lineMap: { init: 1, done: 14 } }, java: { code: ["public int trap(int[] height) {","    int l = 0, r = height.length - 1;","    int leftMax = 0, rightMax = 0, water = 0;","    while (l < r) {","        if (height[l] <= height[r]) {","            if (height[l] >= leftMax) leftMax = height[l];","            else water += leftMax - height[l];","            l++;","        } else {","            if (height[r] >= rightMax) rightMax = height[r];","            else water += rightMax - height[r];","            r--;","        }","    }","    return water;","}"], lineMap: { init: 1, done: 14 } }, javascript: { code: ["function trap(height) {","  let l = 0, r = height.length - 1;","  let leftMax = 0, rightMax = 0, water = 0;","  while (l < r) {","    if (height[l] <= height[r]) {","      if (height[l] >= leftMax) leftMax = height[l];","      else water += leftMax - height[l];","      l++;","    } else {","      if (height[r] >= rightMax) rightMax = height[r];","      else water += rightMax - height[r];","      r--;","    }","  }","  return water;","}"], lineMap: { init: 1, done: 14 } }, python: { code: ["def trap(height):","    l, r = 0, len(height)-1","    left_max = right_max = water = 0","    while l < r:","        if height[l] <= height[r]:","            if height[l] >= left_max: left_max = height[l]","            else: water += left_max - height[l]","            l += 1","        else:","            if height[r] >= right_max: right_max = height[r]","            else: water += right_max - height[r]","            r -= 1","    return water"], lineMap: { init: 1, done: 13 } } } },
};

// ── Problem list for browse/search ───────────────────────────────────────
export const PROB_LIST = [
  { id: "two-sum",             title: "Two Sum",                       difficulty: "Easy",   category: "Arrays",              desc: "Find two indices that sum to a target using a hash map.",       tags: ["hash-map", "arrays", "two-pointers"] },
  { id: "longest-consecutive", title: "Longest Consecutive Sequence",  difficulty: "Medium", category: "Arrays",              desc: "Find the longest run of consecutive integers in O(n).",         tags: ["hash-set", "arrays", "sequences"] },
  { id: "contains-duplicate",  title: "Contains Duplicate",            difficulty: "Easy",   category: "Arrays",              desc: "Detect if any value appears more than once.",                   tags: ["hash-set", "arrays"] },
  { id: "valid-anagram",       title: "Valid Anagram",                 difficulty: "Easy",   category: "Arrays",              desc: "Check if two strings have identical character frequencies.",    tags: ["hash-map", "arrays", "strings"] },
  { id: "best-time-stock",     title: "Best Time to Buy & Sell Stock", difficulty: "Easy",   category: "Sliding Window",      desc: "Maximize profit with one buy and one sell.",                    tags: ["sliding-window", "greedy", "arrays"] },
  { id: "binary-search",       title: "Binary Search",                 difficulty: "Easy",   category: "Binary Search",       desc: "Search a sorted array in O(log n) time.",                       tags: ["binary-search", "arrays", "two-pointers"] },
  { id: "climbing-stairs",     title: "Climbing Stairs",               difficulty: "Easy",   category: "Dynamic Programming", desc: "Count ways to climb n steps taking 1 or 2 at a time.",          tags: ["dynamic-programming", "fibonacci", "math"] },
  { id: "max-subarray",        title: "Maximum Subarray (Kadane)",      difficulty: "Medium", category: "Arrays",              desc: "Find the contiguous subarray with the largest sum.",           tags: ["arrays", "dynamic-programming", "kadane"] },
  { id: "subtree-of-another-tree", title: "Subtree of Another Tree",     difficulty: "Easy",   category: "Trees",               desc: "Check if subRoot has the same structure and values as a subtree of root.", tags: ["trees", "dfs", "binary-tree", "recursion"] },
  { id: "valid-palindrome",      title: "Valid Palindrome",               difficulty: "Easy",   category: "Two Pointers",        desc: "Check if a string is a palindrome after removing non-alphanumeric characters.", tags: ["two-pointers", "strings"] },
  { id: "valid-parentheses",     title: "Valid Parentheses",              difficulty: "Easy",   category: "Stack",               desc: "Determine if brackets are properly opened and closed using a stack.", tags: ["stack", "strings"] },
  { id: "product-except-self",   title: "Product of Array Except Self",   difficulty: "Medium", category: "Arrays",              desc: "Build product array without division using prefix and suffix products.", tags: ["arrays", "prefix-sum"] },
  { id: "max-product-subarray",  title: "Maximum Product Subarray",       difficulty: "Medium", category: "Dynamic Programming", desc: "Find the contiguous subarray with the largest product.", tags: ["dynamic-programming", "arrays"] },
  { id: "house-robber",          title: "House Robber",                   difficulty: "Medium", category: "Dynamic Programming", desc: "Maximize robbery loot without hitting adjacent houses.", tags: ["dynamic-programming", "arrays"] },
  { id: "missing-number",        title: "Missing Number",                 difficulty: "Easy",   category: "Arrays",              desc: "Find the missing number in range [0, n] using Gauss formula.", tags: ["arrays", "math"] },
  { id: "max-depth-tree",        title: "Maximum Depth of Binary Tree",   difficulty: "Easy",   category: "Trees",               desc: "Find the longest root-to-leaf path in a binary tree.", tags: ["trees", "dfs", "recursion"] },
  { id: "invert-tree",           title: "Invert Binary Tree",             difficulty: "Easy",   category: "Trees",               desc: "Mirror a binary tree by swapping left and right children.", tags: ["trees", "dfs", "recursion"] },
  { id: "same-tree",             title: "Same Tree",                      difficulty: "Easy",   category: "Trees",               desc: "Check if two binary trees are structurally identical with same values.", tags: ["trees", "dfs", "recursion"] },
  { id: "reverse-linked-list",   title: "Reverse Linked List",            difficulty: "Easy",   category: "Linked Lists",        desc: "Reverse a singly linked list using three pointers.", tags: ["linked-lists", "pointers"] },
  { id: "three-sum",             title: "3Sum",                           difficulty: "Medium", category: "Two Pointers",        desc: "Find all unique triplets that sum to zero using sort and two pointers.", tags: ["two-pointers", "arrays", "sorting"] },
  { id: "container-most-water",  title: "Container With Most Water",      difficulty: "Medium", category: "Two Pointers",        desc: "Maximize area between two vertical lines with two pointers.", tags: ["two-pointers", "arrays", "greedy"] },
  { id: "merge-two-sorted-lists", title: "Merge Two Sorted Lists",        difficulty: "Easy",   category: "Linked Lists",        desc: "Merge two sorted linked lists into one sorted list.", tags: ["linked-lists", "two-pointers"] },
  { id: "merge-intervals",       title: "Merge Intervals",                 difficulty: "Medium", category: "Intervals",           desc: "Merge all overlapping intervals after sorting by start.", tags: ["intervals", "sorting", "arrays"] },
  { id: "linked-list-cycle",     title: "Linked List Cycle",               difficulty: "Easy",   category: "Linked Lists",        desc: "Detect cycle in linked list using tortoise and hare.", tags: ["linked-lists", "two-pointers", "cycle"] },
  { id: "number-of-islands",    title: "Number of Islands",               difficulty: "Medium", category: "Graphs",              desc: "Count islands in a 2D grid using DFS or BFS.", tags: ["graphs", "dfs", "bfs", "grid"] },
  { id: "max-area-of-island",   title: "Max Area of Island",              difficulty: "Medium", category: "Graphs",              desc: "Find the largest island by area in a 2D grid.", tags: ["graphs", "dfs", "bfs", "grid"] },
  { id: "min-rotated-sorted",   title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search", desc: "Find minimum in a rotated sorted array with binary search.", tags: ["binary-search", "arrays"] },
  { id: "search-rotated-sorted", title: "Search in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search", desc: "Search target in rotated sorted array in O(log n).", tags: ["binary-search", "arrays"] },
  { id: "sum-two-integers",     title: "Sum of Two Integers",            difficulty: "Medium", category: "Bit Manipulation",    desc: "Add two integers without + or - using bits.", tags: ["bit-manipulation"] },
  { id: "number-of-1-bits",     title: "Number of 1 Bits",                difficulty: "Easy",   category: "Bit Manipulation",    desc: "Count set bits (Hamming weight).", tags: ["bit-manipulation"] },
  { id: "counting-bits",        title: "Counting Bits",                   difficulty: "Easy",   category: "Bit Manipulation",    desc: "Return array of popcount for 0..n.", tags: ["bit-manipulation", "dp"] },
  { id: "reverse-bits",         title: "Reverse Bits",                    difficulty: "Easy",   category: "Bit Manipulation",    desc: "Reverse bits of a 32-bit integer.", tags: ["bit-manipulation"] },
  { id: "coin-change",          title: "Coin Change",                     difficulty: "Medium", category: "Dynamic Programming", desc: "Fewest coins to make amount.", tags: ["dynamic-programming", "arrays"] },
  { id: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", difficulty: "Medium", category: "Dynamic Programming", desc: "Length of longest strictly increasing subsequence.", tags: ["dynamic-programming", "binary-search"] },
  { id: "longest-common-subsequence", title: "Longest Common Subsequence", difficulty: "Medium", category: "Dynamic Programming", desc: "LCS length of two strings.", tags: ["dynamic-programming", "strings"] },
  { id: "word-break",           title: "Word Break",                      difficulty: "Medium", category: "Dynamic Programming", desc: "Can string be segmented into dictionary words?", tags: ["dynamic-programming", "strings"] },
  { id: "combination-sum",      title: "Combination Sum",                 difficulty: "Medium", category: "Dynamic Programming", desc: "All combinations that sum to target (reuse allowed).", tags: ["backtracking", "arrays"] },
  { id: "house-robber-ii",      title: "House Robber II",                 difficulty: "Medium", category: "Dynamic Programming", desc: "House Robber with circular street.", tags: ["dynamic-programming", "arrays"] },
  { id: "decode-ways",          title: "Decode Ways",                     difficulty: "Medium", category: "Dynamic Programming", desc: "Number of ways to decode a digit string.", tags: ["dynamic-programming", "strings"] },
  { id: "unique-paths",         title: "Unique Paths",                     difficulty: "Medium", category: "Dynamic Programming", desc: "Number of paths from top-left to bottom-right.", tags: ["dynamic-programming"] },
  { id: "jump-game",            title: "Jump Game",                       difficulty: "Medium", category: "Dynamic Programming", desc: "Can you reach the last index?", tags: ["greedy", "arrays"] },
  { id: "insert-interval",      title: "Insert Interval",                 difficulty: "Medium", category: "Intervals",           desc: "Insert and merge a new interval.", tags: ["intervals", "arrays"] },
  { id: "non-overlapping-intervals", title: "Non-overlapping Intervals", difficulty: "Medium", category: "Intervals",           desc: "Minimum intervals to remove for no overlap.", tags: ["intervals", "greedy"] },
  { id: "meeting-rooms",        title: "Meeting Rooms",                   difficulty: "Easy",   category: "Intervals",           desc: "Can one attend all meetings?", tags: ["intervals"] },
  { id: "meeting-rooms-ii",     title: "Meeting Rooms II",                difficulty: "Medium", category: "Intervals",           desc: "Minimum conference rooms needed.", tags: ["intervals", "heap"] },
  { id: "merge-k-sorted-lists", title: "Merge K Sorted Lists",            difficulty: "Hard",   category: "Linked Lists",        desc: "Merge k sorted linked lists.", tags: ["linked-lists", "heap"] },
  { id: "remove-nth-node",      title: "Remove Nth Node From End of List", difficulty: "Medium", category: "Linked Lists",        desc: "Remove the nth node from the end.", tags: ["linked-lists", "two-pointers"] },
  { id: "reorder-list",        title: "Reorder List",                     difficulty: "Medium", category: "Linked Lists",        desc: "L0→Ln→L1→Ln-1→…", tags: ["linked-lists"] },
  { id: "copy-list-random-pointer", title: "Copy List with Random Pointer", difficulty: "Medium", category: "Linked Lists",        desc: "Deep copy list with random pointer.", tags: ["linked-lists"] },
  { id: "clone-graph",          title: "Clone Graph",                     difficulty: "Medium", category: "Graphs",              desc: "Deep copy of an undirected graph.", tags: ["graphs", "bfs", "dfs"] },
  { id: "course-schedule",      title: "Course Schedule",                 difficulty: "Medium", category: "Graphs",              desc: "Can you finish all courses? (DAG cycle detection).", tags: ["graphs", "topological-sort"] },
  { id: "pacific-atlantic",     title: "Pacific Atlantic Water Flow",    difficulty: "Medium", category: "Graphs",              desc: "Cells that can flow to both oceans.", tags: ["graphs", "dfs", "grid"] },
  { id: "num-connected-components", title: "Number of Connected Components", difficulty: "Medium", category: "Graphs",              desc: "Count connected components in undirected graph.", tags: ["graphs", "dfs", "union-find"] },
  { id: "graph-valid-tree",     title: "Graph Valid Tree",                difficulty: "Medium", category: "Graphs",              desc: "Is the graph a valid tree?", tags: ["graphs", "dfs"] },
  { id: "group-anagrams",       title: "Group Anagrams",                  difficulty: "Medium", category: "Strings",             desc: "Group strings that are anagrams.", tags: ["hash-map", "strings"] },
  { id: "longest-substring-no-repeat", title: "Longest Substring Without Repeating", difficulty: "Medium", category: "Sliding Window", desc: "Length of longest substring with unique chars.", tags: ["sliding-window", "strings"] },
  { id: "longest-palindromic-substring", title: "Longest Palindromic Substring", difficulty: "Medium", category: "Strings",             desc: "Longest palindromic substring.", tags: ["strings", "expand"] },
  { id: "top-k-frequent",       title: "Top K Frequent Elements",         difficulty: "Medium", category: "Arrays",              desc: "Return k most frequent elements.", tags: ["hash-map", "bucket-sort", "arrays"] },
  { id: "subsets",              title: "Subsets",                         difficulty: "Medium", category: "Backtracking",        desc: "All subsets (power set).", tags: ["backtracking", "arrays"] },
  { id: "permutations",         title: "Permutations",                    difficulty: "Medium", category: "Backtracking",        desc: "All permutations of array.", tags: ["backtracking", "arrays"] },
  { id: "min-stack",            title: "Min Stack",                       difficulty: "Medium", category: "Stack",               desc: "Stack with O(1) getMin.", tags: ["stack", "design"] },
  { id: "eval-rpn",             title: "Evaluate Reverse Polish Notation", difficulty: "Medium", category: "Stack",               desc: "Evaluate postfix expression.", tags: ["stack"] },
  { id: "generate-parentheses", title: "Generate Parentheses",           difficulty: "Medium", category: "Backtracking",        desc: "All valid n pairs of parentheses.", tags: ["backtracking"] },
  { id: "trapping-rain-water",   title: "Trapping Rain Water",            difficulty: "Hard",   category: "Two Pointers",        desc: "Amount of rain water that can be trapped.", tags: ["two-pointers", "arrays"] },
];

export function getSimilar(currentId, max = 3) {
  const current = PROB_LIST.find(p => p.id === currentId);
  if (!current) return [];
  const score = p => {
    if (p.id === currentId) return -1;
    let s = 0;
    if (p.category === current.category) s += 3;
    current.tags.forEach(tag => { if (p.tags.includes(tag)) s += 1; });
    return s;
  };
  return PROB_LIST
    .filter(p => p.id !== currentId && score(p) > 0)
    .sort((a, b) => score(b) - score(a))
    .slice(0, max);
}
