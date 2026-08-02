import type { LanguageCard } from '@semia/shared';
import { STAGE_LABELS, type ReviewStage } from '@semia/shared';

export function cardReviewScheduleMeta(
  card: LanguageCard,
  now: string = new Date().toISOString(),
): { stageLabel: string; overdueDays: number | null } {
  const stage = (card.reviewStage ?? 0) as ReviewStage;
  const overdueDays =
    card.dueAt && card.dueAt < now
      ? Math.floor(
          (Date.parse(now) - Date.parse(card.dueAt)) / (24 * 60 * 60 * 1000),
        )
      : null;

  return {
    stageLabel: STAGE_LABELS[stage],
    overdueDays,
  };
}
