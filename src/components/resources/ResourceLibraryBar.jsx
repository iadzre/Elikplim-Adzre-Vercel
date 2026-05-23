/**
 * @param {{
 *   items: import('../../data/resourcesMock').RESOURCES;
 *   onOpen: (r: import('../../data/resourcesMock').RESOURCES[0]) => void;
 * }} props
 */
export function ResourceLibraryBar({ items, onOpen }) {
  if (!items.length) return null;

  return (
    <aside
      className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-3 border-b border-[#2A2F7F]/8"
      aria-label="Your downloads"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2">
        <p className="text-[10px] uppercase tracking-[0.25em] josefin text-[#2A2F7F]/60 shrink-0">
          Library ({items.length})
        </p>
        <ul className="flex gap-3 overflow-x-auto pb-1 text-xs text-[#2A2F7F]">
          {items.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onOpen(r)}
                className="whitespace-nowrap hover:text-[#F45D01] transition-colors"
              >
                {r.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
