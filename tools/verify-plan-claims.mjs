/**
 * tools/verify-plan-claims.mjs
 * 28 Sep 2026 v2
 *
 * v2 - SMOOTH-P4c. Settings is one page: About > Plan and About > App
 *   are now row screens ("Your plan", "App version"), opened by a row
 *   rather than a section and a tab. The harness opens them that way.
 *   No assertion changed.
 *
 * SMOOTH-P0 C2 and C3. What the app says about the Plan is true, and the
 * version label never reads "vunknown".
 *
 * C2. Settings > About > Plan told Plan users that everything was open
 * to them including "the long practices in Wellbeing". upgrade.js
 * withdrew exactly that claim on 13 Aug because nothing behind it is
 * built. The page that takes money was corrected; the page people see
 * after paying was not. Smooth Path P5 will make one table the source
 * for every description of the Plan; until then this gate holds the line.
 *
 * C3. With no controlling service worker the version read "vunknown".
 *
 * Both driven by mounting the real SettingsView and opening the panel a
 * person opens -- not by reading source.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const fs = __require("node:fs");
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "Event", "CustomEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
globalThis.history = dom.window.history;

const root = new URL("../", import.meta.url);
const swText = fs.readFileSync(new URL("sw.js", root), "utf8");
const liveVersion = (swText.match(/CACHE_NAME\s*=\s*["']alongside-(v\d+)["']/) || [])[1];
// No service worker in this DOM -- exactly the case that showed "vunknown".
// fetch('./sw.js') answers with the real file, as the browser would.
globalThis.fetch = async (url) => /sw\.js/.test(String(url))
  ? { ok: true, text: async () => swText }
  : { ok: false, text: async () => "" };

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { SettingsView } = await import(B + "views/settings.js");

// Withdrawn or never-true claims. upgrade.js's WITHDRAWN and SEVEN WERE
// DRAFTED notes are the source; a claim goes back only when it ships.
const WITHDRAWN = [/long practices/i, /mind destinations/i, /reflects back what'?s changed/i, /stops being realistic/i];

async function openPanel(_unused, screenId) {
  const app = document.getElementById("app"); app.innerHTML = "";
  SettingsView({ navigate() {}, back() {} }).mount(app);
  await wait(50);
  app.querySelector(`[data-open="${screenId}"]`)?.click();
  await wait(300);
  return app;
}

console.log("\nTEST 0 - the fixture reaches the panels it names");
localStorage.clear(); store.init(); store.set("name", "Test"); store.set("tier", "personal"); store.set("onboardingComplete", true);
const aboutId = "page";
let app = await openPanel(aboutId, "about-plan");
ok("0a. About > Plan rendered for a Plan user", /You are on/.test(app.textContent), `section id tried: ${aboutId}`);
ok("0b. REVERSAL: the withdrawn-claim list catches the old sentence",
   WITHDRAWN.some(re => re.test("every length, the full picture of your progress, and the long practices in Wellbeing")));

console.log("\nTEST 1 - C2: the Plan panel makes no withdrawn claim");
const planText = app.textContent.replace(/\s+/g, " ");
ok("1a. no withdrawn claim on the Plan panel a paying person sees",
   !WITHDRAWN.some(re => re.test(planText)), planText.slice(0, 240));
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
for (const f of ["js/views/settings.js", "js/views/upgrade.js"]) {
  const s = strip(fs.readFileSync(new URL(f, root), "utf8"));
  ok(`1b. ${f} ships none of them anywhere`, !WITHDRAWN.some(re => re.test(s)));
}

console.log("\nTEST 2 - C3: the version label is real without a service worker");
app = await openPanel(aboutId, "about-app");
await wait(400);
const label = app.querySelector("#settings-version")?.textContent.trim() || "";
ok("2a. the fixture has a live version to compare with", !!liveVersion, "sw.js CACHE_NAME not found");
ok(`2b. it shows ${liveVersion}`, label === liveVersion, `shows "${label}"`);
ok("2c. it never shows \"vunknown\"", !/unknown/i.test(label));
globalThis.fetch = async () => { throw new Error("offline"); };
app = await openPanel(aboutId, "about-app");
await wait(400);
const label2 = app.querySelector("#settings-version")?.textContent.trim() || "";
ok("2d. REVERSAL: with nothing to read, it says so plainly instead of inventing a version",
   /not available/i.test(label2) && !/unknown/i.test(label2), `shows "${label2}"`);

console.log("");
if (fails) { console.log(`PLAN-CLAIMS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`PLAN-CLAIMS: all ${passes} assertions pass\n`);
process.exit(0);
