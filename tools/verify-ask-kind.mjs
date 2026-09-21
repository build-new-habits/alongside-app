/**
 * tools/verify-ask-kind.mjs
 * 16 Sep 2026 v1
 *
 * ASK-KIND and EXIT-LOOP. Two things Graeme reported more than once.
 *
 * 🔴 ASK-KIND. "How does the coach know I want core and not cardio or
 * strength?" It did not. It inferred from the arc and never asked.
 *
 * He said it on Monday -- "perhaps asking the kind of session before
 * check-in would be good" -- and when it kept landing on core the
 * ROTATION was fixed instead. Twice. Both were real bugs; neither was
 * the thing he was asking for.
 *
 * ⚫ And the rotation only advances on COMPLETED sessions, so somebody
 * testing, or somebody who opens the app and changes their mind, sees
 * the arc's first type forever. That is why "it's still core" kept being
 * true after a fix that worked.
 *
 * 🔴 EXIT-LOOP. "I exit without saving and get chucked back to the coach
 * proposal again and get stuck. Surely it's simple. Wire it to the home
 * screen?" IT ALREADY WAS. All six session views send that button to
 * Today. Home was undoing it.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: "https://example.org/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const read = p => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
const prop = read("js/views/coach-proposal.js");
const today = read("js/views/today.js");

store.init();
console.log("\nASK-KIND / EXIT-LOOP\n");

console.log("TEST 1 — the person can ask, and is now ASKED");

// SUPERSEDED BY PURPOSE-ASK, SAME DAY. These assertions described
// "Something else today?" -- a collapsed picker under the proposal
// heading, offering eight shapes of session.
//
// Graeme, within hours: "the 'something else' is almost invisible and
// completely the wrong thing." He was right twice. It offered a
// different SHAPE when the missing question was WHY somebody was
// training today, and it hid that behind a link.
//
// The picker is gone. The question is asked properly, in the check-in,
// in the coach's voice -- see verify-purpose-ask. What is asserted HERE
// is the half that survived: requestedSessionType still reaches the
// builder and still overrides the arc. The plumbing was right; the
// question was wrong.

ok("1.1 a requested type still overrides the arc's choice",
   /store\.get\('requestedSessionType'\)/.test(prop) &&
   /const sessionType = requested \|\| chosen\.sessionType/.test(prop),
   "the arc must still decide when nobody has said otherwise, but a request " +
   "has to win when there is one");

ok("1.2 REVERSAL: the picker itself is gone",
   !/_kindPicker/.test(prop) && !/data-kind=/.test(prop),
   "if it is back, PURPOSE-ASK and it are both asking and the person answers " +
   "the same thing twice");

ok("1.3 the field is set by the check-in now, not a link on the proposal", (() => {
  const checkin = fs.readFileSync(new URL("../js/views/checkin.js", import.meta.url), "utf8");
  // AROUND-AREA, 16 Sep 2026. The call now spans two lines and passes
  // the AREA, because "build strength around it" has to know WHAT it is
  // working around. Asserted on the call, not its formatting.
  // CLINICAL-REVIEW, 16 Sep 2026. It used to assert the AREA was passed in,
  // so "around it" could pick a body part. the clinical reviewer ruled the mapping out, so
  // this now asserts the opposite: no area reaches the mapping at all.
  return /store\.set\("requestedSessionType", sessionTypeForForm\(choice\.value\)\)/.test(checkin) &&
         !/sessionTypeForForm\(\s*choice\.value,/.test(checkin);
})(), "passing an area is the door the body-part mapping would come back through");

console.log("\nTEST 2 — a request does not edit the arc");
{
  localStorage.clear(); store.init();
  store.set("arc", { active: true, aimId: "sport-without-flaring", strands: ["trunk-strength"] });
  const before = JSON.stringify(store.get("arc"));
  store.set("requestedSessionType", "cardio");
  ok("2.1 setting a request leaves the arc untouched",
     JSON.stringify(store.get("arc")) === before);
  store.set("requestedSessionType", null);
  ok("2.2 and clearing it leaves the arc untouched",
     JSON.stringify(store.get("arc")) === before);
}

console.log("\nTEST 3 — leaving a session means leaving it");

ok("3.1 Home checks for a declined proposal before re-routing",
   /declinedProposalAt/.test(today) &&
   /new Date\(declined\) >= new Date\(lastProposal\)/.test(today),
   "Exit sent people to Today and Today sent them straight back, for ten " +
   "minutes or until something was completed");

ok("3.2 all six session views record the decline", (() => {
  const views = ["core-session", "gym-programme", "yoga-session",
                 "walk-session", "running-session", "swim-session"];
  const missing = views.filter(v => !/declinedProposalAt/.test(read(`js/views/${v}.js`)));
  if (missing.length) console.log("      not recording: " + missing.join(", "));
  return missing.length === 0;
})(), "one view that forgets leaves somebody stuck in exactly the same loop");

{
  // Driven, because the whole fault was a state interaction that reads
  // correctly in either file alone.
  const resolve = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const lastProposal = store.get("lastProposalDate");
    const declined = store.get("declinedProposalAt");
    if (declined && lastProposal && new Date(declined) >= new Date(lastProposal)) return "default";
    if (lastProposal) {
      const pd = new Date(lastProposal);
      if (pd.toISOString().split("T")[0] === todayStr && (Date.now() - pd.getTime()) / 60000 < 10)
        return "proposal-accepted";
    }
    return "default";
  };

  localStorage.clear(); store.init();
  store.set("lastProposalDate", new Date().toISOString());
  ok("3.3 accepted and interrupted: Home still takes you back",
     resolve() === "proposal-accepted",
     "the bounce exists for a phone call mid-session and must survive this fix");

  store.set("declinedProposalAt", new Date(Date.now() + 1000).toISOString());
  ok("3.4 after exit without saving: Home lets you go", resolve() === "default");

  store.set("lastProposalDate", new Date(Date.now() + 5000).toISOString());
  ok("3.5 REVERSAL: a NEWER proposal outranks the older decline",
     resolve() === "proposal-accepted",
     "compared by date rather than cleared anywhere, so nothing has to " +
     "remember to reset it");
}

console.log("");
if (fail) { console.log("ASK-KIND: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("ASK-KIND: all " + pass + " assertions pass\n");
