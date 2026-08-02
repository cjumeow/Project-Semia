import type { CardIntent } from './types';

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

export function requiredCardSections(intents: CardIntent[]): string[] {
  const sections = ['focus', 'meaning', 'scenario_1', 'scenario_2'];
  if (intents.includes('speaking')) {
    sections.push('speaking_example');
  }
  if (intents.includes('writing')) {
    sections.push('writing_example');
  }
  return sections;
}

export type ParsedLanguageCardContent = {
  focus: string;
  meaning: string;
  scenario1: string;
  scenario2: string;
  speakingExample?: string;
  writingExample?: string;
};

export function parseLanguageCardXml(
  content: string,
  intents: CardIntent[],
): ParsedLanguageCardContent {
  const normalized = normalizeAiContent(content);
  const required = requiredCardSections(intents);
  const values: Record<string, string> = {};

  for (const tag of required) {
    const value = extractXmlTag(normalized, tag);
    if (!value) {
      throw new Error(`AI returned invalid language card XML (missing <${tag}>).`);
    }
    values[tag] = value;
  }

  return {
    focus: values.focus,
    meaning: values.meaning,
    scenario1: values.scenario_1,
    scenario2: values.scenario_2,
    speakingExample: values.speaking_example,
    writingExample: values.writing_example,
  };
}
