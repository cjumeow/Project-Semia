// @vitest-environment happy-dom
import { act } from 'react';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { DraggableAssistantMarkdown } from './DraggableAssistantMarkdown';

const nestedListMarkdown = `1. 口語用法

   - 直接說「後端」
   - 例如「我負責後端」

2. 書面用法

   - backend architecture`;

const chatListDragCss = `
.prose-chat {
  --semia-chat-list-padding: 1.1rem;
  --semia-chat-drag-inset-x: 0.375rem;
  --semia-chat-drag-inset-y: 0.125rem;
}
.prose-chat :where(ul, ol) { padding-left: 1.1rem; }
.prose-chat ol { list-style: decimal; }
.prose-chat ul { list-style: disc; }
.prose-chat li > :where(p, ul, ol) { margin: 0; }
.prose-chat .semia-chat-drag-block {
  cursor: grab;
  border-radius: 0.375rem;
  border: 2px solid transparent;
  position: relative;
}
.prose-chat li.semia-chat-drag-block {
  border-color: transparent;
}
.prose-chat li.semia-chat-drag-block::before {
  content: '';
  position: absolute;
  top: calc(-1 * var(--semia-chat-drag-inset-y));
  right: calc(-1 * var(--semia-chat-drag-inset-x));
  bottom: calc(-1 * var(--semia-chat-drag-inset-y));
  left: calc(-1 * var(--semia-chat-list-padding) - var(--semia-chat-drag-inset-x));
  border: 2px solid transparent;
  border-radius: 0.375rem;
  pointer-events: none;
}
`;

beforeAll(() => {
  const style = document.createElement('style');
  style.setAttribute('data-test', 'chat-nested-list-layout');
  style.textContent = chatListDragCss;
  document.head.appendChild(style);
});

function renderAssistant(streaming: boolean) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      createElement(DraggableAssistantMarkdown, {
        message: {
          id: 'msg-nested-list',
          role: 'assistant',
          content: nestedListMarkdown,
          streaming,
        },
      }),
    );
  });

  return () => {
    root.unmount();
    container.remove();
  };
}

function topLevelOrderedItems(): HTMLLIElement[] {
  const list = document.querySelector('.prose-chat > ol');
  if (!list) {
    return [];
  }
  return [...list.querySelectorAll(':scope > li')].map(
    (item) => item as HTMLLIElement,
  );
}

describe('nested ordered list layout after streaming', () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
  });

  it('keeps ordered list titles inline with their numbers', () => {
    cleanup = renderAssistant(false);

    const items = topLevelOrderedItems();
    expect(items.length).toBe(2);

    for (const item of items) {
      expect(item.querySelector(':scope > p')).toBeNull();
      expect(item.firstElementChild?.tagName).toBe('UL');
    }
  });

  it('does not apply negative list margins to nested bullet items', () => {
    cleanup = renderAssistant(false);

    const nestedItems = document.querySelectorAll(
      '.prose-chat ol > li ul > li.semia-chat-drag-block',
    );
    expect(nestedItems.length).toBeGreaterThan(0);

    for (const item of nestedItems) {
      const marginLeft = getComputedStyle(item).marginLeft;
      expect(marginLeft === '0px' || marginLeft === '').toBe(true);
    }
  });

  it('uses the same drag chrome while streaming and after completion', () => {
    cleanup = renderAssistant(true);
    const streamingItems = topLevelOrderedItems();
    expect(streamingItems.length).toBe(2);
    for (const item of streamingItems) {
      expect(item.classList.contains('semia-chat-drag-block')).toBe(true);
    }

    cleanup();
    cleanup = renderAssistant(false);
    const completedItems = topLevelOrderedItems();
    expect(completedItems.length).toBe(2);
    for (const item of completedItems) {
      expect(item.classList.contains('semia-chat-drag-block')).toBe(true);
    }
  });
});
