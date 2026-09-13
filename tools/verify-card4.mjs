/**
 * tools/verify-card4.mjs
 * 13 Sep 2026 v1
 *
 * CARD-4. The exercise card becomes four pages -- decide, watch, do,
 * note -- the hazards get a page of their own, and an image slot arrives
 * on DO with a placeholder that has an enforced expiry.
 *
 * ── WHY IT EXECUTES ─────────────────────────────────────────────────
 *
 * CARD-TDZ is the standing reason: every session screen in the app was
 * dead while five source-text gates stayed green. The bootstrap below is
 * lifted from verify-adapt1.mjs, which is the closest existing fit.
 * Everything that matters CALLS renderExerciseCard() with real store
 * state and reads the html a person would actually get.
 *
 * ── TWO CORRECTIONS TO THE BLUEPRINT, MADE DELIBERATELY ─────────────
 *
 * 1. THE BLUEPRINT SAYS SIX PLAYERS. THERE ARE FOUR.
 *    Only workout.js, gym-programme.js, core-session.js and
 *    prescribed-session.js import the shared renderer. prescribed.js and
 *    morning-session.js each define their own local renderExerciseCard()
 *    and hold no page state at all. The blueprint's own counts prove the
 *    four: 48 `currentCardPage` references and 28 "decide" literals are
 *    both reachable only from these files plus the card. Test 6 asserts
 *    the consumer set is EXACTLY four, so a fifth cannot arrive quietly
 *    and a migration cannot happen without this gate noticing.
 *
 * 2. HURT_AND_ACHE WAS NOT ON EVERY PAGE. IT WAS ON DO ONLY.
 *    Section 5.2 of the blueprint says "it is in `pinned`, so it should
 *    follow". It was not in `pinned`; it was a section inside `doBody`.
 *    So rule 1 is a behaviour CHANGE, not an assertion about what was
 *    already true -- and a load-bearing one, because moving the hazards
 *    to WATCH would otherwise have taken "if it hurts" off the page
 *    where somebody is actually moving.
 *
 *    The split this gate enforces:
 *      - watchOut ("What to watch for")  -> WATCH body only, never DO.
 *        This is the exercise-specific hazard, and what 7.4 is about.
 *      - HURT_AND_ACHE ("If it hurts")   -> pinned, all four pages.
 *        This is CR-5's universal pair, and rule 1 outranks 7.4 for it.
 *
 * ── REVERSALS (run before commit, each must go red) ─────────────────
 *
 *   R1  Remove HURT_AND_ACHE_HTML from `pinned`            -> 2.x red
 *   R2  Put the watchOut section back into doBody          -> 4.x red
 *   R3  Set BACK_TO.do = "decide" (skip the warnings)      -> 8.x red
 *   R4  Give the placeholder an alt attribute              -> 9.x red
 *   R5  Add an image field to a registry entry             -> 10.x red
 *       (10.2 runs R5 automatically, in-process)
 */
import { JSDOM } from "jsdom";
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: "https://example.org/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c) => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); } };
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const fs = await import("node:fs");
const { store } = await import("../js/store.js");
const { EXERCISES } = await import("../js/data/exercises/index.js");
const { renderExerciseCard, HURT_AND_ACHE } = await import("../js/exercise-card.js");
const { setDisplayPref } = await import("../js/display-prefs.js");

const byId = new Map(EXERCISES.map(e => [e.id, e]));

const PAGE_KEYS = ["decide", "watch", "do", "note"];
const PLACEHOLDER = "Photographs are being added";
const IMAGE_KEY = /^(image|images|img|photo|photos|illustration|illustrations)$/i;

const setSore = (map) => {
  store.set("conditions", Object.keys(map));
  store.set("conditionPainScores", map);
};

// ── FIXTURES ────────────────────────────────────────────────────────
const FULL = {
  id: "fx-full", name: "Fixture full", category: "strength",
  affectsAreas: ["lower-back"],
  watchOut: ["Knees falling inwards"],
  instructions: ["Set up", "Move"],
  coaching: "One thing",
  cues: ["Lead cue", "Second cue"],
  holdSeconds: 20,
  adaptations: {
    easeOff: ["If your back lifts, keep both feet on the floor."],
    further: ["When this feels steady, lift one foot."],
  },
};

const R = (ex, opts = {}) => renderExerciseCard(ex, { idPrefix: "t", ...opts });
const allPages = (ex, opts = {}) =>
  Object.fromEntries(PAGE_KEYS.map(k => [k, R(ex, { page: k, noteSlot: "<p>note</p>", ...opts })]));

console.log("\nCARD-4 — four pages, hazards of their own, an image slot with an expiry\n");

// ════════════════════════════════════════════════════════════════════
console.log("TEST 1 — four pages, in order");

setSore({});
{
  const H = allPages(FULL);

  ok("1.0 CONTROL: every page rendered a card, not an empty string",
     PAGE_KEYS.every(k => H[k] && H[k].includes("exercise-card--paged")));

  ok("1.1 each page carries its own data-xcard-page",
     PAGE_KEYS.every(k => H[k].includes(`data-xcard-page="${k}"`)));

  ok("1.2 the pager counts four, and numbers them in order", (() => {
    return PAGE_KEYS.every((k, i) =>
      new RegExp(`step ${i + 1} of 4`).test(H[k]));
  })());

  ok("1.3 no page announces three", !PAGE_KEYS.some(k => /of 3\b/.test(H[k])));

  ok("1.4 an unknown page key still falls back to decide",
     R(FULL, { page: "nonsense" }).includes('data-xcard-page="decide"'));
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 2 — HURT_AND_ACHE on all four (rule 1, CR-5)");

{
  const H = allPages(FULL);
  const frag = HURT_AND_ACHE[0].slice(0, 48);

  ok("2.0 CONTROL: the constant is non-empty and has two lines",
     Array.isArray(HURT_AND_ACHE) && HURT_AND_ACHE.length === 2 &&
     HURT_AND_ACHE.every(s => typeof s === "string" && s.trim().length > 40));

  for (const k of PAGE_KEYS) {
    ok(`2.1.${k} "If it hurts" renders on ${k.toUpperCase()}`,
       H[k].includes("If it hurts") && H[k].includes(frag));
  }

  ok("2.2 it renders once per page, not twice",
     PAGE_KEYS.every(k => (H[k].match(/If it hurts/g) || []).length === 1));

  ok("2.3 it is pinned, not page-scoped: it sits above the page body",
     PAGE_KEYS.every(k => {
       const a = H[k].indexOf("If it hurts");
       const b = H[k].indexOf('class="xcard-page"');
       return a > -1 && b > -1 && a < b;
     }));

  ok("2.4 the flat view carries it exactly once", (() => {
    setDisplayPref("fullInstructions", "on");
    const flat = R(FULL);
    setDisplayPref("fullInstructions", "off");
    return flat.includes("exercise-card--flat") &&
           (flat.match(/If it hurts/g) || []).length === 1;
  })());
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 3 — the caution is pinned on all four, and the pointer follows it");

setSore({ "lower-back": 5 });
{
  const H = allPages(FULL);

  ok("3.0 CONTROL: the fixture actually produces a caution",
     H.decide.includes("exercise-caution"));

  ok("3.1 the caution is on all four pages",
     PAGE_KEYS.every(k => H[k].includes("exercise-caution")));

  ok("3.2 the sore-area pointer appears wherever the caution does, except NOTE",
     ["decide", "watch", "do"].every(k => /other ways to do this one/.test(H[k])) &&
     !/other ways to do this one/.test(H.note));

  ok("3.3 the pointer is its own element, outside the caution paragraph",
     PAGE_KEYS.slice(0, 3).every(k => {
       const m = H[k].match(/<p class="exercise-caution" role="note">([\s\S]*?)<\/p>/);
       return !!m && !m[1].includes("xcard-adapt-pointer");
     }));

  ok("3.4 the pointer says below on DO and on the next page before it",
     /other ways to do this one below/.test(H.do) &&
     /other ways to do this one on the next page/.test(H.decide) &&
     /other ways to do this one on the next page/.test(H.watch));
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 4 — the hazard cluster is on WATCH and not on DO");

setSore({});
{
  const H = allPages(FULL);

  ok("4.0 CONTROL: the fixture carries a watchOut item",
     Array.isArray(FULL.watchOut) && FULL.watchOut.length > 0);

  ok("4.1 What to watch for is on WATCH",
     H.watch.includes("What to watch for") && H.watch.includes("Knees falling inwards"));

  ok("4.2 What to watch for is NOT on DO",
     !H.do.includes("What to watch for") && !H.do.includes("Knees falling inwards"));

  ok("4.3 nor on DECIDE or NOTE",
     !H.decide.includes("What to watch for") && !H.note.includes("What to watch for"));

  ok("4.4 the hazard block keeps its hazard styling on WATCH",
     H.watch.includes("xcard-block--hazard"));

  ok("4.5 an entry with no watchOut still gets a WATCH page with If it hurts", (() => {
    const bare = { ...FULL, id: "fx-bare", watchOut: [] };
    const h = R(bare, { page: "watch" });
    return h.includes("If it hurts") && !h.includes("What to watch for");
  })());
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 5 — DO holds the exercise, WATCH does not");

{
  const H = allPages(FULL, { doSlot: '<div class="exercise-target">TARGET</div><a class="youtube-link">video</a>' });

  ok("5.1 instructions are on DO",
     H.do.includes("How to get there") && H.do.includes("Set up"));

  ok("5.2 instructions are NOT on WATCH",
     !H.watch.includes("How to get there") && !H.watch.includes("Set up"));

  ok("5.3 the view's doSlot (target and video) lands on DO only",
     H.do.includes("youtube-link") && H.do.includes("TARGET") &&
     !H.watch.includes("youtube-link") && !H.decide.includes("youtube-link"));

  ok("5.4 pace stays on DO", H.do.includes("Pace") && !H.watch.includes("Pace"));

  ok("5.5 more on form stays on DO",
     H.do.includes("More on form") && !H.watch.includes("More on form"));
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 6 — other ways to do this, on DO only and outside any hazard");

setSore({});
{
  const H = allPages(FULL);

  ok("6.1 the disclosure is on DO only",
     H.do.includes("<details") && H.do.includes("Other ways to do this") &&
     !H.watch.includes("<details") && !H.decide.includes("<details") &&
     !H.note.includes("<details"));

  ok("6.2 no hazard text sits inside the disclosure", (() => {
    const a = H.do.indexOf("<details");
    const inner = H.do.slice(a, H.do.indexOf("</details>", a) + 10);
    return inner.length > 10 &&
           !inner.includes("What to watch for") && !inner.includes("If it hurts");
  })());

  ok("6.3 on WATCH, the hazard block is not wrapped in a disclosure",
     !H.watch.includes("<details"));
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 7 — the per-set control stays on DO (TIMER-2)");

{
  const VIEWS = {
    "workout.js":            "js/views/workout.js",
    "gym-programme.js":      "js/views/gym-programme.js",
    "core-session.js":       "js/views/core-session.js",
    "prescribed-session.js": "js/views/prescribed-session.js",
  };
  const src = Object.fromEntries(
    Object.entries(VIEWS).map(([k, p]) => [k, strip(fs.readFileSync(p, "utf8"))]));

  ok("7.0 CONTROL: all four sources read, and each imports the shared card",
     Object.values(src).every(s => s.length > 2000 &&
       /import\s*\{[^}]*renderExerciseCard[^}]*\}\s*from\s*"\.\.\/exercise-card\.js"/.test(s)));

  ok("7.1 workout.js keeps the set-done control inside the DO branch", (() => {
    const s = src["workout.js"];
    const a = s.indexOf('currentCardPage === "do"');
    const b = s.indexOf('currentCardPage === "note"', a);
    return a > -1 && b > a && s.slice(a, b).includes("wo-set-done-btn");
  })());

  ok("7.2 the set-done control appears in no WATCH branch",
     Object.values(src).every(s => {
       const a = s.indexOf('currentCardPage === "watch"');
       if (a < 0) return false;
       const b = s.indexOf('currentCardPage === "do"', a);
       const slice = b > a ? s.slice(a, b) : s.slice(a, a + 900);
       return !/set-done-btn/.test(slice);
     }));
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 8 — moving forward passes the warnings; Back goes one page");

{
  const H = allPages(FULL);

  ok("8.1 DECIDE offers no Back", !H.decide.includes("data-xcard-back"));

  ok("8.2 Back from WATCH goes to DECIDE",
     /data-xcard-back="decide"/.test(H.watch));

  ok("8.3 Back from DO goes to WATCH, not DECIDE",
     /data-xcard-back="watch"/.test(H.do) && !/data-xcard-back="decide"/.test(H.do));

  ok("8.4 Back from NOTE goes to DO",
     /data-xcard-back="do"/.test(H.note));

  const VIEWS = ["workout", "gym-programme", "core-session", "prescribed-session"];
  const src = Object.fromEntries(
    VIEWS.map(v => [v, strip(fs.readFileSync(`js/views/${v}.js`, "utf8"))]));

  ok("8.5 CONTROL: four view sources read and each holds page state",
     VIEWS.every(v => src[v].length > 2000 && /currentCardPage/.test(src[v])));

  ok("8.6 no view sends DECIDE straight to DO", (() => {
    const bad = [];
    for (const v of VIEWS) {
      // the forward handler out of DECIDE must land on watch
      if (/currentCardPage\s*=\s*"do"/.test(src[v]) &&
          !/currentCardPage\s*=\s*"watch"/.test(src[v])) bad.push(v);
    }
    if (bad.length) console.log("       " + bad.join(", "));
    return bad.length === 0;
  })());

  ok("8.7 every view's back guard accepts watch", (() => {
    const bad = VIEWS.filter(v => !/to\s*!==\s*"watch"/.test(src[v]));
    if (bad.length) console.log("       " + bad.join(", "));
    return bad.length === 0;
  })());

  ok("8.8 every view renders all four page branches", (() => {
    const bad = VIEWS.filter(v =>
      !PAGE_KEYS.every(k => src[v].includes(`currentCardPage === "${k}"`)));
    if (bad.length) console.log("       " + bad.join(", "));
    return bad.length === 0;
  })());
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 9 — the image slot on DO");

{
  const H = allPages(FULL);
  const a = H.do.indexOf("xcard-image");
  const slot = a > -1 ? H.do.slice(a, a + 400) : "";

  ok("9.1 the placeholder is on DO", H.do.includes(PLACEHOLDER));

  ok("9.2 it is on DO only",
     !H.watch.includes(PLACEHOLDER) && !H.decide.includes(PLACEHOLDER) &&
     !H.note.includes(PLACEHOLDER));

  ok("9.3 it points at the video, which every entry has",
     /the video shows the movement/i.test(H.do));

  ok("9.4 it is not announced as an image: no <img>, no role=img, no alt",
     slot.length > 0 && !/<img\b/i.test(slot) &&
     !/role\s*=\s*"img"/i.test(slot) && !/\balt\s*=/i.test(slot));

  ok("9.5 no <img> or alt anywhere on the card",
     !/<img\b/i.test(H.do) && !/\balt\s*=/i.test(H.do));
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 10 — THE EXPIRY");

{
  // The tripwire, as a pure function of (registry, rendered html), so it
  // can be run against a doctored registry in-process. That is the
  // reversal: it is not described in a comment, it is executed.
  const expiryHolds = (registry, html) => {
    const anyImage = registry.some(e =>
      Object.keys(e).some(k => IMAGE_KEY.test(k)));
    return anyImage ? !html.includes(PLACEHOLDER) : html.includes(PLACEHOLDER);
  };

  const doHtml = R(FULL, { page: "do" });

  ok("10.0 CONTROL: the real registry carries no image field on any of its "
     + EXERCISES.length + " entries",
     !EXERCISES.some(e => Object.keys(e).some(k => IMAGE_KEY.test(k))));

  ok("10.1 with no images anywhere, the placeholder must be present",
     expiryHolds(EXERCISES, doHtml));

  ok("10.2 REVERSAL, executed: add an image field to one entry and the "
     + "placeholder is no longer allowed",
     expiryHolds([...EXERCISES, { ...FULL, image: "squat.png" }], doHtml) === false);

  ok("10.3 the expiry is keyed on the field, not on a filename",
     expiryHolds([{ id: "x", illustrations: [] }], doHtml) === false);
}

// ════════════════════════════════════════════════════════════════════
console.log("\nTEST 11 — the players, and that there are exactly four of them");

{
  const files = fs.readdirSync("js/views").filter(f => f.endsWith(".js"));
  const consumers = files.filter(f =>
    /from\s*"\.\.\/exercise-card\.js"/.test(fs.readFileSync(`js/views/${f}`, "utf8")))
    .sort();

  const EXPECTED = ["core-session.js", "gym-programme.js",
                    "prescribed-session.js", "workout.js"];

  ok("11.0 CONTROL: " + files.length + " view files scanned, more than the four",
     files.length > 4);

  ok("11.1 the consumer set is exactly the four known players" +
     (consumers.join(",") === EXPECTED.join(",") ? "" : "  [" + consumers.join(", ") + "]"),
     consumers.length === EXPECTED.length &&
     consumers.every((f, i) => f === EXPECTED[i]));

  // prescribed.js and morning-session.js are NOT players. morning-session.js
  // renders its own do-the-exercise card with no caution and no
  // HURT_AND_ACHE at all -- a live CR-5 gap, pre-existing and logged as a
  // red item, not closed here. This assertion exists so that gap cannot be
  // quietly forgotten: the day either file starts importing the shared
  // card, 11.1 goes red and somebody has to come back and read this.
  ok("11.2 the two local-card views still hold no shared page state",
     ["prescribed.js", "morning-session.js"].every(f =>
       !/currentCardPage/.test(fs.readFileSync(`js/views/${f}`, "utf8"))));
}

console.log("\n  " + pass + " passed, " + fail + " failed");
if (fail) { console.log("\n  " + fails.join("\n  ") + "\n"); process.exit(1); }
console.log("");
