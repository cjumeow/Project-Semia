import type { WebJumpBackHint } from '@semia/shared';

type JumpBackHintCalloutProps = {
  hint: WebJumpBackHint;
};

const styles: Record<WebJumpBackHint['kind'], string> = {
  unavailable: 'border-amber-300 bg-amber-50 text-amber-950',
  uncertain: 'border-amber-300 bg-amber-50 text-amber-950',
  failed: 'border-orange-300 bg-orange-50 text-orange-950',
};

export function JumpBackHintCallout({ hint }: JumpBackHintCalloutProps) {
  return (
    <div
      role="status"
      className={[
        'rounded-lg border px-3 py-2.5 text-xs leading-relaxed',
        styles[hint.kind],
      ].join(' ')}
    >
      {hint.message}
    </div>
  );
}
