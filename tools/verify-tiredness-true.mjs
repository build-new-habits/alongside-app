/**
 * tools/verify-tiredness-true.mjs
 * 02 Oct 2026 v2
 *
 * v2 - W5-4 STRESS-SORE (Wave 5 trace: 2.4, 2.16). TEST 6: the update
 *   check-in asked "How is your stress today?" with A little / Quite sore /
 *   Bad, and saved the answer as a sore score. Both check-ins now ask about
 *   body areas only, save no score for an everyday state, and no Bad-day
 *   screen names one.
 *
 * W4-10 TIREDNESS-PROMISE (Wave 4 persona trace, 2.4).
 *
 * Choosing "Ongoing tiredness" in getting started got: "I'll keep it in
 * mind day to day — you won't have to remind me." Nothing that builds a
 * session reads it (sessions were identical with and without it, six times
 * out of six). Settings then listed it with the sore areas, under "On a day
 * one is bad, I'll leave out movements…", with "Not mentioned at a check-in
 * yet", which it never can be. And it marked her as "managing" something,
 * so the Plan's arcs led with injury aims.
 *
 *   1. Getting started says what is true: the check-in's energy is what
 *      makes a day gentler; no promise to keep it in mind.
 *   2. With a sore area too, the sore-area sentence speaks only of areas
 *      ("either of those" no longer includes tiredness).
 *   3. Settings: not under the sore areas, not "Not mentioned at a check-in
 *      yet"; said separately, with the same way to take it off.
 *   4. The Plan's arcs lead exactly as they do without it.
 *   5. Controls: a knee is still listed and still marks "managing".
 */
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const OTD = await import(B + "data/onboarding-thread-data.js");
const A = await import(B + "data/aims.js");
const { SettingsView } = await import(B + "views/settings.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();

const TIRED = "persistent-fatigue";
function fixture(conditions, level = "moderate") {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", "personal");
  store.set("conditions", conditions); store.set("fitnessLevel", level);
}

// ── 1-2. GETTING STARTED ────────────────────────────────────────────────
console.log("\nTEST 1 - getting started says what is true");
const one = OTD.generateConditionsAck([TIRED]);
ok("1a. no promise to keep it in mind", !/keep it in mind|won.t have to remind/i.test(one), one);
ok("1b. it says the check-in's energy is what makes a day gentler", /energy/i.test(one) && /check in/i.test(one) && /gentler/i.test(one), one);
const both = OTD.generateConditionsAck(["knee", TIRED]);
ok("2a. with a knee too: the sore-area sentence speaks of the knee only", /your knee/i.test(both) && !/either of those|any of those/i.test(both), both);
ok("2b. and tiredness gets its own true line", /energy/i.test(both), both);

// ── 3. SETTINGS ─────────────────────────────────────────────────────────
console.log("\nTEST 3 - Settings keeps it apart from the sore areas");
fixture(["knee", TIRED]);
main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main); await wait(10);
const row = [...main.querySelectorAll('[data-open="conditions"]')].map(txt).join(" ");
ok("3a. the Sore or injured areas row counts areas only", /1 listed/.test(row), row);
main.querySelector('[data-open="conditions"]')?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(10);
const sore = main.querySelector('[aria-label="Your sore or injured areas"]');
ok("3b. not under the sore areas", !!sore && /knee/i.test(txt(sore)) && !/tired/i.test(txt(sore)), txt(sore));
const elsewhere = txt(main);
ok("3c. said separately, and true", /Ongoing tiredness/i.test(elsewhere) && /energy/i.test(elsewhere) && !/Ongoing tiredness[^.]*Not mentioned at a check-in yet/i.test(elsewhere), elsewhere.slice(0, 500));
ok("3d. with the same way to take it off", !!main.querySelector(`[data-resolve="${TIRED}"]`));

// ── 4. THE PLAN'S ARCS ──────────────────────────────────────────────────
console.log("\nTEST 4 - the Plan's arcs lead as they do without it");
fixture([]); const plain = A.aimsFor(A.situationsFor(store), 8).map(a => a.id);
fixture([TIRED]); const withT = A.aimsFor(A.situationsFor(store), 8).map(a => a.id);
ok("4a. tiredness does not mark somebody as managing an injury", !new Set(A.situationsFor(store)).has("managing"), JSON.stringify(A.situationsFor(store)));
ok("4b. the arcs offered are the same", JSON.stringify(plain) === JSON.stringify(withT), `${plain.join(",")} | ${withT.join(",")}`);

// ── 5. CONTROLS ─────────────────────────────────────────────────────────
console.log("\nTEST 5 - controls");
fixture(["knee"]);
ok("5a. a knee still marks managing", new Set(A.situationsFor(store)).has("managing"));

// ── 6. THE CHECK-INS ASK ABOUT BODY AREAS ONLY (W5-4) ──────────────────
console.log("\nTEST 6 - stress is not asked as a sore area");
const navs = [];
const rtr = { navigate: v => navs.push(v), back() {}, history: [] };
globalThis.window.router = rtr;
Object.defineProperty(globalThis, "router", { value: rtr, configurable: true, writable: true });
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
const Mini = await import(B + "views/checkin-mini.js");
fixture(["anxiety", "knee"]);
main.innerHTML = Mini.render(); Mini.onMount?.(); await wait(10);
for (let i = 0; i < 4 && !/Anything hurting/i.test(txt(main)); i++) { click(main.querySelector("#mini-next-btn")); await wait(10); }
ok("6pc. the update check-in asks about the knee", !!main.querySelector('fieldset[data-condition="knee"]'), txt(main).slice(0, 200));
ok("6a. and not about stress", !main.querySelector('fieldset[data-condition="anxiety"]') && !/stress/i.test(txt(main)), txt(main).slice(0, 300));
// Every row offered gets "A little", as a person going down the list would.
[...main.querySelectorAll(".mini-pain-chip")].filter(c => txt(c) === "A little").forEach(c => click(c)); await wait(10);
for (let i = 0; i < 4 && !main.querySelector("#mini-done-btn"); i++) { click(main.querySelector("#mini-next-btn")); await wait(10); }
click(main.querySelector("#mini-done-btn")); await wait(10);
ok("6b. no score saved for stress (the knee's is)", !("anxiety" in (store.get("conditionPainScores") || {})) && store.get("conditionPainScores")?.knee === 4, JSON.stringify(store.get("conditionPainScores")));

const { CheckinView } = await import(B + "views/checkin.js");
document.getElementById("main-content").innerHTML = "";
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
fixture(["anxiety", "knee"]);
store.set("pendingDoorRoute", "coach-proposal");
const app = document.getElementById("app");
const holder = document.createElement("div"); app.appendChild(holder);
const cnavs = [];
CheckinView({ navigate: v => cnavs.push(v), back() {} }).mount(holder);
const tapNow = async re => {
  for (let t = 0; t < 400; t++) {
    const b = [...document.querySelectorAll("#app button, .ci-panel button")].find(x => !x.disabled && re.test(txt(x)));
    if (b) { b.click(); await wait(30); return true; }
    await wait(15);
  }
  return false;
};
const reached = (await tapNow(/^Okay$/)) && (await tapNow(/^Pretty good$/)) && (await tapNow(/^Nothing today$/));
for (let t = 0; t < 200 && !cnavs.length; t++) await wait(15);
ok("6pc2. the full check-in reaches the plan", reached && cnavs.length > 0, JSON.stringify(cnavs) + " " + reached + " | " + [...document.querySelectorAll("#app button, .ci-panel button")].map(txt).join(" / ") + " | " + txt(app).slice(-300));
ok("6c. the full check-in saves no score for stress", !("anxiety" in (store.get("conditionPainScores") || {})), JSON.stringify(store.get("conditionPainScores")));
holder.remove(); document.querySelectorAll(".ci-panel, .ci-overlay").forEach(n => n.remove());

const Door = await import(B + "views/bad-day-door.js");
fixture(["anxiety", "knee"]);
store.set("conditionPainScores", { anxiety: 8, knee: 8 });   // a score kept from before
ok("6d. a Bad-day screen names the knee, never stress", /knee/i.test(Door.renderBadDayDoor()) && !/stress/i.test(Door.renderBadDayDoor()), Door.renderBadDayDoor().replace(/\s+/g, " ").slice(0, 300));
store.set("conditionPainScores", { anxiety: 8 });
ok("6e. stress alone never makes a Bad day", Door.badDayIds().length === 0, JSON.stringify(Door.badDayIds()));

console.log(`\nTIREDNESS-TRUE: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
