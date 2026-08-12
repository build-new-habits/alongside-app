/**
 * js/views/session-builder-ui.js - Session Builder UI
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
import { SESSION_TYPES, ALLOCATION_PRESETS, buildSession, buildCandidatePools, buildSessionFromSelection } from "../session-builder.js";
import { isPremium, lockedFeature }        from "../auth.js";

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
let selectedPreset    = "balanced";
let buildMode         = null;        // "coach" | "recommend" | "own"
let candidatePools    = null;
let selectedCandidateIds = new Set();
let equipmentOverride = null;       // null = use store defaults; array = this-session override
let builtSession       = null;
let preselectChecked   = false;     // guards the store-preselect read to run once per mount

// ── Tier check ────────────────────────────────────────────────────────────────
// 11 Aug 2026 v5 (WOW-4/PT-7) — local isPremium() removed. This file had its
// own copy, byte-identical in behaviour to auth.js's, which is exactly the
// drift auth.js exists to prevent (v2 had already fixed a userTier/tier bug
// in this very duplicate). Now imported. Single implementation, one place to
// change if tier names ever move.

// ── Duration options ──────────────────────────────────────────────────────────
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
  if (phase === "type")       return renderTypePicker();
  if (phase === "location")   return renderLocationStep();
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

function renderTypePicker() {
  const premium = isPremium();

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

      <div style="display: flex; flex-direction: column; gap: var(--space-3);"
           role="group" aria-label="Choose session type">
        ${SESSION_TYPES.map(t => {
          const locked = !premium && t.id !== "full";

          // Shared inner content — identical for locked and unlocked so the
          // two states read as the same product, not two designs.
          const inner = `
              <span style="font-size:2rem;flex-shrink:0;line-height:1;" aria-hidden="true">${t.icon}</span>
              <div style="flex:1;min-width:0;">
                <p style="font-size:var(--text-base);font-weight:var(--font-semibold);margin-bottom:var(--space-1);">${t.label}</p>
                <p class="text-secondary" style="font-size:var(--text-sm);">${t.description}</p>
              </div>`;

          // 11 Aug 2026 (WOW-4/PT-7). Locked tiles were rendered with the
          // HTML disabled attribute, which removes them from the tab order
          // entirely — so the aria-label explaining "Personal tier" was
          // unreachable by keyboard and screen reader, and tapping did
          // nothing at all. Priya (persona 2.15) taps "Lower body", wants it
          // enough to reach for it, and the app ignores her: the single best
          // conversion moment in the product, doing nothing.
          //
          // Now uses auth.js's lockedFeature(), the same treatment
          // noticing.js already uses for In Step — focusable, announced, and
          // tapping routes to /upgrade. A <div> is used inside, never a
          // <button>: lockedFeature() returns role="button" and nesting one
          // interactive control inside another is invalid.
          if (locked) {
            return lockedFeature(`
            <div class="card"
                 style="display:flex;align-items:center;gap:var(--space-4);text-align:left;width:100%;background:var(--color-surface);">
              ${inner}
            </div>
          `, "personal", t.label + " session");
          }

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

      ${!premium ? `
        <p class="text-xs text-muted" style="text-align:center; margin-top: var(--space-4);">
          All session types are available on the Personal plan.
        </p>
      ` : ""}

    </div>
  `;
}

function renderDurationPicker() {
  const premium = isPremium();
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

      <div style="display:flex;flex-direction:column;gap:var(--space-3);"
           role="group" aria-label="Choose duration">
        ${DURATIONS.map(d => {
          const locked = !premium && d.mins !== 30;
          const inner = `
              <div>
                <span style="font-size:var(--text-lg);font-weight:var(--font-semibold);">${d.label}</span>
                <span class="text-secondary" style="font-size:var(--text-sm);margin-left:var(--space-2);">${d.desc}</span>
              </div>`;

          // 11 Aug 2026 (WOW-4/PT-7) — same swap as the type picker above.
          if (locked) {
            return lockedFeature(`
            <div class="card"
                 style="display:flex;align-items:center;justify-content:space-between;text-align:left;width:100%;background:var(--color-surface);">
              ${inner}
            </div>
          `, "personal", d.label + " sessions");
          }

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

      ${isPremium() ? `
        <p class="text-sm text-muted" style="margin-top: var(--space-5); margin-bottom: var(--space-2);">
          How should today's time split across warm-up, work, and cool-down?
        </p>
        <div style="display:flex;flex-direction:column;gap:var(--space-2);" role="group" aria-label="Choose session balance">
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
      ` : ""}

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
  const savedEquip   = selectedLocation === "gym" ? gymEquip : homeEquip;
  const currentEquip = equipmentOverride ?? savedEquip;
  const equipSet     = new Set(currentEquip);
  const hasSavedEquipment = savedEquip.length > 0;

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
          ${hasSavedEquipment
            ? `Here's what I think you have access to today. Untick anything you don't have &mdash; I'll adjust the session. Changes here don't affect your saved settings.`
            : `I don't have any equipment saved for you yet. Tick anything you have today &mdash; I'll build around it. Changes here don't affect your saved settings.`}
        </p>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--space-2);"
           role="group" aria-label="Equipment available today">
        ${EQUIPMENT_OPTIONS.map(opt => {
          const checked = equipSet.has(opt.id);
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
        <button class="card sb-buildmode-btn" data-mode="recommend"
                style="display:flex;flex-direction:column;align-items:flex-start;text-align:left;width:100%;cursor:pointer;background:var(--color-surface);padding:var(--space-4);">
          <span style="font-weight:var(--font-semibold);">Coach recommends, I'll choose</span>
          <span class="text-secondary text-sm">I'll suggest a starting selection from a wider list — swap anything you like.</span>
        </button>
        <button class="card sb-buildmode-btn" data-mode="own"
                style="display:flex;flex-direction:column;align-items:flex-start;text-align:left;width:100%;cursor:pointer;background:var(--color-surface);padding:var(--space-4);">
          <span style="font-weight:var(--font-semibold);">Build my own</span>
          <span class="text-secondary text-sm">Pick everything yourself from what's available today.</span>
        </button>
      </div>

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
          ${builtSession.rationale?.sections?.warmup ? `<p class="sb-section-why">${builtSession.rationale.sections.warmup}</p>` : ""}
          ${warmup.map(ex => `
            <div class="sb-exercise-item" role="listitem">
              <div class="sb-exercise-left">
                <span class="sb-exercise-name">${ex.name}</span>
                <span class="sb-exercise-meta text-xs text-muted">
                  ${ex.sets} sets &nbsp; ${ex.reps || formatDuration(ex.duration)} &nbsp; ${ex.tempo}
                </span>
              </div>
            </div>
          `).join("")}
        ` : ""}

        ${main.length > 0 ? `
          <p class="sb-section-label text-xs text-muted" style="margin-top: var(--space-3);">Main session</p>
          ${builtSession.rationale?.sections?.main ? `<p class="sb-section-why">${builtSession.rationale.sections.main}</p>` : ""}
          ${main.map(ex => `
            <div class="sb-exercise-item" role="listitem">
              <div class="sb-exercise-left">
                <span class="sb-exercise-name">${ex.name}</span>
                <span class="sb-exercise-meta text-xs text-muted">
                  ${ex.sets} sets &nbsp; ${ex.reps || formatDuration(ex.duration)} &nbsp; ${ex.tempo}
                  ${ex.rest && ex.rest !== "0s" ? "&nbsp; rest " + ex.rest : ""}
                </span>
              </div>
            </div>
          `).join("")}
        ` : ""}

        ${cooldown.length > 0 ? `
          <p class="sb-section-label text-xs text-muted" style="margin-top: var(--space-3);">Cool-down</p>
          ${builtSession.rationale?.sections?.cooldown ? `<p class="sb-section-why">${builtSession.rationale.sections.cooldown}</p>` : ""}
          ${cooldown.map(ex => `
            <div class="sb-exercise-item" role="listitem">
              <div class="sb-exercise-left">
                <span class="sb-exercise-name">${ex.name}</span>
                <span class="sb-exercise-meta text-xs text-muted">
                  ${ex.reps || formatDuration(ex.duration)} &nbsp; ${ex.tempo}
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
          Build a different one
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
  selectedPreset        = "balanced";
  buildMode             = null;
  candidatePools        = null;
  selectedCandidateIds  = new Set();
  equipmentOverride     = null;
  builtSession          = null;
  preselectChecked      = false;
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
      phase = isPremium() ? "location" : "equipment";
      if (!isPremium()) { selectedType = "full"; selectedDuration = 30; }
      rerender();
      return;
    }
  }

  // Back button
  document.getElementById("sb-back-btn")?.addEventListener("click", () => {
    if (phase === "type") {
      resetState();
      router.navigate("today");
    } else if (phase === "location") {
      phase = "type";
      rerender();
    } else if (phase === "duration") {
      phase = "location";
      rerender();
    } else if (phase === "equipment") {
      phase = isPremium() ? "duration" : "type";
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
      if (isPremium()) {
        phase = "location";
      } else {
        selectedType     = "full";
        selectedDuration = 30;
        phase            = "equipment";
      }
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
  document.getElementById("sb-location-continue-btn")?.addEventListener("click", () => {
    phase = "duration";
    rerender();
  });

  // Duration selection
  document.querySelectorAll(".sb-duration-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedDuration = parseInt(btn.dataset.mins);
      if (isPremium()) {
        phase = "equipment";
        // 05 Aug 2026 -- reads the location-scoped list, not the flat merged
        // `equipment` -- the actual fix for the "assumed home" bug.
        const scopedKey = selectedLocation === "gym" ? "gymEquipment" : "homeEquipment";
        equipmentOverride = [...(store.get(scopedKey) || [])];
      } else {
        selectedDuration  = 30;
        equipmentOverride = [...(store.get("equipment") || [])];
        triggerBuild();
      }
      rerender();
    });
  });

  // Allocation preset selection (05 Aug 2026)
  document.querySelectorAll(".sb-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedPreset = btn.dataset.preset;
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
    builtSession = null;
    phase        = "type";
    rerender();
  });
}
