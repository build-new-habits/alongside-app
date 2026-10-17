/**
 * tools/verify-true-words-6.mjs
 * 17 Oct 2026 v1
 *
 * W6-8 TRUE-WORDS-6 (Wave 6, all personas; Stage W6 session 4). Each line
 * the tracers found untrue, made true or removed; one assertion each.
 * Where a line was removed, the check reads the whole of js/ for it, so it
 * cannot come back in another file (W5-20's exit-card check read two).
 */
import { createRequire as __cr } from "node:module";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
dom.window.confirm = () => false; globalThis.confirm = () => false;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

const ROOT = new URL("../js/", import.meta.url);
const B = ROOT.href;
const { store } = await import(B + "store.js");
const gate = await import(B + "safety-gate.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const { SettingsView } = await import(B + "views/settings.js");
const { ProgressView } = await import(B + "views/progress.js");
const yoga = await import(B + "views/yoga-session.js");
const { generateIntentAck, STEPS } = await import(B + "data/onboarding-thread-data.js").then(m => ({ generateIntentAck: m.generateIntentAck, STEPS: m.STEPS || m.THREAD_STEPS || null }));
const RF = await import(B + "data/red-flag.js");
const GR = await import(B + "data/general-routine.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { withDefaultDose } = await import(B + "session-builder.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const { settingsFind } = await import(new URL("./settings-open.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const rtr = { navigate() {}, back() {}, history: [], currentView: null };
globalThis.window.router = rtr;

// Every line of js/ that is not a comment.
function files(dir) { return readdirSync(dir).flatMap(f => { const p = join(dir, f); return statSync(p).isDirectory() ? files(p) : p.endsWith(".js") ? [p] : []; }); }
const CODE = files(ROOT.pathname).flatMap(f => readFileSync(f, "utf8").split("\n").map((l, i) => ({ f: f.replace(ROOT.pathname, ""), i: i + 1, l })))
  .filter(x => !/^\s*(\*|\/\/|\/\*)/.test(x.l));
const found = re => CODE.filter(x => re.test(x.l)).map(x => `${x.f}:${x.i}`);

function person(tier = "personal") {
  localStorage.clear(); store.init(); gate.endGateSession(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", tier);
  store.set("homeEquipment", []); store.set("sessionLocation", "home");
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  store.set("checkinHistory", { [new Date().toISOString().split("T")[0]]: { energy: 6, mood: 6, date: new Date().toDateString() } });
}

console.log("\nW6-8 TRUE-WORDS-6");
const wont = found(/won.t be saved|won\\u2019t be saved/i);
ok("a. no exit card says it won't be saved above Exit and save progress (all of js/)", wont.length === 0, wont.join(", "));
const here = found(/changes it here too/);
ok("b. Settings no longer says Length on the plan changes the usual", here.length === 0, here.join(", "));

person();
main.innerHTML = ""; CoachProposalView(rtr).mount(main);
click(main.querySelector("#cp-time"));
const sixty = main.querySelector('[data-pick-time="60"]');
ok("c-pc. Length can be set to 60", !!sixty);
click(sixty);
const status = txt(main.querySelector('#cp-plan-status'));
const about = Number((txt(main).match(/About (\d+) min/) || [])[1]);
ok("c. after picking 60 the line says what the plan comes to (it said 'Now 60 minutes.' over a 42)",
   about && (Math.abs(about - 60) <= 5 ? /60 minutes/.test(status) : new RegExp(`about ${about} minutes`).test(status)), `status "${status}", plan ${about}`);

const openers = readFileSync(new URL("../js/data/checkin-openings.js", import.meta.url), "utf8");
ok("d. 'Life kept getting in the way' is said back as itself, not as time and energy", found(/finding time and energy/).length === 0 && /b1: "Do you remember saying that life kept getting in the way\?"/.test(openers));
const moodLine = (openers.match(/id: 'mood-improving-flat'[\s\S]*?b1: "([^"]+)"/) || [])[1] || "";
ok("e. the mood opener does not claim 'each check-in' (it compares the first and the last)", moodLine && !/each check-in/.test(moodLine), moodLine);
ok("f. Mostly the same's answer does not promise strength", !/strength/i.test(generateIntentAck("maintain")), generateIntentAck("maintain"));
const rfIntro = found(/You.ve listed a sore/);
ok("g. the red-flag introduction does not say 'listed' (a sore area may be from today's check-in)", rfIntro.length === 0, rfIntro.join(", "));
const walked = found(/anyone who walked in/);
ok("h. no 'Not something I'd give to anyone who walked in' (said after the health answers were declined)", walked.length === 0, walked.join(", "));
const routine = GR.generalRoutine();
ok("i. the general routine is named for what it is (all seated)", !/full-body/i.test(routine.title) && routine.exercises.every(e => e.position === "seated" || e.position === "any"), routine.title);
const daily = found(/Complete daily/);
ok("j. no 'Complete daily for best results'", daily.length === 0, daily.join(", "));
const crossLegged = EXERCISES.filter(e => (e.instructions || []).some(l => /^Sit cross-legged/i.test(l)));
ok("k. no instruction leads with sitting cross-legged on the floor (the chair first)", crossLegged.length === 0, crossLegged.map(e => e.id).join());

person("free");
const at = d => new Date(Date.now() - d * 864e5).toISOString();
store.set("activityLog", [
  { id: "b1", type: "breathing-session", status: "completed", completedAt: at(1), durationMins: 5 },
  { id: "b2", type: "breathing-session", status: "completed", completedAt: at(2), durationMins: 5 },
  { id: "w1", type: "walk", status: "completed", completedAt: at(3), durationMins: 20 },
]);
main.innerHTML = ""; ProgressView(rtr).mount(main);
const b7 = [...main.querySelectorAll("button")].find(b => /7\s*days/.test(txt(b))); if (b7) click(b7);
ok("l. Progress does not call breathing 'moving' (3 sessions, one a walk)", !/moved 3 times/.test(txt(main)) && /3 sessions/.test(txt(main)), (txt(main).match(/You[^.]*\./) || [""])[0]);

person();
store.set("conditions", ["anxiety"]); store.set("conditionPainScores", {});
main.innerHTML = ""; SettingsView(rtr).mount(main);
const row = settingsFind(main, '[data-open="conditions"]');
ok("m. Settings › Sore or injured areas does not say 'None' alone when something else is listed", !!row && !/^None$/.test(txt(row.querySelector(".settings-row__value"))), txt(row));

person();
yoga.__resetForTest?.();
store.set("checkinHistory", { [new Date().toISOString().split("T")[0]]: { energy: 6, mood: 6, stretchTarget: "hips", date: new Date().toDateString() } });
main.innerHTML = yoga.render(); try { yoga.onMount(); } catch {}
const tgt = [...main.querySelectorAll("[data-target]")].find(b => b.getAttribute("aria-pressed") !== "true");
if (tgt) { click(tgt); main.innerHTML = yoga.render(); try { yoga.onMount(); } catch {} }
ok("n. after a tap, Yoga does not say the focus was picked from the check-in", !!tgt && !/Picked from your check-in/.test(txt(main)), txt(main).slice(0, 160));

const mw = EXERCISES.find(e => e.id === "mindful-walk");
ok("o. the Mindful Walk's words agree with its 15:00 card", mw && !(mw.duration === 900 && (mw.instructions || []).some(l => /10 minutes is enough/.test(l))), (mw?.instructions || []).join(" | ").slice(0, 160));

const written = EXERCISES.find(e => (e.instructions || []).some(l => /Complete 3 sets of 10 reps$/.test(l)) && ["squat", "hinge", "push", "pull", "lunge"].includes(e.movementPattern));
const low = written && withDefaultDose({ ...written, section: "main" }, "low");
ok("p. a gentle day's 2 x 10 is not shown over 'Complete 3 sets of 10'", !!low && low.sets === 2 && !(low.instructions || []).some(l => /3 sets of 10/.test(l)) && (low.instructions || []).some(l => /2 sets of 10/.test(l)), written?.id);
const normal = written && withDefaultDose({ ...written, section: "main" }, "moderate");
ok("p-pc. CONTROL: an ordinary day keeps 3 sets of 10 in both", !!normal && normal.sets === 3 && normal.instructions.some(l => /3 sets of 10/.test(l)));

console.log(`\nVERIFY-TRUE-WORDS-6: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
