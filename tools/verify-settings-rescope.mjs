/**
 * tools/verify-settings-rescope.mjs
 * 02 Oct 2026 v1
 *
 * W4-23 SETTINGS-RESCOPE. Graeme, 02 Oct: "It's confusing having everything
 * in one long page." Sections approved: You · Your body · Sessions (and
 * reminders, once there are any) · Display · Your data · Messages · Your
 * plan · About. Each one tap from the index, one level deep.
 *
 *   1. Settings opens on an index of the sections, in that order, all
 *      closed: nothing else on the page until a section is opened.
 *   2. One tap opens a section, where it is.
 *   3. Everything the one page held is in a section (the inventory below
 *      was read from the one page, v633, before this change).
 *   4. No section holds another index; no tabs.
 *   5. A row's screen has one h1; Back names the section, returns to the
 *      index with that section open and focus on the row.
 *   6. Messages is one tap; the Settings tab keeps its name.
 */
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
import { oneScreen } from "./one-screen.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM(`<!doctype html><body><nav><button data-nav="settings" aria-label="Settings"></button></nav></body>`, { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.fetch = dom.window.fetch = async () => ({ ok: false, text: async () => "", json: async () => ({}) });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { SettingsView } = await import(B + "views/settings.js");
const M = await import(B + "data/messages.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

// Read from the one page (v633) before the change: every control it held.
const INVENTORY = ["open:messages","open:profile","open:movement","open:conditions","open:equipment","open:capability","go:arc-setup","open:programme","action:open-weekly-plan","open:preferences","toggle:liftLogEnabled","toggle:showPersonalBests","open:notes","toggle:weightTracking","open:weight","open:display","disp:underline","disp:focus","disp:fullInstructions","disp:reduceMotion","disp:vibration","open:about-plan","action:nav-impact","action:nav-activity-log","action:download-data","action:restore-data","action:delete-health","open:about-data","action:nav-privacy","action:reset-data","open:about-story","open:about-app"];
const SECTIONS = ["You", "Your body", "Sessions", "Display", "Your data", "Messages", "Your plan", "About"];
const keyOf = b => b.dataset.open ? `open:${b.dataset.open}` : b.dataset.action ? `action:${b.dataset.action}` : b.dataset.go ? `go:${b.dataset.go}` : b.dataset.toggle ? `toggle:${b.dataset.toggle}` : `disp:${b.dataset.dispToggle}`;

function person() { localStorage.clear(); store.init(); agreed(store); store.set("onboardingComplete", true); store.set("name", "Jan"); store.set("tier", "personal"); store.set("weightTracking", true); }
const mount = async () => { const el = oneScreen(document.createElement("div")); SettingsView({ navigate() {}, back() {} }).mount(el); await wait(10); return el; };

// ── 1. THE INDEX ────────────────────────────────────────────────────────
console.log("\nTEST 1 - Settings opens on the sections, closed");
person();
let el = await mount();
ok("1pc. Settings", txt(el.querySelector("h1")) === "Settings");
const titles = [...el.querySelectorAll("[data-section]")].map(s => txt(s.querySelector(".settings-sec__title")));
ok("1a. the approved sections, in order", JSON.stringify(titles) === JSON.stringify(SECTIONS), JSON.stringify(titles));
ok("1b. all closed: nothing else on the page", !el.querySelector("details[data-section][open]") && [...el.querySelectorAll(".settings-row")].every(r => r.closest("details:not([open])") || r.matches("[data-section]")),
   `${el.querySelectorAll("details[data-section][open]").length} open`);

// ── 2. ONE TAP ──────────────────────────────────────────────────────────
console.log("\nTEST 2 - one tap opens a section");
const body = el.querySelector('[data-section="body"]');
click(body?.querySelector("summary")); await wait(5);
ok("2a. Your body opens where it is", !!body && body.open === true);
ok("2b. and shows its rows", !!body?.querySelector('[data-open="conditions"]') && !!body?.querySelector('[data-open="capability"]'));

// ── 3. EVERYTHING HAS A PLACE ───────────────────────────────────────────
console.log("\nTEST 3 - everything the one page held is in a section");
person(); el = await mount();
const found = new Map();
for (const s of el.querySelectorAll("[data-section]"))
  for (const b of [s, ...s.querySelectorAll("*")].filter(n => n.matches("[data-open],[data-action],[data-go],[data-toggle],[data-disp-toggle]"))) found.set(keyOf(b), s.dataset.section);
const gone = INVENTORY.filter(k => !found.has(k) && !(k === "go:arc-setup" && found.has("go:stretch-arc")));
ok("3a. every control is in a section", gone.length === 0, gone.join(", "));
ok("3b. nothing left outside the sections", [...el.querySelectorAll(".settings-row, [role=switch]")].every(r => r.closest("[data-section]")), "");

// ── 4. NOTHING NESTED ───────────────────────────────────────────────────
console.log("\nTEST 4 - one level");
ok("4a. no section inside a section", ![...el.querySelectorAll("[data-section]")].some(s => s.querySelector("[data-section]")));
ok("4b. no tabs", !el.querySelector('[role="tablist"], [role="tab"]'));

// ── 5. A ROW'S SCREEN ───────────────────────────────────────────────────
console.log("\nTEST 5 - a row's screen, and back");
click(el.querySelector('[data-section="body"] summary')); await wait(5);
click(el.querySelector('[data-open="conditions"]')); await wait(10);
ok("5a. one h1, the row's", el.querySelectorAll("h1").length === 1 && /Sore or injured areas/.test(txt(el.querySelector("h1"))));
const back = el.querySelector("#settings-back-btn");
ok("5b. Back names the section", /Your body/.test(txt(back)) || /Your body/.test(back?.getAttribute("aria-label") || ""), txt(back));
click(back); await wait(10);
ok("5c. back on the index, that section open", txt(el.querySelector("h1")) === "Settings" && el.querySelector('[data-section="body"]')?.open === true);
ok("5d. focus on the row it came from", document.activeElement?.dataset?.open === "conditions", document.activeElement?.outerHTML?.slice(0, 80));

// A screen the app opened itself (What your body can do, asked again
// after Delete my health answers) goes back to its section too.
const HC = await import(B + "data/health-consent.js");
person(); store.set("capability.clearedAt", new Date().toISOString());
HC.guardRoute("coach-proposal");
el = await mount();
ok("5e0. the app opened What your body can do itself", /What your body can do/.test(txt(el.querySelector("h1"))));
click(el.querySelector("#settings-back-btn")); await wait(10);
ok("5e. its Back opens Your body, on that row", el.querySelector('[data-section="body"]')?.open === true && document.activeElement?.dataset?.open === "capability",
   document.activeElement?.outerHTML?.slice(0, 80));

// ── 6. MESSAGES, AND THE TAB ────────────────────────────────────────────
console.log("\nTEST 6 - Messages is one tap; the tab keeps its name");
click(el.querySelector('[data-section="messages"]')); await wait(10);
ok("6a. one tap to Messages", txt(el.querySelector("h1")) === "Messages");
M.updateNavDot();
ok("6b. the Settings tab is still called Settings", document.querySelector('[data-nav="settings"]').getAttribute("aria-label") === "Settings");

console.log(`\nSETTINGS-RESCOPE: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
