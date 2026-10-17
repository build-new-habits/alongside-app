/**
 * tools/verify-w6-rest.mjs
 * 17 Oct 2026 v1
 *
 * The last of Stage W6 (Graeme, 17 Oct). One assertion each.
 *
 * W6-14 RED-FLAG-REPEAT. Who is asked and when was settled on 28 Sep (all
 *   three questions for anyone who reports pain; again for a new area,
 *   after 30 days, or when the wording changes). What was left: the
 *   questions came back as the same screen with no reason. Now one line
 *   says why; the first time, none.
 * W6-15 SCOPE-WORDS. Healing-style lines gone from every string the app
 *   holds (verify-scope-minor v5 covers the list and every screen). And
 *   one Bad-day line: the run screen said "I can see Knee is really
 *   difficult today" where every other door says "Your knee is bad today".
 * W6-16 U18-POLICY-2 (Graeme: "make everything match"; the birth month,
 *   "a"):
 *   - the birth month does not count: 18 from the month after it;
 *   - the under-18 screen says so;
 *   - "already answered the research question" goes with everything else
 *     at under 18;
 *   - the privacy summary for under 18 names the site the app is on, and
 *     the home-screen step, as the under-18 screen does;
 *   - a messages download that finishes after an under-18 answer keeps
 *     nothing;
 *   - after the age answer, one Back (the question is replaced, not
 *     stacked);
 *   - the privacy summary's heading takes focus;
 *   - links that open a new tab say so.
 */
import { createRequire as __cr } from "node:module";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { agreed } from "./agreed.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div></body>', { url: "https://app.example.org/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
dom.window.scrollTo = () => {}; dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history; globalThis.location = dom.window.location;

const ROOT = new URL("../", import.meta.url);
const B = new URL("js/", ROOT).href;
const { store } = await import(B + "store.js");
const RF = await import(B + "data/red-flag.js");
const { RedFlagView } = await import(B + "views/red-flag.js");
const AC = await import(B + "data/age-check.js");
const M = await import(B + "data/messages.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const rtr = { navigate() {}, back() {}, history: [] };

// ── W6-14 ───────────────────────────────────────────────────────────────
console.log("\nW6-14 - the questions say why they are back");
function screen(record, conditions = ["knee"]) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("conditions", conditions);
  if (record) store.set("redFlag", record);
  main.innerHTML = ""; RedFlagView(rtr).mount(main);
  return txt(main.querySelector(".rf-why"));
}
const recent = new Date(Date.now() - 2 * 864e5).toISOString();
const old = new Date(Date.now() - 40 * 864e5).toISOString();
const base = { level: null, flaggedAt: null, clearedAt: null };
ok("14a. the first time: no reason line", screen(null) === "");
ok("14pc. the screen is there", /Before you start/.test(txt(main)));
const area = screen({ ...base, screenedAt: recent, areas: ["knee"], textVersion: RF.RED_FLAG_VERSION }, ["knee", "hip"]);
ok("14b. a new area: names it", /hip/i.test(area) && /added/i.test(area), area);
const month = screen({ ...base, screenedAt: old, areas: ["knee"], textVersion: RF.RED_FLAG_VERSION });
ok("14c. after 30 days: says it has been a month", /month/i.test(month), month);
const words = screen({ ...base, screenedAt: recent, areas: ["knee"], textVersion: "2026-01-01.1" });
ok("14d. the wording changed: says so", /changed|reworded/i.test(words), words);
ok("14e. the reason is never a count of anything", ![area, month, words].some(t => /\d+ days?/.test(t)), [area, month, words].join(" | "));

// ── W6-15 ───────────────────────────────────────────────────────────────
console.log("\nW6-15 - no healing-style line in any string the app holds");
const files = [];
const walk = d => { for (const f of readdirSync(d)) { const p = d + "/" + f; if (statSync(p).isDirectory()) walk(p); else if (p.endsWith(".js")) files.push(p); } };
walk(new URL("js", ROOT).pathname);
// The code with its comments taken out: every string, template or not.
const strings = f => readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/\s+\/\/ .*$/gm, "");
const PHRASES = /repairs itself|movement as medicine|not a warning|nothing went wrong|plantar fasciitis|really difficult today/i;
const hits = files.filter(f => PHRASES.test(strings(f))).map(f => `${f.split("/js/")[1]}: ${strings(f).match(PHRASES)[0]}`);
ok("15a. none in the app's strings", hits.length === 0, hits.join("; "));

// ── W6-16 ───────────────────────────────────────────────────────────────
console.log("\nW6-16 - under 18");
const now = new Date(2026, 9, 17);   // 17 Oct 2026
ok("16a. born October 2008: still 17 for part of this month, so not yet", AC.isAdult(10, 2008, now) === false);
ok("16b. born September 2008: 18", AC.isAdult(9, 2008, now) === true);
ok("16c. born November 2008: not yet", AC.isAdult(11, 2008, now) === false);
const { Under18View } = await import(B + "views/under-18.js");
localStorage.clear(); store.init(); store.set("consent.ageConfirmed", false);
main.innerHTML = ""; Under18View(rtr).mount(main);
ok("16d. the under-18 screen: from the month after you turn 18", /month after/i.test(txt(main)), txt(main).slice(0, 400));
const nt = [...main.querySelectorAll('a[target="_blank"]')];
ok("16e. links that open a new tab say so", nt.length > 0 && nt.every(a => /new tab/i.test(a.getAttribute("aria-label") || txt(a))), nt.map(a => a.getAttribute("aria-label") || txt(a)).join(" | "));
localStorage.setItem("bnh-research-answered", JSON.stringify(["figures"]));
store.set("name", "Kid"); AC.deleteForUnder18();
ok("16f. under 18: \"already answered the research question\" goes too", localStorage.getItem("bnh-research-answered") === null);
const P = await import(B + "views/privacy.js");
main.innerHTML = P.render(); P.onMount?.();
const ptext = txt(main);
ok("16g. the under-18 privacy summary names the site the app is on", ptext.includes(location.host) && !/app\.buildnewhabits\.co\.uk/.test(ptext), ptext.slice(-260));
ok("16h. and the home-screen step", /home screen/i.test(ptext));
ok("16i. its heading takes focus", document.activeElement === main.querySelector("h1"), document.activeElement?.tagName);
localStorage.clear(); store.init(); agreed(store); store.set("onboardingComplete", true); store.set("tier", "personal");
main.innerHTML = P.render(); P.onMount?.();
ok("16j. the adult summary's heading takes focus too", document.activeElement === main.querySelector("h1"), document.activeElement?.tagName);
const ntP = [...main.querySelectorAll('a[target="_blank"]')];
ok("16k. its new-tab links say so in their names", ntP.length > 0 && ntP.every(a => /new tab/i.test(a.getAttribute("aria-label") || txt(a))), ntP.map(a => a.getAttribute("aria-label") || txt(a)).join(" | "));
// The late download.
localStorage.clear(); store.init(); store.set("consent.ageConfirmed", true);
let release;
const MSG = { id: "news-2026-10", kind: "news", title: "Hello", body: "Hi", publishedAt: "2026-10-01" };
ok("16lpc. CONTROL: that message is one the app keeps", !!M.checkMessage(MSG));
const slow = () => new Promise(r => { release = () => r({ ok: true, json: async () => ({ messages: [MSG] }) }); });
const pending = M.refreshMessages(slow);
await wait(5);
AC.recordAge(false);
release(); await pending;
ok("16l. a messages download that lands after an under-18 answer keeps nothing", !(store.get("messages.list") || []).length, JSON.stringify(store.get("messages.list")));
// One Back after the answer.
const src = readFileSync(new URL("js/views/age-check.js", ROOT), "utf8");
ok("16m. after the age answer the question is replaced, not stacked (one Back)",
   /navigate\(takePendingRoute\(\) \|\| "today", \{ replace: true \}\)/.test(src) && /navigate\("under-18", \{ replace: true \}\)/.test(src));

console.log(`\nVERIFY-W6-REST: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
