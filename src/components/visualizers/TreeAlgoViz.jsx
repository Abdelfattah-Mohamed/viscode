import TreeDepthViz from "./TreeDepthViz";

/** Tree problems sharing TreeDepthViz + an info panel from stepState. */
export default function TreeAlgoViz({ root = [], stepState = {}, t }) {
  const {
    queue = [], currentLevel = [], result = [], lo, hi, k, count, answer,
    maxSum, gain, pathThrough, valid, preorder, inorder, built = [],
    preL, preR, highlightPre, highlightIn, rootVal,
  } = stepState;

  const panel = [];
  if (queue?.length) panel.push(`queue: [${queue.join(", ")}]`);
  if (currentLevel?.length) panel.push(`level: [${currentLevel.join(", ")}]`);
  if (result?.length) panel.push(`result: ${JSON.stringify(result)}`);
  if (lo !== undefined || hi !== undefined) panel.push(`bounds: (${lo ?? "-∞"}, ${hi ?? "∞"})`);
  if (valid === false) panel.push("invalid BST!");
  if (k) panel.push(`k = ${k}, count = ${count ?? 0}`);
  if (answer != null) panel.push(`answer = ${answer}`);
  if (maxSum != null) panel.push(`maxSum = ${maxSum}`);
  if (gain != null) panel.push(`gain = ${gain}`);
  if (pathThrough != null) panel.push(`pathThrough = ${pathThrough}`);
  if (preorder?.length) panel.push(`preorder: [${preorder.join(", ")}]`);
  if (inorder?.length) panel.push(`inorder: [${inorder.join(", ")}]`);
  if (built?.length) panel.push(`built: [${built.join(", ")}]`);
  if (rootVal != null) panel.push(`root = ${rootVal}`);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
      <TreeDepthViz root={root} stepState={stepState} t={t} />
      {panel.length > 0 && (
        <div style={{
          padding: "10px 16px", borderRadius: 8, border: `2px solid ${t.border}`,
          background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8em",
          color: t.ink, maxWidth: "100%", wordBreak: "break-word",
        }}>
          {panel.map((line, i) => <div key={i}>{line}</div>)}
          {highlightPre != null && <div style={{ marginTop: 6, color: t.blue }}>▶ preorder[{highlightPre}]</div>}
          {highlightIn != null && <div style={{ color: t.purple }}>▶ inorder[{highlightIn}]</div>}
        </div>
      )}
    </div>
  );
}
