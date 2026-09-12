# Alongside: Move — Contraindication Audit
## 12 Sep 2026 v1

Build New Habits | Where the exercise library disagrees with itself about who is safe to meet what. **A report for a clinical reviewer. No data has been changed.**

Read against `alongside-v496`, 560 exercise entries, 142 gates. Produced by `Documents/Admin/Templates/audit-contraindications.mjs` plus three pairs found by hand.

---

## 1. The question, in one paragraph

Every exercise entry lists the conditions it is excluded for. The app removes an exercise from selection when somebody has declared one of those conditions acutely. Where the same movement exists at two difficulties — a chair-supported version and a standing one, say — you would expect the gentler entry to be allowed at least everywhere the harder one is. **In seventeen places it is the other way round.** Somebody with an acutely sore hip is offered the standing hip abduction and refused the seated, side-lying and chair-supported versions of the same movement.

**Which side is right is a clinical judgement, not a technical one.** For each pair below, either the gentler entry is too strict or the harder one is too loose. This document does not decide; it shows the pairs and asks.

---

## 2. Why it matters now, and why it is not urgent

**Not urgent:** nothing is broken for a user today. Each entry is filtered on its own, so nobody is given something they declared they cannot do. The consequence is narrower — on a bad day the app withholds the easier option and keeps the harder one, which is the opposite of what it should do, but it withholds rather than exposes.

**It matters because the fix direction is asymmetric.** If the reviewer decides the gentler entries are correct and the harder ones are too loose, then those harder entries are being offered to people who should not be seeing them today. That is the direction worth checking first.

---

## 3. Method, and its limits

Entries were grouped by movement pattern plus a stripped name stem (so "Chair-Supported Calf Raise" and "Single-Leg Calf Raise" both reduce to "calf raise"). Within each group, every pair where the lower-difficulty entry excludes something the higher-difficulty entry allows is reported.

**Three limits, stated plainly:**

1. **Grouping is a heuristic.** Some pairs below are not really the same movement. Each needs reading.
2. **It misses families whose names differ.** Three known cases are in section 5, found by hand during the exercise-versions work.
3. **Difficulty level is the only ordering available.** Two entries at the same difficulty are not compared at all, so the list is a floor, not a ceiling.

---

## 4. The fourteen pairs the audit found

| # | Movement | Gentler entry | Harder entry | Excluded on the gentler, allowed on the harder |
|---|---|---|---|---|
| 1 | Calf raise | `chair-supported-calf-raise` (d1) | `single-leg-calf-raise` (d3) | `ankle-foot-acute` |
| 2 | Chest press | `seated-band-chest-press` (d1) | `band-chest-press` (d2) | `chest-pecs-acute` |
| 3 | Deadlift | `kettlebell-deadlift` (d2) | `single-leg-deadlift-rehab` (d3) | `glutes-acute` |
| 4 | Deadlift | `dumbbell-single-leg-deadlift` (d2) | `barbell-deadlift` (d3) | `ankle-foot-acute` |
| 5 | Deadlift | `dumbbell-single-leg-deadlift` (d2) | `single-leg-deadlift-rehab` (d3) | `ankle-foot-acute`, `glutes-acute` |
| 6 | Hamstring curl | `prone-hamstring-curl` (d1) | `standing-hamstring-curl-band` (d2) | `lower-back-acute` |
| 7 | Hamstring curl | `prone-hamstring-curl` (d1) | `seated-hamstring-curl-band` (d2) | `lower-back-acute` |
| 8 | Hip abduction | `side-lying-hip-abduction` (d1) | `standing-hip-abduction` (d2) | `hip-acute` |
| 9 | Hip abduction | `seated-hip-abduction-band` (d1) | `standing-hip-abduction` (d2) | `hip-acute` |
| 10 | Hip abduction | `chair-supported-hip-abduction` (d1) | `standing-hip-abduction` (d2) | `hip-acute` |
| 11 | Hip hinge | `hip-hinge-drill` (d1) | `seated-hip-hinge` (d2) | `hamstring-acute`, `glutes-acute` |
| 12 | Overhead press | `seated-overhead-band-press` (d2) | `barbell-overhead-press` (d3) | `lower-back-acute` |
| 13 | Pallof press | `band-pallof-press` (d2) | `gym-cable-pallof-press` (d3) | `glutes-acute` |
| 14 | Press | `seated-wall-press` (d2) | `gym-incline-dumbbell-press` (d4) | `wrist-elbow-acute` |

### The three that look most clearly wrong

- **Hip abduction (8, 9, 10).** Three separate gentler versions all exclude `hip-acute`; the standing version, which loads the hip most, allows it. One of the four is wrong and the pattern says it is the standing one.
- **Overhead press (12).** A barbell overhead press is one of the more demanding things in the library for a lower back, and it allows `lower-back-acute` while the seated band version does not.
- **Hamstring curl (6, 7).** Lying face down excludes an acute lower back; standing and seated do not. Lying prone does extend the spine, so this one may be right as written — worth a specific answer either way.

### A pattern worth naming

In most of these pairs the stricter entry is a **rehabilitation** entry and the looser one is a **strength** entry. The two libraries were written at different times to different standards. That is a plausible explanation and not a justification: the person meeting them does not know which file an exercise came from.

---

## 5. Three the audit misses

Found by hand while mapping exercise families. The name stems differ, so the heuristic cannot group them.

| Movement | Gentler entry | Harder entry | Excluded on the gentler, allowed on the harder |
|---|---|---|---|
| Hinge | `hip-hinge-drill` (d1, no load, broom handle) | `romanian-deadlift-rehab` (d2) | `glutes-acute` — and the RDL lists it only as a caution |
| Dead bug | `dead-bug-progression-1` (d2, arms only) | `dead-bug` (d2) | `lower-back-acute` — `dead-bug` has **no contraindications at all** |
| Side plank | `side-plank-modified` (d3, from the knee) | `side-plank-full` (d3, from the feet) | `abdominals-acute`, `glutes-acute`, `wrist-elbow-acute` |

**The dead bug pair is the one to look at first.** `dead-bug` carries an empty contraindication list, which means it is offered to everybody, including somebody with an acutely sore lower back — while the arms-only version written for exactly that person is withheld.

---

## 6. Two probable duplicates

Not contraindication faults. Found on the way.

### `90-90-hip-stretch` and `hip-90-90-stretch`

The same stretch under two ids, written twice. Both mobility, both `hip-rotation`, both 90 seconds, both per side. They differ in ways that look accidental rather than intended: one is `seated` and one is `floor`; one lists `piriformis` and the other `adductors`; one carries `holdSeconds: 60` and the other has none; and `glutes-acute` is an exclusion on one and a caution on the other. **Effect:** a person can meet the same stretch twice in one week and be told two different things about it.

### `dead-bug` and `dead-bug-progression-3`

The same movement at difficulty 2 and difficulty 4. The instructions differ only in wording. `dead-bug` is strength with no contraindications; the progression is rehabilitation and excludes two. **Effect:** which version somebody gets, and whether it is withheld from them at all, depends on which of two near-identical entries the selector happens to reach.

**Recommendation for both:** retire one of each pair rather than reconciling them, once a reviewer has said which is the better-written entry. Retiring is a content session with a gate update, not a code change.

---

## 7. What is being asked

1. **For each pair in sections 4 and 5: which side moves?** Either the gentler entry loosens or the harder one tightens.
2. **Is the hip abduction group (8–10) the clear case it looks like** — should `standing-hip-abduction` exclude `hip-acute`?
3. **Should `dead-bug` carry any contraindications at all?** An empty list on a core exercise is unusual in this library.
4. **Is `prone-hamstring-curl` right to exclude an acute lower back** when the standing and seated versions do not?
5. **The two duplicate pairs: which entry of each is the one to keep?**

**What happens next.** Answers go into a content session that edits the entries and updates the gate. Nothing in this document is applied without a professional's agreement, and no gate is written to enforce the direction of a pair until that answer exists — a gate written now would simply freeze whichever side happens to be in the data.

---

## 8. One thing this audit cannot see

It compares entries that already exist. It cannot tell whether a movement is missing a gentler version altogether — the case where somebody is refused an exercise and the library has nothing else to offer them for that pattern. That is a different question and a bigger one, and it belongs with the exercise-families work rather than here.
