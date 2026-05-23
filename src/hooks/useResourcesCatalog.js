import { useCallback, useMemo, useState } from 'react';
import { RESOURCES } from '../data/resourcesMock';

const PAGE_SIZE = 9;

/**
 * @param {Object} [options]
 * @param {string} [options.initialCategory] - 'all' or category id
 */
export function useResourcesCatalog(options = {}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(options.initialCategory ?? 'all');
  const [sort, setSort] = useState('featured');
  const [tierFilter, setTierFilter] = useState(/** @type {'all' | 'free' | 'paid'} */ ('all'));
  const [page, setPage] = useState(1);
  const [library, setLibrary] = useState(/** @type {string[]} */ ([]));

  const filtered = useMemo(() => {
    let list = [...RESOURCES];

    if (category !== 'all') {
      list = list.filter((r) => r.categoryId === category);
    }

    if (tierFilter === 'free') {
      list = list.filter((r) => r.isFree);
    } else if (tierFilter === 'paid') {
      list = list.filter((r) => !r.isFree);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'downloads':
        list.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.reverse();
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return list;
  }, [category, query, sort, tierFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const featured = useMemo(() => RESOURCES.filter((r) => r.featured), []);

  const setCategoryAndReset = useCallback((id) => {
    setCategory(id);
    setPage(1);
  }, []);

  const setQueryAndReset = useCallback((value) => {
    setQuery(value);
    setPage(1);
  }, []);

  const setSortAndReset = useCallback((value) => {
    setSort(value);
    setPage(1);
  }, []);

  const setTierFilterAndReset = useCallback((value) => {
    setTierFilter(value);
    setPage(1);
  }, []);

  const addToLibrary = useCallback((resourceId) => {
    setLibrary((prev) => (prev.includes(resourceId) ? prev : [...prev, resourceId]));
  }, []);

  const libraryItems = useMemo(
    () => RESOURCES.filter((r) => library.includes(r.id)),
    [library]
  );

  return {
    query,
    setQuery: setQueryAndReset,
    category,
    setCategory: setCategoryAndReset,
    sort,
    setSort: setSortAndReset,
    tierFilter,
    setTierFilter: setTierFilterAndReset,
    page,
    setPage,
    totalPages,
    filtered,
    paginated,
    featured,
    library,
    libraryItems,
    addToLibrary,
    isEmpty: filtered.length === 0,
  };
}
