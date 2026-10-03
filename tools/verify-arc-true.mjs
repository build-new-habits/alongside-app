/**
 * tools/verify-arc-true.mjs
 * 03 Oct 2026 v1
 *
 * W5-15 ARC-TRUE (Wave 5 persona trace: 2.4).
 *
 * An arc of mind strands only changed nothing about sessions, yet every
 * plan said "Based on your arc", and Progress showed each strand "Not yet"
 * for ever: nothing lit a mind strand. And somebody who listed stress and
 * no back problem was offered, first, "Get back to my sport without my back
 * flaring up".
 *
 *   1. A mind strand lights from a breathing or mindful practice.
 *   2. A mind-only arc does not claim to shape the plan; a body arc does.
 *   3. Aims about a body part (the back) do not lead unless that area is
 *      listed; listed, they can; never removed (the full list keeps them).
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
const SB = await import(B + "session-builder.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s);
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const AR = await import(B + "data/arc-readback.js");
const A = await import(B + "data/aims.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const { ArcSetupView } = await import(B + "views/arc-setup.js");

function fixture(extra = {}) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Mo"); store.set("tier", "personal");
  store.set("equipment", []); store.set("homeEquipment", []);
  store.set("conditions", []); store.set("conditionPainScores", {});
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  for (const [k, v] of Object.entries(extra)) store.set(k, v);
}
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
const MIND = { aimId: "kinder-to-myself", strands: ["self-kindness", "not-overdoing", "showing-up"], active: true, startedAt: weekAgo };
const BODY = { aimId: "flexible-again", strands: ["hip-range", "hamstring-range"], active: true, startedAt: weekAgo };

// ── 1. A MIND STRAND LIGHTS ─────────────────────────────────────────────
console.log("\nTEST 1 - a mind strand lights from a breathing or mindful practice");
fixture({ arc: MIND });
ok("1pc. before any practice: not yet", AR.strandReadback(store.get("arc")).every(r => r.last === null));
store.logActivity({ id: "q1", type: "mindful", name: "10 min mindful session", source: "quiet-session", status: "completed", completedAt: new Date().toISOString() });
const rows = AR.strandReadback(store.get("arc"));
ok("1a. after a mindful practice: each mind strand worked today", rows.length === 3 && rows.every(r => /today/.test(r.text)), JSON.stringify(rows.map(r => r.text)));
fixture({ arc: MIND });
store.logActivity({ id: "b1", type: "breathing", name: "Box breathing", source: "breathing-session", status: "completed", completedAt: new Date().toISOString() });
ok("1b. a breathing practice counts too", AR.strandReadback(store.get("arc")).every(r => /today/.test(r.text)));

// ── 2. WHAT THE PLAN CLAIMS ─────────────────────────────────────────────
console.log("\nTEST 2 - a mind-only arc does not claim to shape the plan");
const rtr = { history: ["x"], navigate() {}, back() {} };
fixture({ arc: MIND, lastCheckin: { energy: 6, mood: 6, timestamp: new Date().toISOString() } });
main.innerHTML = ""; CoachProposalView(rtr).mount(main); await wait(40);
ok("2a. no \"Based on your arc\" over a plan the arc did not shape", !/Based on your arc/.test(txt(main)), txt(main).slice(0, 200));
fixture({ arc: BODY, lastCheckin: { energy: 6, mood: 6, timestamp: new Date().toISOString() } });
main.innerHTML = ""; CoachProposalView(rtr).mount(main); await wait(40);
ok("2b. control: a body arc says it", /Based on your arc/.test(txt(main)), txt(main).slice(0, 200));

// ── 3. AIMS ABOUT A BODY PART ───────────────────────────────────────────
console.log("\nTEST 3 - aims about the back need a listed back");
const firstAim = () => { main.innerHTML = ""; ArcSetupView(rtr).mount(main); return main.querySelector("[data-aim]")?.dataset.aim; };
const BACK_AIMS = ["sport-without-flaring", "carry-shopping"];
fixture({ conditions: ["anxiety"], fitnessLevel: "active", "lifestyle.returningAfter": "life" });
const shownStress = [...(main.innerHTML = "", ArcSetupView(rtr).mount(main), main.querySelectorAll("[data-aim]"))].map(b => b.dataset.aim);
ok("3a. stress, no back listed: no back aim first", !BACK_AIMS.includes(shownStress[0]), shownStress.slice(0, 3).join(", "));
ok("3b. and no back aim before the aims that fit", !shownStress.slice(0, 4).some(id => BACK_AIMS.includes(id)), shownStress.join(", "));
fixture({ conditions: ["lower-back"], fitnessLevel: "active", "lifestyle.returningAfter": "life" });
ok("3c. control: a listed back, active and returning: the sport aim can lead", firstAim() === "sport-without-flaring", firstAim());
ok("3d. never removed: the full list keeps every aim", BACK_AIMS.every(id => A.AIMS.list.some(a => a.id === id)));

console.log("");
if (fails) { console.log(`ARC-TRUE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`ARC-TRUE: all ${passes} assertions pass\n`);
process.exit(0);
