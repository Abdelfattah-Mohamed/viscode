# C++ Algorithm Implementations

Easy-to-understand implementations with brief explanations.

---

## Bellman-Ford
**File:** `bellman_ford.cpp`

Single-source shortest path. Works with **negative edges**. Relaxes all edges `V-1` times. One more pass detects negative cycles.

- **Use when:** Graph has negative weights
- **Time:** O(V × E)

---

## Floyd-Warshall
**File:** `floyd_warshall.cpp`

All-pairs shortest path. For each vertex `k`, try using it as an intermediate between every pair `(i,j)`.

- **Use when:** Need distances between all pairs
- **Time:** O(V³)

---

## Kosaraju
**File:** `kosaraju.cpp`

Finds Strongly Connected Components (SCCs). Two DFS passes: first on original graph (fill stack), then on reversed graph (extract SCCs).

- **Use when:** Need SCCs in directed graph
- **Time:** O(V + E)

---

## Tarjan
**File:** `tarjan.cpp`

Finds SCCs in one DFS. Uses `id` (discovery time) and `low` (lowest reachable id). When `low[u] == id[u]`, we've found an SCC root.

- **Use when:** Need SCCs, prefer single pass
- **Time:** O(V + E)

---

## Kruskal's MST
**File:** `kruskal_mst.cpp`

Minimum Spanning Tree. Sort edges by weight, add smallest that doesn't create a cycle (Union-Find).

- **Use when:** Sparse graphs, need MST
- **Time:** O(E log E)

---

## A*
**File:** `astar.cpp`

Pathfinding with heuristic. `f(n) = g(n) + h(n)`. Optimal if heuristic is admissible (e.g. Manhattan distance on grid).

- **Use when:** Grid/pathfinding with known goal
- **Time:** O(E log V)

---

## Fenwick Tree (Binary Indexed Tree)
**File:** `fenwick_tree.cpp`

Point update + prefix/range sum in O(log n). Uses `i & -i` for efficient indexing.

- **Use when:** Frequent prefix sums + point updates
- **Time:** O(log n) per op

---

## Segment Tree
**File:** `segment_tree.cpp`

Range queries (sum/min/max) and point updates. Full binary tree over array.

- **Use when:** Range queries + updates, or lazy propagation needed
- **Time:** O(log n) per op

---

## Knapsack (0/1)
**File:** `knapsack.cpp`

Maximize value with weight limit. Each item taken once. 1D DP, iterate backwards to avoid reusing same item.

- **Use when:** Classic 0/1 knapsack
- **Time:** O(n × W)

---

## Note
**Fenwick Tree = Binary Indexed Tree** — same structure, different names.
