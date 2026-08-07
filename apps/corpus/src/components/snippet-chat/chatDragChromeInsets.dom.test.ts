// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

const dragChromeCss = `
.prose-chat {
  --semia-chat-list-padding: 1.1rem;
  --semia-chat-drag-inset-x: 0.375rem;
  --semia-chat-drag-inset-y: 0.125rem;
}
.prose-chat p.semia-chat-drag-block::before,
.prose-chat li.semia-chat-drag-block::before {
  content: '';
}
.prose-chat p.semia-chat-drag-block::before {
  left: calc(-1 * var(--semia-chat-drag-inset-x));
}
.prose-chat li.semia-chat-drag-block::before {
  left: calc(-1 * var(--semia-chat-list-padding) - var(--semia-chat-drag-inset-x));
}
`;

describe('chat drag chrome insets', () => {
  it('defines shared inset tokens for paragraphs and lists', () => {
    const style = document.createElement('style');
    style.textContent = dragChromeCss;
    document.head.appendChild(style);

    const prose = document.createElement('div');
    prose.className = 'prose-chat';
    document.body.appendChild(prose);

    const computed = getComputedStyle(prose);
    expect(computed.getPropertyValue('--semia-chat-drag-inset-x').trim()).toBe(
      '0.375rem',
    );
    expect(
      computed.getPropertyValue('--semia-chat-list-padding').trim(),
    ).toBe('1.1rem');
    expect(style.textContent).toContain(
      'left: calc(-1 * var(--semia-chat-drag-inset-x))',
    );
    expect(style.textContent).toContain(
      'left: calc(-1 * var(--semia-chat-list-padding) - var(--semia-chat-drag-inset-x))',
    );

    prose.remove();
    style.remove();
  });
});
