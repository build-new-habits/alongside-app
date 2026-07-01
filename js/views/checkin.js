/**
 * js/views/checkin.js
 * 01 Jul 2026 v3
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
import { CONDITIONS }      from "../data/conditions.js";

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
      _showUserBubble(`${checkinData.getMoodEmoji(_checkin.mood)} ${_checkin.mood}/10 — ${checkinData.getMoodLabel(_checkin.mood)}`);
      await _showCoachBubble(_moodBridge(_checkin.mood));
      _showSleepPanel();
    });

    _openPanel(panel);
    setTimeout(() => slider.focus(), 350);
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
      const level = _checkin.conditionLevels[id] || 1;
      return `
        <div class="ci-condition-row" data-condition="${id}">
          <p class="ci-condition-name">
            <span aria-hidden="true">${cond?.icon || ""}</span>
            ${_esc(cond?.name || id)}
          </p>
          <div class="ci-pain-chips" role="group"
               aria-label="Pain level for ${_esc(cond?.name || id)}">
            <button class="ci-pain-chip ${level <= 2 ? "selected low" : ""}"
                    data-level="1" aria-pressed="${level <= 2}">None</button>
            <button class="ci-pain-chip ${level > 2 && level <= 5 ? "selected mild" : ""}"
                    data-level="4" aria-pressed="${level > 2 && level <= 5}">Mild</button>
            <button class="ci-pain-chip ${level > 5 && level <= 7 ? "selected moderate" : ""}"
                    data-level="6" aria-pressed="${level > 5 && level <= 7}">Moderate</button>
            <button class="ci-pain-chip ${level > 7 ? "selected severe" : ""}"
                    data-level="9" aria-pressed="${level > 7}">Severe</button>
          </div>
        </div>
      `;
    }).join("");

    const panel = _buildPanel(`
      ${rows}
      <button class="btn btn-primary btn-large btn-full" id="ci-cond-confirm"
              style="margin-top:var(--space-4);" aria-label="Confirm pain levels">Next</button>
    `);

    panel.querySelectorAll(".ci-condition-row").forEach(row => {
      row.querySelectorAll(".ci-pain-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          const condId = row.dataset.condition;
          const level  = parseInt(chip.dataset.level);
          _checkin.conditionLevels[condId] = level;
          row.querySelectorAll(".ci-pain-chip").forEach(c => {
            const sel = c === chip;
            c.classList.toggle("selected", sel);
            c.setAttribute("aria-pressed", sel);
            c.classList.remove("low","mild","moderate","severe");
            if (sel) {
              if      (level <= 2) c.classList.add("low");
              else if (level <= 5) c.classList.add("mild");
              else if (level <= 7) c.classList.add("moderate");
              else                 c.classList.add("severe");
            }
          });
        });
      });
    });

    panel.querySelector("#ci-cond-confirm").addEventListener("click", async () => {
      _closePanel(panel);
      _fadePastBubbles();
      const summary = _conditions.map(id => {
        const cond   = CONDITIONS.find(c => c.id === id);
        const level  = _checkin.conditionLevels[id] || 1;
        const label  = level <= 2 ? "no pain" : level <= 5 ? "mild" : level <= 7 ? "moderate" : "severe";
        return `${cond?.name || id}: ${label}`;
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
      const timeLabels = { micro: "10 minutes", quick: "20 minutes", short: "30 minutes",
                           standard: "40 minutes", long: "50 minutes", open: "60+ minutes" };
      if (_selectedTime) _showUserBubble(timeLabels[_selectedTime] || _selectedTime);
      await _showCoachBubble(_buildSummary());
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
    _scrollToBottom();
    requestAnimationFrame(() => wrap.classList.add("is-visible"));
    setTimeout(() => document.getElementById("ci-submit-btn")?.focus(), 150);

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
    _scrollToBottom();
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
          _scrollToBottom();
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
    _scrollToBottom();
    requestAnimationFrame(() => bubble.classList.add("is-visible"));
    return bubble;
  }

  /**
   * Fade all visible coach bubbles to past opacity.
   * RULE: call only from inside confirmed user-interaction handlers
   * (panel confirm taps). Never automatically. User bubbles never fade.
   * Idempotent: already-faded bubbles are not targeted.
   */
  function _fadePastBubbles() {
    _thread.querySelectorAll(".ci-bubble--coach:not(.is-past)")
           .forEach(b => b.classList.add("is-past"));
  }

  function _scrollToBottom() {
    setTimeout(() => { if (_thread) _thread.scrollTop = _thread.scrollHeight; }, T.SCROLL_DELAY);
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
