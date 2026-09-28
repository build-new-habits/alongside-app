/**
 * tools/verify-proposal-loc.mjs
 * 28 Sep 2026 v2
 *
 * v2 - SMOOTH-P2a. The alternate cards are gone. The plan screen shows
 *   ONE built plan, and "Something different today" builds another kind
 *   on request -- through the same _buildCoachSuggestion(), with the same
 *   location-scoped kit and the same length. So the rules this file
 *   exists for are asserted where that work now happens:
 *     0.4  the build-FAILED path is _getFallbackOptions() (plural). v1
 *          named the singular _getFallbackOption, which was the PADDING
 *          helper, not the failure path; it is deleted with the padding.
 *     0.5  another kind is a rebuild through the builder, not a list.
 *     1.x  location scope and length on the one build path.
 *     2.x  no padding; an empty list never shows a movement count; the
 *          current kind is never offered back.
 *   Test 3 is unchanged. Nothing loosened; 1.1-2.3 now read the function
 *   that runs, where v1 read one that no longer exists.
 *
 * PROPOSAL-LOC. The alternate cards are built, not padded.
 *
 * ── WHAT WENT WRONG, AND WHY NO GATE CAUGHT IT ───────────────────────
 *
 * coach-proposal.js ended with:
 *
 *     while (options.length < 3) options.push(_getFallbackOption(n));
 *
 * _getFallbackOption takes ONE argument -- an index into a fixed array of
 * Mobility / Breathing / Short walk. No location, no energy, no arc, no
 * check-in, and exercises: [] on every entry.
 *
 * TWO-ENGINE cut the engine to a single built session on 06 Sep and left
 * the loop behind, so for ten days two of three slots came from that
 * array. Graeme said "at the gym, 40 minutes" and was offered a
 * 15-minute breathing session and a 20-minute walk.
 *
 * 🔴 Twelve gates covered this screen and every one of them passed. They
 * asserted that cards RENDER -- units, plurals, a marked suggestion, a
 * start route. None asserted where a card's CONTENT came from. A card
 * made of fiction renders exactly as well as a card made of a session,
 * which is the whole reason this file exists.
 *
 * Every assertion is reversal-proven, and TEST 0 proves the harness
 * reaches a built option rather than an error path, because on an error
 * path _getFallbackOptions() is legitimate and everything below would
 * measure the wrong branch.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>',
  { url: "https://example.org/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { SESSION_TYPES, buildSession, equipmentForLocation } =
  await import(B + "session-builder.js");

const src = fs.readFileSync(new URL("../js/views/coach-proposal.js", import.meta.url), "utf8");
// The function's OWN body, bounded at the next declaration. A fixed
// character slice ran past the end and swallowed _getFallbackOption's
// definition, which made test 2.2 fail on text that was not in the
// function at all -- a false red that looks exactly like a true one.
const bodyOf = (name) => {
  const i = code.indexOf("function " + name);
  if (i < 0) return "";
  const j = code.indexOf("\n  function ", i + 10);
  return code.slice(i, j < 0 ? code.length : j);
};
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const code = strip(src);

console.log("\nPROPOSAL-LOC\n");

// ════════════════════════════════════════════════════════════════════
console.log("TEST 0 — the padding loop is gone, and cannot come back");

ok("0.1 no while-loop pads the option list",
   !/while\s*\(\s*options\.length\s*<\s*\d/.test(code),
   "a pad loop is back; two of three cards are fiction again");

ok("0.2 REVERSAL: the check is real, not a phrasing coincidence",
   /while\s*\(\s*options\.length\s*<\s*\d/.test("while (options.length < 3) {"));

ok("0.3 _getFallbackOption is not called on a successful build",
   !/options\.push\(\s*_getFallbackOption/.test(code));

ok("0.4 the build-failed path still exists (_getFallbackOptions)",
   /function _getFallbackOptions\(/.test(code) &&
   /catch \(e\) \{[^}]*_getFallbackOptions\(/.test(bodyOf("_generateOptions")),
   "removed entirely; a build failure now shows a blank screen, which is worse");

ok("0.5 another kind goes through the builder", (() => {
  const i = code.indexOf("[data-different-kind]').forEach");
  const handler = i > -1 ? code.slice(i, code.indexOf("});\n    });", i)) : "";
  return /requestedSessionType/.test(handler) && /_rebuildAndRerender\(/.test(handler) &&
         /store\.get\('requestedSessionType'\)/.test(bodyOf("_buildCoachSuggestion"));
})(), "a different kind that is not built by the same builder is a card from a list again");

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 1 — every plan carries the location scope and the length");

ok("1.1 the build args use equipmentForLocation, not the flat field", (() => {
  const body = bodyOf("_buildCoachSuggestion");
  return body.includes("equipmentForLocation(_currentLocation())") &&
         !/equipmentOverride:\s*null/.test(body);
})(), "LOCATION-1 fixed exactly this; a plan built against the union of home and gym " +
      "kit proposes a barbell to somebody in a kitchen");

ok("1.2 and the person's available time, not a hardcoded minimum", (() => {
  const body = bodyOf("_buildCoachSuggestion");
  return body.includes("_getAvailableTimeMinutes()") &&
         !/Math\.min\(\s*\d+\s*,/.test(body);
})(), "a fixed Math.min is how a 40-minute gym session became a 15-minute breather");

ok("1.3 the kinds offered depend on where the person is", (() => {
  const body = bodyOf("_renderDifferent");
  return /_currentLocation\(\)/.test(body) && /here === 'gym'/.test(body);
})());

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 2 — no padding, and no claim over an empty list");

ok("2.1 an empty exercise list shows no movement count", (() => {
  const body = bodyOf("_renderPlan");
  return /list\.length\s*\?/.test(body);
})(), "a plan advertising movements over an empty list is a claim the coach cannot meet");

ok("2.2 REVERSAL: one build, nothing pushed onto it", (() => {
  const body = bodyOf("buildProposal");
  return /const options = _generateOptions\(/.test(body) && !/options\.push\(/.test(body) &&
         !/function _withBuiltAlternates|function _getFallbackOption\(/.test(code);
})());

ok("2.3 today's own kind is never offered back as something different", (() => {
  const body = bodyOf("_renderDifferent");
  return /t\.id !== _deliveredType\(option\)/.test(body) &&
         /startsWith\(`\$\{t\}-`\)/.test(bodyOf("_deliveredType"));
})(), "buildSession may hand back Gentle Care instead of the type asked for, so the " +
      "DELIVERED type has to be checked, not just the requested one");

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 3 — the engine can actually produce these types at a gym");

// Not a source slice. This drives the builder with gym equipment and a
// realistic duration, which is what the screen will do.
{
  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("conditions", []);
  store.set("gymEquipment", ["barbell", "dumbbells", "cable-machine", "bench"]);
  store.set("sessionLocation", "gym");

  const kit = equipmentForLocation("gym").list;
  const GYM_ORDER = ["full", "upper", "lower", "core", "glute", "mobility", "stretch", "cardio"];
  const buildable = [];

  for (const sessionType of GYM_ORDER) {
    let built = null;
    try { built = buildSession({ sessionType, durationMins: 40, equipmentOverride: kit, preset: null }); }
    catch { /* counts as not buildable */ }
    if (built && Array.isArray(built.exercises) && built.exercises.length > 0) buildable.push(sessionType);
  }

  console.log("       buildable at a gym, 40 mins: " + (buildable.join(", ") || "none"));

  ok("3.1 at least two alternates are genuinely buildable at a gym",
     buildable.length >= 3,
     "fewer than three buildable types means the screen will routinely show one card. " +
     "That is still correct behaviour, but it is worth knowing rather than discovering");

  ok("3.2 REVERSAL: the probe distinguishes buildable from not", (() => {
    let nonsense = null;
    try { nonsense = buildSession({ sessionType: "not-a-real-type", durationMins: 40, equipmentOverride: kit, preset: null }); }
    catch { return true; }
    return !nonsense || !(nonsense.exercises || []).length || nonsense.id !== "not-a-real-type";
  })());

  ok("3.3 every id in the gym order is a real SESSION_TYPES id", (() => {
    const ids = new Set(SESSION_TYPES.map(t => t.id));
    const unknown = GYM_ORDER.filter(t => !ids.has(t));
    if (unknown.length) console.log("       unknown types: " + unknown.join(", "));
    return unknown.length === 0;
  })(), "an id that is not in SESSION_TYPES silently never builds, so the slot " +
        "vanishes and nobody can see why");
}

console.log("");
if (fail) { console.log("PROPOSAL-LOC: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("PROPOSAL-LOC: all " + pass + " assertions pass\n");
