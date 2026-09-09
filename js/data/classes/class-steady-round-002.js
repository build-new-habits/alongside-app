/**
 * data/classes/class-steady-round-002.js
 *
 * 08 Sep 2026 v1
 *
 * CLASS-1. Class 002, "Steady Round", as data.
 *
 * Transcribed from
 * Documents/Admin/alongside_class_002_steady_round_06sep2026_v1.md,
 * which stays the authored source. Where the two disagree the document
 * is right and this file is wrong.
 *
 * Written as a circuit specifically to strain the contract Class 001
 * proposed, and it is the class that found three of its fields.
 *
 * 🔴 THE HOLD. The plank's 35 seconds is a `holdSeconds` and MUST NEVER
 * SCALE with a pacing choice. At 1.5x it becomes 23 seconds, which is a
 * harder exercise nobody asked for; at 0.5x it becomes 70, which is the
 * opposite of what somebody choosing "slower" was asking for. Every
 * other pause in this class is a `speechSeconds` and scales freely.
 * This is the one class where the two are not the same thing, and it is
 * why they are two fields.
 *
 * 🔴 EVERY MOVEMENT ENDS ON A STATED SIGNAL, AND NEVER ON FAILURE.
 * Smoothness. Your back leaves the floor. Before it gets ugly. While
 * your back stays long. "When you can't do any more" is the default in
 * this entire format and it makes the end of a set a failure event.
 * The contract rejects that phrasing outright.
 *
 * 🔴 THE EXIT IS OFFERED IN THE MIDDLE, OUT LOUD. In every other circuit
 * format, leaving after one round is quitting. Here it is a named,
 * ordinary way to finish, said by the coach before anybody has to invent
 * it for themselves: "I'd rather you did one round for six weeks than
 * two rounds once." That line must survive any edit.
 *
 * ⚫ ROUND TWO IS QUIETER ON PURPOSE. Repeating the full coaching would
 * say the person had not learned it; naming the movement and going quiet
 * says they had.
 */

export const CLASS_STEADY_ROUND_002 = {
  id:            'class-steady-round-002',
  title:         'Steady Round',

  serves:        'trunk-strength',
  touches:       ['back-resilience', 'showing-up'],

  formats:       ['circuit'],
  intensityBias: 'gentle',
  durationMins:  19,
  position:      'floor',
  seatedRoute:   false,
  equipment:     [],
  flags:         ['floor-transfer', 'repeated-up-and-down', 'holding-positions'],

  // Rounds repeat SECTIONS, by id. Class 002's round two is the same
  // five movements in the same order, cued by name only.
  rounds:     2,
  roundRange: ['glute-bridge', 'dead-bug', 'bird-dog', 'plank', 'hip-hinge'],

  sections: [
    {
      id: 'before', title: 'Before we start', durationSeconds: 90,
      beats: [
        {
          kind: 'arriving',
          screen: 'Five movements, twice through. No clock. Sitting one out still counts as doing the round.',
          voice: 'This is a circuit, so it repeats — five movements, and then the same five again. Knowing what\u2019s coming is most of the point.',
          speechSeconds: 8
        },
        {
          kind: 'arriving',
          voice: "There's no timer on screen and I'm not counting reps at you. You'll move for a bit, then stop for a bit.",
          speechSeconds: 10
        },
        {
          // "Structurally, not kindly" is the point of the line. There is
          // nothing keeping score, and saying so plainly is different
          // from reassuring somebody.
          kind: 'arriving',
          voice: "If you sit one out, the round still counts. I mean that structurally, not kindly — there's nothing keeping score.",
          speechSeconds: 12
        }
      ]
    },

    {
      id: 'glute-bridge', title: 'Glute Bridge', durationSeconds: 120,
      beats: [
        {
          kind: 'movement',
          screen: 'Glute Bridge — on your back, knees bent. Lift, hold a moment, lower. Stop when it stops feeling smooth.',
          voice: 'On your back, knees bent, feet flat. Push through your heels and let your hips come up. Hold it a second at the top. Down slowly.',
          speechSeconds: 20,
          exerciseId: 'glute-bridge',
          sitOut: true,
          stopCue: 'when it stops feeling smooth'
        },
        { kind: 'movement', voice: "Again, in your own rhythm. I'm not counting.", speechSeconds: 40 },
        {
          kind: 'movement',
          voice: 'Stop when it stops feeling smooth. Not when it starts feeling hard — when it stops feeling smooth. Those are different, and the first one is the useful signal.',
          speechSeconds: 25
        }
      ]
    },

    {
      id: 'dead-bug', title: 'Dead Bug', durationSeconds: 120,
      beats: [
        {
          kind: 'movement',
          screen: "Dead Bug — opposite arm and leg, slowly. If your back lifts off the floor, you've gone far enough.",
          voice: 'Stay on your back. Arms up towards the ceiling, knees bent above your hips.',
          speechSeconds: 12,
          exerciseId: 'dead-bug',
          sitOut: true,
          stopCue: 'your lower back leaves the floor'
        },
        { kind: 'movement', voice: 'Lower one arm behind you and the opposite leg away. Slowly. Then back.', speechSeconds: 30 },
        {
          kind: 'movement',
          voice: "Here's your limit, and it's a real one: if your lower back lifts away from the floor, that's the end of the range. Come back a bit. That's not caution, that's where the work is.",
          speechSeconds: 40
        }
      ]
    },

    {
      id: 'bird-dog', title: 'Bird Dog', durationSeconds: 120,
      beats: [
        {
          kind: 'movement',
          screen: 'Bird Dog — hands and knees. Opposite arm and leg. Slow beats far.',
          voice: 'Onto your hands and knees. Reach one arm forward and the opposite leg back.',
          speechSeconds: 20,
          exerciseId: 'bird-dog',
          sitOut: true,
          stopCue: 'slow beats far — stop when the slowness goes'
        },
        {
          kind: 'movement',
          voice: "You're trying not to tip. That's the whole exercise — the reaching is just what makes it hard not to.",
          speechSeconds: 30
        },
        { kind: 'movement', voice: 'Slow beats far. Every time.', speechSeconds: 40 }
      ]
    },

    {
      id: 'plank', title: 'Plank', durationSeconds: 90,
      beats: [
        {
          // easierRouteId, NOT seatedAlternativeId. Knees-down plank is
          // not a seated plank -- it is the same movement, less of it.
          // Collapsing the two fields would make "can't get to the floor"
          // and "can't hold it long" the same problem.
          kind: 'movement',
          screen: 'Plank — forearms, or hands, or on your knees. Come down before it gets ugly, not after.',
          voice: 'Down onto your forearms. Knees on the floor is a real version of this, not a lesser one.',
          speechSeconds: 15,
          exerciseId: 'plank',
          sitOut: true,
          easierRouteId: 'plank',
          stopCue: 'before it gets ugly, not after'
        },
        {
          // 🔴 holdSeconds. Never scaled. See the header.
          kind: 'movement',
          voice: "Hold it while it's good. Come down before it gets ugly, not after — the shaking-and-sagging bit isn't extra credit, it's just the exercise stopping and you carrying on.",
          holdSeconds: 35
        },
        { kind: 'movement', voice: "Down when you're ready.", speechSeconds: 15 }
      ]
    },

    {
      id: 'hip-hinge', title: 'Hip Hinge', durationSeconds: 120,
      note: 'Placed fifth deliberately — one transition, at a point where getting up is a rest rather than a demand.',
      beats: [
        {
          kind: 'movement',
          screen: 'Hip Hinge — standing. Push your hips back, chest towards the floor. Only as far as your back stays long.',
          voice: 'Stand up — take your time getting there.',
          speechSeconds: 15,
          exerciseId: 'hip-hinge-drill',
          sitOut: true,
          stopCue: 'while your back stays long'
        },
        {
          kind: 'movement',
          voice: 'Feet about hip width. Push your hips backwards and let your chest come towards the floor. Your back stays long the whole way.',
          speechSeconds: 30
        },
        {
          kind: 'movement',
          voice: "The moment your back starts to round, that's your range for today. It moves about. That's normal.",
          speechSeconds: 40
        }
      ]
    },

    {
      id: 'the-stop', title: 'The stop', durationSeconds: 120,
      note: 'The exit is offered here, out loud, before anybody has to invent it.',
      beats: [
        {
          kind: 'rest',
          screen: "That's one round. Sit down for a couple of minutes. Round two is the same five.",
          voice: "That's the five. Sit down, or lie down.",
          speechSeconds: 20
        },
        {
          kind: 'rest',
          voice: 'Round two is exactly the same. Nothing gets harder and there\u2019s no target.',
          speechSeconds: 40
        },
        {
          // 🔴 Must survive any edit. In every other circuit format,
          // leaving after one round is quitting.
          kind: 'rest',
          voice: "If one round is what today had in it, stop here and that's a whole session. I'd rather you did one round for six weeks than two rounds once.",
          speechSeconds: 40
        }
      ]
    },

    {
      id: 'round-two', title: 'Round two', durationSeconds: 300,
      note: 'Quieter on purpose. Repeating the full coaching would say the person had not learned it.',
      beats: [
        {
          kind: 'arriving',
          screen: 'Same five, same order. Glute Bridge · Dead Bug · Bird Dog · Plank · Hip Hinge',
          voice: "Same five, same order. I'll say less this time — you know what they are now."
        }
      ]
    },

    {
      id: 'leaving', title: 'Leaving', durationSeconds: 60,
      beats: [
        {
          kind: 'closing',
          screen: 'Done. Take your time getting up.',
          voice: "That's it. Two rounds, or one — either way you did the session.",
          speechSeconds: 10
        },
        {
          kind: 'closing',
          voice: "Trunk work is boring and it works anyway. That's most of what there is to say about it.",
          speechSeconds: 8
        },
        { kind: 'closing', voice: 'See you next time.' }
      ]
    }
  ]
};
