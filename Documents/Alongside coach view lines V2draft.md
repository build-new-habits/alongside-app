# Alongside — Coach View Lines
## Full Draft v2.0 | March 2026

---

## THE COACH PERSONA — WRITING BRIEF

The coach is warm, compassionate, welcoming, friendly, caring, kind,
light-hearted, funny, intelligent, emotionally intelligent, insightful,
supportive, comfortable, and safe. Non-judgemental, accepting of all
and everyone. Socialist in outlook — never assumes privilege, equipment,
time, or a body that works the way bodies are "supposed" to. Deeply
empathetic. Speaks entirely in first person.

The coach never announces these qualities. They are felt through the
writing, not stated. A misplaced joke breaks the spell. Warmth is shown
through specificity, not effusiveness. "I've taken that into account" is
warmer than "I care about you" because it proves it.

All lines use Steady voice (the default). Phase 4 will add Energetic,
Minimal, and Nurturing variants for each line.

---
---

## ONBOARDING SCREENS

---

### SCREEN 0 — Welcome / Consent
*The first thing the user ever sees. Coach icon visible. No data collected yet.*
*This screen is also the consent moment — tapping Start = informed consent.*
*[STATIC]*

> Welcome to Alongside. I'm here to support your movement — not to judge
> it, time it, or score it.
>
> Over the next few minutes I'll ask you a few things so I can start to
> understand what you and your body need. Everything you share stays
> private and is only ever used to make your sessions feel right for you.
>
> You can change or delete anything at any time.

**Button:** Start

**Below button (small, muted text):**
By tapping Start you agree to our Privacy Policy and Terms of Service.

**Read more link:** Your data and how we use it →

---

### SCREEN 1 — Name
*[STATIC]*

> Let's start with the most important thing. What should I call you?

---

### SCREEN 2 — About you (age band, gender, hormonal tracking)
*[STATIC]*

> A little context helps me a lot. I use this to shape the kind of sessions
> I suggest — nothing else. Your stage of life shapes how your body responds
> to movement, and I want to get that right for you.

---

### SCREEN 3 — Body and targets
*[STATIC]*

> This is completely optional. If you have a weight or a target in mind,
> I can factor it in. If not, that's absolutely fine — we can focus on
> how you feel instead. There are no wrong answers here.

---

### SCREEN 4 — Goals
*[STATIC]*

> What matters most to you right now? There's no right answer — just
> whatever feels true today. I'll lean your sessions in that direction,
> and you can always change your mind. This is your plan, not mine.

---

### SCREEN 5 — Conditions
*Conditions shown grouped by body area — not a flat list.*
*Groups: Lower body / Back / Upper body / General health / Hormonal / Other*
*[STATIC]*

> If there's anything going on with your body that I should know about,
> tell me here. I won't avoid movement — I'll make sure what I suggest
> works with where you are, not against it. Nothing here will surprise me.
> I've seen it all.

---

### SCREEN 6 — Lifestyle
*[STATIC]*

> A sense of your day-to-day helps me understand what you're working with —
> not just physically, but everything around it. Life doesn't stop for
> exercise, so I try to fit around life instead.

---

### SCREEN 7 — Equipment
*[STATIC]*

> Tell me what you have available and I'll build around it. A clear floor
> is enough. If you have more, great — I'll use it. But I'll never assume
> you have things you don't.

---

### SCREEN 8 — Complete / Summary
*[STATIC]*

> That's everything I need to get started. Here's what I've got so far.
> Have a look and let me know if anything needs changing — then we'll
> build your plan together.

---
---

## TODAY VIEW

---

### Today — pre check-in, morning
*5 variants — rotate so users never see the same line two mornings running.*
*Selection: pseudo-random based on day of week + session count.*

**Variant A**
> Good morning. Before I put your session together, I'd like to know how
> you're feeling. A quick check-in takes less than a minute and makes
> everything I suggest much more useful.

**Variant B**
> Morning. I can't plan well without knowing how you're doing — that's
> just honest. Check in with me and I'll take it from there.

**Variant C**
> Good morning. How's the body today? A minute with me now means a session
> that actually fits you later. Let's do this properly.

**Variant D**
> Morning. I've been thinking about what to suggest for you today, but
> I need a little information first. How are you feeling?

**Variant E**
> Good morning. You showed up — that already matters. Tell me how you're
> doing and I'll make sure today's session is worth your time.

---

### Today — pre check-in, afternoon
*5 variants*

**Variant A**
> Good afternoon. Take a moment to check in with me and I'll put together
> something that matches where you are right now.

**Variant B**
> Afternoon. Midday can go any number of ways — tell me how yours has
> been and I'll suggest something that fits.

**Variant C**
> Good afternoon. Before I plan anything for you, I want to know how
> you're feeling. It only takes a moment and it makes a real difference.

**Variant D**
> Afternoon. The best sessions are the ones that meet you where you are.
> Check in and I'll make sure that's what you get.

**Variant E**
> Good afternoon. Whatever today has thrown at you so far, I can work
> with it. Just tell me where you're at.

---

### Today — pre check-in, evening
*5 variants*

**Variant A**
> Good evening. Even a short session can make a difference at this time
> of day. Tell me how you're feeling and I'll find the right fit.

**Variant B**
> Evening. I know the end of the day can be complicated — energy, time,
> motivation. Tell me what you've got and I'll work with it.

**Variant C**
> Good evening. There's still time to move today if you want to. Check
> in with me and we'll see what feels right.

**Variant D**
> Evening. How's the day been? Sometimes that tells me more than anything
> else. Check in and I'll take it from there.

**Variant E**
> Good evening. No pressure — just check in and see what I suggest.
> You can always decide it's a rest day. That's a valid choice too.

---

### Today — post check-in, high energy, no pain
*5 variants — assembled by buildCoachMessage(), these are the opening lines*

**Variant A**
> You're feeling strong today. I've put together three options that match
> your energy — take the one that feels right and I'll be with you
> throughout.

**Variant B**
> That's a solid check-in. Your energy is there and your body is ready.
> Here's what I think would work well for you today.

**Variant C**
> Good numbers. When you're feeling like this, it's worth making the most
> of it — I've put together options that do exactly that.

**Variant D**
> You're in good shape today. I've matched your session options to where
> you are — have a look and pick what appeals.

**Variant E**
> Feeling strong and ready — that's a good place to be. I've built
> something that reflects that. Let's not waste it.

---

### Today — post check-in, low energy, no pain
*5 variants*

**Variant A**
> Your energy is lower today, so I've kept things gentle. A shorter
> session done well is worth more than a longer one pushed through.
> Here's what I'd suggest.

**Variant B**
> Low energy days happen to everyone — they're not a problem, they're
> information. I've adjusted what I'm offering to match where you are.

**Variant C**
> I can see today feels harder. That's fine. I've put together something
> that works with your energy rather than against it. Nothing here will
> exhaust you.

**Variant D**
> Not your highest energy day — I've got you. Sometimes gentle movement
> is exactly the right medicine. Here are your options.

**Variant E**
> Your body is telling you something today. I've listened to it and put
> together sessions that respect that. Have a look.

---

### Today — post check-in, pain present
*3 variants — pain context is too specific for many variations*

**Variant A**
> I can see things are harder today with [condition]. I've taken that
> into account and adjusted what I'm offering. Everything here is safe
> to try — but as always, you know your body best.

**Variant B**
> With [condition] making things more difficult today, I've been careful
> about what I'm suggesting. Your options are smaller, but they're
> right for where you are.

**Variant C**
> Your [condition] is showing up today — I noticed. I've pulled back on
> anything that might aggravate it and kept what should feel manageable.
> Listen to your body as you go.

---
---

## PROGRESS VIEW

---

### Progress — no sessions yet
*[STATIC]*

> Your progress will build up here as we work together. I'll tell you
> what I'm noticing — not numbers for their own sake, but patterns that
> actually mean something. Complete a few sessions and I'll have
> something useful to say.

---

### Progress — 1-2 sessions logged
*[STATIC — handled by buildProgressCoachMessage()]*
Already written. Template:
> "You have completed [N] session[s] so far. Every session is data I can
> use — keep going and I'll start to see what works for you."

---

### Progress — 3+ sessions, energy data available
*[DYNAMIC — handled by buildProgressCoachMessage()]*
Already written. Reads energy trend and programme phase.

---

### Progress — week target hit
*Injected when sessionsThisWeek >= weeklyTarget*
*3 variants*

**Variant A**
> You've hit your session target for the week. I want you to notice that
> — not because targets are the point, but because consistency is.

**Variant B**
> Week target done. That's not nothing. Showing up when you said you
> would is exactly what builds something lasting.

**Variant C**
> You've done what you set out to do this week. That's worth a moment
> of acknowledgement before we move on.

---
---

## SETTINGS VIEW

---

### Settings — Profile tab
*[STATIC]*

> This is your profile. You can update anything here and I'll adjust
> straight away. Your circumstances change — your profile should too.
> Nothing here is permanent and nothing here is wrong.

---

### Settings — Conditions tab
*[STATIC]*

> These are the conditions I'm working around. You're in control of
> this list — add something new, pause one if things improve, or
> remove it if it's no longer relevant. I'll adapt as soon as anything
> changes. You don't need to explain yourself.

---

### Settings — Equipment tab
*[STATIC]*

> Tell me what's available and I'll build around it. If your kit
> changes — new purchase, moved house, different space — update this
> and your next session will reflect it immediately.

---
---

## WORKOUT VIEW

---

### Workout — session start (pre-exercise)
*3 variants — shown above the exercise list*

**Variant A**
> I've built this session around what you told me today. Work through
> it at your own pace — there's no timer on this, just movement.

**Variant B**
> This is your session. I've chosen each exercise for a reason — you'll
> see the thinking as you go. Take breaks whenever you need them.

**Variant C**
> Here's what I've put together for you. It's designed to feel manageable,
> not overwhelming. Start when you're ready.

---

### Workout — exercise "why" card
*Already handled by card-coach pattern in workout.js*
*3 variants per exercise category — to be written in Phase 4 content pass*

---

### Workout — exit nudge (mild/moderate zone)
*Already handled by exit route logic in workout.js*

---
---

## WORKOUT COMPLETE VIEW

---

### Workout complete — standard finish
*5 variants*

**Variant A**
> Session done. That was real work and it counts. Take a moment before
> you move on — you've earned it.

**Variant B**
> You finished. However that felt, you showed up and moved. That's the
> whole thing, really.

**Variant C**
> Done. I'll remember what worked today and use it next time. You should
> feel good about this one.

**Variant D**
> That's a session in the books. I noticed how you did — I'm already
> thinking about what to suggest next time.

**Variant E**
> Finished. I know some sessions feel better than others. This one
> happened, and that matters more than how it felt.

---

### Workout complete — first ever session
*[STATIC — shown only once]*

> Your first session. I mean that sincerely — well done. Most people
> never start. You just did. I'll remember this one.

---

### Workout complete — after a long break
*[STATIC — shown when returning after 7+ days gap]*

> Welcome back. I'm glad you came back. The gap doesn't matter —
> what matters is that you're here now. We start from today.

---
---

## PRESCRIBED SESSION VIEW

---

### Prescribed session — intro
*3 variants*

**Variant A**
> These are the exercises your professional has prescribed. I've kept
> them separate so you always know what's been recommended outside of
> our sessions together. Work through them at your own pace.

**Variant B**
> Your prescribed exercises are here. I'll support you through them,
> but these come from your professional — so if anything doesn't feel
> right, check with them first.

**Variant C**
> Here are your prescribed exercises. These sit alongside what I
> suggest, not instead of it. Your professional and I are on the
> same team.

---
---

## PHASE 3B / FUTURE — PREMIUM FEATURES

### Weather-aware greeting (Premium)
*Requires Geolocation API + weather API call.*
*These are aspirational scripts — not yet wired.*

**Sunny / warm:**
> Good [morning/afternoon]. The sun's out and it's a decent temperature.
> I'm wondering if we could do something outdoors today — but tell me
> how you're feeling first and we'll see.

**Overcast / cool:**
> Good [morning/afternoon]. Not the most inspiring weather out there,
> but that's what indoor sessions are for. Let's see how you're doing.

**Raining:**
> Good [morning/afternoon]. It's wet out there — inside it is. Tell
> me how you're feeling and I'll put something together.

**Hot / humid:**
> Good [morning/afternoon]. It's warm today — worth keeping that in
> mind for your session. Hydration especially. Check in and I'll
> factor the temperature in.

---
---

## IMPLEMENTATION NOTES

**Variation selection logic (for high-frequency screens):**
Suggested approach: `(dayOfYear + totalSessions) % variantCount`
This gives a consistent variant per day that shifts as sessions accumulate,
so the same line never repeats on consecutive days.

**Dynamic vs static:**
- STATIC lines: same for every user at that screen
- DYNAMIC lines: assembled from store data (energy, conditions, week, phase)
- VARIANT lines: one of N options selected by rotation logic

**coachStyle variants:**
All lines above are Steady voice. Phase 4 will add:
- Energetic: brighter, more affirming, more words
- Minimal: shorter, direct, no fluff
- Nurturing: softer, more emotionally attuned, more validation

**Weather integration:**
Flagged for Phase 3B. Requires: user permission for geolocation,
OpenWeatherMap API key (free tier sufficient), Netlify function to
proxy the API call (keeps key server-side), premium flag check.

**Lines NOT yet wired into code:**
- Settings tab coach lines (Profile / Conditions / Equipment)
- Today pre-check-in variants (currently single static line)
- Workout start variants
- Workout complete variants (currently single line)
- Prescribed session variants
- Progress week-target variants

Next code session: wire all static settings lines and welcome/consent
screen first, then extend Today view with variant rotation logic.
