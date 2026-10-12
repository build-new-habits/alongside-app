/**
 * tools/verify-one-name.mjs
 * 12 Oct 2026 v1
 *
 * A-9 ONE-NAME (Stage AWARD). One name for each thing; docs/glossary.md
 * lists them. Measured on v656 with tools/chromium-words.mjs (every screen,
 * both tiers): the only live clash was the plan screen's Something
 * different today, which called Make it up as I go "I'll just log what I
 * do", a third name for one screen.
 *
 * TEST 1 drives the real plan screen. TEST 2 scans every string in js/
 * for the retired names in the glossary's Not column. TEST 3 holds the
 * glossary itself (version header, the Use/Not table).
 */
import { createRequire as __cr } from "node:module";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};

const ROOT = new URL("../", import.meta.url).pathname;
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const gate = await import(B + "safety-gate.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();

console.log("\nTEST 1 - the plan screen calls Make it up as I go by its name");
localStorage.clear(); store.init(); gate.endGateSession(); agreed(store);
store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", "personal");
store.set("homeEquipment", ["band-light"]); store.set("sessionLocation", "home");
for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
gate.endGateSession();
store.set("checkinHistory", { [new Date().toISOString().split("T")[0]]: { energy: 6, mood: 6, date: new Date().toDateString() } });
const main = document.getElementById("main-content");
CoachProposalView({ navigate() {}, back() {} }).mount(main);
const log = main.querySelector('[data-different="log"]');
ok("1pc. Something different today offers the logging door", !!log);
ok("1a. it is named Make it up as I go", txt(log) === "Make it up as I go", txt(log));

console.log("\nTEST 2 - no retired name in any string in js/");
// The glossary's Not column, as they would appear on screen.
const RETIRED = [
  // The apostrophe may be written as ’ in the source.
  /I(?:[’']|\\u2019)ll just log what I do/,
  /\bQuick build\b/, /\bOne to one\b/, /\bPersonal training\b/, /\bConditions Update\b/,
  // "Personal Capacity" is left to verify-name1 (C4): it is a noticing theme's
  // internal label there, allowed by that gate.
];
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith(".js")) files.push(p); } })(join(ROOT, "js"));
const hits = [];
for (const f of files) {
  const lines = readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    const code = line.replace(/^\s*(\*|\/\/).*$/, "").replace(/\/\/.*$/, "");
    // Only text inside a string or template (where a screen gets its words).
    for (const m of code.matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/g))
      for (const re of RETIRED) if (re.test(m[2])) hits.push(`${f.slice(ROOT.length)}:${i + 1} ${m[2].slice(0, 60)}`);
  });
}
ok("2pc. the scan reads the app's code", files.length > 100, `${files.length} files`);
ok("2a. none of the retired names", hits.length === 0, hits.slice(0, 6).join(" · "));

console.log("\nTEST 3 - the glossary");
const gp = join(ROOT, "docs/glossary.md");
const g = existsSync(gp) ? readFileSync(gp, "utf8") : "";
ok("3a. docs/glossary.md exists with a dated version header", /^## \d{2} [A-Z][a-z]{2} \d{4} v\d+$/m.test(g));
ok("3b. it has the Use / Not table and names the plan screen's fix", /\| Thing \| Use \| Not \|/.test(g) && /I'll just log what I do/.test(g));

console.log(`\nVERIFY-ONE-NAME: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
