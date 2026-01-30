/**
 * app.js - Main Application Controller
 * Alongside - Compassionate fitness coaching
 */

const App = {
  
  // Current state
  currentView: null,
  user: null,
  
  // ----------------------------------------
  // INITIALISATION
  // ----------------------------------------
  
  init() {
    console.log('🌿 Alongside starting...');
    
    // Check if user exists in localStorage
    this.user = this.loadUser();
    
    // Simulate loading, then show appropriate view
    setTimeout(() => {
      this.hideLoading();
      
      if (!this.user || !this.user.onboardingComplete) {
        // New user - start onboarding
        this.navigate('onboarding-welcome');
      } else {
        // Returning user - show today view
        this.navigate('today');
      }
    }, 2000);
    
    // Setup navigation
    this.setupNavigation();
    
    console.log('🌿 Alongside ready');
  },
  
  // ----------------------------------------
  // NAVIGATION
  // ----------------------------------------
  
  navigate(viewName, params = {}) {
    console.log(`Navigating to: ${viewName}`);
    
    const mainContent = document.getElementById('main-content');
    const bottomNav = document.getElementById('bottom-nav');
    
    // Clear current content with fade
    mainContent.innerHTML = '';
    mainContent.className = 'main-content';
    
    // Route to view
    switch (viewName) {
      case 'onboarding-welcome':
        mainContent.classList.add('centered');
        mainContent.innerHTML = this.renderOnboardingWelcome();
        bottomNav.classList.add('hidden');
        break;
        
      case 'onboarding-name':
        mainContent.innerHTML = this.renderOnboardingName();
        bottomNav.classList.add('hidden');
        this.focusInput('user-name');
        break;
        
      case 'onboarding-goals':
        mainContent.innerHTML = this.renderOnboardingGoals();
        bottomNav.classList.add('hidden');
        break;
        
      case 'onboarding-conditions':
        mainContent.innerHTML = this.renderOnboardingConditions();
        bottomNav.classList.add('hidden');
        break;
        
      case 'onboarding-equipment':
        mainContent.innerHTML = this.renderOnboardingEquipment();
        bottomNav.classList.add('hidden');
        break;
        
      case 'onboarding-complete':
        mainContent.classList.add('centered');
        mainContent.innerHTML = this.renderOnboardingComplete();
        bottomNav.classList.add('hidden');
        break;
        
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
        console.error(`Unknown view: ${viewName}`);
        this.navigate('onboarding-welcome');
    }
    
    this.currentView = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  
  hideLoading() {
    const loading = document.getElementById('loading');
    loading.style.opacity = '0';
    loading.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => {
      loading.classList.add('hidden');
    }, 300);
  },
  
  focusInput(id) {
    setTimeout(() => {
      const input = document.getElementById(id);
      if (input) input.focus();
    }, 100);
  },
  
  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        this.navigate(view);
      });
    });
  },
  
  setActiveNav(viewName) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });
  },
  
  // ----------------------------------------
  // ONBOARDING DATA
  // ----------------------------------------
  
  GOALS: [
    { id: 'lose-weight', name: 'Lose weight', icon: '⚖️' },
    { id: 'build-strength', name: 'Build strength', icon: '💪' },
    { id: 'improve-cardio', name: 'Improve cardio fitness', icon: '❤️' },
    { id: 'reduce-pain', name: 'Reduce pain / recover from injury', icon: '🩹' },
    { id: 'more-energy', name: 'Have more energy', icon: '⚡' },
    { id: 'reduce-stress', name: 'Reduce stress', icon: '😌' },
    { id: 'build-habit', name: 'Build a consistent routine', icon: '📅' },
    { id: 'improve-flexibility', name: 'Improve flexibility', icon: '🧘' },
    { id: 'sleep-better', name: 'Sleep better', icon: '😴' },
    { id: 'feel-better', name: 'Just feel better in my body', icon: '✨' }
  ],
  
  CONDITIONS: [
    { id: 'lower-back', name: 'Lower Back', icon: '🔙' },
    { id: 'upper-back', name: 'Upper Back / Neck', icon: '🔙' },
    { id: 'shoulder', name: 'Shoulder', icon: '💪' },
    { id: 'hip', name: 'Hip', icon: '🦴' },
    { id: 'knee', name: 'Knee', icon: '🦵' },
    { id: 'ankle-foot', name: 'Ankle / Foot', icon: '🦶' },
    { id: 'wrist-elbow', name: 'Wrist / Elbow', icon: '✋' },
    { id: 'chronic-fatigue', name: 'Chronic fatigue', icon: '😴' },
    { id: 'anxiety', name: 'Anxiety / stress sensitivity', icon: '😰' },
    { id: 'breathing', name: 'Breathing / asthma', icon: '🌬️' }
  ],
  
  EQUIPMENT: [
    { id: 'none', name: 'No equipment', icon: '🏠', description: 'Bodyweight only' },
    { id: 'dumbbells', name: 'Dumbbells', icon: '🏋️', description: 'Any weight' },
    { id: 'kettlebell', name: 'Kettlebell', icon: '🔔', description: 'Any weight' },
    { id: 'resistance-bands', name: 'Resistance Bands', icon: '🎗️', description: 'Any type' },
    { id: 'pull-up-bar', name: 'Pull-up Bar', icon: '🪜', description: 'Doorway or mounted' },
    { id: 'yoga-mat', name: 'Yoga Mat', icon: '🧘', description: 'For floor work' },
    { id: 'foam-roller', name: 'Foam Roller', icon: '🧻', description: 'For recovery' }
  ],
  
  // Temporary storage during onboarding
  onboardingData: {
    name: '',
    goals: [],
    conditions: [],
    equipment: []
  },
  
  // ----------------------------------------
  // ONBOARDING VIEWS
  // ----------------------------------------
  
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
            Takes about 2 minutes
          </p>
        </div>
      </div>
    `;
  },
  
  renderOnboardingName() {
    return `
      <div class="onboarding-view">
        <div class="onboarding-header">
          <button class="btn btn-ghost" onclick="App.navigate('onboarding-welcome')">
            ← Back
          </button>
          <div class="progress-dots">
            <span class="dot active"></span>
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
          <button class="btn btn-ghost" onclick="App.navigate('onboarding-name')">
            ← Back
          </button>
          <div class="progress-dots">
            <span class="dot completed"></span>
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
        
        <div class="onboarding-content">
          <h1>What brings you here, ${this.onboardingData.name}?</h1>
          <p class="text-secondary">Select all that apply. You can change these later.</p>
          
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
          <button class="btn btn-ghost" onclick="App.navigate('onboarding-goals')">
            ← Back
          </button>
          <div class="progress-dots">
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot active"></span>
            <span class="dot"></span>
          </div>
        </div>
        
        <div class="onboarding-content">
          <h1>Anything I should know about?</h1>
          <p class="text-secondary">Select any areas that need extra care. I'll adapt exercises to protect them.</p>
          
          <div class="conditions-grid">
            ${conditionsHtml}
          </div>
          
          <p class="text-sm text-muted" style="margin-top: var(--space-4);">
            💡 It's okay to skip this - you can add conditions later.
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
  
  renderOnboardingEquipment() {
    const equipmentHtml = this.EQUIPMENT.map(item => `
      <button class="btn-card equipment-option ${this.onboardingData.equipment.includes(item.id) ? 'selected' : ''}" 
              data-equipment="${item.id}" 
              onclick="App.toggleEquipment('${item.id}')">
        <span class="equipment-icon">${item.icon}</span>
        <span class="equipment-text">${item.name}</span>
        <span class="equipment-desc">${item.description}</span>
      </button>
    `).join('');
    
    return `
      <div class="onboarding-view">
        <div class="onboarding-header">
          <button class="btn btn-ghost" onclick="App.navigate('onboarding-conditions')">
            ← Back
          </button>
          <div class="progress-dots">
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot completed"></span>
            <span class="dot active"></span>
          </div>
        </div>
        
        <div class="onboarding-content">
          <h1>What equipment do you have?</h1>
          <p class="text-secondary">I'll only suggest exercises you can actually do.</p>
          
          <div class="equipment-grid">
            ${equipmentHtml}
          </div>
        </div>
        
        <div class="onboarding-actions">
          <button class="btn btn-primary btn-large btn-full" onclick="App.saveEquipment()">
            ${this.onboardingData.equipment.length > 0 ? 'Finish setup' : 'Just bodyweight for now'}
          </button>
        </div>
      </div>
    `;
  },
  
  renderOnboardingComplete() {
    return `
      <div class="onboarding-view">
        <div class="onboarding-content">
          <div class="coach-greeting">
            <div class="completion-icon">🎉</div>
            <h1>You're all set, ${this.user.name}!</h1>
            <p class="lead">I've got everything I need to start helping you.</p>
          </div>
          
          <div class="welcome-message card card-coach">
            <p>Each day, I'll check in with you and suggest movement that matches your energy.</p>
            <p>No pressure. No judgment. Just support.</p>
          </div>
          
          <div class="summary-card card">
            <h3>Your profile</h3>
            <p class="text-secondary">
              <strong>Goals:</strong> ${this.user.goals.map(g => this.GOALS.find(x => x.id === g)?.name).join(', ') || 'None set'}
            </p>
            <p class="text-secondary">
              <strong>Conditions:</strong> ${this.user.conditions.length > 0 ? this.user.conditions.map(c => this.CONDITIONS.find(x => x.id === c)?.name).join(', ') : 'None'}
            </p>
            <p class="text-secondary">
              <strong>Equipment:</strong> ${this.user.equipment.length > 0 ? this.user.equipment.map(e => this.EQUIPMENT.find(x => x.id === e)?.name).join(', ') : 'Bodyweight only'}
            </p>
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
  
  // ----------------------------------------
  // MAIN APP VIEWS (Placeholders)
  // ----------------------------------------
  
  renderToday() {
    return `
      <div class="view">
        <div class="view-header">
          <h1>Hey ${this.user?.name || 'there'} 👋</h1>
          <p class="text-secondary">Let's check in and see what feels right today.</p>
        </div>
        
        <div class="card card-coach">
          <p><strong>This is where your daily check-in and workout will appear.</strong></p>
          <p class="text-secondary">We're still building this part! The onboarding is working though.</p>
        </div>
        
        <div class="card" style="margin-top: var(--space-4);">
          <h3>Your profile summary</h3>
          <p class="text-sm text-secondary">Goals: ${this.user?.goals?.join(', ') || 'None'}</p>
          <p class="text-sm text-secondary">Conditions: ${this.user?.conditions?.join(', ') || 'None'}</p>
          <p class="text-sm text-secondary">Equipment: ${this.user?.equipment?.join(', ') || 'Bodyweight'}</p>
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
            <p class="text-secondary">Goals: ${this.user?.goals?.length || 0} selected</p>
            <p class="text-secondary">Conditions: ${this.user?.conditions?.length || 0} tracked</p>
            <p class="text-secondary">Equipment: ${this.user?.equipment?.length || 0} items</p>
          </div>
          
          <button class="btn btn-danger btn-full" onclick="App.resetApp()" style="margin-top: var(--space-4);">
            Reset App (Start Over)
          </button>
        </div>
      </div>
    `;
  },
  
  // ----------------------------------------
  // ONBOARDING ACTIONS
  // ----------------------------------------
  
  saveName() {
    const nameInput = document.getElementById('user-name');
    const name = nameInput.value.trim();
    
    if (!name) {
      nameInput.focus();
      return;
    }
    
    this.onboardingData.name = name;
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
    
    // Update continue button
    const continueBtn = document.getElementById('goals-continue-btn');
    if (continueBtn) {
      continueBtn.disabled = this.onboardingData.goals.length === 0;
    }
    
    // Update count
    const countText = document.querySelector('.onboarding-actions .text-secondary');
    if (countText) {
      countText.textContent = `${this.onboardingData.goals.length} selected`;
    }
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
    
    // Update UI
    const btn = document.querySelector(`[data-condition="${conditionId}"]`);
    if (btn) btn.classList.toggle('selected');
    
    // Update button text
    const continueBtn = document.querySelector('.onboarding-actions .btn-primary');
    if (continueBtn) {
      continueBtn.textContent = this.onboardingData.conditions.length > 0 ? 'Continue' : 'Skip for now';
    }
  },
  
  saveConditions() {
    this.navigate('onboarding-equipment');
  },
  
  toggleEquipment(equipmentId) {
    // Special handling for 'none'
    if (equipmentId === 'none') {
      this.onboardingData.equipment = ['none'];
    } else {
      // Remove 'none' if selecting actual equipment
      const noneIndex = this.onboardingData.equipment.indexOf('none');
      if (noneIndex > -1) {
        this.onboardingData.equipment.splice(noneIndex, 1);
        document.querySelector('[data-equipment="none"]')?.classList.remove('selected');
      }
      
      // Toggle the item
      const index = this.onboardingData.equipment.indexOf(equipmentId);
      if (index > -1) {
        this.onboardingData.equipment.splice(index, 1);
      } else {
        this.onboardingData.equipment.push(equipmentId);
      }
    }
    
    // Update all UI states
    this.EQUIPMENT.forEach(item => {
      const btn = document.querySelector(`[data-equipment="${item.id}"]`);
      if (btn) {
        btn.classList.toggle('selected', this.onboardingData.equipment.includes(item.id));
      }
    });
    
    // Update button text
    const continueBtn = document.querySelector('.onboarding-actions .btn-primary');
    if (continueBtn) {
      continueBtn.textContent = this.onboardingData.equipment.length > 0 && !this.onboardingData.equipment.includes('none') 
        ? 'Finish setup' 
        : 'Just bodyweight for now';
    }
  },
  
  saveEquipment() {
    // If nothing selected, default to bodyweight
    if (this.onboardingData.equipment.length === 0) {
      this.onboardingData.equipment = ['none'];
    }
    
    // Create user profile
    this.user = {
      id: 'user_' + Date.now(),
      name: this.onboardingData.name,
      goals: this.onboardingData.goals,
      conditions: this.onboardingData.conditions,
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
  
  // ----------------------------------------
  // DATA PERSISTENCE
  // ----------------------------------------
  
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
      this.onboardingData = { name: '', goals: [], conditions: [], equipment: [] };
      document.getElementById('bottom-nav').classList.add('hidden');
      this.navigate('onboarding-welcome');
    }
  }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => App.init());
