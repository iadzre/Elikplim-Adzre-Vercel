import { LazyImage } from '../shared/LazyImage';

/**
 * @param {{
 *   resource: import('../../data/resourcesMock').ResourceItem extends never ? never : import('../../data/resourcesMock').RESOURCES[0];
 *   onSelect: (resource: import('../../data/resourcesMock').RESOURCES[0]) => void;
 *   onQuickView?: (resource: import('../../data/resourcesMock').RESOURCES[0]) => void;
 *   compact?: boolean;
 * }} props
 */
export function ResourceCard({ resource, onSelect, onQuickView, compact = false }) {
  const priceLabel = resource.isFree ? 'Free' : `$${resource.price}`;
  const badgeClass = resource.isFree ? 'resources-badge-free' : 'resources-badge-premium';

  return (
    <article className="group resources-card rounded-2xl overflow-hidden flex flex-col h-full resources-animate-in">
      <button
        type="button"
        className="resources-thumb-zoom relative aspect-[4/3] w-full overflow-hidden bg-[#cddcc8]/40 text-left"
        onClick={() => onSelect(resource)}
        aria-label={`View ${resource.title}`}
      >
        <LazyImage
          src={resource.thumbnail}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] josefin rounded-full ${badgeClass}`}
        >
          {resource.isFree ? 'Free' : 'Premium'}
        </span>
        {onQuickView && (
          <span
            className="absolute bottom-3 right-3 px-3 py-1.5 text-[10px] uppercase tracking-widest josefin bg-white/90 text-[#2A2F7F] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            aria-hidden
          >
            Quick view
          </span>
        )}
      </button>

      <div className="p-4 md:p-5 flex flex-col flex-1 gap-3">
        <div className="flex flex-wrap gap-1.5">
          {resource.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider text-[#2A2F7F]/60 josefin"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="gazzetta-bold text-lg md:text-xl text-[#2A2F7F] leading-tight">
          {resource.title}
        </h3>
        {!compact && (
          <p className="text-sm text-[#2A2F7F]/75 leading-relaxed line-clamp-2 flex-1">
            {resource.description}
          </p>
        )}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#2A2F7F]/8">
          <div className="flex items-center gap-3 text-xs text-[#2A2F7F]/70 josefin">
            <span aria-label={`Rating ${resource.rating} out of 5`}>★ {resource.rating}</span>
            <span>{resource.downloadCount.toLocaleString()} dl</span>
          </div>
          <span className="gazzetta-bold text-[#F45D01]">{priceLabel}</span>
        </div>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            className="resources-btn-primary flex-1 py-2.5 px-4 text-xs uppercase tracking-[0.2em] josefin rounded-full"
            onClick={() => onSelect(resource)}
          >
            {resource.isFree ? 'Download' : 'Preview'}
          </button>
          {onQuickView && (
            <button
              type="button"
              className="resources-btn-ghost py-2.5 px-3 text-xs uppercase tracking-[0.15em] josefin rounded-full hidden sm:inline-flex"
              onClick={() => onQuickView(resource)}
            >
              Quick
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
