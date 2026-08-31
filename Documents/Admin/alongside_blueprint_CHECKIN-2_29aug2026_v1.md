# CHECKIN-2 — Reportable Areas and Condition Lifecycle
## 29 Aug 2026 v1

Build New Habits | Alongside: Move | Build blueprint. Spec only. No code written.

**2a — add an area at check-in.** Safety gap. Build first.
**2b — condition resolution and the noticing ask.** Same schema, ships after.

---

## 1. The gap, stated plainly

The check-in sliders are the only input to `bodyCaution`. They render one per entry in `store.conditions`, which is set at onboarding.

**If an area is not in that list, it cannot be reported, and no caution ever fires for it.**

Confirmed against the data: `shoulder` exists as an `affectsAreas` value on exercises across the database, and there is no shoulder entry in `AREA_ALIASES` and no route to add one. A person whose shoulder flares up on a Tuesday can load it all week with a silent card.

That is the whole of 2a. Everything else here is 2b.

---

## 2. Discovery findings

### 2.1 Current shape

```
conditions:           []   // ids, set at onboarding
conditionPainScores:  {}   // id -> 0..10, set each check-in
```

`soreAreaLoaded(exercise)` filters `conditions` to those scoring ≥ 4, then matches through `AREA_ALIASES` against the exercise's `affectsAreas`. `bodyCaution` names the area when it matches, gives a general steer when something else is sore, and returns null otherwise.

### 2.2 The vocabulary is fixed and must be picked from, never typed

`AREA_ALIASES` (9 entries) maps condition ids to `affectsAreas` values. Unmapped ids fall through to `[id]`, so an id that exactly equals an `affectsAreas` value also matches.

The full `affectsAreas` vocabulary across the database:

`abdominals, achilles, adductors, ankle-foot, biceps-triceps, calves, cardiovascular, chest-pecs, core, full-body, glutes, hamstring, hip, hip-flexor, it-band, knee, lower-back, nervous-system, pelvic-floor, piriformis, quadriceps, rotator-cuff, sciatic-nerve, sciatica, shin-splints, shoulder, spine, thoracic, triceps-biceps, upper-back, wrist-elbow`

Plus acute contraindication variants: `lower-back-acute, shoulder-acute, upper-back-acute, chest-pecs-acute`.

**🔴 Free text is forbidden here.** An id that matches nothing produces a slider that works, saves, and silently never fires a caution — a control that looks like it did something and did not. The picker offers this vocabulary and nothing else.

### 2.3 🟠 Logged, not fixed — the namespace is mixed

`sciatica`, `it-band` and `shin-splints` are simultaneously `AREA_ALIASES` keys and `affectsAreas` values. So the namespace holds both body areas and named conditions. It works, because the fallback resolves both, but it means "condition" and "area" are one field doing two jobs. Out of scope. Recorded so the next person does not discover it the hard way.

### 2.4 Not every area belongs in the picker

`cardiovascular`, `nervous-system` and `full-body` are exercise tags, not places a person feels sore. `pelvic-floor` is a real reportable area but needs care in wording. The picker's list is a curated subset, defined in one place, and the gate asserts every entry resolves to at least one real `affectsAreas` value.

---

## 3. Schema — the change both parts sit on

Schema-first applies. `store.js` and `Schema.md` before any code.

`conditions` stops being an array of ids and becomes an array of records:

```js
conditions: [
  {
    id:          "shoulder",       // must resolve via AREA_ALIASES or affectsAreas
    addedAt:     "2026-08-29",
    source:      "onboarding" | "checkin",
    status:      "active" | "dormant",
    dormantAt:   null,             // ISO date when retired, else null
    lastSoreAt:  "2026-08-29",     // last date reported >= 4
    reportDays:  0,                // days POSITIVELY reported since addedAt
    quietRun:    0,                // consecutive POSITIVE low reports (see 5.2)
    asks:        0                 // resolution asks made, max 2
  }
]
```

`conditionPainScores` is unchanged.

### 3.1 Migration

Existing `conditions` are plain strings. On load, any string entry becomes:

`{ id, addedAt: null, source: "onboarding", status: "active", dormantAt: null, lastSoreAt: null, reportDays: 0, quietRun: 0, asks: 0 }`

`addedAt: null` means unknown, not today. **A null start date must never make a condition eligible for resolution** — see 5.3. Migration is idempotent; running it twice changes nothing.

### 3.2 Dormant, never deleted

Retiring a condition sets `status: "dormant"`. The record stays. It leaves the check-in sliders and leaves `soreAreaLoaded`, and it reactivates automatically the moment that area is reported sore again — no re-declaration, no lost history.

**🔴 Reactivation must be automatic.** A dormant condition leaving `bodyCaution` is a safety surface narrowing. The only acceptable way to narrow it is one that reverses itself without the person having to know it happened.

---

## 4. CHECKIN-2a — adding an area

### 4.1 Behaviour

An "Add an area" control at the foot of the slider sheet. Opens a picker of the curated vocabulary, excluding areas already active. Selecting one appends a record with `source: "checkin"`, `status: "active"`, `addedAt` today, and renders a slider immediately at 0.

It appears on the same sheet as the sliders, not behind a settings screen. The moment a person needs it is the moment they are already reporting.

### 4.2 Wording

The control says what it does and makes no claim: **"Something else sore today?"** Not "add a condition" — that word asks somebody to diagnose themselves before they can use a slider.

### 4.3 Accessibility

Picker is a real listbox or a set of radio-style buttons, not a `<select>` styled into something else. 44×44 targets. Focus moves to the new slider on add, and the addition is announced. The control is reachable by keyboard and screen reader and is not gated behind a gesture.

---

## 5. CHECKIN-2b — resolution and the ask

### 5.1 🔴 Silence is never "no pain"

The single most important rule in this document.

A missed check-in, a skipped sheet, or an untouched slider **must never count toward resolution**. Somebody too unwell to open the app for a fortnight must not be met with "shall we take that off your list?" — the failure mode is the app treating absence as recovery, which is exactly backwards and would be the cruellest bug in the product.

`quietRun` increments **only** on a day where the sheet was submitted and that slider was positively at or below the quiet threshold. Any missed day resets `quietRun` to 0. Not pauses. Resets.

This gets its own gate assertion and its own reversal test.

### 5.2 Thresholds

| Name | Value | Note |
|---|---|---|
| Sore | ≥ 4 | Existing, unchanged |
| Quiet | ≤ 1 | Deliberately not "< 4". A 3 is not nothing |
| `quietRun` for first ask | 14 positive days | |
| `reportDays` minimum | 20 | Not enough history, no ask |
| Gap before second ask | 30 further positive quiet days | |
| Max asks | 2, ever | Then never again unless it goes sore and resolves afresh |

Numbers are a starting position, not evidence. Revisit after beta.

### 5.3 Eligibility — behaviour, not diagnosis

**🔴 No clinical taxonomy. This is a deliberate refusal, not an omission.**

A static list saying sprains are episodic and arthritis is persistent would be wrong for individuals constantly — one person's sprained ankle is five years of instability, one person's back pain cleared in a fortnight — and it would place an unreviewed clinical classification inside a safety-adjacent feature with no clinician between it and the user.

Eligibility is derived from the person's own reporting pattern:

- `reportDays < 20` → **not eligible.** Not enough is known.
- `addedAt === null` → **not eligible.** Migrated record, unknown history.
- Has gone sore → quiet → sore again at any point → **not eligible, permanently.** It behaves as recurrent. Never ask.
- Sore days span more than 90 days from first to last → **not eligible.** It behaves as persistent.
- Otherwise, and `quietRun` met → **eligible.**

No clinical claim anywhere. It is the person's own data describing itself, which is P4-clean, and it self-corrects: a "sprain" that turns out to be chronic simply never becomes eligible, and nobody had to guess.

**Default when uncertain is always: do not ask.** Silence costs nothing. A wrong ask costs trust once and permanently.

### 5.4 🔴 Never-ask list — DRAFT, for the health-professional reviewer

A small set where the ask would be hurtful regardless of a quiet spell, because these are not things that resolve. A quiet fortnight with hypermobility is a good fortnight, not recovery, and "shall we remove this?" reads as the app doubting them.

**Draft only. This goes to the health-professional reviewer with the clinical pack. It is not shipped on my judgement.**

Candidates: hypermobility and EDS, arthritis of any type, fibromyalgia, MS and other progressive neurological conditions, long-term post-surgical limitation, chronic pain conditions of over a year.

Note this list is currently unreachable — none of these ids exist in the vocabulary today. It is written now so that whenever condition types are added, the never-ask path already exists rather than being retrofitted.

Fails safe: anything not on the list still has to earn eligibility through 5.3.

### 5.5 🔴 The wording is the whole feature

The coach must never say a condition is better, healed, improved or resolved. Those are clinical claims. It reports only what the person entered, and asks about **the list**, not **the body**:

> "You haven't reported anything in your shoulder for three weeks. Want to take it off your check-in list? It comes straight back if it flares up."

Forbidden, and each must fail a gate:
- Any form of *better*, *healed*, *recovered*, *improved*, *resolved*, *fixed*, *cleared up*
- Any second-person claim about the body rather than the record
- Congratulation of any kind. This is not an achievement and treating it as one makes a bad week feel like backsliding
- Any count of days shown to the person (P4 — the same rule as CARD-1)

Buttons: **"Take it off the list"** and **"Keep it there"**. A no is accepted immediately, with no follow-up question and no reason asked.

### 5.6 Where the ask appears

The Noticing surface, not the check-in sheet. Mid-check-in a person is reporting how they are; interrupting that to ask an admin question about a list is the wrong moment. It also must never appear on a timer or during a session.

---

## 6. Gates — `tools/verify-checkin2.mjs`

Every assertion needs a reversal proven to fail before it counts.

| # | Assertion | Reversal |
|---|---|---|
| 1 | Every picker entry resolves to ≥ 1 real `affectsAreas` value | Add a bogus id → must fail |
| 2 | A picked area produces a caution on an exercise loading it | Fixture: add `shoulder`, score 5, shoulder exercise → caution names it |
| 3 | A missed day resets `quietRun` to 0 | Fixture with a gap → run must be 0, not carried |
| 4 | A skipped slider on a submitted sheet does not increment `quietRun` | Submit with that slider untouched → no increment |
| 5 | `reportDays < 20` is never eligible | Fixture: `quietRun` 99, `reportDays` 5 → not eligible |
| 6 | `addedAt === null` is never eligible | Migrated fixture → not eligible |
| 7 | Sore → quiet → sore is never eligible again | Fixture with recurrence → not eligible |
| 8 | A dormant condition reactivates on a sore report | Fixture: dormant, report 5 → active, caution fires |
| 9 | No forbidden word reaches ask copy | Inject "recovered" → must fail |
| 10 | No day count reaches rendered output (P4) | Interpolate `quietRun` → must fail |
| 11 | Max 2 asks ever | Fixture `asks: 2` → not eligible |
| 12 | Migration is idempotent | Run twice → identical output |

**Fixture fault check on every one:** does the fixture actually reach the branch it claims to test? Assertion 4 in particular must distinguish "submitted and skipped" from "not submitted".

No negative distance windows anywhere.

---

## 7. Files — touch-once, confirm every version against a fresh clone

| File | Action | Part |
|---|---|---|
| `js/store.js` | Condition records, migration | 2a |
| `Schema.md` | Document the shape | 2a |
| `js/data/session-rationale.js` | `soreAreaLoaded` reads records, skips dormant | 2a |
| Check-in slider view | "Something else sore today?" + picker | 2a |
| Picker vocabulary — one place, new or existing constants file | Curated list | 2a |
| CSS | Picker | 2a |
| `tools/verify-checkin2.mjs` | Gate | both |
| Run tracking — wherever check-in submit is handled | `quietRun`, `reportDays`, `lastSoreAt` | 2b |
| Noticing surface | The ask | 2b |
| `sw.js` | **Last, alone, own commit, cache bump** | each |

`sw.js` bumps once for 2a and again for 2b. Two deployments, not one.

---

## 8. Build order

**2a:** `store.js` + `Schema.md` → migration proven idempotent → `session-rationale.js` → picker vocabulary → check-in view → CSS → gate assertions 1, 2, 6, 8, 12 with reversals → full suite (`npm install jsdom` first) → `sw.js`.

**2b:** run tracking → eligibility → ask copy → Noticing surface → gate assertions 3, 4, 5, 7, 9, 10, 11 with reversals → full suite → `sw.js`.

---

## 9. Open for Graeme

1. **Quiet threshold ≤ 1 and 14 days.** Starting position. Ship and revisit after beta rather than agonising.
2. ~~Does `pelvic-floor` go in the picker?~~ **DECIDED 29 Aug: yes**, with the same neutral wording as every other entry.
3. **Never-ask list goes to the health-professional reviewer** with the clinical pack. Not shipped on my judgement.

---

## 10. Not in scope

- The mixed area/condition namespace (§2.3). Logged.
- TIME-1 and CARD-2. Separate rows.

---

*Build New Habits · Alongside: Move · CHECKIN-2 Blueprint · 29 Aug 2026 v1*
