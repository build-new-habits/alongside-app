/**
 * tools/verify-reduce-motion.mjs
 * 28 Sep 2026 v1
 *
 * F6, REDUCE-MOTION-ROW. Graeme, 28 Sep: add it.
 *
 * Spec 4.10 lists Reduce motion under Display. The app has always
 * followed the device's own setting (prefers-reduced-motion); plenty of
 * people who need it never find that setting. The switch must behave
 * EXACTLY as the device setting does:
 *   - every CSS rule written for prefers-reduced-motion applies when it
 *     is on (copied from the stylesheets, so the two cannot drift);
 *   - every view that times or animates in JS asks one reader,
 *     prefersReducedMotion(), not matchMedia on its own;
 *   - off still follows the device;
 *   - it is set before first paint, like the other display settings.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM(`<!doctype html><head>
  <style id="probe">.fade { transition: opacity 400ms; }
  @media (prefers-reduced-motion: reduce) { .fade { transition: none; } .dots { display: none; } }</style>
  </head><div id="app"><div id="main-content"></div></div>`, { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
let deviceReduces = false;
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q) && deviceReduces, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const R = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const DP = await import(B + "display-prefs.js");
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const copied = () => document.getElementById(DP.REDUCE_MOTION_STYLE_ID || "reduce-motion-rules")?.textContent || "";

// ── 1. THE READER ───────────────────────────────────────────────────────
console.log("\nTEST 1 - one reader: the device, or the switch");
localStorage.clear();
ok("1a. off, device quiet: motion as normal", typeof DP.prefersReducedMotion === "function" && DP.prefersReducedMotion() === false);
deviceReduces = true;
ok("1b. off, device asks: reduced (as the app always did)", DP.prefersReducedMotion?.() === true);
deviceReduces = false;
DP.setDisplayPref("reduceMotion", "on");
ok("1c. on, device quiet: reduced", DP.prefersReducedMotion?.() === true);

// ── 2. THE STYLESHEETS ──────────────────────────────────────────────────
console.log("\nTEST 2 - on, the stylesheets' own reduced-motion rules apply");
ok("2a. the root carries .reduce-motion", document.documentElement.classList.contains("reduce-motion"));
ok("2b. the rules inside @media (prefers-reduced-motion: reduce) are applied, unwrapped",
   /\.fade\s*\{\s*transition:\s*none/.test(copied()) && /\.dots\s*\{\s*display:\s*none/.test(copied()), copied().slice(0, 200));
ok("2c. and nothing outside that block is copied", !/opacity 400ms/.test(copied()));
DP.setDisplayPref("reduceMotion", "off");
ok("2d. REVERSAL: off, they are removed and the class goes", !document.getElementById("reduce-motion-rules") && !document.documentElement.classList.contains("reduce-motion"));

// ── 3. EVERY JS READER USES IT ──────────────────────────────────────────
console.log("\nTEST 3 - no view reads the device on its own any more");
const walk = rel => fs.readdirSync(new URL(rel, R), { withFileTypes: true }).flatMap(d =>
  d.isDirectory() ? walk(rel + d.name + "/") : (d.name.endsWith(".js") ? [rel + d.name] : []));
const direct = walk("js/").filter(f => f !== "js/display-prefs.js" &&
  /matchMedia\(\s*['"]\(prefers-reduced-motion/.test(strip(fs.readFileSync(new URL(f, R), "utf8"))));
ok("3a. only display-prefs.js asks matchMedia about motion", direct.length === 0, direct.join(", "));
const users = walk("js/").filter(f => /prefersReducedMotion\(\)/.test(strip(fs.readFileSync(new URL(f, R), "utf8"))) && f !== "js/display-prefs.js");
ok("3b. the four views that time or animate in JS ask the one reader", ["js/views/checkin.js", "js/views/thread-runner.js", "js/views/class-player.js", "js/views/onboarding/thread.js"].every(f => users.includes(f)), users.join(", "));

// ── 4. BEFORE FIRST PAINT ───────────────────────────────────────────────
console.log("\nTEST 4 - set before first paint, like the other display settings");
const html = fs.readFileSync(new URL("index.html", R), "utf8");
ok("4a. the pre-paint script knows the key and adds the class", /reduceMotion:\s*"alongside-reduce-motion"/.test(html) && /K\.reduceMotion[^\n]*reduce-motion/.test(html));
ok("4b. with the same key and default as display-prefs.js", DP.DISPLAY_KEYS.reduceMotion === "alongside-reduce-motion" && DP.DISPLAY_DEFAULTS.reduceMotion === "off" && /reduceMotion:\s*"off"/.test(html));

// ── 5. SETTINGS ─────────────────────────────────────────────────────────
console.log("\nTEST 5 - Display › Reduce motion, one tap, and it says what it does");
const { store } = await import(B + "store.js");
localStorage.clear(); store.init(); store.set("onboardingComplete", true); store.set("tier", "personal");
const { SettingsView } = await import(B + "views/settings.js");
const main = document.getElementById("main-content");
main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main);
const row = main.querySelector("#disp-reduce-motion");
ok("5a. a switch on the Settings page, in Display", !!row && row.getAttribute("role") === "switch" && row.getAttribute("aria-checked") === "false" &&
   /Display/.test(row.closest(".settings-group")?.querySelector(".settings-group__title")?.textContent || ""));
row?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
ok("5b. one tap turns it on, and motion is reduced", DP.getDisplayPref("reduceMotion") === "on" && DP.prefersReducedMotion() === true);
main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main);
main.querySelector('[data-open="display"]')?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const scr = main.querySelector("#disp-reduce-motion");
const lab = scr && main.querySelector(`label[for="${scr.id}"]`);
ok("5c. the Display screen explains it, and that off follows the device", !!lab && /follows your device/i.test(lab.textContent) && scr.getAttribute("aria-checked") === "true");

console.log("");
if (fails) { console.log(`REDUCE-MOTION: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`REDUCE-MOTION: all ${passes} assertions pass\n`);
process.exit(0);
