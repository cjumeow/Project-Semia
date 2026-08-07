// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

const baseCss = `
.prose-chat {
  --semia-chat-list-padding: 1.1rem;
  --semia-chat-drag-inset-x: 0.375rem;
  --semia-chat-drag-inset-y: 0.125rem;
}
.prose-chat ol {
  padding-left: 1.1rem;
  list-style: decimal;
}
.prose-chat li > p {
  margin: 0;
}
.prose-chat .semia-chat-drag-block {
  position: relative;
  border: 2px solid transparent;
}
.prose-chat li.semia-chat-drag-block::before {
  content: '';
  position: absolute;
  top: calc(-1 * var(--semia-chat-drag-inset-y));
  right: calc(-1 * var(--semia-chat-drag-inset-x));
  bottom: calc(-1 * var(--semia-chat-drag-inset-y));
  left: calc(-1 * var(--semia-chat-list-padding) - var(--semia-chat-drag-inset-x));
  border: 2px solid transparent;
}
`;

function setupListItem() {
  const style = document.createElement('style');
  style.textContent = baseCss;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.innerHTML = `
    <div class="prose-chat">
      <ol>
        <li class="semia-chat-drag-block">核心詞彙</li>
      </ol>
    </div>
  `;
  document.body.appendChild(root);

  const li = root.querySelector('li');
  if (!li) {
    throw new Error('expected list item markup');
  }

  return {
    li,
    cleanup: () => {
      root.remove();
      style.remove();
    },
  };
}

describe('chat list drag layout', () => {
  it('does not change list marker positioning on drag blocks', () => {
    const { li, cleanup } = setupListItem();

    const marginLeft = getComputedStyle(li).marginLeft;
    expect(marginLeft === '0px' || marginLeft === '').toBe(true);

    cleanup();
  });
});
