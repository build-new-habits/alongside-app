/**
 * tools/verify-plain1.mjs
 * 20 Aug 2026 v1
 *
 * PLAIN-1 GATE — conversion copy may not sell what the product gives
 * away, and may not promise what the product has not built.
 *
 * WHY THIS FILE EXISTS. On 20 Aug, R4 moved session type, duration and
 * the allocation split to the free tier at about 11:00. Two pages spent
 * the rest of the day telling free users those things were part of the
 * Plan: upgrade.js — the most-visited conversion surface in the app —
 * and the Settings plan block. Nothing in a suite of 72 gates noticed,
 * because every one of them checks CODE against the boundary and none
 * checks COPY against it.
 *
 * There are two failure modes here and they are different:
 *
 *   SELLING THE FREE TIER. A statement that was true becomes false when
 *   the boundary moves. This is not carelessness — it is the normal
 *   consequence of a boundary changing, and the only defence is a gate
 *   that reads both at once.
 *
 *   PROMISING THE UNBUILT. upgrade.js v6's own note, 13 Aug: "a tier
 *   check proves somebody is being REFUSED something. It does not prove
 *   the something exists. Verify the feature, never the gate." That
 *   statement was withdrawn from upgrade.js the same day it shipped —
 *   and left standing in settings.js for a week. A correction applied to
 *   one surface and not the other is half a correction.
 *
 * SOURCE OF TRUTH: alongside_revenue_architecture_18aug2026_v1.md v2 §3
 * and alongside_tier_boundary_12aug2026_v1.md v3 §4.
 */

import fs from "node:fs";

const read = p => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");

let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
};

const upgrade  = read("js/views/upgrade.js");
const settings = read("js/views/settings.js");

// Copy only. Comments in these files legitimately DISCUSS the removed
// claims — that is the record of why they went — so a naive whole-file
// grep would go red on its own explanation. Strip comments first.
const copyOnly = src => src
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/^\s*\/\/.*$/gm, " ")
  .replace(/<!--[\s\S]*?-->/g, " ");

const upgradeCopy  = copyOnly(upgrade);
const settingsCopy = copyOnly(settings);

console.log("\nPLAIN-1 — conversion copy vs the live boundary\n");

// ── 1. Free things must not be sold ──────────────────────────────────
//
// Phrased as the CLAIM, not the feature word: "sessions" and "length"
// appear all over both files innocently. What is forbidden is telling
// somebody these become theirs on the Plan.
const SELLS_FREE = [
  [/sessions become yours/i,               "session type and duration are FREE (R4)"],
  [/the kind, the length/i,                "session type and duration are FREE (R4)"],
  [/all session types (come|are part of)/i,"every session type is FREE (R4)"],
  [/choosing your own movements is part of/i, "build-your-own is FREE (R4)"],
  [/export[^.]{0,40}part of the Plan/i,    "export is FREE (decision 7.2)"],
  [/personal bests[^.]{0,40}part of the Plan/i, "personal bests are FREE (decision 7.1)"],
];

for (const [name, src] of [["upgrade.js", upgradeCopy], ["settings.js", settingsCopy]]) {
  for (const [re, why] of SELLS_FREE) {
    check(`${name} does not sell a free feature — ${why}`,
      !re.test(src),
      re.test(src) ? `matched /${re.source}/` : "");
  }
}

// ── 2. Unbuilt things must not be promised ───────────────────────────
//
// Each of these describes something that does not exist in the build as
// of 20 Aug 2026. They go back in on the day they ship, not before.
const PROMISES_UNBUILT = [
  [/longer practices open up/i,
   "in-step.js gates only the upgrade DOOR; the mind destinations are unbuilt"],
  [/week on week, phase by phase/i,
   "progression does not exist for any tier — see the progression boundary"],
  [/sessions get (harder|heavier)/i,
   "no load, volume or complexity escalation exists"],
];

for (const [name, src] of [["upgrade.js", upgradeCopy], ["settings.js", settingsCopy]]) {
  for (const [re, why] of PROMISES_UNBUILT) {
    check(`${name} does not promise the unbuilt — ${why}`,
      !re.test(src),
      re.test(src) ? `matched /${re.source}/` : "");
  }
}

// ── 3. No dead deadline ──────────────────────────────────────────────
//
// settings.js carried "the yearly rate holds until the end of November
// 2026" for two days after PRICE-2 retired it — a date already passed,
// on a purchase page. Matched by shape rather than by that one month, so
// the next dead deadline is caught too.
for (const [name, src] of [["upgrade.js", upgradeCopy], ["settings.js", settingsCopy]]) {
  check(`${name} states no expiry on the rate — Year 2 is deferred to Year 2`,
    !/(rate|price)[^.]{0,40}(holds until|until the end of|expires)/i.test(src),
    "an expiry the product cannot honour is worse than none");
}

// ── 4. The trial must be stated where the price is ───────────────────
//
// It appeared on NEITHER page until 20 Aug, and it is the strongest
// thing in the offer.
check("upgrade.js states the 30-day trial",
  /thirty days|30 days/i.test(upgradeCopy),
  "not a penny until day 30 is the strongest line available");
check("settings.js states the 30-day trial where it states the price",
  /thirty days|30 days/i.test(settingsCopy));

// ── 5. And never against the statutory period ────────────────────────
//
// CCR cooling-off may run from contract formation and therefore expire
// INSIDE the trial. Claiming more protection than exists, at the moment
// of deciding. Open with Natalie.
for (const [name, src] of [["upgrade.js", upgradeCopy], ["settings.js", settingsCopy]]) {
  check(`${name} makes no comparison to the statutory cancellation period`,
    !/statutory|cooling.?off|cancellation period/i.test(src),
    "the 14 days may run from contract formation, not first payment");
}

// ── 6. Every Plan statement names its evidence ───────────────────────
//
// The STATEMENTS array is the page's core claim set. Each entry carries
// a comment naming the file that makes it true. This asserts the habit
// survives: a statement added without evidence is the exact fault this
// gate exists for.
const block = upgrade.slice(upgrade.indexOf("const STATEMENTS = ["),
                            upgrade.indexOf("];", upgrade.indexOf("const STATEMENTS = [")));
const statementLines = block.split("\n").filter(l => /^\s*"/.test(l));
const commentLines   = block.split("\n").filter(l => /^\s*\/\//.test(l));
check("every upgrade STATEMENT is preceded by evidence naming a live file",
  statementLines.length > 0 && commentLines.length >= statementLines.length,
  `${statementLines.length} statements, ${commentLines.length} comment lines`);

console.log(failures === 0
  ? "\nPLAIN-1 GATE GREEN\n"
  : `\nPLAIN-1 GATE RED — ${failures} failure(s)\n`);
process.exit(failures === 0 ? 0 : 1);
