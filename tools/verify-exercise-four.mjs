/**
 * tools/verify-exercise-four.mjs
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
  await click($("#sb-go-btn")); await wait(300);
  return s;
}

const current = () => $('.wo-steps [aria-current="step"]')?.dataset.stepGo;
const title   = () => txt($(".xstep-title"));

for (const tier of ["free", "personal"]) {
  console.log(`\nTIER ${tier}`);
  fixture(tier);
  const s = await buildAndGo();
  ok(`${tier} 0. the builder made a session and the player is open`,
     !!s && router.currentView === "workout", `${router.currentView}`);
  const ex0 = s.exercises[0];

  // 1. The four steps.
  const btns = $$(".wo-steps button[data-step-go]");
  ok(`${tier} 1a. four steps, in order: Why, Watch out, How, Capture`,
     JSON.stringify(btns.map(b => txt(b))) === JSON.stringify(["Why", "Watch out", "How", "Capture"]),
     JSON.stringify(btns.map(b => txt(b))));
  ok(`${tier} 1b. each step's name contains its visible words (label in name)`,
     btns.length === 4 && btns.every(b => (b.getAttribute("aria-label") || "").toLowerCase().includes(txt(b).toLowerCase())));
  ok(`${tier} 1c. the steps are a named navigation list`,
     !!$('nav.wo-steps[aria-label] ol'));

  // 2. Starts at Why, with the why.
  ok(`${tier} 2a. a new exercise starts at Why`, current() === "why" && title() === "Why", `${current()} | ${title()}`);
  ok(`${tier} 2b. Why shows the exercise's own written why`,
     !!ex0.why && txt($(".xstep-why")) === ex0.why.replace(/\s+/g, " ").trim(), `${txt($(".xstep-why")).slice(0, 80)} | ${String(ex0.why).slice(0, 80)}`);
  ok(`${tier} 2c. no weight, reps or set buttons on Why`,
     !$("#wo-set-done-btn") && !$("#wo-done-btn") && !$("#complete-exercise-btn") && !$(".slog, [id^='wo-log-']"));
  ok(`${tier} 2d. Skip this one is there`, !!$("#skip-exercise-btn"));

  // 3. Next walks the steps in the safety order.
  const walk = [];
  for (let i = 0; i < 3; i++) {
    const n = $("#wo-step-next");
    walk.push(txt(n));
    await click(n);
    walk.push(`${current()}:${title()}:${document.activeElement?.classList.contains("xstep-title")}`);
    if (current() === "watch") {
      ok(`${tier} 3w. Watch out shows the hazards in the rose box`,
         !!$(".xstep--watch .xcard-block--hazard") && $$(".xstep--watch .xcard-block--hazard li").length > 0);
      ok(`${tier} 3s. Skip this one on Watch out`, !!$("#skip-exercise-btn"));
    }
    if (current() === "how") {
      ok(`${tier} 3h. How shows the steps and the video link`,
         $$(".xstep--how .exercise-section-list li").length > 0 && /Watch how to do this/.test(txt($(".xstep--how"))));
      ok(`${tier} 3k. no shortcut on How (Next is Capture)`, !$("#wo-step-capture"));
    }
  }
  ok(`${tier} 3a. Next goes Why → What to watch out for → How → Reflect and capture, focus on each title`,
     JSON.stringify(walk) === JSON.stringify([
       "Next: What to watch out for", "watch:What to watch out for:true",
       "Next: How", "how:How:true",
       "Next: Reflect and capture", "capture:Reflect and capture:true"]),
     JSON.stringify(walk));
  ok(`${tier} 3b. Capture has the sets and Skip`,
     (!!$("#wo-set-done-btn") || !!$("#wo-done-btn") || !!$("#timer-toggle-btn")) && !!$("#skip-exercise-btn") &&
     !!$(".xstep--capture [id^='wo-log-'], .xstep--capture .slog"));

  // 4. Any step from the strip; back to Why.
  await click($('.wo-steps [data-step-go="why"]'));
  ok(`${tier} 4a. the strip goes back to Why`, current() === "why");
  await click($("#wo-step-capture"));
  ok(`${tier} 4b. "I know this one: go to capture" goes straight to Capture`,
     current() === "capture" && document.activeElement?.id === "wo-cap-h", `${current()} ${document.activeElement?.id}`);

  // 5. Finishing an exercise: the next one starts at Why.
  for (let i = 0; i < 20 && !$("#complete-exercise-btn"); i++) {
    const b = $("#wo-set-done-btn") || $("#wo-done-btn");
    if (!b) break;
    await click(b);
  }
  ok(`${tier} 5a. once the sets are done, too hard / too easy is on Capture`, !!$("#complete-exercise-btn") && current() === "capture");
  await click($("#complete-exercise-btn"));
  ok(`${tier} 5b. the next exercise starts at Why`,
     txt(main).includes(s.exercises[1].name) && current() === "why", `${current()} | ${txt(main).slice(0, 80)}`);

  // 6. Skip from Why moves on, and starts at Why.
  await click($("#skip-exercise-btn"));
  ok(`${tier} 6. Skip from Why moves to the next exercise, at Why`,
     txt(main).includes(s.exercises[2].name) && current() === "why");
}

// 7. Reopened part-way through an exercise's sets: Capture.
console.log("\nRESUME");
fixture("personal");
const s = await buildAndGo();
// The first exercise the player counts by sets (a per-set button), so one
// tap logs one set and leaves it part-way.
let k = -1;
for (let i = 0; i < s.exercises.length; i++) {
  await click($("#wo-step-capture"));
  if ($("#wo-set-done-btn")) { k = i; break; }
  await click($("#skip-exercise-btn"));
}
await click($("#wo-set-done-btn")); await wait(100);
const cp = store.get("activeSessionCheckpoint");
ok("7a. one set logged on a multi-set exercise is checkpointed part-way",
   k >= 0 && Number(cp?.index) === k && Number(cp?.set) === 2, JSON.stringify({ k, index: cp?.index, set: cp?.set }));
// The app reopened: a fresh copy of the player, the same store.
const W2 = await import(B + "views/workout.js?reopen=" + Date.now());
main.innerHTML = W2.render();
ok("7b. reopened part-way, the player lands on Capture, where the sets are",
   current() === "capture" && txt(main).includes(s.exercises[k].name) && !!$("#wo-set-done-btn"),
   `${current()} | ${txt(main).slice(0, 100)}`);

// 8. Safety travels with the shortcut: today's caution on every step,
//    and If it hurts on Capture, so "I know this one" skips neither.
console.log("\nCAUTION");
fixture("personal");
store.set("conditions", ["lower-back"]); store.set("conditionPainScores", { "lower-back": 5 });
// Screened today (the red-flag questions answered, nothing found).
const RF = await import(B + "data/red-flag.js");
store.set("redFlag", { screenedAt: new Date().toISOString(), areas: ["lower-back"], textVersion: RF.RED_FLAG_VERSION, level: null, flaggedAt: null, clearedAt: null });
await buildAndGo();
const seen = {};
for (const st of ["why", "watch", "how", "capture"]) {
  await click($(`.wo-steps [data-step-go="${st}"]`));
  seen[st] = !!$(".exercise-caution") && current() === st;
}
ok("8a. with something sore today, the caution is on all four steps",
   Object.values(seen).length === 4 && Object.values(seen).every(Boolean), JSON.stringify(seen));
await click($(".wo-steps [data-step-go=\"why\"]"));
await click($("#wo-step-capture"));
ok("8b. Capture has If it hurts, one tap away (closed)",
   !!$(".xstep--capture details.xcard-hurt") && !$(".xstep--capture details.xcard-hurt[open]"));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
