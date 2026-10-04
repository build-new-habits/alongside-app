/**
 * js/data/figures/batch-01.js
 * 04 Oct 2026 v1
 *
 * D-4 FIGURES, batch 1: the sixteen Graeme saw on the canvas and approved
 * ("Love it. Absolutely love it."), redrawn as poses for js/figures.js.
 * The format is described there.
 */
export const FIGURES_01 = {
  "goblet-squat": { w: 160, f: [
    { l: "Start", a: "Standing tall, feet shoulder-width apart, holding a dumbbell upright at the chest with both hands.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [10, 160], hold: "dbv" } },
    { l: "Bottom", a: "Sitting back and down, knees pushed out over the toes, heels down, chest tall, elbows just inside the knees.",
      p: { hip: [65, 152], t: 155, nl: [85, -30, 90], na: [33, 160], hold: "dbv" },
      x: [{ mvq: [40, 104, 30, 132, 42, 160] }] },
  ] },
  "gym-lat-pulldown": { w: 160, f: [
    { l: "Start", a: "Seen from the front: sitting tall under the thigh pad, arms straight up, hands slightly wider than the shoulders on the bar.",
      p: { v: "front", hip: [80, 142], t: 180, la: [-158, -167], ra: [158, 167] },
      x: [{ pulley: [80, 9] }, { ln: [80, 14, 80, 38] }, { box: [56, 148, 48, 8] }, { box: [77, 156, 6, 34] },
          { body: [[62, 188, 66, 150, 72, 142], [98, 188, 94, 150, 88, 142]] }, { pad: [54, 130, 52, 8] }, { bar: [28, 38, 132, 38] }] },
    { l: "Finish", a: "Seen from the front: the bar pulled down to the upper chest, elbows driven down towards the ribs.",
      p: { v: "front", hip: [80, 142], t: 180, la: [-23, -166], ra: [23, 166] },
      x: [{ pulley: [80, 9] }, { ln: [80, 14, 80, 100] }, { box: [56, 148, 48, 8] }, { box: [77, 156, 6, 34] },
          { body: [[62, 188, 66, 150, 72, 142], [98, 188, 94, 150, 88, 142]] }, { pad: [54, 130, 52, 8] }, { bar: [28, 100, 132, 100] },
          { mv: [20, 58, 20, 92] }, { mv: [140, 58, 140, 92] }] },
  ] },
  "dead-bug": { w: 200, f: [
    { l: "Start", g: "mat", a: "Lying on the back, lower back pressed into the floor, both arms pointing at the ceiling, knees bent at a right angle above the hips.",
      p: { hip: [112, 178], t: -90, h: -95, na: [180, 180], fa: [174, 174], nl: [180, 90, 180], fl: [174, 84, 174] } },
    { l: "Reach, then swap sides", g: "mat", a: "One arm lowered back over the head and the opposite leg straightened towards the floor, both stopping just above it; the other arm and leg stay where they were; the lower back stays down.",
      p: { hip: [112, 178], t: -90, h: -95, na: [-100, -100], fa: [174, 174], nl: [95, 95, 180], fl: [174, 84, 174] },
      x: [{ mvq: [58, 112, 26, 116, 20, 152] }, { mvq: [160, 128, 184, 136, 186, 156] }] },
  ] },
  "hip-flexor-stretch": { w: 160, f: [
    { l: "Start", a: "Kneeling on one knee, the other foot flat in front with that knee over the ankle, body upright, hands on hips.",
      p: { hip: [78, 150], t: 180, nl: [-8, -90, -90], fl: [90, 0, 90], na: [-31, 30] } },
    { l: "Hold here", a: "Hips eased forward, body still upright; the stretch is felt at the front of the hip of the kneeling leg.",
      p: { hip: [90, 153], t: 180, nl: [-24, -90, -90], fl: [88, -10, 90], na: [-31, 30] },
      x: [{ mv: [44, 140, 68, 140] }, { ring: [85, 164] }] },
  ] },
  "sit-to-stand": { w: 160, f: [
    { l: "Lean forward", a: "Sitting near the front of a chair, feet flat and slightly behind the knees, leaning the chest forward, hands on the thighs.",
      p: { hip: [70, 150], t: 152, nl: [90, -9, 90], na: [55, -20] }, x: [{ chair: [44, 152] }] },
    { l: "Push through heels to stand", a: "Standing fully upright in front of the chair, arms by the sides.",
      p: { hip: [102, 112], t: 180, nl: [0, 0, 90], na: [0, 4] }, x: [{ chair: [44, 152] }, { mv: [136, 150, 136, 100] }] },
  ] },
  "glute-bridge": { w: 160, f: [
    { l: "Start", g: "mat", a: "Lying on the back, knees bent, feet flat on the floor, arms by the sides.",
      p: { hip: [100, 178], t: -90, h: -95, nl: [140, 10, 90], fa: [96, 92] } },
    { l: "Lift, hold 2 seconds", g: "mat", a: "Hips lifted until the body is one straight line from shoulders to knees, feet still flat.",
      p: { hip: [97, 161], t: -68, h: -95, nl: [112, -5, 90], fa: [96, 92] }, x: [{ mv: [97, 188, 97, 173] }] },
  ] },
  "bird-dog": { w: 190, f: [
    { l: "Start", a: "On hands and knees, hands under the shoulders, knees under the hips, back flat.",
      p: { hip: [88, 150], t: 108, h: 100, nl: [0, -90, -90], na: [0, 0] } },
    { l: "Reach, hold 3 seconds", a: "One arm reaching straight forward and the opposite leg straight back, both level with the back, hips level; the other hand and knee stay on the floor.",
      p: { hip: [88, 150], t: 108, h: 100, nl: [0, -90, -90], fl: [-95, -95, 0], na: [100, 100], fa: [0, 0] },
      x: [{ mv: [150, 112, 176, 108] }, { mv: [60, 132, 26, 134] }] },
  ] },
  "plank": { w: 180, f: [
    { l: "Hold: one straight line, head to heels", a: "Forearms on the floor, elbows under the shoulders, toes on the floor, body one straight line from head to heels.",
      p: { hip: [100.9, 171], t: 101.3, h: 101, nl: [-78.7, -78.7, -79], na: [0, 90] }, x: [{ guide: [21, 159, 141, 135] }] },
  ] },
  "side-plank-full": { w: 180, f: [
    { l: "Set up", a: "Lying on one side, elbow under the shoulder, forearm on the floor, feet stacked, hips on the floor.",
      p: { hip: [74, 184], t: -132, h: -120, nl: [88, 88, 88], na: [0, 90], fa: [55, 60] } },
    { l: "Lift and hold", a: "Hips lifted until the body is one straight line from head to feet, top hand resting on the hip.",
      p: { hip: [82, 172], t: -114, h: -112, nl: [79, 79, 79], na: [0, 90], fa: [66, 70] }, x: [{ mv: [98, 188, 98, 176] }] },
  ] },
  "reverse-lunge": { w: 160, f: [
    { l: "Start", a: "Standing tall, feet together, arms by the sides.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 4] } },
    { l: "Step back and down", a: "One foot stepped straight back, back knee lowered towards the floor, front shin upright, body upright.",
      p: { hip: [90, 149], t: 180, nl: [88, 0, 90], fl: [-20, -82, -90], na: [0, 4] }, x: [{ mvq: [62, 118, 40, 136, 44, 168] }] },
  ] },
  "dumbbell-romanian-deadlift": { w: 160, f: [
    { l: "Start", a: "Standing tall holding a dumbbell in each hand at hip height.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 3], hold: "dbs" } },
    { l: "Hips back, back flat", a: "Hinged at the hips: hips pushed back, knees soft, back flat, the dumbbells lowered close to the legs to about mid-shin.",
      p: { hip: [63.4, 123.6], t: 115, nl: [45, -9.5, 90], na: [0, 0], hold: "dbs" }, x: [{ mv: [56, 108, 34, 108] }] },
  ] },
  "dumbbell-single-arm-row": { w: 160, f: [
    { l: "Arm hanging straight", a: "One knee and one hand on a bench, back flat, the other foot on the floor, the dumbbell hanging straight down.",
      p: { hip: [64, 112], t: 108, h: 105, nl: [-4, 4, 90], fl: [-3, -90, 0], na: [10, 10], fa: [0, 0], hold: "dbs" },
      x: [{ bench: [24, 112, 150] }] },
    { l: "Elbow leads up", a: "The dumbbell pulled up towards the bottom of the ribs, elbow close to the body, back still flat.",
      p: { hip: [64, 112], t: 108, h: 105, nl: [-4, 4, 90], fl: [-3, -90, 0], na: [-110, 10], fa: [0, 0], hold: "dbs" },
      x: [{ bench: [24, 112, 150] }, { mvq: [124, 160, 122, 136, 100, 124] }] },
  ] },
  "dumbbell-overhead-press": { w: 160, f: [
    { l: "At the shoulders", a: "Seen from the front, standing, a dumbbell in each hand at shoulder height, elbows below the hands.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [-39, 175], ra: [39, -175], hold: "dbw" } },
    { l: "Press up", a: "Seen from the front, both dumbbells pressed straight up until the arms are nearly straight; lower back not arched.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [-167, 176], ra: [167, -176], hold: "dbw" },
      x: [{ mv: [22, 74, 22, 36] }, { mv: [138, 74, 138, 36] }] },
  ] },
  "cat-cow": { w: 190, f: [
    { l: "Cow: breathe in", a: "Cow, on hands and knees: belly dropped, chest and head lifted, breathing in.",
      p: { hip: [88, 150], t: 108, h: 130, bend: [0, 14], nl: [0, -90, -90], na: [0, 0] } },
    { l: "Cat: breathe out", a: "Cat, on hands and knees: back rounded up, chin and tailbone tucked, breathing out.",
      p: { hip: [88, 150], t: 108, h: 45, bend: [0, -20], nl: [0, -90, -90], na: [0, 0] } },
  ] },
  "childs-pose": { w: 180, f: [
    { l: "Rest here and breathe", a: "Kneeling, sitting back towards the heels, body folded forward, forehead resting on the floor, arms stretched forward on the floor.",
      p: { hip: [70, 170], t: 95, h: 106, nl: [60, -90, -90], na: [100, 100] } },
  ] },
  "seated-calf-raise": { w: 160, f: [
    { l: "Feet flat", a: "Sitting upright on a chair, feet flat on the floor, hands on the thighs.",
      p: { hip: [70, 150], t: 180, nl: [90, 0, 90], na: [34, 34] }, x: [{ chair: [44, 152] }] },
    { l: "Heels up, lower over 3", a: "Both heels raised as high as is comfortable, pressing through the balls of the feet.",
      p: { hip: [70, 150], t: 180, nl: [99, 0, 60], na: [32, 32] }, x: [{ chair: [44, 152] }, { mv: [96, 188, 96, 172] }] },
  ] },
};
