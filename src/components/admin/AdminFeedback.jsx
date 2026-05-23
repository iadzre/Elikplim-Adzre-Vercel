/**
 * @param {{ type: 'success' | 'error'; message: string } | null} props
 */
export function AdminFeedback({ feedback }) {
  if (!feedback?.message) return null;
  return (
    <div className={`admin-alert admin-alert-${feedback.type === 'success' ? 'success' : 'error'}`} role="status">
      {feedback.message}
    </div>
  );
}
