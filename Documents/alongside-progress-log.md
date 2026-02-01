# Alongside - Build Progress Log
## Updated: 31 January 2026

---

## ðŸ“Š OVERALL STATUS

| Metric | Value |
|--------|-------|
| **Current Week** | Week 1 of 19 |
| **Current Phase** | Phase 1: Build Core |
| **Phase 1 Progress** | ~45% |
| **Overall Progress** | ~5% |
| **Next Milestone** | Exeter Demo (27 Feb 2026) |
| **On Track?** | âœ… YES - slightly ahead |

---

## ðŸ“… REFERENCE: Build Schedule

**Source:** `alongside-build-schedule.md` in Project Files

| Phase | Weeks | Dates | Status |
|-------|-------|-------|--------|
| Phase 1: Build Core | 1-5 | 27 Jan - 2 Mar | ðŸ”„ IN PROGRESS |
| Phase 2: Complete for Graeme | 6-8 | 3 Mar - 23 Mar | â¬œ |
| Phase 3: Beta Preparation | 9-11 | 24 Mar - 13 Apr | â¬œ |
| Phase 4: Beta Period | 12-19 | 14 Apr - 8 Jun | â¬œ |
| Phase 5: Post-Launch | 20+ | 9 Jun+ | â¬œ |

**Key Milestones:**
- 27 Feb 2026: Exeter University Event (Demo ready)
- Mid-March: Working app for Graeme
- Early April: Founding Member beta opens
- June 2026: Public launch

---

## ðŸ“‹ PHASE 1 BREAKDOWN (Weeks 1-5)

### Week 1: Foundation âœ… COMPLETE
**Dates:** 27 Jan - 2 Feb | **Status:** Done

| Task | Status |
|------|--------|
| Create GitHub repo | âœ… |
| Set up folder structure | âœ… (modular architecture) |
| Create base HTML shell | âœ… |
| Implement colour system | âœ… (Midnight Teal theme) |
| Implement typography | âœ… |
| Build button components | âœ… |
| Build card components | âœ… |
| Build navigation shell | âœ… |
| Logo assets | âœ… |

**Deliverable:** Component library working, app shell loads âœ…

---

### Week 2: Data Layer ðŸ”„ PARTIAL
**Dates:** 3 Feb - 9 Feb | **Status:** Started early

| Task | Status |
|------|--------|
| Create store.js | âœ… Done (ahead of schedule) |
| User profile schema | âœ… Done (via onboarding) |
| Check-in schema | ðŸ”² NEXT |
| Session schema | ðŸ”² |
| Exercise JSON files | ðŸ”² |
| Programme JSON files | ðŸ”² |

**Deliverable:** All data structures working, programmes loadable

---

### Week 3: Onboarding âœ… COMPLETE (AHEAD OF SCHEDULE!)
**Dates:** 10 Feb - 16 Feb | **Status:** Done in Week 1!

| Task | Status |
|------|--------|
| Onboarding controller | âœ… (router.js) |
| Welcome screen | âœ… |
| Name screen | âœ… |
| Goals (multi-select) | âœ… |
| About You (age, gender) | âœ… |
| Body & Targets | âœ… |
| Conditions | âœ… |
| Lifestyle | âœ… |
| Equipment | âœ… (modal pop-out) |
| Plan reveal | âœ… |

**Deliverable:** Complete onboarding flow working âœ…

---

### Week 4: Check-in & Coach ðŸ”² NEXT
**Dates:** 17 Feb - 23 Feb | **Status:** Not started

| Task | Status |
|------|--------|
| Build check-in view | ðŸ”² |
| Energy slider | ðŸ”² |
| Mood slider | ðŸ”² |
| Sleep input | ðŸ”² |
| Condition pain levels | ðŸ”² |
| Check-in history (30 days) | ðŸ”² |
| Burnout detection | ðŸ”² |
| Coach rationale system | ðŸ”² |

**Deliverable:** Daily check-in working, coach provides feedback

---

### Week 5: Sessions & Exeter Demo ðŸ”²
**Dates:** 24 Feb - 2 Mar | **Status:** Not started

| Task | Status |
|------|--------|
| Session generation | ðŸ”² |
| Exercise display | ðŸ”² |
| Timer/counter UI | ðŸ”² |
| Completion tracking | ðŸ”² |
| Demo polish | ðŸ”² |
| Exeter presentation prep | ðŸ”² |

**Deliverable:** Demo-ready for Exeter event (27 Feb)

---

## âœ… COMPLETED THIS SESSION

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
- [x] Equipment flat list â†’ modal pop-out
- [x] Settings.js syntax error

---

## ðŸ”² NEXT SESSION: Daily Check-In

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

## ðŸ“‹ BACKLOG (Committed for Later)

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

## ðŸ“ CURRENT FILE STRUCTURE

```
alongside-app/
â”œâ”€â”€ index.html
â”œâ”€â”€ assets/images/
â”‚   â”œâ”€â”€ logo-icon-small.png
â”‚   â”œâ”€â”€ logo-icon-square.png
â”‚   â””â”€â”€ logo-wordmark.png
â”œâ”€â”€ css/
â”‚   â”œâ”€â”€ main.css
â”‚   â”œâ”€â”€ base/ (variables, reset, typography)
â”‚   â”œâ”€â”€ layouts/ (app-shell, onboarding, onboarding-fixes)
â”‚   â””â”€â”€ components/ (buttons, cards, equipment-modal)
â””â”€â”€ js/
    â”œâ”€â”€ app.js (entry point - 20 lines)
    â”œâ”€â”€ store.js (data persistence - 120 lines)
    â”œâ”€â”€ router.js (navigation - 100 lines)
    â”œâ”€â”€ data/
    â”‚   â”œâ”€â”€ goals.js
    â”‚   â”œâ”€â”€ conditions.js
    â”‚   â””â”€â”€ equipment.js
    â””â”€â”€ views/
        â”œâ”€â”€ today.js
        â”œâ”€â”€ progress.js
        â”œâ”€â”€ settings.js
        â””â”€â”€ onboarding/ (9 files)
```

---

## ðŸ”— LINKS

- **Live site:** https://build-new-habits.github.io/alongside-app/
- **Repository:** https://github.com/build-new-habits/alongside-app
- **Build Schedule:** `alongside-build-schedule.md` (Project Files)
- **Architecture:** `alongside-complete-architecture.md` (Project Files)

---

## ðŸ“ NOTES FOR NEXT SESSION

1. **Fix settings.js first** (syntax error)
2. **Start check-in system** - single file approach
3. **Reference:** Check-in schema in `alongside-complete-architecture.md`
4. **Remember:** Clear browser cache after GitHub updates!
5. **Approach:** Build for Graeme first, expand for beta later

---

*Last updated: 31 January 2026*
*Week 1 of 19 | Phase 1: Build Core | 45% of Phase 1 complete*
