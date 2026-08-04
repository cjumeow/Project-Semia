import { cardCountBadgeClass } from '../utils/semiaUi';

type CardCountBadgeProps = {
  count: number;
};

export function CardCountBadge({ count }: CardCountBadgeProps) {
  if (count === 0) {
    return null;
  }

  return (
    <span className={cardCountBadgeClass()}>
      {count} card{count === 1 ? '' : 's'}
    </span>
  );
}
