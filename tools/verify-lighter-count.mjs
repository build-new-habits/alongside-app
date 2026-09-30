/**
 * tools/verify-lighter-count.mjs
 * 30 Sep 2026 v1
 *
 * W3-10 LIGHTER-COUNT (persona Wave 3: 2.4, 2.13, 2.14, 2.16). Graeme's
 * lighter-day rule, recalibrated with his agreement, 30 Sep: "Yes. That
 * makes sense."
 *
 * Found: three evenings of three-minute breathing and no exercise gave
 * "You've been moving a lot lately, so today's a lighter one" and a plan
 * of about 18 minutes instead of 35. A four-minute stopped session
 * counted the same. A "Full of it" check-in was overridden, and nothing
 * let the person turn the lighter day down.
 *
 *   1. Breathing, mindful sessions and quiet practices are not movement
 *      (decision 4a): they do not count.
 *   2. A session stopped under 10 minutes does not count; one stopped
 *      later does, and so does any finished session, however short.
 *   3. Controls: three days of walks, classes or workouts still bring it.
 *   4. "Full of it" at today's check-in declines it.
 *   5. On the coach's screen: the lighter day says why, and offers "Keep
 *      my usual plan"; that, or Harder, turns it down for today -- the
 *      plan comes back full and the line goes. Tomorrow the rule reads
 *      afresh.
 */
import { createRequire as __cr } from "node:module";
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
const CK = await import(B + "data/checkin.js");
const SB = await import(B + "session-builder.js");

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
  localStorage.clear(); store.init();
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("equipment", ["dumbbells-light"]); store.set("homeEquipment", ["dumbbells-light"]);
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  store.set("activityLog", log.map((e, i) => ({ id: "e" + i, status: "completed", ...e, date: e.completedAt })));
}


const click = sel => { const b = main.querySelector(sel); b?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!b; };

const LINE = /moving a lot lately/;
const local = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const threeDays = e => [1, 2, 3].map(n => ({ completedAt: at(n, 19), ...e }));
function lineFor(log, extra) {
  fixture("free", log);
  if (extra) extra();
  let said = false;
  for (let i = 0; i < 4; i++) said = said || LINE.test(SB.buildSession({ sessionType: "full", durationMins: 30, equipmentOverride: ["dumbbells-light"] }).coachLine || "");
  return said;
}

console.log("\nTEST 1 - breathing and quiet practices are not movement");
ok("1a. three evenings of breathing: no lighter day", !lineFor(threeDays({ type: "mindfulness", durationMins: 3 })));
ok("1b. three mindful sessions: no lighter day", !lineFor(threeDays({ type: "mindful", durationMins: 10 })));
ok("1c. three quiet practices: no lighter day", !lineFor(threeDays({ type: "practice", durationMins: 5 })));
ok("1d. three breathing sessions (quiet player): no lighter day", !lineFor(threeDays({ type: "breathing", durationMins: null })));

console.log("\nTEST 2 - a session stopped early counts only from 10 minutes");
ok("2a. three sessions stopped at 4 minutes: no lighter day", !lineFor(threeDays({ type: "workout", status: "partial", durationMins: 4 })));
ok("2b. stopped with no length recorded: no lighter day", !lineFor(threeDays({ type: "walk", status: "partial" })));
ok("2c. stopped at 15 minutes: counts", lineFor(threeDays({ type: "workout", status: "partial", durationMins: 15 })));
ok("2d. a finished 8-minute session counts (finished is finished)", lineFor(threeDays({ type: "class", status: "complete", durationMins: 8 })));

console.log("\nTEST 3 - controls: movement still brings it");
ok("3a. three days of walks", lineFor(threeDays({ type: "walk", durationMins: 30 })));
ok("3b. three days of workouts with no length recorded (older entries)", lineFor(threeDays({ type: "workout" })));
ok("3c. two walks and a breathing session: not three days of movement", !lineFor([
  { type: "walk", durationMins: 30, completedAt: at(1, 19) },
  { type: "mindfulness", durationMins: 3, completedAt: at(2, 19) },
  { type: "walk", durationMins: 30, completedAt: at(3, 19) }]));

console.log("\nTEST 4 - Full of it declines it");
const walks = threeDays({ type: "walk", durationMins: 30 });
ok("4a. Full of it today: no lighter day", !lineFor(walks, () => CK.saveCheckin({ energy: 9, mood: 7 })));
ok("4b. control: Okay today, it stays", lineFor(walks, () => CK.saveCheckin({ energy: 6, mood: 6 })));

console.log("\nTEST 5 - on the coach's screen, the person can turn it down");
async function coach(tier = "free") {
  fixture(tier, walks);
  CK.saveCheckin({ energy: 6, mood: 6 });
  store.set("availableTime", "standard");
  main.innerHTML = ""; CoachProposalView(rtr).mount(main); await wait(60);
}
const minutes = () => Number((txt(main).match(/About (\d+) min/) || [])[1] || 0);
await coach();
const before = txt(main), minsBefore = minutes();
ok("5pc. the lighter day is on the screen, with its reason", LINE.test(before), before.slice(0, 200));
const keep = main.querySelector("#cp-lighter-decline");
ok("5a. it offers Keep my usual plan", !!keep && /Keep my usual plan/.test(txt(keep)), keep ? txt(keep) : "no button");
if (keep) { click("#cp-lighter-decline"); await wait(60); }
const after = txt(main);
ok("5b. after Keep my usual plan, the line has gone", !LINE.test(after), after.slice(0, 200));
ok("5c. and the plan is longer", minutes() > minsBefore, `${minsBefore} -> ${minutes()} min`);
ok("5d. the choice is for today", store.get("lighterDayDeclinedOn") === local(new Date()), String(store.get("lighterDayDeclinedOn")));
ok("5e. the offer does not come back once taken", !main.querySelector("#cp-lighter-decline"));

await coach("personal");   // Harder is on the Plan
ok("5pc2. the Plan also offers Keep my usual plan", !!main.querySelector("#cp-lighter-decline"));
const d = main.querySelector("details.cp-different"); if (d) d.open = true;
click('[data-different="harder"]'); await wait(60);
ok("5f. Harder turns the lighter day down too", !LINE.test(txt(main)) && store.get("lighterDayDeclinedOn") === local(new Date()), txt(main).slice(0, 160));

fixture("free", walks);
CK.saveCheckin({ energy: 6, mood: 6 });
const y = new Date(); y.setDate(y.getDate() - 1);
store.set("lighterDayDeclinedOn", local(y));
ok("5g. yesterday's choice does not carry into today", LINE.test(SB.buildSession({ sessionType: "full", durationMins: 30, equipmentOverride: ["dumbbells-light"] }).coachLine || ""));

await (async () => { fixture("free", []); CK.saveCheckin({ energy: 6, mood: 6 }); main.innerHTML = ""; CoachProposalView(rtr).mount(main); await wait(60); })();
ok("5h. no lighter day, no offer", !main.querySelector("#cp-lighter-decline"));

console.log("");
if (fails) { console.log(`LIGHTER-COUNT: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`LIGHTER-COUNT: all ${passes} assertions pass\n`);
process.exit(0);
