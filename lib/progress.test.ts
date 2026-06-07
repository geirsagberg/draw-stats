import { describe, expect, it } from "vitest";
import { calculateBoardProgress, idealRemainingAt } from "@/lib/progress";

describe("calculateBoardProgress", () => {
  it("returns zero progress for an empty board", () => {
    expect(calculateBoardProgress([], [])).toEqual({
      totalCheckItems: 0,
      completedCheckItems: 0,
      remainingCheckItems: 0,
      cards: []
    });
  });

  it("keeps cards with no checklist at zero percent", () => {
    const progress = calculateBoardProgress([{ id: "card-1", name: "No checklist" }], []);

    expect(progress.cards[0]).toMatchObject({
      totalCheckItems: 0,
      completedCheckItems: 0,
      remainingCheckItems: 0,
      percentComplete: 0
    });
  });

  it("calculates mixed complete and incomplete checklist items across multiple checklists", () => {
    const progress = calculateBoardProgress(
      [{ id: "card-1", name: "Instrument tracking" }],
      [
        {
          id: "checklist-1",
          idCard: "card-1",
          checkItems: [
            { id: "item-1", state: "complete" },
            { id: "item-2", state: "incomplete" }
          ]
        },
        {
          id: "checklist-2",
          idCard: "card-1",
          checkItems: [
            { id: "item-3", state: "complete" },
            { id: "item-4", state: "complete" }
          ]
        }
      ]
    );

    expect(progress).toMatchObject({
      totalCheckItems: 4,
      completedCheckItems: 3,
      remainingCheckItems: 1
    });
    expect(progress.cards[0]).toMatchObject({
      percentComplete: 75,
      remainingCheckItems: 1
    });
  });

  it("excludes archived or closed cards from the board burndown", () => {
    const progress = calculateBoardProgress(
      [
        { id: "open-card", name: "Open" },
        { id: "closed-card", name: "Closed", closed: true }
      ],
      [
        {
          id: "checklist-1",
          idCard: "open-card",
          checkItems: [{ id: "item-1", state: "incomplete" }]
        },
        {
          id: "checklist-2",
          idCard: "closed-card",
          checkItems: [{ id: "item-2", state: "incomplete" }]
        }
      ]
    );

    expect(progress.cards).toHaveLength(1);
    expect(progress.totalCheckItems).toBe(1);
    expect(progress.remainingCheckItems).toBe(1);
  });
});

describe("idealRemainingAt", () => {
  it("draws a linear ideal line between first snapshot and target date", () => {
    expect(
      idealRemainingAt(40, "2026-06-01T00:00:00.000Z", "2026-06-11", "2026-06-06T00:00:00.000Z")
    ).toBe(20);
  });

  it("omits the ideal line when there is no usable target date", () => {
    expect(idealRemainingAt(40, "2026-06-01T00:00:00.000Z", null, "2026-06-06T00:00:00.000Z")).toBeNull();
  });
});
