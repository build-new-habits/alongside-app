/**
 * tools/verify-quickbuild.mjs
 * 28 Sep 2026 v4
 *
 * v4 - F2, QUICK-SCAFFOLD-ORPHAN. The scaffold v3 said was unreachable is
 *   removed, so tests 2-9 -- which could only reach it by a preselect
 *   nothing writes -- are RETIRED with it. TEST 1 now proves it is gone,
 *   that nothing writes a quick preselect, and that a stale one left in
 *   an old install opens the ordinary builder and is cleared. Test 0
 *   unchanged.
 *
 * v3 - SMOOTH-P3a/b. The Quick build ROOM left Plan Home by decision
 *   (spec 4.1); "tell me how long and I fill the rest in" is now "I know
 *   what I want" (spec 4.6, verify-know-what). So tests 0b and 1 -- the
 *   Home chip writing the preselect -- have no chip to tap and are
 *   RETIRED, replaced by 0b: Home offers no quick chips, and the length
 *   question now lives on the know-what screen. The builder's quick
 *   scaffold is still in session-builder-ui.js with no caller; tests 2-9
 *   still hold it to its promises (they drive it by preselect) until the
 *   scaffold is removed. Logged as QUICK-SCAFFOLD-ORPHAN.
 *
 * 08 Sep 2026 v2
 *
 * v2 - QUICK-BUILD-2/3. Tests 6, 7 and 8 MOUNT the builder.
 *
 *   v1 was green while the scaffold had never rendered for anybody.
 *   Tests 0-1 executed the Home chip; 2, 3 and 4 were readFileSync
 *   regexes that proved only that this file CONTAINS a function called
 *   renderQuickScaffold and the string phase === \"quick\". Nothing ever
 *   mounted the receiving end, so a branch that set a phase and never
 *   re-rendered passed every assertion.
 *
 *   The three defects that shipped behind it: the scaffold never
 *   rendered at all; no change button came back; the kit line read the
 *   flat merged `equipment` field the equipment step exists not to use.
 *
 *   A gate that mounts one state and claims the screen is worse than no
 *   gate. These mount the screen a person meets and walk it.
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

const dom = new JSDOM(
  '<!doctype html><div id="c"></div><div id="main-content"></div>',
  { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const B = new URL("../js/", import.meta.url).href;
const { store }     = await import(B + "store.js");
const { isPremium } = await import(B + "auth.js");
const { TodayView } = await import(B + "views/today.js");

// GATE-PATH. These were cwd-relative, so the gate read nothing (or the
// wrong tree) from any directory but the repo root. Resolved from
// import.meta.url like the other 49.
const R = new URL("../", import.meta.url);
const readRepo = (rel) => fs.readFileSync(new URL(rel, R), "utf8");
const sbui = readRepo("js/views/session-builder-ui.js");
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
ok("0b. Plan Home no longer carries Quick build's chips (retired by spec 4.1)", chips.length === 0 &&
   c.querySelectorAll(".home-door").length === 3, `${chips.length} chips`);
{
  const { LENGTHS } = await import("../js/views/know-what.js");
  ok("0c. the length question lives on I know what I want", Array.isArray(LENGTHS) && LENGTHS.length >= 3);
}

// ── 1. THE SCAFFOLD IS GONE, AND A STALE PRESELECT IS HARMLESS ─────────
// v4, F2 (28 Sep). Tests 2-9 held the quick scaffold to its promises by
// driving it through a preselect nothing writes any more. The scaffold
// is removed; these replace them.
console.log("\nTEST 1 - the quick scaffold is gone, and nothing asks for it");
ok("1a. no quick phase, scaffold, mode or buttons in the builder",
   !/phase === "quick"|renderQuickScaffold|quickMode|quickInputs|_quickReturn|sb-quick/.test(code));
const walkJs = rel => fs.readdirSync(new URL(rel, R), { withFileTypes: true }).flatMap(d =>
  d.isDirectory() ? walkJs(rel + d.name + "/") : (d.name.endsWith(".js") ? [rel + d.name] : []));
const writers = walkJs("js/").filter(f => /mode:\s*["']quick["']/.test(readRepo(f).split("\n").filter(l => !/^\s*(\*|\/\/)/.test(l)).join("\n")));
ok("1b. nothing in the app writes a quick preselect", writers.length === 0, writers.join(", "));
{
  // An install that tapped a Quick build chip before SMOOTH-P3a and never
  // opened the builder: the old preselect must open the ordinary builder.
  localStorage.clear(); store.init(); store.set("tier", "personal");
  store.set("sessionBuilderPreselect", { mode: "quick", durationMins: 20, returnTo: "today" });
  const ui = await import(B + "views/session-builder-ui.js");
  const main = document.getElementById("main-content");
  main.innerHTML = ui.render(); ui.onMount();
  ok("1c. a stale quick preselect opens the ordinary type picker", main.querySelectorAll(".sb-type-tile").length > 0,
     (main.textContent || "").replace(/\s+/g, " ").slice(0, 120));
  ok("1d. and is cleared, so it cannot pin a later build", !store.get("sessionBuilderPreselect"));
}

console.log(fails === 0
  ? "\nQUICK-BUILD: all assertions pass\n"
  : `\nQUICK-BUILD: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
