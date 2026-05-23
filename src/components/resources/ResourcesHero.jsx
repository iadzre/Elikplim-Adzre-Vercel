import { Link } from 'react-router-dom';
import { RESOURCE_STATS } from '../../data/resourcesMock';

/**
 * @param {{ onExplore: () => void; onBrowseFree: () => void }} props
 */
export function ResourcesHero({ onExplore, onBrowseFree }) {
  return (
    <section
      className="relative w-full overflow-hidden px-4 sm:px-6 md:px-8 lg:px-12 pt-24 sm:pt-28 md:pt-32 pb-16 md:pb-24"
      aria-labelledby="resources-hero-heading"
    >
      <div
        className="resources-hero-orb pointer-events-none absolute -top-20 right-[-10%] w-[min(520px,70vw)] h-[min(520px,70vw)] rounded-full opacity-40"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(244,93,1,0.25), transparent 60%), radial-gradient(circle at 70% 70%, rgba(42,47,127,0.15), transparent 55%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-[-5%] w-[min(400px,55vw)] h-[min(400px,55vw)] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(205,220,200,0.8), transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.4em] text-[#F45D01] josefin resources-animate-in">
          Digital resources
        </p>
        <h1
          id="resources-hero-heading"
          className="gazzetta-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#2A2F7F] mt-4 leading-[0.95] resources-animate-in resources-animate-in-delay-1"
        >
          Production-ready tools for creators who ship.
        </h1>
        <p className="text-base md:text-lg text-[#2A2F7F]/80 max-w-2xl mt-6 leading-relaxed resources-animate-in resources-animate-in-delay-2">
          UI kits, motion packs, templates, and business systems — crafted with the same rigor as client work.
          Download free essentials or unlock premium drops built for studios, founders, and developers.
        </p>

        <div className="flex flex-wrap gap-3 mt-8 resources-animate-in resources-animate-in-delay-3">
          <button
            type="button"
            onClick={onExplore}
            className="resources-btn-accent py-3.5 px-8 text-xs uppercase tracking-[0.25em] josefin rounded-full"
          >
            Explore marketplace
          </button>
          <button
            type="button"
            onClick={onBrowseFree}
            className="resources-btn-ghost py-3.5 px-8 text-xs uppercase tracking-[0.25em] josefin rounded-full"
          >
            Browse free resources
          </button>
          <Link
            to="/leave-a-note"
            className="resources-btn-ghost py-3.5 px-8 text-xs uppercase tracking-[0.25em] josefin rounded-full inline-flex items-center"
          >
            Custom work
          </Link>
        </div>

        <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-14 md:mt-20 pt-10 border-t border-[#2A2F7F]/10">
          <div>
            <dt className="sr-only">Total resources</dt>
            <dd className="gazzetta-bold text-3xl md:text-4xl text-[#2A2F7F]">{RESOURCE_STATS.totalResources}+</dd>
            <dd className="text-xs uppercase tracking-[0.2em] text-[#2A2F7F]/60 josefin mt-1">Resources</dd>
          </div>
          <div>
            <dt className="sr-only">Downloads</dt>
            <dd className="gazzetta-bold text-3xl md:text-4xl text-[#2A2F7F]">{RESOURCE_STATS.totalDownloads}</dd>
            <dd className="text-xs uppercase tracking-[0.2em] text-[#2A2F7F]/60 josefin mt-1">Downloads</dd>
          </div>
          <div>
            <dt className="sr-only">Average rating</dt>
            <dd className="gazzetta-bold text-3xl md:text-4xl text-[#2A2F7F]">{RESOURCE_STATS.avgRating}</dd>
            <dd className="text-xs uppercase tracking-[0.2em] text-[#2A2F7F]/60 josefin mt-1">Avg. rating</dd>
          </div>
          <div>
            <dt className="sr-only">Free resources</dt>
            <dd className="gazzetta-bold text-3xl md:text-4xl text-[#F45D01]">{RESOURCE_STATS.freeCount}</dd>
            <dd className="text-xs uppercase tracking-[0.2em] text-[#2A2F7F]/60 josefin mt-1">Free drops</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
