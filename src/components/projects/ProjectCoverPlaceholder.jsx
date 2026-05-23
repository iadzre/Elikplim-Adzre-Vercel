/**
 * Fallback when a project cover is missing or fails to load.
 *
 * @param {{ title?: string; projectId?: string; className?: string }} props
 */
export function ProjectCoverPlaceholder({ title, projectId, className = '' }) {
  const initial = (title?.trim()?.charAt(0) || '?').toUpperCase();
  const variant =
    projectId != null
      ? Math.abs(
          [...String(projectId)].reduce((sum, char) => sum + char.charCodeAt(0), 0)
        ) % 5
      : 0;

  return (
    <div
      className={`project-cover-placeholder project-cover-placeholder--${variant} ${className}`.trim()}
      role="img"
      aria-label={title ? `${title} cover placeholder` : 'Project cover placeholder'}
    >
      <span className="project-cover-placeholder__initial gazzetta-bold">{initial}</span>
    </div>
  );
}
