# Exercise Entry Standard

**11 Aug 2026 v2**

Build New Habits · Alongside: Move · Live State

Canonical definition of what a single exercise entry in
`js/data/exercises/*.js` must contain. Every entry authored, ported or
revised from this date forward is written to this standard.

This is a **content** standard. It defines fields on static exercise
objects, not fields in `store.js`. `Schema.md` remains the authority for
stored user data and cross-references this document.

---

## Why this exists

An audit on 11 Aug 2026 found the product had no consistent entry shape.
The main database carried `instructions`, `why`, `coaching` and `youtube` at
100%. Four separate private pools carried `description` and `cues`, or
`guide { description, cues, youtube }` plus `coachNote`, or neither. The
exercise card renders three specific fields, so entries authored to a
different shape rendered blank — a person was shown an exercise name, a set
count and nothing else.

Separately, no entry anywhere in the product told anyone what to watch out
for. Zero of 461, zero across all four private pools. The field had never
existed.

The standard below closes both gaps and fixes the shape so this cannot
recur silently.

---

## The person this is written for

Someone who has decided to move, is standing in front of the equipment, and
does not know what to do. They may never have used a cable machine. They may
be worried about looking foolish. They may be in pain, tired, or returning
after a long absence.

Everything below follows from that. The entry is not a reference work — it is
the thing a good coach would say, standing next to them, in the order they
need to hear it.

---

## Field reference

### Required on every entry

| Field | Type | Purpose |
|---|---|---|
| `id` | `string` | Stable unique id. Never reused, never renumbered. |
| `name` | `string` | What it is called. Sentence case. |
| `category` | `string` | Discipline grouping, matching the file it lives in. |
| `instructions` | `string[]` | How to set it up and perform it. |
| `why` | `string` | Why this exercise, for this person, now. |
| `coaching` | `string` | The one thing that makes the difference. |
| `watchOut` | `string[]` | **NEW.** The failure modes and their correction. |
| `youtube` | `string` | Search term, not a URL. |
| `equipment` | `string[]` | Coarse capability tags. `[]` for bodyweight. |
| `contraindications` | `string[]` | Conditions that exclude this exercise. |
| `energyRequired` | `number` | 1–10. Daily gate. |
| `difficultyLevel` | `number` | 1–10. Structural ceiling. |

### Required where the exercise is loaded

| Field | Type | Purpose |
|---|---|---|
| `load` | `string` | **NEW.** Effort-relative weight guidance. Never kilos. |
| `sets` | `number` | |
| `reps` | `string` | String, because "12" and "10 each side" both occur. |
| `rest` | `string` or `number` | |
| `tempo` | `string` | Optional. Where control is the point. |

### Optional

`perSide`, `duration`, `holdSeconds`, `credits`, `affectsAreas`, `caution`,
`equipmentOptional`, `rehabPhase`, `activationTarget`, `movementPattern`.

### `contentType` — deliberately not required

Present on 368 of 461 entries and **read by nothing** anywhere in the
codebase. `category` is what the engines actually select on. Requiring
`contentType` would mean authoring a dead field onto 93 entries, so the
standard does not ask for it. Logged as an open finding — retire it or wire
it up, as a separate decision. Same writer-without-reader pattern already on
record for `proposalBias`.

### Retired

`description` and `cues` are **not** part of the standard. They exist on 23
main-database entries and across the private pools, and are folded into
`instructions` and `coaching` during porting rather than carried forward. No
renderer reads them.

---

## `instructions` — how to set up and perform

An ordered list. The person follows it top to bottom and ends up doing the
exercise correctly.

- 3–6 steps. Fewer than 3 usually means something was assumed; more than 6
  usually means two exercises.
- Second person, imperative, present tense.
- Position before movement: where the body goes, then what it does.
- Name the equipment setting where it matters — bench angle, cable height,
  band anchor point. This is the step a confident person skips and an
  unconfident person needs.
- No jargon without an inline gloss. "Hinge at the hips — push your backside
  back, not down."

**Good:**
```
"Set the cable at chest height and stand between the two towers",
"Take one handle in each hand, palms facing down",
"Step one foot forward so you are stable and leaning very slightly in",
"Press both hands forward until your arms are almost straight",
"Return slowly, letting your hands come back to chest width"
```

**Not this:** a single paragraph, or steps that assume the reader already
knows where to stand.

---

## `why` — why this exercise

One or two sentences. What it does for the person, in their terms, not in
anatomical terms alone.

- Lead with the effect they will notice, not the muscle recruited.
- Anatomy is allowed once it has been earned by a plain-language reason.
- No superlatives. Nothing is "the best" or "essential".

**Good:** "Pressing from a cable keeps tension on the chest through the whole
range, and the standing position means your core is working the entire time
without you having to think about it."

**Not this:** "Targets the pectoralis major and anterior deltoid."

---

## `coaching` — the one thing

A single sentence. The detail that separates doing it and doing it well.

- One idea. If there are three, two of them belong in `instructions` or
  `watchOut`.
- Written as a coach speaks, not as a manual reads.
- Nurturing voice throughout — the permanent and only coach voice.

**Good:** "The slow return is where the work actually happens — most people
rush it, and it's the half of the movement that builds the strength."

---

## `watchOut` — the failure modes

**New field.** An array of 2–4 short items. Each names a specific thing that
goes wrong and what to do instead.

### Rules

1. **Name the error, then the correction.** Never the error alone. "Your
   lower back arches as you press — brace your stomach before each rep and
   the arch goes."
2. **Describe what it feels like, not just what it looks like.** The person
   cannot see themselves. "If you feel this in your neck rather than your
   shoulders, the weight is too heavy."
3. **No fear language.** No "dangerous", "never", "you will injure
   yourself", no warnings in capitals. The tone is a coach noticing
   something, not a liability notice.
4. **No shame.** Not "beginners always get this wrong". The error is
   ordinary and the correction is easy.
5. **Pain is always a stop, and says so plainly.** Where a movement can
   produce joint pain, one item says to stop and what to do — this is the
   one place directness outweighs encouragement.

### Worked example — Romanian deadlift

```javascript
watchOut: [
  "Your back rounding as you lower — stop the movement where your back is still flat, even if that is only halfway down",
  "Feeling this in your lower back rather than the back of your thighs, which usually means the hips are not moving back far enough",
  "Bending the knees to reach lower — the knees stay softly bent and still throughout",
  "Any sharp pain in the back, at any point: put the weight down and leave this one for today"
]
```

### What it is not

Not a contraindication list — that is `contraindications`, which is
structural and machine-read. `watchOut` is human-read, in the moment, by
someone mid-set.

---

## `load` — effort, never kilos

**New field.** Required on any exercise where a weight is chosen.

### The rule

**Prescribe effort, never an absolute number.**

### Why, in full

Three reasons, all of which have to hold.

**Safety.** We do not know the person's strength, training history, injury
history or what a given lift means for their body on this particular day. A
number we cannot justify is a number that can hurt somebody.

**Truth across users.** "Heavy enough that the last two reps are hard" is
correct for a first-week beginner and for someone returning to lifting after
five years. "20kg" is correct for neither reliably and for one of them
dangerously.

**Locked Principle P4.** The coach may display load but never interprets it.
An absolute target is an interpretation — it is a benchmark with a verdict
attached. A person lifting less than the prescribed number has been told they
fell short, by a system that has no idea what their week was like. Effort
language has no ceiling to fall below.

There is also a practical consequence: effort prescription means no
per-person load tables, which is the difference between a content job that
can be finished and one that cannot.

### Standard phrasings

Use these rather than inventing new ones each time, so the language stays
consistent across hundreds of entries.

| Intent | Phrasing |
|---|---|
| Technique-first | "Light enough that you could do several more reps — this one is about the movement, not the weight." |
| Working set | "Heavy enough that the last two reps are hard, light enough that your form does not change." |
| Strength emphasis | "Challenging by the final rep, but you should never be straining or holding your breath." |
| Endurance | "Light. You should reach the end of the set tired rather than close to failing." |
| Isolation / small muscles | "Lighter than you think. These respond to control, not weight." |
| First time | "Start with the lightest option available and add next time. Finding the right weight takes two or three sessions and that is normal." |

Where the granular equipment a person ticked is known —
`dumbbells-light` versus `dumbbells-heavy` — that information exists in
`equipment-map.js` for future refinement. It is not used to generate a number
now, and doing so would breach the rule above.

---

## `youtube` — a search term

A search phrase, not a URL. Reason: URLs rot, videos are taken down, and a
search phrase reaches whatever good demonstration currently exists.

Format: exercise name plus a qualifier — `"cable chest press standing
technique"`. Avoid a named creator, which dates and implies endorsement.

---

## No time-stamped horizons

**Never attach a number of years to a benefit.**

Write "in years to come", "later on", "further down the line". Never "in ten years' time", "by the time you're eighty", "within five years".

The reason is not stylistic. A specific horizon invites the person to do the arithmetic on their own decline — it hands somebody a countdown and calls it encouragement. "This keeps you getting out of a chair unaided in years to come" is a reason to do the exercise. "...in ten years' time" is a date to dread, and it will be read by someone who may already be quietly frightened about exactly that.

This applies to `why`, `coaching`, `load`, `watchOut`, coach lines, and any programme rationale.

| Write | Not |
|---|---|
| in years to come | in ten years' time |
| later on | by the time you're seventy |
| further down the line | within five years |
| keeps this available to you | stops you losing this by sixty |

---

## Voice and accessibility

Applies to every text field.

- **Nurturing voice only.** Permanent, no alternatives, no picker.
- Second person, present tense, active voice.
- Plain language. Where a technical term is genuinely the clearest word, it
  is glossed inline the first time.
- Sentences short enough to read mid-set, while breathing hard.
- No streak, comparison, shame or urgency language of any kind.
- No reliance on colour, position or formatting to carry meaning — every
  entry must read correctly as plain text through a screen reader, since
  that is exactly how it will be read.
- WCAG 2.2 AA applies to the rendered card; entries must not require styling
  to be comprehensible.

---

## Complete worked entry

```javascript
{
  id: "gym-cable-chest-press",
  name: "Cable chest press",
  category: "gym",
  contentType: "strength",
  equipment: ["gym-membership"],
  contraindications: ["shoulder-acute", "chest-acute"],
  energyRequired: 4,
  difficultyLevel: 3,
  sets: 3,
  reps: "12",
  rest: "45s",
  tempo: "2-1-3",
  load: "Heavy enough that the last two reps are hard, light enough that your form does not change.",
  instructions: [
    "Set both cables to chest height and stand between the two towers",
    "Take one handle in each hand, palms facing down",
    "Step one foot forward so you feel stable, leaning very slightly forward",
    "Press both hands forward until your arms are almost straight, without locking your elbows",
    "Return slowly over three counts, letting your hands come back to chest width"
  ],
  why: "Pressing from a cable keeps tension on the chest through the whole range, and standing to do it means your core is working the entire time without you having to think about it.",
  coaching: "The slow return is where the work actually happens — most people rush it, and it is the half of the movement that builds the strength.",
  watchOut: [
    "Your shoulders creeping up towards your ears — set them down and back before each set",
    "Letting the weight pull your arms back fast at the end of the rep, which loses most of the benefit",
    "Feeling this at the front of the shoulder rather than across the chest, which usually means the cables are set too high",
    "Any pinching in the shoulder joint: stop, lower the weight, and try a narrower press"
  ],
  youtube: "cable chest press standing technique"
}
```

---

## Validation

`Documents/Admin/Templates/validate-exercise-entries.mjs` checks every entry
in the database against this standard and reports what is missing, by file.

It is a build-time audit, not runtime code, and is not loaded by the app. Run
it after any authoring session and before any deploy that touches exercise
content.

Current baseline at time of writing: 461 entries, all carrying
`instructions`, `why`, `coaching` and `youtube`; none carrying `watchOut`;
none carrying `load`. CON-9 backfills, equipment-requiring exercises first,
since that is where absence of a warning carries real physical risk.

---

*Build New Habits · Alongside: Move · Exercise Entry Standard · 11 Aug 2026 v1*
