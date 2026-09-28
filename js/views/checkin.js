/**
 * js/views/checkin.js
 * 28 Sep 2026 v21
 *
 * v21 - F6, REDUCE-MOTION-ROW. Reduced motion is read from
 *   display-prefs.js prefersReducedMotion(): the device, or the new
 *   Settings switch. Same timings; one reader.
 *
 * 28 Sep 2026 v20
 *
 * v20 - FEELINGS-RETIRE. The check-in object no longer carries a
 *   feelingWord field (always null since SMOOTH-P1).
 *
 * v19 - SMOOTH-P1. Three questions, one tap each. Spec §4.2.
 *
 *   Graeme, 27 Sep, after the prototype: "3 questions in that style is
 *   perfect. Forget the word selection."
 *
 *   Energy, mood, anything sore -- asked inline in the conversation as a
 *   row of answers, so no panel slides over what the coach just said.
 *   That is what the "I'm ready" and "Next" taps existed to prevent, so
 *   they go too. Nothing is preset: both sliders started at 5 and 5
 *   counted as low (F3). The answers map onto the 1-10 scale at points
 *   chosen so every threshold downstream lands on the side it did before
 *   (ENERGY_CHIPS). A sore area asks one "how bad" question whose answers
 *   sit inside getPainBand()'s bands, so the severe-pain safety rules are
 *   untouched, and the coach says the CL-4 safety line. Sleep is optional,
 *   one link away. The third answer goes straight on; the "See what I'm
 *   thinking" stop remains only for people with prescribed exercises,
 *   where it is a real choice.
 *
 *   Gone from this route: the feeling word, sleep hours, "What's today
 *   for?" and "What would help most?" (the coach infers purpose from the
 *   arc and history; the plan screen lets the person change it), and the
 *   brief/full pace preference (every check-in is now the short one).
 *   Free keeps its drop-in question (destination architecture §8).
 *   See tools/verify-checkin-three.mjs.
 *
 * v18 - STALE-CHECKIN (Smooth Path P0, F2). Leaving a check-in leaves
 *   nothing behind.
 *
 *   Traced 27 Sep: press the house button mid-question and the energy
 *   question stayed open over Home and every later screen, covering
 *   Quick build's "Build it". The panels are built on document.body,
 *   outside the container the router wipes, and this view had no
 *   onUnmount. Now: onUnmount removes every panel and overlay, and a
 *   panel scheduled by a timer before leaving is never attached after.
 *   See tools/verify-checkin-unmount.mjs.
 *
 * v17 - CHECKIN-3. The coach asked one question and opened the panel
 *   for a different one. Device pass, task 4.
 *
 *   On the FULL path _moodBridge() said "Alright. How did you sleep?"
 *   and the panel that opened next was the FEELING WORD. The sleep panel
 *   then arrived in silence, because its own bridge line had been spent
 *   one transition too early. A person answered a question they had not
 *   been asked, and the coach never asked the one it wanted.
 *
 *   THIS IS QUICK-3, ONE PATH OVER. v15 found these same three lines
 *   asking about sleep on the BRIEF path -- "the coach asked a question
 *   it had already decided not to ask" -- gave the brief path its own
 *   lines, and left the full path's three still naming a panel that no
 *   longer came next. Fixed on one branch; the other lay here three
 *   weeks.
 *
 *   _sleepBridge() carries the three sleep lines UNCHANGED to the
 *   transition that actually opens the sleep panel, from BOTH exits of
 *   the feeling word panel -- skip and confirm. The full path's mood
 *   lines now ask what the feeling word panel asks, following
 *   _energyBridge()'s pattern of coach-asks-then-panel-repeats, and
 *   leaving room for the skip that panel offers.
 *
 *   _PANEL_BEAT_MS on both, which is QUICK-3's own remedy for a coach
 *   line and the panel answering it landing in the same instant.
 *
 *   NOTHING HAD EVER MOUNTED THIS VIEW. verify-checkin2 reads this file
 *   as text; no gate imported CheckinView. verify-checkin3 walks the
 *   conversation and asserts on what the coach SAID, in sequence.
 *
 * 29 Aug 2026 v16
 *
 * v16 - CHECKIN-2a. "Something else sore today?" on the conditions
 *   sheet. The sliders were fixed at whatever was declared at onboarding
 *   and they are the ONLY input to bodyCaution, so an area that flared
 *   later could be loaded all week with a silent card. Picker only --
 *   never free text, because an id resolving to no real body area gives a
 *   slider that saves and silently never fires a caution.
 *
 * 18 Aug 2026 v15
 *
 * v15 - QUICK-3. Two faults on the brief check-in path, both found
 *   on-device 18 Aug, both the same shape: QUICK-1 removed a step and
 *   left the things attached to it behind.
 *
 *   1. _moodBridge() spoke BEFORE the brief-path check, and all three
 *      of its lines asked about sleep. The coach asked a question it
 *      had already decided not to ask, then moved to conditions. The
 *      brief path now has its own three lines.
 *
 *   2. The full path's beat between that question and the next panel is
 *      the sleep panel's own confirm button. The brief path had no
 *      panel there, so the coach's line and the conditions panel landed
 *      together and the check-in read as too fast. _PANEL_BEAT_MS.
 *
 * 12 Aug 2026 v14
 *
 * v14 - DIC-1, the drop-in coach question. Destination Architecture
 *   section 8, and the first item of the tier-boundary build sequence.
 *
 *   From Graeme's track analogy: you turn up at the athletics club and
 *   ask for a session, and the coach asks the one question a human
 *   coach asks -- do you want what you did last time, or something
 *   different? That single question is what makes free a COACH rather
 *   than a generator, and it costs almost nothing, because the
 *   machinery behind it was already built.
 *
 *   What made this cheap: sessionVariety was a READER WITHOUT A WRITER.
 *   store.js declares it (default 'balanced', validated against
 *   familiar|balanced|varied) and session-builder.js reads it at the
 *   novelty-rate calculation -- familiar 0.10, balanced 0.25, varied
 *   0.55 -- but nothing in the entire codebase ever wrote it. No
 *   Settings control, no onboarding question, no view. The store.js
 *   comment says "the person's own answer, never inferred from
 *   behaviour", and the person had never been asked. Selection has been
 *   running on a default nobody chose. This is the missing writer, not
 *   a new mechanism. Third recurrence of the PT-12 pattern.
 *
 *   Decision (Graeme, 12 Aug): write sessionVariety DIRECTLY rather than
 *   adding a per-session override field. The question fires before every
 *   coach-built session, so "today's answer" and "standing preference"
 *   converge in practice, and a second self-clearing field would be two
 *   sources of truth for one concept -- the exact family of bug this
 *   build has paid for several times. Recorded consequence: if a
 *   Settings control for variety ever lands, this question overwrites it
 *   each session. That is intended -- what you say today beats what you
 *   set in March -- and is on record rather than discovered later.
 *   No schema change, so store.js and Schema.md are untouched.
 *
 *   Gating (Decision 3): asked only when at least one exercise sits
 *   inside the 21-day window, which is precisely session-builder.js's
 *   own isAnchor() cutoff (CONTINUITY_WINDOW_DAYS). Outside it nothing
 *   is an anchor, so 'familiar' and 'varied' would produce near-
 *   identical sessions and the coach would have asked a question it
 *   cannot act on. A question that changes nothing is worse than no
 *   question: it teaches the person the coach is reading a script
 *   rather than reading them. The spec says the same thing in its own
 *   words -- "he asks about last time, he never asks about March".
 *
 *   Also gated on pendingDoorRoute being a session-generating door
 *   (session-builder or coach-proposal). Reached via Home's standalone
 *   "Check in" link, no session follows, so there is nothing to shape.
 *
 *   The answer is written the moment it is given, not deferred to
 *   _saveAll(). Deliberate: it is a preference, not check-in data, and
 *   it should survive someone backing out and re-entering by another
 *   door. They answered the question; the answer stands.
 *
 *   No .ci-panel-q in this panel. The coach has already asked in the
 *   thread, and asking again inside the panel is the same duplication
 *   v12 removed for the time question.
 *
 * 11 Aug 2026 v13
 *
 * v13 - Pacing. The energy and mood panels opened 400ms after the last
 *   coach bubble, which is fine for somebody who skims and wrong for
 *   everybody else -- a panel sliding up while you are still reading is
 *   the app taking the conversation back off you. Graeme: "The
 *   conversation in mood and energy is too fast and I can't read what
 *   the coach is saying. Perhaps a button to trigger the slider?" The
 *   person now opens each panel when they are ready. No timer, no
 *   auto-advance, no penalty for taking a while.
 *
 *   Paired with checkin-conversation.css v7, which gives the thread
 *   70vh of trailing space so the newest message can actually scroll to
 *   the top of the viewport rather than settling at the bottom.
 *
 * 11 Aug 2026 v12
 *
 * v12 - The time question is gone. Graeme: "I get asked for time twice.
 *   It asks in the coach gym proposal stage too. It doesn't need to be
 *   twice." Check-in is the wrong place to keep it -- asking here means
 *   guessing at the top of the day, before you have seen what is on
 *   offer, while asking at the point of building means answering with
 *   the session in front of you. Same question, better moment.
 *
 *   availableTime is no longer written here. Consumers already handle
 *   its absence: coach-proposal.js falls back to a default and
 *   session-builder-ui.js asks directly. The store field stays, since
 *   Settings may set a usual length later.
 *
 * 04 Aug 2026 v11
 *
 * v11 — coach-reflection.js fallback retired. Traced (not assumed):
 *   that four-option "Your Session" picker was reached from exactly
 *   one place in the app, this file's submit handler, only when no
 *   pendingDoorRoute was set (i.e. reached via the standalone "Check
 *   in" link). Its options substantially duplicate what Home's six
 *   doors already offer directly. Graeme: "I think this page is now
 *   obsolete?" — confirmed. Falls back to 'today' (Home) instead.
 *
 * 04 Aug 2026 v10
 *
 * v10 — Completion now honours a pending Home-door destination
 *   (pendingDoorRoute, store.js v14) if one was set — Cardio/Core/
 *   Strength and Unsure? Coach decides now route through this file
 *   first when reached from Home, and completion continues to the
 *   door's real destination instead of always landing on
 *   coach-reflection. Falls back to the existing default when check-in
 *   was reached some other way (e.g. Home's standalone "Check in" link).
 *
 * v9 — Pain Input Redesign. Conditions panel converted from the 4-button
 *   .ci-pain-chip row to per-condition sliders (0-10), matching the
 *   existing Energy/Mood slider pattern exactly (.ci-slider-wrap,
 *   .ci-value-row). Live label now uses conditions.js's new canonical
 *   getPainBand(), not a locally hardcoded ternary. Default for an
 *   unset condition changed from 1 ("None" chip's representative value)
 *   to a genuine 0, using explicit !== undefined checks throughout
 *   instead of `|| 1`/`|| 0` fallbacks — avoids the falsy-zero bug that
 *   an `||` fallback would introduce with real 0 values now reachable.
 *   Graeme's own instinct, prompted by the .ci-pain-chip text-overflow
 *   bug looking "awful and unprofessional" once wrapped — this removes
 *   the component that bug lived in entirely, not another patch on it.
 *
 * 03 Jul 2026 v8
 *
 * v8 — Chip row overflow fix. Graeme reported (screenshot) the feeling-
 *   word chips overflowed off-screen instead of wrapping — "confident"
 *   was cut off at the screen edge. Cause: reusing .ci-quality-chips as
 *   the container class in v7 inherited that class's layout, which was
 *   built for exactly 3 short chips (Poor/Okay/Good) in one row, never
 *   designed to wrap 6+ words. Fixed with scoped inline flex-wrap
 *   styling on the feeling-word container only — does not touch the
 *   shared .ci-quality-chips CSS class or checkin-conversation.css
 *   (still not ground-truthed this session), so the sleep-quality panel
 *   is unaffected.
 *
 * v7 — F1 (Quadrant Word Check-In) built in. New feeling-word panel
 *   inserted between mood and sleep, per alongside_wellbeing_longhorizon
 *   _spec_10jun2026_v2.docx Section 4 (F1/F2). Reads WORD_SETS and
 *   getQuadrant() from new data/feelings.js. Radiogroup chip pattern,
 *   "More words" disclosure, "Can't find a word today" skip option
 *   (equal visual weight, no nudge). Reuses the existing .ci-quality-chip
 *   CSS class (already live, same single-select toggle pattern as the
 *   sleep-quality chips) rather than adding new CSS this session.
 *   Writes feelingWord and feelingQuadrant onto _checkin — picked up
 *   automatically by checkinData.saveCheckin() (data/checkin.js v3
 *   already writes these fields into lastCheckin and checkinHistory;
 *   no changes needed there).
 *
 *   Signal-word detection (data/feelings.js detectSignalWord(), wrapping
 *   the existing signal-words.js) is wired but DORMANT — fires on chip
 *   selection, logs to console for dev visibility only. No user-facing
 *   crisis message. The Crisis & Safeguarding Policy (v6) is not yet
 *   signed off (Appendix L, master schedule) — do not connect this to
 *   any visible coach response until that lands.
 *
 *   Known follow-up, not done this session: coach-proposal.js does not
 *   yet read feelingWord to weave into proposal copy (F1 spec asks for
 *   this) — coach-proposal.js wasn't ground-truthed this session.
 *
 * v6 — Appendix M follow-up. v5 fixed the blind jump-to-container-bottom,
 *   but Graeme reported still missing messages specifically on the final
 *   summary bubble + action buttons screen. Two compounding causes found:
 *     1. No reading pause between the summary bubble resolving and
 *        _showActionButtons() firing — unlike every other bubble
 *        transition in this file, which has a typing-indicator pause
 *        built in. The buttons' own scroll-to-top yanked the summary
 *        bubble out of view before it could be read.
 *     2. document.getElementById("ci-submit-btn")?.focus() (150ms after
 *        the buttons render) triggers the browser's default
 *        scroll-into-view-on-focus behaviour, fighting the deliberate
 *        scroll position set by _scrollToNewElement().
 *   Fix: added a T.PANEL_DELAY (400ms) pause before _showActionButtons()
 *   is called, matching the pause pattern used everywhere else in this
 *   file. Added { preventScroll: true } to the submit-button focus call
 *   so it no longer overrides the intentional scroll.
 *
 * v5 — Appendix M fix: check-in thread was scrolling to the bottom of the
 *   container on every new message instead of to the top of the new
 *   bubble. Root cause: _scrollToBottom() set _thread.scrollTop =
 *   _thread.scrollHeight after every append (typing indicator, coach
 *   bubble, user bubble, action buttons) — a blunt "jump to bottom"
 *   regardless of which element was actually new.
 *
 *   Replaced with _scrollToNewElement(el), which calls
 *   el.scrollIntoView({ block: "start" }) on the specific element just
 *   appended, so the top of the new message lands at the top of the
 *   visible thread — reaching the true bottom is now something the user
 *   does themselves, not something the app does for them. Respects
 *   REDUCED_MOTION (behavior: "auto" vs "smooth"), same as the rest of
 *   this file's timing constants.
 *
 *   Per Graeme's decision (03 Jul 2026): the final summary bubble and
 *   the action buttons at the end of check-in also scroll-to-top for
 *   consistency, rather than snapping to bottom as a special case.
 *
 *   Confirmed no interaction with the locked D2 fade logic
 *   (_fadePastBubbles(), Appendix E) — fade only toggles the .is-past
 *   class on existing bubbles and has no scroll behaviour of its own;
 *   neither function calls the other. Verified by inspection of every
 *   call site in this file before deploying.
 *
 * v4 — Two QA fixes (round 1):
 *   Fade visibility: added 400ms pause after _fadePastBubbles() in all
 *     panel confirm handlers. Panel close animation is 350ms; firing
 *     _showUserBubble() simultaneously meant the thread was invisible
 *     (overlay still opaque) when the fade fired, so users never saw
 *     the faded state. Pause waits for the animation to complete first.
 *   Pain chip colours: split classList.remove("low","mild",...) into
 *     four separate calls. Multi-arg remove unreliable on Safari Mobile.
 *
 * v3 — Full rewrite: conversational thread (Option A, per D2 spec and
 *   Appendix E). Opens with a D2 opening narrative (B1 coach bubble,
 *   typing indicator, B2 coach bubble). Energy, mood, sleep, conditions
 *   (conditional on store.conditions), and available time each arrive as
 *   a sliding bottom panel. After each confirm: panel closes, user bubble
 *   appears in thread, bridge coach bubble follows, next panel rises.
 *   Summary: coach bubble + two action buttons.
 *
 *   Inherits typing indicator, bubble fade, and past-step-grey pattern
 *   directly from OB-THREAD (Appendix G). Fade rule: _fadePastBubbles()
 *   is called ONLY inside confirmed user-interaction handlers — never
 *   automatically. User bubbles never fade.
 *
 *   Factory pattern: CheckinView(router). Router already expects this
 *   fn name (router.js v7 VIEW_NAMES entry confirmed).
 *
 * v2 — 13 Jun 2026. lastCheckin.timestamp stamped at submit.
 * v1 — 01 Jun 2026.
 */

import { store }           from "../store.js";
import { prefersReducedMotion } from "../display-prefs.js";
// DIC-FREE, 16 Sep 2026. The drop-in question is the FREE coach's
// question. See _shouldAskVariety().
import { isPremium }       from "../auth.js";
// PURPOSE-ASK, 16 Sep 2026. The coach asks WHY today, then what would
// help -- and recommends, rather than offering a menu. See
// js/data/purpose.js.
// SMOOTH-P1: the purpose questions are gone from the check-in; only the
// reset and the clinical safety line are still used here.
import { intensityForForm, clearPurpose, SAFETY_LINE } from "../data/purpose.js";
import { checkinData }     from "../data/checkin.js";
import { resolveOpening }  from "../data/checkin-openings.js";
import { CONDITIONS, soreAreaOptions } from "../data/conditions.js";

export function CheckinView(router) {

  // ── Motion preference (matches OB-THREAD timing constants) ─────────────────
  const REDUCED_MOTION = prefersReducedMotion();   // F6: the device, or Settings
  const T = {
    TYPING_SHOW:  REDUCED_MOTION ? 0 :  300,
    TYPING_MIN:   REDUCED_MOTION ? 0 :  900,
    BUBBLE_DELAY: REDUCED_MOTION ? 0 :  120,
    PANEL_DELAY:  REDUCED_MOTION ? 0 :  400,
    SCROLL_DELAY: REDUCED_MOTION ? 0 :   80,
  };

  // ── State ───────────────────────────────────────────────────────────────────
  // STALE-CHECKIN. False once the person has left; a panel built by a
  // timer that fires afterwards is never attached to the page.
  let _alive      = false;
  let _sleepGiven = false;   // SMOOTH-P1
  let _container  = null;
  let _thread     = null;
  let _conditions = [];
  let _name       = "";

  let _checkin = {
    energy:          5,
    mood:            5,
    sleepHours:      null,   // SMOOTH-P1: only what the person told us
    sleepQuality:    null,
    conditionLevels: {},
    notes:           "",
  };
  // _selectedTime and TIME_OPTIONS removed 11 Aug 2026 with the time panel.
  // The summary line still reads availableTime if something else has set it
  // (Settings, or a previous session), but check-in no longer asks or writes.
  let _selectedTime = null;

  // ── Mount ───────────────────────────────────────────────────────────────────

  function mount(container) {
    _removeAllPanels();
    _alive = true;

    // PURPOSE-ASK. Cleared at the START of every check-in, not carried.
    // A purpose is a fact about today, like the check-in itself, and
    // yesterday's reason as a default is the same class of fault as
    // reading a proposal as a record.
    clearPurpose();

    _container   = container;
    _conditions  = store.get("conditions") || [];
    _name        = (store.get("name") || "").split(" ")[0] || "";
    _selectedTime = store.get("availableTime") || null;   // read-only now

    // SMOOTH-P1. Nothing is pre-filled: every answer is today's, given
    // today. A redone check-in starts clean rather than from this
    // morning's answers, which it would otherwise silently resubmit.
    _checkin = { ..._checkin, energy: null, mood: null, sleepHours: null,
                 sleepQuality: null, conditionLevels: {} };
    _sleepGiven = false;

    container.innerHTML = `
      <div class="ci-view">
        <div class="ci-thread"
             id="ci-thread"
             role="main"
             aria-label="Daily check-in"
             aria-live="polite"
             aria-atomic="false"
             aria-relevant="additions">
        </div>
      </div>
    `;

    _thread = container.querySelector("#ci-thread");
    _runOpening();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SMOOTH-P1 — THREE QUESTIONS, ONE TAP EACH
  // ─────────────────────────────────────────────────────────────────────────

  // Each answer -> the 1-10 scale everything downstream reads. Chosen so
  // every threshold lands on the side the old slider value did:
  //   getSuggestedIntensity  <=3 low, <=6 moderate, else high
  //   detectBurnout          5-day average <=2.5 high, <=4 moderate
  //   getQuadrant            >=6 counts as high
  // "Okay" is 6, not 5: the middle answer is not treated as low (F3).
  const ENERGY_CHIPS = [
    { label: "Running on empty", value: 2 },
    { label: "Low",              value: 3 },
    { label: "Okay",             value: 6 },
    { label: "Good",             value: 7 },
    { label: "Full of it",       value: 9 },
  ];
  const MOOD_CHIPS = [
    { label: "Struggling",  value: 2 },
    { label: "Low",         value: 3 },
    { label: "Okay",        value: 6 },
    { label: "Pretty good", value: 7 },
    { label: "Great",       value: 9 },
  ];
  // "How bad?" -> a pain score inside each of getPainBand()'s bands above
  // none, so the severe-pain rules (zone severe at >=7, band severe at
  // >=8) respond exactly as they did to the slider.
  const PAIN_CHIPS = [
    { label: "A little",   value: 4 },   // mild 3-5
    { label: "Quite sore", value: 6 },   // moderate 6-7, below the severe zone
    { label: "Bad",        value: 8 },   // severe
  ];
  // Offered after the person's own conditions. Everything else is one tap
  // further, under "Somewhere else".
  const COMMON_AREAS = ["lower-back", "knee", "shoulder", "hip", "upper-back"];

  async function _runOpening() {
    const opening = resolveOpening();
    await _showCoachBubble(opening.b1);
    if (opening.b2) await _showCoachBubble(opening.b2);
    if (!_alive) return;

    await _showCoachBubble("How's your energy today?");
    const energy = await _askChips("Your energy today", ENERGY_CHIPS);
    if (!energy) return;
    _checkin.energy = energy.value;

    await _showCoachBubble("And your mood alongside that?");
    const mood = await _askChips("Your mood today", MOOD_CHIPS);
    if (!mood) return;
    _checkin.mood = mood.value;

    await _askSore();
  }

  /**
   * One question's answers, inline in the thread. Resolves with the
   * chosen answer; the row is replaced by the person's answer as a user
   * bubble, so the thread reads as a conversation afterwards.
   *
   * `extra` adds a quiet link that resolves with { extra: true } instead
   * (used for the optional sleep question).
   */
  function _askChips(ariaLabel, chips, { note = null, extra = null } = {}) {
    return new Promise(resolve => {
      if (!_alive) return resolve(null);
      const wrap = document.createElement("div");
      wrap.className = "ci-chips";
      wrap.innerHTML = `
        <div class="ci-chips__row" role="group" aria-label="${_esc(ariaLabel)}">
          ${chips.map((c, i) => `<button type="button" class="ci-chip" data-i="${i}">${_esc(c.label)}</button>`).join("")}
        </div>
        ${note ? `<p class="ci-chips__note">${_esc(note)}</p>` : ""}
        ${extra ? `<button type="button" class="ci-chips__extra" data-extra="1">${_esc(extra)}</button>` : ""}
      `;
      _thread.appendChild(wrap);
      _scrollToNewElement(wrap);
      setTimeout(() => wrap.querySelector(".ci-chip")?.focus({ preventScroll: true }), 150);

      wrap.addEventListener("click", ev => {
        const btn = ev.target.closest("button");
        if (!btn || !wrap.contains(btn)) return;
        wrap.remove();
        if (btn.dataset.extra) return resolve({ extra: true });
        const chip = chips[+btn.dataset.i];
        _fadePastBubbles();
        _showUserBubble(chip.label);
        resolve(chip);
      });
    });
  }

  const _areaName = id => (CONDITIONS.find(c => c.id === id)?.name) || id;

  async function _askSore() {
    // A listed condition not named today is quiet today.
    _conditions.forEach(id => { _checkin.conditionLevels[id] = 0; });

    const declared = _conditions.filter(id => CONDITIONS.some(c => c.id === id));
    const common   = COMMON_AREAS.filter(id => !declared.includes(id) && CONDITIONS.some(c => c.id === id));
    const note = declared.length === 1
      ? `${_areaName(declared[0])} comes first because it's the one you've told me about before.`
      : declared.length > 1
        ? "Those come first because they're the ones you've told me about before."
        : null;

    await _showCoachBubble("Anything sore or niggling today?");
    const named = [];
    let first = true;
    while (_alive) {
      const chips = [
        ...declared.filter(id => !named.includes(id)).map(id => ({ label: _areaName(id), id })),
        first ? { label: "Nothing today", id: null } : { label: "That's it", id: null },
        ...common.filter(id => !named.includes(id)).map(id => ({ label: _areaName(id), id })),
        { label: "Somewhere else", id: "__more" },
      ];
      const pick = await _askChips(first ? "Anything sore today" : "Anything else sore",
                                   chips,
                                   { note: first ? note : null,
                                     extra: (!_sleepGiven && first) ? "Add how you slept (optional)" : null });
      if (!pick) return;
      if (pick.extra) { await _askSleep(); continue; }
      let area = pick;
      if (area.id === "__more") {
        await _showCoachBubble("Where?");
        const rest = soreAreaOptions([...declared, ...common, ...named])
          .map(o => ({ label: o.name, id: o.id }));
        area = await _askChips("Where it's sore", rest);
        if (!area) return;
      }
      if (!area.id) break;
      await _askHowBad(area.id);
      named.push(area.id);
      if (named.length === 1) await _showCoachBubble(SAFETY_LINE);   // CL-4
      await _showCoachBubble("Anything else?");
      first = false;
    }
    if (_alive) await _finishConversation();
  }

  async function _askHowBad(id) {
    await _showCoachBubble(`How bad is it today?`);
    const c = await _askChips(`How sore your ${_areaName(id)} is`, PAIN_CHIPS);
    if (!c) return;
    if (!_conditions.includes(id)) {
      // CHECKIN-2a behaviour, kept: a newly sore area joins the list so
      // the next check-in asks about it first.
      store.addSoreArea(id);
      _conditions = store.get("conditions") || [];
    }
    _checkin.conditionLevels[id] = c.value;
  }

  async function _askSleep() {
    await _showCoachBubble("How did you sleep?");
    const s = await _askChips("How you slept", [
      { label: "Poor", value: "poor" }, { label: "Okay", value: "okay" }, { label: "Good", value: "good" }
    ]);
    if (!s) return;
    _checkin.sleepQuality = s.value;
    _sleepGiven = true;
    await _showCoachBubble("Thanks. Anything sore or niggling today?");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FINISH — was the TIME PANEL until 11 Aug 2026
  //
  // Graeme: "I get asked for time twice. It asks in the coach gym proposal
  // stage too. It doesn't need to be twice."
  //
  // He is right, and the check-in is the wrong place to lose. Asking here
  // means guessing at the top of the day, before you have seen what is on
  // offer; asking at the point of building means answering with the session
  // in front of you. Same question, better moment.
  //
  // availableTime is no longer written by check-in. Consumers already
  // handle it being absent: coach-proposal.js's _getAvailableTime() falls
  // back to a sensible default, and session-builder-ui.js asks directly.
  // The store field stays -- Settings may set a usual length later, and
  // removing a field that other code reads is a separate decision.
  // ─────────────────────────────────────────────────────────────────────────

  async function _finishConversation() {
    await _showCoachBubble(_buildSummary());
    await new Promise(r => setTimeout(r, T.PANEL_DELAY));
    if (!_alive) return;
    if (_shouldAskVariety()) {
      await _showVarietyBeat();   // continues to _continue() itself
      return;
    }
    // SMOOTH-P1. No purpose questions: on the Plan the coach decides from
    // the arc and history, and the plan screen lets the person change it.
    _continue();
  }

  /**
   * SMOOTH-P1. The third answer goes straight on. "See what I'm thinking"
   * was a tap that asked nothing; it stays only where it is a real
   * choice -- somebody with exercises from a physio.
   */
  function _continue() {
    const prescribed = store.get("prescribedExercises");
    if (Array.isArray(prescribed) && prescribed.length > 0) return _showActionButtons();
    _saveAll();
    const pending = store.get("pendingDoorRoute");
    store.set("pendingDoorRoute", null);
    router.navigate(pending || "today");
  }

  // ───────────────────────────────────────────────────────
  // DROP-IN COACH QUESTION (DIC-1)
  // Destination Architecture section 8. See the v14 header note for why
  // this is a missing writer rather than a new mechanism.
  // ───────────────────────────────────────────────────────

  // Mirrors session-builder.js's own isAnchor() cutoff. If these ever
  // diverge the question starts promising something selection cannot
  // deliver, so they are deliberately the same number.
  const CONTINUITY_WINDOW_DAYS = 21;

  // The two Home doors with requiresCheckin: true (today.js HOME_DOORS).
  // Both build through session-builder.js, which is what reads the answer.
  const SESSION_DOORS = ["session-builder", "coach-proposal"];

  // Values map 1:1 onto session-builder.js's VARIETY_NOVELTY keys.
  // Copy rule 10.1 -- no internal terms. "Variety", "novelty" and
  // "anchor" are ours; none of them appears on screen.
  const VARIETY_CHOICES = [
    {
      value: "familiar",
      label: "Something like last time",
      sub:   "Stay with the movements you've been building on"
    },
    {
      value: "varied",
      label: "Something different",
      sub:   "A change of pace, with movements you've not done lately"
    },
    {
      value: "balanced",
      label: "Mix it up",
      sub:   "Some of each"
    }
  ];

  /**
   * Is anything still familiar? True when at least one exercise was
   * completed inside the continuity window. exerciseHistory is written
   * on completion only (store.js recordExercises), so a session that was
   * built and abandoned correctly counts for nothing here.
   */
  function _hasRecentHistory() {
    const history = store.get("exerciseHistory");
    if (!history || typeof history !== "object") return false;
    return Object.keys(history).some(id => {
      const s = store.exerciseStats(id);
      return s.seen && s.daysSince !== null && s.daysSince <= CONTINUITY_WINDOW_DAYS;
    });
  }

  /**
   * DIC-FREE, 16 Sep 2026. FREE ONLY. Not a tightening of free -- a
   * correction to the Plan.
   *
   * Graeme, on being asked it repeatedly on a Plan account: "Why do we
   * have this again? I keep asking. This should be Free level only. It
   * shouldn't be part of the Plan."
   *
   * 🔴 I GOT THIS BACKWARDS ON 15 SEP and proposed making it Plan-only,
   * which verify-decisions correctly rejected. Reverting was right;
   * stopping there was not, because the actual fault was left in place.
   *
   * Destination architecture §8 is titled "Free — the drop-in coach",
   * and defines this as the FREE experience's coach moment: free cannot
   * reason about an arc, so the coach asks the one question a human
   * coach would. "He asks about last time. He never asks about March —
   * because you have not told him about March."
   *
   * On the Plan there IS an arc. The coach is meant to decide FROM it.
   * Asking a Plan user the same question every session is the coach
   * admitting it has not looked -- and it is the opposite of "Free is
   * today, the Plan is the arc".
   *
   * ⚫ So free keeps it exactly as §8 specifies, and it is removed from
   * the Plan where it never belonged. verify-decisions still holds:
   * the free path is untouched.
   */
  function _shouldAskVariety() {
    if (isPremium()) return false;
    return SESSION_DOORS.includes(store.get("pendingDoorRoute")) && _hasRecentHistory();
  }

  async function _showVarietyBeat() {
    await _showCoachBubble(
      "Want to do something like last time, or shall we do something different today?"
    );
    await new Promise(r => setTimeout(r, T.PANEL_DELAY));
    _showVarietyPanel();
  }

  function _showVarietyPanel() {
    const panel = _buildPanel(`
      <div class="ci-choices" role="group" aria-label="How today's session should feel">
        ${VARIETY_CHOICES.map(c => `
          <button type="button" class="ci-choice" data-variety="${c.value}">
            <span class="ci-choice__label">${_esc(c.label)}</span>
            <span class="ci-choice__sub">${_esc(c.sub)}</span>
          </button>
        `).join("")}
      </div>
    `);

    panel.querySelectorAll("[data-variety]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const choice = VARIETY_CHOICES.find(c => c.value === btn.dataset.variety);
        if (!choice) return;
        store.set("sessionVariety", choice.value);
        _closePanel(panel);
        _fadePastBubbles();
        await new Promise(r => setTimeout(r, REDUCED_MOTION ? 0 : 400));
        _showUserBubble(choice.label);
        await new Promise(r => setTimeout(r, T.PANEL_DELAY));
        _continue();
      });
    });

    _openPanel(panel);
    setTimeout(
      () => panel.querySelector("[data-variety]")?.focus({ preventScroll: true }),
      150
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACTION BUTTONS (summary step)
  // ─────────────────────────────────────────────────────────────────────────

  function _showActionButtons() {
    const wrap = document.createElement("div");
    wrap.className = "ci-actions";
    wrap.innerHTML = `
      <button class="btn btn-primary btn-large btn-full" id="ci-submit-btn">
        See what I'm thinking &rarr;
      </button>
      <button class="btn btn-ghost btn-full" id="ci-prescribed-btn"
              style="margin-top:var(--space-3);">
        I have prescribed exercises to do
      </button>
    `;
    _thread.appendChild(wrap);
    _scrollToNewElement(wrap);
    requestAnimationFrame(() => wrap.classList.add("is-visible"));
    setTimeout(() => document.getElementById("ci-submit-btn")?.focus({ preventScroll: true }), 150);

    document.getElementById("ci-submit-btn").addEventListener("click", () => {
      _saveAll();
      // Fix, 04 Aug 2026: honour a pending Home-door destination if one
      // was set (session-generating doors route through check-in first
      // now, then continue to where the person actually tapped).
      //
      // Second fix, same day: the old fallback (coach-reflection.js's
      // four-option "Your Session" picker) is now confirmed dead weight
      // for anyone reaching check-in the other way — via the standalone
      // "Check in" link. Traced it: coach-reflection was reached from
      // exactly one place in the whole app, this line. Its four options
      // (Suggest something for me / I have something in mind / My
      // plans / Noticing) substantially duplicate what Home's six doors
      // already offer directly now. Graeme: "I think this page is now
      // obsolete?" — confirmed, not assumed. Falls back to Home instead,
      // where the real doors live. coach-reflection.js itself left in
      // place, not deleted — genuinely unreachable now, worth a proper
      // look before removing the file outright.
      const pending = store.get("pendingDoorRoute");
      if (pending) {
        store.set("pendingDoorRoute", null);
        router.navigate(pending);
      } else {
        router.navigate("today");
      }
    });
    document.getElementById("ci-prescribed-btn").addEventListener("click", () => {
      _saveAll();
      store.set("pendingDoorRoute", null); // explicit alternate choice — don't also carry the door through
      router.navigate("prescribed");
    });
  }

  function _saveAll() {
    store.updateConditionPainScores({ ..._checkin.conditionLevels });
    checkinData.saveCheckin(_checkin);
    store.set("lastCheckin.timestamp", new Date().toISOString());
    // 🔴 CL-2, "lower-intensity". This ran AFTER the purpose questions
    // and overwrote "A lighter session" with the energy-based value --
    // so the coach said "you asked for a lighter session" and then built
    // a normal one. A lighter answer is honoured here now, and it can
    // only ever LOWER: a lighter request never raises anything.
    const asked = intensityForForm(store.get("todayForm"));
    store.set("todayIntensity", asked || checkinData.getSuggestedIntensity(_checkin));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PANEL MECHANICS
  // Bottom-sliding input panels. Each panel is built, opened, and removed.
  // An overlay sits behind the panel for visual focus. Neither panel nor
  // overlay uses sheet-manager.js — these are lightweight inline panels,
  // not full view modules.
  // ─────────────────────────────────────────────────────────────────────────

  function _buildPanel(innerHtml) {
    const overlay = document.createElement("div");
    overlay.className = "ci-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const panel = document.createElement("div");
    panel.className = "ci-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.innerHTML = `<div class="ci-panel-handle" aria-hidden="true"></div>${innerHtml}`;
    panel._overlay  = overlay;

    // STALE-CHECKIN. Built but never attached once the person has left.
    if (_alive) {
      document.body.appendChild(overlay);
      document.body.appendChild(panel);
    }
    return panel;
  }

  // STALE-CHECKIN. Every panel and overlay this view put on the page.
  function _removeAllPanels() {
    document.querySelectorAll(".ci-panel, .ci-overlay").forEach(n => n.remove());
  }

  function onUnmount() {
    _alive = false;
    _removeAllPanels();
  }

  function _openPanel(panel) {
    requestAnimationFrame(() => {
      panel._overlay.classList.add("is-open");
      panel.classList.add("is-open");
    });
  }

  function _closePanel(panel) {
    panel.classList.remove("is-open");
    panel._overlay.classList.remove("is-open");
    setTimeout(() => { panel.remove(); panel._overlay.remove(); }, 350);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // THREAD MECHANICS (same pattern as OB-THREAD / thread.js v6)
  // ─────────────────────────────────────────────────────────────────────────

  function _showTyping() {
    const el = document.createElement("div");
    el.className = "ci-typing";
    el.setAttribute("aria-label", "Coach is typing");
    el.setAttribute("role", "status");
    el.innerHTML = `
      <span class="ci-typing-dot" aria-hidden="true"></span>
      <span class="ci-typing-dot" aria-hidden="true"></span>
      <span class="ci-typing-dot" aria-hidden="true"></span>
    `;
    _thread.appendChild(el);
    _scrollToNewElement(el);
    setTimeout(() => el.classList.add("is-visible"), T.TYPING_SHOW);
    return el;
  }

  function _removeTyping(el) {
    el.classList.remove("is-visible");
    setTimeout(() => el.remove(), 200);
  }

  /**
   * Show typing indicator then replace with coach bubble.
   * Does NOT trigger _fadePastBubbles — fade only fires from user-
   * interaction handlers (panel confirm taps). Same rule as OB-THREAD.
   */
  function _showCoachBubble(text) {
    return new Promise(resolve => {
      const typing = _showTyping();
      const words  = (text || "").split(/\s+/).length;
      const typeMs = REDUCED_MOTION ? 0 : Math.min(Math.max(words * 45, T.TYPING_MIN), 3000);

      setTimeout(() => {
        _removeTyping(typing);
        setTimeout(() => {
          const bubble = document.createElement("div");
          bubble.className = "ci-bubble ci-bubble--coach";
          bubble.innerHTML = `<p>${_esc(text)}</p>`;
          _thread.appendChild(bubble);
          _scrollToNewElement(bubble);
          requestAnimationFrame(() => bubble.classList.add("is-visible"));
          resolve();
        }, T.BUBBLE_DELAY);
      }, typeMs);
    });
  }

  function _showUserBubble(text) {
    const bubble = document.createElement("div");
    bubble.className = "ci-bubble ci-bubble--user";
    bubble.textContent = text;
    _thread.appendChild(bubble);
    _scrollToNewElement(bubble);
    requestAnimationFrame(() => bubble.classList.add("is-visible"));
    return bubble;
  }

  /**
   * Fade all visible coach bubbles to past opacity.
   * RULE: call only from inside confirmed user-interaction handlers
   * (panel confirm taps). Never automatically. User bubbles never fade.
   * Idempotent: already-faded bubbles are not targeted.
   * Does not scroll — scroll is owned entirely by _scrollToNewElement(),
   * called separately by whichever function appends the next element.
   */
  function _fadePastBubbles() {
    _thread.querySelectorAll(".ci-bubble--coach:not(.is-past)")
           .forEach(b => b.classList.add("is-past"));
  }

  /**
   * Scroll so the TOP of the newly-appended element aligns with the top
   * of the thread's visible area — never a blind jump to container
   * bottom. This is the Appendix M fix: reaching the bottom of the
   * thread is an active choice the user makes by scrolling further,
   * not something that happens to them automatically on every message.
   * Used for the typing indicator, every coach bubble, every user
   * bubble, and the final action-buttons block alike, so scroll
   * behaviour is consistent throughout the whole check-in — including
   * the summary bubble at the end (Graeme's decision, 03 Jul 2026).
   */
  /**
   * CI-SPACE, 12 Aug 2026. Graeme, from the device pass: "There's a lot of
   * unnecessary dead space in check-in and writing disappears
   * unnecessarily off the page. My suggestion is to leave a gap for the
   * slides to pop over the top, but bring the writing down."
   *
   * The cause was block:"start" on EVERY message. It was added on 11 Aug
   * for the opposite complaint -- the top of a long message being cut off
   * -- and it fixed that, but it also drags every SHORT message to the top
   * of the viewport, leaving the rest of the screen empty beneath it. The
   * conversation ends up floating at the ceiling with nothing under it.
   *
   * Both are the same question asked at two message lengths, so it is
   * answered per message rather than once for all of them:
   *
   *   fits in the space above the panel -> block:"end", so it sits just
   *   above where the panel appears, like any other conversation
   *
   *   taller than that space -> block:"start", so its top is readable and
   *   nobody has to scroll back up
   *
   * The trailing padding drops from 70vh to 46vh with it -- enough for
   * the panel to open over empty space rather than over the conversation,
   * which is the gap Graeme is describing.
   */
  const PANEL_CLEARANCE = 0.46;   // must match .ci-thread's padding-bottom

  function _scrollToNewElement(el) {
    setTimeout(() => {
      if (!el) return;
      const available = window.innerHeight * (1 - PANEL_CLEARANCE);
      const tooTall   = el.getBoundingClientRect().height > available;
      el.scrollIntoView({
        block: tooTall ? "start" : "end",
        behavior: REDUCED_MOTION ? "auto" : "smooth",
      });
    }, T.SCROLL_DELAY);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BRIDGE LINES AND SUMMARY
  // ─────────────────────────────────────────────────────────────────────────

  function _buildSummary() {
    const e    = _checkin.energy;
    const m    = _checkin.mood;
    const tl   = { micro: "10 minutes", quick: "20 minutes", short: "30 minutes",
                   standard: "40 minutes", long: "50 minutes", open: "an hour or more" };

    let line = "";
    if (e >= 7 && m >= 7)    line = "Good energy, good mood";
    else if (e >= 7)         line = "Good energy";
    else if (m >= 7)         line = "Good mood";
    else if (e <= 3 || m <= 3) line = "A harder day";
    else                     line = "A moderate day";

    // SMOOTH-P1. Sleep is mentioned only when the person told us.
    const q = _checkin.sleepQuality;
    if (q === "good")      line += ", and you slept well.";
    else if (q === "poor") line += ", and a poor night's sleep.";
    else                   line += ".";

    if (_selectedTime) line += ` You have ${tl[_selectedTime] || _selectedTime} today.`;   // only if set elsewhere
    line += " I'll have something ready for you.";
    return line;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  function _esc(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ─────────────────────────────────────────────────────────────────────────

  return { mount, onUnmount };
}
