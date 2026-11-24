/**
 * relay-config.js
 * 24 Nov 2026 v1
 *
 * P-45. Where the live link's relay is: the Supabase project's URL
 * (https://<ref>.supabase.co) and its anon (public) key. Empty: the live link
 * is off everywhere, and nothing is ever sent. The app (js/data/) and the
 * website (edit-plan/) keep one copy each, byte for byte (a gate compares them).
 * Graeme sets these once the project exists (BNH-Files, Admin, the setup guide).
 */
export const RELAY = Object.freeze({ url: "", anonKey: "" });
