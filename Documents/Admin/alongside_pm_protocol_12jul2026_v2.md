# Alongside: Move — Product Manager Chat Protocol
## 12 Jul 2026 v2

Build New Habits Ltd | Defines how the PM/oversight chat works, how it hands work to build/test chats, and what's required from Graeme each day. Written so a cold new chat — this one, or any future one — has everything it needs.

---

## ⚠️ NEW — the differentiation pillar checklist (mandatory, every planning cycle)

A same-day cross-check against source documents found that four things central to the product's actual uniqueness — Noticing Hub, empathy transfer, the burnout-noticing moment, and dedicated neurodivergent/women-centred testing — had silently fallen out of the session sequence entirely. Not deprioritised on purpose. Just absent, because nothing forced a check against them.

**Before the PM chat finalises any session sequence, it must confirm each of these has an explicit, named session — not just "probably covered by general QA":**

- [ ] Noticing Hub — treated as a first-class citizen, not an extra
- [ ] Empathy transfer — confirmed wired live, not just present as content
- [ ] The burnout-noticing moment — the specific relational question, not just generation-parameter effects
- [ ] Neurodivergent-centred experience — dedicated pass, not folded into general persona batching
- [ ] Women-centred experience — dedicated pass, same reasoning

If a sequence is missing any of these, it is not ready to hand to a build chat — full stop, regardless of how complete it looks otherwise. See `alongside_session_handoff_12jul2026_v2.md` for the full reasoning and where each currently sits.

---

## The core mechanism, stated plainly

There is no live connection between separate Claude chats. A "PM chat" cannot watch a build chat happen in real time. **The written record is the only thing that coordinates anything** — the master schedule (project knowledge) and session handoff documents. This protocol formalises a rhythm around that fact rather than pretending otherwise:

```
PM chat writes a blueprint
        ↓
Build/test chat (this one, or an independent agent) executes it,
  ground-truthing live files itself, not trusting the blueprint's
  snapshot as current
        ↓
Build/test chat ends with a session handoff
        ↓
Graeme pastes the handoff (or it's picked up via project knowledge
  search) into the PM chat
        ↓
PM chat updates the master schedule, writes the next blueprint
```

This is the same discipline that closed out today's session, formalised and given a name so it happens on purpose every time, not only when a session runs long enough to force it.

---

## What the PM chat actually does

- Starts every session by reading the current master schedule in full — never assumes state from memory or a prior conversation.
- Holds the big picture: the philosophy, the persona matrix, the experience blueprint, the overall sequence — so build chats don't have to re-derive it each time.
- Writes blueprints (template below) for the next piece of work.
- Reads incoming handoffs and reconciles them into the master schedule — including flagging contradictions, not silently overwriting them (as happened when this session's work conflicted with a stale v46).
- Deliberately does NOT do deep file-level building itself unless the task is small enough not to need a separate session — its job is coordination, not every line of code.

---

## What a build/test chat needs from a blueprint to work independently

A blueprint is a checklist plus context — **not** a substitute for that session doing its own ground-truthing. Every blueprint must include:

1. **Focus, aim, and success criteria** — one sentence each. What this session is for, and how anyone (including a different AI) would know it's actually done.
2. **Files this session will touch**, and which of those are already confirmed live this cycle vs. need re-confirming — per the Ground Truth Rule, never assume a snapshot is still current.
3. **The specific contract(s) at risk** — e.g. "this file reads X from store.js; confirm the current live store.js still provides X in that shape before writing code that assumes it does."
4. **Which persona(s), if any, this session serves** — tie back to the persona matrix so build work stays connected to why it matters, not just what to type.
5. **What "done" looks like**, concretely — not "improve X" but "Y button, when tapped, results in Z, confirmed by [specific check]."
6. **What must NOT be touched this session** — the touch-once boundary, explicit, so an independent agent doesn't scope-creep into adjacent files.

A blueprint that's missing any of these isn't ready to hand to an independent chat yet — that's a signal to go back and fill the gap, not to proceed anyway.

---

## The daily rhythm (Graeme's proposal, adopted)

Each day starts with one question, asked by the PM chat or by Graeme to himself before opening any chat:

**"How much time and what mode do I have today?"**
- Commute / no-keyboard → a talk-through session: review a blueprint, discuss a design decision, react to a Gemini QA report. No file output expected.
- Desk, focused block → a build or test session, working from that day's blueprint.
- Short gap → something small and self-contained (a single confirmed bug fix, a single file's ground-truth read) — not something requiring a long uninterrupted chain of decisions.

The PM chat's job on any given day is to match the day's real constraint to the right item in the queue — not to always push the "next" item regardless of fit.

---

## What's required from Graeme, specifically

- **Daily**: a quick honest answer to "how much time, what mode" — nothing else needed to start.
- **After any build/test session**: paste that session's handoff into the PM chat (or confirm it's been uploaded to project knowledge) before the next planning conversation.
- **After any Gemini QA pass**: paste the report (video/screenshots/doc) into whichever chat is reviewing it — build chat if it's about the thing just built, PM chat if it's a broader pattern.
- **Deploys**: confirm each batch is actually live (a pasted URL is enough — see Deploy Verification in the master schedule) before the next session assumes it is.
- **Decisions that are genuinely his to make** (scope cuts, safeguarding age bands, business/legal tracks) — flagged clearly by whichever chat hits them, never guessed at.

---

## Guardrail — keeping this lightweight on purpose

This protocol exists to prevent the coordination failures found today (stale master schedule, six-day-old bugs discovered by accident, a single conversation growing unmanageably long) — not to become its own layer of process for its own sake. If a day's task is small enough to just do, do it. This structure is for when there are multiple threads in flight that need to stay honest with each other, not a ritual required for every single change.

---

*Build New Habits Ltd · Alongside: Move · PM Chat Protocol · 12 Jul 2026 v2*
