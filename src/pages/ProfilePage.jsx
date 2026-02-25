import { useState } from "react";
import NavBar from "../components/ui/NavBar";
import ThemeToggle from "../components/ui/ThemeToggle";
import { Card } from "../components/ui/Card";
import { AVATARS, getAvatarEmoji } from "../data/avatars";
import { PROBLEMS, DIFF_COLOR, CAT_ICON } from "../data/problems";

const TrashIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: 6 }}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const StarIcon = ({ filled, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke={filled ? "#f59e0b" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const FlagIcon = ({ filled, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const XIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function ProfilePage({ user, t, themeMode, setThemeMode, onNavigate, onLogout, onDeleteAccount, onUpdateProfile, fav, onSelectProblem, mobile }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const currentAvatarId = user?.avatarId && user.avatarId >= 1 && user.avatarId <= 10 ? user.avatarId : 1;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: t.bg, color: t.ink, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}`}</style>

      <NavBar
        page="profile"
        onNavigate={onNavigate}
        t={t}
        themeMode={themeMode}
        mobile={mobile}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 12 }}>
            {!mobile && <ThemeToggle mode={themeMode} setMode={setThemeMode} t={t} />}
            {!mobile && <div style={{ width: 1, height: 28, background: t.border, opacity: 0.3 }} />}
            <button
              type="button"
              onClick={onLogout}
              style={{
                padding: "6px 14px",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "0.9rem",
                fontWeight: 600,
                border: `2px solid ${t.red}`,
                borderRadius: 8,
                background: "transparent",
                color: t.red,
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </div>
        }
      />

      <div style={{ flex: 1, maxWidth: 700, margin: "0 auto", padding: "40px 24px 60px", width: "100%" }}>
        <Card t={t} style={{ overflow: "hidden" }}>
          <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, borderBottom: `1.5px solid ${t.border}` }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: user?.picture && !user?.picture?.startsWith?.("avatar:") ? "transparent" : t.blue,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontFamily: "'Caveat',cursive",
                fontSize: "2.2rem",
                fontWeight: 700,
                overflow: "hidden",
              }}
            >
              {user?.picture && !user.picture.startsWith?.("avatar:") ? (
                <img src={user.picture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "2.5rem" }}>{getAvatarEmoji(currentAvatarId)}</span>
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.5rem", fontWeight: 700, color: t.ink }}>{user?.username || "—"}</div>
              {!user?.isGuest && onUpdateProfile && (
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(true)}
                  style={{
                    marginTop: 8,
                    padding: "6px 14px",
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    border: `2px solid ${t.border}`,
                    borderRadius: 8,
                    background: t.surface,
                    color: t.ink,
                    cursor: "pointer",
                  }}
                >
                  Change avatar
                </button>
              )}
            </div>
          </div>

          {!user?.isGuest && onUpdateProfile && showAvatarPicker && (
            <div style={{ padding: "20px 24px", borderBottom: `1.5px solid ${t.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: t.inkMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Choose avatar</label>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  style={{
                    padding: "6px 14px",
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: 8,
                    background: "transparent",
                    color: t.inkMuted,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Cancel
                </button>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {AVATARS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      onUpdateProfile({ avatarId: a.id });
                      setShowAvatarPicker(false);
                    }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border: currentAvatarId === a.id ? `3px solid ${t.blue}` : `2px solid ${t.border}`,
                      background: currentAvatarId === a.id ? t.surfaceAlt : t.surface,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                    title={`Avatar ${a.id}`}
                  >
                    {a.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: t.inkMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Username</label>
              <div style={{ padding: "10px 14px", background: t.surfaceAlt, borderRadius: 8, border: `1.5px solid ${t.border}`, fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 600, color: t.ink }}>
                {user?.username || "—"}
              </div>
            </div>
            {user?.email && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: t.inkMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</label>
                <div style={{ padding: "10px 14px", background: t.surfaceAlt, borderRadius: 8, border: `1.5px solid ${t.border}`, fontFamily: "'DM Sans',sans-serif", fontSize: "0.95rem", color: t.ink }}>
                  {user.email}
                </div>
              </div>
            )}
            {memberSince && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: t.inkMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Member since</label>
                <div style={{ padding: "10px 14px", background: t.surfaceAlt, borderRadius: 8, border: `1.5px solid ${t.border}`, fontSize: "0.9rem", color: t.ink }}>
                  {memberSince}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Favorites */}
        <Card t={t} style={{ marginTop: 24, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1.5px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <StarIcon filled size={20} />
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.2rem", fontWeight: 700, color: t.ink }}>
              Favorites {fav?.favorites.length ? <span style={{ color: t.blue }}>({fav.favorites.length})</span> : null}
            </span>
          </div>
          <div style={{ padding: "12px 16px" }}>
            {!fav?.favorites.length ? (
              <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.88rem", textAlign: "center", padding: "16px 0" }}>
                No favorite problems yet. Star problems to add them here.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fav.favorites.map(id => {
                  const p = PROBLEMS[id];
                  if (!p) return null;
                  const dc = DIFF_COLOR[p.difficulty] || {};
                  return (
                    <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: t.surfaceAlt, borderRadius: 10, border: `1.5px solid ${t.border}`, cursor: "pointer", transition: "transform 0.12s" }}
                      onClick={() => onSelectProblem?.(id)}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = ""}>
                      <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{CAT_ICON[p.category] || "📌"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05rem", fontWeight: 700, color: t.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                        <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.78rem", color: t.inkMuted }}>{p.category}</span>
                      </div>
                      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.72rem", fontWeight: 700, padding: "1px 8px", border: `1.5px solid ${t.border}`, borderRadius: 10, ...dc, flexShrink: 0 }}>{p.difficulty}</span>
                      <button
                        onClick={e => { e.stopPropagation(); fav.toggleFavorite(id); }}
                        title="Remove from favorites"
                        style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: t.inkMuted, display: "flex", borderRadius: 6, flexShrink: 0 }}
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Flagged */}
        <Card t={t} style={{ marginTop: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1.5px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <FlagIcon filled size={20} />
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.2rem", fontWeight: 700, color: t.ink }}>
              Flagged {fav?.flagged.length ? <span style={{ color: t.red }}>({fav.flagged.length})</span> : null}
            </span>
          </div>
          <div style={{ padding: "12px 16px" }}>
            {!fav?.flagged.length ? (
              <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.88rem", textAlign: "center", padding: "16px 0" }}>
                No flagged problems yet. Flag problems you want to revisit.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fav.flagged.map(id => {
                  const p = PROBLEMS[id];
                  if (!p) return null;
                  const dc = DIFF_COLOR[p.difficulty] || {};
                  return (
                    <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: t.surfaceAlt, borderRadius: 10, border: `1.5px solid ${t.border}`, cursor: "pointer", transition: "transform 0.12s" }}
                      onClick={() => onSelectProblem?.(id)}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = ""}>
                      <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{CAT_ICON[p.category] || "📌"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05rem", fontWeight: 700, color: t.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                        <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.78rem", color: t.inkMuted }}>{p.category}</span>
                      </div>
                      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.72rem", fontWeight: 700, padding: "1px 8px", border: `1.5px solid ${t.border}`, borderRadius: 10, ...dc, flexShrink: 0 }}>{p.difficulty}</span>
                      <button
                        onClick={e => { e.stopPropagation(); fav.toggleFlagged(id); }}
                        title="Remove flag"
                        style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: t.inkMuted, display: "flex", borderRadius: 6, flexShrink: 0 }}
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => onNavigate("home")}
            style={{
              padding: "10px 20px",
              fontFamily: "'Caveat',cursive",
              fontSize: "1.05rem",
              fontWeight: 700,
              border: `2px solid ${t.border}`,
              borderRadius: 8,
              background: t.surface,
              color: t.ink,
              cursor: "pointer",
              boxShadow: t.shadowSm,
            }}
          >
            ← Back to Home
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: "10px 20px",
              fontFamily: "'Caveat',cursive",
              fontSize: "1.05rem",
              fontWeight: 700,
              border: `2px solid ${t.red}`,
              borderRadius: 8,
              background: "transparent",
              color: t.red,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>

        {!user?.isGuest && onDeleteAccount && (
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${t.border}` }}>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => { setConfirmDelete(true); setDeleteError(""); }}
                style={{
                  padding: "10px 20px",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  border: `1px solid ${t.border}`,
                  borderRadius: 8,
                  background: "transparent",
                  color: t.inkMuted,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <TrashIcon size={18} color={t.inkMuted} />
                Delete my account
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ margin: 0, fontSize: "0.9rem", color: t.inkMuted }}>
                  Are you sure? This will permanently delete your account and cannot be undone.
                </p>
                {deleteError && (
                  <p style={{ margin: 0, fontSize: "0.85rem", color: t.red }}>{deleteError}</p>
                )}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={async () => {
                      setDeleting(true);
                      setDeleteError("");
                      const res = await onDeleteAccount(user);
                      setDeleting(false);
                      if (res?.error) setDeleteError(res.error);
                      else setConfirmDelete(false);
                    }}
                    disabled={deleting}
                    style={{
                      padding: "10px 20px",
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      border: `2px solid ${t.red}`,
                      borderRadius: 8,
                      background: t.red,
                      color: "#fff",
                      cursor: deleting ? "wait" : "pointer",
                      opacity: deleting ? 0.7 : 1,
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    <TrashIcon size={18} color="#fff" />
                    {deleting ? "Deleting…" : "Yes, delete my account"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setConfirmDelete(false); setDeleteError(""); }}
                    disabled={deleting}
                    style={{
                      padding: "10px 20px",
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      border: `2px solid ${t.border}`,
                      borderRadius: 8,
                      background: t.surface,
                      color: t.ink,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
