/**
 * @param {{ title: string; children?: import('react').ReactNode }} props
 */
export function AdminPageHeader({ title, children }) {
  return (
    <div className="admin-toolbar">
      <h1 className="admin-page-title">{title}</h1>
      {children ? <div className="admin-toolbar-actions">{children}</div> : null}
    </div>
  );
}
