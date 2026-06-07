# Draw Stats

A hosted Trello card burndown app. It connects to Trello, polls open cards on a board, tracks checklist completion snapshots from first sync onward, and renders a board burndown timeline with per-card progress.

## Setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor or via the Supabase CLI.
3. Copy `.env.example` to `.env.local` and fill in Supabase and Trello values.
4. Run the app:

```bash
npm install
npm run dev
```

## Trello

Create a Trello API key from Atlassian/Trello developer settings and set `TRELLO_API_KEY`. Users authorize read-only access from `/connect/trello`.

## Vercel Cron

The app includes `GET /api/cron/sync?secret=...` for hourly polling. Configure a Vercel cron to call it with `SYNC_CRON_SECRET`.
