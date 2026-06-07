"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { TextButton } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setPending(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setPending(false);
      setError(signOutError.message);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <TextButton
        type="button"
        onClick={signOut}
        disabled={pending}
        className="border-ink/25 bg-paper text-ink hover:bg-ink hover:text-paper"
      >
        <LogOut size={17} />
        {pending ? "Signing out" : "Sign out"}
      </TextButton>
      {error ? <p className="max-w-40 text-xs font-semibold text-signal">{error}</p> : null}
    </div>
  );
}
