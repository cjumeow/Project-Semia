export type DarkModeMockSnippet = {
  id: string;
  selectedText: string;
  sourceTitle: string;
  cardCount: number;
};

export const DARK_MODE_INBOX_SNIPPETS: DarkModeMockSnippet[] = [
  {
    id: 's1',
    selectedText: 'categorized',
    sourceTitle: 'Anthropic Economic Index',
    cardCount: 0,
  },
  {
    id: 's2',
    selectedText: 'naval vessels',
    sourceTitle: 'NYT · Defense spending',
    cardCount: 2,
  },
  {
    id: 's3',
    selectedText: 'labor market',
    sourceTitle: 'Anthropic Economic Index',
    cardCount: 0,
  },
  {
    id: 's4',
    selectedText: 'remote work',
    sourceTitle: 'NYT · Future of offices',
    cardCount: 0,
  },
  {
    id: 's5',
    selectedText: 'productivity gains',
    sourceTitle: 'Lex Clips · Carmack',
    cardCount: 1,
  },
];
