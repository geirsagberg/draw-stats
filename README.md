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
   - `SYNC_CRON_SECRET`: a random secret for the cron endpoint.
5. In Supabase Auth, enable at least one sign-in provider and make sure the app URL is allowed as a redirect URL.
6. Run the app:

```bash
npm install
npm run dev
```

## Trello

Create a Trello API key from Atlassian/Trello developer settings and set `TRELLO_API_KEY`. On the Trello API key page, add `${NEXT_PUBLIC_APP_URL}` to the key's allowed origins. For local development, that is `http://localhost:3000`.

Users authorize read-only access from `/connect/trello`, which redirects back to `${NEXT_PUBLIC_APP_URL}/connect/trello/callback`.

## Vercel Cron

The app includes `GET /api/cron/sync?secret=...` for polling. Configure a Vercel cron to call it with `SYNC_CRON_SECRET`.
