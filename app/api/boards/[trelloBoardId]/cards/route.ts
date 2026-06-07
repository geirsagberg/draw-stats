import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { getCardsForUser } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ trelloBoardId: string }> }
) {
  const { user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { trelloBoardId } = await params;
  const data = await getCardsForUser(user.id, trelloBoardId);
  if (!data) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
