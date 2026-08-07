// @vitest-environment happy-dom
import { appendMarkdownToSlot } from '@semia/shared';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { describe, expect, it } from 'vitest';

function createEditor(content = '') {
  return new Editor({
    extensions: [StarterKit, Markdown],
    content,
    contentType: 'markdown',
  });
}

function firstBulletList(editor: Editor) {
  return editor.getJSON().content?.find(
    (node: { type: string }) => node.type === 'bulletList',
  ) as
    | {
        type: 'bulletList';
        content: Array<{ type: string; content?: unknown[] }>;
      }
    | undefined;
}

describe('tiptap multi-bullet insert', () => {
  it('keeps sibling bullets flat when payload uses single newlines', () => {
    const payload = '- 口語：通常直接說\n- 書面：在正式文件';
    const editor = createEditor();
    const end = editor.state.doc.content.size;
    editor.commands.insertContentAt(end, payload, { contentType: 'markdown' });
    const list = firstBulletList(editor);
    expect(list?.content).toHaveLength(2);
    expect(list?.content.every((node) => node.type === 'listItem')).toBe(true);
    editor.destroy();
  });

  it('nests second bullet when payload uses child indent on same line', () => {
    const payload = '- 口語：通常直接說\n  - 書面：在正式文件';
    const editor = createEditor();
    const end = editor.state.doc.content.size;
    editor.commands.insertContentAt(end, payload, { contentType: 'markdown' });
    const firstItem = firstBulletList(editor)?.content?.[0];
    const nestedList = (firstItem?.content as Array<{ type: string }> | undefined)?.find(
      (node) => node.type === 'bulletList',
    );
    expect(nestedList).toBeDefined();
    editor.destroy();
  });

  it('appends ordered list items without extra blank paragraphs', () => {
    const editor = createEditor('1. First item\n2. Second item');
    const merged = appendMarkdownToSlot(
      editor.getMarkdown(),
      '3. Third item\n4. Fourth item',
    );
    editor.commands.setContent(merged, { contentType: 'markdown' });

    const markdown = editor.getMarkdown();
    expect(markdown).not.toMatch(/2\. Second item\n\n3\. Third item/);
    expect(markdown).toMatch(/2\. Second item\n3\. Third item/);
    editor.destroy();
  });
});
