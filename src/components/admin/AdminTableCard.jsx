/**
 * @param {{ children: import('react').ReactNode; className?: string }} props
 */
export function AdminTableCard({ children, className = '' }) {
  return (
    <div className={`admin-card admin-card-flush ${className}`.trim()}>
      <div className="admin-table-wrap">{children}</div>
    </div>
  );
}
