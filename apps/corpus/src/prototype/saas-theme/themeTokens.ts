const inter =
  "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/** Press-forward theme — shared across prototype. */
export const SAAS_THEME = {
  key: 'B' as const,
  label: 'Press-forward',
  selectionMode: 'fill' as const,
  vars: {
    '--font-display': inter,
    '--font-sans': inter,
    '--font-serif': inter,
    '--color-shelf': '#F8FAFC',
    '--color-canvas': '#FFFFFF',
    '--color-surface': '#FFFFFF',
    '--color-border': '#E2E8F0',
    '--color-border-strong': '#CBD5E1',
    '--color-text': '#111827',
    '--color-text-secondary': '#475569',
    '--color-text-muted': '#64748B',
    '--color-accent': '#4493D4',
    '--color-accent-soft': '#EBF5FF',
    '--proto-accent-press': '#3580C4',
    '--proto-language-card': '#1F57D1',
    '--proto-context-collapsed': '#F1F5F9',
    '--proto-section-label': '#0F172A',
    '--proto-hover': 'rgba(15, 23, 42, 0.05)',
  },
};
