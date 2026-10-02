/**
 * tools/verify-delete-careful.mjs
 * 02 Oct 2026 v1
 *
 * W4-2 DELETE-LOOSENS and W4-15 DELETE-TRUE (Wave 4 persona trace,
 * 01 Oct 2026; found by 2.1, 2.12, 2.14).
 *
 * Delete my health answers said "Until you tell me again, I will plan as
 * cautiously as I can". It reset what the person said their body can do to
 * NOT ASKED, and the builder reads not asked as no restriction: the floor,
 * seated, balance and legs filters all need capability.asked, and impact
 * falls back to the declared fitness level. A person who cannot get to
 * the floor was given Prone Hip Extension, Glute Bridge and Dead Bug. And
 * nothing asked again.
 *
 *   1. Before: a person who said no to the chair and the floor, worried
 *      about balance, no impact, gets only careful work (positive control).
 *   2. After Delete: 50 builds through buildSession, the call the coach's
 *      plan makes: nothing on the floor, nothing standing, no balance work,
 *      no impact. Also for a person with no limits who declared a moderate
 *      fitness level.
 *   3. The dialog says what careful means, and names the reflection, and
 *      what stays.
 *   4. Health consent given again: the next built session first opens
 *      Settings › What your body can do; once answered, the plan opens.
 *      Without health consent nothing is asked (and planning stays careful).
 *   5. W4-15. While health consent is withdrawn: a lift note is not kept
 *      (the weight is), the lift log offers no note box, and My exercises
 *      offers no Notes box and keeps none.
 *   6. W4-15. "Let me tell you" (after an injury) goes to the health
 *      consent first while it is withdrawn.
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
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
const { buildSession } = await import(B + "session-builder.js");
const HC = await import(B + "data/health-consent.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

const CAREFUL = { chairRise: "no", floorAccess: "no", bothFeet: "no", balanceWorry: "yes" };
const NO_LIMITS = { chairRise: "yes", floorAccess: "yes", bothFeet: "yes", balanceWorry: "no" };

function person(cap, { level = "moderate" } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", "personal");
  store.set("activityLevel", level);
  store.set("equipment", []); store.set("homeEquipment", []);
  store.set("capability", { ...store.get("capability"), ...cap, askedAt: new Date().toISOString() });
  router.currentView = "today"; router.history = [];
  HC.takePendingRoute?.();
}

const TYPES = ["full-body", "lower", "upper", "core", "mobility"];
function sweep(n = 50) {
  const bad = { floor: new Set(), standing: new Set(), balance: new Set(), impact: new Set() };
  let built = 0;
  for (let i = 0; i < n; i++) {
    let s;
    try { s = buildSession({ sessionType: TYPES[i % TYPES.length], durationMins: 30 }); } catch { continue; }
    const list = (s?.exercises || s?.blocks?.flatMap(b => b.exercises || []) || []);
    if (list.length) built++;
    for (const ex of list) {
      if (ex.position === "floor") bad.floor.add(ex.name);
      if (ex.position && ex.position !== "seated" && ex.position !== "any") bad.standing.add(ex.name);
      if (ex.balanceDemand === true) bad.balance.add(ex.name);
      if (ex.impact === true) bad.impact.add(ex.name);
    }
  }
  return { built, bad: Object.fromEntries(Object.entries(bad).map(([k, v]) => [k, [...v]])) };
}
const show = r => Object.entries(r.bad).filter(([, v]) => v.length).map(([k, v]) => `${k}: ${v.slice(0, 4).join(", ")}`).join(" | ");

// ── 1. BEFORE ───────────────────────────────────────────────────────────
console.log("\nTEST 1 - before Delete: careful answers give careful work");
person(CAREFUL);
const before = sweep(25);
ok("1pc. sessions were built", before.built >= 20, `built ${before.built}`);
ok("1a. no floor, standing, balance or impact work", Object.values(before.bad).every(v => v.length === 0), show(before));

// ── 2. AFTER DELETE ─────────────────────────────────────────────────────
console.log("\nTEST 2 - after Delete: still careful, for everyone");
person(CAREFUL);
store.deleteHealthAnswers();
ok("2pc. the answers are gone", !store.get("capability")?.askedAt && store.get("capability")?.chairRise == null);
let after = sweep();
ok("2pc2. sessions were built", after.built >= 40, `built ${after.built}`);
ok("2a. nothing on the floor", after.bad.floor.length === 0, after.bad.floor.slice(0, 5).join(", "));
ok("2b. nothing standing", after.bad.standing.length === 0, after.bad.standing.slice(0, 5).join(", "));
ok("2c. no balance work", after.bad.balance.length === 0, after.bad.balance.slice(0, 5).join(", "));
ok("2d. no impact", after.bad.impact.length === 0, after.bad.impact.slice(0, 5).join(", "));
person(NO_LIMITS, { level: "moderate" });
store.deleteHealthAnswers();
after = sweep();
ok("2e. a person with no limits and a moderate level is planned for carefully too", Object.values(after.bad).every(v => v.length === 0), show(after));

// ── 3. THE DIALOG ───────────────────────────────────────────────────────
console.log("\nTEST 3 - the dialog says what careful means, and what goes and stays");
person(CAREFUL);
const { SettingsView } = await import(B + "views/settings.js");
main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main); await wait(10);
click(main.querySelector('[data-action="delete-health"]')); await wait(10);
const dlg = txt(document.querySelector(".settings-dialog__message"));
ok("3a. careful is spelled out: seated, nothing on the floor, no balance work, nothing with impact",
   /seated/i.test(dlg) && /floor/i.test(dlg) && /balance/i.test(dlg) && /impact|jump/i.test(dlg), dlg);
ok("3b. it names your reflection", /reflection/i.test(dlg), dlg);
ok("3c. it says what stays, goals included", /stay/i.test(dlg) && /goals?/i.test(dlg), dlg);
ok("3d. it says the body questions are asked again", /ask/i.test(dlg) && /(body|what you can do)/i.test(dlg), dlg);
click(document.querySelector("#confirm-ok")); await wait(10);

// ── 4. ASKED AGAIN ──────────────────────────────────────────────────────
console.log("\nTEST 4 - asked again before the next built session");
let landed = [];
const realMount = router._mountView.bind(router);
router._mountView = async name => {
  landed.push(name);
  if (name === "settings") { main.innerHTML = ""; SettingsView(router).mount(main); }
};
const go = async r => { landed = []; await router.navigate(r); await wait(15); return landed.at(-1); };

person(CAREFUL); store.deleteHealthAnswers();
ok("4a. without health consent the coach's plan is not held up (planning stays careful)",
   ["coach-proposal", "red-flag"].includes(await go("coach-proposal")), JSON.stringify(landed));
HC.giveHealthConsent();
const to = await go("coach-proposal");
ok("4b. consent given again: the next plan opens What your body can do first", to === "settings" && /What your body can do/.test(txt(main.querySelector("h1"))),
   `${to} | ${txt(main.querySelector("h1"))}`);
ok("4c. it says why, in one line", /before I plan|before the next/i.test(txt(main)), txt(main).slice(0, 200));
for (const t of ["session-builder", "know-what", "core-session"]) {
  ok(`4d. the same from ${t}`, (await go(t)) === "settings");
}
store.set("capability", { ...store.get("capability"), ...CAREFUL, askedAt: new Date().toISOString() });
ok("4e. once answered, the plan opens", ["coach-proposal", "red-flag"].includes(await go("coach-proposal")), JSON.stringify(landed));
person(NO_LIMITS);
ok("4f. positive control: somebody who never deleted is not stopped", ["coach-proposal", "red-flag"].includes(await go("coach-proposal")));
router._mountView = realMount;

// ── 5. NOTES WHILE WITHDRAWN ────────────────────────────────────────────
console.log("\nTEST 5 - no notes kept while health consent is withdrawn");
person(CAREFUL); store.set("liftLogEnabled", true);
store.logLift("goblet-squat", { weight: 10, reps: 8, note: "fine" });
ok("5pc. with consent, a lift note is kept", store.lastLift("goblet-squat")?.note === "fine");
store.deleteHealthAnswers();
store.logLift("goblet-squat", { weight: 12, reps: 8, note: "knee twinge" });
const last = store.lastLift("goblet-squat") || {};
ok("5a. withdrawn: the weight is kept, the note is not", last.weight === 12 && last.note === undefined && !/knee twinge/.test(JSON.stringify(store.data)), JSON.stringify(last));
const SL = await import(B + "session-log.js");
const BW = { id: "press-up", name: "Press-Up", equipment: [], movementPattern: "push" };
const block = SL.renderLogBlock(BW, "t");
ok("5b. withdrawn: the lift log offers no note box", !!block && !/Note/.test(block.replace(/<[^>]+>/g, " ")), block.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 160));
const PX = await import(B + "views/prescribed.js");
main.innerHTML = PX.render(); PX.onMount(); await wait(10);
click(main.querySelector("#px-toggle-form-btn")); await wait(10);
ok("5pc2. the add form is open", !!main.querySelector("#px-name"), txt(main).slice(0, 120));
ok("5c. withdrawn: My exercises offers no Notes box", !main.querySelector("#px-notes"));
if (main.querySelector("#px-name")) {
  main.querySelector("#px-name").value = "Calf raise";
  const nt = main.querySelector("#px-notes"); if (nt) nt.value = "from the clinic, left knee";
  main.querySelector("#px-add-form").dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })); await wait(10);
}
const px = (store.get("prescribedExercises") || []).find(e => e.name === "Calf raise");
ok("5d. the exercise is saved, with no notes", !!px && px.notes === undefined && !/left knee/.test(JSON.stringify(store.data)), JSON.stringify(px));

// ── 6. LET ME TELL YOU ──────────────────────────────────────────────────
console.log("\nTEST 6 - Let me tell you asks for the health consent first");
person(NO_LIMITS); store.deleteHealthAnswers();
store.set("activityLog", [{ id: "a1", type: "workout", completedAt: new Date(Date.now() - 20 * 86400000).toISOString(), durationMins: 20 }]);
store.set("absence", { ...(store.get("absence") || {}), context: "injury", capturedAt: new Date().toISOString() });
const navs = [];
const fakeRouter = { navigate(v) { navs.push(v); }, back() {}, history: [] };
const CP = await import(B + "views/coach-proposal.js");
main.innerHTML = "";
try { CP.CoachProposalView(fakeRouter).mount(main); } catch (e) { console.log("        mount: " + e.message); }
await wait(30);
const tell = main.querySelector('[data-hurts="tell"]');
ok("6pc. the prompt is on screen", !!tell, txt(main).slice(0, 160));
const sheetsBefore = document.querySelectorAll(".sheet, [role='dialog']").length;
click(tell); await wait(20);
ok("6a. withdrawn: it goes to the health consent, and no sheet opens",
   navs.includes("health-consent") && document.querySelectorAll(".sheet, [role='dialog']").length === sheetsBefore, JSON.stringify(navs));

console.log(`\nDELETE-CAREFUL: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
