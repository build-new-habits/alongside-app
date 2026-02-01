# ALONGSIDE: Expanded Onboarding Requirements
## Beta-Ready User Profiling | January 2026

This document extends the existing onboarding specification to cover additional factors essential for beta testing with real users.

---

# PART 1: HORMONAL & LIFE STAGE FACTORS

## 1.1 Menstrual & Hormonal Tracking

### Initial Question (During Onboarding)

**Screen: Hormonal Health**

```
"Would you like cycle-aware recommendations?"

This helps me adapt workouts to your energy patterns throughout the month.

○ Yes, I have a regular menstrual cycle
○ Yes, but my cycle is irregular
○ I'm in perimenopause
○ I'm in menopause / post-menopause
○ I'm on hormone therapy (HRT/HT)
○ This doesn't apply to me
○ Prefer not to say
```

### Follow-up Questions by Selection

#### If "Regular menstrual cycle":
```
"Roughly how long is your cycle?"

○ 21-25 days (shorter)
○ 26-30 days (typical)
○ 31-35 days (longer)
○ It varies a lot
○ I'm not sure

"Would you like to log your cycle day during check-in?"
○ Yes, I'll track it
○ No, just use general patterns
```

#### If "Irregular cycle":
```
"That's common and completely okay. I'll ask how you're feeling each day 
rather than assuming based on cycle day.

Would you like to optionally log period start dates when they happen?"
○ Yes, that would help
○ No thanks
```

#### If "Perimenopause":
```
"Perimenopause can bring unpredictable energy and symptoms. 
I'll pay extra attention to your daily check-in and won't assume patterns.

Which of these do you experience? (Select all that apply)"

☐ Hot flushes / night sweats
☐ Sleep disruption
☐ Mood changes
☐ Irregular periods
☐ Brain fog / concentration issues
☐ Joint aches
☐ Fatigue
☐ Anxiety
☐ None of these currently
```

#### If "Menopause / Post-menopause":
```
"I'll focus on what works for your body now, with attention to 
bone health, joint care, and sustainable energy.

Any of these relevant to you? (Select all that apply)"

☐ Hot flushes
☐ Sleep issues
☐ Joint stiffness
☐ Bone health concerns
☐ Mood changes
☐ Weight changes
☐ Fatigue
☐ None of these
```

#### If "Hormone therapy (HRT/HT)":
```
"Good to know. HRT can affect energy and recovery differently 
for everyone. I'll rely on your daily check-in to guide recommendations.

Is there anything specific you'd like me to know about how 
it affects your exercise?"

[Free text field - optional]
```

---

## 1.2 Data Schema Addition

```javascript
profile: {
  // ... existing fields ...
  
  hormonalHealth: {
    status: 'regular-cycle' | 'irregular-cycle' | 'perimenopause' | 
            'menopause' | 'hrt' | 'not-applicable' | 'prefer-not-to-say',
    
    // If cycling
    cycleLength: 'short' | 'typical' | 'long' | 'variable' | null,
    trackCycleDay: boolean,
    
    // Symptoms (perimenopause/menopause)
    symptoms: [
      'hot-flushes',
      'night-sweats', 
      'sleep-disruption',
      'mood-changes',
      'irregular-periods',
      'brain-fog',
      'joint-aches',
      'fatigue',
      'anxiety',
      'bone-concerns',
      'weight-changes'
    ],
    
    // HRT notes
    hrtNotes: string | null,
    
    // Last period start (if tracking)
    lastPeriodStart: ISO string | null
  }
}
```

---

## 1.3 How This Affects the Coach

| Status | Coach Behaviour |
|--------|-----------------|
| Regular cycle | Uses cycle phase to suggest workout intensity. Gentler during menstruation, higher intensity mid-cycle. |
| Irregular cycle | Relies entirely on daily check-in, no assumptions |
| Perimenopause | Extra weight on fatigue/sleep signals. Offers more flexibility. Validates unpredictability. |
| Menopause | Emphasises joint-friendly movements, bone-loading exercises, recovery. Never assumes energy patterns. |
| HRT | Treats as individual - relies on check-in data, learns patterns over time |
| Not applicable | Standard male/non-cycling pathway |

---

# PART 2: AGE-ADJUSTED FACTORS

## 2.1 Age Collection (Already Documented)

Age is already collected. What's new is **how we use it**.

## 2.2 Age-Based Adjustments

### Recovery Time Multipliers

| Age Range | Recovery Multiplier | Notes |
|-----------|---------------------|-------|
| Under 30 | 1.0x | Standard recovery |
| 30-39 | 1.1x | Slightly longer between intense sessions |
| 40-49 | 1.25x | More recovery days, joint warm-ups important |
| 50-59 | 1.4x | Emphasise mobility, reduce impact, longer warm-ups |
| 60-69 | 1.6x | Balance work important, gentler progressions |
| 70+ | 2.0x | Focus on functional movement, fall prevention |

### Automatic Adjustments by Age

```javascript
const ageAdjustments = {
  under30: {
    recoveryDays: 1,
    warmupMultiplier: 1.0,
    impactLevel: 'any',
    balanceWork: 'optional',
    boneLoading: 'standard'
  },
  
  age30to39: {
    recoveryDays: 1,
    warmupMultiplier: 1.0,
    impactLevel: 'any',
    balanceWork: 'optional',
    boneLoading: 'standard'
  },
  
  age40to49: {
    recoveryDays: 1-2,
    warmupMultiplier: 1.25,
    impactLevel: 'moderate-preferred',
    balanceWork: 'recommended',
    boneLoading: 'important'
  },
  
  age50to59: {
    recoveryDays: 2,
    warmupMultiplier: 1.5,
    impactLevel: 'low-moderate',
    balanceWork: 'included',
    boneLoading: 'essential',
    jointMobility: 'emphasised'
  },
  
  age60to69: {
    recoveryDays: 2-3,
    warmupMultiplier: 1.75,
    impactLevel: 'low',
    balanceWork: 'essential',
    boneLoading: 'essential',
    jointMobility: 'essential',
    fallPrevention: 'included'
  },
  
  age70plus: {
    recoveryDays: 3,
    warmupMultiplier: 2.0,
    impactLevel: 'minimal',
    balanceWork: 'priority',
    boneLoading: 'careful',
    jointMobility: 'priority',
    fallPrevention: 'priority',
    functionalMovement: 'focus'
  }
};
```

## 2.3 Age-Specific Onboarding Questions

### For Users 50+

After age is entered, add this screen:

```
"A few more questions to help me support you well..."

"How would you describe your joint health?"
○ No issues - everything feels good
○ Some stiffness, especially in the morning
○ Occasional joint pain during activity
○ Ongoing joint concerns (arthritis, etc.)
○ Had joint replacement surgery

"Any concerns about balance?"
○ No, my balance is good
○ Sometimes feel a bit unsteady
○ Yes, balance is a concern for me
○ I've had falls in the past year

"Bone health - any of these apply?"
☐ Osteoporosis diagnosis
☐ Osteopenia diagnosis
☐ Family history of osteoporosis
☐ Taking bone health medication
☐ None of these / not sure
```

## 2.4 Data Schema Addition

```javascript
profile: {
  // ... existing fields ...
  
  ageFactors: {
    // Auto-calculated from DOB
    ageRange: 'under30' | '30-39' | '40-49' | '50-59' | '60-69' | '70plus',
    
    // For 50+ users
    jointHealth: 'good' | 'stiff' | 'occasional-pain' | 'ongoing' | 'replacement',
    balanceConcerns: 'none' | 'sometimes' | 'yes' | 'falls-history',
    boneHealth: ['osteoporosis', 'osteopenia', 'family-history', 'medication'] | []
  }
}
```

---

# PART 3: LIFESTYLE FACTORS

## 3.1 Occupation & Activity Level

### Onboarding Screen: Daily Life

```
"What does a typical day look like for you?"

"Your work/daily activity:"
○ Mostly sitting (desk job, driving, etc.)
○ Mix of sitting and moving
○ On my feet most of the day
○ Physically demanding work
○ Retired / not currently working
○ Varies a lot

"How would you describe your current activity level?"
○ Sedentary - very little intentional exercise
○ Lightly active - occasional walks, light activity
○ Moderately active - exercise 1-2 times per week
○ Active - exercise 3-4 times per week
○ Very active - exercise 5+ times per week
```

### Screen: Exercise History

```
"A bit about your exercise background..."

"How long since you exercised regularly?"
○ I'm currently exercising regularly
○ Less than 3 months ago
○ 3-6 months ago
○ 6-12 months ago
○ 1-2 years ago
○ More than 2 years ago
○ I've never had a regular routine

"Any previous athletic background?"
(This helps me understand your movement foundation)

☐ Team sports (football, rugby, netball, etc.)
☐ Running / athletics
☐ Swimming
☐ Cycling
☐ Gym / weight training
☐ Dance
☐ Martial arts
☐ Yoga / Pilates
☐ Other sport or activity
☐ No particular athletic background
```

### Screen: Current Situation (If Returning After Break)

```
"What's brought you back to exercise?"

☐ Returning after injury
☐ Returning after illness
☐ Returning after pregnancy
☐ Life just got busy
☐ Lost motivation
☐ Gym/fitness culture didn't work for me
☐ Ready for a fresh start
☐ Doctor recommended it
☐ Other reason

[Optional: Tell me more - free text]
```

## 3.2 Stress & Energy Patterns

### Onboarding Screen: Energy & Stress

```
"Understanding your energy helps me time recommendations better..."

"How would you rate your typical stress level?"
○ Low - life feels pretty manageable
○ Moderate - some stress but coping okay
○ High - feeling quite stressed regularly
○ Very high - struggling with stress

"When do you typically have most energy?"
○ Morning person - best energy early
○ Midday - energy peaks around lunch
○ Afternoon/evening - get going later in the day
○ It varies day to day
○ Honestly, energy is low most of the time

"How's your sleep generally?"
○ Good - usually sleep well
○ Okay - some good nights, some bad
○ Poor - often struggle with sleep
○ Very poor - significant sleep issues
```

## 3.3 Data Schema Addition

```javascript
profile: {
  // ... existing fields ...
  
  lifestyle: {
    occupation: 'sedentary' | 'mixed' | 'on-feet' | 'physical' | 'retired' | 'varies',
    currentActivityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active',
    
    exerciseHistory: {
      lastRegularExercise: 'current' | '<3months' | '3-6months' | '6-12months' | 
                          '1-2years' | '>2years' | 'never',
      athleticBackground: ['team-sports', 'running', 'swimming', 'cycling', 
                          'gym', 'dance', 'martial-arts', 'yoga', 'other', 'none'],
      returningAfter: ['injury', 'illness', 'pregnancy', 'busy', 'motivation', 
                       'culture', 'fresh-start', 'medical', 'other'] | null,
      returningNotes: string | null
    },
    
    energyPatterns: {
      stressLevel: 'low' | 'moderate' | 'high' | 'very-high',
      peakEnergyTime: 'morning' | 'midday' | 'evening' | 'varies' | 'low-always',
      sleepQuality: 'good' | 'okay' | 'poor' | 'very-poor'
    }
  }
}
```

---

# PART 4: EXPANDED GOALS & TARGETS

## 4.1 Primary Goals (Expanded List)

Replace the current 8 goals with this expanded, categorised list:

### Goal Categories

```javascript
const GOAL_CATEGORIES = {
  weightAndBody: {
    label: "Weight & Body",
    goals: [
      { id: 'lose-weight', name: 'Lose weight', icon: '⚖️', hasTarget: true },
      { id: 'maintain-weight', name: 'Maintain current weight', icon: '⚖️', hasTarget: false },
      { id: 'build-muscle', name: 'Build muscle', icon: '💪', hasTarget: false },
      { id: 'tone-up', name: 'Tone up / look more defined', icon: '✨', hasTarget: false },
      { id: 'body-composition', name: 'Improve body composition', icon: '📊', hasTarget: false }
    ]
  },
  
  strengthAndFitness: {
    label: "Strength & Fitness",
    goals: [
      { id: 'get-stronger', name: 'Get stronger', icon: '🏋️', hasTarget: false },
      { id: 'improve-cardio', name: 'Improve cardiovascular fitness', icon: '❤️', hasTarget: false },
      { id: 'build-endurance', name: 'Build endurance', icon: '🔋', hasTarget: false },
      { id: 'functional-strength', name: 'Functional strength for daily life', icon: '🏠', hasTarget: false }
    ]
  },
  
  runningAndCardio: {
    label: "Running & Cardio Goals",
    goals: [
      { id: 'start-running', name: 'Start running (Couch to 5K)', icon: '🏃', hasTarget: true, targetType: 'programme' },
      { id: 'run-5k', name: 'Run a 5K', icon: '🏃', hasTarget: true, targetType: 'distance' },
      { id: 'run-10k', name: 'Run a 10K', icon: '🏃', hasTarget: true, targetType: 'distance' },
      { id: 'run-half-marathon', name: 'Run a half marathon', icon: '🏃', hasTarget: true, targetType: 'distance' },
      { id: 'run-faster', name: 'Run faster', icon: '⚡', hasTarget: true, targetType: 'pace' },
      { id: 'run-further', name: 'Run further', icon: '📏', hasTarget: true, targetType: 'distance' },
      { id: 'cycling', name: 'Improve cycling', icon: '🚴', hasTarget: false },
      { id: 'swimming', name: 'Improve swimming', icon: '🏊', hasTarget: false },
      { id: 'triathlon', name: 'Train for triathlon', icon: '🏆', hasTarget: true, targetType: 'event' }
    ]
  },
  
  mobilityAndRecovery: {
    label: "Mobility & Recovery",
    goals: [
      { id: 'improve-flexibility', name: 'Improve flexibility', icon: '🧘', hasTarget: false },
      { id: 'reduce-pain', name: 'Reduce pain', icon: '🩹', hasTarget: false },
      { id: 'injury-recovery', name: 'Recover from injury', icon: '🏥', hasTarget: false },
      { id: 'prevent-injury', name: 'Prevent future injuries', icon: '🛡️', hasTarget: false },
      { id: 'improve-posture', name: 'Improve posture', icon: '🧍', hasTarget: false },
      { id: 'increase-mobility', name: 'Increase mobility', icon: '🔄', hasTarget: false }
    ]
  },
  
  wellbeingAndMental: {
    label: "Wellbeing & Mental Health",
    goals: [
      { id: 'more-energy', name: 'Have more energy', icon: '⚡', hasTarget: false },
      { id: 'reduce-stress', name: 'Reduce stress', icon: '😌', hasTarget: false },
      { id: 'improve-mood', name: 'Improve mood', icon: '😊', hasTarget: false },
      { id: 'reduce-anxiety', name: 'Reduce anxiety', icon: '🧘', hasTarget: false },
      { id: 'sleep-better', name: 'Sleep better', icon: '😴', hasTarget: false },
      { id: 'mental-clarity', name: 'Improve mental clarity', icon: '🧠', hasTarget: false },
      { id: 'self-confidence', name: 'Build self-confidence', icon: '💫', hasTarget: false }
    ]
  },
  
  habitsAndLifestyle: {
    label: "Habits & Lifestyle",
    goals: [
      { id: 'build-habit', name: 'Build a consistent routine', icon: '📅', hasTarget: false },
      { id: 'move-more', name: 'Just move more', icon: '🚶', hasTarget: false },
      { id: 'active-lifestyle', name: 'Live a more active lifestyle', icon: '🌱', hasTarget: false },
      { id: 'enjoy-exercise', name: 'Actually enjoy exercise', icon: '😄', hasTarget: false }
    ]
  },
  
  sportSpecific: {
    label: "Sport-Specific",
    goals: [
      { id: 'sport-tennis', name: 'Improve at tennis', icon: '🎾', hasTarget: false },
      { id: 'sport-football', name: 'Improve at football', icon: '⚽', hasTarget: false },
      { id: 'sport-golf', name: 'Improve at golf', icon: '⛳', hasTarget: false },
      { id: 'sport-other', name: 'Improve at another sport', icon: '🏅', hasTarget: false, hasNotes: true },
      { id: 'return-to-sport', name: 'Return to a sport after time off', icon: '🔙', hasTarget: false, hasNotes: true }
    ]
  }
};
```

## 4.2 Goal Target Details

For goals with `hasTarget: true`, show follow-up:

### Weight Loss Target
```
"What's your target weight?"
[Number input] kg/lbs

"By when would you like to reach this?"
○ No specific date - just making progress
○ In 3 months
○ In 6 months
○ In 12 months
○ Specific date: [Date picker]

"Have you tried to lose weight before?"
○ No, this is my first focused attempt
○ Yes, with some success
○ Yes, but struggled to keep it off
○ Yes, many times
```

### Running Distance Target
```
"Tell me about your running goal..."

"What distance are you targeting?"
○ 5K (3.1 miles)
○ 10K (6.2 miles)
○ Half Marathon (13.1 miles / 21.1km)
○ Marathon (26.2 miles / 42.2km)
○ Other: [Input field]

"Do you have an event booked?"
○ Yes - Date: [Date picker]
○ No specific event, just a personal goal
○ I'm thinking about entering one

"Current running ability?"
○ Can't run at all yet
○ Can run a little (up to 1-2km)
○ Can run 3-5km
○ Can run 5-10km
○ Can run 10km+
```

### Pace Target
```
"What pace are you aiming for?"

"Current pace (per km or mile):"
[Input] mins per km/mile

"Target pace:"
[Input] mins per km/mile

"For what distance?"
○ 5K
○ 10K
○ Half Marathon
○ Any distance
```

## 4.3 Data Schema for Goals

```javascript
goals: [
  {
    id: string,                    // e.g., 'lose-weight'
    category: string,              // e.g., 'weightAndBody'
    name: string,                  // e.g., 'Lose weight'
    priority: number,              // 1 = primary, 2 = secondary, etc.
    
    // Optional target details
    target: {
      type: 'weight' | 'distance' | 'pace' | 'event' | 'programme' | null,
      value: number | string | null,
      unit: string | null,
      deadline: ISO string | null,
      eventName: string | null,
      eventDate: ISO string | null
    } | null,
    
    // For tracking
    startDate: ISO string,
    startingValue: number | null,  // e.g., starting weight
    currentValue: number | null,
    achieved: boolean,
    achievedDate: ISO string | null,
    
    // Notes
    notes: string | null,
    previousAttempts: 'none' | 'some-success' | 'struggled' | 'many-times' | null
  }
]
```

---

# PART 5: INJURY CONTEXT (Enhanced)

## 5.1 Injury Story Capture

When user selects a condition, add optional context:

### Screen: Tell Me About [Condition]

```
"I'd like to understand your [hip/knee/etc.] better so I can help properly."

"How did this start?"
○ Sudden injury (specific incident)
○ Gradual onset (developed over time)
○ Post-surgery
○ Born with it / lifelong condition
○ Not sure

"If it was a specific injury, what happened?"
(Optional - helps me understand what to avoid)
[Free text field]
Examples: "Twisted it playing football", "Fell off bike", "Lifting injury"

"How long have you had this?"
○ Less than 1 month (acute)
○ 1-3 months
○ 3-6 months
○ 6-12 months
○ 1-2 years
○ More than 2 years (chronic)

"Have you had treatment for this?"
☐ Physiotherapy
☐ Surgery
☐ Injections
☐ Medication
☐ Rest/self-management
☐ Currently in treatment
☐ No treatment

"What makes it worse?"
(Select all that apply)
☐ Running/impact
☐ Jumping
☐ Squatting/bending
☐ Lifting
☐ Twisting
☐ Sitting too long
☐ Standing too long
☐ Walking
☐ Going up/down stairs
☐ Cold weather
☐ Not sure

"What helps it?"
(Select all that apply)
☐ Movement/gentle exercise
☐ Rest
☐ Heat
☐ Ice
☐ Stretching
☐ Strengthening exercises
☐ Massage
☐ Nothing seems to help
☐ Not sure yet
```

## 5.2 Enhanced Condition Schema

```javascript
conditions: [
  {
    id: string,                    // e.g., 'hip-left'
    region: string,                // e.g., 'hip'
    side: 'left' | 'right' | 'both' | 'central',
    
    // Current state
    severity: 1-10,
    chronicOrAcute: 'chronic' | 'acute' | 'post-surgery',
    
    // Context
    onset: {
      type: 'sudden' | 'gradual' | 'post-surgery' | 'lifelong' | 'unknown',
      description: string | null,  // Free text
      date: ISO string | null,     // When it started
      duration: '<1month' | '1-3months' | '3-6months' | '6-12months' | 
                '1-2years' | '>2years'
    },
    
    // Treatment
    treatment: {
      history: ['physio', 'surgery', 'injections', 'medication', 'rest', 'ongoing'],
      currentlyInTreatment: boolean,
      notes: string | null
    },
    
    // Triggers and relief
    worsens: ['running', 'jumping', 'squatting', 'lifting', 'twisting', 
              'sitting', 'standing', 'walking', 'stairs', 'cold'],
    helps: ['movement', 'rest', 'heat', 'ice', 'stretching', 
            'strengthening', 'massage', 'nothing', 'unsure'],
    
    // Daily tracking
    todayPain: 1-10 | null,
    todayDifficulty: 1-10 | null
  }
]
```

---

# PART 6: ONBOARDING FLOW (REVISED)

## Complete Flow for Beta

| Step | Screen | Required? | Time Est |
|------|--------|-----------|----------|
| 1 | Welcome | Yes | 15 sec |
| 2 | Name | Yes | 15 sec |
| 3 | Age & Gender | Yes | 20 sec |
| 4 | Hormonal Health | Yes (can skip) | 30-60 sec |
| 5 | Age-Specific Questions (50+) | Conditional | 30 sec |
| 6 | Weight & Height | Optional | 20 sec |
| 7 | Lifestyle & Activity Level | Yes | 30 sec |
| 8 | Exercise History | Yes | 30 sec |
| 9 | Energy & Stress | Yes | 20 sec |
| 10 | Goals (categorised) | Yes | 45-90 sec |
| 11 | Goal Details (if applicable) | Conditional | 30-60 sec |
| 12 | Conditions Overview | Yes (can skip) | 20 sec |
| 13 | Condition Details (per condition) | Conditional | 30-60 sec each |
| 14 | Equipment | Yes | 30-45 sec |
| 15 | Schedule / Availability | Yes | 45-60 sec |
| 16 | Coach Personality | Yes | 30 sec |
| 17 | Plan Reveal | Yes | 30 sec |

**Total: 5-8 minutes** (depending on conditions/goals selected)

---

# PART 7: COACH ADAPTATIONS

## How New Data Affects Recommendations

### Hormonal Status

| Status | Workout Adaptations |
|--------|---------------------|
| Regular cycle - menstrual phase | Gentler options, reduced intensity, extra rest |
| Regular cycle - follicular phase | Can push harder, good for strength |
| Regular cycle - ovulation | Peak performance window, higher intensity ok |
| Regular cycle - luteal phase | Moderate intensity, focus on steady state |
| Perimenopause | Day-by-day assessment, more recovery options, validate unpredictability |
| Menopause | Emphasis on bone-loading, joint mobility, consistent moderate effort |
| HRT | Individual response - learn from check-in patterns |

### Age-Related

| Factor | Adaptation |
|--------|------------|
| 50+ with joint stiffness | Longer warm-ups, joint mobility in every session |
| 50+ with balance concerns | Include balance work, avoid unstable surfaces initially |
| 50+ with bone concerns | Include weight-bearing exercises, careful with high impact |
| 60+ generally | Functional movement focus, fall prevention, recovery priority |

### Lifestyle-Related

| Factor | Adaptation |
|--------|------------|
| Sedentary job | Include movement breaks, posture work, hip mobility |
| High stress | Prioritise stress-reducing workouts, don't add intensity stress |
| Poor sleep | Gentler morning sessions, avoid late intense workouts |
| Returning after long break | Start very gentle, rebuild foundation, celebrate small wins |
| Returning after pregnancy | Core rehab focus, pelvic floor awareness, gradual progression |

---

# PART 8: IMPLEMENTATION PRIORITY

## For Beta Launch

### Must Have (Build Now)
1. ✅ Basic goals (use expanded list)
2. ✅ Conditions with severity
3. ✅ Equipment
4. ✅ Schedule
5. 🔲 Hormonal health screen (new)
6. 🔲 Lifestyle & activity level (new)
7. 🔲 Exercise history (new)

### Should Have (Build Before Beta)
1. 🔲 Age-specific questions (50+)
2. 🔲 Energy & stress patterns
3. 🔲 Goal targets (for goals with hasTarget)
4. 🔲 Enhanced injury context

### Nice to Have (Post-Beta)
1. 🔲 Sport-specific goals
2. 🔲 Full injury story capture
3. 🔲 Body measurements tracking
4. 🔲 Treatment integration

---

# DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-30 | Claude (with Graeme) | Initial expanded requirements |

---

**This document extends the onboarding specification to ensure beta-readiness for diverse users including those experiencing menopause, age-related factors, and various lifestyle situations.**
