function Btn({ onClick, disabled, accent, t, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: "'Caveat',cursive",
        width: 34,
        height: 34,
        borderRadius: 8,
        border: "none",
        background: accent ? t.yellow : t.ink,
        color: accent ? t.ink : t.surface,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        boxShadow: disabled ? "none" : t.shadowSm,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        transition: "transform 0.08s ease, box-shadow 0.15s ease, opacity 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}

function IconTriangle({ direction = "right" }) {
  const base = {
    width: 0,
    height: 0,
    borderTop: "7px solid transparent",
    borderBottom: "7px solid transparent",
  };

  const style =
    direction === "right"
      ? { ...base, borderLeft: "12px solid currentColor" }
      : { ...base, borderRight: "12px solid currentColor" };

  return <div style={style} />;
}

function IconBar() {
  return (
    <div
      style={{
        width: 3,
        height: 14,
        background: "currentColor",
        borderRadius: 1,
      }}
    />
  );
}

function IconPrevWithBar() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <IconBar />
      <IconTriangle direction="left" />
    </div>
  );
}

function IconNextWithBar() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <IconTriangle direction="right" />
      <IconBar />
    </div>
  );
}

function IconPrevDouble() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
      <div style={{ transform: "scale(0.75)" }}>
        <IconTriangle direction="left" />
      </div>
      <div style={{ transform: "scale(0.75)" }}>
        <IconTriangle direction="left" />
      </div>
    </div>
  );
}

function IconNextDouble() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
      <div style={{ transform: "scale(0.75)" }}>
        <IconTriangle direction="right" />
      </div>
      <div style={{ transform: "scale(0.75)" }}>
        <IconTriangle direction="right" />
      </div>
    </div>
  );
}

function IconPause() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <IconBar />
      <IconBar />
    </div>
  );
}

export default function StepControls({
  isPlaying,
  stepIndex,
  totalSteps,
  play,
  pause,
  next,
  prev,
  jumpToStart,
  jumpToEnd,
  reset,
  setSpeed,
  t,
  mobile,
}) {
  const progress = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: mobile ? 4 : 8,
        padding: mobile ? "10px 8px" : "12px 16px",
        borderTop: `1.5px solid ${t.border}`,
        background: t.surfaceAlt,
        flexShrink: 0,
        flexWrap: mobile ? "wrap" : "nowrap",
        justifyContent: mobile ? "center" : undefined,
      }}
    >
      {/* Jump to start (all the way back) */}
      <Btn onClick={jumpToStart} disabled={stepIndex === 0} t={t}>
        <IconPrevDouble />
      </Btn>

      {/* Step back (single step with bar) */}
      <Btn onClick={prev} disabled={stepIndex === 0} t={t}>
        <IconPrevWithBar />
      </Btn>

      {/* Play / Pause */}
      <Btn
        onClick={isPlaying ? pause : play}
        disabled={!isPlaying && stepIndex === totalSteps - 1}
        accent
        t={t}
      >
        {isPlaying ? <IconPause /> : <IconTriangle direction="right" />}
      </Btn>

      {/* Step forward (single step with bar) */}
      <Btn onClick={next} disabled={stepIndex === totalSteps - 1} t={t}>
        <IconNextWithBar />
      </Btn>

      {/* Jump to end (all the way forward) */}
      <Btn onClick={jumpToEnd} disabled={stepIndex === totalSteps - 1} t={t}>
        <IconNextDouble />
      </Btn>

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
