/**
 * tools/verify-mostly-same.mjs
 * 29 Sep 2026 v2
 *
 * v2 - P26. Sessions a day apart were, with the lighter-day rule working
 *   again (data/checkin.js v10), every third one a lighter day: fewer
 *   sets and a shorter session, by design. That is not what this gate
 *   measures, so the sessions are two days apart, which no gentle rule
 *   reads. verify-gentle-signals covers the lighter day.
 *
 * P19, "MOSTLY THE SAME" (persona finding W2-14). Persona 2.14 chose
 * "Mostly the same each time" for predictability. Measured over ten
 * consecutive sessions (before this fix, Full Body, 30 min):
 *   - the warm-up was identical to last time in 0 of 72 transitions;
 *   - overlap with the last session averaged about two thirds but ranged
 *     10%-100%: every move reached the mastery threshold in the same
 *     session and rotated out at once;
 *   - 7-19% of repeated moves changed section (warm-up one day, main the
 *     next), with a different dose;
 *   - the same movement twice under two names ("Glute Bridge" and
 *     "Glute Bridge — Activation").
 *
 * Decision (accepted 28 Sep): anchor warm-up, section and dose; dedupe
 * near-duplicates. Gate over 10 consecutive sessions.
 *
 *   1. The real player records the section each move was done in.
 *   2. Ten consecutive sessions, "Mostly the same", four session types,
 *      recorded exactly as the players record them: the warm-up is last
 *      time's; no repeat changes section or dose; overlap is what
 *      Settings says, and never collapses.
 *   3. No two moves with the same name stem in one session, any setting.
 *   4. Control: "A bit of both" and "Something different" still vary.
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

// ── 1. THE PLAYER RECORDS THE SECTION ───────────────────────────────────
console.log("\nTEST 1 - the coach's player records which section each move was done in");
{
  person("familiar");
  const s = SB.buildSession({ sessionType: "full", durationMins: 30, equipmentOverride: KIT });
  store.set("generatedSession", { session: { ...s, sessionType: "full" }, builtAt: new Date().toISOString(), inputs: {} });
  store.set("usingGeneratedSession", true);
  navs = []; paint();
  for (let i = 0; i < s.exercises.length * 12 && !navs.includes("reflect"); i++) {
    if (tap("#wo-set-done-btn")) continue;
    if (tap("#wo-done-btn")) continue;
    if (tap("#complete-exercise-btn")) continue;
    break;
  }
  const h = store.get("exerciseHistory") || {};
  const wrong = s.exercises.filter(e => (h[e.id] || {}).section !== sec(e)).map(e => `${e.id}: ${sec(e)} vs ${(h[e.id] || {}).section}`);
  ok("1pc. a real builder session, finished in the real player", navs.includes("reflect") && s.exercises.every(e => h[e.id]), JSON.stringify(navs));
  ok("1a. each move's history says the section it was done in", wrong.length === 0, wrong.join("; "));
  const log = store.get("activityLog") || [];
  ok("1b. and the log entry itself carries no new field", !("exerciseSections" in (log.at(-1) || {})), Object.keys(log.at(-1) || {}).join(","));
}
// The Plan's session screen records builder sessions too: its entry names sections.
{
  const gp = fs.readFileSync(new URL("js/views/gym-programme.js", new URL("../", import.meta.url)), "utf8");
  const at = gp.indexOf("status:         'complete'");
  ok("1c. the Plan's session screen passes sections on completion too", at > -1 && /exerciseSections:/.test(gp.slice(at, at + 1200)));
}

// ── 2. TEN CONSECUTIVE SESSIONS ─────────────────────────────────────────
const stem = n => String(n).toLowerCase().split(/\s+[—–-]\s+/)[0].trim();
function run(type, variety, runs = 5) {
  const m = { overlap: [], warmSame: 0, warmN: 0, moved: [], dose: [], pairs: 0, dupes: new Set() };
  for (let r = 0; r < runs; r++) {
    person(variety);
    let prev = null;
    for (let i = 0; i < 10; i++) {
      const ex = SB.buildSession({ sessionType: type, durationMins: 30, equipmentOverride: KIT }).exercises;
      // A plain name beside its own suffixed twin: "Clamshell" and
      // "Clamshell — Glute Activation". Two suffixed variants ("Leg Swing —
      // Lateral", "Leg Swing — Forward and Back") are different movements.
      const names = ex.map(e => String(e.name));
      for (const a of names) for (const b of names)
        if (a !== b && stem(b) === a.toLowerCase().trim()) m.dupes.add(`${a} / ${b}`);
      if (prev) {
        const p = new Map(prev.map(e => [e.id, e]));
        const same = ex.filter(e => p.has(e.id));
        m.overlap.push(same.length / ex.length);
        const w = x => x.filter(e => sec(e) === "warmup").map(e => e.id).sort().join(",");
        m.warmN++; if (w(ex) && w(ex) === w(prev)) m.warmSame++;
        for (const e of same) {
          m.pairs++;
          const q = p.get(e.id);
          if (sec(q) !== sec(e)) m.moved.push(`${e.id} ${sec(q)}->${sec(e)}`);
          else if (`${q.sets}|${q.reps}|${q.duration}` !== `${e.sets}|${e.reps}|${e.duration}`) m.dose.push(`${e.id} ${q.sets}x${q.reps}/${q.duration} -> ${e.sets}x${e.reps}/${e.duration}`);
        }
      }
      // Recorded exactly as the players record a finished session.
      nextDay(); nextDay();   // every other day: see v2
      store.logActivity({ type: "workout", status: "completed", date: new Date().toISOString(), completedAt: new Date().toISOString(),
        sessionType: type, exerciseIds: ex.map(e => e.id), exerciseSections: Object.fromEntries(ex.map(e => [e.id, sec(e)])),
        exercisesCount: ex.length });
      prev = ex;
    }
  }
  const mean = m.overlap.reduce((a, b) => a + b, 0) / m.overlap.length;
  return { ...m, mean, min: Math.min(...m.overlap) };
}
const pct = x => `${Math.round(x * 100)}%`;
const settingsSrc = fs.readFileSync(new URL("js/views/settings.js", new URL("../", import.meta.url)), "utf8");
const familiarHint = (settingsSrc.match(/id: 'familiar', label: '[^']*',\s*hint: '([^']*)'/) || [])[1] || "";

console.log(`\nTEST 2 - "Mostly the same each time", ten sessions in a row (Settings: "${familiarHint}")`);
const fam = {};
for (const t of ["full", "lower", "upper", "mobility"]) {
  const r = fam[t] = run(t, "familiar");
  console.log(`        ${t}: overlap ${pct(r.mean)} (lowest ${pct(r.min)}), warm-up as last time ${r.warmSame}/${r.warmN}, section changes ${r.moved.length}/${r.pairs}, dose changes ${r.dose.length}/${r.pairs}`);
}
const all = Object.values(fam);
ok("2a. the warm-up is last time's in at least 8 of 10 transitions", all.every(r => r.warmSame / r.warmN >= 0.8),
   all.map(r => `${r.warmSame}/${r.warmN}`).join(" "));
ok("2b. no repeated move changes section", all.every(r => r.moved.length === 0), all.flatMap(r => r.moved).slice(0, 6).join("; "));
ok("2c. no repeated move changes its dose", all.every(r => r.dose.length === 0), all.flatMap(r => r.dose).slice(0, 6).join("; "));
// "Most ... A move changes now and then": most, and not all.
const lo = /two thirds/i.test(familiarHint) ? 0.55 : 0.75, hi = /two thirds/i.test(familiarHint) ? 0.8 : 0.97;
ok(`2d. overlap is what Settings says (${pct(lo)}-${pct(hi)} on average)`, all.every(r => r.mean >= lo && r.mean <= hi), all.map(r => pct(r.mean)).join(" "));
ok("2e. and it never collapses: every session keeps at least half of the last", all.every(r => r.min >= 0.5), all.map(r => pct(r.min)).join(" "));

// ── 3. NEAR-DUPLICATES ──────────────────────────────────────────────────
console.log("\nTEST 3 - the same movement never twice under two names in one session");
const dupes = new Set(all.flatMap(r => [...r.dupes]));
const bal = run("full", "balanced", 4), var_ = run("full", "varied", 4), mob = run("mobility", "balanced", 4);
[bal, var_, mob].forEach(r => r.dupes.forEach(d => dupes.add(d)));
ok("3a. no move beside its own suffixed twin in one session, on any setting", dupes.size === 0, [...dupes].join("; "));

// ── 4. CONTROL ──────────────────────────────────────────────────────────
console.log("\nTEST 4 - control: the other settings still vary");
console.log(`        balanced ${pct(bal.mean)}, varied ${pct(var_.mean)}, familiar ${pct(fam.full.mean)} (Full Body)`);
ok("4a. \"A bit of both\" repeats clearly less than \"Mostly the same\"", bal.mean <= fam.full.mean - 0.2);
ok("4b. \"Something different\" repeats least", var_.mean < bal.mean);

console.log("");
if (fails) { console.log(`MOSTLY-SAME: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`MOSTLY-SAME: all ${passes} assertions pass\n`);
process.exit(0);
