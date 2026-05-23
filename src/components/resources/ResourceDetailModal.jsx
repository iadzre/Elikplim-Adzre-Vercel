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
      className={`resources-modal fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-8 bg-[#2A2F7F]/40 backdrop-blur-sm ${
        isOpen ? 'is-open' : ''
      }`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-detail-title"
      aria-hidden={!isOpen}
    >
      <div className="resources-modal-panel w-full max-w-5xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-gradient-to-b from-[#f3fcf0] to-[#f5f1ca] shadow-2xl border border-[#2A2F7F]/10">
        <div className="sticky top-0 z-10 flex justify-end p-4 bg-gradient-to-b from-[#f3fcf0] to-transparent">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="p-2 text-[#2A2F7F] hover:text-[#F45D01] transition-colors rounded-full"
            aria-label="Close resource details"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'detail' && (
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 px-5 pb-8 md:px-8 md:pb-10 -mt-8">
            <div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#cddcc8]/40 relative">
                <LazyImage
                  src={resource.previews[previewIndex] ?? resource.thumbnail}
                  alt={`Preview of ${resource.title}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {resource.previews.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {resource.previews.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setPreviewIndex(i)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        previewIndex === i ? 'border-[#F45D01]' : 'border-transparent opacity-70'
                      }`}
                      aria-label={`Preview image ${i + 1}`}
                    >
                      <LazyImage src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {resource.videoPreview && (
                <p className="text-xs josefin uppercase tracking-widest text-[#2A2F7F]/50 mt-3">
                  Video preview available in full release
                </p>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#F45D01] josefin">{categoryLabel}</p>
              <h2 id="resource-detail-title" className="gazzetta-bold text-2xl md:text-3xl text-[#2A2F7F] mt-2">
                {resource.title}
              </h2>
              <p className="text-sm text-[#2A2F7F]/80 mt-3 leading-relaxed">{resource.longDescription}</p>

              <div className="flex flex-wrap gap-4 mt-4 text-xs josefin text-[#2A2F7F]/70">
                <span>★ {resource.rating}</span>
                <span>{resource.downloadCount.toLocaleString()} downloads</span>
                <span className="gazzetta-bold text-[#F45D01] text-base">{priceLabel}</span>
              </div>

              <h3 className="text-xs uppercase tracking-[0.2em] text-[#2A2F7F] josefin mt-8 mb-2">Features</h3>
              <ul className="text-sm text-[#2A2F7F]/80 space-y-1.5 list-disc pl-5">
                {resource.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>

              <h3 className="text-xs uppercase tracking-[0.2em] text-[#2A2F7F] josefin mt-6 mb-2">What&apos;s included</h3>
              <ul className="text-sm text-[#2A2F7F]/80 flex flex-wrap gap-2">
                {resource.includes.map((item) => (
                  <li
                    key={item}
                    className="px-2.5 py-1 rounded-full bg-white/60 border border-[#2A2F7F]/10 text-xs josefin"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-widest josefin text-[#2A2F7F]/60">Formats</dt>
                  <dd className="text-[#2A2F7F] mt-1">{resource.formats.join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-widest josefin text-[#2A2F7F]/60">Compatibility</dt>
                  <dd className="text-[#2A2F7F] mt-1">{resource.compatibility.join(' · ')}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-widest josefin text-[#2A2F7F]/60">License</dt>
                  <dd className="text-[#2A2F7F]/80 mt-1">{resource.license}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-3 mt-8">
                <button
                  type="button"
                  onClick={handlePrimary}
                  className="resources-btn-accent py-3 px-8 text-xs uppercase tracking-[0.2em] josefin rounded-full"
                >
                  {resource.isFree ? 'Download free' : `Purchase — ${priceLabel}`}
                </button>
                {inLibrary && (
                  <span className="inline-flex items-center text-xs josefin uppercase tracking-widest text-[#2A2F7F]/70">
                    ✓ In your library
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'checkout' && (
          <div className="px-5 pb-10 md:px-8 max-w-lg mx-auto text-center -mt-4">
            <h2 className="gazzetta-bold text-2xl text-[#2A2F7F]">Secure checkout</h2>
            <p className="text-sm text-[#2A2F7F]/70 mt-2">
              Mock purchase flow — connect Stripe or Gumroad when ready.
            </p>
            <div className="mt-8 p-6 rounded-xl bg-white/60 border border-[#2A2F7F]/10 text-left">
              <p className="gazzetta-bold text-[#2A2F7F]">{resource.title}</p>
              <p className="text-2xl text-[#F45D01] gazzetta-bold mt-2">${resource.price}</p>
              <p className="text-xs text-[#2A2F7F]/60 mt-4 josefin uppercase tracking-widest">
                One-time payment · Instant download
              </p>
            </div>
            <button
              type="button"
              onClick={handleConfirmPurchase}
              className="resources-btn-primary w-full mt-6 py-3.5 text-xs uppercase tracking-[0.2em] josefin rounded-full"
            >
              Complete purchase (demo)
            </button>
            <button
              type="button"
              onClick={() => setStep('detail')}
              className="mt-4 text-xs josefin uppercase tracking-widest text-[#2A2F7F]/60 hover:text-[#F45D01]"
            >
              Back to details
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="px-5 pb-12 md:px-8 max-w-lg mx-auto text-center -mt-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#cddcc8] flex items-center justify-center text-2xl text-[#2A2F7F]" aria-hidden>
              ✓
            </div>
            <h2 className="gazzetta-bold text-2xl text-[#2A2F7F] mt-4">Ready to download</h2>
            <p className="text-sm text-[#2A2F7F]/70 mt-2">
              {resource.title} has been added to your library. In production, a signed download link would appear here.
            </p>
            <button
              type="button"
              className="resources-btn-accent mt-8 py-3.5 px-10 text-xs uppercase tracking-[0.2em] josefin rounded-full"
              onClick={() => {
                /* mock download */
              }}
            >
              Download files (demo)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="block w-full mt-4 text-xs josefin uppercase tracking-widest text-[#2A2F7F]/60 hover:text-[#F45D01]"
            >
              Continue browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
