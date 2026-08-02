import { LIBRARY_SORT_BY_REVIEW_STORAGE_KEY } from '@semia/shared';
import { useCallback, useState } from 'react';

export function useLibrarySortByReview(): [
  sortByReview: boolean,
  setSortByReview: (value: boolean) => void,
] {
  const [sortByReview, setSortByReviewState] = useState(() => {
    return localStorage.getItem(LIBRARY_SORT_BY_REVIEW_STORAGE_KEY) === 'true';
  });

  const setSortByReview = useCallback((value: boolean) => {
    setSortByReviewState(value);
    localStorage.setItem(LIBRARY_SORT_BY_REVIEW_STORAGE_KEY, String(value));
  }, []);

  return [sortByReview, setSortByReview];
}
