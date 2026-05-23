import { useEffect } from 'react';

/**
 * @param {{ resource: { title: string; short_description?: string; seo_title?: string; seo_description?: string; thumbnail?: string; slug: string; price?: number; isFree?: boolean; rating?: number } | null }} props
 */
export function ResourceSeo({ resource }) {
  useEffect(() => {
    if (!resource) return;

    const title = resource.seo_title || `${resource.title} — Resources`;
    const description =
      resource.seo_description ||
      resource.short_description ||
      resource.description ||
      'Digital resource by Elikplim Adzre';

    document.title = title;

    const setMeta = (name, content, prop = 'name') => {
      let el = document.querySelector(`meta[${prop}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(prop, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'product', 'property');
    if (resource.thumbnail) {
      setMeta('og:image', resource.thumbnail.startsWith('http') ? resource.thumbnail : `${window.location.origin}${resource.thumbnail}`, 'property');
    }
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}/resources/${resource.slug}`);

    const scriptId = 'resource-json-ld';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: resource.title,
      description,
      image: resource.thumbnail,
      offers: {
        '@type': 'Offer',
        price: resource.isFree ? 0 : resource.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: resource.rating
        ? { '@type': 'AggregateRating', ratingValue: resource.rating, reviewCount: 1 }
        : undefined,
    });
  }, [resource]);

  return null;
}
