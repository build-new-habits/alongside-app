/**
 * data/classes/class-getting-going-009.js
 *
 * 28 Sep 2026 v1
 *
 * F8, CLASS-8. Class 009, "Getting Going", as data. The readable script
 * is rendered from this file (tools/render-class-doc.mjs).
 *
 * Serves `getting-going` — six aims, none served. It is the strand for
 * somebody for whom STARTING is the whole difficulty, which makes it the
 * one class whose length is part of its content: nine minutes, standing
 * with a chair, nothing to get down to.
 *
 * ── THE PROBLEM THIS CLASS HAS ───────────────────────────────────────
 *
 * 🔴 Warm-up classes promise energy. Some days a bit of movement does
 * wake a person up; some days it does not, and a class that promised it
 * has just told them they did it wrong.
 *
 * So the class refuses the energy promise and puts the whole case on the
 * part that has already happened: they started. That is said early and
 * said again at the end, and it is the line protected in
 * verify-class-contract.
 *
 * ⚫ It never says "morning". People get going at all hours, and a class
 * that assumes a morning is a schedule nobody agreed to (6c's lesson,
 * from Class 007's "Thursday").
 */

export const CLASS_GETTING_GOING_009 = {
  id:            'class-getting-going-009',
  title:         'Getting Going',

  serves:        'getting-going',
  touches:       ['showing-up', 'gentle-capacity'],

  formats:       ['strength'],
  intensityBias: 'gentle',
  durationMins:  9,
  position:      'standing',
  seatedRoute:   true,
  equipment:     [],
  flags:         ['needs-a-chair', 'standing-with-support', 'no-floor'],

  lighter: {
    omitSections: ['sit-to-stand', 'calves'],
    note: 'The shorter one is all seated or holding the chair.'
  },

  sections: [
    {
      id: 'before', title: 'Before we start', durationSeconds: 50,
      note: 'The class makes its case before anything moves: starting is the part that already happened.',
      beats: [
        {
          kind: 'arriving',
          screen: 'A chair nearby. You have already done the hardest part.',
          voice: "Nine minutes, and a chair nearby to hold or sit on. If getting to this point was the hard bit, that part's already done.",
          lighterVoice: "A few minutes, and a chair nearby to hold or sit on. If getting to this point was the hard bit, that part's already done.",
          speechSeconds: 8
        },
        {
          kind: 'arriving',
          voice: "Some days this wakes you up and some days it doesn't. Both count the same. We're not chasing a feeling.",
          speechSeconds: 8
        }
      ]
    },

    {
      id: 'march', title: 'Marching', durationSeconds: 80,
      beats: [
        {
          kind: 'movement',
          screen: 'March on the spot, holding the chair. Or sitting, lifting one knee then the other.',
          voice: 'Hold the back of the chair and march on the spot. Or sit, and lift one knee, then the other. Easy pace.',
          speechSeconds: 15,
          exerciseId: 'chair-supported-march',
          sitOut: true,
          seatedAlternativeId: 'seated-marching-cardio',
          stopCue: 'an easy pace you could talk at'
        },
        {
          kind: 'movement',
          voice: 'Keep going. A pace you could talk at. Nothing to catch up with.',
          speechSeconds: 35
        }
      ]
    },

    {
      id: 'reach', title: 'Reaching', durationSeconds: 75,
      beats: [
        {
          kind: 'movement',
          screen: 'Reach up and over to one side. Then the other. Arms long, not strained.',
          voice: 'Stand or sit tall. One arm up and over to the side, then the other. Long arms, nothing forced.',
          speechSeconds: 15,
          exerciseId: 'seated-lat-side-stretch',
          sitOut: true,
          stopCue: 'long, not strained'
        },
        {
          kind: 'movement',
          voice: 'Side to side, as slowly as you like.',
          speechSeconds: 35
        }
      ]
    },

    {
      id: 'turn', title: 'Turning', durationSeconds: 80,
      beats: [
        {
          kind: 'movement',
          screen: 'Turn your upper body one way, then the other. Hips stay facing forward.',
          voice: 'Arms crossed on your chest, or hands on your hips. Turn your shoulders one way, back to the middle, and the other way.',
          speechSeconds: 15,
          exerciseId: 'seated-torso-rotation',
          sitOut: true,
          stopCue: 'only as far as it turns easily'
        },
        {
          kind: 'movement',
          voice: 'Only as far as it turns easily. The first few are always the stiffest.',
          speechSeconds: 35
        }
      ]
    },

    {
      id: 'sit-to-stand', title: 'Sit to stand', durationSeconds: 90,
      beats: [
        {
          kind: 'movement',
          screen: 'Sit to stand — from the chair, and back down slowly. Hands on your thighs if that helps.',
          voice: 'Sit near the front of the chair. Stand up, and sit back down slowly. Use your hands on your thighs if that helps — that still counts.',
          speechSeconds: 15,
          exerciseId: 'sit-to-stand',
          sitOut: true,
          seatedAlternativeId: 'seated-marching-cardio',
          stopCue: 'stop while the next one would still be easy'
        },
        {
          kind: 'movement',
          voice: "A few more. Stop while the next one would still be easy — that's the right place to stop, not a giving-up place.",
          speechSeconds: 35
        }
      ]
    },

    {
      id: 'calves', title: 'Up on your toes', durationSeconds: 65,
      beats: [
        {
          kind: 'movement',
          screen: 'Hold the chair. Up onto your toes, and down slowly.',
          voice: 'Hold the chair. Up onto your toes, and lower slowly.',
          speechSeconds: 10,
          exerciseId: 'chair-supported-calf-raise',
          sitOut: true,
          seatedAlternativeId: 'seated-calf-raise',
          stopCue: 'as high as is comfortable'
        },
        {
          kind: 'movement',
          voice: 'A few more, at your pace.',
          speechSeconds: 35
        }
      ]
    },

    {
      id: 'leaving', title: 'Leaving', durationSeconds: 100,
      beats: [
        {
          kind: 'reflect',
          screen: 'Anything different? Maybe, maybe not.',
          voice: "Anything feel different from when we started? Maybe. Maybe not. Either answer's fine.",
          speechSeconds: 12
        },
        {
          kind: 'closing',
          screen: 'You got going. That was the whole point.',
          voice: "You got going. That was the whole point, and it's done.",
          speechSeconds: 12
        }
      ]
    }
  ]
};
