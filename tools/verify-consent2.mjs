/**
 * tools/verify-consent2.mjs
 * 22 Aug 2026 v1
 *
 * CONSENT-2 — the consent gate captures consent, and cannot die quietly.
 *
 * (CONSENT-1 was taken: verify-consent1.mjs, 12 Aug, covers the
 * checkbox's visual affordance on this same screen. Different fault,
 * same control. Both matter.)
 *
 * THIS IS THE HIGHEST-STAKES GATE IN THE SUITE. Every other one protects
 * a feature. This protects the record that somebody agreed — and its
 * failure mode is silent: an app used with no consent stored looks
 * completely normal on screen, to the person and to us.
 *
 * ── WHAT WAS WRONG ──────────────────────────────────────────────────
 *
 * thread.js fetched all five consent elements with
 * document.getElementById(), then ran:
 *
 *     continueBtn.classList.add('is-inactive');
 *
 * with no optional chaining — the ONLY unguarded dereference in its own
 * function, while the lines either side used `?.`. A null element threw
 * mid-render and onboarding died on the consent screen. `error.hidden`
 * was unguarded in two further places.
 *
 * Not hypothetical: probing whether onboarding could be driven in a
 * harness reproduced it on the first attempt, because a container not
 * attached to the document makes every getElementById return null.
 *
 * ── WHY IT DRIVES THE REAL GATE ─────────────────────────────────────
 *
 * A source-text gate would assert that `store.set('consent.given', true)`
 * appears in the file. It does appear. It appeared throughout the whole
 * period in which a null element would have stopped it ever running.
 * That is the difference between text and behaviour, on the one screen
 * where the difference is legal.
 *
 * So: mount onboarding, wait out the splash, tick the box, click
 * Continue, read the store.
 *
 * Run: node tools/verify-consent2.mjs
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
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

// jsdom does not implement scrollIntoView. thread.js calls it unguarded
// (thread-runner.js uses ?. for the same call), so without this stub the
// harness dies on a browser API rather than on anything real. Stubbed
// rather than "fixed" in the product: a real browser has it, and adding
// ?. there would be an unrelated change riding along inside a consent
// fix.
dom.window.Element.prototype.scrollIntoView = function () {};
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener(){}, removeEventListener(){},
                                addListener(){}, removeListener(){} });

let failures = 0, checks = 0;
const ok = (label, cond, detail = "") => {
  checks++;
  if (cond) console.log(`  PASS  ${label}`);
  else { failures++; console.log(`  FAIL  ${label}${detail ? "  --  " + detail : ""}`); }
};
const section = n => console.log(`\n${n}`);
const wait = ms => new Promise(r => setTimeout(r, ms));
const src = fs.readFileSync(path.join(REPO, "js/views/onboarding/thread.js"), "utf8");

const { store } = await import(`${REPO}/js/store.js`);
const { ThreadView } = await import(`${REPO}/js/views/onboarding/thread.js`);

/** Mount onboarding fresh and wait past the splash to the consent gate. */
async function openGate({ attached = true } = {}) {
  localStorage.clear();
  store.init();
  const el = document.createElement("div");
  if (attached) document.body.appendChild(el);
  ThreadView({ navigate() {} }).mount(el);
  await wait(2500);
  return el;
}

// ── 0. Positive control ─────────────────────────────────────────────
section("0. Positive control — the gate actually rendered");
{
  const el = await openGate();
  ok("consent gate is on screen", el.querySelector(".ob-consent") !== null,
     (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80));
  ok("consent is not already given", store.get("consent.given") !== true);
}

// ── 1. It wires itself from its own container ───────────────────────
section("1. The gate wires itself from its own container");
{
  const el = await openGate();
  for (const id of ["ob-consent-check", "ob-consent-continue", "ob-consent-error"]) {
    ok(`#${id} exists inside the view`, el.querySelector(`#${id}`) !== null);
  }

  // The regression that started this. A detached container must not kill
  // the gate — the elements are the view's own, so scoping to the view
  // works whether or not it is in the document.
  const detached = await openGate({ attached: false });
  ok("the gate renders in a DETACHED container",
     detached.querySelector(".ob-consent") !== null);
  ok("its controls are still reachable",
     detached.querySelector("#ob-consent-continue") !== null);

  // The unguarded dereference threw DURING render. If it still did, the
  // Continue button would never have been marked inactive — so this one
  // assertion proves the wiring ran to completion.
  ok("Continue starts inactive — proves the wiring ran without throwing",
     detached.querySelector("#ob-consent-continue")?.classList.contains("is-inactive"),
     detached.querySelector("#ob-consent-continue")?.className);
}

// ── 2. No tick, no consent ──────────────────────────────────────────
section("2. Continue without ticking captures nothing");
{
  const el = await openGate();
  el.querySelector("#ob-consent-continue").dispatchEvent(new dom.window.Event("click"));
  await wait(60);
  ok("consent.given is NOT set", store.get("consent.given") !== true,
     String(store.get("consent.given")));
  ok("consent.at is NOT set", !store.get("consent.at"));
  ok("the thread did not begin", !store.get("onboarding.threadStartedAt"));

  // Not a dead button: it must say what is needed.
  ok("the error message is revealed", el.querySelector("#ob-consent-error")?.hidden === false);
  ok("still on the consent gate", el.querySelector(".ob-consent") !== null);
}

// ── 3. Tick, and it is recorded ─────────────────────────────────────
section("3. Ticking and continuing records consent");
{
  const el = await openGate();
  const check = el.querySelector("#ob-consent-check");
  check.checked = true;
  check.dispatchEvent(new dom.window.Event("change"));
  ok("Continue becomes active",
     el.querySelector("#ob-consent-continue")?.getAttribute("aria-disabled") === "false");

  el.querySelector("#ob-consent-continue").dispatchEvent(new dom.window.Event("click"));
  await wait(80);

  ok("consent.given is true", store.get("consent.given") === true);
  ok("consent.at is an ISO timestamp",
     typeof store.get("consent.at") === "string" && store.get("consent.at").includes("T"),
     String(store.get("consent.at")));

  // The policy version is what makes the record mean anything later.
  // "They agreed" is not evidence unless it says what they agreed TO.
  const v = store.get("consent.policyVersion");
  ok("consent.policyVersion is recorded and non-empty",
     typeof v === "string" && v.length > 0, String(v));

  const m = src.match(/POLICY_VERSION\s*=\s*['"]([^'"]+)['"]/);
  ok("it matches the POLICY_VERSION constant actually shipping",
     m && v === m[1], `store ${v} vs source ${m && m[1]}`);

  ok("the thread began", typeof store.get("onboarding.threadStartedAt") === "string");
}

// ── 4. Consent is remembered ────────────────────────────────────────
section("4. Consent is not asked for twice");
{
  localStorage.clear();
  store.init();
  store.set("consent.given", true);
  store.set("consent.at", new Date().toISOString());
  const el = document.createElement("div");
  document.body.appendChild(el);
  ThreadView({ navigate() {} }).mount(el);
  await wait(2500);
  ok("an existing consent skips the gate", el.querySelector(".ob-consent") === null,
     (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80));
}

// ── 5. It does not reach outside the view ───────────────────────────
section("5. No reaching outside the view, and nothing unguarded");
{
  const stray = [...src.matchAll(/document\.getElementById\(['"]ob-consent[^'"]*['"]\)/g)];
  ok("no document.getElementById for consent elements", stray.length === 0,
     stray.map(s => s[0]).join(", "));
  // Comments in this file DESCRIBE the old unguarded call, so the naive
  // regex matched its own documentation and went red against correct
  // code. Strip comment lines before testing. (Third fixture fault of
  // the day: a test that reads source must read the source, not the
  // prose about it.)
  const code = src.split("\n").filter(l => !/^\s*(\*|\/\/|\/\*)/.test(l)).join("\n");
  ok("continueBtn.classList.add is guarded",
     !/[^?]\bcontinueBtn\.classList\.add/.test(code));
  ok("error.hidden is never assigned unguarded",
     !/(?<!if \(error\) |ok && error\) )\berror\.hidden\s*=/.test(code));
  ok("a missing element is reported loudly, not silently",
     /console\.error\([^)]*CONSENT GATE INCOMPLETE/.test(src));
}

console.log(`\n${"-".repeat(60)}`);
if (failures === 0) { console.log(`verify-consent2: ${checks} checks, all green.`); process.exit(0); }
else { console.log(`verify-consent2: ${failures} of ${checks} checks RED.`); process.exit(1); }
