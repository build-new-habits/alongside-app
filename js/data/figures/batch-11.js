/**
 * js/data/figures/batch-11.js
 * 04 Oct 2026 v1
 *
 * D-4 FIGURES, batch 11: the yoga poses and flows, then the mindfulness,
 * breathing and relaxation practices. A flow or sequence shows its key pose;
 * a still practice shows one calm posture, sitting on a chair or lying down.
 * The format is described in js/figures.js.
 */

// Sitting upright on a chair, feet flat, hands resting on the thighs.
const SIT = { hip: [70, 150], t: 180, nl: [90, 0, 90], fl: [90, 0, 90], na: [34, 34] };
const SIT_SOFT = { ...SIT, h: 170 };
const CHAIR = [{ chair: [44, 152] }];
const sitFrame = (l, a, p = SIT_SOFT, x = CHAIR) => ({ w: 160, f: [{ l, a, p, x }] });
const SIT_A = "Sitting comfortably and upright on a chair, feet flat on the floor, hands resting on the thighs, eyes closed or the gaze soft and low.";

// Lying on the back on a mat, legs long, arms resting by the sides.
const LIE = { hip: [104, 178], t: -90, h: -92, nl: [90, 90, 160], fl: [88, 88, 150], na: [86, 92], fa: [84, 90] };
const lieFrame = (l, a) => ({ w: 200, f: [{ l, g: "mat", a, p: LIE }] });
const LIE_A = "Lying on the back on a mat, legs long and relaxed, arms resting by the sides, eyes closed.";

// Lying on the back in bed, head on a pillow.
const BED = [{ box: [10, 168, 180, 22] }, { box: [16, 160, 30, 8] }];
const LIE_BED = { hip: [104, 160], t: -90, h: -90, nl: [90, 90, 160], fl: [88, 88, 150], na: [86, 92], fa: [84, 90] };

// Standing poses used in more than one place.
const DOWN_DOG = { hip: [70, 125], t: 50, h: 30, nl: [-34, -34, 90], fl: [-30, -30, 90], na: [50, 50], fa: [48, 48] };
const ALL_FOURS = { hip: [88, 150], t: 108, h: 100, nl: [0, -90, -90], na: [0, 0] };
const WARRIOR_2 = { v: "front", hip: [90, 131], t: 180, ll: [-41.4, -41.4], rl: [60, 0], la: [-90, -90], ra: [90, 90] };
const WARRIOR_2_A = "Seen from the front, feet wide apart, one knee bent with the knee over the ankle, the other leg straight, arms stretched out to each side at shoulder height.";
const CHAIR_POSE = { hip: [64, 136], t: 160, h: 150, nl: [65, -20, 90], fl: [63, -18, 90], na: [172, 172], fa: [170, 170] };
const CHAIR_POSE_A = "Knees bent and hips lowered back as if sitting into a chair, weight in the heels, arms reaching up alongside the ears.";
const TREE = { v: "front", hip: [80, 112], t: 180, ll: [0, 0], rl: [32, -62, 0], la: [20, 150], ra: [-20, -150] };
const TREE_A = "Seen from the front, standing on one straight leg, the other knee turned out to the side with that foot resting against the inner calf of the standing leg, hands together at the chest.";
const COBRA = { hip: [104, 180], t: -125, h: -130, nl: [90, 90, 90], na: [62, -30], fa: [60, -32] };
const CHILD = { hip: [70, 170], t: 95, h: 106, nl: [60, -90, -90], na: [100, 100] };
const LEGS_UP = { hip: [128, 178], t: -90, h: -95, nl: [180, 180, -90], fl: [178, 178, -90], na: [88, 88] };
const LEGS_UP_X = [{ wall: 140 }];
const WALK = { hip: [82, 116], t: 180, nl: [26.5, 1.6, 90], fl: [-1.6, -26.5, 90], na: [-20, -8], fa: [20, 30] };

export const FIGURES_11 = {
  "yoga-downward-dog": { w: 190, f: [
    { l: "Start on hands and knees", a: "On hands and knees, wrists under the shoulders, knees under the hips, back flat.",
      p: ALL_FOURS },
    { l: "Lift the hips, hold", a: "Toes tucked and hips lifted high so the body makes an upside-down V: arms and back one long line from hands to hips, legs as straight as is comfortable, heels reaching towards the floor.",
      p: DOWN_DOG, x: [{ mv: [52, 108, 60, 88] }] },
  ] },
  "yoga-warrior-1": { w: 160, f: [
    { l: "Hold, then switch sides", a: "A long stride: front knee bent to about a right angle with the knee over the ankle, back leg straight with the back foot flat on the floor, body upright, arms reaching straight overhead.",
      p: { hip: [88, 150], t: 180, nl: [90, 0, 90], fl: [-60, -60, 90], na: [178, 178], fa: [176, 176] } },
  ] },
  "yoga-warrior-2": { w: 180, f: [
    { l: "Hold, then switch sides", a: WARRIOR_2_A, p: WARRIOR_2 },
  ] },
  "yoga-triangle": { w: 180, f: [
    { l: "Hold, then switch sides", a: "Seen from the front, feet wide apart and both legs straight, the body tipped sideways from the hip over the front leg, the lower hand resting on the shin, the other arm reaching straight up.",
      p: { v: "front", hip: [84, 122], t: 115, h: 115, ll: [-30, -30], rl: [30, 30], la: [180, 180], ra: [-18.6, -18.6] } },
  ] },
  "yoga-chair-pose": { w: 160, f: [
    { l: "Stand tall", a: "Standing tall, feet together, arms by the sides.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [0, 4] } },
    { l: "Sit back, arms up", a: CHAIR_POSE_A, p: CHAIR_POSE, x: [{ mvq: [30, 104, 22, 128, 34, 146] }] },
  ] },
  "yoga-tree-pose": { w: 160, f: [
    { l: "Hold, then switch sides", a: TREE_A, p: TREE },
  ] },
  "yoga-cobra": { w: 200, f: [
    { l: "Lie face down", g: "mat", a: "Lying face down, legs long, hands flat under the shoulders, elbows tucked in by the sides.",
      p: { hip: [104, 180], t: -90, h: -90, nl: [90, 90, 90], na: [120, -30], fa: [118, -32] } },
    { l: "Lift the chest gently", g: "mat", a: "Pressing gently through the hands to lift the chest, elbows still bent and tucked in, hips staying on the floor, shoulders down away from the ears.",
      p: COBRA, x: [{ mv: [36, 174, 36, 148] }] },
  ] },
  "yoga-seated-forward-fold": { w: 180, f: [
    { l: "Sit tall", g: "mat", a: "Sitting on the floor, legs straight out in front, back upright, hands resting on the floor beside the hips.",
      p: { hip: [60, 182], t: 180, nl: [90, 90, 180], na: [10, 20] } },
    { l: "Hinge forward, back flat", g: "mat", a: "Hinged forward from the hips with a flat back, hands reaching along the legs towards the feet, only as far as is comfortable.",
      p: { hip: [60, 182], t: 122, h: 116, nl: [90, 90, 180], na: [112, 118], fa: [110, 116] }, x: [{ mvq: [56, 118, 80, 112, 98, 126] }] },
  ] },
  "yoga-crescent-lunge": { w: 160, f: [
    { l: "Rise up, sink the hips", a: "Lunging with the back knee and the top of the back foot on the floor, front foot flat with the knee over the ankle, body upright, arms reaching overhead; the stretch is felt at the front of the hip of the back leg.",
      p: { hip: [90, 153], t: 180, nl: [-24, -90, -90], fl: [88, -10, 90], na: [178, 178], fa: [176, 176] },
      x: [{ ring: [85, 164] }] },
  ] },
  "yoga-half-moon": { w: 180, f: [
    { l: "Hold, then switch sides", a: "Seen from the front, balancing on one straight leg, body tipped over sideways, the lower hand on the floor in front of the standing foot, the other leg lifted to hip height and the top arm reaching to the ceiling.",
      p: { v: "front", hip: [96, 104.3], t: 75, h: 75, rl: [0, 0], ll: [-97, -97], ra: [0, 0], la: [180, 180] } },
  ] },
  "yoga-corpse-pose": { w: 200, f: [
    { l: "Lie still and rest", g: "none", a: "Seen from above, lying on the back, legs long with the feet falling outwards, arms resting a little away from the sides, palms up, eyes closed.",
      p: { v: "front", hip: [104, 100], t: -90, h: -90, ll: [84, 88, 30], rl: [96, 92, 150], la: [70, 75], ra: [110, 105] } },
  ] },
  "yoga-warrior-3": { w: 200, f: [
    { l: "Hold, then switch sides", a: "Balancing on one leg with a soft knee, hinged forward so the body and the lifted back leg make one long line close to level with the floor, arms reaching forward.",
      p: { hip: [88, 112], t: 92, h: 92, nl: [3, -3, 90], fl: [-90, -90, 0], na: [72, 80], fa: [70, 78] } },
  ] },
  "yoga-boat-pose": { w: 180, f: [
    { l: "Sit, knees bent", g: "mat", a: "Sitting on the floor, knees bent, feet flat, body upright, hands resting beside the hips.",
      p: { hip: [62, 182], t: 180, nl: [140, 20, 90], na: [10, 20] } },
    { l: "Lean back, lift the feet", g: "mat", a: "Leaning back a little with a long spine, both feet lifted so the shins are about level with the floor, arms reaching forward level with the floor.",
      p: { hip: [62, 182], t: -158, h: -162, nl: [135, 90, 140], na: [88, 88], fa: [86, 86] }, x: [{ mv: [150, 186, 150, 162] }] },
  ] },
  "yoga-bridge-pose": { w: 160, f: [
    { l: "Start", g: "mat", a: "Lying on the back, knees bent, feet flat on the floor hip-width apart, arms alongside the body, palms down.",
      p: { hip: [100, 178], t: -90, h: -95, nl: [140, 10, 90], fa: [96, 92] } },
    { l: "Lift the hips, hold", g: "mat", a: "Pressing through the feet and shoulders, hips lifted until the body is one straight line from shoulders to knees, feet still flat.",
      p: { hip: [97, 161], t: -68, h: -95, nl: [112, -5, 90], fa: [96, 92] }, x: [{ mv: [97, 188, 97, 173] }] },
  ] },
  "yoga-pigeon-pose": { w: 190, f: [
    { l: "Set up", g: "mat", a: "Front knee bent and resting on the floor towards the front wrist, shin angled across under the body, back leg stretched straight behind, body upright, hands on the floor.",
      p: { hip: [100, 180], t: 172, fl: [-90, -90, -90], na: [8, 4], fa: [12, 8] },
      x: [{ body: [[100, 180, 136, 186, 118, 186, 110, 182]] }] },
    { l: "Fold forward and breathe", g: "mat", a: "The body lowered forward over the front shin, resting on the forearms, the back leg still long behind.",
      p: { hip: [100, 180], t: 112, h: 115, fl: [-90, -90, -90], na: [25, 90] },
      x: [{ body: [[100, 180, 136, 186, 118, 186, 110, 182]] }, { mvq: [96, 120, 128, 112, 150, 136] }] },
  ] },
  "yoga-supine-twist": { w: 200, f: [
    { l: "Hold, then switch sides", g: "none", a: "Seen from above, lying on the back with the arms out wide in a T, both bent knees dropped over to one side, the head turned gently the other way.",
      p: { v: "front", hip: [110, 100], t: -90, h: -100, la: [0, 0], ra: [180, 180], ll: [40, -40, 0], rl: [52, -30, 0], pale: ["ll"] } },
  ] },
  "yoga-legs-up-wall": { w: 160, f: [
    { l: "Rest, legs up the wall", g: "mat", a: "Lying on the back with the hips close to a wall and both legs resting straight up against it, arms relaxed by the sides, palms up.",
      p: LEGS_UP, x: LEGS_UP_X },
  ] },
  "yoga-cat-cow-flow": { w: 190, f: [
    { l: "Cow: breathe in", a: "Cow, on hands and knees: belly dropped, chest and tailbone lifted, breathing in.",
      p: { hip: [88, 150], t: 108, h: 130, bend: [0, 14], nl: [0, -90, -90], na: [0, 0] } },
    { l: "Cat: breathe out", a: "Cat, on hands and knees: spine rounded up, chin and tailbone tucked, breathing out.",
      p: { hip: [88, 150], t: 108, h: 45, bend: [0, -20], nl: [0, -90, -90], na: [0, 0] } },
  ] },
  "yoga-flow-morning": { w: 190, f: [
    { l: "Downward dog, one part", a: "One pose from the flow, Downward Facing Dog: hands and feet on the floor, hips lifted high in an upside-down V, arms and back in one long line, heels reaching down.",
      p: DOWN_DOG },
  ] },
  "yoga-flow-evening": { w: 180, f: [
    { l: "Begin in child's pose", a: "The first pose of the flow, Child's Pose: kneeling, sitting back towards the heels, body folded forward, forehead resting on the floor, arms stretched forward.",
      p: CHILD },
  ] },
  "yoga-sun-salutation-b": { w: 160, f: [
    { l: "Chair pose, one part", a: "One pose from the sequence, Chair Pose: " + CHAIR_POSE_A.charAt(0).toLowerCase() + CHAIR_POSE_A.slice(1),
      p: CHAIR_POSE },
  ] },
  "yoga-yin-hip-sequence": { w: 160, f: [
    { l: "Butterfly, rest here", g: "mat", a: "The first pose, Butterfly, seen from the front: sitting upright on the floor, the soles of the feet together, knees falling open to the sides, hands resting on the feet.",
      p: { v: "front", hip: [80, 176], t: 180, la: [22, 8], ra: [-22, -8] },
      x: [{ body: [[72, 176, 36, 172, 76, 186], [88, 176, 124, 172, 84, 186]] }] },
  ] },
  "yoga-restorative-sequence": { w: 160, f: [
    { l: "Legs up the wall, rest", g: "mat", a: "One pose from the sequence, Legs Up the Wall: lying on the back with the hips close to a wall, legs resting straight up against it, arms relaxed by the sides.",
      p: LEGS_UP, x: LEGS_UP_X },
  ] },
  "yoga-balance-series": { w: 160, f: [
    { l: "Tree pose, one part", a: "The first pose of the series, Tree Pose. " + TREE_A, p: TREE },
  ] },
  "yoga-forward-fold-series": { w: 160, f: [
    { l: "Standing forward fold", a: "The first pose of the series, a standing forward fold: feet hip-width apart, knees soft, body hanging forward and down from the hips, head and arms heavy.",
      p: { hip: [70, 113], t: 30, h: 15, nl: [12, -4, 90], na: [40, 55], fa: [36, 52] } },
  ] },
  "yoga-backbend-series": { w: 200, f: [
    { l: "Cobra, one part", g: "mat", a: "One pose from the series, Cobra: lying face down, hips on the floor, pressing gently through the hands to lift the chest, elbows bent and tucked in.",
      p: COBRA },
  ] },
  "yoga-power-flow": { w: 180, f: [
    { l: "Warrior II, one part", a: "One pose from the flow, Warrior II. " + WARRIOR_2_A, p: WARRIOR_2 },
  ] },
  "yoga-pranayama": sitFrame("Sit tall and breathe",
    "Sitting upright on a chair with a tall spine, feet flat on the floor, hands resting on the thighs near the knees.", SIT),
  "yoga-chair": { w: 160, f: [
    { l: "Seated side stretch", a: "One part of the sequence, seen from the front: sitting upright on a chair, feet flat, one arm reaching up and over the head while the body leans gently to the other side, the other hand resting down by the seat.",
      p: { v: "front", hip: [80, 142], t: 168, h: 165, la: [-175, 140], ra: [5, 5] },
      x: [{ box: [56, 148, 48, 8] }, { box: [77, 156, 6, 34] }, { body: [[62, 188, 66, 150, 72, 142], [98, 188, 94, 150, 88, 142]] }] },
  ] },
  "yoga-hip-strength": { w: 180, f: [
    { l: "Warrior II, hold strong", a: "The first pose of the sequence, Warrior II. " + WARRIOR_2_A, p: WARRIOR_2 },
  ] },
  "breath-awareness-meditation": sitFrame("Sit comfortably", SIT_A),
  "body-scan-short": lieFrame("Lie and rest", LIE_A),
  "loving-kindness-short": sitFrame("Sit comfortably", SIT_A),
  "five-four-three-two-one-grounding": sitFrame("Sit and look around",
    "Sitting comfortably on a chair, feet flat on the floor, hands resting on the thighs, head up and eyes open, looking around the room.", SIT),
  "progressive-muscle-relaxation": lieFrame("Lie and rest", LIE_A),
  "open-awareness-meditation": sitFrame("Sit comfortably", SIT_A),
  "safe-place-visualisation": lieFrame("Lie or sit comfortably", LIE_A),
  "noting-practice": sitFrame("Sit comfortably", SIT_A),
  "feet-on-floor-grounding": sitFrame("Feet flat, feel the floor",
    "Sitting upright on a chair, both feet flat on the floor, hands resting on the thighs, eyes soft and low.", SIT_SOFT),
  "mindful-observation": sitFrame("Hold it, look closely",
    "Sitting comfortably on a chair, feet flat on the floor, holding a small object in both hands in front of the chest and looking at it.",
    { ...SIT, h: 165, na: [24, 120], fa: [20, 116] }, [...CHAIR, { ball: [107, 117, 5] }]),
  "sleep-body-scan": { w: 200, f: [
    { l: "Lie in bed and rest", g: "none", a: "Lying on the back in bed, head on a pillow, legs long and relaxed, arms resting by the sides, eyes closed.",
      p: LIE_BED, x: BED },
  ] },
  "military-sleep-method": { w: 200, f: [
    { l: "Lie back and let go", g: "none", a: "Lying on the back in bed, head on a pillow, shoulders dropped, arms loose by the sides, legs long and relaxed, eyes closed.",
      p: LIE_BED, x: BED },
  ] },
  "worry-time-practice": sitFrame("Sit and write it down",
    "Sitting comfortably on a chair, feet flat on the floor, a notebook resting on the lap, writing in it.",
    { ...SIT, h: 160, na: [10, 70], fa: [14, 64] }, [...CHAIR, { box: [88, 142, 26, 5] }]),
  "mindful-walking": { w: 160, f: [
    { l: "Walk slowly, notice each step", a: "Walking upright at a natural, comfortable pace, one foot stepping forward as the arms swing gently.",
      p: WALK },
  ] },
  "compassionate-self-talk": sitFrame("Hand on the chest",
    "Sitting quietly on a chair, feet flat on the floor, one hand resting on the chest and the other on the thigh, eyes soft and low.",
    { ...SIT_SOFT, na: [5, 150], fa: [34, 34] }),
  "nature-visualisation": lieFrame("Lie or sit comfortably", LIE_A),
  "morning-intention": sitFrame("Sit quietly", SIT_A),
  "gratitude-reflection": sitFrame("Sit quietly", SIT_A),
  "box-breathing-extended": sitFrame("Sit tall and breathe",
    "Sitting upright on a chair with a tall spine, feet flat on the floor, hands resting on the thighs, eyes closed.", SIT),
  "digital-detox-transition": { w: 160, f: [
    { l: "Stand and look away", a: "Standing tall and relaxed, arms by the sides, head up, looking at something in the room or out of a window, away from any screen.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], fl: [0, 0, 90], na: [0, 4], fa: [0, 2] } },
  ] },
};
