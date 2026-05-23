import { useEffect, useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { LazyImage } from '../components/shared/LazyImage';
import { ContentMessage } from '../components/shared/ContentMessage';
import { useHeaderBlur } from '../hooks/useHeaderBlur';
import { useHomeSlides } from '../hooks/useHomeSlides';

export function HomePage() {
  const headerRef = useHeaderBlur(true);
  const { slides, loading, error, usingFallback } = useHomeSlides();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    document.title = 'Elikplim Adzre - Home';
  }, []);

  useEffect(() => {
    setCurrentSlide(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const activeIndex = slides.length > 0 ? currentSlide % slides.length : 0;

  return (
    <PageLayout
      htmlClass="index-page-html"
      bodyClass="index-page bg-gradient-to-b from-[#f3fcf0] to-[#cddcc8] min-h-screen flex flex-col"
      headerVariant="index"
      headerRef={headerRef}
      pageShellClassName="w-full h-screen overflow-hidden page-shell"
    >
      <main className="w-full overflow-hidden flex flex-col">
        <section className="w-full flex flex-col overflow-x-hidden">
          <div className="w-full overflow-x-hidden" style={{ height: '100vh' }}>
            <div className="relative w-full h-full bg-white overflow-hidden transition-all duration-300">
              <div id="image-slider" className="relative w-full h-full">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#f3fcf0] z-20">
                    <ContentMessage message="Loading…" />
                  </div>
                )}
                {error && !loading && !usingFallback && slides.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#f3fcf0] z-20 px-6">
                    <ContentMessage message="Unable to load homepage slides. Add .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then run supabase/seed.sql." />
                  </div>
                )}
                {!loading &&
                  slides.length > 0 &&
                  slides.map((slide, index) => (
                    <LazyImage
                      key={slide.id}
                      src={slide.src}
                      alt={slide.alt}
                      eager={index === 0}
                      fetchPriority={index === 0 ? 'high' : undefined}
                      className="slider-image absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                      style={{ opacity: index === activeIndex ? 1 : 0 }}
                    />
                  ))}
                <div className="absolute inset-0 w-full h-full bg-black/60 z-10" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
