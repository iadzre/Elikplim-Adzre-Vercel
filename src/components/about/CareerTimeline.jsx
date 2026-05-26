import { useEffect, useRef, useCallback, useMemo } from 'react';
import { ContentMessage } from '../shared/ContentMessage';
import { useCareerTimeline } from '../../hooks/useCareerTimeline';
import {
  computeTimelineMinWidth,
  computeTimelineSvgLayout,
  TIMELINE_ITEM_WIDTH,
  TIMELINE_SVG_Y,
  timelinePointRadius,
  timelineTickStroke,
  timelineTickStrokeWidth,
} from '../../lib/careerTimelineLayout';

export function CareerTimeline() {
  const { entries, loading, error } = useCareerTimeline();
  const scrollRef = useRef(null);
  const leftBtnRef = useRef(null);
  const rightBtnRef = useRef(null);

  const updateScrollIndicators = useCallback(() => {
    const timelineScroll = scrollRef.current;
    const scrollLeftBtn = leftBtnRef.current;
    const scrollRightBtn = rightBtnRef.current;
    if (!timelineScroll || !scrollLeftBtn || !scrollRightBtn) return;

    const { scrollLeft, scrollWidth, clientWidth } = timelineScroll;
    const isAtStart = scrollLeft === 0;
    const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 1;

    if (isAtStart) {
      scrollLeftBtn.classList.add('opacity-0', 'pointer-events-none');
    } else {
      scrollLeftBtn.classList.remove('opacity-0', 'pointer-events-none');
    }

    if (isAtEnd) {
      scrollRightBtn.classList.add('opacity-0', 'pointer-events-none');
    } else {
      scrollRightBtn.classList.remove('opacity-0', 'pointer-events-none');
    }
  }, []);

  useEffect(() => {
    const timelineScroll = scrollRef.current;
    if (!timelineScroll) return;

    const getScrollAmount = () => {
      if (window.innerWidth < 640) return 200;
      if (window.innerWidth < 768) return 250;
      return 300;
    };

    const onScrollLeft = () => {
      timelineScroll.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    };
    const onScrollRight = () => {
      timelineScroll.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    };

    const leftBtn = leftBtnRef.current;
    const rightBtn = rightBtnRef.current;
    leftBtn?.addEventListener('click', onScrollLeft);
    rightBtn?.addEventListener('click', onScrollRight);
    timelineScroll.addEventListener('scroll', updateScrollIndicators);
    window.addEventListener('resize', updateScrollIndicators);
    updateScrollIndicators();

    return () => {
      leftBtn?.removeEventListener('click', onScrollLeft);
      rightBtn?.removeEventListener('click', onScrollRight);
      timelineScroll.removeEventListener('scroll', updateScrollIndicators);
      window.removeEventListener('resize', updateScrollIndicators);
    };
  }, [updateScrollIndicators, entries.length]);

  const timelineLayout = useMemo(
    () => computeTimelineSvgLayout(entries.length),
    [entries.length]
  );
  const timelineMinWidth = useMemo(
    () => computeTimelineMinWidth(entries.length),
    [entries.length]
  );

  if (!loading && !error && entries.length === 0) {
    return null;
  }

  return (
    <section className="flex items-center justify-center w-full py-8 sm:py-12 md:py-16">
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-12 max-w-7xl mx-auto">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#2A2F7F] mb-6 md:mb-8 text-center josefin">
          Career Timeline
        </p>
        {loading && <ContentMessage message="Loading timeline…" />}
        {error && !loading && (
          <ContentMessage message="Unable to load career timeline from Supabase." />
        )}
        {!loading && !error && (
        <div className="relative w-full overflow-hidden">
          <div className="timeline-fade-left" />
          <div className="timeline-fade-right" />
          <button
            ref={leftBtnRef}
            id="timeline-scroll-left"
            type="button"
            className="absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full transition-all duration-300 opacity-0 pointer-events-none shadow-md"
          >
            <svg className="w-4 h-4 sm:w-3 sm:h-3 text-[#F45D01]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            ref={rightBtnRef}
            id="timeline-scroll-right"
            type="button"
            className="absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full transition-all duration-300 shadow-md"
          >
            <svg className="w-4 h-4 sm:w-3 sm:h-3 text-[#F45D01]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div
            ref={scrollRef}
            id="timeline-scroll"
            className="timeline-scroll relative h-56 sm:h-64 md:h-72 overflow-x-auto overflow-y-hidden scroll-smooth w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div
              className="relative timeline-container h-full"
              style={{ minWidth: `${timelineMinWidth}px` }}
            >
              <svg
                className="absolute top-1/2 left-0 w-full h-full transform -translate-y-1/2 timeline-svg"
                viewBox={`0 0 ${timelineLayout.viewBoxWidth} ${timelineLayout.viewBoxHeight}`}
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d={`M ${timelineLayout.linePathStart} ${TIMELINE_SVG_Y} L ${timelineLayout.linePathEnd} ${TIMELINE_SVG_Y}`}
                  stroke="#d1d5db"
                  strokeWidth="1.5"
                  fill="none"
                  vectorEffect="nonScalingStroke"
                />
                {timelineLayout.tickXs.map((x, i) => (
                  <g key={`tick-${i}-${x}`}>
                    <line
                      x1={x}
                      y1={TIMELINE_SVG_Y - 10}
                      x2={x}
                      y2={TIMELINE_SVG_Y + 10}
                      stroke={timelineTickStroke(i, entries.length)}
                      strokeWidth={timelineTickStrokeWidth(i, entries.length)}
                      vectorEffect="nonScalingStroke"
                    />
                    <circle
                      cx={x}
                      cy={TIMELINE_SVG_Y}
                      r={timelinePointRadius(i, entries.length)}
                      fill="#ffffff"
                      stroke={timelineTickStroke(i, entries.length)}
                      strokeWidth={timelineTickStrokeWidth(i, entries.length)}
                      vectorEffect="nonScalingStroke"
                    />
                  </g>
                ))}
              </svg>
              {entries.map((item) => (
                <div
                  key={item.id}
                  className={`absolute timeline-item timeline-${item.position}`}
                  style={{
                    left: item.left,
                    top: item.position === 'top' ? 0 : undefined,
                    bottom: item.position === 'bottom' ? 0 : undefined,
                    width: `${TIMELINE_ITEM_WIDTH}%`,
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`text-center max-w-[120px] sm:max-w-[140px] ${item.position === 'top' ? 'pb-0' : 'pt-0'}`}
                    >
                      <div className="text-[7px] sm:text-[9px] uppercase tracking-[0.4em] text-[#F45D01] mb-0.5">
                        {item.period}
                      </div>
                      <h3 className="font-semibold text-[#2A2F7F] josefin-extra-bold text-[10px] sm:text-xs mb-0 uppercase tracking-[0.2em]">
                        {item.title}
                      </h3>
                      <p className="text-gray-700 text-[9px] sm:text-xs leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
