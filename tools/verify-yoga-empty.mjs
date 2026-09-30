/**
 * tools/verify-yoga-empty.mjs
 * 30 Sep 2026 v1
 *
 * W3-19 YOGA-EMPTY (persona Wave 3, 2.11: 76, gets up from a chair "not
 * easily", cannot get to the floor). Yoga & Pilates offered her Flexibility
 * and then a length card reading "About 1 min · 0 poses": the length
 * cards always showed the first one, whatever it held. A style with
 * nothing that fits her looked like every other style until she had
 * chosen it and a length.
 *
 *   1. No length card offers 0 poses, for anybody, in any style.
 *   2. A style with nothing that fits says so plainly on its own card,
 *      and cannot be chosen; the styles that do fit can.
 *   3. Control: somebody with no limits sees every style and lengths.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const rtr = { navigate() {}, back() {}, history: [] };
globalThis.router = rtr; dom.window.router = rtr;
const { router: appRouter } = await import(B + "router.js");
appRouter.navigate = () => {};

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const wait = ms => new Promise(r => setTimeout(r, ms));
let n = 0;
async function view() {
  const Y = await import(B + `views/yoga-session.js?v=${++n}`);
  main.innerHTML = Y.render(); Y.onMount();
  return Y;
}
function person(cap) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "free"); store.set("name", "Maud");
  store.set("capability", { askedAt: new Date().toISOString(), ...cap });
}
const LIMITED = { balanceWorry: "sometimes", chairRise: "not-easily", legPower: null, floorAccess: "no" };
const NONE = { balanceWorry: "no", chairRise: "yes", legPower: "full", floorAccess: "yes" };

async function survey(cap) {
  person(cap);
  const Y0 = await view();
  const styles = [...main.querySelectorAll("[data-focus]")].map(b => ({ id: b.dataset.focus, disabled: b.disabled || b.getAttribute("aria-disabled") === "true", text: txt(b) }));
  const out = [];
  for (const s of styles) {
    const Y = await view();
    const btn = main.querySelector(`[data-focus="${s.id}"]`);
    btn?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(10);
    main.innerHTML = Y.render(); try { Y.onMount(); } catch {}
    const cards = [...main.querySelectorAll("[data-mins]")].map(b => txt(b));
    out.push({ ...s, cards, screen: txt(main) });
  }
  return out;
}

console.log("\nTEST 1 and 2 - somebody who cannot get to the floor");
const lim = await survey(LIMITED);
const zero = lim.flatMap(s => s.cards.filter(c => /\b0 poses\b/.test(c)).map(c => `${s.id}: ${c}`));
ok("1pc. the styles were read", lim.length >= 3, lim.map(s => s.id).join(", "));
ok("1a. no length card offers 0 poses", zero.length === 0, zero.join(" | "));
const empty = lim.filter(s => s.disabled);
const offered = lim.filter(s => !s.disabled);
ok("2pc. at least one style has nothing for her (the finding)", empty.length >= 1, lim.map(s => `${s.id}${s.disabled ? " (none)" : ""}`).join(", "));
ok("2a. that style says so on its own card", empty.every(s => /nothing here fits/i.test(s.text)), empty.map(s => s.text).join(" | "));
ok("2b. and cannot be chosen: tapping it opens no lengths", empty.every(s => s.cards.length === 0 && !/How long have you got/.test(s.screen)));
ok("2c. every style she can choose offers at least one length, each with poses", offered.length >= 1 && offered.every(s => s.cards.length >= 1),
   offered.map(s => `${s.id}: ${s.cards.length}`).join(", "));

console.log("\nTEST 3 - control: no limits");
const all = await survey(NONE);
ok("3a. every style can be chosen, and none says nothing fits", all.every(s => !s.disabled && !/nothing here fits/i.test(s.text)));
ok("3b. every style offers lengths, none with 0 poses", all.every(s => s.cards.length >= 1 && s.cards.every(c => !/\b0 poses\b/.test(c))),
   all.map(s => `${s.id}: ${s.cards.join(" / ")}`).join(" | "));

console.log("");
if (fails) { console.log(`YOGA-EMPTY: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`YOGA-EMPTY: all ${passes} assertions pass\n`);
process.exit(0);
