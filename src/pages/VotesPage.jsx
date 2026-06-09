import { useMemo, useState } from "react";
import NavBar from "../components/ui/NavBar";
import PageContainer from "../components/ui/PageContainer";
import AccountMenuChip from "../components/ui/AccountMenuChip";
import { Card } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { trackEvent } from "../utils/analytics";

const STORAGE_KEY = "viscode-content-votes-v1";

const SEED_ITEMS = [
  {
    id: "lc-146-lru-cache",
    title: "Add LeetCode 146: LRU Cache",
    category: "LeetCode Problem",
    description: "Include a full visualizer for doubly linked list + hash map interactions.",
    votes: 6,
    createdAt: "2026-05-01T10:00:00.000Z",
  },
  {
    id: "algo-kmp",
    title: "Add KMP string matching algorithm",
    category: "Algorithm Topic",
    description: "Show prefix table construction and matching traversal step by step.",
    votes: 4,
    createdAt: "2026-05-02T12:00:00.000Z",
  },
  {
    id: "lc-208-trie",
    title: "Add LeetCode 208: Implement Trie (Prefix Tree)",
    category: "LeetCode Problem",
    description: "Visualize node insertion, prefix traversal, and word-end markers.",
    votes: 9,
    createdAt: "2026-05-03T08:40:00.000Z",
  },
  {
    id: "lc-295-median-stream",
    title: "Add LeetCode 295: Find Median from Data Stream",
    category: "LeetCode Problem",
    description: "Show max-heap/min-heap balancing and median updates per insertion.",
    votes: 11,
    createdAt: "2026-05-03T14:20:00.000Z",
  },
  {
    id: "algo-dijkstra",
    title: "Add Dijkstra shortest path walkthrough",
    category: "Algorithm Topic",
    description: "Step through priority queue pops, relax operations, and distance table.",
    votes: 7,
    createdAt: "2026-05-04T09:15:00.000Z",
  },
  {
    id: "lc-124-binary-tree-max-path",
    title: "Add LeetCode 124: Binary Tree Maximum Path Sum",
    category: "LeetCode Problem",
    description: "Explain gain propagation from children and global best path updates.",
    votes: 8,
    createdAt: "2026-05-04T17:55:00.000Z",
  },
  {
    id: "algo-union-find",
    title: "Add Union-Find (DSU) fundamentals module",
    category: "Algorithm Topic",
    description: "Demonstrate path compression and union by rank with evolving parent arrays.",
    votes: 5,
    createdAt: "2026-05-05T10:10:00.000Z",
  },
  {
    id: "lc-23-merge-k-lists",
    title: "Add LeetCode 23: Merge k Sorted Lists",
    category: "LeetCode Problem",
    description: "Compare heap-based merge against divide-and-conquer merge process.",
    votes: 10,
    createdAt: "2026-05-05T13:35:00.000Z",
  },
  {
    id: "lc-76-min-window-substring",
    title: "Add LeetCode 76: Minimum Window Substring",
    category: "LeetCode Problem",
    description: "Detailed left/right window movement with frequency map state changes.",
    votes: 12,
    createdAt: "2026-05-05T18:05:00.000Z",
  },
  {
    id: "algo-toposort",
    title: "Add Topological Sort (Kahn + DFS) comparison",
    category: "Algorithm Topic",
    description: "Show indegree queue flow and contrast with DFS postorder approach.",
    votes: 6,
    createdAt: "2026-05-06T09:00:00.000Z",
  },
];

function readItems() {
  const sanitize = (list) =>
    (Array.isArray(list) ? list : []).filter((item) => {
      const title = String(item?.title || "").toLowerCase();
      const category = String(item?.category || "").toLowerCase();
      if (title.includes("system design")) return false;
      if (category.includes("system design")) return false;
      return true;
    });
  const mergeWithSeeds = (list) => {
    const existing = Array.isArray(list) ? list : [];
    const existingIds = new Set(existing.map((item) => item.id));
    const toAdd = SEED_ITEMS.filter((item) => !existingIds.has(item.id));
    return sanitize([...existing, ...toAdd]);
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sanitize(SEED_ITEMS);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return sanitize(SEED_ITEMS);
    return mergeWithSeeds(parsed);
  } catch {
    return sanitize(SEED_ITEMS);
  }
}

function saveItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore localStorage errors
  }
}

function toId(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function VotesPage({ t, themeMode, setThemeMode, onNavigate, onLogout, username, user, mobile }) {
  const [items, setItems] = useState(() => readItems());
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("LeetCode Problem");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [votedIds, setVotedIds] = useState(() => new Set());
  const adminEmails = String(import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  const currentEmail = String(user?.email || "").trim().toLowerCase();
  const isAdmin = adminEmails.includes(currentEmail) || String(username || "").trim().toLowerCase() === "admin";

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

  const createRequest = () => {
    const cleanedTitle = title.trim();
    if (!cleanedTitle) return;
    const idBase = toId(cleanedTitle) || `request-${Date.now()}`;
    const id = items.some((x) => x.id === idBase) ? `${idBase}-${Date.now()}` : idBase;
    const next = [
      ...items,
      {
        id,
        title: cleanedTitle,
        category,
        description: description.trim() || "No extra description provided.",
        votes: 1,
        createdAt: new Date().toISOString(),
      },
    ];
    setItems(next);
    saveItems(next);
    setVotedIds((prev) => new Set(prev).add(id));
    trackEvent("content_request_created", { requestId: id, category });
    setTitle("");
    setDescription("");
  };

  const vote = (id) => {
    if (votedIds.has(id)) return;
    const next = items.map((item) => (item.id === id ? { ...item, votes: item.votes + 1 } : item));
    setItems(next);
    saveItems(next);
    setVotedIds((prev) => new Set(prev).add(id));
    trackEvent("content_request_voted", { requestId: id });
  };

  const markAlreadyAdded = (id) => {
    const next = items.map((item) => {
      if (item.id !== id) return item;
      const currentlyAdded = !!item.alreadyAdded;
      return {
        ...item,
        alreadyAdded: !currentlyAdded,
        addedAt: !currentlyAdded ? new Date().toISOString() : null,
      };
    });
    setItems(next);
    saveItems(next);
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
          {filtered.length === 0 ? (
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
                      disabled={voted}
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
                        cursor: voted ? "default" : "pointer",
                        transition: "all 0.15s ease",
                      }}
                      title={voted ? "You voted" : "Upvote"}
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
    </div>
  );
}
