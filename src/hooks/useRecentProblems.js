import { useState, useCallback } from "react";

const LS_KEY = "vc:recent";
const MAX = 5;

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(list) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
}

export function useRecentProblems() {
  const [recent, setRecent] = useState(load);

  const track = useCallback((id) => {
    setRecent(prev => {
      const next = [id, ...prev.filter(x => x !== id)].slice(0, MAX);
      save(next);
      return next;
    });
  }, []);

  return { recent, track };
}
