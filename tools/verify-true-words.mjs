/**
 * tools/verify-true-words.mjs
 * 30 Sep 2026 v1
 *
 * W3-20 TRUE-WORDS (persona Wave 3, all eight). Lines the app said about
 * the person that were not true, each checked where it is said:
 *
 *    1. "That was your first one." -- whenever one session had been
 *       completed, not only on the finish of that one session.
 *    2. "...going into your first session" -- to somebody who had
 *       trained, because the opener counted check-ins.
 *    3. "More settled... the last couple of weeks" -- from the last 14
 *       check-ins, however few days they covered.
 *    4. "You have 20 minutes today" -- nobody had said so; it is their
 *       usual length.
 *    5. "mostly X" -- on a tie.
 *    6. "That is N sessions this week" -- counting part-sessions, and a
 *       week that began at the current time of day on Sunday.
 *    7. "You moved today" -- after a breathing session.
 *    8. "You picked this one yourself" -- when the coach picked it.
 *    9. Credits: finish screens said "+50 credits earned" in a currency
 *       nothing uses, while the Community page promises one credit per
 *       completed session (two on the Plan) and gave at most one a day,
 *       and only for the coach's workouts.
 *   10. Free's class list: "they know what you're working towards" --
 *       Free has no arc.
 *   11. Intervals: 45 and 60 minutes used the 30-minute script, so "Last
 *       one" came at 21 minutes; and "Everything you have left".
 *   12. Onboarding: "your conditions", "your own programme" -- neither is
 *       what the app does since 29 Sep (scope).
 *   13. "a upper body session"; "1 sessions".
 *   14. The core session's "I've kept hip extension loading light" (and
 *       its other below-acute claims): nothing is moved out below acute.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

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

const R = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const src = f => fs.readFileSync(new URL(f, R), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const { store } = await import(B + "store.js");
const rtr = { navigate() {}, back() {}, history: [] };
globalThis.router = rtr; dom.window.router = rtr;

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const wait = ms => new Promise(r => setTimeout(r, ms));
const iso = (daysAgo, h = 10) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(h, 0, 0, 0); return d.toISOString(); };
const localDay = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function fresh(tier = "free") {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "Sam");
}

// 1
console.log("\n1 - That was your first one");
const SM = await import(B + "data/session-moments.js");
fresh();
store.set("activityLog", [{ id: "a", type: "workout", status: "completed", completedAt: iso(1) }]);
store.set("currentActivityEntry", { id: "b", type: "walk" });   // this finish is about something else
ok("1a. not said on the finish of a session that is not the first", !/your first one/i.test(SM.renderSessionMoments({})));
store.set("currentActivityEntry", store.get("activityLog")[0]);
ok("1b. control: said on the first one's own finish", /your first one/i.test(SM.renderSessionMoments({})));

// 2 and 3
console.log("\n2, 3 - check-in openers");
const CO = await import(B + "data/checkin-openings.js");
fresh();
store.set("onboarding.primaryTerritory", "wrong-fit");   // its day-one line says "before your first session"
store.set("activityLog", [1, 2].map(n => ({ id: "w" + n, type: "workout", status: "completed", completedAt: iso(n) })));
const o2 = Array.from({ length: 12 }, () => CO.resolveOpening()).map(o => `${o.b1} ${o.b2}`);
ok("2a. somebody who has trained is never told it is their first session", !o2.some(s => /first session|very first/i.test(s)), o2.find(s => /first session/i.test(s)) || "");
fresh();
store.set("onboarding.primaryTerritory", "wrong-fit");
const o2c = Array.from({ length: 6 }, () => CO.resolveOpening()).map(o => `${o.b1} ${o.b2}`);
ok("2b. control: a true day one is still told it is their first", o2c.some(s => /first session/i.test(s)), o2c[0]);
fresh();
const hist = {};
for (let i = 9; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i - 1); hist[localDay(d)] = { energy: i >= 5 ? 3 : 7, mood: 6 }; }
store.set("checkinHistory", hist);
const o3 = Array.from({ length: 40 }, () => CO.resolveOpening()).map(o => o.b1);
ok("3a. ten check-ins over ten days: never 'the last couple of weeks... more settled'", !o3.some(s => /couple of weeks/.test(s)), o3.find(s => /couple of weeks/.test(s)) || "");
fresh();
const hist2 = {};
for (let i = 27; i >= 1; i--) { const d = new Date(); d.setDate(d.getDate() - i); hist2[localDay(d)] = { energy: i >= 14 ? 4 : 6, mood: 6 }; }
store.set("checkinHistory", hist2);
const o3b = Array.from({ length: 80 }, () => { store.set("checkin.lastOpeningMode", null); return CO.resolveOpening(); }).map(o => o.b1);
ok("3b. control: four weeks, the last two steadier, can still be said", o3b.some(s => /couple of weeks/.test(s)), [...new Set(o3b)].slice(0, 3).join(" | "));

// 4 and 6
console.log("\n4, 6 - the check-in summary and the finish's week");
const ck = src("js/views/checkin.js");
ok("4a. the check-in no longer tells somebody what time they have today", !/You have \$\{tl\[/.test(ck) && /your usual/.test(ck));
const rf = src("js/views/reflect.js");
const bs = rf.slice(rf.indexOf("function buildSummary"), rf.indexOf("function buildSummary") + 700);
ok("6a. the finish's week counts completed sessions, from the start of the day", /completedSessions\(/.test(bs) && /setHours\(0, ?0, ?0, ?0\)/.test(bs), bs.slice(0, 300));

// 5
console.log("\n5 - mostly");
const AR = await import(B + "data/arc-readback.js");
const two = [{ type: "walk", completedAt: iso(1) }, { type: "run", completedAt: iso(2) }];
ok("5a. a tie is not 'mostly' anything", AR.sessionsInWindow(two, { kindOf: e => e.type }).topKind === null);
const three = [...two, { type: "walk", completedAt: iso(3) }];
ok("5b. control: two walks and a run is mostly walks", AR.sessionsInWindow(three, { kindOf: e => e.type }).topKind === "walk");

// 7
console.log("\n7 - You moved today");
const { TodayView } = await import(B + "views/today.js");
fresh();
store.set("activityLog", [{ id: "br", type: "mindfulness", status: "completed", completedAt: new Date().toISOString(), durationMins: 3 }]);
main.innerHTML = ""; TodayView(rtr).mount(main); await wait(10);
ok("7a. after breathing only, Home does not say 'You moved today'", !/You moved today/.test(txt(main)), txt(main).slice(0, 160));
fresh();
store.set("activityLog", [{ id: "wk", type: "walk", status: "completed", completedAt: new Date().toISOString(), durationMins: 20 }]);
main.innerHTML = ""; TodayView(rtr).mount(main); await wait(10);
ok("7b. control: after a walk, it does", /You moved today/.test(txt(main)));

// 8
console.log("\n8 - You picked this one yourself");
const SB = await import(B + "session-builder.js");
fresh();
const pools = SB.buildCandidatePools({ sessionType: "full", durationMins: 30, equipmentOverride: ["dumbbells-light"] });
const ids = ["warmup", "main", "cooldown"].flatMap(s => pools[s].filter(e => e.recommended).map(e => e.id));
const rec = SB.buildSessionFromSelection({ sessionType: "full", durationMins: 30, selectedIds: ids, equipmentOverride: ["dumbbells-light"], recommended: true });
ok("8a. the coach's recommendation does not say they picked it", !/picked this one yourself/i.test(rec.coachLine), rec.coachLine);
const own = SB.buildSessionFromSelection({ sessionType: "full", durationMins: 30, selectedIds: ids.slice(0, 5), equipmentOverride: ["dumbbells-light"] });
ok("8b. control: their own choice still says so", /picked this one yourself/i.test(own.coachLine), own.coachLine);
const ui = src("js/views/session-builder-ui.js");
ok("8c. Coach recommends asks for the coach's words", /recommended:\s*true/.test(ui.slice(ui.indexOf("function triggerRecommendedBuild"), ui.indexOf("function triggerRecommendedBuild") + 1500)));

// 9
console.log("\n9 - credits");
const views = fs.readdirSync(new URL("js/views/", R)).filter(f => f.endsWith(".js"));
const legacy = views.filter(f => /\+\$\{creditsEarned\}\s*credits/.test(src("js/views/" + f)));
ok("9a. no finish screen shows '+N credits' in a currency nothing uses", legacy.length === 0, legacy.join(", "));
fresh("free");
const credit = () => store.get("community")?.credits || 0;
const log = e => store.logActivity({ completedAt: new Date().toISOString(), date: new Date().toISOString(), ...e }, 0);
log({ type: "walk", status: "completed", durationMins: 20 });
log({ type: "class", status: "complete", durationMins: 15, completedAt: new Date(Date.now() + 60000).toISOString() });
ok("9b. Free: a walk and a class the same day earn one credit each", credit() === 2, String(credit()));
log({ type: "mindfulness", status: "completed", durationMins: 3, completedAt: new Date(Date.now() + 120000).toISOString() });
log({ type: "workout", status: "partial", durationMins: 4, completedAt: new Date(Date.now() + 180000).toISOString() });
ok("9c. breathing and a session stopped part-way earn none", credit() === 2, String(credit()));
fresh("personal");
log({ type: "run", status: "completed", durationMins: 30 });
ok("9d. the Plan: two", credit() === 2, String(credit()));
const W = src("js/views/workout.js") + src("js/views/gym-programme.js") + src("js/data/programmeEngine.js");
ok("9e. awarded in one place (the log), not also by the players", !/awardCommunityCredit\(\)/.test(W));

// 10
console.log("\n10 - the class list on Free");
const CL = await import(B + "views/class-list.js");
fresh("free");
main.innerHTML = CL.render(); try { CL.onMount(); } catch {}
ok("10a. Free is not told the classes know what they are working towards", !/know what you.re working towards/.test(txt(main)), txt(main).slice(0, 200));

// 11
console.log("\n11 - intervals");
const RS = await import(B + "views/running-session.js");
const scripts = RS.intervalScript ? [20, 30, 45, 60].map(m => ({ m, s: RS.intervalScript(m) })) : [];
ok("11pc. the interval script is built from the length", scripts.length === 4);
const lastOk = scripts.every(({ m, s }) => {
  const work = s.filter(p => p.type === "work");
  const li = s.findIndex(p => /\blast\b/i.test(p.text));
  return work.length >= 3 && li === s.indexOf(work[work.length - 1]) && work[work.length - 1].at <= m * 60 - 300 && s.every(p => p.at < m * 60);
});
ok("11a. at every length, 'last' is the last effort, and it leaves an easy finish", lastOk, scripts.map(({ m, s }) => `${m}: ${s.filter(p => p.type === "work").map(p => p.at).join(",")}`).join(" | "));
ok("11b. no 'everything you have left' or 'give it what you have'", !scripts.some(({ s }) => s.some(p => /everything you have left|give it what you have/i.test(p.text))) && !/Everything you have left|Give it what you have/.test(src("js/views/running-session.js")));

// 12
console.log("\n12 - onboarding");
const b3 = src("js/data/beat3-scripts.js");
ok("12a. no 'your conditions' or 'your own programme'", !/your conditions|your own programme/i.test(b3));

// 13
console.log("\n13 - grammar");
const AL = await import(B + "data/activity-labels.js");
const ph = AL.activityPhrase({ type: "workout", sessionType: "upper", status: "completed" });
ok("13a. 'an upper body session', not 'a upper body session'", !/\ba upper\b/i.test(ph), ph);
const pr = src("js/views/progress.js");
ok("13b. the progress summary says '1 session', not '1 sessions'", !/\$\{count\} sessions/.test(pr));

// 14
console.log("\n14 - the core session's sore lines");
const cs = src("js/views/core-session.js");
const note = cs.slice(cs.indexOf("function buildConditionNote"), cs.indexOf("function buildConditionNote") + 3000);
ok("14a. no 'I've kept hip extension loading light'", !/kept hip extension loading light/.test(note));

console.log("");
if (fails) { console.log(`TRUE-WORDS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`TRUE-WORDS: all ${passes} assertions pass\n`);
process.exit(0);
