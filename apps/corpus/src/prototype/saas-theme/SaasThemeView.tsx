import { ThemeScope } from './ThemeScope';
import { ThemeShell } from './ThemeShell';
import type { StyleVariantDefinition } from './styleVariants';
import type { SaasThemePrototypeState } from './useSaasThemePrototypeState';

export function SaasThemeView({
  state,
  styleVariant,
}: {
  state: SaasThemePrototypeState;
  styleVariant: StyleVariantDefinition;
}) {
  return (
    <ThemeScope>
      <ThemeShell state={state} styleVariant={styleVariant} />
    </ThemeScope>
  );
}
