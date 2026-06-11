/**
 * KOSARAJU'S ALGORITHM
 * 
 * Finds Strongly Connected Components (SCCs) in a directed graph.
 * Two passes: 1) DFS on original, 2) DFS on reversed graph.
 * 
 * Time: O(V + E)
 * Space: O(V)
 */

#include <vector>
#include <stack>

void dfs1(int u, std::vector<std::vector<int>>& adj, std::vector<bool>& vis, std::stack<int>& st) {
    vis[u] = true;
    for (int v : adj[u]) {
        if (!vis[v]) dfs1(v, adj, vis, st);
    }
    st.push(u);
}

void dfs2(int u, std::vector<std::vector<int>>& adjRev, std::vector<bool>& vis, std::vector<int>& scc) {
    vis[u] = true;
    scc.push_back(u);
    for (int v : adjRev[u]) {
        if (!vis[v]) dfs2(v, adjRev, vis, scc);
    }
}

std::vector<std::vector<int>> kosaraju(int n, std::vector<std::vector<int>>& adj) {
    std::vector<std::vector<int>> adjRev(n);
    for (int u = 0; u < n; u++) {
        for (int v : adj[u]) adjRev[v].push_back(u);
    }

    std::stack<int> st;
    std::vector<bool> vis(n, false);
    for (int i = 0; i < n; i++) {
        if (!vis[i]) dfs1(i, adj, vis, st);
    }

    vis.assign(n, false);
    std::vector<std::vector<int>> sccs;
    while (!st.empty()) {
        int u = st.top(); st.pop();
        if (!vis[u]) {
            std::vector<int> scc;
            dfs2(u, adjRev, vis, scc);
            sccs.push_back(scc);
        }
    }
    return sccs;
}
