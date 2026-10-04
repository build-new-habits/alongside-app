/**
 * tools/verify-a11y-w4.mjs
 * 04 Oct 2026 v3
 *
 * v3 - D-5. The Library category heading's emoji became a kind tile with a
 *      line icon; 6a now finds that tile (its icon aria-hidden) instead of
 *      the emoji span. What it proves, no icon in the heading's spoken
 *      name, is unchanged.
 *
 * v2 - LOOK-1: Settings is an index of section pages, so the switches are
 *      no longer all on one page. Test 1 now opens each section page in
 *      turn (settingsSection) and collects and presses the switches there;
 *      1pc still needs at least six across Settings and 1a is unchanged.
 *      The Messages row is still on the index. No assertion was loosened.
 *
 * W4-18 A11Y-W4 (Wave 4 persona trace: 2.4, 2.11, 2.12, 2.13, 2.14, U18).
 *
 *   1. Settings switches: the name is the visible label and never changes;
 *      the state is aria-checked. It was rewritten with
 *      replace('on','off'): "Session notes on" became "Sessioff notes on",
 *      "Stronger focus outlines" became "Stroffger…", and four switches
 *      read as on when off.
 *   2. News: "Saved" is said after the screen is redrawn (it was written
 *      into the old screen and lost).
 *   3. Upgrade: the button's name contains its visible words, "I'm ready"
 *      (WCAG 2.5.3; it was named "Start the Plan").
 *   4. The router does not take focus from a view's own heading on the age
 *      question, the policy screen, the health consent and the under-18
 *      screen.
 *   5. The journal box is named by its visible label (an aria-label
 *      replaced it).
 *   6. Mindful practice: no emoji in the heading's spoken name.
 *   7. Breathing: under Reduce motion the circle does not grow and shrink.
 */
import { createRequire as __cr } from "node:module";
import { readFileSync } from "node:fs";
import { agreed } from "./agreed.mjs";
import { oneScreen } from "./one-screen.mjs";
import { settingsSection } from "./settings-open.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM(`<!doctype html><body><div id="app"><main id="main-content"></main></div>
  <nav id="bottom-nav"></nav><button id="hidden-nav-home-btn" class="hidden"></button></body>`, { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
let reduce = false;
dom.window.matchMedia = q => ({ matches: /reduce/.test(q) ? reduce : false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.fetch = dom.window.fetch = async () => ({ ok: false, text: async () => "", json: async () => ({}) });

const ROOT = new URL("../", import.meta.url);
const B = new URL("js/", ROOT).href;
const { store } = await import(B + "store.js");
const { SettingsView } = await import(B + "views/settings.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
function person() { localStorage.clear(); store.init(); agreed(store); store.set("onboardingComplete", true); store.set("name", "Ann"); store.set("tier", "personal"); }
const settings = async () => { const el = oneScreen(document.createElement("div")); SettingsView({ navigate() {}, back() {} }).mount(el); await wait(10); return el; };

// ── 1. SWITCH NAMES ─────────────────────────────────────────────────────
console.log("\nTEST 1 - Settings switches keep their name");
person();
let el = await settings();
// LOOK-1: each section page holds its own switches; open each in turn.
const SECTIONS = ["you", "body", "sessions", "display", "data", "plan", "about"];
const ids = [];
const where = {};
for (const sec of SECTIONS) {
  settingsSection(el, sec); await wait(5);
  for (const b of el.querySelectorAll('[role="switch"]')) if (b.id && !ids.includes(b.id)) { ids.push(b.id); where[b.id] = sec; }
}
ok("1pc. the switches are there", ids.length >= 6, ids.join(", "));
const bad = [];
for (const id of ids) {
  if (!el.querySelector(`#${id}`)) { settingsSection(el, where[id]); await wait(5); }
  const b0 = el.querySelector(`#${id}`);
  const label = txt(el.querySelector(`label[for="${id}"] .settings-row__label`)) || txt(el.querySelector(`label[for="${id}"]`));
  for (let i = 0; i < 2; i++) {
    const b = el.querySelector(`#${id}`); if (!b) break;
    click(b); await wait(5);
    const now = el.querySelector(`#${id}`);
    const name = now.getAttribute("aria-label") || txt(el.querySelector(`label[for="${id}"]`));
    if (/Sessioff|Stroffger|\bon\b|\boff\b/.test(name.replace(label, "")) || !name.includes(label))
      bad.push(`${id}: "${name}" (label "${label}", checked ${now.getAttribute("aria-checked")})`);
  }
  void b0;
}
ok("1a. each name is the visible label, unchanged by pressing it twice", bad.length === 0, bad.join(" | "));

// ── 2. NEWS ─────────────────────────────────────────────────────────────
console.log("\nTEST 2 - News says Saved after the redraw");
person();
el = await settings();
click(el.querySelector('[data-open="messages"]')); await wait(10);
click(el.querySelector("#settings-news")); await wait(60);
ok("2a. the live region in the page now holds Saved", /Saved/.test(txt(el.querySelector("#settings-saved"))), txt(el.querySelector("#settings-saved")));

// ── 3. UPGRADE ──────────────────────────────────────────────────────────
console.log("\nTEST 3 - the upgrade button's name");
const U = await import(B + "views/upgrade.js");
person(); store.set("tier", "free");   // the button is offered to somebody not on the Plan
const up = document.createElement("div"); up.innerHTML = U.render();
const cta = up.querySelector("#upgrade-cta");
const ctaName = cta?.getAttribute("aria-label") || txt(cta);
ok("3pc. the button is on the page", !!cta);
ok("3a. its name contains I'm ready", /I.m ready/.test(ctaName) && /I.m ready/.test(txt(cta)), ctaName);

// ── 4. HEADING FOCUS ────────────────────────────────────────────────────
console.log("\nTEST 4 - the router leaves a view's heading focus alone");
const { router } = await import(B + "router.js");
person();
store.set("consent.policyVersion", "2026-01-01");
for (const [view, prep] of [["age-check", () => {}], ["consent-update", () => {}], ["health-consent", () => {}], ["under-18", () => {}]]) {
  prep();
  await router._mountView(view); await wait(30);
  const a = document.activeElement;
  ok(`4. ${view}: focus is on its heading`, !!a && /^H[12]$/.test(a.tagName), `${a?.tagName} ${a?.id}`);
}

// ── 5. JOURNAL BOX ──────────────────────────────────────────────────────
console.log("\nTEST 5 - the journal box is named by its visible label");
person();
const { JournalEntryView } = await import(B + "views/journal-entry.js");
const j = oneScreen(document.createElement("div")); JournalEntryView({ navigate() {}, back() {} }).mount(j); await wait(10);
const ta = j.querySelector("#je-text");
ok("5pc. the box and its label", !!ta && !!j.querySelector('label[for="je-text"]'));
ok("5a. no aria-label replacing the visible label", !!ta && !ta.hasAttribute("aria-label"), ta?.getAttribute("aria-label"));

// ── 6. MINDFUL PRACTICE HEADING ─────────────────────────────────────────
console.log("\nTEST 6 - no emoji in a heading's spoken name");
const lib = readFileSync(new URL("js/views/library.js", ROOT), "utf8");
// D-5: the heading's emoji became a kind tile whose line icon is aria-hidden
// (data/line-icons.js); the property, no icon in the spoken name, is the same.
ok("6a. the category heading keeps its icon out of the name", !/<h1[^>]*>\$\{cat\.icon\}/.test(lib) && !/<h1[^>]*>[^<]*\$\{cat\.icon\}/.test(lib) &&
   /<h1 class="library-sub-title"><span class="kind-tile k-\$\{catKind\}">\$\{lineIcon\(catIcon\)\}<\/span> \$\{cat\.label\}<\/h1>/.test(lib) &&
   /aria-hidden="true"/.test(readFileSync(new URL("js/data/line-icons.js", ROOT), "utf8")));

// ── 7. BREATHING UNDER REDUCE MOTION ────────────────────────────────────
console.log("\nTEST 7 - the breathing circle under Reduce motion");
const BS = await import(B + "views/breathing-session.js");
const c = document.createElement("div"); c.id = "bs-breath-circle"; document.body.appendChild(c);
reduce = false; BS.updateBreathCircle?.("Breathe in", 4);
ok("7pc. without it: the circle grows on the in-breath", /scale\(1\.35\)/.test(c.style.transform), c.style.transform);
c.style.transform = ""; c.style.transition = "";
reduce = true; BS.updateBreathCircle?.("Breathe in", 4);
ok("7a. with it: the circle stays still", !/scale\(1\.35\)/.test(c.style.transform) && !/transform \d/.test(c.style.transition), `${c.style.transform} | ${c.style.transition}`);
reduce = false;

console.log(`\nA11Y-W4: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
