export default function PalindromeViz({ s = "", stepState = {}, t }) {
  const { left, right, result, done } = stepState;
  const chars = s.split("");

  const isAlphaNum = (ch) => /[a-zA-Z0-9]/.test(ch);

  const charBg = (idx) => {
    if (done && result === false && (idx === left || idx === right)) return t.red + "30";
    if (done && result === true) return isAlphaNum(chars[idx]) ? t.green + "28" : t.surface;
    if (idx === left || idx === right) return t.yellow + "30";
    return t.surface;
  };

  const charBorder = (idx) => {
    if (done && result === false && (idx === left || idx === right)) return t.red;
    if (done && result === true && isAlphaNum(chars[idx])) return t.green;
    if (idx === left || idx === right) return t.yellow;
    return t.border;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
          string
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flexWrap: "wrap", paddingTop: 48 }}>
          {chars.map((ch, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
              <div style={{ position: "absolute", bottom: "100%", marginBottom: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, whiteSpace: "nowrap" }}>
                {idx === left && !done && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 700, color: t.blue }}>L</span>}
                {idx === right && !done && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 700, color: t.green }}>R</span>}
              </div>
              <div style={{
                width: 42, height: 42,
                border: `2.5px solid ${charBorder(idx)}`,
                borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700,
                background: charBg(idx), color: t.ink,
                opacity: isAlphaNum(ch) ? 1 : 0.4,
                transform: (idx === left || idx === right) ? "translateY(-6px) scale(1.08)" : "scale(1)",
                boxShadow: (idx === left || idx === right) ? t.shadowSm : "none",
                transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              }}>
                {ch}
              </div>
              <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.7em", color: t.inkMuted }}>{idx}</span>
            </div>
          ))}
        </div>
      </div>

      {done && (
        <div style={{
          padding: "10px 16px", borderRadius: 8, textAlign: "center",
          border: `2px solid ${result ? t.green : t.red}`,
          background: result ? t.green + "18" : t.red + "18",
          fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700,
          color: result ? t.green : t.red,
        }}>
          {result ? "✅ Palindrome!" : "❌ Not a palindrome"}
        </div>
      )}
    </div>
  );
}
