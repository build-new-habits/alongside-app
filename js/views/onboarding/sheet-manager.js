/**
 * js/views/onboarding/sheet-manager.js
 * 29 Jun 2026 v3
 *
 * v3 — Real root cause of the equipment step (S4/S5) found and fixed,
 *   after equipment.js source was finally read directly rather than
 *   assumed. The bug was NOT a missing/wrong navigate() intercept —
 *   equipment.js has its OWN internal multi-screen state (facility list
 *   <-> equipment sub-screen) and its own rerender() function, hardcoded
 *   to write to #main-content. Mounting it inside the sheet worked for
 *   the FIRST render only; the moment the user tapped a facility card,
 *   rerender() escaped the sheet and overwrote the real app underneath
 *   it — explaining both the unresponsive chips (handlers wired to a
 *   detached/wrong DOM node) and the wrong-screen landing (the Finish
 *   button's hardcoded router.navigate('onboarding/frequency') call,
 *   pointing at a route OB-THREAD retired, was always going to fire
 *   regardless of sheet context). Two new optional hooks added:
 *   mountContainer(el) and setSheetDoneCallback(fn) — called on any
 *   loaded module that exports them, before render() runs. equipment.js
 *   v4 implements both. Views that don't export these (e.g.
 *   conditions.js) are unaffected — every new call is gated behind a
 *   typeof check.
 *
 * v2 — Critical fix: the sheet manager assumed every onboarding view used
 *   the new { mount(container) } factory pattern. conditions.js (and
 *   possibly equipment.js, unconfirmed) actually uses the OLD pattern —
 *   export function render() returning raw HTML, with onclick handlers
 *   calling global window functions and the bare global router.navigate()
 *   directly. This was never verified against the real file before v1
 *   shipped, and caused a hard crash: "view.mount is not a function" the
 *   moment a user reached the conditions step. openSheet() now detects
 *   which pattern a module uses and handles both — see the OLD PATTERN /
 *   NEW PATTERN branches below for the full explanation of each approach.
 *
 * v1 — Sheet engine for the OB-THREAD conversational onboarding.
 *
 * Mounts any existing onboarding view (goals.js, conditions.js,
 * equipment.js, plan-select.js) inside the 95% bottom sheet without
 * modifying those view files. Intercepts their internal router.navigate()
 * calls and replaces them with a done callback so thread.js stays in
 * control of the conversation flow.
 *
 * Usage (from thread.js):
 *
 *   import { openSheet } from '../../views/onboarding/sheet-manager.js';
 *
 *   openSheet('onboarding/goals', (result) => {
 *     // result: { skipped: bool, data: any }
 *     // data is whatever the view wrote to store before calling navigate()
 *     advanceThread();
 *   });
 *
 * How the intercept works:
 *   Each view receives a fakeRouter whose navigate() method signals
 *   "the user tapped Done or confirmed". The sheet closes and the
 *   done callback fires. The real router is never called from inside
 *   the sheet — thread.js drives routing exclusively.
 *
 * Import paths: this file lives at js/views/onboarding/sheet-manager.js.
 *   Views it dynamically imports also live at js/views/onboarding/*.js.
 *   store.js is at ../../store.js from this file's location.
 *
 * WCAG 2.2 AA:
 *   - Focus trapped inside sheet while open.
 *   - First focusable element receives focus on open.
 *   - Focus returns to the trigger element in the thread on close.
 *   - Overlay tap closes sheet (treated as skip).
 *   - Escape key closes sheet (treated as skip).
 *   - aria-modal="true" on sheet panel.
 *   - aria-hidden="true" on overlay (role is decorative).
 */

import { store } from '../../store.js';

// ─────────────────────────────────────────────────────────────────────────────
// VIEW MODULE MAP
// Maps the sheetView string from STEPS config to the actual module path.
// Dynamic import keeps all view modules out of the initial bundle.
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_MAP = {
  'onboarding/goals':       () => import('./goals.js'),
  'onboarding/conditions':  () => import('./conditions.js'),
  'onboarding/equipment':   () => import('./equipment.js'),
  'onboarding/plan-select': () => import('./plan-select.js'),
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE STATE
// One sheet instance at a time. State held at module level.
// ─────────────────────────────────────────────────────────────────────────────

let _overlay      = null;  // HTMLElement — the overlay
let _panel        = null;  // HTMLElement — the sheet panel
let _content      = null;  // HTMLElement — .sheet-content inside the panel
let _triggerEl    = null;  // HTMLElement — element that opened the sheet (focus return)
let _doneCallback = null;  // function(result) — called on close
let _isOpen       = false;

// Old-pattern views (conditions.js) call the bare global window.router.navigate
// directly — there is no router argument to intercept. While such a view is
// mounted, window.router.navigate is temporarily swapped; this holds the
// function that restores the real one. Always called in _close(), so the
// real navigate is restored whether the view called it or the sheet was
// dismissed another way (overlay tap, Escape).
let _oldPatternRestoreNavigate = null;

// ─────────────────────────────────────────────────────────────────────────────
// BUILD DOM
// Called once on first openSheet(). Elements are reused on subsequent opens.
// ─────────────────────────────────────────────────────────────────────────────

function _buildDOM() {
  if (_overlay) return; // already built

  // Overlay
  _overlay = document.createElement('div');
  _overlay.className = 'sheet-overlay';
  _overlay.setAttribute('aria-hidden', 'true');

  // Panel
  _panel = document.createElement('div');
  _panel.className = 'sheet-panel';
  _panel.setAttribute('role', 'dialog');
  _panel.setAttribute('aria-modal', 'true');
  _panel.setAttribute('aria-label', 'Options');

  // Drag handle (decorative)
  const handle = document.createElement('div');
  handle.className = 'sheet-handle';
  handle.setAttribute('aria-hidden', 'true');
  handle.innerHTML = '<div class="sheet-handle__bar"></div>';

  // Content area — views mount here
  _content = document.createElement('div');
  _content.className = 'sheet-content';

  _panel.appendChild(handle);
  _panel.appendChild(_content);

  document.body.appendChild(_overlay);
  document.body.appendChild(_panel);

  // Overlay tap → skip
  _overlay.addEventListener('click', () => _close({ skipped: true }));

  // Escape key → skip
  document.addEventListener('keydown', _handleKeydown);
}

// ─────────────────────────────────────────────────────────────────────────────
// OPEN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Open the sheet and mount the specified view.
 *
 * Supports BOTH view patterns that exist in this codebase:
 *
 *   NEW pattern — goals.js, plan-select.js:
 *     export function SomeView(router) { return { mount(container) {...} } }
 *     Takes a router argument directly. We pass a fakeRouter whose
 *     navigate() signals "done" — clean, no global state involved.
 *
 *   OLD pattern — conditions.js (and likely equipment.js, unconfirmed):
 *     export function render() { return '<html>' }
 *     Attaches handlers to window (window.toggleCondition, etc.) and calls
 *     the bare global `router.navigate(...)` directly — there is no
 *     router argument to intercept. For this pattern we temporarily
 *     swap window.router.navigate for the duration the sheet is open,
 *     then restore the real one on close. This is the only place in the
 *     codebase that touches window.router this way — it exists solely
 *     to let the old-pattern views run unmodified inside a sheet.
 *
 * @param {string}   viewKey    — key from VIEW_MAP (e.g. 'onboarding/goals')
 * @param {function} onDone     — callback(result) where result = { skipped, data }
 * @param {HTMLElement} [triggerEl] — element to return focus to on close
 */
export async function openSheet(viewKey, onDone, triggerEl = null) {
  if (_isOpen) return; // guard against double-open

  _buildDOM();

  _doneCallback = onDone;
  _triggerEl    = triggerEl || document.activeElement;
  _isOpen       = true;

  // Clear previous content
  _content.innerHTML = '';

  // Update aria-label with view-specific label
  _panel.setAttribute('aria-label', _getLabelForView(viewKey));

  // Load view module
  const loader = VIEW_MAP[viewKey];
  if (!loader) {
    console.error(`SheetManager: no view registered for "${viewKey}"`);
    _close({ skipped: true });
    return;
  }

  let module;
  try {
    module = await loader();
  } catch (err) {
    console.error(`SheetManager: failed to load "${viewKey}"`, err);
    _close({ skipped: true });
    return;
  }

  // Detect which pattern this module uses.
  const ViewFactory = _resolveFactory(module);

  if (typeof module.render === 'function') {
    // ── OLD PATTERN ──────────────────────────────────────────────────────
    // render() returns HTML directly. The view's onclick handlers call
    // global functions and/or the bare global `router.navigate(...)`.
    //
    // v2 (this fix): some old-pattern views — equipment.js confirmed,
    // possibly others — have their OWN internal multi-screen state and
    // their own internal re-render function, hardcoded to write to
    // #main-content. That escapes the sheet entirely on the view's first
    // internal screen change, which was the actual root cause of the
    // equipment step appearing broken (chips unresponsive, Finish
    // landing on the wrong screen) — confirmed against the real file,
    // not assumed. Views that have been updated to support this call an
    // optional mountContainer(el) export, telling them where they
    // actually live so their own internal re-renders target the right
    // place. Views without this export are unaffected — call is gated
    // behind a typeof check.
    if (typeof module.mountContainer === 'function') {
      module.mountContainer(_content);
    }

    // Similarly, some old-pattern views have a hardcoded "finish" route
    // that predates OB-THREAD and points at a now-retired view (e.g.
    // equipment.js's Finish button called
    // router.navigate('onboarding/frequency'), which router.js v7 no
    // longer recognises). Views updated to support this call an
    // optional setSheetDoneCallback(fn) export instead of hardcoding
    // that navigation — we register a callback that simply closes the
    // sheet, exactly like the window.router.navigate intercept below
    // does for views that don't have this export yet.
    if (typeof module.setSheetDoneCallback === 'function') {
      module.setSheetDoneCallback(() => {
        _close({ skipped: false, viewKey });
      });
    }

    _content.innerHTML = module.render();

    // Intercept the bare global router.navigate for the lifetime of this
    // sheet — still needed as a fallback for any navigate() call this
    // view makes that ISN'T routed through setSheetDoneCallback (e.g.
    // conditions.js, which has no internal sub-screens and so never
    // needed the two fixes above).
    const realNavigate = window.router?.navigate;
    if (window.router) {
      window.router.navigate = (_destination) => {
        // Restore the real navigate immediately — the view called this
        // because the user confirmed/skipped, so the sheet is done.
        if (realNavigate) window.router.navigate = realNavigate;
        _close({ skipped: false, viewKey });
      };
    }

    // Old-pattern views sometimes export onMount() to wire up anything
    // that isn't covered by inline onclick attributes. Call it if present.
    if (typeof module.onMount === 'function') {
      module.onMount();
    }

    // Store the restore function so _close() can call it even if the
    // view never calls navigate (e.g. user dismisses via overlay/Escape).
    _oldPatternRestoreNavigate = () => {
      if (window.router && realNavigate) window.router.navigate = realNavigate;
      // Also clear the view's own mount/callback state, if it supports
      // them, so a stale reference to a now-destroyed sheet container
      // can't be used if the same module is opened again later.
      if (typeof module.mountContainer === 'function') {
        module.mountContainer(null);
      }
      if (typeof module.setSheetDoneCallback === 'function') {
        module.setSheetDoneCallback(null);
      }
    };

  } else if (ViewFactory) {
    // ── NEW PATTERN ──────────────────────────────────────────────────────
    const fakeRouter = {
      navigate(_destination) {
        _close({ skipped: false, viewKey });
      }
    };
    const view = ViewFactory(fakeRouter);
    if (typeof view.mount !== 'function') {
      console.error(`SheetManager: view factory for "${viewKey}" did not return { mount }`);
      _close({ skipped: true });
      return;
    }
    view.mount(_content);

  } else {
    console.error(`SheetManager: no usable view pattern found in module "${viewKey}"`);
    _close({ skipped: true });
    return;
  }

  // Open animation
  requestAnimationFrame(() => {
    _overlay.classList.add('is-open');
    _panel.classList.add('is-open');
  });

  // Focus first focusable element inside the sheet
  _focusFirst();
}

// ─────────────────────────────────────────────────────────────────────────────
// CLOSE
// ─────────────────────────────────────────────────────────────────────────────

function _close(result) {
  if (!_isOpen) return;
  _isOpen = false;

  // Always restore window.router.navigate if an old-pattern view swapped
  // it — covers every dismissal path, not just the view's own confirm tap.
  if (_oldPatternRestoreNavigate) {
    _oldPatternRestoreNavigate();
    _oldPatternRestoreNavigate = null;
  }

  _overlay.classList.remove('is-open');
  _panel.classList.remove('is-open');

  // Wait for close animation then clean up and fire callback
  const panel = _panel;
  panel.addEventListener('transitionend', function handler() {
    panel.removeEventListener('transitionend', handler);
    _content.innerHTML = '';

    // Return focus to trigger element
    if (_triggerEl && typeof _triggerEl.focus === 'function') {
      _triggerEl.focus();
    }

    // Fire callback
    if (typeof _doneCallback === 'function') {
      _doneCallback(result);
      _doneCallback = null;
    }
  }, { once: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// CLOSE (imperative — called by thread.js if skip is handled at thread level)
// ─────────────────────────────────────────────────────────────────────────────

export function closeSheet(skipped = true) {
  _close({ skipped });
}

// ─────────────────────────────────────────────────────────────────────────────
// FOCUS TRAP
// ─────────────────────────────────────────────────────────────────────────────

function _focusFirst() {
  // Small delay to allow view to render
  setTimeout(() => {
    const focusable = _panel.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }, 50);
}

function _handleKeydown(e) {
  if (!_isOpen) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    _close({ skipped: true });
    return;
  }

  // Tab trap: keep focus inside the panel
  if (e.key === 'Tab') {
    const focusable = Array.from(_panel.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"])'
    ));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the view factory from a dynamically imported module.
 * Each view exports a named function: GoalsView, PlanSelectView, etc.
 * We find the first exported value that is a function.
 */
function _resolveFactory(module) {
  // Try known export names first (fast path)
  const knownNames = ['GoalsView', 'ConditionsView', 'EquipmentView', 'PlanSelectView'];
  for (const name of knownNames) {
    if (typeof module[name] === 'function') return module[name];
  }
  // Fallback: first exported function
  for (const key of Object.keys(module)) {
    if (typeof module[key] === 'function') return module[key];
  }
  return null;
}

/**
 * Human-readable aria-label for the sheet panel per view.
 */
function _getLabelForView(viewKey) {
  const labels = {
    'onboarding/goals':       'Your goals',
    'onboarding/conditions':  'Health conditions and injuries',
    'onboarding/equipment':   'Equipment and location',
    'onboarding/plan-select': 'Choose your programme',
  };
  return labels[viewKey] || 'Options';
}
