/**
 * @param {{ label: string; children: import('react').ReactNode; hint?: string }} props
 */
export function AdminField({ label, children, hint }) {
  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      {children}
      {hint && <p style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: '0.25rem' }}>{hint}</p>}
    </div>
  );
}
