export default function ArrayVisualizer({ nums, stepState = {}, t, arrayLabel }) {
  const {
    highlight = [],
    found = false,
    i: ci,
    map = {},
    complement,
    maxSum,
    currentSum,
    done,
    w: knapsackW,
    sourceW: knapsackSourceW,
    weights = [],
    values = [],
    candidate,
    prev,
  } = stepState;
  const isKadane = maxSum !== undefined;
  const label = arrayLabel ?? "nums";
  const isKnapsack = label === "dp" && Array.isArray(weights) && weights.length > 0;
  const arrayTopPadding = isKnapsack ? 20 : 64;
  const showTarget = !arrayLabel && !isKadane;
  const showHashMap = !isKadane && arrayLabel !== "dp" && arrayLabel !== "ans";
  const cellBg = idx => {
    if (isKadane) return highlight.includes(idx) ? t.yellow : t.surface;
    return found && highlight.includes(idx) ? t.green : highlight.includes(idx) ? t.yellow : t.surface;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {isKnapsack && (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 700, color: t.inkMuted }}>
              Input arrays
            </span>
            {ci >= 0 && ci < weights.length && (
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72em", color: t.blue }}>
                item pointer i={ci} (w={weights[ci]}, v={values[ci]})
              </span>
            )}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72em", color: t.inkMuted, marginBottom: 4 }}>weights</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {weights.map((val, idx) => (
                  <div
                    key={`kw-${idx}`}
                    style={{
                      minWidth: 42,
                      height: 42,
                      borderRadius: 8,
                      border: `2px solid ${idx === ci ? t.blue : t.border}`,
                      background: idx === ci ? t.blue + "18" : t.surface,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Caveat',cursive",
                      fontSize: "1.1em",
                      fontWeight: 700,
                      color: t.ink,
                    }}
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72em", color: t.inkMuted, marginBottom: 4 }}>values</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {values.map((val, idx) => (
                  <div
                    key={`kv-${idx}`}
                    style={{
                      minWidth: 42,
                      height: 42,
                      borderRadius: 8,
                      border: `2px solid ${idx === ci ? t.purple : t.border}`,
                      background: idx === ci ? t.purple + "18" : t.surface,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Caveat',cursive",
                      fontSize: "1.1em",
                      fontWeight: 700,
                      color: t.ink,
                    }}
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
          {label} {showTarget && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7em" }}>(target = {stepState.target ?? "?"})</span>}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap", paddingTop: arrayTopPadding }}>
          {nums.map((val, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
              <div style={{ position: "absolute", bottom: "100%", marginBottom: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}>
                {!isKadane && idx === ci && !found && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1em", fontWeight: 700, color: t.blue }}>i={idx}</span>}
                {!isKadane && complement !== undefined && !found && idx === ci && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.92em", color: t.purple }}>need {complement}</span>}
                {isKnapsack && knapsackW >= 0 && idx === knapsackW && (
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72em", fontWeight: 700, color: t.blue }}>w</span>
                )}
                {isKnapsack && knapsackSourceW >= 0 && idx === knapsackSourceW && (
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72em", fontWeight: 700, color: t.purple }}>w-wi</span>
                )}
                {!isKadane && found && highlight.includes(idx) && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.1em", color: t.green, fontWeight: 700 }}>✓</span>}
                {isKadane && idx === ci && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1em", fontWeight: 700, color: t.blue }}>i={idx}</span>}
              </div>
              <div style={{ width: 54, height: 54, border: `2.5px solid ${t.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Caveat',cursive", fontSize: "1.4em", fontWeight: 700, background: cellBg(idx), color: t.ink, transform: highlight.includes(idx) ? "translateY(-8px) scale(1.1)" : "scale(1)", boxShadow: highlight.includes(idx) ? t.shadowSm : "none", transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>{val}</div>
              <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted }}>{idx}</span>
            </div>
          ))}
        </div>
      </div>
      {isKnapsack && knapsackW >= 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ padding: "7px 10px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72em", color: t.inkMuted }}>
            capacity pointer w = {knapsackW}
          </div>
          {knapsackSourceW >= 0 && (
            <div style={{ padding: "7px 10px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72em", color: t.inkMuted }}>
              source pointer w-wi = {knapsackSourceW}
            </div>
          )}
          {Number.isFinite(prev) && Number.isFinite(candidate) && (
            <div style={{ padding: "7px 10px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72em", color: t.inkMuted }}>
              compare: prev {prev} vs take {candidate}
            </div>
          )}
        </div>
      )}

      {isKadane ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>currentSum</span>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.3em", fontWeight: 700, color: t.blue }}>{currentSum}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>maxSum</span>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.3em", fontWeight: 700, color: t.green }}>{maxSum}</span>
          </div>
          {done && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 700, color: t.green }}>✅ Done</span>}
        </div>
      ) : showHashMap ? (
        <div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
            hash map <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7em" }}>{"{value → index}"}</span>
          </div>
          {Object.keys(map).length === 0
            ? <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", color: t.inkMuted, fontStyle: "italic" }}>{"{ }  empty"}</div>
            : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Object.entries(map).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", border: `2px solid ${t.border}`, borderRadius: 8, overflow: "hidden", fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 600, boxShadow: t.shadowSm, animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
                    <span style={{ padding: "3px 10px", background: t.purple, color: "#fff", borderRight: `2px solid ${t.border}` }}>{k}</span>
                    <span style={{ padding: "3px 10px", background: t.surfaceAlt, color: t.ink }}>→ {v}</span>
                  </div>
                ))}
              </div>
          }
        </div>
      ) : null}
    </div>
  );
}
