/**
 * js/data/figures/batch-04.js
 * 04 Oct 2026 v1
 *
 * D-4 FIGURES, batch 04: strength, second half: barbell lifts, resistance
 * bands, dumbbell variations, carries, planks and holds.
 * The format is described in js/figures.js.
 */
export const FIGURES_04 = {
  "barbell-row": { w: 160, f: [
    { l: "Bar below the chest", a: "Hinged forward to about 45 degrees, knees soft, back flat, holding a barbell at arm's length below the chest.",
      p: { hip: [62, 120], t: 135, h: 125, nl: [37.8, -2, 90], na: [0, 0], hold: "plate" } },
    { l: "Pull to the lower ribs", a: "The bar pulled up to the lower ribs, elbows driven back and up, shoulder blades squeezed; the back and the hinge angle stay the same.",
      p: { hip: [62, 120], t: 135, h: 125, nl: [37.8, -2, 90], na: [-93.4, 30], hold: "plate" }, x: [{ mv: [124, 150, 124, 118] }] },
  ] },
  "barbell-rdl": { w: 160, f: [
    { l: "Start", a: "Standing tall holding a barbell at hip height with straight arms.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 3], hold: "plate" } },
    { l: "Hips back, back flat", a: "Hinged at the hips: hips pushed back, knees soft, back flat, the bar lowered close to the legs to about mid-shin; the stretch is felt in the back of the thighs.",
      p: { hip: [63.4, 123.6], t: 115, nl: [45, -9.5, 90], na: [0, 0], hold: "plate" }, x: [{ mv: [52, 104, 30, 104] }, { ring: [70, 143] }] },
  ] },
  "barbell-hip-thrust": { w: 160, f: [
    { l: "Start", a: "Sitting on the floor with the upper back against the edge of a bench, a padded barbell across the hips held in place by the hands, knees bent, feet flat on the floor.",
      p: { hip: [86, 174], t: -119.9, h: -137.9, nl: [125.9, 17.2, 90], na: [107, 30], hold: "plate" }, x: [{ bench: [8, 50, 152] }] },
    { l: "Hips up, squeeze", a: "Hips driven up until the body is roughly flat from shoulders to knees, shins upright, feet flat, chin tucked looking forward; the upper back stays on the bench.",
      p: { hip: [90, 150], t: -90, h: -120, nl: [90, 0, 90], na: [135.5, 66.1], hold: "plate" }, x: [{ bench: [8, 50, 152] }, { mv: [110, 186, 110, 166] }] },
  ] },
  "barbell-front-squat": { w: 160, f: [
    { l: "Bar on the shoulders", a: "Standing tall, feet shoulder-width apart, a barbell resting on the front of the shoulders, elbows lifted high and pointing forward.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [80, -115] }, x: [{ plate: [96, 71] }] },
    { l: "Squat, chest up", a: "Squatted down with the torso nearly upright, elbows still high, heels down, knees over the toes.",
      p: { hip: [65, 152], t: 166, nl: [85, -30, 90], na: [80, -115] }, x: [{ plate: [85.5, 113] }, { mvq: [40, 104, 30, 132, 42, 160] }] },
  ] },
  "barbell-good-morning": { w: 160, f: [
    { l: "Bar on the upper back", a: "Standing tall, feet hip-width apart, knees slightly bent, a barbell resting across the upper back, hands holding it either side.",
      p: { hip: [82, 114], t: 180, nl: [14.6, -11.5, 90], na: [-69.2, 128.7] }, x: [{ plate: [77, 64] }] },
    { l: "Hips back, back flat", a: "Hinged at the hips until the torso is roughly parallel to the floor, hips pushed back, knees still only slightly bent, back flat.",
      p: { hip: [46, 124], t: 100, h: 98, nl: [42.4, 19, 90], na: [-224.9, -64] }, x: [{ plate: [88.3, 111] }, { mv: [40, 104, 20, 104] }] },
  ] },
  "barbell-power-clean": { w: 160, f: [
    { l: "Set up", a: "Deadlift set-up: the barbell on the floor over the middle of the foot, hips above the knees, back flat, arms straight gripping the bar.",
      p: { hip: [64, 148], t: 120, h: 112, nl: [80.5, -27.4, 90], na: [-1.6, -15.9], hold: "plate" } },
    { l: "Hips drive, shrug", a: "Standing up fast: hips driven forward, legs straight, up on the toes, shoulders shrugged, arms still straight with the bar at the hips.",
      p: { hip: [84, 103], t: 184, nl: [0, 0, 50], na: [6, 6], hold: "plate" }, x: [{ mv: [126, 160, 126, 120] }] },
    { l: "Catch, elbows up", a: "The bar caught on the front of the shoulders in a quarter squat, elbows high and pointing forward, back upright.",
      p: { hip: [70, 132], t: 170, nl: [54.6, -26.5, 90], na: [95, -88] }, x: [{ plate: [86, 84.7] }, { mv: [126, 80, 126, 108] }] },
  ] },
  "band-pull-apart": { w: 160, f: [
    { l: "Arms out in front", a: "Seen from the side, standing tall, both arms straight out in front at shoulder height, hands shoulder-width apart holding a resistance band.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [91, 91], fa: [89, 89] } },
    { l: "Pull the band apart", a: "Seen from the front, arms drawn straight out to the sides at shoulder height, the band stretched across the chest, shoulder blades squeezed together, shoulders down.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [-90, -90], ra: [90, 90] }, x: [{ band: [13, 66, 147, 66] }, { mv: [44, 90, 20, 90] }, { mv: [116, 90, 140, 90] }] },
  ] },
  "band-face-pull": { w: 160, f: [
    { l: "Arms reaching forward", a: "Standing, facing a band anchored at face height, holding it with both hands, arms straight out in front at face height, the band taut.",
      p: { hip: [64, 112], t: 180, nl: [0, 0, 90], na: [100, 100], fa: [98, 98] }, x: [{ wall: 150 }, { band: [115, 57, 150, 54] }] },
    { l: "Pull to the face", a: "Seen from the front, the band pulled to the face: elbows out to the sides at shoulder height, hands beside the face, thumbs turned back.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [-90, 151], ra: [90, -151] } },
  ] },
  "band-squat": { w: 160, f: [
    { l: "Start", a: "Standing tall on the middle of a band, feet shoulder-width apart, holding the band ends at shoulder height.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [28, 172] }, x: [{ band: [94, 188, 100, 64] }] },
    { l: "Squat down", a: "Squatting down, chest up, heels down, knees pushed out over the toes, hands still at the shoulders holding the band.",
      p: { hip: [65, 152], t: 155, nl: [85, -30, 90], na: [45.3, -155.1] }, x: [{ band: [91, 188, 92, 106] }, { mvq: [40, 104, 30, 132, 42, 160] }] },
  ] },
  "band-hip-hinge": { w: 160, f: [
    { l: "Start", a: "Standing tall on the middle of a band, holding an end in each hand, arms straight, band taut.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 3] }, x: [{ band: [91, 188, 86, 118] }] },
    { l: "Hips back, back flat", a: "Hinged at the hips: hips pushed back, knees soft, back flat, arms hanging straight holding the band.",
      p: { hip: [63.4, 123.6], t: 115, nl: [45, -9.5, 90], na: [0, 0] }, x: [{ band: [91, 188, 105, 156] }, { mv: [52, 104, 30, 104] }] },
  ] },
  "band-chest-press": { w: 160, f: [
    { l: "Hands at the chest", a: "Standing with a band anchored behind at chest height, an end in each hand, hands at the chest, elbows bent and back.",
      p: { hip: [90, 112], t: 180, nl: [0, 0, 90], na: [-22.6, 112.6] }, x: [{ wall: 12 }, { band: [12, 82, 104, 80] }] },
    { l: "Press forward", a: "Both hands pressed forward at chest height until the arms are straight.",
      p: { hip: [90, 112], t: 180, nl: [0, 0, 90], na: [80.8, 77] }, x: [{ wall: 12 }, { band: [12, 82, 141, 76] }, { mv: [110, 98, 136, 98] }] },
  ] },
  "band-row-seated": { w: 160, f: [
    { l: "Sit tall, arms forward", a: "Sitting tall on the floor, legs straight out in front, a band looped around both feet, an end in each hand, arms straight out in front.",
      p: { hip: [40, 181], t: 180, nl: [92, 92, 180], na: [97, 97] }, x: [{ band: [92, 140, 120, 174] }] },
    { l: "Pull to the ribs", a: "Hands pulled to the lower ribs, elbows travelling back, shoulder blades squeezed, still sitting tall.",
      p: { hip: [40, 181], t: 180, nl: [92, 92, 180], na: [-31.2, 101.6] }, x: [{ band: [52, 152, 120, 174] }, { mv: [104, 128, 76, 128] }] },
  ] },
  "band-lateral-walk": { w: 160, f: [
    { l: "Shallow squat, band on", a: "Seen from the front, a band around both legs just above the knees, feet hip-width apart, knees slightly bent, hands on the hips.",
      p: { v: "front", hip: [80, 113], t: 180, ll: [-6, 3], rl: [6, -3], la: [-35, 40], ra: [35, -40] }, x: [{ band: [69, 141, 91, 141] }] },
    { l: "Step out to the side", a: "Seen from the front, one foot stepped out to the side, the band stretched between the knees, still in the shallow squat.",
      p: { v: "front", hip: [80, 112.5], t: 180, ll: [-8, -5], rl: [16, 6], la: [-35, 40], ra: [35, -40] }, x: [{ band: [68, 140, 96, 140] }, { mv: [118, 172, 142, 172] }] },
  ] },
  "band-standing-row": { w: 160, f: [
    { l: "Arm reaching to the band", a: "Standing tall, holding a band anchored at waist height in one hand, that arm reaching towards the anchor, the other arm relaxed.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [54.7, 43.2], fa: [0, 2] }, x: [{ wall: 150 }, { band: [123, 100, 150, 112] }] },
    { l: "Elbow back to the hip", a: "The band pulled to the hip, elbow travelling back, body staying square without twisting.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [-20.4, 41], fa: [0, 2] }, x: [{ wall: 150 }, { band: [92, 110, 150, 112] }, { mv: [128, 128, 104, 128] }] },
  ] },
  "band-bicep-curl": { w: 160, f: [
    { l: "Start", a: "Standing tall on the middle of a band, an end in each hand, arms straight down, palms facing forward.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 3] }, x: [{ band: [91, 188, 85, 118] }] },
    { l: "Curl up, elbows tucked", a: "Hands curled up towards the shoulders, elbows staying tucked at the sides.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 160] }, x: [{ band: [96, 188, 93, 68] }, { mvq: [110, 116, 124, 96, 108, 72] }] },
  ] },
  "band-tricep-pushdown": { w: 160, f: [
    { l: "Elbows bent at the sides", a: "Standing facing a band anchored above head height, an end in each hand, elbows bent to about a right angle and pinned to the sides.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 95] }, x: [{ wall: 142 }, { band: [110, 90, 142, 34] }] },
    { l: "Push down, arms straight", a: "Hands pushed down towards the hips until the arms are straight, elbows still pinned to the sides.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [3, 10] }, x: [{ wall: 142 }, { band: [90, 118, 142, 34] }, { mvq: [118, 92, 122, 110, 106, 124] }] },
  ] },
  "band-overhead-press": { w: 160, f: [
    { l: "At the shoulders", a: "Seen from the front, standing on the middle of a band, holding the ends at shoulder height, elbows below the hands.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [-39, 175], ra: [39, -175] }, x: [{ band: [62, 188, 50, 61] }, { band: [98, 188, 110, 61] }] },
    { l: "Press up", a: "Seen from the front, both hands pressed straight up until the arms are straight, lower back not arched.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [-167, 176], ra: [167, -176] }, x: [{ band: [62, 188, 60, 16] }, { band: [98, 188, 100, 16] }, { mv: [22, 74, 22, 36] }, { mv: [138, 74, 138, 36] }] },
  ] },
  "band-pallof-press": { w: 180, f: [
    { l: "Hands at the chest", a: "Seen from the front, standing side-on to a band anchored at chest height, feet apart, holding the band with both hands at the middle of the chest.",
      p: { v: "front", hip: [66, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [101.9, -26.1], ra: [-101.9, 26.1] }, x: [{ wall: 172 }, { band: [68, 84, 172, 80] }] },
    { l: "Press out, hold 2 seconds", a: "Seen from the side, both hands pressed straight out in front of the chest until the arms are straight, held for 2 seconds; the body stays square, not turning towards the band.",
      p: { hip: [66, 112], nl: [0, 0, 90], fl: [0, 0, 90], t: 180, na: [79, 101], fa: [77, 103] }, x: [{ mv: [124, 96, 146, 96] }] },
  ] },
  "dumbbell-step-up": { w: 160, f: [
    { l: "Foot on the step", a: "Standing in front of a step holding a dumbbell in each hand, one foot placed flat on top of the step.",
      p: { hip: [64, 112], t: 180, fl: [0, 0, 90], nl: [79.4, 1, 90], na: [0, 4], fa: [0, 2], hold: "dbs", holdF: "dbs" }, x: [{ box: [92, 160, 60, 30] }] },
    { l: "Stand tall on top", a: "Standing fully upright on top of the step, both feet on it, dumbbells by the sides.",
      p: { hip: [106, 84], t: 180, nl: [0, 0, 90], fl: [0, 0, 90], na: [0, 4], fa: [0, 2], hold: "dbs", holdF: "dbs" }, x: [{ box: [92, 160, 60, 30] }, { mvq: [44, 130, 48, 92, 78, 84] }] },
  ] },
  "dumbbell-reverse-lunge": { w: 160, f: [
    { l: "Start", a: "Standing tall, feet together, a dumbbell in each hand by the sides.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 4], fa: [0, 2], hold: "dbs", holdF: "dbs" } },
    { l: "Step back and down", a: "One foot stepped straight back, back knee lowered towards the floor, front knee over the front ankle, body upright, dumbbells by the sides.",
      p: { hip: [90, 149], t: 180, nl: [88, 0, 90], fl: [-20, -82, -90], na: [0, 4], fa: [0, 2], hold: "dbs", holdF: "dbs" }, x: [{ mvq: [62, 118, 40, 136, 44, 168] }] },
  ] },
  "dumbbell-shoulder-y-raise": { w: 160, f: [
    { l: "Arms hanging", a: "Seen from the front, standing, a very light dumbbell in each hand, arms hanging.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], hold: "dbs", la: [-6, -3], ra: [6, 3] } },
    { l: "Raise into a Y", a: "Seen from the front, both arms raised up and out into a Y shape, about 30 to 45 degrees out from the ears, thumbs up, shoulders down.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], hold: "dbs", la: [-152, -152], ra: [152, 152] }, x: [{ mvq: [34, 112, 12, 84, 22, 52] }, { mvq: [126, 112, 148, 84, 138, 52] }] },
  ] },
  "dumbbell-single-leg-deadlift": { w: 200, f: [
    { l: "Stand on one leg", a: "Standing tall on one leg, the other foot just off the floor behind, a dumbbell in the hand on the side of the lifted leg.",
      p: { hip: [100, 112], t: 180, fl: [0, 0, 90], nl: [-8, -30, 120], na: [0, 3], fa: [0, 2], hold: "dbs" } },
    { l: "Hinge, leg reaches back", a: "Hinged forward over the standing leg, back flat, the free leg reaching straight back in line with the body, hips square, the dumbbell lowered towards the floor.",
      p: { hip: [102, 118], t: 100, h: 98, fl: [28.5, -15.5, 90], nl: [-80, -80, -10], na: [0, 0], fa: [8, 8], hold: "dbs" }, x: [{ mvq: [56, 166, 36, 162, 26, 144] }] },
  ] },
  "dumbbell-incline-row": { w: 160, f: [
    { l: "Arms hanging", a: "Lying face down on a bench set to about 45 degrees, chest on the pad, feet on the floor, a dumbbell in each hand hanging straight down.",
      p: { hip: [74, 128], t: 135, h: 130, nl: [-67.3, -10.5, -45], na: [0, 0], fa: [0, 0], hold: "dbs", holdF: "dbs" }, x: [{ bar: [62, 146, 102, 106] }, { box: [72, 126, 6, 64] }, { bar: [52, 188, 100, 188] }] },
    { l: "Row to the ribs", a: "Both dumbbells rowed up to the lower ribs, elbows driving back, chest staying on the pad.",
      p: { hip: [74, 128], t: 135, h: 130, nl: [-67.3, -10.5, -45], na: [-87.4, 26.1], fa: [-87.4, 26.1], hold: "dbs", holdF: "dbs" }, x: [{ bar: [62, 146, 102, 106] }, { box: [72, 126, 6, 64] }, { bar: [52, 188, 100, 188] }, { mv: [126, 150, 126, 120] }] },
  ] },
  "dumbbell-goblet-squat-pause": { w: 160, f: [
    { l: "Start", a: "Standing tall, holding a dumbbell upright at the chest with both hands.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [10, 160], hold: "dbv" } },
    { l: "Pause 3 seconds", a: "Squatted down to around parallel, heels down, chest tall, dumbbell at the chest, held still for 3 seconds.",
      p: { hip: [65, 152], t: 155, nl: [85, -30, 90], na: [33, 160], hold: "dbv" }, x: [{ mvq: [40, 104, 30, 132, 42, 160] }] },
  ] },
  "dumbbell-floor-fly": { w: 160, f: [
    { l: "Arms over the chest", g: "mat", a: "Seen from the feet end, lying on the back on the floor, both arms reaching up over the chest, elbows slightly bent, a dumbbell in each hand.",
      x: [{ head: [80, 176] }, { body: [[62, 182, 98, 182], [62, 182, 66, 156, 74, 130], [98, 182, 94, 156, 86, 130]] }, { db: [74, 126, "s"] }, { db: [86, 126, "s"] }] },
    { l: "Lower out to the sides", g: "mat", a: "Seen from the feet end, both arms lowered out to the sides in an arc, elbows still slightly bent, upper arms resting on the floor.",
      x: [{ head: [80, 176] }, { body: [[62, 182, 98, 182], [62, 182, 38, 184, 14, 176], [98, 182, 122, 184, 146, 176]] }, { db: [14, 172, "s"] }, { db: [146, 172, "s"] }, { mvq: [58, 116, 30, 120, 18, 152] }, { mvq: [102, 116, 130, 120, 142, 152] }] },
  ] },
  "functional-carry-overhead": { w: 160, f: [
    { l: "Walk with it overhead", a: "Seen from the front, walking tall with a dumbbell pressed straight overhead in one hand, arm beside the ear, the other arm by the side, shoulders level.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [-6, -3], ra: [178, 180], holdR: "dbs" } },
  ] },
  "functional-sandbag-carry": { w: 160, f: [
    { l: "Hug it and walk", a: "Walking tall, a heavy dumbbell hugged against the chest with both arms, back upright, not leaning back.",
      p: { hip: [84, 114], t: 180, nl: [18, 0, 90], fl: [-12, -32, 65], na: [22, 140], fa: [18, 144] }, x: [{ db: [104, 82, "v"] }] },
  ] },
  "dumbbell-zottman-curl": { w: 160, f: [
    { l: "Palms up", a: "Standing tall, a dumbbell in each hand, arms straight down, palms facing up and forward.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 4], fa: [0, 2], hold: "dbs", holdF: "dbs" } },
    { l: "Curl, turn, lower slowly", a: "Dumbbells curled to shoulder height with the elbows at the sides; at the top the palms turn to face down for a slow lowering.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [8, 160], fa: [4, 158], hold: "dbs", holdF: "dbs" }, x: [{ mvq: [114, 116, 128, 96, 112, 72] }] },
  ] },
  "dumbbell-pullover": { w: 180, f: [
    { l: "Over the chest", a: "Lying across a bench with only the upper back on it, feet flat on the floor, hips level, holding one dumbbell in both hands over the chest, arms slightly bent.",
      p: { hip: [116, 150], t: -95, h: -85, nl: [89.9, -3, 90], na: [176, 184], hold: "dbv" }, x: [{ box: [64, 152, 26, 38] }] },
    { l: "Arc back behind the head", a: "The dumbbell lowered in an arc behind the head, arms still slightly bent, ribs down; the stretch is felt across the chest and the sides of the back.",
      p: { hip: [116, 150], t: -95, h: -85, nl: [89.9, -3, 90], na: [-112, -104], hold: "dbw" }, x: [{ box: [64, 152, 26, 38] }, { mvq: [96, 84, 50, 70, 26, 108] }, { ring: [84, 138] }] },
  ] },
  "bodyweight-pistol-squat-progression": { w: 160, f: [
    { l: "One leg out in front", a: "Standing on one leg, holding a pole for balance, the other leg straight out in front just off the floor.",
      p: { hip: [80, 112], t: 180, nl: [0, 0, 90], fl: [36, 36, 160], na: [40, 76.4], fa: [47.5, 61.4] }, x: [{ wall: 124 }] },
    { l: "Lower slowly", a: "Lowered slowly on the standing leg, only as deep as is controlled, heel down, knee over the toes, the other leg held straight out in front, hands on the pole.",
      p: { hip: [62, 146], t: 145, nl: [76.2, -29.8, 90], fl: [80, 80, 160], na: [34.3, 133.2], fa: [28.7, 125.6] }, x: [{ wall: 124 }, { mvq: [40, 104, 30, 128, 40, 150] }] },
  ] },
  "bodyweight-nordic-curl-progression": { w: 180, f: [
    { l: "Kneel tall, feet held", g: "mat", a: "Kneeling upright on a soft surface, feet anchored under something heavy, body straight from knees to head, arms crossed over the chest.",
      p: { hip: [80, 148], t: 180, nl: [0, -90, -90], na: [25, 150] }, x: [{ pad: [26, 172, 24, 10] }] },
    { l: "Lower slowly forward", g: "mat", a: "Leaning slowly forward from the knees with the body in one straight line from knees to head, hips not bending, hands ready in front to catch.",
      p: { hip: [104.4, 156.9], t: 140, nl: [-40, -90, -90], na: [50, 30] }, x: [{ pad: [26, 172, 24, 10] }, { mvq: [96, 76, 134, 70, 158, 92] }] },
  ] },
  "isometric-wall-sit": { w: 160, f: [
    { l: "Hold, knees over ankles", a: "Back flat against a wall, slid down until the knees are bent at about a right angle, thighs level, knees directly over the ankles, feet flat, arms by the sides.",
      p: { hip: [48, 150], t: 180, nl: [90, 0, 90], na: [0, 0] }, x: [{ wall: 34 }] },
  ] },
  "isometric-hollow-hold": { w: 200, f: [
    { l: "Hold the dish shape", g: "mat", a: "Lying on the back, lower back pressed into the floor, arms reaching overhead, shoulders, arms and legs lifted slightly off the floor in a shallow dish shape.",
      p: { hip: [104, 180], t: -102, h: -108, na: [-110, -110], fa: [-107, -107], nl: [102, 102, 120], fl: [99, 99, 118] } },
  ] },
  "band-bent-over-row": { w: 160, f: [
    { l: "Arms hanging straight", a: "Standing on the middle of a band, hinged at the hips so the chest is about halfway to parallel with the floor, back flat, arms hanging straight holding the band ends.",
      p: { hip: [62, 120], t: 135, h: 125, nl: [37.8, -2, 90], na: [0, 0] }, x: [{ band: [90, 188, 94.5, 139.5] }] },
    { l: "Elbows lead back", a: "Both hands pulled towards the bottom of the ribs, elbows leading back, back still flat and the hinge unchanged.",
      p: { hip: [62, 120], t: 135, h: 125, nl: [37.8, -2, 90], na: [-93.4, 30] }, x: [{ band: [90, 188, 81.6, 108.4] }, { mv: [124, 150, 124, 118] }] },
  ] },
  "dumbbell-front-rack-carry": { w: 160, f: [
    { l: "Walk tall, elbows forward", a: "Walking tall, a dumbbell in each hand resting against the front of each shoulder, elbows pointing forwards and down, ribs down, not leaning back.",
      p: { hip: [84, 114], t: 180, nl: [18, 0, 90], fl: [-12, -32, 65], na: [33.8, -170.2], fa: [33.8, -170.2], hold: "dbs", holdF: "dbs" } },
  ] },
  "dumbbell-overhead-carry": { w: 160, f: [
    { l: "Walk with it overhead", a: "Seen from the front, walking with one dumbbell held straight overhead, arm close to the ear, palm facing forward, the weight stacked over the shoulder; ribs down, the other arm by the side.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [-6, -3], ra: [178, 180], holdR: "dbw" } },
  ] },
  "plank-shoulder-tap": { w: 180, f: [
    { l: "Press-up position", a: "Press-up position: hands under the shoulders, arms straight, feet a little apart on the toes, body flat from shoulders to heels.",
      p: { hip: [94, 154], t: 113, h: 108, nl: [-67, -67, -60], na: [0, 0], fa: [0, 0] } },
    { l: "Tap, then swap hands", a: "One hand lifted to tap the opposite shoulder while the other arm holds, hips staying level and still.",
      p: { hip: [94, 154], t: 113, h: 108, nl: [-67, -67, -60], na: [-64.6, 101.4], fa: [0, 0] }, x: [{ mvq: [150, 182, 162, 168, 150, 156] }] },
  ] },
  "band-pallof-press-split-stance": { w: 180, f: [
    { l: "Side-on, hands at the chest", a: "Seen from the front, standing side-on to a band anchored at chest height, holding the band against the breastbone with both hands.",
      p: { v: "front", hip: [66, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [101.9, -26.1], ra: [-101.9, 26.1] }, x: [{ wall: 172 }, { band: [68, 84, 172, 80] }] },
    { l: "Split stance, press out", a: "Seen from the side, in a split stance with one foot forward and one back, both feet flat, both hands pressed straight out in front of the chest and held for a moment; shoulders stay square.",
      p: { hip: [66, 114], nl: [15, 0, 90], fl: [-15, -15, 90], t: 180, na: [79, 101], fa: [77, 103] }, x: [{ mv: [124, 96, 146, 96] }] },
  ] },
  "plank-single-arm-reach": { w: 200, f: [
    { l: "Forearm plank", a: "Forearms on the floor, elbows under the shoulders, feet wide on the toes, body one flat line from shoulders to heels.",
      p: { hip: [100.9, 171], t: 101.3, h: 101, nl: [-78.7, -78.7, -79], na: [0, 90], fa: [0, 90] } },
    { l: "Reach, then swap arms", a: "One arm slid forward along the floor until it is nearly straight, the other forearm still on the floor, hips steady and level.",
      p: { hip: [100.9, 171], t: 101.3, h: 101, nl: [-78.7, -78.7, -79], na: [76.8, 45.9], fa: [0, 90] }, x: [{ mv: [160, 136, 188, 136] }] },
  ] },
  "dumbbell-suitcase-hold": { w: 160, f: [
    { l: "Stand tall and still", a: "Seen from the front, standing tall, feet hip-width apart, one dumbbell hanging at one side like a suitcase, arm straight, both shoulders level.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], la: [-6, -3], ra: [4, 2], holdR: "dbs" }, x: [{ guide: [44, 62, 116, 62] }] },
  ] },
  "hammer-curl": { w: 160, f: [
    { l: "Palms facing in", a: "Standing tall, a dumbbell in each hand at the sides, palms facing in.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 4], fa: [0, 2], hold: "dbw", holdF: "dbw" } },
    { l: "Curl up, lower slowly", a: "Elbows bent to bring the dumbbells up towards the shoulders, palms still facing in, upper arms still at the sides.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 165], fa: [0, 160], hold: "dbv", holdF: "dbv" }, x: [{ mvq: [110, 116, 124, 96, 108, 72] }] },
  ] },
  "front-raise": { w: 160, f: [
    { l: "Weights at the thighs", a: "Standing tall, a light dumbbell in each hand in front of the thighs, elbows soft.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [6, 12], fa: [4, 10], hold: "dbs", holdF: "dbs" } },
    { l: "Lift forward, lower slowly", a: "Both arms lifted forward with a soft bend in the elbows, up to about shoulder height or as high as is comfortable.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [86, 94], fa: [84, 92], hold: "dbs", holdF: "dbs" }, x: [{ mvq: [114, 126, 140, 112, 144, 84] }] },
  ] },
  "lateral-raise": { w: 160, f: [
    { l: "Weights at the sides", a: "Seen from the front, standing tall, a light dumbbell in each hand at the sides.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], hold: "dbs", la: [-6, -3], ra: [6, 3] } },
    { l: "Lift out, lower slowly", a: "Seen from the front, both arms lifted out to the sides with a soft bend in the elbows, up to about shoulder height or as high as is comfortable, shoulders down.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-8, -2], rl: [8, 2], hold: "dbs", la: [-84, -96], ra: [84, 96] }, x: [{ mvq: [44, 116, 22, 106, 16, 84] }, { mvq: [116, 116, 138, 106, 144, 84] }] },
  ] },
  "plank-to-push-up": { w: 180, f: [
    { l: "Plank on the forearms", a: "Forearm plank: forearms on the floor, elbows under the shoulders, toes on the floor, body one straight line from head to heels.",
      p: { hip: [100.9, 171], t: 101.3, h: 101, nl: [-78.7, -78.7, -79], na: [0, 90], fa: [0, 90] } },
    { l: "Press up one hand at a time", a: "Pressed up onto straight arms, one hand and then the other, hands under the shoulders, body still in one straight line; then back down one arm at a time.",
      p: { hip: [94, 154], t: 113, h: 108, nl: [-67, -67, -60], na: [0, 0], fa: [0, 0] }, x: [{ mv: [166, 166, 166, 140] }] },
  ] },
  "bear-hold": { w: 190, f: [
    { l: "Hands and knees, toes tucked", a: "On hands and knees, hands under the shoulders, knees under the hips, toes tucked under, back flat.",
      p: { hip: [88, 150], t: 108, h: 100, nl: [0, -100, -62], na: [0, 0] } },
    { l: "Knees up a little, hold", a: "Knees lifted just a little off the floor, back flat, hands and toes still on the floor; held, breathing steadily.",
      p: { hip: [88, 143], t: 106.8, h: 100, nl: [0, -95, -50], na: [0.8, -1.2] }, x: [{ mv: [100, 188, 100, 174] }] },
  ] },
};
