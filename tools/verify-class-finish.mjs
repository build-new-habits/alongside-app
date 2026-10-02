/**
 * tools/verify-class-finish.mjs
 * 02 Oct 2026 v2
 *
 * v2 - W4-1 GATE-OPEN. The fixture person has agreed (tools/agreed.mjs): the
 *   app now sends anybody who has not back to onboarding. No assertion
 *   changed.
 *
 * W3-3 CLASS-FINISH (Wave 3: personas 2.1, 2.11, 2.12, 2.13, 2.14). A class
 * and My exercises logged the session but never set currentActivityEntry,
 * so the finish screen showed the LAST session's numbers and saved the
 * person's answers onto it: Monday's "Worse than usual" and note wiped,
 * its date moved to today. Home then said "a glute session yesterday"
 * after a class, Progress miscounted, and the lighter-day count shifted.
 *
 *   1. A class, through the real router, after a workout with answers:
 *      the finish shows the class, the answers go on the class, the
 *      workout keeps its date, its "Worse than usual" and its note.
 *   2. My exercises: the same.
 *   3. The finish screen never moves an existing entry's completedAt.
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

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s), $$ = s => [...main.querySelectorAll(s)];
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));

function fixture(tier) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("equipment", ["dumbbells", "bench"]); store.set("homeEquipment", ["dumbbells", "bench"]);
  store.set("conditions", []); store.set("conditionPainScores", {});
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
async function go(view) { await router.navigate(view); await wait(80); }
const log = () => store.get("activityLog") || [];
const btnTxt = re => [...main.querySelectorAll("button")].find(b => re.test(txt(b)) && !b.closest("[hidden]"));
const MON = "2026-09-28T07:30:00.000Z";
function withMonday() {
  const mon = store.logActivity({ type: "workout", sessionType: "glute", date: MON, completedAt: MON, status: "completed",
    exercisesCount: 12, exerciseIds: ["glute-bridge"], durationMins: 30 });
  const l = log(); const i = l.findIndex(e => e.id === mon.id);
  l[i] = { ...l[i], completedAt: MON, painChange: "worse", note: "Back flared again." };
  store.set("activityLog", l);
  store.set("currentActivityEntry", l[i]);   // as its own finish screen left it
  return mon.id;
}
const monday = id => log().find(e => e.id === id);

console.log("\nTEST 1 - a class after a workout with answers");
fixture("free");
const id1 = withMonday();
await go("classes");
const row = [...main.querySelectorAll(".class-list__row")].find(r => /Getting Going/.test(txt(r)));
click(row?.querySelector("[data-start]")); await wait(300);
ok("1pc. the class started", router.currentView === "class-player", router.currentView);
for (let i = 0; i < 40 && router.currentView === "class-player"; i++) {
  if (main.querySelector("#cp-reflect")) { click(main.querySelector("#cp-reflect")); await wait(300); break; }
  click(main.querySelector("#cp-skip")); await wait(60);
}
ok("1pc2. the finish screen is showing", router.currentView === "reflect", router.currentView);
ok("1a. the finish does not show the workout's 12 moves", !/12 moves/.test(txt(main)), txt(main).slice(0, 200));
const cls = log().filter(e => e.type === "class").at(-1);
ok("1b. the finish's entry is the class", store.get("currentActivityEntry")?.id === cls?.id, `${store.get("currentActivityEntry")?.type} vs class ${cls?.id}`);
click(btnTxt(/^Back to Home$/) || btnTxt(/Home/)); await wait(200);
const m1 = monday(id1);
ok("1c. Monday keeps its date", m1.completedAt === MON, m1.completedAt);
ok("1d. Monday keeps Worse than usual and its note", m1.painChange === "worse" && m1.note === "Back flared again.", JSON.stringify({ p: m1.painChange, n: m1.note }));

console.log("\nTEST 2 - My exercises after a workout with answers");
fixture("free");
const id2 = withMonday();
store.set("prescribedExercises", [{ id: "own-1", exerciseId: "glute-bridge", name: "Glute bridge", sets: 1, reps: "5", notes: "", active: true, completedToday: false }]);
await go("prescribed-session");
const tapId = id => { const el = document.getElementById(id); if (el) click(el); return !!el; };
for (let i = 0; i < 60 && router.currentView === "prescribed-session"; i++) {
  if (!tapId("ps-complete-btn") && !tapId("ps-done-btn") && !tapId("ps-watch-btn") && !tapId("ps-begin-btn")) break;
  await wait(40);
}
ok("2pc. My exercises reached the finish screen", router.currentView === "reflect", router.currentView);
const own = log().filter(e => e.type === "prescribed-session").at(-1);
ok("2a. the finish's entry is My exercises", !!own && store.get("currentActivityEntry")?.id === own.id, store.get("currentActivityEntry")?.type);
click(btnTxt(/^Back to Home$/) || btnTxt(/Home/)); await wait(200);
const m2 = monday(id2);
ok("2b. Monday untouched", m2.completedAt === MON && m2.painChange === "worse" && m2.note === "Back flared again.", JSON.stringify({ c: m2.completedAt, p: m2.painChange }));

console.log("\nTEST 3 - answering how it felt never moves the session");
fixture("free");
const TWO_H = new Date(Date.now() - 2 * 3600e3).toISOString();
const late = store.logActivity({ type: "walk", date: TWO_H, completedAt: TWO_H, status: "completed", durationMins: 20 });
store.set("currentActivityEntry", late);
await go("reflect");
const chip = main.querySelector("[data-feel]"); const chosen = chip?.dataset.feel; click(chip); await wait(40);
click(btnTxt(/^Back to Home$/) || btnTxt(/Home/)); await wait(200);
const after = log().find(e => e.id === late.id);
ok("3pc. the answer was saved on the walk", !!chosen && after?.feel === chosen, `${chosen} -> ${JSON.stringify(after?.feel)}`);
ok("3a. the walk keeps its completedAt", after?.completedAt === TWO_H, `${after?.completedAt} vs ${TWO_H}`);

console.log("");
if (fails) { console.log(`CLASS-FINISH: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`CLASS-FINISH: all ${passes} assertions pass\n`);
process.exit(0);
