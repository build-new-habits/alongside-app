# ALONGSIDE: Repository Setup & Architecture Guide
## Week 1, Day 1 - Let's Build | January 2026

---

# STEP 1: CREATE THE REPOSITORY

## On GitHub

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `alongside-app`
   - **Description:** `Compassionate fitness coaching for people fitness culture forgot`
   - **Visibility:** Private (for now - you can make it public later)
   - **Initialize:** Check "Add a README file"
   - **Add .gitignore:** Select "Node"
   - **License:** None for now (add later if open-sourcing)

3. Click **Create repository**

---

## Clone to Your Computer

Open Terminal (Mac) or Command Prompt (Windows) and run:

```bash
# Navigate to where you want the project
cd ~/Projects  # or wherever you keep code

# Clone the repo
git clone https://github.com/YOUR-USERNAME/alongside-app.git

# Enter the project folder
cd alongside-app
```

---

# STEP 2: CREATE FOLDER STRUCTURE

Run these commands to create the full structure:

```bash
# Create main folders
mkdir -p css/{base,components,layouts,utilities,themes}
mkdir -p js/{engines,coach,views,data,components,utils}
mkdir -p data/{exercises,programmes,conditions,goals}
mkdir -p assets/{icons,images,audio}
mkdir -p docs

# Create placeholder files to ensure folders are tracked
touch css/base/.gitkeep
touch css/components/.gitkeep
touch css/layouts/.gitkeep
touch css/utilities/.gitkeep
touch css/themes/.gitkeep
touch js/engines/.gitkeep
touch js/coach/.gitkeep
touch js/views/.gitkeep
touch js/data/.gitkeep
touch js/components/.gitkeep
touch js/utils/.gitkeep
touch data/exercises/.gitkeep
touch data/programmes/.gitkeep
touch data/conditions/.gitkeep
touch data/goals/.gitkeep
touch assets/icons/.gitkeep
touch assets/images/.gitkeep
touch assets/audio/.gitkeep
touch docs/.gitkeep
```

---

## Final Folder Structure

```
alongside-app/
│
├── index.html                 # Main app entry point
├── README.md                  # Project documentation
├── .gitignore                 # Git ignore rules
│
├── css/
│   ├── base/
│   │   ├── reset.css          # CSS reset/normalize
│   │   ├── variables.css      # CSS custom properties (colours, spacing, etc.)
│   │   └── typography.css     # Font styles
│   │
│   ├── components/
│   │   ├── buttons.css
│   │   ├── cards.css
│   │   ├── inputs.css
│   │   ├── navigation.css
│   │   ├── coach.css          # Coach avatar, speech bubbles
│   │   ├── progress.css       # Progress bars, charts
│   │   ├── timer.css
│   │   └── paywall.css        # Upgrade prompts
│   │
│   ├── layouts/
│   │   ├── app-shell.css      # Main app container
│   │   ├── views.css          # View-specific layouts
│   │   └── modals.css
│   │
│   ├── utilities/
│   │   └── helpers.css        # Utility classes
│   │
│   ├── themes/
│   │   ├── light.css          # Default theme
│   │   └── dark.css           # Future: dark mode
│   │
│   └── main.css               # Imports all CSS files
│
├── js/
│   ├── app.js                 # Main app controller
│   │
│   ├── engines/
│   │   ├── store.js           # LocalStorage wrapper, data persistence
│   │   ├── access.js          # Feature gating, subscription checks
│   │   ├── safety.js          # Burnout detection, safety checks
│   │   ├── adaptation.js      # Session adaptation based on check-in
│   │   ├── scheduler.js       # Schedule analysis, slot detection
│   │   ├── progression.js     # Exercise progression tracking
│   │   └── credits.js         # Credits system
│   │
│   ├── coach/
│   │   ├── coach.js           # Main coach controller
│   │   ├── scripts.js         # All coach dialogue
│   │   ├── personality.js     # Personality variants (Steady, etc.)
│   │   └── responses.js       # Context-aware response selection
│   │
│   ├── views/
│   │   ├── onboarding/
│   │   │   ├── controller.js
│   │   │   ├── welcome.js
│   │   │   ├── name.js
│   │   │   ├── goals.js
│   │   │   ├── conditions.js
│   │   │   ├── equipment.js
│   │   │   ├── schedule.js
│   │   │   ├── coach-select.js
│   │   │   └── plan-reveal.js
│   │   │
│   │   ├── checkin/
│   │   │   ├── controller.js
│   │   │   ├── greeting.js
│   │   │   ├── energy.js
│   │   │   ├── mood.js
│   │   │   ├── conditions.js
│   │   │   ├── cycle.js
│   │   │   └── summary.js
│   │   │
│   │   ├── session/
│   │   │   ├── today.js       # Today's session view
│   │   │   ├── exercise.js    # Individual exercise view
│   │   │   ├── timer.js       # Timer component
│   │   │   ├── feedback.js    # Post-exercise feedback
│   │   │   └── complete.js    # Session complete view
│   │   │
│   │   ├── progress/
│   │   │   ├── dashboard.js
│   │   │   ├── trends.js
│   │   │   ├── conditions.js
│   │   │   └── milestones.js
│   │   │
│   │   ├── settings/
│   │   │   ├── profile.js
│   │   │   ├── schedule.js
│   │   │   ├── conditions.js
│   │   │   ├── equipment.js
│   │   │   └── subscription.js
│   │   │
│   │   ├── subscription/
│   │   │   ├── pricing.js
│   │   │   ├── checkout.js
│   │   │   └── friend-codes.js
│   │   │
│   │   └── admin/             # Your admin views (hidden from regular users)
│   │       ├── invites.js
│   │       ├── feedback.js
│   │       └── users.js
│   │
│   ├── components/
│   │   ├── slider.js          # 1-10 slider component
│   │   ├── multi-select.js    # Chip-style multi-select
│   │   ├── body-map.js        # Body part selector
│   │   ├── calendar.js        # Movement calendar
│   │   ├── toast.js           # Toast notifications
│   │   ├── modal.js           # Modal dialogs
│   │   └── feedback-button.js # Floating feedback button
│   │
│   ├── data/
│   │   ├── exercises.js       # Exercise data loader
│   │   ├── programmes.js      # Programme data loader
│   │   ├── conditions.js      # Condition definitions
│   │   └── goals.js           # Goal definitions
│   │
│   └── utils/
│       ├── dates.js           # Date formatting helpers
│       ├── validation.js      # Input validation
│       └── dom.js             # DOM manipulation helpers
│
├── data/
│   ├── exercises/
│   │   ├── _template.json     # Template for new exercises
│   │   ├── hip-flexor-stretch.json
│   │   ├── pigeon-pose.json
│   │   ├── dead-bug.json
│   │   ├── plank.json
│   │   └── ... (more exercises)
│   │
│   ├── programmes/
│   │   ├── _template.json     # Template for new programmes
│   │   ├── hip-recovery.json
│   │   ├── hamstring-rehab.json
│   │   ├── core-stability.json
│   │   └── ... (more programmes)
│   │
│   ├── conditions/
│   │   ├── _template.json
│   │   ├── herniated-disc.json
│   │   ├── hamstring-strain.json
│   │   └── ... (more conditions)
│   │
│   └── goals/
│       ├── _template.json
│       ├── return-to-running.json
│       ├── reduce-pain.json
│       └── ... (more goals)
│
├── assets/
│   ├── icons/
│   │   └── ... (SVG icons)
│   │
│   ├── images/
│   │   └── ... (exercise images, coach avatar)
│   │
│   └── audio/
│       └── ... (timer sounds, celebration sounds)
│
└── docs/
    ├── 01-architecture.md
    ├── 02-coach-scripts.md
    ├── 03-content-spec.md
    ├── 04-onboarding.md
    ├── 05-json-schemas.md
    ├── 06-checkin-flow.md
    ├── 07-ui-design.md
    ├── 08-progress.md
    ├── 09-freemium.md
    ├── 10-market-research.md
    ├── 11-build-schedule.md
    ├── 12-paywall-codes-feedback.md
    └── 13-schedule-intelligence.md
```

---

# STEP 3: CREATE CORE FILES

## 3.1 index.html

```bash
touch index.html
```

Open `index.html` and paste:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#7B9E87">
  <meta name="description" content="Compassionate fitness coaching that adapts to your life">
  
  <title>Alongside</title>
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="assets/icons/favicon.svg">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Styles -->
  <link rel="stylesheet" href="css/main.css">
</head>
<body>
  <!-- App Shell -->
  <div id="app" class="app-container">
    <!-- Loading state -->
    <div id="loading" class="loading-screen">
      <div class="loading-content">
        <h1>Alongside</h1>
        <p>Loading...</p>
      </div>
    </div>
    
    <!-- Main content (populated by JS) -->
    <main id="main-content" class="main-content" role="main">
      <!-- Views render here -->
    </main>
    
    <!-- Bottom navigation (shown after onboarding) -->
    <nav id="bottom-nav" class="bottom-nav hidden" role="navigation" aria-label="Main navigation">
      <button class="nav-item active" data-view="today" aria-current="page">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Today</span>
      </button>
      <button class="nav-item" data-view="progress">
        <span class="nav-icon">📊</span>
        <span class="nav-label">Progress</span>
      </button>
      <button class="nav-item" data-view="settings">
        <span class="nav-icon">⚙️</span>
        <span class="nav-label">Settings</span>
      </button>
    </nav>
    
    <!-- Feedback button (floating) -->
    <button id="feedback-fab" class="feedback-fab hidden" aria-label="Give feedback">
      💬
    </button>
    
    <!-- Toast container -->
    <div id="toast-container" class="toast-container" aria-live="polite"></div>
    
    <!-- Modal container -->
    <div id="modal-container" class="modal-container hidden"></div>
  </div>
  
  <!-- Scripts -->
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

---

## 3.2 css/main.css

```bash
touch css/main.css
```

```css
/* main.css - Import all stylesheets */

/* Base */
@import 'base/reset.css';
@import 'base/variables.css';
@import 'base/typography.css';

/* Components */
@import 'components/buttons.css';
@import 'components/cards.css';
@import 'components/inputs.css';
@import 'components/navigation.css';
@import 'components/coach.css';
@import 'components/progress.css';
@import 'components/timer.css';
@import 'components/paywall.css';

/* Layouts */
@import 'layouts/app-shell.css';
@import 'layouts/views.css';
@import 'layouts/modals.css';

/* Utilities */
@import 'utilities/helpers.css';

/* Themes */
@import 'themes/light.css';
```

---

## 3.3 css/base/variables.css

```bash
touch css/base/variables.css
```

```css
/* variables.css - Design tokens from Doc 7 */

:root {
  /* ========================================
     COLOURS
     ======================================== */
  
  /* Primary - Sage */
  --color-primary: #7B9E87;
  --color-primary-light: #A8C5B0;
  --color-primary-dark: #5A7A64;
  
  /* Background */
  --color-bg: #FAF8F5;
  --color-bg-white: #FFFFFF;
  --color-bg-card: #FFFFFF;
  
  /* Text */
  --color-text: #2D3436;
  --color-text-secondary: #636E72;
  --color-text-muted: #B2BEC3;
  --color-text-inverse: #FFFFFF;
  
  /* Semantic */
  --color-success: #27AE60;
  --color-success-light: #E8F5E9;
  --color-warning: #F39C12;
  --color-warning-light: #FFF8E1;
  --color-danger: #E74C3C;
  --color-danger-light: #FFEBEE;
  --color-info: #3498DB;
  --color-info-light: #E3F2FD;
  
  /* Energy/Mood Scale */
  --color-scale-1: #E57373;  /* Low */
  --color-scale-2: #EF9A9A;
  --color-scale-3: #FFCC80;
  --color-scale-4: #FFE082;
  --color-scale-5: #FFF59D;  /* Middle */
  --color-scale-6: #E6EE9C;
  --color-scale-7: #C5E1A5;
  --color-scale-8: #A5D6A7;
  --color-scale-9: #81C784;
  --color-scale-10: #66BB6A; /* High */
  
  /* Borders */
  --color-border: #E0E0E0;
  --color-border-light: #F0F0F0;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* ========================================
     TYPOGRAPHY
     ======================================== */
  
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Font sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 2rem;      /* 32px */
  
  /* Font weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* ========================================
     SPACING
     ======================================== */
  
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.5rem;    /* 24px */
  --space-6: 2rem;      /* 32px */
  --space-7: 2.5rem;    /* 40px */
  --space-8: 4rem;      /* 64px */
  
  /* ========================================
     BORDERS & RADIUS
     ======================================== */
  
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* ========================================
     TRANSITIONS
     ======================================== */
  
  --transition-fast: 100ms ease-out;
  --transition-normal: 200ms ease-out;
  --transition-slow: 300ms ease-out;
  
  /* ========================================
     LAYOUT
     ======================================== */
  
  --nav-height: 64px;
  --header-height: 56px;
  --max-width: 480px;
  --content-padding: var(--space-4);
  
  /* ========================================
     Z-INDEX
     ======================================== */
  
  --z-base: 1;
  --z-nav: 100;
  --z-modal: 200;
  --z-toast: 300;
  --z-fab: 150;
}

/* Large text mode (accessibility) */
@media (prefers-larger-text) {
  :root {
    --text-xs: 0.875rem;
    --text-sm: 1rem;
    --text-base: 1.125rem;
    --text-lg: 1.25rem;
    --text-xl: 1.5rem;
    --text-2xl: 1.75rem;
    --text-3xl: 2.25rem;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 0ms;
    --transition-normal: 0ms;
    --transition-slow: 0ms;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --color-text: #000000;
    --color-text-secondary: #333333;
    --color-border: #000000;
  }
}
```

---

## 3.4 js/app.js

```bash
touch js/app.js
```

```javascript
/**
 * app.js - Main Application Controller
 * 
 * This is the entry point for Alongside.
 * It handles routing, initialisation, and global state.
 */

// ============================================
// IMPORTS
// ============================================

import Store from './engines/store.js';
import Access from './engines/access.js';
import Coach from './coach/coach.js';

// Views
import OnboardingController from './views/onboarding/controller.js';
import CheckinController from './views/checkin/controller.js';
import TodayView from './views/session/today.js';
import ProgressView from './views/progress/dashboard.js';
import SettingsView from './views/settings/profile.js';

// Components
import Toast from './components/toast.js';
import FeedbackButton from './components/feedback-button.js';

// ============================================
// APP CONTROLLER
// ============================================

const App = {
  
  // Current state
  currentView: null,
  user: null,
  
  // ----------------------------------------
  // INITIALISATION
  // ----------------------------------------
  
  async init() {
    console.log('🌿 Alongside starting...');
    
    // Load user data
    this.user = Store.getUser();
    
    // Determine starting view
    if (!this.user) {
      // New user - start onboarding
      this.navigate('onboarding');
    } else if (!this.user.todayCheckin || !this.isTodayCheckin(this.user.todayCheckin)) {
      // Returning user - needs check-in
      this.navigate('checkin');
    } else {
      // Returning user - has checked in today
      this.navigate('today');
    }
    
    // Hide loading screen
    document.getElementById('loading').classList.add('hidden');
    
    // Setup navigation
    this.setupNavigation();
    
    // Setup feedback button (for beta)
    FeedbackButton.init();
    
    console.log('🌿 Alongside ready');
  },
  
  // ----------------------------------------
  // NAVIGATION
  // ----------------------------------------
  
  navigate(viewName, params = {}) {
    console.log(`Navigating to: ${viewName}`);
    
    const mainContent = document.getElementById('main-content');
    const bottomNav = document.getElementById('bottom-nav');
    const feedbackFab = document.getElementById('feedback-fab');
    
    // Clear current content
    mainContent.innerHTML = '';
    
    // Route to view
    switch (viewName) {
      case 'onboarding':
        mainContent.innerHTML = OnboardingController.render();
        OnboardingController.init();
        bottomNav.classList.add('hidden');
        feedbackFab.classList.add('hidden');
        break;
        
      case 'checkin':
        mainContent.innerHTML = CheckinController.render();
        CheckinController.init();
        bottomNav.classList.add('hidden');
        feedbackFab.classList.remove('hidden');
        break;
        
      case 'today':
        mainContent.innerHTML = TodayView.render(this.user);
        TodayView.init();
        bottomNav.classList.remove('hidden');
        feedbackFab.classList.remove('hidden');
        this.setActiveNav('today');
        break;
        
      case 'progress':
        mainContent.innerHTML = ProgressView.render(this.user);
        ProgressView.init();
        bottomNav.classList.remove('hidden');
        feedbackFab.classList.remove('hidden');
        this.setActiveNav('progress');
        break;
        
      case 'settings':
        mainContent.innerHTML = SettingsView.render(this.user);
        SettingsView.init();
        bottomNav.classList.remove('hidden');
        feedbackFab.classList.remove('hidden');
        this.setActiveNav('settings');
        break;
        
      case 'session':
        // Session execution view
        import('./views/session/exercise.js').then(module => {
          mainContent.innerHTML = module.default.render(params.session);
          module.default.init();
          bottomNav.classList.add('hidden'); // Hide nav during session
          feedbackFab.classList.add('hidden');
        });
        break;
        
      case 'pricing':
        import('./views/subscription/pricing.js').then(module => {
          mainContent.innerHTML = module.default.render();
          module.default.init();
        });
        break;
        
      default:
        console.error(`Unknown view: ${viewName}`);
        this.navigate('today');
    }
    
    this.currentView = viewName;
    
    // Scroll to top
    window.scrollTo(0, 0);
  },
  
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
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
        item.setAttribute('aria-current', 'page');
      } else {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
      }
    });
  },
  
  // ----------------------------------------
  // HELPERS
  // ----------------------------------------
  
  isTodayCheckin(checkin) {
    if (!checkin?.date) return false;
    const checkinDate = new Date(checkin.date).toDateString();
    const today = new Date().toDateString();
    return checkinDate === today;
  },
  
  // Refresh user data from store
  refreshUser() {
    this.user = Store.getUser();
  },
  
  // Get current user
  getUser() {
    return this.user;
  }
};

// ============================================
// INITIALISE ON LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Make App available globally for debugging
window.App = App;

export default App;
```

---

## 3.5 js/engines/store.js

```bash
touch js/engines/store.js
```

```javascript
/**
 * store.js - Data Persistence Layer
 * 
 * Handles all localStorage operations with:
 * - Automatic JSON serialization
 * - Schema validation
 * - Migration support for future updates
 * - Export/import functionality
 */

const Store = {
  
  // ============================================
  // CONFIGURATION
  // ============================================
  
  PREFIX: 'alongside_',
  SCHEMA_VERSION: 1,
  
  // Keys
  KEYS: {
    USER: 'user',
    CHECKINS: 'checkins',
    SESSIONS: 'sessions',
    FEEDBACK: 'feedback',
    SURVEYS: 'surveys',
    FRIEND_CODES: 'friend_codes',
    SETTINGS: 'settings'
  },
  
  // ============================================
  // CORE OPERATIONS
  // ============================================
  
  // Get item from storage
  get(key) {
    try {
      const data = localStorage.getItem(this.PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Store.get error for ${key}:`, e);
      return null;
    }
  },
  
  // Set item in storage
  set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Store.set error for ${key}:`, e);
      // Handle quota exceeded
      if (e.name === 'QuotaExceededError') {
        this.handleQuotaExceeded();
      }
      return false;
    }
  },
  
  // Remove item from storage
  remove(key) {
    try {
      localStorage.removeItem(this.PREFIX + key);
      return true;
    } catch (e) {
      console.error(`Store.remove error for ${key}:`, e);
      return false;
    }
  },
  
  // ============================================
  // USER DATA
  // ============================================
  
  // Get current user
  getUser() {
    return this.get(this.KEYS.USER);
  },
  
  // Save user
  saveUser(userData) {
    // Add metadata
    userData._schemaVersion = this.SCHEMA_VERSION;
    userData._updatedAt = new Date().toISOString();
    
    return this.set(this.KEYS.USER, userData);
  },
  
  // Create new user
  createUser(profile) {
    const user = {
      id: this.generateId('user'),
      createdAt: new Date().toISOString(),
      
      profile: {
        name: profile.name,
        goals: profile.goals || [],
        conditions: profile.conditions || [],
        equipment: profile.equipment || [],
        schedule: profile.schedule || null,
        preferences: profile.preferences || {}
      },
      
      subscription: {
        tier: 'free',
        status: 'active',
        foundingMember: false
      },
      
      coach: {
        personality: 'steady'
      },
      
      todayCheckin: null,
      currentProgramme: null,
      
      stats: {
        totalSessions: 0,
        totalMinutes: 0,
        credits: 0,
        currentStreak: 0, // We track but don't emphasize
        longestStreak: 0
      }
    };
    
    this.saveUser(user);
    return user;
  },
  
  // Update user profile
  updateProfile(updates) {
    const user = this.getUser();
    if (!user) return null;
    
    user.profile = { ...user.profile, ...updates };
    this.saveUser(user);
    return user;
  },
  
  // ============================================
  // CHECK-INS
  // ============================================
  
  // Get all check-ins
  getCheckins() {
    return this.get(this.KEYS.CHECKINS) || [];
  },
  
  // Save a check-in
  saveCheckin(checkin) {
    const checkins = this.getCheckins();
    
    // Add metadata
    checkin.id = checkin.id || this.generateId('checkin');
    checkin.createdAt = checkin.createdAt || new Date().toISOString();
    
    // Check if updating today's check-in
    const todayIndex = checkins.findIndex(c => 
      new Date(c.date).toDateString() === new Date(checkin.date).toDateString()
    );
    
    if (todayIndex >= 0) {
      checkins[todayIndex] = checkin;
    } else {
      checkins.push(checkin);
    }
    
    this.set(this.KEYS.CHECKINS, checkins);
    
    // Also update user's todayCheckin
    const user = this.getUser();
    if (user) {
      user.todayCheckin = checkin;
      this.saveUser(user);
    }
    
    return checkin;
  },
  
  // Get check-ins for date range
  getCheckinsInRange(startDate, endDate) {
    const checkins = this.getCheckins();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return checkins.filter(c => {
      const date = new Date(c.date);
      return date >= start && date <= end;
    });
  },
  
  // ============================================
  // SESSIONS
  // ============================================
  
  // Get all sessions
  getSessions() {
    return this.get(this.KEYS.SESSIONS) || [];
  },
  
  // Save a session
  saveSession(session) {
    const sessions = this.getSessions();
    
    // Add metadata
    session.id = session.id || this.generateId('session');
    session.completedAt = session.completedAt || new Date().toISOString();
    
    sessions.push(session);
    this.set(this.KEYS.SESSIONS, sessions);
    
    // Update user stats
    this.updateUserStats(session);
    
    return session;
  },
  
  // Update user stats after session
  updateUserStats(session) {
    const user = this.getUser();
    if (!user) return;
    
    user.stats.totalSessions += 1;
    user.stats.totalMinutes += session.duration || 0;
    user.stats.credits += session.creditsEarned || 0;
    
    this.saveUser(user);
  },
  
  // ============================================
  // FEEDBACK & SURVEYS
  // ============================================
  
  saveFeedback(feedback) {
    const allFeedback = this.get(this.KEYS.FEEDBACK) || [];
    feedback.id = feedback.id || this.generateId('feedback');
    allFeedback.push(feedback);
    this.set(this.KEYS.FEEDBACK, allFeedback);
    return feedback;
  },
  
  saveSurvey(survey) {
    const surveys = this.get(this.KEYS.SURVEYS) || [];
    survey.id = survey.id || this.generateId('survey');
    surveys.push(survey);
    this.set(this.KEYS.SURVEYS, surveys);
    return survey;
  },
  
  // ============================================
  // EXPORT / IMPORT
  // ============================================
  
  // Export all user data
  exportData() {
    const data = {
      exportedAt: new Date().toISOString(),
      schemaVersion: this.SCHEMA_VERSION,
      user: this.getUser(),
      checkins: this.getCheckins(),
      sessions: this.getSessions(),
      feedback: this.get(this.KEYS.FEEDBACK) || [],
      surveys: this.get(this.KEYS.SURVEYS) || []
    };
    
    return JSON.stringify(data, null, 2);
  },
  
  // Import user data
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      // Validate
      if (!data.user || !data.schemaVersion) {
        throw new Error('Invalid data format');
      }
      
      // Import
      this.saveUser(data.user);
      this.set(this.KEYS.CHECKINS, data.checkins || []);
      this.set(this.KEYS.SESSIONS, data.sessions || []);
      this.set(this.KEYS.FEEDBACK, data.feedback || []);
      this.set(this.KEYS.SURVEYS, data.surveys || []);
      
      return { success: true };
    } catch (e) {
      console.error('Import error:', e);
      return { success: false, error: e.message };
    }
  },
  
  // ============================================
  // UTILITIES
  // ============================================
  
  // Generate unique ID
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // Handle storage quota exceeded
  handleQuotaExceeded() {
    // Try to clear old data
    const checkins = this.getCheckins();
    const sessions = this.getSessions();
    
    // Keep only last 90 days of check-ins
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const recentCheckins = checkins.filter(c => 
      new Date(c.date) > ninetyDaysAgo
    );
    
    const recentSessions = sessions.filter(s => 
      new Date(s.completedAt) > ninetyDaysAgo
    );
    
    this.set(this.KEYS.CHECKINS, recentCheckins);
    this.set(this.KEYS.SESSIONS, recentSessions);
    
    console.warn('Storage quota exceeded - cleared old data');
  },
  
  // Clear all data (for testing or account deletion)
  clearAll() {
    Object.values(this.KEYS).forEach(key => {
      this.remove(key);
    });
    console.log('All Alongside data cleared');
  },
  
  // Get storage usage
  getStorageUsage() {
    let total = 0;
    for (const key of Object.values(this.KEYS)) {
      const item = localStorage.getItem(this.PREFIX + key);
      if (item) {
        total += item.length;
      }
    }
    return {
      bytes: total,
      kb: (total / 1024).toFixed(2),
      mb: (total / (1024 * 1024)).toFixed(4)
    };
  }
};

export default Store;
```

---

# STEP 4: VERIFY YOUR SETUP

## Commit Your Initial Structure

```bash
# Add all files
git add .

# Commit
git commit -m "Initial project structure - Week 1 Day 1"

# Push to GitHub
git push origin main
```

## Test It Works

1. Open `index.html` in your browser (just double-click it)
2. You should see "Alongside - Loading..."
3. Open browser console (F12) - you'll see errors about missing modules (that's expected - we haven't built them yet)

---

# STEP 5: WHAT'S FUTURE-PROOFED

## For Adding Content Later

| What | How |
|------|-----|
| New exercises | Add JSON file to `data/exercises/` |
| New programmes | Add JSON file to `data/programmes/` |
| New conditions | Add JSON file to `data/conditions/` |
| New goals | Add JSON file to `data/goals/` |

All data is loaded dynamically - no code changes needed.

## For Freemium Access

| Component | Location |
|-----------|----------|
| Access control | `js/engines/access.js` |
| Subscription UI | `js/views/subscription/` |
| Paywall prompts | `css/components/paywall.css` |
| Stripe integration | `js/views/subscription/checkout.js` (future) |

The `Access` engine checks permissions before every feature.

## For Multiple Coach Personalities

| Component | Location |
|-----------|----------|
| Personality definitions | `js/coach/personality.js` |
| Dialogue variants | `js/coach/scripts.js` |
| Selection UI | `js/views/onboarding/coach-select.js` |

Currently builds Steady only - others slot in identically.

---

# ONBOARDING: COMPLETE FOR ALL USERS

Yes - the onboarding flow supports **everything** from your docs:

| Screen | Supports |
|--------|----------|
| Welcome | All users |
| Name | All users |
| Goals | Full goal list (you just have 2-3 selected) |
| Conditions | Any condition from `data/conditions/` |
| Body map | Full body selection |
| Equipment | Any equipment from schema |
| Schedule | Full weekly pattern (your complex schedule works) |
| Time preferences | All options |
| Coach | All 4 personalities (only Steady built initially) |
| Menstrual tracking | Optional, respects "not relevant" |
| Plan reveal | Works for any generated plan |

**You're building the complete system. Your content is just the first data loaded into it.**

---

# WHAT'S NEXT (TODAY)

After running the setup commands:

1. **Create `css/base/reset.css`** - Basic CSS reset
2. **Create `css/base/typography.css`** - Font styles
3. **Create `css/layouts/app-shell.css`** - Basic app container
4. **Test in browser** - Should see styled loading screen

Want me to provide those files now?
