/**
 * tools/verify-lobby1.mjs
 * 24 Nov 2026 v6
 *
 * v6 - P-46 S4 FREE HOME. Free Home is free-home.js (coach-led, Plan look).
 *   The door-list, arc-panel and chooser checks are re-pointed to the same
 *   properties of the new Home (one invitation with its price, the Today card
 *   first, no tiles, no arc, Wellbeing once); 2 and 7c retire with HOME_DOORS
 *   and the arc panel.
 *
 * 12 Oct 2026 v5
 *
 * v5 - A-1 PLAN-HOME-PRUNE (Graeme approved the mock-up, 12 Oct). REACH
 *   only: Plan's arc is no longer a card of its own above the doors
 *   (isPremium() ? _arcChip()); it is inside Plan Home's Today card, drawn
 *   by _planDoors() through _arcLine() / _coachCard(). 7a, 10a and 11a read
 *   that: Plan renders the arc, free renders its offer, and the two are
 *   still different screens on one tier ternary. Same properties.
 *
 *
 * v4 - W3-13. Free's side of the Home ternary now begins with the card
 *   for a session the phone closed (_freeCarryCard()); 11d finds the
 *   ternary by its Plan side. The assertion is unchanged.
 *
 * v3 - SMOOTH-P3a. Plan's arc is the one-line _arcChip() and Plan's
 *   choices are _planDoors(), in the same tier ternaries arcPanel() and
 *   clubRooms() sat in. Anchors 7a, 10a, 11a and 11d moved to the new
 *   names; each property -- Plan leads with its arc, free is offered it
 *   beneath its chooser, the tiers are different screens, the choice sits
 *   above the reference rows -- is asserted unchanged.
 *
 * v2 - SMOOTH-P2a. Test 11's escape moved. "Or pick your own" (four
 *   doors beside the suggestion) became "Something different today" on
 *   the plan: every other session kind, somewhere else, and a class, one
 *   tap from the plan (spec 4.3). The rule it protects is unchanged --
 *   choice is not removed, and it sits BELOW the coach's plan, never in
 *   front of it -- so it is asserted on the new markup: the kinds are
 *   built from SESSION_TYPES (every kind but today's, so more than four),
 *   a class is offered, and the sheet renders after the plan list.
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

// GATE-PATH, 08 Sep 2026. Paths resolved from import.meta.url, not the
// working directory.
//
// 72 of 139 gates read files by a path relative to process.cwd(), so
// they were green from the repo root and read NOTHING from anywhere
// else. Not a live fault -- every session so far has run them from the
// root -- but an expensive trap: a session running the suite by full
// path from elsewhere sees most of it red and reasonably concludes the
// app is broken.
const _GATE_ROOT = new URL("../", import.meta.url);
const _gatePath = (p) => new URL(String(p).replace(/^\.\//, ""), _GATE_ROOT);


let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const strip = t => t
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/<!--[\s\S]*?-->/g, "");

const today = strip(fs.readFileSync(_gatePath("js/views/today.js"), "utf8"));
const css   = fs.readFileSync(_gatePath("css/layouts/today.css"), "utf8");

const doors = [...today.matchAll(/\{\s*kind:\s*'(session|reference)',\s*id:\s*'([a-z-]+)'[\s\S]{0,200}?requiresCheckin:\s*(true|false)/g)]
  .map(m => ({ kind: m[1], id: m[2], checkin: m[3] === "true" }));
const rawDoors = [...today.matchAll(/\{\s*(?:kind:[^,]+,\s*)?id:\s*'([a-z-]+)',\s*label:/g)].map(m => m[1]);

console.log("\nTEST 1 - every door declares what it is");

check("1a. P-46 S4: Free Home's ways in are built in one place (free-home.js door())", () => {
  const fh = strip(fs.readFileSync(_gatePath("js/views/free-home.js"), "utf8"));
  ok((fh.match(/door\('data-(route|action)=/g) || []).length >= 4, "Free Home's ways in are not built by door()");
});
check("1b. both kinds: sessions you DO (actions) and things you check (Log what I did)", () => {
  const fh = strip(fs.readFileSync(_gatePath("js/views/free-home.js"), "utf8"));
  ok(/data-action="free-ready"/.test(fh) && /data-route="activity-log"/.test(fh), "a kind is missing");
});
console.log("\nTEST 2 - the split is honoured when rendering");

check("2. retired with HOME_DOORS (P-46 S4): nothing left to tag; the old list is in BNH-Files Archive/P-46", () => {
  ok(!/const HOME_DOORS/.test(today), "HOME_DOORS is back in today.js with nothing reading it");
});
console.log("\nTEST 3 - demotion does not break routing or the check-in gate");

check("3. Free Home's route rows carry their check-in data (data-requires-checkin)", () => {
  const fh = strip(fs.readFileSync(_gatePath("js/views/free-home.js"), "utf8"));
  const rows = fh.match(/data-route="[a-z-]+"[^']*/g) || [];
  ok(rows.length >= 3 && rows.every(r => /data-requires-checkin="(true|false)"/.test(r)), rows.join(" | "));
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

check("5. the coach's session is the first thing: the Today card's full-width button", () => {
  const fh = strip(fs.readFileSync(_gatePath("js/views/free-home.js"), "utf8"));
  ok(/path-today__go" data-action="start-today"/.test(fh), "the Today card has no start-today button");
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
  const mp = strip(fs.readFileSync(_gatePath("js/views/my-programme.js"), "utf8"));
  ok(!/aim for \$\{[^}]*weeklySessionTarget/.test(mp),
     "My Programme displays a weekly session target again");
});

console.log("\nTEST 7 - the arc is the first thing, and needs no check-in");

check("7a. P-46 S4: the arc is the Plan's; Free Home draws none (verify-arc-door)", () => {
  ok(!/today-arc|arcPanel\(/.test(today) && !/today-arc|path-arcline/.test(strip(fs.readFileSync(_gatePath("js/views/free-home.js"), "utf8"))), "an arc on Free Home");
});
check("7b. what needs no check-in opens without one: Log what I did, the Plan line", () => {
  const fh = strip(fs.readFileSync(_gatePath("js/views/free-home.js"), "utf8"));
  ok(/data-route="activity-log" data-requires-checkin="false"/.test(fh) && /data-route="upgrade" data-requires-checkin="false"/.test(fh), "a reference row asks for a check-in");
});
check("7c. retired with Free's arc panel (P-46 S4); the Plan's arc line is verify-arc-door", () => {
  ok(!/today-arc__note/.test(today), "the old arc note is back");
});
check("7d. day one reads as a starting line: How are you today? Three taps, then your session.", () => {
  const fh = strip(fs.readFileSync(_gatePath("js/views/free-home.js"), "utf8"));
  ok(/How are you today\?/.test(fh) && /Three taps, then your session\./.test(fh), "the day-one words are missing");
});
check("7e. the Today card sits above the other ways in", () => {
  const fh = strip(fs.readFileSync(_gatePath("js/views/free-home.js"), "utf8"));
  const at = fh.indexOf("todayCard(!!ctx.checkedIn)"), rows = fh.indexOf('class="path-doors"');
  ok(at > -1 && rows > at, "the Today card is not first");
});
console.log("\nTEST 8 - unlit is not failed");

check("8. an untouched strand does not read as disabled", () => {
  const css = fs.readFileSync(_gatePath("css/layouts/today.css"), "utf8");
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
  const mp = strip(fs.readFileSync(_gatePath("js/views/my-programme.js"), "utf8"));
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

check("10a. session tiles have left Home on both tiers (P-46 S4: Free too)", () => {
  ok(!/today-door/.test(today) && !/today-door/.test(strip(fs.readFileSync(_gatePath("js/views/free-home.js"), "utf8"))), "a session tile on Home");
});
check("10b. one invitation, and it names the price of entry (Three taps)", () => {
  const fh = strip(fs.readFileSync(_gatePath("js/views/free-home.js"), "utf8"));
  ok((fh.match(/data-action="start-today"/g) || []).length === 2 && /Three taps, then your session\./.test(fh), "not one invitation with its price");
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
  const cp = strip(fs.readFileSync(_gatePath("js/views/coach-proposal.js"), "utf8"));
  // SMOOTH-P2a. The kinds are generated from SESSION_TYPES minus today's,
  // so the count is asserted on the live list, not on markup literals.
  const kindsFromTypes = /SESSION_TYPES\.filter\(t => t\.id !== _deliveredType\(option\)/.test(cp) &&
                         /data-different-kind=/.test(cp);
  ok(kindsFromTypes,
     "the plan does not offer the other session kinds. The session tiles left Home and must " +
     "land here — removing choice is not the same as hiding it.");
  ok(/data-different="class"/.test(cp), "no way to a class from the plan");
  const plan  = cp.indexOf("${option ? _renderPlan(option, premium) : ''}");
  const sheet = cp.indexOf("${premium && option ? _renderDifferent(option) : ''}");
  ok(plan > -1 && sheet > plan,
     "the choices render above the coach's plan, which makes it a menu again");
});

console.log("\nTEST 11 - TIER-HOME: free and Plan are different screens");

check("11a. Home branches on tier: the Plan's Home, or Free's (free-home.js)", () => {
  ok(/if \(isPremium\(\)\) \{ _renderPlanHome\(container, greeting\); return; \}\s*_renderFreeHome\(container, greeting\);/.test(today), "no tier branch");
});
check("11b. free is given a question (How are you today?) and its controls", () => {
  const fh = strip(fs.readFileSync(_gatePath("js/views/free-home.js"), "utf8"));
  ok(/How are you today\?/.test(fh) && /free-gentler/.test(fh) && /free-ready/.test(fh), "question or controls missing");
});
check("11c. free gets the gentle fallback, named as an offer (Something gentler)", () => {
  ok(/"Something gentler", "A short, easy session"/.test(strip(fs.readFileSync(_gatePath("js/views/free-home.js"), "utf8"))), "no Something gentler");
});
check("11d. the Plan line is last, under the ways in", () => {
  const fh = strip(fs.readFileSync(_gatePath("js/views/free-home.js"), "utf8"));
  ok(fh.indexOf("Want more choice?") > fh.indexOf('class="path-doors"'), "the Plan line is above the ways in");
});
check("11e. Wellbeing is not duplicated: on Free it is in the bottom bar only", () => {
  ok(!/noticing/.test(strip(fs.readFileSync(_gatePath("js/views/free-home.js"), "utf8"))), "Free Home has a Wellbeing row as well as the bar");
});
console.log(fails === 0
  ? "\nLOBBY-1a: all assertions pass\n"
  : "\nLOBBY-1a: " + fails + " FAILED\n");
process.exit(fails === 0 ? 0 : 1);
