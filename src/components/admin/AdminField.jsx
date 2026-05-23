/**
 * @param {{ label: string; children: import('react').ReactNode; hint?: string }} props
 */
export function AdminField({ label, children, hint }) {
  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      {children}
      {hint && <p className="admin-field-hint">{hint}</p>}
    </div>
  );
}
