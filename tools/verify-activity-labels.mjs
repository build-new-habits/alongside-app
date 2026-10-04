/**
 * tools/verify-activity-labels.mjs
 * 04 Oct 2026 v3
 *
 * v3 - LOOK-2: the summary chips (.progress-summary__type) are gone from
 *   Progress (progress.js v26); the kinds card names every kind instead.
 *   4pc/4a read the kinds card's names (.progress-shapes__name) in place of
 *   the chips. Same assertion: at least three rows, every one in words, no
 *   raw id and no "gym".
 *
 * v2 - W3-20 TRUE-WORDS. "Mostly X" is said only when X is more than half
 *   (it was said on a plurality, and on a tie). 4b's fixture had gym two
 *   of five; it is now three of five. What 4b tests -- the kind in words,
 *   not "mostly gym" -- is unchanged.
 *
 * 29 Sep 2026 v1
 *
 * P7, "SINCE YESTERDAY". The coach's recap said "Since yesterday, you
 * did ..." over a 48-hour window, so two days ago counted as yesterday.
 * And three separate maps (the plan's recap, Home's line, Progress) named
 * activity types by keys nothing writes ("walk-session", "yoga-session"),
 * so real entries fell through: "you did gym" at home, "movement" after
 * breathing, raw words on Progress.
 *
 * Now one map (js/data/activity-labels.js) for every type the app writes,
 * and the recap names the actual day.
 *   1. Every type any view logs, and every manual activity-log type, has a
 *      phrase and a noun in words -- found by scanning the source.
 *   2. The plan's recap: today, yesterday, two days ago, a built session.
 *   3. Home's line about yesterday.
 *   4. Progress names each type in words.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;
dom.window.alert = () => {}; globalThis.alert = () => {};

const R = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const rtr = { navigate() {}, back() {}, history: [] };
globalThis.window.router = rtr;
Object.defineProperty(globalThis, "router", { value: rtr, configurable: true, writable: true });

// Local calendar times, as the person lives them.
const at = (daysAgo, hour) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(hour, 0, 0, 0); return d.toISOString(); };
const nowHour = new Date().getHours();
const todayEarlier = at(0, Math.max(0, nowHour - 1));
function fixture(tier, log) {
  localStorage.clear(); store.init();
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("equipment", ["dumbbells-light"]); store.set("homeEquipment", ["dumbbells-light"]);
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  store.set("activityLog", log.map((e, i) => ({ id: "e" + i, status: "completed", ...e, date: e.completedAt })));
}

// ── 1. EVERY TYPE THE APP WRITES ─────────────────────────────────────────
console.log("\nTEST 1 - every type the app writes has words");
const written = new Set();
for (const f of fs.readdirSync(new URL("js/views/", R))) {
  if (!f.endsWith(".js")) continue;
  const src = fs.readFileSync(new URL("js/views/" + f, R), "utf8");
  for (const m of src.matchAll(/logActivity\(\{[\s\S]{0,300}?\btype:\s*["']([a-z-]+)["']/g)) written.add(m[1]);
}
const alSrc = fs.readFileSync(new URL("js/views/activity-log.js", R), "utf8");
for (const m of alSrc.matchAll(/id:\s*["']([a-z-]+)["'],\s*label:/g)) written.add(m[1]);
ok("1pc. the scan found the app's types", written.size >= 25 && written.has("mindfulness") && written.has("gym") && written.has("hike"), [...written].join(","));
let AL = null;
try { AL = await import(B + "data/activity-labels.js"); } catch (e) { /* red before the module exists */ }
ok("1a. one label module exists", !!AL && typeof AL.activityPhrase === "function" && typeof AL.activityNoun === "function");
if (AL) {
  const bad = [...written].filter(t => {
    const p = AL.activityPhrase({ type: t }), n = AL.activityNoun({ type: t });
    // A single-word id that is a word ("yoga", "tennis") is fine; a
    // hyphenated id, the unknown fallback, or bare "movement" is not.
    return !p || !n || /-/.test(p + n) || p === "some activity" || /^movement$/.test(p);
  });
  ok("1b. each has a phrase and a noun, in words, never a raw id", bad.length === 0, bad.join(", "));
  ok("1c. a built session is named by its kind, not \"gym\"", AL.activityPhrase({ type: "gym", sessionType: "lower" }) === "a lower body session", AL.activityPhrase({ type: "gym", sessionType: "lower" }));
}

// ── 2. THE PLAN'S RECAP ──────────────────────────────────────────────────
console.log("\nTEST 2 - the coach's recap names the actual day");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
async function recap(log) {
  fixture("personal", log);
  main.innerHTML = ""; CoachProposalView(rtr).mount(main); await wait(40);
  return txt(main);
}
{
  const t1 = await recap([{ type: "walk", completedAt: at(1, 12) }]);
  ok("2a. a walk yesterday: \"Yesterday you did a walk\"", /Yesterday you did a walk\./.test(t1) && !/Since yesterday/.test(t1), t1.slice(0, 200));
  const t2 = await recap([{ type: "mindfulness", completedAt: at(2, 23) }]);
  ok("2b. two days ago is not yesterday", !/yesterday/i.test(t2), t2.slice(0, 200));
  const t3 = await recap([{ type: "gym", sessionType: "lower", completedAt: todayEarlier }]);
  ok("2c. a built session at home earlier today: named by its kind, and the day", /Earlier today you did a lower body session\./.test(t3) && !/you did gym/.test(t3), t3.slice(0, 200));
  const t4 = await recap([{ type: "mindfulness", completedAt: at(1, 9) }, { type: "walk", completedAt: at(1, 18) }]);
  ok("2d. breathing is breathing, not \"movement\"", /Yesterday you did a breathing practice and a walk\./.test(t4), t4.slice(0, 200));
}

// ── 3. HOME ──────────────────────────────────────────────────────────────
console.log("\nTEST 3 - Home's line about yesterday");
{
  const { TodayView } = await import(B + "views/today.js");
  fixture("free", [{ type: "mindfulness", completedAt: at(1, 12) }]);
  main.innerHTML = ""; TodayView(rtr).mount(main); await wait(60);
  const t = txt(main);
  ok("3pc. Home rendered", t.length > 50);
  ok("3a. it says breathing, not \"movement\"", !/You did movement yesterday/.test(t) && (/You did a breathing practice yesterday/.test(t) || !/yesterday/i.test(t)), t.slice(0, 240));
}

// ── 4. PROGRESS ──────────────────────────────────────────────────────────
console.log("\nTEST 4 - Progress names each type in words");
{
  const { ProgressView } = await import(B + "views/progress.js");
  // W3-20: "mostly" means more than half, so three of the five are gym.
  const LOG = [{ type: "gym", completedAt: at(4, 12) }, { type: "gym", completedAt: at(3, 12) }, { type: "gym", completedAt: at(2, 12) }, { type: "outdoor-cycle", completedAt: at(1, 12) }, { type: "prescribed-session", completedAt: at(1, 14) }];
  fixture("personal", LOG);
  main.innerHTML = ""; ProgressView(rtr).mount(main); await wait(60);
  // LOOK-2: the chips are gone; the kinds card names every kind.
  const types = [...main.querySelectorAll(".progress-shapes__name")].map(txt);
  ok("4pc. the Plan's breakdown lists what was done", types.length >= 3, txt(main).slice(0, 200));
  ok("4a. every row is words, no raw id", types.length >= 3 && types.every(s => !/-|\bgym\b/.test(s.replace(/ × \d+$/, ""))), JSON.stringify(types));
  fixture("free", LOG);
  main.innerHTML = ""; ProgressView(rtr).mount(main); await wait(60);
  const mostly = txt(main).match(/mostly ([^.]+)\./)?.[1];
  ok("4b-pc. Free says what it was mostly", !!mostly, txt(main).slice(0, 200));
  ok("4b. in words: not \"mostly gym\"", !!mostly && !/-|^gym$/.test(mostly), mostly);
}

console.log("");
if (fails) { console.log(`ACTIVITY-LABELS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`ACTIVITY-LABELS: all ${passes} assertions pass\n`);
process.exit(0);
