import "server-only";

import { decryptToken } from "@/lib/crypto";
import { requireServerEnv } from "@/lib/env";
import { calculateBoardProgress } from "@/lib/progress";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { fetchTrelloBoardBundle, fetchTrelloBoards } from "@/lib/trello/client";

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;
type BoardRow = Database["public"]["Tables"]["boards"]["Row"];

export async function getUserTrelloToken(userId: string, admin = createSupabaseAdminClient()) {
  const { data, error } = await admin
    .from("trello_accounts")
    .select("encrypted_token,token_nonce,token_tag")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Connect Trello before syncing a board.");
  }

  return decryptToken(
    {
      encrypted: data.encrypted_token,
      nonce: data.token_nonce,
      tag: data.token_tag
    },
    requireServerEnv("TRELLO_TOKEN_SECRET")
  );
}

async function upsertBoardMembership(
  admin: AdminClient,
  userId: string,
  trelloBoardId: string,
  name: string,
  url: string | null
) {
  const { data: board, error: boardError } = await admin
    .from("boards")
    .upsert(
      {
        trello_board_id: trelloBoardId,
        name,
        url,
        updated_at: new Date().toISOString()
      },
      { onConflict: "trello_board_id" }
    )
    .select("*")
    .single();

  if (boardError || !board) {
    throw new Error(boardError?.message ?? "Unable to save board.");
  }

  const { error: membershipError } = await admin.from("board_memberships").upsert({
    board_id: board.id,
    user_id: userId
  });

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  return board;
}

export async function listAccessibleBoards(userId: string) {
  const admin = createSupabaseAdminClient();
  const token = await getUserTrelloToken(userId, admin);
  const trelloBoards = await fetchTrelloBoards(token);

  const boards = await Promise.all(
    trelloBoards
      .filter((board) => !board.closed)
      .map((board) => upsertBoardMembership(admin, userId, board.id, board.name, board.url ?? null))
  );

  return boards.sort((a, b) => a.name.localeCompare(b.name));
}

export async function syncBoardForUser(userId: string, trelloBoardId: string) {
  const admin = createSupabaseAdminClient();
  const token = await getUserTrelloToken(userId, admin);
  const bundle = await fetchTrelloBoardBundle(token, trelloBoardId);
  const board = await upsertBoardMembership(
    admin,
    userId,
    bundle.board.id,
    bundle.board.name,
    bundle.board.url ?? null
  );

  await admin
    .from("boards")
    .update({ last_sync_status: "syncing", last_sync_error: null })
    .eq("id", board.id);

  try {
    const progress = calculateBoardProgress(bundle.cards, bundle.checklists);
    const cardRows = progress.cards.map((card) => ({
      board_id: board.id,
      trello_card_id: card.trelloCardId,
      name: card.name,
      url: card.url,
      list_id: card.listId,
      closed: card.closed,
      pos: card.pos,
      total_check_items: card.totalCheckItems,
      completed_check_items: card.completedCheckItems,
      remaining_check_items: card.remainingCheckItems,
      percent_complete: card.percentComplete,
      last_activity_at: card.lastActivityAt,
      updated_at: new Date().toISOString()
    }));

    if (cardRows.length > 0) {
      const { error: cardsError } = await admin
        .from("trello_cards")
        .upsert(cardRows, { onConflict: "board_id,trello_card_id" });
      if (cardsError) {
        throw new Error(cardsError.message);
      }
    }

    const { data: existingCards, error: cardFetchError } = await admin
      .from("trello_cards")
      .select("id,trello_card_id")
      .eq("board_id", board.id);
    if (cardFetchError) {
      throw new Error(cardFetchError.message);
    }

    const cardIdByTrelloId = new Map(existingCards.map((card) => [card.trello_card_id, card.id]));
    const capturedAt = new Date().toISOString();
    const { data: snapshot, error: snapshotError } = await admin
      .from("board_snapshots")
      .insert({
        board_id: board.id,
        captured_at: capturedAt,
        total_check_items: progress.totalCheckItems,
        completed_check_items: progress.completedCheckItems,
        remaining_check_items: progress.remainingCheckItems
      })
      .select("*")
      .single();

    if (snapshotError || !snapshot) {
      throw new Error(snapshotError?.message ?? "Unable to create board snapshot.");
    }

    const cardSnapshotRows = progress.cards
      .map((card) => {
        const cardId = cardIdByTrelloId.get(card.trelloCardId);
        if (!cardId) {
          return null;
        }
        return {
          board_snapshot_id: snapshot.id,
          board_id: board.id,
          card_id: cardId,
          captured_at: capturedAt,
          total_check_items: card.totalCheckItems,
          completed_check_items: card.completedCheckItems,
          remaining_check_items: card.remainingCheckItems,
          percent_complete: card.percentComplete
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    if (cardSnapshotRows.length > 0) {
      const { error: cardSnapshotError } = await admin.from("card_snapshots").insert(cardSnapshotRows);
      if (cardSnapshotError) {
        throw new Error(cardSnapshotError.message);
      }
    }

    const { data: updatedBoard, error: updateError } = await admin
      .from("boards")
      .update({
        name: bundle.board.name,
        url: bundle.board.url,
        last_synced_at: capturedAt,
        last_sync_status: "ok",
        last_sync_error: null,
        updated_at: capturedAt
      })
      .eq("id", board.id)
      .select("*")
      .single();

    if (updateError || !updatedBoard) {
      throw new Error(updateError?.message ?? "Unable to mark sync complete.");
    }

    return { board: updatedBoard, snapshot, progress };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync failure";
    await admin
      .from("boards")
      .update({ last_sync_status: "error", last_sync_error: message })
      .eq("id", board.id);
    throw error;
  }
}

export async function getBoardForUser(userId: string, trelloBoardId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("boards")
    .select("*, board_memberships!inner(user_id)")
    .eq("trello_board_id", trelloBoardId)
    .eq("board_memberships.user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as BoardRow;
}
