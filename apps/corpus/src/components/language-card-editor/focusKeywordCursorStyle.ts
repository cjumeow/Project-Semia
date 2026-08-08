export type FocusKeywordCursorClasses = {
  chip: string;
  chipActive: string;
  action: string;
};

export function focusKeywordCursorClasses(): FocusKeywordCursorClasses {
  return {
    chip:
      'rounded-md border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-800 shadow-sm transition-colors hover:text-zinc-500 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:text-zinc-400',
    chipActive:
      'rounded-md border border-zinc-400 bg-zinc-200 px-2.5 py-0.5 text-[11px] font-medium text-zinc-900 shadow-sm dark:border-zinc-400 dark:bg-zinc-700 dark:text-white',
    action:
      'rounded-md border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-800 shadow-lg transition-colors hover:text-zinc-500 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:text-zinc-400',
  };
}
