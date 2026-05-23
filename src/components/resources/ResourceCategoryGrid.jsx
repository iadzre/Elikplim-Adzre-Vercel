import { RESOURCE_CATEGORIES } from '../../data/resourcesMock';

/**
 * @param {{ activeCategory: string; onSelect: (id: string) => void }} props
 */
export function ResourceCategoryGrid({ activeCategory, onSelect }) {
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16" aria-labelledby="resource-categories-heading">
      <div className="max-w-6xl mx-auto">
        <h2 id="resource-categories-heading" className="gazzetta-bold text-2xl md:text-3xl text-[#2A2F7F]">
          Browse by discipline
        </h2>
        <p className="text-sm text-[#2A2F7F]/70 mt-2 max-w-xl">
          Filter the marketplace by what you need — from interface systems to client-ready documents.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mt-8">
          <button
            type="button"
            onClick={() => onSelect('all')}
            className={`resources-category-card rounded-xl p-4 md:p-5 text-left border border-[#2A2F7F]/10 ${
              activeCategory === 'all' ? 'is-active' : ''
            }`}
          >
            <span className="text-lg text-[#F45D01]" aria-hidden>
              ★
            </span>
            <span className="block gazzetta-bold text-sm md:text-base text-[#2A2F7F] mt-2">All</span>
            <span className="block text-xs text-[#2A2F7F]/60 mt-1">Full catalog</span>
          </button>
          {RESOURCE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={`resources-category-card rounded-xl p-4 md:p-5 text-left border border-[#2A2F7F]/10 ${
                activeCategory === cat.id ? 'is-active' : ''
              }`}
            >
              <span className="text-lg text-[#F45D01] font-mono" aria-hidden>
                {cat.icon}
              </span>
              <span className="block gazzetta-bold text-sm md:text-base text-[#2A2F7F] mt-2 leading-tight">
                {cat.label}
              </span>
              <span className="block text-xs text-[#2A2F7F]/60 mt-1 line-clamp-2">{cat.description}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
