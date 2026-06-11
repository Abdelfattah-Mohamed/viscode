/**
 * SEGMENT TREE
 * 
 * Supports: range queries (sum/min/max) and point/range updates.
 * Built as a binary tree over array.
 * 
 * Time: O(log n) per query/update
 * Space: O(n)
 */

#include <vector>

class SegmentTree {
    std::vector<int> tree;
    int n;
public:
    SegmentTree(const std::vector<int>& arr) {
        n = arr.size();
        tree.resize(4 * n);
        build(arr, 0, 0, n - 1);
    }

    void build(const std::vector<int>& arr, int node, int l, int r) {
        if (l == r) {
            tree[node] = arr[l];
            return;
        }
        int mid = (l + r) / 2;
        build(arr, 2*node+1, l, mid);
        build(arr, 2*node+2, mid+1, r);
        tree[node] = tree[2*node+1] + tree[2*node+2];  // sum; use min/max for others
    }

    void update(int idx, int val, int node = 0, int l = 0, int r = -1) {
        if (r == -1) r = n - 1;
        if (l == r) {
            tree[node] = val;
            return;
        }
        int mid = (l + r) / 2;
        if (idx <= mid) update(idx, val, 2*node+1, l, mid);
        else update(idx, val, 2*node+2, mid+1, r);
        tree[node] = tree[2*node+1] + tree[2*node+2];
    }

    int query(int ql, int qr, int node = 0, int l = 0, int r = -1) {
        if (r == -1) r = n - 1;
        if (qr < l || ql > r) return 0;
        if (ql <= l && r <= qr) return tree[node];
        int mid = (l + r) / 2;
        return query(ql, qr, 2*node+1, l, mid) + query(ql, qr, 2*node+2, mid+1, r);
    }
};
