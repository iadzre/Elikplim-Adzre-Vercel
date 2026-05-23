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
      className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6 border-b border-[#2A2F7F]/10 bg-white/30"
      aria-label="Your downloaded resources"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-xs uppercase tracking-[0.25em] josefin text-[#2A2F7F] shrink-0">
          Your library ({items.length})
        </p>
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {items.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onOpen(r)}
                className="shrink-0 px-4 py-2 rounded-full text-xs josefin uppercase tracking-wider bg-[#2A2F7F]/8 text-[#2A2F7F] hover:bg-[#F45D01]/15 hover:text-[#c44a01] transition-colors"
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
