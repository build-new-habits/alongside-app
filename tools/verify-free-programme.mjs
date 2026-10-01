/**
 * tools/verify-free-programme.mjs
 * 01 Oct 2026 v2
 *
 * v2 - PT-2 HEALTH-CONSENT. Onboarding's consent has a second tick, for
 *   health answers; the fixture ticks both. No assertion changed.
 *
 * P12, FREE PROGRAMME (persona finding W2-9, seen by all eight). Graeme
 * accepted the recommendation (28 Sep): on Free, no programme is offered
 * or shown; Progress has one session count and no target score; the
 * suggestion reads activity level.
 *
 * Measured before: onboarding offered every user a 12-week programme
 * ("exactly where I'd have started you"); on Free it shaped nothing, but
 * the player said "Build Your Base · Week 2 · Session B" and Progress
 * scored against it -- "4 of 3 this week", milestones, a second count.
 * And the suggestion ignored activity level: somebody regularly training
 * who asked for strength and cardio was offered Couch to Cardio.
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");

const dom = new JSDOM('<!doctype html><html><body><div id="app"><div id="main-content"></div></div><div id="sr-announcer"></div></body></html>', { url: "https://localhost/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
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
const main = document.getElementById("main-content");

// ── 1. ONBOARDING OFFERS A PROGRAMME ON THE PLAN ONLY ─────────────────────
async function walkOnboarding(tier) {
  localStorage.clear(); store.init();
  store.set("tier", tier);
  const { ThreadView } = await import(B + `views/onboarding/thread.js?t=${tier}`);
  const el = document.createElement("div"); document.body.appendChild(el);
  ThreadView(rtr).mount(el);
  await wait(2500);
  const c = el.querySelector("#ob-consent-check");
  c.checked = true; c.dispatchEvent(new dom.window.Event("change"));
  { const h = el.querySelector("#ob-consent-health"); if (h) { h.checked = true; h.dispatchEvent(new dom.window.Event("change")); } }
  el.querySelector("#ob-consent-continue").dispatchEvent(new dom.window.Event("click"));
  await wait(300);
  const used = new WeakSet(); const sheets = []; let idle = 0;
  for (let i = 0; i < 400; i++) {
    await wait(150);
    const panel = document.querySelector(".sheet-panel.is-open");
    if (panel) {
      idle = 0;
      const content = panel.querySelector(".sheet-content");
      if (content.querySelector(".plan-card")) sheets.push("plan-select");
      else if (content.querySelector("[data-goal]")) sheets.push("goals");
      else sheets.push("other");
      document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await wait(500); continue;
    }
    const fresh = sel => [...el.querySelectorAll(sel)].filter(b => !used.has(b) && !b.disabled).at(-1);
    const trays = el.querySelectorAll(".ob-chips"); const tray = trays.length ? trays[trays.length - 1] : null;
    const open = fresh('[data-action="open"]');
    const confirm = tray && [...tray.querySelectorAll(".ob-chips__confirm")].find(b => !used.has(b) && !b.disabled);
    const chip = tray && !used.has(tray) && tray.querySelector(".ob-chip:not([disabled])");
    const field = el.querySelector(".ob-input-bar__field");
    const cont = fresh(".ob-continue-btn, .ob-gate__btn--primary");
    if (open) { idle = 0; used.add(open); click(open); await wait(400); continue; }
    if (field) { idle = 0; field.value = field.type === "date" ? "2026-12-20" : "Sam"; el.querySelector(".ob-input-bar__send")?.dispatchEvent(new dom.window.Event("click")); continue; }
    if (confirm) { idle = 0; used.add(confirm); used.add(tray); confirm.dispatchEvent(new dom.window.Event("click")); continue; }
    if (chip) { idle = 0; chip.dispatchEvent(new dom.window.Event("click")); if (!tray.querySelector(".ob-chips__confirm")) used.add(tray); continue; }
    if (cont) { idle = 0; used.add(cont); cont.dispatchEvent(new dom.window.Event("click")); continue; }
    if (++idle > 26) break;
  }
  const said = txt(el);
  el.remove();
  return { sheets, said, reachedEnd: /Let.s begin/.test(said) };
}
console.log("\nTEST 1 - onboarding offers a programme on the Plan only");
{
  const free = await walkOnboarding("free");
  const plan = await walkOnboarding("personal");
  ok("1pc. both walks reached the end of onboarding", free.reachedEnd && plan.reachedEnd, `${free.reachedEnd} ${plan.reachedEnd}`);
  ok("1a. Free: no programme is offered", !free.sheets.includes("plan-select") && !/exactly where I.d have started you|put together a few options/.test(free.said), free.sheets.join(","));
  ok("1b. the Plan: it still is (control)", plan.sheets.includes("plan-select"), plan.sheets.join(","));
}

// ── 2. NOR SHOWN ON FREE ──────────────────────────────────────────────────
function freeWithOldProgramme() {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "free"); store.set("name", "Sam");
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("activeProgramme", { ...(store.get("activeProgramme") || {}), programmeId: "beginner-fitness", startDate: new Date(Date.now() - 9 * 864e5).toISOString(), currentWeek: 2 });
  store.set("strategicGoal.weeklySessionTarget", 3); store.set("strategicGoal.setAt", new Date().toISOString());
  const d = n => new Date(Date.now() - n * 864e5).toISOString();
  store.set("activityLog", [1, 2, 3, 4].map(n => ({ id: "a" + n, type: "workout", status: "completed", completedAt: d(n), date: d(n) })));
}
console.log("\nTEST 2 - on Free a programme left over is not shown");
{
  freeWithOldProgramme();
  ok("2pc. a Free user holding an old programme", store.get("tier") === "free" && store.hasActiveProgramme());
  const { ProgressView } = await import(B + "views/progress.js");
  main.innerHTML = ""; ProgressView(rtr).mount(main); await wait(40);
  const p = txt(main);
  ok("2a. Progress: no target score and no programme block", !/\d+ of \d+ this week/.test(p) && !main.querySelector(".progress-programme") && !/Milestones/.test(p), p.slice(0, 200));
  ok("2b. Progress: one count of sessions", (p.match(/\b4 (sessions|times)\b/g) || []).length >= 1 && !/sessions? completed/.test(p), p.slice(0, 200));
  // The session screen with their own session.
  const SB = await import(B + "session-builder.js");
  const s = SB.buildSession({ sessionType: "full", durationMins: 20, equipmentOverride: [] });
  store.set("generatedSession", { session: s, builtAt: new Date().toISOString(), inputs: {} });
  store.set("usingGeneratedSession", true);
  const { GymProgrammeView } = await import(B + "views/gym-programme.js");
  main.innerHTML = ""; GymProgrammeView(rtr).mount(main); await wait(40);
  ok("2c-pc. the session screen shows their session", txt(main).includes(s.exercises[0].name), txt(main).slice(0, 120));
  ok("2c. and does not announce a programme week", !/Week \d+ · Session/.test(txt(main)), txt(main).slice(0, 160));
}

// ── 3. THE SUGGESTION READS ACTIVITY LEVEL ─────────────────────────────────
console.log("\nTEST 3 - the suggestion reads activity level and the first goal");
async function firstCard(level, goals) {
  localStorage.clear(); store.init();
  store.set("tier", "personal"); store.set("goals", goals); store.set("lifestyle.activityLevel", level);
  const { PlanSelectView } = await import(B + "views/onboarding/plan-select.js");
  main.innerHTML = ""; PlanSelectView(rtr).mount(main); await wait(20);
  return txt(main.querySelector(".plan-card"));
}
{
  const active = await firstCard("active", ["get-stronger", "improve-cardio"]);
  const sitting = await firstCard("sedentary", ["improve-cardio", "get-stronger"]);
  ok("3pc. the plan cards render", !!active && !!sitting);
  ok("3a. regularly training, strength first: not Couch to Cardio", !/Couch to Cardio/.test(active) && /Strength That Lasts/.test(active), active.slice(0, 80));
  ok("3b. mostly sitting, cardio first: the beginner cardio programme", /Couch to Cardio/.test(sitting), sitting.slice(0, 80));
}

console.log("");
if (fails) { console.log(`FREE-PROGRAMME: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`FREE-PROGRAMME: all ${passes} assertions pass\n`);
process.exit(0);
