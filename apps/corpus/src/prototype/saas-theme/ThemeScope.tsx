import type { CSSProperties, ReactNode } from 'react';
import './themeOverrides.css';
import { SAAS_THEME } from './themeTokens';

export function ThemeScope({ children }: { children: ReactNode }) {
  return (
    <div
      className="saas-theme-proto h-full min-h-0"
      data-saas-theme={SAAS_THEME.key}
      data-selection-mode={SAAS_THEME.selectionMode}
      style={SAAS_THEME.vars as CSSProperties}
    >
      {children}
    </div>
  );
}
