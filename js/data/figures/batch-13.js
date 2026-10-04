/**
 * js/data/figures/batch-13.js
 * 04 Oct 2026 v1
 *
 * D-4 FIGURES, batch 13: cardio (bodyweight conditioning, walking, running,
 * skipping, dance, bikes, rowing machines and the cardio warm-ups).
 * The format is described in js/figures.js.
 */
export const FIGURES_13 = {
  "jumping-jacks": { w: 160, f: [
    { l: "Feet together, arms down", a: "Seen from the front, standing tall with the feet together and the arms by the sides.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [4, 4], rl: [-4, -4], la: [-6, -3], ra: [6, 3] } },
    { l: "Jump wide, arms overhead", a: "Seen from the front, feet jumped out wide with a soft bend in the knees, both arms raised above the head.",
      p: { v: "front", hip: [80, 116], t: 180, ll: [-20, -16], rl: [20, 16], la: [-155, -170], ra: [155, 170] },
      x: [{ mvq: [36, 96, 20, 70, 34, 40] }, { mv: [118, 168, 140, 168] }] },
  ] },
  "high-knees": { w: 160, f: [
    { l: "Stand tall", a: "Standing tall, feet hip-width apart, arms by the sides.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 4] } },
    { l: "Knee up, then swap fast", a: "On the ball of one foot, the other knee driven up towards the chest, chest up and not leaning back, arms bent and pumping, one forward and one back.",
      p: { hip: [84, 108], t: 180, nl: [100, 0, 90], fl: [0, 0, 65], na: [-50, 15], fa: [35, 150] },
      x: [{ mv: [147, 184, 147, 152] }] },
  ] },
  "mountain-climbers": { w: 180, f: [
    { l: "High plank", a: "High plank: hands on the floor under the shoulders, arms straight, toes on the floor, body one straight line from head to heels.",
      p: { hip: [94, 154], t: 113, h: 108, nl: [-67, -67, -60], fl: [-67, -67, -60], na: [0, 0], fa: [0, 0] } },
    { l: "Knee in, then swap", a: "One knee driven in towards the chest while the other leg stays straight back, hips low and level, hands still under the shoulders.",
      p: { hip: [94, 154], t: 113, h: 108, nl: [80, -70, -130], fl: [-67, -67, -60], na: [0, 0], fa: [0, 0] },
      x: [{ mv: [60, 128, 96, 128] }] },
  ] },
  "burpee": { w: 180, f: [
    { l: "Squat, hands down", a: "Squatted down from standing, feet shoulder-width apart, hands placed flat on the floor in front of the feet.",
      p: { hip: [62, 152], t: 110, h: 100, nl: [85, -30, 90], na: [-7.4, 22.9] } },
    { l: "Step or jump back to plank", a: "Feet stepped or jumped back to a plank: hands under the shoulders, arms straight, body one straight line with the hips not sagging. A press-up here is optional.",
      p: { hip: [100, 153.6], t: 112.5, h: 110, nl: [-67.5, -67.5, -67.5], fl: [-67.5, -67.5, -67.5], na: [-4, -4] },
      x: [{ mv: [66, 148, 34, 148] }] },
    { l: "Feet in, jump up", a: "Feet brought back in to the squat, then jumping up with both arms reaching overhead, ready to land softly.",
      p: { hip: [90, 104], t: 180, nl: [0, 0, 60], fl: [4, -4, 60], na: [140, 170], fa: [136, 164] },
      x: [{ mv: [136, 160, 136, 120] }] },
  ] },
  "squat-jumps": { w: 160, f: [
    { l: "Squat down, chest up", a: "Feet shoulder-width apart, lowered into a squat, heels down, chest up.",
      p: { hip: [65, 152], t: 155, nl: [85, -30, 90], na: [40, 80] } },
    { l: "Jump, land softly", a: "Driven up through the heels so both feet leave the floor, body tall, ready to land softly with bent knees and go straight into the next squat.",
      p: { hip: [84, 96], t: 180, nl: [0, 0, 40], na: [-10, -10] },
      x: [{ mv: [120, 150, 120, 110] }] },
  ] },
  "skipping-rope": { w: 160, f: [
    { l: "Small hops, wrists turn", a: "Seen from the front, hopping just clear of the rope, elbows close to the ribs, the wrists turning the rope as it passes under the feet.",
      p: { v: "front", hip: [80, 106], t: 180, ll: [-4, -2], rl: [4, 2], la: [-14, -55], ra: [14, 55] },
      x: [{ ln: [36.4, 100.1, 46, 150] }, { ln: [46, 150, 56, 184] }, { ln: [56, 184, 104, 184] }, { ln: [104, 184, 114, 150] }, { ln: [114, 150, 123.6, 100.1] }] },
  ] },
  "marching-on-spot": { w: 160, f: [
    { l: "Stand tall", a: "Standing tall, feet hip-width apart, arms by the sides.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 4] } },
    { l: "Knee to hip height, swap", a: "One knee lifted to hip height, thigh level with the floor, body upright, the opposite arm swinging forward.",
      p: { hip: [84, 112], t: 180, nl: [90, 0, 90], fl: [0, 0, 90], na: [-22, -12], fa: [30, 50] },
      x: [{ mv: [150, 178, 150, 146] }] },
  ] },
  "step-touch": { w: 160, f: [
    { l: "Feet together", a: "Seen from the front, standing tall with the feet together and the arms relaxed by the sides.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [4, 4], rl: [-4, -4], la: [-6, -3], ra: [6, 3] } },
    { l: "Step out, feet meet, swap", a: "Seen from the front, one foot stepped out to the side and the other about to follow it in, arms swinging with the step.",
      p: { v: "front", hip: [90, 112.5], t: 180, ll: [4, 4], rl: [16, 12], la: [-25, -40], ra: [30, 50] },
      x: [{ mv: [124, 172, 146, 172] }] },
  ] },
  "stair-climbing": { w: 180, f: [
    { l: "Whole foot on each step", a: "Walking up a flight of stairs, standing tall, one whole foot on the step above and the other on the step below, arms swinging.",
      p: { hip: [78, 95], t: 176, nl: [65.9, -16.3, 90], fl: [4.2, -26.2, 90], na: [20, 40], fa: [-20, -8] },
      x: [{ box: [46, 170, 128, 20] }, { box: [88, 150, 86, 40] }, { box: [122, 130, 52, 60] }, { box: [154, 110, 20, 80] }] },
  ] },
  "shadow-boxing": { w: 160, f: [
    { l: "Guard up, knees soft", a: "Standing side-on with one foot ahead of the other, knees softly bent, both fists up by the chin.",
      p: { hip: [80, 114], t: 178, nl: [16, 6, 90], fl: [-14, -6, 90], na: [30, 165], fa: [24, 160] } },
    { l: "Punch, elbow soft", a: "The front arm punched straight out at shoulder height without locking the elbow, the other fist staying by the chin, knees still soft.",
      p: { hip: [82, 114], t: 176, nl: [16, 6, 90], fl: [-14, -6, 90], na: [86, 94], fa: [24, 160] },
      x: [{ mv: [112, 46, 142, 46] }] },
  ] },
  "cycling-steady": { w: 200, f: [
    { l: "Easy, steady pedalling", a: "Sitting on a bicycle, leaning forward with a relaxed grip on the handlebars, one pedal at the bottom with that knee only slightly bent.",
      p: { hip: [78, 101], t: 125, h: 115, nl: [17.8, -5.5, 95], fl: [64.3, -43.6, 95], na: [31.3, 107.5] },
      x: [{ ball: [40, 158, 30] }, { ball: [160, 158, 30] }, { bar: [68, 106, 88, 106] }, { bar: [80, 106, 92, 162] }, { bar: [82, 112, 144, 104] }, { bar: [142, 96, 148, 118] }, { bar: [148, 118, 160, 158] }, { bar: [92, 162, 146, 112] }, { bar: [92, 162, 40, 158] }, { bar: [40, 158, 82, 114] }, { bar: [142, 96, 146, 88] }, { bar: [140, 88, 160, 90] }, { bar: [92, 147, 92, 177] }] },
  ] },
  "brisk-walk": { w: 160, f: [
    { l: "Brisk pace, arms swinging", a: "Walking briskly, chin up and chest open, looking ahead, the arms swinging opposite to the legs.",
      p: { hip: [82, 116], t: 180, nl: [26.5, 1.6, 90], fl: [-1.6, -26.5, 90], na: [-20, -8], fa: [20, 30] } },
  ] },
  "dance-freestyle": { w: 160, f: [
    { l: "Move however feels good", a: "Seen from the front, dancing freely: one arm raised high, the other bent at the side, one knee lifted and turned out.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [30, -5], la: [-140, -165], ra: [50, 140] } },
  ] },
  "hiit-30-30": { w: 160, f: [
    { l: "Work hard: 30 seconds", a: "Working hard on one exercise, here high knees: one knee driven up towards the chest, arms pumping.",
      p: { hip: [84, 108], t: 180, nl: [100, 0, 90], fl: [0, 0, 65], na: [-50, 15], fa: [35, 150] } },
    { l: "Rest: 30 seconds", a: "Resting between exercises: standing tall and walking gently, breathing.",
      p: { hip: [82, 116], t: 180, nl: [26.5, 1.6, 90], fl: [-1.6, -26.5, 90], na: [-20, -8], fa: [20, 30] } },
  ] },
  "rowing-machine": { w: 200, f: [
    { l: "Shins upright, arms long", a: "Sitting on a rowing machine, feet strapped to the foot plate, knees bent with the shins upright, arms straight holding the handle, leaning slightly forward with a straight back.",
      p: { hip: [106.7, 158], t: 160, h: 165, nl: [142.1, 0, 150], na: [80, 80] },
      x: [{ box: [10, 170, 160, 6] }, { box: [14, 176, 8, 14] }, { box: [150, 176, 8, 14] }, { bar: [129, 173, 141, 152] }, { ball: [180, 146, 10] }, { bar: [180, 156, 176, 188] }, { box: [95.7, 162, 22, 8] }, { ln: [173.6, 124, 176, 138] }, { bar: [173.6, 116, 173.6, 132] }] },
    { l: "Legs, lean back, then arms", a: "Legs pushed straight first, then the body leaning back slightly, then the handle drawn to the lower ribs; the return goes in reverse.",
      p: { hip: [55, 158], t: -165, h: -170, nl: [91, 76.9, 150], na: [1.6, 111.6] },
      x: [{ box: [10, 170, 160, 6] }, { box: [14, 176, 8, 14] }, { box: [150, 176, 8, 14] }, { bar: [129, 173, 141, 152] }, { ball: [180, 146, 10] }, { bar: [180, 156, 176, 188] }, { box: [44, 162, 22, 8] }, { ln: [68, 130, 176, 138] }, { bar: [68, 122, 68, 138] }, { mv: [96, 104, 72, 104] }] },
  ] },
  "walk-run-intervals": { w: 180, f: [
    { l: "Run: 1 minute", a: "Running at a comfortable pace, leaning slightly forward, arms swinging.",
      p: { hip: [80, 115], t: 168, nl: [21.2, -8.7, 90], fl: [-28, -85, 10], na: [35, 125], fa: [-40, 45] } },
    { l: "Walk: 2 minutes", a: "Walking briskly between runs, upright, arms swinging, not stopping.",
      p: { hip: [82, 116], t: 180, nl: [26.5, 1.6, 90], fl: [-1.6, -26.5, 90], na: [-20, -8], fa: [20, 30] } },
  ] },
  "cardio-rowing-easy": { w: 200, f: [
    { l: "Shins upright, arms long", a: "Sitting on a rowing machine, feet strapped to the foot plate, knees bent with the shins upright, arms straight holding the handle, leaning slightly forward.",
      p: { hip: [106.7, 158], t: 160, h: 165, nl: [142.1, 0, 150], na: [80, 80] },
      x: [{ box: [10, 170, 160, 6] }, { box: [14, 176, 8, 14] }, { box: [150, 176, 8, 14] }, { bar: [129, 173, 141, 152] }, { ball: [180, 146, 10] }, { bar: [180, 156, 176, 188] }, { box: [95.7, 162, 22, 8] }, { ln: [173.6, 124, 176, 138] }, { bar: [173.6, 116, 173.6, 132] }] },
    { l: "Legs, lean back, then arms", a: "Legs pushed straight first, then the body rocking back slightly as the arms pull the handle to the chest; the return goes arms, body, then knees.",
      p: { hip: [55, 158], t: -165, h: -170, nl: [91, 76.9, 150], na: [1.6, 111.6] },
      x: [{ box: [10, 170, 160, 6] }, { box: [14, 176, 8, 14] }, { box: [150, 176, 8, 14] }, { bar: [129, 173, 141, 152] }, { ball: [180, 146, 10] }, { bar: [180, 156, 176, 188] }, { box: [44, 162, 22, 8] }, { ln: [68, 130, 176, 138] }, { bar: [68, 122, 68, 138] }, { mv: [96, 104, 72, 104] }] },
  ] },
  "cardio-rowing-intervals": { w: 200, f: [
    { l: "Shins upright, arms long", a: "Sitting on a rowing machine, feet strapped to the foot plate, knees bent with the shins upright, arms straight holding the handle, back straight.",
      p: { hip: [106.7, 158], t: 160, h: 165, nl: [142.1, 0, 150], na: [80, 80] },
      x: [{ box: [10, 170, 160, 6] }, { box: [14, 176, 8, 14] }, { box: [150, 176, 8, 14] }, { bar: [129, 173, 141, 152] }, { ball: [180, 146, 10] }, { bar: [180, 156, 176, 188] }, { box: [95.7, 162, 22, 8] }, { ln: [173.6, 124, 176, 138] }, { bar: [173.6, 116, 173.6, 132] }] },
    { l: "Legs first, then lean and pull", a: "Legs pushed straight first, then the body leaning back slightly, then the handle drawn to the lower ribs, back still straight.",
      p: { hip: [55, 158], t: -165, h: -170, nl: [91, 76.9, 150], na: [1.6, 111.6] },
      x: [{ box: [10, 170, 160, 6] }, { box: [14, 176, 8, 14] }, { box: [150, 176, 8, 14] }, { bar: [129, 173, 141, 152] }, { ball: [180, 146, 10] }, { bar: [180, 156, 176, 188] }, { box: [44, 162, 22, 8] }, { ln: [68, 130, 176, 138] }, { bar: [68, 122, 68, 138] }, { mv: [96, 104, 72, 104] }] },
  ] },
  "cardio-assault-bike": { w: 180, f: [
    { l: "Sprint 10 s, easy 50 s", a: "Sitting on an air bike with a large fan wheel at the front, feet on the pedals, hands on the moving handles with a relaxed grip, body upright.",
      p: { hip: [74, 98], t: 160, h: 170, nl: [18.4, 3, 90], fl: [69.3, -31, 90], na: [6.2, 78.1] },
      x: [{ box: [26, 184, 128, 6] }, { ball: [136, 150, 26] }, { bar: [62, 184, 72, 104] }, { bar: [62, 103, 84, 103] }, { bar: [60, 184, 96, 160] }, { bar: [96, 160, 136, 150] }, { bar: [96, 160, 96, 174] }, { bar: [96, 160, 96, 146] }, { bar: [126, 160, 118, 82] }] },
  ] },
  "cardio-skipping": { w: 160, f: [
    { l: "Small hops, wrists turn", a: "Seen from the front, hopping just clear of the rope, elbows close to the ribs, the wrists turning the rope as it passes under the feet.",
      p: { v: "front", hip: [80, 106], t: 180, ll: [-4, -2], rl: [4, 2], la: [-14, -55], ra: [14, 55] },
      x: [{ ln: [36.4, 100.1, 46, 150] }, { ln: [46, 150, 56, 184] }, { ln: [56, 184, 104, 184] }, { ln: [104, 184, 114, 150] }, { ln: [114, 150, 123.6, 100.1] }] },
  ] },
  "cardio-dance": { w: 160, f: [
    { l: "Move freely to the music", a: "Seen from the front, dancing with no set steps: both arms raised overhead, one foot stepping out to the side.",
      p: { v: "front", hip: [80, 114], t: 180, ll: [-20, -10], rl: [6, 2], la: [-150, -165], ra: [150, 165] } },
  ] },
  "cardio-circuit-training": { w: 180, f: [
    { l: "40 seconds each move", a: "Seen from the front, the first move of the circuit: jumping jacks, feet jumped wide and arms overhead.",
      p: { v: "front", hip: [90, 116], t: 180, ll: [-20, -16], rl: [20, 16], la: [-155, -170], ra: [155, 170] } },
    { l: "Then the next, and on", a: "The next move: mountain climbers, in a high plank with one knee driven towards the chest; the circuit carries on through each move with 20 seconds rest between.",
      p: { hip: [94, 154], t: 113, h: 108, nl: [80, -70, -130], fl: [-67, -67, -60], na: [0, 0], fa: [0, 0] } },
  ] },
  "cardio-nordic-walking": { w: 180, f: [
    { l: "Opposite pole to foot", a: "Walking briskly with a pole in each hand: the arm opposite the front foot forward with its pole planted angled back, the other arm pushed long behind with its pole trailing.",
      p: { hip: [82, 116], t: 180, nl: [26.5, 1.6, 90], fl: [-1.6, -26.5, 90], na: [-40, -50], fa: [25, 60] },
      x: [{ bar: [116, 104, 92, 188] }, { bar: [45.4, 106.6, 16, 188] }] },
  ] },
  "cardio-hiit-session": { w: 180, f: [
    { l: "Work: 40 seconds", a: "Working at high intensity, here sprinting: leaning slightly forward, arms driving.",
      p: { hip: [80, 115], t: 168, nl: [21.2, -8.7, 90], fl: [-28, -85, 10], na: [35, 125], fa: [-40, 45] } },
    { l: "Rest: 20 seconds", a: "Recovering between rounds: upright, walking gently rather than standing still.",
      p: { hip: [82, 116], t: 180, nl: [26.5, 1.6, 90], fl: [-1.6, -26.5, 90], na: [-20, -8], fa: [20, 30] } },
  ] },
  "bike-easy-spin-warmup": { w: 180, f: [
    { l: "Sit upright, easy spin", a: "Sitting upright on an exercise bike, hands resting on the handlebars, one pedal at the bottom with that leg almost straight.",
      p: { hip: [74, 98], t: 165, h: 175, nl: [18.4, 3, 90], fl: [69.3, -31, 90], na: [43.6, 68.3] },
      x: [{ box: [26, 184, 128, 6] }, { ball: [128, 160, 16] }, { bar: [62, 184, 72, 104] }, { bar: [62, 103, 84, 103] }, { bar: [128, 160, 130, 82] }, { bar: [118, 82, 140, 80] }, { bar: [60, 184, 96, 160] }, { bar: [96, 160, 96, 174] }, { bar: [96, 160, 96, 146] }] },
  ] },
  "treadmill-easy-walk-warmup": { w: 180, f: [
    { l: "Walk tall, hands free", a: "Walking upright at a brisk pace on a flat treadmill, arms swinging naturally, not leaning on the rails, looking ahead.",
      p: { hip: [80, 100], t: 180, nl: [26.5, -1.4, 90], fl: [1.4, -26.5, 90], na: [-18, -8], fa: [18, 30] },
      x: [{ box: [12, 176, 142, 12] }, { bar: [150, 176, 158, 98] }, { bar: [148, 100, 168, 94] }] },
  ] },
  "cross-trainer-easy-warmup": { w: 180, f: [
    { l: "Full, easy strides", a: "Standing upright on a cross trainer, one foot forward on its pedal and one back, hands holding the moving handles, which move with the stride.",
      p: { hip: [72, 96], t: 178, nl: [46.7, -2.5, 90], fl: [-3, -18.4, 90], na: [4.3, 51.9], fa: [38.9, 58.1] },
      x: [{ ball: [28, 164, 14] }, { ln: [28, 164, 94, 166] }, { ln: [28, 164, 70, 176] }, { bar: [92, 166, 116, 166] }, { bar: [50, 176, 76, 176] }, { bar: [156, 188, 150, 100] }, { bar: [144, 102, 164, 96] }, { bar: [111.2, 122.4, 90.6, 81.3] }, { far: [[121.5, 116.6, 108.6, 72.5]] }] },
  ] },
  "rower-easy-warmup": { w: 200, f: [
    { l: "Shins upright, arms straight", a: "Sitting on a rowing machine, feet strapped in, shins upright, arms straight holding the handle, leaning very slightly forward from the hips.",
      p: { hip: [106.7, 158], t: 160, h: 165, nl: [142.1, 0, 150], na: [80, 80] },
      x: [{ box: [10, 170, 160, 6] }, { box: [14, 176, 8, 14] }, { box: [150, 176, 8, 14] }, { bar: [129, 173, 141, 152] }, { ball: [180, 146, 10] }, { bar: [180, 156, 176, 188] }, { box: [95.7, 162, 22, 8] }, { ln: [173.6, 124, 176, 138] }, { bar: [173.6, 116, 173.6, 132] }] },
    { l: "Legs, then lean, then arms", a: "Legs pushed straight first, then leaning back slightly, then the handle pulled to the lower ribs; the return goes arms away, lean forward, then bend the knees.",
      p: { hip: [55, 158], t: -165, h: -170, nl: [91, 76.9, 150], na: [1.6, 111.6] },
      x: [{ box: [10, 170, 160, 6] }, { box: [14, 176, 8, 14] }, { box: [150, 176, 8, 14] }, { bar: [129, 173, 141, 152] }, { ball: [180, 146, 10] }, { bar: [180, 156, 176, 188] }, { box: [44, 162, 22, 8] }, { ln: [68, 130, 176, 138] }, { bar: [68, 122, 68, 138] }, { mv: [96, 104, 72, 104] }] },
  ] },
};
