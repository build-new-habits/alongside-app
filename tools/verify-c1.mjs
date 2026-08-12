/**
 * tools/verify-c1.mjs
 * 12 Aug 2026 v1
 *
 * Gate for C1 — the conditional leg question and its fail-safe.
 *
 * This is the most safety-critical path in the product: getting it wrong
 * serves loaded leg work to somebody who cannot take weight through
 * their legs. The original C1 bug did exactly that, twice.
 *
 * Exercises the REAL capabilityProfile() against real answer
 * combinations. The failure it exists to prevent is silent by nature —
 * nothing errors, the person is simply handed the wrong exercise.
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

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const profile = cap => {
  store.set("capability", { askedAt: new Date().toISOString(), ...cap });
  return store.capabilityProfile();
};

console.log("\nTEST 1 - the original C1 bug stays fixed");
check("chairRise 'no', legPower unanswered -> legs NOT loadable", () => {
  const p = profile({ chairRise: "no", floorAccess: "no", legPower: null });
  ok(p.legsLoadable === false, "a wheelchair user would be served Seated Leg Extension again");
});

console.log("\nTEST 2 - C1-SAFETY: the hole found while making the question optional");
check("chairRise 'not-easily', legPower unanswered -> legs NOT loadable", () => {
  const p = profile({ chairRise: "not-easily", floorAccess: "yes", legPower: null });
  ok(p.legsLoadable === false,
     "THIS IS THE BUG: the question fires for 'not-easily' but the old fail-safe " +
     "only covered 'no', so declining it gave fully loaded leg work");
});
check("chairRise 'not-easily' + declined ('skip' stored as null) -> NOT loadable", () => {
  const p = profile({ chairRise: "not-easily", floorAccess: "not-comfortably", legPower: null });
  ok(p.legsLoadable === false, "declining must fail safe, not fall through");
});

console.log("\nTEST 3 - the fail-safe assumes nothing about anyone else");
check("chairRise 'yes' -> legs fully loadable", () => {
  const p = profile({ chairRise: "yes", floorAccess: "yes", legPower: null });
  ok(p.legsLoadable === true, "assuming limitation of everyone would be wrong and insulting");
});
check("never asked at all -> not assumed limited", () => {
  store.set("capability", { chairRise: null, floorAccess: null, legPower: null, askedAt: null });
  const p = store.capabilityProfile();
  ok(p.asked === false, "asked should be false");
  ok(p.legsLoadable === true, "somebody who never saw the screen must not be assumed limited");
});

console.log("\nTEST 4 - the three answers do what they say");
check("'Yes' (full) -> usable and loadable", () => {
  const p = profile({ chairRise: "not-easily", floorAccess: "yes", legPower: "full" });
  ok(p.legsUsable === true && p.legsLoadable === true, "an explicit yes must be honoured");
});
check("'A little, or on good days' (limited) -> usable, NOT loadable", () => {
  const p = profile({ chairRise: "not-easily", floorAccess: "yes", legPower: "limited" });
  ok(p.legsUsable === true, "legs still move");
  ok(p.legsLoadable === false, "but nothing may load them");
});
check("'No' (none) -> neither usable nor loadable", () => {
  const p = profile({ chairRise: "no", floorAccess: "no", legPower: "none" });
  ok(p.legsUsable === false && p.legsLoadable === false, "no leg work at all");
});

console.log("\nTEST 5 - 'skip' must never reach the store");
const view = fs.readFileSync("js/views/onboarding/lifestyle.js", "utf8");
check("the view converts 'skip' to null before saving", () =>
  ok(/legPower:\s*selections\.legPower === 'skip' \? null : selections\.legPower/.test(view),
     "storing the string 'skip' would be TRUTHY, bypassing the fail-safe entirely"));
check("a stray 'skip' would still fail safe on usable, proving why null matters", () => {
  const p = profile({ chairRise: "not-easily", floorAccess: "yes", legPower: "skip" });
  ok(p.legsLoadable === false, "loadable requires exactly 'full'");
  ok(p.legsUsable === true,
     "…but usable is 'not none', so 'skip' would read as legs-usable by accident — " +
     "which is why the view stores null instead");
});

console.log("\nTEST 6 - the question's trigger matches the fail-safe's trigger");
check("every chairRise answer that SHOWS the question also fails safe", () => {
  for (const c of ["not-easily", "no"]) {
    const p = profile({ chairRise: c, floorAccess: "yes", legPower: null });
    ok(p.legsLoadable === false, `chairRise '${c}' shows the question but did not fail safe`);
  }
});
check("the view shows the question for exactly those answers", () =>
  ok(/selections\.chairRise && selections\.chairRise !== 'yes'/.test(view),
     "trigger drift between view and profile is how C1 happened in the first place"));
check("retracting the question clears the answer", () =>
  ok(/selections\.legPower = null;/.test(view),
     "a hidden question must not leave a stale legPower behind"));

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
