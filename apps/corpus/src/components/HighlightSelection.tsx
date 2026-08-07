import type { ReactNode } from 'react';
import { splitTextBySelection } from '../utils/highlightSelectionInText';

type HighlightSelectionProps = {
  text: string;
  selection: string;
  markClassName?: string;
};

export function HighlightSelection({
  text,
  selection,
  markClassName = 'rounded-sm px-0.5 semia-selection-mark',
}: HighlightSelectionProps): ReactNode {
  const segments = splitTextBySelection(text, selection);

  return (
    <>
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <mark key={index} className={markClassName}>
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </>
  );
}
