/**
 * name.js - Onboarding Step 2: Name input
 */

import { store } from '../../store.js';

export const centered = false;

export function render() {
  const name = store.get('name') || '';
  
  return `
    <div class="onboarding-view">
      <div class="onboarding-header">
        <button class="btn btn-ghost" onclick="router.navigate('onboarding/welcome')">← Back</button>
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
            value="${name}"
          >
        </div>
      </div>
      
      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" onclick="saveName()">
          Continue
        </button>
      </div>
    </div>
  `;
}

export function onMount() {
  // Focus the input
  setTimeout(() => {
    const input = document.getElementById('user-name');
    if (input) input.focus();
  }, 100);
  
  // Handle Enter key
  document.getElementById('user-name').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveName();
  });
}

// Make save function available globally
window.saveName = function() {
  const input = document.getElementById('user-name');
  const name = input.value.trim();
  
  if (!name) {
    input.focus();
    input.classList.add('error');
    return;
  }
  
  store.set('name', name);
  router.navigate('onboarding/about');
};
