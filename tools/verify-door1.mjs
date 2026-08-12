/**
 * tools/verify-door1.mjs
 * 12 Aug 2026 v1
 *
 * Gate for DOOR-1 and the In Step tier correction.
 *
 * The failure it exists to prevent is the one that just happened: a tier
 * decision changed in a specification and the code did not follow, so a
 * free feature stayed locked for weeks with nothing failing. Silent by
 * nature -- the app worked perfectly, it was just wrong.
 */
import fs from "node:fs";

const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "")
                    .replace(/<!--[\s\S]*?-->/g, "")
                    .replace(/^\s*\/\/[^\n]*$/gm, "");
const read = f => strip(fs.readFileSync(f, "utf8"));

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const noticing = read("js/views/noticing.js");
const inStep   = read("js/views/in-step.js");
const spec     = fs.readFileSync("Documents/Business/alongside_destination_architecture_12aug2026_v1.md", "utf8");
const mainC    = read("css/main.css");
const sw       = read("sw.js");

console.log("\nTEST 1 - In Step is free, and the code says so");
check("the In Step card is not gated", () =>
  ok(!/isPremium\(\) \? `[\s\S]{0,400}noticing-in-step-btn/.test(noticing),
     "still behind a premium gate; the spec made it free on 12 Aug"));
check("no lockedFeature wrapper remains on this screen", () =>
  ok(!/lockedFeature\(/.test(noticing), "In Step was the only gated card here"));
check("the card is always rendered", () =>
  ok(/id="noticing-in-step-btn"/.test(noticing), "card missing entirely"));
check("its tap handler is unconditional", () =>
  ok(/getElementById\("noticing-in-step-btn"\)\?\.addEventListener/.test(noticing), "handler missing"));

console.log("\nTEST 2 - the spec still says free (catches a future reversal in EITHER direction)");
check("Destination Architecture still states In Step is free", () =>
  ok(/In Step is free/.test(spec),
     "if the spec changed, this gate must be revisited rather than silently passed"));

console.log("\nTEST 3 - the door exists, and says what the spec says");
check("the door renders on the In Step result screen", () =>
  ok(/upgrade-door/.test(inStep), "section 9's offer is specified but not built"));
check("shown to free users only", () =>
  ok(/!isPremium\(\) \? `/.test(inStep), "a paying person should not be sold to"));
check("copy matches the specification", () => {
  for (const phrase of [
    "four movements, one thing at a time",
    "being steadier, being more present",
    "part of the paid plan, if you ever fancy it",
  ]) ok(inStep.includes(phrase), `missing specified line: "${phrase}"`);
});
check("copy rule 10.2 - what it is, what it does, how to get it", () => {
  ok(/four movements/.test(inStep),                 "what is it");
  ok(/build it out over months/.test(inStep),       "what would it do for me");
  ok(/id="is-door-btn"/.test(inStep),               "how do I get it");
});
check("the how-do-I-get-it route is wired", () =>
  ok(/getElementById\("is-door-btn"\)[\s\S]{0,120}navigate\("upgrade"\)/.test(inStep),
     "the third question is unanswerable"));

console.log("\nTEST 4 - P1 and P2: the coach is not the one selling");
check("the door sits outside the coach card", () => {
  const doorAt  = inStep.indexOf("upgrade-door");
  const coachAt = inStep.lastIndexOf("card-coach", doorAt);
  const between = inStep.slice(coachAt, doorAt);
  ok(/<\/div>/.test(between), "the door must not be inside the coach's card");
});
check("no coach icon inside the door", () => {
  const d = inStep.slice(inStep.indexOf("upgrade-door"), inStep.indexOf("is-door-btn"));
  ok(!/coach-icon|card-coach/.test(d), "that would make it read as the coach speaking");
});
check("no internal terms in the copy (rule 10.1)", () => {
  const d = inStep.slice(inStep.indexOf("upgrade-door"), inStep.indexOf("</aside>"));
  for (const w of ["destination", "empathy transfer", "arc", "journey", "tier", "premium"])
    ok(!new RegExp(`>[^<]*\\b${w}\\b`, "i").test(d), `"${w}" is ours, not theirs`);
});

console.log("\nTEST 5 - reaches the browser");
check("upgrade-door.css imported", () => ok(/components\/upgrade-door\.css/.test(mainC), "index.html links only main.css"));
check("upgrade-door.css precached", () => ok(/components\/upgrade-door\.css/.test(sw), "offline styling would drop"));

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
