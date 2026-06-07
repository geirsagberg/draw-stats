"use client";

import { useState } from "react";
import { KeyRound, LogIn } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { TextButton } from "@/components/ui";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"email" | "google" | null>(null);

  async function signInWithGoogle() {
    setPendingAction("google");
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      setPendingAction(null);
      setMessage(error.message);
    }
  }

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("email");
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    setPendingAction(null);
    setMessage(error ? error.message : "Check your email for the sign-in link.");
  }

  return (
    <div className="flex w-full flex-col gap-4 sm:max-w-md">
      <TextButton
        type="button"
        onClick={signInWithGoogle}
        disabled={Boolean(pendingAction)}
        className="w-full justify-center border-ink/25 bg-white text-ink hover:bg-paper"
      >
        <span className="flex size-5 items-center justify-center font-bold">G</span>
        {pendingAction === "google" ? "Opening Google" : "Sign in with Google"}
      </TextButton>

      <div className="flex items-center gap-3 text-xs font-bold uppercase text-steel">
        <span className="h-px flex-1 bg-ink/15" />
        Email fallback
        <span className="h-px flex-1 bg-ink/15" />
      </div>

      <form onSubmit={signIn} className="flex flex-col gap-3">
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
          <TextButton type="submit" disabled={Boolean(pendingAction)}>
            {pendingAction === "email" ? <KeyRound size={18} /> : <LogIn size={18} />}
            {pendingAction === "email" ? "Sending" : "Sign in"}
          </TextButton>
        </div>
        {message ? <p className="text-sm text-steel">{message}</p> : null}
      </form>
    </div>
  );
}
