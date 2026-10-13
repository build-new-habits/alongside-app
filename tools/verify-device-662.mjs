/**
 * tools/verify-device-662.mjs
 * 13 Oct 2026 v1
 *
 * DEVICE-662 (Graeme's device check of v662, 13 Oct). Two findings:
 *
 *   D662-1 WALK-DAY. Your week said "A walk" (a day that is only cardio,
 *     outside), and Today's plan built a 13-movement cardio circuit under
 *     "From your week: A walk." Graeme: "Concerning it's not a walk when it
 *     said it should be". The coach cannot build a walk; the walk session
 *     can. A cardio-only day outside now leads with "You planned a walk
 *     today" and Start the walk (the WEEK-DOORS lead the old weekly plan
 *     used), the coach's session still offered below it.
 *
 *   D662-2 MOBILITY-DOOR. On the Plan, Mobility & Conditioning (Start a
 *     mobility session, My exercises, Stretch arc, Stretch) had no way in
 *     from Home or Library; only a link at the foot of "I know what I
 *     want". Graeme: "Can't find stretch at all". A Plan-only Library tile,
 *     as Classes and Your week (A-1). Free's Library is unchanged (Free
 *     Home has its own Mobility & Conditioning door).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
dom.window.confirm = () => false;
globalThis.confirm = () => false;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const gate = await import(B + "safety-gate.js");
const WM = await import(B + "data/week-shape-model.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

const library = await import(B + "views/library.js");
const { router: realRouter } = await import(B + "router.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const TODAY = WM.DAY_KEYS[(new Date().getDay() + 6) % 7];
const navs = [];
const rtr = { navigate: (v, o) => navs.push(v), back() {}, history: [], currentView: null };
globalThis.window.router = rtr;
realRouter.navigate = rtr.navigate;

function fixture(tier, template) {
  localStorage.clear(); store.init(); gate.endGateSession();
  agreed(store);
  store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", tier);
  store.set("homeEquipment", ["band-light"]); store.set("sessionLocation", "home");
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  const key = new Date().toISOString().split("T")[0];
  store.set("checkinHistory", { [key]: { energy: 7, mood: 6, date: new Date().toDateString() } });
  if (template) {
    const days = Object.fromEntries(WM.DAY_KEYS.map(k => [k, "rest"]));
    days[TODAY] = template.id;
    store.set("weekShape", WM.sanitizeWeekShape({ templates: { [template.id]: template }, days, setAt: "2026-10-05" }));
  }
  navs.length = 0;
}
function plan(tier, template) {
  fixture(tier, template);
  main.innerHTML = ""; CoachProposalView(rtr).mount(main);
  const b = main.querySelector("#cp-planned-start");
  return { b, text: txt(main) };
}
const ready = id => WM.READY_WEEKS.flatMap(w => w.templates).find(t => t.id === id);

console.log("\nTEST 1 - a walk day in Your week leads with the walk");
for (const id of ["walk-day", "gentle-walk"]) {
  const r = plan("personal", ready(id));
  ok(`1a-${id}. "You planned a walk today" and Start the walk`, !!r.b && /You planned a walk today/.test(r.text) && /Start the walk/.test(txt(r.b)), r.text.slice(0, 200));
  ok(`1b-${id}. it opens the walk session`, r.b?.dataset.plannedRoute === "walk-session");
  ok(`1c-${id}. the coach's session is still offered below`, /the coach’s session instead/.test(r.text));
}
let r = plan("personal", { id: "legs-day", name: "Legs day", mix: [{ focus: "legs", level: 2 }], intensity: "steady", mins: 30, place: "home" });
ok("1d. CONTROL: a legs day has no walk lead", !r.b);
r = plan("personal", { id: "gym-cardio", name: "Gym cardio", mix: [{ focus: "cardio", level: 2 }], intensity: "steady", mins: 30, place: "gym" });
ok("1e. CONTROL: cardio at the gym is the coach's session, no walk lead", !r.b);
r = plan("personal", { id: "mixed", name: "Mixed", mix: [{ focus: "cardio", level: 2 }, { focus: "trunk", level: 1 }], intensity: "steady", mins: 30, place: "outside" });
ok("1f. CONTROL: cardio and core outside is the coach's session", !r.b);

console.log("\nTEST 2 - Mobility & Conditioning from the Library");
function tile(tier) {
  fixture(tier);
  main.innerHTML = library.render(); library.onMount();
  return main.querySelector('[data-guided="mobility"]');
}
const t = tile("personal");
ok("2a. Plan: a Mobility & Conditioning tile", !!t && /Mobility & Conditioning/.test(txt(t)), txt(main).slice(0, 300));
navs.length = 0; click(t);
ok("2b. it opens Mobility & Conditioning (Stretch is there)", navs.at(-1) === "mobility-conditioning", JSON.stringify(navs));
ok("2c. CONTROL: Free's Library is unchanged (Free Home has the door)", !tile("free"));

console.log(`\nVERIFY-DEVICE-662: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
