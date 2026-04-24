import { useState, useEffect, useMemo } from "react";
import { leetcodeToComplete, completeToLeetcode } from "../../utils/treeFormat";

const TREE_FIELDS = new Set(["root", "subRoot", "p", "q"]);
const INT_FIELDS = new Set(["target", "n", "pos", "rows", "cols", "k", "amount"]);
const STRING_FIELDS = new Set(["s", "t", "dict", "words", "word", "board", "preorder", "inorder"]);

function stripBrackets(s) {
  let out = String(s ?? "").trim();
  if (out.startsWith("[")) out = out.slice(1);
  if (out.endsWith("]")) out = out.slice(0, -1);
  return out;
}

function parseNumberList(raw) {
  if (!String(raw ?? "").trim()) return [];
  return stripBrackets(raw)
    .split(/[,\n]/)
    .map((x) => Number(x.trim()))
    .filter((x) => !Number.isNaN(x));
}

function parseTreeTokens(raw) {
  if (!String(raw ?? "").trim()) return [];
  return stripBrackets(raw)
    .split(/[,\n]/)
    .map((v) => {
      const s = v.trim().toLowerCase();
      if (s === "null" || s === "n" || s === "") return null;
      const num = Number(s);
      return Number.isNaN(num) ? null : num;
    });
}

function trimTrailingNulls(arr) {
  const next = [...arr];
  while (next.length > 0 && next[next.length - 1] === null) next.pop();
  return next;
}

function parseEdgeLines(raw, tupleSize = 2) {
  const lines = String(raw || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  const edges = [];
  for (const line of lines) {
    const parts = (line.replace(/\[|\]/g, "").match(/-?\d+(?:\.\d+)?/g) || []).map((x) => x.trim());
    if (parts.length < 2) continue;
    const a = Number(parts[0]);
    const b = Number(parts[1]);
    if (tupleSize >= 3) {
      if (parts.length < 3) continue;
      const w = Number(parts[2]);
      if (!Number.isNaN(a) && !Number.isNaN(b) && !Number.isNaN(w)) edges.push([a, b, w]);
      continue;
    }
    if (!Number.isNaN(a) && !Number.isNaN(b)) edges.push([a, b]);
  }
  return edges;
}

function toGridModel(input) {
  const flat = Array.isArray(input.grid) ? input.grid.map((x) => Number(x) || 0) : [];
  const rows = Math.max(1, Number(input.rows) || 1);
  const cols = Math.max(1, Math.ceil(flat.length / rows) || 1);
  const cells = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => String(flat[r * cols + c] ?? 0))
  );
  return { rows, cols, cells };
}

function TreePreview({ complete, t }) {
  const sketchBorder = t._resolved === "dark" ? "#8a8f98" : "#1f2937";
  const paper = t._resolved === "dark" ? "#1f2024" : "#fffdf8";
  const ink = t._resolved === "dark" ? "#f3f4f6" : "#1f2937";
  const nodes = [];
  for (let i = 0; i < complete.length; i += 1) {
    if (complete[i] !== null && complete[i] !== undefined) {
      nodes.push({ idx: i, value: complete[i] });
    }
  }
  if (nodes.length === 0) {
    return (
      <div style={{ border: `2px dashed ${sketchBorder}`, borderRadius: 10, padding: 10, color: t.inkMuted, fontSize: "0.78rem", background: paper }}>
        Empty tree preview
      </div>
    );
  }

  const present = new Set(nodes.map((n) => n.idx));
  const maxLevel = Math.max(...nodes.map((n) => Math.floor(Math.log2(n.idx + 1))));
  const width = 280;
  const levelGap = 62;
  const top = 26;
  const height = top * 2 + maxLevel * levelGap + 36;

  const pos = new Map();
  for (const n of nodes) {
    const level = Math.floor(Math.log2(n.idx + 1));
    const posInLevel = n.idx - (2 ** level - 1);
    const countInLevel = 2 ** level;
    const x = ((posInLevel + 1) / (countInLevel + 1)) * width;
    const y = top + level * levelGap;
    pos.set(n.idx, { x, y });
  }

  const edges = nodes
    .filter((n) => n.idx > 0)
    .map((n) => {
      const p = Math.floor((n.idx - 1) / 2);
      return present.has(p) ? { from: p, to: n.idx } : null;
    })
    .filter(Boolean);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ border: `2px solid ${sketchBorder}`, borderRadius: 10, background: paper, maxHeight: 240 }}
    >
      {edges.map((e, i) => (
        <line
          key={`e-${i}`}
          x1={pos.get(e.from).x}
          y1={pos.get(e.from).y}
          x2={pos.get(e.to).x}
          y2={pos.get(e.to).y}
          stroke={sketchBorder}
          strokeWidth="2"
        />
      ))}
      {nodes.map((n) => {
        const p = pos.get(n.idx);
        return (
          <g key={`n-${n.idx}`}>
            <circle cx={p.x} cy={p.y} r="15" fill={paper} stroke={sketchBorder} strokeWidth="2.2" />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fill={ink} fontWeight="700">
              {String(n.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function GraphPreview({ edges, n, t, weighted = false }) {
  const sketchBorder = t._resolved === "dark" ? "#8a8f98" : "#1f2937";
  const paper = t._resolved === "dark" ? "#1f2024" : "#fffdf8";
  const ink = t._resolved === "dark" ? "#f3f4f6" : "#1f2937";
  const nodeSet = new Set();
  for (let i = 0; i < (Number.isNaN(n) ? 0 : n); i += 1) nodeSet.add(i);
  for (const [a, b] of edges) {
    nodeSet.add(a);
    nodeSet.add(b);
  }
  const nodes = Array.from(nodeSet).sort((a, b) => a - b);
  if (nodes.length === 0) {
    return (
      <div style={{ border: `2px dashed ${sketchBorder}`, borderRadius: 10, padding: 10, color: t.inkMuted, fontSize: "0.78rem", background: paper }}>
        Empty graph preview
      </div>
    );
  }

  const width = 280;
  const height = 220;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.max(42, Math.min(width, height) / 2 - 36);

  const pos = new Map();
  nodes.forEach((id, idx) => {
    const angle = (2 * Math.PI * idx) / Math.max(nodes.length, 1) - Math.PI / 2;
    pos.set(id, {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  });

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ border: `2px solid ${sketchBorder}`, borderRadius: 10, background: paper, maxHeight: 240 }}
    >
      {edges.map(([a, b, w], i) => {
        const pa = pos.get(a);
        const pb = pos.get(b);
        if (!pa || !pb) return null;
        const midX = (pa.x + pb.x) / 2;
        const midY = (pa.y + pb.y) / 2;
        return (
          <g key={`ge-${i}`}>
            <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={sketchBorder} strokeWidth="2" />
            {weighted && (
              <>
                <rect x={midX - 11} y={midY - 10} width={22} height={16} rx={5} fill={paper} stroke={sketchBorder} strokeWidth="1.2" />
                <text x={midX} y={midY + 1.5} textAnchor="middle" fontSize="10" fill={ink} fontWeight="700">
                  {String(w)}
                </text>
              </>
            )}
          </g>
        );
      })}
      {nodes.map((id) => {
        const p = pos.get(id);
        return (
          <g key={`gn-${id}`}>
            <circle cx={p.x} cy={p.y} r="14" fill={paper} stroke={sketchBorder} strokeWidth="2.2" />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fill={ink} fontWeight="700">
              {id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function isWeightedGraphProblem(problem, visualizer) {
  if (visualizer !== "graph") return false;
  const text = `${problem?.title || ""} ${problem?.description || ""} ${problem?.example?.input || ""}`.toLowerCase();
  return /(weighted|weight|shortest path|bellman|dijkstra|floyd|kruskal|prim|a\*)/.test(text);
}

function inferFieldKind(field, input, fields, visualizer) {
  if (field === "grid" && fields.includes("rows")) return "matrix";
  if (visualizer === "graph" && field === "nums" && fields.includes("n")) return "graph";
  if (field === "intervals") return "pairs";
  if (TREE_FIELDS.has(field)) return "tree";
  if (INT_FIELDS.has(field)) return "int";
  if (STRING_FIELDS.has(field)) return "string";
  if (Array.isArray(input[field])) return "array";
  if (typeof input[field] === "number") return "int";
  return "string";
}

function kindHelp(kind, weightedGraphInput) {
  if (kind === "int") return "Single number (e.g. 7)";
  if (kind === "array") return "Numbers separated by comma/new line (e.g. 1, 2, 3)";
  if (kind === "string") return "Plain text string";
  if (kind === "tree") return "Level-order nodes, use null for missing (e.g. 3, 9, 20, null, null, 15, 7)";
  if (kind === "pairs") return "One pair per line: a, b";
  if (kind === "matrix") return "Use rows/cols and edit cells in the table";
  if (kind === "graph") return weightedGraphInput ? "One weighted edge per line: u v w" : "One edge per line: u v";
  return "Enter value";
}

function buildInitialDraft(input, fields, visualizer, weightedGraphInput = false) {
  const draft = {};
  for (const f of fields) {
    const kind = inferFieldKind(f, input, fields, visualizer);
    if (kind === "tree") {
      const lc = Array.isArray(input[f]) ? completeToLeetcode(input[f]) : [];
      draft[f] = lc.map((x) => (x === null ? "null" : x)).join(", ");
      continue;
    }
    if (kind === "matrix") {
      draft[f] = toGridModel(input);
      continue;
    }
    if (kind === "graph") {
      const nums = Array.isArray(input[f]) ? input[f] : [];
      const lines = [];
      const stride = weightedGraphInput ? 3 : 2;
      for (let i = 0; i + stride - 1 < nums.length; i += stride) {
        lines.push(weightedGraphInput ? `${nums[i]} ${nums[i + 1]} ${nums[i + 2]}` : `${nums[i]} ${nums[i + 1]}`);
      }
      draft[f] = lines.join("\n");
      continue;
    }
    if (kind === "pairs") {
      const nums = Array.isArray(input[f]) ? input[f] : [];
      const lines = [];
      for (let i = 0; i + 1 < nums.length; i += 2) lines.push(`${nums[i]}, ${nums[i + 1]}`);
      draft[f] = lines.join("\n");
      continue;
    }
    if (Array.isArray(input[f])) {
      draft[f] = input[f].join(", ");
      continue;
    }
    draft[f] = String(input[f] ?? "");
  }
  return draft;
}

export default function InputEditor({ input, fields, onChange, onReset, t, problem }) {
  const visualizer = problem?.visualizer || "";
  const weightedGraphInput = useMemo(() => isWeightedGraphProblem(problem, visualizer), [problem, visualizer]);
  const sketchBorder = t._resolved === "dark" ? "#8a8f98" : "#1f2937";
  const paper = t._resolved === "dark" ? "#222328" : "#fffdf8";
  const paperAlt = t._resolved === "dark" ? "#2a2b31" : "#fff7ed";
  const ink = t._resolved === "dark" ? "#f3f4f6" : "#1f2937";
  const sketchFont = "'Caveat', 'Comic Sans MS', cursive";
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => buildInitialDraft(input, fields, visualizer, weightedGraphInput));
  const [error, setError] = useState(null);
  const [showInputHint, setShowInputHint] = useState(false);

  useEffect(() => {
    if (!open) return;
    try {
      if (!localStorage.getItem("viscode-inputeditor-hint-dismissed")) {
        setShowInputHint(true);
      }
    } catch (_) {}
  }, [open]);

  useEffect(() => {
    setDraft(buildInitialDraft(input, fields, visualizer, weightedGraphInput));
    setError(null);
  }, [fields.join(","), problem?.title, problem?.description, weightedGraphInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const schema = useMemo(
    () =>
      fields.map((f) => ({
        field: f,
        kind: inferFieldKind(f, input, fields, visualizer),
      })),
    [fields, input, visualizer]
  );

  const pill = (extra = {}) => ({
    fontFamily: sketchFont,
    fontSize: "0.8rem",
    padding: "5px 11px",
    border: `2px solid ${sketchBorder}`,
    borderRadius: 8,
    background: paper,
    color: ink,
    cursor: "pointer",
    boxShadow: "2px 2px 0 rgba(0,0,0,0.25)",
    ...extra,
  });

  const setField = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const dismissInputHint = () => {
    setShowInputHint(false);
    try {
      localStorage.setItem("viscode-inputeditor-hint-dismissed", "1");
    } catch (_) {}
  };

  const apply = () => {
    const next = {};
    try {
      for (const { field, kind } of schema) {
        if (kind === "int") {
          const n = Number(draft[field]);
          next[field] = Number.isNaN(n) ? 0 : n;
        } else if (kind === "tree") {
          next[field] = leetcodeToComplete(trimTrailingNulls(parseTreeTokens(draft[field])));
        } else if (kind === "matrix") {
          const gridModel = draft[field];
          const rows = Math.max(1, Number(gridModel?.rows) || 1);
          const cols = Math.max(1, Number(gridModel?.cols) || 1);
          const cells = Array.isArray(gridModel?.cells) ? gridModel.cells : [];
          const flat = [];
          for (let r = 0; r < rows; r += 1) {
            for (let c = 0; c < cols; c += 1) {
              const val = Number(cells[r]?.[c] ?? 0);
              flat.push(Number.isNaN(val) ? 0 : val);
            }
          }
          next.grid = flat;
          if (fields.includes("rows")) next.rows = rows;
          if (fields.includes("cols")) next.cols = cols;
        } else if (kind === "graph") {
          const edges = parseEdgeLines(draft[field], weightedGraphInput ? 3 : 2);
          next[field] = edges.flat();
        } else if (kind === "pairs") {
          next[field] = parseEdgeLines(draft[field]).flat();
        } else if (kind === "array") {
          next[field] = parseNumberList(draft[field]);
        } else {
          next[field] = String(draft[field] ?? "");
        }
      }
      if (fields.includes("n") && visualizer === "graph") {
        const n = Number(draft.n);
        if (!Number.isNaN(n)) next.n = n;
      }
    } catch (e) {
      setError(e?.message || "Invalid input");
      return;
    }
    setError(null);
    onChange(next);
    onReset();
    setOpen(false);
  };

  const resetDraft = () => {
    setDraft(buildInitialDraft(input, fields, visualizer, weightedGraphInput));
    setError(null);
  };

  const updateGridMeta = (field, key, value) => {
    setDraft((prev) => {
      const current = prev[field] || { rows: 1, cols: 1, cells: [["0"]] };
      const rows = key === "rows" ? Math.max(1, Number(value) || 1) : current.rows;
      const cols = key === "cols" ? Math.max(1, Number(value) || 1) : current.cols;
      const nextCells = Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => String(current.cells?.[r]?.[c] ?? "0"))
      );
      return { ...prev, [field]: { rows, cols, cells: nextCells } };
    });
  };

  const updateGridCell = (field, r, c, value) => {
    setDraft((prev) => {
      const current = prev[field];
      const nextCells = current.cells.map((row) => [...row]);
      nextCells[r][c] = value;
      return { ...prev, [field]: { ...current, cells: nextCells } };
    });
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ ...pill(), marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
        ✏️ Edit Input
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "rgba(0,0,0,0.58)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(900px, 95vw)",
              maxHeight: "90vh",
              overflow: "auto",
              background: paper,
              border: `2px solid ${sketchBorder}`,
              borderRadius: 14,
              boxShadow: "6px 6px 0 rgba(0,0,0,0.28)",
            }}
          >
            <div style={{ padding: "14px 18px", borderBottom: `2px solid ${sketchBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontFamily: sketchFont, fontSize: "1.45rem", fontWeight: 700, color: ink }}>Input Editor</div>
                <div style={{ fontSize: "0.8rem", color: t.inkMuted }}>
                  {problem?.title || "Problem"}
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={pill()}>
                ✕ Close
              </button>
            </div>

            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              {showInputHint && (
                <div style={{ border: `2px solid ${sketchBorder}`, borderRadius: 10, background: paper, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontSize: "0.78rem", color: t.inkMuted }}>
                    Onboarding tip: start with one small change, click <strong>Apply input</strong>, then use playback controls to see exactly what changed.
                  </div>
                  <button onClick={dismissInputHint} style={{ border: "none", background: "transparent", color: t.inkMuted, cursor: "pointer", fontSize: "0.78rem", padding: 0 }}>
                    Dismiss
                  </button>
                </div>
              )}
              <div style={{ border: `2px dashed ${sketchBorder}`, borderRadius: 10, background: paperAlt, padding: "10px 12px" }}>
                <div style={{ fontFamily: sketchFont, fontSize: "1rem", fontWeight: 700, color: ink, marginBottom: 4 }}>
                  Input format quick help
                </div>
                <div style={{ display: "grid", gap: 4, fontSize: "0.78rem", color: t.inkMuted }}>
                  {Array.from(new Set(schema.map((x) => x.kind))).map((k) => (
                    <div key={`help-${k}`}>
                      <strong style={{ color: ink }}>{k}:</strong> {kindHelp(k, weightedGraphInput)}
                    </div>
                  ))}
                </div>
              </div>

              {schema.map(({ field, kind }) => (
                <div key={field} style={{ border: `2px solid ${sketchBorder}`, borderRadius: 10, padding: 12, background: paperAlt }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontFamily: sketchFont, fontSize: "1.1rem", fontWeight: 700, color: ink }}>{field}</div>
                    <div style={{ fontSize: "0.72rem", color: t.inkMuted, textTransform: "uppercase" }}>{kind}</div>
                  </div>

                  {(kind === "string" || kind === "graph" || kind === "tree" || kind === "pairs") && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: kind === "tree" || kind === "graph" ? "minmax(0,1fr) 280px" : "1fr",
                        gap: 10,
                        alignItems: "start",
                      }}
                    >
                      <textarea
                        value={draft[field] || ""}
                        onChange={(e) => setField(field, e.target.value)}
                        rows={kind === "string" ? 3 : 5}
                        placeholder={
                          kind === "graph"
                            ? (weightedGraphInput ? "One weighted edge per line: u v w (e.g. 0 1 4)" : "One edge per line: u v (e.g. 0 1)")
                            : kind === "tree"
                              ? "Level-order values: 3, 9, 20, null, null, 15, 7"
                              : kind === "pairs"
                                ? "One pair per line: 1, 3"
                                : "Type value..."
                        }
                        style={{
                          width: "100%",
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: "0.8rem",
                          border: `2px solid ${sketchBorder}`,
                          borderRadius: 8,
                          background: paper,
                          color: ink,
                          padding: "10px 11px",
                          resize: "vertical",
                          minHeight: 72,
                        }}
                      />
                      {kind === "tree" && (
                        <TreePreview
                          complete={leetcodeToComplete(trimTrailingNulls(parseTreeTokens(draft[field])))}
                          t={t}
                        />
                      )}
                      {kind === "graph" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <GraphPreview
                            edges={parseEdgeLines(draft[field], weightedGraphInput ? 3 : 2)}
                            n={Number(draft.n ?? input.n ?? 0)}
                            t={t}
                            weighted={weightedGraphInput}
                          />
                          <div style={{ fontSize: "0.72rem", color: t.inkMuted }}>
                            {weightedGraphInput
                              ? "Weighted graph format: each line is u v w (from, to, weight)."
                              : "Graph format: each line is u v (from, to)."}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {kind === "int" && (
                    <input
                      type="number"
                      value={draft[field] ?? ""}
                      onChange={(e) => setField(field, e.target.value)}
                      style={{
                        width: 130,
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: "0.82rem",
                        border: `2px solid ${sketchBorder}`,
                        borderRadius: 8,
                        background: paper,
                        color: ink,
                        padding: "8px 10px",
                      }}
                    />
                  )}

                  {kind === "array" && (
                    <textarea
                      value={draft[field] || ""}
                      onChange={(e) => setField(field, e.target.value)}
                      rows={3}
                      placeholder="Comma or new-line separated numbers"
                      style={{
                        width: "100%",
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: "0.8rem",
                        border: `2px solid ${sketchBorder}`,
                        borderRadius: 8,
                        background: paper,
                        color: ink,
                        padding: "10px 11px",
                        resize: "vertical",
                        minHeight: 72,
                      }}
                    />
                  )}

                  {kind === "matrix" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <label style={{ fontSize: "0.8rem", color: t.inkMuted }}>
                          Rows{" "}
                          <input
                            type="number"
                            min={1}
                            value={draft[field]?.rows ?? 1}
                            onChange={(e) => updateGridMeta(field, "rows", e.target.value)}
                            style={{ width: 70, marginLeft: 4, padding: "5px 6px", borderRadius: 6, border: `2px solid ${sketchBorder}`, background: paper, color: ink }}
                          />
                        </label>
                        <label style={{ fontSize: "0.8rem", color: t.inkMuted }}>
                          Cols{" "}
                          <input
                            type="number"
                            min={1}
                            value={draft[field]?.cols ?? 1}
                            onChange={(e) => updateGridMeta(field, "cols", e.target.value)}
                            style={{ width: 70, marginLeft: 4, padding: "5px 6px", borderRadius: 6, border: `2px solid ${sketchBorder}`, background: paper, color: ink }}
                          />
                        </label>
                      </div>
                      <div style={{ overflowX: "auto", border: `1px solid ${t.border}`, borderRadius: 8 }}>
                        <table style={{ borderCollapse: "collapse", width: "100%" }}>
                          <tbody>
                            {(draft[field]?.cells || []).map((row, r) => (
                              <tr key={r}>
                                {row.map((cell, c) => (
                                  <td key={`${r}-${c}`} style={{ border: `1px solid ${t.border}`, padding: 0 }}>
                                    <input
                                      value={cell}
                                      onChange={(e) => updateGridCell(field, r, c, e.target.value)}
                                      style={{
                                        width: "100%",
                                        minWidth: 70,
                                        padding: "8px 7px",
                                        border: "none",
                                        outline: "none",
                                        background: paper,
                                        color: ink,
                                        fontFamily: "'JetBrains Mono',monospace",
                                        fontSize: "0.78rem",
                                      }}
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {error && (
                <div style={{ color: t.red, fontSize: "0.82rem", background: `${t.red}1f`, border: `1px solid ${t.red}`, padding: "8px 10px", borderRadius: 8 }}>
                  {error}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "12px 16px", borderTop: `2px solid ${sketchBorder}` }}>
              <button onClick={resetDraft} style={pill()}>
                Reset edits
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setOpen(false)} style={pill()}>
                  Cancel
                </button>
                <button onClick={apply} style={pill({ background: "#9fe870", color: "#0f172a", border: `2px solid ${sketchBorder}` })}>
                  Apply input
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
