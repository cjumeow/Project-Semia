/** Lucide chevron-right — rotates 90° to point down when expanded. */
export function ChevronToggleIcon({
  expanded,
  className = 'h-4 w-4',
}: {
  expanded: boolean;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={[
        'shrink-0 text-text-muted transition-transform duration-150',
        expanded ? 'rotate-90' : 'rotate-0',
        className,
      ].join(' ')}
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
