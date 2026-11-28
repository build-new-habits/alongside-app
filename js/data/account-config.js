/**
 * js/data/account-config.js
 * 28 Nov 2026 v1
 *
 * Row 13a ACCOUNTS, S1 (spec docs/specs/alongside_accounts_spec_28nov2026_v2.md).
 * Where the accounts live: the Supabase project's web address
 * (https://<ref>.supabase.co) and its public (anon) key. Empty: there is no
 * account step anywhere, nothing is ever sent, and the trial stays on the
 * phone as before. Graeme sets these once the project and the email sender
 * exist (S3's setup guide).
 */
export const ACCOUNTS = Object.freeze({ url: "", anonKey: "" });
