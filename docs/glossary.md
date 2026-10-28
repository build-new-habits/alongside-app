# Alongside: Move — Glossary
## 28 Oct 2026 v4

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

## Decided

1. **Saved sessions** (Graeme, 13 Oct): one name for the screen and the policies; *Keep to repeat* on the finish.

2. **Keep to repeat** and **Not again** on the Plan's new finish (Graeme, 28 Oct: agreed): the button and the list that undoes it say the same thing. The Stage PATH spec's *Save this session* and *Never show me this* are not used.
