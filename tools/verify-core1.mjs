/**
 * tools/verify-core1.mjs
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
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

// ── GATE-PATH, 21 Aug 2026 ─────────────────────────────────────────
// Resolved from THIS FILE, never hardcoded. This gate previously
// imported an absolute /home/claude/repo path: cloned anywhere else it
// went red, and -- worse -- if that directory existed from an earlier
// session it read THAT copy and reported green on code nobody was
// editing. Five reversals of the merge guard passed exactly this way.
import { fileURLToPath as __f } from "node:url";
import { dirname as __d, resolve as __r } from "node:path";
const __REPO = __r(__d(__f(import.meta.url)), "..");
import fs from "node:fs";
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const { store } = await import(__REPO + "/js/store.js");
store.init();
const SR = await import(__REPO + "/js/data/session-rationale.js");
const { EXERCISES } = await import(__REPO + "/js/data/exercises/index.js");

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

// CARD-1 (29 Aug 2026). The four views no longer call bodyCaution
// themselves -- they render js/exercise-card.js, which calls it once.
// This test was rewritten rather than deleted: the thing it protects is
// unchanged, which is that a caution actually reaches every card-shaped
// view. It now checks the chain rather than a duplicated call.
check("the shared card calls bodyCaution and renders the markup", () => {
  const s = fs.readFileSync("js/exercise-card.js", "utf8");
  ok(/bodyCaution\(/.test(s), "the shared card never calls it - the caution would never appear anywhere");
  ok(/exercise-caution/.test(s), "no markup");
});
for (const v of ["workout", "core-session", "prescribed-session", "gym-programme"])
  check(`${v} renders the shared card`, () => {
    const s = fs.readFileSync(`js/views/${v}.js`, "utf8");
    ok(/renderExerciseCard\(/.test(s), "does not render the shared card - the caution would never appear here");
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
