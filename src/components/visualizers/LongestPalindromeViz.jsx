export default function LongestPalindromeViz({ s = "", stepState = {}, t }) {
  const str = typeof s === "string" ? s : "";
  const chars = str ? str.split("") : [];
  const {
    i: center = -1,
    l: left = -1,
    r: right = -1,
    best = "",
    bestStart = -1,
    bestLen = 0,
    palindrome = "",
    type = null,
    action = null,
    done = false,
  } = stepState;

  // Current palindrome range: (left+1, right-1) after expand, so highlight indices from left+1 to right-1 inclusive
  const n = chars.length;
  const inPalindrome = (idx) => {
    if (left < 0 || right > n) return false;
    return idx >= left + 1 && idx < right;
  };
  const isL = (idx) => idx === left && left >= 0;
  const isR = (idx) => idx === right - 1 && right <= n && right > left + 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 4 }}>
        Expand around center: for each center try odd-length (i,i) and even-length (i,i+1), expand while s[l]==s[r], track longest.
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>center i</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.blue }}>{center >= 0 ? center : "—"}</span>
        </div>
        {(left >= 0 || right >= 0) && (
          <>
            <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt }}>
              <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>l</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.purple }}>{left}</span>
            </div>
            <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt }}>
              <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>r</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.purple }}>{right}</span>
            </div>
          </>
        )}
        {type && (
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", padding: "4px 10px", border: `2px solid ${t.border}`, borderRadius: 8, background: type === "odd" ? t.blue + "22" : t.yellow + "22", color: t.ink }}>{type === "odd" ? "odd (i,i)" : "even (i,i+1)"}</span>
        )}
        {action && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, fontStyle: "italic" }}>{action}</span>}
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          string s
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flexWrap: "wrap", paddingTop: 48 }}>
          {chars.map((c, idx) => {
            const inPal = inPalindrome(idx);
            const isCenter = idx === center;
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
                <div style={{ position: "absolute", bottom: "100%", marginBottom: 8, whiteSpace: "nowrap" }}>
                  {isCenter && !done && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 700, color: t.blue }}>i</span>}
                  {isL(idx) && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85em", color: t.purple }}>l</span>}
                  {isR(idx) && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85em", color: t.purple }}>r</span>}
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    border: `2.5px solid ${isCenter ? t.blue : inPal ? t.green : t.border}`,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: "1.2em",
                    fontWeight: 700,
                    background: isCenter ? t.blue + "25" : inPal ? t.green + "30" : t.surface,
                    color: t.ink,
                    transform: inPal || isCenter ? "translateY(-4px) scale(1.05)" : "scale(1)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {c}
                </div>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted }}>{idx}</span>
              </div>
            );
          })}
        </div>
        {palindrome && !done && (
          <div style={{ marginTop: 8, fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>
            Current: <span style={{ color: t.green, fontWeight: 700 }}>&quot;{palindrome}&quot;</span>
          </div>
        )}
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          best
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, color: t.green, padding: "12px 16px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt }}>
          {best ? `"${best}"` : '""'} {bestLen > 0 && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85em", color: t.inkMuted }}>(length {bestLen})</span>}
        </div>
      </div>

      {done && (
        <div style={{ padding: "12px 18px", borderRadius: 10, border: `2px solid ${t.green}`, background: t.green + "22", fontFamily: "'JetBrains Mono',monospace", fontSize: "1.05em", fontWeight: 800, color: t.green }}>
          Answer: &quot;{best}&quot;
        </div>
      )}
    </div>
  );
}
