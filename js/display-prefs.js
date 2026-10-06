/**
 * js/display-prefs.js
 * 06 Oct 2026 v7
 *
 * v7 - D-12 PROGRESS-FIT. Text size goes up to 2 (was 1.6). The setting
 *   was applied twice until reset.css v1, so 1.6 drew text at 2.56x; now
 *   it means what it says, and 2 keeps twice the size within reach.
 *
 * 03 Oct 2026 v6
 *
 * v6 - W5-21 SMALL-5. Reset display to defaults keeps Vibration as it was
 *   (it turned it back on, from a screen with no Vibration switch).
 *
 * 02 Oct 2026 v5
 *
 * v5 - W4-22. New key vibration (alongside-vibration, default on). Off stops
 *   every vibration in the app: navigator.vibrate is wrapped, so every view
 *   that calls it is covered.
 *
 * 28 Sep 2026 v4
 * v4 - F6, REDUCE-MOTION-ROW (Graeme, 28 Sep: add it). New key
 *   `reduceMotion`: "off" follows the device (as the app always has),
 *   "on" reduces motion here too. On, every stylesheet rule written for
 *   prefers-reduced-motion is applied (copied from the sheets, so the two
 *   cannot drift), the root gets .reduce-motion, and prefersReducedMotion()
 *   -- now the one reader for the JS views -- answers true.
 *
 * v3 - CARD-1. New key `fullInstructions`. When "on", the exercise card
 *   renders every section expanded regardless of phase or familiarity.
 *
 *   It lives HERE and not in store.js for the same three reasons already
 *   written below: it is device-level (a phone's density has no business
 *   syncing to a laptop), and above all it must survive a store reset --
 *   somebody who needs full instructions needs them more at the moment
 *   everything else resets, not less.
 *
 *   Unlike the other keys it is not applied pre-paint, because it changes
 *   nothing about the shell. It is still duplicated into index.html's K
 *   and D blocks because verify-disp1.mjs compares those maps whole, and
 *   a key present in one copy and not the other is exactly the silent
 *   drift that gate exists to catch.
 *
 * v2 - SCHEME-1. Colour scheme added: dark (default), light, high
 *   contrast. Dark is the product; the other two are adaptations
 *   somebody has chosen. See variables.css v4 for the palettes and the
 *   measured ratios.
 *
 * DISP-1. Display preferences: text size, line spacing, letter spacing,
 * underline links, enhanced focus.
 *
 * WHY THESE LIVE OUTSIDE store.js, deliberately, against the
 * single-source-of-truth instinct applied everywhere else today:
 *
 *   1. They must be readable BEFORE first paint, by the inline script in
 *      index.html, before any ES module has loaded. store.js is a module
 *      and cannot run that early. Without this, someone who has scaled
 *      text up gets a visible jolt on every single launch.
 *   2. They are device-level, not person-level. When Supabase lands, a
 *      phone-sized text scale has no business syncing to a laptop.
 *   3. They should survive a store reset. Somebody who needs larger text
 *      needs it more, not less, at the moment everything else resets.
 *
 * Different lifecycle, different home. That is the distinction, and it is
 * the reason -- not the convenience.
 *
 * CONTRACT WITH index.html: the pre-paint script duplicates KEYS and
 * DEFAULTS because it cannot import them. tools/verify-disp1.mjs asserts
 * the two copies match and exits 1 if they drift. Do not change one
 * without the other.
 *
 * PRINCIPLES:
 *   P2 -- this is the helper layer, not the coach. No coach voice here.
 *   P3 -- never offered on a timer or in onboarding. Someone eleven
 *         questions into setup does not yet know they want wider letter
 *         spacing. It sits in Settings and waits to be wanted.
 */

export const DISPLAY_KEYS = {
  scheme:        "alongside-scheme",
  textScale:     "alongside-text-scale",
  leadingScale:  "alongside-leading-scale",
  letterSpacing: "alongside-letter-spacing",
  underline:     "alongside-underline-links",
  focus:         "alongside-enhanced-focus",
  fullInstructions: "alongside-full-instructions",
  reduceMotion:  "alongside-reduce-motion",
  vibration:     "alongside-vibration",
};

export const DISPLAY_DEFAULTS = {
  // "dark" is the product, not merely the first option. Graeme, 12 Aug:
  // "I must insist on dark mode default with the potential for
  // adaptations by the user." Anything else here is an adaptation
  // somebody has chosen.
  scheme:        "dark",
  textScale:     "1",
  leadingScale:  "1",
  letterSpacing: "0",
  underline:     "off",
  focus:         "off",
  // "off" means the card sizes itself. Not a reduced experience -- the
  // full text is one tap away at every level, and nothing safety-bearing
  // is ever collapsed. See alongside_blueprint_CARD-1_29aug2026_v1.md.
  fullInstructions: "off",
  // F6. "off" means follow the device's own setting, which the app has
  // always honoured. "on" reduces motion here whatever the device says.
  reduceMotion:  "off",
  // W4-22. "on" vibrates as sessions always have; "off" stops every
  // vibration in the app (navigator.vibrate is wrapped, so every caller).
  vibration:     "on",
};

// Ranges are deliberately conservative at the bottom end: nothing here
// should let somebody make the app unreadable and then be unable to find
// the control that fixes it. 0.9 is a nudge down, not a shrink.
export const SCHEMES = [
  { value: "dark",          label: "Dark",          sub: "The default. Light text on deep blue." },
  { value: "light",         label: "Light",         sub: "Dark text on white. Easier for some eyes, particularly with astigmatism." },
  { value: "high-contrast", label: "High contrast", sub: "Maximum separation between text and background." },
];

export const SCHEME_CLASS = {
  "dark":          "",                        // no class -- :root defaults ARE dark
  "light":         "scheme-light",
  "high-contrast": "scheme-high-contrast",
};

export const DISPLAY_RANGES = {
  textScale:     { min: 0.9, max: 2,    step: 0.05 },
  leadingScale:  { min: 0.9, max: 1.35, step: 0.05 },
  letterSpacing: { min: 0,   max: 0.12, step: 0.01 },
};

function _get(key, fallback) {
  try {
    const v = window.localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch { return fallback; }
}

function _set(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* session only */ }
}

function _remove(key) {
  try { window.localStorage.removeItem(key); } catch { /* no-op */ }
}

/** Clamp a stored value back into range. A hand-edited localStorage entry
 *  should not be able to render the app unusable. */
function _clamp(name, value) {
  const r = DISPLAY_RANGES[name];
  const n = parseFloat(value);
  if (!r || !Number.isFinite(n)) return parseFloat(DISPLAY_DEFAULTS[name]);
  return Math.min(r.max, Math.max(r.min, n));
}

export function getDisplayPref(name) {
  return _get(DISPLAY_KEYS[name], DISPLAY_DEFAULTS[name]);
}

export function setDisplayPref(name, value) {
  _set(DISPLAY_KEYS[name], String(value));
  applyDisplayPrefs();
}

export function resetDisplayPrefs() {
  // W5-21. Vibration is kept: it is set in Settings › Display beside the
  // others, not on the screen with this reset, and turning buzzing back on
  // unasked is the one change here that can be felt.
  Object.entries(DISPLAY_KEYS).forEach(([name, key]) => { if (name !== "vibration") _remove(key); });
  applyDisplayPrefs();
}

/**
 * Applies every stored preference to :root. Idempotent -- safe to call on
 * load, on change, and after a reset.
 */
export function applyDisplayPrefs() {
  const root = document.documentElement;

  root.style.setProperty("--user-text-scale",    String(_clamp("textScale",    getDisplayPref("textScale"))));
  root.style.setProperty("--user-leading-scale", String(_clamp("leadingScale", getDisplayPref("leadingScale"))));
  root.style.setProperty("--user-letter-spacing", _clamp("letterSpacing", getDisplayPref("letterSpacing")) + "em");

  // Scheme. Every class removed before one is added, so switching twice
  // cannot leave two schemes fighting -- the later declaration in
  // variables.css would silently win and the result would depend on file
  // order rather than on what the person chose.
  Object.values(SCHEME_CLASS).forEach(c => { if (c) root.classList.remove(c); });
  const schemeClass = SCHEME_CLASS[getDisplayPref("scheme")];
  if (schemeClass) root.classList.add(schemeClass);

  root.classList.toggle("underline-links", getDisplayPref("underline") === "on");
  root.classList.toggle("enhanced-focus",  getDisplayPref("focus")     === "on");
  _applyReduceMotion(getDisplayPref("reduceMotion") === "on");
  _applyVibration(getDisplayPref("vibration") !== "off");
}

// W4-22. One switch for every vibration: the views call navigator.vibrate
// directly (ten of them), so the setting wraps it rather than asking each.
let _realVibrate = null;
function _applyVibration(on) {
  const nav = globalThis.navigator;
  if (!nav || typeof nav.vibrate !== "function") return;
  if (!_realVibrate) _realVibrate = nav.vibrate;
  const wrapped = function (pattern) {
    return getDisplayPref("vibration") === "off" ? false : _realVibrate.call(nav, pattern);
  };
  if (nav.vibrate !== wrapped) {
    try { Object.defineProperty(nav, "vibrate", { value: wrapped, configurable: true, writable: true }); }
    catch { /* the browser will not let it be wrapped: vibration stays as the device has it */ }
  }
  void on;
}

/**
 * F6, REDUCE-MOTION-ROW. True when motion should be reduced: the switch
 * in Settings is on, OR the device asks for it (as the app always did).
 * The one reader for every view that times or animates in JS.
 */
export function prefersReducedMotion() {
  if (getDisplayPref("reduceMotion") === "on") return true;
  try {
    return typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch { return false; }
}

/**
 * The switch behaves EXACTLY as the device setting does: every rule the
 * stylesheets already hold inside @media (prefers-reduced-motion: reduce)
 * is copied, unwrapped, into one <style>. Read from the sheets rather
 * than written a second time, so the two can never drift -- a new
 * reduced-motion rule anywhere is covered the day it is written.
 */
export const REDUCE_MOTION_STYLE_ID = "reduce-motion-rules";
function _reducedMotionCss() {
  const out = [];
  const walk = rules => {
    for (const r of rules || []) {
      // main.css pulls every component sheet in with @import.
      if (r.styleSheet) { try { walk(r.styleSheet.cssRules); } catch { /* not ours */ } continue; }
      const media = r.media?.mediaText || r.conditionText || "";
      if (r.cssRules && /prefers-reduced-motion\s*:\s*reduce/i.test(media)) {
        for (const inner of r.cssRules) out.push(inner.cssText);
      } else if (r.cssRules && !/prefers-reduced-motion/i.test(media)) {
        walk(r.cssRules);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets || [])) {
    if (sheet.ownerNode?.id === REDUCE_MOTION_STYLE_ID) continue;
    try { walk(sheet.cssRules); } catch { /* a cross-origin sheet: not ours */ }
  }
  return out.join("\n");
}
function _applyReduceMotion(on) {
  const root = document.documentElement;
  root.classList.toggle("reduce-motion", on);
  const existing = document.getElementById(REDUCE_MOTION_STYLE_ID);
  if (!on) { existing?.remove(); return; }
  const css = _reducedMotionCss();
  const el = existing || Object.assign(document.createElement("style"), { id: REDUCE_MOTION_STYLE_ID });
  el.textContent = css;
  if (!existing) document.head.appendChild(el);
}

/**
 * Human-readable value for the live region and the visible readout.
 * Percentages rather than pixels: the app has eight text sizes, not one,
 * so "17px" would be a number that matches nothing on screen.
 */
export function formatDisplayValue(name, value) {
  const n = parseFloat(value);
  if (name === "letterSpacing") return n.toFixed(2) + "em";
  return Math.round(n * 100) + "%";
}
