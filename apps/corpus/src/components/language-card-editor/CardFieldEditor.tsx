import { Markdown } from '@tiptap/markdown';
import { appendMarkdownToSlot } from '@semia/shared';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { hasSnippetChatBulletDrag } from '@semia/shared';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import './cardFieldEditor.css';

export type CardFieldEditorHandle = {
  insertMarkdown: (markdown: string) => void;
};

type CardFieldEditorProps = {
  value: string;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  onChange: (value: string) => void;
};

export const CardFieldEditor = forwardRef<
  CardFieldEditorHandle,
  CardFieldEditorProps
>(function CardFieldEditor(
  {
    value,
    disabled = false,
    placeholder,
    minHeight = 120,
    className = '',
    onChange,
  },
  ref,
) {
  const lastEmittedRef = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({
        placeholder: placeholder ?? '',
      }),
    ],
    content: value,
    contentType: 'markdown',
    editable: !disabled,
    editorProps: {
      handleDrop: (_view, event) =>
        event.dataTransfer !== null &&
        hasSnippetChatBulletDrag(event.dataTransfer),
      handleScrollToSelection: () => true,
    },
    onUpdate: ({ editor: nextEditor }) => {
      const markdown = nextEditor.getMarkdown();
      lastEmittedRef.current = markdown;
      onChange(markdown);
    },
  });

  useImperativeHandle(
    ref,
    () => ({
      insertMarkdown(markdown: string) {
        const trimmed = markdown.trim();
        if (!editor || !trimmed) {
          return;
        }

        const merged = appendMarkdownToSlot(editor.getMarkdown(), trimmed);
        editor.commands.setContent(merged, { contentType: 'markdown' });
      },
    }),
    [editor],
  );

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor || value === lastEmittedRef.current) {
      return;
    }
    lastEmittedRef.current = value;
    editor.commands.setContent(value, {
      contentType: 'markdown',
      emitUpdate: false,
    });
  }, [editor, value]);

  return (
    <div
      className={`semia-card-field-editor language-card-field-inset language-card-field-input ${className}`.trim()}
      style={{ minHeight }}
    >
      <EditorContent editor={editor} />
    </div>
  );
});
