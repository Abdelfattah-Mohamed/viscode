/**
 * FENWICK TREE (Binary Indexed Tree)
 * 
 * Supports: point update, prefix sum query in O(log n).
 * Uses bit manipulation for efficient indexing.
 * 
 * Time: O(log n) per update/query
 * Space: O(n)
 */

#include <vector>

class FenwickTree {
    std::vector<int> tree;
    int n;
public:
    FenwickTree(int n) : n(n), tree(n + 1, 0) {}

    void add(int i, int delta) {
        for (i++; i <= n; i += i & -i)  // i & -i = lowest set bit
            tree[i] += delta;
    }

    int prefixSum(int i) {
        int sum = 0;
        for (i++; i > 0; i -= i & -i)
            sum += tree[i];
        return sum;
    }

    int rangeSum(int l, int r) {
        return prefixSum(r) - prefixSum(l - 1);
    }
};

// Build from array: for each i, fenw.add(i, arr[i]);
