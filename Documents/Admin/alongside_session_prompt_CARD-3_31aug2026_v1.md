# Session start prompt — CARD-3 build
## 31 Aug 2026 v1

Paste the block below into a new chat. It assumes the chat knows nothing.

---

## THE PROMPT

You are picking up an in-flight build on **Alongside: Move**, a movement and wellbeing coaching PWA. I am Graeme, sole builder. You do the implementation; I make product calls.

**Read `Documents/Admin/master_schedule.md` from a fresh clone before anything else.** It is the single source of truth. The copy in project knowledge is stale — ignore it.

### Session protocol, non-negotiable

- Fresh `git clone --depth 1` at session start. PAT at `/mnt/project/Token_06_08_26_for_rapid_work_to_beta` — **expires 5 September, renew or the session stops dead**
- Confirm live file versions from that clone before touching anything. Never trust a version from a document
- Every file carries a header `DD Mon YYYY vN`. **Check the system clock for the date — do not infer it from a screenshot or copy it from a prior version.** Claude got this wrong on 31 Aug and dated ~20 files "29 Aug"
- List every file you will touch before starting. Touch-once per session
- Schema-first: if a store field changes, `store.js` and `Documents/Live State/Schema.md` before any code
- `sw.js` last, alone, in its own commit, with a cache bump
- Every gate assertion gets a reversal test **proven to fail** before it is trusted. Gates that have never failed prove nothing
- No negative distance windows in gates. Compare `indexOf` to `indexOf`
- `npm install jsdom` before running the suite or ~45 gates fail spuriously. **Then delete `node_modules` before committing** — it has been swept into history twice
- Post-push verification via a second independent fresh clone

### Repo

`github.com/build-new-habits/alongside-app`. Clone:
`git clone --depth 1 https://x-access-token:${TOKEN}@github.com/build-new-habits/alongside-app.git repo`

Currently `alongside-v410`, master schedule **v242**, 92 gates all green.

### Your task

Build **CARD-3** from `Documents/Admin/alongside_blueprint_CARD-3_31aug2026_v1.md` (the file is v2 inside; the filename says v1). It is complete: page model, navigation rules, technical design, 12-file list, 10 gate assertions with reversals, build order.

Three pages replacing CARD-2's tabs. **DECIDE** — caution, last time, adjust controls, skip. **DO** — timer, hazards unhidden, instructions, video. **NOTE** — log block, feedback, next.

### Load-bearing constraints — do not relax these

- **`bodyCaution` renders on all three pages.** It is the personalised safety line, not page-scoped
- **Hazards visible on page 2 without interaction.** CARD-2 put them behind a tab; that was the regression CARD-3 exists to close
- **Page 2 must not auto-start the timer.** Auto-starting punishes reading
- **`exercise-card.js` must not read `exerciseHistory`.** CARD-2 removed that P4 exposure; "last time" comes from `lastLine()` in `session-log.js`, which is already display-only
- **`exercise-timing.js` must not read `holdSeconds`.** It is the per-rep hold, not the exercise length — bird-dog holds 3 against a duration of 90
- **Keep the existing action-bar ids** — `timer-toggle-btn`, `skip-exercise-btn`, `gp-next-*`. Views bind by id. This is what keeps the blast radius survivable
- **No streaks, ever. Safety never paywalled. Coach displays, never interprets (P4).** No count, trend, delta or arrow reaches the screen
- **Interim on labels:** say "About 1:30" where an exercise is not a genuine hold. TIME-2 fixes it properly

### Three open questions — ask me, do not decide

1. Does "make it easier" exist? SWAP-0 is cardio-machine only, deliberately — widening it to strength returned unsafe substitutes for this audience
2. Do `why` and `load` belong on the card at all, or move to the library?
3. Anything where the spec and the code disagree — the code wins, tell me

### How I work

Be direct. Tell me when I am wrong. Do not ask me things that follow from decisions already made. Do not build past a genuine unknown — check the data first. Three specs in two days were each corrected by discovery during the build, and each time checking first was cheaper than the rework.

Start by cloning and confirming the schedule reads v242.

---

## Context the new chat does not need but you might

**Shipped 31 Aug:** CHECKIN-2a (add a sore area at check-in — closed a beta blocker where an undeclared area could never reach a caution), TIME-1 (one timer source), CARD-2 (three-layer card, now superseded by CARD-3).

**Corrected during build, each time by checking data first:** CHECKIN-2's schema (would have broken 25 readers), TIME-1's premise (`holdSeconds` canonical would have turned a 90-second exercise into a 3-second one), CARD-2's model (superseded within hours).

**Known open, on Graeme not Claude:** PAT renewal by 5 Sept · `node_modules` in git history, two occurrences, rewrite-or-leave undecided · clinical pack unsent · A1.11 age wording · sole-trader registration.
