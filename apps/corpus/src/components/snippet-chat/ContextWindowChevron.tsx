/** Matches NoteCard ContextWindowSection chevron (▸ collapsed / ▾ expanded). */
export function ContextWindowChevron({ expanded }: { expanded: boolean }) {
  return (
    <span className="text-base leading-none text-text-muted" aria-hidden>
      {expanded ? '▾' : '▸'}
    </span>
  );
}
