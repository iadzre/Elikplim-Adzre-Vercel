import { useId } from 'react';
import { ResourceCard } from './ResourceCard';
import { ResourceCardSkeleton } from './ResourceCardSkeleton';
import { ALL_DOWNLOADS_FREE } from '../../lib/resources/marketplaceConfig';

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
 *   categories?: Array<{ id: string; label: string }>;
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
  categories = [{ id: 'all', label: 'All' }],
  sectionRef,
}) {
  const searchId = useId();
  const sortId = useId();

  const tabs = categories.length ? categories : [{ id: 'all', label: 'All' }];

  return (
    <section
      ref={sectionRef}
      id="resource-marketplace"
      className="resources-marketplace w-full px-4 sm:px-6 md:px-8 lg:px-12 pb-[var(--resources-cta-gutter,4rem)]"
      aria-label="Resource catalog"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <label htmlFor={searchId} className="sr-only">
            Search resources
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="resources-input flex-1 py-2 px-3 text-sm text-[#2A2F7F]"
            autoComplete="off"
          />
          <label htmlFor={sortId} className="sr-only">
            Sort resources
          </label>
          <select
            id={sortId}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="resources-input py-2 px-3 text-xs josefin uppercase tracking-wider text-[#2A2F7F] sm:w-44"
          >
            <option value="featured">Featured</option>
            <option value="downloads">Most downloaded</option>
            <option value="rating">Highest rated</option>
            {!ALL_DOWNLOADS_FREE && (
              <>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </>
            )}
            <option value="newest">Newest</option>
          </select>
        </div>

        <div
          className="flex gap-2 mb-8 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Categories"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={category === tab.id}
              onClick={() => setCategory(tab.id)}
              className={`shrink-0 py-1.5 px-3 text-[10px] uppercase tracking-[0.2em] josefin border-b-2 transition-colors ${
                category === tab.id
                  ? 'border-[#F45D01] text-[#2A2F7F]'
                  : 'border-transparent text-[#2A2F7F]/50 hover:text-[#2A2F7F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
            aria-busy="true"
            aria-label="Loading resources"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <ResourceCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && isEmpty && (
          <div className="py-16 text-center">
            <p className="text-sm text-[#2A2F7F]">No resources match your filters.</p>
            <button
              type="button"
              className="resources-link mt-3 text-xs josefin uppercase tracking-widest"
              onClick={() => onResetFilters?.()}
            >
              Reset filters
            </button>
          </div>
        )}

        {!loading && !isEmpty && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {items.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} onSelect={onSelect} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-6 mt-10 text-xs josefin tracking-widest text-[#2A2F7F]/70" aria-label="Pagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="disabled:opacity-30 hover:text-[#F45D01] transition-colors"
                >
                  Previous
                </button>
                <span>
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="disabled:opacity-30 hover:text-[#F45D01] transition-colors"
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
