export function ResourceCardSkeleton() {
  return (
    <div className="resources-card rounded-lg overflow-hidden" aria-hidden>
      <div className="resources-skeleton aspect-[4/3] w-full" />
      <div className="p-4 space-y-2 border-t border-[#2A2F7F]/8">
        <div className="resources-skeleton h-4 w-3/4 rounded" />
        <div className="resources-skeleton h-3 w-full rounded" />
        <div className="resources-skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
