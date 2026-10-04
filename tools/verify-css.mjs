/**
 * tools/verify-css.mjs
 * 04 Oct 2026 v7
 *
 * v7 - LOOK-2. progress-body is styled now (the overview's card stack), so
 *   it leaves the hook list, as the check itself asks.
 *
 * 02 Oct 2026 v6
 *
 * v6 - W4-8. mini-pain-slider left with the update check-in's 0 to 10 slider
 *   (now the check-in's three words).
 *
 * 29 Sep 2026 v5
 *
 * v5 - P0. Two hooks left with the screens that rendered them
 *   (conditions-update, the conditions programme card).
 *
 * v4 - F8. Reads every file under js/, not only js/views: the safety
 *   screen's Start button and the whole update banner were unstyled out
 *   of its sight. Five more hooks, each with its reason.
 *
 * 28 Sep 2026 v3
 *
 * v3 - F7, CSS-ZERO. Budget 0. css/components/finish.css styles every
 *   visual family that was rendering as a draft (privacy, Your impact,
 *   Your year, prescribed, the builder's preview and spinner, finish,
 *   and the singles). What remains unstyled is named below in HOOKS,
 *   each with its reason: a view scope, a JS hook on an element already
 *   styled by another class, or a wrapper/modifier that needs no rule.
 *   A hook name that gains a rule, or stops being rendered, fails too,
 *   so the list cannot rot.
 *
 * 28 Sep 2026 v2
 *
 * v2 - Work list 11. Budget locked at 130 (it had fallen to 130 and the
 *   gate was asking for the gain to be locked in). CSS-ZERO, on the
 *   finish list, takes it to 0: each class styled or marked as a hook.
 *
 * 12 Aug 2026 v1
 *
 * CSS-1. Every class a view renders must have a rule somewhere.
 *
 * Graeme, from the device pass, on the run type picker: "Image 1 is
 * unstyled. We need to audit all pages. This was a previously known issue
 * in Library."
 *
 * He was right that it is a class of problem, not one screen. The audit
 * found 174 classes used in view templates with no rule anywhere -- and
 * the whole .ws-* family among them, so four session views rendered as
 * unstyled text on every screen.
 *
 * WHY IT HID. Nothing errors. A class with no rule is not a bug to any
 * tool: the markup is valid, the JS runs, the screen appears. It just
 * looks like a draft. The only detector was somebody opening the screen.
 *
 * BUDGETED, NOT ZERO. 174 cannot be fixed in one pass, and a gate that
 * fails from day one gets switched off. The budget is the current count,
 * so it can only go DOWN -- adding a new unstyled class fails
 * immediately, and every one fixed tightens the ratchet.
 */
import fs from "node:fs";
import path from "node:path";

// GATE-PATH, 08 Sep 2026. Resolved from import.meta.url, not the cwd.
const _GATE_ROOT = new URL("../", import.meta.url);
const _gatePath = (p) => new URL(String(p).replace(/^\.\//, ""), _GATE_ROOT);


const walk = (d, ext) => fs.readdirSync(_gatePath(d), { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(d, e.name), ext)
                  : (e.name.endsWith(ext) ? [path.join(d, e.name)] : []));

const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "");

// Classes rendered by views
const used = new Map();
// v4: EVERY JS file. It read js/views plus two files, and the safety
// screen every new user sees (js/safety-gate.js) and the update banner
// (js/app.js) rendered unstyled outside its sight.
for (const f of walk("js", ".js")) {
  const src = strip(fs.readFileSync(_gatePath(f), "utf8"));
  for (const m of src.matchAll(/class="([^"${}]+)"/g))
    for (const c of m[1].split(/\s+/))
      if (c) (used.get(c) || used.set(c, new Set()).get(c)).add(path.basename(f));
}

// Classes defined in CSS
const defined = new Set();
for (const f of walk("css", ".css"))
  for (const m of strip(fs.readFileSync(_gatePath(f), "utf8")).matchAll(/\.([a-zA-Z][\w-]*)/g))
    defined.add(m[1]);

// Classes with no rule ON PURPOSE. Each reason says why none is needed.
const SCOPE = "view scope: the wrapper is styled by .view / the page layout";
const HOOK  = "JS hook: the element is styled by the class beside it (.card, .btn, .ci-slider)";
const WRAP  = "wrapper or modifier: groups or marks state; its children carry the styling";
const HOOKS = { "in-step-view": SCOPE,
  "prescribed-session-view": SCOPE,
  "programme-select-view": SCOPE, "saved-sessions-view": SCOPE, "sb-view": SCOPE,
  "rf-view--stop": SCOPE, "reflect-view": SCOPE,
  "bs-duration-btn": HOOK, "bs-type-card": HOOK,
  "is-movement-card": HOOK, "is-option-btn": HOOK,
  "ms-timer-btn": HOOK, "quiet-back-btn": HOOK, "sb-buildmode-btn": HOOK,
  "sb-duration-btn": HOOK, "sb-type-tile": HOOK,
  "today-header": WRAP, "activity-log-form": WRAP,
  "activity-log-picker": WRAP, "is-intro": WRAP,
  "reflect-coach-card": WRAP, "checkin-coach-card": WRAP,
  "gp-moment--glance": WRAP, "gp-moment--reflection": WRAP,
  "home-arc--offer": WRAP, "today-arc--active": WRAP, "today-arc--offer": WRAP,
  "noticing-section": WRAP, "onboarding-continue": WRAP, "reflect-mood-slider-block": WRAP,
  "prescribed-add-section": WRAP,
  "btn-quiet": "styled by .gate-leave beside it (session-shared.css)",
  "gate-block": WRAP, "exercise-card--paged": WRAP, "locked-badge-label": WRAP,
  "tts-icon": "an emoji glyph inside a styled button", "update-banner-icon": "an emoji glyph; the row is styled", "tts-icon--playing": WRAP,
  "xcard-stepper-item--done": WRAP, "xcard-stepper-item--now": WRAP, "xcard-stepper-item--ahead": WRAP,
  "ar-figures": HOOK, "ar-sofar": HOOK, "ci-breakdown": HOOK, "ci-pillars": WRAP,
};

const missing = [...used.keys()].filter(c => !defined.has(c) && !HOOKS[c]).sort();

// Ratchet. It reached 0 with F7; it stays there.
const BUDGET = 0;   // 174 -> 157 (CSS-1) -> 131 (CSS-2) -> 130 (work list 11) -> 0 (F7 CSS-ZERO, 28 Sep)

console.log(`\nclasses rendered by views: ${used.size}`);
console.log(`classes defined in CSS:    ${defined.size}`);
console.log(`undefined:                 ${missing.length}  (budget ${BUDGET})\n`);

let fails = 0;

if (missing.length > BUDGET) {
  fails++;
  console.log(`  FAIL  ${missing.length - BUDGET} MORE undefined class(es) than the budget allows.`);
  console.log(`        A class with no rule renders as unstyled text and errors nowhere.`);
  console.log(`        Either add the rule, or fix an existing one and lower BUDGET.\n`);
  for (const c of missing.slice(0, 25))
    console.log(`          .${c}  (${[...used.get(c)].join(", ")})`);
} else if (missing.length < BUDGET) {
  console.log(`  PASS  ${BUDGET - missing.length} fewer than budget \u2014 lower BUDGET to ${missing.length} to lock the gain in.`);
} else {
  console.log("  PASS  no new undefined classes");
}

// A button variant without the .btn base renders as a flat strip: no
// padding, no radius, no 44px. Found on the safety screen (v4).
const bare = [];
for (const f of walk("js", ".js")) {
  const src = strip(fs.readFileSync(_gatePath(f), "utf8"));
  for (const m of src.matchAll(/class="([^"]*)"/g)) {
    const cs = m[1].split(/\s+/);
    if (cs.some(c => /^btn-(primary|secondary|ghost|small|large|full|xs|sm)$/.test(c)) && !cs.includes("btn"))
      bare.push(`${path.basename(f)}: ${m[1].slice(0, 60)}`);
  }
}
if (bare.length) { fails++; console.log(`\n  FAIL  button variant without the .btn base: ${bare.join("; ")}`); }
else console.log("  PASS  every button variant sits on the .btn base");

// The hook list cannot rot: every name must still be rendered, and still
// have no rule (a hook that gained a rule is a style, not a hook).
const staleHooks = Object.keys(HOOKS).filter(c => !used.has(c) || defined.has(c));
if (staleHooks.length) {
  fails++;
  console.log(`\n  FAIL  HOOKS entries that are no longer hooks (not rendered, or now styled): ${staleHooks.join(", ")}`);
} else {
  console.log(`  PASS  ${Object.keys(HOOKS).length} named hooks, each still rendered and each with its reason`);
}

// The families already fixed must stay fixed, whatever the budget says.
const LOCKED = ["ws-type-grid", "ws-type-card", "ws-type-icon", "ws-type-label",
                "ws-type-desc", "ws-duration-grid", "ws-duration-card",
                "ws-duration-label", "ws-timer-block", "ws-timer-value",
                "ws-timer-label", "ws-prompt-text", "ws-prompt-dismiss",
                "ws-active-card", "ws-controls",
                // CSS-2. The pickers Graeme saw rendering as plain text,
                // plus workout-header-title -- 41 uses, the largest single
                // gap, and why titles collided with the home icon.
                "cs-focus-grid", "cs-focus-card", "cs-focus-icon",
                "cs-focus-label", "cs-focus-desc", "cs-duration-grid",
                "cs-duration-card", "cs-duration-label", "cs-duration-desc",
                "cs-duration-count", "gym-exercise-card", "gym-exercise-name",
                "gym-exercises-list", "gym-card-meta-row", "gym-card-chevron",
                "workout-header-title", "exercise-cue", "yoga-session-view",
                // F7. The ones people would notice first.
                "privacy-list", "ci-breakdown__row", "ci-total__number",
                "ar-figures__row", "prescribed-remove-btn", "week-dot",
                "sb-loading-spinner", "sb-exercise-item", "reflect-mood-number",
                "btn-sm", "settings-btn--destructive"];
const regressed = LOCKED.filter(c => !defined.has(c));
if (regressed.length) {
  fails++;
  console.log(`\n  FAIL  previously fixed classes are undefined again: ${regressed.join(", ")}`);
} else {
  console.log("  PASS  the .ws-* single-activity family stays defined");
}

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
