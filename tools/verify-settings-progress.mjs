/**
 * tools/verify-settings-progress.mjs
 * 06 Oct 2026 v7
 *
 * v7 - D-11 PROGRESS-SHARE. TEST 3 RE-POINTED, same three properties: the
 *   text to share is on the share screen now (views/progress-share.js,
 *   Text). 3a: no alert() on Progress or the share screen. 3b: Copy says
 *   so in the screen's status line (role=status). 3c: copying refused, the
 *   text itself is labelled, focused and selected.
 *
 * v6 - LOOK-1/LOOK-2: re-pointed at the new shapes. Settings is an index
 *   of section buttons, each opening its own page whose rows open screens;
 *   test 0 now presses everything on the index, on every section page, and
 *   on every row screen (from its section page; Messages from the index).
 *   Progress is an overview plus pages one tap away ([data-pr-page]); test
 *   0 presses everything on the overview and on every page it opens.
 *   Test 3 opens Share your progress (where the export buttons now are)
 *   before copying. Every assertion and threshold is unchanged, including
 *   "every destination registered" and "nothing retired named".
 *
 * 29 Sep 2026 v5
 *
 * v5 - The 3c flake, found rather than waited out. Reproduced under load
 *   (7 and 12 of 16 parallel runs): focus was taken by the Back button of
 *   the goals sheet, which test 0 opened while pressing every control and
 *   never closed. Test 0's presses run without yielding, so each sheet's
 *   50 ms focus timer fired at the first await -- inside 3c when 3b
 *   finished quickly. Test 3 now starts from a clean page: open sheets
 *   closed, pending timers run. No assertion changed; 16 of 16 pass.
 *
 * v4 - Flake, not a loosening. The polls in 3b and 3c gave up after 2 s;
 *   a fresh-clone run of all 213 gates, eight at a time, took longer and
 *   3c failed once (3 of 3 alone passed). The ceiling is now 8 s. Every
 *   assertion is unchanged; a real failure still fails, only later.
 *
 *
 * v3 - Flake, not a loosening. 3b and 3c waited a fixed 20 ms for the
 *   clipboard promise to settle; under the parallel suite that was
 *   sometimes too short and 3c failed (twice on 29 Sep; 3 of 3 alone).
 *   They now wait until the result is on screen, up to 2 seconds. The
 *   assertions are unchanged.
 *
 * v2 - P0. 50 routes after Conditions Update was retired.
 *
 * 28 Sep 2026 v1
 *
 * Work list 9, SETTINGS-PROGRESS. Both screens say what is true.
 *
 * Both were rebuilt in SMOOTH-P4 (Progress v16, Settings v39). This gate
 * does not trust either rebuild: it presses EVERY button and link on
 * Settings (the page, and every screen a row opens) and on Progress (on
 * both tiers), records where each one goes, and asserts that
 *   - every destination is a registered route whose module exists and
 *     exports the view the router will call (a route that 404s on tap
 *     is the "abyss" screen, v517);
 *   - nothing on either screen names a feature the app no longer has.
 *
 * The retired list is the app's own history, each with where it went:
 * Quick build (SMOOTH-P3a), the rooms (P3a), Tone up (P4c),
 * Personal Capacity (C4), streaks (never: a product rule), "three
 * options" (the old engine, 2e), a brief/full session pace (P1).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
dom.window.confirm = () => false;
globalThis.confirm = () => false;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.URL.createObjectURL = () => "blob:x";
globalThis.URL.revokeObjectURL = () => {};
globalThis.CSS = { escape: s => String(s) };
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

const R = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { SettingsView } = await import(B + "views/settings.js");
const { ProgressView } = await import(B + "views/progress.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const wait = ms => new Promise(r => setTimeout(r, ms));

// ── The registry, read from router.js: route -> { path, fn } ───────────
const routerSrc = fs.readFileSync(new URL("js/router.js", R), "utf8");
const REG = new Map([...routerSrc.matchAll(/^\s*'([^']+)':\s*\{\s*path:\s*'([^']+)',\s*fn:\s*'([^']+)'\s*\}/gm)]
  .map(m => [m[1], { path: m[2], fn: m[3] }]));
function live(route) {
  const r = REG.get(route);
  if (!r) return "not registered";
  const file = new URL("js/" + r.path.replace(/^\.\//, ""), R);
  if (!fs.existsSync(file)) return `module missing: ${r.path}`;
  const src = fs.readFileSync(file, "utf8");
  const exported = r.fn === "__module__" || new RegExp(`export\\s+(async\\s+)?(function|const|let|class)\\s+${r.fn}\\b`).test(src) ||
    new RegExp(`export\\s*\\{[^}]*\\b${r.fn}\\b`).test(src) ||
    (/export function render\(/.test(src) && /export function onMount\(/.test(src));
  return exported ? null : `does not export ${r.fn}`;
}

const RETIRED = [
  [/quick build/i, "Quick build (SMOOTH-P3a)"],
  [/\b(the )?(rooms?)\b/i, "the rooms (SMOOTH-P3a)"],
  [/tone up/i, "Tone up (SMOOTH-P4c)"],
  [/personal capacity/i, "Personal Capacity (C4)"],
  [/(?<!no )\bstreaks?\b/i, "streaks (never; \"No streaks\" is a promise, not a feature)"],
  [/three options/i, "three options (the old engine)"],
  [/brief session|session pace/i, "session pace (SMOOTH-P1)"],
];
const retiredIn = text => RETIRED.filter(([re]) => re.test(text)).map(([, n]) => n);

function fixture(tier) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "T");
  store.set("weightTracking", true); store.set("liftLogEnabled", true);
  store.set("conditions", ["knee", "lower-back"]);
  store.set("conditionMeta", { knee: { addedAt: "2026-09-01", status: "active" } });
  store.set("gymEquipment", ["barbell", "bench-flat"]); store.set("homeEquipment", ["band-medium"]);
  store.set("arc", { aimId: "sport-without-flaring", acceptedAt: new Date(Date.now() - 20 * 864e5).toISOString() });
  const d = n => new Date(Date.now() - n * 864e5).toISOString();
  store.set("activityLog", [1, 3, 6, 9, 12].map(n => ({ id: "a" + n, type: "workout", completedAt: d(n), date: d(n), durationMins: 30, exerciseIds: ["goblet-squat"] })));
}

const navs = [];
const rtr = { navigate: v => navs.push(v), back() {}, history: [] };
globalThis.window.router = rtr;

// ── SETTINGS ────────────────────────────────────────────────────────────
function pressAll(remount, label) {
  const seen = []; const texts = [];
  remount();
  texts.push(txt(main));
  const n = main.querySelectorAll("button, a[href], [role='button']").length;
  for (let i = 0; i < n; i++) {
    remount();
    const el = main.querySelectorAll("button, a[href], [role='button']")[i];
    if (!el) continue;
    const before = navs.length;
    try { click(el); } catch { /* a handler that throws is found by other gates */ }
    const href = el.getAttribute("href");
    if (href && href.startsWith("#")) navs.push(href.slice(1));
    for (const v of navs.slice(before)) seen.push({ from: label, control: txt(el).slice(0, 40) || el.getAttribute("aria-label") || el.id, to: v });
    texts.push(txt(main));
  }
  return { seen, texts, n };
}

console.log("\nTEST 0 - fixture reach: both screens mount and have things to press");
const allNavs = []; const allTexts = []; let pressed = 0; const screensOpened = new Set(); const screenKeys = new Set();
for (const tier of ["personal", "free"]) {
  fixture(tier);
  // LOOK-1. The index, each section's page, and each row's screen.
  const mountIndex = () => { fixture(tier); main.innerHTML = ""; SettingsView(rtr).mount(main); };
  mountIndex();
  const sections = [...main.querySelectorAll("[data-section-open]")].map(b => b.dataset.sectionOpen);
  const indexKeys = [...new Set([...main.querySelectorAll("[data-open]")].map(b => b.dataset.open))];
  let r = pressAll(mountIndex, `settings (${tier})`); allNavs.push(...r.seen); allTexts.push(...r.texts); pressed += r.n;
  const openScreens = (mountFrom, keys, where) => {
    keys.forEach(k => screenKeys.add(k));
    for (const k of keys) {
      const mountScreen = () => { mountFrom(); click(main.querySelector(`[data-open="${k}"]`)); };
      mountScreen(); if (main.querySelector("#settings-back-btn")) screensOpened.add(k);
      r = pressAll(mountScreen, `settings › ${where}${k} (${tier})`); allNavs.push(...r.seen); allTexts.push(...r.texts); pressed += r.n;
    }
  };
  openScreens(mountIndex, indexKeys, "");
  for (const sec of sections) {
    const mountSection = () => { mountIndex(); click(main.querySelector(`[data-section-open="${sec}"]`)); };
    mountSection();
    const keys = [...new Set([...main.querySelectorAll("[data-open]")].map(b => b.dataset.open))];
    r = pressAll(mountSection, `settings › ${sec} (${tier})`); allNavs.push(...r.seen); allTexts.push(...r.texts); pressed += r.n;
    openScreens(mountSection, keys, `${sec} › `);
  }
  // LOOK-2. The overview, and every page one tap away.
  const mountProgress = () => { fixture(tier); main.innerHTML = ""; ProgressView(rtr).mount(main); };
  mountProgress();
  const pages = [...main.querySelectorAll("[data-pr-page]")].map(b => b.dataset.prPage);
  r = pressAll(mountProgress, `progress (${tier})`); allNavs.push(...r.seen); allTexts.push(...r.texts); pressed += r.n;
  for (const pg of pages) {
    const mountPg = () => { mountProgress(); click(main.querySelector(`[data-pr-page="${pg}"]`)); };
    r = pressAll(mountPg, `progress › ${pg} (${tier})`); allNavs.push(...r.seen); allTexts.push(...r.texts); pressed += r.n;
  }
}
ok("0a. every Settings screen a row opens was opened (and there are many)", screenKeys.size >= 12 && [...screenKeys].every(k => screensOpened.has(k)),
   [...screenKeys].filter(k => !screensOpened.has(k)).join(", ") || [...screensOpened].join(", "));
ok("0b. a real number of controls pressed, and real navigation seen", pressed > 200 && allNavs.length > 10, `${pressed} pressed, ${allNavs.length} navigations`);
ok("0c. the registry was read", REG.size >= 50 && REG.has("today"), `${REG.size} routes`);

// ── 1. EVERY DESTINATION IS LIVE ────────────────────────────────────────
console.log("\nTEST 1 - every link and button goes somewhere that exists");
const dests = [...new Set(allNavs.map(n => n.to))].sort();
console.log("        destinations: " + dests.join(", "));
const dead = allNavs.filter(n => live(n.to)).map(n => `${n.from}: "${n.control}" -> ${n.to} (${live(n.to)})`);
ok("1a. every destination is registered, and its module exports the view", dead.length === 0, [...new Set(dead)].join("\n        "));
ok("1b. REVERSAL: the check can see a dead route", live("no-such-screen") === "not registered" && live("today") === null);
const progDests = new Set(allNavs.filter(n => n.from.startsWith("progress")).map(n => n.to));
ok("1c. Progress reaches its own doors: the arc (Plan) and the Plan page (free)", (progDests.has("stretch-arc") || progDests.has("arc-setup")) && progDests.has("upgrade"), [...progDests].join(", "));

// ── 2. NOTHING RETIRED IS NAMED ─────────────────────────────────────────
console.log("\nTEST 2 - no retired feature is named, on any screen, on either tier");
const named = new Map();
allTexts.forEach(t => retiredIn(t).forEach(n => named.set(n, (t.match(RETIRED.find(([, x]) => x === n)[0]) || [""])[0])));
ok("2a. none of: Quick build, the rooms, Tone up, Personal Capacity, streaks, three options, session pace", named.size === 0,
   [...named].map(([n, w]) => `${n} ("${w}")`).join(", "));
ok("2b. REVERSAL: the scan can see one", retiredIn("Try Quick build").length === 1 && retiredIn("Your 5 day streak").length === 1);

// ── 3. SHARE YOUR PROGRESS ──────────────────────────────────────────────
console.log("\nTEST 3 - Share your progress: Copied is said where you are; no alert()");
const progSrc = fs.readFileSync(new URL("js/views/progress.js", R), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const shareSrc = fs.readFileSync(new URL("js/views/progress-share.js", R), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
ok("3a. no alert() anywhere on Progress or the share screen (not selectable on most phones)", !/\balert\(/.test(progSrc) && !/\balert\(/.test(shareSrc));
// v5. Test 0 left sheets open with focus timers pending; start clean.
for (let i = 0; i < 5 && document.querySelector(".sheet-panel.is-open"); i++) {
  document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await wait(400);
}
await wait(300);
fixture("personal"); main.innerHTML = "";
// D-11: the text is on the share screen (Text), opened from Progress.
const SHR = await import(new URL("js/views/progress-share.js", R).href);
SHR.setSharePreset({ window: "30", format: "text" });
SHR.ProgressShareView(rtr).mount(main);
let copied = null;
Object.defineProperty(globalThis.navigator, "clipboard", { value: { writeText: t => { copied = t; return Promise.resolve(); } }, configurable: true });
const until = async (fn, ms = 8000) => { const end = Date.now() + ms; while (!fn() && Date.now() < end) await wait(10); };
click(main.querySelector("#sh-copy"));
await until(() => /Copied/.test(txt(main.querySelector("#sh-status"))));
const status = main.querySelector("#sh-status");
ok("3b. copying says so under the buttons, politely", !!copied && /^Copied\./.test(txt(status)) && status.getAttribute("role") === "status" && copied === main.querySelector("#sh-text").value, txt(status));
Object.defineProperty(globalThis.navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("denied")) }, configurable: true });
click(main.querySelector("#sh-copy"));
await until(() => { const a = main.querySelector("#sh-text"); return !!a && document.activeElement === a; });
const area = main.querySelector("#sh-text");
ok("3c. copying refused: the text itself, labelled, focused and selected", !!area && !area.closest("[hidden]") && area.value.length > 40 &&
   document.activeElement === area && !!main.querySelector(`label[for="${area.id}"]`), area?.value.slice(0, 40));

console.log("");
if (fails) { console.log(`SETTINGS-PROGRESS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`SETTINGS-PROGRESS: all ${passes} assertions pass\n`);
process.exit(0);
