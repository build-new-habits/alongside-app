/**
 * tools/verify-onboarding-echoes.mjs
 * 04 Oct 2026 v4
 *
 * v4 - LOOK-1: TEST 3 looks for the Activity level row on each Settings
 *   section page in turn (it lives on Your plan now, not the index); same
 *   text match, no assertion loosened.
 *
 * v3 - AGE-CHECK. Onboarding asks when you were born before consent; the
 *   fixture answers as an adult (January 1990). No assertion changed.
 *
 * v2 - PT-2 HEALTH-CONSENT. Onboarding's consent has a second tick, for
 *   health answers; the fixture ticks both. No assertion changed.
 *
 * P11, ONBOARDING ECHOES (persona finding W2-10).
 *   - The thread said the person's answers back as ids: "feel-better,
 *     build-habit", "lower-back". generateSummary() was handed stored ids
 *     and its own comment said it was given labels.
 *   - "One more thing, and then I'll stop asking questions" -- then four
 *     more questions.
 *   - Settings said "Activity level: Not set" after it was answered:
 *     onboarding writes lifestyle.activityLevel, Settings read only
 *     fitnessLevel, and its list lacked "Coming back after a break".
 *
 * Walks the real onboarding thread, sheets included, then opens Settings.
 */
import { createRequire } from "node:module";
import { settingsSection } from "./settings-open.mjs";
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

localStorage.clear(); store.init();
const el = document.createElement("div"); document.body.appendChild(el);
ThreadView(rtr).mount(el);
await wait(2500);
  { const mo = el.querySelector("#ob-age-month"), yr = el.querySelector("#ob-age-year"); if (mo && yr) { mo.value = "1"; yr.value = "1990"; el.querySelector("#ob-age-continue").dispatchEvent(new dom.window.Event("click")); await wait(20); } }
const check = el.querySelector("#ob-consent-check");
check.checked = true; check.dispatchEvent(new dom.window.Event("change"));
{ const h = el.querySelector("#ob-consent-health"); if (h) { h.checked = true; h.dispatchEvent(new dom.window.Event("change")); } }
el.querySelector("#ob-consent-continue").dispatchEvent(new dom.window.Event("click"));
await wait(300);

// Walk it as a person would, choosing real things in the sheets.
const sheetsDone = [];
const used = new WeakSet();
let idle = 0;
for (let i = 0; i < 400; i++) {
  await wait(150);
  const panel = document.querySelector(".sheet-panel.is-open");
  if (panel) {
    idle = 0;
    const content = panel.querySelector(".sheet-content");
    if (content.querySelector("[data-goal]")) {
      [...content.querySelectorAll("[data-goal]")].slice(0, 2).forEach(click);
      click(content.querySelector('[data-action="continue"]')); sheetsDone.push("goals");
    } else if (content.querySelector("[data-condition]") && typeof window.toggleCondition === "function") {
      window.toggleCondition("knee"); window.toggleCondition("lower-back"); window.saveConditions(); sheetsDone.push("conditions");
    } else {
      document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })); sheetsDone.push("skip");
    }
    await wait(500);
    continue;
  }
  // Newest controls only, and never the same one twice.
  const fresh = sel => [...el.querySelectorAll(sel)].filter(b => !used.has(b) && !b.disabled).at(-1);
  const trays = el.querySelectorAll(".ob-chips");
  const tray = trays.length ? trays[trays.length - 1] : null;
  const open = fresh('[data-action="open"]');
  const confirm = tray && [...tray.querySelectorAll(".ob-chips__confirm")].find(b => !used.has(b) && !b.disabled);
  const chip = tray && !used.has(tray) && tray.querySelector(".ob-chip:not([disabled])");
  const field = el.querySelector(".ob-input-bar__field");
  const cont = fresh(".ob-continue-btn, .ob-gate__btn--primary");
  const acted = () => { idle = 0; };
  if (open) { acted(); used.add(open); click(open); await wait(400); continue; }
  if (field) { acted(); field.value = field.type === "date" ? "2026-12-20" : "Sam"; el.querySelector(".ob-input-bar__send")?.dispatchEvent(new dom.window.Event("click")); continue; }
  if (confirm) { acted(); used.add(confirm); used.add(tray); confirm.dispatchEvent(new dom.window.Event("click")); continue; }
  if (chip) { acted(); chip.dispatchEvent(new dom.window.Event("click")); if (!tray.querySelector(".ob-chips__confirm")) used.add(tray); continue; }
  if (cont) { acted(); used.add(cont); cont.dispatchEvent(new dom.window.Event("click")); continue; }
  // The coach is typing: wait, and stop only after four quiet seconds.
  if (++idle > 26) break;
  continue;
}

if (process.env.DBG) { console.log("USER:", [...el.querySelectorAll(".ob-bubble--user")].map(txt).join(" | ")); console.log("LAST:", txt(el).slice(-400)); console.log("BTNS:", [...el.querySelectorAll("button")].slice(-6).map(b => (b.className + ":" + txt(b)).slice(0, 60)).join(" || ")); }
// ── 1. ANSWERS SAID BACK IN WORDS ────────────────────────────────────────
console.log("\nTEST 1 - the thread says answers back in words");
const userBubbles = [...el.querySelectorAll(".ob-bubble--user")].map(txt);
ok("1pc. the walk went through the goals and sore-area sheets", sheetsDone.includes("goals") && sheetsDone.includes("conditions") &&
   (store.get("goals") || []).length >= 2 && (store.get("conditions") || []).includes("knee"), `${sheetsDone.join(",")}; goals ${JSON.stringify(store.get("goals"))}`);
const ids = userBubbles.filter(b => /\b[a-z]+-[a-z]+(-[a-z]+)*\b/.test(b) && !/\d/.test(b));
ok("1a. no reply bubble shows an id", ids.length === 0, JSON.stringify(ids));

// ── 2. HONEST COUNTING ───────────────────────────────────────────────────
console.log("\nTEST 2 - \"one more thing\" means one more");
{
  const nodes = [...el.querySelectorAll(".ob-bubble--coach, .ob-bubble--user")];
  const bad = [];
  nodes.forEach((n, i) => {
    if (!n.classList.contains("ob-bubble--coach")) return;
    if (!/one more thing|one last thing|last question|final question|one more question/i.test(txt(n))) return;
    const answersAfter = nodes.slice(i + 1).filter(m => m.classList.contains("ob-bubble--user")).length;
    if (answersAfter > 1) bad.push(`"${txt(n).slice(0, 50)}" then ${answersAfter} answers`);
  });
  ok("2pc. the walk answered many questions", userBubbles.length >= 8, `${userBubbles.length}`);
  ok("2a. no \"one more\" is followed by more than one answer", bad.length === 0, bad.join("; "));
}

// ── 3. SETTINGS SHOWS WHAT WAS ANSWERED ─────────────────────────────────
console.log("\nTEST 3 - Settings shows the activity level they gave");
{
  const answered = (store.get("lifestyle") || {}).activityLevel;
  store.set("onboardingComplete", true);
  const { SettingsView } = await import(B + "views/settings.js");
  const main = document.getElementById("main-content");
  main.innerHTML = ""; SettingsView(rtr).mount(main); await wait(30);
  const findRow = () => [...main.querySelectorAll(".settings-row")].find(r => /Activity level/.test(txt(r)));
  let row = findRow();
  for (const id of ["you", "body", "sessions", "display", "data", "plan", "about"]) { if (row) break; settingsSection(main, id); row = findRow(); }
  const { ACTIVITY_CHIPS } = await import(B + "data/onboarding-thread-data.js");
  const label = (ACTIVITY_CHIPS.find(c => c.id === answered) || {}).label;
  ok("3pc. onboarding recorded an answer", !!answered && !!label, String(answered));
  ok("3a. the row shows it, in the words it was chosen in", !!row && txt(row).includes(label) && !/Not set/.test(txt(row)), txt(row));
  click(row?.querySelector("button, a") || row); await wait(30);
  const sel = main.querySelector("#settings-fitness-level");
  const opts = sel ? [...sel.options].map(o => o.value) : [];
  ok("3b. the same five answers are offered, and theirs is selected", ACTIVITY_CHIPS.every(c => opts.includes(c.id)) && sel?.value === answered, `${JSON.stringify(opts)} selected ${sel?.value}`);
  if (sel) { sel.value = "returning"; sel.dispatchEvent(new dom.window.Event("change", { bubbles: true })); await wait(20); }
  ok("3c. changing it here changes the one answer everything reads", store.get("fitnessLevel") === "returning" && (store.get("lifestyle") || {}).activityLevel === "returning",
     `fitnessLevel ${store.get("fitnessLevel")}, lifestyle ${(store.get("lifestyle") || {}).activityLevel}`);
}

console.log("");
if (fails) { console.log(`ONBOARDING-ECHOES: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`ONBOARDING-ECHOES: all ${passes} assertions pass\n`);
process.exit(0);
