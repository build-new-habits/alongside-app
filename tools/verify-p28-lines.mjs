/**
 * tools/verify-p28-lines.mjs
 * 06 Nov 2026 v1
 *
 * P-28 EMPATHY-THREAD, S5 LINES. E, said lightly (wording A6, approved
 * 05 Nov): one sentence where the Plan is chosen and one where the arc is
 * set, each with In Step's icon, and nothing else for In Step there: no
 * count, progress bar or badge. (The B lines on the finishes went in with
 * S3, touch-once; verify-p28-instep checks them.)
 *
 *   0  Positive controls: the views mount with this person.
 *   1  The upgrade page: the line, word for word, under what the Plan does,
 *      with the two-figures icon.
 *   2  Arc setup: the line, word for word, under the aims, with the icon.
 *   3  Nothing counted: no number, bar or badge beside either line.
 *
 * Red on alongside-v708 (neither line is there).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history; globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
router.navigate = () => {};
const UP = await import(B + "views/upgrade.js");
const { ArcSetupView } = await import(B + "views/arc-setup.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const fs = await import("node:fs");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const T = el => ((el || main).textContent || "").replace(/\s+/g, " ").trim();

// The approved wording, read from BNH-Files, not kept here.
const { schedulePath } = await import(new URL("./bnh-files.mjs", import.meta.url).href);
const path = await import("node:path");
const sched = schedulePath();
const WP = sched ? path.join(path.dirname(sched), "..", "Product/alongside_content_in-step-guide-me_05nov2026_v5.md") : "";
const W = WP && fs.existsSync(WP) ? fs.readFileSync(WP, "utf8") : "";
const PLAN = W.match(/\*\*On the Plan page:\*\* (.+)/)?.[1];
const ARC  = W.match(/\*\*When setting your arc:\*\* (.+)/)?.[1];

function seed(tier) { localStorage.clear(); store.init(); agreed(store); store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "Sentinel-S5"); }

console.log("\nTEST 0 - positive controls");
ok("0a. the approved wording is reachable, with both lines", !!PLAN && !!ARC);
seed("free"); main.innerHTML = UP.render();
ok("0b. the upgrade page mounts", /A coach who knows where you.re going\./.test(T()));
seed("personal"); main.innerHTML = ""; ArcSetupView(router).mount(main);
ok("0c. arc setup mounts on the aims", /What do you want to be able to do\?/.test(T()));

console.log("\nTEST 1 - the upgrade page");
seed("free"); main.innerHTML = UP.render();
const up = main.querySelector("#upg-instep");
ok("1a. the line, word for word", !!up && T(up) === PLAN, T(up));
ok("1b. under what the Plan does", !!up && up.closest('[aria-label="What changes"]') && up === [...up.parentElement.children].at(-1));
ok("1c. with the two-figures icon, hidden from screen readers", (up?.querySelector('[aria-hidden="true"] svg')?.innerHTML.match(/<circle/g) || []).length === 2);

console.log("\nTEST 2 - arc setup");
seed("personal"); main.innerHTML = ""; ArcSetupView(router).mount(main);
const as = main.querySelector("#as-instep");
ok("2a. the line, word for word", !!as && T(as) === ARC, T(as));
ok("2b. under the aims", !!as && as.previousElementSibling?.classList.contains("as-options"));
ok("2c. with the two-figures icon", (as?.querySelector('[aria-hidden="true"] svg')?.innerHTML.match(/<circle/g) || []).length === 2);

console.log("\nTEST 3 - nothing counted");
const near = [up, as].map(el => el ? T(el) + (el.nextElementSibling?.className || "") : "");
ok("3a. no number, bar or badge for In Step on either screen", near.every(t => !/\d|progress|badge|streak/i.test(t)) && !main.querySelector("progress, [role=progressbar]"));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
