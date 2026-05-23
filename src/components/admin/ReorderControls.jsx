/**
 * @param {{
 *   onMoveUp: () => void;
 *   onMoveDown: () => void;
 *   canMoveUp: boolean;
 *   canMoveDown: boolean;
 *   draggable?: boolean;
 *   onDragStart?: () => void;
 *   onDragOver?: (e: import('react').DragEvent) => void;
 *   onDrop?: () => void;
 * }} props
 */
export function ReorderControls({
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  return (
    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
      {draggable && (
        <span
          draggable
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          style={{ cursor: 'grab', padding: '0 0.25rem', color: 'var(--admin-muted)' }}
          title="Drag to reorder"
        >
          ⠿
        </span>
      )}
      <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" disabled={!canMoveUp} onClick={onMoveUp} aria-label="Move up">
        ↑
      </button>
      <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" disabled={!canMoveDown} onClick={onMoveDown} aria-label="Move down">
        ↓
      </button>
    </div>
  );
}

/** Swap display_order between two rows and persist. */
export async function swapOrder(supabase, table, a, b) {
  const aOrder = a.display_order ?? 0;
  const bOrder = b.display_order ?? 0;
  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from(table).update({ display_order: bOrder }).eq('id', a.id),
    supabase.from(table).update({ display_order: aOrder }).eq('id', b.id),
  ]);
  return e1 || e2;
}
