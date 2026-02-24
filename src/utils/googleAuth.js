/**
 * Decode Google ID token JWT payload (client-side only; for display).
 * In production with a backend, verify the token on the server.
 */
export function decodeGoogleIdToken(credential) {
  if (!credential || typeof credential !== "string") return null;
  try {
    const parts = credential.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch (_) {
    return null;
  }
}

export function getGoogleClientId() {
  return typeof import.meta !== "undefined" && import.meta.env?.VITE_GOOGLE_CLIENT_ID?.trim?.()
    ? import.meta.env.VITE_GOOGLE_CLIENT_ID.trim()
    : "";
}
