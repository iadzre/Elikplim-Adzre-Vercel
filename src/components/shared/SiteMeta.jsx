import { useEffect } from 'react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export function SiteMeta() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    if (settings.meta_description) {
      meta.setAttribute('content', settings.meta_description);
    }

    if (settings.favicon_url) {
      let link = document.querySelector('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'icon');
        document.head.appendChild(link);
      }
      link.setAttribute('href', settings.favicon_url);
    }
  }, [settings]);

  return null;
}
