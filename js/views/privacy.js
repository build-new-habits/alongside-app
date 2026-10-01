/**
 * privacy.js - Privacy and Terms (in-app summary)
 * 01 Oct 2026 v5
 *
 * v5 - PT-3 TRUE-PRIVACY-WORDS. Every line checked against what the app
 *   does (facts sheet, 30 Sep). Out: "Health conditions" (sore areas since
 *   P0), "our servers" (there are none), "We never store more than we
 *   need" (not provable), "we will notify you" (nothing could). In: where
 *   it is kept (this phone, no account), Sentry and what it carries, the
 *   journal and weight, health answers' own consent, the scope statement,
 *   and every way to download or delete.
 *
 * v4 - SMOOTH-P4c. Your rights say how to use them: access and taking
 *   your data with you are Settings > Download your data (a file of
 *   everything, journal included, made and kept on the device); deleting
 *   is Reset all data. Self-serve, both -- the same wording goes to the
 *   solicitor in the Privacy Policy v4 (12g).
 *
 * v3 - SCOPE-1. Terms name the conditions this app is not designed to
 *   guide exercise for, on the reviewing physiotherapist's advice.
 *
 * 11 Aug 2026 v2
 *
 * v2 — WOW-0. Two factual corrections and a reframe.
 *
 *   CORRECTION 1: the footer said "Build New Habits Ltd". The business is
 *   an unregistered sole trader — there is no limited company. The same
 *   error was fixed on the website on 03 Aug and missed here.
 *
 *   CORRECTION 2: the footer said "ICO registered". It is not. ICO
 *   registration is gated on HMRC sole-trader registration completing
 *   (BIZ-1, still open). Telling users their data is held under an ICO
 *   registration that does not exist is a false statement in the one
 *   screen where accuracy matters most. Removed, not softened.
 *
 *   REFRAME: this screen is now explicitly labelled a SUMMARY, with the
 *   canonical documents on the website. Previously it read as if it were
 *   the policy itself, which meant the consent gate would have been
 *   pointing at a summary while asking people to agree to a document.
 *
 * Reached from the consent gate's "read a summary here" link and from
 * Settings. Returns to previous view on back tap.
 */

import { scopeStatementHTML } from "../data/scope-statement.js";

export const centered = false;

export function render() {
  return `
    <div class="view privacy-view">

      <div class="view-header privacy-header">
        <button class="btn btn-ghost privacy-back-btn" onclick="history.back()"
                aria-label="Go back">Back</button>
        <h1>Privacy &amp; Terms</h1>
      </div>

      <div class="privacy-section card">
        <h2 class="privacy-heading">This is a summary</h2>
        <p class="text-secondary">
          The plain-English version is below so you can see what you agreed to
          without reading a legal document. The full and canonical Privacy Policy
          and Terms of Service live on our website:
        </p>
        <p style="margin-top: var(--space-3);">
          <a href="https://buildnewhabits.co.uk/privacy/"
             style="color: var(--color-primary); text-decoration: underline;"
             target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          &middot;
          <a href="https://buildnewhabits.co.uk/terms/"
             style="color: var(--color-primary); text-decoration: underline;"
             target="_blank" rel="noopener noreferrer">Terms of Service</a>
        </p>
        <p class="text-secondary text-sm" style="margin-top: var(--space-3);">
          Both open in a new tab. If the two ever disagree, the website version is
          the one that counts.
        </p>
      </div>

      <div class="privacy-section card">
        <h2 class="privacy-heading">Where your answers are kept</h2>
        <p class="text-secondary">
          On this phone, in the app&rsquo;s own storage. There is no account and no
          copy on a server. If you delete the app or clear its data, it is gone.
        </p>
        <p class="text-secondary" style="margin-top: var(--space-3);">
          If something in the app breaks, a short error report goes to Sentry, the
          service we use to fix faults, in Frankfurt. It says what broke and on which
          screen, never what you told me. The app itself is delivered from GitHub
          Pages, like any website. Links you tap, such as &ldquo;Watch how to do
          this&rdquo;, open another site.
        </p>
      </div>

      <div class="privacy-section card">
        <h2 class="privacy-heading">What the app keeps</h2>
        <ul class="privacy-list">
          <li>Your name and age group, if you give them, so the coach can talk to you properly</li>
          <li>Your health answers, which you agree to separately: what&rsquo;s sore and how much, your check-ins (energy, mood, and sleep if you add it), so sessions leave out what is likely to make things worse</li>
          <li>What you told me about balance and getting up and down, so sessions are safe for you</li>
          <li>Your weight, only if you turn it on (Settings &rsaquo; Weight tracking). Only you see it</li>
          <li>Your journal. Only you can read it; the coach never reads it</li>
          <li>Your sessions, lifts, saved sessions, equipment and goals, so the coach can build on what you have done</li>
        </ul>
      </div>

      <div class="privacy-section card">
        <h2 class="privacy-heading">What we never do</h2>
        <ul class="privacy-list">
          <li>We never sell your data to anyone</li>
          <li>We never share your data with advertisers</li>
          <li>We never use your data to make decisions about you outside of Alongside</li>
        </ul>
      </div>

      <div class="privacy-section card">
        <h2 class="privacy-heading">Your rights, and how to use them</h2>
        <ul class="privacy-list">
          <li><strong>See it all:</strong> Settings &rsaquo; <strong>Download your data</strong> makes a file of everything the app keeps, your journal included, on this phone</li>
          <li><strong>Correct it:</strong> anything you told me can be changed in Settings</li>
          <li><strong>Delete your health answers:</strong> Settings &rsaquo; <strong>Delete my health answers</strong>. I will ask before keeping any again</li>
          <li><strong>Delete a journal entry:</strong> Wellbeing &rsaquo; Your reflections &rsaquo; Delete</li>
          <li><strong>Delete everything:</strong> Settings &rsaquo; <strong>Reset all data</strong></li>
        </ul>
        <p class="text-secondary text-sm" style="margin-top: var(--space-3);">
          For anything else, write to hello@buildnewhabits.co.uk.
        </p>
      </div>

      <div class="privacy-section card">
        <h2 class="privacy-heading">Terms of Service</h2>
        ${scopeStatementHTML({ heading: "h3", id: "privacy-scope" })}
        <p class="text-secondary" style="margin-top: var(--space-3);">
          Alongside is a movement companion, not a medical service. Its sessions and
          suggestions are general, and not a substitute for professional medical
          advice, diagnosis or treatment.
        </p>
        <p class="text-secondary" style="margin-top: var(--space-3);">
          Alongside is a general movement app. It is not designed for, and should
          not be used to guide exercise for, conditions where individual clinical
          judgement is required — including ME/CFS, long COVID, Ehlers-Danlos
          syndromes and hypermobility spectrum disorders, and pain that is not
          under control. Exercise in these circumstances can make symptoms
          worse, and what is safe differs from person to person in ways a general
          app cannot account for. If this describes you, please seek individual
          guidance from a specialist team or an exercise professional rather than
          relying on this app.
        </p>
        <p class="text-secondary" style="margin-top: var(--space-3);">
          By using Alongside you agree to use it in accordance with these terms. The
          current terms are always the ones on our website.
        </p>
      </div>

      <div class="privacy-section">
        <p class="text-secondary text-sm text-center">
          Questions? Contact us at hello@buildnewhabits.co.uk
        </p>
        <p class="text-secondary text-sm text-center" style="margin-top: var(--space-2);">
          Build New Habits &middot; Somerset, United Kingdom
        </p>
      </div>

    </div>
  `;
}

export function onMount() {
  // nothing interactive
}
