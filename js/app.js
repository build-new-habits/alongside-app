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
      
      if (!this.user) {
        // New user - start onboarding
        this.navigate('onboarding-welcome');
      } else if (!this.hasCheckedInToday()) {
        // Returning user - needs check-in
        this.navigate('checkin');
      } else {
        // Returning user - show today view
        this.navigate('today');
      }
    }, 2000); // 2 second loading
    
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
    
    // Clear current content
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
        break;
        
      case 'onboarding-goals':
        mainContent.innerHTML = this.renderOnboardingGoals();
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
    
    // Scroll to top
    window.scrollTo(0, 0);
  },
  
  hideLoading() {
    const loading = document.getElementById('loading');
    loading.style.opacity = '0';
    loading.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => {
      loading.classList.add('hidden');
    }, 300);
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
      if (item.dataset.view === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
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
          <p class="text-sm text-secondary" style="margin-top: var(--space-4); text-align: center;">
            Takes about 3 minutes
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
              autofocus
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
            <span class="dot"></span>
          </div>
        </div>
        
        <div class="onboarding-content">
          <h1>What brings you here, ${this.user?.name || 'friend'}?</h1>
          <p class="text-secondary">Select all that apply. This helps me personalise your experience.</p>
          
          <div class="goals-grid">
            <button class="btn-card goal-option" data-goal="reduce-pain" onclick="App.toggleGoal(this)">
              <span class="goal-icon">🩹</span>
              <span class="goal-text">Reduce pain or manage an injury</span>
            </button>
            
            <button class="btn-card goal-option" data-goal="build-strength" onclick="App.toggleGoal(this)">
              <span class="goal-icon">💪</span>
              <span class="goal-text">Build strength</span>
            </button>
            
            <button class="btn-card goal-option" data-goal="improve-mobility" onclick="App.toggleGoal(this)">
              <span class="goal-icon">🧘</span>
              <span class="goal-text">Improve flexibility & mobility</span>
            </button>
            
            <button class="btn-card goal-option" data-goal="return-to-activity" onclick="App.toggleGoal(this)">
              <span class="goal-icon">🏃</span>
              <span class="goal-text">Return to a sport or activity</span>
            </button>
            
            <button class="btn-card goal-option" data-goal="consistent-routine" onclick="App.toggleGoal(this)">
              <span class="goal-icon">📅</span>
              <span class="goal-text">Build a consistent routine</span>
            </button>
            
            <button class="btn-card goal-option" data-goal="feel-better" onclick="App.toggleGoal(this)">
              <span class="goal-icon">✨</span>
              <span class="goal-text">Just feel better in my body</span>
            </button>
          </div>
        </div>
        
        <div class="onboarding-actions">
          <button class="btn btn-primary btn-large btn-full" onclick="App.saveGoals()" id="goals-continue-btn" disabled>
            Continue
          </button>
        </div>
      </div>
    `;
  },
  
  // ----------------------------------------
  // PLACEHOLDER VIEWS (Build later)
  // ----------------------------------------
  
  renderToday() {
    return `
      <div class="view">
        <div class="view-header">
          <h1>Good to see you, ${this.user?.name || 'friend'}</h1>
          <p class="text-secondary">Let's check in and see what feels right today.</p>
        </div>
        
        <div class="card card-coach">
          <p>This is where your daily check-in and workout will appear.</p>
          <p class="text-secondary">We're still building this part!</p>
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
            <p class="text-secondary">Goals: ${this.user?.goals?.join(', ') || 'Not set'}</p>
          </div>
          
          <button class="btn btn-danger btn-full" onclick="App.resetApp()">
            Reset App (Start Over)
          </button>
        </div>
      </div>
    `;
  },
  
  // ----------------------------------------
  // DATA HANDLING
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
  
  saveName() {
    const nameInput = document.getElementById('user-name');
    const name = nameInput.value.trim();
    
    if (!name) {
      nameInput.focus();
      return;
    }
    
    // Create or update user
    if (!this.user) {
      this.user = {
        id: 'user_' + Date.now(),
        createdAt: new Date().toISOString()
      };
    }
    
    this.user.name = name;
    this.saveUser();
    
    this.navigate('onboarding-goals');
  },
  
  toggleGoal(button) {
    button.classList.toggle('selected');
    
    // Enable/disable continue button based on selection
    const selected = document.querySelectorAll('.goal-option.selected');
    const continueBtn = document.getElementById('goals-continue-btn');
    continueBtn.disabled = selected.length === 0;
  },
  
  saveGoals() {
    const selected = document.querySelectorAll('.goal-option.selected');
    const goals = Array.from(selected).map(btn => btn.dataset.goal);
    
    if (goals.length === 0) return;
    
    this.user.goals = goals;
    this.saveUser();
    
    // For now, go to Today view (later: continue onboarding)
    this.navigate('today');
    
    // Show bottom nav
    document.getElementById('bottom-nav').classList.remove('hidden');
  },
  
  hasCheckedInToday() {
    // TODO: Implement check-in logic
    return false;
  },
  
  resetApp() {
    if (confirm('This will delete all your data and start fresh. Are you sure?')) {
      localStorage.removeItem('alongside_user');
      this.user = null;
      this.navigate('onboarding-welcome');
    }
  }
};

// ----------------------------------------
// START APP
// ----------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
