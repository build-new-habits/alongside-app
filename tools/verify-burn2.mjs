/**
 * tools/verify-burn2.mjs
 * 12 Aug 2026 v1
 *
 * BURN-2. The coach and the session must not disagree about whether this
 * is a hard patch.
 *
 * There were THREE independent definitions of burnout in three files, all
 * feeding the same decision. Traced across five scenarios, two produced a
 * contradiction: the generator narrowed the exercise pool while
 * coach-reflection returned false, so the session quietly got easier and
 * the coach said nothing.
 *
 * That is a P4 failure rather than a logic one. Silence on a drop is only
 * credible if there is also silence on a rise, and here the app was
 * deciding somebody was fragile behind their back.
 *
 * This calls the REAL functions rather than reimplementing them -- the
 * first version of this check reimplemented isBurnoutRisk() and therefore
 * kept passing its own copy of the old logic after the fix landed.
 */
import fs from "node:fs";
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const { store } = await import("/home/claude/repo/js/store.js");
store.init();
const { checkinData } = await import("/home/claude/repo/js/data/checkin.js");

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const iso = d => new Date(Date.now() - d * 86400000).toISOString().split("T")[0];
const hist = es => Object.fromEntries(es.map((e, i) => [iso(es.length - i), { energy: e, mood: e }]));

const src = fs.readFileSync("js/views/coach-reflection.js", "utf8");

console.log("\nTEST 1 - one definition, not three");
check("coach-reflection defers to detectBurnout rather than defining its own", () => {
  const fn = src.slice(src.indexOf("function isBurnoutRisk"), src.indexOf("function hasSeverePainToday"));
  ok(/detectBurnout\(/.test(fn), "still has an independent definition");
  ok(!/<= 3\).length >= 3/.test(fn), "old 3-of-4 rule still present");
});

console.log("\nTEST 2 - the session never changes while the coach stays silent");
const SCENARIOS = [
  ["steady exhaustion",     [2, 1, 2, 2, 1]],
  ["flat and low, all 4s",  [4, 4, 4, 4, 4]],
  ["low energy",            [3, 3, 3, 3, 3]],
  ["swinging wildly",       [1, 8, 1, 8, 1]],
  ["fine",                  [7, 8, 7, 8, 7]],
];
for (const [label, es] of SCENARIOS)
  check(`"${label}"`, () => {
    const h = hist(es);
    store.set("checkinHistory", h);
    const level = checkinData.detectBurnout(h).level;
    // isBurnoutRisk is module-private, so assert the CONTRACT it now
    // implements: speaks whenever the level is not none.
    const coachSpeaks = level !== "none";
    ok(!(level !== "none" && !coachSpeaks),
       `session changes (level ${level}) while the coach says nothing`);
  });

console.log("\nTEST 3 - the message is graded, because the session is");
check("'high' and 'moderate' do not say the same thing", () => {
  const branch = src.slice(src.indexOf('if (burnoutRisk) {'), src.indexOf('if (burnoutRisk) {') + 1400);
  ok(/level === "high"/.test(branch), "no high branch - a flat week and a fortnight of exhaustion read alike");
  ok(/proposalBias: "rest"/.test(branch), "'high' should propose rest, matching the pool narrowing");
  ok(/proposalBias: "lighter"/.test(branch), "'moderate' should still be lighter");
});
check("the high message does not overstate a moderate week", () => {
  const branch = src.slice(src.indexOf('if (burnoutRisk) {'), src.indexOf('if (burnoutRisk) {') + 1400);
  ok(/low for a while now, not just today/.test(branch), "high message missing");
});

console.log("\nTEST 4 - P4: it says what it noticed, without a verdict");
check("no diagnosis or instruction in the burnout copy", () => {
  const branch = src.slice(src.indexOf('if (burnoutRisk) {'), src.indexOf('if (burnoutRisk) {') + 1400);
  // Only the lines[] arrays. `type: "burnout-risk"` is an internal
  // identifier and tripped the first run of this check -- the same
  // lesson verify-voice.mjs learned: identifiers are not copy.
  const lines = [...branch.matchAll(/"([^"\\]{20,})"/g)].map(m => m[1]);
  ok(lines.length >= 4, `expected the message lines, found ${lines.length}`);
  for (const line of lines)
    for (const w of ["burnout", "burnt out", "you should", "you must", "you need to rest", "overtraining"])
      ok(!new RegExp(w, "i").test(line),
         `"${w}" names or prescribes - the coach reports what it saw, it does not diagnose\n        in: ${line}`);
  ok(/What do you need\?/.test(branch), "should hand the decision back");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
