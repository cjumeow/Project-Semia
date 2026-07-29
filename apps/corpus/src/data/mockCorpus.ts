import type { CorpusSnippet, VideoGroup } from '../types/corpus';
import { groupSnippetsByVideo } from '../utils/corpusGrouping';

const WORD_REF = { cueIndex: 0, wordIndex: 0 } as const;

function snippet(
  partial: Pick<
    CorpusSnippet,
    'id' | 'selectedText' | 'capturedAt' | 'note'
  > & {
    videoId: string;
    videoUrl: string;
    start: number;
    end: number;
  },
): CorpusSnippet {
  const contextCues = [
    {
      text: `…${partial.selectedText}…`,
      start: partial.start,
      duration: partial.end - partial.start,
    },
  ];
  const contextText = contextCues.map((cue) => cue.text).join(' ');

  return {
    id: partial.id,
    selectedText: partial.selectedText,
    contextText,
    languageCode: 'en',
    sourceUrl: partial.videoUrl,
    sourceTitle: `YouTube · ${partial.videoId}`,
    capturedAt: partial.capturedAt,
    anchor: {
      kind: 'youtube',
      videoId: partial.videoId,
      selection: { start: WORD_REF, end: WORD_REF },
      focusWord: {
        ...WORD_REF,
        text: partial.selectedText.split(' ')[0] ?? '',
      },
      contextCues,
      contextCueIndices: [0, 0] as [number, number],
      startSeconds: partial.start,
      endSeconds: partial.end,
    },
    note: partial.note,
  };
}

const MOCK_SNIPPETS: CorpusSnippet[] = [
  snippet({
    id: 'snip-1',
    videoId: 'kJQP7kiw5Fk',
    videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    selectedText: 'pivot',
    start: 745,
    end: 748,
    capturedAt: '2026-07-16T14:22:00.000Z',
    note: {
      originalSpeech: 'pivot',
      naturalTranslation: '調整策略 / 樞軸轉向',
      dynamicContextBlock: '',
      backgroundNote:
        '在商業與產品開發情境中，並非指物理上的「旋轉」，而是指當原計畫或產品路線不如預期時，團隊迅速改變方向或商業模式的決策。',
      example:
        'After looking at the Q3 user retention data, the team decided to pivot and focus on enterprise client solutions.',
    },
  }),
  snippet({
    id: 'snip-2',
    videoId: 'kJQP7kiw5Fk',
    videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    selectedText: 'look forward to',
    start: 1120,
    end: 1124,
    capturedAt: '2026-07-14T09:10:00.000Z',
    note: {
      originalSpeech: 'look forward to',
      naturalTranslation: '期待、盼望',
      dynamicContextBlock: '',
      backgroundNote:
        '正式但友善的書面/口語表達，常用於信件結尾或表達對未來事件的正面期待。比 "can\'t wait" 更正式。',
      example: 'I look forward to hearing from you soon.',
    },
  }),
  snippet({
    id: 'snip-3',
    videoId: 'kJQP7kiw5Fk',
    videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    selectedText: 'on the same page',
    start: 1840,
    end: 1845,
    capturedAt: '2026-07-12T18:45:00.000Z',
    note: {
      originalSpeech: 'on the same page',
      naturalTranslation: '達成共識、想法一致',
      dynamicContextBlock: '',
      backgroundNote:
        '比喻雙方對某議題有相同理解或目標。常見於商務會議、團隊協作場景，暗示先前可能存在誤解或資訊不對稱。',
      example:
        "Before we move on, let's make sure we're all on the same page about the launch timeline.",
    },
  }),
  snippet({
    id: 'snip-4',
    videoId: 'dQw4w9WgXcQ',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    selectedText: 'never gonna give you up',
    start: 43,
    end: 47,
    capturedAt: '2026-07-10T12:00:00.000Z',
    note: {
      originalSpeech: 'never gonna give you up',
      naturalTranslation: '絕不會放棄你',
      dynamicContextBlock: '',
      backgroundNote:
        '口語縮寫 "gonna" = "going to"。這句在流行文化中因 Rickroll 迷因而廣為人知，語氣承諾且帶有懷舊感。',
      example: "I'm never gonna give you up, never gonna let you down.",
    },
  }),
  snippet({
    id: 'snip-5',
    videoId: 'dQw4w9WgXcQ',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    selectedText: 'let you down',
    start: 52,
    end: 55,
    capturedAt: '2026-07-08T08:30:00.000Z',
    note: {
      originalSpeech: 'let you down',
      naturalTranslation: '讓你失望',
      dynamicContextBlock: '',
      backgroundNote:
        '常見片語動詞，表示未能達到對方的期望或承諾。可與 "disappoint" 互換，但口語感更強。',
      example: "I don't want to let you down, so I'll do my best.",
    },
  }),
  snippet({
    id: 'snip-6',
    videoId: 'jNQXAC9IVRw',
    videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    selectedText: 'elephants',
    start: 12,
    end: 14,
    capturedAt: '2026-07-05T16:20:00.000Z',
    note: {
      originalSpeech: 'elephants',
      naturalTranslation: '大象',
      dynamicContextBlock: '',
      backgroundNote:
        'YouTube 史上第一支上傳影片中的詞彙。在此語境下為動物園參觀的簡短描述，無特殊隱喻。',
      example: 'The elephants have really long trunks.',
    },
  }),
];

const VIDEO_META = {
  kJQP7kiw5Fk: {
    videoId: 'kJQP7kiw5Fk',
    title: 'Organize Your Entire Knowledge Base with AI | Heptabase',
    channel: 'Heptabase',
  },
  dQw4w9WgXcQ: {
    videoId: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up',
    channel: 'Rick Astley',
  },
  jNQXAC9IVRw: {
    videoId: 'jNQXAC9IVRw',
    title: 'Me at the zoo',
    channel: 'jawed',
  },
} as const;

/** Pre-grouped mock corpus for UI development. */
export const MOCK_VIDEO_GROUPS: VideoGroup[] = groupSnippetsByVideo(
  MOCK_SNIPPETS,
  { videoMeta: VIDEO_META },
);
