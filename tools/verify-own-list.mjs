/**
 * tools/verify-own-list.mjs
 * 28 Sep 2026 v1
 *
 * Work list 8, OWN-LIST. Finding a saved session when you have lots.
 *
 * Measured on v557: Your own sessions was one long list, newest first,
 * with nothing to narrow it. Twenty saved sessions is twenty cards of
 * about 300px each -- roughly six thousand pixels of scrolling to find
 * "Sunday legs", with no way to look for the one with the goblet squat.
 *
 * Driven through the real view with twenty real saved sessions:
 *   - a search field, labelled, once the list is long enough to need it
 *     (six or more), and not before (a search box over three cards is
 *     furniture);
 *   - typing narrows the list, by the session's name OR a movement in it;
 *   - the order holds (newest first) as it narrows;
 *   - the count is said once, politely, not on every keystroke's repaint;
 *   - nothing matching says so and offers a way back;
 *   - the search survives a delete, and focus is never lost.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "InputEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
dom.window.scrollTo = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const view = await import(B + "views/saved-sessions.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();

const byId = id => EXERCISES.find(e => e.id === id);
const pick = pred => EXERCISES.filter(pred).slice(0, 3).map(e => e.id);
const SQUAT = EXERCISES.find(e => /goblet squat/i.test(e.name));
const PLAIN = pick(e => !/squat/i.test(e.name) && e.movementPattern === "push");
const NAMES = ["Sunday legs", "Monday upper", "Quick core", "Hotel room", "Park intervals", "Back care",
  "Long Saturday", "Before work", "Gym push", "Gym pull", "Stretch and breathe", "Rainy day",
  "Knee friendly", "Twenty minutes", "Garden circuit", "Travel kit", "Hips and back", "Easy Friday",
  "Heavy day", "Last one saved"];

function seed(n = 20) {
  view.onUnmount?.();
  localStorage.clear(); store.init();
  store.set("tier", "personal"); store.set("onboardingComplete", true);
  const t0 = Date.now() - n * 3600e3;
  store.set("savedSessions", NAMES.slice(0, n).map((name, i) => ({
    id: `own_${i}`, name, sessionType: "full", durationMins: 30,
    equipment: [], exerciseIds: i === 3 ? [SQUAT.id, ...PLAIN.slice(0, 1)] : PLAIN,
    createdAt: new Date(t0 + i * 3600e3).toISOString(), lastUsedAt: null
  })));
  main.innerHTML = view.render(); view.onMount();
}
const field = () => main.querySelector('input[type="search"]');
const shown = () => [...main.querySelectorAll(".club-rooms > li")].filter(li => !li.hidden).map(li => txt(li.querySelector("h2")));
const type = async q => {
  const f = field(); if (!f) return; f.focus(); f.value = q;
  f.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  await wait(450);
};

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - twenty real saved sessions on the real list");
seed();
ok("0a. all twenty render, newest first", shown().length === 20 && shown()[0] === "Last one saved" && shown().at(-1) === "Sunday legs",
   shown().slice(0, 3).join(", "));
ok("0b. the fixture's movements resolve (a goblet squat exists)", !!SQUAT && PLAIN.length > 0);

// ── 1. THE FIELD ────────────────────────────────────────────────────────
console.log("\nTEST 1 - a labelled search field, when there are enough to need one");
const f = field();
const label = f && main.querySelector(`label[for="${f.id}"]`);
ok("1a. a search field with a visible label", !!f && !!label && /find/i.test(txt(label)), txt(label));
ok("1b. it sits above the list", !!f && !!(f.compareDocumentPosition(main.querySelector(".club-rooms")) & 4));
ok("1c. it is not autocomplete-noisy and is large enough to tap", f?.getAttribute("autocomplete") === "off" && f?.classList.contains("form-input"));
seed(5);
ok("1d. five saved: no search, just the list", !field() && shown().length === 5);
seed(6);
ok("1e. six saved: the search appears", !!field());

// ── 2. IT NARROWS ───────────────────────────────────────────────────────
console.log("\nTEST 2 - typing narrows the list, and the order holds");
seed();
await type("gym");
ok("2a. by name: 'gym' finds the two gym sessions", JSON.stringify(shown()) === JSON.stringify(["Gym pull", "Gym push"]), shown().join(", "));
await type("GYM  ");
ok("2b. case and stray spaces do not matter", shown().length === 2);
await type("goblet");
ok("2c. by a movement in it: 'goblet' finds the one with a goblet squat", JSON.stringify(shown()) === JSON.stringify(["Hotel room"]), shown().join(", "));
await type("day");
const days = shown();
ok("2d. newest first still, as it narrows", days.length >= 3 &&
   JSON.stringify(days) === JSON.stringify(NAMES.filter(n => /day/i.test(n)).reverse()), days.join(", "));
await type("");
ok("2e. clearing it brings every session back, in order", shown().length === 20 && shown()[0] === "Last one saved");

// ── 3. WHAT IT SAYS ─────────────────────────────────────────────────────
console.log("\nTEST 3 - the count is said once, politely; nothing found says so");
const live = main.querySelector("[aria-live='polite'][data-own-count]");
await type("gym");
ok("3a. a polite live region says how many match", !!live && txt(live) === "2 of 20 sessions", txt(live));
ok("3b. and the field is described by it", field()?.getAttribute("aria-describedby") === live?.id);
await type("zzzz");
const none = main.querySelector("[data-own-none]");
ok("3c. nothing matching: says so in words, with what was typed", !!none && !none.hidden && /zzzz/.test(txt(none)) && txt(live) === "No sessions match", txt(none));
none?.querySelector("button")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
await wait(50);
ok("3d. and Clear the search brings the list back, with focus in the field", shown().length === 20 && field()?.value === "" && document.activeElement === field());

// ── 4. IT SURVIVES WHAT HAPPENS NEXT ────────────────────────────────────
console.log("\nTEST 4 - the search survives a delete; focus is never lost");
await type("gym");
main.querySelector('[data-delete-id="own_8"]')?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
main.querySelector('[data-delete-confirm="own_8"]')?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
await wait(50);
ok("4a. after deleting one of the two, the search still stands and one is left", field()?.value === "gym" && JSON.stringify(shown()) === JSON.stringify(["Gym pull"]), `${field()?.value} | ${shown().join(", ")}`);
ok("4b. the count agrees", txt(main.querySelector("[data-own-count]")) === "1 of 19 sessions", txt(main.querySelector("[data-own-count]")));
ok("4c. focus went somewhere real (the heading), not the top of the document", document.activeElement?.tagName === "H1");
view.onUnmount?.();
main.innerHTML = view.render(); view.onMount();
ok("4d. leaving and coming back starts clean", field()?.value === "" && shown().length === 19);

console.log("");
if (fails) { console.log(`OWN-LIST: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`OWN-LIST: all ${passes} assertions pass\n`);
process.exit(0);
