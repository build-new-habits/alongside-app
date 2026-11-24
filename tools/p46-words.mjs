/**
 * tools/p46-words.mjs
 * 24 Nov 2026 v1
 *
 * P-46 S6 WORDS (Graeme, 24 Nov: "no one needs a lecture or a sermon";
 * spec §7, about 15 words before the first button). The approved word
 * changes on screens Free shares with older builds, each as it was and as
 * it is. The byte-for-byte Free gates (verify-one-look TEST 4,
 * verify-path-outside TEST 4) make these changes to the OLD drawing only,
 * as they already do for v7's one rename, so any other change is still red.
 * Not a gate (no "verify-" in its name).
 */
export const P46_WORDS = [
  [/\s*<p class="text-secondary">You did the work\. Let's capture it\.<\/p>/, ""],
  ["What did you do? I will note it and factor it into what I suggest next.", "What did you do? I’ll use it in what I suggest next."],
  ["Choose a breathing practice. All of them work — the best one is the one you'll actually do.", "Choose one. The best one is the one you'll do."],
  ["What feels right today? Each of these works differently.\n           Take a moment to notice what you actually need.", "What feels right today?"],
  ["Let me know which session you are doing today and I will walk you through it.", "Which session today?"],
  ["The plain-English version is below so you can see what you agreed to\n          without reading a legal document. The full and canonical Privacy Policy\n          and Terms of Service live on our website:", "Below, in plain English. The full versions are on our website:"],
  ["Short moments after a session about the people around you. They come one at a time, in order, and anything you've done is here whenever you like.", "Short moments after a session, about the people around you."],
  ["Keep your own exercises here — anything you want to come back to. I'll keep them separate from your other sessions, and if something's sore on the day I'll tell you which ones load it.", "Yours, kept as you wrote them."],
  ["<p class=\"text-secondary\">\n        Add exercises you’ve been given, or ones you like to do. They’ll be here, as you wrote them.\n      </p>", "<p class=\"text-secondary\">Ones you’ve been given, or like to do.</p>"],
  ["Whenever you want a few minutes to settle, this is here.", "Any time you like."],
  ["You checked in today. Three minutes of box breathing is here if it helps.", "Three minutes of box breathing, if it helps."],
  ["You said today's been heavy going. Three minutes of slow breathing might help settle it.", "You said today's been heavy going. Slow breathing might help."],
  ["You said your energy is low today. Slow, even breathing asks nothing of you.", "You said your energy is low. This asks nothing of you."],
  ["You said you're feeling good today. A few even breaths is a way to notice it.", "You said you're feeling good. A few breaths to notice it."],
  ["Tell me what you want to work on today. I'll build something around your equipment and how you're feeling.", "What do you want to work on today?"],
  ["Whole practices, start to finish. Nothing here is part of a session —\n        each one is the thing itself.", "Whole practices, start to finish."],
  ["That class is no longer available. Nothing has been lost — pick another whenever you want to.", "That class is no longer here. Pick another whenever you like."],
  ["You are not following a chapter at the moment. Each session gets\n        chosen for where you are on the day.", "No chapter at the moment: each session fits the day."],
  ["Using a physio’s or trainer’s changes from a link is part of the Plan.", "These links are part of the Plan."],
];

/** The old drawing with the approved S6 words in place. */
export const withP46Words = html => P46_WORDS.reduce((h, [was, now]) => h.replace(was, now), html);
