import { describe, expect, it } from 'vitest';
import {
  extractOpenAiSseDeltas,
  parseOpenAiSseEvent,
} from './parseOpenAiSse';

describe('parseOpenAiSseEvent', () => {
  it('extracts a text delta from a data line', () => {
    expect(
      parseOpenAiSseEvent(
        'data: {"choices":[{"delta":{"content":"Hello"}}]}',
      ),
    ).toEqual({ kind: 'delta', content: 'Hello' });
  });

  it('returns done for the [DONE] sentinel', () => {
    expect(parseOpenAiSseEvent('data: [DONE]')).toEqual({ kind: 'done' });
  });

  it('skips blank lines and comments', () => {
    expect(parseOpenAiSseEvent('')).toEqual({ kind: 'skip' });
    expect(parseOpenAiSseEvent(': keep-alive')).toEqual({ kind: 'skip' });
  });

  it('skips malformed JSON without throwing', () => {
    expect(parseOpenAiSseEvent('data: {not-json')).toEqual({ kind: 'skip' });
  });

  it('skips chunks with no content delta', () => {
    expect(
      parseOpenAiSseEvent('data: {"choices":[{"delta":{},"finish_reason":null}]}'),
    ).toEqual({ kind: 'skip' });
  });
});

describe('extractOpenAiSseDeltas', () => {
  it('parses multiple SSE events from a buffer', () => {
    const buffer = [
      'data: {"choices":[{"delta":{"content":"Hel"}}]}',
      '',
      'data: {"choices":[{"delta":{"content":"lo"}}]}',
      '',
      'data: [DONE]',
      '',
    ].join('\n');

    expect(extractOpenAiSseDeltas(buffer)).toEqual({
      deltas: ['Hel', 'lo'],
      rest: '',
      done: true,
    });
  });

  it('keeps a trailing partial line in rest', () => {
    const buffer = 'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\ndata: {"cho';

    expect(extractOpenAiSseDeltas(buffer)).toEqual({
      deltas: ['Hi'],
      rest: 'data: {"cho',
      done: false,
    });
  });
});
