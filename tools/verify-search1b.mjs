/**
 * tools/verify-search1b.mjs
 * 12 Sep 2026 v1
 *
 * SEARCH-1b. The search box in the swap sheet.
 *
 * Graeme, in a gym on 12 Sep: thirteen fixed body-area groups were the
 * only way to reach an alternative, and he wanted to search by muscle --
 * "lats", "quads" -- in everyday or technical words. SEARCH-1a shipped
 * the vocabulary. This is the box.
 *
 * ── THE THREE THINGS IT MUST DO ─────────────────────────────────────
 *
 * From the decisions document, and each has its own test here:
 *
 *   1. NAME THE AREA IT SEARCHED. "Lats" returns upper-back work, because
 *      the library has no latissimus area. SEARCH-1a calls that mapping
 *      BROADER and says the caller must say so. Unstated, the results
 *      look wrong.
 *   2. SAY WHEN IT DOES NOT KNOW A WORD, rather than showing an empty
 *      panel. The vocabulary refuses unknown terms on purpose so this can.
 *   3. NEVER EMPTY THE PANEL SILENTLY. A filter combination can still
 *      produce nothing even for a known word, and that needs a sentence.
 *
 * ── IT DRIVES THE REAL SHEET ────────────────────────────────────────
 *
 * jsdom, real clicks, real keystrokes, the real store. A search box is
 * the kind of thing that reads perfectly and behaves badly -- the caret
 * fault in test 5 is exactly that, and no source check would have found
 * it.
 */
import { JSDOM } from "jsdom";
const dom = new JSDOM(
  '<!doctype html><html><body><div id="main-content"></div></body></html>',
  { url: "https://example.org/" }
);
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
globalThis.history = dom.window.history;
for (const k of ["HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "navigator"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = (q) => ({ matches: false, media: q,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const click = el => el && el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const type = (value) => {
  const box = $("#sb-swap-search");
  if (!box) return false;
  box.value = value;
  box.selectionStart = box.selectionEnd = value.length;
  box.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  return true;
};
const names = () => $$(".sb-swap-option-name").map(n => n.textContent.trim());
const status = () => ($("#sb-swap-search-status")?.textContent || "").trim();

const { store } = await import("../js/store.js");
const SB = await import("../js/session-builder.js");
const ui = await import("../js/views/session-builder-ui.js");
const paint = () => { $("#main-content").innerHTML = ui.render(); ui.onMount(); };

const KIT = ["dumbbells", "resistance-band", "bench", "barbell", "cable-machine"];

console.log("\nSEARCH-1b — searching the swap sheet\n");

console.log("TEST 0 — get into the sheet, on a real session");

store.init();
store.set("tier", "personal");
store.set("conditions", []);
store.set("conditionPainScores", {});
store.set("equipment", KIT);
store.set("homeEquipment", KIT);

paint();
click($$(".sb-type-tile").find(b => b.dataset.type === "full"));
click($("#sb-location-continue-btn"));
click($$(".sb-duration-btn").find(b => b.dataset.mins === "30"));
click($("#sb-build-btn"));
click($$(".sb-buildmode-btn").find(b => b.dataset.mode === "coach"));

// The build is ASYNCHRONOUS -- the view shows "Building your full body,
// one moment" and paints the preview on a timer. The first draft of this
// gate read the DOM immediately and every assertion below failed on an
// empty screen, which looks exactly like a broken feature.
await new Promise(r => setTimeout(r, 1200));

const slots = $$("[data-swap-index]");
ok("0a. a built session with swappable slots", slots.length > 0, `${slots.length} slots`);
click(slots[0]);
ok("0b. the swap sheet is open", !!$("[data-swap-to]"), "no options rendered");
ok("0c. POSITIVE CONTROL: it has plenty to search through",
   $$("[data-swap-to]").length > 0 && $$("[data-swap-group]").length > 1,
   `${$$("[data-swap-to]").length} options, ${$$("[data-swap-group]").length} groups`);

console.log("\nTEST 1 — the box exists and is a real one");

ok("1a. a labelled search input", !!$("#sb-swap-search") &&
   $("#sb-swap-search").getAttribute("type") === "search");
ok("1b. with a visible label, not just a placeholder",
   !!$('label[for="sb-swap-search"]') &&
   ($('label[for="sb-swap-search"]').textContent || "").trim().length > 5);
ok("1c. and a status region that exists BEFORE it has anything to say",
   !!$("#sb-swap-search-status") && $("#sb-swap-search-status").getAttribute("role") === "status",
   "a live region inserted only when it gains text is often not announced");
ok("1d. the input points at that region", $("#sb-swap-search")?.getAttribute("aria-describedby") === "sb-swap-search-status");
ok("1e. nothing is said before anything is typed", status() === "");

console.log("\nTEST 2 — a muscle word, and it says which area it searched");

{
  const before = $$("[data-swap-to]").length;
  type("lats");
  const after = names();
  ok("2a. the list changes", $$("[data-swap-to]").length !== before || after.length > 0,
     `${before} -> ${$$("[data-swap-to]").length}`);
  ok("2b. it found something", after.length > 0, status());
  ok("2c. and it NAMES THE AREA, because upper-back is wider than \"lats\"",
     /searched/i.test(status()) && /back/i.test(status()), status());
  ok("2d. the count is stated", /\d/.test(status()), status());
}

console.log("\nTEST 3 — an exercise name works too");

{
  // The word is taken FROM this session's own options rather than assumed.
  // The first draft typed "row" and failed: the slot under test had no
  // rowing movement in its pool, so the box correctly said it did not know
  // the word -- a broken fixture reading as a broken feature.
  type("");
  const sample = names()[0] || "";
  const word   = (sample.split(/[\s—-]+/).find(w => w.length > 4) || sample).toLowerCase();
  ok("3a. CONTROL: there is a real option name to search for", word.length > 3, `sample "${sample}"`);
  type(word);
  const found = names();
  ok("3b. names match directly",
     found.length > 0 && found.some(n => n.toLowerCase().includes(word)),
     `typed "${word}", got ${found.slice(0, 4).join(", ") || status()}`);
}

console.log("\nTEST 4 — it refuses what it does not know, out loud");

{
  type("banana");
  ok("4a. nothing is offered", $$("[data-swap-to]").length === 0, names().slice(0, 3).join(", "));
  ok("4b. and it SAYS it does not know the word", /don't know/i.test(status()), status());
  ok("4c. naming what was typed", /banana/i.test(status()), status());
  ok("4d. and pointing somewhere useful", /body area|exercise name|muscle/i.test(status()), status());
  ok("4e. the body-area chips are still on screen to fall back to",
     $$("[data-swap-group]").length > 1, "the way back must not disappear with the results");
}

console.log("\nTEST 5 — typing, driven");

{
  // A rerender on every keystroke rebuilds the whole view. The first
  // draft dropped focus and reset the caret, so typing "lats" one letter
  // at a time gave "stal" in the box. Only a driven test sees this.
  type("");
  const box = $("#sb-swap-search");
  box.value = "la";
  box.selectionStart = box.selectionEnd = 2;
  box.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  const after = $("#sb-swap-search");
  ok("5a. focus stays in the box after a keystroke",
     document.activeElement === after, `focus is on ${document.activeElement?.id || document.activeElement?.tagName}`);
  ok("5b. and the caret stays where it was", after.selectionStart === 2, `caret at ${after.selectionStart}`);
  ok("5c. the value survives the rerender", after.value === "la", after.value);
  ok("5d. a partial word already finds things, rather than waiting for a return key",
     $$("[data-swap-to]").length > 0);
}

console.log("\nTEST 6 — the search is a way through, not a setting");

{
  type("quads");
  ok("6a. CONTROL: a search is active", $$("[data-swap-to]").length > 0 && status() !== "");
  const chip = $$("[data-swap-group]")[0];
  const label = chip.textContent.trim();
  click(chip);
  ok("6b. tapping a body area clears the search", ($("#sb-swap-search")?.value || "") === "",
     `box still reads "${$("#sb-swap-search")?.value}" after tapping ${label}`);
  ok("6c. and the sheet is showing that area", $$("[data-swap-to]").length > 0);

  type("quads");
  click($("#sb-swap-close-btn"));
  click($$("[data-swap-index]")[0]);
  ok("6d. closing and reopening the sheet starts empty",
     ($("#sb-swap-search")?.value || "") === "" && status() === "",
     "a search is a way through one list, not something to remember");
}

console.log("\nTEST 7 — a known word with nothing behind it still explains itself");

{
  // The branch where the word IS known and the pool simply has nothing:
  // a blank panel with no sentence is the worst of the three outcomes.
  //
  // The first draft typed one term and skipped the whole test when that
  // term happened to match -- a vacuous pass that the reversal caught,
  // because deleting this branch of _searchStatus() left the gate green.
  // It now tries several thin terms and FAILS if none of them reaches the
  // branch, rather than quietly proving nothing.
  const THIN = ["pelvic floor", "achilles", "sciatica", "shin splints",
                "rotator cuff", "it band", "piriformis", "wrists"];
  let reached = null;
  for (const term of THIN) {
    type(term);
    if ($$("[data-swap-to]").length === 0) { reached = term; break; }
  }
  ok("7a. FIXTURE REACH: a known word with no matches in this pool was found",
     reached !== null, `all of ${THIN.join(", ")} matched something`);
  if (reached) {
    ok(`7b. the empty result is explained, never silent ("${reached}")`,
       status().length > 20, status());
    ok("7c. and it does not pretend the word was unknown",
       !/don't know/i.test(status()), status());
    ok("7d. it points back at the body areas", /body area/i.test(status()), status());
  }
}

console.log(`\n  ${fails === 0 ? "ALL PASS" : fails + " RED"}\n`);
process.exit(fails ? 1 : 0);
