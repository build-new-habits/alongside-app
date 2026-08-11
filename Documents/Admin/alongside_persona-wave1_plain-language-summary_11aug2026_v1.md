# Alongside: Move — What We Found: Plain-Language Summary
## 11 Aug 2026 v1

Build New Habits | Persona Tracing Wave 1. No technical terms. Written to be read once and understood, and to be shown to someone else without translating it first.

---

## What we did

We took two of the people from your existing seventeen-person reference list and followed them through three weeks of using the app — not a tidy three weeks, a realistic one, with gaps, false starts and changes of mind.

**Tom** is in his early thirties, sits at a desk all day, has no injury, no history of sport, and no particular goal. He wants to start but doesn't know where. He's on the free plan. He matters more than almost anyone else on your list, because everyone else gives the coach *something* to work with. He gives it nothing. He's the honest test.

**Priya** is in her mid-twenties, trains in a gym four times a week, understands how strength training works, and wants to see her numbers go up. She started on the free plan and upgraded to Personal partway through, so we could see what that actually bought her.

We couldn't wait three weeks, so we recreated exactly what their saved information would look like at each point, and then followed the app's own instructions to see what it would do with it. That means we can be precise about what the app *does*. We can't tell you how a screen looks or feels without seeing it on a phone, and we've said clearly which is which throughout.

---

## The most important thing we found

**The app asks people the hardest question in the whole sign-up, listens carefully — and then forgets the answer immediately.**

Early on, the coach asks what's made movement hard before. It's the most personal moment in the product, and it's deliberately gentle. Tom picks *"There's a longer history than any of that."*

The very next time he opens the app, the coach greets him with:

> **"This is the first real one. No history yet — just you, now."**

He told it there was a history. It said there isn't.

This isn't the coach being vague or generic. It's the coach saying the opposite of what he just shared. For a product whose whole promise is *this one actually heard me*, that's the worst possible sentence to land in that spot.

And it isn't only Tom. **Every single person who has ever signed up gets this**, whichever of the seven answers they picked. All seven lead to the same place.

What makes it more frustrating: the right words already exist. Someone wrote a line for exactly this person — *"Do you remember telling me that you've tried to build this before and it hasn't stuck? What feels different this time, if anything?"* — and it has never once been shown to anybody. The app has the answer written down. It just never reaches for it.

The same thing happens with age. There's a gentler opening written for people whose bodies have been changing in ways that made movement harder. It has never been shown to anyone either.

**The good news:** this is contained. It's one handover point between sign-up and the first check-in. Everything else the coach knows — conditions, injuries, coming back after time away — still works properly. And the fix is small. It needs a decision from you about which words go with which answer, but it's not a rebuild.

---

## The second thing

**The app asks how active you've been, and then ignores what you say.**

During sign-up the coach asks, warmly and directly: *"How active have you been lately? And I mean actually — not what you were doing two years ago."*

Tom answers honestly: mostly sitting. Priya answers: regularly training.

Neither answer changes anything. The app files it in one place and then looks for it somewhere else, so it never finds it. Everyone is treated as middling — regardless of what they said.

In practice:

- **Tom is shown exercises that are too hard for him.** About seventy-five movements that should have been held back for later are in the mix from day one. For someone whose whole problem is not knowing where to start, being handed something too hard is exactly how he stops.
- **Priya is quietly denied the hardest ones.** The handful of most demanding movements — the ones a regular trainer would actually want — are filtered out without her knowing. She'd assume the app doesn't have them.

Two opposite failures from the same cause. And the question is being asked, which is almost worse — being asked and ignored is more corrosive than not being asked.

The fix here is genuinely small.

---

## What Priya got for her money

She upgraded to Personal partway through. Here's what actually changed:

**She gained:** the ability to choose what kind of session to do rather than always getting "full body"; the ability to choose how long, rather than always thirty minutes; a step where she says whether she's at home or the gym, so the app uses the right equipment; longer time windows on her progress screen; the ability to export her history; and access to the Wellbeing exercise called In Step.

**She did not gain the thing she came for.**

She wants to see numbers move. She wants to know that she squatted more this month than last month. We searched the entire app: **there is nowhere to record what you lifted.** Not on the free plan, not on Personal, nowhere. The app will tell her to do three sets of twelve, but there is no box to type in what she actually did.

Her progress screen counts sessions and minutes. It cannot count weight, because weight is never captured.

This was already a decision you'd made — your own notes say basic personal-best logging should be a Personal feature. It was decided and never built. So Personal, from where Priya is standing, is a collection of conveniences rather than the thing she paid for.

That's the honest answer to the question your own notes asked about her: *can the free plan hold a genuinely fit person, or does she drift away?* The answer is that **the tier isn't really the issue.** She'd drift either way, because what she wants isn't there at either price.

---

## Smaller things worth knowing

**The app under-counts how much people have done.** Most session types don't record how long they took. Tom did four sessions over three weeks; only one of them registered any minutes at all. His progress screen makes three weeks of real effort look like almost nothing. For a product built specifically to avoid making people feel like they're failing, that's an unfortunate way to be wrong.

**A locked feature in one part of the app behaves differently from a locked feature in another.** In Wellbeing, tapping something you don't have access to takes you somewhere that explains it. In the session builder, tapping does nothing at all — it's a dead end. It's also greyed out more heavily than elsewhere, and someone using a screen reader or keyboard can't reach the explanation of why it's unavailable. There's already a proper way of doing this in the app; this one screen just doesn't use it.

**A one-hour cardio session is four exercises.** The app labels it as fifty-five to sixty-five minutes. It's almost certainly nowhere near that. Other session types produce fifteen or seventeen exercises for the same hour. This needs checking on a real phone before assuming how bad it is.

**One yoga pose is invisible.** Crescent Lunge is missing a single piece of information, and as a result the app never shows it to anyone. One-line fix.

**Three pieces of saved information aren't written down anywhere official.** They work fine now, but they're not in your schema document. When you move to the proper database later, they'd be the kind of thing that quietly disappears. Worth tidying before that move, not after.

---

## What we checked and found genuinely fine

It's worth saying what held up, because a fair bit did.

- **Coming back to the app on the same day works properly.** If Tom does a session in the morning and opens the app again after lunch, it doesn't make him check in again, doesn't pretend he's done nothing, and the coach correctly says he's already moved today. We tested three versions of this. All correct.
- **The coach voice is Nurturing only.** No picker, no alternatives, nothing lurking. Exactly as intended.
- **Equipment shows home and gym separately** in Settings, which was the fix made on 10 August. It's working.
- **The gym session screen rebuilt yesterday looks structurally right.** The problems that were fixed on 10 August stayed fixed through the rebuild. It still needs testing on a real phone, but nothing in it looks wrong from here.
- **Every one of the 461 exercises has full instructions, coaching notes, a reason it helps, and a video link.** That's complete.

---

## The one-sentence version

The app's exercise engine is in better shape than expected, but the coach's memory has a hole in it: **twice during sign-up, it asks something important, gets an honest answer, and then never uses it** — and in one of those cases it goes on to say the opposite of what it was told.

Both are small fixes. Neither is a rebuild. The first one needs a decision from you about wording before anyone writes code.

---

## Which persona was more useful

**Tom, clearly** — and it wasn't close.

Because he arrives with nothing, every gap in the personalisation shows up immediately rather than being masked by other information the app can lean on. Both of the serious findings came from him first. Priya confirmed the second one from the other direction and gave a clear answer on the tier question, but she surfaced fewer genuine faults.

The lesson for future rounds: **the person who gives the app the least is the one who tests it the most.** For Wave 2, that points at your sister — post-cardiac, total beginner — where the same "does it actually use what it was told" question is the difference between a good experience and a safety problem.

---

*Build New Habits · Alongside: Move · Persona Tracing Wave 1 — Plain-Language Summary · 11 Aug 2026 v1*
