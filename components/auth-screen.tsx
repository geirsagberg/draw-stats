import { ChartNoAxesCombined } from "lucide-react";
import { AuthPanel } from "@/components/auth-panel";
import { Panel, Shell } from "@/components/ui";

export function AuthScreen() {
  return (
    <Shell>
      <header className="border-b border-ink/20 pb-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-signal">Draw Stats</p>
        <h1 className="font-display text-5xl leading-none sm:text-6xl">Measure the board by what is still unchecked.</h1>
      </header>
      <Panel className="mt-8 grid gap-8 p-6 lg:grid-cols-[1fr_420px]">
        <div>
          <ChartNoAxesCombined size={28} />
          <h2 className="mt-6 font-display text-3xl">Sign in to connect Trello.</h2>
          <p className="mt-3 max-w-2xl text-steel">
            Draw Stats stores checklist snapshots per board so teams can see the burn-down trend from the first sync onward.
          </p>
        </div>
        <div className="border-t border-ink/15 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <AuthPanel />
        </div>
      </Panel>
    </Shell>
  );
}
