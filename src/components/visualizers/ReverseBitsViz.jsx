const PHASE_LABELS = {
  init: "res = 0",
  loop: "for (i = 0..31)",
  body: "res = (res<<1)|(n&1); n >>= 1",
  done: "return res",
};

function toBinary32(x) {
  if (x == null || typeof x !== "number") return "—";
  const n = (x >>> 0).toString(2);
  return n.padStart(32, "0").slice(-32);
}

export default function ReverseBitsViz({ stepState = {}, t }) {
  const { n, res, i, done, highlight: highlightKey, phase } = stepState;
  const nVal = n != null ? (n >>> 0) : null;
  const resVal = res != null ? (res >>> 0) : null;
  const isDark = t._resolved === "dark";
  const boxBg = isDark ? "#374151" : "#e5e7eb";
  const highlightN = highlightKey === "n" || highlightKey === "both";
  const highlightRes = highlightKey === "res" || highlightKey === "both";

  const Cell = ({ label, value, sub, highlighted }) => (
    <div
      style={{
        minWidth: 88,
        padding: "12px 16px",
        border: `2px solid ${highlighted ? t.yellow : t.border}`,
        borderRadius: 10,
        background: highlighted ? t.yellow + "28" : boxBg,
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: "1.05em",
        fontWeight: 700,
        color: t.ink,
        textAlign: "center",
        boxShadow: highlighted ? t.shadowSm : "none",
      }}
    >
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85em", color: t.inkMuted, marginBottom: 4 }}>{label}</div>
      <div>{value != null && value !== "" ? value : "—"}</div>
      {sub != null && sub !== "" && <div style={{ fontSize: "0.65em", color: t.inkMuted, marginTop: 4, wordBreak: "break-all" }}>{sub}</div>}
    </div>
  );

  const phaseLabel = phase ? PHASE_LABELS[phase] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {phaseLabel && (
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.9em", color: t.inkMuted, fontWeight: 600 }}>
          {phaseLabel}
          {i >= 0 && i < 32 && <span style={{ marginLeft: 8, color: t.blue }}> i = {i}</span>}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
        <Cell label="n" value={nVal} sub={nVal != null ? `0b${toBinary32(nVal)}` : null} highlighted={highlightN} />
        <Cell label="res" value={resVal} sub={resVal != null ? `0b${toBinary32(resVal)}` : null} highlighted={highlightRes} />
      </div>
      {done && resVal != null && (
        <div
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            border: `2px solid ${t.green}`,
            background: t.green + "22",
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "1.25em",
            fontWeight: 800,
            color: t.green,
          }}
        >
          Answer: {resVal}
        </div>
      )}
    </div>
  );
}
