export type OpenAiSseEvent =
  | { kind: 'delta'; content: string }
  | { kind: 'done' }
  | { kind: 'skip' };

type OpenAiSseChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
};

export function parseOpenAiSseEvent(line: string): OpenAiSseEvent {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith(':')) {
    return { kind: 'skip' };
  }

  if (!trimmed.startsWith('data:')) {
    return { kind: 'skip' };
  }

  const payload = trimmed.slice('data:'.length).trim();
  if (!payload) {
    return { kind: 'skip' };
  }

  if (payload === '[DONE]') {
    return { kind: 'done' };
  }

  try {
    const parsed = JSON.parse(payload) as OpenAiSseChunk;
    const content = parsed.choices?.[0]?.delta?.content;
    if (typeof content === 'string' && content.length > 0) {
      return { kind: 'delta', content };
    }
  } catch {
    return { kind: 'skip' };
  }

  return { kind: 'skip' };
}

export function extractOpenAiSseDeltas(buffer: string): {
  deltas: string[];
  rest: string;
  done: boolean;
} {
  const lines = buffer.split('\n');
  const rest = lines.pop() ?? '';
  const deltas: string[] = [];
  let done = false;

  for (const line of lines) {
    const event = parseOpenAiSseEvent(line);
    if (event.kind === 'delta') {
      deltas.push(event.content);
    } else if (event.kind === 'done') {
      done = true;
    }
  }

  return { deltas, rest, done };
}
