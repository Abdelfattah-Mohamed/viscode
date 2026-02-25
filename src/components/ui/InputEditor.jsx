import { useState, useEffect } from "react";
import { leetcodeToComplete, completeToLeetcode } from "../../utils/treeFormat";

const STR_FIELDS  = new Set(["s", "t"]);
const INT_FIELDS  = new Set(["target", "n", "pos"]);
const TREE_FIELDS = new Set(["root", "subRoot", "p", "q"]);

function stripBrackets(s) {
  s = s.trim();
  if (s.startsWith("[")) s = s.slice(1);
  if (s.endsWith("]"))   s = s.slice(0, -1);
  return s;
}

function parseTreeTokens(raw) {
  return stripBrackets(raw)
    .split(",")
    .map(v => {
      const s = v.trim().toLowerCase();
      if (s === "null" || s === "n" || s === "") return null;
      const num = Number(s);
      return isNaN(num) ? null : num;
    });
}

function trimTrailingNulls(arr) {
  while (arr.length > 0 && arr[arr.length - 1] === null) arr.pop();
  return arr;
}

export default function InputEditor({ input, fields, onChange, onReset, t }) {
  const [open, setOpen]   = useState(false);
  const [vals, setVals]   = useState(() => toStrings(fields, input));
  const [error, setError] = useState(null);

  useEffect(() => {
    setVals(toStrings(fields, input));
    setOpen(false);
    setError(null);
  }, [fields.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  function toStrings(fs, inp) {
    const v = {};
    fs.forEach(f => {
      if (TREE_FIELDS.has(f) && Array.isArray(inp[f])) {
        const lc = completeToLeetcode(inp[f]);
        v[f] = lc.map(x => x === null ? "null" : x).join(", ");
      } else if (Array.isArray(inp[f])) {
        v[f] = inp[f].join(", ");
      } else {
        v[f] = String(inp[f] ?? "");
      }
    });
    return v;
  }

  const apply = () => {
    const next = {};
    try {
      for (const f of fields) {
        if (STR_FIELDS.has(f)) {
          next[f] = vals[f];
        } else if (INT_FIELDS.has(f)) {
          next[f] = Number(vals[f]);
        } else if (TREE_FIELDS.has(f)) {
          const tokens = trimTrailingNulls(parseTreeTokens(vals[f]));
          next[f] = leetcodeToComplete(tokens);
        } else {
          next[f] = stripBrackets(vals[f])
            .split(",")
            .map(v => Number(v.trim()))
            .filter(v => !isNaN(v));
        }
      }
    } catch {
      setError("Invalid input");
      return;
    }
    setError(null);
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
            onChange={e => { setVals(p => ({ ...p, [f]: e.target.value })); setError(null); }}
            onKeyDown={e => e.key === "Enter" && apply()}
            placeholder={TREE_FIELDS.has(f) ? "1, null, 2, 3" : undefined}
            style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem",
              width: STR_FIELDS.has(f) ? 100 : INT_FIELDS.has(f) ? 44 : TREE_FIELDS.has(f) ? 170 : 130,
              padding: "2px 7px", border: `2px solid ${error ? t.red : t.border}`,
              borderRadius: 6, background: t.surface, color: t.ink,
            }}
          />
        </div>
      ))}
      <button onClick={apply} style={{ ...pill({ background: t.green, color: "#fff" }) }}>✓</button>
      <button onClick={() => { setOpen(false); setError(null); }} style={pill()}>✕</button>
    </div>
  );
}
