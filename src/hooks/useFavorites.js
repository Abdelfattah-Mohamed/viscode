import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabase, FLAGS_TABLE } from "../utils/supabase";

const LS_PREFIX = "vc:flags:";

function lsKey(email) {
  return email ? LS_PREFIX + email.toLowerCase() : null;
}

function loadLocal(email) {
  const key = lsKey(email);
  if (!key) return { favorite: [], flagged: [] };
  try {
    return JSON.parse(localStorage.getItem(key)) || { favorite: [], flagged: [] };
  } catch {
    return { favorite: [], flagged: [] };
  }
}

function saveLocal(email, data) {
  const key = lsKey(email);
  if (!key) return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

export function useFavorites(user) {
  const [favorites, setFavorites] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const email = user?.email?.toLowerCase() || null;
  const isGuest = !user || user.isGuest;
  const emailRef = useRef(email);
  emailRef.current = email;

  useEffect(() => {
    if (isGuest || !email) {
      setFavorites([]);
      setFlagged([]);
      return;
    }

    let cancelled = false;
    const local = loadLocal(email);
    setFavorites(local.favorite);
    setFlagged(local.flagged);

    const sb = getSupabase();
    if (!sb) return;

    (async () => {
      const { data } = await sb
        .from(FLAGS_TABLE)
        .select("problem_id, flag_type")
        .eq("email", email);
      if (cancelled || !data) return;
      const fav = data.filter(r => r.flag_type === "favorite").map(r => r.problem_id);
      const flg = data.filter(r => r.flag_type === "flagged").map(r => r.problem_id);
      setFavorites(fav);
      setFlagged(flg);
      saveLocal(email, { favorite: fav, flagged: flg });
    })();

    return () => { cancelled = true; };
  }, [email, isGuest]);

  const toggle = useCallback((problemId, type) => {
    if (!emailRef.current) return;
    const setter = type === "favorite" ? setFavorites : setFlagged;
    const otherKey = type === "favorite" ? "flagged" : "favorite";

    setter(prev => {
      const exists = prev.includes(problemId);
      const next = exists ? prev.filter(id => id !== problemId) : [...prev, problemId];

      const otherSetter = type === "favorite" ? setFlagged : setFavorites;
      let otherVal;
      otherSetter(v => { otherVal = v; return v; });

      saveLocal(emailRef.current, { [type]: next, [otherKey]: otherVal ?? [] });

      const sb = getSupabase();
      if (sb && emailRef.current) {
        if (exists) {
          sb.from(FLAGS_TABLE).delete()
            .eq("email", emailRef.current)
            .eq("problem_id", problemId)
            .eq("flag_type", type)
            .then();
        } else {
          sb.from(FLAGS_TABLE).insert({ email: emailRef.current, problem_id: problemId, flag_type: type }).then();
        }
      }

      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id) => toggle(id, "favorite"), [toggle]);
  const toggleFlagged = useCallback((id) => toggle(id, "flagged"), [toggle]);
  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);
  const isFlagged = useCallback((id) => flagged.includes(id), [flagged]);

  return { favorites, flagged, toggleFavorite, toggleFlagged, isFavorite, isFlagged };
}
