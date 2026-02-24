import { useState, useEffect } from "react";

const STR_FIELDS = new Set(["s", "t"]);
const INT_FIELDS = new Set(["target", "n"]);

export default function InputEditor({ input, fields, onChange, onReset, t }) {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState(() => toStrings(fields, input));

  useEffect(() => {
    setVals(toStrings(fields, input));
    setOpen(false);
  }, [fields.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  function toStrings(fs, inp) {
    const v = {};
    fs.forEach(f => { v[f] = Array.isArray(inp[f]) ? inp[f].join(", ") : String(inp[f]); });
    return v;
  }

  const apply = () => {
    const next = {};
    for (const f of fields) {
      if (STR_FIELDS.has(f))      next[f] = vals[f];
      else if (INT_FIELDS.has(f)) next[f] = Number(vals[f]);
      else next[f] = vals[f].split(",").map(v => Number(v.trim())).filter(v => !isNaN(v));
    }
    onChange(next);
    onReset();
    setOpen(false);
  };

  const pill = (extra = {}) => ({
    fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem",
    padding: "3px 10px", border: `2px solid ${t.border}`,
    borderRadius: 6, background: t.surface, color: t.ink,
    cursor: "pointer", boxShadow: t.shadowSm, ...extra,
  });

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ ...pill(), marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
        ✏️ Edit Input
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto", flexWrap: "wrap" }}>
      {fields.map(f => (
        <div key={f} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85rem", color: t.inkMuted }}>{f}:</span>
          <input
            value={vals[f]}
            onChange={e => setVals(p => ({ ...p, [f]: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && apply()}
            style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem",
              width: STR_FIELDS.has(f) ? 100 : INT_FIELDS.has(f) ? 44 : 130,
              padding: "2px 7px", border: `2px solid ${t.border}`,
              borderRadius: 6, background: t.surface, color: t.ink,
            }}
          />
        </div>
      ))}
      <button onClick={apply}               style={{ ...pill({ background: t.green, color: "#fff" }) }}>✓</button>
      <button onClick={() => setOpen(false)} style={pill()}>✕</button>
    </div>
  );
}
