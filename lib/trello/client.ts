import "server-only";

import { requireServerEnv } from "@/lib/env";
import type { TrelloCardLike, TrelloChecklistLike } from "@/lib/progress";

const TRELLO_API_BASE = "https://api.trello.com/1";

export type TrelloMember = {
  id: string;
  username: string | null;
  fullName: string | null;
};

export type TrelloBoard = {
  id: string;
  name: string;
  url: string | null;
  closed?: boolean;
};

export type TrelloBoardBundle = {
  board: TrelloBoard;
  cards: TrelloCardLike[];
  checklists: TrelloChecklistLike[];
};

function authorizationHeader(token: string) {
  const key = requireServerEnv("TRELLO_API_KEY");
  return `OAuth oauth_consumer_key="${key}", oauth_token="${token}"`;
}

export async function trelloFetch<T>(
  token: string,
  path: string,
  params: Record<string, string> = {}
) {
  const url = new URL(`${TRELLO_API_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: authorizationHeader(token),
      Accept: "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Trello ${response.status}: ${body || response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function fetchTrelloMember(token: string) {
  return trelloFetch<TrelloMember>(token, "/members/me", {
    fields: "id,username,fullName"
  });
}

export async function fetchTrelloBoards(token: string) {
  return trelloFetch<TrelloBoard[]>(token, "/members/me/boards", {
    fields: "id,name,url,closed",
    filter: "open"
  });
}

export async function fetchTrelloBoardBundle(token: string, trelloBoardId: string) {
  const bundle = await trelloFetch<TrelloBoard & {
    cards: TrelloCardLike[];
    checklists: TrelloChecklistLike[];
  }>(token, `/boards/${trelloBoardId}`, {
    fields: "id,name,url,closed",
    cards: "open",
    card_fields: "id,name,url,idList,closed,pos,dateLastActivity",
    checklists: "all",
    checklist_fields: "id,name,idBoard,idCard,pos",
    checkItem_fields: "id,name,state,pos,idChecklist"
  });

  return {
    board: {
      id: bundle.id,
      name: bundle.name,
      url: bundle.url ?? null,
      closed: bundle.closed
    },
    cards: bundle.cards ?? [],
    checklists: bundle.checklists ?? []
  } satisfies TrelloBoardBundle;
}
