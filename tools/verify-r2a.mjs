/**
 * tools/verify-r2a.mjs
 * 05 Nov 2026 v2
 *
 * v2 - P-27 TIDY (Graeme, 05 Nov: retire the twelve-week programme on the
 *   Plan). The event question lived on the Plan's chapter-end card, which is
 *   retired: section 1 now holds that the Plan is not asked; sections 3-6
 *   (recording an answer) retire with it. Section 2 (Free never asked)
 *   unchanged.
 *
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

// ── 1. The Plan is not asked either (P-27) ────────────────────────────
// Graeme, 05 Nov: retire the twelve-week programme on the Plan. Plan Home has
// no chapter-end card, so no event question; the date it saved was read by
// nothing the Plan can reach. Sections 3 to 6 (recording the answer) retire
// with it; archived as they were: BNH-Files Archive/P-27 TIDY.
section("1. P-27: the Plan is not asked (the chapter-end card is retired there)");
{
  const el = await mount(hingeState("personal"));
  ok("no event question on the Plan", el.querySelector('[data-event="open"]') === null && !/working towards/i.test(txt(el)), txt(el).slice(0, 120));
  ok("control: Plan Home rendered its doors", el.querySelectorAll(".path-door").length > 0);
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

console.log(`\n${"-".repeat(60)}`);
if (failures === 0) { console.log(`verify-r2a: ${checks} checks, all green.`); process.exit(0); }
else { console.log(`verify-r2a: ${failures} of ${checks} checks RED.`); process.exit(1); }
