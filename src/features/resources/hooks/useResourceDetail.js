import { useCallback, useEffect, useState } from 'react';
import {
  fetchResourceBySlug,
  fetchRelatedResources,
  fetchApprovedReviews,
  recordResourceView,
  checkResourceAccess,
  fetchIsFavorited,
} from '../../../lib/services/resourcesService';

/**
 * @param {string | undefined} slug
 */
export function useResourceDetail(slug) {
  const [resource, setResource] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {Error | null} */ (null));

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    const { data, error: resError } = await fetchResourceBySlug(slug);
    if (resError || !data) {
      setError(resError ?? new Error('Resource not found'));
      setResource(null);
      setLoading(false);
      return;
    }

    setResource(data);
    recordResourceView(data.id);

    const [accessRes, favRes, relRes, revRes] = await Promise.all([
      checkResourceAccess(data.id),
      fetchIsFavorited(data.id),
      fetchRelatedResources(data.id),
      fetchApprovedReviews(data.id),
    ]);

    setHasAccess(Boolean(accessRes.data));
    setIsFavorited(Boolean(favRes.data));
    setRelated(relRes.data ?? []);
    setReviews(revRes.data ?? []);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    resource,
    related,
    reviews,
    hasAccess,
    isFavorited,
    setIsFavorited,
    loading,
    error,
    refresh: load,
    setHasAccess,
  };
}
