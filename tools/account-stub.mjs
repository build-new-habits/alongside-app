/**
 * tools/account-stub.mjs
 * 28 Nov 2026 v1
 *
 * Row 13a ACCOUNTS, S2. The stand-in account service (as Supabase Auth and
 * REST answer) for verify-accounts-screens. The same answers as the one in
 * verify-accounts-rules.
 */
/** A stand-in for Supabase Auth and REST: answers the calls the app makes, and keeps a log. */
export function server({ code = "482917", createdAt = null } = {}) {
  const s = { code, log: [], users: {}, rows: {}, tokens: {}, n: 0, refreshOk: true, createdAt, fail: null };
  const tok = (p, id) => { s.n++; const t = `${p}-token-${String(s.n).padStart(6, "0")}`; s.tokens[t] = id; return t; };
  const res = (status, data) => ({ ok: status >= 200 && status < 300, status, json: async () => data });
  s.fetch = async (url, init = {}) => {
    const u = new URL(url);
    const body = init.body ? JSON.parse(init.body) : null;
    s.log.push({ url, path: u.pathname, method: init.method, body, init });
    if (s.fail) return res(s.fail, {});
    const who = s.tokens[(init.headers?.Authorization || "").replace(/^Bearer /, "")];
    switch (u.pathname) {
      case "/auth/v1/otp": return res(200, {});
      case "/auth/v1/verify": {
        if (body.token !== s.code) return res(403, { msg: "Token has expired or is invalid" });
        if (body.type === "email_change") { const id = Object.keys(s.users).find(k => s.users[k].email !== body.email) ; if (id) s.users[id].email = body.email; return res(200, {}); }
        let id = Object.keys(s.users).find(k => s.users[k].email === body.email);
        if (!id) { id = `0b1c2d3e-4f50-4a6b-8c7d-${String(Object.keys(s.users).length + 1).padStart(12, "0")}`; s.users[id] = { id, email: body.email, created_at: s.createdAt || new Date().toISOString() }; s.rows[id] = { tier: "free" }; }
        return res(200, { access_token: tok("access", id), refresh_token: tok("refresh", id), expires_in: 3600, user: s.users[id] });
      }
      case "/auth/v1/token": {
        const id = s.tokens[body.refresh_token];
        if (!s.refreshOk || !id) return res(400, { msg: "Invalid Refresh Token" });
        return res(200, { access_token: tok("access", id), refresh_token: tok("refresh", id), expires_in: 3600 });
      }
      case "/auth/v1/logout": return res(204, null);
      case "/auth/v1/user": return who ? res(200, {}) : res(401, {});
      case "/rest/v1/accounts": return who ? res(200, s.rows[who] ? [s.rows[who]] : []) : res(401, {});
      case "/rest/v1/rpc/start_my_trial": {
        if (!who) return res(401, {});
        const row = s.rows[who];
        if (row.trial_started_at) return res(400, { message: "one trial per account" });
        const [y, m, d] = body.p_today.split("-").map(Number);
        const end = new Date(Date.UTC(y, m - 1, d + 14)).toISOString().slice(0, 10);
        Object.assign(row, { trial_started_at: new Date(Date.UTC(y, m - 1, d, 9)).toISOString(), trial_ends_on: end });
        return res(200, null);
      }
      case "/rest/v1/rpc/end_my_trial": {
        if (!who) return res(401, {});
        Object.assign(s.rows[who], { trial_ended_at: new Date().toISOString(), trial_ended_how: "stopped" });
        return res(200, null);
      }
      case "/rest/v1/rpc/delete_my_account": { if (!who) return res(401, {}); delete s.rows[who]; delete s.users[who]; return res(200, null); }
      default: return res(404, {});
    }
  };
  return s;
}

