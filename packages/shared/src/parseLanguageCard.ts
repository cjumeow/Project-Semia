import type { CardIntent, LanguageCardExample } from './types';

export type LanguageCardPromptOptions = {
  includeScenario: boolean;
  includeMeaning: boolean;
};

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

function extractExamples(
  content: string,
  intents: CardIntent[],
): LanguageCardExample[] {
  const pattern =
    /<example\s+kind="(speaking|writing)">\s*<text>([\s\S]*?)<\/text>\s*<translation>([\s\S]*?)<\/translation>\s*<\/example>/gi;
  const examples: LanguageCardExample[] = [];
  let match = pattern.exec(content);

  while (match) {
    examples.push({
      kind: match[1] as CardIntent,
      text: match[2].trim(),
      translation: match[3].trim(),
    });
    match = pattern.exec(content);
  }

  for (const intent of intents) {
    if (!examples.some((example) => example.kind === intent)) {
      throw new Error(
        `AI returned invalid language card XML (missing <example kind="${intent}">).`,
      );
    }
  }

  return examples;
}

export function requiredCardSections(
  intents: CardIntent[],
  options: LanguageCardPromptOptions,
): string[] {
  const sections = ['focus'];
  if (options.includeMeaning) {
    sections.push('meaning');
  }
  if (options.includeScenario) {
    sections.push('scenario');
  }

  for (const intent of intents) {
    sections.push(`example kind="${intent}"`);
  }

  return sections;
}

export type ParsedLanguageCardContent = {
  focus: string;
  meaning?: string;
  scenario?: string;
  examples: LanguageCardExample[];
};

export function parseLanguageCardXml(
  content: string,
  intents: CardIntent[],
  options: LanguageCardPromptOptions,
): ParsedLanguageCardContent {
  const normalized = normalizeAiContent(content);
  const focus = extractXmlTag(normalized, 'focus');
  if (!focus) {
    throw new Error('AI returned invalid language card XML (missing <focus>).');
  }

  let meaning: string | undefined;
  if (options.includeMeaning) {
    meaning = extractXmlTag(normalized, 'meaning');
    if (!meaning) {
      throw new Error('AI returned invalid language card XML (missing <meaning>).');
    }
  }

  let scenario: string | undefined;
  if (options.includeScenario) {
    scenario = extractXmlTag(normalized, 'scenario');
    if (!scenario) {
      throw new Error('AI returned invalid language card XML (missing <scenario>).');
    }
  }

  const examples = extractExamples(normalized, intents);

  return {
    focus,
    meaning,
    scenario,
    examples,
  };
}
