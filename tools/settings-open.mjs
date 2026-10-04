/**
 * tools/settings-open.mjs
 * 04 Oct 2026 v1
 *
 * LOOK-1 SETTINGS-PAGES. Settings is an index; a row lives on its
 * section's own page. A check that used to find a row on the one page
 * (W4-23 kept every row in the page, inside closed details) now opens the
 * section that holds it, the way a person does: back to the index if
 * needed, then each section in turn until the row is there.
 *
 * Returns the element, or null when no section holds it (so a check that
 * expects a row absent still sees it absent). Clicks are synchronous:
 * Settings re-renders inside the click handler.
 */
const SECTIONS = ["you", "body", "sessions", "display", "data", "plan", "about"];

function tap(el) {
  el.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent("click", { bubbles: true }));
}

/** Back to the index from a section page or a row's screen. */
export function settingsIndex(root) {
  for (let i = 0; i < 3 && !root.querySelector("[data-section-open]"); i++) {
    const back = root.querySelector("#settings-back-btn");
    if (!back) break;
    tap(back);
  }
}

/** The element matching `sel`, opening the section that holds it. */
export function settingsFind(root, sel) {
  const here = root.querySelector(sel);
  if (here) return here;
  settingsIndex(root);
  for (const id of SECTIONS) {
    const btn = root.querySelector(`[data-section-open="${id}"]`);
    if (!btn) continue;
    tap(btn);
    const hit = root.querySelector(sel);
    if (hit) return hit;
    const back = root.querySelector("#settings-back-btn");
    if (back) tap(back);
  }
  return null;
}

/** Open a section's page by id. */
export function settingsSection(root, id) {
  settingsIndex(root);
  const btn = root.querySelector(`[data-section-open="${id}"]`);
  if (btn) tap(btn);
  return !!btn;
}
