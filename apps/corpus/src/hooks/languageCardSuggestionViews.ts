import type { LanguageCardSuggestionField } from './languageCardSuggestionLogic';

export type LanguageCardFieldSuggestionView = {
  suggestion: string | null;
  loading: boolean;
  visible: boolean;
  accept: () => void;
  dismiss: () => void;
};

const EMPTY_VIEW: LanguageCardFieldSuggestionView = {
  suggestion: null,
  loading: false,
  visible: false,
  accept: () => {},
  dismiss: () => {},
};

export function buildSuggestionFieldView({
  suggestion,
  dismissed,
  onAccept,
  onDismiss,
}: {
  suggestion: string | null;
  dismissed: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}): LanguageCardFieldSuggestionView {
  const hasSuggestion = Boolean(suggestion?.trim());

  return {
    suggestion: dismissed ? null : suggestion,
    loading: false,
    visible: !dismissed && hasSuggestion,
    accept: onAccept,
    dismiss: onDismiss,
  };
}

export function gateSuggestionView(
  enabled: boolean,
  focusedField: LanguageCardSuggestionField | null,
  field: LanguageCardSuggestionField,
  view: LanguageCardFieldSuggestionView,
): LanguageCardFieldSuggestionView {
  if (!enabled || focusedField !== field || !view.visible) {
    return EMPTY_VIEW;
  }

  return view;
}
