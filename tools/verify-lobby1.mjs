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

check("2. rows render from the tag, not a hardcoded list", () => {
  // SUPERSEDED IN PART BY LOBBY-1c. This asserted that the TILE grid
  // filtered by kind. There is no tile grid on Home any more -- session
  // tiles moved behind the check-in, which is a stronger version of the
  // same rule and is asserted by 10a. What remains is the reference
  // half, which still has to read the tag rather than name doors.
  // The filter gained a tier clause for the Wellbeing de-duplication,
  // so match the kind test rather than the whole expression.
  ok(/HOME_DOORS\.filter\(d => d\.kind === 'reference'/.test(today),
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

console.log("\nTEST 6 - LOBBY-1b: no scoreboard on the first screen");

check("6a. Home shows no session count and no weekly target", () => {
  // Both were live on device: "3 of 5 this week" as a counter, and "You
  // said you would aim for 3 a week" on My Programme. A count against a
  // target is a thing somebody can be behind on by Wednesday, which is
  // the mechanic the prohibited-patterns list bans.
  ok(!today.includes("today-week-count__number"),
     "the week counter is back on Home. A bare count is still a score, and the lobby is " +
     "where somebody arrives, not where they are marked.");
  const mp = strip(fs.readFileSync("js/views/my-programme.js", "utf8"));
  ok(!/aim for \$\{[^}]*weeklySessionTarget/.test(mp),
     "My Programme displays a weekly session target again");
});

console.log("\nTEST 7 - the arc is the first thing, and needs no check-in");

check("7a. the arc panel is on Home", () => {
  // "arcPanel()" matches the function's own DEFINITION, so the naive
  // check passed with the call removed. Look for the call inside the
  // template instead.
  ok(/\$\{arcPanel\(\)\}/.test(today), "Home does not render the arc");
  ok(/function arcPanel/.test(today), "no arc panel");
});

check("7b. it is reachable without checking in", () => {
  const at = today.indexOf("function arcPanel");
  const body = today.slice(at, today.indexOf("_programmeHint", at));
  // The panel has TWO branches (offer and active). Asserting that
  // "false" appears anywhere passed while one of them said "true", so
  // assert the absence of "true" instead.
  ok(!/data-requires-checkin="true"/.test(body),
     "a branch of the arc panel requires a check-in. It is the thing somebody opens the " +
     "app to see, and browsing must not pay the check-in cost.");
  ok(/data-requires-checkin="false"/.test(body), "the arc panel sets no check-in flag");
  ok(!/data-route="mobility-conditioning"/.test(body),
     "the arc still routes through the Mobility door, which is where it was buried");
});

check("7c. it surfaces what has NOT come up, never what has", () => {
  const at = today.indexOf("function arcPanel");
  const body = today.slice(at, today.indexOf("_programmeHint", at));
  for (const bad of ["you have done", "you've done", "sessions", "times", "streak", "% "]) {
    ok(!body.toLowerCase().includes(bad),
       `the arc panel says "${bad}" — that is a score, not a fact about the plan`);
  }
  ok(/come up yet/.test(body), "the panel never names what the plan has not reached");
});

check("7d. day one reads as a starting line, not an empty state", () => {
  const at = today.indexOf("function arcPanel");
  const body = today.slice(at, today.indexOf("_programmeHint", at));
  ok(/still ahead of you/.test(body),
     "an arc with nothing covered yet has no wording of its own, so it will read as empty. " +
     "Day one is premium's richest moment: everything is still ahead.");
});

check("7e. the offer sits above the reference rows", () => {
  const arcAt = today.indexOf("arcPanel()");
  const refAt = today.indexOf("today-reference");
  ok(arcAt > -1 && refAt > -1, "a marker is missing");
  ok(arcAt < refAt,
     "the arc offer renders below the reference rows. Below Settings is where terms and " +
     "privacy links live, so the eye files it as boilerplate and skips it.");
});

console.log("\nTEST 8 - unlit is not failed");

check("8. an untouched strand does not read as disabled", () => {
  const css = fs.readFileSync("css/layouts/today.css", "utf8");
  const at = css.indexOf(".today-arc__strand {");
  ok(at > -1, "no strand styling");
  const rule = css.slice(at, css.indexOf("}", at));
  ok(!/opacity:\s*0?\.[0-5]/.test(rule),
     "unlit strands are faded toward disabled. A strand nothing has touched yet is a " +
     "starting line, not a failure.");
  ok(!/text-decoration:\s*line-through/.test(rule), "unlit strands are struck through");
});

console.log("\nTEST 9 - My Programme shows the arc when there is one");

check("9. the aim replaces the goal list", () => {
  const mp = strip(fs.readFileSync("js/views/my-programme.js", "utf8"));
  ok(mp.includes("aimById"), "My Programme cannot read the arc");
  // Anchor on the DEFINITION, not the first mention. The bare name
  // matched the call site 40 lines earlier and measured the wrong
  // region of the file -- the seventh time this session an assertion
  // has done that. Anchor on the most specific string available.
  const at = mp.indexOf("function _whatYoureAimingAt");
  ok(at > -1, "no _whatYoureAimingAt definition");
  const body = mp.slice(at, at + 2600);
  // Anchor on the CONDITION, not the field name: disabling the branch
  // left arc.aimId visible inside it and the check still passed.
  const aimAt  = body.indexOf("if (arc.aimId)");
  const goalAt = body.indexOf("goals.map");
  ok(aimAt > -1 && goalAt > -1, "a branch is missing");
  ok(aimAt < goalAt,
     "the old goal list is checked before the arc, so somebody with an arc still sees nine " +
     "goals. On device this listed feel-better, lose weight, tone up, recover from injury " +
     "and five more — a wishlist, not an aim.");
});

console.log("\nTEST 10 - LOBBY-1c: the lobby holds no sessions");

check("10a. session tiles have left PLAN's Home", () => {
  // NARROWED, 05 Sep 2026. LOBBY-1c asserted no session tiles on Home
  // at all. TIER-HOME reverses that for FREE, deliberately: a free user
  // has no coach holding the thread, so the territory must be legible
  // to them and the picks ARE the product. On Plan the coach holds it,
  // and the tiles stay behind the check-in where LOBBY-1c put them.
  //
  // The original property is unchanged where it applies -- Plan's Home
  // is still an arc and an invitation, nothing else.
  const at = today.indexOf("${isPremium() ? arcPanel()");
  ok(at > -1, "Home no longer branches on tier");
  const planBlock = today.slice(at, today.indexOf("freeChooser()", at));
  ok(!/today-doors/.test(planBlock),
     "Plan's Home renders session tiles again. The suggestion is what leads there; the " +
     "tiles live behind the check-in.");
});

check("10b. one invitation, and it names the price of entry", () => {
  ok(/data-action="start-today"/.test(today), "there is no way into the session space");
  // The aria-label carries the same words, so a bare text match passed
  // with the visible note deleted. Anchor on the element.
  ok(/class="today-invite__note"/.test(today),
     "the check-in is not named beneath the invitation, so it is sprung rather than " +
     "consented to");
  // A SECOND ROUTE IN is what had to go. Updating a check-in already
  // made is a different act and is kept -- CHAP-2 caught its removal as
  // a real regression: checked in this morning, felt worse by evening.
  ok(!/data-action="checkin"/.test(today),
     'a second unexplained "Check in" route remains alongside the invitation, which is ' +
     'two doors to one place with one of them unlabelled');
  ok(/data-action="checkin-mini"/.test(today),
     "there is no way to update a check-in without starting a session \u2014 the case of " +
     "somebody who checked in this morning and feels worse by evening");
});

check("10c. the invitation routes through the check-in only when one is owed", () => {
  const at = today.indexOf('[data-action="start-today"]');
  ok(at > -1, "no invitation handler");
  // Slice to the END OF THIS HANDLER, not a fixed window. 600
  // characters ran past it into the next listener, which also calls
  // _checkedInToday() -- so removing the branch here still passed.
  // Eleventh time this session a window has measured the wrong region.
  const close = today.indexOf("});", at);
  const body  = today.slice(at, close > -1 ? close : at + 600);
  ok(/if \(_checkedInToday\(\)\)/.test(body),
     "the invitation does not branch on whether a check-in is owed, so it either always " +
     "asks or never does");
  ok(/coach-proposal/.test(body), "the invitation does not lead to the suggestion");
  ok(/pendingDoorRoute/.test(body),
     "the check-in does not know where to return to, so it strands the person");
});

console.log("\nTEST 11 - the session space keeps the escape");

check("11. sessions are reachable, below the suggestion", () => {
  const cp = strip(fs.readFileSync("js/views/coach-proposal.js", "utf8"));
  // Count them: one button removed still leaves three, and the naive
  // presence check passed.
  const escapes = (cp.match(/data-else="/g) || []).length;
  ok(escapes >= 4,
     `${escapes} ways to pick your own. The session tiles left Home and must land here — ` +
     `removing choice is not the same as hiding it.`);
  const label = cp.indexOf("cp-else-label");
  const start = cp.indexOf("cp-preview-start");
  ok(label > -1, "no escape label");
  ok(start === -1 || label > cp.indexOf("cp-acknowledgement"),
     "the escape renders above the coach's suggestion, which makes it a menu again");
});

console.log("\nTEST 11 - TIER-HOME: free and Plan are different screens");

check("11a. Home branches on tier at all", () => {
  // Decided 3 Sep and unbuilt until 5 Sep: both tiers rendered an
  // identical Home, which is the one thing the design said it must
  // never be. Free is not Plan with a panel swapped.
  ok(/isPremium\(\) \? arcPanel\(\)/.test(today),
     "the arc panel renders on both tiers, so free is Plan with a panel swapped");
  ok(/isPremium\(\) \? `[\s\S]{0,400}?today-invite[\s\S]{0,400}?` : freeChooser\(\)/.test(today),
     "both tiers get the same call to action");
});

check("11b. free is given a question and the controls", () => {
  ok(/function freeChooser/.test(today), "there is no free chooser");
  const at = today.indexOf("function freeChooser");
  const body = today.slice(at, today.indexOf("function arcPanel", at));
  ok(/What do you want to do today\?/.test(body),
     "free is never asked what it wants — which is the whole free product");
  // BOTH groups, counted. Matching the class once passed with a group
  // deleted, because the other one still matched.
  const groups = (body.match(/today-group-label/g) || []).length;
  ok(groups >= 2,
     `${groups} group heading(s). The picks need both \u2014 structure IS the free product: ` +
     `nobody holds the thread for a free user, so the territory has to be legible to them.`);
});

check("11c. free gets the coach-picks fallback, named as an offer", () => {
  const at = today.indexOf("function freeChooser");
  const body = today.slice(at, today.indexOf("function arcPanel", at));
  ok(/today-unsure/.test(body), "free has no coach-picks fallback");
  ok(!/Unsure\?\s*Coach decides/.test(body),
     "the fallback is still named as a confession of indecision rather than an offer");
  // Anchor on the NOTE the person reads, not anywhere in the block: the
  // button's aria-label carries the same words, so a rewritten note
  // still passed.
  const note = (body.match(/today-invite__note">([^<]*)</) || [])[1] || "";
  ok(/go on how you're doing today/.test(note),
     "the fallback overstates what the coach knows. With no arc it genuinely is going on " +
     "today only, and saying otherwise is the lie the onboarding goals were.");
});

check("11d. the offer is above the reference rows on free", () => {
  const at   = today.indexOf("function freeChooser");
  const body = today.slice(at, today.indexOf("function arcPanel", at));
  ok(/arcPanel\(\)/.test(body),
     "free never sees the arc offer, so the product is never mentioned to the people who " +
     "might buy it");
  const chooserAt = today.indexOf("freeChooser()");
  const refAt     = today.indexOf("today-reference");
  ok(chooserAt > -1 && refAt > -1 && chooserAt < refAt,
     "the chooser renders below the reference rows");
});

check("11e. Wellbeing is not duplicated on free", () => {
  ok(/!isPremium\(\) && d\.id === 'wellbeing'/.test(today),
     "Wellbeing appears both as a free pick and as a reference row — the duplication this " +
     "screen exists to remove");
});

console.log(fails === 0
  ? "\nLOBBY-1a: all assertions pass\n"
  : "\nLOBBY-1a: " + fails + " FAILED\n");
process.exit(fails === 0 ? 0 : 1);
