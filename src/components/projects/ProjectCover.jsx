import { useState } from 'react';
import { mediaUrl } from '../../lib/mediaUrl';
import { ProjectCoverPlaceholder } from './ProjectCoverPlaceholder';

/**
 * Project cover image with initials placeholder on missing src or load error.
 *
 * @param {{
 *   title: string;
 *   coverSrc: string | null;
 *   alt?: string;
 *   projectId?: string;
 *   className?: string;
 * }} props
 */
export function ProjectCover({ title, coverSrc, alt, projectId, className = '' }) {
  const [imgError, setImgError] = useState(false);
  const safeSrc = coverSrc?.trim() || null;
  const showPlaceholder = imgError || !safeSrc;

  if (showPlaceholder) {
    return (
      <ProjectCoverPlaceholder title={title} projectId={projectId} className={className} />
    );
  }

  return (
    <img
      src={mediaUrl(safeSrc)}
      alt={alt || title}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setImgError(true)}
    />
  );
}
