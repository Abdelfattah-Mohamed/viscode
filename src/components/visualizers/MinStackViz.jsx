export default function MinStackViz({ stepState = {}, t }) {
  const { st = [], minSt = [], op, opVal, result, done } = stepState;
  const isDark = t._resolved === "dark";
  const stackBg = isDark ? "#374151" : "#e5e7eb";

  const renderStack = (arr, label, color) => (
    <div style={{ flex: 1, minWidth: 120 }}>
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column-reverse", gap: 6, minHeight: 80 }}>
        {arr.length === 0 && (
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, fontStyle: "italic" }}>empty</div>
        )}
        {arr.map((val, idx) => (
          <div
            key={idx}
            style={{
              minWidth: 56,
              padding: "8px 14px",
              border: `2px solid ${t.border}`,
              borderRadius: 8,
              background: stackBg,
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: "1.1em",
              fontWeight: 700,
              color: t.ink,
              textAlign: "center",
            }}
          >
            {val}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {op && (
        <div style={{
          padding: "10px 16px",
          borderRadius: 10,
          border: `2px solid ${done ? t.green : t.yellow}`,
          background: (done ? t.green : t.yellow) + "22",
          fontFamily: "'Caveat',cursive",
          fontSize: "1.05em",
          fontWeight: 700,
          color: t.ink,
        }}>
          {op === "push" && `push(${opVal})`}
          {op === "pop" && "pop()"}
          {op === "top" && `top() → ${result}`}
          {op === "getMin" && `getMin() → ${result}`}
        </div>
      )}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {renderStack(st, "st (values)", t.blue)}
        {renderStack(minSt, "minSt (min so far)", t.purple)}
      </div>
      {done && (
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1em", fontWeight: 700, color: t.green }}>
          ✅ Done
        </div>
      )}
    </div>
  );
}
