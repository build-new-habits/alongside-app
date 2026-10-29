import { createRequire as __cr } from "node:module";
/**
 * tools/verify-checkin-inside.mjs
 * 29 Oct 2026 v1
 *
 * STAGE PATH P-4, mock-up v10 (Graeme, 29 Oct: "I like v10"; he asked
 * "what if the check-in lives inside each first set of exercises and bit
 * before"). On the Plan the check-in is asked inside the way in somebody
 * chose, just before the day's first session:
 *   1. the first question says where they are going ("Before you
 *      stretch, how's your energy today?"), after the usual opening;
 *   2. "Not today" sits with it: the day counts as answered (dayOpen
 *      'pick'), nothing is saved as a check-in, and they go on to where
 *      they were going;
 *   3. answered, it goes on to where they were going as before
 *      (pendingDoorRoute);
 *   4. Free's check-in is as it was: no "Not today", the plain question.
 *
 * Drives the real CheckinView, as verify-checkin-three does.
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = (q) => ({ matches: /prefers-reduced-motion/.test(q), media: q,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", (cb) => setTimeout(() => cb(Date.now()), 0)],
                      ["cancelAnimationFrame", (id) => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { CheckinView } = await import(B + "views/checkin.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms = 3000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const v = fn(); if (v) return v; await wait(15); }
  return null;
}
const tappables = () => [...document.querySelectorAll("#app button, .ci-panel button")].filter(b => !b.disabled && !b.closest("[hidden]"));
const threadText = () => (document.getElementById("app")?.textContent || "").replace(/\s+/g, " ");
async function tap(re) {
  const b = await waitFor(() => tappables().find(x => re.test(x.textContent.trim())));
  if (!b) return null;
  b.click(); await wait(30); return b.textContent.trim();
}

let view = null;
function setup({ tier = "personal", pending = "path", start = { door: "stretch" } } = {}) {
  if (view) { try { view.onUnmount?.(); } catch {} }
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("pendingDoorRoute", pending);
  document.querySelectorAll(".ci-panel, .ci-overlay").forEach(n => n.remove());
  const app = document.getElementById("app"); app.innerHTML = "";
  const navs = [];
  const router = { navigate: v => navs.push(v), back() {}, pathStart: start };
  view = CheckinView(router);
  view.mount(app);
  return { navs };
}
const energyAsked = () => waitFor(() => tappables().find(b => /^Running on empty$/.test(b.textContent.trim())));

console.log("\nTEST 1 - the Plan, on the way into a door");
let r = setup();
await energyAsked();
ok("1a. the first question says where they are going", /Before you stretch, how.s your energy today\?/.test(threadText()), threadText().slice(-200));
ok("1b. Not today sits with it", tappables().some(b => b.textContent.trim() === "Not today"), tappables().map(b => b.textContent.trim()).join(" | "));
await tap(/^Not today$/);
ok("1c. Not today: the day counts as answered, on to where they were going", store.dayOpenToday()?.choice === "pick" && r.navs.join() === "path" && store.get("pendingDoorRoute") === null, JSON.stringify(r.navs));
ok("1d. and nothing is saved as a check-in", !store.checkedInToday() && !Object.keys(store.get("checkinHistory") || {}).length);

for (const [start, words] of [[{ coach: true }, "Before I choose for you"], [{ door: "feel" }, "Before you move to feel better"], [{ door: "stronger" }, "Before you get stronger"], [{ door: "moving" }, "Before you move"]]) {
  setup({ start, pending: start.coach ? "today" : "path" }); await energyAsked();
  ok(`1e. ${words}`, threadText().includes(`${words}, how`), threadText().slice(-120));
}

console.log("\nTEST 2 - answered, on to where they were going");
r = setup();
await energyAsked(); await tap(/^Okay$/); await tap(/^Pretty good$/);
await tap(/^Nothing today$|^Nothing$|^No$/);
await waitFor(() => r.navs.length, 6000);
ok("2a. three answers, then its steps", r.navs.join() === "path" && store.checkedInToday(), JSON.stringify(r.navs));

console.log("\nTEST 3 - Free is as it was");
r = setup({ tier: "free", pending: "workout", start: null });
await energyAsked();
ok("3a. no Not today on Free", !tappables().some(b => b.textContent.trim() === "Not today"));
ok("3b. the plain question", /How's your energy today\?/.test(threadText()) && !/Before you/.test(threadText()));
r = setup({ pending: null, start: null });
await energyAsked();
ok("3c. the Plan with nowhere to go on to (Change my check-in): as it was", !tappables().some(b => b.textContent.trim() === "Not today") && !/Before /.test(threadText()));

if (view) { try { view.onUnmount?.(); } catch {} }
console.log(`\n${"=".repeat(60)}\nVERIFY-CHECKIN-INSIDE: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
