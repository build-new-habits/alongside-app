/**
 * tools/verify-held-movements.mjs
 * 01 Nov 2026 v1
 *
 * P-20 TRENDS-BUILD, the held entries (master schedule v614; Graeme, 01 Nov:
 * "Build now, new entries held"). The ten new trend movements are written
 * to the entry standard, drawn, and offered NOWHERE until the clinical read
 * (P-18). Drives the real recipes with the held entries handed to them, as
 * if one had been released by mistake, and reads the source only for the
 * import graph.
 *
 *  0. Positive controls: the file loads; the recipes do use an entry they
 *     are given that is NOT held (so "never offered" is not "never ran").
 *  1. The ten, exactly: the same ids as trend-recipes HELD, each once, none
 *     in EXERCISES or PATH_MOVEMENTS.
 *  2. Entry standard v6: every required field, the right shape; no
 *     adaptations (rule 8); an analogue in the library; known vocabulary.
 *  3. The approved facts: Burpee Broad Jump is the only impact entry (the
 *     no-jump version is beside it); the reformer pair is Pilates; words
 *     never name a trademark, a score or a weight in kilos.
 *  4. Held: nothing in js/ imports held_movements.js; no held id appears in
 *     any js/ file but this one, its figures and trend-recipes HELD.
 *  5. Held, in behaviour: every recipe, handed the held entries in its
 *     lookup and in its pools' place, still never offers one.
 *  6. Drawn: each has a figure (verify-figures 1d holds the frames).
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node"]) Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const ROOT = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const { HELD_MOVEMENTS } = await import(B + "data/exercises/held_movements.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { PATH_MOVEMENTS } = await import(B + "data/exercises/path_movements.js");
const R = await import(B + "data/trend-recipes.js");
const FG = await import(B + "figures.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 500)}`); }
};
const J = v => JSON.stringify(v);
const H = HELD_MOVEMENTS;
const heldIds = new Set(H.map(e => e.id));
const LIB = new Map(EXERCISES.map(e => [e.id, e]));

console.log("\nTEST 0 - positive controls");
ok("0a. the held file loads ten entries", Array.isArray(H) && H.length === 10, H?.length);
{
  // A recipe offers what it is given when it is not held: the zone2 easy pool's first entry.
  const first = R.ZONE2_POOLS.walk.easy[0];
  const s = R.zone2Session({ activity: "walk", kind: "easy", week: 1, byId: LIB });
  ok("0b. a recipe offers an entry it is given that is not held (the walk's easy pool)", !!s && s.steps.some(x => x.id === first), J(s?.steps));
}

console.log("\nTEST 1 - the ten, exactly");
ok("1a. the same ids as trend-recipes HELD", J([...heldIds].sort()) === J([...R.HELD].sort()), J([[...heldIds].sort(), [...R.HELD].sort()]));
ok("1b. each id once", heldIds.size === H.length);
ok("1c. none is in EXERCISES (the builder, the yoga player, the practice list and Free read it)", H.every(e => !LIB.has(e.id)), H.filter(e => LIB.has(e.id)).map(e => e.id));
ok("1d. none is in PATH_MOVEMENTS (the Plan's programmes and swaps read it)", H.every(e => !PATH_MOVEMENTS.some(p => p.id === e.id)));

console.log("\nTEST 2 - entry standard v6");
const known = k => new Set(EXERCISES.flatMap(e => [].concat(e[k] || [])));
const KIT = new Set([...known("equipment"), ...known("equipmentOptional")]);
const AREAS = known("affectsAreas");
const COND = new Set([...known("contraindications"), ...known("caution")]);
const PATTERNS = new Set([...known("movementPattern")]);
const DOORS = ["stronger", "moving", "stretch", "feel"];
const STYLES = ["exercise", "stretch", "yoga", "pilates", "taichi", "qigong", "gentle"];
const str = v => typeof v === "string" && v.trim().length > 0;
for (const e of H) {
  const bad = [];
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id)) bad.push("id");
  for (const k of ["name", "category", "why", "coaching", "youtube", "load", "position"]) if (!str(e[k])) bad.push(k);
  if (/^https?:/.test(e.youtube)) bad.push("youtube is a URL");
  if (!Array.isArray(e.instructions) || e.instructions.length !== 5 || !e.instructions.every(str)) bad.push("instructions (5)");
  if (!Array.isArray(e.watchOut) || e.watchOut.length !== 3 || !e.watchOut.every(str)) bad.push("watchOut (3)");
  for (const k of ["energyRequired", "difficultyLevel"]) if (!Number.isInteger(e[k]) || e[k] < 1 || e[k] > 10) bad.push(k);
  if (!Number.isFinite(e.duration) || e.duration <= 0) bad.push("duration");
  for (const k of ["impact", "balanceDemand", "perSide"]) if (typeof e[k] !== "boolean") bad.push(k);
  if (!Array.isArray(e.doors) || !e.doors.length || !e.doors.every(d => DOORS.includes(d))) bad.push("doors");
  if (!Array.isArray(e.feelings) || e.feelings.length) bad.push("feelings (none: not a Move to feel better movement)");
  if (!STYLES.includes(e.style)) bad.push("style");
  if (!PATTERNS.has(e.movementPattern)) bad.push("movementPattern " + e.movementPattern);
  if (![].concat(e.equipment, e.equipmentOptional).every(k => KIT.has(k))) bad.push("kit");
  if (!e.affectsAreas.every(a => AREAS.has(a))) bad.push("areas");
  if (![].concat(e.contraindications, e.caution).every(c => COND.has(c))) bad.push("conditions");
  if ("adaptations" in e) bad.push("adaptations written (rule 8: unreviewed proposals do not ship)");
  const an = LIB.get(e.analogue);
  if (!an) bad.push("analogue " + e.analogue);
  ok(`2. ${e.id}: to the standard, analogue ${e.analogue}`, bad.length === 0, bad.join("; "));
}
const dropped = H.flatMap(e => (LIB.get(e.analogue)?.contraindications || []).filter(c => !e.contraindications.includes(c) && !e.caution.includes(c)).map(c => `${e.id}: ${c}`));
ok("2z. every analogue's contraindication is kept, as a contraindication or a caution", dropped.length === 0, dropped.join(", "));

console.log("\nTEST 3 - the approved facts and words");
ok("3a. only Burpee Broad Jump is impact", J(H.filter(e => e.impact).map(e => e.id)) === J(["burpee-broad-jump"]), J(H.filter(e => e.impact).map(e => e.id)));
ok("3b. its no-jump version is said beside it", /no-jump version is offered beside it every time/.test(H.find(e => e.id === "burpee-broad-jump").load));
ok("3c. Wall Ball names its gentler version, which is in the library", /Medicine Ball Squat to Press/.test(H.find(e => e.id === "wall-ball").load) && LIB.has("medicine-ball-squat-press"));
ok("3d. the reformer pair is Pilates, lying, with a long band", ["band-footwork", "band-feet-in-straps"].every(id => { const e = H.find(x => x.id === id); return e.style === "pilates" && e.position === "floor" && e.equipment.includes("resistance-band"); }));
const words = H.map(e => [e.name, e.why, e.coaching, e.load, ...e.instructions, ...e.watchOut].join(" ")).join(" ");
ok("3e. no trademark, score, best, time or kilos in any word", !/hyrox|deka|personal best|\bscore|race pace|your time|\bkg\b|kilo|burns? calories/i.test(words), (words.match(/hyrox|deka|personal best|\bscore|race pace|your time|\bkg\b|kilo|burns? calories/gi) || []).join(", "));

console.log("\nTEST 4 - held: nothing in the app reaches them");
const walk = dir => fs.readdirSync(new URL(dir, ROOT), { withFileTypes: true }).flatMap(d => d.isDirectory() ? walk(`${dir}${d.name}/`) : d.name.endsWith(".js") ? [`${dir}${d.name}`] : []);
const files = walk("js/");
const importers = files.filter(f => /held_movements(\.js)?["']/.test(fs.readFileSync(new URL(f, ROOT), "utf8")));
ok("4a. no js/ file imports held_movements.js", importers.length === 0, importers.join(", "));
const ALLOWED = new Set(["js/data/exercises/held_movements.js", "js/data/figures/batch-16.js", "js/data/trend-recipes.js"]);
const mentions = [];
for (const f of files) {
  if (ALLOWED.has(f)) continue;
  const src = fs.readFileSync(new URL(f, ROOT), "utf8");
  for (const id of heldIds) if (new RegExp(`["'\`]${id}["'\`]`).test(src)) mentions.push(`${f}: ${id}`);
}
ok("4b. no held id is named in any other js/ file", mentions.length === 0, mentions.join(", "));
const rec = fs.readFileSync(new URL("js/data/trend-recipes.js", ROOT), "utf8");
const heldBlock = rec.slice(rec.indexOf("export const HELD"), rec.indexOf("]);", rec.indexOf("export const HELD")));
// Outside HELD, a held id may wait as the first choice of a Hybrid station or a reformer slot (the race
// or machine version, skipped while held: TEST 5 proves it), so releasing it is one line: at most once each.
const outside = [...heldIds].map(id => [id, (rec.split(`"${id}"`).length - 1) - (heldBlock.split(`"${id}"`).length - 1)]);
ok("4c. in trend-recipes.js each held id is in HELD, and outside it named at most once (a waiting first choice)",
   [...heldIds].every(id => heldBlock.includes(`"${id}"`)) && outside.every(([, n]) => n <= 1), J(outside.filter(([, n]) => n > 1)));
const waiting = outside.filter(([, n]) => n === 1).map(([id]) => id).sort();
ok("4d. the six waiting are exactly the station and slot first choices the drafts name", J(waiting) === J(["band-feet-in-straps", "band-footwork", "burpee-broad-jump", "loaded-walking-lunge", "sled-pull", "wall-ball"]), J(waiting));

console.log("\nTEST 5 - held, in behaviour: handed the held entries, no recipe offers one");
// As if a held entry were released by mistake: in the lookup, and listed first in every pool.
const ALL = new Map([...LIB, ...H.map(e => [e.id, e])]);
const ids = s => (s?.steps || s?.exercises || []).map(x => x.id).concat((s?.stations || []).flatMap(x => [x.id, ...(x.steps || []).map(y => y.id)]));
const seen = [];
const look = (label, s) => { for (const id of ids(s)) if (heldIds.has(id)) seen.push(`${label}: ${id}`); };
const saved = {};
const pools = [R.ZONE2_POOLS, R.SNACK_POOLS, R.HILIT_POOLS, R.DYNAMIC_POOLS].filter(Boolean);
for (const P of pools) for (const k of Object.keys(P)) for (const kk of Object.keys(P[k] || {})) {
  if (Array.isArray(P[k][kk])) { saved[`${k}.${kk}`] = P[k][kk]; }
}
const prepend = arr => [...heldIds, ...arr];
const withHeld = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, Array.isArray(v) ? prepend(v) : (v && typeof v === "object" ? withHeld(v) : v)]));
const ZP = withHeld(R.ZONE2_POOLS);
let ran = 0;
for (const act of Object.keys(R.ZONE2_POOLS)) for (const kind of ["easy", "hard"]) {
  const ordered = R.orderPool(ZP[act][kind], { byId: ALL });
  if (ordered.some(id => heldIds.has(id))) seen.push(`orderPool zone2 ${act} ${kind}`);
  look(`zone2 ${act} ${kind}`, R.zone2Session({ activity: act, kind, week: 9, byId: ALL })); ran++;
}
for (const q of Object.keys(R.SNACK_POOLS)) for (const seated of [false, true]) { look(`snack ${q}`, R.snackSession({ quality: q, seated, byId: ALL })); ran++; }
for (const place of ["home", "gym"]) for (const week of [1, 5, 9]) { look(`hilit ${place} ${week}`, R.hilitSession({ week, place, byId: ALL })); ran++; }
for (const full of [false, true]) for (const half of [0, 1]) { look(`hybrid ${half} ${full}`, R.hybridSession({ week: full ? 11 : 1, half, full, byId: ALL })); ran++; }
for (const floor of [true, false]) { look(`reformer ${floor}`, R.reformerSession({ week: 5, floor, byId: ALL })); ran++; }
look("dynamic", R.dynamicSession({ byId: ALL })); ran++;
for (const main of R.MAIN_ACTIVITIES.map(m => m.id)) for (const o of R.crossOptions({ main, byId: ALL })) { look(`cross ${main}`, o); ran++; }
ok("5a. orderPool drops every held id, even listed first", !seen.some(s => s.startsWith("orderPool")), seen.filter(s => s.startsWith("orderPool")).join(", "));
ok(`5b. no recipe offers a held movement (${ran} proposals, every format, both places, early and late weeks)`, ran >= 40 && !seen.length, seen.join(", "));

console.log("\nTEST 6 - drawn");
ok("6a. each has a figure", H.every(e => FG.hasFigure(e.id)), H.filter(e => !FG.hasFigure(e.id)).map(e => e.id));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
