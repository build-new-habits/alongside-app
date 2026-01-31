/**
 * router.js - View navigation
 * Handles routing between different screens
 */

import { store } from './store.js';

export const router = {
  
  currentView: null,
  views: {},  // Will be populated with view modules
  
  /**
   * Initialise router
   */
  init() {
    this.setupNavigation();
    this.hideLoading();
    
    // Determine starting view
    if (store.isOnboardingComplete()) {
      this.navigate('today');
    } else {
      this.navigate('onboarding/welcome');
    }
    
    console.log('🧭 Router initialised');
  },
  
  /**
   * Register a view module
   */
  register(name, viewModule) {
    this.views[name] = viewModule;
  },
  
  /**
   * Navigate to a view
   */
  async navigate(viewName) {
    console.log(`Navigating to: ${viewName}`);
    
    const mainContent = document.getElementById('main-content');
    const bottomNav = document.getElementById('bottom-nav');
    
    // Clear current content
    mainContent.innerHTML = '';
    mainContent.className = 'main-content';
    
    // Hide/show bottom nav
    if (viewName.startsWith('onboarding')) {
      bottomNav.classList.add('hidden');
    } else {
      bottomNav.classList.remove('hidden');
      this.setActiveNav(viewName);
    }
    
    // Load and render the view
    try {
      const view = await this.loadView(viewName);
      
      if (view) {
        // Add centered class if view requests it
        if (view.centered) {
          mainContent.classList.add('centered');
        }
        
        // Render the view
        mainContent.innerHTML = view.render();
        
        // Call onMount if it exists (for attaching handlers, focusing inputs, etc.)
        if (view.onMount) {
          view.onMount();
        }
      }
    } catch (e) {
      console.error(`Error loading view: ${viewName}`, e);
      mainContent.innerHTML = `<div class="error">Error loading view</div>`;
    }
    
    this.currentView = viewName;
    window.scrollTo({ top: 0, behavior: 'instant' });
  },
  
  /**
   * Dynamically load a view module
   */
  async loadView(viewName) {
    // Check if already registered
    if (this.views[viewName]) {
      return this.views[viewName];
    }
    
    // Dynamic import based on view name
    const path = `./views/${viewName}.js`;
    
    try {
      const module = await import(path);
      this.views[viewName] = module;
      return module;
    } catch (e) {
      console.error(`Failed to load view: ${path}`, e);
      return null;
    }
  },
  
  /**
   * Hide the loading screen
   */
  hideLoading() {
    setTimeout(() => {
      const loading = document.getElementById('loading');
      if (loading) {
        loading.style.opacity = '0';
        loading.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => loading.classList.add('hidden'), 300);
      }
    }, 1500);
  },
  
  /**
   * Setup bottom navigation click handlers
   */
  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view) this.navigate(view);
      });
    });
  },
  
  /**
   * Set active state on bottom nav
   */
  setActiveNav(viewName) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });
  }
};

// Make router available globally for onclick handlers
window.router = router;
