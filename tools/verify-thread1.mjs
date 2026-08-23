/**
 * tools/verify-thread1.mjs
 * 22 Aug 2026 v1
 *
 * THREAD-1a — the thread runner, the hard conversation, and the
 * divergence between two renderers.
 *
 * MOUNTS AND DRIVES THE THREAD. Same standard as verify-hard1b: a
 * synthetic script is run through the real runner, chips are clicked,
 * inputs are filled, and every assertion reads the resulting DOM.
 *
 * ── THE DIVERGENCE SECTION IS THE ONE THAT MATTERS MOST ─────────────
 *
 * Two renderers for the coach's voice exist until THREAD-1b migrates
 * onboarding. That is a deliberate, dated trade -- onboarding captures
 * legal consent and breaking it before beta is the one unrecoverable
 * mistake available here.
 *
 * But duplication that nothing watches is exactly what produced
 * goal-setup.js: a file kept for backward compatibility that outlived
 * what it was compatible with and quietly rotted. Section 5 asserts the
 * two agree on the things that would make the coach FEEL different --
 * timings, reduced motion, aria-live, bubble semantics. If they drift,
 * this goes red.
 *
 * Run: node tools/verify-thread1.mjs
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://localhost/" });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
global.requestAnimationFrame = cb => cb();
// REDUCED MOTION IS ON for this gate, set BEFORE the runner is imported
// because it reads matchMedia once at module load.
//
// Two reasons, and the second is the honest one. First, every timing
// collapses to zero, so the behavioural sections are fast and
// deterministic rather than sleeping past an 800ms minimum typing delay
// on every bubble. Second -- and this is the trade -- it means the REAL
// timing path is not exercised at runtime here. The timing VALUES are
// verified instead from source in section 5, in both renderers at once.
//
// Stated rather than hidden: if the typing path itself ever breaks, this
// gate will not catch it. What it does catch is the values drifting
// apart, which is the failure that would actually reach a person.
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener(){}, removeEventListener(){},
                                addListener(){}, removeListener(){} });

let failures = 0, checks = 0;
const ok = (label, cond, detail = "") => {
  checks++;
  if (cond) console.log(`  PASS  ${label}`);
  else { failures++; console.log(`  FAIL  ${label}${detail ? "  --  " + detail : ""}`); }
};
const section = n => console.log(`\n${n}`);
const wait = ms => new Promise(r => setTimeout(r, ms));
const settle = () => wait(40);
const txt = el => (el.textContent || "").replace(/\s+/g, " ").trim();

const { runThread, T } = await import(`${REPO}/js/views/thread-runner.js`);
const { GOAL_REVIEW_SCRIPT, GOAL_REVIEW_START } =
  await import(`${REPO}/js/data/goal-review-script.js`);
const { store } = await import(`${REPO}/js/store.js`);
const viewMod = await import(`${REPO}/js/views/goal-review-thread.js`);

// ── 0. Positive control ─────────────────────────────────────────────
section("0. Positive control");
{
  ok("the runner is a function", typeof runThread === "function");
  ok("the script has the three branches",
     ["move", "reshape-what", "kept"].every(k => k in GOAL_REVIEW_SCRIPT));
  // Reduced motion is on here, so every runtime timing must be zero. If
  // one were not, the behavioural sections below would be racing it and
  // their passes would be luck.
  ok("reduced motion collapsed every runtime timing to zero",
     Object.values(T).every(v => v === 0), JSON.stringify(T));
}

// ── 1. The runner renders a script it knows nothing about ───────────
section("1. The runner is generic");
{
  const el = document.createElement("div");
  const script = {
    a: { id: "a", type: "chips", coach: "Pick one",
         chips: [{ id: "x", label: "Ex" }, { id: "y", label: "Why" }],
         next: ans => ans.id === "x" ? "b" : null },
    b: { id: "b", type: "end", coach: "Done" }
  };
  const seen = [];
  runThread(el, { script, start: "a", onAnswer: (s, a) => seen.push([s, a.id]) });
  await settle();

  ok("scroll area carries aria-live=polite",
     el.querySelector('.ob-thread__scroll[aria-live="polite"]') !== null);
  ok("a coach bubble rendered", el.querySelector(".ob-bubble--coach") !== null);
  ok("chips rendered", el.querySelectorAll(".ob-chip").length === 2);

  // All chips carry the SAME class. A runner must not be able to style
  // one answer as preferable -- in the hard conversation "leave it where
  // it is" has to weigh exactly as much as the other two.
  const cls = [...el.querySelectorAll(".ob-chip")].map(c => c.className);
  ok("all chips are styled identically", new Set(cls).size === 1, cls.join(" | "));

  el.querySelector('[data-chip="x"]').dispatchEvent(new dom.window.Event("click"));
  await settle();
  ok("a user bubble appears with the chosen label",
     el.querySelector(".ob-bubble--user")?.textContent === "Ex");
  ok("coach bubbles are left, user bubbles right (by class)",
     el.querySelector(".ob-bubble--coach") && el.querySelector(".ob-bubble--user"));
  ok("onAnswer fired with the step id and answer",
     seen.length === 1 && seen[0][0] === "a" && seen[0][1] === "x", JSON.stringify(seen));
  ok("it advanced to the next step", txt(el).includes("Done"));
}

// ── 2. Input steps ──────────────────────────────────────────────────
section("2. Input steps");
{
  const el = document.createElement("div");
  let got = null;
  runThread(el, {
    script: {
      a: { id: "a", type: "input", coach: "What is it?",
           input: { kind: "text", label: "Your reply", value: "prefilled" },
           next: () => null }
    },
    start: "a",
    onAnswer: (s, a) => { got = a; }
  });
  await settle();
  const field = el.querySelector(".ob-input-bar__field");
  ok("an input rendered", field !== null);
  ok("it is pre-filled from the script", field?.value === "prefilled");
  ok("it has an accessible name", (field?.getAttribute("aria-label") || "").length > 0);
  field.value = "typed answer";
  el.querySelector(".ob-input-bar__send").dispatchEvent(new dom.window.Event("click"));
  await settle();
  ok("the answer reaches onAnswer", got === "typed answer", String(got));
  ok("the input is removed after sending", el.querySelector(".ob-input-bar") === null);
}

// ── 3. The hard conversation, end to end ────────────────────────────
section("3. The hard conversation — every branch");

// FIXED at module load. The first version recomputed from Date.now() on
// every call, so "the date is unchanged" compared two timestamps a few
// milliseconds apart and went red against correct code. A fixture that
// moves is not a fixture.
const T0 = Date.now();
const iso = d => new Date(T0 + d * 86400000).toISOString();
const day = d => iso(d).slice(0, 10);

function seedState() {
  localStorage.clear();
  localStorage.setItem("alongside_user", JSON.stringify({
    tier: "personal",
    strategicGoal: {
      targetDescription: "Walk the Quantocks ridge with Jen",
      targetDate: iso(40), targetSetAt: iso(-60), setAt: iso(-60),
      weeklySessionTarget: 3, review: { lastOfferedAt: null, outcomes: [] }
    }
  }));
  store.init();
}

async function openThread() {
  seedState();
  const el = document.createElement("div");
  let navigatedTo = null;
  viewMod.GoalReviewThreadView({ navigate: r => { navigatedTo = r; } }).mount(el);
  await settle();
  return { el, nav: () => navigatedTo };
}

{
  // Leave it where it is.
  const { el } = await openThread();
  ok("the conversation opens with the person's own words", txt(el).includes("Quantocks"));
  const chipEls = [...el.querySelectorAll(".ob-chip")];
  const chips = chipEls.map(c => c.dataset.chip);
  ok("all three branches offered", ["move", "reshape", "keep"].every(k => chips.includes(k)),
     chips.join(","));

  // THE ASSERTION THAT MATTERS MOST ON THIS SCREEN.
  //
  // "Leave it where it is" must weigh exactly as much as the other two.
  // A modifier class on that one chip -- ob-chip--skip, say -- would
  // make it a nudge wearing a choice's clothes.
  //
  // Section 1 already checks chip uniformity, but against a SYNTHETIC
  // script with no 'keep' chip, so it never covered the real
  // conversation. A reversal styling keep differently stayed GREEN until
  // this assertion existed. A test on a stand-in is not a test of the
  // thing.
  const chipClasses = chipEls.map(c => c.className);
  ok("all three chips are styled identically",
     new Set(chipClasses).size === 1, chipClasses.join(" | "));
  ok("no chip carries a modifier class",
     chipClasses.every(c => c.trim() === "ob-chip"), chipClasses.join(" | "));

  el.querySelector('[data-chip="keep"]').dispatchEvent(new dom.window.Event("click"));
  await settle();
  const r = store.get("strategicGoal.review");
  ok("keep records an outcome", r.outcomes[0]?.choice === "kept", JSON.stringify(r.outcomes));
  ok("keep sets lastOfferedAt", typeof r.lastOfferedAt === "string");
  ok("the date is unchanged", store.get("strategicGoal.targetDate") === iso(40));

  // ONE beat and it closes. Asking "are you sure" would make the first
  // answer provisional, which would make it not a choice.
  ok("it does not ask again", !/sure|really|certain|reconsider/i.test(txt(el)), txt(el).slice(-120));
}

{
  // Move the date.
  const { el } = await openThread();
  el.querySelector('[data-chip="move"]').dispatchEvent(new dom.window.Event("click"));
  await settle();
  const field = el.querySelector(".ob-input-bar__field");
  ok("move asks for a date", field?.type === "date");
  field.value = day(120);
  el.querySelector(".ob-input-bar__send").dispatchEvent(new dom.window.Event("click"));
  await settle();
  ok("the date moved", store.get("strategicGoal.targetDate") === day(120));
  ok("targetSetAt is refreshed so maturity restarts",
     store.get("strategicGoal.targetSetAt") > iso(-1));
  ok("the legacy top-level date was NOT written", !store.get("targetDate"));
  ok("the outcome records both dates", (() => {
    const o = store.get("strategicGoal.review").outcomes[0];
    return o?.choice === "moved" && o?.newDate === day(120) && !!o?.previousDate;
  })());
}

{
  // Reshape, pre-filled.
  const { el } = await openThread();
  el.querySelector('[data-chip="reshape"]').dispatchEvent(new dom.window.Event("click"));
  await settle();
  const what = el.querySelector(".ob-input-bar__field");
  ok("reshape pre-fills the person's existing words",
     what?.value === "Walk the Quantocks ridge with Jen", String(what?.value));
  what.value = "Walk the ridge with Jen and the dog";
  el.querySelector(".ob-input-bar__send").dispatchEvent(new dom.window.Event("click"));
  await settle();
  const when = el.querySelector(".ob-input-bar__field");
  ok("then it asks for a date", when?.type === "date");
  when.value = day(150);
  el.querySelector(".ob-input-bar__send").dispatchEvent(new dom.window.Event("click"));
  await settle();
  ok("the words were saved",
     store.get("strategicGoal.targetDescription") === "Walk the ridge with Jen and the dog");
  ok("the date was saved", store.get("strategicGoal.targetDate") === day(150));
  ok("the outcome says reshaped",
     store.get("strategicGoal.review").outcomes[0]?.choice === "reshaped");
}

{
  // Opening and backing out costs nothing. Somebody not ready to have
  // this conversation today should not have spent it.
  const { el } = await openThread();
  ok("opening alone records no outcome",
     store.get("strategicGoal.review").outcomes.length === 0);
  ok("opening alone does not consume the throttle",
     store.get("strategicGoal.review").lastOfferedAt === null);
}

{
  // Free must not reach it, whatever linked here.
  seedState();
  store.set("tier", "free");
  const el = document.createElement("div");
  let nav = null;
  viewMod.GoalReviewThreadView({ navigate: r => { nav = r; } }).mount(el);
  await settle();
  ok("free is turned away", nav === "my-programme", String(nav));
  ok("free sees no thread", el.querySelector(".ob-bubble") === null);
}

// ── 4. No arithmetic on the person, in any branch ───────────────────
section("4. No arithmetic on the person");
{
  const all = [];
  for (const branch of ["keep", "move", "reshape"]) {
    const { el } = await openThread();
    el.querySelector(`[data-chip="${branch}"]`).dispatchEvent(new dom.window.Event("click"));
    await settle();
    all.push(txt(el));
  }
  const body = all.join(" ");
  ok("no percentage", !/\d+\s?%/.test(body));
  ok("no rate", !/per week|a week|\/week/.test(body), body.slice(0, 100));
  ok("no session count", !/\d+\s+(of|out of)\s+\d+|\d+\s+sessions?/i.test(body));
  ok("no banned vocabulary",
     !/\b(behind|missed|failed|slipping|off track|on track|catch up|fall short)\b/i.test(body),
     body.slice(0, 140));
  ok("it says nothing has gone wrong", /nothing has gone wrong/i.test(body));
}

// ── 5. DIVERGENCE — two renderers, one coach ────────────────────────
section("5. Divergence between the runner and onboarding/thread.js");
{
  const legacy = fs.readFileSync(path.join(REPO, "js/views/onboarding/thread.js"), "utf8");
  const runner = fs.readFileSync(path.join(REPO, "js/views/thread-runner.js"), "utf8");

  // Shared timing constants must hold the same values in both.
  const read = (src, key) => {
    const m = src.match(new RegExp(key + "\\s*:\\s*REDUCED_MOTION \\?\\s*(\\d+)\\s*:\\s*(\\d+)"));
    return m ? [Number(m[1]), Number(m[2])] : null;
  };
  const shared = ["TYPING_SHOW", "TYPING_MIN", "BUBBLE_DELAY", "INPUT_APPEAR",
                  "CHIP_APPEAR", "READ_PAUSE", "SCROLL_DELAY"];
  for (const key of shared) {
    const a = read(legacy, key), b = read(runner, key);
    ok(`${key} agrees`, a && b && a[0] === b[0] && a[1] === b[1],
       `onboarding ${JSON.stringify(a)} vs runner ${JSON.stringify(b)}`);
  }

  // Every shared timing collapses to zero under reduced motion. This is
  // the accessibility contract, not a nicety.
  ok("every runner timing collapses to 0 under reduced motion",
     shared.every(k => read(runner, k)?.[0] === 0));
  ok("every onboarding timing collapses to 0 under reduced motion",
     shared.every(k => read(legacy, k)?.[0] === 0));

  // Bubble semantics and the live region.
  for (const cls of ["ob-bubble ob-bubble--coach", "ob-bubble ob-bubble--user"]) {
    ok(`both use "${cls}"`, legacy.includes(cls) && runner.includes(cls));
  }
  ok("both announce with aria-live=polite",
     /aria-live="polite"/.test(legacy) && /aria-live="polite"/.test(runner));
  ok("both scale typing delay by word count",
     /words \* 40/.test(legacy) && /words \* 40/.test(runner));
}

console.log(`\n${"-".repeat(60)}`);
if (failures === 0) { console.log(`verify-thread1: ${checks} checks, all green.`); process.exit(0); }
else { console.log(`verify-thread1: ${failures} of ${checks} checks RED.`); process.exit(1); }
