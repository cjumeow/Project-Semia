export type SnippetTriageStatus = 'pending' | 'review' | 'mastered';

export type PrototypeSnippet = {
  id: string;
  sourceKey: string;
  sourceKind: 'youtube' | 'web';
  sourceTitle: string;
  sourceSubtitle: string;
  selectedText: string;
  triageStatus: SnippetTriageStatus;
  /** YouTube timestamp label, e.g. "2:14" */
  timeLabel?: string;
};

export type PrototypeSourceMeta = {
  sourceKey: string;
  sourceKind: 'youtube' | 'web';
  title: string;
  subtitle: string;
};

export type SidebarPane = 'inbox' | 'library';

export function createInitialPrototypeSnippets(): PrototypeSnippet[] {
  return [
    {
      id: 'a1',
      sourceKey: 'youtube:startup-pitch',
      sourceKind: 'youtube',
      sourceTitle: 'How to pitch your startup',
      sourceSubtitle: 'Y Combinator',
      selectedText: 'pivot',
      triageStatus: 'mastered',
      timeLabel: '2:14',
    },
    {
      id: 'a2',
      sourceKey: 'youtube:startup-pitch',
      sourceKind: 'youtube',
      sourceTitle: 'How to pitch your startup',
      sourceSubtitle: 'Y Combinator',
      selectedText: 'runway',
      triageStatus: 'mastered',
      timeLabel: '4:02',
    },
    {
      id: 'a3',
      sourceKey: 'youtube:startup-pitch',
      sourceKind: 'youtube',
      sourceTitle: 'How to pitch your startup',
      sourceSubtitle: 'Y Combinator',
      selectedText: 'look forward to',
      triageStatus: 'review',
      timeLabel: '6:45',
    },
    {
      id: 'b1',
      sourceKey: 'web:git-flight-rules',
      sourceKind: 'web',
      sourceTitle: 'Git flight rules',
      sourceSubtitle: 'github.com',
      selectedText: 'rebase onto',
      triageStatus: 'pending',
    },
    {
      id: 'b2',
      sourceKey: 'web:git-flight-rules',
      sourceKind: 'web',
      sourceTitle: 'Git flight rules',
      sourceSubtitle: 'github.com',
      selectedText: 'fast-forward only',
      triageStatus: 'pending',
    },
    {
      id: 'c1',
      sourceKey: 'youtube:immersion-tips',
      sourceKind: 'youtube',
      sourceTitle: 'Immersion learning tips',
      sourceSubtitle: 'Language Coach',
      selectedText: 'comprehensible input',
      triageStatus: 'mastered',
      timeLabel: '0:42',
    },
    {
      id: 'c2',
      sourceKey: 'youtube:immersion-tips',
      sourceKind: 'youtube',
      sourceTitle: 'Immersion learning tips',
      sourceSubtitle: 'Language Coach',
      selectedText: 'spaced repetition',
      triageStatus: 'review',
      timeLabel: '3:18',
    },
    {
      id: 'c3',
      sourceKey: 'youtube:immersion-tips',
      sourceKind: 'youtube',
      sourceTitle: 'Immersion learning tips',
      sourceSubtitle: 'Language Coach',
      selectedText: 'active recall',
      triageStatus: 'mastered',
      timeLabel: '5:55',
    },
  ];
}

export function sourceMetaFromSnippet(snippet: PrototypeSnippet): PrototypeSourceMeta {
  return {
    sourceKey: snippet.sourceKey,
    sourceKind: snippet.sourceKind,
    title: snippet.sourceTitle,
    subtitle: snippet.sourceSubtitle,
  };
}

export function inboxSources(snippets: PrototypeSnippet[]): PrototypeSourceMeta[] {
  const byKey = new Map<string, PrototypeSourceMeta>();
  for (const snippet of snippets) {
    if (snippet.triageStatus !== 'pending') continue;
    if (!byKey.has(snippet.sourceKey)) {
      byKey.set(snippet.sourceKey, sourceMetaFromSnippet(snippet));
    }
  }
  return [...byKey.values()];
}

export function librarySources(snippets: PrototypeSnippet[]): PrototypeSourceMeta[] {
  const byKey = new Map<string, PrototypeSourceMeta>();
  for (const snippet of snippets) {
    if (snippet.triageStatus === 'pending') continue;
    if (!byKey.has(snippet.sourceKey)) {
      byKey.set(snippet.sourceKey, sourceMetaFromSnippet(snippet));
    }
  }
  return [...byKey.values()];
}

export function pendingCountForSource(
  snippets: PrototypeSnippet[],
  sourceKey: string,
): number {
  return snippets.filter(
    (snippet) =>
      snippet.sourceKey === sourceKey && snippet.triageStatus === 'pending',
  ).length;
}

export function snippetsForPane(
  snippets: PrototypeSnippet[],
  sourceKey: string,
  pane: SidebarPane,
): PrototypeSnippet[] {
  return snippets.filter((snippet) => {
    if (snippet.sourceKey !== sourceKey) return false;
    return pane === 'inbox'
      ? snippet.triageStatus === 'pending'
      : snippet.triageStatus !== 'pending';
  });
}

export function setSnippetStatus(
  snippets: PrototypeSnippet[],
  snippetId: string,
  status: Exclude<SnippetTriageStatus, 'pending'>,
): PrototypeSnippet[] {
  return snippets.map((snippet) =>
    snippet.id === snippetId ? { ...snippet, triageStatus: status } : snippet,
  );
}

export function simulateCapture(
  snippets: PrototypeSnippet[],
  sourceKey: string,
  selectedText: string,
): PrototypeSnippet[] {
  const template = snippets.find((snippet) => snippet.sourceKey === sourceKey);
  if (!template) return snippets;

  const id = `capture-${Date.now()}`;
  return [
    ...snippets,
    {
      id,
      sourceKey: template.sourceKey,
      sourceKind: template.sourceKind,
      sourceTitle: template.sourceTitle,
      sourceSubtitle: template.sourceSubtitle,
      selectedText,
      triageStatus: 'pending',
      timeLabel: template.sourceKind === 'youtube' ? '8:12' : undefined,
    },
  ];
}

export function describePrototypeState(snippets: PrototypeSnippet[]): string {
  const inbox = inboxSources(snippets)
    .map(
      (source) =>
        `${source.title} (${pendingCountForSource(snippets, source.sourceKey)} pending)`,
    )
    .join(', ');
  const library = librarySources(snippets)
    .map((source) => {
      const list = snippetsForPane(snippets, source.sourceKey, 'library');
      return `${source.title} (${list.length} snips)`;
    })
    .join(', ');

  return [
    `Inbox: ${inbox || '(empty)'}`,
    `Library: ${library || '(empty)'}`,
  ].join(' · ');
}
