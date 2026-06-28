/**
 * js/data/beat3-scripts.js
 * 28 Jun 2026 v1
 *
 * Onboarding Beat 3 reflection scripts — Nurturing voice.
 * Seven territory branches, one per hardBeforeSelection territory.
 *
 * Used by:
 *   onboarding/reflection.js — renders five-part script based on dominant territory
 *   onboarding/hard-before.js — renders chip acknowledgement line on selection
 *
 * Territory IDs match hardBeforeSelections[] values written by hard-before.js:
 *   trust-rupture | escalation-trap | life-interruption | wrong-fit
 *   invisible-person | body-story | the-history
 *
 * Each territory:
 *   chip  {string}   — one-line acknowledgement shown in hard-before.js as chip tapped
 *   parts {string[]} — five-part Beat 3 script rendered sequentially in reflection.js
 *
 * Five-part shape:
 *   [0] Name what they said — contextualised, not reflected word for word
 *   [1] Place it in a larger truth — the shared human experience
 *   [2] Open the door — what Alongside: Move does differently (named explicitly)
 *   [3] We will never / we will always — territory-specific promises
 *   [4] The invitation — the relationship beginning
 *
 * Content session: D6 — 28 Jun 2026. Nurturing voice only.
 * Other voices (Steady, Energetic, Minimal) post-beta.
 *
 * WCAG: content only — no UI. All text rendered by reflection.js must
 * meet WCAG 2.2 AA contrast and screen reader requirements.
 */

export const beat3Scripts = {

  // ─────────────────────────────────────────────────────────────────────────
  // 1. TRUST RUPTURE
  // Chip label: "The app didn't do what it promised"
  // ─────────────────────────────────────────────────────────────────────────
  "trust-rupture": {
    chip: "Yeah. That one's worth saying.",
    parts: [
      "You've been here before. You gave something a real go — properly committed, not just dabbled. And then something happened. Maybe a technical thing, maybe life, maybe an expectation that turned out not to be realistic. Whatever it was, it broke the trust. And the worst part wasn't the thing itself. It was the thought that crept in after — that maybe you were the problem.",

      "You weren't. Most fitness tools are built on an assumption that if you just follow the system, the system will work. What that leaves out is everything — your life, your body, the day everything went sideways, the fact that the system was designed for someone who isn't you. When those tools fail, they don't say sorry, we weren't built well enough. They just go quiet. And you're left holding the disappointment.",

      "Here, I'm not going to make promises about what your body will do. I have no idea — and anyone who tells you otherwise is selling something. What I can promise is what I will do. Which is different.",

      "I will never give you a number I can't stand behind. I will never reset your progress because life interrupted. I will never pretend that a week where nothing happened is the same as a week where something hard happened. What I will do is tell you what I actually know, be honest when I don't know something, and treat your effort as real — regardless of what the outcome looked like.",

      "I know trust isn't something you hand over because someone asks for it. You don't have to trust this yet. Just see what it feels like when something shows up and keeps showing up. I'm not going anywhere, and I'll be here when you're ready to let this be something real."
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. ESCALATION TRAP
  // Chip label: "It moved faster than I could keep up"
  // ─────────────────────────────────────────────────────────────────────────
  "escalation-trap": {
    chip: "That gap between where it wanted you to be and where you were — that's a design problem, not yours.",
    parts: [
      "You know that feeling when the next step arrives and it just doesn't feel connected to where you actually are? Like the programme decided what came next without checking in with you first. The jump felt algorithmic. The pressure to perform at a level that wasn't quite yours yet — and then the week after, another jump. That's not falling behind. That's being asked to follow something that wasn't really paying attention to you.",

      "Most programmes are built on a straight line. Week one to week twelve, each step harder than the last. That only works if your body and your life move in straight lines too — and they don't, for most people. It was never designed to flex for where you actually were. So when it broke, that wasn't a failure of effort. It was a failure of design.",

      "With Alongside: Move, there is no pace you're supposed to match. That gap between where it wanted you to be and where you were — that's a design problem from other apps, not yours. Here, what comes next comes from where you actually are.",

      "I will never set a pace and expect you to follow it regardless of what's happening. I will never treat a slower week as a step backwards. What I will do is pay attention to where you actually are — not where a schedule says you should be — and work from there.",

      "You don't have to prove you can keep up here. There's nothing to keep up with. Just show up as you are, and we'll figure out what that looks like together. I'll be here for the slow weeks as much as the good ones."
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. LIFE INTERRUPTION
  // Chip label: "Something happened and there was no way back in"
  // ─────────────────────────────────────────────────────────────────────────
  "life-interruption": {
    chip: "Life doesn't pause. And it shouldn't have to.",
    parts: [
      "Something happened. It might have been illness, or injury, or a period of time where everything else had to come first. And when you came back — or tried to — the app hadn't noticed you'd gone. There was no way back in that felt right. Just a gap where your progress used to be, and the quiet implication that you'd have to start again.",

      "Life interrupts. That's not an exception to how things go — it's part of how things go. But most programmes treat any absence as a deviation from the plan. They don't have a way back in that meets you where you are. They just wait, or reset, or carry on without you. And that leaves people feeling like they broke something that was actually fine until life happened.",

      "With Alongside: Move, there is always a way back in. Not a way back to where you were — a way in to where you are now. Whatever happened, however long it's been, the door is open and it opens from wherever you're standing.",

      "I will never treat time away as failure. I will never ask you to pick up where you left off as though nothing happened. What I will do is ask how you are when you come back, take that seriously, and work out what makes sense from there. The gap doesn't define the story. What you do next does.",

      "When you come back, I'm going to ask what happened and how long you were out. Not because I'm keeping score — but because a week with flu lands differently on the body than six weeks recovering from injury, and I want to start from the right place for you. You won't have to justify yourself. You'll just have to tell me, and I'll take it from there."
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. WRONG FIT
  // Chip label: "It wasn't built for someone like me"
  // ─────────────────────────────────────────────────────────────────────────
  "wrong-fit": {
    chip: "That's one of the most honest things you can say about most fitness apps. And you're right. But I want to mark the distinction, clearly.",
    parts: [
      "You looked at what was on offer and something didn't fit. Maybe it was the assumptions built into the exercises — bodies that move in ways yours doesn't, or can't right now. Maybe it was the language, or the imagery, or the pace, or the way the whole thing seemed designed around a version of normal that wasn't yours. You didn't feel excluded by accident. You felt excluded because you were. That's a hard thought to take.",

      "Most fitness tools are designed around a narrow picture of who exercises. A particular kind of body, a particular kind of life, a particular kind of nervous system. Everything outside that picture gets treated as an edge case. But there's something underneath that problem that matters even more — those tools only ever saw the body. Not the person carrying it. Not what that person was thinking, or feeling, or going through, or hoping for. Just the body, and whether it was performing correctly. That's not what movement is. And it's not what you are.",

      "With Alongside: Move, the starting point was the people those tools consistently failed. Not as an afterthought — as the foundation. And what it does goes further than finding exercises that fit. It works with your whole self — the body that shows up, the mind that's running alongside it, and whatever it is that makes movement mean something to you. All of that is welcome here. All of that is what we're working with.",

      "I will never ask you to change so that you fit into the programme I offer. That defeats the whole point. What I will do is build from what's actually true for you — your body, your conditions, your energy, your history — and work from there.",

      "So you will have your own programme, built for you, meeting you where you are. That's not a figure of speech — it's what the product is built on. Show me what's true for you, and I'll work with that. All of it."
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. INVISIBLE PERSON
  // Chip label: "I never felt like it knew I was there"
  // ─────────────────────────────────────────────────────────────────────────
  "invisible-person": {
    chip: "That's not a small thing to name. And it matters more than most apps realise.",
    parts: [
      "It wasn't that anything went badly wrong. It's that it never felt personal. The notifications arrived on schedule. The plans updated. The numbers changed. But none of it felt like it was for you specifically — it felt like it would have looked exactly the same for anyone. Like you could have been anybody, and the app wouldn't have noticed the difference.",

      "Most fitness tools are built to deliver a programme. They're not built to know a person. The distinction sounds small but it isn't — because when something doesn't know you're there, you stop feeling like showing up matters. Not because you've lost motivation. Because the relationship was never real in the first place. If it didn't know you were there, it wouldn't miss you when you weren't.",

      "With Alongside: Move, the coach is paying attention — not to your metrics, but to you. Not to a user profile that could belong to anyone, but to what you specifically have said, felt, and done. What you said last time. What's changed. What today looks like compared to yesterday. It won't always get it right. But it will always be trying to see you — just you.",

      "I will never send you something that could have gone to anyone. I will never treat your data as the point. What I will do is use what you tell me to build a picture of you — and speak to that picture, not to a user profile.",

      "You are always worth knowing. The gap you felt with other apps — where you felt it didn't know you. I'm going to do my best to close it."
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. BODY STORY
  // Chip label: "I've never felt comfortable in my body"
  // ─────────────────────────────────────────────────────────────────────────
  "body-story": {
    chip: "Thank you for saying that. It's not easy to name it.",
    parts: [
      "Alongside: Move goes deeper than any app. You've told me that your relationship with your body has been hard — not just recently, not just since you tried to get fit, but in a way that's been there for a while. Maybe a long while. Movement has always carried something extra with it. Not just effort, but a feeling about yourself that effort alone doesn't touch.",

      "That's not unusual. It's just rarely spoken about honestly in this space. Most fitness tools are built on the assumption that you want to change your body — that change is the goal, and discomfort with where you are is the fuel. That framing doesn't just fail people who feel this way. For some people, it makes things worse. It turns movement into a referendum on whether you're acceptable yet. For some people this brings shame, which can lead to toxic feelings about yourself.",

      "With Alongside: Move, movement isn't about changing what you look like. It's about what it feels like to be in your body — and building a relationship with that, slowly, on your terms. That might sound insignificant. It isn't.",

      "I will never frame movement as a way to fix something about you. I will never use language that treats your body as a problem to be solved. What I will do is meet you where you are — in the body you have, on the day you're having — and work from there, without judgement and without an agenda. Instead, we will work towards helping you feel better about yourself, in both body and mind.",

      "You don't have to feel comfortable in your body to start. You just have to be willing to see what happens when something treats it with care. That's what I'm here for."
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. THE HISTORY
  // Chip label: "Exercise has always felt like it was for other people"
  // ─────────────────────────────────────────────────────────────────────────
  "the-history": {
    chip: "That feeling often starts much earlier than people realise. And it's carried much further than it should be.",
    parts: [
      "Alongside: Move goes back further than any other app will. Because what you've named isn't just a bad experience with fitness — it's something that was shaped much earlier than that. For many people it starts in school PE — the lesson where your body felt on display, or where you were picked last, or pushed past what felt comfortable, or just never quite feeling like this segment of the world was built for someone like you. That feeling doesn't stay in the changing room. It travels. Sometimes for decades. And most of the time, people don't even know that's where it started.",

      "The fitness industry was built for people who already felt at home in it. It assumes a baseline comfort with movement, with being observed, with the language of performance and improvement. However, for people whose earliest experiences of exercise were uncomfortable — or worse — that assumption lands like a closed door. Not motivation. Not time. Not willpower. A door that always seemed to open for other people and never quite for you.",

      "With Alongside: Move, we know that history might be in the room with you. We're not going to pretend it isn't, or try to override it with enthusiasm and motivation. What we're going to do is work with your whole self — the body you have, the mind running alongside it, and the history that shaped how movement feels — and build something that feels genuinely yours, at a pace that feels safe.",

      "I will never put you on display, even to yourself in ways that don't feel right. I will never treat your caution as something to push through. What I will do is stay close to where you actually are — not where a programme thinks you should be by now — and treat every movement you make as exactly what it is: yours, and real, and enough.",

      "You don't have to have a good relationship with movement to start here. You just have to be willing to see if this feels different. It might take time. That's fine — I'm not going anywhere. And if something doesn't feel right, you tell me, and we work it out together. That's my promise to you."
    ]
  }

};

// ─────────────────────────────────────────────────────────────────────────────
// TERRITORY RESOLVER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the dominant territory from hardBeforeSelections.
 * Current logic: first selection wins.
 * Beta learning: does order of selection signal emotional priority?
 * Review post-beta before changing this.
 *
 * @param {string[]} selections — array of territory IDs from store
 * @returns {string|null}
 */
export function getDominantTerritory(selections = []) {
  if (!Array.isArray(selections) || selections.length === 0) return null;
  return selections[0];
}

/**
 * Get the Beat 3 script for the dominant territory.
 *
 * @param {string[]} selections — hardBeforeSelections from store
 * @returns {{ chip: string, parts: string[] }|null}
 */
export function getBeat3Script(selections = []) {
  const territory = getDominantTerritory(selections);
  if (!territory) return null;
  return beat3Scripts[territory] ?? null;
}

/**
 * Get just the chip acknowledgement line for a territory.
 * Used by hard-before.js to show real-time response on chip tap.
 *
 * @param {string} territoryId
 * @returns {string|null}
 */
export function getChipAcknowledgement(territoryId) {
  return beat3Scripts[territoryId]?.chip ?? null;
}
