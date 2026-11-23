/**
 * js/data/guides.js
 * 16 Nov 2026 v3
 *
 * v1 - P-25 HOW-TO GUIDES (spec BNH-Files Product/alongside_howto_guides_
 *   12nov2026_v3.md; the seven P1 guides' words approved by Graeme 12 Nov,
 *   Product/alongside_howto_p1_guides_12nov2026_v2.md; mock-up v2 approved
 *   12 Nov: "Perfect"). The guide text, written once, here, as the app's
 *   other content is. Precached, so it works offline and matches the app in
 *   your hand. Drawn through esc(); **bold** is the app's own label.
 *
 * A guide: { id, cat, title, outcome, tiers, on, keywords, ways, notQuite,
 *   end }. A way is one route through it (the Plan's and Free's, or "set it
 *   up" and "change it"): { when, parts: [{ name, steps, done }] }; the
 *   first way whose `when` holds for this person is the one shown and walked.
 *
 * A step: { screen, target, say, label, tap, optional, then, alts }.
 *   screen   the route it happens on ("any": wherever the person is).
 *   target   the data-guide-target marker on the real control (or
 *            "nav:progress" for the bottom bar), or a list: any of them.
 *   label    the control's own name, as on screen; tools/verify-guides.mjs
 *            checks it is that control's name. "{day}" matches a day name.
 *   tap      false: nothing to tap; the box shows Next (read, or type).
 *   optional true: shown only if the control is there (I have read this.
 *            is asked the first time only); skipped otherwise.
 *   then     after the target is tapped, a second ring on the same screen
 *            (Pick up to 3, then Continue), as mock-up v2.
 *   alts     one of these, whichever control is on screen.
 *
 * v2 (15 Nov, Graeme on the live app: "Where's this?", A1 on a Home whose day
 *   was set in Your week, where there is no Let me choose for you). A1's
 *   first step is whatever Home leads with today: Let me choose for you,
 *   Today, from your week, or Start your list; its last two steps are Today's
 *   plan's or the safety note's, whichever opens. A1 is offered only when Home
 *   leads with one of those (WHEN.homeStarts); otherwise its overview says
 *   what to do instead.
 *
 * v3 (16 Nov, P-36): My exercises opens on its list, with Start, before the
 *   safety note: A1, A2 and C2 say "This is your list. Tap Start." (asked
 *   only if the list is there).
 *
 * Nothing here is health advice: the guides say how to use the app.
 * Rule-based; no AI. Nothing about using a guide is stored or sent.
 */
import { store } from "../store.js";
import { isPremium } from "../auth.js";
import { todayState } from "../views/plan-home.js";

export const HELP_EMAIL = "hello@buildnewhabits.co.uk";

export const CATEGORIES = Object.freeze([
  { id: "start",    name: "Getting started",               kind: "teal",   icon: "arc" },
  { id: "plans",    name: "Your exercises and plans",      kind: "amber",  icon: "list" },
  { id: "week",     name: "Your week",                     kind: "blue",   icon: "week" },
  { id: "life",     name: "When life gets in the way",     kind: "green",  icon: "rest" },
  { id: "progress", name: "Your progress and your arc",    kind: "violet", icon: "arc" },
  { id: "account",  name: "Account, privacy and the Plan", kind: "slate",  icon: "keep" },
]);

// The conditions a way can need. Read from the store, never guessed.
const hasWeek = () => !!store.get("weekShape");
const hasArc  = () => !!(store.get("arc") || {}).active;
export const WHEN = Object.freeze({
  plan:    () => isPremium(),
  free:    () => !isPremium(),
  always:  () => true,
  noWeek:  () => !hasWeek(),
  hasWeek: () => hasWeek(),
  noArc:   () => !hasArc(),
  // Today's day from your week leads Home.
  weekLeads: () => isPremium() && (() => { try { return todayState(null) === "week"; } catch { return false; } })(),
  // The Plan's Home leads with something to start: the coach, or today's day from your week.
  homeStarts: () => isPremium() && (() => { try { return ["coach", "week"].includes(todayState(null)); } catch { return false; } })(),
  hasArc:  () => hasArc(),
  // P-39 S6. Start your Plan still on the Plan's Home, or closed.
  startOpen:   () => isPremium() && !(store.get("myMove") || {}).startClosed,
  startClosed: () => isPremium() && !!(store.get("myMove") || {}).startClosed,
});

// P-39. Making my Move's own screens, for A3 however it is reached.
const A3_STEPS = [
  { screen: "my-move", target: "mm-start", label: "Start", optional: true, say: "Tap **Start**." },
  { screen: "my-move", target: "mm-next", label: "Next", say: "Tick what you want Alongside for. Then tap **Next**." },
  { screen: "my-move", target: "mm-next", label: "Next", say: "Choose how much choice you want on a good day. Then tap **Next**." },
  { screen: "my-move", target: "mm-done", label: "That's mine", say: "Choose up to two things for a hard day. Then tap **That's mine**." },
];

// Asked once a day: already answered today, they are skipped (the guide moves
// on when the next step's screen opens).
const A1_CHECKIN = [
  { screen: "checkin", target: "energy", label: "Okay", say: "How’s your energy? Tap the word closest to it. **Okay** is fine." },
  { screen: "checkin", target: "mood", label: "Okay", say: "And your mood? Tap the closest word." },
  { screen: "checkin", target: "sore", label: "Nothing today", say: "If nothing is sore, tap **Nothing today**. If something is, tap where." },
];

export const GUIDES = Object.freeze([
  {
    id: "A1", cat: "start", tiers: ["free", "plan"],
    title: "I’ve just opened the app. What do I do?",
    outcome: "You’ll end up doing one session, chosen for how you are today. Three quick questions, then one tap.",
    on: ["today", "checkin"],
    keywords: ["start", "begin", "new", "first", "what now", "lost", "how"],
    ways: [
      { when: "homeStarts", parts: [{ steps: [
        { screen: "today", alts: [
          { target: "coach-row", label: "Let me choose for you", say: "Tap **Let me choose for you**." },
          { target: "start-list", label: "Start your list", say: "Today is your own list, from your week. Tap **Start your list**." },
          { target: "week-row", label: "Today, from your week", say: "Today is set in your week. Tap **Today, from your week**." },
        ] },
        ...A1_CHECKIN,
        { screen: "prescribed-session", target: "list-start", label: ["Start", "Carry on"], optional: true, say: "This is your list. Tap **Start**." },
        { screen: ["coach-proposal", "prescribed-session"], optional: true, alts: [
          { target: "ack", label: "I have read this.", say: "This is today’s plan. The first time, tick **I have read this.**" },
          { target: "gate-ack", label: "I have read this.", say: "The first time, read **Before you start**, then tick **I have read this.**" },
        ] },
        { screen: ["coach-proposal", "prescribed-session", "path"], alts: [
          { target: "start", label: "Start", say: "Tap **Start**." },
          { target: "gate-start", label: "Start the session", say: "Tap **Start the session**." },
          { target: "path-start", label: "Start", say: "This is the coach’s choice for today. Tap **Start**." },
        ] },
      ] }] },
      { when: "free", parts: [{ steps: [
        { screen: "today", target: "not-sure", label: "Not sure? I’ll pick something", say: "Tap **Not sure? I’ll pick something**." },
        ...A1_CHECKIN,
        { screen: "coach-proposal", target: "ack", label: "I have read this.", optional: true, say: "The first time, tick **I have read this.**" },
        { screen: "coach-proposal", target: "start", label: "Start", say: "Tap **Start**." },
      ] }] },
    ],
    noWay: "Home already shows what’s set for today. Tap it, or choose one of the four ways in under **Or something else today**.",
    end: "Your session has started.",
    notQuite: [
      { q: "I don’t want to answer questions today", tiers: ["plan"], answer: "On the first question, tap **Not today**. Today’s plan opens straight away, with **Check in now** if you change your mind." },
      { q: "I’d rather choose myself", answer: "If Home says **Let me choose for you**: tap **‹ Back**, then **Get stronger**, **Keep moving**, **Stretch** or **Move to feel better**. If Home says **What do you want to do today?**: tap **Pick something else**, then a session such as **Yoga & Pilates**." },
      { q: "Something’s sore", answer: "Tap where in the questions. If something hurts — sharp, or building as you go — stop that one. Aching afterwards is normal." },
      { q: "I’ve only got a few minutes", answer: "On today’s plan, tap the length, for example **30 min**, and choose a shorter one." },
    ],
  },
  {
    // P-39 S5. Making my Move, from Start your Plan or Change what Alongside is for.
    id: "A3", cat: "start", tiers: ["plan"],
    title: "Make Home show only what I want",
    outcome: "Home shows what you want Alongside for, and what you chose for hard days. About a minute.",
    on: ["today", "settings", "my-move"],
    keywords: ["make it mine", "my move", "home", "simple", "hard day", "less", "choose", "personalise", "personalize", "too much", "change what alongside is for"],
    // S6: from Start your Plan while it shows; after it is closed, from Settings › Your plan (Home keeps no standing link).
    ways: [{ when: "startOpen", parts: [{ steps: [
      { screen: "today", target: "mm-open", label: "Making my Move", say: "Under **Start your Plan**, tap **Making my Move**." },
      ...A3_STEPS,
    ] }] }, { when: "startClosed", parts: [{ steps: [
      { screen: "any", target: "nav:settings", label: "Settings", say: "Tap **Settings** at the bottom." },
      { screen: "settings", target: "settings-plan", label: "Your plan", say: "Tap **Your plan**." },
      { screen: "settings", target: "mm-settings", label: "Making my Move", say: "Tap **Making my Move**." },
      ...A3_STEPS,
    ] }] }],
    noWay: "This is part of the Plan.",
    end: "Home now shows what you chose.",
    notQuite: [
      { q: "I'm not sure what I want", answer: "On the first screen, tap **Not sure? Keep it simple**. Home will just say what to do each day." },
      { q: "It's a hard day today", answer: "Your check-in sees it: answer **Low** for energy or **Struggling** for mood, and Home shows what you chose for days like this. Or, with a week set, tap **Change today**, then **It's a hard day**. **Show my usual Home** puts it back." },
      { q: "I want to change it later", answer: "**Settings › Your plan › Making my Move**. Home also asks every twelve weeks of your arc." },
    ],
  },
  {
    id: "A2", cat: "start", tiers: ["plan"],
    title: "Start what I planned for today",
    outcome: "If today is in your week, it’s waiting at the top of Home. One tap to start.",
    on: ["today"],
    keywords: ["start", "today", "session", "go", "my list", "week"],
    ways: [{ when: "weekLeads", parts: [{ steps: [
      { screen: "today", target: "week-row", tap: false, say: "Today’s plan from your week is at the top, under **Today, from your week**." },
      { screen: "today", alts: [
        { target: "start-list", label: "Start your list", say: "It’s your own exercises: tap **Start your list**." },
        { target: "week-row", label: "Today, from your week", say: "It’s a session: tap its row." },
      ] },
      { screen: "prescribed-session", target: "list-start", label: ["Start", "Carry on"], optional: true, say: "This is your list. Tap **Start**." },
      { screen: ["prescribed-session", "coach-proposal"], target: ["gate-ack", "ack"], label: "I have read this.", optional: true, say: "The first time, read **Before you start**, then tick **I have read this.**" },
      { screen: ["prescribed-session", "coach-proposal"], target: ["gate-start", "start"], label: ["Start the session", "Start"], say: "Tap **Start the session**, or **Start**." },
    ] }] }],
    noWay: "Nothing is set for today. Home shows **Let me choose for you** instead (the guide above, “I’ve just opened the app”), or put sessions on set days first.",
    end: "Your session has started.",
    notQuite: [
      { q: "There’s nothing for today", guide: "C1" },
      { q: "I want something else today", answer: "Under **Or something else today**, choose **Get stronger**, **Keep moving**, **Stretch** or **Move to feel better**. Or tap **Change today**." },
      { q: "Not now after all", answer: "**Not now** takes you back to Home, and your list stays there." },
    ],
  },
  {
    id: "B1", cat: "plans", tiers: ["plan"],
    title: "I want the coach to know my physio plan",
    outcome: "Paste your plan in and it becomes your own exercises in the app, grouped the way your plan groups them. Five taps. They’re played as written: the coach doesn’t change them. On a sore day it says which ones load the sore area, and you choose.",
    on: ["prescribed", "plan-import", "your-week"],
    keywords: ["physio", "pt", "trainer", "sheet", "paste", "import", "programme", "routine", "my exercises", "add", "coach", "know", "rehab"],
    ways: [{ when: "always", parts: [{ steps: [
      { screen: "today", target: "library", label: "Library", say: "Tap **Library**." },
      { screen: "library", target: "my-exercises", label: "My exercises", say: "Tap **My exercises**." },
      { screen: "prescribed", target: "add-plan", label: "Add a plan you already have", say: "Tap **Add a plan you already have**." },
      { screen: "plan-import", target: "plan-text", label: "Your plan", tap: false, say: "Paste your plan into the box called **Your plan**. One exercise to a line works best. Put each day or session’s name on its own line." },
      { screen: "plan-import", target: "read-plan", label: "Read my plan", say: "Tap **Read my plan**." },
      { screen: "plan-import", target: "add-ticked", label: "Add the ticked ones to My exercises", say: "Check the list. Untick anything you don’t want. Then tap **Add the ticked ones to My exercises**." },
      { screen: "plan-import", target: "into-week", label: "Put them into your week", say: "To give each one a day, tap **Put them into your week** (the guide “I want my sessions on set days”)." },
    ] }] }],
    end: "Your exercises are in My exercises.",
    notQuite: [
      { q: "It says I couldn’t read much of this", answer: "Tap **Get the template**, send it to whoever wrote your plan, and paste back what they fill in." },
      { q: "It got an exercise wrong", answer: "Where it asks **Which is it?**, choose the right one, or untick it." },
      { q: "I see See the Plan instead", answer: "Adding a plan is part of the Plan." },
    ],
  },
  {
    id: "C1", cat: "week", tiers: ["plan"],
    title: "I want my sessions on set days",
    outcome: "Two parts. Part 1: choose the days you want to move. Part 2: say what each day is. On the day, it’s waiting on Home.",
    on: ["your-week", "plan-import"],
    keywords: ["days", "week", "monday", "schedule", "set", "routine", "gym", "plan"],
    ways: [
      { when: "noWeek", parts: [
        { name: "Part 1 of 2: choose your days", done: "Your days are set. Next, say what each one is.", steps: [
          { screen: "today", target: "library", label: "Library", say: "Tap **Library**." },
          { screen: "library", target: "your-week", label: "Your week", say: "Tap **Your week**." },
          { screen: "your-week", target: "build-with-me", label: "Build it with me", say: "Tap **Build it with me**." },
          { screen: "your-week", target: "days", label: "{day}", then: { target: "continue", label: "Continue", say: "Tap **Continue**. The other days are set to Rest. Rest counts." },
            say: "Tap the days you want to move, for example **Monday** and **Thursday**." },
        ] },
        { name: "Part 2 of 2: say what a day is", steps: [
          { screen: "your-week", target: "day-row", label: "{day}", say: "Tap the row for a day, for example **Mon**." },
          { screen: "your-week", target: "day-own", label: "My exercises", say: "To use your own exercises, tap **My exercises**." },
          { screen: "your-week", target: "day-which", label: "*", say: "Under **Which of My exercises**, tap the one for that day, for example **Gym A**." },
          { screen: "your-week", target: "save-day", label: "Save {day}", say: "Tap **Save {day}**, for example **Save Monday**. Do the same for your other days." },
        ] },
      ] },
      { when: "hasWeek", parts: [{ name: "Say what a day is", steps: [
        { screen: "your-week", target: "day-row", label: "{day}", say: "Tap the row for a day, for example **Mon**." },
        { screen: "your-week", target: "day-own", label: "My exercises", say: "To use your own exercises, tap **My exercises**." },
        { screen: "your-week", target: "day-which", label: "*", say: "Under **Which of My exercises**, tap the one for that day, for example **Gym A**." },
        { screen: "your-week", target: "save-day", label: "Save {day}", say: "Tap **Save {day}**, for example **Save Monday**. Do the same for your other days." },
      ] }] },
    ],
    end: "On the day, Home shows **Today, from your week**.",
    notQuite: [
      { q: "There is nothing in My exercises yet", guide: "B1" },
      { q: "I want the coach to build the day instead", answer: "When you say what a day is, leave it on **A session** and choose what it’s mostly for." },
      { q: "I want a routine every day as well", guide: "C2" },
    ],
  },
  {
    id: "C2", cat: "week", tiers: ["plan"],
    title: "I want to do my routine every day as well as my sessions",
    outcome: "Keep your sessions in Your week, and start a daily routine from My exercises. You can also put a routine on Home: under its heading in My exercises, set **On Home**.",
    on: ["your-week", "prescribed"],
    keywords: ["daily", "routine", "morning", "evening", "every day", "as well", "little and often", "home"],
    ways: [{ when: "always", parts: [{ steps: [
      { screen: "today", target: "library", label: "Library", say: "Tap **Library**." },
      { screen: "library", target: "my-exercises", label: "My exercises", say: "Tap **My exercises**." },
      { screen: "prescribed", target: "start-group", label: "Start {list}", say: "Each part of your plan has its own button. Tap **Start {its name}**, for example **Start Morning routine**." },
      { screen: "prescribed-session", target: "list-start", label: ["Start", "Carry on"], say: "This is your list. Tap **Start**." },
    ] }] }],
    end: "Your routine has started.",
    notQuite: [
      { q: "My routine isn’t there", guide: "B1" },
      { q: "It’s all one long list", answer: "Your plan had no part names. Add a line with the part’s name above its exercises when you paste it in." },
    ],
  },
  {
    id: "D1", cat: "life", tiers: ["free", "plan"], readOnly: true, walk: "A1",
    title: "I’ve missed days. Have I ruined it?",
    outcome: "No. Alongside never counts days in a row, so there’s nothing to lose and nothing to catch up on. Start as you usually do.",
    on: ["today", "progress", "coach-proposal"],
    keywords: ["missed", "away", "holiday", "ill", "break", "behind", "ruined", "start again", "gap"],
    read: [
      { say: "Start as you usually do (the guide “I’ve just opened the app”)." },
      { say: "After a week or more away, Today’s plan asks about the last little while. Tap the closest: **Life got full**, **Finding it harder**, **Was unwell** or **Was injured**. Or tap **Rather not say — let’s just begin**. It’s optional, and asked once." },
      { say: "After **Life got full** or **Finding it harder**, it offers **Yes, ease me back in** or **No, I feel fine — carry on as before**." },
      { say: "After **Was unwell** or **Was injured**, your first session back starts gentler without asking." },
      { tiers: ["plan"], say: "**Your week** carries on as it was. Missing a day is fine: the week does not keep score. Your arc doesn’t need making up either." },
      { tiers: ["free"], say: "If you follow My programme and have missed a couple of sessions, Today’s plan asks how to fit the rest: **Stay in 12 weeks** or **Keep the same rhythm**." },
    ],
    end: "",
    notQuite: [
      { q: "I don’t feel up to a full session", answer: "On today’s plan, tap the length, for example **30 min**, and choose a shorter one." },
      { q: "Something’s sore after the break", answer: "Tap where in the questions. If something hurts — sharp, or building as you go — stop that one. Aching afterwards is normal." },
      { q: "I want to change my week", tiers: ["plan"], answer: "Home › **Library** › **Your week**, then tap a day." },
      { q: "It’s more than missed days", answer: "The **Wellbeing** tab has quieter things. **Still stuck?** on the Help page says who to talk to." },
    ],
  },
  {
    id: "E3", cat: "progress", tiers: ["plan"],
    title: "I want to work towards something",
    outcome: "Your arc is what you’re working towards, in your own words. Four questions, and the coach leans your sessions towards it. Change it or stop it whenever you like.",
    on: ["progress", "arc-setup", "stretch-arc", "today"],
    keywords: ["arc", "aim", "goal", "working towards", "change", "start again", "fresh", "set up", "purpose"],
    ways: [
      { when: "noArc", name: "Set it up", parts: [{ steps: [
        { screen: "any", target: "nav:progress", label: "Progress", say: "Tap **Progress** at the bottom." },
        { screen: "progress", target: "arc-setup", label: "Set up your arc", say: "Under **Your arc**, tap **Set up your arc**." },
        { screen: "arc-setup", target: "aims", label: "*", say: "**What do you want to be able to do?** Tap the one closest to you. None fit? Tap **None of these — show me everything**." },
        { screen: "arc-setup", target: "continue", label: "Continue", say: "Tap **Continue**." },
        { screen: "arc-setup", target: "strands", label: "*", then: { target: "continue", label: "Continue", say: "Tap **Continue**." }, say: "**What feeds it?** Pick up to 3, then tap **Continue**." },
        { screen: "arc-setup", target: ["continue", "skip"], label: ["Continue", "Skip for now"], say: "**How would you know it was happening?** Write it in your own words and tap **Continue**, or tap **Skip for now**." },
        { screen: "arc-setup", target: "yes-mine", label: "Yes, that’s mine", say: "**Is this yours?** If it is, tap **Yes, that’s mine**. If not, tap **Start again**." },
      ] }] },
      { when: "hasArc", name: "Change it", parts: [{ steps: [
        { screen: "any", target: "nav:progress", label: "Progress", say: "Tap **Progress**." },
        { screen: "progress", target: "change-arc", label: "Change my arc", say: "Under **Your arc**, tap **Change my arc**." },
        { screen: "stretch-arc", target: "arc-rows", label: "*", say: "Choose what to change. **Change what feeds it** or **Change how you’d know** keep the same arc and week. **Start a fresh arc** begins again from week 1. **Stop the arc** stops it." },
      ] }] },
    ],
    end: "Home shows your arc under the greeting.",
    notQuite: [
      { q: "None of the aims are mine", answer: "Tap **None of these — show me everything**." },
    ],
  },
]);

export const guideById = id => GUIDES.find(g => g.id === id) || null;

/** The tier this person is on, as the guides name it. */
export const tierNow = () => (isPremium() ? "plan" : "free");

/** Can this person do it? (A Plan guide on Free is listed, under Part of the Plan.) */
export const forTier = (g, tier = tierNow()) => g.tiers.includes(tier);

/** The way through this guide for this person now, or null. */
export function wayFor(g) {
  if (!g || g.readOnly) return null;
  return g.ways.find(w => (WHEN[w.when] || (() => false))()) || null;
}

/** Every step of a way, in order, each knowing its part. */
export function stepsOf(way) {
  if (!way) return [];
  return way.parts.flatMap((p, pi) => p.steps.map((s, si) => ({ ...s, part: pi, index: si, parts: way.parts.length, inPart: p.steps.length })));
}

/** The guides for a screen, for this person: only what they can do. D1 first after a week away. */
export function guidesFor(view, { tier = tierNow(), now = new Date() } = {}) {
  const list = GUIDES.filter(g => g.on.includes(view) && forTier(g, tier) && (g.readOnly || wayFor(g)));
  if (awayAWeek(now)) list.sort((a, b) => (b.id === "D1") - (a.id === "D1"));
  return list.slice(0, 3);
}

function awayAWeek(now) {
  const log = store.completedSessions ? store.completedSessions(store.get("activityLog") || []) : (store.get("activityLog") || []);
  if (!log.length) return false;
  const last = Math.max(...log.map(e => new Date(e.completedAt || e.loggedAt || e.date || 0).getTime()).filter(n => !Number.isNaN(n)));
  return Number.isFinite(last) && now.getTime() - last >= 7 * 864e5;
}

/** Search: every word, in the title or its keywords. Rules only. */
export function searchGuides(q) {
  const words = String(q || "").toLowerCase().replace(/’/g, "'").split(/[^a-z0-9']+/).filter(w => w.length > 1).map(w => w.replace(/s$/, ""));
  if (!words.length) return [];
  return GUIDES.filter(g => {
    const hay = (g.title + " " + g.keywords.join(" ")).toLowerCase().replace(/’/g, "'");
    return words.every(w => hay.includes(w));
  });
}

/** The guides in a category, the person's own first and Part of the Plan last. */
export function inCategory(cat, tier = tierNow()) {
  const all = GUIDES.filter(g => g.cat === cat);
  return { yours: all.filter(g => forTier(g, tier)), plan: all.filter(g => !forTier(g, tier)) };
}

/** The guide's words, escaped, with the app's labels in bold. */
export function sayHTML(s, esc) {
  return esc(String(s || "")).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
}
export const plainSay = s => String(s || "").replace(/\*\*/g, "");
