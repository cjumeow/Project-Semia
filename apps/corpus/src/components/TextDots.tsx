type TextDotsProps = React.ComponentProps<'span'> & {
  dots?: number;
};

export function TextDots({
  className,
  children,
  dots = 3,
  ...props
}: TextDotsProps) {
  const dotCount = Number.isFinite(dots) ? Math.max(1, Math.floor(dots)) : 3;
  const rootClass = ['text-shimmer', className].filter(Boolean).join(' ');

  return (
    <span role="status" className={rootClass} {...props}>
      {children}
      {'.'.repeat(dotCount)}
    </span>
  );
}
