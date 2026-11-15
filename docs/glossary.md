# Alongside: Move — Glossary
## 15 Nov 2026 v9

v9 - P-25 (Graeme, 11 and 12 Nov: spec v3 §10.6). Help, How do I…?, Guide me through it, Did that work?, Not quite, Still stuck?.

v8 - P-34 (Graeme, 15 Nov). Decision 6: Home is what to do; how it is going is on Progress.

v7 - P-33 (Graeme, 15 Nov). Share your plan, Change what's in it, What works towards it.

v6 - P-32 (Graeme, 15 Nov). Stretch for stiffness: How does it feel today? and its four choices, Anywhere in particular?, It hurts, Put this on Home.

v5 - P-31 (Graeme, 14 Nov: "new words go in the glossary"). Little and often, On Home and its four choices, Change today and its five choices.

A-9 ONE-NAME (Stage AWARD). One name for each thing, across the app, the website and the policies. A screen, a page or a policy that names one of these uses the name in the **Use** column. Names in **Not** are retired or wrong for it; `tools/verify-one-name.mjs` fails if a retired one reaches a string in `js/`.

Taken from the words on every screen (`node tools/chromium-words.mjs`, 95 screens, both tiers, 12 Oct).

| Thing | Use | Not | Notes |
|---|---|---|---|
| The paid tier | **the Plan** | Premium, Pro, subscription (in the app) | Capital P. "Free" for the other tier |
| The list of moves the coach builds for today | **today's plan** | your plan, the session plan | "Your plan" reads as the tier on the Plan. Home's *Tell me what to do* line changes with A-1 |
| What someone does in one go | **session** | workout (on screen) | Breathing and quiet practices are **practices**; a guided group session is a **class** |
| Logging moves while you do them (capture) | **Make it up as I go** | I'll just log what I do, Freestyle | The Plan's. Freestyle remains the swimming stroke |
| Recording something already done | **Log what I did** | — | Library, both tiers. A different thing from Make it up as I go |
| The person's own exercise list (from a physio, a PT or anywhere) | **My exercises** | Prescribed, your own list | "Your own list" is its description on the Library tile, not a second name |
| Sessions the person saved to repeat | **Saved sessions** | Your own sessions, Keep this one (as the name) | Graeme, 13 Oct. The finish's button is **Keep to repeat**; the empty list says *Nothing kept yet*. "Your own sessions" stays only as Progress's name for the *kind* of session someone built themselves |
| The Plan's week | **Your week** | weekly plan, Plan my week | "Plan your week" is the action that opens it |
| Free's week | **Your week** | — | The older weekly plan, Free only since A-3 |
| Where the Plan is heading | **your arc** | programme, goal (for the arc) | *My programme* is the twelve-week programme, a separate thing |
| What hurts | **sore area** | condition, injury (as a label) | The scope statement and policies may say "medical condition" and "minor injuries" because that is their point |
| The three morning questions | **check-in** | check in (noun), checkin | "Check in" is the verb |
| The browsable list of everything | **Library** | — | *At home* / *At the gym* are its two places |
| Wellbeing tab | **Wellbeing** | Mind, mental health | *Something for the mind* is a door into it on Free. Stage PATH takes it off Plan Home |
| The Plan's four ways in by purpose (Stage PATH) | **Get stronger**, **Keep moving**, **Stretch**, **Move to feel better** | Tell me what to do, I know what I want, Make it up as I go (as Plan Home doors), rooms | Graeme, 27 Oct. Collectively *doors* in the code and these papers; on screen, *Or choose for yourself*. Store words: `stronger`, `moving`, `stretch`, `feel` |
| How someone feels, in Move to feel better | **Grounded**, **Calmer**, **Worn out**, **Wake up**, **Ready for sleep**, **Surprise me** | Energise | *Wake up*'s description says *feel energised*. Store words: `ground`, `calm`, `worn`, `wake`, `sleep` |
| The Plan's screen the first time the app opens each day | **first open of the day** | morning screen, splash | A name for papers and code; the screen itself is headed by its check-in |
| The coach's choice when somebody does not check in | **Just pick something for me** | Not sure today | A pill in the check-in, not a door |
| The suggestion at the top of Plan Home | **Today card** | — | Its list is **What I've adjusted for today** |
| A movement somebody loved | **Loved it** | Like, thumbs up, favourite | Stored as `likedMovements` |
| A movement somebody would rather have less of | **Less often** | Not a fan, skip (as a name) | One store record with Skip's: `exercisePreferences` `'less'` |
| A movement somebody never wants again | **Not again** | Never show me this | Decision 2, settled. Settings › How you like things says it and undoes it. One store record: `exercisePreferences` `'avoid'` |
| The Plan Home row of short lists from My exercises | **Little and often** | snack, routine (as its name) | P-31. "Snack" stays the word for the trend's 10-minute snack (P-20); a person's own list may be called anything |
| The choice on a list in My exercises | **On Home**: **Not on Home**, **Any time**, **Mornings**, **Evenings** | Pin, Show on Home | P-31. Store: `myExercisesOnHome` |
| The link under the Today card, and its screen | **Change today** | Edit today, Swap day | P-31. This week only; Your week stays as planned. Store: `weekChanges` |
| Change today's choices | **Do it another day**, **Catch up**, **Little and often instead**, **Rest today**, **Something else** | Swap or Move as choices | P-31. *Which day instead?* says per day "Swaps with …" or "Rest day · moves here". Home's line after a change has **Undo** |
| Stretch's question after the area | **How does it feel today?**: **Fine, just a stretch**, **A little stiff**, **Quite stiff**, **Very stiff** | Pain level, sore (as a choice) | P-32. A sore area never sets it (W5-14). Nothing stored |
| Stretch's finer spots | **Anywhere in particular?** | Target, focus area | P-32. A routine that works one says **Works your …** |
| The way out when it is pain, not stiffness | **It hurts** | Injured, treat | P-32. Goes to the check-in, never to a stretch |
| The button on every screen that opens the guides | **Help** | — | P-25. The word with a line icon, never the icon alone. Both tiers; hidden while a session runs |
| The page of guides | **How do I…?** | — | P-25. *On this screen*, search, the groups, **Still stuck?** |
| A guide's main way: help over the live app | **Guide me through it** | Tutorial, walkthrough (on screen) | P-25. A ring on the real button and a box with the step; **Back a step**, **Stop the guide**, **Make this smaller**, **Carry on from here** |
| The question at the end of a guide | **Did that work?** | Was this helpful | P-25. **Yes, back to where I was**, or **Not quite** (a few likely answers, one level deep). Nothing is recorded |
| Help's last part | **Still stuck?** | Contact support | P-25. The email address with **Copy** (the app sends nothing), and the support lines |
| The finish's offer after an easier stretch | **Put this on Home** | Pin, Save to Home | P-32. Adds the routine to My exercises, On Home any time (P-31) |
| The Plan's page of the person's plan, for a physio or trainer | **Share your plan** (beside **Share your progress**) | Export, Download my plan, My plan PDF | P-33. Made on the phone; **Save as a file**, **Copy as text**; the choices are behind **Change what's in it** |
| The section linking the person's exercises to the arc | **What works towards it** | Recommended for you, Best for your arc | P-33. The arc's own rule; the person's own exercises only; never a suggestion |

## Decided

1. **Saved sessions** (Graeme, 13 Oct): one name for the screen and the policies; *Keep to repeat* on the finish.

2. **Keep to repeat** and **Not again** on the Plan's new finish (Graeme, 28 Oct: agreed): the button and the list that undoes it say the same thing. The Stage PATH spec's *Save this session* and *Never show me this* are not used.

3. **Little and often**, **On Home** and **Change today** (Graeme, 14 Nov: "new words go in the glossary"), with catching up a missed session allowed as a choice, never a reminder.

4. **Stretch for stiffness** words (Graeme, 15 Nov: mock-up v2, "The full range"): the person chooses it inside Stretch; It hurts goes to the check-in.

5. **Share your plan** (Graeme, 15 Nov: mock-up v2, and a PDF made on the phone): what goes in it is the person's choice; the journal, check-in answers and weight are never in it.

6. **Home is what to do; Progress is how it is going** (Graeme, 15 Nov: *"exercise routes from home and progress in progress, so lately in progress"*). Home's *Lately* is retired; the same reading is **Before and after**, near the top of Progress.

7. **Help, on both tiers** (Graeme, 11 Nov; mock-up v2 approved 12 Nov: *"Perfect"*). One **Help** button in the same place on every screen that shows it; hidden while a session runs. Guides say how to use the app, never what exercise to do; their safety lines are the app's own, word for word.
