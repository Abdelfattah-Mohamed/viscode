import { useState, useEffect } from "react";
import NavBar from "../components/ui/NavBar";
import ThemeToggle from "../components/ui/ThemeToggle";
import { Card } from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageContainer from "../components/ui/PageContainer";
import SectionHeader from "../components/ui/SectionHeader";
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
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [studyListTab, setStudyListTab] = useState("favorites");
  const currentAvatarId = user?.avatarId && user.avatarId >= 1 && user.avatarId <= 10 ? user.avatarId : 1;
  const hasExternalPicture = !!user?.picture && !user?.picture?.startsWith?.("avatar:") && !imageLoadFailed;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;
  const favoriteCount = fav?.favorites?.length || 0;
  const flaggedCount = fav?.flagged?.length || 0;
  const savedCount = favoriteCount + flaggedCount;
  const activeStudyIds = studyListTab === "favorites" ? (fav?.favorites || []) : (fav?.flagged || []);
  const activeStudyEmpty = studyListTab === "favorites"
    ? "No favorite problems yet. Star problems you want to revisit often."
    : "No flagged problems yet. Flag problems you want to revisit.";

  useEffect(() => {
    setImageLoadFailed(false);
  }, [user?.picture]);

  useEffect(() => {
    if (showAvatarPicker) setImageLoadFailed(false);
  }, [showAvatarPicker]);

  
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

      <PageContainer mobile={mobile} maxWidth={980} paddingMobile="24px 12px 44px" paddingDesktop="40px 24px 60px" style={{ flex: 1, width: "100%" }}>
        <Card t={t} style={{ overflow: "hidden", background: `linear-gradient(135deg, ${t.surface} 0%, ${t.surfaceAlt} 100%)` }}>
          <div style={{ padding: mobile ? "22px 18px" : "28px 30px", display: "grid", gridTemplateColumns: mobile ? "1fr" : "auto 1fr auto", alignItems: "center", gap: mobile ? 18 : 24, borderBottom: `1.5px solid ${t.border}` }}>
            <div style={{ display: "flex", justifyContent: mobile ? "center" : "flex-start" }}>
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background: hasExternalPicture ? "transparent" : t.blue,
                  border: `2px solid ${t.border}`,
                  boxShadow: t.shadowSm,
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
                {hasExternalPicture ? (
                  <img
                    src={user.picture}
                    alt=""
                    onError={() => setImageLoadFailed(true)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: "2.6rem" }}>{getAvatarEmoji(currentAvatarId)}</span>
                )}
              </div>
            </div>
            <div style={{ textAlign: mobile ? "center" : "left", minWidth: 0 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 800, color: t.inkMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
                Account profile
              </div>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: "2rem", lineHeight: 1.05, fontWeight: 700, color: t.ink }}>{user?.username || "—"}</div>
              <div style={{ marginTop: 8, color: t.inkMuted, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.email || (user?.isGuest ? "Guest session" : "No email available")}
              </div>
              {memberSince && (
                <div style={{ marginTop: 5, color: t.inkMuted, fontSize: "0.84rem" }}>
                  Member since {memberSince}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: mobile ? "row" : "column", justifyContent: mobile ? "center" : "flex-end", gap: 10, flexWrap: "wrap" }}>
              {!user?.isGuest && onUpdateProfile && (
                <Button t={t} variant="secondary" size="sm" onClick={() => setShowAvatarPicker(true)} style={{ borderRadius: 8 }}>
                  Change avatar
                </Button>
              )}
              <Button t={t} variant="secondary" size="sm" onClick={() => onNavigate("billing")} style={{ borderRadius: 8 }}>
                Billing
              </Button>
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

          <div style={{ padding: mobile ? "18px" : "22px 24px", display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 12, borderBottom: `1.5px solid ${t.border}` }}>
            {[
              { label: "Favorites", value: favoriteCount, color: t.yellow },
              { label: "Flagged", value: flaggedCount, color: t.red },
              { label: "Saved items", value: savedCount, color: t.blue },
            ].map((stat) => (
              <div key={stat.label} style={{ padding: "14px 15px", borderRadius: 12, border: `1.25px solid ${t.border}`, background: t.surface, boxShadow: t.shadowSm }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.25rem", fontWeight: 900, color: stat.color }}>
                  {stat.value}
                </div>
                <div style={{ marginTop: 3, color: t.inkMuted, fontSize: "0.82rem", fontWeight: 700 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </Card>

        {/* Study lists */}
        <div style={{ marginTop: 28 }}>
          <SectionHeader
            t={t}
            title="Study lists"
            subtitle="Keep important problems organized for review."
            compact
            style={{ marginBottom: 14 }}
          />
        </div>
        <Card t={t} style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1.5px solid ${t.border}`, background: t.surfaceAlt, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { key: "favorites", label: "Favorites", count: favoriteCount, icon: <StarIcon filled={studyListTab === "favorites"} size={15} />, color: t.yellow },
              { key: "flagged", label: "Flagged", count: flaggedCount, icon: <FlagIcon filled={studyListTab === "flagged"} size={15} />, color: t.red },
            ].map((tab) => {
              const active = studyListTab === tab.key;
              return (
                <Button
                  key={tab.key}
                  t={t}
                  variant={active ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setStudyListTab(tab.key)}
                  style={{
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: active ? t.yellow : t.ink,
                    background: active ? t.ink : t.surface,
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: active ? t.yellow : tab.color }}>
                    {tab.count}
                  </span>
                </Button>
              );
            })}
          </div>
          <div style={{ padding: "12px 16px" }}>
            {!activeStudyIds.length ? (
              <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.88rem", textAlign: "center", padding: "16px 0" }}>
                {activeStudyEmpty}
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: 340,
                  overflowY: activeStudyIds.length > 5 ? "auto" : "visible",
                  paddingRight: activeStudyIds.length > 5 ? 4 : 0,
                }}
              >
                {activeStudyIds.map(id => {
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
                        onClick={e => {
                          e.stopPropagation();
                          if (studyListTab === "favorites") fav.toggleFavorite(id);
                          else fav.toggleFlagged(id);
                        }}
                        title={studyListTab === "favorites" ? "Remove from favorites" : "Remove flag"}
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
          <Button t={t} variant="secondary" onClick={() => onNavigate("problems")} style={{ borderRadius: 8 }}>
            Browse problems
          </Button>
          <Button t={t} variant="secondary" onClick={() => onNavigate("home")} style={{ borderRadius: 8 }}>
            Back to Home
          </Button>
          <Button t={t} variant="ghost" onClick={onLogout} style={{ borderRadius: 8, borderColor: t.red, color: t.red }}>
            Sign out
          </Button>
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
      </PageContainer>
    </div>
  );
}
