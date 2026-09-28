/**
 * tools/verify-freestyle.mjs
 * 28 Sep 2026 v1
 *
 * SMOOTH-P3c. "Make it up as I go". Spec 4.7.
 *
 * Measured on v550: the third door opened CAPTURE-1's picker, which kept
 * a list of names. No set could be logged on it (each move had to be
 * walked through the player, one at a time), the search offered moves
 * the kit here could not do, a sore area was not mentioned, and a
 * finished capture with no kind given inherited whatever session type
 * the builder had last made.
 *
 * Driven through the real view (capture.js), the real store and the
 * real lift log. The spec's acceptance, exactly: 3 moves × 3 sets writes
 * 9 lift-log entries and 1 completed activity; Progress's count sees it;
 * search never returns a move whose kit is not declared here; the sore
 * note appears for a move that loads a sore area.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { resolveEquipment, exerciseIsAvailable } = await import(B + "data/equipment-map.js");
const FS = await import(B + "views/capture.js");
const { TodayView } = await import(B + "views/today.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
let navs = [];
const router = { history: [], navigate(v) { navs.push(v); if (v === "capture") paint(); }, back() {} };
globalThis.router = router; dom.window.router = router;
function paint() { main.innerHTML = FS.render(); FS.onMount(); }
const GYM = ["barbell", "bench-flat", "dumbbells-medium", "gym-membership"];
const HOME = ["band-medium"];

function fixture({ scores = {}, liftLog = {}, gen = null } = {}) {
  document.getElementById("session-exit-overlay")?.remove();
  FS.onUnmount?.();
  // Leave any session from the last test without saving.
  if (document.querySelector("[data-freestyle]")) { click(main.querySelector("#fs-exit")); click(document.querySelector("#exit-confirm-discard")); }
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal");
  store.set("gymEquipment", GYM); store.set("homeEquipment", HOME); store.set("equipment", [...GYM, ...HOME]);
  store.set("sessionLocation", "gym");
  store.set("liftLogEnabled", true);
  store.set("conditionPainScores", scores);
  store.set("liftLog", liftLog);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  if (gen) store.set("generatedSession", gen);
  navs = [];
  paint();
}
function pick(id) {
  const btn = main.querySelector(`[data-pick="${id}"]`);
  if (btn) { click(btn); return true; }
  // Not offered on screen: search for it, as a person would.
  const s = main.querySelector("#cap-search");
  s.value = EXERCISES.find(e => e.id === id)?.name || id;
  s.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  return null;
}
const settle = () => new Promise(r => setTimeout(r, 300));
async function pickAsync(id) {
  if (pick(id)) return true;
  await settle();
  const b = main.querySelector(`[data-pick="${id}"]`);
  click(b);
  return !!b;
}
function logSet(values) {
  for (const [k, v] of Object.entries(values)) {
    const input = main.querySelector(`[data-fs-key="${k}"]`);
    if (input) input.value = String(v);
  }
  click(main.querySelector("#fs-log"));
}
const avail = new Set(EXERCISES.filter(e => exerciseIsAvailable(e, resolveEquipment(GYM))).map(e => e.id));
const loaded = EXERCISES.filter(e => avail.has(e.id) && (e.equipment || []).some(t => ["barbell", "dumbbell"].includes(t)));
const [M1, M2, M3] = loaded.slice(0, 3);

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - Home's third door opens the freestyle session");
fixture();
main.innerHTML = ""; TodayView(router).mount(main); navs = [];
click(main.querySelector('[data-action="as-i-go"]'));
ok("0a. one tap from Home", navs[0] === "capture" && !!main.querySelector("[data-freestyle]"), JSON.stringify(navs));
ok("0b. Exit, a running clock and Finish", !!main.querySelector("#fs-exit") && /^\d+:\d\d$/.test(txt(main.querySelector("#fs-clock"))) &&
   !!main.querySelector("#fs-finish"));
ok("0c. three moves with loaded kit exist for the fixture", !!(M1 && M2 && M3), `${loaded.length} loaded moves at the fixture gym`);

// ── 1. THE ACCEPTANCE: 3 × 3 ────────────────────────────────────────────
console.log("\nTEST 1 - 3 moves × 3 sets: 9 lift-log entries, 1 completed activity");
fixture();
for (const m of [M1, M2, M3]) {
  await pickAsync(m.id);
  logSet({ weight: 20, reps: 10 }); logSet({ weight: 22.5, reps: 10 }); logSet({ weight: 22.5, reps: 8 });
}
const lifts = Object.values(store.get("liftLog") || {}).reduce((n, l) => n + l.length, 0);
ok("1a. nine lift-log entries, three per move", lifts === 9 &&
   [M1, M2, M3].every(m => (store.get("liftLog")[m.id] || []).length === 3), `${lifts} entries`);
ok("1b. the moves done so far show their sets", /20 kg × 10 · 22.5 × 10 · 22.5 × 8/.test(txt(main.querySelector(".fs-done"))),
   txt(main.querySelector(".fs-done")));
click(main.querySelector("#fs-finish"));
const log = store.get("activityLog") || [];
ok("1c. Finish writes ONE activity entry, type freestyle", log.length === 1 && log[0].type === "freestyle", JSON.stringify(log));
ok("1d. with the moves, the sets, the time and which exercises",
   log[0]?.exercisesCount === 3 && log[0]?.setsDone === 9 && log[0]?.durationMins >= 1 &&
   JSON.stringify(log[0]?.exerciseIds) === JSON.stringify([M1.id, M2.id, M3.id]) && !!log[0]?.completedAt);
ok("1e. it is a completed session to COUNT-1, so Progress counts it", store.completedSessions(log).length === 1 && log[0].status !== "partial");
ok("1f. the exercise history records all three", [M1, M2, M3].every(m => !!(store.get("exerciseHistory") || {})[m.id]));
ok("1g. and on to the finish screen", navs.at(-1) === "reflect" && store.get("currentActivityEntry")?.id === log[0].id);

// ── 2. THE MOVE CARD ────────────────────────────────────────────────────
console.log("\nTEST 2 - the move card: last time, pre-filled, steppers, Log set n");
const ago = new Date(Date.now() - 3 * 86400000).toISOString();
fixture({ liftLog: { [M1.id]: [{ at: ago, weight: 40, unit: "kg", reps: 10 }] } });
await pickAsync(M1.id);
ok("2a. Set 1 · last time 40 kg × 10", /Set 1 · last time 40 kg × 10/.test(txt(main.querySelector(".fs-move__set"))), txt(main.querySelector(".fs-move__set")));
ok("2b. weight and reps pre-filled from last time", main.querySelector('[data-fs-key="weight"]')?.value === "40" && main.querySelector('[data-fs-key="reps"]')?.value === "10");
click(main.querySelector('[data-fs-step="fs-f-weight"][data-step="2.5"]'));
ok("2c. + adds the plate step", main.querySelector('[data-fs-key="weight"]')?.value === "42.5");
ok("2d. every field has a label", [...main.querySelectorAll("[data-fs-key]")].every(i => !!main.querySelector(`label[for="${i.id}"]`)));
ok("2e. the button says which set", /^Log set 1$/.test(txt(main.querySelector("#fs-log"))));
click(main.querySelector("#fs-log"));
ok("2f. logged, said, and the next set starts from this one", /Set 1 logged: 42.5 kg × 10/.test(txt(main.querySelector("#fs-status"))) &&
   main.querySelector('[data-fs-key="weight"]')?.value === "42.5" && /^Log set 2$/.test(txt(main.querySelector("#fs-log"))));
ok("2g. and focus stays on Log set", document.activeElement?.id === "fs-log");
ok("2h. last time stays last time (not the set just done)", /last time 40 kg × 10/.test(txt(main.querySelector(".fs-move__set"))));
ok("2i. If it hurts is open on the first move", !!main.querySelector("details.xcard-hurt[open]"));
await pickAsync(M2.id);
ok("2j. and closed on the next", !!main.querySelector("details.xcard-hurt") && !main.querySelector("details.xcard-hurt[open]"));
main.querySelectorAll("[data-fs-key]").forEach(i => { i.value = ""; });
click(main.querySelector("#fs-log"));
ok("2k. nothing entered: it says so and logs nothing", /Put in what you did first/.test(txt(main.querySelector("#fs-status"))) &&
   !(store.get("liftLog")[M2.id] || []).length);

// ── 3. KIT ──────────────────────────────────────────────────────────────
console.log("\nTEST 3 - search never offers a move the kit here does not allow");
fixture();
const bad = [];
for (const loc of ["gym", "home", "outside"]) {
  const kit = resolveEquipment(loc === "gym" ? GYM : loc === "home" ? HOME : []);
  for (const q of ["press", "squat", "row", "curl", "lats", "quads", "chest", "deadlift", "bench", "pull", "glutes", "core"]) {
    for (const ex of FS.searchHere(q, loc).found) if (!exerciseIsAvailable(ex, kit)) bad.push(`${loc}:${q}:${ex.id}`);
  }
}
ok("3a. across 36 searches at three places, nothing the kit rules out", bad.length === 0, bad.slice(0, 5).join(", "));
const barbellHits = FS.searchHere("barbell", "gym").found.length;
ok("3b. REVERSAL: the gym search does find barbell moves", barbellHits > 0);
ok("3c. and at home, with a band only, it finds none", FS.searchHere("barbell", "home").found.length === 0 &&
   FS.searchHere("barbell", "home").anyKit > 0);
store.set("sessionLocation", "home"); paint();
const s = main.querySelector("#cap-search"); s.value = "barbell"; s.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
await settle();
ok("3d. and says why, rather than showing nothing", /Nothing for “barbell” with the kit you have at home/.test(txt(main.querySelector("#cap-status"))),
   txt(main.querySelector("#cap-status")));
ok("3e. suggestions obey the kit too", FS.suggestions("home").list.every(e => exerciseIsAvailable(e, resolveEquipment(HOME))));
click(main.querySelector("#fs-where"));
ok("3f. Change moves where, and says where", store.get("sessionLocation") === "gym" && /At the gym/.test(txt(main.querySelector(".fs-where"))));

// ── 4. SORE ─────────────────────────────────────────────────────────────
console.log("\nTEST 4 - a move that loads a sore area is shown with a note, not hidden");
const soreArea = M1.affectsAreas[0];
fixture({ scores: { [soreArea]: 4 } });
const hits = FS.searchHere(M1.name, "gym").found;
ok("4a. still offered", hits.some(e => e.id === M1.id));
{
  const s4 = main.querySelector("#cap-search"); s4.value = M1.name; s4.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  await settle();
  const row = main.querySelector(`[data-pick="${M1.id}"]`);
  const noteEl = row && document.getElementById(row.getAttribute("aria-describedby") || "x");
  ok("4c. the pick carries the note, tied to it for a screen reader", /this one loads it/.test(txt(noteEl)), txt(row));
}
await pickAsync(M1.id);
ok("4b. the card says so, in words", new RegExp(`You mentioned your .* today — this one loads it`).test(txt(main.querySelector(".fs-sore"))),
   txt(main.querySelector(".fs-sore")));
fixture({ scores: { [soreArea]: 8 } });
ok("4d. bad today says bad", /You said your .* is bad today — this one loads it/.test(FS.soreNote(M1)));
fixture({ scores: {} });
ok("4e. REVERSAL: nothing sore, no note", FS.soreNote(M1) === "");

// ── 5. SUGGESTIONS ──────────────────────────────────────────────────────
console.log("\nTEST 5 - what you usually do next, from your own order");
const t0 = Date.now() - 5 * 86400000;
const at = m => new Date(t0 + m * 60000).toISOString();
fixture({ liftLog: {
  [M1.id]: [{ at: at(0), weight: 40, reps: 10 }, { at: at(3), weight: 40, reps: 10 }, { at: at(1440), weight: 40, reps: 10 }],
  [M2.id]: [{ at: at(8), weight: 20, reps: 10 }, { at: at(1445), weight: 20, reps: 10 }],
  [M3.id]: [{ at: at(20), weight: 10, reps: 12 }],
} });
ok("5a. with nothing done yet, the recent moves", /Recently/.test(txt(main.querySelector(".fs-next"))));
await pickAsync(M1.id);
const sug = FS.suggestions("gym");
ok("5b. after M1: what you usually do after it, most often first", sug.heading === `What you usually do after ${M1.name}` && sug.list[0]?.id === M2.id,
   `${sug.heading}: ${sug.list.map(e => e.id).join(", ")}`);
ok("5c. and it is on screen", txt(main.querySelector(".fs-next")).includes(`What you usually do after ${M1.name}`));
fixture();
await pickAsync(M1.id);
const none = FS.suggestions("gym");
ok("5d. REVERSAL: no history, so ideas -- not called a habit", /^Ideas for the gym$/.test(none.heading) && none.list.length === 3 &&
   !/usually/.test(txt(main.querySelector(".fs-next"))));

// ── 6. EXIT ─────────────────────────────────────────────────────────────
console.log("\nTEST 6 - Exit: Save what I did, or Leave without saving; both go Home");
fixture();
await pickAsync(M1.id); logSet({ weight: 20, reps: 10 });
click(main.querySelector("#fs-exit"));
const sheet = document.querySelector("#session-exit-overlay");
ok("6a. a titled dialog with three plain choices", sheet?.getAttribute("role") === "dialog" &&
   JSON.stringify([...sheet.querySelectorAll("button")].map(txt)) === JSON.stringify(["Keep going", "Save what I did", "Leave without saving"]));
ok("6b. focus starts on Keep going", document.activeElement?.id === "exit-confirm-stay");
click(document.querySelector("#exit-confirm-save"));
ok("6c. Save what I did: one entry, and Home", navs.at(-1) === "today" && (store.get("activityLog") || []).length === 1 &&
   store.get("activityLog")[0].setsDone === 1);
fixture();
await pickAsync(M1.id); logSet({ weight: 20, reps: 10 });
click(main.querySelector("#fs-exit")); click(document.querySelector("#exit-confirm-discard"));
ok("6d. Leave without saving: nothing saved as a session, and Home", navs.at(-1) === "today" && (store.get("activityLog") || []).length === 0);
paint();
ok("6e. and the next visit starts fresh", !main.querySelector(".fs-move") && !main.querySelector(".fs-done"));

// ── 7. FINISH WITH NOTHING ──────────────────────────────────────────────
console.log("\nTEST 7 - Finish with nothing logged says so");
fixture();
click(main.querySelector("#fs-finish"));
ok("7a. an alert, no entry, no navigation", /Log a set first/.test(txt(main.querySelector("#fs-error"))) &&
   main.querySelector("#fs-error")?.getAttribute("role") === "alert" && !navs.includes("reflect") && !(store.get("activityLog") || []).length);

// ── 8. NO INVENTED KIND ─────────────────────────────────────────────────
console.log("\nTEST 8 - a freestyle session's kind is what they said, never inherited");
fixture({ gen: { session: { id: "core-1", sessionType: "core", exercises: [] }, builtAt: new Date().toISOString() } });
await pickAsync(M1.id); logSet({ weight: 20, reps: 10 });
click(main.querySelector("#fs-finish"));
ok("8a. no kind given: sessionType is null, not the builder's last (core)", store.get("activityLog")[0]?.sessionType === null,
   String(store.get("activityLog")[0]?.sessionType));
fixture({ gen: { session: { id: "core-1", sessionType: "core", exercises: [] }, builtAt: new Date().toISOString() } });
await pickAsync(M1.id); logSet({ weight: 20, reps: 10 });
click(main.querySelector('[data-kind="upper"]'));
click(main.querySelector("#fs-finish"));
ok("8b. REVERSAL: a kind given is recorded", store.get("activityLog")[0]?.sessionType === "upper");
store.logActivity({ type: "workout", completedAt: new Date(Date.now() + 60000).toISOString() });
ok("8c. and other sessions still infer as before (workout picks up the builder's type)",
   (store.get("activityLog") || []).at(-1)?.sessionType === "upper" || (store.get("activityLog") || []).at(-1)?.sessionType === "core");

console.log("");
if (fails) { console.log(`FREESTYLE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`FREESTYLE: all ${passes} assertions pass\n`);
process.exit(0);
