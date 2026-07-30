# Alongside - Build Progress Log
## Updated: 1 February 2026

---

## 📊 OVERALL STATUS

| Metric | Value |
|--------|-------|
| **Current Week** | Week 1 of 19 |
| **Current Phase** | Phase 1: Build Core |
| **Phase 1 Progress** | ~60% |
| **Overall Progress** | ~6% |
| **Next Milestone** | Exeter Demo (27 Feb 2026) |
| **On Track?** | ✅ YES - ahead of schedule |

---

## 📅 REFERENCE: Build Schedule

**Source:** `alongside-build-schedule.md` in Project Files

| Phase | Weeks | Dates | Status |
|-------|-------|-------|--------|
| Phase 1: Build Core | 1-5 | 27 Jan - 2 Mar | 🔄 IN PROGRESS (60%) |
| Phase 2: Complete for Graeme | 6-8 | 3 Mar - 23 Mar | ⬜ |
| Phase 3: Beta Preparation | 9-11 | 24 Mar - 13 Apr | ⬜ |
| Phase 4: Beta Period | 12-19 | 14 Apr - 8 Jun | ⬜ |
| Phase 5: Post-Launch | 20+ | 9 Jun+ | ⬜ |

**Key Milestones:**
- 27 Feb 2026: Exeter University Event (Demo ready)
- Mid-March: Working app for Graeme
- Early April: Founding Member beta opens
- June 2026: Public launch

---

## 📋 PHASE 1 BREAKDOWN (Weeks 1-5)

### Week 1: Foundation ✅ COMPLETE
**Dates:** 27 Jan - 2 Feb | **Status:** Done

| Task | Status |
|------|--------|
| Create GitHub repo | ✅ |
| Set up folder structure | ✅ (modular architecture - 18+ files) |
| Create base HTML shell | ✅ |
| Implement colour system | ✅ (Midnight Teal theme) |
| Implement typography | ✅ |
| Build button components | ✅ |
| Build card components | ✅ |
| Build navigation shell | ✅ |
| Logo assets | ✅ |

**Deliverable:** Component library working, app shell loads ✅

---

### Week 2: Data Layer 🔄 PARTIAL
**Dates:** 3 Feb - 9 Feb | **Status:** Started early

| Task | Status |
|------|--------|
| Create store.js | ✅ Done (ahead of schedule) |
| User profile schema | ✅ Done (via onboarding) |
| Check-in schema | ✅ Done (ahead of schedule!) |
| Session schema | 🔲 |
| Exercise JSON files | 🔲 NEXT PRIORITY |
| Programme JSON files | 🔲 |

**Deliverable:** All data structures working, programmes loadable

---

### Week 3: Onboarding ✅ COMPLETE (AHEAD OF SCHEDULE!)
**Dates:** 10 Feb - 16 Feb | **Status:** Done in Week 1!

| Task | Status |
|------|--------|
| Onboarding controller | ✅ (router.js) |
| Welcome screen | ✅ |
| Name screen | ✅ |
| About You (age, gender, hormonal) | ✅ |
| Body & Targets (weight, goals, dates) | ✅ |
| Goals (multi-select, 12 options) | ✅ |
| Conditions (12 areas + modal) | ✅ |
| Lifestyle (activity, stress, sleep) | ✅ |
| Equipment (8 categories, 60+ items, modal pop-out) | ✅ |
| Plan reveal / Complete | ✅ |

**Deliverable:** Complete onboarding flow working ✅

---

### Week 4: Check-in & Coach ✅ MOSTLY COMPLETE (AHEAD OF SCHEDULE!)
**Dates:** 17 Feb - 23 Feb | **Status:** 70% done in Week 1!

| Task | Status |
|------|--------|
| Build check-in view | ✅ |
| Energy slider (1-10 with emoji) | ✅ |
| Mood slider (1-10 with emoji) | ✅ |
| Sleep input (hours + quality) | ✅ |
| Condition pain levels | ✅ |
| Cycle day tracking | ✅ |
| Optional notes | ✅ |
| Check-in history (30 days) | ✅ |
| Burnout detection algorithm | ✅ |
| Intensity recommendation | ✅ |
| Coach rationale system | 🔲 Basic done, needs refinement |

**Deliverable:** Daily check-in working, coach provides feedback ✅

---

### Week 5: Sessions & Exeter Demo 🔲
**Dates:** 24 Feb - 2 Mar | **Status:** Not started

| Task | Status |
|------|--------|
| Exercise database (JSON files) | 🔲 NEXT PRIORITY |
| Workout generation engine | 🔲 |
| Exercise card display | 🔲 |
| Timer/counter UI | 🔲 |
| Completion tracking | 🔲 |
| Demo polish | 🔲 |
| Exeter presentation prep | 🔲 |

**Deliverable:** Demo-ready for Exeter event (27 Feb)

---

## ✅ COMPLETED THIS SESSION (1 Feb 2026)

### Daily Check-In System
- [x] Check-in view with all inputs
- [x] Energy slider (1-10) with emoji feedback
- [x] Mood slider (1-10) with emoji feedback
- [x] Sleep hours adjuster (+/- buttons)
- [x] Sleep quality selector (Poor/Okay/Good)
- [x] Condition pain levels (Low/Medium/High/Severe per condition)
- [x] Cycle day input (if hormonal tracking enabled)
- [x] Optional notes textarea
- [x] Check-in data module with history storage
- [x] 30-day history retention
- [x] Burnout detection algorithm (6 pattern types)
- [x] Intensity recommendation engine (recovery/gentle/moderate/challenging)

### Today View Updates
- [x] Check-in prompt (before check-in)
- [x] Check-in summary dashboard (after check-in)
- [x] Coach recommendation with intensity badge
- [x] Workout option cards (placeholders)
- [x] Recent history display

### Bug Fixes
- [x] Settings.js syntax error fixed
- [x] Settings page teal labels styling

---

## 🔲 NEXT SESSION: Exercise Database & Workout Generation

**Priority:** Build the exercise JSON files and workout generation

**Tasks:**
1. Create exercise JSON schema
2. Build 12 core exercises (Graeme's hip recovery focus)
3. Create exercise loader module
4. Build workout generation engine
5. Connect to check-in intensity recommendations
6. Display actual workout options (replace placeholders)

**Files to create:**
```
js/data/exercises.js       # Exercise loader & filtering
data/exercises/            # Folder for exercise JSON files
  - hip-flexor-stretch.json
  - glute-bridge.json
  - bird-dog.json
  - etc.
```

---

## 📋 BACKLOG (Committed for Later)

### Polish Phase (Before Exeter Demo)
- [ ] Coach logo on ALL screens (replace teal boxes)
- [ ] Teal headings consistency everywhere
- [ ] Skip button clarity on Conditions screen
- [ ] Welcome screen coach logo

### Phase 2 Features (After MVP)
- [ ] Body hotspot map for conditions (clickable SVG)
- [ ] Expanded conditions list (hamstring, abdominal, etc.)
- [ ] Condition severity slider
- [ ] Condition story capture

### Strategic Layer (Weeks 6-8)
- [ ] SMART goal setting
- [ ] Progressive 12-week plans
- [ ] Milestone tracking
- [ ] Progress dashboard

---

## 📁 CURRENT FILE STRUCTURE

```
alongside-app/
├── index.html
├── assets/images/
│   ├── logo-icon-small.png
│   ├── logo-icon-square.png
│   └── logo-wordmark.png
├── css/
│   ├── main.css
│   ├── base/ (variables, reset, typography)
│   ├── layouts/ (app-shell, onboarding, onboarding-fixes)
│   └── components/ (buttons, cards, equipment-modal, checkin)
└── js/
    ├── app.js (entry point)
    ├── store.js (data persistence)
    ├── router.js (navigation)
    ├── data/
    │   ├── goals.js
    │   ├── conditions.js
    │   ├── equipment.js
    │   └── checkin.js          # NEW
    └── views/
        ├── today.js            # UPDATED
        ├── progress.js
        ├── settings.js         # FIXED
        ├── checkin.js          # NEW
        └── onboarding/ (9 files)
```

---

## 🔗 LINKS

- **Live site:** https://build-new-habits.github.io/alongside-app/
- **Repository:** https://github.com/build-new-habits/alongside-app
- **Build Schedule:** `alongside-build-schedule.md` (Project Files)
- **Architecture:** `alongside-complete-architecture.md` (Project Files)

---

## 📝 NOTES FOR NEXT SESSION

1. **Start with:** Exercise database JSON files
2. **Focus:** Get 12 core exercises working for hip recovery
3. **Then:** Workout generation engine
4. **Goal:** Replace "Coming Soon" buttons with real workouts
5. **Reference:** Check exercise schema in architecture docs
6. **Remember:** Clear browser cache after GitHub updates!

---

## 🎯 BURNOUT DETECTION DETAILS

The check-in system now includes burnout detection that analyzes the last 7 days:

**Patterns detected:**
- Low energy streak (3+ days below 4/10)
- Declining energy trend
- Poor mood streak (3+ days below 4/10)
- Poor sleep streak (3+ days)
- Pain flare-up (2+ days with severe pain)

**Intensity recommendations:**
- **Recovery:** Score ≤3 - gentle movement only
- **Gentle:** Score 4-5 - light activity
- **Moderate:** Score 6-7 - normal workout
- **Challenging:** Score 8+ - push harder

---

*Last updated: 1 February 2026*
*Week 1 of 19 | Phase 1: Build Core | 60% of Phase 1 complete*
*Session work: Daily Check-In system complete*
