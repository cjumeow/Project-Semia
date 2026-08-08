export const LANGUAGE_CARD_OPTIONAL_FIELD_KEYS = [
  'example',
  'usageNote',
  'dialogue',
  'pitfalls',
  'personalNote',
] as const;

export type LanguageCardOptionalFieldKey =
  (typeof LANGUAGE_CARD_OPTIONAL_FIELD_KEYS)[number];

export type LanguageCardOptionalFieldDef = {
  key: LanguageCardOptionalFieldKey;
  chipLabel: string;
  fieldLabel: string;
  placeholder: string;
};

export const LANGUAGE_CARD_OPTIONAL_FIELD_DEFS: LanguageCardOptionalFieldDef[] = [
  {
    key: 'example',
    chipLabel: 'Example',
    fieldLabel: 'Example',
    placeholder: 'Example sentence using the focus word or phrase',
  },
  {
    key: 'usageNote',
    chipLabel: 'Usage',
    fieldLabel: 'Usage',
    placeholder: 'When or how to use this expression',
  },
  {
    key: 'dialogue',
    chipLabel: 'Dialogue',
    fieldLabel: 'Dialogue',
    placeholder: 'A short back-and-forth showing the expression in context',
  },
  {
    key: 'pitfalls',
    chipLabel: 'Pitfalls',
    fieldLabel: 'Pitfalls',
    placeholder: 'Wrong: … → Better: …',
  },
  {
    key: 'personalNote',
    chipLabel: 'My note',
    fieldLabel: 'My note',
    placeholder: 'Personal reminder or takeaway for yourself',
  },
];

export function isLanguageCardOptionalFieldKey(
  value: string,
): value is LanguageCardOptionalFieldKey {
  return (LANGUAGE_CARD_OPTIONAL_FIELD_KEYS as readonly string[]).includes(value);
}

export function optionalFieldDefForKey(
  key: LanguageCardOptionalFieldKey,
): LanguageCardOptionalFieldDef {
  return (
    LANGUAGE_CARD_OPTIONAL_FIELD_DEFS.find((field) => field.key === key) ??
    LANGUAGE_CARD_OPTIONAL_FIELD_DEFS[0]!
  );
}
