import { getPublicEnv, requireServerEnv } from "@/lib/env";

export function buildTrelloAuthorizeUrl() {
  const appUrl = getPublicEnv().appUrl;
  const url = new URL("https://trello.com/1/authorize");
  url.searchParams.set("expiration", "never");
  url.searchParams.set("name", "Draw Stats");
  url.searchParams.set("scope", "read");
  url.searchParams.set("response_type", "token");
  url.searchParams.set("key", requireServerEnv("TRELLO_API_KEY"));
  url.searchParams.set("return_url", `${appUrl}/connect/trello/callback`);
  return url.toString();
}
