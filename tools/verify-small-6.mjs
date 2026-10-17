/**
 * tools/verify-small-6.mjs
 * 17 Oct 2026 v1
 *
 * W6-9 SMALL-6 (Wave 6: 2.11, 2.12, 2.13, 2.16; Stage W6 session 5). One
 * assertion each, driven through the screens where it can be.
 */
import { createRequire as __cr } from "node:module";
import { readFileSync } from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div><div id="sr-announcer"></div></body>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0); dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
let navs = [];
router.navigate = v => { navs.push(v); };
router.back = () => { navs.push("<back>"); };
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });   // a bare `router` is window.router in a browser
const todayKey = new Date().toISOString().split("T")[0];

function person(extra = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", "personal");
  store.set("checkinHistory", { [todayKey]: { energy: 6, mood: 6, date: new Date().toDateString() } });
  store.set("lastCheckin", { energy: 6, mood: 6, date: new Date().toDateString(), timestamp: new Date().toISOString() });
  for (const [k, v] of Object.entries(extra)) store.set(k, v);
  gate.endGateSession(); for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture"); gate.endGateSession();
  navs = [];
}

console.log("\nW6-9 SMALL-6");
// 1. Breathing left after about 40 seconds.
{
  person();
  const BS = await import(B + "views/breathing-session.js");
  const realSI = globalThis.setInterval;
  globalThis.setInterval = dom.window.setInterval = (fn, ms) => realSI(fn, Math.max(1, ms / 1000));
  BS.startBreathing(BS.BREATHING_TYPES[0].id, 5);
  main.innerHTML = BS.render(); BS.onMount();
  // Wait on the practice's own clock (not a fixed time: under load the
  // ticks come slower): at least 35 of its 300 seconds gone.
  const left = () => { const m = txt(document.getElementById("bs-time-remaining")).match(/(\d+):(\d\d)/); return m ? +m[1] * 60 + +m[2] : 300; };
  for (let i = 0; i < 400 && left() > 265; i++) await wait(5);
  click(document.getElementById("bs-exit-btn"));
  globalThis.setInterval = dom.window.setInterval = realSI;
  const e = (store.get("activityLog") || []).at(-1);
  ok("1. breathing left part-way: saved as partial, its minutes, not the full 5 completed", e && e.status === "partial" && e.durationMins >= 1 && e.durationMins < 5, JSON.stringify(e && { s: e.status, m: e.durationMins }));
}
// 2. The update check-in reaches today's check-in.
{
  person();
  const CM = await import(B + "views/checkin-mini.js");
  main.innerHTML = CM.render(); CM.onMount();
  const sl = document.getElementById("mini-energy-slider"); if (sl) { sl.value = "2"; sl.dispatchEvent(new dom.window.Event("input")); }
  for (let i = 0; i < 4 && !document.getElementById("mini-done-btn"); i++) { click(document.getElementById("mini-next-btn")); await wait(5); }
  click(document.getElementById("mini-done-btn")); await wait(5);
  const { getTodaysCheckin } = await import(B + "data/checkin.js");
  ok("2. the update check-in's energy is what the plan reads", getTodaysCheckin()?.energy === 2, JSON.stringify(getTodaysCheckin()));
}
// 3. The finish screen's moments are wired on the first mount.
{
  const src = readFileSync(new URL("../js/views/reflect.js", import.meta.url), "utf8");
  const om = src.slice(src.indexOf("export function onMount"), src.indexOf("export function onMount") + 4000);
  ok("3. the finish wires its moment controls in onMount itself (the router's first mount)", /attachSessionMoments\(/.test(om));
}
// 4. The journal door's No thanks does not start the chair workout.
{
  person({ consent: { ...store.get("consent"), health: { given: false, declinedAt: new Date().toISOString() } } });
  const HC = await import(B + "data/health-consent.js");
  const { HealthConsentView } = await import(B + "views/health-consent.js");
  HC.setPendingRoute("journal-entry");
  main.innerHTML = ""; HealthConsentView(router).mount(main);
  click(main.querySelector("#hc-not-now"));
  const routine = /gentle routine/i.test(txt(main));
  click(main.querySelector("#hc-no-thanks, #hc-routine"));
  ok("4. from the journal: no routine offered, and No thanks goes to Wellbeing, not a workout", !routine && navs.at(-1) === "noticing" && !navs.includes("workout"), JSON.stringify(navs));
  person({ consent: { ...store.get("consent"), health: { given: false, declinedAt: new Date().toISOString() } } });
  HC.setPendingRoute("coach-proposal");
  main.innerHTML = ""; HealthConsentView(router).mount(main);
  click(main.querySelector("#hc-not-now"));
  ok("4pc. CONTROL: from a session door the routine is still offered", /gentle routine/i.test(txt(main)));
}
// 5. A yes from Settings comes back to the page it was asked from.
{
  person({ consent: { ...store.get("consent"), health: { given: false, declinedAt: new Date().toISOString() } } });
  const { SettingsView } = await import(B + "views/settings.js");
  const { settingsFind } = await import(new URL("./settings-open.mjs", import.meta.url).href);
  main.innerHTML = ""; SettingsView(router).mount(main);
  click(settingsFind(main, '[data-open="conditions"]'));
  const row = main.querySelector('[data-action="edit-conditions"]');
  const sectionTitle = txt(main.querySelector(".settings-title, h1"));
  click(row);
  ok("5pc. the sore areas ask for the consent first", navs.at(-1) === "health-consent", JSON.stringify(navs));
  const HC = await import(B + "data/health-consent.js");
  HC.giveHealthConsent();
  router.history = ["settings", "health-consent"];   // straight back from the consent screen
  main.innerHTML = ""; SettingsView(router).mount(main);
  router.history = [];
  ok("5. after yes: back on the same Settings page, not the index", txt(main.querySelector(".settings-title, h1")) === sectionTitle && !main.querySelector("[data-section-open]"), `${sectionTitle} → ${txt(main.querySelector(".settings-title, h1"))}`);
}
// 6. Log what I did keeps the activity and goes back where it came from.
{
  person();
  const lib = await import(B + "views/library.js");
  const AL = await import(B + "views/activity-log.js");
  main.innerHTML = lib.render(); lib.onMount();
  click(main.querySelector("#lib-log-activity-btn"));
  main.innerHTML = lib.render(); lib.onMount();
  click([...main.querySelectorAll("[data-log-label]")].find(b => b.dataset.logLabel === "Swim"));
  main.innerHTML = AL.render(); AL.onMount();
  ok("6a. the Library's Swim arrives chosen", txt(main.querySelector(".activity-log-type")) === "Swim", txt(main).slice(0, 120));
  router.history = ["library"]; navs = [];
  click(main.querySelector("#activity-cancel-btn, #activity-done-btn"));
  ok("6b. leaving goes back, not to Settings", navs.at(-1) === "<back>" && !navs.includes("settings"), JSON.stringify(navs));
}
// 7. The phone's Back keeps a half-written journal entry.
{
  person({ consent: { ...store.get("consent") } });
  store.set("consent.health", { given: true, at: new Date().toISOString(), version: (await import(B + "data/health-consent.js")).HEALTH_CONSENT_VERSION });
  const { JournalEntryView } = await import(B + "views/journal-entry.js");
  main.innerHTML = ""; JournalEntryView(router).mount(main);
  const ta = main.querySelector("#je-text"); ta.value = "half a thought"; ta.dispatchEvent(new dom.window.Event("input"));
  main.innerHTML = "";   // the phone's Back: the router mounts something else
  JournalEntryView(router).mount(main);
  ok("7. back on the journal, the words are still there", main.querySelector("#je-text")?.value === "half a thought");
  click(main.querySelector('[data-action="discard"]'));
  main.innerHTML = ""; JournalEntryView(router).mount(main);
  ok("7pc. thrown away on purpose: gone", main.querySelector("#je-text")?.value === "");
}
// 8. A builder hand-over does not outlive the trip.
{
  person({ sessionBuilderPreselect: { type: "stretch", returnTo: "mobility-conditioning" } });
  const { TodayView } = await import(B + "views/today.js");
  main.innerHTML = ""; TodayView(router).mount(main);
  ok("8. back at Home, a Stretch preselect is dropped", store.get("sessionBuilderPreselect") == null);
}
// 9. Skipping the sore areas says which are kept.
{
  const src = readFileSync(new URL("../js/views/onboarding/thread.js", import.meta.url), "utf8");
  ok("9. skipping the sore areas names the ones kept", /I've kept what you'd already tapped/.test(src) && /bodyAreasOf\(store\.get\('conditions'\)/.test(src));
}
// 10 and 11. Quiet session: the end cue survives; a short save is said.
{
  const src = readFileSync(new URL("../js/views/quiet-session.js", import.meta.url), "utf8");
  const done = src.slice(src.indexOf("function renderMindfulComplete"), src.indexOf("function renderMindfulComplete") + 800);
  ok("10. the finished screen holds the cue's live region, filled after the redraw", /id="quiet-mindful-cue"/.test(done) && /end of the practice/.test(src.slice(src.indexOf("mindfulComplete = true;"), src.indexOf("mindfulComplete = true;") + 900)));
  ok("11. a save under ten seconds says nothing was saved", /nothing to save/.test(src));
}
// 12. No buzz promised where the phone cannot.
{
  person();
  const had = "vibrate" in dom.window.navigator;
  try { delete dom.window.navigator.vibrate; } catch {}
  const BS = await import(B + "views/breathing-session.js");
  BS.startBreathing(BS.BREATHING_TYPES[0].id, 3);
  main.innerHTML = BS.render();
  ok("12. a phone that cannot vibrate is not told it buzzes", !/buzzes/.test(txt(main)), had ? "jsdom had vibrate" : "");
  try { BS.onUnmount?.(); } catch {}
}
// 13. Research messages are dated the day they became due.
{
  const at = d => new Date(Date.now() - d * 864e5).toISOString();
  person({ createdAt: at(80) });
  store.set("activityLog", Array.from({ length: 20 }, (_, i) => ({ id: "e" + i, type: "walk", status: "completed", completedAt: at(70 - i * 3), durationMins: 20 })));
  const E = await import(B + "data/evidence.js");
  E.RECEIVER.url = "https://abcdefgh.supabase.co"; E.RECEIVER.key = "anon-public-key";   // as verify-evidence: sending on
  const msgs = E.researchMessages();
  E.RECEIVER.url = ""; E.RECEIVER.key = "";
  const s = msgs.find(m => m.action === "survey"), f = msgs.find(m => m.action === "share-figures");
  ok("13b-pc. the figures are offered", !!f);
  // The survey, on a phone installed after the research began (1 Oct).
  person({ createdAt: at(14) });
  store.set("activityLog", Array.from({ length: 4 }, (_, i) => ({ id: "s" + i, type: "walk", status: "completed", completedAt: at(12 - i * 2), durationMins: 20 })));
  E.RECEIVER.url = "https://abcdefgh.supabase.co"; E.RECEIVER.key = "anon-public-key";
  const s2 = E.researchMessages().find(m => m.action === "survey");
  E.RECEIVER.url = ""; E.RECEIVER.key = "";
  ok("13a. the survey is dated a week after the first session, not the install day", s2 && s2.publishedAt === at(5).slice(0, 10) && s2.publishedAt !== at(14).slice(0, 10), s2?.publishedAt);
  ok("13b. the figures eight weeks after the first", f && f.publishedAt === at(14).slice(0, 10), f?.publishedAt);
}
// 14. The News hint follows the switch.
{
  person({ "messages.newsOn": true });
  const { SettingsView } = await import(B + "views/settings.js");
  const { settingsFind } = await import(new URL("./settings-open.mjs", import.meta.url).href);
  main.innerHTML = ""; SettingsView(router).mount(main);
  click(main.querySelector('[data-open="messages"], [data-go="messages"], [data-action="messages"]'));
  const sw = main.querySelector("#settings-news");
  const row = sw?.closest("li") || sw?.parentElement;
  ok("14. News on: the hint does not say it is off", !!sw && !/Off unless you turn it on/.test(txt(row)), txt(row));
}

console.log(`\nVERIFY-SMALL-6: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
