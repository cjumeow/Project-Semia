import { describe, expect, it } from 'vitest';
import { parseBaseFormSuggestion } from './baseFormSuggestion';

describe('parseBaseFormSuggestion', () => {
  it('parses inflected surface to dictionary base form', () => {
    expect(parseBaseFormSuggestion('BASE_FORM: run')).toEqual({
      baseForm: 'run',
    });
    expect(parseBaseFormSuggestion('{"baseForm":"食べる"}')).toEqual({
      baseForm: '食べる',
    });
  });

  it('returns null when already canonical', () => {
    expect(parseBaseFormSuggestion('BASE_FORM: null')).toEqual({
      baseForm: null,
    });
    expect(parseBaseFormSuggestion('{"baseForm":null}')).toEqual({
      baseForm: null,
    });
    expect(parseBaseFormSuggestion('BASE_FORM: none')).toEqual({
      baseForm: null,
    });
  });

  it('returns null for Chinese-like no-inflection responses', () => {
    expect(parseBaseFormSuggestion('BASE_FORM: null')).toEqual({
      baseForm: null,
    });
    expect(parseBaseFormSuggestion('')).toEqual({ baseForm: null });
  });
});
