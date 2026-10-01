/**
 * js/data/messages.js
 * 01 Oct 2026 v1
 *
 * B4 MESSAGES. Short messages from Build New Habits, in Settings › Messages,
 * with a dot on the Settings tab when there is one not yet seen.
 *
 * WHERE THEY COME FROM. One file, messages.json, at the app's own address,
 * the same for everybody. It is fetched when the app opens with a
 * connection, straight from the server (the service worker leaves it alone,
 * sw.js v624), and nothing about the person is sent with the request.
 * Graeme publishes a message by editing that one file.
 *
 * WHAT IS CHECKED, here, before anything is kept or shown (checkMessage):
 *   - plain text only: a title or body containing < or > is refused;
 *   - links only to buildnewhabits.co.uk or a named charity's own site
 *     (ALLOWED_LINK_HOSTS), over https;
 *   - three kinds: "app" (about the app itself), "research" (the survey and
 *     Share my figures, B5) and "news" (news and cause updates, which could
 *     be marketing under PECR, so they show only if the person has turned
 *     on News from Build New Habits; it is off);
 *   - no safety or medical content is the publisher's rule (Safeguarding
 *     Policy v12 §3): the fixed safety places never depend on this file.
 *
 * WHO SEES WHICH, decided here, on the device, from three facts only: free
 * tier or the Plan; how long on the Plan (not known until payment and the
 * pass exist, so a message asking for it is not shown yet); and how many
 * sessions are recorded. Never from health answers, the journal, check-ins
 * or notes. Read state and the News switch stay in Alongside's storage.
 *
 * THE DOT. Not colour alone: the Settings tab's name becomes "Settings, new
 * message" for screen readers. No count, no notification, no icon badge,
 * no sound, no deadline.
 *
 * Tested by tools/verify-messages.mjs.
 */
import { store } from "../store.js";

export const MESSAGES_URL = "messages.json";
export const KINDS = ["app", "research", "news"];
/** Named charities' own sites are added here as Graeme names them. */
export const ALLOWED_LINK_HOSTS = ["buildnewhabits.co.uk"];
export const NAV_LABEL_NEW = "Settings, new message";

const ID = /^[a-z0-9][a-z0-9-]{0,59}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MARKUP = /[<>]/;

function _hostAllowed(href) {
  let u;
  try { u = new URL(href); } catch { return false; }
  if (u.protocol !== "https:") return false;
  const h = u.hostname.toLowerCase();
  return ALLOWED_LINK_HOSTS.some(a => h === a || h === "www." + a);
}

/** The message, cleaned to the known fields, or null if it breaks a rule. */
export function checkMessage(m) {
  if (!m || typeof m !== "object") return null;
  if (typeof m.id !== "string" || !ID.test(m.id)) return null;
  if (!KINDS.includes(m.kind)) return null;
  if (typeof m.title !== "string" || !m.title.trim() || m.title.length > 80 || MARKUP.test(m.title)) return null;
  if (typeof m.body !== "string" || !m.body.trim() || m.body.length > 600 || MARKUP.test(m.body)) return null;
  if (typeof m.publishedAt !== "string" || !DAY.test(m.publishedAt)) return null;
  const out = { id: m.id, kind: m.kind, title: m.title.trim(), body: m.body.trim(), publishedAt: m.publishedAt };
  if (m.link != null) {
    const l = m.link;
    if (!l || typeof l.text !== "string" || !l.text.trim() || MARKUP.test(l.text) || typeof l.href !== "string" || !_hostAllowed(l.href)) return null;
    out.link = { text: l.text.trim(), href: l.href };
  }
  const a = m.audience || {};
  const tier = a.tier == null ? "any" : a.tier;
  if (!["any", "free", "plan"].includes(tier)) return null;
  out.audience = { tier };
  if (a.minSessions != null) {
    if (!Number.isInteger(a.minSessions) || a.minSessions < 0) return null;
    out.audience.minSessions = a.minSessions;
  }
  if (a.minPlanWeeks != null) {
    if (!Number.isInteger(a.minPlanWeeks) || a.minPlanWeeks < 0) return null;
    out.audience.minPlanWeeks = a.minPlanWeeks;
  }
  if (m.kind === "research") {
    if (!["survey", "share-figures"].includes(m.action)) return null;
    out.action = m.action;
  }
  return out;
}

/** Fetch the list, check it, keep it. Never throws; offline keeps the last list. */
export async function refreshMessages(fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== "function") return false;
  try {
    const res = await fetchImpl(MESSAGES_URL, { cache: "no-store", credentials: "omit" });
    if (!res || !res.ok) return false;
    const json = await res.json();
    const raw = Array.isArray(json?.messages) ? json.messages : [];
    const list = raw.map(checkMessage).filter(Boolean).slice(0, 50);
    store.set("messages.list", list);
    store.set("messages.fetchedAt", new Date().toISOString());
    updateNavDot();
    return true;
  } catch { return false; }
}

function _sessionCount() {
  return (store.get("activityLog") || []).filter(e => e && e.status !== "abandoned").length;
}

/** Built-in messages (B5 adds its own) are joined to the published ones. */
const _extra = [];
export function addBuiltIn(provider) { if (typeof provider === "function") _extra.push(provider); }

/** The messages this person sees now, newest first. */
export function visibleMessages() {
  const m = store.get("messages") || {};
  const plan = (store.get("tier") || "free") !== "free";
  const sessions = _sessionCount();
  const dismissed = new Set(m.dismissed || []);
  const all = [...(m.list || []), ..._extra.flatMap(f => { try { return f() || []; } catch { return []; } })];
  return all
    .filter(x => x && !dismissed.has(x.id))
    .filter(x => x.kind !== "news" || m.newsOn === true)
    // "any", "free" or "plan" in the published file; the store says free/personal.
    .filter(x => { const want = x.audience?.tier || "any"; return want === "any" || (want === "free") === !plan; })
    .filter(x => x.audience?.minSessions == null || sessions >= x.audience.minSessions)
    .filter(x => x.audience?.minPlanWeeks == null)   // not known until the pass exists
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
}

export function hasUnread() {
  const read = new Set(store.get("messages.read") || []);
  return visibleMessages().some(x => !read.has(x.id));
}

export function markAllRead() {
  const read = new Set(store.get("messages.read") || []);
  visibleMessages().forEach(x => read.add(x.id));
  store.set("messages.read", [...read].slice(-200));
  updateNavDot();
}

export function dismissMessage(id) {
  const d = new Set(store.get("messages.dismissed") || []);
  d.add(id);
  store.set("messages.dismissed", [...d].slice(-200));
  updateNavDot();
}

export function setNews(on) {
  store.set("messages.newsOn", on === true);
  updateNavDot();
}

/** The dot on the Settings tab: a shape, and words for screen readers. */
export function updateNavDot(doc = globalThis.document) {
  const btn = doc?.querySelector?.('[data-nav="settings"]');
  if (!btn) return;
  const on = hasUnread();
  let dot = btn.querySelector(".nav-dot");
  if (on && !dot) {
    dot = doc.createElement("span");
    dot.className = "nav-dot";
    dot.setAttribute("aria-hidden", "true");
    btn.appendChild(dot);
  } else if (!on && dot) {
    dot.remove();
  }
  btn.setAttribute("aria-label", on ? NAV_LABEL_NEW : "Settings");
}
