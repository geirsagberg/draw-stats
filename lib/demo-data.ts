import { subDays } from "date-fns";
import { idealRemainingAt } from "@/lib/progress";

const now = new Date("2026-06-07T10:00:00.000Z");

export const demoBoard = {
  id: "demo-board",
  trello_board_id: "demo",
  name: "Launch board",
  url: "https://trello.com",
  target_date: "2026-06-21",
  last_synced_at: now.toISOString(),
  last_sync_status: "ok" as const,
  last_sync_error: null
};

export const demoSnapshots = [
  { captured_at: subDays(now, 10).toISOString(), remaining_check_items: 42, completed_check_items: 8, total_check_items: 50 },
  { captured_at: subDays(now, 8).toISOString(), remaining_check_items: 38, completed_check_items: 12, total_check_items: 50 },
  { captured_at: subDays(now, 6).toISOString(), remaining_check_items: 31, completed_check_items: 19, total_check_items: 50 },
  { captured_at: subDays(now, 4).toISOString(), remaining_check_items: 25, completed_check_items: 25, total_check_items: 50 },
  { captured_at: subDays(now, 2).toISOString(), remaining_check_items: 19, completed_check_items: 31, total_check_items: 50 },
  { captured_at: now.toISOString(), remaining_check_items: 14, completed_check_items: 36, total_check_items: 50 }
].map((snapshot, index, snapshots) => ({
  ...snapshot,
  id: `demo-snapshot-${index}`,
  board_id: demoBoard.id,
  ideal_remaining: idealRemainingAt(
    snapshots[0].remaining_check_items,
    snapshots[0].captured_at,
    demoBoard.target_date,
    snapshot.captured_at
  )
}));

export const demoCards = [
  {
    id: "card-1",
    name: "Instrument onboarding funnel",
    url: "https://trello.com",
    remaining_check_items: 2,
    completed_check_items: 9,
    total_check_items: 11,
    percent_complete: 82,
    last_activity_at: subDays(now, 1).toISOString()
  },
  {
    id: "card-2",
    name: "Design board-level burndown",
    url: "https://trello.com",
    remaining_check_items: 3,
    completed_check_items: 7,
    total_check_items: 10,
    percent_complete: 70,
    last_activity_at: subDays(now, 2).toISOString()
  },
  {
    id: "card-3",
    name: "Harden Trello polling errors",
    url: "https://trello.com",
    remaining_check_items: 6,
    completed_check_items: 4,
    total_check_items: 10,
    percent_complete: 40,
    last_activity_at: subDays(now, 3).toISOString()
  },
  {
    id: "card-4",
    name: "Ship first shared dashboard",
    url: "https://trello.com",
    remaining_check_items: 3,
    completed_check_items: 16,
    total_check_items: 19,
    percent_complete: 84,
    last_activity_at: subDays(now, 1).toISOString()
  }
];
