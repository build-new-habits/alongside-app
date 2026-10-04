/**
 * tools/verify-three-questions.mjs
 * 04 Oct 2026 v2
 *
 * v2 - LOOK-1: the Settings test looks for the "How much sessions change"
 *   row on each section page in turn (it lives on Sessions now, not the
 *   index); same text match, no assertion loosened.
 *
 * P14, FOURTH QUESTION (persona finding W2-16). Free was asked a fourth
 * check-in question every time -- "something like last time, or
 * something different?" -- and each answer overwrote the setting the
 * person had chosen in Settings (sessionVariety).
 *
 * Graeme accepted the recommendation (28 Sep): remove it from the
 * check-in; Settings holds the preference.
 *
 * Driven through the real check-in on both tiers, for somebody with
 * recent sessions coming in through a session door (the case that asked
 * it), then Settings.
 */
import { createRequire as __cr } from "node:module";
import { settingsSection } from "./settings-open.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(0), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { CheckinView } = await import(B + "views/checkin.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms = 3000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = fn(); if (v) return v; await wait(15); } return null; }
const tappables = () => [...document.querySelectorAll("#app button, .ci-panel button")].filter(b => !b.disabled && !b.closest("[hidden]"));
async function tap(re) { const b = await waitFor(() => tappables().find(x => re.test(x.textContent.trim()))); if (!b) return null; b.click(); await wait(30); return b.textContent.trim(); }
const text = () => (document.body.textContent || "").replace(/\s+/g, " ");

function fixture(tier) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("pendingDoorRoute", "coach-proposal");
  store.set("sessionVariety", "varied");            // their own setting
  const d = n => new Date(Date.now() - n * 864e5).toISOString();
  store.set("exerciseHistory", { "push-up": { count: 3, last: d(2), history: [d(2), d(5), d(9)] } });
  store.set("activityLog", [2, 5, 9].map(n => ({ id: "a" + n, type: "workout", status: "completed", completedAt: d(n), date: d(n), exerciseIds: ["push-up"] })));
  document.querySelectorAll(".ci-panel, .ci-overlay").forEach(n => n.remove());
}

for (const tier of ["free", "personal"]) {
  console.log(`\nTEST (${tier}) - three questions, then the plan`);
  fixture(tier);
  const stats = store.exerciseStats("push-up");
  ok(`pc-${tier}. somebody with a recent session, coming in through a session door`, stats.seen && stats.daysSince <= 21, JSON.stringify(stats));
  const app = document.getElementById("app"); app.innerHTML = "";
  const navs = [];
  CheckinView({ navigate: v => navs.push(v), back() {} }).mount(app);
  const asked = [];
  if (await tap(/^Okay$/)) asked.push("energy");
  if (await tap(/^Okay$/)) asked.push("mood");
  if (await tap(/^Nothing today$/)) asked.push("sore");
  await waitFor(() => navs.length > 0 || document.querySelector("[data-variety]"), 4000);
  ok(`a-${tier}. energy, mood, anything sore -- and on to the plan`, asked.length === 3 && navs[0] === "coach-proposal", `${asked.join(",")} → ${JSON.stringify(navs)}`);
  ok(`b-${tier}. no fourth question`, !document.querySelector("[data-variety]") && !/something different today\?/i.test(text()));
  // Where it is still asked, answer it the way a person would.
  const fourth = document.querySelector("[data-variety]");
  if (fourth) { fourth.click(); await waitFor(() => navs.length > 0, 3000); }
  ok(`c-${tier}. and their own setting is untouched`, store.get("sessionVariety") === "varied", store.get("sessionVariety"));
}

console.log("\nTEST - Settings holds the preference");
{
  fixture("free");
  const { SettingsView } = await import(B + "views/settings.js");
  const main = document.createElement("div"); main.id = "settings-under-test"; document.body.appendChild(main);
  SettingsView({ navigate() {}, back() {}, history: [] }).mount(main); await wait(30);
  const findRow = () => [...main.querySelectorAll(".settings-row")].find(r => /How much sessions change/.test(r.textContent));
  let row = findRow();
  for (const id of ["you", "body", "sessions", "display", "data", "plan", "about"]) { if (row) break; settingsSection(main, id); row = findRow(); }
  ok("s-a. the row is there on Free, showing their choice", !!row && /different/i.test(row.textContent), row?.textContent.replace(/\s+/g, " "));
  row?.dispatchEvent(new window.MouseEvent("click", { bubbles: true })); await wait(30);
  const sel = main.querySelector("#settings-pref-variety");
  ok("s-b. its hint no longer says the coach asks", !!sel && !/coach also asks|asks this before/i.test(main.textContent), main.querySelector("#pref-variety-hint")?.textContent.replace(/\s+/g, " "));
  if (sel) { sel.value = "familiar"; sel.dispatchEvent(new window.Event("change", { bubbles: true })); await wait(20); }
  ok("s-c. changing it in Settings is what writes it", store.get("sessionVariety") === "familiar", store.get("sessionVariety"));
}

console.log("");
if (fails) { console.log(`THREE-QUESTIONS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`THREE-QUESTIONS: all ${passes} assertions pass\n`);
process.exit(0);
