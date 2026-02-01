# ALONGSIDE: Complete System Architecture
## Master Blueprint v1.0 | January 2026

---

# PART 1: VISION & PRINCIPLES

## What Alongside Is

A compassionate, adaptive fitness coaching platform designed for people that traditional fitness culture has failed - particularly neurodivergent adults and women of all ages.

## What Alongside Is NOT

- A mental health app (we support wellbeing, not therapy)
- A calorie counting app (Phase 2)
- A social fitness app (no leaderboards, no comparison)
- A "no excuses" motivator (we validate struggle)

## Core Ethical Commitments

### We Will NEVER:
- ❌ Use streak pressure to manipulate users
- ❌ Implement social comparison features
- ❌ Use slot-machine variable reward tactics
- ❌ Send guilt-inducing notifications
- ❌ Sell user data
- ❌ Shame users for bad days
- ❌ Say "you missed your workout"
- ❌ Use words: lazy, excuse, should have, at least, just, perfect, behind

### We Will ALWAYS:
- ✅ Validate low energy/mood as legitimate states
- ✅ Provide transparent rationale for every recommendation
- ✅ Respect user autonomy (they decide, always)
- ✅ Protect privacy (local-first architecture)
- ✅ Design for accessibility (WCAG 2.2 AA minimum)
- ✅ Centre neurodivergent and women's needs
- ✅ Use evidence-based psychology
- ✅ Prioritise wellbeing over engagement

## Evidence Base

| Framework | Author/Source | Application |
|-----------|---------------|-------------|
| Self-Determination Theory | Deci & Ryan | Autonomy, competence, relatedness |
| SOLO Taxonomy | Biggs & Collis | Scaffolded progression |
| Mood Meter Science | Marc Brackett, Yale RULER | Energy × mood check-in |
| Burnout Research | Dr Claire Plumbly | Nervous system pattern detection |
| ACT Principles | Hayes et al | Psychological flexibility |

**Key Reference:** *Burnout: How to Manage Your Nervous System Before It Manages You*, Dr Claire Plumbly, Yellow Kite 2024, ISBN 978-1-399-73342-7

---

# PART 2: TARGET USERS

## Primary: Neurodivergent Adults
- ADHD (diagnosed or suspected)
- Autism
- Executive function challenges
- History of failed fitness attempts
- Anxiety, depression comorbidities

## Secondary: Women Managing Hormonal Changes
- Menstrual cycle tracking
- Perimenopause/menopause support
- Pregnancy & postpartum (future)
- Energy fluctuation validation

## Tertiary: Anyone Traditional Fitness Has Failed
- Busy parents
- Chronic illness/injury
- Mental health challenges
- Shift workers
- Anyone who's felt "gym shame"

## Pilot User Profile: Graeme

| Attribute | Detail |
|-----------|--------|
| Age | 45 (46 in February) |
| Conditions | Herniated disc (lower back, right side), hamstring injury (recovering, 2 months) |
| History | Sciatica (couldn't walk), chiropractic treatment resolved acute phase |
| Activities | Football, running, tennis |
| Equipment | Massage gun, foam roller, wobble board, step platform, dumbbells, mat |
| Goals | Run 45 min pain-free, stay injury-free for sports, lose weight (12st 8lb → 11st), look toned |
| Constraints | ADHD (drops apps needing self-motivation), parental commitments, teacher schedule |
| Needs | External structure, schedule awareness, compassionate accountability |

---

# PART 3: SYSTEM ARCHITECTURE

## High-Level Component Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ALONGSIDE PLATFORM                                │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         PRESENTATION LAYER                            │ │
│  │                                                                       │ │
│  │   Voice Output ←→ Visual UI ←→ Text (Always) ←→ Haptic Feedback     │ │
│  │                                                                       │ │
│  │   Rule: Nothing is voice-only or visual-only. Every output has       │ │
│  │         at least two modalities (WCAG 2.2 AA)                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                    ↑↓                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                           COACH LAYER                                 │ │
│  │                                                                       │ │
│  │   Personality Engine → Script Engine → Voice Selection               │ │
│  │   (Steady/Energetic/   (Moment +       (Coach voice vs              │ │
│  │    Minimal/Nurturing)   Context)        Exercise voice)              │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                    ↑↓                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                           BRAIN LAYER                                 │ │
│  │                                                                       │ │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │ │
│  │   │    GOAL     │  │    PLAN     │  │    DAILY    │                 │ │
│  │   │   ENGINE    │→ │  ASSEMBLER  │→ │   ADAPTER   │                 │ │
│  │   └─────────────┘  └─────────────┘  └─────────────┘                 │ │
│  │          ↓               ↓               ↓                           │ │
│  │   ┌─────────────────────────────────────────────────────────────┐   │ │
│  │   │              SAFETY & ADAPTATION ENGINE                      │   │ │
│  │   │                                                              │   │ │
│  │   │  • Burnout Detection    • Condition Filtering               │   │ │
│  │   │  • Pain Response        • Menstrual Adaptation              │   │ │
│  │   │  • Recovery Mode        • Energy Matching                   │   │ │
│  │   └─────────────────────────────────────────────────────────────┘   │ │
│  │          ↓                                                           │ │
│  │   ┌─────────────────────────────────────────────────────────────┐   │ │
│  │   │                   SCHEDULE ENGINE                            │   │ │
│  │   │                                                              │   │ │
│  │   │  Life commitments + Training windows + Opportunity finding  │   │ │
│  │   └─────────────────────────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                    ↑↓                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                           DATA LAYER                                  │ │
│  │                                                                       │ │
│  │  User Profile │ Content Library │ History │ Feedback │ Credits      │ │
│  │                                                                       │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │ │
│  │  │   NUTRITION     │  │   FINANCIAL     │  │    FUTURE       │      │ │
│  │  │   (Phase 2)     │  │   (Phase 3)     │  │    SLOTS        │      │ │
│  │  │   Empty slot    │  │   Empty slot    │  │                 │      │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘      │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# PART 4: SAFETY & ADAPTATION ENGINE

This is the heart of what makes Alongside different. Every recommendation passes through these safety checks.

## 4.1 Burnout Detection

### Detection Patterns

Based on Dr Claire Plumbly's research on nervous system dysregulation.

```javascript
function detectBurnout(checkinHistory) {
  if (checkinHistory.length < 3) return { detected: false };
  
  const last7Days = checkinHistory.slice(-7);
  const last3Days = checkinHistory.slice(-3);
  
  // Pattern 1: SEVERE - Energy ≤3 for 3+ consecutive days
  const lowEnergyStreak = last3Days.every(day => day.energy <= 3);
  
  // Pattern 2: SEVERE - Mood ≤4 for 3+ consecutive days
  const lowMoodStreak = last3Days.every(day => day.mood <= 4);
  
  // Pattern 3: CHRONIC - Rolling 7-day average energy <4
  const avgEnergy = last7Days.reduce((sum, day) => sum + day.energy, 0) / last7Days.length;
  const chronicLowEnergy = avgEnergy < 4;
  
  // Pattern 4: SEVERE - Sleep quality ≤2 for 3+ days
  const poorSleepStreak = last3Days.every(day => day.sleep?.quality <= 2);
  
  // Pattern 5: SEVERE - Any condition pain ≥8 for 2+ consecutive days
  const last2Days = last3Days.slice(-2);
  const painFlare = last2Days.every(day => 
    day.conditions?.some(c => c.pain >= 8)
  );
  
  // Trigger burnout if ANY severe pattern
  const severePatterns = {
    lowEnergyStreak,
    lowMoodStreak,
    poorSleepStreak,
    painFlare
  };
  
  const chronicPatterns = {
    chronicLowEnergy
  };
  
  const severeCount = Object.values(severePatterns).filter(Boolean).length;
  const chronicCount = Object.values(chronicPatterns).filter(Boolean).length;
  
  const detected = severeCount >= 1 || (chronicCount >= 1 && severeCount >= 1);
  
  return {
    detected,
    severePatterns,
    chronicPatterns,
    recommendation: detected ? 'recovery_mode' : 'normal'
  };
}
```

### Recovery Mode Response

When burnout is detected:

| Element | Behaviour |
|---------|-----------|
| Visual | Soft banner: "Your body needs rest. Let's focus on recovery." |
| Exercises | Filtered to recovery-only (gentle stretching, breathing, walking) |
| Intensity | All exercises at minimum level |
| Credits | Still earned for any movement |
| Message | "You've been running on low energy lately. That's okay - we're focusing on gentle activities and rest. Take care of yourself." |
| Exit | "I'm feeling better" button (user-controlled) |
| Resources | Non-pushy link to support resources |

### Coach Script: Burnout Detected

**Steady personality:**
> "I've noticed you've been running low for a few days. That's not a failure - it's information. Your nervous system is asking for rest. Let's give it what it needs. Today, we're doing gentle movement only. When you're ready for more, I'll be here."

**Never say:**
- "You need to push through"
- "Just one workout"
- "You'll feel better if you exercise"

## 4.2 Condition & Pain Management

### Pain vs Difficulty Separation

A key innovation: pain and functional difficulty are different things.

| Pain | Difficulty | Scenario | System Response |
|------|------------|----------|-----------------|
| 8+ | Any | Severe pain (acute flare) | BLOCK exercises for that area |
| 6-7 | Any | Moderate pain | Caution warning, offer modifications |
| 2-5 | Any | Manageable pain | Available with "be mindful" note |
| 0 | 7+ | Weak but not painful | Suggest stability/strengthening work |
| 0 | 0 | No issues | All exercises available |

### Condition-Specific Filtering

```javascript
function filterByConditions(exercises, conditions) {
  return exercises.map(exercise => {
    let status = 'available';
    let warnings = [];
    let modifications = [];
    
    for (const condition of conditions) {
      // Check if exercise affects this body area
      if (exercise.affectsAreas?.includes(condition.bodyArea)) {
        
        if (condition.pain >= 8) {
          status = 'blocked';
          warnings.push(`Rest your ${condition.name} today (pain: ${condition.pain}/10)`);
        } else if (condition.pain >= 5) {
          status = 'caution';
          warnings.push(`Be careful with your ${condition.name} (pain: ${condition.pain}/10)`);
          
          // Add condition-specific modification if available
          if (exercise.conditionModifications?.[condition.type]) {
            modifications.push(exercise.conditionModifications[condition.type]);
          }
        }
      }
    }
    
    return { ...exercise, status, warnings, modifications };
  }).filter(ex => ex.status !== 'blocked');
}
```

### Coach Script: Pain Detected

**When user reports pain 8+ during check-in:**
> "Thanks for telling me about your [area]. We're going to protect that today - no exercises that stress it. Let's focus on other areas and give it time to settle."

**When user reports pain during an exercise:**
> "Let's stop that one. Pain is information - your body's saying this isn't right today. [Offers alternative or skip] We can try again another day when things feel different."

## 4.3 Menstrual Cycle Adaptation

### Phase Detection and Response

```javascript
function adjustForMenstrualCycle(exercises, menstrualDay, cycleLength = 28) {
  if (!menstrualDay) return exercises; // Tracking is optional
  
  // Adjust phases for cycle length
  const ovulationDay = Math.round(cycleLength / 2);
  
  let phase, recommendation;
  
  if (menstrualDay >= 1 && menstrualDay <= 5) {
    phase = 'menstruation';
    recommendation = {
      intensity: 'reduce',
      avoid: ['core_compression', 'high_impact'],
      prefer: ['gentle_movement', 'stretching', 'walking'],
      message: "Menstruation phase - your body is working hard. Gentle movement today."
    };
  } else if (menstrualDay >= 6 && menstrualDay <= ovulationDay - 1) {
    phase = 'follicular';
    recommendation = {
      intensity: 'normal_to_high',
      avoid: [],
      prefer: ['strength', 'skill_building'],
      message: "Follicular phase - energy rising. Great time for strength work."
    };
  } else if (menstrualDay >= ovulationDay && menstrualDay <= ovulationDay + 2) {
    phase = 'ovulation';
    recommendation = {
      intensity: 'high',
      avoid: [],
      prefer: ['high_intensity', 'challenging'],
      message: "Ovulation phase - peak energy. Perfect for pushing yourself."
    };
  } else {
    phase = 'luteal';
    recommendation = {
      intensity: 'moderate',
      avoid: ['very_high_intensity'],
      prefer: ['steady_state', 'moderate_cardio'],
      message: "Luteal phase - energy settling. Steady, sustainable movement."
    };
  }
  
  return {
    exercises: exercises.map(ex => ({
      ...ex,
      cycleRecommendation: getCycleRecommendation(ex, recommendation)
    })),
    phase,
    recommendation
  };
}
```

### Perimenopause/Menopause Support

- Irregular cycles accommodated (no rigid 28-day assumption)
- "I don't know" option for cycle day
- Energy fluctuation validated without requiring cycle tracking
- No shame for inconsistency

### Coach Script: Menstrual Awareness

**Day 1-5 (Menstruation):**
> "Your cycle suggests today might be lower energy. Let's keep it gentle - your body is doing important work. No pressure to push."

**Day 15-17 (Ovulation):**
> "Energy should be good today based on your cycle. If you're feeling it, this is a great day for something challenging."

**Always optional:**
> The system never requires cycle tracking. If not provided, this layer simply doesn't apply.

## 4.4 Energy Matching

### Energy Level Descriptions

Each level has a compassionate descriptor:

| Level | Description | Exercise Intensity |
|-------|-------------|-------------------|
| 1 | "Exhausted - rest is the priority" | Recovery only |
| 2 | "Very tired - gentle movement only" | Very low |
| 3 | "Low energy - keep it light" | Low |
| 4 | "Below average - pace yourself" | Low-moderate |
| 5 | "Moderate - steady does it" | Moderate |
| 6 | "Decent energy - you've got this" | Moderate |
| 7 | "Good energy - solid session ahead" | Moderate-high |
| 8 | "High energy - let's work" | High |
| 9 | "Great energy - push yourself" | High |
| 10 | "Peak energy - make it count!" | Maximum |

### Matching Logic

```javascript
function matchExercisesToEnergy(exercises, energyLevel) {
  return exercises.map(exercise => {
    const delta = Math.abs(exercise.energyRequired - energyLevel);
    
    let match;
    if (delta <= 1) match = 'optimal';
    else if (delta <= 2) match = 'good';
    else if (delta <= 3) match = 'acceptable';
    else match = 'poor';
    
    // Never suggest high-intensity exercises when energy ≤3
    if (energyLevel <= 3 && exercise.energyRequired >= 7) {
      match = 'blocked';
    }
    
    return { ...exercise, energyMatch: match };
  }).filter(ex => ex.energyMatch !== 'blocked');
}
```

## 4.5 Mood Awareness

### Mood Level Descriptions

| Level | Description | System Response |
|-------|-------------|-----------------|
| 1 | "Really struggling - be gentle with yourself" | Suggest mood-boosting gentle activities |
| 2 | "Quite low - small wins matter" | Lower session expectations, celebrate any movement |
| 3 | "Feeling down - movement might help" | Offer choice: gentle or mood-lifting |
| 4 | "A bit flat - let's see what helps" | Standard with encouragement |
| 5 | "Neutral - steady as she goes" | Standard recommendations |
| 6-8 | Progressive positive states | Normal to higher challenge |
| 9-10 | "Fantastic - ride this wave!" | Full intensity available |

### Low Mood Protocol

When mood ≤ 3:
- Don't push high-intensity (counterproductive when struggling)
- Offer mood-boosting options (walking, yoga, breathing)
- Validate the state without trying to fix it
- Lower the bar for what counts as success

**Coach Script (mood = 2):**
> "Sounds like today is hard. That's okay - you don't have to feel great to move. Even 5 minutes of gentle stretching counts. What feels manageable right now?"

---

# PART 5: DAILY ADAPTATION FLOW

## The Complete Daily Flow

```
USER OPENS APP
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│                    DAILY CHECK-IN                         │
│                    (~60 seconds)                          │
│                                                           │
│  Energy (1-10)     "How's your energy today?"            │
│  Mood (1-10)       "How are you feeling?"                │
│  Sleep hours       "How many hours did you sleep?"       │
│  Sleep quality     "How was your sleep quality?"         │
│  Conditions        "Any pain or niggles today?"          │
│  Menstrual day     "What day of your cycle?" (optional)  │
│                                                           │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│               SAFETY & ADAPTATION ENGINE                  │
│                                                           │
│  1. Check burnout patterns → Recovery mode?              │
│  2. Check conditions → Block/caution exercises           │
│  3. Check menstrual phase → Adjust intensity             │
│  4. Match energy → Filter exercise intensity             │
│  5. Consider mood → Adjust expectations                  │
│                                                           │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│                 TODAY'S SESSION                           │
│                                                           │
│  Based on:                                                │
│  • Your plan (goal-driven programme)                     │
│  • Today's check-in (adapted)                            │
│  • Your schedule (time available)                        │
│                                                           │
│  Coach presents: "Today we're focusing on X because Y"   │
│                                                           │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│              USER CAN ALWAYS OVERRIDE                     │
│                                                           │
│  "I just want to stretch"    → "Let's do that."         │
│  "I don't want to today"     → "That's okay. Rest well."│
│  "Give me something harder"  → "Here's a challenge."    │
│                                                           │
│  THE PLAN SERVES THE USER, NOT VICE VERSA               │
│                                                           │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│                  SESSION EXECUTION                        │
│                                                           │
│  Warmup → Exercises → Cooldown                           │
│                                                           │
│  Each exercise:                                           │
│  • Coach voice: Setup & rationale                        │
│  • Exercise voice: Instructions & cues                   │
│  • Timer/counter                                          │
│  • [Continue] or [Feedback 💬]                           │
│                                                           │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│                 SESSION COMPLETE                          │
│                                                           │
│  Coach: Summary + specific observation                   │
│  Quick check: "How do you feel now?" (optional)         │
│  Credits awarded                                          │
│  Saved to history                                         │
│                                                           │
│  NO excessive praise. NO "see you tomorrow" pressure.    │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

# PART 6: GOAL ENGINE

## Goal Structure

```javascript
{
  id: "goal-001",
  
  // User's own words
  userDescription: "Run comfortably for 45 minutes pain-free",
  
  // System parsing
  type: "running-endurance",
  
  // Measurable target
  target: {
    metric: "continuous-run-duration",
    value: 45,
    unit: "minutes",
    qualifiers: ["pain-free", "comfortable"]
  },
  
  // Timeline (optional - no pressure)
  targetDate: "2026-06-01",
  startDate: "2026-01-20",
  flexibility: "soft", // soft = aspiration, hard = deadline
  
  // Decomposition (from Goal Engine)
  requirements: [
    { component: "cardiovascular-base", priority: "high" },
    { component: "hip-mobility", priority: "high", reason: "herniated disc protection" },
    { component: "glute-strength", priority: "high", reason: "back protection + running power" },
    { component: "hamstring-rehab", priority: "critical", reason: "current injury" },
    { component: "core-stability", priority: "high", reason: "spine protection" },
    { component: "running-progression", priority: "medium", delayUntil: "hamstring-75%-healed" }
  ],
  
  // Constraints from conditions
  constraints: [
    { condition: "herniated-disc", rule: "always-include-back-protection" },
    { condition: "hamstring-injury", rule: "no-high-impact-until-healed" }
  ],
  
  // Progress tracking
  progress: {
    startingValue: 15, // Could run 15 min at start
    currentValue: 15,
    milestones: [
      { value: 20, label: "20 minutes", reached: false },
      { value: 30, label: "30 minutes", reached: false },
      { value: 45, label: "Goal achieved!", reached: false }
    ]
  }
}
```

## Goal Decomposition Logic

```javascript
const goalMappings = {
  "running-endurance": {
    requirements: [
      { component: "cardiovascular-base", priority: "high" },
      { component: "running-progression", priority: "high" },
      { component: "hip-mobility", priority: "medium" },
      { component: "glute-strength", priority: "medium" },
      { component: "core-stability", priority: "medium" }
    ],
    conditionModifiers: {
      "herniated-disc": {
        add: [
          { component: "hip-mobility", priority: "high" },
          { component: "core-stability", priority: "high" }
        ],
        constraints: ["always-include-back-protection"]
      },
      "hamstring-injury": {
        add: [
          { component: "hamstring-rehab", priority: "critical" }
        ],
        delay: ["running-progression"],
        constraints: ["no-high-impact-until-healed"]
      }
    }
  },
  
  "weight-loss": {
    requirements: [
      { component: "calorie-deficit-awareness", priority: "high" },
      { component: "cardiovascular-activity", priority: "high" },
      { component: "strength-preservation", priority: "medium" },
      { component: "sustainable-habits", priority: "high" }
    ]
  },
  
  "injury-prevention": {
    requirements: [
      { component: "mobility-maintenance", priority: "high" },
      { component: "stability-work", priority: "high" },
      { component: "conditioning", priority: "medium" },
      { component: "recovery-protocols", priority: "medium" }
    ]
  }
  
  // ... more goal types
};
```

---

# PART 7: SCHEDULE ENGINE

## Life Commitment Structure

```javascript
{
  weeklyCommitments: [
    { day: "monday", start: "08:30", end: "16:30", label: "Work" },
    { day: "tuesday", start: "08:30", end: "16:30", label: "Work" },
    { day: "wednesday", start: "08:30", end: "16:30", label: "Work" },
    { day: "wednesday", start: "17:30", end: "18:30", label: "Ballet (daughter)" },
    { day: "thursday", start: "08:30", end: "16:30", label: "Work" },
    { day: "friday", start: "08:30", end: "16:30", label: "Work" },
    { day: "saturday", start: "10:00", end: "12:00", label: "Football", frequency: "fortnightly" }
  ],
  
  preferences: {
    preferredTime: "morning",
    earliestStart: "06:30",
    latestEnd: "21:00",
    maxSessionLength: 45,
    minSessionLength: 15
  }
}
```

## Training Window Calculation

```javascript
function calculateTrainingWindows(commitments, preferences) {
  const windows = [];
  
  for (const day of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
    const dayCommitments = commitments.filter(c => c.day === day);
    
    // Find gaps in the day
    const gaps = findGaps(dayCommitments, preferences.earliestStart, preferences.latestEnd);
    
    for (const gap of gaps) {
      if (gap.duration >= preferences.minSessionLength) {
        windows.push({
          day,
          start: gap.start,
          end: gap.end,
          duration: gap.duration,
          type: categoriseWindow(gap, preferences)
        });
      }
    }
  }
  
  return windows;
}
```

## Opportunity Detection

The Coach actively identifies training opportunities:

**Coach Script:**
> "Looking at your week, Wednesday during ballet is a perfect 35-minute window for a run. And I can see most mornings you could fit in 20-30 minutes before work. Does that feel realistic?"

---

# PART 8: COACH LAYER

## Personality Variants

| Personality | Tone | Best For | Voice Direction |
|-------------|------|----------|-----------------|
| **Steady** (default) | Calm, reassuring, patient | Anxiety, perfectionism, injury recovery | "Speak like a trusted physiotherapist who genuinely cares" |
| **Energetic** | Upbeat, motivating, celebrates effort | Low activation ADHD, needs external energy | "Enthusiastic but not pushy, genuine excitement" |
| **Minimal** | Direct, efficient, no fluff | Experienced users, sensory sensitivity | "Clear, concise, neutral - just the essentials" |
| **Nurturing** | Extra warmth, emotionally attuned | Trauma history, chronic illness, high self-criticism | "Soft, slow, very gentle - like a caring friend" |

## Two Voice Types

| Voice | Purpose | Tone | When Used |
|-------|---------|------|-----------|
| **Coach Voice** | Emotional connection, rationale, feedback | Warm, personal, personality-driven | Before/after sessions, check-ins, milestones |
| **Exercise Voice** | Instructions, cues, transitions | Clear, calm, neutral, functional | During exercises |

## Script Engine

```javascript
function getCoachScript(moment, context, personality) {
  const scripts = coachScripts[moment][personality];
  
  // Select appropriate variant based on context
  let script = scripts.default;
  
  if (context.burnoutDetected) {
    script = scripts.burnout || scripts.lowEnergy;
  } else if (context.energy <= 3) {
    script = scripts.lowEnergy;
  } else if (context.pain?.some(p => p.level >= 5)) {
    script = scripts.pain;
  } else if (context.skippedYesterday) {
    script = scripts.returnAfterSkip;
  }
  
  // Personalise with variables
  return interpolate(script, context);
}
```

## Key Script Moments

1. First welcome
2. Post-onboarding (plan reveal)
3. Daily check-in response
4. Session start
5. Exercise transitions
6. "I just want to..." override
7. Session complete
8. Return after absence
9. Pain during exercise
10. Milestone reached
11. Frustration/self-criticism
12. Wants to quit

See Coach Personality Document for full scripts.

---

# PART 9: FEEDBACK SYSTEM

## Feedback Philosophy

- **Continue is default** (no friction for most users)
- **Feedback is optional** (one tap away)
- **Framing is curious** not judgmental
- **System learns** from patterns over time

## Feedback Prompts

### After Exercise

```
"How was that for your body today?"

[Easier next time]  [Just right]  [Challenge me more]

"Anything feel off?"  [All good]  [Something niggled] → [Where?]

"Want to add a note?" [🎤 or type]
```

### After Session

```
"How do you feel now compared to when you started?"

[😔 Worse]  [😐 Same]  [😊 Better]
```

## Feedback Processing

```javascript
function processExerciseFeedback(exerciseId, feedback, history) {
  // Record the feedback
  history.push({ exerciseId, feedback, date: new Date() });
  
  // Check for patterns
  const recentFeedback = history.filter(f => f.exerciseId === exerciseId).slice(-5);
  
  const tooHardCount = recentFeedback.filter(f => f.feedback === 'easier').length;
  const tooEasyCount = recentFeedback.filter(f => f.feedback === 'harder').length;
  
  // Trigger adaptation
  if (tooHardCount >= 3) {
    return {
      action: 'reduce_difficulty',
      message: "I've noticed this exercise has been tough. Next time, I'll suggest an easier variation."
    };
  }
  
  if (tooEasyCount >= 3) {
    return {
      action: 'increase_difficulty',
      message: "You're ready for more challenge on this one. I'll progress it next time."
    };
  }
  
  return { action: 'none' };
}
```

---

# PART 10: CREDITS SYSTEM

## Earning Credits

| Action | Credits | Notes |
|--------|---------|-------|
| Complete exercise | Exercise's base credits | Varies by difficulty |
| Complete session | Sum of exercises | Plus session bonus |
| Show up (any activity) | 10 | Just for engaging |
| Give feedback | 5 | Helps system learn |
| Reach milestone | 100-500 | Depends on significance |
| Complete week | 50 | Not a streak - just acknowledgement |

## Credits Philosophy

- **Earned, not gamed** - Can't be too easy to accumulate
- **No streak pressure** - Missing days doesn't lose credits
- **Value without manipulation** - No variable reward schedules
- **Transparent** - User knows exactly how credits work

## Future Spending (Conceptual - Phase 2+)

- Trade for "guilt-free" treats
- Visualise as "movement currency"
- Connect to nutritional choices
- Never punitive - always additive

---

# PART 11: DATA STRUCTURES

## User Profile

```javascript
{
  id: "user-001",
  name: "Graeme",
  
  // Physical
  dateOfBirth: "1980-02-XX",
  biologicalSex: "male", // For physiological calculations
  weight: { value: 80, unit: "kg", lastUpdated: "2026-01-20" },
  height: { value: 178, unit: "cm" },
  
  // Conditions
  conditions: [
    {
      id: "herniated-disc",
      name: "Herniated Disc",
      bodyArea: "lower-back",
      side: "right",
      status: "managed",
      history: "Acute phase 2023, chiropractic resolved",
      triggers: ["high-impact", "heavy-deadlifts", "prolonged-sitting"],
      currentPain: 3,
      currentDifficulty: 2
    },
    {
      id: "hamstring-injury",
      name: "Hamstring Strain",
      bodyArea: "hamstring",
      side: "right",
      status: "recovering",
      startDate: "2025-11-20",
      currentPain: 4,
      currentDifficulty: 5
    }
  ],
  
  // Equipment
  equipment: ["massage-gun", "foam-roller", "wobble-board", "step-platform", "dumbbells", "mat"],
  
  // Goals
  goals: [/* Goal objects */],
  
  // Schedule
  schedule: {/* Commitments and preferences */},
  
  // Preferences
  coachPersonality: "steady",
  voiceEnabled: true,
  menstrualTracking: false, // Male user
  
  // Accessibility
  accessibility: {
    textSize: "normal",
    highContrast: false,
    reduceMotion: false,
    screenReaderOptimised: false
  }
}
```

## Check-in Structure

```javascript
{
  date: "2026-01-20",
  timestamp: "2026-01-20T07:30:00Z",
  
  energy: 6,
  mood: 7,
  
  sleep: {
    hours: 7,
    quality: 6
  },
  
  conditions: [
    { id: "herniated-disc", pain: 3, difficulty: 2 },
    { id: "hamstring-injury", pain: 4, difficulty: 5 }
  ],
  
  menstrualDay: null, // Not tracking
  
  notes: "Hamstring felt tight this morning"
}
```

## Session Structure

```javascript
{
  id: "session-2026-01-20",
  date: "2026-01-20",
  
  // Plan context
  programmeId: "hip-recovery",
  programmeWeek: 1,
  programmeDay: 1,
  
  // What was prescribed
  prescribed: {
    warmup: [/* exercises */],
    main: [/* exercises */],
    cooldown: [/* exercises */],
    totalDuration: 15,
    totalCredits: 55
  },
  
  // Adaptations applied
  adaptations: [
    { reason: "energy-6", action: "standard-intensity" },
    { reason: "hamstring-pain-4", action: "added-modification-notes" }
  ],
  
  // What actually happened
  completed: {
    exercises: [
      { id: "hip-flexor-stretch", completed: true, feedback: "just-right" },
      { id: "figure-four", completed: true, feedback: null },
      { id: "cat-cow", completed: true, feedback: "too-easy" },
      { id: "glute-bridge", completed: true, feedback: "just-right" }
    ],
    skipped: [],
    duration: 18,
    creditsEarned: 55
  },
  
  // Post-session
  postSession: {
    feelingComparedToStart: "better",
    notes: null
  }
}
```

---

# PART 12: ACCESSIBILITY (WCAG 2.2 AA)

## Requirements

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.1.1 Non-text Content | All images have alt text | ✓ All UI elements labelled |
| 1.2.1 Audio-only | Captions available | ✓ Text always accompanies voice |
| 1.3.1 Info and Relationships | Semantic HTML | ✓ Proper heading hierarchy |
| 1.4.1 Use of Color | Not color-only | ✓ Icons + text + color |
| 1.4.3 Contrast | 4.5:1 minimum | ✓ All text meets ratio |
| 1.4.4 Resize Text | Up to 200% | ✓ Responsive design |
| 1.4.10 Reflow | No horizontal scroll at 320px | ✓ Mobile-first design |
| 2.1.1 Keyboard | All functions keyboard accessible | ✓ Tab navigation works |
| 2.4.6 Headings and Labels | Descriptive headings | ✓ Clear hierarchy |
| 2.5.5 Target Size | 44x44px minimum | ✓ Large tap targets |
| 3.1.1 Language | Page language declared | ✓ lang="en" |
| 3.3.1 Error Identification | Errors clearly described | ✓ Inline validation |
| 4.1.2 Name, Role, Value | ARIA labels where needed | ✓ Screen reader tested |

## Additional Neurodivergent Considerations

- **Minimal cognitive load** - One thing at a time
- **Clear visual hierarchy** - Know where to look
- **Consistent patterns** - Same actions, same places
- **No time pressure** - Everything waits for the user
- **Undo available** - Mistakes aren't permanent
- **Progress visible** - But not as pressure

---

# PART 13: FILE STRUCTURE

```
alongside/
├── index.html
│
├── css/
│   ├── app.css                 # Main styles
│   ├── accessibility.css       # A11y specific
│   └── themes/
│       ├── default.css
│       └── high-contrast.css
│
├── js/
│   ├── app.js                  # Main controller
│   ├── store.js                # Data management (localStorage)
│   │
│   ├── engines/
│   │   ├── goalEngine.js       # Goal decomposition
│   │   ├── planAssembler.js    # Template combination
│   │   ├── dailyAdapter.js     # Session modification
│   │   ├── scheduleEngine.js   # Time management
│   │   ├── safetyEngine.js     # Burnout, conditions, safety
│   │   └── feedbackEngine.js   # Process user feedback
│   │
│   ├── coach/
│   │   ├── scriptEngine.js     # Generate coach dialogue
│   │   ├── personalities/
│   │   │   ├── steady.json
│   │   │   ├── energetic.json
│   │   │   ├── minimal.json
│   │   │   └── nurturing.json
│   │   └── voice.js            # Audio playback
│   │
│   ├── views/
│   │   ├── onboarding/
│   │   │   ├── welcome.js
│   │   │   ├── goals.js
│   │   │   ├── conditions.js
│   │   │   ├── equipment.js
│   │   │   ├── schedule.js
│   │   │   ├── coachSelect.js
│   │   │   └── planReveal.js
│   │   ├── dashboard.js
│   │   ├── checkin.js
│   │   ├── session.js
│   │   ├── history.js
│   │   ├── progress.js
│   │   └── settings.js
│   │
│   └── utils/
│       ├── accessibility.js
│       ├── audio.js
│       └── storage.js
│
├── data/
│   ├── exercises/
│   │   ├── mobility.json
│   │   ├── strength.json
│   │   ├── cardio.json
│   │   └── rehab.json
│   │
│   ├── templates/
│   │   ├── hip-recovery.json
│   │   ├── hamstring-rehab.json
│   │   ├── core-stability.json
│   │   └── return-to-running.json
│   │
│   ├── goals/
│   │   └── goal-mappings.json
│   │
│   └── scripts/
│       └── coach-scripts.json
│
├── audio/
│   ├── coach/
│   │   └── steady/
│   │       ├── welcome.mp3
│   │       ├── session-start.mp3
│   │       └── ...
│   └── exercises/
│       └── ...
│
└── assets/
    ├── icons/
    └── images/
```

---

# PART 14: BUILD ORDER

| Phase | Component | Depends On | Priority |
|-------|-----------|------------|----------|
| 1 | Data structures (JSON schemas) | Nothing | Critical |
| 2 | store.js (data management) | Phase 1 | Critical |
| 3 | Exercise content (your exercises) | Phase 1 | Critical |
| 4 | Template content (your programmes) | Phase 1, 3 | Critical |
| 5 | Safety Engine (burnout, conditions) | Phase 1 | Critical |
| 6 | Goal Engine | Phase 1, 4 | High |
| 7 | Plan Assembler | Phase 1, 4, 6 | High |
| 8 | Schedule Engine | Phase 1 | High |
| 9 | Daily Adapter | Phase 1, 5, 7 | High |
| 10 | Coach Scripts | Phase 1 | High |
| 11 | Views: Onboarding | Phase 2, 6, 8, 10 | High |
| 12 | Views: Check-in | Phase 2, 5 | High |
| 13 | Views: Session | Phase 2, 9, 10 | High |
| 14 | Views: Dashboard, History, Progress | Phase 2 | Medium |
| 15 | Voice Integration | Phase 10, 13 | Medium |
| 16 | Feedback Engine | Phase 2 | Medium |
| 17 | Accessibility Pass | All | Critical |
| 18 | Testing & Refinement | All | Critical |

---

# PART 15: FUTURE SLOTS (Not Built Yet)

## Nutrition Module (Phase 2)
- Meal logging
- Calorie tracking
- Healthier swap suggestions
- Integration with credits

## Financial Wellness (Phase 3)
- Virtual savings account
- "Instead of X, saved Y"
- Goal-linked saving

## Social Features (Phase 4 - Maybe Never)
- Only if non-comparative
- Accountability partners (optional)
- Never leaderboards

---

# DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-26 | Claude (with Graeme) | Initial complete architecture |

---

**This document is the master blueprint for Alongside. All development should reference this document. Changes to architecture should be reflected here first.**
