/**
 * app.js - Main Application Controller
 * Alongside - Compassionate fitness coaching
 * Enhanced Onboarding Version
 */

const App = {
  
  // ========================================
  // STATE
  // ========================================
  
  currentView: null,
  user: null,
  
  // Temporary storage during onboarding
  onboardingData: {
    name: '',
    age: null,
    gender: null,
    hormonalTracking: false,
    weight: null,
    weightUnit: 'kg',
    targetWeight: null,
    targetDate: null,
    targetDescription: '',
    goals: [],
    conditions: [],
    lifestyle: {
      activityLevel: null,
      stressLevel: null,
      sleepQuality: null
    },
    equipment: []
  },
  
  // ========================================
  // DATA OPTIONS
  // ========================================
  
  GOALS: [
    { id: 'lose-weight', name: 'Lose weight', icon: '⚖️', category: 'body' },
    { id: 'build-strength', name: 'Build strength', icon: '💪', category: 'fitness' },
    { id: 'improve-cardio', name: 'Improve cardio fitness', icon: '❤️', category: 'fitness' },
    { id: 'build-muscle', name: 'Build muscle', icon: '🏋️', category: 'body' },
    { id: 'improve-flexibility', name: 'Improve flexibility', icon: '🧘', category: 'mobility' },
    { id: 'reduce-pain', name: 'Reduce pain / manage injury', icon: '🩹', category: 'recovery' },
    { id: 'more-energy', name: 'Have more energy', icon: '⚡', category: 'wellbeing' },
    { id: 'reduce-stress', name: 'Reduce stress', icon: '😌', category: 'wellbeing' },
    { id: 'sleep-better', name: 'Sleep better', icon: '😴', category: 'wellbeing' },
    { id: 'build-habit', name: 'Build a consistent routine', icon: '📅', category: 'habit' },
    { id: 'run-5k', name: 'Run a 5K', icon: '🏃', category: 'cardio' },
    { id: 'feel-better', name: 'Just feel better in my body', icon: '✨', category: 'wellbeing' }
  ],
  
  CONDITIONS: [
    { id: 'lower-back', name: 'Lower Back', icon: '🔙', area: 'back' },
    { id: 'upper-back', name: 'Upper Back / Neck', icon: '🔙', area: 'back' },
    { id: 'shoulder', name: 'Shoulder', icon: '💪', area: 'upper' },
    { id: 'hip', name: 'Hip', icon: '🦴', area: 'lower' },
    { id: 'knee', name: 'Knee', icon: '🦵', area: 'lower' },
    { id: 'ankle-foot', name: 'Ankle / Foot', icon: '🦶', area: 'lower' },
    { id: 'wrist-elbow', name: 'Wrist / Elbow', icon: '✋', area: 'upper' },
    { id: 'chronic-fatigue', name: 'Chronic fatigue', icon: '😴', area: 'general' },
    { id: 'anxiety', name: 'Anxiety / stress sensitivity', icon: '😰', area: 'general' },
    { id: 'breathing', name: 'Breathing / asthma', icon: '🌬️', area: 'general' },
    { id: 'perimenopause', name: 'Perimenopause symptoms', icon: '🌙', area: 'hormonal' },
    { id: 'menopause', name: 'Menopause symptoms', icon: '🌙', area: 'hormonal' }
  ],
  
  EQUIPMENT_CATEGORIES: [
    {
      id: 'weights',
      name: 'Free Weights',
      icon: '🏋️',
      items: [
        { id: 'dumbbells-light', name: 'Light dumbbells (1-5kg)' },
        { id: 'dumbbells-medium', name: 'Medium dumbbells (6-12kg)' },
        { id: 'dumbbells-heavy', name: 'Heavy dumbbells (13kg+)' },
        { id: 'kettlebell-light', name: 'Light kettlebell (4-8kg)' },
        { id: 'kettlebell-medium', name: 'Medium kettlebell (10-16kg)' },
        { id: 'kettlebell-heavy', name: 'Heavy kettlebell (18kg+)' },
        { id: 'barbell', name: 'Barbell + plates' }
      ]
    },
    {
      id: 'bands',
      name: 'Resistance Bands',
      icon: '🎗️',
      items: [
        { id: 'band-light', name: 'Light resistance band' },
        { id: 'band-medium', name: 'Medium resistance band' },
        { id: 'band-heavy', name: 'Heavy resistance band' },
        { id: 'mini-bands', name: 'Mini/loop bands' }
      ]
    },
    {
      id: 'cardio',
      name: 'Cardio Equipment',
      icon: '🚴',
      items: [
        { id: 'treadmill', name: 'Treadmill' },
        { id: 'exercise-bike', name: 'Exercise bike' },
        { id: 'rowing-machine', name: 'Rowing machine' },
        { id: 'skipping-rope', name: 'Skipping rope' }
      ]
    },
    {
      id: 'home',
      name: 'Home Basics',
      icon: '🏠',
      items: [
        { id: 'yoga-mat', name: 'Yoga/exercise mat' },
        { id: 'foam-roller', name: 'Foam roller' },
        { id: 'pull-up-bar', name: 'Pull-up bar' },
        { id: 'stability-ball', name: 'Stability/Swiss ball' },
        { id: 'bench', name: 'Workout bench' }
      ]
    },
    {
      id: 'recovery',
      name: 'Recovery Tools',
      icon: '💆',
      items: [
        { id: 'massage-gun', name: 'Massage gun' },
        { id: 'lacrosse-ball', name: 'Lacrosse/massage ball' },
        { id: 'stretching-strap', name: 'Stretching strap' }
      ]
    }
  ],
  
  // ========================================
  // INITIALISATION
  // ========================================
  
  init() {
    console.log('🌿 Alongside starting...');
    
    this.user = this.loadUser();
    
    setTimeout(() => {
      this.hideLoading();
      
      if (!this.user || !this.user.onboardingComplete) {
        this.navigate('onboarding-welcome');
      } else {
        this.navigate('today');
      }
    }, 2000);
    
    this.setupNavigation();
    console.log('🌿 Alongside ready');
  },
  
  // ========================================
  // NAVIGATION
  // ========================================
  
  navigate(viewName) {
    console.log(`Navigating to: ${viewName}`);
    
    const mainContent = document.getElementById('main-content');
    const bottomNav = document.getElementById('bottom-nav');
    
    mainContent.innerHTML = '';
    mainContent.className = 'main-content';
    
    // Hide nav during onboarding
    if (viewName.startsWith('onboarding')) {
      bottomNav.classList.add('hidden');
    }
    
    switch (viewName) {
      // Onboarding screens
      case 'onboarding-welcome':
        mainContent.classList.add('centered');
        mainContent.innerHTML = this.renderOnboardingWelcome();
        break;
      case 'onboarding-name':
        mainContent.innerHTML = this.renderOnboardingName();
        this.focusInput('user-name');
        break;
      case 'onboarding-about':
        mainContent.innerHTML = this.renderOnboardingAbout();
        break;
      case 'onboarding-body':
        mainContent.innerHTML = this.renderOnboardingBody();
        break;
      case 'onboarding-goals':
        mainContent.innerHTML = this.renderOnboardingGoals();
        break;
      case 'onboarding-conditions':
        mainContent.innerHTML = this.renderOnboardingConditions();
        break;
      case 'onboarding-lifestyle':
        mainContent.innerHTML = this.renderOnboardingLifestyle();
        break;
      case 'onboarding-equipment':
        mainContent.innerHTML = this.renderOnboardingEquipment();
        break;
      case 'onboarding-complete':
        mainContent.classList.add('centered');
        mainContent.innerHTML = this.renderOnboardingComplete();
        break;
        
      // Main app screens
      case 'today':
        mainContent.innerHTML = this.renderToday();
        bottomNav.classList.remove('hidden');
        this.setActiveNav('today');
        break;
      case 'progress':
        mainContent.innerHTML = this.renderProgress();
        bottomNav.classList.remove('hidden');
        this.setActiveNav('progress');
        break;
      case 'settings':
        mainContent.innerHTML = this.renderSettings();
        bottomNav.classList.remove('hidden');
        this.setActiveNav('settings');
        break;
        
      default:
        this.navigate('onboarding-welcome');
    }
    
    this.currentView = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  
  hideLoading() {
    const loading = document.getElementById('loading');
    loading.style.opacity = '0';
    loading.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => loading.classList.add('hidden'), 300);
  },
  
  focusInput(id) {
    setTimeout(() => {
      const input = document.getElementById(id);
      if (input) input.focus();
    }, 100);
  },
  
  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => this.navigate(item.dataset.view));
    });
  },
  
  setActiveNav(viewName) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });
  },
  
  // ========================================
  // ONBOARDING SCREENS
  // ========================================
  
  renderOnboardingWelcome() {
    return `
      <div class="onboarding-view">
        <div class="onboarding-content">
          <div class="coach-greeting">
            <div class="coach-avatar">
              <img src="assets/images/logo-icon-small.png" alt="Coach" width="80" height="80">
            </div>
            <h1>Welcome to Alongside</h1>
            <p class="lead">I'm here to help you build movement habits that actually stick.</p>
          </div>
          
          <div class="welcome-message card card-coach">
            <p>No streaks. No shame. No "no pain, no gain."</p>
            <p>Just movement that adapts to your energy, your body, and your life.</p>
          </div>
          
          <div class="onboarding-features">
            <div class="feature">
              <span class="feature-icon">🎯</span>
              <span class="feature-text">Workouts that fit your actual schedule</span>
            </div>
            <div class="feature">
              <span class="feature-icon">💚</span>
              <span class="feature-text">Adapts when energy is low</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🛡️</span>
              <span class="feature-text">Respects injuries and conditions</span>
            </div>
          </div>
        </div>
        
        <div class="onboarding-actions">
          <button class="btn btn-primary btn-large btn-full" onclick="App.navigate('onboarding-name')">
            Let's get started
          </button>
          <p class="text-sm text-secondary text-center" style="margin-top: var(--space-4);">
            Takes about 3-4 minutes
          </p>
        </div>
      </div>
    `;
  },
  
  renderOnboardingName() {
    return `
      <div class="onboarding-view">
        <div class="onboarding-header">
          <button class="btn btn-ghost" onclick="App.navigate('onboarding-welcome')">← Back</button>
          <div class="progress-dots">
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
        
        <div class="onboarding-content">
          <h1>What should I call you?</h1>
          <p class="text-secondary">Just your first name is fine.</p>
          
          <div class="input-group">
            <input 
              type="text" 
              id="user-name" 
              class="input-field"
              placeholder="Your name"
              autocomplete="given-name"
              value="${this.onboardingData.name}"
              onkeypress="if(event.key === 'Enter') App.saveName()"
            >
          </div>
        </div>
        
        <div class="onboarding-actions">
          <button class="btn btn-primary btn-large btn-full" onclick="App.saveName()">
            Continue
          </button>
        </div>
      </div>
    `;
  },
  
  renderOnboardingAbout() {
    const genderOptions = [
      { id: 'female', label: 'Female' },
      { id: 'male', label: 'Male' },
      { id: 'non-binary', label: 'Non-binary' },
      { id: 'prefer-not', label: 'Prefer not to say' }
    ];
    
    const showHormonalOption = ['female', 'non-binary'].includes(this.onboardingData.gender);
    
    return `
      <div class="onboarding-view">
        <div class="onboarding-header">
          <button class="btn btn-ghost" onclick="App.navigate('onboarding-name')">← Back</button>
          <div class="progress-dots">
            <span class="dot completed"></span>
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
        
        <div class="onboarding-content">
          <h1>A bit about you, ${this.onboardingData.name}</h1>
          <p class="text-secondary">This helps me personalise your experience.</p>
          
          <div class="form-section">
            <label class="form-label">Your age</label>
            <input 
              type="number" 
              id="user-age" 
              class="input-field"
              placeholder="e.g. 42"
              min="16"
              max="100"
              value="${this.onboardingData.age || ''}"
              onchange="App.onboardingData.age = parseInt(this.value)"
            >
          </div>
          
          <div class="form-section">
            <label class="form-label">Gender</label>
            <div class="radio-group">
              ${genderOptions.map(opt => `
                <button class="btn-card radio-option ${this.onboardingData.gender === opt.id ? 'selected' : ''}"
                        onclick="App.setGender('${opt.id}')">
                  ${opt.label}
                </button>
              `).join('')}
            </div>
          </div>
          
          <div id="hormonal-option" class="form-section ${showHormonalOption ? '' : 'hidden'}">
            <label class="form-label">Would you like cycle-aware recommendations?</label>
            <p class="text-sm text-muted" style="margin-bottom: var(--space-3);">
              This helps me adapt workouts to your energy patterns throughout the month.
            </p>
            <div class="radio-group">
              <button class="btn-card radio-option ${this.onboardingData.hormonalTracking === true ? 'selected' : ''}"
                      onclick="App.setHormonalTracking(true)">
                Yes, that would help
              </button>
              <button class="btn-card radio-option ${this.onboardingData.hormonalTracking === false ? 'selected' : ''}"
                      onclick="App.setHormonalTracking(false)">
                No thanks
              </button>
            </div>
          </div>
        </div>
        
        <div class="onboarding-actions">
          <button class="btn btn-primary btn-large btn-full" onclick="App.saveAbout()">
            Continue
          </button>
        </div>
      </div>
    `;
  },
  
  renderOnboardingBody() {
    const hasWeightGoal = this.onboardingData.goals.includes('lose-weight');
    
    return `
      <div class="onboarding-view">
        <div class="onboarding-header">
          <button class="btn btn-ghost" onclick="App.navigate('onboarding-about')">← Back</button>
          <div class="progress-dots">
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
        
        <div class="onboarding-content">
          <h1>Your body & targets</h1>
          <p class="text-secondary">Optional, but helps me track your progress.</p>
          
          <div class="form-section">
            <label class="form-label">Current weight</label>
            <div class="input-with-unit">
              <input 
                type="number" 
                id="user-weight" 
                class="input-field"
                placeholder="e.g. 75"
                min="30"
                max="300"
                step="0.1"
                value="${this.onboardingData.weight || ''}"
                onchange="App.onboardingData.weight = parseFloat(this.value)"
              >
              <select id="weight-unit" class="unit-select" onchange="App.onboardingData.weightUnit = this.value">
                <option value="kg" ${this.onboardingData.weightUnit === 'kg' ? 'selected' : ''}>kg</option>
                <option value="lbs" ${this.onboardingData.weightUnit === 'lbs' ? 'selected' : ''}>lbs</option>
              </select>
            </div>
          </div>
          
          <div class="form-section">
            <label class="form-label">Target weight <span class="text-muted">(optional)</span></label>
            <div class="input-with-unit">
              <input 
                type="number" 
                id="user-target-weight" 
                class="input-field"
                placeholder="e.g. 70"
                min="30"
                max="300"
                step="0.1"
                value="${this.onboardingData.targetWeight || ''}"
                onchange="App.onboardingData.targetWeight = parseFloat(this.value)"
              >
              <span class="unit-display">${this.onboardingData.weightUnit}</span>
            </div>
          </div>
          
          <div class="form-section">
            <label class="form-label">Got a target date or event? <span class="text-muted">(optional)</span></label>
            <input 
              type="text" 
              id="target-description" 
              class="input-field"
              placeholder="e.g. Holiday in April, Wedding in June"
              value="${this.onboardingData.targetDescription || ''}"
              onchange="App.onboardingData.targetDescription = this.value"
            >
            <input 
              type="date" 
              id="target-date" 
              class="input-field"
              style="margin-top: var(--space-2);"
              value="${this.onboardingData.targetDate || ''}"
              onchange="App.onboardingData.targetDate = this.value"
              min="${new Date().toISOString().split('T')[0]}"
            >
          </div>
        </div>
        
        <div class="onboarding-actions">
          <button class="btn btn-primary btn-large btn-full" onclick="App.saveBody()">
            Continue
          </button>
          <button class="btn btn-ghost btn-full" onclick="App.saveBody()" style="margin-top: var(--space-2);">
            Skip for now
          </button>
        </div>
      </div>
    `;
  },
  
  renderOnboardingGoals() {
    const goalsHtml = this.GOALS.map(goal => `
      <button class="btn-card goal-option ${this.onboardingData.goals.includes(goal.id) ? 'selected' : ''}" 
              data-goal="${goal.id}" 
              onclick="App.toggleGoal('${goal.id}')">
        <span class="goal-icon">${goal.icon}</span>
        <span class="goal-text">${goal.name}</span>
      </button>
    `).join('');
    
    return `
      <div class="onboarding-view">
        <div class="onboarding-header">
          <button class="btn btn-ghost" onclick="App.navigate('onboarding-body')">← Back</button>
          <div class="progress-dots">
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
        
        <div class="onboarding-content">
          <h1>What brings you here?</h1>
          <p class="text-secondary">Select all that apply. You can change these anytime.</p>
          
          <div class="goals-grid">
            ${goalsHtml}
          </div>
        </div>
        
        <div class="onboarding-actions">
          <button class="btn btn-primary btn-large btn-full" 
                  onclick="App.saveGoals()" 
                  id="goals-continue-btn"
                  ${this.onboardingData.goals.length === 0 ? 'disabled' : ''}>
            Continue
          </button>
          <p class="text-sm text-secondary text-center" style="margin-top: var(--space-3);">
            ${this.onboardingData.goals.length} selected
          </p>
        </div>
      </div>
    `;
  },
  
  renderOnboardingConditions() {
    const conditionsHtml = this.CONDITIONS.map(condition => `
      <button class="btn-card condition-option ${this.onboardingData.conditions.includes(condition.id) ? 'selected' : ''}" 
              data-condition="${condition.id}" 
              onclick="App.toggleCondition('${condition.id}')">
        <span class="condition-icon">${condition.icon}</span>
        <span class="condition-text">${condition.name}</span>
      </button>
    `).join('');
    
    return `
      <div class="onboarding-view">
        <div class="onboarding-header">
          <button class="btn btn-ghost" onclick="App.navigate('onboarding-goals')">← Back</button>
          <div class="progress-dots">
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
        
        <div class="onboarding-content">
          <h1>Anything I should know about?</h1>
          <p class="text-secondary">I'll adapt exercises to protect these areas.</p>
          
          <div class="conditions-grid">
            ${conditionsHtml}
          </div>
          
          <p class="text-sm text-muted" style="margin-top: var(--space-4);">
            💡 It's okay to skip this - you can add conditions later in Settings.
          </p>
        </div>
        
        <div class="onboarding-actions">
          <button class="btn btn-primary btn-large btn-full" onclick="App.saveConditions()">
            ${this.onboardingData.conditions.length > 0 ? 'Continue' : 'Skip for now'}
          </button>
        </div>
      </div>
    `;
  },
  
  renderOnboardingLifestyle() {
    const activityLevels = [
      { id: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise, desk job' },
      { id: 'light', label: 'Lightly active', desc: 'Light exercise 1-2 days/week' },
      { id: 'moderate', label: 'Moderately active', desc: 'Exercise 3-4 days/week' },
      { id: 'active', label: 'Very active', desc: 'Hard exercise 5-6 days/week' }
    ];
    
    const stressLevels = [
      { id: 'low', label: 'Low', desc: 'Life feels pretty manageable' },
      { id: 'moderate', label: 'Moderate', desc: 'Some stress but coping okay' },
      { id: 'high', label: 'High', desc: 'Feeling quite stressed regularly' }
    ];
    
    const sleepQualities = [
      { id: 'good', label: 'Good', desc: 'Usually sleep well' },
      { id: 'okay', label: 'Okay', desc: 'Some good nights, some bad' },
      { id: 'poor', label: 'Poor', desc: 'Often struggle with sleep' }
    ];
    
    return `
      <div class="onboarding-view">
        <div class="onboarding-header">
          <button class="btn btn-ghost" onclick="App.navigate('onboarding-conditions')">← Back</button>
          <div class="progress-dots">
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot active"></span>
            <span class="dot"></span>
          </div>
        </div>
        
        <div class="onboarding-content">
          <h1>Your lifestyle</h1>
          <p class="text-secondary">This helps me match workouts to your energy.</p>
          
          <div class="form-section">
            <label class="form-label">Current activity level</label>
            <div class="radio-group stacked">
              ${activityLevels.map(level => `
                <button class="btn-card radio-option ${this.onboardingData.lifestyle.activityLevel === level.id ? 'selected' : ''}"
                        onclick="App.setLifestyle('activityLevel', '${level.id}')">
                  <span class="option-label">${level.label}</span>
                  <span class="option-desc">${level.desc}</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <div class="form-section">
            <label class="form-label">Stress level lately</label>
            <div class="radio-group horizontal">
              ${stressLevels.map(level => `
                <button class="btn-card radio-option compact ${this.onboardingData.lifestyle.stressLevel === level.id ? 'selected' : ''}"
                        onclick="App.setLifestyle('stressLevel', '${level.id}')">
                  ${level.label}
                </button>
              `).join('')}
            </div>
          </div>
          
          <div class="form-section">
            <label class="form-label">Sleep quality</label>
            <div class="radio-group horizontal">
              ${sleepQualities.map(level => `
                <button class="btn-card radio-option compact ${this.onboardingData.lifestyle.sleepQuality === level.id ? 'selected' : ''}"
                        onclick="App.setLifestyle('sleepQuality', '${level.id}')">
                  ${level.label}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
        
        <div class="onboarding-actions">
          <button class="btn btn-primary btn-large btn-full" onclick="App.saveLifestyle()">
            Continue
          </button>
        </div>
      </div>
    `;
  },
  
  renderOnboardingEquipment() {
    return `
      <div class="onboarding-view">
        <div class="onboarding-header">
          <button class="btn btn-ghost" onclick="App.navigate('onboarding-lifestyle')">← Back</button>
          <div class="progress-dots">
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot active"></span>
          </div>
        </div>
        
        <div class="onboarding-content">
          <h1>What equipment do you have?</h1>
          <p class="text-secondary">I'll only suggest exercises you can actually do.</p>
          
          <div class="equipment-categories">
            ${this.EQUIPMENT_CATEGORIES.map(cat => `
              <div class="equipment-category">
                <button class="category-header" onclick="App.toggleEquipmentCategory('${cat.id}')">
                  <span class="category-icon">${cat.icon}</span>
                  <span class="category-name">${cat.name}</span>
                  <span class="category-count">${this.countEquipmentInCategory(cat.id)}</span>
                  <span class="category-chevron">▼</span>
                </button>
                <div class="category-items" id="category-${cat.id}">
                  ${cat.items.map(item => `
                    <button class="equipment-item ${this.onboardingData.equipment.includes(item.id) ? 'selected' : ''}"
                            onclick="App.toggleEquipmentItem('${item.id}')">
                      <span class="item-check">${this.onboardingData.equipment.includes(item.id) ? '✓' : ''}</span>
                      <span class="item-name">${item.name}</span>
                    </button>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="bodyweight-option">
            <button class="btn-card ${this.onboardingData.equipment.length === 0 ? 'selected' : ''}"
                    onclick="App.setBodyweightOnly()">
              <span class="goal-icon">🏠</span>
              <span class="goal-text">Just bodyweight - no equipment</span>
            </button>
          </div>
        </div>
        
        <div class="onboarding-actions">
          <button class="btn btn-primary btn-large btn-full" onclick="App.saveEquipment()">
            Finish setup
          </button>
          <p class="text-sm text-secondary text-center" style="margin-top: var(--space-3);">
            ${this.onboardingData.equipment.length} items selected
          </p>
        </div>
      </div>
    `;
  },
  
  renderOnboardingComplete() {
    const targetText = this.user.targetDescription 
      ? `${this.user.targetDescription}${this.user.targetDate ? ` (${this.formatDate(this.user.targetDate)})` : ''}`
      : this.user.targetWeight 
        ? `Reach ${this.user.targetWeight}${this.user.weightUnit}${this.user.targetDate ? ` by ${this.formatDate(this.user.targetDate)}` : ''}`
        : 'No specific target set';
    
    return `
      <div class="onboarding-view">
        <div class="onboarding-content">
          <div class="coach-greeting">
            <div class="completion-icon">🎉</div>
            <h1>You're all set, ${this.user.name}!</h1>
            <p class="lead">I've got everything I need to start helping you.</p>
          </div>
          
          <div class="welcome-message card card-coach">
            <p>Each day, I'll check in with you and suggest movement that matches how you're feeling.</p>
            <p>No pressure. No judgment. Just support.</p>
          </div>
          
          <div class="summary-card card">
            <h3>Your profile</h3>
            <div class="summary-row">
              <span class="summary-label">Age:</span>
              <span class="summary-value">${this.user.age || 'Not set'}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Current weight:</span>
              <span class="summary-value">${this.user.weight ? this.user.weight + this.user.weightUnit : 'Not set'}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Target:</span>
              <span class="summary-value">${targetText}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Goals:</span>
              <span class="summary-value">${this.user.goals.map(g => this.GOALS.find(x => x.id === g)?.name).join(', ') || 'None'}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Equipment:</span>
              <span class="summary-value">${this.user.equipment.length > 0 ? this.user.equipment.length + ' items' : 'Bodyweight only'}</span>
            </div>
          </div>
        </div>
        
        <div class="onboarding-actions">
          <button class="btn btn-primary btn-large btn-full" onclick="App.startApp()">
            Let's go!
          </button>
        </div>
      </div>
    `;
  },
  
  // ========================================
  // MAIN APP SCREENS (Placeholders)
  // ========================================
  
  renderToday() {
    const greeting = this.getTimeGreeting();
    
    return `
      <div class="view">
        <div class="view-header">
          <h1>${greeting}, ${this.user?.name || 'there'} 👋</h1>
          <p class="text-secondary">Let's check in and see what feels right today.</p>
        </div>
        
        <div class="card card-coach">
          <p><strong>Daily check-in coming soon!</strong></p>
          <p class="text-secondary">This is where you'll tell me how you're feeling, and I'll suggest workouts that match your energy.</p>
        </div>
        
        <div class="card" style="margin-top: var(--space-4);">
          <h3>Your profile summary</h3>
          <p class="text-sm text-secondary">Age: ${this.user?.age || 'Not set'}</p>
          <p class="text-sm text-secondary">Weight: ${this.user?.weight ? this.user.weight + this.user.weightUnit : 'Not set'}</p>
          <p class="text-sm text-secondary">Goals: ${this.user?.goals?.length || 0} selected</p>
          <p class="text-sm text-secondary">Conditions: ${this.user?.conditions?.length || 0} tracked</p>
          <p class="text-sm text-secondary">Equipment: ${this.user?.equipment?.length || 0} items</p>
        </div>
      </div>
    `;
  },
  
  renderProgress() {
    return `
      <div class="view">
        <div class="view-header">
          <h1>Your Progress</h1>
          <p class="text-secondary">Coming soon...</p>
        </div>
        <div class="card">
          <p class="text-secondary">Progress tracking will appear here once you start working out.</p>
        </div>
      </div>
    `;
  },
  
  renderSettings() {
    return `
      <div class="view">
        <div class="view-header">
          <h1>Settings</h1>
        </div>
        
        <div class="card-list">
          <div class="card">
            <h3>Profile</h3>
            <p class="text-secondary">Name: ${this.user?.name || 'Not set'}</p>
            <p class="text-secondary">Age: ${this.user?.age || 'Not set'}</p>
            <p class="text-secondary">Gender: ${this.user?.gender || 'Not set'}</p>
            <p class="text-secondary">Weight: ${this.user?.weight ? this.user.weight + this.user.weightUnit : 'Not set'}</p>
          </div>
          
          <div class="card">
            <h3>Goals</h3>
            <p class="text-secondary">${this.user?.goals?.map(g => this.GOALS.find(x => x.id === g)?.name).join(', ') || 'None set'}</p>
          </div>
          
          <div class="card">
            <h3>Conditions</h3>
            <p class="text-secondary">${this.user?.conditions?.map(c => this.CONDITIONS.find(x => x.id === c)?.name).join(', ') || 'None'}</p>
          </div>
          
          <div class="card">
            <h3>Equipment</h3>
            <p class="text-secondary">${this.user?.equipment?.length > 0 ? this.user.equipment.length + ' items' : 'Bodyweight only'}</p>
          </div>
          
          <button class="btn btn-danger btn-full" onclick="App.resetApp()" style="margin-top: var(--space-4);">
            Reset App (Start Over)
          </button>
        </div>
      </div>
    `;
  },
  
  // ========================================
  // ONBOARDING ACTIONS
  // ========================================
  
  saveName() {
    const input = document.getElementById('user-name');
    const name = input.value.trim();
    if (!name) { input.focus(); return; }
    this.onboardingData.name = name;
    this.navigate('onboarding-about');
  },
  
  setGender(gender) {
    this.onboardingData.gender = gender;
    // Re-render to show/hide hormonal option
    this.navigate('onboarding-about');
  },
  
  setHormonalTracking(value) {
    this.onboardingData.hormonalTracking = value;
    // Update UI
    document.querySelectorAll('#hormonal-option .radio-option').forEach(btn => {
      btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
  },
  
  saveAbout() {
    const age = document.getElementById('user-age').value;
    this.onboardingData.age = age ? parseInt(age) : null;
    this.navigate('onboarding-body');
  },
  
  saveBody() {
    // Values already saved via onchange
    this.navigate('onboarding-goals');
  },
  
  toggleGoal(goalId) {
    const index = this.onboardingData.goals.indexOf(goalId);
    if (index > -1) {
      this.onboardingData.goals.splice(index, 1);
    } else {
      this.onboardingData.goals.push(goalId);
    }
    
    // Update UI
    const btn = document.querySelector(`[data-goal="${goalId}"]`);
    if (btn) btn.classList.toggle('selected');
    
    const continueBtn = document.getElementById('goals-continue-btn');
    if (continueBtn) continueBtn.disabled = this.onboardingData.goals.length === 0;
    
    const countText = document.querySelector('.onboarding-actions .text-secondary');
    if (countText) countText.textContent = `${this.onboardingData.goals.length} selected`;
  },
  
  saveGoals() {
    if (this.onboardingData.goals.length === 0) return;
    this.navigate('onboarding-conditions');
  },
  
  toggleCondition(conditionId) {
    const index = this.onboardingData.conditions.indexOf(conditionId);
    if (index > -1) {
      this.onboardingData.conditions.splice(index, 1);
    } else {
      this.onboardingData.conditions.push(conditionId);
    }
    
    const btn = document.querySelector(`[data-condition="${conditionId}"]`);
    if (btn) btn.classList.toggle('selected');
    
    const continueBtn = document.querySelector('.onboarding-actions .btn-primary');
    if (continueBtn) {
      continueBtn.textContent = this.onboardingData.conditions.length > 0 ? 'Continue' : 'Skip for now';
    }
  },
  
  saveConditions() {
    this.navigate('onboarding-lifestyle');
  },
  
  setLifestyle(field, value) {
    this.onboardingData.lifestyle[field] = value;
    // Update UI - re-render section
    const section = event.target.closest('.form-section');
    section.querySelectorAll('.radio-option').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
  },
  
  saveLifestyle() {
    this.navigate('onboarding-equipment');
  },
  
  toggleEquipmentCategory(categoryId) {
    const items = document.getElementById(`category-${categoryId}`);
    if (items) {
      items.classList.toggle('expanded');
      const header = items.previousElementSibling;
      header.classList.toggle('expanded');
    }
  },
  
  countEquipmentInCategory(categoryId) {
    const category = this.EQUIPMENT_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return 0;
    return category.items.filter(item => this.onboardingData.equipment.includes(item.id)).length;
  },
  
  toggleEquipmentItem(itemId) {
    const index = this.onboardingData.equipment.indexOf(itemId);
    if (index > -1) {
      this.onboardingData.equipment.splice(index, 1);
    } else {
      this.onboardingData.equipment.push(itemId);
    }
    
    // Update UI
    const btn = document.querySelector(`[onclick="App.toggleEquipmentItem('${itemId}')"]`);
    if (btn) {
      btn.classList.toggle('selected');
      btn.querySelector('.item-check').textContent = this.onboardingData.equipment.includes(itemId) ? '✓' : '';
    }
    
    // Update category count
    this.EQUIPMENT_CATEGORIES.forEach(cat => {
      const countEl = document.querySelector(`[onclick="App.toggleEquipmentCategory('${cat.id}')"] .category-count`);
      if (countEl) countEl.textContent = this.countEquipmentInCategory(cat.id);
    });
    
    // Update total count
    const totalCount = document.querySelector('.onboarding-actions .text-secondary');
    if (totalCount) totalCount.textContent = `${this.onboardingData.equipment.length} items selected`;
    
    // Deselect bodyweight-only option
    document.querySelector('.bodyweight-option .btn-card')?.classList.remove('selected');
  },
  
  setBodyweightOnly() {
    this.onboardingData.equipment = [];
    // Update all equipment items UI
    document.querySelectorAll('.equipment-item').forEach(btn => {
      btn.classList.remove('selected');
      btn.querySelector('.item-check').textContent = '';
    });
    // Update category counts
    document.querySelectorAll('.category-count').forEach(el => el.textContent = '0');
    // Select bodyweight option
    document.querySelector('.bodyweight-option .btn-card')?.classList.add('selected');
    // Update total count
    const totalCount = document.querySelector('.onboarding-actions .text-secondary');
    if (totalCount) totalCount.textContent = `0 items selected`;
  },
  
  saveEquipment() {
    // Create user profile
    this.user = {
      id: 'user_' + Date.now(),
      name: this.onboardingData.name,
      age: this.onboardingData.age,
      gender: this.onboardingData.gender,
      hormonalTracking: this.onboardingData.hormonalTracking,
      weight: this.onboardingData.weight,
      weightUnit: this.onboardingData.weightUnit,
      targetWeight: this.onboardingData.targetWeight,
      targetDate: this.onboardingData.targetDate,
      targetDescription: this.onboardingData.targetDescription,
      goals: this.onboardingData.goals,
      conditions: this.onboardingData.conditions,
      lifestyle: this.onboardingData.lifestyle,
      equipment: this.onboardingData.equipment,
      onboardingComplete: true,
      createdAt: new Date().toISOString()
    };
    
    this.saveUser();
    this.navigate('onboarding-complete');
  },
  
  startApp() {
    document.getElementById('bottom-nav').classList.remove('hidden');
    this.navigate('today');
  },
  
  // ========================================
  // UTILITIES
  // ========================================
  
  loadUser() {
    try {
      const data = localStorage.getItem('alongside_user');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error loading user:', e);
      return null;
    }
  },
  
  saveUser() {
    try {
      localStorage.setItem('alongside_user', JSON.stringify(this.user));
    } catch (e) {
      console.error('Error saving user:', e);
    }
  },
  
  resetApp() {
    if (confirm('This will delete all your data and start fresh. Are you sure?')) {
      localStorage.removeItem('alongside_user');
      this.user = null;
      this.onboardingData = {
        name: '', age: null, gender: null, hormonalTracking: false,
        weight: null, weightUnit: 'kg', targetWeight: null, targetDate: null, targetDescription: '',
        goals: [], conditions: [], lifestyle: { activityLevel: null, stressLevel: null, sleepQuality: null },
        equipment: []
      };
      document.getElementById('bottom-nav').classList.add('hidden');
      this.navigate('onboarding-welcome');
    }
  },
  
  getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  },
  
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
};

// Make App available globally and start
window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());
