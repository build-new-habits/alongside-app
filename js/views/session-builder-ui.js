/**
 * js/views/session-builder-ui.js - Session Builder UI
 *
 * 18 Aug 2026 v11
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
import { SESSION_TYPES, ALLOCATION_PRESETS, buildSession, buildCandidatePools, buildSessionFromSelection } from "../session-builder.js";
import { isPremium, lockedFeature }        from "../auth.js";

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
          All session types come with the Plan.
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
// TIER-G helper. Identical inner content for locked and unlocked so the
// two states read as the same product, not two designs -- the same rule
// the type picker above already follows. A <div> inside lockedFeature(),
// never a <button>: it returns role="button" and nesting one interactive
// control inside another is invalid.
function _buildModeOption(premium, mode, title, blurb) {
  const inner = `
      <span style="font-weight:var(--font-semibold);">${title}</span>
      <span class="text-secondary text-sm">${blurb}</span>`;

  if (!premium) {
    return lockedFeature(`
      <div class="card"
           style="display:flex;flex-direction:column;align-items:flex-start;text-align:left;width:100%;background:var(--color-surface);padding:var(--space-4);">
        ${inner}
      </div>
    `, "personal", title);
  }

  return `
    <button class="card sb-buildmode-btn" data-mode="${mode}"
            style="display:flex;flex-direction:column;align-items:flex-start;text-align:left;width:100%;cursor:pointer;background:var(--color-surface);padding:var(--space-4);">
      ${inner}
    </button>
  `;
}

//
// TIER-G, 18 Aug 2026. This step had NO tier check at all. A free user
// reached it through the Library's free "Full Body" card and could pick
// "Coach recommends, I'll choose" or "Build my own" -- choosing their own
// exercises, one at a time, from the candidate pools.
//
// alongside_tier_boundary_12aug2026_v1.md, section 4: free is "Full body
// only. The coach decides." The one-line test makes composing the paid
// act. Two of these three routes are composing.
//
// The locked routes are SHOWN, not hidden, per section 6 -- "the door is
// visible at all times, the person walks through it when they choose."
// Hiding them would leave a screen with one button on it, which is a
// question with one answer, and would remove the exact conversion moment
// this file already argues for in the type picker above.
function renderBuildModeStep() {
  const type    = SESSION_TYPES.find(t => t.id === selectedType);
  const premium = isPremium();
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
          premium, "recommend", "Coach recommends, I'll choose",
          "I'll suggest a starting selection from a wider list — swap anything you like."
        )}
        ${_buildModeOption(
          premium, "own", "Build my own",
          "Pick everything yourself from what's available today."
        )}
      </div>

      ${!premium ? `
        <p class="text-xs text-muted" style="text-align:center; margin-top: var(--space-4);">
          Choosing your own movements is part of the Plan.
        </p>
      ` : ""}

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

      // TIER-B, 13 Aug 2026. The silent downgrade is gone. This line
      // used to read:
      //     if (!isPremium()) { selectedType = "full"; selectedDuration = 30; }
      // -- so a free user who tapped "Lower body" in the Library was
      // handed a 30-minute Full Body session with no badge, no
      // explanation and no route to upgrade. It was the quietest
      // paywall in the product and the only one that lied.
      //
      // library.js now gates those cards, so a locked type can no
      // longer arrive by preselect at all. This is the belt to that
      // braces: if one ever does, route to upgrade. Substituting
      // silently is the behaviour being removed, so it must not
      // survive as the fallback.
      if (!isPremium() && pre.type !== "full") {
        router.navigate("upgrade");
        return;
      }

      phase = isPremium() ? "location" : "equipment";
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
      if (isPremium()) {
        phase = "location";
      } else {
        selectedDuration = 30;   // the free tier's only length
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

      // TIER-G belt to the render's braces. Locked routes render through
      // lockedFeature(), which produces no .sb-buildmode-btn, so this
      // cannot fire today. It is here because the two silent-substitution
      // bugs removed on 13 Aug both lived in exactly this position, and
      // routing to the door is the correct failure -- never quietly
      // handing somebody the coach-built session they did not ask for.
      if (!isPremium() && buildMode !== "coach") {
        router.navigate("upgrade");
        return;
      }

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
