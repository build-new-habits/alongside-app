# ALONGSIDE: JSON Schemas
## Complete Data Structure Definitions v1.0 | January 2026

---

# PART 1: OVERVIEW

## Purpose

This document defines the exact structure of all data in Alongside. Every piece of stored data must conform to these schemas. When building, use these as the source of truth.

## Storage Strategy

| Data Type | Storage Location | Sync Strategy |
|-----------|------------------|---------------|
| User Profile | localStorage | Future: Cloud backup |
| Check-in History | localStorage | Future: Cloud sync |
| Session History | localStorage | Future: Cloud sync |
| Exercise Library | Static JSON files | Bundled with app |
| Programme Templates | Static JSON files | Bundled with app |
| Coach Scripts | Static JSON files | Bundled with app |
| Settings | localStorage | Device-local |

## Naming Conventions

- **camelCase** for all property names
- **kebab-case** for IDs and string constants
- **ISO 8601** for all dates and times
- **Metric units** internally (display can convert)

---

# PART 2: USER PROFILE SCHEMA

## Complete User Profile

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "UserProfile",
  "type": "object",
  "required": ["id", "name", "createdAt", "goals", "availability"],
  "properties": {
    
    "id": {
      "type": "string",
      "description": "Unique user identifier",
      "example": "user-a1b2c3d4"
    },
    
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 20,
      "description": "User's preferred name",
      "example": "Graeme"
    },
    
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "When the profile was created",
      "example": "2026-01-27T07:30:00Z"
    },
    
    "lastActiveAt": {
      "type": "string",
      "format": "date-time",
      "description": "Last app interaction",
      "example": "2026-01-27T18:45:00Z"
    },
    
    "onboardingComplete": {
      "type": "boolean",
      "default": false,
      "description": "Whether onboarding has been completed"
    },
    
    "onboardingStep": {
      "type": "string",
      "description": "Current/last onboarding step (for resume)",
      "enum": ["welcome", "name", "goals", "goal-details", "conditions", "condition-details", "equipment", "time", "schedule", "coach", "accessibility", "plan-reveal", "complete"]
    },
    
    "personal": {
      "type": "object",
      "properties": {
        "dateOfBirth": {
          "type": "string",
          "format": "date",
          "description": "For age-appropriate recommendations"
        },
        "biologicalSex": {
          "type": "string",
          "enum": ["male", "female", "other", "prefer-not-to-say"],
          "description": "For physiological calculations"
        },
        "menstrualTracking": {
          "type": "boolean",
          "default": false,
          "description": "Whether user wants cycle-aware recommendations"
        }
      }
    },
    
    "measurements": {
      "type": "object",
      "properties": {
        "weight": {
          "type": "object",
          "properties": {
            "value": { "type": "number", "minimum": 20, "maximum": 300 },
            "unit": { "type": "string", "enum": ["kg", "lb"], "default": "kg" },
            "lastUpdated": { "type": "string", "format": "date-time" }
          }
        },
        "targetWeight": {
          "type": "object",
          "properties": {
            "value": { "type": "number", "minimum": 20, "maximum": 300 },
            "unit": { "type": "string", "enum": ["kg", "lb"], "default": "kg" }
          }
        },
        "height": {
          "type": "object",
          "properties": {
            "value": { "type": "number", "minimum": 50, "maximum": 250 },
            "unit": { "type": "string", "enum": ["cm", "ft-in"], "default": "cm" }
          }
        }
      }
    },
    
    "conditions": {
      "type": "array",
      "items": { "$ref": "#/definitions/Condition" },
      "description": "Active conditions/injuries"
    },
    
    "equipment": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Available equipment IDs",
      "example": ["mat", "dumbbells", "foam-roller", "massage-gun"]
    },
    
    "goals": {
      "type": "array",
      "items": { "$ref": "#/definitions/Goal" },
      "minItems": 1,
      "description": "User's fitness goals"
    },
    
    "availability": {
      "$ref": "#/definitions/Availability"
    },
    
    "schedule": {
      "$ref": "#/definitions/Schedule"
    },
    
    "preferences": {
      "$ref": "#/definitions/Preferences"
    },
    
    "accessibility": {
      "$ref": "#/definitions/AccessibilitySettings"
    },
    
    "credits": {
      "$ref": "#/definitions/CreditsAccount"
    },
    
    "currentProgramme": {
      "type": "object",
      "properties": {
        "programmeId": { "type": "string" },
        "startDate": { "type": "string", "format": "date" },
        "currentWeek": { "type": "integer", "minimum": 1 },
        "currentDay": { "type": "integer", "minimum": 1 },
        "status": { "type": "string", "enum": ["active", "paused", "completed"] }
      }
    }
  },
  
  "definitions": {
    
    "Condition": {
      "type": "object",
      "required": ["id", "area", "type", "status"],
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique condition identifier",
          "example": "condition-herniated-disc-001"
        },
        "area": {
          "type": "string",
          "enum": ["neck", "shoulder-left", "shoulder-right", "upper-back", "lower-back", "hip-left", "hip-right", "knee-left", "knee-right", "ankle-left", "ankle-right", "wrist-left", "wrist-right", "hamstring-left", "hamstring-right", "calf-left", "calf-right", "other"],
          "description": "Body area affected"
        },
        "type": {
          "type": "string",
          "enum": ["disc-herniation", "muscle-strain", "sciatica", "general-pain", "arthritis", "post-surgery", "tendinitis", "bursitis", "sprain", "fracture-healed", "other"],
          "description": "Type of condition"
        },
        "status": {
          "type": "string",
          "enum": ["acute", "subacute", "recovering", "chronic", "managed"],
          "description": "Current status"
        },
        "duration": {
          "type": "string",
          "enum": ["less-than-2-weeks", "2-6-weeks", "6-weeks-to-6-months", "more-than-6-months"],
          "description": "How long they've had it"
        },
        "typicalPain": {
          "type": "integer",
          "minimum": 0,
          "maximum": 10,
          "description": "Typical pain level (0-10)"
        },
        "typicalDifficulty": {
          "type": "integer",
          "minimum": 0,
          "maximum": 10,
          "description": "Typical functional difficulty (0-10)"
        },
        "triggers": {
          "type": "string",
          "description": "Known triggers (free text)"
        },
        "notes": {
          "type": "string",
          "description": "Additional notes"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "lastUpdated": {
          "type": "string",
          "format": "date-time"
        }
      }
    },
    
    "Goal": {
      "type": "object",
      "required": ["id", "type", "status"],
      "properties": {
        "id": {
          "type": "string",
          "example": "goal-run-45-pain-free"
        },
        "type": {
          "type": "string",
          "enum": ["running", "weight-loss", "strength", "recovery", "flexibility", "mental-wellbeing", "injury-prevention", "consistency", "appearance", "other"]
        },
        "userDescription": {
          "type": "string",
          "description": "Goal in user's own words"
        },
        "target": {
          "type": "object",
          "properties": {
            "metric": { "type": "string" },
            "value": { "type": "number" },
            "unit": { "type": "string" },
            "qualifiers": { 
              "type": "array", 
              "items": { "type": "string" } 
            }
          }
        },
        "startDate": {
          "type": "string",
          "format": "date"
        },
        "targetDate": {
          "type": "string",
          "format": "date",
          "description": "Optional target date"
        },
        "targetFlexibility": {
          "type": "string",
          "enum": ["soft", "hard"],
          "default": "soft",
          "description": "Is the target date a hard deadline or aspiration?"
        },
        "startingValue": {
          "type": "number",
          "description": "Where they started"
        },
        "currentValue": {
          "type": "number",
          "description": "Current progress"
        },
        "priority": {
          "type": "string",
          "enum": ["critical", "high", "medium", "low"]
        },
        "status": {
          "type": "string",
          "enum": ["active", "paused", "achieved", "abandoned"]
        },
        "requirements": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "component": { "type": "string" },
              "priority": { "type": "string", "enum": ["critical", "high", "medium", "low"] },
              "reason": { "type": "string" },
              "status": { "type": "string", "enum": ["not-started", "in-progress", "completed"] }
            }
          }
        },
        "constraints": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "condition": { "type": "string" },
              "rule": { "type": "string" }
            }
          }
        },
        "milestones": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "value": { "type": "number" },
              "label": { "type": "string" },
              "reached": { "type": "boolean" },
              "reachedAt": { "type": "string", "format": "date-time" }
            }
          }
        }
      }
    },
    
    "Availability": {
      "type": "object",
      "required": ["frequency", "duration"],
      "properties": {
        "frequency": {
          "type": "string",
          "enum": ["1", "2-3", "4-5", "6-7", "variable"],
          "description": "Days per week"
        },
        "duration": {
          "type": "string",
          "enum": ["10-15", "20-30", "30-45", "45-60", "60+", "variable"],
          "description": "Minutes per session"
        },
        "preferredTime": {
          "type": "string",
          "enum": ["morning", "lunch", "afternoon", "evening", "flexible"]
        }
      }
    },
    
    "Schedule": {
      "type": "object",
      "description": "Weekly schedule with commitments",
      "properties": {
        "monday": { "$ref": "#/definitions/DaySchedule" },
        "tuesday": { "$ref": "#/definitions/DaySchedule" },
        "wednesday": { "$ref": "#/definitions/DaySchedule" },
        "thursday": { "$ref": "#/definitions/DaySchedule" },
        "friday": { "$ref": "#/definitions/DaySchedule" },
        "saturday": { "$ref": "#/definitions/DaySchedule" },
        "sunday": { "$ref": "#/definitions/DaySchedule" }
      }
    },
    
    "DaySchedule": {
      "type": "object",
      "properties": {
        "commitments": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "start": { "type": "string", "pattern": "^([01]?[0-9]|2[0-3]):[0-5][0-9]$" },
              "end": { "type": "string", "pattern": "^([01]?[0-9]|2[0-3]):[0-5][0-9]$" },
              "label": { "type": "string" },
              "frequency": { "type": "string", "enum": ["weekly", "fortnightly", "monthly", "occasional"] }
            }
          }
        },
        "trainingWindows": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "start": { "type": "string" },
              "end": { "type": "string" },
              "duration": { "type": "integer", "description": "Minutes" },
              "preferred": { "type": "boolean" }
            }
          }
        }
      }
    },
    
    "Preferences": {
      "type": "object",
      "properties": {
        "coachPersonality": {
          "type": "string",
          "enum": ["steady", "energetic", "minimal", "nurturing"],
          "default": "steady"
        },
        "voiceEnabled": {
          "type": "boolean",
          "default": true
        },
        "exerciseVoiceEnabled": {
          "type": "boolean",
          "default": true
        },
        "hapticFeedback": {
          "type": "boolean",
          "default": true
        },
        "timerSounds": {
          "type": "boolean",
          "default": true
        },
        "units": {
          "type": "object",
          "properties": {
            "weight": { "type": "string", "enum": ["kg", "lb"], "default": "kg" },
            "distance": { "type": "string", "enum": ["km", "mi"], "default": "km" },
            "height": { "type": "string", "enum": ["cm", "ft-in"], "default": "cm" }
          }
        }
      }
    },
    
    "AccessibilitySettings": {
      "type": "object",
      "properties": {
        "textSize": {
          "type": "string",
          "enum": ["normal", "large", "extra-large"],
          "default": "normal"
        },
        "highContrast": {
          "type": "boolean",
          "default": false
        },
        "reduceMotion": {
          "type": "boolean",
          "default": false
        },
        "screenReaderOptimised": {
          "type": "boolean",
          "default": false
        }
      }
    },
    
    "CreditsAccount": {
      "type": "object",
      "properties": {
        "balance": {
          "type": "integer",
          "minimum": 0,
          "default": 0
        },
        "lifetimeEarned": {
          "type": "integer",
          "minimum": 0,
          "default": 0
        },
        "lifetimeSpent": {
          "type": "integer",
          "minimum": 0,
          "default": 0
        },
        "lastTransaction": {
          "type": "string",
          "format": "date-time"
        }
      }
    }
  }
}
```

---

# PART 3: CHECK-IN SCHEMA

## Daily Check-in

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DailyCheckIn",
  "type": "object",
  "required": ["id", "date", "timestamp", "energy", "mood"],
  "properties": {
    
    "id": {
      "type": "string",
      "description": "Unique check-in identifier",
      "example": "checkin-2026-01-27-morning"
    },
    
    "date": {
      "type": "string",
      "format": "date",
      "description": "Date of check-in",
      "example": "2026-01-27"
    },
    
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "Exact time of check-in",
      "example": "2026-01-27T07:30:00Z"
    },
    
    "energy": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10,
      "description": "Energy level (1=exhausted, 10=peak)"
    },
    
    "energyDescription": {
      "type": "string",
      "description": "Auto-generated description based on level",
      "example": "Moderate - steady does it"
    },
    
    "mood": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10,
      "description": "Mood level (1=struggling, 10=fantastic)"
    },
    
    "moodDescription": {
      "type": "string",
      "description": "Auto-generated description based on level"
    },
    
    "sleep": {
      "type": "object",
      "properties": {
        "hours": {
          "type": "number",
          "minimum": 0,
          "maximum": 24
        },
        "quality": {
          "type": "integer",
          "minimum": 1,
          "maximum": 10
        }
      }
    },
    
    "conditions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "conditionId": { "type": "string" },
          "pain": { "type": "integer", "minimum": 0, "maximum": 10 },
          "difficulty": { "type": "integer", "minimum": 0, "maximum": 10 }
        }
      },
      "description": "Today's condition ratings"
    },
    
    "menstrualDay": {
      "type": "integer",
      "minimum": 1,
      "maximum": 50,
      "description": "Day of menstrual cycle (if tracking)"
    },
    
    "menstrualPhase": {
      "type": "string",
      "enum": ["menstruation", "follicular", "ovulation", "luteal", "unknown"],
      "description": "Auto-calculated phase"
    },
    
    "notes": {
      "type": "string",
      "maxLength": 500,
      "description": "Optional free-text notes"
    },
    
    "flags": {
      "type": "object",
      "properties": {
        "burnoutDetected": { "type": "boolean", "default": false },
        "recoveryModeActive": { "type": "boolean", "default": false },
        "highPainAlert": { "type": "boolean", "default": false },
        "lowMoodAlert": { "type": "boolean", "default": false }
      }
    }
  }
}
```

---

# PART 4: SESSION SCHEMA

## Session Record

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Session",
  "type": "object",
  "required": ["id", "date", "status"],
  "properties": {
    
    "id": {
      "type": "string",
      "example": "session-2026-01-27-001"
    },
    
    "date": {
      "type": "string",
      "format": "date"
    },
    
    "startTime": {
      "type": "string",
      "format": "date-time"
    },
    
    "endTime": {
      "type": "string",
      "format": "date-time"
    },
    
    "status": {
      "type": "string",
      "enum": ["planned", "in-progress", "completed", "partial", "skipped"]
    },
    
    "checkInId": {
      "type": "string",
      "description": "Reference to the check-in that preceded this session"
    },
    
    "source": {
      "type": "object",
      "description": "Where this session came from",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["programme", "coach-generated", "user-override", "quick-session"]
        },
        "programmeId": { "type": "string" },
        "programmeWeek": { "type": "integer" },
        "programmeDay": { "type": "integer" }
      }
    },
    
    "prescribed": {
      "type": "object",
      "description": "What was planned",
      "properties": {
        "name": { "type": "string" },
        "focus": { "type": "string" },
        "targetDuration": { "type": "integer", "description": "Minutes" },
        "warmup": {
          "type": "object",
          "properties": {
            "duration": { "type": "integer" },
            "exercises": { "type": "array", "items": { "$ref": "#/definitions/PrescribedExercise" } }
          }
        },
        "main": {
          "type": "array",
          "items": { "$ref": "#/definitions/PrescribedExercise" }
        },
        "cooldown": {
          "type": "object",
          "properties": {
            "duration": { "type": "integer" },
            "exercises": { "type": "array", "items": { "$ref": "#/definitions/PrescribedExercise" } }
          }
        },
        "totalCredits": { "type": "integer" },
        "rationale": { "type": "string" }
      }
    },
    
    "adaptations": {
      "type": "array",
      "description": "Modifications made based on check-in",
      "items": {
        "type": "object",
        "properties": {
          "reason": { "type": "string" },
          "action": { "type": "string" },
          "description": { "type": "string" }
        }
      }
    },
    
    "completed": {
      "type": "object",
      "description": "What actually happened",
      "properties": {
        "exercises": {
          "type": "array",
          "items": { "$ref": "#/definitions/CompletedExercise" }
        },
        "actualDuration": { "type": "integer", "description": "Minutes" },
        "creditsEarned": { "type": "integer" }
      }
    },
    
    "userOverride": {
      "type": "object",
      "description": "If user said 'I just want to...'",
      "properties": {
        "occurred": { "type": "boolean" },
        "request": { "type": "string" },
        "timestamp": { "type": "string", "format": "date-time" }
      }
    },
    
    "postSession": {
      "type": "object",
      "properties": {
        "feelingComparison": {
          "type": "string",
          "enum": ["worse", "same", "better"]
        },
        "notes": { "type": "string" },
        "timestamp": { "type": "string", "format": "date-time" }
      }
    }
  },
  
  "definitions": {
    
    "PrescribedExercise": {
      "type": "object",
      "properties": {
        "exerciseId": { "type": "string" },
        "name": { "type": "string" },
        "prescription": {
          "type": "object",
          "properties": {
            "sets": { "type": "integer" },
            "reps": { "type": "integer" },
            "holdTime": { "type": "integer", "description": "Seconds" },
            "duration": { "type": "integer", "description": "Seconds" },
            "perSide": { "type": "boolean" },
            "rest": { "type": "integer", "description": "Seconds between sets" },
            "tempo": { "type": "string" }
          }
        },
        "credits": { "type": "integer" },
        "adaptationApplied": { "type": "string", "enum": ["none", "easier", "harder", "modified"] }
      }
    },
    
    "CompletedExercise": {
      "type": "object",
      "properties": {
        "exerciseId": { "type": "string" },
        "status": {
          "type": "string",
          "enum": ["completed", "partial", "skipped", "modified"]
        },
        "setsCompleted": { "type": "integer" },
        "feedback": {
          "type": "object",
          "properties": {
            "difficulty": {
              "type": "string",
              "enum": ["too-easy", "just-right", "too-hard"]
            },
            "painDuring": { "type": "boolean" },
            "painLocation": { "type": "string" },
            "notes": { "type": "string" }
          }
        },
        "creditsEarned": { "type": "integer" },
        "timestamp": { "type": "string", "format": "date-time" }
      }
    }
  }
}
```

---

# PART 5: EXERCISE SCHEMA

## Exercise Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Exercise",
  "type": "object",
  "required": ["id", "name", "category"],
  "properties": {
    
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "example": "hip-flexor-stretch-kneeling"
    },
    
    "name": {
      "type": "string",
      "example": "Kneeling Hip Flexor Stretch"
    },
    
    "category": {
      "type": "string",
      "enum": ["mobility", "strength", "cardio", "balance", "recovery", "breathing"]
    },
    
    "subcategory": {
      "type": "string",
      "example": "hip"
    },
    
    "movementPattern": {
      "type": "string",
      "enum": ["stretch", "hip-extension", "hip-flexion", "hip-abduction", "hip-rotation", "spinal-flexion-extension", "anti-extension", "anti-rotation", "anti-lateral-flexion", "push", "pull", "squat", "hinge", "lunge", "carry", "static-balance", "dynamic-balance", "breath", "self-massage"]
    },
    
    "equipment": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Required equipment",
      "example": ["mat"]
    },
    
    "equipmentOptional": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Optional equipment that enhances exercise"
    },
    
    "spaceNeeded": {
      "type": "string",
      "enum": ["minimal", "small", "medium", "large"]
    },
    
    "affectsAreas": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Body areas this exercise affects",
      "example": ["hip", "hip-flexor", "quadriceps"]
    },
    
    "contraindications": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Conditions where this exercise should be avoided"
    },
    
    "conditionModifications": {
      "type": "object",
      "additionalProperties": { "type": "string" },
      "description": "Modifications for specific conditions",
      "example": {
        "herniated-disc": "Keep pelvis tucked throughout. Don't overarch lower back.",
        "knee-pain": "Use thick cushion under knee."
      }
    },
    
    "defaultPrescription": {
      "type": "object",
      "properties": {
        "sets": { "type": "integer" },
        "reps": { "type": "integer" },
        "holdTime": { "type": "integer", "description": "Seconds" },
        "duration": { "type": "integer", "description": "Seconds" },
        "perSide": { "type": "boolean", "default": false },
        "rest": { "type": "integer", "description": "Seconds between sets" },
        "tempo": { "type": "string" }
      }
    },
    
    "setup": {
      "type": "string",
      "description": "How to get into position"
    },
    
    "execution": {
      "type": "string",
      "description": "How to perform the exercise"
    },
    
    "coaching": {
      "type": "string",
      "description": "Tips and cues"
    },
    
    "commonMistakes": {
      "type": "array",
      "items": { "type": "string" }
    },
    
    "why": {
      "type": "string",
      "description": "Why this exercise matters"
    },
    
    "goalConnections": {
      "type": "object",
      "additionalProperties": { "type": "string" },
      "description": "How this connects to specific goals",
      "example": {
        "running": "Tight hip flexors limit stride length.",
        "injury-prevention": "Hip flexor tightness contributes to back pain."
      }
    },
    
    "adaptations": {
      "type": "object",
      "properties": {
        "easier": { "type": "string" },
        "harder": { "type": "string" },
        "pain": { "type": "string" }
      }
    },
    
    "youtubeSearch": {
      "type": "string",
      "description": "Search terms for finding video demos"
    },
    
    "energyRequired": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10,
      "description": "Energy level needed (1=very low, 10=very high)"
    },
    
    "baseCredits": {
      "type": "integer",
      "minimum": 1,
      "description": "Credits earned for completing this exercise"
    },
    
    "audioInstructions": {
      "type": "string",
      "description": "Path to audio file for this exercise"
    }
  }
}
```

---

# PART 6: PROGRAMME SCHEMA

## Programme Template

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Programme",
  "type": "object",
  "required": ["id", "name", "duration", "weeks"],
  "properties": {
    
    "id": {
      "type": "string",
      "example": "hip-back-hamstring-recovery"
    },
    
    "version": {
      "type": "string",
      "example": "1.0"
    },
    
    "name": {
      "type": "string",
      "example": "Hip, Back & Hamstring Recovery"
    },
    
    "shortName": {
      "type": "string",
      "example": "Hip Recovery"
    },
    
    "description": {
      "type": "string"
    },
    
    "category": {
      "type": "string",
      "enum": ["recovery", "strength", "cardio", "flexibility", "sport-specific", "general-fitness"]
    },
    
    "subcategory": {
      "type": "string",
      "enum": ["rehab", "maintenance", "performance", "beginner", "intermediate", "advanced"]
    },
    
    "targetAreas": {
      "type": "array",
      "items": { "type": "string" },
      "example": ["hip", "lower-back", "hamstring", "glutes"]
    },
    
    "duration": {
      "type": "object",
      "properties": {
        "weeks": { "type": "integer" },
        "sessionsPerWeek": { "type": "integer" },
        "sessionDurationRange": { "type": "string", "example": "15-25 minutes" }
      }
    },
    
    "suitableFor": {
      "type": "object",
      "properties": {
        "fitnessLevels": {
          "type": "array",
          "items": { "type": "string", "enum": ["beginner", "intermediate", "advanced"] }
        },
        "conditions": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Conditions this programme helps with"
        },
        "contraindications": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Conditions where this programme should NOT be used"
        }
      }
    },
    
    "equipment": {
      "type": "object",
      "properties": {
        "required": { "type": "array", "items": { "type": "string" } },
        "optional": { "type": "array", "items": { "type": "string" } }
      }
    },
    
    "phases": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "weeks": { "type": "array", "items": { "type": "integer" } },
          "focus": { "type": "string" },
          "intensity": { "type": "string" },
          "colour": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" }
        }
      }
    },
    
    "adaptationRules": {
      "type": "object",
      "properties": {
        "energy": {
          "type": "object",
          "properties": {
            "low": {
              "type": "object",
              "properties": {
                "threshold": { "type": "integer" },
                "action": { "type": "string" },
                "message": { "type": "string" }
              }
            },
            "veryLow": {
              "type": "object",
              "properties": {
                "threshold": { "type": "integer" },
                "action": { "type": "string" },
                "message": { "type": "string" }
              }
            }
          }
        },
        "pain": {
          "type": "object",
          "additionalProperties": {
            "type": "object",
            "properties": {
              "threshold": { "type": "integer" },
              "action": { "type": "string" },
              "message": { "type": "string" }
            }
          }
        },
        "missedDays": {
          "type": "object",
          "additionalProperties": {
            "type": "object",
            "properties": {
              "action": { "type": "string" },
              "message": { "type": "string" }
            }
          }
        }
      }
    },
    
    "milestones": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "week": { "type": "integer" },
          "name": { "type": "string" },
          "celebration": { "type": "string" },
          "reflection": { "type": "string" },
          "credits": { "type": "integer" },
          "nextSteps": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    
    "weeks": {
      "type": "array",
      "items": { "$ref": "#/definitions/ProgrammeWeek" }
    },
    
    "meta": {
      "type": "object",
      "properties": {
        "author": { "type": "string" },
        "evidenceBasis": { "type": "string" },
        "references": { "type": "array", "items": { "type": "string" } },
        "lastUpdated": { "type": "string", "format": "date" },
        "reviewDate": { "type": "string", "format": "date" }
      }
    }
  },
  
  "definitions": {
    
    "ProgrammeWeek": {
      "type": "object",
      "properties": {
        "week": { "type": "integer" },
        "phase": { "type": "string" },
        "theme": { "type": "string" },
        "focus": { "type": "string" },
        "sessions": {
          "type": "array",
          "items": { "$ref": "#/definitions/ProgrammeSession" }
        }
      }
    },
    
    "ProgrammeSession": {
      "type": "object",
      "properties": {
        "day": { "type": "integer" },
        "id": { "type": "string" },
        "name": { "type": "string" },
        "duration": { "type": "integer" },
        "focus": { "type": "string" },
        "warmup": {
          "type": "object",
          "properties": {
            "duration": { "type": "integer" },
            "instructions": { "type": "string" }
          }
        },
        "exercises": {
          "type": "array",
          "items": { "$ref": "#/definitions/ProgrammeExercise" }
        },
        "cooldown": {
          "type": "object",
          "properties": {
            "duration": { "type": "integer" },
            "instructions": { "type": "string" }
          }
        },
        "rationale": { "type": "string" },
        "totalCredits": { "type": "integer" }
      }
    },
    
    "ProgrammeExercise": {
      "type": "object",
      "properties": {
        "exerciseId": { "type": "string" },
        "name": { "type": "string" },
        "prescription": {
          "type": "object",
          "properties": {
            "sets": { "type": "integer" },
            "reps": { "type": "integer" },
            "holdTime": { "type": "integer" },
            "duration": { "type": "integer" },
            "perSide": { "type": "boolean" },
            "rest": { "type": "integer" },
            "tempo": { "type": "string" }
          }
        },
        "setup": { "type": "string" },
        "execution": { "type": "string" },
        "coaching": { "type": "string" },
        "commonMistakes": { "type": "array", "items": { "type": "string" } },
        "adaptations": {
          "type": "object",
          "properties": {
            "easier": { "type": "string" },
            "harder": { "type": "string" },
            "pain": { "type": "string" }
          }
        },
        "why": { "type": "string" },
        "credits": { "type": "integer" }
      }
    }
  }
}
```

---

# PART 7: COACH SCRIPTS SCHEMA

## Script Library

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CoachScripts",
  "type": "object",
  "properties": {
    
    "moments": {
      "type": "object",
      "description": "Scripts organised by moment",
      "additionalProperties": { "$ref": "#/definitions/ScriptMoment" }
    },
    
    "exerciseVoice": {
      "type": "object",
      "description": "Exercise instruction scripts",
      "additionalProperties": { "$ref": "#/definitions/ExerciseScript" }
    }
  },
  
  "definitions": {
    
    "ScriptMoment": {
      "type": "object",
      "description": "A moment where the Coach speaks",
      "properties": {
        "id": { "type": "string" },
        "description": { "type": "string" },
        "voicePlays": { "type": "boolean", "default": true },
        "variables": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Variables that can be inserted"
        },
        "variants": {
          "type": "object",
          "properties": {
            "steady": { "$ref": "#/definitions/ScriptVariant" },
            "energetic": { "$ref": "#/definitions/ScriptVariant" },
            "minimal": { "$ref": "#/definitions/ScriptVariant" },
            "nurturing": { "$ref": "#/definitions/ScriptVariant" }
          }
        },
        "contextualVariants": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "condition": { "type": "string" },
              "variants": {
                "type": "object",
                "properties": {
                  "steady": { "$ref": "#/definitions/ScriptVariant" },
                  "energetic": { "$ref": "#/definitions/ScriptVariant" },
                  "minimal": { "$ref": "#/definitions/ScriptVariant" },
                  "nurturing": { "$ref": "#/definitions/ScriptVariant" }
                }
              }
            }
          }
        }
      }
    },
    
    "ScriptVariant": {
      "type": "object",
      "properties": {
        "text": { "type": "string" },
        "audioFile": { "type": "string" }
      }
    },
    
    "ExerciseScript": {
      "type": "object",
      "properties": {
        "exerciseId": { "type": "string" },
        "setup": { "type": "string" },
        "execution": { "type": "string" },
        "cues": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "timing": { "type": "string", "description": "When to play, e.g., '15s', 'halfway'" },
              "text": { "type": "string" }
            }
          }
        },
        "transitions": {
          "type": "object",
          "properties": {
            "switchSides": { "type": "string" },
            "nextSet": { "type": "string" },
            "rest": { "type": "string" },
            "complete": { "type": "string" }
          }
        },
        "audioFiles": {
          "type": "object",
          "properties": {
            "setup": { "type": "string" },
            "execution": { "type": "string" },
            "cues": { "type": "array", "items": { "type": "string" } },
            "switchSides": { "type": "string" },
            "complete": { "type": "string" }
          }
        }
      }
    }
  }
}
```

---

# PART 8: HISTORY & ANALYTICS SCHEMAS

## Activity History Entry

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ActivityHistoryEntry",
  "type": "object",
  "required": ["id", "type", "timestamp"],
  "properties": {
    
    "id": {
      "type": "string"
    },
    
    "type": {
      "type": "string",
      "enum": ["session", "walk", "run", "cycle", "sport", "weight", "mood", "other"]
    },
    
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    
    "sessionData": {
      "type": "object",
      "description": "If type is session",
      "properties": {
        "sessionId": { "type": "string" },
        "name": { "type": "string" },
        "duration": { "type": "integer" },
        "exercisesCompleted": { "type": "integer" },
        "creditsEarned": { "type": "integer" },
        "programmeWeek": { "type": "integer" },
        "programmeDay": { "type": "integer" }
      }
    },
    
    "activityData": {
      "type": "object",
      "description": "If type is walk/run/cycle/sport",
      "properties": {
        "duration": { "type": "integer", "description": "Minutes" },
        "distance": { "type": "number" },
        "distanceUnit": { "type": "string", "enum": ["km", "mi"] },
        "caloriesEstimate": { "type": "integer" },
        "notes": { "type": "string" },
        "sportType": { "type": "string" }
      }
    },
    
    "weightData": {
      "type": "object",
      "description": "If type is weight",
      "properties": {
        "value": { "type": "number" },
        "unit": { "type": "string", "enum": ["kg", "lb"] }
      }
    },
    
    "moodData": {
      "type": "object",
      "description": "If type is mood",
      "properties": {
        "mood": { "type": "integer", "minimum": 1, "maximum": 10 },
        "energy": { "type": "integer", "minimum": 1, "maximum": 10 },
        "notes": { "type": "string" }
      }
    }
  }
}
```

## Credits Transaction

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CreditTransaction",
  "type": "object",
  "required": ["id", "type", "amount", "timestamp"],
  "properties": {
    
    "id": {
      "type": "string"
    },
    
    "type": {
      "type": "string",
      "enum": ["earned", "spent", "bonus", "adjustment"]
    },
    
    "amount": {
      "type": "integer",
      "description": "Positive for earned, negative for spent"
    },
    
    "reason": {
      "type": "string",
      "description": "Human-readable reason"
    },
    
    "source": {
      "type": "object",
      "properties": {
        "type": { "type": "string", "enum": ["session", "exercise", "milestone", "show-up", "feedback", "manual"] },
        "referenceId": { "type": "string" }
      }
    },
    
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    
    "balanceAfter": {
      "type": "integer"
    }
  }
}
```

---

# PART 9: FEEDBACK SCHEMA

## Exercise Feedback

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ExerciseFeedback",
  "type": "object",
  "required": ["id", "exerciseId", "timestamp"],
  "properties": {
    
    "id": {
      "type": "string"
    },
    
    "exerciseId": {
      "type": "string"
    },
    
    "sessionId": {
      "type": "string"
    },
    
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    
    "difficulty": {
      "type": "string",
      "enum": ["too-easy", "just-right", "too-hard"]
    },
    
    "painOccurred": {
      "type": "boolean"
    },
    
    "painLocation": {
      "type": "string"
    },
    
    "notes": {
      "type": "string"
    },
    
    "voiceNote": {
      "type": "object",
      "properties": {
        "audioFile": { "type": "string" },
        "duration": { "type": "integer" },
        "transcription": { "type": "string" }
      }
    }
  }
}
```

---

# PART 10: SETTINGS SCHEMA

## App Settings

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AppSettings",
  "type": "object",
  "properties": {
    
    "notifications": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean", "default": false },
        "reminderTime": { "type": "string", "pattern": "^([01]?[0-9]|2[0-3]):[0-5][0-9]$" },
        "reminderDays": {
          "type": "array",
          "items": { "type": "string", "enum": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] }
        }
      }
    },
    
    "privacy": {
      "type": "object",
      "properties": {
        "analyticsEnabled": { "type": "boolean", "default": false },
        "crashReportingEnabled": { "type": "boolean", "default": false }
      }
    },
    
    "dataManagement": {
      "type": "object",
      "properties": {
        "lastBackup": { "type": "string", "format": "date-time" },
        "autoBackupEnabled": { "type": "boolean", "default": false }
      }
    },
    
    "developer": {
      "type": "object",
      "properties": {
        "debugMode": { "type": "boolean", "default": false },
        "showRawData": { "type": "boolean", "default": false }
      }
    }
  }
}
```

---

# PART 11: STORAGE KEYS

## localStorage Key Map

| Key | Schema | Description |
|-----|--------|-------------|
| `alongside_user` | UserProfile | Complete user profile |
| `alongside_checkins` | Array<DailyCheckIn> | Check-in history |
| `alongside_sessions` | Array<Session> | Session history |
| `alongside_activities` | Array<ActivityHistoryEntry> | Non-session activities |
| `alongside_feedback` | Array<ExerciseFeedback> | Exercise feedback history |
| `alongside_credits` | Array<CreditTransaction> | Credit transaction log |
| `alongside_settings` | AppSettings | App settings |
| `alongside_version` | string | Data schema version (for migrations) |

## Data Migration

When schema changes:

1. Check `alongside_version` on app load
2. If version mismatch, run migration function
3. Update data to new schema
4. Update `alongside_version`

```javascript
const CURRENT_SCHEMA_VERSION = "1.0.0";

function migrateData() {
  const storedVersion = localStorage.getItem('alongside_version');
  
  if (storedVersion !== CURRENT_SCHEMA_VERSION) {
    // Run migrations
    if (storedVersion === null) {
      // Fresh install, no migration needed
    } else if (storedVersion === "0.9.0") {
      // Migrate from 0.9.0 to 1.0.0
      migrateFrom090To100();
    }
    // ... etc
    
    localStorage.setItem('alongside_version', CURRENT_SCHEMA_VERSION);
  }
}
```

---

# PART 12: VALIDATION UTILITIES

## TypeScript Interfaces (For Reference)

```typescript
// These can be generated from the JSON schemas above

interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
  lastActiveAt?: string;
  onboardingComplete: boolean;
  onboardingStep?: OnboardingStep;
  personal?: PersonalInfo;
  measurements?: Measurements;
  conditions: Condition[];
  equipment: string[];
  goals: Goal[];
  availability: Availability;
  schedule?: Schedule;
  preferences: Preferences;
  accessibility: AccessibilitySettings;
  credits: CreditsAccount;
  currentProgramme?: CurrentProgramme;
}

interface Condition {
  id: string;
  area: BodyArea;
  type: ConditionType;
  status: ConditionStatus;
  duration?: ConditionDuration;
  typicalPain: number;
  typicalDifficulty?: number;
  triggers?: string;
  notes?: string;
  createdAt: string;
  lastUpdated: string;
}

interface Goal {
  id: string;
  type: GoalType;
  userDescription?: string;
  target?: GoalTarget;
  startDate?: string;
  targetDate?: string;
  targetFlexibility: 'soft' | 'hard';
  startingValue?: number;
  currentValue?: number;
  priority: Priority;
  status: GoalStatus;
  requirements: GoalRequirement[];
  constraints: GoalConstraint[];
  milestones: GoalMilestone[];
}

// ... etc
```

---

# DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | Claude (with Graeme) | Initial JSON schemas |

---

**This document defines all data structures for Alongside. All code that reads or writes data must conform to these schemas.**
