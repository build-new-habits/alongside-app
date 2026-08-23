/**
 * tools/verify-hard1b.mjs
 * 22 Aug 2026 v1
 *
 * R1-b — the hard conversation's surface, and the target tier gate.
 *
 * THIS GATE MOUNTS THE VIEW AND READS WHAT RENDERED. It does not grep.
 *
 * A view is the hard case for that rule: goal-review.js could be tested
 * as a pure function, but my-programme.js builds innerHTML, so the
 * temptation is to assert "the source contains the word Move". That
 * proves nothing -- verify-bias1 was green while the code it watched
 * threw on line three, and 43 of the gates in this suite still cannot
 * tell live code from dead. So the view is mounted against jsdom with a
 * real store, and every assertion inspects the resulting DOM.
 *
 * WHAT IS BEING PROTECTED, IN ORDER OF SERIOUSNESS
 *
 * 1. Free never sees a dated target. "Free has goals, the Plan has
 *    targets" -- this screen had drifted and showed the date and the
 *    countdown to everyone.
 * 2. NO ARITHMETIC ON THE PERSON. Nothing in the offer may state a rate,
 *    a shortfall, a percentage or a count of sessions. This is
 *    review-time, which is judgement.
 * 3. "Leave it where it is" is a real, equally-weighted choice.
 * 4. Suppression never consumes the throttle.
 *
 * Run: node tools/verify-hard1b.mjs
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://localhost/" });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
if (typeof dom.window.matchMedia !== "function") {
  dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener(){}, removeEventListener(){},
                                  addListener(){}, removeListener(){} });
}

let failures = 0, checks = 0;
const ok = (label, cond, detail = "") => {
  checks++;
  if (cond) console.log(`  PASS  ${label}`);
  else { failures++; console.log(`  FAIL  ${label}${detail ? "  --  " + detail : ""}`); }
};
const section = n => console.log(`\n${n}`);

const iso = d => new Date(Date.now() + d * 86400000).toISOString();
const day = d => iso(d).slice(0, 10);

/** Off-course state: matured, date well out, rate under the floor. */
function offCourseState(tier = "personal", over = {}) {
  const log = [];
  for (let i = 0; i < 5; i++) {
    log.push({ type: "workout", status: "completed", completedAt: iso(-Math.floor(i * 5)) });
  }
  const history = {};
  for (let i = 0; i < 5; i++) history[day(-i)] = { mood: 6, energy: 6 };
  return {
    tier,
    activityLog: log,
    checkinHistory: history,
    conditionPainScores: {},
    checkin: { lastOpeningMode: "standard" },
    strategicGoal: {
      primaryGoal: "improve-cardio",
      targetDescription: "Walk the Quantocks ridge with Jen",
      targetDate: iso(40),
      targetSetAt: iso(-60),
      setAt: iso(-60),
      weeklySessionTarget: 3,
      review: { lastOfferedAt: null, outcomes: [] }
    },
    ...over
  };
}

// ── Harness note, learned the hard way ─────────────────────────────
//
// Modules are imported ONCE and the store is re-initialised per test.
//
// The first version of this gate appended ?b=<random> to force a fresh
// module each time. That created a SECOND store instance -- the view
// imports plain '../store.js', so it kept the singleton from the very
// first mount and every later test read the FIRST test's tier. Free
// passed, the Plan failed, and the code was correct throughout.
//
// store.init() re-reads localStorage unconditionally, so one shared
// instance with an explicit re-init is both simpler and honest.
const { store } = await import(`${REPO}/js/store.js`);
const viewModule = await import(`${REPO}/js/views/my-programme.js`);

async function mount(state) {
  localStorage.clear();
  localStorage.setItem("alongside_user", JSON.stringify(state));
  store.init();
  const el = document.createElement("div");
  const view = viewModule.MyProgrammeView({ navigate() {} });
  view.mount ? view.mount(el) : view.render?.(el);
  return { el, store, view };
}

// Positive control. If the fixture does not reach the store, every
// assertion below tests defaults and proves nothing -- the exact way
// verify-hard1-store went green against data it had never loaded.
{
  const probe = await mount(offCourseState("personal"));
  if (probe.store.get("strategicGoal.targetDescription") !== "Walk the Quantocks ridge with Jen") {
    console.log("  FAIL  positive control — the fixture never reached the store");
    process.exit(1);
  }
  if (probe.store.get("tier") !== "personal") {
    console.log("  FAIL  positive control — tier did not load");
    process.exit(1);
  }
  console.log("\n0. Positive control\n  PASS  the fixture reaches the store and the tier loads");
}

const txt = el => (el.textContent || "").replace(/\s+/g, " ").trim();

// ── 1. Tier gate ────────────────────────────────────────────────────
section("1. Free never sees a dated target");
{
  const free = await mount(offCourseState("free"));
  const t = txt(free.el);
  ok("free sees no target description", !t.includes("Quantocks"), t.slice(0, 120));
  ok("free sees no countdown", !/days to go/.test(t));
  ok("free sees no offer", free.el.querySelectorAll("[data-review]").length === 0);

  // The goals themselves stay free. A goal is a direction and it belongs
  // to the person whatever they pay.
  const withGoals = await mount(offCourseState("free", { goals: ["improve-cardio"] }));
  ok("free STILL sees its own goals", withGoals.el.querySelector(".my-programme-goals") !== null);

  const paid = await mount(offCourseState("personal"));
  ok("the Plan does see the target", txt(paid.el).includes("Quantocks"));
}

// ── 2. The offer ────────────────────────────────────────────────────
section("2. The offer renders with three real options");
{
  const { el } = await mount(offCourseState());
  const opts = [...el.querySelectorAll("[data-review]")].map(b => b.dataset.review);
  ok("offer is present", el.querySelector(".my-programme-review") !== null);
  ok("all three options present", ["move", "reshape", "keep"].every(k => opts.includes(k)), opts.join(","));
  ok("it uses the person's own words", txt(el).includes("Quantocks"));

  // "Leave it where it is" must not be visually demoted. A ghost button
  // beside two solid ones is a nudge wearing a choice's clothes.
  const cls = k => el.querySelector(`[data-review="${k}"]`).className;
  ok("all three carry the same button weight",
     cls("move") === cls("reshape") && cls("reshape") === cls("keep"),
     `${cls("move")} | ${cls("keep")}`);
  ok("none of the three is a ghost button",
     !["move", "reshape", "keep"].some(k => /btn-ghost/.test(cls(k))));
}

// ── 3. NO ARITHMETIC ON THE PERSON ──────────────────────────────────
section("3. The offer states no number about the person");
{
  const { el } = await mount(offCourseState());
  const body = txt(el.querySelector(".my-programme-review"));
  ok("no percentage", !/\d+\s?%/.test(body), body);
  ok("no rate", !/per week|a week|\/week/.test(body), body);
  ok("no session count", !/\d+\s+(of|out of|sessions?)/i.test(body), body);
  ok("no 'behind' or 'missed'", !/behind|missed|failed|slipping|off track/i.test(body), body);
  ok("says nothing has gone wrong", /nothing has gone wrong/i.test(body));
}

// ── 4. Suppression reaches the surface ──────────────────────────────
section("4. Suppression is visible where it matters — the screen");
{
  const cases = [
    ["burnout high", { checkinHistory: Object.fromEntries(
        Array.from({ length: 5 }, (_, i) => [day(-i), { mood: 2, energy: 2 }])) }],
    ["severe pain", { conditionPainScores: { "low-back-pain": 8 } }],
    ["care opening", { checkin: { lastOpeningMode: "care" } }],
    ["bottom band", { checkinHistory: { [day(0)]: { mood: 3, energy: 7 } } }]
  ];
  for (const [label, over] of cases) {
    const { el } = await mount(offCourseState("personal", over));
    ok(`silent — ${label}`, el.querySelector(".my-programme-review") === null,
       txt(el).slice(0, 100));
  }

  // ...and the target itself is still shown. Suppression silences the
  // CONVERSATION, never the person's own goal.
  const { el } = await mount(offCourseState("personal", { conditionPainScores: { x: 9 } }));
  ok("the target is still displayed while suppressed", txt(el).includes("Quantocks"));
}

// ── 5. Suppression never consumes the throttle ──────────────────────
section("5. A suppressed offer leaves the throttle untouched");
{
  const { store } = await mount(offCourseState("personal", { conditionPainScores: { x: 9 } }));
  ok("lastOfferedAt still null after a suppressed render",
     store.get("strategicGoal.review").lastOfferedAt === null,
     String(store.get("strategicGoal.review").lastOfferedAt));
}

// ── 6. The three branches write what they claim ─────────────────────
section("6. Each option records an outcome and closes the conversation");
{
  // Leave it where it is.
  {
    const { el, store } = await mount(offCourseState());
    el.querySelector('[data-review="keep"]').dispatchEvent(new dom.window.Event("click"));
    const r = store.get("strategicGoal.review");
    ok("keep records an outcome", r.outcomes.length === 1 && r.outcomes[0].choice === "kept",
       JSON.stringify(r.outcomes));
    ok("keep sets lastOfferedAt", typeof r.lastOfferedAt === "string");
    ok("the offer is gone afterwards", el.querySelector(".my-programme-review") === null);
  }

  // Move the date.
  {
    const { el, store } = await mount(offCourseState());
    el.querySelector('[data-review="move"]').dispatchEvent(new dom.window.Event("click"));
    const input = el.querySelector("#review-date");
    ok("move opens a date field", input !== null);
    input.value = day(120);
    el.querySelector('[data-review="save-move"]').dispatchEvent(new dom.window.Event("click"));
    const r = store.get("strategicGoal.review");
    ok("move records the new date", r.outcomes[0]?.choice === "moved" && r.outcomes[0]?.newDate === day(120),
       JSON.stringify(r.outcomes[0]));
    ok("the target date actually moved", store.get("strategicGoal.targetDate") === day(120));
    ok("targetSetAt is refreshed, so maturity restarts",
       typeof store.get("strategicGoal.targetSetAt") === "string" &&
       store.get("strategicGoal.targetSetAt") > iso(-1));
    ok("the legacy top-level date was NOT written", !store.get("targetDate"));
  }

  // Reshape, pre-filled.
  {
    const { el, store } = await mount(offCourseState());
    el.querySelector('[data-review="reshape"]').dispatchEvent(new dom.window.Event("click"));
    const what = el.querySelector("#review-what");
    ok("reshape pre-fills the person's existing words",
       what?.value === "Walk the Quantocks ridge with Jen", String(what?.value));
    ok("reshape pre-fills the existing date", el.querySelector("#review-when")?.value?.length === 10);
    what.value = "Walk the ridge with Jen and the dog";
    el.querySelector('[data-review="save-reshape"]').dispatchEvent(new dom.window.Event("click"));
    ok("reshape saves the new words",
       store.get("strategicGoal.targetDescription") === "Walk the ridge with Jen and the dog");
    ok("reshape records an outcome", store.get("strategicGoal.review").outcomes[0]?.choice === "reshaped");
  }

  // Never mind.
  {
    const { el, store } = await mount(offCourseState());
    el.querySelector('[data-review="move"]').dispatchEvent(new dom.window.Event("click"));
    el.querySelector('[data-review="cancel"]').dispatchEvent(new dom.window.Event("click"));
    ok("cancel returns to the offer", el.querySelector('[data-review="move"]') !== null);
    ok("cancel records NOTHING", store.get("strategicGoal.review").outcomes.length === 0);
    ok("cancel does not consume the throttle",
       store.get("strategicGoal.review").lastOfferedAt === null);
  }
}

// ── 7. The description invitation ───────────────────────────────────
section("7. A date with no words gets an invitation, not an error");
{
  const st = offCourseState();
  delete st.strategicGoal.targetDescription;
  const { el, store } = await mount(st);
  const field = el.querySelector("#target-describe");
  ok("the invitation renders", field !== null);
  ok("it is a real label, not a placeholder",
     el.querySelector('label[for="target-describe"]') !== null);
  ok("it does not read as an error",
     !/error|missing|required|incomplete/i.test(txt(el)), txt(el).slice(0, 120));
  ok("no offer is made without the person's words",
     el.querySelector('[data-review="move"]') === null);

  field.value = "The Quantocks walk";
  el.querySelector('[data-review="save-describe"]').dispatchEvent(new dom.window.Event("click"));
  ok("it saves to strategicGoal", store.get("strategicGoal.targetDescription") === "The Quantocks walk");
  ok("it records NO outcome and does not touch the throttle",
     store.get("strategicGoal.review").outcomes.length === 0 &&
     store.get("strategicGoal.review").lastOfferedAt === null);
}

// ── 8. Accessibility ────────────────────────────────────────────────
section("8. WCAG 2.2 AA basics");
{
  const { el } = await mount(offCourseState());
  ok("the offer is a labelled group",
     el.querySelector('.my-programme-review[role="group"][aria-label]') !== null);
  el.querySelector('[data-review="move"]').dispatchEvent(new dom.window.Event("click"));
  ok("the date field has a real <label for>",
     el.querySelector('label[for="review-date"]') !== null);
  ok("every review control is a real button",
     [...el.querySelectorAll("[data-review]")].every(n => n.tagName === "BUTTON"));
}

console.log(`\n${"-".repeat(60)}`);
if (failures === 0) { console.log(`verify-hard1b: ${checks} checks, all green.`); process.exit(0); }
else { console.log(`verify-hard1b: ${failures} of ${checks} checks RED.`); process.exit(1); }
