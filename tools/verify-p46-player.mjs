/**
 * tools/verify-p46-player.mjs
 * 24 Nov 2026 v1
 *
 * P-46 FREE-AND-FIRST, S5 PLAYER (spec
 * docs/specs/alongside_free-and-first_24nov2026_v1.md, section 6). The real
 * router and the real player (workout.js), on both tiers.
 *
 *   0  Controls: a 12-move session reaches the player on each tier.
 *   1  One screen per move: the name, the dose, the card's one screen
 *      (figure, one cue line), More about this move folded (Why, Watch out,
 *      How); no steps, no "I know this one".
 *   2  Swap, Do this one later and What's left, on Free as on the Plan.
 *   3  A 12-move session in about 25 taps (76 in the Wave 7 trace).
 *   4  Kept: the sore-area line unfolded above the cue; the first-move
 *      safety note; the halfway check; each tier's own finish.
 *
 * Red on alongside-v741.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;
dom.window.alert = () => {}; globalThis.alert = () => {};

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const gate = await import(B + "safety-gate.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const RF = await import(B + "data/red-flag.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s), $$ = s => [...main.querySelectorAll(s)];
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const onView = () => router.currentView;
async function go(view) { await router.navigate(view); await wait(40); }

// Twelve real entries, each with why, watch out, how and cues: reps and sets.
const TWELVE = EXERCISES.filter(e => e.instructions?.length && e.why && e.watchOut?.length && Array.isArray(e.cues) && e.cues.length)
  .slice(0, 12).map((e, i) => ({ ...e, section: i < 2 ? "warmup" : "main", sets: 3, reps: "10", rest: 45, duration: null }));

function fixture(tier, { sore = null, ack = true } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("equipment", ["dumbbells", "bench"]); store.set("homeEquipment", ["dumbbells", "bench"]);
  store.set("conditions", sore ? Object.keys(sore) : []); store.set("conditionPainScores", sore || {});
  if (sore) store.set("redFlag", { screenedAt: new Date().toISOString(), areas: Object.keys(sore), textVersion: RF.RED_FLAG_VERSION, level: null, flaggedAt: null, clearedAt: null });
  if (ack) for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  if (!ack) store.set("safetyAckLog", []);
  store.set("generatedSession", { session: { id: "p46-12", title: "Twelve", exercises: TWELVE.map(e => ({ ...e })), door: "stronger" }, builtAt: new Date().toISOString(), inputs: {} });
  store.set("usingGeneratedSession", true);
  router.history = ["today"]; router.currentView = "today";
}
const ackGate = () => { const b = $("[data-gate-ack], #gate-ack, #safety-gate-ack"); if (b) { if (b.type === "checkbox") { b.checked = true; b.dispatchEvent(new dom.window.Event("change", { bubbles: true })); } click(b); } const s = $("#gate-start, [data-gate-start]"); if (s) click(s); };

console.log("\nTEST 0 - controls");
for (const tier of ["free", "personal"]) {
  fixture(tier); await go("workout");
  ok(`0-${tier}. twelve moves reach the player, move 1 of 12`, onView() === "workout" && /1 of 12/.test(txt($(".workout-progress-info"))) && TWELVE.length === 12, `${onView()} ${txt(main).slice(0, 80)}`);
}

console.log("\nTEST 1 - one screen per move");
for (const tier of ["free", "personal"]) {
  fixture(tier); await go("workout");
  const e = TWELVE[0];
  ok(`1a-${tier}. the name and the dose (3 × 10, rest)`, txt($("h1#wo-exercise-name")) === e.name && /3 × 10/.test(txt($(".wo-target"))) && /45s rest/.test(txt($(".wo-target"))));
  ok(`1b-${tier}. the card's one screen, with one cue line (the entry's first)`, !!$(".exercise-card--one") && txt($(".exercise-card--one .xcard-lead-cue")) === e.cues[0]);
  const more = $("details.xcard-more");
  ok(`1c-${tier}. More about this move, folded: Why, Watch out, How`, !!more && !more.open && txt(more.querySelector("summary")) === "More about this move"
     && /Why/.test(txt(more)) && /Watch out/.test(txt(more)) && /How/.test(txt(more)) && more.textContent.includes(e.why.slice(0, 20)));
  ok(`1d-${tier}. no steps strip, no Next: Why, no "I know this one"`, !$(".wo-steps") && !$("[data-step-go]") && !/I know this one/.test(txt(main)));
  ok(`1e-${tier}. the main button is Set 1 done, with Finish this one and Skip`, txt($("#wo-set-done-btn")) === "Set 1 done" && !!$("#wo-done-btn") && !!$("#skip-exercise-btn"));
}

console.log("\nTEST 2 - Swap, Do this one later, What's left, on both tiers");
for (const tier of ["free", "personal"]) {
  fixture(tier); await go("workout");
  ok(`2a-${tier}. the three are there`, !!$("#wo-swap-btn") && !!$("#wo-later-btn") && /What’s left \(11\)/.test(txt($("#wo-left-btn"))));
  click($("#wo-swap-btn")); await wait(30);
  ok(`2b-${tier}. Swap opens Instead of …, with a search and Keep`, !!$("#wo-swap-panel") && /Instead of/.test(txt($("#wo-swap-h"))) && !!$("#wo-swap-keep"));
  click($("#wo-swap-keep")); await wait(30);
  const first = TWELVE[0].name;
  click($("#wo-later-btn")); await wait(30);
  const list = store.get("generatedSession").session.exercises;
  ok(`2c-${tier}. Do this one later moves it to the end of its part`, list[0].name !== first && list.findIndex(x => x.name === first) === 1, list.slice(0, 3).map(x => x.name).join(", "));
  click($("#wo-left-btn")); await wait(30);
  ok(`2d-${tier}. What's left lists the rest, each with Do now`, /What’s left/.test(txt($("h1"))) && $$("[data-do-now]").length === 11);
  click($("[data-do-now]")); await wait(30);
  ok(`2e-${tier}. Do now plays that one now`, onView() === "workout" && !!$("h1#wo-exercise-name"));
}

console.log("\nTEST 3 - a twelve-move session in about 25 taps");
for (const tier of ["free", "personal"]) {
  fixture(tier); await go("workout");
  let taps = 0;
  const FIN = tier === "free" ? "reflect" : "plan-finish";
  for (let i = 0; i < 60 && onView() === "workout"; i++) {
    const b = $("#complete-exercise-btn") || $("#wo-done-btn");
    if (!b) break;
    click(b); taps++; await wait(15);
  }
  ok(`3-${tier}. finished on ${FIN} in ${taps} taps (at most 25; 76 in Wave 7)`, onView() === FIN && taps <= 25, `${taps} taps; on ${onView()}`);
}

console.log("\nTEST 4 - kept");
// The sore-area line: find a move the caution speaks to, with the lower back quite sore.
const { bodyCaution } = await import(B + "data/session-rationale.js");
fixture("free", { sore: { "lower-back": 6 } });
const at = TWELVE.findIndex(e => bodyCaution(e));
ok("4pc. a move in the twelve that works the sore lower back", at > -1);
if (at > -1) {
  const s = store.get("generatedSession"); const [m] = s.session.exercises.splice(at, 1); s.session.exercises.unshift(m); store.set("generatedSession", s);
  await go("workout");
  const c = $(".exercise-card--one .exercise-caution");
  ok("4a. the sore-area line is on screen, unfolded, above the cue", !!c && !c.closest("details") && (c.compareDocumentPosition($(".xcard-lead-cue")) & 4) === 4, `${onView()} | ${txt(main).slice(0, 200)}`);
}
fixture("free", { ack: false }); await go("workout");
ok("4b. the first-move safety note still comes first", gate.isGateDue() && !$("h1#wo-exercise-name") && /safe|hurt|ache/i.test(txt(main)), txt(main).slice(0, 120));
fixture("personal", { sore: { "lower-back": 6 } }); await go("workout");
for (let i = 0; i < 20 && onView() === "workout" && !$("#wo-half-ok"); i++) { click($("#complete-exercise-btn") || $("#wo-done-btn")); await wait(15); }
ok("4c. the halfway check, quite sore: A quick check: still okay?", !!$("#wo-half-ok") && /still okay/.test(txt($("h1"))));
const src = (await import("node:fs")).readFileSync(new URL("../js/views/workout.js", import.meta.url), "utf8");
ok("4d. the hold voice and each tier's finish are still the player's", /renderHoldVoice\("w" \+ currentExerciseIndex\)/.test(src) && /_finishRoute = \(\) => \(_plan\(\) \? "plan-finish" : "reflect"\)/.test(src));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
