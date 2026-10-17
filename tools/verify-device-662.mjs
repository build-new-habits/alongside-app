/**
 * tools/verify-device-662.mjs
 * 17 Oct 2026 v3
 *
 * v3 - D662-10 OLD-STARS (Graeme, 17 Oct: "is there any value here?
 *   Remove them"). My exercises said "Up to +150 ⭐" and each move in its
 *   player "+35 ⭐": the older per-move count (totalCredits), which nothing
 *   has shown or used since August. The social action credits are
 *   community.credits (1 a session on Free, 2 on the Plan, Settings ›
 *   Community impact), so the stars promised what the app does not give.
 *   Gone from both screens; the player says "1 set" too.
 *
 * v2 - the rest of the device check's list (Graeme, 17 Oct: "Can we fix
 *   them now?"):
 *   D662-3 GOOD-DAY-SETS: "One more set on each" only where the work is
 *     sets (not a stretch, mobility or cardio plan).
 *   D662-4 PRESCRIBED-DAY: My exercises in plan days is not headed "To do
 *     today"; today's day comes first.
 *   D662-5 BACK-LABEL: My exercises' way back says Home, where it goes.
 *   D662-7 WORDS: "1 set", "1 session"; no "No sets logged" under a move
 *     on Progress; a saved session's button says Start; the finish's tiles
 *     share the row, so one is not left alone.
 *   D662-9 ARC-SHOWS: what the finish says the arc worked today is what
 *     Progress's arc card says.
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
const prescribed = await import(B + "views/prescribed.js");
const saved = await import(B + "views/saved-sessions.js");
const { ProgressView } = await import(B + "views/progress.js");
const { strandReadback } = await import(B + "data/arc-readback.js");
const fs = await import("node:fs");
const player = await import(B + "views/prescribed-session.js");
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

console.log("\nTEST 3 - One more set on each, only where the work is sets");
function offer(type) {
  fixture("personal");
  store.set("requestedSessionType", type);
  main.innerHTML = ""; CoachProposalView(rtr).mount(main);
  return !!main.querySelector("#cp-offer-more");
}
ok("3pc. CONTROL: an upper-body plan on a good day offers it", offer("upper"));
for (const t of ["stretch", "mobility", "cardio"]) ok(`3a-${t}. a ${t} plan does not`, !offer(t));

console.log("\nTEST 4/5 - My exercises: plan days, today first; the way back says Home");
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const todayName = DAYS[new Date().getDay()], otherName = DAYS[(new Date().getDay() + 6) % 7];
fixture("personal");
store.set("prescribedExercises", [
  { id: "p1", name: "Cat-Cow Flow", sets: 1, reps: "8", group: otherName },
  { id: "p2", name: "Dead Bug", sets: 3, reps: "8 each side", group: todayName },
]);
main.innerHTML = prescribed.render(); try { prescribed.onMount(); } catch {}
const heads = [...main.querySelectorAll(".prescribed-group__name")].map(txt);
ok("4a. not headed To do today over plan days", !/To do today/i.test(txt(main)), txt(main).slice(0, 200));
ok("4b. today's day first", heads[0] === `${todayName} (today)` || heads[0] === todayName, JSON.stringify(heads));
ok("4c. today's day says so", heads.some(h => h.includes("today")), JSON.stringify(heads));
ok("7a. \"1 set\", not \"1 sets\"", /\b1 set\b/.test(txt(main)) && !/\b1 sets\b/.test(txt(main)) && /\b3 sets\b/.test(txt(main)));
const backs = [...main.querySelectorAll("#prescribed-back-top, #prescribed-back-bottom")];
ok("5a. the way back says Home", backs.length && backs.every(b => /Home/.test(txt(b) + (b.getAttribute("aria-label") || "")) && !/choices/i.test(txt(b) + (b.getAttribute("aria-label") || ""))), backs.map(txt).join(" | "));
fixture("personal");
store.set("prescribedExercises", [{ id: "p3", name: "Bridge", sets: 2, reps: "10" }]);
main.innerHTML = prescribed.render(); try { prescribed.onMount(); } catch {}
ok("4pc. CONTROL: an ungrouped list is still today's", /To do today/i.test(txt(main)));

console.log("\nTEST 7 - words");
fixture("personal");
const at = new Date(Date.now() - 10 * 60000).toISOString();
store.set("activityLog", [{ id: "w1", type: "workout", sessionType: "cardio", completedAt: at, durationMins: 1, completed: true, exerciseIds: ["wall-roll-down"] }]);
main.innerHTML = ""; ProgressView(rtr).mount(main);
const todayBtn = [...main.querySelectorAll("button")].find(b => txt(b) === "Today");
if (todayBtn && todayBtn.getAttribute("aria-pressed") !== "true") click(todayBtn);
ok("7pc. the session is listed", /Cardio/.test(txt(main)), txt(main).slice(0, 200));
ok("7b. one session says session", /\b1 session\b/.test(txt(main.querySelector(".progress-summary"))) || txt(main.querySelector(".progress-summary__label")) === "session", txt(main.querySelector(".progress-summary")));
ok("7c. no \"No sets logged\" under a move", !/No sets logged/.test(txt(main)));
fixture("personal");
store.set("savedSessions", [{ id: "s1", name: "Tuesday 30th September 26", exerciseIds: ["goblet-squat"], createdAt: new Date().toISOString() }]);
main.innerHTML = saved.render(); try { saved.onMount(); } catch {}
const go = main.querySelector("[data-saved-id]");
ok("7d. the saved session's button says Start; its name stays in the button's name", txt(go) === "Start" && /Tuesday 30th September 26/.test(go?.getAttribute("aria-label") || ""), txt(go));
const css = fs.readFileSync(new URL("../css/components/reflect.css", import.meta.url), "utf8");
const rule = css.slice(css.indexOf(".finish-view .finish-stats {"), css.indexOf("}", css.indexOf(".finish-view .finish-stats {")));
ok("7e. the finish's tiles share the row (one tile is not left at a third)", rule && !/repeat\(3/.test(rule) && /grid-auto-columns:\s*minmax\(0,\s*1fr\)/.test(rule) && /grid-auto-flow:\s*column/.test(rule), rule);

console.log("\nTEST 9 - the arc: the finish and Progress say the same");
fixture("personal");
const today = new Date().toISOString();
store.set("arc", { active: true, aimId: "sport-without-flaring", startedAt: new Date(Date.now() - 40 * 864e5).toISOString(), strands: ["trunk-strength", "back-resilience"],
  zonesWorked: { "lower-back": today }, typesWorked: { core: new Date(Date.now() - 8 * 864e5).toISOString() } });
store.set("activityLog", [{ id: "w2", type: "workout", sessionType: "mobility", completedAt: today, durationMins: 10, completed: true }]);
const lit = strandReadback(store.get("arc")).filter(x => x.last === today.slice(0, 10)).map(x => x.label);
main.innerHTML = ""; ProgressView(rtr).mount(main);
const arcText = txt(main);
ok("9pc. the finish would say: A back that copes", lit.join() === "A back that copes", lit.join());
ok("9a. Progress says it was worked today", /A back that copes\s*Worked today/.test(arcText), arcText.slice(arcText.indexOf("Your arc"), arcText.indexOf("Your arc") + 200));

console.log("\nTEST 10 - no old credit stars");
fixture("personal");
store.set("prescribedExercises", [{ id: "p1", name: "Cat-Cow Flow", sets: 1, reps: "8" }, { id: "p2", name: "Dead Bug", sets: 3, reps: "8" }]);
main.innerHTML = prescribed.render(); try { prescribed.onMount(); } catch {}
const listText = txt(main);
ok("10pc. My exercises is showing its list", /Cat-Cow Flow/.test(listText));
ok("10a. My exercises: no \"Up to +…\" and no star", !/Up to \+\d/.test(listText) && !/\u2B50/.test(main.innerHTML) && !main.querySelector(".prescribed-credits-badge"));
main.innerHTML = ""; try { main.innerHTML = player.render(); player.onMount(); } catch {}
const playText = txt(main);
ok("10pc2. the player is showing the first move", /Cat-Cow Flow/.test(playText), playText.slice(0, 160));
ok("10b. the player: no \"+35 ⭐\"", !/\+\d+\s*\u2B50/.test(playText) && !/\u2B50/.test(main.innerHTML));
ok("10c. the player says 1 set", /\b1 set\b/.test(playText) && !/\b1 sets\b/.test(playText), playText.slice(0, 200));

console.log(`\nVERIFY-DEVICE-662: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
