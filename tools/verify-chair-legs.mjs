/**
 * tools/verify-chair-legs.mjs
 * 02 Oct 2026 v1
 *
 * W5-7 CHAIR-LEGS (Wave 5 persona trace: 2.11). Decided by Graeme, 02 Oct:
 * "squats and lunges when getting up and down from a chair is tricky is not
 * an option". Kept: a chair-supported Sit to Stand, hands allowed.
 *
 * Getting up from a chair "not easily" only capped difficulty, so Deep
 * Squat Hold (difficulty 1) and Lateral Lunge with Reach reached her, and
 * with her legs answered as fine, any squat or lunge at difficulty 2.
 *
 *   1. Chair "not easily" (legs answered fine, and legs not answered):
 *      50 builds of every type hold no squat, lunge, split squat, step-up,
 *      step-down or wall sit.
 *   2. Sit to Stand still passes, and its steps let the hands help.
 *   3. Classes: Standing Up (a step-up and a wall sit) is under "Not
 *      today", named, and cannot be started.
 *   4. Controls: chair "yes" still gets squats; Standing Up is offered.
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
const { EXERCISES } = await import(B + "data/exercises/index.js");

// The check's own reading of "a squat or a lunge", from the words and the tags.
const SQUAT_LUNGE = /squat|lunge|split[- ]squat|step[- ]?up|step[- ]?down|wall sit/i;
const isSquatOrLunge = e => e.id !== "sit-to-stand" && e.position !== "seated" &&
  (SQUAT_LUNGE.test(e.name || "") || ["squat", "lunge"].includes(e.movementPattern));

function fixture(chairRise, legPower) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "June"); store.set("tier", "personal");
  store.set("equipment", ["dumbbells", "resistance-band", "kettlebell"]); store.set("homeEquipment", ["dumbbells", "resistance-band", "kettlebell"]);
  store.set("conditions", []); store.set("conditionPainScores", {});
  store.set("capability", { askedAt: new Date().toISOString(), floorAccess: "yes", chairRise, balanceWorry: "no", bothFeet: "no", legPower });
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
}
function scan() {
  const hits = new Map(); let built = 0;
  for (const t of SB.SESSION_TYPES) for (let i = 0; i < 50; i++) {
    const s = SB.buildSession({ sessionType: t.id, durationMins: 30 });
    if (!s) continue; built++;
    for (const e of s.exercises || []) {
      const full = EXERCISES.find(x => x.id === e.id) || e;
      if (isSquatOrLunge(full)) hits.set(full.name, (hits.get(full.name) || 0) + 1);
    }
  }
  return { hits, built };
}

// ── 1. BUILDS ───────────────────────────────────────────────────────────
console.log("\nTEST 1 - chair \"not easily\": no squats, no lunges");
for (const legs of ["full", null]) {
  fixture("not-easily", legs);
  const { hits, built } = scan();
  ok(`1pc-${legs}. sessions were built`, built > 100, String(built));
  ok(`1a-${legs}. none holds a squat or a lunge (legs answered ${legs || "not at all"})`, hits.size === 0, [...hits].map(([k, v]) => `${k} x${v}`).join(", "));
}
fixture("not-easily", "full");
const pass = SB.personFilter({ equipment: store.get("equipment") });
const through = EXERCISES.filter(e => isSquatOrLunge(e) && pass(e)).map(e => e.name);
ok("1b. and the filter lets none through, whatever the build picks", through.length === 0, through.join(", "));

// ── 2. SIT TO STAND ─────────────────────────────────────────────────────
console.log("\nTEST 2 - the supported Sit to Stand stays");
const sts = EXERCISES.find(e => e.id === "sit-to-stand");
ok("2a. Sit to Stand passes the filter", !!sts && pass(sts));
const steps = (sts?.instructions || []).join(" ");
ok("2b. its steps let the hands help, on the chair or the thighs", /hands/i.test(steps) && /arms of the chair|chair.s arms/i.test(steps) && !/fold your arms across your chest if you can/i.test(steps), steps);

// ── 3. CLASSES ──────────────────────────────────────────────────────────
console.log("\nTEST 3 - Classes");
const CL = await import(B + "views/class-list.js");
main.innerHTML = CL.render();
const startable = [...main.querySelectorAll("[data-start]")].map(b => b.getAttribute("aria-label") || "");
const held = [...main.querySelectorAll(".class-list__row--held")].map(txt);
ok("3a. Standing Up cannot be started", !startable.some(l => /Standing Up/.test(l)), startable.join(" | "));
ok("3b. and is named under Not today, with what is in it", held.some(h => /Standing Up/.test(h) && /Step-Up|Wall Sit/i.test(h)), held.join(" | "));

// ── 4. CONTROLS ─────────────────────────────────────────────────────────
console.log("\nTEST 4 - controls");
fixture("yes", null);
const pass2 = SB.personFilter({ equipment: store.get("equipment") });
ok("4a. chair yes: Goblet Squat and Reverse Lunge still pass", pass2(EXERCISES.find(e => e.id === "goblet-squat")) && pass2(EXERCISES.find(e => e.id === "reverse-lunge")));
main.innerHTML = CL.render();
ok("4b. chair yes: Standing Up is offered", [...main.querySelectorAll("[data-start]")].some(b => /Standing Up/.test(b.getAttribute("aria-label") || "")));

console.log("");
if (fails) { console.log(`CHAIR-LEGS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`CHAIR-LEGS: all ${passes} assertions pass\n`);
process.exit(0);
