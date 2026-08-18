/**
 * tools/verify-upg2.mjs
 * 13 Aug 2026 v1
 *
 * A2 GATE — the upgrade page is a real page.
 *
 * WHY THIS EXISTS. Until 13 Aug 2026 js/views/upgrade.js was a 63-line
 * stub reading "Subscriptions are coming soon... triple-tap the version
 * number at the bottom of Settings." Every locked surface in the product
 * routes here, so the most-visited conversion surface in the app both
 * failed to state a price and published the tier bypass.
 *
 * It sat that way from 22 May to 13 Aug -- nearly three months -- and
 * nothing failed, because a stub renders perfectly. That is the same
 * shape as every defect the 12 Aug session found: correct code, working
 * screen, wrong product. So it gets a gate rather than a note.
 */
import fs from "node:fs";

const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "")
                    .replace(/<!--[\s\S]*?-->/g, "")
                    .replace(/^\s*\/\/[^\n]*$/gm, "");
const read = f => strip(fs.readFileSync(f, "utf8"));

let fails = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (e) { fails++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
};
const ok = (c, m) => { if (!c) throw new Error(m); };

const view = read("js/views/upgrade.js");
const css  = fs.readFileSync("css/components/upgrade-page.css", "utf8");
const main = fs.readFileSync("css/main.css", "utf8");
const sw   = fs.readFileSync("sw.js", "utf8");

console.log("\nA2 — the page states a price and asks for a decision");

check("a price appears in rendered copy", () => {
  ok(/\\u00A3|£/.test(view), "no currency symbol anywhere in the view");
  // 18 Aug 2026 (PRICE-2). Annual is 59.99 from launch; 49.99 was a
  // window that closed before the soft launch and was unreachable by
  // anyone. Deliberately hardcoded -- a price gate that reads the
  // price out of the file it is checking asserts nothing.
  ok(/7\.99/.test(view) && /59\.99/.test(view),
     "the confirmed prices (7.99 monthly, 59.99 annual) are not both present");
});

check("the page never says 'coming soon'", () => {
  ok(!/coming soon/i.test(view),
     "'coming soon' reads as a broken feature. The payment step may be " +
     "described as not yet open; the PLAN never is");
});

check("there is a call to action", () => {
  ok(/id="upgrade-cta"/.test(view), "no CTA button — the page cannot convert");
  ok(/addEventListener\("click"/.test(view), "the CTA is not wired to anything");
});

check("the CTA is honest about payment", () => {
  // A button labelled "I'm ready" that changes tier without saying
  // whether money moved is the single worst thing this page could do.
  ok(/haven\\u2019t been charged|have not been charged|haven't been charged/.test(view),
     "the confirmation does not state that no payment was taken");
});

check("no statement describes an unbuilt feature", () => {
  // 13 Aug 2026. Added after shipping a statement about "long practices
  // that go somewhere over months" on the strength of in-step.js
  // containing isPremium(). What that gate protected was the ADVERT for
  // the feature, not the feature -- a Personal user gets nothing extra
  // in In Step, and the mind destinations it described are unbuilt.
  //
  // A tier check proves somebody is being REFUSED something. It does not
  // prove the something exists. This checks the feature side.
  const claims = [
    [/long practices|over months|mind destination/i, "Steadiness|Restoration|Presence|Connection",
     "the long wellbeing arc (Destination Architecture mind destinations)"],
    [/exercise library opens|every movement available/i, null,
     "an exercise-library tier gate — deliberately never built, see TIER-D"]
  ];
  const js = fs.readFileSync("js/session-builder.js", "utf8") +
             fs.readFileSync("js/views/in-step.js", "utf8");
  for (const [claim, evidence, label] of claims) {
    if (!claim.test(view)) continue;
    ok(evidence && new RegExp(evidence).test(js),
       `the page claims ${label}, and nothing in the codebase implements it. ` +
       "Verify the feature, never the gate");
  }
});

console.log("\nA2 — no urgency mechanics (Design Notes, 09 Jul 2026)");

check("no countdown, badge or social proof", () => {
  for (const banned of [/countdown/i, /recommended/i, /most popular/i,
                        /only \d+ left/i, /join \d[\d,]* (people|others)/i]) {
    ok(!banned.test(view), `urgency or social-proof framing found: ${banned}`);
  }
});

console.log("\nA2 — accessibility and wiring");

check("the confirmation is announced, not silent", () =>
  ok(/aria-live="polite"/.test(view),
     "a success state that only appears visually is invisible to a screen reader"));

check("gold is never used as text on this page", () => {
  // Measured 13 Aug: #B8970A as text is 3.68:1 on --color-bg-card and
  // 3.09:1 on --color-bg-hover. Both below AA. It clears only as a
  // background with dark text, or as a non-text border.
  const textGold = /color:\s*#B8970A/i.test(css);
  ok(!textGold,
     "#B8970A is set as a text colour — it fails WCAG AA on this product's " +
     "card surfaces. Use it as a border or background, never as text");
});

check("the stylesheet is imported and precached", () => {
  ok(/upgrade-page\.css/.test(main), "not imported in css/main.css — renders unstyled");
  ok(/css\/components\/upgrade-page\.css/.test(sw),
     "not in sw.js precache — first offline load renders unstyled");
});

// 18 Aug 2026 (NAME-1). This asserted the literal marketing sentence
// "You're on Personal", so a pure copy rename turned it red while the
// behaviour it names -- a paid user is not sold to -- was untouched.
// Second gate in one day to fail on a property it was not testing.
//
// Rewritten to test the actual property: the paid branch exists, and it
// renders NO price and NO buy button. That is what "not sold to" means,
// and it survives any rewording of the acknowledgement.
check("a paid user is not sold to", () => {
  ok(/isPaid/.test(view), "the page has no separate state for a paying user");
  const paidBranch = view.slice(view.indexOf("if (isPaid) {"),
                               view.indexOf("if (isPaid) {") + 1400);
  ok(paidBranch.length > 0, "could not locate the isPaid branch");
  ok(!/PRICE_MONTHLY|PRICE_ANNUAL|\u00A3\d/.test(paidBranch),
     "the paid branch quotes a price at somebody who already pays");
  ok(!/id="upgrade-cta"/.test(paidBranch),
     "the paid branch shows the buy button");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
