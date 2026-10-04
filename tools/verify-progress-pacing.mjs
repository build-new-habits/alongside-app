/**
 * tools/verify-progress-pacing.mjs
 * 04 Oct 2026 v2
 *
 * v2 - LOOK-2: the lifts are on their own page (progress.js v26). REACH
 *   only: test 1 opens the Your lifts row before reading the rows, and 1c
 *   finds the note on that page (#pr-lifts-h now sits in the page head, so
 *   the note is under .pr-page, not the heading's parent). No expected
 *   value changed.
 *
 * 29 Sep 2026 v1
 *
 * P25, PROGRESS AND PACING (persona finding W2-20).
 *   1. Progress's lifts stopped at 8 rows, and "latest" was the last set
 *      logged -- often a lighter back-off set -- not the working set: a
 *      first day at 70 kg and a latest day at 75 kg then 55 kg read
 *      "70 kg -> 55 kg".
 *   2. Pacing left out Make it up as I go ("freestyle"), classes and
 *      movement practices: "about 1 a week" after six sessions.
 *   3. A yoga entry reused the previous workout's id: yoga judged a
 *      leftover entry by a `status` field the coach's player never writes.
 *      Walk, run, swim and cycle spread the leftover with no check at all,
 *      carrying its id and its exercises into the new entry.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const pacing = await import(B + "data/pacing.js");

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
const day = (n, h = 10, m = 0) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(h, m, 0, 0); return d.toISOString(); };
function person(tier = "personal") {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "Sam");
  store.set("createdAt", day(40));
}

// ── 1. LIFTS ────────────────────────────────────────────────────────────
console.log("\nTEST 1 - Progress: every lift, and the working set, not the last one");
person();
const lifts = EXERCISES.filter(e => (e.equipment || []).some(q => /dumbbell|barbell|kettlebell/.test(q))).slice(0, 10);
const log = {};
for (const e of lifts) log[e.id] = [
  { at: day(20, 10, 0), weight: 60, reps: 8, unit: "kg" }, { at: day(20, 10, 5), weight: 70, reps: 5, unit: "kg" }, { at: day(20, 10, 9), weight: 50, reps: 12, unit: "kg" },
  { at: day(2, 10, 0),  weight: 75, reps: 5, unit: "kg" }, { at: day(2, 10, 6), weight: 55, reps: 12, unit: "kg" },
];
store.set("liftLog", log); store.set("liftLogEnabled", true);
const { ProgressView } = await import(B + "views/progress.js");
main.innerHTML = ""; ProgressView(rtr).mount(main); await wait(40);
// LOOK-2: the lifts are one tap away, on their own page.
main.querySelector('[data-pr-page="lifts"]')?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const rows = [...main.querySelectorAll(".pr-lift")];
ok("1pc. ten lifts, two days each, three and two sets", lifts.length === 10 && !!main.querySelector("#pr-lifts-h"), `${lifts.length}`);
ok("1a. all ten are there (it stopped at 8)", rows.length === 10, `${rows.length} rows`);
const texts = rows.map(r => txt(r.querySelector(".pr-lift__text")));
ok("1b. each reads the working set: 70 kg -> 75 kg (not 60 -> 55)", texts.every(t => t === "70 kg → 75 kg"), texts.slice(0, 3).join(" | "));
ok("1c. the note says what is compared", /heaviest|best/i.test(txt(main.querySelector("#pr-lifts-h")?.closest(".pr-page")?.querySelector(".pr-note"))), txt(main.querySelector("#pr-lifts-h")?.closest(".pr-page")?.querySelector(".pr-note")));

// ── 2. PACING ───────────────────────────────────────────────────────────
console.log("\nTEST 2 - pacing counts every kind of movement session");
person();
const e = (type, n, extra = {}) => ({ id: `${type}-${n}`, type, status: "completed", completedAt: day(n), date: day(n), ...extra });
const breathId = EXERCISES.find(x => x.movementPattern === "breath-awareness")?.id;
const flowId = EXERCISES.find(x => x.contentType === "practice" && x.movementPattern === "yoga-pose")?.id
            || EXERCISES.find(x => x.contentType === "practice" && !["breath-awareness", "grounding"].includes(x.movementPattern))?.id;
store.set("activityLog", [e("freestyle", 2), e("freestyle", 5), e("freestyle", 9), e("class", 12), e("class", 15),
  e("practice", 18, { exerciseIds: [flowId] }), e("practice", 19, { exerciseIds: [breathId] }), e("mindful", 3)]);
const avg = pacing.recentWeeklyAverage(3);
ok("2pc. six movement sessions in three weeks, plus a breathing practice and a mindful one", !!breathId && !!flowId, `${breathId} ${flowId}`);
ok("2a. about 2 a week, not \"about 1\" (freestyle, class and a movement practice count)", avg === 2, String(avg));
store.set("activityLog", [e("freestyle", 0), e("class", 0, { completedAt: day(0, 12) }), e("freestyle", 0, { id: "f3", completedAt: day(0, 14) })]);
ok("2b. the day's count sees them too", pacing.todaysExerciseCount() === 3, String(pacing.todaysExerciseCount()));
store.set("activityLog", [e("practice", 0, { exerciseIds: [breathId] }), e("mindful", 0, { id: "m2", completedAt: day(0, 11) })]);
ok("2c. control: breathing stays uncounted", pacing.todaysExerciseCount() === 0, String(pacing.todaysExerciseCount()));

// ── 3. EVERY ENTRY ITS OWN ID ───────────────────────────────────────────
console.log("\nTEST 3 - a session never takes the previous one's id or exercises");
person();
// What the coach's player leaves behind: its logged entry, no status.
const wk = store.logActivity({ type: "workout", date: day(0, 9), completedAt: day(0, 9), exerciseIds: ["push-up", "goblet-squat"] });
store.set("currentActivityEntry", wk);
ok("3pc. the workout is logged and left as the current entry, with no status", !!wk && !wk.status && store.get("currentActivityEntry")?.id === wk.id);
ok("3a. a logged entry is not pending", store.pendingActivityEntry() === null);
const fresh = { id: "intention-1", type: "walk", sessionStart: day(0, 11), energyBefore: 6 };
store.set("currentActivityEntry", fresh);
ok("3b. control: a genuinely pending entry (from intention) is", store.pendingActivityEntry()?.id === "intention-1");
store.set("currentActivityEntry", wk);
const again = store.logActivity({ id: wk.id, type: "yoga", completedAt: day(0, 12), exerciseIds: ["yoga-tree-pose"] });
ok("3c. and the log never holds two entries with one id", !!again && again.id !== wk.id && new Set((store.get("activityLog") || []).map(x => x.id)).size === store.get("activityLog").length, `${again?.id} vs ${wk.id}`);
// The five views that spread a leftover: they ask the store.
const fs = await import("node:fs");
const views = ["yoga-session", "walk-session", "running-session", "swim-session", "cycle-session"];
const direct = views.filter(v => {
  const s = fs.readFileSync(new URL(`../js/views/${v}.js`, import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  return /const\s+(raw)?[Pp]ending\s*=\s*store\.get\(["']currentActivityEntry["']\)/.test(s) || !/store\.pendingActivityEntry\(\)/.test(s);
});
ok("3d. yoga, walk, run, swim and cycle take a leftover only through the store's check", direct.length === 0, direct.join(", "));

console.log("");
if (fails) { console.log(`PROGRESS-PACING: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`PROGRESS-PACING: all ${passes} assertions pass\n`);
process.exit(0);
