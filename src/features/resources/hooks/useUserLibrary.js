import { useCallback, useEffect, useState } from 'react';
import { fetchUserLibrary } from '../../../lib/services/resourcesService';
import { useResourceAuth } from './useResourceAuth';

export function useUserLibrary() {
  const { isSignedIn } = useResourceAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data, error } = await fetchUserLibrary();
    if (!error) setItems(data);
    setLoading(false);
  }, [isSignedIn]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const owns = useCallback(
    (resourceId) => items.some((r) => r.id === resourceId),
    [items]
  );

  return { items, loading, refresh, owns };
}
