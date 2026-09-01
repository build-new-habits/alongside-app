/**
 * tools/verify-bypassdoor.mjs
 * 31 Aug 2026 v1
 *
 * BYPASS-DOOR, BYPASS-RED, SPLIT-ORDER.
 *
 * The fault these close was not that the severe bypass failed. It fired
 * correctly, every time, in both build functions. It fired at the END --
 * so at pain 8 somebody could walk the whole builder and hand-pick ten
 * exercises before being told the decision had been made before they
 * started. Correct behaviour, delivered at the wrong moment, reads as the
 * coach ignoring you.
 *
 * Assertion 2 is the one that matters most and is the least obvious: a
 * door you cannot walk back out of is a trap. Closing the builder's
 * backward routes was a consequence of adding the door, not a separate
 * feature, and it is the thing most likely to be broken by a later edit
 * that "tidies" the exit handlers.
 */
import fs from "node:fs";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
// HTML comments are stripped too. These files are template literals full
// of <!-- --> blocks, and a proximity assertion that counts comment text
// measures how much was explained, not how the code is shaped.
const strip = s => s
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/<!--[\s\S]*?-->/g, "");

const ui  = strip(fs.readFileSync("js/views/session-builder-ui.js", "utf8"));
const sb  = strip(fs.readFileSync("js/session-builder.js", "utf8"));
const css = fs.readFileSync("css/components/session-shared.css", "utf8");

console.log("\nTEST 1 - the question is asked at the door");

check("1a. severeZoneToday is exported and imported by the builder UI", () => {
  ok(/export function severeZoneToday/.test(sb), "severeZoneToday is not exported");
  ok(/import\s*{[^}]*severeZoneToday[^}]*}\s*from\s*"\.\.\/session-builder\.js"/.test(ui),
     "the builder UI does not import it");
});

check("1b. the check runs BEFORE the phase router", () => {
  const at    = ui.indexOf("export function render()");
  ok(at > -1, "no render()");
  const body  = ui.slice(at, at + 2200);
  const door  = body.indexOf("severeZoneToday()");
  const first = body.indexOf('phase === "type"');
  ok(door > -1, "render() never calls severeZoneToday()");
  ok(first > -1, "render() has no phase router");
  ok(door < first,
     "the door runs after the phase router, so the type picker renders first and " +
     "the person starts work that is already decided");
});

check("1c. the bypass still fires inside BOTH build functions", () => {
  // The door is an addition. A route that skips it must still be caught.
  const hits = (sb.match(/SEVERE_BYPASS_ENABLED\s*&&\s*!ignoreSevere/g) || []).length;
  ok(hits === 2,
     `the in-build bypass appears ${hits} times, expected 2 (buildSession and ` +
     `buildSessionFromSelection). The door does not replace it.`);
});

console.log("\nTEST 2 - the door is not a dead end");

for (const id of ["sb-rebuild-btn", "sb-back-btn"]) {
  check("2. " + id + " leaves the builder when the door is closed", () => {
    const at = ui.indexOf(`getElementById("${id}")`);
    ok(at > -1, "no handler for " + id);
    const body = ui.slice(at, at + 700);
    const guard = body.indexOf("gentleCare");
    ok(guard > -1,
       `${id} does not check gentleCare. Any backward step re-enters the door ` +
       `and lands straight back on this card -- a trap with no way out.`);
    const nav = body.indexOf('router.navigate("today")');
    ok(nav > -1 && nav > guard && nav - guard < 200,
       `${id} checks gentleCare but does not navigate away from the builder`);
  });
}

console.log("\nTEST 3 - the change is stated, not buried in prose");

check("3a. the Gentle Care card carries a distinct banner", () => {
  ok(ui.includes("sb-severe-banner"),
     "no banner; the explanation exists only inside the coach's paragraph, which is " +
     "what gets skimmed");
  const at = ui.indexOf("sb-severe-banner");
  const around = ui.slice(Math.max(0, at - 300), at);
  ok(around.includes("gentleCare"), "the banner is not conditional on gentleCare");
});

check("3b. it is styled, rose, and does not colour its own body text", () => {
  const at = css.indexOf(".sb-severe-banner {");
  ok(at > -1, "no .sb-severe-banner rule");
  const rule = css.slice(at, css.indexOf("}", at));
  ok(rule.includes("--color-danger"), "the banner does not use the danger token");
  ok(!/(^|[;{]\s*)color:\s*var\(--color-danger\)/.test(rule),
     "the banner body text is set in the accent colour; only the box should be rose");
  const body = css.slice(css.indexOf(".sb-severe-banner__body"), css.indexOf(".sb-severe-banner__body") + 220);
  ok(!body.includes("--color-danger"), "the body text depends on the accent for legibility");
});

check("3c. it announces as a note, not an alert", () => {
  const at = ui.indexOf("sb-severe-banner");
  const around = ui.slice(at - 200, at + 200);
  ok(around.includes('role="note"'), "the banner is not role=note");
  ok(!around.includes('role="alert"'),
     "role=alert interrupts whatever is being read and frames a deliberate decision " +
     "as an emergency");
});

console.log("\nTEST 4 - the choice that does not navigate comes first");

check("4. the split renders above the durations", () => {
  const at = ui.indexOf("function renderDurationPicker");
  ok(at > -1, "no renderDurationPicker");
  const body    = ui.slice(at, at + 4000);
  const presets = body.indexOf("ALLOCATION_PRESETS.map");
  const durs    = body.indexOf("DURATIONS.map");
  ok(presets > -1 && durs > -1, "a block is missing from the duration screen");
  ok(presets < durs,
     "the durations render first. Tapping one advances immediately, so anybody " +
     "reading top-down never reaches the split -- which is why 'Mostly strength' " +
     "appeared not to exist.");
});

check("4b. the split is rendered exactly once", () => {
  const n = (ui.match(/ALLOCATION_PRESETS\.map/g) || []).length;
  ok(n === 1, `the split block appears ${n} times; the old copy was not removed`);
});

console.log("\nTEST 5 - Stretch does not reserve a pulse-raiser slot");

check("5. stretch is excluded from the pulse-raiser rule", () => {
  const at = sb.indexOf("export function pulseRaiserDecision");
  ok(at > -1, "no pulseRaiserDecision");
  const body = sb.slice(at, at + 900);
  ok(body.includes('sessionType === "stretch"'),
     "Stretch still reserves a warm-up slot for a pulse raiser -- which is what put " +
     "Seated Punches in front of somebody who asked to stretch");
  const types = sb.slice(sb.indexOf('id:          "stretch"'), sb.indexOf('id:          "stretch"') + 900);
  ok(!types.includes("cardio-warmup"),
     "cardio-warmup is back in Stretch's warm-up; it is region-blind");
});

console.log(fails === 0
  ? "\nBYPASS-DOOR: all assertions pass\n"
  : "\nBYPASS-DOOR: " + fails + " FAILED\n");
process.exit(fails === 0 ? 0 : 1);
