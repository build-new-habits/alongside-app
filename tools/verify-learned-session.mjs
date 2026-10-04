/**
 * tools/verify-learned-session.mjs
 * 04 Oct 2026 v2
 *
 * v2 - D-1 EXERCISE-FOUR. Reaches Capture (the fourth step) before the set buttons; nothing it proves has changed.
 *
 * 30 Sep 2026 v1
 *
 * W3-12 MOSTLY-SAME (persona Wave 3: 2.14, autistic, predictability-
 * seeking). "Mostly the same each time" anchored to whatever was done
 * last, of any kind, in a new order each time:
 *   - the moves that repeated came back in a different order;
 *   - a Full Body session after an Upper Body one borrowed from Upper,
 *     not from the Full Body session the person had learned;
 *   - a lighter day's shorter list became the new "last time", so its
 *     substitutes stuck and the full session did not come back.
 *
 *   1. Repeated moves keep their order, section by section.
 *   2. The session learned is the last one of the SAME kind.
 *   3. A lighter day is the learned session's moves, fewer, in its
 *      order, and the day after, the whole learned session comes back.
 *   4. A move changes now and then: never more than one a session, in
 *      that move's own place; the warm-up is never the one.
 *   5. The real player records a lighter day as one (activityLog gentle).
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

// A clock that moves a day per session (consecutive days, as a person
// would train); the store's duplicate guard rejects writes seconds apart.
const RealDate = Date;
let FIXED = new RealDate(2026, 8, 1, 9, 0, 0).getTime();
class FakeDate extends RealDate {
  constructor(...a) { if (a.length) super(...a); else super(FIXED); }
  static now() { return FIXED; }
}
globalThis.Date = FakeDate;
const nextDay = () => { FIXED += 864e5; };

const B = new URL("../js/", import.meta.url).href;
const fs = await import("node:fs");
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { router: realRouter } = await import(B + "router.js");
const SB = await import(B + "session-builder.js");
const workout = await import(B + "views/workout.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
let navs = [];
function paint() { main.innerHTML = workout.render(); try { workout.onMount(); } catch {} }
const nav = v => { navs.push(v); if (v === "workout") paint(); };
const _router = { navigate: nav, back() {} };
globalThis.window.router = _router;
Object.defineProperty(globalThis, "router", { value: _router, configurable: true, writable: true });
realRouter.navigate = nav;
const tap = sel => { const el = main.querySelector(sel); el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };

const KIT = ["dumbbells-light", "yoga-mat", "bands"];
function person(variety) {
  localStorage.clear(); store.init();
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("tier", "personal"); store.set("onboardingComplete", true); store.set("name", "Sam");
  store.set("equipment", KIT); store.set("conditions", []);
  store.set("sessionVariety", variety);
}
const sec = e => e.section || e.role || "main";


const ids = s => s.map(e => e.id);
function build(type, low = false) {
  store.set("todayIntensity", low ? "low" : null);
  return SB.buildSession({ sessionType: type, durationMins: 30, equipmentOverride: KIT });
}
function log(type, s) {
  nextDay(); nextDay();
  store.logActivity({ type: "workout", status: "completed", date: new Date().toISOString(), completedAt: new Date().toISOString(),
    sessionType: type, exerciseIds: ids(s.exercises), exerciseSections: Object.fromEntries(s.exercises.map(e => [e.id, sec(e)])),
    exercisesCount: s.exercises.length, gentle: !!s.gentleReason });
  store.set("todayIntensity", null);
}
const overlap = (a, b) => { const B = new Set(ids(b)); return ids(a).filter(i => B.has(i)).length / Math.max(1, a.length); };
// Order of the shared moves within each section.
function orderChanges(prev, next) {
  const out = [];
  for (const part of ["warmup", "main", "cooldown"]) {
    const p = prev.filter(e => sec(e) === part).map(e => e.id), n = next.filter(e => sec(e) === part).map(e => e.id);
    const shared = p.filter(i => n.includes(i));
    const inNext = n.filter(i => shared.includes(i));
    if (shared.join() !== inNext.join()) out.push(`${part}: ${shared.length} shared, order changed`);
  }
  return out;
}

console.log("\nTEST 1 and 4 - ten sessions in a row, four kinds");
let changes = [], perSession = [], warmChanged = 0, transitions = 0, notInPlace = 0;
for (const type of ["full", "lower", "upper", "mobility"]) for (let r = 0; r < 3; r++) {
  person("familiar");
  let prev = null;
  for (let i = 0; i < 10; i++) {
    const s = build(type);
    if (prev) {
      transitions++;
      changes.push(...orderChanges(prev.exercises, s.exercises).map(c => `${type}#${i} ${c}`));
      const gone = ids(prev.exercises).filter(x => !ids(s.exercises).includes(x));
      perSession.push(gone.length);
      const w = x => x.exercises.filter(e => sec(e) === "warmup").map(e => e.id).join();
      if (w(prev) !== w(s)) warmChanged++;
      // A replacement sits where the move it replaced was.
      if (gone.length === 1 && prev.exercises.length === s.exercises.length) {
        const at = ids(prev.exercises).indexOf(gone[0]);
        if (ids(prev.exercises).includes(ids(s.exercises)[at])) notInPlace++;
      }
    }
    log(type, s); prev = s;
  }
}
ok("pc. sessions were built and compared", transitions >= 100, String(transitions));
ok("1a. repeated moves keep their order, section by section", changes.length === 0, `${changes.length}: ${changes.slice(0, 4).join("; ")}`);
ok("4a. never more than one move changes in a session", perSession.every(n => n <= 1), `max ${Math.max(...perSession)}`);
ok("4b. and moves do change now and then", perSession.some(n => n === 1), perSession.join(""));
ok("4c. the warm-up never changes", warmChanged === 0, `${warmChanged}/${transitions}`);
ok("4d. a replacement takes the place of the move it replaced", notInPlace === 0, String(notInPlace));

console.log("\nTEST 2 - the session learned is the last one of the same kind");
{
  let worse = 0, n = 0, detail = "";
  for (let r = 0; r < 6; r++) {
    person("familiar");
    const a = build("full"); log("full", a);
    const b = build("upper"); log("upper", b);
    const c = build("full");
    n++;
    if (overlap(c.exercises, a.exercises) < 0.85) { worse++; detail = `${Math.round(overlap(c.exercises, a.exercises) * 100)}%`; }
  }
  ok("2a. Full Body after an Upper Body day is the Full Body session learned (85%+ the same)", worse === 0, `${worse}/${n} below, e.g. ${detail}`);
}

console.log("\nTEST 3 - a lighter day does not stick");
{
  let bad = [], prefix = 0, runs = 0;
  for (let r = 0; r < 6; r++) {
    person("familiar");
    const a = build("full"); log("full", a);
    const b = build("full", true);
    runs++;
    const aMain = a.exercises.filter(e => sec(e) === "main").map(e => e.id);
    const bMain = b.exercises.filter(e => sec(e) === "main").map(e => e.id);
    // Every lighter-day move is one of the learned moves, in the learned order.
    const inOrder = bMain.every(id => aMain.includes(id)) && bMain.join() === aMain.filter(id => bMain.includes(id)).join();
    if (b.gentleReason && bMain.length < aMain.length && inOrder) prefix++;
    log("full", b);
    const c = build("full");
    if (overlap(a.exercises, c.exercises) < 0.85 || c.exercises.length < a.exercises.length) bad.push(`${a.exercises.length}->${b.exercises.length}->${c.exercises.length}, ${Math.round(overlap(a.exercises, c.exercises) * 100)}%`);
  }
  ok("3a. the lighter day is fewer of the learned moves, in the learned order", prefix === runs, `${prefix}/${runs}`);
  ok("3b. the day after, the whole learned session comes back", bad.length === 0, bad.join("; "));
}

console.log("\nTEST 5 - the real player records a lighter day as one");
async function play(low) {
  person("familiar");
  const s = build("full", low);
  store.set("generatedSession", { session: { ...s, sessionType: "full" }, builtAt: new Date().toISOString(), inputs: {} });
  store.set("usingGeneratedSession", true);
  navs = []; paint();
  for (let i = 0; i < s.exercises.length * 12 && !navs.includes("reflect"); i++) {
    if (tap("#wo-set-done-btn")) continue;
    if (tap("#wo-done-btn")) continue;
    if (tap("#complete-exercise-btn")) continue;
    if (tap('[data-step-go="capture"]:not([aria-current])')) continue;
    break;
  }
  store.set("todayIntensity", null);
  return (store.get("activityLog") || []).at(-1) || {};
}
const lowEntry = await play(true), usual = await play(false);
ok("5pc. both sessions were finished in the player", lowEntry.type === "workout" && usual.type === "workout", `${lowEntry.type} ${usual.type}`);
ok("5a. a lighter day's entry says so", lowEntry.gentle === true, JSON.stringify(lowEntry.gentle));
ok("5b. a usual day's does not", usual.gentle === false, JSON.stringify(usual.gentle));

{
  // The Plan's session screen records builder sessions too (as verify-mostly-same 1c reads it).
  const gp = fs.readFileSync(new URL("js/views/gym-programme.js", new URL("../", import.meta.url)), "utf8");
  const at = gp.indexOf("status:         'complete'");
  const block = gp.slice(at, at + 1400);
  ok("5c. the Plan's session screen records gentle, and its moves in plan order",
     at > -1 && /gentle:\s+!!_st\.gentleReason/.test(block) && /\[\.\.\.completedExerciseIndices\]\.sort\(/.test(block));
}

console.log("");
if (fails) { console.log(`LEARNED-SESSION: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`LEARNED-SESSION: all ${passes} assertions pass\n`);
process.exit(0);
