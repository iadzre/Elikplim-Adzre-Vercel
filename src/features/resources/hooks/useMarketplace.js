import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PAGE_SIZE,
  searchPublishedResources,
  fetchCategories,
} from '../../../lib/services/resourcesService';

/**
 * Server-backed marketplace catalog with filters and pagination.
 */
export function useMarketplace() {
  const [query, setQueryState] = useState('');
  const [category, setCategoryState] = useState('all');
  const [sort, setSortState] = useState('featured');
  const [tierFilter, setTierFilterState] = useState(/** @type {'all'|'free'|'paid'} */ ('all'));
  const [page, setPage] = useState(1);
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {Error | null} */ (null));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadCategories = useCallback(async () => {
    const { data, error: catError } = await fetchCategories();
    if (!catError && data) setCategories(data);
  }, []);

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await searchPublishedResources({
      query,
      categorySlug: category,
      tierFilter,
      sort,
      page,
      pageSize: PAGE_SIZE,
    });
    if (result.error) {
      setError(result.error);
      setResources([]);
      setTotal(0);
    } else {
      setResources(result.data);
      setTotal(result.total);
    }
    setLoading(false);
  }, [query, category, tierFilter, sort, page]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const setQuery = useCallback((v) => {
    setQueryState(v);
    setPage(1);
  }, []);

  const setCategory = useCallback((v) => {
    setCategoryState(v);
    setPage(1);
  }, []);

  const setSort = useCallback((v) => {
    setSortState(v);
    setPage(1);
  }, []);

  const setTierFilter = useCallback((v) => {
    setTierFilterState(v);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setQueryState('');
    setCategoryState('all');
    setSortState('featured');
    setTierFilterState('all');
    setPage(1);
  }, []);

  const categoryTabs = useMemo(
    () => [{ id: 'all', label: 'All' }, ...categories.map((c) => ({ id: c.slug, label: c.name }))],
    [categories]
  );

  return {
    resources,
    categories: categoryTabs,
    loading,
    error,
    query,
    setQuery,
    category,
    setCategory,
    sort,
    setSort,
    tierFilter,
    setTierFilter,
    page,
    setPage,
    totalPages,
    isEmpty: !loading && resources.length === 0,
    resetFilters,
    refresh: loadResources,
  };
}
