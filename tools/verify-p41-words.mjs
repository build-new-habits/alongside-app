/**
 * tools/verify-p41-words.mjs
 * 26 Nov 2026 v1
 *
 * P-41 S4 WORDS (approved by Graeme 26 Nov: BNH-Files Product/alongside_
 * p41_words-16-17_26nov2026_v1.md). This gate READS that document and
 * compares; every line the 16-17 version says is there word for word.
 *
 *   1  Every 16-17 line in data/age-version.js is in the approved document.
 *   2  The age question's line: as before while 16-17 is closed; "for 16
 *      and over" once it opens.
 *   3  The screen for those kept out: as before while closed; under 16 once
 *      open.
 *   4  Alongside for 16 and 17: once, after the agreements, before getting
 *      started; never for an adult.
 *   5  The health answers line for 16-17, on the agreements and the health
 *      consent screen; never for an adult.
 *   6  What the app keeps, at 16 and 17, first on the privacy summary;
 *      never for an adult.
 *
 * Red on alongside-v753.
 */
import fs from "node:fs";
import { oneScreen } from "./one-screen.mjs";
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const AC = await import(B + "data/age-check.js");
let AV = {};
try { AV = await import(B + "data/age-version.js"); } catch { /* red first */ }

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 400)}`); }
};
async function block(name, fn) { try { await fn(); } catch (e) { ok(`${name}: ran without throwing`, false, e.stack?.split("\n").slice(0, 3).join(" | ")); } }
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const pick = (root, sel, v) => { const e = root.querySelector(sel); if (e) { e.value = String(v); e.dispatchEvent(new dom.window.Event("change", { bubbles: true })); } return !!e; };
const norm = s => String(s).replace(/[’‘]/g, "'").replace(/\*/g, "").replace(/\s+/g, " ").trim();

const DOC_P = decodeURIComponent(new URL("../../bnh-files/Apps/Alongside Move/Product/alongside_p41_words-16-17_26nov2026_v1.md", import.meta.url).pathname);
const DOC = fs.existsSync(DOC_P) ? norm(fs.readFileSync(DOC_P, "utf8")) : "";

function person(version, tier = "personal") {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("consent.ageConfirmed", true); store.set("consent.ageGroup", version === "young" ? "young-16" : "adult");
  store.set("consent.ageGroupNext", version === "young" ? "2027-12" : null);
  store.init(); router.history = []; router.currentView = null;
}
const withOpen = async fn => { AC.YOUNG_OPEN["young-16"] = true; try { return await fn(); } finally { AC.YOUNG_OPEN["young-16"] = false; } };

await block("TEST 1", async () => {
  console.log("\nTEST 1 - every 16-17 line is the approved words");
  ok("1pc. the approved document is beside this repository", DOC.length > 1000);
  const lines = ["YOUNG_SUPPORT_LEDE", "HARD_DAYS_LINE", "IN_STEP_SOON", "BUY_YOUNG_LINE", "MOVED_UP_LINE", "AGE_LINE_OPEN", "UNDER16_TITLE", "UNDER16_WHY", "WELCOME_TITLE", "WELCOME_LINE", "HEALTH_YOUNG", "PRIVACY_YOUNG"];
  const off = lines.filter(k => !AV[k] || !DOC.includes(norm(AV[k])));
  ok("1a. all twelve lines are in the approved document, word for word", off.length === 0, off.join(", "));
  person("young");
  ok("1b. the growing-body line is the approved one", !!AV.growthNote && DOC.includes(norm(AV.growthNote("knee"))), AV.growthNote?.("knee"));
});

await block("TEST 2", async () => {
  console.log("\nTEST 2 - the age question's line");
  ok("2a. closed: as before", /Alongside is for adults\. I only keep whether you are 18 or over, not the date\./.test(AC.ageQuestionHTML("a")));
  await withOpen(() => ok("2b. open: for 16 and over, never the date of birth", AC.ageQuestionHTML("a").includes(AV.AGE_LINE_OPEN) && !/for adults/.test(AC.ageQuestionHTML("a"))));
});

await block("TEST 3", async () => {
  console.log("\nTEST 3 - the screen for those kept out");
  const { Under18View } = await import(B + "views/under-18.js");
  const show = () => { main.innerHTML = ""; Under18View(router).mount(main); return txt(main); };
  localStorage.clear(); store.init(); store.set("consent.ageConfirmed", false);
  const closed = show();
  ok("3a. closed: Alongside is for adults, as before", txt(main.querySelector("h1")) === "Alongside is for adults" && /after you turn 18/.test(closed) && /under 18/.test(closed));
  const open = await withOpen(show);
  ok("3b. open: for 16 and over, the approved why, and 16 to start again", txt(main.querySelector("h1")) === "Alongside is for 16 and over" && open.includes(AV.UNDER16_WHY) && /after you turn 16/.test(open) && /under 16/.test(open), open.slice(0, 300));
  ok("3c. open: the help lines are still there", /Childline/.test(open) && /0800 1111/.test(open));
});

const { ThreadView } = await import(B + "views/onboarding/thread.js");
async function onboardTo(backMonths, { tickHealth = false } = {}) {
  localStorage.clear(); store.init();
  const el = document.createElement("div"); oneScreen(el);
  const navs = [];
  ThreadView({ navigate: v => navs.push(v), back() {} }).mount(el); await wait(2600);
  const t = new Date(), d = new Date(t.getFullYear(), t.getMonth() - backMonths, 1);
  pick(el, "#ob-age-month", d.getMonth() + 1); pick(el, "#ob-age-year", d.getFullYear());
  click(el.querySelector("#ob-age-continue")); await wait(20);
  return { el, navs };
}
async function agree(el, health = true) {
  const c = el.querySelector("#ob-consent-check"); if (c) { c.checked = true; c.dispatchEvent(new dom.window.Event("change", { bubbles: true })); }
  const h = el.querySelector("#ob-consent-health"); if (h && health) { h.checked = true; h.dispatchEvent(new dom.window.Event("change", { bubbles: true })); }
  click(el.querySelector("#ob-consent-continue")); await wait(60);
}

await block("TEST 4-5", async () => {
  console.log("\nTEST 4 - Alongside for 16 and 17, once (and TEST 5 on the agreements)");
  await withOpen(async () => {
    let { el, navs } = await onboardTo(17 * 12);
    ok("5a. 16-17: the agreements carry the health answers line for their age", txt(el.querySelector("#ob-consent-health-young")) === AV.HEALTH_YOUNG);
    await agree(el);
    ok("4a. 16-17: after the agreements, Alongside for 16 and 17, with its line and Carry on",
      txt(el.querySelector("h1")) === "Alongside for 16 and 17" && txt(el.querySelector("#ob-young-line")) === AV.WELCOME_LINE && !!el.querySelector("#ob-young-go") && !navs.includes("onboarding/start"), txt(el).slice(0, 200));
    ok("4b. it is one short line before the button (the one screen allowed over 15, saying what is different)", AV.WELCOME_LINE.split(/\s+/).length <= 25);
    click(el.querySelector("#ob-young-go")); await wait(20);
    ok("4c. Carry on goes to getting started, and it is kept as seen", navs.includes("onboarding/start") && !!store.get("consent.ageWelcomedAt"));
    ok("4d. so it is never due again", AV.welcomeDue() === false);
    store.init();
    ok("4d2. and that survives the app opening again", AV.welcomeDue() === false);
    store.set("consent.ageWelcomedAt", "nonsense"); store.init();
    ok("4d3. Schema v1.140: a time that is not a time loads as null, so it is due", store.get("consent.ageWelcomedAt") === null && AV.welcomeDue() === true);
    ({ el, navs } = await onboardTo(30 * 12));
    ok("5b. control: an adult's agreements have no such line", !el.querySelector("#ob-consent-health-young"));
    await agree(el);
    ok("4e. control: an adult goes straight to getting started", navs.includes("onboarding/start") && !el.querySelector("#ob-young-go"));
  });
  const { HealthConsentView } = await import(B + "views/health-consent.js");
  for (const v of ["young", "adult"]) {
    person(v); store.set("consent.health", { given: false, at: null, version: null, withdrawnAt: null });
    main.innerHTML = ""; HealthConsentView(router).mount(main);
    ok(`5c. ${v}: the health consent screen ${v === "young" ? "says" : "does not say"} the line for 16-17`, (txt(main.querySelector("#hc-young")) === AV.HEALTH_YOUNG) === (v === "young"), txt(main).slice(0, 160));
  }
});

await block("TEST 6", async () => {
  console.log("\nTEST 6 - what the app keeps, at 16 and 17");
  const P = await import(B + "views/privacy.js");
  person("young"); main.innerHTML = P.render();
  ok("6a. 16-17: the summary leads with what the app keeps at their age", txt(main.querySelector("#privacy-young p")) === AV.PRIVACY_YOUNG && main.querySelector(".privacy-section") === main.querySelector("#privacy-young"));
  person("adult"); main.innerHTML = P.render();
  ok("6b. control: an adult's summary is as before", !main.querySelector("#privacy-young") && /This is a summary/.test(txt(main)));
});

console.log(`\n${"=".repeat(60)}\nVERIFY-P41-WORDS: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
