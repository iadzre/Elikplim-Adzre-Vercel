import { useState } from 'react';
import { mediaUrl } from '../../lib/mediaUrl';

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="#e8ebe6" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="14">Image unavailable</text></svg>'
  );

/**
 * @param {import('react').ImgHTMLAttributes<HTMLImageElement> & {
 *   eager?: boolean;
 *   fetchPriority?: 'high' | 'low' | 'auto';
 * }} props
 */
export function LazyImage({
  eager = false,
  loading,
  decoding,
  fetchPriority,
  src,
  onError,
  ...props
}) {
  const [failed, setFailed] = useState(false);
  const resolved = failed || !src ? PLACEHOLDER : mediaUrl(src);

  return (
    <img
      {...props}
      src={resolved}
      loading={loading ?? (eager ? 'eager' : 'lazy')}
      decoding={decoding ?? 'async'}
      fetchPriority={fetchPriority}
      onError={(e) => {
        if (!failed) setFailed(true);
        onError?.(e);
      }}
    />
  );
}
