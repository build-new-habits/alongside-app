/**
 * data/feelings.js
 * 03 Jul 2026 v1
 *
 * NEW FILE. Implements F1 — Quadrant Word Check-In, per
 * alongside_wellbeing_longhorizon_spec_10jun2026_v2.docx, Section 4 (F1).
 *
 * Reconciliation note: this is the THIRD word-bank implementation found
 * in the codebase this session. data/checkin.js already has an unused
 * FEELING_WORDS bank (different quadrant naming, never wired to any UI).
 * The F1/F2 spec proposes this new, separate feelings.js file with its
 * own word sets. This file follows the F1/F2 spec, since it is the most
 * recently designed and the most fully wired (explicit UI instructions,
 * accessibility criteria, and test criteria all specified). The old
 * data/checkin.js FEELING_WORDS bank is left untouched and unused —
 * flagged as a cleanup candidate, not removed today (touch-once rule).
 *
 * Core word sets (6 per quadrant) are taken directly from the F1 spec
 * table (Section 10, decision OD2 — recommended, not yet formally
 * signed off). Expanded word sets are drawn from the existing
 * data/checkin.js FEELING_WORDS bank's depth 2+ entries for the
 * equivalent quadrant, remapped to the F1 quadrant-key format, plus the
 * F2 signal words (trapped, desperate, worthless) which did not exist
 * in the old bank and have been added to the appropriate expanded list.
 * PROVISIONAL — signal-word quadrant placement has not been verified
 * against the Crisis & Safeguarding Policy v6 (Section 3, "trapped"
 * dual-quadrant combination logic in particular is not implemented
 * here — see detectSignalWord() note below). This placement affects
 * display only, not detection, since detection checks the word string
 * itself regardless of which quadrant's chip list it was shown under.
 *
 * Signal-word detection is NOT reimplemented here — it wraps the
 * existing, already-built detectSafeguardingSignal() from
 * signal-words.js, so there is a single source of truth for the
 * flagged-word list rather than a fourth copy of it.
 *
 * STATUS: detectSignalWord() is wired into checkin.js (v7) but is
 * dormant — detection fires and logs to console for dev visibility
 * only. No user-facing crisis message is shown. This is deliberate:
 * the Crisis & Safeguarding Policy (v6) is not yet signed off
 * (Appendix L, master schedule). Do not connect this to any visible
 * coach response until that sign-off lands.
 */

import { detectSafeguardingSignal } from './signal-words.js';

// ─── Word sets ──────────────────────────────────────────────────────────────
// Quadrant keys: 'high-high' | 'high-low' | 'low-high' | 'low-low'
// First segment = energy (high/low), second = mood (high/low).
// Threshold: 5 and below = low, 6 and above = high (per F1 spec, OD1).

export const WORD_SETS = {
  'high-high': {
    core:     ['energised', 'motivated', 'excited', 'alive', 'confident', 'ready'],
    expanded: ['good', 'happy', 'strong', 'focused', 'capable', 'inspired', 'purposeful', 'joyful']
  },
  'high-low': {
    core:     ['tense', 'frustrated', 'anxious', 'overwhelmed', 'restless', 'irritable'],
    // 'trapped' — F2 signal word, dual-quadrant per Crisis Policy v6.
    // Flagged directly when selected here. PROVISIONAL placement.
    expanded: ['stressed', 'wired', 'scattered', 'trapped']
  },
  'low-high': {
    core:     ['calm', 'content', 'settled', 'soft', 'grateful', 'restored'],
    expanded: ['okay', 'peaceful', 'relaxed', 'grounded']
  },
  'low-low': {
    core:     ['drained', 'flat', 'heavy', 'sad', 'lonely', 'defeated'],
    // 'hopeless', 'numb', 'desperate', 'worthless' — F2 signal words.
    // PROVISIONAL placement, not yet verified against Crisis Policy v6.
    expanded: ['tired', 'foggy', 'low', 'exhausted', 'empty', 'numb', 'depleted', 'hopeless', 'desperate', 'worthless']
  }
};

// ─── Quadrant derivation ──────────────────────────────────────────────────────

export function getQuadrant(energy, mood) {
  const e = energy <= 5 ? 'low' : 'high';
  const m = mood   <= 5 ? 'low' : 'high';
  return `${e}-${m}`;
}

// ─── Signal detection ──────────────────────────────────────────────────────────
// Wraps signal-words.js — single source of truth for the flagged-word
// list. Does not duplicate SAFEGUARDING_WORDS here.
//
// Combination logic (Crisis Policy v6: 'trapped' flags directly in Red,
// only in combination with another signal in Blue) is NOT implemented
// here. This function currently treats every flagged word the same
// regardless of quadrant. Revisit once the policy is signed off.

export function detectSignalWord(word) {
  return detectSafeguardingSignal(word);
}
