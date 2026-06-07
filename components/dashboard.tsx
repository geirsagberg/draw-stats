import { formatDistanceToNowStrict } from "date-fns";
import { AlertTriangle, Cable, ChartNoAxesCombined, Clock3, ExternalLink } from "lucide-react";
import { AnchorButton, Panel, Shell } from "@/components/ui";
import { BoardPicker } from "@/components/board-picker";
import { BurndownChart, type TimelinePoint } from "@/components/burndown-chart";
import { CardProgressTable, type CardProgressRow } from "@/components/card-progress-table";
import { LogoutButton } from "@/components/logout-button";
import { SyncButton } from "@/components/sync-button";
import { TargetDateForm } from "@/components/target-date-form";
import type { Database } from "@/lib/supabase/types";

type Board = Database["public"]["Tables"]["boards"]["Row"];

export function Dashboard({
  boards,
  board,
  snapshots,
  cards,
  trelloConnected,
  demo = false
}: {
  boards: Board[];
  board: Partial<Board> & Pick<Board, "trello_board_id" | "name" | "last_sync_status" | "last_sync_error" | "last_synced_at">;
  snapshots: TimelinePoint[];
  cards: CardProgressRow[];
  trelloConnected: boolean;
  demo?: boolean;
}) {
  const latest = snapshots.at(-1);
  const completed = latest?.completed_check_items ?? 0;
  const remaining = latest?.remaining_check_items ?? 0;
  const total = latest?.total_check_items ?? 0;
  const stale =
    board.last_synced_at &&
    Date.now() - new Date(board.last_synced_at).getTime() > 1000 * 60 * 60 * 3;

  return (
    <Shell>
      <header className="flex flex-col gap-5 border-b border-ink/20 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-signal">Draw Stats</p>
          <h1 className="font-display text-5xl leading-none tracking-normal sm:text-6xl">
            Trello work, measured by the checkmark.
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {trelloConnected ? <BoardPicker boards={boards} selectedBoardId={board.trello_board_id} /> : null}
          {trelloConnected ? (
            <AnchorButton href="/connect/trello" className="bg-paper text-ink hover:bg-ink hover:text-paper">
              <Cable size={17} />
              Reconnect Trello
            </AnchorButton>
          ) : (
            <AnchorButton href="/connect/trello">
              <Cable size={17} />
              Connect Trello
            </AnchorButton>
          )}
          {demo ? null : <LogoutButton />}
        </div>
      </header>

      {demo ? (
        <div className="mt-4 border-y border-brass/50 bg-brass/10 px-4 py-3 text-sm font-semibold text-ink">
          Demo mode: add Supabase and Trello environment variables to enable live auth and syncing.
        </div>
      ) : null}

      {!trelloConnected ? (
        <Panel className="mt-8 grid gap-6 p-6 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="font-display text-3xl">Start with a board connection.</h2>
            <p className="mt-3 max-w-2xl text-steel">
              Sign in, connect Trello, choose a board, then every sync captures a new checklist snapshot.
            </p>
          </div>
          <div className="border-l-0 border-ink/15 pt-0 lg:border-l lg:pl-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-steel">V1 rules</p>
            <p className="mt-3 text-sm text-ink">
              All open cards count. History starts at first sync. Sharing follows Trello board access.
            </p>
          </div>
        </Panel>
      ) : null}

      <section className="grid gap-4 py-6 sm:grid-cols-3">
        <Metric label="Remaining" value={remaining} tone="signal" />
        <Metric label="Completed" value={completed} tone="mint" />
        <Metric label="Total checklist items" value={total} tone="ink" />
      </section>

      <Panel className="p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 border-b border-ink/15 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-3xl">{board.name}</h2>
              {board.url ? (
                <a className="inline-flex items-center gap-1 text-sm font-semibold text-steel hover:text-signal" href={board.url} target="_blank">
                  Trello
                  <ExternalLink size={14} />
                </a>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-steel">
              <span className="inline-flex items-center gap-1">
                <Clock3 size={15} />
                {board.last_synced_at
                  ? `Synced ${formatDistanceToNowStrict(new Date(board.last_synced_at))} ago`
                  : "Never synced"}
              </span>
              {stale ? <span className="font-semibold text-brass">Stale</span> : null}
              {board.last_sync_status === "error" ? (
                <span className="inline-flex items-center gap-1 font-semibold text-signal">
                  <AlertTriangle size={15} />
                  {board.last_sync_error ?? "Sync failed"}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {board.trello_board_id !== "demo" ? (
              <>
                <TargetDateForm trelloBoardId={board.trello_board_id} targetDate={board.target_date ?? null} />
                <SyncButton trelloBoardId={board.trello_board_id} />
              </>
            ) : null}
          </div>
        </div>
        <BurndownChart snapshots={snapshots} />
      </Panel>

      <Panel className="mt-6 p-4 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <ChartNoAxesCombined size={20} />
          <h2 className="font-display text-3xl">Card progress</h2>
        </div>
        <CardProgressTable cards={cards} />
      </Panel>
    </Shell>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: "signal" | "mint" | "ink" }) {
  const color = tone === "signal" ? "text-signal" : tone === "mint" ? "text-mint" : "text-ink";
  return (
    <div className="border-y border-ink/15 bg-paper/75 px-4 py-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-steel">{label}</p>
      <p className={`mt-2 font-display text-5xl leading-none ${color}`}>{value}</p>
    </div>
  );
}
