import { describe, expect, it } from 'vitest';
import {
  CUE_BATCH_SEPARATOR,
  isBatchSplitHealthy,
  joinCueBatch,
  splitCueBatch,
} from './translateCueBatch';
import { parseGtxTranslateResponse } from './translateGtx';

describe('joinCueBatch / splitCueBatch', () => {
  it('round-trips cue texts via newline separator', () => {
    const cues = ['Hello world', 'Second cue', 'Third'];
    const joined = joinCueBatch(cues);
    expect(joined).toContain(CUE_BATCH_SEPARATOR);
    expect(splitCueBatch(joined, cues.length)).toEqual(cues);
  });

  it('pads missing trailing parts when split count mismatches', () => {
    expect(splitCueBatch('only one', 3)).toEqual(['only one', '', '']);
  });

  it('flags merged GTX blob when separator was lost', () => {
    const merged =
      '地球大約有四億五億年的歷史，文明只有五千年的歷史。';
    expect(isBatchSplitHealthy(merged, 3)).toBe(false);
    expect(splitCueBatch(merged, 3)[0]).toBe(merged);
  });

  it('accepts healthy newline-separated GTX response', () => {
    const translated = '第一句。\n第二句。\n第三句。';
    expect(isBatchSplitHealthy(translated, 3)).toBe(true);
    expect(splitCueBatch(translated, 3)).toEqual(['第一句。', '第二句。', '第三句。']);
  });
});

describe('parseGtxTranslateResponse', () => {
  it('joins nested translation parts', () => {
    const data = [[['你好', 'zh-TW', null, null, 3]], null, 'zh-TW'];
    expect(parseGtxTranslateResponse(data)).toBe('你好');
  });
});
