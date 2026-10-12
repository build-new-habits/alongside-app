/**
 * tools/verify-warm-views.mjs
 * 12 Oct 2026 v1
 *
 * A-8 SPEED (Stage AWARD). After Home draws, the code for the screens
 * people open next is loaded while the phone is idle, so their first open
 * is not the slow one (measured on v656 at 6x CPU: first open of Today's
 * plan up to 342 ms, Progress up to 313 ms; a second open 26-138 ms).
 *
 *   1. warmViews() loads each of WARM_VIEWS, once, only when idle, only
 *      from Home; a failed load is swallowed.
 *   2. every path is a real view file the router opens, and is in the
 *      offline copy (sw.js), so warming never reaches the network.
 *   3. app.js calls it after the first screen, with its own import().
 */
import { readFileSync, existsSync } from "node:fs";
const ROOT = new URL("../", import.meta.url);
const { WARM_VIEWS, warmViews } = await import(new URL("js/data/warm-views.js", ROOT).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const tick = () => new Promise(r => setTimeout(r, 0));

console.log("\nTEST 1 - warmViews()");
let loaded = [], idleCb = null;
const idle = cb => { idleCb = cb; };
const load = p => { loaded.push(p); return Promise.resolve(); };
ok("1a. from Home it schedules", warmViews({ currentView: "today", load, idle }) === true);
ok("1b. nothing loads before the phone is idle", loaded.length === 0);
idleCb(); for (let i = 0; i < 10; i++) await tick();
ok("1c. when idle, each warm view loads once", JSON.stringify(loaded) === JSON.stringify(WARM_VIEWS), JSON.stringify(loaded));
loaded = []; idleCb = null;
ok("1d. REVERSAL: not from onboarding or the age question", warmViews({ currentView: "onboarding/thread", load, idle }) === false && idleCb === null);
loaded = [];
const flaky = p => { loaded.push(p); return p.includes("progress") ? Promise.reject(new Error("x")) : Promise.resolve(); };
warmViews({ currentView: "today", load: flaky, idle: cb => cb() });
for (let i = 0; i < 10; i++) await tick();
ok("1e. a failed load is ignored, and the rest still load", loaded.length === WARM_VIEWS.length, JSON.stringify(loaded));

console.log("\nTEST 2 - every warm view is a real, precached view");
const router = readFileSync(new URL("js/router.js", ROOT), "utf8");
const sw = readFileSync(new URL("sw.js", ROOT), "utf8");
for (const p of WARM_VIEWS) {
  const file = "js/" + p.replace(/^\.\//, "");
  ok(`2a. ${file} exists and the router opens it`, existsSync(new URL(file, ROOT)) && router.includes(`'${p}'`));
  ok(`2b. ${file} is in the offline copy`, sw.includes(file));
}
ok("2c. warm-views.js itself is in the offline copy", sw.includes("js/data/warm-views.js"));

console.log("\nTEST 3 - app.js warms after the first screen");
const app = readFileSync(new URL("js/app.js", ROOT), "utf8");
const at = app.indexOf("warmViews(");
ok("3a. app.js calls warmViews with its own import()", at > 0 && /load:\s*p\s*=>\s*import\(p\)/.test(app.slice(at, at + 200)));
ok("3b. after the first screen has been opened", at > app.indexOf("await router.navigate(firstView)"));

console.log(`\nVERIFY-WARM-VIEWS: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
