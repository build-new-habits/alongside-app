/**
 * data/classes/class-stopping-early-003.js
 *
 * 08 Sep 2026 v1
 *
 * CLASS-1. Class 003, "Stopping Early", as data.
 *
 * Transcribed from
 * Documents/Admin/alongside_class_003_stopping_early_06sep2026_v1.md,
 * which stays the authored source. Where the two disagree the document
 * is right and this file is wrong.
 *
 * The class that found `reflect` as a beat kind in its own right. Class
 * 001 had two of these and filed them as ordinary beats; they are not.
 * They take no exercise, no hold and no stop cue, and the screen and
 * voice diverge more than anywhere else.
 *
 * NO holdSeconds ANYWHERE, and correctly so. Nothing is held to a
 * duration because the entire point is that the person chooses every
 * ending. The contract makes hold optional for exactly this.
 *
 * 🔴 "IRRITATING" AND "POINTLESS" ARE NAMED BEFORE THE PERSON HAS TO.
 * If the only offered reactions are positive, somebody having a negative
 * one concludes they are doing the class wrong — and the honest answer
 * here is often irritation.
 *
 * 🔴 "YOU'LL FIND OUT LATER IN THE WEEK — NOT NOW" is the honest form of
 * the promise, and must survive any edit. The alternative — "this is how
 * you protect your energy" — is a claim the class cannot verify and the
 * person has heard before. Naming the delay is what makes the delay
 * survivable.
 *
 * ⚫ ON THE THIRD PRACTICE'S ALTERNATIVE. The document's prose calls it
 * "seated heel raise"; the library id is `seated-heel-toe-raise`. A
 * naming mismatch, not a missing movement — checked against the library
 * rather than assumed. It is also a FOURTH kind of alternative: not the
 * same movement with less of it, and not a seated version, but a
 * DIFFERENT movement doing the same job. Class 003 argued for not giving
 * that its own field until it recurs, and it has not yet, so it is
 * carried as easierRouteId.
 */

export const CLASS_STOPPING_EARLY_003 = {
  id:            'class-stopping-early-003',
  title:         'Stopping Early',

  serves:        'pacing',
  touches:       ['not-overdoing', 'gentle-capacity', 'trusting-body'],

  formats:       ['mindfulness'],
  intensityBias: 'gentle',
  durationMins:  12,
  position:      'seated',
  equipment:     [],
  flags:         ['body-focused-attention', 'deliberately-stopping-short'],

  sections: [
    {
      id: 'what-this-is', title: 'What this is', durationSeconds: 90,
      beats: [
        {
          kind: 'arriving',
          screen: "Pacing is one skill: stopping while you still have something left. We're going to practise it three times, where it costs nothing.",
          voice: 'Sit somewhere you can stay for about ten minutes.',
          speechSeconds: 10
        },
        {
          kind: 'arriving',
          voice: "Pacing gets described a lot of ways. Underneath it, there's one skill: stopping while you've still got something left.",
          speechSeconds: 12
        },
        {
          // Why the skill is hard to learn, said plainly. The proof turns
          // up late and almost nobody joins the two things up.
          kind: 'arriving',
          voice: "It's hard to learn because the proof turns up late. You stop early, nothing much happens, and then two days later you're alright — and almost nobody joins those two things up.",
          speechSeconds: 15
        },
        {
          kind: 'arriving',
          voice: "So we're going to practise the stopping, three times, somewhere it doesn't cost you anything.",
          speechSeconds: 10
        }
      ]
    },

    {
      id: 'shoulders', title: 'First one: shoulders', durationSeconds: 120,
      beats: [
        {
          kind: 'movement',
          screen: 'Roll your shoulders. Slowly. Stop when you notice you could keep going.',
          voice: 'Roll your shoulders backwards. Slowly, and only as big as is comfortable.',
          speechSeconds: 20,
          exerciseId: 'neck-mobility',
          sitOut: true,
          stopCue: 'when you notice there is more available'
        },
        {
          kind: 'movement',
          voice: "Here's the instruction, and it's an odd one. Stop when you notice you could keep going. Not when you're tired. When you first notice there's more in there.",
          speechSeconds: 25
        },
        { kind: 'movement', voice: "Whenever that is. There's no number.", speechSeconds: 30 },
        {
          // Overshooting is named as normal on the first go, before
          // anybody can read it as failure.
          kind: 'movement',
          voice: "If you overshot and stopped later than that — completely normal. It's the first go.",
          speechSeconds: 12
        }
      ]
    },

    {
      id: 'what-that-was-like', title: 'What that was like', durationSeconds: 60,
      beats: [
        {
          kind: 'reflect',
          screen: 'How did stopping feel? Fine, annoying, pointless — all real answers.',
          voice: 'How was that? Not the shoulders. The stopping.',
          speechSeconds: 20,
          practiceId: 'mindful-observation'
        },
        {
          // 🔴 The negative reactions are named FIRST. See the header.
          kind: 'reflect',
          voice: "Some people find it a relief. Some find it irritating, like being interrupted. Some think it's a bit pointless. All of those are the right answer.",
          speechSeconds: 20
        }
      ]
    },

    {
      id: 'reaching', title: 'Second one: reaching', durationSeconds: 120,
      beats: [
        {
          kind: 'movement',
          screen: "Reach one arm up. Then the other. Same instruction — stop while there's more.",
          voice: 'Reach one arm up above your head. Only as far as it goes easily.',
          speechSeconds: 20,
          exerciseId: 'thoracic-rotation-seated',
          sitOut: true,
          stopCue: 'while there is still more in it'
        },
        { kind: 'movement', voice: 'Down. Other arm.', speechSeconds: 20 },
        { kind: 'movement', voice: "Keep swapping. And stop while there's still more in it.", speechSeconds: 30 },
        {
          kind: 'movement',
          voice: "This one's usually easier than the shoulders. Second go at anything usually is.",
          speechSeconds: 15
        }
      ]
    },

    {
      id: 'standing', title: "Third one: standing, if that's available", durationSeconds: 120,
      beats: [
        {
          // The alternative is offered in the same breath as the movement
          // and named as not lesser -- not appended afterwards.
          kind: 'movement',
          screen: 'Stand and sit, a few times. Slowly. Or stay seated and lift your heels — same practice.',
          voice: "If standing up and sitting down is available today, do that a few times. Slowly. If it isn't, stay where you are and lift your heels off the floor instead — that's the same practice and it isn't a lesser version.",
          speechSeconds: 25,
          exerciseId: 'sit-to-stand',
          sitOut: true,
          easierRouteId: 'seated-heel-toe-raise',
          stopCue: 'while there is still more in it'
        },
        { kind: 'movement', voice: "Same instruction. Stop while there's more.", speechSeconds: 35 },
        {
          kind: 'movement',
          voice: 'This is the one where stopping early is hardest, because it feels like so little.',
          speechSeconds: 20
        }
      ]
    },

    {
      id: 'the-quiet', title: 'The quiet', durationSeconds: 150,
      note: 'The longest silence in any class so far, and written as a guess. In a class about stopping, sitting still afterwards is thematically right and may still be too long.',
      beats: [
        {
          kind: 'rest',
          screen: 'Nothing to do. You stopped three times and nothing bad happened.',
          voice: 'Sit for a couple of minutes. Nothing to do.',
          speechSeconds: 40
        },
        {
          // 🔴 The honest form of the promise. See the header.
          kind: 'rest',
          voice: "You stopped three times today when you didn't have to. Whether that turns out to be useful, you'll find out later in the week — not now.",
          speechSeconds: 50
        },
        { kind: 'rest', speechSeconds: 40 }
      ]
    },

    {
      id: 'leaving', title: 'Leaving', durationSeconds: 60,
      beats: [
        {
          kind: 'closing',
          screen: 'Done.',
          voice: "That's it. Twelve minutes, and the useful part was the three times you stopped.",
          speechSeconds: 10
        },
        { kind: 'closing', voice: 'See you next time.' }
      ]
    }
  ]
};
