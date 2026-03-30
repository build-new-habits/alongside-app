# Alongside — Coach View Lines
## Draft for review | March 2026

These are the coach voice lines that appear at the top of every major view
and onboarding step. Each line follows the same three-part structure:
1. Acknowledge where the user is right now
2. Say what the coach is doing or noticing
3. Give a sense of what comes next

All lines are written in first person ("I", "we", "your").
Local time is used where relevant (morning / afternoon / evening).
Lines marked [DYNAMIC] vary based on stored data. Lines marked [STATIC]
are the same for every user at that point.

---

## ONBOARDING

### Screen 0 — Welcome / Consent [STATIC]
*Coach introduces itself before any data is collected.*

> I'm here to support your movement — not to judge it, time it, or score it.
> Over the next few minutes I'll ask you a few things so I can start to understand
> what your body needs. Everything you share stays private and is only ever used
> to make your sessions feel right for you.
> You can change or delete anything at any time.

*Button: Start*
*Below button (small text): By tapping Start you agree to our Privacy Policy and Terms of Service.*

---

### Screen 1 — Name [STATIC]
> Let's start with the most important thing. What should I call you?

---

### Screen 2 — About you (age band, gender, hormonal tracking) [STATIC]
> A little context helps me a lot. I use this to shape the kind of sessions
> I suggest — nothing else.

---

### Screen 3 — Body and targets [STATIC]
> This is completely optional. If you have a weight or target in mind, I can
> factor it in. If not, that's fine — we can focus on how you feel instead.

---

### Screen 4 — Goals [STATIC]
> What matters most to you right now? I'll use this to lean your sessions
> in the right direction. You can always change your mind later.

---

### Screen 5 — Conditions [STATIC]
> If there's anything going on with your body that I should know about,
> tell me here. I won't avoid movement — I'll just make sure what I suggest
> is right for where you are today.

---

### Screen 6 — Lifestyle [STATIC]
> A sense of your day-to-day helps me understand what you're working with —
> not just physically, but everything around it.

---

### Screen 7 — Equipment [STATIC]
> Tell me what you have available. I'll build sessions around what's actually
> in front of you, not what's ideal.

---

### Screen 8 — Complete / Summary [STATIC]
> That's everything I need to get started. Here's what I've got so far.
> We'll build your plan together in the next step.

---

## MAIN APP VIEWS

### Today — no check-in yet [DYNAMIC: time of day]
*Morning:*
> Good morning. Before I plan your session, I'd like to know how you're
> feeling. A quick check-in takes less than a minute and makes everything
> I suggest much more useful.

*Afternoon:*
> Good afternoon. Take a moment to check in with me and I'll put together
> something that matches where you are right now.

*Evening:*
> Good evening. Even a short session can make a difference at this time of day.
> Tell me how you're feeling and I'll find the right fit.

---

### Today — after check-in [DYNAMIC: energy, mood, pain, conditions]
*These are assembled by buildCoachMessage() — already built in today.js.*
*The structure below is the template; actual content varies per user state.*

*High energy, no pain:*
> You're feeling strong today. I've put together three options that match
> your energy — take the one that feels right and I'll be with you throughout.

*Low energy, no pain:*
> Your energy is lower today, so I've kept things gentle. A shorter session
> done well is worth more than a longer one pushed through. Here's what I'd suggest.

*Pain present:*
> I can see [condition] is making things harder today. I've taken that into account
> and adjusted what I'm offering. Everything here is safe to try — but as always,
> you know your body best.

---

### Progress — no sessions yet [STATIC]
> Your progress will build up here as we work together. I'll tell you what
> I'm noticing — not just numbers, but patterns. Give me a few sessions and
> I'll have something useful to say.

### Progress — sessions logged [DYNAMIC: history, energy trend, week]
> Already handled by buildProgressCoachMessage() in progress.js.
> Template: week/phase context + energy trend observation + what comes next.

---

### Settings — Profile tab [STATIC]
> This is your profile. You can update anything here and I'll adjust
> straight away. Nothing here is permanent — your circumstances change
> and I'll change with them.

---

### Settings — Conditions tab [STATIC]
> These are the conditions I'm working around. You're in control of this list —
> add something new, pause one if things improve, or remove it if it's no longer
> relevant. I'll adapt as soon as you make a change.

---

### Settings — Equipment tab [STATIC]
> Tell me what you have available today and I'll build around it.
> If your kit changes, update this and your next session will reflect it.

---

### Workout view — session start [DYNAMIC: session name, rationale]
> Already handled by workout rationale in workoutGenerator.js.
> Each session card has a coach rationale line explaining why it was chosen.

---

### Workout view — exercise "why" card [DYNAMIC: exercise]
> Already handled by card-coach pattern in workout.js.

---

### Workout complete [DYNAMIC: session stats]
> Already handled by workout-complete.js.

---

### Prescribed session view [STATIC]
> These are the exercises your professional has prescribed. I've kept them
> separate so you always know what's been recommended outside of our sessions.
> Work through them at your own pace.

---

## NOTES FOR REVIEW

1. The welcome/consent screen (Screen 0) is the most important to get right.
   It sets the tone for everything. Worth spending time on the exact wording.

2. The Today view lines are mostly handled — buildCoachMessage() is already
   dynamic. The pre-check-in greeting just needs the time-of-day extension.

3. Settings tab lines are currently missing from the app. These need wiring
   into each tab render function as a coach card above the content.

4. Progress coach card is built (progress.js v1.1) but the empty-state line
   could be warmer — current: "Your first session will appear here."
   Suggested: see Progress — no sessions yet above.

5. All lines above use "Steady" voice. When coachStyle variants are written
   (Phase 4), each line will have Energetic / Minimal / Nurturing alternatives.
