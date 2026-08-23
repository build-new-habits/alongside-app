/**
 * tools/verify-r2a.mjs
 * 22 Aug 2026 v1
 *
 * R2-a — a dated target can only be recorded on the Plan.
 *
 * Not a change to the boundary. The boundary always said "free has
 * goals, the Plan has targets". The CODE had drifted: this hinge let a
 * free user record a dated target and My Programme displayed it back.
 *
 * Graeme, 22 Aug: it is the act of telling the coach your goal that is
 * the "I want you to do something with this" moment. Anyone is welcome
 * to own their goals on paper; the coach will not do anything with that.
 *
 * ── THE THREE THINGS THIS PROTECTS ──────────────────────────────────
 *
 * 1. Free cannot record a dated target — and is shown NO locked teaser.
 *    Free is complete in itself and limited in horizon. It is never
 *    degraded to create pressure, and a "the Plan can do this" prompt on
 *    the screen somebody opens every morning would be exactly that.
 *
 * 2. GOALS STAY FREE AND UNTOUCHED. programmes.js matches on them and
 *    workoutGenerator.js uses them for the session rationale. The
 *    drop-in coach DOES ask what you want to do; what he does not hold
 *    is where you are going and by when.
 *
 * 3. The copy claims only what R1 actually does. It used to say naming a
 *    date "changes nothing about how I work" — true when nothing read
 *    the date, false now that R1 does.
 *
 * Run: node tools/verify-r2a.mjs
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
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener(){}, removeEventListener(){},
                                addListener(){}, removeListener(){} });
dom.window.Element.prototype.scrollIntoView = function () {};

let failures = 0, checks = 0;
const ok = (label, cond, detail = "") => {
  checks++;
  if (cond) console.log(`  PASS  ${label}`);
  else { failures++; console.log(`  FAIL  ${label}${detail ? "  --  " + detail : ""}`); }
};
const section = n => console.log(`\n${n}`);
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el.textContent || "").replace(/\s+/g, " ").trim();

const src = fs.readFileSync(path.join(REPO, "js/views/today.js"), "utf8");
const { store } = await import(`${REPO}/js/store.js`);
const { TodayView } = await import(`${REPO}/js/views/today.js`);

/** State where the hinge SHOULD appear: one chapter done, never asked. */
function hingeState(tier) {
  return {
    tier,
    name: "Test",
    consent: { given: true, at: new Date().toISOString() },
    onboarding: { complete: true },
    goals: ["improve-cardio"],
    programme: { chaptersDone: ["ch1"], hingeOfferedAt: null },
    // The hinge only appears when a chapter is COMPLETE --
    // isHingePending() is (programmeId && completed). Found by reading
    // the guard rather than guessing at the fixture, after the first
    // version quietly rendered an ordinary Home screen and the gate
    // reported "the hinge renders: FAIL" against correct code.
    activeProgramme: { programmeId: "beginner-fitness", completed: true, currentWeek: 12 },
    strategicGoal: { weeklySessionTarget: 3, setAt: new Date().toISOString() }
  };
}

async function mount(state) {
  localStorage.clear();
  localStorage.setItem("alongside_user", JSON.stringify(state));
  store.init();
  const el = document.createElement("div");
  document.body.appendChild(el);
  const v = TodayView({ navigate() {} });
  (v.mount || v.render).call(v, el);
  await wait(120);
  return el;
}

// ── 0. Positive control ─────────────────────────────────────────────
section("0. Positive control — the fixture reaches the store");
{
  await mount(hingeState("personal"));
  ok("tier loaded", store.get("tier") === "personal", String(store.get("tier")));
  ok("chaptersDone loaded", (store.get("programme.chaptersDone") || []).length === 1);
  ok("no target yet", !store.get("strategicGoal.targetDate"));
}

// ── 1. The Plan sees the hinge ──────────────────────────────────────
section("1. The Plan is offered the question");
{
  const el = await mount(hingeState("personal"));
  ok("the hinge renders", el.querySelector('[data-event="open"]') !== null,
     txt(el).slice(0, 120));
}

// ── 2. Free sees nothing at all ─────────────────────────────────────
section("2. Free is not asked, and is not teased");
{
  const el = await mount(hingeState("free"));
  ok("no hinge control", el.querySelector('[data-event="open"]') === null);
  ok("no hinge text", !/working towards/i.test(txt(el)), txt(el).slice(0, 140));

  // The absence must be silent. A locked teaser on the morning screen
  // would be free degraded to create pressure.
  ok("no locked teaser about targets",
     !/unlock|upgrade to|the Plan can|with the Plan/i.test(txt(el)), txt(el).slice(0, 140));

  // ...and free keeps everything it had.
  ok("free still has its goals", (store.get("goals") || []).includes("improve-cardio"));
  ok("free still gets a session screen", txt(el).length > 40);
}

// ── 3. Recording a target ───────────────────────────────────────────
section("3. On the Plan, the answer is recorded properly");
{
  const el = await mount(hingeState("personal"));
  el.querySelector('[data-event="open"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);

  const what = el.querySelector("#hinge-event-what");
  const when = el.querySelector("#hinge-event-when");
  ok("both fields appear", !!what && !!when);
  ok("both have real <label for>",
     el.querySelector('label[for="hinge-event-what"]') !== null &&
     el.querySelector('label[for="hinge-event-when"]') !== null);

  what.value = "Walk the Quantocks ridge with Jen";
  when.value = "2026-12-20";
  el.querySelector('[data-event="save"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);

  ok("the description is stored",
     store.get("strategicGoal.targetDescription") === "Walk the Quantocks ridge with Jen");
  ok("the date is stored in strategicGoal",
     String(store.get("strategicGoal.targetDate")).startsWith("2026-12-20"));

  // The whole reason targetSetAt exists. setAt records when the weekly
  // FREQUENCY was agreed; using it for R1's maturity guard meant the
  // guard protected the wrong thing.
  const setAtDay = String(store.get("strategicGoal.targetSetAt")).slice(0, 10);
  ok("targetSetAt is written when the date is named",
     typeof store.get("strategicGoal.targetSetAt") === "string" && setAtDay.length === 10,
     String(store.get("strategicGoal.targetSetAt")));
  ok("targetSetAt is not the same field as setAt",
     store.get("strategicGoal.targetSetAt") !== store.get("strategicGoal.setAt"));

  ok("the legacy top-level date is NOT written", !store.get("targetDate"));
  ok("the question is not asked twice", !!store.get("programme.hingeOfferedAt"));
}

// ── 4. A description with no date ───────────────────────────────────
section("4. A description without a date is a real answer");
{
  const el = await mount(hingeState("personal"));
  el.querySelector('[data-event="open"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  el.querySelector("#hinge-event-what").value = "The wedding";
  el.querySelector('[data-event="save"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("the description is stored", store.get("strategicGoal.targetDescription") === "The wedding");
  ok("no date is invented", !store.get("strategicGoal.targetDate"));
  ok("targetSetAt is NOT written without a date",
     !store.get("strategicGoal.targetSetAt"), String(store.get("strategicGoal.targetSetAt")));
}

// ── 5. Declining still counts ───────────────────────────────────────
section("5. A question put and declined has still been put");
{
  const el = await mount(hingeState("personal"));
  el.querySelector('[data-event="open"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  el.querySelector('[data-event="cancel"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("nothing was recorded", !store.get("strategicGoal.targetDescription"));
  ok("but it is not asked again", !!store.get("programme.hingeOfferedAt"));
}

// ── 6. The copy ─────────────────────────────────────────────────────
section("6. The copy claims only what R1 actually does");
{
  const el = await mount(hingeState("personal"));
  const body = txt(el);

  // The old line was true when nothing read the date. R1 reads it now.
  ok("the false claim is gone", !/changes nothing about how I work/i.test(body));
  ok("it says the coach will speak to it", /harder ask than it needs to be/i.test(body),
     body.slice(0, 160));

  // Deliberately NOT "I'll build towards it": the programme does not
  // plan around the date and chapters are twelve weeks regardless.
  ok("it does not promise the programme plans around the date",
     !/build towards it|plan around|shape your programme around/i.test(body));
  ok("no banned vocabulary",
     !/\b(behind|on track|off track|failing|must)\b/i.test(body), body.slice(0, 160));

  // And nowhere in the file, so a future edit cannot quietly restore it.
  ok("the false claim is gone from the source too",
     !/changes nothing about how I work/.test(src));
}

console.log(`\n${"-".repeat(60)}`);
if (failures === 0) { console.log(`verify-r2a: ${checks} checks, all green.`); process.exit(0); }
else { console.log(`verify-r2a: ${failures} of ${checks} checks RED.`); process.exit(1); }
