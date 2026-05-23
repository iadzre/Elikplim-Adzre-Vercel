import { ALL_DOWNLOADS_FREE } from './marketplaceConfig';

/**
 * Map Supabase resource row (+ optional category) to UI catalog shape.
 * @param {Record<string, unknown>} row
 */
export function mapDbResourceToCatalog(row) {
  const category = /** @type {{ slug?: string } | null} */ (row.resource_categories);
  const categorySlug =
    category?.slug ??
    (typeof row.category_id === 'string' ? row.category_id : '');

  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.short_description ?? ''),
    short_description: String(row.short_description ?? ''),
    longDescription: String(row.full_description ?? row.short_description ?? ''),
    categoryId: categorySlug,
    price: ALL_DOWNLOADS_FREE ? 0 : Number(row.price ?? 0),
    isFree: ALL_DOWNLOADS_FREE || row.pricing_type === 'free',
    featured: Boolean(row.featured),
    rating: Number(row.rating_average ?? 0),
    downloadCount: Number(row.download_count ?? 0),
    tags: Array.isArray(row.tags) ? row.tags : [],
    thumbnail: String(row.thumbnail_url ?? ''),
    previews: Array.isArray(row.preview_images) && row.preview_images.length
      ? row.preview_images
      : row.thumbnail_url
        ? [String(row.thumbnail_url)]
        : [],
    features: Array.isArray(row.file_formats) ? row.file_formats : [],
    includes: Array.isArray(row.file_formats) ? row.file_formats : [],
    formats: Array.isArray(row.file_formats) ? row.file_formats : [],
    compatibility: Array.isArray(row.compatibility) ? row.compatibility : [],
    license: String(row.license_type ?? ''),
    videoPreview: row.preview_video_url ? String(row.preview_video_url) : undefined,
  };
}
