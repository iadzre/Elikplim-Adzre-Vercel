import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { LazyImage } from '../components/shared/LazyImage';
import { ContentMessage } from '../components/shared/ContentMessage';
import { useHeaderBlur } from '../hooks/useHeaderBlur';
import { useHomeSlides } from '../hooks/useHomeSlides';
import { useHero } from '../hooks/useHero';
import { usePageTitle } from '../hooks/usePageTitle';

export function HomePage() {
  const headerRef = useHeaderBlur(true);
  const { slides, loading, error, usingFallback } = useHomeSlides();
  const { hero } = useHero();
  const [currentSlide, setCurrentSlide] = useState(0);

  usePageTitle();

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
  const overlayOpacity = hero?.overlayOpacity ?? 0.6;

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
                    <ContentMessage message="Unable to load homepage slides. Check Supabase configuration and run seed scripts." />
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
                <div
                  className="absolute inset-0 w-full h-full z-10"
                  style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
                />
                {hero?.headline && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center pointer-events-none">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl text-white gazzetta-bold uppercase tracking-wide mb-3 max-w-4xl">
                      {hero.headline}
                    </h1>
                    {hero.subheadline && (
                      <p className="text-sm sm:text-base text-gray-200 josefin tracking-2x uppercase max-w-2xl mb-6">
                        {hero.subheadline}
                      </p>
                    )}
                    {hero.ctaText && hero.ctaLink && (
                      <Link
                        to={hero.ctaLink}
                        className="pointer-events-auto inline-block px-6 py-3 bg-[#F45D01] text-white josefin uppercase tracking-2x text-xs hover:bg-[#2A2F7F] transition-colors duration-300"
                      >
                        {hero.ctaText}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
