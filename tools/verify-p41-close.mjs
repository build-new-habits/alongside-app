/**
 * tools/verify-p41-close.mjs
 * 26 Nov 2026 v1
 *
 * P-41 S5 CLOSE. The 16-17 version can be tried on a phone before it
 * opens, from the developer panel (off at release, row 15): Adult, 16-17,
 * or 16-17 turning 18 now. Driven through the real gesture (three taps on
 * the version label), as verify-tier-visible does.
 *
 *   1  16-17: the phone is the 16-17 version, with a month to move up, and
 *      is welcomed again.
 *   2  Turning 18 now: when the app opens again it moves up, and Home says
 *      so once.
 *   3  Adult: back to the adult version, no month kept.
 *   4  The version stays closed to new people after S5 (YOUNG_OPEN).
 *
 * Red on alongside-v754 (no age buttons in the panel).
 */
import { agreed } from "./agreed.mjs";
import { settingsFind } from "./settings-open.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
globalThis.fetch = async () => ({ ok: false });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const AV = await import(B + "data/age-version.js");
const AC = await import(B + "data/age-check.js");
const { SettingsView } = await import(B + "views/settings.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 300)}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const c = () => store.get("consent") || {};

function panel() {
  main.innerHTML = ""; SettingsView(router).mount(main);
  click(settingsFind(main, '[data-open="about-app"]'));
  const v = main.querySelector("#settings-version"); click(v); click(v); click(v);
  return main.querySelector("#settings-dev-panel");
}
localStorage.clear(); store.init(); agreed(store);
store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", "personal");
store.set("consent.ageConfirmed", true); store.set("consent.ageGroup", "adult"); store.set("consent.ageWelcomedAt", new Date().toISOString());

console.log("\nTEST 1 - 16-17 from the developer panel");
let p = panel();
ok("1pc. three taps open the panel, with the age buttons", p && !p.hasAttribute("hidden") && !!main.querySelector('[data-dev-age="young-16"]'));
click(main.querySelector('[data-dev-age="young-16"]'));
const t = new Date(), in12 = new Date(t.getFullYear(), t.getMonth() + 12, 1);
ok("1a. the phone is the 16-17 version, with a month to move up a year on", AV.isYoung() && c().ageGroupNext === `${in12.getFullYear()}-${String(in12.getMonth() + 1).padStart(2, "0")}`, JSON.stringify(c()));
ok("1b. and is welcomed again", AV.welcomeDue() === true);
ok("1c. the panel says so", txt(main.querySelector("#dev-current-age")) === "young-16");

console.log("\nTEST 2 - turning 18 now");
click(main.querySelector('[data-dev-age="turning-18"]'));
ok("2a. still 16-17 until the app opens again", AV.isYoung());
store.init();
ok("2b. opened again: moved up to the adult version", !AV.isYoung() && c().ageGroup === "adult" && c().ageGroupNext === null && !!c().ageMovedUpAt);
await router.navigate("today"); await wait(150);
ok("2c. Home says so once", txt(main).includes(AV.MOVED_UP_LINE));

console.log("\nTEST 3 - back to adult");
panel(); click(main.querySelector('[data-dev-age="young-16"]')); click(main.querySelector('[data-dev-age="adult"]'));
ok("3a. the adult version, no month kept", !AV.isYoung() && c().ageGroup === "adult" && c().ageGroupNext === null);

console.log("\nTEST 4 - still closed to new people");
ok("4a. 16-17 and 14-15 stay closed after S5 (opened only on Graeme's word)", AC.YOUNG_OPEN["young-16"] === false && AC.YOUNG_OPEN["young-14"] === false);

console.log(`\n${"=".repeat(60)}\nVERIFY-P41-CLOSE: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
