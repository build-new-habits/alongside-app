/**
 * tools/verify-quickbuild.mjs
 * 06 Sep 2026 v1
 *
 * QUICK-BUILD. The room's own screen.
 *
 * WHAT THIS PROTECTS. session-builder-ui.js walks six question phases --
 * type, location, zones, duration, equipment, buildmode -- before it
 * builds anything. That is right for somebody who came to compose. It is
 * wrong for a room whose entire card said "Tell me how long. I fill the
 * rest in": answering one question and then being asked six is the
 * opposite of what was offered, and it is the specific way a promise on
 * a card gets broken one screen later.
 *
 * THE ASSUMPTIONS ARE SHOWN BEFORE THE BUILD, NOT DISCOVERED AFTER IT.
 * The Home card says "You can change the place and kit next". That has
 * to be true on the very next screen or it was decoration.
 *
 * THE COACH'S CHOICE IS NAMED AND CHANGEABLE. A coach that picks
 * silently and cannot be corrected is not handing you a frame, it is
 * deciding for you -- which is what the four rooms exist to stop.
 */

import { createRequire as __cr } from "node:module";
import fs from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="c"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const B = new URL("../js/", import.meta.url).href;
const { store }     = await import(B + "store.js");
const { isPremium } = await import(B + "auth.js");
const { TodayView } = await import(B + "views/today.js");

const sbui = fs.readFileSync("js/views/session-builder-ui.js", "utf8");
const code = sbui.split("\n").filter(l => !/^\s*(\*|\/\/|\/\*)/.test(l)).join("\n");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

function home() {
  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("equipment", ["none"]);
  const c = document.createElement("div");
  document.body.appendChild(c);
  const navs = [];
  TodayView({ navigate: v => navs.push(v) }).mount(c);
  return { c, navs };
}

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the chips are actually on the screen being measured");
const { c, navs } = home();
const chips = [...c.querySelectorAll("[data-quick-mins]")];
ok("0a. the Plan fixture is on Plan", isPremium() === true);
ok("0b. and Quick build rendered its chips", chips.length >= 3,
   `${chips.length} chips - every assertion below would be measuring an absent room`);

// ── 1. THE CHIP ASKS FOR THE ROOM'S OWN SCREEN ──────────────────────────
console.log("\nTEST 1 - one tap, one screen");

chips[1].click();
const pre = store.get("sessionBuilderPreselect");

ok("1a. the chip writes a preselect", !!pre, "nothing was stored, so the tap carried nothing");
ok("1b. carrying the duration the person tapped",
   Number(pre.durationMins) === Number(chips[1].dataset.quickMins),
   `chip said ${chips[1].dataset.quickMins}, store says ${pre && pre.durationMins}`);
ok("1c. and asking for quick mode",
   pre.mode === "quick",
   'without mode:"quick" the builder walks six question phases after the ' +
   'card promised to fill the rest in');
ok("1d. and it navigates to the builder", navs.includes("session-builder"), navs.join(", "));

// ── 2. THE BUILDER HONOURS IT ───────────────────────────────────────────
console.log("\nTEST 2 - the mode reaches a screen of its own");

ok("2a. quick is a phase", /phase === "quick"/.test(code),
   "the mode is written but the builder has no branch for it");
ok("2b. with its own render function", /function renderQuickScaffold/.test(sbui));
ok("2c. entered from the preselect", /pre\.mode === "quick"/.test(code));

// Cleared, like the rest of the object. A mode that survived would turn
// one tap on Home into a permanent change to how the builder behaves.
ok("2d. and quickMode is cleared by resetState",
   /function resetState\(\)\s*\{[\s\S]{0,120}quickMode\s*=\s*false/.test(code),
   "quickMode survives a reset, so one tap on Home permanently changes the builder");

// ── 3. THE COACH PICKS THE TYPE, THROUGH THE SAME CHAIN ─────────────────
console.log("\nTEST 3 - one chooser, not two");

ok("3a. quick mode calls chooseSessionType", /chooseSessionType\(\)/.test(code),
   "the builder picks a type some other way, so there are two choosers to " +
   "keep in step - which is how the two ENGINES drifted for three months");
ok("3b. imported from session-choice, not reimplemented",
   /from '\.\.\/data\/session-choice\.js'/.test(sbui));

// ── 4. EVERY ASSUMPTION IS SHOWN, AND EVERY ONE IS CHANGEABLE ───────────
console.log("\nTEST 4 - the card's promise is kept on the next screen");

const scaffold = sbui.slice(sbui.indexOf("function renderQuickScaffold"),
                            sbui.indexOf("function renderLocationStep"));
for (const [label, id] of [
  ["4a. the session type", "sb-quick-type"],
  ["4b. the length",       "sb-quick-duration"],
  ["4c. where you are",    "sb-quick-location"],
  ["4d. what kit",         "sb-quick-equipment"]
]) {
  ok(`${label} is shown and changeable`, scaffold.includes(id),
     `${id} is missing - the Home card says "You can change the place and kit next"`);
  ok(`${label} is wired to a real step`,
     new RegExp(`getElementById\\("${id}"\\)`).test(code),
     `${id} renders but does nothing, which is worse than not offering it`);
}

ok("4e. and there is one build button", /id="sb-quick-build"/.test(scaffold));
ok("4f. wired to the same triggerBuild the other paths use",
   /getElementById\("sb-quick-build"\)[\s\S]{0,160}triggerBuild\(\)/.test(code),
   "a second build path would be a second thing to keep in step");

// The change buttons must drop into the EXISTING steps. A second
// location picker would be a second thing to keep in step with the
// first, and the real step knows things an inline editor would not.
for (const phase of ["type", "duration", "location", "equipment"]) {
  ok(`4g. changing ${phase} reuses the real step`,
     new RegExp(`phase = "${phase}"; rerender\\(\\)`).test(code),
     `an inline editor was built for ${phase} instead of reusing the step`);
}

// ── 5. WHAT IS NOT DONE IS RECORDED, NOT HIDDEN ─────────────────────────
console.log("\nTEST 5 - the unfinished part says so");

ok("5a. quickInputs is marked as not yet written",
   /NOT YET WRITTEN ANYWHERE/.test(sbui),
   "the holder for what the coach consulted exists with no note that nothing " +
   "reads it. A half-wired FAULTLESS mechanism looks like the record is being kept");

const schema = fs.readFileSync("Documents/Live State/Schema.md", "utf8");
ok("5b. and the mode field is declared", /sessionBuilderPreselect\.mode/.test(schema),
   "schema before code");

console.log(fails === 0
  ? "\nQUICK-BUILD: all assertions pass\n"
  : `\nQUICK-BUILD: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
