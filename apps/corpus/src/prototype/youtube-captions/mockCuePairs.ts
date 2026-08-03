import type { CuePair } from './youtubeCaptionTypes';

/**
 * Mock cues — Jo Van Eyck video excerpt (spike #02 cue 96 mismatch).
 * Native line shows what index-pairing wrongly surfaces in production.
 */
export const MOCK_CUE_PAIRS: CuePair[] = [
  {
    cueIndex: 11,
    timestamp: '0:32',
    learningText: 'to think about context engineering and',
    nativeText: '考慮上下文工程，然後',
  },
  {
    cueIndex: 96,
    timestamp: '0:06',
    learningText: "that. That's part of context engineering",
    nativeText:
      '偷來的這句話，但有人說過，軟體設計是上下文工程，因為是的，程式碼庫和所有這些工具…',
  },
  {
    cueIndex: 101,
    timestamp: '1:42',
    learningText: 'software design is context engineering',
    nativeText: '軟體設計就是上下文工程',
  },
];
