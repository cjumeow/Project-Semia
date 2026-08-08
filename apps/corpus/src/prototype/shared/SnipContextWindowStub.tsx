import { useState } from 'react';
import { ChevronToggleIcon } from '../shared/ChevronToggleIcon';

/** Snip card context window row — same chevron as chat context bar. */
export function SnipContextWindowStub() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="semia-context-collapsed overflow-hidden rounded-lg border border-border">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-black/[0.03]"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="text-sm font-medium text-text">Context window</span>
        <ChevronToggleIcon expanded={expanded} />
      </button>
      {expanded ? (
        <div className="semia-context-body border-t border-border px-4 py-3 text-sm text-text-secondary">
          Bilingual context preview — same chevron as chat Context bar.
        </div>
      ) : null}
    </div>
  );
}
