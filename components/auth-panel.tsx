"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { TextButton } from "@/components/ui";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    setPending(false);
    setMessage(error ? error.message : "Check your email for the sign-in link.");
  }

  return (
    <form onSubmit={signIn} className="flex w-full flex-col gap-3 sm:max-w-md">
      <label className="text-xs font-bold uppercase tracking-[0.18em] text-steel" htmlFor="email">
        Email
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="focus-ring min-h-11 flex-1 border border-ink/25 bg-white/70 px-3 text-base"
          placeholder="you@company.com"
        />
        <TextButton type="submit" disabled={pending}>
          <LogIn size={18} />
          {pending ? "Sending" : "Sign in"}
        </TextButton>
      </div>
      {message ? <p className="text-sm text-steel">{message}</p> : null}
    </form>
  );
}
