import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

type ProfileRow = { id: string; email: string | null };

type ResolveResult =
  | { profile: ProfileRow }
  | { error: string; status: number };

function profileFromAuthUser(authUser: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}) {
  const meta = authUser.user_metadata || {};
  const email = authUser.email?.toLowerCase() || null;
  const username =
    (typeof meta.username === "string" && meta.username) ||
    (typeof meta.name === "string" && meta.name) ||
    (typeof meta.full_name === "string" && meta.full_name) ||
    email?.split("@")[0] ||
    "User";
  const avatar =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    "avatar:1";
  const provider = authUser.app_metadata?.provider === "google" ? "google" : "email";
  return {
    id: authUser.id,
    email,
    username,
    avatar_url: avatar,
    provider,
  };
}

/** Resolve (and if needed create) the caller's profiles row from their JWT. */
export async function resolveProfileFromRequest(
  req: Request,
  admin: SupabaseClient
): Promise<ResolveResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { error: "Not signed in", status: 401 };

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData?.user?.id) {
    return { error: "Invalid session", status: 401 };
  }

  const authUser = userData.user;
  const { data: existing } = await admin
    .from("profiles")
    .select("id, email")
    .eq("id", authUser.id)
    .maybeSingle();
  if (existing?.id) return { profile: existing };

  const row = profileFromAuthUser(authUser);
  const { data: created, error: upsertError } = await admin
    .from("profiles")
    .upsert(row, { onConflict: "id" })
    .select("id, email")
    .maybeSingle();

  if (created?.id) return { profile: created };
  if (upsertError) {
    console.error("profile bootstrap failed:", upsertError);
    return { error: "Could not create profile", status: 500 };
  }

  return { error: "Profile not found. Sign up first.", status: 404 };
}
