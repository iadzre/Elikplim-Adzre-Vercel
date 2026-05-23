import { RESOURCE_CLIENT_LOGOS, RESOURCE_TESTIMONIALS } from '../../data/resourcesMock';

export function ResourceTrustSection() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-24 border-t border-[#2A2F7F]/8" aria-labelledby="trust-heading">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.4em] text-[#F45D01] josefin">Trusted by creators</p>
        <h2 id="trust-heading" className="gazzetta-bold text-2xl md:text-4xl text-[#2A2F7F] mt-2 max-w-xl">
          Built by professionals, for teams who ship.
        </h2>

        <ul className="flex flex-wrap gap-6 md:gap-10 mt-10 opacity-70" aria-label="Clients and partners">
          {RESOURCE_CLIENT_LOGOS.map((name) => (
            <li key={name} className="gazzetta-bold text-lg md:text-xl text-[#2A2F7F]/50 tracking-wide">
              {name}
            </li>
          ))}
        </ul>

        <div className="grid md:grid-cols-3 gap-6 mt-14">
          {RESOURCE_TESTIMONIALS.map((t) => (
            <blockquote
              key={t.author}
              className="resources-card rounded-2xl p-6 md:p-8"
            >
              <p className="text-sm text-[#2A2F7F]/85 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-6">
                <cite className="not-italic gazzetta-bold text-[#2A2F7F]">{t.author}</cite>
                <p className="text-xs josefin uppercase tracking-widest text-[#2A2F7F]/50 mt-1">{t.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>

        <dl className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-[#2A2F7F]/10 text-center">
          <div>
            <dt className="sr-only">Years of client work</dt>
            <dd className="gazzetta-bold text-2xl md:text-3xl text-[#2A2F7F]">10+</dd>
            <dd className="text-[10px] uppercase tracking-widest josefin text-[#2A2F7F]/60 mt-1">Years craft</dd>
          </div>
          <div>
            <dt className="sr-only">Countries</dt>
            <dd className="gazzetta-bold text-2xl md:text-3xl text-[#2A2F7F]">24</dd>
            <dd className="text-[10px] uppercase tracking-widest josefin text-[#2A2F7F]/60 mt-1">Countries</dd>
          </div>
          <div>
            <dt className="sr-only">Satisfaction</dt>
            <dd className="gazzetta-bold text-2xl md:text-3xl text-[#F45D01]">98%</dd>
            <dd className="text-[10px] uppercase tracking-widest josefin text-[#2A2F7F]/60 mt-1">Would recommend</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
