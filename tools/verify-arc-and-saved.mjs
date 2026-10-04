/**
 * tools/verify-arc-and-saved.mjs
 * 04 Oct 2026 v2
 *
 * v2 - D-1 EXERCISE-FOUR. Reaches Capture (the fourth step) before the set
 *   buttons; nothing it proves has changed.
 *
 * 30 Sep 2026 v1
 *
 * W3-16 ARC-AND-SAVED (persona Wave 3, 2.15: gym four times a week, on
 * the Plan, writes her own sessions and saves them).
 *   - The arc's pick read every strand of the aim, not the ones she
 *     chose, so it offered sessions for strands she had left out.
 *   - "Make it up as I go" never lit a strength strand: those strands
 *     have no body areas and light only from the kind of session, which
 *     a freestyle session has only if she stops to say.
 *   - A saved session stored the plan's id as its kind ("upper-1790..."),
 *     which the rebuild could not match, so it started as Glute Focus and
 *     credited glutes; and it kept only move ids, so its sections, order,
 *     sets and reps came back as the library's.
 *
 *   1. The arc's pick is from the strands chosen.
 *   2. A freestyle session of leg work lights Leg strength; one of
 *      stretches does not; the record's own kind stays hers to say.
 *   3. Saved: the kind is the kind; sections, order, sets, reps and time
 *      come back as saved (rest stays the library's); moves are still the live library's.
 *      A record stored the old way is repaired on load.
 *   4. Played from the saved list: logged as its kind, and the arc
 *      credited for that kind.
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

const RealDate = Date;
let FIXED = new RealDate(2026, 8, 30, 9, 0, 0).getTime();
class FakeDate extends RealDate {
  constructor(...a) { if (a.length) super(...a); else super(FIXED); }
  static now() { return FIXED; }
}
globalThis.Date = FakeDate; dom.window.Date = FakeDate;
const later = mins => { FIXED += mins * 60000; };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");
const SC = await import(B + "data/session-choice.js");
const SS = await import(B + "data/saved-sessions.js");
const { AIMS, STRANDS } = await import(B + "data/aims.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { resolveEquipment, exerciseIsAvailable } = await import(B + "data/equipment-map.js");
const { TodayView } = await import(B + "views/today.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const wait = ms => new Promise(r => setTimeout(r, ms));
const GYM = ["barbell", "bench-flat", "dumbbells-medium", "kettlebell-medium", "gym-membership", "cable-machine", "yoga-mat"];
function person(extra = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal"); store.set("name", "Sam");
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("gymEquipment", GYM); store.set("equipment", GYM); store.set("sessionLocation", "gym"); store.set("liftLogEnabled", true);
  for (const [k, v] of Object.entries(extra)) store.set(k, v);
}
const today = () => new Date().toISOString().split("T")[0];

// ── 1. CHOSEN STRANDS ───────────────────────────────────────────────────
console.log("\nTEST 1 - the arc picks from the strands chosen");
// An aim whose strands lead to different session types, of which the person keeps one.
const aim = AIMS.list.find(a => {
  const ts = (a.strands || []).map(s => new Set(STRANDS[s]?.sessionTypes || []));
  return ts.length >= 2 && [...ts[ts.length - 1]].some(t => !ts[0].has(t) && t !== "gym");
});
const kept = aim.strands[0];
person({ arc: { aimId: aim.id, strands: [kept], active: true, acceptedAt: today() } });
const allowed = new Set(STRANDS[kept].sessionTypes);
const picks = [];
for (let i = 0; i < 8; i++) {
  const t = SC.chooseSessionType({ location: "gym" }).sessionType; picks.push(t);
  store.set("activityLog", [...(store.get("activityLog") || []), { id: "p" + i, type: "workout", status: "completed", sessionType: t, completedAt: new Date(Date.now() - (9 - i) * 60000).toISOString() }]);
}
ok("1pc. the aim has strands she left out, with other kinds of session", aim.strands.length >= 2, aim.id);
ok("1a. eight picks, every one serves the strand she chose", picks.every(t => allowed.has(t)), `${picks.join(", ")} vs [${[...allowed]}] (${kept})`);

// ── 2. FREESTYLE LIGHTS THE ARC ─────────────────────────────────────────
console.log("\nTEST 2 - Make it up as I go lights the strand it worked");
let FS = await import(B + "views/capture.js");
const router = { history: [], navigate() {}, back() {} };
globalThis.router = router; dom.window.router = router;
async function freestyle(ids) {
  FS = await import(B + `views/capture.js?n=${Math.random()}`);
  main.innerHTML = FS.render(); FS.onMount();
  for (const id of ids) {
    const s = main.querySelector("#cap-search");
    s.value = EXERCISES.find(e => e.id === id).name; s.dispatchEvent(new dom.window.Event("input", { bubbles: true })); await wait(300);
    main.querySelector(`[data-pick="${id}"]`)?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    for (const k of ["weight", "reps"]) { const f = main.querySelector(`[data-fs-key="${k}"]`); if (f) f.value = k === "weight" ? "20" : "8"; }
    main.querySelector("#fs-log")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  }
  main.querySelector("#fs-finish")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  return (store.get("activityLog") || []).at(-1) || {};
}
const legIds = ["goblet-squat", "dumbbell-romanian-deadlift", "reverse-lunge"].filter(id => EXERCISES.some(e => e.id === id));
person({ arc: { aimId: aim.id, strands: ["leg-strength"], active: true, acceptedAt: today() } });
const e1 = await freestyle(legIds);
const tw1 = store.get("arc").typesWorked || {};
const lit = STRANDS["leg-strength"].sessionTypes.some(t => tw1[t] === today());
ok("2pc. a freestyle of three leg moves was logged", e1.type === "freestyle" && e1.exercisesCount === legIds.length, JSON.stringify(e1).slice(0, 160));
ok("2a. Leg strength is lit by it", lit, JSON.stringify(tw1));
ok("2b. and the record's own kind is still hers to say (none given, none written)", e1.sessionType == null, String(e1.sessionType));
const stretchIds = EXERCISES.filter(e => /stretch/.test(e.movementPattern || "") && !(e.equipment || []).length).slice(0, 3).map(e => e.id);
person({ arc: { aimId: aim.id, strands: ["leg-strength"], active: true, acceptedAt: today() } });
await freestyle(stretchIds);
const tw2 = store.get("arc").typesWorked || {};
ok("2c. control: three stretches do not light Leg strength", !STRANDS["leg-strength"].sessionTypes.some(t => tw2[t] === today()), JSON.stringify(tw2));

// ── 3. SAVED SESSIONS ───────────────────────────────────────────────────
console.log("\nTEST 3 - a saved session comes back as it was saved");
person();
const built = SB.buildSession({ sessionType: "upper", durationMins: 40, equipmentOverride: GYM });
// She changes a dose before saving, as the builder lets her.
const mainIdx = built.exercises.findIndex(e => (e.section || e.role) === "main");
built.exercises[mainIdx] = { ...built.exercises[mainIdx], sets: 5, reps: "5" };
const r = SS.saveSession("Tuesday upper", built);
ok("3pc. saved", r.ok, JSON.stringify(r));
ok("3a. its kind is the kind, not the plan's id", r.saved?.sessionType === "upper", String(r.saved?.sessionType));
const back = SS.resolveSavedSession(r.saved).exercises;
// Rest is the library's (verify-yourown 1c), so not compared.
const shape = list => list.map(e => `${e.id}|${e.section || e.role}|${e.sets}|${e.reps}|${e.duration}`);
ok("3b. sections, order, sets, reps and time come back as saved", JSON.stringify(shape(back)) === JSON.stringify(shape(built.exercises)),
   shape(back).find((x, i) => x !== shape(built.exercises)[i]) + " vs " + shape(built.exercises).find((x, i) => x !== shape(back)[i]));
ok("3c. her 5 x 5 is kept", back[mainIdx]?.sets === 5 && back[mainIdx]?.reps === "5");
const lib = EXERCISES.find(e => e.id === back[0].id);
ok("3d. the moves are the live library's (names and words from it)", back[0].name === lib.name && back[0].instructions === lib.instructions);
const rebuilt = SB.buildSessionFromSaved({ sessionType: r.saved.sessionType, durationMins: 40, exercises: back, title: "Tuesday upper" });
ok("3e. rebuilt for editing: same kind, same order and sections", rebuilt.sessionType === "upper" && JSON.stringify(shape(rebuilt.exercises)) === JSON.stringify(shape(built.exercises)));
// A record stored the old way.
const old = { ...r.saved, id: "own_old", sessionType: "upper-1790000000000", doses: undefined };
store.set("savedSessions", [old]);
localStorage.setItem("alongside_data", localStorage.getItem("alongside_data"));
store.init();
ok("3f. a record stored with the plan's id is repaired on load", (store.get("savedSessions") || [])[0]?.sessionType === "upper", String((store.get("savedSessions") || [])[0]?.sessionType));

// ── 4. PLAYED FROM THE LIST ─────────────────────────────────────────────
console.log("\nTEST 4 - started from the saved list and finished");
person({ arc: { aimId: aim.id, strands: ["upper-strength"], active: true, acceptedAt: today() } });
const r2 = SS.saveSession("Tuesday upper", SB.buildSession({ sessionType: "upper", durationMins: 30, equipmentOverride: GYM }));
const { SavedSessionsView } = await import(B + "views/saved-sessions.js").catch(() => ({}));
const SV = await import(B + "views/saved-sessions.js");
let navs = [];
const r4 = { navigate(v) { navs.push(v); }, back() {}, history: [] };
globalThis.router = r4; dom.window.router = r4;
main.innerHTML = "";
const view = SV.SavedSessionsView ? SV.SavedSessionsView(r4) : null;
if (view?.mount) view.mount(main); else if (SV.render) { main.innerHTML = SV.render(); SV.onMount?.(main); }
main.querySelector(`[data-saved-id="${r2.saved.id}"]`)?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const gen = store.get("generatedSession")?.session || {};
ok("4pc. the saved list started it", store.get("usingGeneratedSession") === true && gen.exercises?.length > 0 && store.get("generatedSession")?.inputs?.savedSessionId === r2.saved.id);
ok("4a. it starts as its kind, with its sections", gen.sessionType === "upper" && gen.exercises.every(e => e.section), `${gen.sessionType}; ${gen.exercises?.map(e => e.section).join(",")}`);
const W = await import(B + "views/workout.js");
globalThis.router = { navigate(v) { navs.push(v); if (v === "workout") paint(); }, back() {} }; dom.window.router = globalThis.router;
const { router: appRouter } = await import(B + "router.js");
appRouter.navigate = v => { navs.push(v); if (v === "workout") paint(); };
function paint() { main.innerHTML = W.render(); try { W.onMount(); } catch {} }
paint();
const tap = sel => { const el = main.querySelector(sel); if (el) el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };
for (let i = 0; i < 200 && !navs.includes("reflect"); i++) { if (!tap("#wo-set-done-btn") && !tap("#complete-exercise-btn") && !tap("#wo-done-btn") && !tap('[data-step-go="capture"]:not([aria-current])')) paint(); }
const done = (store.get("activityLog") || []).at(-1) || {};
ok("4b. finished, it is logged as Upper Body", navs.includes("reflect") && done.sessionType === "upper", `${done.sessionType} ${JSON.stringify(navs.slice(-2))}`);
ok("4c. and the arc is credited for it", (store.get("arc").typesWorked || {}).upper === today() && !(store.get("arc").typesWorked || {}).glute, JSON.stringify(store.get("arc").typesWorked));

console.log("");
if (fails) { console.log(`ARC-AND-SAVED: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`ARC-AND-SAVED: all ${passes} assertions pass\n`);
process.exit(0);
