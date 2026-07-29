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

function normalizeContextSeparator(text: string): string {
  const parts = text.split(/\s*---\s*/);
  if (parts.length < 2) {
    return text.trim();
  }

  const original = parts[0]?.trim() ?? '';
  const translation = parts.slice(1).join(' --- ').trim();
  if (!original || !translation) {
    return text.trim();
  }

  return `${original}\n---\n${translation}`;
}

export function parseContextWindowXml(content: string): string {
  const normalized = normalizeAiContent(content);
  const dynamicContextBlock = normalizeContextSeparator(
    extractXmlTag(normalized, 'dynamic_context_block'),
  );

  if (!dynamicContextBlock) {
    throw new Error('AI returned an empty context window.');
  }

  return dynamicContextBlock;
}
