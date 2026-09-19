/**
 * tools/verify-gatebox.mjs
 * 16 Sep 2026 v1
 *
 * GATE-BOX. Checkboxes must be visible.
 *
 * 🔴 css/base/reset.css applied `appearance: none` to EVERY input to
 * strip iOS styling. On a checkbox that does not restyle the box, it
 * REMOVES it -- nothing to tick, nothing to show a tick, and any
 * accent-color left with no control to colour.
 *
 * Four controls were affected and had been since the rule was written:
 *   - onboarding/thread.js  the Privacy Policy / Terms consent box
 *   - session-builder-ui.js equipment selection
 *   - conditions-update.js  recommendation checkboxes
 *   - safety-gate.js        the acknowledgement
 *
 * Found on device on the newest of the four. The consent one matters
 * beyond usability: every account so far agreed to the terms by tapping
 * a box they could not see.
 *
 * ⚫ NO GATE COULD HAVE CAUGHT THIS BY READING JS. The markup was
 * correct, the handlers were correct, the a11y attributes were correct.
 * The control was deleted by a stylesheet three directories away. This
 * file asserts the CSS contract instead.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const fs = __require("node:fs");

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const read = p => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
const reset = read("css/base/reset.css");

console.log("\nGATE-BOX\n");

console.log("TEST 1 — the reset does not delete checkboxes");

ok("1.1 no bare `input` selector strips appearance", (() => {
  // A rule whose selector is exactly `input` (or `input, textarea`)
  // followed by appearance: none. The scoped form is what we want.
  const bad = /(^|\n)\s*input\s*(,\s*textarea\s*)?\{[^}]*appearance:\s*none/;
  return !bad.test(reset);
})(), "appearance: none on a bare `input` selector removes the checkbox itself");

ok("1.2 the scoped exclusion is present and names both control types",
   /input:not\(\[type="checkbox"\]\):not\(\[type="radio"\]\)/.test(reset),
   "radios have the same failure mode as checkboxes and must be excluded too");

ok("1.3 REVERSAL: the detector fires on the original rule",
   /(^|\n)\s*input\s*(,\s*textarea\s*)?\{[^}]*appearance:\s*none/
     .test("\ninput, textarea {\n  appearance: none;\n}"),
   "if this fails the test above passes for the wrong reason");

ok("1.4 text inputs still have their styling stripped",
   /appearance:\s*none/.test(reset) && /textarea/.test(reset),
   "the fix must not have removed the iOS stripping the text fields rely on");

console.log("\nTEST 2 — every checkbox in the app is accounted for");

{
  // Not a count. A list of the files that render one, so a new checkbox
  // in a new file shows up here rather than being silently covered or
  // silently missed.
  const dirs = ["js/views", "js/views/onboarding", "js"];
  const found = [];
  for (const d of dirs) {
    let files = [];
    try { files = fs.readdirSync(new URL("../" + d + "/", import.meta.url)); } catch { continue; }
    for (const f of files) {
      if (!f.endsWith(".js")) continue;
      let t = "";
      try { t = read(d + "/" + f); } catch { continue; }
      if (/type="checkbox"/.test(t)) found.push(d + "/" + f);
    }
  }
  console.log("       renders a checkbox: " + found.join(", "));

  ok("2.1 the consent checkbox is among them and is a real input",
     found.some(f => f.includes("thread.js")) &&
     /type="checkbox"[\s\S]{0,200}I have read and agree/.test(read("js/views/onboarding/thread.js")),
     "the Privacy Policy / Terms consent control -- the one where an " +
     "invisible box is a record problem, not a usability one");

  ok("2.2 the safety acknowledgement is a real input, not a styled div",
     /<input type="checkbox" id="gate-ack-box"/.test(read("js/safety-gate.js")),
     "a div with role=checkbox would dodge the reset AND lose native keyboard " +
     "operation; the fix is to let the native control be visible");

  ok("2.3 at least the four known checkbox surfaces are present", found.length >= 4,
     "found: " + found.length + ". If a file stopped rendering one, say so " +
     "deliberately rather than letting the number drift");
}

console.log("\nTEST 3 — the gate's box carries its state in more than one channel");

{
  const css = read("css/components/session-shared.css");
  ok("3.1 a checked acknowledgement changes the row, not just the box",
     /\.gate-ack:has\(input:checked\)/.test(css),
     "1.4.1 -- and a second channel is what would have made this visible on " +
     "device even with the box deleted");
  ok("3.2 the local appearance guarantee is still there",
     /\.gate-ack input\[type="checkbox"\][\s\S]{0,1200}appearance:\s*checkbox/.test(css),
     "the local declaration is gone -- the app-wide fix in reset.css is the " +
     "real repair, but this control keeps its own guarantee because here an " +
     "invisible box is a safety failure rather than an annoyance");
}

console.log("");
if (fail) { console.log("GATE-BOX: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("GATE-BOX: all " + pass + " assertions pass\n");
