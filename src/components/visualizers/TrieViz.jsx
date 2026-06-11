export default function TrieViz({ stepState = {}, t }) {
  const { trie, op, word = "", result, path = [], done = false } = stepState;

  const nodes = [];
  function walk(node, depth = 0, prefix = "") {
    if (!node) return;
    if (prefix) nodes.push({ ch: node.ch || prefix.slice(-1), depth, end: node.end, prefix });
    for (const key of Object.keys(node.children || {}).sort()) {
      walk(node.children[key], depth + 1, prefix + key);
    }
  }
  if (trie) walk(trie);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {op && (
        <div style={{
          padding: "10px 14px", borderRadius: 8, border: `2px solid ${done ? t.green : t.yellow}`,
          background: (done ? t.green : t.yellow) + "18", fontFamily: "'Caveat',cursive", fontWeight: 700,
        }}>
          {op}{word ? `("${word}")` : ""}{result != null ? ` → ${result}` : ""}
        </div>
      )}
      {path?.length > 0 && (
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85em", color: t.inkMuted }}>
          path: {path.join(" → ")}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.82em" }}>
        {nodes.length === 0 && <span style={{ color: t.inkMuted, fontStyle: "italic" }}>(empty trie)</span>}
        {nodes.map((n, i) => (
          <div key={i} style={{ paddingLeft: n.depth * 18, color: n.end ? t.green : t.ink }}>
            {n.depth > 0 ? `'${n.ch}'` : "root"}{n.end ? " ★" : ""}
          </div>
        ))}
      </div>
      {done && <div style={{ color: t.green, fontFamily: "'Caveat',cursive", fontWeight: 700 }}>✅ Done</div>}
    </div>
  );
}
