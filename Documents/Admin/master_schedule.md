# Alongside: Move — Master Schedule
## 16 Aug 2026 v197

Build New Habits | Single source of truth for all build, business, website, and content tasks.
Supersedes `master_schedule_15aug2026_v196.md`. Remove v196 on upload.

> ### 🔴 PICK UP HERE — 16 Aug. `alongside-v362`. 54 gates green, 58 checks green.
>
> #### Shipped: CHAP-1 step 2 — My Programme
>
> **`js/views/my-programme.js` (new), reached from a full-width row on Home above the six tiles.** Reads what already exists and writes nothing. **Three** of the blueprint's four sections — the fourth is the weekly focus, deliberately withheld, see below. Each is absent when it has no data rather than shown empty: where you are (chapter, weeks in, sessions so far, what the last read changed), the arc (chapters finished, chapter now, what would likely come next and that it is not fixed), and what you are aiming at (goals, the weekly target only if `setAt`, the event and its date).
>
> **The cog is gone from Home.** Settings is a bottom-nav destination reachable from every screen — verified in `index.html` before removing it, not assumed. `.today-settings-link` and the greeting's 52px clearance went with it. **"Update check-in" keeps its text label**, both branches gated.
>
> **The weekly focus is deliberately NOT rendered.** Nothing writes `weekFocus.key` — that is step 4. Rendering the section now would put reviewed copy where no user could reach it, which is the 15 Aug fault. The gate seeds `weekFocus.key` and **fails if the section appears**, so it cannot ship ahead of its writer by accident.
>
> #### The find: `schema-check.mjs` had never examined anything
>
> It reported `store.js` v52 vs Schema.md v41 faithfully — and its **field diff had been slicing an empty string since the day it was written.** It anchored on `indexOf('getDefaults()')`, matching the first *mention of the name* in the header comment rather than the definition ~760 lines below, then searched for the closing brace from the start of that slice, so the end index landed **before** the start index and `String.slice()` returned `''`. Zero keys extracted, so every field counted as documented and `UNDOCUMENTED` could not fire at any amount of drift.
>
> **Nine store fields were hidden behind it:** `assessment`, `exerciseClearance`, `pacing`, `personalBests`, `programme`, `sessionMode`, `sessionPace`, `showPersonalBests`, `weekFocus`.
>
> **The rule this adds to the two from 15 Aug: a red check is no more trustworthy than a green one.** This one was failing, for a real reason, while its main assertion was empty — and the plausible fix, bumping the version line, would have turned it green and buried all nine. Found by probing the extraction rather than reading the verdict.
>
> `schema-check.mjs` **v2** — anchored on the definition, ended relative to the return, and it now asserts its own extraction: under 50 top-level fields fails loudly. `Schema.md` **v1.34**, current at `store.js` v52.
>
> #### `verify-chap2.mjs` — the first gate that EXECUTES a view
>
> Every other gate reads source text, which is exactly why four end-of-session moments reached one of eleven views on 15 Aug with fifty-one gates green: **not one of them knew whether a person could reach the code it was reading.**
>
> This one mounts Home in jsdom, finds the row, **clicks it**, and asserts where the click lands; then mounts the destination in five seeded states and reads the text a person would see. **Sixteen reversal tests, all caught.** It also caught a wrong assertion of mine while being written — a fresh user sees "Check in", not "Update check-in" — which is the argument for running a gate rather than reading it, in one line.
>
> Two smaller instances of the same fault class, both mine, both this session: a `grep '[^\x00-\x7F]'` under `LC_ALL=C` that matched almost every line because GNU grep does not interpret `\x` escapes, and a `grep -o 'alongside-v[0-9]*' | tail -1` that read a cache version out of a **comment** and reported `alongside-v2`. Neither reached the repo; both were the same mistake as the nine faulty assertions.
>
> #### 🟠 Needs Graeme
>
> - **My Programme and tier.** Programmes are Personal; the row is currently shown to everyone and displays only what that person actually has, with nothing locked and nothing invented. Whether it should instead be a Personal-tier upsell is a product decision and was not taken. **The view is built either way — this is one branch, not a rebuild.**
> - **Three chain successors are named `Build`, `Open` and `Ground`.** They resolve correctly, but the arc line reads *"Build would likely come next"*, which is a sentence about a programme called Build. A naming question in `programmes.js`, not a view bug. Related to the still-open 🟠 *chain routes — I invented them*.
> ### 🔴 SAFETY — systemic conditions are collected and then ignored. Found 16 Aug via the physio review.
>
> **Four conditions are asked about at onboarding, trigger the clearance question, and then have zero effect on what the person is served.** `getExerciseSafetyTier()` matches condition IDs against each exercise's `avoid`/`caution` lists; **`chronic-fatigue`, `fibromyalgia`, `hypermobility` and `osteoporosis` appear in those lists exactly 0 times across the whole library.** Every exercise returns `safe` for all four.
>
> **ME/CFS is the serious one.** The reviewing physiotherapist: *"Post-exertional malaise is not mechanical load intolerance; it is neuro-immune. Adapting volume to how you feel today is the exact mechanism that triggers severe baseline crashes."* The product's central mechanic is contraindicated for a group it knowingly records.
>
> **🟢 Starting point drafted 16 Aug**: `Documents/Admin/alongside_mecfs_starting_point_16aug2026_v1.md` — three copy registers, the options for what remains available, six decisions for Graeme and five follow-up questions for the physiotherapist. **The first finding in it is that `chronic-fatigue` is one condition ID covering two populations** ("Chronic fatigue / ME-CFS"): the adaptive model probably serves persistent fatigue well and may harm ME/CFS, so any single decision is wrong for one of the two groups. **HYPER-1 shipped 16 Aug** and closed the hypermobility half of this; fibromyalgia and osteoporosis remain open and go back to the reviewer with the ME/CFS questions.
>
> **Beta blocker. Needs Graeme.** Recommended: (2) honest exclusion copy at onboarding for ME/CFS + (3) populate `avoid`/`caution` for the other three, both before beta; (1) a proper pacing/energy-envelope model as its own stream. Full options in the blueprint §10.
>
> ### 🟠 Pain bands disagree with clinical guidance
>
> `getPainBand()` reads 0–2 none / 3–5 mild / 6–7 moderate / 8+ severe, and the severe override abandons the workout at **8+**. The reviewer's MSK traffic-light puts **6+ at "back off"**. Two scales, and ours is the more permissive. Decision needed: align, or keep both and be explicit.
>
> ### 🔴 PROVENANCE — all clinical guidance in this product is AI-generated and unverified
>
> **Recorded 16 Aug. This applies to every clinical decision taken this week.** The "physiotherapy review" was AI-generated, cross-checked across several models by Graeme, and refined the same way. **It is not a named physiotherapist and it is not clinically signed off.** The synthesis document says so itself in its closing line.
>
> **Cross-model agreement is weak evidence, not strong.** Models share training data and share failure modes, so three agreeing is closer to one source repeated than to three independent opinions. It is a reasonable working input; it is not validation.
>
> **Already corrected:** `conditions.js` and `verify-hyper1.mjs` said *"Physiotherapist review, verbatim"*. They now state the real source. HYPER-1 stays live because its error direction is safe — it withholds 30 stretches and leaves 521 exercises.
>
> **Named risk: this is now the fourth unfilled clinical/safeguarding role.** Three safeguarding reviewer roles have been open since early July with no movement, and the rehab physiotherapist does not exist either. "Review before public launch" is a plan that depends on somebody who has not been approached. **January is the launch and the beta starts mid-September.**
>
> ### 🟢 LOCKED — red-flag escalation: TWO levels, permanently
>
> Graeme, 16 Aug: *"Two levels for always. That seems more simple and more legally sound."* Not a beta-only simplification — the standing design.
>
> | Level | Trigger | Message |
> |---|---|---|
> | **EMERGENCY** | Question 1 only — bladder, bowel or saddle sensory change | Stop. A&E now; 999 if you cannot get there safely |
> | **STOP AND SEEK ADVICE** | Any other yes, and every "I'm not sure" | Stop exercising, call NHS 111 before continuing |
>
> **Plus an unconditional line in BOTH messages**, so the emergency route is always visible without anybody having to classify themselves into it: *"If you have new bladder or bowel problems, numbness around your genitals or anus, or weakness that is getting worse quickly — get emergency help now."*
>
> **Why two and not three.** A three-level design splits neurological symptoms into "rapidly" vs "gradually" worsening, which hands a clinical judgement to a frightened person on a phone — and the source document itself notes that people do not *see* neurological deterioration, they experience it. Two levels ask nobody to self-triage, and **NHS 111 is the human triage layer we would otherwise be inventing**. Upgrading to three later is a config change, not a rebuild.
>
> **Principle to carry into the spec verbatim:** *a red-flag screen is a safety-netting tool, not a diagnostic assessment.* It is also the framing that keeps the product the safe side of the MHRA software-as-medical-device line: monitoring general fitness and wellbeing is not usually a medical purpose, and software offering only lifestyle or referral advice is unlikely to be classified as a device — whereas software that *screens users for potential conditions* is more likely to be. **The wording is doing regulatory work, not just clinical work.**
>
> ### 🅿️ FALLBACK, recorded and not expected — narrow the health data
>
> Graeme, 16 Aug: *"Make this a fall back, but I don't expect to use it."* Recorded so it is a decision rather than a December scramble.
>
> **If no clinician is secured before public launch:** do not ship the red-flag screen, drop the conditions system back to preferences, and be a fitness app that adapts to energy and mood rather than to conditions. Smaller product, defensible without clinical governance.
>
> **The principle behind it:** risk is reduced by adding clinical governance **or** by reducing clinical claims. Two levers, not one. Ship a smaller honest product rather than a larger unverified one.
>
> ### 📄 THE PACK — one document, supersedes three
>
> `Documents/Admin/alongside_clinical_review_pack_16aug2026_v1.docx`. Replaces the rehab front door pack, the ME/CFS follow-up and the red-flag review, which had begun to overtake each other. Six pages: the two-level design, four draft questions, seven implementation questions, the three unhandled conditions, and the 95-exercise audit template including **selection logic, not just the exercises**.
>
> **It opens by stating that no physiotherapist has reviewed this product and that the earlier review was AI**, so a clinician cannot mistakenly assume a colleague vetted it. Non-negotiable — remove that and the pack becomes misleading by omission.
>
> - **Red-flag screen** — 🔴 **CONFIRMED FOR BEFORE BETA by Graeme, 16 Aug.** Review pack issued: `alongside_redflag_screen_review_16aug2026_v1.docx`. Draft wording for the three items written for the physio to **rewrite rather than approve**, plus seven implementation questions — false-positive tolerance, firing cadence, whether everyone or only pain-declarers is screened, what exactly stops, whether a self-cleared flag is acceptable, and Graeme's observed-improvement redirect. **Nothing ships in wording the reviewer has not seen.**
> - **Rehab front door** — 🔵 **SCOPE CUT 16 Aug: a landing, not a door.** Build the red-flag screen + hard stop, a duration question with the six-week redirect, and MIN-2 for the three systemic conditions — all bolted onto the existing conditions flow. **Defer** the named front door, chain entry routing, post-surgical path and the upper limb. Reasoning: ~43% of UK adults have chronic pain (defined at 3 months) against a 6-week redirect threshold, so most arrivals get signposted rather than programmed; and the app already adapts to pain, so four of the door's five parts are safety and signposting rather than capability. Decisive factor was maintenance — a clinical-review dependency is a poor fit for a founder moving to the next product after launch. **Graeme's refinement to carry into phase 2: redirect on OBSERVED lack of improvement (the app already holds daily pain scores) rather than self-reported duration.** 🟢 **95-exercise clinical content audit confirmed — goes ahead regardless of the door.**
> - **Rehab front door blueprint** — 🟢 **v2, 16 Aug, physio review received and folded in.** `alongside_blueprint_rehab-frontdoor_16aug2026_v2.md`. **Q1 reversed: the refusal to red-flag screen was "indefensible"** — a three-item screen with a hard stop now runs before chain entry. Redirect threshold 12 weeks → **6, unified**. Chain programming constrained to isometric/closed-chain/mid-range. Post-surgical inside 6 months routes out entirely. **Upper limb does not open.** Buildable once the three pre-beta conditions are met.: `Documents/Admin/alongside_blueprint_rehab-frontdoor_16aug2026_v1.md`, marked NOT FOR BUILD. A physiotherapist review pack was produced alongside it for Graeme to send out. **Ten questions are the blocker**, Q1 above all: the design deliberately does no red-flag screening, and that refusal is the thing most likely to be wrong. Nothing ships until answers come back and the blueprint goes to v2.
> - **Device check rewrite** — 🅿️ **PARKED by Graeme, 16 Aug.** Not to be rewritten until the current build plans are complete, then checked in phases after a thorough route trace. The `session-builder-ui` trace (~80%) is the prerequisite, not this.
>
> #### 🔵 NEW STREAM — DESTINATIONS. Raised by Graeme, 16 Aug. Not yet blueprinted.
>
> Graeme, on the chain-successor names: *"Where does fitness come in? Which fit for different things like, to keep up with grandkids, play sport, walking, hiking, running 5k, 10k, preparing for a marathon? What if I want to differentiate core strength to build a solid foundation, strength for conditioning, and build muscle?"*
>
> **The naming question was the wrong question, and this is the right one.** Checked before answering, and the gap is measurable:
>
> **CORRECTION, same session, before this line was acted on.** I first wrote here that seven selectable goals had NO programme serving them. **That was wrong.** I had read `suitableFor` and inferred coverage instead of executing `getProgrammesForGoals()`. Running the real matcher over all 26 selectable goals shows **every one returns a programme.** The false version was pushed and is corrected here rather than quietly overwritten — it is the same fault as the nine gate assertions and the empty schema diff: *a plausible answer accepted without confirming which code produced it.* The rule keeps earning its place.
>
> **What the executed matcher actually shows, and it is a sharper finding than the wrong one.** 26 selectable goals collapse into 8 engine goals, so the product asks 26 questions and gives 8 answers:
>
> | The person chose | What they get |
> |---|---|
> | `start-running`, `run-5k`, `run-10k`, `cycling`, `swimming` | **Couch to Cardio** — all five, identically |
> | `get-stronger`, `build-muscle`, `tone-up` | **Build** — all three, identically |
> | `flexibility`, `prevent-injury`, `improve-posture` | **Open** |
> | `reduce-pain`, `injury-recovery` | **Back to Strength** |
> | `return-to-fitness`, `return-after-illness` | **Build Your Base** |
> | 8 feel-and-energy goals | **Build Your Base / Feel Good Foundation** |
>
> Somebody training for a 10K and somebody who wants to swim better are handed the same twelve weeks. **The goal was collected, acknowledged, and then discarded at the point it would have mattered** — which is the WRONG-vs-MISSING pattern from 15 Aug: nothing throws, the screen looks right, and only executing it shows the collapse.
>
> **And Graeme's own examples are not in `goals.js` at all** — no hiking, no marathon, no sport, nothing like "keep up with grandkids". The purpose-shaped goals, which are the ones people actually say out loud, are the ones missing.
>
> **Graeme's strength question is the same collapse, seen from inside.** `get-stronger`, `build-muscle` and `tone-up` all resolve to the single engine goal `build-muscle` and the single programme `Build`. Foundation, conditioning and hypertrophy are three different intentions with three different session shapes, and there is currently no field in which they differ.
>
> **This is the same object as two questions already open:** the 🟠 *library question* (393 of 551 entries at difficulty 1–2, and Graeme's framing — *"I'm adding so we can better serve, not compete"*) and the ten destination shapes from the tier model, which are **specified and not built** — `goals.js` is the onboarding list only.
>
> **Blueprint needed before any renaming.** Renaming Build/Open/Ground now would decorate a structure that is about to change shape.
>
> #### 🔵 Next
>
> ### 🟢 SHIPPED 16 Aug — CHAP-1 step 3, PART TWO. THE HINGE IS COMPLETE. `alongside-v368`, 62 checks green.
>
> **The offer moved to Home.** It already existed inside `gym-programme.js`, gated on `currentWeek >= 12` — reachable through **one of thirteen session views**. Anybody who finished a chapter having trained by another route was never asked what came next; the chapter simply carried on being their chapter. Same shape as the fault SHARED-1 fixed, which is why this was a **move, not a new feature**.
>
> **It does not block.** gym-programme's version returns early and holds the session until an option is chosen. The doors stay live under this one — somebody who opened the app to move for twenty minutes should be able to.
>
> **There is no dismiss.** An unanswered hinge stays until answered; dismissing would leave somebody between chapters with nothing to say so. *"Something different"* routes to goal-setup and deliberately leaves the hinge standing until they actually choose.
>
> #### 🔴 FOUR OF EIGHT CHAINS DISAGREED — found and fixed
>
> `gym-programme.js` carried a **private `PROGRESSIONS` map** that contradicted `programmes.js`:
>
> | Chapter | `programmes.js` | the private map |
> |---|---|---|
> | `beginner-fitness` | back-to-strength | **feel-good-foundation** |
> | `feel-good-foundation` | ground | **build** |
> | `open` | (none) | **ground** |
> | `ground` | open | **build** |
>
> So **My Programme could say "Back to Strength would likely come next" and the end-of-chapter screen then offer Feel Good Foundation.** Nothing errored — the product held two opinions and showed whichever the person happened to reach. Deleted rather than reconciled: reconciling leaves two maps that agree today and drift tomorrow. `chapterSuccessor()` is the one definition now, and `startChapter()` replaces a fifteen-line reset that existed twice inline.
>
> **No verdict in the copy, and the gate enforces it.** *"That's Build Your Base done."* No percentage, no "well done", no countdown — this is the moment a chapter could most easily be made to read as an exam result.
>
> #### Two holes in my own gate, both found by reversal testing
>
> Removing the hinge card **crashed** the gate rather than failing it — an unguarded `querySelector` threw. A gate that falls over next to a fault is not a gate that reported one. And *"the doors still work"* passed while the grid was hidden with an inline style, because **jsdom does not compute CSS**, so presence proved nothing about visibility. Both fixed.
>
> #### 🔵 NEXT — CHAP-1 steps 4, 5, 6
>
> **(4)** weekly focus, proposed and editable · **(5)** Blocks presentation offered at the first hinge — the vocabulary is already live and gated, this is the offer mechanic · **(6)** event goals, `targetDescription` and `targetDate`, offered at the first hinge. **Steps 5 and 6 both hang off the hinge, which now exists.**
>
> ### 🟢 SHIPPED 16 Aug — CHAP-1 step 3, PART ONE. `alongside-v367`, 62 checks green.
>
> **A chapter can now end. Before this it could not.** `currentWeek` was capped at twelve and nothing ever set `completed`, so somebody **seventeen weeks into a twelve-week chapter sat at "11 weeks in" indefinitely**, with `chaptersDone` empty and `currentChapterId` null. Found by executing `advanceWeekIfNeeded()` at 120 days elapsed and reading every completion field — not by reading the function.
>
> **The cap stays.** `currentWeek` feeds `getPhaseForWeek()` and the phase biases, which only define twelve weeks; letting it run past would push them off the end of their own data. Completion is a separate fact and is recorded separately. Idempotent, so opening the app twice cannot record two finished chapters.
>
> **The finished chapter lands in `programme.chaptersDone`** with `measuredLevelAtEnd` — what the next chapter's offer will reason from. **My Programme already renders `chaptersDone`, so completion is visible with no new surface.**
>
> **ASSESS-1's `chapterEnded` is now actually passed.** It shipped hours earlier hardcoded `false` at every call site — an integration point nothing integrated with, which is the shape of a feature rather than a feature.
>
> **A hinge brings the read FORWARD; it does not overrule a no.** Reversal testing found that reordering those two checks passed every assertion — which would mean nagging somebody the moment their chapter ends, the point at which the coach is asking most of them. The order is load-bearing and now has an assertion rather than a comment.
>
> #### 🟠 Found, recorded, NOT fixed — the hinge that already exists in one view
>
> `gym-programme.js` contains a **week-12 reflection with repeat / progress / choose options**, gated on `currentWeek >= 12`. It is reachable through **one of thirteen session views** — the same shape as the fault SHARED-1 fixed for the session moments. So the product has an end-of-chapter moment that most people will never see, and it is now sitting alongside a completion event that fires for everyone.
>
> **This is what the offer work has to resolve**, and it is a move rather than a build: the options largely exist, in the wrong place.
>
> #### 🔵 NEXT — CHAP-1 step 3, part two: the offer
>
> The next-chapter offer, on a shared surface, informed by `measuredLevelAtEnd`, offered with reasoning and changeable — *"I might change my priorities, I might develop quicker, or not."* **`verify-chap3.mjs` carries a standing assertion saying the offer is not built**, so a green suite cannot be misread as a finished hinge.
>
> ### 🟢 SHIPPED 16 Aug — COUNTDOWN-1. `alongside-v366`, 61 checks green.
>
> **The countdown the blueprint forbids was already shipping.** Found while starting the hinge, and it changed what got built.
>
> `progress.js` rendered a filled progress bar with **"N% complete"** and **"8 weeks remaining"** beneath it. `settings.js` showed **"Week 9 of 12"**. Both on screens every user sees — while My Programme shipped *hours earlier* with a gate that fails if a progress bar appears. **Two screens, opposite rules, and only the newer one had a test.**
>
> The blueprint line Graeme agreed in full: *keep the milestone, remove the countdown, show progress made and never distance remaining.* A bar cannot obey it, because a bar IS the remaining distance.
>
> **Removed at source.** `percentComplete` and `weeksRemaining` are gone from `getProgressStats()` rather than merely unused by the views, so nothing can render a countdown again by reading a field that offers one. `weeksIn` replaces both and can only count upward.
>
> **Milestones KEPT, reworded to face backwards.** "The end is close" → "10 weeks in". "Halfway through" → "five weeks done". Endowed progress and the goal gradient are real effects; what goes is the mechanism that works by amplifying perceived obligation.
>
> **Why this displaced the hinge.** The hinge would have added a "chapter complete" moment to a screen saying "8 weeks remaining" — building on the wrong foundation. A live contradiction of a core principle outranks an unbuilt feature.
>
> **The gate is product-wide, not scoped to the screen being built** — the scoped version is exactly what let this live for weeks. That breadth found the `settings.js` instance immediately.
>
> #### 🟠 Needs Graeme — twelve within-session progress bars
>
> Twelve session views carry `role="progressbar"`: *"Session progress, 40%"* during a workout. **Flagged, not changed.** That is orientation inside something finite somebody chose four minutes ago, not a deadline stretched over months — and a progressbar role is exactly what tells a screen-reader user where they are. My read is that they stay. It is a judgement, and the wrong call removes something useful.
>
> *(Also on record: an earlier version of the gate flagged `annual-reflection.js`'s "Months you moved in: 7 of 12" — which counts months BEHIND somebody across a year, the opposite of a countdown. The gate now anchors on "week" so it cannot have me delete the right thing. And the banned strings were being checked against a week-9 render while the late milestone only fires from week 10, so restoring it failed nothing; the gate now renders the late state too.)*
>
> #### ⚠️ Near miss worth recording
>
> I began writing this gate as `verify-count1.mjs` — **which already exists**, as the 12 Aug gate giving the product one definition of "a session that happened". The file-creation tool refused to overwrite it. Had it not, a real gate would have been silently replaced and the suite would still have reported all green. Renamed COUNTDOWN-1. **Check the ID is free before claiming it.**
>
> ### 🟢 SHIPPED 16 Aug — ASSESS-1 step 3. `alongside-v365`, 55 gates green, 60 checks green.
>
> **The read stops being a one-off.** Steps 1–2 moved the difficulty ceiling once, at the first session, and then never again — so somebody four months stronger was still served against a day-one read. The same three questions are now offered again **twelve weeks** after the last one, in a reassessment voice.
>
> **Triggered on TIME, not the chapter boundary alone.** The blueprint puts reassessment at the hinge, but programmes are Personal and the chapter-completion signal is written by CHAP-1 step 3, which does not exist. Gating on it would have built a feature **no free user could reach, through code that is not written** — the 15 Aug fault with a plan attached. `chapterEnded` is an argument the hinge will pass when it lands; time is what makes it reachable today. Time rather than session count, because somebody training once a week would wait most of a year, and they are exactly the person whose day-one read fits worst.
>
> **A decline lapses after four weeks** rather than being permanent as it correctly is for the baseline. Somebody who skipped once in March was mid-session and did not fancy it — they did not opt out forever.
>
> **Two constants, both one-line changes, neither scientific:** `REASSESS_AFTER_WEEKS = 12` (matches a chapter, so programme and non-programme users get the same rhythm) and `QUIET_AFTER_DECLINE_WEEKS = 4`.
>
> **`recordBaseline` → `recordAssessmentAnswers`.** The old name stopped being true, and a name that says "first time only" eventually gets read as a guarantee.
>
> **Gate: `verify-assess3.mjs`, 26 assertions, 14 reversal tests.** It drives `renderSessionMoments()` and then the real DOM — renders, taps the chips, presses Done, reads what the coach says back. **That last part was added because reversal testing found two holes all 22 earlier assertions missed**, both because nothing exercised the save handler: swapping the reassessment acknowledgement for the baseline one, and dropping `offerKind` from the reset. Rendering is half the path; the other half is what happens when somebody presses the button.
>
> **One correction on record:** my reset comment claimed it prevented a stale voice reaching a new mount. Reversal testing showed `offerKind` is reassigned on every render, so removing the reset changed nothing and failed nothing. Kept for consistency, relabelled as not load-bearing — a comment claiming a guard is load-bearing when it is not is the same false confidence as a gate that tests nothing.
>
> **🔵 CHAP-1 step 3, the hinge, is now UNBLOCKED.** So is PROG-1, which had stalled on the same dependency twice.
>
> **Superseded:** the note below choosing this as the next build.
>
> **Chosen 16 Aug, Graeme delegating the call: ASSESS-1 step 3.** It is the only item that unblocks something rather than adding to the pile — the hinge (CHAP-1 step 3) cannot be built without it, and PROG-1 cannot be retried without it either. Both have now stalled on it twice. The rehab door is blocked on a person, the device check is parked, and Destinations is a blueprint rather than a build; ASSESS-1 step 3 is the one thing that is neither blocked nor optional.
>
> **CHAP-1 step 3, the hinge mechanic — blocked on ASSESS-1 step 3**, which is not built. Steps 4 (weekly focus), 5 (Blocks, offered at the first hinge) and 6 (event goals) follow. The Blocks *vocabulary* is already live and gated in the view; step 5 is the offer mechanic, not the display.
>
> Still open from 15 Aug: **device check must be rewritten against real routes** (stages 1 and 5 pointed at the wrong door) · **`session-builder-ui` route trace ~80%** · **legal docs still 13+/16+, must align to 18+** · **PAT token lapses ~5 Sep**.

> ### 🔴 PICK UP HERE — mid-stream, 15 Aug evening. `alongside-v360`. 52 gates green.
>
> #### The finding that matters most today
>
> **A device check found that four end-of-session moments built on 15 Aug reached ONE of eleven session views.** Graeme tested through a different door, correctly reported nothing appeared, and nothing was there to appear. Fifty-one gates stayed green — **every gate reads view SOURCE, none executes a view or knows which views a person can reach.**
>
> Fixed by **SHARED-1**: the moments moved to `data/session-moments.js`, rendered by `views/reflect.js`, which every session view already routed to (33 navigations from 10+ views). `verify-shared1.mjs` now fails if any session view reaches neither reflect nor renders them itself — it immediately caught `breathing-session` and `quiet-session`, which I would have missed.
>
> **Also live, shipped 15 Aug:** ASSESS-1 steps 1–2 (the difficulty ceiling can move — max served 3 → 6 on reassessment, and back down on an honest read down) · DECL-1 (a `ReferenceError` in the Skip button, live since W2-7, caught only on device) · CHAIN-1 · DIFF-1 · QUICK-1/2 · PB-1 · PACE-1/2 · TARGET-1/2 · STREAK-1 · MOOD-1 · DELIGHT-1 · ORIENT-2.
>
> #### 🔵 NEXT SESSION STARTS HERE
>
> **`alongside_blueprint_chapters_15aug2026_v1.md`** — agreed with Graeme in full, ready to build. Chapters vs Blocks as two presentations of ONE engine; hinge points replacing fixed chains; My Programme as a full-width row above the six tiles; weekly **focus** not weekly goal; countdowns only against a date the person supplied.
>
> Build order: **(1)** schema + `programme.presentation` · **(2)** My Programme view, reads what already exists, worth shipping alone · **(3)** hinge mechanic — needs ASSESS-1 step 3 first · **(4)** weekly focus · **(5)** Blocks · **(6)** event goals.
>
> Layout agreed: cog removed from the header (Settings is in the nav bar), My Programme full width above the grid, six tiles unchanged, "Unsure? Coach decides" below, **"Update check-in" keeps its text label** and additionally gets offered contextually after a door.
>
> #### 🟠 Blocked / needs Graeme
>
> - **Rehab front door** — Graeme's idea, and the strongest differentiation raised today. Name the CHAIN, never the condition; chronic (his own case is 9 months) routes to a professional as a redirect, not a refusal. Blueprint not yet written. **Needs a physio to read the spec before it ships.**
> - **Device check must be rewritten** against real routes before anybody retests. Stages 1 and 5 pointed at the wrong door. **[PARKED 16 Aug — see top block.]**
> - **`session-builder-ui` route trace incomplete** — the Cardio/Core/Strength door neither navigates to reflect nor logs a session directly. ~80% traced.
> - **Legal docs** still 13+/16+, must align to 18+.
> - **Token lapses ~5 Sep.**
>
> #### Process, and it is the through-line of the whole day
>
> **Nine faulty gate assertions of mine, plus three corrections on one item, plus eleven commits into an unreachable view.** Every one shares a root: **accepting a plausible result without confirming which code produced it.**
>
> Two rules that would have caught all of them:
> 1. A number is not executed evidence until you have confirmed which code produced it. Probe BEFORE the suspect line, not after.
> 2. A green suite is not evidence the app runs. **Nothing in the suite executes a view.** A device pass belongs in the rhythm, not at the end.

> ### 🟢 15 AUG EVENING — WAVE 3 AND PROGRESSION. `alongside-v357`. 49 gates green.
>
> **Wave 3 traced 2.16, 2.8, 2.6 and 2.4 full-surface.** The capability work holds: 2.8 was served 0 balance-demand and 0 floor-position exercises across 113, reached only because the balance question is asked universally — no age or condition trigger would have found her. Pacing fired on both her three-session days. 2.16's check-in panels went 45 → 18 across three weeks.
>
> | ID | What | Status |
> |---|---|---|
> | **QUICK-2** | The short check-in existed only in Settings, where 2.16 will never look. Coach now offers it once, on Home, after six check-ins | Shipped |
> | **DIFF-1** | Power Clean, Kettlebell Snatch and Turkish Get-Up all rated **3** — and `light`/`returning` cap at 3. A "light activity" user was being served Olympic lifts, 7 Power Cleans in 50 sessions. Six entries re-rated | Shipped |
> | **CHAIN-1** | **Zero** programmes declared `nextProgrammeId`, so after twelve weeks both routes were circular. Six now chain into three journeys of 24–36 weeks | Shipped |
> | **PROG-1** | Phase intensity reaches coach-proposal and not the session-builder door | **Attempted, reverted, unproven** |
>
> #### 🟠 Three corrections to my own reporting, same item, same evening
>
> Recorded in full because the pattern matters more than the item.
>
> 1. I reported **SILENT-1** — a throw swallowed inside session generation producing plausible numbers from broken code — and called it the most important find of the day. Injecting a throw shows it propagates cleanly. **It does not exist.**
> 2. I reported PROG-1 moved difficulty 3% and concluded progression cannot be delivered by preference over this library. **The block executed zero times; the 3% was noise.** The conclusion was never established, and I had written it into the file as fact.
> 3. I then reported the block was unreachable. **It runs nine times per session.** My probe sat immediately after the failing call, so I read silence as absence.
>
> **The rule that would have caught all three, and the nine faulty gate assertions before them: a number is not executed evidence until you have confirmed which code produced it.** Probe before the suspect line, not after.
>
> #### Open — needs Graeme
>
> - 🟠 **Chain routes** — I invented them. Product judgement, one line each to change.
> - 🟠 **The library question** — 393 of 551 entries at difficulty 1–2. Building a top end serves 2.6/2.7/2.15 and moves toward competing with strength apps on their terms. **Decide deliberately, not by accumulation.**
> - 🟠 **2.4** — why a self-directed person stays. She is in the named secondary market and is served as a beginner.
> - 🟡 **Legal docs** still 13+/16+, must align to 18+.
> - 🟡 **On-device pass** — nothing shipped today has been seen on a phone.
> - 🟡 **Token** lapses ~5 Sep.
>
> #### 🔵 NEW STREAM — ASSESSMENT. Blueprint written 15 Aug.
>
> Graeme, 15 Aug: *"There needs to be a better baseline assessment of fitness, and like a teacher would, milestone assessments to ensure the programme is the right fit."*
>
> **This is the keystone the progression work kept stalling on.** Three fields describe the person's level —  (frequency),  (safety),  (Settings-only) — and **none measures capacity, none can move.** The difficulty ceiling resolves from how often somebody says they exercise, and only changes if they edit Settings themselves.
>
> So a twelve-week programme cannot progress anyone: phases declare a climbing  under a ceiling that never moves. PROG-1 was the wrong end of the problem. **Reassessment is what makes twelve weeks mean twelve weeks.**
>
> It also answers 2.4. A self-directed person does not need deciding for; she may well want measuring — the one thing she cannot do for herself.
>
> Full spec: . Build order: schema + measuredLevel writing to fitnessLevel; baseline inside the first session; reassessment at phase boundaries; **then** retry PROG-1 against a ceiling that moves; then  and the filter library.
>
> **Library framing corrected by Graeme:** *"I'm adding so we can better serve, not compete."* The test is filter depth, not catalogue size — roughly 40-60 entries at difficulty 4-6, against 29 today. Same gap assessment exposes from the other side.
>
> #### Open — mine
>
> - 🟡 **PROG-1 retry.** Placement is fine, idea untested. Verify `getPhaseBias()` resolves from inside session-builder — probe BEFORE it.

> ### 🟢 15 AUG PM — THE FOUR UNBUILT SPECS. `alongside-v353`. 47 gates green.
>
> The would-they-tell-someone audit found four weak persona sentences. **Three of the four were specced and unbuilt** — a far better problem than not knowing what to do. All three are now built.
>
> | ID | Persona | Their sentence before | Agreed | Built |
> |---|---|---|---|---|
> | **PACE-1/2** | 2.8, dyspraxia + autism | *"I went too hard for two weeks and then stopped."* | 05 Jul | 15 Aug |
> | **QUICK-1** | 2.16, time-poor parent | *"It talks too much."* | 05 Jul | 15 Aug |
> | **PB-1** | 2.7, the runner | *"No PB tracking, so I use something else."* | 05 Jul | 15 Aug |
>
> **PACE-1/2 — proactive pacing.** Matrix decisions 4 and 4a. A third exercise activity in a day gets a warm check-in, once, never blocking a fourth. A weekly target set sharply above recent actual history gets named on Home, once a week at most. Mindful and Noticing activities are **uncapped entirely** — 2.11 enters through that door and warning her would be actively wrong. 2.8 was the only persona whose failure mode is **harm rather than indifference**.
>
> **QUICK-1 — the short check-in.** Matrix gap 8 and open question 6, which asked what stays non-negotiable when the coach compresses. Now answered and gated: energy and mood stay (what `detectBurnout()` reads), the pain question stays at **either** setting, and the coach still speaks first. Feeling word, sleep and variety compress. A stored preference, not a question — asking "have you got time?" daily would be the friction itself.
>
> **PB-1 — personal bests.** Matrix decision 2. Stored not derived, because `liftLog` evicts at 20 and a derived best would vanish. Only unambiguous metrics; `durationMins` deliberately excluded (longer is better for a plank, worse for a 5k). **Recorded even when hidden, shown only on request, Personal tier.** Flat line, no delta, and the gate asserts the CSS does not highlight it — a best styled as an achievement becomes a target to defend.
>
> #### Still open
>
> - 🟠 **2.4 — why a self-directed person stays.** *"I already know what I'm doing."* Not articulated anywhere. A positioning question, not a build one. **Needs Graeme, not a trace.**
> - 🟡 **Wave 3** — 2.16, 2.8, 2.6, 2.4, full-surface (Home, check-in, Progress, Wellbeing, upgrade), now against a product that has real answers for three of them.
> - 🟡 **Legal docs still say 13+/16+**, must align to 18+. Outside the repo.
> - 🟡 **`durationMins` as a PB** — needs a direction convention before it can be tracked.
>
> #### Process
>
> **Nine faulty gate assertions of mine in three days**, every one passing or crashing while testing nothing: a hardcoded `true`; three regexes matching an explanatory comment rather than code; a threshold set from assumption; a character class capturing an empty string; a fixture ending months in the past; a validation tested on write when it runs on load; and one that **threw a TypeError and produced no output at all**, which I nearly read as a pass.
>
> **A gate that crashes is not a gate that failed.** Reversal-testing caught every one. The rule that holds: a gate is not proven until it has been made to fail, and "no output" is not "green".
>
> Also: I invented a CSS class name (`settings-toggle__knob`; the real one is `settings-toggle__track`) and two goal ids that do not exist. Same fault class as the persona-fixture drift that has cost this project five times. Both now gated.

> ### 🟢 15 AUG — THE THREE AUDITS. `alongside-v350`. 44 gates green.
>
> The audits had never been run. Three waves of persona tracing had produced ~30 findings and **every one was a thing that was WRONG** — none was a thing that was MISSING, because absence does not throw and reads as correct when you execute it.
>
> #### The pattern, which matters more than any single fix
>
> Six findings. **Five were the same shape: written, reviewed, warm copy — or a stated design principle — that no user could reach.**
>
> | ID | What no user could reach | Evidence |
> |---|---|---|
> | **OPEN-1** | Three day-one coach openings. `else if (ageBand)` sat above `injury-recovery`, `return-to-fitness` and `feel-good`, and ageBand is asked of everyone | Four openings now verified distinct |
> | **STREAK-1** | The app promises "No streaks. No punishment for absence." in Settings and said **"Seven days in a row"** on a *count*. Seven check-ins over 102 days, longest run one day. Stored key was literally `streak-7`, and it said "Seven" at 14 and 21 too | Now count-based, dynamic, and says out loud that we do not count consecutive days |
> | **MOOD-1** | *"Last time you said you weren't sure you wanted to start — but you did, and you felt better after."* `moodAfter` is written to `activityLog` and read from `checkinHistory` — a different object. Three branches dead | Mirrored at `logActivity()`, the shared write path |
> | **TARGET-1** | A weekly target the person chose at step 12. `setAt`'s only writer was the **skippable** step 13, so "Twice a week" then "Decide later" left her own answer invisible | Step 12 now records the choice |
> | **DELIGHT-1** | A first session, recognised as a first. `renderDone()` was identical for session one and session fifty | Uses the territory they named at step 3 |
> | **ORIENT-2** | A coach line on Home. **Five of nine personas got `null`** — including 2.10, 2.15, 2.16 and 2.4 | Ten of ten now hear something |
>
> **The writing and the thinking are not the weak point. The wiring between them and the person is.** A defect trace found none of this in thirty findings, because every one of these paths executed perfectly while reaching nobody. Worth making the first question of a session, not the last.
>
> #### Also shipped, 14–15 Aug
>
> **W3-A** capability questions reachable (8 CAP items had sat behind an unrouted screen; `asked` was false for every live user) · **W3-A2** capability editable in Settings · **W3-B** `trainingIntent` writer — independence-capacity work 14.8% → 33.6% · **CARDIAC-1** exercise-clearance question, loaded-strength items 159 → 0 for an uncleared user while 372 items remain · **AGE-1** 18+ bands, one vocabulary replacing three · **W2-6** familiar variety 40% → 62% · **W2-7** `'less'` stopped meaning `'avoid'` (40% → 7%, not 0%) plus the post-skip offer and the "How you like things" panel · **WRITE-1** `lifestyle.stressLevel` gets its first reader · **CONTRACT-2/3** writer reachability traced to router entry points, lookup-table keys checked · **TARGET-2** reaching a chosen target closes the week rather than opening a demand.
>
> `views/onboarding/lifestyle.js` and eight orphaned pre-thread views deleted — 1,719 lines.
>
> #### Decisions taken
>
> - **D-2 cardiac:** scope is **Phase IV maintenance**, not treatment. The talk test was already in 13 entries. Clearance question added; a "no" is a redirect, not a refusal.
> - **D-3 neurodivergence:** **not** added to `CONDITIONS` — that list drives contraindication filtering and neurodivergence is not a movement contraindication. Preferences panel instead. The gate asserts they stay out.
> - **A1.11:** launching **18+**. Removes UK Children's Code obligations. Puts personas 2.2, 2.3 and 2.9 outside launch.
>
> #### Open, and now the highest-value work
>
> From the would-they-tell-someone audit — three of the four weak sentences are **specced and unbuilt**, which is a better problem than not knowing what to do:
>
> - 🟠 **Proactive Pacing (2.8)** — agreed 5 Jul, never built. **The only open item whose failure mode is harm rather than indifference.** WB 17 Aug.
> - 🟠 **Short-session path (2.16)** — matrix gap 8. She is in the tertiary market and currently served worse than personas the product is not aimed at. WB 17 Aug.
> - 🟡 **Basic PB logging (2.7)** — decoupled and specced, never built.
> - 🟡 **Why a self-directed person stays (2.4)** — not articulated anywhere.
> - 🟡 **Legal docs still say 13+/16+** — must be aligned to 18+. Outside the repo.
> - 🟡 **Wave 3** — 2.16, 2.8, 2.6, 2.4, full-surface. **After** the two builds above, or it re-confirms what 5 Jul already concluded.
>
> #### Process, recorded because it recurred
>
> **Six of my own gate assertions were faulty in three days**, all the same shape: a hardcoded `true`; two regexes that matched an explanatory comment rather than the code; a threshold set from assumption not measurement; a character class that captured an empty string; a fixture ending months in the past. Every one *passed* while testing nothing. Reversal-testing caught all six — a gate is not proven until it has been made to fail.

> ### 🟢 14 AUG — THE CAPABILITY SYSTEM IS LIVE. `alongside-v344`. 38 gates green.
>
> Two chats ran Wave 2 in parallel on 13–14 Aug and collided on version numbers twice. The second chat is now retired; this schedule and the codebase are owned by one thread again.
>
> #### The finding that reframed the week
>
> **Eight CAP work items sat behind a screen nobody could open.** The only writer of `capability.*` was `views/onboarding/lifestyle.js`, which was never registered in `router.js` and whose two inbound `navigate()` calls `sheet-manager.js` swallows to close a sheet. So `capability.askedAt` was `null` for **every live user**, `capabilityProfile().asked` was `false`, and six protective branches in `session-builder.js` never ran for anybody: `floorSafe`, `balanceSafe`, `needsSeated`, `legsUsable`, `legsLoadable`, `_capabilityUnrestricted()`.
>
> CAP-6b and CAP-7 — shipped 14 Aug from the six-persona trace — were correct fixes to states no live user could reach. Not wasted. **Pending.** They went live with W3-A.
>
> #### Shipped
>
> | ID | What | Evidence |
> |---|---|---|
> | **W2-1** | Difficulty ceiling extended to **cooldown**. Warrior III, Tree Pose, Half Moon and Boat Pose were being served to a sedentary user (ceiling 2) — the same pose and persona that caused the warmup fix on 11 Aug, one section right | 5 over-ceiling candidates → 0, section not starved |
> | **W2-2** | `proposalBias` cleared at check-in. Written only by `coach-reflection.js`, never cleared, so yesterday's bias described today | Reversal-tested |
> | **W3-A** | **Capability questions reachable.** Thread steps 9a–9d. `balanceWorry` asked of everyone and gating `chairRise`/`floorAccess`; `legPower` behind a non-`yes` chair answer; `bothFeet` not asked at all | 2.10: 0 floor-position and 0 balance-demand exercises in 30 sessions. 2.6: unrestricted |
> | **W3-A2** | Capability editable in **Settings**. The thread is forward-only, so a mis-tap was permanent. Blanking every answer clears `askedAt` | Both directions reversal-tested |
> | **W3-B** | `trainingIntent` gets a writer (step 9f). Had **none** — every user was `improve`, so `maintain` and `recover` were unreachable | Independence-capacity work **14.8% → 33.6%**; rehab-leaning **33.3% → 42.8%**, 60 sessions each |
> | **OPEN-1** | **Three day-one coach openings could never fire.** `else if (ageBand)` sat above `injury-recovery`, `return-to-fitness` and `feel-good`, and `ageBand` is asked of everyone. Written, reviewed copy no user has ever seen | Four openings now verified distinct |
> | **WRITE-1** | `lifestyle.stressLevel` gets its first reader, `coldStartBias()`. Step 10 asked a careful question and nothing looked at the answer | Off after 3 check-ins, downward only, never burnout |
> | **CONTRACT-2** | A declared writer must now **exist and be referenced from outside itself**. Declaring an orphaned file is what hid all of the above | Caught two more orphans immediately |
> | **CONTRACT-3** | Lookup tables keyed on a contracted vocabulary have their keys checked. The scan reads `x === "y"` and cannot see an object key — how `'returning'` stayed undeclared | |
>
> **`views/onboarding/lifestyle.js` is deleted** (564 lines), with its `sw.js` precache entry. `lifestyle.exerciseHistory` and `lifestyle.sleepQuality` retired — one writer, now gone, no live reader.
>
> #### Why the capability questions are split
>
> Reviewed against all sixteen personas. `chairRise` and `floorAccess` are right for 2.10 and **insulting to 2.3**, a national-standard 15-year-old sprinter. `balanceWorry` reads neutrally to everyone, so it is asked universally and gates the other two.
>
> **The gate is `balanceWorry` rather than age because age, activity and declared condition all MISS persona 2.8** — dyspraxia and autism, young, enthusiastic, not sedentary, and dyspraxia is not in `CONDITIONS`. She is the persona whose failure mode is a fall. Triggers are OR, so pride does not defeat them either.
>
> `bothFeet` is not asked: measured, the impact gate already works from `activityLevel` alone (active 35 impact exercises across 30 sessions, sedentary 0).
>
> #### Three process failures, recorded because they recur
>
> 1. **Two gate assertions passed against explanatory comments rather than code.** The `askedAt` reversal test stayed green with the write deleted. Same class as a gate after `process.exit()`. Both tightened to assert constructs.
> 2. **The localStorage fixture-drift trap, fifth instance.** `store.init()` **merges** with what is already there, so personas run in one process inherit each other's state. Every opening fixture resolved to the same branch until `localStorage.clear()` was added.
> 3. **A condition-filter finding was reported wrong** before being corrected: bare condition ids were passed where the live path resolves phase variants through `getActiveConditionIds()`.
>
> #### Open, with no owner yet
>
> - **W3-A2 follow-up** — none. Closed.
> - **D-2** the cardiac promise · **D-3** neurodivergence in `CONDITIONS` · **D-5** two doors, two amounts of listening
> - **A1.11** the 13+/16+ contradiction — blocks tracing personas 2.2, 2.3 and 2.9 entirely. **Legal, for Natalie, not a build item.**
> - **Wave 3** — 2.16, 2.8, 2.6, 2.4, full-surface (Home, check-in, Progress, Wellbeing, upgrade), not sessions only
> - **The three audits that have never been run** — first ninety seconds, moment-of-delight inventory, would-they-tell-someone. See `alongside_plan_route-to-exceptional_14aug2026_v1.md`

> ### 🟢 WAVE-2 VERIFICATION TRACE — six personas. `alongside-v339`. 37 gates green.
>
> Six people played forward three weeks each through the real engine: **2.12, 2.15, 2.10, 2.11, 2.13, 2.14**. Two to verify the day's fixes, four never traced before.
>
> #### The fixes landed
>
> | | Before | After |
> |---|---|---|
> | **2.12 Danny** | Pelvic-floor squat ×4, Nordic curl in session one | Zero rehab content. Hardest difficulty **2** — exactly his ceiling |
> | **2.15 Priya** | No squat, no deadlift, seated arm cycling ×9 | **Barbell Back Squat in 8 of 9 sessions.** One seated item in three weeks |
> | **Coach voice** | One sentence forever | **8 distinct opening lines in 9 sessions**, all six personas |
>
> **A matrix gap open since 05 Jul is closed.** 2.13 (ADHD, novelty) got 42 distinct exercises, most-repeated ×5. 2.14 (autistic, predictability) got 31 distinct, most-repeated ×9. Same engine, opposite shapes, both coherent. The matrix called this *"a real design tension, not just a missing field"*.
>
> #### Three findings, all the same shape
>
> **One capability answer being read as a wider limitation than the person gave.**
>
> - **CAP-6b** — `impactSafe` was in `_capabilityUnrestricted()`. Persona 2.12 answered "no" to both feet leaving the ground — a statement about **impact** — and received **fourteen** seated items in nine sessions. Now one. Mine, from that morning.
> - **CAP-7** — `needsSeated` fired on `floorAccess === 'no'` and restricts to seated-only. Persona 2.11 was **confined to a chair by an answer about the floor**. Her main pool: 157 raw → 87 → 62 → 56 → 14 → **7**. Nine sessions from seven exercises. 15 distinct became 29.
> - **ORIENT-1** — `_buildCoachLine()` needed history for every branch, so a new user got **nothing** on a screen led by three workout doors. Nothing on Home had ever read `goals`. Persona 2.11's gap since 05 Jul — *"is the Noticing Hub a genuine front door"* — answered: **it was not.**
>
> **ORIENT-1 was deliberately not fixed by reordering the doors.** That would have fixed 2.11 by breaking 2.14, for whom a Home screen that rearranges itself is precisely aversive. The grid is fixed for everybody and the coach speaks instead. `verify-tier.mjs` now asserts `HOME_DOORS` is never sorted by preference, so the fix cannot later be "improved" into the thing that breaks her.
>
> #### SEATED-GAP — content, not code
>
> The seated-dependent user got 12 distinct exercises in nine sessions against 33 for an able-bodied beginner. Diagnosed per category: hip-hinge 0, horizontal-pull 0, hip-flexor-stretch 0, spinal-decompression 0. Six entries added, all needing nothing but a chair. **12 → 16.** Not parity, and further gain is more content rather than more code.
>
> **loaded-carry, balance-work and power remain 0 and are deliberately not filled.** Genuinely unavailable seated; token versions to make a number rise would be worse than an honest gap.
>
> #### 🟠 Still open, and all Graeme's
>
> - **Cauda equina line** — applied; confirm, or have the safeguarding reviewers see it first
> - **Dose-tier architecture** — the clinician's proposal to decouple movement skill from tissue load
> - **P6, P10, P11** — three approved Personal reads withheld. P11 needs destinations
> - **HMRC · three safeguarding reviewers · ICO**
> - **Supabase → Stripe** — two deep, not three
> - **Four of the six personas have only had their SESSIONS traced.** Home, check-in, Progress, Wellbeing and upgrade are untraced for 2.10, 2.11, 2.13, 2.14. Both fully-traced personas surfaced most of their findings *outside* the session engine. `alongside_persona_trace_brief_wave2_13aug2026_v1.md` exists for this and is deliberately unleading.

> ### 🟢 13 AUG, FULL DAY CLOSED. `alongside-v334`. 37 gates green on a fresh clone.
>
> `sw.js` v314 → **v334**. Twenty deploys, every one verified against a fresh clone. Gate suite 30 → **37**.
>
> #### Closed since v189
>
> | Item | Outcome |
> |---|---|
> | **HOME-1** | Weekly denominator shows only if `setAt` is non-null. The target stays for anybody who sets one — removing it outright would have been the opposite error |
> | **Milestone badges** | Fourteen count-thresholds removed, 47 → 33. Phase and week markers kept: a milestone marking progress through the PROGRAMME describes the plan; one marking accumulated volume grades the person |
> | **EMP-4** | Empathy cadence now time-aware as well as session-aware. Persona 2.12 goes 1 prompt → 2; a once-a-fortnight user meets the arc in week four rather than week six; 2.15 unchanged |
> | **DEDUPE-1** | 14 duplicate exercise names resolved, 556 → 545 entries. Three different problems wearing one label, only one of them an actual duplicate |
> | **D3** | Allocation preset persists. Two of D3's three items were already built — verified, not assumed |
> | **NAV-8** | Two `NAV_MAP` entries pointed at the wrong tab, in opposite directions. Also closed a flag open since 13 Jun |
> | **VOICE-2** | 108 approved coach lines. One fixed sentence per session type became pools of eight |
> | **VOICE-3 / D2** | Nine Personal reads, each a `{text, when}` pair gated on a real signal. Ungated lines fail closed |
> | **SAFEGUARD-1** | Eleven stop lines, eleven phrasings, now one standard in two urgency tiers |
> | **C1b** | **COMPLETE.** All 94 rehab entries individually written and re-rated |
>
> #### The two most consequential findings of the day
>
> **1. `difficultyLevel: 1` on all 94 rehabilitation entries.** Not absent — present and wrong, which defeats `_difficulty()`'s safe default (that only fires when the field is missing). Difficulty IS the capability ceiling: `ceilingCap = 2` protects somebody who cannot rise from a chair unaided, `WARMUP_MAX_DIFFICULTY = 4` gates warm-ups. 94 entries claiming to be the easiest thing in the database, in the library most likely to reach people with the least capacity. Now `{1: 36, 2: 31, 3: 21, 4: 4, 5: 1, 6: 1}`.
>
> **2. A clinical review corrected three things that would have shipped.** Achilles: where the pain SITS changes the exercise — insertional versus mid-portion, and dropping below step level compresses the insertion. Neural flossing: 30 reps is too high for an irritated nerve root, corrected to 10–12 across three entries, and **the database already disagreed with itself** — a near-duplicate said 10 and nobody had noticed. Pelvic floor: hypertonicity is the thing that matters, and more contraction makes it worse.
>
> #### 🔴 The cauda equina decision — applied, and Graeme may want reviewers on it first
>
> The clinician flagged a red flag the app **cannot detect from any signal it holds**: cauda equina develops DURING a course of ordinary back exercises rather than being a state somebody arrives in. There are no earlier signals for the coach to have missed. It is now a stop line on McKenzie Press-Up, in the standard register — no condition named, no 999, no A&E, and the only thing carrying the urgency is the word *today*.
>
> **The question for the safeguarding reviewers is not "did we warn enough".** It is: *is there anything else in this product the app cannot possibly detect?*
>
> #### Still open, and all of it Graeme's
>
> - **Cauda equina line** — applied; confirm or have reviewers see it first
> - **Dose-tier architecture** — the clinician's proposal to decouple movement skill from tissue load. Not applied; it is a design decision
> - **P6, P10, P11** — three approved Personal reads withheld, documented in `personal-reads.js`. P11 needs destinations
> - **HMRC registration · three safeguarding reviewers · ICO**
> - **Supabase → Stripe** — two deep, not three (see the correction above)
>
> #### The transferable lesson, stated once
>
> **Ten defects today were found only by executing, never by reading**, and every one of them read as correct. A filter testing an overwritten field. A guard on a field that defaults truthy. A `const` shadowing a function of the same name. A temporal dead zone. A gate appended after `process.exit()`. A coverage test simulating one context. A deletion script that stripped two lines per entry and reported success. **jsdom is installed in the trace harness and real click-through verification is now the standard.**
>
> And four fixture-drift errors — invented goal id, `legPower: "yes"`, module-state leakage, `fitnessLevel: "beginner"`. Every one produced a plausible wrong answer. **Any fixture field must be checked against a real writer before conclusions are drawn from it.**

> ### 🟢 13 AUG — END OF DAY. `alongside-v326`. 35 gates green on a fresh clone.
>
> `sw.js` v314 → **v326**. Twelve deploys, each verified against a fresh clone. Gate suite 30 → **35**.
>
> **Every finding in the Wave 1 Pass 4 persona trace is closed except five, and those five are decisions rather than defects.** See the two tables below.
>
> #### Closed today
>
> | Finding | Closed by |
> |---|---|
> | Rehabilitation library reaching people with no condition (16% of Danny's pool) | **C2** — 61 of 94 triaged general-purpose, approved by Graeme |
> | Capability gating only ever subtracting, so a powerlifter got seated arm cycling ×9 | **C3 / CAP-6** |
> | Gym-equipped strength user getting no barbell squat and no deadlift | **FIX-2** |
> | Library ungated — silent downgrade to Full Body 30 | **TIER-B** |
> | Upgrade page a 63-line stub publishing the tier bypass | **A1 + A2** |
> | Export counting partials while every on-screen count did not | **E2** |
> | Difficulty prompts firing on people with no difficulty | **E1** |
> | One fixed coach sentence per session type, forever | **VOICE-2** — 108 approved lines |
> | Free reaching the twelve-week programme engine | **TIER-C** |
> | Progress differing by length, not kind | **TIER-E** |
> | Rehab copy assuming a clinician exists (94 entries) | **C1** |
> | Yoga, Pilates and sport-conditioning content in barbell sessions | **FIX-1 + FIX-5** |
> | Personal-tier reads asserting facts with no data behind them | **VOICE-3 / D2** — nine reads, each gated on a real signal |
> | Wellbeing and Noticing as one destination under two names | **TIER-F** |
> | `in-step.js` header claiming Personal tier | **E3** |
> | Reserved warm-up slot ignoring `less` preferences | **SEL-1** |
>
> #### 🟠 Still open — and why
>
> | Item | Status | What it needs |
> |---|---|---|
> | **HOME-1** — "1 of 3 this week" from a target nobody chose (`weeklySessionTarget: 3`, `setAt: null`) | Untouched | **Graeme's decision.** The count is right; the question is whether a denominator nobody agreed to belongs in a product whose north star is "joy at the gap" |
> | **Milestone emoji badges** — 33 across `programmes.js`, e.g. "10 sessions completed ⭐" | Untouched | **Graeme's decision.** The streak was removed deliberately; count-based badges are a milder member of the same family |
> | **EMP-4** — the empathy arc fired **once in three weeks** for Danny (`EMPATHY_MIN_SESSIONS 3`, `EMPATHY_BASE_GAP 4`) | Untouched | **Graeme's decision.** Cadence is calibrated in sessions, and the personas this product exists for accumulate sessions slowly. The mechanism most identified with the product's purpose is nearly invisible to them |
> | **C1b** — all 94 rehabilitation entries still share ONE identical `watchOut` block | Logged | Content stream, not a build session. A generic "what to watch for" teaches nothing and trains people to stop reading the block |
> | **14 duplicate exercise names** (World's Greatest Stretch, Romanian Deadlift, Burpee, 4-7-8 Breathing…) plus two near-identical knee-extension entries | Logged | Content cleanup. **All pre-existing** — verified none were introduced by the 13 Aug renames |
> | **P6, P10, P11** — three approved Personal reads withheld | Documented in `personal-reads.js` | P6 needs a divergence definition that would duplicate the Progress read; P10 needs a definition of "strongest" that would breach P4 by grading sessions; **P11 needs destinations to exist** |
> | **D3** — Personal enrichment for 2.15: persist the allocation preset, *ask* about `sessionVariety` rather than defaulting it, lift log as memory | Unstarted | Now unblocked — C3 and C4 have landed |
> | **Noticing Hub / In Step as a front door** | Never traced, four passes running | Persona 2.11's entry route. Neither Wave 1 persona would ever go there |
> | **`reflect.js`** | Partially traced | The empathy arc was traced end to end; the rest of the reflection flow was not |
>
> #### The transferable lesson of the day
>
> **Six defects were found only by executing, never by reading.** A filter testing `ex.category` that excluded nothing because `category` is overwritten upstream. A guard using `!!store.get('activityLog')` on a field that defaults to a populated object. A `const pickFrom` shadowing the function of the same name. A temporal-dead-zone reference. A gate appended after `process.exit()`. A pool-coverage test that failed on correct behaviour because it simulated one context.
>
> Every one of them read as correct. **jsdom is now installed in the trace harness** and real click-through verification is the standard, not source reading.
>
> #### Gates fixed that could not catch what they guarded
>
> - `verify-sw1.mjs` had the **date hardcoded** — it would have gone silently blind the moment the calendar moved, while still showing green.
> - `verify-count1.mjs` asserted `via >= 2`, a **floor**. Three reads, two compliant, gate green while the export miscounted for weeks. Now: zero non-compliant reads.
> - `verify-nav5.mjs` pinned a literal panel **ordering**, so a fourth panel failed a check about the other three.
> - `verify-empathy.mjs` test 6 simulated **one context**, so prompts requiring difficulty could never fire. Now simulates five different lives.
>
> **A gate that has only ever passed is unproven.** Every new assertion today was reversal-tested.

> ### 🟢 C1 and C3 SHIPPED — `alongside-v321`. 33 gates green.
>
> **C1.** All 94 rehabilitation entries shared one identical `watchOut` block and one identical `load` line, both assuming a clinician exists. External help is now **offered, never presumed** — the wording works for somebody mid-physio, somebody who has never seen anyone, and somebody who cannot afford to. The third is not hypothetical: Graeme's own About copy says *"I couldn't afford a physio."* `coach-proposal.js` v20 names the coach's limit when severe pain is flagged, in Graeme's own framing. No crisis language on that path — a painful joint is not a safeguarding flag, and borrowing that wording blunts it where it is needed.
>
> **C3 / CAP-6.** All 38 `seated.js` entries carry `adaptive: true`. Selection de-prioritises them for anybody ASKED and cleared on every axis. **Preference, never exclusion** — reversal-tested: turning it into an exclusion drops a seated user to five exercises, the exact CAP-4 regression.
>
> **🔴 THE BUG UNDERNEATH C3, and the most transferable finding of the day.** The rule went in and persona 2.15 *still* opened with Seated Arm Cycling. The reserved cardio-warmup slot picks at random from its own pool and consults **none** of the preference rules — not `less`, not adapted, not continuity — while sixteen non-adaptive options sat unreachable. It also declared `const pickFrom = ...`, **shadowing the selector function of the same name**, so at the call site it read exactly as though it were using it. Three separate passes over this file missed it for that reason.
>
> **🟠 SEL-1 — NEW, open.** That slot still ignores `less` preferences. Somebody can say "not a fan of this" and keep receiving it as their session opener. Same root cause, wider than C3's file scope. Worth a sweep for other selection paths that bypass `pickFrom`.
>
> **Three fixture-drift errors in two days — a pattern, not bad luck.** Invented goal id (`"strength"` for `"get-stronger"`) silently suppressed the rationale arc; `legPower: "yes"` where the field takes `full|limited|none` made a fully capable persona read as restricted; and the trace harness leaked store state between runs because `session-builder.js` imports the store unsuffixed. **All three produced plausible-looking wrong results.** Any future fixture must be validated against the real field vocabulary before conclusions are drawn from it.

> ### 🔴 DATE CORRECTION, 13 Aug — "the November thing is not real"
>
> Graeme, 13 Aug, verbatim. **November 2026 is not a real revenue date.** It appears in the June pricing model as a modelling assumption and has been repeated in several sessions — including twice by me today — as though it were a commitment. It is not one, and no plan should be sequenced against it.
>
> The £49.99 launch rate holding "to the end of November 2026" remains the stated annual price condition and is unaffected. What is withdrawn is the idea that revenue *starts* then.
>
> **⚠️ CORRECTION TO THIS ENTRY, 13 Aug (later the same day).** The line above originally read *"Appendix A triage → Supabase schema → Stripe. Three deep, none started."* **That was false, and I wrote it into this document myself, in v187, while the correction already sat at line ~2481 of the same file** — recorded on 04 Aug after a direct re-check. Appendix A closed on **03 Aug 2026**: all 18 unclassified fields triaged (11 live, 5 dormant, 2 dead), `Schema.md` v1.9 → v1.10. It surfaced two real bugs, both since fixed — `userTier` had no writer and its one reader always evaluated false, locking Personal-tier options for paying users; `proposalBias` was written and never read, so the coach decided somebody needed a lighter session after severe pain and nothing looked.
>
> I repeated a stale blocker several times across 13 Aug and told Graeme it was his single highest priority — on the day I was arguing that a tier check does not prove a feature exists and a green gate does not prove it guards anything. Same fault, applied to my own notes.
>
> **The real dependency chain is Supabase schema → Stripe. Two deep, and the schema work that would have blocked it is done.** The revenue path is materially shorter than this document said this morning.

> ### 🟢 13 Aug, second build block — THE WHOLE TIER MODEL IS NOW REAL
>
> `sw.js` v317 → **v319**, cache `alongside-v319`. All **32** gates green on a fresh clone, including new `verify-tier.mjs` (14 checks).
>
> **TIER-A/B/C/E/F all shipped.** The free boundary is now where `alongside_tier_boundary_12aug2026_v1.md` says it is, for the first time. Three surfaces had been reaching paid session shapes on free — the Library (zero tier awareness), two Home doors, and the entire twelve-week programme engine — each looking perfectly correct in isolation.
>
> | | |
> |---|---|
> | **TIER-A** | Mobility & Conditioning and Yoga & Pilates gated. **Not a safety regression** — severe-pain override, Care mode and the coach proposal still deliver gentle movement to free users. They lose *choosing* it, not access to it. Written into `today.js`'s header so nobody re-derives it |
> | **TIER-B** | Library gated. Tier is **data on the definitions**, not branching in the render — a future card is one field, and omitting it fails safe. Free keeps Full Body, Cardio (logging), Mindful practice, Prescribed, Coach recommends |
> | **TIER-C** | Programme engine gated, with one exception: somebody who started on Personal and lapsed **finishes their programme**. Ejecting them mid-plan punishes a billing state, not a choice. **Closes D-2** |
> | **TIER-D** | No code. The exercise database is deliberately **never** tier-gated — capability decides by what is safe, not what is paid. Gated *against* in `verify-tier.mjs` so it cannot be re-litigated in code |
> | **TIER-E** | **Progress differs in kind, not length.** Free is a fortnight and *records*; Personal *reads* |
> | **TIER-F** | Nav tab and the `sr-only` heading renamed to Wellbeing. Same route as the Home door — two names read as two features |
>
> **Statement 4 restored to the upgrade page.** *"Your programme builds"* was withheld that morning because the engine had no tier check; TIER-C made it true. Four statements again, all four true.
>
> **Three faults caught by rendering rather than reading — the transferable lesson of the block:**
> 1. A second silent downgrade in the type-picker click handler, byte-identical to the Library one. **Found by the new gate, not by me.** Dead in practice, but dead code performing a forbidden behaviour is an example somebody copies.
> 2. The first programme guard used `!!store.get('activeProgramme')` — that field **defaults to a populated object**, so it would never have fired. `store.hasActiveProgramme()` is the real test.
> 3. `activeWindow` was a single shared default, leaving a Personal user on 14 days with a tab strip offering only 30 and 90 and **no tab selected**.
>
> **jsdom is now installed in the trace harness.** Real click-through verification of rendered output, at both tiers. This is how all three of the above were found; none was visible in the source.

> ### 🟢 13 Aug build session — A1, A3 and A2 SHIPPED
>
> `sw.js` v314 → **v317**, cache `alongside-v314` → **`alongside-v317`**. Three deploys, each verified against a fresh clone. All **31** gates green (30 plus new `verify-upg2.mjs`).
>
> **The paywall is now a paywall.** The product states a price for the first time. Every locked surface in it — six session types, three durations, the 90-day tab, the export block, the In Step door — now arrives somewhere real instead of at a stub telling people to triple-tap the version number.
>
> **Four gate faults found and fixed while building, all pre-existing:**
> 1. `verify-sw1.mjs` had the date **hardcoded**. It would silently stop guarding the moment the calendar moved, while still showing green. It failed a correct v315 bump for exactly that reason. De-pinned.
> 2. `verify-nav5.mjs` asserted a literal panel **ordering**, so adding a fourth About panel failed a check about the other three. Now tests membership and routing.
> 3. `verify-css.mjs` caught `.upgrade-cta` used with no rule. Class removed rather than a rule invented to satisfy the gate.
> 4. Gold as **text** fails WCAG AA on this product's card surfaces — measured 3.68:1 on `--color-bg-card`, 3.09:1 on `--color-bg-hover`. Caught before shipping. `verify-upg2.mjs` now enforces it.
>
> The recurring shape: **a gate that has only ever passed is unproven.** Every new assertion this session was reversal-tested.

> ### ⚠️ WORKING RULES — added 12 Aug 2026 after Graeme raised reliability
>
> Graeme, 12 Aug: *"I need you to be so much more reliable and better... it raises questions for how reliable you are."* He was right, and the cause was diagnosable rather than vague.
>
> **The fault: answering from recall instead of from source.** In Step's tier was quoted back to him from a *chat summary* — stale by construction — while the current decision sat in `alongside_destination_architecture_12aug2026_v1.md`, one of the two documents this prompt names as required reading. Same root cause as re-raising his approved grounding texts and the settled yoga decision.
>
> **Compounding habit: manufacturing open questions.** Responses ended with "still open" lists to appear thorough. Several items were not open. That does not demonstrate rigour — it offloads verification onto him, which is backwards.
>
> **Two rules, checkable rather than aspirational:**
> 1. **Nothing enters an open-items list unless verified open in that same turn.** If it cannot be confirmed against the repo, it does not get listed.
> 2. **The repo beats memory, always.** Chat summaries are not a source. `grep` costs three seconds.
>
> **And a mechanism, because stated rules are exactly what failed:** `tools/verify-decisions.mjs`. See below.

**⚠️ Location:** the canonical copy of this document is `Documents/Admin/master_schedule.md` in the `alongside-app` repo, not project knowledge. If the repo and a project-knowledge copy ever disagree, the repo wins. This project-knowledge copy remains a searchable snapshot only. `Admin/Past MS/` in the repo holds every superseded version by date.

---

## What happened in the 12 Aug build session (recorded at v150)

**One very long session. 62 commits, 43 files, ~12,900 lines added. `sw.js` v235 → v253, cache `alongside-v253` → `alongside-v263`. Exercise database 461 → 556.**

v149's standing recommendation was *stop building, run the device pass*. That is not what happened, and the reason is worth recording honestly: Graeme opened the app, found the exercise cards had no guidance, and every subsequent finding came from following that thread. The session was driven by use, not by plan.

**On-device confirmation — corrected 12 Aug (v151).** Earlier versions of this document repeatedly said "none of it is on-device confirmed", which was wrong and unfair. Graeme has been testing throughout and sharing screenshots in other chats — the exercise-card guidance gap that drove this entire session came from him opening the app. The accurate claim is narrower: **these specific changes have not been confirmed against the persona paths they were built for.**

**The agreed sequence is Graeme's, and it is deliberate:** trace it clean through code first, fix, re-trace, and only then verify on screen. His reasoning — using the product himself mid-build pulls the work onto tangents and away from the thing being fixed. Claude should not push for a device pass ahead of that sequence.

### The pattern that ran through the whole day

The same defect appeared **eight times in eight different costumes**: content that exists, is correct, is written to standard, and that nothing in the product can ever select.

| # | Instance | Scale |
|---|---|---|
| 1 | Equipment vocabulary mismatch | 92 of 124 equipment exercises unreachable for every user |
| 2 | Difficulty ceiling capped at 3/10 | 14 exercises above every possible ceiling |
| 3 | Private exercise pool in `session-builder.js` | 139 practice entries + entire yoga library invisible |
| 4 | Loaded carries | All 6; no category selected `movementPattern: carry` |
| 5 | Cardio warm-up tags | 2 of 4 machine warm-ups untickable |
| 6 | Balance board | Content and equipment both present, no route |
| 7 | Contraindications naming non-existent conditions | 13 safety exclusions that never fired |
| 8 | Category coverage | 85 of 544 exercises — 15.6% of the database |

**Every one was found by a person using the product or by a persona trace. None was found by the code.** That gap is now closed by a permanent audit — see INF-AUDIT below.

### Streams completed

**CON-1 → CON-9 — exercise content consolidation.** Single registry (the parallel copy in `js/data/exercises.js` is now a shim). Equipment vocabulary resolver. Exercise Entry Standard written, with `watchOut` and effort-relative `load` added and backfilled across all 556 entries. New `gym.js` (machines, conditioning, cable and machine strength, loaded core, medicine ball, balance, plyometrics). Private pool retired. Equipment became a preference in selection, not only a permission — gym Full Body went from 0–1 equipment exercises out of 13 to 11 of 13.

**CONT-1 / CONT-2 — the app now remembers what you did.** Every session view wrote `exercisesCount: 3` — a number — and never which exercises. That single absence is why selection had to be `Math.random()` over 500+ exercises, and therefore why there was no progressive overload, no skill acquisition (making the whole `watchOut` library decorative), and no familiarity. New `exerciseHistory`, and continuity-aware selection bounded by a 21-day recency window, an 8-session mastery ceiling and a variety preference (`sessionVariety`).

**CAP-1 → CAP-5 — the capability screen.** Answering "if we are not age restricting, how do we ensure the appropriate level for that user?" The instrument was wrong, not the policy: *how active are you* measures frequency, not capacity. Four questions replace it, three-state so a wheelchair user can answer "No" to the chair question rather than being forced into "not easily". `legPower` added as a separate axis after a trace found a wheelchair user served seated *leg* exercises. All 556 entries tagged `position` / `impact` / `balanceDemand`. New `seated.js`, 38 entries.

**The coach explains the programme.** New `session-rationale.js`. Opening, per-section purpose, and a longer arc — connected to the person's stated goals and training intent. Progression is **invited, never directed**, reads the day (a flare invites less, a low-energy day invites the same), and never states a number.

**Graeme's six UX items**, all shipped: duplicate time question removed, check-in scroll and pacing fixed, in-card performance notes generalised to what each exercise actually produces, "Not a fan" control, coach rationale, empty-session guard.

**Navigation and integrity sweep.** Three routes pointed at view files that had never been written. `about` removed, `community-impact` and `annual-reflection` built, front doors added.

---

---

---

## 🔬 Persona tracing — status at v184 (pass 4 complete, 13 Aug)

| Pass | Date | Outcome |
|---|---|---|
| First | 11 Aug | PT-1 to PT-10. Three deliverables in `Admin/` |
| Second | 11 Aug | PT-11 (fourth private exercise pool), PT-12 (reader-without-writer sweep) |
| Third | 12 Aug | C1–C4 + A1–A3. **All shipped.** Report in `outputs`, not yet filed to `Admin/` |
| **Fourth** | **13 Aug** | **Full three-document set produced, narrative included. Nine findings. See below.** |

**The owed narrative is delivered.** `alongside_persona-wave1-pass4_narrative_13aug2026_v1.md`, plus technical report and plain-language summary, same date. Personas 2.12 (Danny) and 2.15 (Priya), three weeks each, played forward through the real engine under a controllable clock so recency windows behaved as they would live.

**`reflect.js` — partially traced.** The empathy arc was traced end to end and produced EMP-3 and EMP-4 below. The rest of the reflection flow was not. Still owed.

**⚠️ Wave 2 selection criterion REVERSED on evidence.** v151 said "least data given to the app" was confirmed, and nominated persona 2.5. Pass 4 found the opposite. Danny (blank slate) surfaced the single most serious finding, but Priya surfaced **more**, and for a worse reason: she gave the app four strong signals — full gym, fully capable, `get-stronger`, four sessions a week — and every one sat inert. A graceful fallback is a healthier failure than present-but-unused data. **Wave 2 should be persona 2.3 (national-standard sprinter) or 2.9 (academy footballer).** 2.5 still deserves a pass as a *safety* trace — declared cardiac condition, medical-review path — but not as a capability trace.

**Still never traced after four passes:** the Noticing Hub and In Step as a genuine front door (persona 2.11's entry route). Neither Wave 1 persona would ever go there.

**Fixture note — resolved.** Fixtures now carry `capability{}`, `trainingIntent`, `sessionVariety` and `legPower`. One further trap found: goal IDs must come from `js/data/goals.js`. An invented id (`"strength"` rather than `"get-stronger"`) silently suppresses the rationale arc and produced one wrong reading before it was caught.

---

## 🔵 REMEDIATION BLUEPRINT — Trust, Tier & Voice. Opened 13 Aug 2026.

Source: `alongside_blueprint_trust-tier-voice_13aug2026_v1.md`. Five streams, ten sessions, sequenced so touch-once holds. `js/session-builder.js` is wanted by four separate streams — that is four separate blocks, each grounding against the live header first.

### Decisions

| ID | Decision | Status |
|---|---|---|
| **D-1** | Price is **£7.99/month, £49.99/year** (launch, to 30 Nov 2026; £59.99 Year 2+; beta £39.99/yr). | 🟢 **CONFIRMED by Graeme, 13 Aug.** |
| **D-2** | Free tier must not reach premium session shapes through the Library. | 🟢 **Direction confirmed 13 Aug.** Exact boundary pending — see LIB-BOUNDARY. |

**D-1 — CLOSED, 13 Aug.** £7.99/month, £49.99/year. Anything anywhere stating otherwise is retired and safe to ignore.

**⚠️ CORRECTION TO THIS SCHEDULE, 13 Aug.** An earlier v185 entry claimed `build-new-habits/website` publishes £9.99/£89. **That was wrong.** The live site was checked directly: `upgrade/index.html` renders £7.99 and £49.99 and has since it was built from the locked architecture. The £9.99 figure came from a March-era file in project knowledge, not from the site repo — a stale copy read as if it were live, which is exactly the failure this project's own ground-truth rule exists to prevent. **WEB-PRICE is withdrawn, not completed: there was never anything to fix.**

**Retired figures banded rather than deleted, 13 Aug.** Four Archive documents quoting £9.99/£89 now carry a "SUPERSEDED PRICING — SAFE TO IGNORE" banner at the top, naming the confirmed figures and their source. Deliberately not edited in place: the reasoning and research in them still stand, and keeping the old numbers visible under a banner leaves the thinking that produced the change legible. Files: `Alongside freemium model.md`, `Alongside market research.md`, `Alongside paywall codes feedback.md`, `Alongside build schedule.md`.

**🟠 LIB-BOUNDARY — awaiting Graeme.** His steer: free is the Full Body coach session and wellbeing, not the Library. Four Library categories carry things the 8 Mar freemium document lists as **permanently free on ethical grounds**: Prescribed (physio compliance — "a health issue, not a premium feature"), Mindful practice (breathing, journal, mindful movement, rest day), Coach recommends, and the activity Log. Locking the Library as a *screen* would paywall all four. Recommendation is to lock by *card*, not by screen. Needs his yes before B1 builds.

### Stream A — the paywall is not a paywall yet

| ID | Task | Priority | Status | Week |
|---|---|---|---|---|
| **A1** | Dev-panel instruction removed from user-facing copy. `DEV_PANEL_ENABLED` gates markup **and** listener. Two `verify-decisions.mjs` checks, both reversal-tested. | 🔴 P1 | 🟢 **Completed 13 Aug** | w/c 10 Aug |
| **A2** | Real upgrade page shipped. `upgrade.js` v4, new `css/components/upgrade-page.css`, `main.css` v22, `verify-upg2.mjs` (9 checks). | 🔴 P1 | 🟢 **Completed 13 Aug** | w/c 10 Aug |
| **A3** | `about-plan` panel live in Settings, price stated, symmetrical for paid users. `settings.js` v22, `settings.css` v7. | 🟠 P2 | 🟢 **Completed 13 Aug** | w/c 10 Aug |

**🔴 A2 raised a new problem, and it is the most important thing on this page.** The upgrade architecture's four "what changes" statements were written 09 Jul against an *intended* tier boundary. **Two of them describe things the free tier already has**, checked against live code 13 Aug rather than assumed:

| Doc statement | Live reality |
|---|---|
| *"Your exercise library opens fully — every movement available"* | **No tier gate on the exercise database anywhere.** `grep isPremium()` across `js/` returns `session-builder-ui.js`, `in-step.js`, `settings.js` only. Difficulty is capped by the **capability** screen, not by tier. |
| *"Your programme builds — week on week, phase by phase"* | `gym-programme.js` and `data/programmeEngine.js` contain **no tier check at all**. Free reaches the full twelve-week engine via `library.js:106`. This is D-2. |

The page therefore ships **three** true statements, not four, and the fourth slot is deliberately empty. `STATEMENTS` in `upgrade.js` is a list so restoring it is one line.

**🟠 EX-TIER — new, needs Graeme.** Is the exercise library meant to be tier-gated at all? The 09 Jul doc says free is "difficulty level 1 only"; the live app has no such gate, and the capability screen now does that job properly and more humanely. Recommendation: **leave it ungated and retire the doc's line** — capping a free user's exercises by tier, when capability already caps them by what is safe, is the artificial crippling the free tier is explicitly not meant to do. But it changes what Personal is worth, so it is a decision, not a fix.

**Why A1 exists.** `js/views/upgrade.js:44-47` told every user: *"use the dev panel to switch tiers. Triple-tap the version number."* Every locked feature routes there, so the most-visited conversion surface published the tier bypass. The panel itself is correctly hidden and is a legitimate tool — the fault was one paragraph advertising it.

**Why A3 exists.** Traced across three weeks: a free user meets Personal *only* as a padlock on something already denied. Never as a description. For a persona defined by decision paralysis, a padlock is not information.

### Stream B — the Library gives away what the tier picker protects

| ID | Task | Priority | Status | Week |
|---|---|---|---|---|
| **TIER-B** | Library gated by card, not by screen. `library.js` v4, `session-builder-ui.js` v8. Two silent downgrades removed. | 🟠 P2 | 🟢 **Completed 13 Aug** | w/c 10 Aug |
| **TIER-A/C/E/F** | Home doors, programme engine, Progress kind-not-length, Wellbeing naming. `today.js` v13, `gym-programme.js` v5, `progress.js` v5, `noticing.js`, `index.html`. `verify-tier.mjs` (14 checks). | 🔴 P1 | 🟢 **Completed 13 Aug** | w/c 10 Aug |

A free user taps "Lower body" in the Library and silently receives a 30-minute Full Body session. One file away, WOW-4/PT-7 (11 Aug) made locked tiles tappable specifically so this moment converts. The Library bypasses that fix and adds a silent substitution on top.

### Stream C — the app talks to healthy people as if they were patients

| ID | Task | Priority | Status | Week |
|---|---|---|---|---|
| **C1** | Rephrase advice so external help is **offered, never assumed**. 94 entries recopied; severe-pain line names the coach's limit. `rehabilitation.js` v4, `coach-proposal.js` v20. `verify-voice.mjs` extended to sweep `js/data/exercises`. | 🔴 P1 | 🟢 **Completed 13 Aug** | w/c 17 Aug |
| **C1b** | **COMPLETE 13 Aug.** All 94 entries individually written (notice-then-try format) and individually re-rated. `difficultyLevel` went from a constant 1 to a real spread. Clinical review applied to 12. `verify-safeguard.mjs` holds both against regression. | 🟡 P3 | 🟢 **Completed 13 Aug** | — |
| **C2** | Rehab library gated. 61 of 94 tagged `generalPurpose`, triage approved by Graeme. `sourceLibrary` added after the first filter excluded nothing. `verify-c2.mjs`. | 🔴 P1 | 🟢 **Completed 13 Aug** | w/c 17 Aug |
| **C3** | Adapted content de-prioritised for the fully capable. 38 entries tagged, `session-builder.js` v24, `verify-cap6.mjs` (6 checks, both directions reversal-tested). | 🔴 P1 | 🟢 **Completed 13 Aug** | w/c 17 Aug |
| **C4** | Strength weighting. Discipline fit (FIX-1), the opening-pick bias (FIX-2) and sport-conditioning (FIX-5) all shipped. Priya opens on Barbell Front Squat and it holds. | 🔴 P1 | 🟢 **Completed 13 Aug** | w/c 24 Aug |

**C4 — measured baseline after C3, persona 2.15, 16 sessions replayed through the live engine.**

Before C3: no barbell squat, no deadlift, and a sled sprint in a gym lower-body session. After C3: **Barbell Front Squat and Barbell Deadlift both appear**, seated content is gone entirely, and Step-Up — Glute Focus recurs in all four lower sessions, so continuity is working. Most of C4 was a symptom of C3.

Four residual faults, each specific and none of them requiring a new weighting mechanism:

1. **Cross-discipline leakage.** *Half Moon Pose* (yoga) and *Single Leg Stretch* (pilates) selected into a gym lower-body session. Same root shape as C2 and C3: the category matchers read `movementPattern` and `affectsAreas` only, and never `category` or the source discipline.
2. **Upper-body pushing in lower-body slots.** *Burpee* and *Explosive Press-Up* in Lower Body. Likely `movementPattern: 'squat'` or `'locomotion'` on a whole-body movement.
3. **The main lift does not hold.** Barbell Front Squat appears on d20 and d14, then Paused Goblet Squat on d10 and d4. `squat-pattern` treats a wall sit, a goblet squat and a barbell front squat as interchangeable, so progressive overload is still impossible on the thing she came for.
4. **104 distinct exercises across 16 sessions** — barely changed from 94. Variety is not the problem; the *anchor* is.

**Recommended scope:** fix 1 and 2 with the same `category`-aware filter that C2 needs (they are one job, not three), and treat 3 as its own change — an "anchor lift" concept that holds the primary compound steady while accessories rotate. 4 resolves itself if 3 does.

**C1's constraint, stated because it is the point.** The copy must work for somebody mid-physio, somebody who has never seen anyone, and somebody who cannot afford to. The third is in Graeme's own About copy at `settings.js:1195-1200` — *"I couldn't afford a physio."* The product cannot ship copy assuming what its founder could not access. `prescribed.js` / `intention.js` references to a physio are **correct as-is** — opt-in screens for people who have one. Do not "fix" them.

**C2/C3 are the inverse of the 12 Aug pattern.** That day found the same defect eight times: *content that exists and nothing can select*. These are *content that everything can select*. `INF-AUDIT` tests reachability in one direction only and cannot see this. **Extend it.**

Measured: 30 of 186 Full Body main candidates (16.1%) and 31 of 108 warm-up candidates (28.7%) come from the rehabilitation library. Priya — fully capable, full rack, 16 sessions — performed Seated Arm Cycling 9×, Rehab Ankle Proprioception 7×, Seated Shoulder Rolls 6×, against Barbell Bench Press 5×. She met **94 distinct exercises in 16 sessions**.

### Stream D — Personal must feel different, not just unlock more

| ID | Task | Priority | Status | Week |
|---|---|---|---|---|
| **D1** | Coach phrase pools. 108 approved lines: 8 per session type, 8 warm-up, 8 cool-down, 12 positive empathy prompts. Rotation on completed-session count. `verify-voice.mjs` pool-collapse guard. | 🟠 P2 | 🟢 **Completed 13 Aug** | w/c 24 Aug |
| **D2** | Personal reads. `js/data/personal-reads.js` — nine observations, each a `{text, when}` pair gated on a real signal. Ungated lines fail closed. `verify-reads.mjs`. | 🟠 P2 | 🟢 **Completed 13 Aug** | w/c 24 Aug |
| **D3** | Allocation preset persists (`sessionPreset`, schema-first). `sessionVariety` and the lift log were already built — verified, not assumed. | 🟡 P3 | 🟢 **Completed 13 Aug** | — |

**D1 scaffold rule:** rotation on an existing counter, never `Math.random()`. Copy `empathy-transfer.js`'s mechanism *and read its comments first* — a stable sort on score alone always returns the lowest index, and that lesson cost a 140-session simulation to learn.

**D3's honest refusal, to go on the upgrade page rather than be discovered after payment:** Alongside will show what you lifted and will never tell you whether it was good. P4 is not negotiable for one persona's convenience.

### Stream E — smaller, evidenced

| ID | Task | Priority | Status | Week |
|---|---|---|---|---|
| **E1** | Empathy conditions moved from `prefers` to `requires` via the new `anyOf:` tag, plus 12 positive-context prompts so the pool does not starve. 21 → 33. | 🟠 P2 | 🟢 **Completed 13 Aug** | w/c 17 Aug |
| **E2** | Export routed through `store.completedSessions()`. Gate changed from a floor (`via >= 2`) to zero non-compliant reads. | 🟡 P3 | 🟢 **Completed 13 Aug** | w/c 17 Aug |
| **E3** | `in-step.js` header corrected in place. | 🟡 P3 | 🟢 **Completed 13 Aug** | w/c 17 Aug |
| **WEB-PRICE** | ~~Website publishes £9.99/£89.~~ **WITHDRAWN — the claim was false.** Live site verified: `upgrade/index.html` publishes £7.99/£49.99 correctly. Archive docs banded as superseded instead. | 🟠 P2 | 🟢 **Closed 13 Aug** | w/c 17 Aug |

### Two questions for Graeme, not fixes

- **An unchosen weekly target renders as a shortfall.** `strategicGoal.weeklySessionTarget: 3` with `setAt: null`; `today.js:359-365` renders "1 of 3 this week". The count is right — COUNT-1 fixed it. Does a denominator nobody agreed to belong in a product whose north star is "joy at the gap"?
- **Programme milestones are emoji achievement badges.** `programmes.js:63-102` — "10 sessions completed ⭐". The streak was removed deliberately; count-based badges are a milder member of the same family.

---

## 🟢 LOG-2 — Yoga session notes: SHIPPED, 12 Aug 2026

`js/session-log.js` v1 → **v2**, `js/views/yoga-session.js` v2 → **v3**, `sw.js` → **v275**, cache **alongside-v275**.

Graeme: *"yes, but note-and-duration only — no reps, no level."* `performanceFields()` gains a `mode`; `"gentle"` returns duration and a free note and nothing else. **A pose is not a set** — counting reps there imports the exact frame the practice exists outside of. The gate asserts gentle mode offers none of reps, level, weight, incline, speed, distance or tension, so it fails if that branch ever widens.

---

## 🛡️ DECISION-DRIFT GATE — `tools/verify-decisions.mjs`, 12 Aug 2026

**Locked decisions now get enforcement, not just prose.**

### Why it exists

In Step sat locked for hours after the decision made it free. **Nothing failed.** That was the **fourth instance in one day** of one shape:

| Instance | Stated where | Enforced where |
|---|---|---|
| `sessionVariety` | store.js comment: *"the person's own answer"* | Nowhere — never written |
| `exerciseFeedback` | Read by `applyFeedbackWeighting()` | Nowhere — never written |
| `@media (prefers-larger-text)` | A styled block | Nowhere — not a real media feature |
| **In Step is free** | Destination Architecture §9, §18 | Nowhere — still `isPremium()` |

**A stated intent with no enforcement decays silently, and the silence is what makes it expensive.**

### What it checks

Free-tier features are actually free · no upgrade language inside a coach card (P1/P2) · no delta, verdict or streak language (P4) · no view defines an exercise-shaped pool (P5) · no voice picker exposed · every tracked store field has both a reader and a writer · the capability fail-safe covers everyone the question is asked of · grounding moments never appear on the acute-pain path.

**Each failure names the document the decision is recorded in**, so a future failure is traced rather than argued about.

**Deliberately limited.** It cannot check tone, judgement, or whether a line sounds like the coach — those still need Graeme. The point is that everything *checkable* is checked, so his attention goes only to what he alone can judge.

### Three failures on first run — all harness faults, each one useful

1. **"progress" matched `progressionInvitation`**, a function name. Identifiers are not user-facing copy.
2. **`BREATHING_EXERCISES` in `quiet-session.js`** is breathing *patterns*, not database exercises. Now matches on **shape** — `equipment` plus `movementPattern` — not on a name. **A gate that cries wolf gets switched off**, which would be worse than no gate.
3. **`liftLogEnabled` is written through a generic `[data-toggle]` handler**, so no literal `set("liftLogEnabled")` exists to grep. That is also precisely how a genuinely writerless field could hide, so both forms now count.

**Verified by reversal:** renaming the In Step button id makes it fail and name the source document. Ten gates now run green on a fresh clone.

---

## 🔴🟢 DOOR-1 — In Step was locked and should not have been. Fixed 12 Aug 2026.

`js/views/noticing.js`, `js/views/in-step.js`, new `css/components/upgrade-door.css`, `css/main.css` v18 → **v19**, new `tools/verify-door1.mjs`. `sw.js` → **v278**, cache **alongside-v278**.

### The stale-code failure — read this part first

**In Step was gated behind `isPremium()` and should have been free.**

It was Personal tier in the 9 Aug build. The **12 Aug tier decision moved it**, and the code never followed:

> §18 — *"Free users have full access to everything in Wellbeing — In Step, the empathy arc, grounding moments, journalling — but no personal journey through it. Same rule, no exceptions to explain."*
>
> §9 — *"In Step is free, and is the best door in the product — because someone who has just finished a scenario has felt the shape of the thing."*

**Nothing failed.** No error, no broken screen. The app worked perfectly and was simply wrong — the single best demonstration of what this product is for was invisible to exactly the people it was written for.

**Compounded by Claude quoting the superseded decision back at Graeme** earlier in the same session, sourced from a chat summary, while the current position sat in `alongside_destination_architecture_12aug2026_v1.md` — **one of the two documents the session start prompt names as required reading.** It was read at session start and the tier line did not register.

**Standing lesson: a specification change is not done until the code matches it. A tier decision that lives only in a document is a decision the product has not made.** This is the same family as the reader-without-writer pattern — a stated intent with nothing enforcing it — and it is the fourth distinct instance today.

**Guarded now.** `tools/verify-door1.mjs` asserts the card is ungated **and** that the spec still says free, so a future reversal in either direction fails loudly instead of drifting silently.

### The door, built from §9 verbatim

The offer existed in the specification and nowhere in the code. It now renders at the end of an In Step scenario:

> *"That's In Step — four movements, one thing at a time, each going a bit deeper.*
>
> *There's a longer version of the same idea. You pick something you'd like to get better at — being steadier, being more present, noticing other people more — and I build it out over months, shaped around what you're actually noticing rather than a fixed course.*
>
> *That's part of the paid plan, if you ever fancy it."*

**P1 and P2 made visible, not just asserted.** It sits outside the `card-coach` block, carries no coach icon, and is bordered rather than filled — somebody can tell at a glance that something other than the coach is speaking. That promise only holds if the difference is visible without reading. The gate asserts the door is not inside the coach's card.

**Not styled as a call to action.** No accent fill, no arrow, a link rather than a button. It fires straight after something reflective, and a hard CTA would break the moment — which is the entire reason this is the best door in the product.

**Copy rule 10.2 satisfied in order:** what is it (four movements) → what would it do for me (built out over months, shaped around what you're noticing) → how do I get it (a route to Upgrade that actually works). The gate checks all three.

**Free users only.** Somebody already paying is not sold to.

### Why this closes the grounding-moments question properly

Free is the entire marketing budget. **In Step free + grounding moments free + the door at the moment of feeling** is one mechanism, not three features: notice something in a plank, meet the same shape deliberately in In Step, and then — only there, only once, softly — hear that there is a longer version. Nothing explains the difference between free and paid. The person feels it, then is told what it is called.

---

## 🟢 GM-1 — GROUNDING MOMENTS: BUILT AND SHIPPED, 12 Aug 2026

**Tier boundary build sequence item 3.** New `js/data/grounding-moments.js` and `css/components/grounding-moments.css`. `js/store.js` v33 → **v34**. `Schema.md` v1.28 → **v1.29**. `js/views/workout.js` v11 → **v12**. `css/main.css` v17 → **v18**. New `tools/verify-gm1.mjs`. `sw.js` → **v276**, cache **alongside-v276**.

### Graeme's steers, applied

**"Let's avoid the citations and research."** No research appears anywhere in the feature. Claim, why, what to look out for. Nothing promises an outcome, physical or psychological. **The gate asserts it** — a moment containing *studies*, *evidence*, *proven* or *shown to* fails the build.

**"Stick with mindful moments rather than defined muscle development."** This dissolved the attentional-focus trade-off rather than balancing it: not claiming a hypertrophy benefit means not inheriting its cost. What survived is the useful half as a **placement rule** — attention on your own body competes with attention on the movement, so moments sit *before* a set on loaded work, and alongside holds and steady-state where there is nothing to disrupt.

**Correction to the record, and worth keeping.** Graeme noticed the v2 summary read as *"we need to be honest, this doesn't work as well as you hoped"* while the document itself read positively. **The document was accurate; the summary oversold the drama.** Framing design decisions as *corrections* makes them sound like failures. Watch for it.

### Why no rest screen was needed

The obvious blocker was that loaded-strength moments belonged in a rest gap, and `workout.js` prints `${exercise.rest}s rest between sets` as static text — there is no rest phase, screen or timer.

**It turned out not to be a blocker.** Three moments read as rest-gap material only because they were *written* that way. Reworded to sit **before** a set they work on the card, and pre-set attention does not disrupt the lift, so the placement rule holds. **17 of 20 landed unchanged; the other 3 needed a rewording, not a screen.**

### 🔵 NEW — REST-1: the rest gap has no UI

Raised separately rather than smuggled in. Right now the app tells you "90s rest between sets" and leaves you there. That is a real gap for strength sessions.

**Not booked, and it needs designing before building.** A rest timer that counts down at you is one wrong decision away from being a shame mechanic, which is exactly what this product refuses. It deserves its own conversation.

### Mechanics as built

**Family derived, not tagged.** From `position`, `category`, `equipment`, `balanceDemand` and `duration` — fields every exercise already carries. **No new field on 550+ entries**; a data migration to support a content feature would be the tail wagging the dog, and CON-2's equipment vocabulary work did the hard part. Seven families: hold, outdoor, machine, loaded, floor, seated, balance.

**Depth gated on sessions** — contact from the start, place from ~8, beyond from ~20. *Beyond* asks more, and in week one it reads as instruction.

**Silence is the common case.** Wrong family, first session, severe pain (7+, the app's existing acute threshold), inside the cadence gap, already dismissed, or simply not this session — all return null.

**Dismissal is permanent, costs nothing, and is never counted as a skip.** Unlike `empathyPromptSkips`, which widens a gap, this removes an item from the pool for good. Somebody who dismisses has told us something; asking again is the nagging this product exists not to do.

### 🔴 Two failures the gate caught, both real

1. **Balance had no outward-directed moment.** Its only entry was inward, and the two `any` moments are self-directed by nature — so somebody for whom inward attention does not suit would have had **nothing** there. **This was Claude's own safety rule catching Claude.** `balance-place-1` added, and it doubles as the standard balance advice.
2. **Family derivation led with a name regex**, so any exercise with "hold" in its name was misfiled regardless of shape. Now leads with the structural signal — duration without reps — with a word-boundaried name check as fallback.

Simulation run as well as assertion, per the EMP-1 lesson: the hold pool is fully covered before anything repeats, and nothing appears twice running.

### 🟢 All three "still open" items were already closed. GM-1 is complete.

`sw.js` → **v277**, cache **alongside-v277**. `yoga-session.js` v3 → **v4**.

1. **Yoga — agreed earlier the same day, now wired.** Grounding moments render on the pose card. Yoga is the natural home: it is already the frame, and a pose held still is exactly the plank case.
2. **In Step — settled 9 Aug 2026** and should never have been re-raised. Personal tier, four movements, sixteen scenarios, three lateral options, three-day cooldown, gated via `auth.js` `isPremium()` in `noticing.js`. **The relationship to free was settled too:** *"you don't have to explain the difference between free and premium. They feel it."* Grounding moments are not in tension with In Step — **they are what makes In Step legible.** A free user who notices something in a plank and finds it stays with them already understands what the paid version offers. That is the tier boundary position exactly: free is excellent, limited in scope, and is the entire marketing budget.
3. **The 20 texts were approved in the same exchange that produced them** — *"I like your statements."* Approved, not awaiting marking.

### ⚠️ Process note — this caused real friction and is worth keeping

**Three settled decisions were re-raised as open questions.** Graeme: *"isn't this what we just discussed and I said it was good?"* and *"my god this is annoying."*

Two failures, and the second is the one that matters:

- **Not checking the record.** In Step was agreed in a session with a full written summary. It was retrievable and was not retrieved before asking.
- **Treating "I like it" as insufficient.** Approval was given plainly and was logged as though it were pending. That is the same shape as the earlier "needs Graeme, not code" errors: **manufacturing an open question out of a closed one.** Three occurrences in one session is a pattern, not an accident.

**Standing rule: before listing anything as open, check whether it was already answered. A closed decision restated as open makes finished work look unfinished and costs the person time they already spent.**

### Previous entry, retained



**`Documents/Admin/alongside_grounding_moments_12aug2026_v2.md`.** v1 moved to `Archive/`.

### The evidence changed the design in three ways, not one

v2 is not v1 with citations bolted on. Three findings forced real changes:

**1. 🔴 Internal attentional focus impairs motor performance.** Wulf (2013) is one of the more robust findings in motor learning: an external focus beats an internal one for force, accuracy and retention. Calatayud (2016) and Schoenfeld (2018) show internal focus raises EMG activation and produced greater biceps hypertrophy over eight weeks.

**So the trade is real and it cuts against the intuition in the plank example.** Internal attention may build more muscle in isolation work; it also makes you move worse. **v1 placed grounding moments during loaded lifts. That was wrong** — it generalised the plank mechanism further than the evidence goes. They are now **between sets only** for heavy or technical work, and never during a working set.

**2. 🔴 Interoceptive attention is not safe for everyone, and v1 had nothing on it.** Britton (2019) and Farias (2020) put adverse-event prevalence around 8%; Heide & Borkovec (1983) established relaxation-induced anxiety decades ago. Farb (2015) separates interoceptive *awareness* from interoceptive *vigilance*.

Three requirements follow, not preferences: **every movement family must offer at least one outward-directed moment** so nobody is offered only body-focused attention; **dismissal must be free of penalty and remembered**; and **never on the crisis, severe-pain or Gentle Care paths**. Reinforces that these stay free — safety-critical behaviour is never paywalled.

**3. 🔴 Empathy alone is not protective; compassion is.** Klimecki (2013) is the critical result: empathy training alone **increased negative affect and empathic distress**, while compassion training increased positive affect with a different neural signature. Weng (2013) showed brief compassion practice was enough to shift altruistic behaviour.

**So the *Beyond* step must ask for well-wishing, not feeling-with.** v1's G7 sat closer to empathic distress than intended and is rewritten. Neff (2003) also licenses a **self-directed** *Beyond* as a legitimate version rather than a shallower one — and the safest first one for a new user.

### Also supported

Kaplan (1995) Attention Restoration Theory gives the mechanism for the *Place* step. **Barton & Pretty (2010)** is the strongest single argument in the document: the dose–response for green exercise is **front-loaded, with effects present at five minutes**. A ninety-second grounding moment therefore sits inside the steepest part of the curve. **Brevity is the design, not a compromise.**

### 20 moments, up from 15

Three cut (including v1's G15, which reached for the empathy move with no sensory step beneath it), several rewritten, eight new — including two treadmill moments that work *with* the setting, and the self-directed pair.

### ⚠️ Citation status

Given in good faith and, to my knowledge, accurate in author, year, journal and finding. **Every one must be verified against source before appearing anywhere public** — website, funding application, or a claim to a partner organisation. **One is explicitly flagged as less certain**: the imagined-vs-real nature literature, which G2, G3, G13 and G18 all depend on. If it does not hold, the *Place* step still works as attention-direction but loses the restoration claim.

### Three weaknesses flagged in the document itself

G20's closing line does the noticing for the person; G18's "warm dry version" is the most writerly line in the set and writerly is a risk in a plain voice; and the imagined-nature evidence is the weakest link in the research section.

### Original v1 note, retained



**`Documents/Admin/alongside_grounding_moments_drafts_12aug2026_v1.md`.** Build sequence item 3.

### Correction to the record

Earlier versions of this document listed grounding moments as *"Claude writes it, Graeme marks ~15 drafts."* Graeme asked whether they were actually written. **They were not** — nothing existed anywhere: no data file, no drafts, only three references in the tier documents and the open question *"the library needs writing."* It had been carried as though it were waiting on him. It was waiting on Claude.

He then supplied the plank and running models verbally, and the drafts below were written from them.

### The structural finding — worth more than the drafts

His two examples look different but share one shape:

**Contact → Place → Beyond.** Body, then world, then other people.

The plank: where your forearms meet the ground → imagine grass under your hands → you are a line held above a meadow growing around you. The run: the sound of your feet → the air on your skin, birds, wind → *someone coming home from work, wondering what their day might have been like.*

**That is the empathy transfer arc compressed into ninety seconds.** Stage 1 self-recognition to stage 3 situational empathy — the journey the prompt library walks over 85 sessions, happening inside a single plank. The running example's closing line is a stage 3 prompt almost word for word.

**If that holds, grounding moments are not a feature sitting near empathy transfer. They are its practice ground** — and the reason it might land for somebody who never reaches session 85.

**Implication:** one moment should not do all three steps. Step 3 lands on a first-week user as instruction and on a month-four user as invitation. So the same exercise wants a shallower and a deeper version, selected the way empathy prompts now are — which would make this cheap, since that matcher exists.

### The 15

Tagged by movement shape, not exercise name, so 550+ exercises are covered by a few dozen moments rather than hand-writing each: isometric holds (3), outdoor cardio (5), loaded strength (2), floor work (2), seated (1), balance (1), indoor cardio machines (1).

**Flagged in the document as weakest, honestly rather than after he finds them:**
- **G7 and G8** sit closest to the running example and closest to overreach. Instructing somebody to feel compassion is the fastest way to stop them feeling any. G7 may need to be time-gated or cut.
- **G15** is the weakest. A treadmill offers no world to notice, so it reaches for the empathy move without the sensory step under it.

### The attentional-focus claim — deliberately not used

Graeme's plank model included that mindful practice produces more muscle definition. That is real (attentional focus / mind-muscle connection; EMG evidence for internal focus, especially isolation work) but it is **not** in any of the copy. It would need a proper citation to sit alongside Plumbly, Zhang and Batson, and a grounding moment that promises a physical return stops grounding and becomes another performance instruction — the thing these exist to interrupt. Suggested for the Philosophy page, not the coach's voice.

### Open questions in the document

1. Do the three steps deepen with time?
2. Where does one appear — during a hold, on the card, or in the rest gap?
3. How often? Every session is too often; these depend on being slightly unexpected.
4. Free tier confirmed?
5. The attentional-focus claim — Philosophy, or nowhere?

---

## 🔴🟢 YOGA-1 — a SAFETY fix, found by chasing a stale entry. 12 Aug 2026.

`js/views/yoga-session.js` v4 → **v5**. `tools/verify-decisions.mjs` P5 check widened. New `tools/verify-yoga1.mjs`. `sw.js` → **v283**, cache **alongside-v283**.

### What was wrong

`yoga-session.js` carried **its own copy of 19 poses**, including their contraindications. **16 of the 19 had diverged from the exercise database — always toward being less cautious.**

| Pose | The view said | The database says |
|---|---|---|
| **Downward Dog** | knee, hip | **shoulder, wrist/elbow, hamstring** |
| **Pilates Hundred** | *nothing at all* | abdominals, lower back |
| **Warrior 3** | ankle/foot, knee | ankle/foot, glutes, hamstring, lower back |
| **Chair Pose** | knee | glutes, knee, lower back |

**Nothing failed.** Sessions built, poses rendered, and somebody with an acute wrist injury was quietly offered a full weight-bearing wrist pose — because a fix applied to the exercise database never reached this file.

`watchOut`, present on **19 of 19** of these poses since CON-3's Exercise Entry Standard, reached **none** of them.

**This is P5's defect costing safety rather than rework** — and P5 was written after three double-fixes precisely to stop it.

### The fix

`resolvePose()` merges each sequence entry with its database record. **Sequence timing and cues stay in the view** — the same pose is held 90 seconds in one flow and 120 in another, and that belongs to the flow. **Contraindications and `watchOut` always come from the database and cannot be narrowed by a sequence.**

`buildSession()` resolves **before** it filters. Filtering first would run the safety check on the stale copy, which is the original bug.

**Verified behaviourally:** `wrist-elbow-acute` now excludes Downward Dog, `abdominals-acute` excludes Pilates Hundred, `lower-back-acute` excludes Chair Pose. All three passed through before.

### 🔴 The gate missed this, and was fixed first

`verify-decisions.mjs`'s P5 check matched on `equipment` **plus** `movementPattern` — which is what a *strength* entry looks like. Yoga poses carry `holdSeconds` and `rest`, so **30 inline pose entries walked straight through the check written that morning to catch exactly this.**

Now matches on `id` + `name`, the weakest signal every selectable thing in the product shares. **Each remaining budget is documented with its justification, because a budget without a reason is a hole.**

---

## 🔬 DEVICE PASS — 12 Aug 2026, parts 0–3 complete

Graeme worked through `Documents/Admin/alongside_device_pass_12aug2026_v1.md` on device. `sw.js` **v294 → v298**, cache **alongside-v298**.

### Found by writing the instructions, before he started

**VER-1.** Step 0 said *"check Settings → About shows v293."* Checking whether that was even possible found `APP_VERSION` **hardcoded to `115`** while the cache was at 293 — **178 versions of drift, on the only surface that tells anybody which build their phone is running.** Every *"are you on the latest?"* check during device testing has been meaningless, and `settings.js`'s own v86 note records exactly that confusion happening. **The tool for diagnosing stale builds was itself stale.** Now read from the running service worker. (Shipped as `vv294` — VER-1b, doubled prefix, fixed.)

### Parts 0–1

| | |
|---|---|
| **SB-META** 🔴 | The session overview printed the literal word **"undefined"** — *"Fire Hydrant undefined sets 1½ min undefined"*. Unguarded interpolation; not every exercise has sets or a tempo. **Graeme did not flag this** — it was in his own screenshot, on the screen where somebody decides whether the coach knows what it is doing |
| **VOICE-2** | *"The writing in the red circles, are these the coach? Could they be teal?"* Yes. `.sb-section-why` carries the coach's own reasoning and was styled as UI chrome. Now teal at `--text-sm`. **Not gold** — gold is the paid-tier marker, and this is free-tier content |
| **CI-SPACE** | *"Leave a gap for the slides to pop over the top, but bring the writing down."* `block:"start"` on every message, added 11 Aug for the opposite complaint. Now decided per message; trailing space 70vh → 46vh, gated against the JS constant |

### Part 2 — the audit he asked for

**CSS-1.** *"Image 1 is unstyled. We need to audit all pages."* He was right that it was a class of problem. **174 classes rendered by views with no CSS rule anywhere** — including the whole `.ws-*` family, so **walk, run, cycle and swim rendered as unstyled text on every screen of all four**.

Nothing errors. A class with no rule is valid markup; the only detector was somebody opening the screen. New `single-activity-session.css` covers all 17. **`tools/verify-css.mjs` added as a ratchet at 157** — not zero, because a gate that fails from day one gets switched off.

**DISP-4.** *"Where I increase text size the things like week plan then need to be slideable like the settings tabs."* `repeat(7, 1fr)` forced seven days into the viewport whatever the text size, so at 130% Sat and Sun were unreachable. Now scrolls with snap. **A fixed column count and a user-controlled type scale cannot both be satisfied, and it should not be the text size that gives.**

### Part 3

**Exercise count:** cardio at 60 min builds **17**, not 4. **PT-8's count claim is stale**; the duration label question stands.

**LANG-1.** *"Audit for plain language. Standing, 2 point, 3 point start is confusing."* Six instances, not one — an American-football term in a product for people failed by fitness culture. **Change of Pace Run**: timings existed in `instructions` but the overview shows only a name and duration. He found a real gap anyway — *"vary the timing, no rhythm"* is deliberate and reads as an omission. Now explicit, including that the choice is his. **Naming the vagueness beats leaving it to look like a gap.**

### 🟢 LANG-1 remainder — CLOSED by Graeme, not deferred

> *"These, I think, look fine. That's what we can discover in beta and user feedback in time."*

92 further instances stay as they are. **The reasoning is right and worth keeping:** every candidate replacement risks changing what the exercise asks for, and the people who can say whether `eccentric` or `hip hinge` is a barrier are **beta testers, not us guessing now**. Real confusion from a real person beats a guess about hypothetical confusion.

`alongside_plain_language_audit_12aug2026_v1.md` v3 stays as a **reference list** — when a tester trips on a term, it is already located with a candidate drafted. **Not an open item. Do not re-raise.**

**Also corrected:** the audit's first version was wrong twice. `AMRAP` and `EMOM` are **already glossed on first use** and are defined terms, not jargon; and it counted matches in `id`, `name` and `youtube` fields that nobody reads.

### Still outstanding from the device pass

**Steps 4 and 5 not yet run.** Step 4 — the doors somebody cannot find — is the one that unblocks NAV-2 and is the only step Claude cannot do.

---

## 🟢 FEED-1 — the LAST reader-without-a-writer is closed. 12 Aug 2026.

New `js/exercise-feedback.js`. `js/store.js` v36 → **v37**. Rendered in `workout.js`, `core-session.js`, `prescribed-session.js`, `gym-programme.js`. New `tools/verify-feed1.mjs`. `sw.js` → **v293**, cache **alongside-v293**.

`applyFeedbackWeighting()` has read `exerciseFeedback` since v1.3 and **nothing ever wrote it**. The weighting has never once run on real data — it takes the array, finds it empty, returns the pool untouched. `store.logExerciseFeedback()` was even built for it in v20.

**Fifth confirmed instance of the pattern, and the last one open.**

### The full set, now closed

| Field | Written | Read | Closed |
|---|---|---|---|
| `sessionVariety` | never | selection | **DIC-1** |
| `empathyLastPrompt` | n/a — new | — | **EMP-1** |
| `proposalBias` | 03 Aug | never | **BIAS-1** |
| `capability.legPower` | never asked | profile | **C1** |
| `exerciseFeedback` | never | weighting | **FEED-1** |

### Design decisions

**Not a rating.** No stars, no scale, no "out of 10" — the skip/dislike spec §6 settled that, and *"Not a fan of this one"* already follows it. This **matches that pattern** rather than inventing a second vocabulary for the same card.

**No "about right" third option.** Silence already means that. A third button turns an optional aside into a question with three answers on every exercise, which is measurement pressure.

**Undoable.** `clearExerciseFeedback()` added, so tapping the button already set withdraws it — the same undo *"Not a fan"* offers. **A signal you cannot withdraw is one people stop giving.** Clears *all* entries for that id, because leaving four of five behind would make the undo silently do nothing.

**Self-painting**, rather than requiring a view re-render. Only `gym-programme` has a re-render function of the right shape; inventing one in three views for a two-button control would be the tail wagging the dog.

**P4:** two of the last five are needed before selection moves anything, so one hard day changes nothing — and nothing is ever displayed back. No counter, no history, no *"you've found this hard 3 times."*

**Absent from breathing and quiet sessions.** Asking whether restoration was too easy is a category error.

---

## 🔵 NAV-2 — NOT built, and deliberately so

Its own entry says **"Book after device pass"** — the agreed sequence is front doors, then goal-directed pointers, then a short tour. **The device pass has not happened.**

Building it now would jump Graeme's own sequencing, and the pointers depend on knowing which doors people actually fail to find — which is exactly what the device pass produces. It was listed as "buildable" in an earlier summary; that was wrong. **Sequence-gated, not buildable.**

---

## 🟢 QUIET-1 — breathing and mindfulness now become familiar. 12 Aug 2026.

`js/views/quiet-session.js`. `sw.js` → **v292**, cache **alongside-v292**.

**It logged no `exerciseIds` at all**, so no breathing pattern or mindfulness practice ever entered `exerciseHistory` — the same gap CONT-3 closed for core and yoga. *"Something like last time"* could never offer somebody the breathing pattern they actually use.

**The cause was an id split.** This file uses short local ids — `box`, `478`, `sigh` — while the database uses `box-breathing`, `four-seven-eight-breathing`, `physiological-sigh`. Every one has a database equivalent; only the id differed.

**Mapped rather than renamed**, because renaming the local ids would touch phase data, rendering and resume state for what is a logging fix. Unmapped practices log **no** id rather than a local one that matches nothing — a phantom history entry is worse than none.

### Deliberately NOT migrated wholesale, and the scoping is the point

It looked like YOGA-1 and is not. The breathing patterns **legitimately live in this view** — they are phase timings and coach intros, which the database does not hold. And unlike `yoga-session.js`, these carry **no contraindications and no `watchOut`**, so there is no safety divergence to fix.

**Scoped to the actual bug rather than to the shape of the previous one.** Assuming the same fix because the symptom rhymes is how a two-hour job gets invented out of a ten-minute one.

---

## 🟢 LEGAL-1 — "Ltd" removed from the live consent label. 12 Aug 2026.

**Repo: `build-new-habits/website`.** `index.html`. Pushed and verified on a fresh clone.

A previous session fixed `site.js`'s footer and recorded the rule. **The phrase survived in the mailing-list consent checkbox on the homepage** — and that is the one place on the site where it is a **legal declaration** rather than decoration, because it names the party a person is consenting to receive email from.

> *"I agree to receive emails from Build New Habits ~~Ltd~~. I can unsubscribe at any time."*

Build New Habits is an unregistered sole trader; **BIZ-1 (HMRC registration) is still outstanding**. Whole-site grep confirms no other live instance.

**Why it survived a fix that was recorded as done:** the earlier session fixed the footer, which is where the phrase was *noticed*, and did not sweep for the phrase itself. Same shape as DATA-1b — a fix verified against the place it was found rather than against the whole surface.

---

## 🟢 BURN-2 — the coach and the session no longer disagree. 12 Aug 2026.

`js/views/coach-reflection.js`. New `tools/verify-burn2.mjs`. `sw.js` → **v289**, cache **alongside-v289**.

BURN-1 made the recovery path reachable. **Verifying it end-to-end turned up the next-order fault**, which is the argument for verifying downstream rather than stopping at the function.

### Three definitions of burnout, in three files, feeding one decision

| Where | Rule |
|---|---|
| `detectBurnout()` — `data/checkin.js` | average energy over 5 days |
| `isBurnoutRisk()` — `coach-reflection.js` | 3 of last 4 days low |
| `sustainedDifficulty` — `reflect.js` | 3 of last 5 low |

**Traced across five scenarios, two contradicted:**

| Scenario | Generator | Coach |
|---|---|---|
| Flat and low, all 4s | narrows the pool | **silent** |
| Swinging between 1 and 8 | narrows the pool | **silent** |

**The session quietly got easier and the coach said nothing about it.**

**This is a P4 failure, not a logic one.** Silence on a drop is only credible if there is also silence on a rise — and here the app was deciding somebody was fragile behind their back, which is precisely the thing this product refuses to do.

### Fixed by deferring, not by adding a fourth rule

`isBurnoutRisk()` now calls `detectBurnout()` and speaks at **the same threshold that starts changing the session**.

**The message is graded too, because the session is.** `'high'` narrows the pool and proposes rest; `'moderate'` only steps intensity down. Saying the same thing for both would either overstate a flat week or understate a fortnight of exhaustion.

`reflect.js`'s `sustainedDifficulty` is **deliberately left alone** — it selects an empathy prompt rather than shaping a session, and its own note already explains why it does not reuse this. Different question, correctly separate.

### End-to-end, verified

| | Rested | Exhausted |
|---|---|---|
| `burnout.level` | none | **high** |
| `proposalBias` | null | **rest** |
| Resolved intensity | high | **low** |
| Recovery pool gate | false | **true** |

`filterToRecoveryPool()` narrows 556 exercises to 236 — **the pool genuinely does something**, which had never once happened in the live app.

### Two gate lessons, both previously learned and repeated

1. **The first agreement check reimplemented `isBurnoutRisk()`** and therefore kept reporting the old result after the fix landed. A test that reimplements the thing it tests is testing itself. It now calls the real functions.
2. **The P4 copy check flagged `"burnout"` inside `type: "burnout-risk"`** — an internal identifier. Scoped to the message lines, which is the same lesson `verify-voice.mjs` learned this morning: **identifiers are not copy.**

---

## 🔴 PROCESS — THE THREE RULES THAT COME OUT OF TODAY

**These are not observations. They are how work is done from now on.**

Graeme, after four failed attempts at one bug: *"I want you to do a deep sweep to guarantee this is right. No more 'I didn't look at that file' or 'I didn't see it'."*

### 1. Deep sweep before declaring anything done

Trace **every** file that touches the thing. Not the ones that seem relevant — all of them. The equipment sequence needed four attempts because each one stopped at the first plausible cause:

| | What was assumed | What was true |
|---|---|---|
| EQUIP-1 | wrong scope | never compared the ids |
| EQUIP-2 | empty list | patched copy, not data |
| EQUIP-3 | right fix | read the **wrong catalogue file** |
| EQUIP-4 | right fix again | disabled by a pre-seed never traced |

The sweep that finally worked took 42 files, 3 writes and 17 reads — and found **four items missing from the catalogue entirely**, blocking six exercises for every user since the database was written.

### 2. Derive test fixtures from the files. Never type them.

**Three gates passed while the device failed**, because I hand-typed the equipment ids into a constant. A gate built from a hand-typed fixture cannot catch a wrong fixture — it tests the assumption, not the data.

**Corollary:** a gate must not *replicate* logic it could *exercise*. `verify-equip3` v1 replicated `renderEquipmentCheck` and faithfully tested a path the screen no longer took.

### 3. Verify against a fresh clone, never the working directory

**The v310 commit did not contain its own fix.** While testing a gate against pre-fix code I checked a file out at `HEAD~2` and restored it from `/tmp`; the commit in between captured the reverted file. Locally everything passed. Deployed, it failed.

Also: **`git stash` to test a gate against old code stashes the gate too** — it runs the old gate against the old source and reports zero failures. That looks like proof and is nothing. Revert the source file only.

---

## 🔴 THE DELIVERY BUG THAT SHAPED THE WHOLE DAY

**SW-2.** `cache.add(url)` fetches through the **browser HTTP cache**. GitHub Pages serves JS with a long max-age, so the browser answered from its own store with a 200 and the service worker wrote **stale files into each newly created cache**.

Every version bump produced a correctly-named cache full of old code. The About screen honestly reported the new version; the JavaScript in it was older. **Three correct fixes never reached the device.**

It also explains why *"clear site data"* kept appearing to work — that wipes the HTTP cache, so the next install fetched real files.

**SW-1** (scoping lookups to the current cache) could not help, because the current cache *was* the stale one. Both were needed.

---

## 📋 SESSION CLOSE — 12 Aug 2026

**`sw.js` v288 → v314. `store.js` v34 → v38. `Schema.md` v1.29 → v1.31. 53 substantive commits. 30 verification gates, all passing on a fresh clone of the remote.**

### Device pass — complete, parts 0–5

Graeme ran `alongside_device_pass_12aug2026_v1.md` on device. **Twenty-two fixes came out of it.** Two he never flagged — found by looking at what else was in frame.

| Part | Found |
|---|---|
| **0** | VER-1/1b — version display **178 versions stale**; the tool for spotting stale builds was itself stale |
| **1** | SB-META (`undefined` printed on the session overview), VOICE-2 (coach reasoning styled as chrome), CI-SPACE |
| **2** | CSS-1 — **174 undefined classes**, four session views unstyled entirely; DISP-4 |
| **3** | LANG-1 — stance jargon ×6, Change of Pace timings |
| **4** | **EXIT-1** — nine views, no way to leave without saving; COUNT-1; NAV-3; NAV-4; CSS-2 |
| **5** | EQUIP-1→5, CONSENT-1, SCROLL-1, LOG-5, LOG-6 |

### The three that mattered most

**EXIT-1** — `session-guard.js` has offered "Exit without saving" since 21 May. **Nine views each built their own two-button dialog and none included it.** Opening a session to look at it always wrote a partial entry. Graeme's Home read "7 of 3" from sessions he never did — and `exerciseHistory`, continuity, burnout detection and the weekly plan all read that log.

**CONSENT-1** — the consent checkbox was styled with `accent-color` alone, which on a dark background looks near-identical checked and unchecked. The only reliable signal was the Continue button brightening. **WCAG 1.4.1, on the one control in the app with legal weight.**

**EQUIP-5** — four equipment items required by exercises existed nowhere anybody could tick them.

### Navigation, rebuilt on evidence

Three independent "couldn't find it" failures, one cause. **NAV-3** (yoga door), **NAV-5** (Settings → three sections, Graeme's own grouping), **NAV-6** (Progress tile removed), **NAV-7** (sub-tabs). NAV-2's goal-directed pointers remain the open half.

### 🟠 Still open

| | |
|---|---|
| **Graeme** | CAP-6 · REST-1 · DATA-2 · PT-4 · Wellbeing/Noticing naming |
| **Natalie** | BETA-1 (privacy and terms pages do not exist) · BETA-2 · BETA-4 |
| **Buildable** | NAV-2 pointers · CSS ratchet 131 → 0 · DISP-3 layout check |
| **Closed by decision** | LANG-1 remainder (92 items, beta feedback) · DATA-1 retirement · PT-1 · PT-7 · PT-8 |

### ⚠️ Note for Graeme

*"When you write the master schedule please ensure that prices is in there."* Read as **processes** and recorded above as the three rules. **If pricing was meant, say so and I will add it** — the pricing model sits in `alongside_pricing_model_20jun2026_v2.docx` and is not currently reflected here.

---

## 🔬 PERSONA TRACE — Wave 2, 12 Aug 2026

Two personas from `alongside_move_overview_and_personas_25jul2026_v2.md` §4, executed against **live modules** with a `localStorage` stub. Scripts saved to `Documents/Admin/Templates/persona-a.mjs` and `persona-b.mjs` so they can be re-run rather than rewritten.

### 🟢 Nadia — ADHD, mid-30s, novelty-driven. Clean.

Ten sessions of hyperfocus, three weeks away, then a return. Checked: **10 sessions logged, 5 exercises became familiar** (so CONT-1 works), **zero streak fields anywhere in her store**, her *"something different"* choice persisted to `sessionVariety` (DIC-1 works), and both a grounding moment and an empathy prompt fired on her return session.

**Nothing shamed the gap.** No streak to break, no visible absence to explain. That is the persona's central need and it holds.

### 🔴 Ruth — perimenopause, unpredictable energy. Found BURN-1.

Her whole profile is unpredictable energy, and she is precisely who burnout detection exists for.

## 🔴 BURN-1 — burnout detection had never run. Fixed 12 Aug 2026.

`js/data/checkin.js`, `js/data/workoutGenerator.js`, `js/views/coach-proposal.js`. New `tools/verify-burn1.mjs`. `sw.js` → **v288**, cache **alongside-v288**.

**Two faults, stacked, neither of which errored:**

1. **`workoutGenerator.js:543` called `detectBurnout()` with NO ARGUMENT.** The function returns `false` on its first line when the history is missing — so it returned `false` **every time, for everybody**, since the day it was written.
2. **Seven places then read `burnout.level`.** On a boolean that is `undefined`, so every comparison was false — including `recoveryMode: burnout.level === "high"`, which is what gates `filterToRecoveryPool()`.

**The entire recovery path was unreachable.** Somebody could report a fortnight of exhaustion, be told by the coach that today should be lighter, and the generator would build as if nothing had been said.

**The shape mismatch hid the missing argument, and the missing argument hid the shape mismatch.** Neither is visible on its own — a call site passing nothing looks like a default, and `.level` on a boolean fails silently.

**Fixed:** `detectBurnout()` returns `{ level: 'none'|'moderate'|'high', avgEnergy }` — the shape its callers were **already written for**. They were right; the function was wrong. It now defaults to reading the store when called without an argument, so fault 1 cannot recur silently. The original threshold of 4 is kept as the outer edge, so nobody who registered before stops registering.

### Both persona claims now hold against real code

| Persona doc says | Result |
|---|---|
| *"A hard morning is treated as its own data point"* | energy 2 → **low** |
| *"A good day is not defaulted to caution because of her profile"* | energy 8 in a burnout pattern → **moderate**, not low |

The second is the one that matters: BIAS-1's one-step rule means her good day is respected rather than overridden. Had `lighter` been a floor rather than a step, this persona's stated requirement would have been broken by the fix intended to serve her.

### Two apparent findings that were test errors, recorded so they are not re-raised

- **`detectBurnout()` returning false initially** — the trace called it with no argument. That *was* the live bug, but the trace found it by accident rather than by design.
- **`joint-pain` producing a general rather than named caution** — not a real condition id. The vocabulary is anatomical (`knee`, `hip`, `lower-back`) plus `chronic-fatigue` and `anxiety`. The code was right.

---

## 🟢 BIAS-1 — the coach's own conclusion finally reaches the session. 12 Aug 2026.

`js/store.js` v35 → **v36**. `js/data/checkin.js` gains `resolveIntensity()`. `js/data/workoutGenerator.js` reads it. `Schema.md` v1.29 → **v1.30**. New `tools/verify-bias1.mjs`. `sw.js` → **v287**, cache **alongside-v287**.

### What was wrong, for nine days

`coach-reflection.js` has computed a `proposalBias` since **03 Aug** — `'rest'` or `'lighter'`, from **severe pain, burnout risk, consecutive training days, and returning after time away** — written it to the store, and **nothing read it.**

**The consequence was not a crash.** The coach could privately conclude that today should be lighter because somebody is in a burnout pattern, **say so in the reflection**, and then hand them exactly the session their energy score alone suggested.

**It knew, it said it, and it did not act on it** — which is the specific failure that makes a coach feel like it is not listening.

### How it is wired

`todayIntensity` comes from check-in **energy alone**. `proposalBias` carries what energy cannot see. `resolveIntensity(base, bias)` combines them rather than one silently overwriting the other:

| Bias | Effect |
|---|---|
| `null` | unchanged |
| `'lighter'` | **one step down** — high→moderate, moderate→low |
| `'rest'` | low |

**A step, not a floor.** Somebody with high energy in a burnout pattern gets **moderate**, not low. Overriding a good day entirely because of a pattern would be the app deciding it knows better than the person in front of it — **P7: confidence scales with information, authority never does.**

### It was never declared in `store.js`

It existed only because `store.set()` creates arbitrary paths. It survived reloads — verified, not assumed — but was **invisible to anyone reading `store.js` for the field list.** That is how a field carrying severe-pain and burnout signals went nine days without a reader. Now declared and validated: an invalid value resolves to `null` rather than persisting.

**Fifth recorded instance of the PT-12 reader-without-writer family**, and the first where the missing half was the *reader*.

---

## 📚 DOCS RECONCILED — 12 Aug 2026

Graeme: *"update the master schedule and any other docs… I don't hear you talking about updating or reading the master schedule any more. Perhaps that's where mistakes came from."*

**`Documents/Live State/Schema.md` reconciled as well as this document.** Two stale findings corrected **in place**:

- **`contentType`** — *"read nowhere in the codebase… retire or wire up."* **Wrong when acted on.** Read in two live places; retiring it would break session selection. Marked corrected, closed as will-not-do.
- **`proposalBias`** — *"read nowhere else in the codebase."* True from 03 Aug until today. Marked resolved, pointing at v1.30.

`tools/schedule-drift.mjs` now reports **two** open "dead" claims, down from six, and both are verified true: `exerciseFeedback` still has no writer, and `contentType`'s entry is the one already marked corrected.

**Corrections go in place, not appended.** Appending is what produced documents that contradict themselves on their own front page — the same fault as `Schema.md` v1.25 claiming store v30 in the header and v21 four lines down.

---

## 🟢 PT-6 / PT-3 — one write path, one set of field names. 12 Aug 2026.

`breathing-session.js`, `quiet-session.js` (×2), `activity-log.js`, `morning-session.js` (×2). New `tools/verify-pt6.mjs`. `sw.js` → **v286**, cache **alongside-v286**.

Four views wrote straight into `activityLog` with `store.set()`, bypassing `store.logActivity()` and losing **all three** of its guards: the 10-second dedupe window built after the B3-3 duplicate-write bug, the empty-partial guard added after Graeme backed out of a session and it saved anyway, and the `exerciseHistory` write.

**PT-3 at its source, and the bigger half.** All four also wrote `duration` and `loggedAt` where `progress.js` reads `durationMins` and `completedAt`. **Every mindful, breathing, morning and self-logged session counted as zero minutes.**

`activity-log.js` is the worst of them: the screen where somebody manually tells the app about a swim or a long walk they were pleased with. The app took the number and did not hear it.

**`morning-session.js` had a LOCAL function called `logActivity()`.** It shadowed the store method and made the file read as compliant to any grep for the name — which is how it survived being *listed* in PT-6 and then *checked* as "uses logActivity". Renamed `_saveMorningSession()`. Its justification comment, *"consistent field naming within a single file"*, is marked superseded: **nothing reads a file**, and consistent-within-the-file was the wrong unit of consistency.

`reflect.js` remains the only `store.set("activityLog")` and is exempt in the gate — it **updates** an existing entry rather than creating one.

---

## 🛡️ SCHEDULE-DRIFT GATE — `tools/schedule-drift.mjs`, 12 Aug 2026

**Graeme's diagnosis, and it was the right one:** *"I don't hear you talking about updating or reading the master schedule any more. Perhaps that's where mistakes came from."*

Correct. This document was **written to** constantly and **read back** almost never — opened once at session start, then quoted from memory for the rest of the day. All three stale entries were in sections never re-opened. **Writing to the schedule is not the ritual. Reading it back is.**

### What it checks

Every stale entry was the same shape: a claim that something is **dead, missing or unbuilt**. That shape is mechanically checkable. The gate extracts those claims from **open** items only and reports any naming a symbol that is demonstrably alive.

**It reported 38 on its first run — useless.** It was catching symbols from surrounding prose and from resolved entries kept as reasoning trails. Tightened to open claims only, and to the symbol the claim is actually *about*. **Six.** A report of 38 is a report nobody reads.

### The six, all verified against live code this session

| Claim | Verdict |
|---|---|
| **PT-2** — *"`fitnessLevel` has no live writer"* | 🟢 **STALE.** Fixed 11 Aug. `settings.js:1335` writes, `session-builder.js:676` reads |
| *"`journalEntryType` set but never read"* | 🟢 **STALE.** `journal-entry.js:129` reads it |
| *"No difficulty-based exercise gating exists"* | 🟢 **STALE.** `filterByFitnessLevel()` exists and is applied |
| **DATA-1** — *"`contentType` read by nothing"* | 🔴 **STALE and dangerous.** Already corrected — read in two live places |
| *"`proposalBias` written, never read"* | ✅ **STILL TRUE.** Written in `coach-reflection.js`, zero readers |
| **NEW-2** — *"`exerciseFeedback` never written"* | ✅ **STILL TRUE.** No writer anywhere |

**Four of six were stale.** All four are corrected in place above rather than appended, because appending is what produced a document that contradicts itself.

---

## 🔴 PT-1 WAS ALREADY FIXED — third stale entry today

**PT-1 was fixed on 11 Aug 2026.** All seven live territories map correctly in `_resolveDayOne()`, and five have purpose-written `DAY_ONE` rows. Verified by reading the code, not the comment.

It was listed as **the top open item**, seven mappings were drafted, and Graeme reviewed copy for work that already existed. **That is his time spent on a failure to check.**

**Third occurrence today**, after **DATA-1** (described as read-by-nothing; read in two live places) and **PT-7** (described as using `disabled`; already on `lockedFeature()`).

**The pattern is now unambiguous.** `tools/verify-decisions.mjs` catches code drifting from decisions. **Nothing catches the schedule drifting from the code** — and three times today it has, always in the same direction: an entry true when written, invalidated by later work, never updated.

**Rule, and it is not optional: before any item is listed as open or acted on, its claim must be re-verified against live code in that same session.** A schedule entry is a snapshot. It ages.

---

## 🟢 VOICE-1 — six therapy phrases removed from LIVE copy, and gated

`js/data/checkin-openings.js`, `js/views/coach-reflection.js`, `js/views/onboarding/complete.js`. New `tools/verify-voice.mjs`. `sw.js` → **v285**, cache **alongside-v285**.

### Graeme caught it in a draft. It was already shipped.

He flagged *"sits with you"*. It was live — on the **day-one opening shown to somebody who had just chosen "there's a longer history than any of that"**. The most delicate line in the product, written in the register of a therapy room.

| Was | Now | Why |
|---|---|---|
| *"I want you to sit with that for a second"* | *"That is worth stopping on for a second"* | Instructs somebody what to do with a feeling |
| *"How does that sit with you?"* | *"How do you feel about that?"* | The phrase he flagged |
| *"how you're reflecting on that now"* | *"how you feel about that now"* | Asks somebody to perform reflection rather than answer |
| *"needs revisiting… how it sits with you"* | *"needs going into… how you feel"* | Both, on the same line |
| *"you have been showing up for yourself"* | *"you keep coming back"* | Say what they actually did |
| *"the first part of your journey"* | *"the first few weeks"* | **Copy rule 10.1 breach** — "journey" is a banned internal term, live on onboarding's final screen |

### The gate, and why it is narrow on purpose

`verify-voice.mjs` checks **user-facing strings only**. Class names, function names and internal tags are not copy — `renderCoachNarrative()` and `.complete-journey-card` are fine, and **a gate that flagged them would be switched off within a week.**

Physical cues are exempt for the same reason: *"Sit with legs extended"* is a yoga instruction and *"let gravity do the work"* is about not forcing a stretch. Both were caught on the first run and exempted rather than allowed to weaken the list.

**Verified by reversal:** restoring *"sits with you"* fails it.

---

## 🟢 CORE-1 — RESOLVED and built, 12 Aug 2026

**Graeme's call:** *"Allow both, but when conditions flag we provide a listen to your body and don't push too hard message."*

`js/data/session-rationale.js` gains `bodyCaution()` and `soreAreaLoaded()`. Rendered in `workout.js`, `core-session.js`, `prescribed-session.js`, `gym-programme.js`. New `tools/verify-core1.mjs`. `sw.js` → **v284**, cache **alongside-v284**.

### Built the P7 way, not the generic way

*"Listen to your body"* on its own is **exactly the hedge P7 warns against** — a coach that has been told a specific area is sore, knows this exercise loads it, and then says something vague, is pretending not to know.

**Two levels, matching P7's existing three-level model rather than inventing a parallel one:**

| Level | Case | Says |
|---|---|---|
| **Knows specifically** | `bird-dog` works the lower back | *"Your lower back is sore today, and this one works it. Go by how it feels rather than by how it went last time — easing off here is the useful thing to do, not a compromise."* |
| **Knows generally** | `dead-bug` works core and abdominals, **not** the back | *"You are carrying something sore today. This one does not work that area, but go by how it feels as you move rather than pushing to a number."* |
| **Knows nothing** | nothing flagged | silent |

**Why the second level is not a cop-out.** Naming the lower back on an exercise that does not work it would be the coach claiming knowledge it does not have — and that erodes the times it genuinely does. A wrong specific is worse than a right general.

### The mistake, caught by testing his scenario rather than the code

The first version did **only** the named level. `dead-bug`'s `affectsAreas` is `core, abdominals` — not `lower-back` — so **Graeme's exact case, a sore back while doing Dead Bug, was completely silent.** The gate caught it because the test was written against his scenario, not against what the function did.

### Where it came from

`bodyCaution()` was lifted out of `progressionInvitation()`, which **returns early when no previous lift is logged** — so a first-time exercise, precisely when somebody is least sure what they are doing, got nothing at all. The alias table now exists once, so the two rules cannot drift on which conditions map to which areas.

**Styled as a note, never a warning.** No red, no icon. Amber would make an ordinary sore knee look like an injury, and somebody who sees a warning every session stops reading them. Contraindicated exercises still never reach a card — this is the layer below that: not dangerous, but worth naming.

### Superseded

#### 🟠 CORE-1 — original content question, retained for the trail

`core-session.js` was migrated to shared ids correctly — it is the pattern yoga should have followed. But its own comment flags a question that was never answered:

| Exercise | core-session used to exclude for | Database says |
|---|---|---|
| `dead-bug` | lower-back-acute | **nothing** |
| `bird-dog` | lower-back-acute, wrist-elbow-acute | glutes-acute, lower-back-acute |

So `dead-bug` is now offered to somebody with an acute lower back, and `bird-dog` to somebody with an acute wrist. **The migration was right to trust the database. The database may be wrong here.** Content decision, not code — deliberately not guessed at.

## 🟠 QUIET-1 — logged, budgeted, not urgent

`quiet-session.js` holds 21 inline entries: breathing **patterns** (box, 4-7-8, physiological sigh) with `coachIntro` and phase timings, plus short mindful practices. Session structure rather than database exercises, so **not** the YOGA-1 defect — but worth a proper look, since several have database counterparts.

## 🟢 Database audit — clean

- **`watchOut`: 526 / 526.** CON-3 held completely.
- **63 entries carry `affectsAreas` but no contraindications.** Checked: overwhelmingly walks, breathing, cat-cow, ankle circles — where zero is defensible. **28 are rehabilitation entries**, plausible since rehab work is prescribed *for* a condition, but worth an eventual content pass. Not a bug.

---

## 🔴 DATA-1 — DO NOT DO THIS. The entry below is wrong.

**`sw.js` v282, cache alongside-v282.**

The DATA-1 entry describes `contentType` as *"written on 368 of 556 entries, read by nothing anywhere"* and calls retirement *"a clean standalone task."*

**It is read in two live, load-bearing places:**

| Reader | Effect |
|---|---|
| `session-builder.js:973` | `if (ex.contentType === "practice") return false;` — **excludes 140 standalone practices from component selection** |
| `session-categories.js:96` | `ex.contentType === "activation"` — drives the activation category |

**Retiring the field would make 20-minute rows and 30-minute yin yoga sequences selectable as one of five warm-up items.**

The entry was **true when written** and was invalidated by **CON-6**, which moved practices into the shared database — after which `session-builder.js` had to start reading `contentType` to keep them out. Nobody updated the entry.

**Lesson, and it is the same one as In Step's tier:** a schedule entry is a snapshot, not a standing fact. Any entry describing a field as dead must be re-verified against live code before acting on it, because the thing that makes a field dead is exactly the thing a later session might change.

**Status: closed as WILL-NOT-DO for retirement.** If `contentType` ever genuinely needs retiring, the two readers must be replaced first, and that is a design job on session selection, not a data cleanup.

### 🟢 BUT the entry was pointing at a real bug, in the opposite direction. Fixed 12 Aug.

Graeme: *"Can we do this now, otherwise it will not get done. What's needed?"* Scoping it properly found the fault nobody had:

**The exclusion rule FAILS OPEN.** `158 of 526` entries carry **no `contentType` at all**, and the rule is `ex.contentType === "practice"` — so a missing value **passes**. The rule was silently inapplicable to 30% of the database.

**28 of those untagged entries are 10–30 minutes of whole content:**

| Duration | Content |
|---|---|
| 30 min | Brisk Walk · Steady Cycling · Treadmill Incline Walk · Walk-Run Intervals · Weighted Vest Walk |
| 20–25 min | Treadmill Intervals · Rowing Steady State · Cross Trainer Intervals · Stair Climber Steady |
| 10–15 min | HIIT 30:30 · Ski Erg Intervals · Sled Push · Heavy Bag Rounds · nine swim and running drill sets |

**Every one was eligible to be picked as ONE OF FIVE components.** A 20-minute session could be built around a 30-minute walk.

### Why this is structural, not a tagging job

**Eleven of the 28 are tagged `exercise` — correctly — and were still wrong.**

No amount of correct tagging fixes a rule that fails open, and tagging today's 28 leaves the 159th untagged entry to reintroduce it. `session-builder.js` now excludes anything of **600s or more** from component selection, whatever it is tagged.

**600 and not 300**, because several legitimate components run to five minutes — plank progressions, longer holds, some mobility flows. **388 timed components remain eligible**, so the threshold is not swallowing real content.

**Both rules stay.** 140 practices are shorter than 10 minutes and still need the tag; the duration guard catches what the tag cannot. They cover different halves.

`tools/verify-data1.mjs` fails 2 assertions on the pre-fix code, and asserts **both readers still exist** — so nobody retires the field on the strength of the old entry.

### 🔴 DATA-1b — the first fix covered ONE OF TWO ENGINES

Graeme asked *"so this is genuinely fixed?"* **It was not.**

`session-builder.js` had the new rule. **`workoutGenerator.js` is a separate engine**, drawing its pool from `getSuitableExercises()` — and that had **no exclusion of any kind**, not for practices, not for length.

Measured: **340 exercises returned, of which 71 were 10+ minutes and 89 were tagged `practice`.** A generated workout could hand somebody a 30-minute Brisk Walk as one of its items — worse than the engine that was fixed.

**`isSessionLength()` now lives once** in `data/exercises/index.js`, applied inside `getSuitableExercises()` as **step 0** — before equipment and conditions, so every count downstream is honest rather than inflated by content that cannot be used. `session-builder.js` imports it rather than keeping its own copy: **a second copy is exactly how two engines drift, and drift is the fault this rule exists to catch.**

| | Before | After |
|---|---|---|
| workoutGenerator pool | 340 (71 long, 89 practice) | **278 — zero, zero** |
| session-builder pool | — | **389 — zero, zero** |

**167 standalone entries remain reachable** through the Library, Mobility & Conditioning and the single-activity views, none of which come through `getSuitableExercises()`.

### ⚠️ Why it was missed, recorded because it will recur

**The first fix was verified against the engine it changed.** Fixing one call site and checking that call site proves nothing about the other one. This product has two session engines and they do not share their filters by default — any rule about what may be selected has to be checked in both, or placed where both must read it.

**Graeme's standing point, which prompted this:** *"That's why we need to completely fix things when we find them. I will forget to do them otherwise."* Correct — and DATA-1 was a nine-day-old entry that was wrong in both directions when it was finally opened.

---

## 🟢 DISP-3 — the app's own 13px floor, now enforced

**19 declarations sat below the minimum `variables.css` states in its own comment**: *"minimum xs 13px for readability on health app."* They ran at 9px, 10px, 11px and 0.6rem — feel-scale labels, badges, day names, session durations. **All readable content, none decorative.**

Concentrated in `global.css` (6), `morning-session.css` (5), `settings-library.css` (3), `weekly-plan-v2.css` (3), plus `workout.css` and `tier-gating.css`. Raised to `var(--text-xs)`.

**Same family as everything else today** — a standard declared and not enforced — so it is gated. `verify-disp1.mjs` now fails if anything drops below 13px again, quoting the file's own sentence back.

⚠️ **Needs a device look:** several were badges in tight absolutely-positioned corners. 9px → 13px is a real size jump and layout should be eyeballed alongside A11Y-3.

## 🟢 LOG-4 — walk, run, cycle, swim

Distance (lengths for swim) plus a note, rendered **once on the completion screen** rather than on a card, because these are one continuous activity and not a sequence of exercises.

**Duration deliberately omitted.** All four already run a live clock and write `durationMins` themselves. Asking somebody to type a number the app already knows is what makes an app feel like paperwork.

A **stable synthetic id** per activity (`activity-walk`, `activity-run`…) means *"last time you walked"* is a real comparable note rather than one orphaned entry per session.

**The gate asserts the block sits BEFORE the action buttons.** The first attempt inserted it underneath them, where nobody would ever fill it in — caught by reading the output rather than by the syntax check, which passed.

---

## 🟢 OPEN-LIST SWEEP — five items closed, one new bug found, 12 Aug 2026

`sw.js` → **v281**, cache **alongside-v281**. `js/store.js` v34 → **v35**. New `tools/verify-cont3.mjs`. Eleven gates green on a fresh clone.

### 🔴 PRESC-1 — NEW, found while doing CONT-3, and the worst of the batch

**`completeSession()` in `prescribed-session.js` never logged the session at all.** It awarded credits and navigated to reflect. The only `logActivity()` call in the file is `savePartialSession()`, which fires when somebody **abandons** one.

**So a finished prescribed session was recorded only if you gave up on it — and then only as `partial`.**

Consequences, every one silent: Progress under-counted every completed prescribed session; `exerciseHistory` never learned those exercises; and **the coach's own condition-specific recommendations were the least-tracked thing in the product.**

The file also had **no session clock**, so it could not report elapsed time even once it started logging. Added, with the guarded-latch pattern from `workout.js` — unguarded, it would restart on every navigate back and report a forty-minute session as four. That is **PT-3's problem in a file PT-3 never scoped**, which is worth noting: the persona trace found the pattern but not all of its instances.

### 🟢 CONT-3 — three views logged a count, never the ids

`core-session`, `yoga-session` and `prescribed-session` supplied `exercisesCount` and never `exerciseIds`. `store.logActivity()` forwards ids to `recordExercises()`; with none supplied it never fired, so **`exerciseHistory` never learned a single core exercise or yoga pose.**

Continuity-aware selection and the drop-in coach question's 21-day window could not see any of it — so DIC-1, shipped this morning, was invisible to anyone whose training is core or yoga.

### 🟢 LOG-3 — session notes reach `core-session` and `prescribed-session`

Physio-prescribed work is where a note matters most: *"3kg felt fine, 4kg pulled"* is exactly what somebody needs at their next appointment and cannot reconstruct afterwards. Full field set for both; yoga stays gentle-mode.

### 🟢 PT-5 — `store.logSession()` retired

Zero callers, confirmed exhaustively. `breathing-session.js` and `quiet-session.js` each have a **local** function of the same name, which is what made it look alive. `progressLog` itself stays — written by `programmeEngine.js`, read by `gym-programme.js`. Its `durationMinutes` field name is where **PT-3's divergence began**, so removing the source stops it being copied by anyone reading `store.js` for a pattern.

### 🟢 DISP-2 — 110 hardcoded font-sizes now scale

DISP-1 shipped with 514 token-based sizes scaling and **110 ignoring the slider**. Somebody scaling text up got most of the app larger and a scattering of labels, badges and headings stubbornly unchanged — **arguably worse than nothing scaling, because it looks broken rather than unsupported.**

Each wrapped as `calc(X * var(--user-text-scale, 1))` — identity at the default, so no visual change for anyone who never opens the control, and the original value stays legible in source. `variables.css` excluded deliberately: its tokens already multiply the scale, and wrapping twice would square it.

**Gated** — `verify-disp1.mjs` now fails if any hardcoded font-size reappears, so this cannot drift back one stylesheet at a time.

### 🟠 DISP-3 — NEW, not fixed

Around **20 of those declarations are below the app's own `--text-xs` of 13px** — 9px, 10px, 11px, 0.6rem — concentrated in `global.css`, `morning-session.css` and `weekly-plan-v2.css`. They now scale, so somebody *can* enlarge them, but they are too small by default. That is a design decision, not a sweep.

### ⚠️ PT-7 was already fixed and was listed as open

`session-builder-ui.js` already uses `lockedFeature()` — no `disabled` attribute, no `opacity: 0.45`, only comments describing the old state.

**This was a verification failure inside the list written to demonstrate verification.** The grep for `lockedFeature(` returned lines 308 and 369, and those were read as evidence of the *problem* rather than of the *fix*. **Grepping for a term is not the same as reading what it says.** Closed.

---

## 🟢 SCHEME-1 — Colour scheme: SHIPPED, 12 Aug 2026

`css/base/variables.css` v3 → **v4**. `js/display-prefs.js` v1 → **v2**. `js/views/settings.js` v18 → **v19**. `css/components/display-preferences.css` v1 → **v2**. `index.html` pre-paint script extended. `tools/contrast-check.mjs` v1 → **v2**. `sw.js` → **v279**, cache **alongside-v279**.

**Dark is the default and stays the design intent.** Light and high contrast are adaptations somebody chooses; nothing changes for anyone who does not.

### Why the reference code could not be pasted

Both implementations Graeme supplied — DPC Hub's `settings.js` and BNH OS's `[data-theme]` block — are **light-by-default with dark as the option.** Their "dark theme" is this app's normal state, so the palettes could not transfer even in principle. **What transferred was the logic:** a scheme class on the root, chosen in Settings, applied before first paint.

### Every pairing measured, not eyeballed

Worst text or accent ratio in the light scheme is **4.68:1**; worst text ratio **6.01:1**.

Teal had to move: `#2DD4BF` measures **1.6:1 on white** and would have been effectively invisible, so light uses `#0F766E` — reads as the same colour, measures 5.47 on card. Amber likewise, since it is unreadable on a light ground.

**High contrast was previously reachable only via `@media (prefers-contrast: high)`** — that is, only for somebody who had already found their OS setting. The query is kept so system-wide users are unaffected; the scheme makes it choosable.

### The gate is the real deliverable

`tools/contrast-check.mjs` v2 runs the full matrix against **all three schemes**, with unoverridden tokens falling back to `:root` exactly as the browser resolves them — so a token a scheme forgot appears as a real, usually terrible, ratio rather than a missing value. **That is precisely how the removed `html.light-mode` block hid six unoverridden tokens.**

**Verified by reversal:** setting light's secondary text to `#A0AEC0` fails at 2.26:1.

`verify-disp1.mjs` additionally asserts that light overrides **every one of the six tokens the old block forgot**, that dark is the default, that the scheme applies before paint, and that switching removes the previous class first — two scheme classes at once would resolve by CSS file order rather than by what the person chose.

### ⚠️ Process note

**This was settled by Graeme and then listed as "blocking on you" in the very response written to demonstrate that habit had stopped.** Fifth instance in one session of reopening a closed decision. `tools/verify-decisions.mjs` covers code drift; it cannot catch this, which is a reading failure. The rule stands: *before listing anything as open, verify it is open — and a decision the person has already stated is not open.*

### Superseded

The earlier scoping entry below is retained for the reasoning trail only. The work described as "not booked" is done.

#### 🔵 LIGHT MODE / DISPLAY SCHEME — direction settled 12 Aug 2026, build not started

**Graeme, 12 Aug: *"I must insist on dark mode default with the potential for adaptations by the user."* That is the shape. Decision closed — do not re-open it.**

This supersedes the 26 April note that *"dark mode was confirmed as permanent."* Dark remains the default and the design intent; what changes is that the person may adapt it. Both are true at once.

### What Graeme already has, and why it cannot be pasted

He supplied DPC Hub's `settings.js`, and BNH OS (March) holds a `[data-theme="dark"]` palette with per-token contrast measured. **Neither transfers as code, and his instruction is explicit: apply the logic, not the file.**

The reason is structural, not stylistic. **Both reference products are light-by-default with dark as the option. Alongside is the inverse** — Midnight Teal *is* the default. So their "dark theme" is Alongside's normal state, and what Alongside needs is a **light palette that exists nowhere**. The BNH OS block is valuable as method — token by token with a measured ratio against a named background, which is what `tools/contrast-check.mjs` already enforces — but not one hex value carries over.

### Cost, now that DISP-1 exists

The mechanism is built: `js/display-prefs.js` already does localStorage, root classes and pre-paint application, and Settings > Display is live. **Adding the control is an hour or two.** The palette is the job.

| Task | Size |
|---|---|
| Scheme control in Settings > Display | Trivial — pattern is live |
| Light palette, all 11 surface/text tokens, each measured | Real work |
| High contrast as *selectable* | Half-built — `prefers-contrast: high` exists, auto-only |
| Component sweep for hardcoded hex | Same shape as DISP-2's 129 font-sizes |
| Extend `contrast-check.mjs` to gate BOTH palettes | Small, non-negotiable |

**Cheapest first move:** make high contrast user-selectable. That palette already exists and only lacks a switch.

---

## 🟢 A2 RESOLVED + LOG-1 — Session notes: SHIPPED, 12 Aug 2026

**A2 closed: `liftLogEnabled` stays default-ON, confirmed by Graeme.** He then widened it: *"But not just weight. Time, tension, elevation etc."*

New `js/session-log.js` and `css/components/session-log.css`. `js/views/gym-programme.js` v3 → **v4**. `js/views/workout.js` v10 → **v11**. `js/views/settings.js` v17 → **v18**. `css/main.css` v16 → **v17**. New `tools/verify-log1.mjs`. `sw.js` → **v274**, cache **alongside-v274**.

### Most of it already existed — and that is the finding

`store.js` v28 generalised `logLift()` on **11 Aug**, from Graeme's own words at the time, to **nine metrics**: weight, reps, speed, incline, level, distance, duration, band tension, free note. The field set already adapted to the equipment:

| Equipment | Fields |
|---|---|
| Treadmill | Speed · Incline % · Minutes |
| Bike, rower, elliptical, stair climber, ski erg | Level · Minutes · Distance |
| Resistance band | Band · Reps |
| Dumbbell, barbell, kettlebell, cable, machines | Weight · Reps |
| Holds and planks | Minutes · Note |
| Bodyweight | Reps · Note |

So time, tension and elevation all worked. **Two other things were wrong, and together they made a nine-metric log read as a gym-weights feature.**

### Gap 1 — REACH

`renderLiftBlock()` lived inside `gym-programme.js` and nowhere else. **Of eleven session views, exactly one offered it.** `workout.js` — the main coach-built session player — had no way to write anything down at all.

Extracted to `js/session-log.js`; `gym-programme.js` now imports rather than owns it, and `workout.js` gains it. **P5's shape: a view should not own something several views need.** Id prefixes now carry the exercise index, so the Save handler cannot write one exercise's numbers onto another as the card re-renders.

### Gap 2 — TRUTH

Settings called it **"Weight notes"**, described as *"For gym sessions. Jot down what you lifted."* Nine metrics behind a weight-only label — almost certainly the whole reason it read as weight-only.

Renamed **"Session notes"**, copy now naming weight, time, level, incline and band, and no longer claiming to be gym-only because as of `workout.js` v11 it is not.

**Named "Session notes" rather than anything containing performance, progress or personal best** — those carry a verdict, and P4 says the app may display and never interpret. The store field `liftLogEnabled` is untouched: renaming a live field for tidiness is a migration, not a rename.

**Standing note: a feature that describes itself wrongly is one people correctly believe does not do the thing.** This one had been fully built for a day and read as missing.

### 🔴 Deliberately excluded — and the gate asserts it stays that way

**`breathing-session.js` and `quiet-session.js` do not get this and should not.** Those are restoration; `breathing-session.js` contains no exercises at all. A metrics box on a screen whose purpose is to stop measuring contradicts the product. This is a boundary, not an oversight, and `tools/verify-log1.mjs` fails if either view ever gains it.

Graeme delegated the reach decision ("I don't mind, you choose"). The answer was deliberately **not** "all session views" for that reason.

**Not done, and each is a separate small job:**
- **Single-activity views** — walk, run, cycle, swim. Different shape: one activity, not a sequence of exercises. Needs its own field set (a walk produces distance and minutes; a swim produces lengths). Not booked.
- **`yoga-session.js`** — an open question rather than a no. A duration note is harmless, but yoga is the one place the product is most explicitly not about performance. Needs a decision.
- **`prescribed-session.js`, `core-session.js`, `morning-session.js`** — card-shaped, so cheap follow-ons now the module is shared. Not booked.

### Verification

`tools/verify-log1.mjs`, 22 assertions. The first nine assert that **every metric `store.logLift()` accepts is reachable from some field set** — a metric the store accepts but no field offers is unrecordable by design, which is the reader-without-writer pattern in its mirror image. Others assert the exclusions hold, the CSS reaches the browser, the old `.gp-lift` rules were removed rather than left dead, and that no verdict word appears in the panel copy.

---

## 🟢 C1 SECOND HALF — the conditional leg question: SHIPPED, 12 Aug 2026

**The last outstanding half of the C1 safety fix. Held all day pending Graeme's sign-off, because a question about whether somebody's legs work is the most sensitive in the product. Target WB 10 Aug 2026.**

`js/views/onboarding/lifestyle.js` v3 → **v4**. `js/store.js` v32 → **v33**. `Schema.md` v1.27 → **v1.28**. New `tools/verify-c1.mjs`. `sw.js` → **v272**, cache **alongside-v272**.

### The wording, as signed off

> **Some exercises ask your legs to carry your weight. Can yours?**
> Yes · A little, or on good days · No · I'd rather not say

Shown **only** when `chairRise !== 'yes'`. **Optional**, by Graeme's decision.

Graeme's read was the first sentence plus the three options. One amendment on delivery: as written it was a statement, so *"Yes"* had nothing to answer — a read-it-cold failure against copy rule 10.3. Completed with two words, *"Can yours?"*, keeping his sentence intact and the "why" doing its work first.

**Why the middle option carries "or on good days":** the screen already promises *"Bodies have good and bad spells."* An option list that forced a permanent verdict would contradict the page it sits on.

### 🔴 The hole found while making it optional

**Optional is only safe if unanswered fails safe. It did not.**

The question fires when `chairRise !== 'yes'` — so for **"Not easily"** as well as **"No"**. The fail-safe default only triggered on `needsSeated`, which is `chairRise === 'no' || floorAccess === 'no'`.

So somebody who said getting out of a chair is **not easy**, then declined the question, fell through to `legPower: 'full'` and **was served fully loaded leg work**. That is the original C1 bug one answer to the left — and making the question optional without finding it would have opened it wider.

`store.js` v33 widens the default to `needsSeated || (asked && chairRise !== 'yes')` — covering exactly the people the question is asked of. **Still gated on `asked`**, so nobody who never saw the capability screen is assumed limited; assuming limitation of everyone would be wrong and insulting, and that half of the v29 reasoning is preserved deliberately.

**Standing lesson: whenever a required question is made optional, the unanswered path becomes a live code path. It has to be traced, not assumed.**

### Three further failure modes, each closed

| Issue | Why it mattered |
|---|---|
| **`'skip'` stored as `null`** | The string is TRUTHY, so `c.legPower \|\| default` would bypass the fail-safe. Matching none of full/limited/none, it would read `legsLoadable` false but **`legsUsable` TRUE by accident** |
| **Retracting clears the answer** | Somebody who answers "No" then corrects `chairRise` to "Yes" must not leave `legPower: 'none'` on a question they can no longer see |
| **Listener leak in `attachEvents()`** | It re-attaches to every chip on each conditional reveal and is called from inside its own handler, so the count compounded. Latent because the handler is idempotent — this change adds a second reveal trigger, so it is now guarded |

### Verification

`tools/verify-c1.mjs`, 13 assertions against the real `capabilityProfile()`. **Checked against the pre-fix code, where it fails 6 of them** — so it tests something real rather than passing vacuously. The failure it guards is silent by nature: nothing errors, the person is simply handed the wrong exercise.

### 🟠 Process slip, recorded

`git add -A` swept `sw.js` into the same commit as the source changes instead of a separate one. The cache still bumped and everything deployed together, so the outcome is correct, but the standing rule is `sw.js` **last, in its own commit**. Rewriting pushed history would be worse than the slip, so it stands with this note. Cause: reaching for `git add -A` after a documentation fix, rather than naming the files.

---

## 🟢 EMP-2 — Both EMP-1 "content gaps" closed: SHIPPED, 12 Aug 2026

**Target WB 10 Aug 2026.** `js/session-builder.js` v22 → **v23**. `js/data/empathy-transfer.js` v2 → **v3**. `js/views/reflect.js` v4 → **v5**. `sw.js` → **v271**, cache **alongside-v271**. No schema change.

### The framing that was wrong

v156 logged these as *"two content gaps — yours, not code."* Graeme asked how they get resolved. **Neither needed new prompt content. Both were code.** Second time today that a "this needs Graeme" label did not survive the question being asked — the first being the touch-once items. Worth noticing as a pattern rather than twice as a coincidence: *labelling something as somebody else's decision is itself a claim, and it needs the same evidence as any other.*

### 🟢 Gap 1 — "the coach made visible adjustments" is now evaluable

Nothing recorded that an adjustment had happened, so the prompt sat as a bare fallback. `session-builder.js` v23 now writes `session.rationale.adjusted` on **two triggers, both meaning the person could SEE it**:

1. Something was left out and explained — `pulseRaiser.reason` is the coach saying so in its own words
2. A condition flagged at **4+** today, which constrains selection and makes `progressionInvitation()` name the sore area. 4 matches the threshold already used there, not a new number

Written onto the session rather than as a new store field: `generatedSession` is already persisted, and this is a fact about one session, not a standing property of the person. `reflect.js` reads it **date-guarded** — `generatedSession` outlives the session it describes, so without the check a walk today would inherit yesterday's adjustment.

**Silent adaptation deliberately does not count.** A prompt about noticing someone else should follow a moment the person actually witnessed, or it praises them for something invisible. Stage 3 Prompt B, whose condition is the same moment plus engagement, now also matches on it.

### 🟢 Gap 2 — stage 5 needed no new prompt. It was a staging bug.

**Every stage header in `empathy-transfer.js` carries a session range** — *"Sessions 1-12"*, *"12-30"*, *"30-55"*, *"55-85"*, *"85+"*. **Nothing ever read them.** Stage advance counted firings only, so two mechanisms describing the same progression drifted apart.

| Stage | Documented | Actually entered |
|---|---|---|
| 2 | 12 | 21 — late, harmless |
| 3 | 30 | 41 — late, harmless |
| 4 | 55 | 61 — late, harmless |
| **5** | **85** | **~77 — early, and this is the entire bug** |

All four stage 5 prompts gate at 85+, 90+, 95+ and 100+ **because the stage was designed to begin at 85.** Arriving at 77 meant ten sessions with nothing that qualifies.

`STAGE_SESSION_FLOOR` now enforces the ranges the file already declared. **The floor only ever delays entry, never accelerates it**, so stages 2–4 are unaffected in practice — they already arrive after their floor. One change, correcting only the broken case, and no content required.

### Verification — assertion *and* simulation, per the EMP-1 lesson

Assertions alone were what let the coverage regression through last time, so both were run:

- Stage 5 entered at session **89**
- **Zero fallbacks** across a 160-session arc
- Max consecutive repeat still **2**

Stage 3 coverage narrows to 2 of 5 during a sustained rough patch. **Checked rather than assumed:** that is fit working correctly — those two prompts genuinely score highest there. Neutral-context reachability still covers all five, and the harness asserts it.

### Correction recorded in-file

`empathy-transfer.js` v2's NOTE 2 and NOTE 3 are marked **SUPERSEDED** rather than deleted, so the reasoning trail survives and nobody re-derives the wrong conclusion from a stale comment.

---

## 🟢 EMP-1 — Condition-aware empathy selection: SHIPPED, 12 Aug 2026

**Tier-boundary build sequence item 2. Target WB 10 Aug 2026. Code complete, fresh-clone verified, on-device confirmation outstanding.**

`js/data/empathy-transfer.js` v1 → **v2**. `js/views/reflect.js` v3 → **v4**. `js/store.js` v31 → **v32**. `Schema.md` v1.26 → **v1.27**. New `tools/verify-empathy.mjs` and `tools/precache-check.mjs`. `sw.js` → **v270**, cache **alongside-v270**.

### What was actually wrong

The schedule framed this as *"prompts, stages and conditions all exist; only the matcher is missing."* True, but it pointed at the wrong input.

Selection was `pool[atStage % pool.length]` — rotation. **One screen earlier, `reflect.js` asks the person how the session felt (Felt strong / About right / Struggled), whether pain was worse than usual, and mood after on a 1–10.** `saveAndSummarise()` holds all three at the exact moment of selection and used none of them.

Somebody could answer **"Struggled", "Worse than usual", "Struggling"** — and receive a prompt about strong energy, because it was next in the rotation.

**Same fault as `sessionVariety` this morning: the app asks and does not listen.** It costs more here. A mistimed empathy prompt does not read as generic — it reads as the coach not having heard you, at the most exposed moment in the session. `reflect.js` is also the file three persona traces walked past.

### Decisions

| # | Decision |
|---|---|
| 1 | **Today's answers lead**, check-in energy second. What the person said beats what the app inferred |
| 2 | **Fit wins, capped at two consecutive firings**, then next-best. Pools hold 4–5 prompts and somebody can genuinely struggle for a fortnight; a coach that repeats one sentence stops being heard, but one that varies itself with a poor fit is the rotation problem again |

**All 21 prompt strings are byte-identical to v1**, verified by assertion during the restructure. The v1 rule holds: wording belongs to `alongside_empathy_transfer_prompts_19may2026_v1.docx`, not the code file. Only structure and metadata changed.

**P4 applies and is honoured.** Selection is silent — nothing announces that the coach noticed. If it visibly softened on a hard day, its ordinary tone would become a verdict on every other day.

**Cadence untouched.** Gap, skip-widening, minimum-sessions floor and stage thresholds are unchanged. This changes *which* prompt fires, never *whether* one does.

### 🔴 The fault a fully passing test suite still missed

**Worth reading in full, because it is the most useful thing in this section.**

Every assertion passed. Then a **140-session simulation** showed only **2 of 4 prompts per stage ever firing** — stage 1 used indices [0] and [1] and never reached [2] or [3].

Cause: a stable sort on score alone always returns the lowest index, so when nothing scores (most sessions — the catch-alls all score 0) the same prompt won every time and the repeat cap simply bounced between two indices forever. **That is worse than the rotation it replaced, which at least visited all four.**

Fixed by rotating on `empathyPromptsAtStage` among near-equal scorers, with a tolerance of 1 so a strong fit still narrows the field. Coverage now **4 / 4 / 5 / 4 / 4**. A second, subtler case surfaced the same way (stage 3 firing 2 of 5) and drove the tolerance.

**Standing lesson: assertions prove the rules you thought of. Simulating a real arc is what shows the behaviour.** Neither substitutes for the other. Test 6 in the harness now encodes it.

### 🟢 Two gaps raised here — BOTH CLOSED same day by EMP-2, and both were code

**The "need Graeme, not code" heading below was wrong.** Kept for the trail; see the EMP-2 section above for how each was actually resolved. As originally written:

#### 🟠 Two content gaps in the source spec — need Graeme, not code

1. **Stage 2 Prompt B is unmatchable.** Its trigger is *"after a session where the coach made visible adjustments (noted in the rationale card)"*. `session-rationale.js` writes nothing to store, so nothing records that an adjustment happened. It carries an explicit `note` and an empty `requires`, so it participates only as a fallback and **the gap is visible in the data rather than buried**. Fixing properly means persisting an adjustment flag — small, but a real change to a file shipped today.
2. **Stage 5 has no catch-all.** Its four prompts gate at 85+, 90+, 95+ and 100+ sessions, but stage 5 is reached at roughly session 75. Someone can enter it with **no qualifying prompt for about ten sessions**, and the simulation shows index [0] firing four times running there because it is the only eligible one. Handled by falling back to the nearest threshold. **The real fix is one new stage 5 prompt with no session gate** — a content job, not a code one.

---

## 🟢 INF-CACHE — 40 files missing from the precache: CLOSED, 12 Aug 2026

Found while adding `empathy-transfer.js` to `SHELL_URLS`. **25 of 98 JS modules and 15 CSS files were absent.** Among them the entire onboarding flow, four exercise category files from the 12 Aug CON work, `session-rationale.js`, and `upgrade.js`.

**Three dead entries also removed, and two are the more interesting half:** `swimming-cycling.js` and `sport-conditioning.js` were listed with **hyphens** where the real files use **underscores** (`swimming_cycling.js`, `sport_conditioning.js`). Those two exercise categories had never once been precached while appearing in the list to be. `views/about.js` outlived its file, deleted earlier the same day.

`Promise.allSettled()` on install meant all three failed silently forever — which is precisely why nobody noticed.

**Severity, stated accurately after reading the fetch handler rather than assuming.** An earlier draft of the `sw.js` note claimed a first-time user offline could not start. **That was an overclaim and was corrected before commit.** The handler is cache-first then network-and-cache, so an unlisted file caches on first online use. This was never *"offline is broken"*. The real exposure is **a route opened for the first time with no signal** — tapping Upgrade in a basement gym, or a session type never tried before. Precaching makes offline guaranteed rather than dependent on where somebody happened to have browsed.

**New permanent gate: `tools/precache-check.mjs`** — walks the filesystem and compares against `SHELL_URLS` in **both** directions, because both directions failed silently. `SHELL_URLS` now covers 138 of 138 js/css files with no dead paths.

---

## 🟢 DISP-1 — Display preferences: SHIPPED, 12 Aug 2026

**New Stream: Accessibility (A11Y/DISP). Target WB 10 Aug 2026. Code complete, fresh-clone verified, on-device confirmation outstanding.**

New `js/display-prefs.js`, `css/components/display-preferences.css`, `tools/verify-disp1.mjs`. `css/base/variables.css` v2 → **v3**. `css/main.css` v15 → **v16**. `js/views/settings.js` v16 → **v17**. `css/base/reset.css` and `index.html` amended. `sw.js` → **v269**, cache **alongside-v269**.

**Origin:** Graeme supplied DPC Hub's `settings.js` (itself adapted from The Learning Studio) and asked whether a version belonged in Alongside, noting correctly that it could not be copied verbatim.

**What transferred: the logic. What did not: any markup or CSS.** That codebase has its own class names, palette and type scale; porting it would have imported a second design system. This uses the existing `.settings-section` / `.settings-field` / `.settings-toggle` conventions so Display reads as the seventh peer of six tabs rather than a bolt-on.

### The five controls

| Control | Mechanism |
|---|---|
| Text size (90–160%) | Multiplies every `--text-*` token |
| Line spacing (90–135%) | Multiplies every `--leading-*` token |
| Letter spacing (0–0.12em) | Inherited from `body` |
| Underline links | `.underline-links` on `:root`; excludes `.btn` — underlined buttons read as broken, not clearer |
| Stronger focus outlines | `.enhanced-focus`, 4px + halo, `:focus-visible` only |

### Why this was cheaper than it looked

**The app already honoured most of this — it just would not let anyone ask.** `prefers-reduced-motion` is handled in 44 blocks across 15 CSS files plus 3 JS views, and `prefers-contrast: high` already exists in `variables.css`. The gap was never adaptation; it was **user override**. Someone who wants calm visuals in this app but not system-wide, or who has never found their OS accessibility settings, had no route.

### The decision that makes it work

**Scale the tokens, not `body { font-size }`.** 514 font-size declarations read a `--text-*` token; 129 hardcode a value. A body override reaches almost none of them because components set size explicitly rather than inheriting. Multiplying the tokens reaches all 514 on day one.

**🟠 DISP-2 — the remaining 129 hardcoded font-sizes** (111 CSS, 18 inline in JS views) and **95 hardcoded line-heights** will not respond to the control. Logged, not booked. Mechanical sweep.

### Stored outside `store.js`, deliberately

Against the single-source-of-truth argument applied everywhere else today — and the reason matters, so it is recorded rather than assumed:

1. **Must be readable before first paint.** `app.js` is a module loading at the bottom of `<body>`, i.e. after paint. Applying there alone means larger text visibly jolts on every launch — and the people who set it are exactly the people that serves worst. An inline pre-paint script now sits before `</head>`.
2. **Device-level, not person-level.** When Supabase lands, a phone-sized text scale has no business syncing to a laptop.
3. **Should survive a store reset.** Somebody who needs larger text needs it more, not less, when everything else resets.

The pre-paint script duplicates the keys and defaults because it cannot import a module. **`tools/verify-disp1.mjs` asserts the two copies match and exits 1 on drift** — that duplication is the single highest-risk thing in this build.

### 🟢 Removed: `@media (prefers-larger-text)`

**Not a real media feature.** Media Queries Level 5 defines `prefers-reduced-motion`, `prefers-contrast`, `prefers-color-scheme`, `prefers-reduced-data`, `forced-colors` and `prefers-reduced-transparency` — there is no text-size preference. The block had never matched in any browser. **Tenth P6 instance**, and its intent is precisely what the new control delivers for real.

### 🟠 A11Y-3 — `.sr-only` was never defined — FIXED, but needs eyeballing

Seven elements used `class="sr-only"`, a class with **no CSS rule anywhere in this codebase**. The two in `index.html` are empty live regions, so no visible effect. **The other five hold text written to be heard and not seen, and have therefore been visible on screen all along:**

| File | Content |
|---|---|
| `noticing.js` :177 | `<h1>Noticing</h1>` |
| `reflect.js` :334 | `<h1>A thought before you go</h1>` |
| `prescribed.js` :298 | "N sessions completed this week" |
| `onboarding/plan-select.js` :122 | "Choose your training plan" |
| `onboarding/frequency.js` :77 | "Select number of training days per week" |

Fixed by **aliasing** `.sr-only` to `.visually-hidden` in `reset.css` — one rule, no touch risk across five files, and it catches future use of the commoner name.

**⚠️ GRAEME: this makes those five elements disappear from screen.** That is what the markup always asked for, but it is a visible change on five screens. If any is genuinely wanted visible, the fix is to give that one a real heading class — not to remove the rule. Worth a look on the next device pass, and note `reflect.js` is one of them — the file three persona traces have walked past.

### Not done, deliberately

**No preferences prompt in onboarding.** P3 — offered at the point of friction, never on a timer. Somebody eleven questions into setup does not yet know they want wider letter spacing.

### Deferred by agreement

| Tier | Scope | Status |
|---|---|---|
| **1** | This build | 🟢 Shipped |
| **2** | Reduce-motion override (44 CSS blocks + a shared reader for the 3 JS views that capture `matchMedia` once at construction) and font choice — **Atkinson Hyperlegible** recommended over OpenDyslexic: free from the Braille Institute, designed for low vision, and does not look like an accessibility font, which matters for a product used in public. Needs adding to `sw.js` SHELL_URLS to work offline | Not booked |
| **3** | Colour scheme — light mode and *selectable* high contrast. This is the A11Y-2 project. **Should not block beta** | Not booked |

### 🔧 Verification note — a pattern now confirmed three times

`tools/verify-disp1.mjs` failed four times on its first run. **Two were the harness matching text inside comments that legitimately discussed the thing under test** — a note reading *"must sit before `</head>`"* is not a `</head>`, and the v3 note explaining the removal of `prefers-larger-text` is not that block. The other two were real and expected (`sw.js` not yet written; it is last by rule).

This is the same failure that produced a **false pass** earlier the same day, when a check for the live cache string matched a changelog line rather than the constant. **All three gates now strip comments before any positional or presence test.**

Standing lesson, now earned twice in one day: *a naive substring match against a well-commented file will match the commentary. False passes and false failures come from the same cause.*

---

## 🟢 A11Y-1 + the two logged items: ALL CLOSED, 12 Aug 2026

**Target WB 10 Aug 2026. All three of DIC-1's "logged, not fixed" items are now fixed.**

`css/base/variables.css` v1 → **v2**. `css/components/checkin-conversation.css` v8 → **v9**. `js/store.js` v30 → **v31**. `Documents/Live State/Schema.md` v1.25 → **v1.26**. New `tools/contrast-check.mjs`. `sw.js` v265 → v266 → **v267**, cache **alongside-v267**. Confirmed on a fresh clone.

### The process lesson, which matters more than the fixes

Graeme's question was *"why not?"* and two of the three answers did not survive it. **Touch-once was cited, not applied.** The rule means a file appears in one session's scope; it does not mean scope can never grow — and neither `store.js` nor `Schema.md` had been opened this session. The scope was self-declared at session start and then treated as an external constraint. **That is how a discipline rule turns into a place to put work you would rather not do.**

Worth keeping alongside P5–P7 as a working note: *a build-discipline rule is a constraint on how work is done, never a reason for work not to be done. If a rule is being cited rather than applied, that is the tell.*

The third item did have a real reason — it changes how every screen looks, which is Graeme's call — **but that reason was never given**. The failure was bringing a log entry instead of two costed options.

### 🟢 A11Y-1 — elevated-surface contrast, fixed at the token

**The measured failure:** 56 rules set `--color-bg-elevated`, and 15 put `--color-text-secondary` or `--color-text-muted` directly on it — 4.30:1 and 3.91:1 against the 4.5:1 AA floor. `--color-bg-hover` is the same value (`#3E4C63`), so **every card hover state failed the same way**. Affected chips, cards, inputs, toasts, trends and milestones across onboarding, settings, progress, gym, journal and weekly plan.

**Graeme chose Option A** — lighten the text tokens rather than darken the surface:

| Token | Was | Now | On elevated |
|---|---|---|---|
| `--color-text-secondary` | `#A8B8CC` | **`#B9C6D6`** | 4.30 → **5.01** |
| `--color-text-muted` | `#A0B0C0` | **`#B2C0D0`** | 3.91 → **4.69** |

Option B (darkening `--color-bg-elevated`) was rejected on measurement: the value needed brings it to **1.00:1 against `--color-bg-card`**, so "elevated" becomes visually identical to "card" and every raised element in the app flattens.

**Stated cost, on record:** secondary and muted are now close enough to be nearly indistinguishable, so the palette carries **two** text weights rather than three. That was already the honest position — a palette that cannot support three weights on its own lightest surface at AA has two, and pretending otherwise is what produced 15 failing rules.

**New permanent gate: `tools/contrast-check.mjs`.** Reads live token values out of `variables.css` rather than restating them, and asserts all three text tokens against all five surface tokens, plus five accent and boundary pairs at 3:1. Exits 1 on drift, so it can gate a commit like `schema-check.mjs`. **All pass.**

### 🟢 The other two, closed

- **`store.js` v31** — `set()` now lazily inits the way `get()` already did. Verified against the exact condition that threw (write before any read, no `init()`). Never reachable live because `app.js` :150 inits on boot, but an asymmetry with no reason behind it.
- **`Schema.md` v1.26** — DOC-2. The front page said `store.js` v30 in the header and v21 four lines down. Supersedes line also repointed from v1.20 to v1.25.

### 🟠 NEW — A11Y-2: light mode is unreachable, and broken

Found while auditing A11Y-1's blast radius. **Nothing in any JS file or `index.html` ever adds the `light-mode` class**, and no Settings toggle exists — despite the block's own comment reading *"User toggle in Settings. Default: dark."*

Worse, if it were switched on it would not work. **Six surface and text tokens are defined in the dark palette and never overridden in the light-mode block**: `--color-bg-deep`, `--color-bg-elevated`, `--color-bg-hover`, `--color-border-focus`, `--color-border-light`, `--color-text-inverse`. So an elevated surface would stay `#3E4C63` (dark slate) while text became dark:

| Light-mode text on `#3E4C63` | Contrast |
|---|---|
| `--color-text` `#0f172a` | **2.06** |
| `--color-text-secondary` `#334155` | **1.19** |
| `--color-text-muted` `#64748b` | **1.82** |

**Severity is low because it is unreachable** — this is dead CSS, not a live user-facing failure. But it is the P6 defect in its ninth costume: content that exists, is written to standard, and that nothing in the product can ever reach.

**🟢 RESOLVED same day — code removed, decision kept open.** `css/base/global.css` block removed and archived in full to `Documents/Archive/alongside_light_mode_removed_css_12aug2026_v1.md`, with reasoning, the verbatim CSS, and what a real implementation needs. `sw.js` v268, cache **alongside-v268**. Zero live effect — every rule was scoped under a class never applied. Also removed `--color-bg-surface`, a token defined only inside that block and read by nothing.

**The initial recommendation to delete on the grounds that "light mode is not on any roadmap" was wrong reasoning and is corrected here.** Dark-only is a genuine accessibility limitation, not a preference: light text on dark surfaces causes halation for people with astigmatism (the text appears to smear), and light sensitivity runs in both directions. **Alongside: Move is built for neurodivergent adults, people navigating hormonal change, and people with chronic conditions and burnout — precisely the audience for whom display mode is functional rather than cosmetic.** Roadmap absence was the wrong test; audience need is the right one.

**Fixing the six tokens was rejected on its own merits**, separately from that. It yields a *reachable* broken light mode instead of an unreachable one, which is strictly worse, and overriding six tokens does not restyle 25 component stylesheets. What existed was 37 lines covering four components.

### 🔵 NEW SCOPED FEATURE — Light mode, for the beta conversation

**Not a bug fix. A feature with an accessibility rationale strong enough to justify the scope.** Not booked; needs a decision on whether it lands before or after public launch.

What it requires, recorded so it is not re-derived:
1. All eleven surface and text tokens overridden, not five — including the six that were missing
2. `tools/contrast-check.mjs` extended to run its full matrix against **both** palettes, gating on both
3. A component sweep for hardcoded hex values that bypass tokens
4. A Settings control plus a persisted store field
5. `prefers-color-scheme` as the initial default, with an explicit choice overriding it

⚠️ **A revival must start from `variables.css` v2**, not the archived block — that palette predates A11Y-1.

---

## 🟢 DIC-1 — The drop-in coach question: SHIPPED, 12 Aug 2026

**Build sequence item 1 of the tier boundary. Target WB 10 Aug 2026. Code complete and confirmed on a fresh clone of the live remote; on-device confirmation outstanding.**

`js/views/checkin.js` v13 → **v14**. `css/components/checkin-conversation.css` v7 → **v8**. New `tools/verify-dic1.mjs`. `sw.js` v253-header/v264-cache → **v265**. No `store.js` change, so `Schema.md` untouched at v1.25.

### The finding that made this cheap

**`sessionVariety` was a reader without a writer.** `store.js` declares it (default `'balanced'`, validated against `familiar | balanced | varied`) and `session-builder.js` reads it to set the novelty rate — `familiar: 0.10, balanced: 0.25, varied: 0.55`. **Nothing in the codebase ever wrote it.** No Settings control, no onboarding question, no view. The `store.js` comment reads *"the person's own answer, never inferred from behaviour"* — and the person had never been asked. Selection has been running on a default nobody chose.

So this was not a new mechanism bolted onto existing machinery. **It was the missing writer.** Third recurrence of the PT-12 reader-without-writer pattern in two days, which makes `tools/schema-check.mjs`-style gating look better value each time it appears.

### Decisions taken with Graeme

| # | Decision | Outcome |
|---|---|---|
| 1 | Where does it fire? | **End of check-in**, gated on a pending session door. One file, covers both session-generating doors, stays out of `coach-proposal`'s auto-opening options panel (where the v19 overlay bug lived) |
| 2 | What does it write? | **`sessionVariety` directly.** No per-session override field — the question fires before every coach-built session, so "today's answer" and "standing preference" converge, and a second self-clearing field would be two sources of truth for one concept |
| 3 | When is it skipped? | **Outside the 21-day window.** Precisely `session-builder.js`'s own `isAnchor()` cutoff. Outside it nothing is an anchor, so `familiar` and `varied` produce near-identical sessions and the coach would have asked a question it cannot act on |

**Recorded consequence of Decision 2, so it is not discovered later:** if a Settings control for variety ever lands, this question overwrites it every session. That is intended — what you say today beats what you set in March — but it is a decision, not an accident.

**Reasoning behind Decision 3, worth keeping:** a question that changes nothing is worse than no question, because it teaches the person the coach is reading a script rather than reading them. The spec says the same thing in its own words — *"he asks about last time, he never asks about March."*

### Copy as shipped

Coach bubble: *"Want to do something like last time, or shall we do something different today?"*

| Choice | Sub-line | Writes |
|---|---|---|
| Something like last time | Stay with the movements you've been building on | `familiar` |
| Something different | A change of pace, with movements you've not done lately | `varied` |
| Mix it up | Some of each | `balanced` |

No `.ci-panel-q` inside the panel — the coach has already asked in the thread, and asking again is the duplication v12 removed for the time question. Copy rule 10.1 holds: *variety*, *novelty* and *anchor* are ours, and none appears on screen.

### 🟠 Accessibility finding — existing failure in `coach-proposal.css`, NOT fixed (touch-once)

The nearest existing pattern, `.cp-missed-offer__btn`, puts `--color-text-muted` (`#A0B0C0`) on `--color-bg-elevated` (`#3E4C63`). **Measured 3.91:1 — below the 4.5:1 AA floor for normal text.** `--color-text-secondary` (`#A8B8CC`) on the same surface is 4.30:1 and also fails. `bg-elevated` is simply too light a surface for either muted token, and it is referenced 46+ times.

`.ci-choice` therefore **recesses rather than elevates**: surface `--color-bg` (`#1E293B`) against the `--color-bg-card` (`#334155`) panel. Label 11.87:1, sub-line 7.24:1. The surface-to-panel step is only 1.41:1, under 1.4.11's 3:1 for component boundaries, so the border carries it — `--color-text-muted` measures 4.04:1 against the panel. **Hover moves the border only**; lightening the background would push the sub-line back under 4.5:1.

**🟢 A11Y-1 — CLOSED same day.** Raised here, then fixed at the token once Graeme chose Option A. See the A11Y-1 section above for measurements, the rejected alternative, and the new `tools/contrast-check.mjs` gate.

### 🟠 Logged, not fixed (touch-once)

- **`store.set()` does not lazily init the way `store.get()` does** (`store.js` :1223 vs :1212). `get()` self-heals with `if (!this.data) this.init()`; `set()` throws `TypeError: Cannot set properties of null`. **Unreachable in the live app** — `app.js` :150 calls `store.init()` on boot — but it is a latent trap for any future call site that writes before it reads. Found by the verification harness, which is the point of having one.
- **🟠 DOC-2 — `Schema.md` v1.25** correctly states store.js v30 in its header, but a body line two paragraphs down still reads *"`store.js` remains v21"*, left over from the v1.20 text. One-line fix, not booked.

### ✅ DOC-1 closed

`sw.js` header entries had stopped at v253 while `CACHE_NAME` reached v264 — eleven bumps during the long 12 Aug session went in without header entries. **Recorded as a stated gap rather than eleven reconstructed entries**, since inventing them after the fact would be worse than saying so. The counter is correct from v265 forward.

### Verification

`tools/verify-dic1.mjs`, 12 assertions, written before the change was trusted. Cross-file value contract (`checkin.js` ↔ `session-builder.js` ↔ `store.js` whitelist), the window constant, `SESSION_DOORS` against `today.js`'s `requiresCheckin: true` doors, `exerciseStats` boundary maths at 20/21/22 days, and validation round-trip including rejection of a bogus value. **All pass on a fresh clone of the live remote.**

Two harness failures occurred and **both were the harness, not the code** — a relative import path, and the `store.init()` omission above. Consistent with v151's note that the first verification run was wrong and the code right six times out of six on 11–12 Aug. Checking the source before accepting a failure remains the rule.

### Still open on DIC-1

- **On-device confirmation.** Sits behind Graeme's agreed sequence: trace clean through code, fix, re-trace, then verify on screen
- **Tier question not asked, and built for everyone deliberately.** The spec says *free users get* the drop-in question. Gating it to free would leave Personal users with a worse coach than free, since the plan (build item 5) does not exist yet — and P1 says the coach never withholds what it can see. Built unconditionally. **Flagged for Graeme to overrule if he wants it free-only**
- **Build item 2** — condition-aware empathy selection — is the next cheapest item and is unblocked

---

## 🎯 THE TIER BOUNDARY — decided 12 Aug 2026

**Two new documents in `Documents/Business/`. These now govern all product decisions and every future proposal must pass them.**

- `alongside_tier_boundary_12aug2026_v1.md` (**v2**) — why someone pays
- `alongside_destination_architecture_12aug2026_v1.md` (**v1**) — the specification for the paid spine

### The answer

> **Free is the session. Personal is the plan.**
> Free gives you a coach for today. Personal gives you a coach who knows where you're going.

From Graeme's track analogy: you turn up and ask his daughter's athletics coach for a session. He gives you a real one, properly judged, genuinely worth having. **He withholds nothing — there is nothing to withhold, because you named no destination.** Anna named one, so she has a plan that adapts every week. **Naming a destination is the paid act**, identically for body and mind.

### Three answers rejected as conversion arguments — but KEPT as retention

Recorded in full in the tier document so no future session deletes them as dead ends:

| Concept | Stay | Pay |
|---|---|---|
| Deepening relationship over time | ✅ Keep | ✗ 97% gone before day 30 |
| Impact allocation and the vote | ✅ Keep | ✗ *"Why not just give them a pound?"* |
| Transfer outward to real life | ✅ Keep (the arc) | ✗ Patronising; assumes the app knows your life |

**Common fault: all three priced feelings. Feelings are why people stay and talk. Capability is why they pay.**

### Ten destination shapes — body AND mind

**Body:** Endurance · Strength · Return · Consistency · Composition · Preservation
**Mind:** Steadiness · Restoration · Presence · Connection

A destination carries one body shape and/or one mind shape. **A mind-only destination is not a lesser answer.** An earlier draft offered body only, which reproduced exactly the mind/body split the product exists to refuse.

### Decisions that changed existing behaviour

- **In Step moves to FREE.** It is a practice, not a journey. The paid act is naming a destination, not access to content
- **Free gains the drop-in coach question** — *"Something like last time, or something different?"* This is what makes free a coach rather than a generator
- **The upgrade door is visible at ALL times**, never triggered by our judgement of readiness. Graeme's correction: *"That's us deciding when the user is ready. I might have got bored at day nine and gone."* P3 governs interruptions; a permanent non-interrupting surface is not one
- **Never say "upgrade to Personal" in-product** — the possessive collision makes it read as *"you shouldn't ask me that."* Offer the capability in plain English; name the tier only where money changes hands
- **Restoration is declared, not gated.** Crisis is not burnout. Requires a declaration that is not a one-time footnote, visible routing to real help, crisis policy v7 wired live throughout, and the copy rule **"company on the road, never recovery"**
- **Mind progress is never measured.** Graeme's psychologist framing: invite the practice, the journal belongs to the person, export for a real professional if they choose

### Three copy rules — non-negotiable, each earned from a real mistake

1. **No internal terms in user-facing copy.** A draft used *"a Connection journey"* — a term invented an hour earlier that no user has ever seen
2. **Every offer answers three questions in order:** what is it, what would it do for me, how do I get it
3. **The read-it-cold test.** Read every line as someone who has never seen the document. This caught *"I don't know where yours is"* in the check-in openings, and then caught the Connection line

### Build sequence

| # | Item | Tier | Notes |
|---|---|---|---|
| **1** | **Drop-in coach question** | Free | **Start here.** Independent of everything, uses existing `exerciseHistory` |
| 2 | Condition-aware empathy selection | Free | Prompts/stages/conditions all exist; only the matcher is missing |
| 3 | The always-visible door | Both | Cheap; stops losing people at day nine |
| 4 | Grounding moments | Free | In-exercise layer. Earns the pub sentence |
| 5 | **The plan** | Paid | **Largest piece. Does not exist yet** |
| 6 | Progress that reads | Paid | Depends on 5 |

**⚠️ §9 of the tier document is the important line: the plan does not exist yet.** `programmes.js` and `programmeEngine.js` are not a destination-driven adaptive road.

---

## 🔧 Third-pass trace fixes — shipped 12 Aug 2026

`sw.js` v263 → **v264**. `session-builder.js` → **v22**, `store.js` v29 → **v30**, `Schema.md` v1.24 → **v1.25**, new `tools/schema-check.mjs`.

| ID | Finding | Resolution |
|---|---|---|
| **C1** | 🔴 **Safety.** `capability.legPower` read by `capabilityProfile()`, never declared/written/asked — always fell back to `'full'`, so a wheelchair user was served **Seated Leg Extension**, the exact exercise the v29 note exists to prevent | Declared; default now conditional (`'limited'` when `needsSeated`). Gate then caught a second fault: `_loadsLegs()` proxied "loads legs" as "has equipment OR difficulty 3+", so a bodyweight leg extension passed. Leg movement patterns now count on their own account |
| **C2** | 🔴 140 of 556 entries are `contentType: 'practice'` (complete standalone sessions) and `session-builder.js` never read the field — a 60-min cardio build returned **C25K Week 1 AND Week 2 AND a 20-minute run** | Practices excluded from component selection |
| **C3** | 🔴 `ex.sets \|\| 3` tripled duration-based exercises; 60-min request labelled **"552–562 mins"** | Fixed at both parallel call sites |
| **C4** | 🔴 Found because C3 exposed it: fixed exercise counts ignore how long each takes; 60-min request produced 104 min of work | Sessions trimmed to requested duration. **Never trims warmup, cooldown or prescribed** |
| **A1/A2** | 🟠 `Schema.md` claimed store v21 when live was v29; documented `liftLogEnabled` default `false` when live is `true` | Reconciled to v30. **`liftLogEnabled` default-on needs Graeme's confirm or overrule** |
| **A3** | 🟠 A store-path audit would not have caught C1 or C2 | `tools/schema-check.mjs` — exits 1 on drift, can gate a commit |

**Retracted:** third-pass §3 ("exercise count no longer responds to duration") was **wrong**. `EXERCISE_COUNT` sets 60 min = 17. That is the allocation working as designed; earlier variation was pools running dry pre-CON.

### Still open from the third pass

- **C1 second half** — the conditional question (*"Do your legs take weight?"*, fires when `chairRise !== 'yes'`). **Wording needs Graeme's sign-off before it ships**
- **A2** — confirm or overrule `liftLogEnabled` default-on
- **Ten mis-tagged practices** (Savasana, pre-sport warm-ups) genuinely are components. Data pass, not a fix session
- **Practices must remain reachable** via Coach decides / Library / Mobility — confirm, or 140 entries became invisible

---

## 🔒 Locked Principles — agreed 11–12 Aug 2026

Seven principles agreed with Graeme in conversation. **Every future proposal must pass all seven.** They exist because the product's differentiation is a set of refusals, and refusals decay silently unless written down.

**P1 — The coach never sells, and never withholds what it can see.**
If the coach has noticed something, it says it. Free. Personal buys **tools** (choose session type, choose duration, log lifts, export, longer windows), never *deeper coaching*. The moment the coach's helpfulness becomes tier-dependent, "trust me, I've got you" becomes "I've got you up to a point," and a conditional promise is not a promise.

**P2 — The coach never talks about the app. A separate, visually distinct helper layer can.**
Graeme's Disney point, and it corrected an over-absolute position. Disney's cast members are visibly not characters; the frame holds *because* of the distinction. What would break it is Mickey discussing queue times. So the coach coaches, and a legibly different helper layer teaches the interface.

**P3 — The app never teaches in the abstract. It offers at the point of friction, triggered by something the person did, never on a timer.**
One deliberate exception: the periodic re-ask (WOW-5), which is coaching rather than teaching.

**P4 — The app may display load. The coach never interprets it.**
Graeme's point, and the most important thing agreed in the whole conversation. No commentary on the delta in either direction. No "slightly lighter today," no "up from last week," no arrows, no colour-coding, no "new best" badge. **The asymmetry is the reason:** silence on a drop is only credible if there is also silence on a rise. The moment the app cheers an increase, its silence on a decrease becomes a judgement. Celebrating is what creates the shame — you cannot have one without the other, which is why default-none is structural rather than a preference. Presentation is a flat unnarrated reference line (`Last: 60kg`) in the exercise meta, not coach voice. A Settings "Celebrations" group may sit on top, **default off** — someone who turns it on has asked for it, which is a different thing entirely.

**Framing note that produced P4, worth keeping:** *"Here's what you did"* has a comparison buried in it, and the comparison has a verdict attached. Behind it sits *"here's what you failed to achieve against last time."* There are British sprinters who have not PB'd in years; it does not eradicate their progress, commitment or quality. A flat or falling number carries no information about whether today was a good day — it was hot, they slept badly, they came anyway, which is the harder thing.

---


**P5 — No view defines exercise content. Views render; `js/data/exercises/` is the only source.**
Agreed 11 Aug after the third recurrence in two days. A fix applied to the database must not need applying twice. The private pool in `session-builder.js` cost three separate double-fixes (PT-11, CON-2, PT-19), each second application found only after somebody hit the bug live.

**P6 — Content existing is not the same as content being reachable.**
Agreed 12 Aug after the same defect appeared eight times in one day, in eight different forms, none of them found by the code. Any change to categories, equipment vocabulary, session types or routes must be followed by `Documents/Admin/Templates/audit-content-reachability.mjs`. A tick that unlocks nothing, a category that matches nothing, a route pointing at a missing file, and a contraindication naming a condition that does not exist are all the same defect wearing different clothes.

**P7 — Confidence scales with information; authority never does.**
Agreed 12 Aug. When the coach has been told something — a named sore area, and an exercise that loads it — it says so specifically rather than hedging, because hedging what we have been told is a coach pretending not to know. But the adjustment itself stays an invitation: *"consider taking some weight off"*, never *"take some weight off"*. The coach knows which exercise works which area; the person knows how it feels today. Naming the first without commanding the second is what respects both.

## 🛠️ WOW Build Sessions — 11 Aug 2026

Built from `alongside_wow_blueprint_11aug2026_v1.md`. All three verified by Node assertion and confirmed on a **fresh clone of the live remote**, per standing practice. **None is on-device confirmed** — that gate remains outstanding for all three.

### WOW-2 — Sessions that fit the person 🟢 Shipped (PT-2, PT-9)

`workoutGenerator.js` v1.13→**v1.14**, `exercises.js` + `exercises/index.js` v1.3→**v1.4**, `exercises/yoga.js` v1→**v2**, `sw.js` v225→**v226**.

`getUserProfile()` now falls through to `lifestyle.activityLevel` — the field live onboarding actually writes — with `fitnessLevel` retained as an explicit override so the Settings control still wins. Added a `returning: 6` ceiling (the fifth ACTIVITY_CHIP had no key and silently resolved to moderate). `yoga-crescent-lunge` given `energyRequired: 3`, making it reachable for the first time.

**Measured delta:** Tom's pool 330→254, exercises above his ceiling **76→0**. Priya's pool 350→359, hardest tier (energyRequired 9) available **0→8**.

**Note for the record:** the first verification run reported two FAILs. Both were the test's assertions being wrong, not the code — Tom's pool was +1 because Crescent Lunge became reachable, and the override test compared Tom (no equipment) against Priya's figure (six gym items). Re-run with corrected assertions rather than waved through.

### WOW-1 — Stop the under-reporting of effort 🟢 Shipped (PT-3)

`workout.js` v7→**v8**, `core-session.js` v6→**v7**, `yoga-session.js` v7→**v8**, `sw.js` v226→**v227**.

None of the three had a session-level clock, so every completion wrote `durationMins` null or absent and `progress.js:138` summed it as zero. Added `sessionStartTime` + `elapsedMins()` to each, mirroring `gym-programme.js:806`. Latched once at genuine session start, cleared on reset — necessary because `workout.js`'s `onMount()` re-fires on every timer toggle and rest timers re-enter the session phase. One-minute floor so a real completion never reports zero.

**All six `activityLog` write paths** across the three files now supply a real duration, including the three partial-exit paths that previously wrote explicit `null`.

**Measured delta:** Tom's three-week Progress **22→87 minutes**, four sessions all counted.

**Two things the verification caught that would otherwise have shipped wrong:** `core-session.js` had a *second* `durationMins: null` on its partial-exit path missed by the first pass, and `workout.js` needed the latch guard or the clock would reset mid-session on every timer tap.

### WOW-0 — Restore the legal consent record 🟢 Shipped, ⚠️ dependencies open

`store.js` v18→**v19**, `Schema.md` v1.17→**v1.18**, `thread.js` v7→**v8**, `privacy.js`→**v2**, `onboarding-thread.css` v4→**v5**, `sw.js` v227→**v228**. Schema first, per standing rule.

**The gap:** live onboarding had captured **no legal consent record at all** since OB-THREAD retired `welcome.js`. `welcome.js:85-86` was the only writer of the flat `consentGiven`/`consentAt`, and that route left `router.js` VIEW_NAMES in v7. Found by the PT-W1 store audit, not by anyone noticing.

New nested `consent{ given, at, policyVersion, ageConfirmed }`. Nested rather than flat for the coming Supabase migration, where PT-10 already flagged undeclared flat fields as a real loss risk. `mergeWithDefaults()` guards it so a real record is never overwritten by defaults — an existing user's timestamp is a legal audit trail.

**Affirmative tick, not implied consent** (Graeme's decision). `welcome.js` used "by tapping Start you agree", which leaves the "but I didn't know" problem open.

**Accessibility:** Continue uses `aria-disabled` + `.is-inactive`, **never** the HTML `disabled` attribute — that removes an element from the tab order entirely, which is exactly the PT-7 bug found in `session-builder-ui.js`. Tapping unticked shows an inline message and moves focus to the checkbox. Checkbox 24px in a 44px row (SC 2.5.8); links underlined not colour-only (SC 1.4.1); inactive opacity 0.55 matching `tier-gating.css` rather than a third value.

**Age gate: built and INERT.** `AGE_GATE_ENABLED = false` in `thread.js`. **Do not flip** until A1.11 (ToS 13+ vs business-doc 16+) resolves and Natalie's written advice lands. Flipping it early is worse than leaving it off — it produces an audit trail asserting an eligibility check with no agreed rule behind it.

**Two false statements found live in `privacy.js` and removed:**
- **"Build New Habits Ltd"** — sole trader, no limited company exists. Same error fixed on the website 03 Aug and missed here.
- **"ICO registered"** — it is not. Gated on BIZ-1 (HMRC), still open. The app was telling users their data sat under a registration that does not exist, on the one screen where accuracy matters most. Removed, not softened.

Footer now reads "Build New Habits · Somerset, United Kingdom". `privacy.js` reframed as an explicit *summary* pointing at canonical website documents.

---

---

## 🛠️ WOW Build Sessions — continued, 11 Aug 2026

### WOW-4 — Nothing is a dead end 🟢 Shipped (PT-7)
`session-builder-ui.js` v4→**v5**, `progress.js` v2→**v3**, `progress.css` v2→**v3**, `sw.js`→**v229**.
Locked types/durations moved onto `auth.js`'s `lockedFeature()` — the HTML `disabled` attribute removed them from the tab order, so the "Personal tier" label was unreachable and tapping did nothing. Also removed `session-builder-ui.js`'s private `isPremium()` duplicate (which had already caused one real bug, the v2 `userTier`/`tier` fix). **Free Progress window 7→30 days** — coherence, not generosity: a 7-day window cannot show variability, so the free tier was the coaching removed rather than a smaller version of it. 90 days now a visible locked tab.

### WOW-3 / PT-1 — The coach remembers 🟢 Shipped
`checkin-openings.js` v2→**v3**, `sw.js`→**v230**, **v231**, **v232**.
The territory branch matched IDs that have never existed anywhere — the retired `hard-before.js` used the same seven live IDs, so this never matched at any point in the product's life. Five of seven given purpose-written rows rather than approximated: mapping `trust-rupture` onto `past-failure` would put the failure on the person, the opposite of what they said.
**Two follow-ups after Graeme's review:** `escalation-trap` dropped "We're not doing that" (a guarantee the app cannot keep); `hormonal-change` → **`changing-body`**, reframed after Graeme's point that bodies change at every age for a hundred reasons. That reframe also fixed a second fault — the row said *"Do you remember telling me…"* but fired on an inference from `ageBand`, so the coach claimed a disclosure that never happened. Now an observation, not a recollection, and no longer age-gated.
**Copy audit** of all 19 rows after Graeme flagged an orphan referent. One real fault fixed, one grammatical tidy. Established for future copy work: **"one" meaning "session" is a house convention** in this file, predating today.

### PT-4 / WOW-6 — Lift notes 🟢 Shipped
`store.js` v19→**v20**, `Schema.md` v1.18→**v1.19**, `gym-programme.js` v5→**v6**, `settings.js` v14→**v15**, `gym-programme.css` v1→**v2**, `sw.js`→**v233**.
Rescoped from analytics to a **memory aid** on Graeme's framing. Flat unnarrated `Last: 60 kg × 8` plus a weight/reps capture. Off by default; Settings → Equipment.
**P4 enforced in code, not just intended:** `lastLift()` returns the entry only and no delta is computed anywhere, so a future caller has nothing to narrate. The test greps the rendered block for banned language. **Tier: recall free** (the coach remembering is not something to charge for, P1); analysis/trends/export Personal, **not built**.

### PT-11 — Fourth exercise pool, never filtered on fitness 🟢 Shipped
`session-builder.js` v3→**v4**, `sw.js`→**v234**.
**Found by the second trace, not by reading.** This file carries its own 65-exercise pool, separate from the 461-exercise database, and never filtered on fitness — so WOW-2 reached `workoutGenerator.js` but **not the "Cardio, Core & Strength" Home door**. A sedentary beginner and a gym-literate lifter got the identical pool. `difficultyLevel` was written on all 65 and read nowhere. Ceiling applied using the existing field; warmup/cooldown exempt so the safety floor cannot be starved. **Pool merge logged, not attempted** — four parallel pools is architecture.

### PT-12 — The reader-without-writer pattern, closed 🟢 Shipped
`store.js` v20→**v21**, `Schema.md` v1.19→**v1.20**, `gym-programme.js` v6→**v7**, `journal-entry.js` v3→**v4**, `morning-session.js`, `intention.js`, `sw.js`→**v235**.
Five confirmed instances made this the codebase's characteristic failure mode. Swept the remainder:
- **`exerciseFeedback`** — read by `applyFeedbackWeighting()` since v1.3, written by nothing, so the weighting had never run on real data. New `store.logExerciseFeedback()` wired to the existing "Skip this one" — a signal already given at the point of friction, no new UI, nothing said back (P3).
- **`journalEntryType`** — written by three call sites, read by none since the v3 privacy rewrite. Now read and cleared. **Journal Privacy Rule untouched** — prompt only.
- **`checkin.energy`** — never written. **Three** reads in `morning-session.js`; energy silently defaulted to 5 and `energyBefore` was always null. Third site found by a failing assertion, not by reading.
- **`todayEnergy`** — never written. Fallback retired.
- **`exerciseFeedback` and `absence.returnCapturedAt` declared** — previously surviving only via the `...saved` spread, the exact PT-10 migration risk.

---

## 🔬 Second Persona Trace — 11 Aug 2026

Full report: `Admin/alongside_persona-wave1_second-pass_11aug2026_v1.md`.

**Tom:** exercises above his ceiling **76 → 0**; Progress **22 → 87 minutes** (4 of 4 sessions counted, was 1 of 4); window 7 → 30 days; consent record none → tick + timestamp + version; day one now answers what he actually said.
**Priya:** hardest tier available **0 → 8**; "Lower body" tap now routes instead of doing nothing; `Last: 60 kg × 8` where the app previously captured no numbers at all.
**Unchanged and confirmed:** same-day return correct; warmup floor intact across all 21 type/preset combinations; `generic` still reachable for someone who skipped the age question.

**Still not resolved for Priya:** the analysis half of PT-4. She can stop using her Notes app at the machine (the stated need) but still cannot see load move over a month (the stated desire). Different things; one is done.

**Verification note worth keeping:** across today's sessions the first verification run was wrong and the code correct **five times**. Two real bugs were caught by assertions that would otherwise have shipped — `core-session.js`'s second `durationMins: null`, and `morning-session.js`'s third `checkin.energy`. The discipline that mattered was checking the source before accepting a failure.

---

## 🛑 RECOMMENDATION ON RECORD — run the device pass, and it is now overdue

**Restated 12 Aug, stronger than at v149.** v149 said stop building and run the device pass. Instead, 62 further commits shipped across 18 cache versions. Every one is verified by node assertion, fresh-clone check and regression matrix — and **none by a human holding a phone.**

That is not a criticism of the work; every finding came from Graeme using the product, which is exactly the right source. But the gap between "verified" and "confirmed working" is now eighteen cache versions wide, and beta starts mid-September.

**The single highest-value path through everything shipped today:** clear cache → build a gym Full Body → complete it. That one route exercises the pulse-raiser, equipment preference, watch-outs, load guidance, in-card notes, not-a-fan, session rationale and the progression invitation together. Then a check-in, for the scroll fix and the "I'm ready" pacing buttons — both judgement calls that cannot be tested any other way.

---

## 🔬 Third Persona Trace — 12 Aug 2026

Eight personas run against live code over simulated 6–8 week periods, not read but **executed**. Findings, all fixed the same day:

| Persona | Finding |
|---|---|
| **2.10 Dad, 76, frail** | Served **High Knees** as his opening pulse-raiser. The difficulty ceiling applied to `main` only; warm-ups were exempt on reasoning that held while they came from 70 hand-written warm-ups and stopped holding at CON-6. |
| **2.11 Mum, 76, low confidence** | Served **Warrior III**, a single-leg balance pose and a genuine fall risk. Root cause: 30 entries carried no `difficultyLevel`, and every read was `(ex.difficultyLevel \|\| 1)` — treating untagged as the *easiest possible*, which is backwards for safety. Separately, her Mobility session opened with **five breathing practices in a row**. |
| **2.15 Priya, 27, gym 4×/week** | Her eight most-repeated exercises after eight weeks were three cardio warm-ups and five accessories — **not one barbell lift**. CONT-1 anchored uniformly, and thin categories repeat while deep ones rotate, so it anchored what did not matter. |
| **Wheelchair user** | Correctly given seated work, then handed **Seated Leg Extension and Seated Hamstring Curl**. The screen asked whether he could rise from a chair; it never asked whether his legs work. Also 68% session-to-session overlap — the identical workout for eight weeks. |
| **2.13 / 2.14 ADHD vs autistic** | Both received ~51–57% overlap: one treatment serving neither. `sessionVariety` now separates them (23% vs 45%). |
| **All sessions** | **12% contained a duplicate exercise.** CON-6's per-category object spread defeated the identity-based dedupe guard. |

**Selection criterion confirmed again:** the personas with the least data and the most constraint surface the most defects. A wheelchair user and two 76-year-olds found six of the eight.

---

## 📁 Canonical documents and tools — current as of 12 Aug 2026

Every artefact below is committed to `build-new-habits/alongside-app`. This index exists because several were written on 12 Aug and referenced nowhere, which is the document version of the reachability defect this session spent the day fixing.

| Document | Location | Version | What it is |
|---|---|---|---|
| **Master schedule** | `Documents/Admin/master_schedule.md` | v150 | This document. Source of truth; wins over project knowledge on any conflict. |
| **Schema** | `Documents/Live State/Schema.md` | v1.24 | Canonical store field reference. Ground-truthed against `store.js` v29. |
| **Exercise Entry Standard** | `Documents/Live State/exercise_entry_standard.md` | v2 | Canonical definition of every content field on an exercise. Includes the `watchOut` rules, the effort-relative `load` rule, and the no-time-stamped-horizons rule. **Anything authored from now is written to this.** |
| **Content consolidation blueprint** | `Documents/Admin/alongside_blueprint_content_consolidation_11aug2026_v1.md` | v1 | CON-1 to CON-9 plan. All nine now complete. |
| **Entry validator** | `Documents/Admin/Templates/validate-exercise-entries.mjs` | v1 | Checks all 556 entries against the Entry Standard. Build-time only. |
| **Reachability audit** | `Documents/Admin/Templates/audit-content-reachability.mjs` | v1 | Categories, exercise reachability, equipment vocabulary both ways, contraindication validity, missing view files, orphaned routes. Build-time only. |

**Key code files introduced or restructured on 12 Aug** — all live, all in `js/`:

`data/equipment-map.js` (equipment vocabulary resolver), `data/session-categories.js` v5 (maps the builder's 49 categories onto the shared database), `data/session-rationale.js` (the coach explaining the programme, plus the progression invitation), `data/exercises/gym.js` v3, `data/exercises/seated.js` v2, `views/community-impact.js`, `views/annual-reflection.js`.

**Run before any deploy touching content, categories, equipment or routes:**
```
node "Documents/Admin/Templates/validate-exercise-entries.mjs"
node "Documents/Admin/Templates/audit-content-reachability.mjs"
```

---

## 📋 New task rows — 12 Aug 2026

| Task | Status | Notes | Next |
|---|---|---|---|
| **INF-AUDIT — content and navigation reachability audit** | 🟢 **Built and in use, 12 Aug.** `Documents/Admin/Templates/audit-content-reachability.mjs`. Checks categories, exercise reachability, equipment vocabulary both ways, contraindication validity, missing view files and orphaned routes. | Caught two defects *while being used to fix others* — a reintroduced `chest-acute`, and a `breathing-warmup` narrowing that left one candidate. | Run after any content, category, equipment or route change. |
| **BUILD-DEVICE — on-device confirmation pass** | 🔴 **Overdue.** Eighteen cache versions unconfirmed. | Gym Full Body end to end, then a check-in. | **Next session. Nothing else should precede it.** |
| **CONT-3 — remaining session views log a count, not exercise ids** | 🟠 **Open.** `core-session.js`, `yoga-session.js`, `prescribed-session.js` still write `exercisesCount` only, so their exercises never become familiar and CONT-1 does not apply to them. | One field each, same change as `gym-programme.js` v9 and `workout.js` v10. | Book after the device pass. |
| **CAP-6 — intent and variety questions have no screen** | 🟠 **Open.** `trainingIntent` and `sessionVariety` are live in the engine and read by selection. Nothing asks either question, so every user runs on defaults and the maintain/recover branches are unreachable. | Wording proposed for intent ("What are you hoping for right now?") and variety; **both need Graeme's confirmation before build.** | Decision, then build. |
| **DATA-1 — `contentType` retirement** | 🔴 **CLOSED as WILL-NOT-DO, 12 Aug. The claim in this row is WRONG and must not be acted on** — `contentType` is read in two live places (`session-builder.js:973`, `session-categories.js:96`) and retiring it would make 140 standalone practices selectable as session components. Original finding, true when written and invalidated by CON-6: Written on 368 of 556 entries, read by nothing anywhere. `category` is what the engines select on. | Deliberately not bundled into the 12 Aug session — it touches 368 entries across 12 files for no functional gain, and that is how mistakes get made. | Clean standalone task. |
| **DATA-2 — 49 loaded exercises carry no `sets`/`reps` fields** | 🟡 **Open.** The card shows a duration where a gym user expects 3 × 10. 44 of the 49 state it in their `instructions` prose, so the information exists in the wrong place. | Extraction from prose is error-prone and has deliberately not been guessed at. | Manual pass, or a per-entry decision. |
| **NAV-1 — two orphaned views remain** | 🟡 **Open.** `coach-reflection` and `mobility-conditioning` have views and nothing navigates to them. | Down from 6. | Decide: front door, or retire. |
| **NAV-2 — first-run navigation and goal-directed pointers** | 🟠 **Designed in conversation, not built.** Four bottom-nav items for 42 routes. Agreed approach: fix missing front doors first (done), then goal-directed pointers ("given what you told me, start here"), then a short skippable tour last — a tour of a product with hidden doors just teaches people the doors are hidden. | Graeme's idea, refined in conversation 12 Aug. | Book after device pass. |
| **CAP-7 — seated pool depth** | 🟡 **Improved, not solved.** A seated user with no leg function sees 53% session-to-session overlap against a gym-goer's much lower figure, because the eligible pool is structurally smaller (61 vs 500+). | 38 seated entries now. Genuine parity needs roughly 30 more. | Content session in its own right. |
| **RAT-2 — recovery protocols have no surface** | 🟡 **Open.** 28 exercises remain unreachable by any session type — cold showers, hydration, nutrition timing, nap protocols, visualisation practice. These are correctly *not* session items. | They need their own place in the product rather than a category. | Design decision. |

---

## 🚦 New action points from the WOW sessions

| ID | Item | Severity | Detail | Target |
|----|------|----------|--------|--------|
| **BETA-1** | **Consent gate links to two pages that do not exist** | 🟠 **Pre-beta blocker** | `thread.js`'s gate links to `buildnewhabits.co.uk/privacy/` and `/terms/`. Neither page has been built. **Graeme's decision, 11 Aug: acceptable as placeholders for now, wire later.** Not defensible at beta — asking someone to tick a box agreeing to documents they demonstrably cannot read is weaker than the implied consent it replaced. Drafts exist (`alongside_privacy_policy_draft_23jul2026_v3.docx`, `alongside_terms_of_service_draft_23jul2026_v2.docx`), both awaiting Natalie. In-app summary (`privacy.js` v2) is a working fallback and the gate does link to it, so nothing is broken today. | **Before beta start (mid-Sept)** |
| **BETA-2** | **`POLICY_VERSION` must be bumped when real policies publish** | 🟠 **Pre-beta, easy to miss** | Currently `'2026-08-11'` in `thread.js`, pinned to documents that do not exist yet and have not been through Natalie. When the real policies land, this constant **must** be bumped — otherwise every beta tester's record asserts agreement to a version that was never published, and there is no way afterwards to tell who needs re-consent. One-line change, expensive to reconstruct retrospectively. | **Same session as BETA-1** |
| **BETA-3** | **On-device confirmation of all three WOW sessions** | 🟡 | Nine files across WOW-0/1/2, none on-device confirmed. Consent gate has never been seen to render. Hard-reload past the service worker (now `alongside-v228`). Joins `gym-programme.js` v5, still the oldest outstanding test on the board. | Next device session |
| **BETA-4** | **Age gate activation** | 🟠 | `AGE_GATE_ENABLED` false in `thread.js`. Blocked on A1.11 + Natalie. Tracked here so it is not forgotten behind a code flag. | On A1.11 resolution |

---

## 📌 Still outstanding from PT-W1

Unchanged from v147 — see that version for full evidence on each.

- **PT-1** 🔴 **Decision-gated, blocking the highest-emotional-return fix.** Needs Graeme's mapping of the seven live territories to check-in openings. `the-history` → `past-failure` is obvious; `escalation-trap` and `invisible-person` likely need new content written. A code-only guess must not ship. **Offered: a drafted proposal of all seven with reasoning, to react to rather than generate cold.**
- **PT-4** 🟠 **Decision-gated.** PB logging — beta blocker or post-beta? **Rescoped 11 Aug** from analytics to a *memory aid* on Graeme's framing ("I want to know what weights I was lifting last week so I know what settings to add to the machines, rather than working blind"). Far smaller build. **Tier split agreed:** recall in session free (that is coaching, per P1), analysis/trends/export Personal (that is a tool). Presentation must conform to P4.
- **PT-5, PT-6, PT-8, PT-10** — logged, unchanged.
- **PT-7 / WOW-4** — build-ready, not yet run. Includes the free-tier Progress window 7→30 days (coherence with *variability is information*, not generosity) and swapping session-builder's locked tiles onto `lockedFeature()`.
- **WOW-5** (periodic re-ask) — spec needed. Carries the **safety edge**: condition-safety filtering only runs on conditions the app knows about, and nothing in the app ever re-asks anything. Recommended cadence 8 weeks activity/equipment, 4 weeks conditions — **unconfirmed by Graeme**.
- **WOW-7** (helper layer) — deliberately post-beta measurement.
- **`exerciseFeedback` capture** — build-ready, small. `applyFeedbackWeighting()` reads it, nothing writes it. Cheapest route to "the app noticed and adjusted without me telling it."

---
- **v146, Persona Tracing Wave 1 brief:** logged as a new brief, sourced from the existing 17-persona QA matrix rather than inventing new personas. Wave 1: persona 2.12 (blank-slate) and 2.15 (gym-literate, run as one continuous free-to-Personal journey). Method specified simulating three weeks of realistic irregular use via direct store manipulation. Three required outputs with separate evidence standards. **Now executed — see PT-W1 below.**
- **v145, `gym-programme.js` UX rebuild:** confirmed by Graeme's direct screenshot comparison that 10 Aug's content fix wasn't enough — the screen structure was still a flat scrollable list, not the one-exercise-at-a-time walkthrough every other guided session type uses. Rebuilt to match `prescribed-session.js`/`workout.js` exactly, reusing their proven markup and shared CSS classes. Week 6/12 moments, programme progression, A/B alternation, exit-guard all unchanged. Not yet on-device confirmed — the highest-priority test on the board.
- **v144, YouTube links + exercise-detail consistency audit:** all 461 exercises given tailored YouTube search terms (previously zero coverage). Connected finding: `instructions`/`coaching`/`why` were already at 100% data coverage — five views had silent field-name bugs (`gym-programme.js` alone had three) meaning content never rendered despite existing. `prescribed-session.js` fixed too (was showing zero guidance for any prescribed exercise). `walk`/`run`/`swim`/`cycle-session.js` confirmed correctly out of scope. `yoga-session.js`'s private pose pool flagged as a third parallel exercise database, not merged.
- **v143, overnight autonomous session:** small, well-evidenced fixes reducing untested surface area rather than new speculative features — matching the established pattern (phase, defer, confirm before building more). Two real bugs fixed in `noticing.js`'s reflections display (blank text and broken sort, both from a field-name mismatch since the 14 Jul journal privacy rewrite). Bodyweight-only lower-body content gap closed. One important correction, not an execution: the "orphaned duplicate" note on `exercises/index.js` was stale — it's genuinely load-bearing now, three live features depend on it, documented rather than deleted.
- **v142, Philosophy page:** built and pushed, the website's first new page since 03 Aug. Built verbatim from the locked 10 Jul architecture doc (never built until now — same quiet drop-off `/upgrade/` had). Pure prose per the locked design principles. `philosophy/index.html` v1, `site.css` v18→v19, `site.js` v6→v7 (added to nav, placed first), `sitemap.xml` v3→v4. Nav decision confirmed by Graeme: `/who-its-for/` stays out of the nav (Move-specific), Philosophy earns its slot for being family-wide. Real gap found and fixed in passing: `sitemap.xml` had never listed `/upgrade/` or `/who-its-for/` — under-listing the live site by two pages for a week. Two open questions logged for Graeme, not decided unilaterally (h1 wording, a possible attribution line for Beat 4). Not yet reviewed on a real browser.
- **v141:** Solicitor consultation held (Natalie, 30-min introductory call) — first legal conversation on record. Qualification call, not an advice call; no substantive advice given. Awaiting written response on priorities and costs. Five follow-up actions logged. Also fixed a header/footer version drift.
- **v140:** "In Step" (Noticing Hub, Personal tier) built and pushed — four movements, 16 scenarios, 3-day anti-binge cooldown, aggregate-only choice logging. `store.js` v18, `Schema.md` v1.17, `sw.js` v222. Not on-device confirmed. Two pre-existing bugs found and logged, not fixed.
- **v139:** Gym Session Builder Phase 1 built in full the same day it was scoped — location step, allocation presets with a structural warmup safety floor, three build routes, real cardio-warmup content. Node smoke tests caught a real bug pre-ship (a replace that deleted Glute Focus's entire `mainCategories` line). Also fixed a pre-existing gap: `session-builder.js`/`session-builder-ui.js` were never in the service worker precache list. `sw.js` v221. Not on-device confirmed.
- **v122:** On-device pass confirmed for today's whole body of work. Exercise rationale (already existed, now shown) and Avoid/Less-often dislike signal (applied from an already-approved spec) shipped for condition-programme candidates.
- **v121:** Feeling-word chip wrapping and invisible checkbox selection both fixed. `coach-reflection.js`'s four-option picker confirmed genuinely obsolete and retired. Aesthetics audit now tracking two confirmed instances.
- **v120:** Check-in gating made genuinely optional (session-generating doors only force check-in the first time today). Real condition-programme routes built — "Coach builds it" and "Coach recommends, I'll choose" join "Build my own," backed by a new tested selection module.
- **v117:** Phase D-1 (schema) closed — `conditionGoals`, `prescribedExercisesOrigin`. No view code yet.
- **v116:** All three Phase D decisions resolved same day they were logged — `conditionGoals` (felt-sense, matching Graeme's own framing), `prescribedExercisesOrigin` (coach-voice branch), fold-in dial scope confirmed. Blueprint at v2, fully unblocked.
- **v115:** Phases A–C confirmed on-device. Phase D blueprinted with 3 open decisions logged. Real bug found and fixed while scoping — Conditions Update door's bottom-nav/Back bug, same fix `settings.js` used once before.
- **v114:** Graeme's first on-device pass on Phase C, seven screenshots, four real fixes: auto-opened panel was covering the coach's constraint message (fixed), check-in now gates the two session-generating doors, equipment copy matched to its actual saved/empty state. Two real gaps logged not built: cosmetic polish needed, `gym-programme.js` lacks a guided walkthrough.
- **v113:** Home Nav Phase C closed — six-door Home screen, `coach-proposal.js` doors-UI removed, real `session-builder` route bug found and fixed.
- **v112:** Home Nav Phase B closed — `core-session.js`'s private exercise pool (23 objects) removed, consolidated onto the shared database. Two id-collision bugs found and fixed. Private severity threshold replaced with canonical filtering. End-to-end Node smoke-tested.
- **v111:** Multi-condition natural-language messaging, mixed-severity combined narrative, and Severe pain active Rest/Adapt choice with audit trail (`severePainChoices`) — three same-day passes closing out the condition-messaging arc. Real finding: Severe pain had no rest-day override anywhere live before this.
- **v110:** Pain Input Redesign — condition pain input converted from 4-button chips to sliders (`checkin.js` v9, `checkin-mini.js` v4), matching Energy/Mood. New canonical `getPainBand()` in `conditions.js`, replacing a fourth private severity duplicate. New Mild acknowledgment tier, previously totally silent.
- **v109:** On-device testing caught a real bug Phase A missed — `coach-proposal.js` had its own third private severity threshold, still `>=4`. Fixed (v13). Same round: three UI bugs found and fixed (feeling-word chip overflow, bottom-nav overlap on all onboarding screens, "flagged" message too easy to miss). Graeme raised the slider question, logged not yet decided.
- **v108:** Home Nav Phase A closed — `store.js` v12, `conditions.js` v1.3 (single-source-of-truth threshold fix), `Schema.md` v1.11. No view files touched.
- **v107:** Home Nav & Conditions Redesign fully blueprinted, pushed to repo. 5 more decisions resolved (coach-proposal.js reduced not retired; "Your programme" placed inside Cardio/Core/Strength; reps/sets/weights authority rule; threshold fix widened to canonical source; pool consolidation de-risked). NEW-1 (Programme Curation) and NEW-2 (fitness recalibration engine) logged separately, not folded in. Tier-gating build (S4-TG) reconciliation — was live since 03 Aug, not previously reflected here.
- **v106:** All five v2-spec open items resolved with Graeme (severity threshold, fold-in dial mechanics, Conditions Update entry point, goals/milestones). Still planning only.
- **v105:** New design spec added — Home Navigation & Conditions redesign (six-door Home screen, Conditions Update system, shared exercise-pool architecture principle), grounded in direct code tracing.
- **v98, same-day follow-up:** `userTier` bug fixed — `session-builder-ui.js`'s `isPremium()` now reads `store.get("tier")` instead of the never-written `"userTier"`. `session-builder-ui.js` v1→v2, `sw.js` v187→v188.
- **v97, Supabase schema & architecture design (design-only):** New doc `alongside_supabase_schema_design_03aug2026_v1.md`. Frankfurt region recommended; hybrid relational+JSONB table design; RLS via `auth.uid() = user_id` plus one `SECURITY DEFINER` function for Impact Credits aggregates; DPA/TIA documented as a ready 5-item checklist, still gated on BIZ-1.
- **v96, BUILD-4 Appendix A follow-up:** All 18 previously-unclassified schema fields resolved — 11 live, 5 dormant, 2 dead, zero real naming-overlaps. `Schema.md` v1.9→v1.10. Found `proposalBias` (written, never read — still open) alongside the `userTier` bug (fixed above).
- **03 Aug earlier, website session:** WCAG audit closed, `/upgrade` and `/who-its-for/` pages built, footer "Ltd" fixed, cache-busting bug fixed, comparison table ground-truth-corrected against live code (found: no difficulty-based exercise gating exists, no hardcoded programme remains, no generative programme engine exists).


---

## 🔬 PT-W1 — Persona Tracing Wave 1 Outcome, 11 Aug 2026

**Status: 🟢 Trace complete. Findings 🟠 open.** Run same day the brief was written. Executed against a fresh `git clone --depth 1` (public, no token needed) with `js/store.js` loaded standalone under Node via a `localStorage` stub, seeded with backdated three-week state for both personas.

**Method note worth keeping:** persona state was built from **what live onboarding actually writes** — established by reading `thread.js`'s `_writeAnswer()` (lines 1032–1040) against the `storeField` declarations in `onboarding-thread-data.js` — not from the specs. Both criticals below were only visible because of that choice. Building the fixtures from the spec would have hidden them completely.

**Honest caveat on the brief's own design:** the brief was deliberately written for a fresh chat with zero project history, to reduce bias. It was run in the PM chat instead, which has full history. The bias-reduction intent is therefore **partially unmet** — worth repeating properly for Wave 2 if the independence matters.

**Two corrections to the brief itself, found in the code:**
- Brief §6 says "all five focus types" in the Gym Session Builder. `session-builder.js:87` exports **seven** (`glute, upper, lower, full, core, cardio, mobility`).
- Two hypotheses were tested and **disproved** before reaching the report — `gym-programme.js:610` does not render `"3 × undefined"` (`buildSession()` assigns `sets`/`reps` at build time), and free-tier session-type tiles are not silently discarded (they are properly `disabled`). Recorded so neither is re-derived.

**Deliverables, all pushed to `Documents/Admin/`:**
- `alongside_persona-wave1_technical-report_11aug2026_v1.md`
- `alongside_persona-wave1_plain-language-summary_11aug2026_v1.md`
- `alongside_persona-wave1_narrative_11aug2026_v1.md`

**Wave 2 selection criterion, now evidence-based:** the blank-slate persona (2.12) surfaced both criticals first and was decisively more productive than the gym-literate one. Arriving with no data means no other field masks a gap. **Persona 2.5 (sister, post-cardiac, total beginner) is the Wave 2 candidate** — same "does the app actually use what it was told" question, but where the answer is a safety question rather than an engagement one.

---

### PT-W1 findings — new task rows

| ID | Finding | Severity | State | Target |
|----|---------|----------|-------|--------|
| **PT-1** | **Day-one check-in contradicts the user's onboarding disclosure.** `checkin-openings.js` `_resolveDayOne()` matches `onboarding.primaryTerritory` against `pain`/`motivation`/`history`/etc. The live IDs written by `onboarding-thread-data.js:53–61` are `trust-rupture`/`escalation-trap`/`life-interruption`/`wrong-fit`/`invisible-person`/`body-story`/`the-history`. **Zero overlap.** All seven executed — every one returns the `generic` row (`checkin-openings.js:234`): *"This is the first real one. No history yet — just you, now."* A user selecting `the-history` is told they have no history. The correct line (`past-failure`, line 227) exists and has never been shown to anybody. **Affects 100% of users who have completed onboarding.** | 🔴 Critical | 🟠 **Decision-gated, NOT build-ready.** Needs Graeme's content decision on territory→opening mapping before any code. Seven live territories vs. existing DAY_ONE rows — `the-history`→`past-failure` is obvious; `escalation-trap` and `invisible-person` may warrant their own rows. **Do not ship a code-only guess.** | WB 10 Aug — decision first |
| **PT-2** | 🟢 **FIXED 11 Aug, corrected here 12 Aug — the claim below is STALE.** `settings.js:1335` writes it, `session-builder.js:676` reads it, and `filterByFitnessLevel()` applies the ceiling. Original finding retained: **`fitnessLevel` had no live writer.** Only writers: `onboarding/lifestyle.js:268` (route retired from `router.js` VIEW_NAMES in v7 — unreachable) and `settings.js:978` (manual). `thread.js` writes `lifestyle.activityLevel` at Step 9 and never mirrors it. `workoutGenerator.js:594` falls back to `"moderate"` for everyone. Downstream confirmed live: `exercises.js:272–273` → `filterByFitnessLevel()`. **Measured against the real 461-exercise DB:** sedentary user gets 329 exercises instead of 253 (76 above his ceiling); active user gets 350 instead of 359 (9 hardest silently withheld). **Also resolves `workoutGenerator.js` v1.8's own open question** — `getSuitableExercises()` *does* use `profile.fitnessLevel`. | 🔴 Critical | 🟠 Build-ready. Recommend `workoutGenerator.js:594` reads `lifestyle.activityLevel` with `fitnessLevel` as override fallback — one source of truth, keeps the Settings override working. **Schema-first: `Schema.md` before code.** Include a `returning` ceiling (5th ACTIVITY_CHIP, currently no key in `ceilings`). | WB 10 Aug |
| **PT-3** | **Progress under-reports minutes.** `progress.js:138`/`:447` sum `durationMins`. Never supplied by `workout.js:507,553` (explicit `null`), `core-session.js:811`, `yoga-session.js:766` (omitted), `morning-session.js:178` (`duration`), `quiet-session.js:931` (`null`). Executed: Persona A's 4 sessions over 21 days → **1** carries a number. `workout` — the coach's default generated type — is worst affected. A product built so nobody feels they're failing tells a man who did four sessions he did one. | 🟠 High | 🟠 Build-ready. Touch-once scope: `workout.js`, `core-session.js`, `yoga-session.js` only. | WB 17 Aug |
| **PT-4** | **No performance/lift capture exists anywhere.** Exhaustive search across `js/`: no `personalBest`, no `oneRepMax`, no weight field, no `type="number"` or `inputmode="numeric"` in any session view. `gym-programme.js:610` displays prescribed `sets × reps`, never captures actual. **Persona-matrix Section 4 decision 2 (PB logging as a Personal-tier feature) is specified and never built** — same "specified but never built" pattern as empathy transfer and `exerciseFeedback`. **Direct consequence for the tier proposition:** everything Personal unlocks is orthogonal to progressive overload. Persona 2.15's matrix open question now answered — the tier isn't the issue, what she wants isn't there at either price. | 🟠 High | 🟠 **Decision-gated.** Beta blocker or post-beta? Affects the Personal value proposition and any pricing copy. Not booked. | Decision needed |
| **PT-5** | **`store.logSession()` is dead code.** Defined `store.js:966`, **zero callers**. `progressLog` written instead by `programmeEngine.js:92,112`; read by `programmeEngine.js:125,232` and `gym-programme.js:288`. `progress.js` never reads `progressLog` at all. Field-name split: `logSession()` writes `durationMinutes`, `logActivity()` writes `durationMins`; `gym-programme.js:820,833` writes both to different logs in one handler. | 🟡 Medium | 🟠 Decision: retire `logSession()`, or wire `progressLog` into Progress. Not both. | Not booked |
| **PT-6** | **Four views bypass `store.logActivity()`** — `morning-session.js:189,226`, `breathing-session.js:253`, `quiet-session.js:934,971`, `activity-log.js:221` — losing the 10-second dedupe guard that exists precisely to prevent the B3-3 duplicate-write bug. `morning-session.js:200–203` documents this as deliberate; the field-naming divergence in PT-3 is the direct result. `morning-session.js:175` also writes `date` as `"YYYY-MM-DD"` with no `completedAt` — tolerated by `today.js:239` and `progress.js:133`, no live break, but fragile. | 🟡 Medium | 🟠 Logged. Fold into PT-3's session if scope allows. | WB 17 Aug |
| **PT-7** | **Three different "locked" treatments, one a dead end.** `lockedFeature()`+`tier-gating.css` (`auth.js:95`, used only by `noticing.js:285`) — opacity 0.55, tappable→`/upgrade`, `tabindex="0"`. `progress.js:247–259` — tappable, keyboard-reachable. `session-builder-ui.js:230–252` — inline `opacity:0.45`, **`disabled`, so no tap-through and removed from tab order entirely.** Its `aria-label="… -- Personal tier"` (line 235) is therefore unreachable by keyboard/SR users. Conversion dead end and an information-parity gap. `tier-gating.css` was built 03 Aug for exactly this and is used once. | 🟡 Medium | 🟠 Build-ready. Swap session-builder tiles onto `lockedFeature()`. **Contrast ratio at 0.45 needs on-device measurement** — disabled controls are exempt from WCAG 2.2 SC 1.4.3 so not a strict failure, but inconsistent with the design system's own 0.55. | WB 17 Aug |
| 🟢 **PT-8 — CLOSED 12 Aug 2026 by device pass.** The count is now **17 exercises**, not 4. Graeme, on the 60-minute cardio build: *"I would estimate it would be about an hour with rests between activities."* The "55–65 mins" label is accurate. The original finding described a real fault that has since been fixed by other work; nobody re-verified it. **Do not re-raise.** Original entry: **Session duration is a display string, not a number** (`"55–65 mins"`) — nothing downstream can compute against it. Executed all 7 types × 3 presets at 60 min: `glute` 17 ex, `lower` 17, `full` 17, `upper` 11, `core` 8, `mobility` 7, **`cardio` 4** — all labelled "55–65 mins". BUILD-5's logged residual ("short-exercise focus types land under target") resurfacing at long durations where it's far more visible. | 🟡 Medium | 🟠 **Needs on-device confirmation** of actual elapsed time for a 60-min cardio build before scoping. Simulation gives exercise counts, not wall-clock. | Not booked |
| **PT-9** | **`yoga-crescent-lunge` has no `energyRequired`** — 1 of 461. `exercises.js:187` filters `ex.energyRequired <= ceiling`; `undefined <= 8` is `false`, so it is excluded for every user at every ceiling below 10. Unreachable in the live app. | 🟢 Low | 🟠 One-line data fix. Fold into any exercise-data session. | Opportunistic |
| **PT-10** | **Three undeclared store fields** — `totalCredits` (written by 6 views, read `workout-complete.js:18`), `homeEquipment`/`gymEquipment` (written `onboarding/equipment.js:156–157`, read by `settings.js:634–635` and `session-builder-ui.js:338–339,777`). Absent from `getDefaults()`; survive only via the `...saved` spread at `store.js:216`. Invisible to `Schema.md`, and would be silently dropped by any migration rebuilding from defaults. | 🟢 Low | 🟠 **Gates Supabase schema work.** Add to `getDefaults()` and `Schema.md` first. Schema-first rule applies. | Before Supabase session |

---

### PT-W1 — confirmed working, recorded so it isn't re-derived

| Behaviour | Evidence |
|---|---|
| Same-day return gating | `today.js:363–378`. Three scenarios executed (fresh morning / post-session same day / morning-session same day). First door tap of the day gates to `checkin`; later taps route straight through; Home coach line correctly switches to "You moved today — that's done." All correct. |
| `pendingDoorRoute` round-trip | Set `today.js:375`, honoured/cleared `checkin.js:667–669`, `checkin-mini.js:439–441,527–529`. Skip path honours it (v6). No leak. |
| Coach voice Nurturing-only | No picker in `settings.js`; removal documented `settings.js:116–117`; `coachStyle` retained internally only. Matches the standing rule exactly. |
| Per-location equipment in Settings | `settings.js:633–652`. The 10 Aug fix is live and correct. |
| `gym-programme.js` v5 field names | Old names (`setup`/`whyThis`/`videoUrl`) appear **only** in the changelog comment at lines 53–54. Live code reads `instructions`/`why`/`youtube`. v4's fix held through the v5 rebuild. |
| Exercise content coverage | `instructions`, `why`, `coaching`, `youtube` all **461/461 (100%)**. |
| Invalid session type | `buildSession({sessionType:'strength'})` → `null`; `gym-programme.js:516` guards and falls to `renderNoSession()`. Degrades safely. |
| Condition/return-based day-one openings | Unaffected by PT-1. `chronic-condition`, `injury-recovery`, `return-to-fitness`, `feel-good` all still reachable. Damage is confined to the territory and age branches. |

**Still open from PT-W1, not itself a finding:** `gym-programme.js` v5 remains **not on-device confirmed** — unchanged from v145/v146, still the highest-priority test on the board. Code tracing raised no new concerns about it, which is not the same as confirming it.

---

## ⭐ THIS WEEK — WB 27 Jul

- [x] ~~**Send solicitor pack to Alex**~~ — done, 24 Jul.
- [ ] **Safeguarding reviewer outreach** — still open.
- [ ] **HMRC sole trader registration** — untouched.
- [x] ~~**BUILD-5 fix session**~~ — 🟢 Closed, confirmed on-device 24 Jul. Three bugs, not one — see below.
- [ ] 🟡 **BUILD-3 on-device test pass** — code confirmed clean twice. Expected formality.
- [ ] **OUT-1 (reshaped) — Community validation reshaping session** — brief ready, not yet run.
- [ ] **Supabase account 2FA** — Graeme's own action, no session needed.
- [x] ~~**Thread scroll-bug audit**~~ — 🟢 **Done, 28 Jul.** Turned out to be mostly already resolved — see section below.
- [x] ~~**Meeting with Alex**~~ — 🟢 Held 29 Jul. Outcomes folded into v77 — see section below.
- [ ] **Friday: short review**.

## NEXT WEEK — WB 3 Aug

- [x] ~~**BUILD-4 (Schema Reconciliation)**~~ — 🟢 **Closed, 30 Jul, ahead of schedule.** `schema.md` v1.9 live in repo. See BUILD-4 Outcome section below.
- [x] ~~**Core Session `currentActivityEntry` data-integrity investigation**~~ — 🟢 **Closed, 30 Jul.** Never silently failing to log; genuine id-reuse bug found and fixed instead, in both `core-session.js` and (follow-up, same session) `yoga-session.js`. See Core Session Outcome section below.
- 🟡 **`gym-programme.js` — code complete, 31 Jul, on-device test pending** (blueprint `alongside_blueprint_gymprogramme_31jul2026_v1.md`; build run same session, direct via repo access). Graeme's Section 2 decision (additive) implemented in full: exit-guard wired, `activityLog` write added alongside unchanged `progressLog` write, `currentActivityEntry` set so `reflect.js` stops discarding answers. `gym-programme.js` v2→v3, `sw.js` v186→v187, pushed and confirmed live on GitHub. **On-device confirmation is the only remaining gate** — see BUILD-GP Outcome section below for the test checklist.
- **Supabase schema & architecture design — 🟢 Closed, 03 Aug.** `alongside_supabase_schema_design_03aug2026_v1.md` live in repo. See this version's substantive changes, above, for headline decisions. Design-only, nothing live, per scope.
- [x] ~~**Tier-gating build (S4-TG)**~~ — 🟢 **Closed, 03 Aug — found live during 04 Aug reconciliation, not previously logged here.** `sw.js` v191 confirms `js/auth.js` built (`getUserTier()`/`isPremium()`/`isAthlete()`/`lockedFeature()`), reading the live `"tier"` field consistently with `settings.js`/`progress.js`/`session-builder-ui.js`/`upgrade.js`/`coach-proposal.js`. New `css/components/tier-gating.css`. `app.js` v7→v8 wires tap-through on locked features straight to `/upgrade`. **This row was stale — the build happened same-day (03 Aug) as this schedule's own v105/v106 writing and wasn't folded in.** Note for the record: `lockedFeature()` itself isn't yet applied to any live feature (infrastructure built and tested, no confirmed real-and-ungated premium feature found to wrap it around). `coach-proposal.js`'s `renderBypassDoor()` was found to have an unused `tier` parameter during this build — original intent unclear, not fixed, superseded by this session's door decisions below anyway.
- **Supabase schema & architecture design — 🟢 blueprint ready, 31 Jul** (`alongside_blueprint_supabase-schema-design_31jul2026_v1.md`). **Design-only, explicitly scoped** — not a live migration session. Two real dependencies confirmed today, not assumed: the DPA request needs BIZ-1 (HMRC) done first; tier gating doesn't exist as a system yet (checked directly — 4 scattered reads of `tier`, zero central gate mechanism anywhere in `js/`). Both logged as separate, not-yet-scoped sessions rather than silently bundled in.
- BUILD-1's remaining sub-question
- BIZ-2, BIZ-3, INF-6, OUT-2, OUT-7
- **Org outreach category decision** (see Alex Meeting Outcomes below) — Graeme's call on whether workplace wellbeing reps and women's health groups join the Tier list, plus the "what's in it for them" messaging pass. Blocks OUT-2–OUT-8.

*Full six-week plan: Task Inventory doc, Section J (v5).*

---

---

## 🌱 Outreach Developments — 03 Aug 2026

**BANDS CIC — a real response, first of four Tier 1 emails.** A meeting is now set with Alfie and his members — the first actual reply out of the original four (ADHD UK, National Autistic Society, ADHD Foundation, BANDS CIC), all emailed with no response until now. **Meeting date: not yet confirmed** — get this from Graeme and update here once known, don't leave it dateless indefinitely.

**Real potential upside if the meeting goes well:** follow-on meetings with BANDS members across **Frome, Bath, Weston, and Trowbridge** — genuine multi-town reach across Somerset/Wiltshire, not a single contact. Worth treating the Alfie meeting itself as the actual priority — the four-town potential is downstream of it going well, not a parallel track to chase independently yet.

**Canopy connection — a personal trainer with neurodivergent clients.** Surfaced through Graeme's separate Canopy course sub-project, not the direct org-outreach list — a different channel entirely (a warm individual connection via an unrelated project, not a cold-outreach org response). Potentially interested in "supporting" — **nature of support not yet clarified** (beta testing? client referrals? something else?). Needs a conversation to actually understand what's being offered before this can be scoped as a task.

---

**Source: Graeme's actual run + library session today** — the first genuine field-conditions test any session view has had (phone locked/pocketed during real use), as opposed to a desk-based device test. Four symptoms reported, traced against live `running-session.js` and confirmed to share one root cause:

**The gap:** the app never calls the Wake Lock API anywhere, and never persists in-progress session state to `store` during a run — only at the very end (`endSession()`) or on a deliberate exit (`savePartialSession()`, called from the exit-guard paths only). Everything else (`elapsed`, `phase`, `paused`, prompt scheduling) lives in plain module-level JS variables, driven by a single `setInterval`.

**How each symptom maps back to it:**
- **Prompts never fired** — every prompt, vibration, and phase transition (warmup→run, cooldown) is driven by that one interval. Mobile browsers throttle or suspend `setInterval` heavily once the screen locks. With the phone pocketed for most of a run, the interval barely ran.
- **Vibration only worked with the screen open** — same interval, same cause. `firePrompt()`'s `navigator.vibrate()` call only ever executes from inside the throttled interval.
- **Pause wouldn't resume** — the pause flag itself is a simple toggle and works fine in isolation, but it depends on that same interval to ever act on it again once the screen locks.
- **Refresh caused a full restart** — different mechanism, same root gap. Nothing checkpoints a running session to `store` mid-run, and nothing on mount checks "was there an interrupted session?" — a refresh just wipes the in-memory state back to defaults.

**Confirmed app-wide, not running-specific:** checked `workout.js` and `yoga-session.js` directly — same gap in both (no Wake Lock, no mid-session checkpoint). Running exposes it hardest since it's the activity most often done with the phone locked away, but this is architectural, not a running-only bug.

**Not yet done → blueprinted → built, all same day, 03 Aug:** solution confirmed with Graeme, blueprint written (`alongside_blueprint_wakelock-resume_03aug2026_v1.md`), then run immediately. `running-session.js` v3→v4: `elapsed` now computed fresh from timestamps every tick instead of incremented; checkpoints written to `store` at session start/pause/resume/each prompt via new `js/session-resume.js`; on cold mount, an interrupted run is offered back via a coach-voiced resume-or-fresh card (reuses `.session-exit-*` CSS as-is); Wake Lock requested on start/resume, released on end/exit, re-requested on `visibilitychange`. The exact-equality interval-prompt bug (Section 3 of the blueprint) fixed in the same pass. All pushed, independently re-confirmed live via fresh fetch, `node --check` clean.

**Still open: on-device confirmation.** No device available this session — this is the one bug in recent memory that was only ever discovered through real use, so code-clean and `node --check`-clean genuinely means less here than usual. The real test: lock the screen mid-run for several minutes and confirm the timer/prompts recover correctly on unlock; force-refresh mid-run and confirm the resume card appears and restores state accurately.

---

## 🌐 Website Session — WCAG Audit + Upgrade Page Build, 03 Aug 2026

Run directly in the PM chat, no separate build-chat brief — repo: `github.com/build-new-habits/website` (separate from `alongside-app`). Token confirmed valid (expires 06 Aug 2026 10:13 UTC). `css/site.css` v7 → v11 across the session.

**Part 1 — WCAG 2.2 AA contrast audit (site.css v7→v8).** The confirmed scroll-arrow issue (1.61:1, needed 3:1) was fixed — `.hero__scroll-signal` switched from `--color-border` at 0.6 opacity to `--color-text-muted` at 0.85 opacity (6.14:1). Tracing `--color-border`'s usage found it measures 1.15–2.36:1 against every background token in the system — it never clears 3:1 anywhere — on 5 more functional-boundary elements (nav layout-toggle, nav hamburger-toggle, `.btn--ghost`, `.form-input`, `.hero__pause`). All six switched to `--color-text-muted` (3.91–8.05:1 across all backgrounds). New finding, not in the original brief: `.badge--live`/`.badge--soon` text-vs-background fell as low as 3.24:1 inside `.card` contexts (Products/Impact pages) — the 15%-alpha tinted background was never verified against a card background. Fixed by making badge backgrounds solid `--color-bg-deep` instead of blended rgba (6.96–10.69:1 everywhere now). Checked, no fix needed: `--color-border-light` (decorative dividers, SC 1.4.11 exempt), focus indicator (already 4.66–9.59:1), disabled `cause-card__vote` inputs (genuinely and permanently disabled in markup, SC 1.4.11 exemption applies).

**Part 2 — Live-screenshot follow-up (site.css v8→v10).** Graeme reviewed the deployed fix and flagged two more things: the scroll-arrow was visually disconnected from the Pause button (position:absolute pinned it to the hero section's bottom, far from Pause's in-flow position on tall viewports) — fixed by making it a normal flex child directly after Pause (v9). Second, the coach-bubble context line (`text-muted` on `bg-card`, 4.67:1 — AA-passing but "close for comfort") was reviewed via a 3-option mockup (grey / teal / gold) — gold was deliberately not chosen since it's the paid-tier marker everywhere else in the system and this is a free/universal element; teal (`--color-primary-light`, 7.00:1) chosen (v10).

**Part 3 — Free vs Premium colour system + `/upgrade` page build (site.css v10→v11).** Graeme asked whether the site could flag free vs premium content with teal/gold consistently. Turned out this system was already a **confirmed, locked design decision** — `alongside_upgrade_page_architecture_09jul2026_v1` specifies gold (`#B8970A`) as the Personal-tier visual signal, with a full locked page copy that had simply never been built (W5 in the old 10 Jul website-stream tracking — never had its own BUILD-x ID here, hence the drop-off). Built `upgrade/index.html` v1 from that locked spec verbatim, plus new `site.css` classes (`.upgrade-hero`, `.upgrade-changes`, `.pricing-cards`, `.btn--gold`). Pricing pulled from the current `alongside_pricing_model_20jun2026_v2` (£7.99/mo, £49.99/yr launch year) — matches the architecture doc's own locked figures, no conflict. **Explicitly not built:** Stripe/Supabase checkout — S-F3 (Supabase auth) and S-F4 (Stripe setup) don't exist yet, so the CTA button is honestly disabled with a note, same pattern as the Community page's mailing-list placeholder. `js/site.js` v4→v5: added Upgrade to `NAV_LINKS` now the page is real.

**The broader ask — flagging every feature/reference site-wide as free vs premium, plus persona-tabbed pages per product — is only partly addressed.** Only Move has a confirmed Free vs Personal split (`alongside_move_overview_and_personas_25jul2026_v2`); Learn's is also documented, but Life, Rest, Love, Lead, Compass, Savvy are all "Proposed — no spec exists yet." A family-wide version of this needs those specs written first. Logged as an open item below, not actioned further this session.

**Real bug found and fixed, unrelated to the above:** `index.html`, `community/index.html`, `impact/index.html`, `products/index.html` were all still requesting `site.css?v=7` after the stylesheet had moved to v10 across this session's earlier edits — meaning browsers/CDN could have kept serving the pre-fix stylesheet indefinitely under the stale query string. All four bumped to `?v=11` (and `site.js?v=5`), version headers bumped to match.

**New compliance finding, not fixed this session (out of scope, flagged only):** `js/site.js`'s shared footer renders "© [year] Build New Habits Ltd. Alongside is a trading name of Build New Habits Ltd." on every page. Build New Habits is an unregistered sole trader (BIZ-1 still open) — per standing rule this must never be described as "Ltd." Live on every page right now.

**Part 4 — Follow-up round (site.css v11→v14, `js/site.js` v5→v6).** Footer "Ltd" fixed (removed site-wide). Gold token lightened `#B8970A` → `#D4AF37` — Graeme flagged the original as "dirty and dark"; every usage (text, `.btn--gold`, comparison-table header) improved in contrast as a side effect (text-inverse on the button: 6.35:1 → 8.49:1). Upgrade page: "Alongside: Move" teal label added (page is Move-specific, will need its own variant once other products get pricing), subscription line split onto its own line, wellbeing note reworded to Graeme's phrasing ("we don't want to restrict how you Move with mental health and wellbeing"). Products page corrected — the generic below-all-cards links section from Part 3 was wrong (that content is Move-specific, not family-wide); replaced with a single gold-button link under the Move card only, pointing to `/who-its-for/`. "Get early access" now opens in a new tab.

**Part 5 — Accessibility audit + comparison table/persona rework (site.css v14→v16).** Graeme asked directly: is the heading structure clean, is the table accessible, is the grey-on-black a clear pass. Real answers: heading structure is clean across all 6 pages (one h1 each, no skipped levels). The comparison table's row labels were plain `<td>` with zero programmatic link to their data cells — converted to `<th scope="row">`, a real accessibility fix. The narrowest-margin contrast pass on the whole site was found: persona-card body text at 5.12:1 on `bg-card` (everywhere else is 7:1+) — moved to full text colour, now 8.40:1. Persona cards restructured with Free/Personal tier tags per line (previously implied everything was free) plus a short "How it felt, over time" narrative per persona. Community page's "Three ways" — flagged by Graeme several messages earlier, not actioned until now — rebuilt from three bare words into real content, with a working copy-link button (`js/community.js`, new) under "Share the impact." Charter reframed as forward-looking, honest that only a mailing list exists today.

**Part 6 — Table polish (site.css v16→v17).** Column headers bigger with a divider, row headers given a distinct colour from data cells, subtle column dividers added alongside row dividers. New "Areas explained" section added before the table (Sessions/Exercise library/Programmes/Progress/Coach behaviour defined in plain language).

**Part 7 — Ground-truth correction against live `alongside-app` code, not specs (`who-its-for/index.html` v5).** Graeme asked pointed factual questions about the table content, which led to actually checking the live files rather than trusting the docs. Findings, checked directly:
- **"Full Body" confirmed correct** — `SESSION_TYPES` in `session-builder.js` (id: `"full"`) is exactly what free tier unlocks in `session-builder-ui.js`. Graeme's naming decision matches reality precisely.
- **Difficulty scale is 1–3 in live data**, not 1–5 as the exercise-database spec claims — checked 90 exercises directly in `js/data/exercises/strength.js`, none tagged above 3. **Graeme has decided: migrate to 1–5.** New build item below, not done this session.
- **No hardcoded programme exists any more** — `gym-programme.js` v3 (31 Jul, the fix from earlier this session) reads exclusively from the session builder. The old Sessions A–C (built around Graeme's own physio programme) are gone from the file.
- **Bigger finding: no difficulty-based gating exists at all.** Checked `selectFromCategories()` in `session-builder.js` directly — it filters by equipment and condition, never by `difficultyLevel` or tier. Free and Personal currently draw from the identical exercise pool. The "Exercise library" and "Programmes" table rows were describing spec'd-but-unbuilt differentiation as if live — corrected to state current reality, with the roadmap items (level-based progression, multi-week generative/periodised programmes — confirmed not built, `alongside_generative_programme_design_note.md` says "Future Build, Target: Phase 4B or Phase 5") marked "Coming soon" instead. Same correction applied to the Jess/Priya/Mark persona-card claims, which had made the same premature assumption.
- **Progress row confirmed accurate** — `tier === 'personal'` checks genuinely gate the 30/90-day tabs in `progress.js`. Free row now says "rolling 7-day" explicitly (confirmed via `_cutoffDate()` — always today-minus-7, never a weekly reset).
- **Not verified either way:** the Coach behaviour row's memory/pattern-noticing claim. Flagged, not guessed at — left as-is pending a separate check.

---



Captured in full in `alongside_alex_meeting_outcomes_29jul2026_v1.md`. Summary folded in here; that document remains the fuller record if detail is needed later.

**Legal — solicitor question refined.** Alex is reaching out to his solicitor contact with a specific framing: *"what's the minimum to be legally responsible?"* — with a working assumption that beta-stage requirements may be lighter than public-launch requirements. When the answer comes back, ask explicitly for the split rather than one combined answer. Relevant to BIZ-5, BIZ-6, BIZ-9 below.

**BIZ-9 (IP/trademark) — deprioritised.** Alex ran a logo unregistered for 20 years with no issue. Working position: don't worry about IP, especially the logo, not yet — if someone registers something similar first, the fallback is simply to change the logo. The product's actual IP (methodology, content, mechanics) is the genuinely distinct part, not the mark. Still worth a mention at the BIZ-5/6 solicitor consultation since it's a small add to an existing conversation, but no longer worth chasing separately.

**U18/safeguarding — genuinely open, not resolved.** Alex suggested "potentially we don't need to worry about U18." Graeme explained the safeguarding responsibility around collecting keywords from the mood meter; Alex understood the concern and will think on it and ask his solicitor. **This is not a decision — do not treat it as one.** Directly touches BUILD-9 (18+ age-gate), BIZ-6 (safeguarding sign-off), and the Crisis & Safeguarding Policy's own open item on parental notification (Section 9.4, unconfirmed as of v7). No schedule change until Alex/solicitor respond. **[v141, 10 Aug] Partly superseded** — the question has now been put directly to a solicitor (Natalie), for both Move and Learn. Alex's "potentially we don't need to worry about U18" remains an untested instinct and should still not be read as a decision. Awaiting Natalie's written response, not Alex's.

**Outreach — new categories suggested, plus a real gap surfaced.** Alex suggested workplaces with wellbeing reps, and women's health groups/communities, as additional outreach targets — he's thinking on this further too. He also raised the sharpest open question in the whole outreach effort: **"why would they do anything?"** — the current outreach messaging doesn't yet spell out the concrete benefit to the organisation itself. Two actions before any new-category outreach goes out: (1) Graeme's decision on whether these join the existing Tier list or run as a separate track, (2) a messaging pass answering "what's in it for them" per org type. This was already logged as "org outreach categories — undecided, blocks OUT-2–OUT-8" — still blocking, now with two named candidates and one clear open question instead of a vague undecided state.

**New task — LinkedIn presence.** Graeme wants a BNH business page and a personal profile, prompted by Alex's suggestion that LinkedIn plus direct email is a good channel for reaching both organisations and named individuals. Not yet scoped — Graeme has said he'll need help designing this properly. New item, no urgency attached yet, ready whenever Graeme wants to start.

**Deadlines — externally confirmed.** Alex agrees on two hard deadlines: **partner group/testing community + beta start, mid-September 2026**, and **public launch, January 2027** — the latter specifically because that's when people are most active in the "new year, new fitness" mindset, a named commercial rationale from Alex rather than just an internal target. This validates the dates already on this schedule; it doesn't resolve the underlying capacity risk (solo build/business load) flagged separately in Graeme's own meeting-prep review — both remain true at once.

---

## ⚖️ Solicitor Consultation — Held 10 Aug 2026

**Who:** Natalie, at the firm Alex introduced. Ben Cross — the named contact in Alex's 24 Jul introduction email — could not attend; Natalie took the meeting in his place. Thirty minutes, introductory.

**How it was run:** deliberately as a qualification call, not an advice call — establishing what the firm can cover, what a proportionate engagement looks like, and what it costs against the £2,000 budget for this phase. Prep brief written the same morning; the six-document pack was *not* walked through in the meeting, by design.

### What was covered

| Area | Covered? | Note |
|---|---|---|
| IP and trade marks (BIZ-9) | ✅ | Covered despite being deprioritised on 29 Jul — small add to an existing conversation, as planned. |
| Safeguarding and under-18s | ✅ | Worked through for **Alongside: Learn** (the three-user family model). |
| Safeguarding — **Move** under-18 position | ✅ | Put directly in the final ten minutes: *"what advice or planning do I need to protect against under-18s using Move when I'm collecting sensitive personal health data."* Asked as a protection question, not a reassurance question. **Preserve this framing in the follow-up.** |
| Data protection, sensitive/special-category health data, ICO process (BIZ-3, BIZ-5) | ✅ | Covered. |
| Collaborator equity | 🟡 | Touched on briefly only. |

### What Natalie holds

- The three dates: beta mid-September 2026, soft launch first week of December 2026, public launch January 2027.
- Graeme's stated inexperience — said openly, so the advice is pitched accordingly.
- The **"minimum needed to be responsible"** framing (Alex's, 29 Jul).

### What she will do

Consult colleagues where needed, then respond officially with **guidance on what to prioritise, and costs**.

### ⚠️ Recording discipline

**No substantive advice was given in this meeting.** Natalie listened and took notes rather than advising on the spot, and Graeme has confirmed there is nothing further worth recording. Nothing in this section should be treated as legal advice received, or used to close any BIZ item. **Do not let a later session infer that a question was answered simply because it was asked.**

### Open follow-up actions

| # | Action | Why it matters |
|---|---|---|
| 1 | **Confirm Natalie has the six-document pack** — Product & Data Overview, covering letter, Privacy Policy draft v3, Terms of Service draft v2, Crisis & Safeguarding Policy v7, Safeguarding one-pager v2. The pack went to Alex on 24 Jul; whether it reached Natalie is unconfirmed. | She cannot write up against documents she hasn't seen. |
| 2 | **Restate the beta-minimum vs launch-minimum split in writing**, as an explicit request for two lists rather than one combined answer. | She holds the framing verbally; the written ask is what makes it a deliverable. |
| 3 | **Ask for a safeguarding reviewer referral** — ideally someone with a named youth-safeguarding credential (PAPYRUS-affiliated). Not raised in the meeting. | BIZ-6's three reviewer roles remain entirely unfilled — the most urgent non-build item on this schedule. |
| 4 | **Confirm whether the Severe-pain Rest/Adapt liability question was raised.** Not mentioned in Graeme's account of the meeting; assume not covered. | Logged 04 Aug as a real legal question, not an assumption. Cheap to add to the follow-up email. |
| 5 | Await her response on **priorities and costs** before instructing anything. | £2,000 budget for the phase; scope needs to fit it. |

### What this does and doesn't unblock

- 🟡 **BIZ-5** (Privacy Policy + ToS review) — moves from "no solicitor identified" to "solicitor engaged, awaiting scope and quote." Not closed.
- 🟠 **BIZ-6** (Safeguarding sign-off) — unchanged. A general solicitor review is not the same as the named youth-safeguarding review; three reviewer roles still unfilled.
- 🟠 **BIZ-3** (ICO registration) — unchanged, still gated on BIZ-1 (HMRC).
- 🟡 **BIZ-9** (IP/trade marks) — raised as planned. No action pending her response.
- 🟡 **BUILD-9** (18+ age-gate) — **still blocked**, but now on Natalie rather than Alex. Hold a little slack in the September plan: an answer requiring age assurance beyond self-declaration would add real build work close to the beta window.
- 🟡 **Collaborator equity (Liam, Dan)** — touched on only. The structural point stands and is worth putting in the follow-up: Build New Habits is an **unincorporated sole trader**, so equity cannot be issued in any conventional sense without incorporating first. The cheaper, more urgent piece is a written collaborator agreement with an IP assignment clause, so contributions are clearly owned by the business regardless of what happens on equity later.

---

## ✅ Core Session `currentActivityEntry` Data-Integrity Investigation: Closed, 30 Jul 2026

Full trace and reasoning in the session's own record (this PM chat, or `alongside_blueprint_coresession-integrity_30jul2026_v2.md` for the original brief). Summary:

**Diagnosis (code trace, no on-device pass yet — see below).** The blueprint's worry — that Core Session might never receive `currentActivityEntry` upstream and so might never have logged real completion data — was investigated by tracing every route into `core-session.js` (`library.js`, `home-threshold.js`, `today.js`, `coach-proposal.js` fallback options). **Confirmed: none of them set a pending entry.** Root structural reason: `intention.js`'s `ACTIVITIES` list doesn't include a "core" option at all — Core Session was never wired into that pattern. **But this was never actually blocking real data from being logged** — `finaliseSession()`/`savePartialSession()` both had a defensive fallback that called `store.logActivity()` with real `type`/`completedAt`/`status`/`exercisesCount`/`creditsEarned` regardless of whether a pending entry existed. So the original trust-critical worry doesn't hold: Core Session completions have been logging real data all along, just without the extra optional context fields (`sessionStart`, `energyBefore`, `duration`) that only exist when a session type is routed through `intention.js` — which core-session never was.

**A real bug was found and fixed instead.** Because `core-session.js` re-sets `currentActivityEntry` to its own completion result after every write (needed for `reflect.js`'s "How did that feel?" find-by-id flow), and both functions were spreading `pending` into new writes, **two back-to-back Core Sessions not separated by an `intention.js` visit could share one `activityLog` id** — the second completion's write would inherit the first's stale `id`. `core-session.js` v3 → v4: both functions now build the entry fresh, no `pending` spread, `logActivity()` always assigns a new id.

**Same bug confirmed and fixed in `yoga-session.js` as a same-session follow-up (on request).** Identical spread-pending pattern, and yoga is also reachable directly from `library.js`'s "Yoga / Pilates" card without going through `intention.js`. Fix had to be more surgical than core-session's, since yoga's `pending` *is* sometimes genuine (via `intention.js`): a pending entry carrying a `status` field is stale (every `logActivity()`-written entry has one; `intention.js`'s fresh entry never does), and is now discarded instead of spread — preserving legitimate upstream data when it exists, while still preventing id reuse. `yoga-session.js` v4 → v5.

**Code shipped:** `core-session.js` v3→v4, `yoga-session.js` v4→v5, `sw.js` v181→v183 (two bumps, one per fix, both deployed last). Changelog entries added for both. No schema change.

**Not yet done — logged as open:** on-device confirmation of a real completed Core Session (and ideally the back-to-back-completions scenario for both fixes) — the PM chat has no device access. Worth a quick check next time Graeme's on the phone; the fix is narrow enough that code-trace confidence is high, but "should work" is never the final gate per standing discipline.

**Also logged, not investigated this session:** whether `workout.js` (gym) has the same spread-pending pattern — out of this session's scope, not checked either way.

**Follow-up 1, same session (on request) — `workout.js` checked.** Traced `completeWorkout()`: it builds its `activityLog` entry fully from scratch every time (`date`, `completedAt`, `type`, `durationMins`, `moodAfter`, `isEvent`, `eventName`) and never reads `currentActivityEntry` beforehand — only sets it after writing, same "so reflect.js can find it" pattern as the others. **No spread-pending bug in gym.** Clean.

**Follow-up 2, same session (on request) — a different, more serious gap found while checking.** `workout.js` had **no `mountSessionGuard()` wiring at all.** Confirmed via `router.js`'s default popstate handler (only defers to session-guard state when a `sessionGuard` flag is present in history) — without it, a device back-gesture mid-workout navigated away **instantly, no confirmation card, no partial save**, `workoutProgress` left orphaned in the store. The on-screen Exit button's browser `confirm()` ("Your progress on this workout will be lost") was an honest, intentional discard-only design for that path — not itself a bug — but the back-gesture path had nothing at all. Worse than the gap BUILD-3 fixed in 6 other files (23 Jul): those all showed a confirmation card and just skipped the actual save; gym showed nothing.

Fixed to match `core-session.js` v4 / `yoga-session.js` v5's confirmed pattern: `mountSessionGuard()` wired, `savePartialSession()` added (built fresh, no `currentActivityEntry` spread — same discipline as the two id-reuse fixes above), on-screen Exit now shows a coach-voiced `showExitConfirm()` overlay instead of `confirm()`, `cleanupWorkout()` now calls `dismountSessionGuard()`. `workout.js` v5 → v6.

**Follow-up 3, found while fixing Follow-up 2 — missing CSS across 7 files, not just gym.** `.session-exit-overlay`/`.session-exit-card` (the on-screen overlay's own CSS — separate from `.sg-*`, which only covers the back-gesture card) had **no styles anywhere in the repo.** Affected all 7 files using this local `showExitConfirm()` pattern — `core-session.js`, `yoga-session.js`, `cycle-session.js`, `running-session.js`, `swim-session.js`, `walk-session.js` (all since BUILD-3, 23 Jul) — not a workout.js-only issue, it was rendering unstyled everywhere it existed. Fixed in `css/components/session-guard.css` v1 → v2, matching the existing `.sg-*` card's visual language exactly.

**Final code shipped this session, in full:** `core-session.js` v3→v4, `yoga-session.js` v4→v5, `workout.js` v5→v6, `css/components/session-guard.css` v1→v2, `sw.js` v181→v184 (four bumps total, each deployed last). Changelog fully updated. No schema changes.

**On-device testing status, updated 30 Jul 2026 — full test pass complete, all 7 files confirmed.** Core Session basic sanity ✅, Core Session id-reuse ✅, Yoga id-reuse (both routes) ✅, gym back-gesture exit-guard ✅, gym on-screen Exit-guard ✅. CSS render (`.session-exit-*`) individually eyeballed and confirmed correct for `core-session.js`, `yoga-session.js`, `running-session.js`, `workout.js` (screenshots), and Graeme's own quick pass confirmed `walk-session.js`, `swim-session.js`, `cycle-session.js` match as well — all 7 files now visually confirmed. Two real bugs found and fixed along the way (yoga stuck-screen, dedupe window) — see below. `gym-programme.js` (a separate, untouched file) found to have its own significant gaps, logged above as its own item, not fixed. **Nothing further outstanding from this investigation.**

**Small UX finding, 30 Jul — on-screen Exit button position may conflict with Android edge back-gesture.** First attempt at testing the on-screen Exit button (tapped near the screen's left edge, where the button sits) produced the *back-gesture* guard's card instead of the on-screen button's own card — consistent with an accidental edge-swipe being registered alongside the tap. A repeat tap, more centred, correctly showed the on-screen card. Not confirmed as a definite bug (could be device/gesture-nav-specific), but worth a design look since the Exit button's left-edge position is shared across all 7 files using this pattern, not just `workout.js`.

**On-device testing, 30 Jul 2026 (Graeme, on the phone) — Core Session basic sanity confirmed.** Real completion via Library → "At home" → Core → Stability → 15 min → 4 exercises produced a genuine `activityLog` entry: `type: "core-session"`, `status: "completed"`, `exercisesCount: 4`, `creditsEarned: 80` — matches the on-screen "+80 credits earned" exactly. First direct on-device confirmation of the original diagnosis. Remaining test steps (id-reuse scenarios, gym exit-guard, CSS visual check) not yet run.

Two new UI/UX findings surfaced incidentally while testing, unrelated to the Core Session fixes themselves — logged here, not actioned:

- **Screen styling inconsistency.** Three different visual styles across the ways into a session: Intention screen (card-based options), Library (plain text list), Coach Proposal (different card style again, with a "RECOMMENDED" badge). Not a bug, but a real inconsistency worth a design pass at some point.
- **Location can't be changed mid-flow.** Once inside Library's "At home" branch (or any location branch), there's no way to switch to a different location (e.g. decide to go to the gym instead) without exiting all the way back to the top of Library. Minor friction, not blocking.
- **Bottom nav bar covers content on multiple screens.** No buffer space above the persistent bottom nav bar — content (buttons, cards) runs right up against it or gets clipped underneath, on several screens (seen on Intention and Yoga's duration/focus pickers at minimum, likely wider than just those two). Needs a consistent bottom padding/safe-area fix across affected views.

**Yoga stuck-screen bug — found and fixed during this same on-device test run.** Real bug, unrelated to any of today's earlier fixes: completing a genuine yoga session via "Finish practice" left the screen frozen on the last pose. Root cause: `yoga-session.js`'s `finaliseSession()` set `phase = "done"` but never called `rerender()` — confirmed by direct comparison with `core-session.js`'s equivalent function, which already had both lines. The completion data itself was always correct (confirmed: `energyBefore: 7`, `creditsEarned: 120` on the first genuine attempt) — only the screen transition was broken, and a second tap (understandable, since the screen looked unresponsive) correctly triggered `logActivity()`'s dedupe guard rather than writing a duplicate. Fixed: one line added (`rerender();`). `yoga-session.js` v5 → v6, `sw.js` v184 → v185. **Re-tested on-device immediately after the fix — confirmed working:** "Practice done" screen now shows correctly, `+100 credits earned` on screen matches `creditsEarned: 100` in the new activityLog entry (`id: 5k2k`).

**Dedupe window fix — found continuing on-device testing, Route B (yoga direct from Library, no Intention visit).** Two genuinely different, real yoga completions 83 seconds apart were silently rejected by `logActivity()`'s dedupe guard as a duplicate — `finaliseSession()` still showed the normal "Practice done" success screen with credits, but the completion was never actually written to `activityLog`. Root cause: the guard's 2-minute default window was built to catch near-instantaneous accidental double-fires (a double-tap, or the stuck-screen re-tap bug just fixed above) — those happen within a second or two, not two minutes. Graeme's read, which the trace confirmed: two real, distinct full-session completions of the same type within 2 minutes of each other is realistically a testing-only scenario, not something a genuine user would trigger. Fixed: `store.js` v10 → v11, `dedupeWindowMs` default reduced to 10 seconds — still comfortably covers a slow-rendering device re-tap, no longer catches genuinely different completions. No caller overrides this default, so the fix applies uniformly across every activity type (gym, core, yoga, run, walk, swim, cycle). `sw.js` v185 → v186.

**Separately flagged, deliberately not fixed — silent failure on rejected writes.** When `logActivity()` rejects a write (dedupe or otherwise), the calling session view has no way of knowing and still shows its normal success screen with credits. This is a pre-existing gap across every activity type using the shared write path, not new. Needs a coach-voiced message (Nurturing tier) — a content/UX decision, not a code-only fix — so deliberately not invented on the spot. Needs its own scoped session.

**A third, separate gym-related file found while testing `workout.js`'s exit-guard fix — `gym-programme.js`, not touched today, needs its own session.** Graeme's real programme flow ("Build Your Base, Week 4, Session A") turned out to be a completely different file from both `workout.js` (fixed today) and `core-session.js` — multi-exercise-card layout with individual "Done" toggles and a single "Session done" bar, rather than the one-exercise-at-a-time flow the other two use. Traced on request:
- **No exit protection of any kind.** No `mountSessionGuard()` import at all — confirmed via grep, not present anywhere in the file. Back-gesture does nothing protective (matches Graeme's on-device report — no "Stay" option, it just exits).
- **The on-screen Exit button is worse than `workout.js`'s pre-fix state.** No confirmation of any kind, not even a browser `confirm()` — a single-line handler: tap Exit → `router.navigate('today')` → gone instantly.
- **Doesn't write to `activityLog` at all.** Finishing a session calls `recordSession()` (from `programmeEngine.js`), which writes to a completely different store key, `progressLog` — never calls `store.logActivity()`, never touches `activityLog`. This is architecturally separate from every other session type traced today (all of which converged on the shared `logActivity()` path via BUILD-3/B3-3).

**Not fixed — this needs its own scoped session, not a same-session patch.** Unlike the other fixes today, this raises a genuine open product question: is `progressLog`-only tracking for structured programmes intentional (a deliberate, older architecture separate from the ad-hoc `activityLog` types) or a real gap that should also feed `activityLog`? That's not something to guess at and patch quietly — needs a decision first.

---

## 🟡 BUILD-GP — `gym-programme.js` exit-guard + activity fix: Code complete, 31 Jul 2026, on-device pending

Built the same session as the blueprint above, direct via repo access (git clone with the fine-grained token, edit, `node --check`, commit, push) rather than handing off to a separate build chat. Every file version in the blueprint's table was re-confirmed live before editing — all matched exactly.

**Graeme's Section 2 decision — additive, confirmed and implemented as recommended:**
- `recordSession()`'s `progressLog` write is untouched.
- `store.logActivity()` now runs alongside it at genuine completion (`finish-session` handler) and at partial-exit (new `savePartialSession()`), with the returned entry written to `currentActivityEntry`.

**All three confirmed issues fixed:**
1. **Exit protection** — `mountSessionGuard()`/`dismountSessionGuard()` wired for the back-gesture path; on-screen Exit now shows a coach-voiced `showExitConfirm()` Stay/Exit-and-save overlay instead of the old instant `router.navigate('today')`. Reused the existing `.session-exit-*` class family from `css/components/session-guard.css` v2 — confirmed no conflicting rules in `gym-programme.css`, no CSS file touched.
2. **`activityLog` visibility** — completions and partial exits now write to `activityLog` as well as `progressLog`, so `today.js` ("you moved today") and `progress.js` (recent-activity observations) will pick up gym-programme sessions for the first time.
3. **`reflect.js` silent discard** — `currentActivityEntry` is now set at both completion and partial-exit, so reflect answers (feel/painChange/note/moodAfter) save to a real, matching entry instead of being dropped or misattributed.

**One deliberate deviation from blind pattern-copy, made and logged in-session, not pre-agreed with Graeme:** activity `type` set to `"gym"`, not `"workout"` (the value `workout.js` uses for the identical pattern). Reasoning: `reflect.js`'s `QUESTIONS`/`FEEL_OPTIONS` maps have a `"gym"` key with tailored content ("I want to know what it actually felt like in there" / Felt strong / About right / Struggled) — `"workout"` isn't a key in either map and falls through to generic `"other"`/`"coach-session"` defaults. Checked first that `today.js`/`progress.js` don't filter `activityLog` by `type` at all, so this only affects which reflect question fires, nothing else. Flagged as a small, non-urgent follow-up for `workout.js` itself in the open-items table below — not fixed here, out of this session's file scope.

**Files changed, all pushed and confirmed live via raw GitHub fetch:**
- `js/views/gym-programme.js` v2 → v3
- `sw.js` v186 → v187 (deployed last, cache bump)
- `Documents/Live State/Changelog.md` — new entry added

**Verification done this session:** `node --check` passed on both changed `.js` files, non-ASCII byte scan confirmed only the pre-existing em-dash convention (no stray bytes, no smart quotes introduced), diff reviewed line-by-line before commit, raw GitHub fetch confirmed the cache-name bump and `mountSessionGuard` references are live on `main`.

**Not done — the actual gate before this can close:**
- [ ] Real gym-programme session, back-gesture exit mid-session → confirm Stay/Exit-and-save card appears, "Exit and save" saves a `status: "partial"` entry with correct `exercisesCount`.
- [ ] Real gym-programme session, on-screen Exit button → same card, same save behaviour.
- [ ] Real gym-programme session, genuine "Session done" completion → confirm Home says "you moved today," confirm it appears in Progress screen observations.
- [ ] After a genuine completion, answer reflect.js's questions → confirm the *matching* `activityLog` entry (not a stale one) now has `feel`/`painChange`/`note`/`moodAfter` populated. Confirm the question text is the gym-specific one ("I want to know what it actually felt like in there"), not the generic fallback.
- [ ] Quick regression check: Week 6 glance, Week 12 reflection, and A/B session-type alternation still work as before — none of today's changes touched that logic, but worth a glance per the blueprint's own "done" criteria.

---

## ✅ BUILD-4 — Schema Reconciliation: Closed, 30 Jul 2026

Full detail in `alongside_session_handoff_BUILD4_docsreorg_30jul2026_v1.md` (or the handoff pasted into this chat). Summary:

**`schema.md` v1.9** written and pushed to `Documents/Live State/Schema.md`, ground-truthed directly against live `store.js` v10. Supersedes and retires `schema.md` v1.3, `schema_v1_7_15jun2026.md`, `schema_md.docx`, and the v1.5/v1.8 delta notes — **all four should be removed from project knowledge** (Claude can't do this directly; needs Graeme to delete via the UI).

**Two corrections to the 28 Jul reconciliation note itself** — found by checking both read *and* write sides of each field, not inferring from one side alone:
- `todayIntensity` — previously assumed dead. **Actually live**: written by `checkin.js` + `coach-proposal.js`, read by `workoutGenerator.js`.
- `exerciseFeedback` — previously confirmed live (28 Jul pass). **Actually dormant**: `applyFeedbackWeighting()` reads it, but nothing writes it anywhere — no UI collects exercise-level feedback, always falls back to `[]`. This is the same "specified but never built" pattern as empathy transfer — worth remembering as a recurring failure mode, not a one-off.

Also resolved: `stats` isn't a store field at all (computed local var, never persisted — false alarm). `hardBeforeSelections`/`hardBeforeShownAt` confirmed to be the existing `onboarding.*` fields, not a new pair.

**Code shipped:** `workoutGenerator.js` v1.12→v1.13 (removed dead `todaysWorkouts`/`workoutsGeneratedAt` writes and the orphaned `needsRegeneration()`/`getTodaysWorkouts()` pair — confirmed uncalled anywhere). `sw.js` v180→v181, cache bump, deployed last. No behaviour change — dead code, zero live readers.

**Logged, not fixed this session (touch-once):**
- `checkin-mini.js` still writes `workoutsGeneratedAt`, now fully orphaned since its only reader was just removed.
- `activeProgramme.measurementsOptIn` — written via a `mergeWithDefaults()` copy-paste artefact from `strategicGoal.measurementsOptIn`; not part of `activeProgramme`'s own schema.
- `Changelog.md` confirmed stale in both repo and project knowledge (byte-identical, dated 8 Mar 2026). **Decided 30 Jul — resume maintenance.** A new entry for this session's BUILD-4 work has been added to `Documents/Live State/Changelog.md`, re-establishing the practice from here forward. **Full historical backfill for the Mar–Jul 2026 gap is explicitly not part of this decision** — that's a separate, larger job (many versions of `workoutGenerator.js`, `coach-proposal.js`, `sw.js` etc. shipped in that window without a changelog entry) and would need its own scoped session if wanted.

---

## 📁 Repo Documents Reorganisation — 30 Jul 2026

`alongside-app` repo's `Documents/` folder restructured into four folders, run in the same session as BUILD-4:

- **`Live State/`** — must track live code exactly: `Schema.md` (v1.9), `Changelog.md` (**maintenance resumed 30 Jul** — see BUILD-4 outcome above), `alongside_crisis_safeguarding_policy_23jul2026_v7.docx`.
- **`Admin/`** — `master_schedule.md` is now the **canonical live copy of this document** (see the location-change note at the top of this file). `Admin/Past MS/` holds every superseded version by date. `Admin/Templates/` holds reusable templates. This week's active blueprints/handoffs also live at `Admin/` root — **not yet backfilled with the historical archive** (dozens more exist in project knowledge back to March; a separate future job, not done this session).
- **`Business/`** — company/legal docs kept in the repo since no other copy exists elsewhere: business plan, setup guide, one-pager, portfolio, founding document, pricing model, HMRC status, privacy policy draft, ToS draft, IP/trademark sheet, solicitor letter.
- **`Archive/`** — stale March-2026-era architecture/spec docs and superseded handoffs. Kept, not deleted, matching the existing Cleanup Task List philosophy but for docs instead of code.

**Still needs Graeme:** remove the now-superseded master-schedule versions (v68–v78) and the four retired schema docs from project knowledge — Claude can't delete project knowledge entries directly.

---

## BUILD-5 — full resolution, 24 Jul 2026 (unchanged from v76/v77, retained for reference)

**Fix 1** — `workoutGenerator.js` v1.9→v1.10. `applyDurationCap()` only checked total session length against a fixed per-focus ceiling, never against the user's declared `availableTime`. Added `AVAILABLE_TIME_WINDOW_MINUTES`, capped against `min(focusCap, windowCap)`.

**Fix 2** — `coach-proposal.js` v11→v12. `_getAvailableTime()` read from fields `checkin.js` never actually wrote to, silently fell through to a hardcoded `30`, then wrote that back over the correct value before generation ran. Fixed to read `store.get('availableTime')` directly.

**Fix 3** — `workoutGenerator.js` v1.11→v1.12. With 1 and 2 live, sessions started undershooting instead. `selectExercises()` picked a fixed small exercise count regardless of real per-exercise duration. Fixed with a duration-aware fill loop, bounded by `MAIN_FILL_CEILING`. Verified in a Node simulation, then confirmed on-device: 3 tests, 3 results around 20 min.

**Cache bumps:** `sw.js` v176→v177→v178→v179.

**Residual, logged not fixed:** short-exercise focus types still land under target on average in simulation (~14 min vs a 20-min ask for strength/mobility). Graeme confirmed on-device result as good enough; revisit only if it resurfaces as a real complaint.

---

## B3-2-Test follow-ups — 2 items

1. ~~Duplicate `activityLog` entries~~ — resolved (B3-3).
2. ~~Breathing doesn't route to reflect screen~~ — resolved, confirmed by design.
3. **Check-in feeling-word chip row overflow/wrapping** — still open, untouched. Cosmetic.
4. 🟡 **Reflect textarea sizing/contrast** — code confirmed correct (contrast 11.87:1). Provisionally closed pending one on-device cache-clear confirmation.

---

## 🧹 Cleanup Task List — deferred to app sign-off, not actioned now

**Purpose:** things found along the way that are safely inert — not blocking anything, causing no active harm sitting there — worth a final pass once the whole app build is complete, rather than either forgetting them or interrupting a working session to chase something low-stakes. Nothing here gets actioned until Graeme explicitly says "we're at sign-off, let's clear this."

| Item | Found | What it is | Why it can wait |
|------|-------|------------|------------------|
| `js/data/exercises/index.js` | 28 Jul | Orphaned duplicate of `js/data/exercises.js` — identical content, only import paths differ (confirmed via diff). No direct or directory-style imports found anywhere in the codebase, checked twice. | Not imported, causing no active harm. Real risk is future confusion (someone edits the wrong copy), not present danger. Worth removing at sign-off via the GitHub web UI, not urgent today. |
| `coach-proposal.js`'s `renderBypassDoor(tier)` | 03 Aug | Receives a `tier` parameter that's never actually used in the function body — dead parameter, not a functional gate. Found while checking tier-gating status. | Not causing any active harm — just unused. Original intent unclear (may have been meant to gate one of the two bypass options for free tier and never finished); needs a product decision, not a guess, before either removing the parameter or actually wiring gating logic to it. |

**How to add to this list going forward:** any session that finds something safely inert — old code, superseded docs, an orphaned file, a deprecated pattern nothing depends on — logs it here instead of either fixing it mid-session (scope creep) or letting it quietly vanish. One line: what it is, why it's safe to leave, found-date.

**At sign-off:** work through top to bottom, re-confirm each item is still genuinely inert (don't assume nothing changed since logging), then remove.

---

## 📅 Six-Week Plan — Standing Section (folded in 31 Jul 2026, was Task Inventory Section J only)

Source: Task Inventory Section J v3 (23 Jul 2026 reprioritisation). Now maintained here going forward — update this table at session close alongside everything else, rather than letting it drift separately in the Task Inventory doc. Three fixed review checkpoints, not review-after-every-session: **27 Jul (held), 31 Aug (the honest go/no-go on mid-Sept beta), 14 Sept (pre-launch)**.

| Week beginning | Availability | Focus | Status |
|---|---|---|---|
| 27 Jul | Full | Safeguarding/HMRC start, BUILD-5, BUILD-3 | **Held.** BUILD-5 closed, BUILD-3 code-clean/on-device pending, safeguarding/HMRC still open. |
| 3 Aug | Full | Core Session investigation, Supabase scoping, BUILD-1 sub-question | **Ahead of schedule.** Core Session closed 30 Jul (early). BUILD-4 also closed early (wasn't due till this week). Supabase design blueprint ready. Two new findings this session (tier gating, coach-proposal doors) not yet reflected in original plan — see dashboard. |
| 10 Aug | Mon–Wed full, away Thu/Fri | Content audit (D-Audit), BUILD-4 align if time allows, national/local outreach, infra accounts, website building starts | Not yet started. BUILD-4 already closed (ahead of schedule), so this slot is now free for other priorities — worth revisiting given this week's tier-gating/coach-proposal findings. |
| 17 Aug | Mon only, then away (light laptop) | Admin only, close loose ends | Not yet reached. |
| 24 Aug | Away all week (light laptop) | Reactive only | Not yet reached. |
| 31 Aug | Full | **Review checkpoint — the real one.** Full reconciliation, honest go/no-go on mid-Sept beta. Device test programme, WCAG audit, follow-up outreach. | Not yet reached. |
| 7 Sept | Full | Final pre-beta admin/infra checks | Not yet reached. |
| 14 Sept | Full — target window | **Review checkpoint — pre-launch.** Pre-beta opens (target). | Not yet reached — this is the target date, not a confirmed one. |

**Worth flagging plainly:** the original plan didn't anticipate this week's tier-gating and coach-proposal-doors findings — both are now real candidates for the 10 Aug slot that BUILD-4 closing early has freed up. Not re-planning the whole six weeks over this, but worth a conscious decision rather than the slot silently filling with whatever comes up next.

---

## One-Page Dashboard — 11 Aug 2026

| Stream | Current position | Immediate next action | Blocker? |
|--------|-----------------|----------------------|----------|
| Product — Persona Tracing, Wave 1 (2.12 + 2.15) | 🟢 **Brief ready, 11 Aug** (`alongside_brief_persona-tracing-wave1_11aug2026_v1.md`). Deep, longitudinal trace — three weeks of simulated realistic use, sourced from the existing 17-persona QA matrix, not invented. Deliberately written for a fresh chat with no history of this project, to reduce bias. Three required outputs: file/line-referenced technical report, jargon-free plain summary, grounded persona narrative. Persona B's tier switch traced as one continuous free-to-Personal journey, not two separate tests. | Ready to run in a fresh chat whenever Graeme wants. | None. |
| Product — YouTube search links, all 461 exercises | 🟢 **Fixed, 10 Aug.** Restored per Graeme's direct request ("we get the most up to date versions and avoid any issue with discontinued or old videos"). Previously zero coverage across the entire main database. Content-style traced per file first, not a blind bulk pass — `running.js` (mixed technique drills/paced sessions) got 35 hand-crafted terms. Three quality passes afterward caught real issues each time (roman numerals, duplicated words, one genuine duplicate exercise entry). Confirmed via import test: 461/461, zero remaining issues. `js/data/exercises/*.js` (11 files, 3 bumped, 8 given first-ever version headers). | None — closed. | None. |
| Product — `gym-programme.js` UX rebuild (matches `prescribed-session.js`) | 🟡 **Code complete, 11 Aug, on-device pending.** Graeme's direct screenshot comparison confirmed 10 Aug's fix wasn't enough — content rendered correctly but the screen structure was still a flat scrollable list. Rebuilt to walk one exercise at a time (progress header, timer/reps display, structured guidance, Next/Skip), reusing `prescribed-session.js`/`workout.js`'s exact markup and shared CSS classes. Completion tracking moved from DOM-scanning to a proper Set. Week 6/12 moments, programme progression, A/B alternation, exit-guard all unchanged. `gym-programme.js` v4→v5, `sw.js` v225. | **On-device test — highest priority right now.** This is a structural rebuild of the core session flow, the biggest single UI change since the Home Nav redesign. | Needs a phone. |
| Product — Exercise-detail UI consistency (what/how/why/support) | 🟢 **Fixed in 5 views, 10 Aug** (see row above for `gym-programme.js`'s follow-up rebuild, 11 Aug). The connected finding: all 461 exercises already had `instructions`/`coaching`/`why` at 100% coverage before tonight — "Name, what to do, mark as done" was silent field-name bugs, not missing content. `gym-programme.js` had three mismatches in one block (`setup`/`whyThis`/`videoUrl` → real fields `instructions`/`why`/`youtube`). `core-session.js` and `yoga-session.js` each had a singular/plural `.cue` bug plus missing sections despite full data. `prescribed-session.js` — most safety-relevant, zero guidance ever shown — fixed by reusing its own existing safety-check `EXERCISES` lookup; verified both database-linked and manually-added paths. `workout.js` fixed too (was regenerating a generic query instead of using the tailored term). `walk`/`run`/`swim`/`cycle-session.js` confirmed correctly out of scope — different pattern entirely (continuous activity + coach prompts), traced directly not assumed. | **Not yet on-device confirmed** — this touches 5 core session views, worth a real pass. | Booked, high priority given the file count touched. |
| Product — `yoga-session.js`'s private pose pool needs `why` content | 🔵 **New, 10 Aug, deliberately deferred.** 30 poses have good description/cues (now also youtube) but no rationale field exists in this pool's data structure at all. Genuine content authoring — 30 individually accurate "why this pose helps" writeups — not a mechanical fix. Left undone rather than rushed at the end of a long session. | Needs a dedicated content pass. | Not booked, no urgency. |
| Cleanup — `yoga-session.js`'s private exercise pool (third parallel database) | 🔵 **New, 10 Aug.** Same structural concern as the `exercises.js`/`exercises/index.js` situation found 10 Aug — a third, separate, hand-maintained exercise data source (30 poses), disconnected from the main 461-exercise database. Not fixed or merged tonight — real architectural decision, not a solo call. | Worth folding into the same future consolidation conversation as the other exercise-database duplication. | Not booked, no urgency — no current bug from this, just structural risk. |
| Product — `noticing.js` "Your reflections" field-name bugs | 🟢 **Fixed, 10 Aug, overnight autonomous session.** Two real bugs since the 14 Jul journal privacy rewrite: `entry.createdAt`/`category`/`body` all read undefined fields (real fields are `date`/`tags`/`text`), and `entry.type === "weekly-noticing"` was always false (never written anywhere). Consequence: reflections showed blank date/text, and `getRecentEntries()`'s sort never actually worked (`new Date(undefined)` vs `new Date(undefined)`) — entries were shown in original array order, not by recency. Both fixed; dead "This week" badge removed rather than a working version guessed at. `noticing.js` v4→v5. | **Not yet on-device confirmed.** | Booked — on-device pass. |
| Product — `journalEntryType` pre-select | 🔵 **Re-scoped, 10 Aug** — found bigger than previously noted. Not a small missing field-read: `journal-entry.js`'s v3 privacy rewrite dropped the entire pre-selected-screen mechanism, not just this one field. There's currently no branching logic in the file at all — always the single free-text screen. Fixing this properly means designing what a type-specific screen should actually look like. | Needs Graeme's design input — genuinely not a contained code fix. | Not booked. |
| Product — Bodyweight-only lower-body main exercises | 🟢 **Fixed, 10 Aug, overnight session.** Four new exercises added (hip-hinge/single-leg/squat-pattern/leg-isolation), matching existing format and safety conventions exactly. Confirmed via test: no-equipment Lower Body went from 0 main exercises to 4. Full 7-type regression re-run clean. `session-builder.js` v2→v3. | **Not yet on-device confirmed.** | Booked — folds into the general Phase 1 on-device pass. |
| Cleanup — `exercises/index.js` "orphaned duplicate" | 🟡 **Correction, 10 Aug — this note was stale, not acted on.** Direct re-check found it's now genuinely load-bearing: `conditionProgrammes.js`, `core-session.js`, and `prescribed-session.js` all import from it — all three built after the original "orphaned" finding. Diffed against `exercises.js` (workoutGenerator.js's import): currently byte-identical in logic, only import-path depth differs. Real structural risk (two copies needing manual sync forever, or silent drift between `workoutGenerator.js`-generated sessions and everything else) — but not something to merge unilaterally overnight. | Needs a scoped consolidation session — point every import at one canonical file. Real risk if rushed (touches 4+ live features). | Not booked, no urgency — no current behavioural drift, just structural risk. |
| Safety — Severe-pain Rest/Adapt flow | 🟢 **Traced, 10 Aug, no bugs found.** Read closely (`coach-proposal.js`'s severe-choice handling, `store.recordSeverePainChoice()`) — condition-set sorting and matching both correct, `conditionReflections`'s namespace separation from Journal confirmed correctly implemented. One minor, non-urgent note: `severePainChoices` has no cap (unlike `activityLog`'s 200-entry limit). | None needed — this was a confidence-building trace, not a fix. | None. |
| Product — Gym Session Builder — Phase 1 | 🟡 **Code complete, 05 Aug, on-device pending.** `session-builder.js` v3 (now includes tonight's bodyweight content too), `session-builder-ui.js` v4, `library.js` v3, `settings.js` v14, `sw.js` v223. All pushed, confirmed live via fresh fetch. Every blueprint decision built: routing fix (Core/Upper/Lower/Glute/Full now genuinely distinct, "Strength" retired for lacking a real mapping), location step, allocation presets with a structural warmup floor, three build routes mirroring `conditionProgrammes.js`, real cardio-warmup content (bike/treadmill/cross-trainer/rowing machine — previously didn't exist anywhere). Tested extensively via Node smoke tests against real store data (all 7 types, safety floor, equipment gating, the full preselect contract) — caught and fixed one real bug before shipping (an edit had silently deleted Glute Focus's `mainCategories`). Also fixed in passing: `session-builder.js`/`session-builder-ui.js` were never in the precache list at all. | **On-device test, same priority tier as the Wake Lock fix** — this is exactly the category of thing (real flow, equipment-dependent, multi-step) only ever fully proven through actual use. Test all 5 gym cards + both build modes + a real location switch. | Needs a phone. |
| Product — Lower-body main exercises: no bodyweight-only options | 🔵 **New, 05 Aug, found while testing Phase 1.** Confirmed via direct count: every exercise tagged to `squat-pattern`/`hip-hinge`/`single-leg`/`leg-isolation` requires equipment — a user with nothing selected who picks Lower Body currently gets 0 main exercises. Pre-existing content gap, not introduced by Phase 1. | Needs new bodyweight lower-body exercise content — a content task, not a code fix. | Not booked, no urgency — narrow edge case (equipment-free lower body specifically). |
| Product — Gym Session Builder — Phase 2 (smart same-day warmup-skip, deferred) | 🔵 **New, 05 Aug, deliberately deferred.** Graeme's fuller vision includes skipping a warmup for a body area already worked earlier the same day — genuinely can't build yet. Needs two things that don't exist: muscle-group/body-area tagging on exercise data, and per-exercise (not just per-session) completion logging. Real content/data project, not a code tweak. | Scope properly once Phase 1 has shipped and real usage patterns exist to inform it. | Not booked, no urgency — explicitly not blocking Phase 1. |
| Comms — Email systems, welcome pack, taster code comms | 🟢 **Brief ready, 04 Aug** (`alongside_brief_comms-email-taster-codes_04aug2026_v1.md`). Covers COMMS-1 through COMMS-5 plus new social media scope. Flags the Journal Privacy Rule constraint on COMMS-4 explicitly, and reuses already-drafted reversion-prompt copy rather than having it rewritten. | Run as a dedicated content/comms session — needs Graeme's own voice for the founder message and video, not something to fully delegate. | Social media scope (platforms, timing vs. outreach) needs a decision before drafting starts — flagged in the brief itself. |
| Product — Home Navigation & Conditions redesign (spec) | 🟢 **Spec v2 complete, 04 Aug.** Superseded as an open item by the blueprint row below — see that row for current status. | — | — |
| Outreach — BANDS CIC meeting (Alfie + members) | 🟢 **New, 03 Aug.** First real response of 4 Tier 1 org emails sent. Real potential: follow-on meetings across Frome, Bath, Weston, Trowbridge if this goes well. | **Get a confirmed date from Graeme** — currently untracked without one. Prep a meeting brief once date's known, same pattern as the Alex meeting brief. | Meeting date unknown. |
| Outreach — Canopy PT connection (neurodivergent clients) | 🟡 **New, 03 Aug.** Warm connection via the separate Canopy sub-project, not the direct outreach list. Interested in "supporting" — form unclear. | Conversation needed to understand what's actually being offered before this can be scoped. | Nature of support unclarified. |
| Product — Wake Lock / resumable session gap | 🟡 **Code complete, 03 Aug, on-device pending.** `running-session.js` v4, new `session-resume.js`, `sw.js` v189, all pushed and confirmed live via fresh fetch. `node --check` clean. Blueprint's full scope implemented: timestamp-anchored elapsed, checkpoint/resume, coach-voiced resume card, Wake Lock lifecycle, exact-equality prompt-match fix. | **On-device test**: lock screen mid-run, force-refresh mid-run. This bug was only ever found through real use — treat this as the priority on-device test over BUILD-3's, since BUILD-3 is expected to be a formality and this genuinely isn't. | Needs a phone. |
| Product — BUILD-1 (Nav-gap fix) | 🟡 Core mechanism confirmed. Sub-question open. | Quick confirmation. | None. |
| Product — BUILD-2 (Proposal-loop fix) | 🟢 Closed 23 Jul. | — | None. |
| Product — BUILD-3 (Session-view audit) | 🟡 Code confirmed clean twice. Not yet on-device tested. | On-device pass, expected formality. | Needs phone only. |
| Product — BUILD-4 (Schema Reconciliation) | 🟢 **Closed, 30 Jul.** `schema.md` v1.9 live in repo. Two corrections to the 28 Jul note itself found (`todayIntensity` live not dead, `exerciseFeedback` dormant not live). | None — see Appendix A follow-up as a new, separate item. | None. |
| Product — BUILD-5 (available-time bug) | 🟢 Closed, confirmed on-device 24 Jul. Three fixes. | None. | None. |
| Product — BUILD-6 | Confirmed non-crashing. Decision still open, low priority. | Graeme's call. | Not booked. |
| Product — BUILD-9 (18+ age-gate) | Not yet scoped. **U18 safeguarding position genuinely open.** 🟡 **Updated 10 Aug** — the Move-specific question ("what do I need to do to protect against under-18s reaching Move while collecting sensitive health data") was put directly to Natalie at the solicitor consultation. Awaiting her written response. Alex's earlier "potentially we don't need to worry about U18" is still an untested instinct, not a decision. | Hold scoping until Natalie responds. **Keep slack in the September plan** — an answer requiring age assurance beyond self-declared DOB would add real build work close to the beta window. | Waiting on Natalie (was: Alex). |
| Product — Thread scroll-bug audit | 🟢 Closed, 28 Jul. 2 of 3 files already fixed, third checked and cleared. | None. | None. |
| Product — B3-2-Test follow-ups | 2 items remain (chip overflow, reflect.js cache-clear confirmation). | Fold into a future session. | Not booked, low priority. |
| Product — Core Session `currentActivityEntry` data-integrity question | 🟢 **Fully closed, 30 Jul.** Complete on-device test pass across all 7 files — every fix confirmed working, CSS visually confirmed on all 7. Two real bugs found and fixed during testing itself (yoga stuck-screen, dedupe window too wide). `gym-programme.js` found separately broken, own item logged — now code-complete 31 Jul, see BUILD-GP Outcome section, on-device pending. | None — fully closed. | None. |
| Product — BUILD-4 Appendix A follow-up | 🟢 **Closed** (previously mislabeled "blueprint ready" — corrected 04 Aug on direct re-check). `Schema.md` confirmed at v1.16, well past the v1.10 this follow-up would have produced — this genuinely ran. | None. | None. |
| Product/Infra — Supabase schema design | 🟢 **Closed** (previously mislabeled "blueprint ready" — corrected 04 Aug on direct re-check). `alongside_supabase_schema_design_03aug2026_v1.md` confirmed to exist in the repo. | None. | None. |
| Product — Tier gating (isPremium/isAthlete/lockedFeature) | 🟢 **Infrastructure built, 03 Aug.** New `js/auth.js` + `css/components/tier-gating.css`, wired into `app.js` v8. Uses live `tier` field (not the May spec's assumed `userTier`). `progress.js`'s existing working gating deliberately left untouched. Several May-spec audit items confirmed no longer applicable (killed coach-style-variants feature, several never-built features) — see this version's substantive changes for full detail. `node --check` clean, confirmed live via fresh fetch. | **`lockedFeature()` not yet applied to any live feature** — nothing currently ungated-and-real was found to wrap it around. Apply it the next time a genuine premium-only feature is built. | None. |
| Product — `upgrade.js` crash (`store.getUserTier()`) | 🟢 **Fixed, 03 Aug.** `render()` was calling `store.getUserTier()`, which never existed in `store.js`. Fixed to `store.get("tier") \|\| "free"`, matching every other live reader. `upgrade.js` v1→v2, `sw.js` v190. Confirmed live via fresh fetch, `node --check` clean, no other stray calls found anywhere in the app. | None. | None. |
| Website — WCAG 2.2 AA contrast audit | 🟢 **Closed, 03 Aug.** Scroll-arrow + 5 more functional-border elements + badge backgrounds, all fixed and ratio-confirmed. `site.css` v7→v8. | None. | None. |
| Website — `/upgrade` page (W5) | 🟢 **Built and polished, 03 Aug.** Content complete, colour pass done, checked against live code. `upgrade/index.html` v5, `site.css` v17, `js/site.js` v6. | Checkout wiring (Stripe/Supabase) — separate infra session, needs S-F3/S-F4 first. | Blocked on Supabase auth + Stripe setup, not on content. |
| Website — `/who-its-for/` page (persona + comparison) | 🟢 **Built and ground-truth corrected, 03 Aug.** Personas, Free vs Personal comparison, and Areas-explained section all live, checked directly against `alongside-app` code rather than trusted from specs. | None — see the three new build items below for what the table now correctly flags as "Coming soon." | None. |
| Website — free vs premium colour system (broader ask) | 🟡 **Partially actioned, 03 Aug.** `/upgrade` + `/who-its-for/` cover Move. Family-wide version needs Learn/Life/etc. free-vs-premium specs written first — those don't exist yet for most products. | Graeme's call on whether to spec the other products or leave Move-only for now. | Not booked. |
| Website — cache-busting bug (`site.css?v=` stale on 4 pages) | 🟢 **Found and fixed, 03 Aug.** All 4 pages were still requesting `?v=7` after the stylesheet moved to v10 this session. | None — closed. | None. |
| Business — footer said "Build New Habits Ltd" | 🟢 **Found and fixed, 03 Aug.** `js/site.js` v6 — "Ltd" removed site-wide. | None — closed. | None. |
| Product — Exercise difficulty scale: 1–3 live vs 1–5 spec'd | 🔴 **New, 03 Aug, found while ground-truthing the comparison table.** Checked `js/data/exercises/strength.js` directly — 90 exercises, all tagged `difficultyLevel` 1–3, none above 3. The exercise-database spec's claimed 1–5 scale doesn't match live data. **Graeme's decision: migrate to 1–5**, and let users start at any level and progress from there — not just unlock upward from 1. | Needs a blueprint: re-tag the exercise database (~500 exercises across 12 files), design the level-selection + progression UX, decide the 1–3→1–5 mapping. | Not booked. Real scope, not a quick fix. |
| 🟢 Product — **STALE, corrected 12 Aug.** `filterByFitnessLevel()` exists in `exercises/index.js:218` and is applied at `:325`. Original finding: no difficulty-based exercise gating exists at all | 🔴 **New, 03 Aug, found in the same check.** `selectFromCategories()` in `session-builder.js` filters by equipment and condition only — never by `difficultyLevel` or tier. Free and Personal currently draw from the identical exercise pool; the spec's "Free tier limited to difficultyLevel 1" was never built. Same root cause as the difficulty-scale item above — likely one combined build session. | Fold into the difficulty-scale migration blueprint above. | Not booked. |
| Product — Generative/periodised multi-week programme engine | ⚪ **Confirmed not built, 03 Aug** — `alongside_generative_programme_design_note.md` explicitly scopes this to "Future Build, Target: Phase 4B or Phase 5." Website now correctly marks this "Coming soon" rather than presenting it as a live Personal-tier benefit. | No change — already correctly scoped as future work elsewhere. | Not booked, by design. |
| Product — Hardcoded gym programme (Sessions A–C) | ⚪ **Confirmed retired, 03 Aug.** `gym-programme.js` v3 (31 Jul) reads exclusively from the session builder now — no hardcoded PROGRAMME object remains in the file. Was previously built around Graeme's own physio routine; that's gone from the live file already. Informational only — no action needed. | None. | None. |
| Product — Coach-behaviour "remembers across time" claim (Personal tier) | 🟡 **Unverified, 03 Aug.** The website states Personal-tier coaches reference patterns over time (per the locked Phase F design decision, 09 Jul) — not checked against live code this session. Flagged, not guessed at either way. | Quick code check next session — is this actually implemented anywhere, or still just the confirmed design decision? | Not booked, low urgency — website copy isn't wrong, just unconfirmed. |
| **Business/legal — website now states unbuilt features as current claims, by deliberate decision** | 🔴 **New, 03 Aug, explicit instruction from Graeme, not a mistake.** `/who-its-for/`'s comparison table and persona cards state exercise-level progression and periodised multi-week programmes as things Personal tier does — neither is built (see the two rows above from v94). Graeme's stated reasoning: the website becomes the accountability spec for what the app should do; easier to change the site than to have quietly under-scoped the app. **Genuinely fine today** — `/upgrade`'s checkout is still disabled, no money changes hands. **Becomes a real consumer-protection issue the moment Stripe/Supabase checkout goes live** (S-F3/S-F4) with this wording still in place — a paying Personal-tier user told they get feature X that doesn't exist is a legitimate complaint, not a style question. | Add an explicit checkpoint to the BUILD-9/beta-readiness checklist: re-verify every current-tense feature claim on `/who-its-for/` and `/upgrade/` against live code before checkout goes live, either build the gap or soften the claim. | Not booked as a task yet — needs to land on the pre-beta checklist specifically, not get lost as a general "someday" item. |
| Website — Community page charter removed | ⚪ **Decision, 03 Aug.** "What belongs here"/"What doesn't" block removed from `community/index.html` — Graeme flagged it as confusing twice, not doing anything useful yet (there's no live community space for it to describe). Content preserved in the file's own changelog, not lost, in case it's wanted again once a real space exists. | None — informational. | None. |
| Product — `coach-proposal.js` doors 2/3 ("Your programme" / "Something different") permanently disabled | 🟢 **Resolved by design decision, 04 Aug — see Home Nav blueprint.** Superseded, not fixed in place. The six-door Home redesign (Phase C of `alongside_blueprint_home-navigation-conditions_04aug2026_v1.md`) makes the 3-doors-plus-bypass screen unnecessary as a screen: Home's Cardio/Core/Strength, Mobility & Conditioning, and Wellbeing doors directly replace the old bypass row; "Unsure? Coach decides" replaces Door 1. `coach-proposal.js` is kept but reduced — doors UI removed, `buildProposal()`/re-entry/missed-offer/condition-note logic retained as the destination for "Unsure? Coach decides" only. | Ships as part of Home Nav Phase C, not a standalone fix. | Booked — sequenced into the Home Nav blueprint, Phase C. |
| Website — Home/Products/Community/Impact | 🟢 Confirmed clean. | None unless BUILD-9 triggers a copy pass. | None. |
| **Website — Philosophy page** | 🟢 **Built and pushed, 10 Aug.** From `alongside_philosophy_page_architecture_10jul2026_v3` — all seven beats locked since 10 Jul and never built, the same drop-off `/upgrade/` had. Copy verbatim, no additions to the locked text. Pure prose, no bullets, no animation, no conversion CTA, gold deliberately unused (Personal-tier marker only; nothing here is tier-gated). Accessibility: one h1, seven visually-hidden h2s so screen-reader users can navigate beat to beat without adding the visual headings the design explicitly forbids; all `aria-labelledby` verified to resolve; every colour used checked against `bg-deep` (prose 14.48:1, teal 12.07:1). `philosophy/index.html` v1, `css/site.css` v19, `js/site.js` v7, `sitemap.xml` v4, all six existing pages bumped to `?v=19`/`?v=7` with version headers. Push verified by fresh clone, not `raw.githubusercontent.com`. | **Not yet reviewed on a real browser** — static checks only. Real test: read it top to bottom on a phone and confirm the white space between beats actually creates the pause it is designed to, rather than just reading as a gap. | Booked — next website pass. |
| Website — Philosophy h1 wording | 🟡 **Open question, 10 Aug.** The locked architecture specifies no page title; a page needs exactly one h1 for WCAG heading structure. "Philosophy" used as a label rather than inventing evocative copy the document doesn't contain. | Graeme's call — keep the label or write a real h1. Trivial change either way. | Not booked. |
| Website — Beat 4's unintroduced "I" | 🟡 **Open question, 10 Aug.** Beat 4 is first person throughout ("There are three things I believe"), exactly as locked — the design note says "Graeme's voice throughout". The rest of the page is "we". No attribution line was added because none is in the locked document and inventing one would be new copy. As it stands the reader meets an "I" with no idea who is speaking. | Graeme's call — add an attribution, or leave it as a deliberate intimacy. | Not booked. |
| Website — `sitemap.xml` under-listing the live site | 🟢 **Found and fixed, 10 Aug.** `/upgrade/` and `/who-its-for/` both shipped 03 Aug and were never added — the sitemap had been two pages short for a week, despite the file's own instruction to add each page as it ships. Both added with real ship dates, plus Philosophy. `sitemap.xml` v4. | None — closed. Worth treating as a standing step: new page means nav, sitemap, and cache-bust, not just the page file. | None. |
| Website — `/who-its-for/` nav placement | ⚪ **Decision, 10 Aug, Graeme's.** Stays out of `NAV_LINKS`, reachable only via the gold button under the Move card on Products. Reasoning: it is Move-specific and the website covers the whole product family. Recorded so it isn't re-raised as a gap. | None — informational. | None. |
| Website — About page | 🟠 **Specced, unbuilt.** `alongside_about_page_architecture_09jul2026_v1` is complete and locked. Not blocked by anything external — but it is the page about Graeme, and needs his own raw material rather than being assembled from the architecture alone. | Graeme to supply/confirm the personal content, then a build session. | Not booked. |
| Website — Safety & Contact page | 🟠 **Specced, unbuilt, and correctly withheld.** `alongside_safety_page_architecture_09jul2026_v1` is complete and locked. **Must not go live until BIZ-6's three safeguarding reviewer roles are filled** — this is the page that carries crisis routing, and publishing unreviewed crisis information is a real-world risk, not a process formality. Crisis contact details would also need verifying as current at build time, not trusted from a July document. | Blocked on BIZ-6. Can be built ahead of sign-off if Graeme wants it ready, but must stay unlinked from nav and sitemap until reviewed. | Blocked. |
| Outreach — OUT-1 (reshaped) | Brief drafted, not yet run. | Run the session. | Blocks OUT-2–OUT-7. |
| Outreach — org category decision | New, 29 Jul. Alex suggested workplace wellbeing reps and women's health groups; "why would they do anything?" messaging gap identified. | Graeme's decision + messaging pass. | Blocks OUT-2–OUT-8. |
| Business — BIZ-9 (IP/trademark) | Deprioritised 29 Jul per Alex; still deprioritised. 🟡 **Raised at the 10 Aug solicitor consultation as planned** — no advice given yet. | Await Natalie's response. Do not chase separately. | None urgent. |
| Business — BIZ-5 (solicitor: Privacy Policy + ToS) | 🟡 **Solicitor engaged, 10 Aug** — Natalie, 30-minute introductory call, all four areas covered. Moves from "no solicitor identified" to "awaiting scope, priorities and costs." **Not closed — no advice received yet.** See the Solicitor Consultation section above for the full record and the five follow-up actions. | Send/confirm the six-document pack; restate the beta-minimum vs launch-minimum split **in writing** as two lists, not one combined answer; ask for a safeguarding reviewer referral. | Awaiting Natalie's written response. |
| Business — Severe pain Rest/Adapt choice liability question | 🆕 **New, 04 Aug.** Graeme's reasoning for the new Severe-pain choice feature (`coach-proposal.js` v17): an actively-chosen, recorded "rest offered, user chose to continue" pattern may reduce liability if a user is injured after choosing to adapt. The interaction and audit trail are built — whether it actually holds up legally is unverified, flagged in the code comments as a real legal question, not assumed. | 🟠 **Not confirmed raised at the 10 Aug consultation** — not mentioned in Graeme's account of the meeting, so assume not covered. Add it to the follow-up email; it's a cheap addition to an existing thread. | Awaiting Natalie. |
| Marketing — LinkedIn presence | New, unscoped, 29 Jul. BNH business page + Graeme's personal profile. | Scope whenever Graeme's ready to start. | Not booked. |
| Infra — INF-7 (breach response process) | Reconfirmed open, 27 Jul. No procedure written. | Write short internal procedure. | Same trigger as BIZ-3. |
| Infra — Supabase account 2FA | New, 27 Jul. | Graeme's own action. | None. |
| Infra — GitHub fine-grained token workflow | 🟢 **Live, 30 Jul.** Token in project knowledge, 7-day expiry, already used for BUILD-4 + docs reorg. | Regenerate before expiry when needed. | None. |
| Infra/Admin — Changelog.md maintenance | 🟢 **Decided, 30 Jul — resume.** New entry added for BUILD-4 work, re-establishing the practice. | Keep it current from every future session onward. | None. |
| Infra/Admin — Changelog.md historical backfill (Mar–Jul gap) | New, 30 Jul. Explicitly separate from the resume decision above — not assumed as part of it. | Graeme's call whether this is worth a dedicated session. | Not booked, no urgency. |
| Cleanup — `checkin-mini.js` orphaned `workoutsGeneratedAt` write | Logged, 30 Jul. Now fully orphaned (its only reader removed this session). | Sign-off only. | None, deliberately deferred. |
| Cleanup — `activeProgramme.measurementsOptIn` anomaly | Logged, 30 Jul. Copy-paste artefact from `strategicGoal.measurementsOptIn` via `mergeWithDefaults()`. | Small fix, not urgent. | None, deliberately deferred. |
| Cleanup — `exercises/index.js` | Logged, 28 Jul. | Sign-off only. | None, deliberately deferred. |
| UI — Screen styling inconsistency (Intention / Library / Coach Proposal) | New, 30 Jul. Found during on-device testing. Three different visual styles across the ways into a session. | Design pass, not scoped. | Not booked, no urgency. |
| UI — Location not changeable mid-flow | New, 30 Jul. Found during on-device testing. Once inside a Library location branch, can't switch location without exiting to top of Library. | Minor UX fix, not scoped. | Not booked, no urgency. |
| UI — Bottom nav bar covers content, no buffer | New, 30 Jul. Found during on-device testing. No padding above the persistent bottom nav on several screens (Intention, Yoga pickers at minimum) — content runs against or under it. | Consistent bottom-padding/safe-area fix across affected views, not scoped. | Not booked, no urgency. |
| Product — Yoga stuck-screen bug (`finaliseSession()` missing `rerender()`) | 🟢 **Found and fixed, 30 Jul, on-device.** Real completion left the screen frozen on the last pose — data was always correct, only the screen transition was broken. Fixed `yoga-session.js` v5→v6, re-tested on-device immediately, confirmed working. | None — closed. | None. |
| Product — Dedupe window too wide (`logActivity()`) | 🟢 **Found and fixed, 30 Jul, on-device.** Two genuine, distinct completions 83 seconds apart were silently rejected as a duplicate — screen showed false success. Reduced `dedupeWindowMs` 2min→10sec, `store.js` v10→v11. Applies to all activity types. | None — closed. | None. |
| Product — Silent failure on rejected `logActivity()` writes | 🟠 **New, 30 Jul.** Found alongside the dedupe fix above. When a write is rejected, the session view still shows a false success screen — no indication to the user. Needs a coach-voiced message (Nurturing tier), a content/UX decision. Deliberately not fixed on the spot. | Scope a dedicated session. | Not booked, no urgency but a real trust gap. |
| Product — `gym-programme.js`: no exit protection, no `activityLog` write, reflect answers silently lost | 🟡 **Code complete, 31 Jul** — built same session as the blueprint, direct via repo access (clone/edit/push). Section 2 decision (additive) confirmed by Graeme and implemented exactly: `progressLog` write unchanged, `store.logActivity()` now runs alongside it at completion and partial-exit, `currentActivityEntry` set. Exit-guard wired (`mountSessionGuard`/`dismountSessionGuard`, `showExitConfirm()` overlay), matching `workout.js` v6 pattern. Activity type set to `"gym"` (not `"workout"`) — deliberate, logged in file header/changelog, see follow-up row below. `gym-programme.js` v2→v3, `sw.js` v186→v187, `Changelog.md` updated — all pushed and confirmed live via raw GitHub fetch. | **On-device confirmation** — no device available during the build session, code review + `node --check` only so far. Test checklist in BUILD-GP Outcome section below. | Booked as soon as Graeme can test on-device. |
| Product — `workout.js` activity type `"workout"` isn't a `reflect.js` question/feel-option key | New, 31 Jul, found while fixing `gym-programme.js`. `reflect.js`'s `QUESTIONS`/`FEEL_OPTIONS` maps have a `"gym"` key with tailored gym content but no `"workout"` key — `workout.js`'s own completions (`type: "workout"`) fall through to the generic `"other"`/`"coach-session"` fallback text instead. Not a data-loss bug (reflect still saves correctly) — a missed-specificity gap only. | Small fix if wanted: change `workout.js`'s `logActivity()` calls to `type: "gym"` to match, or add a `"workout"` key to `reflect.js`'s maps. Either works; not urgent. | Not booked, no urgency — logged for awareness. |
| Admin — project knowledge cleanup | New, 30 Jul. Superseded master-schedule versions (v68–v78) and 4 retired schema docs need removing from project knowledge — Claude can't delete these directly. | Graeme, via the UI, whenever convenient. | None. |
| Admin — `Admin/` historical backfill | New, 30 Jul. Repo's `Admin/` folder has this week's blueprints/handoffs only; dozens more exist in project knowledge back to March, not yet moved. | Separate future session if wanted. | Not booked, no urgency. |
| Product — Wellbeing-first entry point (new design idea) | 🆕 **New, 31 Jul, Graeme's idea.** Currently, reaching Notice/Wellbeing requires going through the coach → starting an activity → backing out. Proposed: a top-level "doorway" choice (Exercise / Wellbeing) before the coach path, so non-exercise-focused users aren't routed through session-shaped UI to reach reflection/journaling. Not yet scoped — genuinely new. See PM chat discussion 31 Jul for initial thoughts. | Needs a proper design conversation — architecture question, not a quick build. | Not booked. Worth prioritising given who this serves (e.g. a low-exercise-motivation persona) — currently a real access barrier, not just a UX nicety. |
| Product — Progress reflections (mood-delta, rest-reminder observations) | 🟡 **Partially built, confirmed 31 Jul.** `progress.js` v2 already generates real pattern observations — consistency, energy trend, activity-type, programme context (`_buildObservation()`, confirmed live). **Not yet built:** the two specific examples Graeme described — a same-session mood-entered-vs-finished delta observation, and an explicit "you've worked hard X times this week, you may need rest" overtraining-aware message. Both are natural extensions of the existing pattern, not a new system. | Small-to-medium build session, extending `_buildObservation()`'s existing pattern. | Not booked. |
| Product — Journal export (PDF) + Supabase sync | 🟡 **Fully spec'd, confirmed 31 Jul, not built.** `alongside_journal_export_template_spec.md` is a complete, detailed PDF export design (Premium tier). Noticing Hub spec's own implementation checklist has "Plan localStorage-to-Supabase sync logic" and "Settings > Wellbeing > Storage Location (local vs Supabase)" both still unchecked. Genuinely depends on the Supabase migration (see Supabase schema design blueprint) being live first — not a standalone gap. | Sequenced after Supabase auth/migration is live, not before. | Blocked on Supabase migration, not urgent until then. |
| Product — `session-builder-ui.js` reads non-existent `userTier` field, locks Personal-tier options for paying users | 🟢 **Found and fixed, 03 Aug.** `isPremium()` now reads `store.get("tier")` instead of the never-written `"userTier"`. `session-builder-ui.js` v1→v2, `sw.js` v187→v188, pushed and confirmed live via raw GitHub fetch. Changelog updated. | **On-device confirmation** — switch to Personal tier via Settings' dev tier-switcher, confirm session-builder options unlock. No device available this session. | Booked as soon as Graeme can test on-device. |
| 🟢 Product — **RESOLVED 12 Aug (BIAS-1).** `workoutGenerator.js` now reads it via `resolveIntensity()`. Original finding: `proposalBias` written by `coach-reflection.js`, never read anywhere | 🟠 **New, 03 Aug**, found during BUILD-4 Appendix A follow-up. Reflection logic computes `lighter`/`rest`/`null` bias per reflection type (severe pain, burnout risk, consecutive days, returning after absence) but nothing downstream consumes it — same "specified but never wired up" pattern as `exerciseFeedback`. | Needs a decision: wire it into `coach-proposal.js`'s generation logic (the apparent original intent), or retire the write. Not scoped. | Not booked, no urgency — but a real "coach doesn't actually respond to reflection signals" gap worth being aware of. |
| Cleanup — `gymProgrammeWeek` dormant, no writer | 🟡 **New, 03 Aug**, found during BUILD-4 Appendix A follow-up. Read once in `reflect.js` as a cosmetic rotation seed, always defaults to `1` — real programme-week tracking is `activeProgramme.currentWeek`. | Sign-off only — safe removal candidate. | None, deliberately deferred. |
| Cleanup — `todayEnergy` dead, no writer | 🟡 **New, 03 Aug.** Naming remnant in `intention.js`, superseded by `lastCheckin.energy`. | Sign-off only — safe removal candidate. | None, deliberately deferred. |
| Cleanup — `community.credits` write-only, no reader | 🟡 **New, 03 Aug**, found incidentally while confirming `totalCredits` has no overlap with it (confirmed distinct — Impact Credits mechanism). Awarded via `awardCommunityCredit()` but nothing displays it anywhere. | Needs a decision: build a display (Impact page/Settings) or leave as backend-only for now. | Not booked, no urgency. |
| Cleanup — `workoutHistory` write-only, no reader | 🟡 **New, 03 Aug.** Fourth genuinely distinct history mechanism (alongside `activityLog`/`progressLog`/`activeProgramme.milestones`), appended on every gym-type `workout.js` completion, but nothing displays it. | Needs a decision: build a display or leave as-is. | Not booked, no urgency. |
| Cleanup — `consentGiven`/`consentAt` written, never checked | 🟡 **New, 03 Aug.** Set once in `welcome.js` onboarding, no gate anywhere reads them back. Likely intended as an audit-trail record rather than a live gate — worth Graeme confirming that's the actual intent given consent has legal/ToS weight. | Confirm intent; may be fine as-is (audit trail), may need a real consent gate. | Worth a quick sign-off given legal relevance — not urgent otherwise. |
| Product — Home Nav & Conditions Redesign | 🟡 **Conditions Update screen is live, 04 Aug — Phases A–D-4 all shipped.** New `conditions-update.js`: collapsed condition cards (unambiguous chevron affordance), severity slider, reflection field, felt-sense goal picker with a severity trend from existing `checkinHistory` once a goal's set, one shared "Your programme" section ("Build your own" only — coach-built/coach-recommended deferred to NEW-1, deliberately not shown as "coming soon" tiles), fold-in dial. Reachable from both Home's door and Settings' "Edit conditions," which now points at the real screen instead of the old limited onboarding sheet. `prescribed.js`'s coach voice is origin-aware. `router.js` v12, `today.js` v8, `settings.js` v12, `sw.js` v205. **Not built:** Phase D-5 (fold-in dial's actual generator hook in `workoutGenerator.js` — the setting is stored correctly, just not consumed by session generation yet). | **Not yet on-device confirmed** — needs a full pass: add/expand a condition, severity slider, goal + trend, reflection, "Build your own" coach line, both entry points (Home and Settings). | Booked — Phase D-5 (fold-in generator hook) is the only piece left of the original blueprint. |
| Product — Phase D decision D-1: condition-specific goals | 🟢 **Resolved, 04 Aug.** New field `conditionGoals` — felt-sense, not numeric, matching Graeme's own framing: three options only, "Feel healed" / "Cope better day-to-day" / "Feel stronger, improve," plus optional note, skippable. Offered alongside the existing coach-milestones option, not replacing it. | None. | Ships in Phase D-1. |
| Product — Phase D decision D-2: `prescribed.js` coach voice | 🟢 **Resolved, 04 Aug.** New field `prescribedExercisesOrigin` ('professional'\|'self'\|null). Only 2 of 4 coach-line branches in `buildCoachLine()` actually reference professional origin — those two swap on the flag, everything else (add-exercise form, session flow, credits) untouched. Copy-branching, not a rebuild. | None. | Ships in Phase D-4. |
| Product — Phase D decision D-3: fold-in dial scope confirmation | 🟢 **Resolved, 04 Aug.** Confirmed: fold-in dial touches `workoutGenerator.js` only ("Cardio, Core & Strength" sessions) — `core-session.js` (Phase B's consolidated pool, a different thing despite the similar name) stays untouched. | None. | Ships in Phase D-5. |
| Product — Design Consistency Audit ("clean lines" pass) | 🟡 **Half A complete, 04 Aug** (`alongside_design-audit-half-a-findings_04aug2026_v1.md`). Found and fixed a real bug along the way: `--color-bg-elevated` undefined everywhere, 46+ usages across 14 files, every "elevated surface" app-wide rendering with no background. `variables.css`, `main.css` v14→v15, `sw.js` v220. Also confirmed (flagged, not fixed): five-plus screens each reinvent their own card component rather than sharing a base — real consolidation candidate, needs a decision not a solo call. | **Half B (screenshot review) still needs Graeme** — do it fresh, several screens now look different than when this was scoped this morning. | Not booked. |
| Product — "Add to my programme" button overflow, likely explains a routing report | 🟢 **Fixed, 04 Aug.** Same overflow bug pattern found repeatedly today — `min-width:0` + `white-space:normal` applied. Re-verified the Mobility & Conditioning routing logic itself is correct (only routes to the programme when a condition-tagged entry genuinely exists) — the likely explanation for Graeme's separate report of it routing to Library instead is that this broken button prevented the exercise from actually saving in the first place, not a second bug. | **Retest needed**: add an exercise via "Coach recommends," confirm it saves, then re-check Mobility & Conditioning routes to the programme correctly. | Booked — retest is the gate. |
| Product — Library added as its own Home door | 🟢 **Fixed and confirmed correct behaviour, 04 Aug.** Graeme's follow-up clarified the earlier "still get this" report: Mobility & Conditioning correctly falls back to Library when no condition programme exists — confirmed working as intended, not a bug. Library door itself confirmed live. | None — routing confirmed correct. | Closed. |
| Product — Library page, fully styled | 🟢 **Fixed, 04 Aug** — extended from the landing-screen fix to the whole page, real missing-styles bug throughout, not a redesign. Checked every class `library.js` uses: "Start a session"'s category grid and its per-category session sub-screen had zero CSS too, same bug. "Log what I did" checked and confirmed already styled (reuses `settings-library.css` classes) — left untouched. `library.css` v2, `library.js` v2 (markup restructure only, no behaviour change). | **Not yet on-device confirmed.** | Booked — on-device pass. |
| Product — Force-update button | 🟢 **Built, 04 Aug.** Graeme's phone was stuck on stale, unstyled screens despite his laptop being current. Checked `sw.js` first: pure cache-first fetch strategy — confirmed real, not imagined. New "Update app" button in Settings' About panel goes beyond the existing polite `checkForUpdate()` — clears every cache directly and hard-reloads regardless of service-worker state. `settings.js` v13, `settings.css` v6. | **Not yet on-device confirmed** — this is the one that actually needs the phone test. | Booked — on-device pass is the point of this fix. |
| Product — Conditions Update scroll-jump fixed | 🟢 **Built, 04 Aug.** Every state change was resetting scroll to the top — the container being re-rendered isn't the scrolling element, window is. `window.scrollY` now preserved across every `render()`. `conditions-update.js` v6. | **Not yet on-device confirmed.** | Booked — on-device pass. |
| Product — Mobility & Conditioning: real landing page | 🟢 **Built, 04 Aug.** New `mobility-conditioning.js`: Start a Mobility Session (routes to `core-session.js`, already condition-aware), My Conditions Programme (collapsed by default — count + expand, "Not created" links into Conditions Update when empty, grouped-by-condition list plus a "Start this programme" action when expanded), Log an event (Library). Replaces the earlier smart-routing hack entirely. `router.js` v13, `today.js` v12. | **Not yet on-device confirmed.** | Booked — on-device pass. |
| Cleanup — `prescribed.js`'s "Back to choices" | 🟢 **Fixed, 04 Aug**, bundled with the landing page build above. Both back buttons now go to Home instead of the confusing `intention` screen — more relevant now that the new landing page is this screen's primary entry point. `prescribed.js` v1.3. | **Not yet on-device confirmed.** | Booked — on-device pass. |
| Product — Cross-condition programme integration | 🟢 **Built, 04 Aug.** Recommendation refined once before building — first draft would have duplicated shared exercises across conditions rather than genuinely reusing them (broken completion state, double credits, showing up twice). Rebuilt properly: `prescribedExercises` entries now support `conditionIds` (array) — one exercise entry can genuinely belong to more than one condition. `commitProgramme()` reuses existing entries by `exerciseId` instead of duplicating; both programme-building functions bias toward reuse and the UI shows "Already in your X programme." Backward compatible with old singular-`conditionId` entries, no migration step. Smoke-tested against real overlapping conditions (glutes/hip) before shipping — confirmed genuine reuse, not duplication. `conditionProgrammes.js` v3, `conditions-update.js` v7, `mobility-conditioning.js` v2, `prescribed.js` v1.4, `Schema.md` v1.16. | **Not yet on-device confirmed.** | Booked — on-device pass. |
| **Safety — `prescribed-session.js` contraindication check** | 🟢 **Fixed, 04 Aug.** New `_checkContraindication()` — for exercises with a real `exerciseId` (coach-built/coach-recommended, not manually added ones with no database record to check), compares against `getActiveConditionIds()` for today. Doesn't hide or block, surfaces a flag matching `coach-proposal.css`'s existing constraint styling and lets the person decide. Smoke-tested against real exercise data before shipping — severe pain correctly flags, mild correctly doesn't. `prescribed-session.js` v3, `workout.css` v3. `prescribed.js`'s list view still doesn't show this (only the in-session flow does) — reasonable, contained follow-up if wanted, not done here. | **Not yet on-device confirmed** — worth testing deliberately: build a programme, bump a condition to Severe via Conditions Update, re-open the session, confirm the flag appears on the right exercise. | Booked — on-device pass. |
| Product — `gym-programme.js` lacks a guided walkthrough | 🆕 **New, 04 Aug**, Graeme's direct comparison: `gym-programme.js` is a flat "tick when done" checklist — no timer, no form cues, no video links — while `workout.js` already has the full guided experience (timer, Start/Next/Skip, exercise detail). Real consequence, not just a UX gap: without an active session-flow moment, Empathy Transfer prompts have nothing to attach to in gym-programme sessions. | Needs its own scoped build session — bring `gym-programme.js` up to `workout.js`'s standard. Real size, not a quick fix. | Not booked. |
| Cleanup — `coach-reflection.js` now unreachable | 🆕 **New, 04 Aug**, found while confirming Graeme's "is this obsolete?" question. `checkin.js`'s fallback (the only place that ever routed here) now goes to Home instead — traced first, not assumed dead. File left in place, not deleted in the same pass it was found unreachable. | Worth a proper look before deleting outright — confirm nothing else references it, decide whether any of its logic (activityLog handling, the "pattern reflection" framing in its own name) is worth preserving elsewhere first. | Not booked, no urgency — dead code, not a live bug. |
| Product — Pain Input Redesign + coach messaging (full arc, 04 Aug) | 🟢 **Built and pushed across 4 same-day passes.** (1) Sliders replace chip buttons — `checkin.js` v9, `checkin-mini.js` v4, canonical `conditions.js` `getPainBand()` v1.4, `.ci-pain-chip` removed. (2) Multi-condition natural-language messaging — `coach-proposal.js` v15, `_joinNames()`. (3) Mixed-severity combined narrative (Mild+Moderate+Severe in one message, each by its own state) — `coach-proposal.js` v16. (4) Severe pain active Rest/Adapt choice, with a genuine audit-trail record (`severePainChoices`, `store.js` v13) — `coach-proposal.js` v17. `Schema.md` v1.13, `sw.js` v199. | **Not yet on-device confirmed — one full pass needed, covers all four.** Both sliders + label boundaries; Mild/Moderate/mixed-severity messages read correctly; Severe triggers the choice screen and blocks doors until answered; Rest routes to a gentle no-session screen; same-day re-entry doesn't re-prompt; Adapt proceeds normally. | Booked — on-device test is the only remaining gate before Phase B. |
| **NEW-1 — Condition-specific programme routes** | 🟢 **Built and confirmed on-device, 04 Aug.** All 3 real routes live in `conditions-update.js`: "Coach builds it" (automatic, `js/data/conditionProgrammes.js`, smoke-tested against real data), "Coach recommends, I'll choose" (checkbox selection, now with a one-line rationale per exercise and an Avoid/Less-often dislike signal — see rows below), "Build my own" (`prescribed.js`, condition-tagged). `prescribedExercises` entries carry an optional `conditionId`. All 4 of Graeme's original decisions applied: one-time generation, flat list for now (captured for future progression, not lost), 8 exercises for real substance, check-in gating fixed alongside. Graeme's full on-device pass across today's whole body of work confirmed working. | None — closed. | Shipped, confirmed. |
| Product — Exercise rationale + dislike signal | 🟢 **Built, 04 Aug**, Graeme's two questions, both real, both shipped same day. One-line `why` rationale now shown per candidate — already existed on all 461 exercises, zero new content. "Not keen on this one" applies the already-approved `alongside_exercise_skip_dislike_spec_16may2026_v1.docx` (binary Avoid/Less-often, not a rating) to the candidate list — new `exercisePreferences` field, `conditionProgrammes.js` excludes avoided exercises and de-prioritises "less" ones, smoke-tested before wiring in. | **Not yet on-device confirmed** for this specific addition. | Booked — on-device pass next. |
| Product — Full skip/dislike spec, in-session flow | 🆕 **New, 04 Aug**, explicitly deferred while building the row above. The approved spec also covers skipping *during* an active session (`gym-programme.js`/`prescribed-session.js`/`core-session.js`) with a "not available today" vs "not keen" distinction — genuinely separate, larger scope than the browsing-list version just shipped. | Needs its own scoped build session. | Not booked. |
| Product — Check-in gating made optional | 🟢 **Fixed, 04 Aug.** Graeme: "we should fix this so it's optional not fixed." `today.js` v9 — session-generating doors only force check-in the first time today; once checked in, doors go straight through. `checkin-mini.js` v6 — Skip now honours `pendingDoorRoute` instead of always dumping to `intention`. New voluntary "Update check-in" link on Home replaces "Check in" once already checked in today. Resolves the check-in-mini-every-time complaint below directly — check-in-mini no longer appears automatically for second-or-later sessions at all. | None — closed. | Shipped. |
| Product — check-in-mini's flat page style vs full check-in's conversational thread | 🟡 **Largely resolved as a side effect, 04 Aug.** The check-in-gating fix above means check-in-mini's page-style UI no longer appears automatically for every second session — it's voluntary now, reached only via "Update check-in." Confirmed earlier: full check-in's conversational bubble thread was never touched, still intact. Whether check-in-mini itself should ever get the conversational treatment (for when someone does choose to open it) remains open, but the urgency driving this — being forced into it constantly — is gone. | Graeme's call whether this still needs a redesign, now that it's optional rather than forced. | Not booked, lower urgency than before. |
| 🟢 **NEW-2 — Coach fitness-level recalibration engine.** `exerciseFeedback` is now WRITTEN (FEED-1, 12 Aug) — the capture UI it was waiting on exists. Original entry: 🆕 **New, 04 Aug**, Graeme's question during Home Nav discussion: can the coach notice and correct for a user's starting fitness self-assessment being too optimistic or pessimistic, across all programme tiers? Genuinely open — what data this needs hasn't been decided. Real candidate signals found while grounding the Home Nav blueprint, not yet wired together: dormant `exerciseFeedback` field (never written, but `applyFeedbackWeighting()` already exists and is ready to consume it); completion/skip rates against prescribed reps/sets; `conditionPainScores` trend over time; `fitnessLevel` (elsewhere flagged as inconsistently applied). | Needs a dedicated design conversation — likely sequenced after NEW-1 exists to recalibrate against. | Not booked. |
| Content — `dead-bug`/`bird-dog` contraindications | 🟢 **Resolved, 04 Aug.** Graeme's decision, recommendation offered first: Dead Bug's empty exclusions confirmed correct (standard anti-extension exercise, often used specifically as a safe low-back option). Bird Dog's lower-back/glutes exclusions also confirmed correct, plus a genuine addition — `wrist-elbow-acute`, for the real wrist loading in its hands-and-knees position that nothing previously captured. `strength.js` v3. Smoke-tested against the real safety-check logic before shipping. | **Not yet on-device confirmed.** | Booked — on-device pass. |
| Business — BUILD-3 on-device test | 🟡 **Genuine tracking inconsistency found, 04 Aug.** One section of this document says "all 7 files confirmed... nothing further outstanding" (core-session/yoga-session/workout/running/walk/swim/cycle); BUILD-3's original stated scope was 11 files. `prescribed-session.js` isn't among the confirmed 7 — its exit-guard behaviour has apparently never actually been on-device confirmed, independent of today's work. Checked precisely: today's edit to that file (the safety-check addition) only touched imports and `render()`'s output, not `mountSessionGuard`/`dismountSessionGuard`/`completeExercise`/`cleanupSession`/`savePartialSession` — nothing done today invalidates BUILD-3's prior clean-code checks. | Include `prescribed-session.js` explicitly in the next on-device pass — its exit-guard status is genuinely unconfirmed, not just assumed covered by the "all 7" note. | Booked — folds into the general on-device pass already needed. |
| Product — Mobility & Conditioning door | 🟢 **Wired to the real programme, 04 Aug.** `today.js` v10 — routes to `prescribed.js` when a condition-tagged programme exists, falls back to Library otherwise. Door tile shows a "Your programme" hint so the routing isn't silent. Last open bridge from Phase C's six-door Home now closed. Known small rough edge, not fixed: `prescribed.js`'s Back button returns to the general activity picker rather than Home when reached this way — pre-existing, low-impact. | **Not yet on-device confirmed.** | Booked — on-device pass. |
| **Product — "In Step" (Noticing Hub, Personal tier)** | 🟢 **Built and pushed, 09 Aug.** New feature developed and specced in full in PM chat the same session, then built directly. Four-movement scenario practice (Solo/Partner/Floor/Environment) extending the empathy transfer arc as a self-directed practice space, distinct from the existing stage-prompt system that fires unprompted in-session. One scenario, three lateral unranked options (order shuffled per view), identical acknowledgement regardless of choice, closed-by-default cited "Learn why" (Zhang 2025, Batson 1987, Decety 2011, Plumbly 2024). 3-day cooldown between scenarios per movement, anti-binge by design. Choice data logged to `inStepProgress.choiceLog` — aggregate research signal only, explicitly never read by coach logic or surfaced per-entry to the user; Graeme's stated intent is future cohort-level pattern reporting, not individual profiling. `js/data/in-step-scenarios.js` (new, 4 movements × 4 scenarios), `js/views/in-step.js` (new), `store.js` v17→v18, `router.js` v13→v14, `noticing.js` v3→v4 (card gated via `auth.js` `isPremium()`), `Schema.md` v1.16→v1.17, `sw.js` v221→v222. Ground-truthed against live repo before building (found `noticingProgress`'s territory/series schema already existed dormant, but the eight-territory `noticing.js` rewrite it was built for was never actually shipped — In Step is the first real consumer of that dormant schema shape). Deliberately named "movements," not "territories" — avoids collision with onboarding's unrelated `primaryTerritory` field. Also caught and documented a pre-existing `Schema.md` drift (`exercisePreferences`, `store.js` v17, never logged) while in the file. | **Not yet on-device confirmed** — first real test: complete a Solo scenario, confirm the 3-day lock shows correctly on return, confirm free-tier sees the locked card and taps through to `/upgrade`, confirm Personal-tier sees the real card and completes the full landing→scenario→result flow including Learn Why expand and the journal hand-off. Content depth (4 scenarios/movement) was agreed as v1 proof-of-concept — expansion is a deliberate later pass, not a gap. | Booked — on-device pass next session. Scope for cohort-level `choiceLog` reporting (mentioned above) is a separate future Supabase-era task, not blocking this. |
| Cleanup — `journal-entry.js`/`noticing.js` field-name mismatch | 🆕 **New, 09 Aug**, found while wiring In Step's journal hand-off. `noticing.js`'s "Your reflections" display reads `entry.body`/`entry.createdAt`/`entry.category`; `journal-entry.js` v3 actually writes `entry.text`/`entry.date`/`entry.tags`. Pre-existing, unrelated to In Step — not fixed (out of scope, touch-once). | Needs a proper look — likely means "Your reflections" has been silently rendering blank/undefined fields since v3 (14 Jul). | Not booked. |
| 🟢 Cleanup — **STALE, corrected 12 Aug.** `journal-entry.js:129` reads it. Original finding: `journalEntryType` set but never read | 🆕 **New, 09 Aug**, same discovery. Both `noticing.js`'s weekly-prompt button and the new In Step "write about it" button set `store.journalEntryType` before navigating to journal-entry, matching the original v2 intent — but `journal-entry.js` v3 never reads that field at all (removed or never carried over during the v3 privacy-rule rewrite). Entries still save fine; they just don't land on the type-appropriate pre-selected screen. | Needs a small fix in `journal-entry.js` to read and act on `journalEntryType` — contained, low-risk. | Not booked. |

*All standing rules, Stream A/C/D/E detail not listed above are unchanged from v71–v78 — see those versions for full detail.*

---

## 🔑 STANDING RULE — Project knowledge is WRITE-ONLY. Decided 16 Aug 2026.

**This rule goes into every build blueprint, every session prompt, and stays in this document. It is not a preference; it is a correctness rule.**

> **Claude NEVER reads project knowledge for the master schedule, the schema, or any live state.**
> **The repo is the only source Claude reads. `Documents/Admin/master_schedule.md` and `Documents/Live State/Schema.md` are canonical, always, with no exception and no tie-break needed — there is no second copy to conflict with.**
> **Claude still PRODUCES a snapshot at session close for Graeme to upload and review. That copy exists for Graeme, and Claude never reads it back.**

### Why, with the evidence

Graeme, 16 Aug: *"You only snapshot read it rather than the repo that you fully read. That's why we have that system."*

**Confirmed by measurement, not assumed.** A project-knowledge search for the master schedule on 16 Aug 2026 returned **`alongside_master_schedule_10aug2026_v141.md` — fifty-six versions behind**, still describing 10 Aug as "not yet started" and BUILD-4 as upcoming work. The v196 and v197 snapshots were not what came back.

The old session-start instruction said to search project knowledge for `alongside_master_schedule` **before doing anything else**. Followed literally on 16 Aug, that hands Claude a document describing the product a week in the past, and every plan built on it inherits the error silently. The only thing that prevented it was the second rule — that the repo copy wins — which made the first rule dead weight at best and a trap at worst.

**A stale copy that looks current is more dangerous than no copy, because it answers confidently.** That is the same fault as `schema-check.mjs` reporting a clean field diff over an empty string, and the same fault as Schema.md sitting eleven store versions behind while a gate existed specifically to prevent it. Three instances, one shape: *a source that cannot be current being trusted as though it were.*

### What this changes in practice

| Step | Before | From 16 Aug |
|---|---|---|
| Session start | Search PK for `alongside_master_schedule`, then reconcile against the repo | **Clone the repo and read `Documents/Admin/master_schedule.md`. Do not search PK for it.** |
| Live state | PK snapshot, repo wins on conflict | **Repo only. No conflict is possible.** |
| Session close | Write new version, push to repo, archive to `Past MS/`, upload snapshot to PK | **Unchanged.** Snapshot still produced for Graeme's review. |
| Deleting old PK entries | Claude cannot; Graeme must | **Unchanged, and no longer urgent** — a stale PK copy can no longer mislead a session, because nothing reads it. |

---

## 🔑 Master Schedule → Repo Workflow — decided 30 Jul 2026

Graeme provided the fine-grained GitHub token directly in the PM chat so schedule updates can be pushed straight to the repo, rather than downloaded and uploaded manually via the GitHub web UI each time. From this version forward: the PM chat, at session close, writes the new version, pushes it to `Documents/Admin/master_schedule.md`, moves the previous version into `Documents/Admin/Past MS/`, and removes the superseded copy from project knowledge search results by uploading the new snapshot over it (the old project-knowledge entries themselves still need manual deletion by Graeme — Claude can't do that directly).

**Security note, worth having on record:** this token now lives in the PM chat's own conversation history, not just a build chat's. That's a wider exposure surface than the original "paste into the build chat that needs it" plan — mitigated by the same short expiry (7 days) already in place. Worth revisiting once the product's past the rapid-build phase, same as the original project-knowledge token storage trade-off already logged.

---

*Build New Habits · Alongside: Move · Master Schedule · 16 Aug 2026 v197*
