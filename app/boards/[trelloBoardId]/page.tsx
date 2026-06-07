import { notFound, redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth-screen";
import { Dashboard } from "@/components/dashboard";
import { hasSupabaseEnv } from "@/lib/env";
import { getCardsForUser, getTimelineForUser } from "@/lib/data";
import { requireUser } from "@/lib/supabase/server";
import { listAccessibleBoards } from "@/lib/trello/sync";

export default async function BoardPage({
  params
}: {
  params: Promise<{ trelloBoardId: string }>;
}) {
  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const { user } = await requireUser();
  if (!user) {
    return <AuthScreen />;
  }

  const { trelloBoardId } = await params;
  const [boards, timeline, cards] = await Promise.all([
    listAccessibleBoards(user.id).catch(() => []),
    getTimelineForUser(user.id, trelloBoardId),
    getCardsForUser(user.id, trelloBoardId)
  ]);

  if (!timeline || !cards) {
    notFound();
  }

  return (
    <Dashboard
      boards={boards}
      board={timeline.board}
      snapshots={timeline.snapshots}
      cards={cards.cards}
      trelloConnected
    />
  );
}
