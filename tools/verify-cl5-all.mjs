/**
 * tools/verify-cl5-all.mjs
 * 28 Sep 2026 v2
 *
 * v2 - F8. Test 3: every line of every guided class, same rules.
 *
 * 28 Sep 2026 v1
 *
 * Work list 10, CL-5-ALL. Every exercise description follows the
 * clinical principle, across the whole library.
 *
 * CL-5 (clinical direction, 16 Sep; decision record
 * Documents/Business/alongside_clinical_feedback_16sep2026_v3.md):
 * "simple movement cues, comfortable and controlled range, no single
 * fixed position or technique implied as right for everyone. Applies
 * throughout, not only to the nine."
 *
 * The 16 Sep work applied it to eight new exercises. The rest of the
 * library (568 entries) had never been checked. Measured on v559 under
 * the rules below: 122 sentences broke it, in five ways --
 *   fixed-angle  "knees bent at 90°", "right angles": a number stated
 *                as the one position, with no "about" and no way out
 *   must         "the lower back must stay flat": an instruction
 *   perfect      "perfectly upright", "completely still", "exactly
 *                where they are": one fixed position
 *   range        "as low as you can", "full range", "all the way down":
 *                a range pushed to the limit, not a comfortable one
 *   parallel     "thighs parallel to the floor": one right depth
 * All reworded in the house voice ("about", "roughly", "as far as is
 * comfortable", "keep ... steady"). None changes what the exercise is.
 *
 * WHAT A SCAN CANNOT DO. It finds the words; it cannot judge a cue. The
 * reworded sentences go to the clinical sign-off with the rest of the
 * wording, as the 16 Sep record asked ("goes back as a list, not a
 * pack"). This gate keeps the words from coming back.
 */
const B = new URL("../js/", import.meta.url).href;
const { EXERCISES } = await import(B + "data/exercises/index.js");

// CL-5 rules (shared by the probe and, verbatim, the gate)
const FIELDS = ["instructions","coaching","why","watchOut","description","cues","caution","coachNote","load"];
const Q = /\b(about|roughly|around|approximately|up to|no more than|no higher|or less|or more|or wherever|or higher|anywhere|only|comfortabl[ey])\b/i;
const RANGE_Q = /\b(comfortabl[ey]|only|while|without|keeping|control|steady|allows)\b/i;
const RULES = [
  { id: "fixed-angle", test: s => (/\b\d{1,3}\s*(°|-? ?degrees?\b)/i.test(s) || /\bright angles?\b/i.test(s)) && !Q.test(s),
    why: "a fixed angle, stated as right for everyone" },
  { id: "must", test: s => /\bmust\b/i.test(s), why: "an instruction, not a cue" },
  { id: "perfect", test: s => /\bperfectly (still|upright|level|straight|flat|aligned)\b|\bexactly where\b|\bcompletely still\b/i.test(s), why: "a single fixed position" },
  { id: "range", test: s => /as (low|deep|high|far|wide) as (you )?(can|possible)|all the way (up|down)|full range|maximum (range|depth|stretch)/i.test(s) && !RANGE_Q.test(s),
    why: "a range pushed to the limit, not a comfortable one" },
  { id: "parallel", test: s => /parallel (to|with) the floor/i.test(s) && !Q.test(s) && !/\btowards? parallel|halfway to parallel/i.test(s),
    why: "a depth target stated as the one right depth" },
];

// Not a body position: a temperature, the kit, a whole-trunk idea, a
// change of running direction. Each named, with its reason.
const EXEMPT = {
  "sauna-protocol.instructions[0]": "a sauna temperature, not a joint angle",
  "diaphragmatic-breathing-core.instructions[4]": "\"360-degree\" describes breathing all round the trunk",
  "drill-cutting-movement.instructions[2]": "a change of running direction in a sport drill",
};

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the scan reads the whole library");
const strings = [];
for (const e of EXERCISES) for (const f of FIELDS) {
  const v = e[f]; const arr = Array.isArray(v) ? v : (typeof v === "string" ? [v] : []);
  arr.forEach((t, i) => typeof t === "string" && strings.push({ where: `${e.id}.${f}${Array.isArray(v) ? `[${i}]` : ""}`, t }));
}
ok("0a. every entry, every descriptive field", EXERCISES.length > 500 && strings.length > 4000, `${EXERCISES.length} entries, ${strings.length} sentences`);

// ── 1. THE RULES CAN SEE WHAT THEY ARE FOR ──────────────────────────────
console.log("\nTEST 1 - REVERSAL: each rule catches the words it was written for, and passes the rewrite");
const SAMPLES = {
  "fixed-angle": ["Keep your right knee bent at 90° throughout", "Keep your right knee bent at about 90° throughout"],
  "must": ["The lower back must stay flat.", "Keep the lower back flat."],
  "perfect": ["keeping your torso perfectly upright", "keeping your torso tall"],
  "range": ["Lower slowly — as deep as possible", "Lower slowly — only as deep as you can control"],
  "parallel": ["Descend until thighs are parallel to the floor", "Lower until thighs are around parallel to the floor, or higher"],
};
for (const r of RULES) {
  const [bad, good] = SAMPLES[r.id];
  ok(`1.${r.id}: catches "${bad}", passes "${good}"`, r.test(bad) && !r.test(good));
}

// ── 2. THE LIBRARY ──────────────────────────────────────────────────────
console.log("\nTEST 2 - no description breaks CL-5");
for (const r of RULES) {
  const hits = strings.filter(s => r.test(s.t) && !EXEMPT[s.where]);
  ok(`2.${r.id}: none (${r.why})`, hits.length === 0, hits.slice(0, 8).map(s => `${s.where}: ${s.t.slice(0, 90)}`).join("\n        "));
}
const stale = Object.keys(EXEMPT).filter(w => !strings.some(s => s.where === w && RULES.some(r => r.test(s.t))));
ok("2x. every exemption still points at a sentence that needs it", stale.length === 0, stale.join(", "));

// ── 3. THE CLASSES ──────────────────────────────────────────────────────
// v2, F8. A class says the same things out loud that a card says in
// print, so the same principle applies to every screen, voice and
// lighter line in every class. Written when classes 008-010 were added.
console.log("\nTEST 3 - no class line breaks CL-5");
const { CLASSES } = await import(B + "data/classes/index.js");
const lines = CLASSES.flatMap(c => c.sections.flatMap(s => s.beats.flatMap((b, i) =>
  ["screen", "voice", "lighterVoice", "stopCue"].filter(f => typeof b[f] === "string")
    .map(f => ({ where: `${c.id}/${s.id}[${i}].${f}`, t: b[f] })))));
ok("3pc. every class, every line", CLASSES.length >= 10 && lines.length > 150, `${CLASSES.length} classes, ${lines.length} lines`);
for (const r of RULES) {
  const hits = lines.filter(s => r.test(s.t));
  ok(`3.${r.id}: none`, hits.length === 0, hits.map(s => `${s.where}: ${s.t.slice(0, 90)}`).join("\n        "));
}

console.log("");
if (fails) { console.log(`CL5-ALL: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`CL5-ALL: all ${passes} assertions pass\n`);
process.exit(0);
