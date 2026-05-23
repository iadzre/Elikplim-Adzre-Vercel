import { mediaUrl } from '../../lib/mediaUrl';

/**
 * @param {import('react').ImgHTMLAttributes<HTMLImageElement> & { eager?: boolean }} props
 */
export function LazyImage({ eager = false, loading, decoding, src, ...props }) {
  return (
    <img
      {...props}
      src={mediaUrl(src)}
      loading={loading ?? (eager ? 'eager' : 'lazy')}
      decoding={decoding ?? 'async'}
    />
  );
}
