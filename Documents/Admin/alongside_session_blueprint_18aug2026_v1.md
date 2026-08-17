# Alongside: Move — Next Session Blueprint

**18 Aug 2026 v1**

**Repo:** `build-new-habits/alongside-app` (branch `main`)
**Live at handoff:** `alongside-v379` · **67 gates green on a fresh clone**
**Written by:** the session of 16–17 Aug 2026

---

## 0. Read this first — you can start working immediately

**Do not open with a confirmation conversation.** Graeme has already made the decisions listed in section 6. He does not want to re-approve them, and asking him to will waste the session.

Your first actions, in order, with no questions asked first:

1. Clone the repo (section 2) and run the gate suite. Confirm 67 green.
2. Read `Documents/Admin/master_schedule.md` from the **repo**. It is canonical.
3. Start the build in section 5.

Ask Graeme only when you hit a genuine product or philosophy decision that section 6 does not already answer. Implementation choices are yours — the standing instruction is *"when something is obvious, build it; when it's a product decision, name it as such and wait."*

---

## 1. What this product is, in one paragraph

**Alongside: Move** is a fitness coaching PWA for people mainstream fitness culture fails: neurodivergent adults, women navigating hormonal change, and time-poor parents. **No streaks, no shame, no comparison, no evaluation of the user.** The coach displays; it never interprets (Locked Principle P4). Behaviour is communication. Coach voice is **Nurturing only, permanently**. The product is 18+. Beta is mid-September 2026; public launch January 2027.

**Tier model:** Free is the session; Personal is the plan. *Is this a session or a plan? A practice or a journey?* **Safety-critical features are never paywalled, and all wellbeing practices are free.**

---

## 2. Access and environment

### Token

Fine-grained GitHub PAT at `/mnt/project/Token_06_08_26_for_rapid_work_to_beta`.

**Expires 2026-09-05 07:56 UTC.** If the session is after that date, stop and tell Graeme — he must issue a new one before any push.

Read it with whitespace stripped, then inject into the remote URL:

```bash
TOKEN=$(head -1 /mnt/project/Token_06_08_26_for_rapid_work_to_beta | tr -d '\n\r ')
git push "https://x-access-token:$TOKEN@github.com/build-new-habits/alongside-app.git" main
```

### Clone location — must be exact

```bash
cd /home/claude
git clone "https://x-access-token:$TOKEN@github.com/build-new-habits/alongside-app.git" repo
cd repo
```

**`/home/claude/repo` is hardcoded in 14 paths.** Any other location breaks tooling.

### Dependencies

```bash
cd /home/claude && npm install jsdom
```

Required by the gate suite. Gates import it by absolute path from `/home/claude/node_modules`.

### Git identity

Already configured: `Graeme Wright`, `hello@buildnewhabits.co.uk`.

### Running the gates

```bash
cd /home/claude/repo
pass=0; fail=0
for f in tools/*.mjs; do
  out=$(node "$f" 2>&1); code=$?
  n=$(echo "$out" | grep -c "FAIL")
  if [ $code -ne 0 ] || [ $n -ne 0 ]; then echo "FAILED: $f"; fail=$((fail+1)); else pass=$((pass+1)); fi
done
echo "green=$pass red=$fail"
```

---

## 3. Non-negotiable process rules

These are not style preferences. Each one exists because breaking it caused a real problem.

| Rule | Why |
|---|---|
| **The repo is canonical. Project knowledge is write-only.** | A PK search returned the master schedule 56 versions stale. Produce snapshots for Graeme to upload; never read PK back as authoritative. |
| **`sw.js` ships last, alone, in its own commit, with the cache version bumped.** | So a bad deploy can be rolled back without reverting application code. `git add -A` swept it into an application commit once — do not use `-A`. |
| **Schema first.** Any `store.js` field change updates `Schema.md` in the same session. | `schema-check.mjs` enforces the version match and will fail the suite. |
| **Every file carries a `DD Mon YYYY vN` header.** | Ask for date and version before editing any file you do not have a confirmed copy of. |
| **Touch-once per session scope.** | Bugs found outside scope are logged, not fixed, unless Graeme asks. |
| **Fresh clone is the verification standard.** | `rm -rf verify && git clone --depth 1` — never `raw.githubusercontent.com`, which has shown CDN caching lag repeatedly. |
| **Update the master schedule at session close**, and give Graeme the file. | It is the single source of truth across build, business, website and content. |
| **WCAG 2.2 AA on all content and UI.** | Non-negotiable. 44px touch targets, visible focus, accessible names on every control. |

### Editing JS reliably

Use Python with an assertion before every substitution:

```python
assert t.count(old) == 1
t = t.replace(old, new)
```

An ambiguous anchor silently corrupts a file. The assertion catches it first.

---

## 4. Verification discipline — the most important section

Every significant find in the last two days came from **measuring or executing**. None came from reading code and reasoning about it. The evidence hierarchy is: **code review < gate suite < device check.**

**Rules earned the hard way:**

- **A number is not executed evidence until you know which code produced it.** Probe *before* the suspect line, not after. A tilt that reported "applied 12 times" changed nothing.
- **A green test suite is not evidence the app runs.** Nothing in the suite mounts a real route end to end. Four features once shipped into one view of eleven with every gate green.
- **Source-text assertions cannot see reachability.** Four gates read a deleted file's source and stayed green for twelve days.
- **A confident comment is not evidence.** Three separate faults survived because a comment or changelog claimed the behaviour existed.
- **A gate that has never been made to fail proves nothing.** Reversal-test every assertion: break the behaviour on a copy, confirm the gate goes red.
- **When a reversal test shows NOT CAUGHT, suspect your seed first.** It has been a bad seed more often than a gate hole. Verify before reporting a gap.
- **A green assertion proves the outcome, not the mechanism.** Two assertions passed for reasons other than the ones they named.
- **When appending to a gate, put the block BEFORE `process.exit()` and count assertions before and after.** Appended tests once became dead code while the suite reported ALL PASS.
- **A field is only live with a confirmed reader AND writer.** Read-only grep is insufficient.

**Reversal-test harness** (copy to a scratch dir, break one thing, run the gate):

```python
import subprocess, shutil, os
REPO='/home/claude/repo'; RT='/home/claude/rt'
if os.path.exists(RT): shutil.rmtree(RT)
shutil.copytree(REPO, RT)
p = os.path.join(RT, 'path/to/file.js')
t = open(p, encoding='utf-8').read()
assert t.count(old) == 1
open(p,'w',encoding='utf-8').write(t.replace(old, new))
r = subprocess.run(['node','tools/verify-x.mjs'], cwd=RT, capture_output=True, text=True)
print('caught' if r.returncode != 0 else 'NOT CAUGHT')
```

---

## 5. The build: the guided practice library route

**This is the session's work. Start here.**

### The problem, already verified

**28 standalone items in `EXERCISES` are referenced by no view at all.** Verified by mounting the Library and scanning every file in `js/views/`.

`getSuitableExercises()` correctly filters them out via `isSessionLength()` — `contentType === 'practice'`, or `duration >= 600`. Whole sessions are not components; a twenty-minute circuit cannot be one of four picks in a main section. **That filter is right and must not change.**

What is missing is the way in. A comment in `js/data/exercises/index.js` claimed they were "reached through the Library, Mobility & Conditioning and the single-activity views". That comment was wrong and has been corrected — it is why the gap survived.

### What is stranded

| Group | Count | Examples |
|---|---|---|
| Recovery protocols | 10 | cold shower, contrast therapy, napping, hydration, nutrition timing, elevation, sauna, sleep position, active-recovery walk, cycle recovery spin |
| Mindfulness practices | 12 | 5-4-3-2-1 grounding, feet-on-floor, safe place, loving-kindness, mindful observation, worry time, compassionate self-talk, nature visualisation, morning intention, gratitude, digital detox, mindful walking |
| Walks | 1 | mindful-walk |
| Circuits and sport warm-ups | 5 | EMOM, med-ball plyo, strength-endurance, two sport warm-ups |

Get the exact live list by filtering `EXERCISES` with `isSessionLength()` and excluding anything `matchCategory()` reaches — do not trust this table over the code.

### The build

A route that serves **whole items** rather than assembling components: filter by `isSessionLength()`, group by `category`, hand the chosen item to the existing single-activity player.

### Decide this first, before writing code

**`quiet-session.js` keeps its own hardcoded `BREATHING_EXERCISES` array with ids mirroring the database.** Two sources for one thing is the exact pattern that produced four different names for `targetDate` and cost most of two days. Decide whether the new route reuses that player or the database list, and write the reasoning into the file.

### Constraints

- **Free tier. Not gated.** The tier model states: *"Free = coach-chosen full-body session + all wellbeing practices."*
- **Reachable from a real door**, not only by URL. Confirm by mounting, not by grepping.
- **No streaks, no counts, no completion mechanics** on practices.
- WCAG 2.2 AA.
- New file → add to `sw.js` precache **and** bump the cache version, in `sw.js`'s own final commit.

### Definition of done

Gate that **mounts** the route and asserts a person can reach and open a practice. Reversal-test it. Then a fresh clone with the full suite green.

---

## 6. Decisions already made — do not re-ask

| Decision | Answer |
|---|---|
| Weekly focus lever | Built and shipped: reorders `mainCategories`. Measured 60 vs 28 across 30 builds. Personal tier. |
| Contextual "update check-in" after a door | **Not building it.** Leave as is. The 4 Aug fix removed that interruption deliberately. |
| Within-session progress bars (12 views) | **They stay.** |
| Severe pain threshold | **7 is top of moderate; 8 is severe.** The Gentle Care bypass fires at 8+ via `getPainBand`. `getZoneStatus` and the acute-variant filter deliberately stay at 7 — that number also switches people onto acute-safe exercises and must not move. |
| `proposalBias` | **Retired**, not restored. Derived at read time by `coachBias()`. |
| Graded burnout message | **Restored** on Home, above the yesterday line. |
| Canonical target field | **`strategicGoal`**. Top-level `targetDate`/`targetDescription` are read-only legacy, migrated on load. |
| Deferring work | **Graeme does not want anything deferred.** "I won't remember to do it." Order is negotiable; dropping is not. |

---

## 7. Graeme's open items — do not block on these

- **Clinical pack to a physiotherapist.** Must be updated to include **SEVERE-1** and the **7-vs-8 threshold change** as *decisions made*, not questions open.
- **Three safeguarding reviewers**, open since early July.
- **ME/CFS handling** — needs his wording plus physio input. Beta blocker.
- **HMRC sole-trader registration** — gates the business bank account and ICO wording.
- **Domain switch-over.**
- **Physio naming:** ask them to review first, raise naming separately afterwards, and put it to Natalie before offering. *"Reviewed by a UK-registered physiotherapist"* without naming gets most credibility with least exposure.

---

## 8. Queue after the practice library

1. **`session-builder-ui` route trace** — roughly 80% complete.
2. **Device check rewrite against real routes**, then Graeme runs it. **Nothing has ever executed on a device.** This is the last real unknown before beta.
3. **Nested reader/writer detection** — open, and needs a better design than a keyword scan. A naive version flags 74 of 124 nested fields, mostly false positives, because writes happen through helpers and whole-object sets. *Note: a dot-path scan would NOT have caught TARGET-3 — an earlier claim that it would was wrong.*
4. **`[UNPROVEN]` assertion in `tools/verify-goal2.mjs`** — the orphan-component check could not be made to fail. Establish whether components genuinely cannot be orphaned, or the seed was wrong.

---

## 9. State at handoff

| Item | Value |
|---|---|
| Cache version | `alongside-v379` |
| Gates | 67, all green on a fresh clone |
| `store.js` | v53 |
| `Schema.md` | v1.35 |
| Audit ERRORs | 0 (were 18 at the start of 16 Aug) |
| One-ended top-level store fields | 39, pinned by `verify-write1.mjs` |
| CHAP-1 | **Complete** — all six steps |

**Shipped 16–17 Aug:** SEVERE-1 and its threshold · BIAS-2 · BURN-3 · COUNTDOWN-1 · the chapter hinge · ASSESS-1 step 3 · My Programme with tier logic · CHAP-1 steps 4 and 6 · PLAN-1 · TARGET-3 · TARGET-4 · GOAL-2 · AUDIT-2 · DATA-SEATED · the WRITE-1 gate · three rotting date fixtures.

---

*Build New Habits · Alongside: Move · Next Session Blueprint · 18 Aug 2026 v1*
