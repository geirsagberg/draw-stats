import { AuthScreen } from "@/components/auth-screen";
import { Dashboard } from "@/components/dashboard";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseAdminClient, requireUser } from "@/lib/supabase/server";
import { demoBoard, demoCards, demoSnapshots } from "@/lib/demo-data";
import { listAccessibleBoards } from "@/lib/trello/sync";
import { redirect } from "next/navigation";

export default async function Home() {
  if (!hasSupabaseEnv()) {
    return (
      <Dashboard
        boards={[demoBoard as never]}
        board={demoBoard}
        snapshots={demoSnapshots}
        cards={demoCards}
        trelloConnected
        demo
      />
    );
  }

  const { user } = await requireUser();
  if (!user) {
    return <AuthScreen />;
  }

  const admin = createSupabaseAdminClient();
  const { data: account } = await admin
    .from("trello_accounts")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!account) {
    return (
      <Dashboard
        boards={[]}
        board={{
          trello_board_id: "none",
          name: "No board connected",
          last_sync_status: "idle",
          last_sync_error: null,
          last_synced_at: null
        }}
        snapshots={[]}
        cards={[]}
        trelloConnected={false}
      />
    );
  }

  const boards = await listAccessibleBoards(user.id).catch(() => []);
  const firstBoard = boards[0];

  if (firstBoard) {
    redirect(`/boards/${firstBoard.trello_board_id}`);
  }

  return (
    <Dashboard
      boards={boards}
      board={
        firstBoard ?? {
          trello_board_id: "none",
          name: "No board available",
          last_sync_status: "idle",
          last_sync_error: null,
          last_synced_at: null
        }
      }
      snapshots={[]}
      cards={[]}
      trelloConnected
    />
  );
}
