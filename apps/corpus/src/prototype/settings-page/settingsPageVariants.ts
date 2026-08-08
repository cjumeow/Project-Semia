export type SettingsPageVariantKey = 'A' | 'B' | 'C';

export type SettingsPageVariant = {
  key: SettingsPageVariantKey;
  label: string;
  description: string;
};

export const SETTINGS_PAGE_VARIANTS: SettingsPageVariant[] = [
  {
    key: 'A',
    label: 'Stacked sections',
    description: 'Single scroll column with grouped toggle rows (dialog expanded).',
  },
  {
    key: 'B',
    label: 'Sidebar nav',
    description: 'Cursor-style left nav + right pane per section.',
  },
  {
    key: 'C',
    label: 'Card grid',
    description: 'Two-column dashboard tiles; fields as toggle chips.',
  },
];

export function readSettingsPageVariantKey(): SettingsPageVariantKey {
  const value = new URLSearchParams(window.location.search).get('variant');
  if (value === 'B' || value === 'C') return value;
  return 'A';
}

export function settingsPageVariantForKey(
  key: SettingsPageVariantKey,
): SettingsPageVariant {
  return (
    SETTINGS_PAGE_VARIANTS.find((entry) => entry.key === key) ??
    SETTINGS_PAGE_VARIANTS[0]!
  );
}
