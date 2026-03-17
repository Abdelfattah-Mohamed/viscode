/**
 * KRUSKAL'S MST (Minimum Spanning Tree)
 * 
 * Finds minimum spanning tree by greedily adding smallest edges
 * that don't create a cycle. Uses Union-Find (DSU).
 * 
 * Time: O(E log E)
 * Space: O(V)
 */

#include <vector>
#include <algorithm>

struct Edge {
    int u, v, w;
};

class DSU {
    std::vector<int> parent, rank;
public:
    DSU(int n) : parent(n), rank(n, 0) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        return parent[x] == x ? x : parent[x] = find(parent[x]);
    }
    bool unite(int a, int b) {
        a = find(a), b = find(b);
        if (a == b) return false;
        if (rank[a] < rank[b]) std::swap(a, b);
        parent[b] = a;
        if (rank[a] == rank[b]) rank[a]++;
        return true;
    }
};

std::vector<Edge> kruskal(int n, std::vector<Edge>& edges) {
    std::sort(edges.begin(), edges.end(), [](const Edge& a, const Edge& b) {
        return a.w < b.w;
    });
    DSU dsu(n);
    std::vector<Edge> mst;
    for (const auto& e : edges) {
        if (dsu.unite(e.u, e.v)) {
            mst.push_back(e);
        }
    }
    return mst;
}
