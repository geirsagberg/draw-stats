import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CardProgressTable } from "@/components/card-progress-table";

const cards = [
  {
    id: "a",
    name: "Beta card",
    url: null,
    total_check_items: 10,
    completed_check_items: 4,
    remaining_check_items: 6,
    percent_complete: 40,
    last_activity_at: null
  },
  {
    id: "b",
    name: "Alpha card",
    url: null,
    total_check_items: 10,
    completed_check_items: 9,
    remaining_check_items: 1,
    percent_complete: 90,
    last_activity_at: null
  }
];

describe("CardProgressTable", () => {
  it("sorts by remaining work by default", () => {
    render(<CardProgressTable cards={cards} />);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Beta card");
    expect(rows[2]).toHaveTextContent("Alpha card");
  });

  it("allows sorting by card name", async () => {
    render(<CardProgressTable cards={cards} />);

    await userEvent.selectOptions(screen.getByRole("combobox"), "name");

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Alpha card");
    expect(rows[2]).toHaveTextContent("Beta card");
  });

  it("shows the empty state", () => {
    render(<CardProgressTable cards={[]} />);

    expect(screen.getByText("No synced cards yet.")).toBeInTheDocument();
  });
});
