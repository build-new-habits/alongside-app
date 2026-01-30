/**
 * app.js - Application entry point
 * Just initialises the store and router
 */

import { store } from './store.js';
import { router } from './router.js';

const App = {
  store,
  router,
  
  init() {
    console.log('🌿 Alongside starting...');
    store.init();
    router.init();
    console.log('🌿 Alongside ready');
  }
};

// Make App available globally
window.App = App;

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
