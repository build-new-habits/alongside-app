# Your email account: sign in with a code — spec

## 28 Nov 2026 v2

*v2: rule 8 and Screen 1's words (Graeme, 28 Nov: "We never send marketing is not true in the perspective of messages in the app … The email is too create their account so that they can move between free and Plan fluently").*

Build New Habits | Alongside: Move | Row 13a ACCOUNTS | ✅ **Approved 28 Nov 2026 with the mock-up** (Graeme: *"No one else is using this app to my knowledge. Otherwise all good"*) (`Product/alongside_accounts_mockup_28nov2026_v2.html`). Nothing here is built yet. Once approved, it moves to `alongside-app/docs/specs/` with S1.

**Decided (Graeme, 28 Nov 2026):**
- *"creating an account with email for both free and Plan with a magic link instead of password. This should happen. Communication through the messaging system can still happen for free and Plan."*
- On whether everyone should give an email: *"Why would we not all users to set up their account with an email for free or plan? … Health and everything else starts on the device."*
- Then *"Yes please"* to: everyone gives an email when they set up, after the age question, and signs in with a code or a link.

## What it is

Everyone gives an email address when they set up Alongside, on Free and on the Plan. There is no password. They sign in with a 6-digit code sent to that address. The same email also has a link, for people using Alongside in a web browser.

The account holds only three things: the email address, whether the person is on the Plan, and their trial's dates. History, check-ins, health answers, the journal and everything else stay on the phone, as now. Signing in on a new phone brings the Plan and the trial with it. History still moves with *Download your data* and *Restore*.

## Why a code as well as a link

On an iPhone, a link in an email opens in Safari. Safari keeps separate storage from Alongside on the Home Screen, so the person would be signed in somewhere else, with none of their history there. Typing the code into the app avoids that. The email leads with the code. The link is for someone using Alongside in the browser they read their email in.

## Rules

1. **The order of setting up.** First the age question, then agreeing to the Privacy Policy and Terms, then the email (the new step), then the rest of setting up as now. Nothing reaches the server before someone has said they are 18 or over and has seen what happens to their email address. The age guard and the consent guard stay first. A new account guard comes after them, in the same pattern.
2. **Everyone needs an account to use the app.** The only exceptions are the age question, the under-18 screen, the privacy and terms pages, and Help.
3. **What goes to the server, and nothing else:**
   - the email address;
   - the account's own identifier (made by the sign-in service);
   - when the account was made, and when it last signed in;
   - the tier (`free` or `personal`);
   - the trial's start date, end day and ending.

   No health answer, check-in, session, note or name ever goes. A gate tests what every request sends.
4. **The trial moves onto the account.** One trial per account, not per phone (this replaces rule 1 of the trial spec). `planTrial` on the phone becomes a copy of the account's trial record. Only the server can start a trial or set the tier to `personal`: the phone asks, and the server says yes once per account. Payment, when it comes (row 14), sets the tier in the same place.
5. **Offline.**
   - **Setting up:** this step needs an internet connection. With none, the screen says so and offers *Try again*. Nothing else is held back, because the app had to be online to install anyway.
   - **After setting up:** the app works offline, as now. The Plan stays on until the trial's end day the phone last heard from the server. The check against the server happens on the next app open with a connection.
6. **The code.**
   - It has 6 digits and works for 15 minutes, once.
   - A new code can be asked for after 60 seconds. At most 5 codes an hour go to one address (sign-in service settings).
   - After 5 wrong codes, the person must ask for a new code.
   - The code box uses `inputmode="numeric"` and `autocomplete="one-time-code"`, so phones can offer the code straight from the email.
7. **The link.** It does what the code does, in the browser it opens in. If it opens in a browser where Alongside wasn't waiting for a sign-in, the page says: *Go back to Alongside and type the code from the email.* It does not sign that browser in.
8. **The email address is used only to sign in**, so the person can move between Free and the Plan and onto another phone; and, once payment opens, for the payment emails the law requires (confirmation, receipts, reminders). Nothing else is ever sent to it. Everything else we say to people (news, updates, causes) comes through Messages in the app (Settings › Messages), unchanged on both tiers. Screen 1 says so: *We only use it to sign you in … News from us comes in the app, in Messages.* It does not say *we never send marketing*, because Messages can carry news.
9. **On a new phone, or after Reset all data,** the same screen signs the person back in to their account. *Welcome back.* The Plan or trial comes back if it is still running. Then a line about history: *Your history stays on your old phone. To bring it here, use Download your data there and Restore here.*
10. **Settings › Your account** shows the email address, with three choices:
    - **Change my email:** a code goes to the new address, and the change happens only once it is typed in.
    - **Sign out:** the app goes back to the email screen. Nothing on the phone is deleted.
    - **Delete my account:** a confirm screen, then the account and its email address are deleted from the server straight away. It says: *What's on this phone stays, unless you also use Reset all data.* If the person is on a trial, it ends. Once payment exists, deleting is refused while a paid subscription runs, with the reason and the way to cancel.
11. **People who already use the app** (today only Graeme's own phones) meet the email step once, on their next open after the update. Everything already on their phone stays. The trial they may already have moves onto the account.
12. **Download your data and Restore.** The sign-in tokens are never in the downloaded file, and Restore never reads them. The file carries the email address so the person can see it. Restore never signs anyone in: the person signs in on the new phone with a code.
13. **Young versions** (developer switch only, `YOUNG_OPEN` closed): no account step. Accounts for under-18s wait for their own legal review.
14. **Switched off until it is set up.** Like the relay (`relay-config.js`), an empty `ACCOUNTS` configuration (the project's web address and its public key) means no account step at all, and the trial stays on the phone as now. So the build can merge before Graeme's Supabase project exists. The developer panel gets *Pretend signed in* and *Sign out*, for testing without a server.

## Store (Schema first)

`account` `{ email, userId, signedInAt, checkedAt, tier, trial }`, default `{}`.

Sign-in tokens (access and refresh) are kept in their own key, `accountSession`, which is never exported, restored or shown on screen. On load, anything not of its type is dropped, and `email` is kept only if it looks like an email address.

## The server (Graeme sets up; Claude writes the setup guide)

- **Supabase**, the same Frankfurt project as the relay and the survey. It uses Supabase Auth's email code (`/auth/v1/otp`, then `/auth/v1/verify` with type `email`).
- The app calls these with `fetch`, so no library is loaded from anyone else's servers.
- One table, `accounts`: `user_id`, `tier`, `trial_started_at`, `trial_ends_on`, `trial_ended_at`, `trial_ended_how`, `created_at`.
- Row-level security: a person can read only their own row, and cannot write `tier` or the trial at all. Two small server functions do that: *start my trial* (once per account) and *delete my account*.
- **The email sender** is a mail service connected to Supabase (Resend, as chosen in May; **TO CONFIRM**, and its region). The email template carries the code first, then the link.
- **Logs:** Supabase Auth keeps its own audit log, including IP addresses, for a short time. The retention is **TO CONFIRM**, and it goes into the Privacy Policy.

## What changes in the legal documents (row 7, before the one review)

- **Privacy Policy:** a new section on the account: what is kept, where, for how long (until the account is deleted), who runs it (Supabase; the email sender), the lawful basis (contract), and the transfers. The summary no longer says there is no account. Health answers still never leave the phone.
- **Terms:** an account section (one per person, keeping the email address up to date, deleting the account). The trial becomes once per account.
- **Children's Access Assessment:** re-run, because its trigger is server-side storage. The age question stays before any email is collected.
- **DPIA:** refreshed.
- **Covering letter v12:** question 2b (the one-review plan).

## Sessions (once approved)

- **S1 SCHEMA + RULES:** `account`, `accountSession`; the ACCOUNTS configuration (empty); `js/data/account.js` (send code, verify, sign out, delete, check on open); the account guard; the trial's start going through the account when it is set up. Gate `verify-accounts-rules`, including that no request carries anything beyond rule 3.
- **S2 SCREENS:** the email step, the code screen and its states (wrong, expired, offline, resend), welcome back, Settings › Your account, the link's landing page, and the developer panel's controls. Gate `verify-accounts-screens`; real browser at text sizes 1 and 2, with axe.
- **S3 SERVER GUIDE + CLOSE:** the Supabase setup guide (table, row-level security, the two functions, the email template, the sender), the device checklist sitting, and the schedule.

*Build New Habits · Alongside: Move · Your email account spec · 28 Nov 2026 v2 · supersedes v1*
