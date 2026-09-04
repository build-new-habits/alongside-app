/**
 * tools/verify-lobby1.mjs
 * 03 Sep 2026 v1
 *
 * LOBBY-1a. The lobby rule, made enforceable.
 *
 * Home reached seven tiles of equal visual weight one reasonable
 * addition at a time, because nothing in the code said what Home was
 * FOR. Graeme, 3 Sep: "I find the whole app overwhelming for choice and
 * navigation."
 *
 * THE RULE. Anything that opens something you DO is a tile. Anything you
 * read, check or change is a row. A door that cannot say which it is
 * does not belong on Home.
 *
 * Assertion 1 is the one that matters and the reason this gate exists at
 * all: EVERY door must declare its kind. Without that, the next addition
 * defaults to whatever the renderer does with an untagged entry, and
 * Home starts drifting back the same afternoon.
 *
 * Assertion 4 is the counterweight to the whole idea. Demoting something
 * visually must never demote it for thumbs, and must never make it look
 * disabled -- these are ordinary destinations somebody may well want,
 * not withheld ones. This audience has spent enough time being told it
 * does not qualify.
 */
import fs from "node:fs";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const strip = t => t
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/<!--[\s\S]*?-->/g, "");

const today = strip(fs.readFileSync("js/views/today.js", "utf8"));
const css   = fs.readFileSync("css/layouts/today.css", "utf8");

const doors = [...today.matchAll(/\{\s*kind:\s*'(session|reference)',\s*id:\s*'([a-z-]+)'[\s\S]{0,200}?requiresCheckin:\s*(true|false)/g)]
  .map(m => ({ kind: m[1], id: m[2], checkin: m[3] === "true" }));
const rawDoors = [...today.matchAll(/\{\s*(?:kind:[^,]+,\s*)?id:\s*'([a-z-]+)',\s*label:/g)].map(m => m[1]);

console.log("\nTEST 1 - every door declares what it is");

check("1a. all doors are tagged", () => {
  ok(rawDoors.length > 0, "no doors found at all");
  ok(doors.length === rawDoors.length,
     `${rawDoors.length} doors, ${doors.length} tagged. An untagged door falls through to ` +
     `whatever the renderer does by default, and Home drifts back to seven equal tiles ` +
     `the same afternoon somebody adds one.`);
});

check("1b. both kinds are actually in use", () => {
  ok(doors.some(d => d.kind === "session"), "no session tiles");
  ok(doors.some(d => d.kind === "reference"), "no reference rows -- the split is inert");
});

console.log("\nTEST 2 - the split is honoured when rendering");

check("2. tiles and rows render from the tag, not a hardcoded list", () => {
  ok(/HOME_DOORS\.filter\(d => d\.kind !== 'reference'\)/.test(today),
     "the tile grid does not filter by kind, so reference doors still render as tiles");
  ok(/HOME_DOORS\.filter\(d => d\.kind === 'reference'\)/.test(today),
     "the reference rows do not filter by kind");
  ok(!/today-ref-row[\s\S]{0,400}?'library'/.test(today),
     "the rows name specific doors instead of reading the tag");
});

console.log("\nTEST 3 - demotion does not break routing or the check-in gate");

check("3. rows carry route and check-in data exactly as tiles do", () => {
  const at = today.indexOf("today-ref-row");
  ok(at > -1, "no reference rows");
  const row = today.slice(at, at + 600);
  ok(row.includes("data-route="), "rows lost their route, so they navigate nowhere");
  ok(row.includes("data-requires-checkin="),
     "rows lost the check-in flag. attachEvents binds on [data-route] and reads that " +
     "attribute -- a row without it silently bypasses the gate.");
});

console.log("\nTEST 4 - quiet, not disabled, and not smaller for thumbs");

check("4a. rows keep a full-size tap target", () => {
  const at = css.indexOf(".today-ref-row {");
  ok(at > -1, "no row styling");
  const rule = css.slice(at, css.indexOf("}", at));
  const m = rule.match(/min-height:\s*(\d+)px/);
  ok(m && Number(m[1]) >= 44,
     "rows are below the 44px target size. Demoting something visually must never " +
     "demote it for thumbs.");
});

check("4b. rows do not read as disabled", () => {
  const at = css.indexOf(".today-ref-row__label");
  ok(at > -1, "no row label styling");
  const rule = css.slice(at, css.indexOf("}", at));
  ok(!/opacity:\s*0?\.[0-6]/.test(rule),
     "the row label is faded toward disabled. These are ordinary destinations somebody " +
     "may well want, and this audience has spent enough time being told it does not qualify.");
});

console.log("\nTEST 5 - the drop-in is still a session, not a footnote");

check("5. the coach's suggestion is a tile", () => {
  const unsure = doors.find(d => d.id === "unsure");
  ok(unsure, "the coach-decides door is gone");
  ok(unsure.kind === "session",
     "the drop-in was demoted to a reference row. It is the thing somebody does when they " +
     "turn up without a plan, and it is due promotion, not demotion.");
  ok(unsure.checkin === true,
     "the drop-in no longer requires a check-in, so the coach would suggest from no data");
});

console.log(fails === 0
  ? "\nLOBBY-1a: all assertions pass\n"
  : "\nLOBBY-1a: " + fails + " FAILED\n");
process.exit(fails === 0 ? 0 : 1);
