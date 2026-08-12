/**
 * js/session-log.js
 * 12 Aug 2026 v1
 *
 * Session notes: what you did on an exercise, so you are not guessing at
 * it next time.
 *
 * WHY THIS FILE EXISTS
 *
 * Graeme, 12 Aug: "Weight notes should be on. But not just weight. Time,
 * tension, elevation etc."
 *
 * The store already did all of that. store.js v28 generalised logLift()
 * on 11 Aug, from his own words at the time, to nine metrics: weight,
 * reps, speed, incline, level, distance, duration, tension, free note.
 * The per-equipment field selection existed too.
 *
 * What did NOT exist was reach. renderLiftBlock() lived inside
 * gym-programme.js and nowhere else, so of eleven session views exactly
 * one offered it. For most sessions the feature simply did not appear,
 * which is why a nine-metric log read as a gym-weights feature.
 *
 * Compounded by the Settings entry calling it "Weight notes -- jot down
 * what you lifted". A feature that describes itself wrongly is one people
 * correctly believe does not do the thing.
 *
 * So this is an extraction, not a rewrite. The logic is gym-programme.js
 * v3's, moved out so more than one view can reach it. P5's shape: a view
 * should not own something several views need.
 *
 * WHERE IT DOES AND DOES NOT BELONG
 *
 * Card-shaped session views, where a person works through exercises one
 * at a time: gym-programme.js and workout.js today.
 *
 * NOT breathing-session.js or quiet-session.js. Those are restoration.
 * breathing-session.js contains no exercises at all, and putting a
 * metrics box on a screen whose purpose is to stop measuring would
 * contradict the product outright. This is a deliberate boundary, not an
 * oversight, and it should stay one.
 *
 * The single-activity views -- walk, run, cycle, swim -- are a different
 * shape again: one activity, not a sequence of exercises. They would need
 * their own field set (a walk produces distance and minutes, a swim
 * produces lengths) and are a separate, smaller job.
 *
 * yoga-session.js is an open question rather than a no: a duration note
 * is harmless, but yoga is the one place the product most explicitly is
 * not about performance. Left alone pending a decision.
 *
 * P4 THROUGHOUT. Nothing here computes, compares or narrates. The last
 * line is flat -- "Last: 60 kg / 8 reps" -- with no verb, no delta, no
 * arrow and no verdict. The only editorial voice is
 * progressionInvitation(), which invites and never instructs, and which
 * reads the day rather than the number.
 */

import { store } from "./store.js";
import { progressionInvitation } from "./data/session-rationale.js";

function esc(str) {
  return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Which fields does THIS exercise actually produce?
 *
 * A treadmill session produces a speed and an incline; a cross trainer a
 * resistance level; a band a colour; a plank a duration. Offering
 * "Weight" against a plank is why a person came back next week with
 * nothing written down.
 */
export function performanceFields(exercise) {
  const eq = exercise?.equipment || [];
  const has = (...ids) => ids.some(id => eq.includes(id));

  if (has("treadmill")) {
    return [
      { key: "speed",        label: "Speed",     type: "number", step: "0.1" },
      { key: "incline",      label: "Incline %", type: "number", step: "0.5" },
      { key: "durationMins", label: "Minutes",   type: "number", step: "1"   }
    ];
  }
  if (has("exercise-bike", "elliptical", "stair-climber", "rowing-machine",
          "ski-erg", "bicycle")) {
    return [
      { key: "level",        label: "Level",    type: "number", step: "1"   },
      { key: "durationMins", label: "Minutes",  type: "number", step: "1"   },
      { key: "distance",     label: "Distance", type: "number", step: "0.1" }
    ];
  }
  if (has("resistance-band")) {
    return [
      { key: "tension", label: "Band", type: "text",   maxlength: "30" },
      { key: "reps",    label: "Reps", type: "number", step: "1"       }
    ];
  }
  if (has("dumbbell", "kettlebell", "barbell", "medicine-ball",
          "cable-machine", "leg-press-machine", "leg-curl-machine",
          "chest-press-machine", "gym-membership")) {
    const unit = store.get("weightUnit") || "kg";
    return [
      { key: "weight", label: `Weight (${unit})`, type: "number", step: "0.5" },
      { key: "reps",   label: "Reps",             type: "number", step: "1"   }
    ];
  }
  // Bodyweight. A hold gets a duration, everything else gets reps.
  if (exercise?.duration || /hold|plank|isometric/i.test(exercise?.name || "")) {
    return [
      { key: "durationMins", label: "Minutes", type: "number", step: "0.5"  },
      { key: "note",         label: "Note",    type: "text",   maxlength: "40" }
    ];
  }
  return [
    { key: "reps", label: "Reps", type: "number", step: "1"       },
    { key: "note", label: "Note", type: "text",   maxlength: "40" }
  ];
}

/**
 * The flat reference line. No verb, no framing, no comparison, no delta
 * -- a note the person left themselves, per Locked Principle P4.
 */
export function lastLine(exercise) {
  const last = store.lastLift(exercise.id);
  if (!last) return '<p class="slog__last slog__last--empty">No note yet for this one.</p>';
  const bits = [];
  if (last.weight       !== undefined) bits.push(`${last.weight} ${esc(last.unit || "kg")}`);
  if (last.reps         !== undefined) bits.push(`${last.reps} reps`);
  if (last.speed        !== undefined) bits.push(`speed ${last.speed}`);
  if (last.incline      !== undefined) bits.push(`${last.incline}% incline`);
  if (last.level        !== undefined) bits.push(`level ${last.level}`);
  if (last.distance     !== undefined) bits.push(`${last.distance} distance`);
  if (last.durationMins !== undefined) bits.push(`${last.durationMins} min`);
  if (last.tension      !== undefined) bits.push(esc(last.tension));
  if (last.note         !== undefined) bits.push(esc(last.note));
  return `<p class="slog__last">Last: ${bits.join(" \u00B7 ")}</p>`;
}

/**
 * The capture block. Returns "" when the person has it switched off or
 * the exercise has no id, so call sites can interpolate unconditionally.
 *
 * @param {Object} exercise
 * @param {string} [idPrefix] unique per call site, so two blocks on one
 *   page cannot collide on element ids.
 */
export function renderLogBlock(exercise, idPrefix = "slog") {
  if (store.get("liftLogEnabled") !== true) return "";
  if (!exercise?.id) return "";

  const fields = performanceFields(exercise);

  // The invitation sits with the note, because this is the moment the
  // person is deciding what to use. Invitational, never a number, and it
  // reads the day -- a flare invites less, a low-energy day invites the
  // same, and only a settled day invites more.
  const invite = progressionInvitation(exercise);

  return `
    <div class="slog card" role="group" aria-label="Your notes for ${esc(exercise.name)}">
      ${lastLine(exercise)}
      ${invite ? `<p class="slog__invite">${esc(invite)}</p>` : ""}
      <div class="slog__row">
        ${fields.map(f => `
          <label class="slog__label" for="${idPrefix}-${f.key}">${esc(f.label)}</label>
          <input class="slog__input" id="${idPrefix}-${f.key}"
                 type="${f.type}"
                 inputmode="${f.type === "number" ? "decimal" : "text"}"
                 ${f.step ? `min="0" step="${f.step}"` : ""}
                 ${f.maxlength ? `maxlength="${f.maxlength}"` : ""}
                 autocomplete="off"
                 data-perf-key="${f.key}">
        `).join("")}
        <button class="btn btn-secondary slog__save" id="${idPrefix}-save"
                aria-label="Save these as a note for next time">Save</button>
      </div>
      <p class="slog__status" id="${idPrefix}-status" role="status" aria-live="polite"></p>
    </div>
  `;
}

/**
 * Wires the Save button. Scoped to the block by idPrefix rather than
 * querying the document, so a page holding two blocks does not write one
 * exercise's numbers onto the other.
 */
export function attachLogEvents(exercise, idPrefix = "slog") {
  const saveBtn = document.getElementById(`${idPrefix}-save`);
  if (!saveBtn || !exercise?.id) return;
  if (saveBtn.dataset.wired === "1") return;   // idempotent: safe to re-call after a re-render
  saveBtn.dataset.wired = "1";

  saveBtn.addEventListener("click", () => {
    const status = document.getElementById(`${idPrefix}-status`);
    const block  = saveBtn.closest(".slog");
    const entry  = {};
    (block || document).querySelectorAll("[data-perf-key]").forEach(input => {
      const key = input.getAttribute("data-perf-key");
      const raw = input.value;
      if (raw === "" || raw === null) return;
      entry[key] = input.type === "number" ? parseFloat(raw) : raw;
    });

    const saved = store.logLift(exercise.id, entry);
    if (!saved) {
      // Nothing entered. Not an error and not framed as one -- every
      // field is optional and skipping this is a legitimate choice.
      if (status) status.textContent = "Add something first, or carry on without.";
      return;
    }
    // Neutral confirmation. States that it saved; says nothing about the
    // numbers themselves (P4).
    if (status) status.textContent = "Noted.";
  });
}
