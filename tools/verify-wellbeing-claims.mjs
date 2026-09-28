/**
 * tools/verify-wellbeing-claims.mjs
 * 28 Sep 2026 v1
 *
 * SMOOTH-P0 C1 and C4. Wellbeing says what to do, plainly.
 *
 * Found 27 Sep: breathing copy named a real person and an institution
 * ("Dr Andrew Weil's technique", "Researched at Stanford", a named
 * neuroscientist) and made body claims the app cannot stand behind --
 * parasympathetic system, CO2 levels, HRV, vagus nerve, "drop your heart
 * rate measurably", "the fastest known way to reduce stress". The same
 * claims sat in two files. Same class as WEB-CLAIMS.
 *
 * And the weekly card was labelled with its internal theme name,
 * "Personal Capacity".
 *
 * Reads the SHIPPED text of every Wellbeing file -- comments stripped,
 * because a comment explaining why a claim was removed must be allowed to
 * name it -- and renders the hub to check the label a person sees.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const fs = __require("node:fs");
const { JSDOM } = __require("jsdom");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const root = new URL("../", import.meta.url);
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

const FILES = ["js/views/breathing-session.js", "js/views/quiet-session.js", "js/views/noticing.js",
               "js/views/journal-entry.js", "js/views/in-step.js", "js/views/practices.js",
               "js/data/practice-library.js", "js/data/in-step-scenarios.js"];
const BANNED = /nervous system|vagus|parasympathetic|\bHRV\b|heart rate variability|\bCO2\b|cortisol|researched|proven|studies show|scientifically|Stanford|Harvard|Huberman|Weil|Plumbly|\bDr\.? [A-Z][a-z]+|military|fastest known|measurabl/i;

console.log("\nTEST 0 - the scan reaches real files and would catch a claim");
const present = FILES.filter(f => fs.existsSync(new URL(f, root)));
ok("0a. every Wellbeing file named here exists", present.length === FILES.length,
   `missing: ${FILES.filter(f => !present.includes(f)).join(", ")}`);
ok("0b. REVERSAL: the pattern catches the removed wording",
   BANNED.test(`description: "Dr Andrew Weil's technique"`) && BANNED.test("resets CO2 levels") &&
   BANNED.test("improving HRV") && !BANNED.test("Four seconds in, six seconds out."));
ok("0c. comments are stripped, so a note explaining a removal is allowed",
   !BANNED.test(strip("/* removed: Dr Andrew Weil */ const a = 1; // HRV claim gone")));

console.log("\nTEST 1 - no shipped Wellbeing text makes a body claim or cites an authority");
for (const f of present) {
  const lines = strip(fs.readFileSync(new URL(f, root), "utf8")).split("\n");
  const hits = lines.map((l, i) => [i + 1, l]).filter(([, l]) => BANNED.test(l));
  ok(`1. ${f}`, hits.length === 0, hits.slice(0, 3).map(([n, l]) => `line ${n}: ${l.trim().slice(0, 110)}`).join("\n        "));
}

console.log("\nTEST 2 - the weekly card shows a plain label, not the internal theme");
const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, "localStorage", { value: dom.window.localStorage, configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
store.init(); store.set("name", "Test"); store.set("onboardingComplete", true);
const mod = await import(B + "views/noticing.js");
const app = document.getElementById("app");
let html = "";
try {
  const V = Object.values(mod).find(v => typeof v === "function" && /View$/.test(v.name));
  if (V) { V({ navigate() {} }).mount(app); html = app.textContent; }
  else if (typeof mod.render === "function") { html = mod.render(); }
} catch (e) { html = "ERROR " + e.message; }
ok("2a. the hub rendered", html.length > 50 && !/^ERROR/.test(html), html.slice(0, 120));
ok("2b. it says \"This week's question\"", /This week's question/.test(html));
const themes = [...fs.readFileSync(new URL("js/views/noticing.js", root), "utf8").matchAll(/theme:\s*"([^"]+)"/g)].map(m => m[1]);
ok("2c. no internal theme name is shown as a label", themes.length > 0 && !themes.some(t => html.includes(t)),
   `shown: ${themes.filter(t => html.includes(t)).join(", ")}`);

console.log("");
if (fails) { console.log(`WELLBEING-CLAIMS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`WELLBEING-CLAIMS: all ${passes} assertions pass\n`);
