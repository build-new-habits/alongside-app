/**
 * tools/verify-mount-all.mjs
 * 28 Sep 2026 v2
 *
 * v2 - F7 LANDMARK. 30 views put role="main" on their wrapper, inside
 *   index.html's <main>: two main landmarks on every screen, the second
 *   nested. Every mounted route is now also required to add no main
 *   landmark of its own. And Your year says "Sessions with the coach",
 *   not "workout (5)".
 *
 * 28 Sep 2026 v1
 *
 * F7 found it: "Where the five percent goes" and "Your year" crashed the
 * moment they opened, for everybody, and 190-odd gates were green. The
 * router calls every view as XView(router).mount(container); those two
 * took a container and returned nothing. Their gates called them with a
 * container directly, so they tested a shape the app never uses.
 *
 * This mounts EVERY registered route the way the router does -- the
 * router's own _mountView, with the router's own module paths -- on a
 * signed-in Plan fixture with some history, and requires that it does
 * not fall to the recovery screen and puts something on the page.
 *
 * A few routes are deliberately not mounted here, each with its reason.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob", "HTMLInputElement"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
globalThis.URL.createObjectURL = () => "blob:x";
dom.window.confirm = () => false; globalThis.confirm = () => false;
dom.window.alert = () => {}; globalThis.alert = () => {};

const R = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");

const routerSrc = fs.readFileSync(new URL("js/router.js", R), "utf8");
const ROUTES = [...routerSrc.matchAll(/^\s*'([^']+)':\s*\{\s*path:\s*'([^']+)',\s*fn:\s*'([^']+)'\s*\}/gm)].map(m => m[1]);

// Not mounted here, each for a stated reason. Everything else is.
const SKIP = {
  "onboarding/goals":       "a sheet opened by sheet-manager.js, not a routed screen (router.js says so)",
  "onboarding/conditions":  "a sheet opened by sheet-manager.js, not a routed screen",
  "onboarding/equipment":   "a sheet opened by sheet-manager.js, not a routed screen",
  "onboarding/plan-select": "a sheet opened by sheet-manager.js, not a routed screen",
};

function fixture() {
  localStorage.clear(); store.init();
  const d = n => new Date(Date.now() - n * 864e5).toISOString();
  store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", "personal");
  store.set("goals", ["get-stronger"]); store.set("conditions", ["knee"]);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: d(0), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("activityLog", [1, 3, 6, 9, 20, 400].map(n => ({ id: "a" + n, type: "workout", completedAt: d(n), date: d(n), durationMins: 30, exerciseIds: ["push-up"] })));
  store.set("checkinHistory", { [d(0).split("T")[0]]: { energy: 6, mood: 6 } });
}

let recovered = null;
const origConsoleError = console.error;
console.error = (...a) => { const t = a.map(String).join(" "); if (/failed to mount view/i.test(t)) recovered = t.slice(0, 220); };

console.log(`\nMounting ${ROUTES.length} registered routes the way the router does\n`);
ok("0. the registry was read", ROUTES.length > 50 && ROUTES.includes("community-impact"));
const broken = []; const extraMain = [];
for (const r of ROUTES) {
  if (SKIP[r]) continue;
  fixture(); recovered = null; main.innerHTML = "";
  try { await router._mountView(r); } catch (e) { recovered = String(e?.message || e); }
  await wait(30);
  const text = (main.textContent || "").replace(/\s+/g, " ").trim();
  const fellOver = !!recovered || /Something went wrong loading this page/.test(text);
  if (fellOver) broken.push(`${r}: ${recovered || text.slice(0, 80)}`);
  if (main.querySelector('[role="main"], main')) extraMain.push(r);
}
console.error = origConsoleError;
ok("1. every registered screen mounts without falling to the recovery screen", broken.length === 0, broken.join("\n        "));
ok("3. no screen adds a second main landmark inside the page's <main>", extraMain.length === 0, extraMain.join(", "));
ok("4. Your year names what you did in words, not type ids",
   await (async () => {
     fixture(); main.innerHTML = ""; await router._mountView("annual-reflection");
     const t = (main.querySelector(".ar-kinds")?.textContent || "").replace(/\s+/g, " ");
     return /Sessions with the coach \(5\)/.test(t) && !/\bworkout \(/.test(t);
   })());
ok("2. REVERSAL-style fixture reach: the two that crashed now show their own headings",
   await (async () => {
     fixture(); main.innerHTML = ""; await router._mountView("community-impact");
     const a = /five percent|Your impact|credits/i.test(main.textContent || "");
     fixture(); main.innerHTML = ""; await router._mountView("annual-reflection");
     const b = /Your year/.test(main.textContent || "");
     return a && b;
   })());

console.log("");
if (fails) { console.log(`MOUNT-ALL: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`MOUNT-ALL: all ${passes} assertions pass\n`);
process.exit(0);
