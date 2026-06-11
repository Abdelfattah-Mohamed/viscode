/**
 * FLOYD-WARSHALL ALGORITHM
 * 
 * Finds shortest paths between ALL pairs of vertices.
 * Works with negative weights. Can detect negative cycles.
 * 
 * Time: O(V^3)
 * Space: O(V^2)
 */

#include <vector>
#include <climits>
#include <algorithm>

// Input: dist[i][j] = cost i->j, INT_MAX if no edge, 0 for i==j
void floydWarshall(std::vector<std::vector<int>>& dist) {
    int n = dist.size();

    // Try each vertex as intermediate
    for (int k = 0; k < n; k++) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (dist[i][k] != INT_MAX && dist[k][j] != INT_MAX) {
                    dist[i][j] = std::min(dist[i][j], dist[i][k] + dist[k][j]);
                }
            }
        }
    }
}
