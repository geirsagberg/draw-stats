export type TrelloCheckItemLike = {
  id: string;
  state: "complete" | "incomplete" | string;
};

export type TrelloChecklistLike = {
  id: string;
  idCard: string;
  checkItems?: TrelloCheckItemLike[];
};

export type TrelloCardLike = {
  id: string;
  name: string;
  url?: string | null;
  idList?: string | null;
  closed?: boolean;
  pos?: number | null;
  dateLastActivity?: string | null;
};

export type CardProgress = {
  trelloCardId: string;
  name: string;
  url: string | null;
  listId: string | null;
  closed: boolean;
  pos: number | null;
  totalCheckItems: number;
  completedCheckItems: number;
  remainingCheckItems: number;
  percentComplete: number;
  lastActivityAt: string | null;
};

export type BoardProgress = {
  totalCheckItems: number;
  completedCheckItems: number;
  remainingCheckItems: number;
  cards: CardProgress[];
};

export function calculateCardProgress(card: TrelloCardLike, checklists: TrelloChecklistLike[]): CardProgress {
  const cardCheckItems = checklists
    .filter((checklist) => checklist.idCard === card.id)
    .flatMap((checklist) => checklist.checkItems ?? []);
  const totalCheckItems = cardCheckItems.length;
  const completedCheckItems = cardCheckItems.filter((item) => item.state === "complete").length;
  const remainingCheckItems = totalCheckItems - completedCheckItems;
  const percentComplete =
    totalCheckItems === 0 ? 0 : Math.round((completedCheckItems / totalCheckItems) * 100);

  return {
    trelloCardId: card.id,
    name: card.name,
    url: card.url ?? null,
    listId: card.idList ?? null,
    closed: Boolean(card.closed),
    pos: card.pos ?? null,
    totalCheckItems,
    completedCheckItems,
    remainingCheckItems,
    percentComplete,
    lastActivityAt: card.dateLastActivity ?? null
  };
}

export function calculateBoardProgress(
  cards: TrelloCardLike[],
  checklists: TrelloChecklistLike[]
): BoardProgress {
  const openCards = cards.filter((card) => !card.closed);
  const cardProgress = openCards.map((card) => calculateCardProgress(card, checklists));

  return {
    totalCheckItems: cardProgress.reduce((sum, card) => sum + card.totalCheckItems, 0),
    completedCheckItems: cardProgress.reduce((sum, card) => sum + card.completedCheckItems, 0),
    remainingCheckItems: cardProgress.reduce((sum, card) => sum + card.remainingCheckItems, 0),
    cards: cardProgress
  };
}

export function idealRemainingAt(
  firstRemaining: number,
  firstCapturedAt: string,
  targetDate: string | null,
  capturedAt: string
) {
  if (!targetDate) {
    return null;
  }

  const start = new Date(firstCapturedAt).getTime();
  const target = new Date(targetDate).getTime();
  const current = new Date(capturedAt).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(target) || target <= start) {
    return null;
  }

  const elapsed = Math.min(Math.max(current - start, 0), target - start);
  const ratio = elapsed / (target - start);
  return Math.max(0, Math.round(firstRemaining * (1 - ratio)));
}
