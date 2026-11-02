/**
 * tools/verify-session-control.mjs
 * 02 Nov 2026 v1
 *
 * P-22 SESSION-ORDER, P-23 SWAP-SEARCH, P-24 AS-YOU-GO. Graeme, 02 Nov:
 * "When I'm mid session and I can't get to an exercise I can't change the
 * order. I can't swap exercises by searching for something I want. I'm
 * served only 2 options. I can't build as I go." The Session Control
 * mock-up was approved ("Yes, build it"), for the Plan only.
 *
 * Drives the REAL player (views/workout.js) with a real built session, the
 * real door route (views/path.js), and the real search rule
 * (data/swap-search.js):
 *
 *   0. Controls: the fixture is on the Plan; the session has a warm-up, a
 *      main part and a cool-down.
 *   1. Under the exercise's name: Swap, Do this one later, What's left (n).
 *   2. Do this one later: to the end of its own part, never past the
 *      cool-down; the next one opens; it is said; nothing is skipped or
 *      counted; the checkpoint follows the new order.
 *   3. What's left: the rest in order, each with Do now; Do now brings it
 *      here and the one it replaced comes straight after.
 *   4. Add an exercise: a search; the pick goes next, in this part, dosed;
 *      finishing it saves it with the session.
 *   5. Swap: like this one, then a search by name or muscle; a pick takes
 *      the place, the old one is noted (less often), the order unchanged.
 *   6. The search's rules: kit here, never Not again, never a sore-blocked
 *      one, never a held movement, never one already in the session.
 *   7. Make it up as I go behind a door, and a proposal's Swap opens a
 *      panel with a search; a trend's step stays inside its own moves.
 *   8. Free: none of it. The player has no Swap, Later or What's left on an
 *      ordinary exercise.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
Object.defineProperty(dom.window.navigator, "language", { value: "en-GB", configurable: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "SVGElement", "InputEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
if (!globalThis.CSS) globalThis.CSS = { escape: s => String(s).replace(/[^a-zA-Z0-9_-]/g, c => "\\" + c) };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { HELD_MOVEMENTS } = await import(B + "data/exercises/held_movements.js");
// Absent before P-23 (v701): the gate then fails on what is missing, not on the import.
const SS = await import(B + "data/swap-search.js").catch(() => ({ searchSwaps: () => [] }));
const { getResumableSession } = await import(B + "session-resume.js");
const workout = await import(B + "views/workout.js");
const { PathView } = await import(B + "views/path.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 500)}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const J = v => JSON.stringify(v);
let navs = [];
let inPlayer = true;
function paint() {
  main.innerHTML = workout.render();
  try { workout.onMount(); } catch (e) { if (process.env.DBG) console.log("onMount threw", e.message); }
}
const fakeRouter = { history: ["x"], navigate: v => { navs.push(v); if (v === "workout" && inPlayer) paint(); }, back() {} };
globalThis.window.router = fakeRouter;
Object.defineProperty(globalThis, "router", { value: fakeRouter, configurable: true, writable: true });
const click = el => { el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };
const tap = sel => click(main.querySelector(sel));
const type = (sel, v) => { const el = main.querySelector(sel); if (!el) return false; el.value = v; el.dispatchEvent(new dom.window.Event("input", { bubbles: true })); return true; };
const list = () => store.get("generatedSession")?.session?.exercises || [];
const ids = () => list().map(e => e.id);
const name = () => txt(main.querySelector("#wo-exercise-name"));
const sec = e => e?.section || e?.role || "main";

const GYM = ["dumbbells-medium", "barbell", "bench-flat", "kettlebell-medium", "band-light", "gym-membership"];
function fixture(tier = "personal", exercises = null) {
  if (main.querySelector("#exit-workout-btn")) { tap("#exit-workout-btn"); document.querySelector("#exit-confirm-discard")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); }
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test");
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("guidanceShownAt", new Date().toISOString());
  store.set("tier", tier); store.set("liftLogEnabled", true); store.set("todayIntensity", "moderate");
  store.set("gymEquipment", GYM); store.set("homeEquipment", []); store.set("equipment", GYM); store.set("sessionLocation", "gym");
  store.set("conditions", []); store.set("conditionPainScores", {});
  const ex = exercises || SB.buildSession({ sessionType: "upper", durationMins: 45, equipmentOverride: GYM }).exercises;
  store.set("generatedSession", { session: { id: "s", name: "Upper Body", place: "gym", exercises: JSON.parse(JSON.stringify(ex)) }, builtAt: new Date().toISOString(), inputs: {} });
  store.set("workoutProgress", null);
  navs = []; inPlayer = true;
  paint();
}

// ── 0. Controls ─────────────────────────────────────────────────────────
console.log("TEST 0 - positive controls");
fixture();
const parts = [...new Set(list().map(sec))];
ok("0a. the fixture is on the Plan, in the player, on the first exercise", store.get("tier") === "personal" && name() === list()[0]?.name, name());
ok("0b. the session has a warm-up, a main part and a cool-down, two or more in the main part", J(parts) === J(["warmup", "main", "cooldown"]) && list().filter(e => sec(e) === "main").length >= 2, J(list().map(sec)));

// ── 1. The three controls ───────────────────────────────────────────────
console.log("\nTEST 1 - under the exercise's name: Swap, Do this one later, What's left");
const firstMain = list().findIndex(e => sec(e) === "main");
// get to the first main move by finishing the warm-up as a person would
const finishOne = () => { if (!main.querySelector("#wo-done-btn, #complete-exercise-btn")) tap('[data-step-go="capture"]:not([aria-current])'); tap("#wo-done-btn"); tap("#complete-exercise-btn"); };
for (let k = 0; k < firstMain; k++) finishOne();
const nAtMain = list().length;
{
  const g = main.querySelector('.wo-ctl[role="group"]');
  const labels = [...(g?.querySelectorAll("button") || [])].map(txt);
  ok("1a. a named group of three, right under the name and the target: Swap, Do this one later, What's left (n)",
     !!g && J(labels) === J(["Swap", "Do this one later", `What’s left (${nAtMain - firstMain - 1})`]) && /Change /.test(g.getAttribute("aria-label") || ""), J(labels));
  const order = [...main.querySelectorAll("#wo-exercise-name, .exercise-target, .wo-ctl")].map(e => e.id || e.className);
  ok("1b. in that order on the screen", J(order) === J(["wo-exercise-name", "exercise-target", "wo-ctl"]), J(order));
  ok("1c. each control is 44px or more (min-height in the CSS) and Skip this one is still there",
     /\.wo-ctl__pill\s*\{[^}]*min-height:\s*44px/.test(__require("node:fs").readFileSync(new URL("../css/components/workout.css", import.meta.url), "utf8")) && !!main.querySelector("#skip-exercise-btn"));
}

// ── 2. Do this one later ────────────────────────────────────────────────
console.log("\nTEST 2 - Do this one later");
{
  const before = ids(), i = firstMain, moved = before[i];
  const lastMain = before.map((id, k) => [id, k]).filter(([, k]) => sec(list()[k]) === "main").pop()[1];
  tap("#wo-later-btn");
  const after = ids();
  const expect = [...before.slice(0, i), ...before.slice(i + 1, lastMain + 1), moved, ...before.slice(lastMain + 1)];
  ok("2a. it moves to the end of its own part (the main part), not past the cool-down", J(after) === J(expect), `${J(before)} -> ${J(after)}`);
  ok("2b. the next one opens, at its name", name() === list()[i].name && list()[i].id === before[i + 1] && document.activeElement?.id === "wo-exercise-name", name());
  await wait(90);
  const said = txt(main.querySelector("#wo-said"));
  ok("2c. it is said, in a live region already on the page", main.querySelector("#wo-said")?.getAttribute("role") === "status" && new RegExp(`${list()[lastMain].name.replace(/[()]/g, ".")} (is now last|moves to after)`).test(said), said);
  ok("2d. nothing skipped, nothing counted: the same moves, the same number done", after.length === before.length && [...after].sort().join() === [...before].sort().join() && (store.get("workoutProgress") || []).length === firstMain, J(store.get("workoutProgress")));
  // As a reopened app reads it: what is saved, not the copy in memory.
  const cp = getResumableSession("workout");
  const saved = JSON.parse(localStorage.getItem(store.STORAGE_KEY) || "{}")?.generatedSession?.session?.exercises?.map(e => e.id) || [];
  ok("2e. saved: the checkpoint's place and the new order, so Carry on later opens on the next one", cp && cp.index === i && J(saved) === J(after) && saved[cp.index] === before[i + 1], `${J(cp)} ${J(saved)}`);
  // the last of its part has no Later: the cool-down is not "later"
  fixture();
  for (let k = 0; k < firstMain; k++) finishOne();
  const lm = list().map((e, k) => [e, k]).filter(([e]) => sec(e) === "main").pop()[1];
  const cdFirst = list().findIndex(e => sec(e) === "cooldown");
  while (store.get("generatedSession") && main.querySelector("#wo-exercise-name") && list().findIndex(e => e.name === name()) < lm) finishOne();
  ok("2f. on the last move of the main part there is no Do this one later (What's left still is)", !main.querySelector("#wo-later-btn") && !!main.querySelector("#wo-left-btn") && name() === list()[lm].name && cdFirst > lm, name());
}

// ── 3. What's left and Do now ───────────────────────────────────────────
console.log("\nTEST 3 - What's left, Do now");
fixture();
for (let k = 0; k < firstMain; k++) finishOne();
{
  const before = ids(), i = firstMain, here = list()[i].name;
  tap("#wo-left-btn");
  const rows = [...main.querySelectorAll(".wo-left__row")];
  ok("3a. What's left: its own heading, focused; Back names the one you were on", txt(main.querySelector("h1")) === "What’s left" && document.activeElement?.id === "wo-left-h" && txt(main.querySelector("#wo-left-back")) === `‹ Back to ${here}`, txt(main.querySelector("h1")));
  ok("3b. the rest in order, each with Do now (described by its name), then + Add an exercise",
     J(rows.map(r => txt(r.querySelector(".wo-left__t")).startsWith(list()[Number(r.querySelector("[data-do-now]").dataset.doNow)].name))) === J(rows.map(() => true))
       && rows.length === before.length - i - 1 && rows.every(r => r.querySelector("[data-do-now]")?.getAttribute("aria-describedby"))
       && txt(main.querySelector("#wo-add-btn")) === "+ Add an exercise", rows.map(txt).join(" | "));
  tap("#wo-left-back");
  ok("3c. Back returns to the same exercise, the order unchanged, focus on What's left", name() === here && J(ids()) === J(before) && document.activeElement?.id === "wo-left-btn", name());
  tap("#wo-left-btn");
  const pickAt = before.length - 2;   // a later one, in the cool-down
  click(main.querySelector(`[data-do-now="${pickAt}"]`));
  const after = ids();
  ok("3d. Do now: that one here, the one it replaced straight after, the rest unchanged",
     J(after) === J([...before.slice(0, i), before[pickAt], before[i], ...before.slice(i + 1).filter((_, k) => k + i + 1 !== pickAt)]) && name() === list()[i].name, `${J(before)} -> ${J(after)}`);
}

// ── 4. Add an exercise ──────────────────────────────────────────────────
console.log("\nTEST 4 - Add an exercise");
fixture();
for (let k = 0; k < firstMain; k++) finishOne();
{
  const before = ids(), i = firstMain;
  tap("#wo-left-btn"); tap("#wo-add-btn");
  ok("4a. a labelled search box, focused, with how to search", main.querySelector('label[for="wo-add-q"]') && document.activeElement?.id === "wo-add-q" && /By name or muscle/.test(txt(main.querySelector("#wo-add-hint"))), txt(main.querySelector(".wo-left__add")));
  type("#wo-add-q", "glute");
  const found = [...main.querySelectorAll("#wo-add-list [data-find-pick]")];
  ok("4b. typing finds by name or muscle, kit here only, none already in the session, and says how many", found.length > 0 && found.every(b => !before.includes(b.dataset.findPick)) && /found/.test(txt(main.querySelector("#wo-add-count"))), found.map(txt).join(" | "));
  const add = found[0]?.dataset.findPick;
  click(found[0]);
  const after = ids();
  ok("4c. the pick goes next, in this part (main), with its usual dose", J(after) === J([...before.slice(0, i + 1), add, ...before.slice(i + 1)]) && sec(list()[i + 1]) === "main" && (list()[i + 1].sets || list()[i + 1].duration), J(after));
  ok("4d. back on the one you were on, and it says the new one goes next", name() === list()[i].name && !main.querySelector(".wo-left"), name());
  finishOne();
  ok("4e. it opens next", name() === EXERCISES.find(e => e.id === add)?.name, name());
  finishOne();
  ok("4f. finishing it saves it with the session (workoutProgress)", (store.get("workoutProgress") || []).some(p => p.exerciseId === add), J(store.get("workoutProgress")));
  // 4g. a phrase with no match says so
  tap("#wo-left-btn"); tap("#wo-add-btn"); type("#wo-add-q", "zzqqx");
  ok("4g. nothing found is said in words, not an empty box", /Nothing here matches/.test(txt(main.querySelector("#wo-add-list"))) && txt(main.querySelector("#wo-add-count")) === "Nothing found.");
}

// ── 5. Swap with search ─────────────────────────────────────────────────
console.log("\nTEST 5 - Swap: like this one, then a search");
fixture();
for (let k = 0; k < firstMain; k++) finishOne();
{
  const before = ids(), i = firstMain, cur = list()[i];
  tap("#wo-swap-btn");
  const panel = main.querySelector("#wo-swap-panel");
  const like = [...main.querySelectorAll("[data-plan-swap]")];
  ok("5a. the panel is named for the one it replaces; Swap says it is open", panel?.getAttribute("role") === "group" && txt(main.querySelector("#wo-swap-h")) === `Instead of ${cur.name}` && main.querySelector("#wo-swap-btn").getAttribute("aria-expanded") === "true");
  ok("5b. Like this one: same movement pattern and kind, available here, none already in the session, six at most",
     like.length > 0 && like.length <= 6 && like.every(b => { const e = EXERCISES.find(x => x.id === b.dataset.planSwap), me = EXERCISES.find(x => x.id === cur.id); return e && me && e.movementPattern === me.movementPattern && e.category === me.category && !before.includes(e.id); }),
     `${cur.id} ${cur.movementPattern} ${cur.category} :: ` + like.map(b => b.dataset.planSwap).join());
  ok("5c. then Search for something else, and Keep (name)", !!main.querySelector('label[for="wo-swap-q"]') && txt(main.querySelector('label[for="wo-swap-q"]')) === "Search for something else" && txt(main.querySelector("#wo-swap-keep")) === `Keep ${cur.name}`);
  tap("#wo-swap-keep");
  ok("5d. Keep closes it, nothing changed, focus back on Swap", !main.querySelector("#wo-swap-panel") && J(ids()) === J(before) && document.activeElement?.id === "wo-swap-btn");
  tap("#wo-swap-btn"); type("#wo-swap-q", "glutes");
  const hit = [...main.querySelectorAll("#wo-swap-list [data-find-pick]")];
  ok("5e. a search by muscle (glutes) finds moves that are not like this one", hit.length > 0 && hit.some(b => EXERCISES.find(x => x.id === b.dataset.findPick)?.movementPattern !== cur.movementPattern), hit.map(txt).join(" | "));
  const to = hit[0]?.dataset.findPick;
  click(hit[0]);
  ok("5f. the pick takes its place; nothing else moves; it opens at its name", J(ids()) === J([...before.slice(0, i), to, ...before.slice(i + 1)]) && name() === EXERCISES.find(x => x.id === to)?.name && sec(list()[i]) === "main", J(ids()));
  ok("5g. the old one is noted (less often), as every swap on the Plan is", (store.get("exercisePreferences") || {})[cur.id]?.preference === "less", J((store.get("exercisePreferences") || {})[cur.id]));
}

// ── 6. The search's rules ───────────────────────────────────────────────
console.log("\nTEST 6 - the search's own rules");
{
  fixture();
  const all = q => SS.searchSwaps(q, { place: "gym", limit: 500 });
  const squat = all("squat");
  ok("6a. a control: 'squat' finds several at the gym", squat.length >= 3, squat.map(e => e.id).join());
  const victim = squat[0].id;
  store.set("exercisePreferences", { [victim]: { preference: "avoid", source: "fixture" } });
  ok("6b. never one they said Not again to", !all("squat").some(e => e.id === victim));
  store.set("exercisePreferences", {});
  const kitOnly = EXERCISES.filter(e => (e.equipment || []).includes("barbell")).map(e => e.id);
  store.set("homeEquipment", ["band-light"]);   // a little kit at home, so home is not the gym's fallback
  const home = SS.searchSwaps("squat", { place: "home", limit: 500 }).map(e => e.id);
  ok("6c. kit here only: at home with no kit, no barbell moves", kitOnly.length > 0 && !home.some(id => kitOnly.includes(id)) && home.length > 0, home.join());
  const knee = EXERCISES.filter(e => (e.contraindications || []).includes("knee-acute")).length;
  store.set("conditionPainScores", { knee: 9 });
  const sore = all("squat").map(e => e.id);
  const blocked = squat.filter(e => SB.soreLevelFor(e, SB.soreScoresToday()).level === "blocked").map(e => e.id);
  ok("6d. never one today's sore answer rules out (a bad knee: the squats it blocks are gone)", blocked.length > 0 && !sore.some(id => blocked.includes(id)), `${blocked.join()} / ${sore.join()} (${knee})`);
  store.set("conditionPainScores", {});
  const held = HELD_MOVEMENTS.map(h => h.id);
  const words = HELD_MOVEMENTS.flatMap(h => String(h.name).toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const anyHeld = words.some(w => all(w).some(e => held.includes(e.id)));
  ok("6e. never a held movement, whatever is searched (each held name's words)", held.length === 10 && !anyHeld);
  ok("6f. never one already in the session", !all("squat").some(e => e.id === squat[1].id) === false && !SS.searchSwaps("squat", { place: "gym", exclude: [squat[1].id], limit: 500 }).some(e => e.id === squat[1].id));
  ok("6g. one letter searches nothing (two or more)", SS.searchSwaps("s", { place: "gym" }).length === 0 && SS.searchSwaps("sq", { place: "gym" }).length > 0);
}

// ── 7. The doors and proposals ──────────────────────────────────────────
console.log("\nTEST 7 - Make it up as I go behind a door; a proposal's Swap searches");
{
  fixture(); inPlayer = false; navs = [];
  main.innerHTML = "";
  fakeRouter.pathStart = { door: "stronger" };
  const v = PathView(fakeRouter); v.mount(main);
  click(main.querySelector('.path-row[data-v="gym"]')); click(main.querySelector('.path-row[data-v="whole"]'));
  const rows = [...main.querySelectorAll(".path-row[data-v]")].map(r => txt(r.querySelector(".path-door__t")));
  ok("7a. How would you like it? Build it for me, Build my own, Make it up as I go, Follow a fitness trend", J(rows.slice(0, 4)) === J(["Build it for me", "Build my own", "Make it up as I go", "Follow a fitness trend"]), J(rows));
  ok("7b. its line says what it does", txt(main.querySelector('.path-row[data-v="asgo"] .path-door__d')) === "Go to an exercise, log your sets, then choose the next");
  store.set("sessionLocation", "home");
  navs = []; click(main.querySelector('.path-row[data-v="asgo"]'));
  ok("7c. it opens Make it up as I go, at the place they chose", J(navs) === J(["capture"]) && store.get("sessionLocation") === "gym", `${J(navs)} ${store.get("sessionLocation")}`);
  v.onUnmount?.();
  // a door proposal: Move to feel better, a programme
  main.innerHTML = "";
  fakeRouter.pathStart = { door: "feel", feeling: "calm", programmeId: "c3" };   // c3: every movement has others like it
  const w = PathView(fakeRouter); w.mount(main);
  const prog = main.querySelector('.path-view[data-step="prog"]') ? true : (click(main.querySelector(".path-row[data-v]")), !!main.querySelector('.path-view[data-step="prog"]'));
  const swaps = [...main.querySelectorAll("[data-swap]")];
  ok("7d. a proposal (Move to feel better), with Swap on its rows", prog && swaps.length > 0, main.querySelector(".path-view")?.dataset.step);
  const stepsBefore = [...main.querySelectorAll(".path-mv__nm")].map(txt);
  click(swaps[0]);
  const pan = main.querySelector("#path-swp-0");
  // A row with choices like it, too: Swap shows them, it does not swap on the tap (it used to take the first).
  let likeRow = -1;
  for (let k = 0; k < swaps.length && likeRow < 0; k++) {
    if (k > 0) { click(main.querySelector("#path-swp-keep")); click(main.querySelector(`#path-swap-${k}`)); }
    if (main.querySelector(`#path-swp-${k} [data-swap-to]`)) likeRow = k;
  }
  const namesNow = [...main.querySelectorAll(".path-mv__nm")].map(txt);
  ok("7e2. a row with moves like it lists them under Like this one, and nothing has swapped",
     likeRow >= 0 && txt(main.querySelector(`#path-swp-like-${likeRow}`)) === "Like this one" && J(namesNow) === J(stepsBefore), `${likeRow} ${J(namesNow)}`);
  click(main.querySelector("#path-swp-keep"));
  click(main.querySelector("#path-swap-0"));
  ok("7e. Swap opens a named panel under its row (no swap yet), with a search", pan?.getAttribute("role") === "group" && /^Instead of /.test(txt(pan.querySelector("h3"))) && !!pan.querySelector("#path-swp-0-q") && J([...main.querySelectorAll(".path-mv__nm")].map(txt)) === J(stepsBefore) && main.querySelector("#path-swap-0").getAttribute("aria-expanded") === "true", txt(pan));
  type("#path-swp-0-q", "neck");
  const got = [...main.querySelectorAll("#path-swp-0-list [data-find-pick]")];
  const nm = txt(got[0]?.querySelector(".swap-find__name"));
  click(got[0]);
  ok("7f. a pick from the search takes that row; the panel closes; focus back on its Swap", got.length > 0 && txt(main.querySelector(".path-mv__nm")).includes(nm) && !main.querySelector("#path-swp-0") && document.activeElement?.id === "path-swap-0", `${nm} / ${txt(main.querySelector(".path-mv__nm"))}`);
  w.onUnmount?.();
  // a trend's step: its own pool only, so no search
  const src = __require("node:fs").readFileSync(new URL("../js/views/path.js", import.meta.url), "utf8");
  ok("7g. a trend's step keeps to the trend's own moves: no search there", /Array\.isArray\(s\.swaps\) \? `<p class="path-small">This one stays within the trend/.test(src));
  const cp = __require("node:fs").readFileSync(new URL("../js/views/coach-proposal.js", import.meta.url), "utf8");
  ok("7h. Today's plan's swap list ends with the same search, wired to the plan", /renderSwapSearch\(`cp-swp-\$\{i\}`\)/.test(cp) && /wireSwapSearch\(panel, `cp-swp-\$\{at\}`/.test(cp) && /function _swapPickEntry/.test(cp));
}

// ── 8. Free: none of it ─────────────────────────────────────────────────
console.log("\nTEST 8 - Free is unchanged");
fixture("free");
for (let k = 0; k < firstMain; k++) finishOne();
ok("8a. Free: no Swap, Do this one later or What's left on an ordinary exercise; Skip this one as before",
   !main.querySelector(".wo-ctl, #wo-later-btn, #wo-left-btn, #wo-swap-btn") && !!main.querySelector("#skip-exercise-btn") && !!main.querySelector("#wo-exercise-name"), txt(main).slice(0, 200));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
