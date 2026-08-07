import type { CSSProperties, ReactNode } from 'react';
import './darkModeOverrides.css';
import type { DarkModeVariant } from './darkModeVariants';

export function DarkModeThemeScope({
  variant,
  children,
}: {
  variant: DarkModeVariant;
  children: ReactNode;
}) {
  return (
    <div
      className="dark-mode-proto h-full min-h-0"
      data-dark-mode-variant={variant.key}
      style={variant.vars as CSSProperties}
    >
      {children}
    </div>
  );
}
