import { createRequire as __cr } from "node:module";
/**
 * tools/verify-plan-home-path.mjs
 * 28 Oct 2026 v1
 *
 * STAGE PATH P-4 (blueprint Session 4). The Plan's Home, purpose first, as
 * Graeme approved it in mock-up v9 (28 Oct: "I think this is good. A nice
 * consistency to help users use it."), checked against Stage AWARD's own
 * rules before he saw it:
 *   - top to bottom: greeting, the arc as a line (said, not a button),
 *     one Today card, "Or choose for yourself", four doors (Get stronger
 *     amber, Keep moving blue, Stretch violet, Move to feel better green,
 *     each an icon and a word), the Library;
 *   - six ways in at most, in every state of the Today card, because the
 *     card has one action (A-1's rule, now with four doors);
 *   - the card's states: How are you doing? / Want to check in now?, the
 *     coach's suggestion (path-engine E2 and E4, exact words), a gentle
 *     day, your week's day, a rest day, Carry on, Done today;
 *   - Home shows two adjustments and "And n more on the plan";
 *   - the doors go to the door's own steps (the path route, Session 5) and
 *     the suggestion to Today's plan, or to its feeling;
 *   - no Join a class, no Tell me what to do, no I know what I want, no
 *     Make it up as I go on the Plan's Home (Library and the door steps
 *     reach them).
 *
 * Drives the real TodayView with a real store. Free is held by
 * verify-path-free-unchanged.
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

function fixture({ tier = "personal", arc = true, choice = "checked", checkin = null, sore = null, week = null, done = false, carry = false, likes = [] } = {}) {
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
  navs = []; delete fakeRouter.pathStart;
}
function home() { main.innerHTML = ""; TodayView(fakeRouter).mount(main); }
const waysIn = () => [...main.querySelectorAll("button, a[href], [role=button]")].filter(b => !b.closest(".scope-notice, .today-hinge"));
const card = () => main.querySelector(".path-today");
const doors = () => [...main.querySelectorAll(".path-doors .path-door[data-door]")];
const engineFor = (checkin, sore = []) => ENG.suggestToday({ checkin, place: "gym", sore, arcDoor: null });

// ── 0 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 0 - positive control");
fixture({ tier: "free" }); home();
ok("0a. Free Home has no Plan Home in it", !main.querySelector(".path-home") && !!main.querySelector(".today-view"));
fixture({ checkin: { energy: 7, mood: 6 } }); home();
ok("0b. the Plan's Home is drawn", !!main.querySelector(".path-home"), main.innerHTML.slice(0, 200));

// ── 1 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 1 - top to bottom, as mock-up v9");
const order = [...main.querySelectorAll(".path-home > *")].map(el => el.matches("h1") ? "h1" : el.classList[0]);
const want = ["h1", "path-arcline", "path-today", "look-label", "path-doors"];
ok("1a. greeting, arc line, Today card, label, doors (the Library last among them)", want.every((w, i) => order.filter(o => want.includes(o))[i] === w), order.join(" > "));
ok("1b. one h1", main.querySelectorAll("h1").length === 1);
const arcLine = main.querySelector(".path-arcline");
ok("1c. the arc is said, with its week and its aim, and is not a button", /Your arc · Week \d+( starts today)?\./.test(txt(arcLine)) && !arcLine.closest("button") && !arcLine.querySelector("button, a"), txt(arcLine));
ok("1d. four doors, in order", doors().map(d => d.dataset.door).join() === "stronger,moving,stretch,feel", doors().map(d => d.dataset.door).join());
const KIND = { stronger: "k-amber", moving: "k-blue", stretch: "k-violet", feel: "k-green" };
const NAME = { stronger: "Get stronger", moving: "Keep moving", stretch: "Stretch", feel: "Move to feel better" };
ok("1e. each door: its kind colour tile with an icon, and its name in words (dual coding)", doors().every(d => d.querySelector(`.kind-tile.${KIND[d.dataset.door]} svg`) && txt(d.querySelector(".path-door__t")) === NAME[d.dataset.door]),
  doors().map(d => d.innerHTML.slice(0, 120)).join(" || "));
ok("1f. the arc's door says so in words", /Your arc/.test(txt(doors().find(d => d.dataset.door === "stronger"))) || doors().every(d => !/Your arc/.test(txt(d))));
const lib = main.querySelector(".path-doors [data-route='library']");
ok("1g. the Library is the last row, naming your week", !!lib && main.querySelector(".path-doors").lastElementChild.contains(lib) && /your week/i.test(txt(lib)), txt(lib));
ok("1h. no Join a class, Tell me what to do, I know what I want or Make it up as I go on Home", !/Join a class|Tell me what to do|I know what I want|Make it up as I go/.test(txt(main)) &&
  !main.querySelector("[data-action='start-today'], [data-action='know-what'], [data-action='as-i-go'], [data-route='classes']"));
ok("1i. the old Plan doors are gone (no .home-doors)", !main.querySelector(".home-doors, .home-week, .home-today"));

// ── 2 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 2 - six ways in at most, whatever the card says");
const STATES = {
  "first, not checked in": { choice: null },
  "after Not now": { choice: "not-now" },
  "just pick something": { choice: "pick" },
  "checked in, mood low, a little sore": { checkin: { energy: 6, mood: 3 }, sore: { "lower-back": 4 } },
  "checked in, quite sore": { checkin: { energy: 7, mood: 7 }, sore: { "lower-back": 6 } },
  "checked in, bad back": { checkin: { energy: 6, mood: 6 }, sore: { "lower-back": 8 } },
  "your week's day": { checkin: { energy: 6, mood: 6 }, week: "day" },
  "a rest day": { week: "rest" },
  "carry on": { carry: true, checkin: { energy: 6, mood: 6 } },
  "done today": { done: true, checkin: { energy: 6, mood: 3 } },
};
for (const [label, f] of Object.entries(STATES)) {
  fixture(f); home();
  ok(`2. ${label}: ${waysIn().length} ways in`, waysIn().length <= 6 && waysIn().length >= 5, waysIn().map(b => txt(b).slice(0, 22)).join(" | "));
  const acts = card() ? [...card()?.querySelectorAll("button, a[href]")] : [];
  ok(`2. ${label}: the card has one action at most`, !!card() && acts.length <= 1, acts.map(txt).join(" | "));
}

// ── 3 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 3 - the Today card's states");
fixture({ choice: null }); home();
ok("3a. first, not checked in: How are you doing? and Check in", /How are you doing\?/.test(txt(card())) && txt(card()?.querySelector("button")) === "Check in", txt(card()));
fixture({ choice: "not-now" }); home();
ok("3b. after Not now: Want to check in now? and Check in", /Want to check in now\?/.test(txt(card())) && txt(card()?.querySelector("button")) === "Check in", txt(card()));
navs = []; click(card()?.querySelector("button"));
ok("3c. Check in opens the check-in", navs.includes("checkin"), JSON.stringify(navs));

fixture({ choice: "pick" }); home();
const pick = engineFor(null);
ok("3d. just pick something: the coach's steady one, with its words", card()?.dataset.state === "suggest" && txt(card()).includes(pick.reason), txt(card()));

const CASES = [
  ["running on empty", { energy: 2, mood: 6 }],
  ["mood low", { energy: 6, mood: 3 }],
  ["energy low", { energy: 3, mood: 6 }],
  ["good", { energy: 7, mood: 6 }],
];
for (const [label, ci] of CASES) {
  fixture({ checkin: ci }); home();
  const s = engineFor(ci);
  ok(`3e. ${label}: the engine's door, reason and kind colour`, card()?.dataset.state === "suggest" && card()?.dataset.door === s.door && txt(card()).includes(s.reason) && card()?.classList.contains(KIND[s.door]),
    `${card()?.dataset.door} vs ${s.door}: ${txt(card())}`);
  ok(`3f. ${label}: What I've adjusted, never empty`, card()?.querySelectorAll(".path-adj li")?.length >= 1 && /What I.ve adjusted/.test(txt(card())));
  ok(`3g. ${label}: one button, Show me today's plan`, txt(card()?.querySelector("button")) === "Show me today’s plan" || txt(card()?.querySelector("button")) === "Show me today's plan", txt(card()?.querySelector("button")));
}

fixture({ checkin: { energy: 6, mood: 2 } }); home();
ok("3e2. a mood is said as a person says it (\"You said you're struggling\", never \"feeling struggling\")", /You said you.re struggling, so this is slow and steady\./.test(txt(card())) && !/feeling struggling/.test(txt(main)), txt(card()));

fixture({ checkin: { energy: 7, mood: 3 }, sore: { "lower-back": 6 }, likes: ["childs-pose"] }); home();
const all = engineFor({ energy: 7, mood: 3 }, [{ id: "lower-back", score: 6 }]).adjustments;
const shown = [...(card()?.querySelectorAll(".path-adj li") || [])].map(txt);
ok("3h. Home shows two adjustments and says how many more are on the plan", shown.length === 3 && shown[0] === all[0] && shown[1] === all[1] && shown[2] === `And ${all.length + 1 - 2} more on the plan`, shown.join(" | ") + " // " + all.join(" | "));

fixture({ checkin: { energy: 6, mood: 6 }, sore: { "lower-back": 8 } }); home();
ok("3i. a bad back: the gentle day, in its words", card()?.dataset.state === "bad" && /lower back is bad today/.test(txt(card())), txt(card()));
navs = []; click(card()?.querySelector("button"));
ok("3j. See gentle choices opens Today's plan, where the bad-day door is", navs.includes("coach-proposal"), JSON.stringify(navs));

fixture({ checkin: { energy: 6, mood: 6 }, week: "day" }); home();
ok("3k. your week's day: its name, and Show me today's plan", card()?.dataset.state === "week" && /Upper day/.test(txt(card())) && !!card()?.querySelector("[data-action='week-today']"), txt(card()));
ok("3l. the Library row still names your week (no card offers to plan it)", /your week/i.test(txt(main.querySelector("[data-route='library']"))));
navs = []; click(card()?.querySelector("[data-action='week-today']"));
ok("3m. Show me today's plan opens the plan", navs.includes("coach-proposal") || navs.includes("checkin"), JSON.stringify(navs));
fixture({ week: "rest" }); home();
ok("3n. a rest day: said, with nothing to press", card()?.dataset.state === "rest" && /Rest/.test(txt(card())) && !card()?.querySelector("button"), txt(card()));

fixture({ carry: true, checkin: { energy: 6, mood: 6 } }); home();
ok("3o. carry on: the session, the next move, and Carry on", card()?.dataset.state === "carry" && /Upper body/.test(txt(card())) && /Next: Child.s Pose/.test(txt(card())) && txt(card()?.querySelector("button")) === "Carry on", txt(card()));
ok("3p. the label reads Or instead", txt(main.querySelector("#path-doors-h")) === "Or instead");
navs = []; click(card()?.querySelector("button"));
ok("3q. Carry on goes back into the session", navs.includes("workout"), JSON.stringify(navs));

fixture({ done: true, checkin: { energy: 6, mood: 3 }, likes: ["childs-pose"] }); home();
ok("3r. done today: the session and how the mood went, never a score", card()?.dataset.state === "done" && /Calming yoga/.test(txt(card())) && /You went from low to pretty good\./.test(txt(card())), txt(card()));
ok("3s. before and after drawn on the five words, hidden from screen readers (the sentence says it)", !!card()?.querySelector("svg.path-moodpath[aria-hidden='true']"));
ok("3t. I'll remember names what was loved today", /I.ll remember/.test(txt(card())) && /Child.s Pose/.test(txt(card())), txt(card()));

// ── 4 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 4 - where each press goes");
fixture({ checkin: { energy: 7, mood: 6 } }); home();
for (const d of ["stronger", "moving", "stretch", "feel"]) {
  fixture({ checkin: { energy: 7, mood: 6 } }); home();
  click(main.querySelector(`.path-door[data-door='${d}']`));
  ok(`4a. ${NAME[d]} opens its own steps`, navs.includes("path") && fakeRouter.pathStart?.door === d, JSON.stringify(navs) + " " + JSON.stringify(fakeRouter.pathStart));
}
fixture({ checkin: { energy: 7, mood: 6 } }); home();
click(main.querySelector("[data-route='library']"));
ok("4b. the Library opens the Library", navs.includes("library"), JSON.stringify(navs));
fixture({ checkin: { energy: 6, mood: 3 } }); home();
click(card()?.querySelector("button"));
ok("4c. a Move to feel better suggestion opens its feeling", navs.includes("path") && fakeRouter.pathStart?.door === "feel" && fakeRouter.pathStart?.feeling === "calm", JSON.stringify(fakeRouter.pathStart));
fixture({ checkin: { energy: 7, mood: 6 } }); home();
store.set("requestedSessionType", null);
click(card()?.querySelector("button"));
ok("4d. any other suggestion opens Today's plan for its kind and place", navs.includes("coach-proposal") && store.get("requestedSessionType") === "full" && store.get("requestedLocation") === "gym",
  JSON.stringify(navs) + " " + store.get("requestedSessionType") + " " + store.get("requestedLocation"));

// ── 5 ─────────────────────────────────────────────────────────────────────
console.log("\nTEST 5 - the drawn first movement, and no arc");
fixture({ checkin: { energy: 6, mood: 3 } }); home();
ok("5a. a programme's suggestion shows its first movement, drawn, hidden from screen readers", !!card()?.querySelector(".path-today__fig[aria-hidden='true'] svg"));
fixture({ carry: true, checkin: { energy: 6, mood: 6 } }); home();
ok("5b. Carry on shows the next movement, drawn", !!card()?.querySelector(".path-today__fig[aria-hidden='true'] svg"));
fixture({ checkin: { energy: 7, mood: 6 } }); home();
ok("5c. a session the builder makes shows no drawing (its moves are not chosen yet)", !card()?.querySelector(".path-today__fig"));
fixture({ arc: false, checkin: { energy: 7, mood: 6 } }); home();
ok("5d. no arc: no arc line, and Home stays at six ways in (Progress offers Set up your arc)", !main.querySelector(".path-arcline") && waysIn().length <= 6);

console.log("\nTEST 6 - the coach's line, only when it adds to the card");
fixture({ checkin: { energy: 7, mood: 6 } }); home();
ok("6a. an ordinary day: no line above the arc (the card says it)", !main.querySelector(".path-note"));
fixture({ checkin: { energy: 7, mood: 6 } });
store.set("checkinHistory", { ...store.get("checkinHistory"), ...Object.fromEntries([1, 2, 3, 4].map(n => [new Date(Date.now() - n * 864e5).toISOString().split("T")[0], { energy: 2, mood: 6 }])) });
home();
ok("6b. a flat week is said, in BURN-3's words", /flatter few days|low for a while/.test(txt(main.querySelector(".path-note"))), txt(main.querySelector(".path-note")));

console.log(`\n${"=".repeat(60)}\nVERIFY-PLAN-HOME-PATH: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
