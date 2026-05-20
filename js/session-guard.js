/**
 * session-guard-patch.js
 *
 * 20 May 2026 v1
 *
 * HOW TO APPLY THIS PATCH
 * =======================
 *
 * STEP 1  Add session-guard.js to your repo
 *   Copy session-guard.js to: js/session-guard.js
 *   (Same level as store.js, router.js, tts.js)
 *
 * STEP 2  Add session-guard.css to your repo
 *   Copy session-guard.css to: css/components/session-guard.css
 *
 * STEP 3  Add the CSS link to index.html
 *   Inside <head>, after your other component CSS links, add:
 *   <link rel="stylesheet" href="css/components/session-guard.css">
 *
 * STEP 4  Patch gym-programme.js (copy-paste replacements below)
 *   See Section A below.
 *
 * STEP 5  Patch all other session files (copy-paste for each)
 *   See Section B below. The same two changes apply to every file.
 *
 * STEP 6  Bump sw.js
 *   Update CACHE_NAME version after all files are saved.
 *
 * =====================================================================
 * SECTION A  gym-programme.js patches
 * =====================================================================
 *
 * CHANGE 1: Add this import at the top of gym-programme.js
 * (after the existing import lines  around line 16)
 *
 *   import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";
 *
 *
 * CHANGE 2: Replace the entire onMount() function
 * (currently lines 872-877  the last 6 lines of the file)
 * with this:
 */

//  GYM-PROGRAMME.JS  replacement onMount() 

export function onMount() {
  postSessionState = null;
  intelAnswers     = {};
  if (activeTimerId) clearInterval(activeTimerId);

  // Guard against accidental back gesture during active session
  mountSessionGuard({
    isActive: () => !postSessionState,
    label:    "gym session",
    onExit:   () => {
      // Save partial progress  mark as partial in activityLog
      const log     = store.get("activityLog") || [];
      const elapsed = Math.round((Date.now() - (_sessionStartTime || Date.now())) / 60000);
      log.push({
        type:        "gym-programme",
        status:      "partial",
        session:     activeSessionId,
        durationMins: elapsed || null,
        completedAt: new Date().toISOString(),
        source:      "gym-programme"
      });
      store.set("activityLog", log);
      if (activeTimerId) clearInterval(activeTimerId);
      dismountSessionGuard();
      router.navigate("reflect");
    }
  });

  wireEvents();
}

/**
 * NOTE: also add this line near the top of gym-programme.js,
 * alongside the other module-level let declarations (around line 21):
 *
 *   let _sessionStartTime = Date.now();
 *
 * And reset it at the start of wireEvents() by adding this line
 * at the top of the wireEvents() function body:
 *
 *   _sessionStartTime = Date.now();
 *
 * This gives the partial log entry an accurate duration.
 * If you prefer not to add this now, the onExit above already
 * handles the null case gracefully (durationMins will be null).
 */

// =====================================================================
// SECTION B  patch for all other 6 session files
// =====================================================================
//
// Apply these TWO changes to each of:
//   core-session.js
//   yoga-session.js
//   walk-session.js
//   running-session.js
//   swim-session.js
//   cycle-session.js
//
// CHANGE 1: Add this import at the top of each file
// (after the existing import lines):
//
//   import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";
//
//
// CHANGE 2: Add these lines at the START of the onMount() function body,
// before any existing code in onMount():
//
//   mountSessionGuard({
//     isActive: () => true,   // these sessions have no post-session state yet
//     label:    "session",    // replace with e.g. "yoga session", "run", "walk"
//     onExit:   () => {
//       dismountSessionGuard();
//       router.navigate("reflect");
//     }
//   });
//
//
// CHANGE 3 (if the file has a cleanup() function):
// Add this line at the start of cleanup():
//
//   dismountSessionGuard();
//
//
//  Per-file label values 
//
//   core-session.js      label: "core session"
//   yoga-session.js      label: "yoga session"
//   walk-session.js      label: "walk"
//   running-session.js   label: "run"
//   swim-session.js      label: "swim"
//   cycle-session.js     label: "cycle session"
//
// 
//
// EXAMPLE  what the patched onMount() looks like in yoga-session.js:
//
//   export function onMount() {
//     mountSessionGuard({
//       isActive: () => true,
//       label:    "yoga session",
//       onExit:   () => {
//         dismountSessionGuard();
//         router.navigate("reflect");
//       }
//     });
//     // ... rest of existing onMount code unchanged
//   }
//
//
