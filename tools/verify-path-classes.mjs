import { createRequire as __cr } from "node:module";
/**
 * tools/verify-path-classes.mjs
 * 01 Nov 2026 v1
 *
 * P-13 Classes. Graeme approved mock-up v1 on 01 Nov ("Yes, build it";
 * Product/alongside_classes_mockup_01nov2026_v1.html). Drives the real views.
 *
 *   1. The Plan's list: one row per class on offer, saying how long, where
 *      you'll be and what it is for (Your arc where it feeds it); nothing to
 *      start on the list (there were twenty buttons).
 *   2. A class's own page: Full or Shorter as one choice (the minutes and
 *      the parts follow it); Before you start in sentences, never the
 *      hyphenated flags; its parts with their minutes and the stick figure
 *      where a part has one; Start starts that length in the player.
 *   3. ‹ Back returns to the list; opening Classes again starts at the list.
 *   4. Not today still names a class left out, and why.
 *   5. The player on the Plan: Exit, the class's name as the heading, the
 *      part's figure; Pause and Move on unchanged.
 *   6. Free's Classes and player, byte for byte as on alongside-v693.
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "SVGElement"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.speechSynthesis = undefined;

const B = new URL("../js/", import.meta.url).href;
const ROOT = new URL("..", import.meta.url).pathname;
const { store } = await import(B + "store.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { router } = await import(B + "router.js");
const CL = await import(B + "views/class-list.js");
const CP = await import(B + "views/class-player.js");
const { CLASSES } = await import(B + "data/classes/index.js");
const { lighterMinutes } = await import(B + "data/class-contract.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
let navs = [];
router.navigate = v => navs.push(v);
function fixture(tier = "personal", extra = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  for (const [k, v] of Object.entries(extra)) store.set(k, v);
  navs = [];
}
const list = () => { main.innerHTML = CL.render(); CL.onMount(); };
const ground = CLASSES.find(c => c.id === "class-ground-001");

// ── 1 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 1 - the Plan's list: one row each, nothing to start yet");
fixture("personal", { arc: { active: true, aimId: "injury-confidence", strands: ["trusting-body"], startedAt: new Date().toISOString() } });
list();
const rows = [...main.querySelectorAll("[data-class]")];
ok("1a. one row per class on offer", rows.length === CLASSES.length, `${rows.length} of ${CLASSES.length}`);
ok("1b. nothing to start on the list", !main.querySelector("[data-start]"));
const g = rows.find(r => r.dataset.class === ground.id);
ok("1c. each row says how long, where, and what it is for", /15 min · on the floor/.test(txt(g)) && /For trusting your body again/.test(txt(g)), txt(g));
ok("1d. Your arc where it feeds it, and only there", /Your arc/.test(txt(g)) && rows.filter(r => /Your arc/.test(txt(r))).length === CLASSES.filter(c => c.serves === "trusting-body").length);
ok("1e. no hyphenated flag words on the list", !/[a-z]+-[a-z]+-[a-z]+/.test(txt(main.querySelector(".path-list"))), txt(main).slice(0, 160));

// ── 2 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 2 - a class's own page");
click(main.querySelector(`[data-class="${ground.id}"]`));
ok("2a. Ground's page: its name the heading, what it is for", txt(main.querySelector("h1")) === "Ground" && /For trusting your body again\. Part of your arc\./.test(txt(main)));
const full = main.querySelector('input[name="cl-len"][value="full"]'), short = main.querySelector('input[name="cl-len"][value="short"]');
ok("2b. Full or Shorter, one choice, with their minutes", !!full?.checked && /Full · 15 min/.test(txt(main)) && new RegExp(`Shorter · ${Math.round(lighterMinutes(ground))} min`).test(txt(main)));
const before = [...main.querySelectorAll(".class-before p")].map(txt);
ok("2c. Before you start in sentences, never the flags", before.length >= 3 && before.every(t => /\.$/.test(t) && !/\w-\w/.test(t)) && before.includes("Closing your eyes is offered, never needed."), JSON.stringify(before));
const parts = [...main.querySelectorAll(".class-part")];
ok("2d. its parts, each with its minutes", parts.length === ground.sections.length && parts.every(p => /\d+ min/.test(txt(p))));
const cat = parts.find(p => /Cat-Cow/.test(txt(p)));
ok("2e. a part with a figure shows it; a part without has none", !!cat?.querySelector("svg") && !parts.find(p => /Stillness/.test(txt(p)))?.querySelector("svg"));
short.checked = true; short.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
ok("2f. Shorter: the shorter class's parts, and Start plays it", main.querySelectorAll(".class-part").length === ground.sections.length - ground.lighter.omitSections.length && main.querySelector("[data-start]")?.dataset.lighter === "1");
navs = []; click(main.querySelector("[data-start]"));
ok("2g. Start opens the player", navs.join() === "class-player", JSON.stringify(navs));

// ── 3 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 3 - back to the list, and a fresh visit starts there");
fixture(); list(); click(main.querySelector(`[data-class="${ground.id}"]`)); click(main.querySelector("#cl-list"));
ok("3a. ‹ Back returns to the list", main.querySelectorAll("[data-class]").length > 0 && txt(main.querySelector("h1")) === "Classes");
click(main.querySelector(`[data-class="${ground.id}"]`)); list();
ok("3b. opening Classes again starts at the list", txt(main.querySelector("h1")) === "Classes");

// ── 4 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 4 - Not today");
fixture("personal", { conditions: ["lower-back"], conditionPainScores: { "lower-back": 7 } });   // held without a Bad day (8 asks Rest today first, W5-2)
list();
const held = main.querySelector(".class-list__held");
ok("4pc. a sore lower back holds some classes back", !!held && held.querySelectorAll(".class-list__row--held").length > 0);
ok("4a. each one left out is named, with why", !!held && /Not today/.test(txt(held)) && [...held.querySelectorAll(".class-list__row--held")].every(r => /leaving out for you/.test(txt(r))), txt(held).slice(0, 160));

// ── 5 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 5 - the player, on the Plan");
fixture(); CP.startClass(ground.id, { lighter: false });
main.innerHTML = CP.render(); try { CP.onMount(); } catch {}
const exitBtn = main.querySelector("#cp-exit");
ok("5a. Exit, its spoken name says Exit and the class", txt(exitBtn) === "Exit" && exitBtn.classList.contains("plan-exit") && /^Exit Ground/.test(exitBtn.getAttribute("aria-label")));
ok("5b. the class's name is the one heading", main.querySelectorAll("h1").length === 1 && txt(main.querySelector("h1")) === "Ground");
ok("5c. Pause and Move on are there", !!main.querySelector("#cp-pause") && !!main.querySelector("#cp-skip"));
try { CP.onUnmount?.(); } catch {}

// ── 6 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 6 - Free, as it was on alongside-v693");
const fresh = async (code, name) => { const t = new URL(`../js/views/${name}__chk.js`, import.meta.url); writeFileSync(t, code); try { return await import(t.href); } finally { unlinkSync(t); } };
for (const [file, draw] of [["class-list", m => { main.innerHTML = m.render(); return main.innerHTML; }],
                             ["class-player", m => { m.startClass(ground.id, { lighter: false }); main.innerHTML = m.render(); return main.innerHTML; }]]) {
  let old = ""; try { old = execSync(`git -C "${ROOT}" show d173e53:js/views/${file}.js`, { encoding: "utf8" }); } catch {}
  const OLD = await fresh(old, file + "_old"), NOW = await fresh(readFileSync(`${ROOT}js/views/${file}.js`, "utf8"), file + "_now");
  fixture("free"); const a = draw(OLD); fixture("free"); const b = draw(NOW);
  let at = 0; while (at < a.length && a[at] === b[at]) at++;
  ok(`6. Free ${file}: the same, byte for byte`, !!old && a === b && a.length > 200, `differs at ${at}: ${a.slice(at - 40, at + 40)} | ${b.slice(at - 40, at + 40)}`);
}

console.log(`\n${"=".repeat(60)}\nVERIFY-PATH-CLASSES: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
