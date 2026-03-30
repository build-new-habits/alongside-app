/**
 * privacy.js - Privacy Policy and Terms of Service
 *
 * Shell view — content placeholder ready for full policy text.
 * Accessible from the welcome consent screen link and from Settings.
 * Returns to previous view on back tap.
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
          Build New Habits Ltd &middot; Taunton, Somerset &middot; ICO registered
        </p>
      </div>

    </div>
  `;
}

export function onMount() {
  // nothing interactive
}
