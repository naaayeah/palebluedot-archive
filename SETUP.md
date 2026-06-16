# Pale Blue Dot Archive — Setup Guide

## 1. Supabase Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `database/schema.sql`
3. Then run `database/seed.sql` to populate the 8 planets
4. Go to **Storage** and create a bucket named `planet-photos`, set it to **Public**

## 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=     # Project URL from Supabase dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # anon/public key
SUPABASE_SERVICE_ROLE_KEY=    # service_role key (secret — never expose to browser)
ADMIN_PASSWORD=               # Your admin password
ADMIN_SESSION_SECRET=         # Random 32+ char string for cookie signing
```

## 3. Run Development Server

```bash
npm install
npm run dev
```

## 4. Routes

| Route | Description |
|-------|-------------|
| `/` | Public home — planet index |
| `/planets/[id]` | Individual planet page (messages + photos) |
| `/admin` | Admin login |
| `/admin/dashboard` | Stats overview |
| `/admin/messages` | Message management |
| `/admin/photos` | Photo management |
| `/admin/planets` | Planet list + visibility toggle |
| `/admin/planets/[id]` | Planet content editor |

## 5. Admin Access

Visit `/admin` and enter your `ADMIN_PASSWORD`. An HTTP-only session cookie is set for 7 days.

## 6. Production Deployment (Vercel)

```bash
vercel --prod
```

Set all env vars in the Vercel dashboard under **Settings → Environment Variables**.
