/**
 * equipment.js - Equipment options for onboarding
 */

export const EQUIPMENT_CATEGORIES = [
  {
    id: 'weights',
    name: 'Free Weights',
    icon: '🏋️',
    items: [
      { id: 'dumbbells-light', name: 'Light dumbbells (1-5kg)' },
      { id: 'dumbbells-medium', name: 'Medium dumbbells (6-12kg)' },
      { id: 'dumbbells-heavy', name: 'Heavy dumbbells (13kg+)' },
      { id: 'kettlebell-light', name: 'Light kettlebell (4-8kg)' },
      { id: 'kettlebell-medium', name: 'Medium kettlebell (10-16kg)' },
      { id: 'kettlebell-heavy', name: 'Heavy kettlebell (18kg+)' },
      { id: 'barbell', name: 'Barbell + plates' }
    ]
  },
  {
    id: 'bands',
    name: 'Resistance Bands',
    icon: '🎗️',
    items: [
      { id: 'band-light', name: 'Light resistance band' },
      { id: 'band-medium', name: 'Medium resistance band' },
      { id: 'band-heavy', name: 'Heavy resistance band' },
      { id: 'mini-bands', name: 'Mini/loop bands' }
    ]
  },
  {
    id: 'cardio',
    name: 'Cardio Equipment',
    icon: '🚴',
    items: [
      { id: 'treadmill', name: 'Treadmill' },
      { id: 'exercise-bike', name: 'Exercise bike' },
      { id: 'rowing-machine', name: 'Rowing machine' },
      { id: 'skipping-rope', name: 'Skipping rope' }
    ]
  },
  {
    id: 'home',
    name: 'Home Basics',
    icon: '🏠',
    items: [
      { id: 'yoga-mat', name: 'Yoga/exercise mat' },
      { id: 'foam-roller', name: 'Foam roller' },
      { id: 'pull-up-bar', name: 'Pull-up bar' },
      { id: 'stability-ball', name: 'Stability/Swiss ball' },
      { id: 'bench', name: 'Workout bench' }
    ]
  },
  {
    id: 'recovery',
    name: 'Recovery Tools',
    icon: '💆',
    items: [
      { id: 'massage-gun', name: 'Massage gun' },
      { id: 'lacrosse-ball', name: 'Lacrosse/massage ball' },
      { id: 'stretching-strap', name: 'Stretching strap' }
    ]
  }
];

/**
 * Get all equipment items as flat array
 */
export function getAllEquipmentItems() {
  return EQUIPMENT_CATEGORIES.flatMap(cat => cat.items);
}

/**
 * Get equipment item by ID
 */
export function getEquipmentItem(id) {
  return getAllEquipmentItems().find(item => item.id === id);
}

/**
 * Count items selected in a category
 */
export function countInCategory(categoryId, selectedIds) {
  const category = EQUIPMENT_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return 0;
  return category.items.filter(item => selectedIds.includes(item.id)).length;
}
