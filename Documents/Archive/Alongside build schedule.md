# ALONGSIDE: Build Schedule & Launch Plan

> ## ⚠️ SUPERSEDED PRICING — SAFE TO IGNORE
>
> **This document quotes £9.99/month and/or £89/year. Those figures are retired.**
>
> **The confirmed price is £7.99 a month, or £49.99 for the year** (launch rate to
> the end of November 2026; £59.99/year thereafter; beta conversion £39.99/year).
> Source: `Documents/Business/alongside_pricing_model_20jun2026_v2.docx` §1,
> confirmed by Graeme on 13 August 2026.
>
> Nothing else in this document is affected — the reasoning, research and
> structure still stand and are worth reading. Only the numbers are old news.
> The document is kept intact rather than edited so the thinking that produced
> the change stays legible.


## From Documentation to Launch | January - June 2026

---

# OVERVIEW

## Key Milestones

| Date | Milestone | Status |
|------|-----------|--------|
| 27 Jan 2026 | Documentation complete | ✅ Done |
| 27 Feb 2026 | Exeter University Event (Demo ready) | ⬜ |
| Mid-March | Working app for Graeme | ⬜ |
| Early April | Founding Member beta opens | ⬜ |
| Mid-May | First feedback cycle complete | ⬜ |
| June 2026 | Public launch with monetisation | ⬜ |

## Time Budget Reality

| Your Commitment | Hours/Week |
|-----------------|------------|
| Available for Alongside | 10-15 hrs |
| Weekday evenings (2hrs × 3) | 6 hrs |
| Weekend (half day) | 4-5 hrs |
| Buffer for life | Variable |

**This schedule assumes 10-12 hours/week. Adjust if you have more or less.**

---

# PHASE 1: BUILD CORE (Weeks 1-5)
## 27 January - 2 March 2026

**Goal:** Working app that YOU can use daily, demo-ready for Exeter event

---

## WEEK 1: 27 Jan - 2 Feb
### Foundation & Repository Setup

| Day | Task | Time | Done |
|-----|------|------|------|
| Mon | Create new GitHub repo `alongside-app` | 30min | ⬜ |
| Mon | Set up folder structure per Doc 7 | 30min | ⬜ |
| Mon | Create base HTML shell with CSS variables | 1hr | ⬜ |
| Tue | Implement colour system from Doc 7 | 1hr | ⬜ |
| Tue | Implement typography system | 1hr | ⬜ |
| Wed | Build button components (all states) | 1.5hr | ⬜ |
| Thu | Build card components | 1.5hr | ⬜ |
| Sat | Build input components (slider, select) | 2hr | ⬜ |
| Sat | Build navigation shell | 1hr | ⬜ |
| Sun | Review, test on mobile, commit | 1hr | ⬜ |

**Week 1 Deliverable:** Component library working, app shell loads

**Total Hours:** ~11 hours

### How To: Create GitHub Repo

```bash
# 1. Go to github.com, click "New Repository"
# 2. Name: alongside-app
# 3. Public or Private (your choice)
# 4. Clone to your computer:
git clone https://github.com/YOUR-USERNAME/alongside-app.git
cd alongside-app

# 5. Create folder structure:
mkdir -p css/base css/components css/layouts css/utilities
mkdir -p js/engines js/coach js/views js/data
mkdir -p data/exercises data/programmes
mkdir -p audio docs

# 6. Copy your documentation into /docs
```

---

## WEEK 2: 3 Feb - 9 Feb
### Data Layer & Storage

| Day | Task | Time | Done |
|-----|------|------|------|
| Mon | Create store.js (localStorage wrapper) | 1.5hr | ⬜ |
| Mon | Implement user profile schema | 1hr | ⬜ |
| Tue | Implement check-in schema | 1hr | ⬜ |
| Tue | Implement session schema | 1hr | ⬜ |
| Wed | Create exercise JSON files (your 12 core) | 2hr | ⬜ |
| Thu | Create Hip Recovery programme JSON | 1.5hr | ⬜ |
| Sat | Create Hamstring Rehab programme JSON | 1.5hr | ⬜ |
| Sat | Create Core Stability programme JSON | 1hr | ⬜ |
| Sun | Test data loading, debug | 1hr | ⬜ |

**Week 2 Deliverable:** All data structures working, your programmes loadable

**Total Hours:** ~11.5 hours

### How To: Structure Exercise JSON

Follow Doc 5 (JSON Schemas) exactly. Example file `data/exercises/hip-flexor-stretch.json`:

```json
{
  "id": "hip-flexor-stretch",
  "name": "Hip Flexor Stretch",
  "category": "mobility",
  "equipment": { "required": ["mat"], "optional": [] },
  "affectsAreas": ["hip-flexors", "quads"],
  "contraindications": ["acute-knee-injury"],
  "defaultPrescription": {
    "sets": 2,
    "holdTime": 45,
    "perSide": true,
    "rest": 15
  }
  // ... rest per schema
}
```

---

## WEEK 3: 10 Feb - 16 Feb
### Onboarding Flow

| Day | Task | Time | Done |
|-----|------|------|------|
| Mon | Build onboarding controller (state machine) | 1.5hr | ⬜ |
| Mon | Build Screen 1: Welcome | 45min | ⬜ |
| Tue | Build Screen 2: Name | 45min | ⬜ |
| Tue | Build Screen 3: Goals (multi-select) | 1hr | ⬜ |
| Wed | Build Screen 5: Conditions overview | 1hr | ⬜ |
| Wed | Build Screen 5b: Body map | 1.5hr | ⬜ |
| Thu | Build Screen 6: Equipment | 1hr | ⬜ |
| Sat | Build Screen 7: Time availability | 1hr | ⬜ |
| Sat | Build Screen 9: Coach personality (Steady only for now) | 45min | ⬜ |
| Sun | Build Screen 11: Plan reveal | 1hr | ⬜ |
| Sun | Test full onboarding flow | 1hr | ⬜ |

**Week 3 Deliverable:** Complete onboarding flow working

**Total Hours:** ~12 hours

### How To: Onboarding State Machine

Follow Doc 4 (Onboarding Flow) and Doc 6 (Check-in) state machine pattern:

```javascript
// js/views/onboarding/controller.js
const OnboardingController = {
  currentScreen: 'welcome',
  userData: {},
  
  screens: ['welcome', 'name', 'goals', 'conditions', 'equipment', 'time', 'coach', 'reveal'],
  
  next() {
    const currentIndex = this.screens.indexOf(this.currentScreen);
    this.currentScreen = this.screens[currentIndex + 1];
    this.render();
  },
  
  render() {
    // Load appropriate screen component
  }
};
```

---

## WEEK 4: 17 Feb - 23 Feb
### Daily Check-in & Coach Response

| Day | Task | Time | Done |
|-----|------|------|------|
| Mon | Build check-in controller | 1hr | ⬜ |
| Mon | Build energy screen (1-10 slider) | 1hr | ⬜ |
| Tue | Build mood screen (1-10 slider) | 45min | ⬜ |
| Tue | Build conditions screen (pain per condition) | 1.5hr | ⬜ |
| Wed | Build Coach greeting logic | 1hr | ⬜ |
| Wed | Build Coach summary/response screen | 1.5hr | ⬜ |
| Thu | Implement safety checks (burnout detection) | 1.5hr | ⬜ |
| Sat | Create Coach scripts JSON (Steady only) | 1.5hr | ⬜ |
| Sat | Wire up Coach voice to check-in data | 1hr | ⬜ |
| Sun | Test full check-in flow | 1hr | ⬜ |

**Week 4 Deliverable:** Check-in works, Coach responds appropriately

**Total Hours:** ~12 hours

### How To: Burnout Detection

Follow Doc 1 (Architecture) Part 4 and Doc 6 exactly:

```javascript
// js/engines/safety.js
function detectBurnout(todayCheckin, history) {
  const last3 = history.slice(-3);
  
  // Pattern 1: Energy ≤3 for 3 days
  const lowEnergy = last3.length >= 3 && 
    last3.every(c => c.energy <= 3);
  
  // Pattern 2: Mood ≤4 for 3 days  
  const lowMood = last3.length >= 3 && 
    last3.every(c => c.mood <= 4);
  
  return {
    detected: lowEnergy || lowMood,
    patterns: { lowEnergy, lowMood }
  };
}
```

---

## WEEK 5: 24 Feb - 2 Mar
### Session Execution & Demo Polish

| Day | Task | Time | Done |
|-----|------|------|------|
| Mon | Build today's session view | 1.5hr | ⬜ |
| Mon | Build exercise card component | 1hr | ⬜ |
| Tue | Build timer component (circular) | 1.5hr | ⬜ |
| Tue | Build rep counter component | 1hr | ⬜ |
| Wed | Build session flow controller | 1.5hr | ⬜ |
| Wed | Build exercise complete / feedback screen | 1hr | ⬜ |
| Thu | **DEMO PREP:** Fix bugs, test flow | 2hr | ⬜ |
| Thu | **DEMO PREP:** Prepare talking points | 1hr | ⬜ |
| **27 Feb** | **EXETER UNIVERSITY EVENT** | - | ⬜ |
| Sat | Post-event: Note feedback received | 1hr | ⬜ |
| Sun | Fix any critical issues from demo | 2hr | ⬜ |

**Week 5 Deliverable:** Demo-ready app for Exeter event

**Total Hours:** ~13 hours

---

## EXETER EVENT PREPARATION

### What to Demo (5-10 minutes)

1. **Open app** → Coach greeting
2. **Quick check-in** → Show energy/mood sliders
3. **Coach responds** → "Based on your check-in, here's today's session"
4. **Show session** → Exercise cards with timer
5. **Explain philosophy** → No streaks, burnout detection, compassion

### Talking Points

| Point | Script |
|-------|--------|
| Problem | "69% of people abandon fitness apps within 90 days. I'm one of them." |
| Solution | "Alongside is fitness coaching for people fitness culture forgot." |
| Differentiator | "No streaks. No shame. The Coach adapts to how you actually feel." |
| Target | "Neurodivergent adults, women managing hormonal changes, anyone who's felt gym shame." |
| Ask | "Looking for beta testers and feedback on the concept." |

### Materials to Bring

- [ ] Phone/tablet with app loaded
- [ ] Backup: Screenshots if WiFi fails
- [ ] Business cards or QR code to landing page
- [ ] Notepad for feedback
- [ ] Email signup sheet (paper backup)

---

# PHASE 2: COMPLETE FOR GRAEME (Weeks 6-8)
## 3 March - 23 March 2026

**Goal:** App fully functional for YOUR daily use

---

## WEEK 6: 3 Mar - 9 Mar
### Progress View & Credits

| Day | Task | Time | Done |
|-----|------|------|------|
| Mon | Build progress dashboard layout | 1.5hr | ⬜ |
| Mon | Build headline wins algorithm | 1.5hr | ⬜ |
| Tue | Build energy/mood trend graphs | 2hr | ⬜ |
| Wed | Build condition progress view | 1.5hr | ⬜ |
| Thu | Build movement calendar (non-streak) | 1.5hr | ⬜ |
| Sat | Implement credits system | 1.5hr | ⬜ |
| Sat | Build credits display and history | 1hr | ⬜ |
| Sun | Test progress with sample data | 1hr | ⬜ |

**Week 6 Deliverable:** Progress view working with real data

**Total Hours:** ~12 hours

---

## WEEK 7: 10 Mar - 16 Mar
### Session Adaptation & Difficulty Feedback

| Day | Task | Time | Done |
|-----|------|------|------|
| Mon | Build adaptation engine (energy matching) | 1.5hr | ⬜ |
| Mon | Build condition filtering (pain-based) | 1.5hr | ⬜ |
| Tue | Build difficulty feedback capture | 1hr | ⬜ |
| Tue | Build "too hard" response logic | 1hr | ⬜ |
| Wed | Implement exercise modifications display | 1.5hr | ⬜ |
| Thu | Build session history storage | 1hr | ⬜ |
| Sat | Create session rationale display ("Why this?") | 1.5hr | ⬜ |
| Sun | Full integration test | 1.5hr | ⬜ |

**Week 7 Deliverable:** Adaptive sessions based on check-in and feedback

**Total Hours:** ~11 hours

---

## WEEK 8: 17 Mar - 23 Mar
### Polish & Start Using Daily

| Day | Task | Time | Done |
|-----|------|------|------|
| Mon | Bug fixes from testing | 2hr | ⬜ |
| Tue | Mobile responsiveness fixes | 2hr | ⬜ |
| Wed | Add remaining exercises for your programmes | 2hr | ⬜ |
| Thu | Set up your personal profile properly | 1hr | ⬜ |
| Thu | **START USING DAILY** | - | ⬜ |
| Sat | Accessibility review (WCAG checklist) | 2hr | ⬜ |
| Sun | Document any issues found | 1hr | ⬜ |

**Week 8 Deliverable:** YOU are using Alongside daily

**Total Hours:** ~10 hours

---

# PHASE 3: BETA PREPARATION (Weeks 9-11)
## 24 March - 13 April 2026

**Goal:** Ready to invite Founding Members

---

## WEEK 9: 24 Mar - 30 Mar
### Landing Page & Signup

| Day | Task | Time | Done |
|-----|------|------|------|
| Mon | Design landing page (simple, one page) | 1.5hr | ⬜ |
| Mon | Write landing page copy | 1hr | ⬜ |
| Tue | Build landing page | 2hr | ⬜ |
| Wed | Set up email collection (ConvertKit free / Mailchimp) | 1hr | ⬜ |
| Wed | Create "Founding Member" signup form | 1hr | ⬜ |
| Thu | Test signup flow | 30min | ⬜ |
| Sat | Create QR code for easy sharing | 30min | ⬜ |
| Sat | Write welcome email sequence (3 emails) | 2hr | ⬜ |
| Sun | Test email sequence | 30min | ⬜ |

**Week 9 Deliverable:** Landing page live, email capture working

**Total Hours:** ~10 hours

### Landing Page Content

```
HEADLINE:
Fitness coaching for people fitness culture forgot.

SUBHEAD:
Finally, an app that listens before prescribing. No streaks. 
No shame. Just movement that adapts to your actual life.

BODY:
Built for:
• Brains that don't do streaks (ADHD-friendly)
• Bodies managing injuries or conditions
• Women whose energy fluctuates with their cycle
• Anyone who's felt like fitness apps were designed for someone else

WHAT'S DIFFERENT:
✓ Daily check-in adapts your session to how you actually feel
✓ Burnout detection protects you (not punishes you)
✓ Coach celebrates showing up, not performance
✓ Transparent rationale for every recommendation

CTA:
[Join the Founding Members - Limited to 100 people]

FOUNDING MEMBER BENEFITS:
• 3 months free access
• £49/year for life (vs £89 regular)
• 10 friend codes at same price
• Direct input on features
• Name in credits (optional)
```

---

## WEEK 10: 31 Mar - 6 Apr
### Community Outreach Preparation

| Day | Task | Time | Done |
|-----|------|------|------|
| Mon | Research ADHD communities (Reddit, Facebook, forums) | 1.5hr | ⬜ |
| Mon | Research menopause/women's health communities | 1hr | ⬜ |
| Tue | Research injury recovery communities | 1hr | ⬜ |
| Tue | Create community outreach document (for Claude 2.0) | 1.5hr | ⬜ |
| Wed | Write introduction posts (authentic, not salesy) | 2hr | ⬜ |
| Thu | Identify 5-10 communities to engage with | 1hr | ⬜ |
| Sat | Begin engaging (commenting, helping) - NOT promoting yet | 2hr | ⬜ |
| Sun | Continue genuine engagement | 1hr | ⬜ |

**Week 10 Deliverable:** Community strategy documented, engagement started

**Total Hours:** ~11 hours

### Community Outreach Document (For Next Claude Session)

Save this as `/docs/community-outreach-guide.md`:

```markdown
# Alongside: Community Outreach Guide

## Purpose
This document helps Claude (or future me) understand how to approach 
community outreach for Alongside authentically.

## Target Communities

### ADHD Communities
- Reddit: r/ADHD, r/adhdwomen, r/ADHDers
- Facebook: ADHD Adults, ADHD Support Groups
- Forums: ADDitude Magazine community

### Women's Health
- Reddit: r/Menopause, r/perimenopause, r/xxfitness
- Facebook: Menopause Support, Perimenopause groups
- Forums: Health Unlocked menopause

### Injury/Recovery
- Reddit: r/fitness, r/flexibility, r/overcominggravity
- Facebook: Back pain support groups, Sciatica recovery
- Forums: Physio forums

## Outreach Principles
1. Be genuinely helpful FIRST (weeks before any promotion)
2. Share personal experience authentically
3. Never spam or hard-sell
4. Only mention Alongside when directly relevant
5. Focus on the problem, not the product

## Sample Introduction Post (After 2+ Weeks Engaging)

"Hey everyone - I've been part of this community for a few weeks 
and really appreciate the support here. 

I wanted to share something I've been working on. As someone with 
ADHD who has abandoned every fitness app I've tried, I got frustrated 
and started building my own.

It's called Alongside - fitness coaching designed around how we 
actually function. No streaks (because missing a day isn't failure). 
Burnout detection (so it tells YOU to rest). Daily check-ins that 
adapt the workout to your actual energy.

I'm looking for 100 Founding Members to test it and help shape it. 
Free for 3 months, then £49/year for life if you want to continue.

Anyone interested? Happy to answer questions about how it works."

## Tracking
| Community | Joined | First Helpful Post | First Mention | Signups |
|-----------|--------|-------------------|---------------|---------|
| r/ADHD | | | | |
| r/adhdwomen | | | | |
| ... | | | | |
```

---

## WEEK 11: 7 Apr - 13 Apr
### Beta Infrastructure & Feedback Systems

| Day | Task | Time | Done |
|-----|------|------|------|
| Mon | Build in-app feedback button | 1.5hr | ⬜ |
| Mon | Create feedback form (simple: rating + text) | 1hr | ⬜ |
| Tue | Set up feedback collection (Airtable/Google Forms) | 1hr | ⬜ |
| Tue | Create beta user onboarding email | 1hr | ⬜ |
| Wed | Create "How to give feedback" guide | 1hr | ⬜ |
| Wed | Build Friend Code generation system | 1.5hr | ⬜ |
| Thu | Test Friend Code flow | 1hr | ⬜ |
| Sat | Create beta user welcome screen in app | 1hr | ⬜ |
| Sat | Final beta prep checklist | 1hr | ⬜ |
| Sun | **BETA SOFT LAUNCH** - Invite first 10-20 users | 1hr | ⬜ |

**Week 11 Deliverable:** Beta infrastructure ready, first users invited

**Total Hours:** ~11 hours

### Friend Code System

```javascript
// Simple friend code system
const FriendCodes = {
  generate(userId) {
    // Generate unique code like "ALONGSIDE-GRAEME-7X2K"
    const code = `ALONGSIDE-${userId.toUpperCase()}-${randomString(4)}`;
    this.store(code, userId);
    return code;
  },
  
  validate(code) {
    // Check if code exists and not expired
    return this.codes[code] && !this.codes[code].used;
  },
  
  redeem(code, newUserId) {
    // Mark code as used, apply Founding Member pricing
    this.codes[code].used = true;
    this.codes[code].redeemedBy = newUserId;
    // Grant new user Founding Member status
  }
};
```

---

# PHASE 4: BETA PERIOD (Weeks 12-19)
## 14 April - 8 June 2026

**Goal:** 50-100 active beta users, collect feedback, iterate

---

## WEEK 12: 14 Apr - 20 Apr
### Beta Launch & Community Posts

| Day | Task | Time | Done |
|-----|------|------|------|
| Mon | Post in first community (ADHD-focused) | 1hr | ⬜ |
| Tue | Post in second community (women's health) | 1hr | ⬜ |
| Wed | Respond to all comments/questions | 1hr | ⬜ |
| Thu | Personal outreach to contacts who'd benefit | 1hr | ⬜ |
| Sat | Monitor signups, send welcome emails | 1hr | ⬜ |
| Sat | Fix any urgent bugs reported | 2hr | ⬜ |
| Sun | Weekly review: Signups, issues, feedback | 1hr | ⬜ |

**Week 12 Target:** 30+ signups, 20+ active users

**Total Hours:** ~8 hours

---

## WEEKS 13-14: 21 Apr - 4 May
### First Feedback Cycle

| Task | Week 13 | Week 14 |
|------|---------|---------|
| Monitor daily usage stats | ⬜ | ⬜ |
| Respond to feedback within 24hrs | ⬜ | ⬜ |
| Send "How's it going?" email | ⬜ | - |
| Collect formal feedback survey | - | ⬜ |
| Identify top 3 issues | - | ⬜ |
| Fix critical bugs | ⬜ | ⬜ |
| Post update to community | - | ⬜ |

**Feedback Survey Questions:**

1. How many times have you used Alongside in the past 2 weeks?
2. What do you like most so far?
3. What's frustrating or confusing?
4. Would you recommend this to a friend? (1-10)
5. What's one feature you wish it had?
6. Any other thoughts?

---

## WEEKS 15-16: 5 May - 18 May
### Second Feedback Cycle & Iteration

| Task | Week 15 | Week 16 |
|------|---------|---------|
| Implement top-requested feature | ⬜ | ⬜ |
| Fix top-reported bugs | ⬜ | ⬜ |
| Second community push | ⬜ | - |
| Send "What's new" update to beta users | - | ⬜ |
| Collect second feedback survey | - | ⬜ |
| Request testimonials from engaged users | - | ⬜ |

**Week 16 Target:** 75+ signups, 40+ active users, 5+ testimonials

---

## WEEKS 17-18: 19 May - 1 June
### Payment Integration & Launch Prep

| Task | Week 17 | Week 18 |
|------|---------|---------|
| Set up Stripe account | ⬜ | - |
| Implement subscription tiers | ⬜ | ⬜ |
| Test payment flow thoroughly | - | ⬜ |
| Create pricing page | ⬜ | - |
| Set up Founding Member pricing in Stripe | ⬜ | - |
| Update Friend Code system for paid tiers | - | ⬜ |
| Final beta feedback survey | - | ⬜ |
| Prepare launch announcement | - | ⬜ |

---

## WEEK 19: 2 Jun - 8 Jun
### Public Launch Preparation

| Day | Task | Time | Done |
|-----|------|------|------|
| Mon | Finalize launch messaging | 1.5hr | ⬜ |
| Tue | Create launch posts for each community | 2hr | ⬜ |
| Wed | Notify beta users of transition to paid | 1hr | ⬜ |
| Wed | Send "Last chance for Founding Member" email | 1hr | ⬜ |
| Thu | Final bug sweep | 2hr | ⬜ |
| Sat | **LAUNCH DAY** - Post everywhere | 3hr | ⬜ |
| Sun | Monitor, respond, celebrate | 2hr | ⬜ |

---

# PHASE 5: POST-LAUNCH (Weeks 20+)
## 9 June 2026 onwards

**Goal:** Sustainable growth, ongoing iteration

---

## Ongoing Weekly Schedule

| Day | Task | Time |
|-----|------|------|
| Monday | Review metrics (users, retention, revenue) | 30min |
| Monday | Respond to feedback/support | 30min |
| Tuesday | Community engagement | 1hr |
| Wednesday | Development (features/fixes) | 2hr |
| Thursday | Development continued | 2hr |
| Saturday | Development focused block | 3hr |
| Sunday | Planning next week | 30min |

**Total:** ~10 hours/week maintenance + development

---

## Metrics to Track Weekly

| Metric | Target | Week: |
|--------|--------|-------|
| Total signups | Growth | |
| Active users (7-day) | 50%+ of signups | |
| Day 7 retention | 30%+ | |
| Day 30 retention | 15%+ | |
| Paid conversions | 5%+ of active | |
| MRR (Monthly Recurring Revenue) | Growth | |
| NPS / Would recommend | 8+ average | |
| Support tickets | Manageable | |

---

# QUICK REFERENCE: WHAT TO DO WHEN

## If Stuck on Technical Problem
1. Check your documentation first
2. Search Stack Overflow
3. Start new Claude chat with specific question + code
4. Take a break, return fresh

## If Running Behind Schedule
1. Cut scope, not quality
2. Focus on what YOU need to use it
3. Beta features can come later
4. Ship something > ship perfect

## If Motivation Drops
1. Use your own app
2. Re-read your "why"
3. Look at positive feedback
4. Take a rest week (practice what you preach)

## If Beta Feedback is Negative
1. Thank them genuinely
2. Look for patterns (one complaint vs many)
3. Fix critical issues fast
4. Communicate what you're doing

## If Nobody Signs Up
1. Are you in the right communities?
2. Is your message resonating?
3. Ask: "What would make you try this?"
4. Iterate on positioning

---

# HANDOFF DOCUMENT: FOR NEXT CLAUDE SESSION

When you start a new chat about community outreach, share this:

```
## Context for Claude

I'm building "Alongside" - a compassionate fitness coaching app 
for people traditional fitness culture has failed (ADHD, injuries, 
menopause, gym shame).

Key documents exist in my Claude Project:
- alongside-complete-architecture.md (how it works)
- alongside-market-research.md (target users, competition)
- /docs/community-outreach-guide.md (community strategy)

Current status: [Update this]
- App build: [Phase X, Week Y]
- Landing page: [Live / Not yet]
- Signups: [Number]
- Beta users: [Number]

What I need help with today:
[Specific request - e.g., "Help me write an authentic introduction 
post for r/ADHD that shares my story without being salesy"]

Key principles for Alongside messaging:
- Lead with empathy, not features
- No shame language ever
- Authentic personal story
- Problem-focused, not product-focused
- Invite, don't push
```

---

# MASTER CHECKLIST

## Phase 1: Build Core (Weeks 1-5) ⬜

- [ ] Week 1: Foundation & components
- [ ] Week 2: Data layer & storage
- [ ] Week 3: Onboarding flow
- [ ] Week 4: Check-in & Coach
- [ ] Week 5: Sessions & Exeter demo

## Phase 2: Complete for Graeme (Weeks 6-8) ⬜

- [ ] Week 6: Progress & credits
- [ ] Week 7: Adaptation & feedback
- [ ] Week 8: Polish & daily use

## Phase 3: Beta Preparation (Weeks 9-11) ⬜

- [ ] Week 9: Landing page & signup
- [ ] Week 10: Community outreach prep
- [ ] Week 11: Beta infrastructure

## Phase 4: Beta Period (Weeks 12-19) ⬜

- [ ] Week 12: Beta launch
- [ ] Weeks 13-14: First feedback cycle
- [ ] Weeks 15-16: Second feedback cycle
- [ ] Weeks 17-18: Payment integration
- [ ] Week 19: Public launch

## Phase 5: Post-Launch (Week 20+) ⬜

- [ ] Ongoing: Weekly rhythm established
- [ ] Ongoing: Metrics tracking
- [ ] Ongoing: Community engagement
- [ ] Ongoing: Feature development

---

**You've got this, Graeme. One week at a time.**
