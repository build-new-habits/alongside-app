/**
 * tools/verify-path-tags.mjs
 * 28 Oct 2026 v2
 *
 * v2 - STAGE PATH content session (P-9, P-9d). Move to feel better content
 *   v3: 21 programmes, at least four ready-made per feeling (blueprint v3
 *   floor; 4a no longer counts the classes offered alongside). The Stretch
 *   routines (stretch draft v2, approved 28 Oct): TEST 9, fifteen routines,
 *   every movement real and behind the Stretch door, minutes adding up,
 *   every area with all three styles, one of ten minutes or less and one
 *   without the floor, and four or more per area. L4's three new Pilates
 *   movements join the new movements (23).
 *
 * v1 -
 * STAGE PATH Session 2 (P-2 TAG-LIBRARY, P-9 / P-9a CONTENT). Blueprint
 * Part C5 and Part F row 2; content as approved by Graeme, 28 Oct
 * (Product/alongside_content_feel-better-programmes_28oct2026_v2.md:
 * "Great. These look great").
 *
 *  1. Every library entry carries doors, feelings and style, with allowed
 *     values only.
 *  2. The tags agree with what the entry already says (file, pattern,
 *     category); an entry with no door has one of the allowed reasons.
 *  3. Every door and place reaches at least three movements.
 *  4. Every feeling reaches at least three choices, in at least two
 *     styles, one of them ten minutes or less.
 *  5. Every programme is sound: each id is a real movement tagged for this
 *     door and feeling, the minutes add up, nothing holds or forces the
 *     breath, standing programmes name a wall or chair, options are worded
 *     as options, and no line claims to treat anything.
 *  6. The twenty new movements meet the exercise entry standard, carry the
 *     tai chi and qigong safety line, and are kept out of the library the
 *     session builder and Free read (Free is left exactly as it is).
 *  8. P-9b LIBRARY ACCURACY (Graeme, 28 Oct: "why should this change if
 *     the claims are true? If they are not, then change them."): the five
 *     corrections approved in content v2 §5 read as approved, and none of
 *     the inaccurate claims the accuracy pass corrected is left in any
 *     card's why or coaching. Each correction and its source:
 *     BNH-Files Product/alongside_library_accuracy_28oct2026_v1.md.
 *  7. The real exercise card draws each new movement: its figure, its
 *     steps and its why. (Find a video on YouTube on every card is P-9c,
 *     Session 5, with the screens.)
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; dom.window.HTMLElement.prototype.scrollIntoView = () => {};

const B = new URL("../js/", import.meta.url).href;
await import(B + "store.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { exerciseIsAvailable } = await import(B + "data/equipment-map.js");
const { FIGURES } = await import(B + "data/figures/index.js");
const CARD = await import(B + "exercise-card.js");
let PATH_MOVEMENTS = [], FP = {}, SR = {};
try { ({ PATH_MOVEMENTS } = await import(B + "data/exercises/path_movements.js")); } catch (e) { console.log("  (path_movements.js did not load: " + e.message + ")"); }
try { FP = await import(B + "data/feel-programmes.js"); } catch (e) { console.log("  (feel-programmes.js did not load: " + e.message + ")"); }
try { SR = await import(B + "data/stretch-routines.js"); } catch (e) { console.log("  (stretch-routines.js did not load: " + e.message + ")"); }
const { CLASSES = [] } = await import(B + "data/classes/index.js").catch(() => ({}));

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 700)}`); }
};
const DOORS = ["stronger", "moving", "stretch", "feel"];
const FEELINGS = ["ground", "calm", "worn", "wake", "sleep"];
const STYLES = ["exercise", "stretch", "yoga", "pilates", "taichi", "qigong", "gentle"];
const ALL = [...EXERCISES, ...(PATH_MOVEMENTS || [])];
const byId = new Map(ALL.map(e => [e.id, e]));
const NEW_IDS = ["tc-opening-stance", "tc-weight-shift", "tc-wave-hands-clouds", "tc-brush-knee", "tc-push-forward", "tc-closing",
  "qg-tapping", "qg-hold-up-sky", "qg-draw-bow", "qg-separate-heaven-earth", "qg-look-back", "qg-heel-drops", "qg-pressing-earth",
  "qg-gathering-in", "qg-closing-breath", "yoga-mountain-pose", "gm-gentle-sway", "gm-reach-and-rise", "gm-knees-hug", "yoga-reclined-butterfly",
  "pilates-saw", "pilates-side-lying-quad", "pilates-thigh-stretch"];

console.log("\nTEST 0 - positive control: the libraries loaded");
ok("0a. the library is the size it is", EXERCISES.length >= 580, EXERCISES.length);
ok("0b. the twenty-three new movements loaded", (PATH_MOVEMENTS || []).length === 23, (PATH_MOVEMENTS || []).length);
ok("0c. the programmes loaded", Array.isArray(FP.PROGRAMMES) && FP.PROGRAMMES.length === 21, FP.PROGRAMMES && FP.PROGRAMMES.length);

console.log("\nTEST 1 - every entry carries doors, feelings and style");
const untagged = ALL.filter(e => !Array.isArray(e.doors) || !Array.isArray(e.feelings) || typeof e.style !== "string");
ok(`1a. all ${ALL.length} entries carry the three tags`, untagged.length === 0, untagged.slice(0, 15).map(e => e.id).join(", "));
const badVal = ALL.filter(e => (e.doors || []).some(d => !DOORS.includes(d)) || (e.feelings || []).some(f => !FEELINGS.includes(f)) || (e.style && !STYLES.includes(e.style)));
ok("1b. only allowed values", badVal.length === 0, badVal.slice(0, 15).map(e => `${e.id}:${e.doors}/${e.feelings}/${e.style}`).join(", "));
const dupes = ALL.filter(e => new Set(e.doors || []).size !== (e.doors || []).length || new Set(e.feelings || []).size !== (e.feelings || []).length);
ok("1c. no value twice", dupes.length === 0, dupes.map(e => e.id).join(", "));

console.log("\nTEST 2 - the tags agree with what the entry already says");
const isYogaPattern = e => /^yoga-/.test(e.movementPattern || "");
const wrongYoga = EXERCISES.filter(e => isYogaPattern(e) && e.style !== "yoga");
ok("2a. a yoga pose or flow is style yoga", wrongYoga.length === 0, wrongYoga.map(e => e.id).join(", "));
const wrongPil = EXERCISES.filter(e => /^pilates-/.test(e.movementPattern || "") && e.style !== "pilates");
ok("2b. a Pilates move or sequence is style pilates", wrongPil.length === 0, wrongPil.map(e => e.id).join(", "));
const feelNoDoor = ALL.filter(e => (e.feelings || []).length && !(e.doors || []).includes("feel"));
ok("2c. a feeling only on an entry Move to feel better can use", feelNoDoor.length === 0, feelNoDoor.map(e => e.id).join(", "));
const NOT_MOVEMENT = /^(breath|breath-awareness|body-scan|visualisation|grounding)$/;
const doorless = EXERCISES.filter(e => !(e.doors || []).length);
const badDoorless = doorless.filter(e => !((e.category === "rehabilitation" && !e.generalPurpose) || NOT_MOVEMENT.test(e.movementPattern || "")));
ok("2d. no door only for condition-only rehabilitation or a still practice (breath, body scan, visualising, grounding)", badDoorless.length === 0,
   badDoorless.map(e => `${e.id} (${e.category}/${e.movementPattern})`).join(", "));
const condOnlyWithDoor = EXERCISES.filter(e => e.category === "rehabilitation" && !e.generalPurpose && (e.doors || []).length);
ok("2e. condition-only rehabilitation is behind no door (it reaches people through their sore areas and My exercises)", condOnlyWithDoor.length === 0, condOnlyWithDoor.map(e => e.id).join(", "));
const strengthNoStronger = EXERCISES.filter(e => e.category === "strength" && !(e.doors || []).includes("stronger"));
ok("2f. every strength entry is behind Get stronger", strengthNoStronger.length === 0, strengthNoStronger.map(e => e.id).join(", "));
const cardioNoMoving = EXERCISES.filter(e => e.category === "cardio" && !(e.doors || []).includes("moving"));
ok("2g. every cardio entry is behind Keep moving", cardioNoMoving.length === 0, cardioNoMoving.map(e => e.id).join(", "));
const stretchStyle = EXERCISES.filter(e => e.style === "stretch" && !(e.doors || []).includes("stretch") && !(e.category === "rehabilitation" && !e.generalPurpose));
ok("2h. a stretch-style entry is behind Stretch (condition-only rehabilitation aside, 2e)", stretchStyle.length === 0, stretchStyle.map(e => e.id).join(", "));

console.log("\nTEST 3 - every door and place reaches at least three movements");
const HOME = []; // the least a person can have at home: nothing at all
const GYM = ["dumbbell", "barbell", "kettlebell", "cable-machine", "bench", "resistance-band", "machine", "pull-up-bar", "cardio-machine", "medicine-ball", "box", "rower", "treadmill", "bike", "cross-trainer", "loop-band"];
for (const door of ["stronger", "moving"]) {
  const pool = EXERCISES.filter(e => (e.doors || []).includes(door));
  const home = pool.filter(e => (e.equipment || []).length === 0).length;
  const gym = pool.filter(e => { try { return exerciseIsAvailable(e, GYM); } catch { return (e.equipment || []).length > 0; } }).length;
  ok(`3a. ${door}: at home with no kit (${home})`, home >= 3);
  ok(`3b. ${door}: at the gym (${gym})`, gym >= 3);
}
for (const door of ["stretch", "feel"]) {
  const n = ALL.filter(e => (e.doors || []).includes(door)).length;
  ok(`3c. ${door} (${n}, no place asked)`, n >= 3);
}

console.log("\nTEST 4 - every feeling reaches at least three choices");
const progs = FP.PROGRAMMES || [];
for (const f of FEELINGS) {
  const mine = progs.filter(p => p.feeling === f);
  const also = (FP.ALSO_OFFERED || {})[f] || [];
  ok(`4a. ${f}: ${mine.length} ready-made programmes, four or more (P-9d floor)`, mine.length >= 4);
  ok(`4b. ${f}: at least two styles`, new Set(mine.map(p => p.style)).size >= 2, [...new Set(mine.map(p => p.style))].join(", "));
  ok(`4c. ${f}: one of ten minutes or less`, mine.some(p => p.minutes <= 10), mine.map(p => p.minutes).join(", "));
}
ok("4d. the feelings are described, each with an icon", FEELINGS.every(f => FP.FEELINGS?.[f]?.label && FP.FEELINGS[f].line && FP.FEELINGS[f].icon));
ok("4e. Worn out says when to see a GP", /GP/.test(FP.FEELINGS?.worn?.before || ""), FP.FEELINGS?.worn?.before);
ok("4f. Ready for sleep says when to do it", /bedtime/.test(FP.FEELINGS?.sleep?.before || ""), FP.FEELINGS?.sleep?.before);
ok("4g. Wake up is the name, with feeling energised in its line", FP.FEELINGS?.wake?.label === "Wake up" && /energised/.test(FP.FEELINGS?.wake?.line || ""));

console.log("\nTEST 5 - every programme is sound");
const classIds = new Set(CLASSES.map(c => c.id));
const HOLDS = ["energising-breath", "alternate-nostril-breathing", "box-breathing", "box-breathing-extended", "four-seven-eight-breathing", "cold-shower-protocol", "contrast-therapy", "sauna-protocol", "napping-protocol"];
const RANKING = /\b(easy|easier|hard|harder|beginner|advanced|intermediate|modified|regression|progression|basic|proper)\b/i;
const TREAT = /\b(treat|treats|treatment|cure|cures|heal|heals|therapy|anxiety|depression|insomnia|disorder|symptom)/i;
const expected = { g1: 10, g2: 12, g3: 15, g4: 6, c1: 10, c2: 15, c3: 20, c4: 10, w1: 6, w2: 8, w3: 5, w4: 6, k1: 8, k2: 10, k3: 12, k4: 10, k5: 20, s1: 10, s2: 12, s3: 10, s4: 6 };
ok("5a. the twenty-one programmes, by id", Object.keys(expected).every(id => progs.some(p => p.id === id)), progs.map(p => p.id).join(","));
for (const p of progs) {
  const steps = p.steps || [];
  const missing = steps.filter(s => !byId.has(s.id)).map(s => s.id);
  const sum = Math.round(steps.reduce((a, s) => a + s.mins, 0) * 10) / 10;
  const untaggedSteps = steps.filter(s => byId.has(s.id) && !((byId.get(s.id).doors || []).includes("feel") && (byId.get(s.id).feelings || []).includes(p.feeling))).map(s => s.id);
  const holds = steps.filter(s => HOLDS.includes(s.id)).map(s => s.id);
  const words = [p.name, p.line, ...(p.easeOff || []), ...(p.further || []), ...steps.map(s => s.note || "")].join(" ");
  ok(`5b. ${p.id} ${p.name}: every movement is real`, missing.length === 0, missing.join(", "));
  ok(`5c. ${p.id}: minutes add up to ${p.minutes}`, sum === p.minutes && p.minutes === expected[p.id], `${sum} vs ${p.minutes}`);
  ok(`5d. ${p.id}: every movement is tagged feel and ${p.feeling}`, untaggedSteps.length === 0, untaggedSteps.join(", "));
  ok(`5e. ${p.id}: nothing holds or forces the breath`, holds.length === 0, holds.join(", "));
  ok(`5f. ${p.id}: tagged for its door, a feeling and an allowed style`, FEELINGS.includes(p.feeling) && STYLES.includes(p.style) && p.door === "feel");
  ok(`5g. ${p.id}: options read as options (If / When, no ranking words)`,
     (p.easeOff || []).every(t => /^If\b/.test(t)) && (p.further || []).every(t => /^When\b/.test(t)) && !RANKING.test([...(p.easeOff || []), ...(p.further || [])].join(" ")),
     JSON.stringify([p.easeOff, p.further]));
  ok(`5h. ${p.id}: says nothing about treating anything`, !TREAT.test(words), (words.match(TREAT) || [])[0]);
  if (p.position === "standing") ok(`5i. ${p.id}: standing, so a wall or chair is named`, /\b(wall|chair)\b/i.test(p.support || ""), p.support);
  ok(`5j. ${p.id}: says whether there is a seated route`, typeof p.seatedRoute === "boolean");
}
const alsoBad = Object.values(FP.ALSO_OFFERED || {}).flat().filter(id => !classIds.has(id) && !byId.has(id));
ok("5k. every also-offered class and flow is real", alsoBad.length === 0, alsoBad.join(", "));
ok("5l. Worn out programmes can all be done seated or lying", progs.filter(p => p.feeling === "worn").every(p => p.position !== "standing"));
ok("5m. Worn out offers no going further (it is meant to stay easy)", progs.filter(p => p.feeling === "worn").every(p => !(p.further || []).length));

console.log("\nTEST 6 - the twenty new movements, to the entry standard, kept out of Free");
ok("6a. the twenty-three, by id", NEW_IDS.every(id => (PATH_MOVEMENTS || []).some(e => e.id === id)), NEW_IDS.filter(id => !(PATH_MOVEMENTS || []).some(e => e.id === id)).join(", "));
const SAFE = "Move slowly and only as far as is comfortable. If something hurts, ease off or sit down.";
for (const e of PATH_MOVEMENTS || []) {
  const probs = [];
  if (!Array.isArray(e.instructions) || e.instructions.length < 3 || e.instructions.length > 6) probs.push("instructions 3-6");
  for (const f of ["name", "why", "coaching", "youtube", "category", "position"]) if (typeof e[f] !== "string" || !e[f].trim()) probs.push(f);
  if (!Array.isArray(e.watchOut) || e.watchOut.length < 2 || e.watchOut.length > 4) probs.push("watchOut 2-4");
  if (!Array.isArray(e.equipment) || e.equipment.length) probs.push("equipment []");
  if (!Array.isArray(e.contraindications)) probs.push("contraindications");
  if (!(e.energyRequired >= 1 && e.energyRequired <= 10) || !(e.difficultyLevel >= 1 && e.difficultyLevel <= 10)) probs.push("energy/difficulty");
  if (e.impact !== false) probs.push("impact false");
  if (!Array.isArray(e.affectsAreas) || !e.affectsAreas.length) probs.push("affectsAreas");
  const a = e.adaptations || {};
  if (!(a.easeOff || []).length) probs.push("an ease-off option");
  if ((a.easeOff || []).some(t => !/^If\b/.test(t)) || (a.further || []).some(t => !/^When\b/.test(t))) probs.push("If/When");
  if (RANKING.test([...(a.easeOff || []), ...(a.further || [])].join(" "))) probs.push("ranking word");
  if (/\b(best|essential)\b/i.test(e.why)) probs.push("superlative");
  if (TREAT.test([e.why, e.coaching].join(" "))) probs.push("treatment word");
  if (/^(tc|qg)-/.test(e.id) && !(e.watchOut || []).includes(SAFE)) probs.push("tai chi / qigong safety line");
  if (!(e.doors || []).includes("feel")) probs.push("feel door");
  if (!FIGURES[e.id]) probs.push("figure");
  if (/hold (your|the) breath/i.test(e.instructions?.join(" ") || "") && !/never hold|no need to hold|not hold/i.test(e.instructions.join(" "))) probs.push("breath hold");
  ok(`6b. ${e.id}: ${probs.length ? probs.join("; ") : "meets the standard"}`, probs.length === 0);
}
const leaked = NEW_IDS.filter(id => EXERCISES.some(e => e.id === id));
ok("6c. none is in the library the session builder and Free read", leaked.length === 0, leaked.join(", "));
const ids = new Set(ALL.map(e => e.id));
ok("6d. no id is used twice across both", ids.size === ALL.length);

console.log("\nTEST 7 - the real exercise card draws each new movement");
const frag = html => { const d = document.createElement("div"); d.innerHTML = html; return d; };
for (const e of PATH_MOVEMENTS || []) {
  const how = frag(CARD.renderExerciseCard(e, { layout: "steps", step: "how" }));
  const doPage = frag(CARD.renderExerciseCard(e, { page: "do" }));
  const text = (doPage.textContent || "") + (how.textContent || "");
  const why = frag(CARD.renderExerciseCard(e, { layout: "steps", step: "why" }));
  ok(`7. ${e.id}: the card draws its figure, its first step and its why`,
     !!how.querySelector(".xfig svg") && text.includes(e.instructions[0]) && (why.textContent || "").includes(e.why.slice(0, 40)),
     `fig ${!!how.querySelector(".xfig svg")}, step ${text.includes(e.instructions[0])}, why ${(why.textContent || "").includes(e.why.slice(0, 40))}`);
}

console.log("\nTEST 8 - library accuracy (P-9b)");
const card = id => byId.get(id) || {};
const APPROVED = {
  "belly-breathing": ["why", "Slow breathing from the belly can help you feel calmer. In a small study, eight weeks of regular practice lowered levels of the stress hormone cortisol."],
  "coherent-breathing": ["why", "At about six breaths a minute, your heart rate rises and falls in step with your breath and its natural variation is at its largest. Many people find this pace calming."],
  "yoga-legs-up-wall": ["why", "Raising the legs helps fluid drain back from them, and many people find it one of the most restful positions there is."],
  "yoga-corpse-pose": ["why", "A few minutes of stillness at the end gives your breathing and heart rate time to settle after moving. Many people find it the most restful part."],
  "thread-the-needle": ["coaching", "Go only as far as is comfortable today. Let the floor take the weight."],
};
for (const [id, [f, words]] of Object.entries(APPROVED)) ok(`8a. ${id} ${f} reads as approved on 28 Oct`, card(id)[f] === words, card(id)[f]);
ok("8b. coherent breathing's coaching as approved", card("coherent-breathing").coaching === "It takes a few minutes to settle into. If counting feels like effort, let the out-breath be a little longer than the in-breath.", card("coherent-breathing").coaching);
const RETIRED = [/increases oxygen/i, /oxygen efficiency/i, /greatest calming effect/i, /gold.standard/i, /\bthe most effective\b/i, /fastest known way/i,
  /causes back injury/i, /harmful crunch/i, /\bVMO\b/, /flushes the sciatic/i, /inflammation and adhesions/i, /26 minutes as optimal/i, /by up to 20%/i,
  /70% of the benefit/i, /60% of the work/i, /the only exercise that/i, /the only machine/i, /standing starts are where hamstring/i, /calms the nervous system/i,
  /fully downregulate/i, /most common yoga mistake/i, /clears metabolic waste/i, /removes metabolic waste/i, /flushes metabolic waste/i, /Pulling causes injury/i,
  /protects your knees and lower back in every movement/i, /directly addresses the source of the pain/i, /primary cause of shin splints/i, /sciatic (nerve )?tension/i,
  /reverses the effects of gravity/i, /each exhale can take you a little further/i, /\bthe single (most|highest)/i, /better than any/i, /more effective than any/i];
const bad = [];
for (const e of ALL) for (const f of ["why", "coaching"]) for (const re of RETIRED) if (re.test(String(e[f] || ""))) bad.push(`${e.id}.${f} ~ ${re}`);
ok(`8c. none of the ${RETIRED.length} corrected claims is left in any why or coaching`, bad.length === 0, bad.join("; "));
const notes = [];
for (const e of ALL) for (const f of ["why", "coaching"]) if (/\b(in the library|every existing|this file)\b/i.test(String(e[f] || ""))) notes.push(`${e.id}.${f}`);
ok("8d. no card speaks to the library's authors (stretch draft v2 §4)", notes.length === 0, notes.join(", "));
const STRETCH_OK = { "seated-spinal-decompression": "A gentle lengthening through the back, done sitting. A calm way to finish.",
  "pigeon-pose": "A deep stretch for the back of the hip, including the piriformis, an area many people who sit a lot feel as tight." };
for (const [id, w] of Object.entries(STRETCH_OK)) ok(`8e. ${id} why reads as approved with the Stretch routines`, card(id).why === w, card(id).why);

console.log("\nTEST 9 - the Stretch routines (stretch draft v2, approved 28 Oct)");
const routines = SR.ROUTINES || [];
const AREAS = ["whole", "neck-shoulders", "back-hips", "legs"];
const rExpected = { wb1: 10, wb2: 20, wb3: 15, wb4: 30, ns1: 10, ns2: 12, ns3: 12, ns4: 8, bh1: 10, bh2: 15, bh3: 12, bh4: 8, l1: 12, l2: 15, l3: 8, l4: 12 };
ok("9a. the sixteen routines, by id (NS4 waiting for Graeme)", Object.keys(rExpected).every(id => routines.some(r => r.id === id)), routines.map(r => r.id).join(","));
for (const r of routines) {
  const steps = r.steps || [];
  const missing = steps.filter(s => !byId.has(s.id)).map(s => s.id);
  const notStretch = steps.filter(s => byId.has(s.id) && !(byId.get(s.id).doors || []).includes("stretch")).map(s => s.id);
  const sum = Math.round(steps.reduce((a, s) => a + s.mins, 0) * 10) / 10;
  ok(`9b. ${r.id} ${r.name}: every movement is real and behind the Stretch door`, !missing.length && !notStretch.length, [...missing, ...notStretch].join(", "));
  ok(`9c. ${r.id}: minutes add up to ${r.minutes}`, sum === r.minutes && r.minutes === rExpected[r.id], `${sum} vs ${r.minutes}`);
  ok(`9d. ${r.id}: an area, a style and the floor said`, AREAS.includes(r.area) && ["stretch", "yoga", "pilates"].includes(r.style) && typeof r.floor === "boolean" && r.door === "stretch");
  ok(`9e. ${r.id}: options read as options`, (r.easeOff || []).every(x => /^If\b/.test(x)) && (r.further || []).every(x => /^When\b/.test(x)) && !RANKING.test([...(r.easeOff || []), ...(r.further || [])].join(" ")), JSON.stringify([r.easeOff, r.further]));
  const swapBad = Object.entries(r.withoutFloor || {}).filter(([, v]) => !(v || []).every(s => byId.has(s.id) && ["standing", "seated", "any"].includes(byId.get(s.id).position)));
  ok(`9f. ${r.id}: a without-the-floor swap uses only standing or seated movements`, swapBad.length === 0);
  ok(`9g. ${r.id}: no sore area sets it (W5-14)`, !("soreArea" in r) && !("forSore" in r));
}
for (const a of AREAS) {
  const mine = routines.filter(r => r.area === a);
  const styles = new Set(mine.map(r => r.style));
  ok(`9h. ${a}: all three styles`, styles.size === 3, [...styles].join(", "));
  ok(`9i. ${a}: one of ten minutes or less`, mine.some(r => r.minutes <= 10), mine.map(r => r.minutes).join(", "));
  ok(`9j. ${a}: one without getting down to the floor`, mine.some(r => r.floor === false || r.withoutFloor), mine.map(r => r.id).join(", "));
  ok(`9k. ${a}: four or more ready-made (P-9d floor)`, mine.length >= 4, `${mine.length}`);
}

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
