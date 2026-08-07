// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import {
  serializeDragElements,
  serializeDragRootElement,
  serializeListItemForTest,
} from './serializeChatDragMarkdown';

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

  it('serializes shallow list item without nested children', () => {
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
    expect(serializeDragRootElement(parentLi)).toBe('- Parent');
    expect(serializeListItemForTest(parentLi)).toBe('- Parent\n  - Child');
  });

  it('returns empty string for empty paragraph', () => {
    expect(serializeDragRootElement(el('<p>   </p>'))).toBe('');
  });

  it('returns empty string for null', () => {
    expect(serializeDragRootElement(null)).toBe('');
  });
});

describe('serializeDragElements', () => {
  it('joins sibling bullets with single newlines', () => {
    expect(
      serializeDragElements([
        el('<li>First</li>'),
        el('<li>Second</li>'),
      ]),
    ).toBe('- First\n- Second');
  });

  it('joins paragraph and bullet with blank line', () => {
    expect(
      serializeDragElements([el('<p>Heading</p>'), el('<li>Item</li>')]),
    ).toBe('Heading\n\n- Item');
  });

  it('skips empty roots', () => {
    expect(serializeDragElements([el('<p>Only</p>'), null])).toBe('Only');
  });
});

describe('serializeChatDragMarkdown nested DOM', () => {
  it('normalizes nested-ul siblings to top-level bullets', () => {
    const root = el(`
      <ul>
        <li>
          <ul>
            <li>口語：通常直接說</li>
            <li>書面：在正式文件</li>
          </ul>
        </li>
      </ul>
    `);
    const items = Array.from(root.querySelectorAll('ul ul > li'));
    expect(serializeDragElements(items)).toBe(
      '- 口語：通常直接說\n- 書面：在正式文件',
    );
  });
});
