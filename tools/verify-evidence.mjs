/**
 * tools/verify-evidence.mjs
 * 01 Oct 2026 v1
 *
 * B5 EVIDENCE. The survey and Share my figures.
 *
 *   1. Off until the receiver is set: nothing offered, nothing can be sent.
 *   2. The exact payloads: only the listed keys; no name, email, identifier,
 *      dates, health answers, journal or notes; counts rounded to halves;
 *      kinds from the fixed list only.
 *   3. Survey, driven through Settings: nothing sent without both answers;
 *      Send sends one request, to the receiver, POST, no cookies, no row
 *      back, with exactly what the screen said; answered once, never again.
 *   4. Share my figures, driven: the screen shows the figures; Send sends
 *      exactly those; a failed send keeps nothing and says so.
 *   5. Dismissed: never offered again. Figures wait for four sessions.
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
globalThis.caches = { keys: async () => ["alongside-v623", "alongside-v624"] };

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

let E = null, M = null;
try { E = await import(B + "data/evidence.js"); M = await import(B + "data/messages.js"); } catch (e) { console.log(e.message); }
ok("0pc. positive control: evidence.js loads", !!E && !!M);
if (!E) { console.log(`\n${passes} passed, ${fails} failed`); process.exit(1); }

const NOW = Date.parse("2026-10-20T12:00:00Z");
const day = n => new Date(NOW - n * 86400000).toISOString();
function person({ tier = "personal" } = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "Sam Private"); store.set("tier", tier);
  store.set("conditions", ["knee"]); store.set("weight", 88); store.set("checkinHistory", { "2026-10-19": { energy: 2, mood: 2 } });
  store.set("journalEntries", [{ id: "j1", text: "my secret line", tags: [] }]);
  // First four weeks (from day 90): 5 sessions. Latest four weeks: 7 sessions.
  const log = [];
  for (let i = 0; i < 5; i++) log.push({ id: "f" + i, type: i % 2 ? "walk" : "workout", status: "completed", completedAt: day(90 - i * 3), note: "knee hurt" });
  for (let i = 0; i < 7; i++) log.push({ id: "l" + i, type: ["walk", "yoga", "breathing", "swim", "run", "class", "workout"][i], status: "completed", completedAt: day(2 + i * 3) });
  log.push({ id: "x", type: "workout", status: "abandoned", completedAt: day(1) });
  store.set("activityLog", log);
}

// ── 1. OFF UNTIL SET ────────────────────────────────────────────────────
console.log("\nTEST 1 - off until the receiver is set");
person();
let calls = [];
// Settings fetches ./sw.js for its version line; only the receiver's calls count here.
const fetchOk = async (url, opts) => { if (/supabase/.test(String(url))) calls.push({ url, opts }); return { ok: true, text: async () => "" }; };
ok("1a. the receiver starts empty, so sending is off", !E.enabled() && E.RECEIVER.url === "" && E.RECEIVER.key === "");
ok("1b. nothing is offered", !M.visibleMessages().some(m => m.kind === "research"));
ok("1c. nothing can be sent", (await E.sendEvidence(E.figuresPayload(NOW), fetchOk)) === false && calls.length === 0);

// ── 2. THE PAYLOADS ─────────────────────────────────────────────────────
console.log("\nTEST 2 - exactly what is sent");
const f = E.figuresPayload(NOW);
ok("2a. figures: only the listed keys", Object.keys(f).sort().join() === "first_weeks,kind,kinds,latest_weeks,month,plan_band,tier", Object.keys(f).join());
ok("2b. counts per week, to the nearest half: 5/4 -> 1.5 (nearest half of 1.25), 7/4 -> 2", f.first_weeks === 1.5 && f.latest_weeks === 2, JSON.stringify(f));
ok("2c. kinds from the fixed list only, in its order (swim is not on it)", JSON.stringify(f.kinds) === '["walk","run","strength","mobility","breathing","class"]', JSON.stringify(f.kinds));
ok("2d. the month, not the day; the Plan's band not known until the pass exists", f.month === "2026-10" && f.plan_band === "not-known" && f.tier === "plan");
const s = E.surveyPayload("a-bit-more", "1-3m", NOW);
ok("2e. survey: only the listed keys", Object.keys(s).sort().join() === "kind,month,move,tier,used_for");
ok("2f. survey needs two real answers", E.surveyPayload("a-bit-more", null) === null && E.surveyPayload("lots", "1-3m") === null);
const both = JSON.stringify([f, s]);
ok("2g. no name, health answer, journal, note, weight, id or date in either",
   !/Sam|Private|knee|secret|88|"id"|T\d\d:/.test(both), both);
person({ tier: "free" });
ok("2h. free tier: band none", E.figuresPayload(NOW).plan_band === "none" && E.figuresPayload(NOW).tier === "free");

// ── 3. SURVEY, DRIVEN ───────────────────────────────────────────────────
console.log("\nTEST 3 - the survey, through Settings");
E.RECEIVER.url = "https://abcdefgh.supabase.co"; E.RECEIVER.key = "anon-public-key";
person();
calls = [];
const realFetch = globalThis.fetch;
globalThis.fetch = fetchOk;
const { SettingsView } = await import(B + "views/settings.js");
const mount = async () => { main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main); await wait(20); click(main.querySelector('[data-open="messages"]')); await wait(20); };
await mount();
const surveyBox = () => main.querySelector('[data-research="survey"]');
ok("3pc. positive control: with the receiver set, the survey is offered", !!surveyBox());
ok("3a. two questions as fieldsets with legends, and the cannot-find line",
   surveyBox()?.querySelectorAll("fieldset legend").length === 2 && txt(surveyBox()).includes(E.CANT_FIND));
click(surveyBox().querySelector('[data-ev-send="survey"]')); await wait(60);
ok("3b. Send without both answers: nothing sent, and why", calls.length === 0 && /answer both/.test(txt(main.querySelector("#ev-survey-error"))));
main.querySelector('input[name="ev-move"][value="much-more"]').checked = true;
main.querySelector('input[name="ev-used"][value="3-6m"]').checked = true;
click(surveyBox().querySelector('[data-ev-send="survey"]')); await wait(60);
const c = calls[0];
ok("3c. one request, POST to the receiver's table", calls.length === 1 && c.url === "https://abcdefgh.supabase.co/rest/v1/evidence" && c.opts.method === "POST", JSON.stringify(c?.url));
ok("3d. no cookies, no row back", c.opts.credentials === "omit" && c.opts.headers.Prefer === "return=minimal");
const body = JSON.parse(c.opts.body);
ok("3e. exactly the survey's keys plus the release", Object.keys(body).sort().join() === "app,kind,month,move,tier,used_for" && body.move === "much-more" && body.used_for === "3-6m" && body.app === "alongside-v624", c.opts.body);
ok("3f. answered: kept as answered, the message gone, thanks said", store.get("evidence.surveyDone") === true && !main.querySelector('[data-research="survey"]') && /Thank you/.test(txt(main.querySelector("#settings-saved"))));
store.set("messages.dismissed", []);
ok("3g. never offered again", !M.visibleMessages().some(m => m.action === "survey"));

// ── 4. FIGURES, DRIVEN ──────────────────────────────────────────────────
console.log("\nTEST 4 - Share my figures, through Settings");
person(); calls = [];
await mount();
const figBox = () => main.querySelector('[data-research="share-figures"]');
ok("4pc. positive control: offered after four sessions", !!figBox());
const shown = figBox() ? txt(figBox()) : "";
const live = E.figuresPayload();
ok("4a. the screen shows each figure that will be sent", shown.includes(String(live.first_weeks)) && shown.includes(String(live.latest_weeks)) && shown.includes(live.month) && /Not known yet/.test(shown), shown.slice(0, 300));
globalThis.fetch = async (u, o) => { if (/supabase/.test(String(u))) calls.push({ u, o }); return { ok: false, text: async () => "" }; };
click(figBox().querySelector('[data-ev-send="share-figures"]')); await wait(60);
ok("4b. a failed send: said plainly, nothing kept, still offered",
   new RegExp(E.NOT_SENT.replace(/[.’]/g, ".")).test(txt(main.querySelector("#ev-share-figures-error"))) && store.get("evidence.figuresDone") === false && !!figBox());
globalThis.fetch = fetchOk; calls = [];
click(figBox().querySelector('[data-ev-send="share-figures"]')); await wait(60);
const fb = JSON.parse(calls[0]?.opts?.body || "{}");
ok("4c. Send: exactly the figures shown, plus the release", calls.length === 1 && fb.first_weeks === live.first_weeks && fb.latest_weeks === live.latest_weeks && JSON.stringify(fb.kinds) === JSON.stringify(live.kinds) && Object.keys(fb).length === 8, calls[0]?.opts?.body);
ok("4d. answered once", store.get("evidence.figuresDone") === true && !figBox());

// ── 5. DISMISSED, AND THE THRESHOLD ─────────────────────────────────────
console.log("\nTEST 5 - dismissed, and four sessions first");
person(); await mount();
click(main.querySelector('[data-dismiss-msg="survey-2026"]')); await wait(20);
ok("5a. dismissed: not offered again", !M.visibleMessages().some(m => m.id === "survey-2026"));
person(); store.set("activityLog", [{ id: "a", type: "walk", status: "completed", completedAt: day(1) }]);
ok("5b. fewer than four sessions: no figures yet", !M.visibleMessages().some(m => m.action === "share-figures"));
ok("5c. every built-in message passes the published-message checks", E.researchMessages().every(m => !!M.checkMessage(m)));
globalThis.fetch = realFetch;

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
