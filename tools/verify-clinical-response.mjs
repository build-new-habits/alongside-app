/**
 * tools/verify-clinical-response.mjs
 * 06 Sep 2026 v1
 *
 * CR-1 GATE. The condition split and its migration.
 *
 * WHY THIS EXISTS. `chronic-fatigue` was one stored id covering two
 * populations. The adaptive model probably serves one of them well and
 * may harm the other, so a single decision was always wrong for someone.
 * The split makes the difference sayable.
 *
 * The migration is the part that has to be gated, not the split. It maps
 * the old id to `persistent-fatigue` and must NEVER map it to `me-cfs`.
 * Getting that backwards would silently withdraw the product from people
 * who were never asked the question -- a fault with no error, no broken
 * screen, and no way for the person to tell it happened. Exactly the
 * shape verify-decisions.mjs was written for.
 *
 * PROVENANCE. The split follows written answers from a named
 * physiotherapist, 06 Sep 2026. She declined the reviewer role and
 * declined to be named. These are steers, not clinical sign-off, and no
 * assertion here should be read as clearance.
 */

import fs from "node:fs";

const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "")
                    .replace(/^\s*\/\/[^\n]*$/gm, "");
const read = f => strip(fs.readFileSync(f, "utf8"));
const raw  = f => fs.readFileSync(f, "utf8");

let fails = 0;
const check = (name, source, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (e) { fails++; console.log(`  FAIL  ${name}\n        recorded in: ${source}\n        ${e.message}`); }
};
const ok = (c, m) => { if (!c) throw new Error(m); };

const BP = "Documents/Admin/alongside_blueprint_CLINICAL-RESPONSE_06sep2026_v1.md";

console.log("\nCR-1 \u2014 the condition split");

check("The three split ids exist and are distinct", `${BP} \u00a72`, () => {
  const c = read("js/data/conditions.js");
  for (const id of ["persistent-fatigue", "me-cfs", "long-covid"]) {
    ok(new RegExp(`id:\\s*'${id}'`).test(c), `condition id '${id}' is not defined`);
  }
});

check("The old combined id is gone from the condition list", `${BP} \u00a72`, () => {
  const c = read("js/data/conditions.js");
  ok(!/id:\s*'chronic-fatigue'/.test(c),
     "'chronic-fatigue' is still offered at onboarding \u2014 the split is cosmetic if the " +
     "old combined option is still selectable alongside the new ones");
});

check("Every split id carries a systemic zone", `${BP} \u00a72`, () => {
  const c = raw("js/data/conditions.js");
  for (const id of ["persistent-fatigue", "me-cfs", "long-covid"]) {
    const line = c.split("\n").find(l => l.includes(`id: '${id}'`));
    ok(line && /zone:\s*'systemic'/.test(line),
       `'${id}' has no systemic zone \u2014 getZoneStatus() will not see it`);
  }
});

console.log("\nCR-1 \u2014 the exclusion set");

check("EXCLUDED_CONDITIONS holds me-cfs and long-covid", `${BP} \u00a71`, () => {
  const c = read("js/data/conditions.js");
  ok(/export const EXCLUDED_CONDITIONS/.test(c), "EXCLUDED_CONDITIONS is not exported");
  const m = c.match(/EXCLUDED_CONDITIONS\s*=\s*new Set\(\[([^\]]*)\]/);
  ok(m, "EXCLUDED_CONDITIONS is not a Set literal this gate can read");
  ok(/'me-cfs'/.test(m[1]),     "me-cfs is not excluded");
  ok(/'long-covid'/.test(m[1]), "long-covid is not excluded");
});

check("persistent-fatigue is NOT excluded", `${BP} \u00a71`, () => {
  const c = read("js/data/conditions.js");
  const m = c.match(/EXCLUDED_CONDITIONS\s*=\s*new Set\(\[([^\]]*)\]/);
  ok(m && !/'persistent-fatigue'/.test(m[1]),
     "persistent-fatigue has been swept into the exclusion \u2014 the whole point of the " +
     "split was that the adaptive model suits this group");
});

check("The exclusion check is not gated on tier", "Safety is never paywalled", () => {
  const c = read("js/data/conditions.js");
  ok(!/isPremium|isPersonal|\bthe Plan\b/.test(c),
     "a tier check has entered conditions.js \u2014 an exclusion that only fires for paying " +
     "users is a safety rule behind a paywall");
});

console.log("\nCR-1 \u2014 the migration, the part that must not be wrong");

const { store: S } = await import("../js/store.js");
ok(S && typeof S.mergeWithDefaults === "function",
   "store.mergeWithDefaults is not reachable \u2014 this gate would pass vacuously");

check("chronic-fatigue migrates to persistent-fatigue", `${BP} \u00a72`, () => {
  const out = S.mergeWithDefaults({ conditions: ["chronic-fatigue"] });
  ok(Array.isArray(out.conditions), "conditions is not an array after merge");
  ok(out.conditions.includes("persistent-fatigue"),
     `expected persistent-fatigue, got ${JSON.stringify(out.conditions)}`);
});

check("chronic-fatigue NEVER migrates to me-cfs", `${BP} \u00a72`, () => {
  for (const saved of [
    { conditions: ["chronic-fatigue"] },
    { conditions: ["chronic-fatigue", "knee"] },
    { conditions: ["chronic-fatigue", "persistent-fatigue"] },
  ]) {
    const out = S.mergeWithDefaults(saved);
    ok(!out.conditions.includes("me-cfs"),
       "an existing user was migrated into an excluded state without being asked. This " +
       "silently withdraws the product from someone who never answered the question");
    ok(!out.conditions.includes("long-covid"),
       "an existing user was migrated into long-covid, which was never a stored value");
  }
});

check("The old id does not survive the migration", `${BP} \u00a72`, () => {
  const out = S.mergeWithDefaults({ conditions: ["chronic-fatigue"] });
  ok(!out.conditions.includes("chronic-fatigue"),
     "chronic-fatigue is still present after merge \u2014 it now matches no condition " +
     "definition, so it is collected and silently ignored");
});

check("Migration does not duplicate when both ids are stored", `${BP} \u00a72`, () => {
  const out = S.mergeWithDefaults({ conditions: ["chronic-fatigue", "persistent-fatigue"] });
  const n = out.conditions.filter(id => id === "persistent-fatigue").length;
  ok(n === 1, `persistent-fatigue appears ${n} times after merge, expected exactly 1`);
});

check("Unrelated conditions pass through untouched", `${BP} \u00a72`, () => {
  const out = S.mergeWithDefaults({ conditions: ["knee", "hypermobility", "anxiety"] });
  for (const id of ["knee", "hypermobility", "anxiety"]) {
    ok(out.conditions.includes(id), `${id} was lost by the migration`);
  }
});

check("conditionMeta history survives the rename", `${BP} \u00a72`, () => {
  const out = S.mergeWithDefaults({
    conditions: ["chronic-fatigue"],
    conditionMeta: { "chronic-fatigue": { addedAt: "2026-01-01", source: "onboarding",
                                          status: "active", reportDays: 9 } }
  });
  ok(out.conditionMeta["persistent-fatigue"],
     "conditionMeta was orphaned \u2014 the id moved and its lifecycle history did not");
  ok(out.conditionMeta["persistent-fatigue"].addedAt === "2026-01-01",
     "conditionMeta was recreated rather than carried, losing addedAt");
  ok(out.conditionMeta["persistent-fatigue"].reportDays === 9,
     "conditionMeta was carried but its counters were reset");
  ok(!out.conditionMeta["chronic-fatigue"],
     "the old conditionMeta key is still present alongside the new one");
});

console.log("\nHYPER-1 regression \u2014 unchanged by this session");

check("hypermobility still avoids stretch-pattern exercises", "conditions.js v1.5", () => {
  const c = read("js/data/conditions.js");
  ok(/activeConditions\.includes\('hypermobility'\)[\s\S]{0,120}movementPattern === 'stretch'/.test(c),
     "the HYPER-1 stretch block has been altered or removed by the split");
});

console.log(fails === 0
  ? "\nCR-1 HOLDS\n"
  : `\n${fails} CR-1 CHECK(S) FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
