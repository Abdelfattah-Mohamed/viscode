import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabase, NOTES_TABLE } from "../utils/supabase";

export function useProblemNotes(user, problemId) {
  const email = user?.email?.toLowerCase() || null;
  const isGuest = !user || user.isGuest;

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  // Only allow saves once notes for the current (email, problemId) have hydrated.
  // Prevents problem-switch blur/disable from upserting "" (or the previous
  // problem's text) onto the newly selected problem.
  const [hydratedKey, setHydratedKey] = useState(null);

  const saveTimeoutRef = useRef(null);
  const notesRef = useRef(notes);
  const loadSeqRef = useRef(0);
  notesRef.current = notes;

  const activeKey = email && problemId ? `${email}::${problemId}` : null;
  const canSave = !!activeKey && hydratedKey === activeKey && !isGuest;

  const saveToSupabase = useCallback(async (emailVal, problemIdVal, text) => {
    const sb = getSupabase();
    if (!sb || !emailVal || !problemIdVal) return;

    try {
      await sb.from(NOTES_TABLE).upsert(
        {
          email: emailVal,
          problem_id: problemIdVal,
          notes: text || "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email,problem_id" }
      );
    } catch (_) {
      // Best-effort cloud sync; local textarea state remains.
    }
  }, []);

  useEffect(() => {
    if (isGuest || !email || !problemId) {
      setNotes("");
      setHydratedKey(null);
      setLoading(false);
      return;
    }

    const effectEmail = email;
    const effectProblemId = problemId;
    const effectKey = `${effectEmail}::${effectProblemId}`;
    const seq = ++loadSeqRef.current;

    setLoading(true);
    setHydratedKey(null);
    setNotes("");

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
        .eq("email", effectEmail)
        .eq("problem_id", effectProblemId)
        .maybeSingle();
      if (cancelled || seq !== loadSeqRef.current) return;
      setNotes(data?.notes ?? "");
      setHydratedKey(effectKey);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      // Flush debounced edits for the problem we are leaving before identity changes.
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
        saveToSupabase(effectEmail, effectProblemId, notesRef.current);
      }
    };
  }, [email, problemId, isGuest, saveToSupabase]);

  const saveNotes = useCallback(
    (text) => {
      if (!canSave || !email || !problemId) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        saveToSupabase(email, problemId, text);
      }, 500);
    },
    [canSave, email, problemId, saveToSupabase]
  );

  const handleChange = useCallback(
    (e) => {
      const next = e.target.value;
      notesRef.current = next;
      setNotes(next);
      saveNotes(next);
    },
    [saveNotes]
  );

  const handleBlur = useCallback(() => {
    // Ignore blur caused by disabling the textarea during hydrate / problem switch.
    if (!canSave || !email || !problemId) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    // Prefer the ref so a blur in the same tick as onChange does not save a stale value.
    saveToSupabase(email, problemId, notesRef.current);
  }, [canSave, email, problemId, saveToSupabase]);

  return isGuest ? null : { notes, setNotes, loading, handleChange, handleBlur };
}
