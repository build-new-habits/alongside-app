/**
 * tools/verify-not-sure-pick.mjs
 * 30 Sep 2026 v1
 *
 * W3-11 NOT-SURE-PICK (persona Wave 3: 2.1, 2.11, 2.12, 2.13, 2.14, 2.16).
 * "Not sure? I'll pick something" opens the coach's plan, and on Free --
 * where there is no arc -- the pick walked the session types in library
 * order: Glute Focus first for everybody, whatever they came for, then
 * the next unused type, including "Gym" for somebody at home. "Mostly the
 * same" in Settings did not reach the pick at all.
 *
 *   1. With nothing to go on, the first pick is Full Body, not Glute Focus.
 *   2. The person's goals lead when there is no arc: cardio for a cardio
 *      goal, mobility for flexibility, strength types for getting
 *      stronger -- and they rotate within the goal.
 *   3. "Gym" is never picked away from the gym; at the gym it can be.
 *   4. "Mostly the same" picks the kind of session they did last.
 *   5. Through the real coach screen, as Not sure opens it, on Free.
 *   6. Controls: a planned class day and the Plan's arc still lead.
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
const SC = await import(B + "data/session-choice.js");

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
const at = (daysAgo, hour) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(hour, 0, 0, 0); return d.toISOString(); };

function person({ tier = "free", goals = [], log = [], where = "home", variety = "balanced" } = {}) {
  localStorage.clear(); store.init();
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("goals", goals); store.set("sessionVariety", variety);
  store.set("homeEquipment", ["dumbbells-light"]); store.set("gymEquipment", ["barbell", "cable-machine", "treadmill"]);
  store.set("equipment", ["dumbbells-light"]); store.set("sessionLocation", where);
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  store.set("activityLog", log.map((t, i) => ({ id: "e" + i, type: "workout", status: "completed", sessionType: t, completedAt: at(log.length - i + 1, 18) })));
}
const pick = where => SC.chooseSessionType({ location: where }).sessionType;
// Pick, "do" it, pick again: n sessions in a row as the person would meet them.
function run(n, opts) {
  person(opts);
  const got = [];
  for (let i = 0; i < n; i++) {
    const t = pick(opts.where || "home"); got.push(t);
    const log = store.get("activityLog") || [];
    store.set("activityLog", [...log, { id: "r" + i, type: "workout", status: "completed", sessionType: t, completedAt: new Date(Date.now() - (n - i) * 60000).toISOString() }]);
  }
  return got;
}

console.log("\nTEST 1 - nothing to go on");
person();
ok("1a. a blank slate's first pick is Full Body, not Glute Focus", pick("home") === "full", pick("home"));

console.log("\nTEST 2 - the person's goals lead when there is no arc");
person({ goals: ["improve-cardio"] });
ok("2a. a cardio goal: Cardio", pick("home") === "cardio", pick("home"));
person({ goals: ["flexibility"] });
ok("2b. flexibility: Mobility", pick("home") === "mobility", pick("home"));
person({ goals: ["get-stronger"] });
const strong = ["full", "lower", "upper", "core", "glute"];
ok("2c. getting stronger: a strength session", strong.includes(pick("home")), pick("home"));
const six = run(6, { goals: ["get-stronger"] });
ok("2d. getting stronger, six sessions: strength every time, and it rotates", six.every(t => strong.includes(t)) && new Set(six).size >= 3, six.join(", "));
const cardioRun = run(4, { goals: ["start-running"] });
ok("2e. a running goal stays with cardio-led work", cardioRun.filter(t => t === "cardio").length >= 2, cardioRun.join(", "));
ok("2f. the goal is recorded as read", (() => { person({ goals: ["flexibility"] }); return (SC.chooseSessionType({ location: "home" }).inputs.goalSessionTypes || []).includes("mobility"); })());

console.log("\nTEST 3 - Gym only at the gym");
const homeRun = run(20, {});
ok("3a. twenty picks at home: never Gym", !homeRun.includes("gym"), homeRun.join(", "));
const outRun = run(20, { where: "outside" });
ok("3b. twenty picks outside: never Gym", !outRun.includes("gym"), outRun.join(", "));
const gymRun = run(20, { where: "gym" });
ok("3c. control: at the gym, Gym can come up", gymRun.includes("gym"), gymRun.join(", "));

console.log("\nTEST 4 - Mostly the same");
person({ variety: "familiar", log: ["glute", "upper"] });
ok("4a. after an upper session, Mostly the same picks upper again", pick("home") === "upper", pick("home"));
person({ variety: "familiar", goals: ["improve-cardio"], log: ["core"] });
ok("4b. it holds even against a goal: the person asked for sameness", pick("home") === "core", pick("home"));
person({ variety: "familiar" });
ok("4c. with nothing done yet it falls through to the usual pick", pick("home") === "full", pick("home"));
person({ variety: "familiar", log: ["gym"] });
ok("4d. last time was Gym, now at home: not Gym", pick("home") !== "gym", pick("home"));

console.log("\nTEST 5 - through the coach screen, as Not sure opens it (Free)");
async function screen(opts) {
  person(opts);
  CK.saveCheckin({ energy: 6, mood: 6 });
  main.innerHTML = ""; CoachProposalView(rtr).mount(main); await wait(60);
  return txt(main);
}
const s1 = await screen({ goals: ["improve-cardio"] });
ok("5a. a cardio goal on Free gets a cardio plan", /cardio/i.test(s1) && !/Glute Focus|glute-focused/i.test(s1), s1.slice(0, 220));
const s2 = await screen({});
ok("5b. a blank slate on Free is not given Glute Focus", !/Glute Focus|glute-focused/i.test(s2), s2.slice(0, 220));

const s3 = await screen({ where: "gym" });
ok("5c. at the gym, the screen passes where it is: the Gym session leads", /Gym session/.test(s3), s3.slice(0, 260));

console.log("\nTEST 6 - controls: what already led still leads");
const { AIMS } = await import(B + "data/aims.js");
const aim = AIMS.list.find(a => a && a.id && (a.strands || []).length);
person({ tier: "personal", goals: ["improve-cardio"] });
if (aim) store.set("arc", { aimId: aim.id, strands: aim.strands });
const arcT = SC.arcSessionTypes();
ok("6a. on the Plan with an arc, the arc leads over the goal", arcT.length > 0 && arcT.includes(pick("home")), `${pick("home")} from [${arcT}]`);

console.log("");
if (fails) { console.log(`NOT-SURE-PICK: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`NOT-SURE-PICK: all ${passes} assertions pass\n`);
process.exit(0);
