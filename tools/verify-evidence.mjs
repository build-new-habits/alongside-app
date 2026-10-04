/**
 * tools/verify-evidence.mjs
 * 04 Oct 2026 v5
 *
 * v5 - LOOK-1: How your data is kept is a row on the Your data section
 *   page, not the Settings index. 6i and 7b now reach it with settingsFind
 *   (opening that section first). No assertion was loosened.
 *
 * 03 Oct 2026 v4
 *
 * v4 - W5-13 RESEARCH-TRUE-2 (Wave 5 trace: 2.1, 2.4, 2.12-2.16; before
 *   switch-on). TEST 7: with sending on, no screen says "no copy on a
 *   server" without saying what is sent; Share my figures waits for eight
 *   weeks, so its first and latest four weeks are never the same days; the
 *   Bad day's gentle plan and a stretch session are not sent as strength;
 *   no research message is dated before the app was installed.
 *
 * v3 - W4-12 EVIDENCE-TRUE. TEST 6: rates over the weeks that have passed;
 *   Share my figures offered after four weeks of use; kinds from what each
 *   session was (every activity type decided); stopped sessions not counted;
 *   the survey waits for some use and stays answered across Reset all data;
 *   every privacy screen names the survey and figures while sending is on.
 *
 * 01 Oct 2026 v2
 *
 * v2 - Waits for each send's outcome instead of a fixed 60 ms (one failure
 *   under a parallel suite). No assertion changed.
 *
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
// Sends are asynchronous; wait for the outcome, not a fixed time (a fixed
// 60 ms failed once under a parallel suite).
const until = async (cond, ms = 3000) => { const end = Date.now() + ms; while (!cond() && Date.now() < end) await wait(20); };

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
  log.push({ id: "x", type: "workout", status: "partial", completedAt: day(1) });
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
const { settingsFind } = await import("./settings-open.mjs");
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
click(surveyBox().querySelector('[data-ev-send="survey"]')); await until(() => /Thank you/.test(txt(main.querySelector("#settings-saved"))));
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
click(figBox().querySelector('[data-ev-send="share-figures"]')); await until(() => !!txt(main.querySelector("#ev-share-figures-error")));
ok("4b. a failed send: said plainly, nothing kept, still offered",
   new RegExp(E.NOT_SENT.replace(/[.’]/g, ".")).test(txt(main.querySelector("#ev-share-figures-error"))) && store.get("evidence.figuresDone") === false && !!figBox());
globalThis.fetch = fetchOk; calls = [];
click(figBox().querySelector('[data-ev-send="share-figures"]')); await until(() => store.get("evidence.figuresDone") === true && !figBox());
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
// ── 6. W4-12 EVIDENCE-TRUE, before switching on ─────────────────────────
console.log("\nTEST 6 - true figures, a survey that waits for use, and the privacy words");
const ago = n => new Date(Date.now() - n * 86400000).toISOString();
function log(entries) { person(); store.set("activityLog", entries.map((e, i) => ({ id: "w" + i, status: "completed", ...e }))); }
// 6a. Four sessions in five days: not offered (it needs four weeks of use).
log([0, 1, 3, 5].map(d => ({ type: "walk", completedAt: ago(d) })));
ok("6a. four sessions in five days: Share my figures not offered yet", !M.visibleMessages().some(m => m.action === "share-figures"));
// 6b. Eight weeks of three a week: 3 and 3.
log(Array.from({ length: 24 }, (_, i) => ({ type: "walk", completedAt: ago(1 + Math.floor(i * 56 / 24)) })));
const eight = E.figuresPayload();
ok("6b. eight weeks of three a week: 3 a week, first and latest", eight.first_weeks === 3 && eight.latest_weeks === 3, JSON.stringify(eight));
// 6c. Rates over the weeks that have passed: six sessions in two weeks is 3 a week, not 1.5.
log(Array.from({ length: 6 }, (_, i) => ({ type: "walk", completedAt: ago(1 + i * 2) })));
const two = E.figuresPayload();
ok("6c. two weeks in: divided by the two weeks that passed", two.first_weeks === 3 && two.latest_weeks === 3, JSON.stringify(two));
// 6d. Kinds: what the session was.
log([{ type: "workout", sessionType: "mobility", completedAt: ago(1) }, { type: "workout", sessionType: "cardio", completedAt: ago(2) },
     { type: "workout", sessionType: "full", completedAt: ago(3) }, { type: "yoga", completedAt: ago(4) }]);
ok("6d. mobility is mobility, full body is strength, cardio is not called strength", JSON.stringify(E.figuresPayload().kinds) === '["strength","mobility"]', JSON.stringify(E.figuresPayload().kinds));
log([{ type: "workout", sessionType: "cardio", completedAt: ago(1) }]);
ok("6d2. a cardio session alone is not sent as strength", !E.figuresPayload().kinds.includes("strength"), JSON.stringify(E.figuresPayload().kinds));
log([{ type: "workout", sessionType: "mobility", completedAt: ago(1) }]);
ok("6d3. a mobility session alone is sent as mobility, not strength", JSON.stringify(E.figuresPayload().kinds) === '["mobility"]', JSON.stringify(E.figuresPayload().kinds));
const AL = await import(B + "data/activity-labels.js");
const unmapped = (AL.ACTIVITY_TYPES || []).filter(ty => !(ty in E.KIND_OF));
ok("6e. every activity type the app writes has a decided kind (or none)", (AL.ACTIVITY_TYPES || []).length > 20 && unmapped.length === 0, unmapped.join(", "));
// 6f. A stopped session is not counted.
log([{ type: "walk", completedAt: ago(1) }, { type: "walk", status: "partial", completedAt: ago(2) }]);
ok("6f. a stopped session is not counted", E.figuresPayload().latest_weeks === 0.5 || E.figuresPayload().latest_weeks === 1, JSON.stringify(E.figuresPayload()));
// 6g. The survey waits for some use.
log([]);
ok("6g. day one, nothing done: no survey", !M.visibleMessages().some(m => m.action === "survey"));
log([0, 3, 8].map(d => ({ type: "walk", completedAt: ago(d) })));
ok("6g2. three sessions over a week: the survey is offered", M.visibleMessages().some(m => m.action === "survey"));
// 6h. Answered, then Reset all data: not offered again.
store.set("evidence.surveyDone", true); E.rememberAnswered?.("survey");
store.resetEverything(); store.init();
store.set("activityLog", [0, 3, 8].map((d, i) => ({ id: "r" + i, type: "walk", status: "completed", completedAt: ago(d) })));
ok("6h. answered once, then Reset all data: never offered again", !M.visibleMessages().some(m => m.action === "survey"));
// 6i. The privacy words name the survey whenever sending is on.
const PV = await import(B + "views/privacy.js");
const privHtml = typeof PV.render === "function" ? PV.render() : (() => { const d = document.createElement("div"); PV.PrivacyView?.({ navigate() {}, back() {} }).mount(d); return d.innerHTML; })();
const thread = readFileSync(new URL("../js/views/onboarding/thread.js", import.meta.url), "utf8");
person(); main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main); await wait(10);
click(settingsFind(main, '[data-open="about-data"]')); await wait(10);
const aboutData = txt(main);
ok("6i. Settings › How your data is kept names the survey and figures", /survey/i.test(aboutData) && /Share my figures/.test(aboutData), aboutData.slice(0, 300));
ok("6j. the privacy summary names them", /survey/i.test(privHtml) && /Share my figures/.test(privHtml));
ok("6k. the consent screen names them while sending is on", /researchPrivacyLine\(\)/.test(thread));
ok("6l. the line itself", /survey/i.test(E.researchPrivacyLine()) && /Share my figures/.test(E.researchPrivacyLine()) && /Frankfurt/.test(E.researchPrivacyLine()));
// ── 7. W5-13 RESEARCH-TRUE-2 ────────────────────────────────────────────
console.log("\nTEST 7 - the server words, the eight weeks, the kinds, the dates");
const plainPriv = () => { const d = document.createElement("div"); d.innerHTML = PV.render(); return txt(d); };
ok("7a. the privacy summary: no unqualified \"no copy on a server\" while sending is on", !/no copy on a server/i.test(plainPriv()) && /choose to send/i.test(plainPriv()), plainPriv().slice(0, 400));
person(); main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main); await wait(10);
click(settingsFind(main, '[data-open="about-data"]')); await wait(10);
ok("7b. Settings \u203a How your data is kept: the same", !/no copy on a server/i.test(txt(main)) && /choose to send/i.test(txt(main)), txt(main).slice(0, 300));
ok("7c. the consent screen takes its words from the one sentence", /noServerCopy\(\)/.test(thread) && !/no copy on a server/.test(thread.split("\n").filter(l => !/^\s*(\*|\/\/)/.test(l)).join("\n")));
log(Array.from({ length: 10 }, (_, i) => ({ type: "walk", completedAt: ago(1 + i * 3) })));
ok("7d. thirty days in: Share my figures not offered (its two four-week windows would be the same days)", !M.visibleMessages().some(m => m.action === "share-figures"));
log(Array.from({ length: 20 }, (_, i) => ({ type: "walk", completedAt: ago(1 + i * 3) })));
ok("7e. eight weeks in: offered", M.visibleMessages().some(m => m.action === "share-figures"));
ok("7f. the Bad day's gentle plan is not sent as strength", E.kindOf({ type: "workout", sessionType: "gentle-care" }) !== "strength");
ok("7g. a stretch session is mobility", E.kindOf({ type: "workout", sessionType: "stretch" }) === "mobility");
log(Array.from({ length: 20 }, (_, i) => ({ type: "walk", completedAt: ago(1 + i * 3) })));
store.set("createdAt", "2026-10-05T09:00:00.000Z");
const dates = E.researchMessages().map(m => m.publishedAt);
ok("7h. no research message dated before the app was installed", dates.length > 0 && dates.every(d => d >= "2026-10-05"), dates.join(", "));
E.RECEIVER.url = ""; E.RECEIVER.key = "";
ok("7i. with sending off, the summary says there is no copy on a server", /no copy on a server/i.test(plainPriv()));
ok("6m. with sending off, the line is empty", E.researchPrivacyLine() === "");
globalThis.fetch = realFetch;

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
