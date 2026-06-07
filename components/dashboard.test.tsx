import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dashboard } from "@/components/dashboard";
import { demoBoard, demoCards, demoSnapshots } from "@/lib/demo-data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn()
  })
}));

describe("Dashboard", () => {
  it("shows a Trello connection empty state", () => {
    render(
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

    expect(screen.getByText("Start with a board connection.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /connect trello/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("renders demo burndown metrics and card progress", () => {
    render(
      <Dashboard
        boards={[demoBoard as never]}
        board={demoBoard}
        snapshots={demoSnapshots}
        cards={demoCards}
        trelloConnected
        demo
      />
    );

    expect(screen.getByText("Demo mode: add Supabase and Trello environment variables to enable live auth and syncing.")).toBeInTheDocument();
    expect(screen.getAllByText("Launch board")).toHaveLength(2);
    expect(screen.getByText("Instrument onboarding funnel")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sign out/i })).not.toBeInTheDocument();
  });
});
