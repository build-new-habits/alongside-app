/**
 * tools/verify-legal-true.mjs
 * 03 Oct 2026 v3
 *
 * v3 - W5-24 (Graeme, 03 Oct: drop the copy). 1d: an under-18 answer
 *   clears everything at once again, keeping only the answer.
 *
 * 03 Oct 2026 v2
 *
 * v2 - W5-5 (safeguarding reviewers to read). An under-18 answer is
 *   recorded at once; what the phone holds is deleted on the under-18
 *   screen after the warning (deleteForUnder18). 1d0 asks nothing goes
 *   before that; 1d asks it all goes then, keeping only the answer.
 *
 * 01 Oct 2026 v1
 *
 * LEGAL-TRUE. Things the 12g documents say, made true in the app before the
 * documents went to Foot Anstey (independent review, 01 Oct 2026).
 *
 *   1. Reset all data leaves nothing of the person's on this phone: every
 *      key starting 'alongside', not only the store. Other sites' keys are
 *      not touched. An under-18 answer does the same.
 *   2. The upgrade page says only what is true in the beta: the Plan is
 *      free, nobody is charged, and there is no "No contract either way"
 *      (the Terms are a contract).
 *   3. Reading aloud uses only a voice that runs on the phone, preferring
 *      British English. With no on-device voice it says reading aloud is
 *      not available and speaks nothing.
 *
 * Delete my health answers' wider reach (capability, onboarding answers,
 * lift notes) is proved in verify-health-consent (3g, TEST 6).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div><div id="tts-status" aria-live="polite"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

// A speech engine the test controls.
let VOICES = [];
const spoken = [];
dom.window.speechSynthesis = {
  speaking: false,
  getVoices: () => VOICES,
  speak: u => spoken.push(u),
  cancel() {},
};
globalThis.SpeechSynthesisUtterance = dom.window.SpeechSynthesisUtterance = function (t) { this.text = t; };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const wait = ms => new Promise(r => setTimeout(r, ms));
const keys = () => Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).sort();

function fixture() {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "free"); store.set("name", "Sam");
  localStorage.setItem("alongside-display-scheme", "light");
  localStorage.setItem("alongside-last-view", "settings");
  localStorage.setItem("another-site", "keep");
}

// ── 1. RESET LEAVES NOTHING ─────────────────────────────────────────────
console.log("\nTEST 1 - Reset all data leaves nothing of the person's on this phone");
fixture();
ok("1pc. positive control: the store and two display keys are there",
   keys().includes("alongside_user") && keys().includes("alongside-display-scheme") && keys().includes("alongside-last-view"), keys().join(","));
store.resetEverything();
const left = keys().filter(k => k.startsWith("alongside") && k !== "alongside_user");
ok("1a. every other alongside key is gone", left.length === 0, left.join(","));
ok("1b. the store is back to a fresh install", !store.get("name") && store.get("onboardingComplete") !== true);
ok("1c. another site's key is untouched", localStorage.getItem("another-site") === "keep");

fixture();
const { recordAge } = await import(B + "data/age-check.js");
recordAge(false);
ok("1d. an under-18 answer clears them too, at once, keeping only that answer",
   keys().filter(k => k.startsWith("alongside") && k !== "alongside_user").length === 0 &&
   !store.get("name") && store.get("consent")?.ageConfirmed === false, keys().join(","));

fixture();
const { SettingsView } = await import(B + "views/settings.js");
main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main); await wait(20);
const resetRow = main.querySelector('[data-action="reset"], [data-action="reset-all"]') ||
  [...main.querySelectorAll(".settings-row")].find(b => /Reset all data/.test(txt(b)));
ok("2pc. positive control: Settings has Reset all data", !!resetRow);
resetRow?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(10);
document.querySelector("#confirm-ok")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(20);
ok("1e. Settings › Reset all data uses it",
   keys().filter(k => k.startsWith("alongside") && k !== "alongside_user").length === 0, keys().join(","));

// ── 2. THE UPGRADE PAGE ─────────────────────────────────────────────────
console.log("\nTEST 2 - the upgrade page says only what is true in the beta");
fixture();
const up = await import(B + "views/upgrade.js");
main.innerHTML = up.render();
const page = txt(main);
ok("2pc. positive control: the upgrade page is up", /Plan/.test(page) && page.length > 200);
ok("2a. the Plan is free while Alongside is in beta, and nobody is charged",
   /free while Alongside is in beta/i.test(page) && /won.t be charged/i.test(page), page.slice(0, 300));
ok("2b. no \"No contract\" (the Terms are a contract)", !/No contract/i.test(page));
ok("2c. any price is for when payment starts", !/£/.test(page) || /When payment starts/i.test(page));

// ── 3. READING ALOUD STAYS ON THE PHONE ─────────────────────────────────
console.log("\nTEST 3 - reading aloud uses only a voice on the phone");
fixture();
const { tts } = await import(B + "tts.js");
const btn = document.createElement("button"); document.body.appendChild(btn);
VOICES = [{ name: "Online", lang: "en-GB", localService: false }];
tts.speak("Your lower back is sore today", btn); await wait(80);
ok("3a. only an online voice: nothing is spoken", spoken.length === 0);
ok("3b. and it says reading aloud isn't available", /isn.t available/i.test(txt(document.getElementById("tts-status"))),
   txt(document.getElementById("tts-status")));
VOICES = [
  { name: "Online GB", lang: "en-GB", localService: false },
  { name: "Local US", lang: "en-US", localService: true },
  { name: "Local GB", lang: "en-GB", localService: true },
];
tts.speak("Your lower back is sore today", btn); await wait(10);
ok("3c. REVERSAL: with an on-device voice it speaks, using it", spoken.length === 1 && spoken[0].voice?.localService === true, JSON.stringify(spoken[0]?.voice));
ok("3d. preferring British English", spoken[0]?.voice?.name === "Local GB", spoken[0]?.voice?.name);

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
