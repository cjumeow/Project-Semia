// @vitest-environment happy-dom
import { act } from 'react';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { DraggableAssistantMarkdown } from './DraggableAssistantMarkdown';
import { SnippetChatDragModeProvider } from './SnippetChatDragModeContext';

const message = {
  id: 'msg-1',
  role: 'assistant' as const,
  content: '1. 核心詞彙\n\n2. 文中相關搭配',
};

function renderMarkdown(dragModeEnabled: boolean) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(
      createElement(SnippetChatDragModeProvider, {
        enabled: dragModeEnabled,
        children: createElement(DraggableAssistantMarkdown, { message }),
      }),
    );
  });

  return {
    root,
    cleanup: () => {
      root.unmount();
      container.remove();
    },
  };
}

function blockClassNames(): string[] {
  return [...document.querySelectorAll('.prose-chat li')].map(
    (item) => item.className,
  );
}

describe('DraggableAssistantMarkdown drag mode', () => {
  let cleanup: (() => void) | undefined;
  let root: Root | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    root = undefined;
  });

  it('keeps block class names stable when drag mode turns on', () => {
    ({ root, cleanup } = renderMarkdown(false));
    const readModeClasses = blockClassNames();

    act(() => {
      root!.render(
        createElement(SnippetChatDragModeProvider, {
          enabled: true,
          children: createElement(DraggableAssistantMarkdown, { message }),
        }),
      );
    });

    expect(blockClassNames()).toEqual(readModeClasses);
  });

  it('enables draggable only when drag mode is on', () => {
    ({ cleanup } = renderMarkdown(false));
    for (const item of document.querySelectorAll('.prose-chat li')) {
      expect(item.getAttribute('draggable')).toBeNull();
    }

    cleanup();
    ({ cleanup } = renderMarkdown(true));
    for (const item of document.querySelectorAll('.prose-chat li')) {
      expect(item.getAttribute('draggable')).toBe('true');
    }
  });

  it('reflects drag mode on the prose container without remounting markdown', () => {
    ({ root, cleanup } = renderMarkdown(false));
    expect(document.querySelector('.prose-chat')?.getAttribute('data-drag-mode')).toBe(
      'off',
    );

    act(() => {
      root!.render(
        createElement(SnippetChatDragModeProvider, {
          enabled: true,
          children: createElement(DraggableAssistantMarkdown, { message }),
        }),
      );
    });

    expect(document.querySelector('.prose-chat')?.getAttribute('data-drag-mode')).toBe(
      'on',
    );
  });
});
