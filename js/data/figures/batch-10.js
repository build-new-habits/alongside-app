/**
 * js/data/figures/batch-10.js
 * 04 Oct 2026 v1
 *
 * D-4 FIGURES, batch 10: recovery and pilates (breathing practices, foam
 * rolling, rest and sleep positions, walks, heat and cold, and the mat
 * pilates repertoire and its sequences).
 * The format is described in js/figures.js.
 */

// Sitting upright on a chair, hands resting on the thighs.
const SIT = { hip: [70, 150], t: 180, nl: [90, 0, 90], fl: [88, 0, 90], na: [34, 34], fa: [30, 32] };
const CHAIR = { chair: [44, 152] };
// Sitting on a chair, one hand on the belly and one on the chest.
const SIT_HANDS = { hip: [70, 150], t: 180, nl: [90, 0, 90], fl: [88, 0, 90], na: [-34.1, 71], fa: [-37.1, 114.4] };
// Lying on the back, knees bent, feet flat.
const HOOK = { hip: [104, 178], t: -90, h: -95, nl: [140, 10, 90], fl: [136, 8, 90] };
// Lying flat on the back, legs long, arms by the sides.
const FLAT = { hip: [104, 178], t: -90, h: -95, nl: [90, 90, 160], fl: [91, 91, 162], na: [92, 92], fa: [93, 93] };
// Walking at an easy pace.
const WALK = { hip: [84, 115.2], t: 180, nl: [22, 8, 90], fl: [-18, -30, 74], na: [-18, -8], fa: [20, 32] };
// Pilates curl: lower back on the mat, head and shoulders lifted.
const CURL = { hip: [112, 178], t: -110, h: -138 };
// A shower: pipe from above, the head, falling water.
const SHOWER = [{ far: [[150, 10, 150, 16, 112, 16, 112, 22], [102, 24, 122, 24], [104, 28, 100, 34], [112, 28, 112, 34], [120, 28, 124, 34]] }];

export const FIGURES_10 = {
  // ── Stretches, rolling, rest ──────────────────────────────────────
  "supine-twist": { w: 190, f: [
    { l: "Hold, then swap sides", g: "none", a: "Seen from above: lying on the back, arms stretched out to the sides in a T, both knees bent and dropped together to one side.",
      p: { v: "front", hip: [112, 100], t: -90, h: -90, la: [0, 0], ra: [180, 180], ll: [16, 92, 90], rl: [10, 90, 90], pale: ["rl"] } },
  ] },
  "foam-roll-upper-back": { w: 180, f: [
    { l: "Roll slowly up and down", g: "mat", a: "Lying on the back with a foam roller across the upper back just below the shoulder blades, hands supporting the head, knees bent and feet flat on the floor, hips just off the floor.",
      p: { hip: [104, 172], t: -103, h: -98, nl: [128, 12, 90], fl: [124, 10, 90], na: [167.1, -47], fa: [164, -50] },
      x: [{ ball: [66, 179, 9] }] },
  ] },
  "foam-roll-quads": { w: 200, f: [
    { l: "Roll from knee to hip", g: "mat", a: "Lying face down propped on the forearms, a foam roller under the front of one thigh, the legs long behind.",
      p: { hip: [92, 166], t: -106, h: -118, nl: [80, 85, 40], fl: [82, 86, 40], na: [0, -90], fa: [2, -88] },
      x: [{ ball: [112, 178, 8] }] },
  ] },
  "leg-up-wall": { w: 190, f: [
    { l: "Rest and breathe", g: "mat", a: "Lying on the back, hips close to a wall, both legs resting straight up the wall, arms relaxed by the sides on the floor.",
      p: { hip: [148, 178], t: -90, h: -95, nl: [180, 180, 180], fl: [178, 178, 178], na: [96, 60], fa: [98, 62] },
      x: [{ wall: 156 }] },
  ] },
  "elevation-recovery": { w: 190, f: [
    { l: "Legs up, 10 minutes", g: "mat", a: "Lying on the back with both legs resting straight up a wall, raised above the heart, feet pointing to the ceiling, arms relaxed by the sides.",
      p: { hip: [148, 178], t: -90, h: -95, nl: [180, 180, 180], fl: [178, 178, 178], na: [96, 60], fa: [98, 62] },
      x: [{ wall: 156 }] },
  ] },
  "trigger-point-release-ball": { w: 160, f: [
    { l: "Lean into the ball", a: "Standing with the back to a wall, feet a little forward, a massage ball pressed between the upper back and the wall, knees slightly bent, arms relaxed.",
      p: { hip: [60, 115], t: -175, h: -178, nl: [22, 4, 90], fl: [20, 2, 90], na: [4, 8], fa: [2, 6] },
      x: [{ wall: 42 }, { ball: [49, 82, 6] }] },
  ] },

  // ── Breathing ─────────────────────────────────────────────────────
  "diaphragmatic-breathing": { w: 180, f: [
    { l: "Breathe into the belly", g: "mat", a: "Lying on the back, knees bent, feet flat on the floor, one hand resting on the belly and the other on the chest.",
      p: HOOK, x: [{ body: [[58, 178, 76, 185, 90, 167]] }, { far: [[58, 178, 62, 186, 70, 167]] }] },
  ] },
  "box-breathing": { w: 160, f: [
    { l: "Sit comfortably", a: "Sitting comfortably upright on a chair, feet flat on the floor, hands resting on the thighs.",
      p: SIT, x: [CHAIR] },
  ] },
  "four-seven-eight-breathing": { w: 160, f: [
    { l: "Sit comfortably", a: "Sitting comfortably upright on a chair, feet flat on the floor, hands resting on the thighs.",
      p: SIT, x: [CHAIR] },
  ] },
  "physiological-sigh": { w: 160, f: [
    { l: "Sit, shoulders soft", a: "Sitting upright on a chair, shoulders relaxed, feet flat on the floor, hands resting on the thighs.",
      p: SIT, x: [CHAIR] },
  ] },
  "belly-breathing": { w: 160, f: [
    { l: "Hand on belly and chest", a: "Sitting upright on a chair, feet flat, one hand resting on the belly and the other on the chest.",
      p: SIT_HANDS, x: [CHAIR] },
  ] },
  "extended-exhale-breathing": { w: 160, f: [
    { l: "Sit tall, breathe out long", a: "Sitting on a chair with the spine upright, feet flat on the floor, hands resting on the thighs.",
      p: SIT, x: [CHAIR] },
  ] },
  "alternate-nostril-breathing": { w: 160, f: [
    { l: "Sit tall, hand to the nose", a: "Sitting tall on a chair, one hand resting on the knee, the other hand raised to the face with the thumb by the nostril.",
      p: { ...SIT, na: [67.7, 212.7], fa: [36, 36] }, x: [CHAIR] },
  ] },
  "pursed-lip-breathing": { w: 160, f: [
    { l: "Sit, shoulders relaxed", a: "Sitting comfortably on a chair, shoulders relaxed, feet flat on the floor, hands resting on the thighs.",
      p: SIT, x: [CHAIR] },
  ] },
  "coherent-breathing": { w: 160, f: [
    { l: "Sit and breathe evenly", a: "Sitting comfortably upright on a chair, feet flat on the floor, hands resting on the thighs.",
      p: SIT, x: [CHAIR] },
  ] },
  "humming-bee-breath": { w: 160, f: [
    { l: "Sit, eyes closed", a: "Sitting comfortably upright on a chair with the eyes closed, feet flat on the floor, hands resting on the thighs.",
      p: SIT, x: [CHAIR] },
  ] },
  "energising-breath": { w: 160, f: [
    { l: "Sit upright, spine tall", a: "Sitting upright on a chair with the spine tall, feet flat on the floor, hands resting on the thighs.",
      p: SIT, x: [CHAIR] },
  ] },
  "three-part-breath": { w: 160, f: [
    { l: "Belly, ribs, then chest", a: "Sitting tall on a chair, feet flat, one hand resting on the belly and the other on the chest.",
      p: SIT_HANDS, x: [CHAIR] },
  ] },
  "breath-counting": { w: 160, f: [
    { l: "Sit, eyes closed", a: "Sitting comfortably upright on a chair with the eyes closed, feet flat on the floor, hands resting on the thighs.",
      p: SIT, x: [CHAIR] },
  ] },

  // ── Heat, cold, rest, fuel ────────────────────────────────────────
  "cold-shower-protocol": { w: 160, f: [
    { l: "Stay under, breathe slowly", a: "Standing under a shower, arms relaxed by the sides, breathing slowly.",
      p: { hip: [96, 112], t: 180, nl: [0, 0, 90], fl: [2, 0, 90], na: [0, 4], fa: [4, 6] }, x: SHOWER },
  ] },
  "contrast-therapy": { w: 160, f: [
    { l: "Warm 3 minutes, cold 1", a: "Standing under a shower, arms relaxed by the sides, switching between warm and cold water and finishing cold.",
      p: { hip: [96, 112], t: 180, nl: [0, 0, 90], fl: [2, 0, 90], na: [0, 4], fa: [4, 6] }, x: SHOWER },
  ] },
  "sauna-protocol": { w: 160, f: [
    { l: "Sit, 15 to 20 minutes", a: "Sitting upright and relaxed on a sauna bench, feet flat on the floor, hands resting on the thighs.",
      p: SIT, x: [{ bench: [28, 100, 152] }] },
  ] },
  "napping-protocol": { w: 200, f: [
    { l: "Lie down, 20 minutes", g: "mat", a: "Lying on the back, resting, legs long and arms by the sides, head on a pillow.",
      p: FLAT, x: [{ box: [26, 182, 34, 6] }] },
  ] },
  "meditation-sleep-onset": { w: 200, f: [
    { l: "Lie still, relax from the feet", g: "mat", a: "Lying on the back in bed, eyes closed, legs long and arms resting by the sides, head on a pillow.",
      p: FLAT, x: [{ box: [26, 182, 34, 6] }] },
  ] },
  "sleep-position-optimisation": { w: 200, f: [
    { l: "On the side: pillow at knees", g: "mat", a: "Lying on one side, head on a pillow, knees bent, with a pillow between the knees to keep the hips level.",
      p: { hip: [100, 178], t: -90, h: -98, na: [95, 88] },
      x: [{ box: [22, 182, 34, 6] }, { box: [120, 173, 18, 11] }, { far: [[100, 184, 129, 186, 152, 186]] }, { body: [[100, 172, 129, 170, 152, 174]] }] },
    { l: "On the back: pillow under knees", g: "mat", a: "Lying on the back, head on a pillow, a small pillow under the knees so they are slightly bent, arms by the sides.",
      p: { hip: [104, 178], t: -90, h: -95, nl: [108, 72, 160], fl: [109, 73, 162], na: [92, 92] },
      x: [{ box: [26, 182, 34, 6] }, { box: [128, 170, 24, 18] }] },
  ] },
  "hydration-protocol": { w: 160, f: [
    { l: "Drink on a schedule", a: "Standing tall, drinking from a water bottle held up to the mouth.",
      p: { hip: [80, 112], t: 180, h: -172, nl: [0, 0, 90], fl: [2, 0, 90], na: [60, 200], fa: [2, 6] },
      x: [{ far: [[94, 54, 112, 40, 116, 45, 98, 59, 94, 54]] }] },
  ] },
  "nutrition-timing": { w: 160, f: [
    { l: "Eat within the hour", a: "Sitting on a chair, eating a meal from a bowl held in front of the chest.",
      p: { ...SIT, na: [30, 150], fa: [20, 120] }, x: [CHAIR, { far: [[86, 116, 90, 124, 106, 124, 110, 116, 86, 116]] }] },
  ] },

  // ── Walks ─────────────────────────────────────────────────────────
  "mindful-walk": { w: 160, f: [
    { l: "Walk at your own pace", a: "Walking upright at a relaxed pace, one foot stepping forward, arms swinging gently.",
      p: WALK },
  ] },
  "active-recovery-walk": { w: 160, f: [
    { l: "Easy pace, 30 minutes", a: "Walking upright at an easy, conversational pace, one foot stepping forward, arms swinging gently.",
      p: WALK },
  ] },

  // ── Pilates ───────────────────────────────────────────────────────
  "pilates-hundred": { w: 200, f: [
    { l: "Pump the arms, breathe", g: "mat", a: "Lying on the back with the head and shoulders curled off the mat, knees lifted to tabletop with the shins parallel to the floor, arms long by the sides just above the mat.",
      p: { ...CURL, nl: [180, 90, 100], fl: [176, 88, 100], na: [97, 93], fa: [99, 95] } },
  ] },
  "pilates-roll-up": { w: 200, f: [
    { l: "Lie long, arms overhead", g: "mat", a: "Lying flat on the back, legs straight, arms stretched overhead.",
      p: { hip: [108, 178], t: -90, h: -95, nl: [90, 90, 165], fl: [91, 91, 167], na: [-98, -98], fa: [-100, -100] } },
    { l: "Curl up, fold forward", g: "mat", a: "Rolled up through the spine to sitting and folded forward over the straight legs, arms reaching towards the feet.",
      p: { hip: [62, 180], t: 140, h: 122, bend: [-4, -5], nl: [90, 90, 165], fl: [91, 91, 167], na: [100, 96], fa: [102, 98] },
      x: [{ mvq: [24, 160, 26, 120, 52, 106] }] },
  ] },
  "pilates-single-leg-stretch": { w: 200, f: [
    { l: "One knee in, one leg long", g: "mat", a: "Head and shoulders curled off the mat, one knee drawn to the chest with the hands on the shin, the other leg stretched long at about 45 degrees.",
      p: { ...CURL, nl: [-155, 100, 90], fl: [135, 135, 135], na: [140.9, 89.8], fa: [143, 92] } },
    { l: "Switch legs", g: "mat", a: "The legs swapped: the other knee drawn in with the hands on that shin, the first leg now stretched long; the lower back stays pressed to the mat.",
      p: { ...CURL, nl: [135, 135, 135], fl: [-155, 100, 90], na: [140.9, 89.8], fa: [143, 92] },
      x: [{ mvq: [146, 108, 160, 104, 172, 112] }] },
  ] },
  "pilates-double-leg-stretch": { w: 200, f: [
    { l: "Knees in, hands on shins", g: "mat", a: "Head and shoulders curled off the mat, both knees drawn to the chest, hands on the shins.",
      p: { ...CURL, nl: [-155, 100, 90], fl: [-158, 98, 90], na: [140.9, 89.8], fa: [143, 92] } },
    { l: "Reach arms and legs long", g: "mat", a: "Upper body still curled, both arms stretched overhead and both legs stretched out at about 45 degrees.",
      p: { ...CURL, nl: [135, 135, 135], fl: [133, 133, 133], na: [-128, -128], fa: [-132, -132] },
      x: [{ mv: [52, 112, 30, 128] }, { mv: [150, 112, 172, 100] }] },
  ] },
  "pilates-scissors": { w: 200, f: [
    { l: "Both legs to the ceiling", g: "mat", a: "Head and shoulders curled off the mat, both legs straight up towards the ceiling, arms long by the sides.",
      p: { ...CURL, nl: [180, 180, 180], fl: [178, 178, 178], na: [97, 93], fa: [99, 95] } },
    { l: "Lower one, then switch", g: "mat", a: "One straight leg lowered towards the floor while the other stays up towards the ceiling; head and shoulders stay curled.",
      p: { ...CURL, nl: [122, 122, 122], fl: [-176, -176, -176], na: [97, 93], fa: [99, 95] },
      x: [{ mvq: [140, 92, 166, 96, 176, 120] }] },
  ] },
  "pilates-criss-cross": { w: 200, f: [
    { l: "Turn towards one knee", g: "mat", a: "Hands behind the head, head and shoulders curled off the mat, turning the upper body towards one knee drawn in while the other leg stretches out long.",
      p: { ...CURL, nl: [-155, 100, 90], fl: [135, 135, 135], na: [150, -71], fa: [146, -74] } },
    { l: "Switch sides", g: "mat", a: "The legs swapped and the upper body turned towards the other knee, elbows wide, hands still behind the head.",
      p: { ...CURL, nl: [135, 135, 135], fl: [-155, 100, 90], na: [150, -71], fa: [146, -74] },
      x: [{ mvq: [146, 108, 160, 104, 172, 112] }] },
  ] },
  "pilates-swan": { w: 200, f: [
    { l: "Start", g: "mat", a: "Lying face down, legs long, hands on the floor under the shoulders, elbows tucked in by the sides.",
      p: { hip: [104, 180], t: -90, h: -112, nl: [90, 90, 60], fl: [91, 91, 61], na: [160, -10], fa: [158, -8] } },
    { l: "Lift the chest, hold 3 breaths", g: "mat", a: "Pressing through the hands to lift the chest and upper back, hips and legs still on the floor.",
      p: { hip: [104, 180], t: -122, h: -150, nl: [90, 90, 60], fl: [91, 91, 61], na: [35.1, -67.1], fa: [37, -64] },
      x: [{ mvq: [30, 150, 26, 128, 40, 112] }] },
  ] },
  "pilates-swimming": { w: 200, f: [
    { l: "Arms and legs just lifted", g: "mat", a: "Lying face down, arms stretched overhead, both arms and both legs lifted slightly off the floor.",
      p: { hip: [104, 180], t: -95, h: -100, nl: [97, 97, 110], fl: [96, 96, 108], na: [-112, -112], fa: [-110, -110] } },
    { l: "Flutter opposite arm and leg", g: "mat", a: "One arm lifted higher together with the opposite leg, then swapping in small quick movements.",
      p: { hip: [104, 180], t: -95, h: -100, nl: [95, 95, 108], fl: [102, 102, 116], na: [-124, -124], fa: [-106, -106] },
      x: [{ mv: [22, 132, 20, 120] }, { mv: [186, 152, 186, 140] }] },
  ] },
  "pilates-side-kick": { w: 200, f: [
    { l: "Kick forward, pulse twice", g: "none", a: "Seen from above: lying on one side in a straight line, head resting on the lower arm, the top leg kicked straight forward.",
      p: { hip: [112, 120], t: -90, h: -90, fl: [105, 105, 180], nl: [140, 140, 150], na: [-90, -90], fa: [170, 110] } },
    { l: "Swing back, pulse once", g: "none", a: "Seen from above: the top leg swung back behind the body as far as is comfortable; the hips stay still.",
      p: { hip: [112, 120], t: -90, h: -90, fl: [105, 105, 180], nl: [62, 62, 150], na: [-90, -90], fa: [170, 110] },
      x: [{ mvq: [168, 60, 196, 110, 184, 150] }] },
  ] },
  "pilates-spine-stretch": { w: 180, f: [
    { l: "Sit tall, arms forward", g: "mat", a: "Sitting tall on the floor, legs straight and a little apart, feet flexed, arms reaching forward at shoulder height.",
      p: { hip: [50, 180], t: 180, nl: [90, 90, 175], fl: [91, 91, 177], na: [90, 90], fa: [92, 92] } },
    { l: "Round forward, then restack", g: "mat", a: "The spine rounded forward from the head down, reaching the arms forward and down between the feet; the legs stay where they were.",
      p: { hip: [50, 180], t: 132, h: 110, bend: [-6, -6], nl: [90, 90, 175], fl: [91, 91, 177], na: [112, 104], fa: [114, 106] },
      x: [{ mvq: [24, 124, 36, 94, 70, 92] }] },
  ] },
  "pilates-leg-circles": { w: 200, f: [
    { l: "One leg to the ceiling", g: "mat", a: "Lying on the back, one leg extended straight up to the ceiling, the other leg flat on the floor, arms by the sides.",
      p: { hip: [104, 178], t: -90, h: -95, nl: [180, 180, 180], fl: [90, 90, 165], na: [92, 92], fa: [93, 93] } },
    { l: "Draw circles, pelvis still", g: "mat", a: "The raised leg drawing circles in the air, large enough to feel the hip working while the pelvis stays anchored to the mat.",
      p: { hip: [104, 178], t: -90, h: -95, nl: [166, 166, 166], fl: [90, 90, 165], na: [92, 92], fa: [93, 93] },
      x: [{ mvq: [96, 74, 124, 50, 146, 84] }] },
  ] },
  "pilates-teaser-prep": { w: 200, f: [
    { l: "Start", g: "mat", a: "Lying on the back, knees lifted to tabletop, arms stretched overhead.",
      p: { hip: [116, 178], t: -90, h: -95, nl: [180, 90, 100], fl: [176, 88, 100], na: [-100, -100], fa: [-102, -102] } },
    { l: "Curl up, reach to the knees", g: "mat", a: "Curled up to balance on the tailbone, shins parallel to the floor, arms reaching forward parallel to the shins.",
      p: { hip: [100, 180], t: -140, h: -150, nl: [140, 90, 100], fl: [136, 88, 100], na: [92, 92], fa: [94, 94] },
      x: [{ mvq: [24, 172, 12, 146, 26, 124] }] },
  ] },
  "pilates-shoulder-bridge": { w: 160, f: [
    { l: "Start", g: "mat", a: "Lying on the back, knees bent, feet flat on the floor hip-width apart, arms by the sides.",
      p: { hip: [100, 178], t: -90, h: -95, nl: [140, 10, 90], fa: [96, 92] } },
    { l: "Peel up into a bridge", g: "mat", a: "Spine peeled off the mat from the tailbone up until the body is one straight line from shoulders to knees, feet still flat.",
      p: { hip: [97, 161], t: -68, h: -95, nl: [112, -5, 90], fa: [96, 92] }, x: [{ mv: [97, 188, 97, 173] }] },
  ] },
  "pilates-mermaid": { w: 180, f: [
    { l: "Sit, one arm up", a: "Seen from the front: sitting with both legs folded to one side, the hand on the other side resting on the floor, the free arm reaching up.",
      p: { v: "front", hip: [100, 182], t: 174, la: [-174, -176], ra: [14, 6] },
      x: [{ body: [[92, 182, 54, 186, 86, 188]] }, { far: [[108, 182, 66, 184, 98, 186]] }] },
    { l: "Reach up and over, hold", a: "Seen from the front: bending sideways towards the supporting hand, the free arm reaching up and over the head; the stretch is felt along the side of the body.",
      p: { v: "front", hip: [100, 182], t: 156, h: 150, la: [168, 128], ra: [34, -6] },
      x: [{ body: [[92, 182, 54, 186, 86, 188]] }, { far: [[108, 182, 66, 184, 98, 186]] }, { ring: [82, 140] }, { mvq: [60, 70, 80, 40, 116, 44] }] },
  ] },
  "pilates-roll-down-wall": { w: 160, f: [
    { l: "Back against the wall", a: "Standing with the back against a wall, feet hip-width apart and a short step away from it, head, upper back and tailbone touching the wall.",
      p: { hip: [50, 113.6], t: -175, h: -178, nl: [12, 12, 90], fl: [10, 10, 90], na: [-4, 2], fa: [-2, 4] },
      x: [{ wall: 36 }] },
    { l: "Peel down, then roll up", a: "Chin nodded and the spine peeled away from the wall from the top down, rolling forward and down, arms hanging, hips still against the wall.",
      p: { hip: [50, 113.6], t: 58, h: 20, bend: [6, -8], nl: [12, 12, 90], fl: [10, 10, 90], na: [6, 6], fa: [8, 8] },
      x: [{ wall: 36 }, { mvq: [70, 50, 118, 52, 132, 96] }] },
  ] },
  "pilates-roll-down-standing": { w: 160, f: [
    { l: "Stand tall", a: "Standing tall, feet hip-width apart, arms by the sides.",
      p: { hip: [76, 112], t: 180, nl: [0, 0, 90], fl: [2, 0, 90], na: [0, 4], fa: [2, 4] } },
    { l: "Roll down, then back up", a: "Rolled down through the spine one bone at a time, head and arms hanging heavy, knees slightly soft.",
      p: { hip: [74, 113.5], t: 60, h: 22, bend: [6, -8], nl: [8, -6, 90], fl: [10, -4, 90], na: [4, 4], fa: [6, 6] },
      x: [{ mvq: [96, 50, 140, 54, 150, 100] }] },
  ] },
  "pilates-corkscrew": { w: 200, f: [
    { l: "Legs together, up", g: "mat", a: "Lying on the back, both legs together pointing to the ceiling, arms flat on the floor by the sides.",
      p: { hip: [104, 178], t: -90, h: -95, nl: [180, 180, 180], fl: [178, 178, 178], na: [92, 92], fa: [93, 93] } },
    { l: "Circle round, then reverse", g: "mat", a: "Both legs, still together, circling round to one side and down towards the floor without touching it, then round and back up to the centre.",
      p: { hip: [104, 178], t: -90, h: -95, nl: [140, 140, 140], fl: [138, 138, 138], na: [92, 92], fa: [93, 93] },
      x: [{ mvq: [118, 82, 160, 72, 172, 112] }] },
  ] },
  "pilates-spine-twist": { w: 160, f: [
    { l: "Sit tall, arms wide", g: "mat", a: "Seen from the front: sitting tall on the floor with the legs stretched out towards the viewer, feet flexed, arms out to the sides at shoulder height.",
      p: { v: "front", hip: [80, 178], t: 180, la: [-90, -90], ra: [90, 90] },
      x: [{ body: [[72, 178, 64, 188, 60, 178], [88, 178, 96, 188, 100, 178]] }] },
    { l: "Turn, pulse twice", g: "mat", a: "Seen from the front: the upper body turned to one side from the waist, arms still level with the shoulders, the hips and legs not moving.",
      x: [{ body: [[72, 178, 64, 188, 60, 178], [88, 178, 96, 188, 100, 178], [80, 178, 80, 132], [70, 132, 90, 132, 124, 138], [72, 178, 88, 178]] },
          { far: [[70, 132, 38, 126]] }, { head: [80, 114] }, { mvq: [48, 156, 80, 170, 112, 156] }] },
  ] },
  "pilates-long-stretch": { w: 190, f: [
    { l: "High plank", g: "mat", a: "High plank: hands on the floor under the shoulders, arms straight, toes on the floor, body one straight line from head to heels.",
      p: { hip: [96, 152.6], t: 111.1, h: 106, nl: [-68.9, -68.9, -55], fl: [-69.5, -69.5, -56], na: [0, 0], fa: [2, 2] } },
    { l: "Shift forward, hold 2", g: "mat", a: "Rocked forward on the toes so the shoulders move ahead of the hands, body still one rigid straight line, hips not dropping.",
      p: { hip: [106, 153.6], t: 111.1, h: 106, nl: [-68.9, -68.9, -20], fl: [-69.5, -69.5, -21], na: [-11, -11], fa: [-9, -9] },
      x: [{ mv: [116, 98, 138, 98] }] },
  ] },
  "pilates-kneeling-series": { w: 160, f: [
    { l: "Leg out, kick forward and back", g: "mat", a: "Seen from the front: kneeling upright on one knee, the other leg stretched out to the side at hip height, hands on the hips, body upright.",
      p: { v: "front", hip: [100, 150], t: 180, ll: [-90, -90, 180], la: [-30, 30], ra: [30, -30] },
      x: [{ body: [[108, 150, 108, 186]] }, { far: [[108, 186, 126, 183, 134, 186]] }] },
  ] },
  "pilates-reformer-simulation": { w: 200, f: [
    { l: "Knees bent, band at the feet", g: "mat", a: "Lying on the back, knees bent towards the chest, a resistance band looped around the feet with the ends held in the hands.",
      p: { hip: [112, 178], t: -90, h: -95, nl: [160, 90, 170], fl: [156, 88, 170], na: [150, 120] },
      x: [{ band: [101, 143, 163, 130] }] },
    { l: "Press the legs out", g: "mat", a: "Both legs pressed out long against the band, then drawn back in with control.",
      p: { hip: [112, 178], t: -90, h: -95, nl: [124, 124, 170], fl: [122, 122, 170], na: [150, 120] },
      x: [{ band: [101, 143, 176, 124] }, { mv: [150, 160, 174, 144] }] },
  ] },

  // ── Pilates sequences: their first position ───────────────────────
  "pilates-sequence-beginner": { w: 180, f: [
    { l: "Begin lying, settle the spine", g: "mat", a: "Lying on the back, knees bent, feet flat on the floor, arms by the sides, breathing and settling the spine: the first part of the sequence.",
      p: { ...HOOK, na: [94, 92], fa: [96, 92] } },
  ] },
  "pilates-sequence-core": { w: 200, f: [
    { l: "Begins with the Hundred", g: "mat", a: "The Hundred, the first exercise of the sequence: head and shoulders curled off the mat, knees at tabletop, arms long by the sides just above the mat.",
      p: { ...CURL, nl: [180, 90, 100], fl: [176, 88, 100], na: [97, 93], fa: [99, 95] } },
  ] },
  "pilates-advanced-sequence": { w: 200, f: [
    { l: "Begins with the Hundred", g: "mat", a: "The Hundred, the first exercise of the sequence: head and shoulders curled off the mat, both legs stretched out at about 45 degrees, arms long by the sides just above the mat.",
      p: { ...CURL, nl: [130, 130, 130], fl: [128, 128, 128], na: [97, 93], fa: [99, 95] } },
  ] },
};
