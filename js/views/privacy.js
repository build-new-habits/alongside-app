/**
 * privacy.js - Privacy and Terms (in-app summary)
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
        <h2 class="privacy-heading">Your data and how we use it</h2>
        <p class="text-secondary">
          Alongside is built on a simple principle: your data exists to help you,
          not to help us. Here is exactly what we collect and why.
        </p>
      </div>

      <div class="privacy-section card">
        <h2 class="privacy-heading">What we collect</h2>
        <ul class="privacy-list">
          <li>Your name and age group — so the coach can address you personally and tailor sessions appropriately</li>
          <li>Health conditions and pain levels — so sessions are safe and adapted for your body</li>
          <li>Daily check-in data (energy, mood, pain) — so the coach responds to how you feel today, not how you felt last week</li>
          <li>Session history — so the coach can notice patterns and improve over time</li>
          <li>Equipment and goals — so sessions are practical and relevant</li>
        </ul>
      </div>

      <div class="privacy-section card">
        <h2 class="privacy-heading">What we never do</h2>
        <ul class="privacy-list">
          <li>We never sell your data to anyone</li>
          <li>We never share your data with advertisers</li>
          <li>We never use your data to make decisions about you outside of Alongside</li>
          <li>We never store more than we need</li>
        </ul>
      </div>

      <div class="privacy-section card">
        <h2 class="privacy-heading">Your rights</h2>
        <p class="text-secondary">
          You have the right to access, correct, or delete your data at any time.
          You can reset the app entirely from Settings, which removes all your data
          from your device. Once cloud backup is available, full account deletion
          will remove your data from our servers within 30 days.
        </p>
      </div>

      <div class="privacy-section card">
        <h2 class="privacy-heading">Terms of Service</h2>
        <p class="text-secondary">
          Alongside is a movement companion, not a medical service. The sessions
          and suggestions provided are for general wellness purposes only and are
          not a substitute for professional medical advice, diagnosis, or treatment.
          If you have a medical condition, please consult a qualified professional
          before beginning any exercise programme.
        </p>
        <p class="text-secondary" style="margin-top: var(--space-3);">
          By using Alongside you agree to use it in accordance with these terms.
          We reserve the right to update these terms — we will notify you of any
          significant changes.
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
