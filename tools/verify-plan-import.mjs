/**
 * tools/verify-plan-import.mjs
 * 05 Oct 2026 v1
 *
 * D-7 PLAN-IMPORT. Graeme, 05 Oct: "Add a plan you already have? We need
 * to set those health rules, how to read an import, and the template."
 * Decided earlier: read with rules, no AI in the app; if it can't read it,
 * a template to take back to whoever wrote it; the Plan; My exercises
 * framing (the person's own list, never said who gave it or what for).
 *
 *   1. The reader, on three real shapes of plan: his PT's April Session A /
 *      B (warm-up, main, cool-down; loads, tempo, rest), a plan written by
 *      another AI for weight loss (calories, fasting, a weight target), and
 *      a table. Exact library names are found and ticked; near ones ask;
 *      amounts outside limits and unknown names start unticked; loads,
 *      tempo and rest are not amounts.
 *   2. The template: its own lines are skipped; filled in, every line reads.
 *   3. The health rules: what it takes in is always said (H1), never
 *      triggered by the words, and the reader holds no list of food, weight
 *      or medicine words; the pasted words are not kept (H2); nothing is
 *      added unseen (H3); notes only with the health consent (H6).
 *   4. The screens: Free sees the Plan; paste, review (Which is it?, the
 *      amount, the tick), add; errors said and focused; a day already
 *      there is replaced, not doubled.
 *   5. My exercises: each day under its own name with its own Start, which
 *      plays that day only; finishing it is logged and the arc learns the
 *      areas worked.
 *   6. Your week: a day can be My exercises (a plan day, or all of them);
 *      Home offers Start your list; the coach's plan is not asked for; the
 *      balance line leaves it out.
 *   7. Text from a plan is text, never markup.
 */
import { agreed } from "./agreed.mjs";
import { readFileSync } from "node:fs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const gate = await import(B + "safety-gate.js");
const R = await import(B + "data/plan-reader.js");
const WS = await import(B + "data/week-shape.js");
const WM = await import(B + "data/week-shape-model.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 500)}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s), $$ = s => [...main.querySelectorAll(s)];
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = async (el, ms = 60) => { el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true })); await wait(ms); };
const change = async (el, value) => {
  if (!el) return;
  if (el.type === "checkbox" || el.type === "radio") el.checked = value; else el.value = value;
  el.dispatchEvent(new dom.window.Event(el.type === "checkbox" || el.type === "radio" ? "change" : "input", { bubbles: true }));
  await wait(10);
};
const view = () => router.currentView;

// ── The plans ──────────────────────────────────────────────────────────
const PT = `Session A — Lower Body & Posterior Chain
Warm-up
- Glute bridge 2 x 12
- Cat-cow 1 x 8
Main
1. Leg press (high wide feet) 3 x 12, tempo 3-1-2, rest 75s
2. Romanian deadlift (2 x 10kg) 3 x 10
3. Seated cable row 3 x 12 — 60s rest
4. Pallof press — both sides 3 x 10 each
5. Dead bug 3 x 8 each side
Cool-down
Pigeon pose — right side priority 1 x 90s each side
Supine hamstring stretch 1 x 60s each side
Child's pose 60s
Zebra quokka line 77

Session B — Upper Body & Core Integration
Warm-up
Band pull-aparts 2 x 15
Thoracic rotation (seated) 2 x 10 each side
Main
Chest-supported dumbbell row 4 x 10
Incline dumbbell press 3 x 10
Lat pulldown (wide grip) 3 x 12
Dumbbell lateral raise 3 x 15
Pallof press 3 x 10 each side
Half-kneeling cable chop 3 x 10 each side`;

const AI = `16-Day Sprint: 80.6kg to 76.2kg by 21 October
Daily target: 1,200–1,350 kcal, 16:8 fasting, 55–65 g protein
**Day 1 (Day A): Gentle resistance**
Warm-up (5 min): marching on the spot, arm circles, hip circles
Main:
* Goblet squats: 3 sets of 12 (2–3 reps in reserve)
* Push-ups (incline on bench): 3 x 8-10
* Dumbbell rows: 3 x 10 each arm
Cool-down (5 min): child's pose 60s
**Day 2 (Day B): Core, balance and mobility**
* Bird dog 3 x 8 each side
* Plank 3 x 30s
**Day 3 (Day C): Zone 2 steady cardio**
* Brisk walk 30 minutes at conversational pace
Drink 2 x 500ml water`;

const TABLE = `| Exercise | Sets | Reps |
|---|---|---|
| Goblet Squat | 3 | 10 |
| DB RDL | 3 | 8-12 |
| Side plank | 2 | 30s |`;

const items = r => r.days.flatMap(d => d.items);
const byName = (r, n) => items(r).find(i => i.name.toLowerCase() === n.toLowerCase());

// ── 1. The reader ──────────────────────────────────────────────────────
console.log("TEST 1 - the reader");
const pt = R.readPlan(PT);
ok("1a. his PT's plan: two days, named as he had them", pt.days.map(d => d.name).join() === "Session A,Session B", pt.days.map(d => d.name).join());
const ptExact = items(pt).filter(i => i.match.kind === "matched");
ok("1b. at least 14 found by their exact library name, and ticked", ptExact.length >= 14 && ptExact.every(i => i.take), `${ptExact.length}: ${items(pt).filter(i => i.match.kind !== "matched").map(i => i.name)}`);
ok("1c. Seated cable row is the library's", byName(pt, "Seated cable row")?.match.id === "gym-seated-cable-row");
const rdl = byName(pt, "Romanian deadlift");
ok("1d. Romanian deadlift asks which (the dumbbell one among them), unticked until chosen", rdl?.match.kind === "choose" && rdl.match.choices.includes("dumbbell-romanian-deadlift") && !rdl.take, JSON.stringify(rdl?.match));
ok("1e. a load is not an amount: '2 x 10kg' stays a note, the amount is 3 x 10", rdl && R.amountText(rdl.amount) === "3 x 10" && /10kg/.test(rdl.note), rdl && `${R.amountText(rdl.amount)} | ${rdl.note}`);
const lp = byName(pt, "Leg press");
ok("1f. tempo and rest are not amounts (Leg press 3 x 12)", lp && R.amountText(lp.amount) === "3 x 12", lp && R.amountText(lp.amount));
ok("1g. 'each' and 'each side' are each side", byName(pt, "Dead bug")?.amount.perSide && items(pt).filter(i => i.name === "Pallof press").every(i => i.amount.perSide));
ok("1h. warm-up, main and cool-down are kept", byName(pt, "Glute bridge")?.section === "warmup" && byName(pt, "Child's pose")?.section === "cooldown" && lp?.section === "main");
ok("1i. a line it can't read is not taken in, and shown", pt.notRead.some(l => /Zebra quokka/.test(l)));
const ai = R.readPlan(AI);
ok("1j. the AI plan: its three days", ai.days.length === 3, ai.days.map(d => d.name).join());
ok("1k. the target, calories, fasting and water lines are not taken in", ["Sprint", "kcal", "500ml"].every(w => ai.notRead.some(l => l.includes(w))) && !items(ai).some(i => /kcal|fasting|protein|water|sprint/i.test(i.name)), JSON.stringify(ai.notRead));
ok("1l. its exercises are found (goblet squat, press-up, dumbbell row, bird dog, plank)", ["goblet-squat", "push-up", "dumbbell-row", "bird-dog", "plank"].every(id => items(ai).some(i => i.match.id === id)), items(ai).map(i => i.match.id).join());
ok("1m. a part heading with a list after it is read piece by piece", items(ai).some(i => i.match.id === "marching-on-spot" && i.section === "warmup"));
const tb = R.readPlan(TABLE);
ok("1n. a table reads, header skipped (DB RDL is the dumbbell Romanian deadlift)", items(tb).length === 3 && byName(tb, "DB RDL")?.match.id === "dumbbell-romanian-deadlift" && R.amountText(byName(tb, "DB RDL").amount) === "3 x 8-12", JSON.stringify(items(tb).map(i => i.name)));
const odd = R.readPlan("Wall sit 30 x 10\nMade up move 2 x 10");
ok("1o. an amount outside the limits starts unticked and says so", odd.days[0].items[0].ok === false && odd.days[0].items[0].take === false);
ok("1p. a name it doesn't know starts unticked", odd.days[0].items[1].match.kind === "own" && !odd.days[0].items[1].take);
ok("1q. nothing it can read: not readable", R.readPlan("hello there\nI like cake").readable === false);

// ── 2. The template ────────────────────────────────────────────────────
console.log("\nTEST 2 - the template");
ok("2a. the template on its own adds nothing (its # and e.g. lines are skipped)", R.readPlan(R.TEMPLATE).days.length === 0);
const filled = R.TEMPLATE + "Upper\nSeated cable row | 3 x 12 | squeeze at the end\nPlank | 3 x 30s |\nDay: Legs\nGoblet squat | 3 x 10 |\nReverse lunge | 3 x 8 each side |";
const fr = R.readPlan(filled);
ok("2b. filled in, every line reads, with its day, amount and note", fr.days.map(d => d.name).join() === "Upper,Legs" && items(fr).length === 4 && items(fr).every(i => i.take) && fr.notRead.length === 0 &&
   byName(fr, "Seated cable row").note === "squeeze at the end" && byName(fr, "Reverse lunge").amount.perSide, JSON.stringify(fr.days.map(d => [d.name, d.items.map(i => i.name)])));
ok("2c. the template asks for exercises only", /Exercises only, please: no food, calories, weight targets or medicine/.test(R.TEMPLATE));

// ── 3. The health rules, in the reader ─────────────────────────────────
console.log("\nTEST 3 - the health rules");
const src = readFileSync(new URL("../js/data/plan-reader.js", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
  .replace(/export const HEALTH_LINES = \{[\s\S]*?\};/, "").replace(/export const TEMPLATE = `[\s\S]*?`;/, "");
ok("3a. no word list: the reader's code names no food, calorie, fasting, diet or medicine words", !/kcal|calor|fasting|protein|diet|medic|bmi/i.test(src), (src.match(/kcal|calor|fasting|protein|diet|medic|bmi/i) || [""])[0]);
ok("3b. what it takes in is fixed text: the same whatever the plan", typeof R.HEALTH_LINES.stays === "string" && /eating, calories, weight or medicine/.test(R.HEALTH_LINES.stays));

// ── 4. The screens ─────────────────────────────────────────────────────
const GYM = ["dumbbells-medium", "barbell", "bench-flat", "kettlebell-medium", "band-light", "gym-membership"];
function fixture(tier = "personal") {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("homeEquipment", ["band-light"]); store.set("gymEquipment", GYM); store.set("equipment", GYM);
  store.set("conditions", []); store.set("conditionPainScores", {});
  store.set("arc", { active: true, aimId: "floor-unaided", strands: ["leg-strength", "trunk-strength"], marker: "Up off the floor",
    startedAt: "2026-09-01", zonesWorked: {}, typesWorked: {}, provenance: "self" });
  store.set("lastCheckin", { timestamp: new Date().toISOString(), energy: 4, sleep: 4 });
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
async function readIn(text) {
  await router.navigate("plan-import"); await wait(60);
  await change($("#pi-text"), text);
  await click($("#pi-read"));
}

console.log("\nTEST 4 - the screens");
fixture("free");
await router.navigate("plan-import"); await wait(60);
ok("4a. Free: part of the Plan, and nothing to paste", /part of the Plan/.test(txt(main)) && !$("#pi-text"));
fixture();
await router.navigate("your-week"); await wait(60);
await click($('[data-go-route="plan-import"]'));
ok("4b. Your week's 'Add a plan you already have' opens it", view() === "plan-import" && txt($("h1")) === "Add a plan you already have", view());
ok("4c. what it takes in is said before anything is pasted (all four lines)", Object.values(R.HEALTH_LINES).every(l => txt($(".pi-rules")).includes(l)));
ok("4d. the box is labelled", $('label[for="pi-text"]') && txt($('label[for="pi-text"]')) === "Your plan");
await click($("#pi-read"));
ok("4e. reading nothing says so, and the focus goes to the box", /Paste your plan/.test(txt($("#pi-error"))) && document.activeElement === $("#pi-text"));
await change($("#pi-text"), "hello there");
await click($("#pi-read"));
ok("4f. nothing to read: says so, and points to the template", /couldn't find any exercises/.test(txt($("#pi-error"))));
fixture();
store.set("consent.health", { ...store.get("consent.health"), given: false, withdrawnAt: new Date().toISOString() });
await readIn(PT);
ok("4g. the review: its h1, both days, every exercise with a tick box", view() === "plan-import" && txt($("h1")) === "Here's what I read" && $$(".pi-day").length === 2 && $$("[data-take]").length === items(pt).length);
ok("4h. what it takes in is said again on the review, for every plan", txt(main).includes(R.HEALTH_LINES.stays));
ok("4i. what was not taken in is listed", /Not taken in \(1\)/.test(txt($(".pi-not summary"))) && /Zebra quokka/.test(txt($(".pi-not"))));
const rdlItem = $$(".pi-item").find(li => /Romanian deadlift \(2 x 10kg\)/.test(txt(li)));
ok("4j. a near match asks 'Which is it?', with 'None of these' too", !!rdlItem?.querySelector("fieldset legend") && /None of these: keep it as I wrote it/.test(txt(rdlItem)));
await change(rdlItem.querySelector('input[value="dumbbell-romanian-deadlift"]'), true);
ok("4k. choosing ticks it, and its name becomes the library's", rdlItem.querySelector("[data-take]").checked && txt(rdlItem.querySelector(".pi-item__name")) === "Dumbbell Romanian Deadlift");
const glute = $$(".pi-item").find(li => /Glute bridge 2 x 12/.test(txt(li)));
await change(glute.querySelector("[data-amt]"), "lots");
await click($("#pi-add"));
ok("4l. a bad amount on a ticked one is said, with the focus on it", /Check the amount for Glute bridge/.test(txt($("#pi-error"))) && document.activeElement === glute.querySelector("[data-amt]"));
await change(glute.querySelector("[data-amt]"), "3 x 15");
await click($("#pi-add"));
const px = store.get("prescribedExercises") || [];
ok("4m. added: the done screen says how many and which days", view() === "plan-import" && txt($("h1")) === "Added to My exercises" && /Session A, Session B/.test(txt(main)), txt(main).slice(0, 200));
ok("4n. each exercise is in My exercises under its day, linked to the library", px.length >= 15 && px.every(e => ["Session A", "Session B"].includes(e.group)) &&
   px.find(e => e.name === "Seated Cable Row")?.exerciseId === "gym-seated-cable-row", JSON.stringify(px.map(e => [e.group, e.name, e.exerciseId])));
ok("4o. the chosen one is the dumbbell Romanian deadlift", px.some(e => e.exerciseId === "dumbbell-romanian-deadlift" && e.sets === 3 && e.reps === "10"));
ok("4p. an edited amount is kept (Glute bridge 3 x 15)", px.some(e => e.exerciseId === "glute-bridge" && e.sets === 3 && e.reps === "15"));
ok("4q. each side and seconds are kept as My exercises says them", px.some(e => e.exerciseId === "dead-bug" && e.reps === "8 each side") && px.some(e => e.exerciseId === "pigeon-pose" && e.reps === "90 seconds each side"));
ok("4r. an unticked one is not added (Chest-supported row, Cable chop)", !px.some(e => /Chest-supported|chop/i.test(e.name)));
ok("4s. H2: the pasted words are not kept anywhere", !Object.keys(localStorage).some(k => /Zebra quokka|Posterior Chain/.test(localStorage.getItem(k) || "")));
ok("4t. H6: without the health consent, no notes from the plan", px.every(e => !e.notes));
ok("4u. who wrote it or what for is not recorded", px.every(e => !("prescribedBy" in e) && !("source" in e) && !("conditionIds" in e)));
fixture();
await readIn(PT);
await click($("#pi-add"));
const withNotes = store.get("prescribedExercises");
ok("4v. with the health consent, a note is kept (Leg press: high wide feet)", withNotes.some(e => e.exerciseId === "gym-leg-press" && /high wide feet/.test(e.notes || "")));
const before = withNotes.length;
await click($('[data-go="paste"]'));
await change($("#pi-text"), PT);
await click($("#pi-read"));
ok("4w. reading the same plan again says the days are already there", /Session A is already in My exercises: adding replaces it/.test(txt(main)));
await click($("#pi-add"));
ok("4x. and replaces them, not doubled", store.get("prescribedExercises").length === before, `${store.get("prescribedExercises").length} vs ${before}`);
await click($('[data-go="paste"]'));
await click($('[data-go="template"]'));
ok("4y. the template screen: the template in a labelled box, and Copy", txt($("h1")) === "A template for your plan" && $("#pi-template")?.value === R.TEMPLATE && !!$("#pi-copy") && txt($('label[for="pi-template"]')) === "The template");
let copied = null;
Object.defineProperty(dom.window.navigator, "clipboard", { value: { writeText: async t => { copied = t; } }, configurable: true });
await click($("#pi-copy"));
ok("4z. Copy copies it, and says so", copied === R.TEMPLATE && /Copied/.test(txt($("#pi-status"))));

// ── 5. My exercises ────────────────────────────────────────────────────
console.log("\nTEST 5 - My exercises");
await router.navigate("prescribed"); await wait(60);
const groupHs = $$(".prescribed-group__name").map(txt);
ok("5a. each day under its own name", groupHs.join() === "Session A,Session B", groupHs.join());
ok("5b. each with its own Start, and Start all of them", $$("[data-px-group]").map(txt).join() === "Start Session A,Start Session B" && txt($("#px-start-session-btn")) === "Start all of them");
ok("5c. and the way to add another plan", !!$("#px-import-btn"));
const nB = store.get("prescribedExercises").filter(e => e.group === "Session B").length;
await click($('[data-px-group="Session B"]'), 200);
ok("5d. Start Session B plays Session B only", view() === "prescribed-session" && store.get("myExercisesGroup") === "Session B" && new RegExp(`1 of ${nB}\\b`).test(txt(main)), `${view()} ${txt(main).slice(0, 120)}`);
// Finish it: Done on each exercise.
for (let i = 0; i < 80 && view() === "prescribed-session"; i++) {
  const next = $("#ps-complete-btn") || $("#ps-done-btn") || $("#ps-watch-btn") || $("#ps-begin-btn");
  if (!next) break;
  await click(next, 60);
}
await wait(200);
const entry = (store.get("activityLog") || []).slice(-1)[0];
ok("5e. finished: logged as a completed My exercises session", entry?.type === "prescribed-session" && entry.status === "completed", JSON.stringify(entry && { t: entry.type, s: entry.status }));
const all5 = store.get("prescribedExercises");
ok("5f. Session B is done today; Session A is not touched", all5.filter(e => e.group === "Session B").every(e => e.completedToday) && all5.filter(e => e.group === "Session A").every(e => !e.completedToday));
ok("5g. the arc learned the areas Session B worked", Object.keys(store.get("arc").zonesWorked || {}).length > 0, JSON.stringify(store.get("arc").zonesWorked));

// ── 6. Your week ───────────────────────────────────────────────────────
console.log("\nTEST 6 - Your week");
const TODAY = WS.dayKeyOf();
store.set("weekShape", WM.weekFromReady("rotation"));
await router.navigate("your-week"); await wait(60);
await click($(`[data-day="${TODAY}"]`));
ok("6a. a day can be My exercises", !!$('[data-kind="own"]') && txt($('[data-kind="own"]')) === "My exercises");
await click($('[data-kind="own"]'));
ok("6b. then: which of them, by plan day or all of them", $$("[data-own]").map(txt).join() === "Session A,Session B,All of them");
await click($$("[data-own]").find(b => b.dataset.own === "Session A"));
await click($("#yw-save"));
const wk = store.get("weekShape");
const tOwn = wk.templates[wk.days[TODAY]];
ok("6c. saved: the day is Session A, as written", tOwn?.own === "Session A" && tOwn.name === "Session A", JSON.stringify(tOwn));
ok("6d. the week says so", /Your own list: Session A/.test(txt($(`[data-day="${TODAY}"]`))) && /As you wrote it/.test(txt($(`[data-day="${TODAY}"]`))));
ok("6e. the balance line leaves it out (no crash, nothing offered into it)", (() => { const g = WS.balanceGap(); return !g || !g.template.own; })());
await router.navigate("today"); await wait(80);
const card = $(".home-week");
const nA = store.get("prescribedExercises").filter(e => e.group === "Session A").length;
ok("6f. Home: Today, from your week, Session A, how many, Start your list", !!card && txt($("#home-week-h")) === "Session A" && new RegExp(`${nA} exercises, as you wrote them`).test(txt(card)) && !!$('[data-action="week-own"]'), txt(card));
ok("6g. the coach's plan is not offered for it", !$('[data-action="week-today"]') && WS.askForToday() === false);
await click($('[data-action="week-own"]'), 200);
ok("6h. Start your list plays Session A only", view() === "prescribed-session" && store.get("myExercisesGroup") === "Session A" && new RegExp(`1 of ${nA}\\b`).test(txt(main)), txt(main).slice(0, 100));
ok("6i. a saved week keeps it", WM.sanitizeWeekShape(store.get("weekShape")).templates[wk.days[TODAY]].own === "Session A");

// ── 7. Text is text ────────────────────────────────────────────────────
console.log("\nTEST 7 - text from a plan is text");
fixture();
await readIn('Session <img src=x onerror="window.__x=1">\nMy <b>odd</b> move 3 x 10\nPlank 3 x 30s');
const evil = $$(".pi-item").find(li => /odd/.test(txt(li)));
await change(evil?.querySelector("[data-take]"), true);
await click($("#pi-add"));
await router.navigate("prescribed"); await wait(60);
ok("7a. no markup from the plan reaches the page", !main.querySelector("img[src=x]") && !main.querySelector("b") && !window.__x);
ok("7b. names and days are stored without < or >", store.get("prescribedExercises").every(e => !/[<>]/.test(e.name + (e.group || ""))), JSON.stringify(store.get("prescribedExercises").map(e => [e.group, e.name])));

console.log(`\nPLAN-IMPORT: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
