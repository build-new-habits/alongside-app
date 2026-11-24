/**
 * tools/verify-exercise-four.mjs
 * 24 Nov 2026 v3
 *
 * v3 - P-46 S5 PLAYER. One screen per move (Graeme's decision; spec §6): the
 *   four steps went. The checks hold what they carried: Why, then Watch out
 *   before How, under More about this move; the sets on the screen; today's
 *   caution never folded; If it hurts one tap away; resume lands on the sets.
 *
 * 24 Nov 2026 v2
 *
 * v2 - P-46 S4 FREE HOME. The builder is the Plan's; the Free session is
 *   built on the Plan and played on Free (the player is what this checks).
 *
 * 04 Oct 2026 v1
 *
 * D-1 EXERCISE-FOUR. Graeme, on the phone, 04 Oct: "the 4 pages for
 * exercises is now just one. I would like, Why; What to watch out for;
 * How; Reflect and capture data. This is what we had before." Option B,
 * "absolutely": four steps, with a way straight to Capture for an exercise
 * the person already knows.
 *
 * What a person sees and taps, through the real router, builder and player:
 *   1. Four steps under the name, in this order: Why, Watch out, How,
 *      Capture, each a button; the current one is aria-current="step".
 *   2. A new exercise starts at Why, and Why shows the exercise's written
 *      why (every exercise has one; no screen showed it before this).
 *   3. Next walks Why → What to watch out for → How → Reflect and capture.
 *      Watch out comes before How (the safety order), and focus goes to
 *      each step's title.
 *   4. "I know this one: go to capture" goes straight to Capture, where the
 *      weight, reps and set buttons are; Skip this one is on every step.
 *   5. Finishing an exercise starts the next one at Why again.
 *   6. Reopened part-way through an exercise's sets, the player lands on
 *      Capture, where the sets are, not at Why.
 *   8. Today's caution is on every step, and If it hurts is on Capture:
 *      the shortcut past Watch out skips neither.
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

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s), $$ = s => [...main.querySelectorAll(s)];
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = async el => { el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true })); await wait(40); };

function fixture(tier) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("equipment", ["dumbbells", "bench"]); store.set("homeEquipment", ["dumbbells", "bench"]);
  store.set("conditions", []); store.set("conditionPainScores", {});
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
async function go(view) { await router.navigate(view); await wait(40); }

async function buildAndGo() {
  // P-46 S4. The builder is the Plan's now (Free opens on-the-plan); a Free
  // session is built there and played on Free, which is what this checks.
  const tierWas = store.get("tier"); store.set("tier", "personal");
  await go("today");
  await go("session-builder");
  if (!$$(".sb-type-tile").length) await click($("#sb-rebuild-btn"));
  await click($$(".sb-type-tile").find(b => b.dataset.type === "full"));
  await click($("#sb-location-continue-btn"));
  await click($$(".sb-duration-btn").find(b => b.dataset.mins === "30"));
  await click($("#sb-build-btn"));
  await click($$(".sb-buildmode-btn").find(b => b.dataset.mode === "coach"));
  await wait(1400);
  const s = store.get("generatedSession")?.session;
  store.set("tier", tierWas); await click($("#sb-go-btn")); await wait(300);
  return s;
}

// P-46 S5. One screen per move, both tiers: the four steps went. What they
// held is on the one screen, in the same safety order: today's caution and
// the cue on screen; Why, Watch out and How under More about this move.
const more = () => $("details.xcard-more");

for (const tier of ["free", "personal"]) {
  console.log(`\nTIER ${tier}`);
  fixture(tier);
  const s = await buildAndGo();
  ok(`${tier} 0. the builder made a session and the player is open`,
     !!s && router.currentView === "workout", `${router.currentView}`);
  const ex0 = s.exercises[0];

  // 1. One screen: no steps strip.
  ok(`${tier} 1a. one screen per move: no steps strip, no Next: Why`, !$(".wo-steps") && !$("#wo-step-next") && !$("[data-step-go]"));
  ok(`${tier} 1b. the name is the screen's heading`, txt($("h1#wo-exercise-name")) === ex0.name);
  ok(`${tier} 1c. More about this move is a closed disclosure`, !!more() && !more().open && txt(more().querySelector("summary")) === "More about this move");

  // 2. Why, Watch out, How: inside More, in the safety order.
  const m = more()?.innerHTML || "";
  ok(`${tier} 2b. Why shows the exercise's own written why`,
     !!ex0.why && txt($(".xcard-more .xstep-why")) === ex0.why.replace(/\s+/g, " ").trim(), `${txt($(".xcard-more .xstep-why")).slice(0, 80)} | ${String(ex0.why).slice(0, 80)}`);
  ok(`${tier} 2c. Watch out comes before How, and How has the steps and the video link`,
     m.indexOf(">Watch out<") > -1 && m.indexOf(">Watch out<") < m.indexOf(">How<") &&
     $$(".xcard-more .xcard-how .exercise-section-list li").length > 0 && /Watch how to do this/.test(txt(more())));
  ok(`${tier} 2d. Skip this one is there`, !!$("#skip-exercise-btn"));

  // 3. The sets are on the screen.
  ok(`${tier} 3b. the sets and Skip, on the one screen`,
     (!!$("#wo-set-done-btn") || !!$("#wo-done-btn") || !!$("#timer-toggle-btn")) && !!$("#skip-exercise-btn") &&
     !!$(".xstep--capture [id^='wo-log-'], .xstep--capture .slog"));
  ok(`${tier} 4b. no "I know this one: go to capture" (there is nothing to skip past)`, !/I know this one/.test(txt(main)));

  // 5. Finishing an exercise: the next one starts at its name.
  for (let i = 0; i < 20 && !$("#complete-exercise-btn"); i++) {
    const b = $("#wo-set-done-btn") || $("#wo-done-btn");
    if (!b) break;
    await click(b);
  }
  ok(`${tier} 5a. once the sets are done, too hard / too easy is on the screen`, !!$("#complete-exercise-btn") && !!$(".wo-flow__done"));
  await click($("#complete-exercise-btn"));
  ok(`${tier} 5b. the next exercise starts at its name, More folded`,
     txt($("h1#wo-exercise-name")) === s.exercises[1].name && !!more() && !more().open, `${txt(main).slice(0, 80)}`);

  // 6. Skip moves on.
  await click($("#skip-exercise-btn"));
  ok(`${tier} 6. Skip moves to the next exercise`, txt($("h1#wo-exercise-name")) === s.exercises[2].name);
}

// 7. Reopened part-way through an exercise's sets: the sets are there.
console.log("\nRESUME");
fixture("personal");
const s = await buildAndGo();
let k = -1;
for (let i = 0; i < s.exercises.length; i++) {
  if ($("#wo-set-done-btn")) { k = i; break; }
  await click($("#skip-exercise-btn"));
}
await click($("#wo-set-done-btn")); await wait(100);
const cp = store.get("activeSessionCheckpoint");
ok("7a. one set logged on a multi-set exercise is checkpointed part-way",
   k >= 0 && Number(cp?.index) === k && Number(cp?.set) === 2, JSON.stringify({ k, index: cp?.index, set: cp?.set }));
const W2 = await import(B + "views/workout.js?reopen=" + Date.now());
main.innerHTML = W2.render();
ok("7b. reopened part-way, the player lands on that exercise with its sets",
   txt(main).includes(s.exercises[k].name) && !!$("#wo-set-done-btn") && /Set 2 done/.test(txt($("#wo-set-done-btn"))),
   `${txt(main).slice(0, 100)}`);

// 8. Safety on the one screen: today's caution never folded, If it hurts one tap away.
console.log("\nCAUTION");
fixture("personal");
store.set("conditions", ["lower-back"]); store.set("conditionPainScores", { "lower-back": 5 });
const RF = await import(B + "data/red-flag.js");
store.set("redFlag", { screenedAt: new Date().toISOString(), areas: ["lower-back"], textVersion: RF.RED_FLAG_VERSION, level: null, flaggedAt: null, clearedAt: null });
await buildAndGo();
const cau = $(".exercise-caution");
ok("8a. with something sore today, the caution is on the screen, not folded away",
   !!cau && !cau.closest("details"), txt(main).slice(0, 120));
ok("8b. If it hurts, one tap away (closed), on the screen",
   !!$(".xstep--capture details.xcard-hurt") && !$(".xstep--capture details.xcard-hurt[open]"));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
