/**
 * tools/verify-capture.mjs
 * 28 Sep 2026 v3
 *
 * v3 - SMOOTH-P3c. capture.js v2 is "Make it up as I go": sets are logged
 *   on the move card itself, so there is no longer a player to walk a
 *   move through. TEST 2's two targets per result ("walk the card" /
 *   "just log it") therefore RETIRE; what they protected -- no mode, a
 *   choice made per move in the moment -- is kept as 2.1-2.3: one tap
 *   picks the move, the how-to is folded into its card, no mode toggle.
 *   TEST 3's recents now come from the lift log and the exercise history
 *   and are kit-filtered (heading "Recently"); every property is kept.
 *   TEST 4b's anchors follow the new markup. Behaviour is driven in
 *   verify-freestyle.
 *
 * v2 - SMOOTH-P3a. The Your own room left Plan Home; capture is now the
 *   third door, "Make it up as I go". 5.2 finds that door and its route;
 *   5.3 pins the rule it guarded -- no extra card grammar on Home -- on
 *   the doors: exactly three, so a fourth is a decision, not a drift.
 *
 * 16 Sep 2026 v1
 *
 * CAPTURE-1. Build as you go, or log what you just did.
 *
 * Graeme: "I'm in the gym, I did a thing, record it" -- and the other
 * half, "I want to do..... I'll guide you. But the selection needs to be
 * quick and easy."
 *
 * ⚫ ONE FEATURE, TWO DOORS. The picker result carries both answers, so
 * "do I know this one or not" is chosen per exercise rather than asked
 * as a mode. That is the assertion that matters most here: a mode would
 * pass a test for "capture exists" and fail the person at the machine.
 *
 * 🔴 AND IT COUNTS IN FULL. Graeme, asked whether a captured session
 * should count as much as a proposed one: "I'd say full too." So this
 * writes the same record every other session writes, and the arc credits
 * it without knowing where it came from.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><html><body><div id="main-content"></div></body></html>',
  { url: "https://example.org/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const cap = await import(B + "views/capture.js");

// v3: recents are kit-filtered and this fixture declares no kit, so the
// fixture moves are bodyweight ones.
const BW = EXERCISES.filter(e => !(e.equipment || []).length);
const EX = BW[0];
const acked = () => Array.from({ length: 5 }, () => ({
  at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture"
}));
function reset({ ack = true } = {}) {
  localStorage.clear(); store.init();
  if (ack) store.set("safetyAckLog", acked());
}

store.init();
console.log("\nCAPTURE-1\n");

console.log("TEST 0 — FIXTURE REACH: the picker renders something to pick");
reset();
store.set("exerciseHistory", { [EX.id]: { n: 2, last: new Date().toISOString() } });
const html = cap.render();
ok("0.1 the view renders", html.length > 300);
ok("0.2 with a search field, focused on open by onMount", /id="cap-search"/.test(html));
ok("0.3 and a recent movement to tap", html.includes(EX.name),
   "every assertion about the row below needs a row to exist");

console.log("\nTEST 1 — the safety gate stands before the first movement");
{
  reset({ ack: false });
  const gated = cap.render();
  ok("1.1 with no acknowledgement, the gate renders INSTEAD of the picker",
     /data-safety-gate/.test(gated) && !/id="cap-search"/.test(gated),
     "a capture session has no list until somebody makes one, so the gate is " +
     "the only thing standing before the first movement");
  reset();
  ok("1.2 REVERSAL: acknowledged, the picker renders",
     /id="cap-search"/.test(cap.render()));
}

console.log("\nTEST 2 — one tap picks a move; no mode");
{
  reset();
  store.set("exerciseHistory", { [EX.id]: { n: 1, last: new Date().toISOString() } });
  const h = cap.render();
  ok("2.1 a result is one button that picks the move", new RegExp(`data-pick="${EX.id}"`).test(h));
  const src = fs.readFileSync(new URL("../js/views/capture.js", import.meta.url), "utf8");
  ok("2.2 the how-to is folded into the move card, not a second screen",
     /<details class="fs-how">/.test(src) && !/router\.navigate\("workout"\)/.test(src));
  ok("2.4 REVERSAL: there is no mode toggle anywhere",
     !/captureMode|data-mode=|setMode\(/.test(src),
     "a mode would satisfy 'capture exists' and fail the person at the machine");
}

console.log("\nTEST 3 — recents read the REAL shape of exerciseHistory");
{
  // 🔴 exerciseHistory is a MAP { [id]: { n, first, last, best } }, not an
  // array. The first draft walked it backwards as an array, which would
  // have returned nothing for every user forever -- the same dead-branch
  // shape as STRETCH-WHY's two, caught by checking store.js.
  reset();
  const a = BW[0], b = BW[1];
  store.set("exerciseHistory", {
    [a.id]: { n: 1, last: "2026-09-01T10:00:00.000Z" },
    [b.id]: { n: 1, last: "2026-09-15T10:00:00.000Z" }
  });
  const h = cap.render();
  ok("3.1 both recents appear", h.includes(a.name) && h.includes(b.name));
  ok("3.2 most recent first", h.indexOf(b.name) < h.indexOf(a.name),
     "in a gym you repeat yourself; the last thing you did is the likeliest " +
     "next tap");
  ok("3.3 REVERSAL: an empty history shows no Recent heading", (() => {
    reset();
    return !/>Recently</.test(cap.render());
  })(), "a heading over an empty list tells somebody the app expected " +
        "something of them that has not happened");
  ok("3.4 an id no longer in the library is dropped, not rendered blank", (() => {
    reset();
    store.set("exerciseHistory", { "gone-from-library": { n: 1, last: new Date().toISOString() } });
    return !/>Recently</.test(cap.render());
  })());
}

console.log("\nTEST 4 — it counts in full, through the ordinary path");
{
  const src = fs.readFileSync(new URL("../js/views/capture.js", import.meta.url), "utf8");
  ok("4.1 finishing writes lastFinishedSession",
     /store\.set\("lastFinishedSession"/.test(src),
     "the same handoff every other session writes, so the arc credits it " +
     "without knowing where it came from");
  ok("4.2 and calls logActivity, the single write path",
     /store\.logActivity\(/.test(src));
  ok("4.3 the movements carry affectsAreas, so the BODY channel credits",
     /affectsAreas/.test(src),
     "without areas a captured session could only ever credit the capability " +
     "channel, and half of Graeme's arc would stay dark");
  // v3: scoped to what is WRITTEN (saveSession). The ideas list asks the
  // builder's pool for a full-body shape, which is a question, not a claim.
  const saveSrc = src.slice(src.indexOf("export function saveFreestyle"), src.indexOf("function _end"));
  ok("4.4 sessionType is NOT invented for a captured session",
     saveSrc.length > 200 && !/sessionType:\s*["'](core|full|upper|lower|stretch|mobility|cardio|glute)["']/.test(saveSrc),
     "a captured set of movements is not one of the builder's eight types, " +
     "and claiming one would light an arc strand nothing earned");
}

console.log("\nTEST 4b — CAPTURE-2: asking is not inventing");

{
  const src = fs.readFileSync(new URL("../js/views/capture.js", import.meta.url), "utf8");

  ok("4b.1 the kind question exists and is optional",
     /What was this, roughly\?/.test(src) && /Optional</.test(src),
     "CAPTURE-1 credited the body channel only, so a captured session could " +
     "never light a capability strand -- 18 of the 30 in the library");

  ok("4b.2 it is asked LAST, after the movements", (() => {
    return src.indexOf('class="fs-next"') > -1 && src.indexOf('class="fs-next"') < src.lastIndexOf("What was this, roughly?");
  })(), "somebody cannot say what a session was before they have done it, and " +
        "asking first turns a picker into a form");

  ok("4b.3 sessionType is set ONLY when they said so",
     /if \(kind\) session\.sessionType = kind;/.test(src),
     "absent otherwise, exactly as CAPTURE-1 shipped it -- nothing claims a " +
     "kind of work that was never declared");

  const saveSrc4 = src.slice(src.indexOf("export function saveFreestyle"), src.indexOf("function _end"));
  ok("4b.4 REVERSAL: nothing infers a kind from the movements",
     saveSrc4.length > 200 && !/sessionType:\s*["'](core|full|upper|lower|stretch|mobility|cardio|glute)["']/.test(saveSrc4),
     "inferring would light an arc strand on a guess; asking makes the answer " +
     "the person's, which is the same stated-not-inferred rule this app " +
     "applies everywhere else");

  ok("4b.5 an answer given by accident can be taken back",
     /kind === k\.dataset\.kind \? null :/.test(src),
     "otherwise the only way out of a mis-tap is to leave and start again");

  ok("4b.6 the state is carried for a screen reader, not by colour",
     /aria-pressed=/.test(src));

  ok("4b.7 \"Gym\" is not offered", !/id: "gym"/.test(src),
     "it describes WHERE, not what, and no arc strand leans on it");
}

console.log("\nTEST 5 — reachable, and not a fifth room");
{
  const today  = fs.readFileSync(new URL("../js/views/today.js", import.meta.url), "utf8");
  const router = fs.readFileSync(new URL("../js/router.js", import.meta.url), "utf8");
  ok("5.1 the route is registered", /'capture':\s*\{\s*path: '\.\/views\/capture\.js'/.test(router));
  ok("5.2 reached from Home's third door, Make it up as I go",
     /door\('as-i-go', 'Make it up as I go'/.test(today) &&
     /data-action="as-i-go"\]'\)\s*\?\.addEventListener\('click', \(\) => router\.navigate\('capture'\)\)/.test(today));
  const doorsFn = today.slice(today.indexOf("function _planDoors"), today.indexOf("function _arcChip"));
  ok("5.3 REVERSAL: it is not a fourth door on Home",
     (doorsFn.match(/\$\{door\('/g) || []).length === 3,
     "three doors is spec 4.1. If a door is legitimately added, change this " +
     "line on purpose rather than loosening the count");
  ok("5.4 and its stylesheet is imported",
     /components\/capture\.css/.test(fs.readFileSync(new URL("../css/main.css", import.meta.url), "utf8")));
}

console.log("");
if (fail) { console.log("CAPTURE-1: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("CAPTURE-1: all " + pass + " assertions pass\n");
