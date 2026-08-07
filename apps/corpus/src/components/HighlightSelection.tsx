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
            className="rounded-sm px-0.5 semia-selection-mark"
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
