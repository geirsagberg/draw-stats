"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { format } from "date-fns";

export type TimelinePoint = {
  id: string;
  captured_at: string;
  total_check_items: number;
  completed_check_items: number;
  remaining_check_items: number;
  ideal_remaining?: number | null;
};

type BurndownChartPoint = Omit<
  TimelinePoint,
  "total_check_items" | "completed_check_items" | "remaining_check_items"
> & {
  captured_time: number;
  total_check_items: number | null;
  completed_check_items: number | null;
  remaining_check_items: number | null;
  is_target_date?: boolean;
};

export function buildBurndownChartData(
  snapshots: TimelinePoint[],
  targetDate: string | null
): BurndownChartPoint[] {
  const data: BurndownChartPoint[] = snapshots.map((snapshot) => ({
    ...snapshot,
    captured_time: new Date(snapshot.captured_at).getTime()
  }));

  const latest = data.at(-1);
  const targetTime = targetDate ? new Date(targetDate).getTime() : NaN;

  if (latest && Number.isFinite(targetTime) && targetTime > latest.captured_time) {
    data.push({
      id: "target-date",
      captured_at: new Date(targetTime).toISOString(),
      captured_time: targetTime,
      total_check_items: null,
      completed_check_items: null,
      remaining_check_items: null,
      ideal_remaining: 0,
      is_target_date: true
    });
  }

  return data;
}

export function BurndownChart({
  snapshots,
  targetDate
}: {
  snapshots: TimelinePoint[];
  targetDate: string | null;
}) {
  const data = buildBurndownChartData(snapshots, targetDate);

  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center border-y border-ink/15 text-sm text-steel">
        Sync this board to create the first burndown point.
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 18, right: 20, bottom: 6, left: 0 }}>
          <CartesianGrid stroke="#d8d0c2" strokeDasharray="1 8" vertical={false} />
          <XAxis
            dataKey="captured_time"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => format(new Date(value), "MMM d")}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#51606a", fontSize: 12 }}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#51606a", fontSize: 12 }} width={38} />
          <Tooltip
            contentStyle={{
              border: "1px solid rgba(23,23,23,0.2)",
              borderRadius: 0,
              background: "#f6f1e8",
              color: "#171717"
            }}
            labelFormatter={(_, payload) => {
              const point = payload?.[0]?.payload as BurndownChartPoint | undefined;
              if (!point) {
                return "";
              }

              return point.is_target_date
                ? `Target ${format(new Date(point.captured_time), "PP")}`
                : format(new Date(point.captured_time), "PPpp");
            }}
          />
          <Line
            type="monotone"
            dataKey="remaining_check_items"
            name="Remaining"
            stroke="#d6422b"
            strokeWidth={3}
            dot={{ r: 4, fill: "#d6422b", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="ideal_remaining"
            name="Ideal"
            stroke="#51606a"
            strokeWidth={2}
            strokeDasharray="6 6"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
