import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TrelloTokenCallback } from "@/components/trello-token-callback";

describe("TrelloTokenCallback", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("stores the returned Trello token and completes the connection", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    window.history.replaceState(null, "", "/connect/trello/callback#token=trello-token-123");
    const onComplete = vi.fn();

    render(<TrelloTokenCallback onComplete={onComplete} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/trello/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "trello-token-123" })
      });
    });
    expect(window.location.hash).toBe("");
    expect(onComplete).toHaveBeenCalledOnce();
    expect(screen.queryByText("Finishing Trello connection")).not.toBeInTheDocument();
  });

  it("shows an error when Trello does not return a token", () => {
    window.history.replaceState(null, "", "/connect/trello/callback");

    render(<TrelloTokenCallback onComplete={vi.fn()} />);

    expect(screen.getByText("Trello did not return a token. Try connecting again.")).toBeInTheDocument();
  });
});
