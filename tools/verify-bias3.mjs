/**
 * tools/verify-bias3.mjs
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 20 Aug 2026 v1
 *
 * BIAS-3 — the generator must actually run.
 *
 * WHAT HAPPENED. BIAS-2 added coachBias() and consecutiveActiveDays() to
 * checkin.js as named exports and never added them to the `checkinData`
 * facade. workoutGenerator.js reaches that module ONLY through the
 * facade, so `checkinData.coachBias()` was undefined and calling it
 * threw — on the THIRD LINE of generateDailyOptions().
 *
 * Everything below that line was unreachable: detectBurnout(), the
 * menstrual cycle phase, programme phase bias, the difficulty floor,
 * condition-aware filtering. coach-proposal.js caught the throw and
 * served _getFallbackOptions() instead. Silently. Every session. Every
 * user. For every day BIAS-2 was live.
 *
 * AND verify-bias1.mjs WAS GREEN THE WHOLE TIME. It asserts the source
 * TEXT says `checkinData.coachBias()` is called, which was true — the
 * call was there, correct, and threw. A source-text gate cannot tell a
 * live call from a fatal one. This file executes.
 *
 * THE STRUCTURAL FAULT, which is what check 3 guards: two export styles
 * in one module. A named export looks complete on its own and is
 * invisible to the only caller that matters.
 */

// GATE-PATH, 21 Aug 2026. jsdom resolved through Node rather than by
// absolute path into one machine's node_modules.
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);

import fs from "node:fs";
const { JSDOM } = __require("jsdom");

const dom = new JSDOM("<!doctype html><div></div>",
  { url: "https://build-new-habits.github.io/alongside-app/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const BASE = new URL("../js/", import.meta.url).href;
const { store }       = await import(BASE + "store.js");
const { checkinData } = await import(BASE + "data/checkin.js");
const wgMod           = await import(BASE + "data/workoutGenerator.js");
const generator       = wgMod.workoutGenerator || wgMod.default;

let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
};

const fresh = () => { localStorage.clear(); store.init(); };

console.log("\nBIAS-3 — the generator must actually run\n");

// ── 1. THE BUG ITSELF ────────────────────────────────────────────────
fresh();
check("checkinData.coachBias is callable through the facade",
  typeof checkinData.coachBias === "function",
  "workoutGenerator reaches this module ONLY through the facade");
check("checkinData.consecutiveActiveDays is callable through the facade",
  typeof checkinData.consecutiveActiveDays === "function");

// ── 2. THE CONSEQUENCE — the whole generator, executed ───────────────
//
// This is the assertion that matters. Not "is the call present" but
// "does the function complete". Three scenarios, because a throw on
// line 3 would take all of them down identically.
for (const [label, seed] of [
  ["a cold-start user", () => {}],
  ["somebody mid-programme", () => {
    store.set("todayIntensity", "high");
    store.set("activeProgramme.currentWeek", 4);
  }],
  ["somebody three days in a row", () => {
    const d = n => new Date(Date.now() - n * 864e5).toISOString().split("T")[0];
    store.set("activityLog", [{ date: d(1) }, { date: d(2) }, { date: d(3) }]);
  }],
]) {
  fresh(); seed();
  let options = null, threw = null;
  try { options = generator.generateDailyOptions(); }
  catch (e) { threw = e.message; }
  check(`generateDailyOptions() completes for ${label}`,
    !threw && Array.isArray(options) && options.length > 0,
    threw ? `THREW: ${threw}` : `${options?.length ?? 0} options`);
}

// ── 3. THE STRUCTURAL GUARD ──────────────────────────────────────────
//
// Every function this module exports by name must ALSO be on the
// facade. Without this, the next function added the same way fails the
// same way — and it is invisible until something executes it.
{
  // FIRST DRAFT WAS THE WRONG SHAPE, and the gate said so on its first
  // run: it required EVERY named export to be on the facade, and
  // flagged getWordObject, getCoachPostureForQuadrant and
  // getOpeningModes. Those turned out to have zero callers anywhere —
  // dead exports, not facade bugs. A gate that fires on something
  // harmless gets suppressed, and then it is not there for the real
  // one.
  //
  // The contract is narrower and exact: every method any consumer
  // reaches THROUGH the facade must be ON the facade. That is precisely
  // how coachBias was lost, and it cannot false-positive.
  const src = fs.readFileSync(new URL("../js/data/checkin.js", import.meta.url), "utf8");
  const facadeBlock = src.slice(src.indexOf("export const checkinData = {"));
  const facade = facadeBlock.slice(0, facadeBlock.indexOf("};"));

  const jsDir = new URL("../js/", import.meta.url);
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(d =>
    d.isDirectory() ? walk(new URL(d.name + "/", dir))
                    : (d.name.endsWith(".js") ? [new URL(d.name, dir)] : []));

  const used = new Set();
  for (const f of walk(jsDir)) {
    if (f.pathname.endsWith("/data/checkin.js")) continue;
    const s = fs.readFileSync(f, "utf8");
    if (!/checkinData/.test(s)) continue;
    for (const m of s.matchAll(/checkinData\.(\w+)\s*\(/g)) used.add(m[1]);
  }

  const missing = [...used].filter(n => !new RegExp(`\\b${n}\\b`).test(facade));
  check("every method called through the checkinData facade is ON the facade",
    missing.length === 0,
    missing.length
      ? `MISSING: ${missing.join(", ")} — each of these throws at runtime, ` +
        "which is exactly how coachBias took the whole generator down"
      : `${used.size} facade methods called across the app, all present`);

  // Separate, and NOT a failure: exported by name, reached by nobody.
  // Reported so the orphan pattern this project keeps finding stays
  // visible rather than accumulating silently.
  const named = [...src.matchAll(/^export function (\w+)/gm)].map(m => m[1]);
  const orphans = named.filter(n => {
    if (new RegExp(`\\b${n}\\b`).test(facade)) return false;
    return !walk(jsDir).some(f =>
      !f.pathname.endsWith("/data/checkin.js") &&
      new RegExp(`\\b${n}\\b`).test(fs.readFileSync(f, "utf8")));
  });
  if (orphans.length) {
    console.log(`  NOTE  ${orphans.length} named export(s) with no caller and not on ` +
                `the facade: ${orphans.join(", ")} — not a failure, but the same ` +
                "orphan shape as sessionVariety and goalHasTarget");
  }
}

// ── 4. THE BIAS ACTUALLY BITES ───────────────────────────────────────
//
// Present-and-callable is not the same as working. coachBias returns
// 'lighter' after three consecutive days; resolveIntensity must act on
// it. Asserted through the facade, the way the generator calls it.
{
  fresh();
  const d = n => new Date(Date.now() - n * 864e5).toISOString().split("T")[0];
  store.set("activityLog", [{ date: d(1) }, { date: d(2) }, { date: d(3) }]);
  check("three consecutive days produces a 'lighter' bias",
    checkinData.coachBias() === "lighter",
    `got ${JSON.stringify(checkinData.coachBias())}`);
  check("and 'lighter' actually lowers a high intensity",
    checkinData.resolveIntensity("high", checkinData.coachBias()) === "moderate");

  fresh();
  check("one day is not a run — no bias",
    checkinData.coachBias() === null);
}

// ── 5. TODAY IS EXCLUDED FROM THE RUN ────────────────────────────────
//
// consecutiveActiveDays counts back from YESTERDAY. Somebody who has
// already moved today has not yet made it a longer run, and counting it
// would soften the very session they are about to do.
{
  // FIRST DRAFT SEEDED TODAY ALONE and was NOT caught by reversal: with
  // one entry the count is 0 either way, because the walk-back starts at
  // yesterday and stops immediately. The assertion was true for the
  // wrong reason.
  //
  // Seed a real run AND today, so including today would change the
  // number. That is the only shape that tests the exclusion.
  fresh();
  const day = n => new Date(Date.now() - n * 864e5).toISOString().split("T")[0];
  store.set("activityLog", [{ date: day(0) }, { date: day(1) }, { date: day(2) }]);
  check("today is excluded from the consecutive run",
    checkinData.consecutiveActiveDays() === 2,
    `got ${checkinData.consecutiveActiveDays()}, expected 2 (yesterday and the ` +
    "day before, not today) — counting today would soften the very session " +
    "they are about to do");

  // REVERSAL NOTE, and it corrected a wrong assumption. Removing the
  // `e.date < today` filter from consecutiveActiveDays does NOT change
  // this count — the walk-back starts at YESTERDAY and moves backwards,
  // so the cursor never visits today whatever the Set contains. The
  // filter is redundant defensive code; the CURSOR is what excludes
  // today. Reversing the cursor start does turn this red.
  //
  // Logged, not removed (touch-once): harmless, and its intent is
  // clearer than its effect.
}

console.log(failures === 0
  ? "\nBIAS-3 GATE GREEN — the generator runs\n"
  : `\nBIAS-3 GATE RED — ${failures} failure(s)\n`);
process.exit(failures === 0 ? 0 : 1);
