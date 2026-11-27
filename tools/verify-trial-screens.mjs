/**
 * tools/verify-trial-screens.mjs
 * 27 Nov 2026 v1
 *
 * Row 17 / P-40, Try the Plan, S2 (spec docs/specs/alongside_plan-trial_
 * 27nov2026_v1.md; mock-up v2 approved by Graeme 27 Nov). The screens:
 *
 *   1  Free's finish: the offer after a finished session, its words; Try
 *      the Plan keeps what was said, starts the trial, opens Start your
 *      Plan; Not now; never on the Plan, a low day, twice in a week; no In
 *      Step offer on the same finish.
 *   2  Upgrade: Try the Plan for 14 days (no I'm ready); during a trial,
 *      until when and nothing charged; Keep the Plan: the early price,
 *      yearly first, Not open yet; after a trial, Keep the Plan; never in a
 *      young version.
 *   3  Settings › Your plan during a trial: until when, nothing charged,
 *      Go back to Free now, asked once more.
 *   4  The Plan's Home: the notice two days before, once; Stay on Free;
 *      Keep the Plan.
 *   5  Free's Home after a trial: Your own Home is saved.
 *   6  The developer panel's trial controls; no countdown anywhere.
 *
 * Red on alongside-v763.
 */
import fs from "node:fs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };

// A stand-in Audio that records what was asked for and plays only when told.
const audios = [];
let fileThere = false;
class FakeAudio {
  constructor(src) { this.src = src; this.ls = {}; this.paused = true; audios.push(this); }
  addEventListener(t, f) { (this.ls[t] ||= []).push(f); }
  fire(t) { (this.ls[t] || []).forEach(f => f()); }
  play() { this.paused = false; queueMicrotask(() => this.fire(fileThere ? "playing" : "error")); return Promise.resolve(); }
  pause() { this.paused = true; }
}
globalThis.Audio = FakeAudio;
const fetched = [];
globalThis.fetch = async (u) => { u = String(u); if (/audio\/manifest\.json$/.test(u)) return { ok: true, json: async () => ({ files: fileThere ? Object.fromEntries(ALL_IDS.map(id => [id, HASH])) : {} }) }; fetched.push(u); return { ok: fileThere }; };

const ROOT = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
// v-list: the recordings' list decides what plays (coach-audio.js v3). Every
// clip and track the app knows, all "there" or none.
const CA = await import(B + "coach-audio.js");
const { clipIds } = await import(new URL("./build-audio.mjs", import.meta.url).href);
const { GUIDE_SESSIONS: _GS } = await import(B + "data/guide-me.js");
const ALL_IDS = [...clipIds(), ...Object.values(_GS).map(x => x.track)];
let HASH = "abc123def4567890";
const V = "?v=abc123def4567890";
async function setFiles(on) { fileThere = on; await CA.loadAudioManifest(); }
const { router } = await import(B + "router.js");
const navs = [];
router.navigate = (v) => { navs.push(v); };
globalThis.router = router; dom.window.router = router;
const IS   = await import(B + "views/in-step.js");
const NOT  = await import(B + "views/noticing.js");
const RF   = await import(B + "views/reflect.js");
const { PlanFinishView } = await import(B + "views/plan-finish.js");
const PROG = await import(B + "data/in-step-programme.js");
const OFF  = await import(B + "data/in-step-offer.js");
const { giveHealthConsent } = await import(B + "data/health-consent.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
async function block(name, fn) { try { await fn(); } catch (e) { ok(`${name}: ran without throwing`, false, e.stack?.split("\n").slice(0, 3).join(" | ")); } }
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const T = el => ((el || main).textContent || "").replace(/\s+/g, " ").trim();
const $ = s => main.querySelector(s);
const tap = s => { const el = typeof s === "string" ? $(s) : s; el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };
const prog = () => (store.get("inStepProgress") || {}).programme;
const dayAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const key = d => d.toISOString().split("T")[0];

async function seed({ tier = "personal", sessions = 4, checkin = { energy: 7, mood: 6 }, sore = null, programme = null, voice = "off" } = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "Sentinel-S3");
  store.set("ageConfirmed", true);
  store.set("activityLog", Array.from({ length: sessions }, (_, i) => ({ id: "p" + i, type: "workout", status: "completed", completedAt: dayAgo(i + 1).toISOString(), date: dayAgo(i + 1).toISOString() })));
  if (checkin) { store.set("checkinHistory", { [key(new Date())]: checkin }); store.set("lastCheckin", { ...checkin, date: new Date().toDateString() }); }
  if (sore) { store.set("conditions", [sore.id]); store.set("conditionPainScores", { [sore.id]: sore.score }); }
  if (programme) store.set("inStepProgress", { ...(store.get("inStepProgress") || {}), programme: { ...prog(), ...programme } });
  store.set("coachVoice", voice);
  // v7 (Row 17): Free's finish offers the Plan trial first, with no In Step offer as well; In Step's offer here is the subject, so the trial was offered this week.
  if (tier === "free") store.set("planTrial", { offeredAt: new Date().toISOString() });
  audios.length = 0; navs.length = 0;
  await setFiles(false);
}
function mountInStep() { IS.onUnmount?.(); main.innerHTML = IS.render(); IS.onMount(); }

const TR = await import(B + "data/plan-trial.js");
const UP = await import(B + "views/upgrade.js");
const PH = await import(B + "views/plan-home.js");
const FH = await import(B + "views/free-home.js");
const { SettingsView } = await import(B + "views/settings.js");
const { settingsFind } = await import(new URL("./settings-open.mjs", import.meta.url).href);
const PR = await import(B + "data/pricing.js");
const fsx = await import("node:fs");
const read = f => fsx.readFileSync(new URL("../" + f, import.meta.url), "utf8");
function freeFinish(entry = {}) {
  store.set("currentActivityEntry", { id: "f" + Math.random(), type: "run", status: "completed", name: "Run", ...entry });
  main.innerHTML = RF.render(); RF.onMount();
}
const fresh = async (o = {}) => { await seed({ tier: "free", sessions: 0, ...o }); store.set("planTrial", {}); store.set("consent", { ...(store.get("consent") || {}), ageConfirmed: true, ageGroup: "adult" }); navs.length = 0; };
const mountUp = () => { main.innerHTML = UP.render(); UP.onMount(); };

await block("TEST 1", async () => {
  console.log("\nTEST 1 - Free's finish");
  await fresh(); freeFinish();
  ok("1a. after a first finished session: Want me to fit around your week?", T($("#rf-trial-h")) === "Want me to fit around your week?" && /Try the Plan for 14 days\. No card\. Nothing is charged, then or after\./.test(T($("#rf-trial"))), T($("#rf-trial")));
  ok("1b. with Try the Plan and Not now, and Back to Home still there", T($("#rf-trial-start")) === "Try the Plan" && T($("#rf-trial-later")) === "Not now" && !!$("#reflect-done-btn"));
  ok("1c. one offer at a time: no In Step offer as well", !$(".instep-offer"));
  ok("1d. recorded as offered", !!TR.trial().offeredAt);
  tap("#rf-trial-start"); await wait(20);
  ok("1e. Try the Plan: the session is kept, the trial starts, Start your Plan opens", (store.get("activityLog") || []).length === 1 && store.get("tier") === "personal" && TR.trialActive() && navs.at(-1) === "my-move", JSON.stringify(navs) + " " + (store.get("activityLog") || []).length);
  await fresh(); freeFinish();
  tap("#rf-trial-later"); await wait(10);
  ok("1f. Not now closes it, and Back to Home has the focus", !$("#rf-trial") && document.activeElement === $("#reflect-done-btn") && store.get("tier") === "free");
  freeFinish();
  ok("1g. not again within the week", !$("#rf-trial"));
  await fresh({ tier: "personal" }); freeFinish();
  ok("1h. never on the Plan", !$("#rf-trial"));
  await fresh({ checkin: { energy: 2, mood: 2 } }); freeFinish();
  ok("1i. never on a low day", !$("#rf-trial"));
});

await block("TEST 2", async () => {
  console.log("\nTEST 2 - Upgrade");
  await fresh(); mountUp();
  ok("2a. Free: Try the Plan for 14 days, named by its words; no I'm ready", T($("#upgrade-cta")) === "Try the Plan for 14 days" && !$("#upgrade-cta").hasAttribute("aria-label") && !/I.m ready/.test(T()));
  ok("2b. the trial said plainly, and no longer \"free while in beta\"", /Try the Plan for 14 days\. No card, and nothing is charged, then or after\./.test(T()) && !/free while Alongside is in beta/.test(T()));
  tap("#upgrade-cta"); await wait(10);
  ok("2c. the button starts the trial and opens Start your Plan", TR.trialActive() && navs.at(-1) === "my-move");
  mountUp();
  ok("2d. during it: You're trying the Plan, until when, nothing charged", /You’re trying the Plan\./.test(T()) && new RegExp(`Free until ${TR.endsOnWords()}\\. Nothing is charged\\.`).test(T()), T().slice(0, 200));
  tap("#upgrade-keep"); await wait(10);
  ok("2e. Keep the Plan: the early price, yearly first, then monthly", T().indexOf(`${PR.PRICE_EARLY_ANNUAL} a year`) > -1 && T().indexOf(`${PR.PRICE_EARLY_ANNUAL} a year`) < T().indexOf(`Or ${PR.PRICE_MONTHLY} a month`) && T().includes(`About ${PR.PRICE_EARLY_MONTHLY_EQUIV} a month`), T().slice(0, 300));
  ok("2f. Not open yet: nobody can pay; on the Plan until the end, then Free", /Not open yet/.test(T($("#keep-not-yet"))) && T($("#keep-not-yet")).includes(`You’re on the Plan until ${TR.endsOnWords()}, then Free, with everything saved.`));
  ok("2g. one heading, Keep the Plan, and a way home", main.querySelectorAll("h1").length === 1 && T($("h1")) === "Keep the Plan" && !!$('[data-action="keep-home"]'));
  tap('[data-action="keep-home"]'); await wait(10);
  TR.endTrial(new Date(), "ended"); mountUp();
  ok("2h. after a trial: Keep the Plan, and your Home is saved", T($("#upgrade-cta")) === "Keep the Plan" && /Your trial has ended\. Your own Home is saved, if you come back\./.test(T()));
  tap("#upgrade-cta"); await wait(10);
  ok("2i. which shows the early price, and says you're on Free", T($("#keep-not-yet")).includes("You’re on Free, with everything saved.") && store.get("tier") === "free");
  router.upgradeStage = null; mountUp();
  ok("2i2. and the next visit is Upgrade again, not Keep the Plan (it is never stuck there)", !!$("#upgrade-cta") && T($("h1")) !== "Keep the Plan");
  await fresh(); store.set("consent", { ...store.get("consent"), ageGroup: "young-16" }); mountUp();
  ok("2j. never in a young version: no button", !$("#upgrade-cta") && !!$("#upgrade-young"));
  await fresh(); router.upgradeStage = "keep"; mountUp();
  ok("2k. Home's notice and Settings open Keep the Plan straight away (router.upgradeStage)", T($("h1")) === "Keep the Plan" && router.upgradeStage === null);
  tap('[data-action="keep-home"]');
});

await block("TEST 3", async () => {
  console.log("\nTEST 3 - Settings › Your plan");
  await fresh(); TR.startTrial();
  const s = document.createElement("div"); document.body.appendChild(s);
  SettingsView(router).mount(s); await wait(20);
  ok("3a. the row says the Plan, on a free trial? (the row reads the Plan)", /Plan/.test(T(settingsFind(s, '[data-open="about-plan"] .settings-row__value'))));
  tap(settingsFind(s, '[data-open="about-plan"]')); await wait(20);
  ok("3b. You are on: The Plan, on a free trial; until when; nothing charged", /The Plan, on a free trial/.test(T(s)) && T(s).includes(`Until ${TR.endsOnWords()}. Nothing is charged.`), T(s).slice(0, 300));
  ok("3c. what happens at the end", /You go back to Free\. Your Home, your hard days and My exercises are kept, if you come back\./.test(T(s)));
  tap(s.querySelector('[data-action="trial-stop"]')); await wait(10);
  ok("3d. Go back to Free now asks once more, saying a phone has one trial", /a phone has one trial/.test(T(s.querySelector("#settings-trial-actions"))) && document.activeElement === s.querySelector('[data-action="trial-stop-yes"]') && TR.trialActive());
  tap(s.querySelector('[data-action="trial-stop-yes"]')); await wait(10);
  ok("3e. Yes: back to Free, stopped, nothing else changed", store.get("tier") === "free" && TR.trial().endedHow === "stopped");
  s.remove();
});

await block("TEST 4", async () => {
  console.log("\nTEST 4 - The Plan's Home");
  await fresh(); TR.startTrial(); TR.devTwoDaysLeft();
  const h = document.createElement("div"); h.innerHTML = PH.renderPlanHome({ greeting: "Good morning, Sam" }); PH.wirePlanHome(h, router);
  ok("4a. two days before: Your Plan trial ends on <day>", T(h.querySelector("#trial-notice-h")) === `Your Plan trial ends on ${TR.endsOnDay()}`, T(h.querySelector("#trial-notice-h")));
  ok("4b. what stays on Free and what is kept", /On Free\. The coach still builds a session every day\. Wellbeing and safety stay\./.test(T(h)) && /Kept for you\. Your Home, your hard days, My exercises and what helps you\. Saved, if you come back\./.test(T(h)));
  ok("4c. shown once: seen is noticed", !!TR.trial().noticedAt && !TR.noticeDue());
  tap(h.querySelector('[data-action="trial-stay"]')); await wait(10);
  ok("4d. Stay on Free: gone, and it says when", !h.querySelector("#trial-notice") && T(h.querySelector("#trial-notice-status")) === `You’ll be back on Free on ${TR.endsOnDay()}, with everything kept.`);
  const h2 = document.createElement("div"); h2.innerHTML = PH.renderPlanHome({ greeting: "Hi" });
  ok("4e. not again", !h2.querySelector("#trial-notice"));
  await fresh(); TR.startTrial(); TR.devTwoDaysLeft();
  const h3 = document.createElement("div"); h3.innerHTML = PH.renderPlanHome({ greeting: "Hi" }); PH.wirePlanHome(h3, router); navs.length = 0;
  tap(h3.querySelector('[data-action="trial-keep"]'));
  ok("4f. Keep the Plan opens the early price", router.upgradeStage === "keep" && navs.at(-1) === "upgrade");
  router.upgradeStage = null;
  await fresh(); TR.startTrial();
  const h4 = document.createElement("div"); h4.innerHTML = PH.renderPlanHome({ greeting: "Hi" });
  ok("4g. not with more than two days left", !h4.querySelector("#trial-notice"));
});

await block("TEST 5", async () => {
  console.log("\nTEST 5 - Free's Home after a trial");
  await fresh();
  let f = document.createElement("div"); f.innerHTML = FH.renderFreeHome({ greeting: "Hi" });
  ok("5a. before one: Want more choice? See what the Plan adds", /Want more choice\? See what the Plan adds/.test(T(f)) && !/Your own Home is saved/.test(T(f)));
  TR.startTrial(); TR.endTrial();
  f.innerHTML = FH.renderFreeHome({ greeting: "Hi" });
  ok("5b. after: Your own Home is saved. Pick up the Plan any time. (to Upgrade)", /Your own Home is saved\. Pick up the Plan any time\./.test(T(f)) && f.querySelector(".free-home__saved [data-route='upgrade']"));
});

await block("TEST 6", async () => {
  console.log("\nTEST 6 - The developer panel, and no countdown");
  const st = read("js/views/settings.js");
  ok("6a. trial controls: start, 2 days left, end now, forget", ["start", "two-left", "end", "forget"].every(k => st.includes(`data-dev-trial="${k}"`)));
  ok("6b. through plan-trial.js (the only writer of planTrial)", /devForgetTrial\(\); startTrial\(\);/.test(st) && /devTwoDaysLeft\(\)/.test(st));
  const shown = ["js/views/upgrade.js", "js/views/reflect.js", "js/views/plan-home.js", "js/views/free-home.js"].map(read).join(" ").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  ok("6c. no countdown: no \"days left\" or \"left in your trial\" on any screen", !/days? left|left in your trial|\bhurry\b|\bonly \d+ days\b/i.test(shown));
  const upBody = read("js/views/upgrade.js").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/<!--[\s\S]*?-->/g, "");
  ok("6d. the prices come from pricing.js, not typed", !/£\d|\\u00A3\d/.test(upBody) && /PRICE_EARLY_ANNUAL/.test(upBody));
});

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
