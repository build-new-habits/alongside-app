/**
 * js/data/account-demo.js
 * 28 Nov 2026 v1
 *
 * Row 13a ACCOUNTS, S2. The developer demo: a stand-in for the account
 * service that lives on this phone, so the email step, the code and Your
 * account can be tried before Graeme's Supabase project exists. Only the
 * developer panel turns it on (off at release). It answers as Supabase Auth
 * and its REST interface do, keeps its pretend accounts in this phone's
 * storage, and never calls the web: demoFetch is not fetch.
 *
 *   DEMO_CODE    every code is 123456
 *   DEMO_CONFIG  a pretend address, never contacted
 *   demoFetch(url, init)  resolves like fetch's response
 */
export const DEMO_CODE = "123456";
export const DEMO_CONFIG = Object.freeze({ url: "https://demo-only.supabase.co", anonKey: "developer-demo-key-not-a-real-key" });
const KEY = "alongside-dev-account-demo-server";

function load() { try { return JSON.parse(localStorage.getItem(KEY) || "") || null; } catch { return null; } }
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ } }
const blank = () => ({ users: {}, rows: {}, tokens: {}, n: 0 });

const answer = (status, data) => ({ ok: status >= 200 && status < 300, status, json: async () => data });

export async function demoFetch(url, init = {}) {
  const s = load() || blank();
  const u = new URL(url);
  const body = init.body ? JSON.parse(init.body) : {};
  const who = s.tokens[(init.headers?.Authorization || "").replace(/^Bearer /, "")];
  const tok = (kind, id) => { s.n += 1; const t = `demo-${kind}-${String(s.n).padStart(8, "0")}`; s.tokens[t] = id; return t; };
  const done = (status, data) => { save(s); return answer(status, data); };
  switch (u.pathname) {
    case "/auth/v1/otp": return done(200, {});
    case "/auth/v1/verify": {
      if (body.token !== DEMO_CODE) return done(403, {});
      if (body.type === "email_change") {
        const id = Object.keys(s.users).find(k => s.users[k].pendingEmail === body.email);
        if (!id) return done(403, {});
        s.users[id].email = body.email; delete s.users[id].pendingEmail;
        return done(200, {});
      }
      let id = Object.keys(s.users).find(k => s.users[k].email === body.email);
      if (!id) {
        const n = Object.keys(s.users).length + 1;
        id = `d0d0d0d0-0000-4000-8000-${String(n).padStart(12, "0")}`;
        s.users[id] = { id, email: body.email, created_at: new Date().toISOString() };
        s.rows[id] = { tier: "free" };
      }
      return done(200, { access_token: tok("access", id), refresh_token: tok("refresh", id), expires_in: 3600, user: s.users[id] });
    }
    case "/auth/v1/token": {
      const id = s.tokens[body.refresh_token];
      if (!id || !s.users[id]) return done(400, {});
      return done(200, { access_token: tok("access", id), refresh_token: tok("refresh", id), expires_in: 3600 });
    }
    case "/auth/v1/logout": return done(204, null);
    case "/auth/v1/user": {
      if (!who) return done(401, {});
      s.users[who].pendingEmail = body.email;
      return done(200, {});
    }
    case "/rest/v1/accounts": return who ? done(200, s.rows[who] ? [s.rows[who]] : []) : done(401, {});
    case "/rest/v1/rpc/start_my_trial": {
      if (!who) return done(401, {});
      const row = s.rows[who];
      if (row.trial_started_at) return done(400, {});
      const [y, m, d] = String(body.p_today).split("-").map(Number);
      const end = new Date(y, m - 1, d + 14);
      const pad = v => String(v).padStart(2, "0");
      Object.assign(row, { trial_started_at: new Date().toISOString(), trial_ends_on: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}` });
      return done(200, null);
    }
    case "/rest/v1/rpc/end_my_trial": {
      if (!who) return done(401, {});
      Object.assign(s.rows[who], { trial_ended_at: new Date().toISOString(), trial_ended_how: "stopped" });
      return done(200, null);
    }
    case "/rest/v1/rpc/delete_my_account": {
      if (!who) return done(401, {});
      delete s.rows[who]; delete s.users[who];
      for (const t of Object.keys(s.tokens)) if (s.tokens[t] === who) delete s.tokens[t];
      return done(200, null);
    }
    default: return done(404, {});
  }
}
