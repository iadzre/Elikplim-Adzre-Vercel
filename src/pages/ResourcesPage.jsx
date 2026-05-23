import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { Footer } from '../components/layout/Footer';
import { ResourcesHero } from '../components/resources/ResourcesHero';
import { ResourceCategoryGrid } from '../components/resources/ResourceCategoryGrid';
import { ResourceFeaturedRow } from '../components/resources/ResourceFeaturedRow';
import { ResourceMarketplace } from '../components/resources/ResourceMarketplace';
import { ResourceTrustSection } from '../components/resources/ResourceTrustSection';
import { ResourceNewsletter } from '../components/resources/ResourceNewsletter';
import { ResourceClosingCta } from '../components/resources/ResourceClosingCta';
import { ResourceLibraryBar } from '../components/resources/ResourceLibraryBar';
import { useHeaderBlur } from '../hooks/useHeaderBlur';
import { usePageTitle } from '../hooks/usePageTitle';
import { useResourcesCatalog } from '../hooks/useResourcesCatalog';
import '../styles/resources.css';

const ResourceDetailModal = lazy(() =>
  import('../components/resources/ResourceDetailModal').then((m) => ({ default: m.ResourceDetailModal }))
);

const META_DESCRIPTION =
  'Premium digital resources for creators — UI kits, templates, motion packs, and production systems. Free downloads and professional tools by Elikplim Adzre.';

export function ResourcesPage() {
  const headerRef = useHeaderBlur(true);
  const marketplaceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(/** @type {import('../data/resourcesMock').RESOURCES[0] | null} */ (null));
  const [modalOpen, setModalOpen] = useState(false);

  const catalog = useResourcesCatalog();

  usePageTitle('Resources');

  useEffect(() => {
    let meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute('content') ?? '';
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', META_DESCRIPTION);
    return () => {
      if (meta) meta.setAttribute('content', prev);
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 480);
    return () => window.clearTimeout(t);
  }, []);

  const scrollToMarketplace = useCallback(() => {
    marketplaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const openResource = useCallback((resource) => {
    setSelected(resource);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleCategorySelect = useCallback(
    (id) => {
      catalog.setTierFilter('all');
      catalog.setCategory(id);
      scrollToMarketplace();
    },
    [catalog, scrollToMarketplace]
  );

  const handleBrowseFree = useCallback(() => {
    catalog.setCategory('all');
    catalog.setQuery('');
    catalog.setTierFilter('free');
    catalog.setSort('downloads');
    scrollToMarketplace();
  }, [catalog, scrollToMarketplace]);

  return (
    <>
      <PageLayout
        htmlClass="resources-page-html"
        bodyClass="resources-page bg-gradient-to-b from-[#f3fcf0] to-[#f5f1ca] min-h-screen flex flex-col"
        headerRef={headerRef}
        pageShellClassName="w-full page-shell flex-1 flex flex-col"
        showFooter
        footer={<Footer />}
      >
        <main className="w-full flex flex-col bg-gradient-to-b from-[#f3fcf0] to-[#f5f1ca] min-h-screen">
          <ResourcesHero onExplore={scrollToMarketplace} onBrowseFree={handleBrowseFree} />
          <ResourceCategoryGrid activeCategory={catalog.category} onSelect={handleCategorySelect} />
          <ResourceFeaturedRow items={catalog.featured} onSelect={openResource} />
          <ResourceLibraryBar items={catalog.libraryItems} onOpen={openResource} />
          <ResourceMarketplace
            sectionRef={marketplaceRef}
            query={catalog.query}
            setQuery={catalog.setQuery}
            category={catalog.category}
            setCategory={catalog.setCategory}
            sort={catalog.sort}
            setSort={catalog.setSort}
            page={catalog.page}
            setPage={catalog.setPage}
            totalPages={catalog.totalPages}
            items={catalog.paginated}
            isEmpty={catalog.isEmpty}
            loading={loading}
            onSelect={openResource}
            onResetFilters={() => {
              catalog.setQuery('');
              catalog.setCategory('all');
              catalog.setSort('featured');
              catalog.setTierFilter('all');
            }}
          />
          <ResourceTrustSection />
          <ResourceNewsletter />
          <ResourceClosingCta onExplore={scrollToMarketplace} />
        </main>
      </PageLayout>
      <Suspense fallback={null}>
        <ResourceDetailModal
          resource={selected}
          isOpen={modalOpen}
          onClose={closeModal}
          onPurchased={catalog.addToLibrary}
          inLibrary={selected ? catalog.library.includes(selected.id) : false}
        />
      </Suspense>
    </>
  );
}
