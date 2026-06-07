"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { IconButton } from "@/components/ui";

export function SyncButton({ trelloBoardId }: { trelloBoardId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function sync() {
    setPending(true);
    try {
      const response = await fetch("/api/trello/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trelloBoardId })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Sync failed.");
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <IconButton label="Sync board" onClick={sync} disabled={pending}>
      <RefreshCw size={18} className={pending ? "animate-spin" : ""} />
    </IconButton>
  );
}
