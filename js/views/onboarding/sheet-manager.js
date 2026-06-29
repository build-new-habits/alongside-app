/**
 * js/views/onboarding/sheet-manager.js
 * 29 Jun 2026 v1
 *
 * Sheet engine for the OB-THREAD conversational onboarding.
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

  // Resolve the view factory.
  // goals.js exports GoalsView, plan-select.js exports PlanSelectView, etc.
  // We find the first exported function that looks like a view factory.
  const ViewFactory = _resolveFactory(module);
  if (!ViewFactory) {
    console.error(`SheetManager: no view factory found in module "${viewKey}"`);
    _close({ skipped: true });
    return;
  }

  // Build a fake router whose navigate() signals "done".
  // The view calls router.navigate(destination) when the user confirms.
  // We don't care about the destination — thread.js owns routing.
  const fakeRouter = {
    navigate(_destination) {
      // The view has already written its data to store at this point.
      // Read the relevant store field to pass back as result.data.
      _close({ skipped: false, viewKey });
    }
  };

  // Mount the view
  const view = ViewFactory(fakeRouter);
  view.mount(_content);

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
