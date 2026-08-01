import type { ReactNode } from 'react';
import { splitTextBySelection } from '../utils/highlightSelectionInText';

type HighlightSelectionProps = {
  text: string;
  selection: string;
};

export function HighlightSelection({
  text,
  selection,
}: HighlightSelectionProps): ReactNode {
  const segments = splitTextBySelection(text, selection);

  return (
    <>
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <mark
            key={index}
            className="rounded-sm bg-[#FFEB3B] px-0.5 text-inherit"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </>
  );
}
