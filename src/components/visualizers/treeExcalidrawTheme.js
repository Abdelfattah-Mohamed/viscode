/**
 * Excalidraw-style theme for tree visualizers.
 * Hand-drawn look: cream/white fill, dark strokes, pastel accents.
 */
export const EXCALIDRAW_TREE = {
  // Base strokes (Excalidraw uses #1e1e1e for dark mode, similar for light)
  stroke: "#1e1e1e",
  strokeMuted: "#64748b",
  strokeLight: "#94a3b8",
  // Fills
  fillNode: "#fffef9",
  fillNodeDark: "#334155",
  fillNull: "transparent",
  // Accent (Excalidraw palette)
  current: "#f2a33c",
  success: "#70b050",
  error: "#e03131",
  highlight: "#6965db",
  purple: "#6965db",
  blue: "#4dabf7",
  // Roughjs options for hand-drawn look
  roughness: 1.1,
  bowing: 1.5,
  strokeWidth: 2,
};

export function getExcalidrawNodeStyle(t, isDark, { isCur, isSuccess, isError, isHighlight }) {
  if (isError) return { stroke: EXCALIDRAW_TREE.error, fill: EXCALIDRAW_TREE.error + "22", strokeWidth: 2.5 };
  if (isSuccess) return { stroke: EXCALIDRAW_TREE.success, fill: EXCALIDRAW_TREE.success + "22", strokeWidth: 2.5 };
  if (isCur) return { stroke: EXCALIDRAW_TREE.current, fill: EXCALIDRAW_TREE.current + "22", strokeWidth: 2.5 };
  if (isHighlight) return { stroke: EXCALIDRAW_TREE.highlight, fill: EXCALIDRAW_TREE.highlight + "18", strokeWidth: 2 };
  return {
    stroke: isDark ? EXCALIDRAW_TREE.strokeLight : EXCALIDRAW_TREE.stroke,
    fill: isDark ? EXCALIDRAW_TREE.fillNodeDark : EXCALIDRAW_TREE.fillNode,
    strokeWidth: EXCALIDRAW_TREE.strokeWidth,
  };
}

export function getExcalidrawEdgeStyle(t, isDark, highlighted = false) {
  if (highlighted) return { stroke: EXCALIDRAW_TREE.success, strokeWidth: 2.5 };
  return {
    stroke: isDark ? EXCALIDRAW_TREE.strokeMuted : EXCALIDRAW_TREE.stroke,
    strokeWidth: 1.8,
  };
}
