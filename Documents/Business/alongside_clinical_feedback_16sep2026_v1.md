# Clinical feedback — follow-up pack

**16 Sep 2026 v2**

Build New Habits · Alongside: Move · Clinical decision record

Response to `alongside_clinical_review_followup_16sep2026_v1.docx`. Recorded verbatim below, then broken into the decisions it makes. **Her words are the source; everything in the build traces back to this file.**

---

## Verbatim

> My only significant concern is the "build strength around it" pathway. I would not support fixed mappings from a reported sore area to a specific training focus. A self-reported sore area does not provide enough information to determine what should or should not be loaded, and the wording risks being interpreted as rehabilitation advice.
>
> I would keep this at the level of activity modification: offer a lower-intensity, general, or user-selected session that reduces demand on the area concerned. Avoid wording that says the app is strengthening around a problem or advises users not to work an area directly. Include clear advice to stop if symptoms increase and to seek assessment for persistent, worsening, or concerning symptoms.
>
> The exercise descriptions are generally sensible and the layout works. I would apply the same principles throughout: use simple movement cues, encourage a comfortable and controlled range, and avoid implying that one fixed position or technique is right for every user. Bench dips would not be my preferred choice for a general beginner programme; use an easier-to-scale triceps exercise instead.

---

## Decisions this makes

| ID | Decision | Status |
|---|---|---|
| CL-1 | **No fixed mapping from a reported sore area to a training focus.** "Build strength around it" is removed. | Clinical direction |
| CL-2 | **Activity modification only**: lower-intensity, general, or user-selected sessions that reduce demand on the area. | Clinical direction |
| CL-3 | **No wording that says the app is strengthening around a problem, or advises not working an area directly.** | Clinical direction |
| CL-4 | **Clear advice to stop if symptoms increase, and to seek assessment for persistent, worsening or concerning symptoms.** | Clinical direction |
| CL-5 | Exercise descriptions: **simple movement cues, comfortable and controlled range, no single fixed position or technique implied as right for everyone.** Applies throughout, not only to the nine. | Clinical direction |
| CL-6 | **Bench dips out of the general beginner programme**, replaced with an easier-to-scale triceps exercise. | Clinical direction |

## What this closes

- 🟢 **AROUND-REVIEW** — closed by CL-1 to CL-4. The answer is: do not build it.
- 🟢 **The nine exercise descriptions** — approved in principle, subject to CL-5.

## How each decision was implemented

| ID | What changed in the app | Guarded by |
|---|---|---|
| CL-1 | The fixed area-to-session mapping is **deleted**. Every sore area now leads to the same neutral options; the app no longer decides what to load. | `verify-purpose-ask` |
| CL-2 | The options for a niggle or an area are now **A lighter session · Something general · Just keep moving gently · I'll choose myself**. "Lighter" and "gentle" lower the session's intensity, not just its label. | `verify-purpose-ask` 5b.8 |
| CL-3 | Every recommendation now says what the person **told** the app and suggests a lighter session, without naming a part to load or spare. | `verify-purpose-ask` |
| CL-4 | A stop-and-seek line, shown **as its own message every time** the purpose is a sore or particular area — including day one, with no history. | `verify-purpose-ask` 5b.7–5b.7d |
| CL-5 | Eight exercises added to the library in simple cues and a comfortable range. Their ease-off and go-further advice rewritten into the app's house voice: *"If [a sign you notice]…"*, *"When [you're ready]…"*. | `verify-adapt1` |
| CL-6 | Bench dips **removed** from the programme; replaced with a tricep **rope pushdown**, which scales by moving a pin. | `verify-cardlocal` 1b |

### Three things found while implementing that were not in her reply

- 🔴 **The severe-pain screen said the same thing she objected to**, and was not in her pack. It said *"What I can do is work around them"*, and its Adapt button promised *"I'll keep well clear of the affected area"*. Reworded under her principle. **The code was already right**: measured at a back pain of 8, the ordinary build becomes "Something gentler today" — three movements, none loading the back. Only the words overclaimed it. It also now says **stop if it gets worse**; before, it only said to see someone.
- 🔴 **The pushdown replacement was going to teach a bench dip.** Its name was changed and its instructions were not: *"hands on bench behind you, lower until elbows at 90 degrees"*. Caught before it shipped and now guarded.
- 🟡 **The first stop-and-seek implementation missed first-day users** — it only appeared inside a recommendation, and a recommendation needs history. Moved to its own message.

## ⚠️ Wording not yet clinically reviewed — for a quick check before beta

She approved the *direction*. These are the exact sentences written to follow it. **About five minutes' reading.**

1. **The four options** after "something's niggling": *A lighter session · Something general · Just keep moving gently · I'll choose myself*
2. **The recommendation lines**, depending on how often an area has been flagged:
   - *"You've flagged your lower back 3 times in the last fortnight. A lighter session may suit today."*
   - *"That's the second time you've flagged your lower back this fortnight. A lighter session may suit today."*
   - *"You flagged it this morning. Something gentle may suit today."*
3. **The stop-and-seek line**, shown every time: *"Stop if it gets worse. If it keeps coming back, is getting worse, or anything about it worries you, it's worth getting someone to look at it."*
4. **The severe-pain screen**, not in her original pack: *"…What I can do is keep today gentle, or we can call it a rest day."* followed by the same stop-and-seek line, and the Adapt button: *"Something gentler, that asks less of the sore area."*
5. **The eight exercises' adaptations**, restyled — e.g. Dumbbell Bench Press: *"If you feel it at the front or top of your shoulder, lower the weights less far."*

## What it does not close

- 🟡 CL-5 says "throughout". The 162 descriptions already in the library were not in this pack and have not been reviewed against it. They sit under the August 95-exercise audit.
- 🟡 **The wording has not been clinically reviewed above.** It should go back to her as that list, not as another pack.
- 🟡 **The severe-pain screen** was reworded under her principle but was never put to her. Item 4 above.

---

*Build New Habits · Alongside: Move · Clinical feedback record · 16 Sep 2026 v2*
