export type FocusKeywordChipTheme = 'dark' | 'light';

export type FocusKeywordCursorClasses = {
  chip: string;
  chipActive: string;
  action: string;
};

export function focusKeywordCursorClasses(
  theme: FocusKeywordChipTheme,
): FocusKeywordCursorClasses {
  if (theme === 'light') {
    return {
      chip: 'rounded-md border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-800 shadow-sm transition-colors hover:text-zinc-500',
      chipActive:
        'rounded-md border border-zinc-400 bg-zinc-200 px-2.5 py-0.5 text-[11px] font-medium text-zinc-900 shadow-sm',
      action:
        'rounded-md border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-800 shadow-lg transition-colors hover:text-zinc-500',
    };
  }

  return {
    chip: 'rounded-md border border-zinc-500 bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-zinc-100 shadow-sm transition-colors hover:text-zinc-400',
    chipActive:
      'rounded-md border border-zinc-400 bg-zinc-700 px-2.5 py-0.5 text-[11px] font-medium text-white shadow-sm',
    action:
      'rounded-md border border-zinc-500 bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-100 shadow-lg transition-colors hover:text-zinc-400',
  };
}
