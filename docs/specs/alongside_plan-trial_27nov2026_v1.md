# Try the Plan: 14 days, no card — spec
## 27 Nov 2026 v1

Build New Habits | Alongside: Move | Row 17 PUBLIC-TEST-TIERS with P-40 PAID-PULL

**Approved:** mock-up v2 (BNH-Files `Product/alongside_plan-trial_mockup_27nov2026_v2.html`), Graeme 27 Nov: the offer after the first finished session (*"yes. This is fine"*), 14 days (*"I think so"*), the prices (*"Yes. Happy there"*). Row 17 (25 Nov): *"just like the real user it should start free and get offered to try Plan before offer of lower early price."*

## What it is

A person starts on Free. After their first finished session they are offered the Plan for 14 days, with no card and nothing ever charged. Two days before it ends, one notice. Then they are back on Free with everything they made kept, and *Keep the Plan* shows the early price. Payments are not built (row 14), so in the closed test *Keep the Plan* says plainly that nobody can pay yet.

## Rules

1. **One trial per phone.** Kept on the phone (`planTrial`). Reinstalling starts again; fine for a beta.
2. **Nothing is charged, ever, by the trial.** It needs no card, so it can never roll into a payment.
3. **The offer** (on Free's finish, `reflect.js`): from the first finished session; never on a hard day (a sore area at Bad), a low-mood or low-energy day, or a sore day; never in a young version (`canBuy`); at most once every 7 days; never once a trial has started. On a finish that offers the trial, In Step is not offered as well (one offer at a time).
4. **Starting it** (*Try the Plan*, on the finish or on Upgrade): `tier` becomes `personal`; it ends 14 days later, on a local day (`endsOn`). It opens Start your Plan (Making my Move, P-39, unchanged).
5. **During it:** the Plan, as any Plan. Settings › Your plan says it is a free trial, until when, that nothing is charged, what happens at the end, and offers *Go back to Free now*.
6. **The notice:** once, on Home, when 2 days or fewer are left, not on a hard day (it waits). *Keep the Plan* / *Stay on Free*. It never sends a notification.
7. **The end:** on the first app open on or after `endsOn`, `tier` becomes `free`. Nothing is deleted: Home's choices, hard days, My exercises' places on Home stay, unused, and come back with the Plan.
8. **After it:** Free's Home has one line, *Your own Home is saved. Pick up the Plan any time.*, to Upgrade. Upgrade's button is *Keep the Plan* (the early price), not *Try the Plan* again.
9. **Keep the Plan (before Payments):** the early price, yearly first: *£49.99 a year* (about £4.17 a month), or *£7.99 a month*; and *Not open yet*: nobody can pay while Alongside is being tested; you're on Free with everything saved (or on the Plan, if the trial is still running). Prices from row 14 (27 Nov); they live in `js/data/pricing.js`.
10. **The beta's *I'm ready*** (the Plan free with no end) goes: Upgrade offers the trial instead.
11. **Developer panel:** Plan / Free as now, and trial controls: start, jump to 2 days left, end now, forget the trial.

## Store (Schema first)

`planTrial` `{ startedAt, endsOn, noticedAt, endedAt, endedHow, offeredAt }`, default `{}`:

| Field | What |
|---|---|
| `startedAt` | ISO time *Try the Plan* was tapped; set once |
| `endsOn` | local day `YYYY-MM-DD`, 14 days after the start |
| `noticedAt` | ISO time the day-12 notice was shown |
| `endedAt` | ISO time it ended |
| `endedHow` | `"ended"` (it ran out) or `"stopped"` (*Go back to Free now*, *Stay on Free* after the end) |
| `offeredAt` | ISO time the offer was last shown on a finish |

On load: anything not of its type dropped; `endsOn` only as `YYYY-MM-DD`; `endedHow` only `ended` or `stopped`.

## Sessions

- **S1 SCHEMA + RULES:** `planTrial`; `js/data/plan-trial.js` (start, end, check on open, notice due, offer due); the check on every app open. Gate `verify-trial-rules`.
- **S2 SCREENS:** the finish offer; Upgrade (*Try the Plan*, *Keep the Plan* and its early-price page); Settings › Your plan; the notice; Free Home's line; the developer panel's controls. Gate `verify-trial-screens`; real browser.
- **S3 CLOSE:** device checklist sitting; schedule.

*Build New Habits · Alongside: Move · Try the Plan spec · 27 Nov 2026 v1*
