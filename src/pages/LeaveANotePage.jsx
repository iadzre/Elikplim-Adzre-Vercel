import { usePageTitle } from '../hooks/usePageTitle';
import { PageLayout } from '../components/layout/PageLayout';
import { Footer } from '../components/layout/Footer';
import { ContactForm } from '../components/contact/ContactForm';
import { useHeaderBlur } from '../hooks/useHeaderBlur';

export function LeaveANotePage() {
  const headerRef = useHeaderBlur(true);

  usePageTitle('Leave a Note');

  return (
    <PageLayout
      htmlClass="leave-a-note-page-html"
      bodyClass="leave-a-note-page bg-gradient-to-b from-[#f3fcf0] to-[#f5f1ca] min-h-screen flex flex-col"
      headerRef={headerRef}
      pageShellClassName="w-full page-shell flex-1 flex flex-col overflow-hidden"
      pageShellStyle={{ minHeight: 0 }}
      showFooter
      footer={<Footer />}
    >
      <main className="w-full flex flex-col bg-gradient-to-b from-[#f3fcf0] to-[#f5f1ca] flex-1">
        <section className="w-full flex flex-col flex-1">
          <div className="px-4 sm:px-6 md:px-12 flex items-center justify-center py-4 sm:py-6 md:py-8 pt-24 sm:pt-28 md:pt-32 w-full flex-1">
            <div className="w-full max-w-md mx-auto">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
