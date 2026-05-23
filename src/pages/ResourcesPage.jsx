import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Footer } from '../components/layout/Footer';
import { ResourceMarketplace } from '../components/resources/ResourceMarketplace';
import { ResourceLibraryBar } from '../components/resources/ResourceLibraryBar';
import { useHeaderBlur } from '../hooks/useHeaderBlur';
import { usePageTitle } from '../hooks/usePageTitle';
import { useResourcesCatalog } from '../hooks/useResourcesCatalog';
import '../styles/resources.css';

const ResourceDetailModal = lazy(() =>
  import('../components/resources/ResourceDetailModal').then((m) => ({ default: m.ResourceDetailModal }))
);

const META_DESCRIPTION =
  'Digital resources — templates, UI kits, and production tools. Free downloads and paid assets by Elikplim Adzre.';

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
    const t = window.setTimeout(() => setLoading(false), 320);
    return () => window.clearTimeout(t);
  }, []);

  const openResource = useCallback((resource) => {
    setSelected(resource);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleBrowseFree = useCallback(() => {
    catalog.setCategory('all');
    catalog.setQuery('');
    catalog.setTierFilter('free');
    catalog.setSort('downloads');
    marketplaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [catalog]);

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
        <main className="resources-page w-full flex flex-col bg-gradient-to-b from-[#f3fcf0] to-[#f5f1ca] min-h-screen pb-16 md:pb-20">
          <section className="w-full flex flex-col" aria-labelledby="resources-intro">
            <div className="text-center mb-8 px-4 md:px-8 pt-24 sm:pt-28 md:pt-32 max-w-3xl mx-auto">
              <p
                id="resources-intro"
                className="text-xs uppercase tracking-[0.4em] text-[#F45D01] josefin"
              >
                Resources
              </p>
              <p className="text-sm md:text-base text-[#2A2F7F] mt-3 leading-relaxed">
                Templates, kits, and production files from client work — free where noted, or purchase to download.
                Browse below or{' '}
                <button type="button" onClick={handleBrowseFree} className="resources-link">
                  see free items
                </button>
                .
              </p>
            </div>
          </section>

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

          <p className="text-center text-xs text-[#2A2F7F]/70 px-4 pb-8 josefin tracking-wide">
            Custom brief or collaboration?{' '}
            <Link to="/leave-a-note" className="resources-link">
              Leave a note
            </Link>
          </p>
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
