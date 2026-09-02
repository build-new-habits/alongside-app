/**
 * js/views/session-builder-ui.js - Session Builder UI
 *
 * 20 Aug 2026 v12
 *
 * v12 - R4. EVERY STEP OF THIS BUILDER IS NOW FREE. The type picker,
 *   the duration picker, the warm-up/work/cool-down split and the
 *   build-mode step each rendered through lockedFeature() on the free
 *   tier, and the location step was skipped entirely -- so a free user
 *   was never asked whether they were at home or at the gym. The coach
 *   guessing instead of asking, which is the one thing this product is
 *   built not to do.
 *
 *   TIER-G is reversed two days after it was added. Both decisions are
 *   recorded in the comments below rather than the earlier one being
 *   deleted; the reversal is the useful part.
 *
 *   The isPremium/lockedFeature import is REMOVED, not left unused. An
 *   unused paywall import is a working example somebody copies, and it
 *   leaves the gate unable to tell a live gate from a dead one.
 *
 *   TWO FOOTNOTES DELETED, both untrue rather than merely redundant:
 *   "All session types come with the Plan" and "Choosing your own
 *   movements is part of the Plan".
 *
 *   Caught only by execution: removing the `premium` local left three
 *   references behind, and the view threw on render while every
 *   source-text gate stayed green. node --check passed it too -- it
 *   parses .js as a script, not a module.
 *
 * v11 - NAME-1. Two copy lines now say "the Plan" rather than "the
 *   Personal plan". Copy only. Reasoning in js/auth.js v2.
 *
 * 18 Aug 2026 v10
 *
 * v10 - TIER-G. The build-mode step had no tier check. A free user
 *   reaching it through the Library's free "Full Body" card could pick
 *   "Coach recommends, I'll choose" or "Build my own" and compose a
 *   session exercise by exercise -- the paid act, by the one-line test
 *   in alongside_tier_boundary_12aug2026_v1.md section 4. The free
 *   tier's session is "full body only, the coach decides."
 *
 *   Both composing routes now render through lockedFeature(); "Coach
 *   builds it" is untouched and remains the free path. The routes are
 *   shown rather than hidden, per the boundary document's section 6
 *   door principle. A guard in the click handler mirrors the render.
 *
 *   NOT changed, deliberately: the identical three routes on
 *   conditions-update.js. Those sit on prescribed/condition work, which
 *   is permanently free on ethical grounds, and "Build my own" there
 *   routes to prescribed.js -- transcribing what a clinician actually
 *   told you, not composing from the database. Same words, different
 *   act. See the master schedule entry for this session.
 *
 * 13 Aug 2026 v9
 *
 * v9 - D3. The allocation preset persists. It was module state reset to
 *   "balanced" on every mount, so persona 2.15 -- four gym sessions a
 *   week, wants "Mostly strength" every time -- re-picked it from
 *   scratch at every session. Seeded from store.sessionPreset and
 *   written back on choice. The reset path returns to the SAVED preset,
 *   not to balanced: resetting a remembered preference to a default is
 *   the same bug in a second place, and would have left the store write
 *   looking correct while behaviour stayed unchanged.
 *
 * 13 Aug 2026 v8
 *
 * v8 - TIER-B. The silent downgrade at the preselect path is removed.
 *   A free user arriving with a locked session type now routes to
 *   upgrade instead of being handed Full Body 30 with no explanation.
 *
 * 11 Aug 2026 v7
 *
 * v7 - Renders the session rationale: the opening explanation above the
 *   exercise list, a one-line purpose under each section heading, and
 *   the longer arc behind a "What this is building" disclosure. The arc
 *   is collapsed by default because somebody about to train wants to
 *   start, and the person who wants the reasoning can open it.
 *
 * 11 Aug 2026 v6
 *
 * v6 - Duration display. Raw seconds were printed straight onto the
 *   session preview, so a five-minute cross-trainer warm-up read "300s" -
 *   accurate and unreadable. New formatDuration() translates anything over
 *   ninety seconds into minutes, and leaves genuinely short holds in
 *   seconds where that is how a person would say it.
 *
 * 11 Aug 2026 v5
 *
 * v5 — WOW-4 (PT-7). Locked session types and durations now use auth.js's
 *   lockedFeature() instead of the HTML disabled attribute plus an inline
 *   opacity:0.45. disabled removes an element from the tab order entirely,
 *   so the "-- Personal tier" aria-label was unreachable by keyboard and
 *   screen reader, and tapping did nothing at all — a dead end at the best
 *   conversion moment in the product. lockedFeature() is focusable,
 *   announced, and routes to /upgrade, matching noticing.js's In Step.
 *   Also removed this file's private isPremium() duplicate in favour of
 *   auth.js's — that duplicate had already caused one real bug (v2's
 *   userTier/tier fix), which is precisely the drift auth.js exists to stop.
 *   Third competing "locked" visual language retired; two remain, both
 *   tappable (this one and progress.js's export lock).
 *
 * 05 Aug 2026 v4
 *
 * v4 -- Gym Session Builder Phase 1 (blueprint
 *   alongside_blueprint_gym-session-builder-phase1_05aug2026_v2.md).
 *   Five additions:
 *   1. Pre-selected type + location, read once from store on mount
 *      (set by library.js before navigating here) -- lets Library's
 *      gym cards jump straight past the type picker with the right
 *      type already chosen, matching the pattern running-session.js's
 *      resume-checkpoint reading already established, not a new
 *      invention.
 *   2. Location step -- "Just one more thing, where are you for
 *      this?" -- shown right after type selection (own store-driven
 *      preselect skips it entirely, since Library already answered
 *      it implicitly by which door was tapped). Defaults home, never
 *      sticky, one tap to flip to gym. Feeds which of
 *      homeEquipment/gymEquipment the equipment step reads from --
 *      the actual fix for workoutGenerator.js's flat-merged-equipment
 *      problem, scoped down to what session-builder controls directly
 *      rather than touching the shared function.
 *   3. Allocation presets on the duration screen (Balanced / Mostly
 *      strength / Mostly mobility) -- session-builder.js's
 *      ALLOCATION_PRESETS, exposed here as three buttons rather than
 *      a fully custom slider (blueprint's deliberate v1 scope).
 *   4. Build-mode step -- Coach builds it / Coach recommends, I'll
 *      choose / Build my own -- mirrors conditionProgrammes.js's
 *      three-route architecture (not its persistent-storage model;
 *      this still produces a one-off generatedSession, same as
 *      before). "Coach builds it" is the unchanged existing flow.
 *   5. Candidate picker step for the other two modes -- checkboxes
 *      per section, pre-checked for "recommends", empty for "build
 *      your own". Client-side guard: warmup can't be fully
 *      unchecked (session-builder.js also enforces this server-side
 *      as a hard floor -- belt and suspenders, not redundant).
 *
 * 04 Aug 2026 v3
 *
 * v3 -- Equipment step copy now adapts to whether anything's actually
 *   saved in settings. Found via screenshot: with no saved equipment,
 *   every checkbox correctly renders unticked, but the copy still said
 *   "untick anything you don't have" -- confusing against an empty
 *   list with nothing to untick. Now says "tick anything you have
 *   today" when nothing's saved, keeping the existing "untick" framing
 *   only when there's real saved equipment to start from.
 *
 * 03 Aug 2026 v2
 *
 * v2 -- Fixed isPremium()'s tier check: was reading store.get("userTier"),
 *   a field with no writer anywhere in the app, so the check always
 *   evaluated false and Personal-tier options rendered as locked for
 *   every user, including paying Personal/Athlete subscribers. Found
 *   during BUILD-4 Appendix A follow-up (03 Aug). Now reads the genuine
 *   live field, store.get("tier"), matching settings.js/progress.js/
 *   coach-proposal.js.
 *
 * v1 -- Equipment screen visual feedback fix:
 *   Checkbox change listener now immediately updates the parent label's
 *   border colour so the user sees instant visual confirmation of their
 *   selection. Previously the border was set once at render time and
 *   never changed -- taps appeared to do nothing.
 *   Each label now carries a data-equipment attribute matching its
 *   checkbox so the JS can target it directly without DOM traversal.
 *
 * (Renamed from session-builder-ui.js so router can load it as "session-builder" route.
 *
 * 21 May 2026 v1
 *
 * The user-facing flow for building a bespoke gym session:
 *   1. Pick session type (7 tiles)
 *   2. Choose duration (15 / 30 / 45 / 60 min)
 *   3. Equipment check (pre-filled from settings, overridable this session)
 *   4. Loading state with coach line
 *   5. Session preview -- coach rationale + exercise overview
 *   6. "Let's go" -> gym-programme.js renders the generated session
 *
 * Tier gating:
 *   Free: "Balanced Full-Body" only. Duration fixed at 30 min.
 *         Equipment override not available.
 *   Personal+: All 7 session types. All durations. Equipment override.
 *
 * Route: "session-builder"
 * Entry points:
 *   - Coach proposal "Something else entirely" button
 *   - Library tab "Build a session" tile
 *   - Library "At the gym" cards (05 Aug 2026) -- pre-selected type
 *
 * Spec: alongside_session_builder_spec_17may2026_v1.docx
 */

import { store }                          from "../store.js";
import { router }                         from "../router.js";
import { SESSION_TYPES, ALLOCATION_PRESETS, buildSession, buildCandidatePools, buildSessionFromSelection, severeZoneToday, zonesWithCoverage } from "../session-builder.js";
import { zonesForGoal, STRETCH_GOAL_ZONES } from "../data/stretch-goal-zones.js";
// R4, 20 Aug 2026. isPremium/lockedFeature are no longer used in this
// file. Every step of the builder -- type, duration, allocation split,
// location, build mode -- is now free. The import is REMOVED rather than
// left: an unused paywall import is a working example somebody copies,
// and it makes verify-tier.mjs unable to tell a live gate from a dead
// one. Restore it deliberately if a step ever becomes paid again.

/**
 * The person's saved allocation preset, validated against the live
 * preset list rather than a hardcoded array -- a preset removed from
 * ALLOCATION_PRESETS must not leave somebody stuck on a dead id.
 */
function _savedPreset() {
  const saved = store.get("sessionPreset");
  return ALLOCATION_PRESETS.some(p => p.id === saved) ? saved : "balanced";
}
import { resolveEquipment }               from "../data/equipment-map.js";

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────
// ── Duration display (11 Aug 2026) ────────────────────────────────────────────
// Raw seconds were being printed straight onto the preview list, so a
// five-minute cross-trainer warm-up read "300s". Accurate and unreadable:
// nobody thinks in seconds above about ninety of them. Translates to the
// unit a person would actually say out loud, and leaves genuinely short
// holds in seconds where that is the natural way to say it.
function formatDuration(seconds) {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s <= 0) return "";
  if (s < 90) return `${s}s`;
  const mins = s / 60;
  if (Number.isInteger(mins)) return `${mins} min`;
  const whole = Math.floor(mins);
  const rem   = s - whole * 60;
  return rem === 30 ? `${whole}\u00BD min` : `${whole} min ${rem}s`;
}

let phase             = "type";      // "type" | "location" | "duration" | "equipment" | "buildmode" | "candidates" | "loading" | "preview"
let selectedType      = null;
let selectedLocation  = "home";      // "home" | "gym" -- never sticky, reset on resetState()
let selectedDuration  = null;
// D3, 13 Aug 2026. Seeded from the store rather than hardcoded, and
// written back on every choice. Persona 2.15 trains four times a week
// and wants "Mostly strength" every time; she was re-picking it from
// scratch at every session, because this was module state reset on
// every mount. Remembering it is not a feature, it is the absence of
// an irritation.
let selectedPreset    = _savedPreset();
let buildMode         = null;        // "coach" | "recommend" | "own"
let candidatePools    = null;
let selectedCandidateIds = new Set();
let equipmentOverride = null;       // null = use store defaults; array = this-session override
let builtSession       = null;
let entryDoor          = null;      // BACK-DOOR: the door that preselected a type
let selectedZones      = [];        // ZONE-1: body zones for a stretch session
let zonesPrefilled     = false;     // ARC-1: guards the goal prefill to once per flow
let preselectChecked   = false;     // guards the store-preselect read to run once per mount

// ── Tier check ────────────────────────────────────────────────────────────────
// 11 Aug 2026 v5 (WOW-4/PT-7) — local isPremium() removed. This file had its
// own copy, byte-identical in behaviour to auth.js's, which is exactly the
// drift auth.js exists to prevent (v2 had already fixed a userTier/tier bug
// in this very duplicate). Now imported. Single implementation, one place to
// change if tier names ever move.

// ── Duration options ──────────────────────────────────────────────────────────
// PICKER-GROUP, 31 Aug 2026. Grouping only -- SESSION_TYPES stays the
// single source of truth for what a type IS. Any type NOT listed here
// still renders, under "More", so adding a session type can never make
// it vanish from the picker. That failure mode -- a new type silently
// absent because a second list was not updated -- is exactly what
// verify-w2's hardcoded id list did.
const TYPE_GROUPS = [
  { label: "Strength",           ids: ["full", "upper", "lower", "glute", "core"] },
  { label: "Cardio",             ids: ["cardio"] },
  { label: "Mobility & Stretch", ids: ["mobility", "stretch"] },
];

const DURATIONS = [
  { mins: 15, label: "15 min", desc: "Quick and focused" },
  { mins: 30, label: "30 min", desc: "A proper session" },
  { mins: 45, label: "45 min", desc: "Full programme" },
  { mins: 60, label: "60 min", desc: "When you have the time" }
];

// ── Equipment list (subset of store.equipment values) ─────────────────────────
// 05 Aug 2026 -- added bike/treadmill/cross-trainer/rowing-machine, matching
// session-builder.js's new cardio-warmup exercise entries. Previously this
// list had no cardio-machine options at all -- a real, confirmed gap.
const EQUIPMENT_OPTIONS = [
  { id: "dumbbells",        label: "Dumbbells" },
  { id: "barbell",          label: "Barbell" },
  { id: "kettlebells",      label: "Kettlebells" },
  { id: "cable-machine",    label: "Cable machine" },
  { id: "resistance-bands", label: "Resistance bands" },
  { id: "bench",            label: "Bench" },
  { id: "squat-rack",       label: "Squat rack" },
  { id: "pull-up-bar",      label: "Pull-up bar" },
  { id: "box-or-step",      label: "Box or step" },
  { id: "foam-roller",      label: "Foam roller" },
  { id: "leg-curl-machine", label: "Leg curl machine" },
  { id: "bike",             label: "Stationary bike" },
  { id: "treadmill",        label: "Treadmill" },
  { id: "cross-trainer",    label: "Cross trainer" },
  { id: "rowing-machine",   label: "Rowing machine" }
];

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  // ── BYPASS-DOOR ────────────────────────────────────────────────────
  //
  // Ask the question before the work, not after it. The severe bypass has
  // always fired inside buildSession() and buildSessionFromSelection(),
  // which is correct and unchanged -- but it fired at the END. On device
  // at pain 8: type, duration, split, equipment, hand-pick ten exercises,
  // and then the Gentle Care card. The answer had been fixed before the
  // first tap and the five minutes were spent for nothing.
  //
  // Worse than wasted time, it reads as the coach ignoring you. Somebody
  // who asked for mostly-mobility and got breathing exercises reasonably
  // concludes the coach got it wrong, rather than that it was listening.
  //
  // There is no override here on purpose. At 8 the answer is no session,
  // so the alternative offered is leaving the builder, not building
  // anyway. Adding a "build it regardless" escape would be a clinical
  // loosening and is not mine to make.
  if (phase !== "preview" || !builtSession?.gentleCare) {
    const severeZone = severeZoneToday();
    if (severeZone) {
      builtSession = buildSession({
        sessionType:  selectedType || "full",
        durationMins: selectedDuration || 20
      });
      phase = "preview";
      return renderPreview();
    }
  }

  if (phase === "type")       return renderTypePicker();
  if (phase === "location")   return renderLocationStep();
  if (phase === "zones")      return renderZonePicker();
  if (phase === "duration")   return renderDurationPicker();
  if (phase === "equipment")  return renderEquipmentCheck();
  if (phase === "buildmode")  return renderBuildModeStep();
  if (phase === "candidates") return renderCandidatePicker();
  if (phase === "loading")    return renderLoading();
  if (phase === "preview")    return renderPreview();
  return renderTypePicker();
}

// 05 Aug 2026 -- "Just one more thing, where are you for this?" Shown once,
// right after type selection. Defaults home, never sticky -- no memory of a
// past answer, so it can never go stale. Feeds which of home/gymEquipment
// the equipment step reads from.

/**
 * SB-META, 12 Aug 2026. Builds the small line under an exercise name.
 *
 * Every field was interpolated unguarded, so a missing one printed the
 * literal word "undefined" -- "Fire Hydrant undefined sets 1.5 min
 * undefined". On the session overview, which is the screen where
 * somebody decides whether this coach knows what it is doing.
 *
 * Not every exercise has sets or a tempo: a timed hold has a duration and
 * nothing else, and the database is honest about that. The rendering was
 * not. Parts are collected and joined, so an exercise with only a
 * duration shows only a duration.
 */
function _exerciseMeta(ex, opts = {}) {
  const parts = [];
  if (ex.sets) parts.push(`${ex.sets} set${ex.sets === 1 ? "" : "s"}`);
  const amount = ex.reps || formatDuration(ex.duration);
  if (amount) parts.push(amount);
  if (ex.tempo) parts.push(ex.tempo);
  if (opts.rest && ex.rest && ex.rest !== "0s") parts.push(`rest ${ex.rest}`);
  return parts.join(" &nbsp; ");
}

function renderLocationStep() {
  const type = SESSION_TYPES.find(t => t.id === selectedType);
  return `
    <div class="view session-builder-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="sb-back-btn" aria-label="Back to session type">
          &larr; Back
        </button>
        <span class="workout-header-title">${type?.label || "Build a session"}</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">Just one more thing &mdash; where are you for this?</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--space-3);" role="group" aria-label="Choose location">
        <button class="card sb-location-btn ${selectedLocation === 'home' ? 'sb-location-btn--selected' : ''}"
                data-location="home"
                style="display:flex;align-items:center;gap:var(--space-4);text-align:left;width:100%;cursor:pointer;background:var(--color-surface);
                       border:2px solid ${selectedLocation === 'home' ? 'var(--color-primary)' : 'transparent'};"
                aria-pressed="${selectedLocation === 'home'}">
          <span style="font-size:1.75rem;flex-shrink:0;" aria-hidden="true">&#127968;</span>
          <span style="font-weight:var(--font-semibold);">Home</span>
        </button>
        <button class="card sb-location-btn ${selectedLocation === 'gym' ? 'sb-location-btn--selected' : ''}"
                data-location="gym"
                style="display:flex;align-items:center;gap:var(--space-4);text-align:left;width:100%;cursor:pointer;background:var(--color-surface);
                       border:2px solid ${selectedLocation === 'gym' ? 'var(--color-primary)' : 'transparent'};"
                aria-pressed="${selectedLocation === 'gym'}">
          <span style="font-size:1.75rem;flex-shrink:0;" aria-hidden="true">&#127939;</span>
          <span style="font-weight:var(--font-semibold);">Gym</span>
        </button>
      </div>

      <button class="btn btn-primary btn-large btn-full" id="sb-location-continue-btn" style="margin-top: var(--space-6);">
        Continue
      </button>

    </div>
  `;
}

// R4, 20 Aug 2026. The type picker no longer gates. Every SESSION_TYPES
// entry is pressable on every tier. Choosing what you work on today is
// self-direction, and self-direction is an accessibility feature.
/**
 * PICKER-GROUP. Groups by TYPE_GROUPS, then sweeps up anything not
 * listed into "More". The sweep is the point: the grouping list must
 * never be able to hide a session type that SESSION_TYPES defines.
 */
function _groupedTypes() {
  const claimed = new Set(TYPE_GROUPS.flatMap(g => g.ids));
  const groups  = TYPE_GROUPS
    .map(g => ({ label: g.label, types: g.ids.map(id => SESSION_TYPES.find(t => t.id === id)).filter(Boolean) }))
    .filter(g => g.types.length);
  const rest = SESSION_TYPES.filter(t => !claimed.has(t.id));
  if (rest.length) groups.push({ label: "More", types: rest });
  return groups;
}

function renderTypePicker() {
  return `
    <div class="view session-builder-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="sb-back-btn" aria-label="Go back">
          &larr; Back
        </button>
        <span class="workout-header-title">Build a session</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          Tell me what you want to work on today. I'll build something around your equipment and how you're feeling.
        </p>
      </div>

      <!-- PICKER-GROUP. Eight types in one flat list read as a single
           undifferentiated run, so Stretch -- appended last -- looked
           like the tail of the strength and cardio block. Graeme: its
           natural home is with Mobility. Grouping also makes the picker
           scannable: somebody who wants to move gently should not have
           to read past five strength options to learn that is offered. -->
      ${_groupedTypes().map(g => `
        <h2 class="sb-group-heading">${g.label}</h2>
        <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-5);"
             role="group" aria-label="${g.label} sessions">
        ${g.types.map(t => {
          const inner = `
              <span style="font-size:2rem;flex-shrink:0;line-height:1;" aria-hidden="true">${t.icon}</span>
              <div style="flex:1;min-width:0;">
                <p style="font-size:var(--text-base);font-weight:var(--font-semibold);margin-bottom:var(--space-1);">${t.label}</p>
                <p class="text-secondary" style="font-size:var(--text-sm);">${t.description}</p>
              </div>`;

          // R4, 20 Aug 2026. The lockedFeature() branch that stood here is
          // GONE. WOW-4/PT-7's reasoning was about making a locked tile
          // reachable by keyboard; the tile is not locked any more, so
          // there is nothing to reach. Priya (persona 2.15) taps "Lower
          // body" and gets lower body.
          return `
            <button class="card sb-type-tile"
                    data-type="${t.id}"
                    style="display:flex;align-items:center;gap:var(--space-4);text-align:left;width:100%;cursor:pointer;background:var(--color-surface);"
                    aria-label="${t.label}">
              ${inner}
              <span style="color:var(--color-primary);font-size:1.25rem;flex-shrink:0;" aria-hidden="true">&#8250;</span>
            </button>
          `;
        }).join("")}
        </div>
      `).join("")}

      <!-- R4, 20 Aug 2026. A free-tier footnote reading "All session
           types come with the Plan" stood here. Removed: every session
           type IS free now, so the line was not merely redundant but
           untrue. It was also the only remaining reference to the
           premium local, which is why the view threw on render once that
           local went -- caught by verify-tiergh.mjs EXECUTING the view,
           not by any source-text check and not by node --check.

           NOTE, and it cost two attempts: no backtick may appear in a
           comment that sits inside a template literal. The comment does
           not protect it -- it closes the template. -->

    </div>
  `;
}

// R4, 20 Aug 2026. Ungated, same reasoning as the type picker. The
// person with forty minutes and the person with ten are both telling the
// coach something true about today.
/**
 * ZONE-1. Offered only for Stretch, and only zones the library can
 * actually fill -- zonesWithCoverage() counts live. Multi-select, and
 * choosing nothing is a real answer, not a skipped step: "wherever you
 * need it" is what most people want most days.
 */
function renderZonePicker() {
  const zones     = zonesWithCoverage();
  const available = zones.map(z => z.id);

  // ARC-1. The goal leans the picker, it does not decide it. Suggested
  // zones arrive pre-selected and every one can be turned off -- which is
  // the difference between a coach with a view and a coach with a plan
  // you are not allowed to change.
  const goalId    = (store.get("strategicGoal") || {}).primaryGoal;
  const suggested = zonesForGoal(goalId).filter(id => available.includes(id));
  if (!zonesPrefilled) {
    zonesPrefilled = true;
    if (suggested.length) selectedZones = suggested.slice();
  }

  // What the arc has not come to yet. A fact about the PLAN, never about
  // the person: "shoulders have not come up" is not "you have skipped
  // shoulders", and no number reaches the screen either way.
  const arc     = store.get("stretchArc") || {};
  const missing = arc.active
    ? store.zonesNotRecentlyWorked(available, 2)
        .filter(id => !selectedZones.includes(id))
    : [];
  const missingLabels = missing
    .map(id => (zones.find(z => z.id === id) || {}).label)
    .filter(Boolean);
  return `
    <div class="sb-view" role="main">
      <div class="sb-header">
        <button class="btn btn-ghost" id="sb-back-btn" aria-label="Go back">&larr; Back</button>
        <span class="sb-header-title">Stretch</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          ${suggested.length
            ? "I've leaned these towards what you're working on. Change any of them."
            : "Anywhere you want me to focus? Pick as many as you like, or none."}
        </p>
      </div>

      ${missingLabels.length ? `
        <p class="sb-zone-note">
          ${missingLabels.length === 1
            ? `${missingLabels[0]} hasn't come up yet.`
            : `${missingLabels.slice(0, -1).join(", ")} and ${missingLabels.slice(-1)} haven't come up yet.`}
        </p>
      ` : ""}

      <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-5);"
           role="group" aria-label="Choose body zones">
        ${zones.map(z => `
          <button class="sb-zone-chip ${selectedZones.includes(z.id) ? "sb-zone-chip--on" : ""}"
                  data-zone="${z.id}"
                  aria-pressed="${selectedZones.includes(z.id)}">
            ${z.label}
          </button>
        `).join("")}
      </div>

      <button class="btn btn-primary btn-large btn-full" id="sb-zones-continue-btn">
        ${selectedZones.length ? "Continue" : "Wherever you need it"}
      </button>
    </div>`;
}

function renderDurationPicker() {
  const type    = SESSION_TYPES.find(t => t.id === selectedType);

  return `
    <div class="view session-builder-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="sb-back-btn" aria-label="Back to session type">
          &larr; Back
        </button>
        <span class="workout-header-title">${type?.label || "Build a session"}</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">How long have you got today?</p>
      </div>

      <!-- SPLIT-ORDER. The split used to render BELOW the durations.
           Tapping a duration advances to the equipment step immediately,
           so anybody reading top-down left the screen before reaching it
           -- which is why "Mostly strength" appeared not to exist at all.
           It is not a hidden feature, it was underneath the control that
           navigates away. The choice that does not advance goes first. -->
      <p class="text-sm text-muted" style="margin-bottom: var(--space-2);">
        How should today's time split across warm-up, work, and cool-down?
      </p>
      <div style="display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-5);"
           role="group" aria-label="Choose session balance">
        ${ALLOCATION_PRESETS.map(p => `
          <button class="card sb-preset-btn ${selectedPreset === p.id ? 'sb-preset-btn--selected' : ''}"
                  data-preset="${p.id}"
                  style="display:block;text-align:left;width:100%;cursor:pointer;background:var(--color-surface);padding:var(--space-3) var(--space-4);
                         border:2px solid ${selectedPreset === p.id ? 'var(--color-primary)' : 'transparent'};"
                  aria-pressed="${selectedPreset === p.id}">
            <span style="font-weight:var(--font-semibold);">${p.label}</span>
            <span class="text-secondary" style="font-size:var(--text-sm);display:block;">${p.description}</span>
          </button>
        `).join("")}
      </div>

      <p class="text-sm text-muted" style="margin-bottom: var(--space-2);">
        Then choose how long, and we'll get going.
      </p>
      <div style="display:flex;flex-direction:column;gap:var(--space-3);"
           role="group" aria-label="Choose duration">
        ${DURATIONS.map(d => {
          const inner = `
              <div>
                <span style="font-size:var(--text-lg);font-weight:var(--font-semibold);">${d.label}</span>
                <span class="text-secondary" style="font-size:var(--text-sm);margin-left:var(--space-2);">${d.desc}</span>
              </div>`;

          const recLabel = d.mins === 30
            ? "<span style='font-size:var(--text-xs);color:var(--color-primary);flex-shrink:0;'>Recommended</span>"
            : "";
          return `
            <button class="card sb-duration-btn"
                    data-mins="${d.mins}"
                    style="display:flex;align-items:center;justify-content:space-between;text-align:left;width:100%;cursor:pointer;background:var(--color-surface);"
                    aria-label="${d.label}: ${d.desc}">
              ${inner}
              ${recLabel}
            </button>
          `;
        }).join("")}
      </div>

      <!-- R4, 20 Aug 2026. The split block was wrapped in a tier
           conditional; it is free self-direction and was unwrapped.
           SPLIT-ORDER, 31 Aug: it now renders ABOVE the durations, since
           choosing a duration navigates away. -->

    </div>
  `;
}

function renderEquipmentCheck() {
  const homeEquip = store.get("homeEquipment") || [];
  const gymEquip  = store.get("gymEquipment")  || [];
  // 05 Aug 2026 -- the actual location fix: reads the scoped list matching
  // today's answer, not the flat merged `equipment` (workoutGenerator.js's
  // problem, confirmed 04 Aug -- this is where it's fixed for the
  // session-builder path specifically, not a change to the shared field).
  // EQUIP-2, 12 Aug 2026. Graeme, second report: "Still not picking up
  // home equipment."
  //
  // EQUIP-1 named the scope in the copy, which made the behaviour
  // honest -- "Here's your home kit" -- and no more useful, because his
  // home list is genuinely empty. He saved Full gym, which is a
  // gym-scope facility, and the session defaults to the home location.
  // So he got a truthful sentence above an entirely unticked list, and
  // reasonably read it as the app having forgotten.
  //
  // FALL BACK RATHER THAN SHOW NOTHING. If the matching scope is empty
  // and the other has something in it, use the other and say so. An
  // empty list is not a safer answer than a slightly wrong one here:
  // everything on this screen is a checkbox the person can untick in a
  // tap, and the cost of guessing wrong is one tap while the cost of
  // showing nothing is re-entering a whole gym.
  //
  // Only when the matching scope is EMPTY. Somebody with both lists
  // saved still gets exactly the one they asked for.
  const matching  = selectedLocation === "gym" ? gymEquip : homeEquip;
  const other     = selectedLocation === "gym" ? homeEquip : gymEquip;
  const usingFallback = matching.length === 0 && other.length > 0;
  const savedEquip    = usingFallback ? other : matching;

  const currentEquip = equipmentOverride ?? savedEquip;

  // EQUIP-3, 12 Aug 2026. RESOLVE before comparing.
  //
  // This compared raw ids, so a saved "dumbbells-heavy" never ticked the
  // "Dumbbells" option -- the two screens use different names for the
  // same objects. Five of the fifteen options here matched by coincidence
  // of spelling; the other ten could never be ticked whatever somebody
  // saved. Graeme selected a full gym and saw Barbell, Pull-up bar and
  // Foam roller ticked: exactly the coincidences.
  //
  // equipment-map.js already existed and already did this for exercise
  // selection (CON-2, 11 Aug). This screen simply never asked it.
  //
  // An OVERRIDE is left literal: those ids came from this screen's own
  // checkboxes, so they are already in this vocabulary, and resolving
  // them would re-tick things the person had just unticked.
  const resolvedSaved = equipmentOverride ? null : resolveEquipment(currentEquip);
  const isTicked = optId => equipmentOverride
    ? equipmentOverride.includes(optId)
    : [...resolveEquipment([optId])].some(tag => resolvedSaved.has(tag));
  const hasSavedEquipment = savedEquip.length > 0;
  const scopeWord     = selectedLocation === "gym" ? "gym" : "home";
  const otherWord     = selectedLocation === "gym" ? "home" : "gym";

  return `
    <div class="view session-builder-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="sb-back-btn" aria-label="Back to duration">
          &larr; Back
        </button>
        <span class="workout-header-title">Equipment today</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          ${/* EQUIP-1, 12 Aug 2026. Graeme, device pass part 5: "Even though
                in settings my equipment says full gym, in the cardio, core,
                strength I have to select the equipment."

                The behaviour was correct and the copy was not. Equipment is
                saved per SCOPE -- homeEquipment and gymEquipment are
                separate lists -- and this screen reads the one matching
                today's location, which defaults to home. He had saved Full
                gym under the gym scope, so the session showed his home
                list and looked like it had forgotten.

                Naming the list is the whole fix. "Here's what I think you
                have access to today" is true of either list and therefore
                explains neither. */ ""}
          ${usingFallback
            ? `I haven't got a ${scopeWord} list saved, so I've started from your ${otherWord} kit. Untick anything you haven't got with you &mdash; I'll adjust the session. Changes here don't affect what you've saved.`
            : hasSavedEquipment
              ? `Here's your ${scopeWord} kit. Untick anything you haven't got with you &mdash; I'll adjust the session. Changes here don't affect what you've saved.`
              : `I haven't got any equipment saved for you yet. Tick anything you have today and I'll build around it. Changes here don't affect what you've saved.`}
        </p>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--space-2);"
           role="group" aria-label="Equipment available today">
        ${EQUIPMENT_OPTIONS.map(opt => {
          const checked = isTicked(opt.id);
          return `
            <label class="sb-equipment-label"
                   data-equipment="${opt.id}"
                   style="display:flex;align-items:center;gap:var(--space-3);
                          padding:var(--space-3) var(--space-4);
                          background:var(--color-surface);
                          border-radius:var(--radius-md,8px);
                          cursor:pointer;
                          border:2px solid ${checked ? "var(--color-primary)" : "transparent"};
                          transition:border-color 0.15s ease;">
              <input type="checkbox"
                     class="sb-equipment-check"
                     data-equipment="${opt.id}"
                     ${checked ? "checked" : ""}
                     style="width:20px;height:20px;accent-color:var(--color-primary);flex-shrink:0;cursor:pointer;"
                     aria-label="${opt.label}">
              <span style="font-size:var(--text-base);">${opt.label}</span>
            </label>
          `;
        }).join("")}
      </div>

      <button class="btn btn-primary btn-large btn-full" id="sb-build-btn"
              style="margin-top: var(--space-6);">
        Build my session
      </button>

    </div>
  `;
}

// 05 Aug 2026 -- mirrors conditionProgrammes.js's three-route architecture
// (Coach builds it / Coach recommends / Build your own), not its persistent-
// storage model -- this still produces a one-off generatedSession, same as
// before. "Coach builds it" is the unchanged existing flow.
// R4, 20 Aug 2026. TIER-G is REVERSED. This helper locked two of the
// three build routes for free users, one week after TIER-G added the
// lock. The reasoning then was that composing is the paid act; the
// reasoning now is that composing is how somebody with a body the
// default does not fit gets a session they can actually do.
//
// The `premium` parameter is removed along with the branch. Leaving a
// dead parameter would have been the smaller edit, and the wrong one:
// the next person to read this signature would reasonably assume the
// tier still decides something here.
function _buildModeOption(mode, title, blurb) {
  const inner = `
      <span style="font-weight:var(--font-semibold);">${title}</span>
      <span class="text-secondary text-sm">${blurb}</span>`;

  return `
    <button class="card sb-buildmode-btn" data-mode="${mode}"
            style="display:flex;flex-direction:column;align-items:flex-start;text-align:left;width:100%;cursor:pointer;background:var(--color-surface);padding:var(--space-4);">
      ${inner}
    </button>
  `;
}

//
// TIER-G, 18 Aug 2026 -- ADDED, AND REVERSED TWO DAYS LATER, and both
// decisions are recorded because the reversal is the useful part.
//
// TIER-G locked "Coach recommends" and "Build my own" against section 4
// of the 12 Aug boundary: free is "Full body only. The coach decides."
// R4 retires that boundary. Self-direction is an accessibility feature,
// and the free tier is not a place where the coach refuses to let you
// choose. All three routes are open on every tier.
//
// What survives from TIER-G is the layout argument: a screen with one
// button on it is a question with one answer. It now has three.
function renderBuildModeStep() {
  const type = SESSION_TYPES.find(t => t.id === selectedType);
  return `
    <div class="view session-builder-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="sb-back-btn" aria-label="Back to equipment">
          &larr; Back
        </button>
        <span class="workout-header-title">${type?.label || "Build a session"}</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">How would you like to build today's session?</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--space-3);" role="group" aria-label="Choose how to build this session">
        <button class="card sb-buildmode-btn" data-mode="coach"
                style="display:flex;flex-direction:column;align-items:flex-start;text-align:left;width:100%;cursor:pointer;background:var(--color-surface);padding:var(--space-4);">
          <span style="font-weight:var(--font-semibold);">Coach builds it</span>
          <span class="text-secondary text-sm">I'll pick everything for you, based on your equipment and how you're doing today.</span>
        </button>
        ${_buildModeOption(
          "recommend", "Coach recommends, I'll choose",
          "I'll suggest a starting selection from a wider list — swap anything you like."
        )}
        ${_buildModeOption(
          "own", "Build my own",
          "Pick everything yourself from what's available today."
        )}
      </div>

      <!-- R4, 20 Aug 2026. A free-tier footnote reading "Choosing your
           own movements is part of the Plan" stood here. Removed for the
           same reason as its twin in the type picker: it is no longer
           true. Choosing your own movements is free, and it is arguably
           the single most important thing to be free -- the person whose
           body does not fit the default is the person who most needs to
           override it. -->

    </div>
  `;
}

const CANDIDATE_SECTION_LABELS = { warmup: "Warm-up", main: "Main session", cooldown: "Cool-down" };

// 05 Aug 2026 -- checkboxes per section, pre-checked for "recommends",
// empty for "build your own" (buildMode controls the initial checked state
// only -- both modes render from the identical candidatePools list).
// Client-side guard: warmup can't be fully unchecked. session-builder.js's
// buildSessionFromSelection() also enforces this server-side as a hard
// floor -- belt and suspenders, not redundant, since the UI guard is about
// good in-the-moment feedback and the server floor is about correctness
// even if the UI guard is ever bypassed.
function renderCandidatePicker() {
  if (!candidatePools) return renderLoading();
  const type = SESSION_TYPES.find(t => t.id === selectedType);
  const heading = buildMode === "recommend" ? "Here's what I'd suggest — swap anything you like" : "Pick what you'd like to do today";

  const renderSection = (key) => {
    const items = candidatePools[key];
    if (!items || items.length === 0) return "";
    return `
      <p class="sb-section-label text-xs text-muted" style="margin-top: var(--space-4);">${CANDIDATE_SECTION_LABELS[key]}</p>
      <div style="display:flex;flex-direction:column;gap:var(--space-2);">
        ${items.map(ex => {
          const checked = selectedCandidateIds.has(ex.id);
          return `
            <label class="sb-candidate-label" data-candidate="${ex.id}" data-section="${key}"
                   style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);
                          background:var(--color-surface);border-radius:var(--radius-md,8px);cursor:pointer;
                          border:2px solid ${checked ? "var(--color-primary)" : "transparent"};">
              <input type="checkbox" class="sb-candidate-check" data-candidate="${ex.id}" data-section="${key}"
                     ${checked ? "checked" : ""}
                     style="width:20px;height:20px;accent-color:var(--color-primary);flex-shrink:0;cursor:pointer;"
                     aria-label="${ex.name}">
              <span>${ex.name}</span>
            </label>
          `;
        }).join("")}
      </div>
    `;
  };

  return `
    <div class="view session-builder-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="sb-back-btn" aria-label="Back">
          &larr; Back
        </button>
        <span class="workout-header-title">${type?.label || "Build a session"}</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${heading}</p>
      </div>

      ${renderSection("warmup")}
      ${renderSection("main")}
      ${renderSection("cooldown")}

      <button class="btn btn-primary btn-large btn-full" id="sb-candidate-build-btn" style="margin-top: var(--space-6);">
        Build this session
      </button>

    </div>
  `;
}

function renderLoading() {
  const type = SESSION_TYPES.find(t => t.id === selectedType);
  return `
    <div class="view session-builder-view" style="text-align: center;">
      <div style="margin-top: var(--space-10);">
        <div class="card card-coach">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="coach-message-text" aria-live="polite" aria-busy="true">
            Building your ${type?.label?.toLowerCase() || "session"} -- one moment.
          </p>
        </div>
        <div class="sb-loading-spinner" aria-hidden="true"></div>
      </div>
    </div>
  `;
}

function renderPreview() {
  if (!builtSession) return renderLoading();

  const type     = SESSION_TYPES.find(t => t.id === selectedType);
  const warmup   = builtSession.exercises.filter(e => e.section === "warmup");
  const main     = builtSession.exercises.filter(e => e.section === "main");
  const cooldown = builtSession.exercises.filter(e => e.section === "cooldown");

  return `
    <div class="view session-builder-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="sb-back-btn" aria-label="Build a different session">
          &larr; Different session
        </button>
        <span class="workout-header-title">${builtSession.title}</span>
      </div>

      ${builtSession.gentleCare ? `
        <!-- BYPASS-RED. The coachLine below says this, but it says it in
             body prose, and body prose is what people skim once they have
             read a few of them. Somebody who asked for mostly-mobility and
             skims past the explanation concludes the coach got the session
             wrong. The number is stated outright, in the same rose
             language the hazard list uses, so there is one visual grammar
             for "this is not ordinary text". -->
        <div class="sb-severe-banner" role="note">
          <p class="sb-severe-banner__head">Your session has been changed</p>
          <p class="sb-severe-banner__body">
            You logged pain in your ${builtSession.severeZone || "body"} at 8 or above today.
            At that level I do not build a training session. This is not the session you
            asked for, and that is deliberate.
          </p>
        </div>
      ` : ""}

      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p class="coach-message-text">${builtSession.coachLine}</p>
          ${builtSession.rationale?.opening ? `
            <p class="sb-rationale">${builtSession.rationale.opening}</p>
          ` : ""}
          <p class="text-sm text-muted" style="margin-top: var(--space-2);">
            ${builtSession.duration} &nbsp;&middot;&nbsp; ${builtSession.exercises.length} exercises
          </p>
          ${builtSession.rationale?.arc ? `
            <details class="sb-rationale-arc">
              <summary>What this is building</summary>
              <p>${builtSession.rationale.arc}</p>
            </details>
          ` : ""}
        </div>
      </div>

      <div class="sb-exercise-list" role="list">

        ${warmup.length > 0 ? `
          <p class="sb-section-label text-xs text-muted">Warm-up</p>
          ${builtSession.rationale?.sections?.warmup ? `<p class="sb-section-why coach-voice">${builtSession.rationale.sections.warmup}</p>` : ""}
          ${warmup.map(ex => `
            <div class="sb-exercise-item" role="listitem">
              <div class="sb-exercise-left">
                <span class="sb-exercise-name">${ex.name}</span>
                <span class="sb-exercise-meta text-xs text-muted">
                  ${_exerciseMeta(ex)}
                </span>
              </div>
            </div>
          `).join("")}
        ` : ""}

        ${main.length > 0 ? `
          <p class="sb-section-label text-xs text-muted" style="margin-top: var(--space-3);">Main session</p>
          ${builtSession.rationale?.sections?.main ? `<p class="sb-section-why coach-voice">${builtSession.rationale.sections.main}</p>` : ""}
          ${main.map(ex => `
            <div class="sb-exercise-item" role="listitem">
              <div class="sb-exercise-left">
                <span class="sb-exercise-name">${ex.name}</span>
                <span class="sb-exercise-meta text-xs text-muted">
                  ${_exerciseMeta(ex, { rest: true })}
                </span>
              </div>
            </div>
          `).join("")}
        ` : ""}

        ${cooldown.length > 0 ? `
          <p class="sb-section-label text-xs text-muted" style="margin-top: var(--space-3);">Cool-down</p>
          ${builtSession.rationale?.sections?.cooldown ? `<p class="sb-section-why coach-voice">${builtSession.rationale.sections.cooldown}</p>` : ""}
          ${cooldown.map(ex => `
            <div class="sb-exercise-item" role="listitem">
              <div class="sb-exercise-left">
                <span class="sb-exercise-name">${ex.name}</span>
                <span class="sb-exercise-meta text-xs text-muted">
                  ${_exerciseMeta(ex)}
                </span>
              </div>
            </div>
          `).join("")}
        ` : ""}

      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-6);">
        <button class="btn btn-primary btn-large btn-full" id="sb-go-btn">
          Let's go
        </button>
        <button class="btn btn-ghost btn-full" id="sb-rebuild-btn">
          ${builtSession.gentleCare ? "Back to Today" : "Build a different one"}
        </button>
      </div>

    </div>
  `;
}

// ── Rerender ──────────────────────────────────────────────────────────────────

function rerender() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}

// ── Build and navigate ────────────────────────────────────────────────────────

function triggerBuild() {
  phase = "loading";
  rerender();

  // Artificial pause (1.2s) makes the coach feel like she's thinking
  setTimeout(() => {
    builtSession = buildSession({
      sessionType:       selectedType,
      durationMins:      selectedDuration,
      equipmentOverride: equipmentOverride,
      preset:            selectedPreset
    });

    if (!builtSession) {
      router.navigate("today");
      return;
    }

    phase = "preview";
    rerender();
  }, 1200);
}

// 05 Aug 2026 -- "coach recommends" / "build your own" path. Same loading
// beat as triggerBuild() for consistency, then hands off to
// buildSessionFromSelection() instead of buildSession().
function triggerCandidateBuild() {
  phase = "loading";
  rerender();

  setTimeout(() => {
    builtSession = buildSessionFromSelection({
      sessionType:       selectedType,
      durationMins:      selectedDuration,
      selectedIds:        Array.from(selectedCandidateIds),
      equipmentOverride: equipmentOverride
    });

    if (!builtSession) {
      router.navigate("today");
      return;
    }

    phase = "preview";
    rerender();
  }, 1200);
}

function resetState() {
  phase                = "type";
  selectedType         = null;
  selectedLocation      = "home";
  selectedDuration      = null;
  // D3: the reset returns to the person's SAVED preset, not to
  // "balanced". Resetting a remembered preference to a default is the
  // same bug in a different place -- it would have made the store write
  // look correct while the behaviour stayed unchanged.
  selectedPreset        = _savedPreset();
  buildMode             = null;
  candidatePools        = null;
  selectedCandidateIds  = new Set();
  equipmentOverride     = null;
  builtSession          = null;
  preselectChecked      = false;
  entryDoor             = null;
  selectedZones         = [];
  zonesPrefilled        = false;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {

  // 05 Aug 2026 -- pre-selected type from Library's gym cards, read once.
  // Set by library.js as store.set("sessionBuilderPreselect", { type }) just
  // before navigating here -- same "read once, clear it" pattern
  // running-session.js's resume-checkpoint reading already established.
  if (!preselectChecked && phase === "type") {
    preselectChecked = true;
    const pre = store.get("sessionBuilderPreselect");
    if (pre && pre.type && SESSION_TYPES.some(t => t.id === pre.type)) {
      store.set("sessionBuilderPreselect", null);
      selectedType = pre.type;
      // BACK-DOOR, 31 Aug 2026. Records which door sent us. A preselect
      // SKIPS the type picker, so backing out of the next screen must
      // return to the door -- not walk forward into a screen the person
      // never saw, showing session types from a door they did not open.
      entryDoor = pre.returnTo || null;

      // TIER-B, 13 Aug 2026. The silent downgrade is gone. This line
      // used to read:
      //     if (!isPremium()) { selectedType = "full"; selectedDuration = 30; }
      // -- so a free user who tapped "Lower body" in the Library was
      // handed a 30-minute Full Body session with no badge, no
      // explanation and no route to upgrade. It was the quietest
      // paywall in the product and the only one that lied.
      //
      // R4, 20 Aug 2026. The upgrade-route guard that stood here is
      // GONE. It caught a free user arriving with any preselect other
      // than "full" and sent them to the paywall. Those cards are free
      // now, so the guard would fire on a legitimate journey -- a
      // paywall in front of an open door.
      //
      // The rule it was protecting SURVIVES and is worth restating: if a
      // route is not available, send the person to the door and say so.
      // Never substitute silently. That is still the standard here; it
      // just has nothing left to catch on this path.

      // R4, 20 Aug 2026. Was `isPremium() ? "location" : "equipment"`.
      // The free path skipped the location step entirely, so a free user
      // was never asked whether they were at home or at the gym -- the
      // coach GUESSING instead of asking, which is the one thing this
      // product is built not to do.
      phase = "location";
      rerender();
      return;
    }
  }

  // Back button
  document.getElementById("sb-back-btn")?.addEventListener("click", () => {
    // Same trap as sb-rebuild-btn: any backward step re-enters the door.
    if (builtSession?.gentleCare) {
      resetState();
      router.navigate("today");
      return;
    }
    if (phase === "type") {
      // Captured BEFORE resetState(), which nulls it. Read after, this
      // always fell through to "today" and the door was silently lost.
      const door = entryDoor || "today";
      resetState();
      router.navigate(door);
    } else if (phase === "location") {
      // BACK-DOOR. When a door preselected the type, the picker was
      // never shown -- so going back to it would present session types
      // belonging to a different door. Return to the door instead.
      if (entryDoor) {
        const door = entryDoor;
        resetState();
        router.navigate(door);
        return;
      }
      phase = "type";
      rerender();
    } else if (phase === "duration") {
      // ZONE-1. Back through the step that was actually shown.
      phase = selectedType === "stretch" ? "zones" : "location";
      rerender();
    } else if (phase === "zones") {
      // BACK-DOOR still applies: a preselected type skipped the picker,
      // so backing out of the first shown step returns to the door.
      if (entryDoor) {
        const door = entryDoor;
        resetState();
        router.navigate(door);
        return;
      }
      phase = "location";
      rerender();
    } else if (phase === "equipment") {
      phase = "duration";   // R4: the free path no longer skips duration
      rerender();
    } else if (phase === "buildmode") {
      phase = "equipment";
      rerender();
    } else if (phase === "candidates") {
      phase = "buildmode";
      rerender();
    } else if (phase === "preview") {
      resetState();
      rerender();
    } else {
      resetState();
      router.navigate("today");
    }
  });

  // Type selection
  document.querySelectorAll(".sb-type-tile").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedType = btn.dataset.type;

      // TIER-B, 13 Aug 2026. This branch used to reassign
      // selectedType = "full" and selectedDuration = 30 for free users.
      // It was DEAD in practice -- locked types render through
      // lockedFeature(), which produces no .sb-type-tile, so the only
      // tile a free user can click is already "full" -- but it was the
      // same silent-substitution pattern, byte for byte, as the live
      // bug in the Library preselect path.
      //
      // Removed rather than left as harmless. Dead code that performs a
      // forbidden behaviour is a working example somebody copies, and
      // it makes the gate unable to tell dead from live. The free path
      // now sets the duration it is entitled to and says so.
      // R4, 20 Aug 2026. The free branch here set selectedDuration = 30
      // and jumped to equipment, because 30 minutes was "the free tier's
      // only length". It is not any more. One path for everybody.
      phase = "location";
      rerender();
    });
  });

  // Location selection (05 Aug 2026) -- picking highlights, doesn't auto-advance
  document.querySelectorAll(".sb-location-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedLocation = btn.dataset.location;
      rerender();
    });
  });
  // ZONE-1. Toggling is local; nothing is stored until Continue, so
  // backing out of this step leaves no trace of a half-made choice.
  document.querySelectorAll("[data-zone]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.zone;
      selectedZones = selectedZones.includes(id)
        ? selectedZones.filter(z => z !== id)
        : selectedZones.concat(id);
      rerender();
    });
  });

  document.getElementById("sb-zones-continue-btn")?.addEventListener("click", () => {
    store.set("sessionZoneFocus", selectedZones);
    // ARC-1. Coverage is recorded when the session is BUILT, not when it
    // is finished. Making it depend on finishing would reintroduce
    // completion pressure through the back door.
    store.markZonesWorked(selectedZones);
    phase = "duration";
    rerender();
  });

  document.getElementById("sb-location-continue-btn")?.addEventListener("click", () => {
    // ZONE-1. Only Stretch asks. Every other type goes straight on, so
    // no existing flow gains a step.
    phase = selectedType === "stretch" ? "zones" : "duration";
    rerender();
  });

  // Duration selection
  document.querySelectorAll(".sb-duration-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedDuration = parseInt(btn.dataset.mins);
      // R4, 20 Aug 2026. The `else` that stood here forced
      // selectedDuration = 30, copied the flat saved equipment list into
      // the override and called triggerBuild() immediately -- so a free
      // user never saw the equipment check OR the build-mode step, and
      // the flat list is the very thing EQUIP-4 below identifies as
      // wrong. One path for everybody now.
      {
        phase = "equipment";
        // 05 Aug 2026 -- reads the location-scoped list, not the flat merged
        // `equipment` -- the actual fix for the "assumed home" bug.
        // EQUIP-4, 12 Aug 2026. DO NOT pre-seed the override.
        //
        // This set equipmentOverride to the RAW saved list the moment a
        // duration was chosen -- before the person had ticked anything.
        // EQUIP-3 then treated it as "their own tick choices" and skipped
        // resolution, so it compared "dumbbells" against a list containing
        // "adjustable-dumbbells" and found nothing.
        //
        // My own fix disabled itself. The exemption was written for a
        // person's deliberate ticks and fired before any tick existed.
        //
        // null means "nothing chosen yet, use what is saved", which is
        // what renderEquipmentCheck() already handles -- and it is the
        // only state in which resolution runs. The override is set by the
        // checkbox handler and the Build button below, which is where it
        // belongs: after somebody has actually touched something.
        equipmentOverride = null;
      }
      rerender();
    });
  });

  // Allocation preset selection (05 Aug 2026)
  document.querySelectorAll(".sb-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedPreset = btn.dataset.preset;
      // Written immediately, not on session start: somebody who changes
      // their mind and backs out has still told us something true.
      store.set("sessionPreset", selectedPreset);
      rerender();
    });
  });

  // Equipment toggles -- fix: update label border immediately on change
  document.querySelectorAll(".sb-equipment-check").forEach(cb => {
    cb.addEventListener("change", () => {
      // Update this label's border colour immediately for visual feedback
      const equipId = cb.dataset.equipment;
      const label   = document.querySelector(`.sb-equipment-label[data-equipment="${equipId}"]`);
      if (label) {
        label.style.borderColor = cb.checked
          ? "var(--color-primary)"
          : "transparent";
      }

      // Rebuild override from current checkbox state
      const checked = Array.from(
        document.querySelectorAll(".sb-equipment-check:checked")
      ).map(c => c.dataset.equipment);
      equipmentOverride = checked;
    });
  });

  // Build button -- 05 Aug 2026: now goes to the build-mode choice, not
  // straight to triggerBuild(). "Coach builds it" (the buildmode button
  // below) is what calls triggerBuild() -- this preserves the exact
  // existing default flow, just with an explicit choice in front of it.
  document.getElementById("sb-build-btn")?.addEventListener("click", () => {
    const checked = Array.from(
      document.querySelectorAll(".sb-equipment-check:checked")
    ).map(c => c.dataset.equipment);
    equipmentOverride = checked;
    phase = "buildmode";
    rerender();
  });

  // Build-mode selection (05 Aug 2026)
  document.querySelectorAll(".sb-buildmode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      buildMode = btn.dataset.mode;

      // R4, 20 Aug 2026. The TIER-G guard here is GONE -- all three
      // build modes are free, so there is no locked route left to catch.
      // Its principle is unchanged and still applies elsewhere: route to
      // the door, never substitute silently.

      if (buildMode === "coach") {
        triggerBuild();
        return;
      }
      candidatePools = buildCandidatePools({
        sessionType:       selectedType,
        durationMins:      selectedDuration,
        equipmentOverride: equipmentOverride,
        preset:            selectedPreset
      });
      if (!candidatePools) {
        router.navigate("today");
        return;
      }
      // "recommend" pre-checks the recommended:true items; "own" starts empty.
      selectedCandidateIds = new Set();
      if (buildMode === "recommend") {
        ["warmup", "main", "cooldown"].forEach(section => {
          candidatePools[section].forEach(ex => {
            if (ex.recommended) selectedCandidateIds.add(ex.id);
          });
        });
      }
      phase = "candidates";
      rerender();
    });
  });

  // Candidate checkbox toggles (05 Aug 2026) -- client-side guard: warmup
  // can't be fully unchecked. session-builder.js enforces the same rule
  // server-side as a hard floor regardless -- this is about good in-the-
  // moment feedback, not the only thing standing between a user and a
  // warmup-free session.
  document.querySelectorAll(".sb-candidate-check").forEach(cb => {
    cb.addEventListener("change", () => {
      const id      = cb.dataset.candidate;
      const section = cb.dataset.section;

      if (section === "warmup" && !cb.checked) {
        const stillChecked = Array.from(document.querySelectorAll('.sb-candidate-check[data-section="warmup"]:checked'));
        if (stillChecked.length === 0) {
          cb.checked = true; // revert -- at least one warmup item must stay selected
          return;
        }
      }

      const label = document.querySelector(`.sb-candidate-label[data-candidate="${id}"]`);
      if (label) label.style.borderColor = cb.checked ? "var(--color-primary)" : "transparent";

      if (cb.checked) selectedCandidateIds.add(id);
      else             selectedCandidateIds.delete(id);
    });
  });

  document.getElementById("sb-candidate-build-btn")?.addEventListener("click", () => {
    triggerCandidateBuild();
  });

  // Let's go
  document.getElementById("sb-go-btn")?.addEventListener("click", () => {
    store.set("usingGeneratedSession", true);
    router.navigate("gym-programme");
  });

  // Build a different one
  document.getElementById("sb-rebuild-btn")?.addEventListener("click", () => {
    // BYPASS-DOOR. Returning to the type picker while the door is closed
    // would land straight back on this card -- a soft trap with no way
    // out. At pain 8 the honest exit is out of the builder entirely,
    // which is what the button now says.
    if (builtSession?.gentleCare) {
      resetState();
      router.navigate("today");
      return;
    }
    builtSession = null;
    phase        = "type";
    rerender();
  });
}
