import type { LanguageCard } from '@semia/shared';
import type { CorpusSnippet } from '../../types/corpus';

const navalNote = {
  originalSpeech:
    "naval vessels, although they're separated in some ways, but there've always been Black sailors in the Navy.",
  naturalTranslation:
    '海軍船艦雖然在某些方面有所區隔，但海軍中一直有非裔水手。',
  dynamicContextBlock:
    "naval vessels, although they're separated in some ways...\n---\n海軍船艦雖然在某些方面有所區隔…",
  backgroundNote:
    '討論美國內戰時期海軍與陸軍在種族隔離上的差異：海軍船員較早整合，陸軍則長期隔離。',
  generatedAt: '2026-08-05T10:00:00.000Z',
};

const bakedNote = {
  originalSpeech: 'baked into the base model',
  naturalTranslation: '內建於基礎模型之中',
  dynamicContextBlock:
    'capabilities baked into the base model\n---\n內建於基礎模型中的能力',
  backgroundNote:
    '「baked into」在此指訓練階段就寫進模型參數的能力，而非外掛插件。',
  generatedAt: '2026-08-05T09:00:00.000Z',
};

function ytSnippet(
  id: string,
  selectedText: string,
  note: typeof navalNote,
  seconds: number,
): CorpusSnippet {
  return {
    id,
    selectedText,
    contextText: note.originalSpeech,
    languageCode: 'en',
    sourceUrl: 'https://www.youtube.com/watch?v=demo',
    sourceTitle: 'Gary Gallagher: American Civil War, Slavery, Lincoln…',
    capturedAt: '2026-08-05T10:00:00.000Z',
    triageStatus: 'review',
    anchor: {
      kind: 'youtube',
      videoId: 'demo',
      selection: {
        start: { cueIndex: 0, wordIndex: 0 },
        end: { cueIndex: 0, wordIndex: 1 },
      },
      focusWord: { cueIndex: 0, wordIndex: 0, text: selectedText.split(' ')[0] ?? '' },
      contextCues: [],
      contextCueIndices: [0, 0],
      startSeconds: seconds,
      endSeconds: seconds + 2,
    },
    note,
  };
}

export const MOCK_SNIPPETS: CorpusSnippet[] = [
  ytSnippet('snip-naval', 'naval vessels', navalNote, 565),
  ytSnippet('snip-baked', 'baked into the base', bakedNote, 565),
  ytSnippet('snip-sailors', 'sailors', navalNote, 568),
];

export const MOCK_CARDS: LanguageCard[] = [
  {
    id: 'card-sailors',
    sourceFragmentId: 'snip-naval',
    focusText: 'sailors',
    intents: ['speaking'],
    focus: 'sailors',
    meaning: '水手；海軍士兵',
    examples: [],
    createdAt: '2026-08-05T11:00:00.000Z',
    generatedAt: '2026-08-05T11:00:00.000Z',
    triageStatus: 'review',
  },
  {
    id: 'card-vessels',
    sourceFragmentId: 'snip-naval',
    focusText: 'vessels',
    intents: ['speaking'],
    focus: 'vessels',
    meaning: '船艦；艦艇',
    examples: [],
    createdAt: '2026-08-05T11:05:00.000Z',
    generatedAt: '2026-08-05T11:05:00.000Z',
    triageStatus: 'review',
  },
];
