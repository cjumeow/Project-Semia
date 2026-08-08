export type FocusPickMockSnippet = {
  id: string;
  selectedText: string;
  originalSpeech: string;
  contextWindow: string;
  naturalTranslation: string;
};

export const FOCUS_PICK_MOCK_SNIPPET: FocusPickMockSnippet = {
  id: 'mock-1',
  selectedText:
    'Context mean, you have to be careful with that word when writing formal emails.',
  originalSpeech:
    'When people say "context" in English, they usually mean the surrounding situation that helps you understand a word or phrase. In this sentence, you have to be careful with that word when writing formal emails — it can sound stiff if you overuse it.',
  contextWindow: `EN: When people say "context" in English, they usually mean the surrounding situation that helps you understand a word or phrase.
ZH: 英文裡的 context 通常指「語境」——幫助你理解字詞的周遭情境。
---
EN: In this sentence, you have to be careful with that word when writing formal emails.
ZH: 在這句裡，寫正式郵件時要特別小心這個字的使用。`,
  naturalTranslation:
    '當人們說「context」時，通常是指幫助你理解字詞的語境。在這句話裡，寫正式郵件時要特別小心這個字。',
};
