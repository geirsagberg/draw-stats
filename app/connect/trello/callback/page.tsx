import { TrelloTokenCallback } from "@/components/trello-token-callback";
import { Panel, Shell } from "@/components/ui";

export default function TrelloCallbackPage() {
  return (
    <Shell>
      <Panel className="mt-10 p-6">
        <h1 className="mb-4 font-display text-4xl">Connecting Trello</h1>
        <TrelloTokenCallback />
      </Panel>
    </Shell>
  );
}
