import { mapCmsProject } from './cmsMappers';
import { mapProject } from './contentMappers';

function normalizeTitle(title) {
  return String(title || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Merge CMS project rows with legacy portfolio galleries (matched by title).
 *
 * @param {Array<Record<string, unknown>>} cmsRows
 * @param {Array<Record<string, unknown> & { project_media?: unknown[] }>} portfolioRows
 */
export function enrichCmsProjectsWithPortfolio(cmsRows, portfolioRows) {
  const legacyByTitle = new Map(
    (portfolioRows || []).map((row) => {
      const project = mapProject(row);
      return [normalizeTitle(project.title), project];
    })
  );

  return (cmsRows || []).map((row) => {
    const cms = mapCmsProject(row);
    const legacy = legacyByTitle.get(normalizeTitle(cms.title));
    if (!legacy) return cms;

    const hasCmsGallery =
      cms.mediaSrcs.length > 1 ||
      (cms.mediaSrcs.length === 1 && cms.coverSrc && cms.mediaSrcs[0] !== cms.coverSrc);

    if (hasCmsGallery) {
      return {
        ...cms,
        subtitle: cms.subtitle || legacy.subtitle,
        tagLeft: cms.tagLeft || legacy.tagLeft,
        tagRight: cms.tagRight || legacy.tagRight,
        coverSrc: cms.coverSrc || legacy.coverSrc,
      };
    }

    return {
      ...cms,
      subtitle: cms.subtitle || legacy.subtitle,
      tagLeft: cms.tagLeft || legacy.tagLeft,
      tagRight: cms.tagRight || legacy.tagRight,
      mediaType: legacy.mediaType,
      mediaSrcs: legacy.mediaSrcs?.length ? legacy.mediaSrcs : cms.mediaSrcs,
      coverSrc: cms.coverSrc || legacy.coverSrc,
    };
  });
}
