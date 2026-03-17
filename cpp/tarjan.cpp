/**
 * TARJAN'S ALGORITHM
 * 
 * Finds Strongly Connected Components (SCCs) in a directed graph.
 * Single DFS using low-link values and stack.
 * 
 * Time: O(V + E)
 * Space: O(V)
 */

#include <vector>
#include <stack>
#include <algorithm>

void tarjanDfs(int u, std::vector<std::vector<int>>& adj, std::vector<int>& id, 
               std::vector<int>& low, std::vector<bool>& onStack, 
               std::stack<int>& st, int& timer, std::vector<std::vector<int>>& sccs) {
    id[u] = low[u] = timer++;
    st.push(u);
    onStack[u] = true;

    for (int v : adj[u]) {
        if (id[v] == -1) {
            tarjanDfs(v, adj, id, low, onStack, st, timer, sccs);
            low[u] = std::min(low[u], low[v]);
        } else if (onStack[v]) {
            low[u] = std::min(low[u], id[v]);
        }
    }

    if (low[u] == id[u]) {
        std::vector<int> scc;
        while (true) {
            int v = st.top(); st.pop();
            onStack[v] = false;
            scc.push_back(v);
            if (v == u) break;
        }
        sccs.push_back(scc);
    }
}

std::vector<std::vector<int>> tarjan(int n, std::vector<std::vector<int>>& adj) {
    std::vector<int> id(n, -1), low(n);
    std::vector<bool> onStack(n, false);
    std::stack<int> st;
    std::vector<std::vector<int>> sccs;
    int timer = 0;

    for (int i = 0; i < n; i++) {
        if (id[i] == -1) tarjanDfs(i, adj, id, low, onStack, st, timer, sccs);
    }
    return sccs;
}
