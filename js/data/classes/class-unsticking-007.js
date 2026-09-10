/**
 * data/classes/class-unsticking-007.js
 *
 * 08 Sep 2026 v2
 *
 * v2 - PACING-1. A SIXTEEN minute class. Its content measures 15.2,
 *   and squeezing that into 15 meant six sections overrunning their
 *   slots. Sayable now that the card rounds to the minute.
 *
 * 08 Sep 2026 v1
 *
 * CLASS-6. Class 007, "Unsticking", as data.
 *
 * Transcribed from
 * Documents/Admin/alongside_class_007_unsticking_08sep2026_v2_DRAFT.md,
 * which stays the authored source. Where the two disagree the document
 * is right and this file is wrong.
 *
 * Serves `hip-range` — the last strand no existing class even touched,
 * and the highest remaining at 8 aims.
 *
 * ⚫ THIS STRAND WAS SET ASIDE ONCE, at class six, on the grounds that it
 * duplicates what the builder already does. Reading its aims changed
 * that: get through a day at a desk without seizing up · feel less stiff
 * than I do · get off the floor without using my hands · get back to
 * moving after a long gap. Not a mobility programme. The strand people
 * feel every day and have quietly decided is just age.
 *
 * ── THE PROBLEM THIS CLASS HAS ───────────────────────────────────────
 *
 * 🔴 Stiffness is the one thing people expect an immediate result from,
 * AND THEY GET ONE. Fifteen minutes of hip work does make you feel
 * looser — and it is almost entirely temporary, range that comes back
 * within the hour. Which is why people have stretched their hips for
 * years and are exactly as stiff as they were: they were measuring the
 * wrong thing.
 *
 * So this class makes the same refusal as the other six, pointed at the
 * one place a person will actively resist it — and it makes it AT THE
 * START. Said at the end, after they already feel better, it reads as
 * the class talking itself down. Said first it is a frame, and it turns
 * the temporary feeling from evidence of success into something they
 * were told to expect.
 *
 * 🔴 THE PHRASE CARRYING THAT CASE APPEARS THREE TIMES — the framing,
 * the settling, and the closing — and all three must move together. It
 * said "Thursday" in the draft's v1 until Graeme called it: "this seems
 * like an own goal." He was right. It assumed a schedule nobody had
 * agreed to, and for anybody who then did not do it on Thursday it was a
 * small failure the class had handed them, inside a class already asking
 * them to accept that today's good feeling does not count.
 *
 * ⚫ Two questions stay open on the document and are transcribed as
 * drafted: whether "Unsticking" reinforces the belief that something is
 * stuck, and whether the honesty at the start is wrong for somebody's
 * FIRST class — the contract has no way to say "from session two".
 */

export const CLASS_UNSTICKING_007 = {
  id:            'class-unsticking-007',
  title:         'Unsticking',

  serves:        'hip-range',
  touches:       ['at-home-in-body', 'confidence-floor'],

  formats:       ['stretch'],
  intensityBias: 'gentle',
  // PACING-1. SIXTEEN, not fifteen. Its content measures 15.2 minutes,
  // and squeezing that into a 15-minute frame meant six sections
  // overflowing their slots -- a class quietly running past what its own
  // card promised. Rounding to the nearest MINUTE is what makes 16
  // sayable: under the old five-minute bucket this read "about 20", a
  // 30% overstatement that would make somebody skip a class they had
  // time for.
  durationMins:  16,
  position:      'floor',
  seatedRoute:   true,
  equipment:     [],
  flags:         ['floor-position', 'getting-down-and-up', 'holding-positions'],

  // The two that come out are the two needing the floor properly.
  // Circles are standing, the hip flexor works half-kneeling or
  // standing, and both remaining movements have seated routes — so on a
  // bad day the class can be done without getting onto the floor at all.
  //
  // ⚫ OPEN, same worry as Standing Up's: that doubles it as the version
  // for somebody who cannot get to the floor on ANY day.
  lighter: {
    omitSections: ['figure-four', 'ninety-ninety']
  },

  sections: [
    {
      id: 'before', title: 'Before we start', durationSeconds: 130,
      note: 'The whole class turns on the honesty arriving FIRST. Afterwards it would sound like an excuse.',
      beats: [
        {
          kind: 'arriving',
          screen: "Hips. Fifteen minutes. You'll feel looser afterwards. That part doesn't last — the doing it again does.",
          voice: "This one's hips. Floor if you can get there, chair the whole way through if not — and the chair version isn't a reduced one, it's the same class sitting down.",
          speechSeconds: 20
        },
        {
          kind: 'arriving',
          voice: "Something I'd rather say now than at the end. You'll probably feel looser when we finish. That feeling is real, and it mostly wears off within the hour.",
          speechSeconds: 25
        },
        {
          kind: 'arriving',
          voice: "That's not me being gloomy. It's the reason people stretch their hips for years and stay exactly as stiff as they were — they were measuring the wrong thing. The bit that changes anything is doing it again in the next class.",
          speechSeconds: 25
        }
      ]
    },

    {
      id: 'hip-circles', title: 'Hip circles', durationSeconds: 116,
      beats: [
        {
          kind: 'movement',
          screen: 'Hip circles — standing, holding something. Slow, and small to start. Let them get bigger only if they want to.',
          voice: 'Stand and hold the back of a chair. One knee up, and draw a circle with it. Slowly.',
          speechSeconds: 20,
          exerciseId: 'hip-circles-standing',
          sitOut: true,
          seatedAlternativeId: 'seated-figure-4-stretch',
          stopCue: 'only as big as it wants to go'
        },
        {
          kind: 'movement',
          voice: "Start small. Let it get bigger only if it wants to — you're not opening anything, you're asking.",
          speechSeconds: 35
        },
        {
          kind: 'movement',
          voice: "Other side when you're ready.",
          speechSeconds: 35
        }
      ]
    },

    {
      id: 'figure-four', title: 'Figure four', durationSeconds: 154,
      beats: [
        {
          kind: 'movement',
          screen: "Figure four — on your back, or seated. Where it's a stretch, not where it's a fight.",
          voice: 'On your back, knees bent. Cross one ankle over the opposite knee, and reach through to pull the back leg towards you. Or do exactly the same sitting in a chair — cross the ankle over and lean forward a little.',
          speechSeconds: 25,
          exerciseId: 'seated-figure-4-stretch',
          sitOut: true,
          stopCue: "where it's a stretch, not a fight"
        },
        {
          kind: 'movement',
          voice: "Find where it's a stretch. Not where it's a fight. There's a version of this that's just gritting your teeth, and it doesn't do anything the gentle one doesn't.",
          speechSeconds: 45
        },
        { kind: 'movement', voice: 'Other side.', speechSeconds: 40 }
      ]
    },

    {
      id: 'whats-different', title: "What's different", durationSeconds: 70,
      note: 'A reflect beat doing the OPPOSITE job to Ground\u2019s. Ground asks "is anything different" and accepts no; this asks expecting yes, and declines to let it be the evidence.',
      beats: [
        {
          kind: 'reflect',
          screen: 'Anything looser? Probably. Remember what we said about that.',
          voice: 'Anything feel different? There probably is — this is the point in a hip class where things start to give a bit.',
          speechSeconds: 25
        },
        {
          kind: 'reflect',
          voice: "Enjoy it. Just don't file it as proof. It's this afternoon that has an opinion, not right now.",
          speechSeconds: 20
        }
      ]
    },

    {
      id: 'ninety-ninety', title: '90-90', durationSeconds: 172,
      beats: [
        {
          kind: 'movement',
          screen: '90-90 — both knees bent, both on the floor, sat between them. Or the seated version. Turn slowly.',
          voice: "Sit on the floor with both knees bent, one leg in front and one out to the side, both shins roughly at right angles. If that's not available, stay in the chair and turn your knees to one side.",
          speechSeconds: 30,
          exerciseId: 'hip-90-90-stretch',
          sitOut: true,
          seatedAlternativeId: 'seated-lumbar-rotation',
          stopCue: 'only a little'
        },
        {
          kind: 'movement',
          voice: 'Lean forward over the front leg a little. Only a little.',
          speechSeconds: 45
        },
        {
          kind: 'movement',
          voice: 'Come up, and swap sides. Going slowly through the swap is part of it — that transition is the bit your hips will complain about in about six years if nobody asks them to do it.',
          speechSeconds: 45
        }
      ]
    },

    {
      id: 'hip-flexor', title: 'Hip flexor', durationSeconds: 131,
      beats: [
        {
          kind: 'movement',
          screen: 'Hip flexor — half-kneeling, or standing at the chair. The front of the hip, not the back.',
          voice: 'Half-kneeling — one knee down, other foot in front. A cushion under the knee if that\u2019s kinder. Or stand and take one leg back behind you, holding the chair.',
          speechSeconds: 25,
          exerciseId: 'hip-flexor-stretch',
          sitOut: true,
          seatedAlternativeId: 'hip-flexor-progressive',
          stopCue: "where it's a stretch, not a fight"
        },
        {
          kind: 'movement',
          voice: "Tuck your hips underneath you slightly, and you should feel the front of the back leg's hip. That's the bit that spends all day shortened in a chair.",
          speechSeconds: 40
        },
        { kind: 'movement', voice: 'Other side.', speechSeconds: 30 }
      ]
    },

    {
      id: 'settling', title: 'Settling', durationSeconds: 135,
      beats: [
        {
          kind: 'rest',
          screen: 'Done. The next one is the one that counts.',
          voice: 'Lie down, or sit back. Nothing to do.',
          speechSeconds: 40
        },
        {
          kind: 'rest',
          voice: 'Five bits of hip, none of them heroic.',
          lighterVoice: 'Three bits of hip, none of them heroic.',
          speechSeconds: 40
        },
        {
          // 🔴 Second of the three places the class's case is carried.
          // See the header on why it is not a day of the week.
          kind: 'rest',
          voice: "And the thing from the start still stands. What you're feeling now is today's version. The next one is the one that counts.",
          speechSeconds: 30
        }
      ]
    },

    {
      id: 'leaving', title: 'Leaving', durationSeconds: 52,
      beats: [
        {
          kind: 'closing',
          screen: 'See you in the next class.',
          voice: "That's it. See you in the next class.",
          speechSeconds: 15
        }
      ]
    }
  ]
};
