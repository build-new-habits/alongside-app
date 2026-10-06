/**
 * tools/verify-text-fit.mjs
 * 06 Oct 2026 v3
 *
 * v3 - D-11 PROGRESS-SHARE. 7b reads the chart's column count from --n
 *   (seven or fourteen days, six or thirteen weeks), default six; the rule
 *   it holds (columns may narrow below their labels) is unchanged.
 *
 * 06 Oct 2026 v2
 *
 * v2 - D-12 PROGRESS-FIT. Graeme, 06 Oct, on the phone: "when I go into
 * progress the screen shifts right which makes some stuff off screen ...
 * it's every time." Measured in Chromium at 412px: at his text size
 * Progress was 707px wide. Two causes. (a) The text size was applied
 * twice: the page root was multiplied by the setting AND every text token
 * was, so 1.45 drew text 2.1x and the top of the slider (1.6) 2.56x.
 * (b) Progress (and Plan your week) sized themselves to their widest
 * content: the week chart's six no-wrap labels pushed the page out. A
 * browser sweep of every screen also found two full-width buttons that
 * would not wrap and a session header that squeezed its title.
 *   5. The root is the browser's own size; only the text tokens carry the
 *      setting (verify-disp1 TEST 3 still holds them to it).
 *   6. The slider's top is 2, so the setting can still reach twice the
 *      size now that it means what it says.
 *   7. Progress fills the screen and no wider; its chart columns may
 *      narrow; at large text it is one thing per row (a container query
 *      on its own width in characters), and the week chart turns on its
 *      side; the kinds of session sit beside their dots.
 *   8. Plan your week fills the screen; its day strip scrolls inside it.
 *   9. Full-width buttons wrap their words.
 *  10. A session's header lets its title drop under Back.
 *  11. Free Home's door tiles, and the morning session's week grid, fit as
 *      many columns as their words allow (fixed columns ran off at 2x).
 *  12. The Mobility & Conditioning header (and Stretch arc, Your arc)
 *      lets its title drop under Back.
 *  13. A web or email address too long for a line may break.
 *  14. The bottom navigation's labels and icons stop growing at about
 *      1.45x: at 2x the four labels ran into each other. (The sweep cannot
 *      see this: the bar is fixed to the screen, so it never widens it.)
 * Measured at 2x as well as Graeme's size, because the slider now reaches
 * it: Home, Privacy, Mobility & Conditioning and the morning session were
 * still too wide there after 5-10.
 * The behaviour is proven in a real browser by tools/chromium-text-fit.mjs
 * (every screen, both tiers, text 1x / 1.45x / 2x: nothing wider than the
 * phone, no word split across two lines). jsdom draws no layout, so this
 * gate holds the rules that make it so, and goes red if one is put back.
 *
 * 05 Oct 2026 v1
 *
 * D-8 TEXT-FIT. Graeme, device test, 05 Oct, at his large text size:
 * "A couple of text field bleeds". Home's Only 10 minutes and Something
 * else today ran out of their buttons side by side, and the player's
 * "2 sets, this long each" ran out of the timer circle.
 *
 * jsdom draws no layout, so this reads the rules that make them fit, and
 * goes red if one is put back:
 *   1. The week card's two buttons stack, and its buttons wrap their words.
 *   2. The timer circle grows with the text size, in every width rule.
 *   3. The timer's label sits under the circle (positioned out of it), and
 *      the space for it is kept below.
 *   4. Your week's buttons wrap too.
 * Checked by eye at a 1.45 text scale on a 412px screen before shipping.
 */
import { readFileSync } from "node:fs";
const css = f => readFileSync(new URL(`../css/${f}`, import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const rule = (src, sel) => [...src.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter(m => m[1].split(",").map(s => s.trim()).includes(sel)).map(m => m[2]).join(";");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 300)}`); }
};

const today = css("layouts/today.css");
const row = rule(today, ".home-week__row");
ok("1a. Home's week card: Only 10 minutes and Something else today stack", /flex-direction:\s*column/.test(row) && !/repeat\(2/.test(row), row);
const btn = rule(today, ".home-week .btn");
ok("1b. and every button on it wraps its words and grows", /white-space:\s*normal/.test(btn) && /height:\s*auto/.test(btn), btn);

const wo = css("components/workout.css");
const circles = [...wo.matchAll(/\.timer-circle\s*\{([^}]*)\}/g)].map(m => m[1]);
ok("2. every timer-circle size grows with the text size (max(..., text))", circles.length >= 4 &&
   circles.every(c => !/(?:width|height):\s*\d+px\s*;/.test(c)) &&
   circles.filter(c => /width/.test(c)).every(c => /width:\s*max\([^;]*(--text-|--user-text-scale)/.test(c)), circles.join(" | "));
const label = rule(wo, ".timer-label");
ok("3a. the timer's words sit under the circle, centred, free to wrap", /position:\s*absolute/.test(label) && /top:\s*100%/.test(label) && /text-align:\s*center/.test(label) && /max-width/.test(label), label);
ok("3b. and the space for them is kept below the circle", /padding-bottom:\s*calc\(var\(--text-sm\)/.test(rule(wo, ".timer-display")));

const yw = css("components/your-week.css");
const ywb = rule(yw, ".yw-view .btn");
ok("4. Your week's buttons wrap their words", /white-space:\s*normal/.test(ywb) && /height:\s*auto/.test(ywb), ywb);

const reset = css("base/reset.css");
const root = rule(reset, "html");
ok("5. the page root is the browser's own size: the text size is applied once, by the text tokens", /font-size:\s*100%/.test(root) && !/user-text-scale/.test(root), root);
const prefs = readFileSync(new URL("../js/display-prefs.js", import.meta.url), "utf8");
const range = (prefs.match(/textScale:\s*\{([^}]*)\}/) || [])[1] || "";
ok("6. the text size slider goes up to 2 (twice the size)", /max:\s*2(\.0)?\s*,/.test(range), range);

const pr = css("layouts/progress.css");
const view = rule(pr, ".progress-view");
ok("7a. Progress fills the screen and no wider (width 100%, and a container for its own width)", /width:\s*100%/.test(view) && /container:\s*progress\s*\/\s*inline-size/.test(view), view);
// v3, D-11: the chart takes any number of bars (--n), default six.
ok("7b. the chart's columns may narrow below their labels", /repeat\((6|var\(--n,\s*6\)),\s*minmax\(0,\s*1fr\)\)/.test(rule(pr, ".pr-bars")), rule(pr, ".pr-bars"));
// The normal-size rules only: on its side (large text) the week label is
// one line on purpose, with a whole row to itself.
const prNormal = pr.replace(/@container[\s\S]*$/, "");
ok("7c. a week label wraps rather than pushing its column out", /white-space:\s*normal/.test(rule(prNormal, ".pr-bar__week")) && !/white-space:\s*nowrap/.test(rule(prNormal, ".pr-bar__week")) && !/(^|[;\s])height:\s*1\.3em/.test(rule(prNormal, ".pr-bar__week")), rule(prNormal, ".pr-bar__week"));
ok("7d. every bar stands on one line, however its label wraps (shared rows)", /grid-template-rows:\s*subgrid/.test(rule(pr, ".pr-bar")), rule(pr, ".pr-bar"));
const cq = (pr.match(/@container\s+progress\s*\(max-width:\s*([\d.]+)em\)\s*\{([\s\S]*?)\n\}/) || []);
const inCq = sel => cq[2] ? rule(cq[2], sel) : "";
ok("7e. at large text Progress is one thing per row (a container query in characters)", !!cq[2] && Number(cq[1]) >= 17 && Number(cq[1]) <= 21 &&
   /grid-template-columns:\s*minmax\(0,\s*1fr\)/.test(inCq(".progress-body > .progress-summary")), (cq[0] || "no @container progress").slice(0, 200));
ok("7f. and the week chart turns on its side (week, bar across, count)", /grid-template-columns:\s*auto\s+minmax\(0,\s*1fr\)\s+auto/.test(inCq(".pr-bars")) && /width:\s*var\(--f\)/.test(inCq(".pr-bar__fill")), inCq(".pr-bars"));
ok("7g. a row's tile sits above its words at large text, the arrow beside them", /grid-row:\s*2/.test(inCq(".pr-row > .pr-row__text")), inCq(".pr-row > .pr-row__text"));
ok("7h. the kinds of session sit beside their dots (not spread across the row)", /justify-content:\s*flex-start/.test(rule(pr, ".progress-shapes .progress-shapes__row")));

const wp = css("components/weekly-plan-v2.css");
ok("8. Plan your week fills the screen and no wider; its day strip scrolls inside it", /width:\s*100%/.test(rule(wp, ".weekly-plan-view")) && /overflow-x:\s*auto/.test(rule(wp, ".wp-grid")), rule(wp, ".weekly-plan-view"));
const bt = css("components/buttons.css");
ok("9. full-width buttons wrap their words, in balanced lines", /white-space:\s*normal/.test(rule(bt, ".btn-full")) && /text-wrap:\s*balance/.test(rule(bt, ".btn-full")), rule(bt, ".btn-full"));
ok("10. a session's header lets its title drop under Back", /flex-wrap:\s*wrap/.test(rule(wo, ".workout-header")), rule(wo, ".workout-header"));
ok("10b. but judges the title from a few characters' width, so at normal text it stays beside Back", /flex-basis:\s*\d+(\.\d+)?em/.test(rule(wo, ".workout-header > .workout-header-title")), rule(wo, ".workout-header > .workout-header-title"));

const td = css("layouts/today.css");
ok("11a. Free Home's door tiles fit as many columns as their words allow", /repeat\(auto-fit,\s*minmax\(min\(100%,\s*\d+(\.\d+)?em\),\s*1fr\)\)/.test(rule(td, ".today-doors")), rule(td, ".today-doors"));
const ms = css("components/morning-session.css");
ok("11b. the morning session's week grid too", /repeat\(auto-fit,\s*minmax\(min\(100%,\s*\d+(\.\d+)?em\),\s*1fr\)\)/.test(rule(ms, ".ms-week-grid")), rule(ms, ".ms-week-grid"));
const mc = css("layouts/mobility-conditioning.css");
ok("12. the Mobility & Conditioning header lets its title drop under Back", /flex-wrap:\s*wrap/.test(rule(mc, ".mc-header")), rule(mc, ".mc-header"));
ok("13. a web or email address too long for a line may break", /overflow-wrap:\s*break-word/.test(rule(reset, "body")) && !/overflow-wrap:\s*anywhere/.test(rule(reset, "body")), rule(reset, "body"));

const shell = css("layouts/app-shell.css");
ok("14a. the navigation labels grow with the text, to a limit (all four fit at 2x)", /font-size:\s*min\(var\(--text-xs\),\s*[\d.]+rem\)/.test(rule(shell, ".nav-label")), rule(shell, ".nav-label"));
ok("14b. and the navigation icons", /font-size:\s*min\(calc\([^)]*--user-text-scale[^)]*\)\),\s*[\d.]+rem\)/.test(rule(shell, ".nav-icon")), rule(shell, ".nav-icon"));

console.log(`\nTEXT-FIT: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
