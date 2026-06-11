/** Nine Blind 75 problems missing from the core catalog. */

export const BLIND75_MISSING_ORDER = [
  "minimum-window-substring",
  "binary-tree-level-order-traversal",
  "validate-binary-search-tree",
  "kth-smallest-element-in-a-bst",
  "construct-binary-tree-from-preorder-and-inorder-traversal",
  "binary-tree-maximum-path-sum",
  "implement-trie-prefix-tree",
  "design-add-and-search-words-data-structure",
  "word-search-ii",
];

export const BLIND75_MISSING_PROBLEMS = {
  "minimum-window-substring": {
    title: "Minimum Window Substring",
    difficulty: "Hard",
    category: "Sliding Window",
    timeComplexity: "O(|s|+|t|)",
    spaceComplexity: "O(|s|+|t|)",
    visualizer: "minwindow",
    description: "Given strings <code>s</code> and <code>t</code>, return the <strong>minimum window substring</strong> of <code>s</code> such that every character in <code>t</code> (including duplicates) is included.",
    example: { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', note: "The minimum window substring \"BANC\" includes 'A', 'B', and 'C' from t." },
    defaultInput: { s: "ADOBECODEBANC", t: "ABC" },
    inputFields: ["s", "t"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "Check every substring of s — for each [l,r], count whether it contains all chars of t. O(n²) substrings × O(|t|) check = O(n²|t|). Too slow for large inputs." },
      { emoji: "💡", title: "The Key Insight", body: "Use a sliding window [l,r]. Track how many required chars are satisfied (formed). Expand r to include chars; when the window is valid, shrink l to minimize length while staying valid." },
      { emoji: "👣", title: "Step by Step", body: "1. Build need map from t and count unique required chars.\n2. Expand r: add s[r] to have; if have[ch] reaches need[ch], increment formed.\n3. While formed == required: update best window if shorter; remove s[l] and shrink l.\n4. Return the best substring, or \"\" if none." },
      { emoji: "⚡", title: "Why It's O(|s|+|t|)", body: "Each pointer moves at most |s| times. Map operations are O(1). Building need is O(|t|)." },
    ],
    languages: {
      cpp: {
        code: ["string minWindow(string s, string t) {","    unordered_map<char,int> need, have;","    for (char c : t) need[c]++;","    int formed = 0, required = need.size();","    int l = 0, bestLen = INT_MAX, bestL = 0;","    for (int r = 0; r < s.size(); r++) {","        have[s[r]]++;","        if (need.count(s[r]) && have[s[r]] == need[s[r]]) formed++;","        while (l <= r && formed == required) {","            if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }","            have[s[l]]--;","            if (need.count(s[l]) && have[s[l]] < need[s[l]]) formed--;","            l++;","        }","    }","    return bestLen == INT_MAX ? \"\" : s.substr(bestL, bestLen);","}"],
        lineMap: { init: 2, add_right: 7, update_best: 10, shrink: 12, done: 17 },
      },
      java: {
        code: ["public String minWindow(String s, String t) {","    Map<Character,Integer> need = new HashMap<>(), have = new HashMap<>();","    for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);","    int formed = 0, required = need.size();","    int l = 0, bestLen = Integer.MAX_VALUE, bestL = 0;","    for (int r = 0; r < s.length(); r++) {","        char ch = s.charAt(r);","        have.merge(ch, 1, Integer::sum);","        if (need.containsKey(ch) && have.get(ch).equals(need.get(ch))) formed++;","        while (l <= r && formed == required) {","            if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }","            char left = s.charAt(l);","            have.merge(left, -1, Integer::sum);","            if (need.containsKey(left) && have.get(left) < need.get(left)) formed--;","            l++;","        }","    }","    return bestLen == Integer.MAX_VALUE ? \"\" : s.substring(bestL, bestL + bestLen);","}"],
        lineMap: { init: 2, add_right: 8, update_best: 11, shrink: 13, done: 18 },
      },
      javascript: {
        code: ["function minWindow(s, t) {","  const need = {};","  for (const ch of t) need[ch] = (need[ch] || 0) + 1;","  const have = {};","  let formed = 0;","  const required = Object.keys(need).length;","  let l = 0, bestLen = Infinity, bestL = 0;","  for (let r = 0; r < s.length; r++) {","    const ch = s[r];","    have[ch] = (have[ch] || 0) + 1;","    if (need[ch] && have[ch] === need[ch]) formed++;","    while (l <= r && formed === required) {","      if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }","      const leftCh = s[l];","      have[leftCh]--;","      if (need[leftCh] && have[leftCh] < need[leftCh]) formed--;","      l++;","    }","  }","  return bestLen === Infinity ? \"\" : s.slice(bestL, bestL + bestLen);","}"],
        lineMap: { init: 2, add_right: 10, update_best: 13, shrink: 15, done: 20 },
      },
      python: {
        code: ["def min_window(s, t):","    from collections import Counter","    need = Counter(t)","    have = Counter()","    formed, required = 0, len(need)","    l, best_len, best_l = 0, float('inf'), 0","    for r, ch in enumerate(s):","        have[ch] += 1","        if need[ch] and have[ch] == need[ch]: formed += 1","        while l <= r and formed == required:","            if r - l + 1 < best_len: best_len, best_l = r - l + 1, l","            left = s[l]","            have[left] -= 1","            if need[left] and have[left] < need[left]: formed -= 1","            l += 1","    return '' if best_len == float('inf') else s[best_l:best_l + best_len]"],
        lineMap: { init: 2, add_right: 8, update_best: 11, shrink: 13, done: 16 },
      },
    },
  },

  "binary-tree-level-order-traversal": {
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    category: "Trees",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    visualizer: "treealgo",
    description: "Given the <code>root</code> of a binary tree, return the <strong>level-order traversal</strong> of its nodes' values (i.e., from left to right, level by level).",
    example: { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]", note: "Process nodes level by level with a queue." },
    defaultInput: { root: [3, 9, 20, null, null, 15, 7] },
    inputFields: ["root"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "DFS with a depth map groups nodes by level, then sort each level — works but BFS with a queue is the natural O(n) approach." },
      { emoji: "💡", title: "The Key Insight", body: "BFS explores nodes in discovery order. Snapshot the queue size at each level to process exactly one level per iteration." },
      { emoji: "👣", title: "Step by Step", body: "1. If root is null, return [].\n2. Queue = [root]. While queue not empty:\n3. levelSize = queue.length; drain levelSize nodes, push values to current level.\n4. Enqueue each node's left and right children.\n5. Append current level to result." },
      { emoji: "⚡", title: "Why It's O(n)", body: "Each node is enqueued and dequeued once. Result stores all n values — O(n) time and space." },
    ],
    languages: {
      cpp: {
        code: ["vector<vector<int>> levelOrder(TreeNode* root) {","    vector<vector<int>> res;","    if (!root) return res;","    queue<TreeNode*> q; q.push(root);","    while (!q.empty()) {","        int size = q.size();","        vector<int> level;","        for (int i = 0; i < size; i++) {","            TreeNode* node = q.front(); q.pop();","            level.push_back(node->val);","            if (node->left) q.push(node->left);","            if (node->right) q.push(node->right);","        }","        res.push_back(level);","    }","    return res;","}"],
        lineMap: { init: 4, level_start: 5, dequeue: 9, enqueue: 11, level_done: 14, done: 16 },
      },
      java: {
        code: ["public List<List<Integer>> levelOrder(TreeNode root) {","    List<List<Integer>> res = new ArrayList<>();","    if (root == null) return res;","    Queue<TreeNode> q = new LinkedList<>(); q.add(root);","    while (!q.isEmpty()) {","        int size = q.size();","        List<Integer> level = new ArrayList<>();","        for (int i = 0; i < size; i++) {","            TreeNode node = q.poll();","            level.add(node.val);","            if (node.left != null) q.add(node.left);","            if (node.right != null) q.add(node.right);","        }","        res.add(level);","    }","    return res;","}"],
        lineMap: { init: 4, level_start: 5, dequeue: 9, enqueue: 11, level_done: 14, done: 16 },
      },
      javascript: {
        code: ["function levelOrder(root) {","  if (!root) return [];","  const res = [];","  const q = [root];","  while (q.length) {","    const level = [];","    const size = q.length;","    for (let i = 0; i < size; i++) {","      const node = q.shift();","      level.push(node.val);","      if (node.left) q.push(node.left);","      if (node.right) q.push(node.right);","    }","    res.push(level);","  }","  return res;","}"],
        lineMap: { init: 3, level_start: 5, dequeue: 9, enqueue: 11, level_done: 14, done: 16 },
      },
      python: {
        code: ["def level_order(root):","    from collections import deque","    if not root: return []","    res, q = [], deque([root])","    while q:","        level, size = [], len(q)","        for _ in range(size):","            node = q.popleft()","            level.append(node.val)","            if node.left: q.append(node.left)","            if node.right: q.append(node.right)","        res.append(level)","    return res"],
        lineMap: { init: 2, level_start: 4, dequeue: 7, enqueue: 9, level_done: 11, done: 12 },
      },
    },
  },

  "validate-binary-search-tree": {
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    category: "Trees",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    visualizer: "treealgo",
    description: "Given the <code>root</code> of a binary tree, determine if it is a <strong>valid binary search tree</strong> (BST).",
    example: { input: "root = [2,1,3]", output: "true", note: "Left subtree values < 2 < right subtree values." },
    defaultInput: { root: [2, 1, 3] },
    inputFields: ["root"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "For each node, check that all nodes in the left subtree are smaller and all in the right subtree are larger — O(n²). Inorder traversal should be strictly increasing for a valid BST — O(n) with a running minimum." },
      { emoji: "💡", title: "The Key Insight", body: "Pass valid (min, max) bounds down the tree. A node must satisfy min < val < max. Left child gets (min, node.val); right child gets (node.val, max)." },
      { emoji: "👣", title: "Step by Step", body: "1. dfs(node, lo, hi): if node is null, return true.\n2. If val <= lo or val >= hi, return false.\n3. Return dfs(left, lo, val) && dfs(right, val, hi).\n4. Start with dfs(root, -∞, +∞)." },
      { emoji: "⚡", title: "Why It's O(n)", body: "Visit each node once. Recursion depth O(h) where h is tree height." },
    ],
    languages: {
      cpp: {
        code: ["bool isValidBST(TreeNode* root) {","    function<bool(TreeNode*, long, long)> dfs = [&](TreeNode* node, long lo, long hi) {","        if (!node) return true;","        if (node->val <= lo || node->val >= hi) return false;","        return dfs(node->left, lo, node->val) && dfs(node->right, node->val, hi);","    };","    return dfs(root, LONG_MIN, LONG_MAX);","}"],
        lineMap: { visit: 2, invalid: 4, recurse: 5, done: 7 },
      },
      java: {
        code: ["public boolean isValidBST(TreeNode root) {","    return dfs(root, null, null);","}","boolean dfs(TreeNode node, Integer lo, Integer hi) {","    if (node == null) return true;","    if (lo != null && node.val <= lo) return false;","    if (hi != null && node.val >= hi) return false;","    return dfs(node.left, lo, node.val) && dfs(node.right, node.val, hi);","}"],
        lineMap: { visit: 4, invalid: 5, recurse: 7, done: 7 },
      },
      javascript: {
        code: ["function isValidBST(root) {","  function dfs(node, lo, hi) {","    if (!node) return true;","    if ((lo !== null && node.val <= lo) || (hi !== null && node.val >= hi)) return false;","    return dfs(node.left, lo, node.val) && dfs(node.right, node.val, hi);","  }","  return dfs(root, null, null);","}"],
        lineMap: { visit: 2, invalid: 4, recurse: 5, done: 7 },
      },
      python: {
        code: ["def is_valid_bst(root):","    def dfs(node, lo, hi):","        if not node: return True","        if lo is not None and node.val <= lo: return False","        if hi is not None and node.val >= hi: return False","        return dfs(node.left, lo, node.val) and dfs(node.right, node.val, hi)","    return dfs(root, None, None)"],
        lineMap: { visit: 2, invalid: 4, recurse: 5, done: 6 },
      },
    },
  },

  "kth-smallest-element-in-a-bst": {
    title: "Kth Smallest Element in a BST",
    difficulty: "Medium",
    category: "Trees",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    visualizer: "treealgo",
    description: "Given the <code>root</code> of a binary search tree and an integer <code>k</code>, return the <code>k</code>th smallest value (1-indexed) in the tree.",
    example: { input: "root = [3,1,4,null,2], k = 1", output: "1", note: "Inorder traversal yields sorted order: 1, 2, 3, 4." },
    defaultInput: { root: [3, 1, 4, null, null, 2], k: 1 },
    inputFields: ["root", "k"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "Collect all values with any traversal, sort them, return the kth — O(n log n). BST structure gives sorted order for free via inorder." },
      { emoji: "💡", title: "The Key Insight", body: "Inorder traversal of a BST visits nodes in ascending order. Count visits; stop when count reaches k." },
      { emoji: "👣", title: "Step by Step", body: "1. Inorder: recurse left, visit node (increment count; if count == k, record answer), recurse right.\n2. Early exit once answer is found.\n3. Return the kth visited value." },
      { emoji: "⚡", title: "Why It's O(n)", body: "Worst case visits all n nodes. O(h) recursion stack." },
    ],
    languages: {
      cpp: {
        code: ["int kthSmallest(TreeNode* root, int k) {","    int count = 0, ans = 0;","    function<void(TreeNode*)> inorder = [&](TreeNode* node) {","        if (!node || count >= k) return;","        inorder(node->left);","        if (++count == k) ans = node->val;","        inorder(node->right);","    };","    inorder(root);","    return ans;","}"],
        lineMap: { init: 2, visit: 6, found: 6, done: 9 },
      },
      java: {
        code: ["public int kthSmallest(TreeNode root, int k) {","    int[] count = {0};","    int[] ans = {0};","    inorder(root, k, count, ans);","    return ans[0];","}","void inorder(TreeNode node, int k, int[] count, int[] ans) {","    if (node == null || count[0] >= k) return;","    inorder(node.left, k, count, ans);","    if (++count[0] == k) ans[0] = node.val;","    inorder(node.right, k, count, ans);","}"],
        lineMap: { init: 2, visit: 9, found: 9, done: 10 },
      },
      javascript: {
        code: ["function kthSmallest(root, k) {","  let count = 0, ans = 0;","  function inorder(node) {","    if (!node || count >= k) return;","    inorder(node.left);","    if (++count === k) ans = node.val;","    inorder(node.right);","  }","  inorder(root);","  return ans;","}"],
        lineMap: { init: 2, visit: 6, found: 6, done: 9 },
      },
      python: {
        code: ["def kth_smallest(root, k):","    count, ans = [0], [0]","    def inorder(node):","        if not node or count[0] >= k: return","        inorder(node.left)","        count[0] += 1","        if count[0] == k: ans[0] = node.val","        inorder(node.right)","    inorder(root)","    return ans[0]"],
        lineMap: { init: 2, visit: 6, found: 7, done: 9 },
      },
    },
  },

  "construct-binary-tree-from-preorder-and-inorder-traversal": {
    title: "Construct Binary Tree from Preorder and Inorder",
    difficulty: "Medium",
    category: "Trees",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    visualizer: "treeconstruct",
    description: "Given two integer arrays <code>preorder</code> and <code>inorder</code> where <code>preorder</code> is the preorder traversal and <code>inorder</code> is the inorder traversal of a binary tree, construct and return the binary tree.",
    example: { input: "preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]", output: "[3,9,20,null,null,15,7]", note: "Preorder[0] is always the root; split inorder at root to get left/right sizes." },
    defaultInput: { preorder: [3, 9, 20, 15, 7], inorder: [9, 3, 15, 20, 7] },
    inputFields: ["preorder", "inorder"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "Find root in preorder, locate it in inorder to split subtrees, recurse — O(n²) if indexOf is linear each time. Hash map for inorder indices gives O(n)." },
      { emoji: "💡", title: "The Key Insight", body: "Preorder gives root first. In inorder, everything left of root is the left subtree; everything right is the right subtree. Recurse on both halves." },
      { emoji: "👣", title: "Step by Step", body: "1. Map each inorder value to its index.\n2. build(preL, preR, inL, inR): root = preorder[preL]; m = index[root].\n3. leftSize = m - inL; build left with preL+1..preL+leftSize; build right with remaining.\n4. Return root." },
      { emoji: "⚡", title: "Why It's O(n)", body: "Each node created once. Index map built in O(n)." },
    ],
    languages: {
      cpp: {
        code: ["TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {","    unordered_map<int,int> idx;","    for (int i = 0; i < inorder.size(); i++) idx[inorder[i]] = i;","    int preIdx = 0;","    function<TreeNode*(int,int)> build = [&](int l, int r) {","        if (l > r) return (TreeNode*)nullptr;","        int val = preorder[preIdx++];","        TreeNode* node = new TreeNode(val);","        int m = idx[val];","        node->left = build(l, m - 1);","        node->right = build(m + 1, r);","        return node;","    };","    return build(0, inorder.size() - 1);","}"],
        lineMap: { init: 2, pick_root: 7, split: 9, done: 13 },
      },
      java: {
        code: ["public TreeNode buildTree(int[] preorder, int[] inorder) {","    Map<Integer,Integer> idx = new HashMap<>();","    for (int i = 0; i < inorder.length; i++) idx.put(inorder[i], i);","    int[] preIdx = {0};","    return build(preorder, 0, inorder.length - 1, idx, preIdx);","}","TreeNode build(int[] pre, int l, int r, Map<Integer,Integer> idx, int[] preIdx) {","    if (l > r) return null;","    int val = pre[preIdx[0]++];","    TreeNode node = new TreeNode(val);","    int m = idx.get(val);","    node.left = build(pre, l, m - 1, idx, preIdx);","    node.right = build(pre, m + 1, r, idx, preIdx);","    return node;","}"],
        lineMap: { init: 2, pick_root: 9, split: 11, done: 13 },
      },
      javascript: {
        code: ["function buildTree(preorder, inorder) {","  const idx = new Map(inorder.map((v, i) => [v, i]));","  let preIdx = 0;","  function build(l, r) {","    if (l > r) return null;","    const val = preorder[preIdx++];","    const node = { val, left: null, right: null };","    const m = idx.get(val);","    node.left = build(l, m - 1);","    node.right = build(m + 1, r);","    return node;","  }","  return build(0, inorder.length - 1);","}"],
        lineMap: { init: 2, pick_root: 6, split: 8, done: 12 },
      },
      python: {
        code: ["def build_tree(preorder, inorder):","    idx = {v: i for i, v in enumerate(inorder)}","    pre_idx = [0]","    def build(l, r):","        if l > r: return None","        val = preorder[pre_idx[0]]; pre_idx[0] += 1","        node = TreeNode(val)","        m = idx[val]","        node.left = build(l, m - 1)","        node.right = build(m + 1, r)","        return node","    return build(0, len(inorder) - 1)"],
        lineMap: { init: 2, pick_root: 6, split: 8, done: 11 },
      },
    },
  },

  "binary-tree-maximum-path-sum": {
    title: "Binary Tree Maximum Path Sum",
    difficulty: "Hard",
    category: "Trees",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    visualizer: "treealgo",
    description: "Given the <code>root</code> of a binary tree, return the <strong>maximum path sum</strong> of any non-empty path. A path is any sequence of nodes where adjacent nodes are connected; the path does not need to include the root.",
    example: { input: "root = [-10,9,20,null,null,15,7]", output: "42", note: "Path 15 → 20 → 7 has sum 42." },
    defaultInput: { root: [-10, 9, 20, null, null, 15, 7] },
    inputFields: ["root"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "Try every pair of nodes and compute path sum — O(n²) paths. Postorder DFS computes the best downward gain at each node in one pass." },
      { emoji: "💡", title: "The Key Insight", body: "At each node, the best downward path is node.val + max(0, leftGain, rightGain). The best path through the node (possibly arching left→node→right) updates a global max." },
      { emoji: "👣", title: "Step by Step", body: "1. gain(node): if null return 0.\n2. left = max(0, gain(node.left)); right = max(0, gain(node.right)).\n3. maxSum = max(maxSum, node.val + left + right).\n4. Return node.val + max(left, right) to parent." },
      { emoji: "⚡", title: "Why It's O(n)", body: "Each node visited once in postorder. O(h) stack space." },
    ],
    languages: {
      cpp: {
        code: ["int maxPathSum(TreeNode* root) {","    int maxSum = INT_MIN;","    function<int(TreeNode*)> gain = [&](TreeNode* node) {","        if (!node) return 0;","        int left = max(0, gain(node->left));","        int right = max(0, gain(node->right));","        maxSum = max(maxSum, node->val + left + right);","        return node->val + max(left, right);","    };","    gain(root);","    return maxSum;","}"],
        lineMap: { visit: 3, update_max: 7, done: 11 },
      },
      java: {
        code: ["public int maxPathSum(TreeNode root) {","    int[] maxSum = {Integer.MIN_VALUE};","    gain(root, maxSum);","    return maxSum[0];","}","int gain(TreeNode node, int[] maxSum) {","    if (node == null) return 0;","    int left = Math.max(0, gain(node.left, maxSum));","    int right = Math.max(0, gain(node.right, maxSum));","    maxSum[0] = Math.max(maxSum[0], node.val + left + right);","    return node.val + Math.max(left, right);","}"],
        lineMap: { visit: 6, update_max: 9, done: 10 },
      },
      javascript: {
        code: ["function maxPathSum(root) {","  let maxSum = -Infinity;","  function gain(node) {","    if (!node) return 0;","    const left = Math.max(0, gain(node.left));","    const right = Math.max(0, gain(node.right));","    maxSum = Math.max(maxSum, node.val + left + right);","    return node.val + Math.max(left, right);","  }","  gain(root);","  return maxSum;","}"],
        lineMap: { visit: 3, update_max: 7, done: 10 },
      },
      python: {
        code: ["def max_path_sum(root):","    max_sum = [float('-inf')]","    def gain(node):","        if not node: return 0","        left = max(0, gain(node.left))","        right = max(0, gain(node.right))","        max_sum[0] = max(max_sum[0], node.val + left + right)","        return node.val + max(left, right)","    gain(root)","    return max_sum[0]"],
        lineMap: { visit: 3, update_max: 7, done: 9 },
      },
    },
  },

  "implement-trie-prefix-tree": {
    title: "Implement Trie (Prefix Tree)",
    difficulty: "Medium",
    category: "Tries",
    timeComplexity: "O(m) per op",
    spaceComplexity: "O(n)",
    visualizer: "trie",
    description: "Implement the <code>Trie</code> class with <code>insert</code>, <code>search</code>, and <code>startsWith</code> methods.",
    example: { input: 'insert "apple", search "app" → false, startsWith "app" → true', output: "true", note: "Each node stores children by character; mark word endings." },
    defaultInput: { s: "insert apple, search app, startsWith app, search apple" },
    inputFields: ["s"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "Store words in a list — search and prefix check scan all words O(n×m). A trie gives O(m) per operation where m is word length." },
      { emoji: "💡", title: "The Key Insight", body: "Each node is a map of char → child node. insert walks/creates the path; search checks the path exists and ends at a word; startsWith only needs the path to exist." },
      { emoji: "👣", title: "Step by Step", body: "1. insert(word): for each char, create child if missing; mark end on last char.\n2. search(word): walk the path; return true only if end marker is set.\n3. startsWith(prefix): walk the path; return true if path exists." },
      { emoji: "⚡", title: "Why It's O(m) per op", body: "Each operation walks at most m characters. Space proportional to total characters stored." },
    ],
    languages: {
      cpp: {
        code: ["class Trie {","    struct Node { unordered_map<char, Node*> next; bool end = false; };","    Node* root = new Node();","public:","    void insert(string word) {","        Node* node = root;","        for (char c : word) {","            if (!node->next.count(c)) node->next[c] = new Node();","            node = node->next[c];","        }","        node->end = true;","    }","    bool search(string word) {","        Node* node = root;","        for (char c : word) {","            if (!node->next.count(c)) return false;","            node = node->next[c];","        }","        return node->end;","    }","    bool startsWith(string prefix) {","        Node* node = root;","        for (char c : prefix) {","            if (!node->next.count(c)) return false;","            node = node->next[c];","        }","        return true;","    }","};"],
        lineMap: { init: 1, add_char: 7, add_end: 10, search: 13, done: 27 },
      },
      java: {
        code: ["class Trie {","    static class Node { Map<Character,Node> next = new HashMap<>(); boolean end; }","    private final Node root = new Node();","    public void insert(String word) {","        Node node = root;","        for (char c : word.toCharArray()) {","            node = node.next.computeIfAbsent(c, k -> new Node());","        }","        node.end = true;","    }","    public boolean search(String word) {","        Node node = walk(word);","        return node != null && node.end;","    }","    public boolean startsWith(String prefix) {","        return walk(prefix) != null;","    }","    private Node walk(String s) {","        Node node = root;","        for (char c : s.toCharArray()) {","            node = node.next.get(c);","            if (node == null) return null;","        }","        return node;","    }","}"],
        lineMap: { init: 1, add_char: 6, add_end: 8, search: 11, done: 23 },
      },
      javascript: {
        code: ["class Trie {","  constructor() { this.root = {}; }","  insert(word) {","    let node = this.root;","    for (const ch of word) {","      if (!node[ch]) node[ch] = {};","      node = node[ch];","    }","    node.end = true;","  }","  search(word) {","    const node = this._walk(word);","    return !!node && !!node.end;","  }","  startsWith(prefix) {","    return !!this._walk(prefix);","  }","  _walk(word) {","    let node = this.root;","    for (const ch of word) {","      if (!node[ch]) return null;","      node = node[ch];","    }","    return node;","  }","}"],
        lineMap: { init: 1, add_char: 5, add_end: 8, search: 10, done: 22 },
      },
      python: {
        code: ["class Trie:","    def __init__(self): self.root = {}","    def insert(self, word):","        node = self.root","        for ch in word:","            node = node.setdefault(ch, {})","        node['#'] = True","    def search(self, word):","        node = self._walk(word)","        return node is not None and node.get('#', False)","    def startsWith(self, prefix):","        return self._walk(prefix) is not None","    def _walk(self, word):","        node = self.root","        for ch in word:","            if ch not in node: return None","            node = node[ch]","        return node"],
        lineMap: { init: 1, add_char: 4, add_end: 5, search: 7, done: 14 },
      },
    },
  },

  "design-add-and-search-words-data-structure": {
    title: "Design Add and Search Words Data Structure",
    difficulty: "Medium",
    category: "Tries",
    timeComplexity: "O(m) add, O(26^m) search worst case",
    spaceComplexity: "O(n)",
    visualizer: "trie",
    description: "Design a data structure that supports adding words and searching with <code>.</code> as a wildcard matching any letter.",
    example: { input: 'addWord "bad", addWord "dad", search ".ad"', output: "true", note: "'.' matches 'b' or 'd'." },
    defaultInput: { s: "addWord bad, addWord dad, addWord mad, search .ad, search b.." },
    inputFields: ["s"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "Store words in a list; on search with wildcards, try regex or backtracking over all words — slow for many words." },
      { emoji: "💡", title: "The Key Insight", body: "Use a trie for addWord (O(m)). For search with '.', DFS: at a wildcard try every child branch; at a literal follow the exact edge." },
      { emoji: "👣", title: "Step by Step", body: "1. addWord: same as trie insert.\n2. search(word, i, node): if i == len return node.end.\n3. If word[i] == '.': try all children recursively.\n4. Else follow word[i] child if it exists." },
      { emoji: "⚡", title: "Complexity", body: "addWord O(m). search O(26^k) worst case with k wildcards; O(m) for exact matches." },
    ],
    languages: {
      cpp: {
        code: ["class WordDictionary {","    struct Node { unordered_map<char, Node*> next; bool end = false; };","    Node* root = new Node();","public:","    void addWord(string word) {","        Node* node = root;","        for (char c : word) {","            if (!node->next.count(c)) node->next[c] = new Node();","            node = node->next[c];","        }","        node->end = true;","    }","    bool search(string word) { return dfs(root, word, 0); }","    bool dfs(Node* node, string& word, int i) {","        if (i == word.size()) return node->end;","        char c = word[i];","        if (c == '.') {","            for (auto& [ch, child] : node->next)","                if (dfs(child, word, i + 1)) return true;","            return false;","        }","        if (!node->next.count(c)) return false;","        return dfs(node->next[c], word, i + 1);","    }","};"],
        lineMap: { init: 1, add_char: 7, add_end: 10, search: 13, done: 22 },
      },
      java: {
        code: ["class WordDictionary {","    static class Node { Map<Character,Node> next = new HashMap<>(); boolean end; }","    private final Node root = new Node();","    public void addWord(String word) {","        Node node = root;","        for (char c : word.toCharArray())","            node = node.next.computeIfAbsent(c, k -> new Node());","        node.end = true;","    }","    public boolean search(String word) { return dfs(root, word, 0); }","    boolean dfs(Node node, String word, int i) {","        if (i == word.length()) return node.end;","        char c = word.charAt(i);","        if (c == '.') {","            for (Node child : node.next.values())","                if (dfs(child, word, i + 1)) return true;","            return false;","        }","        Node next = node.next.get(c);","        return next != null && dfs(next, word, i + 1);","    }","}"],
        lineMap: { init: 1, add_char: 6, add_end: 8, search: 10, done: 19 },
      },
      javascript: {
        code: ["class WordDictionary {","  constructor() { this.root = {}; }","  addWord(word) {","    let node = this.root;","    for (const ch of word) {","      if (!node[ch]) node[ch] = {};","      node = node[ch];","    }","    node.end = true;","  }","  search(word) { return this._dfs(this.root, word, 0); }","  _dfs(node, word, i) {","    if (i === word.length) return !!node.end;","    const ch = word[i];","    if (ch === '.') {","      for (const key of Object.keys(node)) {","        if (key !== 'end' && this._dfs(node[key], word, i + 1)) return true;","      }","      return false;","    }","    if (!node[ch]) return false;","    return this._dfs(node[ch], word, i + 1);","  }","}"],
        lineMap: { init: 1, add_char: 5, add_end: 8, search: 10, done: 22 },
      },
      python: {
        code: ["class WordDictionary:","    def __init__(self): self.root = {}","    def addWord(self, word):","        node = self.root","        for ch in word: node = node.setdefault(ch, {})","        node['#'] = True","    def search(self, word): return self._dfs(self.root, word, 0)","    def _dfs(self, node, word, i):","        if i == len(word): return node.get('#', False)","        ch = word[i]","        if ch == '.':","            return any(self._dfs(node[k], word, i + 1) for k in node if k != '#')","        if ch not in node: return False","        return self._dfs(node[ch], word, i + 1)"],
        lineMap: { init: 1, add_char: 4, add_end: 5, search: 6, done: 12 },
      },
    },
  },

  "word-search-ii": {
    title: "Word Search II",
    difficulty: "Hard",
    category: "Arrays",
    timeComplexity: "O(m×n×4^L)",
    spaceComplexity: "O(W×L)",
    visualizer: "grid",
    description: "Given an <code>m×n</code> <code>board</code> of characters and a list of strings <code>words</code>, return all words on the board. Each word must be constructed from letters of sequentially adjacent cells (no reuse per word).",
    example: { input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]', output: '["eat","oath"]', note: "Build a trie from words; DFS from each cell with trie pruning." },
    defaultInput: { board: "o,a,a,n,e,t,a,e,i,h,k,r,i,f,l,v", rows: 4, words: "oath,pea,eat,rain" },
    inputFields: ["board", "rows", "words"],
    explanation: [
      { emoji: "🤔", title: "Brute Force", body: "For each word, run Word Search I DFS from every cell — O(words × m×n×4^L). Building one trie and searching all words in a single DFS pass shares work." },
      { emoji: "💡", title: "The Key Insight", body: "Insert all words into a trie. DFS on the board follows trie edges; if no edge exists, prune. When a trie node marks a word, add it to results and remove the marker to avoid duplicates." },
      { emoji: "👣", title: "Step by Step", body: "1. Build trie from words; store word at terminal nodes.\n2. For each cell (r,c), dfs(r,c, trieNode).\n3. Mark cell visited, follow trie edge, recurse to neighbors.\n4. If node.word exists, push to result and clear marker.\n5. Restore cell after backtrack." },
      { emoji: "⚡", title: "Why Trie + DFS", body: "Prunes paths that cannot match any remaining word. Worst case still O(m×n×4^L) but much faster in practice." },
    ],
    languages: {
      cpp: {
        code: ["vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {","    struct Node { unordered_map<char, Node*> next; string* word = nullptr; };","    Node* root = new Node();","    for (string& w : words) {","        Node* node = root;","        for (char c : w) {","            if (!node->next.count(c)) node->next[c] = new Node();","            node = node->next[c];","        }","        node->word = &w;","    }","    vector<string> res;","    int R = board.size(), C = board[0].size();","    function<void(int,int,Node*)> dfs = [&](int r, int c, Node* node) {","        char ch = board[r][c];","        if (!node->next.count(ch)) return;","        node = node->next[ch];","        if (node->word) { res.push_back(*node->word); node->word = nullptr; }","        board[r][c] = '#';","        int dr[] = {1,-1,0,0}, dc[] = {0,0,1,-1};","        for (int k = 0; k < 4; k++) {","            int nr = r + dr[k], nc = c + dc[k];","            if (nr >= 0 && nr < R && nc >= 0 && nc < C && board[nr][nc] != '#')","                dfs(nr, nc, node);","        }","        board[r][c] = ch;","    };","    for (int r = 0; r < R; r++)","        for (int c = 0; c < C; c++)","            dfs(r, c, root);","    return res;","}"],
        lineMap: { init: 2, try_start: 25, dfs_mark: 17, dfs_fail: 16, found: 18, done: 27 },
      },
      java: {
        code: ["public List<String> findWords(char[][] board, String[] words) {","    TrieNode root = buildTrie(words);","    List<String> res = new ArrayList<>();","    for (int r = 0; r < board.length; r++)","        for (int c = 0; c < board[0].length; c++)","            dfs(board, r, c, root, res);","    return res;","}","void dfs(char[][] board, int r, int c, TrieNode node, List<String> res) {","    char ch = board[r][c];","    if (!node.next.containsKey(ch)) return;","    node = node.next.get(ch);","    if (node.word != null) { res.add(node.word); node.word = null; }","    board[r][c] = '#';","    int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};","    for (int[] d : dirs) {","        int nr = r + d[0], nc = c + d[1];","        if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length && board[nr][nc] != '#')","            dfs(board, nr, nc, node, res);","    }","    board[r][c] = ch;","}"],
        lineMap: { init: 2, try_start: 5, dfs_mark: 13, dfs_fail: 11, found: 13, done: 7 },
      },
      javascript: {
        code: ["function findWords(board, words) {","  const root = {};","  for (const word of words) {","    let node = root;","    for (const ch of word) {","      if (!node[ch]) node[ch] = {};","      node = node[ch];","    }","    node.word = word;","  }","  const res = [];","  const R = board.length, C = board[0].length;","  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];","  function dfs(r, c, node) {","    const ch = board[r][c];","    if (!node[ch]) return;","    node = node[ch];","    if (node.word) { res.push(node.word); node.word = null; }","    board[r][c] = '#';","    for (const [dr, dc] of dirs) {","      const nr = r + dr, nc = c + dc;","      if (nr >= 0 && nr < R && nc >= 0 && nc < C && board[nr][nc] !== '#') dfs(nr, nc, node);","    }","    board[r][c] = ch;","  }","  for (let r = 0; r < R; r++)","    for (let c = 0; c < C; c++)","      if (board[r][c] !== '#') dfs(r, c, root);","  return res;","}"],
        lineMap: { init: 2, try_start: 26, dfs_mark: 17, dfs_fail: 16, found: 18, done: 28 },
      },
      python: {
        code: ["def find_words(board, words):","    root = {}","    for word in words:","        node = root","        for ch in word:","            node = node.setdefault(ch, {})","        node['$'] = word","    res, R, C = [], len(board), len(board[0])","    dirs = [(1,0),(-1,0),(0,1),(0,-1)]","    def dfs(r, c, node):","        ch = board[r][c]","        if ch not in node: return","        node = node[ch]","        if '$' in node:","            res.append(node.pop('$'))","        board[r][c] = '#'","        for dr, dc in dirs:","            nr, nc = r + dr, c + dc","            if 0 <= nr < R and 0 <= nc < C and board[nr][nc] != '#':","                dfs(nr, nc, node)","        board[r][c] = ch","    for r in range(R):","        for c in range(C):","            if board[r][c] != '#': dfs(r, c, root)","    return res"],
        lineMap: { init: 2, try_start: 22, dfs_mark: 13, dfs_fail: 11, found: 13, done: 23 },
      },
    },
  },
};

export const BLIND75_MISSING_PROB_LIST = [
  { id: "minimum-window-substring", title: "Minimum Window Substring", difficulty: "Hard", category: "Sliding Window", desc: "Smallest substring of s containing all chars of t.", tags: ["sliding-window", "strings"] },
  { id: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", difficulty: "Medium", category: "Trees", desc: "BFS level-by-level traversal.", tags: ["trees", "bfs"] },
  { id: "validate-binary-search-tree", title: "Validate Binary Search Tree", difficulty: "Medium", category: "Trees", desc: "Check BST validity with bounds.", tags: ["trees", "bst"] },
  { id: "kth-smallest-element-in-a-bst", title: "Kth Smallest Element in a BST", difficulty: "Medium", category: "Trees", desc: "Inorder traversal to kth value.", tags: ["trees", "bst"] },
  { id: "construct-binary-tree-from-preorder-and-inorder-traversal", title: "Construct Binary Tree from Preorder and Inorder", difficulty: "Medium", category: "Trees", desc: "Rebuild tree from traversal arrays.", tags: ["trees", "recursion"] },
  { id: "binary-tree-maximum-path-sum", title: "Binary Tree Maximum Path Sum", difficulty: "Hard", category: "Trees", desc: "Max sum path in a binary tree.", tags: ["trees", "dfs"] },
  { id: "implement-trie-prefix-tree", title: "Implement Trie (Prefix Tree)", difficulty: "Medium", category: "Tries", desc: "Insert, search, startsWith on a trie.", tags: ["trie", "design"] },
  { id: "design-add-and-search-words-data-structure", title: "Add and Search Words", difficulty: "Medium", category: "Tries", desc: "Trie with wildcard search.", tags: ["trie", "design"] },
  { id: "word-search-ii", title: "Word Search II", difficulty: "Hard", category: "Arrays", desc: "Find multiple words on a 2D board.", tags: ["grid", "trie", "backtracking"] },
];
