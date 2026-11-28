/**
 * js/data/account-client.js
 * 28 Nov 2026 v1
 *
 * Row 13a ACCOUNTS, S1. The only calls the app makes to the account service,
 * all through call(), only while it is set up (a Supabase https address and
 * its public key), only to the addresses listed in PATHS, with no cookies or
 * referrer. It imports nothing and touches no store: data/account.js decides
 * what to send. What can be sent, and nothing else (a gate reads every body):
 * the email address, the code, the code's type, the refresh token, and the
 * local day a trial starts. Never a health answer, a check-in, a session, a
 * note or a name.
 *
 *   accountClient(config, fetch)  { on, sendCode, verifyCode, refresh,
 *     signOut, changeEmail, verifyEmailChange, readAccount, startTrial,
 *     endTrial, deleteAccount }  each resolves { ok, status, data }; a
 *     network failure rejects.
 */

const PATHS = new Set([
  "/auth/v1/otp", "/auth/v1/verify", "/auth/v1/token", "/auth/v1/logout", "/auth/v1/user",
  "/rest/v1/accounts",
  "/rest/v1/rpc/start_my_trial", "/rest/v1/rpc/end_my_trial", "/rest/v1/rpc/delete_my_account",
]);
const METHODS = new Set(["GET", "POST", "PUT"]);
const BODY_KEYS = new Set(["email", "token", "type", "create_user", "refresh_token", "p_today"]);

export function accountClient(config = {}, fetchImpl = globalThis.fetch) {
  const url = typeof config.url === "string" ? config.url.replace(/\/+$/, "") : "";
  const anonKey = typeof config.anonKey === "string" ? config.anonKey : "";
  const on = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) && anonKey.length > 20;

  async function call(path, { method = "POST", body = null, token = "" } = {}) {
    if (!on) throw new Error("account: the account service is not set up");
    if (!PATHS.has(path.split("?")[0])) throw new Error("account: not an account address");
    if (!METHODS.has(method)) throw new Error("account: not an allowed method");
    if (body && Object.keys(body).some(k => !BODY_KEYS.has(k))) throw new Error("account: not something the account may send");
    const res = await fetchImpl(`${url}${path}`, {
      method, credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store",
      headers: { apikey: anonKey, "Content-Type": "application/json", Authorization: `Bearer ${token || anonKey}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch { data = null; }
    return { ok: !!res.ok, status: res.status, data };
  }

  return {
    on,
    sendCode: email => call("/auth/v1/otp", { body: { email, create_user: true } }),
    verifyCode: (email, token) => call("/auth/v1/verify", { body: { email, token, type: "email" } }),
    refresh: refresh_token => call("/auth/v1/token?grant_type=refresh_token", { body: { refresh_token } }),
    signOut: token => call("/auth/v1/logout", { token }),
    changeEmail: (token, email) => call("/auth/v1/user", { method: "PUT", token, body: { email } }),
    verifyEmailChange: (email, token) => call("/auth/v1/verify", { body: { email, token, type: "email_change" } }),
    readAccount: token => call("/rest/v1/accounts?select=tier,trial_started_at,trial_ends_on,trial_ended_at,trial_ended_how", { method: "GET", token }),
    startTrial: (token, p_today) => call("/rest/v1/rpc/start_my_trial", { token, body: { p_today } }),
    endTrial: token => call("/rest/v1/rpc/end_my_trial", { token, body: {} }),
    deleteAccount: token => call("/rest/v1/rpc/delete_my_account", { token, body: {} }),
  };
}
