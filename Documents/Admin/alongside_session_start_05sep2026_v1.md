# Alongside: Move — session start, 05 Sep 2026

Paste this whole file as the first message of a new chat.

---

## Do these four things before anything else

**1. Read the clock.** Not once — before writing *every* file header. This has been got wrong five times in a row, always the same way: check the date once, then reason forward from that answer while the day rolls over. `date -u` costs nothing.

**2. Clone fresh, and read the last commits.**

```bash
TOKEN=$(head -1 "/mnt/project/New_Token_-_End_4th_Oct" | tr -d '\n\r ')
git clone --depth 1 -q "https://x-access-token:${TOKEN}@github.com/build-new-habits/alongside-app.git" repo
cd repo && git log --oneline -8
```

The token before this one expired on 5 September; this one runs to **4 October**. If a path in a blueprint no longer exists, Graeme has rotated it and the new file is in `/mnt/project/`.

**Read the commit log, not only the schedule.** On 4 September a session finished LOBBY-1c, pushed it, and the response was lost before it reached Graeme. The next session found commits it had no memory of. **A pushed commit is ground truth even when nobody remembers making it** — and the schedule is written at session *close*, so a lost response means it may never be written at all.

**3. Read the master schedule.** `Documents/Admin/master_schedule.md`, currently **v273**. It wins over anything in project knowledge, which goes stale.

**4. Confirm the live versions.**

```bash
grep "^const CACHE_NAME" sw.js          # alongside-v437
grep -m1 "^ \* .* v" js/store.js        # v63
npm install jsdom --silent
for g in tools/verify-*.mjs; do node "$g" >/dev/null 2>&1 || echo "FAIL $g"; done
```

**102 gates, all green on a fresh clone.** If any fail before you have touched anything, stop and find out why.

---

## Where the build is

`alongside-v437` · 102 gates · `store.js` v63 · `Schema.md` v1.45 · schedule v273

The last four days rebuilt the product around **the arc** — a direction held over weeks, which is the thing the business rests on.

- **Home is a lobby.** The arc at the top, an invitation, and reference rows. No check-in needed to browse.
- **Free and Plan are different screens**, not one with a panel swapped. Free asks *"What do you want to do today?"* and hands over the controls. Plan leads with the arc and an invitation.
- **The arc** is one aim and up to three strands, built by four questions. 33 aims filtered to about eight by situations derived from stored data, with an escape to the full list.
- **A strand may be a mind strand outright** — "trusting your body again", "knowing when to stop". Enforced by a gate, not just intended.

---

## Your job: build SWAP-1

Spec: `Documents/Admin/alongside_swap1_spec_05sep2026_v2.docx`. **All four open questions are decided** — section 7. Do not reopen them.

**The problem.** Choosing "coach recommends, I'll choose" shows ~90 exercises *before* the session exists. The preview reads well and should lead, with swapping behind it by category.

**The change**, in short:

1. Preview first, candidate list gone from the daily flow.
2. Tapping an exercise opens alternatives for the **same section**, grouped by the body area they lead with.
3. Alternatives come only from the pool the session was already built from — every safety filter has already run. **Do not call the builder afresh.**
4. Sore areas **marked** above 0 (hard red, contrast-checked, reason in words) and **unselectable at 7+**, which is where `getActiveConditionIds` already switches to acute-safe variants. At 8 the picker is never reached — Gentle Care fires first.
5. Swaps are **like for like, one for one.** Replace one exercise; nothing else moves.
6. "Build my own" leaves the daily flow. **Athlete self-build is a different feature and survives** — Graeme's daughter writes her own programme and wants it. Do not conflate them.

Gate assertions are listed in spec section 6.

---

## How to work here

**Session discipline.** Schema first if any store field changes. `sw.js` last, alone, in its own commit, with the cache bumped. Update the master schedule at close. Verify every push from a **second, independent** fresh clone.

**Every gate assertion must be reversal-proven.** Break the thing deliberately, confirm the gate goes red, restore. An assertion that has never failed has never been shown to guard anything. This caught roughly a dozen faults over four days that reading the code did not.

**Anchor assertions on the most specific string available.** Ten separate assertions this week measured the wrong region of a file — a call site instead of a definition, a function's own name, a listener instead of the control it belongs to, one branch of two. All were caught by reversal, none by review.

**Rank, don't filter.** Four times the right answer has been to reorder rather than remove: section rules, category selection, zone weighting, aim situations. A hard filter over a library this size eventually returns nothing.

**Watch for readers without writers.** Three features shipped inert because a field was read that nothing wrote, or that had been renamed. `zonesForGoal(null)` returning `[]` is indistinguishable from "this person has no goal", so nothing goes red. **Before trusting a field, confirm both sides.**

**Trace, don't reason.** Every significant fault this week was found by *running* the thing for a real persona, not by reading it. Onboarding goals sharing 48% of their pool; a neck-and-shoulders request returning four leg stretches; a brand-new arc showing a strand already lit.

**Touch-once.** Bugs outside the session's file scope get logged, not fixed.

---

## What Graeme wants from you

Directness. One decision at a time, offered as options rather than open questions. Complete file replacements, not patches. Push back when the evidence warrants it — he has changed his own mind several times this week on the strength of a trace, and the two most important decisions in the product came from him overruling a proposal.

**Say when something is wrong, including when it is your own earlier work.** Several gates and decisions have been reversed this week; every one was recorded with its reasoning rather than quietly edited.

---

## Also open, in priority order

| ID | What |
|---|---|
| **VARIETY-Q** | The check-in asks "something like last time / something different" and then hands over the full list, so the answer cannot survive. Once the preview leads, it can shape what gets built. Likely resolves with SWAP-1 |
| **PICKER-EXIT** | "Build a different one" does not return where it started |
| **SORE-LEGEND** | The red ring needs its meaning stated |
| **GOALS-MIGRATE** | Remove goals from onboarding; **twelve** read sites, several of them coach copy |
| **INSTEP-TIER** | In Step is Personal-tier in code, free in both per the 3 Sep decision. Live conflict |
| **NARROWING-Q** | Personas 2.15 and 2.16 are indistinguishable on stored data |
| **CONTENT-STRETCH** | ~25–30 entries: chest, inner thigh, wrists and arms |
| **CONTENT-INSTEP** | Blocked on Graeme; spec is written |

**Graeme's own list**, not yours: HMRC sole-trader registration · ICO registration · A1.11 age wording · four compliance signatures · the domain switch **before** any tester installs (PWA storage is origin-bound) · beta tester recruitment · clinical pack review. See `Documents/Admin/alongside_task_list_03sep2026_v1.docx`.

---

## Things that will bite

- **`sw.js` must be the last commit, alone.** A new file missing from `SHELL_URLS` breaks offline and on stale installs.
- **Commit messages go in a file** (`-F`), never inline with backticks. There is a force-push incident behind that rule.
- **`node --check` every file you write**, before running anything else.
- **Python `assert t.count(old) == 1` before every string replacement.** An ambiguous match applied in the wrong place is very hard to see afterwards.
- **A script that throws before its write step has changed nothing.** This happened on 3 September and the edits appeared to have landed when they had not.
- **`verify-blueprint` and `schedule-drift` must both pass** before committing.
