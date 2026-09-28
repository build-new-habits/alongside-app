/**
 * tools/verify-nav5.mjs
 * 28 Sep 2026 v2
 *
 * v2 - SMOOTH-P4c. The sections and sub-tabs are retired: Settings is one
 *   page of grouped rows, two levels at most, no tabs (spec 4.10). NAV-5
 *   and NAV-7's source-shape checks (section ids, PANEL_LABEL, tab
 *   semantics, the sub-tab strip CSS) have nothing left to read and are
 *   retired. What they were FOR is kept and now DRIVEN on the real page:
 *   session notes and equipment are findable by name on it; every row
 *   screen is reachable and none is orphaned; rows clear the touch floor;
 *   an in-place action keeps you where you are; reopening Settings shows
 *   the page, not the last screen. TEST 6 and 7 (Home tiles, the version)
 *   are unchanged.
 *
 * NAV-5. Three sections, not seven tabs.
 *
 * Graeme, device pass part 4: "Changing equipment and turning on session
 * notes really hard to find. Like really really hard."
 *
 * Two of the three things he could not find anywhere in the app were in
 * Settings, both in the FOURTH tab of a strip that scrolled horizontally
 * with the scrollbar hidden. Profile, Programme and Conditions sat
 * off-screen with nothing indicating they existed.
 *
 * His grouping, agreed in conversation: "we divide into app controls,
 * about, and settings."
 */
import fs from "node:fs";

// GATE-PATH, 08 Sep 2026. Paths resolved from import.meta.url, not the
// working directory.
//
// 72 of 139 gates read files by a path relative to process.cwd(), so
// they were green from the repo root and read NOTHING from anywhere
// else. Not a live fault -- every session so far has run them from the
// root -- but an expensive trap: a session running the suite by full
// path from elsewhere sees most of it red and reasonably concludes the
// app is broken.
const _GATE_ROOT = new URL("../", import.meta.url);
const _gatePath = (p) => new URL(String(p).replace(/^\.\//, ""), _GATE_ROOT);


let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}\n        got: ${a}  want: ${b}`); };

import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
const { store } = await import(new URL("../js/store.js", import.meta.url).href);
const { SettingsView } = await import(new URL("../js/views/settings.js", import.meta.url).href);
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
localStorage.clear(); store.init(); store.set("tier", "personal"); store.set("onboardingComplete", true);
const page = () => { main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main); };

console.log("\nTEST 1 - what Graeme could not find is named on the page");
page();
const labels = [...main.querySelectorAll(".settings-row__label")].map(txt);
check("session notes is a row of its own, by name", () => ok(labels.includes("Session notes"), labels.join(", ")));
check("equipment is a row of its own, with what is saved", () =>
  ok(labels.includes("Equipment") && /Gym \d+ · Home \d+/.test(txt(main.querySelector('[data-open="equipment"]'))), "no Equipment row with its count"));
check("the capability questions are named", () => ok(labels.includes("What your body can do"), "not named"));

console.log("\nTEST 2 - every screen is reachable, none orphaned");
const src = fs.readFileSync(_gatePath("js/views/settings.js"), "utf8");
const screens = [...src.slice(src.indexOf("const SCREENS = {"), src.indexOf("const _label")).matchAll(/^\s{4}'?([\w-]+)'?:\s*\{ title:/gm)].map(m => m[1]);
const opened = new Set([...main.querySelectorAll("[data-open]")].map(b => b.dataset.open));
store.set("onboarding.primaryTerritory", "body"); page();
[...main.querySelectorAll("[data-open]")].forEach(b => opened.add(b.dataset.open));
store.set("weightTracking", true); store.set("checkInNotification.enabled", true); page();
[...main.querySelectorAll("[data-open]")].forEach(b => opened.add(b.dataset.open));
check("the page opens only screens that exist", () => {
  const bad = [...opened].filter(k => !screens.includes(k));
  ok(screens.length > 10 && bad.length === 0, `unknown: ${bad.join(", ")}`);
});
check("every screen is opened from the page -- none orphaned", () => {
  const orphan = screens.filter(k => !opened.has(k) && k !== "reflection");
  ok(orphan.length === 0, `a screen nobody can open: ${orphan.join(", ")}`);
});
check("every screen renders something", () => {
  for (const k of opened) {
    page(); click(main.querySelector(`[data-open="${k}"]`));
    ok(txt(main.querySelector(".settings-screen")).length > 20, `${k} is empty`);
  }
});

console.log("\nTEST 3 - nothing hides");
check("no tabs, no horizontal strip", () => { page(); ok(!main.querySelector("[role=tablist]"), "a tab strip is back"); });
check("rows clear the 44px touch floor", () => {
  const css = fs.readFileSync(_gatePath("css/components/settings.css"), "utf8");
  const rule = css.slice(css.indexOf(".settings-row {"), css.indexOf("}", css.indexOf(".settings-row {")));
  const m = rule.match(/min-height:\s*(\d+)px/);
  ok(m && parseInt(m[1], 10) >= 44, "WCAG 2.2 AA 2.5.8");
});

console.log("\nTEST 4 - in-place actions keep you where you are");
check("toggling the reminder stays on the page", () => {
  page(); click(main.querySelector("#settings-checkin-notif"));
  ok(!!main.querySelector(".settings-lede") && document.activeElement?.id === "settings-checkin-notif", "bounced");
});
check("resetting display stays on Display", () => {
  page(); click(main.querySelector('[data-open="display"]')); click(main.querySelector("#disp-reset"));
  ok(/^Display$/.test(txt(main.querySelector(".settings-title"))), "left the Display screen");
});
check("reopening Settings shows the page, not the last screen", () => {
  page(); click(main.querySelector('[data-open="equipment"]')); page();
  ok(!!main.querySelector(".settings-lede"), "sticky");
});

console.log("\nTEST 6 - NAV-6: Home does not duplicate the bottom nav");
check("no tile routes to a nav destination except the flagged one", () => {
  const home = fs.readFileSync(_gatePath("js/views/today.js"), "utf8");
  // LOBBY-1a added a leading `kind:` to every door, and this pattern
  // assumed `id:` came first -- so it matched nothing and reported "no
  // tiles found" rather than passing silently. That is the gate working:
  // it noticed the shape changed instead of quietly measuring an empty
  // set. The kind is now optional in the pattern and captured, because
  // the duplication rule this test enforces applies to TILES, and
  // reference rows are allowed to point at nav destinations -- being
  // reachable two ways is only clutter when both look equally important.
  const tiles = [...home.matchAll(/\{ (?:kind: '(\w+)', )?id: '[\w-]+', label: '([^']+)'[^}]*?route: '([\w-]+)'/g)]
    .map(m => ({ kind: m[1] || 'session', label: m[2], route: m[3] }))
    .filter(t => t.kind !== 'reference');
  ok(tiles.length > 0, "no tiles found - the regex has drifted from the markup");
  const nav = ["today", "progress", "noticing", "settings"];
  const dup = tiles.filter(t => nav.includes(t.route) && t.label !== "Wellbeing");
  ok(dup.length === 0,
     `duplicates a bottom-nav destination, which is reachable from every ` +
     `screen while Home is not: ${dup.map(d => `${d.label} -> ${d.route}`).join(", ")}`);
});
check("the Progress tile stays removed", () => {
  const home = fs.readFileSync(_gatePath("js/views/today.js"), "utf8");
  ok(!/id: 'progress', label: 'Progress'/.test(home),
     "it was the only tile duplicating the nav by name as well as route");
});

console.log("\nTEST 7 - VER-2: the version comes from the running worker");
check("settings asks, rather than inferring from cache names", () => {
  const s2 = fs.readFileSync(_gatePath("js/views/settings.js"), "utf8");
  ok(/postMessage\(\{ type: 'GET_VERSION' \}\)/.test(s2),
     "reading caches.keys() answers which caches EXIST, not which is serving " +
     "the page - during an update both do, and About reported a build the " +
     "page was not running");
  ok(!/const cacheNames = await caches\.keys\(\)/.test(s2), "old inference still present");
});
check("the worker answers", () => {
  const sw = fs.readFileSync(_gatePath("sw.js"), "utf8");
  ok(/event\.data\?\.type === "GET_VERSION"/.test(sw), "no handler - settings would time out");
  ok(/CACHE_NAME\.replace\("alongside-", ""\)/.test(sw), "must report its OWN cache name");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
