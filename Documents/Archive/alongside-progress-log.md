# Alongside - Build Progress Log
## Updated: 31 January 2026

---

## 📊 OVERALL STATUS

| Metric | Value |
|--------|-------|
| **Current Week** | Week 1 of 19 |
| **Current Phase** | Phase 1: Build Core |
| **Phase 1 Progress** | ~45% |
| **Overall Progress** | ~5% |
| **Next Milestone** | Exeter Demo (27 Feb 2026) |
| **On Track?** | ✅ YES - slightly ahead |

---

## 📅 REFERENCE: Build Schedule

**Source:** `alongside-build-schedule.md` in Project Files

| Phase | Weeks | Dates | Status |
|-------|-------|-------|--------|
| Phase 1: Build Core | 1-5 | 27 Jan - 2 Mar | 🔄 IN PROGRESS |
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
| Set up folder structure | ✅ (modular architecture) |
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
| Check-in schema | 🔲 NEXT |
| Session schema | 🔲 |
| Exercise JSON files | 🔲 |
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
| Goals (multi-select) | ✅ |
| About You (age, gender) | ✅ |
| Body & Targets | ✅ |
| Conditions | ✅ |
| Lifestyle | ✅ |
| Equipment | ✅ (modal pop-out) |
| Plan reveal | ✅ |

**Deliverable:** Complete onboarding flow working ✅

---

### Week 4: Check-in & Coach 🔲 NEXT
**Dates:** 17 Feb - 23 Feb | **Status:** Not started

| Task | Status |
|------|--------|
| Build check-in view | 🔲 |
| Energy slider | 🔲 |
| Mood slider | 🔲 |
| Sleep input | 🔲 |
| Condition pain levels | 🔲 |
| Check-in history (30 days) | 🔲 |
| Burnout detection | 🔲 |
| Coach rationale system | 🔲 |

**Deliverable:** Daily check-in working, coach provides feedback

---

### Week 5: Sessions & Exeter Demo 🔲
**Dates:** 24 Feb - 2 Mar | **Status:** Not started

| Task | Status |
|------|--------|
| Session generation | 🔲 |
| Exercise display | 🔲 |
| Timer/counter UI | 🔲 |
| Completion tracking | 🔲 |
| Demo polish | 🔲 |
| Exeter presentation prep | 🔲 |

**Deliverable:** Demo-ready for Exeter event (27 Feb)

---

## ✅ COMPLETED THIS SESSION

### Onboarding (9 Steps)
- [x] Welcome screen with coach greeting
- [x] Name input with validation
- [x] About You (age, gender, hormonal tracking opt-in)
- [x] Body & Targets (weight, target weight, target date/event)
- [x] Goals (12 options, multi-select)
- [x] Conditions (12 body areas + general conditions)
- [x] Lifestyle (activity level, stress, sleep quality)
- [x] Equipment (8 categories, 60+ items, modal pop-out UI)
- [x] Complete screen (summary with teal labels)

### Infrastructure
- [x] Modular JS architecture (18 files)
- [x] store.js with dot-notation paths
- [x] router.js with dynamic view loading
- [x] CSS design system (variables, components, layouts)
- [x] GitHub Pages deployment

### Bug Fixes
- [x] Age disappearing when selecting gender
- [x] Weight unit dropdown invisible
- [x] Equipment flat list → modal pop-out
- [x] Settings.js syntax error

---

## 🔲 NEXT SESSION: Daily Check-In

**Priority:** Build the check-in system (Week 4 tasks)

**Files to create:**
```
js/views/checkin.js    # Single file for check-in view
js/data/checkin.js     # Check-in data schema and history
```

**Components needed:**
1. Energy slider (1-10) with emoji feedback
2. Mood slider (1-10) with emoji feedback
3. Sleep input (hours + quality)
4. Condition pain levels (only for tracked conditions)
5. Menstrual cycle day (if tracking enabled)
6. Check-in summary & submit

**Data storage:**
- Today's check-in in store
- Last 30 days history for burnout detection
- Pattern analysis for coach recommendations

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
│   └── components/ (buttons, cards, equipment-modal)
└── js/
    ├── app.js (entry point - 20 lines)
    ├── store.js (data persistence - 120 lines)
    ├── router.js (navigation - 100 lines)
    ├── data/
    │   ├── goals.js
    │   ├── conditions.js
    │   └── equipment.js
    └── views/
        ├── today.js
        ├── progress.js
        ├── settings.js
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

1. **Fix settings.js first** (syntax error)
2. **Start check-in system** - single file approach
3. **Reference:** Check-in schema in `alongside-complete-architecture.md`
4. **Remember:** Clear browser cache after GitHub updates!
5. **Approach:** Build for Graeme first, expand for beta later

---

*Last updated: 31 January 2026*
*Week 1 of 19 | Phase 1: Build Core | 45% of Phase 1 complete*
