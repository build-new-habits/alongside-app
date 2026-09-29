/**
 * tools/verify-scope-minor.mjs
 * 29 Sep 2026 v1
 *
 * P0, SCOPE-MINOR. Alongside works around minor aches and injuries. It is
 * not designed around medical conditions, and it does not prescribe,
 * diagnose, treat or monitor anything.
 *
 * Graeme, 29 Sep 2026: "Let's remove all of the things that are likely to
 * flag stuff. Make sure we're not prescribing any injuries or conditions
 * or treatments, or diagnosing anything." And: "make sure we've got the
 * wording that points someone to a professional, not to the app."
 *
 * Decision record: Documents/Admin/alongside_scope_minor-injury_29sep2026_v1.md
 *
 * This gate drives the real screens. It fails if a retired condition can
 * be chosen anywhere, if the statement is missing where it must be, if a
 * stored retired condition or an app-built "programme" survives a load,
 * if My exercises leaks into the coach's sessions, or if any screen says
 * prescribed, rehab, heal, reduce pain, diagnosis or the like.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob", "HTMLInputElement"])
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
globalThis.URL.createObjectURL = () => "blob:x";
dom.window.confirm = () => false; globalThis.confirm = () => false;
dom.window.alert = () => {}; globalThis.alert = () => {};

const R = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
const SCOPE = await import(B + "data/scope-statement.js");
const { CONDITIONS, soreAreaOptions } = await import(B + "data/conditions.js");
const OTD = await import(B + "data/onboarding-thread-data.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const SB = await import(B + "session-builder.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));

// What a person sees or hears: text, and the labels a screen reader says.
const visible = root => [txt(root), ...[...root.querySelectorAll("[aria-label],[placeholder],[title]")]
  .flatMap(e => ["aria-label", "placeholder", "title"].map(a => e.getAttribute(a)).filter(Boolean))].join(" | ");

// The vocabulary of intended medical purpose. "treat" alone is ordinary
// English ("I will never treat time away as failure") and is not banned;
// "treatment" is. The one allowed sentence is the Terms' own disclaimer.
const BAN = /\bprescri\w*|physio notes|notes from your physio|\brehab\b|rehabilitat\w*|\bheal(ed|ing|s)?\b|reduce (your )?pain|recover(y)? from (an |your )?injur\w*|\btreatment\b|diagnos\w*|safe for back|clinical-friendly|clinically/i;
const ALLOWED = [/not a substitute for professional medical advice, diagnosis,? or treatment/gi, /isn[’']t a diagnosis/gi];
const banned = t => { let s = t; for (const a of ALLOWED) s = s.replace(a, ""); return s.match(BAN)?.[0] || null; };

// ── 0. THE RULE CAN SEE WHAT IT IS FOR ───────────────────────────────────
console.log("\nTEST 0 - the scan catches the words it exists for, and passes ordinary English");
ok("0a. REVERSAL: catches each", ["Prescribed by: coach", "Physio notes:", "Rehab", "Feel healed", "Reduce pain",
  "Recover from an injury", "clinical-friendly format", "It isn't a treatment"].every(t => banned(t)));
ok("0b. passes ordinary English and the Terms' disclaimer", !banned("I will never treat time away as failure") &&
   !banned("It is not a substitute for professional medical advice, diagnosis, or treatment."));

// ── 1. THE LIST ─────────────────────────────────────────────────────────
console.log("\nTEST 1 - no retired condition can be chosen anywhere");
const retired = new Set(SCOPE.RETIRED_CONDITIONS);
ok("1a. none in the catalogue", CONDITIONS.every(c => !retired.has(c.id)), CONDITIONS.filter(c => retired.has(c.id)).map(c => c.id).join());
ok("1b. none offered as a sore area, and only body areas are", soreAreaOptions([]).every(o => !retired.has(o.id)) &&
   soreAreaOptions([]).every(o => CONDITIONS.find(c => c.id === o.id)?.zone !== "systemic"));
const sheet = await import(B + "views/onboarding/conditions.js");
localStorage.clear(); store.init();
main.innerHTML = sheet.render();
const names = [...main.querySelectorAll("[data-condition]")].map(b => b.dataset.condition);
ok("1c. the sore-areas sheet offers the kept list and nothing else", names.length === CONDITIONS.length && names.every(id => !retired.has(id)), names.join());
ok("1d. and it carries the statement", !!main.querySelector("[data-scope-statement]") && txt(main).includes(SCOPE.SCOPE_ADVICE));
ok("1e. the clearance question is gone from onboarding", !OTD.STEP_ORDER.includes("8a") && !("exerciseClearance" in store.getDefaults()));
ok("1f. Conditions Update is retired: no route, no file", !/'conditions-update'\s*:/.test(fs.readFileSync(new URL("js/router.js", R), "utf8")) &&
   !fs.existsSync(new URL("js/views/conditions-update.js", R)) && !fs.existsSync(new URL("js/data/conditionProgrammes.js", R)));

// ── 2. THE STATEMENT ────────────────────────────────────────────────────
console.log("\nTEST 2 - the statement, where soreness is asked");
const step8 = OTD.THREAD_STEPS?.[8] || OTD.STEPS?.[8] || Object.values(OTD).find(v => v && typeof v === "object" && v[8]?.sheetView === "onboarding/conditions")?.[8];
ok("2a. onboarding asks about sore areas and says it", !!step8 && step8.coach.includes(SCOPE.SCOPE_ADVICE) && !/health conditions/i.test(step8.coach), step8?.coach?.slice(0, 120));
function fixture(extra = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", "personal");
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  for (const [k, v] of Object.entries(extra)) store.set(k, v);
}
fixture({ conditions: ["knee"] });
const { SettingsView } = await import(B + "views/settings.js");
const rtr = { navigate() {}, back() {}, history: [] }; globalThis.window.router = rtr;
main.innerHTML = ""; SettingsView(rtr).mount(main);
click(main.querySelector('[data-open="conditions"]'));
ok("2b. Settings › Sore or injured areas carries it", !!main.querySelector("[data-scope-statement]") && /Sore or injured areas/.test(txt(main)), txt(main).slice(0, 120));

// ── 3. STORED DATA ──────────────────────────────────────────────────────
console.log("\nTEST 3 - a stored retired condition, or an app-built programme, does not survive a load");
const merged = store.mergeWithDefaults({
  conditions: ["knee", "cardiovascular-condition", "hypermobility"],
  conditionPainScores: { knee: 3, "cardiovascular-condition": 8 },
  conditionMeta: { knee: { addedAt: "2026-09-01", status: "active" }, hypermobility: { addedAt: "2026-09-01", status: "active" } },
  exerciseClearance: "not-sure", conditionGoals: { knee: { goalType: "healed" } }, conditionFoldInLevel: "all",
  conditionReflections: [{ conditionId: "knee", text: "x" }],
  prescribedExercises: [
    { id: "a", name: "Mine", prescribedBy: "Sarah", conditionIds: ["knee"] },
    { id: "b", name: "Coach built", prescribedBy: "coach" },
    { id: "c", name: "Coach picked", prescribedBy: "coach-recommended" }],
});
ok("3a. retired conditions leave every list", JSON.stringify(merged.conditions) === '["knee"]' &&
   !("cardiovascular-condition" in merged.conditionPainScores) && !("hypermobility" in merged.conditionMeta));
ok("3b. and the person is told once", merged.scopeNoticeDue === true);
ok("3c. the retired fields are gone", ["exerciseClearance", "conditionGoals", "conditionFoldInLevel", "conditionReflections"].every(k => !(k in merged)));
ok("3d. only their own exercises stay, with no prescribedBy and no condition", merged.prescribedExercises.length === 1 &&
   merged.prescribedExercises[0].name === "Mine" && !("prescribedBy" in merged.prescribedExercises[0]) && !("conditionIds" in merged.prescribedExercises[0]));
ok("3e. REVERSAL: an ordinary install is not told anything", store.mergeWithDefaults({ conditions: ["knee"] }).scopeNoticeDue !== true);

// ── 4. THE ONE-TIME NOTICE ──────────────────────────────────────────────
console.log("\nTEST 4 - Home says it once, and goes when they say so");
fixture({ scopeNoticeDue: true });
await router._mountView("today"); await wait(30);
const notice = main.querySelector("[data-scope-notice]");
ok("4a. Home shows the statement", !!notice && txt(notice).includes(SCOPE.SCOPE_ADVICE), txt(main).slice(0, 160));
click(notice?.querySelector('[data-action="scope-ok"]')); await wait(30);
ok("4b. Understood clears it for good", !main.querySelector("[data-scope-notice]") && store.get("scopeNoticeDue") === false);
fixture({ tier: "free", scopeNoticeDue: true });
await router._mountView("today"); await wait(30);
ok("4c. on Free too", !!main.querySelector("[data-scope-notice]"));

// ── 5. MY EXERCISES ─────────────────────────────────────────────────────
console.log("\nTEST 5 - My exercises is the person's own list, and stays theirs");
const OWN = [{ id: "px-1", exerciseId: null, name: "Calf raises", sets: 3, reps: "10", notes: "Slow down", active: true, completedToday: false }];
fixture({ prescribedExercises: OWN, conditions: ["lower-back"], conditionPainScores: { "lower-back": 5 } });
await router._mountView("prescribed"); await wait(30);
ok("5a. it is called My exercises and says nothing prescribed", /My exercises/.test(txt(main)) && !banned(visible(main)), banned(visible(main)));
const built = SB.buildSession({ sessionType: "full", durationMins: 30 });
ok("5b. the coach's session does not carry it", !!built && !built.exercises.some(e => e.isPrescribed || e.name === "Calf raises") && !banned(built.coachLine || ""));

// ── 6. EVERY SCREEN ─────────────────────────────────────────────────────
console.log("\nTEST 6 - no screen uses the vocabulary of medical purpose");
const routerSrc = fs.readFileSync(new URL("js/router.js", R), "utf8");
const ROUTES = [...routerSrc.matchAll(/^\s*'([^']+)':\s*\{\s*path:\s*'([^']+)',\s*fn:\s*'([^']+)'\s*\}/gm)].map(m => m[1])
  .filter(r => !["onboarding/goals", "onboarding/conditions", "onboarding/equipment", "onboarding/plan-select"].includes(r));
const hits = [];
for (const tier of ["personal", "free"]) {
  for (const r of ROUTES) {
    fixture({ tier, prescribedExercises: OWN, conditions: ["knee", "lower-back"], conditionPainScores: { knee: 4 } });
    main.innerHTML = "";
    try { await router._mountView(r); } catch { /* verify-mount-all owns crashes */ }
    await wait(20);
    const b = banned(visible(main));
    if (b) hits.push(`${r} (${tier}): "${b}"`);
  }
}
ok("6pc. positive control: many screens were read", ROUTES.length >= 45, `${ROUTES.length} routes`);
ok("6a. none on any screen, on either tier", hits.length === 0, [...new Set(hits)].join("\n        "));

// The words that arrive later than a mount: every onboarding step, every
// goal and aim a person can pick, every programme, check-in opener and
// condition name.
const sources = [];
for (const v of Object.values(OTD)) if (v && typeof v === "object") for (const s of Object.values(v)) {
  if (s && typeof s === "object" && typeof s.coach === "string") sources.push(["onboarding", s.coach, ...Object.values(s.coachAfter || {}).filter(x => typeof x === "string")].join(" "));
}
const { GOAL_CATEGORIES, offeredGoals } = await import(B + "data/goals.js");
offeredGoals({ weightTracking: true }).forEach(c => c.goals.forEach(g => sources.push(g.label)));
const { PROGRAMMES } = await import(B + "data/programmes.js");
Object.values(PROGRAMMES).forEach(p => sources.push([p.name, p.tagline, p.description, ...(p.phases || []).flatMap(ph => [ph.label, ph.description, ph.coachMessage])].join(" ")));
const { AIMS } = await import(B + "data/aims.js");
(AIMS.list || []).forEach(a => sources.push(a.label));
CONDITIONS.forEach(c => sources.push(c.name));
const late = sources.map(t => [t, banned(t)]).filter(([, b]) => b);
ok("6b. nor in onboarding, goals, aims, programmes or the sore-area names", sources.length > 100 && late.length === 0,
   late.slice(0, 6).map(([t, b]) => `"${b}" in ${t.slice(0, 70)}`).join("\n        ") || `${sources.length} strings`);

console.log("");
if (fails) { console.log(`SCOPE-MINOR: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`SCOPE-MINOR: all ${passes} assertions pass\n`);
process.exit(0);
