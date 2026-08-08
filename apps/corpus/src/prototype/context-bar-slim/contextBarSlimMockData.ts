import type { SlimContextSnippet } from './contextBarSlimShared';

export const SLIM_MOCK_SNIPPETS: SlimContextSnippet[] = [
  {
    id: 's1',
    selectedText:
      'Context mean, you have to be careful with that word when writing formal emails.',
  },
  {
    id: 's2',
    selectedText: 'with macaroni and cheese on the side',
  },
  {
    id: 's3',
    selectedText: 'Anthropic report on constitutional AI',
  },
];

export const SLIM_MOCK_MESSAGES = [
  {
    kind: 'user' as const,
    content: 'What does "context" mean in this sentence?',
  },
  {
    kind: 'assistant' as const,
    content: `1. **核心詞彙**
   - context — 語境、上下文

2. **文中相關搭配**
   - be careful with — 對…要謹慎`,
  },
  {
    kind: 'switch' as const,
    snippetId: 's2',
  },
  {
    kind: 'user' as const,
    content: 'How would you order this at a restaurant?',
  },
  {
    kind: 'assistant' as const,
    content:
      'You could say: "I\'ll have the burger with macaroni and cheese on the side."',
  },
  {
    kind: 'switch' as const,
    snippetId: 's1',
  },
  {
    kind: 'user' as const,
    content: 'Back to the first snippet — any collocations?',
  },
  {
    kind: 'assistant' as const,
    content:
      'Try *in context*, *out of context*, and *provide context* — all common in academic writing.',
  },
];
