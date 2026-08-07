// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { serializeDragRootElement, serializeDragElements } from './serializeChatDragMarkdown';

function el(html: string): HTMLElement {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild as HTMLElement;
}

describe('serializeDragRootElement', () => {
  it('serializes paragraph text', () => {
    expect(serializeDragRootElement(el('<p>Hello world</p>'))).toBe('Hello world');
  });

  it('serializes top-level list item', () => {
    expect(serializeDragRootElement(el('<li>First item</li>'))).toBe('- First item');
  });

  it('serializes nested list items with indent', () => {
    const root = el(`
      <ul>
        <li>
          Parent
          <ul>
            <li>Child</li>
          </ul>
        </li>
      </ul>
    `);
    const parentLi = root.querySelector('li') as HTMLLIElement;
    expect(serializeDragRootElement(parentLi)).toBe('- Parent\n  - Child');
  });

  it('returns empty string for empty paragraph', () => {
    expect(serializeDragRootElement(el('<p>   </p>'))).toBe('');
  });

  it('returns empty string for null', () => {
    expect(serializeDragRootElement(null)).toBe('');
  });
});

describe('serializeDragElements', () => {
  it('joins multiple blocks with blank lines', () => {
    expect(
      serializeDragElements([
        el('<li>First</li>'),
        el('<li>Second</li>'),
      ]),
    ).toBe('- First\n\n- Second');
  });

  it('skips empty roots', () => {
    expect(serializeDragElements([el('<p>Only</p>'), null])).toBe('Only');
  });
});
