function Btn({ onClick, label, disabled, accent, t }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700,
        padding: "5px 13px",
        border: `2px solid ${t.border}`, borderRadius: 8,
        background: accent ? t.yellow : t.surface,
        color: accent ? t.ink : disabled ? t.inkMuted : t.ink,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        boxShadow: disabled ? "none" : t.shadowSm,
        transition: "all 0.15s",
      }}>
      {label}
    </button>
  );
}

export default function StepControls({ isPlaying, stepIndex, totalSteps, play, pause, next, prev, reset, setSpeed, t }) {
  const progress = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "12px 16px",
      borderTop: `1.5px solid ${t.border}`,
      background: t.surfaceAlt, flexShrink: 0,
    }}>
      <Btn onClick={reset} label="⏮" disabled={stepIndex === 0 && !isPlaying} t={t} />
      <Btn onClick={prev}  label="◀" disabled={stepIndex === 0} t={t} />
      <Btn onClick={isPlaying ? pause : play}
        label={isPlaying ? "⏸" : "▶"}
        disabled={!isPlaying && stepIndex === totalSteps - 1}
        accent t={t} />
      <Btn onClick={next} label="▶▶" disabled={stepIndex === totalSteps - 1} t={t} />

      {/* Progress bar */}
      <div style={{ flex: 1, height: 6, background: t.surfaceAlt, border: `1.5px solid ${t.border}`, borderRadius: 3, overflow: "hidden", margin: "0 4px" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: t.yellow, transition: "width 0.3s ease", borderRadius: 2 }} />
      </div>

      {/* Speed */}
      <select defaultValue="900" onChange={e => setSpeed(Number(e.target.value))}
        style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85rem", border: `2px solid ${t.border}`, borderRadius: 6, padding: "2px 6px", background: t.surface, color: t.ink, cursor: "pointer" }}>
        <option value="1600">0.5×</option>
        <option value="900">1×</option>
        <option value="500">1.5×</option>
        <option value="300">2×</option>
      </select>

      <span style={{ fontFamily: "'Caveat',cursive", fontWeight: 700, color: t.inkMuted, fontSize: "0.95rem", whiteSpace: "nowrap" }}>
        {stepIndex + 1} / {totalSteps}
      </span>
    </div>
  );
}
