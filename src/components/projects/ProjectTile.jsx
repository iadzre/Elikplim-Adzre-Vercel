import { LazyImage } from '../shared/LazyImage';

/**
 * @param {{
 *   project: import('../../lib/contentMappers').Project;
 *   onOpen: (mediaType: string, mediaSrcs: string[]) => void;
 * }} props
 */
export function ProjectTile({ project, onOpen }) {
  const handleClick = () => {
    onOpen(project.mediaType, project.mediaSrcs);
  };

  return (
    <article
      className="project-tile relative aspect-square w-full border border-gray-200 cursor-pointer hover:border-[#F45D01] hover:shadow-lg transition-all duration-300 group overflow-hidden"
      data-media-type={project.mediaType}
      data-media-srcs={project.mediaSrcs.join(',')}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`View project: ${project.title}`}
      role="button"
      tabIndex={0}
    >
      <LazyImage
        src={project.coverSrc}
        alt={project.coverAlt}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 p-3 flex flex-col justify-between z-10">
        <div className="flex items-center justify-between">
          <span className="text-[8px] uppercase tracking-[0.4em] text-gray-300 josefin">
            {project.tagLeft}
          </span>
          <span className="text-[8px] uppercase tracking-[0.4em] text-gray-300 josefin">
            {project.tagRight}
          </span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white group-hover:text-[#F45D01] transition-colors duration-300">
            {project.title}
          </h3>
          <p className="text-[9px] josefin tracking-2x uppercase text-gray-200 mt-1">
            {project.subtitle}
          </p>
        </div>
      </div>
    </article>
  );
}
