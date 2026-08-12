/**
 * js/display-prefs.js
 * 12 Aug 2026 v2
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
  textScale:     { min: 0.9, max: 1.6,  step: 0.05 },
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
  Object.values(DISPLAY_KEYS).forEach(_remove);
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
