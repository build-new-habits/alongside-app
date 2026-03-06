/**
 * checkin.js - Daily Check-In View
 *
 * v1.2 — Pain score wiring:
 *   submitCheckin() now calls store.updateConditionPainScores(conditionLevels)
 *   so the 3-tier condition filter in exercises/index.js receives today's
 *   pain levels and can correctly resolve phase-aware condition variants
 *   (e.g. hamstring-acute vs hamstring-subacute).
 */

import { store } from '../store.js';
import { checkinData } from '../data/checkin.js';
import { CONDITIONS } from '../data/conditions.js';

export const centered = false;

// Temporary state during check-in (reset each time view mounts)
let currentCheckin = {
  energy: 5,
  mood: 5,
  sleepHours: 7,
  sleepQuality: 'okay',
  conditionLevels: {},
  cycleDay: null,
  notes: ''
};

export function render() {
  const name            = store.get('name') || 'there';
  const conditions      = store.get('conditions') || [];
  const hormonalTracking = store.get('hormonalTracking');
  const burnout         = checkinData.detectBurnout();

  // Seed condition levels from last saved scores (so sliders remember state)
  const savedPainScores = store.get('conditionPainScores') || {};
  conditions.forEach(c => {
    if (!currentCheckin.conditionLevels[c]) {
      currentCheckin.conditionLevels[c] = savedPainScores[c] || 1;
    }
  });

  return `
    <div class="view checkin-view">

      <div class="view-header">
        <h1>Hey ${name} 👋</h1>
        <p class="text-secondary">Let's see how you're doing today.</p>
      </div>

      ${burnout.message ? `
        <div class="card card-warning" role="note">
          <div class="warning-content">
            <span class="warning-icon" aria-hidden="true">💛</span>
            <p>${burnout.message}</p>
          </div>
        </div>
      ` : ''}

      <!-- ── Energy ─────────────────────────────────────────────────────── -->
      <div class="checkin-section">
        <div class="section-header">
          <h2>Energy Level</h2>
          <span class="section-value" id="energy-display" aria-live="polite">
            ${checkinData.getEnergyEmoji(currentCheckin.energy)} ${checkinData.getEnergyLabel(currentCheckin.energy)}
          </span>
        </div>
        <div class="slider-container">
          <input
            type="range"
            id="energy-slider"
            class="checkin-slider"
            min="1"
            max="10"
            value="${currentCheckin.energy}"
            aria-label="Energy level, 1 exhausted to 10 energised"
          >
          <div class="slider-labels" aria-hidden="true">
            <span>Exhausted</span>
            <span>Energised</span>
          </div>
        </div>
      </div>

      <!-- ── Mood ───────────────────────────────────────────────────────── -->
      <div class="checkin-section">
        <div class="section-header">
          <h2>Mood</h2>
          <span class="section-value" id="mood-display" aria-live="polite">
            ${checkinData.getMoodEmoji(currentCheckin.mood)} ${checkinData.getMoodLabel(currentCheckin.mood)}
          </span>
        </div>
        <div class="slider-container">
          <input
            type="range"
            id="mood-slider"
            class="checkin-slider"
            min="1"
            max="10"
            value="${currentCheckin.mood}"
            aria-label="Mood, 1 struggling to 10 great"
          >
          <div class="slider-labels" aria-hidden="true">
            <span>Struggling</span>
            <span>Great</span>
          </div>
        </div>
      </div>

      <!-- ── Sleep ──────────────────────────────────────────────────────── -->
      <div class="checkin-section">
        <div class="section-header">
          <h2>Sleep Last Night</h2>
        </div>
        <div class="sleep-inputs">
          <div class="sleep-hours">
            <label class="input-label" id="sleep-hours-label">Hours</label>
            <div class="hours-adjuster" role="group" aria-labelledby="sleep-hours-label">
              <button type="button" class="btn-icon" id="sleep-minus" aria-label="Decrease sleep hours">−</button>
              <span class="hours-value" id="sleep-hours-display" aria-live="polite">${currentCheckin.sleepHours}</span>
              <button type="button" class="btn-icon" id="sleep-plus" aria-label="Increase sleep hours">+</button>
            </div>
          </div>
          <div class="sleep-quality">
            <label class="input-label" id="sleep-quality-label">Quality</label>
            <div class="quality-options" id="quality-buttons" role="group" aria-labelledby="sleep-quality-label">
              <button type="button" class="btn-pill ${currentCheckin.sleepQuality === 'poor' ? 'selected' : ''}" data-quality="poor" aria-pressed="${currentCheckin.sleepQuality === 'poor'}">Poor</button>
              <button type="button" class="btn-pill ${currentCheckin.sleepQuality === 'okay' ? 'selected' : ''}" data-quality="okay" aria-pressed="${currentCheckin.sleepQuality === 'okay'}">Okay</button>
              <button type="button" class="btn-pill ${currentCheckin.sleepQuality === 'good' ? 'selected' : ''}" data-quality="good" aria-pressed="${currentCheckin.sleepQuality === 'good'}">Good</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Condition Pain Levels ──────────────────────────────────────── -->
      ${conditions.length > 0 ? `
        <div class="checkin-section">
          <div class="section-header">
            <h2>How's the pain today?</h2>
          </div>
          <div class="condition-checks">
            ${conditions.map(conditionId => {
              const condition = CONDITIONS.find(c => c.id === conditionId);
              const level     = currentCheckin.conditionLevels[conditionId] || 1;
              return `
                <div class="condition-check" data-condition="${conditionId}">
                  <div class="condition-info">
                    <span class="condition-icon" aria-hidden="true">${condition?.icon || '🩹'}</span>
                    <span class="condition-name">${condition?.name || conditionId}</span>
                  </div>
                  <div class="pain-selector" role="group" aria-label="Pain level for ${condition?.name || conditionId}">
                    <button type="button" class="pain-btn ${level <= 2 ? 'selected low' : ''}"    data-level="1" aria-pressed="${level <= 2}">None</button>
                    <button type="button" class="pain-btn ${level > 2 && level <= 5 ? 'selected medium' : ''}" data-level="4" aria-pressed="${level > 2 && level <= 5}">Mild</button>
                    <button type="button" class="pain-btn ${level > 5 && level <= 7 ? 'selected high' : ''}"   data-level="6" aria-pressed="${level > 5 && level <= 7}">Moderate</button>
                    <button type="button" class="pain-btn ${level > 7 ? 'selected severe' : ''}"  data-level="9" aria-pressed="${level > 7}">Severe</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- ── Hormonal Cycle ─────────────────────────────────────────────── -->
      ${hormonalTracking ? `
        <div class="checkin-section">
          <div class="section-header">
            <h2>Cycle Day</h2>
            <span class="text-muted">(optional)</span>
          </div>
          <div class="cycle-input">
            <input
              type="number"
              id="cycle-day"
              class="input-field cycle-day-input"
              placeholder="Day of cycle"
              min="1"
              max="45"
              value="${currentCheckin.cycleDay || ''}"
              aria-label="Day of menstrual cycle, day 1 is first day of period"
            >
            <p class="text-sm text-muted">Day 1 = first day of period</p>
          </div>
        </div>
      ` : ''}

      <!-- ── Notes ─────────────────────────────────────────────────────── -->
      <div class="checkin-section">
        <div class="section-header">
          <h2>Anything else?</h2>
          <span class="text-muted">(optional)</span>
        </div>
        <textarea
          id="checkin-notes"
          class="input-field notes-input"
          placeholder="Sore from yesterday, feeling anxious, big day ahead…"
          rows="3"
          aria-label="Optional notes about how you're feeling"
        >${currentCheckin.notes}</textarea>
      </div>

      <!-- ── Submit ────────────────────────────────────────────────────── -->
      <div class="checkin-actions">
        <button type="button" class="btn btn-primary btn-large btn-full" id="submit-checkin">
          See today's workout options
        </button>
      </div>

    </div>
  `;
}

export function onMount() {
  // Restore existing check-in if one was already saved today
  const existing = checkinData.getTodaysCheckin();
  if (existing) {
    currentCheckin = { ...currentCheckin, ...existing };
    updateEnergyDisplay(currentCheckin.energy);
    updateMoodDisplay(currentCheckin.mood);
  }

  // ── Energy slider ───────────────────────────────────────────────────────
  document.getElementById('energy-slider')?.addEventListener('input', e => {
    const value = parseInt(e.target.value);
    currentCheckin.energy = value;
    updateEnergyDisplay(value);
  });

  // ── Mood slider ─────────────────────────────────────────────────────────
  document.getElementById('mood-slider')?.addEventListener('input', e => {
    const value = parseInt(e.target.value);
    currentCheckin.mood = value;
    updateMoodDisplay(value);
  });

  // ── Sleep hours ─────────────────────────────────────────────────────────
  document.getElementById('sleep-minus')?.addEventListener('click', () => adjustSleepHours(-0.5));
  document.getElementById('sleep-plus')?.addEventListener('click',  () => adjustSleepHours(0.5));

  // ── Sleep quality buttons ───────────────────────────────────────────────
  document.getElementById('quality-buttons')?.addEventListener('click', e => {
    const btn = e.target.closest('.btn-pill');
    if (btn?.dataset.quality) setSleepQuality(btn.dataset.quality);
  });

  // ── Pain buttons (event delegation per condition row) ───────────────────
  document.querySelectorAll('.condition-check').forEach(check => {
    check.addEventListener('click', e => {
      const btn = e.target.closest('.pain-btn');
      if (btn?.dataset.level) {
        const conditionId = check.dataset.condition;
        const level       = parseInt(btn.dataset.level);
        setConditionPain(conditionId, level, check);
      }
    });
  });

  // ── Cycle day ───────────────────────────────────────────────────────────
  document.getElementById('cycle-day')?.addEventListener('change', e => {
    currentCheckin.cycleDay = e.target.value ? parseInt(e.target.value) : null;
  });

  // ── Notes ───────────────────────────────────────────────────────────────
  document.getElementById('checkin-notes')?.addEventListener('change', e => {
    currentCheckin.notes = e.target.value;
  });

  // ── Submit ──────────────────────────────────────────────────────────────
  document.getElementById('submit-checkin')?.addEventListener('click', submitCheckin);
}

// ── Display update helpers ────────────────────────────────────────────────────

function updateEnergyDisplay(value) {
  const el = document.getElementById('energy-display');
  if (el) el.innerHTML = `${checkinData.getEnergyEmoji(value)} ${checkinData.getEnergyLabel(value)}`;
}

function updateMoodDisplay(value) {
  const el = document.getElementById('mood-display');
  if (el) el.innerHTML = `${checkinData.getMoodEmoji(value)} ${checkinData.getMoodLabel(value)}`;
}

function adjustSleepHours(delta) {
  currentCheckin.sleepHours = Math.max(0, Math.min(14, currentCheckin.sleepHours + delta));
  const el = document.getElementById('sleep-hours-display');
  if (el) el.textContent = currentCheckin.sleepHours;
}

function setSleepQuality(quality) {
  currentCheckin.sleepQuality = quality;
  document.querySelectorAll('#quality-buttons .btn-pill').forEach(btn => {
    const selected = btn.dataset.quality === quality;
    btn.classList.toggle('selected', selected);
    btn.setAttribute('aria-pressed', selected);
  });
}

function setConditionPain(conditionId, level, container) {
  currentCheckin.conditionLevels[conditionId] = level;

  container.querySelectorAll('.pain-btn').forEach(btn => {
    btn.classList.remove('selected', 'low', 'medium', 'high', 'severe');
    btn.setAttribute('aria-pressed', 'false');

    if (parseInt(btn.dataset.level) === level) {
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
      if      (level <= 2) btn.classList.add('low');
      else if (level <= 5) btn.classList.add('medium');
      else if (level <= 7) btn.classList.add('high');
      else                 btn.classList.add('severe');
    }
  });
}

// ── Submit ────────────────────────────────────────────────────────────────────

function submitCheckin() {
  // Capture latest values from DOM
  const notesEl = document.getElementById('checkin-notes');
  if (notesEl) currentCheckin.notes = notesEl.value;

  const cycleEl = document.getElementById('cycle-day');
  if (cycleEl?.value) currentCheckin.cycleDay = parseInt(cycleEl.value);

  // ── Wire pain scores to store ─────────────────────────────────────────
  // This is the critical new step: persisting today's per-condition pain
  // so that getSuitableExercises() can resolve phase-aware contraindications.
  // conditionLevels uses numeric values (1=none, 4=mild, 6=moderate, 9=severe).
  store.updateConditionPainScores({ ...currentCheckin.conditionLevels });
  // ─────────────────────────────────────────────────────────────────────

  // Save the full check-in record
  checkinData.saveCheckin(currentCheckin);

  // Determine workout intensity
  const intensity = checkinData.getSuggestedIntensity(currentCheckin);
  store.set('todayIntensity', intensity);

  // Navigate to today view
  router.navigate('today');
}
