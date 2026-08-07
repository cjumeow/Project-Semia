import type { LanguageCard } from '@semia/shared';

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

const cardNow = '2026-08-04T12:00:00.000Z';

export const DARK_MODE_MOCK_LEARNING_CARDS: LanguageCard[] = [
  {
    id: 'lc-1',
    sourceFragmentId: 'frag-1',
    focusText: 'v.',
    intents: ['speaking'],
    focus: 'grill',
    meaning: '嚴厲盤問；刨根問底',
    examples: [],
    createdAt: cardNow,
    generatedAt: cardNow,
    triageStatus: 'review',
    dueAt: cardNow,
  },
  {
    id: 'lc-2',
    sourceFragmentId: 'frag-2',
    focusText: 'n.',
    intents: ['speaking'],
    focus: 'prototype',
    meaning: '原型；試作版',
    examples: [],
    createdAt: '2026-08-03T10:00:00.000Z',
    generatedAt: '2026-08-03T10:00:00.000Z',
    triageStatus: 'review',
    dueAt: '2026-08-05T10:00:00.000Z',
  },
  {
    id: 'lc-3',
    sourceFragmentId: 'frag-3',
    focusText: 'v.',
    intents: ['writing'],
    focus: 'capture',
    meaning: '擷取；捕捉',
    examples: [],
    createdAt: '2026-08-02T08:00:00.000Z',
    generatedAt: '2026-08-02T08:00:00.000Z',
    triageStatus: 'mastered',
  },
  {
    id: 'lc-4',
    sourceFragmentId: 'frag-4',
    focusText: 'n.',
    intents: ['speaking'],
    focus: 'immersion',
    meaning: '沉浸式學習',
    examples: [],
    createdAt: '2026-08-01T14:00:00.000Z',
    generatedAt: '2026-08-01T14:00:00.000Z',
    triageStatus: 'review',
    dueAt: '2026-08-06T14:00:00.000Z',
  },
  {
    id: 'lc-5',
    sourceFragmentId: 'frag-5',
    focusText: 'adj.',
    intents: ['speaking'],
    focus: 'bilingual',
    meaning: '雙語的',
    examples: [],
    createdAt: '2026-07-30T09:00:00.000Z',
    generatedAt: '2026-07-30T09:00:00.000Z',
    triageStatus: 'review',
    dueAt: '2026-08-04T09:00:00.000Z',
  },
  {
    id: 'lc-6',
    sourceFragmentId: 'frag-6',
    focusText: 'n.',
    intents: ['writing'],
    focus: 'corpus',
    meaning: '語料庫；文集',
    examples: [],
    createdAt: '2026-07-28T11:00:00.000Z',
    generatedAt: '2026-07-28T11:00:00.000Z',
    triageStatus: 'mastered',
  },
];
