import { describe, expect, it } from "vitest";
import { buildBurndownChartData, type TimelinePoint } from "@/components/burndown-chart";

const snapshots: TimelinePoint[] = [
  {
    id: "snapshot-1",
    captured_at: "2026-06-01T10:00:00.000Z",
    total_check_items: 20,
    completed_check_items: 4,
    remaining_check_items: 16,
    ideal_remaining: 16
  },
  {
    id: "snapshot-2",
    captured_at: "2026-06-08T10:00:00.000Z",
    total_check_items: 20,
    completed_check_items: 10,
    remaining_check_items: 10,
    ideal_remaining: 8
  }
];

describe("buildBurndownChartData", () => {
  it("extends the chart data to a later target date", () => {
    const data = buildBurndownChartData(snapshots, "2026-06-21");

    expect(data).toHaveLength(3);
    expect(data.at(-1)).toMatchObject({
      id: "target-date",
      remaining_check_items: null,
      ideal_remaining: 0,
      is_target_date: true
    });
    expect(data.at(-1)?.captured_time).toBeGreaterThan(data.at(-2)?.captured_time ?? 0);
  });

  it("keeps only real snapshots when the target date does not extend the range", () => {
    expect(buildBurndownChartData(snapshots, null)).toHaveLength(2);
    expect(buildBurndownChartData(snapshots, "2026-06-07")).toHaveLength(2);
  });
});
