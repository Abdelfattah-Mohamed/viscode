import { useEffect } from "react";
import Button from "./Button";
import { DIFF_COLOR, CAT_ICON } from "../../data/problems";

const PRO_PERKS = [
  { icon: "🔓", text: "Unlock every problem category" },
  { icon: "🎛️", text: "Editable custom inputs & live previews" },
  { icon: "⭐", text: "Favorites, flags & saved study flow" },
];

export default function PremiumModal({ t, mobile, problem, onClose, onUpgrade }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!problem) return null;
  const dc = DIFF_COLOR[problem.difficulty] || {};

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,15,25,0.55)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "vc-modal-fade 0.16s ease-out",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Pro problem"
    >
      <style>{`
        @keyframes vc-modal-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes vc-modal-pop { from { opacity: 0; transform: translateY(10px) scale(0.97) } to { opacity: 1; transform: none } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(460px, 100%)",
          background: `linear-gradient(160deg, ${t.surface} 0%, ${t.surfaceAlt} 100%)`,
          border: `1.5px solid ${t.border}`,
          borderRadius: 18,
          boxShadow: t._resolved === "dark" ? "0 24px 80px rgba(0,0,0,0.6)" : "0 24px 80px rgba(28,28,46,0.28)",
          padding: mobile ? "22px 18px" : "26px 26px 24px",
          position: "relative",
          animation: "vc-modal-pop 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            border: "none",
            background: "none",
            color: t.inkMuted,
            cursor: "pointer",
            fontSize: "1.2rem",
            lineHeight: 1,
            padding: 6,
            borderRadius: 8,
          }}
        >
          ✕
        </button>

        {/* Lock icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${t.blue}33, ${t.blue}14)`,
            border: `1.5px solid ${t.blue}66`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.7rem",
            marginBottom: 14,
          }}
        >
          🔒
        </div>

        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: t.blue + "18", border: `1.25px solid ${t.blue}66`, color: t.blue, fontSize: "0.74rem", fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase" }}>
          Pro problem
        </span>

        <h2 style={{ fontFamily: "'Caveat',cursive", fontSize: mobile ? "1.8rem" : "2.05rem", fontWeight: 700, color: t.ink, margin: "12px 0 6px", lineHeight: 1.1 }}>
          {problem.title}
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: t.inkMuted, fontWeight: 700 }}>
            <span>{CAT_ICON[problem.category] || "📌"}</span>
            {problem.category}
          </span>
          {problem.difficulty && (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.78rem", fontWeight: 700, padding: "2px 9px", border: `1.5px solid ${t.border}`, borderRadius: 10, ...dc }}>
              {problem.difficulty}
            </span>
          )}
        </div>

        <p style={{ margin: "0 0 16px", color: t.inkMuted, fontSize: "0.92rem", lineHeight: 1.6 }}>
          This problem is part of <strong style={{ color: t.ink }}>Pro</strong>. Famous Algorithms are free for everyone — upgrade to unlock the full visual practice library.
        </p>

        <div style={{ display: "grid", gap: 9, padding: "14px 15px", borderRadius: 12, background: t.bg, border: `1.25px solid ${t.border}`, marginBottom: 18 }}>
          {PRO_PERKS.map((perk) => (
            <div key={perk.text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.86rem", color: t.ink }}>
              <span style={{ fontSize: "1rem" }} aria-hidden="true">{perk.icon}</span>
              <span>{perk.text}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: 10 }}>
          <Button
            t={t}
            variant="primary"
            onClick={onUpgrade}
            style={{ flex: 1, borderRadius: 10, fontWeight: 700, fontSize: "0.98rem", padding: "12px 18px" }}
          >
            View Pro plans →
          </Button>
          <Button
            t={t}
            variant="ghost"
            onClick={onClose}
            style={{ borderRadius: 10, fontWeight: 700, padding: "12px 18px" }}
          >
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}
