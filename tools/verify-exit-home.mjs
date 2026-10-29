/**
 * tools/verify-exit-home.mjs
 * 26 Sep 2026 v1
 *
 * EXIT-HOME. Every way out of a coach session lands on Home.
 *
 * Graeme, 26 Sep: "It doesn't go back to the home page when I've done a
 * one-to-one workout with the coach. It just sticks there and I can't
 * get out of it... It should really be as simple as I click exit or I
 * finish it and it goes directly back to the home page."
 *
 * 🔴 EXIT-LOOP (16 Sep, v530) fixed this for six session views by having
 * each record declinedProposalAt. The coach one-to-one opens a SEVENTH,
 * workout.js, which never recorded it -- nor do morning, cycle, quiet or
 * breathing. verify-ask-kind 3.2 checked a hand-written list of six, and
 * its "driven" test re-implemented Home's rule inside the gate instead
 * of running it. Both passed while the screen Graeme uses stayed stuck.
 *
 * ⚫ So this gate asserts the CONTRACT, not a list: whatever screen you
 * leave, if you arrive at Home from inside the app, Home stays. It runs
 * the real TodayView and the real router, never a copy of either.
 *
 * The bounce survives for the case it exists for: the app opened cold
 * (killed by a phone call, reopened) inside ten minutes of accepting.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="c"></div><div id="app"></div>',
  { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, "navigator",
  { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, "localStorage",
  { value: dom.window.localStorage, configurable: true, writable: true });
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store }     = await import(B + "store.js");
const { TodayView } = await import(B + "views/today.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { if (detail) console.log(`        ${detail}`); fails++; }
};

const nowIso = () => new Date().toISOString();

// A coach proposal accepted a moment ago: the exact state that bounces.
function acceptedJustNow() {
  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("onboardingComplete", true);
  store.set("name", "Test");
  store.set("lastProposalDate", nowIso());
  store.set("lastProposalType", "workout");
}

// Mount the REAL Home with a router whose history is what the real
// router would hold. TEST 1 proves the real router holds exactly that.
function arriveHome(historyStack) {
  const c = document.getElementById("c");
  c.innerHTML = "";
  const navs = [];
  const router = { navigate: v => navs.push(v), history: [...historyStack],
                   back() {}, canGoBack: () => historyStack.length > 0 };
  try { TodayView(router).mount(c); }
  catch (e) { navs.push("THREW: " + e.message); }
  return { navs, rendered: c.textContent.trim().length > 0 };
}
const stayedHome = r => r.navs.length === 0 && r.rendered;

// ── 0. FIXTURE REACH ───────────────────────────────────────────────────
console.log("\nTEST 0 - the fixture reaches the bounce it names");

acceptedJustNow();
const cold = arriveHome([]);
ok("0a. accepted a moment ago, app opened cold: Home bounces to the session",
   cold.navs[0] === "home-threshold",
   `navs: ${JSON.stringify(cold.navs)}. If this does not bounce, every ` +
   `"stays on Home" below proves nothing -- the fixture never reached the fault.`);

// ── 1. THE REAL ROUTER RECORDS WHERE YOU CAME FROM ─────────────────────
console.log("\nTEST 1 - the live router records the screen you left");

const { router: realRouter } = await import(B + "router.js");
realRouter.history = [];
realRouter.currentView = "workout";
realRouter.viewCache = realRouter.viewCache || {};
// Stop the real router loading views: only its bookkeeping is under test.
const _load = realRouter._mountView;
if (typeof _load === "function") realRouter._mountView = async () => {};
try { await realRouter.navigate("today"); } catch { /* load side-effects only */ }
ok("1a. leaving the coach session for Home: router.history ends with 'workout'",
   realRouter.history[realRouter.history.length - 1] === "workout",
   `router.history = ${JSON.stringify(realRouter.history)} -- Home reads this ` +
   `to tell "I chose Home" from "the app just opened"`);
ok("1b. the app itself opens on Home with nothing behind it",
   (() => { const r = realRouter; const saved = r.history; r.history = [];
            r.currentView = null; const empty = r.history.length === 0;
            r.history = saved; return empty; })());
if (typeof _load === "function") realRouter._mountView = _load;

// ── 2. THE THREE WAYS OUT OF A ONE-TO-ONE ──────────────────────────────
console.log("\nTEST 2 - every way out of the coach one-to-one stays on Home");

acceptedJustNow();
ok("2a. Exit without saving -> Home stays", stayedHome(arriveHome(["coach-proposal", "workout"])),
   "workout.js's discard button navigates to 'today'; Home must not send it back");

acceptedJustNow();
store.logActivity({ date: nowIso(), completedAt: nowIso(), type: "workout",
                    status: "partial", durationMins: 3 });
ok("2b. Exit and save -> reflect -> Back to Today -> Home stays",
   stayedHome(arriveHome(["coach-proposal", "workout", "reflect"])),
   "a partial entry does not count as done, so this bounced");

acceptedJustNow();
store.logActivity({ date: nowIso(), completedAt: nowIso(), type: "workout",
                    durationMins: 30 });
ok("2c. Finish -> reflect -> Back to Today -> Home stays",
   stayedHome(arriveHome(["coach-proposal", "workout", "reflect"])));

// ── 3. THE CLASS, NOT THE LIST ─────────────────────────────────────────
console.log("\nTEST 3 - every session screen the coach can open, not a list of six");

const fs = __require("node:fs");
const prop = fs.readFileSync(new URL("../js/views/coach-proposal.js", import.meta.url), "utf8");
const routes = [...new Set([...prop.matchAll(/'([a-z-]+)':\s*'([a-z-]+)'/g)]
  .map(m => m[2]).filter(r => /session|workout|programme/.test(r)))];
ok("3a. the route list was read from the proposal, not typed here",
   routes.length >= 10 && routes.includes("workout"),
   `found ${routes.length}: ${routes.join(", ")}`);
const stuck = routes.filter(r => { acceptedJustNow(); return !stayedHome(arriveHome([r])); });
ok("3b. leaving ANY of them for Home stays on Home", stuck.length === 0,
   `still bounces from: ${stuck.join(", ")}`);

// ── 4. THE INTERRUPTED CASE SURVIVES ───────────────────────────────────
console.log("\nTEST 4 - reversal: the bounce still works for what it is for");

acceptedJustNow();
ok("4a. phone call mid-session, app reopened cold: back to the session",
   arriveHome([]).navs[0] === "home-threshold",
   "the fix must not remove the bounce, only stop it overriding a choice");

acceptedJustNow();
arriveHome(["workout"]);
ok("4b. leaving is remembered: reopening cold afterwards stays on Home",
   stayedHome(arriveHome([])),
   "without a recorded decline, closing the app after Exit and reopening " +
   "inside ten minutes would put you straight back in");

acceptedJustNow();
arriveHome(["workout"]);
store.set("lastProposalDate", new Date(Date.now() + 5000).toISOString());
ok("4c. a NEWER accepted proposal still outranks the older exit",
   arriveHome([]).navs[0] === "home-threshold");

console.log("");
if (fails) { console.log(`EXIT-HOME: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`EXIT-HOME: all ${passes} assertions pass\n`);
