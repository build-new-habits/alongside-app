# ALONGSIDE: Onboarding Flow
## Complete Question Sequence & Logic v1.0 | January 2026

---

# PART 1: ONBOARDING PRINCIPLES

## Core Requirements

### ADHD-Friendly Design
- **Total time:** 3-5 minutes maximum
- **Progress visible:** Always show where they are
- **Save as you go:** Can quit and resume anytime
- **No typing required:** Taps and selections for 90% of input
- **Skip options:** Non-essential questions can be skipped
- **Instant value:** Something useful even if they quit early

### Psychological Safety
- **No judgement:** Every answer is valid
- **No "wrong" answers:** Questions framed as curiosity, not assessment
- **Validation:** Acknowledge difficult things (conditions, past failures)
- **Agency:** They can change anything later
- **Privacy:** Emphasise data stays on device

### Information Architecture
- **Progressive disclosure:** Start simple, get detailed only where needed
- **Branching logic:** Skip irrelevant questions based on earlier answers
- **Sensible defaults:** Pre-fill where possible
- **Smart ordering:** Most important first (in case they quit)

---

## What We Need to Capture

| Priority | Information | Why We Need It |
|----------|-------------|----------------|
| Critical | At least one goal | Can't build a plan without direction |
| Critical | Any serious conditions | Safety - must filter dangerous exercises |
| High | Equipment available | Determines what exercises are possible |
| High | Time availability | Determines session length and frequency |
| Medium | Fitness level | Calibrates starting intensity |
| Medium | Coach personality | Personalises experience |
| Low | Detailed schedule | Optimises training windows |
| Low | Preferences (music, voice, etc.) | Nice to have, can set later |

---

## Onboarding Structure

```
WELCOME (30 sec)
    │
    ▼
GOALS (60 sec)
    │
    ▼
CONDITIONS (60 sec, branching)
    │
    ▼
EQUIPMENT (45 sec)
    │
    ▼
TIME & SCHEDULE (45 sec)
    │
    ▼
COACH SELECTION (30 sec)
    │
    ▼
PLAN REVEAL (30 sec)
    │
    ▼
FIRST CHECK-IN → FIRST SESSION
```

**Total: ~4-5 minutes**

---

# PART 2: SCREEN-BY-SCREEN FLOW

## Screen 1: Welcome

### Purpose
Set the tone. Differentiate from other fitness apps. Build trust.

### Content

**Visual:** Warm, calm design. No aggressive fitness imagery.

**Coach speaks:**
> "Welcome to Alongside.
>
> I'm going to be your coach - not to push you, but to guide you.
>
> This app is different. No streaks. No shame. No 'no excuses.'
>
> Just movement that works for your body and your life.
>
> Let's spend a few minutes getting to know each other."

**Button:** "Let's start" →

### Data Captured
None yet.

### Accessibility
- Text size: Large
- Voice: Plays automatically (with mute option visible)
- Screen reader: Full text available

---

## Screen 2: What's Your Name?

### Purpose
Personalisation. Coach will use their name.

### Content

**Question:** "What should I call you?"

**Input:** Text field (single line)
- Placeholder: "Your first name"
- Auto-capitalise first letter
- Max 20 characters

**Button:** "Continue" →

**Skip option:** None (name is required for personalisation)

### Data Captured
```javascript
{ name: "Graeme" }
```

### Validation
- Not empty
- No numbers or special characters (gentle reminder, not error)

---

## Screen 3: Your Goals

### Purpose
Understand what they want to achieve. Critical for plan building.

### Content

**Coach speaks:**
> "What would you like to achieve?
>
> Pick what matters most to you. You can always add more later."

**Options:** (Multi-select, pick 1-3)

| Option | ID | Icon |
|--------|-----|------|
| Run or jog comfortably | goal-running | 🏃 |
| Lose weight | goal-weight-loss | ⚖️ |
| Get stronger | goal-strength | 💪 |
| Reduce pain or recover from injury | goal-recovery | 🩹 |
| Feel more flexible | goal-flexibility | 🧘 |
| Improve mental wellbeing | goal-mental | 🧠 |
| Stay injury-free for sport | goal-injury-prevention | 🏆 |
| Build a consistent habit | goal-consistency | 📅 |
| Look more toned | goal-appearance | ✨ |
| Something else | goal-other | ❓ |

**If "Something else" selected:**
- Text field appears: "Tell me more (optional)"

**Button:** "Continue" →

**Minimum selection:** 1

### Data Captured
```javascript
{ 
  goals: ["goal-running", "goal-recovery", "goal-weight-loss"],
  goalNotes: "" // If "other" selected
}
```

### Branching Logic
- If "Reduce pain or recover from injury" selected → Will ask detailed condition questions
- If "Run or jog comfortably" selected → Will ask about running experience later
- If "Lose weight" selected → Will set up weight tracking

---

## Screen 4: Goal Details (Conditional)

### Purpose
Get specifics for selected goals. Only shows relevant questions.

### Content varies by goal selected:

#### If "Run or jog comfortably" selected:

**Coach speaks:**
> "Tell me about your running goal."

**Question 1:** "What would feel like success?"

| Option | ID |
|--------|-----|
| Run for 20-30 minutes comfortably | run-20-30 |
| Run for 30-45 minutes comfortably | run-30-45 |
| Run a 5K (3.1 miles) | run-5k |
| Run a 10K (6.2 miles) | run-10k |
| Just run without pain | run-pain-free |
| Something else | run-other |

**Question 2:** "How's your running currently?"

| Option | ID |
|--------|-----|
| I can't run at all right now | run-level-none |
| I can run a few minutes before stopping | run-level-beginner |
| I can run 10-15 minutes | run-level-some |
| I can run 20+ minutes but want more | run-level-moderate |

---

#### If "Lose weight" selected:

**Coach speaks:**
> "Let's understand your weight goal."

**Question 1:** "What's your current weight?" (Optional)

- Number input with unit toggle (kg / st-lb)
- "I'd rather not say" option

**Question 2:** "What's your target?" (Optional)

- Number input OR
- "Lose a bit" / "Lose a moderate amount" / "Lose a significant amount" / "Not sure"

**Note to user:**
> "This is just to help me understand your goal. We won't obsess over numbers."

---

#### If "Reduce pain or recover from injury" selected:

**Coach speaks:**
> "I want to help you safely. Tell me what your body is dealing with."

→ Goes to detailed Conditions screen (Screen 5)

---

### Data Captured
```javascript
{
  goalDetails: {
    running: { target: "run-30-45", currentLevel: "run-level-beginner" },
    weightLoss: { current: 80, target: 70, unit: "kg" }
  }
}
```

---

## Screen 5: Conditions - Overview

### Purpose
Identify any conditions that affect exercise safety.

### Content

**Coach speaks:**
> "Is your body dealing with anything I should know about?
>
> Old injuries, chronic conditions, areas that need extra care.
>
> This keeps you safe."

**Question:** "Do you have any injuries or conditions?"

| Option | Action |
|--------|--------|
| Yes | → Go to detailed condition entry |
| No, I'm all good | → Skip to Equipment |
| I'd rather not say | → Skip to Equipment (flag for caution) |

### Data Captured
```javascript
{ hasConditions: true | false | "undisclosed" }
```

### Safety Note
If "I'd rather not say" - system will:
- Not filter any exercises by default
- Show more "listen to your body" messaging
- Offer to revisit this later

---

## Screen 5b: Conditions - Body Area Selection

### Purpose
Identify which body areas are affected.

### Content

**Visual:** Simple body outline (front and back view)

**Coach speaks:**
> "Tap anywhere that's giving you trouble."

**Selectable areas:**

| Area | ID |
|------|-----|
| Neck | neck |
| Shoulder (L) | shoulder-left |
| Shoulder (R) | shoulder-right |
| Upper back | upper-back |
| Lower back | lower-back |
| Hip (L) | hip-left |
| Hip (R) | hip-right |
| Knee (L) | knee-left |
| Knee (R) | knee-right |
| Ankle (L) | ankle-left |
| Ankle (R) | ankle-right |
| Wrist (L) | wrist-left |
| Wrist (R) | wrist-right |
| Other | other |

**Multi-select allowed**

**Button:** "Continue" → (Goes to detail screen for first selected area)

### Data Captured
```javascript
{ conditionAreas: ["lower-back", "hip-right", "hamstring-right"] }
```

### Accessibility
- Tap targets minimum 44×44px
- Colour not sole indicator (icons + labels)
- List alternative to body map available

---

## Screen 5c: Condition Details (Per Area)

### Purpose
Get specific information about each condition.

### Content (repeats for each selected area)

**Progress:** "Condition 1 of 3"

**Coach speaks:**
> "Tell me about your [lower back]."

**Question 1:** "What's the issue?"

Options vary by body area. For lower back:

| Option | ID |
|--------|-----|
| Herniated/bulging disc | disc-herniation |
| Muscle strain | muscle-strain |
| Sciatica | sciatica |
| General pain/stiffness | general-pain |
| Arthritis | arthritis |
| Post-surgery | post-surgery |
| Something else | other |

**Question 2:** "How long have you had this?"

| Option | ID |
|--------|-----|
| Less than 2 weeks | acute |
| 2-6 weeks | subacute |
| 6 weeks - 6 months | recovering |
| More than 6 months | chronic |

**Question 3:** "On a typical day, how much does it bother you?"

| Rating | Description |
|--------|-------------|
| 0-2 | Barely notice it |
| 3-4 | Noticeable but manageable |
| 5-6 | Affects what I can do |
| 7-8 | Significantly limiting |
| 9-10 | Severe - need medical attention |

**Slider: 0-10**

**Question 4:** "Any specific triggers I should know about?" (Optional)

- Text field
- Examples shown: "sitting too long", "running", "twisting"

**Button:** "Next" → (or "Done with conditions" if last one)

### Data Captured
```javascript
{
  conditions: [
    {
      id: "condition-1",
      area: "lower-back",
      side: null,
      type: "disc-herniation",
      duration: "chronic",
      typicalPain: 4,
      triggers: "sitting too long, running"
    }
  ]
}
```

### Branching Logic
- If pain 8+ → Show message: "That sounds difficult. We'll be very careful with this area. If you haven't seen a professional recently, it might be worth checking in with them."
- If "acute" and high pain → Suggest medical review before starting exercise programme

---

## Screen 6: Equipment

### Purpose
Know what exercises are possible.

### Content

**Coach speaks:**
> "What equipment do you have access to?
>
> Don't worry if it's not much - you can do a lot with just your body."

**Options:** (Multi-select)

**Basics:**
| Option | ID | Icon |
|--------|-----|------|
| Exercise mat | mat | 🟦 |
| Cushion or pillow | cushion | 🛋️ |
| Chair | chair | 🪑 |
| Wall space | wall | 🧱 |
| Stairs | stairs | 🪜 |

**Weights:**
| Option | ID | Icon |
|--------|-----|------|
| Dumbbells | dumbbells | 🏋️ |
| Kettlebell | kettlebell | 🔔 |
| Barbell | barbell | 🏋️ |
| Resistance bands | resistance-band | 🔗 |
| Ankle weights | ankle-weights | ⚖️ |

**Cardio:**
| Option | ID | Icon |
|--------|-----|------|
| Outdoor running/walking access | outdoor | 🌳 |
| Treadmill | treadmill | 🏃 |
| Exercise bike | bike | 🚴 |
| Skipping rope | skipping-rope | ➰ |

**Specialist:**
| Option | ID | Icon |
|--------|-----|------|
| Foam roller | foam-roller | 🧻 |
| Massage gun | massage-gun | 🔫 |
| Wobble board | wobble-board | ⚖️ |
| Step platform | step-platform | 📦 |
| Pull-up bar | pullup-bar | 🏗️ |
| Yoga blocks | yoga-blocks | 🧱 |

**Default selected:** mat, outdoor (most common)

**Button:** "Continue" →

**Skip option:** "I'll do bodyweight only" → Selects nothing

### Data Captured
```javascript
{ 
  equipment: ["mat", "dumbbells", "foam-roller", "massage-gun", "wobble-board", "step-platform", "outdoor"]
}
```

---

## Screen 7: Time Availability

### Purpose
Understand realistic session frequency and duration.

### Content

**Coach speaks:**
> "How much time can you realistically give to movement each week?
>
> Be honest - I'd rather work with reality than set you up to fail."

**Question 1:** "How many days per week can you exercise?"

| Option | ID |
|--------|-----|
| 2-3 days | freq-2-3 |
| 4-5 days | freq-4-5 |
| 6-7 days | freq-6-7 |
| It varies a lot | freq-variable |

**Question 2:** "How long per session?"

| Option | ID |
|--------|-----|
| 10-15 minutes | duration-15 |
| 20-30 minutes | duration-30 |
| 30-45 minutes | duration-45 |
| 45-60 minutes | duration-60 |
| It depends on the day | duration-variable |

**Question 3:** "When do you prefer to exercise?" (Optional)

| Option | ID |
|--------|-----|
| Morning (before work/commitments) | time-morning |
| Lunchtime | time-lunch |
| Afternoon | time-afternoon |
| Evening | time-evening |
| Whenever I can | time-flexible |

**Button:** "Continue" →

### Data Captured
```javascript
{
  availability: {
    frequency: "freq-4-5",
    duration: "duration-30",
    preferredTime: "time-morning"
  }
}
```

---

## Screen 8: Detailed Schedule (Optional)

### Purpose
Identify specific training windows.

### Content

**Coach speaks:**
> "Want to tell me about your weekly schedule?
>
> This helps me find the best times for your sessions."

**Options:**
- "Yes, let me show you" → Goes to schedule entry
- "No, keep it flexible" → Skip to Coach Selection

### If yes - Schedule Entry:

**For each day (Mon-Sun):**

Visual: Timeline for the day (6am - 10pm)

**Question:** "When are you busy on [Monday]?"

- Tap to add commitment blocks
- Each block: Start time, End time, Label (optional)
- Common presets: "Work 9-5", "School run", "Childcare"

**Or simplified version:**

| Day | Free Windows |
|-----|--------------|
| Monday | Morning ☐ Lunch ☐ Afternoon ☐ Evening ☐ |
| Tuesday | Morning ☐ Lunch ☐ Afternoon ☐ Evening ☐ |
| ... | ... |

**Button:** "Continue" →

### Data Captured
```javascript
{
  schedule: {
    monday: { commitments: [{start: "08:30", end: "16:30", label: "Work"}], freeWindows: ["morning", "evening"] },
    // ... etc
  }
}
```

---

## Screen 9: Coach Personality

### Purpose
Let user choose their coaching style.

### Content

**Coach speaks:**
> "One more thing - how would you like me to coach you?
>
> Everyone responds differently. Pick what feels right."

**Options:** (Single select, visual cards)

### Option A: Steady (Default)
**Preview voice clip available**
> "Calm and reassuring. I'll explain the why, keep things grounded, and never push too hard."

**Best for:** Anxiety, perfectionism, injury recovery, general preference

### Option B: Energetic
**Preview voice clip available**
> "Upbeat and motivating. I'll celebrate your wins and bring the energy when yours is low."

**Best for:** Need external motivation, enjoy encouragement, low-activation ADHD

### Option C: Minimal
**Preview voice clip available**
> "Direct and efficient. Less talk, more action. I trust you to know what you need."

**Best for:** Experienced exercisers, sensory sensitivity, prefer less input

### Option D: Nurturing
**Preview voice clip available**
> "Gentle and emotionally attuned. I'll check in on how you're really doing and never rush you."

**Best for:** Trauma history, chronic illness, high self-criticism, need extra gentleness

**Button:** "Continue" →

**Note:** "You can change this anytime in settings."

### Data Captured
```javascript
{ coachPersonality: "steady" }
```

---

## Screen 10: Accessibility Preferences (Optional)

### Purpose
Ensure the app works for their needs.

### Content

**Coach speaks:**
> "Any accessibility needs I should know about?"

**Options:** (Multi-select toggles)

| Option | ID | Default |
|--------|-----|---------|
| Larger text | text-large | Off |
| High contrast mode | high-contrast | Off |
| Reduce motion/animations | reduce-motion | Off |
| Screen reader optimised | screen-reader | Off |
| Voice output enabled | voice-enabled | On |

**Button:** "Continue" →

**Skip option:** "Use defaults" → Skip to Plan Reveal

### Data Captured
```javascript
{
  accessibility: {
    textSize: "large",
    highContrast: false,
    reduceMotion: false,
    screenReaderOptimised: false,
    voiceEnabled: true
  }
}
```

---

## Screen 11: Plan Reveal

### Purpose
Show them what the Coach has built. Create buy-in.

### Content

**Visual:** Plan summary card

**Coach speaks (Steady personality example):**
> "Based on what you've shared, here's what I'm thinking.
>
> Your main goals are [running comfortably] and [recovering from your back and hamstring issues]. To get there safely, we need to build a foundation first.
>
> I've put together a plan:
>
> **Phase 1: Foundation (Weeks 1-4)**
> Focus on [hip mobility], [core stability], and [hamstring rehab]. No running yet - we're building what you need to run safely.
>
> **Phase 2: Build (Weeks 5-8)**
> Add [light jogging] as your hamstring allows. Continue strength work.
>
> **Phase 3: Progress (Weeks 9-12)**
> Build your running duration toward your goal.
>
> This isn't rigid. If something doesn't feel right, we adjust. You're in charge - I'm just here to guide.
>
> Ready to start?"

**Buttons:**
- "Let's go" → First Check-in
- "Adjust something" → Returns to relevant section

### Data Captured
```javascript
{
  onboardingComplete: true,
  onboardingCompletedAt: "2026-01-27T07:30:00Z",
  plan: {
    // Generated plan structure
  }
}
```

---

## Screen 12: First Check-in

### Purpose
Capture today's state and deliver first session.

### Content

**Coach speaks:**
> "Let's see how you're feeling today so I can set up your first session."

→ Standard daily check-in flow (see Architecture doc)

**After check-in:**

**Coach speaks:**
> "Great. Based on how you're feeling, here's your first session.
>
> [Session name]: [duration] minutes
>
> [Brief description of what and why]
>
> Ready?"

**Button:** "Start session" →

---

# PART 3: BRANCHING LOGIC SUMMARY

## Decision Tree

```
START
  │
  ├── Welcome
  │
  ├── Name (required)
  │
  ├── Goals (required, multi-select)
  │     │
  │     ├── If "Running" selected → Running details
  │     ├── If "Weight loss" selected → Weight details
  │     ├── If "Recovery/pain" selected → Conditions flow
  │     └── Other goals → Note optional specifics
  │
  ├── Conditions
  │     │
  │     ├── "Yes" → Body map → Detail per area
  │     ├── "No" → Skip to Equipment
  │     └── "Rather not say" → Skip (flagged)
  │
  ├── Equipment (defaults pre-selected)
  │
  ├── Time Availability (required)
  │     │
  │     └── "Want to add detailed schedule?" 
  │           ├── Yes → Schedule entry
  │           └── No → Skip
  │
  ├── Coach Personality (default: Steady)
  │
  ├── Accessibility (optional, skip available)
  │
  ├── Plan Reveal
  │     │
  │     ├── "Let's go" → First Check-in
  │     └── "Adjust" → Back to relevant section
  │
  └── First Check-in → First Session
```

---

## Skip Logic

| Screen | Can Skip? | What Happens If Skipped |
|--------|-----------|------------------------|
| Welcome | No | - |
| Name | No | Required for personalisation |
| Goals | No | At least 1 required |
| Goal Details | Partially | Uses defaults/asks later |
| Conditions | Yes | No exercise filtering (more "listen to body" prompts) |
| Condition Details | Yes per condition | Treats as "general pain" with caution |
| Equipment | Yes | Assumes bodyweight only |
| Time | No | Need to know session length at minimum |
| Schedule | Yes | Coach won't identify specific windows |
| Coach Personality | Yes | Defaults to Steady |
| Accessibility | Yes | Uses system defaults |
| Plan Reveal | No | Must see plan before starting |

---

## Resume Logic

If user quits during onboarding:

1. All completed screens are saved
2. On return, show: "Welcome back. Let's continue where you left off."
3. Jump to first incomplete screen
4. Option to "Start over" available

---

# PART 4: DATA VALIDATION

## Required Fields

| Field | Validation |
|-------|------------|
| name | Not empty, 1-20 characters |
| goals | At least 1 selected |
| availability.frequency | One option selected |
| availability.duration | One option selected |

## Optional But Recommended

| Field | Default If Missing |
|-------|-------------------|
| coachPersonality | "steady" |
| equipment | ["mat", "outdoor"] |
| conditions | [] (empty - no filtering) |
| schedule | null (flexible) |
| accessibility | System defaults |

## Condition Safety Validation

| Condition | Auto-Action |
|-----------|-------------|
| Any pain ≥8 | Show medical advice prompt |
| "Acute" + high pain | Suggest medical clearance first |
| "Post-surgery" | Ask how long ago, apply restrictions |
| Multiple high-severity conditions | Flag for extra caution in all sessions |

---

# PART 5: UI/UX SPECIFICATIONS

## Visual Design Principles

- **Calm, not aggressive** - No "CRUSH IT" energy
- **Warm colours** - Greens, soft blues, cream backgrounds
- **Generous whitespace** - Not overwhelming
- **One question per screen** - Focus, no cognitive overload
- **Progress indicator** - Always visible (dots or bar)
- **Large tap targets** - Minimum 44×44px, ideally larger

## Progress Indicator

```
○ ○ ○ ● ○ ○ ○ ○ ○ ○
        ↑
    Current screen
```

Or:

```
[=====>          ] Step 4 of 10
```

## Animation

- Subtle transitions between screens (slide or fade)
- No bouncing, flashing, or attention-grabbing animation
- Respect "reduce motion" preference
- Loading states should be calm (pulsing dot, not spinner)

## Typography

- Headings: Clear, readable, not shouty
- Body: Comfortable reading size (16px minimum)
- Coach voice: Slightly different treatment (could be italic or different colour)

## Buttons

- Primary action: Filled, obvious
- Secondary action: Outlined or text
- Back button: Always available (except welcome)
- Skip: Text link, not prominent but visible

---

# PART 6: VOICE INTEGRATION

## When Voice Plays

| Screen | Voice Plays? |
|--------|--------------|
| Welcome | Yes - full Coach intro |
| Name | No - just visual |
| Goals | Yes - brief prompt |
| Goal Details | No - just visual |
| Conditions overview | Yes - brief prompt |
| Condition details | No - just visual |
| Equipment | No - just visual |
| Time | Yes - brief prompt |
| Schedule | No - just visual |
| Coach Personality | Yes - preview clips for each |
| Accessibility | No - just visual |
| Plan Reveal | Yes - full plan explanation |
| First Check-in | Yes - standard check-in |

## Voice Controls

- Mute button always visible
- "Read aloud" option for non-voice screens
- Voice preference saved and applied throughout app

---

# PART 7: ERROR HANDLING

## Validation Errors

- Inline, not popup
- Gentle language: "Oops, I need at least one goal to help you" not "Error: Selection required"
- Clear how to fix

## Technical Errors

- Save progress frequently (after each screen)
- If data fails to save: "Having trouble saving. Your answers are safe - let's try again."
- Offline handling: Continue onboarding, sync when back online

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User selects all conditions | Allow, but show: "That's a lot to manage. We'll take it slowly and be very careful." |
| User selects no equipment | "No problem - bodyweight exercise is powerful. We'll work with what you have." |
| User says they can only exercise 1 day/week | Accept. "One day is enough to build a habit. Let's make it count." |
| User pain is 10/10 right now | "If you're in severe pain right now, please prioritise rest or medical attention. I'll be here when you're ready." |

---

# PART 8: POST-ONBOARDING

## What Gets Generated

After onboarding completes, the system generates:

### 1. User Profile
Complete profile object with all captured data.

### 2. Goal Objects
Structured goals with decomposition (see Architecture doc).

### 3. Initial Plan
- Phase 1 focus areas
- Recommended programmes/templates
- Session frequency and timing
- First week's sessions

### 4. Coach Calibration
- Personality locked in
- Script variants selected
- Voice files loaded

### 5. Safety Profile
- Conditions mapped to exercise filters
- Pain thresholds set
- Contraindicated exercises flagged

---

## First Session Selection

Based on:
1. First check-in data (energy, mood, pain)
2. Goals and conditions
3. Available time
4. Equipment

Typical first sessions by goal:

| Primary Goal | First Session |
|--------------|---------------|
| Running | Hip Mobility + Activation (15 min) |
| Weight loss | Full Body Energiser (20 min) |
| Recovery/pain | Gentle Mobility + Breathing (15 min) |
| Strength | Movement Assessment + Light Strength (20 min) |
| Flexibility | Flexibility Flow (20 min) |
| Mental wellbeing | Mindful Movement + Breathing (15 min) |

---

## Settings Access

After onboarding, user can change:
- Coach personality
- Equipment
- Add/edit conditions
- Update schedule
- Accessibility options
- Goals (add new, modify existing)

All in Settings, clearly accessible.

---

# PART 9: TESTING CHECKLIST

## Functional Tests

- [ ] Can complete full onboarding in under 5 minutes
- [ ] Can quit and resume at any point
- [ ] All skip options work correctly
- [ ] Branching logic follows correct paths
- [ ] Data saves correctly at each step
- [ ] Plan generates appropriately based on inputs
- [ ] First session matches profile

## Accessibility Tests

- [ ] All screens keyboard navigable
- [ ] All elements have appropriate labels
- [ ] Colour contrast meets WCAG 2.2 AA
- [ ] Touch targets ≥44×44px
- [ ] Works with screen reader
- [ ] Reduce motion preference respected
- [ ] Large text mode works

## Edge Case Tests

- [ ] No conditions selected → No exercise filtering
- [ ] No equipment selected → Bodyweight plan generated
- [ ] Pain 10/10 selected → Medical advice shown
- [ ] All goals selected → Reasonable plan still generated
- [ ] Minimum viable input → Still generates usable plan

## Voice Tests

- [ ] Voice plays where specified
- [ ] Mute works
- [ ] Preview clips play on Coach selection
- [ ] Voice setting persists

---

# DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | Claude (with Graeme) | Initial onboarding flow |

---

**This document defines the complete onboarding experience for Alongside. All onboarding screens should be built from this specification.**
