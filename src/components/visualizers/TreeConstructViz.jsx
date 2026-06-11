import TreeAlgoViz from "./TreeAlgoViz";

export default function TreeConstructViz(props) {
  const { stepState = {}, t } = props;
  const { preorder = [], inorder = [], built = [], root = [], highlightPre, highlightIn } = stepState;
  const treeStepState = { ...stepState };
  delete treeStepState.preorder;
  delete treeStepState.inorder;
  delete treeStepState.built;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <ArrayRow label="preorder" arr={preorder} highlight={highlightPre} t={t} color={t.blue} />
        <ArrayRow label="inorder" arr={inorder} highlight={highlightIn} t={t} color={t.purple} />
      </div>
      {built?.length > 0 && (
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1em", color: t.green, textAlign: "center" }}>
          Built so far: [{built.join(" → ")}]
        </div>
      )}
      <div style={{ width: "100%" }}>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, marginBottom: 8, textAlign: "center" }}>
          Constructed tree
        </div>
        <TreeAlgoViz root={root} stepState={treeStepState} t={t} />
      </div>
    </div>
  );
}

function ArrayRow({ label, arr, highlight, t, color }) {
  return (
    <div>
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {arr.map((v, i) => (
          <div key={i} style={{
            minWidth: 36, padding: "6px 10px", borderRadius: 8, textAlign: "center",
            border: `2px solid ${i === highlight ? color : t.border}`,
            background: i === highlight ? color + "22" : t.surface,
            fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
          }}>{v}</div>
        ))}
      </div>
    </div>
  );
}
