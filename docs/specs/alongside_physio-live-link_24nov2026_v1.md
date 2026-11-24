# Alongside: Move — The physio link, Stage 2: the live link (P-45) spec
## 24 Nov 2026 v1

Build New Habits | Graeme, 24 Nov: *"Stage 2 please"*. Builds on Stage 1 (`alongside_physio-link_23nov2026_v1.md`, P-44). **Built 24 Nov and switched off:** it turns on when `js/data/relay-config.js` (and the website's copy) hold the Supabase project's address and public key. Until then the app and the page are exactly Stage 1, and nothing is sent anywhere.

## 1. What it adds

The professional's changes come straight to the person's phone. They no longer have to send a link back. The person still sees **What your physio or trainer changed** and chooses what to keep.

## 2. How

1. **Send a link to change** gains **Send their changes straight to this phone** (off to start). The first link made opens a *live link*: the phone makes a random id, a 256-bit key and a secret. The relay is told the id and a SHA-256 of the secret. The link carries the plan, the id and the key after the `#`, never the secret.
2. **The page** (edit-plan v2): if the link has a live part and the relay is set up, it says so plainly. **Send back** seals the changes in the browser with the key (AES-GCM) and posts only the sealed bytes to that id. It says *Sent straight to their phone*, or that it couldn't and the link is the way. The back link is always there too.
3. **The phone** collects new messages when the app opens or comes back into view (every 2 minutes at most). It unseals them with the key and keeps only those that read as changes sent back (`liveInbox`). Then it tells the relay to delete them (`relay_ack`, with the secret).
4. **Home** asks once: *Your physio or trainer sent changes to your exercises.* **Look at them** / **Later**. It comes before Home's other questions, and not on a hard day. **My exercises** lists what is waiting. Used or kept, the changes leave the waiting list.
5. **Stop this live link** (Send a link to change › *Your live links*) deletes the link and every message on the relay, and here. A live link ends by itself after 90 days.

## 3. What the relay holds, and can't

- **It holds:** the link's id, a hash of the phone's secret, when it opened and ends, and sealed messages until the phone collects them (30 days at most).
- **It never holds** the key, the words, a name, an email, an IP-to-person link, or anything else about the person.
- **Nobody can read the tables directly.** Row level security is on with no policies, and every grant is taken away by name. Anyone can call only five checked functions (`docs/relay/relay.sql`). The cleaner runs daily, by schedule only. Limits: 50 messages a link, 2,000 links opened an hour across everyone, and sealed-looking bytes only (base64url, 30,000 characters at most).

## 4. Store (schema first)

`liveLinks` and `liveInbox`: `store.js` v131, Schema v1.133. *Delete my health answers* empties `liveInbox`, because the professional's notes may be in it.

## 5. Switching it on (Graeme; `BNH-Files/Apps/Alongside Move/Admin/alongside_relay_setup_24nov2026_v1.md`)

1. A Supabase project in Graeme's name (Frankfurt).
2. Run `docs/relay/relay.sql`, and schedule the cleaner.
3. Send Claude the project's address and *anon public* key. Claude sets both config files and checks them with the gate, `tools/pg-relay-check.mjs` and a live round trip.
4. Before turning it on, it needs: the Privacy Policy lines (`Legal/alongside_privacy_line_physio-link_24nov2026_v2.md`), a DPIA update, and Foot Anstey's view.

## 6. Tiers

The Plan only. Free collects nothing. Its own list and *Put back my old list* stay free.

## 7. Gates

- `verify-live-link`: 61 checks, against a stand-in relay that keeps relay.sql's rules. Red on v733, reversals red.
- `tools/pg-relay-check.mjs`: the real SQL in PostgreSQL 16 (PGlite), with Supabase's default grants. 19 checks, reversals red. Writing it found that Supabase's default grants would have let anyone run the cleaner; the SQL now takes those grants away by name.
- Stage 1's gates are unchanged and green.

---

*Build New Habits · Alongside: Move · The physio link, Stage 2 · 24 Nov 2026 v1*
