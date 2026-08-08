export type FocusKeywordKind = 'word' | 'phrase' | 'collocation';

export type FocusKeywordCandidate = {
  text: string;
  kind: FocusKeywordKind;
};

export type FocusKeywordSuggestions = {
  candidates: FocusKeywordCandidate[];
};

export type FocusKeywordMode = 'daily' | 'advanced';

const VALID_KINDS = new Set<FocusKeywordKind>(['word', 'phrase', 'collocation']);

function extractJsonObject(content: string): string | null {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end <= start) {
    return null;
  }

  return trimmed.slice(start, end + 1);
}

function appearsInOriginalSpeech(text: string, originalSpeech: string): boolean {
  const candidate = text.trim();
  if (!candidate) {
    return false;
  }

  return originalSpeech.toLowerCase().includes(candidate.toLowerCase());
}

function normalizeKind(value: unknown): FocusKeywordKind {
  if (typeof value === 'string' && VALID_KINDS.has(value as FocusKeywordKind)) {
    return value as FocusKeywordKind;
  }
  return 'word';
}

export function parseFocusKeywordSuggestions(
  content: string,
  originalSpeech: string,
): FocusKeywordSuggestions {
  const jsonText = extractJsonObject(content);
  if (!jsonText) {
    return { candidates: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { candidates: [] };
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !Array.isArray((parsed as { candidates?: unknown }).candidates)
  ) {
    return { candidates: [] };
  }

  const seen = new Set<string>();
  const candidates: FocusKeywordCandidate[] = [];

  for (const entry of (parsed as { candidates: unknown[] }).candidates) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const text =
      typeof (entry as { text?: unknown }).text === 'string'
        ? (entry as { text: string }).text.trim()
        : '';
    if (!text || seen.has(text.toLowerCase())) {
      continue;
    }
    if (!appearsInOriginalSpeech(text, originalSpeech)) {
      continue;
    }

    seen.add(text.toLowerCase());
    candidates.push({
      text,
      kind: normalizeKind((entry as { kind?: unknown }).kind),
    });

    if (candidates.length >= 3) {
      break;
    }
  }

  return { candidates };
}

export function speechPreview(text: string, maxLen = 36): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLen)}…`;
}
