/**
 * settings.js
 * 18 Aug 2026 v32
 *
 * v32 - ATHLETE-RETIRE. Dev tier switcher loses its Athlete button.
 *
 *
 * v31 - COACH-TILE. New "Your Coaching" row on the Settings landing,
 *   holding capability, the two preference controls and the
 *   reflection -- all three lifted out of Profile unchanged. The
 *   landing had three rows and a screen of empty space while the
 *   controls that decide what the coach puts in front of somebody sat
 *   below their name and age band.
 *
 *   PRICE-2 follow-up: the annual price now reads the constant rather
 *   than repeating the number in prose. Logged as 🟠 in v30 and done
 *   here rather than left -- a price that exists twice is a price
 *   that goes wrong in one place, which is exactly how v30 happened.
 *
 *
 * v30 - PRICE-2. The annual price said £49.99. Found by the new
 *   verify-price.mjs sweep on the day it was written, not by anybody
 *   looking -- this file publishes the price in prose, a second copy
 *   of a number upgrade.js holds in a constant precisely so it exists
 *   in one place. The duplication is the fault; the wrong figure was
 *   only its symptom. 🟠 Logged: this should read the constant.
 *
 *
 * v29 - NAME-1. The paid tier is "the Plan", not "Personal".
 *   Graeme's decision, 18 Aug. Copy only -- no logic, no gating
 *   and no tier boundary moved. Reasoning in js/auth.js v2.
 *
 * 16 Aug 2026 v28
 *   COUNTDOWN-1. The programme card said "Week 9 of 12". Second instance
 *   of the same fault as progress.js, found by making the gate
 *   product-wide instead of scoping it to the screen being built.
 *
 * 15 Aug 2026 v27
 *
 * v27 - PB-1. "Show your best" toggle, off by default and separate from
 *   session notes. Bests are recorded either way; this governs display.
 *
 * 15 Aug 2026 v26
 *
 * v26 - QUICK-1. sessionPace control in "How you like things". The
 *   short check-in asks energy and mood only; the pain question stays
 *   at either setting.
 *
 * 14 Aug 2026 v25
 *
 * v25 - D-3 / W2-7. "How you like things": the sessionVariety control and
 *   a reviewable, reversible list of exercises the person has asked to
 *   see less of or not at all. Deliberately not a "neurodivergent mode",
 *   and autism/ADHD deliberately not added to CONDITIONS -- see the note
 *   above renderPreferencesSection().
 *
 * 14 Aug 2026 v24
 *
 * v24 - AGE-1. The age select wrote its LABELS as values. Saving your age
 *   here stored 'Under 20' or '70+', which matched nothing anywhere, and
 *   dropped you out of the capability age trigger. Now imports AGE_CHIPS.
 *
 * 14 Aug 2026 v23
 *
 * v23 - W3-A2. Capability editor. Onboarding steps 9a-9d are forward-only,
 *   so before this a mis-tap on the chair question left somebody
 *   permanently restricted with no route back -- and capability is not
 *   static anyway. All four questions are editable here, including the two
 *   onboarding asks conditionally, because Settings is somewhere the
 *   person chose to go. "Not answered" is selectable on each, and blanking
 *   everything clears askedAt so the profile returns to its never-asked
 *   path rather than sitting at asked=true with all-null answers.
 *
 * 13 Aug 2026 v22
 *
 * v22 - A1 + A3, from the 13 Aug persona trace (blueprint
 *   alongside_blueprint_trust-tier-voice_13aug2026_v1.md).
 *
 *   A1 - DEV_PANEL_ENABLED. The developer tier switcher is fine and stays;
 *   what was not fine is that upgrade.js printed the gesture to open it in
 *   user-facing copy ("triple-tap the version number at the bottom of
 *   Settings"), on the one screen every locked feature routes to. That is
 *   how a bypass becomes a feature. The instruction is gone with the
 *   upgrade stub; the flag here is the mechanism, because a rule that
 *   lives only in a document is exactly what failed. Wrapping the LISTENER
 *   as well as the markup is the point -- hiding the panel while leaving
 *   the gesture live would leave a dead tap sequence that still fires.
 *
 *   A3 - about-plan panel. Traced across three weeks: a free user meets
 *   Personal ONLY as a padlock on something already denied. Never once as
 *   a description of what it is. For persona 2.12, whose defining trait is
 *   decision paralysis, a padlock is not information -- it is a closed
 *   door with no sign on it. The hook already existed: the About group's
 *   subtitle has read "...policies and your plan" since NAV-5 with
 *   nothing behind the last three words.
 *
 *   Deliberately the ONLY new proactive surface. P1 says the coach never
 *   sells and P3 forbids interruption on a timer. A panel somebody chooses
 *   to open breaches neither. Home, check-in and reflect would all convert
 *   better and all cost more than they are worth.
 *
 * v21 - NAV-5. Seven horizontal tabs replaced by three sections, using
 *   Graeme's own grouping: App Controls, Settings, About. Two of the
 *   three things he could not find anywhere in the app were in here, both
 *   in the fourth tab of a strip that scrolled with the scrollbar hidden.
 *   Session notes separated from Equipment -- it is a behaviour toggle,
 *   not a fact about what you own, and it was filed there because
 *   Equipment happened to be the smallest panel.
 *
 * 12 Aug 2026 v20
 *
 * v20 - VER-1. The About screen's version was hardcoded to '115' while
 *   the live cache was at v293. 178 versions of drift, on the ONLY
 *   surface that tells anybody which build their phone is running -- so
 *   every "are you on the latest?" check during device testing has been
 *   meaningless. This file's own v86 note describes exactly that
 *   confusion happening. Now read from the running service worker's
 *   cache name, and shows "unknown" rather than a confident wrong number
 *   if it cannot be read.
 *
 * 12 Aug 2026 v19
 *
 * v19 - SCHEME-1. Colour scheme control in Settings > Display: dark
 *   (default), light, high contrast. Dark is the product; the other two
 *   are adaptations somebody chooses. Uses role="radiogroup" with
 *   aria-checked rather than the [data-toggle] switch pattern, because
 *   this is one-of-three rather than on/off.
 *
 * 12 Aug 2026 v18
 *
 * v18 - LOG-1. "Weight notes" renamed "Session notes", and its copy now
 *   describes what the feature has actually recorded since 11 Aug: nine
 *   metrics, chosen per equipment. Graeme: "Weight notes should be on.
 *   But not just weight. Time, tension, elevation etc." Those already
 *   worked; the setting was describing a narrower feature than existed.
 *   Panel also no longer says "For gym sessions", because as of
 *   workout.js v11 it is not.
 *
 * 12 Aug 2026 v17
 *
 * v17 - DISP-1. New "Display" tab: text size, line spacing, letter
 *   spacing, underline links, enhanced focus outlines.
 *
 *   Pattern came from The Learning Studio via DPC Hub, which Graeme
 *   supplied. The LOGIC transferred; none of the markup or CSS did, and
 *   that was deliberate -- that codebase has its own class names,
 *   palette and type scale, so a port would have imported a second
 *   design system. This uses the existing .settings-section /
 *   .settings-field / .settings-toggle conventions so the tab reads as
 *   the seventh peer of six, not a bolt-on.
 *
 *   What was worth keeping from the source: localStorage-only with a
 *   try/catch, aria-pressed on choices, a role="status" live region on
 *   change, reset-to-defaults, and above all text size as a SCALE FACTOR
 *   on the design tokens rather than a body font-size override. That
 *   last point matters more here than it did there -- 514 font-size
 *   declarations in this codebase read a --text-* token, and a body
 *   override would have reached almost none of them.
 *
 *   NOT stored in store.js, deliberately: these must be readable before
 *   first paint by the inline script in index.html, they are
 *   device-level rather than person-level, and they should survive a
 *   store reset. See js/display-prefs.js for the full reasoning. The
 *   generic [data-toggle] handler below writes to store, so these use
 *   their own [data-disp-toggle] handler rather than being forced
 *   through it.
 *
 *   Ranges are conservative at the bottom (text 90%-160%): nothing here
 *   should let somebody shrink the app past the point where they can
 *   find the control that fixes it.
 *
 *   P3 -- offered at Settings, never in onboarding and never on a timer.
 *   Somebody eleven questions into setup does not yet know they want
 *   wider letter spacing.
 *
 * 11 Aug 2026 v16
 *
 * v16 - About panel now says why the product exists, condensed from
 *   Graeme's own words on the website rather than paraphrased. It
 *   previously showed a tier and a version number, which answers a
 *   different question from the one somebody opening About is asking.
 *
 * 11 Aug 2026 v15
 *
 * v15 — PT-4. New "Weight notes" panel, appended to the Equipment tab
 *   rather than given its own (it is gym context, and someone with no gym
 *   kit never opens that tab). Off by default; uses the existing generic
 *   [data-toggle] handler so no new wiring. Copy describes it as a note to
 *   yourself, never as tracking, progress, or personal bests — locked
 *   principle P4.
 *
 * 05 Aug 2026 v14
 *
 * v14 — Equipment panel now shows a saved-equipment summary (Home: N
 *   items / Gym: N items), split by scope. Previously just a bare
 *   "Edit equipment" button with no way to glance at what was saved.
 *   Found while investigating the gym-session location bug (05 Aug) --
 *   directly useful for confirming onboarding wasn't rushed through
 *   without redoing the whole edit flow.
 *
 * 04 Aug 2026 v13
 *
 * v13 — New "Update app" button in the About panel. Graeme: laptop was
 *   on the latest version, phone was still showing old, unstyled
 *   screens — real cache-staleness, not imagined. Checked sw.js's
 *   fetch handler before building anything: pure cache-first, a stale
 *   cached file is served without even checking the network until a
 *   new service worker fully takes over. This button goes further than
 *   the existing checkForUpdate()/applyUpdate() (app.js) — those only
 *   politely ask the current SW registration to check; this also
 *   clears every cache directly and hard-reloads regardless of SW
 *   state, so it works even if the SW itself is what's stuck.
 *
 * 04 Aug 2026 v12
 *
 * Settings view. User controls for profile, programme, goals, and preferences.
 *
 * v12 — "Edit conditions" now routes to the real Conditions Update
 *   screen (conditions-update.js, Phase D-2) instead of the limited
 *   openSheet('onboarding/conditions') bridge from v9 — that bridge
 *   only ever let you toggle which conditions exist, nothing about
 *   severity, goals, or a programme. Matches the original spec:
 *   Settings' panel is a shortcut into the same destination Home's
 *   Conditions Update door uses. "Edit equipment" untouched, still
 *   uses openSheet() as v9 fixed it.
 *
 * 05 Jul 2026 v11
 *
 * v11 — My Movement rebuild (agreed 13 May, never built — ground-truthed
 *   05 Jul: the selector was absent from the live UI entirely, not merely
 *   single-select as the old note implied). Schema-first: store.js v8
 *   changed movementIdentity from string|null to string[]. Added a "How
 *   you move" section to the Profile panel (own heading, own Save button,
 *   same pattern as Programme panel's per-subsection saves) — six chips
 *   (gym/yoga/running/walking/swimming/classes) as true multi-select,
 *   plus a separate "A mix of things" chip that's mutually exclusive with
 *   the six: choosing it clears and disables the others (with
 *   aria-disabled kept in sync), choosing any of the six clears it. Read
 *   from and written to movementIdentity as an array. Placed after "Save
 *   changes" and before the reflection section — distinct concept from
 *   name/age/gender, deserves its own save action rather than being
 *   bundled into the general profile save.
 *
 * v10 — Functional QA fix (My Week). Ground-truthed against router.js v8 and
 *   weekly-plan.js v2: the "weekly-plan" route and its view file were both
 *   intact and schema-correct — the ONLY thing missing was a way in. The
 *   14 Jun (S4-WP) "simple entry card" that used to live in this file's My
 *   Week tab was dropped somewhere across the v4–v9 Programme-panel rewrites,
 *   not deliberately, and never replaced. Restored as a "Your week" section
 *   in the Programme panel — placed directly after the weekly session target
 *   field, since both concern the shape of the week rather than the
 *   programme itself. Deliberately not styled as a bare utility link: reads
 *   store.weeklyPlan.updatedAt and speaks to what's actually true right now
 *   ("You haven't shaped a week yet" vs "Last shaped <date>"), consistent
 *   with the rest of this panel's voice (Conditions/Equipment sections do
 *   the same). No schema change — weeklyPlan already exists per schema.md
 *   v1.6+. No changes to router.js or weekly-plan.js; both were already
 *   correct.
 *
 * v9 — Back-navigation bug fix. "Edit conditions"/"Edit equipment" were
 *   calling router.navigate('onboarding/conditions' / 'onboarding/equipment')
 *   directly — a real navigation into a view built for onboarding, whose
 *   Back/Done buttons are hardcoded to onboarding-sequence destinations
 *   (conditions.js's Back button literally calls
 *   router.navigate('onboarding/goals')). That's why Back landed on
 *   onboarding goals instead of returning to Settings, and why the
 *   bottom nav vanished and onboarding progress dots appeared in its
 *   place — the view was mounting as a full onboarding page, not an
 *   "edit" screen.
 *   Fix: both actions now call openSheet() from
 *   js/views/onboarding/sheet-manager.js — the exact mechanism OB-THREAD
 *   already uses to mount these same view files inside onboarding.
 *   sheet-manager.js temporarily intercepts the bare global
 *   router.navigate() while a sheet is open, so conditions.js's hardcoded
 *   Back call just closes the sheet instead of leaking through as a real
 *   navigation. equipment.js already exports mountContainer()/
 *   setSheetDoneCallback() for this exact purpose. No changes needed to
 *   conditions.js, equipment.js, or sheet-manager.js — only the call site
 *   here. onDone callback re-renders Settings so any conditions/equipment
 *   changes made in the sheet show immediately. Nav bar now stays visible
 *   throughout, since the route never actually changes from 'settings'.
 *
 * v8 — S1/S3 fixes (second round, same day).
 *   S1: age band options were out of date. Settings still had the
 *   pre-OB-THREAD bands (Under 18/18–24/25–34/35–44/45–54/55–64/65+).
 *   Onboarding moved to Under 20/20s/30s/40s/50s/60s/70+ as part of the
 *   28 Jun OB-THREAD rewrite (confirmed against
 *   alongside_onboarding_conversation_script_28jun2026_v3). Settings
 *   never followed — a saved ageBand from onboarding wouldn't even
 *   match an option here. Updated to the current bands.
 *   S3: "Your goals" was flattening GOAL_CATEGORIES with flatMap,
 *   throwing away the category grouping onboarding uses (see
 *   screenshot: "Feel good and have energy" / "Strength and fitness" /
 *   "Running and cardio goals" etc.). Now renders one
 *   .settings-goals-category block per category with its own label,
 *   matching onboarding's presentation. Assumes cat.label exists on
 *   GOAL_CATEGORIES entries (consistent with the .label pattern used
 *   elsewhere in this file's own TABS array) — not confirmed against
 *   goals.js directly, flag if it renders blank.
 *
 * v7 — S1 fix. Coach style is Nurturing only, permanently — no other
 *   styles are planned, not just "locked for beta". Removed the
 *   Steady/Energetic/Minimal radiogroup and all "After beta" locked-
 *   option UI entirely. Replaced with a single static line. store's
 *   coachStyle field is untouched (still defaults to 'nurturing', still
 *   read elsewhere for voice logic) — this is a UI-only removal, no
 *   schema change. Removed the now-dead [data-coach-style] event
 *   listener block. Flagged separately (not done here, out of scope
 *   for Settings): audit website copy, marketing, and other Alongside
 *   product docs for any remaining "choose your coach style" language.
 *
 * v6 — OB-THREAD. New "Your reflection" section added to the Profile panel.
 *   Displays the Beat 3 reflection generated at onboarding, report-style —
 *   all five parts rendered as continuous text, no staged reveal, no
 *   Continue taps (those belong to the conversational moment in thread.js;
 *   here it's a reference document, read top to bottom like a report).
 *   Reads store.onboarding.primaryTerritory and calls getBeat3Script() live
 *   — no new schema field, no duplicated content, single source of truth
 *   stays in beat3-scripts.js.
 *   Section does not render at all if primaryTerritory is null (user chose
 *   "I'd rather not say" at Hard Before — there is nothing to reflect back).
 *   Collapsed by default behind a single "Read your reflection" button,
 *   consistent with the existing edit-conditions / edit-equipment pattern
 *   on this page. No read/unread state — it isn't a notification.
 *
 * v5 — Phase 5 (P5-ST-1, P5-ST-2, P5-ST-3):
 *   - Programme change: user can change active programme from Settings
 *   - Programme reset: user can reset current week / restart programme
 *   - Goal change: goals editable after onboarding (was missing entirely)
 *   - Activity level update: fitnessLevel updatable as user improves
 *   - Developer bypass panel: triple-tap version label → tier switcher
 *   - Coach style selector: visible but Nurturing locked in beta (note shown)
 *
 * v4 — Tier gating audit. store.isPremium() calls. Paywall toast wiring.
 *
 * Existing tabs preserved:
 *   Profile, Conditions, Equipment, Notifications, Library, Privacy
 *
 * Developer bypass panel:
 *   Triple-tap on the version label in the About section.
 *   Shows tier switcher: Free / Personal / Athlete.
 *   Writes store.tier directly. Toast confirms.
 *   No visual indicator in production — purely for development and testing.
 *   Not mentioned in any user-facing copy.
 *
 * WCAG 2.2 AA:
 *   Tab strip: role="tablist", tabs role="tab", aria-selected, aria-controls.
 *   Panels: role="tabpanel", aria-labelledby.
 *   All form controls: associated <label> via for/id or aria-label.
 *   Destructive actions (reset programme): confirmation dialog before execution.
 *   Dialog: role="dialog", aria-modal="true", aria-labelledby on heading,
 *   focus trapped within dialog, Escape closes, focus returns to trigger.
 *   Touch targets: minimum 44px.
 *   Select elements: custom styled but native semantics preserved.
 *   Reflection block (v6): collapsible region uses aria-expanded on the
 *   trigger button and aria-hidden on the content when collapsed.
 *   Weekly plan section (v10): plain button + descriptive aria-label,
 *   same pattern as Conditions/Equipment sections — no new interaction
 *   pattern introduced.
 *   Movement chips (v11): role="checkbox" with aria-checked for the six
 *   multi-select chips, disabled + aria-disabled kept in sync when
 *   "mixed" is active. Divider between the two groups uses
 *   role="separator". All chips minimum 44px touch target.
 */

import { store }          from '../store.js';
import { PRICE_MONTHLY, PRICE_ANNUAL } from "../data/pricing.js";
import { GOAL_CATEGORIES, getGoalLabel } from '../data/goals.js';
import { getProgramme, PROGRAMMES }      from '../data/programmes.js';
import { getProgressStats }              from '../data/programmeEngine.js';
import { getBeat3Script }                from '../data/beat3-scripts.js';
import {
  DISPLAY_RANGES, SCHEMES, getDisplayPref, setDisplayPref,
  resetDisplayPrefs, formatDisplayValue
} from '../display-prefs.js';
import { openSheet }                     from './onboarding/sheet-manager.js';
// W3-A2. Imported, never redefined. A second copy of these option lists
// is exactly how vocabulary drift happens, and capability answers are the
// most consequential strings in the product.
// W2-7. Names for the preference list. Reading the id back to the person
// ("bodyweight-nordic-curl-progression") would be useless and slightly
// insulting; the list has to say what they actually skipped.
import { EXERCISES } from '../data/exercises/index.js';

import {
  AGE_CHIPS,
  BALANCE_CHIPS,
  CHAIR_RISE_CHIPS,
  FLOOR_ACCESS_CHIPS,
  LEG_POWER_CHIPS,
} from '../data/onboarding-thread-data.js';

// ─── View registration ────────────────────────────────────────────────────────

export function SettingsView(router) {

  let activeTab        = 'profile';
  // A1, 13 Aug 2026. The tier switcher is a developer tool. It stays
  // reachable during beta because Graeme and testers genuinely need it,
  // and it is never advertised anywhere in user-facing copy. Flip to
  // false before public launch (January 2027). Pattern copied from
  // AGE_GATE_ENABLED in views/onboarding/thread.js -- a named const with
  // the flip condition stated, not a magic boolean.
  const DEV_PANEL_ENABLED = true;

  let devTapCount       = 0;
  let devTapTimer       = null;
  let reflectionExpanded = false;

  /**
   * NAV-5, 12 Aug 2026. Three sections, not seven tabs.
   *
   * Graeme, device pass part 4: "Changing equipment and turning on session
   * notes really hard to find. Like really really hard."
   *
   * Both lived in the Equipment tab, FOURTH of seven, in a strip that
   * scrolled horizontally with the scrollbar hidden -- so Profile,
   * Programme and Conditions sat off-screen with nothing saying they
   * existed. Two of the three things he could not find in the whole app
   * were in here.
   *
   * HIS GROUPING, agreed in conversation: "we divide into app controls,
   * about, and settings." It names a distinction the tabs never made.
   * Programme (how often the coach expects you) and Display (text size)
   * sat adjacent as if they were the same kind of thing. They are not --
   * one is a coaching decision, the other an accessibility preference.
   *
   * That missing rule is why Session notes ended up appended to Equipment
   * in the first place: Equipment was the smallest panel, 855 characters
   * and one control, so a behaviour toggle got filed by convenience.
   *
   * WHY A LIST AND NOT HOME TILES. He proposed About and App Controls as
   * tiles on Home. Home already carries eight; ten would be a longer list
   * to scan, and these are the least-used destinations in the product --
   * you set reminders once and read the story once. The actual failure was
   * that Equipment was scrolled OUT OF VIEW, not that Settings was hard to
   * reach; Settings is already one tap from the bottom nav. Three rows,
   * nothing off-screen, nothing can hide.
   */
  // NAV-5. null = the index. Not sticky: reopening Settings shows the
  // index, so somebody who went in for Display once is not dropped back
  // into Display next time wondering where everything went.
  let activeSection = null;

  const _section = id => SECTIONS.find(s => s.id === id) || SECTIONS[0];

  // NAV-7. Short labels deliberately: four must fit across a phone
  // without scrolling, and a label that needs truncating is a label that
  // will hide.
  const PANEL_LABEL = {
    notify:     "Reminders",
    liftlog:    "Notes",
    programme:  "Programme",
    profile:    "Profile",
    conditions: "Conditions",
    equipment:  "Equipment",
    display:    "Display",
    "about-story": "Story",
    "about-plan":  "Plan",
    "about-app":   "App",
    "about-data":  "Data",
    coaching:      "Coaching",
  };

  // NAV-7. Which sub-tab is open, per section. Resets when the section
  // changes so nobody re-enters a section on a tab they do not remember
  // choosing.
  let activePanel = null;

  /**
   * NAV-7, 12 Aug 2026. Sub-tabs inside each section.
   *
   * Graeme: "Inside the three doors in settings are just long scrollable
   * pages. Can these be sectioned into slideable tabs to keep it clean?"
   *
   * Yes -- and safely, which it would not have been before NAV-5. The old
   * strip failed because SEVEN tabs could not fit and scrolled with the
   * scrollbar hidden, so three of them were invisible. Three and four fit
   * across a phone without scrolling, and the CSS below has no
   * overflow-x, so if a label ever grows past the width it wraps rather
   * than hiding.
   *
   * Each `panels` entry becomes one tab. About was a single 24,000-
   * character panel rather than several, so it is split by what the
   * content actually is: the story, the app itself, and your data.
   */
  const SECTIONS = [
    {
      id: 'controls',
      label: 'App Controls',
      sub: 'Reminders, session notes, and your programme',
      panels: ['notify', 'liftlog', 'programme'],
    },
    {
      id: 'settings',
      label: 'Settings',
      sub: 'Your profile, conditions, equipment and display',
      panels: ['profile', 'conditions', 'equipment', 'display'],
    },
    {
      // COACH-TILE, 18 Aug 2026. Graeme, on device: the Settings landing
      // has "loads of space" and these controls were buried three levels
      // down inside Profile, underneath name and age band.
      //
      // They are the highest-value controls in the product -- capability
      // decides what the coach will and will not put in front of you,
      // and the two preference controls decide how much a session
      // changes and how much the coach asks before one. Filing them
      // under "Profile" made them read as personal details rather than
      // as the dials they are, which is the same findability fault NAV-5
      // fixed for session notes.
      id: 'coaching',
      label: 'Your Coaching',
      sub: 'What your body can do, how sessions are built, and your reflection',
      panels: ['coaching'],
    },
    {
      id: 'about',
      label: 'About',
      sub: 'The story behind Alongside, policies and your plan',
      panels: ['about-story', 'about-plan', 'about-app', 'about-data'],
    },
  ];

  // Kept so deep links and the developer bypass still resolve.
  const TABS = [
    { id: 'profile',     label: 'Profile'     },
    { id: 'programme',   label: 'Programme'   },
    { id: 'conditions',  label: 'Conditions'  },
    { id: 'equipment',   label: 'Equipment'   },
    { id: 'notify',      label: 'Reminders'   },
    { id: 'display',     label: 'Display'     },
    { id: 'about',       label: 'About'       },
    { id: 'about-plan',  label: 'Your plan'   },
    { id: 'coaching',    label: 'Your Coaching' },
  ];

  // v11 — My Movement rebuild. Matches store.js's movementIdentity
  // string[] values. "mixed" is handled separately, below, since it's
  // mutually exclusive with these six rather than a seventh peer option.
  const MOVEMENT_IDENTITIES = [
    { id: 'gym',      label: 'Gym',      icon: '●' },
    { id: 'yoga',     label: 'Yoga',     icon: '◌' },
    { id: 'running',  label: 'Running',  icon: '→' },
    { id: 'walking',  label: 'Walking',  icon: '↝' },
    { id: 'swimming', label: 'Swimming', icon: '≈' },
    { id: 'classes',  label: 'Classes',  icon: '◆' },
  ];

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(container) {
    render(container);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  function render(container) {
    container.innerHTML = `
      <div class="settings-view" role="main" aria-label="Settings">

        ${activeSection === null ? `

          <h1 class="settings-title">Settings</h1>

          <!-- NAV-5. Three rows. Nothing scrolls, so nothing hides. -->
          <nav class="settings-index" aria-label="Settings sections">
            ${SECTIONS.map(s => `
              <button class="settings-index__row" data-section="${s.id}">
                <span class="settings-index__text">
                  <span class="settings-index__label">${s.label}</span>
                  <span class="settings-index__sub">${s.sub}</span>
                </span>
                <span class="settings-index__chevron" aria-hidden="true">&rsaquo;</span>
              </button>
            `).join('')}
          </nav>

        ` : `

          <div class="settings-section-header">
            <button class="btn btn-ghost" id="settings-back-btn"
                    aria-label="Back to all settings">
              &larr; Settings
            </button>
          </div>
          <h1 class="settings-title">${_section(activeSection).label}</h1>

          ${(() => {
            // NAV-7. Sub-tabs. Safe here in a way the old seven-tab strip
            // was not: three and four fit across a phone, and the CSS has
            // no overflow-x, so a label can never scroll out of sight.
            const panels = _section(activeSection).panels;
            const open   = panels.includes(activePanel) ? activePanel : panels[0];

            // A single-panel section gets no tabs at all. One tab is not a
            // choice, it is decoration.
            const tabs = panels.length < 2 ? "" : `
              <div class="settings-subtabs" role="tablist"
                   aria-label="${_section(activeSection).label} sections">
                ${panels.map(id => `
                  <button class="settings-subtab ${id === open ? "settings-subtab--active" : ""}"
                          role="tab"
                          aria-selected="${id === open}"
                          aria-controls="settings-panel-${id}"
                          data-panel="${id}">
                    ${PANEL_LABEL[id] || id}
                  </button>
                `).join("")}
              </div>`;

            return `
              ${tabs}
              <div class="settings-panels">
                <div class="settings-panel settings-panel--active"
                     role="tabpanel" id="settings-panel-${open}">
                  ${renderPanel(open)}
                </div>
              </div>`;
          })()}

        `}

      </div>
    `;

    attachEvents(container);
  }

  // ── Panel router ───────────────────────────────────────────────────────────

  function renderPanel(tabId) {
    switch (tabId) {
      case 'profile':    return renderProfilePanel();
      case 'coaching':   return renderCoachingPanel();
      case 'programme':  return renderProgrammePanel();
      case 'conditions': return renderConditionsPanel();
      // NAV-5. Session notes is its own panel now, not a lodger in
      // Equipment. It is a behaviour toggle; Equipment is a fact about
      // what you own. Filing them together is what made it unfindable.
      case 'equipment':  return renderEquipmentPanel();
      case 'liftlog':    return renderLiftLogPanel();
      case 'notify':     return renderNotifyPanel();
      case 'display':    return renderDisplayPanel();
      // 'about' removed with NAV-7: the section now references the three
      // split ids, so a bare 'about' case is unreachable. The gate caught
      // it, which is the gate doing exactly its job.
      case 'about-plan':   return renderPlanPanel();
      case 'about-story':  return renderAboutPanel("story");
      case 'about-app':    return renderAboutPanel("app");
      case 'about-data':   return renderAboutPanel("data");
      default:           return '';
    }
  }

  // ── Profile panel ──────────────────────────────────────────────────────────

  function renderProfilePanel() {
    const name         = store.get('name') || '';
    const ageBand      = store.get('ageBand') || '';
    const gender       = store.get('gender') || '';
    const hormonalTracking = store.get('hormonalTracking') || false;

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Your profile</h2>

        <div class="settings-field">
          <label class="settings-label" for="settings-name">Name</label>
          <input class="settings-input"
                 id="settings-name"
                 type="text"
                 value="${_esc(name)}"
                 autocomplete="given-name"
                 data-field="name"
                 aria-label="Your name">
        </div>

        <div class="settings-field">
          <label class="settings-label" for="settings-agebandsel">Age range</label>
          <select class="settings-select"
                  id="settings-agebandsel"
                  data-field="ageBand"
                  aria-label="Your age range">
            <!-- AGE-1, 14 Aug 2026. This list was hardcoded LABELS used as
                 VALUES, so saving here wrote 'Under 20' or '70+' into
                 ageBand -- matching neither the onboarding chips nor the
                 contract, and silently dropping the person out of the
                 capability age trigger. Now the same AGE_CHIPS the thread
                 uses, ids as values. -->
            ${AGE_CHIPS.map(b => `
              <option value="${b.id}" ${ageBand === b.id ? 'selected' : ''}>${_esc(b.label)}</option>
            `).join('')}
          </select>
        </div>

        <div class="settings-field">
          <label class="settings-label" for="settings-gender">Gender</label>
          <select class="settings-select"
                  id="settings-gender"
                  data-field="gender"
                  aria-label="Your gender">
            <option value="">Prefer not to say</option>
            <option value="female"   ${gender === 'female'    ? 'selected' : ''}>Female</option>
            <option value="male"     ${gender === 'male'      ? 'selected' : ''}>Male</option>
            <option value="non-binary" ${gender === 'non-binary' ? 'selected' : ''}>Non-binary</option>
            <option value="other"    ${gender === 'other'     ? 'selected' : ''}>Other / self-describe</option>
          </select>
        </div>

        <div class="settings-field settings-field--toggle">
          <label class="settings-label" for="settings-hormonal">
            Cycle-aware coaching
            <span class="settings-label__sub">Adapts sessions to your hormonal cycle</span>
          </label>
          <button
            class="settings-toggle ${hormonalTracking ? 'settings-toggle--on' : ''}"
            id="settings-hormonal"
            role="switch"
            aria-checked="${hormonalTracking ? 'true' : 'false'}"
            data-toggle="hormonalTracking"
            aria-label="Cycle-aware coaching ${hormonalTracking ? 'on' : 'off'}">
            <span class="settings-toggle__track" aria-hidden="true"></span>
          </button>
        </div>

        <button class="settings-save-btn btn btn-primary"
                data-action="save-profile"
                aria-label="Save profile changes">
          Save changes
        </button>

        ${renderMovementSection()}
      </div>
    `;
  }

  // ── Your Coaching panel (COACH-TILE, 18 Aug 2026) ──────────────────────────
  //
  // Three sections lifted out of Profile unchanged. Not rewritten, not
  // re-ordered, not restyled -- the copy in each was reviewed and this
  // move is about WHERE they live, not what they say. Movement identity
  // stays in Profile: it is a fact about you, like your age band, not a
  // dial the coach reads before building a session.
  //
  // The save handlers are delegated on the container and keyed on
  // data-action, so they follow the markup without change -- confirmed
  // by reading the handler switch, not assumed.
  function renderCoachingPanel() {
    return `
      <div class="settings-section">
        ${renderCapabilitySection()}

        ${renderPreferencesSection()}

        ${renderReflectionSection()}
      </div>
    `;
  }

  // ── How you like things (D-3 / W2-7, 14 Aug 2026) ───────────────────────
  //
  // Graeme's position, 14 Aug: the app is built with neurodiversity
  // understood from the start, so the coach should need no adapting --
  // but Settings should let people shape the experience.
  //
  // Deliberately NOT a "neurodivergent mode", and autism and ADHD are
  // deliberately NOT in CONDITIONS. That list drives exercise
  // contraindication filtering; neurodivergence is not a movement
  // contraindication, and putting it there would make the engine treat it
  // as a limitation -- the opposite of building it in from the start. It
  // would also be a label that filtered nothing, which is the same fault
  // the conditions question had before CARDIAC-1.
  //
  // So these are preferences anybody might hold, named by what they do.
  // Persona 2.14 wants the first one; persona 2.13 wants its opposite;
  // neither has to identify as anything to get it.

  // Built lazily and once: EXERCISES is 545 entries and this runs on
  // every Settings render.
  let _exNameCache = null;
  function getExerciseName(id) {
    if (!_exNameCache) _exNameCache = new Map(EXERCISES.map(e => [e.id, e.name]));
    // An id with no entry means the library changed under a stored
    // preference. Show the id rather than dropping the row, so the person
    // can still clear it.
    return _exNameCache.get(id) || id;
  }

  function renderPreferencesSection() {
    const variety = store.get('sessionVariety') || 'balanced';
    const pace    = store.get('sessionPace') || 'full';   // QUICK-1
    const prefs   = store.get('exercisePreferences') || {};
    const entries = Object.entries(prefs)
      .map(([id, v]) => ({ id, ...v, name: getExerciseName(id) }))
      .sort((a, b) => (b.setAt || '').localeCompare(a.setAt || ''));

    const VARIETY_OPTIONS = [
      { id: 'familiar', label: 'Mostly the same each time',
        hint: 'About two thirds of a session repeats from the last one.' },
      { id: 'balanced', label: 'A bit of both',
        hint: 'Some familiar work, some new. This is the default.' },
      { id: 'varied',   label: 'Something different each time',
        hint: 'Sessions rotate widely across the library.' },
    ];

    return `
      <div class="settings-preferences">
        <h2 class="settings-section__heading">How you like things</h2>
        <p class="settings-section__sub">
          None of this is about what you can do — it is about what you
          would rather the coach did. Change it whenever you like.
        </p>

        <fieldset class="settings-field settings-capability__group">
          <legend class="settings-label">How much should sessions change?</legend>
          <p class="settings-section__sub" id="pref-variety-hint">
            The coach also asks this before a session. Whatever you set
            here is the answer it starts from.
          </p>
          <select class="settings-select"
                  id="settings-pref-variety"
                  data-field="sessionVariety"
                  aria-describedby="pref-variety-hint">
            ${VARIETY_OPTIONS.map(o => `
              <option value="${o.id}"${variety === o.id ? ' selected' : ''}>${_esc(o.label)}</option>
            `).join('')}
          </select>
          <p class="settings-section__sub">
            ${_esc(VARIETY_OPTIONS.find(o => o.id === variety)?.hint || '')}
          </p>
        </fieldset>

        <fieldset class="settings-field settings-capability__group">
          <legend class="settings-label">How much should the coach ask before a session?</legend>
          <p class="settings-section__sub" id="pref-pace-hint">
            The short version asks how your energy and mood are, and
            nothing else. If you have told me about a condition, I will
            still ask about pain either way.
          </p>
          <select class="settings-select"
                  id="settings-pref-pace"
                  data-field="sessionPace"
                  aria-describedby="pref-pace-hint">
            <option value="full"${pace === 'full' ? ' selected' : ''}>The usual — energy, mood, sleep, how you're feeling</option>
            <option value="brief"${pace === 'brief' ? ' selected' : ''}>Short — energy and mood only</option>
          </select>
        </fieldset>

        <div class="settings-field">
          <h3 class="settings-label">Exercises you have asked me to change</h3>
          ${entries.length === 0 ? `
            <p class="settings-section__sub">
              Nothing yet. When you skip something during a session, the
              coach offers to see it less often — or not at all.
            </p>
          ` : `
            <ul class="settings-preflist">
              ${entries.map(e => `
                <li class="settings-preflist__item">
                  <span class="settings-preflist__name">${_esc(e.name)}</span>
                  <span class="settings-preflist__tag">
                    ${e.preference === 'avoid' ? 'Not again' : 'Less often'}
                  </span>
                  <button class="btn btn-ghost btn-small"
                          data-clear-pref="${_esc(e.id)}"
                          aria-label="Undo — start offering ${_esc(e.name)} normally again">
                    Undo
                  </button>
                </li>
              `).join('')}
            </ul>
          `}
        </div>

        <button class="settings-save-btn btn btn-primary"
                data-action="save-preferences"
                aria-label="Save how you like things">
          Save
        </button>
      </div>
    `;
  }

  // ── Capability section (W3-A2, 14 Aug 2026) ─────────────────────────────
  //
  // Onboarding steps 9a-9d are a forward-only thread: once a chip is
  // tapped there is no way back. Before this section existed, a mis-tap on
  // the chair question left somebody permanently restricted with no route
  // to correct it -- and capability answers are not static anyway. Bodies
  // change over months, which is the whole premise of the product.
  //
  // store.js's own CAP-1 note worried about somebody being "behind on a
  // question they can no longer see or change". This is that route.
  //
  // Two deliberate choices:
  //
  // 1. ALL FOUR are shown here, including chairRise and floorAccess, even
  //    though onboarding asks those two conditionally. The reason they are
  //    conditional there is that they can land as insulting when pushed at
  //    somebody unprompted. Settings is not unprompted -- the person came
  //    looking. Withholding them here would mean a 30-year-old who develops
  //    a knee problem has no way to say so.
  //
  // 2. "Not answered" is a real, selectable option on every question.
  //    capabilityProfile() treats null as cautious-but-unrestricted, so
  //    clearing an answer is meaningful and must be possible. A person who
  //    said "no" during a bad flare must be able to take it back.

  function renderCapabilitySection() {
    const cap = store.get('capability') || {};

    const group = (field, legend, hint, chips) => `
      <fieldset class="settings-field settings-capability__group">
        <legend class="settings-label">${legend}</legend>
        <p class="settings-section__sub" id="cap-${field}-hint">${hint}</p>
        <select class="settings-select"
                id="settings-cap-${field}"
                data-field="capability.${field}"
                aria-describedby="cap-${field}-hint">
          <option value=""${!cap[field] ? ' selected' : ''}>Not answered</option>
          ${chips.map(c => `
            <option value="${c.id}"${cap[field] === c.id ? ' selected' : ''}>${_esc(c.label)}</option>
          `).join('')}
        </select>
      </fieldset>
    `;

    return `
      <div class="settings-capability">
        <h2 class="settings-section__heading">What your body can do today</h2>
        <p class="settings-section__sub">
          These change what the coach puts in front of you. Nothing here is
          a verdict — change them whenever they stop being true, and leave
          anything blank that you would rather not answer.
        </p>

        ${group('balanceWorry', 'Do you ever worry about losing your balance?',
                'Removes exercises that demand balance. Not a statement about strength.',
                BALANCE_CHIPS)}

        ${group('chairRise', 'Can you get up from a chair without pushing off with your hands?',
                'Tells the coach what your legs are ready for.',
                CHAIR_RISE_CHIPS)}

        ${group('legPower', 'Can you take your weight through your legs?',
                'Some exercises ask your legs to carry your weight.',
                LEG_POWER_CHIPS.filter(c => c.id !== 'skip'))}

        ${group('floorAccess', 'Can you get down to the floor and back up on your own?',
                'If the floor is not somewhere you want to be, the coach builds around it.',
                FLOOR_ACCESS_CHIPS)}

        <button class="settings-save-btn btn btn-primary"
                data-action="save-capability"
                aria-label="Save what your body can do today">
          Save
        </button>
      </div>
    `;
  }

  // ── Movement section (v11) ──────────────────────────────────────────────
  // How you move — multi-select identity chips + mutually-exclusive
  // "mixed" fallback. Reads/writes movementIdentity as string[].

  function renderMovementSection() {
    const movementIdentity = store.get('movementIdentity') || [];
    const isMixed = movementIdentity.includes('mixed');

    return `
      <h2 class="settings-section__heading">How you move</h2>
      <p class="settings-section__sub">
        Pick everything that's part of your movement life — the coach
        rotates suggestions toward whichever you've done least recently.
        Or, if you'd rather not pick, tell it you do a mix of things.
      </p>
      <div class="settings-movement-chips" role="group" aria-label="Your movement identities">
        ${MOVEMENT_IDENTITIES.map(m => `
          <button
            class="settings-movement-chip ${movementIdentity.includes(m.id) ? 'settings-movement-chip--selected' : ''}"
            data-movement="${m.id}"
            role="checkbox"
            aria-checked="${movementIdentity.includes(m.id) ? 'true' : 'false'}"
            aria-label="${m.label}"
            ${isMixed ? 'disabled aria-disabled="true"' : ''}>
            <span aria-hidden="true">${m.icon}</span>
            ${m.label}
          </button>
        `).join('')}
      </div>
      <div class="settings-movement-divider" role="separator" aria-hidden="true">or</div>
      <button
        class="settings-movement-chip settings-movement-chip--mixed ${isMixed ? 'settings-movement-chip--selected' : ''}"
        data-movement="mixed"
        role="checkbox"
        aria-checked="${isMixed ? 'true' : 'false'}"
        aria-label="A mix of things — don't ask me to pick">
        A mix of things
      </button>
      <button class="settings-save-btn btn btn-primary"
              data-action="save-movement"
              aria-label="Save how you move">
        Save
      </button>
    `;
  }

  // ── Reflection section ──────────────────────────────────────────────────
  // Collapsible block. Reads primaryTerritory live, no stored read/unread
  // state, no new schema. Renders nothing if the user has no territory set.

  function renderReflectionSection() {
    const territory = store.get('onboarding.primaryTerritory');
    if (!territory) return '';

    const script = getBeat3Script([territory]);
    if (!script) return '';

    return `
      <div class="settings-reflection">
        <h2 class="settings-section__heading">Your reflection</h2>
        <p class="settings-section__sub">
          What we shared with you when you first joined, about why
          Alongside: Move works differently for you.
        </p>

        <button class="btn btn-secondary"
                id="settings-reflection-toggle"
                data-action="toggle-reflection"
                aria-expanded="${reflectionExpanded ? 'true' : 'false'}"
                aria-controls="settings-reflection-content"
                aria-label="${reflectionExpanded ? 'Hide your reflection' : 'Read your reflection'}">
          ${reflectionExpanded ? 'Hide reflection' : 'Read your reflection'}
        </button>

        <div class="settings-reflection__content"
             id="settings-reflection-content"
             ${reflectionExpanded ? '' : 'hidden'}
             aria-hidden="${reflectionExpanded ? 'false' : 'true'}">
          ${script.parts.map(part => `<p class="settings-reflection__para">${_esc(part)}</p>`).join('')}
        </div>
      </div>
    `;
  }

  // ── Programme panel ────────────────────────────────────────────────────────

  function renderProgrammePanel() {
    const stats        = getProgressStats();
    const goals        = store.get('goals') || [];
    const fitnessLevel = store.get('fitnessLevel') || 'moderate';
    const weeklyTarget = store.get('strategicGoal.weeklySessionTarget') || 3;
    const tier         = store.get('tier') || 'free';

    return `
      <div class="settings-section">

        <!-- Active programme -->
        <h2 class="settings-section__heading">Your programme</h2>

        ${stats.hasActiveProgramme ? `
          <div class="settings-programme-card">
            <p class="settings-programme-card__name">${stats.programmeName}</p>
            <p class="settings-programme-card__week">${stats.weeksIn === 0
              ? "Just started"
              : `${stats.weeksIn} ${stats.weeksIn === 1 ? "week" : "weeks"} in`}</p>
            <p class="settings-programme-card__phase">${stats.phaseName}</p>
          </div>

          <div class="settings-actions">
            <button class="btn btn-secondary"
                    data-action="change-programme"
                    aria-label="Change your programme">
              Change programme
            </button>
            <button class="btn btn-ghost settings-btn--destructive"
                    data-action="reset-programme"
                    aria-label="Reset programme — restart from week one">
              Reset programme
            </button>
          </div>
        ` : `
          <p class="settings-empty">No active programme. Choose one from the library to get started.</p>
          <button class="btn btn-primary"
                  data-action="choose-programme"
                  aria-label="Choose a programme">
            Choose a programme
          </button>
        `}

        <!-- Weekly session target -->
        <div class="settings-field">
          <label class="settings-label" for="settings-weekly-target">
            Sessions per week
            <span class="settings-label__sub">How many sessions you're aiming for</span>
          </label>
          <select class="settings-select"
                  id="settings-weekly-target"
                  data-field="strategicGoal.weeklySessionTarget"
                  aria-label="Target sessions per week">
            ${[2, 3, 4, 5].map(n => `
              <option value="${n}" ${weeklyTarget === n ? 'selected' : ''}>${n} per week</option>
            `).join('')}
          </select>
        </div>

        <!-- Your week (v10 — restored entry point into weekly-plan.js) -->
        <h2 class="settings-section__heading">Your week</h2>
        <p class="settings-section__sub">
          ${renderWeeklyPlanSummary()}
        </p>
        <button class="btn btn-secondary"
                data-action="open-weekly-plan"
                aria-label="Plan your week — set an intent for each day">
          Plan my week
        </button>

        <!-- Goals -->
        <h2 class="settings-section__heading">Your goals</h2>
        <p class="settings-section__sub">
          Tap to change what you're working towards.
          Your programme won't be affected until you next review it.
        </p>
        <div class="settings-goals-groups" role="group" aria-label="Select your goals">
          ${GOAL_CATEGORIES.map(cat => `
            <div class="settings-goals-category">
              <p class="settings-goals-category__label">${_esc(cat.label)}</p>
              <div class="settings-goals-grid">
                ${cat.goals.map(goal => `
                  <button
                    class="settings-goal-chip ${goals.includes(goal.id) ? 'settings-goal-chip--selected' : ''}"
                    data-goal="${goal.id}"
                    role="checkbox"
                    aria-checked="${goals.includes(goal.id) ? 'true' : 'false'}"
                    aria-label="${goal.label}">
                    <span aria-hidden="true">${goal.icon}</span>
                    ${goal.label}
                  </button>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <button class="settings-save-btn btn btn-primary"
                data-action="save-goals"
                aria-label="Save goal changes">
          Save goals
        </button>

        <!-- Activity level -->
        <h2 class="settings-section__heading">Activity level</h2>
        <p class="settings-section__sub">
          Update this as you get fitter — it affects the intensity ceiling for your sessions.
        </p>
        <div class="settings-field">
          <label class="settings-label" for="settings-fitness-level">Current activity level</label>
          <select class="settings-select"
                  id="settings-fitness-level"
                  data-field="fitnessLevel"
                  aria-label="Your current activity level">
            <option value="sedentary"   ${fitnessLevel === 'sedentary'   ? 'selected' : ''}>Sedentary — mostly sitting</option>
            <option value="light"       ${fitnessLevel === 'light'       ? 'selected' : ''}>Light — some walking or gentle activity</option>
            <option value="moderate"    ${fitnessLevel === 'moderate'    ? 'selected' : ''}>Moderate — exercise a few times a week</option>
            <option value="active"      ${fitnessLevel === 'active'      ? 'selected' : ''}>Active — regular training</option>
            <option value="very-active" ${fitnessLevel === 'very-active' ? 'selected' : ''}>Very active — intensive training most days</option>
          </select>
        </div>
        <button class="settings-save-btn btn btn-primary"
                data-action="save-fitness-level"
                aria-label="Save activity level">
          Save
        </button>

        <!-- Coach (S1 — Nurturing only, permanently. No picker.) -->
        <h2 class="settings-section__heading">Your coach</h2>
        <p class="settings-section__sub">
          Every session is guided in a warm, nurturing style — gentle,
          emotionally attuned, and always on your side.
        </p>

      </div>
    `;
  }

  // ── Weekly plan summary line ────────────────────────────────────────────
  // Reads weeklyPlan.updatedAt live — no new schema field. Speaks to what's
  // actually true right now rather than a generic label, consistent with
  // the voice used elsewhere on this panel (Conditions/Equipment sections).

  function renderWeeklyPlanSummary() {
    const updatedAt = store.get('weeklyPlan.updatedAt');
    if (!updatedAt) {
      return `You haven't shaped a week yet — the coach will ask each day instead. Set one up and it'll use that as your starting point.`;
    }
    const formatted = new Date(updatedAt).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    return `Last shaped ${_esc(formatted)}. The coach uses this as its starting point each day — you can still adjust on the day itself.`;
  }

  // ── Conditions panel ───────────────────────────────────────────────────────

  function renderConditionsPanel() {
    const conditions = store.get('conditions') || [];
    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Conditions and injuries</h2>
        <p class="settings-section__sub">
          The coach adapts every session around what you've listed here.
          Add or remove conditions at any time.
        </p>
        <button class="btn btn-primary"
                data-action="edit-conditions"
                aria-label="Edit your conditions and injuries">
          Edit conditions
        </button>
        ${conditions.length > 0 ? `
          <ul class="settings-conditions-list" aria-label="Your conditions">
            ${conditions.map(c => `<li class="settings-conditions-item">${_esc(c)}</li>`).join('')}
          </ul>
        ` : `<p class="settings-empty">No conditions listed.</p>`}
      </div>
    `;
  }

  // ── Equipment panel ────────────────────────────────────────────────────────

  // 05 Aug 2026 -- summary of what's actually saved, split by scope. Found
  // while investigating the gym-session location bug: this panel showed
  // nothing but a bare "Edit equipment" button, no way to glance at what
  // was saved without stepping through the whole edit flow again. Small,
  // low-risk, directly useful for verifying onboarding wasn't rushed
  // through without redoing it.
  function _equipmentSummaryLine(scope, list) {
    if (!list || list.length === 0) {
      return `<p class="text-sm text-muted">${scope}: nothing saved &mdash; bodyweight only</p>`;
    }
    const label = list.length === 1 ? "1 item" : `${list.length} items`;
    return `<p class="text-sm text-muted">${scope}: ${label} saved</p>`;
  }

  // ── Lift note panel (11 Aug 2026, PT-4) ────────────────────────────────────
  // Off by default. Someone who turns this on has asked for it, which is a
  // different thing from being given it. Copy deliberately describes it as a
  // note to yourself, never as tracking, progress, or personal bests —
  // locked principle P4. Uses the existing generic [data-toggle] handler
  // (attachEvents, ~line 805), so no new wiring.
  // LOG-1, 12 Aug 2026. Renamed from "Weight notes". The store has
  // recorded nine metrics since 11 Aug -- weight, reps, speed, incline,
  // level, distance, duration, band tension, free note -- and the fields
  // offered already adapt to the equipment. Only this panel still said
  // "what you lifted", which is very likely why the feature read as
  // weight-only. A feature that describes itself wrongly is one people
  // correctly believe does not do the thing.
  //
  // "Session notes" rather than anything with "performance", "progress"
  // or "personal best" in it: those words carry a verdict, and P4 says
  // the app may display and never interpret. The function name is left
  // as-is; the store field liftLogEnabled is untouched, since renaming a
  // live field for tidiness is a migration, not a rename.
  function renderLiftLogPanel() {
    const on = store.get('liftLogEnabled') === true;
    // PB-1. Bests are RECORDED regardless; this governs whether they are
    // shown. Turning it on later reveals everything already logged
    // rather than starting from nothing.
    const pbOn = store.get('showPersonalBests') === true;

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Session notes</h2>
        <p class="settings-section__sub">
          Jot down what you did &mdash; weight, time, level, incline, band,
          whatever that exercise actually gives you &mdash; so you are not
          guessing next time.
        </p>

        <div class="settings-field settings-field--toggle">
          <label class="settings-label" for="settings-pb">
            Show your best
            <span class="settings-label__sub">The highest you have logged for an exercise, alongside your last note. Off unless you want it.</span>
          </label>
          <button
            class="settings-toggle ${pbOn ? 'settings-toggle--on' : ''}"
            id="settings-pb"
            data-action="toggle-pb"
            role="switch"
            aria-checked="${pbOn ? 'true' : 'false'}"
            aria-label="Show your best">
            <span class="settings-toggle__track" aria-hidden="true"></span>
          </button>
        </div>

        <div class="settings-field settings-field--toggle">
          <label class="settings-label" for="settings-lift-log">
            Keep session notes
            <span class="settings-label__sub">Shows what you noted last time, and somewhere to add today's</span>
          </label>
          <button
            class="settings-toggle ${on ? 'settings-toggle--on' : ''}"
            id="settings-lift-log"
            role="switch"
            aria-checked="${on ? 'true' : 'false'}"
            data-toggle="liftLogEnabled"
            aria-label="Session notes ${on ? 'on' : 'off'}">
            <span class="settings-toggle__track" aria-hidden="true"></span>
          </button>
        </div>

        <p class="text-sm text-muted" style="margin-top: var(--space-3);">
          Just what you wrote, kept for you. No streaks, no targets, and
          nothing said about whether it went up or down.
        </p>
      </div>
    `;
  }

  // ── Display panel (DISP-1) ────────────────────────────────────────

  function _dispSlider(name, id, label, hint, opts = {}) {
    const r     = DISPLAY_RANGES[name];
    const value = getDisplayPref(name);
    const anchors = opts.anchors || null;

    return `
      <div class="disp-field">
        <label class="disp-field__label" for="${id}">${label}</label>
        <span class="disp-field__hint" id="${id}-hint">${hint}</span>
        <div class="disp-slider-row">
          ${anchors ? `<span class="disp-anchor disp-anchor--small" aria-hidden="true">${anchors[0]}</span>` : ""}
          <input
            type="range"
            class="disp-slider"
            id="${id}"
            data-disp="${name}"
            min="${r.min}" max="${r.max}" step="${r.step}"
            value="${value}"
            aria-describedby="${id}-hint"
            aria-valuetext="${formatDisplayValue(name, value)}">
          ${anchors ? `<span class="disp-anchor disp-anchor--large" aria-hidden="true">${anchors[1]}</span>` : ""}
          <span class="disp-value" id="${id}-value">${formatDisplayValue(name, value)}</span>
        </div>
      </div>
    `;
  }

  function _dispToggle(name, id, label, sub) {
    const on = getDisplayPref(name) === "on";
    return `
      <div class="settings-field settings-field--toggle">
        <label class="settings-label" for="${id}">
          ${label}
          <span class="settings-label__sub">${sub}</span>
        </label>
        <button
          class="settings-toggle ${on ? "settings-toggle--on" : ""}"
          id="${id}"
          role="switch"
          aria-checked="${on ? "true" : "false"}"
          data-disp-toggle="${name}"
          aria-label="${label} ${on ? "on" : "off"}">
          <span class="settings-toggle__track" aria-hidden="true"></span>
        </button>
      </div>
    `;
  }

  function renderDisplayPanel() {
    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Display</h2>
        <p class="settings-section__sub">
          Change how the app looks to suit your eyes. Everything here is kept on
          this device only \u2014 it is never sent anywhere, and it is not part of
          your account.
        </p>

        <p id="disp-status" class="visually-hidden" role="status" aria-live="polite"></p>

        <div class="disp-field">
          <span class="disp-field__label" id="disp-scheme-label">Colour scheme</span>
          <span class="disp-field__hint" id="disp-scheme-hint">
            Dark is how the app is designed. The other two are here because eyes differ.
          </span>
          <div class="disp-schemes" role="radiogroup"
               aria-labelledby="disp-scheme-label" aria-describedby="disp-scheme-hint">
            ${SCHEMES.map(s => {
              const on = getDisplayPref("scheme") === s.value;
              return `
                <button type="button" class="disp-scheme ${on ? "disp-scheme--on" : ""}"
                        role="radio" aria-checked="${on}" data-scheme="${s.value}">
                  <span class="disp-scheme__label">${s.label}</span>
                  <span class="disp-scheme__sub">${s.sub}</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>

        ${_dispSlider("textScale", "disp-text-scale", "Text size",
          "Makes every piece of text in the app larger or smaller.",
          { anchors: ["A", "A"] })}

        ${_dispSlider("leadingScale", "disp-leading-scale", "Line spacing",
          "More space between lines of text. Often easier to read a long paragraph without losing your place.")}

        ${_dispSlider("letterSpacing", "disp-letter-spacing", "Letter spacing",
          "More space between individual letters. Some people find this makes words easier to separate.")}

        <div class="disp-sample" aria-hidden="true">
          <span class="disp-sample__caption">Preview</span>
          <p class="disp-sample__body">
            Some days ask for less, and that is still a session. Take what you need
            from today, and we will pick it up again tomorrow.
          </p>
        </div>

        ${_dispToggle("underline", "disp-underline", "Underline links",
          "Adds a line under every link, so colour is not the only thing marking it")}

        ${_dispToggle("focus", "disp-focus", "Stronger focus outlines",
          "A thicker, brighter ring around whatever you have selected with a keyboard")}

        <button class="btn btn-secondary" id="disp-reset" type="button"
                style="margin-top: var(--space-4);">
          Reset display to defaults
        </button>
      </div>
    `;
  }

  function renderEquipmentPanel() {
    const homeEquip = store.get('homeEquipment') || [];
    const gymEquip   = store.get('gymEquipment')  || [];

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Equipment</h2>
        <p class="settings-section__sub">
          The coach only suggests exercises that match what you have available.
        </p>
        <div style="margin-bottom: var(--space-3);">
          ${_equipmentSummaryLine("Home", homeEquip)}
          ${_equipmentSummaryLine("Gym", gymEquip)}
        </div>
        <button class="btn btn-primary"
                data-action="edit-equipment"
                aria-label="Edit your equipment">
          Edit equipment
        </button>
      </div>
    `;
  }

  // ── Notifications panel ────────────────────────────────────────────────────

  function renderNotifyPanel() {
    const notif   = store.get('checkInNotification') || {};
    const water   = store.get('waterReminderEnabled') || false;
    const enabled = notif.enabled || false;
    const time    = notif.time || '';

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Reminders</h2>

        <div class="settings-field settings-field--toggle">
          <label class="settings-label" for="settings-checkin-notif">
            Daily check-in reminder
            <span class="settings-label__sub">A nudge to open the app and check in</span>
          </label>
          <button
            class="settings-toggle ${enabled ? 'settings-toggle--on' : ''}"
            id="settings-checkin-notif"
            role="switch"
            aria-checked="${enabled ? 'true' : 'false'}"
            data-toggle="checkInNotification.enabled"
            aria-label="Check-in reminder ${enabled ? 'on' : 'off'}">
            <span class="settings-toggle__track" aria-hidden="true"></span>
          </button>
        </div>

        ${enabled ? `
          <div class="settings-field">
            <label class="settings-label" for="settings-notif-time">Reminder time</label>
            <input class="settings-input"
                   id="settings-notif-time"
                   type="time"
                   value="${_esc(time)}"
                   data-field="checkInNotification.time"
                   aria-label="Check-in reminder time">
          </div>
        ` : ''}

        <div class="settings-field settings-field--toggle">
          <label class="settings-label" for="settings-water-reminder">
            Pre-session water reminder
            <span class="settings-label__sub">A prompt to drink water before each session</span>
          </label>
          <button
            class="settings-toggle ${water ? 'settings-toggle--on' : ''}"
            id="settings-water-reminder"
            role="switch"
            aria-checked="${water ? 'true' : 'false'}"
            data-toggle="waterReminderEnabled"
            aria-label="Water reminder ${water ? 'on' : 'off'}">
            <span class="settings-toggle__track" aria-hidden="true"></span>
          </button>
        </div>

      </div>
    `;
  }

  // ── About panel (with developer bypass) ───────────────────────────────────

  // VER-1. Cache name from the running service worker, so the About
  // screen cannot drift from the build the phone is actually on.
  let swVersion = null;

  async function _readSwVersion() {
    // VER-2, 12 Aug 2026. ASK THE CONTROLLING WORKER, do not infer.
    //
    // This previously read caches.keys() and took the first alongside-v
    // entry. That answers "which caches exist", not "which one is serving
    // this page" -- and during an update both exist. Graeme saw v303 here
    // while Settings was still rendering v302's tab strip.
    //
    // A number that is confidently wrong only during an update is wrong
    // at exactly the moment somebody checks it.
    try {
      const sw = navigator.serviceWorker?.controller;
      if (!sw) return null;
      return await new Promise(resolve => {
        const timer = setTimeout(() => resolve(null), 1200);
        const onMessage = e => {
          if (e.data?.type !== 'VERSION') return;
          clearTimeout(timer);
          navigator.serviceWorker.removeEventListener('message', onMessage);
          resolve(e.data.version || null);
        };
        navigator.serviceWorker.addEventListener('message', onMessage);
        sw.postMessage({ type: 'GET_VERSION' });
      });
    } catch { return null; }
  }

  /**
   * NAV-7. About was one 24,000-character panel; it is now three tabs.
   *
   * Parameterised rather than split into three functions: the markup
   * stays in one place where its nesting is visible, and the version
   * lookup and tier read stay single. Three copies of that preamble is
   * how they drift.
   */
  /**
   * A3, 13 Aug 2026 — "Your plan".
   *
   * The whole reason this exists: before it, the ONLY way anybody on the
   * free tier learned that Personal exists was by tapping something they
   * had just been refused. Six locked session types, three locked
   * durations, the 90-day tab, the export block, the In Step door. Every
   * one of those describes Personal in the negative -- here is a thing you
   * cannot have -- and none of them ever says what it is.
   *
   * Register matters here more than usual. This is the helper layer, not
   * the coach (P2), so it does not speak in the coach's voice and does not
   * sit in a card-coach block. It states what is true, plainly, and stops.
   * No urgency, no badge, no "most popular", nothing that reads as a
   * pitch -- the whole product's credibility rests on the coach never
   * selling, and a settings panel that starts persuading is the first
   * crack in that.
   *
   * Symmetrical by design: a Personal user opening this sees what they
   * have, not an upsell to something else. A panel that only ever exists
   * to sell becomes a panel people learn not to open.
   *
   * Price is stated here as well as on the upgrade page. Somebody deciding
   * whether to look should not have to visit the sales screen to find out
   * the number.
   *
   * PRICE-3, 18 Aug 2026: it is now IMPORTED from js/data/pricing.js, not
   * typed. It used to be typed, and on 18 Aug it still said £49.99 three
   * hours after the annual price changed. Nothing here is time-limited
   * any more -- Year 2 pricing is deferred to Year 2, so there is no
   * expiry to state.
   */
  function renderPlanPanel() {
    const tier      = store.get('tier') || 'free';
    const isPaid    = tier !== 'free';
    const tierLabel = isPaid ? 'Plan' : 'Free';

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Your plan</h2>

        <div class="settings-plan-current">
          <p class="settings-plan-current__label">You are on</p>
          <p class="settings-plan-current__tier">${_esc(tierLabel)}</p>
        </div>

        ${isPaid ? `
          <div class="settings-plan-block">
            <p>Everything is open to you — every session type, every length,
               the full picture of your progress, and the long practices in
               Wellbeing.</p>
            <p>Five percent of what you pay goes to causes this community
               chooses.</p>
          </div>

          <div class="settings-plan-block">
            <p class="text-sm text-muted">
              Payment and renewals aren't live yet. When they are, you'll
              manage them from here.
            </p>
          </div>
        ` : `
          <div class="settings-plan-block">
            <p>Free is a real session. The coach reads how you are today and
               builds you something — it holds nothing back from the session
               itself. Everything that keeps you safe is free and always
               will be.</p>
          </div>

          <div class="settings-plan-block">
            <h3 class="settings-plan-block__heading">What the Plan adds</h3>
            <p>You name where you're heading, and the coach builds towards it
               rather than only meeting today.</p>
            <p>Sessions become yours — the kind, the length, and how the time
               is spent.</p>
            <p>Your progress becomes a conversation: what's changed across
               months, not just this week.</p>
            <p>And the longer practices open up — the ones that go somewhere
               over time rather than finishing when the session does.</p>
          </div>

          <div class="settings-plan-block">
            <p class="settings-plan-price">${PRICE_MONTHLY} a month, or ${PRICE_ANNUAL} for the year.</p>
            <p class="text-sm text-muted">
              The yearly rate holds until the end of November 2026. No
              contract either way, and nothing is lost if you change your
              mind — your data stays yours whatever you decide.
            </p>
          </div>

          <div class="settings-actions">
            <button class="btn btn-primary"
                    data-action="nav-upgrade"
                    aria-label="Read more about the Plan">
              Have a look
            </button>
          </div>
        `}

      </div>
    `;
  }

  function renderAboutPanel(part = "story") {
    const tier = store.get('tier') || 'free';

    // VER-1, 12 Aug 2026. This was hardcoded to '115' while the live
    // cache was at v293 -- 178 versions of drift. It is the ONLY way
    // anybody can tell which build their phone is running, and it has
    // been wrong for weeks, which makes every "are you on the latest?"
    // check during device testing meaningless. The v86 note in this
    // file's own header describes exactly that confusion happening.
    //
    // Read from the service worker instead of restating it. The registered
    // SW's script URL is not enough (it does not carry the cache name), so
    // this asks the active worker directly and falls back to the build
    // date if it cannot answer -- an honest "unknown" rather than a
    // confident wrong number.
    const APP_VERSION = swVersion || 'checking\u2026';

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">About</h2>

        <!-- WHY IT EXISTS (11 Aug 2026).
             The About panel showed a tier and a version number, which is
             a diagnostics readout rather than an About. Somebody opening
             About is usually asking "can I trust this?", and a build
             number does not answer that.
             Condensed from Graeme's own words on buildnewhabits.co.uk/about
             rather than paraphrased -- the voice is the point, and a
             summary written by anyone else would lose it. Kept short
             deliberately: this is an overview with a route to the full
             piece, not a copy of it. -->
        ${part !== "story" ? "" : `
        <div class="settings-about-story">
          <p>I built Alongside because I needed it and it didn't exist.</p>
          <p>
            I was injured, and nothing I found could adapt with me. Apps kept
            telling me to push. AI gave me generic answers. I couldn't afford
            a physio. I just needed something that understood where I was, and
            could work around what I could give rather than demand something
            I couldn't.
          </p>
          <p>
            That is where every decision in this product comes from. No
            streaks. No punishment for absence. No comparison to who you were
            last week. A coach that speaks to you first, before it asks
            anything of you &mdash; and that changes what it offers when
            you're struggling, because it noticed rather than because you
            asked.
          </p>
          <p>
            It rejects the idea of &lsquo;normal&rsquo;. We're all normal
            &mdash; perfectly, differently, normal.
          </p>
          <p class="settings-about-signoff">Graeme</p>
          <a class="btn btn-ghost btn-full"
             href="https://buildnewhabits.co.uk/about/"
             target="_blank" rel="noopener"
             aria-label="Read the full story on our website, opens in a new tab">
            Read the full story
          </a>
        </div>
        `}

        ${part !== "app" ? "" : `
        <div class="settings-about-block">
          <p>Alongside: Move</p>
          <p class="settings-version"
             id="settings-version"
             aria-label="App version ${APP_VERSION}"
             tabindex="0">
            v${APP_VERSION}
          </p>
          <p>by Build New Habits</p>
          <p>buildnewhabits.co.uk</p>
        </div>

        <div class="settings-update-block">
          <button class="btn btn-primary" id="settings-force-update-btn"
                  aria-label="Force update — clears cache and reloads the latest version">
            Update app
          </button>
          <p class="settings-update-status" id="settings-update-status" aria-live="polite"></p>
        </div>
        `}

        ${part !== "data" ? "" : `
        <div class="settings-about-links">
          <button class="btn btn-ghost"
                  data-action="nav-impact"
                  aria-label="See your credits and where they go">
            Your impact
          </button>
          <button class="btn btn-ghost"
                  data-action="nav-activity-log"
                  aria-label="View your full activity log">
            Activity log
          </button>
          <button class="btn btn-ghost"
                  data-action="nav-privacy"
                  aria-label="View privacy policy">
            Privacy policy
          </button>
          <button class="btn btn-ghost"
                  data-action="reset-data"
                  aria-label="Reset all app data — this cannot be undone">
            Reset all data
          </button>
        </div>
        `}

        <!-- Developer bypass panel. Hidden until a deliberate triple-tap on
             the version label. A1: the gesture is never documented in
             user-facing copy anywhere in the product. -->
        ${!DEV_PANEL_ENABLED ? "" : `
        <div class="settings-dev-panel" id="settings-dev-panel" hidden aria-hidden="true">
          <h3 class="settings-dev-panel__heading">Developer panel</h3>
          <p class="settings-dev-panel__tier">Current tier: <strong id="dev-current-tier">${tier}</strong></p>
          <div class="settings-dev-panel__buttons"
               role="group"
               aria-label="Switch tier for testing">
            <button class="btn btn-secondary btn-sm"
                    data-dev-tier="free"
                    aria-label="Switch to Free tier">Free</button>
            <button class="btn btn-secondary btn-sm"
                    data-dev-tier="personal"
                    aria-label="Switch to the Plan">Plan</button>
            <!-- ATHLETE-RETIRE, 18 Aug 2026. The Athlete switcher is gone.
                 It was the only way into that tier and the tier granted
                 nothing, so this button's entire function was to put a
                 device into a state indistinguishable from Personal. -->
          </div>
        </div>
        `}

      </div>
    `;
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  function attachEvents(container) {
    // W2-7. Undo a stored preference. Immediate rather than batched under
    // Save: the row disappears, which is its own confirmation, and a
    // person undoing something should not have to also remember to save.
    container.querySelectorAll('[data-clear-pref]').forEach(btn => {
      btn.addEventListener('click', () => {
        store.setExercisePreference(btn.dataset.clearPref, null);
        render(container);
        attachEvents(container);
        _showToast('Back to normal — I will offer it again', container);
      });
    });

    // VER-1. Read the real cache name once, then repaint the label in
    // place. Deliberately not blocking the render: the About panel should
    // appear immediately and fill this in a moment later, rather than
    // holding the whole screen for a cache lookup.
    if (activeSection === 'about' && swVersion === null) {
      _readSwVersion().then(v => {
        // VER-1b. The cache name is "alongside-v294", so stripping the
        // prefix leaves "v294" -- already carrying its own v. The
        // template adds another, which shipped as "vv294". Strip it here
        // so the ONE place that formats a version does it once.
        swVersion = (v || 'unknown').replace(/^v/, '');
        const el = container.querySelector('#settings-version');
        if (el) {
          el.textContent = 'v' + swVersion;
          el.setAttribute('aria-label', 'App version ' + swVersion);
        }
      });
    }

    // NAV-5. Index -> section.
    container.querySelectorAll('[data-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeSection = btn.dataset.section;
        activePanel   = null;   // NAV-7: always open a section on its first tab
        render(container);
        // Focus the heading, not the back button: a screen reader should
        // hear where it has arrived before how to leave.
        container.querySelector('.settings-title')?.focus();
      });
    });

    // NAV-7. Sub-tab switching.
    container.querySelectorAll('[data-panel]').forEach(btn => {
      btn.addEventListener('click', () => {
        activePanel = btn.dataset.panel;
        render(container);
        container.querySelector(`[data-panel="${activePanel}"]`)?.focus();
      });
    });

    // Section -> index.
    document.getElementById('settings-back-btn')?.addEventListener('click', () => {
      activeSection = null;
      render(container);
      container.querySelector('.settings-index__row')?.focus();
    });

    // Legacy [data-tab] switching, kept for the developer bypass panel.
    container.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        render(container);
      });
    });

    // Field saves (inputs and selects)
    container.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('change', () => {
        const field = el.dataset.field;
        const value = el.type === 'checkbox' ? el.checked : el.value;
        store.set(field, el.type === 'number' ? Number(value) : value);
      });
    });

    // Display preferences (DISP-1). Separate from [data-toggle] below
    // because these write to localStorage via display-prefs.js, not to
    // store -- see this file's v17 header note for why.
    const _dispAnnounce = (msg) => {
      const el = container.querySelector('#disp-status');
      if (el) el.textContent = msg;
    };

    container.querySelectorAll('[data-disp]').forEach(input => {
      const name    = input.dataset.disp;
      const readout = container.querySelector(`#${input.id}-value`);
      // 'input' updates live so the preview moves under the finger.
      input.addEventListener('input', () => {
        setDisplayPref(name, input.value);
        const text = formatDisplayValue(name, input.value);
        if (readout) readout.textContent = text;
        input.setAttribute('aria-valuetext', text);
      });
      // 'change' announces once, on release. Announcing on every 'input'
      // would flood a screen reader with a reading per step.
      input.addEventListener('change', () => {
        const label = container.querySelector(`label[for="${input.id}"]`)?.textContent.trim() || name;
        _dispAnnounce(`${label} set to ${formatDisplayValue(name, input.value)}`);
      });
    });

    container.querySelectorAll('[data-scheme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.scheme;
        setDisplayPref('scheme', value);
        container.querySelectorAll('[data-scheme]').forEach(b => {
          const on = b === btn;
          b.setAttribute('aria-checked', on ? 'true' : 'false');
          b.classList.toggle('disp-scheme--on', on);
        });
        const label = btn.querySelector('.disp-scheme__label')?.textContent.trim() || value;
        _dispAnnounce(`Colour scheme set to ${label}`);
      });
    });

    container.querySelectorAll('[data-disp-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.dispToggle;
        const next = getDisplayPref(name) !== 'on';
        setDisplayPref(name, next ? 'on' : 'off');
        btn.setAttribute('aria-checked', next ? 'true' : 'false');
        btn.classList.toggle('settings-toggle--on', next);
        const label = btn.getAttribute('aria-label') || '';
        btn.setAttribute('aria-label', label.replace(next ? 'off' : 'on', next ? 'on' : 'off'));
        _dispAnnounce(label.replace(/\s(on|off)$/, '') + (next ? ' on' : ' off'));
      });
    });

    container.querySelector('#disp-reset')?.addEventListener('click', () => {
      resetDisplayPrefs();
      // NAV-5. Stay where we are: Display lives inside the Settings
      // section now, so re-rendering must not bounce back to the index.
      activeSection = 'settings';
      activePanel   = 'display';   // NAV-7: stay on the tab the action came from
      render(container);
      container.querySelector('#disp-status').textContent = 'Display settings reset to defaults';
      container.querySelector('#disp-reset')?.focus();
    });

    // Toggle switches
    container.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const field   = btn.dataset.toggle;
        const current = store.get(field);
        const next    = !current;
        store.set(field, next);
        btn.setAttribute('aria-checked', next ? 'true' : 'false');
        btn.classList.toggle('settings-toggle--on', next);
        const label = btn.getAttribute('aria-label') || '';
        btn.setAttribute('aria-label', label.replace(next ? 'off' : 'on', next ? 'on' : 'off'));
        // Re-render notifications panel to show/hide time input
        if (field === 'checkInNotification.enabled') {
          // NAV-5. Reminders lives in App Controls now; re-rendering must
          // not bounce back to the index mid-toggle.
          activeSection = 'controls';
          activePanel   = 'notify';   // NAV-7: stay on the tab the action came from
          render(container);
        }
      });
    });

    // Goal chips
    container.querySelectorAll('[data-goal]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('settings-goal-chip--selected');
        const checked = btn.classList.contains('settings-goal-chip--selected');
        btn.setAttribute('aria-checked', checked ? 'true' : 'false');
      });
    });

    // Movement chips (v11) — six-way multi-select, mutually exclusive
    // with the separate "mixed" option.
    container.querySelectorAll('[data-movement]').forEach(btn => {
      btn.addEventListener('click', () => {
        const isMixedBtn = btn.dataset.movement === 'mixed';

        if (isMixedBtn) {
          const nowSelected = !btn.classList.contains('settings-movement-chip--selected');
          container.querySelectorAll('[data-movement]').forEach(b => {
            b.classList.remove('settings-movement-chip--selected');
            b.setAttribute('aria-checked', 'false');
            if (b.dataset.movement !== 'mixed') {
              b.disabled = nowSelected;
              b.setAttribute('aria-disabled', nowSelected ? 'true' : 'false');
            }
          });
          if (nowSelected) {
            btn.classList.add('settings-movement-chip--selected');
            btn.setAttribute('aria-checked', 'true');
          }
        } else {
          btn.classList.toggle('settings-movement-chip--selected');
          const checked = btn.classList.contains('settings-movement-chip--selected');
          btn.setAttribute('aria-checked', checked ? 'true' : 'false');
          // Selecting any specific identity clears "mixed"
          const mixedBtn = container.querySelector('[data-movement="mixed"]');
          if (mixedBtn) {
            mixedBtn.classList.remove('settings-movement-chip--selected');
            mixedBtn.setAttribute('aria-checked', 'false');
          }
        }
      });
    });

    // Action buttons
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => handleAction(btn.dataset.action, container));
    });

    // Developer bypass: triple-tap version label. A1 -- gated on the same
    // flag as the markup, so flipping it removes the gesture and not just
    // the panel. Hiding one without the other leaves a live tap sequence
    // with nothing to open, which is worse than either.
    const versionEl = DEV_PANEL_ENABLED ? container.querySelector('#settings-version') : null;
    if (versionEl) {
      versionEl.addEventListener('click', () => {
        devTapCount++;
        clearTimeout(devTapTimer);
        devTapTimer = setTimeout(() => { devTapCount = 0; }, 1500);
        if (devTapCount >= 3) {
          devTapCount = 0;
          _toggleDevPanel(container);
        }
      });
    }

    // Force update — Graeme: "It's strange that my laptop is full and
    // latest version, but phone isn't... the Forced Update might need
    // to cut through those issues." sw.js's fetch handler is cache-
    // first (checked before building this, not assumed) — a stale
    // cached file is served immediately, network is never even
    // consulted, until a new service worker fully takes over. The
    // existing checkForUpdate()/applyUpdate() in app.js only handle
    // the polite path (ask the SW registration to check, apply if
    // waiting) — this button goes further: also clears every cache
    // directly and hard-reloads regardless of SW state, so it works
    // even if the SW itself is what's stuck.
    const forceUpdateBtn = container.querySelector('#settings-force-update-btn');
    if (forceUpdateBtn) {
      forceUpdateBtn.addEventListener('click', async () => {
        const statusEl = container.querySelector('#settings-update-status');
        forceUpdateBtn.disabled = true;
        if (statusEl) statusEl.textContent = 'Checking for updates…';

        try {
          if (window.App?.checkForUpdate) {
            await window.App.checkForUpdate();
          }
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
          }
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) await reg.update();
          }
        } catch (err) {
          console.error('Force update failed:', err);
        }

        if (statusEl) statusEl.textContent = 'Reloading with the latest version…';
        setTimeout(() => window.location.reload(), 400);
      });
    }

    // Developer tier buttons
    container.querySelectorAll('[data-dev-tier]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tier = btn.dataset.devTier;
        store.set('tier', tier);
        const tierLabel = container.querySelector('#dev-current-tier');
        if (tierLabel) tierLabel.textContent = tier;
        _showToast(`Tier set to: ${tier}`, container);
      });
    });
  }

  // ── Action handlers ────────────────────────────────────────────────────────

  function handleAction(action, container) {
    switch (action) {

      case 'save-profile': {
        const name   = container.querySelector('[data-field="name"]')?.value;
        const age    = container.querySelector('[data-field="ageBand"]')?.value;
        const gender = container.querySelector('[data-field="gender"]')?.value;
        if (name  !== undefined) store.set('name', name);
        if (age   !== undefined) store.set('ageBand', age);
        if (gender !== undefined) store.set('gender', gender);
        _showToast('Profile saved', container);
        break;
      }

      case 'toggle-reflection': {
        reflectionExpanded = !reflectionExpanded;
        render(container);
        const toggleBtn = container.querySelector('#settings-reflection-toggle');
        if (toggleBtn) toggleBtn.focus();
        break;
      }

      case 'save-goals': {
        const selectedGoals = [...container.querySelectorAll('[data-goal][aria-checked="true"]')]
          .map(b => b.dataset.goal);
        store.set('goals', selectedGoals);
        _showToast('Goals updated', container);
        break;
      }

      case 'save-movement': {
        const selectedMovement = [...container.querySelectorAll('[data-movement][aria-checked="true"]')]
          .map(b => b.dataset.movement);
        store.set('movementIdentity', selectedMovement);
        _showToast('How you move, updated', container);
        break;
      }

      case 'toggle-pb': {
        const next = store.get('showPersonalBests') !== true;
        store.set('showPersonalBests', next);
        render(container);
        attachEvents(container);
        _showToast(next ? 'I will show your best alongside your notes'
                        : 'Bests hidden — still recorded if you want them later', container);
        break;
      }

      case 'save-preferences': {
        const v = container.querySelector('[data-field="sessionVariety"]')?.value;
        if (v) store.set('sessionVariety', v);
        // QUICK-1
        const p = container.querySelector('[data-field="sessionPace"]')?.value;
        if (p === 'full' || p === 'brief') store.set('sessionPace', p);
        _showToast('Saved — the coach will use this from your next session', container);
        break;
      }

      case 'save-capability': {
        // W3-A2. Empty string means "Not answered" and must be stored as
        // null, not "". capabilityProfile() tests `c.legPower || default`
        // and `balanceWorry === 'no' || === null`; an empty string is
        // falsy in the first and matches neither branch of the second,
        // which would silently make a person read as restricted.
        const FIELDS = ['balanceWorry', 'chairRise', 'legPower', 'floorAccess'];
        let anyAnswered = false;

        for (const f of FIELDS) {
          const raw = container.querySelector(`[data-field="capability.${f}"]`)?.value;
          const val = raw === '' || raw === undefined ? null : raw;
          store.set(`capability.${f}`, val);
          if (val !== null) anyAnswered = true;
        }

        // askedAt is what capabilityProfile() reads to tell "answered"
        // from "never asked". It has to move BOTH ways.
        //
        // Setting it is obvious. Clearing it is the subtle half: if
        // somebody blanks every answer, leaving askedAt set would keep
        // asked=true with all-null values, and the profile would then
        // apply its answered-path defaults rather than falling back to
        // the never-asked path. Same end state by two routes, and only
        // one of them is honest about what the person told us.
        //
        // bothFeet is deliberately untouched here. It is not asked at
        // onboarding and not editable in this section, so a blanket
        // clear would wipe a value this screen never offered to set.
        if (anyAnswered) {
          if (!store.get('capability.askedAt')) {
            store.set('capability.askedAt', new Date().toISOString());
          }
        } else if (!store.get('capability.bothFeet')) {
          store.set('capability.askedAt', null);
        }

        _showToast('Saved — the coach will use this from your next session', container);
        break;
      }

      case 'save-fitness-level': {
        const level = container.querySelector('[data-field="fitnessLevel"]')?.value;
        if (level) store.set('fitnessLevel', level);
        _showToast('Activity level updated', container);
        break;
      }

      case 'change-programme':
        router.navigate('goal-setup');
        break;

      case 'choose-programme':
        router.navigate('goal-setup');
        break;

      case 'open-weekly-plan':
        router.navigate('weekly-plan');
        break;

      case 'reset-programme':
        _confirmDestructive(
          'Reset programme',
          'This will restart your programme from Week 1. Your session history will be kept. This cannot be undone.',
          () => {
            store.set('activeProgramme.currentWeek',      1);
            store.set('activeProgramme.currentPhase',     'build');
            store.set('activeProgramme.sessionsThisWeek', 0);
            store.set('activeProgramme.totalSessions',    0);
            store.set('activeProgramme.milestones',       []);
            store.set('activeProgramme.missedSessions',   []);
            store.set('activeProgramme.startDate',        new Date().toISOString());
            store.set('activeProgramme.midProgrammeGlanceShown', false);
            store.set('activeProgramme.programmeReflectionShown', false);
            _showToast('Programme reset to Week 1', container);
            render(container);
          },
          container
        );
        break;

      case 'edit-conditions':
        // Fix, 04 Aug 2026 (Phase D-2): now routes to the real Conditions
        // Update screen (conditions-update.js) instead of the limited
        // onboarding sheet, which only ever let you toggle which
        // conditions exist — nothing about severity, goals, or a
        // programme. Matches the original spec: Settings' panel is a
        // shortcut into the same destination Home's Conditions Update
        // door uses, not a separate UI. conditions-update.js has its own
        // "Back" button, which returns to Home rather than back to
        // Settings specifically — a small known rough edge, not a bug
        // (no vanished nav, no nonsensical destination, unlike the old
        // openSheet('onboarding/conditions') bug this replaces).
        router.navigate('conditions-update');
        break;

      case 'edit-equipment':
        // Same fix as edit-conditions, above. equipment.js already has
        // mountContainer()/setSheetDoneCallback() exports built for this
        // exact sheet pattern — reused as-is, no changes to that file.
        openSheet('onboarding/equipment', () => {
          render(container);
        });
        break;

      case 'nav-privacy':
        router.navigate('privacy');
        break;

      // Front doors added 11 Aug 2026. Both views existed and nothing
      // navigated to them -- the navigation version of the unreachable
      // content defect found eight times elsewhere today.
      case 'nav-impact':
        router.navigate('community-impact');
        break;

      // A3. The only route to the upgrade page that is not a padlock on
      // something already refused.
      case 'nav-upgrade':
        router.navigate('upgrade');
        break;

      case 'nav-activity-log':
        router.navigate('activity-log');
        break;

      case 'reset-data':
        _confirmDestructive(
          'Reset all data',
          'This will delete everything — your profile, history, and programme. It cannot be undone.',
          () => {
            store.reset();
            router.navigate('onboarding/thread');
          },
          container
        );
        break;
    }
  }

  // ── Developer panel toggle ─────────────────────────────────────────────────

  function _toggleDevPanel(container) {
    const panel = container.querySelector('#settings-dev-panel');
    if (!panel) return;
    const isHidden = panel.hasAttribute('hidden');
    if (isHidden) {
      panel.removeAttribute('hidden');
      panel.removeAttribute('aria-hidden');
    } else {
      panel.setAttribute('hidden', '');
      panel.setAttribute('aria-hidden', 'true');
    }
  }

  // ── Confirmation dialog ────────────────────────────────────────────────────

  function _confirmDestructive(title, message, onConfirm, container) {
    const existing = document.getElementById('settings-confirm-dialog');
    if (existing) existing.remove();

    const dialog = document.createElement('div');
    dialog.id = 'settings-confirm-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'confirm-dialog-title');
    dialog.className = 'settings-dialog';
    dialog.innerHTML = `
      <div class="settings-dialog__backdrop"></div>
      <div class="settings-dialog__content">
        <h2 class="settings-dialog__title" id="confirm-dialog-title">${_esc(title)}</h2>
        <p class="settings-dialog__message">${_esc(message)}</p>
        <div class="settings-dialog__actions">
          <button class="btn btn-ghost" id="confirm-cancel">Cancel</button>
          <button class="btn btn-danger" id="confirm-ok">${_esc(title)}</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Trap focus within dialog
    const focusable = dialog.querySelectorAll('button');
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    first.focus();

    dialog.addEventListener('keydown', e => {
      if (e.key === 'Escape') { dialog.remove(); return; }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });

    dialog.querySelector('#confirm-cancel').addEventListener('click', () => dialog.remove());
    dialog.querySelector('#confirm-ok').addEventListener('click', () => {
      dialog.remove();
      onConfirm();
    });
    dialog.querySelector('.settings-dialog__backdrop').addEventListener('click', () => dialog.remove());
  }

  // ── Toast ──────────────────────────────────────────────────────────────────

  function _showToast(message, container) {
    const existing = container.querySelector('.settings-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'settings-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  function _esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { mount };
}
