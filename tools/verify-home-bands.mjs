/**
 * tools/verify-home-bands.mjs
 * 13 Oct 2026 v1
 *
 * HOME-BANDS (Graeme, 13 Oct: "I have short and long resistance bands …
 * Pallof press, face pull, seated row … can we ensure we have a full
 * range, include aerobic exercises for home?"; "Now please").
 *
 * Found on v659: every band was one tag. Light, medium and heavy long
 * bands, short loop bands and therapy bands all resolved to
 * "resistance-band", so somebody with only a loop band was offered a face
 * pull or an overhead press that needs a long band, and somebody with only
 * a long band was offered clamshells that need a loop round the knees.
 *
 *   1. Kit. A short loop band gives "loop-band" and not "resistance-band";
 *      a long band (and a pull-up assist band, also a long loop) gives
 *      "resistance-band" and not "loop-band"; a flat therapy band can be
 *      tied as either, so it gives both; the session screen's plain
 *      "Resistance bands", a gym and a studio give both.
 *   2. The live pools (session-builder buildCandidatePools, the builder's
 *      own path) for every strength and cardio session type: loop band
 *      only, nothing needs a long band, and loop work is there; long band
 *      only, nothing needs a loop band, and the long-band work is there.
 *      Control: the same harness with no bands offers neither. The Quiet
 *      Cardio Circuit is a whole session, so its way in is the practices
 *      list the Library shows (as for the existing no-kit circuit).
 *   3. Every entry that loops a band round both legs carries "loop-band"
 *      and not "resistance-band" (read from its own instructions).
 *   4. The new entries exist and meet the Exercise Entry Standard: 3-6
 *      steps, 2-4 watch-outs, one of them a plain stop for pain, load in
 *      effort and never kilos, sets, reps and rest, a search term not a
 *      link, no ranking words in any adaptation.
 *   5. The range: long-band pulling, pushing, hinging, squatting, lunging
 *      and rotation; at least eight loop-band entries; at least fourteen
 *      quiet standing or floor cardio moves needing no kit or only a band,
 *      none of the new ones a jump.
 *   6. The kit chips say which band is which: "Long band" and "Short loop
 *      band".
 */
import fs from "node:fs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { resolveEquipment } = await import(B + "data/equipment-map.js");
const { EQUIPMENT_CATEGORIES } = await import(B + "data/equipment.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 600)}`); }
};
const byId = Object.fromEntries(EXERCISES.map(e => [e.id, e]));
const eq = e => e.equipment || [];
const needsLong = e => eq(e).includes("resistance-band");
const needsLoop = e => eq(e).includes("loop-band");

const LONG_NEW = ["band-kneeling-pulldown", "band-lateral-raise", "band-reverse-fly", "band-pull-through",
  "band-overhead-triceps-extension", "band-standing-woodchop", "band-push-up", "band-split-squat"];
const LOOP_NEW = ["loop-band-glute-bridge", "loop-band-squat", "loop-band-standing-kickback"];
const CARDIO_NEW = ["step-jacks", "skater-steps", "cross-body-knee-drive", "squat-to-reach",
  "step-back-burpee", "band-punches", "quiet-cardio-circuit"];
const RETAGGED = ["band-lateral-walk", "clamshell-banded", "resistance-band-walk-lateral", "monster-walk", "seated-hip-abduction-band"];
const NEW = [...LONG_NEW, ...LOOP_NEW, ...CARDIO_NEW];

// ── 1. KIT ──────────────────────────────────────────────────────────────
console.log("\nTEST 1 - which band gives which capability");
const r = ids => resolveEquipment(ids);
const has = (set, t) => (set instanceof Set ? set.has(t) : set.includes(t));
const loopOnly = r(["mini-bands"]);
ok("1a. a short loop band gives loop-band", has(loopOnly, "loop-band"), [...loopOnly].join(","));
ok("1b. and not a long band", !has(loopOnly, "resistance-band"), [...loopOnly].join(","));
for (const id of ["band-light", "band-medium", "band-heavy", "pull-up-assist"]) {
  const s = r([id]);
  ok(`1c. ${id} gives resistance-band and not loop-band`, has(s, "resistance-band") && !has(s, "loop-band"), [...s].join(","));
}
for (const id of ["therapy-band", "resistance-bands", "gym-membership", "fitness-studio"]) {
  const s = r([id]);
  ok(`1d. ${id} gives both`, has(s, "resistance-band") && has(s, "loop-band"), [...s].join(","));
}

// ── 2. LIVE POOLS ───────────────────────────────────────────────────────
console.log("\nTEST 2 - the builder's own pools, by kit");
function person() {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal"); store.set("name", "Sam");
  store.set("fitnessLevel", "active"); store.set("goals", ["get-stronger"]);
  store.set("capability", { askedAt: new Date().toISOString(), balanceWorry: "no", chairRise: "yes", legPower: "full", floorAccess: "yes" });
}
const TYPES = ["upper", "lower", "full", "glute", "core", "cardio"];
function poolUnion(kit) {
  person();
  const out = new Map();
  for (const t of TYPES) {
    const p = SB.buildCandidatePools({ sessionType: t, durationMins: 40, equipmentOverride: kit });
    if (!p) continue;
    for (const sec of Object.keys(p)) if (Array.isArray(p[sec])) for (const e of p[sec]) out.set(e.id, byId[e.id] || e);
  }
  return [...out.values()];
}
const poolLoop = poolUnion(["mini-bands", "yoga-mat"]);
const poolLong = poolUnion(["band-medium", "yoga-mat"]);
const poolNone = poolUnion(["yoga-mat"]);
const longInLoop = poolLoop.filter(needsLong).map(e => e.id);
ok("2a. loop band only: nothing that needs a long band", longInLoop.length === 0, longInLoop.join(", "));
const loopHere = poolLoop.filter(needsLoop).map(e => e.id);
ok("2b. loop band only: loop work is offered (at least six)", loopHere.length >= 6, loopHere.join(", "));
const loopInLong = poolLong.filter(needsLoop).map(e => e.id);
ok("2c. long band only: nothing that needs a loop band", loopInLong.length === 0, loopInLong.join(", "));
const longHere = poolLong.map(e => e.id);
const longMissing = ["band-face-pull", "band-row-seated", "pallof-press", ...LONG_NEW, "band-punches"].filter(id => !longHere.includes(id));
ok("2d. long band only: face pull, seated row, Pallof press and every new long-band move are offered", longMissing.length === 0, longMissing.join(", "));
const loopMissing = LOOP_NEW.filter(id => !poolLoop.map(e => e.id).includes(id));
ok("2e. loop band only: every new loop-band move is offered", loopMissing.length === 0, loopMissing.join(", "));
const anyBand = poolNone.filter(e => needsLong(e) || needsLoop(e)).map(e => e.id);
ok("2f. control: no band, no band work (the harness reads the kit)", anyBand.length === 0 && poolNone.length > 20, anyBand.join(", ") + ` pool ${poolNone.length}`);
const quietMissing = CARDIO_NEW.filter(id => !["band-punches", "quiet-cardio-circuit"].includes(id) && !poolNone.map(e => e.id).includes(id));
ok("2g. no kit: every new no-kit cardio move is offered", quietMissing.length === 0, quietMissing.join(", "));
// The circuit is a whole session (isSessionLength), so the builder leaves it
// out by design; its way in is the practices list, read here from the live
// module the Library renders.
const { getPracticeGroups, getStandalonePractices } = await import(B + "data/practice-library.js");
const practiceIds = getPracticeGroups().flatMap(g => (g.items || g.practices || g.exercises || []).map(e => e.id || e));
const standalone = getStandalonePractices().map(e => e.id);
ok("2h. the Quiet Cardio Circuit is a practice the Library offers", practiceIds.includes("quiet-cardio-circuit") && standalone.includes("quiet-cardio-circuit"),
   `groups ${practiceIds.length}, standalone ${standalone.length}`);
ok("2i. control: the existing no-kit circuit is offered the same way", practiceIds.includes("cardio-circuit-training"), `groups ${practiceIds.length}`);

// ── 3. LOOP ENTRIES TAGGED BY WHAT THEY SAY ─────────────────────────────
console.log("\nTEST 3 - a band round both legs is a loop band");
const LOOP_TEXT = /\b(loop|looped|place|put)\b[^.]*\bband\b[^.]*(above (your|the|both) knees|around both legs|around both ankles)/i;
const saysLoop = EXERCISES.filter(e => (e.instructions || []).some(s => LOOP_TEXT.test(s)) && (needsLong(e) || needsLoop(e)));
const wrong = saysLoop.filter(e => !needsLoop(e) || needsLong(e)).map(e => e.id);
ok(`3a. all ${saysLoop.length} carry loop-band and not resistance-band`, saysLoop.length >= 8 && wrong.length === 0, wrong.join(", "));
const notRe = RETAGGED.filter(id => !byId[id] || !needsLoop(byId[id]) || needsLong(byId[id]));
ok("3b. the five loop moves found on v659 are retagged", notRe.length === 0, notRe.join(", "));

// ── 4. NEW ENTRIES TO THE STANDARD ──────────────────────────────────────
console.log("\nTEST 4 - the new entries, written to the Exercise Entry Standard");
const absent = NEW.filter(id => !byId[id]);
ok(`4a. all ${NEW.length} exist`, absent.length === 0, absent.join(", "));
const RANK = /\b(easy|easier|hard(er)?|beginner|advanced|intermediate|modified|regression|progression|basic|proper)\b/i;
const KILO = /\d\s?(kg|kilo|lb|pound)/i;
const fault = [];
for (const id of NEW) {
  const e = byId[id]; if (!e) continue;
  const why = [];
  const n = (e.instructions || []).length; if (n < 3 || n > 6) why.push(`instructions ${n}`);
  const w = (e.watchOut || []).length; if (w < 2 || w > 4) why.push(`watchOut ${w}`);
  if (!(e.watchOut || []).some(s => /\bpain\b/i.test(s) && /(stop|leave|rest of today|for today)/i.test(s))) why.push("no pain stop");
  for (const f of ["name", "category", "why", "coaching", "youtube", "movementPattern", "position"]) if (!e[f]) why.push(`no ${f}`);
  if (/^https?:/i.test(e.youtube || "")) why.push("youtube is a link");
  if (!Array.isArray(e.contraindications)) why.push("no contraindications");
  if (!(e.energyRequired >= 1 && e.energyRequired <= 10) || !(e.difficultyLevel >= 1 && e.difficultyLevel <= 10)) why.push("energy/difficulty");
  if (typeof e.impact !== "boolean" || typeof e.balanceDemand !== "boolean") why.push("impact/balance");
  if (e.category === "strength" && (!e.load || !e.sets || !e.reps || e.rest == null)) why.push("load/sets/reps/rest");
  const words = [e.why, e.coaching, e.load, ...(e.instructions || []), ...(e.watchOut || [])].join(" ");
  if (KILO.test(words)) why.push("a weight in numbers");
  const adapt = [...((e.adaptations || {}).easeOff || []), ...((e.adaptations || {}).further || [])].join(" ");
  if (RANK.test(adapt)) why.push(`ranking word in an adaptation: ${adapt.match(RANK)[0]}`);
  if (why.length) fault.push(`${id}: ${why.join("; ")}`);
}
ok("4b. every field the standard asks for, and nothing it rules out", fault.length === 0, fault.join(" | "));
const jumpy = CARDIO_NEW.filter(id => byId[id] && byId[id].impact !== false);
ok("4c. none of the new cardio is a jump (impact false)", jumpy.length === 0, jumpy.join(", "));
const tagFault = [...LONG_NEW.filter(id => byId[id] && (!needsLong(byId[id]) || needsLoop(byId[id]))),
  ...LOOP_NEW.filter(id => byId[id] && (!needsLoop(byId[id]) || needsLong(byId[id])))];
ok("4d. long-band moves need a long band, loop-band moves a loop band", tagFault.length === 0, tagFault.join(", "));

// ── 5. RANGE ────────────────────────────────────────────────────────────
console.log("\nTEST 5 - the range at home");
const longStrength = EXERCISES.filter(e => needsLong(e) && e.category === "strength" && !e.adaptive);
const pats = p => longStrength.filter(e => p.includes(e.movementPattern)).length;
const range = { pull: pats(["pull"]), push: pats(["push"]), hinge: pats(["hinge"]), squat: pats(["squat"]), lunge: pats(["lunge"]), rotation: pats(["rotation", "anti-rotation"]) };
const thin = Object.entries(range).filter(([k, v]) => v < 1).map(([k]) => k);
ok("5a. long band, standing: pulling, pushing, hinging, squatting, lunging and rotation", thin.length === 0, JSON.stringify(range));
const loops = EXERCISES.filter(needsLoop);
ok("5b. at least eight loop-band entries", loops.length >= 8, `${loops.length}`);
const quiet = EXERCISES.filter(e => e.category === "cardio" && e.impact === false && !e.adaptive && e.position !== "seated"
  && eq(e).every(t => t === "resistance-band" || t === "loop-band")
  && !/^(run-|c25k|swim|saq|plyo)/.test(e.id) && e.discipline !== "sport");
ok("5c. at least fourteen quiet home cardio moves (8 on v659)", quiet.length >= 14, `${quiet.length}: ${quiet.map(e => e.id).join(" ")}`);

// ── 6. KIT CHIPS ────────────────────────────────────────────────────────
console.log("\nTEST 6 - the kit list says which band is which");
const bands = (EQUIPMENT_CATEGORIES.find(c => c.id === "bands") || { items: [] }).items;
const label = id => (bands.find(i => i.id === id) || {}).name || "";
ok("6a. light, medium and heavy are named long bands", ["band-light", "band-medium", "band-heavy"].every(id => /^Long band/.test(label(id))), bands.map(i => i.name).join(" | "));
ok("6b. the mini band is named a short loop band", /^Short loop band/.test(label("mini-bands")), label("mini-bands"));
ok("6c. the ids are unchanged, so nobody's saved kit moves", ["band-light", "band-medium", "band-heavy", "mini-bands", "therapy-band", "pull-up-assist"].every(id => bands.some(i => i.id === id)));

console.log(`\nHOME-BANDS: ${fails ? fails + " FAILED, " : ""}${passes} passed`);
process.exit(fails ? 1 : 0);
