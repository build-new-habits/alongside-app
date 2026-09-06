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

// GATE-PATH, 21 Aug 2026. jsdom resolved through Node rather than by
// absolute path into one machine's node_modules. store.js writes to
// localStorage on every set(), so the CR-2 checks cannot drive real state
// without a DOM -- and driving real state is the whole point of them.
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM("<!doctype html>", { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis,"navigator",{value:dom.window.navigator,configurable:true,writable:true});
Object.defineProperty(globalThis,"localStorage",{value:dom.window.localStorage,configurable:true,writable:true});

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

console.log("\nCR-2 \u2014 the exclusion actually fires, on both routes");

const sb = await import("../js/session-builder.js");

// Drive real store state. A file-read assertion here would pass while the
// branch was unreachable, which is the recorded recurring fault.
const withConditions = (ids, fn, painScores) => {
  localStorage.clear();
  S.init();
  S.set("tier", "personal");
  S.set("fitnessLevel", "moderate");
  S.set("goals", ["get-stronger"]);
  S.set("onboardingComplete", true);
  S.set("conditions", ids);
  S.set("conditionPainScores", painScores || {});
  return fn();
};

// FIXTURE SELF-CHECK. Every fixture must demonstrably reach the branch it
// names; nine recorded instances of fixtures that did not make this a
// standing check rather than a nicety. A control run proves the harness
// builds a real session when nothing should stop it -- without this, every
// "returns the out-of-scope card" assertion below could be passing on a
// buildSession that returns null for an unrelated reason.
{
  const control = withConditions([], () =>
    sb.buildSession({ sessionType: "full", durationMins: 30 }));
  ok(control && control.outOfScope !== true && control.gentleCare !== true,
     "HARNESS FAULT: the control fixture does not build an ordinary session, so no " +
     "assertion in this section can be trusted");
}

check("me-cfs reaches the out-of-scope card, not a session", `${BP} \u00a73`, () => {
  const s = withConditions(["me-cfs"], () =>
    sb.buildSession({ sessionType: "full", durationMins: 30 }));
  ok(s, "buildSession returned nothing at all");
  ok(s.outOfScope === true,
     `expected the out-of-scope card, got id="${s.id}". The condition is collected and ` +
     "changes nothing \u2014 the exact fault conditions.js v1.5 documents");
});

check("long-covid reaches it too", `${BP} \u00a73`, () => {
  const s = withConditions(["long-covid"], () =>
    sb.buildSession({ sessionType: "full", durationMins: 30 }));
  ok(s && s.outOfScope === true, `expected out-of-scope, got id="${s && s.id}"`);
});

check("The self-directed route is covered as well", `${BP} \u00a73`, () => {
  const s = withConditions(["me-cfs"], () =>
    sb.buildSessionFromSelection({ sessionType: "full", durationMins: 30,
                                   selectedIds: ["clamshell"] }));
  ok(s && s.outOfScope === true,
     "buildSessionFromSelection built a session anyway \u2014 a safety rule honoured by " +
     "one of two entry points is not a safety rule");
});

check("ignoreSevere does NOT override scope", `${BP} \u00a73`, () => {
  for (const fn of ["buildSession", "buildSessionFromSelection"]) {
    const s = withConditions(["me-cfs"], () =>
      sb[fn]({ sessionType: "full", durationMins: 30,
               selectedIds: ["clamshell"], ignoreSevere: true }));
    ok(s && s.outOfScope === true,
       `${fn} let ignoreSevere bypass the scope check. Today's pain is the person's to ` +
       "overrule; whether this app has a pacing model is not");
  }
});

check("The card offers NO exertion \u2014 no walk", `${BP} \u00a73`, () => {
  const s = withConditions(["me-cfs"], () =>
    sb.buildSession({ sessionType: "full", durationMins: 30 }));
  const ids = (s.exercises || []).map(e => e.id);
  ok(!ids.includes("mindful-walk"),
     "the out-of-scope card offers a walk. Handing an exertion suggestion to someone " +
     "with post-exertional malaise is the precise thing this card exists to prevent");
  ok(ids.length > 0, "the card is empty \u2014 withdrawing everything is a punishment, not a scope statement");
});

check("Scope resolves BEFORE Gentle Care, not after", `${BP} \u00a73`, () => {
  // The fixture must make Gentle Care genuinely reachable, or this passes
  // vacuously. Control first: knee at 9 alone MUST return Gentle Care.
  const control = withConditions(["knee"], () =>
    sb.buildSession({ sessionType: "full", durationMins: 30 }), { knee: 9 });
  ok(control && control.gentleCare === true,
     "FIXTURE FAULT: severe pain does not reach Gentle Care, so the ordering assertion " +
     "below would prove nothing");

  const s = withConditions(["me-cfs", "knee"], () =>
    sb.buildSession({ sessionType: "full", durationMins: 30 }), { knee: 9 });
  ok(s.outOfScope === true && s.gentleCare !== true,
     "Gentle Care won the race. It offers a mindful walk, so this ordering is not a " +
     "preference \u2014 it is the whole point of the card");
});

check("persistent-fatigue still gets a real session", `${BP} \u00a71`, () => {
  const s = withConditions(["persistent-fatigue"], () =>
    sb.buildSession({ sessionType: "full", durationMins: 30 }));
  ok(s, "buildSession returned nothing");
  ok(s.outOfScope !== true,
     "persistent-fatigue was swept into the exclusion. The split existed precisely so " +
     "this group keeps the adaptive model that suits them");
});

check("No conditions at all still builds normally", `${BP} \u00a73`, () => {
  const s = withConditions([], () =>
    sb.buildSession({ sessionType: "full", durationMins: 30 }));
  ok(s && s.outOfScope !== true, "the exclusion fires for people who declared nothing");
});

check("The out-of-scope card does not diagnose or instruct", "P4, coach voice", () => {
  const s = withConditions(["me-cfs"], () =>
    sb.buildSession({ sessionType: "full", durationMins: 30 }));
  const line = s.coachLine || "";
  ok(!/\byou have\b|\byour condition is\b|\bdiagnos/i.test(line),
     "the card makes a claim about what is wrong with the person");
  ok(!/\bmust\b|\bshould see\b|\bA&E\b|\b111\b/i.test(line),
     "the card instructs the person to seek care. That is the red-flag screen's job, " +
     "and this is not that screen");
});

console.log("\nCR-3 \u2014 the hypermobility caveat");

const otd = await import("../js/data/onboarding-thread-data.js");

check("Declaring hypermobility produces a caveat", `${BP} \u00a72`, () => {
  const c = otd.generateConditionCaveats(["hypermobility"]);
  ok(c && c.length > 0,
     "HYPER-1 withholds 30 stretches and says nothing. Silently deciding something " +
     "about a person's body and not telling them is the fault, not the block");
});

check("It reaches the onboarding acknowledgement", `${BP} \u00a72`, () => {
  const ack = otd.generateConditionsAck(["hypermobility"]);
  const caveat = otd.generateConditionCaveats(["hypermobility"]);
  ok(ack.includes(caveat),
     "the caveat exists but the onboarding ack does not carry it \u2014 written and " +
     "unreachable is the same as not written");
});

check("It survives alongside other conditions", `${BP} \u00a72`, () => {
  for (const set of [["knee", "hypermobility"], ["hypermobility", "anxiety", "shoulder"]]) {
    const ack = otd.generateConditionsAck(set);
    ok(ack.includes("hypermobility") || ack.includes("stretches"),
       `the caveat is dropped when hypermobility is declared with others: ${set.join(", ")}`);
  }
});

check("No caveat for conditions that have none", `${BP} \u00a72`, () => {
  ok(otd.generateConditionCaveats(["knee", "anxiety"]) === "",
     "a caveat is being attached to conditions with no guidance behind it");
  ok(otd.generateConditionCaveats([]) === "", "a caveat appears for nobody at all");
  ok(otd.generateConditionCaveats(null) === "", "null input does not return an empty string");
});

check("fibromyalgia and osteoporosis get NO invented caveat", "conditions.js v1.5", () => {
  for (const id of ["fibromyalgia", "osteoporosis"]) {
    ok(otd.generateConditionCaveats([id]) === "",
       `a caveat has been written for ${id}. There is no guidance to write one from, ` +
       "and inventing it would be worse than the gap it fills");
  }
});

check("The caveat does not diagnose or instruct", "P4, coach voice", () => {
  const c = otd.generateConditionCaveats(["hypermobility"]);
  ok(!/\byou have\b|\byour condition\b|\bdiagnos|\bsevere\b|\bmild\b/i.test(c),
     "the caveat makes a claim about the person's body or grades their severity");
  ok(!/\bmust\b|\byou need to see\b|\bA&E\b|\b111\b/i.test(c),
     "the caveat instructs the person to seek care. It may name a limit; it may not " +
     "issue a medical instruction");
  // The limit is the half the steer actually asked for, so require BOTH
  // halves: that the app is working from general guidance, and that
  // someone who can see the person will do better.
  ok(/general guidance|not from anything about you/i.test(c),
     "the caveat does not say the app is working from general guidance rather than " +
     "from anything about this person");
  ok(/substitute|better than I can/i.test(c),
     "the caveat does not point outward. Naming a limit without pointing anywhere is " +
     "just a disclaimer");
});

check("The settings route shares one source of text", `${BP} \u00a72`, () => {
  const v = read("js/views/onboarding/conditions.js");
  // An import alone proves nothing -- the symbol can be imported and never
  // called, which is exactly what an earlier version of this check missed.
  // Require a CALL: at least one use beyond the import statement.
  const uses = (v.match(/generateConditionCaveats\s*\(/g) || []).length;
  ok(uses >= 2,
     `generateConditionCaveats is called ${uses} time(s) in the conditions editor; ` +
     "expected at least two (initial render and the toggle handler). Importing it and " +
     "then hand-rolling the text is how a second copy starts drifting from this one");
  ok(!/Stretches held back|hypermobile joints/.test(v),
     "caveat copy has been written directly into the view. There must be one source " +
     "of this text, in CONDITION_CAVEATS");
  ok(/aria-live/.test(v),
     "the caveat region has no aria-live, so it appears silently for screen reader users");
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
