/**
 * @param {{ message: string; className?: string }} props
 */
export function ContentMessage({ message, className = '' }) {
  return (
    <p
      className={`text-center text-sm text-gray-600 josefin uppercase tracking-2x px-4 py-6 ${className}`.trim()}
      role="status"
    >
      {message}
    </p>
  );
}
