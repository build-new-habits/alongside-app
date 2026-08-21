/**
 * upgrade.js - Upgrade / Membership view
 * 20 Aug 2026 v12
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

import { store }  from "../store.js";
import { router } from "../router.js";
import { PRICE_MONTHLY, PRICE_ANNUAL } from "../data/pricing.js";

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
const STATEMENTS = [
  // onboarding writes strategicGoal.targetDescription/targetDate;
  // my-programme.js renders it. Free never sets one.
  "You tell the coach where you're heading \u2014 a distance, a date, something you want to be able to do again, or just a direction.",
  // gym-programme.js + programmeEngine.js chaptersDone: a completed
  // chapter offers a successor that reasons from where the last one
  // ended. CONT-1 gives movements that recur. This says what those two
  // actually do and does NOT say the sessions get harder -- they do
  // not yet, for anybody.
  "Sessions follow on from one another instead of each starting fresh.",
  // checkin.js + coach-proposal.js: energy, pain, time and feeling word
  // are collected before every session and change what is built.
  // ALSO TRUE ON FREE -- included because it describes the coaching
  // relationship the page is selling, not because it is withheld.
  "The session changes when your day does. Tired, sore, short of time, flat -- you say so, and it adapts.",
  // conditions.js + prescribedExercises: told once, held permanently,
  // never re-asked.
  "It remembers your conditions and injuries, so you never have to say them twice.",
  // programmeEngine.js getReEntryContext() -- REENTRY-2, 20 Aug 2026.
  "If you have been away, it does not start you over. You come back where you left off, gentler if you need it.",
  // progress.js: the free narrative stops after line 1; the 30- and
  // 90-day windows and the type breakdown are the Plan's.
  "Your progress becomes something the coach reads back to you \u2014 what has changed across months, not a list of what you did.",
  // community-impact.js:143 -- "one credit per completed session, two
  // on the Plan".
  "Every session you finish counts double towards where the five percent goes.",
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
];

export function render() {
  const tier   = store.get("tier") || "free";
  const isPaid = tier !== "free";

  // Somebody already on Personal who lands here -- a stale deep link, or
  // the Settings route -- should not be sold to. Acknowledgement and a
  // way back, not a pitch they have already accepted.
  if (isPaid) {
    return `
      <div class="view upgrade-view" role="main" aria-label="Your plan">
        <div class="view-header">
          <button class="btn btn-ghost" data-action="upgrade-back" aria-label="Go back">
            &larr; Back
          </button>
        </div>

        <div class="upgrade-block">
          <h1 class="upgrade-heading">You have a Plan.</h1>
          <p class="upgrade-lede">Everything is open to you. Nothing here needs deciding.</p>
          <p class="upgrade-body">
            Five percent of what you pay goes to causes this community chooses.
          </p>
        </div>

        <div class="upgrade-actions">
          <button class="btn btn-secondary btn-full"
                  data-action="upgrade-settings"
                  aria-label="Go to your plan in Settings">
            Manage your plan
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="view upgrade-view" role="main" aria-label="The Plan">

      <div class="view-header">
        <button class="btn btn-ghost" data-action="upgrade-back" aria-label="Go back">
          &larr; Back
        </button>
      </div>

      <!-- HEADING and OPENING. The doc is explicit that the page leads
           with what she ALREADY has, before it asks her for anything:
           "She is not buying something new. She is going deeper with
           something she already loves." -->
      <header class="upgrade-block">
        <h1 class="upgrade-heading">A coach who knows where you&rsquo;re going.</h1>
        <p class="upgrade-lede">
          Free gives you a coach for today. It meets you where you are, every time.
        </p>
        <p class="upgrade-lede upgrade-lede--emphasis">
          The Plan gives you a coach who also knows where you want to get to,
          and builds towards it.
        </p>
      </section>

      <!-- WHAT CHANGES. Not a feature list, and deliberately not a
           comparison table -- the doc calls for plain statements with
           breathing room, and a table invites counting rather than
           understanding. -->
      <section class="upgrade-block upgrade-block--changes" aria-label="What changes">
        ${STATEMENTS.map(s => `<p class="upgrade-change">${s}</p>`).join("")}
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
        <p class="upgrade-body upgrade-body--emphasis">
          Thirty days before you pay anything.
        </p>
        <p class="upgrade-body">
          Not a penny until day 30. Cancel before then and you are not charged
          at all &mdash; you go back to free and keep everything you have done.
        </p>
        <p class="upgrade-body">No contract either way. Cancel whenever you like.</p>
      </section>

      <!-- What free keeps. Stated plainly and last, because the page
           should not be able to be read as a threat. Every item is
           true as of R4, 20 Aug 2026. -->
      <section class="upgrade-block" aria-label="What stays free">
        <p class="upgrade-body">
          And free stays exactly as it is: every session, every safety feature,
          and choosing what you do. Nothing is taken away.
        </p>
      </section>

      <!-- PRICING. Honest, calm, no pressure. No badge on either option:
           the Design Notes forbid "right choice" framing, so the two
           prices sit as one sentence rather than as competing cards with
           one highlighted. -->
      <section class="upgrade-price-block" aria-label="Price">
        <p class="upgrade-price">${PRICE_MONTHLY} a month. ${PRICE_ANNUAL} for the year.</p>
        <p class="upgrade-price-note">That&rsquo;s it.</p>
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
        <button class="btn btn-primary btn-full btn-large"
                id="upgrade-cta"
                aria-label="Start the Plan">
          I&rsquo;m ready
        </button>

        <p class="upgrade-safety">
          Nothing is lost. All your data stays with your account, whatever
          you decide.
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

  const cta = document.getElementById("upgrade-cta");
  if (!cta) return;

  cta.addEventListener("click", () => {
    // Beta behaviour. Stripe lands in Phase F; until then the button does
    // the thing the button says it does, rather than doing nothing and
    // apologising. She asked for Personal, so she gets Personal.
    //
    // The message is written for somebody already inside a beta, not
    // somebody queuing outside a shop. It states plainly that she has NOT
    // been charged -- leaving that ambiguous after a button labelled
    // "I'm ready" would be the worst thing this page could do.
    store.set("tier", "personal");

    const confirm = document.getElementById("upgrade-confirm");
    if (confirm) {
      // Kept as one unbroken string deliberately. Split across a
      // concatenation, "haven't been charged" never appears contiguously
      // in source, and verify-upg2.mjs -- correctly -- could not confirm
      // the page says it. A gate that cannot read the promise cannot
      // guard it.
      confirm.textContent =
        "You have a Plan. Payment opens when beta ends \u2014 " +
        "you haven\u2019t been charged, and everything is yours to use in the meantime.";
      confirm.classList.add("upgrade-confirm--visible");
    }

    cta.disabled = true;
    cta.textContent = "You\u2019re in";

    // Deliberately not navigating away. The doc's success state is a
    // confirmation announced via aria-live, and a screen reader that is
    // mid-announcement when the route changes loses the message entirely.
    // She leaves when she chooses to.
  });
}
