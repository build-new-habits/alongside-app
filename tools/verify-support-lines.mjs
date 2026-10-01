/**
 * tools/verify-support-lines.mjs
 * 01 Oct 2026 v1
 *
 * SIGNPOST-STATIC. Free support is always one look away, without anything
 * reading what anybody wrote or chose.
 *
 * Found preparing 12g (facts sheet, 30 Sep): no crisis or mental-health
 * signposting anywhere in the app. The feeling-word pathway the
 * safeguarding policy v7 described was retired (FEELINGS-RETIRE), and
 * nothing replaced it: "Struggling" at check-in suggested breathing, and
 * the journal had no way out. A static list -- the same for everybody,
 * triggered by nothing -- is what the safeguarding policy v8 describes.
 *
 *   1. Wellbeing always shows "If you need to talk to someone": Samaritans
 *      116 123, Shout 85258, NHS 111, 999 -- as links that work -- with
 *      or without a check-in, and whatever was answered.
 *   2. The journal screen shows the same, where somebody is writing.
 *   3. Static: the list is the same whatever the check-in said, and the
 *      module reads nothing from the store.
 */
import fs from "node:fs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();

function hasLines(root) {
  const box = root.querySelector("[data-support-lines]");
  return !!box && !!box.querySelector('a[href="tel:116123"]') && !!box.querySelector('a[href^="sms:85258"]') &&
    !!box.querySelector('a[href="tel:111"]') && !!box.querySelector('a[href="tel:999"]') &&
    /Samaritans/.test(txt(box)) && /Shout/.test(txt(box)) && /NHS 111/.test(txt(box));
}
const today = new Date().toISOString().slice(0, 10);
function fixture(checkin) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "free");
  if (checkin) { store.set("lastCheckin", { ...checkin, timestamp: new Date().toISOString() }); store.set("checkinHistory", { [today]: checkin }); }
}

// ── 1. WELLBEING ────────────────────────────────────────────────────────
console.log("\nTEST 1 - Wellbeing always shows the support lines");
let n = 0;
for (const [label, ci] of [["no check-in", null], ["a good day", { energy: 7, mood: 9 }], ["struggling", { energy: 2, mood: 2 }]]) {
  fixture(ci);
  const nm = await import(B + `views/noticing.js?s=${++n}`);
  main.innerHTML = nm.render();
  ok(`1. ${label}: Samaritans 116 123, Shout 85258, NHS 111, 999`, hasLines(main), txt(main.querySelector("[data-support-lines]")));
}
fixture(null);
const nm = await import(B + "views/noticing.js?s=9");
main.innerHTML = nm.render();
const box = main.querySelector("[data-support-lines]");
ok("1d. headed so it can be found by heading", /talk to someone/i.test(txt(box?.querySelector("h2, h3"))));

// ── 2. THE JOURNAL ──────────────────────────────────────────────────────
console.log("\nTEST 2 - the journal shows them where somebody is writing");
fixture(null);
const je = await import(B + "views/journal-entry.js");
const JV = je.JournalEntryView || Object.values(je).find(v => typeof v === "function" && /View/.test(v.name));
main.innerHTML = ""; try { JV({ navigate() {}, back() {} }).mount(main); } catch (e) { console.log("        mount", e.message); }
ok("2pc. positive control: the journal is up", !!main.querySelector("#je-text"));
ok("2a. the support lines are on it", hasLines(main));

// ── 3. STATIC ───────────────────────────────────────────────────────────
console.log("\nTEST 3 - nothing decides whether they show");
const src = fs.readFileSync(new URL("../js/data/support-lines.js", import.meta.url), "utf8");
ok("3a. the module reads nothing from the store", !/store\.|import\s*\{[^}]*store/.test(src.replace(/\/\*[\s\S]*?\*\//g, "")));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
