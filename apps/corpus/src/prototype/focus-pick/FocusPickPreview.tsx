import type { FocusPickVariantKey } from './focusPickVariants';
import {
  VariantAFocusPick,
  VariantBFocusPick,
  VariantCFocusPick,
} from './focusPickVariantComponents';
import type { FocusPickState } from './focusPickShared';

type FocusPickPreviewProps = {
  variant: FocusPickVariantKey;
  state: FocusPickState;
  onFocusChange: (text: string, action: string) => void;
};

export function FocusPickPreview({
  variant,
  state,
  onFocusChange,
}: FocusPickPreviewProps) {
  switch (variant) {
    case 'B':
      return <VariantBFocusPick state={state} onFocusChange={onFocusChange} />;
    case 'C':
      return <VariantCFocusPick state={state} onFocusChange={onFocusChange} />;
    default:
      return <VariantAFocusPick state={state} onFocusChange={onFocusChange} />;
  }
}
