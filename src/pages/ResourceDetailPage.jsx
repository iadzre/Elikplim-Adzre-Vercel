import { lazy, Suspense, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Footer } from '../components/layout/Footer';
import { ResourceSeo } from '../components/resources/ResourceSeo';
import { ResourceErrorBoundary } from '../components/resources/ResourceErrorBoundary';
import { ContentMessage } from '../components/shared/ContentMessage';
import { useHeaderBlur } from '../hooks/useHeaderBlur';
import { useResourceDetail } from '../features/resources/hooks/useResourceDetail';
import { useResourceAuth } from '../features/resources/hooks/useResourceAuth';
import { ALL_DOWNLOADS_FREE } from '../lib/resources/marketplaceConfig';
import '../styles/resources.css';

const ResourceDetailModal = lazy(() =>
  import('../components/resources/ResourceDetailModal').then((m) => ({ default: m.ResourceDetailModal }))
);

export function ResourceDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const headerRef = useHeaderBlur(true);
  const { isSignedIn } = useResourceAuth();
  const detail = useResourceDetail(slug);
  const [modalOpen, setModalOpen] = useState(true);

  const checkoutCancelled = searchParams.get('checkout') === 'cancelled';

  return (
    <ResourceErrorBoundary>
      <ResourceSeo resource={detail.resource} />
      <PageLayout
        htmlClass="resources-page-html"
        bodyClass="resources-page bg-gradient-to-b from-[#f3fcf0] to-[#f5f1ca] min-h-screen flex flex-col"
        headerRef={headerRef}
        pageShellClassName="w-full page-shell flex-1 flex flex-col"
        showFooter
        footer={<Footer />}
      >
        <main className="resources-page w-full min-h-[50vh] pt-28 px-4">
          {checkoutCancelled && (
            <div className="max-w-lg mx-auto mb-4">
              <ContentMessage message="Checkout was cancelled. You can try again when ready." />
            </div>
          )}
          {detail.loading && (
            <p className="text-center text-sm text-[#2A2F7F]/60 josefin tracking-widest">Loading…</p>
          )}
          {detail.error && !detail.loading && (
            <div className="max-w-lg mx-auto text-center">
              <ContentMessage message={detail.error.message} />
              <Link to="/resources" className="resources-link text-xs josefin uppercase tracking-widest mt-4 inline-block">
                Back to resources
              </Link>
            </div>
          )}
          {!detail.loading && detail.resource && (
            <p className="text-center text-sm text-[#2A2F7F]/70">
              <Link to="/resources" className="resources-link">
                ← All resources
              </Link>
            </p>
          )}
        </main>
      </PageLayout>

      {detail.resource && (
        <Suspense fallback={null}>
          <ResourceDetailModal
            resource={detail.resource}
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              navigate('/resources', { replace: true });
            }}
            hasAccess={detail.hasAccess || ALL_DOWNLOADS_FREE}
            isFavorited={detail.isFavorited}
            onFavoriteChange={detail.setIsFavorited}
            onAccessGranted={() => {
              detail.setHasAccess(true);
              detail.refresh();
            }}
            reviews={detail.reviews}
            isSignedIn={isSignedIn}
          />
        </Suspense>
      )}
    </ResourceErrorBoundary>
  );
}
