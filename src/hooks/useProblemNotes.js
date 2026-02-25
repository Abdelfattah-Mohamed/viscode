import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabase, NOTES_TABLE } from "../utils/supabase";

export function useProblemNotes(user, problemId) {
  const email = user?.email?.toLowerCase() || null;
  const isGuest = !user || user.isGuest;

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef(null);

  const saveToSupabase = useCallback(
    async (emailVal, problemIdVal, text) => {
      const sb = getSupabase();
      if (!sb || !emailVal || !problemIdVal) return;

      try {
        await sb.from(NOTES_TABLE).upsert(
          { email: emailVal, problem_id: problemIdVal, notes: text || "", updated_at: new Date().toISOString() },
          { onConflict: "email,problem_id" }
        );
      } catch (_) {}
    },
    []
  );

  useEffect(() => {
    if (isGuest || !email || !problemId) {
      setNotes("");
      setLoading(false);
      return;
    }

    setNotes("");
    setLoading(true);
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data } = await sb
        .from(NOTES_TABLE)
        .select("notes")
        .eq("email", email)
        .eq("problem_id", problemId)
        .maybeSingle();
      if (!cancelled && data) setNotes(data.notes ?? "");
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [email, problemId, isGuest]);

  const saveNotes = useCallback(
    (text) => {
      if (isGuest || !email || !problemId) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        saveToSupabase(email, problemId, text);
      }, 500);
    },
    [email, problemId, isGuest, saveToSupabase]
  );

  const handleChange = useCallback(
    (e) => {
      const next = e.target.value;
      setNotes(next);
      saveNotes(next);
    },
    [saveNotes]
  );

  const handleBlur = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    saveToSupabase(email, problemId, notes);
  }, [email, problemId, notes, saveToSupabase]);

  return isGuest ? null : { notes, setNotes, loading, handleChange, handleBlur };
}
