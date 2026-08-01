import { contextCuesToText } from './contextText';
import { inferWebLocateQuality } from './webAnchor';
import type {
  FragmentAnchor,
  LanguageFragment,
  LegacyLanguageFragment,
  SnippetTriageStatus,
  TranscriptSegment,
  YouTubeAnchor,
} from './types';

function parseTriageStatus(value: unknown): SnippetTriageStatus {
  if (value === 'pending' || value === 'review' || value === 'mastered') {
    return value;
  }
  return 'pending';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function isLegacyFragment(value: Record<string, unknown>): boolean {
  return typeof value.videoId === 'string' && value.anchor === undefined;
}

function parseTranscriptSegments(value: unknown): TranscriptSegment[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (cue): cue is TranscriptSegment =>
      isRecord(cue) &&
      typeof cue.text === 'string' &&
      typeof cue.start === 'number' &&
      typeof cue.duration === 'number',
  );
}

function parseYouTubeAnchor(value: Record<string, unknown>): YouTubeAnchor | null {
  if (value.kind !== 'youtube' || typeof value.videoId !== 'string') {
    return null;
  }

  const selection = value.selection;
  const focusWord = value.focusWord;
  if (!isRecord(selection) || !isRecord(focusWord)) return null;
  if (typeof focusWord.text !== 'string') return null;

  const contextCueIndices = value.contextCueIndices;
  if (
    !Array.isArray(contextCueIndices) ||
    contextCueIndices.length !== 2 ||
    typeof contextCueIndices[0] !== 'number' ||
    typeof contextCueIndices[1] !== 'number'
  ) {
    return null;
  }

  if (
    typeof value.startSeconds !== 'number' ||
    typeof value.endSeconds !== 'number'
  ) {
    return null;
  }

  return {
    kind: 'youtube',
    videoId: value.videoId,
    selection: selection as YouTubeAnchor['selection'],
    focusWord: focusWord as YouTubeAnchor['focusWord'],
    contextCues: parseTranscriptSegments(value.contextCues),
    contextCueIndices: [contextCueIndices[0], contextCueIndices[1]],
    startSeconds: value.startSeconds,
    endSeconds: value.endSeconds,
  };
}

function parseAnchor(value: unknown): FragmentAnchor | null {
  if (!isRecord(value)) return null;
  if (value.kind === 'youtube') return parseYouTubeAnchor(value);
  if (value.kind === 'web') {
    const textQuote = value.textQuote;
    const textPosition = value.textPosition;
    if (
      !isRecord(textQuote) ||
      typeof textQuote.exact !== 'string' ||
      !isRecord(textPosition) ||
      typeof textPosition.start !== 'number' ||
      typeof textPosition.end !== 'number'
    ) {
      return null;
    }
    return {
      kind: 'web',
      textQuote: {
        exact: textQuote.exact,
        prefix:
          typeof textQuote.prefix === 'string' ? textQuote.prefix : undefined,
        suffix:
          typeof textQuote.suffix === 'string' ? textQuote.suffix : undefined,
      },
      textPosition: {
        start: textPosition.start,
        end: textPosition.end,
      },
      locateQuality:
        value.locateQuality === 'precise' ||
        value.locateQuality === 'uncertain' ||
        value.locateQuality === 'degraded'
          ? value.locateQuality
          : inferWebLocateQuality(
              {
                exact: textQuote.exact,
                prefix:
                  typeof textQuote.prefix === 'string'
                    ? textQuote.prefix
                    : undefined,
                suffix:
                  typeof textQuote.suffix === 'string'
                    ? textQuote.suffix
                    : undefined,
              },
              {
                start: textPosition.start,
                end: textPosition.end,
              },
            ),
      locateFailureReason:
        typeof value.locateFailureReason === 'string'
          ? value.locateFailureReason
          : undefined,
      cssSelector:
        typeof value.cssSelector === 'string' ? value.cssSelector : undefined,
    };
  }
  return null;
}

function migrateLegacy(value: Record<string, unknown>): LanguageFragment | null {
  const legacy = value as LegacyLanguageFragment;
  const contextCues = parseTranscriptSegments(legacy.contextCues);

  return {
    id: legacy.id,
    selectedText: legacy.selectedText,
    contextText: contextCuesToText(contextCues),
    languageCode:
      typeof legacy.languageCode === 'string' ? legacy.languageCode : 'en',
    sourceUrl:
      typeof legacy.videoUrl === 'string'
        ? legacy.videoUrl
        : `https://www.youtube.com/watch?v=${legacy.videoId}`,
    sourceTitle: `YouTube · ${legacy.videoId}`,
    capturedAt: legacy.capturedAt,
    triageStatus: 'pending',
    anchor: {
      kind: 'youtube',
      videoId: legacy.videoId,
      selection: legacy.selection,
      focusWord: legacy.focusWord,
      contextCues,
      contextCueIndices: legacy.contextCueIndices,
      startSeconds: legacy.start,
      endSeconds: legacy.end,
    },
  };
}

function normalizeNewFragment(
  value: Record<string, unknown>,
): LanguageFragment | null {
  const anchor = parseAnchor(value.anchor);
  if (!anchor) return null;

  if (
    typeof value.languageCode !== 'string' ||
    typeof value.sourceUrl !== 'string' ||
    typeof value.sourceTitle !== 'string' ||
    typeof value.capturedAt !== 'string'
  ) {
    return null;
  }

  let contextText =
    typeof value.contextText === 'string' ? value.contextText : '';
  if (!contextText && anchor.kind === 'youtube') {
    contextText = contextCuesToText(anchor.contextCues);
  }

  return {
    id: value.id as string,
    selectedText: value.selectedText as string,
    contextText,
    languageCode: value.languageCode,
    sourceUrl: value.sourceUrl,
    sourceTitle: value.sourceTitle,
    capturedAt: value.capturedAt,
    triageStatus: parseTriageStatus(value.triageStatus),
    anchor,
  };
}

/** Upgrade legacy storage rows or validate already-migrated fragments. */
export function migrateFragment(value: unknown): LanguageFragment | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.selectedText !== 'string') {
    return null;
  }

  if (value.anchor !== undefined) {
    return normalizeNewFragment(value);
  }

  if (isLegacyFragment(value)) {
    return migrateLegacy(value);
  }

  return null;
}
