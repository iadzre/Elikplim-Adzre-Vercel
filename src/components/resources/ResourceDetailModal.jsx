import { useEffect, useRef, useState } from 'react';
import { LazyImage } from '../shared/LazyImage';
import { RESOURCE_CATEGORIES } from '../../data/resourcesMock';

/**
 * @param {{
 *   resource: import('../../data/resourcesMock').RESOURCES[0] | null;
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onPurchased: (resourceId: string) => void;
 *   inLibrary: boolean;
 * }} props
 */
export function ResourceDetailModal({ resource, isOpen, onClose, onPurchased, inLibrary }) {
  const closeRef = useRef(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [step, setStep] = useState(/** @type {'detail' | 'checkout' | 'success'} */ ('detail'));

  useEffect(() => {
    if (!isOpen) return;
    setPreviewIndex(0);
    setStep('detail');
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

  const categoryLabel =
    RESOURCE_CATEGORIES.find((c) => c.id === resource.categoryId)?.label ?? resource.categoryId;
  const priceLabel = resource.isFree ? 'Free' : `$${resource.price}`;

  const handlePrimary = () => {
    if (resource.isFree) {
      onPurchased(resource.id);
      setStep('success');
      return;
    }
    setStep('checkout');
  };

  const handleConfirmPurchase = () => {
    onPurchased(resource.id);
    setStep('success');
  };

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
            aria-label="Close"
          >
            Close
          </button>
        </div>

        {step === 'detail' && (
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
                <div className="flex gap-2 mt-2">
                  {resource.previews.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setPreviewIndex(i)}
                      className={`w-14 h-14 rounded overflow-hidden border ${
                        previewIndex === i ? 'border-[#F45D01]' : 'border-[#2A2F7F]/15 opacity-70'
                      }`}
                      aria-label={`Preview ${i + 1}`}
                    >
                      <LazyImage src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-sm text-[#2A2F7F]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#F45D01] josefin">{categoryLabel}</p>
              <h2 id="resource-detail-title" className="text-lg font-medium mt-2">
                {resource.title}
              </h2>
              <p className="mt-3 text-[#2A2F7F]/75 leading-relaxed">{resource.longDescription}</p>

              <p className="mt-4 text-xs text-[#2A2F7F]/55">
                {resource.rating} rating · {resource.downloadCount.toLocaleString()} downloads ·{' '}
                <span className="text-[#2A2F7F]">{priceLabel}</span>
              </p>

              <h3 className="text-[10px] uppercase tracking-[0.2em] josefin mt-6 mb-2 text-[#2A2F7F]/60">
                Includes
              </h3>
              <ul className="text-xs text-[#2A2F7F]/75 space-y-1 list-disc pl-4">
                {resource.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>

              <p className="mt-4 text-xs text-[#2A2F7F]/55">
                {resource.formats.join(', ')} · {resource.license}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handlePrimary}
                  className="text-xs josefin uppercase tracking-[0.2em] text-[#2A2F7F] hover:text-[#F45D01] transition-colors"
                >
                  {resource.isFree ? 'Download free →' : `Purchase ${priceLabel} →`}
                </button>
                {inLibrary && (
                  <span className="text-xs text-[#2A2F7F]/50">In your library</span>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'checkout' && (
          <div className="px-5 pb-10 max-w-sm mx-auto text-sm text-[#2A2F7F] -mt-2">
            <h2 className="font-medium">Checkout</h2>
            <p className="text-xs text-[#2A2F7F]/60 mt-1">Demo flow — connect Stripe when ready.</p>
            <p className="mt-4 font-medium">{resource.title}</p>
            <p className="text-[#F45D01] mt-1">${resource.price}</p>
            <button
              type="button"
              onClick={handleConfirmPurchase}
              className="mt-6 text-xs josefin uppercase tracking-[0.2em] hover:text-[#F45D01]"
            >
              Complete purchase (demo) →
            </button>
            <button
              type="button"
              onClick={() => setStep('detail')}
              className="block mt-4 text-xs text-[#2A2F7F]/50 hover:text-[#2A2F7F]"
            >
              Back
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="px-5 pb-12 max-w-sm mx-auto text-center text-sm text-[#2A2F7F] -mt-2">
            <p className="font-medium">Ready to download</p>
            <p className="text-xs text-[#2A2F7F]/60 mt-2">{resource.title} added to your library.</p>
            <button
              type="button"
              className="mt-6 text-xs josefin uppercase tracking-[0.2em] hover:text-[#F45D01]"
              onClick={onClose}
            >
              Continue browsing →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
