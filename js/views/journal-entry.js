/**
 * journal-entry.js
 * 23 Jun 2026 v2
 *
 * Journal entry view — the noticing hub's primary text input.
 * v2 adds signal word detection at save time (P5-JE-1).
 *
 * v2 changes:
 *   - Import detectSignals() from signal-words.js
 *   - At save: call detectSignals(text) on the entry text
 *   - Write hasProgressSignal (bool) and hasStruggleSignal (bool) to the entry
 *   - These flags are read by checkin.js opening engine:
 *       hasProgressSignal → Mode 5 (progress opening) may fire
 *       hasStruggleSignal → Mode 6 (care opening) may fire
 *   - Detection is silent — nothing shown to user, no UI change
 *
 * v1 behaviour preserved:
 *   - Free text input (the only open text input in the product)
 *   - Optional category tagging (via autoTagging in journalSettings)
 *   - Writes to store.journalEntries[]
 *   - Routes back to noticing hub on save
 *
 * Entry schema (written to journalEntries[]):
 *   {
 *     id:                string   — timestamp-based ID
 *     date:              ISO string
 *     text:              string
 *     tags:              string[] — auto-detected or user-set categories
 *     hasProgressSignal: boolean  — v2: from detectSignals()
 *     hasStruggleSignal: boolean  — v2: from detectSignals()
 *   }
 *
 * Privacy note:
 *   Journal entries are stored in localStorage only.
 *   No entry text is sent anywhere. Signal detection runs locally, in-browser.
 *   This must be stated in the privacy policy.
 *
 * WCAG 2.2 AA:
 *   Textarea: associated label via for/id. aria-required="false" (optional field).
 *   Character count: aria-live="polite" updates as user types. Not a limit.
 *   Category chips: role="group" container, each chip role="checkbox" aria-checked.
 *   Save button: descriptive aria-label. Disabled state announced via aria-disabled.
 *   "Can't find words" option: visible button, not a small link.
 *   All touch targets minimum 44px.
 */

import { store }           from '../store.js';
import { detectSignals }   from '../data/signal-words.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'life',        label: 'Life'        },
  { id: 'movement',    label: 'Movement'    },
  { id: 'environment', label: 'Environment' },
  { id: 'nature',      label: 'Nature'      },
  { id: 'health',      label: 'Health'      },
  { id: 'mind',        label: 'Mind'        },
  { id: 'body',        label: 'Body'        },
];

const MAX_DISPLAY_CHARS = 1000; // soft display limit — no hard truncation

// ─── View registration ────────────────────────────────────────────────────────

export function JournalEntryView(router) {

  let selectedCategories = [];
  let currentText        = '';
  let savedEntryId       = null;

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(container) {
    // Pre-select category preferences from settings
    const prefs = store.get('journalSettings.categoryPrefs') || [];
    selectedCategories = [...prefs];

    render(container);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  function render(container) {
    const autoTagging = store.get('journalSettings.autoTagging') !== false;

    container.innerHTML = `
      <div class="journal-entry-view" role="main" aria-label="New journal entry">

        <header class="je-header">
          <button class="je-back-btn btn btn-ghost"
                  data-action="back"
                  aria-label="Back to noticing hub">
            ← Back
          </button>
          <h1 class="je-title">What are you noticing?</h1>
        </header>

        <!-- Text input -->
        <div class="je-input-block">
          <label class="je-label" for="je-text">
            Write anything. This is for you.
          </label>
          <textarea
            class="je-textarea"
            id="je-text"
            name="journal-text"
            rows="8"
            aria-required="false"
            aria-label="Journal entry — write anything"
            placeholder="Something caught your attention. What was it?"
            maxlength="5000"
          >${_esc(currentText)}</textarea>
          <div class="je-char-count"
               id="je-char-count"
               aria-live="polite"
               aria-atomic="true">
          </div>
        </div>

        <!-- "Can't find words" option -->
        <div class="je-no-words">
          <button class="btn btn-ghost je-no-words-btn"
                  data-action="no-words"
                  aria-label="I can't find the words right now — save a blank entry">
            Can't find the words right now
          </button>
        </div>

        <!-- Category tagging -->
        ${autoTagging ? `
          <div class="je-categories">
            <p class="je-categories__label" id="je-cat-label">
              Tag this entry <span class="je-categories__optional">(optional)</span>
            </p>
            <div class="je-categories__chips"
                 role="group"
                 aria-labelledby="je-cat-label">
              ${CATEGORIES.map(cat => `
                <button
                  class="je-cat-chip ${selectedCategories.includes(cat.id) ? 'je-cat-chip--selected' : ''}"
                  role="checkbox"
                  aria-checked="${selectedCategories.includes(cat.id) ? 'true' : 'false'}"
                  data-category="${cat.id}"
                  aria-label="${cat.label}">
                  ${cat.label}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Save -->
        <div class="je-footer">
          <button class="btn btn-primary je-save-btn"
                  data-action="save"
                  id="je-save-btn"
                  aria-label="Save this entry">
            Save entry
          </button>
        </div>

      </div>
    `;

    attachEvents(container);
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  function attachEvents(container) {
    // Textarea input — update char count
    const textarea = container.querySelector('#je-text');
    const charCount = container.querySelector('#je-char-count');

    textarea?.addEventListener('input', () => {
      currentText = textarea.value;
      const len   = currentText.length;
      if (charCount) {
        charCount.textContent = len > MAX_DISPLAY_CHARS
          ? `${len} characters`
          : '';
      }
    });

    // Category chips
    container.querySelectorAll('[data-category]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat     = btn.dataset.category;
        const checked = btn.getAttribute('aria-checked') === 'true';
        if (checked) {
          selectedCategories = selectedCategories.filter(c => c !== cat);
        } else {
          selectedCategories = [...selectedCategories, cat];
        }
        btn.setAttribute('aria-checked', (!checked).toString());
        btn.classList.toggle('je-cat-chip--selected', !checked);
      });
    });

    // Save
    container.querySelector('[data-action="save"]')?.addEventListener('click', () => {
      saveEntry(textarea?.value || '', container);
    });

    // Can't find words
    container.querySelector('[data-action="no-words"]')?.addEventListener('click', () => {
      saveEntry('', container, { noWords: true });
    });

    // Back
    container.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      router.navigate('noticing');
    });
  }

  // ── Save handler — v2 adds signal detection ────────────────────────────────

  /**
   * Save the journal entry.
   * v2: detectSignals() called on text before writing.
   * Signals written silently — no UI change on detection.
   *
   * @param {string}  text
   * @param {Element} container
   * @param {Object}  opts
   * @param {boolean} opts.noWords — entry saved without text (blank)
   */
  function saveEntry(text, container, opts = {}) {
    const trimmedText = text.trim();

    // ── Signal detection (v2 addition) ──────────────────────────────────────
    // detectSignals() is fast, synchronous, and never throws.
    // Both flags default to false for blank entries.
    const signals = trimmedText.length > 0
      ? detectSignals(trimmedText)
      : { hasProgressSignal: false, hasStruggleSignal: false };

    // ── Build entry ──────────────────────────────────────────────────────────
    const id    = `je-${Date.now()}`;
    const entry = {
      id,
      date:              new Date().toISOString(),
      text:              trimmedText,
      tags:              [...selectedCategories],
      hasProgressSignal: signals.hasProgressSignal,  // v2
      hasStruggleSignal: signals.hasStruggleSignal,  // v2
      noWords:           opts.noWords || false,
    };

    // ── Write to store ───────────────────────────────────────────────────────
    const existing = store.get('journalEntries') || [];
    existing.unshift(entry); // newest first
    if (existing.length > 200) existing.splice(200);
    store.set('journalEntries', existing);

    // ── Update noticingLastTriggered ─────────────────────────────────────────
    store.set('noticingLastTriggered', new Date().toISOString());

    savedEntryId = id;

    // ── Navigate back to noticing hub ────────────────────────────────────────
    router.navigate('noticing');
  }

  // ── Utility ───────────────────────────────────────────────────────────────

  function _esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { mount };
}
