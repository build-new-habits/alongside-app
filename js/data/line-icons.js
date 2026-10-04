/**
 * data/line-icons.js
 * 04 Oct 2026 v1
 *
 * LOOK-4 (Graeme approved the mock-up, 04 Oct: "Yes yes yes. Love it").
 * One set of line icons for every screen: Home, the finish screen,
 * Wellbeing and the Library (Settings and Progress draw the same shapes).
 * They replace emoji, which some screen readers announce by name and
 * which render differently on every phone.
 *
 * Every icon is decorative: it always sits beside words that say the same
 * thing, so it is aria-hidden and never the only carrier (WCAG 1.1.1,
 * 1.4.1). Drawn in currentColor, so the kind colour comes from CSS.
 */

const PATHS = {
  arc:      '<path d="M3 17l5-5 4 4 8-8"/><path d="M15 8h5v5"/>',
  star:     '<path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/>',
  choose:   '<path d="M4 6h16M4 12h10M4 18h6"/>',
  pencil:   '<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13 7l4 4"/>',
  strength: '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  mobility: '<circle cx="12" cy="5" r="2"/><path d="M4 10c3 1 5 1 8 1s5 0 8-1M12 11v5l-4 5M12 16l4 5"/>',
  yoga:     '<circle cx="12" cy="5" r="2"/><path d="M12 8v6M6 21l6-7 6 7M5 11h14"/>',
  run:      '<circle cx="14" cy="4.5" r="2"/><path d="M8 21l3-6 3 2v4M6 12l3-3 4 1 3 3 3 1"/>',
  walk:     '<circle cx="12" cy="4.5" r="2"/><path d="M10 21l2-7 2 2v5M8 11l3-3 3 2 2 3"/>',
  swim:     '<path d="M2 18c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 13l3-5 4 2 3-3"/>',
  cycle:    '<circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l4-8h5l3 8M10 9l2 8"/>',
  classes:  '<circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M2 20c1-3.5 3.5-5 6-5s5 1.5 6 5M14 15.5c.7-.3 1.3-.5 2-.5 2.5 0 5 1.5 6 5"/>',
  mind:     '<path d="M5 19c8 0 14-6 14-14C11 5 5 11 5 19zM5 19l7-7"/>',
  breath:   '<path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
  instep:   '<path d="M7 4l-3 4 3 4M17 12l3 4-3 4M4 8h11a4 4 0 0 1 0 8H9"/>',
  list:     '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  library:  '<path d="M5 4h4v16H5zM10 4h4v16h-4zM15.5 4.5l3.5-1 3 15.5-3.5 1z"/>',
  home:     '<path d="M4 11l8-7 8 7v9H4z"/>',
  tick:     '<path d="M5 12l5 5 9-10"/>',
  plus:     '<path d="M12 5v14M5 12h14"/>',
  chat:     '<path d="M4 5h16v11H8l-4 4z"/>',
  rest:     '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  chevron:  '<path d="M9 6l6 6-6 6"/>',
};

/** An icon as inline SVG, decorative. Unknown names draw nothing. */
export function lineIcon(name, size = 22) {
  const p = PATHS[name];
  if (!p) return '';
  return `<svg class="line-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${p}</svg>`;
}

export const LINE_ICON_NAMES = Object.freeze(Object.keys(PATHS));
