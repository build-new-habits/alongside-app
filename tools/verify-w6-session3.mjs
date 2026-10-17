/**
 * tools/verify-w6-session3.mjs
 * 17 Oct 2026 v1
 *
 * Stage W6, session 3.
 *
 * W6-6 CONSENT-STAYS (2.1, 2.11, 2.16). After Continue the consent form
 *   stayed live above the conversation: Continue again restarted getting
 *   started (a second name box, consent.at rewritten). Now it is replaced
 *   by one line saying what was agreed, before the conversation starts.
 *
 * W6-7 GENTLE-LOGGED (2.12, 2.14, 2.16). The Bad day's gentle plan and the
 *   general routine were logged as a "workout" with no session type: Home
 *   said "You did strength work yesterday", Share my figures would send
 *   "strength", and gentle:false let Mostly the same learn a gentle day as
 *   the usual. Each now carries its own session type and a gentle reason,
 *   and has its own words.
 *
 * W6-10 MOSTLY-SAME-2 (2.14). With Mostly the same, the plan's first line
 *   still rotated every session. Familiar now keeps the first line that is
 *   true of the plan.
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const dom = new JSDOM('<!doctype html><html><body><div id="app"><div id="main-content"></div></div><div id="sr-announcer"></div></body></html>', { url: "https://localhost/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
dom.window.scrollTo = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { ThreadView } = await import(B + "views/onboarding/thread.js");
const { buildSession } = await import(B + "session-builder.js");
const GR = await import(B + "data/general-routine.js");
const { activityPhrase, activityNoun } = await import(B + "data/activity-labels.js");
const { kindOf } = await import(B + "data/evidence.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const rtr = { navigate() {}, back() {}, history: [] };
globalThis.window.router = rtr;
Object.defineProperty(globalThis, "router", { value: rtr, configurable: true, writable: true });

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

console.log("\nTEST 1 - W6-6: after Continue, the consent form is one line");
localStorage.clear(); store.init();
const el = document.createElement("div"); document.body.appendChild(el);
ThreadView(rtr).mount(el);
await wait(2500);
{ const mo = el.querySelector("#ob-age-month"), yr = el.querySelector("#ob-age-year"); if (mo && yr) { mo.value = "1"; yr.value = "1990"; el.querySelector("#ob-age-continue").dispatchEvent(new dom.window.Event("click")); await wait(30); } }
const tick = el.querySelector("#ob-consent-check");
ok("1pc. the consent form is showing", !!tick && !!el.querySelector("#ob-consent-continue"));
tick.checked = true; tick.dispatchEvent(new dom.window.Event("change"));
const hl = el.querySelector("#ob-consent-health"); if (hl) { hl.checked = false; hl.dispatchEvent(new dom.window.Event("change")); }
const cont = el.querySelector("#ob-consent-continue");
cont.dispatchEvent(new dom.window.Event("click"));
await wait(400);
const firstAt = store.get("consent.at");
ok("1a. after Continue: no Continue, no tick boxes", !el.querySelector("#ob-consent-continue") && !el.querySelector("#ob-consent-check"));
const done = el.querySelector(".ob-consent-done");
ok("1b. one line says what was agreed, health answers 'not now' named", !!done && /Privacy Policy and Terms/.test(txt(done)) && /not now/i.test(txt(done)) && /Settings/.test(txt(done)), txt(done));
cont.dispatchEvent(new dom.window.Event("click"));
await wait(200);
ok("1c. the old button clicked again changes nothing (one name box, consent.at kept)", store.get("consent.at") === firstAt && el.querySelectorAll(".ob-consent-done").length === 1);

console.log("\nTEST 2 - W6-7: the gentle plan and the general routine have their own type and words");
function person() {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", "personal");
}
person();
store.set("conditions", ["knee"]); store.set("conditionPainScores", { knee: 8 });
const g = buildSession({ sessionType: "lower", durationMins: 30, equipmentOverride: [], preset: null });
ok("2pc. a Bad knee gives the gentle plan", g?.gentleCare === true, g?.id);
ok("2a. the gentle plan: session type gentle-care and a gentle reason", g?.sessionType === "gentle-care" && !!g?.gentleReason, JSON.stringify({ t: g?.sessionType, r: g?.gentleReason }));
person();
const r = GR.startGeneralRoutine();
ok("2b. the general routine: session type general-routine and a gentle reason", r.sessionType === "general-routine" && !!r.gentleReason);
const e = store.logActivity({ type: "workout", completedAt: new Date().toISOString(), date: new Date().toISOString(), durationMins: 20, status: "completed", exerciseIds: r.exercises.map(x => x.id), gentle: !!r.gentleReason });
ok("2c. logged with its own type", e?.sessionType === "general-routine", String(e?.sessionType));
for (const [t, want] of [["gentle-care", /gentle/i], ["general-routine", /gentle/i]]) {
  const entry = { type: "workout", sessionType: t };
  ok(`2d-${t}. Home's words are its own, not strength`, want.test(activityPhrase(entry)) && !/strength/i.test(activityPhrase(entry) + activityNoun(entry)), activityPhrase(entry));
  ok(`2e-${t}. Share my figures does not send strength`, kindOf(entry) !== "strength", String(kindOf(entry)));
}
ok("2pc2. CONTROL: an upper-body workout is still a strength session", /upper body/i.test(activityPhrase({ type: "workout", sessionType: "upper" })) && kindOf({ type: "workout", sessionType: "upper" }) === "strength");

console.log("\nTEST 3 - W6-10: Mostly the same keeps the first line");
function lines(variety, type) {
  person(); store.set("sessionVariety", variety);
  const seen = new Set();
  for (let i = 0; i < 10; i++) {
    store.set("activityLog", Array.from({ length: i }, (_, k) => ({ id: "x" + k, type: "workout", sessionType: type, status: "completed", completedAt: new Date(Date.now() - (k + 1) * 864e5).toISOString(), durationMins: 30 })));
    const s = buildSession({ sessionType: type, durationMins: 30, equipmentOverride: [], preset: null });
    seen.add((s.coachLine || "").split(/(?<=[.!?])\s/)[0].replace(/\d+/g, "N"));   // the same line; the minutes may differ
  }
  return seen;
}
for (const t of ["core", "upper"]) {
  const f = lines("familiar", t);
  ok(`3a-${t}. familiar, ten sessions: one first line (minutes aside)`, f.size === 1, [...f].join(" | "));
}
ok("3pc. CONTROL: balanced still rotates", lines("balanced", "core").size > 1);

console.log(`\nVERIFY-W6-SESSION3: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
