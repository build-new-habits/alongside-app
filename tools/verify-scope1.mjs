/**
 * tools/verify-scope1.mjs
 * 08 Sep 2026 v1
 *
 * SCOPE-1. The app says what it is not for.
 *
 * Amy, the physiotherapist who reviewed it, closing her reply: "avoid
 * giving exercise advice to complex health groups where the risk is
 * higher like those mentioned CFS, long covid, EDS and people with
 * uncontrolled pain." On ME/CFS specifically: "exercise for this
 * population is out of the scope of an app... these people need support
 * and guidance from specialist teams."
 *
 * Graeme: "I agree. This is a generic app. Perhaps we should have in
 * onboarding or something about this, and that it isn't appropriate for
 * more serious conditions."
 *
 * ── SAID TWICE, DIFFERENTLY, AND THAT IS THE POINT ───────────────────
 *
 * 🔴 TERMS NAMES THE CONDITIONS. It is where somebody goes to find out
 * exactly what they are agreeing to, and vagueness there is unhelpful.
 *
 * 🔴 ONBOARDING NAMES NONE. A list of diagnoses in a conversation reads
 * as an exclusion notice -- somebody scanning for their condition,
 * finding it, and being told they are not welcome. It describes the
 * SITUATION instead: being treated for something, or living with a
 * condition where the wrong movement on the wrong day costs weeks.
 * Somebody in that position recognises themselves without being sorted
 * into a category.
 *
 * Both assertions below are therefore two-sided. Adding a condition list
 * to onboarding fails, and removing it from Terms fails.
 */
const _GATE_ROOT = new URL("../", import.meta.url);
const _gatePath = (p) => new URL(String(p).replace(/^\.\//, ""), _GATE_ROOT);

import { readFileSync } from "node:fs";

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

// Whitespace collapsed before matching. The Terms copy is wrapped in
// source, so "pain that is not under control" spans two lines and a
// literal regex misses it -- which it did, and the phrase was there all
// along.
const terms = readFileSync(_gatePath("js/views/privacy.js"), "utf8")
  .replace(/\s+/g, " ");
const onb   = readFileSync(_gatePath("js/data/onboarding-thread-data.js"), "utf8");

// The coach beat only — not the file's comments, which discuss the
// conditions at length and would satisfy any naive match.
const beat = (onb.match(/coach: "Right\. I think that's everything I need[^"]*/) || [""])[0];

console.log("\nTEST 1 - Terms name what the app is not for");

ok("1pc. positive control: the Terms section was found",
   /not a substitute for professional medical advice/.test(terms),
   "the medical disclaimer is gone entirely");

for (const [what, re] of [
  ["ME/CFS",              /ME\/CFS/],
  ["long COVID",          /long COVID/i],
  ["EDS and hypermobility", /Ehlers-Danlos|hypermobility spectrum/i],
  ["pain not under control", /not under control/i]
]) {
  ok(`1. Terms name ${what}`, re.test(terms),
     "the reviewing physiotherapist named this group specifically as one a " +
     "general app should not guide");
}

ok("1e. and says what to do instead",
   /specialist team|exercise professional/i.test(terms),
   "naming the limit without a direction leaves somebody nowhere");

console.log("\nTEST 2 - onboarding says it too, without naming a diagnosis");

ok("2pc. positive control: the closing beat was found",
   beat.length > 100, "the beat this test reads has moved or been renamed");

ok("2a. it says the app is not the right tool for some people",
   /not the right tool/i.test(beat),
   "onboarding is the only step every person reaches, whatever they " +
   "declared, and the last thing before the app starts suggesting movement");

ok("2b. and points at a person instead",
   /built for you by a person|someone qualified|your GP/i.test(beat),
   "a limit with no direction attached");

// 🔴 The two-sided half. A list here would read as an exclusion notice.
ok("2c. but names NO conditions",
   !/ME\/CFS|Ehlers|long COVID|hypermobility|fibromyalgia/i.test(beat),
   "a diagnosis list in a warm conversation reads as somebody being told " +
   "they are not welcome, and it goes stale. Terms is where the naming " +
   "belongs and it is done there");

console.log(fails === 0
  ? "\nSCOPE-1: all assertions pass\n"
  : `\nSCOPE-1: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
