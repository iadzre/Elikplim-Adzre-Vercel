import { LazyImage } from '../shared/LazyImage';
import { formatResourceStatsLine } from '../../lib/resources/formatResourceStats';

/**
 * @param {{
 *   resource: Record<string, unknown>;
 *   onSelect: (resource: Record<string, unknown>) => void;
 *   compact?: boolean;
 * }} props
 */
export function ResourceCard({ resource, onSelect, compact = false }) {
  const priceLabel = resource.isFree ? 'Free' : `$${resource.price}`;
  const badgeClass = resource.isFree ? 'resources-badge-free' : 'resources-badge-premium';

  return (
    <article className="group resources-card rounded-lg overflow-hidden flex flex-col h-full">
      <button
        type="button"
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#cddcc8]/30 text-left"
        onClick={() => onSelect(resource)}
        aria-label={`View ${resource.title}`}
      >
        <LazyImage
          src={resource.thumbnail}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span
          className={`absolute top-2 left-2 px-2 py-0.5 josefin rounded ${badgeClass}`}
        >
          {resource.isFree ? 'Free' : 'Paid'}
        </span>
      </button>

      <div className="p-3 md:p-4 flex flex-col flex-1 gap-2 border-t border-[#2A2F7F]/8">
        <h3 className="text-sm md:text-base font-medium text-[#2A2F7F] leading-snug">
          {resource.title}
        </h3>
        {!compact && (
          <p className="text-xs text-[#2A2F7F]/65 leading-relaxed line-clamp-2 flex-1">
            {resource.description}
          </p>
        )}
        <div className="flex items-center justify-between gap-2 pt-2 text-xs text-[#2A2F7F]/55">
          <span>
            {formatResourceStatsLine(resource)}
          </span>
          <span className="text-[#2A2F7F] font-medium">{priceLabel}</span>
        </div>
        <button
          type="button"
          className="mt-1 text-left text-xs josefin uppercase tracking-[0.2em] text-[#2A2F7F] hover:text-[#F45D01] transition-colors"
          onClick={() => onSelect(resource)}
        >
          {resource.isFree ? 'Download' : 'View details'} →
        </button>
      </div>
    </article>
  );
}
