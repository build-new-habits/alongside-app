import { createRequire as __cr } from "node:module";
/**
 * tools/verify-one-look.mjs
 * 31 Oct 2026 v1
 *
 * STAGE PATH Session 9 (CLOSE; P-12 F2, F3, F4, F5). Graeme, 29 Oct, after
 * trying v684: "the links I discovered don't always have pills … maze of
 * rooms … no description or purpose … rooms look different … There needs to
 * be this consistency applied to all". Decided 31 Oct: "‹ Back, Exit in a
 * session"; "24 px, left"; every Plan screen outside P-13's rooms, now.
 *
 * jsdom draws no layout, so this gate holds the markup and the CSS rules;
 * tools/chromium-one-look.mjs measures the drawn screen (84 screens, the
 * Plan at text 1 and 2, 0 faults on this version). The scope is
 * tools/one-look-scope.mjs, shared by both.
 *
 *   1. The rules: on the Plan the page heading is 24 px (--text-2xl) at the
 *      left; a room's own way back hides the house; .plan-link is a pill.
 *   2. Every screen the router opens on the Plan (P-13's rooms, the gate
 *      screens and Free's only screens aside), through the real router:
 *      one heading; no emoji; every way back says "‹ Back" (or Exit in a
 *      session) and carries plan-back or plan-exit, and there is one;
 *      no bare words for a button (btn-ghost, home-link) or a link without
 *      a look, but a crisis number in a sentence.
 *   3. The screens inside the rooms, reached by their own buttons: the
 *      Library's shelves, Practices' groups, Your week's days, Progress's
 *      pages, the player in a session, Walk before and during, a walk done.
 *   4. Free: every file this session touched draws Free's screens byte for
 *      byte as alongside-v688 did.
 *   5. Scope: P-13's list is P-13's rooms less the two taken in now (My
 *      exercises, the twelve-week shape); Update check-in is Free's only.
 *   6. The look only. Rooms that must never check the tier (Wellbeing, the
 *      check-in, My exercises, sharing your data; verify-tier, -tiergh,
 *      -door1, -decisions, -plan-claims hold that, unchanged) ask
 *      planLook() (js/plan-look.js) for the look: on both tiers each offers
 *      exactly the same controls, the way back aside. No other file uses
 *      planLook, so nothing reaches it without this proof.
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";

const dom = new JSDOM(`<!doctype html><body><div id="app"><main id="main-content"></main></div>
  <nav id="bottom-nav"></nav><button id="hidden-nav-home-btn" class="hidden-nav-escape hidden" aria-label="Back to Today"><span aria-hidden="true">🏠</span></button></body>`, { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "SVGElement", "HTMLInputElement"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.fetch = dom.window.fetch = async () => ({ ok: false, text: async () => "", json: async () => ({}) });
dom.window.confirm = () => false; globalThis.confirm = () => false;
if (!globalThis.CSS) globalThis.CSS = { escape: s => String(s).replace(/[^a-zA-Z0-9_-]/g, c => "\\" + c) };

const ROOT = new URL("..", import.meta.url).pathname;
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { router } = await import(B + "router.js");
window.router = router;
const { P13_ROOMS, SESSION_SCREENS, NOT_A_ROOM, NOT_ON_THE_PLAN } = await import(new URL("./one-look-scope.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const EMOJI = /\p{Extended_Pictographic}/u;
const AT = new Date().toISOString();

function person(tier = "personal") {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Graeme"); store.set("tier", tier); store.set("guidanceShownAt", AT);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: AT, textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("gymEquipment", ["dumbbells-medium", "bench-flat", "gym-membership"]);
  store.set("arc", { active: true, aimId: "sport-without-flaring", startedAt: new Date(Date.now() - 15 * 864e5).toISOString(), strands: [] });
  store.set("activityLog", Array.from({ length: 6 }, (_, i) => ({ id: "a" + i, type: "workout", sessionType: "upper", place: "gym", completedAt: new Date(Date.now() - (i + 1) * 864e5).toISOString(), durationMins: 30, completed: true, moodAfter: 7, exerciseIds: ["push-up"] })));
  const k = new Date().toISOString().split("T")[0];
  store.set("checkinHistory", { [k]: { energy: 6, mood: 6 } }); store.set("lastCheckin", { ...store.get("lastCheckin"), energy: 6, mood: 6, timestamp: AT });
  store.set("savedSessions", [{ id: "own1", name: "Tuesday legs", sessionType: "lower", doses: {}, durationMins: 30, equipment: [], exerciseIds: ["push-up", "plank"], createdAt: AT, lastUsedAt: null }]);
  store.set("generatedSession", { session: { id: "fx", name: "Upper body", type: "workout", sessionType: "upper", exercises: [{ id: "push-up", name: "Push-up", sets: 2, reps: 8, section: "main" }, { id: "plank", name: "Plank", sets: 2, duration: 30, section: "main" }] }, builtAt: AT, inputs: {} });
  store.set("prescribedExercises", [{ id: "p1", name: "Bridge", sets: 2, reps: "10" }]);
  store.set("liftLog", { "goblet-squat": [0, 1, 2].map(i => ({ at: new Date(Date.now() - (20 - i * 7) * 864e5).toISOString(), weight: 20 + i * 2.5, reps: 10, unit: "kg" })) });
  router.history = ["today"]; router.pathStart = null;
}
async function open(route, extra = null) {
  if (route === "coach-proposal") store.set("requestedSessionType", "full");
  if (extra) router.pathStart = extra;
  await router.navigate(route);
  await wait(route === "checkin" ? 2600 : 60);
}

// Headings drawn at the page size at the left by their own rule, before
// Session 9 (Home, the doors, Your week, Progress, Settings, Wellbeing, I
// know what I want). TEST 1f reads each rule; any other heading must sit in
// the Plan's look (.is-plan).
const AGREED_H1 = ["path-h1", "path-greeting", "yw-title", "progress-title", "settings-title", "wb-title", "kw-title"];
// A ghost button its own CSS gives an edge is a button (TEST 1e holds the edge).
const EDGED = [".prescribed-remove-btn"];

/** The Plan's one look, as markup: what verify-one-look holds on every screen. */
function look(session) {
  const f = [];
  const shown = el => !el.closest("[hidden],.hidden,.sr-only,.visually-hidden,[inert]");
  const h1s = [...main.querySelectorAll("h1")].filter(shown).filter(h => !h.classList.contains("sr-only"));
  if (h1s.length !== 1) f.push(`${h1s.length} headings`);
  else if (!h1s[0].closest(".is-plan") && !AGREED_H1.some(c => h1s[0].classList.contains(c))) f.push(`heading not in the Plan's look (${h1s[0].className || "no class"})`);
  const words = txt(main);
  const em = words.match(/\p{Extended_Pictographic}/gu);
  if (em) f.push(`emoji ${[...new Set(em)].join(" ")}`);
  const acts = [...main.querySelectorAll("button, a[href]")].filter(shown);
  const said = el => txt(el) || el.getAttribute("aria-label") || "";
  const BACKISH = /^(‹|←|<)?\s*(back|home|exit|today|progress|back to [a-z ]+|✕ exit)$/i;
  const backs = acts.filter(el => !el.matches('[role="tab"],[role="radio"],[aria-pressed]') && (BACKISH.test(txt(el)) || el.matches(".plan-back,.plan-exit")));
  const wrong = backs.filter(el => !((txt(el) === "‹ Back" && el.classList.contains("plan-back")) || (session && txt(el) === "Exit" && el.classList.contains("plan-exit"))));
  if (wrong.length) f.push(`back says ${wrong.map(el => JSON.stringify(txt(el)) + (el.className.match(/plan-(back|exit)/) ? "" : " (no plan-back)")).join(", ")}`);
  if (backs.length > 1) f.push(`${backs.length} ways back`);
  const done = acts.some(el => txt(el) === "Done");
  const navHidden = document.getElementById("bottom-nav").classList.contains("hidden");
  if (navHidden && !backs.length && !done) f.push("no way back");
  const bare = acts.filter(el => !el.closest("nav") && !backs.includes(el) && !el.matches(".plan-link" + EDGED.map(e => "," + e).join(""))).filter(el =>
    el.matches(".btn-ghost, .home-link") ||
    (el.matches("a[href]") && !el.matches(".plan-link, .btn, .path-row, [class*='card'], [class*='row'], [class*='tile']") && !(el.matches('a[href^="tel:"],a[href^="sms:"],a[href^="mailto:"]') && el.closest("p,li"))));
  if (bare.length) f.push(`bare ${bare.slice(0, 4).map(el => JSON.stringify(said(el).slice(0, 30))).join(", ")}`);
  return f;
}

// ── 1 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 1 - the rules");
const css = readFileSync(`${ROOT}css/components/path.css`, "utf8");
const vars = readFileSync(`${ROOT}css/base/variables.css`, "utf8");
const rule = sel => { const i = css.indexOf(sel + " {"); return i < 0 ? "" : css.slice(i, css.indexOf("}", i)); };
ok("1a. on the Plan, the page heading is --text-2xl at the left", /font-size:\s*var\(--text-2xl\)/.test(rule(".is-plan h1:not(.sr-only)")) && /text-align:\s*left/.test(rule(".is-plan h1:not(.sr-only)")), rule(".is-plan h1:not(.sr-only)"));
ok("1b. --text-2xl is 24 px (times the person's text size)", /--text-2xl:\s*calc\(1\.5rem \* var\(--user-text-scale\)\)/.test(vars), (vars.match(/--text-2xl:[^;]*/) || [""])[0]);
ok("1c. a room's own way back hides the house (one way back)", /body:has\(#main-content \.plan-back, #main-content \.plan-exit\) #hidden-nav-home-btn\s*\{\s*display:\s*none/.test(css));
const finishCss = readFileSync(`${ROOT}css/components/finish.css`, "utf8");
ok("1e. Remove on My exercises has an edge (a button, not bare words)", /\.prescribed-view \.prescribed-remove-btn \{[^}]*border: 1px solid/.test(finishCss));
const allCss = execSync(`cat ${ROOT}css/*.css ${ROOT}css/*/*.css`, { encoding: "utf8", maxBuffer: 1 << 26 });
for (const c of AGREED_H1) {
  const blocks = [...allCss.matchAll(new RegExp(`\\.${c}\\s*\\{([^}]*)\\}`, "g"))].map(m => m[1]);
  ok(`1f. .${c}: 24 px (--text-2xl), never centred`, blocks.some(b => /font-size:\s*var\(--text-2xl/.test(b)) && !blocks.some(b => /text-align:\s*center/.test(b)), blocks.join(" | ").replace(/\s+/g, " ").slice(0, 200));
}
ok("1d. a plan-link is a pill", /border-radius:\s*999px/.test(rule(".plan-link")) && /min-height:\s*44px/.test(rule(".plan-link")));

// ── 2 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 2 - every Plan screen the router opens");
const table = (() => { const src = readFileSync(`${ROOT}js/router.js`, "utf8"); const b = src.slice(src.indexOf("const VIEW_NAMES = {")); return b.slice(0, b.indexOf("\n};")); })();
const routes = [...table.matchAll(/^\s*'([a-z0-9/-]+)'\s*:\s*\{/gm)].map(m => m[1])
  .filter(r => !r.startsWith("onboarding") && !NOT_A_ROOM.includes(r) && !P13_ROOMS.includes(r) && !NOT_ON_THE_PLAN.includes(r));
ok("2pc. the screens are read from the router (none left out by hand)", routes.length >= 35 && routes.includes("today") && routes.includes("prescribed") && routes.includes("goal-setup"), routes.length + "");
const visits = [...routes.map(r => [r, null]), ...["stronger", "moving", "stretch", "feel"].map(d => ["path", { door: d }])];
for (const [r, start] of visits) {
  person(); await open(r, start);
  const failed = /Something went wrong loading this page/.test(txt(main)) || !txt(main);
  const f = failed ? ["did not open"] : look(SESSION_SCREENS.includes(router.currentView));
  ok(`2. ${r}${start ? ":" + start.door : ""}${router.currentView !== r ? ` (opens ${router.currentView})` : ""}`, !f.length, f.join("; "));
}

// ── 3 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 3 - the screens inside the rooms");
async function inside(name, route, steps, session = false) {
  person(); await open(route);
  for (const s of steps) { const el = typeof s === "function" ? s() : main.querySelector(s); if (!el) { ok(name, false, `could not reach ${s}`); return; } click(el); await wait(60); }
  const f = look(session);
  ok(name, !f.length, f.join("; "));
}
await inside("3a. a Library shelf", "library", [".library-category-card, [data-category]"]);
await inside("3b. a Practices group", "practices", ["[data-group], .practice-group-card, .practices-group"]);
await inside("3c. Your week: which days", "your-week", ['[data-start="build"]']);
await inside("3d. Progress: a page of its own", "progress", ["[data-pr-page]"]);
await inside("3e. Walk: how long, before it starts", "walk-session", [".ws-type-card, [data-walk-type], .walk-type-card"]);
await inside("3f. Plan import: what I read", "plan-import", []);
await inside("3g. Your arc: what feeds it", "stretch-arc", ["[data-arc-change]"]);
await inside("3h. the player, in a session", "workout", [], true);
await inside("3i. Make it up as I go, in a session", "capture", [], true);

// ── 4 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 4 - Free, as it was on alongside-v688");
const V688 = "79799cb";
const touched = execSync(`git -C "${ROOT}" diff --name-only ${V688} -- js/views`, { encoding: "utf8" }).split("\n").filter(f => /^js\/views\/[a-z-]+\.js$/.test(f));
ok("4pc. the files this session touched are found from git", touched.length >= 20, touched.join(", "));
const fnOf = Object.fromEntries([...table.matchAll(/'([a-z0-9/-]+)'\s*:\s*\{\s*path:\s*'\.\/views\/([a-z-]+)\.js',\s*fn:\s*'(\w+)'/g)].map(m => [m[2], { route: m[1], fn: m[3] }]));
// The same draw for both: the same random numbers, and the clock read as a clock.
let seed = 1;
const realRandom = Math.random;
async function draw(mod, fn) {
  seed = 1; Math.random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  main.innerHTML = "";
  if (typeof mod[fn] === "function") { const v = mod[fn](router); v.mount(main); }
  else if (typeof mod.render === "function") { main.innerHTML = mod.render(); try { mod.onMount?.(); } catch {} }
  await wait(40);
  Math.random = realRandom;
  return main.innerHTML.replace(/(id="fs-clock"[^>]*>)[^<]*</g, "$1·<");
}
let compared = 0;
for (const file of touched) {
  const name = file.split("/").pop().replace(/\.js$/, "");
  const entry = fnOf[name];
  if (!entry) continue;                     // a view the router does not open by itself
  let old = "";
  try { old = execSync(`git -C "${ROOT}" show ${V688}:${file}`, { encoding: "utf8", maxBuffer: 1 << 26 }); } catch {}
  if (!old) { ok(`4. Free ${name}: there on v688`, false); continue; }
  // Both drawn from fresh copies, so neither carries a state from TEST 2 or 3.
  const fresh = async (code, tag) => { const t = new URL(`../${file.replace(/\.js$/, "")}__${tag}_look.js`, import.meta.url); writeFileSync(t, code); try { return await import(t.href); } finally { unlinkSync(t); } };
  const OLD = await fresh(old, "v688");
  const NOW = await fresh(readFileSync(`${ROOT}${file}`, "utf8"), "now");
  person("free"); if (entry.route === "coach-proposal") store.set("requestedSessionType", "full");
  const snap = JSON.stringify(store.data);
  let a = "", b = "";
  try { a = await draw(OLD, entry.fn); } catch (e) { a = "THREW " + e.message; }
  store.data = JSON.parse(snap); store.save();
  try { b = await draw(NOW, entry.fn); } catch (e) { b = "THREW " + e.message; }
  let at = 0; while (at < a.length && a[at] === b[at]) at++;
  compared++;
  ok(`4. Free ${name}: the same, byte for byte`, a === b && a.length > 40, `differs at ${at}: ${a.slice(at - 50, at + 50)} | ${b.slice(at - 50, at + 50)}`);
}
ok("4pc2. compared every touched room the router opens", compared >= 20, compared + "");

// ── 5 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 5 - the scope");
ok("5a. P-13 keeps its rooms but My exercises and the twelve-week shape (taken in now)", P13_ROOMS.length === 10 && !P13_ROOMS.includes("prescribed") && !P13_ROOMS.includes("goal-setup") && P13_ROOMS.includes("classes"), P13_ROOMS.join(", "));
const callers = execSync(`git -C "${ROOT}" grep -n "navigate('checkin-mini')\\|data-action=\\"checkin-mini\\"" -- js`, { encoding: "utf8" }).trim().split("\n");
ok("5b. Update check-in is opened only from Free's Home (today.js)", callers.every(l => l.startsWith("js/views/today.js")), callers.join(" | "));
person(); await open("today");
ok("5c. the Plan's Home does not offer it", !main.querySelector('[data-action="checkin-mini"]') && !!main.querySelector(".path-home, [class*='plan-home']"), txt(main).slice(0, 80));

// ── 6 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 6 - the look only, where the tier is never checked");
const LOOK_ONLY = { "js/views/noticing.js": "noticing", "js/views/journal-entry.js": "journal-entry", "js/views/checkin.js": "checkin",
  "js/views/prescribed.js": "prescribed", "js/views/prescribed-session.js": "prescribed-session", "js/views/progress-share.js": "progress-share" };
const users = execSync(`git -C "${ROOT}" grep -l "planLook" -- js`, { encoding: "utf8" }).trim().split("\n").filter(f => f !== "js/plan-look.js").sort();
ok("6a. planLook is used only in the rooms this test proves", JSON.stringify(users) === JSON.stringify(Object.keys(LOOK_ONLY).sort()), users.join(", "));
const BACK_IDS = /^(prescribed-back-top|prescribed-back-bottom|sh-back|ci-back)$/;
// The share screen's 90 days is the Plan's by the tier table (windowsFor; verify-tier holds it): contents, not the look.
const TABLED = /^sh-w-90$/;
const controls = () => [...document.querySelectorAll("#app button, #app a[href], #app input, #app select, #app textarea, .ci-panel button, .ci-panel input")]
  .filter(el => !el.closest("[hidden]") && !el.classList.contains("plan-back") && !el.matches(".je-back-btn") && !BACK_IDS.test(el.id) && !TABLED.test(el.id))
  .map(el => el.id || [...el.attributes].filter(a => a.name.startsWith("data-")).map(a => `${a.name}=${a.value}`).join(",") || el.getAttribute("href") || `${el.name}=${el.value}` || txt(el))
  .sort();
for (const [file, route] of Object.entries(LOOK_ONLY)) {
  const seen = {};
  for (const tier of ["free", "personal"]) {
    person(tier);
    seed = 7; const keep = Math.random; Math.random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    await open(route);
    Math.random = keep;
    // The check-in's first question arrives as a message does, a few seconds in.
    for (let i = 0; route === "checkin" && i < 40 && !document.querySelector(".ci-panel button"); i++) await wait(250);
    seen[tier] = controls();
  }
  const extra = seen.personal.filter(c => !seen.free.includes(c)), less = seen.free.filter(c => !seen.personal.includes(c));
  ok(`6. ${route}: the same controls on both tiers`, !extra.length && !less.length && seen.free.length > 0, `Plan adds ${JSON.stringify(extra)}; Plan lacks ${JSON.stringify(less)}`);
}

console.log(`\n${"=".repeat(60)}\nVERIFY-ONE-LOOK: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
