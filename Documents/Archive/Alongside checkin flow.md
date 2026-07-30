# ALONGSIDE: Daily Check-in Flow
## Complete Check-in Screens & Logic v1.0 | January 2026

---

# PART 1: CHECK-IN PHILOSOPHY

## Why Check-in Matters

The daily check-in is the **heartbeat** of Alongside. It's where:

1. **Safety happens** - We catch burnout, pain flares, low mood
2. **Adaptation happens** - Today's session gets tailored to today's reality
3. **Relationship happens** - The Coach acknowledges how you're actually doing
4. **Data happens** - Patterns emerge over time

## Design Principles

### Speed
- **Target: 30-60 seconds** to complete
- Every second of friction increases abandonment
- Taps over typing, always

### Honesty
- Questions framed to encourage truth, not "right answers"
- No judgement language
- Low scores are acknowledged, not problematised

### Flexibility
- Can skip non-essential questions
- Can add detail if they want to
- Minimal path is always available

### Continuity
- Check-in builds on yesterday
- Conditions from profile pre-loaded
- Coach remembers what they said before

---

## Check-in Components

| Component | Required? | Purpose |
|-----------|-----------|---------|
| Energy | Yes | Match session intensity to capacity |
| Mood | Yes | Detect mental health patterns, adjust tone |
| Sleep | No | Additional context for energy |
| Conditions | Only if they have them | Safety - filter exercises, detect flares |
| Menstrual day | Only if tracking | Cycle-aware recommendations |
| Notes | No | Capture anything else |

---

## Check-in Timing

### When Check-in Appears

| Scenario | Check-in Behaviour |
|----------|-------------------|
| User opens app, no check-in today | Show check-in immediately |
| User opens app, checked in <4 hours ago | Skip to dashboard, offer "Update how I'm feeling" |
| User opens app, checked in 4-12 hours ago | Ask "Still feeling [previous]? Or want to update?" |
| User opens app, checked in >12 hours ago | Show full check-in |
| User starts session without check-in | Quick check-in (energy + mood only) |

### Check-in Expiry

Check-ins are valid for the calendar day. At midnight, previous check-in expires.

---

# PART 2: SCREEN-BY-SCREEN FLOW

## Screen Flow Overview

```
OPEN APP
    │
    ▼
CHECK-IN NEEDED?
    │
    ├── No → Dashboard
    │
    └── Yes ↓
            │
            ▼
    ┌─────────────────┐
    │  COACH GREETING │ (Screen 1)
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │     ENERGY      │ (Screen 2)
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │      MOOD       │ (Screen 3)
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │     SLEEP       │ (Screen 4 - Optional)
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   CONDITIONS    │ (Screen 5 - If applicable)
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ MENSTRUAL DAY   │ (Screen 6 - If tracking)
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  COACH SUMMARY  │ (Screen 7)
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ TODAY'S SESSION │ (Present options)
    └─────────────────┘
```

---

## Screen 1: Coach Greeting

### Purpose
Warm welcome, set the tone for check-in.

### Content

**Visual:** Coach avatar/icon, warm background

**Coach speaks:** (Varies by personality and context)

#### Standard Greeting

**Steady:**
> "Good [morning/afternoon/evening], [Name]. How are you today?"

**Energetic:**
> "Hey [Name]! How are we feeling today?"

**Minimal:**
> "How are you today?"

**Nurturing:**
> "Hello [Name]. I'd like to know how you're really doing today."

#### After Missed Days (3+)

**Steady:**
> "Welcome back, [Name]. Good to see you. How are you feeling?"

**Energetic:**
> "Hey [Name]! Great to have you back. How are you doing?"

**Minimal:**
> "Welcome back. How are you?"

**Nurturing:**
> "Hello [Name]. It's good to see you. No pressure - just tell me how you're doing today."

#### After Tough Previous Session

**Steady:**
> "Good [time], [Name]. Yesterday was challenging. How are you feeling today?"

**Energetic:**
> "Hey [Name]! You worked hard yesterday. How's the body today?"

**Minimal:**
> "How are you after yesterday?"

**Nurturing:**
> "Hello [Name]. You pushed yourself yesterday. How are you feeling today? Be honest."

### Interaction
- Auto-advances after 2-3 seconds, or
- Tap anywhere to continue

### Data Captured
None (greeting only)

---

## Screen 2: Energy Level

### Purpose
Determine physical capacity for today's session.

### Content

**Question:** "How's your energy?"

**Visual:** Horizontal slider or tap-to-select scale (1-10)

**Display:** Large number showing current selection, with description below

### Energy Levels and Descriptions

| Level | Description | Colour |
|-------|-------------|--------|
| 1 | Exhausted - rest is the priority | Deep red |
| 2 | Very tired - gentle movement only | Red |
| 3 | Low energy - keep it light | Orange-red |
| 4 | Below average - pace yourself | Orange |
| 5 | Moderate - steady does it | Yellow |
| 6 | Decent - you've got this | Yellow-green |
| 7 | Good energy - solid session ahead | Light green |
| 8 | High energy - let's work | Green |
| 9 | Great energy - push yourself | Bright green |
| 10 | Peak energy - make it count! | Vibrant green |

### Visual Design

```
┌─────────────────────────────────────────────┐
│                                             │
│         How's your energy?                  │
│                                             │
│              ┌─────┐                        │
│              │  6  │                        │
│              └─────┘                        │
│                                             │
│         "Decent - you've got this"         │
│                                             │
│  1  2  3  4  5  [6]  7  8  9  10           │
│  ●  ●  ●  ●  ●   ●   ○  ○  ○  ○            │
│                                             │
│         [Continue →]                        │
│                                             │
└─────────────────────────────────────────────┘
```

### Interaction Options

**Option A: Slider**
- Drag to select
- Shows value updating in real-time

**Option B: Tap buttons**
- 10 buttons in a row
- Tap to select
- Current selection highlighted

**Option C: Large tap zones (Recommended for accessibility)**
- 3 large buttons: Low (1-3), Medium (4-6), High (7-10)
- After selection, can refine with secondary row

### Default Value
- Start at 5 (neutral)
- Or start at yesterday's value (if available)

### Button
"Continue →"

### Data Captured
```javascript
{ energy: 6 }
```

---

## Screen 3: Mood

### Purpose
Understand emotional state, detect patterns, adjust coaching tone.

### Content

**Question:** "And how are you feeling?"

**Visual:** Same format as energy (1-10 scale)

### Mood Levels and Descriptions

| Level | Description | Colour |
|-------|-------------|--------|
| 1 | Really struggling - be gentle with yourself | Deep purple |
| 2 | Quite low - small wins matter | Purple |
| 3 | Feeling down - movement might help | Blue-purple |
| 4 | A bit flat - let's see what helps | Blue |
| 5 | Neutral - steady as she goes | Grey-blue |
| 6 | Okay - nothing special | Light blue |
| 7 | Fairly good - positive vibes | Light green |
| 8 | Good - feeling capable | Green |
| 9 | Really good - bring it on | Bright green |
| 10 | Fantastic - riding high! | Gold/bright |

### Visual Design

```
┌─────────────────────────────────────────────┐
│                                             │
│         And how are you feeling?            │
│                                             │
│              ┌─────┐                        │
│              │  7  │                        │
│              └─────┘                        │
│                                             │
│         "Fairly good - positive vibes"      │
│                                             │
│  1  2  3  4  5  6  [7]  8  9  10           │
│  ●  ●  ●  ●  ●  ●   ●   ○  ○  ○            │
│                                             │
│         [Continue →]                        │
│                                             │
└─────────────────────────────────────────────┘
```

### Low Mood Protocol

If mood ≤ 3:
- Don't alarm or dramatise
- Coach will respond with extra gentleness
- Session recommendations will favour mood-lifting options
- System flags for burnout detection

**NOT shown to user at this point** (no "Are you okay?" popup - that's counterproductive)

### Button
"Continue →"

### Data Captured
```javascript
{ mood: 7 }
```

---

## Screen 4: Sleep (Optional)

### Purpose
Additional context for energy levels, pattern detection.

### When Shown
- If user hasn't skipped sleep in settings
- Can be permanently disabled in preferences

### Content

**Question:** "How did you sleep?"

**Two inputs:**

#### Hours
- Stepper or quick-select: 4, 5, 6, 7, 8, 9, 10+
- Or "I'd rather not say"

#### Quality (if hours provided)
- Simple 3-option: Poor / Okay / Great
- Or 1-10 scale for more detail

### Visual Design

```
┌─────────────────────────────────────────────┐
│                                             │
│          How did you sleep?                 │
│                                             │
│          Hours of sleep:                    │
│                                             │
│    [4] [5] [6] [7] [8] [9] [10+]           │
│                  ↑                          │
│              selected                       │
│                                             │
│          Sleep quality:                     │
│                                             │
│    [😫 Poor]  [😐 Okay]  [😊 Great]         │
│                                             │
│    [Skip]              [Continue →]         │
│                                             │
└─────────────────────────────────────────────┘
```

### Skip Option
"Skip" - moves to next screen without sleep data

### Data Captured
```javascript
{ 
  sleep: { 
    hours: 7, 
    quality: 6 // or "poor"/"okay"/"great" mapped to 3/6/9
  } 
}
```

---

## Screen 5: Conditions (If Applicable)

### Purpose
Daily update on condition status - crucial for safety.

### When Shown
- Only if user has conditions in their profile
- Each condition they've registered appears

### Content

**Introduction:**
> "Quick check on your [condition(s)]."

**For each condition:**

#### Pain Rating

**Question:** "[Condition name] - any pain today?"

**Scale:** 0-10 or quick-select

| Rating | Label |
|--------|-------|
| 0 | No pain |
| 1-2 | Barely noticeable |
| 3-4 | Mild - aware of it |
| 5-6 | Moderate - affecting me |
| 7-8 | Significant - limiting |
| 9-10 | Severe - need rest |

#### Visual Design (Per Condition)

```
┌─────────────────────────────────────────────┐
│                                             │
│   Lower Back (Herniated Disc)               │
│   ─────────────────────────────             │
│                                             │
│   Pain today?                               │
│                                             │
│   0  1  2  3  [4]  5  6  7  8  9  10       │
│   None         ↑              Severe        │
│            "Mild"                           │
│                                             │
│   ─────────────────────────────             │
│                                             │
│   Right Hamstring (Strain)                  │
│   ─────────────────────────────             │
│                                             │
│   Pain today?                               │
│                                             │
│   0  1  2  3  4  [5]  6  7  8  9  10       │
│   None            ↑           Severe        │
│            "Moderate"                       │
│                                             │
│         [Continue →]                        │
│                                             │
└─────────────────────────────────────────────┘
```

### High Pain Alert

If any condition pain ≥ 8:
- Visual indicator (gentle, not alarming)
- Coach will acknowledge in summary
- Session will be significantly modified

**NOT a popup or warning** - just noted and responded to appropriately

### Multiple Conditions
- Show all on one screen if 2-3 conditions
- Paginate if more than 3

### Data Captured
```javascript
{
  conditions: [
    { conditionId: "condition-001", pain: 4 },
    { conditionId: "condition-002", pain: 5 }
  ]
}
```

---

## Screen 6: Menstrual Day (If Tracking)

### Purpose
Cycle-aware recommendations.

### When Shown
- Only if user has enabled menstrual tracking
- Can be skipped

### Content

**Question:** "What day of your cycle are you on?"

**Options:**
- Number input (1-50) with stepper
- "I'm not sure"
- "Not tracking this cycle"
- "Skip"

### Visual Design

```
┌─────────────────────────────────────────────┐
│                                             │
│     What day of your cycle?                 │
│                                             │
│         ┌───────────────┐                   │
│         │  [-]  14  [+] │                   │
│         └───────────────┘                   │
│                                             │
│         📍 Ovulation phase                  │
│         "Energy often peaks around now"     │
│                                             │
│    [I'm not sure]    [Not tracking]         │
│                                             │
│              [Continue →]                   │
│                                             │
└─────────────────────────────────────────────┘
```

### Phase Indicator
Based on day entered, show current phase:
- Days 1-5: Menstruation
- Days 6-14: Follicular
- Days 15-17: Ovulation
- Days 18-28+: Luteal

### Data Captured
```javascript
{
  menstrualDay: 14,
  menstrualPhase: "ovulation" // auto-calculated
}
```

---

## Screen 7: Coach Summary & Response

### Purpose
Acknowledge what they've shared, explain how it affects today.

### Content

**Coach speaks:** (Personalised based on check-in data)

### Response Logic

The Coach response is assembled from modular components:

#### Component 1: Energy Acknowledgement

| Energy | Response (Steady) |
|--------|-------------------|
| 1-2 | "You're running very low today." |
| 3-4 | "Energy's a bit down today." |
| 5-6 | "Moderate energy - that's workable." |
| 7-8 | "Good energy today." |
| 9-10 | "You're feeling strong today." |

#### Component 2: Mood Acknowledgement (if notable)

| Mood | Response (Steady) |
|------|-------------------|
| 1-2 | "I hear that things are tough right now." |
| 3-4 | "Sounds like a harder day emotionally." |
| 5-6 | (No comment - neutral) |
| 7-8 | (No comment - positive but not notable) |
| 9-10 | "Great to hear you're feeling good." |

#### Component 3: Condition Response (if pain reported)

| Pain Level | Response (Steady) |
|------------|-------------------|
| 0-2 | (No comment) |
| 3-4 | "I'll keep an eye on your [condition]." |
| 5-6 | "Your [condition] needs some care today." |
| 7-8 | "Your [condition] is significant today - we'll be very careful." |
| 9-10 | "Your [condition] needs rest. We'll protect it completely today." |

#### Component 4: Adaptation Statement

Based on combined factors:

| Scenario | Statement |
|----------|-----------|
| All good (energy 6+, mood 5+, no pain) | "I've got a solid session ready for you." |
| Low energy (≤4) | "We'll keep things gentle today." |
| Low mood (≤4) | "Let's focus on movement that feels good." |
| High pain (≥7) | "Today is about recovery and protection." |
| Burnout detected | "Your body needs rest. Recovery mode is on." |
| Multiple factors | Combined message addressing each |

#### Component 5: Cycle Note (if relevant)

| Phase | Note |
|-------|------|
| Menstruation | "Your cycle suggests gentler movement today." |
| Follicular | "Good time for building strength." |
| Ovulation | "Peak energy window - use it if you're feeling it." |
| Luteal | "Steady, sustainable movement suits this phase." |

### Example Complete Responses

**Example 1: Good day**
> "Good energy today, and your back is behaving. I've got a solid session ready for you - we're focusing on core stability, which directly supports your running goal."

**Example 2: Low energy, moderate pain**
> "Energy's a bit down today, and your hamstring needs some care. We'll keep things gentle - I've adjusted your session to protect the hamstring while still moving."

**Example 3: Burnout detected**
> "I've noticed you've been running low for a few days now. That's not failure - it's your body asking for rest. Today is recovery only. Gentle stretching and breathing. When you're ready for more, I'll be here."

**Example 4: Low mood**
> "I hear that things are tough today. Movement can help, but we won't push. I've picked some gentle options that tend to lift mood without demanding much. You're in control."

### Visual Design

```
┌─────────────────────────────────────────────┐
│                                             │
│         ┌─────┐                             │
│         │ 🧠  │  Your Coach                 │
│         └─────┘                             │
│                                             │
│   "Good energy today, and your back is      │
│   behaving. I've got a solid session        │
│   ready for you - we're focusing on core    │
│   stability, which directly supports your   │
│   running goal."                            │
│                                             │
│   ─────────────────────────────             │
│                                             │
│   Today's adaptation:                       │
│   ✓ Standard intensity                      │
│   ✓ Core stability focus                    │
│   ⚠️ Protecting hamstring (pain: 5)         │
│                                             │
│         [See today's session →]             │
│                                             │
└─────────────────────────────────────────────┘
```

### Buttons

- **Primary:** "See today's session →"
- **Secondary:** "I just want to stretch" or "Show me options"

### Data Captured

Check-in now complete. All data saved:

```javascript
{
  id: "checkin-2026-01-27-morning",
  date: "2026-01-27",
  timestamp: "2026-01-27T07:35:00Z",
  energy: 7,
  energyDescription: "Good energy - solid session ahead",
  mood: 6,
  moodDescription: "Okay - nothing special",
  sleep: { hours: 7, quality: 6 },
  conditions: [
    { conditionId: "condition-001", pain: 3 },
    { conditionId: "condition-002", pain: 5 }
  ],
  menstrualDay: null,
  menstrualPhase: null,
  flags: {
    burnoutDetected: false,
    recoveryModeActive: false,
    highPainAlert: false,
    lowMoodAlert: false
  }
}
```

---

# PART 3: QUICK CHECK-IN (ABBREVIATED)

## When Used

- User tries to start session without check-in today
- User selects "Quick check-in" option
- Time-pressured situations

## Flow

```
┌─────────────────────────────────────────────┐
│                                             │
│         Quick check before we start         │
│                                             │
│   Energy:                                   │
│   [Low 😴]  [Medium 😐]  [High ⚡]          │
│                                             │
│   Anything hurting?                         │
│   [No, all good]  [Yes - tell me]          │
│                                             │
│         [Start session →]                   │
│                                             │
└─────────────────────────────────────────────┘
```

## Quick Check-in Options

### Energy: 3 buttons
- Low (maps to 3)
- Medium (maps to 6)
- High (maps to 8)

### Pain: 2 buttons
- "No, all good" → Skip conditions
- "Yes" → Show condition quick-rate (just pain 0-10 per condition)

### No mood question (inferred from context)

### No sleep question

## Data Captured

Minimal check-in:

```javascript
{
  id: "checkin-2026-01-27-quick",
  date: "2026-01-27",
  timestamp: "2026-01-27T12:15:00Z",
  energy: 6, // from "Medium"
  mood: null, // not asked
  type: "quick",
  conditions: [
    { conditionId: "condition-002", pain: 4 } // only if "Yes" selected
  ]
}
```

---

# PART 4: UPDATE CHECK-IN

## When Used

- User checked in earlier but wants to update
- "Update how I'm feeling" button from dashboard
- Significant time passed since check-in

## Flow

Shows current values, allows adjustment:

```
┌─────────────────────────────────────────────┐
│                                             │
│         Update how you're feeling           │
│                                             │
│   Energy: 7 → [tap to change]               │
│                                             │
│   Mood: 6 → [tap to change]                 │
│                                             │
│   Back pain: 3 → [tap to change]            │
│   Hamstring: 5 → [tap to change]            │
│                                             │
│   [Keep as is]     [Update & refresh]       │
│                                             │
└─────────────────────────────────────────────┘
```

## Behaviour

- Tapping a value opens inline editor
- "Keep as is" closes without changes
- "Update & refresh" saves changes and recalculates session recommendations

---

# PART 5: SAFETY CHECKS

## Burnout Detection

### When Checked
After every check-in, before presenting session.

### Detection Rules

```javascript
function detectBurnout(todayCheckin, checkinHistory) {
  const last3Days = checkinHistory.slice(-3);
  const last7Days = checkinHistory.slice(-7);
  
  // Pattern 1: Energy ≤3 for 3+ consecutive days
  const lowEnergyStreak = last3Days.length >= 3 && 
    last3Days.every(c => c.energy <= 3);
  
  // Pattern 2: Mood ≤4 for 3+ consecutive days
  const lowMoodStreak = last3Days.length >= 3 && 
    last3Days.every(c => c.mood <= 4);
  
  // Pattern 3: Average energy <4 over 7 days
  const avgEnergy = last7Days.reduce((sum, c) => sum + c.energy, 0) / last7Days.length;
  const chronicLowEnergy = last7Days.length >= 7 && avgEnergy < 4;
  
  // Pattern 4: Sleep quality ≤2 for 3+ days
  const poorSleepStreak = last3Days.length >= 3 && 
    last3Days.every(c => c.sleep?.quality <= 2);
  
  // Pattern 5: Pain ≥8 for 2+ consecutive days
  const last2Days = last3Days.slice(-2);
  const painFlare = last2Days.length >= 2 && 
    last2Days.every(c => c.conditions?.some(cond => cond.pain >= 8));
  
  return {
    detected: lowEnergyStreak || lowMoodStreak || chronicLowEnergy || poorSleepStreak || painFlare,
    patterns: {
      lowEnergyStreak,
      lowMoodStreak,
      chronicLowEnergy,
      poorSleepStreak,
      painFlare
    }
  };
}
```

### When Burnout Detected

1. Set flag: `flags.burnoutDetected = true`
2. Activate Recovery Mode: `flags.recoveryModeActive = true`
3. Coach response changes to burnout script
4. Session options limited to recovery only
5. Banner shown on dashboard until user exits recovery mode

### Exiting Recovery Mode

- User manually: "I'm feeling better" button
- Or: 2 consecutive days with energy ≥6 and mood ≥6

---

## High Pain Alert

### When Triggered
Any condition pain ≥8 in today's check-in.

### Response

1. Set flag: `flags.highPainAlert = true`
2. Coach acknowledges with care
3. Exercises affecting that area are blocked
4. Suggestion to rest that area
5. If 9-10: Suggest considering medical attention (gentle, not alarming)

### Coach Script (Pain 9-10)

**Steady:**
> "Your [condition] is severe today. Rest is the priority - no exercise for that area. If this level of pain is new or persists, it might be worth checking in with a professional. I'll be here when things settle."

---

## Low Mood Alert

### When Triggered
Mood ≤3 in today's check-in.

### Response

1. Set flag: `flags.lowMoodAlert = true`
2. Coach response extra gentle
3. Session recommendations favour mood-lifting activities
4. No pressure language
5. NOT: "Are you okay?" popups or crisis intervention (we're not a mental health app)

### Coach Script (Mood ≤3)

**Steady:**
> "I hear that today is hard. You don't have to do anything you don't want to. Sometimes just a few minutes of gentle movement helps - but if you'd rather rest, that's valid too. What feels right?"

**Nurturing:**
> "Thank you for being honest with me. Days like this are hard, and I want you to know that struggling doesn't make you weak. Would you like me to suggest something very gentle? Or would you rather just rest today? Either is okay."

---

# PART 6: DATA FLOW

## Check-in to Session Pipeline

```
CHECK-IN COMPLETE
        │
        ▼
┌───────────────────────┐
│   SAVE CHECK-IN       │
│   to localStorage     │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│   SAFETY CHECKS       │
│   - Burnout detection │
│   - High pain alert   │
│   - Low mood alert    │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│   GET TODAY'S PLAN    │
│   from programme      │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│   APPLY ADAPTATIONS   │
│   - Energy scaling    │
│   - Pain filtering    │
│   - Cycle adjustment  │
│   - Condition mods    │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│   GENERATE SESSION    │
│   options for today   │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│   PRESENT TO USER     │
│   with Coach intro    │
└───────────────────────┘
```

## Adaptation Rules Applied

### Energy-Based Scaling

| Energy | Adaptation |
|--------|------------|
| 1-2 | Recovery only. Offer 5-min gentle stretch. |
| 3-4 | Use easier variations. Reduce sets/reps by 30%. |
| 5-6 | Standard session, no changes. |
| 7-8 | Standard session, can suggest harder variations. |
| 9-10 | Full intensity. Suggest progressions if available. |

### Pain-Based Filtering

| Pain in Area | Adaptation |
|--------------|------------|
| 0-2 | All exercises available |
| 3-4 | Exercises available with "be mindful" note |
| 5-6 | Exercises available with modification suggestions |
| 7-8 | Exercises for that area shown with caution, alternatives offered |
| 9-10 | Exercises for that area BLOCKED |

### Mood-Based Adjustment

| Mood | Adaptation |
|------|------------|
| 1-3 | Suggest gentle, mood-lifting activities. No pressure. |
| 4-5 | Standard, with encouragement. |
| 6-10 | Standard session. |

### Menstrual Cycle Adjustment

| Phase | Adaptation |
|-------|------------|
| Menstruation (1-5) | Reduce intensity. Avoid high-impact. Suggest gentle options. |
| Follicular (6-14) | Standard to high intensity fine. Strength focus. |
| Ovulation (15-17) | Peak performance window. Challenge available. |
| Luteal (18-28+) | Moderate intensity. Steady-state preferred. |

---

# PART 7: ACCESSIBILITY

## WCAG 2.2 AA Compliance

### Screen Reader Support
- All sliders have aria-labels
- Current value announced: "Energy level 6 of 10, Decent - you've got this"
- Button states clearly indicated
- Skip links available

### Visual
- Colour not sole indicator (numbers + descriptions + colours)
- Contrast ratio ≥4.5:1 for all text
- Large touch targets (minimum 44x44px)
- Slider thumb large and visible

### Motor
- Can complete check-in with taps only (no drag required)
- Alternative to slider: tap directly on number
- Large buttons with adequate spacing

### Cognitive
- One question per screen
- Clear progress indication
- Consistent layout
- Plain language descriptions

---

# PART 8: TECHNICAL IMPLEMENTATION

## Check-in State Machine

```javascript
const checkInStates = {
  NOT_STARTED: 'not_started',
  GREETING: 'greeting',
  ENERGY: 'energy',
  MOOD: 'mood',
  SLEEP: 'sleep',
  CONDITIONS: 'conditions',
  MENSTRUAL: 'menstrual',
  SUMMARY: 'summary',
  COMPLETE: 'complete'
};

function getNextState(currentState, userProfile) {
  switch (currentState) {
    case 'not_started':
      return 'greeting';
    
    case 'greeting':
      return 'energy';
    
    case 'energy':
      return 'mood';
    
    case 'mood':
      if (userProfile.preferences.trackSleep) {
        return 'sleep';
      } else if (userProfile.conditions.length > 0) {
        return 'conditions';
      } else if (userProfile.personal?.menstrualTracking) {
        return 'menstrual';
      } else {
        return 'summary';
      }
    
    case 'sleep':
      if (userProfile.conditions.length > 0) {
        return 'conditions';
      } else if (userProfile.personal?.menstrualTracking) {
        return 'menstrual';
      } else {
        return 'summary';
      }
    
    case 'conditions':
      if (userProfile.personal?.menstrualTracking) {
        return 'menstrual';
      } else {
        return 'summary';
      }
    
    case 'menstrual':
      return 'summary';
    
    case 'summary':
      return 'complete';
    
    default:
      return 'not_started';
  }
}
```

## Component Structure

```
/js/views/checkin/
├── checkinController.js    # Main state machine
├── screens/
│   ├── greeting.js
│   ├── energy.js
│   ├── mood.js
│   ├── sleep.js
│   ├── conditions.js
│   ├── menstrual.js
│   └── summary.js
├── components/
│   ├── slider.js           # Reusable 1-10 slider
│   ├── quickSelect.js      # 3-option quick select
│   └── conditionRater.js   # Per-condition pain input
└── utils/
    ├── safetyChecks.js     # Burnout detection etc.
    └── adaptations.js      # Apply check-in to session
```

---

# PART 9: TESTING CHECKLIST

## Functional Tests

- [ ] Full check-in completes in under 60 seconds
- [ ] Energy slider/select works correctly
- [ ] Mood slider/select works correctly
- [ ] Sleep can be skipped
- [ ] Conditions only show if user has them
- [ ] Menstrual only shows if tracking enabled
- [ ] Coach summary reflects check-in data accurately
- [ ] Quick check-in works as alternative
- [ ] Update check-in works correctly
- [ ] Check-in saves to localStorage
- [ ] Check-in loads correctly on refresh

## Safety Tests

- [ ] Burnout detection triggers at correct thresholds
- [ ] Recovery mode activates when burnout detected
- [ ] High pain alert triggers at pain ≥8
- [ ] Low mood alert triggers at mood ≤3
- [ ] Blocked exercises don't appear when pain ≥9
- [ ] Coach scripts match safety flags

## Edge Cases

- [ ] First ever check-in (no history)
- [ ] Check-in with all conditions at pain 0
- [ ] Check-in with all conditions at pain 10
- [ ] Energy 1 + Mood 1 (minimum)
- [ ] Energy 10 + Mood 10 (maximum)
- [ ] Interrupted check-in (close app mid-flow)
- [ ] Multiple check-ins same day

## Accessibility Tests

- [ ] Screen reader announces all values correctly
- [ ] Keyboard navigation works
- [ ] Touch targets are 44x44px minimum
- [ ] Colour contrast passes WCAG AA
- [ ] Works with large text enabled
- [ ] Works with reduce motion enabled

---

# DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | Claude (with Graeme) | Initial check-in flow |

---

**This document defines the complete daily check-in experience for Alongside. All check-in screens should be built from this specification.**
