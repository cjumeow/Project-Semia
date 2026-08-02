import { LANGUAGE_CARD_ONBOARDING_SEEN_STORAGE_KEY } from '@semia/shared';
import { useCallback, useState } from 'react';

export function useLanguageCardOnboarding(): {
  showOnboarding: boolean;
  markOnboardingSeen: () => void;
} {
  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem(LANGUAGE_CARD_ONBOARDING_SEEN_STORAGE_KEY) !== 'true',
  );

  const markOnboardingSeen = useCallback(() => {
    localStorage.setItem(LANGUAGE_CARD_ONBOARDING_SEEN_STORAGE_KEY, 'true');
    setShowOnboarding(false);
  }, []);

  return { showOnboarding, markOnboardingSeen };
}
