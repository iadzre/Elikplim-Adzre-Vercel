/**
 * @param {import('react').ImgHTMLAttributes<HTMLImageElement> & { eager?: boolean }} props
 */
export function LazyImage({ eager = false, loading, decoding, ...props }) {
  return (
    <img
      {...props}
      loading={loading ?? (eager ? 'eager' : 'lazy')}
      decoding={decoding ?? 'async'}
    />
  );
}
