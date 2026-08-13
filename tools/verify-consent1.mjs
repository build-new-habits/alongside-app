/**
 * tools/verify-consent1.mjs
 * 12 Aug 2026 v1
 *
 * CONSENT-1 and EQUIP-2.
 *
 * Graeme, device pass: "The difference between images 3 & 4 show that I
 * consented because of the colour change on continue, but the box should
 * show a tick or be fully teal."
 *
 * The checkbox was styled with accent-color alone, which on a dark
 * background renders the native box as a hollow teal outline that looks
 * near-identical checked and unchecked. The only reliable signal that
 * consent had registered was the Continue button brightening -- a
 * different element, further down the screen, communicating by colour
 * alone.
 *
 * WCAG 1.4.1, on the one control in the app with legal weight.
 */
import fs from "node:fs";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const css = fs.readFileSync("css/components/onboarding-thread.css", "utf8");
const box = css.slice(css.indexOf(".ob-consent__checkbox {"),
                      css.indexOf(".ob-consent__label"));

console.log("\nTEST 1 - the checked state is drawn, not inherited");
check("a :checked rule exists", () =>
  ok(/\.ob-consent__checkbox:checked \{/.test(box),
     "without one the box relies on the browser default, which on a dark " +
     "background is near-identical checked and unchecked"));
check("checked is signalled by more than colour", () => {
  const checked = box.slice(box.indexOf(":checked {"));
  ok(/background: var\(--color-primary\)/.test(checked), "no fill");
  ok(/transform: scale\(1\)/.test(box), "no tick - fill alone is still colour");
  ok(/border-color: var\(--color-primary\)/.test(checked), "border does not change");
});
check("the tick needs no font or network request", () => {
  ok(/clip-path: polygon/.test(box),
     "an icon font or image would fail on a first offline-capable load, " +
     "which is exactly when this screen appears");
});
check("unchecked has a visible border", () =>
  ok(/border: 2px solid var\(--color-text-secondary\)/.test(box),
     "an invisible empty box reads as no control at all"));

console.log("\nTEST 2 - it stays a real checkbox");
check("still an input, not a div", () => {
  const html = fs.readFileSync("js/views/onboarding/thread.js", "utf8");
  ok(/<input type="checkbox" id="ob-consent-check"/.test(html),
     "semantics and keyboard behaviour must survive the restyle");
  ok(/<label for="ob-consent-check"/.test(html), "label must stay associated");
});
check("focus is still visible", () =>
  ok(/\.ob-consent__checkbox:focus-visible \{[\s\S]*?outline:/.test(css),
     "appearance:none removes the native focus ring"));

console.log("\nTEST 3 - EQUIP-2: an empty scope falls back rather than showing nothing");
const sb = fs.readFileSync("js/views/session-builder-ui.js", "utf8");
check("falls back to the other scope", () =>
  ok(/const usingFallback = matching\.length === 0 && other\.length > 0;/.test(sb),
     "an empty list is not a safer answer than a slightly wrong one here - " +
     "everything on this screen is one tap to untick"));
check("only when the matching scope is empty", () =>
  ok(/const savedEquip\s+= usingFallback \? other : matching;/.test(sb),
     "somebody with both lists saved must still get the one they asked for"));
check("and it says so", () =>
  ok(/I haven't got a \$\{scopeWord\} list saved, so I've started from your \$\{otherWord\} kit/.test(sb),
     "a silent fallback is the coach quietly guessing"));

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
