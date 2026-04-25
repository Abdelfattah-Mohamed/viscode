import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { getAvatarEmoji, isValidAvatarId } from "../../data/avatars";

export default function AccountMenuChip({
  t,
  mobile,
  themeMode,
  setThemeMode,
  username,
  user,
  onProfile,
  onLogout,
}) {
  const [open, setOpen] = useState(false);
  const avatarId = isValidAvatarId(user?.avatarId) ? user.avatarId : 1;
  const hasExternalPicture = !!user?.picture && !user?.picture?.startsWith?.("avatar:");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 12 }}>
      {!mobile && <ThemeToggle mode={themeMode} setMode={setThemeMode} t={t} />}
      {!mobile && <div style={{ width: 1, height: 28, background: t.border, opacity: 0.3 }} />}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 12px",
            border: `2px solid ${t.border}`,
            borderRadius: 8,
            background: "transparent",
            color: t.ink,
            cursor: "pointer",
            fontFamily: "'Caveat',cursive",
            fontSize: "0.95rem",
            fontWeight: 700,
            boxShadow: t.shadowSm,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: hasExternalPicture ? "transparent" : t.blue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.8rem",
              overflow: "hidden",
            }}
          >
            {hasExternalPicture ? (
              <img src={user.picture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "1rem", lineHeight: 1 }}>{getAvatarEmoji(avatarId)}</span>
            )}
          </div>
          {!mobile && (username ?? "User")} ▾
        </button>
        {open && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 6px)",
              background: t.surface,
              border: `1.5px solid ${t.border}`,
              borderRadius: 10,
              boxShadow: t.shadow,
              zIndex: 300,
              minWidth: 160,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 16px",
                fontFamily: "'Caveat',cursive",
                fontSize: "0.9rem",
                color: t.inkMuted,
                borderBottom: `1.5px solid ${t.border}`,
              }}
            >
              {username ?? "User"}
            </div>
            {mobile && (
              <div style={{ padding: "8px 16px", borderBottom: `1.5px solid ${t.border}` }}>
                <ThemeToggle mode={themeMode} setMode={setThemeMode} t={t} />
              </div>
            )}
            <button
              onClick={() => {
                setOpen(false);
                onProfile?.();
              }}
              style={{
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                border: "none",
                background: "transparent",
                color: t.ink,
                cursor: "pointer",
                fontFamily: "'Caveat',cursive",
                fontSize: "0.95rem",
                fontWeight: 700,
              }}
            >
              Profile
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onLogout?.();
              }}
              style={{
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                border: "none",
                background: "transparent",
                color: t.red,
                cursor: "pointer",
                fontFamily: "'Caveat',cursive",
                fontSize: "0.95rem",
                fontWeight: 700,
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
