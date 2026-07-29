import type { LanguageFragment, SnippetNote } from '@semia/shared';

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

export function parseSnippetNoteXml(
  content: string,
  fragment: LanguageFragment,
): SnippetNote {
  const normalized = normalizeAiContent(content);
  const originalSpeech = extractXmlTag(normalized, 'original_speech');
  const naturalTranslation = extractXmlTag(normalized, 'natural_translation');
  const backgroundNote = extractXmlTag(normalized, 'background_note');

  if (!originalSpeech && !naturalTranslation && !backgroundNote) {
    throw new Error('AI returned invalid XML note.');
  }

  return {
    originalSpeech: originalSpeech || fragment.selectedText,
    naturalTranslation,
    dynamicContextBlock: '',
    backgroundNote,
    example: '',
    generatedAt: new Date().toISOString(),
  };
}
