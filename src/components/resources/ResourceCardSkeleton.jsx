export function ResourceCardSkeleton() {
  return (
    <div className="resources-card rounded-2xl overflow-hidden flex flex-col h-full" aria-hidden>
      <div className="resources-skeleton aspect-[4/3] w-full" />
      <div className="p-5 space-y-3">
        <div className="resources-skeleton h-3 w-1/3 rounded" />
        <div className="resources-skeleton h-6 w-4/5 rounded" />
        <div className="resources-skeleton h-4 w-full rounded" />
        <div className="resources-skeleton h-4 w-2/3 rounded" />
        <div className="resources-skeleton h-10 w-full rounded-full mt-4" />
      </div>
    </div>
  );
}
