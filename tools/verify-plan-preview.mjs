/**
 * tools/verify-plan-preview.mjs
 * 04 Oct 2026 v1
 *
 * D-2 PLAN-PREVIEW. On the device test, Graeme's wife wanted to see what an
 * exercise was and how to do it before starting. She tapped the exercise on
 * the plan, where Swap is, and nothing happened.
 *
 * Now each exercise on Today's plan opens a sheet: Why, What to watch out
 * for, How, and the video link, in that order, on both tiers. Swap it (Plan
 * only, where the row can swap) opens that row's swap list. Keep it, Close
 * and Escape close the sheet and put focus back on the exercise. Nothing
 * starts and nothing is logged by looking.
 *
 * Driven through the REAL CoachProposalView and the real session builder.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = (q) => ({ matches: /prefers-reduced-motion/.test(q), media: q,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();

const FULL_GYM = ["dumbbells-light","dumbbells-medium","dumbbells-heavy","adjustable-dumbbells",
  "kettlebell-light","kettlebell-medium","kettlebell-heavy","barbell","ez-curl-bar",
  "band-light","band-medium","band-heavy","bench-flat","bench-adjustable","pull-up-bar",
  "stability-ball","foam-roller","gym-membership"];

function fixture(tier) {
  localStorage.clear(); store.init();
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("homeEquipment", []); store.set("gymEquipment", FULL_GYM);
  store.set("equipment", FULL_GYM);
  store.set("availableTime", "standard");
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
}

function mount() {
  const main = document.getElementById("main-content"); main.innerHTML = "";
  const navs = [];
  const view = CoachProposalView({ navigate: v => navs.push(v), back() {} });
  view.mount(main);
  return { main, navs };
}

const sheet = main => main.querySelector("#cp-xprev");
const opener = (main, i) => main.querySelector(`[data-preview="${i}"]`);
const esc = () => document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
const snap = () => JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]));

for (const tier of ["personal", "free"]) {
  const plan = tier === "personal";
  console.log(`\nTIER ${tier}`);
  fixture(tier);
  let { main, navs } = mount();
  const rows = [...main.querySelectorAll(".cp-plan__row")];
  ok(`${tier} 0. the plan lists exercises`, rows.length > 0, txt(main).slice(0, 200));

  // 1. Every row has its own opener, a real button, named by the exercise.
  ok(`${tier} 1a. every exercise on the plan is a button that opens it`,
     rows.length > 0 && rows.every(r => {
       const b = r.querySelector("[data-preview]");
       return b && b.tagName === "BUTTON" && b.getAttribute("aria-haspopup") === "dialog" &&
              txt(b).startsWith(txt(r.querySelector(".cp-plan__name")));
     }));
  ok(`${tier} 1b. no sheet before a tap`, !sheet(main));

  // Pick a row with a written why, watch-outs and instructions.
  const idx = rows.findIndex(r => r.dataset.exerciseId);
  const name = txt(rows[idx].querySelector(".cp-plan__name"));
  if (!opener(main, idx)) { ok(`${tier} 2. the exercise can be tapped`, false, "no [data-preview] on the plan"); continue; }
  const before = snap();
  opener(main, idx).click();
  const s = sheet(main);
  ok(`${tier} 2a. the tap opens a modal sheet named by the exercise`,
     !!s && s.getAttribute("role") === "dialog" && s.getAttribute("aria-modal") === "true" &&
     txt(document.getElementById(s.getAttribute("aria-labelledby"))) === name,
     s ? s.outerHTML.slice(0, 200) : "no sheet");
  ok(`${tier} 2b. focus moves to the exercise name`, document.activeElement?.id === "cp-xprev-h");
  const heads = s ? [...s.querySelectorAll(".cp-xprev__h")].map(txt) : [];
  ok(`${tier} 2c. Why, What to watch out for, How, in that order`,
     JSON.stringify(heads) === JSON.stringify(["Why", "What to watch out for", "How"]), JSON.stringify(heads));
  ok(`${tier} 2d. each part has its words: a why, a list of watch-outs, numbered steps`,
     !!s && txt(s.querySelector('[data-xprev-part="why"] p')).length > 20 &&
     s.querySelectorAll('[data-xprev-part="watch"] li').length > 0 &&
     s.querySelectorAll('[data-xprev-part="how"] ol li').length > 0);
  ok(`${tier} 2e. What to watch out for is in the hazard box`,
     !!s?.querySelector('[data-xprev-part="watch"].cp-xprev__part--hazard'));
  const vid = s?.querySelector(".cp-xprev__video");
  ok(`${tier} 2f. the video link is there, and says it opens a new tab`,
     !!vid && /youtube\.com\/results/.test(vid.getAttribute("href")) && vid.target === "_blank" &&
     /Watch how to do this/.test(txt(vid)) && /new tab/.test(txt(vid)));
  ok(`${tier} 2g. the plan behind is inert while the sheet is open`,
     !!main.querySelector(".cp-preview-panel__content[inert]"));
  ok(`${tier} 2h. Swap it only on Plan; Keep it on both`,
     !!s?.querySelector("#cp-xprev-keep") && !!s?.querySelector("#cp-xprev-swap") === plan);
  ok(`${tier} 2i. looking starts nothing and writes nothing`, navs.length === 0 && snap() === before);

  // 3. Keep it closes, focus back to the exercise.
  s.querySelector("#cp-xprev-keep").click();
  ok(`${tier} 3a. Keep it closes the sheet`, !sheet(main) && !main.querySelector("[inert]"));
  ok(`${tier} 3b. and focus goes back to that exercise`, document.activeElement === opener(main, idx));

  // 4. Close (×) and Escape close it too; Escape leaves the plan open.
  opener(main, idx).click();
  sheet(main).querySelector("#cp-xprev-close").click();
  ok(`${tier} 4a. Close closes it, focus back on the exercise`,
     !sheet(main) && document.activeElement === opener(main, idx));
  opener(main, idx).click();
  esc();
  ok(`${tier} 4b. Escape closes the sheet only, not the plan`,
     !sheet(main) && !!main.querySelector("#cp-preview-panel.is-open") && navs.length === 0 &&
     document.activeElement === opener(main, idx), JSON.stringify(navs));

  // 5. Tab stays inside the sheet.
  opener(main, idx).click();
  const closeBtn = sheet(main).querySelector("#cp-xprev-close");
  const keepBtn  = sheet(main).querySelector("#cp-xprev-keep");
  keepBtn.focus();
  keepBtn.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }));
  ok(`${tier} 5. Tab from the last control wraps to the first in the sheet`, document.activeElement === closeBtn,
     document.activeElement?.outerHTML?.slice(0, 80));
  keepBtn.click();

  // 6. Swap it opens that row's swap list (Plan).
  if (plan) {
    const swappable = rows.findIndex(r => r.querySelector("[data-swap]"));
    opener(main, swappable).click();
    sheet(main).querySelector("#cp-xprev-swap").click();
    ok(`${tier} 6. Swap it closes the sheet and opens that row's swap list`,
       !sheet(main) && main.querySelector(`[data-swap="${swappable}"]`)?.getAttribute("aria-expanded") === "true");
  }

}

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
