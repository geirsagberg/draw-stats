"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { TextButton } from "@/components/ui";

export function TargetDateForm({
  trelloBoardId,
  targetDate
}: {
  trelloBoardId: string;
  targetDate: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(targetDate ?? "");
  const [pending, setPending] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch(`/api/boards/${trelloBoardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDate: value || null })
      });
      if (!response.ok) {
        throw new Error("Could not save target date.");
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-[0.18em] text-steel">
        Target
        <input
          type="date"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="focus-ring min-h-10 border border-ink/25 bg-paper px-3 text-sm font-semibold normal-case tracking-normal text-ink"
        />
      </label>
      <TextButton type="submit" disabled={pending} className="bg-paper text-ink hover:bg-ink hover:text-paper">
        <CalendarDays size={17} />
        Save
      </TextButton>
    </form>
  );
}
