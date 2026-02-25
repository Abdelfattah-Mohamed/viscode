import { useRef, useEffect, useState, useCallback } from "react";

const KW = new Set([
  "function","return","const","let","var","for","if","of","in","new","undefined",
  "def","while","else","int","public","Map","Set","HashSet","HashMap","vector",
  "unordered_map","unordered_set","void","bool","true","false","max","Math",
  "contains","count","size","length","enumerate","begin","end","True","False","None",
]);

function tokenizeLine(line) {
  const parts = []; let buf = "", i = 0;
  const flush = () => { if (buf) { parts.push(buf); buf = ""; } };
  while (i < line.length) {
    if (line[i] === '"' || line[i] === "'") {
      flush(); const q = line[i]; let s = q; i++;
      while (i < line.length && line[i] !== q) s += line[i++];
      s += q; i++;
      parts.push(<span key={`str${i}`} style={{ color: "#FFD866" }}>{s}</span>);
      continue;
    }
    if ((line[i] === '/' && line[i + 1] === '/') || line[i] === '#') {
      flush();
      parts.push(<span key={`cmt${i}`} style={{ color: "#727072", fontStyle: "italic" }}>{line.slice(i)}</span>);
      break;
    }
    if (/[a-zA-Z_$]/.test(line[i])) {
      let word = "";
      while (i < line.length && /[\w$]/.test(line[i])) word += line[i++];
      if (KW.has(word)) { flush(); parts.push(<span key={`kw${i}${word}`} style={{ color: "#FF6188" }}>{word}</span>); }
      else buf += word;
      continue;
    }
    if (/\d/.test(line[i])) {
      flush(); let n = "";
      while (i < line.length && /[\d.]/.test(line[i])) n += line[i++];
      parts.push(<span key={`num${i}${n}`} style={{ color: "#AB9DF2" }}>{n}</span>);
      continue;
    }
    buf += line[i++];
  }
  flush();
  return parts;
}

export default function CodePanel({ lines, activeLine }) {
  const activeRef = useRef(null);
  const scrollRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeLine]);

  const handleCopy = useCallback(() => {
    const text = lines.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }, [lines]);

  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "relative", height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <button
        onClick={handleCopy}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "absolute", top: 8, right: 12, zIndex: 10,
          display: "flex", alignItems: "center", gap: 5,
          padding: "4px 10px",
          fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", fontWeight: 600,
          border: "1px solid transparent", borderRadius: 6,
          background: copied ? "rgba(166,227,161,0.18)" : hovered ? "rgba(255,255,255,0.12)" : "transparent",
          color: copied ? "#a6e3a1" : hovered ? "rgba(252,252,250,0.95)" : "rgba(252,252,250,0.4)",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        {copied ? (
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        ) : (
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
        )}
        {copied ? "Copied!" : "Copy"}
      </button>

      <div ref={scrollRef} style={{
        fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem", lineHeight: 1.85,
        background: "#2D2A2E", color: "#FCFCFA",
        overflowY: "auto", overflowX: "auto",
        flex: 1, minHeight: 0,
        paddingTop: 6, paddingBottom: 6,
      }}>
        <div style={{ minWidth: "max-content" }}>
          {lines.map((line, idx) => {
            const num = idx + 1;
            const active = num === activeLine;
            return (
              <div key={idx} ref={active ? activeRef : null} style={{
                display: "flex", alignItems: "center",
                padding: "0 14px", minHeight: 26,
                background: active ? "rgba(255,216,102,0.12)" : "transparent",
                borderLeft: `3px solid ${active ? "#FFD866" : "transparent"}`,
                transition: "background 0.2s, border-color 0.2s",
              }}>
                <span style={{ width: 26, color: "#727072", fontSize: "0.7rem", flexShrink: 0, userSelect: "none", textAlign: "right", paddingRight: 10 }}>{num}</span>
                <span style={{ whiteSpace: "pre" }}>{tokenizeLine(line)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
