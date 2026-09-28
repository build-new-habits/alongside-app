/**
 * tools/verify-home-fold.mjs
 * 28 Sep 2026 v1
 *
 * F3 GUIDANCE-FOLD and F4 HATCH-GUTTER, from the finish list.
 *
 * F3. On the one day a month the general-guidance line shows, Plan Home
 * measured 912px at 390 x 844, and the last link sat under the nav: the
 * guidance line and a first-days orientation line both spoke. Now the
 * guidance line is the note that day; orientation resumes the next.
 * Measured after, in Chromium at 390 x 844: the last link's bottom edge
 * 745px, the nav's top 772px.
 *   Found on the way: the orientation lines on PLAN Home named
 *   "Cardio, Core & Strength" and "Mobility & Conditioning" -- free
 *   tiles, not on Plan Home since SMOOTH-P3a. A coach line that names a
 *   door must name one on the screen.
 *
 * F4. The finding said --escape-hatch-gutter was "defined nowhere". It
 * was wrong: index.html declares it in :root (68px, derived from the
 * hatch's own size; verify-hatchoverlap 2a-2c). What WAS wrong: two
 * stylesheets carried a 64px fallback that disagreed with it. Removed,
 * and this gate holds every use to the one declaration.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });

const R = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { TodayView } = await import(B + "views/today.js");
const { GUIDANCE_TEXT } = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();

function home({ tier = "personal", goals = [], guidanceShownAt = null } = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "T");
  store.set("goals", goals); store.set("guidanceShownAt", guidanceShownAt);
  const c = document.createElement("div"); document.body.innerHTML = ""; document.body.appendChild(c);
  TodayView({ navigate() {}, back() {}, history: ["x"] }).mount(c);
  return c;
}
const ORIENT = /the door for|where the gentler movement lives|I know what I want’ (is where|has the gentler)|Tell me what to do’ (lets me|is a good)/;

// ── F3 ──────────────────────────────────────────────────────────────────
console.log("\nF3 - on the guidance day the guidance line is the note");
let c = home({ goals: ["get-stronger"] });
ok("F3.0 fixture reach: the guidance line is on Plan Home", txt(c.querySelector(".today-guidance")) === GUIDANCE_TEXT.replace(/\s+/g, " ").trim());
ok("F3.1 and no orientation line beside it", !ORIENT.test(txt(c)), txt(c.querySelector(".today-header")));
const month = new Date(Date.now() - 2 * 864e5).toISOString();
c = home({ goals: ["get-stronger"], guidanceShownAt: month });
ok("F3.2 REVERSAL: any other day, the orientation line is back", ORIENT.test(txt(c)) && !c.querySelector(".today-guidance"), txt(c.querySelector(".today-header")));

console.log("\nF3b - a coach line on Plan Home names only doors that are on it");
for (const goals of [["get-stronger"], ["flexibility"], []]) {
  c = home({ goals, guidanceShownAt: month });
  const head = txt(c.querySelector(".today-header"));
  const doors = [...c.querySelectorAll(".home-door__title")].map(txt);
  const named = [...head.matchAll(/(Cardio, Core & Strength|Mobility & Conditioning|‘([^’]+)’)/g)].map(m => m[2] || m[1]);
  ok(`F3b ${JSON.stringify(goals)}: "${head.slice(0, 70)}"`, named.every(n => doors.includes(n)), `names ${named.join(", ")}; doors ${doors.join(", ")}`);
}
c = home({ tier: "free", goals: ["get-stronger"], guidanceShownAt: month });
ok("F3c free Home still names its own tile", /Cardio, Core & Strength/.test(txt(c)));

// ── F4 ──────────────────────────────────────────────────────────────────
console.log("\nF4 - every use of the hatch gutter resolves to the one declaration");
const html = fs.readFileSync(new URL("index.html", R), "utf8");
ok("F4.1 declared once, in :root", (html.match(/--escape-hatch-gutter:/g) || []).length === 1 && /:root\s*\{[^}]*--escape-hatch-gutter:/.test(html));
const cssFiles = [];
const walk = rel => fs.readdirSync(new URL(rel, R), { withFileTypes: true }).forEach(d =>
  d.isDirectory() ? walk(rel + d.name + "/") : d.name.endsWith(".css") && cssFiles.push(rel + d.name));
walk("css/");
const uses = cssFiles.flatMap(f => [...fs.readFileSync(new URL(f, R), "utf8").matchAll(/var\(--escape-hatch-gutter([^)]*)\)/g)].map(m => ({ f, fb: m[1] })));
ok("F4.2 used in the stylesheets (fixture reach)", uses.length >= 3, uses.map(u => u.f).join(", "));
ok("F4.3 and never with a fallback that could disagree", uses.every(u => u.fb.trim() === ""), uses.filter(u => u.fb.trim()).map(u => `${u.f}${u.fb}`).join(", "));

console.log("");
if (fails) { console.log(`HOME-FOLD: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`HOME-FOLD: all ${passes} assertions pass\n`);
process.exit(0);
