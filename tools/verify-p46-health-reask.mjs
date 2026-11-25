/**
 * tools/verify-p46-health-reask.mjs
 * 25 Nov 2026 v1
 *
 * P-46 WAVE 8, persona 2.12 (Graeme, 25 Nov: "some might be protective of
 * their personal data, so we should ask again without telling them what
 * question specifically and what the answers would be used for"; a warning
 * that the coach can give exercises but can't adapt them, that no is fine
 * and can be changed in Settings, and to listen to your body). The real
 * health-consent view, at a session door and elsewhere.
 *
 *   1  Said no before, at a session door: the short ask again; nothing
 *      about what is kept; the four things Graeme asked for.
 *   2  Yes, keep my answers: the full screen, with its tick.
 *   3  Carry on without them: the gentle routine, and no ask next time.
 *   4  Never said no: the full screen first; Not now: the same short ask.
 *   5  Unchanged: the journal (no routine), and a change of wording (full).
 *
 * Red on alongside-v745.
 */
import { createRequire as __cr } from "node:module";
import { readFileSync } from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div><div id="sr-announcer"></div></body>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0); dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
let navs = [];
router.navigate = v => { navs.push(v); };
router.back = () => { navs.push("<back>"); };
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });   // a bare `router` is window.router in a browser
const todayKey = new Date().toISOString().split("T")[0];

const HC = await import(B + "data/health-consent.js");
const { HealthConsentView } = await import(B + "views/health-consent.js");

function person({ declined = false } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Alex"); store.set("tier", "free");
  if (declined) HC.declineHealthConsent();
  else store.set("consent", { ...store.get("consent"), health: { given: false, at: null, version: null, withdrawnAt: null } });
  navs = [];
}
const open = from => { HC.setPendingRoute(from); main.innerHTML = ""; HealthConsentView(router).mount(main); };
const LIST = /check-ins|journal|weight|what’s sore|how much/i;

console.log("\nTEST 1 - said no before, at a session door");
person({ declined: true }); open("coach-proposal");
const t1 = txt(main);
ok("1a. the short ask again: Before your session", txt(main.querySelector("h1")) === "Before your session" && !!main.querySelector(".hc-reask"), t1.slice(0, 120));
ok("1b. it does not say what is kept, or list the answers", !LIST.test(t1) && !main.querySelector("#hc-check"), t1);
ok("1c. the coach can still give a routine, but can't fit it to how you are on the day", /still give you a gentle routine/.test(t1) && /can't fit it to how you are on the day/.test(t1));
ok("1d. no is fine, and can be changed in Settings", /That's fine\. You can change your mind any time in Settings\./.test(t1));
ok("1e. listen to your body, said first and strongly", /If you go without, listen to your body/.test(txt(main.querySelector(".hc-listen strong"))) && /ease off on days you're not at your best/.test(t1));
ok("1f. two buttons: Yes, keep my answers · Carry on without them", txt(main.querySelector("#hc-back-to-tick")) === "Yes, keep my answers" && txt(main.querySelector("#hc-routine")) === "Carry on without them");

console.log("\nTEST 2 - Yes, keep my answers");
click(main.querySelector("#hc-back-to-tick"));
ok("2a. the full screen, with its list and its tick (the consent itself unchanged)", txt(main.querySelector("h1")) === "Before I keep how you are" && LIST.test(txt(main)) && !!main.querySelector("#hc-check"));
main.querySelector("#hc-check").checked = true; click(main.querySelector("#hc-continue"));
ok("2b. ticked and Continue: consent given, on to the session", HC.healthAllowed() && navs.at(-1) === "coach-proposal", JSON.stringify(navs));

console.log("\nTEST 3 - Carry on without them");
person({ declined: true }); open("coach-proposal");
click(main.querySelector("#hc-routine"));
ok("3a. the gentle routine, in the player", navs.at(-1) === "workout" && store.get("generatedSession")?.inputs?.general === true);
ok("3b. and next time, no ask: straight to the routine", HC.healthConfirmedNo() && HC.guardRoute("coach-proposal") === "workout");

console.log("\nTEST 4 - never said no: the full screen first");
person(); open("coach-proposal");
ok("4a. the full screen first", txt(main.querySelector("h1")) === "Before I keep how you are" && !!main.querySelector("#hc-check"));
click(main.querySelector("#hc-not-now"));
ok("4b. Not now: the same short ask, with the routine", txt(main.querySelector("h1")) === "Before your session" && !LIST.test(txt(main)) && !!main.querySelector("#hc-routine"));

console.log("\nTEST 5 - unchanged elsewhere");
person({ declined: true }); open("journal-entry");
ok("5a. from the journal: the full screen; no routine offered after Not now", !!main.querySelector("#hc-check") && (click(main.querySelector("#hc-not-now")), !main.querySelector("#hc-routine")));
person({ declined: true });
store.set("consent", { ...store.get("consent"), health: { ...store.get("consent").health, version: "2000-01-01", given: true, at: new Date().toISOString(), withdrawnAt: null } });
const changed = HC.healthWordingChanged();
open("coach-proposal");
ok("5b. CONTROL: when the wording has changed, the full screen (it must be read again)", !changed || !!main.querySelector("#hc-check"), String(changed));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
