import type { LanguageFragment, SnippetNote, SnippetUnitType } from './types';

function normalizeAiContent(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:xml)?\s*([\s\S]*?)```$/i);
  if (fenced) {
    return fenced[1].trim();
  }

  const inlineFence = trimmed.match(/```(?:xml)?\s*([\s\S]*?)```/i);
  if (inlineFence) {
    return inlineFence[1].trim();
  }

  return trimmed;
}

function extractXmlTag(content: string, tag: string): string {
  const pattern = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = content.match(pattern);
  return match?.[1]?.trim() ?? '';
}

export function parseSnippetUnitType(raw: string): SnippetUnitType {
  return raw.trim().toLowerCase() === 'word' ? 'word' : 'others';
}

export function effectiveSnippetUnitType(note: SnippetNote): SnippetUnitType {
  return note.unitType ?? 'others';
}

export function normalizeSnippetNote(note: SnippetNote): SnippetNote {
  const legacyExample = note.example?.trim();
  const unitType =
    note.unitType ?? (legacyExample ? 'word' : 'others');
  const illustrativeExample =
    note.illustrativeExample?.trim() ||
    (unitType === 'word' && legacyExample ? legacyExample : '');

  return {
    ...note,
    unitType,
    dynamicContextBlock: note.dynamicContextBlock ?? '',
    illustrativeExample: illustrativeExample || undefined,
  };
}

export function parseSnippetNoteXml(
  content: string,
  fragment: LanguageFragment,
): SnippetNote {
  const normalized = normalizeAiContent(content);
  const originalSpeech = extractXmlTag(normalized, 'original_speech');
  const naturalTranslation = extractXmlTag(normalized, 'natural_translation');
  const backgroundNote = extractXmlTag(normalized, 'background_note');
  const unitTypeRaw = extractXmlTag(normalized, 'unit_type');

  if (!originalSpeech && !naturalTranslation && !backgroundNote) {
    throw new Error('AI returned invalid XML note.');
  }

  return {
    originalSpeech: originalSpeech || fragment.selectedText,
    naturalTranslation,
    dynamicContextBlock: '',
    backgroundNote,
    unitType: unitTypeRaw ? parseSnippetUnitType(unitTypeRaw) : 'others',
    generatedAt: new Date().toISOString(),
  };
}

export function parseIllustrativeExampleXml(content: string): string {
  const normalized = normalizeAiContent(content);
  const example =
    extractXmlTag(normalized, 'illustrative_example') ||
    extractXmlTag(normalized, 'example');
  if (!example.trim()) {
    throw new Error('AI returned an empty illustrative example.');
  }
  return example.trim();
}
