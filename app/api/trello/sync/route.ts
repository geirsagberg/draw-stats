import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { syncBoardForUser } from "@/lib/trello/sync";

const syncSchema = z.object({
  trelloBoardId: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const { user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = syncSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid sync payload" }, { status: 400 });
  }

  try {
    const result = await syncBoardForUser(user.id, parsed.data.trelloBoardId);
    return NextResponse.json({
      board: result.board,
      snapshot: result.snapshot,
      progress: {
        totalCheckItems: result.progress.totalCheckItems,
        completedCheckItems: result.progress.completedCheckItems,
        remainingCheckItems: result.progress.remainingCheckItems
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
