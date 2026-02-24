import { useRef, useEffect } from "react";

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

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeLine]);

  return (
    <div ref={scrollRef} style={{
      fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem", lineHeight: 1.85,
      background: "#2D2A2E", color: "#FCFCFA",
      overflowY: "auto", overflowX: "auto",
      height: "100%", minHeight: 0,
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
  );
}
