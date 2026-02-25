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
