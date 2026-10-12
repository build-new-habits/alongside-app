/**
 * tools/verify-description-true.mjs
 * 12 Oct 2026 v1
 *
 * A-6 FIGURE-PASS, the library half (Stage AWARD). Drawing all 568
 * exercises (D-4, 04 Oct) found three entries whose own words disagree:
 *
 *   - internal-rotation-band: "Anchor a resistance band ... on the opposite
 *     side to your working arm". For INTERNAL rotation (forearm in towards
 *     the body) a band anchored on the opposite side pulls the hand the way
 *     it is going: it assists rather than resists. The anchor is on the same
 *     side as the working arm. (Drawn the way that resists.)
 *   - thoracic-rotation: the instructions are side-lying (open book); the
 *     description says sit with hands behind the head.
 *   - prone-thoracic-rotation: the instructions are side-lying in the
 *     foetal position; the description says lie face down in a T, and the
 *     name says Prone (face down).
 *
 * A wrong description teaches a different movement. The figures show the
 * instructions, so the words come into line with them.
 *
 * TEST 1 scans the whole library: no description starts in a different
 * position (side, face down, on the back, sitting, kneeling, all fours,
 * standing) from its own first instruction. Measured on v656: 2 of 568.
 */
const B = new URL("../js/", import.meta.url).href;
const { EXERCISES } = await import(B + "data/exercises/index.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const list = Array.isArray(EXERCISES) ? EXERCISES : Object.values(EXERCISES);
const byId = id => list.find(e => e && e.id === id);

function position(s) {
  s = (s || "").toLowerCase();
  if (/lie (on your )?(side|on one side)|side-lying|lie on your side/.test(s)) return "side";
  if (/lie face down|lie on your (front|stomach)|prone/.test(s)) return "front";
  if (/lie on your back|lie face up|supine|lying on your back/.test(s)) return "back";
  if (/all fours|hands and knees/.test(s)) return "fours";
  if (/^kneel/.test(s)) return "kneel";
  if (/^sit|\bsit (on|tall|upright)|seated/.test(s)) return "sit";
  if (/^stand|stand (tall|with|facing|side|upright)/.test(s)) return "stand";
  return null;
}

console.log("\nTEST 1 - every description starts where its own instructions start");
let checked = 0;
const conflicts = [];
for (const e of list) {
  if (!e || !e.description || !Array.isArray(e.instructions) || !e.instructions.length) continue;
  const a = position(e.instructions[0]);
  const b = position(String(e.description).split(/[.!]/)[0]);
  if (!a || !b) continue;
  checked++;
  if (a !== b) conflicts.push(`${e.id}: instructions ${a}, description ${b}`);
}
// Most descriptions name no starting position; 15 of 568 name one in both
// places (measured 12 Oct). The precondition is that the scan still finds them.
ok("1pc. the scan finds the entries that name a position twice", checked >= 10, `checked ${checked}`);
ok("1a. no description starts in a different position", conflicts.length === 0, conflicts.join(" · "));

console.log("\nTEST 2 - the band for internal rotation resists");
const irb = byId("internal-rotation-band");
const anchor = (irb?.instructions || []).find(s => /anchor/i.test(s)) || "";
ok("2pc. the entry and its anchor step exist", !!irb && !!anchor);
ok("2a. anchored on the same side as the working arm", /same side as your working arm/i.test(anchor) && !/opposite side/i.test(anchor), anchor);

console.log("\nTEST 3 - names say the position the instructions use");
const ptr = byId("prone-thoracic-rotation");
ok("3pc. the entry exists (id kept: saved sessions and lift logs point at it)", !!ptr);
ok("3a. a side-lying movement is not named Prone", /^lie on your side/i.test(ptr?.instructions?.[0] || "") && !/prone/i.test(ptr?.name || ""), ptr?.name);
const tr = byId("thoracic-rotation");
ok("3b. thoracic-rotation: no cue asks for more range every rep (CL-5)", !(tr?.cues || []).some(c => /each rep, try to go (a little )?further/i.test(c)), (tr?.cues || []).join(" | "));

console.log(`\nVERIFY-DESCRIPTION-TRUE: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
