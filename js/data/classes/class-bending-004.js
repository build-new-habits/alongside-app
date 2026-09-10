/**
 * data/classes/class-bending-004.js
 *
 * 08 Sep 2026 v1
 *
 * CLASS-4. Class 004, "Bending", as data.
 *
 * Transcribed from
 * Documents/Admin/alongside_class_004_bending_08sep2026_v1_DRAFT.md,
 * which stays the authored source. Where the two disagree the document
 * is right and this file is wrong.
 *
 * Serves `back-resilience` — the one strand in Graeme's arc, "Build a
 * core that actually holds me up", that no class served. Steady Round
 * only touches it. With this, his three displayed strands are covered.
 *
 * ⚫ THREE QUESTIONS ARE STILL OPEN on the document and were transcribed
 * as drafted rather than pre-empted: whether "Bending" is the right name
 * or the frightening one, whether "about forty times" should be vaguer,
 * and whether the lighter variant needs its replacement line at all.
 * Each is a one-line edit here when answered.
 *
 * 🔴 WHAT THIS CLASS DOES NOT PROMISE. It never says the back will stop
 * hurting. That is the promise everybody with a bad back has already had
 * made and broken. It offers something smaller and true: the back moves,
 * you moved it deliberately, and you chose where it stopped.
 *
 * 🔴 "Whether it helps is not a today question" is the third instance of
 * the same honesty — Stopping Early's "later in the week, not now",
 * Standing Up's "on a staircase in a month". Across the set that is a
 * property of the voice, not a line: the class never claims a result it
 * cannot show you.
 *
 * ⚫ WRITTEN WITH ITS LIGHTER VARIANT, not fitted with one afterwards,
 * and that decided the running order. Sections 5 and 6 are the two that
 * LOAD the back; on a not-great day the movements to keep are the ones
 * asking it to move, and the ones to drop are the ones asking it to
 * work. So the hinge sits at 6 where it can be lifted out, not at 3.
 */

export const CLASS_BENDING_004 = {
  id:            'class-bending-004',
  title:         'Bending',

  serves:        'back-resilience',
  touches:       ['hip-hinge', 'trusting-body'],

  formats:       ['strength'],
  intensityBias: 'gentle',
  durationMins:  15,
  position:      'floor',
  seatedRoute:   true,
  equipment:     [],
  flags:         ['floor-transfer', 'up-and-down-once', 'bending-forward'],

  // Omits the two sections that load the back. What is left is the
  // bending without the strength work: ten minutes, and still
  // recognisably this class rather than a blander one.
  lighter: {
    omitSections: ['glute-bridge', 'hip-hinge']
  },

  sections: [
    {
      id: 'before', title: 'Before we start', durationSeconds: 90,
      note: 'The exit is offered before the first movement, not after somebody has hurt themselves finding out.',
      beats: [
        {
          kind: 'arriving',
          screen: "We're going to bend, on purpose, slowly. Nothing heavy. Nothing fast. You choose where each one stops.",
          voice: 'This one is about bending. Which, if your back has been a problem, might be the exact thing you\u2019ve been avoiding.',
          speechSeconds: 10
        },
        {
          kind: 'arriving',
          voice: 'Nothing here is loaded and nothing here is fast. Every movement has a point where you decide it stops, and I\u2019ll tell you what to listen for each time.',
          speechSeconds: 12
        },
        {
          // 🔴 For this strand the exit has to come FIRST. The people
          // arriving here include those who will push through and regret
          // it, and the coach saying it out loud is what makes leaving an
          // ordinary thing rather than a failure.
          kind: 'arriving',
          voice: "If your back is genuinely angry today, this isn't the day for it. Come back tomorrow — the class doesn't go anywhere.",
          speechSeconds: 12
        }
      ]
    },

    {
      id: 'pelvic-tilt', title: 'Pelvic tilt', durationSeconds: 120,
      beats: [
        {
          kind: 'movement',
          screen: 'Pelvic tilt — on your back, knees bent. Roll the pelvis, small. Stop while it still feels like nothing much.',
          voice: 'On your back, knees bent, feet flat. Put a hand on your stomach if that helps you feel this.',
          speechSeconds: 15,
          exerciseId: 'pelvic-tilt',
          sitOut: true,
          stopCue: 'while it still feels like nothing much'
        },
        {
          kind: 'movement',
          voice: "Flatten your lower back gently towards the floor, then let it come back. That's the whole movement. It's smaller than you think it should be.",
          speechSeconds: 30
        },
        {
          kind: 'movement',
          voice: "Stop while it still feels like nothing much. This one isn't supposed to feel like anything — it's the back learning it can move a bit without a fuss.",
          speechSeconds: 35
        }
      ]
    },

    {
      id: 'cat-cow', title: 'Cat-Cow', durationSeconds: 120,
      beats: [
        {
          kind: 'movement',
          screen: 'Cat-Cow — hands and knees, or seated. As far as it goes today, which moves about.',
          voice: 'Come onto your hands and knees, or stay in a chair and do the same thing sitting up.',
          speechSeconds: 15,
          exerciseId: 'cat-cow',
          sitOut: true,
          seatedAlternativeId: 'thoracic-rotation-seated',
          stopCue: 'as far as it goes today'
        },
        {
          kind: 'movement',
          voice: 'Round your back up, then let it drop the other way. Slowly, and only as far as it goes today.',
          speechSeconds: 30
        },
        {
          kind: 'movement',
          voice: "How far that is changes day to day, and it isn't a score. Some days it's most of the way and some days it's barely anything, and both of those are just today.",
          speechSeconds: 30
        }
      ]
    },

    {
      id: 'what-that-was-like', title: 'What that was like', durationSeconds: 60,
      note: 'The question is deliberately low. "Did anything happen" is answerable by somebody who felt nothing, and nothing-happened is the evidence this class gathers. "How does your back feel?" invites a survey of every ache, which is the opposite exercise.',
      beats: [
        {
          kind: 'reflect',
          screen: "Did anything happen? Probably not. That's the useful bit.",
          voice: 'Come back to lying, or sitting.',
          speechSeconds: 15
        },
        {
          kind: 'reflect',
          voice: "Did anything happen? Most likely not much. That's not a disappointing answer — for this, it's the whole answer.",
          speechSeconds: 25
        }
      ]
    },

    {
      id: 'glute-bridge', title: 'Glute bridge', durationSeconds: 120,
      beats: [
        {
          kind: 'movement',
          screen: 'Glute bridge — lift the hips, hold a second, down slowly. Stop when it stops feeling smooth.',
          voice: 'Still on your back, knees bent. Push through your heels and let your hips come up. Not high. Down slowly.',
          speechSeconds: 20,
          exerciseId: 'glute-bridge',
          sitOut: true,
          stopCue: 'when it stops feeling smooth'
        },
        {
          kind: 'movement',
          voice: 'This is the back and the hips working together, which is mostly what a back that copes is.',
          speechSeconds: 30
        },
        {
          kind: 'movement',
          voice: "Stop when it stops feeling smooth — same signal as always, and it's still the useful one.",
          speechSeconds: 30
        }
      ]
    },

    {
      id: 'hip-hinge', title: 'Hip hinge', durationSeconds: 180,
      note: 'The point of the class. Everything before it is preparation and everything after is settling. Placed sixth so it can be lifted out on a lighter day.',
      beats: [
        {
          kind: 'movement',
          screen: 'Hip hinge — standing, or seated. Hips back, chest forward. Only while your back stays long.',
          voice: "Stand up if that's available. Take your time getting there — no rush, and no prize for speed.",
          speechSeconds: 20,
          exerciseId: 'hip-hinge-drill',
          sitOut: true,
          seatedAlternativeId: 'seated-hip-hinge',
          stopCue: 'while your back stays long'
        },
        {
          kind: 'movement',
          voice: "Feet about hip width. Push your hips backwards and let your chest come towards the floor. Your back stays long the whole way — you're bending at the hips, not curling the spine.",
          speechSeconds: 35
        },
        {
          kind: 'movement',
          voice: "If standing isn't happening, do it sitting: hinge forward from the hips with a long back. Same movement, same lesson, and not a lesser one.",
          speechSeconds: 30
        },
        {
          kind: 'movement',
          voice: "The moment your back starts to round, that's your range today. It moves about. That's normal, and it's not a warning.",
          speechSeconds: 35
        }
      ]
    },

    {
      id: 'settling', title: 'Settling', durationSeconds: 120,
      beats: [
        {
          kind: 'rest',
          screen: "Nothing to do. Knees to one side if that's comfortable.",
          voice: "Back down to the floor, or back into the chair. Let your knees fall to one side if that feels good, or don't.",
          speechSeconds: 30
        },
        {
          // OPEN QUESTION on the document: "about forty times" is a
          // confident number the contract cannot verify, and it will
          // sometimes be wrong. Transcribed as drafted.
          kind: 'rest',
          voice: 'You bent your back about forty times in the last ten minutes. Deliberately, and slowly, and you chose where each one stopped.',
          // On a lighter day two of the four movements are not run, so
          // forty is wrong and so is "the last ten minutes".
          lighterVoice: 'You bent your back a good few times just then. Deliberately, and slowly, and you chose where each one stopped.',
          speechSeconds: 45
        },
        {
          // 🔴 The same honesty as Stopping Early and Standing Up. The
          // alternative — "this will strengthen your back" — is a claim
          // the class cannot verify and this person has been promised
          // before by somebody who was wrong.
          kind: 'rest',
          voice: "Whether it helps is not a today question. It's a few-weeks question.",
          speechSeconds: 40
        }
      ]
    },

    {
      id: 'leaving', title: 'Leaving', durationSeconds: 90,
      beats: [
        {
          kind: 'closing',
          screen: 'Done. Take your time getting up.',
          voice: "Roll onto one side and come up from there when you're ready.",
          speechSeconds: 20
        },
        {
          kind: 'closing',
          voice: "That's it. Fifteen minutes of bending, and nothing went wrong.",
          lighterVoice: "That's it. Ten minutes of bending, and nothing went wrong.",
          speechSeconds: 15
        },
        { kind: 'closing', voice: 'See you next time.' }
      ]
    }
  ]
};
