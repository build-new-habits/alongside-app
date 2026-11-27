/**
 * upgrade.js - Upgrade / Membership view
 * 27 Nov 2026 v26
 *
 * v26 - Row 17 Try the Plan, S2 (mock-up v2 approved by Graeme 27 Nov).
 *   The beta's I'm ready (the Plan free with no end) is gone. On Free, the
 *   button is Try the Plan for 14 days (no card; it opens Start your Plan,
 *   Making my Move); after a trial it is Keep the Plan. During a trial the
 *   page says so, until when, and that nothing is charged. Keep the Plan
 *   shows the early price, yearly first, and, until Payments (row 14), Not
 *   open yet: nobody can pay while Alongside is being tested. Manage your
 *   plan is named by its words (its aria-label said something else: axe
 *   label-content-name-mismatch, in a real browser).
 *
 * v25 - P-41 S2 rule 7. In the 16-17 version the Plan is not bought here:
 *   no I'm ready, and a line that a parent or carer can buy a place.
 *   Adults unchanged.
 *
 * 24 Nov 2026 v24
 *
 * v24 - P-46 S4. Log what I did is on Home on Free (the Library is the Plan's).
 *
 * 06 Nov 2026 v23
 *
 * v23 - P-28 S5 (E, said lightly; wording A6 approved 05 Nov). One line
 *   under what the Plan does: "And In Step: short moments after a session
 *   about the people around you. The way I meet you is a way of meeting
 *   others." With In Step's icon. No count, bar or badge for In Step. It
 *   is not one of the Plan's differences (In Step is on both tiers), so it
 *   is a plain line, not an upgrade-change (verify-plan-claims 4a).
 *
 * v22 - STAGE PATH Session 9 (CLOSE; P-12 F5; Graeme, 31 Oct: "‹ Back"). The
 *   Plan's page, You have a Plan.: "‹ Back" (it said "← Back"), no house
 *   beside it, the heading in the Plan's look. Free's page unchanged.
 *
 * 03 Oct 2026 v21
 *
 * v21 - W5-20 TRUE-WORDS-5. Reached from Make it up as I go on Free, the
 *   page says why it is here and that Log what I did, in the Library,
 *   records anything you did (it gave no reason).
 *
 * 03 Oct 2026 v20
 *
 * v20 - W5-17 A11Y-W5. After the tap the button is named You're in, as it
 *   reads (it kept the name I'm ready).
 *
 * 02 Oct 2026 v19
 *
 * v19 - W4-22. After I'm ready, the Settings tab's dot is updated at once (a
 *   message for the Plan showed only on reopen).
 *
 * 02 Oct 2026 v18
 *
 * v18 - W4-20. Five percent is said for when payment starts; in the beta
 *   nobody pays.
 *
 * 02 Oct 2026 v17
 *
 * v17 - W4-18. The button's name begins with its visible words (I'm ready:
 *   start the Plan); it was named Start the Plan only (WCAG 2.5.3).
 *
 * 01 Oct 2026 v16
 *
 * v16 - LEGAL-TRUE. True for the beta: the Plan is free and nobody is
 *   charged; the price and the thirty days are what will apply when
 *   payment starts, with the terms shown and agreed first. "No contract
 *   either way" was not true (the Terms are a contract): "No minimum term."
 *
 * v15 - PT-3. "All your data stays with your account": there are no
 *   accounts. Now: it stays on this phone, whatever you decide.
 *
 * v14 - F7 LANDMARK. role="main" (and its label) removed from the view's
 *   wrapper: index.html's <main> is the one main landmark; a second,
 *   nested inside it, is announced twice and fails landmark rules.
 *
 * v13 - SMOOTH-P5. The statements come from js/data/tier-table.js, the
 *   one table Free and the Plan are described by (spec 4.11): what the
 *   Plan adds is every row that differs, in that row's own words, and
 *   what free keeps is every row that is the same. The page cannot say
 *   something the table does not, and verify-plan-claims drives the app
 *   to prove every row. The seven hand-written statements (and their
 *   per-line proofs) are replaced; two of them described things free has
 *   too ("the session changes when your day does", "it remembers your
 *   conditions") and now sit where they belong -- in what free keeps.
 *
 * v12 - PLAIN-2. Three statements added, all verified against the live
 *   build and each naming the file that makes it true. Two of the seven
 *   drafted are deliberately ABSENT: the gear change and R1 are both
 *   unbuilt, and R1 is the best line this product has. They go up the
 *   day they ship, not before -- the same discipline v6 recorded when it
 *   withdrew a statement on the morning it was written.
 *
 * 20 Aug 2026 v11
 *
 * v11 - PLAIN-1. THE PAGE WAS SELLING SOMETHING THE PRODUCT GIVES AWAY.
 *
 *   Statement 1 read "Your sessions become yours -- the kind, the
 *   length, and how the time is spent." That was TRUE at 09:00 and
 *   FALSE by 11:00: R4 moved session type, duration and the allocation
 *   split to free the same morning. The most-visited conversion surface
 *   in the app spent the afternoon advertising the free tier.
 *
 *   THE LESSON, which is the twin of the one in v6's withdrawn
 *   statement: that note says a tier check does not prove the feature
 *   exists. This one says a TRUE statement does not stay true. Copy
 *   asserting a tier boundary has to be re-read whenever the boundary
 *   moves, and nothing in the gate suite was watching this file.
 *   verify-plain1.mjs now does.
 *
 *   Statement 3 said the programme builds "week on week, phase by
 *   phase". Progression does not exist -- ground-truthed 20 Aug, see
 *   alongside_progression_boundary_20aug2026_v1.md. Rewritten to what
 *   the chapter engine actually does: sessions that follow on from one
 *   another, which is CONT-1 and is real.
 *
 *   Graeme, 20 Aug: the page was too abstract. "Ready to go deeper",
 *   "the coach more to work with", "the deeper the relationship" --
 *   somebody deciding whether to spend sixty pounds cannot act on any
 *   of it. Rewritten in plain language, still warm, still not a
 *   feature table.
 *
 *   THE TRIAL IS NOW ON THE PAGE. Thirty days, no charge, cancel and
 *   keep everything -- the strongest thing in the offer and it appeared
 *   on neither this page nor Settings.
 *
 *   R1 IS DELIBERATELY NOT MENTIONED. "The coach tells you when you
 *   will not reach your target" is the best line this product has and
 *   it has zero lines of code. It goes on the page the day it ships.
 *
 * 18 Aug 2026 v10
 *
 * v10 - PRICE-3. The two price constants moved to js/data/pricing.js
 *   and imported. settings.js now imports the same ones, so the
 *   number exists once in the app rather than twice.
 *
 *
 * v9 - PRICE-2. Annual is £59.99, not £49.99, from launch. £7.99 × 12
 *   is £95.88, so £49.99 discounted the annual by 48% -- and every
 *   price set now is set PERMANENTLY for the launch cohort, because
 *   nobody's rate ever rises. £59.99 is still 37% off and is exactly
 *   £5 a month, which is a line somebody says out loud.
 *
 *   The "yearly rate holds until..." sentence is GONE with
 *   ANNUAL_LIMIT: Year 2 pricing is deferred to Year 2, so nothing
 *   expires. See the constant for why the old window was unreachable.
 *
 * 18 Aug 2026 v8
 *
 * v8 - IMPACT-COLOUR. The five-percent block carries
 *   .upgrade-body--impact (teal). Class only; no copy change.
 *
 * 18 Aug 2026 v7
 *
 * v7 - NAME-1. The paid tier is "the Plan", not "Personal".
 *   Graeme's decision, 18 Aug. Copy only -- no logic, no gating
 *   and no tier boundary moved. Reasoning in js/auth.js v2.
 *
 * 13 Aug 2026 v6
 *
 * A2. The real page, replacing the 22 May stub.
 *
 * WHY THIS MATTERED MORE THAN ANYTHING ELSE IN THE BLUEPRINT. Every
 * locked surface in the product routes here -- six session types, three
 * durations, the 90-day progress tab, the export block, the In Step
 * door. auth.js's lockedFeature() sets data-route="upgrade" and
 * initPaywallListener() navigates on click or Enter/Space. So this is
 * the most-visited conversion surface in the app, and until today it was
 * 63 lines saying "subscriptions are coming soon" followed by an
 * instruction to triple-tap the version number.
 *
 * THE COPY IS NOT MINE AND MUST NOT BE REWRITTEN. Every line below is
 * from alongside_upgrade_page_architecture_09jul2026_v1.md, which is
 * marked "Confirmed and Locked". Graeme wrote it. A build session
 * paraphrasing it would lose the voice, and the voice is the product.
 * The order is load-bearing too: the doc answers commitment and cost
 * BEFORE the rational questions, "because commitment and cost are
 * emotional and arrive before the rational questions".
 *
 * ── WHERE I DEPARTED FROM THE DOC, AND WHY ──────────────────────────
 *
 * The doc's "WHAT CHANGES" section has four statements. Two of them
 * describe things the free tier already has, checked against live code
 * on 13 Aug rather than assumed:
 *
 *   "Your exercise library opens fully -- every movement available"
 *   -> There is no tier gate on the exercise database anywhere. grep for
 *      isPremium() across js/ returns session-builder-ui.js, in-step.js
 *      and settings.js only. Difficulty is capped by the CAPABILITY
 *      screen, not by tier. A free user already has every movement they
 *      can safely perform.
 *
 *   "Your programme builds -- week on week, phase by phase"
 *   -> gym-programme.js and data/programmeEngine.js contain no tier
 *      check at all, and library.js offers "My programme" to everybody.
 *      Free reaches the full twelve-week engine today. Logged as open
 *      decision D-2 on the master schedule; it is Graeme's to make.
 *
 * Printing either statement on a page somebody pays from would be a
 * promise the product does not keep -- a trust problem first and a
 * consumer-law problem second. So this ships the two statements that are
 * true, plus a third that is true and was not in the doc (the long
 * wellbeing arc, genuinely gated in in-step.js), and leaves the fourth
 * slot empty rather than filling it.
 *
 * SECOND UPDATE, same day. The third statement -- about the long
 * wellbeing practices -- has been WITHDRAWN. It described a feature
 * that does not exist. See the note in STATEMENTS below; the short
 * version is that I verified a tier check rather than a feature, and a
 * tier check only proves somebody is being refused something.
 *
 * Three statements again, all three true.
 *
 * UPDATE, same day. TIER-C shipped and gated the programme engine, so
 * "Your programme builds" is now true and has been restored. TIER-D
 * settled the other one the opposite way: the exercise database is
 * deliberately NEVER tier-gated, because capability already decides what
 * somebody gets -- by what is safe for them, not by what they have paid.
 * That statement stays retired permanently, and the line asserting it
 * should be removed from the 09 Jul architecture doc rather than built.
 *
 * Four statements again, as the architecture intended, all four true.
 *
 * ── THE TRANSACTION ─────────────────────────────────────────────────
 *
 * Stripe is not live (blocked on Supabase, blocked on Appendix A
 * triage). Graeme: imagine it's fully functional. So the page reads as a
 * real product page top to bottom -- the price is stated, the plan is
 * explained, the button works -- and exactly one line says the payment
 * step isn't open yet. Deliberately NOT "coming soon": that reads as a
 * broken feature, and this is a beta participant already inside
 * something, not somebody waiting outside it.
 *
 * ── WHAT THIS PAGE DOES NOT DO ──────────────────────────────────────
 *
 * No RECOMMENDED badge on either price. No countdown. No urgency. No
 * social proof numbers. All four are named in the doc's Design Notes and
 * all four are the standard moves this product refuses. The annual rate
 * IS time-limited and says so -- an honest limit stated upfront is not
 * an urgency mechanic, it is the opposite of one.
 *
 * P2: this is the helper layer, not the coach. The page never speaks in
 * the coach's voice and carries no card-coach block, because P1 says the
 * coach never sells.
 *
 * ── ACCESSIBILITY ───────────────────────────────────────────────────
 *
 * WCAG 2.2 AA. Nothing on this page means anything by colour alone: the
 * price is text, the plan name is text, the tier is text. Gold as TEXT
 * was tried in settings.css v7 and failed AA on the card surface at
 * 3.68:1, so it is not repeated -- see upgrade-page.css for where the
 * gold signal sits instead. Confirmation is announced via
 * aria-live="polite" rather than the form silently vanishing.
 *
 * 22 May 2026 v1 --- Stub to prevent 404.
 */

import { updateNavDot } from "../data/messages.js";
import { canBuy, BUY_YOUNG_LINE } from "../data/age-version.js";
import { store }  from "../store.js";
import { router } from "../router.js";
import { PRICE_MONTHLY, PRICE_ANNUAL, PRICE_EARLY_ANNUAL, PRICE_EARLY_MONTHLY_EQUIV } from "../data/pricing.js";
import { canStartTrial, startTrial, trialActive, trialEnded, endsOnWords } from "../data/plan-trial.js";
import { PLAN_ADDS, FREE_KEEPS } from "../data/tier-table.js";
import { PURPOSE_LINES } from "../data/empathy-transfer.js";
import { lineIcon } from "../data/line-icons.js";

export const centered = false;

// Source: alongside_pricing_model_20jun2026_v2.docx section 1,
// "Confirmed Pricing Structure". Confirmed by Graeme 13 Aug 2026 against
// three documents that disagreed -- the March business plan and the live
// website both still say GBP 9.99/89, logged as WEB-PRICE. Constants so
// the number exists in ONE place: a price duplicated across a page is a
// price that ends up wrong in one of them.
// PRICE-3, 18 Aug 2026. Moved to js/data/pricing.js so the number lives
// in exactly one place across the whole app. See that file for why it is
// not exported from here and not fetched from the website.
// PRICE-2, 18 Aug 2026. ANNUAL_LIMIT is retired. The old copy said the
// yearly rate "holds until the end of November 2026" -- a window that
// closed BEFORE the soft launch (first week of December) and two months
// before public launch, so £49.99 was a price nobody could ever pay.
// Graeme's decision: £59.99 is simply the annual price from launch, and
// Year 2 is deferred to Year 2. Nothing expires, so there is nothing to
// count down to -- which suits a page whose whole design forbids
// urgency.

// The doc: "Four statements. Not bullet points. Stacked with breathing
// room between each." Three ship today -- see the header note on why the
// other two were withheld. Each was checked against a live tier gate
// before being written here.
// PLAIN-1, 20 Aug 2026. EVERY STATEMENT BELOW WAS CHECKED AGAINST THE
// LIVE BUILD TODAY, not against a document. Each carries the file that
// makes it true. If a statement cannot name one, it does not ship.
// PLAIN-2, 20 Aug 2026. Graeme: people scan before they read, and the
// page must not assume knowledge. Each statement is now a plain claim a
// stranger can act on, with no unexplained "it" and no example that
// needs local knowledge to parse.
//
// SEVEN WERE DRAFTED. TWO ARE NOT HERE:
//   "It reflects back what's changed" -- the gear change, unbuilt.
//   "If your target stops being realistic it says so" -- R1, unbuilt,
//     and the best line this product has. It goes up the day it ships.
// Both stay in the marketing narrative. Neither goes on a page that
// takes money until it is true.
// SMOOTH-P5. The table's differing rows, in their own words.
const STATEMENTS = PLAN_ADDS;

// The history below is kept: it is why the table exists.
  // WITHDRAWN 13 Aug 2026, same day it shipped. This said:
  //
  //   "And the long practices open up — the ones that go somewhere over
  //    months, shaped around what you're actually noticing rather than a
  //    fixed course."
  //
  // It is not true. isPremium() appears in in-step.js exactly ONCE, and
  // only to decide whether to render the upgrade door. A Personal user
  // gets nothing extra in In Step -- the long arc the door describes is
  // the Destination Architecture's four mind destinations (Steadiness,
  // Restoration, Presence, Connection) and NONE of them are built. grep
  // for any of those names across js/ returns comments only.
  //
  // I wrote this statement this morning while removing two others for
  // exactly this fault, and I checked the wrong thing: in-step.js
  // contained isPremium(), so I took the feature as gated. What was
  // gated was the advert for it.
  //
  // The lesson, and it generalises: a tier check proves somebody is
  // being REFUSED something. It does not prove the something exists.
  // Verify the feature, never the gate.
  //
  // Goes back in when the mind destinations ship, alongside P11 in
  // personal-reads.js, which is waiting on the same thing.


/** Row 17. Keep the Plan: the early price, and, until Payments, Not open yet. */
function renderKeep() {
  const during = trialActive();
  return `
    <div class="view upgrade-view upgrade-keep">
      <div class="view-header">
        <button class="btn btn-ghost" data-action="keep-back" aria-label="Go back">&larr; Back</button>
      </div>
      <header class="upgrade-block">
        <p class="upgrade-eyebrow">Early price</p>
        <h1 class="upgrade-heading" tabindex="-1">Keep the Plan</h1>
      </header>
      <section class="upgrade-block upgrade-keep__prices" aria-label="Price">
        <div class="card upgrade-keep__card">
          <p class="upgrade-keep__price">${PRICE_EARLY_ANNUAL} a year</p>
          <p class="upgrade-body">About ${PRICE_EARLY_MONTHLY_EQUIV} a month. The early price, for anyone who joins in the first three months. It stays yours while you keep the Plan.</p>
        </div>
        <div class="card upgrade-keep__card">
          <p class="upgrade-keep__price">Or ${PRICE_MONTHLY} a month</p>
          <p class="upgrade-body">Stop any time.</p>
        </div>
      </section>
      <section class="card upgrade-keep__card upgrade-keep__notyet" id="keep-not-yet" aria-labelledby="keep-not-yet-h">
        <h2 class="upgrade-keep__price" id="keep-not-yet-h">Not open yet</h2>
        <p class="upgrade-body">${during
          ? `Alongside is still being tested, so nobody can pay yet. You\u2019re on the Plan until ${endsOnWords()}, then Free, with everything saved.`
          : "Alongside is still being tested, so nobody can pay yet. You\u2019re on Free, with everything saved."}</p>
      </section>
      <div class="upgrade-actions">
        <button class="btn btn-secondary btn-full" data-action="keep-home">Back to Home</button>
      </div>
    </div>`;
}

export function render() {
  // Asked for by Home's notice or Settings (router.upgradeStage), once.
  if (typeof window !== "undefined" && window.router?.upgradeStage === "keep") { window.router.upgradeStage = null; return renderKeep(); }
  const tier   = store.get("tier") || "free";
  const isPaid = tier !== "free";

  // Row 17. During a Plan trial: what it is, until when, nothing charged.
  if (isPaid && trialActive()) {
    return `
      <div class="view upgrade-view is-plan">
        <div class="view-header">
          <button class="btn btn-ghost plan-back" data-action="upgrade-back" aria-label="Go back">‹ Back</button>
        </div>
        <div class="upgrade-block">
          <h1 class="upgrade-heading">You&rsquo;re trying the Plan.</h1>
          <p class="upgrade-lede" id="upg-trial-until">Free until ${endsOnWords()}. Nothing is charged.</p>
          <p class="upgrade-body">When it ends, you go back to Free, and everything you&rsquo;ve made is kept.</p>
        </div>
        <div class="upgrade-actions">
          <button class="btn btn-primary btn-full" id="upgrade-keep">Keep the Plan</button>
          <button class="btn btn-secondary btn-full" data-action="upgrade-settings">Manage your plan</button>
        </div>
      </div>
    `;
  }

  // Somebody already on Personal who lands here -- a stale deep link, or
  // the Settings route -- should not be sold to. Acknowledgement and a
  // way back, not a pitch they have already accepted.
  if (isPaid) {
    return `
      <div class="view upgrade-view is-plan">
        <div class="view-header">
          <button class="btn btn-ghost plan-back" data-action="upgrade-back" aria-label="Go back">‹ Back</button>
        </div>

        <div class="upgrade-block">
          <h1 class="upgrade-heading">You have a Plan.</h1>
          <p class="upgrade-lede">Everything is open to you. Nothing here needs deciding.</p>
          <p class="upgrade-body">
            When payment starts, five percent of what you pay will go to causes this
            community chooses. In the beta you pay nothing.
          </p>
        </div>

        <div class="upgrade-actions">
          <button class="btn btn-secondary btn-full"
                  data-action="upgrade-settings">
            Manage your plan
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="view upgrade-view">

      <div class="view-header">
        <button class="btn btn-ghost" data-action="upgrade-back" aria-label="Go back">
          &larr; Back
        </button>
      </div>

      <!-- HEADING and OPENING. The doc is explicit that the page leads
           with what she ALREADY has, before it asks her for anything:
           "She is not buying something new. She is going deeper with
           something she already loves." -->
      ${(typeof window !== "undefined" && window.router?.redirectReason === "capture") ? `
      <p class="upgrade-body" role="status">
        Make it up as I go is part of the Plan, so it brought you here. On Free,
        Log what I did, on Home, records anything you did.
      </p>` : ""}
      <header class="upgrade-block">
        <h1 class="upgrade-heading">A coach who knows where you&rsquo;re going.</h1>
        <p class="upgrade-lede">
          Free gives you a coach for today. It meets you where you are, every time.
        </p>
        <p class="upgrade-lede upgrade-lede--emphasis">
          The Plan gives you a coach who also knows where you want to get to,
          and builds towards it.
        </p>
      </header>

      <!-- WHAT CHANGES. Not a feature list, and deliberately not a
           comparison table -- the doc calls for plain statements with
           breathing room, and a table invites counting rather than
           understanding. -->
      <section class="upgrade-block upgrade-block--changes" aria-label="What changes">
        ${STATEMENTS.map(s => `<p class="upgrade-change">${s}</p>`).join("")}
        <p class="upgrade-body instep-purpose" id="upg-instep"><span class="instep-eyebrow" aria-hidden="true">${lineIcon("instep", 18)}</span>${PURPOSE_LINES.planPage}</p>
      </section>

      <!-- COMMITMENT, answered before she asks. First, because the doc
           puts commitment ahead of cost. -->
      <!-- PLAIN-1. "This isn't a commitment to us, it's a commitment to
           yourself" is gone. Graeme, 20 Aug, rejecting gift-framing in
           the trial copy: state the facts and do the person no favours.
           That line put the obligation back on the reader, which is the
           opposite of what it sounded like it was doing.

           The trial appears here for the first time. It was on neither
           this page nor Settings, and it is the strongest thing in the
           offer. Deliberately WITHOUT any comparison to the statutory
           cancellation period -- see the progression boundary section 9
           and the note for Natalie. -->
      <section class="upgrade-block" aria-label="Commitment">
        <p class="upgrade-body upgrade-body--emphasis" id="upg-trial-line">
          ${trialEnded()
            ? "Your trial has ended. Your own Home is saved, if you come back."
            : "Try the Plan for 14 days. No card, and nothing is charged, then or after."}
        </p>
        <p class="upgrade-body">
          When payment starts, there will be thirty days before you pay anything,
          and you can cancel before then without being charged. I&rsquo;ll show you
          the payment terms and ask you to agree to them first.
        </p>
        <p class="upgrade-body">No minimum term. Cancel whenever you like.</p>
      </section>

      <!-- What free keeps. Stated plainly and last, because the page
           should not be able to be read as a threat. Every item is
           true as of R4, 20 Aug 2026. -->
      <section class="upgrade-block" aria-label="What stays free">
        <p class="upgrade-body">
          And free stays exactly as it is. Nothing is taken away. These are the
          same on both, and always will be:
        </p>
        <ul class="upgrade-keeps">
          ${FREE_KEEPS.map(r => `<li><strong>${r.area}.</strong> ${r.free}.</li>`).join("")}
        </ul>
      </section>

      <!-- PRICING. Honest, calm, no pressure. No badge on either option:
           the Design Notes forbid "right choice" framing, so the two
           prices sit as one sentence rather than as competing cards with
           one highlighted. -->
      <section class="upgrade-price-block" aria-label="Price">
        <p class="upgrade-price">${PRICE_MONTHLY} a month. ${PRICE_ANNUAL} for the year.</p>
        <p class="upgrade-price-note">When payment starts. Free during the beta.</p>
      </section>

      <section class="upgrade-block" aria-label="Where the money goes">
        <p class="upgrade-body upgrade-body--impact">
          And five percent of everything you pay goes to causes our
          community chooses.
        </p>
        <p class="upgrade-body upgrade-body--impact">Your subscription does more than you might think.</p>
      </section>

      <!-- THE BUTTON. "I'm ready" echoes the home page CTA -- the doc:
           "she has said this before. It feels familiar." -->
      <div class="upgrade-actions">
        ${canBuy() ? `<button class="btn btn-primary btn-full btn-large"
                id="upgrade-cta">
          ${canStartTrial() ? "Try the Plan for 14 days" : "Keep the Plan"}
        </button>` : `<p class="upgrade-body" id="upgrade-young">${BUY_YOUNG_LINE}</p>`}

        <p class="upgrade-safety">
          Nothing is lost. Everything you have done stays on this phone,
          whatever you decide.
        </p>
      </div>

      <p class="upgrade-confirm" id="upgrade-confirm" role="status" aria-live="polite"></p>

    </div>
  `;
}

export function onMount() {
  document.querySelector("[data-action='upgrade-back']")
    ?.addEventListener("click", () => router.back());

  document.querySelector("[data-action='upgrade-settings']")
    ?.addEventListener("click", () => router.navigate("settings"));

  // Row 17. Keep the Plan (the early price) and its way back.
  const showKeep = () => {
    const main = document.getElementById("main-content");
    if (main) { main.innerHTML = renderKeep(); onMount(); main.querySelector("h1")?.focus(); }
  };
  document.getElementById("upgrade-keep")?.addEventListener("click", showKeep);
  document.querySelector("[data-action='keep-back']")?.addEventListener("click", () => router.back());
  document.querySelector("[data-action='keep-home']")?.addEventListener("click", () => router.navigate("today"));

  const cta = document.getElementById("upgrade-cta");
  if (!cta) return;

  cta.addEventListener("click", () => {
    // Row 17 (27 Nov). The beta's I'm ready gave the Plan with no end; now
    // the button is the trial: 14 days, no card, then Free with everything
    // kept. After a trial it is Keep the Plan (the early price).
    if (!canStartTrial()) { showKeep(); return; }
    startTrial();
    updateNavDot();   // W4-22: a message for the Plan shows its dot now, not on reopen
    router.navigate("my-move");   // Start your Plan (Making my Move, P-39)
  });
}
