import {
  snippetTextFromContextSwitchNotice,
  truncateContextSwitchLabel,
} from './contextSwitchLineLabel';

type SnippetChatContextSwitchLineProps = {
  content: string;
};

export function SnippetChatContextSwitchLine({
  content,
}: SnippetChatContextSwitchLineProps) {
  const snippetText = snippetTextFromContextSwitchNotice(content);
  const label = truncateContextSwitchLabel(snippetText ?? content);

  return (
    <li className="flex items-center gap-2 py-1.5" role="status">
      <span className="h-px flex-1 bg-border" aria-hidden />
      <span className="shrink-0 text-xs text-text-muted">
        切換至 &quot;{label}&quot;
      </span>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </li>
  );
}
