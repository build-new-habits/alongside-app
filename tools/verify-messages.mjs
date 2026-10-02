/**
 * tools/verify-messages.mjs
 * 02 Oct 2026 v2
 *
 * v2 - W4-23. Settings is an index of sections; Messages is its own section,
 *   one tap from the index (5pc). Same intent: Messages is reached at once.
 *
 * 01 Oct 2026 v1
 *
 * B4 MESSAGES. Settings › Messages, and the dot on the Settings tab.
 *
 *   1. Only plain-text messages with allowed links are kept (checkMessage).
 *   2. The fetch: the app's own messages.json, relative, never cached by the
 *      browser, no cookies, nothing about the person in it; a failed fetch
 *      keeps the last list.
 *   3. Who sees what, on the device, from tier and session count only:
 *      health answers change nothing; news only with the switch on; a
 *      message needing months on the Plan waits for the pass; dismissed
 *      ones go; newest first.
 *   4. The dot, on the real nav markup: a shape with no number, and the
 *      tab's name says "Settings, new message"; gone once seen.
 *   5. Settings, driven: the row says "New" in words; the screen lists the
 *      messages with headings and safe links; opening it marks them seen;
 *      Dismiss works; News is off until turned on.
 *   6. Never a notification, an icon badge or a vibration.
 *   7. The service worker leaves messages.json to the network; app.js
 *      fetches it after the first screen; the published file is valid.
 */
import { createRequire as __cr } from "node:module";
import { readFileSync } from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const ROOT = new URL("../", import.meta.url);
const html = readFileSync(new URL("index.html", ROOT), "utf8");
const navHtml = (html.match(/<nav[\s\S]*?<\/nav>/) || [""])[0];
const dom = new JSDOM(`<!doctype html><div id="app"><div id="main-content"></div>${navHtml}</div>`, { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("js/", ROOT).href;
const { store } = await import(B + "store.js");
let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const strip = s => s.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");

let M = null;
try { M = await import(B + "data/messages.js"); } catch { /* red first */ }
ok("0pc. positive control: messages.js loads and the nav has a Settings tab", !!M && !!document.querySelector('[data-nav="settings"]'));
if (!M) { console.log(`\n${passes} passed, ${fails + 1} failed`); process.exit(1); }

const msg = (o = {}) => ({ id: "m1", kind: "app", title: "A change to Progress", body: "Progress now shows your month.", publishedAt: "2026-10-01", ...o });

// ── 1. CHECKING ─────────────────────────────────────────────────────────
console.log("\nTEST 1 - only plain text and allowed links are kept");
ok("1a. a plain message is kept", !!M.checkMessage(msg()));
ok("1b. markup in the title or body is refused", !M.checkMessage(msg({ title: "<b>Hi</b>" })) && !M.checkMessage(msg({ body: "see <img src=x onerror=1>" })));
ok("1c. a link to our own site is kept, https only",
   !!M.checkMessage(msg({ link: { text: "Read more", href: "https://buildnewhabits.co.uk/news/" } })) &&
   !M.checkMessage(msg({ link: { text: "Read more", href: "http://buildnewhabits.co.uk/" } })));
ok("1d. a link anywhere else is refused", !M.checkMessage(msg({ link: { text: "x", href: "https://example.com/" } })) &&
   !M.checkMessage(msg({ link: { text: "x", href: "https://buildnewhabits.co.uk.evil.com/" } })) &&
   !M.checkMessage(msg({ link: { text: "x", href: "javascript:alert(1)" } })));
ok("1e. an unknown kind, a bad id or date is refused", !M.checkMessage(msg({ kind: "promo" })) && !M.checkMessage(msg({ id: "Bad Id" })) && !M.checkMessage(msg({ publishedAt: "1 Oct" })));
ok("1f. a research message must name what it asks", !M.checkMessage(msg({ kind: "research" })) && !!M.checkMessage(msg({ kind: "research", action: "survey" })));
ok("1g. unknown fields are dropped", !("script" in (M.checkMessage({ ...msg(), script: "x" }) || {})));

// ── 2. THE FETCH ────────────────────────────────────────────────────────
console.log("\nTEST 2 - the fetch");
localStorage.clear(); store.init();
let calls = [];
const fakeFetch = list => async (url, opts) => { calls.push({ url, opts }); return { ok: true, json: async () => ({ messages: list }) }; };
await M.refreshMessages(fakeFetch([msg(), msg({ id: "bad", title: "<x>" })]));
ok("2a. one request, to the app's own messages.json, relative", calls.length === 1 && calls[0].url === "messages.json", JSON.stringify(calls[0]));
ok("2b. not from the browser's cache, no cookies, no body", calls[0].opts?.cache === "no-store" && calls[0].opts?.credentials === "omit" && !("body" in (calls[0].opts || {})));
ok("2c. only checked messages are kept", (store.get("messages.list") || []).map(x => x.id).join() === "m1" && !!store.get("messages.fetchedAt"));
await M.refreshMessages(async () => { throw new Error("offline"); });
ok("2d. offline: the last list stays", (store.get("messages.list") || []).length === 1);

// ── 3. WHO SEES WHAT ────────────────────────────────────────────────────
console.log("\nTEST 3 - who sees what, decided on the device");
function setList(list) { store.set("messages.list", list.map(M.checkMessage).filter(Boolean)); }
localStorage.clear(); store.init(); store.set("tier", "free");
setList([msg({ id: "all" }), msg({ id: "plan-only", audience: { tier: "plan" } }), msg({ id: "free-only", audience: { tier: "free" } }),
         msg({ id: "after5", audience: { minSessions: 5 } }), msg({ id: "news1", kind: "news" }),
         msg({ id: "weeks", audience: { minPlanWeeks: 4 } }), msg({ id: "newer", publishedAt: "2026-10-05" })]);
const ids = () => M.visibleMessages().map(x => x.id).join(",");
ok("3a. free tier: everybody's, free-only; not plan-only, news, after 5 sessions or plan-weeks; newest first", ids() === "newer,all,free-only", ids());
store.set("tier", "personal");
ok("3b. on the Plan: plan-only instead of free-only", /plan-only/.test(ids()) && !/free-only/.test(ids()), ids());
store.set("activityLog", Array.from({ length: 5 }, (_, i) => ({ id: "a" + i, status: "completed", type: "workout" })));
ok("3c. after 5 sessions: the after-5 message", /after5/.test(ids()));
const before = ids();
store.set("conditions", ["knee", "lower-back"]); store.set("checkinHistory", { "2026-10-01": { energy: 2, mood: 2 } });
store.set("journalEntries", [{ id: "j", text: "low", tags: ["health"] }]); store.set("weight", 90);
ok("3d. health answers, the journal and weight change nothing", ids() === before, ids());
ok("3e. news only with the switch on, and it starts off", store.get("messages.newsOn") === false && !/news1/.test(ids()));
M.setNews(true);
ok("3f. switched on: news shows", /news1/.test(ids()));
M.dismissMessage("all");
ok("3g. dismissed: gone", !/\ball\b/.test(ids()));
ok("3h. months on the Plan cannot be known yet, so such a message waits", !/weeks/.test(ids()));
const msrc = strip(readFileSync(new URL("js/data/messages.js", ROOT), "utf8"));
ok("3i. the module reads no health, journal, check-in, weight or note field",
   !/conditions|checkin|journal|weight|painScore|capability|lifestyle|note/i.test(msrc.replace(/messages\.\w+/g, "")));

// ── 4. THE DOT ──────────────────────────────────────────────────────────
console.log("\nTEST 4 - the dot on the Settings tab");
localStorage.clear(); store.init(); setList([msg()]);
const tab = () => document.querySelector('[data-nav="settings"]');
M.updateNavDot();
const dot = tab().querySelector(".nav-dot");
ok("4a. unread: a dot, hidden from screen readers, with no number", !!dot && dot.getAttribute("aria-hidden") === "true" && txt(dot) === "");
ok("4b. and the tab's name says so in words", tab().getAttribute("aria-label") === "Settings, new message");
M.markAllRead();
ok("4c. seen: the dot goes and the name returns", !tab().querySelector(".nav-dot") && tab().getAttribute("aria-label") === "Settings");

// ── 5. SETTINGS ─────────────────────────────────────────────────────────
console.log("\nTEST 5 - Settings › Messages, driven");
const { SettingsView } = await import(B + "views/settings.js");
localStorage.clear(); store.init();
store.set("onboardingComplete", true); store.set("name", "Sam");
setList([msg({ link: { text: "Read the change", href: "https://buildnewhabits.co.uk/news/" } }), msg({ id: "n2", kind: "news", title: "A cause update" })]);
main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main); await wait(20);
const row = main.querySelector('[data-open="messages"]');
ok("5pc. positive control: Messages is one tap from the Settings index (W4-23: its own section)", !!row && row.dataset.section === "messages");
ok("5a. it says New, in words", /New/.test(txt(row)) && !/\d/.test(txt(row)), txt(row));
click(row); await wait(20);
const items = main.querySelectorAll(".settings-message");
ok("5b. the screen lists the message, as a heading and text", items.length === 1 && items[0].querySelector("h2")?.textContent === "A change to Progress");
const a = items[0].querySelector("a");
ok("5c. its link opens a new tab, says so, and cannot reach back", a?.target === "_blank" && /noopener/.test(a?.rel) && /opens in a new tab/.test(txt(a)));
ok("5d. opening it marks it seen: no dot", !M.hasUnread() && !tab().querySelector(".nav-dot"));
const sw = main.querySelector("#settings-news");
ok("5e. News is a switch, off", sw?.getAttribute("role") === "switch" && sw?.getAttribute("aria-checked") === "false" && !/A cause update/.test(txt(main)));
click(sw); await wait(20);
ok("5f. turned on: the news message shows", /A cause update/.test(txt(main)) && store.get("messages.newsOn") === true);
click(main.querySelector('[data-dismiss-msg="m1"]')); await wait(20);
ok("5g. Dismiss removes it", !/A change to Progress/.test(txt(main.querySelector(".settings-messages") || main)) && (store.get("messages.dismissed") || []).includes("m1"));
localStorage.clear(); store.init(); store.set("onboardingComplete", true);
main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main); await wait(20);
ok("5h. with nothing new, the row says so", /Nothing new/.test(txt(main.querySelector('[data-open="messages"]'))));

// ── 6. NO NOTIFICATIONS ─────────────────────────────────────────────────
console.log("\nTEST 6 - never a notification, badge or vibration");
const srcs = ["js/data/messages.js", "js/views/settings.js", "js/app.js", "sw.js"].map(f => strip(readFileSync(new URL(f, ROOT), "utf8"))).join("\n");
ok("6a. no Notification, push, app badge or vibrate anywhere it could be added",
   !/\bNotification\b|showNotification|setAppBadge|setClientBadge|navigator\.vibrate|PushManager|pushManager/.test(srcs));

// ── 7. FETCHING FROM THE SERVER, AND THE FILE ───────────────────────────
console.log("\nTEST 7 - the service worker, app.js and messages.json");
const sw7 = strip(readFileSync(new URL("sw.js", ROOT), "utf8"));
const fetchHandler = sw7.slice(sw7.indexOf('addEventListener("fetch"'));
ok("7a. the service worker leaves messages.json to the network, before its cache",
   /messages\.json/.test(fetchHandler.slice(0, fetchHandler.indexOf("respondWith"))));
const app = strip(readFileSync(new URL("js/app.js", ROOT), "utf8"));
ok("7b. app.js fetches after the first screen, without waiting on it",
   app.indexOf("refreshMessages()") > app.indexOf("await router.navigate(firstView)") && !/await\s+refreshMessages/.test(app));
const file = JSON.parse(readFileSync(new URL("messages.json", ROOT), "utf8"));
ok("7c. messages.json is valid, versioned, and every message in it passes the checks",
   /^\d{2} [A-Z][a-z]{2} \d{4} v\d+$/.test(file._version) && Array.isArray(file.messages) && file.messages.every(x => !!M.checkMessage(x)));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
