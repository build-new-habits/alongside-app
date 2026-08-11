# Alongside: Move — Persona Tracing Wave 1: The Narrative
## 11 Aug 2026 v1

Build New Habits | Two people, three weeks each, told as they'd have lived it.

**A note on evidence, up front.** Everything factual here was traced in the live code or produced by running it. Where a reaction is inferred rather than observed, it says so plainly — *"we're inferring this"* — because the difference matters. Nothing here is invented to make a better story. Where the app did something well, that's here too.

---

# Tom — 33, sits down for a living

## Week one

He signs up on a Tuesday evening, which is when people sign up for things.

The sign-up is a conversation, not a form, and this genuinely lands differently from what he's used to. There's no progress bar counting him down, no "step 4 of 11." The coach talks first and waits.

Then it asks him something no fitness app has asked him before: what's made this hard before, if anything has.

There are seven ways to answer. He reads them properly — we can tell from the design that this is a screen built to be read slowly, and the options are written to be recognised rather than selected. *"I started things and they let me down." "It moved too fast, too soon." "Life kept getting in the way." "It just wasn't built for someone like me." "I never felt like it knew I was there."*

He picks the last one on the list. **"There's a longer history than any of that."**

That's not a shrug. Of the seven, it's the one that says *there's more here than a checkbox can hold.* We're inferring that it took him a moment; what we can confirm is that the app stored it correctly, under the name `the-history`, and that the coach's immediate response to it during sign-up is properly written and properly personal. That part works.

A few screens later the coach asks how active he's been lately, and adds — *"and I mean actually, not what you were doing two years ago."* He appreciates the directness enough to be honest. Mostly sitting.

Sign-up ends with the coach reflecting back what it's heard. This is the moment the whole product is built around, and it does what it's meant to.

He closes the app feeling, for the first time in a while, like this might be different.

---

## The next morning

He opens the app. This is the real first one.

The coach says:

> **"This is the first real one.**
> **No history yet — just you, now. How are you today?"**

*No history yet.*

We can confirm exactly this text is what he sees — we ran the live check-in module against his stored answers and it returned this word for word, for all seven possible answers he could have given. What we're inferring is what it does to him. But it isn't hard to infer. He told it there was a longer history. It's telling him there isn't one.

There is a line sitting in the same file, written for precisely this person: *"Do you remember telling me that you've tried to build this before and it hasn't stuck? I want to ask — what feels different this time, if anything?"* It has never been shown to anybody.

He probably doesn't consciously register it as a contradiction. It's more likely to land as a small deflation — the sense that the warmth of last night was a script after all. We're inferring that. What we're not inferring is that the app had the better sentence available and didn't reach for it.

He does the session anyway. Twenty minutes, bodyweight, nothing he owns any kit for.

**Here's what he doesn't know:** because of the second fault, the app is drawing his exercises from a pool of 329 movements rather than the 253 it should be using for someone who told it he sits down all day. Seventy-six things in his mix are above the ceiling that was designed for him. We measured that against the real exercise database.

Not all of them will land in his twenty minutes. But some will. And for a man whose entire problem is not knowing where to begin, "that was harder than I expected" is not a neutral outcome.

He does a second session on the Thursday. Then the weekend arrives.

---

## Week two — the gap

Four days pass. Then five.

**This is where the app is genuinely good, and it should be said plainly.** There is no streak to have broken. Nothing has gone red. There's no notification waiting to tell him he's fallen behind. We checked: the Home screen builds its greeting from the time of day and whether he's moved today, and that's all. There is no mechanism anywhere in the code for making him feel bad about five days.

That's not an absence of a feature. It's a deliberate design decision, and it's the thing most likely to bring him back.

He comes back on the Thursday, but not to exercise. He opens Wellbeing instead and sits with something quieter.

He notices — because you can't not notice — that there's a card called **In Step** with a small padlock on it and the word *Personal*. He taps it out of curiosity and it takes him to a page explaining the plan. He doesn't upgrade. But the interaction works exactly as designed: it's dimmed, it's labelled, it's tappable, it explains itself. Hold that thought.

---

## Week three

One session on the Sunday. A walk, four days ago. Then today.

At some point he taps **Progress**, because three weeks feels like the sort of thing you should be able to look at.

Here's what it shows him. Free plan, so a seven-day window, no choice of period. **One session. Twenty-two minutes.**

That's technically true of the last seven days. But over the three weeks he's actually done four sessions, and here's the part that stings: **three of the four registered zero minutes.** Not because he didn't do them — because the session type he was doing, the one the coach generates by default, doesn't record how long it took. We confirmed this by reading his log entry by entry: four sessions, one number.

So the app that was built specifically so nobody feels like they're failing has quietly told a man who did four sessions in three weeks that he did one.

**What he'd say if you asked him:** we're inferring, but probably something mild and non-committal. *"Yeah, it's alright. Nicer than the others. I keep meaning to get back into it."* He wouldn't complain about any of this. He'd just gradually stop, and he wouldn't be able to tell you why.

**What he actually used:** the coach proposal and the generated session, almost exclusively. One walk. Wellbeing once. He never touched the Library — it's a door on the Home screen with no obvious reason to open it when the coach is already deciding for you. He never opened Conditions Update, correctly, since he has none. He never opened Settings, so he never found the one place in the entire app where he could have corrected how active he is — which is the only thing that would have fixed his sessions.

**What he'd have valued if asked:** that it didn't nag him during the gap. That the sign-up felt like a conversation. Both real, both traced.

---

# Priya — 26, four gym sessions a week, wants the numbers to move

## Week one — free plan

She signs up fast. She skips the "what's made this hard before" question entirely — nothing has, particularly. She answers *regularly training*, ticks off a full gym's worth of equipment, and gets on with it.

**And immediately hits a wall that Tom never sees.**

She opens the session builder. There are five kinds of session on screen — glutes, upper, lower, core, cardio, mobility, plus full body. Six of them are greyed out with the word *Personal* beside them.

She taps "Lower body," because that's what she came for.

**Nothing happens.**

Not a paywall. Not an explanation. Not a page telling her what Personal is. The button is disabled, so the tap does not register at all. We confirmed this in the code: the tiles carry a label reading *"Lower body — Personal tier"*, but the disabled state removes them from keyboard and screen-reader reach entirely, and there's no route out of them for anyone.

Compare that to Tom's padlock in Wellbeing, which tapped straight through to an explanation. **Same product, same concept, two entirely different behaviours** — and the one she hits is the dead end. There's a proper mechanism for this built into the app already. This screen just doesn't use it. There's a small line of grey text at the bottom saying all session types are available on Personal. She may or may not read it.

So she does what the app allows: full body, thirty minutes, no choice about either.

She trains for six of the next ten days. The sessions are competent — the exercise data is complete, every movement has instructions, coaching notes, a reason it helps, and a video link, and we confirmed that's true of all 461 exercises in the database.

**But something's missing and she can't put her finger on it.**

The app tells her three sets of twelve. She does the three sets of twelve. Then she picks up her phone to log what she lifted — and there's nowhere to put it. Not on this screen, not on any screen. We searched the entire application: **there is no field, anywhere, for weight, load, or a personal best.** No numeric input exists in any session view.

She's been keeping a note in her phone's Notes app since she was nineteen. She goes back to it.

---

## Around day eleven — the wall

We built her timeline so that days ten to twelve are where the novelty runs out, because your own reference notes flag this as the open question about her. It's exactly where it lands.

She checks in feeling flat. She does the session. And she starts asking what this app is actually giving her that her Notes app isn't.

She opens Progress. Free plan: seven days, no other option. Session count and minutes. That's it. She can see she trained four times this week, which she already knew.

So she upgrades. Not out of enthusiasm — out of the reasonable assumption that the real version is behind the paywall.

---

## Days eleven to twenty-one — Personal

**What genuinely changed, traced side by side:**

She can now choose her session type. All seven. She can choose the duration. There's a new step asking whether she's at home or the gym, which correctly scopes the app to her gym equipment rather than a merged list — we confirmed that works properly. She gets thirty- and ninety-day views on Progress instead of seven. She can export her history. In Step is unlocked.

**What did not change: any of the reasons she upgraded.**

She still cannot record what she lifted. The thirty-day view shows her twelve sessions and 637 minutes — we ran the actual numbers against her log. It's accurate. It's also just *how often* and *how long*. It contains no information about whether she is getting stronger, because the app has never once asked her.

The ninety-day view shows the identical twelve sessions, because she's only been here three weeks. She taps it once and doesn't tap it again.

One more thing she notices. She tries a sixty-minute cardio session and gets **four exercises**. Her sixty-minute lower-body session gave her seventeen. Both were labelled "55–65 mins." We confirmed those counts by running the builder across all seven session types and all three presets. Whether four exercises genuinely fills an hour needs checking on a real phone — but she'd have formed a view within about eight minutes.

---

## Her verdict

Asked directly, and inferring her framing from what we traced but not the sentiment:

> *"The coaching side of it is better than anything else I've used — it doesn't shout at me, it doesn't do the streak thing, and when I had a bad week it just didn't mention it. That's genuinely rare.*
>
> *But I paid to see my numbers move and it doesn't have numbers. It tells me what to do and then doesn't ask what I did. I'm still typing my lifts into Notes like I was before. So what I'm paying for is being allowed to choose 'legs' instead of 'full body.'*
>
> *That's a real improvement. It just isn't nine quid of improvement."*

**What she used heavily:** the session builder, once she could actually use it. The gym sessions.

**What she never touched:** Wellbeing, beyond one look at In Step. Conditions Update. The Library. The coach's proposal door — she always knew what she was doing.

**What she'd have valued:** honestly, the check-in. She'd resist saying so. But the app noticing she was flat on day eleven and not pushing her is the closest thing to coaching she's had since school.

---

# What the two of them show together

They break the same fault from opposite ends.

Both were asked, in the same warm and well-written way, how active they'd been. Both answered honestly. **Neither answer changed anything**, because the app files that answer in one place and looks for it in another.

Tom, who said he mostly sits, gets seventy-six movements he shouldn't see.
Priya, who said she trains regularly, is quietly denied the nine hardest ones she specifically wants.

Same line of code. Opposite harms. Both invisible to the person experiencing them.

And both of them were listened to carefully during sign-up in a way that genuinely distinguishes this product — and then, at the handover into daily use, the app let go of what it heard. For Priya that's a missed opportunity. For Tom, who chose the most vulnerable answer on the screen, it's the app telling him to his face that he never said it.

**The thing worth holding onto:** none of this is the philosophy failing. No streaks, no shame, no guilt on return, no comparison — all of it is real, all of it is in the code, and it's the reason both of these people would speak well of the app even while drifting away from it. What's failing is the plumbing between the part that listens and the part that acts.

That's a much better problem to have. It's also a much smaller one.

---

*Build New Habits · Alongside: Move · Persona Tracing Wave 1 — Narrative · 11 Aug 2026 v1*
