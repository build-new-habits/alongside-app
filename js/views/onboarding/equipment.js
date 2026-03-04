/**
 * equipment.js - Onboarding Step 8: Equipment selection
 * Uses modal pop-out for each category
 */

import { store } from '../../store.js';
import { EQUIPMENT_CATEGORIES, countInCategory } from '../../data/equipment.js';

export const centered = false;

// Track which modal is open
let openModalId = null;

export function render() {
  const selectedEquipment = store.get('equipment') || [];
  
  const categoriesHtml = EQUIPMENT_CATEGORIES.map(cat => {
    const count = countInCategory(cat.id, selectedEquipment);
    const hasItems = count > 0;
    
    return `
      <button class="equipment-category-card ${hasItems ? 'has-items' : ''}" 
              onclick="openEquipmentModal('${cat.id}')">
        <div class="category-card-icon">${cat.icon}</div>
        <div class="category-card-content">
          <div class="category-card-name">${cat.name}</div>
          <div class="category-card-desc">${cat.description}</div>
        </div>
        <div class="category-card-badge ${hasItems ? 'visible' : ''}">${count}</div>
        <div class="category-card-chevron">›</div>
      </button>
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
        <p class="text-secondary">Tap each category to select your equipment. I'll only suggest exercises you can actually do.</p>
        
        <div class="equipment-category-list">
          ${categoriesHtml}
        </div>
        
        <div class="bodyweight-note">
          <p class="text-sm text-muted">💡 No equipment? No problem! Bodyweight exercises are powerful and effective.</p>
        </div>
      </div>
      
      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" onclick="saveEquipment()">
          ${selectedEquipment.length > 0 ? 'Finish setup' : 'Continue with bodyweight only'}
        </button>
        <p class="text-sm text-secondary text-center" id="equipment-total" style="margin-top: var(--space-3);">
          ${selectedEquipment.length} items selected
        </p>
      </div>
    </div>
    
    <!-- Modal container -->
    <div id="equipment-modal" class="equipment-modal hidden" onclick="closeModalOnBackdrop(event)">
      <div class="equipment-modal-content" onclick="event.stopPropagation()">
        <div class="equipment-modal-header">
          <h2 id="modal-title">Category</h2>
          <button class="modal-close-btn" onclick="closeEquipmentModal()">✕</button>
        </div>
        <div class="equipment-modal-body" id="modal-items">
          <!-- Items inserted here -->
        </div>
        <div class="equipment-modal-footer">
          <button class="btn btn-primary btn-full" onclick="closeEquipmentModal()">Done</button>
        </div>
      </div>
    </div>
  `;
}

export function onMount() {
  // Nothing special needed on mount
}

// ============================================
// MODAL FUNCTIONS
// ============================================

window.openEquipmentModal = function(categoryId) {
  const category = EQUIPMENT_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return;
  
  openModalId = categoryId;
  const selectedEquipment = store.get('equipment') || [];
  
  // Set modal title
  document.getElementById('modal-title').textContent = category.name;
  
  // Build items HTML
  const itemsHtml = category.items.map(item => {
    const isSelected = selectedEquipment.includes(item.id);
    return `
      <button class="equipment-item-card ${isSelected ? 'selected' : ''}" 
              data-item="${item.id}"
              onclick="toggleEquipmentItem('${item.id}')">
        <span class="item-checkbox">${isSelected ? '✓' : ''}</span>
        <span class="item-name">${item.name}</span>
      </button>
    `;
  }).join('');
  
  document.getElementById('modal-items').innerHTML = itemsHtml;
  
  // Show modal with animation
  const modal = document.getElementById('equipment-modal');
  modal.classList.remove('hidden');
  requestAnimationFrame(() => {
    modal.classList.add('visible');
  });
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
};

window.closeEquipmentModal = function() {
  const modal = document.getElementById('equipment-modal');
  modal.classList.remove('visible');
  
  setTimeout(() => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    openModalId = null;
    
    // Update the category card to show new count
    updateCategoryCards();
  }, 300);
};

window.closeModalOnBackdrop = function(event) {
  if (event.target.id === 'equipment-modal') {
    closeEquipmentModal();
  }
};

window.toggleEquipmentItem = function(itemId) {
  const equipment = [...(store.get('equipment') || [])];
  const index = equipment.indexOf(itemId);
  
  if (index > -1) {
    equipment.splice(index, 1);
  } else {
    equipment.push(itemId);
  }
  
  store.set('equipment', equipment);
  
  // Update item UI in modal
  const itemCard = document.querySelector(`[data-item="${itemId}"]`);
  if (itemCard) {
    itemCard.classList.toggle('selected');
    const checkbox = itemCard.querySelector('.item-checkbox');
    checkbox.textContent = equipment.includes(itemId) ? '✓' : '';
  }
  
  // Update total count in footer
  updateTotalCount();
};

function updateCategoryCards() {
  const selectedEquipment = [...(store.get('equipment') || [])];
  
  EQUIPMENT_CATEGORIES.forEach(cat => {
    const count = countInCategory(cat.id, selectedEquipment);
    const card = document.querySelector(`[onclick="openEquipmentModal('${cat.id}')"]`);
    
    if (card) {
      const badge = card.querySelector('.category-card-badge');
      const hasItems = count > 0;
      
      badge.textContent = count;
      badge.classList.toggle('visible', hasItems);
      card.classList.toggle('has-items', hasItems);
    }
  });
  
  updateTotalCount();
  updateButtonText();
}

function updateTotalCount() {
  const selectedEquipment = store.get('equipment') || [];
  const totalEl = document.getElementById('equipment-total');
  if (totalEl) {
    totalEl.textContent = `${selectedEquipment.length} items selected`;
  }
}

function updateButtonText() {
  const selectedEquipment = store.get('equipment') || [];
  const btn = document.querySelector('.onboarding-actions .btn-primary');
  if (btn) {
    btn.textContent = selectedEquipment.length > 0 ? 'Finish setup' : 'Continue with bodyweight only';
  }
}

window.saveEquipment = function() {
  store.completeOnboarding();
  router.navigate('onboarding/complete');
};
