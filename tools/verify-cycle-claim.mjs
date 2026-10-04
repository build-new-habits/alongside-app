/**
 * tools/verify-cycle-claim.mjs
 * 04 Oct 2026 v2
 *
 * v2 - LOOK-1: Settings is now an index; its rows live on section pages.
 *      "The page" in 1pc/1a is now the index plus every section page
 *      (each opened in turn), so 1a still reads every row Settings shows;
 *      1pc's /Your profile|Name/ is looked for in that text (Name is on
 *      the You page now, not the index). 1b opens Your profile through
 *      settingsFind. Same regexes; no assertion was loosened.
 *
 * W3-8 CYCLE-CLAIM (Wave 3, persona 2.4). Settings offered "Cycle-aware
 * coaching -- Adapts sessions to your hormonal cycle", and in Your
 * profile a second switch for the same field. Nothing in js/ reads
 * hormonalTracking except the store default and Settings: a promise with
 * nothing behind it. The switches are removed; the stored field stays
 * (no field change) for when something reads it.
 *
 *   1. Settings, the page and Your profile, on both tiers: no cycle-aware
 *      switch and no claim to adapt to a cycle.
 *   2. The rule this keeps: if Settings ever shows it again, something
 *      outside Settings and the store must read the field.
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
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
dom.window.confirm = () => false;
globalThis.confirm = () => false;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.URL.createObjectURL = () => "blob:x";
globalThis.URL.revokeObjectURL = () => {};
globalThis.CSS = { escape: s => String(s) };
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { SettingsView } = await import(B + "views/settings.js");
const { settingsFind, settingsSection, settingsIndex } = await import("./settings-open.mjs");
let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const wait = ms => new Promise(r => setTimeout(r, ms));

const rtr = { navigate() {}, back() {}, history: [] };
globalThis.window.router = rtr;
const CLAIM = /cycle-aware|hormonal cycle/i;

console.log("\nTEST 1 - no cycle-aware switch on Settings");
let shown = false;
for (const tier of ["free", "personal"]) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "T");
  main.innerHTML = ""; SettingsView(rtr).mount(main); await wait(20);
  // LOOK-1: the index and every section page, as one reads them in turn.
  let page = txt(main);
  for (const sec of ["you", "body", "sessions", "display", "data", "plan", "about"]) {
    settingsSection(main, sec); await wait(5); page += " " + txt(main);
  }
  settingsIndex(main); await wait(5);
  ok(`1pc. ${tier}: Settings is showing`, /Your profile|Name/.test(page), page.slice(0, 120));
  ok(`1a. ${tier}: the page makes no cycle claim`, !CLAIM.test(page), (page.match(/.{20}cycle.{30}/i) || [""])[0]);
  shown = shown || CLAIM.test(page);
  settingsFind(main, '[data-open="profile"]')?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(20);
  const prof = txt(main);
  ok(`1b. ${tier}: Your profile opened, and makes no cycle claim`, /Your profile/.test(prof) && !CLAIM.test(prof), (prof.match(/.{20}cycle.{30}/i) || [prof.slice(0, 80)])[0]);
  shown = shown || CLAIM.test(prof);
}

console.log("\nTEST 2 - shown only with a reader");
const readers = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = dir + "/" + f.name;
    if (f.isDirectory()) walk(p);
    else if (p.endsWith(".js") && !/\/store\.js$|\/views\/settings\.js$/.test(p) && /hormonalTracking/.test(fs.readFileSync(p, "utf8"))) readers.push(p);
  }
})(new URL("../js", import.meta.url).pathname);
ok("2a. Settings shows the switch only if something reads the field", !shown || readers.length > 0, `shown ${shown}, readers ${readers.join(", ") || "none"}`);

console.log("");
if (fails) { console.log(`CYCLE-CLAIM: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`CYCLE-CLAIM: all ${passes} assertions pass\n`);
process.exit(0);
