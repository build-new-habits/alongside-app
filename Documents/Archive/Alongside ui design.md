# ALONGSIDE: UI/UX Visual Design
## Complete Design System v1.0 | January 2026

---

# PART 1: DESIGN PHILOSOPHY

## What Alongside Looks Like

Alongside should feel like a **calm, supportive space** - not a gym, not a hospital, not a productivity app. 

### Visual Personality

| Attribute | Alongside | NOT Alongside |
|-----------|-----------|---------------|
| Energy | Calm, grounded | Aggressive, pumped |
| Colour | Warm, natural | Neon, harsh |
| Typography | Friendly, readable | Bold, shouty |
| Imagery | Gentle, inclusive | Athletic perfection |
| Motion | Smooth, purposeful | Bouncy, attention-grabbing |
| Density | Spacious, breathable | Cramped, overwhelming |

### Design Principles

1. **Calm over exciting** - No visual urgency. Everything can wait.
2. **Warm over clinical** - Feels human, not medical or technical.
3. **Clear over clever** - Obvious beats innovative.
4. **Accessible by default** - Not an afterthought.
5. **One thing at a time** - Reduce cognitive load always.

---

## Target Aesthetic

Think:
- A cosy coffee shop, not a gym
- A thoughtful journal, not a dashboard
- A supportive friend, not a drill sergeant
- A quiet morning, not a busy afternoon

**Mood board keywords:** Warm, soft, natural, supportive, gentle, grounded, spacious, breathable, trustworthy, calm

---

# PART 2: COLOUR SYSTEM

## Primary Palette

### Brand Colours

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Sage** (Primary) | `#7B9E87` | 123, 158, 135 | Primary actions, active states |
| **Sage Light** | `#A8C5B0` | 168, 197, 176 | Hover states, backgrounds |
| **Sage Dark** | `#5A7A64` | 90, 122, 100 | Pressed states, emphasis |
| **Cream** (Background) | `#FAF8F5` | 250, 248, 245 | Primary background |
| **Warm White** | `#FFFFFF` | 255, 255, 255 | Cards, elevated surfaces |
| **Charcoal** (Text) | `#2D3436` | 45, 52, 54 | Primary text |
| **Slate** | `#636E72` | 99, 110, 114 | Secondary text |

### Semantic Colours

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#27AE60` | Completed, positive feedback |
| **Warning** | `#F39C12` | Caution, moderate pain |
| **Danger** | `#E74C3C` | High pain, blocked |
| **Info** | `#3498DB` | Information, tips |

### Energy/Mood Scale Colours

Gradient from low to high:

| Level | Colour | Hex |
|-------|--------|-----|
| 1-2 | Deep Coral | `#E57373` |
| 3-4 | Soft Orange | `#FFB74D` |
| 5-6 | Warm Yellow | `#FFF176` |
| 7-8 | Soft Green | `#AED581` |
| 9-10 | Vibrant Green | `#81C784` |

### Phase Colours (Programmes)

| Phase | Colour | Hex |
|-------|--------|-----|
| Release/Foundation | Soft Green | `#4CAF50` |
| Build/Stability | Calm Blue | `#2196F3` |
| Strengthen/Progress | Warm Purple | `#9C27B0` |
| Recovery | Soft Pink | `#F8BBD9` |

### Menstrual Cycle Phase Colours

| Phase | Colour | Hex |
|-------|--------|-----|
| Menstruation | Soft Red | `#FFCDD2` |
| Follicular | Fresh Green | `#C8E6C9` |
| Ovulation | Bright Yellow | `#FFF9C4` |
| Luteal | Soft Blue | `#BBDEFB` |

---

## Colour Usage Rules

### Text on Backgrounds

| Background | Primary Text | Secondary Text |
|------------|--------------|----------------|
| Cream (`#FAF8F5`) | Charcoal (`#2D3436`) | Slate (`#636E72`) |
| White (`#FFFFFF`) | Charcoal (`#2D3436`) | Slate (`#636E72`) |
| Sage (`#7B9E87`) | White (`#FFFFFF`) | Cream (`#FAF8F5`) |
| Dark surfaces | White (`#FFFFFF`) | Light grey |

### Contrast Requirements (WCAG AA)

- Body text: Minimum 4.5:1 contrast ratio
- Large text (18px+): Minimum 3:1 contrast ratio
- Interactive elements: Minimum 3:1 against background
- All Alongside colour combinations meet these requirements

---

## High Contrast Mode

For users who enable high contrast:

| Normal | High Contrast |
|--------|---------------|
| Cream background | White (`#FFFFFF`) |
| Sage primary | Deep Sage (`#3D6B4A`) |
| Charcoal text | Black (`#000000`) |
| Slate secondary | Dark Grey (`#333333`) |
| All semantic colours | Darkened 20% |

---

# PART 3: TYPOGRAPHY

## Font Stack

### Primary Font: Inter

**Why Inter:**
- Highly readable at all sizes
- Excellent accessibility features
- Variable font (weight flexibility)
- Free and widely available
- Good support for screen readers

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Fallback Stack
```css
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif
```

---

## Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| **Display** | 32px / 2rem | 600 | 1.2 | Hero headings (rare) |
| **H1** | 28px / 1.75rem | 600 | 1.3 | Screen titles |
| **H2** | 24px / 1.5rem | 600 | 1.3 | Section headings |
| **H3** | 20px / 1.25rem | 600 | 1.4 | Card titles |
| **H4** | 18px / 1.125rem | 600 | 1.4 | Subsection headings |
| **Body Large** | 18px / 1.125rem | 400 | 1.6 | Coach voice, emphasis |
| **Body** | 16px / 1rem | 400 | 1.6 | Primary body text |
| **Body Small** | 14px / 0.875rem | 400 | 1.5 | Secondary text, captions |
| **Caption** | 12px / 0.75rem | 400 | 1.4 | Labels, timestamps |
| **Button** | 16px / 1rem | 500 | 1 | Button text |

---

## Type Styles

### Headings
```css
.heading-1 {
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.3;
  color: #2D3436;
  margin-bottom: 0.5em;
}
```

### Body Text
```css
.body {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
  color: #2D3436;
}

.body-secondary {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
  color: #636E72;
}
```

### Coach Voice
```css
.coach-voice {
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.6;
  color: #2D3436;
  font-style: normal; /* NOT italic - italic reduces readability */
}
```

---

## Large Text Mode

When user enables large text:

| Normal | Large | Extra Large |
|--------|-------|-------------|
| 16px body | 20px body | 24px body |
| 28px H1 | 34px H1 | 40px H1 |
| 14px caption | 18px caption | 22px caption |

Scale factor: Large = 1.25×, Extra Large = 1.5×

---

# PART 4: SPACING SYSTEM

## Base Unit

Base unit: **8px**

All spacing derives from this unit.

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight inline spacing |
| `space-2` | 8px | Default inline spacing |
| `space-3` | 12px | Compact component spacing |
| `space-4` | 16px | Default component spacing |
| `space-5` | 24px | Section spacing |
| `space-6` | 32px | Large section spacing |
| `space-7` | 48px | Screen section spacing |
| `space-8` | 64px | Major section spacing |

## Layout Spacing

| Context | Padding |
|---------|---------|
| Screen edges | 16px (mobile), 24px (tablet), 32px (desktop) |
| Card internal | 16px |
| Between cards | 16px |
| Between sections | 32px |
| Modal padding | 24px |

---

# PART 5: COMPONENTS

## Buttons

### Primary Button

```
┌─────────────────────────────┐
│                             │
│        Continue →           │
│                             │
└─────────────────────────────┘
```

**Specs:**
- Background: Sage (`#7B9E87`)
- Text: White (`#FFFFFF`)
- Font: 16px, weight 500
- Padding: 16px 32px
- Border radius: 12px
- Min height: 52px
- Min width: 120px
- Full width on mobile

**States:**
| State | Change |
|-------|--------|
| Default | As above |
| Hover | Background: Sage Light (`#A8C5B0`) |
| Active/Pressed | Background: Sage Dark (`#5A7A64`) |
| Disabled | Background: `#E0E0E0`, Text: `#9E9E9E` |
| Focus | 3px Sage outline, 2px offset |

### Secondary Button

```
┌─────────────────────────────┐
│                             │
│          Skip               │
│                             │
└─────────────────────────────┘
```

**Specs:**
- Background: Transparent
- Border: 2px Sage (`#7B9E87`)
- Text: Sage (`#7B9E87`)
- Font: 16px, weight 500
- Padding: 14px 30px (accounting for border)
- Border radius: 12px

### Text Button

```
         Skip this step
```

**Specs:**
- No background, no border
- Text: Slate (`#636E72`)
- Font: 14px, weight 400
- Underline on hover
- Padding: 8px 16px (for tap target)

### Icon Button

```
    ┌───┐
    │ ← │
    └───┘
```

**Specs:**
- Size: 44px × 44px minimum
- Icon: 24px
- Background: Transparent (or subtle on hover)
- Border radius: 8px

---

## Cards

### Standard Card

```
┌─────────────────────────────────────────┐
│                                         │
│   Card Title                            │
│   ─────────────────────────             │
│                                         │
│   Card content goes here. This is       │
│   the body text of the card.            │
│                                         │
│                        [Action Button]  │
│                                         │
└─────────────────────────────────────────┘
```

**Specs:**
- Background: White (`#FFFFFF`)
- Border: None (or 1px `#E0E0E0` if needed for definition)
- Border radius: 16px
- Padding: 16px
- Shadow: `0 2px 8px rgba(0, 0, 0, 0.08)`

### Exercise Card

```
┌─────────────────────────────────────────┐
│                                         │
│   🧘 Hip Flexor Stretch                 │
│                                         │
│   2 sets × 45 seconds each side         │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  Why: Releases tension that     │   │
│   │  affects your lower back        │   │
│   └─────────────────────────────────┘   │
│                                         │
│   [Expand ▼]                            │
│                                         │
└─────────────────────────────────────────┘
```

**Specs:**
- Same as standard card
- Icon: Left of title
- Prescription: Body Small, Slate colour
- "Why" section: Subtle background (`#F5F5F5`), rounded corners

### Session Card

```
┌─────────────────────────────────────────┐
│                                         │
│   Today's Session                       │
│   ─────────────────────────             │
│                                         │
│   🎯 Core Stability                     │
│   ⏱️ 20 minutes  •  ⭐ 55 credits       │
│                                         │
│   "Building the foundation that         │
│   protects your back while running."    │
│                                         │
│            [Start Session →]            │
│                                         │
└─────────────────────────────────────────┘
```

---

## Input Components

### Slider (1-10 Scale)

```
┌─────────────────────────────────────────┐
│                                         │
│   How's your energy?                    │
│                                         │
│              ┌─────┐                    │
│              │  6  │                    │
│              └─────┘                    │
│                                         │
│   "Decent - you've got this"            │
│                                         │
│   ●──●──●──●──●──●──○──○──○──○          │
│   1  2  3  4  5  6  7  8  9  10         │
│                                         │
└─────────────────────────────────────────┘
```

**Specs:**
- Track: 4px height, rounded, light grey (`#E0E0E0`)
- Filled track: Sage (`#7B9E87`) or energy colour gradient
- Thumb: 24px circle, white with Sage border, shadow
- Tap targets: Each number is tappable (44px minimum)
- Current value: Large display (32px), centred above
- Description: Body text below value

### Quick Select (3 Options)

```
┌─────────────────────────────────────────┐
│                                         │
│   [  😴 Low  ] [  😐 Medium  ] [ ⚡ High ]│
│                                         │
└─────────────────────────────────────────┘
```

**Specs:**
- Each option: Minimum 44px height
- Selected: Sage background, white text
- Unselected: Light grey background, charcoal text
- Border radius: 8px
- Gap between: 8px

### Text Input

```
┌─────────────────────────────────────────┐
│                                         │
│   Your name                             │
│   ┌─────────────────────────────────┐   │
│   │ Graeme                          │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Specs:**
- Label: Body Small, Slate, above input
- Input: 16px padding, 52px min height
- Border: 2px `#E0E0E0`, rounded 8px
- Focus: Border changes to Sage
- Error: Border changes to Danger, error text below

### Multi-Select (Chips)

```
┌─────────────────────────────────────────┐
│                                         │
│   What equipment do you have?           │
│                                         │
│   [✓ Mat] [✓ Dumbbells] [ Kettlebell ]  │
│   [ Foam roller ] [✓ Resistance band ]  │
│   [ Step platform ] [ Pull-up bar ]     │
│                                         │
└─────────────────────────────────────────┘
```

**Specs:**
- Each chip: Padding 12px 16px, rounded 20px
- Selected: Sage background, white text, checkmark
- Unselected: Light grey background (`#F5F5F5`), charcoal text
- Gap: 8px
- Wrap to multiple lines

---

## Navigation

### Bottom Navigation (Mobile)

```
┌─────────────────────────────────────────┐
│                                         │
│   🏠        📊        ⚙️                │
│  Today    Progress   Settings           │
│                                         │
└─────────────────────────────────────────┘
```

**Specs:**
- Height: 64px (plus safe area on iPhone)
- Background: White
- Shadow: `0 -2px 8px rgba(0, 0, 0, 0.08)`
- Active item: Sage icon and text
- Inactive: Slate icon and text
- Icon size: 24px
- Label: 12px

### Header

```
┌─────────────────────────────────────────┐
│  ←  │      Screen Title         │  ⚙️  │
└─────────────────────────────────────────┘
```

**Specs:**
- Height: 56px
- Background: Transparent or Cream
- Back button: Left aligned
- Title: Centred, H3 style
- Action button: Right aligned

---

## Progress Indicators

### Progress Bar

```
[████████░░░░░░░░░░] 45%
```

**Specs:**
- Height: 8px
- Background: Light grey (`#E0E0E0`)
- Fill: Sage (`#7B9E87`)
- Border radius: 4px

### Progress Dots (Onboarding)

```
● ● ● ◐ ○ ○ ○ ○ ○ ○
```

**Specs:**
- Dot size: 8px
- Completed: Sage filled
- Current: Sage outline, partial fill
- Upcoming: Light grey outline
- Gap: 8px

### Circular Progress (Timer)

```
      ┌─────────┐
     ╱           ╲
    │     32     │
    │    secs    │
     ╲           ╱
      └─────────┘
```

**Specs:**
- Size: 120px diameter
- Track: 8px, light grey
- Progress: 8px, Sage
- Centre text: 32px number, 14px label

---

## Feedback & Alerts

### Toast Notification

```
┌─────────────────────────────────────────┐
│  ✓  Session saved                       │
└─────────────────────────────────────────┘
```

**Specs:**
- Position: Bottom centre, 16px from bottom
- Background: Charcoal (`#2D3436`)
- Text: White
- Border radius: 8px
- Padding: 12px 16px
- Auto-dismiss: 3 seconds
- Icon: Left, matching semantic colour

### Banner (Recovery Mode)

```
┌─────────────────────────────────────────┐
│  💜  Recovery mode is active.           │
│      Your body needs rest.              │
│                     [I'm feeling better]│
└─────────────────────────────────────────┘
```

**Specs:**
- Background: Soft purple (`#F3E5F5`)
- Border-left: 4px purple
- Padding: 16px
- Dismissible or action button

### Inline Warning

```
  ⚠️ Your hamstring needs protection today
```

**Specs:**
- Icon: Warning colour
- Text: Body, charcoal
- Background: Subtle warning tint (`#FFF8E1`)
- Border radius: 8px
- Padding: 12px

---

## Coach Elements

### Coach Avatar

```
    ┌─────┐
    │ 🧠  │
    └─────┘
```

**Options:**
1. Simple icon (brain, plant, or custom)
2. Abstract shape with gradient
3. Friendly illustration

**NOT:** Human face (avoids uncanny valley, gender assumptions)

**Specs:**
- Size: 48px (small), 64px (medium), 96px (large)
- Background: Soft gradient or solid Sage
- Border radius: 50% (circle)

### Coach Speech Bubble

```
┌─────────────────────────────────────────┐
│                                         │
│   "Good energy today. I've got a solid  │
│   session ready - we're focusing on     │
│   core stability."                       │
│                                         │
└─────────────────────────────────────────┘
        ▼
```

**Specs:**
- Background: White or very light sage tint
- Border radius: 16px
- Padding: 16px
- Text: Body Large, Coach voice style
- Optional: Small tail pointing to avatar

---

# PART 6: LAYOUT PATTERNS

## Mobile-First Grid

### Breakpoints

| Name | Width | Columns | Margins |
|------|-------|---------|---------|
| Mobile | 0-599px | 4 | 16px |
| Tablet | 600-1023px | 8 | 24px |
| Desktop | 1024px+ | 12 | 32px |

### Max Content Width
- Desktop: 1200px max
- Content centred beyond that

---

## Screen Layouts

### Standard Screen (Mobile)

```
┌─────────────────────────────────────────┐
│  ←  │      Screen Title         │  ⚙️  │ ← Header (56px)
├─────────────────────────────────────────┤
│                                         │
│   ┌─────────────────────────────────┐   │
│   │                                 │   │
│   │         Main Content            │   │
│   │                                 │   │
│   │                                 │   │
│   │                                 │   │
│   │                                 │   │
│   │                                 │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │      Primary Action Button      │   │
│   └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│   🏠        📊        ⚙️               │ ← Bottom Nav (64px)
└─────────────────────────────────────────┘
```

### Check-in Screen

```
┌─────────────────────────────────────────┐
│           ● ● ● ◐ ○ ○                   │ ← Progress dots
├─────────────────────────────────────────┤
│                                         │
│                                         │
│         How's your energy?              │
│                                         │
│              ┌─────┐                    │
│              │  6  │                    │ ← Large value
│              └─────┘                    │
│                                         │
│         "Decent - you've got this"      │
│                                         │
│   ●──●──●──●──●──●──○──○──○──○          │ ← Slider
│   1  2  3  4  5  6  7  8  9  10         │
│                                         │
│                                         │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │          Continue →             │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Session Screen

```
┌─────────────────────────────────────────┐
│  ←  │    Core Stability        │ ⏸️ ✕  │
├─────────────────────────────────────────┤
│                                         │
│   Exercise 2 of 5                       │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │                                 │   │
│   │       Dead Bug                  │   │
│   │       3 sets × 8 each side      │   │
│   │                                 │   │
│   └─────────────────────────────────┘   │
│                                         │
│   Set 1 of 3                            │
│                                         │
│         ┌─────────────┐                 │
│        ╱               ╲                │
│       │       8        │                │ ← Rep counter
│       │      reps      │                │
│        ╲               ╱                │
│         └─────────────┘                 │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │   [−]     Reps done     [+]     │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │          Set Complete →         │   │
│   └─────────────────────────────────┘   │
│                                         │
│   💬 Give feedback                      │
│                                         │
└─────────────────────────────────────────┘
```

### Timer Screen

```
┌─────────────────────────────────────────┐
│  ←  │   Hip Flexor Stretch     │ ⏸️ ✕  │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│                                         │
│         ┌─────────────────┐             │
│        ╱                   ╲            │
│       │                     │           │
│       │         32          │           │ ← Large timer
│       │                     │           │
│        ╲                   ╱            │
│         └─────────────────┘             │
│                                         │
│          Left side                      │
│          Set 1 of 2                     │
│                                         │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │            Pause ⏸️              │   │
│   └─────────────────────────────────┘   │
│                                         │
│          Skip this exercise             │
│                                         │
└─────────────────────────────────────────┘
```

---

## Card Layouts

### List of Cards

```
┌─────────────────────────────────────────┐
│   ┌─────────────────────────────────┐   │
│   │  Card 1                         │   │
│   └─────────────────────────────────┘   │
│                                         │ ← 16px gap
│   ┌─────────────────────────────────┐   │
│   │  Card 2                         │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  Card 3                         │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Two-Column (Tablet+)

```
┌─────────────────────────────────────────────────┐
│   ┌──────────────────┐  ┌──────────────────┐   │
│   │  Card 1          │  │  Card 2          │   │
│   └──────────────────┘  └──────────────────┘   │
│                                                 │
│   ┌──────────────────┐  ┌──────────────────┐   │
│   │  Card 3          │  │  Card 4          │   │
│   └──────────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

# PART 7: ANIMATION & MOTION

## Principles

1. **Purposeful** - Animation communicates, doesn't decorate
2. **Quick** - Most transitions under 300ms
3. **Subtle** - Barely noticed, smooths experience
4. **Respectful** - Honour "reduce motion" preference

## Timing Functions

| Name | CSS | Usage |
|------|-----|-------|
| Ease out | `cubic-bezier(0, 0, 0.2, 1)` | Entering elements |
| Ease in | `cubic-bezier(0.4, 0, 1, 1)` | Exiting elements |
| Ease in-out | `cubic-bezier(0.4, 0, 0.2, 1)` | Moving elements |

## Durations

| Duration | Usage |
|----------|-------|
| 100ms | Micro-interactions (hover, press) |
| 200ms | Standard transitions (fade, colour) |
| 300ms | Screen transitions, cards |
| 500ms | Complex animations (celebration) |

## Standard Animations

### Screen Transition
- New screen slides in from right
- Previous screen fades slightly
- Duration: 300ms

### Card Appear
- Fade in + slight scale up (0.95 → 1.0)
- Staggered if multiple (50ms delay each)
- Duration: 200ms

### Button Press
- Scale down to 0.98
- Duration: 100ms

### Slider Value Change
- Number cross-fades
- Duration: 150ms

### Timer Pulse
- Subtle scale pulse every second in final 10 seconds
- Scale: 1.0 → 1.02 → 1.0
- Duration: 200ms

### Celebration (Session Complete)
- Confetti or gentle particle burst
- Duration: 1000ms
- Subtle, not overwhelming

## Reduce Motion Mode

When user enables "reduce motion":
- No sliding transitions (instant cut)
- No scale animations
- Fade transitions still allowed (200ms)
- No celebration animation (just checkmark)

---

# PART 8: ICONS

## Icon System

Using **Lucide Icons** (open source, consistent, accessible)

### Icon Sizes

| Size | Usage |
|------|-------|
| 16px | Inline with small text |
| 20px | Inline with body text |
| 24px | Standard UI icons |
| 32px | Emphasis icons |
| 48px | Feature icons |

### Common Icons

| Icon | Name | Usage |
|------|------|-------|
| ← | arrow-left | Back navigation |
| → | arrow-right | Forward, continue |
| ✕ | x | Close, cancel |
| ✓ | check | Complete, selected |
| ⚙️ | settings | Settings |
| 🏠 | home | Dashboard |
| 📊 | bar-chart-2 | Progress |
| ⏱️ | clock | Timer, duration |
| ⭐ | star | Credits |
| 💪 | dumbbell | Strength |
| 🧘 | activity | Mobility |
| ❤️ | heart | Wellbeing |
| ⚠️ | alert-triangle | Warning |
| ℹ️ | info | Information |
| ▶️ | play | Start |
| ⏸️ | pause | Pause |
| 🔊 | volume-2 | Sound on |
| 🔇 | volume-x | Sound off |

### Icon Colours

- Primary: Inherit text colour
- Interactive: Sage when clickable
- Semantic: Use semantic colours (success, warning, danger)

---

# PART 9: IMAGERY

## Photo Guidelines

### If Using Photos:

**DO:**
- Diverse body types, ages, abilities
- Realistic settings (home, outdoors)
- Calm, natural lighting
- People in comfortable clothing
- Focus on movement, not perfection

**DON'T:**
- Gym/fitness model aesthetic
- Extremely athletic bodies only
- Intense/aggressive expressions
- Heavily filtered/edited
- Intimidating poses

### Image Treatment

- Subtle desaturation (not grey, but not vibrant)
- Soft vignette
- Rounded corners (16px)

## Illustrations

**If using illustrations instead of photos:**

**Style:**
- Simple, friendly shapes
- Limited colour palette (brand colours)
- Inclusive body representations
- Abstract enough to be universal
- Not childish, but approachable

---

# PART 10: DARK MODE (FUTURE)

## Dark Mode Palette

| Light Mode | Dark Mode |
|------------|-----------|
| Cream (`#FAF8F5`) | Charcoal (`#1A1A2E`) |
| White (`#FFFFFF`) | Dark Grey (`#2D2D44`) |
| Charcoal (`#2D3436`) | White (`#FFFFFF`) |
| Slate (`#636E72`) | Light Grey (`#A0A0B0`) |
| Sage (`#7B9E87`) | Sage Light (`#A8C5B0`) |

**Note:** Dark mode is a Phase 2 feature. Light mode is default and priority.

---

# PART 11: ACCESSIBILITY CHECKLIST

## Visual

- [ ] All text meets 4.5:1 contrast ratio (AA)
- [ ] Large text meets 3:1 contrast ratio
- [ ] Colour is not the only indicator
- [ ] Focus states are clearly visible
- [ ] Touch targets are minimum 44×44px
- [ ] Text can scale to 200% without loss

## Motion

- [ ] All animations respect "reduce motion"
- [ ] No content flashes more than 3 times/second
- [ ] Auto-playing content can be paused

## Screen Reader

- [ ] All images have alt text
- [ ] All icons have aria-labels
- [ ] Heading hierarchy is correct
- [ ] Form inputs have visible labels
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced

## Interaction

- [ ] All functions available via keyboard
- [ ] Tab order is logical
- [ ] Skip links available
- [ ] No keyboard traps
- [ ] Custom components have correct ARIA roles

---

# PART 12: COMPONENT LIBRARY STRUCTURE

## CSS Architecture

```
/css/
├── base/
│   ├── reset.css           # CSS reset
│   ├── typography.css      # Type scale
│   └── variables.css       # CSS custom properties
│
├── components/
│   ├── buttons.css
│   ├── cards.css
│   ├── inputs.css
│   ├── navigation.css
│   ├── progress.css
│   ├── alerts.css
│   └── coach.css
│
├── layouts/
│   ├── grid.css
│   ├── screens.css
│   └── responsive.css
│
├── utilities/
│   ├── spacing.css
│   ├── colors.css
│   └── accessibility.css
│
├── themes/
│   ├── light.css           # Default
│   ├── dark.css            # Future
│   └── high-contrast.css
│
└── app.css                  # Main import file
```

## CSS Custom Properties

```css
:root {
  /* Colours */
  --color-sage: #7B9E87;
  --color-sage-light: #A8C5B0;
  --color-sage-dark: #5A7A64;
  --color-cream: #FAF8F5;
  --color-white: #FFFFFF;
  --color-charcoal: #2D3436;
  --color-slate: #636E72;
  
  --color-success: #27AE60;
  --color-warning: #F39C12;
  --color-danger: #E74C3C;
  --color-info: #3498DB;
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.6;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  
  /* Border radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12);
  
  /* Transitions */
  --transition-fast: 100ms ease-out;
  --transition-base: 200ms ease-out;
  --transition-slow: 300ms ease-out;
}
```

---

# DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | Claude (with Graeme) | Initial UI/UX design system |

---

**This document defines the complete visual design system for Alongside. All UI implementation should follow these specifications.**
