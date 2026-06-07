# Draw Stats

A hosted Trello card burndown app. It connects to Trello, polls open cards on a board, tracks checklist completion snapshots from first sync onward, and renders a board burndown timeline with per-card progress.

## Setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor or via the Supabase CLI.
3. In Supabase, open Settings > API Keys. If the project only has legacy keys, create the new API keys.
4. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`: the project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the `sb_publishable_...` key.
   - `SUPABASE_SECRET_KEY`: the `sb_secret_...` key.
   - `TRELLO_API_KEY`: the Trello API key.
   - `TRELLO_TOKEN_SECRET`: a 32-byte-or-longer random secret used to encrypt stored Trello tokens.
   - `CRON_SECRET`: a random secret for Vercel Cron authorization.
   - `SYNC_CRON_SECRET`: the same value as `CRON_SECRET`, used only for local query-string testing.
5. In Supabase Auth, enable at least one sign-in provider and make sure the app URL is allowed as a redirect URL.
6. Run the app:

```bash
npm install
npm run dev
```

## Trello

Create a Trello API key from Atlassian/Trello developer settings and set `TRELLO_API_KEY`. On the Trello API key page, add `${NEXT_PUBLIC_APP_URL}` to the key's allowed origins. For local development, that is `http://localhost:3000`.

Users authorize read-only access from `/connect/trello`, which redirects back to `${NEXT_PUBLIC_APP_URL}/connect/trello/callback`.

## Google Login

The sign-in screen supports Supabase Google OAuth. In Google Cloud, create an OAuth client of type Web application. Add these authorized JavaScript origins:

- `http://localhost:3000`
- `${NEXT_PUBLIC_APP_URL}`

Add the Supabase Google provider callback URL as an authorized redirect URI:

- `https://<project-ref>.supabase.co/auth/v1/callback`

Then enable Google in Supabase Auth > Sign In / Providers and paste the Google client ID and client secret. In Supabase Auth URL Configuration, allow:

- `http://localhost:3000/auth/callback`
- `${NEXT_PUBLIC_APP_URL}/auth/callback`

## Vercel Cron

The app includes `GET /api/cron/sync` for polling. Vercel Cron calls it once per day using `vercel.json`, and Vercel sends `CRON_SECRET` as a bearer token in the `Authorization` header. For local testing, call `GET /api/cron/sync?secret=...` with `SYNC_CRON_SECRET`.

## Deploying to Vercel

Set these environment variables in Vercel:

- `NEXT_PUBLIC_APP_URL`: the production URL, for example `https://draw-stats.vercel.app`.
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `TRELLO_API_KEY`
- `TRELLO_TOKEN_SECRET`
- `CRON_SECRET`

Then add the production callback URL in Supabase Auth redirect URLs:

- `${NEXT_PUBLIC_APP_URL}/auth/callback`

Add the production origin to the Trello API key allowed origins:

- `${NEXT_PUBLIC_APP_URL}`
