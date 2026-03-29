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
    this.registerServiceWorker();
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/alongside-app/sw.js', { scope: '/alongside-app/' })
          .then(reg => {
            console.log('SW registered, scope:', reg.scope);
          })
          .catch(err => {
            console.warn('SW registration failed:', err);
          });
      });
    }
  }
};

// Make App available globally
window.App = App;

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
