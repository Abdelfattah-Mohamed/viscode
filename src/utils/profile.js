import { getSupabase, PROFILES_TABLE } from "./supabase";

function profileRowFromAuthUser(authUser) {
  const meta = authUser.user_metadata || {};
  const email = authUser.email?.toLowerCase() || null;
  const username =
    meta.username ||
    meta.name ||
    meta.full_name ||
    email?.split("@")[0] ||
    "User";
  const avatar = meta.avatar_url || meta.picture || "avatar:1";
  const provider = authUser.app_metadata?.provider === "google" ? "google" : "email";
  return {
    id: authUser.id,
    email,
    username,
    avatar_url: avatar,
    provider,
  };
}

/** Ensure a profiles row exists for the signed-in user (needed before billing). */
export async function ensureProfile() {
  const sb = getSupabase();
  if (!sb) return { error: "Not configured" };

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session?.user?.id) return { error: "Not signed in" };

  const { data: existing } = await sb
    .from(PROFILES_TABLE)
    .select("id")
    .eq("id", session.user.id)
    .maybeSingle();
  if (existing?.id) return { ok: true, profileId: existing.id };

  const { data: created, error } = await sb
    .from(PROFILES_TABLE)
    .upsert(profileRowFromAuthUser(session.user), { onConflict: "id" })
    .select("id")
    .maybeSingle();

  if (error) return { error: error.message };
  if (created?.id) return { ok: true, profileId: created.id };
  return { error: "Could not create profile" };
}
