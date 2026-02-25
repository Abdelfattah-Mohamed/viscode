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
