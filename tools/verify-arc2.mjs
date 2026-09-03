/**
 * tools/verify-arc2.mjs
 * 03 Sep 2026 v1
 *
 * ARC-2. The surface that starts and stops a stretch arc.
 *
 * ARC-1 built all the machinery and nothing set stretchArc.active, so
 * none of it could ever appear. That is the specific failure this gate
 * exists to prevent recurring: a feature complete in every part except
 * the one that turns it on.
 *
 * The rest of the file guards the two properties that make a coverage
 * readout possible at all in a product with no streaks:
 *
 *   IT COUNTS NOTHING. "Hips came up on the 2nd" is a fact about the
 *   plan. "You have done hips four times" is a score. The first can be
 *   shown; the second cannot, and the gap between them is one word.
 *
 *   LEAVING IS UNPUNISHED. No confirmation, no summary of what is being
 *   given up, no offer to pause instead. Each of those makes stopping
 *   feel like a failure, which is the mechanic the whole product refuses.
 */
import fs from "node:fs";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const strip = t => t
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/<!--[\s\S]*?-->/g, "");
const read = p => strip(fs.readFileSync(p, "utf8"));

const arc = read("js/views/stretch-arc.js");

console.log("\nTEST 1 - the arc can actually be turned on");

check("1a. something sets active to true", () => {
  ok(/active:\s*true/.test(arc),
     "nothing sets stretchArc.active. This is the exact state ARC-1 shipped in: every " +
     "part built except the one that turns it on.");
});

check("1b. and something turns it off", () => {
  ok(/active:\s*false/.test(arc), "an arc that cannot be stopped is a commitment, not a direction");
});

check("1c. the route is registered and reachable", () => {
  ok(/'stretch-arc'\s*:/.test(read("js/router.js")), "no stretch-arc route");
  const mc = read("js/views/mobility-conditioning.js");
  ok(mc.includes('navigate("stretch-arc")'),
     "nothing navigates to the arc, so it exists and cannot be found");
  ok(fs.readFileSync("sw.js", "utf8").includes("views/stretch-arc.js"),
     "the shell does not precache it, so it breaks offline and on a stale install");
});

console.log("\nTEST 2 - the arc keeps no score");

check("2a. coverage is shown as when, never how many", () => {
  for (const bad of ["times", "sessions so far", "streak", "in a row", "you've done",
                     "you have done", "total", "count"]) {
    ok(!arc.toLowerCase().includes(bad),
       `the arc screen says "${bad}". A date is a fact about the plan; a number is a score.`);
  }
});

check("2b. it does no arithmetic on coverage", () => {
  const at = arc.indexOf("function whenText");
  ok(at > -1, "no date formatter");
  const body = arc.slice(at, arc.indexOf("\n}", at));
  for (const bad of ["Date.now", "getTime", "ago", "daysSince", " - "]) {
    ok(!body.includes(bad),
       `whenText computes with "${bad}". "3 days ago" is a countdown, and a countdown is ` +
       `something to be behind on.`);
  }
});

check("2c. it promises no schedule", () => {
  // PHRASES, not words. The bare word "owe" flagged "Nothing owed here"
  // -- the sentence assertion 4 REQUIRES, written precisely to stop a
  // coverage list reading as a to-do list. A banned-word list that
  // catches the mitigation is worse than no list: it pushes the writer
  // to delete the safeguard to get green.
  for (const bad of ["this week you", "you owe", "you're due", "you are due",
                     "falling behind", "catch up", "weekly target",
                     "sessions a week", "keep it up", "don't break"]) {
    ok(!arc.toLowerCase().includes(bad),
       `the arc screen says "${bad}", which creates a state the person can fail`);
  }
});

console.log("\nTEST 3 - stopping is unpunished");

check("3a. no confirmation, no guilt", () => {
  const at = arc.indexOf("sa-stop-btn");
  ok(at > -1, "no stop control");
  const handler = arc.slice(arc.indexOf('"#sa-stop-btn"'), arc.indexOf('"#sa-stop-btn"') + 700);
  ok(!/confirm\(/.test(handler), "stopping asks for confirmation, which frames leaving as a mistake");
  for (const bad of ["are you sure", "instead", "pause"]) {
    ok(!arc.toLowerCase().includes(bad), `the arc screen says "${bad}" — leaving must be uncomplicated`);
  }
});

check("3b. coverage survives stopping", () => {
  const handler = arc.slice(arc.indexOf('"#sa-stop-btn"'), arc.indexOf('"#sa-stop-btn"') + 700);
  ok(handler.includes("...store.get(\"stretchArc\")") || handler.includes("...arc"),
     "stopping replaces the whole object, discarding zonesWorked. Coming back in a month " +
     "should not start from nothing.");
  ok(!/zonesWorked:\s*\{\}/.test(handler), "stopping wipes the coverage dates");
});

check("3c. restarting continues rather than resets", () => {
  const handler = arc.slice(arc.indexOf('"#sa-start-btn"'), arc.indexOf('"#sa-start-btn"') + 800);
  ok(handler.includes("arc.startedAt ||"),
     "restarting re-dates the arc, erasing the only history it has");
});

console.log("\nTEST 4 - the language is about the plan, not the person");

check("4. uncovered zones are stated as a gap, not a lapse", () => {
  ok(arc.includes("Not come up yet") || arc.includes("hasn't come up"),
     "no uncovered-zone surface");
  ok(/Nothing owed here/.test(arc),
     "the uncovered list is presented without saying it is owed nothing, which is the " +
     "sentence that stops a coverage list reading as a to-do list");
});

console.log(fails === 0
  ? "\nARC-2: all assertions pass\n"
  : "\nARC-2: " + fails + " FAILED\n");
process.exit(fails === 0 ? 0 : 1);
