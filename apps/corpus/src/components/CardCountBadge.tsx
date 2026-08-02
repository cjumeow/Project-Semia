type CardCountBadgeProps = {
  count: number;
};

export function CardCountBadge({ count }: CardCountBadgeProps) {
  if (count === 0) {
    return null;
  }

  return (
    <span className="shrink-0 rounded-md bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-accent">
      {count} card{count === 1 ? '' : 's'}
    </span>
  );
}
