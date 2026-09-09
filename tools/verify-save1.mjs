/**
 * tools/verify-save1.mjs
 * 08 Sep 2026 v2
 *
 * v2 - Waits for the preview to ARRIVE rather than for 1600ms, after
 *   verify-checkin3's flat wait was found to be load-dependent the same
 *   afternoon. This one survived the load test; it was the same bet and
 *   is not worth keeping.
 *
 * SAVE-1. Saving tells you it worked.
 *
 * WHAT SHIPPED. The confirmation note sat INSIDE the save form, between
 * the input and the confirm button. The success path hides that form.
 * `.hidden` is `display: none !important`, so the moment a save
 * succeeded, the message it had just written was hidden along with
 * everything else -- and the "Save this one" button had already been
 * hidden when the form opened.
 *
 * The whole block went blank. The session really was saved. The person
 * was told nothing at all.
 *
 * That is what Graeme reported from a handset: "I can't seem to be able
 * to save my own series of sessions." The save was working the whole
 * time; only its evidence was missing. A feature that works silently is
 * indistinguishable from one that is broken, and a person will
 * reasonably conclude the second.
 *
 * `role="status"` did not help. A display:none element is out of the
 * accessibility tree, so there was nothing for a screen reader to
 * announce either. An aria-live region that can be hidden by an
 * ancestor is not a live region.
 *
 * NOTHING IN THE SUITE HAD MOUNTED THE SAVE BLOCK. `sb-save` appeared in
 * no gate. YOUR-OWN shipped the whole feature on 06 Sep with source-text
 * coverage only, which cannot see that one element hides another.
 *
 * VISIBILITY IS CHECKED THROUGH ANCESTORS, not on the element itself.
 * The note never had `.hidden` on it -- its PARENT did. A gate asserting
 * `!note.classList.contains("hidden")` would have passed throughout the
 * entire life of this defect. That is the assertion this file most has
 * to avoid.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = (q) => ({
  matches: /prefers-reduced-motion/.test(q), media: q,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}
});
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [
  ["requestAnimationFrame", (cb) => setTimeout(() => cb(Date.now()), 0)],
  ["cancelAnimationFrame",  (id) => clearTimeout(id)]
]) {
  dom.window[k] = v;
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const sb        = await import(B + "session-builder.js");
const view      = await import(B + "views/session-builder-ui.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const main = document.getElementById("main-content");
globalThis.window.router = { navigate: () => {} };

/**
 * THE ASSERTION THAT MATTERS. Walks to the root looking for a hidden
 * ancestor, because the defect was never on the element itself.
 */
function visible(el) {
  let n = el;
  while (n && n !== document.body) {
    if (n.classList && n.classList.contains("hidden")) return false;
    if (n.hasAttribute && n.hasAttribute("hidden")) return false;
    n = n.parentElement;
  }
  return !!el;
}

const $ = (sel) => main.querySelector(sel);
const click = (sel) => {
  const el = $(sel);
  if (!el) return false;
  el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  return true;
};

async function reachPreview({ tier = "personal" } = {}) {
  localStorage.clear();
  store.init();
  store.set("tier", tier);
  store.set("homeEquipment", ["dumbbells", "resistance-band"]);
  store.set("savedSessions", []);
  const built = sb.buildSession({
    sessionType: "glute", durationMins: 30, equipmentOverride: null, preset: null
  });
  store.set("generatedSession", { session: built, builtAt: new Date().toISOString(), inputs: {} });
  store.set("sessionBuilderPreselect", { mode: "quick", durationMins: 30, returnTo: "today" });
  main.innerHTML = view.render();
  view.onMount();
  click("#sb-quick-build");
  // Wait for the PREVIEW to arrive, not for a number of milliseconds.
  // verify-checkin3 shipped with a flat 60ms wait on 08 Sep: green five
  // times out of five on an idle box, twelve assertions red inside a
  // full-suite run. A gate whose result depends on how busy the machine
  // is teaches people to re-run until it agrees with them.
  await waitFor(() => !!$("#sb-go-btn"), 8000);
}

async function waitFor(pred, maxMs = 5000) {
  for (let waited = 0; waited < maxMs; waited += 25) {
    if (pred()) return true;
    await new Promise(r => setTimeout(r, 25));
  }
  return pred();
}

// ── 0. THE SAVE BLOCK IS REACHABLE ──────────────────────────────────────
console.log("\nTEST 0 - the preview offers a save");

await reachPreview();
ok("0pc. positive control: the preview was reached",
   !!$("#sb-go-btn"),
   "never got to the preview - every assertion below measures nothing");
ok("0a. the save block is on it", !!$("#sb-save-block"));
ok("0b. offering a way in", visible($("#sb-save-open")),
   "the 'Save this one' button is absent or hidden before anything is tapped");
ok("0c. with the form closed until asked for", !visible($("#sb-save-name")),
   "the naming form is open before the person asked to save");

// ── 1. A SUCCESSFUL SAVE SAYS SO ────────────────────────────────────────
console.log("\nTEST 1 - a save that works is visibly a save that worked");

click("#sb-save-open");
ok("1a. the form opens", visible($("#sb-save-name")));
$("#sb-save-name").value = "Tuesday legs";
click("#sb-save-confirm");
await waitFor(() => /saved/i.test(($("#sb-save-note") || {}).textContent || ""), 3000);

ok("1b. it really saved",
   (store.get("savedSessions") || []).some(s => s.name === "Tuesday legs"),
   "nothing reached the store, so 1c is measuring the wrong thing");

const note = $("#sb-save-note");
ok("1c. and there is a confirmation",
   !!note && /saved/i.test(note.textContent || ""),
   `note reads: "${note ? note.textContent.trim() : "(no note element)"}"`);

// THE ONE. Checked through ancestors -- the note itself was never hidden.
ok("1d. THE CONFIRMATION IS ACTUALLY ON SCREEN",
   visible(note),
   "the note has the right words and a hidden ancestor. The save block " +
   "goes blank: the form is hidden on success and the open button was " +
   "hidden when it opened, so the person is told nothing at all and " +
   "reasonably concludes saving is broken");

ok("1e. and it is in the accessibility tree to be announced",
   visible(note) && (note.getAttribute("role") === "status" ||
                     note.getAttribute("aria-live")),
   "role=status on a display:none element announces nothing - an " +
   "aria-live region an ancestor can hide is not a live region");

ok("1f. the form itself closes, so it does not invite a second save",
   !visible($("#sb-save-name")),
   "the naming form is still open after a successful save");

// ── 2. A REFUSED SAVE SAYS WHY, AND LETS THEM FIX IT ────────────────────
console.log("\nTEST 2 - a save that is refused explains itself");

await reachPreview();
click("#sb-save-open");
$("#sb-save-name").value = "   ";
click("#sb-save-confirm");
await waitFor(() => !!(($("#sb-save-note") || {}).textContent || "").trim(), 3000);

const errNote = $("#sb-save-note");
ok("2a. nothing was saved",
   (store.get("savedSessions") || []).length === 0);
ok("2b. the reason is given in its own words",
   !!errNote && /needs a name/i.test(errNote.textContent || ""),
   `note reads: "${errNote ? errNote.textContent.trim() : "-"}"`);
ok("2c. and it is on screen", visible(errNote),
   "moving the note out of the form must not cost the error path its message");
ok("2d. the form stays open so the name can be fixed",
   visible($("#sb-save-name")),
   "the person is told what is wrong and given no way to correct it");

// ── 3. FREE IS NOT OFFERED A SAVE IT CANNOT MAKE ────────────────────────
console.log("\nTEST 3 - free is not shown a save that would refuse it");

await reachPreview({ tier: "free" });
ok("3pc. positive control: free still reaches the preview",
   !!$("#sb-go-btn"),
   "free cannot build at all, which would contradict R4");
ok("3a. and is offered no save block",
   !$("#sb-save-block"),
   "free composes freely and the Plan is what KEEPS it (R4, 20 Aug). " +
   "Offering a control whose only outcome is a refusal is a sales pitch " +
   "wearing a feature's clothes");

console.log(fails === 0
  ? "\nSAVE-1: all assertions pass\n"
  : `\nSAVE-1: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
