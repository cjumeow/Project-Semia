// @vitest-environment happy-dom
import { act } from 'react';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { DraggableAssistantMarkdown } from './DraggableAssistantMarkdown';
import { SnippetChatDragModeProvider } from './SnippetChatDragModeContext';

function renderMarkdown(streaming: boolean, dragModeEnabled = false) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(
      createElement(SnippetChatDragModeProvider, {
        enabled: dragModeEnabled,
        children: createElement(DraggableAssistantMarkdown, {
          message: {
            id: 'msg-1',
            role: 'assistant',
            content: '1. 核心詞彙\n\n2. 文中相關搭配',
            streaming,
          },
        }),
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

  it('enables drag interactions after streaming completes when drag mode is on', () => {
    ({ cleanup } = renderMarkdown(false, true));
    const listItems = document.querySelectorAll('.prose-chat li');
    expect(listItems.length).toBeGreaterThan(0);
    for (const item of listItems) {
      expect(item.classList.contains('semia-chat-drag-block')).toBe(true);
      expect(item.getAttribute('draggable')).toBe('true');
    }
  });

  it('keeps drag disabled in read mode after streaming completes', () => {
    ({ cleanup } = renderMarkdown(false, false));
    const listItems = document.querySelectorAll('.prose-chat li');
    expect(listItems.length).toBeGreaterThan(0);
    for (const item of listItems) {
      expect(item.classList.contains('semia-chat-drag-block')).toBe(true);
      expect(item.getAttribute('draggable')).toBeNull();
    }
  });
});
