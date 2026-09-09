/**
 * tools/verify-headings.mjs
 * 08 Sep 2026 v1
 *
 * A11Y-HEADER. Every screen has a heading, and the outline holds.
 *
 * WHAT WAS WRONG. `.workout-header-title` was a `<span>` in 11 views and
 * a heading in NONE, while the rest of the app uses 48 `<h1>` and 67
 * `<h2>`. It is the screen's title -- styled as one, positioned as one,
 * read as one by anybody looking at it -- and it existed in presentation
 * only. 42 sites.
 *
 * WCAG 2.2 AA 1.3.1: information conveyed through presentation must be
 * programmatically determinable. Heading navigation is how a screen
 * reader user skims a page, and on these screens there was nothing to
 * skim: the quick build scaffold reported ZERO headings the morning this
 * was found.
 *
 * ── WHAT THIS ASSERTS, AND WHY IT IS THE OUTLINE ────────────────────
 *
 * Not "a heading exists". PROGRESS-2 was a screen full of headings whose
 * LEVELS were wrong -- h1 > h3 > h2 -- and a count would have called it
 * fine. A heading level is only right relative to its neighbours, so
 * this mounts each view and reads the outline it actually renders.
 *
 * Exactly one h1, and no level skipped on the way down.
 *
 * ── TWO MOUNT SIGNATURES ────────────────────────────────────────────
 *
 * This codebase has both View(router).mount(container) and
 * View(container). A harness that knew only the first reported two views
 * as unmountable, which reads exactly like a view that has no headings
 * and is nothing of the sort. Both are tried, and test 0 fails loudly if
 * a view cannot be mounted at all rather than quietly scoring it.
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
globalThis.history = dom.window.history;
for (const [k, v] of [
  ["requestAnimationFrame", (cb) => setTimeout(() => cb(Date.now()), 0)],
  ["cancelAnimationFrame",  (id) => clearTimeout(id)]
]) {
  dom.window[k] = v;
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const _r = { navigate: () => {} };
globalThis.window.router = _r;
Object.defineProperty(globalThis, "router", { value: _r, configurable: true, writable: true });
const main = document.getElementById("main-content");

// The 11 views that carried .workout-header-title as a span.
const VIEWS = [
  "community-impact", "walk-session", "running-session", "annual-reflection",
  "yoga-session", "swim-session", "core-session", "breathing-session",
  "cycle-session", "in-step"
];

function seed() {
  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("name", "Graeme");
  store.set("homeEquipment", ["dumbbells"]);
}

async function mount(name) {
  seed();
  const m = await import(B + `views/${name}.js`);
  main.innerHTML = "";
  if (typeof m.render === "function") {
    main.innerHTML = m.render();
    return true;
  }
  const factory = Object.values(m)
    .find(x => typeof x === "function" && /View$/.test(x.name));
  if (!factory) return false;
  try { factory(_r).mount(main); }
  catch { main.innerHTML = ""; factory(main); }
  return true;
}

const outlineOf = () =>
  [...main.querySelectorAll("h1,h2,h3,h4,h5,h6")]
    .map(h => ({ level: Number(h.tagName[1]), text: (h.textContent || "").trim() }));

console.log("\nTEST 0 - every view mounts, so nothing is scored silently");

const mounted = [];
for (const v of VIEWS) {
  let reached = false;
  try { reached = await mount(v); } catch (e) {
    ok(`0. ${v} mounts`, false, `threw: ${e.message.slice(0, 80)}`);
    continue;
  }
  ok(`0. ${v} mounts`, reached && (main.textContent || "").trim().length > 0,
     "rendered nothing - an unmountable view reads exactly like one with no " +
     "headings, and scoring it either way would be a lie");
  if (reached) mounted.push({ name: v, outline: outlineOf() });
}

console.log("\nTEST 1 - exactly one h1 per screen");

for (const { name, outline } of mounted) {
  const h1s = outline.filter(h => h.level === 1);
  ok(`1. ${name}`, h1s.length === 1,
     h1s.length === 0
       ? "no h1: this screen's title exists in presentation only, so there " +
         "is nothing to navigate to. WCAG 2.2 AA 1.3.1"
       : `${h1s.length} h1s: ${h1s.map(h => h.text.slice(0, 20)).join(" / ")}`);
}

console.log("\nTEST 2 - no heading level is skipped");

// PROGRESS-2 was a screen full of headings whose LEVELS were wrong --
// h1 > h3 > h2. A count of headings called that fine. A level is only
// right relative to its neighbours.
for (const { name, outline } of mounted) {
  ok(`2. ${name}`,
     outline.every((h, i) => i === 0 || h.level <= outline[i - 1].level + 1),
     `outline: ${outline.map(h => `h${h.level} ${h.text.slice(0, 18)}`).join(" > ")}`);
}

console.log("\nTEST 3 - the title is a heading in the source, not a styled span");

// Belt to test 1's braces. These views render many phases and a mount
// reaches one of them; a span left behind on a phase the fixture does
// not reach would pass every assertion above.
const fs = await import("node:fs");
const R  = new URL("../", import.meta.url);
const stragglers = [];
for (const v of [...VIEWS, "session-builder-ui"]) {
  const src = fs.readFileSync(new URL(`js/views/${v}.js`, R), "utf8");
  const spans = (src.match(/<span class="workout-header-title"/g) || []).length;
  if (spans) stragglers.push(`${v} (${spans})`);
}
ok("3a. no phase still carries it as a span", stragglers.length === 0,
   `still spans in: ${stragglers.join(", ")}`);

// COMMENTS STRIPPED FIRST. The rule carries a comment explaining why
// margin:0 is load-bearing -- and the first version of this assertion
// matched THAT, so deleting the declaration left the gate green. A gate
// that passes on its own documentation is worse than no gate: it reads
// as coverage. Found by reversal testing, which is the only thing that
// could have found it.
const shared = fs.readFileSync(new URL("css/components/session-shared.css", R), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "");
ok("3b. and the heading's margin is reset",
   /\.workout-header-title\s*\{[^}]*margin:\s*0/.test(shared),
   "an h1 carries a UA default of 0.67em top and bottom where a span " +
   "carries none - without margin:0 the element change alone pushes all " +
   "42 of these headers out of shape inside their flex rows");

console.log(fails === 0
  ? "\nA11Y-HEADER: all assertions pass\n"
  : `\nA11Y-HEADER: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
