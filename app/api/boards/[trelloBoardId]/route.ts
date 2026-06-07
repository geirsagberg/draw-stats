import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient, requireUser } from "@/lib/supabase/server";
import { getBoardForUser } from "@/lib/trello/sync";

const patchSchema = z.object({
  targetDate: z.string().date().nullable()
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ trelloBoardId: string }> }
) {
  const { user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid target date" }, { status: 400 });
  }

  const { trelloBoardId } = await params;
  const board = await getBoardForUser(user.id, trelloBoardId);
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("boards")
    .update({ target_date: parsed.data.targetDate, updated_at: new Date().toISOString() })
    .eq("id", board.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ board: data });
}
