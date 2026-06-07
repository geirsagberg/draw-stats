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

export function BurndownChart({ snapshots }: { snapshots: TimelinePoint[] }) {
  const data = snapshots.map((snapshot) => ({
    ...snapshot,
    label: format(new Date(snapshot.captured_at), "MMM d")
  }));

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
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#51606a", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#51606a", fontSize: 12 }} width={38} />
          <Tooltip
            contentStyle={{
              border: "1px solid rgba(23,23,23,0.2)",
              borderRadius: 0,
              background: "#f6f1e8",
              color: "#171717"
            }}
            labelFormatter={(_, payload) => {
              const capturedAt = payload?.[0]?.payload?.captured_at;
              return capturedAt ? format(new Date(capturedAt), "PPpp") : "";
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
