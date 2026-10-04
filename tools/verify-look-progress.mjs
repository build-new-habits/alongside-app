/**
 * tools/verify-look-progress.mjs
 * 04 Oct 2026 v1
 *
 * LOOK-2 PROGRESS-SHAPE (Graeme, 04 Oct: "Progress seems wordy and lacks
 * graphs ... Too much on one screen"; the mock-up approved the same day).
 * Drives the real ProgressView.
 *
 *   1. The overview: two numbers, one coach line, the weekly bars each
 *      labelled, the kinds of session as one bar in parts with every part
 *      named and counted, the arc's strands (a date or Not yet, a mark
 *      beside words), and the rows one tap away. No lift list, weight
 *      field or share buttons on it.
 *   2. Each row opens its own page (one h1, Back to Progress); Back
 *      returns to the overview with focus on the row.
 *   3. Lifts: grouped, each with its line, the same colour up or down.
 *   4. Build Your Base: this week's count, no target beside it.
 *   5. The weight note still speaks on the overview.
 *   6. Free: no kinds, no arc, no lifts; Your year and Share.
 *   7. Displays, never interprets: no streak, rank or gap words anywhere.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="c"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "MouseEvent", "Event"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const B = new URL("../js/", import.meta.url).href;
const { store }        = await import(B + "store.js");
const { ProgressView } = await import(B + "views/progress.js");
const { kindOf }       = await import(B + "data/kind-colours.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const iso = d => new Date(Date.now() - d * 86400000).toISOString();
const navs = [];

const LOG = [
  { id: "1", type: "gym-programme", status: "complete", completedAt: iso(1),  durationMins: 30 },
  { id: "2", type: "gym-programme", status: "complete", completedAt: iso(3),  durationMins: 25 },
  { id: "3", type: "workout",       status: "complete", completedAt: iso(9),  durationMins: 30, sessionType: "full" },
  { id: "4", type: "yoga-session",  status: "complete", completedAt: iso(12), durationMins: 20 },
  { id: "5", type: "class",         status: "complete", completedAt: iso(16), durationMins: 24 },
  // Predates TWO-ENGINE: a built session with no recorded shape. Skipped.
  { id: "6", type: "workout",       status: "complete", completedAt: iso(20), durationMins: 20 },
  // A type nobody can name. Skipped, never an "Other" row.
  { id: "7", type: "mystery-thing", status: "complete", completedAt: iso(21), durationMins: 10 },
];

function person(tier = "personal", extra = {}) {
  localStorage.clear(); store.init();
  store.set("tier", tier); store.set("name", "Graeme");
  store.set("createdAt", iso(34));
  store.set("activityLog", LOG);
  store.set("consent", { given: true, health: { given: true, at: iso(30), version: "2026-10-02" } });
  store.set("liftLog", {
    "gym-lat-pulldown": [{ at: iso(20), weight: 35, reps: 10, unit: "kg" }, { at: iso(2), weight: 40, reps: 10, unit: "kg" }],
    "gym-cable-pallof-press": [{ at: iso(20), weight: 15, reps: 10, unit: "kg" }, { at: iso(2), weight: 12.5, reps: 10, unit: "kg" }],
  });
  for (const [k, v] of Object.entries(extra)) if (k !== "aims") store.set(k, v);
}
let el;
function mount() {
  el = document.getElementById("c"); el.innerHTML = "";
  ProgressView({ navigate: v => navs.push(v) }).mount(el);
  return el;
}

// Use a real aim and real strands from the app's own data.
const { AIMS } = await import(B + "data/aims.js").catch(() => ({}));
const aimList = (AIMS && AIMS.list) || [];
const aim = aimList.find(a => (a.strands || []).length >= 2) || aimList[0];

// ── 1. THE OVERVIEW ─────────────────────────────────────────────────────
console.log("\nTEST 1 - the overview");
person("personal", { weightTracking: true, weightUnit: "st", weightLog: [{ at: iso(1), kg: 79 }] });
if (aim) store.set("arc", { active: true, aimId: aim.id, startedAt: iso(24), strands: aim.strands.slice(0, 3), zonesWorked: {}, typesWorked: {} });
mount();
ok("1pc. positive control: an aim with strands was found in the app's data", !!aim && (aim.strands || []).length >= 2);
ok("1a. one h1, Progress", el.querySelectorAll("h1").length === 1 && txt(el.querySelector("h1")) === "Progress");
const nums = [...el.querySelectorAll(".progress-summary__number")].map(txt);
ok("1b. two numbers: sessions (every completed one) and minutes", nums.length === 2 && nums[0] === "7" && /^\d+$/.test(nums[1]), JSON.stringify(nums));
ok("1c. the coach says one line, not four", el.querySelectorAll(".progress-narrative__text p").length === 1);
const bars = [...el.querySelectorAll(".pr-bar")];
ok("1d. every weekly bar shows its count and its week", bars.length >= 4 && bars.every(b => txt(b.querySelector(".pr-bar__value")) !== "" && txt(b.querySelector(".pr-bar__week")) !== ""),
   bars.map(b => `${txt(b.querySelector(".pr-bar__value"))}/${txt(b.querySelector(".pr-bar__week"))}`).join(" "));
ok("1e. and each bar has a name a screen reader says", bars.every(b => /Week of .+: \d+ sessions?/.test(txt(b.querySelector(".sr-only")))));
const parts = [...el.querySelectorAll(".pr-kinds__part")];
const kinds = [...el.querySelectorAll(".progress-shapes__row")];
ok("1f. kinds of session: one part per kind, each kind named and counted", parts.length === kinds.length && kinds.length === 4 &&
   kinds.every(r => txt(r.querySelector(".progress-shapes__name")) && /^\d+$/.test(txt(r.querySelector(".progress-shapes__count")))),
   kinds.map(txt).join(" | "));
ok("1g. classes, yoga and your own sessions are kinds too", ["Classes", "Yoga", "Your own sessions", "Full Body"].every(n => kinds.some(r => txt(r.querySelector(".progress-shapes__name")) === n)), kinds.map(txt).join(" | "));
ok("1h. a built session with no shape, and a type nobody can name, are skipped (no Other)", !/other/i.test(txt(el.querySelector(".progress-shapes"))) && kinds.reduce((n, r) => n + Number(txt(r.querySelector(".progress-shapes__count"))), 0) === 5);
ok("1i. each part and each dot carries its kind colour", parts.every(p => /pr-k--(teal|amber|violet|blue|rose|green|slate)/.test(p.className)) && kinds.every(r => /pr-k--/.test(r.querySelector(".pr-dot")?.className || "")));
ok("1h2. the kinds caption counts kinds only, so it never disagrees with the sessions number", /^4 kinds of session\.$/.test(txt(el.querySelector(".progress-shapes .pr-card__cap"))), txt(el.querySelector(".progress-shapes .pr-card__cap")));
ok("1j. the bar is decoration; the list says it", el.querySelector(".pr-kinds")?.getAttribute("aria-hidden") === "true");
const strands = [...el.querySelectorAll(".pr-strand")];
ok("1k. the arc's strands each have a mark and words (a date or Not yet)", strands.length >= 2 && strands.every(s => s.querySelector(".pr-strand__mark") && /^(Worked .+|Not yet)$/.test(txt(s.querySelector(".pr-strand__when")))), strands.map(txt).join(" | "));
const rows = [...el.querySelectorAll(".pr-row")].map(r => txt(r.querySelector(".pr-row__title")));
ok("1l. the rows one tap away: lifts, weight, Your year, Share", ["Your lifts", "Your weight", "Your year", "Share your progress"].every(r => rows.includes(r)), JSON.stringify(rows));
ok("1m. nothing else crowds the overview: no lift list, weight field or share buttons",
   !el.querySelector(".pr-lift, #weight-log-input, [data-export]"));
ok("1n. the weight row says the latest weight and its day", /12 st 6 lb · \d+ \w+/.test(txt([...el.querySelectorAll(".pr-row")].find(r => /Your weight/.test(txt(r))))),
   txt([...el.querySelectorAll(".pr-row")].find(r => /Your weight/.test(txt(r)))));

// ── 2. EACH ROW OPENS ITS PAGE ──────────────────────────────────────────
console.log("\nTEST 2 - each row opens its own page, and Back");
for (const [key, title] of [["lifts", "Your lifts"], ["weight", "Your weight"], ["share", "Share your progress"]]) {
  mount();
  click(el.querySelector(`[data-pr-page="${key}"]`));
  ok(`2.${key}a. ${title}: one h1, its own`, el.querySelectorAll("h1").length === 1 && txt(el.querySelector("h1")) === title, txt(el.querySelector("h1")));
  ok(`2.${key}b. focus on it, and Back says Progress`, document.activeElement === el.querySelector("h1") && /Progress/.test(el.querySelector("#pr-back")?.getAttribute("aria-label") || ""));
  ok(`2.${key}c. the overview is gone from the page`, !el.querySelector(".progress-summary, .pr-more"));
  click(el.querySelector("#pr-back"));
  ok(`2.${key}d. Back: the overview, focus on the row`, txt(el.querySelector("h1")) === "Progress" && document.activeElement?.dataset?.prPage === key, document.activeElement?.outerHTML?.slice(0, 70));
}
mount(); click(el.querySelector("[data-pr-page=weight]"));
ok("2e. the weight page has the field and the list, under its one h1", !!el.querySelector("#weight-log-input") && !el.querySelector("h2.progress-weight__heading"));
mount(); click(el.querySelector("[data-pr-page=share]"));
ok("2f. the share page has the three versions", el.querySelectorAll("[data-export]").length === 3);
mount(); click(el.querySelector("#progress-year-btn"));
ok("2g. Your year opens the year", navs.at(-1) === "annual-reflection");

// ── 3. LIFTS ────────────────────────────────────────────────────────────
console.log("\nTEST 3 - lifts, first to latest");
mount(); click(el.querySelector("[data-pr-page=lifts]"));
const lifts = [...el.querySelectorAll(".pr-lift")];
ok("3a. every lift, each with its words and its line", lifts.length === 2 && lifts.every(l => /→/.test(txt(l.querySelector(".pr-lift__text"))) && l.querySelector("svg.pr-spark[aria-hidden=true]")),
   lifts.map(txt).join(" | "));
ok("3b. grouped under Strength", txt(el.querySelector(".pr-group-title")) === "Strength");
const pallof = lifts.find(l => /Pallof/.test(txt(l)));
ok("3c. a lift that went down is drawn in the same colour as one that went up (no judgement)",
   !!pallof && !/red|green|danger|warn/i.test(pallof.outerHTML) && pallof.closest(".pr-lift-group") === lifts[0].closest(".pr-lift-group"));

// ── 4. BUILD YOUR BASE ──────────────────────────────────────────────────
console.log("\nTEST 4 - Build Your Base says this week, with no target beside it");
person("personal", {
  activeProgramme: { programmeId: "build-your-base", startedAt: iso(20), currentWeek: 3 },
  strategicGoal: { weeklySessionTarget: 3, setAt: iso(20), targetSetAt: iso(20) },
});
mount();
const prow = el.querySelector("[data-pr-page=programme]");
ok("4pc. positive control: the programme row is there", !!prow, [...el.querySelectorAll(".pr-row")].map(txt).join(" | "));
click(prow);
const ptxt = txt(el);
ok("4a. this week's count is said", /\b\d+ this week\b/.test(ptxt), ptxt.slice(0, 200));
ok("4b. and no target beside it, even one that was set", !/\d+ of \d+ this week/.test(ptxt));

// ── 5. THE WEIGHT NOTE ──────────────────────────────────────────────────
console.log("\nTEST 5 - the weight note speaks on the overview, once");
const wl = [0, 7, 14, 21, 28].map((d, i) => ({ at: iso(35 - d), kg: 90 - i * 1.6 }));
person("personal", { weightTracking: true, weightUnit: "kg", weightLog: wl });
mount();
ok("5a. the note is on the overview", !!el.querySelector(".progress-weight__note"), txt(el).slice(0, 120));
mount();
ok("5b. and not again", !el.querySelector(".progress-weight__note"));

// ── 6. FREE ─────────────────────────────────────────────────────────────
console.log("\nTEST 6 - Free");
person("free");
mount();
ok("6a. no kinds, no arc, no lifts row", !el.querySelector(".progress-shapes, #pr-arc-h, [data-pr-page=lifts]"));
ok("6b. Your year and Share are there", !!el.querySelector("#progress-year-btn") && !!el.querySelector("[data-pr-page=share]"));
ok("6c. two numbers and the weekly bars", el.querySelectorAll(".progress-summary__number").length === 2 && el.querySelectorAll(".pr-bar").length >= 1);

// ── 7. DISPLAYS, NEVER INTERPRETS ───────────────────────────────────────
console.log("\nTEST 7 - no streak, rank or gap words");
person("personal");
if (aim) store.set("arc", { active: true, aimId: aim.id, startedAt: iso(24), strands: aim.strands.slice(0, 3), zonesWorked: {}, typesWorked: {} });
mount();
const all = txt(el);
ok("7a. no streak language", !/streak|in a row|consecutive|keep it going/i.test(all));
ok("7b. nothing ranked or called a gap", !/\b(top|best|worst|least|favourite|behind on|missing|neglect)\b/i.test(all.replace(/Nothing is behind/, "")), all.slice(0, 200));
ok("7c. kind colours come from one place (data/kind-colours.js)", kindOf({ type: "class" }) === "rose" && kindOf({ type: "workout", sessionType: "mobility" }) === "violet" && kindOf({ type: "gym", source: "self-logged" }) === "amber");

console.log(`\nLOOK-PROGRESS: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
