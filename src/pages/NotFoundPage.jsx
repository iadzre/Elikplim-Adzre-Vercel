import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { usePageTitle } from '../hooks/usePageTitle';

export function NotFoundPage() {
  usePageTitle('Page Not Found');

  return (
    <PageLayout
      htmlClass=""
      bodyClass="leave-a-note-page bg-gradient-to-b from-[#f3fcf0] to-[#f5f1ca] min-h-screen flex flex-col"
      pageShellClassName="w-full page-shell flex-1 flex flex-col"
    >
      <main className="w-full flex flex-col flex-1 items-center justify-center px-4 pt-24 sm:pt-28 md:pt-32 pb-16">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-[#F45D01] josefin mb-4">
          404
        </p>
        <h1 className="text-3xl sm:text-4xl text-[#2A2F7F] josefin uppercase tracking-2x mb-4 text-center">
          Page not found
        </h1>
        <p className="text-sm text-gray-700 josefin text-center max-w-md mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-[#F45D01] text-white hover:bg-opacity-90 transition-all duration-300 text-xs tracking-2x uppercase josefin"
        >
          Back to home
        </Link>
      </main>
    </PageLayout>
  );
}
