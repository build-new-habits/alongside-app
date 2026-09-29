/**
 * tools/verify-data-tags.mjs
 * 29 Sep 2026 v1
 *
 * P16, DATA TAGS (persona finding W2-6, too loose). The capability filters
 * are only as good as the tags they read, and some tags contradicted the
 * exercise's own instructions:
 *   - floor work tagged seated or standing (90-90 Hip Stretch "Sit on the
 *     floor", tagged seated; World's Greatest Stretch "knee on the floor",
 *     tagged standing; Inchworm and Burpee walk into a plank);
 *   - jumping, skipping, sprint and cutting drills tagged impact: false;
 *   - drills that need a partner, with no flag -- Alongside is used alone.
 *
 * Which moves suit whom is a clinical question (S1). Whether a tag agrees
 * with the words on the card is not: it is data.
 *
 *   1. Every exercise whose instructions put the person on the floor is
 *      tagged floor; every one whose instructions jump, skip, bound or
 *      sprint is tagged impact. Reviewed exceptions are listed, each with
 *      the words that make it one.
 *   2. Every exercise that needs a partner is flagged, and the builder
 *      never proposes one.
 *   3. Through the real builder: somebody who cannot get to the floor is
 *      never given the re-tagged floor moves; somebody not cleared for
 *      impact never gets the re-tagged impact moves.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const B = new URL("../js/", import.meta.url).href;
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { EQUIPMENT_CATEGORIES } = await import(B + "data/equipment.js");
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const words = e => [...(e.instructions || []), e.description || "", e.setup || ""].join(" | ");

// ── 1. THE WORDS AND THE TAGS AGREE ─────────────────────────────────────
console.log("\nTEST 1 - text says floor -> tagged floor; text says jump or sprint -> tagged impact");
const FLOOR_WORDS = /\b(sit on the floor|knee on the floor|lie (on your back|on your front|flat|down)|lie or sit|lying on|supine|prone|on all fours|hands and knees|plank position|mountain climbers|press-ups|burpees|chaturanga|upward dog)\b/i;
// Reviewed: the words offer a choice that is not the floor.
const FLOOR_OK = {
  "three-part-breath": "Lie on your back or sit tall",
  "gym-leg-curl": "Lie or sit -- a machine, set up either way",
};
const IMPACT_WORDS = /\b(jump|jumps|jumping|skip|skipping|a-skip|bound|bounding|sprint|sprints|sprinting|burpees?|high knees|hop|hopping)\b/i;
const IMPACT_OK = {
  "walk-run-intervals": "not a sprint",
  "swim-hard-200": "not a sprint",
  "balance-board-single-leg": "Step down between sides rather than hopping",
  "yoga-restorative-sequence": "Supine bound angle -- a pose",
};
const floorMis = [], impactMis = [];
for (const e of EXERCISES) {
  const t = words(e);
  if (FLOOR_WORDS.test(t) && e.position !== "floor" && !FLOOR_OK[e.id]) floorMis.push(`${e.id} [${e.position}] "${t.match(FLOOR_WORDS)[0]}"`);
  if (IMPACT_WORDS.test(t) && e.impact !== true && !IMPACT_OK[e.id]) impactMis.push(`${e.id} "${t.match(IMPACT_WORDS)[0]}"`);
}
ok("1pc. the library is read", EXERCISES.length > 500, String(EXERCISES.length));
ok("1a. every floor instruction is tagged floor", floorMis.length === 0, `${floorMis.length}: ${floorMis.join("; ")}`);
ok("1b. every jump, skip, bound or sprint is tagged impact", impactMis.length === 0, `${impactMis.length}: ${impactMis.join("; ")}`);
const stale = [...Object.keys(FLOOR_OK), ...Object.keys(IMPACT_OK)].filter(id => !EXERCISES.some(e => e.id === id));
ok("1c. every reviewed exception still exists (none kept by accident)", stale.length === 0, stale.join(", "));

// ── 2. PARTNERS ─────────────────────────────────────────────────────────
console.log("\nTEST 2 - a drill that needs a partner is flagged, and never proposed");
const PARTNER_WORDS = /\bpartner\b/i;
// Reviewed: a partner is one way; the words give one that needs nobody.
const PARTNER_OK = {
  "plyo-med-ball-chest-pass": "Stand facing a wall or partner",
  "nordic-curl-assisted": "held down by a partner, a heavy sofa, or tucked under a bar",
  "bodyweight-nordic-curl-progression": "anchored under something heavy or held by a partner",
};
const needs = EXERCISES.filter(e => PARTNER_WORDS.test(words(e)) && !PARTNER_OK[e.id]);
const unflagged = needs.filter(e => e.partner !== true).map(e => e.id);
ok("2pc. there are drills that need a partner", needs.length >= 5, String(needs.length));
ok("2a. each is flagged partner: true", unflagged.length === 0, unflagged.join(", "));
ok("2b. nothing that works alone is flagged", EXERCISES.filter(e => e.partner === true && !needs.includes(e)).length === 0);

const ALL_KIT = EQUIPMENT_CATEGORIES.flatMap(c => (c.items || c.options || []).map(i => i.id || i)).filter(Boolean);
function person(cap = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal"); store.set("name", "Sam");
  store.set("conditions", []); store.set("conditionPainScores", {});
  store.set("equipment", ALL_KIT);
  store.set("capability", { ...(store.get("capability") || {}), ...cap });
}
function sweep(runs = 6) {
  const seen = new Set();
  for (const t of SB.SESSION_TYPES) for (const mins of [20, 45]) for (let i = 0; i < runs; i++) {
    try { SB.buildSession({ sessionType: t.id, durationMins: mins, equipmentOverride: ALL_KIT }).exercises.forEach(x => seen.add(x.id)); } catch {}
  }
  return seen;
}
person({ bothFeet: "yes", floorAccess: "yes", balanceWorry: "no", chairRise: "yes", askedAt: new Date().toISOString() });
const open = sweep();
ok("2pc2. the sweep covers every session type with every piece of kit", open.size > 150, `${open.size} distinct exercises`);
const partnered = [...open].filter(id => EXERCISES.find(e => e.id === id)?.partner === true || needs.some(e => e.id === id));
ok("2c. no session proposes a drill that needs a partner", partnered.length === 0, partnered.join(", "));

// ── 3. THE FILTERS NOW SEE THEM ─────────────────────────────────────────
console.log("\nTEST 3 - through the real builder, the corrected tags are obeyed");
const RETAGGED_FLOOR = ["90-90-hip-stretch", "worlds-greatest-stretch", "inchworm", "burpee"];
const RETAGGED_IMPACT = ["jumping-jacks", "skipping-rope", "run-drill-bounding", "drill-cutting-movement", "drill-zig-zag-run"];
person({ bothFeet: "no", floorAccess: "no", balanceWorry: "yes", chairRise: "not-easily", legPower: "limited", askedAt: new Date().toISOString() });
const careful = sweep();
ok("3pc. the careful sweep still builds sessions", careful.size > 20, `${careful.size} distinct`);
const gotFloor = RETAGGED_FLOOR.filter(id => careful.has(id));
const gotImpact = RETAGGED_IMPACT.filter(id => careful.has(id));
ok("3a. cannot get to the floor: none of the re-tagged floor moves", gotFloor.length === 0, gotFloor.join(", "));
ok("3b. not cleared for impact: none of the re-tagged impact moves", gotImpact.length === 0, gotImpact.join(", "));

console.log("");
if (fails) { console.log(`DATA-TAGS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`DATA-TAGS: all ${passes} assertions pass\n`);
process.exit(0);
