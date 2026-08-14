/**
 * tools/verify-safeguard.mjs
 * 13 Aug 2026 v1
 *
 * SAFEGUARD-1 — one voice wherever an exercise reaches its limit.
 *
 * Eleven rehabilitation entries carried a "stop" line and they were
 * phrased eleven different ways, because each was written by whoever was
 * writing that entry. Graeme, 13 Aug: the safeguards should say "I do
 * not recommend continuing if... I cannot give medical advice or
 * support. Please reach out to a human professional."
 *
 * THE SHAPE, and every part of it is load-bearing:
 *   1. the observable sign, in plain words
 *   2. stop
 *   3. the coach naming its own limit
 *   4. point outward, to a person
 *
 * TWO TIERS, differing only in time pressure:
 *   "please speak to someone today"      — time-critical
 *   "it's worth getting someone to look" — needs assessment, not urgent
 *
 * WHAT IS DELIBERATELY ABSENT. No condition is ever named, no 999, no
 * A&E, no ambulance. Two reasons and both matter. The Crisis &
 * Safeguarding Policy governs crisis language and is not signed off, so
 * borrowing its register here would pre-empt a decision that has not
 * been made. And naming a condition is a diagnosis — the coach's whole
 * position is that it cannot do that.
 *
 * The clinical review of 13 Aug supplied one red flag the app cannot
 * detect from any signal it holds (cauda equina: sudden bowel or bladder
 * change, saddle numbness). Graeme's reasoning for how to carry it: the
 * app should not interrogate people about it, but where an exercise is
 * a plausible setting for it, the stop line should say so plainly and
 * without alarm.
 */
import fs from "node:fs";

const { REHABILITATION } = await import("../js/data/exercises/rehabilitation.js")
  .then(m => ({ REHABILITATION: Object.values(m).find(v => Array.isArray(v)) }));

let fails = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (e) { fails++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
};
const ok = (c, m) => { if (!c) throw new Error(m); };

const allLines = REHABILITATION.flatMap(e =>
  (e.watchOut || []).map(w => ({ id: e.id, w })));

console.log("\nSAFEGUARD-1 — the limit is named, never a condition");

check("no crisis or emergency-service language", () => {
  // Not squeamishness. The Crisis & Safeguarding Policy owns this
  // register and is unsigned; using it here would settle a question
  // nobody has answered, and would blunt it where it is actually needed.
  const bad = allLines.filter(({ w }) =>
    /\b(999|A&E|accident and emergency|ambulance|emergency services)\b/i.test(w));
  ok(bad.length === 0,
     `emergency-service language found: ${bad.map(b => b.id).join(", ")}`);
});

check("no condition is named to the user", () => {
  // Naming one is a diagnosis, and the coach's whole position is that it
  // cannot diagnose. The clinician named these to US; the user gets the
  // observable sign instead.
  const named = /cauda equina|tendinopathy|hypertonic|prolapse|sciatica|discogenic|impingement/i;
  const bad = allLines.filter(({ w }) => named.test(w));
  ok(bad.length === 0,
     `a condition is named in user-facing copy: ` +
     bad.map(b => `${b.id} — "${b.w.slice(0, 60)}…"`).join(" | "));
});

console.log("\nSAFEGUARD-1 — every stop line follows the standard");

check("a stop line always names the coach's limit and points outward", () => {
  // Narrowed after a first version flagged fourteen lines, eleven of
  // them ordinary technique cues that merely use the word: "stop an inch
  // above it", "stop lower", "stop where the hips stay down". Those are
  // not safeguards and forcing the standard onto them would be absurd.
  //
  // The discriminator is the TRIGGER, not the verb. A safeguard fires on
  // a SYMPTOM — something the body is doing — where a technique cue
  // fires on a position. It found three genuine inconsistencies among
  // the noise, which is why it was narrowed rather than deleted.
  const SYMPTOM = /numbness|tingling|pins and needles|electric|burning|swelling|dizz|nausea|lightheaded|vision|headache|bladder|bowel|bulge|dragging|urgency|spasm|snap|limp|travels? further|point-tender|tender spot/i;
  const stops = allLines.filter(({ w }) => /\bstop\b/i.test(w) && SYMPTOM.test(w));
  ok(stops.length > 0, "no stop lines at all — the red flags have gone");
  const bad = stops.filter(({ w }) =>
    !/(can't give you medical support|past what I can help with)/i.test(w) ||
    !/(speak to someone|getting someone to look)/i.test(w));
  ok(bad.length === 0,
     `a stop line does not follow the standard — it must name the limit AND ` +
     `point to a person: ${bad.map(b => `${b.id} — "${b.w.slice(0, 70)}…"`).join(" | ")}`);
});

check("both urgency tiers are in use", () => {
  const today = allLines.filter(({ w }) => /speak to someone today/i.test(w)).length;
  const soon  = allLines.filter(({ w }) => /worth getting someone to look/i.test(w)).length;
  ok(today > 0, "no time-critical tier in use — everything reads as routine");
  ok(soon > 0, "no routine tier — everything reads as urgent, which is its own harm");
});

console.log("\nSAFEGUARD-1 — the one red flag the app cannot detect");

check("McKenzie extension carries the bladder and bowel line", () => {
  // The only red flag in the library that no signal the app holds could
  // ever surface: it develops DURING a course of ordinary back exercises
  // rather than being a state somebody arrives in. There is nothing
  // earlier for the coach to have noticed.
  const e = REHABILITATION.find(x => x.id === "mckenzie-extension");
  ok(e, "the McKenzie entry has gone missing");
  ok((e.watchOut || []).some(w => /bladder|bowel/i.test(w)),
     "the bladder and bowel stop line is absent from McKenzie Press-Up");
});

console.log("\nC1b — no entry falls back to shared boilerplate");

check("every entry has its own watchOut", () => {
  const thin = REHABILITATION.filter(e => !e.watchOut || e.watchOut.length < 3);
  ok(thin.length === 0,
     `${thin.length} entries have fewer than three watchOut lines: ` +
     thin.map(e => e.id).join(", "));

  // The original fault: one identical four-line block on all 94. A
  // generic "what to watch for" teaches nothing and trains people to
  // stop reading the block, which then costs the entries where it is
  // specific and genuinely matters.
  const counts = {};
  REHABILITATION.forEach(e => (e.watchOut || []).forEach(w => {
    counts[w] = (counts[w] || 0) + 1;
  }));
  const shared = Object.entries(counts).filter(([, n]) => n > 2);
  ok(shared.length === 0,
     `${shared.length} watchOut line(s) appear in more than two entries, which is ` +
     `boilerplate returning: ` +
     shared.slice(0, 3).map(([w, n]) => `${n}x "${w.slice(0, 50)}…"`).join(" | "));
});

check("difficulty is not a constant", () => {
  // All 94 carried difficultyLevel: 1 until 13 Aug. Present and wrong,
  // which defeats _difficulty()'s fallback -- that only fires when the
  // field is ABSENT. Difficulty is the capability ceiling, so this was
  // the most consequential data fault in the library.
  const levels = new Set(REHABILITATION.map(e => e.difficultyLevel));
  ok(levels.size >= 4,
     `only ${levels.size} distinct difficulty value(s) across 94 entries. ` +
     "A constant here silently defeats the capability ceiling");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
