import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { LazyImage } from '../components/shared/LazyImage';
import { ContentMessage } from '../components/shared/ContentMessage';
import { useHeaderBlur } from '../hooks/useHeaderBlur';
import { useHomeSlides } from '../hooks/useHomeSlides';
import { usePageTitle } from '../hooks/usePageTitle';
import { parseHeroDisplay, splitHeadlineLines } from '../lib/parseHeroDisplay';

export function HomePage() {
  const headerRef = useHeaderBlur(true);
  const { slides, hero, loading, error, usingFallback } = useHomeSlides();
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
  const nextIndex = slides.length > 1 ? (activeIndex + 1) % slides.length : activeIndex;
  const overlayOpacity = hero?.overlayOpacity ?? 0.6;
  const heroDisplay = useMemo(() => parseHeroDisplay(hero), [hero]);
  const headlineLines = useMemo(
    () => (heroDisplay ? splitHeadlineLines(heroDisplay.headline) : []),
    [heroDisplay]
  );

  const visibleSlideIndices = useMemo(() => new Set([activeIndex, nextIndex]), [activeIndex, nextIndex]);

  const showEmptyState = loading && slides.length === 0;
  const showErrorState = error && !usingFallback && slides.length === 0;

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
              <div id="image-slider" className="hero">
                {showEmptyState && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#f3fcf0] z-20">
                    <ContentMessage message="Loading…" />
                  </div>
                )}
                {showErrorState && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#f3fcf0] z-20 px-6">
                    <ContentMessage message="Unable to load homepage slides. Check Supabase configuration and run seed scripts." />
                  </div>
                )}
                {slides.length > 0 &&
                  slides.map((slide, index) =>
                    visibleSlideIndices.has(index) ? (
                      <LazyImage
                        key={slide.id}
                        src={slide.src}
                        alt={slide.alt}
                        eager={index === activeIndex}
                        fetchPriority={index === activeIndex ? 'high' : undefined}
                        className="slider-image absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                        style={{ opacity: index === activeIndex ? 1 : 0 }}
                      />
                    ) : null
                  )}

                <div
                  className="hero__overlay"
                  style={{ opacity: overlayOpacity }}
                  aria-hidden="true"
                />

                {heroDisplay && (
                  <div
                    className={`hero__content${heroDisplay.showEyebrow ? '' : ' hero__content--no-eyebrow'}`}
                  >
                    {heroDisplay.showEyebrow && (
                      <p className="hero__eyebrow josefin tracking-2x uppercase text-[10px] sm:text-xs">
                        <span className="hero__eyebrow--strong">{heroDisplay.eyebrowStrong}</span>
                        <span className="hero__eyebrow-sep" aria-hidden="true" />
                        <span className="hero__eyebrow--soft">{heroDisplay.eyebrowSoft}</span>
                      </p>
                    )}

                    <div
                      className={`hero__divider${heroDisplay.showEyebrow ? ' hero__divider--after-eyebrow' : ' hero__divider--solo'}`}
                      aria-hidden="true"
                    />

                    <h1 className="hero__headline">
                      {headlineLines.map((line, index) => (
                        <span key={line} className="hero__headline-line">
                          {line}
                          {index < headlineLines.length - 1 ? <br /> : null}
                        </span>
                      ))}
                    </h1>

                    {heroDisplay.descriptor && (
                      <p className="hero__descriptor josefin tracking-2x uppercase text-xs sm:text-sm text-gray-200 max-w-2xl">
                        {heroDisplay.descriptor}
                      </p>
                    )}

                    {heroDisplay.ctaText && heroDisplay.ctaLink && (
                      <Link
                        to={heroDisplay.ctaLink}
                        className="hero__cta josefin tracking-2x uppercase text-[10px] sm:text-xs"
                      >
                        {heroDisplay.ctaText}
                        <span className="hero__cta-arrow" aria-hidden="true">
                          →
                        </span>
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
