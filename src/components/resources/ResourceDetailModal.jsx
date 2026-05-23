import { useEffect, useRef, useState } from 'react';
import { LazyImage } from '../shared/LazyImage';
import { downloadResourceFile } from '../../lib/services/resourcesService';
import { ALL_DOWNLOADS_FREE } from '../../lib/resources/marketplaceConfig';

/**
 * @param {{
 *   resource: import('../../lib/resources/mapResource').mapDbResourceToCatalog extends (r: infer R) => unknown ? ReturnType<typeof import('../../lib/resources/mapResource').mapDbResourceToCatalog> : never | null;
 *   isOpen: boolean;
 *   onClose: () => void;
 *   hasAccess: boolean;
 *   onAccessGranted: () => void;
 *   reviews?: Array<{ rating: number; review_text?: string; profiles?: { full_name?: string } }>;
 * }} props
 */
export function ResourceDetailModal({
  resource,
  isOpen,
  onClose,
  hasAccess,
  onAccessGranted,
  reviews = [],
}) {
  const closeRef = useRef(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(/** @type {{ type: 'error'|'success'; text: string } | null} */ (null));

  useEffect(() => {
    if (!isOpen) return;
    setPreviewIndex(0);
    setMessage(null);
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, resource?.id, onClose]);

  if (!resource) return null;

  const priceLabel = ALL_DOWNLOADS_FREE || resource.isFree ? 'Free' : `$${resource.price}`;
  const canDownload = ALL_DOWNLOADS_FREE || hasAccess || resource.isFree;

  async function handleDownload() {
    setBusy(true);
    setMessage(null);
    const { data, error } = await downloadResourceFile(resource.id);
    setBusy(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      setMessage({ type: 'success', text: 'Download started.' });
      onAccessGranted();
    }
  }

  return (
    <div
      className={`resources-modal fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#2A2F7F]/30 ${
        isOpen ? 'is-open' : ''
      }`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-detail-title"
      aria-hidden={!isOpen}
    >
      <div className="resources-modal-panel resources-page w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-t-lg sm:rounded-lg bg-[#f5f1ca] border border-[#2A2F7F]/10">
        <div className="flex justify-end p-3">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="p-2 text-[#2A2F7F]/60 hover:text-[#F45D01] text-sm josefin uppercase tracking-widest"
          >
            Close
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 px-5 pb-8 md:px-6 -mt-2">
          <div>
            <div className="aspect-[4/3] rounded overflow-hidden bg-[#cddcc8]/30">
              <LazyImage
                src={resource.previews[previewIndex] ?? resource.thumbnail}
                alt={`Preview of ${resource.title}`}
                className="w-full h-full object-cover"
              />
            </div>
            {resource.previews.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {resource.previews.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setPreviewIndex(i)}
                    className={`shrink-0 w-14 h-14 rounded overflow-hidden border ${
                      previewIndex === i ? 'border-[#F45D01]' : 'border-[#2A2F7F]/15'
                    }`}
                  >
                    <LazyImage src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-sm text-[#2A2F7F]">
            <h2 id="resource-detail-title" className="text-lg font-medium">
              {resource.title}
            </h2>
            <p className="mt-3 text-[#2A2F7F]/75 leading-relaxed">{resource.longDescription}</p>
            <p className="mt-4 text-xs text-[#2A2F7F]/55">
              {resource.rating} rating · {resource.downloadCount.toLocaleString()} downloads · {priceLabel}
            </p>

            {message && (
              <p
                className={`mt-3 text-xs ${message.type === 'error' ? 'text-red-700' : 'text-[#2A2F7F]'}`}
                role="status"
              >
                {message.text}
              </p>
            )}

            {canDownload && (
              <div className="mt-6">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleDownload}
                  className="text-xs josefin uppercase tracking-[0.2em] hover:text-[#F45D01] disabled:opacity-50"
                >
                  Download →
                </button>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#2A2F7F]/10">
                <h3 className="text-[10px] uppercase tracking-widest josefin text-[#2A2F7F]/60 mb-2">Reviews</h3>
                <ul className="space-y-2 text-xs text-[#2A2F7F]/75">
                  {reviews.slice(0, 3).map((r) => (
                    <li key={`${r.rating}-${r.review_text}`}>
                      {r.rating}★ — {r.review_text || 'No comment'}{' '}
                      {r.profiles?.full_name && `· ${r.profiles.full_name}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
