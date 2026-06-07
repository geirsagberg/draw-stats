import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { listAccessibleBoards } from "@/lib/trello/sync";

export async function GET() {
  const { user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const boards = await listAccessibleBoards(user.id);
    return NextResponse.json({ boards });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to list boards" },
      { status: 409 }
    );
  }
}
