"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

type TrelloTokenCallbackProps = {
  onComplete?: () => void;
};

function redirectHome() {
  window.location.replace("/");
}

export function TrelloTokenCallback({ onComplete = redirectHome }: TrelloTokenCallbackProps = {}) {
  const [message, setMessage] = useState("Finishing Trello connection");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = params.get("token");

    if (!token) {
      setMessage("Trello did not return a token. Try connecting again.");
      return;
    }

    fetch("/api/trello/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? "Unable to store Trello token.");
        }
        window.history.replaceState(null, "", "/connect/trello/callback");
        setMessage("Trello connected. Redirecting...");
        onComplete();
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : "Unable to connect Trello.");
      });
  }, [onComplete]);

  return (
    <div className="flex items-center gap-3 text-sm text-steel">
      <LoaderCircle size={18} className="animate-spin" />
      {message}
    </div>
  );
}
