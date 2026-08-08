export type BaseFormSuggestion = {
  baseForm: string | null;
};

/** Bump when prompt rules change (invalidates client cache). */
export const BASE_FORM_SUGGESTION_VERSION = 1;

const NULL_TOKENS = new Set(['null', 'none', 'n/a', 'na', '-']);

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

function parseLabeledLine(content: string): string | null | undefined {
  const match = content.match(/BASE_FORM\s*:\s*([\s\S]*)/i);
  if (!match?.[1]) {
    return undefined;
  }

  const value = match[1].trim();
  if (!value || NULL_TOKENS.has(value.toLowerCase())) {
    return null;
  }

  return value;
}

export function parseBaseFormSuggestion(content: string): BaseFormSuggestion {
  const trimmed = content.trim();
  if (!trimmed) {
    return { baseForm: null };
  }

  const labeled = parseLabeledLine(trimmed);
  if (labeled !== undefined) {
    return { baseForm: labeled };
  }

  const jsonText = extractJsonObject(trimmed);
  if (!jsonText) {
    return { baseForm: null };
  }

  try {
    const parsed = JSON.parse(jsonText) as { baseForm?: unknown };
    if (parsed.baseForm === null) {
      return { baseForm: null };
    }
    if (typeof parsed.baseForm === 'string') {
      const value = parsed.baseForm.trim();
      if (!value || NULL_TOKENS.has(value.toLowerCase())) {
        return { baseForm: null };
      }
      return { baseForm: value };
    }
  } catch {
    return { baseForm: null };
  }

  return { baseForm: null };
}
