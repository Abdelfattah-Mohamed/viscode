/**
 * UNION-FIND / DSU (Disjoint Set Union)
 * 
 * Tracks disjoint sets. Supports: find (which set?), union (merge two sets).
 * Uses path compression + rank heuristic for near O(1) amortized.
 * 
 * Time: O(α(n)) ≈ O(1) per operation (inverse Ackermann)
 * Space: O(n)
 */

#include <vector>
#include <algorithm>

class DSU {
    std::vector<int> parent, rank;
    int n;
public:
    DSU(int n) : n(n), parent(n), rank(n, 0) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    int find(int x) {
        return parent[x] == x ? x : parent[x] = find(parent[x]);  // path compression
    }

    bool unite(int a, int b) {
        a = find(a), b = find(b);
        if (a == b) return false;
        if (rank[a] < rank[b]) std::swap(a, b);  // rank heuristic
        parent[b] = a;
        if (rank[a] == rank[b]) rank[a]++;
        return true;
    }

    bool same(int a, int b) {
        return find(a) == find(b);
    }
};
