/** Lucide chevron-right for chat context bar — smaller than snip card text chevrons. */
export function ChatContextChevron({ expanded }: { expanded: boolean }) {
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
        'h-2.5 w-2.5 shrink-0 text-text-muted transition-transform duration-150',
        expanded ? 'rotate-90' : 'rotate-0',
      ].join(' ')}
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
