import {
  hasSnippetChatBulletDrag,
  readSnippetChatBulletDragText,
  type LanguageCardEditorSlotKey,
} from '@semia/shared';
import { useState, type ReactNode } from 'react';

type LanguageCardSlotDropZoneProps = {
  slot: LanguageCardEditorSlotKey;
  disabled?: boolean;
  onAppend: (slot: LanguageCardEditorSlotKey, text: string) => void;
  children: ReactNode;
  className?: string;
};

export function LanguageCardSlotDropZone({
  slot,
  disabled = false,
  onAppend,
  children,
  className = '',
}: LanguageCardSlotDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={[
        className,
        dragOver && !disabled
          ? 'rounded-lg ring-2 ring-accent/40 ring-offset-1 ring-offset-surface'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onDragEnter={(event) => {
        if (disabled || !hasSnippetChatBulletDrag(event.dataTransfer)) {
          return;
        }
        event.preventDefault();
        setDragOver(true);
      }}
      onDragOver={(event) => {
        if (disabled || !hasSnippetChatBulletDrag(event.dataTransfer)) {
          return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setDragOver(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
          return;
        }
        setDragOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        if (disabled) {
          return;
        }
        const text = readSnippetChatBulletDragText(event.dataTransfer);
        if (text) {
          onAppend(slot, text);
        }
      }}
    >
      {children}
    </div>
  );
}
