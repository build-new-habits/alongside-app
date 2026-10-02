/**
 * tools/verify-update-hold.mjs
 * 02 Oct 2026 v1
 *
 * W4-14 UPDATE-RELOAD (Wave 4 persona trace, 2.14). A new version reloaded
 * the app in the middle of whatever the person was doing, with no warning:
 * sw.js called skipWaiting() at the end of every install, and app.js
 * reloaded the page on every controllerchange. The update banner's Later
 * could never hold. For somebody who needs things not to change without
 * warning, and for anybody half-way through a session or a check-in, that
 * lost their place.
 *
 * Runs the REAL sw.js in a sandbox (install, message) and the REAL app.js.
 *
 *   1. Installing a new version does not take over by itself.
 *   2. It takes over when the page asks (SKIP_WAITING), and only then.
 *   3. The page reloads only when this person pressed Update; a change of
 *      worker they did not ask for does not reload them.
 *   4. The banner waits while a session, check-in, journal entry or
 *      getting started is on screen, and appears once they are back.
 *   5. Positive controls: Update still updates; Later still closes it.
 */
import { createRequire as __cr } from "node:module";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const __require = __cr(import.meta.url);
const { JSDOM, VirtualConsole } = __require("jsdom");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));

// ── 1-2. THE REAL SERVICE WORKER ────────────────────────────────────────
console.log("\nTEST 1 - installing does not take over by itself");
const swSrc = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const handlers = {};
let skips = 0;
const sandbox = {
  console: { log() {}, warn() {}, error() {} },
  self: null,
  caches: { open: async () => ({ put: async () => {}, match: async () => null, keys: async () => [] }), keys: async () => [], delete: async () => true, match: async () => null },
  fetch: async () => ({ status: 200, clone() { return this; } }),
  Request: function (u) { this.url = u; },
  Response: function () {},
  URL, Promise, setTimeout, clearTimeout,
};
sandbox.self = {
  addEventListener: (t, fn) => { (handlers[t] ||= []).push(fn); },
  skipWaiting: async () => { skips++; },
  clients: { claim: async () => {}, matchAll: async () => [] },
  registration: { scope: "https://x/" },
  location: { origin: "https://x" },
};
vm.createContext(sandbox);
vm.runInContext(swSrc, sandbox);
ok("1pc. the worker registered install and message handlers", !!handlers.install?.length && !!handlers.message?.length);
const pending = [];
for (const fn of handlers.install || []) fn({ waitUntil: p => pending.push(p) });
await Promise.allSettled(pending); await wait(10);
ok("1a. after install, it has not taken over", skips === 0, `skipWaiting called ${skips} time(s)`);

console.log("\nTEST 2 - it takes over when the page asks");
for (const fn of handlers.message || []) fn({ data: { type: "SKIP_WAITING" }, source: { postMessage() {} } });
await wait(5);
ok("2a. SKIP_WAITING takes over", skips === 1, `skipWaiting called ${skips} time(s)`);
for (const fn of handlers.message || []) fn({ data: { type: "GET_VERSION" }, source: { postMessage() {} } });
await wait(5);
ok("2b. nothing else does", skips === 1);

// ── 3-5. THE REAL PAGE ──────────────────────────────────────────────────
console.log("\nTEST 3 - the page reloads only when the person asked");
// A reload by the browser's own location.reload() shows up here as jsdom's
// "not implemented: navigation"; one through App.reload() is counted below.
let reloads = 0;
const vcon = new VirtualConsole();
vcon.on("jsdomError", e => { if (/navigation/i.test(String(e?.message || e))) reloads++; });
const dom = new JSDOM(`<!doctype html><body><div id="loading"></div><div id="app"><main id="main-content"></main></div>
  <nav id="bottom-nav" class="hidden"></nav><button id="hidden-nav-home-btn" class="hidden"></button></body>`, { url: "https://x/", virtualConsole: vcon });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
const swc = new dom.window.EventTarget();
let posted = [];
const waiting = { postMessage: m => posted.push(m), state: "installed" };
const reg = new dom.window.EventTarget();
Object.assign(reg, { waiting, installing: null, scope: "https://x/", update: async () => {} });
swc.register = async () => reg;
swc.controller = {};
swc.getRegistration = async () => reg;
const nav = Object.create(dom.window.navigator);
Object.defineProperty(nav, "serviceWorker", { value: swc });
Object.defineProperty(globalThis, "navigator", { value: nav, configurable: true, writable: true });
Object.defineProperty(dom.window, "navigator", { value: nav, configurable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.fetch = dom.window.fetch = async () => ({ ok: true, json: async () => ({ messages: [] }) });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
await import(B + "app.js");
const { agreed } = await import("./agreed.mjs");
localStorage.clear(); store.init(); agreed(store); store.set("onboardingComplete", true); store.set("name", "Rowan");
router._mountView = async name => { router.currentView = name; };
window.App.reload = () => { reloads++; };
const reloadsAtStart = reloads;
await window.App.init(); await wait(30);
ok("3pc. the app started", router.currentView === "today", router.currentView);
swc.dispatchEvent(new dom.window.Event("controllerchange")); await wait(5);
ok("3a. a change of worker nobody asked for does not reload the page", reloads === reloadsAtStart, `reloads ${reloads - reloadsAtStart}`);

console.log("\nTEST 4 - the banner waits while something is in progress");
const banner = () => document.getElementById("update-banner");
for (const view of ["workout", "breathing-session", "checkin", "journal-entry", "capture", "onboarding/thread"]) {
  banner()?.remove();
  router.currentView = view;
  window.App.showUpdateBanner();
  ok(`4a. ${view}: no banner yet`, !banner());
}
router.currentView = "today";
window.App.showUpdateBanner();
ok("4b. back on Home: the banner shows", !!banner());

console.log("\nTEST 5 - Update still updates; Later still closes");
document.getElementById("update-dismiss-btn")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
ok("5a. Later closes it, and nothing is asked of the worker", !banner() && posted.length === 0);
window.App.showUpdateBanner();
document.getElementById("update-apply-btn")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
await wait(5);
ok("5b. Update asks the waiting worker to take over", posted.some(m => m?.type === "SKIP_WAITING"), JSON.stringify(posted));
swc.dispatchEvent(new dom.window.Event("controllerchange")); await wait(5);
ok("5c. and then the page reloads, once", reloads - reloadsAtStart === 1, `reloads ${reloads - reloadsAtStart}`);

console.log(`\nUPDATE-HOLD: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
