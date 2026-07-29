import type { LanguageFragment } from '@semia/shared';

export function targetLanguageLabel(code: string): string {
  const labels: Record<string, string> = {
    'zh-TW': 'Traditional Chinese',
    'zh-CN': 'Simplified Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    en: 'English',
  };
  return labels[code] ?? code;
}

export function formatTimedContext(fragment: LanguageFragment): string {
  return fragment.contextCues
    .map((cue) => {
      const text = cue.text.trim();
      if (!text) return '';
      return `[${cue.start.toFixed(1)}s] ${text}`;
    })
    .filter(Boolean)
    .join('\n');
}

export function buildVideoMetadata(fragment: LanguageFragment): string {
  return [
    `Video URL: ${fragment.videoUrl}`,
    `Video ID: ${fragment.videoId}`,
    `Source language: ${fragment.languageCode}`,
    `Focus word: ${fragment.focusWord.text}`,
    `Selection time: ${fragment.start.toFixed(1)}s – ${fragment.end.toFixed(1)}s`,
  ].join('\n');
}

export function formatBaselineCueWindow(fragment: LanguageFragment): string {
  const cues = fragment.contextCues;
  if (cues.length === 0) return '(none)';

  let centerIndex = 0;
  for (let index = 0; index < cues.length; index++) {
    const cue = cues[index]!;
    const cueEnd = cue.start + cue.duration;
    if (cueEnd > fragment.start && cue.start < fragment.end) {
      centerIndex = index;
      break;
    }
    if (cue.start <= fragment.start) {
      centerIndex = index;
    }
  }

  const start = Math.max(0, centerIndex - 3);
  const end = Math.min(cues.length - 1, centerIndex + 3);
  return cues
    .slice(start, end + 1)
    .map((cue) => {
      const text = cue.text.trim();
      if (!text) return '';
      return `[${cue.start.toFixed(1)}s] ${text}`;
    })
    .filter(Boolean)
    .join('\n');
}

export function buildSnippetContextUserBlock(fragment: LanguageFragment): string {
  const metadata = buildVideoMetadata(fragment);
  const context = formatTimedContext(fragment);
  const baselineContext = formatBaselineCueWindow(fragment);
  const selection = fragment.selectedText.trim();

  return `Here is the context of the video:
---
[VIDEO METADATA]
${metadata}

[30-SECOND SURROUNDING CONTEXT]
${context || '(none)'}

[BASELINE CONTEXT WINDOW (~±3 CUES)]
${baselineContext || '(none)'}

[USER'S CAPTURED SELECTION]
${selection}
---`;
}
