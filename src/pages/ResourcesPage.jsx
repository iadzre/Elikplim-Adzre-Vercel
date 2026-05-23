import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Footer } from '../components/layout/Footer';
import { ResourceMarketplace } from '../components/resources/ResourceMarketplace';
import { ResourceLibraryBar } from '../components/resources/ResourceLibraryBar';
import { ResourceErrorBoundary } from '../components/resources/ResourceErrorBoundary';
import { ContentMessage } from '../components/shared/ContentMessage';
import { useHeaderBlur } from '../hooks/useHeaderBlur';
import { usePageTitle } from '../hooks/usePageTitle';
import { useMarketplace } from '../features/resources/hooks/useMarketplace';
import { useUserLibrary } from '../features/resources/hooks/useUserLibrary';
import { fetchApprovedReviews } from '../lib/services/resourcesService';
import { ALL_DOWNLOADS_FREE } from '../lib/resources/marketplaceConfig';
import '../styles/resources.css';

const ResourceDetailModal = lazy(() =>
  import('../components/resources/ResourceDetailModal').then((m) => ({ default: m.ResourceDetailModal }))
);

export function ResourcesPage() {
  const headerRef = useHeaderBlur(true);
  const marketplaceRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState(null);
  const [modalMeta, setModalMeta] = useState({
    reviews: [],
  });

  const marketplace = useMarketplace();
  const library = useUserLibrary();
  usePageTitle('Resources');

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    const sessionId = searchParams.get('session_id');
    if (checkout === 'success' && sessionId) {
      setCheckoutNotice('Payment received. Your library will update shortly.');
      setSearchParams({}, { replace: true });
      library.refresh();
    }
  }, [searchParams, setSearchParams, library]);

  const openResource = useCallback(async (resource) => {
    setSelected(resource);
    setModalOpen(true);
    window.history.pushState(null, '', `/resources/${resource.slug}`);
    const revRes = await fetchApprovedReviews(resource.id);
    setModalMeta({
      reviews: revRes.data ?? [],
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelected(null);
    if (window.location.pathname.startsWith('/resources/')) {
      window.history.replaceState(null, '', '/resources');
    }
  }, []);

  const handleBrowseFree = useCallback(() => {
    marketplace.setCategory('all');
    marketplace.setQuery('');
    marketplace.setTierFilter('free');
    marketplace.setSort('downloads');
    marketplaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [marketplace]);

  return (
    <ResourceErrorBoundary>
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
              <p id="resources-intro" className="text-xs uppercase tracking-[0.4em] text-[#F45D01] josefin">
                Resources
              </p>
              <p className="text-sm md:text-base text-[#2A2F7F] mt-3 leading-relaxed">
                {ALL_DOWNLOADS_FREE
                  ? 'Templates, kits, and production files from client work — free to download. Browse below.'
                  : 'Templates, kits, and production files from client work — free where noted, or purchase to download. Browse below or '}
                {!ALL_DOWNLOADS_FREE && (
                  <>
                    <button type="button" onClick={handleBrowseFree} className="resources-link">
                      see free items
                    </button>
                    .
                  </>
                )}
              </p>
            </div>
          </section>

          {checkoutNotice && (
            <div className="px-4 max-w-5xl mx-auto w-full mb-4">
              <ContentMessage message={checkoutNotice} />
            </div>
          )}

          {marketplace.error && (
            <div className="px-4 max-w-5xl mx-auto w-full">
              <ContentMessage message={`Could not load shop: ${marketplace.error.message}`} />
            </div>
          )}

          <ResourceLibraryBar items={library.items} onOpen={openResource} />

          <ResourceMarketplace
            sectionRef={marketplaceRef}
            categories={marketplace.categories}
            query={marketplace.query}
            setQuery={marketplace.setQuery}
            category={marketplace.category}
            setCategory={marketplace.setCategory}
            sort={marketplace.sort}
            setSort={marketplace.setSort}
            page={marketplace.page}
            setPage={marketplace.setPage}
            totalPages={marketplace.totalPages}
            items={marketplace.resources}
            isEmpty={marketplace.isEmpty}
            loading={marketplace.loading}
            onSelect={openResource}
            onResetFilters={marketplace.resetFilters}
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
        {selected && (
          <ResourceDetailModal
            resource={selected}
            isOpen={modalOpen}
            onClose={closeModal}
            hasAccess={ALL_DOWNLOADS_FREE || (selected.isFree ?? false) || library.owns(selected.id)}
            onAccessGranted={() => library.refresh()}
            reviews={modalMeta.reviews}
          />
        )}
      </Suspense>
    </ResourceErrorBoundary>
  );
}
