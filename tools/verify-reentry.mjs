/**
 * tools/verify-reentry.mjs
 * 02 Oct 2026 v2
 *
 * v2 - W4-24. The fixture gives the health consent (agreed): without it the
 *   return question rightly offers no Was unwell or Was injured. No
 *   assertion changed.
 *
 * 29 Sep 2026 v1
 *
 * P20, RE-ENTRY (persona finding W2-15). Onboarding promises: "When you
 * come back, I'm going to ask what happened and how long you were out."
 * The return question and the gentler start read the gap from
 * progressLog, which only a programme writes -- so on Free, with no
 * programme, nobody was ever asked. And the gap counted whole 24-hour
 * periods: last Monday evening to this Monday morning was "6 days".
 *
 * Decision (accepted 28 Sep): the gap comes from the activity log; the
 * promise matches the rule.
 *
 * Through the real coach's plan screen:
 *   1. Free, no programme, a walk seven calendar days ago (late in the
 *      evening): asked what happened; six days: not asked.
 *   2. "Life got full" -> the gentler start is offered, and can be taken.
 *   3. "Was unwell" -> gentler, said as unwell; "Was injured" -> gentler,
 *      said as an injury, and asked what is still sore.
 *   4. Control: the Plan with a programme is still asked.
 */
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

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

const R = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const gate = await import(B + "safety-gate.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const rtr = { navigate() {}, back() {}, history: [] };
globalThis.window.router = rtr;
Object.defineProperty(globalThis, "router", { value: rtr, configurable: true, writable: true });

// Local calendar times, as the person lives them.
const at = (daysAgo, hour) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(hour, 0, 0, 0); return d.toISOString(); };
const nowHour = new Date().getHours();
const todayEarlier = at(0, Math.max(0, nowHour - 1));
function fixture(tier, log) {
  localStorage.clear(); store.init(); agreed(store);   // W4-24: Was unwell and Was injured need the health consent
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("equipment", ["dumbbells-light"]); store.set("homeEquipment", ["dumbbells-light"]);
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  store.set("activityLog", log.map((e, i) => ({ id: "e" + i, status: "completed", ...e, date: e.completedAt })));
}


const DOOR = /Anything you.d like me to know about the last little while/;
async function plan() { main.innerHTML = ""; CoachProposalView(rtr).mount(main); await wait(40); return txt(main); }
const click = sel => { const b = main.querySelector(sel); b?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!b; };

// ── 1. FREE, NO PROGRAMME ───────────────────────────────────────────────
console.log("\nTEST 1 - Free, no programme: seven calendar days away is asked about");
// 23:59 seven calendar days ago: under seven 24-hour periods at any time
// of day but the last minute -- the case whole-day counting missed.
const lateSeven = (() => { const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(23, 59, 0, 0); return d.toISOString(); })();
fixture("free", [{ type: "walk", completedAt: lateSeven }]);
ok("1pc. Free, no programme, nothing in progressLog", store.get("tier") === "free" && !(store.get("progressLog") || []).length && !store.hasActiveProgramme());
const t1 = await plan();
ok("1a. a walk seven calendar days ago (23:59): \"Anything you'd like me to know...\"", DOOR.test(t1), t1.slice(0, 220));
fixture("free", [{ type: "walk", completedAt: at(6, 8) }]);
ok("1b. six days: not asked", !DOOR.test(await plan()));
fixture("free", []);
ok("1c. never done anything: not asked (a first session is not a return)", !DOOR.test(await plan()));

// ── 2. LIFE GOT FULL ────────────────────────────────────────────────────
console.log("\nTEST 2 - \"Life got full\": the gentler start is offered, and can be taken");
fixture("free", [{ type: "workout", sessionType: "full", completedAt: at(15, 18) }]);
await plan();
click('[data-return-context="life"]'); await wait(40);
const t2 = txt(main);
ok("2a. offered, with the time away in weeks", /You have been away 2 weeks/.test(t2) && !!main.querySelector('[data-gentler="yes"]'), t2.slice(0, 260));
click('[data-gentler="yes"]'); await wait(40);
ok("2b. taken: the offer goes, and the plan says so", !main.querySelector("[data-gentler]") && !DOOR.test(txt(main)) && /A notch gentler today, as you chose/.test(txt(main)), txt(main).slice(0, 240));

// ── 3. UNWELL, INJURED ──────────────────────────────────────────────────
console.log("\nTEST 3 - unwell and injured: gentler without asking, said as it was");
fixture("free", [{ type: "workout", sessionType: "full", completedAt: at(10, 18) }]);
await plan(); click('[data-return-context="illness"]'); await wait(40);
const t3 = txt(main);
ok("3a. \"Was unwell\": \"Starting gently — that's the right call after being unwell\"", /after being unwell/.test(t3), t3.slice(0, 200));
fixture("free", [{ type: "workout", sessionType: "full", completedAt: at(10, 18) }]);
await plan(); click('[data-return-context="injury"]'); await wait(40);
const t4 = txt(main);
ok("3b. \"Was injured\": starting gently, said as an injury, not as being unwell", /Starting gently — that.s the right call after an injury/.test(t4) && !/after being unwell/.test(t4), t4.slice(0, 260));
ok("3c. and asked what is still sore", !!main.querySelector("[data-hurts]"));

// ── 4. CONTROL ──────────────────────────────────────────────────────────
console.log("\nTEST 4 - control: the Plan with a programme is still asked");
fixture("personal", []);
store.set("progressLog", [{ date: at(9, 10), focus: "strength" }]);
ok("4a. the Plan, a programme session nine days ago: asked", DOOR.test(await plan()));

// ── 5. THE PROMISE ──────────────────────────────────────────────────────
console.log("\nTEST 5 - the promise matches the rule");
{
  const b3 = fs.readFileSync(new URL("js/data/beat3-scripts.js", R), "utf8");
  const pe = fs.readFileSync(new URL("js/data/programmeEngine.js", R), "utf8");
  const days = +(pe.match(/const REENTRY_GAP_DAYS = (\d+);/) || [])[1];
  ok("5a. onboarding says it asks after a week or more, and the rule is seven days", /When you come back after a week or more, I'm going to ask what happened/.test(b3) && days === 7, `rule ${days}`);
  ok("5b. it no longer says it will ask how long, or that they have to answer", !/how long you were out/.test(b3) && !/You'll just have to tell me/.test(b3));
}

console.log("");
if (fails) { console.log(`REENTRY: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`REENTRY: all ${passes} assertions pass\n`);
process.exit(0);
