/**
 * tools/verify-tier.mjs
 * 13 Aug 2026 v1
 *
 * TIER-A/B/C/F GATE — the free boundary is where the boundary document
 * says it is.
 *
 * SOURCE OF TRUTH: Documents/Business/alongside_tier_boundary_12aug2026_v1.md
 * section 1 — "Free gives you a coach for today. Personal gives you a
 * coach who knows where you're going." Free is a full-body session the
 * COACH chooses. The paid act is self-direction.
 *
 * WHY A GATE AND NOT A NOTE. Three separate surfaces reached paid
 * session shapes on the free tier for months, each looking perfectly
 * correct in isolation: the Library (no tier check at all), two Home
 * doors, and the entire twelve-week programme engine. Nothing failed,
 * because nothing was broken — the code did exactly what it said. The
 * boundary only existed in a document, and a boundary that lives in a
 * document is a boundary that drifts.
 *
 * THE TWO DIRECTIONS. This checks both, deliberately:
 *   - nothing PAID leaks to free (the revenue direction)
 *   - nothing SAFETY-CRITICAL becomes paid (the direction that matters
 *     more, and the one nobody would notice until somebody got hurt)
 */
import fs from "node:fs";

const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "")
                    .replace(/<!--[\s\S]*?-->/g, "")
                    .replace(/^\s*\/\/[^\n]*$/gm, "");
const read = f => strip(fs.readFileSync(f, "utf8"));

let fails = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (e) { fails++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
};
const ok = (c, m) => { if (!c) throw new Error(m); };

const library = read("js/views/library.js");
const today   = read("js/views/today.js");
const gymProg = read("js/views/gym-programme.js");
const sbUI    = read("js/views/session-builder-ui.js");

console.log("\nTIER-B — the Library knows about tiers");

check("library.js imports the shared paywall components", () => {
  ok(/isPremium/.test(library) && /lockedFeature/.test(library),
     "library.js has no tier awareness at all — this was the state that let a " +
     "free user tap 'Lower body' and silently receive Full Body 30");
});

check("every paid Library surface is tagged", () => {
  // Tag count rather than named cards: naming them here would mean two
  // lists to keep in step, which is the drift this gate exists to stop.
  const tags = (library.match(/tier:\s*["']personal["']/g) || []).length;
  ok(tags >= 11,
     `only ${tags} paid Library surfaces tagged; expected at least 11 ` +
     "(At home, Run, Walk, Swim, Cycle, Yoga, plus My programme and the " +
     "four gym session types)");
});

check("the free Library surfaces are NOT tagged", () => {
  // These are free on ethical grounds, not commercial convenience.
  // Prescribed especially: 8 Mar 2026, "physio compliance is a health
  // issue, not a premium feature".
  for (const [id, why] of [
    ["prescribed", "physio compliance is a health issue, not a premium feature"],
    ["mindful",    "practices are free; journeys are paid"],
    ["coach",      "it IS the coach deciding, which is the free tier"]
  ]) {
    const block = library.slice(library.indexOf(`id:          "${id}"`));
    const upToNext = block.slice(0, block.indexOf("},"));
    ok(!/tier:\s*["']personal["']/.test(upToNext),
       `the "${id}" category has been made paid — ${why}`);
  }
});

check("no silent downgrade survives anywhere", () => {
  ok(!/selectedType\s*=\s*["']full["'];\s*selectedDuration\s*=\s*30/.test(sbUI),
     "session-builder-ui.js still substitutes Full Body 30 for a locked type. " +
     "Substituting silently is the behaviour TIER-B removed; route to upgrade");
});

console.log("\nTIER-A — Home doors follow the same boundary");

check("the two self-directed doors are gated", () => {
  for (const id of ["mobility-conditioning", "yoga"]) {
    const line = today.split("\n").find(l => l.includes(`id: '${id}'`));
    ok(line, `the ${id} door has gone missing from HOME_DOORS`);
    ok(/tier:\s*'personal'/.test(line),
       `the ${id} door is open to free users — free is a full-body session ` +
       "the coach chooses, with no session-type selection");
  }
});

check("SAFETY: nothing safety-critical is ever gated", () => {
  // The direction that matters more. Conditions Update is how somebody
  // tells the coach they are hurting; the coach proposal is the free
  // tier's whole point; Wellbeing carries the crisis-adjacent content.
  for (const [id, why] of [
    ["conditions-update", "it is how somebody tells the coach they are hurting"],
    ["unsure",            "the coach deciding IS the free tier"],
    ["wellbeing",         "safety-critical features are never paywalled"],
    ["cardio-core-strength", "it is the free session"]
  ]) {
    const line = today.split("\n").find(l => l.includes(`id: '${id}'`));
    ok(line, `the ${id} door has gone missing from HOME_DOORS`);
    ok(!/tier:/.test(line),
       `the ${id} door has been made paid — ${why}. Safety-critical features ` +
       "are permanently free; this is a founding constraint, not a preference");
  }
});

console.log("\nTIER-C — a plan is paid");

check("the programme engine checks tier", () =>
  ok(/isPremium/.test(gymProg),
     "gym-programme.js has no tier check — the full twelve-week generative " +
     "programme is reachable free, which is exactly what Personal is"));

check("a lapsed user is not ejected mid-programme", () =>
  ok(/hasActiveProgramme\(\)/.test(gymProg),
     "the tier check does not exempt someone with a programme already " +
     "running. Ejecting them mid-plan punishes a billing state, not a choice"));

console.log("\nTIER-D — the exercise database is never tier-gated");

check("no tier check reaches exercise selection", () => {
  for (const f of ["js/session-builder.js", "js/data/session-categories.js"]) {
    const src = read(f);
    ok(!/isPremium|store\.get\(["']tier["']\)/.test(src),
       `${f} gates exercises by tier. Capability decides what somebody gets — ` +
       "what is SAFE for them, never what they have paid. This is settled " +
       "(TIER-D, 13 Aug 2026) and should not be re-litigated in code");
  }
});

console.log("\nTIER-F — one destination, one name");

check("Wellbeing is called Wellbeing everywhere a user can read it", () => {
  const html = fs.readFileSync("index.html", "utf8")
                 .replace(/<!--[\s\S]*?-->/g, "");
  ok(!/<span class="nav-label">Noticing<\/span>/.test(html),
     "the bottom-nav tab still says 'Noticing' while the Home door says " +
     "'Wellbeing' — same route, two names, reads as two features");
  const noticing = fs.readFileSync("js/views/noticing.js", "utf8");
  ok(!/<h1 class="sr-only">Noticing<\/h1>/.test(noticing),
     "the screen-reader heading still says 'Noticing'. A sighted user never " +
     "sees it, which is how it drifted — but it is the first thing a screen " +
     "reader announces on arriving from a tab labelled Wellbeing");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
