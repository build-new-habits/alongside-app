/**
 * tools/verify-checkin-exit.mjs
 * 31 Aug 2026 v1
 *
 * CHECKIN-EXIT.
 *
 * Updating a check-in is not a request to be taken somewhere. Both exits
 * from checkin-mini.js fell back to "intention" whenever no
 * pendingDoorRoute was set -- which is every time somebody simply told
 * the coach how they were doing.
 *
 * What made it hard to spot: intention.js renders its own <h1>Today</h1>
 * and carries the bottom nav, so arriving there is indistinguishable
 * from arriving home, except that the screen is different. Its own v8
 * header (19 Jul) says it is a session-exit destination and not the
 * daily-use screen. It also records that intention.js and
 * coach-reflection.js are two live screens serving the same purpose --
 * flagged then, fenced out of scope, still true. That is DUPE-SCREENS
 * and is not what this gate covers.
 *
 * Assertion 2 is the general form and matters more than assertion 1: NO
 * check-in exit may land on a screen that documents itself as not being
 * the daily one. Written generally so the next route added here inherits
 * it.
 */
import fs from "node:fs";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const strip = s => s
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/<!--[\s\S]*?-->/g, "");

const mini = strip(fs.readFileSync("js/views/checkin-mini.js", "utf8"));

// Screens that are not the daily-use home surface. intention.js says so
// in its own header; coach-reflection is its documented duplicate.
const NOT_DAILY = ["intention", "coach-reflection"];

console.log("\nTEST 1 - a check-in returns you to the app you were using");

check("1a. neither exit falls back to a non-daily screen", () => {
  for (const route of NOT_DAILY) {
    ok(!mini.includes(`router.navigate("${route}")`),
       `checkin-mini exits to "${route}". Somebody who only updated their check-in ` +
       `is moved to a screen that is not the daily one and cannot tell, because it ` +
       `renders its own <h1>Today</h1>.`);
  }
});

check("1b. both exits fall back to today", () => {
  const n = (mini.match(/router\.navigate\("today"\)/g) || []).length;
  ok(n === 2, `expected 2 fallbacks to "today", found ${n} (skip path and continue path)`);
});

console.log("\nTEST 2 - the pending-door contract is untouched");

check("2a. both exits still honour pendingDoorRoute first", () => {
  const n = (mini.match(/store\.get\("pendingDoorRoute"\)/g) || []).length;
  ok(n === 2, `pendingDoorRoute is read ${n} times, expected 2`);
  // The fallback must be the ELSE branch. If the door check were removed,
  // somebody routed through check-in on the way to a door would be
  // dropped on Today instead of where they actually tapped.
  const cleared = (mini.match(/store\.set\("pendingDoorRoute", null\)/g) || []).length;
  ok(cleared === 2, `pendingDoorRoute is cleared ${cleared} times, expected 2`);
});

check("2b. the pending route is read before the fallback in both exits", () => {
  let from = 0;
  for (let i = 0; i < 2; i++) {
    const get  = mini.indexOf('store.get("pendingDoorRoute")', from);
    ok(get > -1, "missing a pendingDoorRoute read");
    const fall = mini.indexOf('router.navigate("today")', get);
    const nav  = mini.indexOf("router.navigate(pending)", get);
    ok(nav > -1 && nav < fall,
       "the today fallback runs before the pending door is honoured");
    from = fall + 1;
  }
});

console.log(fails === 0
  ? "\nCHECKIN-EXIT: all assertions pass\n"
  : "\nCHECKIN-EXIT: " + fails + " FAILED\n");
process.exit(fails === 0 ? 0 : 1);
