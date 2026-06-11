/**
 * A* (A-STAR) ALGORITHM
 * 
 * Best-first pathfinding. Uses f(n) = g(n) + h(n) where
 * g = cost from start, h = heuristic to goal.
 * Optimal if heuristic is admissible (never overestimates).
 * 
 * Time: O(E log V) with priority queue
 * Space: O(V)
 */

#include <vector>
#include <queue>
#include <functional>
#include <cmath>

struct Node {
    int x, y;
    double g, h, f;
    bool operator>(const Node& o) const { return f > o.f; }
};

std::vector<std::pair<int,int>> astar(int sx, int sy, int gx, int gy, 
    std::vector<std::vector<bool>>& grid) {
    int rows = grid.size(), cols = grid[0].size();
    auto heuristic = [&](int x, int y) {
        return std::abs(x - gx) + std::abs(y - gy);  // Manhattan
    };

    std::priority_queue<Node, std::vector<Node>, std::greater<Node>> pq;
    std::vector<std::vector<std::pair<int,int>>> parent(rows, 
        std::vector<std::pair<int,int>>(cols, {-1,-1}));
    std::vector<std::vector<double>> g(rows, std::vector<double>(cols, 1e9));
    g[sx][sy] = 0;
    pq.push({sx, sy, 0, (double)heuristic(sx,sy), (double)heuristic(sx,sy)});

    int dx[] = {-1,1,0,0}, dy[] = {0,0,-1,1};
    while (!pq.empty()) {
        auto [x, y, _, __, ___] = pq.top(); pq.pop();
        if (x == gx && y == gy) break;
        for (int i = 0; i < 4; i++) {
            int nx = x + dx[i], ny = y + dy[i];
            if (nx < 0 || nx >= rows || ny < 0 || ny >= cols || grid[nx][ny]) continue;
            double ng = g[x][y] + 1;
            if (ng < g[nx][ny]) {
                g[nx][ny] = ng;
                parent[nx][ny] = {x, y};
                pq.push({nx, ny, ng, (double)heuristic(nx,ny), ng + heuristic(nx,ny)});
            }
        }
    }

    std::vector<std::pair<int,int>> path;
    for (int x = gx, y = gy; x != -1; ) {
        path.push_back({x, y});
        auto [px, py] = parent[x][y];
        x = px; y = py;
    }
    std::reverse(path.begin(), path.end());
    return path;
}
