import "server-only";

import { idealRemainingAt } from "@/lib/progress";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getBoardForUser } from "@/lib/trello/sync";

export async function getTimelineForUser(userId: string, trelloBoardId: string) {
  const admin = createSupabaseAdminClient();
  const board = await getBoardForUser(userId, trelloBoardId);
  if (!board) {
    return null;
  }

  const { data, error } = await admin
    .from("board_snapshots")
    .select("*")
    .eq("board_id", board.id)
    .order("captured_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const first = data[0];

  return {
    board,
    snapshots: data.map((snapshot) => ({
      ...snapshot,
      ideal_remaining: first
        ? idealRemainingAt(
            first.remaining_check_items,
            first.captured_at,
            board.target_date,
            snapshot.captured_at
          )
        : null
    }))
  };
}

export async function getCardsForUser(userId: string, trelloBoardId: string) {
  const admin = createSupabaseAdminClient();
  const board = await getBoardForUser(userId, trelloBoardId);
  if (!board) {
    return null;
  }

  const { data, error } = await admin
    .from("trello_cards")
    .select("*")
    .eq("board_id", board.id)
    .order("remaining_check_items", { ascending: false })
    .order("pos", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return { board, cards: data };
}
