/**
 * equipment.js - Equipment options for onboarding
 * Organised by category for modal selection
 *
 * 13 Oct 2026 v2
 *
 * v2 - HOME-BANDS. The band chips say which band is which, because the
 *   two do different jobs (equipment-map.js v4): "Long band" for light,
 *   medium and heavy, "Short loop band" for the mini band, and the pull-up
 *   assist band named as the long loop it is. Ids unchanged, so nobody's
 *   saved kit moves. verify-home-bands TEST 6.
 *
 * v1 - first dated header; the file carried none before this.
 */

export const EQUIPMENT_CATEGORIES = [
  {
    id: 'weights',
    name: 'Free Weights',
    icon: '🏋️',
    description: 'Dumbbells, kettlebells, barbells',
    items: [
      { id: 'dumbbells-light', name: 'Light dumbbells (1-5kg / 2-10lbs)' },
      { id: 'dumbbells-medium', name: 'Medium dumbbells (6-12kg / 12-25lbs)' },
      { id: 'dumbbells-heavy', name: 'Heavy dumbbells (13kg+ / 28lbs+)' },
      { id: 'adjustable-dumbbells', name: 'Adjustable dumbbells' },
      { id: 'kettlebell-light', name: 'Light kettlebell (4-8kg)' },
      { id: 'kettlebell-medium', name: 'Medium kettlebell (10-16kg)' },
      { id: 'kettlebell-heavy', name: 'Heavy kettlebell (18kg+)' },
      { id: 'barbell', name: 'Barbell + weight plates' },
      { id: 'ez-curl-bar', name: 'EZ curl bar' },
      { id: 'medicine-ball', name: 'Medicine ball' },
      { id: 'slam-ball', name: 'Slam ball' },
      { id: 'ankle-weights', name: 'Ankle weights' },
      { id: 'weighted-vest', name: 'Weighted vest' },
      { id: 'cable-machine', name: 'Cable machine' },
      { id: 'leg-press-machine', name: 'Leg press machine' },
      { id: 'leg-curl-machine', name: 'Leg curl machine' },
      { id: 'chest-press-machine', name: 'Chest press machine' }
    ]
  },
  {
    id: 'bands',
    name: 'Resistance Bands',
    icon: '🎗️',
    description: 'Long bands, short loop bands, therapy bands',
    items: [
      { id: 'band-light', name: 'Long band, light' },
      { id: 'band-medium', name: 'Long band, medium' },
      { id: 'band-heavy', name: 'Long band, heavy' },
      { id: 'mini-bands', name: 'Short loop band (worn round the legs)' },
      { id: 'therapy-band', name: 'Therapy band (flat)' },
      { id: 'pull-up-assist', name: 'Pull-up assist band (long loop)' }
    ]
  },
  {
    id: 'cardio',
    name: 'Cardio Equipment',
    icon: '🚴',
    description: 'Bikes, rowers, treadmills',
    items: [
      { id: 'treadmill', name: 'Treadmill' },
      { id: 'exercise-bike', name: 'Exercise/spin bike' },
      { id: 'rowing-machine', name: 'Rowing machine' },
      { id: 'elliptical', name: 'Elliptical/cross trainer' },
      { id: 'stair-climber', name: 'Stair climber' },
      { id: 'ski-erg', name: 'Ski erg' },
      { id: 'skipping-rope', name: 'Skipping rope' },
      { id: 'outdoor-bike', name: 'Outdoor bike' },
      { id: 'air-bike', name: 'Air bike (Assault/Echo)' }
    ]
  },
  {
    id: 'home',
    name: 'Home Basics',
    icon: '🏠',
    description: 'Mat, bench, pull-up bar',
    items: [
      { id: 'yoga-mat', name: 'Yoga/exercise mat' },
      { id: 'bench-flat', name: 'Flat workout bench' },
      { id: 'bench-adjustable', name: 'Adjustable bench (incline/decline)' },
      { id: 'pull-up-bar', name: 'Pull-up bar' },
      { id: 'dip-station', name: 'Dip station/bars' },
      { id: 'stability-ball', name: 'Stability/Swiss ball' },
      { id: 'bosu-ball', name: 'BOSU ball' },
      { id: 'plyo-box', name: 'Plyo/jump box' },
      { id: 'step-platform', name: 'Aerobic step platform' },
      { id: 'ab-wheel', name: 'Ab wheel' },
      { id: 'sit-up-frame', name: 'Sit-up frame' },
      { id: 'parallettes', name: 'Parallettes' }
    ]
  },
  {
    id: 'functional',
    name: 'Functional Training',
    icon: '💪',
    description: 'TRX, ropes, bags',
    items: [
      { id: 'trx', name: 'TRX/suspension trainer' },
      { id: 'battle-ropes', name: 'Battle ropes' },
      { id: 'gymnastic-rings', name: 'Gymnastic rings' },
      { id: 'punching-bag', name: 'Punching bag' },
      { id: 'speed-bag', name: 'Speed bag' },
      { id: 'boxing-gloves', name: 'Boxing gloves + pads' },
      { id: 'sandbag', name: 'Sandbag' },
      { id: 'landmine', name: 'Landmine attachment' },
      { id: 'sled', name: 'Sled or prowler' },
      // EQUIP-5, 12 Aug 2026. Deep sweep. These three were REQUIRED by
      // exercises and existed nowhere in the catalogue, so nobody could
      // ever tick them and six exercises were permanently unreachable --
      // agility-ladder (4), nordic-walking-poles (1), reaction-ball (1).
      // Found by resolving the entire catalogue and diffing it against
      // every equipment tag the database requires, which is the check
      // that should have existed from the start.
      { id: 'agility-ladder', name: 'Agility ladder' },
      { id: 'agility-cones', name: 'Agility cones/markers' },
      { id: 'reaction-ball', name: 'Reaction ball' },
      { id: 'nordic-walking-poles', name: 'Nordic walking poles' }
    ]
  },
  {
    id: 'balance',
    name: 'Balance & Stability',
    icon: '⚖️',
    description: 'Boards, pads, discs',
    items: [
      { id: 'balance-board', name: 'Balance board' },
      { id: 'wobble-cushion', name: 'Wobble cushion/disc' },
      { id: 'balance-pad', name: 'Balance pad (foam)' },
      { id: 'indo-board', name: 'Indo board' },
      { id: 'slackline', name: 'Slackline' }
    ]
  },
  {
    id: 'recovery',
    name: 'Recovery Tools',
    icon: '💆',
    description: 'Rollers, massage, stretch',
    items: [
      { id: 'foam-roller', name: 'Foam roller' },
      { id: 'massage-gun', name: 'Massage gun' },
      { id: 'lacrosse-ball', name: 'Lacrosse/massage ball' },
      { id: 'peanut-ball', name: 'Peanut massage ball' },
      { id: 'stretching-strap', name: 'Stretching strap' },
      { id: 'yoga-blocks', name: 'Yoga blocks' },
      { id: 'yoga-wheel', name: 'Yoga wheel' },
      { id: 'percussion-massager', name: 'Handheld massager' }
    ]
  },
  {
    id: 'facility',
    name: 'Facility Access',
    icon: '🏢',
    description: 'Gym, pool, studio',
    items: [
      { id: 'gym-membership', name: 'Gym membership' },
      { id: 'swimming-pool', name: 'Swimming pool access' },
      { id: 'sauna-steam', name: 'Sauna/steam room' },
      { id: 'fitness-studio', name: 'Fitness studio/classes' },
      { id: 'outdoor-track', name: 'Outdoor running track' }

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
 * Get equipment item name by ID
 */
export function getEquipmentName(id) {
  const item = getEquipmentItem(id);
  return item ? item.name : id;
}

/**
 * Get category by ID
 */
export function getCategory(id) {
  return EQUIPMENT_CATEGORIES.find(cat => cat.id === id);
}

/**
 * Count items selected in a category
 */
export function countInCategory(categoryId, selectedIds) {
  const category = EQUIPMENT_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return 0;
  return category.items.filter(item => selectedIds.includes(item.id)).length;
}

/**
 * Get all selected items grouped by category
 */
export function getSelectedByCategory(selectedIds) {
  const result = {};
  EQUIPMENT_CATEGORIES.forEach(cat => {
    const items = cat.items.filter(item => selectedIds.includes(item.id));
    if (items.length > 0) {
      result[cat.id] = items;
    }
  });
  return result;
}
