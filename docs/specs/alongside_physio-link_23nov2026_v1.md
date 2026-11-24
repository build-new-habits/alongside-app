# Alongside: Move — The physio link, Stage 1 (P-40) spec
## 24 Nov 2026 v2

v2 - **S4 BACK built 24 Nov** (Graeme: *"Yes please"*). `views/plan-link-back.js` v1 (route `plan-link-back`, `router.js` v60): *What your physio or trainer changed*: their line (*They wrote*), each change in words with *Changed.* before a change, all ticked; **Use all of it** / **Use the n ticked** / **Keep my list**; using them keeps the list as it was (`ownPrevious`) and says *My exercises › Put back my old list*. Their notes kept only with the health consent (said when not). The same link opened again reads *Nothing to change* (`data/plan-link.js` v2: an added exercise the person already has by name in that list is that exercise; the website's copy updated byte for byte). `app.js` v17 takes `#back=…` out of the address before any screen; with nobody set up (an iPhone's Safari) it says so and offers **Copy this link** or *Set up here instead*; a link tapped with the app open works too. `plan-import.js` v5: a pasted link opens it. `prescribed.js` v1.17: *Your list before the last changes · Kept until …* and **Put back my old list**, asked once (the Plan). `verify-write1` v17: the dated promise kept. Gate `verify-physio-back` 39 (red on v731; reversals red); real browser 0 faults.

S1 built 23 Nov: `store.js` v130 (`ownPrevious`), Schema v1.132, `data/plan-link.js` v1; gate `verify-plan-link` (56; red on v729, reversals red).
S2 and S3 built 23 Nov: `views/plan-link-send.js` v1 (route `plan-link-send`, `router.js` v59; from Share your plan v2), `data/qr.js` (qrcode-generator 1.4.4, MIT, vendored); website `edit-plan/` v1 (with `css/main.css` v4: the footer's email address wrapped, a site-wide overflow at 200% text). The QR code shows for links up to 1,200 characters (`QR_MAX`). Gate `verify-physio-link` (44, end to end; red on v730, reversals red); real browser: `chromium-my-move.mjs` v6 (Send) and `chromium-edit-plan.mjs` v1 (the page, 12 views, axe), 0 faults.

Build New Habits | Agreed by Graeme, 23 Nov: the physio and PT route *"sticks"*; Stage 1 first, *"Go ahead"*; the editing page on the website. Master schedule row P-40 (PAID-PULL, the physio and PT route) and P-44 (this build).

## 1. What it is, in one line

The person sends their own exercises to their physio or trainer as a link; the professional changes them in a plain page on the website (no account, no app, nothing uploaded); they send a link back; the person sees exactly what changed and chooses what to keep.

## 2. Why Stage 1 first

Stage 2 (a live link: changes arrive by themselves, an end-to-end encrypted relay on Supabase, Frankfurt) needs an account in Graeme's name, a Privacy Policy line and Foot Anstey's view. Stage 1 needs none of them and is the base Stage 2 reuses: the same link format, the same editing page, the same *What changed* screen. Only the delivery changes.

## 3. The round trip

1. **The person (the Plan):** *Progress › Share your plan* gains **Send a link to edit** (and Settings › Your plan, My exercises). Choose what goes in: the lists (all, or some), notes (off unless switched on, and only with the health consent, as P-33), their first name (off). The app makes the link and offers the phone's share sheet, **Copy link**, and a QR code to show in the clinic.
2. **The professional:** opens `https://buildnewhabits.co.uk/edit-plan/#…` in any browser. They see each list and its exercises (name, sets, reps or time, note). They can change any of them, add an exercise (typed), remove one, and add a line for the person. **Send back** makes a new link, with Share, Copy and Email buttons. The page says plainly what it is: *"Nothing you type is sent to us or kept. It is all in the link."*
3. **The person:** taps the link, or pastes it into *Add a plan you already have* (both lead to the same screen). **What your physio changed** lists each change in words (*Glute bridge: 3 × 12 → 3 × 15*; *Added: Side plank, 3 × 20 seconds*; *Taken out: Clamshell*), with the professional's line at the top. **Use all of it**, tick some, or **Keep my list**. The old list is kept for 30 days: My exercises offers **Put back my old list** until then.

## 4. The link

- Everything after the `#`, so it is never sent to a server (browsers do not send the fragment). Neither page loads anything from anyone else.
- `v1.` then the plan as JSON, deflated (`CompressionStream("deflate-raw")`) and base64url. One codec, `js/data/plan-link.js`, used by the app and copied byte for byte to the website (`edit-plan/plan-link.js`; a gate compares them).
- **Out:** `{ t: "out", at, by?, lists: [{ g, x: [{ i, n, l?, s?, r?, nt? }] }] }`: list name `g`; per exercise its id `i`, name `n`, library id `l`, sets `s`, reps or time `r` (the app's own words, e.g. `"10"`, `"30 seconds each side"`), note `nt`.
- **Back:** `{ t: "back", at, of, say?, lists: [...] }`: `of` is the out link's `at` (so the app can say *"your list from 23 Nov"*), `say` the professional's line (at most 300 characters). New exercises have no `i`.
- **Checked on both sides:** at most 12 lists and 60 exercises; names 60 characters, reps 40, notes 200; no markup (`<` and `>` removed); sets 1 to 20. Anything else is refused with *"This link is not complete. Ask for it to be sent again."*
- A list of about 25 exercises keeps the QR code scannable; a longer one says *"Too long for a QR code. Share the link instead."*

## 5. What it never does

- Never sends anything anywhere: the app and the page only make links; the person and the professional choose how to send them.
- Never changes the person's list without them choosing: the back link only opens *What your physio changed*.
- Never carries check-in answers, the journal, weight, sore areas or anything the arc knows. Notes only when switched on (they can be about an injury).
- No clinical advice from the app: it shows what the professional wrote, in their words, and says who wrote it.

## 6. A limit to say plainly

On an **iPhone**, an app added to the Home Screen keeps its data apart from Safari, so tapping the back link opens Safari, where the app has none of the person's data. The page the link opens says so and shows **Copy this link**, then *"Open Alongside: Move and paste it in Add a plan you already have"*. Android opens the installed app or shares its data with Chrome. Pasting works everywhere, so it is always offered.

## 7. Store (schema first, S1)

- **`ownPrevious`** `{ at, lists }` or `null`: the person's list just before they used a professional's changes, kept 30 days (then `null` on load). Written by *What your physio changed*; read by My exercises' *Put back my old list*. Not a health answer unless it has notes, which go with *Delete my health answers*.
- Nothing else: the links are never kept.

## 8. Tiers

The Plan: sending the link and *What your physio changed* (P-40: *Share my plan with a physio* is the Plan's). Free: a back link says *"This is part of the Plan."* and keeps nothing. Adding a professional's list by hand stays Free.

## 9. Build sessions

| Session | What | Files | Gate |
|---|---|---|---|
| **S1 SCHEMA AND LINK** (built) | `ownPrevious` (store, Schema); `data/plan-link.js`: encode, decode, check, and the changes between two lists in words | `store.js`, `Schema.md`, `data/plan-link.js` (new) | `verify-plan-link` |
| **S2 SEND** (built) | *Send a link to edit*: choose, make, share, copy; the QR code (`data/qr.js`, vendored, MIT) | `plan-share` views, `data/qr.js` (new) | `verify-plan-link-send` |
| **S3 THE PAGE** (built) | `buildnewhabits.co.uk/edit-plan/`: read, edit, add, remove, say a line, Send back; the iPhone note; WCAG 2.2 AA; no third-party anything | website `edit-plan/` | `verify-edit-plan` (app repo, reads `../website`) |
| **S4 BACK** (built) | the back link at start-up and pasted; *What your physio changed*; Use all, choose, Keep my list; `ownPrevious`; *Put back my old list* | `app.js`, `plan-import.js`, a new view, `prescribed.js`, `router.js` | `verify-plan-link-back` |
| **S5 CLOSE** | Help guide, glossary, a Privacy Policy line drafted for Graeme and Foot Anstey, the device checklist sitting, real-browser checks on both sites | `guides.js`, BNH-Files | full suite from a fresh clone |

---

*Build New Habits · Alongside: Move · The physio link, Stage 1 · 24 Nov 2026 v2*
