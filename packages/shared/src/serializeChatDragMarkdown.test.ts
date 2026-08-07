// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import {
  isListContainerLi,
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

  it('serializes nested list subtree when parent has child lists', () => {
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
    expect(serializeListItemForTest(parentLi)).toBe('- Parent\n  - Child');
  });

  it('serializes ordered list parent with nested bullet subtree', () => {
    const root = el(`
      <ol>
        <li>
          123
          <ul>
            <li>456</li>
            <li>789</li>
          </ul>
        </li>
      </ol>
    `);
    const parentLi = root.querySelector('ol > li') as HTMLLIElement;
    expect(serializeDragRootElement(parentLi)).toBe(
      '- 123\n  - 456\n  - 789',
    );
  });

  it('absorbs sibling ul after last ordered-list item (flat GFM DOM)', () => {
    const root = el(`
      <div>
        <ol>
          <li>123</li>
        </ol>
        <ul>
          <li>456</li>
          <li>789</li>
        </ul>
      </div>
    `);
    const parentLi = root.querySelector('ol > li') as HTMLLIElement;
    expect(serializeDragRootElement(parentLi)).toBe(
      '- 123\n  - 456\n  - 789',
    );
    expect(isListContainerLi(parentLi)).toBe(true);
  });

  it('serializes list item with inner paragraph and nested bullets', () => {
    const root = el(`
      <ol>
        <li>
          <p>核心差异</p>
          <ul>
            <li>口语</li>
            <li>书面</li>
          </ul>
        </li>
      </ol>
    `);
    const parentLi = root.querySelector('ol > li') as HTMLLIElement;
    expect(isListContainerLi(parentLi)).toBe(true);
    expect(serializeDragRootElement(parentLi)).toBe(
      '- 核心差异\n  - 口语\n  - 书面',
    );
    expect(serializeDragRootElement(root.querySelector('ul > li') as HTMLLIElement)).toBe(
      '- 口语',
    );
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

  it('dedupes descendant roots when parent subtree is also selected', () => {
    const root = el(`
      <ul>
        <li>
          Parent
          <ul>
            <li>Child one</li>
            <li>Child two</li>
          </ul>
        </li>
      </ul>
    `);
    const parentLi = root.querySelector('ul > li') as HTMLLIElement;
    const childLis = Array.from(
      root.querySelectorAll('ul ul > li'),
    ) as HTMLLIElement[];

    expect(serializeDragElements([parentLi, ...childLis])).toBe(
      '- Parent\n  - Child one\n  - Child two',
    );
  });

  it('dedupes flat sibling bullets when ordered parent is also selected', () => {
    const root = el(`
      <div>
        <ol>
          <li>123</li>
        </ol>
        <ul>
          <li>456</li>
          <li>789</li>
        </ul>
      </div>
    `);
    const parentLi = root.querySelector('ol > li') as HTMLLIElement;
    const childLis = Array.from(
      root.querySelectorAll('ul > li'),
    ) as HTMLLIElement[];

    expect(serializeDragElements([parentLi, ...childLis])).toBe(
      '- 123\n  - 456\n  - 789',
    );
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
