import { createRequire as __cr } from "node:module";
/**
 * tools/verify-path-progress.mjs
 * 31 Oct 2026 v1
 *
 * STAGE PATH Session 7 (P-7 PROGRESS-STORY; blueprint D6; P-12's Plan look,
 * Graeme 29 Oct: "I basically want a paying user to look at the app and see
 * it differently"). Drives the real views.
 *
 *   1. Progress, on the Plan, with three or more sessions rated before and
 *      after in the window: Before and after, the bars said in words to a
 *      screen reader, "Better after n of the m sessions you rated", and what
 *      seems to help (a better mood after it twice or more).
 *   2. Two pairs: nothing (two is not a pattern). Outside the window: not
 *      counted.
 *   3. Never a streak, days in a row, "down", a score or "best".
 *   4. Home's Lately and Progress read the same pairs the same way
 *      (data/progress-report.js moodStory): the same numbers.
 *   5. Free's Progress, Your year and Your impact: byte for byte as they were
 *      on alongside-v686.
 *   6. On the Plan, Your year and Your impact take the new look: "‹ Back",
 *      one heading, is-plan.
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
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
const ROOT = new URL("..", import.meta.url).pathname;
const { store } = await import(B + "store.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const PR = await import(B + "data/progress-report.js");
const { ProgressView } = await import(B + "views/progress.js");
const { TodayView } = await import(B + "views/today.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const fakeRouter = { history: ["today"], navigate() {}, back() {} };
globalThis.window.router = fakeRouter;
const day = n => new Date(Date.now() - n * 864e5);
const key = d => d.toISOString().split("T")[0];

/** pairs: [[daysAgo, before, after, name]] */
function fixture({ tier = "personal", pairs = [] } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("guidanceShownAt", new Date().toISOString());
  const hist = {}, log = [];
  pairs.forEach(([n, before, after, name], i) => {
    const d = day(n); d.setHours(12, 0, 0, 0);
    hist[key(d)] = { energy: 6, mood: before };
    log.push({ id: "p" + i, type: "yoga-session", name, completedAt: d.toISOString(), durationMins: 15, completed: true, moodAfter: after });
  });
  store.set("checkinHistory", hist); store.set("activityLog", log);
}
const progress = () => { main.innerHTML = ""; ProgressView(fakeRouter).mount(main); };
const section = () => main.querySelector(".pr-mood");

// ── 1 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 1 - Before and after, on the Plan");
const FOUR = [[1, 3, 7, "Calming yoga"], [3, 3, 7, "Calming yoga"], [5, 6, 6, "Upper body"], [8, 6, 7, "Upper body"]];
fixture({ pairs: FOUR }); progress();
ok("1a. the section is there, named Before and after", !!section() && txt(section().querySelector("h2")) === "Before and after", txt(main).slice(0, 160));
const svg = section()?.querySelector("svg[role=img]");
ok("1b. the bars are said in words", /^Mood before and after your last 4 sessions: better after 3, the same or lower after 1\.$/.test(svg?.getAttribute("aria-label") || ""), svg?.getAttribute("aria-label"));
ok("1c. Better after 3 of the 4 sessions you rated, in this window", /Better after 3 of the 4 sessions you rated before and after, in the last 30 days\./.test(txt(section())), txt(section()));
ok("1d. what seems to help: a better mood after it twice", /Calming yoga seems to help you most\./.test(txt(section())));
ok("1e. a key says which bar is which, in words", /Before\s*After/.test(txt(section().querySelector(".path-lately__key"))));

// ── 2 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 2 - from three, and inside the window");
fixture({ pairs: FOUR.slice(0, 2) }); progress();
ok("2a. two pairs: nothing shown", !section());
fixture({ pairs: [[1, 3, 7, "A"], [3, 3, 7, "B"], [40, 3, 7, "C"], [50, 3, 7, "D"]] }); progress();
ok("2b. sessions outside the 30 days are not counted (two inside: nothing)", !section());
fixture({ pairs: [[1, 3, 7, "A"], [3, 3, 7, "A"], [5, 3, 3, "B"]] }); progress();
ok("2c. control: three inside: shown", !!section() && /Better after 2 of the 3/.test(txt(section())));

// ── 3 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 3 - no streak, no down, no score");
fixture({ pairs: FOUR }); progress();
const words = txt(section()) + " " + (svg?.getAttribute("aria-label") || "");
ok("3a. no streak, days in a row, down, score, best, worst or record", !/streak|in a row|\bdown\b|score|\bbest\b|worst|record|\d+%/i.test(words), words);

// ── 4 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 4 - Home's Lately reads the same");
fixture({ pairs: FOUR }); main.innerHTML = ""; TodayView(fakeRouter).mount(main);
const homeLine = txt(main.querySelector(".path-lately__line"));
const story = PR.moodStory(PR.moodPairs(store.completedSessions(store.get("activityLog")), store.get("checkinHistory"), { last: 6 }), e => e.name);
ok("4a. Lately: the same count from the same reading", homeLine === `Better after ${story.better} of your last ${story.total}.` && story.better === 3, homeLine);
ok("4b. and the same what-helps", /Calming yoga seems to help you most/.test(txt(main.querySelector(".path-lately"))));

// ── 5 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 5 - Free, as it was on v686");
async function asWas(file) {
  let old = "";
  try { old = execSync(`git -C "${ROOT}" show 88fb565:${file}`, { encoding: "utf8", maxBuffer: 1 << 26 }); } catch {}
  if (!old) return null;
  const tmp = new URL(`../${file.replace(/\.js$/, "")}__v686_check.js`, import.meta.url);
  writeFileSync(tmp, old);
  try { return await import(tmp.href); } finally { unlinkSync(tmp); }
}
const draws = {
  "js/views/progress.js": mod => { main.innerHTML = ""; mod.ProgressView(fakeRouter).mount(main); return main.innerHTML; },
  "js/views/annual-reflection.js": mod => { main.innerHTML = ""; const v = mod.AnnualReflectionView(fakeRouter); (v.mount ? v.mount(main) : v.render?.(main)); return main.innerHTML; },
  "js/views/community-impact.js": mod => { main.innerHTML = ""; const v = mod.CommunityImpactView(fakeRouter); (v.mount ? v.mount(main) : v.render?.(main)); return main.innerHTML; },
};
for (const [file, draw] of Object.entries(draws)) {
  const OLD = await asWas(file);
  const NOW = await import(B + file.slice(3));
  fixture({ tier: "free", pairs: FOUR });
  const snap = JSON.stringify(store.data);
  const a = OLD ? (store.data = JSON.parse(snap), store.save(), draw(OLD)) : "";
  store.data = JSON.parse(snap); store.save();
  const b = draw(NOW);
  let at = 0; while (at < a.length && a[at] === b[at]) at++;
  ok(`5. Free ${file.split("/").pop()}: the same, byte for byte`, !!OLD && a === b && a.length > 200, `differs at ${at}: ${a.slice(at - 40, at + 40)} | ${b.slice(at - 40, at + 40)}`);
}

// ── 6 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 6 - the Plan's look, Your year and Your impact");
for (const file of ["js/views/annual-reflection.js", "js/views/community-impact.js"]) {
  fixture({ pairs: FOUR });
  draws[file](await import(B + file.slice(3)));
  const root = main.firstElementChild;
  ok(`6. ${file.split("/").pop()}: is-plan, "‹ Back", one heading`, root?.classList.contains("is-plan") && /^‹ Back$/.test(txt(main.querySelector(".workout-header .btn"))) && main.querySelectorAll("h1").length === 1,
     `${root?.className} | ${txt(main.querySelector(".workout-header .btn"))}`);
}

console.log(`\n${"=".repeat(60)}\nVERIFY-PATH-PROGRESS: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
