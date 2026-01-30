/**
 * settings.js - Settings view
 */

import { store } from '../store.js';
import { getGoalName } from '../data/goals.js';
import { getConditionName } from '../data/conditions.js';

export const centered = false;

export function render() {
  const name = store.get('name');
  const age = store.get('age');
  const gender = store.get('gender');
  const weight = store.get('weight');
  const weightUnit = store.get('weightUnit') || 'kg';
  const goals = store.get('goals') || [];
  const conditions = store.get('conditions') || [];
  const equipment = store.get('equipment') || [];
  
  return `
    <div class="view">
      <div class="view-header">
        <h1>Settings</h1>
      </div>
      
      <div class="card-list">
        <div class="card">
          <h3>Profile</h3>
          <p class="text-sm text-secondary">Name: ${name || 'Not set'}</p>
          <p class="text-sm text-secondary">Age: ${age || 'Not set'}</p>
          <p class="text-sm text-secondary">Gender: ${gender || 'Not set'}</p>
          <p class="text-sm text-secondary">Weight: ${weight ? weight + weightUnit : 'Not set'}</p>
        </div>
        
        <div class="card">
          <h3>Goals</h3>
          <p class="text-sm text-secondary">${goals.map(g => getGoalName(g)).join(', ') || 'None set'}</p>
        </div>
        
        <div class="card">
          <h3>Conditions</h3>
          <p class="text-sm text-secondary">${conditions.map(c => getConditionName(c)).join(', ') || 'None'}</p>
        </div>
        
        <div class="card">
          <h3>Equipment</h3>
          <p class="text-sm text-secondary">${equipment.length > 0 ? equipment.length + ' items' : 'Bodyweight only'}</p>
        </div>
        
        <button class="btn btn-danger btn-full" onclick="resetApp()" style="margin-top: var(--space-4);">
          Reset App (Start Over)
        </button>
      </div>
    </div>
  `;
}

window.resetApp = function() {
  if (confirm('This will delete all your data and start fresh. Are you sure?')) {
    store.reset();
    document.getElementById('bottom-nav').classList.add('hidden');
    router.navigate('onboarding/welcome');
  }
};
```

---

## Summary: Complete File List

| # | Path | Purpose |
|---|------|---------|
| 1 | `js/store.js` | Data persistence |
| 2 | `js/router.js` | Navigation |
| 3 | `js/app.js` | Entry point (tiny) |
| 4 | `js/data/goals.js` | Goal options |
| 5 | `js/data/conditions.js` | Condition options |
| 6 | `js/data/equipment.js` | Equipment options |
| 7 | `js/views/onboarding/welcome.js` | Step 1 |
| 8 | `js/views/onboarding/name.js` | Step 2 |
| 9 | `js/views/onboarding/about.js` | Step 3 |
| 10 | `js/views/onboarding/body.js` | Step 4 |
| 11 | `js/views/onboarding/goals.js` | Step 5 |
| 12 | `js/views/onboarding/conditions.js` | Step 6 |
| 13 | `js/views/onboarding/lifestyle.js` | Step 7 |
| 14 | `js/views/onboarding/equipment.js` | Step 8 |
| 15 | `js/views/onboarding/complete.js` | Step 9 |
| 16 | `js/views/today.js` | Today view |
| 17 | `js/views/progress.js` | Progress view |
| 18 | `js/views/settings.js` | Settings view |

---

## Folder Structure to Create
```
js/
├── app.js
├── store.js
├── router.js
├── data/
│   ├── goals.js
│   ├── conditions.js
│   └── equipment.js
└── views/
    ├── today.js
    ├── progress.js
    ├── settings.js
    └── onboarding/
        ├── welcome.js
        ├── name.js
        ├── about.js
        ├── body.js
        ├── goals.js
        ├── conditions.js
        ├── lifestyle.js
        ├── equipment.js
        └── complete.js
