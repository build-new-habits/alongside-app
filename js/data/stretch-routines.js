/**
 * js/data/stretch-routines.js
 * 28 Oct 2026 v1
 *
 * STAGE PATH P-9 (content session). The Plan's ready-made Stretch
 * routines, as Graeme approved them on 28 Oct ("That all looks good"),
 * with L4 added at his request ("if this is a gap in content, surely we
 * should plug that?"): BNH-Files Product/alongside_content_stretch-
 * routines_28oct2026_v2.md, Part 2. Data only. Nothing reads it until the
 * engine (Session 3, routinesFor) and the door route (Session 5). Free
 * never sees it.
 *
 * Each routine is an ordered list of movements by id with working minutes
 * (each side counted in the total); the minutes add up to the routine's
 * length (tools/verify-path-tags.mjs TEST 9). Every movement is in the
 * library, except L4's three new Pilates stretches
 * (exercises/path_movements.js).
 *
 * Areas match the Stretch door (blueprint D4): whole, neck-shoulders,
 * back-hips, legs. floor: false means the whole routine is done standing
 * or seated; withoutFloor gives the swap for a routine that has one.
 * NS4 is the one routine not in the approved draft: P-9d's floor of four
 * per area (Graeme, 28 Oct: "Both") left Neck and shoulders one short. It
 * uses only movements already in the library, standing or seated, and is
 * waiting for Graeme's look (schedule P-9e); change or remove it here.
 *
 * A sore area never sets which routine is suggested (W5-14); the builder's
 * own sore rules are unchanged. Options are the person's to choose.
 */

const WALL = "Stand near a wall to hold if you need it.";

const R = (o) => Object.freeze({ door: "stretch", easeOff: [], further: [], ...o, steps: Object.freeze(o.steps.map(s => Object.freeze(s))) });

export const AREAS = Object.freeze({
  "whole":          { label: "Whole body" },
  "neck-shoulders": { label: "Neck and shoulders" },
  "back-hips":      { label: "Back and hips" },
  "legs":           { label: "Legs" },
});

export const ROUTINES = Object.freeze([
  // ── Whole body ─────────────────────────────────────────────────────────
  R({ id: "wb1", area: "whole", style: "stretch", name: "Ten-minute stretch", minutes: 10, floor: true, support: WALL,
      steps: [
        { id: "spinal-flexion-extension-standing", mins: 1 },
        { id: "upper-trap-stretch", mins: 1, note: "Each side" },
        { id: "chest-opener-arms-back", mins: 1 },
        { id: "standing-quad-stretch", mins: 2, note: "Hand on the wall; each side" },
        { id: "standing-calf-stretch-wall", mins: 2, note: "Each side" },
        { id: "cat-cow", mins: 1 },
        { id: "childs-pose", mins: 2 },
      ],
      withoutFloor: { "cat-cow+childs-pose": [{ id: "seated-spinal-decompression", mins: 3 }] } }),
  R({ id: "wb2", area: "whole", style: "yoga", name: "Slow yoga stretch", minutes: 20, floor: true,
      steps: [
        { id: "yoga-cat-cow-flow", mins: 2 },
        { id: "yoga-downward-dog", mins: 2 },
        { id: "yoga-crescent-lunge", mins: 4, note: "Each side" },
        { id: "yoga-triangle", mins: 4, note: "Each side" },
        { id: "yoga-seated-forward-fold", mins: 3 },
        { id: "yoga-supine-twist", mins: 3, note: "Each side" },
        { id: "childs-pose", mins: 2 },
      ] }),
  R({ id: "wb3", area: "whole", style: "pilates", name: "Pilates stretch", minutes: 15, floor: true,
      steps: [
        { id: "cat-cow", mins: 2 },
        { id: "pilates-roll-down-standing", mins: 2 },
        { id: "pilates-spine-stretch", mins: 2 },
        { id: "pilates-mermaid", mins: 2, note: "Each side" },
        { id: "pilates-spine-twist", mins: 2 },
        { id: "pilates-swan", mins: 2 },
        { id: "pilates-leg-circles", mins: 2, note: "Each side" },
        { id: "childs-pose", mins: 1 },
      ] }),
  R({ id: "wb4", area: "whole", style: "stretch", name: "Long whole-body stretch", minutes: 30, floor: true,
      steps: [
        { id: "neck-mobility", mins: 2, note: "Seated" },
        { id: "upper-trap-stretch", mins: 2, note: "Each side" },
        { id: "chest-opener-arms-back", mins: 2 },
        { id: "thread-the-needle", mins: 2, note: "Each side" },
        { id: "cat-cow", mins: 2 },
        { id: "thoracic-rotation", mins: 2, note: "Each side" },
        { id: "hip-flexor-stretch", mins: 3, note: "Each side" },
        { id: "pigeon-pose", mins: 4, note: "Each side" },
        { id: "supine-hamstring-stretch", mins: 3, note: "Towel or band; each side" },
        { id: "90-90-hip-stretch", mins: 3, note: "Each side" },
        { id: "supine-twist", mins: 3, note: "Each side" },
        { id: "childs-pose", mins: 2 },
      ],
      easeOff: ["If Pigeon Pose is a lot for your hips, do the Seated Figure-4 Stretch instead.", "If the 90-90 stretch is a lot, sit on a cushion."],
      swaps: { easeOff: { "pigeon-pose": "seated-figure-4-stretch" } } }),

  // ── Neck and shoulders ─────────────────────────────────────────────────
  R({ id: "ns1", area: "neck-shoulders", style: "stretch", name: "Desk unwind", minutes: 10, floor: false, support: "A chair is all you need.",
      steps: [
        { id: "seated-shoulder-rolls-warmup", mins: 1 },
        { id: "neck-mobility", mins: 2 },
        { id: "seated-neck-side-stretch", mins: 2, note: "Each side" },
        { id: "seated-chest-doorway-stretch", mins: 2 },
        { id: "seated-lat-side-stretch", mins: 2, note: "Each side" },
        { id: "thoracic-rotation-seated", mins: 1, note: "Each side" },
      ] }),
  R({ id: "ns2", area: "neck-shoulders", style: "yoga", name: "Neck and shoulders yoga", minutes: 12, floor: true,
      steps: [
        { id: "yoga-cat-cow-flow", mins: 2 },
        { id: "thread-the-needle", mins: 2, note: "Each side" },
        { id: "yoga-downward-dog", mins: 2 },
        { id: "yoga-cobra", mins: 2 },
        { id: "childs-pose", mins: 2, note: "Arms reaching forward" },
        { id: "upper-trap-stretch", mins: 2, note: "Kneeling or seated; each side" },
      ],
      easeOff: ["If Downward Dog is a lot for your arms, put your hands on a chair seat.", "If Cobra pinches your lower back, keep the forearms down and lift only a little."] }),
  R({ id: "ns3", area: "neck-shoulders", style: "pilates", name: "Upper back Pilates", minutes: 12, floor: true,
      steps: [
        { id: "pilates-roll-down-standing", mins: 2 },
        { id: "pilates-spine-twist", mins: 2 },
        { id: "pilates-swan", mins: 2 },
        { id: "pilates-mermaid", mins: 2, note: "Each side" },
        { id: "thread-the-needle", mins: 2, note: "Each side" },
        { id: "childs-pose", mins: 2 },
      ] }),
  R({ id: "ns4", area: "neck-shoulders", style: "stretch", name: "Shoulders, standing", minutes: 8, floor: false, support: "A doorway and a chair nearby.", awaitingApproval: true,
      steps: [
        { id: "shoulder-cars-standing", mins: 2, note: "Each side" },
        { id: "chest-opener-arms-back", mins: 1 },
        { id: "doorway-chest-stretch", mins: 2 },
        { id: "upper-trap-stretch", mins: 2, note: "Each side" },
        { id: "neck-mobility", mins: 1, note: "Seated" },
      ],
      easeOff: ["If lifting your arm high is a lot for your shoulder today, keep the circles small."] }),

  // ── Back and hips ──────────────────────────────────────────────────────
  R({ id: "bh1", area: "back-hips", style: "stretch", name: "Back and hips", minutes: 10, floor: true,
      steps: [
        { id: "cat-cow", mins: 2 },
        { id: "hip-flexor-stretch", mins: 2, note: "Each side" },
        { id: "seated-figure-4-stretch", mins: 2, note: "Each side" },
        { id: "supine-twist", mins: 2, note: "Each side" },
        { id: "childs-pose", mins: 2 },
      ] }),
  R({ id: "bh2", area: "back-hips", style: "yoga", name: "Hips and hamstrings", minutes: 15, floor: true,
      steps: [
        { id: "yoga-cat-cow-flow", mins: 2 },
        { id: "yoga-crescent-lunge", mins: 3, note: "Each side" },
        { id: "yoga-pigeon-pose", mins: 4, note: "Each side" },
        { id: "yoga-seated-forward-fold", mins: 3 },
        { id: "yoga-supine-twist", mins: 3, note: "Each side" },
      ],
      easeOff: ["If Pigeon Pose is a lot for your hips, do the Seated Figure-4 Stretch instead.", "If your lower back rounds in the forward fold, sit on a folded blanket."],
      swaps: { easeOff: { "yoga-pigeon-pose": "seated-figure-4-stretch" } } }),
  R({ id: "bh3", area: "back-hips", style: "pilates", name: "Pilates for back and hips", minutes: 12, floor: true,
      steps: [
        { id: "pilates-roll-down-wall", mins: 2 },
        { id: "pilates-spine-stretch", mins: 2 },
        { id: "pilates-leg-circles", mins: 2, note: "Each side" },
        { id: "pilates-mermaid", mins: 2, note: "Each side" },
        { id: "pilates-spine-twist", mins: 2 },
        { id: "childs-pose", mins: 2 },
      ] }),
  R({ id: "bh4", area: "back-hips", style: "stretch", name: "Seated back and hips", minutes: 8, floor: false, support: "A chair is all you need.",
      steps: [
        { id: "seated-spinal-decompression", mins: 2 },
        { id: "thoracic-rotation-seated", mins: 2, note: "Each side" },
        { id: "seated-hip-flexor-stretch", mins: 2, note: "Each side" },
        { id: "seated-figure-4-stretch", mins: 2, note: "Each side" },
      ] }),

  // ── Legs ───────────────────────────────────────────────────────────────
  R({ id: "l1", area: "legs", style: "stretch", name: "After a run or ride", minutes: 12, floor: false, support: WALL, afterOutside: true,
      steps: [
        { id: "standing-quad-stretch", mins: 2, note: "Each side" },
        { id: "standing-calf-stretch-wall", mins: 2, note: "Each side" },
        { id: "soleus-stretch-bent-knee", mins: 2, note: "Each side" },
        { id: "adductor-stretch-standing", mins: 2, note: "Each side" },
        { id: "lateral-quad-stretch", mins: 2, note: "Each side" },
        { id: "pilates-roll-down-standing", mins: 2 },
      ] }),
  R({ id: "l2", area: "legs", style: "yoga", name: "Leg yoga", minutes: 15, floor: true,
      steps: [
        { id: "yoga-downward-dog", mins: 2 },
        { id: "yoga-crescent-lunge", mins: 4, note: "Each side" },
        { id: "yoga-triangle", mins: 4, note: "Each side" },
        { id: "yoga-seated-forward-fold", mins: 3 },
        { id: "supine-hamstring-stretch", mins: 2, note: "Towel or band; each side" },
      ] }),
  R({ id: "l3", area: "legs", style: "stretch", name: "Calves and ankles", minutes: 8, floor: false, support: WALL,
      steps: [
        { id: "ankle-mobility-circles", mins: 2, note: "Seated; each side" },
        { id: "standing-calf-stretch-wall", mins: 2, note: "Each side" },
        { id: "soleus-stretch-bent-knee", mins: 2, note: "Each side" },
        { id: "ankle-wall-dorsiflexion", mins: 2, note: "Each side" },
      ] }),
  R({ id: "l4", area: "legs", style: "pilates", name: "Pilates for legs", minutes: 12, floor: true,
      steps: [
        { id: "pilates-leg-circles", mins: 2, note: "Each side" },
        { id: "pilates-spine-stretch", mins: 2 },
        { id: "pilates-saw", mins: 2 },
        { id: "pilates-side-lying-quad", mins: 2, note: "Each side" },
        { id: "pilates-thigh-stretch", mins: 2 },
        { id: "pilates-mermaid", mins: 2, note: "Each side" },
      ],
      easeOff: ["If The Saw pulls at the back of your legs, bend your knees.", "If the thigh stretch is a lot for your knees, lean back only a little, or leave it out and stay longer in the side-lying quad stretch."] }),
]);
