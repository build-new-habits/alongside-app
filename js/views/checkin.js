/**
 * checkin.js - Daily Check-In View
 * The core daily interaction - how are you feeling today?
 * 
 * FIXED: Event handlers now properly attached
 */

import { store } from '../store.js';
import { checkinData } from '../data/checkin.js';
import { CONDITIONS } from '../data/conditions.js';

export const centered = false;

// Temporary state during check-in
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
  const name = store.get('name') || 'there';
  const conditions = store.get('conditions') || [];
  const hormonalTracking = store.get('hormonalTracking');
  const burnout = checkinData.detectBurnout();
  
  // Initialize condition levels
  conditions.forEach(c => {
    if (!currentCheckin.conditionLevels[c]) {
      currentCheckin.conditionLevels[c] = 1; // Default to low pain
    }
  });
  
  return `
    <div class="view checkin-view">
      <div class="view-header">
        <h1>Hey ${name} 👋</h1>
        <p class="text-secondary">Let's see how you're doing today.</p>
      </div>
      
      ${burnout.message ? `
        <div class="card card-warning">
          <div class="warning-content">
            <span class="warning-icon">💛</span>
            <p>${burnout.message}</p>
          </div>
        </div>
      ` : ''}
      
      <!-- Energy Slider -->
      <div class="checkin-section">
        <div class="section-header">
          <h2>Energy Level</h2>
          <span class="section-value" id="energy-display">
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
          >
          <div class="slider-labels">
            <span>Exhausted</span>
            <span>Energised</span>
          </div>
        </div>
      </div>
      
      <!-- Mood Slider -->
      <div class="checkin-section">
        <div class="section-header">
          <h2>Mood</h2>
          <span class="section-value" id="mood-display">
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
          >
          <div class="slider-labels">
            <span>Struggling</span>
            <span>Great</span>
          </div>
        </div>
      </div>
      
      <!-- Sleep -->
      <div class="checkin-section">
        <div class="section-header">
          <h2>Sleep Last Night</h2>
        </div>
        <div class="sleep-inputs">
          <div class="sleep-hours">
            <label class="input-label">Hours</label>
            <div class="hours-adjuster">
              <button type="button" class="btn-icon" id="sleep-minus">−</button>
              <span class="hours-value" id="sleep-hours-display">${currentCheckin.sleepHours}</span>
              <button type="button" class="btn-icon" id="sleep-plus">+</button>
            </div>
          </div>
          <div class="sleep-quality">
            <label class="input-label">Quality</label>
            <div class="quality-options" id="quality-buttons">
              <button type="button" class="btn-pill ${currentCheckin.sleepQuality === 'poor' ? 'selected' : ''}" data-quality="poor">Poor</button>
              <button type="button" class="btn-pill ${currentCheckin.sleepQuality === 'okay' ? 'selected' : ''}" data-quality="okay">Okay</button>
              <button type="button" class="btn-pill ${currentCheckin.sleepQuality === 'good' ? 'selected' : ''}" data-quality="good">Good</button>
            </div>
          </div>
        </div>
      </div>
      
      ${conditions.length > 0 ? `
        <!-- Condition Pain Levels -->
        <div class="checkin-section">
          <div class="section-header">
            <h2>How's the pain today?</h2>
          </div>
          <div class="condition-checks">
            ${conditions.map(conditionId => {
              const condition = CONDITIONS.find(c => c.id === conditionId);
              const level = currentCheckin.conditionLevels[conditionId] || 1;
              return `
                <div class="condition-check" data-condition="${conditionId}">
                  <div class="condition-info">
                    <span class="condition-icon">${condition?.icon || '🩹'}</span>
                    <span class="condition-name">${condition?.name || conditionId}</span>
                  </div>
                  <div class="pain-selector">
                    <button type="button" class="pain-btn ${level <= 2 ? 'selected low' : ''}" data-level="1">Low</button>
                    <button type="button" class="pain-btn ${level > 2 && level <= 5 ? 'selected medium' : ''}" data-level="4">Medium</button>
                    <button type="button" class="pain-btn ${level > 5 && level <= 7 ? 'selected high' : ''}" data-level="6">High</button>
                    <button type="button" class="pain-btn ${level > 7 ? 'selected severe' : ''}" data-level="9">Severe</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
      
      ${hormonalTracking ? `
        <!-- Cycle Tracking -->
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
            >
            <p class="text-sm text-muted">Day 1 = first day of period</p>
          </div>
        </div>
      ` : ''}
      
      <!-- Notes (optional) -->
      <div class="checkin-section">
        <div class="section-header">
          <h2>Anything else?</h2>
          <span class="text-muted">(optional)</span>
        </div>
        <textarea 
          id="checkin-notes"
          class="input-field notes-input"
          placeholder="Sore from yesterday, feeling anxious, big day ahead..."
          rows="3"
        >${currentCheckin.notes}</textarea>
      </div>
      
      <!-- Submit -->
      <div class="checkin-actions">
        <button type="button" class="btn btn-primary btn-large btn-full" id="submit-checkin">
          See today's workout options
        </button>
      </div>
    </div>
  `;
}

export function onMount() {
  // Load existing check-in if available
  const existing = checkinData.getTodaysCheckin();
  if (existing) {
    currentCheckin = { ...currentCheckin, ...existing };
    // Update displays
    updateEnergyDisplay(currentCheckin.energy);
    updateMoodDisplay(currentCheckin.mood);
  }
  
  // ============================================
  // ATTACH EVENT LISTENERS PROPERLY
  // ============================================
  
  // Energy slider
  const energySlider = document.getElementById('energy-slider');
  if (energySlider) {
    energySlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      currentCheckin.energy = value;
      updateEnergyDisplay(value);
    });
  }
  
  // Mood slider
  const moodSlider = document.getElementById('mood-slider');
  if (moodSlider) {
    moodSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      currentCheckin.mood = value;
      updateMoodDisplay(value);
    });
  }
  
  // Sleep hours buttons
  const sleepMinus = document.getElementById('sleep-minus');
  const sleepPlus = document.getElementById('sleep-plus');
  
  if (sleepMinus) {
    sleepMinus.addEventListener('click', () => adjustSleepHours(-0.5));
  }
  if (sleepPlus) {
    sleepPlus.addEventListener('click', () => adjustSleepHours(0.5));
  }
  
  // Sleep quality buttons
  const qualityButtons = document.getElementById('quality-buttons');
  if (qualityButtons) {
    qualityButtons.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-pill');
      if (btn && btn.dataset.quality) {
        setSleepQuality(btn.dataset.quality);
      }
    });
  }
  
  // Pain level buttons (using event delegation)
  const conditionChecks = document.querySelectorAll('.condition-check');
  conditionChecks.forEach(check => {
    check.addEventListener('click', (e) => {
      const btn = e.target.closest('.pain-btn');
      if (btn && btn.dataset.level) {
        const conditionId = check.dataset.condition;
        const level = parseInt(btn.dataset.level);
        setConditionPain(conditionId, level, check);
      }
    });
  });
  
  // Cycle day input
  const cycleInput = document.getElementById('cycle-day');
  if (cycleInput) {
    cycleInput.addEventListener('change', (e) => {
      currentCheckin.cycleDay = e.target.value ? parseInt(e.target.value) : null;
    });
  }
  
  // Notes textarea
  const notesInput = document.getElementById('checkin-notes');
  if (notesInput) {
    notesInput.addEventListener('change', (e) => {
      currentCheckin.notes = e.target.value;
    });
  }
  
  // Submit button
  const submitBtn = document.getElementById('submit-checkin');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitCheckin);
  }
}

// ============================================
// UPDATE FUNCTIONS
// ============================================

function updateEnergyDisplay(value) {
  const display = document.getElementById('energy-display');
  if (display) {
    display.innerHTML = `${checkinData.getEnergyEmoji(value)} ${checkinData.getEnergyLabel(value)}`;
  }
}

function updateMoodDisplay(value) {
  const display = document.getElementById('mood-display');
  if (display) {
    display.innerHTML = `${checkinData.getMoodEmoji(value)} ${checkinData.getMoodLabel(value)}`;
  }
}

function adjustSleepHours(delta) {
  currentCheckin.sleepHours = Math.max(0, Math.min(14, currentCheckin.sleepHours + delta));
  const display = document.getElementById('sleep-hours-display');
  if (display) {
    display.textContent = currentCheckin.sleepHours;
  }
}

function setSleepQuality(quality) {
  currentCheckin.sleepQuality = quality;
  
  // Update button states
  const buttons = document.querySelectorAll('#quality-buttons .btn-pill');
  buttons.forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.quality === quality);
  });
}

function setConditionPain(conditionId, level, container) {
  currentCheckin.conditionLevels[conditionId] = level;
  
  // Update button states within this condition
  const buttons = container.querySelectorAll('.pain-btn');
  buttons.forEach(btn => {
    btn.classList.remove('selected', 'low', 'medium', 'high', 'severe');
    
    const btnLevel = parseInt(btn.dataset.level);
    if (btnLevel === level) {
      btn.classList.add('selected');
      if (level <= 2) btn.classList.add('low');
      else if (level <= 5) btn.classList.add('medium');
      else if (level <= 7) btn.classList.add('high');
      else btn.classList.add('severe');
    }
  });
}

function submitCheckin() {
  // Get notes from textarea
  const notesEl = document.getElementById('checkin-notes');
  if (notesEl) {
    currentCheckin.notes = notesEl.value;
  }
  
  // Get cycle day
  const cycleEl = document.getElementById('cycle-day');
  if (cycleEl && cycleEl.value) {
    currentCheckin.cycleDay = parseInt(cycleEl.value);
  }
  
  // Save the check-in
  checkinData.saveCheckin(currentCheckin);
  
  // Get suggested intensity
  const intensity = checkinData.getSuggestedIntensity(currentCheckin);
  store.set('todayIntensity', intensity);
  
  // Navigate to today view to show workout options
  router.navigate('today');
}
