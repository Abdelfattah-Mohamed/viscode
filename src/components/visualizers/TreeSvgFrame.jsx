/**
 * Renders the tree at full layout size (big nodes, no overlap).
 * Scrolls when the tree is wider/taller than the panel.
 */
export default function TreeSvgFrame({ width, height, children, style }) {
  const scrollX = width > 480;
  const scrollY = height > 420;

  return (
    <div
      style={{
        width: "100%",
        overflowX: scrollX ? "auto" : "hidden",
        overflowY: scrollY ? "auto" : "visible",
        maxHeight: scrollY ? 460 : undefined,
        borderRadius: 8,
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block" }}
        aria-hidden="true"
      >
        {children}
      </svg>
    </div>
  );
}
