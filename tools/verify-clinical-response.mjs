/**
 * tools/verify-clinical-response.mjs
 * 01 Oct 2026 v4
 *
 * v4 - BUNDLE-TRUE 2. The sore-area thank-you now says "tell me how your
 *   <area> is"; the ACK-NAME check reads the name from there. Not loosened:
 *   putting the store id back fails both ACK-NAME checks (reversal run).
 *
 * 01 Oct 2026 v3
 *
 * v3 - DOCS-MOVE. Documents/ left this public repository for the private
 *   BNH-Files repository; the files this check reads are now in docs/ (or,
 *   for the master schedule, read through tools/bnh-files.mjs).
 *
 * v2 - P0, SCOPE-MINOR (Graeme, 29 Sep). The app no longer asks about
 *   medical conditions, so CR-1's ME/CFS and long covid exclusion, CR-2's
 *   out-of-scope card, CR-3's hypermobility caveat and HYPER-1's stretch
 *   rule are retired with their checks (20 removed). What still holds is
 *   kept: the chronic-fatigue migration, CR-4a's general statement on the
 *   closing step, CR-5's hurt-and-ache lines on every card, and ACK-NAME
 *   (now "likely to load your <area>" or "telling me about <state>").
 *
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

// GATE-PATH, 08 Sep 2026. Resolved from import.meta.url, not the cwd.
const _GATE_ROOT = new URL("../", import.meta.url);
const _gatePath = (p) => new URL(String(p).replace(/^\.\//, ""), _GATE_ROOT);

const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM("<!doctype html>", { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis,"navigator",{value:dom.window.navigator,configurable:true,writable:true});
Object.defineProperty(globalThis,"localStorage",{value:dom.window.localStorage,configurable:true,writable:true});

const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "")
                    .replace(/^\s*\/\/[^\n]*$/gm, "");
const read = f => strip(fs.readFileSync(_gatePath(f), "utf8"));
const raw  = f => fs.readFileSync(_gatePath(f), "utf8");

let fails = 0;
const check = (name, source, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (e) { fails++; console.log(`  FAIL  ${name}\n        recorded in: ${source}\n        ${e.message}`); }
};
const ok = (c, m) => { if (!c) throw new Error(m); };

const BP = "docs/specs/alongside_blueprint_CLINICAL-RESPONSE_06sep2026_v1.md";

console.log("\nCR-1 \u2014 the condition split");


check("The old combined id is gone from the condition list", `${BP} \u00a72`, () => {
  const c = read("js/data/conditions.js");
  ok(!/id:\s*'chronic-fatigue'/.test(c),
     "'chronic-fatigue' is still offered at onboarding \u2014 the split is cosmetic if the " +
     "old combined option is still selectable alongside the new ones");
});


console.log("\nCR-1 \u2014 the exclusion set");




console.log("\nCR-1 \u2014 the migration, the part that must not be wrong");

const { store: S } = await import("../js/store.js");
const { CONDITIONS: C_ALL } = await import("../js/data/conditions.js");
const OTD = await import("../js/data/onboarding-thread-data.js");
const OTD_STEPS = () => OTD.THREAD_STEPS || OTD.STEPS || OTD.default || {};
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
  // v2 (P0): hypermobility is now retired on load, so it is no longer
  // an "unrelated" example; shoulder is.
  const out = S.mergeWithDefaults({ conditions: ["knee", "shoulder", "anxiety"] });
  for (const id of ["knee", "shoulder", "anxiety"]) {
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


console.log("\nCR-3 \u2014 the hypermobility caveat");

const otd = await import("../js/data/onboarding-thread-data.js");








console.log("\nCR-4a \u2014 the general pre-start statement");

check("It is on the step every person reaches", `${BP} \u00a74`, () => {
  const steps = OTD_STEPS();
  const closing = steps["14"] || steps[14];
  ok(closing, "step 14 not found \u2014 the closing step has moved");
  ok(!closing.showIf,
     "the closing step has acquired a showIf. The statement would then reach only some " +
     "people, and the ones it skips are the ones least likely to already know");
  ok(/GP or someone qualified/i.test(closing.coach),
     "the pre-start statement is not in the closing coach message");
  ok(/general/i.test(closing.coach),
     "the statement does not say the advice is general, which is its whole substance");
});

check("It names the coach's limit rather than disclaiming", "coach voice", () => {
  const steps = OTD_STEPS();
  const closing = steps["14"] || steps[14];
  ok(!/terms|liability|not responsible|at your own risk/i.test(closing.coach),
     "the statement has drifted into legal register. A wall of disclaimer at the end of a " +
     "warm conversation reads as the product protecting itself");
});

check("It does NOT claim to be the red-flag screen", `${BP} \u00a74`, () => {
  const steps = OTD_STEPS();
  const closing = steps["14"] || steps[14];
  ok(!/A&E|\b111\b|\b999\b|symptoms require/i.test(closing.coach),
     "the closing step has taken on urgency language. CR-4b is deliberately unbuilt, and a " +
     "general statement quietly becoming a triage screen is the exact drift being avoided");
});

console.log("\nCR-5 \u2014 hurt-and-ache guidance on every exercise");

const CARD = await import("../js/exercise-card.js");

check("Both lines exist and are exported from one place", `${BP} \u00a72`, () => {
  ok(Array.isArray(CARD.HURT_AND_ACHE) && CARD.HURT_AND_ACHE.length === 2,
     "HURT_AND_ACHE is not a two-line exported constant");
  const [during, after] = CARD.HURT_AND_ACHE;
  ok(/hurts while you are doing it/i.test(during), "the during-exercise line is missing");
  ok(/aching/i.test(after) && /normal/i.test(after),
     "the aching-afterwards line does not set the expectation that it is normal");
});

check("It renders in the card body, not just in a variable", `${BP} \u00a72`, () => {
  // FIXTURE SELF-CHECK. Prove page:"do" reaches doBody before asserting
  // anything about its contents -- otherwise a missing block and a
  // wrong page look identical from here.
  const control = CARD.renderExerciseCard(
    { id: "x", name: "Test", instructions: ["UNIQUEMARKER"], category: "strength" },
    { page: "do" });
  ok(/UNIQUEMARKER/.test(control),
     "FIXTURE FAULT: page:\"do\" does not reach the DO body, so nothing below is trustworthy");

  // page:"do" is required. The card is paged and defaults to "decide", so
  // a fixture without it renders a body that never contained this block
  // and the assertion would fail for the wrong reason.
  const html = CARD.renderExerciseCard(
    { id: "x", name: "Test", instructions: ["Do the thing"],
      watchOut: ["Careful"], category: "strength" },
    { page: "do" });
  ok(typeof html === "string" && html.length > 0,
     "renderExerciseCard did not return markup \u2014 this gate cannot see what a person sees");
  ok(/If it hurts/.test(html), "the block is not in the rendered card");
  ok(html.indexOf("Careful") < html.indexOf("If it hurts"),
     "the generic block renders ABOVE the exercise-specific watchOut. Safety render order " +
     "is non-negotiable: the hazard that belongs to THIS exercise comes first");
});

check("It is not gated on category", `${BP} \u00a72`, () => {
  for (const category of ["strength", "rehabilitation", "cardio", "yoga", "mobility"]) {
    const html = CARD.renderExerciseCard(
      { id: "x", name: "Test", instructions: ["Do the thing"], category },
      { page: "do" });
    ok(/If it hurts/.test(html),
       `the block is missing for category "${category}". Her steer was "always", and ` +
       "someone in a strength session can hurt themselves too");
  }
});

check("It does not diagnose or set an urgency tier", "SAFEGUARD-1 register", () => {
  const all = CARD.HURT_AND_ACHE.join(" ");
  ok(!/A&E|\b111\b|\b999\b|immediately|urgent/i.test(all),
     "the block sets an urgency tier. That belongs to the red-flag screen, which is not built");
  ok(/worth getting someone to look at it/.test(all),
     "the escalation phrasing has drifted from SAFEGUARD-1. Eleven stop lines phrased eleven " +
     "ways is how that fault started");
});

console.log("\nACK-NAME \u2014 the coach does not speak in store ids");



check("A single condition renders its display name, not its id", "ACK-NAME, 06 Sep 2026", () => {
  const ack = OTD.generateConditionsAck(["wrist-elbow"]);
  ok(!/wrist-elbow/.test(ack),
     `the raw store id is in the coach's mouth: ${JSON.stringify(ack.split("\n")[0])}`);
  ok(/wrist \/ elbow/i.test(ack), "the display name is not being used");
});

check("It holds for every defined condition, not just the sampled one", "ACK-NAME", () => {
  // Only the interpolated clause is tested. The CR-3 caveat legitimately
  // writes the word "hypermobility" as prose, and an earlier version of
  // this assertion failed on that -- a false positive that would have
  // pushed someone to weaken real copy to satisfy a gate.
  // v2 (P0): "likely to load your <area>" or "telling me about <state>",
  // in running prose, so the name is compared without case.
  const clause = ack => {
    const line = ack.split("\n")[0];
    // v4 (BUNDLE-TRUE 2): the area now sits in "tell me how your <area> is".
    return (line.match(/tell me how your (.+?) is, and/) || line.match(/telling me about (.+?)\. /) || [])[1] || "";
  };
  const bad = [];
  for (const c of C_ALL) {
    const named = clause(OTD.generateConditionsAck([c.id]));
    if (named.toLowerCase() !== c.name.toLowerCase()) bad.push(`${c.id} -> ${JSON.stringify(named)}`);
  }
  ok(bad.length === 0,
     `the acknowledgement does not name these by their display name: ${bad.join("; ")}`);
});

check("An unknown id degrades to itself, not to undefined", "ACK-NAME", () => {
  const ack = OTD.generateConditionsAck(["not-a-real-condition"]);
  ok(!/undefined/.test(ack),
     "an unrecognised condition renders \"undefined\" in the coach line");
});

console.log("\nHYPER-1 regression \u2014 unchanged by this session");


console.log(fails === 0
  ? "\nCR-1 HOLDS\n"
  : `\n${fails} CR-1 CHECK(S) FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
