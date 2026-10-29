import { createRequire as __cr } from "node:module";
/**
 * tools/verify-plan-home-path.mjs
 * 29 Oct 2026 v2
 *
 * v2 - MOCK-UP v10 (Graeme, 29 Oct: "I like v10"; v1 held v9). The Plan's
 *   Home, purpose first, with the check-in inside each way in:
 *   - top to bottom: greeting, the arc as a line (said, not a button),
 *     Lately (from three sessions with both moods: before and after, and
 *     what seems to help; never a weekly count, LOBBY-1b, Graeme 29 Oct),
 *     ONE row (Let me choose for you, or Carry on, Done today, your week's
 *     day, a rest day), "Or choose for yourself", four doors (Get stronger
 *     amber, Keep moving blue, Stretch violet, Move to feel better green,
 *     each an icon and a word), the Library;
 *   - six ways in at most, in every state;
 *   - no first-open screen: a cold open draws Home;
 *   - the first way in of the day goes through the check-in and comes back
 *     to where it was going (a door: its steps; the coach: straight on to
 *     its choice, not Home); "Not today" counts as asked;
 *   - the coach's row names today's pick once the questions are answered,
 *     in path-engine's terms.
 *
 * 28 Oct 2026 v1 (mock-up v9)
 *
 * Drives the real TodayView with a real store. Free is held by
 * verify-path-free-unchanged; the check-in's own part by
 * verify-checkin-inside.
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

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

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const WM = await import(B + "data/week-shape-model.js");
const ENG = await import(B + "data/path-engine.js");
const { TodayView } = await import(B + "views/today.js");
const { router: realRouter } = await import(B + "router.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
let navs = [];
const fakeRouter = { history: ["somewhere"], navigate: v => navs.push(v), back() {} };
globalThis.window.router = fakeRouter;
realRouter.navigate = fakeRouter.navigate;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const TODAY = WM.DAY_KEYS[(new Date().getDay() + 6) % 7];
const todayKey = new Date().toISOString().split("T")[0];

function fixture({ tier = "personal", arc = true, choice = undefined, checkin = null, pairs = 0, sore = null, week = null, done = false, carry = false, likes = [] } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("activityLog", Array.from({ length: 6 }, (_, i) => ({ id: "a" + i, type: "workout", sessionType: "upper", place: "gym",
    completedAt: new Date(Date.now() - (i + 1) * 864e5).toISOString(), durationMins: 30, completed: true })));
  store.set("guidanceShownAt", new Date().toISOString());
  if (arc) store.set("arc", { active: true, aimId: "sport-without-flaring", startedAt: new Date(Date.now() - 15 * 864e5).toISOString(), strands: [] });
  if (choice !== undefined) store.setDayOpen(choice);
  if (checkin) {
    store.set("checkinHistory", { [todayKey]: { energy: checkin.energy, mood: checkin.mood, date: new Date().toDateString() } });
    store.set("lastCheckin", { ...store.get("lastCheckin"), energy: checkin.energy, mood: checkin.mood, date: new Date().toDateString(), timestamp: new Date().toISOString() });
  }
  if (sore) store.set("conditionPainScores", sore);
  if (week) {
    const days = Object.fromEntries(WM.DAY_KEYS.map(k => [k, null]));
    if (week === "day") days[TODAY] = "upper-day";
    if (week === "rest") days[TODAY] = "rest";
    store.set("weekShape", WM.sanitizeWeekShape({ templates: { "upper-day": { id: "upper-day", name: "Upper day",
      mix: [{ focus: "upper", level: 2 }, { focus: "trunk", level: 1 }], intensity: "steady", mins: 30, place: "gym" } }, days, setAt: "2026-10-05" }));
  }
  if (done) store.set("activityLog", [...store.get("activityLog"), { id: "today1", type: "yoga-session", name: "Calming yoga", door: "feel",
    completedAt: new Date().toISOString(), durationMins: 15, completed: true, moodAfter: 7 }]);
  if (carry) {
    store.set("generatedSession", { builtAt: "b1", session: { id: "s1", title: "Upper body", exercises: [{ id: "push-up", name: "Push-up" }, { id: "childs-pose", name: "Child's Pose" }, { id: "plank", name: "Plank" }] } });
    store.set("activeSessionCheckpoint", { sessionType: "workout", sessionId: "s1|b1", index: 1, startedAt: new Date().toISOString(), checkpointedAt: new Date().toISOString() });
  }
  for (const id of likes) store.likeMovement(id);
  if (pairs) {   // finished sessions with the check-in's mood that day and the mood after
    const hist = { ...(store.get("checkinHistory") || {}) }, log = [...store.get("activityLog")];
    for (let i = 0; i < pairs; i++) { const d = new Date(Date.now() - (i + 2) * 864e5); hist[d.toISOString().split("T")[0]] = { energy: 6, mood: 3 };
      log.push({ id: "p" + i, type: "yoga-session", name: "Calming yoga", completedAt: d.toISOString(), durationMins: 15, completed: true, moodAfter: i === 0 ? 3 : 7 }); }
    store.set("checkinHistory", hist); store.set("activityLog", log);
  }
  navs = []; delete fakeRouter.pathStart;
}
function home() { main.innerHTML = ""; TodayView(fakeRouter).mount(main); }
const waysIn = () => [...main.querySelectorAll("button, a[href], [role=button]")].filter(b => !b.closest(".scope-notice, .today-hinge"));
const card = () => main.querySelector(".path-today");
const lead = () => main.querySelector(".path-coach, .path-today");
const doors = () => [...main.querySelectorAll(".path-doors .path-door[data-door]")];
const engineFor = (checkin, sore = []) => ENG.suggestToday({ checkin, place: "gym", sore, arcDoor: null });

// ── 0 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 0 - positive control");
fixture({ tier: "free" }); home();
ok("0a. Free Home has no Plan Home in it", !main.querySelector(".path-home") && !!main.querySelector(".today-view"));
fixture(); fakeRouter.history = []; home(); fakeRouter.history = ["somewhere"];
ok("0b. a cold open on the Plan draws Home (no first-open screen)", !!main.querySelector(".path-home") && !navs.length, JSON.stringify(navs));

// ── 1 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 1 - top to bottom, as mock-up v10");
fixture({ pairs: 4 }); home();
const order = [...main.querySelectorAll(".path-home > *")].map(el => el.matches("h1") ? "h1" : el.classList[0]);
const want = ["h1", "path-arcline", "look-label", "path-lately", "path-coach", "look-label", "path-doors"];
ok("1a. greeting, arc line, Lately, the coach's row, label, doors", JSON.stringify(order.filter(o => want.includes(o))) === JSON.stringify(want), order.join(" > "));
ok("1b. one h1", main.querySelectorAll("h1").length === 1);
const arcLine = main.querySelector(".path-arcline");
ok("1c. the arc is said, with its week and its aim, and is not a button", /Your arc · Week \d+( starts today)?\./.test(txt(arcLine)) && !arcLine.closest("button") && !arcLine.querySelector("button, a"), txt(arcLine));
ok("1d. four doors, in order", doors().map(d => d.dataset.door).join() === "stronger,moving,stretch,feel");
const KIND = { stronger: "k-amber", moving: "k-blue", stretch: "k-violet", feel: "k-green" };
const NAME = { stronger: "Get stronger", moving: "Keep moving", stretch: "Stretch", feel: "Move to feel better" };
ok("1e. each door: its kind colour tile with an icon, and its name in words", doors().every(d => d.querySelector(`.kind-tile.${KIND[d.dataset.door]} svg`) && txt(d.querySelector(".path-door__t")) === NAME[d.dataset.door]));
const lib = main.querySelector(".path-doors [data-route='library']");
ok("1f. the Library is the last row, naming your week", !!lib && main.querySelector(".path-doors").lastElementChild.contains(lib) && /your week/i.test(txt(lib)));
ok("1g. no Join a class, no old doors, no first-open card", !/Join a class|Tell me what to do|I know what I want|Make it up as I go|How are you doing\?/.test(txt(main)) && !main.querySelector(".home-doors, .home-week, .home-today"));

// ── 2 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 2 - six ways in at most, whatever leads");
const STATES = {
  "not checked in": {}, "Not today": { choice: "pick" },
  "checked in, mood low": { checkin: { energy: 6, mood: 3 } }, "checked in, quite sore": { checkin: { energy: 7, mood: 7 }, sore: { "lower-back": 6 } },
  "a bad back": { checkin: { energy: 6, mood: 6 }, sore: { "lower-back": 8 } }, "your week's day": { week: "day" }, "a rest day": { week: "rest" },
  "carry on": { carry: true }, "done today": { done: true, checkin: { energy: 6, mood: 3 } }, "with Lately": { pairs: 6 },
};
for (const [label, f] of Object.entries(STATES)) {
  fixture(f); home();
  ok(`2. ${label}: ${waysIn().length} ways in, one lead with one action at most`, waysIn().length <= 6 && waysIn().length >= 5 && !!lead() &&
     (lead().matches("button") || lead().querySelectorAll("button").length <= 1), waysIn().map(b => txt(b).slice(0, 22)).join(" | "));
}

// ── 3 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 3 - what leads");
fixture(); home();
ok("3a. not checked in: Let me choose for you, three quick questions first", lead().dataset.state === "coach" && /Let me choose for you/.test(txt(lead())) && /Three quick questions, then today.s plan/.test(txt(lead())), txt(lead()));
for (const [label, ci, want2] of [["mood low", { energy: 6, mood: 3 }, /Today: Calming yoga · About 15 minutes/], ["good", { energy: 7, mood: 6 }, /Today: Whole body, moving · About 35 minutes/],
                                   ["running on empty", { energy: 2, mood: 6 }, /Today: Rest and reset · About 6 minutes/]]) {
  fixture({ checkin: ci }); home();
  ok(`3b. checked in, ${label}: the row names the engine's pick`, want2.test(txt(lead())), txt(lead()));
}
fixture({ choice: "pick" }); home();
ok("3c. Not today: the row names the coach's steady one", /Today: /.test(txt(lead())), txt(lead()));
fixture({ checkin: { energy: 6, mood: 6 }, sore: { "lower-back": 8 } }); home();
ok("3d. a bad back: the row says so, in the engine's words", /lower back is bad today/.test(txt(lead())), txt(lead()));
fixture({ week: "day" }); home();
ok("3e. your week's day leads, with its name; the label says Or something else today", lead().dataset.state === "week" && /Today, from your week: Upper day/.test(txt(lead())) && lead().dataset.action === "week-today" && txt(main.querySelector("#path-doors-h")) === "Or something else today");
fixture({ week: "rest" }); home();
ok("3f. a rest day is said, with nothing to press", card()?.dataset.state === "rest" && !card().querySelector("button"));
fixture({ carry: true }); home();
ok("3g. carry on: the session, the next move drawn, Carry on; the label Or instead", card()?.dataset.state === "carry" && /Next: Child.s Pose/.test(txt(card())) && !!card().querySelector(".path-today__fig[aria-hidden='true'] svg") &&
   txt(card().querySelector("button")) === "Carry on" && txt(main.querySelector("#path-doors-h")) === "Or instead");
fixture({ done: true, checkin: { energy: 6, mood: 3 }, likes: ["childs-pose"] }); home();
ok("3h. done today: how the mood went, drawn on the five words (hidden; the sentence says it), what it will remember", card()?.dataset.state === "done" && /You went from low to pretty good\./.test(txt(card())) &&
   !!card().querySelector("svg.path-moodpath[aria-hidden='true']") && /Child.s Pose/.test(txt(card())));

// ── 4 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 4 - the check-in inside each way in");
for (const d of ["stronger", "moving", "stretch", "feel"]) {
  fixture(); home(); click(main.querySelector(`.path-door[data-door='${d}']`));
  ok(`4a. ${NAME[d]}, first of the day: the check-in, then its own steps`, navs.join() === "checkin" && store.get("pendingDoorRoute") === "path" && fakeRouter.pathStart?.door === d, JSON.stringify(navs));
}
fixture({ checkin: { energy: 6, mood: 6 } }); home(); click(main.querySelector(".path-door[data-door='stretch']"));
ok("4b. already checked in today: straight to its steps", navs.join() === "path" && fakeRouter.pathStart?.door === "stretch", JSON.stringify(navs));
fixture({ choice: "pick" }); home(); click(main.querySelector(".path-door[data-door='feel']"));
ok("4c. Not today counts as asked: straight to its steps", navs.join() === "path", JSON.stringify(navs));
fixture(); home(); click(lead());
ok("4d. Let me choose for you, first of the day: the check-in, which comes back for the coach", navs.join() === "checkin" && store.get("pendingDoorRoute") === "today" && fakeRouter.pathStart?.coach === true, JSON.stringify(navs));
// Back from the check-in, answered: Home goes straight on to the coach's choice.
store.set("checkinHistory", { [todayKey]: { energy: 7, mood: 6 } }); store.set("lastCheckin", { ...store.get("lastCheckin"), energy: 7, mood: 6, timestamp: new Date().toISOString() });
store.set("pendingDoorRoute", null); navs = []; home();
ok("4e. back from it: straight on to Today's plan for the coach's kind (not Home)", navs.join() === "coach-proposal" && store.get("requestedSessionType") === "full" && !fakeRouter.pathStart, JSON.stringify(navs));
fixture({ checkin: { energy: 6, mood: 3 } }); home(); click(lead());
ok("4f. checked in, mood low: the coach's choice is a feeling, opened at its steps", navs.join() === "path" && fakeRouter.pathStart?.door === "feel" && fakeRouter.pathStart?.feeling === "calm" && /You said you.re feeling low/.test(fakeRouter.pathStart?.reason || ""), JSON.stringify(fakeRouter.pathStart));
fixture({ checkin: { energy: 6, mood: 6 }, sore: { "lower-back": 8 } }); home(); click(lead());
ok("4g. a bad back: Today's plan, where the bad-day door is", navs.join() === "coach-proposal", JSON.stringify(navs));
fixture(); home(); click(main.querySelector("[data-route='library']"));
ok("4h. the Library: no check-in on the way", navs.join() === "library", JSON.stringify(navs));
ok("4i. a mood is said as a person says it", /^You said you.re struggling, so this is slow and steady\.$/.test(ENG.suggestToday({ checkin: { energy: 6, mood: 2 } }).reason));

// ── 5 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 5 - Lately");
fixture({ pairs: 2 }); home();
ok("5a. under three sessions with both moods: not shown", !main.querySelector(".path-lately"));
fixture({ pairs: 4 }); home();
const late = main.querySelector(".path-lately");
ok("5b. from three: before and after, said in words and named for screen readers", /Better after 3 of your last 4\./.test(txt(late)) && /better after 3/.test(late.querySelector("svg[role='img']")?.getAttribute("aria-label") || ""), txt(late));
ok("5c. and what seems to help, when one session has been followed by a better mood twice or more", /Calming yoga seems to help you most\./.test(txt(late)));
ok("5d. never a weekly count or a target on Home (LOBBY-1b)", !/\b\d+ (times|sessions)\b|this week|\b\d+ of \d+ this/i.test(txt(main)), txt(late));

// ── 6 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 6 - the coach's line, only when it adds something");
fixture(); home();
ok("6a. an ordinary day: no line above the arc", !main.querySelector(".path-note"));
fixture();
store.set("checkinHistory", Object.fromEntries([1, 2, 3, 4].map(n => [new Date(Date.now() - n * 864e5).toISOString().split("T")[0], { energy: 2, mood: 6 }])));
home();
ok("6b. a flat week is said, in BURN-3's words", /flatter few days|low for a while/.test(txt(main.querySelector(".path-note"))));

console.log(`\n${"=".repeat(60)}\nVERIFY-PLAN-HOME-PATH: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
