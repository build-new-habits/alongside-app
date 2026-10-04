/**
 * js/data/figures/batch-09.js
 * 04 Oct 2026 v1
 *
 * D-4 FIGURES, batch 09: mobility (hip, spine, shoulder, ankle and wrist
 * mobility drills, leg swings, CARs and the longer held stretches).
 * The format is described in js/figures.js.
 */

// Sitting on the floor in a 90-90, seen from the front: the front shin lies
// across in front of the body, the back thigh goes out to the side and its
// shin points away behind (so it looks short).
const NINETY_LEGS = [{ body: [[72, 176, 64, 186, 104, 188], [88, 176, 126, 186]] }, { far: [[126, 186, 138, 178]] }];
const NINETY_SIT = { l: "Sit tall over the front hip", g: "mat",
  a: "Seen from the front, sitting tall on the floor: the front leg bent with its shin lying across in front of the body, the back leg bent out to the side with its shin pointing behind, both knees at roughly a right angle, fingertips resting on the floor.",
  p: { v: "front", hip: [80, 176], t: 180, la: [-12, 2], ra: [12, -2] }, x: NINETY_LEGS };

// Open book, seen from above: lying on one side, knees bent at a right angle,
// arms reaching forward along the floor (up the page is "forward").
const BOOK_START = { l: "Side-lying, palms together", g: "none",
  a: "Seen from above, lying on one side with the hips and knees bent to about a right angle, both arms reaching straight forward along the floor with the palms together.",
  p: { hip: [118, 112], t: -90, h: -90, nl: [180, 90, 90], fl: [176, 86, 90], na: [180, 180], fa: [176, 176] } };
const BOOK_OPEN = { l: "Open the top arm, eyes follow", g: "none",
  a: "Seen from above, the top arm opened up and over to the other side, reaching behind; the head turns to follow the hand; the knees stay together and the hips stay still.",
  p: { hip: [118, 112], t: -90, h: -96, nl: [180, 90, 90], fl: [176, 86, 90], na: [0, 0], fa: [176, 176] },
  x: [{ mvq: [56, 52, 22, 110, 56, 168] }] };

// Seen from the front, sitting on a chair (as batch 06).
const SEAT_FRONT = [{ box: [56, 148, 48, 8] }, { box: [77, 156, 6, 34] }, { body: [[62, 188, 66, 150, 72, 142], [98, 188, 94, 150, 88, 142]] }];

// Hands on hips, front view.
const HANDS_ON_HIPS = { la: [-35, 30], ra: [35, -30] };

// All fours, side view (as batch 01).
const ALL_FOURS = { hip: [88, 150], t: 108, h: 100, nl: [0, -90, -90], na: [0, 0] };

export const FIGURES_09 = {
  "90-90-hip-stretch": { w: 160, f: [
    { ...NINETY_SIT, l: "Sit tall" },
    { l: "Lean over the front shin", g: "mat",
      a: "Seen from the front, the legs still in the 90-90 shape, the body leaning gently forward over the front shin, hands on the floor in front; held still, not bounced.",
      x: [...NINETY_LEGS, { body: [[80, 176, 80, 148], [62, 150, 98, 150], [62, 150, 56, 184], [98, 150, 104, 184]] }, { head: [80, 140] },
          { mv: [120, 120, 120, 140] }] },
  ] },
  "thoracic-rotation": { w: 180, f: [BOOK_START, BOOK_OPEN] },
  "prone-thoracic-rotation": { w: 180, f: [
    { ...BOOK_START, l: "Side-lying, knees together" },
    { ...BOOK_OPEN, l: "Reach behind, knees stay" },
  ] },
  "leg-swing-forward": { w: 160, f: [
    { l: "Swing forward", a: "Standing tall on one leg, one hand out for balance, the other leg swinging forward from the hip in a relaxed arc.",
      p: { hip: [80, 112], t: 180, fl: [0, 0, 90], nl: [50, 40, 130], na: [20, 50], fa: [0, 4] } },
    { l: "Then back, 15 swings", a: "The same leg swinging back behind the body, the body staying tall; the swing builds gradually, never forced.",
      p: { hip: [80, 112], t: 180, fl: [0, 0, 90], nl: [-32, -20, 30], na: [20, 50], fa: [0, 4] },
      x: [{ mvq: [134, 170, 100, 196, 58, 190] }] },
  ] },
  "leg-swing-lateral": { w: 160, f: [
    { l: "Swing out to the side", a: "Seen from the front, standing on one leg, both hands up in front at chest height resting on a wall, the other leg swinging out to the side.",
      p: { v: "front", hip: [76, 112], t: 180, ll: [-4, 0], rl: [38, 38], la: [-20, 160], ra: [20, -160] } },
    { l: "Then across in front", a: "Seen from the front, the same leg swinging back across in front of the standing leg; the body stays upright.",
      p: { v: "front", hip: [76, 112], t: 180, ll: [-4, 0], rl: [-22, -22], la: [-20, 160], ra: [20, -160] },
      x: [{ mvq: [134, 176, 104, 196, 40, 190] }] },
  ] },
  "inchworm": { w: 200, f: [
    { l: "Hinge, hands to the floor", a: "Standing with the feet hip-width apart, hinged forward with the knees slightly bent, both hands on the floor in front of the feet.",
      p: { hip: [64, 113], t: 45, h: 30, nl: [10, -5, 90], na: [33, 33] } },
    { l: "Walk out to a plank", a: "The hands walked forward until the body is one straight line from head to heels, hands under the shoulders, arms straight; then the feet walk back towards the hands.",
      p: { hip: [107.4, 153.2], t: 112, h: 108, nl: [-68, -68, -68], na: [0, 0] },
      x: [{ mv: [120, 104, 156, 104] }] },
  ] },
  "lateral-lunge-reach": { w: 160, f: [
    { l: "Feet together", a: "Seen from the front, standing tall with the feet together, arms by the sides.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-2, 0], rl: [2, 0], la: [-4, -2], ra: [4, 2] } },
    { l: "Step wide, reach to the foot", a: "Seen from the front, one foot stepped wide to the side, hips pushed back and down over that side, its knee bent over the toes, the other leg straight; both hands reach towards the bent leg's foot.",
      p: { v: "front", hip: [66, 125.6], t: -170, ll: [-50, 0], rl: [35, 35], la: [-26, -18], ra: [-10, -6] },
      x: [{ mv: [62, 162, 40, 162] }] },
  ] },
  "hip-cars": { w: 160, f: [
    { l: "Knee up to hip height", a: "Standing tall on one leg, hands on the hips, the other knee lifted in front to hip height.",
      p: { hip: [76, 112], t: 180, fl: [0, 0, 90], nl: [90, 0, 90], na: [-35, 40] } },
    { l: "Circle it out and behind", a: "Seen from the front, the lifted knee arcing slowly out to the side at hip height, before continuing behind and back; the standing leg stays steady.",
      p: { v: "front", hip: [70, 112], t: 180, ll: [-3, 0], rl: [90, 0], ...HANDS_ON_HIPS },
      x: [{ mvq: [110, 96, 138, 92, 146, 118] }] },
  ] },
  "ankle-circles": { w: 160, f: [
    { l: "Draw slow, big circles", a: "Sitting on a chair, one foot lifted slightly off the floor, the toes drawing slow, large circles from the ankle.",
      p: { hip: [70, 150], t: 180, nl: [90, 50, 150], fl: [90, 0, 90], na: [10, 10] },
      x: [{ chair: [44, 152] }, { mvq: [150, 146, 170, 168, 150, 186] }] },
  ] },
  "deep-squat-hold": { w: 160, f: [
    { l: "Hold low, heels down", a: "Squatting as low as is comfortable with the heels flat on the floor, feet a little wider than the hips and turned out, knees forward over the toes, hands reaching down to hold the heels.",
      p: { hip: [77, 174], t: 162, h: 140, nl: [110, -45, 90], na: [-5, -5] } },
  ] },
  "couch-stretch": { w: 160, f: [
    { l: "Shin up the wall, body tall", a: "Kneeling with the back to a wall, the back shin up against the wall with the foot pointing up, the other foot stepped forward into a lunge, body upright, hands on the front knee.",
      p: { hip: [80, 150], t: 180, nl: [-30, 180, 180], fl: [90, 0, 90], na: [50, 20] }, x: [{ wall: 57 }] },
  ] },
  "pigeon-pose": { w: 180, f: [
    { l: "Front shin down, back leg long", g: "mat", a: "The front leg bent on the floor with its knee forward by the hands and its shin angled across under the body, the back leg stretched straight behind, body upright on straight arms.",
      p: { hip: [100, 178], t: 160, h: 170, nl: [-90, -90, -90], na: [5, 5] }, x: [{ far: [[100, 178, 137, 186, 124, 188]] }] },
    { l: "Lower over it, hold", g: "mat", a: "The body lowered forward over the front shin, resting on the forearms, the back leg still long behind.",
      p: { hip: [100, 178], t: 110.4, h: 100, nl: [-90, -90, -90], na: [0, 90] }, x: [{ far: [[100, 178, 137, 186, 124, 188]] },
      { mvq: [126, 112, 154, 116, 166, 140] }] },
  ] },
  "thread-the-needle": { w: 160, f: [
    { l: "Hands and knees", a: "Seen from the front, on hands and knees: hands under the shoulders, arms straight, knees behind under the hips.",
      x: [{ far: [[72, 150, 72, 188], [88, 150, 88, 188], [80, 136, 80, 150]] }, { body: [[60, 136, 100, 136], [60, 136, 60, 188], [100, 136, 100, 188]] }, { head: [80, 124] }] },
    { l: "Thread one arm under, rest", a: "Seen from the front, one arm slid along the floor under the body to the other side, that shoulder and cheek resting on the floor; the other hand stays pressing into the floor.",
      x: [{ far: [[74, 150, 74, 188], [90, 150, 90, 188]] }, { body: [[56, 178, 100, 150], [100, 150, 104, 188], [56, 178, 136, 186]] }, { head: [44, 174] },
          { mv: [118, 172, 144, 172] }] },
  ] },
  "standing-quad-stretch": { w: 160, f: [
    { l: "Knee down, hold 30 seconds", a: "Standing on one leg with one hand on a wall, the other knee bent so that hand holds the ankle behind, the bent knee pointing straight down, body tall.",
      p: { hip: [84, 112], t: 180, fl: [0, 0, 90], nl: [-10, -165, -140], na: [-20, -20], fa: [80, 95] }, x: [{ wall: 136 }] },
  ] },
  "upper-trap-stretch": { w: 160, f: [
    { l: "Ear down, hand rests", a: "Seen from the front, standing tall, the head tilted so one ear moves towards that shoulder, that hand resting lightly on the head without pulling, the other arm relaxed by the side; the stretch is felt along the other side of the neck and top of the shoulder.",
      p: { v: "front", hip: [80, 112], t: 180, h: 160, ll: [-6, -2], rl: [6, 2], la: [-4, -2], ra: [130, -115] },
      x: [{ ring: [62, 62] }] },
  ] },
  "chest-opener-arms-back": { w: 160, f: [
    { l: "Clasp, lift, hold 20 seconds", a: "Standing tall, hands clasped behind the back, arms straight and drawn down and back, shoulder blades squeezed together, chest lifted.",
      p: { hip: [84, 112], t: 178, h: 182, nl: [0, 0, 90], na: [-32, -32], fa: [-28, -28] } },
  ] },
  "adductor-stretch-standing": { w: 160, f: [
    { l: "Feet wide", a: "Seen from the front, standing tall with the feet wide apart, toes forward.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-24, -24], rl: [24, 24], ...HANDS_ON_HIPS } },
    { l: "Shift over, hold 30 seconds", a: "Seen from the front, the weight shifted to one side, that knee bent, the other leg straight, both feet flat; the stretch is felt along the inner thigh of the straight leg.",
      p: { v: "front", hip: [66, 124], t: 180, ll: [-30, -5], rl: [40, 40], ...HANDS_ON_HIPS },
      x: [{ ring: [92, 148] }, { mv: [96, 22, 70, 22] }] },
  ] },
  "spinal-flexion-extension-standing": { w: 160, f: [
    { l: "Round down, chin first", a: "Standing with the feet hip-width apart and knees slightly bent, chin dropped to the chest and the back rounded forward, arms hanging.",
      p: { hip: [76, 113], t: 156, h: 60, bend: [-14, -10], nl: [10, -6, 90], na: [10, 6] } },
    { l: "Then lift and arch gently", a: "The wave reversed: the lower back gently arched, then the chest and head lifted, looking slightly up; slow, about 10 seconds each way.",
      p: { hip: [76, 113], t: 178, h: 195, bend: [-6, 0], nl: [6, -4, 90], na: [-8, 0] },
      x: [{ mvq: [110, 104, 116, 76, 100, 52] }] },
  ] },
  "worlds-greatest-stretch": { w: 180, f: [
    { l: "Lunge, hands inside the foot", a: "A lunge with one foot forward and the back knee on the floor, both hands on the floor inside the front foot.",
      p: { hip: [92, 147], t: 107, h: 100, nl: [85, 0, 90], fl: [-10, -90, -90], na: [10, 10], fa: [6, 6] } },
    { l: "Rotate, arm to the ceiling", a: "Still in the lunge, one hand stays on the floor while the other arm rotates up to point at the ceiling, eyes following the hand; then it returns, the leg straightens and it repeats.",
      p: { hip: [92, 147], t: 107, h: 170, nl: [85, 0, 90], fl: [-10, -90, -90], na: [180, 180], fa: [6, 6] },
      x: [{ mvq: [150, 104, 160, 70, 144, 36] }] },
  ] },
  "thoracic-rotation-seated": { w: 160, f: [
    { l: "Sit tall, arms crossed", a: "Seen from the front, sitting upright on a chair, feet flat on the floor, arms crossed over the chest.",
      p: { v: "front", hip: [80, 142], t: 180, la: [14, 134], ra: [-14, -134] }, x: SEAT_FRONT },
    { l: "Turn slowly, hold 2 seconds", a: "Seen from the front, still sitting tall with the arms crossed: the upper body turned to one side, hips and feet staying still.",
      p: { v: "front", hip: [80, 142], t: 180, la: [10, 128], ra: [-24, -136], pale: ["la"] },
      x: [...SEAT_FRONT, { mvq: [54, 60, 80, 44, 106, 60] }] },
  ] },
  "thoracic-extension-foam-roll": { w: 180, f: [
    { l: "Roller under the mid-back", g: "mat", a: "Sitting back on the floor with a foam roller across the mid-back, knees bent, feet flat, hands supporting the head.",
      p: { hip: [112, 178], t: -112, h: -125, nl: [140, 10, 90], na: [-170, -60] }, x: [{ ball: [90, 179, 9] }] },
    { l: "Ease back over it, 5 breaths", g: "mat", a: "The upper back eased back over the roller, chest opening towards the ceiling, hands still supporting the head, hips on the floor.",
      p: { hip: [112, 178], t: -102, h: -75, nl: [140, 10, 90], na: [-150, -40] }, x: [{ ball: [90, 179, 9] }, { mvq: [40, 140, 26, 148, 24, 166] }] },
  ] },
  "ankle-mobility-circles": { w: 160, f: [
    { l: "Circle, then trace letters", a: "Sitting on a chair with one leg crossed over the other, the foot free in the air, drawing large slow circles with the toes.",
      p: { hip: [70, 150], t: 180, nl: [105, 20, 110], fl: [90, 0, 90], na: [60, 20] },
      x: [{ chair: [44, 152] }, { mvq: [146, 150, 166, 170, 148, 186] }] },
  ] },
  "ankle-wall-dorsiflexion": { w: 160, f: [
    { l: "Foot near the wall", a: "Facing a wall with hands on it, one foot a few centimetres from the wall, the other foot behind.",
      p: { hip: [108, 114], t: 176, nl: [18, 0, 90], fl: [-22, -10, 90], na: [10, 150], fa: [16, 150] }, x: [{ wall: 141 }] },
    { l: "Knee to the wall, heel down", a: "The front knee driven forward to touch the wall while the heel stays down on the floor.",
      p: { hip: [113.6, 124.5], t: 174, nl: [40, -25, 90], fl: [-34, -30, 90], na: [10, 150], fa: [16, 150] },
      x: [{ wall: 141 }, { mv: [98, 172, 114, 172] }] },
  ] },
  "wrist-extension-floor": { w: 190, f: [
    { l: "Fingers point back", a: "On hands and knees, hands under the shoulders with the fingers turned to point back towards the knees.",
      p: ALL_FOURS, x: [{ body: [[131.7, 188, 120, 188]] }] },
    { l: "Rock forward gently", a: "The body rocked gently forward so the shoulders move past the hands, palms flat; the stretch is felt in the wrists and forearms.",
      p: { hip: [96, 152], t: 104, h: 98, nl: [-12, -90, -90], na: [-9, -9] },
      x: [{ body: [[131.7, 188, 120, 188]] }, { ring: [126, 174] }, { mv: [140, 118, 162, 118] }] },
  ] },
  "hip-90-90-stretch": { w: 160, f: [NINETY_SIT] },
  "shoulder-cars-standing": { w: 160, f: [
    { l: "Stand tall", a: "Standing tall, one arm by the side.",
      p: { hip: [76, 112], t: 180, nl: [0, 0, 90], na: [0, 4], fa: [0, 4] } },
    { l: "Slow, full circle", a: "One arm reaching straight up over the head in the middle of a slow circle: forward, up, behind and back down; the body stays still.",
      p: { hip: [76, 112], t: 180, nl: [0, 0, 90], na: [185, 185], fa: [0, 4] },
      x: [{ mvq: [116, 110, 142, 50, 104, 18] }, { mvq: [54, 20, 22, 56, 42, 108] }] },
  ] },
  "spinal-cars": { w: 160, f: [
    { l: "Roll down, head first", a: "Standing with the feet hip-width apart, the head dropped forward and the spine rounded down one section at a time.",
      p: { hip: [76, 113], t: 156, h: 60, bend: [-10, -6], nl: [8, -4, 90], na: [12, 6] } },
    { l: "Circle round and up", a: "Seen from the front, the body circling round to one side on its way back up; slow, the whole spine moving, not just turning.",
      p: { v: "front", hip: [80, 112], t: 165, h: 150, ll: [-6, -2], rl: [6, 2], la: [-14, -8], ra: [14, 8] },
      x: [{ mvq: [44, 70, 56, 30, 92, 24] }] },
  ] },
  "frog-stretch": { w: 160, f: [
    { l: "Hips back and down, hold", g: "mat", a: "Seen from the front, on the forearms with the knees spread wide out to the sides behind, hips lowered towards the floor; the stretch is felt in the inner thighs.",
      x: [{ far: [[80, 162, 80, 168]] }, { body: [[72, 168, 30, 188], [88, 168, 130, 188], [64, 162, 96, 162], [64, 162, 62, 188], [96, 162, 98, 188]] }, { head: [80, 148] },
          { ring: [114, 172] }] },
  ] },
  "shoulder-dislocates": { w: 160, f: [
    { l: "Band in front, arms wide", a: "Seen from the front, standing tall, holding a resistance band in both hands, arms straight and wider than the shoulders, band in front of the hips.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-6, -2], rl: [6, 2], la: [-25, -25], ra: [25, 25] }, x: [{ band: [42, 113, 118, 113] }] },
    { l: "Straight arms over the top", a: "Seen from the front, the band raised over the head with straight arms, still wide.",
      p: { v: "front", hip: [80, 112], t: 180, ll: [-6, -2], rl: [6, 2], la: [-155, -155], ra: [155, 155] },
      x: [{ band: [42, 19, 118, 19] }, { mv: [22, 100, 22, 50] }, { mv: [138, 100, 138, 50] }] },
    { l: "And behind, if comfortable", a: "Seen from the side, the band carried on over and down behind the body, arms still straight, only as far as is comfortable.",
      p: { hip: [84, 112], t: 180, nl: [0, 0, 90], na: [-28, -28], fa: [-26, -26] },
      x: [{ mvq: [50, 40, 32, 64, 38, 100] }] },
  ] },
  "neck-mobility": { w: 160, f: [
    { l: "Sit tall, shoulders soft", a: "Seen from the front, sitting tall on a chair, shoulders relaxed, hands on the thighs, head level.",
      p: { v: "front", hip: [80, 142], t: 180, la: [-10, 10], ra: [10, -10] }, x: SEAT_FRONT },
    { l: "Ear down, hold 5, then the rest", a: "Seen from the front, the head slowly tilted so one ear moves towards its shoulder; the routine then tilts the other way, turns to look over each shoulder, drops the chin and looks gently up.",
      p: { v: "front", hip: [80, 142], t: 180, h: 155, la: [-10, 10], ra: [10, -10] },
      x: [...SEAT_FRONT, { mvq: [90, 54, 104, 60, 108, 76] }] },
  ] },
  "hip-circles-standing": { w: 160, f: [
    { l: "Knee up to hip height", a: "Standing on one leg with the standing knee slightly bent, the other knee lifted in front to hip height, hands on the hips.",
      p: { hip: [76, 113], t: 180, fl: [4, -4, 90], nl: [90, 0, 90], na: [-35, 40] } },
    { l: "Draw big circles", a: "Seen from the front, the lifted knee circling out to the side; the torso stays still and the circle stays in a comfortable range.",
      p: { v: "front", hip: [70, 113], t: 180, ll: [-3, 2], rl: [90, 0], ...HANDS_ON_HIPS },
      x: [{ mvq: [110, 96, 138, 92, 146, 118] }] },
  ] },
  "seated-figure-4-stretch": { w: 160, f: [
    { l: "Ankle on knee, press gently", a: "Seen from the front, sitting on a chair, one ankle crossed over the other knee, that hand gently pressing the crossed knee down, the other hand resting on the shin.",
      p: { v: "front", hip: [80, 142], t: 180, la: [-30, -10], ra: [8, -10] },
      x: [{ box: [56, 148, 48, 8] }, { box: [77, 156, 6, 34] }, { body: [[98, 188, 94, 150, 88, 142], [72, 142, 42, 150, 94, 146, 104, 142]] }] },
  ] },
  "mobility-flow-5min": { w: 190, f: [
    { l: "Begin with cat-cow", a: "Cat, on hands and knees: back rounded up, chin and tailbone tucked; the flow then moves through child's pose, downward dog, lunges with a rotation and a forward fold.",
      p: { hip: [88, 150], t: 108, h: 45, bend: [0, -20], nl: [0, -90, -90], na: [0, 0] } },
  ] },
  "hip-flexor-progressive": { w: 160, f: [
    { l: "Kneeling lunge, tuck the hips", a: "Kneeling on one knee, the other foot flat in front, body upright, hands on the hips, tailbone gently tucked under.",
      p: { hip: [84, 151], t: 180, nl: [-14, -90, -90], fl: [88, -5, 90], na: [-31, 30] } },
    { l: "Reach up, then rotate", a: "Still in the kneeling lunge, the arm on the kneeling side reaching up overhead for a side stretch, before turning the chest open.",
      p: { hip: [84, 151], t: 180, nl: [-14, -90, -90], fl: [88, -5, 90], na: [178, 178], fa: [-31, 30] },
      x: [{ mvq: [64, 100, 54, 70, 72, 46] }] },
  ] },
};
