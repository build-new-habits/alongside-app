/**
 * js/data/warm-views.js
 * 12 Oct 2026 v1
 *
 * A-8 SPEED (Stage AWARD). Measured on v656 at a 6x slowed CPU: a screen
 * opened a second time takes 26-138 ms, but the FIRST open of Today's plan
 * took up to 342 ms and Progress up to 313 ms, because each view's code is
 * fetched from the phone's cache and parsed on the first tap.
 *
 * Once Home has drawn and the phone is idle, this loads the code for the
 * screens people open next from Home, so their first open is a warm one.
 * It only loads modules (no screen is mounted, nothing is stored, nothing
 * leaves the phone: every file is already in the app's offline copy), and
 * a failure is ignored: it is a head start, never a dependency.
 */

/** The screens most often opened from Home, by their files (router paths). */
export const WARM_VIEWS = [
  "./views/coach-proposal.js",
  "./views/progress.js",
  "./views/library.js",
  "./views/settings.js",
];

/**
 * Load WARM_VIEWS when the phone is idle, only from Home.
 * @param {object} o
 * @param {string} o.currentView   the screen the app opened on
 * @param {(path: string) => Promise<unknown>} o.load   import(), relative to js/
 * @param {(cb: () => void) => void} [o.idle]   defaults to requestIdleCallback
 * @returns {boolean} whether anything was scheduled
 */
export function warmViews({ currentView, load, idle }) {
  if (currentView !== "today" || typeof load !== "function") return false;
  const later = idle || (cb => (typeof requestIdleCallback === "function"
    ? requestIdleCallback(cb, { timeout: 3000 })
    : setTimeout(cb, 1500)));
  later(() => {
    // One at a time, so the warming never competes with a tap for long.
    WARM_VIEWS.reduce((p, path) => p.then(() => load(path)).catch(() => {}), Promise.resolve());
  });
  return true;
}
