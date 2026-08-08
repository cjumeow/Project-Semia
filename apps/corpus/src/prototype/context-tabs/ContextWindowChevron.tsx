import { ChevronToggleIcon } from '../shared/ChevronToggleIcon';

/** Shared chevron for snip context window + chat context bar prototypes. */
export function ContextWindowChevron({ expanded }: { expanded: boolean }) {
  return <ChevronToggleIcon expanded={expanded} />;
}
