import { Link } from 'react-router-dom';

/**
 * @param {{ onExplore: () => void }} props
 */
export function ResourceClosingCta({ onExplore }) {
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 pb-20 md:pb-28" aria-labelledby="closing-cta-heading">
      <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: 'linear-gradient(135deg, #2A2F7F 0%, #1e2260 50%, #2A2F7F 100%)',
          }}
          aria-hidden
        />
        <div className="relative px-8 py-14 md:py-20 md:px-16 text-center md:text-left md:flex md:items-center md:justify-between gap-8">
          <div>
            <h2 id="closing-cta-heading" className="gazzetta-bold text-3xl md:text-4xl text-[#f3fcf0] leading-tight">
              Ready to level up your toolkit?
            </h2>
            <p className="text-sm text-[#f3fcf0]/75 mt-3 max-w-md">
              Explore the marketplace, download free essentials, or reach out for bespoke systems and collaboration.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-end shrink-0">
            <button
              type="button"
              onClick={onExplore}
              className="py-3.5 px-8 text-xs uppercase tracking-[0.2em] josefin rounded-full bg-[#F45D01] text-white hover:bg-[#d94f00] transition-colors"
            >
              Browse resources
            </button>
            <Link
              to="/leave-a-note"
              className="py-3.5 px-8 text-xs uppercase tracking-[0.2em] josefin rounded-full border border-[#f3fcf0]/40 text-[#f3fcf0] hover:border-[#F45D01] hover:text-[#F45D01] transition-colors text-center"
            >
              Start a project
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
