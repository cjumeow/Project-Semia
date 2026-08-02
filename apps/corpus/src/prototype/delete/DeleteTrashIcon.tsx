/** Outline trash — matches reference delete control. */
export function DeleteTrashIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 3h6l1 3H8l1-3Z" />
      <path d="M5 6h14v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z" />
      <path d="M10 10v7" />
      <path d="M14 10v7" />
    </svg>
  );
}
