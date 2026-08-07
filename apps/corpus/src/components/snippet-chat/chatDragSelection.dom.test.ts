// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { eventTargetsChatDragBlock } from './chatDragSelection';

describe('eventTargetsChatDragBlock', () => {
  it('detects drag blocks in the event path', () => {
    const block = document.createElement('p');
    block.className = 'semia-chat-drag-block';
    const outside = document.createElement('div');
    outside.appendChild(block);

    expect(
      eventTargetsChatDragBlock({
        composedPath: () => [block, outside, document.body],
      }),
    ).toBe(true);
    expect(
      eventTargetsChatDragBlock({
        composedPath: () => [outside, document.body],
      }),
    ).toBe(false);
  });
});
