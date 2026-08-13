/**
 * coach-proposal.js
 * 13 Aug 2026 v20
 *
 * v20 - C1. The severe-pain choice line names the limit. It previously
 *   acknowledged the flag and offered two options, never once saying
 *   what the coach cannot do -- which quietly implies it can do
 *   everything on the list. External help is offered, never presumed.
 *   No crisis language: this is a painful joint, not a safeguarding
 *   flag, and reaching for crisis wording here would blunt it where it
 *   is actually needed.
 *
 * 04 Aug 2026 v19
 *
 * v19 — Real regression fix, found via screenshot: the session-options
 *   panel auto-opened by Phase C (v18) is a full-screen fixed overlay
 *   (z-index 9999) — Graeme reached this screen and completely missed
 *   the flagged condition message sitting right behind it, covered
 *   before he could read it. Coach message content (greeting/
 *   reflection/constraint) now renders INSIDE the panel when it's
 *   open, not just underneath it. Same latent bug also existed for
 *   the re-entry banner and missed-session offer — auto-open is now
 *   gated on both being resolved first (mount() no longer opens the
 *   panel while either is pending; handleReturnContext()/
 *   handleMissedAdaptation() open it themselves once resolved,
 *   checking the other banner isn't also still pending).
 *
 * 04 Aug 2026 v18
 *
 * v18 — Phase C, Home Nav & Conditions Redesign (blueprint
 *   alongside_blueprint_home-navigation-conditions_04aug2026_v1.md,
 *   Section 0.1 decision: reduce, don't retire). This screen is now
 *   only reached via Home's "Unsure? Coach decides" door. Removed
 *   entirely: DOOR_COPY, renderDoorFront(), renderBypassDoor(),
 *   handleDoorChoice(), _buildAcknowledgement() (its only caller),
 *   openPreviewPanel() (its only caller was the now-removed door-1
 *   button — panel open is set directly in mount() instead). The
 *   three-doors-plus-bypass markup is gone from render(); the session-
 *   options panel (previously "door-1", opened by a tap) now opens
 *   automatically as part of the first render — no second choice on
 *   top of the choice already made by tapping "Unsure? Coach decides"
 *   from Home. handleReturnContext() updated to do a full re-render
 *   instead of patching the now-gone .cp-doors element.
 *   closePreviewPanel() ("Not today"/backdrop/close) now navigates
 *   back to Home instead of leaving an empty coach message with
 *   nothing actionable underneath — there's no doors screen to fall
 *   back to any more. Unused voice/name/tier variables in render()
 *   removed (dead since the door markup that used them is gone).
 *   coach-proposal.css v6->v7 in the same pass: .cp-door and .cp-bypass
 *   rule sets removed, confirmed unused.
 *
 * 04 Aug 2026 v17
 *
 * v17 — Severe pain: active Rest/Adapt choice, Graeme's proposal
 *   directly. Previously Severe conditions were narrated but the app
 *   silently decided what happened next (same acute-tier filtering as
 *   any other exercise exclusion). Now: when Severe pain is present and
 *   no choice has been recorded yet today for that exact condition set,
 *   the coach asks directly — "I can adapt around it, or we can call
 *   today a rest day — what would you like to do?" — and nothing else
 *   renders (no doors, no options) until the person actively answers.
 *   The choice is recorded via store.recordSeverePainChoice() (new,
 *   store.js v13) — a genuine audit-trail entry, not just a UI state,
 *   which is the actual point: an offered-and-actively-chosen record is
 *   what gives the "we suggested rest" framing real weight, not the
 *   prompt alone. "Rest" routes to a gentle Wellbeing-or-done screen,
 *   no session generated. "Adapt" proceeds to the normal proposal,
 *   still narrating the Severe condition via the existing
 *   _buildConditionNarrative() as confirmation of what was chosen.
 *   Cleanup in the same pass: _checkSeverePain()/severePainOverride
 *   removed entirely — dead weight now genuinely superseded by real
 *   handling, not just theoretically unused as before.
 *   NOTE, not decided by Claude: whether this interaction pattern
 *   actually reduces legal liability is a real legal question, not a
 *   UX one — worth Graeme raising with Alex's solicitor contact
 *   alongside the other BIZ-5/6 items already queued, not assumed
 *   correct just because the pattern feels safer.
 *
 * 04 Aug 2026 v16
 *
 * v16 — Mixed-severity narrative, same day as v15's same-tier fix.
 *   Graeme's real point: the coach needs to narrate each condition by
 *   its OWN state, not an accumulated/single-tier state — if Lower Back
 *   is Moderate and Glutes is Mild on the same day, both need saying,
 *   correctly. Verified first (didn't assume): exercise/recommendation
 *   adaptation already does this correctly per-condition, via
 *   conditions.js's getActiveConditionIds() — not touched, wasn't
 *   broken. The gap was narrative-only. Replaced the old
 *   moderate-or-mild priority chain (_checkMildPain/_checkModeratePain/
 *   _buildMildMessage/_buildConstraintMessage, all removed) with one
 *   _buildConditionNarrative() that groups conditions by band
 *   (severe/moderate/mild) and builds one combined, severity-ordered
 *   message covering all of them. Real finding surfaced while building
 *   this, not silently absorbed: Severe pain has no rest-day override
 *   anywhere live (severePainOverride computed, never used; an old
 *   changelog's "Severe Zone Override" doesn't exist in current
 *   workoutGenerator.js). Severe now gets its own narrative line for
 *   the first time — "I've kept things well clear of that area" —
 *   deliberately NOT "full rest day" wording, since that isn't what
 *   actually happens. Whether it should is flagged to Graeme as a
 *   separate, real decision — not built here.
 *
 * 04 Aug 2026 v15
 *
 * v15 — Multi-condition messaging, prompted by Graeme asking directly:
 *   "Glutes / Buttocks" was already dynamic per condition (getConditionName()),
 *   but with 2+ conditions in the same severity band, both
 *   _buildMildMessage() and _buildConstraintMessage() were silently
 *   using conditions[0] only — real conditions were being dropped from
 *   the message entirely (never from workout filtering, which reads
 *   the full list separately). New shared _joinNames() gives natural
 *   phrasing — "X", "X and Y", "X, Y, and Z" — not a raw list dump.
 *   Moderate message with multiple conditions folds each one's own
 *   score into its name ("X (6/10)") rather than showing one aggregate
 *   number that would misdescribe whichever condition it wasn't
 *   actually about. Single-condition wording unchanged from v14/v13.
 *   Known simplification, not addressed here: if Mild and Moderate
 *   conditions both exist on the same day, only the Moderate message
 *   shows — Mild ones go unmentioned that day. Flagged, not built.
 *
 * 04 Aug 2026 v14
 *
 * v14 — Pain Input Redesign, same day as v13's threshold fix. New Mild
 *   acknowledgment tier: _checkMildPain()/_buildMildMessage(), band 3-5
 *   matching conditions.js's canonical getPainBand(). Wired into
 *   buildProposal() with correct priority — Moderate's existing message
 *   wins if both are present, Mild only shows otherwise. Wording close
 *   to Graeme's own proposal: "I've noted X as Mild today. I haven't
 *   changed anything in the programme, but keep an eye on it — if it
 *   starts feeling worse, please adapt what you're doing, or stop."
 *   Previously Mild pain produced no acknowledgment at all — a real
 *   silent-input gap, not just a missing nicety, since the coach voice
 *   philosophy is "behaviour is communication" and this was one-way.
 *   Also: _buildConstraintMessage() (the existing Moderate message) now
 *   uses getConditionName() for a proper display name ("Glutes /
 *   Buttocks") instead of the raw condition id ("glutes") — small
 *   consistency fix, matches the new Mild message's wording style.
 *
 * 04 Aug 2026 v13
 *
 * Coach proposal view. The hub. Doors that describe categories, not
 * pre-committed choices.
 *
 * v13 — Two fixes, found on-device (Graeme screenshot, testing the Home
 *   Nav Phase A threshold fix). (1) _checkModeratePain() had its own
 *   private, third copy of the severity threshold — >=4 — never touched
 *   by Phase A's fix to js/data/conditions.js. This is why Mild (score
 *   4) was still triggering "I've worked around that": this file never
 *   deferred to the canonical threshold at all. Corrected to >=6 && <7,
 *   matching conditions.js and checkin.js exactly. Not refactored to
 *   import conditions.js's functions this session — kept as a minimal,
 *   safe constant fix; this file is central and already staged for a
 *   bigger rework in Home Nav Phase C, better to consolidate properly
 *   then than mid-fix now. (2) .cp-constraint ("Your check-in flagged
 *   X today...") strengthened — Graeme reported missing it almost every
 *   time. See coach-proposal.css v6 changelog for the visual change;
 *   added a small icon here.
 *
 * v12 — BUILD-5 follow-up (found while testing workoutGenerator.js v1.10 on-
 *   device). _getAvailableTime() read availableTime from two store fields
 *   that are never actually written (history[today].availableTime,
 *   lastCheckin.availableTime) and always fell through to a hardcoded
 *   literal 30 — a number, not one of the six valid category strings
 *   ("micro"|"quick"|"short"|"standard"|"long"|"open"). Worse: that bad
 *   value was then written straight back over the correct availableTime
 *   store value on every mount, via _generateOptions() — so even a value
 *   correctly set by check-in (or manually, for testing) was silently
 *   clobbered before generateDailyOptions() ever ran. Practical effect:
 *   availableTime-driven session length has never worked through the real
 *   check-in → proposal flow, independent of anything in workoutGenerator.js.
 *
 *   Fixed: _getAvailableTime() now reads store.get('availableTime') directly
 *   — the single field checkin.js actually writes, and the same field
 *   workoutGenerator.js reads. Returns null (not a number) when nothing has
 *   been selected, which workoutGenerator.js already treats correctly as
 *   "no time constraint".
 *
 *   _getFallbackOptions() needed the OLD function's numeric-minutes return
 *   value (for its Math.min(x, availMins) calculations) — that was the
 *   actual reason a numeric fallback existed in the first place, overloaded
 *   onto a function whose other call site needed a category string. Split
 *   into a new _getAvailableTimeMinutes(), which converts the category to
 *   minutes using workoutGenerator.js's exported AVAILABLE_TIME_WINDOW_MINUTES
 *   (avoids a second hardcoded copy of those numbers).
 *
 * v11 — Confirmed bug fix. _buildReflection()'s ACTIVITY_LABELS map had
 *   no entry for "coach-session" — an activityLog entry type this map
 *   doesn't otherwise account for (not ground-truthed which file writes
 *   it; flagging rather than tracing it down, since the fix here doesn't
 *   depend on knowing the writer). Effect: the reflection line read
 *   "Since yesterday, you did coach-session" — a raw internal type
 *   string leaking into coach copy. Fixed two ways: (1) added an
 *   explicit "coach-session" → "a coaching session" mapping, and (2)
 *   added a generic fallback humaniser (hyphens → spaces) for ANY future
 *   unmapped type, so this class of bug can't silently recur the same
 *   way for a type nobody's added to the map yet. Not as polished as a
 *   real label for an unknown type, but never leaks raw code again.
 *
 * v10 — v9 was deployed earlier today and immediately rolled back: it
 *   correctly diagnosed that generateDailyOptions() was never receiving
 *   the override values it needed, but switching to a static import of
 *   workoutGenerator.js forced that module to actually load for the
 *   first time — and workoutGenerator.js turned out to have its own
 *   broken import of programmeEngine.js, present since at least
 *   workoutGenerator.js v1.1, never caught because nothing had ever
 *   loaded it as a real ES module before. That broke the entire page
 *   ("Something went wrong loading this page"), not just Door 1.
 *   Content here is otherwise IDENTICAL to v9 — no changes needed on
 *   this file's side. The fix was entirely in workoutGenerator.js
 *   (now v1.9, see that file's changelog). This version exists only to
 *   record that v9 was deployed, rolled back to v8, and this is the
 *   redeploy of the same fix, now safe because its dependency is fixed.
 *   MUST be deployed together with workoutGenerator.js v1.9 — deploying
 *   this file alone, again, would reproduce today's outage.
 *
 * v9 — Confirmed bug fix, Session A2. _generateOptions() looked up
 *   window._workoutGenerator at runtime and, if found, called
 *   generateDailyOptions() with a parameter object (energy/burnout/
 *   intensityBias/focusBias/availableTime). Two problems: (1) nothing in
 *   this codebase actually sets window._workoutGenerator — no global
 *   registration exists for it, so this lookup likely always failed and
 *   silently fell through to _getFallbackOptions(); (2) even if it had
 *   been found, workoutGenerator.generateDailyOptions() takes ZERO
 *   parameters — it reads everything itself from store/checkinData. The
 *   object was always discarded either way.
 *
 *   Ground-truthed against workoutGenerator.js v1.8 before fixing. Of
 *   the five values in the discarded object, three were harmless to
 *   lose — energy, burnout, and phase-bias focus order are already
 *   re-derived independently inside generateDailyOptions() via the same
 *   store/checkinData/programmeEngine calls this file uses. Only two
 *   genuinely had nowhere else to reach the generator: the re-entry
 *   gentler-start intensity override (effectiveIntensity, computed
 *   below in buildProposal() via getReEntryIntensity()), and the
 *   check-in's availableTime. The coach's re-entry text said "starting
 *   gently" while the actual generated session was unaffected by it —
 *   this is now fixed.
 *
 *   Fix: replaced the window._workoutGenerator runtime lookup with a
 *   direct top-level import (no circular dependency — workoutGenerator.js
 *   does not import this file). _generateOptions() now writes the
 *   re-entry-adjusted intensity and availableTime to store immediately
 *   before calling generateDailyOptions(), which picks them up through
 *   its existing store-read path (store.get("todayIntensity") and
 *   store.get("availableTime")) — no change to generateDailyOptions()'s
 *   own contract, no parameters added there. Dropped the now-unused
 *   burnout and phaseBias arguments from _generateOptions()'s signature
 *   and call site — both were already dead even before this fix.
 *
 *   ALSO INVESTIGATED, NOT A BUG: the sw.js v161 changelog flagged
 *   _routeForOption() as routing every real generated option to the
 *   generic 'workout' view regardless of framing, since real output only
 *   has option.focus, never option.type. Confirmed true, but this is
 *   correct behaviour, not a defect — generateWorkout() only ever
 *   produces generic exercise-list sessions shaped for workout.js
 *   (strength/mobility/cardio focus, never a yoga/walk/run session).
 *   Fallback options DO carry type and DO route correctly to their
 *   specialised views already. Giving real options a genuine non-workout
 *   type would require the generator itself to be able to produce those
 *   session shapes — the "Option A vs B" gap already logged in the
 *   master schedule (Appendix Q), not something fixable in
 *   _routeForOption() alone. No change made here.
 *
 *   NOT INVESTIGATED, FLAGGING FOR WHOEVER NEXT TOUCHES checkin.js OR
 *   schema.md: schema.md documents todayIntensity's value space as
 *   "low | moderate | high", but the code (both here and in
 *   workoutGenerator.js's intensityParams table) expects
 *   "recovery | gentle | moderate | challenging". Writing
 *   effectiveIntensity (already in the gentle/moderate/challenging space,
 *   per programmeEngine's getPhaseBias()/getReEntryIntensity()) into
 *   store.todayIntensity is internally consistent with this file and
 *   workoutGenerator.js, but if checkin.js writes todayIntensity in the
 *   low/moderate/high space documented in schema.md, there may be a
 *   separate, pre-existing mismatch there — not ground-truthed this
 *   session, checkin.js not opened.
 *
 * v8 — Door redesign (Door 1 only — Graeme's redesign brief, this session).
 *   Root problem being fixed: the old three-doors model computed one
 *   specific session per door and wrote coach lines implying a fully
 *   resolved, specific choice ("this session is built for that") —
 *   but under Option B (see coach-proposal.js v7 / master schedule
 *   Appendix Q), the generator can only ever produce strength/mobility/
 *   cardio sessions, so Door C's "something different" framing in
 *   particular was promising content that could never actually arrive.
 *
 *   New model: doors describe categories honestly. Door 1 ("Today's
 *   session") opens a right-slide preview panel showing the three
 *   generated options as selectable cards — duration, exercise count,
 *   and the existing rationale text as the "why" — with the top-ranked
 *   option (already first in the generator's priority order) marked
 *   "Recommended" in gold. User selects a card, taps "Start Session" to
 *   commit, or "Not today" to back out. This is the same select-then-
 *   commit pattern already used throughout Settings (goal chips + Save,
 *   movement chips + Save) and My Week (day-type chips + Save) — no new
 *   interaction pattern introduced, just a new panel shape.
 *
 *   Door 2 ("Your programme") and Door 3 ("Something different") are
 *   NOT yet built to their new spec — reusing old per-option logic for
 *   them under the new copy would be actively misleading (the old
 *   options don't map onto "programme adherence" or "something
 *   different" as concepts at all). Deliberately set to disabled,
 *   reusing the exact existing disabled-door treatment (aria-disabled,
 *   helper text) already used for the severe-pain override case. Real
 *   behaviour change, flagged explicitly rather than silently shipped:
 *   only one of three doors is functional until Door 2/3 are built in
 *   their own sessions (Door 2 needs a new "uninterrupted" bypass mode
 *   in workoutGenerator.js; Door 3 needs walk-session.js/yoga-session.js
 *   to accept a pre-selected type — neither exists yet).
 *
 *   Severe-pain handling changed in spirit, not mechanism: previously
 *   disabled the whole "Door A" when severe pain was flagged. Under the
 *   new model, Door 1 IS the adapted-for-you door — severe pain should
 *   show up in which of the three options gets generated (the generator
 *   already filters exercises by pain zone), not disable the door
 *   entirely. That old disabling behaviour is Door 2's territory now
 *   ("serious flags" adaptation vs "uninterrupted") — deliberately not
 *   reproduced here.
 *
 *   Removed as dead code: _buildDoors(), _doorALine(), _doorBLine(),
 *   _doorCLine() — the per-door dynamic coach-line logic that assumed
 *   one option per door. _buildAcknowledgement() trimmed to the two
 *   bypass-door cases only, since door-a/b/c keys no longer exist and
 *   the old three-branch version would have thrown if ever hit
 *   (referenced proposal.doors, which no longer exists).
 *
 *   handleDoorChoice() simplified: now only ever called for the bypass
 *   door (Help me build it / Take me to the library) — the generic
 *   "look up proposal.doors.find()" branch for a/b/c routing was
 *   removed as dead code that would have been a real bug if it had
 *   fired (proposal.doors doesn't exist any more).
 *
 * v7 — Confirmed bug fix: this file uses `import` at the top (ES modules,
 *   no bundler) but two functions were being pulled in via `require()`
 *   inside function bodies — `getReEntryIntensity` (in buildProposal(),
 *   re-entry gentler-start path) and `applyMissedSessionAdaptation` (in
 *   handleMissedAdaptation(), the "Stay in 12 weeks"/"Keep the same
 *   rhythm" buttons). `require()` does not exist in this environment —
 *   both would throw `require is not defined` the moment they ran.
 *   Fixed by adding both to the existing top-level import from
 *   programmeEngine.js. No other changes.
 *
 * v6 — Phase 5 door reframe (P5-CP-1, P5-CP-2, P5-CP-3). Superseded by
 *   v8's redesign above — see v6 in prior version history for the
 *   original door-reframe detail if needed for reference.
 *
 * v5 — workoutGenerator wired. run→running-session. walk→walk-session.
 *   availableTime drives session length. Cycle phase adaptation.
 *   Burnout override. Programme phase bias.
 *
 * WCAG 2.2 AA:
 *   Door buttons: aria-label describes the door. Disabled doors:
 *   aria-disabled="true", helper text in aria-describedby.
 *   Preview panel: role="dialog", aria-modal="true", focus trapped,
 *   Escape closes (treated as "Not today"), focus returns to the
 *   triggering door button on close.
 *   Preview cards: role="radio" within role="radiogroup", aria-checked,
 *   "Recommended" conveyed via a text badge (not colour alone) and
 *   echoed in the card's aria-label.
 *   Start Session: disabled (not just visually) until a card is
 *   selected — communicated via the disabled attribute, not opacity
 *   alone.
 *   Bypass door: same touch target (min 44px) and contrast as primary
 *   doors. Post-choice acknowledgement: aria-live="polite" region.
 *   All coach text rendered as <p> — not aria-hidden.
 *   prefers-reduced-motion: panel slide transition removed.
 */

import { store }             from '../store.js';
import { getActiveVoice, getTimingRules } from '../data/coach-voice.js';
import { getPhaseBias, getReEntryContext, getMissedSessionOffer,
         captureReturnContext, clearReturnContext,
         recordSession, advanceWeekIfNeeded,
         getReEntryIntensity, applyMissedSessionAdaptation }  from '../data/programmeEngine.js';
import { getProgramme }      from '../data/programmes.js';
import { detectBurnout }     from '../data/checkin.js';
import { getPrimaryEngineGoal } from '../data/goals.js';
import { getConditionName }  from '../data/conditions.js';
import { workoutGenerator, AVAILABLE_TIME_WINDOW_MINUTES } from '../data/workoutGenerator.js';   // v9 — direct import, replaces window._workoutGenerator lookup. v12 — added AVAILABLE_TIME_WINDOW_MINUTES.

// DOOR_COPY, renderDoorFront(), renderBypassDoor(), handleDoorChoice(),
// and _buildAcknowledgement() removed 04 Aug 2026 (Phase C, Home Nav &
// Conditions Redesign). This screen is now only reached via Home's
// "Unsure? Coach decides" door — the three-doors-plus-bypass UI those
// functions rendered is fully superseded by Home's six direct doors
// (Cardio/Core/Strength and Mobility & Conditioning replace the bypass
// row; this screen itself replaces door-1). Door-2/door-3 were disabled
// "Being redesigned" placeholders since 23 Jun, never built — genuinely
// retired now, not just hidden.

// ─── View registration ────────────────────────────────────────────────────────

export function CoachProposalView(router) {

  let proposal      = null;
  let choiceMade    = false;
  let reEntryCtx    = null;
  let missedOffer   = null;

  // ── Severe pain choice state (new 04 Aug 2026) ───────────────────────────
  // severeChoicePending: { conditionIds, painScores } while awaiting an
  // active Rest/Adapt choice — blocks the normal doors/options entirely
  // until resolved. severeChoiceResolved: 'rest'|'adapt'|null once known
  // for today (either just chosen, or read back from a prior choice
  // already recorded today for this exact severe-condition set).
  let severeChoicePending  = null;
  let severeChoiceResolved = null;

  // ── Door 1 preview panel state (v8) ─────────────────────────────────────
  let previewOpen           = false;
  let currentPreviewOptions = [];
  let selectedOptionId      = null;

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(container) {
    // Advance week if Monday
    advanceWeekIfNeeded();

    // Check re-entry and missed session contexts
    reEntryCtx  = getReEntryContext();
    missedOffer = getMissedSessionOffer();

    // Severe pain — active choice, not a silent decision either way.
    // Checked before buildProposal() so a pending choice can skip
    // building options entirely (nothing to generate yet).
    const conditions = store.get('conditions') || [];
    const painScores  = store.get('conditionPainScores') || {};
    const severeIds   = conditions.filter(id => (painScores[id] || 0) >= 7);

    if (severeIds.length > 0) {
      const existing = _getTodaySevereChoice(severeIds);
      severeChoiceResolved = existing;
      severeChoicePending  = existing ? null : { conditionIds: severeIds, painScores };
    } else {
      severeChoiceResolved = null;
      severeChoicePending  = null;
    }

    // Build the proposal — skipped while a choice is pending, or if
    // "rest" was chosen (nothing to propose either way).
    proposal = (!severeChoicePending && severeChoiceResolved !== 'rest')
      ? buildProposal()
      : null;

    // Auto-open the session-options panel (Phase C, 04 Aug 2026) — this
    // screen no longer has doors to choose between; reaching it at all
    // (via Home's "Unsure? Coach decides") means showing the
    // recommendation immediately, not gating it behind a second tap.
    // State set before the first render so it opens already-visible,
    // not open-then-flash. Keydown trap + initial focus wired after,
    // same setup openPreviewPanel() used to do for a later door tap —
    // that function is removed now nothing calls it post-render.
    //
    // Fix, same day: does NOT auto-open while a re-entry banner or
    // missed-session offer is still unresolved — the panel is a
    // full-screen overlay (z-index 9999), so auto-opening over an
    // unresolved banner would cover it before the person could answer
    // it, same bug as the constraint message Graeme found by
    // screenshot. Those banners' own handlers (handleReturnContext(),
    // handleMissedAdaptation()) open the panel themselves once resolved.
    const hasBlockingBanner =
      (reEntryCtx && !reEntryCtx.contextCaptured) ||
      (missedOffer && !choiceMade);

    if (proposal && !hasBlockingBanner) {
      currentPreviewOptions = proposal.options;
      selectedOptionId      = null;
      previewOpen           = true;
    }

    render(container);

    if (proposal && !hasBlockingBanner) {
      document.addEventListener('keydown', _previewKeydown);
      _focusFirstInPanel(container);
    }
  }

  // ── Severe pain choice: lookup, render, handling ─────────────────────────

  function _getTodaySevereChoice(severeIds) {
    const today   = new Date().toISOString().slice(0, 10);
    const sorted  = [...severeIds].sort();
    const history = store.get('severePainChoices') || [];
    const match = history.find(entry =>
      entry.date === today &&
      Array.isArray(entry.conditionIds) &&
      entry.conditionIds.length === sorted.length &&
      entry.conditionIds.every((id, i) => id === sorted[i])
    );
    return match ? match.choice : null;
  }

  /**
   * C1, 13 Aug 2026. The honest-limit line.
   *
   * Graeme's own framing, 13 Aug: "I can't give you medical support, but
   * I can adjust your programme for you and give you exercises. If you
   * need more than that I think you should look for external help."
   *
   * WHY IT BELONGS HERE AND ALMOST NOWHERE ELSE. Severe is the one
   * moment the user has explicitly told the coach something is badly
   * wrong. Before this, the coach acknowledged it and offered two
   * options and never once said what it cannot do -- which quietly
   * implies it can do everything on the list. Naming the limit is not a
   * disclaimer; it is the difference between a coach and a claim.
   *
   * THE RULE THIS FIXES, stated so it survives: the product must never
   * ASSUME external help exists. The old rehabilitation copy said
   * "check with whoever is treating you" to 94 exercises' worth of
   * people, most of whom have nobody treating them. Graeme's own About
   * copy says "I couldn't afford a physio". So help is OFFERED, never
   * presumed, and the wording works for somebody mid-physio, somebody
   * who has never seen anyone, and somebody who cannot afford to.
   *
   * DELIBERATELY NOT: no crisis resources, no helpline, no urgency.
   * This is a painful knee, not a safeguarding flag, and the Crisis &
   * Safeguarding Policy governs that path separately. Reaching for
   * crisis language here would both frighten people and blunt it where
   * it is actually needed.
   *
   * Register: invitational, no therapy voice, no verdict. "It's worth"
   * not "you should" -- the one place Graeme's draft says "I think you
   * should" is softened, because every other coach line in the product
   * offers rather than instructs and one exception reads as alarm.
   */
  function _buildSevereChoiceLine(pending) {
    const names  = pending.conditionIds.map(getConditionName);
    const plural = names.length > 1;
    const them   = plural ? 'them' : 'it';

    return `I can see ${_joinNames(names)} ${plural ? 'are' : 'is'} really difficult today. ` +
           `I can't give you medical support \u2014 that isn't something I can do. ` +
           `What I can do is work around ${them}, or we can call today a rest day. ` +
           `If you need more than that, it's worth finding someone who can look at ${them} properly.`;
  }

  function renderSevereChoice() {
    return `
      <div class="cp-missed-offer" role="region" aria-label="Severe pain — choose how to proceed today">
        <div class="cp-missed-offer__choices" role="group" aria-label="Rest or adapt">
          <button class="cp-missed-offer__btn" data-severe-choice="rest"
                  aria-label="Rest today — no session">
            Rest today
            <span class="cp-missed-offer__sub">Nothing pushed today \u2014 the right call some days</span>
          </button>
          <button class="cp-missed-offer__btn" data-severe-choice="adapt"
                  aria-label="Adapt around it and continue with a session">
            Adapt and continue
            <span class="cp-missed-offer__sub">I'll keep well clear of the affected area</span>
          </button>
        </div>
      </div>
    `;
  }

  function _buildRestDayLine() {
    return 'Good call. Nothing pushed today \u2014 resting is progress too. If you\'d like something gentle, Wellbeing has breathing and quiet options; otherwise, that\'s it for today.';
  }

  function renderRestDayOptions() {
    return `
      <div class="cp-missed-offer" role="region" aria-label="Rest day options">
        <div class="cp-missed-offer__choices" role="group" aria-label="What next">
          <button class="cp-missed-offer__btn" data-rest-action="noticing"
                  aria-label="Visit Wellbeing for something gentle">
            Visit Wellbeing
            <span class="cp-missed-offer__sub">Breathing, journalling, a moment of quiet</span>
          </button>
          <button class="cp-missed-offer__btn" data-rest-action="home"
                  aria-label="That's it for today, return home">
            That's it for today
          </button>
        </div>
      </div>
    `;
  }

  function handleSevereChoice(choice, container) {
    if (!severeChoicePending) return;
    store.recordSeverePainChoice(severeChoicePending.conditionIds, choice);
    severeChoiceResolved = choice;
    severeChoicePending  = null;
    proposal = (severeChoiceResolved !== 'rest') ? buildProposal() : null;
    render(container);
  }


  // ── Render ─────────────────────────────────────────────────────────────────

  function render(container) {
    // Severe pain — awaiting an active choice. No doors, no options yet;
    // nothing to propose until Rest or Adapt is actively chosen.
    if (severeChoicePending) {
      container.innerHTML = `
        <div class="cp-view" role="main" aria-label="Severe pain — choose how to proceed">
          <div class="cp-coach-block" aria-live="polite">
            <div class="cp-greeting">${_buildSevereChoiceLine(severeChoicePending)}</div>
          </div>
          ${renderSevereChoice()}
        </div>
      `;
      attachSevereChoiceEvents(container);
      return;
    }

    // Severe pain — "rest" was actively chosen (today, this exact set).
    // No session doors; gentle alternatives only.
    if (severeChoiceResolved === 'rest') {
      container.innerHTML = `
        <div class="cp-view" role="main" aria-label="Today is a rest day">
          <div class="cp-coach-block" aria-live="polite">
            <div class="cp-greeting">${_buildRestDayLine()}</div>
          </div>
          ${renderRestDayOptions()}
        </div>
      `;
      attachRestDayEvents(container);
      return;
    }

    container.innerHTML = `
      <div class="cp-view" role="main" aria-label="Your coaching proposal for today">

        <!-- Re-entry banner (illness/long gap) -->
        ${reEntryCtx && !reEntryCtx.contextCaptured ? renderReturnDoor() : ''}

        <!-- Compress/extend offer -->
        ${missedOffer && !choiceMade ? renderMissedOffer(missedOffer) : ''}

        <!-- Coach message block — only rendered out here while the panel is
             closed (waiting on re-entry/missed-offer above). Once the panel
             is open this same content renders inside it instead — fix,
             04 Aug 2026: the panel is a full-screen fixed overlay
             (z-index 9999), so when it auto-opens (Phase C) anything
             rendered out here, including the condition/severity
             constraint message, was being covered before the person
             could read it. Found via screenshot — Graeme reached this
             screen and completely missed the flagged condition message
             sitting right behind the modal. -->
        ${!previewOpen ? `
          <div class="cp-coach-block" aria-live="polite">
            <div class="cp-greeting">${proposal.greeting}</div>
            ${proposal.reflection ? `<p class="cp-reflection">${proposal.reflection}</p>` : ''}
            ${proposal.constraint ? `
              <div class="cp-constraint" role="status" aria-live="polite">
                <span class="cp-constraint__icon" aria-hidden="true">🌱</span>
                <p>${proposal.constraint}</p>
              </div>` : ''}
            <p class="cp-proposal-intro">${proposal.intro}</p>
          </div>
        ` : ''}

        <!-- Post-choice acknowledgement (hidden until a session is started) -->
        <div class="cp-acknowledgement"
             id="cp-acknowledgement"
             aria-live="polite"
             role="status"
             style="display:none;">
        </div>

        <!-- Session options — auto-open once there's no blocking banner
             above, no door tap needed (Phase C, 04 Aug 2026) -->
        ${renderPreviewPanel()}

      </div>
    `;

    attachEvents(container);
  }

  function attachSevereChoiceEvents(container) {
    container.querySelectorAll('[data-severe-choice]').forEach(btn => {
      btn.addEventListener('click', () => {
        handleSevereChoice(btn.dataset.severeChoice, container);
      });
    });
  }

  function attachRestDayEvents(container) {
    container.querySelectorAll('[data-rest-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.restAction;
        if (action === 'noticing') router.navigate('noticing');
        else router.navigate('today');
      });
    });
  }

  // ── Door 1 preview panel (v8) ────────────────────────────────────────────

  function renderPreviewPanel() {
    return `
      <div id="cp-preview-panel"
           class="cp-preview-panel ${previewOpen ? 'is-open' : ''}"
           role="dialog"
           aria-modal="true"
           aria-labelledby="cp-preview-title"
           ${previewOpen ? '' : 'hidden'}>
        <div class="cp-preview-panel__backdrop"></div>
        <div class="cp-preview-panel__content">
          <button class="cp-preview-panel__close" id="cp-preview-close" aria-label="Close">\u2715</button>

          ${proposal ? `
            <div class="cp-coach-block cp-coach-block--in-panel" aria-live="polite">
              <div class="cp-greeting">${proposal.greeting}</div>
              ${proposal.reflection ? `<p class="cp-reflection">${proposal.reflection}</p>` : ''}
              ${proposal.constraint ? `
                <div class="cp-constraint" role="status" aria-live="polite">
                  <span class="cp-constraint__icon" aria-hidden="true">🌱</span>
                  <p>${proposal.constraint}</p>
                </div>` : ''}
            </div>
          ` : ''}

          <h2 id="cp-preview-title" class="cp-preview-panel__title">Today\u2019s session</h2>
          <p class="cp-preview-panel__sub">
            Adapted for your check-in \u2014 pick the one that feels right.
          </p>
          <div class="cp-preview-cards" role="radiogroup" aria-label="Choose today's session">
            ${currentPreviewOptions.map((opt, i) => renderPreviewCard(opt, i === 0)).join('')}
          </div>
          <div class="cp-preview-panel__actions">
            <button class="btn btn-ghost" id="cp-preview-not-today" aria-label="Not today \u2014 close">
              Not today
            </button>
            <button class="btn btn-primary" id="cp-preview-start"
                    aria-label="Start session"
                    ${selectedOptionId ? '' : 'disabled'}>
              Start Session
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderPreviewCard(option, isRecommended) {
    const selected = option.id === selectedOptionId;
    return `
      <button class="cp-preview-card ${selected ? 'cp-preview-card--selected' : ''} ${isRecommended ? 'cp-preview-card--recommended' : ''}"
              role="radio"
              aria-checked="${selected ? 'true' : 'false'}"
              data-option-id="${option.id}"
              aria-label="${option.name}, about ${option.duration} minutes${isRecommended ? ', recommended' : ''}">
        ${isRecommended ? '<span class="cp-preview-card__badge">Recommended</span>' : ''}
        <span class="cp-preview-card__name">${option.name}</span>
        <span class="cp-preview-card__meta">${option.duration} min \u00b7 ${option.exerciseCount} exercises</span>
        <p class="cp-preview-card__why">${option.rationale}</p>
      </button>
    `;
  }

  // ── Preview panel close (v8; open handled directly in mount(), 04 Aug 2026) ──

  function closePreviewPanel(container) {
    // Phase C, 04 Aug 2026: this panel is now the only content on this
    // screen (no doors underneath to fall back to), so closing without
    // a selection navigates back to Home instead of leaving an empty
    // coach message with nothing actionable. The old #door-1 focus
    // target no longer exists.
    previewOpen      = false;
    selectedOptionId = null;
    document.removeEventListener('keydown', _previewKeydown);
    router.navigate('today');
  }

  function _rerenderPanel(container) {
    const existing = container.querySelector('#cp-preview-panel');
    if (existing) {
      existing.outerHTML = renderPreviewPanel();
      attachPreviewEvents(container);
    }
  }

  function _previewKeydown(e) {
    if (e.key !== 'Escape') return;
    const container = document.getElementById('main-content');
    if (container) closePreviewPanel(container);
  }

  function _focusFirstInPanel(container) {
    setTimeout(() => {
      const panel = container.querySelector('#cp-preview-panel');
      const first = panel?.querySelector('button:not([disabled])');
      if (first) first.focus();
    }, 50);
  }

  function attachPreviewEvents(container) {
    const panel = container.querySelector('#cp-preview-panel');
    if (!panel) return;

    panel.querySelector('.cp-preview-panel__backdrop')?.addEventListener('click', () => closePreviewPanel(container));
    panel.querySelector('#cp-preview-close')?.addEventListener('click', () => closePreviewPanel(container));
    panel.querySelector('#cp-preview-not-today')?.addEventListener('click', () => closePreviewPanel(container));

    panel.querySelectorAll('[data-option-id]').forEach(card => {
      card.addEventListener('click', () => {
        selectedOptionId = card.dataset.optionId;
        _rerenderPanel(container);
      });
    });

    panel.querySelector('#cp-preview-start')?.addEventListener('click', () => {
      if (!selectedOptionId) return;
      const chosen = currentPreviewOptions.find(o => o.id === selectedOptionId);
      if (chosen) handlePreviewStart(chosen, container);
    });

    panel.addEventListener('keydown', _trapFocus);
  }

  function handlePreviewStart(option, container) {
    if (choiceMade) return;
    choiceMade = true;

    store.set('lastProposalType', 'door-1');
    store.set('lastProposalDate', new Date().toISOString());

    closePreviewPanel(container);

    const ackEl = container.querySelector('#cp-acknowledgement');
    if (ackEl) {
      ackEl.style.display = '';
      ackEl.textContent = 'Good. Let\u2019s go.';
      ackEl.focus();
    }

    store.set('generatedSession', {
      session: option,
      builtAt: new Date().toISOString(),
      inputs:  option.inputs || {}
    });

    const timingRules = getTimingRules({ difficultTopic: false });
    setTimeout(() => {
      if (reEntryCtx) clearReturnContext();
      router.navigate(_routeForOption(option));
    }, timingRules.delayMs + 400);
  }

  function _trapFocus(e) {
    if (e.key !== 'Tab') return;
    const panel = document.getElementById('cp-preview-panel');
    if (!panel) return;
    const focusable = [...panel.querySelectorAll(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )];
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  // ── Return door renderer ───────────────────────────────────────────────────

  function renderReturnDoor() {
    // Sideways door — never "why did you miss sessions?"
    // "Anything you'd like me to know about the last little while?"
    return `
      <div class="cp-return-door" role="region" aria-label="Welcome back">
        <p class="cp-return-door__message">
          It's good to see you. Anything you'd like me to know about the last little while?
          Completely optional — we can also just begin.
        </p>
        <div class="cp-return-door__chips"
             role="group"
             aria-label="What was the last little while like?">
          <button class="cp-chip" data-return-context="life"
                  aria-pressed="false">Life got full</button>
          <button class="cp-chip" data-return-context="illness"
                  aria-pressed="false">Was unwell</button>
          <button class="cp-chip" data-return-context="harder"
                  aria-pressed="false">Finding it harder</button>
          <button class="cp-chip cp-chip--skip" data-return-context="skip"
                  aria-pressed="false">Rather not say — let's just begin</button>
        </div>
      </div>
    `;
  }

  // ── Missed session offer renderer ──────────────────────────────────────────

  function renderMissedOffer(offer) {
    return `
      <div class="cp-missed-offer" role="region" aria-label="Session adaptation offer">
        <p class="cp-missed-offer__line">${offer.coachLine}</p>
        <div class="cp-missed-offer__choices"
             role="group"
             aria-label="How would you like to adapt?">
          <button class="cp-missed-offer__btn" data-adapt="compress"
                  aria-label="Stay in 12 weeks — ${offer.compressWeeklySessions} sessions per week">
            Stay in 12 weeks
            <span class="cp-missed-offer__sub">${offer.compressWeeklySessions} sessions a week from here</span>
          </button>
          <button class="cp-missed-offer__btn" data-adapt="extend"
                  aria-label="Keep the same rhythm — extend by ${offer.extendWeeksNeeded} week${offer.extendWeeksNeeded !== 1 ? 's' : ''}">
            Keep the same rhythm
            <span class="cp-missed-offer__sub">Extend by ${offer.extendWeeksNeeded} week${offer.extendWeeksNeeded !== 1 ? 's' : ''}</span>
          </button>
        </div>
      </div>
    `;
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  function attachEvents(container) {
    // Return context chips
    container.querySelectorAll('[data-return-context]').forEach(btn => {
      btn.addEventListener('click', e => {
        const context = btn.dataset.returnContext;
        handleReturnContext(context, container);
      });
    });

    // Missed session adaptation
    container.querySelectorAll('[data-adapt]').forEach(btn => {
      btn.addEventListener('click', e => {
        const choice = btn.dataset.adapt;
        handleMissedAdaptation(choice, container);
      });
    });

    // Door 1 preview panel — always present in the DOM (v8)
    attachPreviewEvents(container);
  }

  // ── Return context handler ─────────────────────────────────────────────────

  function handleReturnContext(context, container) {
    if (context !== 'skip') {
      captureReturnContext(context);
    }

    // Dismiss return door and rebuild the proposal with re-entry context
    // applied — full re-render (Phase C, 04 Aug 2026: this used to just
    // patch .cp-doors, which no longer exists; the re-entry context can
    // change effectiveIntensity/options, so the auto-opened panel needs
    // fresh options too, not just the coach message).
    reEntryCtx = getReEntryContext();
    proposal   = buildProposal();

    // Only open now if there isn't also an unresolved missed-offer —
    // same gating mount() applies, in case both banners existed together.
    if (!(missedOffer && !choiceMade)) {
      currentPreviewOptions = proposal.options;
      selectedOptionId      = null;
      previewOpen           = true;
    }

    render(container);
  }

  // ── Missed adaptation handler ──────────────────────────────────────────────

  function handleMissedAdaptation(choice, container) {
    applyMissedSessionAdaptation(choice);
    missedOffer = null;

    // Fix, 04 Aug 2026: this used to just hide the offer element in
    // place, leaving the panel closed underneath (auto-open is gated
    // on missedOffer being resolved — see mount()). Now that it's
    // resolved, open the panel the same way mount() would have if
    // there'd been nothing to resolve.
    if (proposal && !(reEntryCtx && !reEntryCtx.contextCaptured)) {
      currentPreviewOptions = proposal.options;
      selectedOptionId      = null;
      previewOpen           = true;
    }
    render(container);
  }

  // ── Proposal builder ───────────────────────────────────────────────────────

  /**
   * Build the full proposal object.
   * v8: returns the raw `options` array (for Door 1's preview panel) in
   * addition to everything previous versions returned. `doors` no longer
   * built here — door copy is now static (DOOR_COPY), not derived per
   * option.
   * v17 (04 Aug 2026): only ever called when severe pain is either
   * absent or already actively resolved as "adapt" for today — see
   * mount()'s severeChoicePending gating above. severePainOverride
   * removed from the returned object; it was dead weight (computed,
   * never used by rendering) now that severe pain has real handling
   * upstream instead of a placeholder for a feature that never landed.
   */
  function buildProposal() {
    const voice        = getActiveVoice();
    const name         = store.get('name') || '';
    const energy       = store.get('lastCheckin.feelingWord')
                           ? store.get('lastCheckin.feelingWord')
                           : null;
    const energyScore  = _getCheckinEnergy();
    const moodScore    = _getCheckinMood();
    const painScores   = store.get('conditionPainScores') || {};
    const conditions   = store.get('conditions') || [];
    const goals        = store.get('goals') || [];
    const availTime    = _getAvailableTime();
    // BURN-1, 12 Aug 2026. detectBurnout() now returns
    // { level, avgEnergy } rather than a boolean -- workoutGenerator.js
    // had seven reads of burnout.level against a boolean, so the whole
    // recovery path was unreachable. _buildIntro() below tested this
    // truthily, which an object always satisfies, so it is passed the
    // grade instead.
    const burnoutState = detectBurnout(store.get('checkinHistory') || {});
    const burnout      = burnoutState.level !== 'none';
    const phaseBias    = getPhaseBias();
    const primaryGoal  = getPrimaryEngineGoal(goals);
    const feelingWord  = store.get('lastCheckin.feelingWord');

    // Pain override check
    const conditionNarrative = _buildConditionNarrative(conditions, painScores);

    // Re-entry intensity adjustment
    let effectiveIntensity = phaseBias.intensityBias;
    if (reEntryCtx?.needsGentlerStart) {
      effectiveIntensity = getReEntryIntensity('illness', effectiveIntensity);
    }

    // Generate three options from workout generator — these become
    // Door 1's preview cards (v8), already returned in priority order.
    // v9: effectiveIntensity and availTime are now genuinely applied —
    // see _generateOptions().
    let options = _generateOptions(energyScore, effectiveIntensity, availTime);
    while (options.length < 3) {
      options.push(_getFallbackOption(options.length));
    }

    // Build greeting
    const greeting = _buildGreeting(name, feelingWord);

    // Build reflection (last 48h activity)
    const reflection = _buildReflection();

    // Build constraint message — one combined, severity-ordered
    // narrative covering every logged condition by its own band
    // (severe/moderate/mild), not just the worst tier with others
    // silently dropped. See _buildConditionNarrative() below.
    const constraint = conditionNarrative;

    // Build intro line
    const intro = _buildIntro(primaryGoal, feelingWord, burnout, reEntryCtx);

    return {
      greeting,
      reflection,
      constraint,
      intro,
      options,
    };
  }

  // ── Greeting ───────────────────────────────────────────────────────────────

  function _buildGreeting(name, feelingWord) {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Morning'
                       : hour < 17 ? 'Afternoon'
                       : 'Evening';
    const displayName = name ? `, ${name}` : '';

    // If re-entry, greeting acknowledges it without making the gap the subject
    if (reEntryCtx && !reEntryCtx.contextCaptured) {
      return `Good to see you${displayName}.`;
    }

    return `${timeGreeting}${displayName}.`;
  }

  // ── Reflection (last 48h activity) ────────────────────────────────────────

  function _buildReflection() {
    const activityLog = store.get('activityLog') || [];
    const cutoff      = Date.now() - (48 * 60 * 60 * 1000);
    const recent      = activityLog.filter(entry => {
      const ts = entry.completedAt || entry.loggedAt || entry.date;
      return ts && new Date(ts).getTime() > cutoff;
    });

    if (recent.length === 0) return null;

    const ACTIVITY_LABELS = {
      'workout':          'strength work',
      'morning-session':  'morning movement',
      'yoga-session':     'yoga',
      'walk-session':     'a walk',
      'running-session':  'a run',
      'cycle-session':    'cycling',
      'swim-session':     'swimming',
      'core-session':     'core work',
      'quiet-session':    'a breathing session',
      'breathing-session':'a breathing session',
      'gym-programme':    'gym work',
      'coach-session':    'a coaching session',   // v11 — was leaking raw as "coach-session"
    };

    // v11: fallback for any type not in the map above — hyphens to spaces
    // rather than leaking the literal raw type string into coach copy.
    function _humanizeActivityType(type) {
      return String(type).replace(/-/g, ' ');
    }

    // Deduplicate by type
    const typesSeen = new Set();
    const uniqueTypes = [];
    recent.forEach(entry => {
      const type = entry.type || entry.activityType || 'movement';
      if (!typesSeen.has(type)) {
        typesSeen.add(type);
        uniqueTypes.push(ACTIVITY_LABELS[type] || _humanizeActivityType(type));
      }
    });

    const voice = getActiveVoice();

    if (uniqueTypes.length === 1) {
      return `Since yesterday, you did ${uniqueTypes[0]}.`;
    }
    if (uniqueTypes.length === 2) {
      return `Since yesterday, you did ${uniqueTypes[0]} and ${uniqueTypes[1]}.`;
    }
    const last = uniqueTypes.pop();
    return `Since yesterday, you did ${uniqueTypes.join(', ')}, and ${last}.`;
  }

  // ── Intro line ─────────────────────────────────────────────────────────────

  function _buildIntro(primaryGoal, feelingWord, burnout, reEntryCtx) {
    if (burnout) {
      return 'Your body has been running low. Today is for gentle movement only.';
    }
    if (reEntryCtx?.needsGentlerStart) {
      return 'Welcome back. Starting gently — that\'s the right call after being unwell.';
    }
    if (reEntryCtx && reEntryCtx.gapDays >= 7) {
      return 'Good to have you back. Here\'s what I\'d suggest for today.';
    }

    // Goal-connected intro
    const goalIntros = {
      'feel-good':       'Here\'s what might help you feel it today.',
      'build-muscle':    'Three options for today — the programme is building.',
      'weight-loss':     'Here\'s today — three different ways to move.',
      'improve-cardio':  'Three options. All of them move the cardio work forward.',
      'flexibility':     'Three ways to work on range and ease today.',
      'balance':         'Three options — all of them build the stability work.',
      'injury-recovery': 'Three options — all adapted to where your body is today.',
      'return-to-fitness': 'Three options for today. All of them count.',
    };

    return goalIntros[primaryGoal] || 'Here\'s what I\'d suggest for today.';
  }

  // ── Pain checks ────────────────────────────────────────────────────────────
  // Bands match the canonical getPainBand() in conditions.js: mild 3-5,
  // moderate 6-7, severe 8+. Not calling getPainBand() directly here —
  // these three functions need simple filter/find behaviour across a
  // list of conditions, not a single-score classification — but the
  // numeric boundaries themselves are the same source of truth,
  // confirmed against conditions.js when writing this (04 Aug 2026).

  // Natural-language list join for multiple condition names in one
  // message — "X", "X and Y", or "X, Y, and Z" — rather than dumping
  // raw names or only ever mentioning the first match. Added 04 Aug
  // 2026 after Graeme asked directly whether multiple conditions would
  // read naturally; previously _buildMildMessage()/_buildConstraintMessage()
  // silently used conditions[0] only, dropping any others from the
  // message entirely (still correctly excluded from the workout either
  // way — this was a messaging gap, not a safety gap).
  function _joinNames(names) {
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
  }

  /**
   * Combined, severity-ordered narrative covering every logged
   * condition by its own individual band — severe, moderate, and mild
   * can all appear in the same message, each with correct wording and
   * pluralisation, instead of one tier winning and the rest going
   * unmentioned. Added 04 Aug 2026 — replaces the earlier separate
   * _checkMildPain/_checkModeratePain/_buildMildMessage/
   * _buildConstraintMessage functions, which only ever showed one tier.
   *
   * Severe wording is deliberately NOT "full rest day" language —
   * checked, and no such override actually exists live anywhere in the
   * app (severePainOverride is computed but unused; an old changelog
   * reference to a "Severe Zone Override" no longer exists in
   * workoutGenerator.js). Severe conditions get the same "worked
   * around" pattern as Moderate, just named separately — accurate to
   * what the exercise filtering actually does (acute-tier
   * contraindications), not an overclaim. Whether Severe should get a
   * genuine rest-day override is a real, separate product decision,
   * flagged to Graeme, not built here.
   */
  function _buildConditionNarrative(conditions, painScores) {
    const severeIds   = conditions.filter(id => (painScores[id] || 0) >= 7);
    const moderateIds = conditions.filter(id => {
      const p = painScores[id] || 0;
      return p >= 6 && p < 7;
    });
    const mildIds = conditions.filter(id => {
      const p = painScores[id] || 0;
      return p >= 3 && p < 6;
    });

    const sentences = [];

    if (severeIds.length > 0) {
      const parts  = severeIds.map(id => `${getConditionName(id)} (${painScores[id]}/10)`);
      const plural = severeIds.length > 1;
      sentences.push(`Your check-in flagged ${_joinNames(parts)} as Severe today \u2014 I\'ve kept things well clear of ${plural ? 'those areas' : 'that area'}.`);
    }

    if (moderateIds.length > 0) {
      const parts  = moderateIds.map(id => `${getConditionName(id)} (${painScores[id] || 6}/10)`);
      const plural = moderateIds.length > 1;
      sentences.push(`Your check-in flagged ${_joinNames(parts)} today. I\'ve worked around ${plural ? 'those' : 'that'}.`);
    }

    if (mildIds.length > 0) {
      const names  = mildIds.map(getConditionName);
      const plural = names.length > 1;
      sentences.push(`I\'ve noted ${_joinNames(names)} as Mild \u2014 I haven\'t changed anything there, but keep an eye on ${plural ? 'them' : 'it'}: if ${plural ? 'they start' : 'it starts'} feeling worse, please adapt what you\'re doing, or stop.`);
    }

    return sentences.length > 0 ? sentences.join(' ') : null;
  }

  // ── Option generation ──────────────────────────────────────────────────────

  /**
   * v9 — REWRITTEN. Was: look up window._workoutGenerator at runtime and
   * call it with a parameter object that the real function always
   * discarded (it takes zero parameters). Now: direct top-level import,
   * called with no arguments to match its real signature. The two values
   * that genuinely needed to reach the generator — the re-entry-adjusted
   * intensity and availableTime — are written to store immediately
   * before the call, which is how generateDailyOptions() actually reads
   * its inputs (store.get("todayIntensity"), store.get("availableTime")).
   * energyScore is kept as a parameter here only because _getFallbackOptions()
   * (the error/unavailable path) still needs it — it is not sent to the
   * real generator, which derives energy itself from checkinData.
   */
  function _generateOptions(energyScore, intensity, availTime) {
    try {
      if (intensity) {
        store.set('todayIntensity', intensity);
      }
      if (availTime) {
        store.set('availableTime', availTime);
      }
      return workoutGenerator.generateDailyOptions();
    } catch (e) {
      console.warn('coach-proposal: workoutGenerator unavailable, using fallbacks', e);
      return _getFallbackOptions(energyScore, intensity);
    }
  }

  function _getFallbackOptions(energyScore, intensity) {
    const availMins = _getAvailableTimeMinutes();
    // v8: shape normalised to match real generator output — id, name,
    // duration, exerciseCount, rationale — since these now feed Door 1's
    // preview cards directly, not just old per-door coach lines.
    const raw = (energyScore <= 3 || intensity === 'gentle')
      ? [
          { label: 'Gentle movement',   type: 'workout',       durationMins: Math.min(20, availMins), exerciseCount: 4 },
          { label: 'Breathing session', type: 'quiet-session', durationMins: Math.min(15, availMins), exerciseCount: 3 },
          { label: 'Short walk',        type: 'walk-session',  durationMins: Math.min(20, availMins), exerciseCount: 1 },
        ]
      : [
          { label: 'Strength session',  type: 'workout',       durationMins: Math.min(35, availMins), exerciseCount: 6 },
          { label: 'Mobility work',     type: 'yoga-session',  durationMins: Math.min(25, availMins), exerciseCount: 5 },
          { label: 'Breathing session', type: 'quiet-session', durationMins: Math.min(15, availMins), exerciseCount: 3 },
        ];

    return raw.map((opt, i) => ({
      id:            `fallback-${opt.type}-${Date.now()}-${i}`,
      name:          opt.label,
      type:          opt.type,
      duration:      opt.durationMins,
      exerciseCount: opt.exerciseCount,
      rationale:     'A steady option for today.',
      exercises:     []
    }));
  }

  function _getFallbackOption(index) {
    const opt = [
      { label: 'Mobility',  type: 'yoga-session',  durationMins: 20, exerciseCount: 4 },
      { label: 'Breathing', type: 'quiet-session',  durationMins: 15, exerciseCount: 3 },
      { label: 'Short walk',type: 'walk-session',   durationMins: 20, exerciseCount: 1 },
    ][index] || { label: 'Movement', type: 'workout', durationMins: 20, exerciseCount: 4 };

    return {
      id:            `fallback-${opt.type}-${Date.now()}-${index}`,
      name:          opt.label,
      type:          opt.type,
      duration:      opt.durationMins,
      exerciseCount: opt.exerciseCount,
      rationale:     'A steady option for today.',
      exercises:     []
    };
  }

  function _routeForOption(option) {
    // v9: confirmed via ground-truthing workoutGenerator.js this session —
    // real generated options never carry `type` (only `focus`), so this
    // always falls through to 'workout' for real options. That is correct:
    // generateWorkout() only ever produces generic exercise-list sessions
    // shaped for workout.js, regardless of focus. Fallback options DO carry
    // type and route correctly already. See v9 changelog note above.
    const TYPE_TO_ROUTE = {
      'workout':          'workout',
      'morning-session':  'morning-session',
      'yoga-session':     'yoga-session',
      'walk-session':     'walk-session',
      'running-session':  'running-session',
      'cycle-session':    'cycle-session',
      'swim-session':     'swim-session',
      'core-session':     'core-session',
      'quiet-session':    'quiet-session',
      'gym-programme':    'gym-programme',
    };
    return TYPE_TO_ROUTE[option.type] || 'workout';
  }

  // ── Store helpers ──────────────────────────────────────────────────────────

  function _getCheckinEnergy() {
    const history = store.get('checkinHistory') || {};
    const today   = new Date().toISOString().split('T')[0];
    return history[today]?.energy || store.get('lastCheckin.energy') || 5;
  }

  function _getCheckinMood() {
    const history = store.get('checkinHistory') || {};
    const today   = new Date().toISOString().split('T')[0];
    return history[today]?.mood || store.get('lastCheckin.mood') || 5;
  }

  function _getAvailableTime() {
    // v12 (24 Jul 2026) — REWRITTEN. Was reading history[today]?.availableTime
    // and store.get('lastCheckin.availableTime') — neither field is ever
    // written. checkin.js's _saveAll() writes availableTime ONLY to the
    // top-level store.availableTime key (checkinData.saveCheckin() does not
    // include it in the checkin object, and it is not one of the fields
    // copied into lastCheckin). So this always fell through to the old
    // hardcoded fallback of 30 — a bare number, not a valid category — which
    // then got written straight back over the correct value by
    // _generateOptions() on every single mount of this screen, before
    // generateDailyOptions() ever ran. Net effect: availableTime-driven
    // session length has never worked via the real check-in → proposal flow.
    // Fix: read the single source of truth directly. null (not a number)
    // when nothing has been selected yet — workoutGenerator.js already
    // treats null as "no time constraint", which is the correct behaviour
    // for that case.
    return store.get('availableTime') || null;
  }

  // v12 (24 Jul 2026) — NEW. _getAvailableTime() is also used by
  // _getFallbackOptions() (below) where a number of minutes is needed, not
  // a category string — that mismatch is what produced the old numeric-30
  // fallback in the first place. Kept as a separate function with its own
  // contract rather than overloading _getAvailableTime()'s return type.
  function _getAvailableTimeMinutes() {
    const category = store.get('availableTime');
    return category ? (AVAILABLE_TIME_WINDOW_MINUTES[category] ?? 30) : 30;
  }

  // ── Public interface ───────────────────────────────────────────────────────

  return { mount };
}
