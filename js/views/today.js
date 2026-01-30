/**
 * today.js - Daily view (placeholder for now)
 */

import { store } from '../store.js';

export const centered = false;

export function render() {
  const name = store.get('name') || 'there';
  const age = store.get('age');
  const weight = store.get('weight');
  const weightUnit = store.get('weightUnit') || 'kg';
  const goals = store.get('goals') || [];
  const conditions = store.get('conditions') || [];
  const equipment = store.get('equipment') || [];
  
  const greeting = getTimeGreeting();
  
  return `
    <div class="view">
      <div class="view-header">
        <h1>${greeting}, ${name} 👋</h1>
        <p class="text-secondary">Let's check in and see what feels right today.</p>
      </div>
      
      <div class="card card-coach">
        <p><strong>Daily check-in coming soon!</strong></p>
        <p class="text-secondary">This is where you'll tell me how you're feeling, and I'll suggest workouts that match your energy.</p>
      </div>
      
      <div class="card" style="margin-top: var(--space-4);">
        <h3>Your profile summary</h3>
        <p class="text-sm text-secondary">Age: ${age || 'Not set'}</p>
        <p class="text-sm text-secondary">Weight: ${weight ? weight + weightUnit : 'Not set'}</p>
        <p class="text-sm text-secondary">Goals: ${goals.length} selected</p>
        <p class="text-sm text-secondary">Conditions: ${conditions.length} tracked</p>
        <p class="text-sm text-secondary">Equipment: ${equipment.length} items</p>
      </div>
    </div>
  `;
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
