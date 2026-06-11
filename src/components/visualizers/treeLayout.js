import { useMemo } from "react";

function buildValidSet(arr) {
  const validSet = new Set();
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === null || arr[i] === undefined) continue;
    if (i === 0 || validSet.has(Math.floor((i - 1) / 2))) validSet.add(i);
  }
  return validSet;
}

function getMaxLevel(validSet) {
  let maxLevel = 0;
  for (const i of validSet) {
    const level = i === 0 ? 0 : Math.floor(Math.log2(i + 1));
    if (level > maxLevel) maxLevel = level;
  }
  return maxLevel;
}

/** Gap between sibling node edges (room for highlight ring + rough stroke). */
const SIBLING_GAP = 20;

/**
 * Full-size tree metrics — width grows with depth so leaves never overlap.
 * The SVG frame scales or scrolls to show the whole tree.
 */
export function resolveTreeMetrics(maxLevel, { baseNodeR = 20, baseRowH = 56, minWidth = 180 } = {}) {
  const nodeR = baseNodeR;
  const rowH = baseRowH;
  const slots = Math.max(1, 1 << maxLevel);
  const cellW = nodeR * 2 + SIBLING_GAP;
  const width = Math.max(minWidth, slots * cellW);
  const height = maxLevel * rowH + nodeR * 2 + 28;
  return { nodeR, rowH, width, height, nullR: 6 };
}

/**
 * Layout for level-order complete-index tree arrays.
 */
export function computeTreeLayout(arr, options = {}) {
  const baseNodeR = options.baseNodeR ?? 20;
  const baseRowH = options.baseRowH ?? 56;
  const minWidth = options.minWidth ?? 180;

  if (!arr?.length || arr[0] === null || arr[0] === undefined) {
    return {
      nodes: [], edges: [], nullMarkers: [], maxLevel: 0,
      width: minWidth, height: 80, nodeR: baseNodeR, rowH: baseRowH, nullR: 6,
    };
  }

  const validSet = buildValidSet(arr);
  const maxLevel = getMaxLevel(validSet);
  const { nodeR, rowH, width, height, nullR } = resolveTreeMetrics(maxLevel, {
    baseNodeR, baseRowH, minWidth,
  });

  const nodes = [];
  const nullMarkers = [];
  const nodeMap = new Map();

  for (let i = 0; i < arr.length; i++) {
    const level = i === 0 ? 0 : Math.floor(Math.log2(i + 1));
    const posInLevel = i - (1 << level) + 1;
    const totalInLevel = 1 << level;
    const x = ((posInLevel + 0.5) / totalInLevel) * width;
    const y = level * rowH + nodeR + 2;

    if (validSet.has(i)) {
      const node = { index: i, val: arr[i], level, x, y };
      nodes.push(node);
      nodeMap.set(i, node);
    } else if (arr[i] === null && i > 0 && validSet.has(Math.floor((i - 1) / 2))) {
      nullMarkers.push({ index: i, x, y, parentIdx: Math.floor((i - 1) / 2) });
    }
  }

  nullMarkers.forEach((m) => { m.parentNode = nodeMap.get(m.parentIdx); });

  const edges = [];
  nodes.forEach((n) => {
    const li = 2 * n.index + 1;
    const ri = 2 * n.index + 2;
    if (nodeMap.has(li)) edges.push({ from: n, to: nodeMap.get(li) });
    if (nodeMap.has(ri)) edges.push({ from: n, to: nodeMap.get(ri) });
  });

  return { nodes, edges, nullMarkers, maxLevel, width, height, nodeR, rowH, nullR };
}

export function useTreeLayout(arr, options = {}) {
  const { baseNodeR = 20, baseRowH = 56, minWidth = 180 } = options;
  return useMemo(
    () => computeTreeLayout(arr, { baseNodeR, baseRowH, minWidth }),
    [arr, baseNodeR, baseRowH, minWidth],
  );
}
