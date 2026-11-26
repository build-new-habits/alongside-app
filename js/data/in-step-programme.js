/**
 * js/data/in-step-programme.js
 * 26 Nov 2026 v3
 *
 * v3 - P-42 S1. The adults' Part 5, The world on your phone (approved by
 *   Graeme 26 Nov, BNH-Files Product/alongside_in-step-adult_part5_words_
 *   26nov2026_v2.md, word for word; tools/verify-p42-adult.mjs reads it).
 *   Part 5 is now the last part: "That's In Step ..." moves to its end,
 *   Part 4 closes as Parts 1 to 3 do, and Part 4's last episode,
 *   Recognition, gains its recap (about, notCame) for Part 5's first Last
 *   time. Five parts; 30 episodes.
 *
 * v2 - P-29 INSTEP-RECAP (approved by Graeme 19 Nov, BNH-Files
 *   Product/alongside_content_in-step-recap_19nov2026_v3.md, word for word;
 *   tools/verify-p29-recap.mjs reads it). Each episode carries its own
 *   recap: about (what we talked about, standing on its own without the
 *   title), notCame (its third answer), and recap.audio (the clip that says
 *   the whole recap). The recap is shown when the NEXT episode opens, so it
 *   lives on the episode it is about; the old prev line (on the episode
 *   after) is gone, except Part 4's: p4e1 to p4e5's recaps are approved but
 *   held for the clinical and safeguarding read of Part 4 (recapHeld), so
 *   p4e2 to p4e6 keep the line they had until then.
 *
 * 06 Nov 2026 v1
 *
 * P-28 EMPATHY-THREAD, S2 CONTENT DATA. In Step as a programme: four
 * parts of six episodes, widening outward (you, people close to you,
 * people you pass, people whose lives look nothing like yours).
 *
 * WORDING. Every line a person reads or hears is copied word for word
 * from the approved wording, BNH-Files
 * Product/alongside_content_in-step-guide-me_05nov2026_v5.md (Graeme,
 * 05 Nov, 19:47: "Everything looks fine to me"). Only the italics are
 * gone: a phrase the wording sets in italics as a quotation reads here
 * between quotation marks. The position names and how to stand or sit
 * (pose, how, alt) are the approved prototype's,
 * Product/alongside_guide_me_prototype_05nov2026_v5.html (Graeme, 05 Nov:
 * "I'm happy with the prototype"), because the wording's own stage
 * directions lean on each other ("Wall lean, as in episode 2").
 * tools/verify-p28-content.mjs reads both and fails on any difference.
 * Do not edit a line here without changing the approved wording first.
 *
 * ONE EPISODE: Listen, Hold still (with a seated way, or a standing one
 * where the hold is already seated), Choose (three ways, none right, then
 * the same plain line whichever was chosen), Carry it (one small thing
 * for today). From the second episode on it opens with last time's Carry
 * it and "Did it come up?", answered It did / Not yet / It didn't come
 * up. Only that tap is kept (inStepProgress.programme.lastAnswer, Schema
 * v1.123). Nothing typed, nothing scored, nothing counted back.
 *
 * NO RESEARCH. The old room's "Learn why" cited named studies; Graeme,
 * 12 Aug: "We make a claim, state why ... We don't cite research." Each
 * part says why in one plain sentence instead (`why`).
 *
 * AUDIO, TEXT FIRST. A line that is spoken carries `audio`, the clip's
 * name in the voice script (Product/alongside_voice_script_05nov2026_v1.md,
 * 109 clips). The file is audio/<audio>.mp3. When it is not there, the
 * screen shows the words and nothing speaks; a missing file is never an
 * error. Lines without `audio` are read, not heard (the question, the
 * three choices, last time's line): the coach speaks only when it adds
 * something.
 *
 * Both tiers (Graeme, 05 Nov). Nothing here reads the store.
 */

/** The plain line after every Choose, whichever way was chosen. */
export const ACK = { text: "There's no wrong answer.", audio: "instep-no-wrong-answer" };

/**
 * "Did you get to try it?" The tap is all that is kept. Ids are Schema
 * v1.123's. P-29 (approved 19 Nov): the first two are "I tried it" and
 * "I forgot"; the third is the episode's own (notCame), because a moment
 * that never came is not a miss. HELD_THIRD is said while a recap waits for
 * its read (recapHeld), with the line it had before.
 */
export const ANSWERS = [
  { id: "did",     label: "I tried it" },
  { id: "not-yet", label: "I forgot" },
  { id: "didnt",   label: null },
];
export const HELD_THIRD = "It didn't come up";

export const PARTS = [
  { n: 1, name: "You",
    why: "Before we look outward, we start with how you meet yourself, because that's the habit you'll carry to other people.",
    closing: { text: "That's Part 1. Next time, if you'd like, we'll start on the people close to you.", audio: "instep-p1-e6-closing" } },
  { n: 2, name: "People close to you",
    why: "The way you've learned to meet yourself, turned towards the people you see most.",
    closing: { text: "That's Part 2. Next time, if you'd like, we'll look at people you pass but don't know.", audio: "instep-p2-e6-closing" } },
  { n: 3, name: "People you pass",
    why: "People you'll never know, whose days you only see for a moment.",
    closing: { text: "That's Part 3. Next time, if you'd like, we'll look at people whose lives look nothing like yours.", audio: "instep-p3-e6-closing" } },
  { n: 4, name: "People whose lives look nothing like yours",
    why: "People whose days are shaped by things you've never had to think about.",
    closing: { text: "That's Part 4. Next time, if you'd like, we'll look at the world on your phone.", audio: "instep-p4-e6-closing-next" } },
  { n: 5, name: "The world on your phone",
    why: "Last, the world on your phone: what's built to hold your attention, and how you show up there, because the young people around you are watching how adults do it.",
    closing: { text: "That's In Step. You can go back to any episode in Wellbeing whenever you like.", audio: "instep-p4-e6-closing" } },
];

export const EPISODES = [
  { id: "p1e1", part: 1, episode: 1, title: "Three answers",
    about: "how honestly you say how you are, starting with your three check-in answers", notCame: "Nobody asked", recap: { audio: "instep-recap-1-1" },
    listen: { text: "This morning, or whenever you last checked in, you told me three things. How much energy you had. How you were feeling. Whether anything was sore. Those answers changed what I gave you. A lower number made the session gentler. A sore knee left some moves out. You told me the truth about your day, and the day was planned around it. So we start there: you, and how honestly you meet yourself.", audio: "instep-p1-e1-listen" },
    hold: { pose: "Standing tall", how: "Feet hip-width, arms easy by your sides.",
      alt: { label: "Seated", text: "Sit tall, feet flat, hands on your thighs." },
      secs: 45, text: "While you stand, ask yourself the first question again: how much energy is actually here? Not the answer you gave. The one that's true right now.", audio: "instep-p1-e1-hold" },
    choose: { question: "When you answer “How are you?”, what do you usually do?",
      options: ["Say “fine”, and mean “let's not get into it”.", "Give the honest answer, if it's someone I trust.", "Notice I'm not sure, and leave it there."] },
    carry: { text: "Once today, when someone asks how you are, notice the answer you give, and the one you didn't.", audio: "instep-p1-e1-carry" } },
  { id: "p1e2", part: 1, episode: 2, title: "The session you didn't do",
    about: "days when a plan doesn't fit, and seeing that as information, not a failing", notCame: "My plans held", recap: { audio: "instep-recap-1-2" },
    listen: { text: "Think of a day you'd planned to move and didn't. Not because anything went wrong. You just didn't feel like it. It's easy to call that lazy, or a slip. Here's what I saw on days like that: someone who was tired, or full, or somewhere else in their head. The plan didn't fit the day. That isn't a failing. It's information, and you'd see it that way in anyone else.", audio: "instep-p1-e2-listen" },
    hold: { pose: "Wall lean", how: "Back against a wall, feet a little forward, let the wall take your weight.",
      alt: { label: "Seated", text: "Sit back in the chair and let it hold you." },
      secs: 45, text: "Let the wall do some of the work. Notice how little it asks of you.", audio: "instep-p1-e2-hold" },
    choose: { question: "You skipped something you planned. What would you like to do with that?",
      options: ["Notice it, and leave it there.", "Get curious about what actually got in the way.", "Do something small instead, just to keep the thread going."] },
    carry: { text: "If you change a plan today, say the reason to yourself plainly, the way you'd say it about a friend.", audio: "instep-p1-e2-carry" } },
  { id: "p1e3", part: 1, episode: 3, title: "Two standards",
    about: "the kind voice you use for friends, and the sharper one you use on yourself", notCame: "It didn't get sharp", recap: { audio: "instep-recap-1-3" },
    listen: { text: "A friend tells you they didn't manage their run this week. What do you say? Probably something kind. That's okay. Life's busy. Go when you can. Now think about what you said to yourself the last time you didn't manage something. Often the two voices sound nothing alike. One is patient. The other is keeping score. You already know how to be patient. The question is who gets left out of it.", audio: "instep-p1-e3-listen" },
    hold: { pose: "Seated, hands resting", how: "Sit tall, one hand on your chest, one on your belly.",
      alt: { label: "Standing", text: "Or stand, hands the same." },
      secs: 45, text: "Breathe slowly. Notice which hand moves more. Speak to yourself, silently, the way you'd speak to that friend.", audio: "instep-p1-e3-hold" },
    choose: { question: "You catch yourself being harder on yourself than you'd ever be on someone else. What would you like to do?",
      options: ["Notice the double standard, nothing more.", "Ask what you'd actually say to a friend in this spot.", "Let the moment pass without dwelling on it."] },
    carry: { text: "Once today, when your inner voice gets sharp, ask: would I say this to someone I like?", audio: "instep-p1-e3-carry" } },
  { id: "p1e4", part: 1, episode: 4, title: "The pride you talked down",
    about: "how quickly a moment of pride gets talked down", notCame: "Nothing stood out", recap: { audio: "instep-recap-1-4" },
    listen: { text: "Something went well for you recently. Maybe a session, maybe something at work, maybe just a day you got through. For a second, you felt proud. And then, quite quickly, something talked you out of it. It wasn't much. Anyone could have done it. Lots of people do more. That second voice is very fast. Today, let the moment be as big as it was.", audio: "instep-p1-e4-listen" },
    hold: { pose: "Standing level", how: "Standing tall, arms easy, chin level.",
      alt: { label: "Seated", text: "Sit tall and let your shoulders settle." },
      secs: 30, text: "Stand the way someone stands when something went well. Not puffed up. Just level.", audio: "instep-p1-e4-hold" },
    choose: { question: "Something went well, and you felt proud for a second. What would you like to do?",
      options: ["Let the pride sit a moment longer, even if it's uncomfortable.", "Name specifically what you did that earned it.", "Move on. The moment's already passed."] },
    carry: { text: "If something goes well today, let it be the size it was. Don't shrink it.", audio: "instep-p1-e4-carry" } },
  { id: "p1e5", part: 1, episode: 5, title: "The decision nobody saw",
    about: "the quiet decision to show up at all, which nobody else sees", notCame: "Nobody seemed slow", recap: { audio: "instep-recap-1-5" },
    listen: { text: "Some days, the hardest part isn't the session. It's the moment before it, deciding to go at all. That moment doesn't get logged anywhere. Nobody claps. Most people around you will never know it happened. But it did. You made a choice when another one was easier. Everyone you meet has moments like that: quiet decisions nobody saw. You've just had one, so you know what they cost.", audio: "instep-p1-e5-listen" },
    hold: { pose: "Wall lean", how: "Back against a wall, feet a little forward.",
      alt: { label: "Seated", text: "Sit back and let the chair hold you." },
      secs: 45, text: "While you lean, remember the moment you decided to come today. Just remember it. It counted.", audio: "instep-p1-e5-hold" },
    choose: { question: "You had every reason to stop, and you didn't. Nobody saw it. What would you like to do?",
      options: ["Notice the decision, quietly.", "Think about what made the difference today.", "Let it be ordinary. Not everything needs marking."] },
    carry: { text: "Today, when someone seems slow or reluctant, remember there may be a decision you can't see.", audio: "instep-p1-e5-carry" } },
  { id: "p1e6", part: 1, episode: 6, title: "Adjusting",
    about: "how I fit the plan to your day, and turning that towards people close to you", notCame: "I didn't spot anyone", recap: { audio: "instep-recap-1-6" },
    listen: { text: "Every time you've checked in, I've changed something. A shorter session on a low day. A move left out for a sore back. A quieter finish when your mood was low. I didn't ask whether you deserved it. I just met you where you were. You've been doing some of that for yourself too. Next time, we'll turn it outward, towards the people closest to you. You already know how this works. You've been on the receiving end of it.", audio: "instep-p1-e6-listen" },
    hold: { pose: "Standing, then soften", how: "Stand tall, then let your knees soften and your arms hang.",
      alt: { label: "Seated", text: "Sit tall, then let your shoulders drop." },
      secs: 60, text: "Notice what changed when you softened. Nothing gave way. You're still standing. You just stopped holding on so hard.", audio: "instep-p1-e6-hold" },
    choose: { question: "The plan didn't fit the day, so you changed it. What would you like to do?",
      options: ["Notice that changing the plan was a choice, not a failure.", "Think of someone who might need their plan changed this week.", "Keep it simple. It's just what today needed."] },
    carry: { text: "Once today, notice someone whose plan didn't fit their day, and give them a little room.", audio: "instep-p1-e6-carry" } },
  { id: "p2e1", part: 2, episode: 1, title: "The short reply",
    about: "why someone close might be short with you, and how often it's their morning", notCame: "Nobody was short with me", recap: { audio: "instep-recap-2-1" },
    listen: { text: "Someone close to you is short with you, for no obvious reason. One word where there'd usually be a sentence. It's easy to take it personally, and sometimes it is personal. But think about your own short replies. Most of them weren't about the person in front of you. They were about the morning, or the inbox, or the night before. The person you love is carrying a check-in you haven't seen.", audio: "instep-p2-e1-listen" },
    hold: { pose: "Standing tall", how: "Feet hip-width, arms easy by your sides.",
      alt: { label: "Seated", text: "Sit tall, feet flat, hands on your thighs." },
      secs: 45, text: "While you stand, picture their morning before you saw them. Not what went wrong. Just that it happened, and you weren't there.", audio: "instep-p2-e1-hold" },
    choose: { question: "Someone close to you is short with you, for no obvious reason. What would you like to do?",
      options: ["Take it at face value and move on.", "Wonder what might be sitting underneath it for them.", "Ask them directly what's going on."] },
    carry: { text: "When someone close is short with you today, wonder about their morning before you answer.", audio: "instep-p2-e1-carry" } },
  { id: "p2e2", part: 2, episode: 2, title: "The cancelled plan",
    about: "a friend cancelling, and how it can mean they didn't have enough left", notCame: "No plans fell through", recap: { audio: "instep-recap-2-2" },
    listen: { text: "A friend cancels on you at the last minute, again. You can feel the day quietly reorganising itself. You might be disappointed. That's fair. You might also remember a time you cancelled, and how much it took just to send the message. From the outside, a cancellation looks like not caring. From the inside, it's often the opposite: someone who didn't have enough left to come.", audio: "instep-p2-e2-listen" },
    hold: { pose: "Wall lean", how: "Back against a wall, feet a little forward. Let the wall take your weight.",
      alt: { label: "Seated", text: "Sit back in the chair and let it hold you." },
      secs: 45, text: "Let the wall take some of your weight. Think of the last time you had nothing left to give, and someone let you off.", audio: "instep-p2-e2-hold" },
    choose: { question: "A friend cancels on you last-minute, again. What would you like to do?",
      options: ["Let it go, no comment.", "Notice what might actually be going on for them.", "Notice what you're feeling before you decide how to respond."] },
    carry: { text: "If a plan falls through today, notice what you feel before you decide what it means.", audio: "instep-p2-e2-carry" } },
  { id: "p2e3", part: 2, episode: 3, title: "The same worry again",
    about: "a worry that keeps coming back, and how being heard can make it lighter", notCame: "Nobody repeated a worry", recap: { audio: "instep-recap-2-3" },
    listen: { text: "Someone in your family brings up the same worry again. You've heard this one a few times now. It's tempting to give the same answer, a little shorter each time. But a worry that keeps coming back usually hasn't been put down yet. Repeating it is how some people carry it. You don't have to fix it. Sometimes being heard is the only thing that makes it lighter.", audio: "instep-p2-e3-listen" },
    hold: { pose: "Seated, palms up", how: "Sit tall, hands resting on your thighs, palms up.",
      alt: { label: "Standing", text: "Or stand, hands open by your sides." },
      secs: 45, text: "Open hands, nothing to hold. Imagine listening to that worry once more, without needing to answer it.", audio: "instep-p2-e3-hold" },
    choose: { question: "A family member brings up the same worry again. You've heard it a few times now. What would you like to do?",
      options: ["Answer it the way you have before.", "Notice that repetition is often what worry sounds like.", "Say plainly that you've noticed they're carrying this."] },
    carry: { text: "If someone repeats a worry today, listen as if it's the first time.", audio: "instep-p2-e3-carry" } },
  { id: "p2e4", part: 2, episode: 4, title: "Their good news",
    about: "feeling glad, and something harder to say, when someone gets what you wanted", notCame: "Nobody shared news", recap: { audio: "instep-recap-2-4" },
    listen: { text: "Someone you care about gets something you've wanted for yourself. A job, a home, a body that seems to just work. You're glad for them. And there's another feeling under it, harder to say out loud. Both can be true at once. Noticing the second one honestly doesn't make you a worse friend. It makes you an honest one, and honest people are easier to be close to.", audio: "instep-p2-e4-listen" },
    hold: { pose: "Standing level", how: "Standing tall, arms easy, chin level.",
      alt: { label: "Seated", text: "Sit tall and let your shoulders settle." },
      secs: 30, text: "Stand level. Let both feelings stand there too, side by side. Neither has to win.", audio: "instep-p2-e4-hold" },
    choose: { question: "Someone you care about achieves something you've wanted for yourself. What would you like to do?",
      options: ["Notice the mixed feeling honestly, without judging it.", "Focus on what this means for them, not you.", "Let both feelings exist at once."] },
    carry: { text: "If someone shares good news today, let yourself feel all of it, then tell them you're glad.", audio: "instep-p2-e4-carry" } },
  { id: "p2e5", part: 2, episode: 5, title: "The quiet one",
    about: "someone close going quiet, and how staying near helps more than questions", notCame: "Nobody went quiet", recap: { audio: "instep-recap-2-5" },
    listen: { text: "Someone close to you has gone quiet. Not angry, just further away than usual, for a few days now. You might want to fix it, or ask a lot of questions, or take it as something you did. Think about your own quiet days. What helped? Usually not questions. Usually someone staying near, and not needing anything from you.", audio: "instep-p2-e5-listen" },
    hold: { pose: "Holding yourself", how: "Cross your arms and rest your hands on your shoulders.",
      alt: { label: "Seated", text: "The same, sitting down." },
      secs: 45, text: "Hold yourself the way you'd want to be held on a quiet day. Not tight. Just there.", audio: "instep-p2-e5-hold" },
    choose: { question: "Someone close to you has gone quiet for a few days. What would you like to do?",
      options: ["Leave space, and stay near.", "Ask once, gently, and accept the answer.", "Notice your own worry before you act on it."] },
    carry: { text: "Today, if someone close is quiet, stay near without needing them to talk.", audio: "instep-p2-e5-carry" } },
  { id: "p2e6", part: 2, episode: 6, title: "Meeting them where they are",
    about: "changing one small thing for someone whose day isn't going to plan", notCame: "The week's still going", recap: { audio: "instep-recap-2-6" },
    listen: { text: "Every time you check in, I change the plan to fit your day. Shorter on a low day. Gentler on a sore one. Nobody asks whether you've earned it. Now think of someone close to you whose day isn't going the way it was planned. What would it look like to change one small thing for them? Not a big gesture. Just meeting them where they actually are.", audio: "instep-p2-e6-listen" },
    hold: { pose: "Standing, then soften", how: "Stand tall, then let your knees soften and your arms hang.",
      alt: { label: "Seated", text: "Sit tall, then let your shoulders drop." },
      secs: 60, text: "Soften, the way the plan softens on a low day. Think of one person who might need that from you this week.", audio: "instep-p2-e6-hold" },
    choose: { question: "Someone close to you is having a day that doesn't fit the plan. What would you like to do?",
      options: ["Change one thing to fit their day, not yours.", "Ask what would help, and take the answer as it comes.", "Notice where they actually are, and leave it there."] },
    carry: { text: "This week, change one small plan to fit someone else's day.", audio: "instep-p2-e6-carry" } },
  { id: "p3e1", part: 3, episode: 1, title: "The queue",
    about: "seeing a stranger at a bad moment, when you saw one second of their day", notCame: "I didn't see that", recap: { audio: "instep-recap-3-1" },
    listen: { text: "Someone in the queue ahead of you snaps at the person serving them. It's uncomfortable to watch. You might feel annoyed at them, or sorry for the person behind the counter, or both. You only saw one second of their day. You don't know what came before it. That doesn't make the snap okay. It just means the second you saw isn't the whole person.", audio: "instep-p3-e1-listen" },
    hold: { pose: "Standing tall", how: "Feet hip-width, arms easy by your sides.",
      alt: { label: "Seated", text: "Sit tall, feet flat, hands on your thighs." },
      secs: 45, text: "Stand as if you're in that queue. Feel your own reaction in your body first. Then let it settle.", audio: "instep-p3-e1-hold" },
    choose: { question: "Someone snaps at a shop worker in the queue ahead of you. What would you like to do?",
      options: ["Notice your own reaction to watching it.", "Wonder what kind of day led to that.", "Let it pass. No read needed."] },
    carry: { text: "If you see someone at their worst today, remember it's one second of their day.", audio: "instep-p3-e1-carry" } },
  { id: "p3e2", part: 3, episode: 2, title: "The car that cut in",
    about: "the quick, hot flash when a car cuts in front of you, and how long you carry it", notCame: "Nobody got in my way", recap: { audio: "instep-recap-3-2" },
    listen: { text: "Someone cuts in ahead of you in traffic, badly. There's a flash, quick and hot. That flash is your body doing its job. What happens next is a choice. You'll never know who was in that car. They might not have seen you. They might be late for something that really matters. Or they might just be careless. You get to decide how long you carry it.", audio: "instep-p3-e2-listen" },
    hold: { pose: "Gentle sway", how: "Stand with feet hip-width and let your weight move slowly from one foot to the other.",
      alt: { label: "Seated", text: "Seated: let your weight move slowly from one side of the chair to the other." },
      secs: 45, text: "Let your weight move slowly from foot to foot. With each shift, let a little of the flash go.", audio: "instep-p3-e2-hold" },
    choose: { question: "Someone cuts in ahead of you in traffic, badly. What would you like to do?",
      options: ["Feel the flash of annoyance, and let it be brief.", "Consider they might not have seen you, or might be having a rough day.", "Let it go entirely. No story attached."] },
    carry: { text: "When someone gets in your way today, see how short you can make the flash.", audio: "instep-p3-e2-carry" } },
  { id: "p3e3", part: 3, episode: 3, title: "The sharp comment",
    about: "a sharp opinion from a stranger, and the experience that may sit behind it", notCame: "Nothing sharp came up", recap: { audio: "instep-recap-3-3" },
    listen: { text: "A stranger online says something you disagree with, sharply. You can feel the reply forming before you've finished reading. Behind every certain opinion there's usually an experience you haven't had. That doesn't make them right. It makes them a person, with reasons. You don't have to agree, and you don't have to answer. Noticing the reasons is enough for today.", audio: "instep-p3-e3-listen" },
    hold: { pose: "Seated, palms up", how: "Sit tall, hands resting on your thighs, palms up.",
      alt: { label: "Standing", text: "Or stand, hands open by your sides." },
      secs: 45, text: "Open hands. Imagine setting the reply down in them, unsent, and leaving it there for now.", audio: "instep-p3-e3-hold" },
    choose: { question: "A stranger online says something you disagree with, sharply. What would you like to do?",
      options: ["Notice your own charge before responding.", "Consider what experience might sit behind their certainty.", "Scroll on. Not every charge needs closing."] },
    carry: { text: "Before you reply to anything sharp today, wait one breath.", audio: "instep-p3-e3-carry" } },
  { id: "p3e4", part: 3, episode: 4, title: "The heavy bag",
    about: "offering help in a way that lets the other person decide", notCame: "Nobody needed a hand", recap: { audio: "instep-recap-3-4" },
    listen: { text: "You see someone struggling to carry something heavy, and you're not sure if they want help. Offering can feel awkward. Not offering can feel worse. Think about the times you were struggling with something. Some offers helped. Some made you feel watched. The difference was usually whether the other person let you decide.", audio: "instep-p3-e4-listen" },
    hold: { pose: "Wall lean", how: "Back against a wall, feet a little forward. Let the wall take your weight.",
      alt: { label: "Seated", text: "Sit back in the chair and let it hold you." },
      secs: 45, text: "Let the wall carry some of you. Notice how it feels to be helped without being asked about it.", audio: "instep-p3-e4-hold" },
    choose: { question: "You see someone struggling to carry something heavy, and you're not sure if they want help. What would you like to do?",
      options: ["Offer, and let them decide.", "Notice the hesitation in yourself before deciding.", "Walk on. Not every moment is yours to enter."] },
    carry: { text: "If you offer help today, make it easy for them to say no.", audio: "instep-p3-e4-carry" } },
  { id: "p3e5", part: 3, episode: 5, title: "The slow walker",
    about: "someone slow in front of you, and the slow days you've had yourself", notCame: "Nobody slowed me down", recap: { audio: "instep-recap-3-5" },
    listen: { text: "You're in a hurry on a narrow pavement, and the person in front of you is walking slowly. There's no way past. It's easy to sigh, or edge closer. But you've had slow days. Days when your legs, or your head, or your energy just wouldn't go any faster. From behind, you'd have looked like someone in the way. You were someone doing their best.", audio: "instep-p3-e5-listen" },
    hold: { pose: "Gentle sway", how: "Stand with feet hip-width and let your weight move slowly from one foot to the other.",
      alt: { label: "Seated", text: "Seated: let your weight move slowly from one side of the chair to the other." },
      secs: 45, text: "Sway slowly, slower than feels natural. Notice that slow isn't the same as stopped.", audio: "instep-p3-e5-hold" },
    choose: { question: "The person in front of you on a narrow pavement is walking slowly, and you're in a hurry. What would you like to do?",
      options: ["Slow down with them for a few steps.", "Wonder what's making today slow for them.", "Pass when there's room, without a sigh."] },
    carry: { text: "If someone is slow in front of you today, give them three steps before you pass.", audio: "instep-p3-e5-carry" } },
  { id: "p3e6", part: 3, episode: 6, title: "The person serving you",
    about: "the whole day the person serving you has had before you arrived", notCame: "Nobody served me", recap: { audio: "instep-recap-3-6" },
    listen: { text: "The person who serves you today has had a whole day before you arrived. You might be their first customer, or their two hundredth. They might be tired, or on their feet for hours, or thinking about someone at home. You can't see any of that. You can see that they're there. That's often enough to change how you say thank you.", audio: "instep-p3-e6-listen" },
    hold: { pose: "Standing level", how: "Standing tall, arms easy, chin level.",
      alt: { label: "Seated", text: "Sit tall and let your shoulders settle." },
      secs: 30, text: "Stand level and steady, the way you'd want someone to stand in front of you at the end of a long shift.", audio: "instep-p3-e6-hold" },
    choose: { question: "The person serving you looks tired, near the end of their shift. What would you like to do?",
      options: ["Say thank you, and mean it.", "Notice they've had a whole day before you.", "Keep it brief. That can be kind too."] },
    carry: { text: "Today, look up when you say thank you to someone serving you.", audio: "instep-p3-e6-carry" } },
  { id: "p4e1", part: 4, episode: 1, title: "The night shift",
    about: "people whose working day happens while you sleep", notCame: "I couldn't think of one", recap: { audio: "instep-recap-4-1" }, recapHeld: true,
    listen: { text: "Right now, someone is starting their working day as yours is ending. They'll sleep while you're out. They'll eat breakfast at a time you'd call dinner. Their tired doesn't look like your tired, and their good day doesn't either. You'll pass people like this without knowing. On their way home in the morning, they'll pass you on your way out.", audio: "instep-p4-e1-listen" },
    hold: { pose: "Standing tall", how: "Feet hip-width, arms easy by your sides.",
      alt: { label: "Seated", text: "Sit tall, feet flat, hands on your thighs." },
      secs: 45, text: "Stand tall. Picture the same street at three in the morning, with someone walking along it on their way to work.", audio: "instep-p4-e1-hold" },
    choose: { question: "Someone near you works through the night. What would you like to do with that?",
      options: ["Notice how much of the world runs while you sleep.", "Wonder what their good day looks like.", "Leave it there. Some lives just run on different hours."] },
    carry: { text: "Today, notice one thing that was done for you while you were asleep.", audio: "instep-p4-e1-carry" } },
  { id: "p4e2", part: 4, episode: 2, title: "Caring for someone",
    about: "people whose day bends, every day, around someone they care for", notCame: "No chance to ask", recap: { audio: "instep-recap-4-2" }, recapHeld: true,
    prev: "Last time: today, notice one thing that was done for you while you were asleep. Did it come up?",
    listen: { text: "Someone near you plans their whole day around another person. A parent, a partner, a child who needs more than most. Their energy goes somewhere before it reaches them. When they're late, or short, or can't come, there's usually someone else's need behind it. You have days when your plan has to bend. Theirs bends every day.", audio: "instep-p4-e2-listen" },
    hold: { pose: "Holding yourself", how: "Cross your arms and rest your hands on your shoulders.",
      alt: { label: "Seated", text: "The same, sitting down." },
      secs: 45, text: "Hold yourself gently. Think of someone whose arms are full of someone else today.", audio: "instep-p4-e2-hold" },
    choose: { question: "Someone you know spends most of their energy caring for someone else. What would you like to do?",
      options: ["Notice how much of their day you never see.", "Offer one small thing, without making it a favour.", "Let them be more than their caring. Ask about them."] },
    carry: { text: "If someone you know cares for another person, ask about them, not just the person they care for.", audio: "instep-p4-e2-carry" } },
  { id: "p4e3", part: 4, episode: 3, title: "A body that tires differently",
    about: "people for whom a low-energy day is most days", notCame: "I didn't see anyone", recap: { audio: "instep-recap-4-3" }, recapHeld: true,
    prev: "Last time: if someone you know cares for another person, ask about them, not just the person they care for. Did it come up?",
    listen: { text: "You've had low-energy days. Days when the stairs looked longer and everything cost more. For some people, that's most days. Their body tires faster, or hurts more, or needs more rest than it shows. From the outside they might look fine. You know, a little, what's under that. Your low days have taught you something you can use.", audio: "instep-p4-e3-listen" },
    hold: { pose: "Seated, palms up", how: "Sit tall, hands resting on your thighs, palms up.",
      alt: { label: "Standing", text: "Or stand, hands open by your sides." },
      secs: 45, text: "Open hands. Remember your lowest-energy day, and how it looked from the outside.", audio: "instep-p4-e3-hold" },
    choose: { question: "Someone near you seems to tire much faster than you. What would you like to do?",
      options: ["Remember your own low days, and how little showed.", "Slow your pace to theirs without saying why.", "Let it be theirs to mention, not yours to ask."] },
    carry: { text: "Today, if someone takes the lift or sits down, assume there's a reason you can't see.", audio: "instep-p4-e3-carry" } },
  { id: "p4e4", part: 4, episode: 4, title: "A different start",
    about: "how everyone was shaped by a start they didn't choose", notCame: "Nobody surprised me", recap: { audio: "instep-recap-4-4" }, recapHeld: true,
    prev: "Last time: today, if someone takes the lift or sits down, assume there's a reason you can't see. Did it come up?",
    listen: { text: "Think about where you grew up. The people around you. What there was, and what there wasn't. Now picture starting somewhere else entirely. A different place, different people, different chances. You'd still be you, but you'd have been shaped by different things. Everyone you meet was shaped like that, by a start they didn't choose.", audio: "instep-p4-e4-listen" },
    hold: { pose: "Standing, then soften", how: "Stand tall, then let your knees soften and your arms hang.",
      alt: { label: "Seated", text: "Sit tall, then let your shoulders drop." },
      secs: 60, text: "Stand tall, then soften. Notice that you're still you, standing differently.", audio: "instep-p4-e4-hold" },
    choose: { question: "Someone you meet had a very different start in life from yours. What would you like to do with that?",
      options: ["Wonder who you'd be if you'd started where they did.", "Notice what your own start gave you without asking.", "Let them be more than where they started."] },
    carry: { text: "Today, when someone surprises you, wonder what shaped them.", audio: "instep-p4-e4-carry" } },
  { id: "p4e5", part: 4, episode: 5, title: "Finding their way",
    about: "being new somewhere, and how much a small kindness means then", notCame: "Nobody looked lost", recap: { audio: "instep-recap-4-5" }, recapHeld: true,
    prev: "Last time: today, when someone surprises you, wonder what shaped them. Did it come up?",
    listen: { text: "Someone near you is new. To the area, the job, the language, the way things are done here. Everything takes them longer, because nothing is automatic yet. You've been new somewhere. You'll remember how tiring it was, working everything out while trying to look as if you already knew. A small kindness meant a lot then.", audio: "instep-p4-e5-listen" },
    hold: { pose: "Gentle sway", how: "Stand with feet hip-width and let your weight move slowly from one foot to the other.",
      alt: { label: "Seated", text: "Seated: let your weight move slowly from one side of the chair to the other." },
      secs: 45, text: "Sway gently. Remember the first week somewhere new, and how much effort went into looking calm.", audio: "instep-p4-e5-hold" },
    choose: { question: "Someone near you is new and still finding their way. What would you like to do?",
      options: ["Explain one thing before they have to ask.", "Remember your own first week somewhere new.", "Be patient, and let it be their pace."] },
    carry: { text: "Today, if someone looks lost, offer one sentence of help.", audio: "instep-p4-e5-carry" } },
  { id: "p4e6", part: 4, episode: 6, title: "Recognition",
    about: "recognising people whose lives look nothing like yours", notCame: "I didn't get the chance", recap: { audio: "instep-recap-4-6" },
    prev: "Last time: today, if someone looks lost, offer one sentence of help. Did it come up?",
    listen: { text: "Over these sessions, I've met you where you were. On low days and good ones, sore days and easy ones. You've done some of that for yourself, and some of it for the people around you. Now think of someone whose life looks completely unlike yours. What would it mean to offer them the same? Not as charity. As recognition. They're working through something real, just as you are.", audio: "instep-p4-e6-listen" },
    hold: { pose: "Standing level", how: "Standing tall, arms easy, chin level.",
      alt: { label: "Seated", text: "Sit tall and let your shoulders settle." },
      secs: 60, text: "Stand level. Think of one person whose life looks nothing like yours, and hold this for them.", audio: "instep-p4-e6-hold" },
    choose: { question: "Someone whose life looks nothing like yours is working through something real. What would you like to do?",
      options: ["Notice that you can't see most of what they carry.", "Treat them the way you've been treated here.", "Keep it simple. Recognise them, and carry on."] },
    carry: { text: "This week, offer someone you don't understand the patience you've been given here.", audio: "instep-p4-e6-carry" } },
  // ── Part 5, The world on your phone (P-42 S1) ──
  { id: "p5e1", part: 5, episode: 1, title: "The feed is built to keep you",
    about: "the feed, and who decides when you leave", notCame: "I didn't think of it", recap: { audio: "instep-recap-5-1" },
    listen: { text: "Think about the last time you picked up your phone for one thing, and put it down twenty minutes later. That isn't a lack of willpower. The apps are built by clever people, paid to keep you there. Feeds learn what holds you, and often that's what makes you anxious, envious or angry. It can take the edge off your sleep, and off how you feel about your own life, set against everyone else's best moments. Deciding when you leave isn't missing out. It's taking your attention back.", audio: "instep-p5-e1-listen" },
    hold: { pose: "Phone down", how: "Seated, phone face down and out of reach, hands resting.",
      alt: { label: "Standing", text: "Standing: phone in another room, arms easy." },
      secs: 45, text: "Notice the pull to pick it up. Let it wait. Notice one thing you can hear, and one thing you can see.", audio: "instep-p5-e1-hold" },
    choose: { question: "You pick up your phone without deciding to. What would you like to do?",
      options: ["Notice it, and carry on.","Ask what I came for, and leave when it's done.","Put it in another room for an hour."] },
    carry: { text: "Once today, before you open an app, decide what you're there for.", audio: "instep-p5-e1-carry" } },
  { id: "p5e2", part: 5, episode: 2, title: "Outrage is a business model",
    about: "anger online, and who gains from it", notCame: "Nothing like that came up", recap: { audio: "instep-recap-5-2" },
    listen: { text: "Some of what reaches you is made to make you angry. Not by accident. Anger keeps people watching, sharing and coming back, and that's worth money. Often the anger points at a whole group of people. They're the problem. They're ruining it. They're not like us. One question cuts through it. Who gains if I believe this? Usually someone selling clicks, a course or a cause. You can care about something deeply without hating a whole group. Most of them are just getting through their day, like you.", audio: "instep-p5-e2-listen" },
    hold: { pose: "Standing steady", how: "Feet planted, arms easy.",
      alt: { label: "Seated", text: "Feet flat, hands on your thighs." },
      secs: 45, text: "Steady feet. Think of something online that made you angry at a whole group. Just notice it. You don't have to decide anything.", audio: "instep-p5-e2-hold" },
    choose: { question: "A post makes you angry at a whole group of people. What would you like to do?",
      options: ["Notice the anger, and scroll on.","Ask who made it, and what they gain.","Think of one person from that group I actually know."] },
    carry: { text: "When a post makes you angry at a whole group, ask who gains if you believe it.", audio: "instep-p5-e2-carry" } },
  { id: "p5e3", part: 5, episode: 3, title: "True, false or made to look true",
    about: "what's real online, and slowing down before you share", notCame: "I didn't see anything shocking", recap: { audio: "instep-recap-5-3" },
    listen: { text: "It's never been easier to make something look real. Photos are changed. Voices are copied. Videos show people saying things they never said. And the shocking things spread fastest, often shared by people we trust, who didn't check either. You don't have to work out the truth of everything. Slowing down is enough. Who posted it first? Is anyone else reporting it? Does it look made to make me angry, or afraid? It's fine not to have an opinion yet. Waiting is often the wisest thing in the room.", audio: "instep-p5-e3-listen" },
    hold: { pose: "Eyes on one spot", how: "Seated, hands resting, eyes resting on one spot.",
      alt: { label: "Standing", text: "Standing: the same." },
      secs: 30, text: "Keep your eyes on that one spot. Notice how much slower everything feels when you're not reacting.", audio: "instep-p5-e3-hold" },
    choose: { question: "Something shocking arrives, shared by someone you trust. What would you like to do?",
      options: ["Wait, and see if it's still true tomorrow.","Look for one other source.","Gently ask them where it came from."] },
    carry: { text: "Before you share something shocking, find one other source.", audio: "instep-p5-e3-carry" } },
  { id: "p5e4", part: 5, episode: 4, title: "Being the adult in the comments",
    about: "how adults speak online, and who's watching", notCame: "I didn't post anything", recap: { audio: "instep-recap-5-4" },
    listen: { text: "Young people learn how to behave online by watching the adults around them. Not what we tell them. What we do. The comment we leave on a stranger's post. The joke in the family group. The way we argue with someone we've never met. It's easy to forget that anyone's watching. Someone usually is. You don't have to be perfect. But you can be the adult who disagrees without sneering, who doesn't pile on, and who says something kind where people can see it.", audio: "instep-p5-e4-listen" },
    hold: { pose: "Standing level", how: "Standing tall, arms easy, chin level.",
      alt: { label: "Seated", text: "Sit tall and let your shoulders settle." },
      secs: 30, text: "Stand like someone a young person might be watching. Not stiff. Just steady.", audio: "instep-p5-e4-hold" },
    choose: { question: "You're about to reply to something that annoyed you. What would you like to do?",
      options: ["Write it, and wait before sending.","Ask if I'd say it to their face.","Leave it, and say nothing."] },
    carry: { text: "Before you post a reply today, ask: would I want a young person to copy this?", audio: "instep-p5-e4-carry" } },
  { id: "p5e5", part: 5, episode: 5, title: "Achievement without an audience",
    about: "achievement, and doing things without an audience", notCame: "I had nothing to post", recap: { audio: "instep-recap-5-5" },
    listen: { text: "Somewhere along the way, doing something started to mean posting it. The run, the meal, the view, the new job. There's nothing wrong with sharing good news. But it can change why we do things. We start working for the likes, and feel flat when they don't come. The best kind of achievement doesn't need an audience. It's the thing you work towards because it matters to you. Getting there slowly, and knowing you gave it everything, is enough. Nobody else has to see it.", audio: "instep-p5-e5-listen" },
    hold: { pose: "Standing planted", how: "Hands on hips, feet planted.",
      alt: { label: "Seated", text: "Sit tall, hands on your thighs." },
      secs: 45, text: "Think of something you're working towards. Picture finishing it, with nobody watching. Notice how that feels.", audio: "instep-p5-e5-hold" },
    choose: { question: "You've done something you're proud of. What would you like to do?",
      options: ["Share it, and enjoy the replies.","Tell one person who'd really care.","Keep it to myself, for now."] },
    carry: { text: "This week, do one thing you're proud of, and don't post it.", audio: "instep-p5-e5-carry" } },
  { id: "p5e6", part: 5, episode: 6, title: "A part to play",
    listen: { text: "Over these sessions, we've looked at how you meet yourself. The people close to you. People you pass. People whose lives look nothing like yours. And now, the world on your phone. Here's what joins them up. When we only ask what's in it for me, we tend to end up on our own, and quietly worse off. When we look after each other, everyone does better. Including us. You've got a part to play, in your family, your street, your work. Small and steady counts.", audio: "instep-p5-e6-listen" },
    hold: { pose: "Open hands", how: "Standing, hands held a little in front of you, palms up.",
      alt: { label: "Seated", text: "The same." },
      secs: 60, text: "Open hands, as if you're offering something. Think of one person who could use a hand this week.", audio: "instep-p5-e6-hold" },
    choose: { question: "Someone near you could use a hand. What would you like to do?",
      options: ["Offer it, and say nothing about it.","Ask what would actually help.","Notice, and keep them in mind."] },
    carry: { text: "This week, do one thing for someone else, and tell no one.", audio: "instep-p5-e6-carry" } },
];

/** "p2e3" -> the episode, or null. */
export function getEpisode(id) {
  return EPISODES.find(e => e.id === id) || null;
}

/** The six episodes of a part, in order. */
export function episodesInPart(part) {
  return EPISODES.filter(e => e.part === part);
}

/** The part's record, or null. */
export function getPart(part) {
  return PARTS.find(p => p.n === part) || null;
}

/** The episode after this one, or null after the last. The order is kept
 *  (Graeme, 18 Aug: "I can access all of it and therefore none of it
 *  lands"): Part 2 opens only after Part 1's six. */
export function nextEpisodeId(id) {
  const i = EPISODES.findIndex(e => e.id === id);
  return i >= 0 && i < EPISODES.length - 1 ? EPISODES[i + 1].id : null;
}

/** Whether this episode ends its part (it is followed by the part's closing line). */
export function endsPart(id) {
  const e = getEpisode(id);
  return !!e && episodesInPart(e.part).at(-1)?.id === e.id;
}

/** Every clip this file can play, in order: for the voice script check
 *  and for fetching a part's audio when it is first opened. */
export function audioIdsForPart(part) {
  const ids = [];
  for (const e of episodesInPart(part)) ids.push(e.listen.audio, e.hold.audio, e.carry.audio);
  const p = getPart(part);
  if (p) ids.push(p.closing.audio);
  return ids;
}
