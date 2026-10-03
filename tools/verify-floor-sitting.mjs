/**
 * tools/verify-floor-sitting.mjs
 * 02 Oct 2026 v1
 *
 * W5-3 FLOOR-SITTING (Wave 5 persona trace: 2.11, 2.14; unsafe for anyone
 * who cannot get down to the floor).
 *
 * Spine Stretch Forward and Spine Twist ("Sit tall with legs extended") were
 * tagged seated, and the no-floor filter checks only "floor": 30 of 30
 * careful Mobility builds and 15 of 30 Core builds held one, and Yoga
 * offered Pilates ("Mat-based.") to somebody who said they cannot get down
 * to the floor.
 *
 *   1. No library entry whose steps sit you on the floor (legs out long)
 *      is tagged seated or "any", unless its steps also offer a chair.
 *   2. Floor "No": 50 builds of every session type hold no floor move and
 *      no floor-sitting move.
 *   3. Floor "No": Yoga's Pilates card says nothing fits and cannot be
 *      chosen; floor "Yes": Pilates is offered (control).
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

// Sitting with the legs out long: "Sit tall with legs extended", "sit with your legs straight".
const FLOOR_SIT = /\bsit\b[^.]{0,30}\blegs? (extended|straight|out long)|long sitting/i;
const sitsOnFloor = e => FLOOR_SIT.test((e.instructions || []).join(" ")) && !/chair/i.test((e.instructions || []).join(" "));

function fixture(floorAccess) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Pat"); store.set("tier", "personal");
  store.set("equipment", []); store.set("homeEquipment", []);
  store.set("conditions", []); store.set("conditionPainScores", {});
  store.set("capability", { askedAt: new Date().toISOString(), floorAccess, chairRise: "yes", balanceWorry: "no", bothFeet: "no", legPower: null });
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
}

// ── 1. THE LIBRARY ──────────────────────────────────────────────────────
console.log("\nTEST 1 - nothing that sits you on the floor is tagged seated");
const wrong = EXERCISES.filter(e => (e.position === "seated" || e.position === "any") && sitsOnFloor(e));
ok("1pc. the library has floor-sitting moves to find", EXERCISES.some(sitsOnFloor));
ok("1a. every one is tagged floor", wrong.length === 0, wrong.map(e => `${e.id} (${e.position})`).join(", "));

// ── 2. BUILDS ───────────────────────────────────────────────────────────
console.log("\nTEST 2 - floor No: 50 builds of every type");
fixture("no");
const bad = new Map();
let built = 0;
for (const t of SB.SESSION_TYPES) {
  for (let i = 0; i < 50; i++) {
    const s = SB.buildSession({ sessionType: t.id, durationMins: 30 });
    if (!s) continue;
    built++;
    for (const e of s.exercises || []) {
      const full = EXERCISES.find(x => x.id === e.id) || e;
      if (full.position === "floor" || sitsOnFloor(full)) bad.set(full.id, (bad.get(full.id) || 0) + 1);
    }
  }
}
ok("2pc. sessions were built", built > 100, String(built));
ok("2a. no floor move and no floor-sitting move", bad.size === 0, [...bad].map(([k, v]) => `${k} x${v}`).join(", "));

// ── 3. THE YOGA DOOR ────────────────────────────────────────────────────
console.log("\nTEST 3 - Yoga's Pilates card");
const YS = await import(B + "views/yoga-session.js");
fixture("no");
main.innerHTML = YS.render();
const pil = main.querySelector('[data-focus="pilates"]');
ok("3a. floor No: Pilates cannot be chosen and says why", !!pil && pil.disabled && !/Mat-based/i.test(txt(pil)), txt(pil));
fixture("yes");
main.innerHTML = YS.render();
const pil2 = main.querySelector('[data-focus="pilates"]');
ok("3b. floor Yes: Pilates is offered (control)", !!pil2 && !pil2.disabled, txt(pil2));

console.log("");
if (fails) { console.log(`FLOOR-SITTING: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`FLOOR-SITTING: all ${passes} assertions pass\n`);
process.exit(0);
