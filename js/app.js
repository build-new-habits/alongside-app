/**
 * app.js - Application entry point
 * Just initialises the store and router
 */

import { store } from './store.js';
import { router } from './router.js';

// ── PWA install prompt ────────────────────────────────────────────────────────
// Captured here at the earliest possible moment.
// Stored globally so settings.js and any install button can trigger it.
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); // Stop the browser showing its own mini-infobar
  deferredInstallPrompt = e;
  console.log('PWA: install prompt captured');
  // Notify any open view that install is available
  document.dispatchEvent(new CustomEvent('pwa-installable'));
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  console.log('PWA: app installed');
  document.dispatchEvent(new CustomEvent('pwa-installed'));
});

// Exposed globally so settings.js install button can call it
window.triggerPWAInstall = async function() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  console.log('PWA: user choice:', outcome);
  deferredInstallPrompt = null;
};

window.isPWAInstallable = function() {
  return !!deferredInstallPrompt;
};

window.isPWAInstalled = function() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
};

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
