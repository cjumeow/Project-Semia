// @vitest-environment happy-dom
import { act } from 'react';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { DraggableAssistantMarkdown } from './DraggableAssistantMarkdown';

function renderMarkdown(streaming: boolean) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(
      createElement(DraggableAssistantMarkdown, {
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: '1. 核心詞彙\n\n2. 文中相關搭配',
          streaming,
        },
      }),
    );
  });

  return {
    cleanup: () => {
      root.unmount();
      container.remove();
    },
  };
}

describe('DraggableAssistantMarkdown streaming layout', () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
  });

  it('keeps drag chrome visible while streaming', () => {
    ({ cleanup } = renderMarkdown(true));
    const listItems = document.querySelectorAll('.prose-chat li');
    expect(listItems.length).toBeGreaterThan(0);
    for (const item of listItems) {
      expect(item.classList.contains('semia-chat-drag-block')).toBe(true);
    }
  });

  it('enables drag interactions after streaming completes', () => {
    ({ cleanup } = renderMarkdown(false));
    const listItems = document.querySelectorAll('.prose-chat li');
    expect(listItems.length).toBeGreaterThan(0);
    for (const item of listItems) {
      expect(item.classList.contains('semia-chat-drag-block')).toBe(true);
      expect(item.getAttribute('draggable')).toBe('true');
    }
  });
});
