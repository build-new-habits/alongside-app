/**
 * tools/verify-core1.mjs
 * 12 Aug 2026 v1
 *
 * CORE-1 gate. Graeme's call: allow dead-bug and bird-dog, but when a
 * condition is flagged, say something.
 *
 * Built the P7 way. "Listen to your body" alone is the hedge P7 warns
 * against -- a coach told a specific area is sore, that knows this
 * exercise loads it, and then says something vague, is pretending not to
 * know. The caution names the area and says why.
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
const SR = await import("/home/claude/repo/js/data/session-rationale.js");
const { EXERCISES } = await import("/home/claude/repo/js/data/exercises/index.js");

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const byId = new Map(EXERCISES.map(e => [e.id, e]));
const setSore = (id, score) => {
  store.set("conditions", id ? [id] : []);
  store.set("conditionPainScores", id ? { [id]: score } : {});
};

console.log("\nTEST 1 - Graeme's two exercises");
check("dead-bug is still allowed (not removed)", () =>
  ok(byId.has("dead-bug"), "must remain selectable - his call was allow, not exclude"));
check("dead-bug speaks when the lower back is sore - Graeme's actual case", () => {
  setSore("lower-back", 5);
  const c = SR.bodyCaution(byId.get("dead-bug"));
  ok(c, "silent - this is the exact case CORE-1 was raised for");
  // Dead Bug affects core and abdominals, NOT lower-back, so this must be
  // the GENERAL steer. Naming the lower back here would be the coach
  // claiming knowledge it does not have.
  ok(!/lower back/i.test(c),
     "must not name an area this exercise does not work");
  ok(/carrying something sore/i.test(c), "should be the general steer");
});
check("bird-dog NAMES the lower back, because it works it", () => {
  setSore("lower-back", 5);
  const c = SR.bodyCaution(byId.get("bird-dog"));
  ok(/lower back/i.test(c), "affectsAreas includes lower-back, so P7 says name it");
});
check("bird-dog cautions when the lower back is sore", () => {
  setSore("lower-back", 5);
  ok(SR.bodyCaution(byId.get("bird-dog")), "silent");
});

console.log("\nTEST 2 - silent when it should be");
check("nothing sore -> no caution", () => {
  setSore(null);
  ok(SR.bodyCaution(byId.get("dead-bug")) === null, "cautioning with nothing reported");
});
check("sore somewhere unrelated -> general steer, never a named one", () => {
  setSore("shoulder", 6);
  const c = SR.bodyCaution(byId.get("dead-bug"));
  ok(c && !/shoulder/i.test(c),
     "must not name an area this exercise does not work - a wrong specific is worse than a right general");
});
check("below the 4 threshold -> no caution", () => {
  setSore("lower-back", 3);
  ok(SR.bodyCaution(byId.get("dead-bug")) === null, "3 is not sore enough to speak");
});

console.log("\nTEST 3 - aliases resolve (conditions and areas do not share a vocabulary)");
for (const [cond, ex] of [["sciatica", "bird-dog"], ["upper-back", "thoracic-rotation"]])
  check(`${cond} maps onto the right areas`, () => {
    setSore(cond, 6);
    const hit = SR.soreAreaLoaded(byId.get(ex));
    ok(hit === cond, `${cond} did not match ${ex} - alias table gap`);
  });

console.log("\nTEST 4 - tone: invitation, never instruction (P7)");
check("no commanding language", () => {
  setSore("lower-back", 6);
  const c = SR.bodyCaution(byId.get("dead-bug"));
  for (const w of ["you must", "do not do", "stop ", "avoid this", "you should not"])
    ok(!new RegExp(w, "i").test(c), `"${w}" commands rather than invites`);
  ok(/how it feels/i.test(c), "should hand the decision back");
});
check("easing off is not framed as failure (P4)", () => {
  setSore("lower-back", 6);
  const c = SR.bodyCaution(byId.get("dead-bug"));
  ok(!/give up|weak|less than|only/i.test(c), "easing off must not read as falling short");
});

console.log("\nTEST 5 - rendered on every card-shaped view");
for (const v of ["workout", "core-session", "prescribed-session", "gym-programme"])
  check(`${v} renders it`, () => {
    const s = fs.readFileSync(`js/views/${v}.js`, "utf8");
    ok(/bodyCaution\(/.test(s), "imported nowhere - the caution would never appear");
    ok(/exercise-caution/.test(s), "no markup");
  });
check("the alias table exists in exactly one place", () => {
  const src = fs.readFileSync("js/data/session-rationale.js", "utf8");
  // Match the MAP entry specifically. A looser grep also caught
  // _conditionLabel's lookup table, which is a different thing entirely.
  const n = (src.match(/"plantar-fasciitis":\s*\["/g) || []).length;
  ok(n === 1, `alias table duplicated ${n} times - the two rules would drift`);
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
