/**
 * tools/verify-p28-schema.mjs
 * 06 Nov 2026 v2
 *
 * v2 - P-28 FINISH (store.js v123, Schema v1.124; Graeme, 06 Nov: "Delete
 *   them"). 2b now proves the old room's four fields leave the phone on
 *   load (it proved they were kept until S3). 2f, 2g: the saved copy loses them
 *   too, and the programme saved beside them survives.
 *
 * P-28 EMPATHY-THREAD, S1 SCHEMA (store.js v122, Schema v1.123). Graeme,
 * 05 Nov: In Step becomes a programme, the coach's voice can be heard, and
 * an outdoor session can be taken as Just go, Guide me or Take three.
 *
 *   1  Defaults: inStepProgress.programme, coachVoice 'off'.
 *   2  An older phone (no programme, no coachVoice) loads the defaults, and
 *      keeps the old In Step fields untouched.
 *   3  The programme loads only the shape it may hold, field by field.
 *   4  coachVoice is 'on' or 'off', nothing else.
 *   5  activityLog[].guideMe: one of its three words, or removed (never
 *      nulled); an entry without it gains no key.
 *   6  What is saved survives a reload (store -> localStorage -> store).
 *
 * Red on alongside-v704 (no programme, no coachVoice, guideMe untouched).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
dom.window.scrollTo = () => {}; dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history; globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const J = v => JSON.stringify(v);
const saved = () => JSON.parse(localStorage.getItem(store.STORAGE_KEY));
function load(s) { localStorage.clear(); localStorage.setItem(store.STORAGE_KEY, JSON.stringify(s)); store.init(); }
const DEF = { part: 1, episode: 1, done: [], lastCarry: null, lastAnswer: null, offeredAt: null, offeredSession: 0 };

console.log("\nTEST 0 - positive control");
load({ onboardingComplete: true, name: "Sentinel-28" });
ok("0a. the fixture reached the store", store.get("name") === "Sentinel-28", store.get("name"));

console.log("\nTEST 1 - defaults");
const d = store.getDefaults();
ok("1a. inStepProgress.programme defaults to part 1, episode 1, nothing done", J(d.inStepProgress?.programme) === J(DEF), J(d.inStepProgress?.programme));
ok("1b. coachVoice defaults to 'off'", d.coachVoice === "off", J(d.coachVoice));

console.log("\nTEST 2 - an older phone");
const oldIsp = { unlockedAt: { solo: "2026-10-01T09:00:00.000Z" }, scenarioIndex: { solo: 2 }, completedCount: { solo: 3 }, choiceLog: [{ movementId: "solo", scenarioId: "solo-1", optionId: "a", tag: "accept", at: "2026-10-01T09:00:00.000Z" }] };
load({ onboardingComplete: true, inStepProgress: oldIsp });
const isp = store.get("inStepProgress");
ok("2a. gains the programme's default", J(isp.programme) === J(DEF), J(isp.programme));
ok("2b. the old room's four fields are gone (v123: retired)", ["unlockedAt", "scenarioIndex", "completedCount", "choiceLog"].every(k => !(k in isp)) && J(Object.keys(isp)) === J(["programme"]), J(Object.keys(isp)));
store.set("name", "x");   // any write saves the whole store
ok("2f. and gone from what is saved, with nothing else of In Step kept", J(Object.keys(saved().inStepProgress)) === J(["programme"]), J(saved().inStepProgress));
load({ onboardingComplete: true, inStepProgress: { ...oldIsp, programme: { part: 2, episode: 4, done: ["p1e1"], lastCarry: "p1e1", lastAnswer: "did", offeredAt: null, offeredSession: 5 } } });
ok("2g. a programme saved beside the old fields survives", store.get("inStepProgress").programme.part === 2 && store.get("inStepProgress").programme.episode === 4 && !("choiceLog" in store.get("inStepProgress")));
ok("2c. coachVoice loads as 'off'", store.get("coachVoice") === "off", J(store.get("coachVoice")));
load({ onboardingComplete: true });
ok("2d. a phone that never opened In Step gets the default too", J(store.get("inStepProgress").programme) === J(DEF));

console.log("\nTEST 3 - the programme loads only the shape it may hold");
const good = { part: 3, episode: 4, done: ["p1e1", "p1e2", "p2e6"], lastCarry: "p3e3", lastAnswer: "not-yet", offeredAt: "2026-11-05T18:00:00.000Z", offeredSession: 41 };
load({ inStepProgress: { programme: good } });
ok("3a. a good record loads exactly", J(store.get("inStepProgress").programme) === J(good), J(store.get("inStepProgress").programme));
load({ inStepProgress: { programme: { part: 7, episode: 0, done: ["p1e1", "p1e1", "p5e1", "x", 3, "p2e7"], lastCarry: "p9e9", lastAnswer: "maybe", offeredAt: "not a date", offeredSession: -2 } } });
const bad = store.get("inStepProgress").programme;
ok("3b. part out of range falls back to 1", bad.part === 1, J(bad));
ok("3c. episode out of range falls back to 1", bad.episode === 1);
ok("3d. done keeps only real episode ids, each once", J(bad.done) === J(["p1e1"]), J(bad.done));
ok("3e. a lastCarry that is not an episode is null", bad.lastCarry === null);
ok("3f. lastAnswer is one of did / not-yet / didnt, or null", bad.lastAnswer === null);
ok("3g. offeredAt that is not a date is null", bad.offeredAt === null);
ok("3h. offeredSession below zero is 0", bad.offeredSession === 0);
load({ inStepProgress: { programme: "rubbish" } });
ok("3i. a programme that is not an object is the default", J(store.get("inStepProgress").programme) === J(DEF));
load({ inStepProgress: { programme: { lastAnswer: "didnt", part: 2 } } });
ok("3j. each field falls back on its own (a good field is kept)", store.get("inStepProgress").programme.lastAnswer === "didnt" && store.get("inStepProgress").programme.part === 2 && store.get("inStepProgress").programme.episode === 1);

console.log("\nTEST 4 - coachVoice");
load({ coachVoice: "on" });
ok("4a. 'on' loads as 'on'", store.get("coachVoice") === "on");
for (const v of ["loud", true, 1, null]) { load({ coachVoice: v }); ok(`4b. ${J(v)} loads as 'off'`, store.get("coachVoice") === "off", J(store.get("coachVoice"))); }

console.log("\nTEST 5 - activityLog[].guideMe");
load({ activityLog: [
  { id: "a1", type: "walk", completedAt: "2026-11-01T09:00:00.000Z", guideMe: "guide" },
  { id: "a2", type: "run", completedAt: "2026-11-02T09:00:00.000Z", guideMe: "three" },
  { id: "a3", type: "walk", completedAt: "2026-11-03T09:00:00.000Z", guideMe: "just" },
  { id: "a4", type: "walk", completedAt: "2026-11-04T09:00:00.000Z", guideMe: "shout" },
  { id: "a5", type: "walk", completedAt: "2026-11-05T09:00:00.000Z" },
] });
const log = store.get("activityLog");
const by = id => log.find(e => e.id === id);
ok("5a. guide, three and just are kept", by("a1").guideMe === "guide" && by("a2").guideMe === "three" && by("a3").guideMe === "just", J(log.map(e => e.guideMe)));
ok("5b. anything else is removed, not nulled", !("guideMe" in by("a4")), J(by("a4")));
ok("5c. an entry without it gains no key", !("guideMe" in by("a5")), J(by("a5")));
ok("5d. nothing else on the entries changed", by("a4").type === "walk" && by("a4").completedAt === "2026-11-04T09:00:00.000Z" && log.length === 5);

console.log("\nTEST 6 - what is saved survives a reload");
load({ onboardingComplete: true });
store.set("inStepProgress.programme", { ...good });
store.set("coachVoice", "on");
const s = saved();
ok("6a. the programme reaches localStorage", J(s.inStepProgress?.programme) === J(good), J(s.inStepProgress?.programme));
ok("6b. coachVoice reaches localStorage", s.coachVoice === "on");
store.init();
ok("6c. and both load back as they were", J(store.get("inStepProgress").programme) === J(good) && store.get("coachVoice") === "on");

console.log(`\nVERIFY-P28-SCHEMA: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
