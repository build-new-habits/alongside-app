/**
 * js/data/guide-me.js
 * 06 Nov 2026 v1
 *
 * P-28 EMPATHY-THREAD, S2 CONTENT DATA. Guide me's first set: on a walk,
 * an easy run or an indoor ride, three ways to go (Graeme, 05 Nov: "All of
 * the above"): Just go; Guide me, one continuous recording with its
 * moments and their times told before you start; or Take three with you,
 * three things to notice, read before you set off, with no audio.
 *
 * WORDING. Every line is copied word for word from the approved wording,
 * BNH-Files Product/alongside_content_in-step-guide-me_05nov2026_v5.md:
 * A1 the mindful walk, A2 the easy run, A3 the indoor ride (approved 05
 * Nov, 19:47) and A7 a walk in any weather (approved 05 Nov, 19:52: "any-
 * weather walk - yep"). A7 is where In Step's old Environment scenes went
 * (the weather turning, the season changing your energy); the scenes as
 * they were are archived in BNH-Files, Archive/P-28 In Step Environment/.
 * tools/verify-p28-content.mjs reads the wording and fails on any
 * difference.
 *
 * TIMES are seconds from the start of the recording. The guided player
 * (S4) follows the file's currentTime and shows each moment's words when
 * its time comes; the words are always on screen as well as heard.
 *
 * AUDIO. One joined file per session, audio/<track>.mp3 (guide-walk.mp3
 * and so on), made from the clips named in each moment's `audio` (the
 * voice script, Product/alongside_voice_script_05nov2026_v1.md) with the
 * quiet gaps between. The joined file's name is the track alone, so it
 * never collides with the last clip (guide-walk-20.mp3 is the 20:00
 * line). Until the file exists, Guide me shows the words at their times
 * and nothing speaks.
 *
 * NEVER ON A ROAD. Nothing talks to somebody on a road ride: the ride is
 * Guide me indoors only, and a road ride gets Take three with you and
 * its roadLine. Guide me never drops into music uninvited; it is chosen
 * each time.
 *
 * Both tiers (Graeme, 05 Nov). Nothing here reads the store.
 */

/** The three ways, as activityLog[].guideMe records them (Schema v1.123). */
export const WAYS = ["just", "guide", "three"];

export const GUIDE_SESSIONS = {
  walk: {
    id: "walk", title: "Mindful walk", doors: ["walk"], mins: 20,
    indoorsOnly: false,
    before: "20 minutes. I'll speak five times, briefly, and stay quiet in between: at the start, then at 1, 6, 12 and 18 minutes. Put your headphones in. Your music will stop while I'm with you. Pause or stop any time from your lock screen.",
    track: "guide-walk",
    moments: [
      { at:    0, text: "A walk, at whatever pace your legs choose today. I'll be quiet most of the way. When I speak, there's nothing to do except notice.", audio: "guide-walk-00" },
      { at:   60, text: "Start with your feet. Not the pace of them. Just the sound they make, and your breathing underneath it. Two rhythms, not quite matching.", audio: "guide-walk-01" },
      { at:  360, text: "Now look up. See how far you can hear. A bird, the wind, a road somewhere. Something further off than you first noticed.", audio: "guide-walk-06" },
      { at:  720, text: "Find something growing. A tree, a hedge, the weeds in a wall. It's been out here all day, through whatever the weather did. Walk past it a little slower.", audio: "guide-walk-12" },
      { at: 1080, text: "Somebody near you is on their way home. You'll never know what kind of day they've had. You can wish them a good evening in your head, and keep going.", audio: "guide-walk-18" },
      { at: 1200, text: "That's the walk. I'll go quiet now. Take your time getting back.", audio: "guide-walk-20" },
    ],
    three: ["The sound of your own feet, before anything else.", "The furthest thing you can hear.", "One person on their way somewhere, and the day they might have had."],
  },
  weather: {
    id: "weather", title: "A walk in any weather", doors: ["walk"], mins: 20,
    indoorsOnly: false,
    before: "20 minutes, any weather. I'll speak at the start, then at 2, 8 and 15 minutes, and at the end. Headphones in; your music stops while I'm with you.",
    track: "guide-weather",
    moments: [
      { at:    0, text: "A walk in whatever the weather is doing. You didn't choose it. Neither did anyone else out here. Let's see what it gives us.", audio: "guide-weather-00" },
      { at:  120, text: "Notice the weather on your skin. Rain, wind, sun, cold. Your body is already adjusting, without asking you.", audio: "guide-weather-02" },
      { at:  480, text: "Maybe this isn't the walk you'd planned. The weather changed, or the day did. Notice how fast you've adjusted. That's a skill, and you use it more than you think.", audio: "guide-weather-08" },
      { at:  900, text: "The season is changing your energy, probably without your permission. That's information, not a problem. Everyone you pass is walking through the same season.", audio: "guide-weather-15" },
      { at: 1200, text: "That's the walk. Whatever the weather did, you went out in it. I'll go quiet now.", audio: "guide-weather-20" },
    ],
    three: ["What the weather feels like on your skin.", "One thing you changed today because of the weather.", "Everyone out here is walking through the same season."],
  },
  run: {
    id: "run", title: "Mindful easy run", doors: ["run"], mins: 25,
    indoorsOnly: false,
    before: "25 minutes, easy. I'll speak at the start, then at 3, 12 and 21 minutes, and at the end. Easy means you could talk in sentences. Headphones in; your music stops while I'm with you.",
    track: "guide-run",
    moments: [
      { at:    0, text: "An easy run today: easy enough to talk in sentences. If you can't, slow down. There's no time to beat.", audio: "guide-run-00" },
      { at:  180, text: "Notice your breathing settle into a rhythm. You don't have to change it. Just listen to it for a few strides.", audio: "guide-run-03" },
      { at:  720, text: "Look around you. What's the air doing to your skin? Cold on your face, warm on your arms, moving or still.", audio: "guide-run-12" },
      { at: 1260, text: "Everyone you've passed today came from somewhere this morning. So did you. Keep it easy, all the way home.", audio: "guide-run-21" },
      { at: 1500, text: "That's your run. Walk for a minute if you can. I'll go quiet now.", audio: "guide-run-25" },
    ],
    three: ["Easy enough to talk in sentences.", "What the air feels like on your skin.", "Everyone you pass came from somewhere this morning."],
  },
  ride: {
    id: "ride", title: "Mindful indoor ride", doors: ["ride"], mins: 20,
    indoorsOnly: true,
    before: "20 minutes on a turbo or a bike at home. I'll speak at the start, then at 2, 10 and 17 minutes, and at the end.",
    track: "guide-ride",
    moments: [
      { at:    0, text: "An easy spin. Nothing to chase. Find a pace you could keep up for a long time.", audio: "guide-ride-00" },
      { at:  120, text: "Notice where you're touching the bike. Hands, seat, feet. Let your shoulders drop away from your ears.", audio: "guide-ride-02" },
      { at:  600, text: "Look at the furthest point in the room, or out of a window. Let your eyes rest there while your legs keep turning.", audio: "guide-ride-10" },
      { at: 1020, text: "Somewhere, someone is cycling home on a road you'll never see. Wish them a clear way. Then ease your spin down to the end.", audio: "guide-ride-17" },
      { at: 1200, text: "That's the ride. Keep turning gently for a minute if you'd like. I'll go quiet now.", audio: "guide-ride-20" },
    ],
    three: ["Shoulders down, hands soft on the bars.", "Look up and far at every junction.", "Everyone on the road is trying to get home."],
    roadLine: "On the road, nothing talks to you. Your attention belongs to the traffic.",
  },
};

/** The sessions a door offers, in order (the walk door offers both walks). */
export function sessionsForDoor(door) {
  return Object.values(GUIDE_SESSIONS).filter(s => s.doors.includes(door));
}

/** Whether Guide me (the voice) may be offered: never on a road ride. */
export function canGuide(session, { road = false } = {}) {
  if (!session) return false;
  return !(session.indoorsOnly && road);
}

/** audio/<track>.mp3 for the session's joined recording. */
export function trackFile(session) {
  return session ? `audio/${session.track}.mp3` : null;
}

/** The moment whose words should be on screen at `seconds`, or null before the first. */
export function momentAt(session, seconds) {
  if (!session) return null;
  let cur = null;
  for (const m of session.moments) if (m.at <= seconds) cur = m;
  return cur;
}
