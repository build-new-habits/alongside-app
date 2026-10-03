/**
 * tools/verify-a11y-w5.mjs
 * 03 Oct 2026 v1
 *
 * W5-17 A11Y-W5 (Wave 5 persona trace, all tracers). One assertion each:
 *
 *   1. Getting started's age question: focus on its heading, and the screen
 *      is not inside the live region (it was read out whole).
 *   2. The consent screen: focus on its heading (it skipped the summary to
 *      the tick), and not inside the live region.
 *   3. No per-second live regions: the Run timer, breathing time remaining.
 *   4. A group of answers is named by its question ("Options for step 9a").
 *   5. The equipment sheet in getting started: no "Step 8 of 8", Back is
 *      named Back (was "Back to lifestyle") and closes the sheet.
 *   6. Settings: Messages is a heading like the other sections.
 *   7. Upgrade: after the tap the button is named by its words, You're in.
 *   8. The update banner is role=status (was alert) and Later is named Later
 *      (was Dismiss).
 *   9. The loading screen stands still under Reduce motion.
 *  10. An age error marks its field aria-invalid and names the message.
 */
import { createRequire as __cr } from "node:module";
import { readFileSync } from "node:fs";
import { agreed } from "./agreed.mjs";
import { oneScreen } from "./one-screen.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM(`<!doctype html><body><div id="app"><main id="main-content"></main></div>
  <nav id="bottom-nav"></nav><div id="sr-announcer"></div></body>`, { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /reduce/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
globalThis.fetch = dom.window.fetch = async () => ({ ok: false, text: async () => "", json: async () => ({}) });

const ROOT = new URL("../", import.meta.url);
const B = new URL("js/", ROOT).href;
const src = p => readFileSync(new URL(p, ROOT), "utf8");
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const until = async (fn, ms = 4000) => { const t = Date.now(); while (Date.now() - t < ms) { const v = fn(); if (v) return v; await wait(25); } return null; };
const inLive = el => !!el?.closest("[aria-live]:not([aria-live='off'])");

const { ThreadView } = await import(B + "views/onboarding/thread.js");
async function openThread() {
  const el = document.createElement("div"); document.body.appendChild(el);
  ThreadView({ navigate() {}, back() {} }).mount(el);
  await until(() => el.querySelector("button, input, select"));
  await wait(150);
  return el;
}

// ── 1. THE AGE QUESTION ─────────────────────────────────────────────────
console.log("\nTEST 1 - getting started's age question");
localStorage.clear(); store.init();
let el = await openThread();
const ageH = el.querySelector("#ob-age-heading");
ok("1a. focus on its heading", !!ageH && document.activeElement === ageH, `${document.activeElement?.tagName}#${document.activeElement?.id}`);
ok("1b. not inside a live region", !!ageH && !inLive(ageH));
el.remove();

// ── 2. THE CONSENT SCREEN ───────────────────────────────────────────────
console.log("\nTEST 2 - the consent screen");
localStorage.clear(); store.init(); store.set("consent.ageConfirmed", true);
el = await openThread();
const conH = el.querySelector("#ob-consent-heading");
ok("2a. focus on its heading, before the summary", !!conH && document.activeElement === conH, `${document.activeElement?.tagName}#${document.activeElement?.id}`);
ok("2b. not inside a live region", !!conH && !inLive(conH));
el.remove();

// ── 3. NO PER-SECOND LIVE REGIONS ───────────────────────────────────────
console.log("\nTEST 3 - no per-second live regions");
const run = src("js/views/running-session.js");
const runTag = (run.match(/<div class="ws-timer-block"[^>]*>/) || [""])[0];
ok("3a. the Run timer is not a live region", !!runTag && !/aria-live/.test(runTag), runTag);
const br = src("js/views/breathing-session.js");
const brTag = (br.match(/<span[^>]*id="bs-time-remaining"[^>]*>/) || [""])[0];
ok("3b. breathing time remaining is not a live region", !!brTag && !/aria-live/.test(brTag), brTag);

// ── 4. GROUP NAMES ──────────────────────────────────────────────────────
console.log("\nTEST 4 - a group of answers is named by its question");
localStorage.clear(); store.init(); agreed(store); store.set("name", "Ash");
store.set("onboarding.threadStartedAt", new Date().toISOString());
store.set("onboarding.reachedStep", 6);
el = await openThread();
const grp = await until(() => el.querySelector("[role=radiogroup]"));
const gname = grp?.getAttribute("aria-label") || "";
ok("4a. named by the question, not \"Options for step 6\"", /how old/i.test(gname) && !/Options for step/i.test(gname), gname);
el.remove();

// ── 5. THE EQUIPMENT SHEET ──────────────────────────────────────────────
console.log("\nTEST 5 - the equipment sheet in getting started");
localStorage.clear(); store.init(); agreed(store);
const SM = await import(B + "views/onboarding/sheet-manager.js");
let closed = null;
await SM.openSheet("onboarding/equipment", r => { closed = r || {}; });
await wait(100);
const back = document.querySelector("#equip-onboard-back");
const sheetText = txt(back?.closest(".onboarding-view"));
const dots = back?.closest(".onboarding-view")?.querySelector("[aria-label^='Step ']");
ok("5a. no \"Step 8 of 8\"", !!back && !dots, dots?.getAttribute("aria-label"));
const backName = back?.getAttribute("aria-label") || txt(back).replace(/^←\s*/, "");
ok("5b. Back is named Back", backName === "Back", backName);
click(back); await wait(400);
ok("5c. and closes the sheet", closed !== null, sheetText.slice(0, 80));

// ── 6. SETTINGS › MESSAGES ──────────────────────────────────────────────
console.log("\nTEST 6 - Messages is a heading");
localStorage.clear(); store.init(); agreed(store); store.set("onboardingComplete", true); store.set("name", "Ann");
const { SettingsView } = await import(B + "views/settings.js");
const s = oneScreen(document.createElement("div")); SettingsView({ navigate() {}, back() {} }).mount(s); await wait(20);
const msgBtn = s.querySelector('[data-open="messages"]');
ok("6a. the Messages row sits in a heading", !!msgBtn?.closest("h2, h3"), msgBtn?.parentElement?.tagName);

// ── 7. UPGRADE ──────────────────────────────────────────────────────────
console.log("\nTEST 7 - the upgrade button after the tap");
localStorage.clear(); store.init(); agreed(store); store.set("onboardingComplete", true); store.set("tier", "free");
const U = await import(B + "views/upgrade.js");
const main = document.getElementById("main-content");
main.innerHTML = U.render(); U.onMount?.(); await wait(20);
const cta = main.querySelector("#upgrade-cta");
click(cta); await wait(20);
const ctaName = cta?.getAttribute("aria-label") || txt(cta);
ok("7a. named You're in, as it reads", /You.re in/.test(txt(cta)) && /You.re in/.test(ctaName), `${ctaName} | ${txt(cta)}`);

// ── 8. THE UPDATE BANNER ────────────────────────────────────────────────
console.log("\nTEST 8 - the update banner");
const app = src("js/app.js");
const bannerFn = app.slice(app.indexOf("function showUpdateBanner"), app.indexOf("function showUpdateBanner") + 2000);
ok("8a. role=status, not alert", /setAttribute\("role", "status"\)/.test(bannerFn) && !/"role", "alert"/.test(bannerFn));
const later = (bannerFn.match(/<button[^>]*id="update-dismiss-btn"[^>]*>[^<]*/) || [""])[0];
ok("8b. Later is named Later", /Later$/.test(later) && !/aria-label/.test(later), later);

// ── 9. THE LOADING SCREEN ───────────────────────────────────────────────
console.log("\nTEST 9 - the loading screen under Reduce motion");
const css = src("css/layouts/app-shell.css");
const rm = (css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\}\s*\}/) || ["", ""])[1];
ok("9a. the logo and spinner stand still", /\.loading-logo/.test(rm) && /\.loading-spinner/.test(rm) && /animation:\s*none/.test(rm), rm);

// ── 10. AGE ERRORS ──────────────────────────────────────────────────────
console.log("\nTEST 10 - an age error marks its field");
const AC = await import(B + "data/age-check.js");
const q = document.createElement("div"); q.innerHTML = AC.ageQuestionHTML("t"); document.body.appendChild(q);
AC.showAgeError(q, "t", "empty");
const month = q.querySelector("#t-month");
ok("10a. aria-invalid, and the message in its description", month?.getAttribute("aria-invalid") === "true" && /\bt-error\b/.test(month?.getAttribute("aria-describedby") || ""),
   `${month?.getAttribute("aria-invalid")} | ${month?.getAttribute("aria-describedby")}`);

console.log("");
if (fails) { console.log(`A11Y-W5: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`A11Y-W5: all ${passes} assertions pass\n`);
process.exit(0);
