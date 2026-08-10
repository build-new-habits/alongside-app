# 10 Aug 2026 v1

# Domain Switch-Over Checklist — buildnewhabits.co.uk

Build New Habits | Alongside website

**Status:** repo side is done and pushed. Nothing below has been actioned yet. The live site currently runs at `build-new-habits.github.io/website/` and will keep working normally until Step 2.

---

## What's already done (10 Aug 2026)

The site no longer hardcodes its own path. `js/site.js` v9 works out at runtime whether it's being served under the github.io `/website/` prefix or at a domain root, and builds every nav and brand link accordingly. The two hardcoded links in page markup (Philosophy's Impact link, About's back link) are now relative, so they resolve correctly either way.

Verified by simulating both hostnames — nav links, brand link and active-page state all correct on `build-new-habits.github.io`, `buildnewhabits.co.uk` and `www.buildnewhabits.co.uk`.

**This means no code change is needed at switch-over for the site to work.** The steps below are DNS plus four small housekeeping edits.

---

## Before you start

- Domain is registered with **Namecheap** and already owned.
- **Zoho Mail is live on this domain** (`hello@buildnewhabits.co.uk`). This is the single biggest risk in the whole process — see the warning at Step 1.
- Allow up to 24 hours for the HTTPS certificate. The site may look briefly broken or show a certificate warning in that window. This is normal and not a fault.
- Best done on a day you're not expecting to send outreach email, so if anything does go wrong with mail you notice quickly and aren't mid-conversation with an organisation.

---

## Step 1 — DNS at Namecheap

### ⚠️ Do not touch the MX records

Zoho Mail delivery depends entirely on the MX records for this domain. You are **adding** A and CNAME records, not replacing the record set. A and MX are different record types and coexist fine.

**The one thing that will break your email:** never put a CNAME record on the apex/root (`@`). A CNAME at the root overrides every other record at that name, including MX, and mail delivery stops. Namecheap may offer an "ALIAS" record for the root — that is safer than CNAME but still unnecessary here. Use A records at the root.

### Records to add

Four A records on the root (`@`), pointing at GitHub Pages:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

One CNAME on `www`:

```
www  ->  build-new-habits.github.io
```

Leave every existing MX, TXT (SPF/DKIM — Zoho uses these), and verification record exactly as it is.

**Check before saving:** the record list should still show your Zoho MX records. If it doesn't, stop and restore them before saving.

---

## Step 2 — Connect the domain in GitHub

Repo → Settings → Pages → Custom domain → enter `buildnewhabits.co.uk` → Save.

GitHub writes a `CNAME` file into the repo automatically. Let it — don't create one by hand, and don't be surprised by the new commit appearing.

Then wait for the DNS check to pass, tick **Enforce HTTPS** once it becomes available. That tickbox is often greyed out for a while; that's the certificate provisioning, not an error.

GitHub will automatically 301-redirect the old `github.io/website/` URLs to the new domain, so anything already shared stays working.

---

## Step 3 — Four housekeeping edits (after the domain resolves)

Deliberately left until now, because each one points at a domain that doesn't answer yet.

| File | Change |
|---|---|
| `sitemap.xml` | All 8 `<loc>` URLs from `build-new-habits.github.io/website/...` to `buildnewhabits.co.uk/...`. Bump to v6. |
| `robots.txt` | The `Sitemap:` line to the new domain. Bump to v2. |
| `community/index.html` | The share button's `data-share-url` — currently the old absolute URL. This is the link people copy and send to others, so it matters more than it looks. |
| `products/index.html` | Two links to `build-new-habits.github.io/alongside-app/`. **Separate decision, not part of this** — see below. |

I can do all of these in one pass once you confirm the domain is answering.

---

## Step 4 — Check it worked

- `buildnewhabits.co.uk` loads the home page.
- `www.buildnewhabits.co.uk` loads and redirects.
- The old `build-new-habits.github.io/website/` redirects rather than 404s.
- Every nav item goes somewhere real — Philosophy, Products, Community, Impact, Upgrade, About.
- Philosophy's Impact link and About's back link both work.
- **Send yourself an email to `hello@buildnewhabits.co.uk` and confirm it arrives.** Do this even if the site looks perfect. It's the check nobody remembers to do.
- Padlock showing in the address bar (may take up to 24h).

---

## Still open, deliberately not decided here

**The app's own address.** `products/index.html` links twice to `build-new-habits.github.io/alongside-app/`. The app is a different repo and needs its own home — most likely `app.buildnewhabits.co.uk`, which would be a second CNAME record and a second GitHub Pages custom domain. Worth doing before beta, since beta users will be installing the PWA from whatever URL they're given and changing it afterwards is disruptive. Not urgent today.

**Hosting.** This checklist assumes staying on GitHub Pages with the domain pointed at it. The June website planning doc recommended Vercel, mainly for serverless functions to run Stripe webhooks — but that same document then routes Stripe webhooks to Supabase Edge Functions instead, so the original reason has largely dissolved. Nothing about the work above is wasted if you later move to Vercel: the path-independence work applies identically, and only the DNS records would change.

---

*Build New Habits · Alongside website · Domain Switch-Over Checklist · 10 Aug 2026 v1*
