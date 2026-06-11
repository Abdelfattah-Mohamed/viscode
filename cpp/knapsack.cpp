/**
 * KNAPSACK (0/1)
 * 
 * Given items with weight and value, maximize value subject to capacity W.
 * Each item either taken or not (0/1).
 * 
 * Time: O(n * W)
 * Space: O(W) with 1D DP
 */

#include <vector>
#include <algorithm>

int knapsack(int W, std::vector<int>& weights, std::vector<int>& values) {
    int n = weights.size();
    std::vector<int> dp(W + 1, 0);

    for (int i = 0; i < n; i++) {
        for (int w = W; w >= weights[i]; w--) {
            dp[w] = std::max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }
    return dp[W];
}

// Unbounded knapsack (each item unlimited): iterate w from weights[i] to W
// Fractional knapsack: greedy by value/weight ratio
