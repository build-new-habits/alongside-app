/**
 * tools/verify-balance-no.mjs
 * 29 Sep 2026 v1
 *
 * P15, BALANCE "NO" = NO SQUATS (persona finding W2-6, too narrow). A fit
 * 26-year-old who answers "No, not really" to the balance question is
 * never asked the chair question -- and capabilityProfile() then read the
 * unasked chair answer as "not yes", so her legs were "limited": 0 of 20
 * Lower builds had a squat or a hinge.
 *
 * Decision (accepted 28 Sep): ask the chair question whenever the balance
 * answer is "No"; unasked is not "limited".
 *
 *   1. The real onboarding thread, answered as a fit 26-year-old would:
 *      the chair question is asked, and Lower sessions have squats and
 *      hinges.
 *   2. Somebody who onboarded before (balance "No", chair never asked):
 *      the same.
 *   3. C1-SAFETY holds: "Not easily" from a chair with the leg question
 *      skipped is still limited; "No" is still seated.
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");

const dom = new JSDOM('<!doctype html><html><body><div id="app"><div id="main-content"></div></div><div id="sr-announcer"></div></body></html>', { url: "https://localhost/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
dom.window.scrollTo = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { ThreadView } = await import(B + "views/onboarding/thread.js");
const SB = await import(B + "session-builder.js");
const rtr = { navigate() {}, back() {}, history: [] };
globalThis.window.router = rtr;
Object.defineProperty(globalThis, "router", { value: rtr, configurable: true, writable: true });

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

// A fit 26-year-old, as she answered.
const ANSWERS = [
  [/how old you are/i,              /^25 - 34$/],
  [/How active have you been/i,     /^Regularly training$/],
  [/losing your balance/i,          /^No, not really$/],
  [/get up from a chair/i,          /^Yes$/],
  [/down to the floor/i,            /^Yes$/],
];

async function walkOnboarding() {
  localStorage.clear(); store.init();
  const el = document.createElement("div"); document.body.appendChild(el);
  ThreadView(rtr).mount(el);
  await wait(2500);
  const c = el.querySelector("#ob-consent-check");
  c.checked = true; c.dispatchEvent(new dom.window.Event("change"));
  el.querySelector("#ob-consent-continue").dispatchEvent(new dom.window.Event("click"));
  await wait(300);
  const used = new WeakSet(); const asked = []; let idle = 0;
  for (let i = 0; i < 400; i++) {
    await wait(150);
    const panel = document.querySelector(".sheet-panel.is-open");
    if (panel) {
      idle = 0;
      document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await wait(500); continue;
    }
    const fresh = sel => [...el.querySelectorAll(sel)].filter(b => !used.has(b) && !b.disabled).at(-1);
    const trays = el.querySelectorAll(".ob-chips"); const tray = trays.length ? trays[trays.length - 1] : null;
    const open = fresh('[data-action="open"]');
    const confirm = tray && [...tray.querySelectorAll(".ob-chips__confirm")].find(b => !used.has(b) && !b.disabled);
    const field = el.querySelector(".ob-input-bar__field");
    const cont = fresh(".ob-continue-btn, .ob-gate__btn--primary");
    let chip = null;
    if (tray && !used.has(tray)) {
      const q = txt([...el.querySelectorAll(".ob-bubble--coach")].at(-1));
      const want = ANSWERS.find(([re]) => re.test(q));
      if (want) asked.push(q.match(want[0])[0]);
      const chips = [...tray.querySelectorAll(".ob-chip:not([disabled])")];
      chip = (want && chips.find(b => want[1].test(txt(b)))) || chips[0];
    }
    if (open) { idle = 0; used.add(open); click(open); await wait(400); continue; }
    if (field) { idle = 0; field.value = field.type === "date" ? "2026-12-20" : "Sam"; el.querySelector(".ob-input-bar__send")?.dispatchEvent(new dom.window.Event("click")); continue; }
    if (confirm) { idle = 0; used.add(confirm); used.add(tray); confirm.dispatchEvent(new dom.window.Event("click")); continue; }
    if (chip) { idle = 0; chip.dispatchEvent(new dom.window.Event("click")); if (!tray.querySelector(".ob-chips__confirm")) used.add(tray); continue; }
    if (cont) { idle = 0; used.add(cont); cont.dispatchEvent(new dom.window.Event("click")); continue; }
    if (++idle > 26) break;
  }
  const said = txt(el); el.remove();
  return { asked, reachedEnd: /Let.s begin/.test(said) };
}

const LEG = new Set(["squat", "hinge"]);
function lowerBuilds(n = 20) {
  let withLeg = 0;
  for (let i = 0; i < n; i++) {
    const s = SB.buildSession({ sessionType: "lower", durationMins: 30, equipmentOverride: ["dumbbells-light"] });
    if ((s.exercises || []).some(e => LEG.has(e.movementPattern))) withLeg++;
  }
  return withLeg;
}
function ready() {
  store.set("onboardingComplete", true); store.set("tier", "free"); store.set("name", "Sam");
  store.set("conditions", []); store.set("conditionPainScores", {});
}

// ── 1. THE REAL ONBOARDING ───────────────────────────────────────────────
console.log("\nTEST 1 - a fit 26-year-old through the real onboarding");
{
  const walk = await walkOnboarding();
  const cap = store.get("capability") || {};
  ok("1pc. the walk reached the end, and she said No to balance", walk.reachedEnd && cap.balanceWorry === "no", `${walk.reachedEnd} ${JSON.stringify(cap)}`);
  ok("1a. she is asked the chair question", walk.asked.some(q => /chair/i.test(q)) && cap.chairRise === "yes", `${walk.asked.join(" | ")}; chairRise ${cap.chairRise}`);
  ready();
  const p = store.capabilityProfile();
  ok("1b. her legs are loadable", p.legsLoadable === true, JSON.stringify(p));
  const n = lowerBuilds();
  ok("1c. Lower sessions have squats and hinges (20 of 20)", n === 20, `${n} of 20`);
}

// ── 2. ONBOARDED BEFORE THE FIX ─────────────────────────────────────────
console.log("\nTEST 2 - balance No, the chair question never asked (an earlier onboarding)");
{
  localStorage.clear(); store.init(); ready();
  store.set("capability", { ...(store.get("capability") || {}), balanceWorry: "no", chairRise: null, legPower: null, floorAccess: null, askedAt: new Date().toISOString() });
  const p = store.capabilityProfile();
  ok("2a. unasked is not limited", p.legsLoadable === true && p.legsUsable === true && !p.needsSeated, JSON.stringify(p));
  const n = lowerBuilds();
  ok("2b. Lower sessions have squats and hinges (20 of 20)", n === 20, `${n} of 20`);
}

// ── 3. C1-SAFETY STILL HOLDS ────────────────────────────────────────────
console.log("\nTEST 3 - an answer that says limited still means limited");
{
  localStorage.clear(); store.init(); ready();
  store.set("capability", { ...(store.get("capability") || {}), balanceWorry: "sometimes", chairRise: "not-easily", legPower: null, askedAt: new Date().toISOString() });
  const p = store.capabilityProfile();
  ok("3a. 'Not easily' from a chair, leg question skipped: legs not loadable", p.legsLoadable === false && p.legsUsable === true, JSON.stringify(p));
  store.set("capability.chairRise", "no");
  ok("3b. 'No' from a chair: seated", store.capabilityProfile().needsSeated === true);
  store.set("capability", { ...(store.get("capability") || {}), chairRise: "yes", legPower: null, balanceWorry: "yes" });
  const q = store.capabilityProfile();
  ok("3c. a balance worry still keeps balance work out", q.balanceSafe === false && q.legsLoadable === true, JSON.stringify(q));
}

console.log("");
if (fails) { console.log(`BALANCE-NO: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`BALANCE-NO: all ${passes} assertions pass\n`);
process.exit(0);
