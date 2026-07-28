type ResizeHandleProps = {
  onResizeStart: (event: React.PointerEvent<HTMLDivElement>) => void;
};

export function ResizeHandle({ onResizeStart }: ResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      onPointerDown={onResizeStart}
      className="group relative z-10 w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-accent/20 active:bg-accent/30"
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  );
}
