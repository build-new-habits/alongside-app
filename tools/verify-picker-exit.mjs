/**
 * tools/verify-picker-exit.mjs
 * 06 Sep 2026 v1
 *
 * PICKER-EXIT. "Build a different one" returns where the build started.
 *
 * ── WHY THIS GATE EXISTS AT ALL ─────────────────────────────────────
 *
 * The behaviour was already correct. The master schedule said it was
 * not -- it recorded the button as ending at Home, which BYPASS-DOOR had
 * already fixed and nobody reconciled. Graeme was annoyed it had not
 * been fixed; it had been, and the record kept telling him otherwise.
 *
 * A correct behaviour with no gate is one refactor away from being an
 * incorrect behaviour with no gate. Driving it under jsdom proved it
 * today. This holds it tomorrow.
 *
 * ── TWO TRAPS THIS GATE WAS BUILT OUT OF ────────────────────────────
 *
 * 1. THE LABEL AND THE NAVIGATION ARE SET IN DIFFERENT PLACES.
 *    session-builder-ui.js:1189 chooses the wording by ternary;
 *    :1857 does the actual routing. The first draft of this gate
 *    asserted only the label, and stayed GREEN with the Gentle Care
 *    exit deleted outright. It now spies on router.navigate and asserts
 *    where the person is actually sent.
 *
 * 2. "shoulders" IS A ZONE NAME, NOT A CONDITION ID.
 *    A Gentle Care fixture built as conditions:["shoulders"] with
 *    score 8 never reaches the branch -- severeZoneToday() returns
 *    null and the run quietly tests the ordinary path instead. Ninth
 *    recorded instance of a fixture missing the branch it names. The
 *    correct fixture is "lower-back" at 8, which returns "spine", and
 *    a reversal below pins that difference so it cannot come back.
 *
 * Three deliberate breaks, three caught red: exiting to Home instead of
 * the picker (the fault as originally logged), landing on duration and
 * skipping the picker, and removing the Gentle Care exit.
 */
import { JSDOM } from "jsdom";

const dom = new JSDOM('<!doctype html><html><body><div id="main-content"></div></body></html>',
  { url: "https://example.org/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c) => { if (c) { pass++; console.log("  ok   " + m); } else { fail++; fails.push(m); console.log("  FAIL " + m); } };
const reverses = (m, fn) => ok("[reversal] " + m, !fn());

const { store } = await import("../js/store.js");
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const click = el => el && el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const wait = ms => new Promise(r => setTimeout(r, ms));
const KIT = ["dumbbells", "bench"];
const ui = await import("../js/views/session-builder-ui.js");
// GYM-MIX-1, 12 Sep 2026. Was a hardcoded 8 in two places and broke the day
// a ninth session type shipped. Derived now, as verify-tiergh already does:
// the assertion is "every type has a tile", not "there are eight types".
const { SESSION_TYPES: _TYPES } = await import("../js/session-builder.js");
const paint = () => { document.getElementById("main-content").innerHTML = ui.render(); ui.onMount(); };

async function toPreview() {
  paint();
  click($$(".sb-type-tile").find(b => b.dataset.type === "full"));
  click($("#sb-location-continue-btn"));
  click($$(".sb-duration-btn").find(b => b.dataset.mins === "30"));
  click($("#sb-build-btn"));
  click($$(".sb-buildmode-btn").find(b => b.dataset.mode === "coach"));
  await wait(1400);
}

console.log("\nPICKER-EXIT — 'Build a different one' returns to the picker\n");
store.set("equipment", KIT); store.set("conditions", []); store.set("conditionPainScores", {});
await toPreview();
ok("the fixture reached the preview, not an earlier step", !!$("#sb-go-btn"));
const btn = $("#sb-rebuild-btn");
ok("the exit control is present", !!btn);
ok("it is labelled for building again, not for leaving", /different one/i.test(btn.textContent));
click(btn); await wait(200);
ok("it lands on the TYPE PICKER, where the build started", $$(".sb-type-tile").length === _TYPES.length);
ok("it does not linger on the preview", !$("#sb-go-btn"));
reverses("it does not skip ahead to duration", () => $$(".sb-duration-btn").length > 0);

console.log("\nPICKER-EXIT — at severe pain the honest exit is out of the builder\n");
store.set("conditions", ["lower-back"]); store.set("conditionPainScores", { "lower-back": 8 });
const SB = await import("../js/session-builder.js");
ok("FIXTURE REACHES THE BRANCH: severeZoneToday() returns a zone", SB.severeZoneToday() === "spine");
reverses("'shoulders' is a zone name, not a condition id (the fixture that misses)",
  () => { store.set("conditions", ["shoulders"]); store.set("conditionPainScores", { shoulders: 8 });
          const z = SB.severeZoneToday();
          store.set("conditions", ["lower-back"]); store.set("conditionPainScores", { "lower-back": 8 });
          return z !== null; });
await toPreview();
const gbtn = $("#sb-rebuild-btn");
ok("the Gentle Care preview was reached", !!gbtn);
ok("the label CHANGES to say where it actually goes",
  /back to today/i.test(gbtn.textContent));
reverses("it does not still offer to build a different one from a closed door",
  () => /different one/i.test(gbtn.textContent));

// The label is set by a SEPARATE ternary (line ~1189) from the navigation
// (line ~1857). Asserting the label alone would stay green with the exit
// itself removed -- so spy on the router and assert where it actually goes.
const { router } = await import("../js/router.js");
const navCalls = [];
const realNavigate = router.navigate;
router.navigate = (...a) => { navCalls.push(a[0]); };
click(gbtn); await wait(200);
router.navigate = realNavigate;
ok("it actually LEAVES the builder at severe pain", navCalls.includes("today"));
reverses("it does not drop the person back on the picker behind a closed door",
  () => $$(".sb-type-tile").length === _TYPES.length && navCalls.length === 0);

console.log("\n────────────────────────────────\n" + pass + " passed, " + fail + " failed");
if (fails.length) { fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("PICKER-EXIT green.\n");
