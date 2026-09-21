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
  // CLINICAL-REVIEW: activity modification, not a treatment choice.
  ok("2.1 three flags recommends a LIGHTER session", r.formId === "lighter");
  ok("2.2 and says how many times, and over what window",
     /3 times/.test(r.reason) && /fortnight/.test(r.reason));

  ok("2.3 it uses THEIR word for the area, not the app's bucket",
     /lower back/.test(r.reason) && !/back hips/.test(r.reason),
     "somebody flags 'lower back'; 'back and hips' is the coarse target the " +
     "app groups by. Saying the bucket back is the app talking about its own " +
     "taxonomy");

  reset(); flagHistory("lower-back", 2);
  ok("2.4 two flags also recommends a lighter session, not a body-part choice",
     P.recommendation("niggle", "back-hips").formId === "lighter");

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

console.log("\nTEST 5b — CLINICAL-REVIEW: no body part is chosen for loading");
{
  // 🔴 the clinical reviewer, reviewing, 16 Sep 2026:
  //   "I would not support fixed mappings from a reported sore area to a
  //    specific training focus. A self-reported sore area does not
  //    provide enough information to determine what should or should
  //    not be loaded, and the wording risks being interpreted as
  //    rehabilitation advice."
  //
  // These assertions used to PROVE the mapping -- a sore back builds
  // glutes, a sore shoulder builds legs. They now prove it is gone, and
  // that nothing can bring it back quietly.
  const src = fs.readFileSync(new URL("../js/data/purpose.js", import.meta.url), "utf8");
  const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  ok("5b.1 the area-to-focus mapping is gone",
     !/AROUND_BY_AREA\s*=/.test(code),
     "it decided what to load from where somebody said they were sore");

  ok("5b.2 sessionTypeForForm takes no area",
     /export function sessionTypeForForm\(formId\)/.test(code),
     "an area parameter is the door the mapping would come back through");

  ok("5b.3 no option is labelled \"build strength around it\"",
     !/Build strength around it/.test(code));

  ok("5b.4 niggle options are activity modification -- her three, plus gentle",
     ["lighter", "general", "choose", "gentle"].every(id =>
       P.formsFor("niggle").some(f => f.id === id)));

  ok("5b.5 REVERSAL: no niggle option names a body part", (() => {
    const labels = P.formsFor("niggle").map(f => f.label).join(" ");
    return !/back|hip|shoulder|knee|glute|core|leg|arm|around|directly/i.test(labels);
  })(), "an option naming a part to load or to spare is the thing she ruled out");

  ok("5b.6 no reason advises working around, or not working, an area", (() => {
    const reasons = (code.match(/reason: `[^`]+`/g) || []).join(" ");
    return !/around it|work it directly|without loading it|rather than work/i.test(reasons);
  })(), "the clinical reviewer: 'avoid wording that says the app is strengthening around a " +
        "problem or advises users not to work an area directly'");

  // 🔴 CL-4. This assertion originally looked for the stop advice INSIDE
  // the recommendation reason -- and a recommendation only exists when
  // there is history. So it tested a design that left a FIRST-DAY user,
  // reporting a sore back with nothing recorded yet, with no stop advice
  // at all: the exact person it is for. The advice now stands alone and
  // is asserted as such.
  ok("5b.7 the stop-and-seek line names all three of the clinical reviewer's conditions",
     /Stop if it gets worse/.test(P.SAFETY_LINE) &&
     /keeps coming back/.test(P.SAFETY_LINE) &&   // persistent
     /getting worse/.test(P.SAFETY_LINE) &&       // worsening
     /worries you/.test(P.SAFETY_LINE) &&         // concerning
     /someone to look at it/.test(P.SAFETY_LINE),
     "the clinical reviewer: 'include clear advice to stop if symptoms increase and to seek " +
     "assessment for persistent, worsening, or concerning symptoms'");

  ok("5b.7a it is shown for a sore OR a particular area",
     P.needsSafetyLine("niggle") && P.needsSafetyLine("area"));

  ok("5b.7b REVERSAL: DAY ONE gets it too -- no history, no recommendation, still the line", (() => {
    reset();
    return P.recommendation("niggle", "lower-back") === null && P.needsSafetyLine("niggle");
  })(), "the first implementation only gave stop advice where there was history, " +
        "which left the first-day user with none");

  ok("5b.7c check-in actually renders it, independent of the recommendation",
     /if \(needsSafetyLine\(purposeId\)\) await _showCoachBubble\(SAFETY_LINE\)/
       .test(fs.readFileSync(new URL("../js/views/checkin.js", import.meta.url), "utf8")),
     "a constant nothing renders is the dead-branch pattern this session has " +
     "found five times");

  ok("5b.7d the recommendation does not repeat it straight after", (() => {
    reset(); flagHistory("lower-back", 1);
    const r = P.recommendation("niggle", "lower-back");
    return !r || !/stop if it gets worse/i.test(r.reason);
  })(), "two consecutive messages saying the same thing reads as the app not " +
        "listening to itself");

  ok("5b.8 a lighter answer lowers today's intensity",
     P.intensityForForm("lighter") === "low" && P.intensityForForm("gentle") === "low",
     "the first thing she named -- a lower-intensity session -- has to " +
     "actually change the session, not just the label");

  ok("5b.9 the line says what they asked for, not what is done to the area", (() => {
    reset();
    store.set("todayPurpose", "niggle");
    store.set("todayPurposeArea", "lower-back");
    store.set("todayForm", "lighter");
    const l = P.purposeLine();
    return /lighter session/.test(l) && !/around/.test(l);
  })());
}

console.log("\nTEST 5c — the SEVERE-pain screen, under the same principle");
{
  // Predates the clinical reviewer's review and was not in her pack, but falls squarely
  // under it. It said "What I can do is work around them" and promised
  // "I'll keep well clear of the affected area" -- a judgement a
  // self-report cannot support, in her words.
  const prop = fs.readFileSync(new URL("../js/views/coach-proposal.js", import.meta.url), "utf8");
  const sev  = prop.slice(prop.indexOf("function _buildSevereChoiceLine"),
                          prop.indexOf("function renderSevereChoice"));
  const btn  = prop.slice(prop.indexOf("function renderSevereChoice"),
                          prop.indexOf("function renderSevereChoice") + 1600);

  ok("5c.1 it no longer says it will work around the area",
     !/work around/i.test(sev.replace(/\/\/.*$/gm, "")),
     "the clinical reviewer: 'avoid wording that says the app is strengthening around a " +
     "problem or advises users not to work an area directly'");

  ok("5c.2 it no longer promises to keep clear of the area",
     !/keep well clear|keep clear of/i.test(btn),
     "the clinical reviewer: 'a self-reported sore area does not provide enough information " +
     "to determine what should or should not be loaded'");

  ok("5c.3 it offers something gentler, in her words",
     /asks less of the sore area/.test(btn),
     "her own phrase: 'a lower-intensity, general, or user-selected session " +
     "that reduces demand on the area concerned'");

  ok("5c.4 it now says STOP if it gets worse, not only 'see someone'",
     /safetyLineFor\(them\)/.test(sev),
     "it had half of CL-4 -- a pointer to someone who could look at it -- " +
     "and never said to stop. On the most serious screen, that was the half " +
     "that mattered most");

  ok("5c.5 and says it the same way as everywhere else",
     P.safetyLineFor("it") === P.SAFETY_LINE,
     "two wordings of the same safety advice would drift");

  ok("5c.6 plural reads correctly when more than one thing is named",
     /Stop if they get worse/.test(P.safetyLineFor("them")) &&
     /look at them\.$/.test(P.safetyLineFor("them")));
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
