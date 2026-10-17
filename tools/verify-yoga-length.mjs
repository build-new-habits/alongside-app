/**
 * tools/verify-yoga-length.mjs
 * 17 Oct 2026 v1
 *
 * W6-12 YOGA-LENGTH (Wave 6, personas 2.4 and 2.15; Stage W6 session 6).
 * Yoga & Pilates built 3-7 minutes for every length card (20, 30, 45),
 * two cards could both read "About 4 min", and the finish stored 20 for a
 * 5-minute practice. The cards are now the practice once, twice or three
 * times through, each with its real minutes; the minutes chosen are the
 * minutes played and the minutes handed to the finish.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
let navs = [];
const rtr = { navigate: v => navs.push(v), back() {}, history: [] };
globalThis.window.router = rtr;
Object.defineProperty(globalThis, "router", { value: rtr, configurable: true, writable: true });

function person() {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal"); store.set("name", "Sam");
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("conditions", []); store.set("equipment", []);
}


const yoga = await import(B + "views/yoga-session.js");
const paint = () => { main.innerHTML = yoga.render(); try { yoga.onMount(); } catch {} };
const STYLES = ["flexibility", "strength", "balance", "recovery", "mindful", "pilates"];
let reached = 0;
for (const style of STYLES) {
  person(); store.set("equipment", ["yoga-mat"]);
  paint();
  for (let k = 0; k < 4 && !main.querySelector("[data-focus]"); k++) { click(main.querySelector("#ys-back-btn")); await wait(5); paint(); }
  click(main.querySelector(`[data-focus="${style}"]`)); await wait(5); paint();
  const cards = [...main.querySelectorAll("[data-mins]")];
  if (!cards.length) continue;
  reached++;
  const mins = cards.map(c => +c.dataset.mins);
  const said = cards.map(c => +(txt(c).match(/About (\d+) min/) || [])[1]);
  ok(`${style}-a. the cards' lengths differ and grow (${mins.join(", ")})`, mins.every((m, i) => i === 0 || m > mins[i - 1]) && new Set(said).size === said.length, cards.map(txt).join(" | "));
  click(cards[0]); await wait(5);
  const onceSecs = yoga.currentSessionSeconds();
  if (onceSecs * 3 >= 15 * 60) ok(`${style}-b. one card is 15 minutes or more`, Math.max(...mins) >= 15, mins.join(", "));
  // Each card: the minutes on it are the minutes played (and handed on).
  let mismatch = [];
  for (let i = 0; i < cards.length; i++) {
    paint();
    for (let k = 0; k < 4 && !main.querySelector("[data-mins]"); k++) { click(main.querySelector("#ys-back-btn")); await wait(5); paint(); }
    const c = [...main.querySelectorAll("[data-mins]")][i];
    const cm = +c.dataset.mins;
    click(c); await wait(5);
    const played = Math.max(1, Math.round(yoga.currentSessionSeconds() / 60));
    if (played !== cm) mismatch.push(`${cm} vs ${played}`);
  }
  ok(`${style}-c. each card's minutes are the practice's (what the finish stores)`, mismatch.length === 0, mismatch.join(", "));
}
ok("pc. the styles were reached", reached >= 4, String(reached));
const src = (await import("node:fs")).readFileSync(new URL("../js/views/yoga-session.js", import.meta.url), "utf8");
const hand = src.slice(src.indexOf('store.set("lastFinishedSession"'), src.indexOf('store.set("lastFinishedSession"') + 700);
ok("d. the finish is handed the minutes chosen (selectedMins), now the card's real minutes", /durationMins:\s*selectedMins/.test(hand));

console.log(`\nVERIFY-YOGA-LENGTH: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
