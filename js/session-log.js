/**
 * js/session-log.js
 * 20 Aug 2026 v7
 *
 * v7 - R4 / decision 7.1. PERSONAL BESTS ARE FREE. bestLine()'s
 *   isPremium() check and its import are removed. A best is a fact the
 *   person produced, and free already includes lift notes and recall.
 *   "Up 5 since May" would be the arc, and P4 forbids that separately.
 *
 *   THE OPT-IN STAYS, AND STAYS OFF BY DEFAULT. Ungating is not
 *   switching on. For personas 2.5, 2.8 and 2.13 a visible best is a
 *   target to fall short of -- and widening who can see it makes that
 *   default MORE load-bearing, not less.
 *
 * v6 - PB-1. bestLine(), shown only when the person has asked for it
 *   and their tier includes it. Flat, no delta, no comparison.
 *
 * 12 Aug 2026 v5
 *
 * v5 - LOG-6. The note is a growing textarea, capped at 280 rather than
 *   40 characters, so somebody can read back what they wrote before
 *   saving instead of seeing it a few characters at a time.
 *
 * 12 Aug 2026 v4
 *
 * v4 - LOG-5. The note field now takes the remaining width instead of
 *   sharing a fixed 5.5rem with the number boxes. Graeme: "is like a
 *   bigger box for notes to fill the remaining space to the right of
 *   it." A note is prose; a number is three characters.
 *
 * v3 - LOG-4. "distance" and "lengths" modes for the single-activity
 *   views, rendered on their completion screens.
 *
 * v2 - LOG-2. A "gentle" mode restricting fields to duration and a note,
 *   and yoga-session.js wired to it. See performanceFields().
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
 * shape: one activity, not a sequence of exercises. Handled at LOG-4 with
 * "distance" and "lengths" modes, rendered once on the completion screen
 * rather than on a card. Duration is omitted there because those views
 * already run a live clock.
 *
 * yoga-session.js RESOLVED 12 Aug: yes, but note-and-duration only
 * (mode: "gentle"). A pose is not a set; counting reps there would import
 * the exact frame the practice exists outside of. What is worth writing
 * down is how long you held it and what you noticed.
 *
 * P4 THROUGHOUT. Nothing here computes, compares or narrates. The last
 * line is flat -- "Last: 60 kg / 8 reps" -- with no verb, no delta, no
 * arrow and no verdict. The only editorial voice is
 * progressionInvitation(), which invites and never instructs, and which
 * reads the day rather than the number.
 */

import { store } from "./store.js";
// R4, 20 Aug 2026. The isPremium import is REMOVED. bestLine() gated on
// tier; a personal best is a fact about the person's own log, and free
// already includes lift notes and recall. Decision 7.1, revenue
// architecture v2.
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
export function performanceFields(exercise, mode) {
  // LOG-2. Yoga takes note-and-duration only -- Graeme, 12 Aug: "yes, but
  // note-and-duration only, no reps, no level."
  //
  // A pose is not a set. Counting reps in yoga would import the exact
  // frame the practice exists outside of, and a resistance level is
  // meaningless there. What IS worth writing down is how long you held it
  // and what you noticed -- "wobbled on tree pose, right side stiff" is
  // genuinely useful next week in a way that a number is not.
  if (mode === "gentle") {
    return [
      { key: "durationMins", label: "Minutes", type: "number", step: "0.5"  },
      { key: "note",         label: "Note",    type: "text",   maxlength: "280", multiline: true }
    ];
  }

  // LOG-4. Single-activity sessions -- walk, run, cycle, swim. One
  // continuous activity, not a sequence of exercises, so there is no card
  // to sit on; this renders once on the completion screen instead.
  //
  // Duration is deliberately ABSENT: these views all run a live clock and
  // write durationMins themselves. Asking somebody to type a number the
  // app already knows is the sort of thing that makes an app feel like
  // paperwork.
  //
  // What is left is what the app genuinely cannot know: how far, and
  // anything worth remembering.
  if (mode === "distance") {
    return [
      { key: "distance", label: "Distance", type: "number", step: "0.1"  },
      { key: "note",     label: "Note",     type: "text",   maxlength: "280", multiline: true }
    ];
  }
  if (mode === "lengths") {
    return [
      { key: "distance", label: "Lengths", type: "number", step: "1"    },
      { key: "note",     label: "Note",    type: "text",   maxlength: "280", multiline: true }
    ];
  }

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
      { key: "note",         label: "Note",    type: "text",   maxlength: "280", multiline: true }
    ];
  }
  return [
    { key: "reps", label: "Reps", type: "number", step: "1"       },
    { key: "note", label: "Note", type: "text",   maxlength: "280", multiline: true }
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
  return `<p class="slog__last">Last: ${bits.join(" \u00B7 ")}</p>${bestLine(exercise)}`;
}

/**
 * PB-1. The person's best for this exercise, when they have asked to see
 * it and their tier includes it.
 *
 * Flat, like lastLine() above and for the same reason. "Best: 85 kg" is a
 * fact about their own log. "Best: 85 kg — up 5 since May!" would be the
 * coach interpreting, and P4 is Locked.
 *
 * Silent by default. showPersonalBests is off unless the person turned it
 * on, because for personas 2.5, 2.8 and 2.13 a visible best is a target
 * to fall short of. Persona 2.7 turns it on because he came looking.
 */
export function bestLine(exercise) {
  // The opt-in STAYS, and stays off by default. Ungating is not
  // switching on: for personas 2.5, 2.8 and 2.13 a visible best is a
  // target to fall short of, which is the entire failure mode this
  // product exists to avoid. Free users can now turn it on; nobody has
  // it done to them.
  if (store.get('showPersonalBests') !== true) return '';
  // R4: `if (!isPremium()) return '';` removed. "Your best: 85 kg" is a
  // fact the person produced. "Up 5 since May" would be the arc, and P4
  // forbids that separately and for different reasons.
  const best = store.personalBest(exercise.id);
  if (!best) return '';
  const bits = [];
  if (best.weight)   bits.push(`${best.weight.value} ${esc(best.weight.unit || 'kg')}`);
  if (best.reps)     bits.push(`${best.reps.value} reps`);
  if (best.distance) bits.push(`${best.distance.value} distance`);
  if (best.speed)    bits.push(`speed ${best.speed.value}`);
  if (!bits.length) return '';
  return `<p class="slog__best">Your best: ${bits.join(" \u00B7 ")}</p>`;
}

/**
 * The capture block. Returns "" when the person has it switched off or
 * the exercise has no id, so call sites can interpolate unconditionally.
 *
 * @param {Object} exercise
 * @param {string} [idPrefix] unique per call site, so two blocks on one
 *   page cannot collide on element ids.
 * @param {string} [mode] "gentle" restricts the fields to duration and a
 *   note. Used by yoga, where reps and levels would import the wrong
 *   frame entirely.
 */
/**
 * SCROLL-1, 12 Aug 2026. Graeme: "When I click next exercise I'm dropped
 * to the bottom of the screen. Always a new screen should start at the
 * top."
 *
 * router.js resets scroll on every view MOUNT -- but advancing between
 * exercises does not navigate, it re-renders in place, so nothing reset
 * it. You finish a card at the bottom (Next Exercise lives there), the
 * next card renders, and you are still at the bottom: past its name, past
 * the timer, looking at the watch-outs for something you have not read
 * yet.
 *
 * Five views, nine advance points. Lives here rather than in each of them
 * because every card-shaped view already imports this module, and nine
 * copies of a one-line fix is how eight of them drift.
 *
 * `instant` deliberately: a smooth scroll from the bottom of one card to
 * the top of the next animates past everything in between, which reads as
 * the screen having lurched.
 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "instant" });
}

export function renderLogBlock(exercise, idPrefix = "slog", mode) {
  if (store.get("liftLogEnabled") !== true) return "";
  if (!exercise?.id) return "";

  const fields = performanceFields(exercise, mode);

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
          ${f.multiline ? `
            <textarea class="slog__input slog__input--note" id="${idPrefix}-${f.key}"
                      rows="1"
                      maxlength="${f.maxlength || 280}"
                      autocomplete="off"
                      data-autogrow="1"
                      data-perf-key="${f.key}"></textarea>
            <span class="slog__remaining" aria-live="polite"></span>
          ` : `
            <input class="slog__input" id="${idPrefix}-${f.key}"
                   type="${f.type}"
                   inputmode="${f.type === "number" ? "decimal" : "text"}"
                   ${f.step ? `min="0" step="${f.step}"` : ""}
                   ${f.maxlength ? `maxlength="${f.maxlength}"` : ""}
                   autocomplete="off"
                   data-perf-key="${f.key}">
          `}
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
/**
 * LOG-6, 12 Aug 2026. Grow the note field to fit what is in it.
 *
 * Graeme: "Can we make that expandable as well so that you can actually
 * see what's written rather than a few characters at a time... you can
 * then read back over what you said before pressing save."
 *
 * Two separate limits were in the way. The field was one line wide enough
 * for a number, AND capped at 40 characters -- "3kg felt fine, 4kg pulled
 * and the back tightened" is 50, so it was truncated mid-sentence. Cap
 * raised to 280; a note is not an essay, but it should hold a thought.
 *
 * Grows from one row rather than starting tall: an empty three-line box
 * on every exercise card reads as an expectation to fill it, and this
 * field is optional.
 *
 * Height is reset to auto before measuring, or the box can only ever grow
 * -- deleting text would leave the space behind.
 */
function autogrow(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

/**
 * LOG-6. Warn before the cap, not at it.
 *
 * A 280-character limit somebody meets mid-sentence, with no warning, is
 * the same failure as the 40-character one -- they just meet it later.
 * The count appears only in the last 60 characters, so it is help when it
 * matters rather than a word counter watching somebody write.
 */
function remaining(el) {
  const box = el?.parentElement?.querySelector(".slog__remaining");
  if (!box) return;
  const max  = parseInt(el.getAttribute("maxlength") || "280", 10);
  const left = max - el.value.length;
  box.textContent = left <= 60 ? `${left} characters left` : "";
}

export function attachLogEvents(exercise, idPrefix = "slog") {
  // LOG-6. Wire growth for every note field in this block, and size any
  // that already hold text on first render.
  document.querySelectorAll("[data-autogrow]").forEach(el => {
    if (el.dataset.grown !== "1") {
      el.dataset.grown = "1";
      el.addEventListener("input", () => { autogrow(el); remaining(el); });
    }
    autogrow(el);
    remaining(el);
  });

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
