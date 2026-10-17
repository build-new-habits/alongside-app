/**
 * tools/verify-w6-session7.mjs
 * 17 Oct 2026 v1
 *
 * Stage W6, session 7.
 * W6-13 ARC-STRESS (2.4). With Stress listed and the goals Reduce stress
 *   and Sleep better, the arc's first eight aims were all performance. A
 *   "settling" situation now ranks the winding-down aims first (ranking
 *   only, nothing pre-filled).
 * W6-19 EMPATHY-GAPS (2.13, 2.4). A Struggling mood was stored and never
 *   answered; Home's line was the same on a good day and the worst. Now a
 *   low mood gets one plain line in the person's word: on Home, with
 *   Wellbeing; on Today's plan, with Something gentler and Wellbeing.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
dom.window.confirm = () => false;
globalThis.confirm = () => false;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const gate = await import(B + "safety-gate.js");
const WM = await import(B + "data/week-shape-model.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

const { router: realRouter } = await import(B + "router.js");

const { TodayView } = await import(B + "views/today.js");
const A = await import(B + "data/aims.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const navs = [];
const rtr = { navigate: (v) => navs.push(v), back() {}, history: [], currentView: null };
globalThis.window.router = rtr;
realRouter.navigate = rtr.navigate;
function person({ mood = 6, goals = [], conditions = [], level = "active" } = {}) {
  localStorage.clear(); store.init(); gate.endGateSession(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", "personal");
  store.set("homeEquipment", []); store.set("sessionLocation", "home");
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  store.set("goals", goals); store.set("conditions", conditions); store.set("fitnessLevel", level);
  store.set("checkinHistory", { [new Date().toISOString().split("T")[0]]: { energy: 6, mood, date: new Date().toDateString() } });
  store.set("guidanceShownAt", new Date().toISOString());
  navs.length = 0;
}
const SETTLING = ["sleep-better", "steadier-in-myself", "energy-through-day", "neck-shoulders-ease"];

console.log("\nTEST 1 - W6-13: stress and sleep goals rank the winding-down aims");
person({ goals: ["reduce-stress", "sleep-better"], conditions: ["anxiety"] });
const first8 = A.aimsFor(A.situationsFor(store), 8, []).map(a => a.id);
ok("1a. a winding-down aim leads", SETTLING.includes(first8[0]), first8.join(", "));
ok("1b. all four winding-down aims in the first eight", SETTLING.every(id => first8.includes(id)), first8.join(", "));
person({ goals: ["get-stronger"] });
const ctrl = A.aimsFor(A.situationsFor(store), 8, []).map(a => a.id);
ok("1pc. CONTROL: an active person with a strength goal still leads with performance", !SETTLING.includes(ctrl[0]), ctrl.join(", "));
ok("1c. nothing is pre-filled: the arc is not set by ranking", !store.get("arc") || !store.get("arc").active);

console.log("\nTEST 2 - W6-19: a low mood is answered, in their word");
person({ mood: 2 });
main.innerHTML = ""; TodayView(rtr).mount(main);
ok("2a. Home: \"You said you're struggling today\" with Wellbeing", /You said you're struggling today\. Wellbeing/.test(txt(main)), txt(main).slice(0, 200));
person({ mood: 3 });
main.innerHTML = ""; TodayView(rtr).mount(main);
ok("2b. Low is said as low", /You said you're low today/.test(txt(main)));
person({ mood: 2 });
main.innerHTML = ""; CoachProposalView(rtr).mount(main);
ok("2c. Today's plan: the line, with Something gentler and Wellbeing", /You said you\u2019re struggling today/.test(txt(main)) && !!main.querySelector("#cp-low-gentler") && !!main.querySelector("#cp-low-wellbeing"), txt(main).slice(0, 200));
ok("2d. no mental-health claim in it", !/depress|anxiet|mental health|disorder|therapy|crisis/i.test(txt(main.querySelector("#cp-low-gentler")?.closest(".cp-offer"))));
click(main.querySelector("#cp-low-gentler"));
ok("2e. Something gentler: one set fewer, and the offer goes", /one set fewer/i.test(txt(main.querySelector("#cp-plan-status"))) && !main.querySelector("#cp-low-gentler"), txt(main.querySelector("#cp-plan-status")));
person({ mood: 2 });
main.innerHTML = ""; CoachProposalView(rtr).mount(main);
click(main.querySelector("#cp-low-wellbeing"));
ok("2f. Wellbeing opens Wellbeing", navs.at(-1) === "noticing", JSON.stringify(navs));
person({ mood: 6 });
main.innerHTML = ""; TodayView(rtr).mount(main);
const homeOk = txt(main);
main.innerHTML = ""; CoachProposalView(rtr).mount(main);
ok("2pc. CONTROL: Okay, no line on Home or the plan", !/You said you're/.test(homeOk) && !main.querySelector("#cp-low-gentler"));

console.log(`\nVERIFY-W6-SESSION7: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
