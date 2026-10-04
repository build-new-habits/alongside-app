/**
 * tools/verify-maintain-intent.mjs
 * 04 Oct 2026 v3
 *
 * v3 - LOOK-1: Settings is an index; "What you're aiming at" is a row on
 *   the Sessions section page, and index text no longer lists row values
 *   (a deliberate change). 1a now opens the Sessions page and asserts the
 *   aim is said there (same regex); 1b's one tap is from that page, as a
 *   person reaches it. No assertion was loosened.
 *
 * 03 Oct 2026 v2
 *
 * v2 - W5-23 SUITE-FLAKE (found verifying v637 from a fresh clone; also
 *   fails about 1 run in 12 on v636). 2d compares counts from 40 random
 *   builds, so it failed now and then on chance alone. Math.random is
 *   seeded: a fixed seed by default, so the suite gives the same answer
 *   every time; SEED=<n> tries another (as verify-mostly-same, W4-25). No
 *   assertion changed.
 *
 * 30 Sep 2026 v1
 *
 * W3-17 MAINTAIN-INTENT (persona Wave 3, 2.4: ex national-standard
 * athlete, late 40s, trains on her own).
 *   - "What are we aiming at?" is asked once, at sign-up, and nothing in
 *     Settings changes it.
 *   - "Hold on to what I have" narrowed every main section to one list --
 *     grip, balance, chair and sit-to-stand, getting up from the floor --
 *     and the plan said "grip, balance, and getting up and down". Right
 *     for somebody whose body is limiting them; for a trained person with
 *     no limits it read as a programme for somebody else.
 *   Never from age: which reading applies comes from the capability
 *   answers the person gave (chair, balance, legs, floor).
 *
 *   1. Settings shows the aim, and changes it.
 *   2. No limits, holding on: no chair or sit-to-stand work, and the plan
 *      speaks of strength, power and balance. And "floor" in a name is
 *      not floor work: measured, Dumbbell Floor Press and Floor Fly came
 *      up 24 times in 30 plans for holding on, 4 for building, because
 *      the pattern for getting up from the floor matched them.
 *   3. Control: with limits, holding on keeps its emphasis and its words.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

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
globalThis.URL.createObjectURL = () => "blob:x";
globalThis.URL.revokeObjectURL = () => {};
globalThis.CSS = { escape: s => String(s) };
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

// W5-23. Seeded before anything that builds a session is loaded.
const SEED = Number(process.env.SEED) || 20261003;
console.log(`seed ${SEED} (another: SEED=<n> node tools/verify-maintain-intent.mjs)`);
Math.random = (() => { let a = SEED >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; })();

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { SettingsView } = await import(B + "views/settings.js");
const { settingsSection } = await import("./settings-open.mjs");
const SB = await import(B + "session-builder.js");
let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const wait = ms => new Promise(r => setTimeout(r, ms));
const rtr = { navigate() {}, back() {}, history: [] };
globalThis.window.router = rtr;

function person(tier, intent, cap, level) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "Sam");
  store.set("trainingIntent", intent);
  store.set("capability", { askedAt: new Date().toISOString(), ...cap });
  store.set("fitnessLevel", level); store.set("lifestyle.activityLevel", level);
}
const FREE_BODY = { balanceWorry: "no", chairRise: "yes", legPower: "full", floorAccess: "yes" };
const LIMITS = { balanceWorry: "sometimes", chairRise: "not-easily", legPower: null, floorAccess: "yes" };

console.log("\nTEST 1 - Settings shows the aim and changes it");
for (const tier of ["free", "personal"]) {
  person(tier, "maintain", FREE_BODY, "active");
  main.innerHTML = ""; SettingsView(rtr).mount(main); await wait(20);
  settingsSection(main, "sessions"); await wait(20);   // LOOK-1: the aim's row lives on Sessions
  ok(`1a-${tier}. the page says what you are aiming at`, /Hold on to what I have/.test(txt(main)), txt(main).slice(0, 200));
  const opener = [...main.querySelectorAll("[data-open]")].find(b => /aiming/i.test(txt(b)));
  click(opener); await wait(20);
  const sel = main.querySelector("#settings-intent");
  ok(`1b-${tier}. one tap opens the choice, with all three`, !!sel && sel.options.length === 3, sel ? [...sel.options].map(o => o.text).join(" | ") : "(none)");
  if (sel) { sel.value = "improve"; sel.dispatchEvent(new dom.window.Event("change", { bubbles: true })); }
  ok(`1c-${tier}. changing it changes the aim`, store.get("trainingIntent") === "improve", String(store.get("trainingIntent")));
}

const KIT = ["barbell", "bench-flat", "dumbbells-medium", "kettlebell-medium", "cable-machine", "gym-membership"];
const CHAIR = /\bchair\b|sit[- ]to[- ]stand|sit to stand|floor transfer|get(ting)? up from/i;
function sweep() {
  const names = [], lines = [];
  for (const t of ["full", "lower", "upper", "glute", "core"]) for (let i = 0; i < 8; i++) {
    const s = SB.buildSession({ sessionType: t, durationMins: 40, equipmentOverride: KIT });
    s.exercises.filter(e => (e.section || e.role) === "main").forEach(e => names.push(e.name));
    lines.push(s.rationale?.opening || "");
  }
  return { names, lines };
}

console.log("\nTEST 2 - holding on, no limits: a trained person's sessions");
person("personal", "maintain", FREE_BODY, "active");
const t = sweep();
const chair = t.names.filter(n => CHAIR.test(n));
ok("2pc. sessions were built", t.names.length > 100, String(t.names.length));
ok("2a. no chair or sit-to-stand work in the main sections", chair.length === 0, [...new Set(chair)].join(", "));
// "Today covers getting up and down" names a move in the plan (a Turkish
// Get-Up) and is true; the emphasis line is what is checked.
ok("2b. the plan does not say its emphasis is grip, balance and getting up and down", !t.lines.some(l => /grip, balance, and getting up and down/.test(l)), t.lines.find(l => /grip, balance/.test(l)) || "");
ok("2c. it says what holding on means for her", t.lines.some(l => /strength, power and balance/.test(l)), t.lines[0]);

person("personal", "improve", FREE_BODY, "active");
const imp = sweep();
const FLOORPF = /floor (press|fly)/i;
const fm = t.names.filter(n => FLOORPF.test(n)).length, fi = imp.names.filter(n => FLOORPF.test(n)).length;
ok("2d. Floor Press and Floor Fly are not favoured for holding on", fm <= fi * 1.5 + 4, `holding on ${fm}, building ${fi}`);

console.log("\nTEST 3 - control: holding on, with limits");
person("personal", "maintain", LIMITS, "light");
const c = sweep();
ok("3a. the emphasis and its words are kept", c.lines.some(l => /grip, balance, and getting up and down/.test(l)), c.lines[0]);

console.log("");
if (fails) { console.log(`MAINTAIN-INTENT: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`MAINTAIN-INTENT: all ${passes} assertions pass\n`);
process.exit(0);
