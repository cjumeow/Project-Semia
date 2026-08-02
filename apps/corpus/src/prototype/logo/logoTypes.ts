import type { ReactNode } from 'react';

export type LogoVariantProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
};

export type LogoVariantContent = {
  name: string;
  tagline: string;
  Mark: (props: LogoVariantProps) => ReactNode;
  Wordmark: (props: { className?: string }) => ReactNode;
  Lockup: (props: LogoVariantProps) => ReactNode;
};
