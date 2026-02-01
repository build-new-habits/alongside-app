/**
 * checkin.js - Daily Check-In View
 * The core daily interaction - how are you feeling today?
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
      currentCheckin.conditionLevels[c] = 3; // Default to low pain
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
            oninput="updateEnergy(this.value)"
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
            oninput="updateMood(this.value)"
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
              <button class="btn btn-icon" onclick="adjustSleepHours(-0.5)">−</button>
              <span class="hours-value" id="sleep-hours-display">${currentCheckin.sleepHours}</span>
              <button class="btn btn-icon" onclick="adjustSleepHours(0.5)">+</button>
            </div>
          </div>
          <div class="sleep-quality">
            <label class="input-label">Quality</label>
            <div class="quality-options">
              <button class="btn-pill ${currentCheckin.sleepQuality === 'poor' ? 'selected' : ''}" 
                      onclick="setSleepQuality('poor')">Poor</button>
              <button class="btn-pill ${currentCheckin.sleepQuality === 'okay' ? 'selected' : ''}" 
                      onclick="setSleepQuality('okay')">Okay</button>
              <button class="btn-pill ${currentCheckin.sleepQuality === 'good' ? 'selected' : ''}" 
                      onclick="setSleepQuality('good')">Good</button>
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
              const level = currentCheckin.conditionLevels[conditionId] || 3;
              return `
                <div class="condition-check">
                  <div class="condition-info">
                    <span class="condition-icon">${condition?.icon || '🩹'}</span>
                    <span class="condition-name">${condition?.name || conditionId}</span>
                  </div>
                  <div class="pain-selector">
                    <button class="pain-btn ${level <= 2 ? 'selected low' : ''}" 
                            onclick="setConditionPain('${conditionId}', 1)">
                      Low
                    </button>
                    <button class="pain-btn ${level > 2 && level <= 5 ? 'selected medium' : ''}" 
                            onclick="setConditionPain('${conditionId}', 4)">
                      Medium
                    </button>
                    <button class="pain-btn ${level > 5 && level <= 7 ? 'selected high' : ''}" 
                            onclick="setConditionPain('${conditionId}', 6)">
                      High
                    </button>
                    <button class="pain-btn ${level > 7 ? 'selected severe' : ''}" 
                            onclick="setConditionPain('${conditionId}', 9)">
                      Severe
                    </button>
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
              onchange="setCycleDay(this.value)"
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
          placeholder="Sore from yesterday, feeling anxious, etc..."
          rows="2"
          onchange="currentCheckin.notes = this.value"
        >${currentCheckin.notes}</textarea>
      </div>
      
      <!-- Submit -->
      <div class="checkin-actions">
        <button class="btn btn-primary btn-large btn-full" onclick="submitCheckin()">
          See today's workout options
        </button>
      </div>
    </div>
  `;
}

export function onMount() {
  // Reset current checkin to defaults or previous values
  const existing = checkinData.getTodaysCheckin();
  if (existing) {
    currentCheckin = { ...existing };
  }
}

// ============================================
// UPDATE FUNCTIONS
// ============================================

window.updateEnergy = function(value) {
  currentCheckin.energy = parseInt(value);
  const display = document.getElementById('energy-display');
  if (display) {
    display.innerHTML = `${checkinData.getEnergyEmoji(value)} ${checkinData.getEnergyLabel(value)}`;
  }
  updateSliderTrack('energy-slider', value);
};

window.updateMood = function(value) {
  currentCheckin.mood = parseInt(value);
  const display = document.getElementById('mood-display');
  if (display) {
    display.innerHTML = `${checkinData.getMoodEmoji(value)} ${checkinData.getMoodLabel(value)}`;
  }
  updateSliderTrack('mood-slider', value);
};

window.adjustSleepHours = function(delta) {
  currentCheckin.sleepHours = Math.max(0, Math.min(14, currentCheckin.sleepHours + delta));
  const display = document.getElementById('sleep-hours-display');
  if (display) {
    display.textContent = currentCheckin.sleepHours;
  }
};

window.setSleepQuality = function(quality) {
  currentCheckin.sleepQuality = quality;
  document.querySelectorAll('.quality-options .btn-pill').forEach(btn => {
    btn.classList.remove('selected');
  });
  event.target.classList.add('selected');
};

window.setConditionPain = function(conditionId, level) {
  currentCheckin.conditionLevels[conditionId] = level;
  
  // Update UI - find the condition's pain buttons
  const conditionCheck = event.target.closest('.condition-check');
  if (conditionCheck) {
    conditionCheck.querySelectorAll('.pain-btn').forEach(btn => {
      btn.classList.remove('selected', 'low', 'medium', 'high', 'severe');
    });
    event.target.classList.add('selected');
    if (level <= 2) event.target.classList.add('low');
    else if (level <= 5) event.target.classList.add('medium');
    else if (level <= 7) event.target.classList.add('high');
    else event.target.classList.add('severe');
  }
};

window.setCycleDay = function(value) {
  currentCheckin.cycleDay = value ? parseInt(value) : null;
};

function updateSliderTrack(sliderId, value) {
  const slider = document.getElementById(sliderId);
  if (slider) {
    const percent = ((value - 1) / 9) * 100;
    slider.style.setProperty('--value-percent', `${percent}%`);
  }
}

// ============================================
// SUBMIT
// ============================================

window.submitCheckin = function() {
  // Get notes from textarea
  const notesEl = document.getElementById('checkin-notes');
  if (notesEl) {
    currentCheckin.notes = notesEl.value;
  }
  
  // Save the check-in
  checkinData.saveCheckin(currentCheckin);
  
  // Get suggested intensity
  const intensity = checkinData.getSuggestedIntensity(currentCheckin);
  store.set('todayIntensity', intensity);
  
  // Navigate to today view to show workout options
  router.navigate('today');
};

// Make currentCheckin accessible for notes update
window.currentCheckin = currentCheckin;
