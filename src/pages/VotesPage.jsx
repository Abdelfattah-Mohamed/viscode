import { useEffect, useMemo, useState } from "react";
import NavBar from "../components/ui/NavBar";
import PageContainer from "../components/ui/PageContainer";
import AccountMenuChip from "../components/ui/AccountMenuChip";
import { Card } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { trackEvent } from "../utils/analytics";

const STORAGE_KEY = "viscode-content-votes-v1";
const VOTED_STORAGE_KEY_PREFIX = "viscode-content-votes-voted-v1";

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

function userScopedStorageKey(prefix, user, username) {
  if (user?.isGuest) return null;
  const identity = user?.email || user?.sub || username;
  const normalized = String(identity || "").trim().toLowerCase();
  return normalized ? `${prefix}:${encodeURIComponent(normalized)}` : null;
}

function readVotedIds(storageKey) {
  if (!storageKey) return new Set();
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : []);
  } catch {
    return new Set();
  }
}

function saveVotedIds(storageKey, votedIds) {
  if (!storageKey) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify([...votedIds]));
  } catch {
    // Ignore localStorage errors.
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
  const votedStorageKey = useMemo(
    () => userScopedStorageKey(VOTED_STORAGE_KEY_PREFIX, user, username),
    [user?.email, user?.isGuest, user?.sub, username]
  );
  const [items, setItems] = useState(() => readItems());
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("LeetCode Problem");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [votedIds, setVotedIds] = useState(() => readVotedIds(votedStorageKey));
  const adminEmails = String(import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_EMAIL || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  const currentEmail = String(user?.email || "").trim().toLowerCase();
  const isAdmin = !!currentEmail && adminEmails.includes(currentEmail);

  useEffect(() => {
    setVotedIds(readVotedIds(votedStorageKey));
  }, [votedStorageKey]);

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
    setVotedIds((prev) => {
      const updated = new Set(prev).add(id);
      saveVotedIds(votedStorageKey, updated);
      return updated;
    });
    trackEvent("content_request_created", { requestId: id, category });
    setTitle("");
    setDescription("");
  };

  const vote = (id) => {
    if (votedIds.has(id)) return;
    const next = items.map((item) => (item.id === id ? { ...item, votes: item.votes + 1 } : item));
    setItems(next);
    saveItems(next);
    setVotedIds((prev) => {
      const updated = new Set(prev).add(id);
      saveVotedIds(votedStorageKey, updated);
      return updated;
    });
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

      <PageContainer mobile={mobile} maxWidth={1000} paddingMobile="24px 12px 40px" paddingDesktop="36px 24px 56px">
        <Card t={t} style={{ padding: mobile ? "18px 16px" : "22px 24px", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: mobile ? "1.8rem" : "2.2rem", fontWeight: 700, color: t.ink }}>
            Vote for new content
          </div>
          <p style={{ margin: "6px 0 0", color: t.inkMuted, fontSize: "0.92rem", lineHeight: 1.6 }}>
            Request any new LeetCode problem or learning content. Most-voted requests get prioritized in upcoming releases.
          </p>
        </Card>

        <Card t={t} style={{ padding: "14px", marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.2fr 0.8fr", gap: 10 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. LeetCode 295 - Find Median from Data Stream"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${t.border}`, background: t.surface, color: t.ink }}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${t.border}`, background: t.surface, color: t.ink }}
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
            style={{ width: "100%", marginTop: 10, padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${t.border}`, background: t.surface, color: t.ink, resize: "vertical" }}
          />
          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requests..."
              style={{ padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${t.border}`, background: t.surface, color: t.ink, minWidth: 220 }}
            />
            <Button t={t} variant="primary" onClick={createRequest} style={{ borderRadius: 8 }}>
              Submit + vote
            </Button>
          </div>
        </Card>

        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((item) => {
            const voted = votedIds.has(item.id);
            return (
              <Card key={item.id} t={t} density="compact" style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{
                      fontFamily: "'Caveat',cursive",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: item.alreadyAdded ? t.inkMuted : t.ink,
                      textDecoration: item.alreadyAdded ? "line-through" : "none",
                      textDecorationThickness: item.alreadyAdded ? "2px" : undefined,
                    }}>
                      {item.title}
                    </div>
                    <div style={{ marginTop: 3, fontSize: "0.8rem", color: t.inkMuted }}>
                      {item.category} · {new Date(item.createdAt).toLocaleDateString()}
                      {item.alreadyAdded && (
                        <span style={{ marginLeft: 8, color: t.green, fontWeight: 700 }}>
                          · Added
                        </span>
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
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, color: t.ink, padding: "5px 8px", borderRadius: 8, border: `1.5px solid ${t.border}`, background: t.surfaceAlt }}>
                      {item.votes} votes
                    </span>
                    {isAdmin && (
                      <Button
                        t={t}
                        variant={item.alreadyAdded ? "ghost" : "secondary"}
                        onClick={() => markAlreadyAdded(item.id)}
                        style={{ borderRadius: 8, borderColor: item.alreadyAdded ? t.green : undefined, color: item.alreadyAdded ? t.green : undefined }}
                      >
                        {item.alreadyAdded ? "Added ✓" : "Already added"}
                      </Button>
                    )}
                    <Button
                      t={t}
                      variant={voted ? "ghost" : "secondary"}
                      onClick={() => vote(item.id)}
                      style={{ borderRadius: 8, opacity: voted ? 0.8 : 1 }}
                    >
                      {voted ? "Voted" : "Upvote"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </PageContainer>
    </div>
  );
}
