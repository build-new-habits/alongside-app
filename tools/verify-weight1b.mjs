/**
 * tools/verify-weight1b.mjs
 * 22 Aug 2026 v2
 * Section 7 added: the weight TARGET in My Programme, and the bands
 * running at set-time. Until this existed, validateWeightTarget() had
 * no caller anywhere -- the bands were correct and unreachable.
 *
 * 22 Aug 2026 v1
 *
 * WEIGHT-1b (Settings half) — the toggle, the display unit, the weight.
 *
 * MOUNTS SETTINGS AND READS THE DOM. Same standard as verify-hard1b.
 *
 * ── THE TWO THINGS THIS EXISTS TO CATCH ─────────────────────────────
 *
 * 1. THE UNIT. There is no conversion anywhere else in this codebase.
 *    The bands compare a rate against a threshold, so a stored value
 *    that is sometimes 80 and sometimes 176 lets any consumer that
 *    forgot to convert compare the wrong quantities — and the 3 lb/week
 *    refusal is the one place here where being wrong by a factor of 2.2
 *    is unacceptable. So: whatever unit somebody types in, KILOGRAMS is
 *    what gets stored, and changing the display unit must not change the
 *    stored number by a gram.
 *
 * 2. NO PROMPT. Frequent weighing is itself a risk behaviour. The entry
 *    point is passive — a control that is there when looked for, silent
 *    otherwise. No reminder, no badge, no empty state that reads as an
 *    unfinished task, and nothing on free at all.
 *
 * Run: node tools/verify-weight1b.mjs
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

const { store } = await import(`${REPO}/js/store.js`);
const { toKg } = await import(`${REPO}/js/data/weight-targets.js`);
const { SettingsView } = await import(`${REPO}/js/views/settings.js`);
const { MyProgrammeView } = await import(`${REPO}/js/views/my-programme.js`);
const { RATE_REFUSE } = await import(`${REPO}/js/data/weight-targets.js`);

async function mount(state) {
  localStorage.clear();
  localStorage.setItem("alongside_user", JSON.stringify(state));
  store.init();
  const el = document.createElement("div");
  document.body.appendChild(el);
  const v = SettingsView({ navigate() {} });
  (v.mount || v.render).call(v, el);
  await wait(80);
  // Settings opens on an INDEX of three rows, and the Profile panel sits
  // inside the section whose id is 'settings' -- not 'profile'. So it is
  // two clicks, not one.
  //
  // The first harness guessed [data-section="profile"], found nothing,
  // and reported "the toggle exists on the Plan: FAIL" against correct
  // code. Read the navigation, do not guess at it -- fourth fixture
  // fault of the day, same shape every time.
  el.querySelector('[data-section="settings"]')?.dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  el.querySelector('[data-panel="profile"]')?.dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  return el;
}

const base = (over = {}) => ({
  tier: "personal", name: "Test",
  consent: { given: true, at: new Date().toISOString() },
  onboarding: { complete: true },
  ...over
});

// ── 0. Positive control ─────────────────────────────────────────────
section("0. Positive control");
{
  const el = await mount(base());
  ok("settings rendered", txt(el).length > 40, txt(el).slice(0, 80));
  ok("the profile panel is reachable", el.querySelector("#settings-hormonal") !== null,
     "hormonal toggle is the neighbour the weight section sits beside");
}

// ── 1. Free sees nothing ────────────────────────────────────────────
section("1. Free sees nothing of it — not even locked");
{
  const el = await mount(base({ tier: "free" }));
  ok("no toggle", el.querySelector("#settings-weight-tracking") === null);
  ok("no mention of weight tracking", !/weight tracking/i.test(txt(el)), txt(el).slice(0, 120));

  // Showing somebody the shape of a feature they cannot use, on the
  // screen they opened to change their name, is pressure dressed as
  // information.
  ok("no locked row or upgrade prompt about weight",
     !/unlock|upgrade.*weight|weight.*the Plan/i.test(txt(el)));
}

// ── 2. Off by default ───────────────────────────────────────────────
section("2. Off by default, and nothing beneath it");
{
  const el = await mount(base());
  const toggle = el.querySelector("#settings-weight-tracking");
  ok("the toggle exists on the Plan", toggle !== null);
  ok("it is OFF", toggle?.getAttribute("aria-checked") === "false",
     String(toggle?.getAttribute("aria-checked")));
  ok("store default is false", store.get("weightTracking") === false);
  ok("no unit picker while off", el.querySelector("[data-weight-unit]") === null);
  ok("no weight field while off", el.querySelector("#settings-weight-now") === null);

  // The promise made in the toggle's own copy.
  ok("it promises never to ask", /never ask you to weigh yourself/i.test(txt(el)),
     txt(el).slice(0, 200));
  ok("nothing anywhere prompts a weigh-in",
     !/time to weigh|weigh in today|don't forget to weigh|remember to weigh/i.test(txt(el)));
}

// ── 3. Turning it on ────────────────────────────────────────────────
section("3. Turning it on reveals the controls");
{
  const el = await mount(base());
  el.querySelector("#settings-weight-tracking").dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("weightTracking is now true", store.get("weightTracking") === true);
  ok("the unit picker appears", el.querySelectorAll("[data-weight-unit]").length === 3);
  ok("the weight field appears", el.querySelector("#settings-weight-now") !== null);
  ok("kg is the default unit",
     el.querySelector('[data-weight-unit="kg"]')?.getAttribute("aria-checked") === "true");
}

// ── 4. THE UNIT — display only, kg always stored ────────────────────
section("4. Display unit never touches the stored value");
{
  const el = await mount(base({ weightTracking: true, weight: 80 }));

  // 80 kg shown three ways, from ONE stored number.
  ok("kg shows 80", Number(el.querySelector("#settings-weight-now")?.value) === 80,
     String(el.querySelector("#settings-weight-now")?.value));

  el.querySelector('[data-weight-unit="lb"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("the stored value is UNCHANGED by switching unit", store.get("weight") === 80,
     String(store.get("weight")));
  ok("lb shows about 176", Math.abs(Number(el.querySelector("#settings-weight-now").value) - 176.4) < 0.2,
     String(el.querySelector("#settings-weight-now").value));

  el.querySelector('[data-weight-unit="st"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("still unchanged after a second switch", store.get("weight") === 80);

  // Stone and pounds is a COMPOSITE, not a decimal with a label.
  const st = el.querySelector("#settings-weight-now");
  const lb = el.querySelector("#settings-weight-now-lb");
  ok("stone renders as two fields", st !== null && lb !== null);
  ok("stone reads 12", Number(st.value) === 12, String(st.value));
  ok("pounds reads 8 and never 14 or more",
     Number(lb.value) === 8 && Number(lb.value) < 14, String(lb.value));
  ok("both fields have accessible names",
     (st.getAttribute("aria-label") || "").length > 0 && (lb.getAttribute("aria-label") || "").length > 0);
}

// ── 5. Entry converts on the way IN ─────────────────────────────────
section("5. Whatever is typed, kilograms is what is stored");
{
  // Pounds in.
  let el = await mount(base({ weightTracking: true, weightUnit: "lb" }));
  el.querySelector("#settings-weight-now").value = "176.37";
  el.querySelector('[data-action="save-profile"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("176.37 lb stored as ~80 kg", Math.abs(store.get("weight") - 80) < 0.05,
     String(store.get("weight")));

  // Stone and pounds in.
  el = await mount(base({ weightTracking: true, weightUnit: "st" }));
  el.querySelector("#settings-weight-now").value = "12";
  el.querySelector("#settings-weight-now-lb").value = "8";
  el.querySelector('[data-action="save-profile"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("12 st 8 lb stored as ~79.8 kg", Math.abs(store.get("weight") - toKg({ st: 12, lb: 8 }, "st")) < 0.05,
     String(store.get("weight")));

  // Kilograms in.
  el = await mount(base({ weightTracking: true, weightUnit: "kg" }));
  el.querySelector("#settings-weight-now").value = "80";
  el.querySelector('[data-action="save-profile"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("80 kg stored as 80", Math.abs(store.get("weight") - 80) < 0.001, String(store.get("weight")));

  // Clearing removes it. Somebody deleting their weight is deleting it.
  el = await mount(base({ weightTracking: true, weightUnit: "kg", weight: 80 }));
  el.querySelector("#settings-weight-now").value = "";
  el.querySelector('[data-action="save-profile"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("clearing the field clears the value", store.get("weight") === null,
     String(store.get("weight")));
}

// ── 6. The toggle is the consent ────────────────────────────────────
section("6. Turning it off does not delete what was recorded");
{
  const el = await mount(base({ weightTracking: true, weight: 80 }));
  el.querySelector("#settings-weight-tracking").dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("tracking is off", store.get("weightTracking") === false);

  // Off means the coach stops using it, not that the person's own record
  // is destroyed. Deleting somebody's data because they closed a door is
  // not a safeguard.
  ok("the recorded weight survives", store.get("weight") === 80, String(store.get("weight")));
  ok("the controls are hidden again", el.querySelector("#settings-weight-now") === null);
}

// ── 7. The weight TARGET, and the bands at set-time ─────────────────
section("7. The weight target in My Programme");

const iso = d => new Date(Date.now() + d * 86400000).toISOString();

async function mountProgramme(over = {}) {
  localStorage.clear();
  localStorage.setItem("alongside_user", JSON.stringify({
    tier: "personal", name: "Test",
    consent: { given: true, at: new Date().toISOString() },
    onboarding: { complete: true },
    weightTracking: true, weightUnit: "kg", weight: 100,
    strategicGoal: {
      targetDescription: "Walk the Quantocks ridge with Jen",
      targetDate: iso(140), targetSetAt: iso(-60), setAt: iso(-60),
      weeklySessionTarget: 3, review: { lastOfferedAt: null, outcomes: [] }
    },
    ...over
  }));
  store.init();
  const el = document.createElement("div");
  document.body.appendChild(el);
  const v = MyProgrammeView({ navigate() {} });
  (v.mount || v.render).call(v, el);
  await wait(80);
  return el;
}

{
  // Hidden unless tracking is on. The Settings toggle is the consent.
  const off = await mountProgramme({ weightTracking: false });
  ok("no weight target while tracking is off", off.querySelector("#weight-target") === null);
  ok("no mention of a weight goal while off",
     !/weight you are aiming/i.test(txt(off)), txt(off).slice(0, 120));

  const on = await mountProgramme();
  ok("the field appears when tracking is on", on.querySelector("#weight-target") !== null);
  ok("it has a real <label for>", on.querySelector('label[for="weight-target"]') !== null);
  ok("it is offered, not demanded",
     /if you want one/i.test(txt(on)), txt(on).slice(0, 200));
  ok("nothing prompts a weigh-in",
     !/weigh yourself|time to weigh|remember to weigh/i.test(txt(on)));
}

{
  // A sustainable target: 100kg -> 92kg over 20 weeks is 0.4 kg/wk.
  const el = await mountProgramme();
  el.querySelector("#weight-target").value = "92";
  el.querySelector('[data-review="save-weight"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("a sustainable target is accepted",
     Math.abs(store.get("strategicGoal.targetValue") - 92) < 0.01,
     String(store.get("strategicGoal.targetValue")));
  ok("stored as kilograms", store.get("strategicGoal.targetUnit") === "kg");
  ok("the band is recorded for audit", store.get("strategicGoal.weightTargetBand") === "silent",
     String(store.get("strategicGoal.weightTargetBand")));
  ok("the legacy top-level targetWeight is NOT written", !store.get("targetWeight"));
}

{
  // THE REFUSAL. 100kg -> 70kg over ~4 weeks is far past RATE_REFUSE.
  const el = await mountProgramme({
    strategicGoal: {
      targetDescription: "Walk the ridge", targetDate: iso(28),
      targetSetAt: iso(-60), setAt: iso(-60), weeklySessionTarget: 3,
      review: { lastOfferedAt: null, outcomes: [] }
    }
  });
  el.querySelector("#weight-target").value = "70";
  el.querySelector('[data-review="save-weight"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);

  ok("an unsafe target is NOT stored", store.get("strategicGoal.targetValue") == null,
     String(store.get("strategicGoal.targetValue")));
  const note = txt(el.querySelector("#weight-target-note"));
  ok("the person is told why", note.length > 20, note);
  ok("it signposts outward", /GP|dietitian/i.test(note), note);
  ok("it declines the FIELD, not the person",
     /not a judgement/i.test(note), note);
  ok("it offers a way forward", /further out|open-ended/i.test(note), note);
  ok("the note is announced without stealing focus",
     el.querySelector("#weight-target-note")?.getAttribute("role") === "status");

  // Set-time may propose a DATE. It may not state a rate or a weight.
  ok("no rate stated", !/per week|a week|\/week/i.test(note), note);
  ok("no weight or shortfall stated", !/\d+(\.\d+)?\s*(kg|lb|st|pounds|stone)/i.test(note), note);
}

{
  // No current weight means no rate to judge -- and the coach does NOT
  // ask for one. Asking for a weigh-in is the thing it never does.
  const el = await mountProgramme({ weight: null });
  el.querySelector("#weight-target").value = "92";
  el.querySelector('[data-review="save-weight"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("the target is simply held", Math.abs(store.get("strategicGoal.targetValue") - 92) < 0.01);
  ok("no band is claimed without a rate", store.get("strategicGoal.weightTargetBand") === null);
  ok("it does not ask for a weigh-in",
     !/weigh yourself|enter your weight first|we need your weight/i.test(txt(el)));
}

{
  // THE TARGET MUST CONVERT TOO, and this was nearly missed.
  //
  // Every other assertion in section 7 enters kilograms, where
  // toKg(v,'kg') is a no-op -- so a reversal replacing the conversion
  // with Number(main.value) stayed GREEN. Exactly the gap the chip
  // test had: the fixture never used the case the code exists for.
  const lb = await mountProgramme({ weightUnit: "lb" });
  lb.querySelector("#weight-target").value = "202.83";   // ~92 kg
  lb.querySelector('[data-review="save-weight"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("a target entered in POUNDS is stored as kg",
     Math.abs(store.get("strategicGoal.targetValue") - 92) < 0.05,
     String(store.get("strategicGoal.targetValue")));

  const st = await mountProgramme({ weightUnit: "st" });
  ok("stone renders as a composite", st.querySelector("#weight-target-lb") !== null);
  st.querySelector("#weight-target").value = "14";
  st.querySelector("#weight-target-lb").value = "7";
  st.querySelector('[data-review="save-weight"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("a target entered in STONE AND POUNDS is stored as kg",
     Math.abs(store.get("strategicGoal.targetValue") - toKg({ st: 14, lb: 7 }, "st")) < 0.05,
     String(store.get("strategicGoal.targetValue")));
}

{
  // Clearing removes it.
  const el = await mountProgramme({
    weightTracking: true, weightUnit: "kg", weight: 100,
    strategicGoal: {
      targetDescription: "Walk the ridge", targetDate: iso(140),
      targetSetAt: iso(-60), setAt: iso(-60), weeklySessionTarget: 3,
      targetValue: 92, targetUnit: "kg",
      review: { lastOfferedAt: null, outcomes: [] }
    }
  });
  ok("an existing target is shown back", el.querySelector("#weight-target")?.value === "92",
     String(el.querySelector("#weight-target")?.value));
  el.querySelector("#weight-target").value = "";
  el.querySelector('[data-review="save-weight"]').dispatchEvent(new dom.window.Event("click"));
  await wait(80);
  ok("clearing removes the target", store.get("strategicGoal.targetValue") === null);
  ok("and clears the recorded band", store.get("strategicGoal.weightTargetBand") === null);
}

console.log(`\n${"-".repeat(60)}`);
if (failures === 0) { console.log(`verify-weight1b: ${checks} checks, all green.`); process.exit(0); }
else { console.log(`verify-weight1b: ${failures} of ${checks} checks RED.`); process.exit(1); }
