import { useId } from 'react';
import { RESOURCE_CATEGORIES } from '../../data/resourcesMock';
import { ResourceCard } from './ResourceCard';
import { ResourceCardSkeleton } from './ResourceCardSkeleton';

/**
 * @param {{
 *   query: string;
 *   setQuery: (v: string) => void;
 *   category: string;
 *   setCategory: (id: string) => void;
 *   sort: string;
 *   setSort: (v: string) => void;
 *   page: number;
 *   setPage: (n: number) => void;
 *   totalPages: number;
 *   items: import('../../data/resourcesMock').RESOURCES;
 *   isEmpty: boolean;
 *   loading: boolean;
 *   onSelect: (r: import('../../data/resourcesMock').RESOURCES[0]) => void;
 *   onResetFilters?: () => void;
 *   sectionRef?: import('react').RefObject<HTMLElement | null>;
 * }} props
 */
export function ResourceMarketplace({
  query,
  setQuery,
  category,
  setCategory,
  sort,
  setSort,
  page,
  setPage,
  totalPages,
  items,
  isEmpty,
  loading,
  onSelect,
  onResetFilters,
  sectionRef,
}) {
  const searchId = useId();
  const sortId = useId();

  const tabs = [{ id: 'all', label: 'All' }, ...RESOURCE_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))];

  return (
    <section
      ref={sectionRef}
      id="resource-marketplace"
      className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-20"
      aria-labelledby="marketplace-heading"
    >
      <div className="max-w-6xl mx-auto">
        <h2 id="marketplace-heading" className="gazzetta-bold text-2xl md:text-4xl text-[#2A2F7F]">
          Marketplace
        </h2>
        <p className="text-sm text-[#2A2F7F]/70 mt-2">Search, filter, and sort the full catalog.</p>

        <div className="flex flex-col lg:flex-row gap-4 mt-8">
          <label htmlFor={searchId} className="sr-only">
            Search resources
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, tag, or keyword…"
            className="resources-input flex-1 py-3 px-4 rounded-full text-sm text-[#2A2F7F] josefin"
            autoComplete="off"
          />
          <label htmlFor={sortId} className="sr-only">
            Sort resources
          </label>
          <select
            id={sortId}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="resources-input py-3 px-4 rounded-full text-xs uppercase tracking-widest josefin text-[#2A2F7F] lg:w-52"
          >
            <option value="featured">Featured first</option>
            <option value="downloads">Most downloaded</option>
            <option value="rating">Highest rated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div
          className="flex gap-2 mt-6 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin"
          role="tablist"
          aria-label="Category filters"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={category === tab.id}
              onClick={() => setCategory(tab.id)}
              className={`shrink-0 py-2 px-4 rounded-full text-[10px] uppercase tracking-[0.2em] josefin border transition-colors ${
                category === tab.id
                  ? 'bg-[#2A2F7F] text-[#f3fcf0] border-[#2A2F7F]'
                  : 'bg-white/50 text-[#2A2F7F] border-[#2A2F7F]/15 hover:border-[#F45D01]/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-10" aria-busy="true" aria-label="Loading resources">
            {Array.from({ length: 6 }).map((_, i) => (
              <ResourceCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && isEmpty && (
          <div className="mt-16 text-center py-16 rounded-2xl border border-dashed border-[#2A2F7F]/20 bg-white/30">
            <p className="gazzetta-bold text-xl text-[#2A2F7F]">No resources match your filters</p>
            <p className="text-sm text-[#2A2F7F]/70 mt-2 max-w-md mx-auto">
              Try clearing search or selecting a different category.
            </p>
            <button
              type="button"
              className="resources-btn-ghost mt-6 py-2.5 px-6 text-xs uppercase tracking-widest josefin rounded-full"
              onClick={() => {
                onResetFilters?.();
              }}
            >
              Reset filters
            </button>
          </div>
        )}

        {!loading && !isEmpty && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-10">
              {items.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} onSelect={onSelect} onQuickView={onSelect} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-4 mt-12" aria-label="Pagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="resources-btn-ghost py-2 px-5 text-xs uppercase tracking-widest josefin rounded-full disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs josefin text-[#2A2F7F]/70 tracking-widest">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="resources-btn-ghost py-2 px-5 text-xs uppercase tracking-widest josefin rounded-full disabled:opacity-40"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}
