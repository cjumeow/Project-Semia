import type { LanguageFragment, SnippetNote } from '@semia/shared';
import { AI_PROVIDER_CONFIG, resolveAiProvider } from './aiProviders';
import { isSingleWordSnippet } from './isSingleWord';
import { buildSnippetNotePrompt } from './buildSnippetNotePrompt';
import { getSemiaSettings } from '../semiaSettings';

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type RawSnippetNote = {
  originalSpeech?: string;
  naturalTranslation?: string;
  backgroundNote?: string;
  example?: string;
};

function clampBackgroundLines(text: string, maxLines: number): string {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.slice(0, maxLines).join('\n');
}

function parseNoteJson(content: string, fragment: LanguageFragment): SnippetNote {
  let parsed: RawSnippetNote;
  try {
    parsed = JSON.parse(content) as RawSnippetNote;
  } catch {
    throw new Error('AI returned invalid JSON.');
  }

  const singleWord = isSingleWordSnippet(fragment.selectedText);
  const example =
    singleWord && typeof parsed.example === 'string'
      ? parsed.example.trim()
      : '';

  return {
    originalSpeech:
      typeof parsed.originalSpeech === 'string' && parsed.originalSpeech.trim()
        ? parsed.originalSpeech.trim()
        : fragment.selectedText,
    naturalTranslation:
      typeof parsed.naturalTranslation === 'string'
        ? parsed.naturalTranslation.trim()
        : '',
    backgroundNote: clampBackgroundLines(
      typeof parsed.backgroundNote === 'string' ? parsed.backgroundNote : '',
      4,
    ),
    example,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateSnippetNote(
  fragment: LanguageFragment,
): Promise<SnippetNote> {
  const settings = await getSemiaSettings();
  const apiKey = settings.aiApiKey?.trim();
  if (!apiKey) {
    throw new Error(
      'API key not set. Open extension Options and save your DeepSeek (or OpenAI) key.',
    );
  }

  const provider = resolveAiProvider(settings.aiProvider);
  const providerConfig = AI_PROVIDER_CONFIG[provider];
  const nativeLanguage = settings.nativeLanguage?.trim() || 'zh-TW';
  const { system, user } = buildSnippetNotePrompt({ fragment, nativeLanguage });

  const response = await fetch(providerConfig.chatCompletionsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: providerConfig.model,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      `${providerConfig.label} request failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`,
    );
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`${providerConfig.label} returned an empty response.`);
  }

  return parseNoteJson(content, fragment);
}
