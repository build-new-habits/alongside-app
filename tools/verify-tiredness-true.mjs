/**
 * tools/verify-tiredness-true.mjs
 * 02 Oct 2026 v1
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

console.log(`\nTIREDNESS-TRUE: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
