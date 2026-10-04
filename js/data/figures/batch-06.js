/**
 * js/data/figures/batch-06.js
 * 04 Oct 2026 v1
 *
 * D-4 FIGURES, batch 06: rehabilitation, second half (shins, balance, knee,
 * shoulder, wrist, back, core, pelvic floor, hypermobility and the rehab
 * routines). Gentle positions, drawn exactly as the instructions say.
 * The format is described in js/figures.js.
 */

// Seen from above, lying face down (Y, T, W): the arms change, the rest stays.
const PRONE_TOP = { v: "front", hip: [100, 108], t: -90, h: -90, ll: [90, 90, 90], rl: [90, 90, 90] };
const YTW = [
  { l: "Y: arms up and out", g: "none", a: "Seen from above, lying face down, legs straight: both arms lifted just off the floor in a Y, reaching diagonally past the head, thumbs up.",
    p: { ...PRONE_TOP, la: [-45, -45], ra: [-135, -135] } },
  { l: "T: arms out to the sides", g: "none", a: "Seen from above, lying face down: both arms lifted just off the floor straight out to the sides in a T, thumbs up.",
    p: { ...PRONE_TOP, la: [0, 0], ra: [180, 180] } },
  { l: "W: elbows bent, squeeze", g: "none", a: "Seen from above, lying face down: elbows bent to about a right angle and the upper arms lifted to shoulder height in a W, shoulder blades squeezed.",
    p: { ...PRONE_TOP, la: [30, -30], ra: [150, -150] } },
];

// Seen from the front, sitting on a chair (the thighs come towards us).
const SEAT_FRONT = [{ box: [56, 148, 48, 8] }, { box: [77, 156, 6, 34] }, { body: [[62, 188, 66, 150, 72, 142], [98, 188, 94, 150, 88, 142]] }];
const ROT_START = { l: "Sit tall, arms crossed", a: "Seen from the front, sitting upright on a chair, feet flat on the floor, arms crossed over the chest.",
  p: { v: "front", hip: [80, 142], t: 180, la: [14, 134], ra: [-14, -134] }, x: SEAT_FRONT };
const ROT_TURN = { l: "Turn slowly, hold 2 seconds", a: "Seen from the front, still sitting tall with the arms crossed: the upper body turned to one side, hips and feet staying still.",
  p: { v: "front", hip: [80, 142], t: 180, la: [10, 128], ra: [-24, -136], pale: ["la"] },
  x: [...SEAT_FRONT, { mvq: [54, 60, 80, 44, 106, 60] }] };

// Lying on the back, knees bent, one hand on the chest and one on the belly.
const BELLY_BREATH = { hip: [100, 178], t: -90, h: -95, nl: [140, 10, 90] };
const BELLY_HANDS = [{ body: [[54, 178, 76, 168, 92, 174]] }, { far: [[54, 178, 62, 166, 72, 174]] }];

export const FIGURES_06 = {
  "shin-splint-calf-raise-progression": { w: 160, f: [
    { l: "Up onto the toes, 2 counts", a: "Standing tall beside a wall, one hand resting on it for balance, risen up onto the toes.",
      p: { hip: [76, 102], t: 180, nl: [0, 0, 44], na: [70, 90], fa: [0, 4] }, x: [{ wall: 128 }] },
    { l: "Heels down, toes up", a: "Weight shifted back onto the heels and lowered, toes pulled up off the floor, hand still on the wall.",
      p: { hip: [76, 112], t: 180, nl: [0, 0, 120], na: [70, 90], fa: [0, 4] }, x: [{ wall: 128 }, { mv: [108, 188, 108, 174] }] },
  ] },
  "balance-single-leg-hold": { w: 160, f: [
    { l: "Hold 30 seconds, then swap", a: "Standing on one leg with a slight bend in the standing knee, the other foot lifted just off the floor behind, arms by the sides.",
      p: { hip: [84, 112.6], t: 180, nl: [8, -6, 90], fl: [10, -80, -40], na: [0, 4] } },
  ] },
  "patella-mobilisation": { w: 160, f: [
    { l: "Leg soft, glide the kneecap", g: "mat", a: "Sitting on the floor with one leg straight out in front and completely relaxed, leaning slightly forward, both hands resting on the kneecap.",
      p: { hip: [50, 182], t: 150, nl: [92, 90, 175], na: [-19, 64], fa: [-14, 68] } },
  ] },
  "y-balance-reach": { w: 160, f: [
    { l: "Reach forward, tap lightly", a: "Standing on one leg with the knee bent, hands on hips, the other foot reaching forward to touch the floor lightly.",
      p: { hip: [74, 122.4], t: 168, nl: [35, -25, 90], fl: [33.7, 33.7, 80], na: [-35, 25] } },
    { l: "Reach out to the side", a: "Seen from the front, standing on one leg, hands on hips, the other foot reaching out to the side to touch the floor lightly.",
      p: { v: "front", hip: [86, 116.6], t: 180, rl: [20, -20], ll: [-23, -23], la: [-30, 30], ra: [30, -30], pale: ["ll"] },
      x: [{ mv: [40, 170, 22, 170] }] },
    { l: "Reach diagonally behind", a: "Standing on one leg with the knee bent, hands on hips, the other foot reaching behind to touch the floor lightly.",
      p: { hip: [92, 122.4], t: 160, nl: [35, -25, 90], fl: [-33.7, -33.7, -80], na: [-35, 25] },
      x: [{ mv: [52, 168, 30, 168] }] },
  ] },
  "pendulum-swing": { w: 160, f: [
    { l: "Lean on a table, arm loose", a: "Leaning forward with one hand on a table for support, the other arm hanging straight down, completely loose.",
      p: { hip: [66, 114], t: 112, nl: [4, -4, 90], na: [0, 0], fa: [87, 3] }, x: [{ box: [130, 124, 22, 66] }] },
    { l: "Body sways, arm circles", a: "The same lean, the loose arm swinging in small circles below the shoulder, moved by the body, not the shoulder muscles.",
      p: { hip: [66, 114], t: 112, nl: [4, -4, 90], na: [8, 8], fa: [87, 3] },
      x: [{ box: [130, 124, 22, 66] }, { mvq: [98, 160, 112, 182, 126, 160] }] },
  ] },
  "external-rotation-band": { w: 160, f: [
    { l: "Elbow tucked in, hand in front", a: "Seen from the front, standing, elbow bent to a right angle and tucked against the side, hand in front of the stomach holding a band anchored at elbow height on the other side.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [0, 90], ra: [6, 2] }, x: [{ band: [90, 92, 152, 92] }] },
    { l: "Rotate out, 2 seconds", a: "Seen from the front, the forearm rotated outwards against the band, the elbow still against the side and the upper arm still.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [0, -80], ra: [6, 2] },
      x: [{ band: [38, 96, 152, 92] }, { mvq: [76, 106, 58, 118, 40, 106] }] },
  ] },
  "internal-rotation-band": { w: 160, f: [
    { l: "Elbow tucked in, hand out", a: "Seen from the front, standing square, elbow bent to a right angle and tucked against the side, the hand out to the side holding a band pulling it outwards.",
      p: { v: "front", hip: [84, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [0, -80], ra: [6, 2] }, x: [{ band: [42, 96, 8, 92] }] },
    { l: "Rotate in, 2 seconds", a: "Seen from the front, the forearm rotated in across the stomach against the band, the elbow still against the side, wrist straight.",
      p: { v: "front", hip: [84, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [0, 90], ra: [6, 2] },
      x: [{ band: [94, 92, 8, 92] }, { mvq: [44, 106, 62, 118, 80, 108] }] },
  ] },
  "wall-slide": { w: 160, f: [
    { l: "Back flat, arms in a goalpost", a: "Seen from the front, standing with the back flat against a wall, elbows bent to a right angle at shoulder height, arms pressed against the wall.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [-90, 180], ra: [90, 180] } },
    { l: "Slide up, keep contact", a: "Seen from the front, both arms slid up the wall as high as they go while the back, arms and wrists stay touching it; shoulders down.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [-150, -175], ra: [150, 175] },
      x: [{ mv: [24, 66, 24, 36] }, { mv: [136, 66, 136, 36] }] },
  ] },
  "shoulder-cars": { w: 160, f: [
    { l: "Stand tall", a: "Standing tall, arms by the sides.",
      p: { hip: [76, 112], t: 180, nl: [0, 0, 90], na: [0, 4], fa: [0, 4] } },
    { l: "Slow full circle, 5 to 10 seconds", a: "One arm reaching straight up over the head in the middle of a slow circle: forward, up, behind and back down; the body stays still.",
      p: { hip: [76, 112], t: 180, nl: [0, 0, 90], na: [185, 185], fa: [0, 4] },
      x: [{ mvq: [116, 110, 142, 50, 104, 18] }, { mvq: [54, 20, 22, 56, 42, 108] }] },
  ] },
  "prone-ytw": { w: 200, f: YTW },
  "scapular-pushup": { w: 190, f: [
    { l: "Let the chest sink", a: "High plank, arms straight, hands under the shoulders, body one straight line; the chest sinks a little as the shoulder blades squeeze together.",
      p: { hip: [106.7, 157.6], t: 109.8, h: 108, nl: [-70.2, -70.2, -70.2] }, x: [{ body: [[150, 142, 150, 188]] }] },
    { l: "Push the floor away", a: "Arms still straight and locked, the floor pushed away so the upper back rounds slightly and the shoulder blades spread apart.",
      p: { hip: [107.5, 153.6], t: 112.5, h: 110, nl: [-67.5, -67.5, -67.5], na: [0, 0] }, x: [{ mv: [128, 180, 128, 166] }] },
  ] },
  "doorway-chest-stretch": { w: 160, f: [
    { l: "Forearms on the frame", a: "Seen from the front, standing in a doorway, upper arms out at shoulder height, elbows bent to a right angle, forearms resting on the door frame.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [-90, 180], ra: [90, 180] }, x: [{ wall: 34 }, { wall: 126 }] },
    { l: "Step and lean, hold 30 seconds", a: "Seen from the side, one foot stepped forward and the body leaning gently forward through the doorway, forearms still on the frame behind; the stretch is felt across the chest.",
      p: { hip: [78, 115], t: 172, h: 175, nl: [25, -5, 90], fl: [-15, -15, 90] },
      x: [{ wall: 60 }, { far: [[84.4, 69.4, 64, 70, 64, 44]] }, { ring: [99, 84] }, { mv: [112, 104, 132, 104] }] },
  ] },
  "wrist-cars": { w: 160, f: [
    { l: "Arm forward, gentle fist", a: "Standing, one arm stretched straight forward at shoulder height, hand in a gentle fist.",
      p: { hip: [70, 112], t: 180, nl: [0, 0, 90], na: [90, 90], fa: [0, 4] } },
    { l: "Circle the wrist slowly", a: "The arm still forward and still; only the wrist circles slowly through a comfortable range.",
      p: { hip: [70, 112], t: 180, nl: [0, 0, 90], na: [90, 90], fa: [0, 4] }, x: [{ mvq: [126, 52, 150, 66, 128, 80] }] },
  ] },
  "wrist-extension-stretch": { w: 160, f: [
    { l: "Fingers up, hold 20 seconds", a: "Standing, one arm straight out in front, palm facing away; the other hand gently bends the fingers back towards the ceiling.",
      p: { hip: [70, 112], t: 180, nl: [0, 0, 90], na: [90, 90], fa: [112, 86] }, x: [{ body: [[122, 66, 124, 52]] }] },
    { l: "Fingers down, hold 20 seconds", a: "The palm turned up and the wrist gently bent down by the other hand, fingers pointing at the floor.",
      p: { hip: [70, 112], t: 180, nl: [0, 0, 90], na: [90, 90], fa: [70, 102] }, x: [{ body: [[122, 66, 124, 80]] }] },
  ] },
  "forearm-pronation-supination": { w: 160, f: [
    { l: "Palm up, pause 1 second", a: "Sitting on a chair, upper arm against the side, elbow bent to a right angle, forearm forward, palm turned up to the ceiling holding a small bottle.",
      p: { hip: [70, 150], t: 180, nl: [90, 0, 90], na: [0, 90], fa: [34, 34] }, x: [{ chair: [44, 152] }, { ball: [98, 124, 5] }] },
    { l: "Palm down, pause 1 second", a: "The same position with the forearm rotated so the palm faces the floor; elbow still tucked in, shoulder still.",
      p: { hip: [70, 150], t: 180, nl: [90, 0, 90], na: [0, 90], fa: [34, 34] }, x: [{ chair: [44, 152] }, { ball: [98, 136, 5] }, { mvq: [108, 118, 120, 130, 108, 142] }] },
  ] },
  "grip-strength-towel": { w: 160, f: [
    { l: "Squeeze 5 seconds, then release", a: "Standing, elbow bent, forearm forward, wrist straight, squeezing a rolled towel or soft ball in the hand.",
      p: { hip: [76, 112], t: 180, nl: [0, 0, 90], na: [10, 90], fa: [0, 4] }, x: [{ ball: [108, 98, 6] }] },
  ] },
  "pelvic-tilt": { w: 160, f: [
    { l: "Notice the small gap", g: "mat", a: "Lying on the back, knees bent, feet flat on the floor, arms by the sides; a small natural gap under the lower back.",
      p: { hip: [100, 178], t: -90, h: -95, bend: [0, -6], nl: [140, 10, 90], fa: [96, 92] } },
    { l: "Flatten the back, hold 5", g: "mat", a: "The lower back gently flattened into the floor by tightening the stomach and tilting the pelvis; feet stay flat.",
      p: { hip: [100, 178], t: -90, h: -95, nl: [140, 10, 90], fa: [96, 92] }, x: [{ mv: [77, 156, 77, 168] }] },
  ] },
  "diaphragmatic-breathing-core": { w: 160, f: [
    { l: "Lie and breathe into the belly", g: "mat", a: "Lying on the back, knees bent, feet flat on the floor, one hand resting on the chest and one on the belly.",
      p: BELLY_BREATH, x: BELLY_HANDS },
  ] },
  "dead-bug-progression-1": { w: 200, f: [
    { l: "Start", g: "mat", a: "Lying on the back, lower back pressed into the floor, both arms pointing at the ceiling, knees bent at a right angle above the hips.",
      p: { hip: [112, 178], t: -90, h: -95, na: [180, 180], fa: [174, 174], nl: [180, 90, 180], fl: [174, 84, 174] } },
    { l: "One arm back, hold 2 seconds", g: "mat", a: "One arm lowered back over the head towards the floor; the other arm and both legs stay where they were; the lower back stays down.",
      p: { hip: [112, 178], t: -90, h: -95, na: [-100, -100], fa: [174, 174], nl: [180, 90, 180], fl: [174, 84, 174] },
      x: [{ mvq: [58, 112, 26, 116, 20, 152] }] },
  ] },
  "dead-bug-progression-2": { w: 200, f: [
    { l: "Start", g: "mat", a: "Lying on the back, lower back pressed into the floor, both arms pointing at the ceiling, knees bent at a right angle above the hips.",
      p: { hip: [112, 178], t: -90, h: -95, na: [180, 180], fa: [174, 174], nl: [180, 90, 180], fl: [174, 84, 174] } },
    { l: "One leg out, hold 2 seconds", g: "mat", a: "One leg straightened out, the heel hovering above the floor; both arms and the other leg stay where they were; the lower back stays down.",
      p: { hip: [112, 178], t: -90, h: -95, na: [180, 180], fa: [174, 174], nl: [95, 95, 180], fl: [174, 84, 174] },
      x: [{ mvq: [160, 128, 184, 136, 186, 156] }] },
  ] },
  "dead-bug-progression-3": { w: 200, f: [
    { l: "Start", g: "mat", a: "Lying on the back, lower back pressed into the floor, both arms pointing at the ceiling, knees bent at a right angle above the hips.",
      p: { hip: [112, 178], t: -90, h: -95, na: [180, 180], fa: [174, 174], nl: [180, 90, 180], fl: [174, 84, 174] } },
    { l: "Opposite arm and leg, hold 2", g: "mat", a: "One arm lowered back over the head and the opposite leg straightened out, both stopping just above the floor; the other arm and leg stay where they were; the lower back stays down.",
      p: { hip: [112, 178], t: -90, h: -95, na: [-100, -100], fa: [174, 174], nl: [95, 95, 180], fl: [174, 84, 174] },
      x: [{ mvq: [58, 112, 26, 116, 20, 152] }, { mvq: [160, 128, 184, 136, 186, 156] }] },
  ] },
  "bird-dog-rehab": { w: 190, f: [
    { l: "Start", a: "On hands and knees, wrists under the shoulders, knees under the hips, spine neutral.",
      p: { hip: [88, 150], t: 108, h: 100, nl: [0, -90, -90], na: [0, 0] } },
    { l: "Reach, hold 3 seconds", a: "One arm reaching straight forward and the opposite leg straight back, both level with the back, hips level; the other hand and knee stay on the floor.",
      p: { hip: [88, 150], t: 108, h: 100, nl: [0, -90, -90], fl: [-95, -95, 0], na: [100, 100], fa: [0, 0] },
      x: [{ mv: [150, 112, 176, 108] }, { mv: [60, 132, 26, 134] }] },
  ] },
  "mckenzie-extension": { w: 200, f: [
    { l: "Lie face down", g: "mat", a: "Lying face down, legs straight, hands flat on the floor under the shoulders, elbows bent.",
      p: { hip: [96, 182], t: -90, h: -100, nl: [90, 90, 90] }, x: [{ body: [[50, 182, 70, 166, 56, 187]] }] },
    { l: "Press up, hips stay down", g: "mat", a: "The upper body pressed up through the palms only as far as is comfortable, elbows still bent, hips staying heavy on the floor.",
      p: { hip: [96, 182], t: -120, h: -125, nl: [90, 90, 90], na: [47, -64] }, x: [{ mvq: [24, 172, 18, 154, 30, 138] }] },
  ] },
  "sciatic-neural-floss": { w: 160, f: [
    { l: "Knee bent, chin down", a: "Sitting upright on a chair, feet flat, hands on the thighs, chin dropped towards the chest.",
      p: { hip: [70, 150], t: 180, h: 160, nl: [90, 0, 90], na: [34, 34] }, x: [{ chair: [44, 152] }] },
    { l: "Straighten and look up, 1 second", a: "One knee slowly straightened out in front while the head tilts back to look up; then back down. A small, smooth pumping glide.",
      p: { hip: [70, 150], t: 180, h: 198, nl: [90, 90, 180], fl: [90, 0, 90], na: [34, 34] },
      x: [{ chair: [44, 152] }, { mvq: [118, 186, 136, 182, 146, 166] }] },
  ] },
  "seated-lumbar-rotation": { w: 160, f: [ROT_START, ROT_TURN] },
  "ql-stretch-side-bend": { w: 160, f: [
    { l: "Arm up", a: "Seen from the front, standing with feet hip-width apart, one arm raised straight overhead, the other by the side.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-5, -2], rl: [5, 2], la: [180, 180], ra: [6, 2] } },
    { l: "Lean over, hold 30 seconds", a: "Seen from the front, leaning slowly to the side, the raised arm reaching over the head in an arc; the stretch is felt along the side of the lower back on the raised-arm side; hips stay square.",
      p: { v: "front", hip: [80, 112], t: 165, ll: [-5, -2], rl: [5, 2], la: [175, 130], ra: [20, 10] },
      x: [{ ring: [68, 98] }, { mvq: [114, 22, 134, 30, 138, 56] }] },
  ] },
  "mcgill-curl-up": { w: 200, f: [
    { l: "Hands under the lower back", g: "mat", a: "Lying on the back, one knee bent with the foot flat, the other leg straight, both hands under the lower back.",
      p: { hip: [100, 178], t: -90, h: -95, nl: [140, 10, 90], fl: [90, 90, 170] }, x: [{ body: [[54, 178, 68, 187, 82, 184]] }] },
    { l: "Head up a little, hold 10", g: "mat", a: "Head and shoulders lifted just a few centimetres as one piece, chin gently tucked, the lower back still resting on the hands.",
      p: { hip: [100, 178], t: -98, h: -100, nl: [140, 10, 90], fl: [90, 90, 170] }, x: [{ body: [[54.4, 171.6, 68, 186, 82, 184]] }, { mv: [16, 172, 16, 156] }] },
  ] },
  "side-plank-modified": { w: 180, f: [
    { l: "Set up", a: "Lying on one side, knees bent with the feet behind, elbow under the shoulder, forearm on the floor, hips on the floor.",
      p: { hip: [74, 184], t: -132, h: -120, na: [0, 90], fa: [55, 60] },
      x: [{ body: [[74, 184, 112, 185.3]] }, { far: [[112, 185.3, 124, 168]] }] },
    { l: "Hips up, hold 15 to 20 seconds", a: "Hips lifted until the body is one straight line from the head to the knees, knees still on the floor, top hand resting on the hip.",
      p: { hip: [82, 172], t: -114, h: -112, na: [0, 90], fa: [66, 70] },
      x: [{ body: [[82, 172, 116.7, 187.5]] }, { far: [[116.7, 187.5, 128, 170]] }, { mv: [96, 188, 96, 178] }] },
  ] },
  "kegel-basic": { w: 160, f: [
    { l: "Squeeze and lift, hold 5", a: "Sitting comfortably and upright on a chair, feet flat on the floor, hands resting on the thighs.",
      p: { hip: [70, 150], t: 180, nl: [90, 0, 90], na: [34, 34] }, x: [{ chair: [44, 152] }] },
  ] },
  "kegel-quick-flicks": { w: 160, f: [
    { l: "Quick squeeze, quick release", a: "Sitting comfortably and upright on a chair, feet flat on the floor, hands resting on the thighs.",
      p: { hip: [70, 150], t: 180, nl: [90, 0, 90], na: [34, 34] }, x: [{ chair: [44, 152] }] },
  ] },
  "bridge-pelvic-floor": { w: 160, f: [
    { l: "Breathe in, prepare", g: "mat", a: "Lying on the back, knees bent, feet flat on the floor, arms by the sides.",
      p: { hip: [100, 178], t: -90, h: -95, nl: [140, 10, 90], fa: [96, 92] } },
    { l: "Breathe out, lift, hold 3", g: "mat", a: "Breathing out and gently squeezing the pelvic floor, hips lifted until the body is one straight line from shoulders to knees, feet still flat.",
      p: { hip: [97, 161], t: -68, h: -95, nl: [112, -5, 90], fa: [96, 92] }, x: [{ mv: [97, 188, 97, 173] }] },
  ] },
  "squat-pelvic-floor": { w: 160, f: [
    { l: "Stand, feet shoulder-width", a: "Standing tall, feet shoulder-width apart, arms by the sides.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 4] } },
    { l: "Lower slowly, pause, release", a: "Squatting down slowly, hips back and down, heels down, chest tall, arms reaching forward; the pelvic floor relaxes on the way down and lifts on the way up.",
      p: { hip: [65, 152], t: 155, nl: [85, -30, 90], na: [60, 75] }, x: [{ mvq: [40, 104, 30, 132, 42, 160] }] },
  ] },
  "hypermobility-joint-awareness": { w: 160, f: [
    { l: "Stand in neutral, joints soft", a: "Standing tall and relaxed, knees soft rather than locked back, elbows soft, arms by the sides.",
      p: { hip: [84, 112.1], t: 180, nl: [4, -4, 90], na: [-2, 8] } },
  ] },
  "hypermobility-knee-stability": { w: 160, f: [
    { l: "Soft knee, hold 20 seconds", a: "Standing on one leg beside a wall, one hand on it for balance, the standing knee bent just slightly so it is not locked; the front of the thigh gently working.",
      p: { hip: [76, 113.4], t: 180, nl: [10, -5, 90], fl: [10, -80, -40], na: [70, 90] }, x: [{ wall: 128 }, { ring: [86, 132] }] },
  ] },
  "hypermobility-shoulder-packing": { w: 160, f: [
    { l: "Arms relaxed", a: "Standing tall, arms relaxed by the sides.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 4] } },
    { l: "Blades down and back, hold 5", a: "The shoulder blades gently drawn down and back, without shrugging; arms still relaxed by the sides.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [-3, 2] }, x: [{ mvq: [70, 70, 62, 78, 66, 92] }] },
  ] },
  "hypermobility-hip-stability": { w: 160, f: [
    { l: "Hips level, hold 30 seconds", a: "Seen from the front, standing on one leg, the other foot hovering just off the floor, pelvis level, arms relaxed by the sides.",
      p: { v: "front", hip: [80, 112], t: 180, rl: [0, 0], la: [-6, -2], ra: [6, 2] },
      x: [{ far: [[72, 112, 70, 144, 72, 172, 64, 172]] }, { guide: [44, 112, 116, 112] }] },
  ] },
  "rehab-knee-terminal-extension": { w: 160, f: [
    { l: "Knee slightly bent", a: "Standing facing a band anchored at knee height, the band looped behind one knee, that knee slightly bent.",
      p: { hip: [80, 113.4], t: 180, nl: [15, -5, 90], fl: [0, 0, 90], na: [0, 4] }, x: [{ wall: 150 }, { band: [90, 148, 150, 148] }] },
    { l: "Straighten fully, squeeze", a: "The knee pushed back to fully straight against the band, the front of the thigh squeezed.",
      p: { hip: [80, 112], t: 180, nl: [0, 0, 90], fl: [0, 0, 90], na: [0, 4] }, x: [{ wall: 150 }, { band: [80, 150, 150, 148] }, { mv: [68, 140, 58, 140] }] },
  ] },
  "rehab-shoulder-y-t-w": { w: 200, f: YTW },
  "rehab-ankle-proprioception": { w: 160, f: [
    { l: "Level 1: flat floor", a: "Standing on one leg on the flat floor, the other foot lifted just off the floor behind, arms by the sides.",
      p: { hip: [84, 112.6], t: 180, nl: [8, -6, 90], fl: [10, -80, -40], na: [0, 4] } },
    { l: "Level 2: on a folded towel", a: "The same single-leg stand on a folded towel.",
      p: { hip: [84, 106.6], t: 180, nl: [8, -6, 90], fl: [10, -80, -40], na: [0, 4] }, x: [{ box: [62, 183, 50, 7] }] },
  ] },
  "rehab-wrist-flexion-extension": { w: 160, f: [
    { l: "Wrist down, palm up", a: "Sitting at a table, forearm resting on it with the wrist over the edge, palm up, holding a light dumbbell with the wrist lowered.",
      p: { hip: [46, 150], t: 150, nl: [90, 0, 90], na: [50, 92] },
      x: [{ chair: [20, 152] }, { box: [60, 128, 54, 6] }, { box: [106, 134, 4, 56] }, { body: [[115, 126, 120, 136]] }, { db: [121, 138, "s"] }] },
    { l: "Curl the wrist up, lower slowly", a: "Only the wrist moves: the hand lifted upwards with the dumbbell, the forearm staying on the table.",
      p: { hip: [46, 150], t: 150, nl: [90, 0, 90], na: [50, 92] },
      x: [{ chair: [20, 152] }, { box: [60, 128, 54, 6] }, { box: [106, 134, 4, 56] }, { body: [[115, 126, 120, 116]] }, { db: [121, 114, "s"] }, { mvq: [136, 136, 142, 126, 136, 114] }] },
  ] },
  "rehab-cervical-deep-flexors": { w: 200, f: [
    { l: "Rest, towel under the neck", g: "mat", a: "Lying on the back, legs straight, arms by the sides, a small rolled towel under the neck.",
      p: { hip: [112, 178], t: -90, h: -95, nl: [90, 90, 170], fa: [96, 92] }, x: [{ ball: [58, 183, 4] }] },
    { l: "Nod the chin, hold 10", g: "mat", a: "The chin gently nodded towards the chest, a very small movement; the head stays resting on the floor.",
      p: { hip: [112, 178], t: -90, h: -88, nl: [90, 90, 170], fa: [96, 92] }, x: [{ ball: [58, 183, 4] }, { mvq: [36, 156, 50, 152, 60, 162] }] },
  ] },
  "rehab-hip-flexor-strengthening": { w: 160, f: [
    { l: "Stand, band behind", a: "Standing on one leg facing away from the anchor, a band looped round the other ankle and anchored behind.",
      p: { hip: [84, 112], t: 180, nl: [-6, -6, 90], fl: [0, 0, 90], na: [0, 4] }, x: [{ wall: 14 }, { band: [80, 186, 14, 176] }] },
    { l: "Knee up to hip height", a: "The banded knee driven up to hip height against the band; lower it with control.",
      p: { hip: [84, 112], t: 180, nl: [90, 0, 90], fl: [0, 0, 90], na: [0, 4] },
      x: [{ wall: 14 }, { band: [122, 150, 14, 176] }, { mvq: [140, 176, 146, 150, 136, 126] }] },
  ] },
  "rehab-lateral-hip-strengthening": { w: 200, f: [
    { l: "Side-lying leg raise", g: "mat", a: "Lying on one side, head resting on the lower arm, legs straight, the top leg lifted a little way.",
      p: { hip: [100, 180], t: -88, h: -100, nl: [115, 115, 115], fl: [90, 90, 90], na: [-85, -90], fa: [80, 90] } },
    { l: "Standing: leg out to the side", a: "Seen from the front, standing on one leg, the other leg lifted straight out to the side.",
      p: { v: "front", hip: [100, 112], t: 180, rl: [0, 0], ll: [-25, -25], la: [-6, -2], ra: [6, 2] }, x: [{ mvq: [54, 186, 40, 182, 34, 168] }] },
  ] },
  "rehab-thoracic-mobility-rehab": { w: 160, f: [
    { ...ROT_TURN, l: "Seated rotation", x: SEAT_FRONT },
    { l: "Wall slides", a: "Seen from the front, back against a wall, both arms slid up it from a goalpost position, keeping contact.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [-150, -175], ra: [150, 175] },
      x: [{ mv: [24, 66, 24, 36] }, { mv: [136, 66, 136, 36] }] },
  ] },
  "rehab-breathing-rehab": { w: 160, f: [
    { l: "Lie and breathe into the belly", g: "mat", a: "Lying on the back, knees bent, feet flat on the floor, one hand resting on the chest and one on the belly.",
      p: BELLY_BREATH, x: BELLY_HANDS },
  ] },
  "rehab-neural-flossing": { w: 160, f: [
    { l: "Knee bent, look down", a: "Sitting upright on the edge of a chair, feet flat, hands on the thighs, looking down.",
      p: { hip: [74, 150], t: 180, h: 160, nl: [90, 0, 90], na: [34, 34] }, x: [{ chair: [44, 152] }] },
    { l: "Straighten and look up", a: "One leg slowly straightened out in front while looking up; then bend the knee and look down again. Very slow.",
      p: { hip: [74, 150], t: 180, h: 198, nl: [90, 90, 180], fl: [90, 0, 90], na: [34, 34] },
      x: [{ chair: [44, 152] }, { mvq: [122, 186, 138, 182, 148, 166] }] },
  ] },
};
