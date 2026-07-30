import type { LanguageFragment } from '@semia/shared';
import {
  isYouTubeAnchor,
  youtubeEndSeconds,
  youtubeStartSeconds,
  youtubeVideoId,
} from '@semia/shared';

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
  if (!isYouTubeAnchor(fragment.anchor)) {
    return fragment.contextText;
  }

  return fragment.anchor.contextCues
    .map((cue) => {
      const text = cue.text.trim();
      if (!text) return '';
      return `[${cue.start.toFixed(1)}s] ${text}`;
    })
    .filter(Boolean)
    .join('\n');
}

export function buildVideoMetadata(fragment: LanguageFragment): string {
  if (!isYouTubeAnchor(fragment.anchor)) {
    return [
      `Source URL: ${fragment.sourceUrl}`,
      `Title: ${fragment.sourceTitle}`,
      `Source language: ${fragment.languageCode}`,
      `Focus selection: ${fragment.selectedText}`,
    ].join('\n');
  }

  return [
    `Video URL: ${fragment.sourceUrl}`,
    `Video ID: ${youtubeVideoId(fragment)}`,
    `Source language: ${fragment.languageCode}`,
    `Focus word: ${fragment.anchor.focusWord.text}`,
    `Selection time: ${youtubeStartSeconds(fragment).toFixed(1)}s – ${youtubeEndSeconds(fragment).toFixed(1)}s`,
  ].join('\n');
}

export function formatBaselineCueWindow(fragment: LanguageFragment): string {
  if (!isYouTubeAnchor(fragment.anchor)) {
    return fragment.contextText || '(none)';
  }

  const cues = fragment.anchor.contextCues;
  if (cues.length === 0) return '(none)';

  const startSeconds = youtubeStartSeconds(fragment);
  const endSeconds = youtubeEndSeconds(fragment);

  let centerIndex = 0;
  for (let index = 0; index < cues.length; index++) {
    const cue = cues[index]!;
    const cueEnd = cue.start + cue.duration;
    if (cueEnd > startSeconds && cue.start < endSeconds) {
      centerIndex = index;
      break;
    }
    if (cue.start <= startSeconds) {
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
  const sourceLabel = isYouTubeAnchor(fragment.anchor) ? 'video' : 'page';
  const contextLabel = isYouTubeAnchor(fragment.anchor)
    ? '[30-SECOND SURROUNDING CONTEXT]'
    : '[PAGE CONTEXT]';
  const baselineLabel = isYouTubeAnchor(fragment.anchor)
    ? '[BASELINE CONTEXT WINDOW (~±3 CUES)]'
    : '[BASELINE CONTEXT WINDOW]';

  return `Here is the context of the ${sourceLabel}:
---
[${isYouTubeAnchor(fragment.anchor) ? 'VIDEO' : 'PAGE'} METADATA]
${metadata}

${contextLabel}
${context || '(none)'}

${baselineLabel}
${baselineContext || '(none)'}

[USER'S CAPTURED SELECTION]
${selection}
---`;
}
