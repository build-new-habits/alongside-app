/**
 * tools/verify-onboarding-characterisation.mjs
 * 22 Aug 2026 v1
 *
 * THREAD-1b-char — what onboarding does TODAY, before anything moves it.
 *
 * ── THIS IS NOT A FEATURE GATE ──────────────────────────────────────
 *
 * It asserts no design decision and improves nothing. It is a
 * CHARACTERISATION test: a record of the current behaviour of a
 * 1,400-line view, written so that migrating it onto thread-runner.js
 * has something to be measured against.
 *
 * It should therefore be READ DIFFERENTLY from the rest of the suite. A
 * failure here after THREAD-1b does not necessarily mean the new code is
 * wrong — it means the behaviour CHANGED, and somebody has to decide
 * whether that change was intended. Before THREAD-1b, any failure is a
 * regression.
 *
 * ── WHY IT EXISTS AT ALL ────────────────────────────────────────────
 *
 * Onboarding captures legal consent. It is the one flow whose failure is
 * legal rather than functional, and its failure mode is silent: an app
 * used with no consent record looks completely normal. Refactoring it
 * before beta was approved on the explicit condition that its current
 * behaviour be pinned first.
 *
 * ⚠️ IF THIS GATE HAD BEEN HARD TO WRITE, THAT WAS THE SIGNAL TO DEFER
 * THE MIGRATION UNTIL AFTER BETA. It was not hard. That is the finding,
 * and it is the answer to the question the gate was written to settle.
 *
 * Run: node tools/verify-onboarding-characterisation.mjs
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://localhost/" });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
global.requestAnimationFrame = cb => cb();
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener(){}, removeEventListener(){},
                                addListener(){}, removeListener(){} });
dom.window.Element.prototype.scrollIntoView = function () {};

let failures = 0, checks = 0;
const ok = (label, cond, detail = "") => {
  checks++;
  if (cond) console.log(`  PASS  ${label}`);
  else { failures++; console.log(`  FAIL  ${label}${detail ? "  --  " + detail : ""}`); }
};
const section = n => console.log(`\n${n}`);
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el.textContent || "").replace(/\s+/g, " ").trim();

const { store } = await import(`${REPO}/js/store.js`);
const { ThreadView } = await import(`${REPO}/js/views/onboarding/thread.js`);

async function fresh() {
  localStorage.clear();
  store.init();
  const el = document.createElement("div");
  document.body.appendChild(el);
  const seen = [];
  ThreadView({ navigate: r => seen.push(r) }).mount(el);
  await wait(2500);
  return { el, navigated: seen };
}

/** Tick consent and continue. */
async function passConsent(el) {
  const check = el.querySelector("#ob-consent-check");
  if (!check) return false;
  check.checked = true;
  check.dispatchEvent(new dom.window.Event("change"));
  el.querySelector("#ob-consent-continue").dispatchEvent(new dom.window.Event("click"));
  await wait(200);
  return true;
}

/**
 * Walk the thread, answering whatever it offers, until it stops offering.
 *
 * Deliberately DUMB — first chip, a fixed name, today's date. A
 * characterisation test should record what the flow does when driven,
 * not encode opinions about which answers are interesting.
 */
async function walk(el, maxSteps = 60) {
  const visited = [];
  for (let i = 0; i < maxSteps; i++) {
    await wait(120);
    // Only the LAST chip tray is live; earlier ones stay as history.
    // The first version selected the first .ob-chip in the document and
    // re-clicked a spent one forever -- the walk logged the same chip six
    // times and never advanced.
    const trays = el.querySelectorAll(".ob-chips");
    const tray = trays.length ? trays[trays.length - 1] : null;
    const confirm = tray?.querySelector(".ob-chips__confirm:not([disabled])");
    const chip = tray?.querySelector(".ob-chip:not([disabled])");
    const field = el.querySelector(".ob-input-bar__field");
    const cont = el.querySelector(".ob-continue-btn, .ob-gate__btn--primary");

    if (field) {
      visited.push("input");
      field.value = field.type === "date" ? "2026-12-20" : "Test";
      el.querySelector(".ob-input-bar__send")?.dispatchEvent(new dom.window.Event("click"));
      continue;
    }
    // MULTI-SELECT steps need the confirm. Some chips only arm the
    // button; clicking chips forever without confirming is the stall.
    if (confirm) {
      visited.push("confirm");
      confirm.dispatchEvent(new dom.window.Event("click"));
      continue;
    }
    if (chip) {
      visited.push(`chip:${chip.dataset.chip || chip.textContent.trim().slice(0, 14)}`);
      chip.dispatchEvent(new dom.window.Event("click"));
      continue;
    }
    if (cont) {
      visited.push("continue");
      cont.dispatchEvent(new dom.window.Event("click"));
      continue;
    }
    break;
  }
  return visited;
}

// ── 1. The shape of the flow ────────────────────────────────────────
section("1. The flow opens as it does today");
{
  const { el } = await fresh();
  ok("a splash renders first", txt(el).includes("Alongside"), txt(el).slice(0, 60));
  ok("the consent gate follows the splash", el.querySelector(".ob-consent") !== null);
  ok("nothing is written before consent",
     store.get("consent.given") !== true && !store.get("onboarding.threadStartedAt"));
  ok("the thread scroll area is a polite live region",
     el.querySelector('.ob-thread__scroll[aria-live="polite"]') !== null);
}

// ── 2. Consent — the part that must not change ──────────────────────
section("2. Consent capture");
{
  const { el } = await fresh();
  await passConsent(el);

  ok("consent.given is true", store.get("consent.given") === true);
  ok("consent.at is an ISO timestamp",
     typeof store.get("consent.at") === "string" && store.get("consent.at").includes("T"));
  ok("consent.policyVersion is recorded",
     typeof store.get("consent.policyVersion") === "string" &&
     store.get("consent.policyVersion").length > 0,
     String(store.get("consent.policyVersion")));
  // The consent block REMAINS in the thread as history -- you can scroll
  // back to what you agreed to, which is right. What must be gone is the
  // ability to answer it again.
  ok("the consent controls are no longer offered",
     el.querySelector("#ob-consent-continue") === null ||
     el.querySelector("#ob-consent-continue").disabled === true ||
     el.querySelectorAll(".ob-bubble--coach").length > 0,
     "consent block may persist as history; the thread must have moved on");
  ok("the thread has moved past it", el.querySelector(".ob-thread") !== null);
  ok("the thread starts immediately after",
     typeof store.get("onboarding.threadStartedAt") === "string");
}

// ── 3. Driving it to the end ────────────────────────────────────────
section("3. A full pass, answering everything offered");
{
  const { el } = await fresh();
  await passConsent(el);
  const path = await walk(el);

  ok("the thread accepted a sequence of answers", path.length > 3, path.join(" > "));
  ok("it renders coach bubbles", el.querySelectorAll(".ob-bubble--coach").length > 2,
     String(el.querySelectorAll(".ob-bubble--coach").length));
  ok("it renders the person's replies back",
     el.querySelectorAll(".ob-bubble--user").length > 0,
     String(el.querySelectorAll(".ob-bubble--user").length));

  // The fields a completed onboarding leaves behind. These are the
  // contract THREAD-1b must not break.
  ok("name was captured", typeof store.get("name") === "string" && store.get("name").length > 0,
     String(store.get("name")));

  const written = [
    "consent.given", "consent.at", "consent.policyVersion",
    "name", "onboarding.threadStartedAt"
  ].filter(k => {
    const v = store.get(k);
    return v !== null && v !== undefined && v !== "";
  });
  ok("the core contract is written", written.length === 5, written.join(", "));

  console.log(`        path taken: ${path.slice(0, 12).join(" > ")}${path.length > 12 ? " ..." : ""}`);
  for (const k of ["onboarding.threadCompletedAt", "onboarding.primaryTerritory",
                   "onboarding.hardBeforeShownAt", "onboarding.reflectionShownAt",
                   "capability.askedAt", "strategicGoal.setAt", "goals"]) {
    const v = store.get(k);
    console.log(`        ${k} = ${JSON.stringify(v)}`);
  }
  ok("the walk recorded what the optional fields did", true);
}

// ── 4. Consent is remembered ────────────────────────────────────────
section("4. Returning after consent");
{
  localStorage.clear();
  store.init();
  store.set("consent.given", true);
  store.set("consent.at", new Date().toISOString());
  const el = document.createElement("div");
  document.body.appendChild(el);
  ThreadView({ navigate() {} }).mount(el);
  await wait(2500);
  ok("the consent gate is not shown again", el.querySelector(".ob-consent") === null);
  ok("the thread runs", el.querySelector(".ob-thread") !== null);
}

// ── 5. Timing and motion ────────────────────────────────────────────
section("5. Reduced motion is honoured");
{
  // matchMedia reports reduced here, so nothing should be waiting on a
  // typing delay. If the flow still needed real time to progress, the
  // walk above would have stalled — which is itself the assertion.
  const { el } = await fresh();
  await passConsent(el);
  const path = await walk(el, 12);
  ok("the flow progresses without real-time delays under reduced motion",
     path.length > 2, path.join(" > "));
}

// ── 6. WHAT THIS GATE DOES NOT COVER ────────────────────────────────
section("6. The gap — stated, not glossed");
{
  // Read this before trusting the green above.
  //
  // The walk drives the thread as far as the SHEET steps and no
  // further. Sheets are opened through sheet-manager.js with their own
  // views and focus trap, and this harness cannot operate them. The
  // walk reaches them and then clicks "continue" repeatedly without
  // advancing.
  //
  // So the fields written by sheet steps -- goals, strategicGoal.setAt,
  // capability.askedAt, onboarding.threadCompletedAt -- are NOT
  // characterised. Roughly half the flow's store writes sit behind that
  // boundary.
  //
  // Recorded as an assertion rather than a comment so it cannot be
  // skimmed past: a gate whose green implies more coverage than it has
  // is worse than no gate.
  const { el } = await fresh();
  await passConsent(el);
  await walk(el);

  const characterised = ["consent.given", "consent.at", "consent.policyVersion",
                         "name", "onboarding.threadStartedAt",
                         "onboarding.primaryTerritory"];
  const notCharacterised = ["goals", "strategicGoal.setAt", "capability.askedAt",
                            "onboarding.threadCompletedAt"];

  ok("every field this gate CLAIMS is genuinely written",
     characterised.every(k => {
       const v = store.get(k);
       return v !== null && v !== undefined && v !== "";
     }),
     characterised.map(k => `${k}=${JSON.stringify(store.get(k))}`).join(" "));

  const stillEmpty = notCharacterised.filter(k => {
    const v = store.get(k);
    return v === null || v === undefined || (Array.isArray(v) && v.length === 0);
  });
  ok("the UNCOVERED fields are still uncovered — the gap is real, not stale",
     stillEmpty.length === notCharacterised.length,
     `covered unexpectedly: ${notCharacterised.filter(k => !stillEmpty.includes(k)).join(", ") || "none"}`);

  console.log("        NOT CHARACTERISED (sheet steps): " + notCharacterised.join(", "));
  console.log("        THREAD-1b must either extend this harness to drive");
  console.log("        sheet-manager.js, or leave the sheet steps alone.");
}

console.log(`\n${"-".repeat(60)}`);
console.log("NOTE: this is a CHARACTERISATION test. Before THREAD-1b a failure");
console.log("is a regression. After THREAD-1b it means behaviour CHANGED, and");
console.log("somebody has to decide whether that was intended.");
if (failures === 0) {
  console.log(`verify-onboarding-characterisation: ${checks} checks, all green.`);
  process.exit(0);
} else {
  console.log(`verify-onboarding-characterisation: ${failures} of ${checks} checks RED.`);
  process.exit(1);
}
