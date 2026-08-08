export type ContextTabsMockSnippet = {
  id: string;
  selectedText: string;
  sourceTitle: string;
};

export const CONTEXT_TABS_MOCK_SNIPPETS: ContextTabsMockSnippet[] = [
  {
    id: 's1',
    selectedText: 'Context mean, you have to be careful with that word.',
    sourceTitle: 'YouTube · Advanced English podcast',
  },
  {
    id: 's2',
    selectedText: 'backend architecture',
    sourceTitle: 'Article · System design notes',
  },
  {
    id: 's3',
    selectedText: 'take it with a grain of salt',
    sourceTitle: 'Podcast · Idioms in the wild',
  },
];

export const CONTEXT_TABS_MOCK_CHAT = {
  assistantReply: `1. **核心詞彙**
   - context — 語境、上下文

2. **文中相關搭配**
   - be careful with — 對…要謹慎`,
  extraMessages: [
    {
      role: 'user' as const,
      content: 'Can you give me more example sentences?',
    },
    {
      role: 'assistant' as const,
      content: `Sure — here are a few natural uses:

- "You need to read that comment **in context**."
- "Without more **context**, the headline is misleading."
- "In this **context**, *mean* suggests *signify*, not *unkind*.`,
    },
    {
      role: 'user' as const,
      content: 'What about formal writing?',
    },
    {
      role: 'assistant' as const,
      content: `In formal writing, *context* often appears in phrases like *within the broader context of* or *given the historical context*.`,
    },
  ],
};
