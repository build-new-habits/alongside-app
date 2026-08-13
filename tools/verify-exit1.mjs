/**
 * tools/verify-exit1.mjs
 * 12 Aug 2026 v1
 *
 * EXIT-1. Every session exit must offer a way out that saves nothing.
 *
 * Graeme, device pass part 4: "I started quite a few to see if it was
 * those. When I exited it asked me to save. I need to be able to exit and
 * not save. That's why my sessions have shot up, but I haven't done any."
 *
 * session-guard.js has offered "Exit without saving" since 21 May. NINE
 * views each built their own two-button exit dialog instead, and not one
 * of them included it. So opening a session to see what it was, and
 * backing out, ALWAYS wrote a partial activityLog entry.
 *
 * His own Home read "7 of 3 this week" from sessions he had not done.
 * That is not a cosmetic count: exerciseHistory, continuity selection,
 * burnout detection and the weekly plan all read activityLog.
 *
 * Nothing errored. Every one of those dialogs did exactly what it said.
 */
import fs from "node:fs";

const VIEWS = ["walk-session","running-session","yoga-session","gym-programme",
               "swim-session","core-session","workout","quiet-session","cycle-session"];

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const read = v => fs.readFileSync(`js/views/${v}.js`, "utf8");

console.log("\nTEST 1 - every session view offers a no-save exit");
for (const v of VIEWS)
  check(`${v}`, () => {
    const s = read(v);
    const own = /exit-confirm-discard/.test(s);
    const shared = /showExitCard\(/.test(s);
    ok(own || shared,
       "no discard option - opening this session to look at it and backing " +
       "out writes a partial entry the person never earned");
  });

console.log("\nTEST 2 - discard actually discards");
for (const v of VIEWS) {
  const s = read(v);
  if (!/exit-confirm-discard/.test(s)) continue;   // uses the shared card
  check(`${v} writes nothing on discard`, () => {
    const i = s.indexOf('exit-confirm-discard\')?.addEventListener') >= 0
      ? s.indexOf('exit-confirm-discard\')?.addEventListener')
      : s.indexOf('exit-confirm-discard")?.addEventListener');
    ok(i > 0, "handler not wired - the button would do nothing");
    // Scope to the handler BODY, not a fixed character window. The first
    // version took 420 chars from the handler start, which ran past its
    // closing brace into the next function and picked up that function's
    // savePartialSession() -- six false failures that read exactly like
    // six real ones.
    const close = s.indexOf("});", i);
    const body  = s.slice(i, close > 0 ? close + 3 : i + 420);
    ok(!/savePartial|logActivity/.test(body),
       "discard path still saves - that is the bug, not the fix");
    ok(/navigate\(["']today["']\)/.test(body),
       "should return Home, not to reflect - there is nothing to reflect on");
  });
}

console.log("\nTEST 3 - it stays the least prominent of the three");
check("styled as the quietest option", () => {
  const css = fs.readFileSync("css/components/session-guard.css", "utf8");
  const rule = css.slice(css.indexOf(".session-exit-discard {"),
                         css.indexOf("}", css.indexOf(".session-exit-discard {")));
  ok(/--color-text-secondary/.test(rule), "should be quieter than 'Exit and save'");
  ok(/border-color: transparent/.test(rule), "should carry no border");
  ok(!/btn-primary/.test(rule), "must never be the primary action");
});
check("save remains the encouraged path", () => {
  for (const v of VIEWS) {
    const s = read(v);
    if (!/exit-confirm-discard/.test(s)) continue;
    ok(s.indexOf("exit-confirm-leave") < s.indexOf("exit-confirm-discard"),
       `${v}: discard appears above save - somebody mid-session would lose work`);
  }
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
