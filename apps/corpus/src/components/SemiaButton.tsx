import type { ButtonHTMLAttributes, ReactNode } from 'react';

type SemiaButtonVariant = 'accent' | 'ghost' | 'danger';

type SemiaButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: SemiaButtonVariant;
  icon?: ReactNode;
};

const variantClass: Record<SemiaButtonVariant, string> = {
  accent:
    'border-accent/30 bg-accent-soft text-accent hover:border-accent/50 hover:bg-accent-soft/80',
  ghost:
    'border-border bg-canvas text-text-secondary hover:border-accent/40 hover:bg-accent-soft hover:text-accent',
  danger:
    'border-border bg-canvas text-text-muted hover:border-red-300 hover:bg-red-50 hover:text-red-700',
};

export function SemiaButton({
  variant = 'ghost',
  icon,
  className,
  children,
  type = 'button',
  ...props
}: SemiaButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5',
        'font-mono text-[11px] font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClass[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
