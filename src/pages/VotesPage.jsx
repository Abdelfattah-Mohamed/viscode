import { useMemo, useState, useEffect, useCallback } from "react";
import NavBar from "../components/ui/NavBar";
import PageContainer from "../components/ui/PageContainer";
import AccountMenuChip from "../components/ui/AccountMenuChip";
import { Card } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getSupabase } from "../utils/supabase";
import { trackEvent } from "../utils/analytics";

const STORAGE_KEY = "viscode-content-votes-v1";
const REQUESTS_TABLE = "content_requests";
const VOTES_TABLE = "content_votes";

/* ── Local fallback (used only when Supabase is not configured) ── */

const SEED_ITEMS = [
  { id: "lc-146-lru-cache", title: "Add LeetCode 146: LRU Cache", category: "LeetCode Problem", description: "Include a full visualizer for doubly linked list + hash map interactions.", votes: 6, createdAt: "2026-05-01T10:00:00.000Z" },
  { id: "algo-kmp", title: "Add KMP string matching algorithm", category: "Algorithm Topic", description: "Show prefix table construction and matching traversal step by step.", votes: 4, createdAt: "2026-05-02T12:00:00.000Z" },
  { id: "lc-208-trie", title: "Add LeetCode 208: Implement Trie (Prefix Tree)", category: "LeetCode Problem", description: "Visualize node insertion, prefix traversal, and word-end markers.", votes: 9, createdAt: "2026-05-03T08:40:00.000Z" },
  { id: "lc-76-min-window-substring", title: "Add LeetCode 76: Minimum Window Substring", category: "LeetCode Problem", description: "Detailed left/right window movement with frequency map state changes.", votes: 12, createdAt: "2026-05-05T18:05:00.000Z" },
  { id: "algo-toposort", title: "Add Topological Sort (Kahn + DFS) comparison", category: "Algorithm Topic", description: "Show indegree queue flow and contrast with DFS postorder approach.", votes: 6, createdAt: "2026-05-06T09:00:00.000Z" },
];

function readLocalItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...SEED_ITEMS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...SEED_ITEMS];
    const ids = new Set(parsed.map((x) => x.id));
    return [...parsed, ...SEED_ITEMS.filter((x) => !ids.has(x.id))];
  } catch {
    return [...SEED_ITEMS];
  }
}

function saveLocalItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore localStorage errors
  }
}

function toLocalId(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function VotesPage({ t, themeMode, setThemeMode, onNavigate, onLogout, username, user, mobile }) {
  const sb = getSupabase();
  const isGuest = !user || user.isGuest;
  const userId = !isGuest ? user?.id : null;
  const isAdmin = !!user?.isAdmin;

  const [items, setItems] = useState(() => (sb ? [] : readLocalItems()));
  const [votedIds, setVotedIds] = useState(() => new Set());
  const [loading, setLoading] = useState(!!sb);
  const [notice, setNotice] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("LeetCode Problem");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");

  const refetch = useCallback(async () => {
    if (!sb) return;
    setLoading(true);
    try {
      const [{ data: requests }, ownVotes] = await Promise.all([
        sb
          .from(REQUESTS_TABLE)
          .select(`id, title, category, description, already_added, created_at, ${VOTES_TABLE}(count)`)
          .order("created_at", { ascending: false }),
        userId
          ? sb.from(VOTES_TABLE).select("request_id").eq("user_id", userId)
          : Promise.resolve({ data: [] }),
      ]);
      const mapped = (requests || []).map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        description: r.description,
        alreadyAdded: !!r.already_added,
        createdAt: r.created_at,
        votes: r[VOTES_TABLE]?.[0]?.count ?? 0,
      }));
      setItems(mapped);
      setVotedIds(new Set((ownVotes?.data || []).map((v) => v.request_id)));
    } catch {
      setNotice({ type: "error", text: "Couldn't load requests. Please try again." });
    } finally {
      setLoading(false);
    }
  }, [sb, userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? items.filter((item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q))
      : items;
    return [...list].sort((a, b) => b.votes - a.votes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [items, search]);

  const requireAccount = () => {
    setNotice({ type: "info", text: "Sign in with an account to vote and suggest content." });
    return isGuest;
  };

  const createRequest = async () => {
    const cleanedTitle = title.trim();
    if (!cleanedTitle) return;
    setNotice(null);

    if (sb) {
      if (isGuest && requireAccount()) return;
      const { data: created, error } = await sb
        .from(REQUESTS_TABLE)
        .insert({
          title: cleanedTitle,
          category,
          description: description.trim() || "No extra description provided.",
          created_by: userId,
        })
        .select("id")
        .maybeSingle();
      if (error || !created?.id) {
        setNotice({ type: "error", text: "Couldn't submit the request. Please try again." });
        return;
      }
      await sb.from(VOTES_TABLE).insert({ request_id: created.id, user_id: userId });
      trackEvent("content_request_created", { requestId: created.id, category });
      setTitle("");
      setDescription("");
      refetch();
      return;
    }

    // Local fallback
    const idBase = toLocalId(cleanedTitle) || `request-${Date.now()}`;
    const id = items.some((x) => x.id === idBase) ? `${idBase}-${Date.now()}` : idBase;
    const next = [
      ...items,
      { id, title: cleanedTitle, category, description: description.trim() || "No extra description provided.", votes: 1, createdAt: new Date().toISOString() },
    ];
    setItems(next);
    saveLocalItems(next);
    setVotedIds((prev) => new Set(prev).add(id));
    trackEvent("content_request_created", { requestId: id, category });
    setTitle("");
    setDescription("");
  };

  const vote = async (id) => {
    setNotice(null);
    if (sb) {
      if (isGuest && requireAccount()) return;
      const hasVoted = votedIds.has(id);
      // Optimistic toggle
      setVotedIds((prev) => {
        const next = new Set(prev);
        if (hasVoted) next.delete(id);
        else next.add(id);
        return next;
      });
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, votes: item.votes + (hasVoted ? -1 : 1) } : item)));
      const { error } = hasVoted
        ? await sb.from(VOTES_TABLE).delete().eq("request_id", id).eq("user_id", userId)
        : await sb.from(VOTES_TABLE).insert({ request_id: id, user_id: userId });
      if (error) refetch();
      else if (!hasVoted) trackEvent("content_request_voted", { requestId: id });
      return;
    }

    // Local fallback (no unvote)
    if (votedIds.has(id)) return;
    const next = items.map((item) => (item.id === id ? { ...item, votes: item.votes + 1 } : item));
    setItems(next);
    saveLocalItems(next);
    setVotedIds((prev) => new Set(prev).add(id));
    trackEvent("content_request_voted", { requestId: id });
  };

  const markAlreadyAdded = async (id) => {
    const current = items.find((x) => x.id === id);
    if (!current) return;
    const nextValue = !current.alreadyAdded;

    if (sb) {
      const { error } = await sb.from(REQUESTS_TABLE).update({ already_added: nextValue }).eq("id", id);
      if (error) {
        setNotice({ type: "error", text: "Only admins can mark requests as added." });
        return;
      }
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, alreadyAdded: nextValue } : item)));
      trackEvent("content_request_marked_added", { requestId: id });
      return;
    }

    const next = items.map((item) => (item.id === id ? { ...item, alreadyAdded: nextValue } : item));
    setItems(next);
    saveLocalItems(next);
    trackEvent("content_request_marked_added", { requestId: id });
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: t.bg, color: t.ink, minHeight: "100vh" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}`}</style>
      <NavBar
        page="votes"
        onNavigate={onNavigate}
        t={t}
        themeMode={themeMode}
        mobile={mobile}
        right={
          <AccountMenuChip
            t={t}
            mobile={mobile}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            username={username}
            user={user}
            onProfile={() => onNavigate("profile")}
            onLogout={onLogout}
          />
        }
      />

      <main id="main-content">
      <PageContainer mobile={mobile} maxWidth={1000} paddingMobile="24px 12px 40px" paddingDesktop="44px 24px 56px">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: mobile ? 24 : 34 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 999, background: t.blue + "1f", border: `1.5px solid ${t.blue}66`, color: t.blue, fontSize: "0.8rem", fontWeight: 800 }}>
            Shape the roadmap
          </span>
          <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: mobile ? "2.4rem" : "3.1rem", lineHeight: 1.05, fontWeight: 700, color: t.ink, margin: "14px 0 10px" }}>
            Vote for new content.
          </h1>
          <p style={{ margin: "0 auto", maxWidth: 560, fontSize: "1rem", color: t.inkMuted, lineHeight: 1.6 }}>
            Request any LeetCode problem or algorithm topic. The most-voted requests get prioritized in upcoming releases.
          </p>
        </div>

        {notice && (
          <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${notice.type === "error" ? t.red : t.blue}66`, background: (notice.type === "error" ? t.red : t.blue) + "12", color: notice.type === "error" ? t.red : t.ink, fontSize: "0.88rem", display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span>{notice.text}</span>
            <button onClick={() => setNotice(null)} style={{ background: "none", border: "none", color: t.inkMuted, cursor: "pointer", padding: 0 }} aria-label="Dismiss">✕</button>
          </div>
        )}

        {/* Submit a request */}
        <Card t={t} style={{ padding: mobile ? "16px" : "18px 20px", marginBottom: 22 }}>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.3rem", fontWeight: 700, color: t.ink, marginBottom: 12 }}>
            Suggest something new
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.2fr 0.8fr", gap: 10 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. LeetCode 295 - Find Median from Data Stream"
              style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.surface, color: t.ink }}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.surface, color: t.ink }}
            >
              <option>LeetCode Problem</option>
              <option>Algorithm Topic</option>
            </select>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Why this should be added and what visualization would help."
            style={{ width: "100%", marginTop: 10, padding: "11px 12px", borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.surface, color: t.ink, resize: "vertical" }}
          />
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <Button t={t} variant="primary" onClick={createRequest} style={{ borderRadius: 10, fontWeight: 700 }}>
              Submit + vote
            </Button>
          </div>
        </Card>

        {/* Requests list */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Caveat',cursive", fontSize: "1.6rem", margin: 0, color: t.ink }}>
            Requests {filtered.length ? `(${filtered.length})` : ""}
          </h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests..."
            style={{ padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.surface, color: t.ink, minWidth: mobile ? "100%" : 240 }}
          />
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {loading ? (
            <Card t={t} style={{ padding: 24 }}>
              <p style={{ margin: 0, textAlign: "center", color: t.inkMuted }}>Loading requests…</p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card t={t} style={{ padding: 24 }}>
              <p style={{ margin: 0, textAlign: "center", color: t.inkMuted }}>
                No requests match your search. Be the first to suggest one above.
              </p>
            </Card>
          ) : (
            filtered.map((item) => {
              const voted = votedIds.has(item.id);
              return (
                <Card key={item.id} t={t} density="compact" style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "stretch", gap: 14 }}>
                    {/* Vote control */}
                    <button
                      onClick={() => vote(item.id)}
                      aria-pressed={voted}
                      style={{
                        flexShrink: 0,
                        width: 58,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        padding: "8px 0",
                        borderRadius: 12,
                        border: `1.5px solid ${voted ? t.blue : t.border}`,
                        background: voted ? t.blue + "16" : t.surfaceAlt,
                        color: voted ? t.blue : t.ink,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      title={voted ? "Remove your vote" : "Upvote"}
                    >
                      <span style={{ fontSize: "0.9rem", lineHeight: 1 }}>▲</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.05rem", fontWeight: 800, lineHeight: 1.1 }}>
                        {item.votes}
                      </span>
                    </button>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontFamily: "'Caveat',cursive",
                            fontSize: "1.15rem",
                            fontWeight: 700,
                            color: item.alreadyAdded ? t.inkMuted : t.ink,
                            textDecoration: item.alreadyAdded ? "line-through" : "none",
                            textDecorationThickness: item.alreadyAdded ? "2px" : undefined,
                          }}>
                            {item.title}
                          </div>
                          <div style={{ marginTop: 3, fontSize: "0.78rem", color: t.inkMuted }}>
                            <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, border: `1px solid ${t.border}`, background: t.surfaceAlt, marginRight: 6 }}>
                              {item.category}
                            </span>
                            {new Date(item.createdAt).toLocaleDateString()}
                            {item.alreadyAdded && (
                              <span style={{ marginLeft: 6, color: t.green, fontWeight: 700 }}>· Added</span>
                            )}
                          </div>
                        </div>
                        {isAdmin && (
                          <Button
                            t={t}
                            variant={item.alreadyAdded ? "ghost" : "secondary"}
                            size="sm"
                            onClick={() => markAlreadyAdded(item.id)}
                            style={{ borderRadius: 8, borderColor: item.alreadyAdded ? t.green : undefined, color: item.alreadyAdded ? t.green : undefined }}
                          >
                            {item.alreadyAdded ? "Added ✓" : "Already added"}
                          </Button>
                        )}
                      </div>
                      <div style={{
                        marginTop: 6,
                        fontSize: "0.86rem",
                        color: t.inkMuted,
                        lineHeight: 1.55,
                        textDecoration: item.alreadyAdded ? "line-through" : "none",
                        opacity: item.alreadyAdded ? 0.85 : 1,
                      }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </PageContainer>
      </main>
    </div>
  );
}
