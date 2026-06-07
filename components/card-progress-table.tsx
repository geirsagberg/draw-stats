"use client";

import { useMemo, useState } from "react";
import { ArrowDownWideNarrow, CheckCircle2, ExternalLink } from "lucide-react";

export type CardProgressRow = {
  id: string;
  name: string;
  url: string | null;
  total_check_items: number;
  completed_check_items: number;
  remaining_check_items: number;
  percent_complete: number;
  last_activity_at: string | null;
};

type SortMode = "remaining" | "progress" | "name";

export function CardProgressTable({ cards }: { cards: CardProgressRow[] }) {
  const [sortMode, setSortMode] = useState<SortMode>("remaining");
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      if (sortMode === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortMode === "progress") {
        return b.percent_complete - a.percent_complete;
      }
      return b.remaining_check_items - a.remaining_check_items;
    });
  }, [cards, sortMode]);

  if (cards.length === 0) {
    return <div className="border-y border-ink/15 py-12 text-center text-sm text-steel">No synced cards yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-steel">{cards.length} open cards tracked</p>
        <label className="inline-flex items-center gap-2 text-sm font-semibold">
          <ArrowDownWideNarrow size={16} />
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="focus-ring border border-ink/20 bg-paper px-2 py-1"
          >
            <option value="remaining">Remaining</option>
            <option value="progress">Progress</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-y border-ink/20 text-left text-xs uppercase tracking-[0.16em] text-steel">
            <th className="py-3 pr-4">Card</th>
            <th className="px-4">Progress</th>
            <th className="px-4 text-right">Done</th>
            <th className="px-4 text-right">Remaining</th>
            <th className="py-3 pl-4 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {sortedCards.map((card) => (
            <tr key={card.id} className="border-b border-ink/10">
              <td className="py-4 pr-4 font-semibold">
                <div className="flex items-center gap-2">
                  {card.percent_complete === 100 ? <CheckCircle2 size={16} className="text-mint" /> : null}
                  {card.url ? (
                    <a className="inline-flex items-center gap-2 hover:text-signal" href={card.url} target="_blank">
                      {card.name}
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    card.name
                  )}
                </div>
              </td>
              <td className="px-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-36 border border-ink/20 bg-white">
                    <div className="h-full bg-mint" style={{ width: `${card.percent_complete}%` }} />
                  </div>
                  <span className="w-10 text-right tabular-nums">{card.percent_complete}%</span>
                </div>
              </td>
              <td className="px-4 text-right tabular-nums">{card.completed_check_items}</td>
              <td className="px-4 text-right tabular-nums">{card.remaining_check_items}</td>
              <td className="py-4 pl-4 text-right tabular-nums">{card.total_check_items}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
