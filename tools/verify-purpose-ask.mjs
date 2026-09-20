/**
 * tools/verify-purpose-ask.mjs
 * 16 Sep 2026 v1
 *
 * PURPOSE-ASK. The coach asks why, then recommends what.
 *
 * 🔴 THE COACH ASSUMED THE REASON WAS ALWAYS THE ARC, and three fixes
 * were made at the wrong level before that was understood: ALWAYS-CORE
 * (the rotation), PROPOSAL-LOC (the alternates), ASK-KIND ("something
 * else today?"). Each was a real bug. None was the question.
 *
 * Graeme, four times across five days, ending: "The coach still doesn't
 * ask what I want... there are lots of reasons to work out but the
 * coach never asks."
 *
 * ⚫ THIS GATE DRIVES THE ENGINE. Every failure this feature can have is
 * invisible in source: a recommendation that never fires reads exactly
 * like one that does. The first draft counted flags in the wrong
 * vocabulary and returned null for everybody -- found by running it with
 * twelve days of history, not by reading it.
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
const P = await import(B + "data/purpose.js");
const read = p => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");

function reset() { localStorage.clear(); store.init(); }
function flagHistory(condId, times, spacing = 4) {
  const h = {};
  for (let i = 1; i <= times * spacing; i += spacing) {
    h[new Date(Date.now() - i * 86400000).toISOString().split("T")[0]] =
      { conditionLevels: { [condId]: 5 } };
  }
  store.set("checkinHistory", h);
  store.set("conditions", [condId]);
  store.set("conditionPainScores", { [condId]: 5 });
}
function didSessions(types) {
  store.set("activityLog", types.map((t, i) => ({
    id: "e" + i, type: "workout", sessionType: t, status: "complete",
    completedAt: new Date(Date.now() - (i + 1) * 86400000).toISOString()
  })));
}

store.init();
console.log("\nPURPOSE-ASK\n");

console.log("TEST 0 — FIXTURE REACH: the engine can recommend at all");
reset(); flagHistory("lower-back", 3);
const hit = P.recommendation("niggle", "back-hips");
console.log("       " + (hit ? hit.formId + " \u2014 " + hit.reason : "nothing"));
ok("0.1 rich history produces a recommendation", !!hit,
   "the first draft returned null for everybody because it counted flags in " +
   "the wrong vocabulary -- every 'says nothing' assertion below would have " +
   "passed on that");
ok("0.2 with a reason attached", !!(hit && hit.reason && hit.reason.length > 20));

console.log("\nTEST 1 — day one says nothing");
{
  reset();
  ok("1.1 no history, no recommendation, for every purpose",
     ["arc", "niggle", "area", "general", "gentle"]
       .every(p => P.recommendation(p, "back-hips") === null),
     "the gold mark means 'I have a reason'. It must never mean 'I have to " +
     "pick something' -- that is every fitness app this exists as an " +
     "alternative to");

  reset(); didSessions(["core"]);
  ok("1.2 one session is not yet a pattern", P.recommendation("general", null) === null);
}

console.log("\nTEST 2 — it reasons from what was actually recorded");
{
  reset(); flagHistory("lower-back", 3);
  const r = P.recommendation("niggle", "back-hips");
  ok("2.1 three flags recommends working AROUND it", r.formId === "around");
  ok("2.2 and says how many times, and over what window",
     /3 times/.test(r.reason) && /fortnight/.test(r.reason));

  ok("2.3 it uses THEIR word for the area, not the app's bucket",
     /lower back/.test(r.reason) && !/back hips/.test(r.reason),
     "somebody flags 'lower back'; 'back and hips' is the coarse target the " +
     "app groups by. Saying the bucket back is the app talking about its own " +
     "taxonomy");

  reset(); flagHistory("lower-back", 2);
  ok("2.4 two flags recommends range of movement first",
     P.recommendation("niggle", "back-hips").formId === "mobility");

  reset(); didSessions(["core", "full", "upper"]);
  const g = P.recommendation("general", null);
  ok("2.5 strength without mobility is noticed", !!g && /mobility|stretch/.test(g.formId));
}

console.log("\nTEST 3 — the honesty rule");
{
  const src = read("js/data/purpose.js");
  const BANNED = ["needs", "weak", "ready for", "should be able", "your body",
                  "damaged", "imbalance", "dysfunction", "corrective"];
  const reasons = src.match(/reason: `[^`]+`/g) || [];
  console.log("       " + reasons.length + " reason strings checked");

  ok("3.1 at least one reason string exists to check", reasons.length >= 4);

  ok("3.2 no reason makes a diagnostic claim", (() => {
    const bad = reasons.filter(r => BANNED.some(w => new RegExp(w, "i").test(r)));
    if (bad.length) console.log("      offending: " + bad.join(" | ").slice(0, 200));
    return bad.length === 0;
  })(), "a physiotherapist would object, and correctly. Same rule as the " +
        "caution line on the cards");

  ok("3.3 REVERSAL: the word list would catch one", (() => {
    return BANNED.some(w => new RegExp(w, "i").test("reason: `this is what your body needs`"));
  })());
}

console.log("\nTEST 4 — the questions themselves");
{
  ok("4.1 five purposes, arc first",
     P.PURPOSES.length === 5 && P.PURPOSES[0].id === "arc");

  ok("4.2 \"just moving\" is a real answer, not a fallback", (() => {
    const g = P.PURPOSES.find(p => p.id === "gentle");
    return !!g && !/other|something else|fallback/i.test(g.label);
  })(), "it is the whole product for somebody not having a good day");

  ok("4.3 gentle skips the form question entirely",
     P.formsFor("gentle").length === 0,
     "having said 'just moving', being asked what form it takes is the app " +
     "not listening");

  ok("4.4 general offers cardio -- unreachable before this",
     P.formsFor("general").some(f => f.id === "cardio"));

  reset();
  store.set("conditions", ["lower-back"]);
  store.set("conditionPainScores", { "lower-back": 5 });
  ok("4.5 one flagged area: the where-question is SKIPPED",
     P.needsAreaQuestion("niggle") === false,
     "asking again when they answered three questions ago is the coach not " +
     "listening");

  store.set("conditions", ["lower-back", "shoulder"]);
  store.set("conditionPainScores", { "lower-back": 5, "shoulder": 5 });
  ok("4.6 two flagged areas: it asks which",
     P.needsAreaQuestion("niggle") === true);

  reset();
  ok("4.7 nothing flagged: it asks", P.needsAreaQuestion("niggle") === true);
  ok("4.8 'a particular area' ALWAYS asks", P.needsAreaQuestion("area") === true,
     "they are choosing something the check-in did not raise");
  ok("4.9 arc and general never ask",
     P.needsAreaQuestion("arc") === false && P.needsAreaQuestion("general") === false);
}

console.log("\nTEST 5 — it reaches the proposal, and ASK-KIND is gone");
{
  const prop = read("js/views/coach-proposal.js");
  const checkin = read("js/views/checkin.js");

  ok("5.1 the proposal line is driven by purpose",
     /purposeLine\(\)/.test(prop),
     "one screen, one line, four meanings -- not four screens");

  ok("5.2 \"Something else today?\" is removed",
     !/Something else today/.test(prop),
     "Graeme: 'almost invisible and completely the wrong thing'. It answered " +
     "a question that is now asked properly");

  ok("5.3 but its plumbing is kept as the form answer",
     /requestedSessionType/.test(prop),
     "the field was right; the question was wrong");

  ok("5.4 check-in asks and records the purpose",
     /todayPurpose/.test(checkin));

  reset();
  store.set("todayPurpose", "niggle");
  store.set("todayPurposeArea", "lower-back");
  store.set("requestedSessionType", "full");
  const line = P.purposeLine();
  console.log("       " + JSON.stringify(line));
  ok("5.5 the line names the reason they gave", !!line && /lower back/.test(line));

  // 🔴 The first draft read arc.aimLabel, a field that does not exist --
  // the arc stores aimId and the label comes from aimById(). So the arc
  // line always fell to the generic "your arc". Sixth dead branch of the
  // day, found by driving it.
  ok("5.5a the ARC line names the aim, not just 'your arc'", (() => {
    reset();
    store.set("arc", { active: true, aimId: "sport-without-flaring", strands: [] });
    store.set("todayPurpose", "arc");
    store.set("requestedSessionType", "strength");
    const l = P.purposeLine();
    return !!l && /back flaring up/.test(l);
  })(), "the aim is already the headline on Today; the proposal must use the " +
        "same words rather than a generic fallback");

  ok("5.5b REVERSAL: with no aim it still says something", (() => {
    reset();
    store.set("arc", { active: true, aimId: null, strands: [] });
    store.set("todayPurpose", "arc");
    const l = P.purposeLine();
    return !!l && l.length > 10;
  })());

  store.set("todayPurpose", "gentle");
  store.set("requestedSessionType", null);
  ok("5.6 and changes with the purpose", P.purposeLine() !== line);
}

console.log("\nTEST 5b — AROUND-AREA: the session follows the advice");
{
  // 🔴 Found by tracing, not by a test: the coach said "I'd build
  // strength around it rather than work it directly" and then handed
  // over FULL BODY, which loads the back like everything else. The
  // advice was right and the session did not follow it.
  ok("5b.1 a sore back builds the posterior chain, not full body",
     P.sessionTypeForForm("around", "lower-back") === "glute",
     "glutes and hamstrings doing the work so the back does not have to -- " +
     "which is what the reason text already promises");

  ok("5b.2 the coarse target resolves the same way",
     P.sessionTypeForForm("around", "back-hips") === "glute");

  ok("5b.3 sore hips or legs load the trunk instead",
     P.sessionTypeForForm("around", "hip") === "core" &&
     P.sessionTypeForForm("around", "hamstring") === "core");

  ok("5b.4 a sore shoulder loads the legs",
     P.sessionTypeForForm("around", "shoulder") === "lower");

  ok("5b.5 REVERSAL: it is NEVER the same as plain strength",
     ["lower-back", "hip", "shoulder"].every(a =>
       P.sessionTypeForForm("around", a) !== P.sessionTypeForForm("strength", a)),
     "if these agree, 'around it' has stopped meaning anything");

  ok("5b.6 an unknown area falls through rather than guessing at a body part",
     P.sessionTypeForForm("around", "not-a-real-area") === "full");

  ok("5b.7 and the line SAYS 'around it', not just 'strength'", (() => {
    reset();
    store.set("todayPurpose", "niggle");
    store.set("todayPurposeArea", "lower-back");
    store.set("todayForm", "around");
    return /around it/.test(P.purposeLine());
  })(), "flattening it to 'strength' loses the word that made the " +
        "recommendation worth giving");

  ok("5b.8 every form produces a sentence, not a label dropped into one", (() => {
    reset();
    store.set("todayPurpose", "niggle");
    store.set("todayPurposeArea", "lower-back");
    return ["around", "mobility", "stretch", "gentle"].every(f => {
      store.set("todayForm", f);
      const l = P.purposeLine();
      return l && !/asked for stretch it out|asked for move gently/.test(l);
    });
  })(), "the labels are verb phrases; 'asked for stretch it out' is what " +
        "happens when they are dropped into a noun slot");

  ok("5b.9 an area is named by its label, not its id", (() => {
    reset();
    store.set("todayPurpose", "area");
    store.set("todayPurposeArea", "back-hips");
    store.set("todayForm", "stretch");
    const l = P.purposeLine();
    return /back and hips/.test(l) && !/back hips/.test(l.replace("back and hips", ""));
  })(), "'back hips' is the app reading its own filing system aloud");
}

console.log("\nTEST 6 — a purpose is a fact about today");
{
  reset();
  store.set("todayPurpose", "general");
  store.set("todayPurposeArea", "back-hips");
  P.clearPurpose();
  store.set("todayForm", "around");
  P.clearPurpose();
  ok("6.1 clearPurpose empties all three fields",
     store.get("todayPurpose") === null && store.get("todayPurposeArea") === null &&
     store.get("todayForm") === null,
     "yesterday's reason is not a default");
}

console.log("");
if (fail) { console.log("PURPOSE-ASK: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("PURPOSE-ASK: all " + pass + " assertions pass\n");
