# ALONGSIDE: Schedule Intelligence System
## How the Coach Finds Your Exercise Windows | January 2026

---

# PART 1: GRAEME'S SCHEDULE ANALYSIS

## Weekly Overview

| Day | Type | Wake | Work End | Evening Commitments | Dinner | Realistic Exercise Windows |
|-----|------|------|----------|---------------------|--------|---------------------------|
| Mon | WFH | 6:45 | 17:00 | Tennis 19:00-20:30 | 20:30 | **Lunch (12:30-14:00)**, Morning (6:45-8:00) |
| Tue | Office | 6:15 | 16:30 | Football/Athletics 18:30-20:00 | 20:30 | **Already exercising** (football/run) |
| Wed | Office | 6:15 | 16:30 | Taxi service 17:45-19:30 | 19:45 | ❌ No realistic slot |
| Thu | Office | 6:15 | 16:30 | Piano+Athletics taxi 17:30-20:00 | 20:30 | ❌ No realistic slot |
| Fri | WFH | 6:45 | 16:30 | Shopping+pickup 17:00-17:30 | 18:30 | **Lunch (12:30-14:00)**, Morning (6:45-8:00) |
| Sat | Weekend | 7:30 | - | Tennis 14:00-16:00 | 18:30 | **Already exercising** (tennis), Morning (8:00-10:00) |
| Sun | Weekend | 7:30 | - | Football watching 14:00-17:30 | ~18:30 | **Morning (8:00-11:00)**, Before football |

---

## Your Current Exercise (Already Happening)

| Day | Activity | Duration | Type |
|-----|----------|----------|------|
| Mon | Cardio Tennis | 90 min | Cardio + Agility |
| Tue | Football OR Run | 60-90 min | Cardio + HIIT |
| Sat | Tennis | 120 min | Cardio + Agility |

**You're already doing 3 days of cardio-focused activity.** 

This is great - but based on your hip/hamstring recovery goals, what's missing is:
- **Targeted mobility/rehab work** (hip flexors, hamstrings)
- **Core stability** (supports back and running)
- **Strength work** (injury prevention)

---

## Realistic Additional Slots

### Tier 1: High Confidence (Easy to Fit)

| Slot | Day | Time | Duration | Why It Works |
|------|-----|------|----------|--------------|
| **WFH Lunch Run** | Mon | 12:30-13:30 | 30-45 min | You identified this. Shower at home. |
| **WFH Lunch Run** | Fri | 12:30-13:30 | 30-45 min | Same logic. |
| **Sunday Morning** | Sun | 9:00-10:00 | 30-60 min | Before Sarah/Anna go to gym. House is quiet. |

### Tier 2: Moderate Confidence (Requires Intention)

| Slot | Day | Time | Duration | Why It Could Work |
|------|-----|------|----------|-------------------|
| **WFH Morning** | Mon | 7:00-7:45 | 20-30 min | Before breakfast prep. Short session only. |
| **WFH Morning** | Fri | 7:00-7:45 | 20-30 min | Same. Resistance bands at home. |
| **Saturday Morning** | Sat | 8:30-9:30 | 30-45 min | Before housework. Mobility/strength focus. |

### Tier 3: Low Confidence (Life Gets in the Way)

| Slot | Day | Time | Why It's Risky |
|------|-----|------|----------------|
| Office mornings | Tue-Thu | 6:15-6:45 | Only 30 min before leaving. You'd need to wake earlier. |
| Wednesday evening | Wed | After 19:30 | Too close to dinner, you're already exhausted from taxi runs. |
| Thursday evening | Thu | After 20:30 | Post-dinner. You said you prefer not to exercise after eating. |

---

## Recommended Weekly Structure

Based on your goals (hip recovery, hamstring rehab, return to running) and schedule:

| Day | Activity | Time | Type | Duration |
|-----|----------|------|------|----------|
| **Mon** | Lunch Run (easy pace) | 12:30 | Cardio | 30-40 min |
| **Mon** | Cardio Tennis | 19:00 | External | 90 min |
| **Tue** | Football/Run | 19:00 | External | 60-90 min |
| **Wed** | REST | - | Recovery | - |
| **Thu** | REST | - | Recovery | - |
| **Fri** | Lunch: Mobility + Core | 12:30 | Rehab/Strength | 30-40 min |
| **Sat** | Morning: Hip Rehab | 8:30 | Rehab | 20-30 min |
| **Sat** | Tennis | 14:00 | External | 120 min |
| **Sun** | Morning: Strength + Mobility | 9:00 | Strength | 30-45 min |

### Why This Works

1. **Wednesday and Thursday are protected** - Your schedule is genuinely full
2. **Lunch runs on WFH days** - Your own insight, validated
3. **Friday lunch is rehab, not cardio** - You're already doing cardio Mon+Tue
4. **Saturday morning before tennis** - Hip prep work benefits tennis
5. **Sunday is your main Alongside session** - Longest available window, freshest energy
6. **Rest days are intentional** - Not failures, part of the plan

---

# PART 2: SCHEDULE DATA SCHEMA

## User Schedule Input

```json
{
  "schedule": {
    "userId": "user_graeme_001",
    "updatedAt": "2026-01-27T20:00:00Z",
    "timezone": "Europe/London",
    
    "weeklyPattern": {
      "monday": {
        "workType": "wfh",
        "wake": "06:45",
        "workStart": "08:00",
        "workEnd": "17:00",
        "lunch": { "start": "12:30", "duration": 90 },
        "commitments": [
          {
            "name": "Cardio Tennis",
            "start": "19:00",
            "end": "20:30",
            "type": "exercise",
            "exerciseType": "cardio"
          }
        ],
        "dinner": "20:30",
        "bed": "22:00",
        "preferences": {
          "noExerciseAfterDinner": true
        }
      },
      
      "tuesday": {
        "workType": "office",
        "wake": "06:15",
        "commute": { "leave": "07:30", "arrive": "08:30", "returnLeave": "16:30", "returnArrive": "17:30" },
        "workStart": "08:30",
        "workEnd": "16:30",
        "lunch": { "start": "12:30", "duration": 30 },
        "commitments": [
          {
            "name": "Football OR Athletics taxi",
            "start": "18:30",
            "end": "20:30",
            "type": "exercise-or-commitment",
            "alternatives": ["football", "athletics-taxi"],
            "exerciseType": "cardio"
          }
        ],
        "dinner": "20:30",
        "bed": "22:00"
      },
      
      "wednesday": {
        "workType": "office",
        "wake": "06:15",
        "commute": { "leave": "07:30", "arrive": "08:30", "returnLeave": "16:30", "returnArrive": "17:30" },
        "workStart": "08:30",
        "workEnd": "16:30",
        "lunch": { "start": "12:30", "duration": 30 },
        "commitments": [
          { "name": "Martha to dance", "start": "17:45", "end": "18:45", "type": "family" },
          { "name": "Sarah+Anna gym drop/pickup", "start": "18:10", "end": "19:00", "type": "family" },
          { "name": "Martha pickup", "start": "18:45", "end": "19:00", "type": "family" },
          { "name": "Gym pickup", "start": "19:00", "end": "19:30", "type": "family" }
        ],
        "dinner": "19:45",
        "bed": "22:00",
        "flags": ["no-exercise-day"]
      },
      
      "thursday": {
        "workType": "office",
        "wake": "06:15",
        "commute": { "leave": "07:30", "arrive": "08:30", "returnLeave": "16:30", "returnArrive": "17:30" },
        "workStart": "08:30",
        "workEnd": "16:30",
        "lunch": { "start": "12:30", "duration": 30 },
        "commitments": [
          { "name": "Martha piano pickup", "start": "17:30", "end": "18:15", "type": "family" },
          { "name": "Girls to athletics", "start": "18:15", "end": "20:00", "type": "family" },
          { "name": "Athletics pickup", "start": "20:00", "end": "20:30", "type": "family" }
        ],
        "dinner": "20:30",
        "bed": "22:00",
        "flags": ["no-exercise-day"]
      },
      
      "friday": {
        "workType": "wfh",
        "wake": "06:45",
        "workStart": "08:00",
        "workEnd": "16:30",
        "lunch": { "start": "12:30", "duration": 90 },
        "commitments": [
          { "name": "Shopping", "start": "17:00", "end": "17:30", "type": "errand" },
          { "name": "Pickup Sarah", "start": "17:30", "end": "18:00", "type": "family" }
        ],
        "dinner": "18:30",
        "bed": "22:00"
      },
      
      "saturday": {
        "workType": "weekend",
        "wake": "07:30",
        "commitments": [
          { "name": "Anna+Sarah to athletics", "start": "10:00", "end": "12:30", "type": "family" },
          { 
            "name": "Tennis", 
            "start": "14:00", 
            "end": "16:00", 
            "type": "exercise",
            "exerciseType": "cardio",
            "includesTravel": true,
            "travelTime": 30
          }
        ],
        "lunch": { "start": "12:30", "duration": 60 },
        "dinner": "18:30",
        "bed": "22:00"
      },
      
      "sunday": {
        "workType": "weekend",
        "wake": "07:30",
        "commitments": [
          { "name": "Sarah+Anna gym", "start": "11:00", "end": "12:30", "type": "family" },
          { "name": "Watch football", "start": "14:00", "end": "17:30", "type": "leisure" }
        ],
        "lunch": { "start": "13:00", "duration": 60 },
        "dinner": "18:30",
        "bed": "22:00"
      }
    },
    
    "globalPreferences": {
      "noExerciseAfterDinner": true,
      "preferredExerciseTimes": ["lunch", "morning"],
      "minimumSessionLength": 20,
      "maximumSessionLength": 60,
      "needsShowerAfter": ["running", "hiit", "cardio"],
      "canShowerAt": ["home"],
      "workFromHomeDays": ["monday", "friday"]
    }
  }
}
```

---

## Equipment Data

```json
{
  "equipment": {
    "userId": "user_graeme_001",
    "available": [
      {
        "id": "resistance-bands",
        "name": "Resistance Bands",
        "location": "home",
        "types": ["light", "medium", "heavy"]
      },
      {
        "id": "stretch-bands",
        "name": "Stretch Bands",
        "location": "home"
      },
      {
        "id": "plyo-box",
        "name": "Plyo Box",
        "location": "home",
        "height": "medium"
      },
      {
        "id": "mat",
        "name": "Exercise Mat",
        "location": "home"
      }
    ],
    "notAvailable": [
      "dumbbells",
      "barbell",
      "kettlebell",
      "pull-up-bar",
      "gym-machines"
    ]
  }
}
```

---

# PART 3: SLOT DETECTION ALGORITHM

## How the Coach Finds Exercise Windows

```javascript
// js/engines/scheduleAnalyser.js

const ScheduleAnalyser = {
  
  // Minimum slot duration (minutes)
  MIN_SLOT: 20,
  
  // Buffer before commitments (minutes)
  BUFFER_BEFORE: 15,
  
  // Buffer after waking (minutes)
  WAKE_BUFFER: 15,
  
  // Find all possible exercise slots for a day
  findSlots(daySchedule, preferences) {
    const slots = [];
    
    // Skip if flagged as no-exercise day
    if (daySchedule.flags?.includes('no-exercise-day')) {
      return [{
        type: 'rest',
        reason: 'Scheduled commitments leave no realistic window',
        editable: true
      }];
    }
    
    // Check for existing exercise commitments
    const existingExercise = daySchedule.commitments?.filter(
      c => c.type === 'exercise' || c.type === 'exercise-or-commitment'
    );
    
    if (existingExercise?.length > 0) {
      existingExercise.forEach(ex => {
        slots.push({
          type: 'existing',
          name: ex.name,
          start: ex.start,
          end: ex.end,
          exerciseType: ex.exerciseType,
          countsAsExercise: true
        });
      });
    }
    
    // 1. Morning slot (after wake, before work/commitments)
    const morningSlot = this.findMorningSlot(daySchedule, preferences);
    if (morningSlot) slots.push(morningSlot);
    
    // 2. Lunch slot (WFH days only, or long lunch)
    const lunchSlot = this.findLunchSlot(daySchedule, preferences);
    if (lunchSlot) slots.push(lunchSlot);
    
    // 3. After-work slot (before dinner/commitments)
    const eveningSlot = this.findEveningSlot(daySchedule, preferences);
    if (eveningSlot) slots.push(eveningSlot);
    
    return slots;
  },
  
  // Morning slot detection
  findMorningSlot(day, prefs) {
    const wake = this.parseTime(day.wake);
    const firstCommitment = this.getFirstCommitment(day);
    
    // Add wake buffer
    const availableStart = wake + this.WAKE_BUFFER;
    
    // End before first commitment (with buffer) or work start
    let availableEnd;
    if (day.workType === 'office' && day.commute) {
      availableEnd = this.parseTime(day.commute.leave) - this.BUFFER_BEFORE;
    } else if (day.workStart) {
      availableEnd = this.parseTime(day.workStart) - this.BUFFER_BEFORE;
    } else if (firstCommitment) {
      availableEnd = this.parseTime(firstCommitment.start) - this.BUFFER_BEFORE;
    } else {
      availableEnd = this.parseTime('12:00'); // Default morning end
    }
    
    const duration = availableEnd - availableStart;
    
    if (duration >= this.MIN_SLOT) {
      return {
        type: 'morning',
        start: this.formatTime(availableStart),
        end: this.formatTime(availableEnd),
        duration: duration,
        confidence: duration >= 45 ? 'high' : duration >= 30 ? 'medium' : 'low',
        constraints: this.getMorningConstraints(day, duration),
        recommended: day.workType === 'weekend' || duration >= 40
      };
    }
    
    return null;
  },
  
  // Lunch slot detection
  findLunchSlot(day, prefs) {
    if (!day.lunch) return null;
    
    const lunchStart = this.parseTime(day.lunch.start);
    const lunchDuration = day.lunch.duration;
    const lunchEnd = lunchStart + lunchDuration;
    
    // Only viable if:
    // 1. WFH (can shower) OR
    // 2. Long lunch (60+ min) AND no shower needed for planned activity
    const canShower = day.workType === 'wfh' || day.workType === 'weekend';
    
    if (!canShower && lunchDuration < 60) {
      return null;
    }
    
    // Available for exercise (need time to eat too)
    const exerciseTime = Math.min(lunchDuration - 30, 45); // Save 30 min for eating
    
    if (exerciseTime >= this.MIN_SLOT) {
      return {
        type: 'lunch',
        start: this.formatTime(lunchStart),
        end: this.formatTime(lunchStart + exerciseTime),
        duration: exerciseTime,
        confidence: canShower ? 'high' : 'medium',
        constraints: {
          canShower: canShower,
          maxDuration: exerciseTime,
          recommendedTypes: canShower 
            ? ['running', 'hiit', 'strength', 'mobility']
            : ['mobility', 'walking', 'light-strength']
        },
        recommended: canShower && exerciseTime >= 30
      };
    }
    
    return null;
  },
  
  // Evening slot detection
  findEveningSlot(day, prefs) {
    // Respect no-exercise-after-dinner preference
    if (prefs.noExerciseAfterDinner) {
      // Slot must end before dinner
      const dinnerTime = this.parseTime(day.dinner);
      const workEnd = day.commute?.returnArrive 
        ? this.parseTime(day.commute.returnArrive)
        : day.workEnd 
          ? this.parseTime(day.workEnd)
          : null;
      
      if (!workEnd) return null;
      
      // Check for commitments between work end and dinner
      const eveningCommitments = (day.commitments || []).filter(c => {
        const cStart = this.parseTime(c.start);
        return cStart >= workEnd && cStart < dinnerTime;
      });
      
      if (eveningCommitments.length > 0) {
        // There are commitments - check if there's a gap
        const firstCommitment = eveningCommitments.sort(
          (a, b) => this.parseTime(a.start) - this.parseTime(b.start)
        )[0];
        
        const gapEnd = this.parseTime(firstCommitment.start) - this.BUFFER_BEFORE;
        const gapDuration = gapEnd - workEnd;
        
        if (gapDuration >= this.MIN_SLOT) {
          return {
            type: 'evening-early',
            start: this.formatTime(workEnd),
            end: this.formatTime(gapEnd),
            duration: gapDuration,
            confidence: 'low', // Tight window
            constraints: {
              beforeCommitment: firstCommitment.name,
              tight: true
            },
            recommended: false
          };
        }
        
        return null;
      }
      
      // No commitments - slot from work end to before dinner
      const slotEnd = dinnerTime - this.BUFFER_BEFORE;
      const duration = slotEnd - workEnd;
      
      if (duration >= this.MIN_SLOT) {
        return {
          type: 'evening',
          start: this.formatTime(workEnd),
          end: this.formatTime(slotEnd),
          duration: duration,
          confidence: duration >= 60 ? 'high' : 'medium',
          constraints: {
            beforeDinner: true
          },
          recommended: duration >= 45
        };
      }
    }
    
    return null;
  },
  
  // Helper: Get morning-specific constraints
  getMorningConstraints(day, duration) {
    return {
      tight: duration < 30,
      beforeWork: day.workType !== 'weekend',
      recommendedTypes: duration < 30 
        ? ['mobility', 'stretching']
        : ['mobility', 'strength', 'yoga']
    };
  },
  
  // Helper: Get first commitment of the day
  getFirstCommitment(day) {
    if (!day.commitments?.length) return null;
    return day.commitments.sort(
      (a, b) => this.parseTime(a.start) - this.parseTime(b.start)
    )[0];
  },
  
  // Helper: Parse time string to minutes since midnight
  parseTime(timeStr) {
    const [hours, mins] = timeStr.split(':').map(Number);
    return hours * 60 + mins;
  },
  
  // Helper: Format minutes back to time string
  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
};

export default ScheduleAnalyser;
```

---

# PART 4: COACH'S WEEKLY PLAN GENERATION

## Generating Graeme's Week

```javascript
// js/engines/weeklyPlanner.js

const WeeklyPlanner = {
  
  // Generate a week's plan based on schedule and goals
  generateWeeklyPlan(user) {
    const schedule = user.schedule.weeklyPattern;
    const goals = user.profile.goals; // ['return-to-running', 'hip-recovery']
    const equipment = user.equipment.available;
    const conditions = user.profile.conditions;
    
    const weekPlan = {};
    
    // Analyse each day
    for (const [day, daySchedule] of Object.entries(schedule)) {
      const slots = ScheduleAnalyser.findSlots(daySchedule, user.schedule.globalPreferences);
      
      weekPlan[day] = {
        slots: slots,
        existingExercise: slots.filter(s => s.type === 'existing'),
        availableSlots: slots.filter(s => s.type !== 'existing' && s.type !== 'rest'),
        isRestDay: slots.some(s => s.type === 'rest'),
        recommended: null
      };
    }
    
    // Now distribute sessions across the week
    const plan = this.distributeAlongsideSessions(weekPlan, user);
    
    return plan;
  },
  
  // Decide where Alongside sessions should go
  distributeAlongsideSessions(weekPlan, user) {
    // Count existing exercise
    const existingCardio = [];
    for (const [day, plan] of Object.entries(weekPlan)) {
      plan.existingExercise.forEach(ex => {
        if (ex.exerciseType === 'cardio') {
          existingCardio.push(day);
        }
      });
    }
    
    // For Graeme: Mon (tennis), Tue (football), Sat (tennis) = 3 cardio days
    // Need: Mobility/rehab, Core, Strength
    
    const sessions = [];
    
    // Priority 1: Sunday morning - best available slot for main session
    if (weekPlan.sunday.availableSlots.length > 0) {
      const sundaySlot = weekPlan.sunday.availableSlots.find(s => s.type === 'morning');
      if (sundaySlot) {
        sessions.push({
          day: 'sunday',
          slot: sundaySlot,
          sessionType: 'strength-mobility',
          focus: 'Full hip recovery + core session',
          duration: 35,
          priority: 1
        });
      }
    }
    
    // Priority 2: Friday lunch - mobility/rehab focus
    if (weekPlan.friday.availableSlots.length > 0) {
      const fridaySlot = weekPlan.friday.availableSlots.find(s => s.type === 'lunch');
      if (fridaySlot) {
        sessions.push({
          day: 'friday',
          slot: fridaySlot,
          sessionType: 'mobility-core',
          focus: 'Hip mobility + core stability',
          duration: 30,
          priority: 2
        });
      }
    }
    
    // Priority 3: Monday lunch - running (you want this)
    if (weekPlan.monday.availableSlots.length > 0) {
      const mondaySlot = weekPlan.monday.availableSlots.find(s => s.type === 'lunch');
      if (mondaySlot) {
        sessions.push({
          day: 'monday',
          slot: mondaySlot,
          sessionType: 'running',
          focus: 'Easy pace run (building back)',
          duration: 30,
          priority: 2
        });
      }
    }
    
    // Priority 4: Saturday morning - pre-tennis hip prep
    if (weekPlan.saturday.availableSlots.length > 0) {
      const saturdaySlot = weekPlan.saturday.availableSlots.find(s => s.type === 'morning');
      if (saturdaySlot) {
        sessions.push({
          day: 'saturday',
          slot: saturdaySlot,
          sessionType: 'hip-prep',
          focus: 'Quick hip activation before tennis',
          duration: 20,
          priority: 3
        });
      }
    }
    
    // Mark Wed/Thu as intentional rest
    weekPlan.wednesday.recommended = {
      type: 'rest',
      reason: 'Family commitments - rest day',
      coachMessage: "Wednesday's your taxi day. Rest is productive."
    };
    
    weekPlan.thursday.recommended = {
      type: 'rest',
      reason: 'Family commitments - rest day',
      coachMessage: "Thursday's full too. Your body recovers on rest days."
    };
    
    // Assign sessions to days
    sessions.forEach(session => {
      weekPlan[session.day].recommended = session;
    });
    
    return weekPlan;
  }
};

export default WeeklyPlanner;
```

---

# PART 5: GRAEME'S RECOMMENDED WEEKLY PLAN

## Coach Output (What You'd See)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Your Week                                                     │
│                                                                 │
│   Based on your schedule, here's what makes sense.              │
│   Tap any day to adjust.                                        │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   MONDAY                                                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ 🏃 Lunch Run                           12:30 · 30 min   │   │
│   │    Easy pace, building back to running                  │   │
│   │    [Edit time] [Change session] [Skip this week]        │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │ 🎾 Cardio Tennis                       19:00 · 90 min   │   │
│   │    Your regular session                                 │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   TUESDAY                                                       │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ ⚽ Football / 🏃 Run                   19:00 · 60 min   │   │
│   │    Your regular session                                 │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   WEDNESDAY                                                     │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ 😴 Rest Day                                             │   │
│   │    Taxi service day - rest is productive                │   │
│   │    [Add a session anyway]                               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   THURSDAY                                                      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ 😴 Rest Day                                             │   │
│   │    Another full evening - your body recovers today      │   │
│   │    [Add a session anyway]                               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   FRIDAY                                                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ 🧘 Hip Mobility + Core                 12:30 · 30 min   │   │
│   │    Targets your hip flexors and hamstring               │   │
│   │    Equipment: Resistance bands, mat                     │   │
│   │    [Edit time] [Change session] [Skip this week]        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   SATURDAY                                                      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ 🦵 Hip Activation                      08:30 · 20 min   │   │
│   │    Quick prep before tennis                             │   │
│   │    [Edit time] [Change session] [Skip this week]        │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │ 🎾 Tennis                              14:00 · 120 min  │   │
│   │    Your regular session                                 │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   SUNDAY                                                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ 💪 Full Recovery Session               09:00 · 35 min   │   │
│   │    Hip recovery + core + light strength                 │   │
│   │    Equipment: Resistance bands, plyo box, mat           │   │
│   │    [Edit time] [Change session] [Skip this week]        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   THIS WEEK: 4 Alongside sessions + 3 existing activities      │
│   Total movement: 7 days                                        │
│   Focus: Hip recovery + return to running                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Edit Options

### Change Time

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Move Friday's session                                         │
│                                                                 │
│   Current: 12:30                                                │
│                                                                 │
│   Available windows on Friday:                                  │
│                                                                 │
│   ○ Morning (07:00 - 07:45) - 45 min max                       │
│   ● Lunch (12:30 - 13:30) - 45 min max [Current]               │
│                                                                 │
│   Or pick a custom time:                                        │
│   [12] : [30]                                                   │
│                                                                 │
│   [Save] [Cancel]                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Change Session Type

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Change Friday's session                                       │
│                                                                 │
│   Current: Hip Mobility + Core (30 min)                        │
│                                                                 │
│   Options that fit this slot:                                   │
│                                                                 │
│   ○ Hip Mobility + Core [Current]                              │
│   ○ Core Stability Focus                                       │
│   ○ Full Body Stretch                                          │
│   ○ Light Run (need shower time)                               │
│   ○ Walking (30 min)                                           │
│                                                                 │
│   [Save] [Cancel]                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Skip This Week

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Skip Saturday's Hip Activation?                               │
│                                                                 │
│   ○ Just this week (keep it for future weeks)                  │
│   ○ Always skip Saturdays                                      │
│   ○ This slot doesn't work for me (help me find another)       │
│                                                                 │
│   [Confirm] [Cancel]                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# PART 6: SESSION CONTENT FOR GRAEME

## Session Types Using Your Equipment

### Sunday: Full Recovery Session (35 min)

**Equipment:** Resistance bands, plyo box, mat

```
Warm-up (5 min)
├── Hip circles × 10 each direction
├── Leg swings × 10 each leg
└── Cat-cow × 10

Hip Recovery Block (12 min)
├── Hip flexor stretch with band (45s each side)
├── Pigeon pose (60s each side)
├── 90/90 hip transitions × 8 each side
├── Banded clamshells × 12 each side
└── Banded monster walks × 10 steps each direction

Core Block (10 min)
├── Dead bug × 10 each side
├── Bird dog × 10 each side
├── Plank (30-45s)
├── Side plank (20-30s each side)
└── Glute bridge with band × 12

Strength Finisher (5 min)
├── Box step-ups × 10 each leg
├── Banded squats × 12
└── Banded pull-aparts × 15

Cool-down (3 min)
├── Hamstring stretch (60s each)
└── Child's pose (60s)
```

### Friday: Hip Mobility + Core (30 min)

**Equipment:** Resistance bands, mat

```
Dynamic Warm-up (5 min)
├── Hip circles × 10
├── Ankle circles × 10
├── Knee hugs × 10
└── Walking lunges × 8

Hip Mobility (12 min)
├── Kneeling hip flexor stretch (60s each)
├── World's greatest stretch × 6 each side
├── Frog pose (60s)
├── Half-kneeling hip rotation × 10 each
└── Lying figure-4 stretch (60s each)

Core Stability (10 min)
├── Dead bug × 10 each
├── Pallof press with band × 10 each side
├── Plank shoulder taps × 16
├── Bird dog × 10 each
└── Glute bridge hold (30s × 2)

Cool-down (3 min)
├── Seated hamstring stretch
└── Lying spinal twist each side
```

### Saturday: Quick Hip Activation (20 min)

**Equipment:** Resistance band

```
Activation (Pre-Tennis)

Warm-up (3 min)
├── Light jog in place (1 min)
├── Hip circles × 10
└── Leg swings × 10

Hip Activation (12 min)
├── Banded lateral walks × 10 each direction
├── Banded glute bridges × 15
├── Single-leg glute bridge × 8 each
├── Fire hydrants × 10 each
├── Donkey kicks × 10 each
└── Standing hip flexor stretch (30s each)

Dynamic Prep (5 min)
├── Lateral lunges × 8 each
├── Quick feet (30s)
├── High knees (30s)
└── A-skips × 10 each leg
```

### Monday: Lunch Run (30 min)

**Equipment:** Running shoes, watch

```
Run Structure (Building Back)

Walk warm-up (3 min)
├── Brisk walking pace

Run/Walk Intervals (22 min)
├── Run 4 min at easy, conversational pace
├── Walk 1 min
├── Repeat 4-5 times
├── Target: Easy effort, no pushing
├── Stop if hamstring tightens

Walk cool-down (3 min)
├── Gradually slow pace

Post-Run (2 min)
├── Standing hamstring stretch
├── Hip flexor stretch
└── Calf stretch

Notes:
- Easy pace means you can hold a conversation
- If hamstring feels tight, switch to walking
- Build up over weeks: 4:1 → 5:1 → 6:1 → continuous
```

---

# PART 7: ONBOARDING QUESTIONS FOR SCHEDULE

## Schedule Capture Flow

### Screen 1: Work Pattern

```
What does your work week look like?

○ Office-based (commute every day)
○ Fully remote (work from home)
● Hybrid (some days office, some home)
○ Shift work (varies week to week)
○ I don't currently work
```

### Screen 2: WFH Days (If Hybrid)

```
Which days do you work from home?

☑ Monday
☐ Tuesday
☐ Wednesday
☐ Thursday
☑ Friday

This helps me find lunch-time slots when you can shower after.
```

### Screen 3: Work Hours

```
What are your typical work hours?

Start: [08:00]
End:   [17:00]

On office days, when do you leave/return?
Leave home: [07:30]
Get home:   [17:30]
```

### Screen 4: Evening Commitments

```
Do you have regular evening commitments?

These might be: kids' activities, sports clubs, classes, 
caring responsibilities...

[+ Add commitment]

┌─────────────────────────────────────────────────────────────┐
│ Monday: Cardio Tennis (19:00 - 20:30) 🎾                   │
│ Tuesday: Football / Athletics taxi (18:30 - 20:30) ⚽       │
│ Wednesday: Family taxi service (17:45 - 19:30) 🚗           │
│ Thursday: Piano + Athletics taxi (17:30 - 20:30) 🚗         │
└─────────────────────────────────────────────────────────────┘

[Done]
```

### Screen 5: Exercise Preferences

```
When do you prefer to exercise?

☑ Morning (before work)
☑ Lunch break
☐ After work
☐ Evening

Any rules for yourself?

☑ I prefer not to exercise after dinner
☐ I need at least 30 minutes for it to feel worthwhile
☐ I can only exercise if I can shower after
```

### Screen 6: Existing Exercise

```
What exercise are you already doing?

This won't be replaced - it's already working for you!

┌─────────────────────────────────────────────────────────────┐
│ Monday: Cardio Tennis                  🎾 Cardio            │
│ Tuesday: Football / Running            ⚽ Cardio            │
│ Saturday: Tennis                       🎾 Cardio            │
└─────────────────────────────────────────────────────────────┘

You're already doing great! I'll build around this.
```

### Screen 7: Review Plan

```
Here's what I'm thinking:

┌─────────────────────────────────────────────────────────────┐
│ You've already got 3 cardio days covered.                  │
│                                                             │
│ What's missing for your goals:                             │
│ • Hip mobility work (for recovery)                         │
│ • Core stability (supports your running)                   │
│ • Targeted strength (injury prevention)                    │
│                                                             │
│ I've found 4 realistic slots to add these:                 │
│                                                             │
│ Mon lunch: Easy run (building back)                        │
│ Fri lunch: Hip mobility + core                             │
│ Sat morning: Quick hip activation (pre-tennis)             │
│ Sun morning: Full recovery session                         │
│                                                             │
│ Wed + Thu: Rest (your schedule is full)                    │
└─────────────────────────────────────────────────────────────┘

[This looks good] [I want to adjust]
```

---

# QUICK REFERENCE

## Graeme's Final Schedule

| Day | Alongside Session | Time | Duration | Existing |
|-----|-------------------|------|----------|----------|
| Mon | Lunch Run | 12:30 | 30 min | Tennis 19:00 |
| Tue | - | - | - | Football 19:00 |
| Wed | REST | - | - | Taxi service |
| Thu | REST | - | - | Taxi service |
| Fri | Hip Mobility + Core | 12:30 | 30 min | - |
| Sat | Hip Activation | 08:30 | 20 min | Tennis 14:00 |
| Sun | Full Recovery Session | 09:00 | 35 min | - |

## Equipment Available

- Resistance bands (light, medium, heavy)
- Stretch bands
- Plyo box (medium height)
- Exercise mat

## Schedule Constraints

- No exercise after dinner ✓
- WFH days (Mon, Fri) = lunch runs viable ✓
- Wed/Thu = genuine rest days (full schedules) ✓
- Shower access on WFH/weekend days only ✓

---

**This document enables the Coach to work with YOUR real schedule, not an idealised one.**
