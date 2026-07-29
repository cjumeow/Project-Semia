type TextDotsProps = React.ComponentProps<'span'> & {
  dots?: number;
};

export function TextDots({
  className,
  children,
  dots = 3,
  style,
  ...props
}: TextDotsProps) {
  const dotCount = Number.isFinite(dots) ? Math.max(1, Math.floor(dots)) : 3;
  const rootClass = ['inline-flex items-center', className].filter(Boolean).join(' ');

  return (
    <span role="status" className={rootClass} style={style} {...props}>
      <span>{children}</span>
      <span aria-hidden="true" className="inline-flex">
        {Array.from({ length: dotCount }, (_, index) => (
          <span
            key={index}
            className="animate-text-dots"
            style={{ animationDelay: `calc(0.2s * ${index + 1})` }}
          >
            .
          </span>
        ))}
      </span>
    </span>
  );
}
