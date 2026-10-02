/**
 * tools/verify-run-sore.mjs
 * 02 Oct 2026 v2
 *
 * v2 - W4-1 GATE-OPEN. The fixture person has agreed (tools/agreed.mjs): the
 *   app now sends anybody who has not back to onboarding. No assertion
 *   changed.
 *
 * W3-2 RUN-SORE (Wave 3, persona 2.1). The Run door is the one door a
 * runner uses, and it did not know today:
 *   - a back answered Bad that morning still got a full intervals
 *     session -- the severe-day choice lives only on the coach's route;
 *   - "No interval efforts today" about a sore hamstring, then Intervals
 *     offered and played;
 *   - the intervals finish said "The discomfort you just pushed through
 *     is exactly where fitness is built", and a cue "The effort you just
 *     pushed through": push-through talk, against the hurt-and-ache
 *     advice every card gives;
 *   - a note told the user how to handle plantar fasciitis by name.
 *
 *   1. Severe today: the Run door asks Rest today or Something gentler,
 *      in the coach's own words, before any run; both lead to the coach's
 *      screen with that choice recorded; Something gentler shows a plan
 *      and a Start button.
 *   2. A sore hamstring: Intervals is not offered, and it says why.
 *   3. No push-through line and no named condition in the Run door.
 *   4. Control: nothing sore, three run types, no question.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;
dom.window.alert = () => {}; globalThis.alert = () => {};

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const gate = await import(B + "safety-gate.js");
const RF = await import(B + "data/red-flag.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s), $$ = s => [...main.querySelectorAll(s)];
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));

function fixture(tier, conditions = [], scores = {}) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("equipment", ["dumbbells", "bench"]); store.set("homeEquipment", ["dumbbells", "bench"]);
  store.set("conditions", conditions); store.set("conditionPainScores", scores);
  store.set("redFlag", { screenedAt: new Date().toISOString(), areas: conditions, textVersion: RF.RED_FLAG_VERSION, level: null, flaggedAt: null, clearedAt: null });
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
async function go(view) { await router.navigate(view); await wait(80); }
const visible = el => !!el && !el.closest("[hidden]") && !el.disabled;
const btn = re => [...main.querySelectorAll("button")].find(b => re.test(txt(b)) && visible(b));
const types = () => [...main.querySelectorAll(".ws-type-card[data-type]")].map(b => b.dataset.type);

console.log("\nTEST 1 - severe today: the Run door asks first");
fixture("free", ["lower-back"], { "lower-back": 8 });
await go("running-session");
ok("1pc. reached the Run door, not the red-flag screen", router.currentView === "running-session", router.currentView);
ok("1a. no run types while it is severe", types().length === 0, types().join(","));
ok("1b. the coach's words: really difficult, medical support, gentle or rest, stop if it gets worse",
   /really difficult today/.test(txt(main)) && /can't give you medical support/.test(txt(main)) && /keep today gentle, or we can call it a rest day/.test(txt(main)) && /Stop if it gets worse/.test(txt(main)), txt(main).slice(0, 300));
ok("1c. Rest today and Something gentler, both buttons", !!btn(/^Rest today/) && !!btn(/^Something gentler/));
click(btn(/^Something gentler/)); await wait(150);
const choices = store.get("severePainChoices") || [];
ok("1d. Something gentler records the choice and opens the coach's screen", router.currentView === "coach-proposal" && choices.at(-1)?.choice === "adapt", `${router.currentView} ${JSON.stringify(choices.at(-1))}`);
ok("1e. with a plan and a Start button", [...main.querySelectorAll(".cp-plan__row")].some(r => !r.closest("[hidden]")) && !!btn(/^Start\b/), txt(main).slice(0, 200));
fixture("free", ["lower-back"], { "lower-back": 8 });
await go("running-session");
click(btn(/^Rest today/)); await wait(150);
ok("1f. Rest today records rest and shows the rest options", router.currentView === "coach-proposal" && (store.get("severePainChoices") || []).at(-1)?.choice === "rest" && !!main.querySelector("[data-rest-action]"), txt(main).slice(0, 160));

console.log("\nTEST 2 - a sore hamstring: no intervals, and why");
fixture("free", ["hamstring"], { hamstring: 4 });
await go("running-session");
ok("2a. Easy and Long, not Intervals", types().join(",") === "easy,long", types().join(","));
ok("2b. it says intervals are off today because of the hamstring", /intervals/i.test(txt(main)) && /hamstring/i.test(txt(main)), txt(main).slice(0, 240));

console.log("\nTEST 3 - no push-through, no named condition");
const src = (await import("node:fs")).readFileSync(new URL("../js/views/running-session.js", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
ok("3a. no line says pushed through", !/pushed through/i.test(src));
ok("3b. no line names plantar fasciitis", !/plantar fasciitis/i.test(src));

console.log("\nTEST 4 - control: nothing sore");
fixture("free", [], {});
await go("running-session");
ok("4a. three run types, no question", types().join(",") === "easy,intervals,long" && !btn(/^Rest today/), types().join(","));

console.log("");
if (fails) { console.log(`RUN-SORE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`RUN-SORE: all ${passes} assertions pass\n`);
process.exit(0);
