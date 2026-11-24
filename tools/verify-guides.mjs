/**
 * tools/verify-guides.mjs
 * 24 Nov 2026 v6
 *
 * v6 - P-44 S5: B2 I want my physio or trainer to change my exercises
 *   (the Plan), walked from Progress to Share the link.
 *
 * v5 - P-39 S6: A3 has two ways, from Start your Plan while it shows and
 *   from Settings › Your plan once it is closed (Home keeps no standing
 *   link). Both walked.
 *
 * v4 - P-39 S5: A3 Make Home show only what I want (the Plan), walked
 *   from Start your Plan on Home. Proven: with That's mine unmarked, A3
 *   stops at 4 of 5.
 *
 * v3 - On the live app (Graeme, 15 Nov: "Where's this?"): A1 on a Home led
 *   by today's day from your week had nothing to ring. TEST 4 now walks A1
 *   from every Home that starts something (the coach; a session from your
 *   week; your own list from your week; already checked in today), and
 *   TEST 8 checks every guide On this screen has its first button on that
 *   screen, in every Home state, and Make this smaller keeps its words.
 *
 * v2 - Graeme's review (15 Nov): Help shows on a player's start screen and
 *   goes when the session runs (2g, 2h, 2i); between screens the box says
 *   "One moment…", then off the route (5m, 5n); at large text the box's
 *   buttons are said shorter, each name beginning with its word (5o); the
 *   guides' goal-level titles (3c, 3d, 3h, 3l).
 *
 * v1 - P-25 HOW-TO GUIDES (spec v3 §2.5). The guides can't go out of date
 * silently. The check works from the screens, not the source: a label in
 * code that is never drawn must not pass.
 *
 *   1  The data: every guide whole; each way's condition known; every Not
 *      quite leads to a guide that exists, or has its answer, and none
 *      leads back to where it started; the safety words are the app's own.
 *   2  Help: in the shell, on both tiers, on Home and in the check-in;
 *      hidden while a session runs; clear of the house button.
 *   3  How do I…?: its own heading takes focus; On this screen only what
 *      the person can do (left out when none); search by keyword, and a
 *      plain answer when nothing matches; Part of the Plan last on Free;
 *      Still stuck? with the address and the support lines; Back returns
 *      to where they were, with focus on Help.
 *   4  WALKS EVERY GUIDE (v3): for each guide and each way it has, from a
 *      fixture person, Guide me through it step by step with the real
 *      router: the step's screen is showing; its marker is on a visible
 *      control; that control's name is the step's label; pressing it leads
 *      on. A guide that can't be walked from start to finish is red.
 *   5  The box: Back a step, Stop the guide; off the route ("You've left
 *      the guide.", Carry on from here); the end, and Did that work?
 *   6  Reversal: a label renamed in a copy turns the label check red and
 *      names the guide.
 *   7  Nothing is stored or sent: guides.js, guide.js and help.js never
 *      write the store, browser storage or the network.
 *
 *   node tools/verify-guides.mjs
 */
import { readFileSync } from "node:fs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const ROOT = new URL("../", import.meta.url);
const html = readFileSync(new URL("index.html", ROOT), "utf8");
const navHTML = html.match(/<nav id="bottom-nav"[\s\S]*?<\/nav>/)[0];
const dom = new JSDOM(`<!doctype html><body><div id="app" class="app-container">
  <div id="sr-announcer"></div><div id="help-row" class="help-row" hidden></div>
  <main id="main-content" class="main-content"></main>${navHTML}<div id="toast-container"></div><div id="modal-container" class="hidden"></div></div>
  <button id="hidden-nav-home-btn" class="hidden-nav-escape hidden" type="button" aria-label="Back to Today"></button>
  <div id="guide-overlay"></div><p id="guide-live" class="sr-only" role="status" aria-live="polite"></p></body>`, { url: "https://app.test/", pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "sessionStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob", "MutationObserver", "getComputedStyle", "DOMParser", "HTMLInputElement", "HTMLTextAreaElement"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
// Reduce motion: the check-in's pauses are nothing (prefersReducedMotion), so the walk is quick.
dom.window.matchMedia = q => ({ matches: /reduce/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
globalThis.matchMedia = dom.window.matchMedia;
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {}; dom.window.scrollBy = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;
dom.window.speechSynthesis = undefined;
process.on("unhandledRejection", e => { if (process.env.DEBUG) console.log("  (unhandled)", e?.message || e); });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
const GD = await import(B + "data/guides.js");
const GE = await import(B + "guide.js");
const WM = await import(B + "data/week-shape-model.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
window.router = router; globalThis.router = router;
router.init();
GE.initGuides(router);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 600)}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const norm = s => String(s || "").replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 6000) { const t = Date.now(); while (Date.now() - t < ms) { try { if (fn()) return true; } catch { /* not yet */ } await sleep(25); } return false; }

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const nameOf = el => norm(el.getAttribute("aria-label") || el.textContent);
/** Its visible words and its accessible name, either of which a guide may name. */
const namesOf = el => {
  const byFor = el.id ? document.querySelector(`label[for="${el.id}"]`) : null;
  const by = (el.getAttribute("aria-labelledby") || "").split(/\s+/).map(i => i && document.getElementById(i)).filter(Boolean);
  return [norm(el.textContent), norm(el.getAttribute("aria-label") || ""), norm(byFor?.textContent), ...by.map(x => norm(x.textContent))].filter(Boolean);
};
/** Does this control carry the step's label? textContent (look-labels are uppercase in CSS), either apostrophe. */
export function labelOK(el, label) {
  if (!el) return false;
  const labels = Array.isArray(label) ? label : [label];
  const own = namesOf(el), inner = [...el.querySelectorAll("button, label")].flatMap(namesOf);
  const names = [...own, ...inner];
  return labels.some(l => {
    if (l === "*") return names.length > 0;
    if (l === "{day}") return names.some(n => DAYS.some(d => n.startsWith(d)));
    if (l === "Save {day}") return names.some(n => DAYS.some(d => n === "Save " + d));
    if (l === "Start {list}") return names.some(n => /^Start \S/.test(n));
    const want = norm(l).replace(/\.$/, "");
    return names.some(n => n.replace(/\.$/, "").startsWith(want));
  });
}

// ── Fixtures ──────────────────────────────────────────────────────────
const ex = (group, name) => ({ id: group + "-" + name, name, sets: 3, reps: "10", group, completedToday: false });
const LISTS = [ex("Morning routine", "Cat-cow"), ex("Morning routine", "Glute bridge"), ex("Gym A", "Goblet squat"), ex("Gym A", "Lat pulldown")];
const todayKey = WM.DAY_KEYS[(new Date().getDay() + 6) % 7];
function person({ tier = "personal", own = false, week = null, arc = false, ackDone = false, checkedIn = false, rest = false, closed = false } = {}) {
  GE.stopGuide({ quiet: true });
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("safetyAckLog", ackDone ? Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })) : []);
  store.set("guidanceLastShownAt", new Date().toISOString());
  if (own) store.set("prescribedExercises", JSON.parse(JSON.stringify(LISTS)));
  if (week === "own" || week === "session") {
    const days = Object.fromEntries(WM.DAY_KEYS.map(k => [k, "rest"]));
    days[todayKey] = rest ? "rest" : "t-gym";
    const t = { id: "t-gym", name: week === "own" ? "Gym A" : "Sunday plan", mix: [{ focus: "upper", level: 2 }], intensity: "steady", mins: 30, place: "gym" };
    if (week === "own") t.own = "Gym A";
    store.set("weekShape", WM.sanitizeWeekShape({ templates: { "t-gym": t }, days, setAt: "2026-11-01" }));
  }
  if (checkedIn) {
    const at = new Date().toISOString();
    store.set("lastCheckin", { timestamp: at, date: new Date().toDateString(), energy: 3, mood: 3, sore: [] });
  }
  if (arc) store.set("arc", { active: true, aimId: "sport-without-flaring", strands: ["hip-range"], startedAt: new Date(Date.now() - 14 * 864e5).toISOString() });
  if (closed) store.setMyMove({ startClosed: new Date().toISOString() });
  router.history = []; router.currentView = null; router.helpFrom = null;
}
async function go(view) { await router.navigate(view); await sleep(80); }

// ─────────────────────────────────────────────────────────────────────────
console.log("\nTEST 1 - the data");
{
  const ids = GD.GUIDES.map(g => g.id);
  ok("1a. the seven P1 guides, each once", ["A1", "A2", "B1", "C1", "C2", "D1", "E3"].every(i => ids.includes(i)) && new Set(ids).size === ids.length, ids.join(","));
  const bad = [];
  for (const g of GD.GUIDES) {
    if (!GD.CATEGORIES.some(c => c.id === g.cat)) bad.push(g.id + " category");
    if (!g.title || !g.outcome || !g.on?.length || !g.keywords?.length) bad.push(g.id + " fields");
    if (!g.tiers.every(t => ["free", "plan"].includes(t))) bad.push(g.id + " tiers");
    for (const w of g.ways || []) {
      if (!GD.WHEN[w.when]) bad.push(g.id + " when " + w.when);
      for (const p of w.parts) {
        if (p.steps.length < 1 || p.steps.length > 7) bad.push(g.id + " part length " + p.steps.length);
        for (const s of p.steps) {
          const opts = s.alts || [s];
          if (!s.screen || opts.some(o => !o.target || !o.say)) bad.push(g.id + " step " + (s.say || "").slice(0, 30));
          if (opts.some(o => o.label && o.label !== "*" && !String(o.label).includes("{") && /\*\*/.test(o.say) && !(Array.isArray(o.label) ? o.label : [o.label]).some(l => norm(o.say).includes(norm(l).replace(/\.$/, ""))))) bad.push(g.id + " label not in its words: " + JSON.stringify(opts.map(o => o.label)));
        }
      }
    }
    if (g.readOnly && !(g.read?.length && GD.guideById(g.walk))) bad.push(g.id + " read");
  }
  ok("1b. every guide whole: category, words, steps (1 to 7 a part), each label in its step's words", !bad.length, bad.join(" | "));
  const nq = [];
  for (const g of GD.GUIDES) for (const n of g.notQuite) {
    if (n.guide && !GD.guideById(n.guide)) nq.push(g.id + " -> missing " + n.guide);
    if (!n.guide && !n.answer) nq.push(g.id + " no answer: " + n.q);
    if (n.guide === g.id) nq.push(g.id + " loops to itself");
  }
  // No branch leads back to where it started (one level deep, then on).
  const seen = (start, id, depth = 0) => depth > 6 ? false : (GD.guideById(id)?.notQuite || []).some(n => n.guide && (n.guide === start || seen(start, n.guide, depth + 1)));
  for (const g of GD.GUIDES) if (seen(g.id, g.id)) nq.push(g.id + " loops back");
  ok("1c. Not quite: each leads to a guide that exists or has its answer; none leads back to where it started", !nq.length, nq.join(" | "));
  const coach = readFileSync(new URL("js/views/coach-proposal.js", ROOT), "utf8");
  const safety = GD.GUIDES.flatMap(g => g.notQuite).filter(n => /hurts/.test(n.answer || ""));
  ok("1d. the safety words are the app's own, word for word (never rewritten)", safety.length >= 2 && safety.every(n => coach.includes("If something hurts — sharp, or building as you go — stop that one. Aching afterwards is normal.") && n.answer.includes("If something hurts — sharp, or building as you go — stop that one. Aching afterwards is normal.")));
  const words = JSON.stringify(GD.GUIDES);
  ok("1e. no health advice words, no all-caps, no blame", !/\b(treat|cure|heal|diagnos|you failed|you forgot)\b/i.test(words) && !/\b[A-Z]{4,}\b/.test(words.replace(/\b(TEST|PASS|FAIL)\b/g, "")), words.match(/\b[A-Z]{4,}\b/)?.[0] || "");
}

console.log("\nTEST 2 - Help, in the shell");
person({ tier: "personal" });
await go("today");
{
  const row = document.getElementById("help-row"), btn = document.getElementById("help-btn");
  ok("2a. Help on the Plan's Home: the word Help with a line icon, a button", !!btn && !row.hidden && txt(btn) === "Help" && !!btn.querySelector("svg[aria-hidden='true']") && btn.tagName === "BUTTON");
  ok("2b. its name begins with its visible word (SC 2.5.3)", nameOf(btn).startsWith("Help"));
  ok("2c. drawn once, before the page, so in the same place and order on every screen (SC 3.2.6)", document.querySelectorAll("#help-btn").length === 1 && row.nextElementSibling === main);
  const css = readFileSync(new URL("css/components/help.css", ROOT), "utf8");
  ok("2d. not fixed over content: it scrolls with the page (SC 2.4.11); at least 44 px", !/\.help-row\s*\{[^}]*position:\s*fixed/.test(css) && /\.help-btn\s*\{[^}]*min-height:\s*44px/.test(css));
  person({ tier: "free" }); await go("today");
  ok("2e. Help on Free's Home too", !document.getElementById("help-row").hidden);
  await go("checkin");
  ok("2f. shown in the check-in, where first-timers are, and kept clear of the house button", !document.getElementById("help-row").hidden && document.getElementById("help-row").classList.contains("help-row--hatch"));
  const hidden = ["plan-finish", "reflect", "red-flag", "age-check", "guide-me", "class-player"].filter(v => !GE.HELP_HIDDEN.has(v));
  const players = ["workout", "yoga-session", "prescribed-session", "breathing-session", "walk-session", "core-session"].filter(v => !GE.PLAYERS.has(v));
  ok("2g. hidden on the gates, the finish and the guided players; the players decide by whether a session runs", !hidden.length && !players.length, hidden.concat(players).join(","));
  person({ tier: "personal", own: true }); await go("prescribed-session"); await sleep(80);
  ok("2h. a player's start screen (the safety note, Start): Help is there", !document.getElementById("help-row").hidden);
  const SG = await import(B + "session-guard.js");
  SG.mountSessionGuard({ isActive: () => true, onExit() {} });
  main.appendChild(document.createElement("span"));
  await until(() => document.getElementById("help-row").hidden, 1500);
  ok("2i. the session running: Help goes, with nothing to tap", document.getElementById("help-row").hidden);
  SG.dismountSessionGuard();
}

console.log("\nTEST 3 - How do I…?");
person({ tier: "personal" });
await go("today");
{
  click(document.getElementById("help-btn"));
  await until(() => main.querySelector(".help-view h1"));
  if (process.env.DEBUG) console.log("  [dbg]", router.currentView, txt(main).slice(0, 200));
  const h1 = main.querySelector("h1");
  ok("3a. Help opens How do I…?, its own heading, which takes focus", txt(h1) === "How do I…?" && document.activeElement === h1);
  ok("3b. the tab is the tab of the screen it came from", document.querySelector('#bottom-nav [data-nav="today"]').getAttribute("aria-current") === "page");
  const here = main.querySelector("#help-here-h")?.closest("section");
  ok("3c. On this screen: Home's guides, only what this person can do", !!here && /On this screen: Home/i.test(txt(here)) && /just opened the app/.test(txt(here)) && !/Start today’s session/.test(txt(here)), txt(here));
  const q = main.querySelector("#help-q");
  q.value = "physio"; q.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  ok("3d. search by the words people use: physio finds both physio guides (B1, and B2 since P-44 S5)", /2 guides match/.test(txt(main.querySelector("#help-count"))) && /know my physio plan/.test(txt(main.querySelector("#help-results"))) && /physio or trainer to change my exercises/.test(txt(main.querySelector("#help-results"))), txt(main.querySelector("#help-count")));
  q.value = "zebra crossing"; q.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  ok("3e. nothing matched: said plainly, and the groups stay", /Nothing matched/.test(txt(main.querySelector("#help-count"))) && main.querySelectorAll("[data-cat]").length >= 5);
  ok("3f. only groups with guides (no empty group)", [...main.querySelectorAll("[data-cat]")].every(b => !/\b0 guides/.test(txt(b))));
  const stuck = main.querySelector(".help-stuck");
  ok("3g. Still stuck?: the address with Copy, nothing sent; the support lines as written", /hello@buildnewhabits\.co\.uk/.test(txt(stuck)) && !!stuck.querySelector('[data-help="copy"]') && !!main.querySelector("[data-support-lines]") && /116 123/.test(txt(main)));
  click(main.querySelector('[data-cat="week"]')); await sleep(20);
  ok("3h. a group lists its guides, by what people want", txt(main.querySelector("h1")) === "Your week" && /I want my sessions on set days/.test(txt(main)));
  click(main.querySelector('[data-guide="C1"]')); await sleep(20);
  ok("3i. a guide opens on its overview: what you end up with, its steps, Guide me through it", /Two parts/.test(txt(main)) && main.querySelectorAll("ol.help-steps li").length >= 7 && /Guide me through it/.test(txt(main.querySelector('[data-help="go"]'))));
  click(main.querySelector('[data-help="back"]')); await sleep(10);
  click(main.querySelector('[data-help="back"]')); await sleep(10);
  ok("3j. Back, Back: How do I…? again", txt(main.querySelector("h1")) === "How do I…?");
  click(main.querySelector('[data-help="back"]'));
  await until(() => router.currentView === "today" && document.activeElement?.id === "help-btn", 1500);
  ok("3k. Back leaves for where they were, with focus on Help (SC 2.4.3)", router.currentView === "today" && document.activeElement?.id === "help-btn", router.currentView + " " + document.activeElement?.id);

  person({ tier: "free" }); await go("today");
  click(document.getElementById("help-btn")); await until(() => main.querySelector(".help-view"));
  click(main.querySelector('[data-cat="week"]')); await sleep(20);
  ok("3l. Free: the Plan's guides last, under Part of the Plan (the only mention of it)", /Part of the Plan/.test(txt(main)) && /I want my sessions on set days/.test(txt(main)));
  click(main.querySelector('[data-guide="C1"]')); await sleep(20);
  ok("3m. Free opening a Plan guide: “This is part of the Plan.”, no Guide me, no selling", /This is part of the Plan\./.test(txt(main)) && !main.querySelector('[data-help="go"]') && !/upgrade|subscribe|£/i.test(txt(main)));
}

console.log("\nTEST 4 - walks every guide, from the screens");
const FIX = {
  "A1:homeStarts": { tier: "personal" },
  "A1:free": { tier: "free" },
  "A3:startOpen": { tier: "personal" },   // S5: Making my Move, from Start your Plan
  "A3:startClosed": { tier: "personal", closed: true },   // S6: from Settings › Your plan
  "A2:weekLeads": { tier: "personal", own: true, week: "own" },
  "B1:always": { tier: "personal" },
  "B2:always": { tier: "personal", own: true },   // P-44 S5: the physio link
  "C1:noWeek": { tier: "personal", own: true },
  "C1:hasWeek": { tier: "personal", own: true, week: "own" },
  "C2:always": { tier: "personal", own: true },
  "E3:noArc": { tier: "personal" },
  "E3:hasArc": { tier: "personal", arc: true },
};
const PLAN = "Morning routine\nCat-cow | 2 x 10\nGlute bridge | 3 x 12\n\nGym A\nGoblet squat | 3 x 10\nLat pulldown | 3 x 10";
const pick = (el, label) => {
  // In a group, the control the step names; for any day, Monday; else the first.
  const btns = [...el.querySelectorAll("button")].filter(b => !b.disabled);
  if (!btns.length) return el;
  if (label === "{day}") return btns.find(b => /^Mon/.test(nameOf(b))) || btns[0];
  const want = Array.isArray(label) ? label[0] : label;
  return btns.find(b => norm(nameOf(b)).startsWith(norm(want))) || btns[0];
};
async function walk(g, way, label) {
  const w = GD.wayFor(g);
  if (w !== way) { ok(`4. ${g.id}:${way.when}${label ? " (" + label + ")" : ""}: the fixture gives this way`, false, w?.when); return; }
  router.helpFrom = "today";
  GE.startGuide(g.id);
  const steps = GD.stepsOf(way);
  const problems = [];
  let reached = 0;
  for (let n = 0; n < 40; n++) {
    const st = GE.guideState();
    if (!st.id || st.ended) break;
    const s = st.step;
    const want = s.screen === "any" ? null : (Array.isArray(s.screen) ? s.screen : [s.screen]);
    // A screen the guide waits through (the check-in): the person answers it.
    for (let q = 0; q < 6 && router.currentView === "checkin" && want && !want.includes("checkin"); q++) {
      await until(() => GE.guideState().waiting === "pass" || router.currentView !== "checkin", 1500);
      if (router.currentView !== "checkin") break;
      if (q === 0 && !/Answer the questions/.test(txt(document.querySelector("#guide-overlay")))) problems.push("the check-in on the way: the box did not say to answer the questions");
      await until(() => GE.findTarget(["energy", "mood", "sore"]) || router.currentView !== "checkin", 3000);
      const grp = GE.findTarget(["energy", "mood", "sore"]);
      if (grp) click(grp.querySelector("button")); else break;
      await sleep(150);
    }
    const shown = await until(() => {
      const t = GE.guideState(); if (t.ended || t.i !== st.i || t.sub !== st.sub) return true;
      return (!want || want.includes(router.currentView)) && GE.findTarget(t.step.target);
    });
    const now = GE.guideState();
    if (now.ended || now.i !== st.i || now.sub !== st.sub) continue;   // an optional step skipped itself
    if (!shown) { problems.push(`step ${st.i + 1}${st.sub ? "b" : ""} (${s.target}): on ${router.currentView}, marker ${GE.findTarget(s.target) ? "found" : "missing"}`); break; }
    if (process.env.DEBUG) console.log("   [walk]", g.id, st.i, router.currentView, JSON.stringify(GE.guideState().off), txt(document.querySelector("#guide-overlay")).slice(0, 80));
    const el = GE.findTarget(s.target);
    if (!el.classList.contains("gd-ring")) await until(() => el.classList.contains("gd-ring"), 800);
    if (!el.classList.contains("gd-ring")) problems.push(`step ${st.i + 1}: not ringed (${JSON.stringify({ ...GE.guideState(), steps: undefined, way: undefined, step: undefined })}, view ${router.currentView} via ${(router._trail || []).join(">")}, ${document.querySelectorAll("[data-guide-target='" + s.target + "']").length} markers)`);
    await until(() => norm(txt(document.querySelector("#guide-overlay .gd-dock__say"))) === norm(GD.plainSay(GE.guideState().step?.say)), 800);
    const sayNow = txt(document.querySelector("#guide-overlay .gd-dock__say"));
    if (norm(sayNow) !== norm(GD.plainSay(s.say))) problems.push(`step ${st.i + 1}: the box says "${sayNow}"`);
    if (s.label && !labelOK(el, s.label)) problems.push(`step ${st.i + 1}: "${nameOf(el).slice(0, 60)}" is not ${JSON.stringify(s.label)}`);
    reached++;
    if (s.tap === false) {
      if (s.target === "plan-text") { el.value = PLAN; el.dispatchEvent(new dom.window.Event("input", { bubbles: true })); }
      click(document.querySelector('#guide-overlay [data-gd="next"]'));
    } else {
      const c = pick(el, s.label);
      if (c.tagName === "TEXTAREA") click(c); else click(c);
    }
    await until(() => { const t = GE.guideState(); return !t.id || t.ended || t.i !== st.i || t.sub !== st.sub; }, 3000);
    const after = GE.guideState();
    if (after.pause) { await until(() => document.querySelector('#guide-overlay [data-gd="carry"]'), 1000); click(document.querySelector('#guide-overlay [data-gd="carry"]')); await until(() => !GE.guideState().pause, 1000); }
    if (after.off) { problems.push(`step ${st.i + 1}: pressing it left the guide (on ${router.currentView})`); break; }
    if (after.id && !after.ended && after.i === st.i && after.sub === st.sub) { problems.push(`step ${st.i + 1}: pressing it did not lead on`); break; }
  }
  const end = GE.guideState();
  const optional = steps.filter(s => s.optional).length;
  ok(`4. ${g.id} (${way.when}${way.name ? ", " + way.name : ""}${label ? ": " + label : ""}): walked start to finish, ${reached} of ${steps.length} steps${optional ? ` (${optional} asked the first time only)` : ""}`, !problems.length && end.ended, problems.join(" | ") || `ended: ${end.ended}, on ${router.currentView}`);
  GE.stopGuide({ quiet: true });
  // A walk can end in a session that is starting; let it, then go Home, so the next walk starts clean.
  if (/session has started|routine has started/.test(GD.guideById(g.id).end || "")) await until(() => GE.HELP_HIDDEN.has(router.currentView) && router.currentView !== "prescribed-session", 5000);
  await sleep(300); await go("today"); await sleep(100);
}
for (const g of GD.GUIDES.filter(x => !x.readOnly)) {
  for (const way of g.ways) {
    const key = `${g.id}:${way.when}`;
    const fx = FIX[key];
    if (!fx) { ok(`4. ${key} has a fixture`, false); continue; }
    person(fx);
    await go("today");
    await walk(g, way, "");
  }
}
// v3: A1 from every Home that starts something.
for (const [label, fx] of [["a session from your week", { tier: "personal", week: "session" }], ["your own list from your week", { tier: "personal", own: true, week: "own" }], ["already checked in today", { tier: "personal", checkedIn: true }]]) {
  person(fx);
  await go("today");
  const g = GD.guideById("A1");
  await walk(g, g.ways[0], label);
}
// A2 from a session day, through the check-in (a screen the guide waits through).
person({ tier: "personal", week: "session" }); await go("today");
await walk(GD.guideById("A2"), GD.guideById("A2").ways[0], "a session from your week, through the check-in");

console.log("\nTEST 5 - the box");
person({ tier: "personal" });
await go("today");
{
  router.helpFrom = "today";
  GE.startGuide("B1");
  await until(() => document.querySelector("#guide-overlay .gd-dock"));
  const dock = document.querySelector("#guide-overlay .gd-dock");
  ok("5a. the box: Step 1 of 7, its words, Stop the guide and Make this smaller; at the edge, labelled", /Step 1 of 7/.test(txt(dock)) && /Tap Library\./.test(txt(dock)) && !!dock.querySelector('[data-gd="stop"]') && !!dock.querySelector('[data-gd="mini"]') && dock.getAttribute("aria-labelledby") === "gd-dock-h" && /gd-dock--(top|bottom)/.test(dock.className));
  await sleep(120);
  ok("5b. the step is said once in the live region; focus stays in the app", /Tap Library/.test(txt(document.getElementById("guide-live"))) && !document.querySelector("#guide-overlay").contains(document.activeElement));
  ok("5c. the real Library button is ringed", GE.findTarget("library")?.classList.contains("gd-ring"));
  click(GE.findTarget("library"));
  await until(() => router.currentView === "library" && GE.findTarget("my-exercises")?.classList.contains("gd-ring"));
  ok("5d. the real tap: the Library opens, and the box moves on", router.currentView === "library" && /Step 2 of 7/.test(txt(document.querySelector(".gd-dock"))));
  click(document.querySelector('#guide-overlay [data-gd="back"]'));
  await until(() => router.currentView === "today" && GE.guideState().i === 0);
  ok("5e. Back a step: back on Home, Step 1", router.currentView === "today" && GE.guideState().i === 0);
  await sleep(100);
  click([...main.querySelectorAll(".path-door[data-door]")][0]);
  await until(() => GE.guideState().off);
  await until(() => /left the guide/.test(txt(document.querySelector(".gd-dock"))) && router.currentView !== "today", 2000);
  ok("5f. off the route: the tap goes ahead, and “You’ve left the guide.” with Carry on from here and Stop the guide", GE.guideState().off && /You’ve left the guide\./.test(txt(document.querySelector(".gd-dock"))) && !!document.querySelector('[data-gd="resume"]') && router.currentView !== "today",
    `off ${GE.guideState().off}, on ${router.currentView}, box "${txt(document.querySelector(".gd-dock"))}"`);
  click(document.querySelector('#guide-overlay [data-gd="resume"]'));
  await until(() => router.currentView === "today" && GE.findTarget("library")?.classList.contains("gd-ring"));
  ok("5g. Carry on from here: back to the step's screen, the ring on its button", router.currentView === "today" && !GE.guideState().off);
  click(document.querySelector('#guide-overlay [data-gd="mini"]')); await sleep(10);
  ok("5h. Make this smaller: one line, and Show the step", /Tap the ringed button\./.test(txt(document.querySelector(".gd-dock"))) && !!document.querySelector('[data-gd="big"]'));
  click(document.querySelector('#guide-overlay [data-gd="stop"]')); await sleep(20);
  ok("5i. Stop the guide: the box and the ring go; nothing is undone", !document.querySelector(".gd-dock") && !document.querySelector(".gd-ring") && router.currentView === "today");
  // The end and Did that work?
  person({ tier: "personal", arc: true }); await go("today");
  router.helpFrom = "today";
  GE.startGuide("E3");
  await until(() => GE.findTarget("nav:progress")?.classList.contains("gd-ring"));
  click(GE.findTarget("nav:progress"));
  await until(() => router.currentView === "progress" && GE.findTarget("change-arc")?.classList.contains("gd-ring"));
  click(GE.findTarget("change-arc"));
  await until(() => router.currentView === "stretch-arc" && GE.findTarget("arc-rows"));
  click(GE.findTarget("arc-rows").querySelector("button"));
  await until(() => GE.guideState().ended && /That’s it\./.test(txt(document.querySelector(".gd-dock"))));
  ok("5j. the end: “That’s it.”, then Did that work?", /That’s it\./.test(txt(document.querySelector(".gd-dock"))) && !!document.querySelector('[data-gd="done"]'));
  click(document.querySelector('#guide-overlay [data-gd="done"]'));
  await until(() => main.querySelector(".help-view") && /Did that work\?/.test(txt(main.querySelector("h1"))));
  ok("5k. Did that work?: Yes, back to where I was; Not quite, one level deep; optional, nothing recorded", /Yes, back to where I was/.test(txt(main)) && main.querySelectorAll(".help-nq > li").length >= 1 && /Nothing is recorded/.test(txt(main)));
  click(main.querySelector('[data-help="yes"]'));
  await until(() => router.currentView === "today");
  ok("5l. Yes: back to where they were when they asked", router.currentView === "today");

  // Between screens, and a back gesture away from the route.
  person({ tier: "personal" }); await go("today");
  router.helpFrom = "today";
  GE.startGuide("B1");
  await until(() => GE.findTarget("library")?.classList.contains("gd-ring"));
  await router.navigate("settings");       // not a tap: as a back gesture or a link would
  await until(() => /One moment/.test(txt(document.querySelector(".gd-dock"))), 1500);
  ok("5m. between screens: \u201cOne moment\u2026\u201d and Stop the guide, never the next step's words early", /One moment/.test(txt(document.querySelector(".gd-dock"))) && !/Tap Library/.test(txt(document.querySelector(".gd-dock"))) && !!document.querySelector('#guide-overlay [data-gd="stop"]'));
  await until(() => GE.guideState().off, 4500);
  ok("5n. still somewhere else after a few seconds: off the route, with Carry on from here", GE.guideState().off && !!document.querySelector('#guide-overlay [data-gd="resume"]'));
  GE.stopGuide({ quiet: true });

  // Large text: shorter words, each name beginning with its visible word.
  document.documentElement.style.setProperty("--user-text-scale", "2");
  await go("today"); router.helpFrom = "today";
  GE.startGuide("B1");
  await until(() => GE.findTarget("my-exercises") || GE.findTarget("library")?.classList.contains("gd-ring"));
  click(GE.findTarget("library"));
  await until(() => document.querySelector('#guide-overlay [data-gd="back"]'));
  const bs = [...document.querySelectorAll("#guide-overlay .gd-dock__row button")];
  ok("5o. text 2: Back, Stop, Smaller on one row, each name beginning with its word (SC 2.5.3)", bs.length === 3 && bs.every(b => (b.getAttribute("aria-label") || "").startsWith(txt(b))) && !!document.querySelector(".gd-dock__say--big"),
    bs.map(b => txt(b) + "|" + b.getAttribute("aria-label")).join(", "));
  document.documentElement.style.removeProperty("--user-text-scale");
  GE.stopGuide({ quiet: true });
}

console.log("\nTEST 8 - On this screen offers only what can be done there");
{
  const bad = [];
  for (const [label, fx] of [["coach", { tier: "personal" }], ["week session", { tier: "personal", week: "session" }], ["own list", { tier: "personal", own: true, week: "own" }], ["rest day", { tier: "personal", week: "session", rest: true }], ["free", { tier: "free" }]]) {
    person(fx); await go("today"); await sleep(60);
    for (const g of GD.guidesFor("today")) {
      const w = GD.wayFor(g);
      if (!w) continue;
      const first = GD.stepsOf(w)[0];
      if (first.screen !== "today") continue;
      const t = first.alts ? first.alts.map(a => a.target) : first.target;
      if (!GE.findTarget(t)) bad.push(`${label}: ${g.id} offered, nothing to ring`);
    }
  }
  ok("8a. every guide On this screen (Home) has its first button there, in every Home state", !bad.length, bad.join(" | "));
  person({ tier: "personal", week: "session", rest: true }); await go("today");
  ok("8b. a rest day: the first guide is not offered as a walk, and its overview says what to do instead", !GD.wayFor(GD.guideById("A1")) && /Home already shows/.test(GD.guideById("A1").noWay || ""));
  person({ tier: "personal" }); await go("today"); router.helpFrom = "today";
  GE.startGuide("B1");
  await until(() => document.querySelector('#guide-overlay [data-gd="mini"]'));
  ok("8c. ordinary text: Make this smaller says so", txt(document.querySelector('#guide-overlay [data-gd="mini"]')) === "Make this smaller");
  GE.stopGuide({ quiet: true });
}

console.log("\nTEST 6 - reversal: a renamed label is red, and names the guide");
person({ tier: "personal" }); await go("today");
{
  const step = GD.guideById("B1").ways[0].parts[0].steps[0];
  const lib = GE.findTarget("library");
  const copy = lib.cloneNode(true);
  copy.querySelector(".path-door__t").textContent = "Books";
  ok("6a. the real Library button passes", labelOK(lib, step.label));
  ok("6b. renamed in a copy (“Books”): red, for guide B1 step 1", !labelOK(copy, step.label));
}

console.log("\nTEST 7 - nothing stored, nothing sent");
{
  const src = ["js/data/guides.js", "js/guide.js", "js/views/help.js"].map(f => readFileSync(new URL(f, ROOT), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, ""));
  ok("7a. no store writes, no browser storage, no network, no analytics", src.every(s => !/store\.set|localStorage|sessionStorage|indexedDB|fetch\(|sendBeacon|XMLHttpRequest/.test(s)));
}

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
