/**
 * js/views/checkin.js
 * 04 Aug 2026 v9
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
import { checkinData }     from "../data/checkin.js";
import { resolveOpening }  from "../data/checkin-openings.js";
import { CONDITIONS, getPainBand } from "../data/conditions.js";
import { WORD_SETS, getQuadrant, detectSignalWord } from "../data/feelings.js";

export function CheckinView(router) {

  // ── Motion preference (matches OB-THREAD timing constants) ─────────────────
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T = {
    TYPING_SHOW:  REDUCED_MOTION ? 0 :  300,
    TYPING_MIN:   REDUCED_MOTION ? 0 :  900,
    BUBBLE_DELAY: REDUCED_MOTION ? 0 :  120,
    PANEL_DELAY:  REDUCED_MOTION ? 0 :  400,
    SCROLL_DELAY: REDUCED_MOTION ? 0 :   80,
  };

  // ── State ───────────────────────────────────────────────────────────────────
  let _container  = null;
  let _thread     = null;
  let _conditions = [];
  let _name       = "";

  let _checkin = {
    energy:          5,
    mood:            5,
    sleepHours:      7,
    sleepQuality:    "okay",
    conditionLevels: {},
    notes:           "",
    feelingWord:     null,
    feelingQuadrant: null,
  };
  let _selectedTime = null;

  // ── Available time options ──────────────────────────────────────────────────
  const TIME_OPTIONS = [
    { value: "micro",    label: "Micro",    sub: "10 min" },
    { value: "quick",    label: "Quick",    sub: "20 min" },
    { value: "short",    label: "Short",    sub: "30 min" },
    { value: "standard", label: "Standard", sub: "40 min" },
    { value: "long",     label: "Long",     sub: "50 min" },
    { value: "open",     label: "Open",     sub: "60+ min" },
  ];

  // ── Mount ───────────────────────────────────────────────────────────────────

  function mount(container) {
    _container   = container;
    _conditions  = store.get("conditions") || [];
    _name        = (store.get("name") || "").split(" ")[0] || "";
    _selectedTime = store.get("availableTime") || null;

    // Pre-fill from today's existing check-in or yesterday's sleep data
    const existing = checkinData.getTodaysCheckin();
    if (existing) {
      _checkin = { ..._checkin, ...existing };
    } else {
      const history = checkinData.getHistory(1) || [];
      if (history[0]?.sleepHours) {
        _checkin.sleepHours  = history[0].sleepHours;
        _checkin.sleepQuality = history[0].sleepQuality || "okay";
      }
    }

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
  // OPENING NARRATIVE (D2)
  // ─────────────────────────────────────────────────────────────────────────

  async function _runOpening() {
    const opening = resolveOpening();
    await _showCoachBubble(opening.b1);
    if (opening.b2) {
      await _showCoachBubble(opening.b2);
    }
    setTimeout(_showEnergyPanel, T.PANEL_DELAY);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ENERGY PANEL
  // ─────────────────────────────────────────────────────────────────────────

  function _showEnergyPanel() {
    const val     = _checkin.energy;
    const hour    = new Date().getHours();
    const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
    const nameStr  = _name ? `, ${_esc(_name)}` : "";

    const panel = _buildPanel(`
      <p class="ci-panel-q">${greeting}${nameStr}. How's your energy today?</p>
      <div class="ci-slider-wrap">
        <div class="ci-value-row" aria-live="polite" aria-atomic="true">
          <span class="ci-value-emoji" id="ci-e-emoji" aria-hidden="true">${checkinData.getEnergyEmoji(val)}</span>
          <span class="ci-value-num"   id="ci-e-num">${val}</span>
          <span class="ci-value-label" id="ci-e-label">${checkinData.getEnergyLabel(val)}</span>
        </div>
        <input type="range" id="ci-energy-slider" class="ci-slider"
               min="1" max="10" value="${val}"
               aria-label="Energy level, 1 exhausted to 10 energised"
               aria-valuetext="${checkinData.getEnergyLabel(val)}">
        <div class="ci-slider-ends" aria-hidden="true">
          <span>Exhausted</span><span>Energised</span>
        </div>
      </div>
      <button class="btn btn-primary btn-large btn-full" id="ci-energy-confirm"
              aria-label="Confirm energy level">Next</button>
    `);

    const slider = panel.querySelector("#ci-energy-slider");
    slider.addEventListener("input", () => {
      const n = parseInt(slider.value);
      _checkin.energy = n;
      panel.querySelector("#ci-e-emoji").textContent  = checkinData.getEnergyEmoji(n);
      panel.querySelector("#ci-e-num").textContent    = n;
      panel.querySelector("#ci-e-label").textContent  = checkinData.getEnergyLabel(n);
      slider.setAttribute("aria-valuetext", checkinData.getEnergyLabel(n));
    });

    panel.querySelector("#ci-energy-confirm").addEventListener("click", async () => {
      _closePanel(panel);
      _fadePastBubbles();
      await new Promise(r => setTimeout(r, REDUCED_MOTION ? 0 : 400));
      _showUserBubble(`${checkinData.getEnergyEmoji(_checkin.energy)} ${_checkin.energy}/10 — ${checkinData.getEnergyLabel(_checkin.energy)}`);
      await _showCoachBubble(_energyBridge(_checkin.energy));
      _showMoodPanel();
    });

    _openPanel(panel);
    setTimeout(() => slider.focus(), 350);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MOOD PANEL
  // ─────────────────────────────────────────────────────────────────────────

  function _showMoodPanel() {
    const val = _checkin.mood;

    const panel = _buildPanel(`
      <p class="ci-panel-q">How's your mood?</p>
      <div class="ci-slider-wrap">
        <div class="ci-value-row" aria-live="polite" aria-atomic="true">
          <span class="ci-value-emoji" id="ci-m-emoji" aria-hidden="true">${checkinData.getMoodEmoji(val)}</span>
          <span class="ci-value-num"   id="ci-m-num">${val}</span>
          <span class="ci-value-label" id="ci-m-label">${checkinData.getMoodLabel(val)}</span>
        </div>
        <input type="range" id="ci-mood-slider" class="ci-slider"
               min="1" max="10" value="${val}"
               aria-label="Mood, 1 struggling to 10 great"
               aria-valuetext="${checkinData.getMoodLabel(val)}">
        <div class="ci-slider-ends" aria-hidden="true">
          <span>Struggling</span><span>Great</span>
        </div>
      </div>
      <button class="btn btn-primary btn-large btn-full" id="ci-mood-confirm"
              aria-label="Confirm mood">Next</button>
    `);

    const slider = panel.querySelector("#ci-mood-slider");
    slider.addEventListener("input", () => {
      const n = parseInt(slider.value);
      _checkin.mood = n;
      panel.querySelector("#ci-m-emoji").textContent = checkinData.getMoodEmoji(n);
      panel.querySelector("#ci-m-num").textContent   = n;
      panel.querySelector("#ci-m-label").textContent = checkinData.getMoodLabel(n);
      slider.setAttribute("aria-valuetext", checkinData.getMoodLabel(n));
    });

    panel.querySelector("#ci-mood-confirm").addEventListener("click", async () => {
      _closePanel(panel);
      _fadePastBubbles();
      await new Promise(r => setTimeout(r, REDUCED_MOTION ? 0 : 400));
      _showUserBubble(`${checkinData.getMoodEmoji(_checkin.mood)} ${_checkin.mood}/10 — ${checkinData.getMoodLabel(_checkin.mood)}`);
      await _showCoachBubble(_moodBridge(_checkin.mood));
      _showFeelingWordPanel();
    });

    _openPanel(panel);
    setTimeout(() => slider.focus(), 350);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FEELING WORD PANEL (F1 — Quadrant Word Check-In)
  // ─────────────────────────────────────────────────────────────────────────

  function _showFeelingWordPanel() {
    const quadrant = getQuadrant(_checkin.energy, _checkin.mood);
    const words    = WORD_SETS[quadrant];
    let expanded   = false;

    function chipsHtml(showExpanded) {
      const list = showExpanded ? [...words.core, ...words.expanded] : words.core;
      return list.map(w => `
        <button type="button" class="ci-quality-chip" data-word="${_esc(w)}"
                role="radio" aria-checked="${_checkin.feelingWord === w}">
          ${_esc(w)}
        </button>
      `).join("");
    }

    const panel = _buildPanel(`
      <p class="ci-panel-q">Is there a word for how you're feeling?</p>
      <div class="ci-quality-chips" id="ci-feeling-chips"
           role="radiogroup" aria-label="Feeling word"
           style="display:flex;flex-wrap:wrap;gap:var(--space-2);">
        ${chipsHtml(false)}
      </div>
      <button type="button" class="btn btn-ghost btn-full" id="ci-feeling-more"
              aria-expanded="false" style="margin-top:var(--space-3);">
        More words
      </button>
      <button type="button" class="btn btn-ghost btn-full" id="ci-feeling-skip"
              style="margin-top:var(--space-2);">
        Can't find a word today
      </button>
      <button class="btn btn-primary btn-large btn-full" id="ci-feeling-confirm"
              style="margin-top:var(--space-4);display:none;"
              aria-label="Confirm feeling word">Next</button>
    `);

    function wireChips() {
      panel.querySelectorAll("[data-word]").forEach(chip => {
        chip.addEventListener("click", () => {
          _checkin.feelingWord     = chip.dataset.word;
          _checkin.feelingQuadrant = quadrant;
          panel.querySelectorAll("[data-word]").forEach(c => {
            const sel = c === chip;
            c.classList.toggle("selected", sel);
            c.setAttribute("aria-checked", sel);
          });
          panel.querySelector("#ci-feeling-confirm").style.display = "block";

          // Dormant safeguarding check. Fires and logs for dev
          // visibility only — no user-facing response until the Crisis
          // & Safeguarding Policy (v6) is signed off. See Appendix L.
          if (detectSignalWord(_checkin.feelingWord)) {
            console.log("[safeguarding] signal word detected (dormant, no UI action):", _checkin.feelingWord);
          }
        });
      });
    }
    wireChips();

    panel.querySelector("#ci-feeling-more").addEventListener("click", () => {
      expanded = !expanded;
      const btn = panel.querySelector("#ci-feeling-more");
      btn.setAttribute("aria-expanded", expanded);
      btn.textContent = expanded ? "Fewer words" : "More words";
      panel.querySelector("#ci-feeling-chips").innerHTML = chipsHtml(expanded);
      wireChips();
    });

    panel.querySelector("#ci-feeling-skip").addEventListener("click", async () => {
      _checkin.feelingWord     = null;
      _checkin.feelingQuadrant = quadrant;
      _closePanel(panel);
      _fadePastBubbles();
      await new Promise(r => setTimeout(r, REDUCED_MOTION ? 0 : 400));
      _showSleepPanel();
    });

    panel.querySelector("#ci-feeling-confirm").addEventListener("click", async () => {
      _closePanel(panel);
      _fadePastBubbles();
      await new Promise(r => setTimeout(r, REDUCED_MOTION ? 0 : 400));
      _showUserBubble(_checkin.feelingWord);
      _showSleepPanel();
    });

    _openPanel(panel);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SLEEP PANEL
  // ─────────────────────────────────────────────────────────────────────────

  function _showSleepPanel() {
    const existing  = checkinData.getTodaysCheckin();
    const prefilled = !existing && (checkinData.getHistory(1) || [])[0]?.sleepHours;
    const note      = prefilled ? " I've pre-filled this from yesterday — adjust if needed." : "";

    const panel = _buildPanel(`
      <p class="ci-panel-q">How long did you sleep?${note}</p>
      <div class="ci-sleep-adjuster">
        <button type="button" class="ci-sleep-btn" id="ci-sleep-minus"
                aria-label="Decrease sleep hours">&#8722;</button>
        <div class="ci-sleep-display" aria-live="polite"
             aria-label="${_checkin.sleepHours} hours">
          <span class="ci-sleep-num" id="ci-sleep-num">${_checkin.sleepHours}</span>
          <span class="ci-sleep-unit">hrs</span>
        </div>
        <button type="button" class="ci-sleep-btn" id="ci-sleep-plus"
                aria-label="Increase sleep hours">&#43;</button>
      </div>
      <div class="ci-quality-wrap">
        <p class="ci-quality-label">How was the quality?</p>
        <div class="ci-quality-chips" role="group" aria-label="Sleep quality">
          ${["Poor","Okay","Good"].map(q => `
            <button type="button"
                    class="ci-quality-chip ${_checkin.sleepQuality === q.toLowerCase() ? "selected" : ""}"
                    data-quality="${q.toLowerCase()}"
                    aria-pressed="${_checkin.sleepQuality === q.toLowerCase()}">${q}</button>
          `).join("")}
        </div>
      </div>
      <button class="btn btn-primary btn-large btn-full" id="ci-sleep-confirm"
              style="margin-top:var(--space-4);" aria-label="Confirm sleep">Next</button>
    `);

    panel.querySelector("#ci-sleep-minus").addEventListener("click", () => {
      _checkin.sleepHours = Math.max(0, _checkin.sleepHours - 0.5);
      panel.querySelector("#ci-sleep-num").textContent = _checkin.sleepHours;
    });
    panel.querySelector("#ci-sleep-plus").addEventListener("click", () => {
      _checkin.sleepHours = Math.min(14, _checkin.sleepHours + 0.5);
      panel.querySelector("#ci-sleep-num").textContent = _checkin.sleepHours;
    });
    panel.querySelectorAll(".ci-quality-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        _checkin.sleepQuality = chip.dataset.quality;
        panel.querySelectorAll(".ci-quality-chip").forEach(c => {
          c.classList.toggle("selected", c === chip);
          c.setAttribute("aria-pressed", c === chip);
        });
      });
    });

    panel.querySelector("#ci-sleep-confirm").addEventListener("click", async () => {
      _closePanel(panel);
      _fadePastBubbles();
      await new Promise(r => setTimeout(r, REDUCED_MOTION ? 0 : 400));
      _showUserBubble(`${_checkin.sleepHours} hours — ${_checkin.sleepQuality}`);
      if (_conditions.length > 0) {
        await _showCoachBubble("One more thing. How's the pain today?");
        _showConditionsPanel();
      } else {
        await _showCoachBubble("Last one. How much time do you have today?");
        _showTimePanel();
      }
    });

    _openPanel(panel);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONDITIONS PANEL
  // ─────────────────────────────────────────────────────────────────────────

  function _showConditionsPanel() {
    const rows = _conditions.map(id => {
      const cond  = CONDITIONS.find(c => c.id === id);
      const level = _checkin.conditionLevels[id] !== undefined ? _checkin.conditionLevels[id] : 0;
      const band  = getPainBand(level);
      return `
        <div class="ci-condition-row" data-condition="${id}">
          <p class="ci-condition-name">
            <span aria-hidden="true">${cond?.icon || ""}</span>
            ${_esc(cond?.name || id)}
          </p>
          <div class="ci-slider-wrap ci-slider-wrap--condition">
            <div class="ci-value-row" aria-live="polite" aria-atomic="true">
              <span class="ci-value-num"   id="ci-cond-num-${id}">${level}</span>
              <span class="ci-value-label ci-value-label--${band.id}" id="ci-cond-label-${id}">${band.label}</span>
            </div>
            <input type="range" class="ci-slider" id="ci-cond-slider-${id}"
                   data-condition="${id}"
                   min="0" max="10" value="${level}"
                   aria-label="Pain level for ${_esc(cond?.name || id)}, 0 none to 10 severe"
                   aria-valuetext="${band.label}">
            <div class="ci-slider-ends" aria-hidden="true">
              <span>None</span><span>Severe</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    const panel = _buildPanel(`
      ${rows}
      <button class="btn btn-primary btn-large btn-full" id="ci-cond-confirm"
              style="margin-top:var(--space-4);" aria-label="Confirm pain levels">Next</button>
    `);

    panel.querySelectorAll(".ci-slider[data-condition]").forEach(slider => {
      slider.addEventListener("input", () => {
        const condId = slider.dataset.condition;
        const n       = parseInt(slider.value);
        const band    = getPainBand(n);
        _checkin.conditionLevels[condId] = n;
        const numEl   = panel.querySelector(`#ci-cond-num-${condId}`);
        const labelEl = panel.querySelector(`#ci-cond-label-${condId}`);
        numEl.textContent   = n;
        labelEl.textContent = band.label;
        labelEl.className   = `ci-value-label ci-value-label--${band.id}`;
        slider.setAttribute("aria-valuetext", band.label);
      });
    });

    panel.querySelector("#ci-cond-confirm").addEventListener("click", async () => {
      _closePanel(panel);
      _fadePastBubbles();
      await new Promise(r => setTimeout(r, REDUCED_MOTION ? 0 : 400));
      const summary = _conditions.map(id => {
        const cond   = CONDITIONS.find(c => c.id === id);
        const level  = _checkin.conditionLevels[id] !== undefined ? _checkin.conditionLevels[id] : 0;
        const band   = getPainBand(level);
        return `${cond?.name || id}: ${band.label.toLowerCase()}`;
      }).join(", ");
      _showUserBubble(summary);
      await _showCoachBubble("Last one. How much time do you have today?");
      _showTimePanel();
    });

    _openPanel(panel);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TIME PANEL
  // ─────────────────────────────────────────────────────────────────────────

  function _showTimePanel() {
    const panel = _buildPanel(`
      <div class="ci-time-grid" role="group" aria-label="Available time today">
        ${TIME_OPTIONS.map(opt => `
          <button type="button"
                  class="ci-time-card ${_selectedTime === opt.value ? "selected" : ""}"
                  data-time="${opt.value}"
                  aria-pressed="${_selectedTime === opt.value}">
            <span class="ci-time-label">${opt.label}</span>
            <span class="ci-time-sub">${opt.sub}</span>
          </button>
        `).join("")}
      </div>
      <p class="text-sm text-muted" style="margin-top:var(--space-3);text-align:center;">
        Skip this and I'll use your energy level to decide.
      </p>
      <button class="btn btn-primary btn-large btn-full" id="ci-time-confirm"
              style="margin-top:var(--space-4);" aria-label="Done">Done</button>
    `);

    panel.querySelectorAll(".ci-time-card").forEach(card => {
      card.addEventListener("click", () => {
        _selectedTime = _selectedTime === card.dataset.time ? null : card.dataset.time;
        panel.querySelectorAll(".ci-time-card").forEach(c => {
          const sel = c.dataset.time === _selectedTime;
          c.classList.toggle("selected", sel);
          c.setAttribute("aria-pressed", sel);
        });
      });
    });

    panel.querySelector("#ci-time-confirm").addEventListener("click", async () => {
      _closePanel(panel);
      _fadePastBubbles();
      await new Promise(r => setTimeout(r, REDUCED_MOTION ? 0 : 400));
      const timeLabels = { micro: "10 minutes", quick: "20 minutes", short: "30 minutes",
                           standard: "40 minutes", long: "50 minutes", open: "60+ minutes" };
      if (_selectedTime) _showUserBubble(timeLabels[_selectedTime] || _selectedTime);
      await _showCoachBubble(_buildSummary());
      await new Promise(r => setTimeout(r, T.PANEL_DELAY));
      _showActionButtons();
    });

    _openPanel(panel);
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

    document.getElementById("ci-submit-btn").addEventListener("click", () => { _saveAll(); router.navigate("coach-reflection"); });
    document.getElementById("ci-prescribed-btn").addEventListener("click", () => { _saveAll(); router.navigate("prescribed"); });
  }

  function _saveAll() {
    store.updateConditionPainScores({ ..._checkin.conditionLevels });
    store.set("availableTime", _selectedTime);
    checkinData.saveCheckin(_checkin);
    store.set("lastCheckin.timestamp", new Date().toISOString());
    store.set("todayIntensity", checkinData.getSuggestedIntensity(_checkin));
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

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    return panel;
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
  function _scrollToNewElement(el) {
    setTimeout(() => {
      if (!el) return;
      el.scrollIntoView({ block: "start", behavior: REDUCED_MOTION ? "auto" : "smooth" });
    }, T.SCROLL_DELAY);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BRIDGE LINES AND SUMMARY
  // ─────────────────────────────────────────────────────────────────────────

  function _energyBridge(energy) {
    if (energy >= 8) return "Good energy. Let's see what else is going on.";
    if (energy >= 6) return "Solid. How about your mood?";
    if (energy >= 4) return "Okay, I hear that. How's your mood sitting alongside that?";
    return "That's low. I want to understand the full picture.";
  }

  function _moodBridge(mood) {
    if (mood >= 8) return "Good. And sleep — how was last night?";
    if (mood >= 5) return "Alright. How did you sleep?";
    return "Understood. Sleep affects everything — tell me about last night.";
  }

  function _buildSummary() {
    const e    = _checkin.energy;
    const m    = _checkin.mood;
    const s    = _checkin.sleepHours;
    const tl   = { micro: "10 minutes", quick: "20 minutes", short: "30 minutes",
                   standard: "40 minutes", long: "50 minutes", open: "an hour or more" };

    let line = "";
    if (e >= 7 && m >= 7)    line = "Good energy, good mood";
    else if (e >= 7)         line = "Good energy";
    else if (m >= 7)         line = "Good mood";
    else if (e <= 3 || m <= 3) line = "A harder day";
    else                     line = "A moderate day";

    if (s >= 8)      line += ", well rested.";
    else if (s >= 6) line += `, ${s} hours sleep.`;
    else             line += ", lighter sleep than usual.";

    if (_selectedTime) line += ` You have ${tl[_selectedTime] || _selectedTime} today.`;
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

  return { mount };
}
