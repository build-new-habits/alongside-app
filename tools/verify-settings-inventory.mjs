/**
 * tools/verify-settings-inventory.mjs
 * 30 Sep 2026 v3
 *
 * v3 - W3-8 CYCLE-CLAIM. "Cycle-aware coaching" is retired: nothing read
 *   hormonalTracking, so the switch claimed something the app could not
 *   back. verify-cycle-claim proves it absent, and returns it only if a
 *   reader of the field appears. No other control changed.
 *
 * 29 Sep 2026 v2
 *
 * v2 - P0. "Reduce pain" retired like Tone up; the row is "Sore or injured areas".
 *
 * 28 Sep 2026 v1
 *
 * SMOOTH-P4c. Settings on one page. Spec 4.10.
 *
 * Measured on v553: Settings was an index of four sections, each with
 * sub-tabs, each tab a long page -- three levels to reach a control, and
 * six Save buttons: leave without pressing one and the change was lost.
 * There was no way to say a condition was better, and no way to get
 * your own data out without emailing a sole trader.
 *
 * THE INVENTORY IS NOT TYPED. tools/fixtures/settings-inventory-v553.json
 * was captured by RENDERING every section and tab of the v553 Settings
 * (both tiers, weight tracking and the reminder on, one exercise
 * preference set). Every control in it must be reachable within two taps
 * of the new page -- except the six Save buttons, which must be gone.
 *
 * Driven through the real SettingsView and the real store.
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
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
let lastBlob = null;
globalThis.URL.createObjectURL = b => { lastBlob = b; return "blob:x"; };
globalThis.URL.revokeObjectURL = () => {};

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { SettingsView } = await import(B + "views/settings.js");
const { getDisplayPref } = await import(B + "display-prefs.js");
const INV = JSON.parse(fs.readFileSync(new URL("./fixtures/settings-inventory-v553.json", import.meta.url), "utf8")).controls;

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const wait = ms => new Promise(r => setTimeout(r, ms));
let navs = [];

function fixture({ tier = "personal" } = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "T");
  store.set("weightTracking", true); store.set("checkInNotification.enabled", true);
  store.setExercisePreference("barbell-bench-press", "less");
  store.set("conditions", ["knee", "lower-back"]);
  store.set("conditionMeta", { knee: { addedAt: "2026-09-01", status: "active" } });
  store.set("gymEquipment", ["barbell", "bench-flat"]); store.set("homeEquipment", ["band-medium"]);
  store.set("journalEntries", [{ id: "j", date: new Date().toISOString(), text: "a private line", tags: [] }]);
  navs = [];
}
let view = null;
function page() { main.innerHTML = ""; view = SettingsView({ navigate: v => navs.push(v), back() {} }); view.mount(main); return main; }
const openScreen = key => { page(); click(main.querySelector(`[data-open="${key}"]`)); };
const ATTRS = ["data-action", "data-field", "data-toggle", "data-disp", "data-disp-toggle", "data-scheme", "data-goal", "data-movement", "data-weight-unit", "data-dev-tier", "data-clear-pref"];
function controlsHere() {
  const out = new Set();
  for (const a of ATTRS) main.querySelectorAll(`[${a}]`).forEach(el => out.add(`${a}=${el.getAttribute(a)}`));
  main.querySelectorAll("button[id], input[id], select[id], textarea[id]").forEach(el => out.add(`#${el.id}`));
  return out;
}

// ── 0. THE PAGE ─────────────────────────────────────────────────────────
console.log("\nTEST 0 - one page, grouped, saying that changes save");
fixture(); page();
ok("0a. \"Changes save as you make them.\"", /^Changes save as you make them\.$/.test(txt(main.querySelector(".settings-lede"))));
const groups = [...main.querySelectorAll(".settings-group__title")].map(txt);
ok("0b. the eight groups, in the spec's order", JSON.stringify(groups) === JSON.stringify(["You", "Goals and your week", "How the coach works", "Reminders", "Optional tracking", "Display", "Your plan and your data", "About"]), JSON.stringify(groups));
ok("0c. no tabs anywhere on it", !main.querySelector('[role="tablist"], [role="tab"]'));
const val = label => txt([...main.querySelectorAll(".settings-row")].find(r => txt(r.querySelector(".settings-row__label")) === label)?.querySelector(".settings-row__value"));
ok("0d. rows show their current value (Equipment: Gym 2 · Home 1; Sore or injured areas: 2 listed; Name: T)",
   val("Equipment") === "Gym 2 · Home 1" && val("Sore or injured areas") === "2 listed" && val("Name") === "T",
   `${val("Equipment")} | ${val("Sore or injured areas")} | ${val("Name")}`);

// ── 1. THE INVENTORY ────────────────────────────────────────────────────
console.log("\nTEST 1 - every v553 control is within two taps; the Save buttons are gone");
const SAVES = INV.filter(c => /^data-action=save-/.test(c.control));
ok("1pc. positive control: the fixture holds the v553 inventory, six Save buttons among it", INV.length > 90 && SAVES.length === 6, `${INV.length} controls, ${SAVES.length} saves`);
const reach = new Map();
for (const tier of ["personal", "free"]) {
  fixture({ tier }); page();
  controlsHere().forEach(c => reach.has(c) || reach.set(c, "page"));
  const screens = [...main.querySelectorAll("[data-open]")].map(b => b.dataset.open);
  for (const k of new Set(screens)) {
    openScreen(k);
    controlsHere().forEach(c => reach.has(c) || reach.set(c, `page › ${k}`));
    const r = main.querySelector('[data-action="toggle-reflection"]'); if (r) { click(r); controlsHere().forEach(c => reach.has(c) || reach.set(c, `page › ${k}`)); }
  }
}
// Controls changed on purpose, each named with its reason, and each
// checked for what replaced it -- never simply excused.
const RENAMED = {
  // The "Show your best" switch used its own action; it is now the same
  // in-place switch as every other (one handler, one Saved message).
  "data-action=toggle-pb": "data-toggle=showPersonalBests",
};
const RETIRED = {
  // Spec 8, decided 27 Sep: Tone up is no longer offered. 4a proves it
  // absent and 4d that anybody who already has it keeps it.
  "data-goal=tone-up": true,
  // P0, 29 Sep (Graeme): "Reduce pain" is not offered -- the app does not
  // offer to reduce pain. Retired like Tone up; saved goals still resolve.
  "data-goal=reduce-pain": true,
  // W3-8, 30 Sep: nothing reads hormonalTracking, so "Cycle-aware
  // coaching" was a claim the app could not back. verify-cycle-claim.
  "data-toggle=hormonalTracking": true,
  "#settings-hormonal": true,
};
const missing = INV.filter(c => !/^data-action=save-/.test(c.control))
  .filter(c => !RETIRED[c.control])
  .filter(c => !reach.has(RENAMED[c.control] || c.control))
  .map(c => `${c.control} (was ${c.where})`);
ok("1a. every control reachable in one or two taps", missing.length === 0, missing.join(", "));
const savesLeft = SAVES.filter(c => reach.has(c.control)).map(c => c.control);
ok("1b. the six Save buttons are gone", savesLeft.length === 0, savesLeft.join(", "));
fixture(); page();
const all = [];
for (const k of new Set([...main.querySelectorAll("[data-open]")].map(b => b.dataset.open))) {
  openScreen(k);
  all.push(...[...main.querySelectorAll("button")].filter(b => /^\s*Save\b/i.test(b.textContent)).map(b => `${k}: ${txt(b)}`));
  ok(`1c. ${k}: no third level (no row screens or tabs inside a row screen)`, !main.querySelector("[data-open], [role=tablist]"));
}
ok("1d. no button anywhere says Save", all.length === 0, all.join(", "));

// ── 2. SAVES AS YOU GO ──────────────────────────────────────────────────
console.log("\nTEST 2 - every control persists without a Save");
const fire = (el, type) => el?.dispatchEvent(new dom.window.Event(type, { bubbles: true }));
fixture(); openScreen("profile");
const nm = main.querySelector("#settings-name"); nm.value = "Graeme"; fire(nm, "input"); await wait(500);
ok("2a. a name typed is saved as it is typed (no blur needed)", store.get("name") === "Graeme");
ok("2b. and said, politely", main.querySelector("#settings-saved")?.getAttribute("role") === "status" && /Saved/.test(txt(main.querySelector("#settings-saved"))));
const age = main.querySelector("#settings-agebandsel"); age.value = age.options[2].value; fire(age, "change");
ok("2c. age range", store.get("ageBand") === age.options[2].value);
const w = main.querySelector("#settings-weight-now"); w.value = "80"; fire(w, "change");
ok("2d. weight, converted and stored in kilograms", store.get("weight") === 80);
openScreen("programme");
const chip = main.querySelector('[data-goal="get-stronger"]'); click(chip);
ok("2e. a goal chip saves on the tap", (store.get("goals") || []).includes("get-stronger"));
const lvl = main.querySelector("#settings-fitness-level"); lvl.value = lvl.options[lvl.options.length - 1].value; fire(lvl, "change");
ok("2f. activity level", store.get("fitnessLevel") === lvl.value);
openScreen("movement");
click(main.querySelector('[data-movement="gym"]'));
ok("2g. how you move saves on the tap", (store.get("movementIdentity") || []).includes("gym"));
openScreen("capability");
const cap = main.querySelector('[data-field="capability.chairRise"]'); cap.value = cap.options[1].value; fire(cap, "change");
ok("2h. what your body can do: answered, dated", store.get("capability.chairRise") === cap.value && !!store.get("capability.askedAt"));
cap.value = ""; fire(cap, "change");
ok("2i. and \"Not answered\" is stored as null, not \"\" (W3-A2)", store.get("capability.chairRise") === null);
page();
click(main.querySelector("#settings-lift-log"));
ok("2j. a switch on the page works in place", store.get("liftLogEnabled") === false && main.querySelector("#settings-lift-log")?.getAttribute("aria-checked") === "false");
const before = getDisplayPref("underline");
click(main.querySelector("#disp-underline"));
ok("2k. a display switch too", getDisplayPref("underline") !== before);
click(main.querySelector("#settings-checkin-notif"));
ok("2l. turning the reminder off hides its time and keeps focus on the switch", store.get("checkInNotification.enabled") === false &&
   !main.querySelector('[data-open="notify"]') && document.activeElement?.id === "settings-checkin-notif");

// ── 3. IT'S BETTER NOW ──────────────────────────────────────────────────
console.log("\nTEST 3 - It's better now, and It's back: the person's call");
fixture(); openScreen("conditions");
ok("3a. each condition says since when and its latest check-in mention", /Since 1 Sep/.test(txt(main)) && /Not mentioned at a check-in yet|Last mentioned/.test(txt(main)));
click(main.querySelector('[data-resolve="knee"]'));
ok("3b. It's better now: off the active list, kept with a date", !(store.get("conditions") || []).includes("knee") &&
   (store.get("conditionsResolved") || []).some(r => r.id === "knee" && r.resolvedAt));
ok("3c. shown under Better now, with It's back, and focus on it", /Better now/.test(txt(main)) && document.activeElement?.dataset.reopen === "knee");
click(main.querySelector('[data-reopen="knee"]'));
ok("3d. It's back: as it was", (store.get("conditions") || []).includes("knee") && !(store.get("conditionsResolved") || []).length &&
   store.get("conditionMeta").knee.addedAt === "2026-09-01");

// ── 4. GOALS ────────────────────────────────────────────────────────────
console.log("\nTEST 4 - no Tone up; Lose weight only with weight tracking");
fixture(); store.set("weightTracking", false); openScreen("programme");
ok("4a. Tone up is not offered", !main.querySelector('[data-goal="tone-up"]'));
ok("4b. Lose weight is not offered without weight tracking", !main.querySelector('[data-goal="lose-weight"]'));
store.set("weightTracking", true); openScreen("programme");
ok("4c. REVERSAL: with weight tracking on, it is", !!main.querySelector('[data-goal="lose-weight"]'));
store.set("weightTracking", false); store.set("goals", ["tone-up"]); openScreen("programme");
ok("4d. a goal already chosen stays, selected, so it can be taken off", main.querySelector('[data-goal="tone-up"]')?.getAttribute("aria-checked") === "true");

// ── 5. DOWNLOAD YOUR DATA ───────────────────────────────────────────────
console.log("\nTEST 5 - Download your data");
fixture(); page();
const row = main.querySelector('[data-action="download-data"]');
ok("5a. on the page, saying what the file holds", !!row && /your journal included/.test(txt(row)) && /Saved on this device/.test(txt(row)));
lastBlob = null; click(row); await wait(50);
const file = lastBlob ? JSON.parse(await lastBlob.text()) : null;
ok("5b. a file is made on the device", !!file && !!file.exportedAt);
ok("5c. with everything the app keeps, the journal included", file?.store?.name === "T" && file?.store?.journalEntries?.[0]?.text === "a private line");
ok("5d. and it says so, politely", /downloading\. It is saved on this device only\./.test(txt(main.querySelector("#settings-saved"))));

{
  const priv = await import(B + "views/privacy.js");
  const t = priv.render().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  ok("5e. the privacy page says how: Download your data, journal included, made and kept on the device",
     /Download your data/.test(t) && /journal included/.test(t) && /saved there; nothing is sent anywhere/.test(t), t.slice(t.indexOf("Your rights"), t.indexOf("Your rights") + 300));
}

// ── 6. TWO LEVELS, BOTH WAYS ────────────────────────────────────────────
console.log("\nTEST 6 - back from a screen lands on the row you came from");
fixture(); page(); click(main.querySelector('[data-open="equipment"]'));
ok("6a. the screen's heading has focus", document.activeElement?.classList.contains("settings-title"));
click(main.querySelector("#settings-back-btn"));
ok("6b. back on the page, on Equipment", document.activeElement?.dataset.open === "equipment");

console.log("");
if (fails) { console.log(`SETTINGS-INVENTORY: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`SETTINGS-INVENTORY: all ${passes} assertions pass\n`);
process.exit(0);
