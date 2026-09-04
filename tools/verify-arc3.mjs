/**
 * tools/verify-arc3.mjs
 * 03 Sep 2026 v1
 *
 * ARC-3-SETUP. The four questions that build an arc.
 *
 * The model is decomposition, not SMART, and three of its four questions
 * are deliberate replacements. This gate holds the replacements in place,
 * because each of them is a small step from the thing it replaced and
 * would drift back under any pressure to look more rigorous:
 *
 *   "measurable" -> "how would you know it was happening?"  The answer is
 *   free text, never parsed, never checked. The moment anything measures
 *   it, it becomes a target and the person can be behind on it.
 *
 *   "relevant" -> "is this yours?"  For this audience an aim inherited
 *   from a doctor, a partner or an older self is the thing that gets
 *   abandoned. It is also the consent step when an arc is assigned.
 *
 *   "time-bound" -> DELETED. A date is a thing you fail on a Tuesday.
 *   Assertion 3 fails on any date anywhere in the flow.
 */
import fs from "node:fs";
import { AIMS } from "../js/data/aims.js";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const strip = t => t
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/<!--[\s\S]*?-->/g, "");

const v   = strip(fs.readFileSync("js/views/arc-setup.js", "utf8"));
const arc = strip(fs.readFileSync("js/views/stretch-arc.js", "utf8"));

console.log("\nTEST 1 - all four questions are asked");

check("1a. each of the four is present", () => {
  for (const q of ["What do you want to be able to do?",
                   "What feeds it?",
                   "How would you know it was happening?",
                   "Is this yours?"]) {
    ok(v.includes(q), `the flow never asks "${q}"`);
  }
});

check("1b. one question per screen", () => {
  const headings = (v.match(/class="as-question"/g) || []).length;
  ok(headings === 4, `${headings} question headings across four steps; each step must ask one thing`);
  ok(/step === 1 \?/.test(v) && /step === 3 \?/.test(v),
     "the steps are not rendered separately, so this is a form rather than a conversation");
});

console.log("\nTEST 2 - an aim is chosen, never guessed");

check("2a. the aim comes from the vocabulary", () => {
  ok(v.includes("AIMS.list"), "the aim list is not the authored vocabulary");
  ok(!/<input[^>]*id="as-aim"/.test(v),
     "the aim is free text. Nothing can turn free text into strands, so the arc would " +
     "never lean.");
});

check("2b. the aim is not pre-filled from the old goals", () => {
  ok(!/get\(["']goals["']\)/.test(v),
     "setup seeds the aim from the person's old goals. Upgrading should not reveal a " +
     "pre-filled arc \u2014 being asked IS the premium experience.");
});

check("2c. changing the aim clears the strands", () => {
  const at = v.indexOf("data-aim]");
  ok(at > -1, "no aim handler");
  const body = v.slice(at, at + 420);
  ok(/chosen = \[\]/.test(body),
     "strands survive an aim change, leaving an arc whose parts do not match \u2014 strands " +
     "belong to the aim that offered them");
});

console.log("\nTEST 3 - no dates, anywhere, ever");

check("3. nothing time-bound survives in the flow", () => {
  for (const bad of ["by when", "deadline", "target date", "how long", "weeks",
                     "months", "achieve by", "days left"]) {
    ok(!v.toLowerCase().includes(bad),
       `the flow says "${bad}". SMART's time-bound is the letter that must not survive ` +
       `translation \u2014 a date is a thing you fail on a Tuesday.`);
  }
});

console.log("\nTEST 4 - the marker is theirs, and is never measured");

check("4. free text, unparsed, skippable", () => {
  ok(v.includes("as-marker"), "there is no marker input");
  ok(/<textarea/.test(v), "the marker is not free text");
  // Look for the rendered CONTROL, not the id. Deleting the button left
  // its event handler behind, and `includes("as-skip-btn")` still
  // matched -- the assertion was measuring the listener rather than the
  // thing the person can press. Sixth time this session that a check has
  // measured the wrong region of a file.
  ok(/id="as-skip-btn"/.test(v),
     "the marker cannot be skipped. A question somebody cannot answer must not block them.");
  const store = strip(fs.readFileSync("js/store.js", "utf8"));
  const at = store.indexOf("marker:");
  ok(at > -1, "marker is not in the store");
  for (const bad of ["parseMarker", "markerScore", "markerProgress"]) {
    ok(!store.includes(bad) && !v.includes(bad),
       `something processes the marker ("${bad}"). It exists to be read back, not measured \u2014 ` +
       `measurement invites failure, noticing does not.`);
  }
});

console.log("\nTEST 5 - the cap holds in the interface, not just the data");

check("5. up to three, enforced where the person can see it", () => {
  ok(v.includes("AIMS.maxStrands"),
     "the cap is hardcoded in the view rather than read from the vocabulary, so the two " +
     "can disagree");
  ok(/chosen\.length < AIMS\.maxStrands/.test(v), "nothing stops a fourth strand being added");
  ok(/aria-live/.test(v), "the count is not announced, so a screen reader user cannot tell they are full");
  ok(v.includes("as-count"), "the person is never shown how many they have chosen");
});

console.log("\nTEST 6 - mind strands are labelled as what they are");

check("6. a strand that is not a movement says so", () => {
  ok(/kind === "mind"/.test(v),
     "mind strands are presented identically to physical ones. Somebody choosing three " +
     "things to work on should know one of them is not a movement before they pick it.");
});

console.log("\nTEST 7 - consent and provenance are recorded at acceptance");

check("7a. acceptance is a real step, not implied", () => {
  ok(v.includes("as-start-btn"), "no acceptance control");
  const at = v.indexOf('"#as-start-btn"');
  const body = v.slice(at, at + 900);
  ok(/acceptedAt:/.test(body), "acceptance is not recorded");
  ok(/provenance: "self"/.test(body),
     "provenance is not set. An assigned arc that looks self-set is a consent problem, and " +
     "retrofitting this into a live feature is the expensive version.");
});

check("7b. restarting the arc does not erase its history", () => {
  const at = v.indexOf('"#as-start-btn"');
  const body = v.slice(at, at + 900);
  ok(/arc\.startedAt \|\|/.test(body), "startedAt is overwritten, erasing the only history there is");
  ok(/arc\.zonesWorked \|\| \{\}/.test(body), "coverage dates are discarded on re-setup");
});

console.log("\nTEST 8 - the arc screen sends people through the questions");

check("8. an arc cannot start without an aim", () => {
  const at = arc.indexOf('"#sa-start-btn"');
  ok(at > -1, "no start control on the arc screen");
  const body = arc.slice(at, at + 500);
  ok(/aimId/.test(body) && /navigate\("arc-setup"\)/.test(body),
     "the arc can be switched on without an aim, which makes it a coverage tracker rather " +
     "than an arc \u2014 and skips the conversation that is the premium experience");
});

console.log(fails === 0
  ? "\nARC-3-SETUP: all assertions pass\n"
  : "\nARC-3-SETUP: " + fails + " FAILED\n");
process.exit(fails === 0 ? 0 : 1);
