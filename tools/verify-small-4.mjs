/**
 * tools/verify-small-4.mjs
 * 02 Oct 2026 v1
 *
 * W4-22 SMALL-4 (Wave 4 persona trace). One assertion each:
 *
 *   1. The check-in opener holds with Mostly the same (it was random).
 *   2. Make it up as I go: the clock leaves out time away (it counted it).
 *   3. Make it up as I go is the Plan's: Free does not open it.
 *   4. Upgrading shows a message's dot straight away (only on reopen).
 *   5. Vibration can be turned off, and off means every vibration.
 *   (Display settings staying this phone's on Restore shipped with W4-6:
 *   verify-restore-move.)
 */
import { createRequire as __cr } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import { agreed } from "./agreed.mjs";
import { oneScreen } from "./one-screen.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM(`<!doctype html><body><div id="app"><main id="main-content"></main></div>
  <nav id="bottom-nav"><button data-nav="settings" aria-label="Settings"></button></nav>
  <button id="hidden-nav-home-btn" class="hidden"></button></body>`, { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
let buzzes = 0;
const nav = Object.create(dom.window.navigator);
Object.defineProperty(nav, "vibrate", { value: () => { buzzes++; return true; }, writable: true, configurable: true });
Object.defineProperty(globalThis, "navigator", { value: nav, configurable: true, writable: true });
Object.defineProperty(dom.window, "navigator", { value: nav, configurable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.fetch = dom.window.fetch = async () => ({ ok: false, text: async () => "", json: async () => ({}) });

const ROOT = new URL("../", import.meta.url);
const B = new URL("js/", ROOT).href;
const { store } = await import(B + "store.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
function person(extra = {}) {
  localStorage.clear(); store.init(); agreed(store); store.set("onboardingComplete", true); store.set("name", "Lee"); store.set("tier", "personal");
  for (const [k, v] of Object.entries(extra)) store.set(k, v);
}
const day = n => { const d = new Date(Date.now() - n * 86400000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

// ── 1. THE OPENER ───────────────────────────────────────────────────────
console.log("\nTEST 1 - the check-in opener with Mostly the same");
const O = await import(B + "data/checkin-openings.js");
const hist = Object.fromEntries([5, 4, 3, 2].map(n => [day(n), { energy: 6, mood: 6 }]));
person({ checkinHistory: hist, sessionVariety: "familiar" });
const firstLines = new Set(Array.from({ length: 12 }, () => O.resolveOpening().b1));
ok("1a. Mostly the same: the same opener every time", firstLines.size === 1, [...firstLines].slice(0, 3).join(" | "));
person({ checkinHistory: hist, sessionVariety: "varied" });
const varied = new Set(Array.from({ length: 30 }, () => O.resolveOpening().b1));
ok("1b. control: Something different still varies", varied.size > 1);

// ── 2. THE CLOCK ────────────────────────────────────────────────────────
console.log("\nTEST 2 - Make it up as I go's clock leaves out time away");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const ex = EXERCISES.find(e => e.category !== "mindfulness") || EXERCISES[0];
const minsAgo = m => new Date(Date.now() - m * 60000).toISOString();
person({ activeSessionCheckpoint: { sessionType: "freestyle", checkpointedAt: minsAgo(5), startedAt: minsAgo(110),
  moves: [{ id: ex.id, sets: [{ at: minsAgo(100), reps: 8 }] }], current: null, kind: null } });
const gate = await import(B + "safety-gate.js");
gate.endGateSession(); for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture"); gate.endGateSession();
const C = await import(B + "views/capture.js");
const cel = oneScreen(document.createElement("div")); cel.innerHTML = C.render(); C.onMount?.(); await wait(10);
const clock = txt(document.getElementById("fs-clock"));
const shownMin = (() => { const p = clock.split(":").map(Number); return p.length === 3 ? p[0] * 60 + p[1] : p[0]; })();
C.onUnmount?.();
ok("2pc. the session was carried on", !!clock, clock);
ok("2a. 110 minutes since the start, 100 of them away: the clock shows about 10", shownMin >= 9 && shownMin <= 12, clock);

// ── 3. THE PLAN'S ───────────────────────────────────────────────────────
console.log("\nTEST 3 - Free does not open Make it up as I go");
const { router } = await import(B + "router.js");
let landed = null;
const realMount = router._mountView;
router._mountView = async name => { landed = name; router.currentView = name; };
person({ tier: "free" });
await router.navigate("capture"); await wait(5);
ok("3a. on Free, capture is not opened", landed !== "capture", String(landed));
person({ tier: "personal" });
await router.navigate("capture"); await wait(5);
ok("3b. control: on the Plan it opens", landed === "capture", String(landed));
router._mountView = realMount;

// ── 4. THE DOT AFTER UPGRADING ──────────────────────────────────────────
console.log("\nTEST 4 - upgrading shows a message's dot at once");
person({ tier: "free", "messages.list": [{ id: "plan-hello", kind: "app", title: "For the Plan", body: "Hello.", publishedAt: "2026-10-01", audience: { tier: "plan" } }] });
const M = await import(B + "data/messages.js");
M.updateNavDot();
const dot = () => !!document.querySelector('[data-nav="settings"] .nav-dot');
ok("4pc. on Free, no dot (the message is for the Plan)", !dot());
const U = await import(B + "views/upgrade.js");
const uel = oneScreen(document.createElement("div")); uel.innerHTML = U.render(); U.onMount();
click(document.getElementById("upgrade-cta")); await wait(10);
ok("4a. after I'm ready: the dot, without reopening", store.get("tier") === "personal" && dot());

// ── 5. VIBRATION ────────────────────────────────────────────────────────
console.log("\nTEST 5 - vibration can be turned off");
const DP = await import(B + "display-prefs.js");
person();
ok("5pc. there is a setting, on by default", "vibration" in DP.DISPLAY_KEYS && DP.getDisplayPref("vibration") === "on");
DP.setDisplayPref("vibration", "off"); buzzes = 0;
navigator.vibrate([100]);
ok("5a. off: nothing vibrates", buzzes === 0, `buzzes ${buzzes}`);
DP.setDisplayPref("vibration", "on"); buzzes = 0;
navigator.vibrate([100]);
ok("5b. on: it does", buzzes === 1, `buzzes ${buzzes}`);
const S = await import(B + "views/settings.js");
person();
const sel = oneScreen(document.createElement("div")); S.SettingsView({ navigate() {}, back() {} }).mount(sel); await wait(10);
ok("5c. Settings has the switch", !!sel.querySelector('[data-disp-toggle="vibration"]'));
const walk = d => readdirSync(new URL(d, ROOT), { withFileTypes: true }).flatMap(f => f.isDirectory() ? walk(`${d}${f.name}/`) : f.name.endsWith(".js") ? [`${d}${f.name}`] : []);
const other = walk("js/").filter(f => /vibrate\(/.test(readFileSync(new URL(f, ROOT), "utf8").replace(/navigator\.vibrate\(|function vibrate\(|vibrate\(\d|\bvibrate\(\[/g, "")));
ok("5d. every vibration goes through navigator.vibrate (so the setting reaches it)", other.length === 0, other.join(", "));

console.log(`\nSMALL-4: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
