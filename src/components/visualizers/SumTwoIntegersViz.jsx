const PHASE_LABELS = {
  init: "Start",
  loop_check: "while (b ≠ 0)",
  carry: "carry = (a & b) << 1",
  xor: "a = a ^ b",
  assign_b: "b = carry",
  done: "return a",
};

export default function SumTwoIntegersViz({ stepState = {}, t }) {
  const { a, b, carry, result, done, highlight: highlightKey, phase } = stepState;
  const aVal = a != null ? Number(a) : null;
  const bVal = b != null ? Number(b) : null;
  const carryVal = carry != null ? Number(carry) : null;
  const isDark = t._resolved === "dark";
  const boxBg = isDark ? "#374151" : "#e5e7eb";

  const Cell = ({ label, value, highlighted }) => (
    <div
      style={{
        minWidth: 76,
        padding: "12px 16px",
        border: `2px solid ${highlighted ? t.yellow : t.border}`,
        borderRadius: 10,
        background: highlighted ? t.yellow + "28" : boxBg,
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: "1.15em",
        fontWeight: 700,
        color: t.ink,
        textAlign: "center",
        boxShadow: highlighted ? t.shadowSm : "none",
      }}
    >
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85em", color: t.inkMuted, marginBottom: 4 }}>{label}</div>
      <div>{value != null && value !== "" ? value : "—"}</div>
    </div>
  );

  const highlightA = highlightKey === "a";
  const highlightB = highlightKey === "b";
  const highlightCarry = highlightKey === "carry";
  const phaseLabel = phase ? PHASE_LABELS[phase] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {phaseLabel && (
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.9em", color: t.inkMuted, fontWeight: 600 }}>
          {phaseLabel}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
        <Cell label="a" value={aVal} highlighted={highlightA} />
        <Cell label="b" value={bVal} highlighted={highlightB} />
        <Cell label="carry" value={carryVal} highlighted={highlightCarry} />
      </div>
      {done && result != null && (
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
          Answer: {result}
        </div>
      )}
    </div>
  );
}
