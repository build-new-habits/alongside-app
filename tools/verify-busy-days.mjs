/**
 * tools/verify-busy-days.mjs
 * 17 Oct 2026 v1
 *
 * W6-17 CONSECUTIVE-DAYS (Graeme, 04 Oct: "I guess option 1"; built 17 Oct).
 * The product rule is no consecutive-day counting of any kind.
 * consecutiveActiveDays() counted days in a row (never shown) and lightened
 * the plan at three. Option 1: count SESSIONS in the last three days
 * instead. The same lighter plan after a busy few days; nothing counts a
 * run of days.
 *
 *   1. Nothing in the app counts days in a row (the function is gone).
 *   2. Three sessions in the three days before today: lighter (as before).
 *   3. Three sessions on two of those days, a day off between: lighter
 *      (days in a row would have said no: this is the change).
 *   4. Two sessions: not lighter. Today's sessions, and older ones, are
 *      not counted. A breathing practice, or a session stopped under ten
 *      minutes, is not movement (W3-10, unchanged).
 *   5. Their own word still wins: Full of it this morning, or Keep my
 *      usual plan today (W3-10, unchanged).
 *   6. The coach's sentence for it says moving a lot lately, never a count
 *      of days.
 */
import { createRequire as __cr } from "node:module";
import { readFileSync, readdirSync, statSync } from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM("<!doctype html><body></body>", { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const ROOT = new URL("../", import.meta.url);
const B = new URL("js/", ROOT).href;
const { store } = await import(B + "store.js");
const CK = await import(B + "data/checkin.js");
const SB = await import(B + "session-builder.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
// Noon on a day n days ago, local: never near a day's edge.
const at = (n, type = "workout", extra = {}) => {
  const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n);
  return { id: `e${n}-${Math.random()}`, type, sessionType: "upper", completedAt: d.toISOString(), durationMins: 30, ...extra };
};
function fresh(entries) { localStorage.clear(); store.init(); store.set("activityLog", entries); }

console.log("\nTEST 1 - nothing counts days in a row");
const files = [];
const walk = d => { for (const f of readdirSync(d)) { const p = d + "/" + f; if (statSync(p).isDirectory()) walk(p); else if (p.endsWith(".js")) files.push(p); } };
walk(new URL("js", ROOT).pathname);
const code = f => readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
const hits = files.filter(f => /consecutiveActiveDays|consecutive\w*Days/.test(code(f))).map(f => f.split("/js/")[1]);
ok("1a. no consecutiveActiveDays (or any consecutive-days count) in the app's code", hits.length === 0, hits.join(", "));
ok("1b. and not on the check-in facade", !("consecutiveActiveDays" in CK.checkinData));

console.log("\nTEST 2-4 - sessions in the last three days");
fresh([at(1), at(2), at(3)]);
ok("2a. three sessions, one on each of the three days before today: lighter", CK.coachBias() === "lighter");
fresh([at(1), at(1), at(3)]);
ok("3a. three sessions on two of those days, a day off between: lighter (days in a row would not)", CK.coachBias() === "lighter");
fresh([at(1), at(3)]);
ok("4a. two sessions: not lighter", CK.coachBias() === null);
fresh([at(0), at(0), at(1), at(2)]);
ok("4b. today's sessions are not counted", CK.coachBias() === null);
fresh([at(1), at(2), at(4), at(5)]);
ok("4c. sessions four days ago or more are not counted", CK.coachBias() === null);
fresh([at(1), at(2), at(3, "breathing")]);
ok("4d. a breathing practice is not movement", CK.coachBias() === null);
fresh([at(1), at(2), at(3, "workout", { status: "partial", durationMins: 5 })]);
ok("4e. a session stopped under ten minutes is not counted", CK.coachBias() === null);
ok("4f. the count is there to read: three", (fresh([at(1), at(1), at(3)]), CK.sessionsInLastThreeDays?.()) === 3, String(CK.sessionsInLastThreeDays?.()));

console.log("\nTEST 5 - their own word wins");
fresh([at(1), at(2), at(3)]);
const key = new Date().toISOString().split("T")[0];
store.set("checkinHistory", { [key]: { energy: 9, mood: 6, date: new Date().toDateString() } });
ok("5a. Full of it this morning: not lighter", CK.coachBias() === null);
fresh([at(1), at(2), at(3)]);
const n = new Date();
store.set("lighterDayDeclinedOn", `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`);
ok("5b. Keep my usual plan today: not lighter", CK.coachBias() === null);

console.log("\nTEST 6 - what the coach says");
fresh([at(1), at(1), at(3)]);
const r = SB.gentleReason();
const line = SB.GENTLE_LINES?.[r?.id]?.(r) || "";
ok("6a. a busy few days is the reason given", r?.id === "busy", JSON.stringify(r));
ok("6b. said as moving a lot lately, never a count of days", /moving a lot lately/i.test(line) && !/\b(days? (running|in a row)|\d+ days)\b/i.test(line), line);

console.log(`\nVERIFY-BUSY-DAYS: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
