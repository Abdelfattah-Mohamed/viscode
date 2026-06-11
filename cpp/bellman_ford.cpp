/**
 * BELLMAN-FORD ALGORITHM
 * 
 * Finds shortest paths from a single source in a weighted graph.
 * Works with NEGATIVE edge weights (unlike Dijkstra).
 * Can detect negative cycles.
 * 
 * Time: O(V * E)
 * Space: O(V)
 */

#include <vector>
#include <climits>

struct Edge {
    int from, to, weight;
};

std::vector<int> bellmanFord(int n, int source, std::vector<Edge>& edges) {
    std::vector<int> dist(n, INT_MAX);
    dist[source] = 0;

    // Relax all edges (n-1) times
    for (int i = 0; i < n - 1; i++) {
        for (const auto& e : edges) {
            if (dist[e.from] != INT_MAX && dist[e.from] + e.weight < dist[e.to]) {
                dist[e.to] = dist[e.from] + e.weight;
            }
        }
    }

    // Optional: detect negative cycle (one more relaxation)
    for (const auto& e : edges) {
        if (dist[e.from] != INT_MAX && dist[e.from] + e.weight < dist[e.to]) {
            // Negative cycle detected!
            return {};  // or handle as needed
        }
    }
    return dist;
}
