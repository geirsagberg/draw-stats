import { NextResponse, type NextRequest } from "next/server";
import { requireServerEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { syncBoardForUser } from "@/lib/trello/sync";

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("secret") !== requireServerEnv("SYNC_CRON_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("board_memberships")
    .select("user_id, boards!inner(trello_board_id)")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const firstUserByBoard = new Map<string, string>();
  for (const row of data as unknown as Array<{ user_id: string; boards: { trello_board_id: string } }>) {
    if (!firstUserByBoard.has(row.boards.trello_board_id)) {
      firstUserByBoard.set(row.boards.trello_board_id, row.user_id);
    }
  }

  const results = [];
  for (const [trelloBoardId, userId] of firstUserByBoard) {
    try {
      const result = await syncBoardForUser(userId, trelloBoardId);
      results.push({ trelloBoardId, ok: true, snapshotId: result.snapshot.id });
    } catch (error) {
      results.push({
        trelloBoardId,
        ok: false,
        error: error instanceof Error ? error.message : "Sync failed"
      });
    }
  }

  return NextResponse.json({ results });
}
