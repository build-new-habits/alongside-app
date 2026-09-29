/**
 * tools/verify-checkin-openers.mjs
 * 29 Sep 2026 v1
 *
 * P8, INVENTED CHECK-IN LINES (persona finding W2-10). The check-in's
 * first words about the person must be true.
 *
 *   - When no pattern matched, the opener fell back to a weekday rotation
 *     through lines that each assert a fact: "Last time you did less than
 *     planned", "this particular morning" (at 6 pm), "you said you felt
 *     better than you expected". Three of those had no condition at all.
 *   - "You moved four times last week" / "three times last week": fixed
 *     numbers, chosen by counting CHECK-INS, not sessions.
 *   - A gap of four days went unmentioned.
 *
 * Every weekday, four times of day, three histories -- through the real
 * resolver -- and once through the real check-in screen (its live caller).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { resolveOpening } = await import(B + "data/checkin-openings.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};

// A fixed clock the resolver reads through `new Date()` / Date.now().
const RealDate = Date;
let FIXED = RealDate.now();
class FakeDate extends RealDate {
  constructor(...a) { if (a.length) super(...a); else super(FIXED); }
  static now() { return FIXED; }
}
const useClock = d => { FIXED = d.getTime(); globalThis.Date = FakeDate; };
const realClock = () => { globalThis.Date = RealDate; };
const dayKey = (base, ago) => { const d = new RealDate(base); d.setDate(d.getDate() - ago); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

function history(base, rows) {
  localStorage.clear(); store.init();
  const h = {};
  for (const r of rows) h[dayKey(base, r.ago)] = { energy: r.energy ?? 5, mood: r.mood ?? 5, ...(r.moodAfter != null ? { moodAfter: r.moodAfter } : {}) };
  store.set("checkinHistory", h);
  store.set("checkin.lastOpeningMode", "humanistic");
}
const realRandom = Math.random;
const reflect = () => { Math.random = () => 0; try { return resolveOpening(); } finally { Math.random = realRandom; } };
const said = o => `${o.b1} ${o.b2 || ""}`;

// Claims no history can make true any more.
const NO_BASIS = /less than planned|particular morning|nearly always come to this in the mornings|better than you expected/i;

// ── 1. NOTHING MATCHED: A NEUTRAL LINE, EVERY DAY, EVERY HOUR ──────────────
console.log("\nTEST 1 - when no pattern holds, nothing is invented");
{
  const bad = [], reflective = []; let n = 0;
  for (let wd = 0; wd < 7; wd++) for (const hr of [8, 13, 18, 22]) {
    const base = new RealDate(2026, 8, 20 + wd, hr, 0, 0);
    history(base, [{ ago: 12 }, { ago: 10 }, { ago: 9 }, { ago: 1 }]);
    useClock(base);
    const o = reflect(); n++;
    realClock();
    const s = said(o);
    if (o.mode === "reflection") reflective.push(`${hr}:00 "${o.b1}"`);
    if (NO_BASIS.test(s) || /times (in the )?last week/.test(s) || (hr >= 12 && /morning/i.test(s))) bad.push(`${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][base.getDay()]} ${hr}:00 "${o.b1}"`);
  }
  ok("1pc. the reflection mode was reached", n === 28);
  ok("1b. with no pattern in the history, no reflection is offered at all", reflective.length === 0, reflective.slice(0, 3).join("; "));
  ok("1a. no line claims what the history does not show", bad.length === 0, `${bad.length} of ${n}: ` + bad.slice(0, 4).join("; "));
}

// ── 2. A COUNT IS THE REAL COUNT ──────────────────────────────────────────
console.log("\nTEST 2 - a week of check-ins is counted, not hard-coded");
for (const [count, moods, label] of [[4, [7, 8, 6, 7], "good all week"], [5, [7, 3, 6, 2, 8], "up and down"]]) {
  const base = new RealDate(2026, 8, 29, 10, 0, 0);
  history(base, moods.map((m, i) => ({ ago: i + 1, mood: m, energy: 5 })));
  useClock(base); const o = reflect(); realClock();
  const s = said(o);
  const nums = { 3: /three|\b3\b/, 4: /four|\b4\b/, 5: /five|\b5\b/ };
  ok(`2${count === 4 ? "a" : "b"}. ${count} check-ins, ${label}: says ${count}, and says check-ins, not "moved"`,
     nums[count].test(s) && !Object.entries(nums).some(([k, r]) => +k !== count && r.test(s)) && !/you moved/i.test(s) && /check/i.test(s), s);
}

// ── 3. A GAP OF A FEW DAYS IS ACKNOWLEDGED ─────────────────────────────────
console.log("\nTEST 3 - four days away is acknowledged, without blame");
{
  const base = new RealDate(2026, 8, 29, 10, 0, 0);
  history(base, [{ ago: 9 }, { ago: 7 }, { ago: 4 }]);
  useClock(base);
  const outs = [0, 0.4, 0.9].map(r => { Math.random = () => r; try { return said(resolveOpening()); } finally { Math.random = realRandom; } });
  realClock();
  ok("3a. every opener after four days away says so", outs.every(s => /few days|\b4\b|four days/i.test(s)), outs.join(" | "));
  ok("3b. and none of it is blame or catching up", outs.every(s => !/miss|behind|catch up on|streak|should have/i.test(s)), outs.join(" | "));
}

// ── 4. THE LIVE CALLER ────────────────────────────────────────────────────
console.log("\nTEST 4 - the check-in screen says the opener");
{
  const base = new RealDate();
  history(base, [{ ago: 4 }, { ago: 6 }, { ago: 8 }]);
  const expect = (() => { Math.random = () => 0; try { const o = resolveOpening(); store.set("checkin.lastOpeningMode", "humanistic"); return o; } finally { Math.random = realRandom; } })();
  const { CheckinView } = await import(B + "views/checkin.js");
  const main = document.getElementById("main-content");
  Math.random = () => 0;
  CheckinView({ navigate() {}, back() {} }).mount(main);
  await new Promise(r => setTimeout(r, 2500));
  Math.random = realRandom;
  const text = (document.body.textContent || "").replace(/\s+/g, " ");
  ok("4a. the opener the resolver gives is on the screen", !!expect.b1 && text.includes(expect.b1.slice(0, 30)), `${expect.b1} || ${text.slice(0, 160)}`);
}

console.log("");
if (fails) { console.log(`CHECKIN-OPENERS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`CHECKIN-OPENERS: all ${passes} assertions pass\n`);
process.exit(0);
