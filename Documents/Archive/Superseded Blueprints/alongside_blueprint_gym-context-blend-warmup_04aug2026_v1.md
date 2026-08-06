# Alongside: Move — Build Session Blueprint
## 04 Aug 2026 v1

Build New Habits | Written by the PM chat, for a fresh build session. Paste this whole document as the first message in a new chat. **This blueprint has real open decisions in Section 2 — don't build past that section until they're confirmed with Graeme.**

---

## Session: Gym Session — Location Context, Non-Functional Focus Cards, Blend Option, Warmup Equipment

**Source: a real live-use bug report, fully traced before this blueprint was written** (04 Aug 2026, Graeme at the gym). Four connected findings, not four separate bugs — all stem from Library's "At the gym" category being built as if it were a simple menu, when the destinations it points to are architecturally two different things.

---

## 1. What's confirmed — don't re-investigate this

**The root architectural confusion:** Library's "At the gym" category has 6 cards (My programme, Core, Upper body, Lower body, Strength, Cardio) that conflate two genuinely different user intents:
- *"Follow my structured programme"* → correctly goes to `gym-programme.js`, Graeme's actual scripted "Build Your Base" programme. This part is fine, don't touch it.
- *"Give me a one-off session with a specific focus today"* → this is what Upper/Lower/Strength/Core are trying to be, but they're wired wrong.

**Confirmed via code, not assumed:**
- `library.js`'s `router.navigate(target)` passes only the target view name — no parameter, no focus, nothing. "Upper body," "Lower body," and "Strength" all call `router.navigate("gym-programme")` identically.
- `gym-programme.js` has zero mechanism to receive a differentiating parameter even if one were sent — no `router.getParam`, no URL param reading, nothing. It just renders whatever the scripted programme's current step is, regardless of which of the three cards was tapped.
- **A working system for exactly this already exists and is unused here:** `session-builder.js`/`session-builder-ui.js` — reached via coach-proposal.js's "Help me build it" door — already has `SESSION_TYPES` including `glute`, `upper`, `lower`, `full` (the blend option), `core`, `cardio`, `mobility`, plus a working equipment-override step and duration picker. "Full" is the one type available even on free tier.
- **No location/context question exists anywhere in the live flow.** `checkin.js` has no "home or gym today?" question. `workoutGenerator.js` reads `store.get("equipment")` — a flat merge of `homeEquipment` + `gymEquipment` (`store.js`, `js/views/onboarding/equipment.js`'s `save()` function) — not a same-day choice. The underlying home/gym split is well-designed and captured cleanly at onboarding; nothing in daily use ever asks which one applies today.
- **No cardio warmup equipment (bike/treadmill/cross-trainer) is offered in any gym session.** The content exists elsewhere in the app (`cycle-session.js`, `js/data/exercises/cardio.js`) but `gym-programme.js` has zero warmup logic of any kind, and `session-builder.js`'s `EXERCISE_POOLS` warmup sections don't include cardio-machine options either (confirmed — its warmup exercises are bodyweight activation/mobility work, not equipment-based cardio).

---

## 2. Real decisions needed before building — don't guess at these

### 2a. Should Library's Upper/Lower/Strength/Core cards route into `session-builder.js` instead of `gym-programme.js`?

**Recommended: yes.** The infrastructure already exists and works — equipment override, duration picker, and (once 2b is decided) a blend option. Rather than trying to make `gym-programme.js` (a fixed scripted programme) also handle "one-off Lower Body session today," redirect these four cards into `session-builder-ui.js` with the type pre-selected, skipping straight past its own type-picker screen since Library already captured the choice.

**This needs a small addition to `session-builder-ui.js`:** a way to receive a pre-selected type on mount (e.g. `store.set('sessionBuilderPreselect', 'upper')` before navigating, read once and cleared on mount — same pattern as `running-session.js`'s resume-checkpoint reading, not a new invention). If Graeme wants a different mechanism, that's fine, but this needs to be a deliberate choice, not guessed at mid-build.

**If this recommendation is confirmed:** "Core" should probably move to this same path too, for consistency, rather than staying routed to the separate `core-session.js` with its own private exercise pool (a known, already-logged architectural smell from earlier this session). Flag this as part of the same decision, don't split it into a separate question.

### 2b. Add a "Blend" card to Library's gym category

Straightforward once 2a is confirmed — maps to `session-builder.js`'s existing `full` type, which already exists and is already free-tier available. Low risk, no new exercise logic needed, just a new card and the routing from 2a.

### 2c. Location/context — how should "home or gym today?" actually be asked?

**Not resolved by this blueprint — needs Graeme's call on where this question lives:**
- As a new check-in question, every day (highest friction, most reliable)
- As a one-tap toggle on Library's landing screen or the gym-programme.js entry point, defaulting to last choice (lower friction, could go stale)
- Inferred from which door/card the user tapped (e.g. tapping anything under "At the gym" implies gym today) — no explicit question needed at all, but doesn't help the default coach-proposed flow (`today.js`'s doors), only the Library path

**Whichever is chosen, the technical fix is the same:** `workoutGenerator.js` (and any other equipment-reading code) needs to read `homeEquipment` or `gymEquipment` based on today's answer, not the flat merged `equipment` field. This is a real behaviour change to a shared, heavily-used function — confirm the approach before touching it.

### 2d. Cardio warmup equipment — new content, not just re-routing

This is the one genuinely new build in this set, not a rewire. Needs:
- A decision on whether warmup equipment choice is part of the equipment-override step (extending `session-builder-ui.js`'s existing `EQUIPMENT_OPTIONS`, currently missing bike/treadmill/cross-trainer entirely) or a separate warmup-specific step
- Actual warmup exercise entries referencing this equipment need to exist in `session-builder.js`'s `EXERCISE_POOLS` warmup section — currently bodyweight-only

---

## 3. Files — ground-truthed today, re-confirm at session start regardless

| File | Live version confirmed 04 Aug | Role |
|---|---|---|
| `js/views/library.js` | v2 | Add Blend card (2b), change Upper/Lower/Strength/Core routing (2a) |
| `js/views/session-builder-ui.js` | v3 | Add pre-selected-type reading (2a), extend equipment options for warmup (2d) |
| `js/session-builder.js` | v1 (21 May — hasn't moved in months, oldest file in this set) | `SESSION_TYPES`/`EXERCISE_POOLS` — extend warmup pool if 2d's cardio-equipment approach needs new exercise entries here |
| `js/views/checkin.js` | v11 | Only touched if 2c's answer puts the location question here |
| `js/data/workoutGenerator.js` | v1.13 | Only touched once 2c is resolved — the `homeEquipment`/`gymEquipment` read logic |
| `js/store.js` | v17 | Read-only expected — `homeEquipment`/`gymEquipment`/`equipment` fields already exist correctly, shouldn't need schema changes |
| `js/views/gym-programme.js` | v3 | **Not touched** — confirmed out of scope, "My programme" routing is already correct |
| `sw.js` | cache `alongside-v220` | Deploy LAST, cache bump, one-line changelog |

**Touch-once, with the same caveat as other multi-decision sessions:** Section 2's four decisions may not all resolve to "yes, build it" — if 2c or 2d turn out bigger than expected once scoped, split them into their own session rather than force-completing everything here.

---

## 4. What "done" looks like

- Section 2's decisions are confirmed with Graeme, explicitly, before any of this is built
- Tapping Upper/Lower/Strength/Core (and the new Blend card) each produce genuinely different sessions — confirmed by testing all four/five back to back, not just code review
- A location/context answer exists and actually changes which equipment pool gets used — confirmed on-device with home equipment and gym equipment genuinely different, testing both settings
- A cardio warmup option is offered and actually appears in a real generated session
- `gym-programme.js` is unchanged and still works exactly as before

---

## 5. Session Start Checklist

- [ ] `Documents/Admin/master_schedule.md` in the repo is canonical — read in full first.
- [ ] **Confirm all of Section 2's decisions with Graeme before writing code** — this blueprint intentionally stops short of deciding them.
- [ ] Re-confirm every live version in Section 3's table.
- [ ] Use the fine-grained GitHub token — regenerate if expired (the one used to write this blueprint has already been used once today).
- [ ] Every file produced carries a `DD Mon YYYY vN` header.
- [ ] `node --check` on every changed `.js` file.
- [ ] `sw.js` last, cache bump, one-line changelog entry.

---

## 6. What to bring back to the PM chat

- Confirmed decisions for all of Section 2, with reasoning if anything deviated from this blueprint's recommendations
- On-device confirmation results — this is exactly the kind of thing (real day-to-day flow, equipment-dependent) that only ever gets caught through real use, same category as the Wake Lock bug
- Whether 2c/2d needed to split into their own follow-up session

---

*Build New Habits · Alongside: Move · Session Blueprint · 04 Aug 2026 v1*
