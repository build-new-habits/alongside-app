/**
 * equipment.js - Onboarding Step 8: Equipment selection
 */

import { store } from '../../store.js';
import { EQUIPMENT_CATEGORIES, countInCategory } from '../../data/equipment.js';

export const centered = false;

export function render() {
  const selectedEquipment = store.get('equipment') || [];
  
  const categoriesHtml = EQUIPMENT_CATEGORIES.map(cat => {
    const count = countInCategory(cat.id, selectedEquipment);
    
    return `
      <div class="equipment-category">
        <button class="category-header" onclick="toggleEquipmentCategory('${cat.id}')">
          <span class="category-icon">${cat.icon}</span>
          <span class="category-name">${cat.name}</span>
          <span class="category-count" id="count-${cat.id}">${count > 0 ? count : ''}</span>
          <span class="category-chevron">▼</span>
        </button>
        <div class="category-items" id="category-${cat.id}">
          ${cat.items.map(item => `
            <button class="equipment-item ${selectedEquipment.includes(item.id) ? 'selected' : ''}"
                    data-item="${item.id}"
                    onclick="toggleEquipmentItem('${item.id}')">
              <span class="item-check">${selectedEquipment.includes(item.id) ? '✓' : ''}</span>
              <span class="item-name">${item.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
  
  return `
    <div class="onboarding-view">
      <div class="onboarding-header">
        <button class="btn btn-ghost" onclick="router.navigate('onboarding/lifestyle')">← Back</button>
        <div class="progress-dots">
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot active"></span>
        </div>
      </div>
      
      <div class="onboarding-content">
        <h1>What equipment do you have?</h1>
        <p class="text-secondary">I'll only suggest exercises you can actually do.</p>
        
        <div class="equipment-categories">
          ${categoriesHtml}
        </div>
        
        <div class="bodyweight-option" style="margin-top: var(--space-4);">
          <button class="btn-card ${selectedEquipment.length === 0 ? 'selected' : ''}"
                  id="bodyweight-btn"
                  onclick="setBodyweightOnly()">
            <span class="goal-icon">🏠</span>
            <span class="goal-text">Just bodyweight - no equipment</span>
          </button>
        </div>
      </div>
      
      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" onclick="saveEquipment()">
          Finish setup
        </button>
        <p class="text-sm text-secondary text-center" id="equipment-count" style="margin-top: var(--space-3);">
          ${selectedEquipment.length} items selected
        </p>
      </div>
    </div>
  `;
}

// Global functions
window.toggleEquipmentCategory = function(categoryId) {
  const items = document.getElementById(`category-${categoryId}`);
  const header = items.previousElementSibling;
  
  items.classList.toggle('expanded');
  header.classList.toggle('expanded');
};

window.toggleEquipmentItem = function(itemId) {
  const equipment = store.get('equipment') || [];
  const index = equipment.indexOf(itemId);
  
  if (index > -1) {
    equipment.splice(index, 1);
  } else {
    equipment.push(itemId);
  }
  
  store.set('equipment', equipment);
  
  // Update item UI
  const btn = document.querySelector(`[data-item="${itemId}"]`);
  if (btn) {
    btn.classList.toggle('selected');
    btn.querySelector('.item-check').textContent = equipment.includes(itemId) ? '✓' : '';
  }
  
  // Update category counts
  EQUIPMENT_CATEGORIES.forEach(cat => {
    const count = countInCategory(cat.id, equipment);
    const countEl = document.getElementById(`count-${cat.id}`);
    if (countEl) countEl.textContent = count > 0 ? count : '';
  });
  
  // Update total count
  const totalCount = document.getElementById('equipment-count');
  if (totalCount) totalCount.textContent = `${equipment.length} items selected`;
  
  // Deselect bodyweight option
  document.getElementById('bodyweight-btn')?.classList.remove('selected');
};

window.setBodyweightOnly = function() {
  store.set('equipment', []);
  
  // Update all equipment items UI
  document.querySelectorAll('.equipment-item').forEach(btn => {
    btn.classList.remove('selected');
    btn.querySelector('.item-check').textContent = '';
  });
  
  // Update category counts
  document.querySelectorAll('[id^="count-"]').forEach(el => el.textContent = '');
  
  // Select bodyweight option
  document.getElementById('bodyweight-btn')?.classList.add('selected');
  
  // Update total count
  const totalCount = document.getElementById('equipment-count');
  if (totalCount) totalCount.textContent = '0 items selected';
};

window.saveEquipment = function() {
  store.completeOnboarding();
  router.navigate('onboarding/complete');
};
