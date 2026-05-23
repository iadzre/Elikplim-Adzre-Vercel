import { ResourceCard } from './ResourceCard';

/**
 * @param {{
 *   items: import('../../data/resourcesMock').RESOURCES;
 *   onSelect: (r: import('../../data/resourcesMock').RESOURCES[0]) => void;
 * }} props
 */
export function ResourceFeaturedRow({ items, onSelect }) {
  if (!items.length) return null;

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 bg-[#cddcc8]/25" aria-labelledby="featured-resources-heading">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.4em] text-[#F45D01] josefin">Curated</p>
        <h2 id="featured-resources-heading" className="gazzetta-bold text-2xl md:text-4xl text-[#2A2F7F] mt-2">
          Featured resources
        </h2>
        <p className="text-sm text-[#2A2F7F]/70 mt-2 max-w-lg">
          Hand-picked drops with the highest production value — updated as new work ships.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">
          {items.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </section>
  );
}
