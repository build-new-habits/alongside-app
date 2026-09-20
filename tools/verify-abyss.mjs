/**
 * tools/verify-abyss.mjs
 * 16 Sep 2026 v1
 *
 * ABYSS. Nobody is ever left on a screen with no way out.
 *
 * Graeme, on device: "I exited without saving and got stuck here. Home
 * button doesn't work. There's nothing here. I'm in the abyss."
 *
 * 🔴 THREE FAULTS, COMPOUNDING. Each is survivable alone, and no gate
 * covered any of them because each lives in the seam between two files.
 *
 *   1. session-guard.js keeps module-level state and is dismounted by
 *      the VIEW that mounted it. A view leaving by any other path never
 *      dismounts, so the guard stays active forever -- and
 *      #hidden-nav-home-btn asks the guard first. The home button was
 *      not dead; it was rendering a confirm card into a wiped container.
 *
 *   2. The router's catch only fired on a THROW. A view returning ""
 *      produced a blank container and no error at all.
 *
 *   3. The recovery button used an inline onclick referencing a global.
 *      The one control on the error screen depended on two things that
 *      can be absent exactly when everything else has gone wrong.
 *
 * ⚫ This gate asserts the CONTRACT, not one route: whatever breaks, the
 * person gets a way out. A test pinning "the blank screen after exiting
 * a yoga session" would have fixed one path and left the class.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const fs = __require("node:fs");

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const read = p => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const router = strip(read("js/router.js"));
const guard  = strip(read("js/session-guard.js"));

console.log("\nABYSS\n");

console.log("TEST 1 — the guard cannot outlive its view");

ok("1.1 navigate dismounts the session guard", /dismountSessionGuard\(\)/.test(router),
   "a stale guard makes the home escape hatch render a confirm card into a " +
   "container that has just been wiped -- the button looks dead");

ok("1.2 it is loaded lazily, because session-guard imports router", (() => {
  return /await import\(['"]\.\/session-guard\.js['"]\)/.test(router) &&
         !/^import .*session-guard/m.test(router);
})(), "a static import here closes a cycle: session-guard.js calls router.navigate");

ok("1.3 the dismount cannot block a navigation", (() => {
  const i = router.indexOf("session-guard.js");
  return /try\s*\{/.test(router.slice(Math.max(0, i - 300), i + 200));
})(), "if dismounting throws, the person must still reach the next screen");

ok("1.4 REVERSAL: the guard genuinely holds module-level state",
   /_guardActive/.test(guard),
   "if the guard became stateless this whole fault class would be gone and " +
   "this test should be retired deliberately, not left passing by accident");

console.log("\nTEST 2 — an empty render is a failure, not silence");

ok("2.1 the router checks something was painted",
   /rendered nothing/.test(router),
   "the catch only ever fired on a throw; a view returning \"\" produced a " +
   "blank screen and no error");

// 🔴 BLANK-TIMING, 16 Sep 2026. The first version of this check ran
// IMMEDIATELY after mount and broke check-in within a day.
//
// check-in builds its conversation over time -- the coach's first line
// arrives after a short delay, like a real message thread. So the
// instant it mounts the container IS empty, and an immediate check
// declared a working view broken. Graeme got the recovery screen where
// the coach should have been.
//
// The principle was right; the timing was wrong. A blank screen a
// second after opening is a fault. A blank screen in the same instant is
// a view that has not spoken yet.
ok("2.1a the check is DEFERRED, not immediate",
   /setTimeout\(\(\) => \{[\s\S]{0,600}rendered nothing/.test(router),
   "an immediate check cannot tell a broken view from one that renders " +
   "progressively, and several of this app's views do");

ok("2.1b REVERSAL: it does not throw synchronously any more",
   !/if \(!painted\)\s*\{?\s*throw new Error/.test(router),
   "a throw there is the immediate check, back");

ok("2.1c it only judges the view still on screen",
   /this\.currentView !== _blankCheckFor/.test(router),
   "somebody may navigate on during the delay; judging a view they have " +
   "already left would replace the screen they asked for");

ok("2.1d both paths use ONE recovery routine",
   /_recover\(container, viewName, err\)/.test(router) &&
   /_recover\(container, viewName,\s*$/m.test(router) === false ||
   /_recover\(container, viewName/g.test(router),
   "two recovery screens would drift, and one of them is the screen somebody " +
   "sees when everything else has already gone wrong");

// 🔴 CORRECTED TWICE IN ONE DAY, AND BOTH EARLIER VERSIONS WERE GUESSES.
//
// v27 asked "is there TEXT" immediately after mount. v28 asked the same
// question 800ms later. check-in writes its markup AT ONCE -- 484
// characters of thread shell -- but the coach's first WORDS arrive
// between one and two and a half seconds, like a real message. So v28
// failed too, and a bigger number would only have been a better guess.
//
// The question was wrong, not the timing. A container holding half a
// kilobyte of structure is not blank; it is a view mid-render. The
// failure this exists for is a container with NOTHING in it.
ok("2.2 the check asks whether the container is EMPTY, not whether it has text",
   /innerHTML \|\| ''\)\.trim\(\)\.length > 0/.test(router),
   "asking about text fails any view whose content arrives progressively, and " +
   "check-in is one");

ok("2.2a REVERSAL: it no longer reads textContent for this",
   !/textContent \|\| ''\)\.trim\(\)\.length > 0\s*\n?\s*\|\|/.test(router),
   "the text-based form is the version that broke check-in");

ok("2.3 the check is deferred AND asks about markup, so both corrections hold", (() => {
  const i = router.indexOf("rendered nothing");
  const body = router.slice(Math.max(0, i - 1200), i);
  return /setTimeout/.test(body) && /innerHTML/.test(body) && !/textContent/.test(body);
})(), "structure without text yet is exactly the state check-in is in at 300ms, " +
      "and either correction alone still fails it");

console.log("\nTEST 3 — the way out always works");

ok("3.1 no inline onclick anywhere in the router",
   !/onclick=/.test(router),
   "inline handlers are the first thing a CSP removes, and the error screen is " +
   "exactly where a dependency must not be optional");

ok("3.2 the recovery button is built and bound", (() => {
  const i = router.indexOf("Go home");
  const body = router.slice(Math.max(0, i - 400), i + 400);
  return /createElement\(['"]button['"]\)/.test(router) &&
         /addEventListener\(['"]click['"]/.test(body);
})());

ok("3.3 it dismounts the guard before navigating", (() => {
  const i = router.indexOf("Go home");
  return /dismountSessionGuard/.test(router.slice(i, i + 500));
})(), "otherwise the recovery button hits the same stale guard that caused this");

ok("3.4 focus moves to it, so a screen reader is not left on nothing",
   /btn\.focus\(\)/.test(router));

console.log("\nTEST 4 — the next failure reports its own path");

ok("4.1 a route trail is kept", /_trail/.test(router));
ok("4.2 and it is bounded, not an unbounded log",
   /slice\(-\d+\)/.test(router));
ok("4.3 failures are reported with the trail",
   /captureException[\s\S]{0,200}trail/.test(router),
   "this is what replaces asking somebody to reconstruct three taps from memory");
ok("4.4 REVERSAL: reporting cannot itself throw", (() => {
  const i = router.indexOf("captureException");
  return /try\s*\{/.test(router.slice(Math.max(0, i - 200), i));
})());

console.log("");
if (fail) { console.log("ABYSS: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("ABYSS: all " + pass + " assertions pass\n");
