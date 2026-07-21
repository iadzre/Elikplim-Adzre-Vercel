import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Split a testimonial quote into paragraphs on blank lines (or single line breaks),
 * trimming surrounding whitespace and dropping empty segments.
 * @param {string} [quote]
 * @returns {string[]}
 */
function splitQuoteIntoParagraphs(quote) {
  if (!quote) return [];
  const paragraphs = quote
    .split(/\n{2,}|\r\n{2,}|\n|\r/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return paragraphs.length > 0 ? paragraphs : [quote.trim()];
}

/**
 * @param {{ testimonials: Array<{ id: string; quote: string; author: string; role: string }>; loading?: boolean }} props
 */
export function ClientCommentsCarousel({ testimonials, loading = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  const showComment = useCallback(
    (index) => {
      if (testimonials.length === 0) return;
      const safeIndex = index % testimonials.length;
      setCurrentIndex(safeIndex);
    },
    [testimonials.length]
  );

  const startAutoRotate = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
  }, [testimonials.length]);

  useEffect(() => {
    if (testimonials.length === 0) return;
    showComment(0);
    startAutoRotate();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [testimonials.length, showComment, startAutoRotate]);

  if (loading && testimonials.length === 0) {
    return (
      <section className="client-comments-section w-full px-4 md:px-8 py-4 mt-4 flex-shrink-0">
        <p className="text-center text-sm text-gray-500 josefin uppercase tracking-2x">Loading testimonials…</p>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  const handleMouseEnter = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleMouseLeave = () => {
    startAutoRotate();
  };

  return (
    <section
      className="client-comments-section w-full px-4 md:px-8 py-4 mt-4 flex-shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-5xl mx-auto relative">
        <div className="mb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#F45D01]">Client Testimonials</p>
        </div>
        <div className="client-comments-container overflow-hidden">
          <div
            className="client-comments-wrapper flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((item) => {
              const paragraphs = splitQuoteIntoParagraphs(item.quote);
              return (
              <div key={item.id} className="client-comment-card min-w-full flex-shrink-0 px-4">
                <div className="text-center">
                  <div className="mb-6 max-w-4xl mx-auto space-y-4">
                    {paragraphs.map((paragraph, paragraphIndex) => (
                      <p
                        key={paragraphIndex}
                        className="text-gray-700 text-sm md:text-base leading-relaxed"
                      >
                        {paragraphs.length === 1
                          ? `\u201C${paragraph}\u201D`
                          : paragraphIndex === 0
                            ? `\u201C${paragraph}`
                            : paragraphIndex === paragraphs.length - 1
                              ? `${paragraph}\u201D`
                              : paragraph}
                      </p>
                    ))}
                  </div>
                  <div className="flex flex-col items-center">
                    <h4 className="font-semibold text-[#F45D01] text-sm mb-1 uppercase tracking-[0.2em]">
                      {item.author}
                    </h4>
                    <p className="text-[10px] text-[#2A2F7F] uppercase tracking-[0.4em]">{item.role}</p>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-center items-center space-x-2 sm:space-x-2.5 md:space-x-3 mt-4 sm:mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`comment-indicator rounded-full transition-all duration-300 hover:scale-110 ${
                index === currentIndex
                  ? 'w-8 h-2 bg-[#F45D01]'
                  : 'w-2.5 h-2.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
              data-index={index}
              onClick={() => {
                showComment(index);
                startAutoRotate();
              }}
              aria-label={`Show testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
