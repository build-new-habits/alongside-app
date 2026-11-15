import { createRequire as __cr } from "node:module";
/**
 * tools/verify-p33-plan-share.mjs
 * 15 Nov 2026 v1
 *
 * P-33 PLAN-SHARE (spec docs/specs/alongside_share-your-plan_15nov2026_v1.md).
 *
 *   1  What is in the plan: the arc and what works towards it (the arc's own
 *      rule, own exercises only), the week, the lists with amounts and On
 *      Home, saved sessions; no name unless switched on.
 *   2  The boundary: never the journal, check-in answers or weight; the last
 *      30 days, anything sore and notes off unless switched on; sore and
 *      notes also need the health consent.
 *   3  The round trip: the text, read by Add a plan you already have, gives
 *      back every exercise, its amount and the On Home choices; a library
 *      name with a dash is matched whole; a note after a dash still reads.
 *   4  Coming back in: Plan import puts a list On Home as the plan says.
 *   5  The PDF: a whole, well-formed file, its words real text, its title
 *      and language set, and nothing that is never in it.
 *   6  The screen: Progress's row on the Plan only; actions before the
 *      preview; Change what's in it; the empty state; Free sent away.
 *
 *   node tools/verify-p33-plan-share.mjs
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob", "SVGElement"])
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
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const PS = await import(B + "data/plan-share.js");
const R = await import(B + "data/plan-reader.js");
const { PlanShareView } = await import(B + "views/plan-share.js");
const { PlanImportView } = await import(B + "views/plan-import.js");
const progress = await import(B + "views/progress.js");
const { router: realRouter } = await import(B + "router.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 500)}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const wait = ms => new Promise(r => setTimeout(r, ms));
const click = async (el, ms = 40) => { el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true })); await wait(ms); };
const change = async (el, value) => {
  if (!el) return;
  if (el.type === "checkbox" || el.type === "radio") el.checked = value; else el.value = value;
  el.dispatchEvent(new dom.window.Event(el.type === "checkbox" || el.type === "radio" ? "change" : "input", { bubbles: true }));
  await wait(20);
};
let navs = [];
const fakeRouter = { history: ["somewhere"], navigate: v => navs.push(v), back() {} };
globalThis.window.router = fakeRouter;
realRouter.navigate = fakeRouter.navigate;

const P = (g, id, name, reps, sets = 1, notes) => ({ id: "p-" + g + id, exerciseId: id, name, group: g, sets, reps, active: true, completedToday: false, ...(notes ? { notes } : {}) });
const LISTS = [
  P("Kettle stretch", "cat-cow", "Cat-Cow Stretch", "10"), P("Kettle stretch", "hip-flexor-stretch", "Hip Flexor Stretch", "30 seconds each side", 1, "Keep the back knee soft"),
  P("Gym A", "goblet-squat", "Goblet Squat", "10", 3), P("Gym A", "romanian-deadlift-rehab", "Romanian Deadlift — Light Load", "10", 3),
  P("Gym A", "bird-dog", "Bird Dog", "8 each side", 2), P("Gym A", "pallof-press", "Pallof Press", "10 each side", 2), P("Gym A", "plank", "Plank", "30 seconds", 3),
];
const SECRET = { journal: "PRIVATEJOURNALWORDS", mood: "MOODWORD", kg: 81.4 };

function fixture({ tier = "personal", arc = true, week = true, lists = true, health = true, sore = null } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  if (!health) store.set("consent.health", { given: false, at: null, version: null, withdrawnAt: new Date().toISOString() });
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  if (lists) { store.set("prescribedExercises", LISTS.map(x => ({ ...x }))); store.set("myExercisesOnHome", { "Kettle stretch": "morning" }); }
  if (arc) store.set("arc", { aimId: "desk-comfort", strands: ["hip-range", "upper-back-range", "neck-shoulders"], marker: "Get through a teaching day",
    active: true, provenance: "self", acceptedAt: "2026-10-25", startedAt: "2026-10-25", zonesWorked: {} });
  if (week) {
    const T = (id, name) => ({ id, name, own: name, mix: [{ focus: "full", level: 2 }], intensity: "steady", mins: 45, place: "gym" });
    store.set("weekShape", { templates: { "t-a": T("t-a", "Gym A") }, days: { mon: "t-a", tue: "rest", wed: "rest", thu: "rest", fri: "t-a", sat: "rest", sun: "rest" }, setAt: "2026-11-11" });
  }
  // Never in it, whatever is switched on.
  store.set("journalEntries", [{ id: "j1", text: SECRET.journal, createdAt: new Date().toISOString() }]);
  store.set("checkinHistory", { [new Date().toISOString().split("T")[0]]: { energy: 3, mood: 3, note: SECRET.mood, date: new Date().toDateString() } });
  store.set("weightLog", [{ at: new Date().toISOString(), kg: SECRET.kg }]);
  if (sore) { store.set("conditions", Object.keys(sore)); store.set("conditionPainScores", sore); }
  navs = [];
}
const all = include => { const m = PS.planModel(include); return [PS.planHtml(PS.planBlocks(m)), PS.planText(m), new TextDecoder("latin1").decode(PS.makePlanPdf(m))].join("\n"); };

console.log("\nTEST 1 - what is in the plan");
fixture();
{
  const m = PS.planModel(PS.DEFAULTS);
  ok("1a. the arc: aim, own words, the week of the arc", m.arc?.aim === "Get through a day at a desk without seizing up" && m.arc.words === "Get through a teaching day" && m.arc.week >= 1);
  const g = Object.fromEntries(m.arc.fit.groups);
  ok("1b. What works towards it: by the arc's rule, own exercises only, grouped by part",
    g["Hip range"]?.includes("Goblet Squat") && g["Upper back and chest"]?.includes("Cat-Cow Stretch") && !Object.values(g).flat().some(n => !LISTS.some(l => l.name === n)), JSON.stringify(m.arc.fit));
  ok("1c. ... and the ones it does not link are named as not linked", m.arc.fit.unlinked.includes("Pallof Press"), JSON.stringify(m.arc.fit.unlinked));
  ok("1d. the week, day by day", m.week.map(d => d.what).join() === "Gym A,Rest,Rest,Rest,Gym A,Rest,Rest");
  const k = m.lists.find(l => l.name === "Kettle stretch");
  ok("1e. the lists, with amounts and On Home", k?.onHome === "morning" && k.items[1].amount === "1 × 30 seconds each side" && m.lists.find(l => l.name === "Gym A").items[0].amount === "3 × 10");
  ok("1f. no name unless switched on: My plan", /My plan in Alongside/.test(PS.planHtml(PS.planBlocks(m))) && !/Sam/.test(all(PS.DEFAULTS)));
  ok("1g. switched on: Sam's plan", /Sam’s plan/.test(PS.planHtml(PS.planBlocks(PS.planModel({ ...PS.DEFAULTS, name: true })))));
  ok("1h. what is on to start: arc, week, lists, saved; off: last 30 days, sore, notes, name",
    PS.DEFAULTS.arc && PS.DEFAULTS.week && PS.DEFAULTS.lists && PS.DEFAULTS.saved && !PS.DEFAULTS.done && !PS.DEFAULTS.sore && !PS.DEFAULTS.notes && !PS.DEFAULTS.name);
  ok("1i. the page says the arc link is a simple rule", PS.planHtml(PS.planBlocks(m)).includes(PS.RULE_LINE.replace(/’/g, "’")));
}

console.log("\nTEST 2 - the boundary");
fixture({ sore: { "lower-back": 6 } });
{
  const every = all({ arc: true, week: true, lists: true, saved: true, done: true, sore: true, notes: true, name: true });
  ok("2a. never the journal, check-in answers or weight, with everything switched on",
    !every.includes(SECRET.journal) && !every.includes(SECRET.mood) && !every.includes(String(SECRET.kg)));
  const def = all(PS.DEFAULTS);
  ok("2b. by default: no sore area, no notes, no last 30 days", !/lower back/i.test(def) && !/Keep the back knee soft/.test(def) && !/last 30 days/i.test(def));
  const on = all({ ...PS.DEFAULTS, sore: true, notes: true });
  ok("2c. switched on, with the health consent: the sore area and the notes", /lower back/i.test(on) && /Keep the back knee soft/.test(on));
  fixture({ health: false, sore: { "lower-back": 6 } });
  const noc = all({ ...PS.DEFAULTS, sore: true, notes: true });
  ok("2d. switched on without the health consent: neither", !/lower back/i.test(noc) && !/Keep the back knee soft/.test(noc));
  const src = (await import("node:fs")).readFileSync(new URL("../js/data/plan-share.js", import.meta.url), "utf8");
  ok("2e. the plan never reads the journal, check-in history or weight", !/journalEntries|checkinHistory|weightLog|getTodaysCheckin/.test(src));
}

console.log("\nTEST 3 - the round trip");
fixture();
{
  const m = PS.planModel(PS.DEFAULTS);
  const read = R.readPlan(PS.planText(m));
  const items = read.days.flatMap(d => d.items);
  ok("3a. every exercise comes back, ticked", items.length === LISTS.length && items.every(i => i.take), JSON.stringify(items.filter(i => !i.take).map(i => [i.name, i.match.kind])));
  const amt = n => { const i = items.find(x => x.name.toLowerCase() === n.toLowerCase()); return i && R.amountText(i.amount); };
  ok("3b. amounts come back the same", amt("Goblet Squat") === "3 x 10" && amt("Hip Flexor Stretch") === "1 x 30s each side" && amt("Plank") === "3 x 30s" && amt("Bird Dog") === "2 x 8 each side",
    JSON.stringify(items.map(i => [i.name, R.amountText(i.amount)])));
  ok("3c. a library name with a dash is matched whole", items.some(i => i.match.id === "romanian-deadlift-rehab" && i.match.kind === "matched" && !i.note));
  ok("3d. On Home comes back with its list", read.days.find(d => d.name === "Kettle stretch")?.onHome === "morning" && !read.days.find(d => d.name === "Gym A")?.onHome);
  const n = R.readPlan("Day: Legs\nGoblet squat — slow on the way down 3 x 10").days[0].items[0];
  ok("3e. a note after a dash still reads as a note (unchanged)", n.match.kind === "matched" && n.note === "slow on the way down", JSON.stringify(n));
  const r2 = R.readPlan("Day: A\nOn Home: evenings\nPlank 3 x 30s\n\nDay: B\nOn home, any time\nPlank 3 x 30s");
  ok("3f. On Home: mornings, evenings, any time", r2.days[0].onHome === "evening" && r2.days[1].onHome === "any");
}

console.log("\nTEST 4 - coming back in");
fixture({ lists: false });
{
  main.innerHTML = ""; const v = PlanImportView(fakeRouter); v.mount(main); await wait(40);
  await change(main.querySelector("#pi-text"), "Day: Kettle stretch\nOn Home: mornings\nCat-Cow Stretch | 1 x 10\n\nDay: Gym A\nRomanian Deadlift — Light Load | 3 x 10");
  await click(main.querySelector("#pi-read"));
  ok("4a. the day says On Home, mornings, as the plan says", /On Home, mornings, as the plan says\./.test(txt(main)), txt(main).slice(0, 300));
  await click(main.querySelector("#pi-add"));
  ok("4b. added: the list is On Home, mornings; the other day is not on Home",
    store.get("myExercisesOnHome")["Kettle stretch"] === "morning" && !("Gym A" in store.get("myExercisesOnHome")) &&
    (store.get("prescribedExercises") || []).some(e => e.exerciseId === "romanian-deadlift-rehab"), JSON.stringify(store.get("myExercisesOnHome")));
}

console.log("\nTEST 5 - the PDF");
fixture();
{
  const bytes = PS.makePlanPdf(PS.planModel(PS.DEFAULTS));
  const s = new TextDecoder("latin1").decode(bytes);
  ok("5a. a whole PDF: header, trailer, end", s.startsWith("%PDF-1.4") && /trailer[\s\S]*startxref\s+\d+\s+%%EOF\s*$/.test(s));
  const xref = Number(s.match(/startxref\s+(\d+)/)[1]);
  const offs = s.slice(xref).split("\n").slice(3).filter(l => / 00000 n $/.test(l)).map(l => Number(l.slice(0, 10)));
  ok("5b. every object is where the index says", offs.length > 5 && offs.every((o, i) => s.startsWith(`${i + 1} 0 obj`, o)), offs.slice(0, 5).join());
  ok("5c. its title and language are set, and the reader shows the title", /\/Title \(My plan, \d+ \w+ \d{4}\)/.test(s) && /\/Lang \(en-GB\)/.test(s) && /\/DisplayDocTitle true/.test(s));
  ok("5d. the words are real text", s.includes("(Goblet Squat)") && s.includes("(Kettle stretch)") && /\(My arc\)/.test(s));
  const raw = Array.from(bytes, b => String.fromCharCode(b)).join("");   // the bytes as they are (TextDecoder("latin1") is really Windows-1252)
  ok("5e. a dash and a times sign as the PDF's own encoding's bytes (0x97, 0xD7)", raw.includes("Romanian Deadlift \x97 Light Load") && raw.includes("3 \xd7 10"));
  ok("5f. every page says Page n of N", (s.match(/\(Page \d+ of \d+\)/g) || []).length === (s.match(/\/Type \/Page /g) || []).length);
  ok("5g. the file's name", /^alongside-plan-\d{4}-\d{2}-\d{2}\.pdf$/.test(PS.planFileName("pdf")));
}

console.log("\nTEST 6 - the screen");
fixture();
{
  main.innerHTML = progress.render ? progress.render() : ""; try { progress.onMount?.(); } catch {}
  if (!main.querySelector("[data-plan-share]")) { const { ProgressView } = await import(B + "views/progress.js"); if (ProgressView) { main.innerHTML = ""; ProgressView(fakeRouter).mount(main); await wait(40); } }
  const row = main.querySelector("[data-plan-share]");
  ok("6a. Progress: Share your plan under Share your progress", !!row && /Share your plan/.test(txt(row)) &&
    (main.querySelector("[data-share-open]").compareDocumentPosition(row) & 4) > 0, txt(main).slice(0, 200));
  navs = []; await click(row);
  ok("6b. it opens the screen", navs.includes("plan-share"));
  main.innerHTML = ""; const v = PlanShareView(fakeRouter); v.mount(main); await wait(20);
  ok("6c. the heading takes focus", document.activeElement === main.querySelector("h1") && txt(main.querySelector("h1")) === "Share your plan");
  const order = ["#sp-share", "#sp-save", "#sp-copy", "#sp-more", ".sh-preview"].map(s => main.querySelector(s));
  ok("6d. Share…, Save as a file, Copy as text and Change what's in it come before the preview",
    order.every(Boolean) && order.every((el, i) => i === 0 || (order[i - 1].compareDocumentPosition(el) & 4)));
  ok("6e. the preview is a real page: headings and tables", main.querySelectorAll(".sp-doc h4").length >= 4 && main.querySelectorAll(".sp-doc table th[scope]").length > 0);
  const boxes = [...main.querySelectorAll("#sp-more input[type=checkbox]")];
  ok("6f. Change what's in it: eight choices in a fieldset, the right ones on", boxes.length === 8 &&
    boxes.filter(b => b.checked).map(b => b.dataset.part).join() === "arc,week,lists,saved" && !!main.querySelector("#sp-more fieldset legend"));
  await change(main.querySelector("#sp-p-done"), true);
  ok("6g. switching one on: the preview shows it, focus stays, and it is said",
    /What I’ve done, last 30 days/.test(txt(main.querySelector(".sp-doc"))) && document.activeElement === main.querySelector("#sp-p-done") && main.querySelector("#sp-more").open);
  await wait(60);
  ok("6h. ... said in the status line", /last 30 days: in/.test(txt(main.querySelector("#sp-status"))));
  ok("6i. never in it, said on the screen", txt(main).includes(PS.NEVER));
  fixture({ health: false });
  main.innerHTML = ""; PlanShareView(fakeRouter).mount(main); await wait(20);
  ok("6j. without the health consent, sore and notes can't be switched on, and it says why",
    main.querySelector("#sp-p-sore").disabled && main.querySelector("#sp-p-notes").disabled && /health answers/.test(txt(main.querySelector("#sp-more"))));
  fixture({ arc: false, week: false });
  main.innerHTML = ""; PlanShareView(fakeRouter).mount(main); await wait(20);
  ok("6k. no arc and no week: one line says so; the page has the lists", /no arc and no week yet/.test(txt(main.querySelector("#sp-gap"))) && !/My arc/.test(txt(main.querySelector(".sp-doc"))) && /Kettle stretch/.test(txt(main.querySelector(".sp-doc"))), txt(main.querySelector("#sp-gap")));
  fixture({ arc: false, week: false, lists: false });
  main.innerHTML = ""; PlanShareView(fakeRouter).mount(main); await wait(20);
  ok("6l. nothing at all: says so, with a way to start, and no Share", /nothing to share yet/.test(txt(main)) && !main.querySelector("#sp-share") && !!main.querySelector('[data-go="your-week"]'));
  fixture({ tier: "free" }); navs = [];
  main.innerHTML = ""; PlanShareView(fakeRouter).mount(main); await wait(20);
  ok("6m. Free: sent to Progress, nothing drawn", navs.includes("progress") && !main.querySelector("h1"));
}

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
