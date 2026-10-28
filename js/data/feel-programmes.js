/**
 * js/data/feel-programmes.js
 * 28 Oct 2026 v1
 *
 * STAGE PATH P-9 / P-9a (blueprint Session 2). The Plan's Move to feel
 * better programmes, as Graeme approved them on 28 Oct ("Great. These
 * look great"): BNH-Files Product/alongside_content_feel-better-
 * programmes_28oct2026_v2.md, Part 2. Data only. Nothing reads it until
 * the engine (Session 3, programmesFor) and the door route (Session 5).
 * Free never sees it.
 *
 * Each programme is an ordered list of movements by id, from the library
 * (data/exercises/*.js) or the new movements (exercises/path_movements.js),
 * each with its working minutes; the minutes add up to the programme's
 * length (tools/verify-path-tags.mjs). The person chooses an option; the
 * app never chooses one for them. Options follow the entry standard's
 * adaptation rules: easeOff starts "If", further starts "When", no
 * ranking words.
 *
 * Words (spec §8): movement can help you feel more settled, awake or
 * ready for bed. Nothing here says it treats stress, low mood, tiredness
 * or sleep.
 */

/** The five feelings, in the order the door shows them. Icons: data/line-icons.js (Session 4). */
export const FEELINGS = Object.freeze({
  ground: { label: "Grounded",        line: "Slow, steady movement to settle you",          icon: "mountain" },
  calm:   { label: "Calmer",          line: "Rhythm and breath to take the edge off stress", icon: "wave" },
  worn:   { label: "Worn out",        line: "Very gentle, short, and easy to stop",          icon: "battery",
            before: "We'll keep this very gentle and short. If you've felt worn out for weeks, or it's getting worse, it's worth speaking to your GP." },
  wake:   { label: "Wake up",         line: "Feel energised and ready for the day",          icon: "sun" },
  sleep:  { label: "Ready for sleep", line: "Slow movement to wind down before bed",         icon: "moon",
            before: "Best done close to bedtime, in comfortable clothes, with the lights low." },
});

/** Surprise me (sparkle icon) picks from these; its rule belongs to the engine (Session 3). */
export const SURPRISE = Object.freeze({ label: "Surprise me", icon: "sparkle" });

/** Said on every tai chi and qigong programme, with the hurt-and-ache guidance every card has. */
export const SLOW_LINE = "Move slowly and only as far as is comfortable. If something hurts, ease off or sit down.";

const WALL = "Have a wall or the back of a chair nearby to hold if you need it.";

const P = (o) => Object.freeze({ door: "feel", ...o, steps: Object.freeze(o.steps.map(s => Object.freeze(s))) });

export const PROGRAMMES = Object.freeze([
  // ── Grounded ───────────────────────────────────────────────────────────
  P({ id: "g1", feeling: "ground", style: "gentle", name: "Feet on the floor", minutes: 10, position: "standing", seatedRoute: true, support: WALL,
      steps: [
        { id: "feet-on-floor-grounding", mins: 2, note: "Notice where your feet meet the floor" },
        { id: "tc-weight-shift", mins: 2, note: "Let your weight drift slowly from one foot to the other" },
        { id: "ankle-circles", mins: 1, note: "Slow circles, both directions" },
        { id: "spinal-flexion-extension-standing", mins: 1, note: "Small and slow is enough" },
        { id: "qg-pressing-earth", mins: 2, note: "Palms float down as the knees soften" },
        { id: "five-four-three-two-one-grounding", mins: 2, note: "Name what you can see, hear and feel" },
      ],
      easeOff: ["If standing is too much today, do it all seated, with the weight shift and pressing the earth as arm-only movements."],
      further: ["When the weight shift feels steady, stay on each side for three slow breaths."] }),
  P({ id: "g2", feeling: "ground", style: "yoga", name: "Grounding yoga", minutes: 12, position: "standing", seatedRoute: false, support: "Stand near a wall, for Tree Pose and anything else that wobbles.",
      steps: [
        { id: "yoga-mountain-pose", mins: 2 },
        { id: "yoga-tree-pose", mins: 2, note: "Hand on the wall; one minute each side" },
        { id: "yoga-warrior-2", mins: 2, note: "One minute each side" },
        { id: "pilates-roll-down-standing", mins: 2 },
        { id: "yoga-mountain-pose", mins: 2, note: "Eyes open or closed, as you like" },
        { id: "feet-on-floor-grounding", mins: 2, note: "Seated" },
      ],
      easeOff: ["If Tree Pose wobbles, keep the toes of the lifted foot on the floor.", "If Warrior II is a lot for your legs, take a shorter stance."],
      further: ["When Tree Pose feels steady by the wall, try it a step away from the wall."] }),
  P({ id: "g3", feeling: "ground", style: "taichi", name: "Rooted tai chi", minutes: 15, position: "standing", seatedRoute: true, support: WALL, slowLine: true,
      steps: [
        { id: "tc-opening-stance", mins: 2 },
        { id: "tc-weight-shift", mins: 2 },
        { id: "tc-wave-hands-clouds", mins: 4 },
        { id: "tc-brush-knee", mins: 3 },
        { id: "tc-closing", mins: 2 },
        { id: "breath-awareness-meditation", mins: 2, note: "Standing or seated" },
      ],
      easeOff: ["If your knees ask for less, keep them barely bent.", "If standing is too much today, sit and do the arms only."],
      further: ["When it all feels steady, bend the knees a little more and shift your weight more slowly, never past comfortable."] }),

  // ── Calmer ─────────────────────────────────────────────────────────────
  P({ id: "c1", feeling: "calm", style: "gentle", name: "Breathe and sway", minutes: 10, position: "standing", seatedRoute: true, support: WALL,
      steps: [
        { id: "extended-exhale-breathing", mins: 3 },
        { id: "gm-gentle-sway", mins: 2 },
        { id: "seated-shoulder-rolls-warmup", mins: 2 },
        { id: "upper-trap-stretch", mins: 1 },
        { id: "physiological-sigh", mins: 2 },
      ],
      easeOff: ["If standing is too much today, stay seated throughout."],
      further: ["When the sway feels comfortable, let your arms swing slowly with it."] }),
  P({ id: "c2", feeling: "calm", style: "yoga", name: "Calming yoga", minutes: 15, position: "floor", seatedRoute: false,
      steps: [
        { id: "yoga-cat-cow-flow", mins: 2 },
        { id: "childs-pose", mins: 2 },
        { id: "thread-the-needle", mins: 2, note: "One minute each side" },
        { id: "yoga-supine-twist", mins: 3 },
        { id: "yoga-legs-up-wall", mins: 4 },
        { id: "coherent-breathing", mins: 2 },
      ],
      easeOff: ["If your knees complain in Child's Pose, put a cushion under them.", "If getting your legs up the wall is awkward, rest them on a chair seat instead."],
      further: ["When the poses feel comfortable, stay in each a little longer, breathing slowly."] }),
  P({ id: "c3", feeling: "calm", style: "taichi", name: "Tai chi for calm", minutes: 20, position: "standing", seatedRoute: true, support: WALL, slowLine: true,
      learnInPieces: { stopAfter: 3 },
      steps: [
        { id: "tc-opening-stance", mins: 2 },
        { id: "tc-weight-shift", mins: 2 },
        { id: "tc-wave-hands-clouds", mins: 5 },
        { id: "tc-brush-knee", mins: 4 },
        { id: "tc-push-forward", mins: 3 },
        { id: "tc-closing", mins: 2 },
        { id: "breath-awareness-meditation", mins: 2 },
      ],
      easeOff: ["If this is new to you, stop after Wave hands like clouds the first time and add a movement next time.", "If standing is too much today, sit and do the arms only."],
      further: [] }),

  // ── Worn out ───────────────────────────────────────────────────────────
  P({ id: "w1", feeling: "worn", style: "gentle", name: "Rest and reset", minutes: 6, position: "seated", seatedRoute: true,
      steps: [
        { id: "belly-breathing", mins: 2 },
        { id: "seated-shoulder-rolls-warmup", mins: 1 },
        { id: "ankle-mobility-circles", mins: 1, note: "Seated" },
        { id: "yoga-corpse-pose", mins: 2, note: "A short one" },
      ],
      easeOff: ["If lying down suits you better, do the breathing and the ankles lying down too."],
      further: [] }),
  P({ id: "w2", feeling: "worn", style: "yoga", name: "Lying-down yoga", minutes: 8, position: "floor", seatedRoute: true,
      steps: [
        { id: "diaphragmatic-breathing", mins: 2 },
        { id: "gm-knees-hug", mins: 1 },
        { id: "yoga-supine-twist", mins: 2 },
        { id: "yoga-corpse-pose", mins: 3 },
      ],
      easeOff: ["If hugging both knees is a lot, hug one knee at a time.", "If the twist pulls, rest your knees on a pillow."],
      further: [] }),

  // ── Wake up ────────────────────────────────────────────────────────────
  P({ id: "k1", feeling: "wake", style: "gentle", name: "Morning wake-up", minutes: 8, position: "standing", seatedRoute: true, support: "Have a sturdy chair beside you for the march.",
      steps: [
        { id: "neck-mobility", mins: 2, note: "Seated" },
        { id: "shoulder-cars-standing", mins: 1 },
        { id: "hip-circles-standing", mins: 1 },
        { id: "ankle-circles", mins: 1 },
        { id: "spinal-flexion-extension-standing", mins: 1 },
        { id: "gm-reach-and-rise", mins: 1 },
        { id: "chair-supported-march", mins: 1 },
      ],
      swaps: { seated: { "chair-supported-march": "seated-marching-cardio" } },
      easeOff: ["If standing is too much this morning, stay seated throughout and march seated."],
      further: ["When the march feels steady, let go of the chair and lift your knees a little higher."] }),
  P({ id: "k2", feeling: "wake", style: "yoga", name: "Wake-up yoga", minutes: 10, position: "floor", seatedRoute: false,
      steps: [
        { id: "yoga-cat-cow-flow", mins: 2 },
        { id: "yoga-downward-dog", mins: 1 },
        { id: "yoga-crescent-lunge", mins: 2, note: "One minute each side" },
        { id: "pilates-roll-down-standing", mins: 2 },
        { id: "yoga-mountain-pose", mins: 1, note: "With an overhead reach" },
        { id: "yoga-warrior-1", mins: 2, note: "One minute each side" },
      ],
      easeOff: ["If Downward Dog is a lot for your arms, put your hands on a chair seat.", "If the lunge wobbles, put the back knee down."],
      further: ["When this feels good, try Energising yoga flow."], next: "k5" }),
  P({ id: "k3", feeling: "wake", style: "pilates", name: "Morning Pilates", minutes: 12, position: "floor", seatedRoute: false,
      steps: [
        { id: "pilates-roll-down-wall", mins: 2 },
        { id: "pilates-shoulder-bridge", mins: 2 },
        { id: "pilates-single-leg-stretch", mins: 2 },
        { id: "pilates-swimming", mins: 2 },
        { id: "pilates-mermaid", mins: 2 },
        { id: "pilates-spine-stretch", mins: 2 },
      ],
      easeOff: ["If your neck tires in Single Leg Stretch, keep your head down on the mat.", "If Swimming is a lot, move one arm or one leg at a time."],
      further: ["When this feels good, try the 20-minute Pilates sequence."], nextId: "pilates-sequence-beginner" }),
  P({ id: "k4", feeling: "wake", style: "qigong", name: "Qigong energiser", minutes: 10, position: "standing", seatedRoute: true, support: WALL, slowLine: true,
      line: "Five of the Eight Pieces of Brocade, the ones with no deep forward bend, with tapping and a closing breath.",
      steps: [
        { id: "qg-tapping", mins: 1.5 },
        { id: "qg-hold-up-sky", mins: 1.5 },
        { id: "qg-draw-bow", mins: 2 },
        { id: "qg-separate-heaven-earth", mins: 1.5 },
        { id: "qg-look-back", mins: 1 },
        { id: "qg-heel-drops", mins: 1 },
        { id: "qg-closing-breath", mins: 1.5 },
      ],
      easeOff: ["If standing is too much this morning, sit and do the arms only.", "If heel drops jar, lift the heels slowly and lower them without dropping."],
      further: ["When Drawing the bow feels steady, take your feet a little wider."] }),
  P({ id: "k5", feeling: "wake", style: "yoga", name: "Energising yoga flow", minutes: 20, position: "floor", seatedRoute: false,
      steps: [
        { id: "mobility-flow-5min", mins: 5 },
        { id: "yoga-sun-salutation-b", mins: 6, note: "Two rounds" },
        { id: "yoga-warrior-2", mins: 2 },
        { id: "yoga-chair-pose", mins: 2 },
        { id: "yoga-tree-pose", mins: 2 },
        { id: "yoga-corpse-pose", mins: 3 },
      ],
      easeOff: ["If this is a lot today, Wake-up yoga is the same idea in ten minutes."],
      further: [] }),

  // ── Ready for sleep ────────────────────────────────────────────────────
  P({ id: "s1", feeling: "sleep", style: "gentle", name: "Wind-down stretches", minutes: 10, position: "floor", seatedRoute: true,
      steps: [
        { id: "seated-neck-side-stretch", mins: 2 },
        { id: "yoga-cat-cow-flow", mins: 2, note: "Slowly" },
        { id: "childs-pose", mins: 2 },
        { id: "yoga-supine-twist", mins: 2 },
        { id: "extended-exhale-breathing", mins: 2, note: "Lying down" },
      ],
      easeOff: ["If getting to the floor is a lot tonight, do it all on the bed."],
      further: [] }),
  P({ id: "s2", feeling: "sleep", style: "yoga", name: "Bedtime yoga", minutes: 12, position: "floor", seatedRoute: true,
      steps: [
        { id: "yoga-legs-up-wall", mins: 4 },
        { id: "yoga-reclined-butterfly", mins: 2 },
        { id: "yoga-supine-twist", mins: 2 },
        { id: "childs-pose", mins: 2 },
        { id: "diaphragmatic-breathing", mins: 2 },
      ],
      easeOff: ["If the butterfly pulls at your hips, put pillows under your knees.", "If there is no wall handy, rest your legs on the bed."],
      further: [] }),
  P({ id: "s3", feeling: "sleep", style: "qigong", name: "Evening qigong", minutes: 10, position: "standing", seatedRoute: true, support: WALL, slowLine: true,
      steps: [
        { id: "tc-opening-stance", mins: 1.5 },
        { id: "qg-hold-up-sky", mins: 2, note: "Slowly" },
        { id: "qg-gathering-in", mins: 2 },
        { id: "tc-wave-hands-clouds", mins: 2, note: "Slowly" },
        { id: "qg-closing-breath", mins: 2.5 },
      ],
      easeOff: ["If standing is too much tonight, sit and do the arms only."],
      further: [] }),
]);

/** Existing classes and flows offered alongside each feeling (not rewritten). */
export const ALSO_OFFERED = Object.freeze({
  ground: Object.freeze(["class-ground-001"]),
  calm:   Object.freeze(["class-out-006"]),
  worn:   Object.freeze(["class-stopping-early-003"]),
  wake:   Object.freeze(["class-getting-going-009", "yoga-flow-morning"]),
  sleep:  Object.freeze(["class-putting-down-008", "yoga-flow-evening"]),
});

/** Every movement id any programme uses, with the feelings that use it. */
export function feelingsByMovement() {
  const out = {};
  for (const p of PROGRAMMES) for (const s of p.steps) (out[s.id] = out[s.id] || new Set()).add(p.feeling);
  for (const p of PROGRAMMES) for (const [, swap] of Object.entries(p.swaps || {})) for (const id of Object.values(swap)) (out[id] = out[id] || new Set()).add(p.feeling);
  for (const [f, list] of Object.entries(ALSO_OFFERED)) for (const id of list) if (!/^class-/.test(id)) (out[id] = out[id] || new Set()).add(f);
  for (const p of PROGRAMMES) if (p.nextId) (out[p.nextId] = out[p.nextId] || new Set()).add(p.feeling);
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, [...v]]));
}
