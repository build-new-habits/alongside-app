/**
 * tools/verify-text-fit.mjs
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

console.log(`\nTEXT-FIT: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
