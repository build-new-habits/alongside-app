# Blueprint — CARD-4

## 12 Sep 2026 v1

Build New Habits | Alongside: Move | Opens against master schedule v344, `alongside-v501`, cold start blueprint v106, `store.js` v67, `Schema.md` v1.60, 147 `verify-*` gates (as read on 12 Sep; confirm every one at session start)

**One build session, and a large one.** The exercise card becomes four pages instead of three, the hazards get a page of their own, and an image slot arrives with a placeholder that has an enforced expiry.

---

## 0. Why this exists

Graeme, after a gym session on 12 Sep 2026, in his own words: the card needs to be cleaner, so four screens make sense. The DO page carries the caution, both hazard blocks, "If it hurts", how to get there, pace, and now "Other ways to do this" — a long scroll past warnings to reach the thing you came for, which means **people will flick through it as fast as they can**.

His structure:

1. What you are doing.
2. What to watch out for — the warnings.
3. The exercise itself: instructions, video, images.
4. Reflection.

**Decisions already taken (12 Sep):**

| | Decision | Taken |
|---|---|---|
| **B** | Hazards get their own page | ✅ Yes |
| **C** | Build the card before images exist, with a placeholder — right for beta, **not for public launch** | ✅ Yes |

---

## 1. The argument against, recorded so it is not rediscovered

Today the hazards sit **above** the instructions, so somebody moving forward passes them on the way to what they want. On their own page they can be swiped past without reading.

Graeme's counter, which is why this is being built: a page people scroll past fast is not being read either.

**Both are true, and the design has to hold the second without losing the first.** That is why §3 keeps the page ORDER (watch-out before do) and keeps `HURT_AND_ACHE` on every page. The hazards move to their own page; they are not quarantined behind an optional tap.

---

## 2. Scope

| # | Item | Where |
|---|---|---|
| 1 | Four pages: `decide` → `watch` → `do` → `note` | `js/exercise-card.js` |
| 2 | The hazard cluster moves from DO to the new WATCH page | `js/exercise-card.js` |
| 3 | An image slot on DO, with a visible placeholder | `js/exercise-card.js`, card CSS |
| 4 | The placeholder's **expiry gate** | `tools/verify-card4.mjs` |
| 5 | Five players' page state updated | the six views in §4 |
| 6 | Five existing gates updated for four pages | §6 |

Gate: `tools/verify-card4.mjs`. Gate count 147 → 148.

---

## 3. The four pages

| Page | Holds |
|---|---|
| **1. Decide** | Name, why, the coach's line, the caution, load, the sore-area pointer, skip |
| **2. Watch out** | Both hazard blocks — "What to watch for" and "If it hurts" — and the caution |
| **3. Do** | Instructions, the video link, **the image slot**, sets/reps or the clock, pace, "Other ways to do this", the per-set control |
| **4. Note** | The log, feedback buttons, next |

**Four rules that do not move:**

1. **`HURT_AND_ACHE` renders on EVERY page.** CR-5. The hazards having a page does not make them a place you can be absent from.
2. **The caution line stays pinned on every page**, and ADAPT-1's sore-area pointer follows it.
3. **Page order is decide → watch → do → note.** Somebody moving forward still passes the warnings before the instructions.
4. **Back goes one page**, as `BACK_TO` already does.

### The image slot

Graeme's phrasing was "images will appear here". **Recommended wording, which points at something that already exists:**

> Photographs are being added. For now, the video shows the movement.

All 560 entries carry a `youtube` value, so this is true today and hands the person something that works.

**Two requirements:**

- It is a **visible, honest placeholder**, not a grey box, and it is **not announced as an image** — there is no image to describe. No `<img>`, no `role="img"`, no alt text describing a picture that does not exist.
- **It has an enforced expiry.** `verify-card4` asserts the placeholder is ABSENT once any entry carries an image field. Without that, "not for public launch" becomes permanent by default, and it is the only thing making it safe to ship a promise on screen.

---

## 4. Files, in the order they are touched

| Order | File | Change |
|---|---|---|
| 1 | `tools/verify-card4.mjs` | **New.** Written first, run red |
| 2 | `js/exercise-card.js` | v6 → v7. `PAGES`, `BACK_TO`, the WATCH page, the image slot |
| 3 | `css/components/workout.css` | v15 → v16. The image placeholder |
| 4 | `js/views/workout.js` | Page state: `currentCardPage` now has four values |
| 5 | `js/views/gym-programme.js` | Same |
| 6 | `js/views/core-session.js` | Same |
| 7 | `js/views/prescribed-session.js` | Same |
| 8 | `js/views/prescribed.js` | Same |
| 9 | `js/views/morning-session.js` | Same |
| 10 | `tools/verify-card3.mjs`, `verify-card-tdz.mjs`, `verify-adapt1.mjs`, `verify-core1.mjs`, `verify-clinical-response.mjs` | §6 |
| 11 | `sw.js` | Last and alone |
| 12 | Cold start blueprint, then master schedule | Close |

**48 references to `currentCardPage` across the views**, and 28 string literals of `"decide"` across `js/`. Grep both at session start; the count is the scope.

---

## 5. What will go wrong, named in advance

1. **A page that exists in the card but not in a player's state machine.** Each view holds its own `currentCardPage` and its own forward/back handlers. A view that still thinks `do` follows `decide` will skip the warnings entirely — the exact opposite of the point. **Test every player, not just `workout.js`.**
2. **`HURT_AND_ACHE` dropped from a page.** It is in `pinned`, so it should follow — assert it on all four pages anyway.
3. **The per-set control** (TIMER-2) lives on DO and must stay there.
4. **"Other ways to do this"** (ADAPT-1) is on DO and must not drift to WATCH; its **pointer** follows the caution and appears wherever the caution does.
5. **`verify-card3` test 2c** forbids `<details>` in the `doBody` source slice. The ADAPT-1 disclosure is built above that slice. Moving code between pages can quietly change which slice it lands in.

---

## 6. The five existing gates

Each asserts three pages today. **Read each one before changing it, and change the assertion rather than weakening it.**

| Gate | What it asserts now | What it becomes |
|---|---|---|
| `verify-card3` | Three pages, the hazard cluster on DO, the pager | Four pages, hazards on WATCH, `<details>` still outside the hazard cluster |
| `verify-card-tdz` | The card renders on each page without throwing | Four pages |
| `verify-adapt1` | Disclosure on DO only; pointer on DECIDE and DO, not NOTE | Pointer on DECIDE, WATCH and DO; disclosure still DO only |
| `verify-core1` | The caution paragraph's markup | Unchanged, but re-run against all four |
| `verify-clinical-response` | Hazard copy present on the page it expects | The WATCH page |

**If updating one of these makes an assertion weaker rather than different, stop and say so in the commit.**

---

## 7. What the new gate must assert

Executing, jsdom, real renders. The bootstrap in `verify-adapt1.mjs` is the closest fit.

1. Four pages render, in order, and the pager shows four.
2. **`HURT_AND_ACHE` on all four.** Reversal: drop it from one.
3. The caution is pinned on all four; the sore-area pointer appears wherever the caution does.
4. The hazard blocks are on WATCH and **not** on DO.
5. Instructions and the video are on DO and **not** on WATCH.
6. "Other ways to do this" is on DO only, and still outside any hazard markup.
7. The per-set control is on DO only.
8. Forward from DECIDE lands on WATCH, not DO. **Back from DO lands on WATCH.**
9. The image placeholder is on DO, is not an `<img>`, and carries no alt text.
10. **THE EXPIRY:** if any entry in `EXERCISES` carries an image field, the placeholder must be absent. Reversal: add an image to a fixture entry and watch it go red.
11. Each of the six players reaches all four pages. **A control run must prove each player was actually mounted**, or this passes on absence.

---

## 8. Done means

- 148 gates green from a **second fresh clone**.
- On a device: open a session, step through all four pages, and back through them.
- VoiceOver announces each page change.
- The image placeholder reads as a promise, not a broken image.

---

## 9. Not in this session

- The images themselves (IMAGES-1). This ships the slot and the placeholder.
- Any change to what the hazards SAY.
- The Library view's own card.
