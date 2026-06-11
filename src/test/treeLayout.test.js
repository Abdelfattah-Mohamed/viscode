import { describe, it, expect } from "vitest";
import { computeTreeLayout } from "../components/visualizers/treeLayout.js";

function minSiblingGap(nodes, nodeR) {
  const byLevel = new Map();
  nodes.forEach((n) => {
    if (!byLevel.has(n.level)) byLevel.set(n.level, []);
    byLevel.get(n.level).push(n);
  });
  let minGap = Infinity;
  for (const levelNodes of byLevel.values()) {
    levelNodes.sort((a, b) => a.x - b.x);
    for (let i = 1; i < levelNodes.length; i++) {
      const dist = levelNodes[i].x - levelNodes[i - 1].x;
      minGap = Math.min(minGap, dist - nodeR * 2);
    }
  }
  return minGap;
}

describe("treeLayout", () => {
  it("uses full-size nodes with width that grows by depth", () => {
    const deep = Array.from({ length: 63 }, (_, i) => i + 1);
    const { width, nodeR, maxLevel } = computeTreeLayout(deep);
    expect(maxLevel).toBe(5);
    expect(nodeR).toBe(20);
    expect(width).toBeGreaterThan(440);
  });

  it("never overlaps siblings on the extended tree", () => {
    const extended = [3, 9, 20, null, null, 15, 7, 8, 8, 8, null, null, null, null, 9];
    const { nodes, nodeR } = computeTreeLayout(extended);
    expect(minSiblingGap(nodes, nodeR)).toBeGreaterThanOrEqual(16);
  });

  it("never overlaps siblings on a full level-4 tree", () => {
    const leaves = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const { nodes, nodeR } = computeTreeLayout(leaves);
    expect(minSiblingGap(nodes, nodeR)).toBeGreaterThanOrEqual(16);
  });
});
