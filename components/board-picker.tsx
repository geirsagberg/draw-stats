"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Board = Database["public"]["Tables"]["boards"]["Row"];

export function BoardPicker({
  boards,
  selectedBoardId
}: {
  boards: Board[];
  selectedBoardId?: string;
}) {
  const router = useRouter();

  return (
    <label className="relative inline-flex min-w-64 items-center">
      <span className="sr-only">Select board</span>
      <select
        value={selectedBoardId ?? ""}
        onChange={(event) => {
          if (event.target.value) {
            router.push(`/boards/${event.target.value}`);
          }
        }}
        className="focus-ring min-h-10 w-full appearance-none border border-ink/25 bg-paper px-3 pr-10 text-sm font-semibold"
      >
        <option value="">Choose a board</option>
        {boards.map((board) => (
          <option key={board.id} value={board.trello_board_id}>
            {board.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 text-steel" size={16} />
    </label>
  );
}
