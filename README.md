# Stockio waitlist

Landing page and email waitlist for **Stockio**, a mobile city builder where
your stock calls earn you buildings modeled on real companies, and those
buildings rise and fall with the real market.

Built with Next.js 16 (App Router), Tailwind CSS v4 and Supabase.

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. No configuration is required: the Supabase
URL and publishable key ship as defaults in `src/lib/supabase.ts`, so a fresh
clone and a fresh deploy both work with nothing set.

Neither is a secret. `NEXT_PUBLIC_*` values are compiled into the JavaScript
every visitor downloads, so the key is public the moment the site ships. Row
Level Security protects the data, not secrecy: with that key alone, reading
the waitlist, reading the admin hash and deleting rows all return 401. It can
insert a signup and nothing else.

Set the variables in `.env.example` only to point the site at a different
Supabase project; where present they override the defaults.

## Routes

| Route         | What it is                                      |
| ------------- | ----------------------------------------------- |
| `/`           | Landing page and waitlist signup                 |
| `/admin`      | Password-gated list of signups, `noindex`        |
| `/robots.txt` | Generated, disallows `/admin`                    |

## The 3D city

`public/city/` holds a self-contained Three.js scene used as the page
backdrop. It is embedded in an iframe rather than imported, so its ~6k lines
stay out of the app bundle.

- Three.js is **vendored** in `public/city/vendor/`. There is no CDN call at
  runtime.
- The scene mounts after hydration, keeping ~2MB off the critical path.
  Reduced-motion and Save-Data visitors get a gradient and never load it.
- Under 820px or 4 CPU cores it runs a `LITE` pipeline: no shadow pass, no
  antialias, pixel ratio pinned to 1, thinner surrounding city.
- The backdrop must never sit on a negative `z-index`. It still paints there,
  but hit testing resolves to `<body>` first and every drag and click dies.

Explore mode is a toggle rather than an always-live canvas because the
scene's OrbitControls bind wheel-to-zoom, which would otherwise swallow every
page scroll.

## Admin access

`/admin` asks for a password and lists signups.

The password is **not in this repo and not checked in the browser**. It is
sent to `admin_list_waitlist(pw)`, a `SECURITY DEFINER` Postgres function that
compares it against a bcrypt hash in `admin_credential` and only then reads
the table. The `anon` key alone cannot read the waitlist or the hash, so the
password is the entire gate.

To change it:

```sql
update public.admin_credential
set password_hash = extensions.crypt('<new password>', extensions.gen_salt('bf', 12)),
    updated_at = now()
where id = 1;
```

## Deploying

Nothing to configure. `vercel.json` declares the Next.js framework and the
Supabase defaults are committed, so a connected repo deploys as-is.
