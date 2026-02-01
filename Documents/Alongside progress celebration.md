# ALONGSIDE: Progress View & Celebration System
## Tracking What Actually Matters v1.0 | January 2026

---

# PART 1: PROGRESS PHILOSOPHY

## What We Measure (And Why)

Traditional fitness apps obsess over:
- Weight (daily fluctuations cause anxiety)
- Streaks (missed days = shame spiral)
- Calories burned (gamifies punishment)
- Comparison to others (never enough)

**Alongside measures what actually matters:**
- How you feel over time
- What your body can do now vs before
- Showing up (not performance)
- Condition improvement
- Energy and mood patterns
- Personal milestones (not arbitrary targets)

---

## Core Principles

### 1. Progress ≠ Weight
Weight is ONE metric, and often the least useful. We prioritise:
- Pain reduction
- Energy improvement
- Mood stability
- Functional capacity
- Consistency of movement
- How clothes fit
- How you feel in your body

### 2. No Shame Metrics
We will NEVER show:
- "Missed days" count
- Declining graphs without context
- Comparison to others
- "You should be here by now"
- Red/negative indicators for low activity

### 3. Celebrate Everything
- Showed up at all? Celebrated.
- Did less than planned? Still celebrated.
- First time in a week? Welcomed back.
- Small improvement? Acknowledged.

### 4. Trends Over Snapshots
- Bad day ≠ bad progress
- Show 7-day, 30-day, 90-day trends
- Smooth out the noise
- Context matters (illness, life events, cycle)

---

# PART 2: PROGRESS DASHBOARD

## Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Your Progress                              [Jan 2026 ▼]       │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   🎯 HEADLINE WINS                                      │   │
│   │                                                         │   │
│   │   "Your back pain is down 40% this month"              │   │
│   │   "You've moved 18 of the last 30 days"                │   │
│   │   "Your energy average is up from 5.2 to 6.1"          │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │  How You     │  │  Your Body   │  │  Movement    │         │
│   │  Feel        │  │              │  │  This Month  │         │
│   │              │  │              │  │              │         │
│   │  📈 ↑ 12%    │  │  📉 Pain ↓   │  │  18 days     │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  MILESTONES                                             │   │
│   │                                                         │   │
│   │  ✓ Completed Week 2 of Hip Recovery                    │   │
│   │  ◐ 3 more sessions to Phase 2                          │   │
│   │  ○ Run 20 minutes pain-free (next goal)                │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   [View detailed progress →]                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Headline Wins Algorithm

The system automatically identifies and surfaces positive trends:

```javascript
function generateHeadlineWins(progressData) {
  const wins = [];
  
  // Pain reduction
  const painTrend = calculateConditionTrend(progressData.conditions, 30);
  if (painTrend.improvement >= 20) {
    wins.push({
      type: 'pain-reduction',
      message: `Your ${painTrend.condition} pain is down ${painTrend.improvement}% this month`,
      priority: 1
    });
  }
  
  // Movement consistency
  const movementDays = countMovementDays(progressData.sessions, 30);
  if (movementDays >= 12) {
    wins.push({
      type: 'consistency',
      message: `You've moved ${movementDays} of the last 30 days`,
      priority: 2
    });
  }
  
  // Energy improvement
  const energyTrend = calculateTrend(progressData.checkins, 'energy', 30);
  if (energyTrend.change > 0.5) {
    wins.push({
      type: 'energy',
      message: `Your energy average is up from ${energyTrend.previous.toFixed(1)} to ${energyTrend.current.toFixed(1)}`,
      priority: 2
    });
  }
  
  // Mood improvement
  const moodTrend = calculateTrend(progressData.checkins, 'mood', 30);
  if (moodTrend.change > 0.5) {
    wins.push({
      type: 'mood',
      message: `Your mood has improved over the last month`,
      priority: 2
    });
  }
  
  // Programme progress
  const programmeProgress = getProgrammeProgress(progressData.currentProgramme);
  if (programmeProgress.phaseCompleted) {
    wins.push({
      type: 'milestone',
      message: `You completed ${programmeProgress.phaseName}!`,
      priority: 1
    });
  }
  
  // Return top 3 wins, prioritised
  return wins.sort((a, b) => a.priority - b.priority).slice(0, 3);
}
```

### Win Types

| Type | Trigger | Example Message |
|------|---------|-----------------|
| Pain Reduction | Condition pain down ≥20% over 30 days | "Your back pain is down 40% this month" |
| Consistency | Moved ≥12 of last 30 days | "You've moved 18 of the last 30 days" |
| Energy Up | Average energy up ≥0.5 over 30 days | "Your energy average is up from 5.2 to 6.1" |
| Mood Up | Average mood up ≥0.5 over 30 days | "Your mood has improved over the last month" |
| Milestone | Programme milestone reached | "You completed Week 2 of Hip Recovery!" |
| Personal Best | New achievement unlocked | "First time running 15 minutes!" |
| Return | Back after 7+ days | "Welcome back! You showed up today." |

### No Wins to Show?

If algorithm finds no positive trends:
- Never show "no progress" or negative framing
- Instead show: "Every session builds the foundation. Keep going."
- Or: "Your body is adapting. Progress isn't always visible yet."

---

# PART 3: DETAILED PROGRESS VIEWS

## 3.1 How You Feel (Energy & Mood)

### Graph View

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   How You've Been Feeling                    [30 days ▼]       │
│                                                                 │
│   Energy                                                        │
│   10 ┤                                                          │
│    8 ┤        ╭──╮    ╭─╮  ╭──╮                                │
│    6 ┤   ╭──╮─╯  ╰──╮╭╯ ╰──╯  ╰─╮  ╭──                        │
│    4 ┤──╯         ╰╯           ╰──╯                            │
│    2 ┤                                                          │
│      └──────────────────────────────────────────────────────    │
│        Jan 1                    Jan 15                  Jan 27  │
│                                                                 │
│   Mood                                                          │
│   10 ┤                                                          │
│    8 ┤     ╭─╮      ╭──╮    ╭───╮                              │
│    6 ┤  ╭──╯ ╰──╮╭──╯  ╰────╯   ╰──╮╭──                       │
│    4 ┤──╯       ╰╯                  ╰╯                          │
│    2 ┤                                                          │
│      └──────────────────────────────────────────────────────    │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   📊 Your averages:                                             │
│                                                                 │
│   Energy: 6.1 (↑ 0.9 from last month)                          │
│   Mood: 6.4 (↑ 0.5 from last month)                            │
│                                                                 │
│   💡 Pattern noticed: Your energy tends to dip mid-week.       │
│      Wednesday sessions might benefit from gentler options.     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Metrics

| Metric | Calculation | Display |
|--------|-------------|---------|
| Current Average | Mean of last 7 days | "Energy: 6.1" |
| Trend | Compare 30-day to previous 30-day | "↑ 0.9 from last month" |
| Best Day | Highest average by day of week | "Saturdays tend to be your best" |
| Pattern | Detected recurring trends | "Energy dips mid-week" |

### Graph Behaviour

- **Smoothed line** (not jagged day-to-day)
- **7-day rolling average** option for cleaner view
- **No alarming colours** for low values (just the gradient)
- **Tap any point** to see that day's details
- **Missing days** shown as gaps (not zeros)

---

## 3.2 Your Body (Conditions)

### Pain Tracking View

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Your Body                                   [All time ▼]      │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   Lower Back (Herniated Disc)                           │   │
│   │   ─────────────────────────────────────                 │   │
│   │                                                         │   │
│   │   Pain level over time:                                 │   │
│   │                                                         │   │
│   │   10 ┤                                                  │   │
│   │    8 ┤                                                  │   │
│   │    6 ┤──╮                                               │   │
│   │    4 ┤  ╰──────╮                                        │   │
│   │    2 ┤         ╰────────────────────                    │   │
│   │    0 ┤                                                  │   │
│   │      └──────────────────────────────────────            │   │
│   │        Week 1      Week 2      Week 3      Week 4       │   │
│   │                                                         │   │
│   │   Started: 6/10  →  Now: 3/10  (↓ 50% improvement)     │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   Right Hamstring (Strain)                              │   │
│   │   ─────────────────────────────────────                 │   │
│   │                                                         │   │
│   │   Started: 7/10  →  Now: 4/10  (↓ 43% improvement)     │   │
│   │                                                         │   │
│   │   [View full history →]                                 │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Condition Progress Calculation

```javascript
function calculateConditionProgress(conditionHistory) {
  // Get first recorded pain and most recent (7-day average)
  const firstPain = conditionHistory[0].pain;
  const recentPain = average(conditionHistory.slice(-7).map(c => c.pain));
  
  const improvement = ((firstPain - recentPain) / firstPain) * 100;
  
  return {
    started: firstPain,
    current: recentPain.toFixed(1),
    improvementPercent: Math.round(improvement),
    trend: improvement > 0 ? 'improving' : improvement < 0 ? 'worsening' : 'stable'
  };
}
```

### What We Track Per Condition

| Metric | Source | Display |
|--------|--------|---------|
| Starting pain | First check-in after adding condition | "Started: 6/10" |
| Current pain | 7-day rolling average | "Now: 3/10" |
| Improvement % | (start - current) / start × 100 | "↓ 50% improvement" |
| Flare-ups | Days where pain spiked ≥3 points | "2 flare-ups this month" |
| Best day | Lowest pain recorded | "Best: 1/10 on Jan 15" |

### Flare-Up Context

When showing flare-ups, always offer context options:
- "What happened?" → User can note (illness, activity, stress)
- This data helps identify triggers over time

---

## 3.3 Movement Consistency

### Calendar View (NOT Streak-Based)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Your Movement                               January 2026      │
│                                                                 │
│        Mon   Tue   Wed   Thu   Fri   Sat   Sun                 │
│                                                                 │
│   W1    ●     ●     ○     ●     ○     ●     ○                  │
│   W2    ●     ○     ●     ●     ●     ○     ○                  │
│   W3    ○     ●     ●     ●     ○     ●     ●                  │
│   W4    ●     ●     ○     ●     ◐     -     -                  │
│                                                                 │
│   ● = Session completed                                         │
│   ◐ = Partial session / gentle movement                        │
│   ○ = Rest day (rest is valid!)                                │
│   - = Future                                                    │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   This month: 18 movement days                                  │
│   That's 4.5 days per week on average 🎉                       │
│                                                                 │
│   Your goal: 4 days/week                                        │
│   You're exceeding your goal!                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **No streak counter** - "18 days this month" not "3-day streak"
2. **Rest days are valid** - Shown as ○, not empty/missing
3. **Partial counts** - Gentle movement or shortened sessions still count
4. **No red/negative** - Missed planned sessions aren't highlighted
5. **Weekly average** - More useful than daily perfectionism

### Consistency Metrics

| Metric | Calculation | Display |
|--------|-------------|---------|
| Days this month | Count of any movement | "18 movement days" |
| Weekly average | Days ÷ weeks elapsed | "4.5 days per week" |
| vs Goal | Compare to user's stated availability | "Exceeding your goal!" |
| Longest gap | Days between sessions (for pattern insight) | Internal use only |

### Messaging by Consistency

| Scenario | Message |
|----------|---------|
| Exceeding goal | "You're exceeding your goal!" |
| Meeting goal | "Right on track with your goal." |
| Below goal | "Life happens. Every session counts." |
| First week | "Building the foundation. Keep going." |
| After long gap | "Welcome back. Today is what matters." |

---

## 3.4 Strength & Capability

### What You Can Do Now

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   What Your Body Can Do                                         │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   🏃 Running                                            │   │
│   │                                                         │   │
│   │   When you started: Couldn't run due to hamstring       │   │
│   │   Now: Walk-jog intervals, 15 minutes                   │   │
│   │   Goal: 45 minutes continuous, pain-free                │   │
│   │                                                         │   │
│   │   [░░░░░░░░░░░░░░░░░░░░] 33% of the way                │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   💪 Core Stability                                     │   │
│   │                                                         │   │
│   │   Dead Bug: Started at 5 reps → Now 12 reps            │   │
│   │   Plank: Started at 15 sec → Now 35 sec                │   │
│   │   Bird Dog: Started wobbly → Now solid form            │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   🧘 Flexibility                                        │   │
│   │                                                         │   │
│   │   Hip flexor stretch: Can now reach full depth         │   │
│   │   Hamstring: 45° → 60° range (improving)               │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Capability Tracking Sources

| Capability | How We Track | Display |
|------------|--------------|---------|
| Running duration | User logs or session data | "Now: 15 minutes" |
| Exercise progression | Difficulty feedback over time | "Started 5 reps → Now 12 reps" |
| Hold times | Timer data from sessions | "Started 15 sec → Now 35 sec" |
| Range of motion | User self-report or Coach check-in | "45° → 60°" |
| Form quality | Coach periodic assessment | "Now solid form" |

### Progression Detection

```javascript
function detectProgression(exerciseHistory, exerciseId) {
  const history = exerciseHistory.filter(e => e.exerciseId === exerciseId);
  
  if (history.length < 3) return null; // Need enough data
  
  const firstSession = history[0];
  const recentSessions = history.slice(-3);
  
  // Check for difficulty feedback patterns
  const easierCount = recentSessions.filter(s => s.feedback?.difficulty === 'too-easy').length;
  
  // Check for increased prescription (if tracked)
  const repIncrease = recentSessions[recentSessions.length - 1].reps - firstSession.reps;
  const holdIncrease = recentSessions[recentSessions.length - 1].holdTime - firstSession.holdTime;
  
  if (easierCount >= 2 || repIncrease > 3 || holdIncrease > 10) {
    return {
      exerciseId,
      type: 'progression',
      fromReps: firstSession.reps,
      toReps: recentSessions[recentSessions.length - 1].reps,
      message: `${exerciseName}: Started at ${firstSession.reps} reps → Now ${currentReps} reps`
    };
  }
  
  return null;
}
```

---

## 3.5 Appearance & Body Composition

### Optional Photo Progress

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   How You Look & Feel                                           │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   📸 Progress Photos (Optional)                         │   │
│   │                                                         │   │
│   │   Photos are stored only on your device.                │   │
│   │   They're never uploaded or shared.                     │   │
│   │                                                         │   │
│   │   [Add a photo]                                         │   │
│   │                                                         │   │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐                │   │
│   │   │  Jan 1  │  │ Jan 15  │  │ Jan 27  │                │   │
│   │   │  📷     │  │  📷     │  │  📷     │                │   │
│   │   └─────────┘  └─────────┘  └─────────┘                │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   📏 Measurements (Optional)                            │   │
│   │                                                         │   │
│   │   Weight: 79.5 kg (started: 80 kg)                     │   │
│   │   [Add measurement →]                                   │   │
│   │                                                         │   │
│   │   Note: Weight fluctuates daily. We show weekly        │   │
│   │   averages to give you the real picture.               │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   👕 How Clothes Fit                                    │   │
│   │                                                         │   │
│   │   "How are your clothes fitting lately?"                │   │
│   │                                                         │   │
│   │   [ Tighter ] [ Same ] [ Looser ] [ Much looser ]      │   │
│   │                                                         │   │
│   │   Last check (2 weeks ago): Same                       │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Privacy-First Photo Storage

- **Local only** - Photos never leave device
- **Encrypted** - Protected by device security
- **Optional** - Never prompted or required
- **User-controlled** - Easy to delete

### Weight Display Philosophy

- **Weekly average** shown, not daily (reduces anxiety)
- **Trend line** smoothed over 4 weeks
- **Context** always provided ("Weight fluctuates 1-2kg daily, this is normal")
- **Not prominent** - Just one metric among many

### Alternative Metrics

| Metric | How Tracked | Why It Matters |
|--------|-------------|----------------|
| How clothes fit | Periodic prompt (monthly) | More relevant than weight |
| Energy levels | Daily check-in | Weight loss should increase energy |
| Sleep quality | Daily check-in | Often improves with exercise |
| Confidence | Periodic prompt | The real goal for many |

---

# PART 4: MILESTONE SYSTEM

## Milestone Types

### Programme Milestones

Automatically triggered by programme completion:

| Milestone | Trigger | Celebration |
|-----------|---------|-------------|
| Phase Complete | Finish all sessions in a phase | Coach celebration + credits |
| Week Complete | Finish week's sessions | Brief acknowledgment |
| Programme Complete | Finish entire programme | Major celebration + reflection |

### Personal Bests

Automatically detected:

| Milestone | Trigger | Celebration |
|-----------|---------|-------------|
| First Run | Complete first running session | "You ran today!" |
| Duration PB | Longest continuous activity | "New personal best: 18 minutes!" |
| Pain-Free Day | First 0 pain day | "A pain-free day. Your body thanks you." |
| Consistency | 4 weeks meeting goal | "A month of showing up!" |

### User-Defined Milestones

Optional custom goals:

| Example | User Sets | System Tracks |
|---------|-----------|---------------|
| "Run parkrun" | Target date, description | Progress toward running 25 min |
| "Touch my toes" | Target description | Flexibility improvements |
| "Play football without pain" | Target description | Pain trends + activity logs |

---

## Celebration Moments

### Major Celebration (Programme Complete)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                           🎉                                    │
│                                                                 │
│            You completed Hip Recovery!                          │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   6 weeks ago, you started with:                               │
│   • Back pain: 6/10                                            │
│   • Hamstring pain: 7/10                                       │
│   • Couldn't run at all                                        │
│                                                                 │
│   Today:                                                        │
│   • Back pain: 3/10 (50% better!)                              │
│   • Hamstring pain: 4/10 (43% better!)                         │
│   • Walk-jog intervals building                                │
│                                                                 │
│   You showed up 22 times.                                       │
│   That's what progress looks like.                             │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   What's next?                                                  │
│                                                                 │
│   [Continue to Phase 2: Return to Running]                     │
│   [Take a rest week first]                                     │
│   [I'd like to do something different]                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Minor Celebration (Weekly)

Brief, not disruptive:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Week 2 complete ✓                                            │
│                                                                 │
│   4 sessions done. Your consistency is building the habit.     │
│                                                                 │
│   [Continue →]                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Personal Best Celebration

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ⭐ New personal best!                                         │
│                                                                 │
│   You held your plank for 40 seconds.                          │
│   That's 10 seconds longer than when you started.              │
│                                                                 │
│   [Nice! →]                                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Celebration Design Principles

1. **Proportional** - Big achievements get big celebrations, small ones get acknowledgment
2. **Not disruptive** - User can dismiss quickly if they want
3. **Data-backed** - Show real progress, not just "well done"
4. **Forward-looking** - Always offer "what's next"
5. **Optional sharing** - "Save this" but never "share to social"
6. **Skippable** - User can disable celebrations if they prefer

---

# PART 5: COACH REFLECTION MOMENTS

## Weekly Check-In (Optional)

Once per week, Coach offers reflection:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Weekly Reflection                                             │
│                                                                 │
│   "Let's take a moment to see how the week went."              │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   This week:                                                    │
│   • You moved 4 days (matching your goal)                      │
│   • Average energy: 6.2                                        │
│   • Back pain: stable at 3-4                                   │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   How do you feel about this week?                             │
│                                                                 │
│   [ 😞 Frustrated ] [ 😐 Okay ] [ 😊 Good ] [ 🎉 Great ]       │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   Anything you'd like to adjust for next week?                 │
│                                                                 │
│   [ More sessions ] [ Fewer sessions ] [ Different focus ]     │
│   [ Keep as is ]                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Monthly Reflection

More detailed, optional:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   January Review                                                │
│                                                                 │
│   "A month of progress. Let's see how far you've come."        │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   THE NUMBERS                                                   │
│                                                                 │
│   Movement days: 18                                             │
│   Total session time: 6 hours 45 minutes                       │
│   Credits earned: 847                                           │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   THE WINS                                                      │
│                                                                 │
│   ✓ Back pain down 40%                                         │
│   ✓ Completed 2 weeks of Hip Recovery                          │
│   ✓ First pain-free walk in months                             │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   HOW YOU FELT                                                  │
│                                                                 │
│   Average energy: 6.1 (up from 5.3 in December)                │
│   Average mood: 6.4 (stable)                                   │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   LOOKING AHEAD                                                 │
│                                                                 │
│   February focus: Continue hip recovery, introduce light       │
│   running as hamstring allows.                                  │
│                                                                 │
│   [Sounds good] [I'd like to adjust]                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# PART 6: DATA STRUCTURES

## Progress Data Schema

```json
{
  "progressSnapshot": {
    "generatedAt": "2026-01-27T08:00:00Z",
    "period": "30-days",
    
    "headlineWins": [
      {
        "type": "pain-reduction",
        "message": "Your back pain is down 40% this month",
        "data": { "condition": "lower-back", "from": 6, "to": 3.6 }
      }
    ],
    
    "feelingTrends": {
      "energy": {
        "current": 6.1,
        "previous": 5.2,
        "change": 0.9,
        "trend": "improving"
      },
      "mood": {
        "current": 6.4,
        "previous": 5.9,
        "change": 0.5,
        "trend": "improving"
      }
    },
    
    "conditionProgress": [
      {
        "conditionId": "condition-001",
        "name": "Lower Back",
        "startPain": 6,
        "currentPain": 3.6,
        "improvementPercent": 40,
        "flareUps": 2
      }
    ],
    
    "movement": {
      "daysThisPeriod": 18,
      "weeklyAverage": 4.5,
      "goalDays": 4,
      "vsGoal": "exceeding"
    },
    
    "capabilities": [
      {
        "type": "exercise",
        "exerciseId": "dead-bug",
        "metric": "reps",
        "from": 5,
        "to": 12
      },
      {
        "type": "exercise",
        "exerciseId": "plank",
        "metric": "holdTime",
        "from": 15,
        "to": 35
      }
    ],
    
    "milestones": {
      "achieved": [
        {
          "id": "week-2-complete",
          "name": "Week 2 Complete",
          "achievedAt": "2026-01-20T18:30:00Z"
        }
      ],
      "upcoming": [
        {
          "id": "phase-1-complete",
          "name": "Phase 1 Complete",
          "progressPercent": 75,
          "sessionsRemaining": 3
        }
      ]
    }
  }
}
```

---

# PART 7: ACCESSIBILITY

## Progress View Accessibility

### Screen Reader Support

- All graphs have text alternatives
- "Your energy over the last 30 days has averaged 6.1, which is up 0.9 from last month"
- Progress percentages announced clearly
- Milestone achievements announced when reached

### Visual Accessibility

- Graphs use patterns + colours (not colour alone)
- High contrast mode shows clear line weights
- Numbers always displayed alongside visual indicators
- Minimum 16px for all data labels

### Cognitive Accessibility

- One metric per card (not overwhelming)
- Plain language (no jargon)
- Optional "explain this" for any metric
- Progressive disclosure (summary → detail)

---

# PART 8: IMPLEMENTATION NOTES

## Data Collection Points

| Data | Source | Frequency |
|------|--------|-----------|
| Energy/Mood | Daily check-in | Daily |
| Condition pain | Daily check-in | Daily (if has conditions) |
| Session completion | Session records | Per session |
| Exercise feedback | Post-exercise | Per exercise |
| Weight | User manual entry | When user chooses |
| Photos | User manual entry | When user chooses |
| Clothes fit | Monthly prompt | Monthly (optional) |

## Calculation Frequency

| Calculation | When Run |
|-------------|----------|
| Headline wins | On progress view open |
| Trend calculations | On progress view open (cached 1 hour) |
| Milestone checks | After each session |
| Weekly reflection | Sunday evening (if enabled) |
| Monthly reflection | 1st of month (if enabled) |

---

# DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | Claude (with Graeme) | Initial progress & celebration system |

---

**This document defines how Alongside tracks and celebrates progress beyond weight, focusing on how users feel, what their bodies can do, and their consistency - not perfection.**
