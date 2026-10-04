/**
 * js/data/figures/batch-08.js
 * 04 Oct 2026 v1
 *
 * D-4 FIGURES, batch 08: the seated exercises (chair-based strength, bands,
 * stretches and seated cardio), plus three standing ones holding a chair.
 * Every seated figure is drawn on a chair, as sit-to-stand is in batch 01.
 * The format is described in js/figures.js.
 */

// Side view: the chair, and the body sitting on it.
const CH = { chair: [44, 152] };
const SIT = { hip: [70, 150], t: 180, nl: [90, 0, 90] };
const SIT_FWD = { hip: [76, 150], t: 180, nl: [90, 0, 90] };   // away from the chair back

// Seen from the front, sitting on a chair (the thighs come towards us).
const sf = (c = 80) => [{ box: [c - 24, 148, 48, 8] }, { box: [c - 3, 156, 6, 34] },
  { body: [[c - 18, 188, c - 14, 150, c - 8, 142], [c + 18, 188, c + 14, 150, c + 8, 142]] }];
const SEAT = sf(80);
const FRONT = { v: "front", hip: [80, 142], t: 180 };

export const FIGURES_08 = {
  "seated-self-resisted-row": { w: 160, f: [
    { l: "Hands out in front", a: "Sitting tall on a chair, feet flat, both hands out in front at chest height, one hand in a loose fist cupped by the other palm.",
      p: { ...SIT, na: [82, 96], fa: [84, 94] }, x: [CH] },
    { l: "Elbow back, slowly", a: "The fist's elbow pulled slowly back towards the ribs while the other hand holds on and resists it; shoulder blade squeezed back at the end.",
      p: { ...SIT, na: [-22, 88], fa: [-14, 84] }, x: [CH, { mv: [126, 116, 102, 116] }] },
  ] },
  "seated-scapular-retraction": { w: 160, f: [
    { l: "Sit tall, arms relaxed", a: "Sitting tall on a chair, feet flat, arms relaxed at the sides.",
      p: { ...SIT_FWD, na: [10, 14] }, x: [CH] },
    { l: "Squeeze back and down, hold 3", a: "Both shoulder blades drawn back and down as if pinching something between them, shoulders kept away from the ears, arms still relaxed.",
      p: { ...SIT_FWD, bend: [2, 0], na: [-4, 8] }, x: [CH, { mv: [62, 98, 56, 110] }] },
  ] },
  "seated-hip-hinge": { w: 160, f: [
    { l: "Sit tall, arms crossed", a: "Sitting towards the front of a chair, feet flat, arms crossed over the chest, back tall.",
      p: { ...SIT_FWD, na: [35, -150] }, x: [CH] },
    { l: "Hinge forward, back flat", a: "Hinged forward from the hips with the back still flat, chest travelling forward rather than down, arms still crossed.",
      p: { hip: [76, 150], t: 140, nl: [90, 0, 90], na: [-5, 170] }, x: [CH, { mvq: [96, 78, 118, 74, 132, 90] }] },
  ] },
  "seated-wall-press": { w: 160, f: [
    { l: "Hands beside the hips", a: "Sitting tall on a chair, feet flat, hands flat on the seat beside the hips.",
      p: { ...SIT, na: [-26, 0] }, x: [CH] },
    { l: "Press down, hold 3", a: "Pressing down through the hands as if to lift up, without lifting, shoulders kept down away from the ears.",
      p: { ...SIT, na: [-26, 0] }, x: [CH, { mv: [36, 128, 36, 146] }] },
  ] },
  "seated-hip-flexor-stretch": { w: 160, f: [
    { l: "Leg back, hold 30 seconds", a: "Sitting tall on the front corner of a chair, the front foot flat on the floor, the other leg dropped back and down behind with the toes on the floor; the stretch is felt across the front of the hip of the back leg.",
      p: { hip: [80, 150], t: 180, fl: [90, 0, 90], nl: [-55, -84, 25], na: [34, 34] }, x: [{ chair: [40, 152] }, { ring: [84, 160] }] },
  ] },
  "seated-spinal-decompression": { w: 160, f: [
    { l: "Sit tall, hands in lap", a: "Sitting tall on a chair, feet flat, hands resting in the lap.",
      p: { ...SIT, na: [10, 60] }, x: [CH] },
    { l: "Breathe in, grow taller", a: "Breathing in and growing taller through the top of the head, shoulders kept down, chin level.",
      p: { ...SIT, na: [10, 60] }, x: [CH, { mv: [70, 70, 70, 54] }] },
  ] },
  "seated-arm-cycling": { w: 160, f: [
    { l: "Hands in front of chest", a: "Sitting tall with the back supported, both hands up in front of the chest, elbows bent, shoulders down.",
      p: { ...SIT, na: [20, 150], fa: [24, 146] }, x: [CH] },
    { l: "Circle forwards", a: "The arms circling forwards in large, smooth circles, as if pedalling with the hands: one arm reaching forward over the top while the other comes back underneath.",
      p: { ...SIT, na: [80, 100], fa: [30, 110] }, x: [CH, { mvq: [104, 84, 140, 80, 138, 118] }] },
  ] },
  "seated-punches": { w: 160, f: [
    { l: "Fists by the chin", a: "Sitting tall away from the chair back, feet flat, both fists up in front of the chin, elbows tucked in.",
      p: { ...SIT_FWD, na: [30, 170], fa: [32, 168] }, x: [CH] },
    { l: "Punch, then swap", a: "One arm punched straight forward at shoulder height, stopping just short of straight, while the other fist stays by the chin.",
      p: { ...SIT_FWD, na: [84, 92], fa: [32, 168] }, x: [CH, { mv: [104, 90, 128, 90] }] },
  ] },
  "seated-marching-cardio": { w: 160, f: [
    { l: "Sit tall, feet flat", a: "Sitting tall on a chair, both feet flat on the floor, hands resting on the thighs.",
      p: { ...SIT, fl: [90, 0, 90], na: [34, 34], fa: [34, 34] }, x: [CH] },
    { l: "Lift one knee, then the other", a: "One knee lifted as high as is comfortable, the other foot flat, arms swinging in opposition, body still tall.",
      p: { hip: [70, 150], t: 180, fl: [90, 0, 90], nl: [120, 10, 90], na: [-25, 40], fa: [25, 100] },
      x: [CH, { mv: [136, 176, 136, 152] }] },
  ] },
  "seated-shoulder-press": { w: 160, f: [
    { l: "At the shoulders", a: "Seen from the front, sitting tall on a chair, a dumbbell in each hand just above shoulder height, palms forward, elbows below the wrists.",
      p: { ...FRONT, la: [-39, 175], ra: [39, -175], hold: "dbw" }, x: SEAT },
    { l: "Press up, lower over 3", a: "Seen from the front, both dumbbells pressed up until the arms are almost straight, ribs down and lower back not arched.",
      p: { ...FRONT, la: [-167, 176], ra: [167, -176], hold: "dbw" }, x: [...SEAT, { mv: [22, 84, 22, 46] }, { mv: [138, 84, 138, 46] }] },
  ] },
  "seated-band-chest-press": { w: 160, f: [
    { l: "Hands beside the chest", a: "Sitting tall on a chair, a band passed around the chair back, an end in each hand level with the chest, elbows back.",
      p: { ...SIT, na: [-55, 90], fa: [-50, 88] }, x: [CH, { band: [46, 118, 75, 119] }] },
    { l: "Press forward, back over 3", a: "Both hands pressed forward until the arms are almost straight, elbows not locked, shoulders not rolling forward.",
      p: { ...SIT, na: [95, 92], fa: [93, 94] }, x: [CH, { band: [46, 118, 122, 105] }, { mv: [104, 92, 128, 92] }] },
  ] },
  "seated-lateral-raise": { w: 160, f: [
    { l: "Arms by the sides", a: "Seen from the front, sitting tall on a chair, a light dumbbell in each hand, arms relaxed at the sides.",
      p: { ...FRONT, la: [-12, -12], ra: [12, 12], hold: "dbs" }, x: SEAT },
    { l: "Raise to shoulder height", a: "Seen from the front, both arms raised out to the sides to shoulder height with a soft bend in the elbows, shoulders down.",
      p: { ...FRONT, la: [-85, -80], ra: [85, 80], hold: "dbs" }, x: [...SEAT, { mvq: [36, 140, 16, 136, 12, 118] }, { mvq: [124, 140, 144, 136, 148, 118] }] },
  ] },
  "seated-bicep-curl": { w: 160, f: [
    { l: "Arms straight", a: "Sitting tall on a chair, a dumbbell in each hand, arms hanging at the sides, palms forward, elbows by the ribs.",
      p: { ...SIT_FWD, na: [8, 6], hold: "dbs" }, x: [CH] },
    { l: "Curl up, lower over 3", a: "Both dumbbells curled up towards the shoulders, elbows still tucked against the ribs, body upright.",
      p: { ...SIT_FWD, na: [8, 155], hold: "dbs" }, x: [CH, { mvq: [108, 150, 118, 128, 106, 110] }] },
  ] },
  "seated-tricep-extension": { w: 160, f: [
    { l: "Arms straight overhead", a: "Sitting tall on a chair, holding one dumbbell overhead with both hands around one end, arms straight, upper arms close to the head.",
      p: { ...SIT, na: [168, 175], hold: "dbv" }, x: [CH] },
    { l: "Lower behind the head", a: "The elbows bent, still pointing forwards, to lower the dumbbell behind the head; back not arched.",
      p: { ...SIT, na: [165, -50], hold: "dbv" }, x: [CH, { mvq: [96, 44, 68, 26, 48, 64] }] },
  ] },
  "seated-pallof-press": { w: 180, f: [
    { l: "Hands at the chest", a: "Seen from the front, sitting tall on a chair side-on to a band anchored at chest height, holding the band with both hands at the centre of the chest.",
      p: { v: "front", hip: [104, 142], t: 180, la: [-26.1, 101.9], ra: [26.1, -101.9] }, x: [...sf(104), { wall: 14 }, { band: [14, 114, 102, 114] }] },
    { l: "Press out, hold 2 seconds", a: "Seen from the side, sitting tall, both hands pressed straight out in front of the chest until the arms are almost straight and held; the body stays square, not turning towards the anchor.",
      p: { ...SIT, na: [79, 101], fa: [77, 103] }, x: [CH, { mv: [128, 94, 150, 94] }] },
  ] },
  "seated-torso-rotation": { w: 160, f: [
    { l: "Hands together", a: "Seen from the front, sitting tall on a chair, feet flat, hands together in front of the chest, elbows out.",
      p: { ...FRONT, la: [-24.7, 107.1], ra: [24.7, -107.1] }, x: SEAT },
    { l: "Turn, pause, then other side", a: "Seen from the front, the ribs turned slowly to one side with the hands still together in front of the chest; hips and feet still facing forward.",
      p: { ...FRONT, la: [23.3, 98.6], ra: [78.2, -55.6], pale: ["ra"] }, x: [...SEAT, { mvq: [54, 58, 80, 42, 106, 58] }] },
  ] },
  "seated-knee-lift": { w: 160, f: [
    { l: "Sit tall, brace", a: "Sitting tall on a chair, both feet flat, hands resting lightly on the seat either side, stomach braced.",
      p: { ...SIT, fl: [90, 0, 90], na: [-26, 0] }, x: [CH] },
    { l: "Lift, hold 1 second", a: "One knee lifted slowly towards the chest as high as is comfortable, the other foot flat, body still upright without leaning back.",
      p: { hip: [70, 150], t: 180, fl: [90, 0, 90], nl: [130, 10, 90], na: [-26, 0] }, x: [CH, { mv: [134, 178, 134, 150] }] },
  ] },
  "seated-side-bend": { w: 160, f: [
    { l: "Sit tall", a: "Seen from the front, sitting tall on a chair, both feet flat, hands resting on the thighs.",
      p: { ...FRONT, la: [-10, 12], ra: [10, -12] }, x: SEAT },
    { l: "Lean, both hips down", a: "Seen from the front, leaning slowly directly to one side, one hand sliding down beside the leg, both hips staying down on the seat.",
      p: { ...FRONT, t: 162, h: 162, la: [-35, 13.2], ra: [5, 5] }, x: [...SEAT, { mvq: [72, 52, 96, 40, 116, 54] }] },
  ] },
  "seated-leg-extension": { w: 160, f: [
    { l: "Feet flat", a: "Sitting tall on a chair, both feet flat on the floor, knees bent to about a right angle, hands on the thighs.",
      p: { ...SIT, fl: [90, 0, 90], na: [34, 34] }, x: [CH] },
    { l: "Straighten, hold 2 seconds", a: "One leg straightened out in front until it is level with the hip, toes up, the other foot flat; body still upright.",
      p: { hip: [70, 150], t: 180, fl: [90, 0, 90], nl: [90, 90, 180], na: [34, 34] }, x: [CH, { mvq: [128, 186, 146, 182, 150, 160] }] },
  ] },
  "seated-hip-abduction-band": { w: 160, f: [
    { l: "Band above the knees", a: "Seen from the front, sitting tall on a chair, a looped band around both legs just above the knees, feet flat and hip-width apart, hands holding the sides of the seat.",
      p: { ...FRONT, la: [-20, -28], ra: [20, 28] }, x: [...SEAT, { band: [66, 148, 94, 148] }] },
    { l: "Knees out, hold 1 second", a: "Seen from the front, both knees pressed outwards against the band as far as is comfortable, feet still flat in the same place.",
      p: { ...FRONT, la: [-20, -28], ra: [20, 28] },
      x: [{ box: [56, 148, 48, 8] }, { box: [77, 156, 6, 34] }, { body: [[62, 188, 54, 150, 72, 142], [98, 188, 106, 150, 88, 142]] },
          { band: [54, 148, 106, 148] }, { mv: [42, 166, 30, 166] }, { mv: [118, 166, 130, 166] }] },
  ] },
  "seated-heel-toe-raise": { w: 160, f: [
    { l: "Heels up", a: "Sitting tall on a chair, both heels lifted as high as possible, toes staying down, hands on the thighs.",
      p: { ...SIT, nl: [99, 0, 60], na: [32, 32] }, x: [CH] },
    { l: "Then toes up", a: "Both heels lowered and both sets of toes lifted, heels staying down; then back to heels up.",
      p: { ...SIT, nl: [90, 0, 135], na: [34, 34] }, x: [CH, { mv: [138, 188, 138, 170] }] },
  ] },
  "seated-hamstring-curl-band": { w: 180, f: [
    { l: "Leg out, band at the ankle", a: "Sitting tall on a chair, one leg extended forward with the foot off the floor, a band looped round that ankle and anchored low in front, the other foot flat.",
      p: { hip: [70, 150], t: 180, fl: [90, 0, 90], nl: [80, 80, 170], na: [34, 34] }, x: [CH, { box: [160, 178, 10, 12] }, { band: [145, 163, 162, 180] }] },
    { l: "Heel back, hold 1 second", a: "The knee bent to pull the heel back towards the chair against the band, foot still just off the floor; the thigh stays where it was.",
      p: { hip: [70, 150], t: 180, fl: [90, 0, 90], nl: [105, -10, 120], na: [34, 34] },
      x: [CH, { box: [160, 178, 10, 12] }, { band: [100, 178, 162, 180] }, { mvq: [152, 150, 142, 164, 124, 164] }] },
  ] },
  "chair-supported-calf-raise": { w: 160, f: [
    { l: "Hands on the chair", a: "Standing tall behind a sturdy chair, both hands resting on the top of the chair back, feet hip-width apart and flat.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [-10.7, 61.4] }, x: [{ chair: [100, 146] }] },
    { l: "Rise, hold 2, lower over 3", a: "Risen up onto the balls of the feet as high as is comfortable, hands still resting lightly on the chair, body tall.",
      p: { hip: [84, 102], t: 180, nl: [0, 0, 44], na: [10.9, 30.2] }, x: [{ chair: [100, 146] }, { mv: [64, 188, 64, 172] }] },
  ] },
  "chair-supported-hip-abduction": { w: 160, f: [
    { l: "Hands on the chair", a: "Seen from the front, standing tall behind a sturdy chair, both hands resting on the chair back, feet hip-width apart.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-4, -2], rl: [4, 2], la: [-28.6, 14.4], ra: [28.6, -14.4] },
      x: [{ far: [[60, 146, 60, 114], [100, 146, 100, 114], [62, 152, 62, 190], [98, 152, 98, 190]] }, { box: [58, 146, 44, 6] }, { bar: [56, 114, 104, 114] }] },
    { l: "Leg out, lower over 3", a: "Seen from the front, one leg lifted straight out to the side, toes pointing forward, body upright and not leaning away; the hands still on the chair.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-2, -2], rl: [25, 25], la: [-28.6, 14.4], ra: [28.6, -14.4] },
      x: [{ far: [[60, 146, 60, 114], [100, 146, 100, 114], [62, 152, 62, 190], [98, 152, 98, 190]] }, { box: [58, 146, 44, 6] }, { bar: [56, 114, 104, 114] }, { mvq: [110, 124, 128, 128, 136, 148] }] },
  ] },
  "chair-supported-march": { w: 160, f: [
    { l: "Hands on the chair", a: "Standing tall behind a sturdy chair, hands resting on the chair back, feet hip-width apart.",
      p: { hip: [78, 112], t: 180, nl: [0, 0, 90], fl: [0, 0, 90], na: [41.4, 61.2] }, x: [{ chair: [116, 140] }] },
    { l: "Lift one knee, then the other", a: "One knee lifted to a comfortable height and the foot then placed back down, the other foot flat, hands resting on the chair rather than leaning on it.",
      p: { hip: [78, 112], t: 180, fl: [0, 0, 90], nl: [70, -10, 40], na: [41.4, 61.2] }, x: [{ chair: [116, 140] }, { mv: [56, 176, 56, 152] }] },
  ] },
  "seated-band-pull-apart": { w: 160, f: [
    { l: "Arms out in front", a: "Seen from the side, sitting tall on a chair, both arms straight out in front at chest height, hands shoulder-width apart holding a band.",
      p: { ...SIT, na: [91, 91], fa: [89, 89] }, x: [CH] },
    { l: "Pull apart, back over 3", a: "Seen from the front, sitting tall, arms drawn straight out to the sides, the band stretched across the chest, shoulder blades squeezed, shoulders down.",
      p: { ...FRONT, la: [-90, -90], ra: [90, 90] }, x: [...SEAT, { band: [13, 96, 147, 96] }, { mv: [44, 118, 20, 118] }, { mv: [116, 118, 140, 118] }] },
  ] },
  "seated-band-face-pull": { w: 160, f: [
    { l: "Arms straight out", a: "Seen from the side, sitting tall on a chair facing a band anchored at face height, holding it with both hands, arms straight out, the band taut.",
      p: { ...SIT, na: [100, 100], fa: [98, 98] }, x: [CH, { wall: 150 }, { band: [121, 95, 150, 92] }] },
    { l: "Pull to the face", a: "Seen from the front, the band pulled towards the face: elbows out wide and high at shoulder height, hands either side of the head, shoulder blades squeezed.",
      p: { ...FRONT, la: [-90, 151], ra: [90, -151] }, x: SEAT },
  ] },
  "seated-band-lat-pulldown": { w: 160, f: [
    { l: "Arms overhead", a: "Seen from the front, sitting tall on a chair beneath a band anchored above head height, an end in each hand, arms up overhead.",
      p: { ...FRONT, la: [-158, -167], ra: [158, 167] }, x: [...SEAT, { bar: [64, 12, 96, 12] }, { band: [48, 47, 80, 14] }, { band: [112, 47, 80, 14] }] },
    { l: "Elbows down to the ribs", a: "Seen from the front, both hands pulled down and out towards the shoulders, elbows driven down towards the ribs, body upright.",
      p: { ...FRONT, la: [-23, -166], ra: [23, 166] }, x: [...SEAT, { bar: [64, 12, 96, 12] }, { band: [48, 95, 80, 14] }, { band: [112, 95, 80, 14] }, { mv: [24, 56, 24, 90] }, { mv: [136, 56, 136, 90] }] },
  ] },
  "seated-band-external-rotation": { w: 160, f: [
    { l: "Elbow tucked, hand in front", a: "Seen from the front, sitting tall on a chair, side-on to a band anchored at elbow height, the working elbow bent and tucked against the ribs, forearm across the stomach holding the band.",
      p: { ...FRONT, la: [0, 90], ra: [6, 2] }, x: [...SEAT, { wall: 152 }, { band: [90, 122, 152, 122] }] },
    { l: "Rotate out, back over 3", a: "Seen from the front, the forearm rotated outwards away from the body against the band, the elbow still pinned to the ribs.",
      p: { ...FRONT, la: [0, -80], ra: [6, 2] }, x: [...SEAT, { wall: 152 }, { band: [38, 126, 152, 122] }, { mvq: [76, 106, 58, 100, 42, 108] }] },
  ] },
  "seated-overhead-band-press": { w: 160, f: [
    { l: "At the shoulders", a: "Seen from the front, sitting tall on the middle of a band, an end in each hand at shoulder height, palms forward.",
      p: { ...FRONT, la: [-39, 175], ra: [39, -175] }, x: [...SEAT, { band: [50, 90, 56, 148] }, { band: [110, 90, 104, 148] }] },
    { l: "Press up, lower over 3", a: "Seen from the front, both hands pressed up until the arms are almost straight overhead, ribs down and lower back not arched.",
      p: { ...FRONT, la: [-167, 176], ra: [167, -176] }, x: [...SEAT, { band: [60, 45, 56, 148] }, { band: [100, 45, 104, 148] }, { mv: [22, 84, 22, 46] }, { mv: [138, 84, 138, 46] }] },
  ] },
  "seated-band-woodchop": { w: 180, f: [
    { l: "Hands high, by the anchor", a: "Seen from the front, sitting tall on a chair side-on to a band anchored high, both hands holding the band up by the shoulder nearest the anchor.",
      p: { v: "front", hip: [100, 142], t: 188, h: 186, la: [-72.8, 159.7], ra: [-76.3, -129.2] }, x: [...sf(100), { wall: 14 }, { band: [14, 36, 62, 82] }] },
    { l: "Down and across", a: "Seen from the front, the band pulled down and across the body to the opposite hip, turning through the ribs while the hips stay still.",
      p: { v: "front", hip: [100, 142], t: 180, la: [13.2, 44.1], ra: [20.4, -41] },
      x: [...sf(100), { wall: 14 }, { band: [14, 36, 108, 140] }, { mvq: [34, 74, 40, 128, 72, 150] }] },
  ] },
  "seated-shoulder-shrug": { w: 160, f: [
    { l: "Shoulders relaxed down", a: "Seen from the front, sitting tall on a chair, a dumbbell in each hand, arms hanging at the sides, shoulders fully relaxed down.",
      p: { ...FRONT, la: [-12, -8], ra: [12, 8], hold: "dbs" }, x: SEAT },
    { l: "Lift, hold, lower over 3", a: "Seen from the front, both shoulders lifted straight up towards the ears, arms still straight and hanging, head still.",
      x: [...SEAT, { body: [[72, 142, 88, 142], [80, 142, 80, 90], [64, 89, 96, 89], [64, 89, 58.6, 114.4, 55, 140], [96, 89, 101.4, 114.4, 105, 140]] },
          { head: [80, 78] }, { db: [55, 140, "s"] }, { db: [105, 140, "s"] }, { mv: [36, 104, 36, 88] }, { mv: [124, 104, 124, 88] }] },
  ] },
  "seated-isometric-press": { w: 160, f: [
    { l: "Press palms, hold 20 seconds", a: "Seen from the front, sitting tall on a chair, palms pressed together in front of the chest, elbows out, shoulders down.",
      p: { ...FRONT, la: [-24.7, 107.1], ra: [24.7, -107.1] }, x: SEAT },
  ] },
  "seated-neck-side-stretch": { w: 160, f: [
    { l: "Sit tall, shoulders down", a: "Seen from the front, sitting tall on a chair, both shoulders relaxed down, hands resting on the thighs.",
      p: { ...FRONT, la: [-10, 12], ra: [10, -12] }, x: SEAT },
    { l: "Ear to shoulder, hold 30", a: "Seen from the front, the head tilted slowly so one ear travels towards the shoulder on the same side, that hand resting lightly on the side of the head, the other shoulder kept down.",
      p: { ...FRONT, h: -150, la: [-112.8, 122.4], ra: [10, -12] }, x: [...SEAT, { mvq: [96, 58, 86, 48, 72, 50] }] },
  ] },
  "seated-chest-doorway-stretch": { w: 160, f: [
    { l: "Hands behind, chest up", a: "Sitting tall away from the chair back, both hands reaching behind and clasped, shoulder blades drawn together, chest lifted; the stretch is felt across the front of the chest.",
      p: { hip: [78, 150], t: 180, nl: [90, 0, 90], na: [-35, -25], bend: [2, 0] }, x: [CH, { ring: [88, 116] }] },
  ] },
  "seated-lat-side-stretch": { w: 160, f: [
    { l: "Arm up", a: "Seen from the front, sitting tall on a chair, one arm reaching straight up overhead, the other hand on the thigh.",
      p: { ...FRONT, la: [180, 180], ra: [10, -12] }, x: SEAT },
    { l: "Lean over, hold 30 seconds", a: "Seen from the front, leaning slowly to the side away from the raised arm, which reaches over the head; both hips stay down on the seat; the stretch is felt along the side of the raised arm.",
      p: { ...FRONT, t: 165, h: 165, la: [175, 130], ra: [20, 10] }, x: [...SEAT, { ring: [70, 120] }, { mvq: [112, 38, 132, 46, 136, 70] }] },
  ] },
  "seated-wrist-forearm-stretch": { w: 160, f: [
    { l: "Palm down, fingers back", a: "Sitting tall on a chair, one arm out in front, elbow soft, palm facing down, the other hand gently drawing the fingers back towards the body.",
      p: { hip: [70, 150], t: 170, nl: [90, 0, 90], na: [100, 100], fa: [93.9, 105.4] }, x: [CH, { body: [[129.2, 104.7, 132, 96]] }] },
    { l: "Palm up, fingers back", a: "The same arm turned palm up, the other hand gently drawing the fingers back and down towards the body; hold, then swap arms.",
      p: { hip: [70, 150], t: 170, nl: [90, 0, 90], na: [100, 100], fa: [74.3, 87.2] }, x: [CH, { body: [[129.2, 104.7, 132, 113]] }] },
  ] },
  "seated-band-anti-rotation-hold": { w: 180, f: [
    { l: "Hands at the chest", a: "Seen from the front, sitting tall on a chair side-on to a band anchored at chest height, holding the band with both hands at the chest.",
      p: { v: "front", hip: [104, 142], t: 180, la: [-26.1, 101.9], ra: [26.1, -101.9] }, x: [...sf(104), { wall: 14 }, { band: [14, 114, 102, 114] }] },
    { l: "Press out, hold 20 seconds", a: "Seen from the side, sitting tall, both hands pressed straight out in front of the chest and held there, resisting the band's pull to turn.",
      p: { ...SIT, na: [79, 101], fa: [77, 103] }, x: [CH, { mv: [128, 94, 150, 94] }] },
  ] },
  "seated-dead-bug-arms": { w: 160, f: [
    { l: "Sit tall, brace", a: "Sitting tall away from the chair back, feet flat, hands resting on the thighs, stomach braced.",
      p: { ...SIT_FWD, na: [34, 34] }, x: [CH] },
    { l: "One arm up, then swap", a: "One arm reached slowly up overhead until it is beside the ear, the other hand still on the thigh; ribs down and lower back not arched.",
      p: { ...SIT_FWD, na: [160, 178], fa: [34, 34] }, x: [CH, { mvq: [108, 118, 118, 86, 98, 60] }] },
  ] },
  "seated-band-chest-fly": { w: 160, f: [
    { l: "Arms out wide", a: "Seen from the front, sitting tall on a chair, a band passed around the chair back, an end in each hand, arms out wide at chest height with a soft bend at the elbow.",
      p: { ...FRONT, la: [-75, -95], ra: [75, 95] }, x: [...SEAT, { band: [13, 100, 62, 108] }, { band: [147, 100, 98, 108] }] },
    { l: "Hands together, squeeze", a: "Seen from the front, both hands brought together in front of the chest in a wide arc, elbows still softly bent.",
      p: { ...FRONT, la: [-24.7, 107.1], ra: [24.7, -107.1] }, x: [...SEAT, { mvq: [16, 124, 24, 140, 46, 140] }, { mvq: [144, 124, 136, 140, 114, 140] }] },
  ] },
  "seated-arm-intervals": { w: 160, f: [
    { l: "Fast for 30 seconds", a: "Sitting tall on a chair, the arms moving as fast as is comfortable, here punching: one arm forward at shoulder height, the other fist by the chin.",
      p: { ...SIT_FWD, na: [84, 92], fa: [32, 168] }, x: [CH] },
    { l: "Rest for 30 seconds", a: "Sitting tall on a chair, arms down and relaxed, hands resting on the thighs, breathing settling.",
      p: { ...SIT, na: [34, 34] }, x: [CH] },
  ] },
  "seated-shoulder-rolls-warmup": { w: 160, f: [
    { l: "Sit tall, arms relaxed", a: "Seen from the front, sitting tall on a chair, arms relaxed at the sides.",
      p: { ...FRONT, la: [-12, -8], ra: [12, 8] }, x: SEAT },
    { l: "Roll slowly in big circles", a: "Seen from the front, both shoulders rolling slowly in the biggest circles they can make, forwards and then backwards, arms still relaxed.",
      p: { ...FRONT, la: [-12, -8], ra: [12, 8] }, x: [...SEAT, { mvq: [46, 112, 36, 92, 54, 84] }, { mvq: [114, 112, 124, 92, 106, 84] }] },
  ] },
};
