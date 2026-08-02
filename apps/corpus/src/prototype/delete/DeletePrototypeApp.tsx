import { useEffect, useState } from 'react';
import { PrototypeSwitcher, readDeleteVariant } from './PrototypeSwitcher';
import { DELETE_STYLES } from './deleteStyles';
import { DeletePrototypePresentation } from './prototypeShared';

/** Dark pill delete control — A deep indigo (default), B ink, C forest. */
export function DeletePrototypeApp() {
  const [variant, setVariant] = useState(readDeleteVariant);

  useEffect(() => {
    const onPopState = (): void => {
      setVariant(readDeleteVariant());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const style = DELETE_STYLES.find((item) => item.id === variant) ?? DELETE_STYLES[0]!;

  return (
    <main className="flex h-screen overflow-hidden bg-canvas text-text">
      <DeletePrototypePresentation style={style} />
      <PrototypeSwitcher />
    </main>
  );
}
