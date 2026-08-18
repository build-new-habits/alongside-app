/**
 * js/auth.js - Tier-Gating Helpers
 *
 * 18 Aug 2026 v2
 *
 * v2 - NAME-1. The paid tier is "the Plan", product-wide. Graeme's
 *   decision, 18 Aug, after Apollo was retired: it carried the
 *   idealised-male-body association that this product exists to refuse,
 *   in a product for people that standard has failed. "Premium" was
 *   rejected for the opposite reason -- it frames free as the deficient
 *   version, when the boundary document has free "complete in itself
 *   and limited in scope".
 *
 * 03 Aug 2026 v1
 *
 * CHANGELOG
 * 03 Aug 2026 v1 - Initial implementation. Confirmed missing 31 Jul while
 *   checking tier-gating status ahead of Supabase auth design (nothing
 *   named isPremium/isAthlete/lockedFeature/auth.js existed anywhere).
 *   A full architecture was scoped 9 May 2026 (S4-TG) but never built.
 *
 * GROUND-TRUTHED AGAINST LIVE CODE BEFORE BUILDING, NOT COPIED BLINDLY
 * FROM THE MAY SPEC — reality has moved on since:
 *
 *   - The May spec assumed a field called `userTier`. The live field,
 *     used by settings.js/progress.js/session-builder-ui.js/upgrade.js/
 *     coach-proposal.js already, is `tier` (store.js default: "free").
 *     This module uses `tier`, matching everything already live —
 *     introducing a second field name would create exactly the kind of
 *     drift this module exists to prevent.
 *
 *   - progress.js ALREADY has real, working, ad-hoc tier gating built
 *     directly into it (30/90-day view lock, export lock via its own
 *     renderExportLocked(), tiered observation depth). It works, it's
 *     tested, and it predates this module. Deliberately NOT retrofitted
 *     to route through here — that would be pure churn on working code
 *     for no functional benefit. Left as-is.
 *
 *   - Several specific features the May audit table wanted gated do not
 *     exist in the live app at all, and gating a feature that doesn't
 *     exist isn't possible: "Coach style variants" was explicitly killed
 *     (settings.js v7, 21 Jul: "Coach style is Nurturing only,
 *     permanently... no other Steady/Energetic/Minimal picker") — do
 *     NOT resurrect this. "Prescribed exercises Level 2+" — no
 *     difficulty-level concept exists anywhere in prescribed.js or
 *     prescribed-session.js. "Custom programme builder" / "Athlete
 *     analytics" — no generative/custom programme engine exists at all
 *     (confirmed separately, 03 Aug website session). "Mindful audio
 *     prompts mid-session" — no such distinct feature found.
 *
 *   - coach-proposal.js's renderBypassDoor(tier) receives an unused
 *     `tier` parameter — found while checking this file, not fixed here.
 *     Original intent unclear; inventing gating behaviour for it without
 *     a documented product decision would be guessing, not building.
 *     Logged on the master schedule instead.
 *
 * WHAT THIS MODULE IS FOR
 * The infrastructure that was genuinely missing: a single, correct place
 * to check tier, and a reusable locked-feature UI pattern for whichever
 * real feature needs it next — rather than every new premium feature
 * reinventing its own inline check and its own locked-state markup.
 *
 * USAGE
 *
 *   import { isPremium, isAthlete, lockedFeature } from "../auth.js";
 *
 *   ${isPremium() ? renderRealFeature() : lockedFeature(renderPreview(), "personal", "30-day charts")}
 *
 * Tapping (or Enter/Space on) a locked-feature wrapper navigates straight
 * to the /upgrade view, which explains tiers and pricing directly — no
 * intermediate toast. The May spec's toast was designed before a real
 * upgrade page existed ("replace with a bottom sheet in the Stripe
 * session"); one now does (built and polished, 03 Aug), so going
 * straight there is simply better UX, not a corner cut.
 */

import { store } from "./store.js";

export function getUserTier() {
  return store.get("tier") || "free";
}

export function isPremium() {
  const tier = getUserTier();
  return tier === "personal" || tier === "athlete";
}

export function isAthlete() {
  return getUserTier() === "athlete";
}

/**
 * Wrap any HTML string with the standard locked-feature UI: dimmed
 * preview underneath, a small tier badge, tap/Enter/Space navigates to
 * /upgrade. The wrapped content itself is inert (pointer-events: none,
 * aria-hidden) — the wrapper is the interactive element, not its contents.
 *
 * @param {string} html    - the feature HTML to show, dimmed, underneath
 * @param {string} tier    - "personal" | "athlete" - which plan unlocks it.
 *                           "personal" renders as "Plan" (NAME-1).
 * @param {string} context - short description for the aria-label, e.g.
 *                            "30-day progress charts". Optional but should
 *                            be included whenever the wrapped feature
 *                            isn't self-explanatory from its own markup.
 */
export function lockedFeature(html, tier = "personal", context = "") {
  // NAME-1, 18 Aug 2026. The paid tier is "the Plan". "Personal" is
  // retired product-wide -- the possessive collision Graeme named ("to
  // you and me that's the tier, but 'that's personal' reads as 'you
  // shouldn't ask me that'"), and it appeared on every locked surface
  // in the product while the tier boundary document said the tier name
  // belongs on the pricing page and the account screen only.
  //
  // "Plan" costs nothing to learn: it is already the word doing the
  // work in every piece of copy written for this boundary. "Free is the
  // session, the Plan is the plan" is the same sentence it always was.
  //
  // The "athlete" branch is UNCHANGED and deliberately so: no call site
  // in js/ passes it -- grepped, not assumed -- so renaming it would be
  // inventing a name for a tier with no surface. 🟠 Open when Athlete
  // gets one.
  const label = tier === "athlete" ? "Athlete" : "Plan";
  const desc  = context ? `${context} — ` : "";
  return `
    <div class="locked-feature-wrap"
         data-route="upgrade"
         data-locked-tier="${tier}"
         role="button"
         tabindex="0"
         aria-label="${desc}part of the ${label} — tap to learn more">
      <div class="locked-feature-inner" aria-hidden="true">
        ${html}
      </div>
      <div class="locked-badge" aria-hidden="true">
        <span class="locked-badge-icon">🔒</span>
        <span class="locked-badge-label">${label}</span>
      </div>
    </div>
  `;
}

let _paywallListenerInitialised = false;

/**
 * Wires a single delegated click/keyboard listener for every
 * .locked-feature-wrap on the page, present or future — call once from
 * app.js at startup. Views using lockedFeature() don't need to wire
 * anything themselves; this is the whole point of a shared component.
 */
export function initPaywallListener() {
  if (_paywallListenerInitialised) return;
  _paywallListenerInitialised = true;

  document.addEventListener("click", (e) => {
    const locked = e.target.closest(".locked-feature-wrap");
    if (!locked) return;
    router.navigate("upgrade");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const locked = e.target.closest(".locked-feature-wrap");
    if (!locked) return;
    e.preventDefault();
    router.navigate("upgrade");
  });
}
