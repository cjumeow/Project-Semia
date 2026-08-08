export type CursorGhostSuggestionMode = 'baseForm' | 'completion';

export type CursorGhostSuggestionView = {
  showGhost: boolean;
  showBaseFormArrow: boolean;
  ghostSuffix: string | null;
  showActions: boolean;
};

export function resolveCursorGhostSuggestionView({
  value,
  suggestion,
  mode,
  loading = false,
}: {
  value: string;
  suggestion: string | null;
  mode: CursorGhostSuggestionMode;
  loading?: boolean;
}): CursorGhostSuggestionView {
  if (loading) {
    return {
      showGhost: false,
      showBaseFormArrow: false,
      ghostSuffix: null,
      showActions: false,
    };
  }

  if (!suggestion) {
    return {
      showGhost: false,
      showBaseFormArrow: false,
      ghostSuffix: null,
      showActions: false,
    };
  }

  if (mode === 'baseForm') {
    const showBaseForm =
      suggestion.trim().toLowerCase() !== value.trim().toLowerCase();
    return {
      showGhost: showBaseForm,
      showBaseFormArrow: showBaseForm,
      ghostSuffix: null,
      showActions: showBaseForm,
    };
  }

  if (!suggestion.startsWith(value) || suggestion === value) {
    return {
      showGhost: false,
      showBaseFormArrow: false,
      ghostSuffix: null,
      showActions: false,
    };
  }

  return {
    showGhost: true,
    showBaseFormArrow: false,
    ghostSuffix: suggestion.slice(value.length),
    showActions: true,
  };
}
