import { useState } from 'react';
import type { SnippetTriageStatus } from '@semia/shared';

export type SaasThemePane =
  | 'inbox-source'
  | 'snippet'
  | 'my-cards'
  | 'practice-snippets'
  | 'practice-cards';

export type SnippetBadge =
  | { kind: 'dueNow' }
  | { kind: 'cards'; count: number }
  | { kind: 'schedule'; label: string };

export type SaasThemePrototypeState = {
  pane: SaasThemePane;
  selectedSnippetId: string;
  contextExpanded: boolean;
  triageBySnippetId: Record<string, SnippetTriageStatus>;
  selectPane: (pane: SaasThemePane) => void;
  selectSnippet: (id: string) => void;
  toggleContext: () => void;
  markSnippet: (id: string, status: SnippetTriageStatus) => void;
};

const SNIPPETS = [
  {
    id: 's1',
    text: 'on-site assembly',
    time: '1:44',
    badge: { kind: 'dueNow' } as const,
  },
  {
    id: 's2',
    text: 'naval vessels',
    time: '1:44',
    badge: { kind: 'cards', count: 2 } as const,
  },
  {
    id: 's3',
    text: 'look forward to',
    time: '6:45',
    badge: { kind: 'schedule', label: '3d' } as const,
  },
] as const;

export function useSaasThemePrototypeState(): SaasThemePrototypeState {
  const [pane, setPane] = useState<SaasThemePane>('snippet');
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>('s1');
  const [contextExpanded, setContextExpanded] = useState(false);
  const [triageBySnippetId, setTriageBySnippetId] = useState<Record<string, SnippetTriageStatus>>(
    () => Object.fromEntries(SNIPPETS.map((s) => [s.id, 'pending' as const])),
  );

  return {
    pane,
    selectedSnippetId,
    contextExpanded,
    triageBySnippetId,
    selectPane: setPane,
    selectSnippet: (id) => {
      setSelectedSnippetId(id);
      setPane('snippet');
    },
    toggleContext: () => setContextExpanded((value) => !value),
    markSnippet: (id, status) => {
      setTriageBySnippetId((prev) => ({ ...prev, [id]: status }));
    },
  };
}

export function describeSaasThemeState(state: SaasThemePrototypeState): string {
  const snippet = SNIPPETS.find((s) => s.id === state.selectedSnippetId)?.text ?? '?';
  const triage = state.triageBySnippetId[state.selectedSnippetId] ?? 'pending';
  return `pane=${state.pane} · snippet="${snippet}" (${triage}) · context=${state.contextExpanded ? 'open' : 'collapsed'}`;
}

export { SNIPPETS };
